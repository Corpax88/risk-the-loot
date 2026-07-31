const {test,expect,devices}=require('@playwright/test');
const path=require('path');

async function seedGear(page){
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest&&window.InventoryV2))).toBe(true);
  await page.evaluate(()=>{window.__riskTest.previewGearSet('hammerChoir');window.__riskTest.previewGearSet('fatebound')});
  await page.locator('#closeGear').click();
}

test('Inventory V1 and isolated Inventory V2 coexist on desktop',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await seedGear(page);

  await page.locator('#gearLockerButton').click();
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  await expect(page.locator('#inventoryV2Overlay')).not.toHaveClass(/show/);
  await page.locator('#closeGear').click();

  await page.locator('#inventoryV2Button').click();
  await expect(page.locator('#inventoryV2Overlay')).toHaveClass(/show/);
  await expect(page.locator('#gearOverlay')).not.toHaveClass(/show/);
  await expect(page.locator('#inventoryV2Grid .inventoryV2Card')).toHaveCount(10);
  await expect(page.locator('#inventoryV2Hero')).toHaveCSS('background-image',/url/);

  const candidate=await page.evaluate(()=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>!item.equipped));
  await page.locator('.inventoryV2Card[data-uid="'+candidate.uid+'"]').click();
  await expect(page.locator('#inventoryV2Detail h2')).toHaveText(candidate.name);
  await page.locator('#inventoryV2Equip').click();
  await expect.poll(()=>page.evaluate(uid=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>item.uid===uid).equipped,candidate.uid)).toBe(true);
  await page.screenshot({path:path.join('docs','screenshots','inventory-v2','desktop.png')});

  await page.locator('#inventoryV2OpenLegacy').click();
  await expect(page.locator('#inventoryV2Overlay')).not.toHaveClass(/show/);
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  await expect(page.locator('#gearGrid [data-item="'+candidate.uid+'"]').first()).toHaveClass(/equipped/);
  await page.screenshot({path:path.join('docs','screenshots','inventory-v2','desktop-v1-control.png')});
});

test('Inventory V2 keeps character fixed while its mobile collection scrolls',async({browser})=>{
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await seedGear(page);
  await page.locator('#inventoryV2Button').tap();
  await expect(page.locator('#inventoryV2Overlay')).toHaveClass(/show/);

  const layout=await page.evaluate(()=>{
    const workspace=document.querySelector('.inventoryV2Workspace').getBoundingClientRect();
    const character=document.querySelector('.inventoryV2Character').getBoundingClientRect();
    const grid=document.querySelector('#inventoryV2Grid');
    return{viewport:document.documentElement.clientWidth,documentOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,workspace:{top:workspace.top,bottom:workspace.bottom},character:{top:character.top,bottom:character.bottom},gridOverflow:grid.scrollHeight>grid.clientHeight,gridTouch:getComputedStyle(grid).overflowY}
  });
  expect(layout.documentOverflow).toBeLessThanOrEqual(1);
  expect(layout.character.top).toBeGreaterThanOrEqual(layout.workspace.top);
  expect(layout.character.bottom).toBeLessThan(layout.workspace.bottom);
  expect(layout.gridTouch).toBe('auto');

  const candidate=await page.evaluate(()=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>!item.equipped));
  await page.locator('.inventoryV2Card[data-uid="'+candidate.uid+'"]').tap();
  await expect(page.locator('#inventoryV2Detail h2')).toHaveText(candidate.name);
  await page.locator('#inventoryV2Equip').tap();
  await expect.poll(()=>page.evaluate(uid=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>item.uid===uid).equipped,candidate.uid)).toBe(true);
  await page.screenshot({path:path.join('docs','screenshots','inventory-v2','mobile.png')});
  await context.close();
});
