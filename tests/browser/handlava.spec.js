const {test,expect}=require('@playwright/test');

async function waitForHandlava(page){
  await expect.poll(()=>page.evaluate(()=>window.__riskTest.handlavaState().sheets)).toBe(true);
}

test('Handlava requires 5/5 and prioritizes targets outside hammer range',async({page})=>{
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);

  let state=await page.evaluate(()=>window.__riskTest.prepareHandlava([
    {id:'near',x:70,y:0},
    {id:'far-a',x:360,y:0},
    {id:'far-b',x:300,y:80}
  ],4));
  expect(state.enabled).toBe(false);
  expect(state.tier).toBe(0);
  state=await page.evaluate(()=>window.__riskTest.advanceHandlava(.6));
  expect(state.grabs).toBe(0);

  await page.evaluate(()=>window.__riskTest.prepareHandlava([
    {id:'near',x:70,y:0},
    {id:'far-a',x:360,y:0},
    {id:'far-b',x:300,y:80}
  ],5));
  await waitForHandlava(page);
  state=await page.evaluate(()=>window.__riskTest.advanceHandlava(.25));
  expect(state.enabled).toBe(true);
  expect(state.tier).toBe(2);
  expect(state.grabs).toBe(2);
  expect(state.enemies.find(enemy=>enemy.id==='near').held).toBe(false);
  expect(state.arms.map(arm=>arm.target).sort()).toEqual(['far-a','far-b']);
});

test('Handlava combat remains active when animation sheets fail to decode',async({page})=>{
  await page.route('**/handlava-*-v1.png',route=>route.abort());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(()=>window.__riskTest.prepareHandlava([
    {id:'far-a',x:340,y:0},
    {id:'far-b',x:-320,y:70}
  ],5));
  const state=await page.evaluate(()=>window.__riskTest.advanceHandlava(.25));
  expect(state.sheets).toBe(false);
  expect(state.grabs).toBe(2);
});

test('Lava transformation and impact splash remain readable on mobile',async({page},testInfo)=>{
  await page.setViewportSize({width:390,height:844});
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(()=>window.__riskTest.prepareHandlava([
    {id:'far-a',x:190,y:-35},
    {id:'far-b',x:170,y:85},
    {id:'impact',x:-90,y:-130}
  ],5));
  await waitForHandlava(page);
  const state=await page.evaluate(()=>window.__riskTest.advanceHandlava(.25));
  expect(state.setId).toBe('lavaSet');
  expect(state.splash).toBe(true);
  expect(state.effectKinds).toContain('handlavaSplash');
  await page.waitForTimeout(80);
  await page.locator('#world').screenshot({path:testInfo.outputPath('lava-set-mobile-combat.png')});
});

test('living arms swing through enemies and throw prey back into Spin range',async({page})=>{
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(()=>window.__riskTest.prepareHandlava([
    {id:'far-a',x:360,y:0},
    {id:'far-b',x:300,y:80},
    {id:'collision-a',x:-120,y:-200},
    {id:'collision-b',x:-155,y:155}
  ],5));
  await waitForHandlava(page);
  const state=await page.evaluate(()=>window.__riskTest.advanceHandlava(1.05));
  expect(state.grabs).toBeGreaterThanOrEqual(2);
  expect(state.collisions).toBeGreaterThan(0);
  expect(state.throws).toBeGreaterThanOrEqual(2);
  expect(state.splash).toBe(true);
  expect(state.effectKinds).toContain('handlavaSplash');
  for(const id of ['far-a','far-b']){
    const enemy=state.enemies.find(entry=>entry.id===id);
    expect(enemy.distance).toBeLessThanOrEqual(state.player.spinRadius+20);
  }
  expect(state.effects).toBeLessThan(40);
  expect(state.particles).toBeLessThan(80);
});

test('throws choose a reachable pack direction without leaving Spin range',async({page})=>{
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(()=>window.__riskTest.prepareHandlava([
    {id:'prey',x:500,y:-80,hp:100000},
    {id:'decoy',x:-480,y:-100,hp:100000},
    {id:'pack-a',x:170,y:90,hp:100000},
    {id:'pack-b',x:180,y:105,hp:100000},
    {id:'pack-c',x:155,y:110,hp:100000}
  ],5));
  await waitForHandlava(page);
  const state=await page.evaluate(()=>window.__riskTest.advanceHandlava(1.05));
  for(const id of ['prey','decoy']){
    const enemy=state.enemies.find(entry=>entry.id===id);
    expect(enemy.x).toBeGreaterThan(state.player.x);
    expect(enemy.y).toBeGreaterThan(state.player.y);
    expect(enemy.distance).toBeLessThanOrEqual(state.player.spinRadius+20);
  }
  expect(state.enemies.filter(enemy=>enemy.id.startsWith('pack-')).some(enemy=>enemy.hp<100000)).toBe(true);
});

test('bosses are never grabbed and unequipping releases held enemies',async({page})=>{
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
  await page.evaluate(()=>window.__riskTest.prepareHandlava([
    {id:'boss',x:500,y:0,boss:true},
    {id:'regular',x:280,y:0}
  ],5));
  await waitForHandlava(page);
  let state=await page.evaluate(()=>window.__riskTest.advanceHandlava(.2));
  expect(state.enemies.find(enemy=>enemy.id==='boss').held).toBe(false);
  expect(state.enemies.find(enemy=>enemy.id==='boss').claimed).toBe(false);
  expect(state.enemies.find(enemy=>enemy.id==='regular').held).toBe(true);

  state=await page.evaluate(()=>window.__riskTest.unequipHandlavaPiece('hat'));
  expect(state.enabled).toBe(false);
  expect(state.tier).toBe(0);
  expect(state.enemies.some(enemy=>enemy.held||enemy.claimed)).toBe(false);
  expect(state.arms.every(arm=>arm.phase==='idle')).toBe(true);
});
