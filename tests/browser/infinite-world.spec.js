const {test,expect}=require('@playwright/test');
const fs=require('fs');
const path=require('path');

async function ready(page,seed=73){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright&mapSeed='+seed);
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  return page.evaluate(value=>window.__riskTest.openMapSeed('guild',value),seed)
}

test('streams deterministic regions seamlessly in all four directions',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  const origin=await ready(page,73);
  expect(origin.infinite).toBe(true);
  expect(origin.region).toMatchObject({x:0,y:0});
  expect(origin.loadedRegions).toHaveLength(9);
  const originalSeed=origin.region.seed;

  const east=await page.evaluate(portal=>window.__riskTest.movePlayer(portal.x+80,portal.y),origin.portals.east);
  expect(east.region).toMatchObject({x:1,y:0});
  expect(east.player.x).toBeGreaterThan(2400);
  expect(east.loadedRegions).toHaveLength(9);
  expect(east.region.danger).toBeGreaterThan(origin.region.danger);

  const north=await page.evaluate(portal=>window.__riskTest.movePlayer(portal.x,portal.y-80),east.portals.north);
  expect(north.region).toMatchObject({x:1,y:-1});
  expect(north.player.y).toBeLessThan(0);
  expect(north.loadedRegions).toHaveLength(9);

  const west=await page.evaluate(portal=>window.__riskTest.movePlayer(portal.x-80,portal.y),north.portals.west);
  expect(west.region).toMatchObject({x:0,y:-1});
  const returned=await page.evaluate(portal=>window.__riskTest.movePlayer(portal.x,portal.y+80),west.portals.south);
  expect(returned.region).toMatchObject({x:0,y:0});
  expect(returned.region.seed).toBe(originalSeed);
  expect(returned.loadedRegions).toHaveLength(9);
  expect(returned.obstacles.length).toBeLessThan(420);

  const anchors=await page.evaluate(()=>window.__riskTest.sampleSpawnAnchors(4));
  expect(anchors).toHaveLength(4);
  expect(anchors.every(anchor=>!anchor.blocked&&anchor.distance>380)).toBe(true);
  expect(await page.evaluate(()=>document.querySelector('#world').toDataURL('image/png').length)).toBeGreaterThan(10000);
  expect(errors).toEqual([])
});

test('infinite region seam remains filled and readable on desktop and iPhone',async({browser})=>{
  const output=path.join('test-results','infinite-world');
  fs.mkdirSync(output,{recursive:true});
  for(const config of [
    {name:'desktop',viewport:{width:1366,height:768},mobile:false},
    {name:'iphone',viewport:{width:390,height:844},mobile:true}
  ]){
    const context=await browser.newContext({viewport:config.viewport,isMobile:config.mobile,hasTouch:config.mobile});
    const page=await context.newPage();
    const origin=await ready(page,512);
    const seam=await page.evaluate(portal=>window.__riskTest.movePlayer(portal.x+12,portal.y),origin.portals.east);
    expect(seam.region).toMatchObject({x:1,y:0});
    await page.waitForTimeout(180);
    await expect(page.locator('#mapSeedDebug')).toContainText('REGION 1,0');
    await expect(page.locator('#world')).toBeVisible();
    const canvasShot=await page.locator('#world').screenshot({path:path.join(output,config.name+'-east-seam.png')});
    expect(canvasShot.length).toBeGreaterThan(10000);
    await context.close()
  }
});
