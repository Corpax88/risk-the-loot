const assert=require('assert');
const terrain=require('../guild-terrain.js');

const mapIds=['guild','foundry','moonfall','skyglass','summit'];
const signatureCounts={};

for(const mapId of mapIds){
  const signatures=new Set();
  for(let seed=1;seed<=1000;seed++){
    const first=terrain.generate(seed,mapId),second=terrain.generate(seed,mapId);
    assert.equal(first.mapId,mapId,mapId+' seed '+seed+' has the wrong biome profile');
    assert(first.validation.valid,mapId+' seed '+seed+' failed: '+first.validation.errors.join(', '));
    assert.deepEqual(first.pathRows,second.pathRows,mapId+' seed '+seed+' is not deterministic');
    assert.deepEqual(first.obstacles,second.obstacles,mapId+' seed '+seed+' obstacle layout changed');
    assert.deepEqual(first.spawnZones,second.spawnZones,mapId+' seed '+seed+' spawn zones changed');
    assert.equal(first.modules.length,15,mapId+' seed '+seed+' has the wrong module count');
    assert(first.modules.some(module=>module.kind==='entrance'),mapId+' seed '+seed+' is missing entrance module');
    assert(first.modules.some(module=>module.kind==='boss'),mapId+' seed '+seed+' is missing boss module');
    assert(first.obstacles.length>=28&&first.obstacles.length<=60,mapId+' seed '+seed+' obstacle count is unsafe');
    assert(first.spawnZones.length>=10,mapId+' seed '+seed+' needs more spawn zones');
    assert(first.validation.connectivity.visited/first.validation.connectivity.total>=.72,mapId+' seed '+seed+' lacks horde space');
    assert(Math.hypot(first.bossAnchor.x-first.entrance.x,first.bossAnchor.y-first.entrance.y)>=1500,mapId+' seed '+seed+' boss is too close');
    for(const point of [first.entrance,first.bossAnchor,...first.spawnZones]){
      assert(point.x>=0&&point.x<=terrain.WORLD.w&&point.y>=0&&point.y<=terrain.WORLD.h,mapId+' seed '+seed+' placed a point outside the world');
      assert(!terrain.pointBlocked(first,point.x,point.y,point===first.bossAnchor?70:28),mapId+' seed '+seed+' placed a point inside cover');
    }
    signatures.add(first.pathRows.join('-')+'|'+first.modules.filter(module=>module.path).map(module=>module.kind).join('-'));
  }
  assert(signatures.size>=100,mapId+' layouts do not vary enough');
  signatureCounts[mapId]=signatures.size;
}

console.log('Biome terrain smoke passed: 5000 deterministic connected seeds',signatureCounts);
