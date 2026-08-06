const {test,expect}=require('@playwright/test');

async function openGame(page,width=1280,height=900){
  await page.setViewportSize({width,height});
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

async function equipFinalSetPiece(page,setId){
  const setup=await page.evaluate(id=>window.__riskTest.previewGearSetPieces(id,4),setId);
  const item=setup.inventory.find(entry=>!entry.equipped);
  expect(item).toBeTruthy();
  const card=page.locator(`#gearGrid [data-item="${item.uid}"]`);
  await card.click();
  await page.mouse.move(2,2);
  const feedback=await page.evaluate(()=>{
    document.querySelector('#gearDetail .equipGear').click();
    const stage=document.querySelector('#gearCharacterStage');
    return {
      classes:[...stage.classList],
      particles:document.querySelectorAll('.gearSlotParticles').length
    };
  });
  return {item,feedback};
}

test('individual Stormcaller gear stays restrained until the full set activates',async({page})=>{
  await openGame(page);

  const setup=await page.evaluate(()=>window.__riskTest.previewGearSetPieces('stormrunner',3));
  const item=setup.inventory.find(entry=>!entry.equipped);
  expect(item).toBeTruthy();
  const card=page.locator(`#gearGrid [data-item="${item.uid}"]`);
  await card.hover();
  await expect(page.locator('#gearCharacterStage')).not.toHaveClass(/gearPreviewing|gearLegendaryPreview/);
  await card.click();
  await page.mouse.move(2,2);
  const feedback=await page.evaluate(()=>{
    document.querySelector('#gearDetail .equipGear').click();
    const stage=document.querySelector('#gearCharacterStage');
    return{classes:[...stage.classList],particles:document.querySelectorAll('.gearSlotParticles').length}
  });
  expect(item.rarity).toBe('legendary');
  expect(feedback.classes).not.toContain('fullSetMorph');
  expect(feedback.classes).toContain('equipBurst');
  expect(feedback.classes).toContain('equipLegendary');
  expect(feedback.classes).not.toContain('loadoutCompleteSet');
  expect(feedback.particles).toBeGreaterThan(0);

  const appearance=await page.evaluate(()=>{
    const stage=document.querySelector('#gearCharacterStage');
    return {
      previewing:stage.classList.contains('gearPreviewing'),
      legendaryPreview:stage.classList.contains('gearLegendaryPreview')
    };
  });
  expect(appearance.previewing).toBe(false);
  expect(appearance.legendaryPreview).toBe(false);
});

test('Legendary comparison does not alter the equipped character while full sets still morph',async({page})=>{
  await openGame(page);
  const setup=await page.evaluate(()=>window.__riskTest.previewGearSetPieces('stormrunner',4));
  const item=setup.inventory.find(entry=>!entry.equipped);
  const card=page.locator(`#gearGrid [data-item="${item.uid}"]`);
  await card.hover();
  await expect(page.locator('#gearCharacterStage')).not.toHaveClass(/gearLegendaryPreview/);
  await card.click();
  await page.mouse.move(2,2);

  const feedback=await page.evaluate(()=>{
    document.querySelector('#gearDetail .equipGear').click();
    const stage=document.querySelector('#gearCharacterStage');
    return {
      classes:[...stage.classList],
      particles:document.querySelectorAll('.gearSlotParticles').length
    };
  });
  expect(feedback.classes).toContain('fullSetMorph');
  expect(feedback.classes).not.toContain('equipLegendary');
  expect(feedback.classes).toContain('loadoutCompleteSet');
  expect(feedback.particles).toBe(0);
});
