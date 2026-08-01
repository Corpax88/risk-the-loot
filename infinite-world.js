(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.RiskInfiniteWorld=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const DEFAULTS={preloadRadius:1,retainRadius:1,corridorWidth:74};

  function hashParts(){
    let hash=2166136261;
    for(let partIndex=0;partIndex<arguments.length;partIndex++){
      const text=String(arguments[partIndex]);
      for(let index=0;index<text.length;index++){
        hash^=text.charCodeAt(index);
        hash=Math.imul(hash,16777619)
      }
      hash^=124;
      hash=Math.imul(hash,16777619)
    }
    return (hash>>>0)||1
  }

  function unit(seed){
    let value=seed>>>0;
    value^=value>>>16;
    value=Math.imul(value,0x7feb352d);
    value^=value>>>15;
    value=Math.imul(value,0x846ca68b);
    value^=value>>>16;
    return (value>>>0)/4294967296
  }

  function regionKey(x,y){return x+','+y}
  function regionCoordinates(x,y,width,height){return{x:Math.floor(x/width),y:Math.floor(y/height)}}
  function regionOrigin(x,y,width,height){return{x:x*width,y:y*height}}

  function verticalGate(worldSeed,boundaryX,regionY,height){
    const band=hashParts(worldSeed,'vertical',boundaryX,regionY)%3;
    const jitter=(unit(hashParts(worldSeed,'vertical-jitter',boundaryX,regionY))-.5)*.13;
    return Math.max(110,Math.min(height-110,height*((band+.5)/3+jitter)))
  }

  function horizontalGate(worldSeed,regionX,boundaryY,width){
    const band=hashParts(worldSeed,'horizontal',regionX,boundaryY)%5;
    const jitter=(unit(hashParts(worldSeed,'horizontal-jitter',regionX,boundaryY))-.5)*.1;
    return Math.max(120,Math.min(width-120,width*((band+.5)/5+jitter)))
  }

  function localPortals(worldSeed,regionX,regionY,width,height){
    return{
      west:{x:0,y:verticalGate(worldSeed,regionX,regionY,height),edge:'west'},
      east:{x:width,y:verticalGate(worldSeed,regionX+1,regionY,height),edge:'east'},
      north:{x:horizontalGate(worldSeed,regionX,regionY,width),y:0,edge:'north'},
      south:{x:horizontalGate(worldSeed,regionX,regionY+1,width),y:height,edge:'south'}
    }
  }

  function distanceToSegment(px,py,ax,ay,bx,by){
    const dx=bx-ax,dy=by-ay,length=dx*dx+dy*dy;
    if(!length)return Math.hypot(px-ax,py-ay);
    const amount=Math.max(0,Math.min(1,((px-ax)*dx+(py-ay)*dy)/length));
    return Math.hypot(px-(ax+dx*amount),py-(ay+dy*amount))
  }

  function makeRoads(portals,width,height,seed){
    const center={
      x:width*(.46+unit(hashParts(seed,'center-x'))*.08),
      y:height*(.43+unit(hashParts(seed,'center-y'))*.14)
    };
    const inset=Math.min(210,Math.min(width,height)*.13);
    const roads=[
      [portals.west,{x:inset,y:portals.west.y},center],
      [portals.east,{x:width-inset,y:portals.east.y},center],
      [portals.north,{x:portals.north.x,y:inset},center],
      [portals.south,{x:portals.south.x,y:height-inset},center]
    ];
    const segments=[];
    for(const road of roads)for(let index=1;index<road.length;index++)segments.push([road[index-1],road[index]]);
    return{center,roads,segments}
  }

  function nearRoad(entry,segments,corridorWidth){
    const radius=Math.min(90,Math.max(entry.w||entry.r||0,entry.h||entry.r||0)*.28);
    return segments.some(segment=>distanceToSegment(entry.x,entry.y,segment[0].x,segment[0].y,segment[1].x,segment[1].y)<corridorWidth+radius)
  }

  function translatePoint(point,origin,extra){return Object.assign({},point,extra||{},{x:point.x+origin.x,y:point.y+origin.y})}
  function translateRoad(road,origin){return road.map(point=>translatePoint(point,origin))}

  function chooseFeaturePoints(layout,seed){
    const points=layout.spawnZones.slice().sort((a,b)=>a.x-b.x||a.y-b.y);
    const choose=(label,avoid)=>{
      if(!points.length)return{x:layout.center.x,y:layout.center.y};
      let start=hashParts(seed,label)%points.length;
      for(let offset=0;offset<points.length;offset++){
        const candidate=points[(start+offset)%points.length];
        if(!avoid.some(point=>Math.hypot(candidate.x-point.x,candidate.y-point.y)<260))return candidate
      }
      return points[start]
    };
    const selected=[];
    const camp=choose('camp',selected);selected.push(camp);
    const event=choose('event',selected);selected.push(event);
    const loot=choose('loot',selected);selected.push(loot);
    const boss=layout.bossAnchor||choose('boss',selected);
    return{
      camp:{type:'camp',x:camp.x,y:camp.y,seed:hashParts(seed,'camp-content')},
      event:{type:'event',x:event.x,y:event.y,seed:hashParts(seed,'event-content')},
      loot:{type:'loot',x:loot.x,y:loot.y,seed:hashParts(seed,'loot-content')},
      boss:{type:'boss',x:boss.x,y:boss.y,seed:hashParts(seed,'boss-content')}
    }
  }

  function generateRegion(worldSeed,regionX,regionY,mapId,terrainApi,options){
    if(!terrainApi||typeof terrainApi.generate!=='function')throw new Error('Infinite world requires GuildTerrain');
    options=Object.assign({},DEFAULTS,options||{});
    const width=terrainApi.WORLD.w,height=terrainApi.WORLD.h,seed=hashParts(worldSeed,mapId,regionX,regionY),base=terrainApi.generate(seed,mapId),origin=regionOrigin(regionX,regionY,width,height),portals=localPortals(worldSeed,regionX,regionY,width,height),roads=makeRoads(portals,width,height,seed);
    const localObstacles=base.obstacles.filter(entry=>!nearRoad(entry,roads.segments,options.corridorWidth));
    const localDecor=base.decor.filter(entry=>!nearRoad(entry,roads.segments,options.corridorWidth*.72));
    const region={
      key:regionKey(regionX,regionY),regionX,regionY,origin,seed,worldSeed,mapId,
      danger:1+Math.hypot(regionX,regionY)*.085,
      world:{w:width,h:height},grid:Object.assign({},base.grid),pathRows:base.pathRows.slice(),
      portals:Object.fromEntries(Object.entries(portals).map(([key,point])=>[key,translatePoint(point,origin)])),
      center:translatePoint(roads.center,origin),
      roads:roads.roads.map(road=>translateRoad(road,origin)),
      modules:base.modules.map(module=>translatePoint(module,origin,{regionKey:regionKey(regionX,regionY)})),
      obstacles:localObstacles.map(obstacle=>translatePoint(obstacle,origin,{regionKey:regionKey(regionX,regionY)})),
      decor:localDecor.map(entry=>translatePoint(entry,origin,{regionKey:regionKey(regionX,regionY)})),
      spawnZones:base.spawnZones.map(zone=>translatePoint(zone,origin,{regionKey:regionKey(regionX,regionY)})),
      entrance:translatePoint(base.entrance,origin,{regionKey:regionKey(regionX,regionY)}),
      bossAnchor:translatePoint(base.bossAnchor,origin,{regionKey:regionKey(regionX,regionY)}),
      routePoints:[],features:null,validation:base.validation
    };
    region.routePoints=[region.portals.west,region.roads[0][1],region.center,region.roads[1][1],region.portals.east];
    region.features=chooseFeaturePoints(region,seed);
    region.bossAnchor={x:region.features.boss.x,y:region.features.boss.y,regionKey:region.key};
    return region
  }

  function create(options){
    options=options||{};
    const terrainApi=options.terrainApi,worldSeed=(Number(options.worldSeed)>>>0)||1,mapId=options.mapId||'guild',width=terrainApi.WORLD.w,height=terrainApi.WORLD.h,preloadRadius=Math.max(1,options.preloadRadius==null?DEFAULTS.preloadRadius:options.preloadRadius),retainRadius=Math.max(preloadRadius,options.retainRadius==null?DEFAULTS.retainRadius:options.retainRadius),cache=new Map();
    let current={x:0,y:0},generation=0;

    function get(x,y){
      const key=regionKey(x,y);
      if(!cache.has(key)){cache.set(key,generateRegion(worldSeed,x,y,mapId,terrainApi,options));generation++}
      return cache.get(key)
    }

    function update(x,y){
      const next=regionCoordinates(x,y,width,height),changed=next.x!==current.x||next.y!==current.y;
      current=next;
      if(changed||!cache.size){
        for(let row=-preloadRadius;row<=preloadRadius;row++)for(let col=-preloadRadius;col<=preloadRadius;col++)get(current.x+col,current.y+row);
        for(const [key,region] of cache)if(Math.abs(region.regionX-current.x)>retainRadius||Math.abs(region.regionY-current.y)>retainRadius)cache.delete(key)
      }
      return{changed,current:Object.assign({},current),region:get(current.x,current.y),loaded:regions()}
    }

    function regions(){return Array.from(cache.values()).sort((a,b)=>a.regionY-b.regionY||a.regionX-b.regionX)}
    function regionAt(x,y){const point=regionCoordinates(x,y,width,height);return get(point.x,point.y)}
    function snapshot(){return{worldSeed,mapId,current:Object.assign({},current),generation,loaded:regions().map(region=>({key:region.key,x:region.regionX,y:region.regionY,seed:region.seed,danger:region.danger}))}}

    update(width*.5,height*.5);
    return{worldSeed,mapId,width,height,update,get,regions,regionAt,snapshot}
  }

  return{DEFAULTS,hashParts,regionKey,regionCoordinates,localPortals,generateRegion,create}
});
