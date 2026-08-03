const {test,expect}=require('@playwright/test');

async function bootCombat(page,viewport,fullLava){
  await page.setViewportSize(viewport);
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(options=>window.__riskTest.spawnHammerstormPack(18,options),fullLava?{fullLava:true,durable:true}:{durable:true});
  await expect(page.locator('#pappaCombatHud')).toBeVisible();
}

async function hudGeometry(page){
  return page.evaluate(()=>{
    const viewport={width:innerWidth,height:innerHeight};
    const rect=id=>{const box=document.getElementById(id).getBoundingClientRect();return{x:box.x,y:box.y,width:box.width,height:box.height,right:box.right,bottom:box.bottom}};
    return{viewport,hud:rect('pappaCombatHud'),hp:document.querySelector('#pappaCombatHud .healthBlock').getBoundingClientRect().toJSON(),xp:rect('xpHud'),extract:rect('extractButton'),spin:rect('spinButton'),dash:rect('dashButton'),skills:rect('futureSkillSlots'),map:rect('miniMap'),metrics:document.querySelector('.runMetrics').getBoundingClientRect().toJSON()}
  })
}

function overlaps(a,b){return a.x<b.right&&a.right>b.x&&a.y<b.bottom&&a.bottom>b.y}

test('premium combat HUD stays readable and live on iPhone',async({page},testInfo)=>{
  await bootCombat(page,{width:390,height:844},true);
  await expect(page.locator('#combatSetName')).toHaveText('LAVA SET');
  await expect(page.locator('#combatSetProgress')).toHaveText('5/5');
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.gearVisualState().usesModularLayers)).toBe(true);
  await expect(page.locator('#combatPortraitSprite')).toHaveCSS('background-image',/^(?!none)/);
  const geometry=await hudGeometry(page);
  for(const box of [geometry.hud,geometry.xp,geometry.extract]){
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(geometry.viewport.width);
  }
  expect(geometry.hud.y).toBeGreaterThan(geometry.viewport.height*.72);
  expect(geometry.hud.x).toBeLessThan(12);
  expect(geometry.hp.y).toBeLessThan(geometry.xp.y);
  expect(overlaps(geometry.hud,geometry.skills)).toBe(false);
  expect(overlaps(geometry.map,geometry.spin)).toBe(false);
  await expect(page.locator('#futureSkillSlots button')).toHaveCount(3);
  for(const slot of await page.locator('#futureSkillSlots button').all())await expect(slot).toBeDisabled();
  await page.screenshot({path:testInfo.outputPath('combat-hud-iphone.png'),fullPage:true});
});

test('premium combat HUD uses the desktop width without covering controls',async({page},testInfo)=>{
  await bootCombat(page,{width:1440,height:900},false);
  await expect(page.locator('#combatSetName')).toHaveText('FIELD LOADOUT');
  const geometry=await hudGeometry(page);
  expect(geometry.hud.y).toBeGreaterThan(geometry.viewport.height*.78);
  expect(geometry.metrics.y).toBeLessThan(80);
  expect(geometry.metrics.x).toBeGreaterThan(geometry.viewport.width*.5);
  expect(overlaps(geometry.hud,geometry.spin)).toBe(false);
  await page.screenshot({path:testInfo.outputPath('combat-hud-desktop.png'),fullPage:true});
});

test('premium combat HUD stacks cleanly on tablet and mobile landscape',async({page},testInfo)=>{
  await bootCombat(page,{width:820,height:1180},false);
  const layout=await page.evaluate(()=>{
    const hud=document.querySelector('#pappaCombatHud').getBoundingClientRect();
    const metrics=document.querySelector('.runMetrics').getBoundingClientRect();
    const extract=document.querySelector('#extractButton').getBoundingClientRect();
    return {hud,metrics,extract,overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth};
  });
  expect(layout.overflow).toBe(0);
  expect(layout.hud.top).toBeGreaterThan(900);
  expect(layout.metrics.top).toBeLessThan(70);
  expect(layout.extract.left).toBeGreaterThan(layout.metrics.left);
  await page.screenshot({path:testInfo.outputPath('combat-hud-tablet.png'),fullPage:true});
});

test('floating joystick appears at first touch, follows the finger and releases cleanly',async({page},testInfo)=>{
  await bootCombat(page,{width:390,height:844},false);
  const canvas=page.locator('#world');
  await canvas.dispatchEvent('pointerdown',{pointerId:81,pointerType:'touch',isPrimary:true,button:0,buttons:1,clientX:82,clientY:410});
  await expect(page.locator('#touchControls')).toHaveClass(/active/);
  let state=await page.evaluate(()=>window.__riskTest.movementInputState());
  expect(state.active).toBe(true);expect(state.baseX).toBe(82);expect(state.baseY).toBe(410);
  await canvas.dispatchEvent('pointermove',{pointerId:81,pointerType:'touch',isPrimary:true,button:0,buttons:1,clientX:172,clientY:450});
  state=await page.evaluate(()=>window.__riskTest.movementInputState());
  expect(state.moved).toBe(true);expect(state.x).toBeGreaterThan(.7);expect(state.y).toBeGreaterThan(.2);expect(state.baseX).toBeGreaterThan(82);
  await page.screenshot({path:testInfo.outputPath('floating-joystick-active.png'),fullPage:true});
  await page.locator('#spinButton').dispatchEvent('pointerdown',{pointerId:82,pointerType:'touch',isPrimary:false,button:0,buttons:1,clientX:245,clientY:730});
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.skillGestureState().spinHeld)).toBe(true);
  expect((await page.evaluate(()=>window.__riskTest.movementInputState())).active).toBe(true);
  await page.locator('#spinButton').dispatchEvent('pointerup',{pointerId:82,pointerType:'touch',isPrimary:false,button:0,buttons:0,clientX:245,clientY:730});
  await canvas.dispatchEvent('pointerup',{pointerId:81,pointerType:'touch',isPrimary:true,button:0,buttons:0,clientX:172,clientY:450});
  state=await page.evaluate(()=>window.__riskTest.movementInputState());
  expect(state).toMatchObject({active:false,x:0,y:0,visible:false});
  await expect(page.locator('#touchControls')).not.toHaveClass(/active/);
});

test('combat edge UI remains separated in iPhone landscape',async({page},testInfo)=>{
  await bootCombat(page,{width:844,height:390},false);
  const geometry=await hudGeometry(page);
  expect(geometry.hud.x).toBeGreaterThanOrEqual(0);expect(geometry.hud.bottom).toBeLessThanOrEqual(390);
  expect(overlaps(geometry.hud,geometry.skills)).toBe(false);
  expect(overlaps(geometry.hud,geometry.spin)).toBe(false);
  expect(overlaps(geometry.map,geometry.spin)).toBe(false);
  await page.screenshot({path:testInfo.outputPath('combat-hud-iphone-landscape.png'),fullPage:true});
});
