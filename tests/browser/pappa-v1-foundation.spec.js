const {test,expect,devices}=require('@playwright/test');

const retiredAtlasNames=[
  'gear-items-atlas.png',
  'legendary-gear-atlas.png',
  'stormcaller-gear-icons-v1.png',
  'black-hole-gear-icons-v1.png',
  'lava-gear-icons-v1.png',
  'nature-gear-icons-v1.png'
];

async function verifyFoundation(page,testInfo,label){
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.addInitScript(()=>{
    localStorage.setItem('scrapbound_prototype_v1',JSON.stringify({
      version:14,
      level:70,
      scrap:99999,
      gear:[{uid:'retired',itemId:'stormrunner-hat',level:70}],
      equipped:{hat:'retired'}
    }));
  });
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);

  const foundation=await page.evaluate(()=>window.__riskTest.pappaV1Foundation());
  expect(foundation).toMatchObject({active:true,saveVersion:15,activeGear:7,activeSets:1});
  expect(foundation.archivedGear).toBeGreaterThan(0);
  expect(foundation.baseAsset).toContain('pappa-hammer-player.png?v=20260804-v1-foundation');

  const saved=await page.evaluate(()=>JSON.parse(localStorage.getItem('scrapbound_prototype_v1')));
  expect(saved.version).toBe(15);
  expect(saved.level).toBe(1);
  expect(saved.scrap).toBe(0);
  expect(saved.gear).toEqual([]);
  expect(Object.values(saved.equipped).every(value=>value===null)).toBe(true);

  const image=await page.evaluate(async()=>{
    const asset=new Image();
    asset.src='assets/pappa-hammer-player.png?v=20260804-v1-foundation';
    await asset.decode();
    return{width:asset.naturalWidth,height:asset.naturalHeight};
  });
  expect(image).toEqual({width:1402,height:1122});
  await expect(page.locator('#pappaHammerBaseSprite')).toBeVisible();
  const baseBodyLayer=page.locator('#pappaHammerBaseSprite [data-base-character-layer="baseBody"]');
  await expect(baseBodyLayer).toBeVisible();
  await expect(baseBodyLayer).not.toHaveCSS('background-image','none');

  const resources=await page.evaluate(()=>performance.getEntriesByType('resource').map(entry=>entry.name));
  expect(resources.some(url=>url.includes('pappa-hammer-player.png?v=20260804-v1-foundation'))).toBe(true);
  for(const retired of retiredAtlasNames)expect(resources.some(url=>url.includes(retired))).toBe(false);

  await page.locator('#gearLockerButton').click();
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  await expect(page.locator('#gearEmpty')).toBeVisible();
  await expect(page.locator('#gearEmpty')).toContainText('NEW PAPPA HAMMER GEAR IS BEING FORGED');
  await expect(page.locator('#gearGrid .gearBagSlot')).toHaveCount(0);
  await expect(page.locator('#gearLoadoutSlots .gearLoadoutSlot')).toHaveCount(10);
  await expect(page.locator('#gearLoadoutSlots .gearLoadoutSlot.filled')).toHaveCount(0);

  const state=await page.evaluate(()=>({
    inventory:window.__riskTest.equipmentInventory(),
    equipment:window.__riskTest.equipmentState(),
    overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
  }));
  expect(state.inventory).toEqual([]);
  expect(Object.values(state.equipment.equipped).every(value=>value===null)).toBe(true);
  expect(state.overflow).toBeLessThanOrEqual(1);
  expect(pageErrors).toEqual([]);

  await page.screenshot({path:testInfo.outputPath(`pappa-v1-${label}.png`),animations:'disabled'});
  await page.locator('#closeGear').click();
  await expect(page.locator('#gearOverlay')).not.toHaveClass(/show/);
  await page.evaluate(()=>window.__riskTest.openMap('guild'));
  await expect(page.locator('#expeditionView')).toHaveClass(/active/);
  await expect(page.locator('#world')).toBeVisible();
  const gameplay=await page.evaluate(()=>(
    {equipment:window.__riskTest.equipmentState(),canvas:{width:document.querySelector('#world').width,height:document.querySelector('#world').height}}
  ));
  expect(Object.values(gameplay.equipment.equipped).every(value=>value===null)).toBe(true);
  expect(gameplay.canvas.width).toBeGreaterThan(0);
  expect(gameplay.canvas.height).toBeGreaterThan(0);
  await page.screenshot({path:testInfo.outputPath(`pappa-v1-${label}-gameplay.png`),animations:'disabled'});
}

test('Pappa V1 foundation is clean on desktop',async({browser},testInfo)=>{
  const context=await browser.newContext({viewport:{width:1366,height:768}});
  const page=await context.newPage();
  await verifyFoundation(page,testInfo,'desktop');
  await context.close();
});

test('Pappa V1 foundation is clean on iPhone portrait',async({browser},testInfo)=>{
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await verifyFoundation(page,testInfo,'iphone');
  await context.close();
});
