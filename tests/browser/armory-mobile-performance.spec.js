const {test,expect,devices}=require('@playwright/test');
const path=require('path');

async function ready(page){
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

async function openPopulatedArmory(page){
  await ready(page);
  await page.evaluate(()=>{
    window.__riskTest.previewGearSet('hammerChoir');
    window.__riskTest.previewGearSet('fatebound');
    window.__riskTest.resetEquipmentRenderMetrics();
  });
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
}

async function findUnequipped(page,slot){
  return page.evaluate(slot=>window.__riskTest.equipmentInventory().find(item=>item.slot===slot&&!item.equipped),slot);
}

test('mobile Armory keeps Pappa and slots fixed while only inventory scrolls',async({browser})=>{
  test.setTimeout(45000);
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await openPopulatedArmory(page);

  const stage=page.locator('#gearCharacterStage');
  const browserPanel=page.locator('.gearBagBrowser');
  const before=await stage.boundingBox();
  expect(before).toBeTruthy();
  const scroll=await browserPanel.evaluate(element=>{
    const panel=document.querySelector('#gearPanel');
    const startPanel=panel.scrollTop;
    element.scrollTop=element.scrollHeight;
    return{
      inventoryTop:element.scrollTop,
      inventoryRange:element.scrollHeight-element.clientHeight,
      panelTop:panel.scrollTop,
      panelStart:startPanel,
      gridOverflow:getComputedStyle(document.querySelector('#gearGrid')).overflowY,
      panelOverflow:getComputedStyle(panel).overflowY
    };
  });
  expect(scroll.inventoryRange).toBeGreaterThan(0);
  expect(scroll.inventoryTop).toBeGreaterThan(0);
  expect(scroll.panelTop).toBe(scroll.panelStart);
  expect(scroll.gridOverflow).toBe('visible');
  expect(scroll.panelOverflow).toBe('hidden');
  const after=await stage.boundingBox();
  expect(Math.abs(after.y-before.y)).toBeLessThanOrEqual(1);

  const item=await findUnequipped(page,'boots');
  expect(item).toBeTruthy();
  const card=page.locator(`#gearGrid [data-item="${item.uid}"]`);
  await card.scrollIntoViewIfNeeded();
  await card.tap();
  await expect(page.locator('#mobileGearSelectionName')).toHaveText(item.name);
  await expect(page.locator('#mobileGearEquip')).toHaveText('EQUIP');
  await page.locator('#mobileGearEquip').tap();
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentState().equipped.boots)).toBe(item.uid);

  const metrics=await page.evaluate(()=>window.__riskTest.equipmentRenderMetrics());
  expect(metrics.incrementalRenders).toBe(1);
  expect(metrics.fullRenders).toBe(0);
  expect(metrics.gridRenders).toBe(0);

  const slot=page.locator('.gearLoadoutSlot[data-display-slot="boots"]');
  await slot.tap();
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentState().equipped.boots)).toBeNull();
  const unequipMetrics=await page.evaluate(()=>window.__riskTest.equipmentRenderMetrics());
  expect(unequipMetrics.incrementalRenders).toBe(2);
  expect(unequipMetrics.gridRenders).toBe(0);

  const touchBehavior=await card.evaluate(element=>({
    draggable:element.draggable,
    touchAction:getComputedStyle(element).touchAction,
    callout:getComputedStyle(element).webkitTouchCallout
  }));
  expect(touchBehavior.draggable).toBe(false);
  expect(touchBehavior.touchAction).toBe('pan-y');

  await page.locator('#mobileGearSort').tap();
  await expect(page.locator('#gearMobileSheet')).toHaveClass(/show/);
  await page.locator('#gearMobileSheetOptions button').filter({hasText:'NEWEST'}).tap();
  await expect(page.locator('#mobileGearSortLabel')).toHaveText('NEWEST');

  await page.locator('#mobileGearFilter').tap();
  await page.locator('.gearSheetGroup').first().getByRole('button',{name:'HAMMERS'}).tap();
  await page.locator('.raritySheetGroup').getByRole('button',{name:'EPIC'}).tap();
  await page.locator('.gearSheetActions .done').tap();
  await expect(page.locator('#mobileGearFilterLabel')).toContainText('HAMMERS');
  await expect(page.locator('#mobileGearFilterLabel')).toContainText('EPIC');

  await page.screenshot({
    path:path.join('docs','screenshots','armory-mobile-polish','mobile-fixed-armory.png'),
    fullPage:false
  });
  await context.close();
});

test('desktop keeps drag and drop while equip uses incremental rendering',async({page})=>{
  test.setTimeout(45000);
  await page.setViewportSize({width:1440,height:960});
  await openPopulatedArmory(page);

  await expect(page.locator('#mobileGearSelection')).toBeHidden();
  const item=await findUnequipped(page,'hat');
  const source=page.locator(`#gearGrid [data-item="${item.uid}"]`);
  expect(await source.getAttribute('draggable')).toBe('true');
  await source.dragTo(page.locator('.gearLoadoutSlot[data-display-slot="hat"]'));
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentState().equipped.hat)).toBe(item.uid);
  const metrics=await page.evaluate(()=>window.__riskTest.equipmentRenderMetrics());
  expect(metrics.incrementalRenders).toBe(1);
  expect(metrics.fullRenders).toBe(0);
  expect(metrics.gridRenders).toBe(0);

  const slotShape=await page.locator('.gearLoadoutSlot[data-display-slot="hat"]').evaluate(element=>({
    clipPath:getComputedStyle(element).clipPath,
    borderStyle:getComputedStyle(element).borderStyle
  }));
  expect(slotShape.clipPath).not.toBe('none');
  expect(slotShape.borderStyle).toBe('solid');
  await page.mouse.move(1400,930);
  await expect(page.locator('#gearHoverPreview')).not.toHaveClass(/show/);
  await page.locator('#gearPanel').screenshot({
    path:path.join('docs','screenshots','armory-mobile-polish','desktop-armory.png')
  });
});

test('mobile Dash remains bounded and controls preserve arena visibility',async({browser})=>{
  test.setTimeout(45000);
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await ready(page);
  await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(32,{durable:true}));

  const control=await page.locator('#dashButton').evaluate(element=>{
    const button=getComputedStyle(element);
    const inner=getComputedStyle(element,'::before');
    return{
      width:element.getBoundingClientRect().width,
      height:element.getBoundingClientRect().height,
      innerBackground:inner.backgroundColor,
      border:button.borderColor
    };
  });
  expect(control.width).toBeGreaterThanOrEqual(68);
  expect(control.height).toBeGreaterThanOrEqual(68);
  expect(control.innerBackground).toMatch(/rgba\(.+,\s*0\.[0-9]+\)/);

  const sample=await page.evaluate(async()=>{
    window.__riskTest.triggerDash();
    const deltas=[];
    let previous=performance.now();
    for(let frame=0;frame<90;frame++)await new Promise(resolve=>requestAnimationFrame(now=>{
      deltas.push(now-previous);
      previous=now;
      resolve();
    }));
    deltas.sort((a,b)=>a-b);
    return{
      p95:deltas[Math.floor(deltas.length*.95)],
      worst:deltas[deltas.length-1],
      state:window.__riskTest.combatPerformanceState()
    };
  });
  expect(sample.p95).toBeLessThan(55);
  expect(sample.worst).toBeLessThan(120);
  expect(sample.state.particles).toBeLessThanOrEqual(220);
  await context.close();
});
