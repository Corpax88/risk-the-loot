const {test,expect}=require('@playwright/test');

async function prepare(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(24,{durable:true}));
  await page.waitForTimeout(80);
  return {
    spin:await page.locator('#spinButton').boundingBox(),
    dash:await page.locator('#dashButton').boundingBox()
  };
}

function point(box){return{x:box.x+box.width/2,y:box.y+box.height/2}}

async function touch(page,target,type,pointerId,coords){
  await target.dispatchEvent(type,{
    pointerId,
    pointerType:'touch',
    isPrimary:true,
    button:0,
    buttons:type==='pointerup'||type==='pointercancel'?0:1,
    clientX:coords.x,
    clientY:coords.y,
    pressure:type==='pointerup'||type==='pointercancel'?0:.5
  });
}

test.use({viewport:{width:390,height:844},hasTouch:true});

test('slide from Spin to Dash preserves one continuous Hammerstorm',async({page})=>{
  const boxes=await prepare(page),spinButton=page.locator('#spinButton'),spinPoint=point(boxes.spin),dashPoint=point(boxes.dash);
  await touch(page,spinButton,'pointerdown',201,spinPoint);
  await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.45));
  let before=await page.evaluate(()=>window.__riskTest.hammerstormState());
  expect(before.spin.held).toBe(true);
  expect(before.spin.time).toBeGreaterThan(0);

  await touch(page,spinButton,'pointermove',201,dashPoint);
  let during=await page.evaluate(()=>window.__riskTest.skillGestureState());
  expect(during.dashAreaEntered).toBe(true);
  expect(during.dashTime).toBeGreaterThan(0);
  expect(during.spinHeld).toBe(true);

  await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.12));
  const afterDash=await page.evaluate(()=>window.__riskTest.hammerstormState());
  expect(afterDash.spin.held).toBe(true);
  expect(afterDash.spin.time).toBeGreaterThan(before.spin.time);

  await touch(page,spinButton,'pointerup',201,dashPoint);
  await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.35));
  const released=await page.evaluate(()=>({spin:window.__riskTest.hammerstormState(),gesture:window.__riskTest.skillGestureState()}));
  expect(released.gesture.pointerId).toBeNull();
  expect(released.gesture.spinHeld).toBe(false);
  expect(released.spin.spin.time).toBe(0);
});

test('Dash fires once per Dash-area entry and still respects cooldown',async({page})=>{
  const boxes=await prepare(page),spinButton=page.locator('#spinButton'),spinPoint=point(boxes.spin),dashPoint=point(boxes.dash);
  await touch(page,spinButton,'pointerdown',202,spinPoint);
  await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.3));
  await touch(page,spinButton,'pointermove',202,dashPoint);
  const first=await page.evaluate(()=>window.__riskTest.skillGestureState());

  await touch(page,spinButton,'pointermove',202,dashPoint);
  await page.evaluate(()=>window.__riskTest.advanceHammerstorm(.04));
  const heldInside=await page.evaluate(()=>window.__riskTest.skillGestureState());
  expect(heldInside.dashCd).toBeLessThan(first.dashCd);
  expect(heldInside.dashTime).toBeLessThan(first.dashTime);

  await touch(page,spinButton,'pointermove',202,spinPoint);
  expect((await page.evaluate(()=>window.__riskTest.skillGestureState())).dashAreaEntered).toBe(false);
  await touch(page,spinButton,'pointermove',202,dashPoint);
  const cooldownEntry=await page.evaluate(()=>window.__riskTest.skillGestureState());
  expect(cooldownEntry.dashAreaEntered).toBe(true);
  expect(cooldownEntry.dashCd).toBeLessThan(first.dashCd);
  await touch(page,spinButton,'pointerup',202,dashPoint);
});

test('cancel, pause and blur cannot leave Spin stuck',async({page})=>{
  const boxes=await prepare(page),spinButton=page.locator('#spinButton'),spinPoint=point(boxes.spin);
  await touch(page,spinButton,'pointerdown',203,spinPoint);
  await touch(page,spinButton,'pointercancel',203,spinPoint);
  expect(await page.evaluate(()=>window.__riskTest.skillGestureState())).toMatchObject({pointerId:null,spinHeld:false});

  await touch(page,spinButton,'pointerdown',204,spinPoint);
  await page.locator('#settingsButton').click();
  expect(await page.evaluate(()=>window.__riskTest.skillGestureState())).toMatchObject({pointerId:null,spinHeld:false,paused:true});
  await page.locator('#closeSettings').click();

  await touch(page,spinButton,'pointerdown',205,spinPoint);
  await page.evaluate(()=>window.dispatchEvent(new Event('blur')));
  expect(await page.evaluate(()=>window.__riskTest.skillGestureState())).toMatchObject({pointerId:null,spinHeld:false});
});

test('direct Dash remains independent of the Spin gesture',async({page})=>{
  const boxes=await prepare(page),dashButton=page.locator('#dashButton'),dashPoint=point(boxes.dash);
  await touch(page,dashButton,'pointerdown',206,dashPoint);
  const state=await page.evaluate(()=>window.__riskTest.skillGestureState());
  expect(state.pointerId).toBeNull();
  expect(state.spinHeld).toBe(false);
  expect(state.dashTime).toBeGreaterThan(0);
});
