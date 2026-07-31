const {test,expect,devices}=require('@playwright/test');
const path=require('path');

async function boot(page){
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest&&window.InventoryV2))).toBe(true)
}

async function seedGear(page){
  await boot(page);
  await page.evaluate(()=>{
    window.__riskTest.previewGearSet('hammerChoir');
    window.__riskTest.previewGearSet('fatebound')
  });
  await page.locator('#closeGear').click()
}

async function openV2(page,touch=false){
  touch?await page.locator('#inventoryV2Button').tap():await page.locator('#inventoryV2Button').click();
  await expect(page.locator('#inventoryV2Overlay')).toHaveClass(/show/);
  await expect(page.locator('#inventoryV2Close')).toBeVisible();
  await expect(page.locator('#inventoryV2Hero')).toHaveCSS('background-image',/url/)
}

async function diagnostics(page){return page.evaluate(()=>window.InventoryV2.diagnostics())}

async function expectCleanV2(page){
  await expect.poll(()=>diagnostics(page)).toMatchObject({dragActive:false,overlays:1,launchers:1,dragGhosts:0})
}

test('V1 remains available while V2 opens and closes cleanly for 20 cycles',async({page})=>{
  test.setTimeout(60000);
  await page.setViewportSize({width:1440,height:900});
  await seedGear(page);

  await page.locator('#gearLockerButton').click();
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  await expect(page.locator('#inventoryV2Overlay')).not.toHaveClass(/show/);
  await page.locator('#closeGear').click();

  for(let index=0;index<20;index++){
    await openV2(page);
    await page.locator('#inventoryV2Grid .inventoryV2Card').nth(index%10).click();
    await page.locator('#inventoryV2Close').click();
    await expect(page.locator('#inventoryV2Overlay')).not.toHaveClass(/show/)
  }

  await expectCleanV2(page);
  await expect(page.locator('#inventoryV2Overlay')).toHaveCount(1);
  await expect(page.locator('#inventoryV2Button')).toHaveCount(1);
  await expect(page.locator('body')).not.toHaveClass(/inventoryV2Open/);

  await openV2(page);
  await page.locator('#inventoryV2OpenLegacy').click();
  await expect(page.locator('#inventoryV2Overlay')).not.toHaveClass(/show/);
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/)
});

test('selection, stable sorting and filtering never duplicate or strand cards',async({page})=>{
  test.setTimeout(30000);
  await page.setViewportSize({width:1366,height:768});
  await seedGear(page);
  await openV2(page);

  const items=await page.evaluate(()=>window.RiskLootInventoryV2Bridge.snapshot().gear.map(item=>({uid:item.uid,name:item.name})));
  for(const item of items){
    await page.locator(`.inventoryV2Card[data-uid="${item.uid}"]`).click();
    await expect(page.locator('#inventoryV2Detail h2')).toHaveText(item.name);
    await expect(page.locator('.inventoryV2Card[aria-selected="true"]')).toHaveCount(1)
  }

  for(let index=0;index<8;index++)await page.locator('#inventoryV2Sort').click();
  for(const slot of ['hat','coat','hammer','all','boots','all']){
    await page.locator('#inventoryV2SlotFilter').selectOption(slot);
    const state=await diagnostics(page);
    expect(state.cards).toBe(state.uniqueCards);
    if(state.cards)await expect(page.locator(`.inventoryV2Card[data-uid="${state.selectedUid}"]`)).toBeVisible()
  }
  await page.locator('#inventoryV2RarityFilter').selectOption('common');
  await expect(page.locator('#inventoryV2Grid .inventoryV2Card')).toHaveCount(0);
  await expect(page.locator('#inventoryV2Detail h2')).toHaveCount(0);
  await page.locator('#inventoryV2RarityFilter').selectOption('legendary');
  const restored=await diagnostics(page);
  expect(restored.cards).toBe(restored.uniqueCards);
  await expect(page.locator(`.inventoryV2Card[data-uid="${restored.selectedUid}"]`)).toBeVisible()
});

test('equip and remove update every V2 surface in one synchronized state',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await seedGear(page);
  await openV2(page);
  const candidate=await page.evaluate(()=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>!item.equipped));

  await page.locator(`.inventoryV2Card[data-uid="${candidate.uid}"]`).click();
  await expect(page.locator('#inventoryV2Detail h2')).toHaveText(candidate.name);
  await page.locator('#inventoryV2Equip').click();
  await expect.poll(()=>page.evaluate(uid=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>item.uid===uid).equipped,candidate.uid)).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.RiskLootInventoryV2Bridge.snapshot().fullSetId)).toBe(null);
  await expect(page.locator(`.inventoryV2Slot[data-slot="${candidate.slot}"]`)).toHaveAttribute('data-uid',candidate.uid);
  await expect(page.locator(`.inventoryV2Card[data-uid="${candidate.uid}"]`)).toHaveClass(/equipped/);
  await expect(page.locator('#inventoryV2Equip')).toHaveText('REMOVE');
  await expect(page.locator('#inventoryV2BuildStats')).toContainText(/POWER/);
  await expect(page.locator('#inventoryV2Hero')).toHaveCSS('background-image',/url/);

  await page.locator('#inventoryV2Equip').click();
  await expect.poll(()=>page.evaluate(slot=>window.RiskLootInventoryV2Bridge.snapshot().equipped[slot],candidate.slot)).toBe(null);
  await expect(page.locator(`.inventoryV2Slot[data-slot="${candidate.slot}"]`)).toHaveAttribute('data-uid','');
  await expect(page.locator(`.inventoryV2Card[data-uid="${candidate.uid}"]`)).not.toHaveClass(/equipped/);
  await expect(page.locator('#inventoryV2Equip')).toHaveText('EQUIP')
});

test('layered gear and full-figure set transitions keep accurate set state and aspect ratio',async({page})=>{
  await page.setViewportSize({width:1366,height:768});
  await boot(page);
  await page.evaluate(()=>window.__riskTest.previewGearSetPieces('hammerChoir',4));
  await page.locator('#closeGear').click();
  await openV2(page);

  await expect(page.locator('#inventoryV2BuildStats')).toContainText('4/5');
  const finalPiece=await page.evaluate(()=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>item.set&&item.set.id==='hammerChoir'&&!item.equipped));
  await page.locator(`.inventoryV2Card[data-uid="${finalPiece.uid}"]`).click();
  await page.locator('#inventoryV2Equip').click();
  await expect.poll(()=>page.evaluate(()=>window.RiskLootInventoryV2Bridge.snapshot().fullSetId)).toBe('hammerChoir');
  await expect(page.locator('#inventoryV2BuildStats')).toContainText('5/5');
  await expect(page.locator('#inventoryV2BuildStats')).toContainText('FULL SET ACTIVE');

  const ratio=await page.locator('#inventoryV2Hero').evaluate(element=>{const box=element.getBoundingClientRect();return box.width/box.height});
  expect(ratio).toBeGreaterThan(.98);
  expect(ratio).toBeLessThan(1.02);

  await page.locator('#inventoryV2Equip').click();
  await expect.poll(()=>page.evaluate(()=>window.RiskLootInventoryV2Bridge.snapshot().fullSetId)).toBe(null);
  await expect(page.locator('#inventoryV2BuildStats')).toContainText('4/5')
});

test('desktop valid, invalid and cancelled drags always remove the single preview',async({page})=>{
  test.setTimeout(60000);
  await page.setViewportSize({width:1440,height:900});
  await seedGear(page);
  await openV2(page);
  let candidate=await page.evaluate(()=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>!item.equipped));
  let card=page.locator(`.inventoryV2Card[data-uid="${candidate.uid}"]`);
  await card.dragTo(page.locator('.inventoryV2Portrait'));
  await expect.poll(()=>page.evaluate(uid=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>item.uid===uid).equipped,candidate.uid)).toBe(true);
  await expectCleanV2(page);

  candidate=await page.evaluate(()=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>!item.equipped));
  card=page.locator(`.inventoryV2Card[data-uid="${candidate.uid}"]`);
  const wrongSlot=await page.evaluate(slot=>window.RiskLootInventoryV2Bridge.snapshot().slots.find(entry=>entry.id!==slot).id,candidate.slot);
  await card.dragTo(page.locator(`.inventoryV2Slot[data-slot="${wrongSlot}"]`));
  await expect.poll(()=>page.evaluate(uid=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>item.uid===uid).equipped,candidate.uid)).toBe(false);
  await expectCleanV2(page);

  for(let index=0;index<4;index++){
    await card.dragTo(page.locator('#inventoryV2Detail'));
    await expectCleanV2(page)
  }

  let transfer=await page.evaluateHandle(()=>new DataTransfer());
  await card.dispatchEvent('dragstart',{dataTransfer:transfer});
  await expect(page.locator('.inventoryV2DragGhost')).toHaveCount(1);
  await page.waitForTimeout(275);
  await page.dispatchEvent('body','pointercancel',{pointerId:71,pointerType:'mouse',button:0,buttons:0});
  await expectCleanV2(page);

  transfer=await page.evaluateHandle(()=>new DataTransfer());
  await card.dispatchEvent('dragstart',{dataTransfer:transfer});
  await expect(page.locator('.inventoryV2DragGhost')).toHaveCount(1);
  await page.dispatchEvent('body','pointerup',{pointerId:72,pointerType:'mouse',button:0,buttons:0});
  await expectCleanV2(page);

  transfer=await page.evaluateHandle(()=>new DataTransfer());
  await card.dispatchEvent('dragstart',{dataTransfer:transfer});
  await expect(page.locator('.inventoryV2DragGhost')).toHaveCount(1);
  await page.evaluate(()=>window.InventoryV2.close());
  await expectCleanV2(page);
  await expect(page.locator('.inventoryV2Card.dragging')).toHaveCount(0)
});

test('desktop, laptop and tablet layouts stay inside a single stable viewport',async({page})=>{
  await seedGear(page);
  for(const viewport of [{width:1920,height:1080},{width:1366,height:768},{width:820,height:1180}]){
    await page.setViewportSize(viewport);
    if(!await page.evaluate(()=>window.InventoryV2.isOpen()))await openV2(page);
    const layout=await page.evaluate(()=>{
      const rect=selector=>{const box=document.querySelector(selector).getBoundingClientRect();return{left:box.left,right:box.right,top:box.top,bottom:box.bottom,width:box.width,height:box.height}};
      return{viewport:{width:innerWidth,height:innerHeight},overflowX:document.documentElement.scrollWidth-document.documentElement.clientWidth,shell:rect('.inventoryV2Shell'),workspace:rect('.inventoryV2Workspace'),character:rect('.inventoryV2Character'),collection:rect('.inventoryV2Collection'),detail:rect('.inventoryV2Detail'),hero:rect('#inventoryV2Hero')}
    });
    expect(layout.overflowX).toBeLessThanOrEqual(1);
    for(const panel of ['character','collection','detail']){
      expect(layout[panel].left).toBeGreaterThanOrEqual(layout.workspace.left-.5);
      expect(layout[panel].right).toBeLessThanOrEqual(layout.workspace.right+.5);
      expect(layout[panel].top).toBeGreaterThanOrEqual(layout.workspace.top-.5);
      expect(layout[panel].bottom).toBeLessThanOrEqual(layout.workspace.bottom+.5)
    }
    expect(layout.hero.width/layout.hero.height).toBeGreaterThan(.98);
    expect(layout.hero.width/layout.hero.height).toBeLessThan(1.02)
  }
});

test('iPhone layout is safe, independently scrollable and tap equip is reliable',async({browser})=>{
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await seedGear(page);
  await openV2(page,true);

  const layout=await page.evaluate(()=>{
    const overlay=document.querySelector('#inventoryV2Overlay').getBoundingClientRect(),close=document.querySelector('#inventoryV2Close').getBoundingClientRect(),hero=document.querySelector('#inventoryV2Hero').getBoundingClientRect(),grid=document.querySelector('#inventoryV2Grid');
    return{viewport:{width:innerWidth,height:innerHeight},overlay:{left:overlay.left,right:overlay.right,top:overlay.top,bottom:overlay.bottom},close:{left:close.left,right:close.right,top:close.top,bottom:close.bottom,width:close.width,height:close.height},hero:{width:hero.width,height:hero.height},overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,grid:{overflow:getComputedStyle(grid).overflowY,scrollHeight:grid.scrollHeight,clientHeight:grid.clientHeight}}
  });
  expect(layout.overflow).toBeLessThanOrEqual(1);
  expect(layout.close.width).toBeGreaterThanOrEqual(44);
  expect(layout.close.height).toBeGreaterThanOrEqual(44);
  expect(layout.close.left).toBeGreaterThanOrEqual(layout.overlay.left);
  expect(layout.close.right).toBeLessThanOrEqual(layout.overlay.right+.5);
  expect(layout.close.top).toBeGreaterThanOrEqual(layout.overlay.top);
  expect(layout.close.bottom).toBeLessThanOrEqual(layout.overlay.bottom+.5);
  expect(layout.hero.width/layout.hero.height).toBeGreaterThan(.98);
  expect(layout.hero.width/layout.hero.height).toBeLessThan(1.02);
  expect(layout.grid.overflow).toBe('auto');

  const candidate=await page.evaluate(()=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>!item.equipped));
  const card=page.locator(`.inventoryV2Card[data-uid="${candidate.uid}"]`);
  const cardBox=await card.boundingBox();
  await card.dispatchEvent('pointerdown',{pointerId:81,pointerType:'touch',button:0,buttons:1,clientX:cardBox.x+12,clientY:cardBox.y+12});
  await card.dispatchEvent('pointermove',{pointerId:81,pointerType:'touch',button:0,buttons:1,clientX:cardBox.x+12,clientY:cardBox.y-40});
  await card.dispatchEvent('pointerup',{pointerId:81,pointerType:'touch',button:0,buttons:0,clientX:cardBox.x+12,clientY:cardBox.y-40});
  await expectCleanV2(page);
  await card.tap();
  await expect(page.locator('#inventoryV2Detail h2')).toHaveText(candidate.name);
  await card.tap();
  await expect.poll(()=>page.evaluate(uid=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>item.uid===uid).equipped,candidate.uid)).toBe(true);
  await expectCleanV2(page);
  await page.screenshot({path:path.join('docs','screenshots','inventory-v2','mobile.png')});
  await page.locator('#inventoryV2Close').tap();
  await expect(page.locator('#inventoryV2Overlay')).not.toHaveClass(/show/);
  await context.close()
});

test('equipped state persists after close, reload and reopen',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await seedGear(page);
  await openV2(page);
  const candidate=await page.evaluate(()=>window.RiskLootInventoryV2Bridge.snapshot().gear.find(item=>!item.equipped));
  await page.locator(`.inventoryV2Card[data-uid="${candidate.uid}"]`).click();
  await page.locator('#inventoryV2Equip').click();
  await page.locator('#inventoryV2Close').click();
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>Boolean(window.InventoryV2&&window.RiskLootInventoryV2Bridge))).toBe(true);
  await expect.poll(()=>page.evaluate(uid=>{const item=window.RiskLootInventoryV2Bridge.snapshot().gear.find(entry=>entry.uid===uid);return item&&item.equipped},candidate.uid)).toBe(true);
  await page.evaluate(()=>window.InventoryV2.open());
  await expect(page.locator(`.inventoryV2Card[data-uid="${candidate.uid}"]`)).toHaveClass(/equipped/);
  await expectCleanV2(page);
  await page.screenshot({path:path.join('docs','screenshots','inventory-v2','desktop.png')})
});
