const {test,expect}=require('@playwright/test');

test('all gear sets awaken and master their own signature',async({page})=>{
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);

  const catalog=await page.evaluate(()=>window.__riskTest.gearSignatures());
  expect(Object.keys(catalog)).toHaveLength(20);

  for(const [setId,signature] of Object.entries(catalog)){
    expect(signature.name).toBeTruthy();
    expect(signature.role).toBeTruthy();
    expect(signature.unlock.length).toBeGreaterThan(20);
    expect(signature.mastery.length).toBeGreaterThan(20);
    expect(await page.evaluate(([id,count])=>window.__riskTest.gearSignatureTier(id,count),[setId,2])).toBe(0);
    expect(await page.evaluate(([id,count])=>window.__riskTest.gearSignatureTier(id,count),[setId,3])).toBe(1);
    expect(await page.evaluate(([id,count])=>window.__riskTest.gearSignatureTier(id,count),[setId,5])).toBe(2);
  }
});
