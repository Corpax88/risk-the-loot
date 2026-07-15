const fs=require('fs'),assert=require('assert'),child=require('child_process');

const html=fs.readFileSync('index.html','utf8');
const css=fs.readFileSync('style.css','utf8');
const script=fs.readFileSync('script.js','utf8');
const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
const unique=new Set(ids);

assert.equal(ids.length,unique.size,'duplicate HTML ids found');
for(const match of script.matchAll(/\$\('([^']+)'\)/g)){
  assert(unique.has(match[1]),'script references missing element #'+match[1]);
}

const openBraces=(css.match(/{/g)||[]).length;
const closeBraces=(css.match(/}/g)||[]).length;
assert.equal(openBraces,closeBraces,'CSS braces are unbalanced');
assert(html.includes('style.css?v=0.5.0')&&html.includes('script.js?v=0.5.0'),'release assets are not versioned');
assert(!/v0\.[234]\.0/.test(html+css+script),'stale release version found');
assert(script.includes('DEPTH_THRESHOLDS=[0,55,120,195,280]'),'expedition pacing is missing');
assert(script.includes('WARDEN_SCHEMATICS')&&script.includes('pendingWardenReward'),'permanent Warden rewards are missing');
assert(html.includes('id="resultTime"')&&html.includes('id="routeProgressFill"')&&html.includes('id="wardenTechGrid"'),'playtest readout, route progress, or schematic bench is missing');
assert(html.includes('viewport-fit=cover'),'mobile safe-area viewport support is missing');
assert(css.includes('env(safe-area-inset-bottom)')&&css.includes('@media(max-width:420px){.resultStats'),'mobile safe areas or narrow result layout is missing');
assert(css.includes('.routeProgress')&&css.includes('.touchControls{display:block}'),'route progress or touch controls are missing');

child.execFileSync(process.execPath,['--check','script.js'],{stdio:'inherit'});
console.log('Static audit passed: unique ids -> DOM bindings -> CSS balance -> JS syntax');
