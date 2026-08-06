const {test,expect,devices}=require('@playwright/test');

async function openGame(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

async function directLayerSources(page){
  return page.locator('#gearCharacterStage .gearCharacterHero [data-character-layer]').evaluateAll(nodes=>nodes.map(node=>({
    layer:node.dataset.characterLayer,
    kind:node.dataset.kind,
    hidden:node.hidden,
    image:getComputedStyle(node).backgroundImage
  })));
}

test('quality presets preserve native Armory artwork while changing visual budgets',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await openGame(page);
  await page.evaluate(()=>window.__riskTest.previewGearSetPieces('stormrunner',5));
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  const original=await directLayerSources(page);
  expect(original).toHaveLength(8);
  expect(original.every(layer=>layer.kind==='aligned'&&!layer.hidden&&!layer.image.startsWith('url("data:'))).toBe(true);

  for(const [preset,active,label,cell] of [
    ['performance','low','PERFORMANCE',192],
    ['normal','medium','NORMAL',256],
    ['high','high','HIGH',320]
  ]){
    const state=await page.evaluate(value=>window.__riskTest.setVisualQuality(value),preset);
    expect(state.active).toBe(active);
    expect(state.activeLabel).toBe(label);
    expect(state.characterCell).toBe(cell);
    expect(await directLayerSources(page)).toEqual(original);
  }
});

test('Auto adapts only during gameplay and defers character atlas changes safely',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await openGame(page);
  await page.evaluate(()=>window.__riskTest.previewGearSetPieces('stormrunner',5));
  await page.evaluate(()=>window.__riskTest.setVisualQuality('auto'));
  const menuState=await page.evaluate(()=>window.__riskTest.simulateFramePerformance(45,500,'high'));
  expect(menuState.requested).toBe('auto');
  expect(menuState.active).toBe('high');
  expect(menuState.characterCell).toBe(320);

  await page.locator('#closeGear').click();
  await page.evaluate(()=>window.__riskTest.spawnHammerstormPack(12,{fullLightning:true,durable:true}));
  const combatState=await page.evaluate(()=>window.__riskTest.simulateFramePerformance(45,500,'high'));
  expect(combatState.active).toBe('medium');
  expect(combatState.characterCell).toBe(320);
  expect(combatState.pendingCharacterCell).toBe(256);

  await page.evaluate(()=>window.__riskTest.showUiResultTest());
  const baseState=await page.evaluate(()=>window.__riskTest.performanceState());
  expect(baseState.characterCell).toBe(256);
  expect(baseState.pendingCharacterCell).toBe(0);
});

test('Auto starts at a mobile-appropriate profile',async({browser})=>{
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await openGame(page);
  const state=await page.evaluate(()=>window.__riskTest.setVisualQuality('auto'));
  expect(['medium','low']).toContain(state.active);
  expect(['NORMAL','PERFORMANCE']).toContain(state.activeLabel);
  expect(state.profile.dpr).toBeLessThanOrEqual(1.5);
  await context.close();
});

test('gameplay composites use the active quality resolution and reuse unchanged loadouts',async({page})=>{
  await page.setViewportSize({width:1440,height:900});
  await openGame(page);
  await page.evaluate(()=>{
    window.__riskTest.setVisualQuality('high');
    window.__riskTest.resetEquipmentRenderMetrics();
    window.__riskTest.previewGearSetPieces('stormrunner',5);
  });
  await page.locator('#closeGear').click();

  await expect.poll(()=>page.evaluate(()=>window.__riskTest.equipmentPreviewState().runtimeMatches)).toBe(true);
  const first=await page.evaluate(()=>({
    quality:window.__riskTest.performanceState(),
    preview:window.__riskTest.equipmentPreviewState(),
    metrics:window.__riskTest.equipmentRenderMetrics()
  }));
  expect(first.preview.atlas).toEqual({width:first.quality.characterCell*4,height:first.quality.characterCell*2});
  expect(first.metrics.gameplayCompositeBuilds).toBe(3);

  await page.evaluate(()=>window.__riskTest.gearVisualState());
  const unchanged=await page.evaluate(()=>window.__riskTest.equipmentRenderMetrics());
  expect(unchanged.gameplayCompositeBuilds).toBe(first.metrics.gameplayCompositeBuilds);
});
