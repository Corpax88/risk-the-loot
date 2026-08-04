const {test,expect,devices}=require('@playwright/test');
const path=require('path');

async function openArmory(page,viewport){
  if(viewport)await page.setViewportSize(viewport);
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(()=>{
    window.__riskTest.previewGearSet('hammerChoir');
    window.__riskTest.previewGearSet('fatebound');
  });
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  await page.waitForTimeout(1200);
}

async function desktopGeometry(page){
  return page.evaluate(()=>{
    const box=element=>{
      const rect=element.getBoundingClientRect();
      return{left:rect.left,top:rect.top,right:rect.right,bottom:rect.bottom,width:rect.width,height:rect.height};
    };
    const panel=document.querySelector('#gearPanel');
    const workspace=document.querySelector('.unifiedEquipmentWorkspace');
    const character=document.querySelector('.unifiedCharacterPanel');
    const browser=document.querySelector('.unifiedGearBrowser');
    const stage=document.querySelector('#gearCharacterStage');
    const inventory=document.querySelector('.gearInventoryPanel');
    const detail=document.querySelector('#gearDetail');
    const toolbar=document.querySelector('.gearToolbar');
    const grid=document.querySelector('#gearGrid');
    const bagBrowser=document.querySelector('.gearBagBrowser');
    const filterButtons=[...document.querySelectorAll('#gearFilters button')].map(box);
    const slots=[...grid.querySelectorAll('.gearBagSlot')].map(slot=>{
      const art=slot.querySelector('.gearArt');
      return{slot:box(slot),art:art?box(art):null};
    });
    const loadoutSlots=[...document.querySelectorAll('#gearLoadoutSlots .gearLoadoutSlot')].map(slot=>({
      name:slot.dataset.displaySlot,
      box:box(slot)
    }));
    return{
      viewport:{width:innerWidth,height:innerHeight},
      panel:box(panel),workspace:box(workspace),character:box(character),browser:box(browser),stage:box(stage),inventory:box(inventory),detail:box(detail),toolbar:box(toolbar),grid:box(grid),bagBrowser:box(bagBrowser),
      pageOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
      panelOverflowX:panel.scrollWidth-panel.clientWidth,
      panelOverflowY:panel.scrollHeight-panel.clientHeight,
      panelOverflow:getComputedStyle(panel).overflow,
      gridOverflow:getComputedStyle(grid).overflowY,
      toolbarVisible:getComputedStyle(toolbar).display!=='none',
      filterButtons,
      slots,loadoutSlots
    };
  });
}

for(const viewport of [
  {name:'laptop-1366',width:1366,height:768},
  {name:'desktop-1920',width:1920,height:1080},
  {name:'laptop-1280',width:1280,height:800}
]){
  test(`${viewport.name} keeps every Armory column and item inside its viewport`,async({page})=>{
    await openArmory(page,viewport);
    const layout=await desktopGeometry(page);
    expect(layout.toolbarVisible).toBe(true);
    expect(layout.filterButtons).toHaveLength(11);
    for(const button of layout.filterButtons){
      expect(button.left).toBeGreaterThanOrEqual(layout.toolbar.left);
      expect(button.right).toBeLessThanOrEqual(layout.toolbar.right+1);
      expect(button.top).toBeGreaterThanOrEqual(layout.toolbar.top);
      expect(button.bottom).toBeLessThanOrEqual(layout.toolbar.bottom+1);
    }
    expect(layout.panel.left).toBeGreaterThanOrEqual(0);
    expect(layout.panel.right).toBeLessThanOrEqual(viewport.width);
    expect(layout.panel.bottom).toBeLessThanOrEqual(viewport.height);
    expect(layout.character.right).toBeLessThanOrEqual(layout.browser.left+1);
    expect(layout.detail.left).toBeGreaterThanOrEqual(layout.browser.left-1);
    expect(layout.detail.right).toBeLessThanOrEqual(layout.browser.right+1);
    expect(layout.inventory.left).toBeGreaterThanOrEqual(layout.browser.left-1);
    expect(layout.inventory.right).toBeLessThanOrEqual(layout.browser.right+1);
    expect(layout.detail.bottom).toBeLessThanOrEqual(layout.inventory.top+1);
    expect(layout.pageOverflow).toBeLessThanOrEqual(1);
    expect(layout.panelOverflowX).toBeLessThanOrEqual(1);
    expect(layout.panelOverflowY).toBeLessThanOrEqual(1);
    expect(layout.panelOverflow).toBe('hidden');
    expect(layout.gridOverflow).toBe('auto');
    for(const entry of layout.slots){
      expect(entry.slot.left).toBeGreaterThanOrEqual(layout.bagBrowser.left-1);
      expect(entry.slot.right).toBeLessThanOrEqual(layout.bagBrowser.right+1);
      expect(Math.abs(entry.slot.width-entry.slot.height)).toBeLessThanOrEqual(2);
      expect(entry.art.left).toBeGreaterThanOrEqual(entry.slot.left-1);
      expect(entry.art.top).toBeGreaterThanOrEqual(entry.slot.top-1);
      expect(entry.art.right).toBeLessThanOrEqual(entry.slot.right+1);
      expect(entry.art.bottom).toBeLessThanOrEqual(entry.slot.bottom+1);
    }
    expect(layout.loadoutSlots).toHaveLength(10);
    for(const entry of layout.loadoutSlots){
      expect(entry.box.left).toBeGreaterThanOrEqual(layout.stage.left-1);
      expect(entry.box.right).toBeLessThanOrEqual(layout.stage.right+1);
      expect(entry.box.top).toBeGreaterThanOrEqual(layout.stage.top-1);
      expect(entry.box.bottom).toBeLessThanOrEqual(layout.stage.bottom+1);
    }
    if(process.env.CAPTURE_INVENTORY)await page.screenshot({
      path:path.join('test-results','inventory-layout',`${viewport.name}.png`),
      animations:'disabled'
    });
  });
}

test('Remove hover remains local and does not animate or resize the Armory',async({page})=>{
  await openArmory(page,{width:1366,height:768});
  const equipped=await page.evaluate(()=>window.__riskTest.equipmentInventory().find(item=>item.equipped));
  await page.locator(`#gearGrid [data-item="${equipped.uid}"]`).click();
  const remove=page.locator('#gearDetail .equipGear');
  await expect(remove).toHaveText('REMOVE');
  const before=await desktopGeometry(page);
  await remove.hover();
  await page.waitForTimeout(450);
  const after=await desktopGeometry(page);
  const animation=await page.locator('#gearDetail .gearDetailCard').evaluate(element=>({
    animationName:getComputedStyle(element).animationName,
    opacity:getComputedStyle(element).opacity,
    transform:getComputedStyle(element).transform
  }));
  expect(after.panel).toEqual(before.panel);
  expect(after.character).toEqual(before.character);
  expect(after.toolbar).toEqual(before.toolbar);
  expect(after.inventory).toEqual(before.inventory);
  expect(after.detail).toEqual(before.detail);
  expect(['','none']).toContain(animation.animationName);
  expect(['','1']).toContain(animation.opacity);
  expect(['','none']).toContain(animation.transform);
});

test('custom pointer drag keeps card dimensions and restores invalid drops',async({page})=>{
  await openArmory(page,{width:1366,height:768});
  const item=await page.evaluate(()=>window.__riskTest.equipmentInventory().find(entry=>!entry.equipped));
  const card=page.locator(`#gearGrid [data-item="${item.uid}"]`);
  const source=await card.boundingBox();
  const start={x:source.x+source.width*.3,y:source.y+source.height*.4};
  await card.dispatchEvent('pointerdown',{pointerId:31,pointerType:'mouse',button:0,clientX:start.x,clientY:start.y});
  await card.dispatchEvent('pointermove',{pointerId:31,pointerType:'mouse',buttons:1,clientX:start.x+24,clientY:start.y+18});
  const ghost=page.locator('.gearDragGhost');
  await expect(ghost).toBeVisible();
  const drag=await ghost.boundingBox();
  expect(Math.abs(drag.width-source.width)).toBeLessThanOrEqual(2);
  expect(Math.abs(drag.height-source.height)).toBeLessThanOrEqual(2);
  await card.dispatchEvent('pointerup',{pointerId:31,pointerType:'mouse',button:0,clientX:5,clientY:5});
  await expect(ghost).toHaveCount(0);
  await expect(card).not.toHaveClass(/dragging/);
  const restored=await card.boundingBox();
  expect(Math.abs(restored.x-source.x)).toBeLessThanOrEqual(1);
  expect(Math.abs(restored.y-source.y)).toBeLessThanOrEqual(1);
});

test('tablet and iPhone keep their independent inventory scroller',async({browser})=>{
  for(const setup of [
    {viewport:{width:768,height:1024},isMobile:true,hasTouch:true},
    {...devices['iPhone 13']}
  ]){
    const context=await browser.newContext(setup);
    const page=await context.newPage();
    await openArmory(page);
    const state=await page.evaluate(()=>{
      const panel=document.querySelector('#gearPanel');
      const grid=document.querySelector('#gearGrid');
      const stage=document.querySelector('#gearCharacterStage');
      const inventory=document.querySelector('.gearInventoryPanel');
      const rect=element=>element.getBoundingClientRect();
      const before=rect(stage);
      const hero=rect(document.querySelector('.gearCharacterHero'));
      const cards=[...grid.querySelectorAll('.gearBagSlot')].map(rect);
      const loadout=[...document.querySelectorAll('#gearLoadoutSlots .gearLoadoutSlot')].map(slot=>({name:slot.dataset.displaySlot,box:rect(slot)}));
      const close=rect(document.querySelector('#closeGear'));
      grid.scrollTop=60;
      const after=rect(stage);
      return{
        panelOverflow:getComputedStyle(panel).overflow,
        gridOverflow:getComputedStyle(grid).overflowY,
        pageOverflow:document.documentElement.scrollWidth-document.documentElement.clientWidth,
        inventoryRight:rect(inventory).right,
        viewport:innerWidth,
        hero,
        cards,loadout,close,
        stageBefore:{top:before.top,bottom:before.bottom},
        stageAfter:{top:after.top,bottom:after.bottom}
      };
    });
    expect(state.panelOverflow).toBe('hidden');
    expect(state.gridOverflow).toBe('auto');
    expect(state.pageOverflow).toBeLessThanOrEqual(1);
    expect(state.inventoryRight).toBeLessThanOrEqual(state.viewport+1);
    expect(state.hero.top,JSON.stringify({hero:state.hero,stage:state.stageBefore})).toBeGreaterThanOrEqual(state.stageBefore.top-1);
    expect(state.hero.bottom).toBeLessThanOrEqual(state.stageBefore.bottom+1);
    for(let index=0;index<state.cards.length;index++){
      const card=state.cards[index];
      expect(Math.abs(card.width-card.height)).toBeLessThanOrEqual(2);
      for(let otherIndex=index+1;otherIndex<state.cards.length;otherIndex++){
        const other=state.cards[otherIndex];
        const overlaps=card.left<other.right-1&&card.right>other.left+1&&card.top<other.bottom-1&&card.bottom>other.top+1;
        expect(overlaps,JSON.stringify({index,otherIndex,card,other})).toBe(false);
      }
    }
    expect(state.loadout).toHaveLength(10);
    for(const entry of state.loadout){
      expect(entry.box.left).toBeGreaterThanOrEqual(0);
      expect(entry.box.right).toBeLessThanOrEqual(state.viewport+1);
      expect(entry.box.top).toBeGreaterThanOrEqual(state.stageBefore.top-1);
      expect(entry.box.bottom).toBeLessThanOrEqual(state.stageBefore.bottom+1);
      const overlapsClose=entry.box.left<state.close.right-1&&entry.box.right>state.close.left+1&&entry.box.top<state.close.bottom-1&&entry.box.bottom>state.close.top+1;
      expect(overlapsClose,JSON.stringify({entry,close:state.close})).toBe(false);
    }
    expect(state.stageAfter).toEqual(state.stageBefore);
    if(process.env.CAPTURE_INVENTORY)await page.screenshot({
      path:path.join('test-results','inventory-layout',`mobile-${state.viewport}.png`),
      animations:'disabled'
    });
    await context.close();
  }
});
