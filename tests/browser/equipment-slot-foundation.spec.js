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
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest&&window.RiskLootEquipmentBridge))).toBe(true);
}

test('ten canonical slots drive the active Armory while jewelry remains non-visual',async({page})=>{
  await boot(page);
  await page.evaluate(()=>window.__riskTest.previewGearSet('stormrunner'));

  const state=await page.evaluate(()=>window.__riskTest.equipmentState());
  expect(state.slots).toEqual(slots);
  expect(state.visualSlots).toEqual(visualSlots);
  expect(state.setSlots).toEqual(setSlots);
  expect(Object.keys(state.equipped)).toEqual(slots);
  expect(Object.keys(state.anchors)).toEqual(visualSlots);
  expect(Object.values(state.anchors)).toEqual(visualSlots.map(()=>({x:0,y:0,scale:1})));
  for(const slot of visualSlots)expect(state.equipped[slot]).toBeTruthy();
  for(const slot of ['necklace','ring1','ring2'])expect(state.equipped[slot]).toBeNull();

  const loadoutSlots=page.locator('#gearLoadoutSlots .gearLoadoutSlot');
  await expect(loadoutSlots).toHaveCount(10);
  expect(await loadoutSlots.evaluateAll(elements=>elements.map(element=>element.dataset.slot))).toEqual(slots);
  await expect(page.locator('#gearLoadoutSlots .gearLoadoutSlot.filled')).toHaveCount(7);

  const visual=await page.evaluate(()=>window.__riskTest.gearVisualState());
  expect(visual.renderOrder).toEqual(['cape','baseBody','legs','boots','chest','scarf','hat','weapon','effects']);
  expect(visual.layers.map(layer=>layer.id)).toEqual(visualSlots);
  expect(visual.layers.every(layer=>layer.visible)).toBe(true);
});

test('slot state survives save, refresh and a full-set break without ghost channels',async({page})=>{
  await boot(page);
  await page.evaluate(()=>window.__riskTest.previewGearSet('stormrunner'));
  const before=await page.evaluate(()=>window.__riskTest.equipmentState().equipped);
  await page.evaluate(()=>window.__riskTest.persistNow());
  await page.reload();
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest&&window.RiskLootEquipmentBridge))).toBe(true);
  await expect.poll(()=>page.evaluate(expected=>JSON.stringify(window.__riskTest.equipmentState().equipped)===JSON.stringify(expected),before)).toBe(true);

  await page.evaluate(()=>window.RiskLootEquipmentBridge.unequip('chest'));
  const preview=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(preview.matches).toBe(true);
  expect(preview.fullSetId).toBeNull();
  expect(preview.equipped.chest).toBeNull();
  expect(preview.visualChannels.chest.visible).toBe(false);
  expect(preview.visualChannels.weapon.visible).toBe(true);
  expect(preview.visualChannels.cape.visible).toBe(true);
});

test('swapping one visual slot reuses the base and unchanged layer textures',async({page})=>{
  test.setTimeout(90000);
  await boot(page);
  await page.evaluate(()=>{
    window.__riskTest.previewGearSet('stormrunner');
    window.__riskTest.previewGearSet('stormrunner');
    window.__riskTest.gearVisualState(true);
    window.__riskTest.resetEquipmentRenderMetrics();
  });
  const inventory=await page.evaluate(()=>window.__riskTest.equipmentInventory().filter(item=>item.slot==='weapon'));
  const current=inventory.find(item=>item.equipped).uid;
  const replacement=inventory.find(item=>!item.equipped).uid;

  await page.evaluate(uid=>window.RiskLootEquipmentBridge.equip(uid),replacement);
  await page.evaluate(()=>window.__riskTest.gearVisualState(true));
  const changed=await page.evaluate(()=>window.__riskTest.equipmentRenderMetrics());
  expect(changed.layerBuilds).toBeLessThanOrEqual(3);
  expect(changed.paperDollBuilds).toBe(0);

  await page.evaluate(()=>window.__riskTest.resetEquipmentRenderMetrics());
  await page.evaluate(uid=>window.RiskLootEquipmentBridge.equip(uid),current);
  await page.evaluate(()=>window.__riskTest.gearVisualState(true));
  const restored=await page.evaluate(()=>window.__riskTest.equipmentRenderMetrics());
  expect(restored.layerBuilds).toBe(0);
  expect(restored.paperDollBuilds).toBe(0);
});

test('ten-slot equipment UI remains contained on iPhone portrait',async({browser})=>{
  const context=await browser.newContext({...devices['iPhone 13']});
  const page=await context.newPage();
  await boot(page);
  await page.evaluate(()=>window.__riskTest.previewGearSet('stormrunner'));
  const layout=await page.locator('#gearPanel').evaluate(element=>({
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
  expect(layout.pageOverflow).toBeLessThanOrEqual(1);
  expect(layout.panelOverflow).toBeLessThanOrEqual(1);
  expect(layout.slots).toBe(10);
  expect(layout.closeOverlapsSlot).toBe(false);
  await context.close();
});

test('Legs equip, swap, unequip and disposal stay synchronized',async({page})=>{
  await boot(page);
  await page.evaluate(()=>{
    window.__riskTest.previewGearSet('stormrunner');
    window.__riskTest.previewGearSet('stormrunner');
  });
  const legs=await page.evaluate(()=>window.__riskTest.equipmentInventory().filter(item=>item.slot==='legs'));
  const first=legs.find(item=>!item.equipped);
  const second=legs.find(item=>item.equipped);

  await page.evaluate(uid=>window.RiskLootEquipmentBridge.equip(uid),first.uid);
  let state=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(state.equipped.legs.uid).toBe(first.uid);
  expect(state.visualChannels.legs).toMatchObject({sourceSlot:'legs',visible:true,layer:20,position:'front'});

  await page.evaluate(uid=>window.RiskLootEquipmentBridge.equip(uid),second.uid);
  state=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(state.matches).toBe(true);
  expect(state.equipped.legs.uid).toBe(second.uid);

  await page.evaluate(()=>window.RiskLootEquipmentBridge.unequip('legs'));
  state=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(state.matches).toBe(true);
  expect(state.equipped.legs).toBeNull();
  expect(state.visualChannels.legs.visible).toBe(false);

  const sellConfirm=await page.evaluate(uid=>window.RiskLootEquipmentBridge.dispose(uid,'sell'),first.uid);
  expect(sellConfirm.confirmationRequired).toBe(true);
  const sold=await page.evaluate(uid=>window.RiskLootEquipmentBridge.dispose(uid,'sell'),first.uid);
  const salvageConfirm=await page.evaluate(uid=>window.RiskLootEquipmentBridge.dispose(uid,'salvage'),second.uid);
  expect(salvageConfirm.confirmationRequired).toBe(true);
  const salvaged=await page.evaluate(uid=>window.RiskLootEquipmentBridge.dispose(uid,'salvage'),second.uid);
  expect(sold.ok).toBe(true);
  expect(salvaged.ok).toBe(true);
});

test('cosmetic Legs remain independent from five-piece set completion',async({page})=>{
  await boot(page);
  await page.evaluate(()=>window.__riskTest.previewGearSet('stormrunner'));
  let state=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(state.fullSetId).toBe('stormrunner');
  expect(state.equipped.legs).toBeTruthy();

  await page.evaluate(()=>window.RiskLootEquipmentBridge.unequip('legs'));
  state=await page.evaluate(()=>window.__riskTest.equipmentPreviewState());
  expect(state.fullSetId).toBe('stormrunner');
  await page.evaluate(()=>window.RiskLootEquipmentBridge.unequip('chest'));
  expect(await page.evaluate(()=>window.__riskTest.equipmentPreviewState().fullSetId)).toBeNull();
});

test('incompatible development saves reset cleanly with every slot initialized',async({page})=>{
  await page.addInitScript(()=>localStorage.setItem('scrapbound_prototype_v1',JSON.stringify({version:13,scrap:321,level:7,xp:12,gear:[],equipped:{hat:null,cape:null,chest:null,boots:null,scarf:null,weapon:null}})));
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  const state=await page.evaluate(()=>({equipment:window.__riskTest.equipmentState(),progress:window.__riskTest.progressionState(),resources:window.__riskTest.inventoryResources()}));
  expect(Object.keys(state.equipment.equipped)).toEqual(slots);
  expect(Object.values(state.equipment.equipped).every(value=>value===null)).toBe(true);
  expect(state.progress.saveVersion).toBe(15);
  expect(state.resources.scrap).toBe(0);
});
