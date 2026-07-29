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

test('workshop Pappa uses restrained layered motion on desktop and mobile',async({page},testInfo)=>{
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/');

  const pappa=page.locator('.pappaHammerBase');
  const motion=page.locator('.pappaHammerBaseMotion');
  const visual=page.locator('.pappaHammerBaseVisual');
  const sprite=page.locator('#pappaHammerBaseSprite');
  await expect(pappa).toBeVisible();
  await expect(sprite).toBeVisible();
  await expect(sprite).toHaveCSS('image-rendering','auto');

  const animationNames=await page.evaluate(()=>({
    motion:getComputedStyle(document.querySelector('.pappaHammerBaseMotion')).animationName,
    visual:getComputedStyle(document.querySelector('.pappaHammerBaseVisual')).animationName,
    sprite:getComputedStyle(document.querySelector('#pappaHammerBaseSprite')).animationName
  }));
  expect(animationNames.motion).toContain('pappaMenuWeightShift');
  expect(animationNames.visual).toContain('pappaMenuBreath');
  expect(animationNames.sprite).toContain('pappaHammerFrames');
  expect(animationNames.sprite).toContain('pappaMenuFollowThrough');

  await page.waitForTimeout(700);
  const outerBefore=await pappa.boundingBox();
  const visualBefore=await visual.evaluate(element=>getComputedStyle(element).transform);
  await page.waitForTimeout(420);
  const outerAfter=await pappa.boundingBox();
  const visualAfter=await visual.evaluate(element=>getComputedStyle(element).transform);
  expect(visualAfter).not.toBe(visualBefore);
  expect(Math.abs(outerAfter.x-outerBefore.x)).toBeLessThan(2);
  expect(Math.abs(outerAfter.y-outerBefore.y)).toBeLessThan(2);
  expect(Math.abs(outerAfter.width-outerBefore.width)).toBeLessThan(.2);

  await page.screenshot({path:testInfo.outputPath('workshop-pappa-desktop.png'),fullPage:true});

  await page.setViewportSize({width:390,height:844});
  await page.reload();
  await expect(pappa).toBeVisible();
  const mobileBox=await pappa.boundingBox();
  expect(mobileBox.width).toBeGreaterThanOrEqual(200);
  expect(mobileBox.width).toBeLessThanOrEqual(260);
  expect(mobileBox.x).toBeGreaterThanOrEqual(0);
  expect(mobileBox.x+mobileBox.width).toBeLessThanOrEqual(390);
  await page.screenshot({path:testInfo.outputPath('workshop-pappa-mobile.png'),fullPage:true});
});

test('workshop Pappa respects reduced motion',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/');
  await expect(page.locator('.pappaHammerBaseMotion')).toHaveCSS('animation-name','none');
  await expect(page.locator('.pappaHammerBaseVisual')).toHaveCSS('animation-name','none');
  await expect(page.locator('#pappaHammerBaseSprite')).toHaveCSS('animation-name','none');
});
