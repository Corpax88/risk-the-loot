const assert=require('assert');
const progression=require('../progression.js');

const {
  MAX_PLAYER_LEVEL,
  TOTAL_XP_TO_MAX,
  MAP_UNLOCK_LEVELS,
  LOOT_RARITY_RANGES,
  LOOT_STAGE_LEVEL_CAPS,
  SET_UNLOCK_LEVELS,
  clampLevel,
  xpRequiredForNextLevel,
  totalXpForLevel,
  applyXp,
  sanitizeProgress,
  xpProgress,
  xpProgressFromTotal,
  getEnemyXpReward,
  lootProgressionContext,
  lootRarityEligible,
  eligibleLootRarities,
  playerStatsForLevel,
  enemyScaleForLevel,
  bossScaleForLevel,
  gearScaleForLevel,
  gearValueScaleForLevel
}=progression;

assert.equal(MAX_PLAYER_LEVEL,100,'Level 100 must be the single hard cap');
assert.equal(TOTAL_XP_TO_MAX,70329,'total XP to Level 100 is not deterministic');
assert.deepEqual(sanitizeProgress(undefined,undefined),{level:1,xp:0,levelsGained:0,discardedXp:0},'fresh progress must start at Level 1');

const thresholds=[];
for(let level=1;level<MAX_PLAYER_LEVEL;level++){
  const needed=xpRequiredForNextLevel(level);
  assert(Number.isInteger(needed)&&needed>0,'invalid XP threshold at Level '+level);
  if(thresholds.length)assert(needed>thresholds[thresholds.length-1],'XP curve must rise every level');
  thresholds.push(needed);
  assert.equal(totalXpForLevel(level+1)-totalXpForLevel(level),needed,'total XP table disagrees at Level '+level);
}
assert.deepEqual([1,10,25,50,65,80,95,100].map(totalXpForLevel),[0,126,627,2828,6424,16470,47159,70329],'XP phase milestones changed unexpectedly');
for(let level=2;level<MAX_PLAYER_LEVEL;level++)assert(xpRequiredForNextLevel(level)/xpRequiredForNextLevel(level-1)<1.17,'XP curve spikes too sharply at Level '+level);
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
assert.equal(getEnemyXpReward({enemyType:'boss',boss:true,enemyLevel:1,depth:5,difficulty:0}),16,'base boss XP changed');
assert.equal(getEnemyXpReward({enemyType:'boss',boss:true,enemyLevel:1,depth:5,difficulty:2}),20,'risk-tier boss XP changed');
assert.equal(getEnemyXpReward({enemyType:'boss',boss:true,enemyLevel:1,depth:10,difficulty:4}),29,'deep-risk boss XP changed');
assert(getEnemyXpReward({enemyType:'brute',enemyLevel:80,depth:11,difficulty:8})>getEnemyXpReward({enemyType:'brute',enemyLevel:1,depth:1,difficulty:0}),'depth, level and difficulty must scale regular XP');
for(let risk=2;risk<=20;risk+=2)assert(getEnemyXpReward({enemyType:'rusher',depth:1,difficulty:risk})>getEnemyXpReward({enemyType:'rusher',depth:1,difficulty:risk-2}),'higher risk did not improve regular-enemy XP at tier '+risk);
for(let risk=1;risk<=20;risk++)assert(getEnemyXpReward({enemyType:'boss',boss:true,depth:5,difficulty:risk})>getEnemyXpReward({enemyType:'boss',boss:true,depth:5,difficulty:risk-1}),'higher risk did not improve boss XP at tier '+risk);

function firstStageProfile({normal=0,brutes=0,elites=0}){
  const amount=normal*getEnemyXpReward({enemyType:'rusher',depth:1,difficulty:0})+brutes*getEnemyXpReward({enemyType:'brute',depth:1,difficulty:0})+elites*getEnemyXpReward({enemyType:'rusher',elite:true,depth:1,difficulty:0})+getEnemyXpReward({enemyType:'boss',boss:true,depth:5,difficulty:0});
  return Object.assign({amount},applyXp(1,0,amount));
}
assert.equal(firstStageProfile({normal:66,elites:3}).level,8,'a weak complete first stage must land at Level 8');
assert.equal(firstStageProfile({normal:72,brutes:8,elites:5}).level,9,'a normal complete first stage must land around Level 9');
assert.equal(firstStageProfile({normal:105,brutes:15,elites:8}).level,12,'an exceptional first stage must not exceed Level 12');

assert.deepEqual(LOOT_RARITY_RANGES,{common:{minLevel:1,maxLevel:40,minStage:1},rare:{minLevel:10,maxLevel:70,minStage:1},epic:{minLevel:25,maxLevel:100,minStage:2},legendary:{minLevel:50,maxLevel:100,minStage:4}},'loot availability ranges changed');
assert.deepEqual(LOOT_STAGE_LEVEL_CAPS,{1:24,2:49,3:70,4:100},'loot stage caps changed');
assert.deepEqual(lootProgressionContext(100,5),{level:100,stage:1,highestDepth:5,effectiveLevel:24,stageCap:24},'stage-one farming escaped its loot cap');
assert.deepEqual(eligibleLootRarities(100,5),['common','rare'],'stage one unlocked high-tier loot');
assert.equal(lootRarityEligible('legendary',100,5),false,'stage-one farming unlocked Legendary gear');
assert.equal(lootRarityEligible('legendary',50,20),true,'stage four did not unlock level-appropriate Legendary gear');
assert.deepEqual(eligibleLootRarities(50,20),['rare','epic','legendary'],'stage-four overlap is wrong');

assert.deepEqual(Object.values(MAP_UNLOCK_LEVELS),[1,15,35,60,80],'map milestones are not spread across 100 levels');
for(const [id,level] of Object.entries(SET_UNLOCK_LEVELS))assert(level>=1&&level<=100,'set unlock outside progression range: '+id);
assert.equal(SET_UNLOCK_LEVELS.lavaSet,55,'Lava Set must unlock at Level 55');

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

console.log('Level 100 progression smoke passed: calibrated first-stage profiles, 70,329 total XP, depth-gated loot and a strict cap.');
