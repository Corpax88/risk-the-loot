const {test,expect,devices}=require('@playwright/test');
const path=require('path');

async function openStormcallerArmory(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  const setup=await page.evaluate(()=>window.__riskTest.previewGearSetPieces('stormrunner',5));
  const equippedBySlot=Object.fromEntries(setup.inventory.filter(item=>item.equipped).map(item=>[item.slot,item.uid]));
  expect(equippedBySlot.weapon).toBeTruthy();
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  return equippedBySlot;
}

const VISUAL_LAYERS=['cape','baseBody','legs','boots','chest','scarf','hat','weapon'];

async function characterLayers(page){
  return page.locator('#gearCharacterStage .gearCharacterHero [data-character-layer]').evaluateAll(layers=>Object.fromEntries(layers.map(layer=>[
    layer.dataset.characterLayer,
    {
      hidden:layer.hidden,
      image:layer.style.backgroundImage,
      size:getComputedStyle(layer).backgroundSize,
      repeat:getComputedStyle(layer).backgroundRepeat,
      kind:layer.dataset.kind||''
    }
  ])));
}

async function expectFullSetFigure(page){
  const hero=page.locator('#gearCharacterStage .gearCharacterHero');
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveClass(/domLayeredFigure/);
  await expect(page.locator('#gearBuildProgress')).toHaveText('5 / 5');
  await expect(hero.locator('[data-character-layer]')).toHaveCount(8);
  for(const layer of VISUAL_LAYERS)await expect(hero.locator(`[data-character-layer="${layer}"]`)).toBeVisible();
  await page.waitForTimeout(1250);
  const visual=await characterLayers(page);
  expect(visual.baseBody.image).toContain('pappa-hammer-player-mobile-v1.png');
  for(const layer of VISUAL_LAYERS){
    expect(visual[layer].hidden).toBe(false);
    expect(visual[layer].image).not.toContain('data:image/png');
    expect(visual[layer].size).toBe('contain');
    expect(visual[layer].repeat).toBe('no-repeat');
    expect(visual[layer].kind).toBe('aligned');
  }
  for(const layer of VISUAL_LAYERS.filter(layer=>layer!=='baseBody')){
    expect(visual[layer].image).toContain(`legendary_stormcaller_${layer}_01.png`);
  }
}

const expectFullSetFigureReady=expectFullSetFigure;

async function expectModularFigure(page,missingSlot='weapon'){
  const hero=page.locator('#gearCharacterStage .gearCharacterHero');
  const base=hero.locator('[data-character-layer="baseBody"]');
  await expect(hero).toHaveCount(1);
  await expect(hero).toHaveClass(/domLayeredFigure/);
  await expect(page.locator('#gearBuildProgress')).toHaveText('4 / 5');
  await expect(base).toBeVisible();
  await expect(hero.locator(`[data-character-layer="${missingSlot}"]`)).toBeHidden();
  await page.waitForTimeout(350);
  const visual=await hero.locator('[data-character-layer]').evaluateAll(layers=>layers.map(layer=>layer.style.backgroundImage).join('|'));
  expect(visual).not.toContain('legendary_stormcaller_full_figure_01.png');
  expect(visual).not.toContain('legendary_stormcaller_weaponless_figure_01.png');
}

async function assertCleanArmory(page){
  const state=await page.evaluate(()=>{
    const panel=document.querySelector('#gearPanel');
    const stage=document.querySelector('#gearCharacterStage');
    const close=document.querySelector('#closeGear').getBoundingClientRect();
    const slots=[...document.querySelectorAll('#gearLoadoutSlots .gearLoadoutSlot')];
    const overlap=slots.some(slot=>{
      const box=slot.getBoundingClientRect();
      return box.left<close.right-1&&box.right>close.left+1&&box.top<close.bottom-1&&box.bottom>close.top+1;
    });
    return{
      pageOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      panelOverflow:panel.scrollWidth-panel.clientWidth,
      heroCount:stage.querySelectorAll('.gearCharacterHero').length,
      slotCount:slots.length,
      weaponSlots:slots.filter(slot=>slot.dataset.slot==='weapon').length,
      ghosts:document.querySelectorAll('.gearDragGhost').length,
      closeOverlap:overlap
    };
  });
  expect(state.pageOverflow).toBeLessThanOrEqual(1);
  expect(state.panelOverflow).toBeLessThanOrEqual(1);
  expect(state.heroCount).toBe(1);
  expect(state.slotCount).toBe(10);
  expect(state.weaponSlots).toBe(1);
  expect(state.ghosts).toBe(0);
  expect(state.closeOverlap).toBe(false);
}

for(const profile of [
  {name:'desktop',context:{viewport:{width:1366,height:768}}},
  {name:'iphone',context:{...devices['iPhone 13']}}
]){
  test(`${profile.name} keeps one correct Pappa Hammer through full-set weapon swaps`,async({browser})=>{
    test.setTimeout(120000);
    const context=await browser.newContext(profile.context);
    const page=await context.newPage();
    const equippedBySlot=await openStormcallerArmory(page);
    const weaponUid=equippedBySlot.weapon;

    await expectFullSetFigure(page);
    await assertCleanArmory(page);
    await page.locator('#gearCharacterStage').screenshot({
      path:path.join('test-results','inventory-visual-state',`${profile.name}-five-of-five.png`),
      animations:'disabled'
    });

    await page.evaluate(()=>window.RiskLootEquipmentBridge.unequip('weapon'));
    await expectModularFigure(page);
    await assertCleanArmory(page);
    await page.locator('#gearCharacterStage').screenshot({
      path:path.join('test-results','inventory-visual-state',`${profile.name}-four-of-five.png`),
      animations:'disabled'
    });

    await page.evaluate(uid=>window.RiskLootEquipmentBridge.equip(uid),weaponUid);
    await expectFullSetFigure(page);
    await assertCleanArmory(page);

    for(let cycle=0;cycle<20;cycle++){
      await page.evaluate(()=>window.RiskLootEquipmentBridge.unequip('weapon'));
      await expect(page.locator('[data-character-layer="weapon"]')).toBeHidden();
      await page.evaluate(uid=>window.RiskLootEquipmentBridge.equip(uid),weaponUid);
      await expect(page.locator('[data-character-layer="weapon"]')).toBeVisible();
    }
    await expectFullSetFigure(page);
    await assertCleanArmory(page);

    for(const slot of ['hat','scarf','chest','boots','weapon']){
      await page.evaluate(slotId=>window.RiskLootEquipmentBridge.unequip(slotId),slot);
      await expectModularFigure(page,slot);
      await assertCleanArmory(page);
      await page.evaluate(uid=>window.RiskLootEquipmentBridge.equip(uid),equippedBySlot[slot]);
      await expectFullSetFigureReady(page);
    }

    await context.close();
  });
}
