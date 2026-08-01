const {test,expect}=require('@playwright/test');
const path=require('path');

async function waitForGearBridge(page){
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

test('every current gear item has a Gear 2.0 visual profile',async({page})=>{
  await waitForGearBridge(page);
  const coverage=await page.evaluate(()=>window.__riskTest.gearVisualCoverage());
  expect(coverage).toMatchObject({
    items:155,
    setItems:115,
    legacyItems:40,
    sets:23,
    profiles:23,
    missing:[],
    usesPieceGeometry:true,
    usesStripePattern:false,
    usesLegacyGearOverlay:false
  });
});

test('all sets render every animation without clipping or edge artifacts',async({page})=>{
  test.setTimeout(120000);
  await page.setViewportSize({width:1280,height:900});
  await waitForGearBridge(page);
  const catalog=await page.evaluate(()=>window.__riskTest.gearSetCatalog());
  const previews=[];
  const poseHashes={idle:new Set(),run:new Set(),attack:new Set()};

  for(const set of catalog){
    await page.evaluate(id=>window.__riskTest.previewGearSet(id),set.id);
    await expect.poll(()=>page.evaluate(()=>window.__riskTest.gearVisualState().atlases.idle!==null)).toBe(true);
    const state=await page.evaluate(()=>window.__riskTest.gearVisualState(true));
    expect(state.setId).toBe(set.id);
    expect(state.visualProfile).toBe(set.id);
    expect(state.usesProductionSkin).toBe(['hammerChoir','blackHole','stormrunner','lavaSet','natureSet'].includes(set.id));
    expect(state.layers).toEqual([
      {slot:'coat',region:'chest-gloves'},
      {slot:'scarf',region:'neck'},
      {slot:'boots',region:'boots'},
      {slot:'hat',region:'hat'},
      {slot:'hammer',region:'hammer'}
    ]);

    for(const pose of ['idle','run','attack']){
      const atlas=state.atlases[pose];
      expect(atlas.width).toBe(2048);
      expect(atlas.height).toBe(1024);
      expect(atlas.opaque).toBeGreaterThan(400);
      expect(atlas.corners.every(alpha=>alpha===0)).toBe(true);
      expect(atlas.frames).toHaveLength(8);
      expect(atlas.frames.every(frame=>frame.bounds&&frame.edgeOpaque===0)).toBe(true);
      expect(new Set(atlas.frames.map(frame=>frame.hash)).size).toBeGreaterThanOrEqual(4);
      expect(poseHashes[pose].has(atlas.hash),`${set.name} should not duplicate another ${pose} visual`).toBe(false);
      poseHashes[pose].add(atlas.hash);
    }

    previews.push({
      id:set.id,
      name:set.name,
      rarity:set.rarity,
      poses:['idle','run','attack'].map(pose=>({pose,image:state.atlases[pose].preview}))
    });
  }

  for(const pose of ['idle','run','attack'])expect(poseHashes[pose].size).toBe(catalog.length);
  await page.evaluate(cards=>{
    document.body.innerHTML='<main id="contact"></main>';
    const style=document.createElement('style');
    style.textContent='*{box-sizing:border-box}html,body{height:auto!important;min-height:0!important;overflow:visible!important}body{margin:0;background:#080d16;color:#f4ead6;font-family:Georgia,serif}#contact{display:grid;grid-template-columns:repeat(4,330px);gap:10px;padding:12px;width:max-content}.card{position:relative;height:220px;overflow:hidden;border:1px solid #53637d;background:linear-gradient(#203b61,#0b1422)}.poses{display:grid;grid-template-columns:repeat(3,1fr);padding:9px 6px 34px}.pose{display:grid;text-align:center;color:#9fb1cc;font:9px system-ui;text-transform:uppercase}.pose img{display:block;width:104px;height:165px;object-fit:contain}.card>b{position:absolute;left:8px;right:8px;bottom:7px;padding:5px;border:1px solid #d6aa58;background:#080d16e8;text-align:center;font-size:11px;letter-spacing:1px}.card[data-rarity="legendary"]{border-color:#f2c14f;box-shadow:inset 0 0 28px #f2c14f22}';
    document.head.appendChild(style);
    const root=document.querySelector('#contact');
    for(const card of cards){const article=document.createElement('article');article.className='card';article.dataset.rarity=card.rarity;const poses=document.createElement('div');poses.className='poses';for(const entry of card.poses){const pose=document.createElement('span');pose.className='pose';const image=document.createElement('img');image.src=entry.image;pose.append(image,entry.pose);poses.appendChild(pose)}const title=document.createElement('b');title.textContent=card.name;article.append(poses,title);root.appendChild(article)}
  },previews);
  await page.screenshot({path:path.join('test-results','gear-reference','all-sets-contact-sheet.png'),fullPage:true});
});

test('every rarity renders in Character Preview and Inventory on desktop',async({page})=>{
  test.setTimeout(60000);
  await page.setViewportSize({width:1280,height:900});
  await waitForGearBridge(page);
  for(const rarity of ['common','rare','epic','legendary']){
    const state=await page.evaluate(id=>window.__riskTest.previewGearRarity(id),rarity);
    expect(state.rarity).toBe(rarity);
    for(const pose of ['idle','run','attack']){
      expect(state.atlases[pose].frames.every(frame=>frame.edgeOpaque===0)).toBe(true);
    }
  }
  await expect(page.locator('#gearCharacterStage')).toBeVisible();
  await page.locator('#gearCharacterStage').screenshot({
    path:path.join('test-results','gear-reference','all-rarities-character-preview.png')
  });
  await expect(page.locator('#gearGrid')).toBeVisible();
  await expect(page.locator('#gearDetail')).toBeVisible();
  await page.mouse.move(1275,895);
  await page.waitForTimeout(180);
  await page.locator('#gearPanel').screenshot({
    path:path.join('test-results','gear-reference','inventory-desktop.png')
  });
});

test('legendary Loadout and Bag remain readable without clipping on mobile',async({page})=>{
  await page.setViewportSize({width:390,height:844});
  await waitForGearBridge(page);
  await page.evaluate(()=>window.__riskTest.previewGearSet('fatebound'));
  await expect(page.locator('#gearCharacterStage')).toBeVisible();
  const box=await page.locator('#gearCharacterStage').boundingBox();
  expect(box.width).toBeLessThanOrEqual(390);
  expect(box.height).toBeGreaterThan(180);
  await page.locator('#gearCharacterStage').screenshot({
    path:path.join('test-results','gear-reference','fatebound-mobile.png')
  });
  await expect(page.locator('#gearGrid')).toBeVisible();
  const mobileLayout=await page.locator('#gearPanel').evaluate(element=>({
    left:element.getBoundingClientRect().left,
    right:element.getBoundingClientRect().right,
    viewport:document.documentElement.clientWidth,
    overflow:element.scrollWidth-element.clientWidth
  }));
  expect(mobileLayout.left).toBeGreaterThanOrEqual(0);
  expect(mobileLayout.right).toBeLessThanOrEqual(mobileLayout.viewport);
  expect(mobileLayout.overflow).toBeLessThanOrEqual(1);
  await page.mouse.move(388,842);
  await page.waitForTimeout(180);
  await page.locator('#gearPanel').screenshot({
    path:path.join('test-results','gear-reference','inventory-mobile.png')
  });
});

test('legendary equipment remains applied in live expedition combat',async({page})=>{
  await page.setViewportSize({width:1280,height:800});
  await waitForGearBridge(page);
  await page.evaluate(()=>window.__riskTest.previewGearSet('crownlessKing'));
  await page.locator('#closeGear').click();
  const enemy=await page.evaluate(()=>window.__riskTest.fightEnemy('brute',155,0));
  expect(enemy.type).toBe('brute');
  await page.waitForTimeout(650);
  const state=await page.evaluate(()=>window.__riskTest.gearVisualState());
  expect(state.setId).toBe('crownlessKing');
  await page.locator('#world').screenshot({
    path:path.join('test-results','gear-reference','crownless-live-combat.png')
  });
});

test('Black Hole legendary remains readable and gathers the combat pack',async({page})=>{
  test.setTimeout(60000);
  await page.setViewportSize({width:1280,height:900});
  await waitForGearBridge(page);
  await page.evaluate(()=>window.__riskTest.previewGearSet('blackHole'));
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.gearVisualState().setId)).toBe('blackHole');
  await page.locator('#gearCharacterStage').screenshot({
    path:path.join('test-results','gear-reference','black-hole-armory-desktop.png')
  });

  await page.locator('#closeGear').click();
  const gravity=await page.evaluate(()=>window.__riskTest.blackHoleProbe());
  expect(gravity).toMatchObject({setId:'blackHole',hits:18,pulled:18,enemies:18});
  expect(gravity.effects).toContain('blackHoleVfx');
  await page.waitForTimeout(80);
  await page.locator('#world').screenshot({
    path:path.join('test-results','gear-reference','black-hole-gravity-well.png')
  });

  await page.setViewportSize({width:390,height:844});
  await waitForGearBridge(page);
  await page.evaluate(()=>window.__riskTest.previewGearSet('blackHole'));
  const stage=page.locator('#gearCharacterStage');
  await expect(stage).toBeVisible();
  const box=await stage.boundingBox();
  expect(box.width).toBeLessThanOrEqual(390);
  expect(box.height).toBeGreaterThan(180);
  await stage.screenshot({
    path:path.join('test-results','gear-reference','black-hole-armory-mobile.png')
  });
});
