const {test,expect}=require('@playwright/test');

async function boot(page){
  await page.addInitScript(()=>{if(!sessionStorage.getItem('xp-loot-test-boot')){localStorage.clear();sessionStorage.setItem('xp-loot-test-boot','1')}});
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest&&window.RiskLootProgression))).toBe(true)
}

test('Floor 4 and first-stage XP profiles stay inside their target bands',async({page})=>{
  await boot(page);
  const profiles=await page.evaluate(()=>{
    const p=window.RiskLootProgression;
    function result(normal,brutes,elites,boss){
      const xp=normal*p.getEnemyXpReward({enemyType:'rusher',stage:1,difficulty:0})+brutes*p.getEnemyXpReward({enemyType:'brute',stage:1,difficulty:0})+elites*p.getEnemyXpReward({enemyType:'rusher',elite:true,stage:1,difficulty:0})+(boss?p.getEnemyXpReward({enemyType:'boss',boss:true,stage:1,difficulty:0}):0);
      return{x:xp,level:p.applyXp(1,0,xp).level}
    }
    return{
      floor4:{weak:result(265,10,5,false),normal:result(430,20,10,false),excellent:result(690,35,13,false)},
      complete:{weak:result(430,20,10,true),normal:result(650,25,20,true),excellent:result(1350,45,20,true)}
    }
  });
  expect(profiles).toEqual({
    floor4:{weak:{x:300,level:3},normal:{x:500,level:4},excellent:{x:799,level:5}},
    complete:{weak:{x:1600,level:9},normal:{x:1860,level:10},excellent:{x:2600,level:12}}
  })
});

test('highest reached stage gates rarity even for a Level 100 farmer',async({page})=>{
  await boot(page);
  const stageOne=await page.evaluate(()=>window.__riskTest.lootProgression(100,5));
  expect(stageOne.context).toMatchObject({stage:1,effectiveLevel:24,stageCap:24});
  expect(stageOne.eligible).toEqual(['common','rare']);
  expect(stageOne.odds.epic).toBe(0);
  expect(stageOne.odds.legendary).toBe(0);
  const samples=await page.evaluate(()=>window.__riskTest.sampleBossLoot(100,5,300));
  expect(samples.every(rarity=>rarity==='common'||rarity==='rare')).toBe(true);

  const stageFour=await page.evaluate(()=>window.__riskTest.lootProgression(50,20));
  expect(stageFour.context).toMatchObject({stage:4,effectiveLevel:50,stageCap:100});
  expect(stageFour.eligible).toEqual(['rare','epic','legendary']);
  expect(stageFour.odds.legendary).toBeGreaterThan(0);
  const endgame=await page.evaluate(()=>window.__riskTest.lootProgression(100,20));
  expect(endgame.eligible).toEqual(['epic','legendary']);
  expect(endgame.odds.common).toBe(0);
  expect(endgame.odds.rare).toBe(0);
  expect(endgame.odds.epic+endgame.odds.legendary).toBeCloseTo(1,8)
});

test('save/load, extraction and Go Deeper preserve earned XP',async({page})=>{
  await boot(page);
  await page.evaluate(()=>window.__riskTest.setProgress(9,7));
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  let state=await page.evaluate(()=>window.__riskTest.progressionState().progress);
  expect(state).toMatchObject({level:9,current:7});

  await page.evaluate(()=>window.__riskTest.prepareXpTest(9,7));
  let transition=await page.evaluate(()=>window.__riskTest.progressionTransition('deeper'));
  expect(transition.after.total).toBe(transition.before.total);
  expect(transition.after.floor).toBe(6);

  await page.evaluate(()=>window.__riskTest.prepareXpTest(9,7));
  transition=await page.evaluate(()=>window.__riskTest.progressionTransition('extract'));
  expect(transition.after.total).toBe(transition.before.total);
  expect(transition.mode).toBe('base');

  await page.evaluate(()=>window.__riskTest.prepareXpTest(9,7));
  transition=await page.evaluate(()=>window.__riskTest.progressionTransition('death'));
  expect(transition.after.total).toBe(transition.before.total);
  expect(transition.mode).toBe('base')
});
