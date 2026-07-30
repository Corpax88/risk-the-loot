const {test,expect}=require('@playwright/test');

async function openPlaytest(page,viewport={width:1280,height:800}){
  await page.setViewportSize(viewport);
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);
}

async function equipLightning(page,count=4){
  await page.evaluate(amount=>window.__riskTest.spawnHammerstormPack(amount,{fullLightning:true,durable:true}),count);
}

test('Lightning full set replaces hold Spin with one impact per accepted tap',async({page})=>{
  const errors=[];
  page.on('pageerror',error=>errors.push(error.message));
  await openPlaytest(page);
  await equipLightning(page,4);
  await page.evaluate(()=>window.__riskTest.setLightningTargets([
    {id:'near',x:95,y:0,hp:1e7},
    {id:'next',x:145,y:-35,hp:1e7},
    {id:'third',x:185,y:55,hp:1e7},
    {id:'fourth',x:225,y:-65,hp:1e7}
  ]));

  let state=await page.evaluate(()=>window.__riskTest.lightningDashState());
  expect(state).toMatchObject({enabled:true,phase:'idle',impacts:0});
  expect(state.button).toEqual({lightning:true,label:'TAP'});

  for(let tap=1;tap<=3;tap++){
    const result=await page.evaluate(()=>window.__riskTest.pressLightning());
    expect(result.accepted).toBe(true);
    if(process.env.CAPTURE_LIGHTNING&&tap===1){
      await page.evaluate(()=>window.__riskTest.advanceLightning(.07));
      await page.screenshot({path:'test-results/lightning-desktop.png'});
      state=await page.evaluate(()=>window.__riskTest.advanceLightning(.12));
    }else state=await page.evaluate(()=>window.__riskTest.advanceLightning(.19));
    expect(state.impacts).toBe(tap);
    expect(state.phase).toBe('idle');
  }
  expect(new Set(state.history.slice(0,3)).size).toBeGreaterThanOrEqual(3);
  expect(state.effects.some(kind=>kind==='lightningTrail'||kind==='lightningImpact')).toBe(true);
  expect(errors).toEqual([]);
});

test('rapid tapping is rate limited, queued and never duplicates an impact',async({page})=>{
  await openPlaytest(page);
  await equipLightning(page,6);
  await page.evaluate(()=>window.__riskTest.setLightningTargets([
    {id:'a',x:100,y:0,hp:1e7},{id:'b',x:135,y:60,hp:1e7},{id:'c',x:170,y:-55,hp:1e7},
    {id:'d',x:210,y:25,hp:1e7},{id:'e',x:240,y:-70,hp:1e7},{id:'f',x:270,y:65,hp:1e7}
  ]));

  const rapidResults=await page.evaluate(()=>Array.from({length:6},()=>window.__riskTest.pressLightning()));
  const accepted=rapidResults.map(result=>result.accepted);
  expect(accepted.filter(Boolean)).toHaveLength(4);
  let state=await page.evaluate(()=>window.__riskTest.lightningDashState());
  expect(state.queue).toBe(3);
  state=await page.evaluate(()=>window.__riskTest.advanceLightning(.9));
  expect(state.impacts).toBe(4);
  expect(state.queue).toBe(0);
  expect(state.phase).toBe('idle');
});

test('movement direction owns target selection and tiny drift does not',async({page})=>{
  await openPlaytest(page,{width:390,height:844});
  await equipLightning(page,2);
  await page.evaluate(()=>window.__riskTest.setLightningTargets([
    {id:'right-near',x:75,y:0,hp:1e7},
    {id:'left-intended',x:-150,y:0,hp:1e7}
  ]));
  await page.evaluate(()=>window.__riskTest.setMovementInput(-1,0));
  let result=await page.evaluate(()=>window.__riskTest.pressLightning());
  expect(result.state.target).toBe('left-intended');
  await page.evaluate(()=>window.__riskTest.advanceLightning(.2));

  await page.evaluate(()=>{
    window.__riskTest.clearMovementInput();
    window.__riskTest.setLightningTargets([{id:'near',x:70,y:0,hp:1e7},{id:'far',x:-150,y:0,hp:1e7}]);
    window.__riskTest.setMovementInput(-.08,0);
  });
  result=await page.evaluate(()=>window.__riskTest.pressLightning());
  expect(result.state.target).toBe('near');
});

test('a lone boss receives exactly one hit per tap from alternating sides',async({page})=>{
  await openPlaytest(page);
  await equipLightning(page,1);
  await page.evaluate(()=>window.__riskTest.setLightningTargets([{id:'boss',x:170,y:0,hp:1e7,boss:true}]));
  const positions=[];
  for(let tap=1;tap<=3;tap++){
    expect((await page.evaluate(()=>window.__riskTest.pressLightning())).accepted).toBe(true);
    const state=await page.evaluate(()=>window.__riskTest.advanceLightning(.2));
    expect(state.impacts).toBe(tap);
    positions.push(state.player);
  }
  expect(Math.hypot(positions[0].x-positions[1].x,positions[0].y-positions[1].y)).toBeGreaterThan(80);
  expect(Math.hypot(positions[1].x-positions[2].x,positions[1].y-positions[2].y)).toBeGreaterThan(80);
});

test('dead travel targets retarget, no-target taps fail cleanly, and unequip restores Spin',async({page})=>{
  await openPlaytest(page);
  await equipLightning(page,2);
  await page.evaluate(()=>window.__riskTest.setLightningTargets([{id:'fragile',x:100,y:0,hp:1},{id:'backup',x:180,y:0,hp:1e7}]));
  await page.evaluate(()=>window.__riskTest.pressLightning());
  await page.evaluate(()=>window.__riskTest.pressLightning());
  let state=await page.evaluate(()=>window.__riskTest.advanceLightning(.45));
  expect(state.impacts).toBe(2);
  expect(state.enemies.some(enemy=>enemy.id==='backup'&&enemy.hp<1e7)).toBe(true);

  await page.evaluate(()=>window.__riskTest.setLightningTargets([]));
  const empty=await page.evaluate(()=>window.__riskTest.pressLightning());
  expect(empty.accepted).toBe(false);
  expect(empty.state.impacts).toBe(2);

  state=await page.evaluate(()=>window.__riskTest.unequipLightningPiece('hat'));
  expect(state.enabled).toBe(false);
  const normal=await page.evaluate(()=>window.__riskTest.triggerHammerstorm());
  expect(normal.started).toBe(true);
  expect(normal.state.spin.visual).toBe('hammerstorm');
});

test('iPhone pointer hold registers once and a second physical tap registers once more',async({page})=>{
  await openPlaytest(page,{width:390,height:844});
  await equipLightning(page,3);
  await page.evaluate(()=>window.__riskTest.setLightningTargets([
    {id:'a',x:105,y:0,hp:1e7},{id:'b',x:150,y:45,hp:1e7},{id:'c',x:190,y:-45,hp:1e7}
  ]));
  const button=page.locator('#spinButton');
  await button.dispatchEvent('pointerdown',{pointerId:71,pointerType:'touch',clientX:250,clientY:760,isPrimary:true});
  if(process.env.CAPTURE_LIGHTNING){await page.waitForTimeout(55);await page.screenshot({path:'test-results/lightning-mobile.png'})}
  await page.waitForTimeout(340);
  let state=await page.evaluate(()=>window.__riskTest.lightningDashState());
  expect(state.impacts).toBe(1);
  await button.dispatchEvent('pointerup',{pointerId:71,pointerType:'touch',isPrimary:true});

  await button.dispatchEvent('pointerdown',{pointerId:72,pointerType:'touch',clientX:250,clientY:760,isPrimary:true});
  await page.waitForTimeout(250);
  state=await page.evaluate(()=>window.__riskTest.lightningDashState());
  expect(state.impacts).toBe(2);
  await button.dispatchEvent('pointerup',{pointerId:72,pointerType:'touch',isPrimary:true});
});
