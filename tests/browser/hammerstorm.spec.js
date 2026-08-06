const {test,expect}=require('@playwright/test');

async function openPlaytest(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

test('Hammerstorm dives into a pack without inheriting retired-set lifesteal',async({page})=>{
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

  state=await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(24,{durable:true,hurt:true}));
  const woundedHp=state.player.hp;
  expect((await page.evaluate(()=>window.__riskTest.triggerHammerstorm())).started).toBe(true);
  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(1.6));
  expect(state.spin.hits).toBeGreaterThan(24);
  expect(state.spin.heal).toBe(0);
  expect(state.player.hp).toBeLessThanOrEqual(woundedHp);
  expect(state.player.hp).toBeLessThanOrEqual(state.player.maxHp);
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

test('manual movement owns Hammerstorm until input is released',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.setViewportSize({width:390,height:844});
  await openPlaytest(page);

  let state=await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(24,{durable:true}));
  const startX=state.player.x;
  await page.keyboard.down('ArrowLeft');
  expect((await page.evaluate(()=>window.__riskTest.triggerHammerstorm())).started).toBe(true);

  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.12));
  expect(state.player.x).toBeLessThan(startX-3);
  expect(state.spin.manual).toBe(true);
  expect(state.spin.time).toBeGreaterThan(0);
  expect(state.spin.autoRemaining).toBeGreaterThan(0);
  const manualX=state.player.x;
  const hitsWhileSteering=state.spin.hits;

  await page.keyboard.up('ArrowLeft');
  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.12));
  expect(state.player.x).toBeGreaterThan(manualX);
  expect(state.spin.manual).toBe(false);
  expect(state.spin.autoRemaining).toBeLessThan(.18);
  expect(state.spin.hits).toBeGreaterThanOrEqual(hitsWhileSteering);

  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.2));
  expect(state.spin.autoRemaining).toBe(0);
  expect(Number.isFinite(state.player.x)).toBe(true);
  expect(Number.isFinite(state.player.y)).toBe(true);
  await page.evaluate(()=>window.__riskTest.releaseHammerstorm());
  expect(pageErrors).toEqual([]);
});

test('Hammerstorm dead-zone ignores tiny joystick drift',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await openPlaytest(page);
  let state=await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(20,{durable:true}));
  const startX=state.player.x;
  await page.evaluate(()=>window.__riskTest.setMovementInput(-.08,0));
  expect((await page.evaluate(()=>window.__riskTest.triggerHammerstorm())).started).toBe(true);
  state=await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.09));
  expect(state.spin.manual).toBe(false);
  expect(state.spin.leap).toBeGreaterThan(0);
  expect(state.player.x).toBeGreaterThan(startX);
  await page.evaluate(()=>{window.__riskTest.clearMovementInput();window.__riskTest.releaseHammerstorm()});
});

test('touch Hammerstorm help appears once for five seconds and stays seen after reload',async({page})=>{
  test.setTimeout(25000);
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
