const {test,expect}=require('@playwright/test');

async function openPlaytest(page,viewport){
  await page.setViewportSize(viewport);
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.locator('#settingsButton').click();
  await page.locator('#devButton').click();
  await page.locator('#devGear').click();
}

for(const [name,viewport] of [
  ['desktop',{width:1366,height:768}],
  ['iPhone',{width:390,height:844}]
]){
  test(name+' Dev Gear exposes every registered set and item',async({page})=>{
    await openPlaytest(page,viewport);
    const panel=page.locator('#devGearPanel'),select=page.locator('#devGearSelect');
    await expect(panel).toBeVisible();
    let state=await page.evaluate(()=>window.__riskTest.devGearState());
    expect(state.options).toBe(state.sets+state.items+1);

    await select.selectOption('set:stormrunner');
    const before=await page.evaluate(()=>window.__riskTest.devGearState());
    await page.locator('#devGearSpawn').click();
    state=await page.evaluate(()=>window.__riskTest.devGearState());
    expect(state.gearCount-before.gearCount).toBe(7);
    expect(state.equippedSet).not.toBe('stormrunner');

    await select.selectOption('set:stormrunner');
    await page.locator('#devGearEquip').click();
    state=await page.evaluate(()=>window.__riskTest.devGearState());
    expect(state.equippedSet).toBe('stormrunner');
    for(const slot of ['hat','cape','chest','legs','boots','scarf','weapon'])expect(state.equipped[slot]).toBeTruthy();
    for(const slot of ['necklace','ring1','ring2'])expect(state.equipped[slot]).toBeNull();

    const itemValue=await select.locator('optgroup[label="INDIVIDUAL ITEMS"] option').first().getAttribute('value');
    await select.selectOption(itemValue);
    const itemBefore=await page.evaluate(()=>window.__riskTest.devGearState());
    await page.locator('#devGearEquip').click();
    state=await page.evaluate(()=>window.__riskTest.devGearState());
    expect(state.gearCount-itemBefore.gearCount).toBe(1);
  });
}

test('legacy gear-specific dev buttons are gone',async({page})=>{
  await openPlaytest(page,{width:1280,height:800});
  await expect(page.locator('#devRig')).toHaveCount(0);
  await expect(page.locator('#devBlackHole')).toHaveCount(0);
  await expect(page.locator('#devLoot')).toHaveCount(0);
  await expect(page.locator('#devGear')).toHaveCount(1);
});
