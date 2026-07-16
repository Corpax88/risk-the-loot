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
assert(html.includes('style.css?v=0.14.0')&&html.includes('script.js?v=0.14.0'),'release assets are not versioned');
for(const asset of ['pappa-hammer-player.png','pappa-hammer-idle-v2.png','pappa-hammer-run-v2.png','pappa-hammer-attack-v2.png','pappa-hammer-workshop.png','pappa-hammer-enemies.png','pappa-hammer-bosses.png','gear-items-atlas.png','gear-drops-atlas.png','gear-atlas.json'])assert(fs.existsSync('assets/'+asset),'Pappa Hammer asset is missing: '+asset);
const gearAtlas=JSON.parse(fs.readFileSync('assets/gear-atlas.json','utf8'));
assert.equal(gearAtlas.items.length,40,'gear atlas must map all 40 items');
assert.equal(new Set(gearAtlas.items.map(item=>item.id)).size,40,'gear atlas item ids must be unique');
assert.deepEqual(gearAtlas.slotOrder,['hat','scarf','coat','hammer','boots'],'gear atlas slot rows are out of order');
for(const item of gearAtlas.items)assert(script.includes("gearDef('"+item.id+"'"),'gear atlas references unknown item: '+item.id);
function pngSize(path){const data=fs.readFileSync(path);return [data.readUInt32BE(16),data.readUInt32BE(20)]}
assert.deepEqual(pngSize('assets/gear-items-atlas.png'),[2560,1280],'full gear atlas dimensions are wrong');
assert.deepEqual(pngSize('assets/gear-drops-atlas.png'),[800,400],'drop gear atlas dimensions are wrong');
for(const pose of ['idle','run','attack'])for(const slot of ['hat','scarf','coat','hammer','boots']){const path='assets/paper-doll/'+pose+'-'+slot+'.png';assert(fs.existsSync(path),'paper-doll mask is missing: '+path);assert.deepEqual(pngSize(path),[2048,1024],'paper-doll mask dimensions are wrong: '+path)}
assert(script.includes("assets/pappa-hammer-idle-v2.png")&&script.includes("assets/pappa-hammer-run-v2.png")&&script.includes("assets/pappa-hammer-attack-v2.png")&&script.includes("assets/pappa-hammer-enemies.png")&&script.includes("assets/pappa-hammer-bosses.png"),'Pappa Hammer animation or combat assets are not wired');
assert(script.includes('pendingStrikes')&&script.includes('releaseHammerStrike')&&script.includes("kind:'hammerSwing'"),'ranged melee hammer timing or impact arc is missing');
assert(css.includes('@keyframes pappaHammerFrames')&&css.includes("background-image:url('assets/pappa-hammer-idle-v2.png')"),'live Gear Locker animation is missing');
assert(script.includes('THE FIRST LOCK')&&script.includes('A FORMAL BOW')&&script.includes('source:e.bossKind||e.type'),'distinct boss personalities are not wired');
assert(!/v0\.[23456]\.\d/.test(html+css+script),'stale release version found');
assert(script.includes('DEPTH_THRESHOLDS=[0,55,120,195,280]'),'expedition pacing is missing');
assert(script.includes('BOSS_SCHEMATICS')&&script.includes('pendingWardenReward'),'permanent boss rewards are missing');
assert(script.includes('burstVolleyBonus')&&script.includes('platingProtection'),'meaningful fractional Blueprint mastery is missing');
assert(html.includes('id="resultTime"')&&html.includes('id="routeProgressFill"')&&html.includes('id="wardenTechGrid"'),'playtest readout, route progress, or schematic bench is missing');
assert(html.includes('id="routeOverlay"')&&html.includes('id="routeFurnace"')&&html.includes('id="routeDynamo"'),'branching route choice is missing');
assert(script.includes('ROUTES')&&script.includes('routeDecision')&&script.includes('chooseRoute'),'branching route logic is missing');
assert(script.includes('tyrantVolley')&&script.includes('thermalBlast'),'Furnace boss or Thermal Capacitor is missing');
assert(script.includes('LOOT_ITEMS')&&script.includes('lootDrops')&&script.includes('collectLoot')&&script.includes('drawAdventureItemShape'),'physical loot item system is missing');
assert(script.includes("SAVE_VERSION=8")&&script.includes('gearInventory')&&script.includes('equipped:{hat:null,scarf:null,coat:null,hammer:null,boots:null}'),'gear save or migration model is missing');
assert(script.includes("const GEAR_SLOTS=['hat','scarf','coat','hammer','boots']")&&script.includes('gearStats')&&script.includes('gearArtMarkup'),'gear slots, stats, or visual equipment are missing');
assert(script.includes('paperDollMasks')&&script.includes('composePaperDollPose')&&script.includes('paperDollAtlases[pose]'),'animated equipped gear is not wired into Pappa Hammer');
assert(html.includes('id="gearLockerButton"')&&html.includes('id="gearGrid"')&&html.includes('id="gearCharacterPreview"'),'Gear Locker or live character preview is missing');
assert(html.includes('id="gearRarityFilters"')&&html.includes('id="sellFilteredGear"')&&script.includes('gearSellableCount')&&script.includes('sellFilteredGear'),'protected filtered gear sale is missing');
assert(script.includes('gear-items-atlas.png')&&script.includes('gear-drops-atlas.png')&&script.includes('drawAdventureLootSprite')&&css.includes("background-image:url('assets/gear-items-atlas.png')"),'sprite-atlas item identities are missing');
assert(!script.includes('createPreviewGear')&&!css.includes('.previewGear.hammer'),'obsolete geometric equipment overlays are still active');
assert(!html.includes('id="upgradeChassis"')&&!html.includes('id="upgradeWeapon"')&&!html.includes('id="upgradeSalvage"'),'obsolete direct stat upgrades are still visible');
assert(script.includes('RELIC_POWER_CAP')&&script.includes('prepareRelic')&&script.includes('FUSED'),'relic fusion system is missing');
assert(html.includes('id="resultLoot"')&&html.includes('id="lootToast"')&&html.includes('id="lootBest"'),'loot feedback UI is missing');
assert(html.includes('id="devLoot"')&&script.includes('devDropLegendary'),'legendary loot test tool is missing');
assert(html.includes('id="devButton"')&&html.includes('id="devWarden"')&&html.includes('id="devTyrant"')&&script.includes('devFightWarden')&&script.includes('devFightTyrant'),'playtest dev tools are missing');
assert(html.includes('viewport-fit=cover'),'mobile safe-area viewport support is missing');
assert(css.includes('env(safe-area-inset-bottom)')&&css.includes('@media(max-width:420px){.resultStats'),'mobile safe areas or narrow result layout is missing');
assert(css.includes('.routeProgress')&&css.includes('.routeOverlay')&&css.includes('.touchControls{display:block}'),'route choice, route progress, or touch controls are missing');

child.execFileSync(process.execPath,['--check','script.js'],{stdio:'inherit'});
console.log('Static audit passed: unique ids -> DOM bindings -> CSS balance -> JS syntax');
