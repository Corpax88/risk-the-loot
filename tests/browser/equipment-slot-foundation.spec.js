const {test,expect,devices}=require('@playwright/test');

const slots=['hat','cape','chest','legs','boots','scarf','weapon','necklace','ring1','ring2'];
const visualSlots=['cape','legs','boots','chest','scarf','hat','weapon'];
const setSlots=['hat','scarf','chest','weapon','boots'];

async function boot(page){
  await page.addInitScript(()=>{
    if(sessionStorage.getItem('equipment-foundation-clean'))return;
    localStorage.clear();
    sessionStorage.setItem('equipment-foundation-clean','1');
  });
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest&&window.RiskLootInventoryV2Bridge))).toBe(true);
}

test('ten canonical slots drive state, V1 and V2 while jewelry remains non-visual',async({page})=>{
  await boot(page);
  await page.evaluate(()=>window.__riskTest.previewGearSet('blackHole'));

  const state=await page.evaluate(()=>window.__riskTest.equipmentState());
  expect(state.slots).toEqual(slots);
  expect(state.visualSlots).toEqual(visualSlots);
  expect(state.setSlots).toEqual(setSlots);
  expect(Object.keys(state.equipped)).toEqual(slots);
  expect(Object.keys(state.anchors)).toEqual(visualSlots);
  expect(Object.values(state.anchors)).toEqual(visualSlots.map(()=>({x:0,y:0,scale:1})));
  expect(state.equipped.hat).toBeTruthy();
  expect(state.equipped.chest).toBeTruthy();
  expect(state.equipped.scarf).toBeTruthy();
  expect(state.equipped.weapon).toBeTruthy();
  expect(state.equipped.boots).toBeTruthy();
  for(const slot of ['cape','legs','necklace','ring1','ring2'])expect(state.equipped[slot]).toBeNull();

  const legacySlots=page.locator('#gearLoadoutSlots .gearLoadoutSlot');
  await expect(legacySlots).toHaveCount(10);
  expect(await legacySlots.evaluateAll(elements=>elements.map(element=>element.dataset.slot))).toEqual(slots);
  await expect(page.locator('#gearLoadoutSlots .gearLoadoutSlot.filled')).toHaveCount(5);

  const visual=await page.evaluate(()=>window.__riskTest.gearVisualState());
  expect(visual.renderOrder).toEqual(['cape','baseBody','legs','boots','chest','scarf','hat','weapon','effects']);
  expect(visual.layers.map(layer=>layer.id)).toEqual(visualSlots);
  expect(visual.layers.find(layer=>layer.id==='cape').visible).toBe(false);
  expect(visual.layers.find(layer=>layer.id==='legs').visible).toBe(false);
  expect(visual.layers.filter(layer=>layer.visible).map(layer=>layer.id)).toEqual(['boots','chest','scarf','hat','weapon']);

  await page.locator('#closeGear').click();
  await page.locator('#inventoryV2Button').click();
  await expect(page.locator('#inventoryV2Overlay')).toHaveClass(/show/);
  const v2Slots=page.locator('#inventoryV2Slots .inventoryV2Slot');
  await expect(v2Slots).toHaveCount(10);
  expect(await v2Slots.evaluateAll(elements=>elements.map(element=>element.dataset.slot))).toEqual(slots);
});

test('slot state survives save, refresh and a full-set break without ghost channels',async({page})=>{
  await boot(page);
  await page.evaluate(()=>window.__riskTest.previewGearSet('blackHole'));
  const before=await page.evaluate(()=>window.__riskTest.equipmentState().equipped);
  await page.evaluate(()=>window.__riskTest.persistNow());
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await expect.poll(()=>page.evaluate(expected=>JSON.stringify(window.__riskTest.equipmentState().equipped)===JSON.stringify(expected),before)).toBe(true);

  await page.evaluate(()=>window.RiskLootInventoryV2Bridge.unequip('chest'));
  const preview=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(preview.matches).toBe(true);
  expect(preview.fullSetId).toBeNull();
  expect(preview.equipped.chest).toBeNull();
  expect(preview.visualChannels.chest.visible).toBe(false);
  expect(preview.visualChannels.weapon.visible).toBe(true);
  expect(preview.visualChannels.cape.visible).toBe(false);
});

test('swapping one visual slot reuses the base and every unchanged layer texture',async({page})=>{
  test.setTimeout(90000);
  await boot(page);
  await page.evaluate(()=>{
    window.__riskTest.previewGearSet('hammerChoir');
    window.__riskTest.previewGearSet('blackHole');
    window.__riskTest.gearVisualState(true);
    window.__riskTest.resetEquipmentRenderMetrics();
  });
  const current=await page.evaluate(()=>window.__riskTest.equipmentPreviewState().equipped.weapon.uid);
  const replacement=await page.evaluate(()=>window.__riskTest.equipmentInventory().find(item=>item.slot==='weapon'&&!item.equipped).uid);

  await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.equip(uid),replacement);
  await page.evaluate(()=>window.__riskTest.gearVisualState(true));
  const changed=await page.evaluate(()=>window.__riskTest.equipmentRenderMetrics());
  expect(changed.layerBuilds).toBeLessThanOrEqual(3);
  expect(changed.paperDollBuilds).toBe(0);

  await page.evaluate(()=>window.__riskTest.resetEquipmentRenderMetrics());
  await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.equip(uid),current);
  await page.evaluate(()=>window.__riskTest.gearVisualState(true));
  const restored=await page.evaluate(()=>window.__riskTest.equipmentRenderMetrics());
  expect(restored.layerBuilds).toBe(0);
  expect(restored.paperDollBuilds).toBe(0);
});

test('ten-slot equipment UI remains contained on iPhone portrait',async({browser})=>{
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await boot(page);
  await page.evaluate(()=>window.__riskTest.previewGearSet('natureSet'));
  const legacy=await page.locator('#gearPanel').evaluate(element=>({
    pageOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    panelOverflow:element.scrollWidth-element.clientWidth,
    slots:document.querySelectorAll('#gearLoadoutSlots .gearLoadoutSlot').length,
    closeOverlapsSlot:(()=>{
      const close=document.querySelector('#closeGear').getBoundingClientRect();
      return [...document.querySelectorAll('#gearLoadoutSlots .gearLoadoutSlot')].some(slot=>{
        const box=slot.getBoundingClientRect();
        return close.left<box.right&&close.right>box.left&&close.top<box.bottom&&close.bottom>box.top;
      });
    })()
  }));
  expect(legacy.pageOverflow).toBeLessThanOrEqual(1);
  expect(legacy.panelOverflow).toBeLessThanOrEqual(1);
  expect(legacy.slots).toBe(10);
  expect(legacy.closeOverlapsSlot).toBe(false);

  await page.locator('#closeGear').tap();
  await page.locator('#inventoryV2Button').tap();
  await expect(page.locator('#inventoryV2Slots .inventoryV2Slot')).toHaveCount(10);
  const v2=await page.locator('#inventoryV2Overlay').evaluate(element=>({
    pageOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
    overlayOverflow:element.scrollWidth-element.clientWidth
  }));
  expect(v2.pageOverflow).toBeLessThanOrEqual(1);
  expect(v2.overlayOverflow).toBeLessThanOrEqual(1);
  await context.close();
});

test('Legs equip, swap, unequip and disposal stay synchronized',async({page})=>{
  await boot(page);
  const first=await page.evaluate(()=>window.__riskTest.spawnFoundationLegs('foundationFieldLegs',true));
  const second=await page.evaluate(()=>window.__riskTest.spawnFoundationLegs('foundationGuardLegs',false));
  expect(first.equipped).toBe(true);

  let state=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(state.equipped.legs.uid).toBe(first.uid);
  expect(state.visualChannels.legs).toMatchObject({sourceSlot:'legs',visible:true,layer:20,position:'front'});

  await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.equip(uid),second.uid);
  state=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(state.matches).toBe(true);
  expect(state.equipped.legs.uid).toBe(second.uid);

  await page.evaluate(()=>window.RiskLootInventoryV2Bridge.unequip('legs'));
  state=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(state.matches).toBe(true);
  expect(state.equipped.legs).toBeNull();
  expect(state.visualChannels.legs.visible).toBe(false);

  const sold=await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.dispose(uid,'sell'),first.uid);
  const salvaged=await page.evaluate(uid=>window.RiskLootInventoryV2Bridge.dispose(uid,'salvage'),second.uid);
  expect(sold.ok).toBe(true);
  expect(salvaged.ok).toBe(true);
  const inventory=await page.evaluate(()=>window.__riskTest.equipmentInventory());
  expect(inventory.some(item=>item.uid===first.uid||item.uid===second.uid)).toBe(false);
});

test('Legs remain independent from five-piece set completion',async({page})=>{
  await boot(page);
  await page.evaluate(()=>window.__riskTest.previewGearSet('blackHole'));
  await page.evaluate(()=>window.__riskTest.spawnFoundationLegs('foundationFieldLegs',true));
  let state=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(state.fullSetId).toBe('blackHole');
  expect(state.equipped.legs).toBeTruthy();

  await page.evaluate(()=>window.RiskLootInventoryV2Bridge.unequip('legs'));
  state=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(state.fullSetId).toBe('blackHole');
  await page.evaluate(()=>window.RiskLootInventoryV2Bridge.unequip('chest'));
  expect(await page.evaluate(()=>window.__riskTest.equipmentPreviewState().fullSetId)).toBeNull();
});

test('version 13 saves migrate with an empty Legs slot',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('scrapbound_prototype_v1',JSON.stringify({version:13,scrap:321,level:7,xp:12,gear:[],equipped:{hat:null,cape:null,chest:null,boots:null,scarf:null,weapon:null,necklace:null,ring1:null,ring2:null}})));
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  const state=await page.evaluate(()=>({equipment:window.__riskTest.equipmentState(),progress:window.__riskTest.progressionState(),resources:window.__riskTest.inventoryResources()}));
  expect(state.equipment.equipped.legs).toBeNull();
  expect(state.progress.saveVersion).toBe(14);
  expect(state.resources.scrap).toBe(321);
});
