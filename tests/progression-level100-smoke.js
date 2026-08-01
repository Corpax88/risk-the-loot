const assert=require('assert');
const progression=require('../progression.js');

const {
  MAX_PLAYER_LEVEL,
  TOTAL_XP_TO_MAX,
  MAP_UNLOCK_LEVELS,
  SET_UNLOCK_LEVELS,
  clampLevel,
  xpRequiredForNextLevel,
  totalXpForLevel,
  applyXp,
  sanitizeProgress,
  xpProgress,
  xpProgressFromTotal,
  getEnemyXpReward,
  playerStatsForLevel,
  enemyScaleForLevel,
  bossScaleForLevel,
  gearScaleForLevel,
  gearValueScaleForLevel
}=progression;

assert.equal(MAX_PLAYER_LEVEL,100,'Level 100 must be the single hard cap');
assert.equal(TOTAL_XP_TO_MAX,8986,'total XP to Level 100 is not deterministic');
assert.deepEqual(sanitizeProgress(undefined,undefined),{level:1,xp:0,levelsGained:0,discardedXp:0},'fresh progress must start at Level 1');

const thresholds=[];
for(let level=1;level<MAX_PLAYER_LEVEL;level++){
  const needed=xpRequiredForNextLevel(level);
  assert(Number.isInteger(needed)&&needed>0,'invalid XP threshold at Level '+level);
  if(thresholds.length)assert(needed>thresholds[thresholds.length-1],'XP curve must rise every level');
  thresholds.push(needed);
  assert.equal(totalXpForLevel(level+1)-totalXpForLevel(level),needed,'total XP table disagrees at Level '+level);
}
assert.equal(xpRequiredForNextLevel(100),0,'Level 100 must not expose Level 101 XP');
assert.equal(totalXpForLevel(100),TOTAL_XP_TO_MAX,'Level 100 cumulative XP is inconsistent');

assert.deepEqual(applyXp(1,0,9),{level:1,xp:9,levelsGained:0,discardedXp:0},'sub-threshold XP leveled the player');
assert.deepEqual(applyXp(1,0,10),{level:2,xp:0,levelsGained:1,discardedXp:0},'exact threshold did not grant one level');
let multi=applyXp(1,0,totalXpForLevel(10)+5);
assert.deepEqual(multi,{level:10,xp:5,levelsGained:9,discardedXp:0},'multi-level XP skipped or lost a level');
let finalLevel=applyXp(99,0,xpRequiredForNextLevel(99));
assert.deepEqual(finalLevel,{level:100,xp:0,levelsGained:1,discardedXp:0},'Level 99 did not become Level 100 cleanly');
let capped=applyXp(100,999999,999999);
assert.equal(capped.level,100,'Level 100 advanced to Level 101');
assert.equal(capped.xp,0,'capped XP continued accumulating');
assert(capped.discardedXp>0,'capped XP was not safely discarded');

assert.deepEqual(sanitizeProgress(-40,-10),{level:1,xp:0,levelsGained:0,discardedXp:0},'negative progress was not sanitized');
assert.deepEqual(sanitizeProgress(NaN,NaN),{level:1,xp:0,levelsGained:0,discardedXp:0},'NaN progress was not sanitized');
assert.equal(sanitizeProgress(101,42).level,100,'corrupt over-cap level was not clamped');
assert.equal(clampLevel(Infinity),1,'non-finite item/player level was not sanitized');
assert.equal(clampLevel(1000),100,'generated item level exceeded 100');

const capProgress=xpProgress(100,123456);
assert.deepEqual(capProgress,{level:100,current:0,required:0,percent:1,total:TOTAL_XP_TO_MAX,totalToMax:TOTAL_XP_TO_MAX,capped:true},'MAX LEVEL progress state is misleading');
for(const point of [[1,0],[9,2],[10,0],[99,203],[100,0]]){
  const value=xpProgress(point[0],point[1]);
  assert(Number.isFinite(value.percent)&&value.percent>=0&&value.percent<=1,'invalid XP percentage at Level '+point[0]);
}
for(const level of [1,2,10,35,60,99,100]){
  const total=totalXpForLevel(level),value=xpProgressFromTotal(total);
  assert.equal(value.level,level,'total XP lookup returned the wrong level at '+level);
  assert.equal(value.current,0,'total XP lookup did not land on the boundary at '+level);
}
assert.equal(getEnemyXpReward({enemyType:'rusher',enemyLevel:1,depth:1,difficulty:0}),1,'base Rusher XP changed');
assert.equal(getEnemyXpReward({enemyType:'brute',enemyLevel:1,depth:1,difficulty:0}),2,'base Brute XP changed');
assert(getEnemyXpReward({enemyType:'rusher',enemyLevel:1,elite:true,depth:1,difficulty:0})>getEnemyXpReward({enemyType:'rusher',enemyLevel:1,depth:1,difficulty:0}),'elite XP must exceed normal XP');
assert.equal(getEnemyXpReward({enemyType:'boss',boss:true,enemyLevel:1,depth:5,difficulty:0}),10,'base boss XP changed');
assert.equal(getEnemyXpReward({enemyType:'boss',boss:true,enemyLevel:1,depth:5,difficulty:2}),20,'risk-tier boss XP changed');
assert.equal(getEnemyXpReward({enemyType:'boss',boss:true,enemyLevel:1,depth:10,difficulty:4}),30,'deep-risk boss XP changed');
assert(getEnemyXpReward({enemyType:'brute',enemyLevel:80,depth:11,difficulty:8})>getEnemyXpReward({enemyType:'brute',enemyLevel:1,depth:1,difficulty:0}),'depth, level and difficulty must scale regular XP');

assert.deepEqual(Object.values(MAP_UNLOCK_LEVELS),[1,15,35,60,80],'map milestones are not spread across 100 levels');
for(const [id,level] of Object.entries(SET_UNLOCK_LEVELS))assert(level>=1&&level<=100,'set unlock outside progression range: '+id);

function assertFinitePositive(value,label){
  if(typeof value==='number')assert(Number.isFinite(value)&&value>0,label+' is invalid');
  else for(const [key,entry] of Object.entries(value))assertFinitePositive(entry,label+'.'+key);
}
for(const level of [1,10,20,40,60,80,99,100]){
  assertFinitePositive(playerStatsForLevel(level),'player Level '+level);
  assertFinitePositive(enemyScaleForLevel(level),'enemy Level '+level);
  assertFinitePositive(bossScaleForLevel(level),'boss Level '+level);
  assertFinitePositive(gearScaleForLevel(level),'gear Level '+level);
  assertFinitePositive(gearValueScaleForLevel(level),'gear value Level '+level);
}
assert(playerStatsForLevel(100).hp<300,'player health grew beyond the intended Level 100 budget');
assert(bossScaleForLevel(100).hp<4,'boss level scaling ran away from expedition difficulty');
assert(gearScaleForLevel(100)<3,'gear stat scaling ran away at Level 100');

console.log('Level 100 progression smoke passed: 99 thresholds, 8,986 total XP, finite scaling and a strict cap.');
