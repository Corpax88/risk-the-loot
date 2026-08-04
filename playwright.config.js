const {defineConfig,devices}=require('@playwright/test');
const port=Number(process.env.PLAYWRIGHT_PORT)||4174;
const executablePath=process.env.PLAYWRIGHT_EXECUTABLE_PATH||undefined;

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
    baseURL:'http://127.0.0.1:'+port,
    trace:'on-first-retry',
    screenshot:'only-on-failure',
    launchOptions:executablePath?{executablePath}:undefined
  },
  projects:[
    {
      name:'chromium',
      use:{...devices['Desktop Chrome']}
    }
  ]
});
