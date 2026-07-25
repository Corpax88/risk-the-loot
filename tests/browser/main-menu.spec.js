const {test,expect}=require('@playwright/test');

test('main menu loads',async({page})=>{
  const pageErrors=[];
  page.on('pageerror',error=>pageErrors.push(error.message));
  await page.addInitScript(()=>localStorage.clear());

  await page.goto('/');

  await expect(page).toHaveTitle('RISK THE LOOT!');
  await expect(page.locator('#baseView')).toBeVisible();
  await expect(page.locator('#gearLockerButton')).toContainText('ADVENTURE BAG');
  await expect(page.locator('#startButton')).toBeVisible();
  await expect(page.locator('#startButton')).toContainText('CHOOSE EXPEDITION');
  expect(pageErrors).toEqual([]);
});
