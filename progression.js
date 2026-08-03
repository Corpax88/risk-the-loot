(function(root,factory){
  'use strict';

  const progression=Object.freeze(factory());
  if(typeof module==='object'&&module.exports)module.exports=progression;
  if(root)root.RiskLootProgression=progression;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const MAX_PLAYER_LEVEL=100;
  const XP_CURVE=Object.freeze({
    base:10,
    linear:1,
    quadraticDivisor:100,
    ramps:Object.freeze([
      Object.freeze({startLevel:10,growth:1.035,scale:18}),
      Object.freeze({startLevel:50,growth:1.08,scale:85}),
      Object.freeze({startLevel:80,growth:1.15,scale:80}),
      Object.freeze({startLevel:95,growth:1.35,scale:200})
    ])
  });
  const ENEMY_XP_BASE=Object.freeze({rusher:1,shooter:1,lancer:1,brute:2,boss:10,default:1});
  const XP_REWARDS=Object.freeze({
    depthFloorsPerBonus:5,
    depthBonus:1,
    riskTiersPerBonus:2,
    riskBonus:1,
    eliteMultiplier:3,
    eliteMinimum:3,
    bossBase:12,
    bossDepthPerFloor:1,
    bossRiskPerTier:2
  });
  const MAP_UNLOCK_LEVELS=Object.freeze({guild:1,foundry:15,moonfall:35,skyglass:60,summit:80});
  const LOOT_UNLOCK_LEVELS=Object.freeze({common:1,rare:10,epic:25,legendary:50,elevated:50,apex:65});
  const LOOT_RARITY_RANGES=Object.freeze({
    common:Object.freeze({minLevel:1,maxLevel:40,minStage:1}),
    rare:Object.freeze({minLevel:10,maxLevel:70,minStage:1}),
    epic:Object.freeze({minLevel:25,maxLevel:100,minStage:2}),
    legendary:Object.freeze({minLevel:50,maxLevel:100,minStage:4})
  });
  const LOOT_STAGE_LEVEL_CAPS=Object.freeze({1:24,2:49,3:70,4:100});
  const SET_UNLOCK_LEVELS=Object.freeze({
    trailwarden:1,ironGuild:1,redBanner:5,moonlitScout:5,coinseeker:8,
    towerBulwark:12,stormrunner:12,hammerChoir:16,lanternGuard:16,grandWayfarer:20,
    crimsonOath:25,moonbreaker:30,kingsRoad:35,phantomCourt:40,starforge:45,grandVoyager:50,lavaSet:55,natureSet:60,
    riskreaver:65,grandVault:72,crownlessKing:80,blackHole:86,fatebound:92
  });

  function finiteNumber(value,fallback){
    value=Number(value);
    return Number.isFinite(value)?value:fallback;
  }
  function clampLevel(level){
    return Math.max(1,Math.min(MAX_PLAYER_LEVEL,Math.floor(finiteNumber(level,1))));
  }
  function xpRequiredForNextLevel(level){
    level=clampLevel(level);
    if(level>=MAX_PLAYER_LEVEL)return 0;
    const step=level-1;
    const ramp=XP_CURVE.ramps.reduce((total,phase)=>{
      const distance=Math.max(0,level-phase.startLevel);
      return total+(distance?phase.scale*(Math.pow(phase.growth,distance)-1):0);
    },0);
    const baseline=XP_CURVE.base+step*XP_CURVE.linear+Math.floor(step*step/XP_CURVE.quadraticDivisor);
    return baseline+Math.round(ramp);
  }
  function totalXpForLevel(level){
    level=clampLevel(level);
    let total=0;
    for(let current=1;current<level;current++)total+=xpRequiredForNextLevel(current);
    return total;
  }
  const TOTAL_XP_TO_MAX=totalXpForLevel(MAX_PLAYER_LEVEL);

  function applyXp(level,currentXp,amount){
    level=clampLevel(level);
    currentXp=Math.max(0,Math.floor(finiteNumber(currentXp,0)));
    amount=Math.max(0,Math.floor(finiteNumber(amount,0)));
    if(level>=MAX_PLAYER_LEVEL)return {level:MAX_PLAYER_LEVEL,xp:0,levelsGained:0,discardedXp:currentXp+amount};
    let xp=currentXp+amount,levelsGained=0;
    while(level<MAX_PLAYER_LEVEL){
      const required=xpRequiredForNextLevel(level);
      if(xp<required)break;
      xp-=required;
      level++;
      levelsGained++;
    }
    if(level>=MAX_PLAYER_LEVEL)return {level:MAX_PLAYER_LEVEL,xp:0,levelsGained,discardedXp:xp};
    return {level,xp,levelsGained,discardedXp:0};
  }
  function sanitizeProgress(level,xp){
    return applyXp(level,xp,0);
  }
  function xpProgress(level,xp){
    const clean=sanitizeProgress(level,xp),capped=clean.level>=MAX_PLAYER_LEVEL,required=xpRequiredForNextLevel(clean.level),current=capped?0:clean.xp;
    return {
      level:clean.level,
      current,
      required,
      percent:capped?1:required?Math.max(0,Math.min(1,current/required)):0,
      total:totalXpForLevel(clean.level)+current,
      totalToMax:TOTAL_XP_TO_MAX,
      capped
    };
  }
  function xpProgressFromTotal(total){
    total=Math.max(0,Math.min(TOTAL_XP_TO_MAX,finiteNumber(total,0)));
    if(total>=TOTAL_XP_TO_MAX)return xpProgress(MAX_PLAYER_LEVEL,0);
    let low=1,high=MAX_PLAYER_LEVEL;
    while(low<high){
      const middle=Math.ceil((low+high)/2);
      if(totalXpForLevel(middle)<=total)low=middle;
      else high=middle-1;
    }
    const current=total-totalXpForLevel(low),required=xpRequiredForNextLevel(low);
    return {level:low,current,required,percent:required?Math.max(0,Math.min(1,current/required)):0,total,totalToMax:TOTAL_XP_TO_MAX,capped:false};
  }
  function playerStatsForLevel(level){
    const step=clampLevel(level)-1;
    return {hp:100+step*1.5,damage:8+step*.16};
  }
  function enemyScaleForLevel(level){
    const step=clampLevel(level)-1;
    return {hp:1+step*.006+step*step*.000035,damage:1+step*.0025+step*step*.000015};
  }
  function bossScaleForLevel(level){
    const step=clampLevel(level)-1;
    return {hp:1+step*.013+step*step*.00008,damage:1+step*.0045+step*step*.000025};
  }
  function gearScaleForLevel(level){
    const step=clampLevel(level)-1;
    return 1+step*.014+step*step*.000015;
  }
  function gearValueScaleForLevel(level){
    const step=clampLevel(level)-1;
    return 1+step*.018+step*step*.000025;
  }
  function bossXpReward(riskTier,depth){
    const risk=Math.max(0,Math.floor(finiteNumber(riskTier,0))),floor=Math.max(1,Math.floor(finiteNumber(depth,5)));
    return XP_REWARDS.bossBase+(floor-1)*XP_REWARDS.bossDepthPerFloor+risk*XP_REWARDS.bossRiskPerTier;
  }
  function getEnemyXpReward({enemyType,enemyLevel,elite,boss,depth,difficulty}={}){
    const type=String(enemyType||'default'),floor=Math.max(1,Math.floor(finiteNumber(depth,1))),risk=Math.max(0,Math.floor(finiteNumber(difficulty,0)));
    if(boss||type==='boss')return bossXpReward(risk,floor);
    const base=ENEMY_XP_BASE[type]||ENEMY_XP_BASE.default;
    const depthBonus=Math.floor((floor-1)/XP_REWARDS.depthFloorsPerBonus)*XP_REWARDS.depthBonus;
    const riskBonus=Math.floor(risk/XP_REWARDS.riskTiersPerBonus)*XP_REWARDS.riskBonus;
    const reward=base+depthBonus+riskBonus;
    return elite?Math.max(XP_REWARDS.eliteMinimum,reward*XP_REWARDS.eliteMultiplier):reward;
  }
  function lootStageForDepth(highestDepth){
    return Math.max(1,Math.ceil(Math.max(1,Math.floor(finiteNumber(highestDepth,1)))/5));
  }
  function lootProgressionContext(playerLevel,highestDepth){
    const level=clampLevel(playerLevel),stage=lootStageForDepth(highestDepth),stageCap=LOOT_STAGE_LEVEL_CAPS[Math.min(4,stage)]||MAX_PLAYER_LEVEL;
    return {level,stage,highestDepth:Math.max(1,Math.floor(finiteNumber(highestDepth,1))),effectiveLevel:Math.min(level,stageCap),stageCap};
  }
  function lootRarityEligible(rarity,playerLevel,highestDepth){
    const range=LOOT_RARITY_RANGES[rarity];
    if(!range)return false;
    const context=typeof playerLevel==='object'&&playerLevel?playerLevel:lootProgressionContext(playerLevel,highestDepth);
    return context.stage>=range.minStage&&context.effectiveLevel>=range.minLevel&&context.effectiveLevel<=range.maxLevel;
  }
  function eligibleLootRarities(playerLevel,highestDepth){
    const context=lootProgressionContext(playerLevel,highestDepth);
    return Object.keys(LOOT_RARITY_RANGES).filter(rarity=>lootRarityEligible(rarity,context));
  }

  return {
    MAX_PLAYER_LEVEL,
    XP_CURVE,
    ENEMY_XP_BASE,
    XP_REWARDS,
    TOTAL_XP_TO_MAX,
    MAP_UNLOCK_LEVELS,
    LOOT_UNLOCK_LEVELS,
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
    playerStatsForLevel,
    enemyScaleForLevel,
    bossScaleForLevel,
    gearScaleForLevel,
    gearValueScaleForLevel,
    bossXpReward,
    getEnemyXpReward,
    lootStageForDepth,
    lootProgressionContext,
    lootRarityEligible,
    eligibleLootRarities
  };
});
