const {test,expect}=require('@playwright/test');

test('defeat the first Champion, open its loot orb, and go deeper',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.addInitScript(()=>localStorage.clear());

  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);

  await page.locator('#settingsButton').click();
  await page.locator('#devButton').click();
  await page.locator('#devWarden').click();

  await expect(page.locator('#expeditionView')).toBeVisible();
  await expect(page.locator('#bossHud')).toHaveClass(/show/);
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.state().bossActive)).toBe(true);

  expect(await page.evaluate(()=>window.__riskTest.defeatChampion())).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.state().lootOrbReady)).toBe(true);

  const orbPoint=await page.evaluate(()=>window.__riskTest.bossLootOrbPoint());
  expect(orbPoint).not.toBeNull();
  await page.locator('#world').click({position:orbPoint,force:true});

  expect(await page.evaluate(()=>window.__riskTest.state().lootRevealOpening)).toBe(true);
  await expect(page.locator('#bossLootOverlay')).toHaveClass(/show/);
  await expect(page.locator('#bossLootGrid .bossLootItem').first()).toBeVisible();

  await page.locator('#bossLootPush').click();

  await expect(page.locator('#bossLootOverlay')).not.toHaveClass(/show/);
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.state().postBossIntent)).toBe('deeper');
  await expect(page.locator('#moduleOverlay')).toHaveClass(/show/);
  expect(pageErrors).toEqual([]);
});
