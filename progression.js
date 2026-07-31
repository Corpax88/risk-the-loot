(function(root,factory){
  'use strict';

  const progression=Object.freeze(factory());
  if(typeof module==='object'&&module.exports)module.exports=progression;
  if(root)root.RiskLootProgression=progression;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
  'use strict';

  const MAX_PLAYER_LEVEL=100;
  const XP_CURVE=Object.freeze({base:10,linear:1,quadraticDivisor:100});
  const MAP_UNLOCK_LEVELS=Object.freeze({guild:1,foundry:15,moonfall:35,skyglass:60,summit:80});
  const LOOT_UNLOCK_LEVELS=Object.freeze({epic:12,elevated:30,apex:65});
  const SET_UNLOCK_LEVELS=Object.freeze({
    trailwarden:1,ironGuild:1,redBanner:5,moonlitScout:5,coinseeker:8,
    towerBulwark:12,stormrunner:12,hammerChoir:16,lanternGuard:16,grandWayfarer:20,
    crimsonOath:25,moonbreaker:30,kingsRoad:35,phantomCourt:40,starforge:45,grandVoyager:50,
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
    return XP_CURVE.base+step*XP_CURVE.linear+Math.floor(step*step/XP_CURVE.quadraticDivisor);
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
  function bossXpReward(riskTier){
    return 10*(1+Math.min(2,Math.floor(Math.max(0,finiteNumber(riskTier,0))/2)));
  }

  return {
    MAX_PLAYER_LEVEL,
    XP_CURVE,
    TOTAL_XP_TO_MAX,
    MAP_UNLOCK_LEVELS,
    LOOT_UNLOCK_LEVELS,
    SET_UNLOCK_LEVELS,
    clampLevel,
    xpRequiredForNextLevel,
    totalXpForLevel,
    applyXp,
    sanitizeProgress,
    xpProgress,
    playerStatsForLevel,
    enemyScaleForLevel,
    bossScaleForLevel,
    gearScaleForLevel,
    gearValueScaleForLevel,
    bossXpReward
  };
});
