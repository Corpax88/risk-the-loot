const {test,expect}=require('@playwright/test');

const maps=[
  {id:'guild',level:1,customAssets:false},
  {id:'foundry',level:4,customAssets:false},
  {id:'moonfall',level:8,customAssets:true,solidPoint:{x:135,y:430}},
  {id:'skyglass',level:12,customAssets:true,solidPoint:{x:125,y:420}},
  {id:'summit',level:16,customAssets:false}
];

test('all expedition maps render, remain playable, and respect environment collisions',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);

  for(const map of maps){
    const state=await page.evaluate(id=>window.__riskTest.openMap(id),map.id);
    expect(state.map).toBe(map.id);
    expect(state.decor).toBeGreaterThan(10);
    if(map.id==='guild'){
      expect(state.procedural).toBe(true);
      expect(state.seed).toBeTruthy();
      expect(state.validation.valid).toBe(true);
      expect(state.obstacles.length).toBeGreaterThanOrEqual(28);
      expect(state.collisionCount).toBe(state.obstacles.length);
      expect(state.player.x).toBeLessThan(220);
      expect(state.pathRows).toHaveLength(5);
      expect(state.moduleKinds).toContain('entrance');
      expect(state.moduleKinds).toContain('boss');
      expect(Math.hypot(state.bossAnchor.x-state.player.x,state.bossAnchor.y-state.player.y)).toBeGreaterThan(1500);
    }else{
      expect(state.obstacles).toHaveLength(14);
      expect(state.collisionCount).toBeGreaterThanOrEqual(14);
      expect(state.player).toEqual({x:1200,y:800});
    }

    await page.waitForTimeout(120);
    const pixels=await page.locator('#world').evaluate(canvas=>{
      const context=canvas.getContext('2d');
      const data=context.getImageData(0,0,canvas.width,canvas.height).data;
      let visible=0,bright=0;
      for(let i=0;i<data.length;i+=64){
        const light=data[i]+data[i+1]+data[i+2];
        if(data[i+3]>0)visible++;
        if(light>75)bright++;
      }
      return{visible,bright};
    });
    expect(pixels.visible).toBeGreaterThan(1000);
    expect(pixels.bright).toBeGreaterThan(100);

    if(map.customAssets){
      expect(state.obstacles.every(obstacle=>obstacle.assetId)).toBe(true);
      expect(state.collisionCount).toBeGreaterThan(14);
      const moved=await page.evaluate(point=>window.__riskTest.movePlayer(point.x,point.y),map.solidPoint);
      expect(moved.player).not.toEqual(map.solidPoint);
    }else{
      expect(state.obstacles.every(obstacle=>!obstacle.assetId)).toBe(true);
    }
  }

  expect(pageErrors).toEqual([]);
});
