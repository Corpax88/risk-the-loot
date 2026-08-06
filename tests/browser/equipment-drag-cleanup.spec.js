const {test,expect,devices}=require('@playwright/test');

async function openArmory(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(()=>window.__riskTest.previewGearSet('stormrunner'));
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  await expect(page.locator('#gearGrid .gearBagSlot').first()).toBeVisible();
}

async function dragResidue(page){
  return page.evaluate(()=>({
    ghosts:document.querySelectorAll('.gearDragGhost').length,
    dragging:document.querySelectorAll('.gearBagSlot.dragging,.gearLoadoutSlot.dragging').length,
    targets:document.querySelectorAll('.compatible,.dropHover').length
  }));
}

async function expectClean(page){
  await expect.poll(()=>dragResidue(page)).toEqual({ghosts:0,dragging:0,targets:0});
}

async function beginCustomDrag(page,card,pointerId=41){
  const box=await card.boundingBox();
  const start={x:box.x+box.width*.35,y:box.y+box.height*.4};
  await card.dispatchEvent('pointerdown',{pointerId,pointerType:'mouse',button:0,buttons:1,clientX:start.x,clientY:start.y});
  await card.dispatchEvent('pointermove',{pointerId,pointerType:'mouse',button:0,buttons:1,clientX:start.x+30,clientY:start.y+22});
  await expect(page.locator('.gearDragGhost')).toHaveCount(1);
  return{start,pointerId};
}

test('valid, invalid and rapid desktop drags never leave ghost elements',async({page})=>{
  await page.setViewportSize({width:1366,height:768});
  await openArmory(page);
  const cards=page.locator('#gearGrid .gearBagSlot');
  const character=page.locator('#gearCharacterStage');

  await cards.nth(5).dragTo(character);
  await expectClean(page);

  const invalid=await beginCustomDrag(page,cards.nth(6),59);
  await page.dispatchEvent('body','pointerup',{pointerId:invalid.pointerId,pointerType:'mouse',button:0,buttons:0,clientX:2,clientY:2});
  await expectClean(page);

  for(let index=0;index<3;index++){
    const card=cards.nth(index);
    const {pointerId}=await beginCustomDrag(page,card,60+index);
    await page.dispatchEvent('body','pointercancel',{pointerId,pointerType:'mouse',button:0,buttons:0,clientX:2,clientY:2});
    await expectClean(page);
  }
});

test('closing Armory during an active drag restores the complete interface',async({page})=>{
  await page.setViewportSize({width:1366,height:768});
  await openArmory(page);
  const card=page.locator('#gearGrid .gearBagSlot').nth(5);
  await beginCustomDrag(page,card,91);
  await page.keyboard.press('Escape');
  await expect(page.locator('#gearOverlay')).not.toHaveClass(/show/);
  await expectClean(page);
  await expect(card).not.toHaveClass(/dragging/);
});

test('mobile touch browsing cannot create drag ghosts and tap equip remains available',async({browser})=>{
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await openArmory(page);
  const card=page.locator('#gearGrid .gearBagSlot').nth(5);
  const box=await card.boundingBox();
  await card.dispatchEvent('pointerdown',{pointerId:101,pointerType:'touch',button:0,buttons:1,clientX:box.x+20,clientY:box.y+20});
  await card.dispatchEvent('pointermove',{pointerId:101,pointerType:'touch',button:0,buttons:1,clientX:box.x+80,clientY:box.y-80});
  await card.dispatchEvent('pointerup',{pointerId:101,pointerType:'touch',button:0,buttons:0,clientX:box.x+80,clientY:box.y-80});
  await expectClean(page);
  await card.tap();
  await expect(page.locator('#mobileGearEquip')).toBeEnabled();
  await context.close();
});
