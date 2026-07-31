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

test('Common, Rare and Epic gear use solid presentation without emitted glow',async({page})=>{
  await openGame(page);

  const {item,feedback}=await equipFinalSetPiece(page,'hammerChoir');
  expect(item.rarity).toBe('epic');
  expect(feedback.classes).toContain('fullSetMorph');
  expect(feedback.classes).not.toContain('equipBurst');
  expect(feedback.classes).not.toContain('equipLegendary');
  expect(feedback.classes).not.toContain('loadoutCompleteSet');
  expect(feedback.particles).toBe(0);

  await page.locator('#gearGrid .gearBagSlot.rarity2').first().hover();
  const appearance=await page.evaluate(()=>{
    const card=document.querySelector('#gearGrid .gearBagSlot.rarity2');
    const detail=document.querySelector('#gearDetail .gearArt.detail');
    const hero=document.querySelector('#gearCharacterStage .gearCharacterHero');
    const stage=document.querySelector('#gearCharacterStage');
    return {
      cardShadow:getComputedStyle(card).boxShadow,
      detailFilter:getComputedStyle(detail).filter,
      heroFilter:getComputedStyle(hero).filter,
      previewing:stage.classList.contains('gearPreviewing'),
      legendaryPreview:stage.classList.contains('gearLegendaryPreview')
    };
  });
  expect(appearance.previewing).toBe(true);
  expect(appearance.legendaryPreview).toBe(false);
  expect(appearance.cardShadow).not.toContain('77, 163, 255');
  expect(appearance.detailFilter).not.toContain('77, 163, 255');
  expect(appearance.heroFilter).not.toContain('77, 163, 255');
});

test('Legendary gear retains its premium preview while full sets morph without decorative particles',async({page})=>{
  await openGame(page);
  const setup=await page.evaluate(()=>window.__riskTest.previewGearSetPieces('fatebound',4));
  const item=setup.inventory.find(entry=>!entry.equipped);
  const card=page.locator(`#gearGrid [data-item="${item.uid}"]`);
  await card.hover();
  await expect(page.locator('#gearCharacterStage')).toHaveClass(/gearLegendaryPreview/);
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
