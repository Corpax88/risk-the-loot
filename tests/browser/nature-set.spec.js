const {test,expect}=require('@playwright/test');

async function waitForRiskTest(page){
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true)
}

async function advanceUntil(page,predicate,limit=40){
  let state=null;
  for(let index=0;index<limit;index++){
    state=await page.evaluate(()=>window.__riskTest.advanceNature(.1));
    if(predicate(state))return state
  }
  return state
}

const PACK=[
  {id:'large-a',x:250,y:-75},{id:'large-b',x:275,y:-45},{id:'large-c',x:285,y:0},
  {id:'large-d',x:270,y:48},{id:'large-e',x:235,y:78},{id:'large-f',x:220,y:15},
  {id:'small-a',x:-270,y:-25},{id:'small-b',x:-245,y:35}
];

test('Ancient Pact requires 5/5 and the Ent controls the largest pack',async({page})=>{
  await page.goto('/?playwright');
  await waitForRiskTest(page);

  let state=await page.evaluate(points=>window.__riskTest.prepareNature(points,4),PACK);
  expect(state.enabled).toBe(false);
  expect(state.tier).toBe(0);
  state=await page.evaluate(()=>window.__riskTest.advanceNature(1));
  expect(state.active).toBe(false);
  expect(state.slams).toBe(0);

  await page.evaluate(points=>window.__riskTest.prepareNature(points,5),PACK);
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.natureState().assets)).toBe(true);
  state=await advanceUntil(page,current=>current.slams===1&&current.roots>0);
  expect(state.enabled).toBe(true);
  expect(state.tier).toBe(2);
  expect(state.setId).toBe('natureSet');
  expect(state.ent.immortal).toBe(true);
  expect(state.grabs).toBe(6);
  expect(state.player.focus).toBe(true);
  expect(state.enemies.filter(enemy=>enemy.id.startsWith('large-')&&enemy.held)).toHaveLength(6);
  expect(state.enemies.filter(enemy=>enemy.id.startsWith('small-')&&enemy.held)).toHaveLength(0);
});

test('bosses are staggered but never rooted and the slam keeps its long cooldown',async({page})=>{
  await page.goto('/?playwright');
  await waitForRiskTest(page);
  await page.evaluate(()=>window.__riskTest.prepareNature([{id:'boss',x:245,y:0,boss:true,hp:10000000}],5));
  let state=await advanceUntil(page,current=>current.bossStaggers>0);
  const boss=state.enemies.find(enemy=>enemy.id==='boss');
  expect(state.slams).toBe(1);
  expect(state.grabs).toBe(0);
  expect(state.bossStaggers).toBe(1);
  expect(boss.held).toBe(false);
  expect(boss.hp).toBeLessThan(10000000);
  state=await page.evaluate(()=>window.__riskTest.advanceNature(4));
  expect(state.slams).toBe(1);
});

test('unequipping releases roots and Nature combat survives missing art',async({page})=>{
  await page.route('**/nature-*-v1.png',route=>route.abort());
  await page.route('**/ancient-ent-v1.png',route=>route.abort());
  await page.goto('/?playwright');
  await waitForRiskTest(page);
  await page.evaluate(points=>window.__riskTest.prepareNature(points,5),PACK);
  let state=await advanceUntil(page,current=>current.roots>0);
  expect(state.assets).toBe(false);
  expect(state.grabs).toBe(6);
  state=await page.evaluate(()=>window.__riskTest.unequipNaturePiece('hat'));
  expect(state.enabled).toBe(false);
  expect(state.active).toBe(false);
  expect(state.roots).toBe(0);
  expect(state.enemies.some(enemy=>enemy.held)).toBe(false);
});

test('Nature transformation, Ent and Rootwhip remain readable on mobile',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?playwright');
  await waitForRiskTest(page);
  await page.evaluate(points=>window.__riskTest.prepareNature(points,5),PACK);
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.natureState().assets)).toBe(true);
  const state=await advanceUntil(page,current=>current.roots>0);
  expect(state.grabs).toBe(6);
  await page.waitForTimeout(80);
  await page.locator('#world').screenshot({path:testInfo.outputPath('nature-set-mobile-combat.png')});
});

test('Nature gear and full-figure transformation fit the mobile Armory',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await waitForRiskTest(page);
  const state=await page.evaluate(()=>window.__riskTest.previewGearSet('natureSet'));
  expect(state.setId).toBe('natureSet');
  expect(state.usesProductionSkin).toBe(false);
  expect(state.usesModularLayers).toBe(true);
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  await expect(page.locator('#gearGrid .natureSprite')).toHaveCount(5);
  await expect(page.locator('.gearCharacterHero')).toHaveAttribute('data-gear-visual-key',/natureSet/);
  await page.waitForTimeout(120);
  await page.locator('#gearPanel').screenshot({path:testInfo.outputPath('nature-set-mobile-armory.png')});
});
