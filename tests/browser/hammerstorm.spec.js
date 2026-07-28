const {test,expect}=require('@playwright/test');

async function openPlaytest(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

test('Hammerstorm dives into a pack, launches enemies and rewards the full surround set',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.setViewportSize({width:1280,height:800});
  await openPlaytest(page);

  let state=await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(20,{fragile:true}));
  expect(state.living).toBe(20);
  const startX=state.player.x;
  const triggered=await page.evaluate(()=>window.__riskTest.triggerHammerstorm());
  expect(triggered.started).toBe(true);
  expect(triggered.state.spin.pack).toBe(20);
  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.43));
  expect(state.player.x).toBeGreaterThan(startX+70);
  expect(state.effects).toContain('spinArc');
  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.27));
  expect(state.spin.hits).toBeGreaterThanOrEqual(16);
  expect(state.spin.kills).toBeGreaterThanOrEqual(16);
  expect(state.launched).toBeGreaterThanOrEqual(16);
  await page.evaluate(()=>window.__riskTest.releaseHammerstorm());
  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.3));
  expect(state.spin.cd).toBe(0);
  expect(state.spin.time).toBe(0);
  expect(state.playerProjectiles).toBe(0);
  expect((await page.evaluate(()=>window.__riskTest.triggerHammerstorm())).started).toBe(true);

  state=await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(24,{durable:true,hurt:true,fullRiskreaver:true}));
  const woundedHp=state.player.hp;
  const maxHeal=state.player.maxHp*.12;
  expect((await page.evaluate(()=>window.__riskTest.triggerHammerstorm())).started).toBe(true);
  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(1.6));
  expect(state.spin.hits).toBeGreaterThan(24);
  expect(state.spin.heal).toBeGreaterThan(0);
  expect(state.spin.heal).toBeLessThanOrEqual(maxHeal+.01);
  expect(state.player.hp).toBeGreaterThan(woundedHp);
  expect(state.player.hp).toBeLessThanOrEqual(woundedHp+maxHeal+.01);
  await page.evaluate(()=>window.__riskTest.releaseHammerstorm());
  expect(pageErrors).toEqual([]);
});

test('Dash carries an active Hammerstorm and its vortex without duplicate activation',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.setViewportSize({width:1280,height:800});
  await openPlaytest(page);
  await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(28,{durable:true}));

  await page.keyboard.down('q');
  let state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.3));
  expect(state.spin.time).toBeGreaterThan(0);
  const beforeX=state.player.x;
  const beforeHits=state.spin.hits;
  const beforeSpinTime=state.spin.time;

  await page.keyboard.press('Space');
  state=await page.evaluate(()=>window.__riskTest.hammerstormState());
  expect(state.player.dashTime).toBeGreaterThan(0);
  expect(state.spin.time).toBeGreaterThan(0);

  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.08));
  expect(state.player.x).toBeGreaterThan(beforeX+25);
  expect(state.spin.time).toBeGreaterThan(beforeSpinTime);
  expect(state.spin.vortex.x).toBe(state.player.x);
  expect(state.spin.vortex.y).toBe(state.player.y);
  expect(state.spin.hits-beforeHits).toBeLessThanOrEqual(28);

  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.18));
  expect(state.player.dashTime).toBe(0);
  expect(state.spin.time).toBeGreaterThan(beforeSpinTime+.1);
  expect(state.spin.held).toBe(true);
  expect(state.spin.vortex.x).toBe(state.player.x);
  expect(state.spin.vortex.y).toBe(state.player.y);
  await page.keyboard.up('q');
  await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.25));
  expect((await page.evaluate(()=>window.__riskTest.hammerstormState())).spin.time).toBe(0);
  expect(pageErrors).toEqual([]);
});

test('touch Hammerstorm help appears once for five seconds and stays seen after reload',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?playwright');
  await page.evaluate(()=>localStorage.clear());
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(20,{durable:true}));

  await page.locator('#spinButton').dispatchEvent('pointerdown',{pointerId:41,pointerType:'touch',clientX:140,clientY:760,isPrimary:true});
  let help=await page.evaluate(()=>window.__riskTest.hammerstormHelpState());
  expect(help).toMatchObject({seen:true,visible:true,title:'Hold Hammerstorm'});
  await page.locator('#dashButton').dispatchEvent('pointerdown',{pointerId:42,pointerType:'touch',clientX:330,clientY:760,isPrimary:true});
  let state=await page.evaluate(()=>window.__riskTest.hammerstormState());
  expect(state.player.dashTime).toBeGreaterThan(0);
  expect(state.spin.held).toBe(true);
  await page.waitForTimeout(5200);
  expect((await page.evaluate(()=>window.__riskTest.hammerstormHelpState())).visible).toBe(false);

  await page.locator('#spinButton').dispatchEvent('pointerup',{pointerId:41,pointerType:'touch',isPrimary:true});
  await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.25));
  await page.locator('#spinButton').dispatchEvent('pointerdown',{pointerId:43,pointerType:'touch',clientX:140,clientY:760,isPrimary:true});
  await page.waitForTimeout(650);
  expect((await page.evaluate(()=>window.__riskTest.hammerstormHelpState())).visible).toBe(false);
  await page.locator('#spinButton').dispatchEvent('pointerup',{pointerId:43,pointerType:'touch',isPrimary:true});

  await page.reload();
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(20,{durable:true}));
  await page.locator('#spinButton').dispatchEvent('pointerdown',{pointerId:44,pointerType:'touch',clientX:140,clientY:760,isPrimary:true});
  await page.waitForTimeout(650);
  help=await page.evaluate(()=>window.__riskTest.hammerstormHelpState());
  expect(help.seen).toBe(true);
  expect(help.visible).toBe(false);
  expect(pageErrors).toEqual([]);
});
