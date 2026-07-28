const {test,expect}=require('@playwright/test');

async function openPlaytest(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

async function advanceUntil(page,predicate,steps=28,step=.05){
  let state=null;
  for(let index=0;index<steps;index++){
    state=await page.evaluate(seconds=>window.__riskTest.advanceEnemy(seconds),step);
    if(predicate(state))return state;
  }
  return state;
}

test('enemy roles expose distinct threatening attack rhythms',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.setViewportSize({width:1280,height:800});
  await openPlaytest(page);

  let state=await page.evaluate(()=>window.__riskTest.fightEnemy('brute',380));
  expect(state.type).toBe('brute');
  expect(state.damage).toBeCloseTo(5.904,3);
  expect(state.charge).toBeGreaterThan(0);
  expect(state.lockDistance).toBeGreaterThan(360);
  state=await advanceUntil(page,state=>state.dashTime>0);
  expect(state.dashTime).toBeGreaterThan(0);
  expect(state.dashDistance).toBeGreaterThan(state.lockDistance);
  state=await advanceUntil(page,state=>state.playerInv>0);
  expect(state.playerInv).toBeGreaterThan(0);
  expect(state.recover).toBeGreaterThan(0);

  state=await page.evaluate(()=>window.__riskTest.fightEnemy('lancer',340));
  expect(state.charge).toBeGreaterThan(0);
  state=await advanceUntil(page,state=>state.dashTime>0);
  expect(state.dashTime).toBeGreaterThan(0);
  expect(state.dashDistance).toBeGreaterThan(360);

  state=await page.evaluate(()=>window.__riskTest.fightEnemy('rusher',165));
  expect(state.charge).toBeGreaterThan(0);
  state=await advanceUntil(page,state=>state.dashTime>0);
  expect(state.dashTime).toBeGreaterThan(0);

  state=await page.evaluate(()=>window.__riskTest.fightEnemy('shooter',280,1));
  expect(state.charge).toBeGreaterThan(0);
  state=await advanceUntil(page,state=>state.bullets===3);
  expect(state.bullets).toBe(3);

  expect(pageErrors).toEqual([]);
});
