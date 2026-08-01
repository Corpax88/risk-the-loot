const assert=require('assert');
const terrain=require('../guild-terrain.js');
const infinite=require('../infinite-world.js');

const maps=['guild','foundry','moonfall','skyglass','summit'];
const seeds=[7,73,512];

function signature(region){
  return JSON.stringify({seed:region.seed,portals:region.portals,features:region.features,obstacles:region.obstacles,modules:region.modules.map(module=>module.kind)})
}
function portalPoint(portal){return{x:portal.x,y:portal.y}}

for(const mapId of maps){
  for(const worldSeed of seeds){
    const seen=new Set();
    for(const [x,y] of [[0,0],[1,0],[-1,0],[0,1],[0,-1],[3,-2]]){
      const region=infinite.generateRegion(worldSeed,x,y,mapId,terrain);
      const repeat=infinite.generateRegion(worldSeed,x,y,mapId,terrain);
      assert.equal(signature(region),signature(repeat),mapId+' region must reproduce from its seed');
      assert(region.validation.valid,mapId+' region must remain traversable');
      assert.equal(Object.keys(region.portals).length,4,mapId+' region must expose four exits');
      assert.equal(Object.keys(region.features).length,4,mapId+' region must contain camp, event, loot and boss anchors');
      assert(region.roads.length===4&&region.roads.every(road=>road.length===3),mapId+' exits must connect to the local road network');
      seen.add(signature(region))
    }
    assert.equal(seen.size,6,mapId+' regions should not repeat around the origin');

    const center=infinite.generateRegion(worldSeed,0,0,mapId,terrain);
    const east=infinite.generateRegion(worldSeed,1,0,mapId,terrain);
    const west=infinite.generateRegion(worldSeed,-1,0,mapId,terrain);
    const north=infinite.generateRegion(worldSeed,0,-1,mapId,terrain);
    const south=infinite.generateRegion(worldSeed,0,1,mapId,terrain);
    assert.deepEqual(portalPoint(center.portals.east),portalPoint(east.portals.west),mapId+' east/west gates must meet exactly');
    assert.deepEqual(portalPoint(center.portals.west),portalPoint(west.portals.east),mapId+' west/east gates must meet exactly');
    assert.deepEqual(portalPoint(center.portals.north),portalPoint(north.portals.south),mapId+' north/south gates must meet exactly');
    assert.deepEqual(portalPoint(center.portals.south),portalPoint(south.portals.north),mapId+' south/north gates must meet exactly');
    assert(infinite.generateRegion(worldSeed,4,3,mapId,terrain).danger>center.danger,'distance must increase region danger');

    const streamer=infinite.create({worldSeed,mapId,terrainApi:terrain});
    const originSignature=signature(streamer.get(0,0));
    for(let step=-8;step<=8;step++){
      const update=streamer.update(step*terrain.WORLD.w+terrain.WORLD.w*.5,(step%4-2)*terrain.WORLD.h+terrain.WORLD.h*.5);
      assert(update.loaded.length<=9,'streamer must retain only the nearby 3x3 region ring')
    }
    streamer.update(terrain.WORLD.w*.5,terrain.WORLD.h*.5);
    assert.equal(signature(streamer.get(0,0)),originSignature,'returning to coordinates must regenerate the same region')
  }
}

console.log('Infinite world smoke passed: deterministic regions, shared gates, bounded streaming and distance danger');
