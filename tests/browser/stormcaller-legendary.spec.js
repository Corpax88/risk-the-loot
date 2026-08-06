const {test,expect}=require('@playwright/test');
const path=require('path');

async function openTestGame(page,width=1280,height=900){
  await page.setViewportSize({width,height});
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

test('Stormcaller pieces use dedicated icons and the full set uses seven modular production layers',async({page})=>{
  test.setTimeout(60000);
  await openTestGame(page);

  const one=await page.evaluate(()=>window.__riskTest.previewGearSetPieces('stormrunner',1));
  expect(one.visual.setId).toBeNull();
  expect(one.visual.usesProductionSkin).toBe(false);
  await expect(page.locator('#gearGrid .stormcallerSprite')).toHaveCount(5);

  const three=await page.evaluate(()=>window.__riskTest.previewGearSetPieces('stormrunner',3));
  expect(three.visual.setId).toBeNull();
  await expect(page.locator('#gearDetail .gearDecisionSet')).toBeVisible();
  await expect(page.locator('#gearDetail .gearDecisionSet')).toContainText('STORMCALLER SET');
  await expect(page.locator('#gearDetail .gearDecisionSet')).toContainText('3/5');

  await page.evaluate(()=>window.__riskTest.previewGearSetPieces('stormrunner',5));
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.gearVisualState().usesModularLayers)).toBe(true);
  const state=await page.evaluate(()=>window.__riskTest.gearVisualState());
  expect(state.setId).toBe('stormrunner');
  expect(state.usesProductionSkin).toBe(false);
  expect(state.renderOrder).toEqual(['cape','baseBody','legs','boots','chest','scarf','hat','weapon','effects']);
  expect(state.layers.filter(layer=>layer.visible).map(layer=>layer.id)).toEqual(['cape','legs','boots','chest','scarf','hat','weapon']);
  const equippedAssets=Object.values(state.equippedAssets).filter(Boolean);
  expect(equippedAssets).toHaveLength(7);
  expect(equippedAssets.every(asset=>asset.mode==='aligned')).toBe(true);
  expect(new Set(equippedAssets.map(asset=>asset.path)).size).toBe(7);
  await expect(page.locator('#gearCharacterStage')).toHaveAttribute('data-set-id','stormrunner');
  await expect(page.locator('#gearGrid .stormcallerSprite')).toHaveCount(7);
  const assets=await page.locator('#gearGrid .stormcallerSprite').evaluateAll(nodes=>
    [...new Set(nodes.map(node=>node.dataset.gearAsset))]
  );
  expect(assets).toHaveLength(7);
  expect(assets.every(asset=>asset&&asset.includes('@stormcaller'))).toBe(true);
  await page.locator('#gearCharacterStage').screenshot({
    path:path.join('test-results','stormcaller','armory-desktop.png')
  });
});

test('equipping the final Stormcaller core piece activates the set without replacing modular layers',async({page})=>{
  await openTestGame(page);
  const setup=await page.evaluate(()=>window.__riskTest.previewGearSetPieces('stormrunner',4));
  const finalPiece=setup.inventory.find(item=>item.itemId.startsWith('stormrunner-')&&!item.equipped);
  expect(finalPiece).toBeTruthy();

  await page.locator(`#gearGrid [data-item="${finalPiece.uid}"]`).click();
  await page.mouse.move(2,2);
  await page.evaluate(()=>document.querySelector('#gearDetail .equipGear').click());
  const stage=page.locator('#gearCharacterStage');
  await expect(stage).toHaveAttribute('data-set-id','stormrunner');
  await expect(stage).toHaveClass(/fullSetMorph/);
  await expect(stage).not.toHaveClass(/stormcallerAwaken|signatureAwaken|equipLegendary/);
  await stage.screenshot({
    path:path.join('test-results','stormcaller','full-set-activation.png')
  });
  await expect(stage).not.toHaveClass(/fullSetMorph/,{timeout:1200});
});

test('Stormcaller comparison never previews candidate gear and weapon removal keeps one identity',async({page})=>{
  await openTestGame(page);
  const comparisonSetup=await page.evaluate(()=>window.__riskTest.previewGearSetPieces('stormrunner',4));
  const candidateWeapon=comparisonSetup.inventory.find(item=>item.slot==='weapon'&&!item.equipped);
  expect(candidateWeapon).toBeTruthy();

  const hero=page.locator('#gearCharacterStage .gearCharacterHero');
  const equippedImage=await hero.evaluate(element=>element.style.backgroundImage);
  const candidateCard=page.locator(`#gearGrid [data-item="${candidateWeapon.uid}"]`);
  await candidateCard.hover();
  await expect(page.locator('#gearCharacterStage')).not.toHaveClass(/gearPreviewing/);
  expect(await hero.evaluate(element=>element.style.backgroundImage)).toBe(equippedImage);
  await candidateCard.click();
  expect(await hero.evaluate(element=>element.style.backgroundImage)).toBe(equippedImage);

  const setup=await page.evaluate(()=>window.__riskTest.previewGearSetPieces('stormrunner',5));
  const weapon=setup.inventory.find(item=>item.slot==='weapon'&&item.equipped);
  expect(weapon).toBeTruthy();
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.gearVisualState().inventoryFigureVariant)).toBe('full');
  const fullImage=await hero.evaluate(element=>element.style.backgroundImage);

  await page.mouse.move(2,2);
  await page.evaluate(()=>window.RiskLootInventoryV2Bridge.unequip('weapon'));
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.gearVisualState().inventoryFigureVariant)).toBe('weaponless');
  const weaponlessImage=await hero.evaluate(element=>element.style.backgroundImage);
  expect(weaponlessImage).not.toBe(fullImage);
  expect(weaponlessImage).toContain('legendary_stormcaller_weaponless_figure_01.png');
  await page.locator('#gearCharacterStage').screenshot({
    path:path.join('test-results','stormcaller','weaponless-same-character.png')
  });
});

test('Stormcaller chain VFX communicate departure, travel, impact and kills',async({page})=>{
  await openTestGame(page,1280,800);
  await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(36,{fullLightning:true,durable:true}));
  await page.evaluate(()=>window.__riskTest.setLightningTargets([
    {id:'alpha',x:145,y:-35,hp:500},
    {id:'beta',x:175,y:15,hp:500},
    {id:'gamma',x:130,y:55,hp:500},
    {id:'delta',x:205,y:-65,hp:500}
  ],{durable:true}));

  let state=await page.evaluate(()=>{
    const pressed=window.__riskTest.pressLightning();
    const current=window.__riskTest.advanceLightning(.045);
    window.__riskTest.freezeFrame(true);
    return{pressed,current}
  });
  expect(state.pressed.accepted).toBe(true);
  state=state.current;
  expect(state.effects).toContain('lightningDeparture');
  expect(state.effects).toContain('lightningTrail');
  await page.locator('#world').screenshot({
    path:path.join('test-results','stormcaller','chain-travel-desktop.png')
  });

  state=await page.evaluate(()=>{
    window.__riskTest.freezeFrame(false);
    window.__riskTest.spawnHammerstormPack(36,{fullLightning:true,durable:true});
    window.__riskTest.setLightningTargets([
      {id:'alpha',x:145,y:-35,hp:500},
      {id:'beta',x:175,y:15,hp:500},
      {id:'gamma',x:130,y:55,hp:500},
      {id:'delta',x:205,y:-65,hp:500}
    ],{durable:true});
    window.__riskTest.pressLightning();
    let current=window.__riskTest.lightningDashState();
    for(let step=0;step<40&&!current.effects.includes('lightningImpact');step++)current=window.__riskTest.advanceLightning(.005);
    window.__riskTest.freezeFrame(true);
    return current
  });
  expect(state.impacts).toBeGreaterThanOrEqual(1);
  expect(state.chainHits).toBeGreaterThanOrEqual(1);
  expect(state.effects).toContain('lightningImpact');
  await page.locator('#world').screenshot({
    path:path.join('test-results','stormcaller','chain-impact-desktop.png')
  });
});

test('Stormcaller remains readable on iPhone portrait and reduced motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await openTestGame(page,390,844);
  await page.evaluate(()=>window.__riskTest.previewGearSetPieces('stormrunner',5));
  const stage=page.locator('#gearCharacterStage');
  await expect(stage).toBeVisible();
  await expect(stage).toHaveAttribute('data-set-id','stormrunner');
  const bounds=await stage.boundingBox();
  expect(bounds.width).toBeLessThanOrEqual(390);
  expect(bounds.height).toBeGreaterThan(180);
  const reducedMotion=await stage.evaluate(element=>({
    hero:getComputedStyle(element.querySelector('.gearCharacterHero')).animationName,
    outer:getComputedStyle(element.querySelector('.gearCharacterHalo'),'::before').animationName,
    inner:getComputedStyle(element.querySelector('.gearCharacterHalo'),'::after').animationName
  }));
  expect(reducedMotion).toEqual({hero:'none',outer:'none',inner:'none'});
  await stage.screenshot({
    path:path.join('test-results','stormcaller','armory-mobile-reduced-motion.png')
  });

  await page.locator('#closeGear').click();
  await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(28,{fullLightning:true,durable:true}));
  await page.evaluate(()=>document.querySelector('#particlesToggle').click());
  await page.evaluate(()=>window.__riskTest.pressLightning());
  await page.evaluate(()=>window.__riskTest.advanceLightning(.08));
  const combat=await page.evaluate(()=>window.__riskTest.combatPerformanceState());
  expect(combat.particles).toBe(0);
  await page.locator('#world').screenshot({
    path:path.join('test-results','stormcaller','combat-mobile-reduced-effects.png')
  });
});
