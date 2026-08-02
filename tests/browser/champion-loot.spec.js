const {test,expect}=require('@playwright/test');

test('defeat the first Champion, equip each revealed item, and go deeper',async({page})=>{
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
  await expect(page.locator('#bossLootDecision')).toHaveAttribute('aria-hidden','false');
  await expect(page.locator('#bossLootPappa')).toBeVisible();
  await expect(page.locator('#bossLootPappa')).not.toHaveCSS('background-image','none');
  await expect(page.locator('#bossLootCompare .gearComparison')).toBeVisible();
  for(const stat of ['DAMAGE','ARMOR','ATTACK SPEED','CRIT','LIFE STEAL']){
    await expect(page.locator('#bossLootCompare')).toContainText(stat);
  }
  await expect(page.locator('#bossLootEquip')).toBeVisible();
  await expect(page.locator('#bossLootKeep')).toBeVisible();
  await expect(page.locator('#bossLootSalvage')).toBeVisible();
  await expect(page.locator('#bossLootDecision button:visible')).toHaveCount(3);
  await expect(page.locator('#helpTooltip')).not.toHaveClass(/show/);

  const decisionCount=(await page.evaluate(()=>window.__riskTest.state().lootCount));
  for(let index=0;index<decisionCount;index++){
    const before=await page.evaluate(()=>window.__riskTest.state());
    await page.locator('#bossLootEquip').click();
    if(index<decisionCount-1)await expect.poll(()=>page.evaluate(()=>window.__riskTest.state().lootIndex)).toBe(index+1);
    const after=await page.evaluate(()=>window.__riskTest.state());
    expect(Object.values(after.equipped)).toContain(before.lootUid);
  }

  await expect(page.locator('#bossLootPath')).toHaveAttribute('aria-hidden','false');
  await expect(page.locator('#bossLootGrid .bossLootItem.equipped')).toHaveCount(decisionCount);
  await page.locator('#bossLootPush').click();

  await expect(page.locator('#bossLootOverlay')).not.toHaveClass(/show/);
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.state().postBossIntent)).toBe('deeper');
  await expect(page.locator('#moduleOverlay')).toHaveClass(/show/);
  expect(pageErrors).toEqual([]);
});

test('keep stores Champion loot without equipping it',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.locator('#settingsButton').click();
  await page.locator('#devButton').click();
  await page.locator('#devWarden').click();
  expect(await page.evaluate(()=>window.__riskTest.defeatChampion())).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.state().lootOrbReady)).toBe(true);
  const orbPoint=await page.evaluate(()=>window.__riskTest.bossLootOrbPoint());
  await page.locator('#world').click({position:orbPoint,force:true});
  await expect(page.locator('#bossLootDecision')).toHaveAttribute('aria-hidden','false');
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.state().lootUid)).not.toBeNull();
  const before=await page.evaluate(()=>window.__riskTest.state());
  await page.locator('#bossLootKeep').click();
  const after=await page.evaluate(()=>window.__riskTest.state());
  expect(Object.values(after.equipped)).not.toContain(before.lootUid);
  const stored=await page.evaluate(uid=>window.__riskTest.equipmentInventory().find(item=>item.uid===uid),before.lootUid);
  expect(stored).toBeTruthy();
  expect(stored.equipped).toBe(false);
});

test('salvage destroys loot and permanently stores rarity rewards on mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);

  await page.locator('#settingsButton').click();
  await page.locator('#devButton').click();
  await page.locator('#devWarden').click();
  expect(await page.evaluate(()=>window.__riskTest.defeatChampion())).toBe(true);
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.state().lootOrbReady)).toBe(true);
  const orbPoint=await page.evaluate(()=>window.__riskTest.bossLootOrbPoint());
  await page.locator('#world').click({position:orbPoint,force:true});
  await expect(page.locator('#bossLootDecision')).toHaveAttribute('aria-hidden','false');

  expect(await page.evaluate(()=>window.__riskTest.forceLootDecisionRarity('legendary'))).toBe(true);
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
