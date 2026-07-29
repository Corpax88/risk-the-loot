(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.GuildTerrain=api;
})(typeof window!=='undefined'?window:globalThis,function(){
  'use strict';

  const WORLD={w:2400,h:1600};
  const GRID={cols:5,rows:3,marginX:80,marginY:80};
  GRID.cellW=(WORLD.w-GRID.marginX*2)/GRID.cols;
  GRID.cellH=(WORLD.h-GRID.marginY*2)/GRID.rows;

  const MODULES={
    open:{
      obstacles:[
        [-.29,-.3,.27,.075], [.3,.29,.25,.075]
      ]
    },
    courtyard:{
      obstacles:[
        [-.3,-.31,.28,.075], [.3,-.31,.28,.075],
        [-.34,.18,.075,.3], [.34,.18,.075,.3]
      ]
    },
    crossroads:{
      obstacles:[
        [-.29,-.27,.22,.09], [.29,-.27,.22,.09],
        [-.29,.27,.22,.09], [.29,.27,.22,.09]
      ]
    },
    passage:{
      obstacles:[
        [-.19,-.29,.5,.075], [.2,.29,.46,.075]
      ]
    },
    fork:{
      obstacles:[
        [-.28,-.28,.22,.075], [.28,.28,.22,.075],
        [.04,-.05,.075,.2]
      ]
    },
    blocked:{
      obstacles:[
        [0,0,.28,.14], [-.33,.29,.18,.07], [.33,-.29,.18,.07]
      ]
    },
    edge:{
      obstacles:[
        [-.32,-.3,.2,.07], [.32,.3,.2,.07]
      ]
    },
    entrance:{
      obstacles:[
        [-.05,-.3,.37,.07], [.18,.3,.3,.07]
      ]
    },
    boss:{
      obstacles:[
        [-.32,-.29,.2,.07], [.32,-.29,.2,.07],
        [-.32,.29,.2,.07], [.32,.29,.2,.07]
      ]
    }
  };

  function normalizeSeed(value){
    let seed=Number(value);
    if(!Number.isFinite(seed))seed=1;
    seed=Math.abs(Math.floor(seed))>>>0;
    return seed||1;
  }

  function rngFor(seed){
    let state=normalizeSeed(seed);
    return function(){
      state|=0;
      state=state+0x6D2B79F5|0;
      let value=Math.imul(state^state>>>15,1|state);
      value=value+Math.imul(value^value>>>7,61|value)^value;
      return ((value^value>>>14)>>>0)/4294967296;
    };
  }

  function choose(rng,list){return list[Math.floor(rng()*list.length)]}
  function clamp(value,min,max){return Math.max(min,Math.min(max,value))}
  function moduleCenter(col,row){
    return{
      x:GRID.marginX+(col+.5)*GRID.cellW,
      y:GRID.marginY+(row+.5)*GRID.cellH
    };
  }

  function obstacleBounds(obstacle,pad){
    pad=pad||0;
    return{
      left:obstacle.x-obstacle.w/2-pad,
      right:obstacle.x+obstacle.w/2+pad,
      top:obstacle.y-obstacle.h/2-pad,
      bottom:obstacle.y+obstacle.h/2+pad
    };
  }

  function pointBlocked(layout,x,y,radius){
    radius=radius||0;
    for(const obstacle of layout.obstacles){
      const bounds=obstacleBounds(obstacle,radius);
      if(x>bounds.left&&x<bounds.right&&y>bounds.top&&y<bounds.bottom)return true;
    }
    return false;
  }

  function resolveOpen(layout,x,y,radius){
    x=clamp(x,radius,WORLD.w-radius);
    y=clamp(y,radius,WORLD.h-radius);
    if(!pointBlocked(layout,x,y,radius))return{x,y};
    for(let ring=44;ring<=300;ring+=44){
      for(let index=0;index<16;index++){
        const angle=index*Math.PI/8,candidate={
          x:clamp(x+Math.cos(angle)*ring,radius,WORLD.w-radius),
          y:clamp(y+Math.sin(angle)*ring,radius,WORLD.h-radius)
        };
        if(!pointBlocked(layout,candidate.x,candidate.y,radius))return candidate;
      }
    }
    return null;
  }

  function buildPath(rng){
    const rows=[Math.floor(rng()*GRID.rows)];
    for(let col=1;col<GRID.cols;col++){
      const previous=rows[col-1],moves=[0,0,-1,1].filter(move=>previous+move>=0&&previous+move<GRID.rows);
      rows.push(previous+choose(rng,moves));
    }
    if(rows.every(row=>row===rows[0])){
      const pivot=2+Math.floor(rng()*2),direction=rows[0]===0?1:rows[0]===GRID.rows-1?-1:(rng()<.5?-1:1);
      rows[pivot]=rows[pivot-1]+direction;
      for(let col=pivot+1;col<GRID.cols;col++)rows[col]=clamp(rows[col-1]+(rng()<.35?-direction:0),0,GRID.rows-1);
    }
    return rows;
  }

  function addModuleObstacles(layout,module){
    const definition=MODULES[module.kind]||MODULES.open;
    for(let index=0;index<definition.obstacles.length;index++){
      const entry=definition.obstacles[index],wide=entry[3]<entry[2],w=Math.max(42,entry[2]*GRID.cellW),h=Math.max(36,entry[3]*GRID.cellH);
      layout.obstacles.push({
        x:module.x+entry[0]*GRID.cellW,
        y:module.y+entry[1]*GRID.cellH,
        w,h,
        style:(module.col*3+module.row+index)%4,
        mapId:'guild',
        moduleId:module.id,
        moduleKind:module.kind,
        wide
      });
    }
  }

  function addModuleDecor(layout,module,rng){
    const count=module.path?4:3;
    const spots=[
      [-.39,-.35], [.39,-.35], [-.39,.35], [.39,.35],
      [0,-.39], [0,.39]
    ];
    for(let index=0;index<count;index++){
      const spot=spots[(index+Math.floor(rng()*spots.length))%spots.length],x=module.x+spot[0]*GRID.cellW+(rng()-.5)*42,y=module.y+spot[1]*GRID.cellH+(rng()-.5)*38;
      layout.decor.push({
        x,y,
        r:10+rng()*13,
        type:(module.col+module.row+index)%4,
        variant:(module.col*2+index)%3,
        rot:rng()*Math.PI*2,
        mapId:'guild',
        moduleId:module.id,
        moduleKind:module.kind
      });
    }
  }

  function addSpawnZones(layout,module,rng){
    if(module.col===0)return;
    const offsets=module.path?[[0,-.32],[0,.32],[.3,0]]:[[0,0]];
    for(let index=0;index<offsets.length;index++){
      const offset=offsets[index],open=resolveOpen(
        layout,
        module.x+offset[0]*GRID.cellW+(rng()-.5)*34,
        module.y+offset[1]*GRID.cellH+(rng()-.5)*34,
        42
      );
      if(open)layout.spawnZones.push({
        x:open.x,y:open.y,
        col:module.col,row:module.row,
        moduleId:module.id,
        depthHint:clamp(module.col,1,4),
        edge:index<2
      });
    }
  }

  function connectivity(layout){
    const step=48,radius=28,cols=Math.ceil(WORLD.w/step),rows=Math.ceil(WORLD.h/step);
    const key=(col,row)=>row*cols+col;
    const cellFor=point=>({
      col:clamp(Math.floor(point.x/step),0,cols-1),
      row:clamp(Math.floor(point.y/step),0,rows-1)
    });
    const entrance=cellFor(layout.entrance),queue=[entrance],visited=new Set([key(entrance.col,entrance.row)]);
    for(let cursor=0;cursor<queue.length;cursor++){
      const current=queue[cursor];
      for(const move of [[1,0],[-1,0],[0,1],[0,-1]]){
        const col=current.col+move[0],row=current.row+move[1];
        if(col<0||row<0||col>=cols||row>=rows)continue;
        const id=key(col,row);
        if(visited.has(id))continue;
        const x=clamp((col+.5)*step,radius,WORLD.w-radius),y=clamp((row+.5)*step,radius,WORLD.h-radius);
        if(pointBlocked(layout,x,y,radius))continue;
        visited.add(id);
        queue.push({col,row});
      }
    }
    const reachable=point=>{
      const cell=cellFor(point);
      if(visited.has(key(cell.col,cell.row)))return true;
      for(let row=-1;row<=1;row++)for(let col=-1;col<=1;col++)if(visited.has(key(cell.col+col,cell.row+row)))return true;
      return false;
    };
    return{
      visited:visited.size,
      total:cols*rows,
      bossReachable:reachable(layout.bossAnchor),
      spawnReachable:layout.spawnZones.every(reachable),
      routeReachable:layout.routePoints.every(reachable)
    };
  }

  function validate(layout){
    const connectivityResult=connectivity(layout),errors=[];
    if(pointBlocked(layout,layout.entrance.x,layout.entrance.y,28))errors.push('entrance-blocked');
    if(pointBlocked(layout,layout.bossAnchor.x,layout.bossAnchor.y,70))errors.push('boss-blocked');
    if(Math.hypot(layout.bossAnchor.x-layout.entrance.x,layout.bossAnchor.y-layout.entrance.y)<1500)errors.push('route-too-short');
    if(layout.spawnZones.length<10)errors.push('too-few-spawn-zones');
    if(!connectivityResult.bossReachable)errors.push('boss-unreachable');
    if(!connectivityResult.spawnReachable)errors.push('spawn-unreachable');
    if(!connectivityResult.routeReachable)errors.push('route-unreachable');
    if(connectivityResult.visited/connectivityResult.total<.72)errors.push('insufficient-open-space');
    return{valid:errors.length===0,errors,connectivity:connectivityResult};
  }

  function generate(seed){
    seed=normalizeSeed(seed);
    const rng=rngFor(seed),pathRows=buildPath(rng),layout={
      seed,
      world:{w:WORLD.w,h:WORLD.h},
      grid:Object.assign({},GRID),
      pathRows,
      modules:[],
      routePoints:[],
      obstacles:[],
      decor:[],
      spawnZones:[],
      entrance:null,
      bossAnchor:null,
      validation:null
    };
    const pathKinds=['open','crossroads','courtyard','passage','fork'];
    for(let col=0;col<GRID.cols;col++)for(let row=0;row<GRID.rows;row++){
      const center=moduleCenter(col,row),path=row===pathRows[col],kind=col===0&&path?'entrance':col===GRID.cols-1&&path?'boss':path?choose(rng,pathKinds):choose(rng,['edge','blocked','open','courtyard']);
      const module={id:'m'+col+'-'+row,col,row,x:center.x,y:center.y,path,kind};
      layout.modules.push(module);
      if(path)layout.routePoints.push({x:center.x,y:center.y,col,row,moduleId:module.id});
      addModuleObstacles(layout,module);
      addModuleDecor(layout,module,rng);
    }
    const first=layout.routePoints[0],last=layout.routePoints[layout.routePoints.length-1];
    layout.entrance={x:132,y:first.y,col:0,row:first.row,moduleId:first.moduleId};
    layout.bossAnchor={x:WORLD.w-142,y:last.y,col:GRID.cols-1,row:last.row,moduleId:last.moduleId};
    for(const module of layout.modules)addSpawnZones(layout,module,rng);
    layout.spawnZones=layout.spawnZones.filter(zone=>Math.hypot(zone.x-layout.entrance.x,zone.y-layout.entrance.y)>430);
    layout.validation=validate(layout);
    return layout;
  }

  return{
    WORLD,
    GRID,
    MODULES,
    normalizeSeed,
    generate,
    validate,
    pointBlocked
  };
});
