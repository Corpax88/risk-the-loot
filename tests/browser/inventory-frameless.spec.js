const {test,expect,devices}=require('@playwright/test');

async function openLavaArmory(page){
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(()=>window.__riskTest.previewGearSet('lavaSet'));
  await expect(page.locator('#gearOverlay')).toHaveClass(/show/);
  await expect(page.locator('#gearCharacterStage')).toHaveAttribute('data-inventory-backdrop','lavaSet');
  await page.waitForTimeout(250);
}

async function presentationState(page){
  return page.evaluate(()=>{
    const rect=element=>{
      const box=element.getBoundingClientRect();
      return {left:box.left,top:box.top,right:box.right,bottom:box.bottom,width:box.width,height:box.height};
    };
    const overlaps=(a,b)=>a.left<b.right&&a.right>b.left&&a.top<b.bottom&&a.bottom>b.top;
    const close=rect(document.querySelector('#closeGear'));
    const stage=rect(document.querySelector('#gearCharacterStage'));
    const detailCard=document.querySelector('#gearDetail .gearDetailCard');
    const detail=detailCard&&getComputedStyle(detailCard).display!=='none'?rect(detailCard):null;
    const slots=[...document.querySelectorAll('#gearLoadoutSlots .gearLoadoutSlot')].map(element=>{
      const style=getComputedStyle(element);
      return {box:rect(element),radius:style.borderRadius,clip:style.clipPath,background:style.backgroundImage};
    });
    const cards=[...document.querySelectorAll('#gearGrid .gearBagSlot')].map(element=>{
      const style=getComputedStyle(element);
      return {border:style.borderTopWidth,background:style.backgroundImage,color:style.backgroundColor};
    });
    return {
      close,
      closeStageOffset:close.top-stage.top,
      slots,
      cards,
      closeOverlapsSlot:slots.some(slot=>overlaps(close,slot.box)),
      closeOverlapsDetail:detail?overlaps(close,detail):false,
      overflow:document.documentElement.scrollWidth-document.documentElement.clientWidth
    };
  });
}

for(const setup of [
  {name:'desktop',context:{viewport:{width:1366,height:768}}},
  {name:'iphone',context:{...devices['iPhone 13']}}
]){
  test(`${setup.name} Armory uses frameless gear and an isolated close control`,async({browser},testInfo)=>{
    const context=await browser.newContext(setup.context);
    const page=await context.newPage();
    await openLavaArmory(page);
    const state=await presentationState(page);
    expect(state.slots).toHaveLength(6);
    expect(state.cards.length).toBeGreaterThan(0);
    expect(state.closeOverlapsSlot).toBe(false);
    expect(state.closeOverlapsDetail).toBe(false);
    if(setup.name==='iphone')expect(state.closeStageOffset).toBeLessThanOrEqual(18);
    expect(state.overflow).toBeLessThanOrEqual(1);
    for(const slot of state.slots){
      expect(slot.radius).toBe('50%');
      expect(['none','']).toContain(slot.clip);
      expect(Math.abs(slot.box.width-slot.box.height)).toBeLessThanOrEqual(1);
    }
    for(const card of state.cards){
      expect(card.border).toBe('0px');
      expect(card.background).toBe('none');
      expect(card.color).toBe('rgba(0, 0, 0, 0)');
    }
    await page.screenshot({path:testInfo.outputPath(`frameless-${setup.name}.png`),animations:'disabled'});
    setup.name==='iphone'?await page.locator('#closeGear').tap():await page.locator('#closeGear').click();
    await expect(page.locator('#gearOverlay')).not.toHaveClass(/show/);
    await context.close();
  });
}
