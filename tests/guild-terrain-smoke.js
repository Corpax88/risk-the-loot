const assert=require('assert');
const terrain=require('../guild-terrain.js');

const signatures=new Set();
for(let seed=1;seed<=1000;seed++){
  const first=terrain.generate(seed),second=terrain.generate(seed);
  assert(first.validation.valid,'seed '+seed+' failed: '+first.validation.errors.join(', '));
  assert.deepEqual(first.pathRows,second.pathRows,'seed '+seed+' is not deterministic');
  assert.deepEqual(first.obstacles,second.obstacles,'seed '+seed+' obstacle layout changed');
  assert.deepEqual(first.spawnZones,second.spawnZones,'seed '+seed+' spawn zones changed');
  assert.equal(first.modules.length,15,'seed '+seed+' has the wrong module count');
  assert(first.modules.some(module=>module.kind==='entrance'),'seed '+seed+' is missing entrance module');
  assert(first.modules.some(module=>module.kind==='boss'),'seed '+seed+' is missing boss module');
  assert(first.obstacles.length>=28&&first.obstacles.length<=60,'seed '+seed+' obstacle count is unsafe');
  assert(first.spawnZones.length>=10,'seed '+seed+' needs more spawn zones');
  assert(first.validation.connectivity.visited/first.validation.connectivity.total>=.72,'seed '+seed+' lacks horde space');
  assert(Math.hypot(first.bossAnchor.x-first.entrance.x,first.bossAnchor.y-first.entrance.y)>=1500,'seed '+seed+' boss is too close');
  for(const point of [first.entrance,first.bossAnchor,...first.spawnZones]){
    assert(point.x>=0&&point.x<=terrain.WORLD.w&&point.y>=0&&point.y<=terrain.WORLD.h,'seed '+seed+' placed a point outside the world');
    assert(!terrain.pointBlocked(first,point.x,point.y,point===first.bossAnchor?70:28),'seed '+seed+' placed a point inside cover');
  }
  signatures.add(first.pathRows.join('-')+'|'+first.modules.filter(module=>module.path).map(module=>module.kind).join('-'));
}

assert(signatures.size>=30,'generated layouts do not vary enough');
console.log('Guild terrain smoke passed: 1000 deterministic connected seeds, '+signatures.size+' route signatures');
