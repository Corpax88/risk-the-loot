const {test,expect,devices}=require('@playwright/test');

async function openSet(page,setId){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(id=>window.__riskTest.previewGearSet(id),setId);
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  await expect(page.locator('#gearCharacterStage .gearCharacterHero')).toHaveCount(1);
  await page.waitForTimeout(180);
}

async function cameraState(page){
  return page.evaluate(()=>{
    const box=selector=>{
      const rect=document.querySelector(selector).getBoundingClientRect();
      return {left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom,width:rect.width,height:rect.height};
    };
    const camera=document.querySelector('#gearPanel .gearCharacterCamera');
    const matrix=new DOMMatrixReadOnly(getComputedStyle(camera).transform);
    return{
      cameraCount:document.querySelectorAll('#gearPanel .gearCharacterCamera').length,
      heroCount:document.querySelectorAll('#gearCharacterStage .gearCharacterHero').length,
      heroParent:document.querySelector('#gearCharacterStage .gearCharacterHero').parentElement.className,
      zoom:matrix.a,
      stage:box('#gearCharacterStage'),
      halo:box('#gearCharacterStage .gearCharacterHalo'),
      hero:box('#gearCharacterStage .gearCharacterHero'),
      horizontalOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
    };
  });
}

for(const setup of [
  {name:'desktop',context:{viewport:{width:1366,height:768}}},
  {name:'iphone',context:{...devices['iPhone 13']}}
]){
  test(`${setup.name} inventory camera enlarges full sets without changing the sprite pipeline`,async({browser},testInfo)=>{
    test.setTimeout(45000);
    const context=await browser.newContext(setup.context);
    const page=await context.newPage();
    for(const setId of ['hammerChoir','blackHole','stormrunner','lavaSet','natureSet']){
      await openSet(page,setId);
      const state=await cameraState(page);
      expect(state.cameraCount).toBe(1);
      expect(state.heroCount).toBe(1);
      expect(state.heroParent).toContain('gearCharacterCamera');
      expect(state.zoom).toBeGreaterThanOrEqual(1.1);
      expect(state.zoom).toBeLessThanOrEqual(1.15);
      expect(state.hero.width).toBeGreaterThan(state.halo.width*.9);
      expect(state.hero.bottom).toBeLessThanOrEqual(state.stage.bottom+1);
      expect(state.horizontalOverflow).toBeLessThanOrEqual(1);
      await page.locator('#gearCharacterStage').screenshot({path:testInfo.outputPath(`${setId}-${setup.name}.png`),animations:'disabled'});
      await page.locator('#closeGear').click();
    }
    await context.close();
  });
}

test('mixed production gear keeps the same camera and one aligned hero layer',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  const visual=await page.evaluate(()=>window.__riskTest.previewGearItems([
    'stormrunner-hat','lavaSet-scarf','natureSet-coat','blackHole-hammer','hammerChoir-boots'
  ]));
  expect(visual.setId).toBe(null);
  const state=await cameraState(page);
  expect(state.zoom).toBeGreaterThanOrEqual(1.1);
  expect(state.heroCount).toBe(1);
  await page.locator('#gearCharacterStage').screenshot({path:testInfo.outputPath('mixed-large-weapon-iphone.png'),animations:'disabled'});
});
