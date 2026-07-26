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
    items:140,
    setItems:100,
    legacyItems:40,
    sets:20,
    profiles:20,
    missing:[],
    usesStripePattern:false
  });
});

test('all twenty sets render complete animated atlases without opaque edges',async({page})=>{
  test.setTimeout(120000);
  await page.setViewportSize({width:1280,height:900});
  await waitForGearBridge(page);
  const catalog=await page.evaluate(()=>window.__riskTest.gearSetCatalog());
  const previews=[];
  const idleHashes=new Set();

  for(const set of catalog){
    await page.evaluate(id=>window.__riskTest.previewGearSet(id),set.id);
    await expect.poll(()=>page.evaluate(()=>window.__riskTest.gearVisualState().atlases.idle!==null)).toBe(true);
    const state=await page.evaluate(()=>window.__riskTest.gearVisualState(true));
    expect(state.setId).toBe(set.id);
    expect(state.visualProfile).toBe(set.id);
    expect(state.usesProductionSkin).toBe(set.id==='hammerChoir');

    for(const pose of ['idle','run','attack']){
      const atlas=state.atlases[pose];
      expect(atlas.width).toBe(2048);
      expect(atlas.height).toBe(1024);
      expect(atlas.opaque).toBeGreaterThan(400);
      expect(atlas.corners.every(alpha=>alpha===0)).toBe(true);
    }

    expect(idleHashes.has(state.atlases.idle.hash),`${set.name} should not duplicate another set visual`).toBe(false);
    idleHashes.add(state.atlases.idle.hash);
    previews.push({id:set.id,name:set.name,rarity:set.rarity,image:state.atlases.idle.preview});
  }

  expect(idleHashes.size).toBe(catalog.length);
  await page.evaluate(cards=>{
    document.body.innerHTML='<main id="contact"></main>';
    const style=document.createElement('style');
    style.textContent='*{box-sizing:border-box}html,body{height:auto!important;min-height:0!important;overflow:visible!important}body{margin:0;background:#080d16;color:#f4ead6;font-family:Georgia,serif}#contact{display:grid;grid-template-columns:repeat(4,280px);gap:10px;padding:12px;width:max-content}.card{position:relative;height:300px;overflow:hidden;border:1px solid #53637d;background:linear-gradient(#203b61,#0b1422)}.card img{display:block;width:280px;height:280px;object-fit:contain}.card b{position:absolute;left:8px;right:8px;bottom:7px;padding:5px;border:1px solid #d6aa58;background:#080d16e8;text-align:center;font-size:11px;letter-spacing:1px}.card[data-rarity="legendary"]{border-color:#f2c14f;box-shadow:inset 0 0 28px #f2c14f22}.card[data-rarity="mythic"]{border-color:#ec6670}';
    document.head.appendChild(style);
    const root=document.querySelector('#contact');
    for(const card of cards){const article=document.createElement('article');article.className='card';article.dataset.rarity=card.rarity;const image=document.createElement('img');image.src=card.image;const title=document.createElement('b');title.textContent=card.name;article.append(image,title);root.appendChild(article)}
  },previews);
  await page.screenshot({path:path.join('test-results','gear-reference','all-sets-contact-sheet.png'),fullPage:true});
});

test('legendary loadout remains readable in the mobile Gear Locker',async({page})=>{
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
