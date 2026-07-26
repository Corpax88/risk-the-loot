const {defineConfig,devices}=require('@playwright/test');

module.exports=defineConfig({
  testDir:'./tests/browser',
  timeout:15000,
  fullyParallel:false,
  workers:3,
  forbidOnly:!!process.env.CI,
  retries:process.env.CI?2:0,
  reporter:process.env.CI?[['line'],['html',{open:'never'}]]:'line',
  globalSetup:require.resolve('./tests/browser/global-setup.js'),
  use:{
    baseURL:'http://127.0.0.1:4174',
    trace:'on-first-retry',
    screenshot:'only-on-failure'
  },
  projects:[
    {
      name:'chromium',
      use:{...devices['Desktop Chrome']}
    }
  ]
});
