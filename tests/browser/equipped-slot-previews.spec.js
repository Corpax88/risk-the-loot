const {test,expect}=require('@playwright/test');
const path=require('path');

async function openArmory(page,viewport){
  await page.setViewportSize(viewport);
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

async function previewMetrics(page){
  return page.locator('#gearLoadoutSlots .gearLoadoutSlot.filled').evaluateAll(slots=>slots.map(slot=>{
    const canvas=slot.querySelector('.equippedGearPreview');
    if(!canvas||canvas.hidden)return{slot:slot.dataset.displaySlot,missing:true};
    const {width,height}=canvas,rgba=canvas.getContext('2d').getImageData(0,0,width,height).data;
    let minX=width,minY=height,maxX=-1,maxY=-1,edgeOpaque=0;
    for(let y=0;y<height;y++)for(let x=0;x<width;x++){
      if(rgba[(y*width+x)*4+3]<=8)continue;
      if(x<minX)minX=x;if(y<minY)minY=y;if(x>maxX)maxX=x;if(y>maxY)maxY=y;
      if(x===0||y===0||x===width-1||y===height-1)edgeOpaque++;
    }
    const visibleWidth=Math.max(0,maxX-minX+1),visibleHeight=Math.max(0,maxY-minY+1);
    return{
      slot:slot.dataset.displaySlot,
      itemId:canvas.dataset.itemId,
      assetId:canvas.dataset.assetId,
      missing:maxX<0,
      widthRatio:visibleWidth/width,
      heightRatio:visibleHeight/height,
      maxRatio:Math.max(visibleWidth/width,visibleHeight/height),
      centerX:(minX+maxX+1)/(2*width),
      centerY:(minY+maxY+1)/(2*height),
      edgeOpaque
    };
  }));
}

function expectFilledAndCentered(metrics){
  expect(metrics).toHaveLength(6);
  for(const preview of metrics){
    expect(preview.missing,`${preview.slot} should use its production preview`).toBe(false);
    expect(preview.assetId,`${preview.slot} should expose its source asset`).toBeTruthy();
    expect(preview.maxRatio,`${preview.slot} should visually fill its circle`).toBeGreaterThan(.53);
    expect(Math.abs(preview.centerX-.5),`${preview.slot} should be horizontally centered`).toBeLessThan(.035);
    expect(Math.abs(preview.centerY-.5),`${preview.slot} should be vertically centered`).toBeLessThan(.035);
    expect(preview.edgeOpaque,`${preview.slot} should remain inside the circular mask`).toBe(0);
  }
}

test('every production set fills and centers equipped slot previews',async({page})=>{
  test.setTimeout(90000);
  await openArmory(page,{width:1280,height:900});
  const catalog=await page.evaluate(()=>window.__riskTest.gearSetCatalog());
  for(const set of catalog){
    await page.evaluate(setId=>window.__riskTest.previewGearSet(setId),set.id);
    await expect.poll(()=>page.locator('#gearLoadoutSlots .equippedGearPreview:not([hidden])').count()).toBe(6);
    expectFilledAndCentered(await previewMetrics(page));
  }
});

test('Lava cape and boots remain large, clipped and sharp on desktop and iPhone',async({browser})=>{
  for(const setup of [
    {name:'desktop',viewport:{width:1280,height:900}},
    {name:'iphone',viewport:{width:390,height:844},isMobile:true,hasTouch:true}
  ]){
    const context=await browser.newContext(setup);
    const page=await context.newPage();
    await openArmory(page,setup.viewport);
    await page.evaluate(()=>window.__riskTest.previewGearSet('lavaSet'));
    await expect.poll(()=>page.locator('#gearLoadoutSlots .equippedGearPreview:not([hidden])').count()).toBe(6);
    const metrics=await previewMetrics(page);
    expectFilledAndCentered(metrics);
    for(const slot of ['coat','boots'])expect(metrics.find(entry=>entry.slot===slot).maxRatio).toBeGreaterThan(.6);
    await page.locator('#gearCharacterStage').screenshot({
      path:path.join('test-results','equipped-slot-previews',`lava-${setup.name}.png`),
      animations:'disabled'
    });
    await context.close();
  }
});

test('rapid replacement and reload leave one current preview per equipped display slot',async({page})=>{
  await openArmory(page,{width:390,height:844});
  const loadouts=[
    ['lavaSet-hat','lavaSet-scarf','lavaSet-coat','lavaSet-hammer','lavaSet-boots'],
    ['natureSet-hat','blackHole-scarf','stormrunner-coat','hammerChoir-hammer','fatebound-boots']
  ];
  for(let pass=0;pass<20;pass++){
    const expected=loadouts[pass%2];
    await page.evaluate(items=>window.__riskTest.previewGearItems(items),expected);
    const slots=page.locator('#gearLoadoutSlots .gearLoadoutSlot.filled');
    await expect(slots).toHaveCount(6);
    await expect(page.locator('#gearLoadoutSlots .equippedGearPreview')).toHaveCount(6);
    await expect(page.locator('#gearLoadoutSlots .equippedGearPreviewFallback:not([hidden])')).toHaveCount(0);
    expectFilledAndCentered(await previewMetrics(page));
  }
  await page.evaluate(()=>window.__riskTest.persistNow());
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.locator('#gearLockerButton').click();
  await expect(page.locator('#gearLoadoutSlots .equippedGearPreview')).toHaveCount(6);
  await expect(page.locator('#gearLoadoutSlots .equippedGearPreviewFallback:not([hidden])')).toHaveCount(0);
  expectFilledAndCentered(await previewMetrics(page));
});
