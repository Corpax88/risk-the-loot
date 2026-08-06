const {test,expect}=require('@playwright/test');

async function boot(page,viewport){
  if(viewport)await page.setViewportSize(viewport);
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

test('the first Champion drops the current forge cache and Go Deeper remains available',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await boot(page);
  await page.locator('#settingsButton').click();
  await page.locator('#devButton').click();
  await page.locator('#devWarden').click();

  await expect(page.locator('#expeditionView')).toBeVisible();
  await expect(page.locator('#bossHud')).toHaveClass(/show/);
  expect(await page.evaluate(()=>window.__riskTest.defeatChampion())).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.state().lootOrbReady)).toBe(true);

  const orbPoint=await page.evaluate(()=>window.__riskTest.bossLootOrbPoint());
  expect(orbPoint).not.toBeNull();
  await page.locator('#world').click({position:orbPoint,force:true});
  await expect(page.locator('#bossLootOverlay')).toHaveClass(/show/);
  await expect(page.locator('#bossLootPath')).toHaveAttribute('aria-hidden','false');
  await expect(page.locator('#bossLootDecision')).toHaveAttribute('aria-hidden','true');
  await expect(page.locator('#bossLootGrid .foundationReceipt')).toHaveCount(1);
  await expect(page.locator('#bossLootCount')).toContainText('FORGE MATERIALS RECOVERED');
  expect(await page.evaluate(()=>window.__riskTest.state().materials)).toBeGreaterThan(0);

  await page.locator('#bossLootPush').click();
  await expect(page.locator('#bossLootOverlay')).not.toHaveClass(/show/);
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.state().postBossIntent)).toBe('deeper');
  await expect(page.locator('#moduleOverlay')).toHaveClass(/show/);
  expect(pageErrors).toEqual([]);
});

test('KEEP stores a testable Champion item without equipping it',async({page})=>{
  await boot(page,{width:390,height:844});
  expect(await page.evaluate(()=>window.__riskTest.prepareBossLootDecision('legendary',1))).toBeTruthy();
  await expect(page.locator('#bossLootDecision')).toHaveAttribute('aria-hidden','false');
  const before=await page.evaluate(()=>window.__riskTest.state());
  await page.locator('#bossLootKeep').click();
  await expect(page.locator('#bossLootPath')).toHaveAttribute('aria-hidden','false');
  const after=await page.evaluate(()=>window.__riskTest.state());
  expect(Object.values(after.equipped)).not.toContain(before.lootUid);
  const stored=await page.evaluate(uid=>window.__riskTest.equipmentInventory().find(item=>item.uid===uid),before.lootUid);
  expect(stored).toMatchObject({equipped:false,rarity:'legendary'});
});

test('SALVAGE destroys Legendary loot and permanently stores its rewards on mobile',async({page})=>{
  await boot(page,{width:390,height:844});
  expect(await page.evaluate(()=>window.__riskTest.prepareBossLootDecision('legendary',1))).toBeTruthy();
  await expect(page.locator('#bossLootDecision')).toHaveAttribute('aria-hidden','false');
  await expect(page.locator('#bossLootSalvageReward')).toContainText('+25 Materials');
  await expect(page.locator('#bossLootSalvageReward')).toContainText('Legendary Core');
  await page.locator('#bossLootSalvage').click();
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.state().materials)).toBe(25);
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.state().legendaryCores)).toBe(1);
  await expect(page.locator('#materialCount')).toHaveText('25');
  await expect(page.locator('#legendaryCoreCount')).toHaveText('1 CORE');

  const persisted=await page.evaluate(()=>JSON.parse(localStorage.getItem('scrapbound_prototype_v1')));
  expect(persisted.materials).toBe(25);
  expect(persisted.legendaryCores).toBe(1);
  expect(persisted.gear.some(gear=>gear.atRisk)).toBe(false);
});
