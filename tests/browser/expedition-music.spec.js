const {test,expect}=require('@playwright/test');

test.use({viewport:{width:390,height:844},deviceScaleFactor:3,isMobile:true,hasTouch:true});

test('expedition score starts in maps, obeys Sound, and resets in the workshop',async({page,request})=>{
  await page.addInitScript(()=>localStorage.clear());
  await page.goto('/?playwright');
  await expect.poll(()=>page.evaluate(()=>Boolean(window.__riskTest))).toBe(true);

  const track=page.locator('#expeditionMusic');
  await expect(track).toHaveAttribute('loop','');
  await expect(track.locator('source')).toHaveCount(2);
  expect(await track.evaluate(element=>({ogg:element.canPlayType('audio/ogg; codecs="opus"'),m4a:element.canPlayType('audio/mp4')}))).toEqual(expect.objectContaining({ogg:expect.stringMatching(/maybe|probably/),m4a:expect.stringMatching(/maybe|probably/)}));
  for(const asset of ['/assets/audio/sky-menu-drift-loop.ogg','/assets/audio/sky-menu-drift-loop.m4a']){
    const response=await request.get(asset);
    expect(response.ok()).toBe(true);
    expect((await response.body()).byteLength).toBeGreaterThan(3_000_000);
  }

  await page.evaluate(()=>{
    const music=document.querySelector('#expeditionMusic');
    music.dataset.playCalls='0';music.dataset.pauseCalls='0';
    music.play=function(){this.dataset.playCalls=String(Number(this.dataset.playCalls)+1);this.dataset.testPlaying='true';return Promise.resolve()};
    music.pause=function(){this.dataset.pauseCalls=String(Number(this.dataset.pauseCalls)+1);this.dataset.testPlaying='false'};
  });

  await page.evaluate(()=>window.__riskTest.openMap('guild'));
  await expect(page.locator('#expeditionView')).toHaveClass(/active/);
  await expect(track).toHaveAttribute('data-test-playing','true');
  await expect.poll(()=>track.getAttribute('data-play-calls')).toBe('1');
  await expect(track).toHaveJSProperty('muted',false);

  await page.locator('#settingsButton').click();
  await page.locator('#soundToggle').click();
  await expect(track).toHaveAttribute('data-test-playing','false');
  await expect(track).toHaveJSProperty('muted',true);
  await page.locator('#soundToggle').click();
  await expect(track).toHaveAttribute('data-test-playing','true');
  await expect(track).toHaveJSProperty('muted',false);

  await page.locator('#abandonButton').click();
  await page.locator('#abandonButton').click();
  await expect(page.locator('#baseView')).toHaveClass(/active/);
  await expect(track).toHaveAttribute('data-test-playing','false');
  await expect(track).toHaveJSProperty('currentTime',0);
  await expect.poll(async()=>Number(await track.getAttribute('data-pause-calls'))).toBeGreaterThanOrEqual(2);
});
