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
    return{viewport,hud:rect('pappaCombatHud'),xp:rect('xpHud'),extract:rect('extractButton'),metrics:document.querySelector('.runMetrics').getBoundingClientRect().toJSON()}
  })
}

test('premium combat HUD stays readable and live on iPhone',async({page},testInfo)=>{
  await bootCombat(page,{width:390,height:844},true);
  await expect(page.locator('#combatSetName')).toHaveText('LAVA SET');
  await expect(page.locator('#combatSetProgress')).toHaveText('5/5');
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.gearVisualState().usesProductionSkin)).toBe(true);
  await expect(page.locator('#combatPortraitSprite')).toHaveCSS('background-image',/^(?!none)/);
  const geometry=await hudGeometry(page);
  for(const box of [geometry.hud,geometry.xp,geometry.extract]){
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.right).toBeLessThanOrEqual(geometry.viewport.width);
  }
  expect(geometry.xp.bottom).toBeLessThanOrEqual(geometry.hud.bottom);
  await page.screenshot({path:testInfo.outputPath('combat-hud-iphone.png'),fullPage:true});
});

test('premium combat HUD uses the desktop width without covering controls',async({page},testInfo)=>{
  await bootCombat(page,{width:1440,height:900},false);
  await expect(page.locator('#combatSetName')).toHaveText('FIELD LOADOUT');
  const geometry=await hudGeometry(page);
  expect(geometry.hud.right).toBeLessThan(geometry.extract.x);
  expect(geometry.metrics.x).toBeGreaterThanOrEqual(geometry.hud.right);
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
  expect(layout.metrics.top).toBeGreaterThanOrEqual(layout.hud.bottom-1);
  expect(layout.extract.left).toBeGreaterThanOrEqual(layout.hud.right-1);
  await page.screenshot({path:testInfo.outputPath('combat-hud-tablet.png'),fullPage:true});
});
