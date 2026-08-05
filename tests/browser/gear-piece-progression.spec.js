const {test,expect}=require('@playwright/test');
const path=require('path');

async function openGame(page,width=1280,height=900){
  await page.setViewportSize({width,height});
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

test('each Stormcaller piece visibly evolves the persistent modular Pappa foundation',async({page})=>{
  test.setTimeout(60000);
  await openGame(page);
  const stages=[];

  for(let count=0;count<=5;count++){
    const result=await page.evaluate(value=>window.__riskTest.previewGearSetPieces('stormrunner',value),count);
    await expect.poll(()=>page.evaluate(()=>window.__riskTest.gearVisualState().atlases.idle!==null)).toBe(true);
    const state=await page.evaluate(()=>window.__riskTest.gearVisualState(true));
    expect(result.inventory.filter(item=>item.equipped)).toHaveLength(count===5?7:count);
    expect(state.usesProductionSkin).toBe(false);
    expect(state.usesModularLayers).toBe(true);
    expect(state.setId).toBe(count===5?'stormrunner':null);
    expect(state.layers).toHaveLength(7);
    stages.push({count,hash:state.atlases.idle.hash,image:state.atlases.idle.preview});
  }

  expect(new Set(stages.map(stage=>stage.hash)).size).toBe(6);
  await page.evaluate(cards=>{
    document.body.innerHTML='<main id="progression"></main>';
    const style=document.createElement('style');
    style.textContent='*{box-sizing:border-box}html,body{height:auto!important;overflow:visible!important}body{margin:0;background:#080a0e;color:#f4ead6;font-family:Georgia,serif}#progression{display:grid;grid-template-columns:repeat(3,300px);gap:10px;width:max-content;padding:12px}.stage{position:relative;width:300px;height:330px;overflow:hidden;border:1px solid #58492f;background:#11141a}.stage img{width:100%;height:292px;object-fit:contain}.stage b{position:absolute;left:0;right:0;bottom:0;height:38px;display:grid;place-items:center;background:#090b0f;color:#d6aa58;font-size:14px;letter-spacing:1.5px}';
    document.head.appendChild(style);
    const root=document.querySelector('#progression');
    for(const card of cards){const article=document.createElement('article');article.className='stage';const image=document.createElement('img');image.src=card.image;const label=document.createElement('b');label.textContent=card.count+'/5';article.append(image,label);root.appendChild(article)}
  },stages);
  await page.screenshot({path:path.join('test-results','gear-progression','stormcaller-0-to-5.png'),fullPage:true});
});

test('Stormcaller piece evolution remains readable on iPhone through 5/5',async({page})=>{
  await openGame(page,390,844);
  const hashes=[];
  for(const count of [1,2,3,4,5]){
    await page.evaluate(value=>window.__riskTest.previewGearSetPieces('stormrunner',value),count);
    const state=await page.evaluate(()=>window.__riskTest.gearVisualState(true));
    hashes.push(state.atlases.idle.hash);
    expect(state.usesProductionSkin).toBe(false);
    expect(state.usesModularLayers).toBe(true);
  }
  expect(new Set(hashes).size).toBe(5);
  await expect(page.locator('#gearCharacterStage')).toBeVisible();
  await page.locator('#gearCharacterStage').screenshot({path:path.join('test-results','gear-progression','stormcaller-full-mobile.png')});
});
