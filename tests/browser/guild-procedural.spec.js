const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

test('Guild Outskirts seeds stay connected, reproducible, and spawn away from Pappa',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);

  const signatures=new Set();
  for(const seed of [7,42,73,144,255,512,777,999]){
    const first=await page.evaluate(value=>window.__riskTest.openGuildSeed(value),seed);
    const second=await page.evaluate(value=>window.__riskTest.openGuildSeed(value),seed);
    expect(first.procedural).toBe(true);
    expect(first.seed).toBe(seed);
    expect(first.validation.valid).toBe(true);
    expect(first.pathRows).toEqual(second.pathRows);
    expect(first.obstacles).toEqual(second.obstacles);
    expect(first.spawnZones).toEqual(second.spawnZones);
    expect(first.player.x).toBeLessThan(220);
    expect(first.spawnZones.length).toBeGreaterThanOrEqual(10);
    expect(first.bossGuideVisible).toBe(false);
    const anchors=await page.evaluate(()=>window.__riskTest.sampleSpawnAnchors(4));
    expect(anchors).toHaveLength(4);
    expect(anchors.every(anchor=>!anchor.blocked&&anchor.distance>380)).toBe(true);
    expect(anchors.some(anchor=>!anchor.visible)).toBe(true);
    expect(new Set(anchors.map(anchor=>Math.floor(((anchor.angle+Math.PI)/(Math.PI*2))*8)%8)).size).toBeGreaterThan(1);
    signatures.add(first.pathRows.join('-')+'|'+first.moduleKinds.join('-'));
  }
  expect(signatures.size).toBeGreaterThan(4);
  await page.evaluate(()=>window.__riskTest.fightBoss('warden'));
  expect((await page.evaluate(()=>window.__riskTest.mapState())).bossGuideVisible).toBe(true);
  expect(pageErrors).toEqual([]);
});

test('Guild Outskirts keeps the fixed arena fallback available',async({page})=>{
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright&fixedArena=1&mapSeed=42');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  const state=await page.evaluate(()=>window.__riskTest.openMap('guild'));
  expect(state.procedural).toBe(false);
  expect(state.obstacles).toHaveLength(14);
  expect(state.player).toEqual({x:1200,y:800});
});

test('procedural frontier remains readable on desktop and iPhone',async({browser},testInfo)=>{
  const output=path.join('test-results','guild-procedural');
  fs.mkdirSync(output,{recursive:true});
  for(const config of [
    {name:'desktop',viewport:{width:1280,height:720},mobile:false},
    {name:'iphone',viewport:{width:390,height:844},mobile:true}
  ]){
    const context=await browser.newContext({viewport:config.viewport,isMobile:config.mobile,hasTouch:config.mobile});
    const page=await context.newPage();
    await page.addInitScript(()=>localStorage.clear());
    await page.goto('/?playwright&mapSeed=73');
    await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
    const state=await page.evaluate(()=>window.__riskTest.openGuildSeed(73));
    expect(state.validation.valid).toBe(true);
    await page.waitForTimeout(300);
    await page.screenshot({path:path.join(output,config.name+'.png'),fullPage:true});
    await expect(page.locator('#mapSeedDebug')).toContainText('SEED 73');
    await expect(page.locator('#world')).toBeVisible();
    await context.close();
  }
});
