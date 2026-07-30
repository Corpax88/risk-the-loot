(function(){
  'use strict';

  const $=id=>document.getElementById(id),canvas=$('world'),ctx=canvas.getContext('2d'),miniMapCanvas=$('miniMapCanvas'),miniCtx=miniMapCanvas.getContext('2d'),guildTerrainApi=window.GuildTerrain||null;
  function loadImage(src){let image=typeof Image==='function'?new Image():document.createElement('img');image.src=src;return image}
  const pappaHammerImage=loadImage('assets/pappa-hammer-player.png');
  const pappaHammerSprites={
    idle:loadImage('assets/pappa-hammer-idle-v2.png'),
    run:loadImage('assets/pappa-hammer-run-v2.png'),
    attack:loadImage('assets/pappa-hammer-attack-v2.png')
  };
  const paperDollSetSprites={
    hammerChoir:{
      idle:loadImage('assets/hammer-choir-idle-v1.png'),
      run:loadImage('assets/hammer-choir-run-v1.png'),
      attack:loadImage('assets/hammer-choir-attack-v1.png')
    },
    blackHole:{
      idle:loadImage('assets/black-hole-hammer-idle-v1.png'),
      run:loadImage('assets/black-hole-hammer-run-v1.png'),
      attack:loadImage('assets/black-hole-hammer-attack-v1.png')
    }
  };
  const blackHoleVfxSprites={
    spawn:loadImage('assets/black-hole-vortex-spawn-v2.png'),
    idle:loadImage('assets/black-hole-vortex-idle-v2.png'),
    pull:loadImage('assets/black-hole-vortex-pull-v2.png'),
    pulse:loadImage('assets/black-hole-vortex-pulse-v2.png'),
    dash:loadImage('assets/black-hole-vortex-dash-v2.png'),
    collapse:loadImage('assets/black-hole-vortex-collapse-v2.png'),
    burst:loadImage('assets/black-hole-vortex-burst-v2.png')
  };
  const blackHoleGearAtlas=loadImage('assets/black-hole-gear-icons-v1.png');
  const blackHoleDropAtlas=loadImage('assets/black-hole-gear-drops-v1.png');
  const enemyAtlas=typeof Image==='function'?new Image():document.createElement('img');
  enemyAtlas.src='assets/pappa-hammer-enemies.png';
  const bossAtlas=typeof Image==='function'?new Image():document.createElement('img');
  bossAtlas.src='assets/pappa-hammer-bosses.png';
  const skyglassLeviathanImage=loadImage('assets/bosses/skyglass-leviathan.png');
  const gearItemAtlas=loadImage('assets/gear-items-atlas.png');
  const gearDropAtlas=loadImage('assets/gear-drops-atlas.png');
  const setGearAtlas=loadImage('assets/set-gear-atlas.png');
  const setGearDropAtlas=loadImage('assets/set-gear-drops.png');
  const legendaryGearAtlas=loadImage('assets/legendary-gear-atlas.png');
  const legendaryDropAtlas=loadImage('assets/legendary-gear-drops.png');
  const DREAMWORLD_ROOT='assets/environment/dreamworld/';
  const dreamworldGround=loadImage(DREAMWORLD_ROOT+'dreamworld-ground-tile.png');
  const DREAMWORLD_PROP_META={
    crescentArch:{file:'crescent-arch.png',width:210,glow:'#77c9ff',float:false},
    violetCrystals:{file:'violet-crystals.png',width:110,glow:'#a06cff',float:false},
    dreamLotus:{file:'dream-lotus.png',width:120,glow:'#d7b2ff',float:false},
    starMapObelisk:{file:'star-map-obelisk.png',width:95,glow:'#72d7ff',float:false},
    floatingRuinPillar:{file:'floating-ruin-pillar.png',width:85,glow:'#776cff',float:true},
    moonLantern:{file:'moon-lantern.png',width:80,glow:'#80e8ff',float:false},
    dreamTree:{file:'dream-tree.png',width:150,glow:'#966cff',float:false},
    brokenCrescentShrine:{file:'broken-crescent-shrine.png',width:150,glow:'#777cff',float:false}
  };
  const dreamworldProps=Object.fromEntries(Object.entries(DREAMWORLD_PROP_META).map(([id,meta])=>[id,loadImage(DREAMWORLD_ROOT+'props/'+meta.file)]));
  const DREAMWORLD_COVER_FILES={
    intactRuinWall:'intact-ruin-wall.png',
    brokenRuinWall:'broken-ruin-wall.png',
    violetCrystalHedge:'violet-crystal-hedge.png',
    crescentBalustrade:'crescent-balustrade.png',
    floatingStoneBlocks:'floating-stone-blocks.png',
    cloudstoneWall:'cloudstone-wall.png'
  };
  const DREAMWORLD_COVER_IDS=Object.keys(DREAMWORLD_COVER_FILES);
  const dreamworldCover=Object.fromEntries(Object.entries(DREAMWORLD_COVER_FILES).map(([id,file])=>[id,loadImage(DREAMWORLD_ROOT+'cover/'+file)]));
  const SKYGLASS_ROOT='assets/environment/skyglass/';
  const skyglassGround=loadImage(SKYGLASS_ROOT+'skyglass-ground-tile.png');
  const SKYGLASS_PROP_META={
    pearlShellShrine:{file:'pearl-shell-shrine.png',width:135,glow:'#bcecff',float:false},
    jellyfishLantern:{file:'jellyfish-lantern.png',width:85,glow:'#61e7ff',float:true},
    coralGarden:{file:'coral-garden.png',width:110,glow:'#f29ab8',float:false},
    seaGlassArch:{file:'sea-glass-arch.png',width:130,glow:'#79e7ff',float:false},
    tideCompassPedestal:{file:'tide-compass-pedestal.png',width:120,glow:'#62dff5',float:false},
    celestialKoiStatue:{file:'celestial-koi-statue.png',width:130,glow:'#9eeaff',float:false},
    floatingReefPillar:{file:'floating-reef-pillar.png',width:90,glow:'#53d8f3',float:true},
    spiralShellPortal:{file:'spiral-shell-portal.png',width:140,glow:'#b9f4ff',float:false}
  };
  const skyglassProps=Object.fromEntries(Object.entries(SKYGLASS_PROP_META).map(([id,meta])=>[id,loadImage(SKYGLASS_ROOT+'props/'+meta.file)]));
  const SKYGLASS_COVER_FILES={
    intactGlassBalustrade:'intact-glass-balustrade.png',
    brokenGlassBalustrade:'broken-glass-balustrade.png',
    coralReefHedge:'coral-reef-hedge.png',
    seaGlassShardWall:'sea-glass-shard-wall.png',
    pearlShellWall:'pearl-shell-wall.png',
    floatingReefBlocks:'floating-reef-blocks.png'
  };
  const SKYGLASS_COVER_IDS=Object.keys(SKYGLASS_COVER_FILES);
  const skyglassCover=Object.fromEntries(Object.entries(SKYGLASS_COVER_FILES).map(([id,file])=>[id,loadImage(SKYGLASS_ROOT+'cover/'+file)]));
  const ui={
    game:$('game'),base:$('baseView'),expedition:$('expeditionView'),scene:document.querySelector('.workshopScene'),pappaHammerBase:document.querySelector('.pappaHammerBase'),pappaHammerBaseSprite:$('pappaHammerBaseSprite'),gearCharacterHero:document.querySelector('.gearCharacterHero'),
    bank:$('bankScrap'),materials:$('materialCount'),legendaryCores:$('legendaryCoreCount'),cores:$('coreCount'),best:$('bestDepth'),pappaLevel:$('pappaLevel'),settingsButton:$('settingsButton'),
    gearLockerButton:$('gearLockerButton'),gearLoadoutName:$('gearLoadoutName'),baseLoadout:$('baseLoadout'),baseGearStats:$('baseGearStats'),
    gearOverlay:$('gearOverlay'),gearPanel:$('gearPanel'),closeGear:$('closeGear'),gearHoverPreview:$('gearHoverPreview'),gearStatsSummary:$('gearStatsSummary'),gearLoadoutSlots:$('gearLoadoutSlots'),gearFilters:$('gearFilters'),gearRarityFilters:$('gearRarityFilters'),gearRaritySummary:$('gearRaritySummary'),gearGrid:$('gearGrid'),gearEmpty:$('gearEmpty'),gearDetail:$('gearDetail'),gearSortButton:$('gearSortButton'),gearSortLabel:$('gearSortLabel'),sellFilteredGear:$('sellFilteredGear'),sellFilteredLabel:$('sellFilteredLabel'),sellFilteredSummary:$('sellFilteredSummary'),gearCharacterStage:$('gearCharacterStage'),gearPreviewName:$('gearPreviewName'),gearEquippedCount:$('gearEquippedCount'),gearInventorySummary:$('gearInventorySummary'),gearTurnLeft:$('gearTurnLeft'),gearTurnRight:$('gearTurnRight'),gearTurnReadout:$('gearTurnReadout'),gearPappaLevel:$('gearPappaLevel'),gearXpFill:$('gearXpFill'),gearXpText:$('gearXpText'),gearSetSummary:$('gearSetSummary'),mobileGearSelection:$('mobileGearSelection'),mobileGearSelectionArt:$('mobileGearSelectionArt'),mobileGearSelectionMeta:$('mobileGearSelectionMeta'),mobileGearSelectionName:$('mobileGearSelectionName'),mobileGearSelectionPower:$('mobileGearSelectionPower'),mobileGearEquip:$('mobileGearEquip'),mobileGearSort:$('mobileGearSort'),mobileGearSortLabel:$('mobileGearSortLabel'),mobileGearFilter:$('mobileGearFilter'),mobileGearFilterLabel:$('mobileGearFilterLabel'),gearMobileSheet:$('gearMobileSheet'),gearMobileSheetShade:$('gearMobileSheetShade'),gearMobileSheetTitle:$('gearMobileSheetTitle'),gearMobileSheetOptions:$('gearMobileSheetOptions'),closeGearMobileSheet:$('closeGearMobileSheet'),
    start:$('startButton'),notice:$('baseNotice'),blueprintButton:$('blueprintButton'),starterIcon:$('starterIcon'),starterName:$('starterName'),
    blueprintOverlay:$('blueprintOverlay'),closeBlueprints:$('closeBlueprints'),starterReadout:$('starterReadout'),wardenTechGrid:$('wardenTechGrid'),blueprintGrid:$('blueprintGrid'),careerStats:$('careerStats'),
    mapOverlay:$('mapOverlay'),closeMaps:$('closeMaps'),mapGrid:$('mapGrid'),mapPappaLevel:$('mapPappaLevel'),nextMapUnlock:$('nextMapUnlock'),selectedMapLabel:$('selectedMapLabel'),briefingOverlay:$('briefingOverlay'),briefingStart:$('briefingStart'),contractTracker:$('contractTracker'),contractTitle:$('contractTitle'),contractReadout:$('contractReadout'),contractFill:$('contractFill'),contractPrompt:$('contractPrompt'),contractOverlay:$('contractOverlay'),closeContract:$('closeContract'),vaultClaimLabel:$('vaultClaimLabel'),vaultEyebrow:$('vaultEyebrow'),vaultCycle:$('vaultCycle'),vaultReward:$('vaultReward'),vaultDescription:$('vaultDescription'),vaultOdds:$('vaultOdds'),contractCompleteTitle:$('contractCompleteTitle'),
    resultOverlay:$('resultOverlay'),resultPanel:document.querySelector('.resultPanel'),resultTitle:$('resultTitle'),resultScrap:$('resultScrap'),resultDepth:$('resultDepth'),resultTime:$('resultTime'),resultKills:$('resultKills'),resultDamage:$('resultDamage'),resultRisk:$('resultRisk'),resultItems:$('resultItems'),resultRecord:$('resultRecord'),resultLootSummary:$('resultLootSummary'),resultLoot:$('resultLoot'),resultModules:$('resultModules'),closeResult:$('closeResult'),
    healthText:$('healthText'),healthFill:$('healthFill'),runScrap:$('runScrap'),lootMetric:$('lootMetric'),lootBest:$('lootBest'),depth:$('depthText'),risk:$('riskText'),extract:$('extractButton'),
    miniMap:$('miniMap'),miniMapCacheCount:$('miniMapCacheCount'),mapSeedDebug:$('mapSeedDebug'),xpHud:$('xpHud'),xpLevel:$('xpLevel'),xpFill:$('xpFill'),xpSpark:$('xpSpark'),xpText:$('xpText'),
    depthRoute:$('depthRoute'),routeLabel:$('routeLabel'),routeTicks:$('routeTicks'),routeProgress:$('routeProgressFill'),runNotice:$('runNotice'),lootToast:$('lootToast'),lootToastIcon:$('lootToastIcon'),lootToastRarity:$('lootToastRarity'),lootToastName:$('lootToastName'),lootToastValue:$('lootToastValue'),cargoHud:$('cargoHud'),cargoSlots:$('cargoSlots'),zoneHud:$('zoneHud'),zoneDepth:$('zoneDepth'),zoneName:$('zoneName'),bossHud:$('bossHud'),bossName:$('bossName'),bossHealthFill:$('bossHealthFill'),bossPhase:$('bossPhaseText'),
    extractOverlay:$('extractOverlay'),extractCount:$('extractCount'),cancelExtract:$('cancelExtract'),
    bossLootOverlay:$('bossLootOverlay'),bossLootPanel:$('bossLootPanel'),bossLootEyebrow:$('bossLootEyebrow'),bossLootTitle:$('bossLootTitle'),bossLootDecision:$('bossLootDecision'),bossLootPappa:$('bossLootPappa'),bossLootArt:$('bossLootArt'),bossLootRarity:$('bossLootRarity'),bossLootName:$('bossLootName'),bossLootStats:$('bossLootStats'),bossLootCompare:$('bossLootCompare'),bossLootDecisionCount:$('bossLootDecisionCount'),bossLootEquip:$('bossLootEquip'),bossLootSalvage:$('bossLootSalvage'),bossLootSalvageReward:$('bossLootSalvageReward'),bossLootPath:$('bossLootPath'),bossLootCount:$('bossLootCount'),bossLootGrid:$('bossLootGrid'),bossLootValue:$('bossLootValue'),bossLootMultiplier:$('bossLootMultiplier'),bossLootExtract:$('bossLootExtract'),bossLootPush:$('bossLootPush'),
    routeOverlay:$('routeOverlay'),routeFurnace:$('routeFurnace'),routeDynamo:$('routeDynamo'),
    moduleOverlay:$('moduleOverlay'),moduleEyebrow:$('moduleEyebrow'),moduleTitle:$('moduleTitle'),moduleChoices:$('moduleChoices'),moduleSkip:$('moduleSkip'),
    joystick:$('joystick'),knob:$('joystickKnob'),spin:$('spinButton'),spinPackCount:$('spinPackCount'),dash:$('dashButton'),
    settingsOverlay:$('settingsOverlay'),settingsPanel:document.querySelector('.settingsPanel'),closeSettings:$('closeSettings'),soundToggle:$('soundToggle'),shakeToggle:$('shakeToggle'),particlesToggle:$('particlesToggle'),resume:$('resumeButton'),abandon:$('abandonButton'),
    devButton:$('devButton'),devPanel:$('devPanel'),devScrap:$('devScrap'),devRig:$('devRig'),devBlackHole:$('devBlackHole'),devHeal:$('devHeal'),devCache:$('devCache'),devLoot:$('devLoot'),devLevel:$('devLevel'),devWarden:$('devWarden'),devTyrant:$('devTyrant'),devSchematic:$('devSchematic'),devReset:$('devReset'),
    helpTooltip:$('helpTooltip'),helpTooltipTitle:$('helpTooltipTitle'),helpTooltipText:$('helpTooltipText')
  };
  const gearHoverPreview=ui.gearHoverPreview;

  const SAVE_KEY='scrapbound_prototype_v1',SAVE_VERSION=11,WORLD={w:2400,h:1600},DEPTH_THRESHOLDS=[0,55,120,195,280],CAMERA_ZOOM={mobile:.72,desktop:.8};
  const VAULT_SEALS=3,VAULT_RELICS=12;
  const SALVAGE_REWARDS={common:{materials:1,cores:0},uncommon:{materials:2,cores:0},rare:{materials:5,cores:0},epic:{materials:15,cores:0},mythic:{materials:15,cores:0},legendary:{materials:25,cores:1}};
  const LIMITS={enemies:112,enemyBullets:260,loot:180,particles:420};
  const REGULAR_ENEMY_DAMAGE_SCALE=.82;
  const ENEMY_SPAWN_GRACE=.42,ENEMY_VIEW_MARGIN=34,TANK_RUSH_WINDUP=.88,TANK_RUSH_SPEED=650,TANK_RUSH_RANGE=440,TANK_RUSH_OVERSHOOT=72,TANK_RUSH_RECOVERY=.48,LANCER_THRUST_WINDUP=.64,LANCER_THRUST_SPEED=650,LANCER_THRUST_RANGE=430,RUSHER_POUNCE_WINDUP=.34,RUSHER_POUNCE_SPEED=455;
  const HAMMERSTORM={acquireRadius:410,leapDuration:.18,pulseInterval:.115,baseRadius:108,maxLeap:315,minSpin:.16};
  const BLACK_HOLE_STORM={spawnDuration:.34,pulseDuration:.24,collapseDuration:.68,idleFps:7,pullFps:12,dashFps:15,orbiters:12,mobileOrbiters:8,pullRadiusScale:1.72,pullMin:72,pullMax:318,pullSmoothing:10.5,orbitSpeed:1.92,orbitGap:20,orbitLaneGap:13,orbitLanes:5,elitePull:.48};
  const MELEE={reach:96,impactRadius:72,shockwaveRadius:158};
  const DISPLACEMENT=Object.freeze({
    none:Object.freeze({direction:0,strength:0,duration:0,bossScale:0}),
    pull:Object.freeze({direction:-1,strength:52,duration:.12,bossScale:.2}),
    vortex:Object.freeze({direction:-1,strength:220,duration:.24,bossScale:.32}),
    knockback:Object.freeze({direction:1,strength:130,duration:.14,bossScale:.28}),
    strongKnockback:Object.freeze({direction:1,strength:340,duration:.22,bossScale:.38})
  });
  const HORDE={basePopulation:34,maxPopulation:64,overlapRatio:.58,reinforceAfter:5.4,clearBreather:.24,spawnBatch:6,spawnInterval:.034,cohesionRadius:150};
  const COMMON_ZONES=[
    {name:'GUILD OUTSKIRTS',threat:'MASKED RAIDERS',top:'#263650',bottom:'#111928',grid:'#eadfca14',accent:'#d6aa58',pool:['rusher','rusher','rusher','shooter']},
    {name:'LANTERN MARKET',threat:'CROSSBOW SCOUTS',top:'#21324d',bottom:'#0d1728',grid:'#c83f4617',accent:'#c83f46',pool:['rusher','shooter','shooter','shooter']}
  ];
  const ROUTES={
    furnace:{name:'CRIMSON PATH',short:'CRIMSON',scrap:1.16,relicRare:0,lootRare:0,boss:'tyrant',zones:[
      {name:'RED BANNER YARD',threat:'SHIELD GUARDS',top:'#392432',bottom:'#180e17',grid:'#c83f4620',accent:'#d64a50',pool:['rusher','brute','brute','shooter']},
      {name:'EMBER COURT',threat:'BANNER STRIKES',top:'#32202d',bottom:'#130b14',grid:'#d6aa5820',accent:'#d6aa58',pool:['brute','brute','shooter','rusher']},
      {name:"CHAMPION'S HALL",threat:'CRIMSON CHAMPION',top:'#351b27',bottom:'#120910',grid:'#c83f4624',accent:'#d64a50',pool:['brute','shooter','rusher']}
    ]},
    dynamo:{name:'MOONLIT PATH',short:'MOONLIT',scrap:1,relicRare:.04,lootRare:.08,boss:'warden',zones:[
      {name:'LANTERN GALLERY',threat:'CROSSBOW SCOUTS',top:'#21314c',bottom:'#0d1628',grid:'#eadfca1a',accent:'#eadfca',pool:['shooter','shooter','rusher','rusher']},
      {name:'MOON VAULT',threat:'STAFF LANCERS',top:'#192943',bottom:'#0a1222',grid:'#8fa4cd20',accent:'#9eb2d5',pool:['shooter','lancer','lancer','brute']},
      {name:"WARDEN'S KEEP",threat:'VAULT WARDEN',top:'#202b42',bottom:'#0c1220',grid:'#d6aa581c',accent:'#d6aa58',pool:['lancer','brute','shooter']}
    ]}
  };
  const EXPEDITION_MAPS={
    guild:{name:'GUILD FRONTIER',short:'FRONTIER',minLevel:1,mark:'\u2726',tag:'BALANCED',desc:'The familiar road into the tower. A fair proving ground for fresh adventurers.',accent:'#d6aa58',enemyHp:1,enemyDamage:1,enemySpeed:1,spawnRate:1,coinValue:1,bossHp:1,bossDamage:1,rarityBonus:0,dropBonus:0,zones:null},
    foundry:{name:'ASHEN FOUNDRY',short:'FOUNDRY',minLevel:4,mark:'\u2739',tag:'HEAVY ENEMIES',desc:'A furnace district ruled by shield guards. Tougher fights pay richer coin purses.',accent:'#d85a43',enemyHp:1.1,enemyDamage:1.06,enemySpeed:.98,spawnRate:.95,coinValue:1.14,bossHp:1.1,bossDamage:1.05,rarityBonus:.025,dropBonus:.04,zones:[
      {name:'COAL GATE',threat:'IRON RAIDERS',top:'#38202a',bottom:'#160e16',grid:'#d85a431d',accent:'#d85a43',pool:['rusher','brute','brute','shooter']},
      {name:'SMELTER WALK',threat:'FURNACE GUARDS',top:'#3a2426',bottom:'#160d12',grid:'#d6aa5820',accent:'#e29450',pool:['brute','brute','shooter','rusher']},
      {name:'CINDER FOUNDRY',threat:'HAMMER CREW',top:'#44251f',bottom:'#170c0c',grid:'#e26c4622',accent:'#ed7b4f',pool:['brute','brute','lancer','shooter']},
      {name:'MOLTEN ARCHIVE',threat:'ASH LANCERS',top:'#352026',bottom:'#120a10',grid:'#f0aa5b20',accent:'#e7a95b',pool:['lancer','brute','brute','shooter']},
      {name:'FORGEMASTER COURT',threat:'TOWER CHAMPION',top:'#401c20',bottom:'#12090d',grid:'#d85a4328',accent:'#f08358',pool:['brute','lancer','shooter']}
    ]},
    moonfall:{name:'MOONFALL GARDENS',short:'MOONFALL',minLevel:8,mark:'\u263E',tag:'SWIFT HUNTERS',desc:'Moonlit courtyards filled with scouts and lancers. Faster danger improves rare gear odds.',accent:'#9eb2d5',enemyHp:1.16,enemyDamage:1.11,enemySpeed:1.1,spawnRate:.9,coinValue:1.22,bossHp:1.17,bossDamage:1.1,rarityBonus:.055,dropBonus:.08,zones:[
      {name:'SILVER HEDGE',threat:'MOON SCOUTS',top:'#1d3046',bottom:'#0b1524',grid:'#9eb2d51d',accent:'#9eb2d5',pool:['shooter','shooter','rusher','lancer']},
      {name:'LANTERN POND',threat:'GLASS ARCHERS',top:'#193346',bottom:'#081723',grid:'#7ac4c820',accent:'#9bd5d2',pool:['shooter','lancer','shooter','rusher']},
      {name:'ECLIPSE ARCADE',threat:'STAFF LANCERS',top:'#252d50',bottom:'#0c1225',grid:'#a8b7e424',accent:'#b6c4ea',pool:['lancer','lancer','shooter','rusher']},
      {name:'STARLIT ORCHARD',threat:'NIGHT HUNTERS',top:'#272744',bottom:'#0d0f21',grid:'#d6aa581a',accent:'#d9c67e',pool:['lancer','shooter','lancer','brute']},
      {name:'MOONFALL SANCTUM',threat:'TOWER CHAMPION',top:'#202944',bottom:'#090e1d',grid:'#9eb2d52a',accent:'#c2cff0',pool:['lancer','shooter','brute']}
    ]},
    skyglass:{name:'SKYGLASS LAGOON',short:'SKYGLASS',minLevel:12,boss:'leviathan',mark:'\u224B',tag:'TIDAL CROSSFIRE',desc:'A floating lagoon of glass tides and ranged patrols. Clear sightlines reward movement with stronger gear odds.',accent:'#79e7f2',enemyHp:1.23,enemyDamage:1.15,enemySpeed:1.05,spawnRate:.87,coinValue:1.28,bossHp:1.24,bossDamage:1.14,rarityBonus:.078,dropBonus:.11,zones:[
      {name:'PEARL LANDING',threat:'REEF SCOUTS',top:'#17384b',bottom:'#071c2c',grid:'#79e7f21c',accent:'#9eeeff',pool:['shooter','rusher','shooter','lancer']},
      {name:'CORAL PROMENADE',threat:'TIDE LANCERS',top:'#173f50',bottom:'#071d2b',grid:'#f29ab81b',accent:'#f0abc2',pool:['lancer','shooter','lancer','rusher']},
      {name:'SKYGLASS ARCADE',threat:'GLASS SENTINELS',top:'#153749',bottom:'#061824',grid:'#79e7f224',accent:'#7ce9f5',pool:['shooter','lancer','brute','shooter']},
      {name:'CELESTIAL REEF',threat:'KOI WARDENS',top:'#18364c',bottom:'#071622',grid:'#d6aa581c',accent:'#a9eaf2',pool:['lancer','brute','shooter','lancer']},
      {name:'TIDE COMPASS COURT',threat:'SKYGLASS LEVIATHAN',top:'#123448',bottom:'#061522',grid:'#79e7f22b',accent:'#c9f8ff',pool:['shooter','lancer','brute']}
    ]},
    summit:{name:'CROWN SUMMIT',short:'SUMMIT',minLevel:16,mark:'\u2654',tag:'LEGENDARY RISK',desc:'The royal heights. Elite patrols and brutal champions guard the strongest possible gear.',accent:'#f2c14f',enemyHp:1.3,enemyDamage:1.2,enemySpeed:1.07,spawnRate:.84,coinValue:1.34,bossHp:1.32,bossDamage:1.18,rarityBonus:.1,dropBonus:.15,zones:[
      {name:'GILDED STEPS',threat:'CROWN RAIDERS',top:'#332d3d',bottom:'#110f1a',grid:'#f2c14f20',accent:'#e5c36e',pool:['lancer','brute','shooter','rusher']},
      {name:'KING\'S PROMENADE',threat:'ROYAL GUARDS',top:'#342b3b',bottom:'#100d18',grid:'#d6aa5825',accent:'#f0cf78',pool:['brute','brute','lancer','shooter']},
      {name:'BROKEN THRONEWAY',threat:'OATHBREAKERS',top:'#30243b',bottom:'#0f0b18',grid:'#c83f4622',accent:'#dc6970',pool:['lancer','brute','shooter','lancer']},
      {name:'CROWNLESS HALL',threat:'ELITE SENTINELS',top:'#2c2742',bottom:'#0b0a17',grid:'#f2c14f27',accent:'#f2c14f',pool:['brute','lancer','lancer','shooter']},
      {name:'SUMMIT OF FATE',threat:'TOWER CHAMPION',top:'#352a43',bottom:'#0c0915',grid:'#f2c14f30',accent:'#ffe29a',pool:['brute','lancer','shooter']}
    ]}
  };
  const DREAMWORLD_DECOR_LAYOUT=[
    ['crescentArch',135,430,250,.2,0],['dreamTree',2260,420,190,1.3,1],
    ['dreamLotus',175,1490,165,2.1,0],['brokenCrescentShrine',2225,1490,180,.8,1],
    ['starMapObelisk',1180,205,112,1.7,0],['floatingRuinPillar',625,205,92,.4,0],
    ['floatingRuinPillar',1785,190,86,2.8,1],['moonLantern',350,235,82,2.2,0],
    ['moonLantern',2050,245,78,.5,1],['moonLantern',365,1515,80,1.1,0],
    ['moonLantern',2025,1510,82,2.5,1],['brokenCrescentShrine',95,965,145,1.9,0],
    ['crescentArch',2315,930,205,.9,1],['dreamTree',95,1190,165,2.6,0],
    ['dreamTree',2310,1215,158,.1,1],['dreamLotus',760,1515,125,1.5,0],
    ['dreamLotus',1650,1510,132,2.9,1],['violetCrystals',505,160,100,.7,0],
    ['violetCrystals',935,175,86,2.4,1],['violetCrystals',1450,175,92,1.2,0],
    ['violetCrystals',1940,170,104,2,1],['violetCrystals',120,700,90,.3,0],
    ['violetCrystals',2285,680,96,1.8,1],['violetCrystals',115,1320,88,2.7,0],
    ['violetCrystals',2290,1325,94,.6,1],['dreamLotus',520,1480,108,2.3,0],
    ['dreamLotus',1910,1470,112,1.4,1],['moonLantern',1020,1495,72,.2,0],
    ['moonLantern',1390,1490,72,2.2,1],['starMapObelisk',245,850,88,1,0],
    ['starMapObelisk',2150,815,88,2.5,1],['floatingRuinPillar',80,590,76,.9,0],
    ['floatingRuinPillar',2320,555,80,2.1,1],['violetCrystals',790,1465,78,.4,0],
    ['violetCrystals',1575,1455,82,1.9,1],['dreamLotus',1200,1530,112,2.7,0]
  ];
  const SKYGLASS_DECOR_LAYOUT=[
    ['seaGlassArch',125,420,178,.2,0],['spiralShellPortal',2280,420,188,1.8,1],
    ['pearlShellShrine',145,1450,166,2.5,0],['celestialKoiStatue',2255,1450,174,.8,1],
    ['tideCompassPedestal',1200,165,142,1.4,0],['seaGlassArch',1195,1545,158,2.7,1],
    ['floatingReefPillar',520,175,98,.5,0],['floatingReefPillar',1880,180,96,2.2,1],
    ['jellyfishLantern',310,225,88,1.2,0],['jellyfishLantern',2090,235,84,2.9,1],
    ['coralGarden',75,790,124,.9,0],['coralGarden',2325,790,120,2.4,1],
    ['celestialKoiStatue',835,165,118,2.1,0],['pearlShellShrine',1575,170,118,.7,1],
    ['jellyfishLantern',85,600,72,2.6,0],['jellyfishLantern',2310,590,76,1.1,1],
    ['jellyfishLantern',90,1185,78,.4,1],['jellyfishLantern',2305,1190,74,2,0],
    ['coralGarden',410,1515,92,1.7,0],['coralGarden',760,1515,88,.3,1],
    ['coralGarden',1640,1510,92,2.8,0],['coralGarden',1985,1510,88,1.2,1],
    ['floatingReefPillar',80,975,76,1.5,0],['floatingReefPillar',2320,990,78,2.4,1],
    ['tideCompassPedestal',265,865,82,.6,0],['tideCompassPedestal',2145,865,84,2.7,1],
    ['coralGarden',455,175,78,2.3,1],['coralGarden',1955,175,82,.8,0],
    ['jellyfishLantern',975,1505,68,1.9,0],['jellyfishLantern',1435,1505,70,.2,1],
    ['floatingReefPillar',685,1515,72,2.5,1],['floatingReefPillar',1730,1510,74,1,0]
  ];
  const EXPEDITION_MAP_IDS=Object.keys(EXPEDITION_MAPS);
  const MAP_ENVIRONMENT_THEMES={
    guild:{floor:'#101b2b',line:'#31435d',detail:'#d6aa58',cover:'#17243a',coverInset:'#24344d',shadow:'#060b13'},
    foundry:{floor:'#1c1115',line:'#4f2b2d',detail:'#e77845',cover:'#30191b',coverInset:'#4b2825',shadow:'#0d0708'},
    summit:{floor:'#171321',line:'#463b58',detail:'#f2c14f',cover:'#242033',coverInset:'#3b3349',shadow:'#09070e'}
  };
  const BOSSES={
    warden:{name:'VAULT WARDEN',kind:'warden',accent:'#d6aa58',intro:'THE LAST DOOR CLOSES',phase:['PHASE I \u00B7 THE FIRST LOCK','PHASE II \u00B7 SEAL THE FLOOR','PHASE III \u00B7 NO ONE LEAVES']},
    tyrant:{name:'CRIMSON CHAMPION',kind:'tyrant',accent:'#d64a50',intro:'THE CHAMPION SALUTES',phase:['PHASE I \u00B7 A FORMAL BOW','PHASE II \u00B7 RED TEMPEST','PHASE III \u00B7 TAKE MY BEST']},
    leviathan:{name:'SKYGLASS LEVIATHAN',kind:'leviathan',accent:'#79e7f2',intro:'THE LAGOON AWAKENS',phase:['PHASE I \u00B7 GLASS CURRENT','PHASE II \u00B7 PEARL UNDERTOW','PHASE III \u00B7 SKYGLASS TEMPEST']}
  };
  const MODULES={
    burst:{name:'Hammer Echo',icon:'\u2726',desc:'Adds another close-range impact echo to every strike.'},
    mark:{name:"Champion's Mark",icon:'\u2726',desc:'Deals more damage to elites and bosses, with a chance for one extra boss drop.'},
    plating:{name:'Guard Charm',icon:'\u25C6',desc:'Blocks incoming hits before health takes damage.'},
    overdrive:{name:'Battle Rhythm',icon:'\u00BB',desc:'Boosts movement speed and hammer strike rate.'},
    volatile:{name:'Reckless Swing',icon:'!',desc:'Raises hammer damage, but lowers maximum health.'}
  };
  const MODULE_IDS=Object.keys(MODULES),BLUEPRINT_THRESHOLDS=[0,1,3,7];
  const BOSS_SCHEMATICS={
    aegis:{name:'Guardian Crest',icon:'\u25C6',desc:'Begin every expedition with another guard charge.',max:3},
    thrusters:{name:"Traveler's Boots",icon:'\u00BB',desc:'Reduces dash recharge time for every expedition.',max:5},
    recycler:{name:"Merchant's Favor",icon:'$',desc:'Raises the sale value of all loot recovered in the field.',max:5},
    thermal:{name:"Champion's Lesson",icon:'\u2739',desc:'Dashing charges explosive hammer waves for every expedition.',max:3}
  };
  const WARDEN_SCHEMATIC_IDS=['aegis','thrusters','recycler'],TYRANT_SCHEMATIC_IDS=['thermal'],SCHEMATIC_IDS=[...WARDEN_SCHEMATIC_IDS,...TYRANT_SCHEMATIC_IDS],CORE_DIVIDEND=300;
  const LOOT_RARITIES={
    common:{name:'COMMON',rank:0,color:'#e4e7eb',glow:'#aeb7c2',mark:'I'},
    rare:{name:'RARE',rank:1,color:'#39dc78',glow:'#8ff0ae',mark:'II'},
    epic:{name:'EPIC',rank:2,color:'#4da3ff',glow:'#9dcaff',mark:'III'},
    mythic:{name:'MYTHIC',rank:3,color:'#d45cff',glow:'#eda6ff',mark:'IV'},
    legendary:{name:'LEGENDARY',rank:4,color:'#ffc928',glow:'#fff09a',mark:'V'}
  };
  const GEAR_SLOTS=['hat','scarf','coat','hammer','boots'];
  const GEAR_SLOT_META={hat:{name:'HAT',icon:'\u25B2'},scarf:{name:'SCARF',icon:'\u2248'},coat:{name:'COAT',icon:'\u25A5'},hammer:{name:'HAMMER',icon:'\u2692'},boots:{name:'BOOTS',icon:'\u21A5'}};
  const GEAR_SORTS=[{id:'power',name:'POWER'},{id:'rarity',name:'RARITY'},{id:'level',name:'LEVEL'},{id:'newest',name:'NEWEST'},{id:'value',name:'VALUE'},{id:'name',name:'NAME'}];
  const PAPER_DOLL_POSES=['idle','run','attack'],PAPER_DOLL_CELL=512,PAPER_DOLL_MASK_CELL=256;
  const paperDollMasks=Object.fromEntries(PAPER_DOLL_POSES.map(pose=>[pose,Object.fromEntries(GEAR_SLOTS.map(slot=>[slot,loadImage('assets/paper-doll/'+pose+'-'+slot+'.png')]))]));
  const GEAR_ATLAS_COLUMNS=10,GEAR_ATLAS_ROWS=5,GEAR_ATLAS_CELL=256,GEAR_DROP_CELL=80,GEAR_ATLAS_ROW=Object.fromEntries(GEAR_SLOTS.map((slot,row)=>[slot,row]));
  const SET_GEAR_COLUMNS=5,SET_GEAR_ROWS=16,SET_GEAR_CELL=256,SET_GEAR_DROP_CELL=80;
  const LEGENDARY_GEAR_COLUMNS=5,LEGENDARY_GEAR_ROWS=5,LEGENDARY_DROP_CELL=160;
  const LEGENDARY_SET_ROW={riskreaver:0,grandVault:1,crownlessKing:2,fatebound:3};
  const LEGENDARY_SLOT_COLUMN=Object.fromEntries(GEAR_SLOTS.map((slot,column)=>[slot,column]));
  const LEGENDARY_LEGACY_CELL={tyrantEmbercore:{row:4,column:3},wardenSingularity:{row:4,column:2}};
  function gearDef(id,name,slot,rarity,value,stats,color,accent,style,extra){return Object.assign({id,name,slot,rarity,value,stats,form:slot,visual:{color,accent,style:style||0}},extra||{})}
  const LEGACY_LOOT_ITEMS=[
    gearDef('bentCog','Guild Work Hat','hat','common',8,{hp:5},'#101723','#d6aa58',0),
    gearDef('copperWire','Scout Brim','hat','common',9,{speed:.02},'#243752','#c83f46',1),
    gearDef('rustedBolt','Iron-Band Fedora','hat','common',10,{damage:.6},'#11151d','#9aa5aa',2),
    gearDef('brassWasher','Compass Hat','hat','common',11,{magnet:7},'#17243a','#d6aa58',3),
    gearDef('crackedGauge','Red Work Scarf','scarf','common',8,{hp:6},'#a52d35','#f4ead6',0),
    gearDef('valveHandle','Trail Wrap','scarf','common',9,{magnet:7},'#46566f','#f4ead6',1),
    gearDef('tinPlate','Lucky Kerchief','scarf','common',10,{loot:.03},'#496c4e','#d6aa58',2),
    gearDef('emptyCanister','Duelist Ribbon','scarf','common',11,{fire:.025},'#8f2730','#d6aa58',3),
    gearDef('wornSpring','Padded Guild Coat','coat','common',10,{hp:10},'#172b4b','#d6aa58',0),
    gearDef('gearTooth','Roadwarden Coat','coat','common',11,{armor:.015},'#263650','#9aa5aa',1),
    gearDef('rivetBundle','Sailcloth Duster','coat','common',12,{speed:.025},'#e4d9c3','#17243a',2),
    gearDef('frayedBelt','Stitched Navy Coat','coat','common',13,{hp:6,damage:.6},'#10213c','#c83f46',3),
    gearDef('sootFilter','Oak Block Hammer','hammer','common',10,{damage:1.2},'#5e3d2c','#d6aa58',0),
    gearDef('ironBracket','Brass-Capped Hammer','hammer','common',11,{damage:1.5},'#17243a','#b7863f',1),
    gearDef('pipeCoupling','Quicksmith Mallet','hammer','common',12,{damage:.7,fire:.03},'#263650','#e5dfd1',2),
    gearDef('fuseShell','Heavy Guild Hammer','hammer','common',14,{damage:2.1},'#111923','#c83f46',3),
    gearDef('boilerSeal','Laced Work Boots','boots','common',9,{speed:.025},'#141a24','#f4ead6',0),
    gearDef('chainLink','Tower-Grip Boots','boots','common',10,{dash:.035},'#17243a','#d6aa58',1),
    gearDef('scrapLens','Scavenger Boots','boots','common',11,{magnet:8},'#263b35','#d6aa58',2),
    gearDef('motorBrush','Iron-Toe Boots','boots','common',12,{hp:7},'#161b25','#9aa5aa',3),
    gearDef('pressureRegulator','Lantern Captain Hat','hat','rare',30,{loot:.06,magnet:9},'#213d55','#e1b34c',0),
    gearDef('dynamoCoil','Warden Lens Hat','hat','rare',34,{crit:.04,magnet:7},'#18233d','#9eb2d5',2),
    gearDef('brassGyroscope','Crimson Banner Scarf','scarf','rare',30,{fire:.055,damage:1.2},'#b52d31','#f0c66a',0),
    gearDef('hardenedPiston','Moonweave Scarf','scarf','rare',34,{loot:.055,speed:.04},'#334a7a','#d9e0f0',2),
    gearDef('arcRelay','Vanguard Longcoat','coat','rare',34,{hp:22,armor:.035},'#152944','#c83f46',0),
    gearDef('steamInjector',"Merchant Prince's Coat",'coat','rare',40,{loot:.11,magnet:12},'#24433b','#d6aa58',2),
    gearDef('precisionBearing','Starforged Maul','hammer','rare',38,{damage:4,crit:.035},'#1a2438','#e0ad4f',1),
    gearDef('insulatedConduit','Echoing Squarehammer','hammer','rare',42,{damage:3,fire:.065},'#273754','#f4ead6',2),
    gearDef('wardenOptic','Windstep Boots','boots','rare',34,{speed:.075,dash:.07},'#1b2947','#9eb2d5',1),
    gearDef('cinderCarburetor','Vaultbreaker Boots','boots','rare',38,{hp:12,speed:.045},'#242b38','#d6aa58',3),
    gearDef('aetherCondenser','Compass Crown','hat','epic',90,{crit:.1,magnet:16,loot:.08},'#243b66','#f1d17a',3),
    gearDef('voidCompass','Unfading Crimson Scarf','scarf','epic',90,{fire:.12,speed:.08},'#c02f3b','#f4ead6',3),
    gearDef('royalFlywheel',"Midnight Captain's Coat",'coat','epic',100,{hp:38,armor:.07},'#0d2042','#d6aa58',3),
    gearDef('stormglassCell',"Champion's Sunhammer",'hammer','epic',110,{damage:7,crit:.08},'#261c2c','#f0b83e',3),
    gearDef('furnaceHeart','Horizon Strider Boots','boots','epic',95,{speed:.13,dash:.16},'#152a45','#e7c364',3),
    gearDef('crownGear','Crown of the Lost Road','hat','mythic',240,{crit:.16,loot:.2,magnet:22},'#431a36','#ec9295',4),
    gearDef('phantomLantern',"King's Oathcoat",'coat','mythic',280,{hp:65,armor:.12,speed:.045},'#1c244b','#d6aa58',4),
    gearDef('chronoEscapement','Moonbreaker Hammer','hammer','mythic',320,{damage:12,fire:.15,crit:.12},'#151939','#9eb2d5',4),
    gearDef('tyrantEmbercore','RISKREAVER','hammer','legendary',800,{damage:20,fire:.22,crit:.22},'#2a1017','#f2c14f',5),
    gearDef('wardenSingularity','Grand Vault Coat','coat','legendary',1000,{hp:90,armor:.15,speed:.1},'#f0e7d3','#d6aa58',5)
  ];
  const SET_DEFINITIONS=[
    {id:'trailwarden',name:'TRAILWARDEN',rarity:'rare',minLevel:1,color:'#26435b',accent:'#d6aa58',mark:'\u2726',focus:['speed','magnet'],bonus:{2:{speed:.04,magnet:12},3:{hp:16},5:{damage:2.4,crit:.025}}},
    {id:'ironGuild',name:'IRON GUILD',rarity:'rare',minLevel:1,color:'#303a43',accent:'#c2b9a5',mark:'\u25C6',focus:['hp','armor'],bonus:{2:{hp:18},3:{armor:.035},5:{hp:26,damage:2}}},
    {id:'redBanner',name:'RED BANNER',rarity:'rare',minLevel:2,color:'#8f2730',accent:'#f0c66a',mark:'\u2691',focus:['damage','fire'],bonus:{2:{damage:2},3:{fire:.04},5:{crit:.035,damage:2.8}}},
    {id:'moonlitScout',name:'MOONLIT SCOUT',rarity:'rare',minLevel:2,color:'#263d6b',accent:'#d9e0f0',mark:'\u263E',focus:['crit','dash'],bonus:{2:{crit:.025},3:{dash:.055},5:{speed:.05,crit:.035}}},
    {id:'coinseeker',name:'COINSEEKER',rarity:'rare',minLevel:3,color:'#405641',accent:'#e1b34c',mark:'$',focus:['loot','magnet'],bonus:{2:{loot:.05},3:{magnet:18},5:{loot:.08,speed:.035}}},
    {id:'towerBulwark',name:'TOWER BULWARK',rarity:'epic',minLevel:4,color:'#303f66',accent:'#aebff0',mark:'\u25A3',focus:['armor','hp'],bonus:{2:{armor:.03},3:{hp:24},5:{armor:.045,damage:1.8}}},
    {id:'stormrunner',name:'STORMRUNNER',rarity:'epic',minLevel:4,color:'#1e4e63',accent:'#9ed9e5',mark:'\u21AF',focus:['speed','dash'],bonus:{2:{speed:.045},3:{dash:.06},5:{fire:.055,speed:.04}}},
    {id:'hammerChoir',name:'HAMMER CHOIR',rarity:'epic',minLevel:5,color:'#40345f',accent:'#d7c1ff',mark:'\u266B',focus:['damage','fire'],bonus:{2:{fire:.035},3:{damage:2.7},5:{crit:.04,fire:.045}}},
    {id:'lanternGuard',name:'LANTERN GUARD',rarity:'epic',minLevel:5,color:'#51432d',accent:'#ffe09a',mark:'\u2739',focus:['hp','magnet'],bonus:{2:{hp:20},3:{magnet:20},5:{armor:.035,loot:.045}}},
    {id:'grandWayfarer',name:'GRAND WAYFARER',rarity:'epic',minLevel:6,color:'#273f64',accent:'#e4d9c3',mark:'\u25C7',focus:['speed','hp'],bonus:{2:{speed:.035,hp:10},3:{damage:2},5:{crit:.03,loot:.05}}},
    {id:'crimsonOath',name:'CRIMSON OATH',rarity:'mythic',minLevel:7,color:'#631e2c',accent:'#ec9295',mark:'\u2605',focus:['damage','crit'],bonus:{2:{damage:3.8},3:{crit:.055},5:{damage:5.2,fire:.06}}},
    {id:'moonbreaker',name:'MOONBREAKER',rarity:'mythic',minLevel:8,color:'#24274f',accent:'#aebcf0',mark:'\u263D',focus:['crit','fire'],bonus:{2:{crit:.045},3:{fire:.065},5:{crit:.07,damage:3.5}}},
    {id:'kingsRoad',name:"KING'S ROAD",rarity:'mythic',minLevel:9,color:'#152d55',accent:'#d6aa58',mark:'\u265B',focus:['hp','loot'],bonus:{2:{hp:34},3:{loot:.09},5:{armor:.06,damage:3.2}}},
    {id:'phantomCourt',name:'PHANTOM COURT',rarity:'mythic',minLevel:10,color:'#36314d',accent:'#b7c7d9',mark:'\u25C9',focus:['speed','armor'],bonus:{2:{speed:.065},3:{armor:.055},5:{dash:.08,crit:.05}}},
    {id:'starforge',name:'STARFORGE',rarity:'mythic',minLevel:11,color:'#30243c',accent:'#f0b83e',mark:'\u2737',focus:['damage','armor'],bonus:{2:{damage:4.2},3:{armor:.05},5:{damage:5,crit:.045}}},
    {id:'grandVoyager',name:'GRAND VOYAGER',rarity:'mythic',minLevel:12,color:'#234253',accent:'#d6c58f',mark:'\u2295',focus:['loot','speed'],bonus:{2:{loot:.08},3:{speed:.07},5:{magnet:30,fire:.055}}},
    {id:'riskreaver',name:'RISKREAVER',rarity:'legendary',minLevel:16,color:'#310f18',accent:'#f2c14f',mark:'\u2620',focus:['damage','crit'],tiers:[2,4,5],signaturePieces:4,bonus:{2:{speed:.08},4:{damage:6,crit:.05},5:{damage:8,fire:.08,crit:.05}}},
    {id:'grandVault',name:'GRAND VAULT',rarity:'legendary',minLevel:18,color:'#eee5d2',accent:'#d6aa58',mark:'\u25C8',focus:['hp','armor'],bonus:{2:{hp:55},3:{armor:.08},5:{loot:.14,hp:45,damage:4}}},
    {id:'crownlessKing',name:'CROWNLESS KING',rarity:'legendary',minLevel:20,color:'#151d33',accent:'#f0c66a',mark:'\u2654',focus:['damage','hp'],bonus:{2:{damage:5,hp:28},3:{crit:.07,armor:.05},5:{speed:.08,fire:.08,loot:.1}}},
    {id:'fatebound',name:'FATEBOUND',rarity:'legendary',minLevel:24,color:'#20203c',accent:'#e65a62',mark:'\u221E',focus:['crit','speed'],bonus:{2:{crit:.07,speed:.05},3:{fire:.085,dash:.09},5:{damage:9,crit:.06,loot:.08}}},
    {id:'blackHole',name:'BLACK HOLE',rarity:'legendary',minLevel:22,color:'#07152d',accent:'#4bbcff',mark:'\u2299',focus:['damage','armor'],bonus:{2:{armor:.05,damage:4},3:{crit:.06,fire:.06},5:{damage:8,fire:.07,crit:.04}}}
  ];
  const SET_VISUAL_PROFILES={
    trailwarden:{finish:'leather',hat:'ranger',scarf:'trail',coat:'ranger',hammer:'compass',boots:'trail',secondary:'#172a36',metal:'#d6aa58'},
    ironGuild:{finish:'iron',hat:'helm',scarf:'guard',coat:'plate',hammer:'anvil',boots:'plate',secondary:'#1b2229',metal:'#c2b9a5'},
    redBanner:{finish:'cloth',hat:'plume',scarf:'banner',coat:'tabard',hammer:'banner',boots:'guard',secondary:'#31151b',metal:'#f0c66a'},
    moonlitScout:{finish:'moon',hat:'crescent',scarf:'veil',coat:'scout',hammer:'moon',boots:'swift',secondary:'#111a34',metal:'#d9e0f0'},
    coinseeker:{finish:'gilded',hat:'goggles',scarf:'purse',coat:'seeker',hammer:'coin',boots:'trail',secondary:'#243125',metal:'#e1b34c'},
    towerBulwark:{finish:'iron',hat:'battlement',scarf:'guard',coat:'fortress',hammer:'tower',boots:'plate',secondary:'#151d31',metal:'#aebff0'},
    stormrunner:{finish:'storm',hat:'fins',scarf:'wind',coat:'runner',hammer:'turbine',boots:'swift',secondary:'#102a34',metal:'#9ed9e5'},
    hammerChoir:{finish:'velvet',hat:'choir',scarf:'choir',coat:'choir',hammer:'choir',boots:'choir',secondary:'#251e38',metal:'#d7c1ff'},
    lanternGuard:{finish:'lantern',hat:'lantern',scarf:'guard',coat:'lantern',hammer:'lantern',boots:'guard',secondary:'#2b2418',metal:'#ffe09a'},
    grandWayfarer:{finish:'canvas',hat:'wayfarer',scarf:'trail',coat:'wayfarer',hammer:'compass',boots:'trail',secondary:'#17263d',metal:'#e4d9c3'},
    crimsonOath:{finish:'blood',hat:'oath',scarf:'banner',coat:'oath',hammer:'oath',boots:'guard',secondary:'#270b13',metal:'#ec9295'},
    moonbreaker:{finish:'moon',hat:'crescent',scarf:'veil',coat:'lunar',hammer:'moonblade',boots:'swift',secondary:'#11132d',metal:'#aebcf0'},
    kingsRoad:{finish:'royal',hat:'crown',scarf:'mantle',coat:'royal',hammer:'scepter',boots:'royal',secondary:'#09162b',metal:'#d6aa58'},
    phantomCourt:{finish:'spectral',hat:'veil',scarf:'veil',coat:'phantom',hammer:'phantom',boots:'phantom',secondary:'#171522',metal:'#b7c7d9'},
    starforge:{finish:'forge',hat:'star',scarf:'mantle',coat:'forge',hammer:'starforge',boots:'forge',secondary:'#180f1e',metal:'#f0b83e'},
    grandVoyager:{finish:'voyager',hat:'wayfarer',scarf:'trail',coat:'voyager',hammer:'compass',boots:'swift',secondary:'#10252f',metal:'#d6c58f'},
    riskreaver:{finish:'infernal',hat:'reaver',scarf:'banner',coat:'reaver',hammer:'reaver',boots:'reaver',secondary:'#09070b',metal:'#f2c14f',legendary:'reaver',slotColors:{hat:'#0d1422',scarf:'#8d1f2a',coat:'#111a2b',hammer:'#171a24',boots:'#151923'}},
    grandVault:{finish:'ivory',hat:'vault',scarf:'mantle',coat:'vault',hammer:'vault',boots:'vault',secondary:'#15213a',metal:'#d6aa58',legendary:'vault',slotColors:{hat:'#eee5d2',scarf:'#e8ddc7',coat:'#eee5d2',hammer:'#142340',boots:'#172746'}},
    crownlessKing:{finish:'regal',hat:'brokenCrown',scarf:'mantle',coat:'crownless',hammer:'crown',boots:'royal',secondary:'#070b15',metal:'#f0c66a',legendary:'crown',slotColors:{hat:'#111a30',scarf:'#7f1826',coat:'#101a30',hammer:'#121a2c',boots:'#121a2d'}},
    fatebound:{finish:'fate',hat:'fate',scarf:'veil',coat:'fate',hammer:'fate',boots:'fate',secondary:'#0b0b1c',metal:'#e65a62',legendary:'fate',slotColors:{hat:'#21152e',scarf:'#8d1d35',coat:'#21162c',hammer:'#231329',boots:'#20152b'}},
    blackHole:{finish:'cosmic',hat:'singularity',scarf:'gravity',coat:'constellation',hammer:'blackHole',boots:'voidstep',secondary:'#030a18',metal:'#4bbcff',legendary:'blackHole',slotColors:{hat:'#071124',scarf:'#12386d',coat:'#081a35',hammer:'#050a12',boots:'#07162d'}}
  };
  const FIELD_VISUAL_PROFILES=[
    {finish:'canvas',hat:'ranger',scarf:'trail',coat:'ranger',hammer:'compass',boots:'trail',secondary:'#192334'},
    {finish:'iron',hat:'helm',scarf:'guard',coat:'plate',hammer:'anvil',boots:'plate',secondary:'#181e28'},
    {finish:'cloth',hat:'plume',scarf:'banner',coat:'tabard',hammer:'banner',boots:'guard',secondary:'#29171d'},
    {finish:'moon',hat:'crescent',scarf:'veil',coat:'scout',hammer:'moon',boots:'swift',secondary:'#10182c'},
    {finish:'gilded',hat:'goggles',scarf:'purse',coat:'seeker',hammer:'coin',boots:'trail',secondary:'#25271b'},
    {finish:'forge',hat:'star',scarf:'mantle',coat:'forge',hammer:'starforge',boots:'forge',secondary:'#190f19'}
  ];
  const GEAR_SIGNATURES={
    trailwarden:{role:'HUNTER',name:'TRAIL MOMENTUM',unlock:'Defeating foes shaves time from Dash recovery.',mastery:'Every takedown restores more Dash, with a powerful elite reset.',color:'#d6aa58'},
    ironGuild:{role:'COMEBACK',name:'IRON WILL',unlock:'Below 40% health, gain 12% damage and 6% armor.',mastery:'Below 40% health, gain 20% damage and 10% armor.',color:'#c2b9a5'},
    redBanner:{role:'IMPACT',name:'BANNER BREAKER',unlock:'Every fifth melee impact fractures the ground.',mastery:'Every fourth impact creates a wider physical shockwave.',color:'#f0c66a'},
    moonlitScout:{role:'AMBUSH',name:'MOONSTEP',unlock:'Dashing guarantees the next hammer strike will critically hit.',mastery:'Dashing guarantees the next two strikes will critically hit.',color:'#d9e0f0'},
    coinseeker:{role:'FORTUNE',name:'GILDED BOUNTY',unlock:'Foes carry 30% more coins.',mastery:'Foes carry 60% more coins and elites pay an extra bounty.',color:'#e1b34c'},
    towerBulwark:{role:'FORTRESS',name:'LAST BASTION',unlock:'Negate one hit every 8 seconds.',mastery:'Ward recharges in 6 seconds and answers with a hammer burst.',color:'#9eb2d5'},
    stormrunner:{role:'MOBILITY',name:'GALE STEP',unlock:'Dash drives a physical impact wake through nearby enemies.',mastery:'The impact wake becomes wider, stronger and launches enemies farther.',color:'#79e7f2'},
    hammerChoir:{role:'IMPACT',name:'RESONANT SLAM',unlock:'Every fourth hammer strike releases a damaging shockwave.',mastery:'Every third strike releases a larger, stronger shockwave.',color:'#d7c1ff'},
    lanternGuard:{role:'SUSTAIN',name:'GUIDING LIGHT',unlock:'Entering a new floor restores one guard charge.',mastery:'New floors restore two guard charges and a little health.',color:'#ffe09a'},
    grandWayfarer:{role:'MOMENTUM',name:'LONG ROAD',unlock:'Moving charges the next strike with up to 25% bonus damage.',mastery:'Momentum charges faster and reaches 45% bonus damage.',color:'#e4d9c3'},
    crimsonOath:{role:'CRITICAL',name:'BLOOD ECHO',unlock:'Critical hits echo damage into nearby enemies.',mastery:'Echoes reach farther, hit harder and hasten the next strike.',color:'#ec9295'},
    moonbreaker:{role:'CHAIN',name:'CRESCENT FRACTURE',unlock:'Critical impacts fracture the ground into one nearby foe.',mastery:'The pressure fracture chains through two foes with greater force.',color:'#aebcf0'},
    kingsRoad:{role:'CONQUEST',name:'ROYAL FEAST',unlock:'Defeating an elite restores 5% health.',mastery:'Elite takedowns restore 9% health and one guard charge.',color:'#d6aa58'},
    phantomCourt:{role:'EVASION',name:'PHANTOM VEIL',unlock:'Dash grants a longer evade and empowers the next strike by 25%.',mastery:'Dash grants a longer evade and empowers the next strike by 45%.',color:'#b7c7d9'},
    starforge:{role:'OVERHEAT',name:'STARFALL',unlock:'Every sixth strike becomes a blazing star impact.',mastery:'Every fourth strike becomes a stronger star impact.',color:'#f0b83e'},
    grandVoyager:{role:'EXPLORER',name:'UNCHARTED FORTUNE',unlock:'Each new floor grants a purse of coins.',mastery:'The purse doubles and deeper floors reveal a bonus relic cache.',color:'#d6c58f'},
    riskreaver:{role:'PACK DIVER',name:'CROWD HUNGER',unlock:'Nearby enemies feed your damage and widen Hammerstorm.',mastery:'Full set greatly strengthens surrounded damage. Hammerstorm heals from unique enemies struck, with a strict cap.',color:'#f2c14f'},
    grandVault:{role:'TREASURE WARD',name:'VAULTBOUND',unlock:'Every two unsecured boss items grant a guard charge.',mastery:'Every unsecured boss item grants a guard charge, up to two.',color:'#f4ead6'},
    crownlessKing:{role:'EXECUTION',name:'KINGSLAYER',unlock:'Elites and champions below 30% health take 20% more damage.',mastery:'The threshold rises to 40% and the bonus reaches 35%.',color:'#f0c66a'},
    fatebound:{role:'DESTINY',name:'FATED STRIKE',unlock:'Every seventh strike is guaranteed to critically hit.',mastery:'Every fifth strike is fated, and fatal damage is denied once per expedition.',color:'#e65a62'},
    blackHole:{role:'GRAVITY',name:'GRAVITY WELL',unlock:'Hammerstorm becomes a mobile vortex that pulls enemies inward and holds them in orbit.',mastery:'The mobile vortex stays active while every third hammer strike creates an additional impact singularity.',color:'#4bbcff'}
  };
  const SET_BY_ID=Object.fromEntries(SET_DEFINITIONS.map(set=>[set.id,set]));
  const SET_GEAR_ROW=Object.fromEntries(SET_DEFINITIONS.filter(set=>set.rarity!=='legendary').map((set,row)=>[set.id,row]));
  const SET_SLOT_NAMES={hat:'Crown',scarf:'Oathwrap',coat:'Longcoat',hammer:'Great Hammer',boots:'Striders'};
  const SET_SPECIAL_SLOT_NAMES={blackHole:{hat:'Event Horizon Hat',scarf:'Gravity Veil',coat:'Constellation Longcoat',hammer:'Black Hole Hammer',boots:'Voidstep Boots'}};
  const SET_SLOT_BASE={hat:{hp:5,crit:.008},scarf:{speed:.014,fire:.014},coat:{hp:12,armor:.01},hammer:{damage:1.5,crit:.007},boots:{speed:.02,dash:.02}};
  const SET_FOCUS_BASE={hp:7,damage:1.1,magnet:8,speed:.012,fire:.014,armor:.009,loot:.018,dash:.016,crit:.012};
  const SET_RARITY_POWER={rare:1,epic:1.28,mythic:1.55,legendary:2.2};
  function fixedSetPieceStats(set,slot,index){let power=SET_RARITY_POWER[set.rarity],stats={};for(const key of Object.keys(SET_SLOT_BASE[slot]))stats[key]=SET_SLOT_BASE[slot][key]*power;let focus=set.focus[index%set.focus.length];stats[focus]=(stats[focus]||0)+SET_FOCUS_BASE[focus]*power;return stats}
  const SET_ITEMS=SET_DEFINITIONS.flatMap((set,setIndex)=>GEAR_SLOTS.map((slot,slotIndex)=>gearDef(set.id+'-'+slot,(SET_SPECIAL_SLOT_NAMES[set.id]&&SET_SPECIAL_SLOT_NAMES[set.id][slot])||(set.name+' '+SET_SLOT_NAMES[slot]),slot,set.rarity,Math.round((set.rarity==='legendary'?360:set.rarity==='mythic'?150:set.rarity==='epic'?92:55)*(1+slotIndex*.06)),fixedSetPieceStats(set,slot,slotIndex),set.color,set.accent,setIndex%6,{setId:set.id,minLevel:set.minLevel,setPiece:true,mark:set.mark})));
  const LOOT_ITEMS=[...LEGACY_LOOT_ITEMS,...SET_ITEMS];
  const gearVisualCounts={};
  for(const item of LOOT_ITEMS){let variant=gearVisualCounts[item.slot]||0;gearVisualCounts[item.slot]=variant+1;item.visual.variant=variant;item.visual.atlasColumn=variant%GEAR_ATLAS_COLUMNS;item.visual.atlasRow=GEAR_ATLAS_ROW[item.slot];item.visual.mark=item.mark||GEAR_SLOT_META[item.slot].icon;item.visual.key=item.id;let setGearRow=SET_GEAR_ROW[item.setId],legendaryRow=LEGENDARY_SET_ROW[item.setId],legacyCell=LEGENDARY_LEGACY_CELL[item.id];if(item.setId==='blackHole')item.visual.blackHoleColumn=LEGENDARY_SLOT_COLUMN[item.slot];if(setGearRow!=null){item.visual.setGearRow=setGearRow;item.visual.setGearColumn=LEGENDARY_SLOT_COLUMN[item.slot]}if(item.rarity==='legendary'&&(legendaryRow!=null||legacyCell)){item.visual.legendaryRow=legacyCell?legacyCell.row:legendaryRow;item.visual.legendaryColumn=legacyCell?legacyCell.column:LEGENDARY_SLOT_COLUMN[item.slot]}}
  const LOOT_BY_RARITY=Object.keys(LOOT_RARITIES).reduce((groups,rarity)=>{groups[rarity]=LOOT_ITEMS.filter(item=>item.rarity===rarity);return groups},{}),LOOT_BY_ID=Object.fromEntries(LOOT_ITEMS.map(item=>[item.id,item])),RELIC_POWER_CAP=4;
  const SYNERGIES=[
    {id:'shrapnel',name:'GRAND SLAM',needs:['burst','volatile'],desc:'Every third strike detonates on impact.'},
    {id:'pursuit',name:'RELENTLESS PURSUIT',needs:['mark','overdrive'],desc:'Defeating an elite instantly recharges Dash.'},
    {id:'kinetic',name:'SHOULDER CHARGE',needs:['plating','overdrive'],desc:'Dashing becomes a shielded ramming attack.'},
    {id:'counter',name:'COUNTERSTRIKE',needs:['burst','plating'],desc:'Blocking a hit slams out a defensive pressure wave.'},
    {id:'finisher',name:'FINAL VERDICT',needs:['mark','volatile'],desc:'Wounded bosses take another 20% hammer damage.'}
  ];
  const keys={},stick={active:false,id:null,x:0,y:0},audio={ctx:null,timer:null,mode:'base',step:0};let spinHeld=false;
  let gearUidCounter=0,gearTurnAngle=0,gearTurnDrag=null;
  let save=loadSave(),mode='base',paused=false,settingsWasRun=false,abandonArmed=false,devResetArmed=false;
  let W=960,H=540,dpr=1,miniW=132,miniH=92,miniDpr=1,last=0,elapsed=0,runTime=0,spawnClock=0,hazardClock=0,shake=0,flash=0,depthPulse=0,extracting=0,runScrap=0,depth=1,riskTier=0,routeDecision=false,route=null,zoneEventTriggered=false,hitStop=0;
  let player,enemies=[],pendingStrikes=[],enemyBullets=[],lootDrops=[],particles=[],effects=[],hazards=[],decor=[],obstacles=[],collisionMap=[],caches=[],cargo=[],lootBag={},guildTerrain=null,currentMapSeed=0,guildSpawnCursor=0;
  let waveDirector={number:0,phase:'idle',timer:0,spawnClock:0,queue:[],anchors:[],packId:0,kills:0,startCount:0,targetPopulation:0,clearRewarded:false};
  const BOSS_LOOT_ORB_ARRIVAL=1.05,BOSS_LOOT_ORB_OPEN=.68;
  let moduleDecision=false,moduleStage='offer',moduleOffer=[],pendingModule=null,activeCache=null,pendingWardenReward=null,bossActive=false,bossDefeated=false,bossEntity=null,bossLootChest=null,runStats=null,expeditionCycle=0,bossRunClears=0,postBossDecision=false,postBossIntent=null,bossLootRewards=[],bossLootSelected=0,bossLootResolved=[],bossLootPhase='idle',bossExtraction=false,runGearEquipBackups={},gearView='unified',gearFilter='all',gearRarityFilter='all',gearSort='power',selectedGearUid=null,hoverGearUid=null,sellFilterArmedKey='',sellFilterArmedUntil=0,vaultRewards=[],vaultOpening=false;
  let paperDollAtlases={idle:null,run:null,attack:null},paperDollKey='';
  let gearDragState=null,gearPointerType='mouse',gearTapUid=null,suppressGearClickUntil=0,gearMobileSheetMode=null;
  const paperDollPreviewCache=new Map();
  const gearItemNodes=new Map(),gearPerf={fullRenders:0,gridRenders:0,slotRenders:0,incrementalRenders:0};
  const particlePool=[];

  function clampNumber(value,min,max){value=Number(value);return Number.isFinite(value)?Math.max(min,Math.min(max,value)):min}
  function mobileArmory(){return typeof window.matchMedia==='function'&&window.matchMedia('(max-width:760px), (pointer:coarse)').matches}
  function defaultBlueprint(){return {copies:0,rare:0,tune:0}}
  function nextGearUid(prefix){gearUidCounter++;return (prefix||'gear')+'-'+Date.now().toString(36)+'-'+gearUidCounter.toString(36)+'-'+Math.floor(Math.random()*1679616).toString(36)}
  function roundGearStat(key,value){if(['speed','fire','armor','loot','dash','crit'].includes(key))return Math.round(value*1000)/1000;if(key==='damage')return Math.round(value*10)/10;return Math.max(1,Math.round(value))}
  function createGearInstance(def,level,quality,stats,uid,value){level=Math.max(1,Math.floor(level||1));quality=Math.max(.75,Math.min(1.35,Number(quality)||1));let rolled={};for(const key of Object.keys(stats||def.stats||{}))rolled[key]=roundGearStat(key,Number((stats||def.stats)[key])||0);return {uid:uid||nextGearUid(def.id),itemId:def.id,level,quality:Math.round(quality*1000)/1000,stats:rolled,value:Math.max(1,Math.round(value||def.value*(1+(level-1)*.075)*quality))}}
  function rollGearInstance(def,level,forcedQuality){let quality=forcedQuality==null?.86+Math.random()*.3:forcedQuality,scale=(1+(Math.max(1,level)-1)*.055)*quality,stats={};for(const key of Object.keys(def.stats||{}))stats[key]=roundGearStat(key,def.stats[key]*scale*(.94+Math.random()*.12));return createGearInstance(def,level,quality,stats)}
  function sanitizeGearInstance(raw){if(!raw||typeof raw!=='object')return null;let def=LOOT_BY_ID[raw.itemId||raw.id];if(!def)return null;let stats=raw.stats&&typeof raw.stats==='object'?raw.stats:def.stats,storedValue=Number(raw.value);return createGearInstance(def,clampNumber(raw.level,1,999),clampNumber(raw.quality,.75,1.35),stats,String(raw.uid||nextGearUid('saved')),Number.isFinite(storedValue)?clampNumber(storedValue,1,1e12):undefined)}
  function levelXpNeeded(level){return 2+Math.floor(Math.max(1,level)*.65)}
  function defaultSave(){return {version:SAVE_VERSION,scrap:0,materials:0,legendaryCores:0,best:0,bestRisk:0,cores:0,level:1,xp:0,selectedMap:'guild',contractComplete:false,contractSeen:false,vaultCycle:0,chassis:0,weapon:0,salvage:0,starter:null,seenIntro:false,blueprints:{},schematics:{aegis:0,thrusters:0,recycler:0,thermal:0},lootFound:{},gear:[],equipped:{hat:null,scarf:null,coat:null,hammer:null,boots:null},stats:{runs:0,extractions:0,losses:0,bosses:0,totalScrap:0,totalTime:0,totalKills:0,totalDamage:0,totalRisks:0,itemsRecovered:0,legendaryRecovered:0,vaultsOpened:0},playtest:{runs:[],modulePicks:{}},settings:{sound:true,shake:true,particles:true,hammerstormHelpSeen:false}}}
  function loadSave(){
    let raw={};try{raw=JSON.parse(localStorage.getItem(SAVE_KEY)||'{}')||{}}catch(e){}
    let data=defaultSave(),legacy=Math.max(0,Number(raw.rig)||0);data.scrap=clampNumber(raw.scrap,0,1e15);data.materials=Math.floor(clampNumber(raw.materials,0,1e12));data.legendaryCores=Math.floor(clampNumber(raw.legendaryCores,0,1e9));data.best=Math.floor(clampNumber(raw.best,0,999));data.bestRisk=Math.floor(clampNumber(raw.bestRisk,0,99));data.cores=Math.floor(clampNumber(raw.cores,0,9999));data.contractComplete=!!raw.contractComplete;data.contractSeen=!!raw.contractSeen;data.vaultCycle=Math.floor(clampNumber(raw.vaultCycle,0,9999));data.chassis=Math.floor(clampNumber(raw.chassis==null?legacy:raw.chassis,0,200));data.weapon=Math.floor(clampNumber(raw.weapon==null?legacy:raw.weapon,0,200));data.salvage=Math.floor(clampNumber(raw.salvage,0,200));
    data.seenIntro=!!raw.seenIntro;data.settings=Object.assign(data.settings,raw.settings||{});for(const key of Object.keys(data.settings))data.settings[key]=data.settings[key]!==false;
    data.stats=Object.assign(data.stats,raw.stats||{});for(const key of Object.keys(data.stats))data.stats[key]=Math.floor(clampNumber(data.stats[key],0,1e12));
    let oldPlaytest=raw.playtest&&typeof raw.playtest==='object'?raw.playtest:{};data.playtest.runs=Array.isArray(oldPlaytest.runs)?oldPlaytest.runs.slice(-12).map(run=>({outcome:run&&run.outcome==='secured'?'secured':'lost',depth:Math.floor(clampNumber(run&&run.depth,1,5)),time:Math.floor(clampNumber(run&&run.time,0,3600)),scrap:Math.floor(clampNumber(run&&run.scrap,0,1e9)),kills:Math.floor(clampNumber(run&&run.kills,0,9999)),damage:Math.floor(clampNumber(run&&run.damage,0,1e9)),risks:Math.floor(clampNumber(run&&run.risks,0,9)),items:Math.floor(clampNumber(run&&run.items,0,9999)),legendary:Math.floor(clampNumber(run&&run.legendary,0,999)),map:run&&EXPEDITION_MAPS[run.map]?run.map:'guild',route:run&&(run.route==='furnace'||run.route==='dynamo')?run.route:null,warden:run&&(BOSS_SCHEMATICS[run.warden]||run.warden==='dividend')?run.warden:null})):[];
    for(const id of SCHEMATIC_IDS)data.schematics[id]=Math.floor(clampNumber(raw.schematics&&raw.schematics[id],0,BOSS_SCHEMATICS[id].max));
    for(const id of MODULE_IDS){let legacyId=id==='mark'?'magnet':id,sourceId=raw.blueprints&&raw.blueprints[id]!=null?id:legacyId,old=raw.blueprints&&raw.blueprints[sourceId],record=defaultBlueprint();if(old&&typeof old==='object'){record.copies=Math.floor(clampNumber(old.copies,0,9999));record.rare=Math.floor(clampNumber(old.rare,0,9999));record.tune=Math.floor(clampNumber(old.tune,0,2))}else{record.copies=Math.floor(clampNumber(old,0,9999));record.rare=Math.floor(clampNumber(raw.blueprints&&raw.blueprints[sourceId+'Rare'],0,9999))}data.blueprints[id]=record;data.playtest.modulePicks[id]=Math.floor(clampNumber(oldPlaytest.modulePicks&&(oldPlaytest.modulePicks[id]!=null?oldPlaytest.modulePicks[id]:oldPlaytest.modulePicks[legacyId]),0,1e9))}
    data.level=Math.max(1,Math.floor(clampNumber(raw.level==null?1+Math.floor(data.stats.bosses/2):raw.level,1,999)));data.xp=Math.floor(clampNumber(raw.xp,0,levelXpNeeded(data.level)-1));data.selectedMap=EXPEDITION_MAPS[raw.selectedMap]&&data.level>=EXPEDITION_MAPS[raw.selectedMap].minLevel?raw.selectedMap:'guild';
    for(const item of LOOT_ITEMS)data.lootFound[item.id]=Math.floor(clampNumber(raw.lootFound&&raw.lootFound[item.id],0,999999));
    if(Array.isArray(raw.gear)){let seen=new Set();for(const stored of raw.gear){if(stored&&stored.atRisk)continue;let gear=sanitizeGearInstance(stored);if(!gear)continue;while(seen.has(gear.uid))gear.uid=nextGearUid('duplicate');seen.add(gear.uid);data.gear.push(gear);data.lootFound[gear.itemId]=Math.max(data.lootFound[gear.itemId]||0,1)}}
    else for(const item of LEGACY_LOOT_ITEMS){let found=Math.floor(clampNumber(raw.lootFound&&raw.lootFound[item.id],0,999999)),stored=raw.gearInventory&&raw.gearInventory[item.id],count=Math.floor(clampNumber(stored&&typeof stored==='object'?stored.count:stored,0,999999));if(!raw.gearInventory)count=found;for(let i=0;i<count;i++)data.gear.push(createGearInstance(item,1,1,item.stats,'migrated-'+item.id+'-'+i,item.value));data.lootFound[item.id]=Math.max(found,count)}
    for(const slot of GEAR_SLOTS){let wanted=raw.equipped&&raw.equipped[slot],gear=data.gear.find(entry=>entry.uid===wanted&&LOOT_BY_ID[entry.itemId].slot===slot)||data.gear.find(entry=>entry.itemId===wanted&&LOOT_BY_ID[entry.itemId].slot===slot);if(!gear&&!raw.equipped)gear=data.gear.filter(entry=>LOOT_BY_ID[entry.itemId].slot===slot).sort((a,b)=>LOOT_RARITIES[LOOT_BY_ID[b.itemId].rarity].rank-LOOT_RARITIES[LOOT_BY_ID[a.itemId].rarity].rank||gearScore(b)-gearScore(a))[0];data.equipped[slot]=gear?gear.uid:null}
    let starterId=raw.starter==='magnet'?'mark':raw.starter;data.starter=MODULES[starterId]&&data.blueprints[starterId].copies>0?starterId:null;data.version=SAVE_VERSION;return data;
  }
  function persist(){
    try{
      let snapshot=save;
      if(save.gear.some(gear=>gear.atRisk)){
        snapshot=Object.assign({},save,{gear:save.gear.filter(gear=>!gear.atRisk),equipped:Object.assign({},save.equipped)});
        for(const slot of GEAR_SLOTS){let equipped=save.gear.find(gear=>gear.uid===save.equipped[slot]);if(equipped&&equipped.atRisk)snapshot.equipped[slot]=runGearEquipBackups[slot]||null}
      }
      localStorage.setItem(SAVE_KEY,JSON.stringify(snapshot))
    }catch(e){}
  }

  function gearDefinition(gear){return gear&&LOOT_BY_ID[gear.itemId||gear.id]||null}
  function equippedGear(slot){let uid=save.equipped&&save.equipped[slot],gear=save.gear.find(entry=>entry.uid===uid),def=gearDefinition(gear);return gear&&def&&def.slot===slot?gear:null}
  function equippedItem(slot){return gearDefinition(equippedGear(slot))}
  function paperDollLoadoutKey(){return GEAR_SLOTS.map(slot=>{let gear=equippedGear(slot);return gear?gear.uid+'@'+gear.itemId:'-'}).join('|')}
  function equippedFullSetId(resolveItem){let resolver=resolveItem||equippedItem,items=GEAR_SLOTS.map(resolver);if(items.some(item=>!item||!item.setId))return null;let setId=items[0].setId;return items.every(item=>item.setId===setId)?setId:null}
  function paperDollAssetsReady(){return PAPER_DOLL_POSES.every(pose=>imageReady(pappaHammerSprites[pose])&&GEAR_SLOTS.every(slot=>imageReady(paperDollMasks[pose][slot])))}
  function paperDollSetReady(setId){let sprites=paperDollSetSprites[setId];return !!sprites&&PAPER_DOLL_POSES.every(pose=>imageReady(sprites[pose]))}
  function paperDollRgb(value){
    let hex=String(value||'#596a84').replace('#','');if(hex.length===3)hex=hex.split('').map(part=>part+part).join('');
    let number=parseInt(hex.slice(0,6),16);return Number.isFinite(number)?[(number>>16)&255,(number>>8)&255,number&255]:[89,106,132]
  }
  function paperDollMix(a,b,amount){
    let from=paperDollRgb(a),to=paperDollRgb(b),t=Math.max(0,Math.min(1,amount)),parts=from.map((value,index)=>Math.round(value+(to[index]-value)*t));
    return '#'+parts.map(value=>value.toString(16).padStart(2,'0')).join('')
  }
  function paperDollRgba(value,alpha){let rgb=paperDollRgb(value);return 'rgba('+rgb[0]+','+rgb[1]+','+rgb[2]+','+alpha+')'}
  function paperDollProfile(item){
    let set=item.setId&&SET_BY_ID[item.setId],base=set&&SET_VISUAL_PROFILES[set.id]||FIELD_VISUAL_PROFILES[(item.visual.style||0)%FIELD_VISUAL_PROFILES.length],rarity=LOOT_RARITIES[item.rarity],primary=base.slotColors&&base.slotColors[item.slot]||set&&set.color||item.visual.color,accent=set?set.accent:item.visual.accent;
    return Object.assign({},base,{id:set?set.id:'field-'+(item.visual.variant||0),primary,accent,light:paperDollMix(primary,accent,.34),shadow:paperDollMix(base.secondary||primary,'#030711',.42),metal:base.metal||accent,mark:set&&set.mark||item.visual.mark,rank:rarity.rank,rarity})
  }
  function paperDollRoundedPath(layer,x,y,w,h,r){
    layer.beginPath();
    if(typeof layer.roundRect==='function')layer.roundRect(x,y,w,h,Math.min(r,w/2,h/2));
    else{let radius=Math.min(r,w/2,h/2);layer.moveTo(x+radius,y);layer.lineTo(x+w-radius,y);layer.quadraticCurveTo(x+w,y,x+w,y+radius);layer.lineTo(x+w,y+h-radius);layer.quadraticCurveTo(x+w,y+h,x+w-radius,y+h);layer.lineTo(x+radius,y+h);layer.quadraticCurveTo(x,y+h,x,y+h-radius);layer.lineTo(x,y+radius);layer.quadraticCurveTo(x,y,x+radius,y)}
  }
  function paperDollPlate(layer,x,y,w,h,r,fill,stroke,lineWidth){
    paperDollRoundedPath(layer,x,y,w,h,r);layer.fillStyle=fill;layer.fill();layer.strokeStyle=stroke;layer.lineWidth=lineWidth||2;layer.stroke()
  }
  function paperDollRivet(layer,x,y,r,color){
    layer.fillStyle='#080b11';layer.beginPath();layer.arc(x+1,y+1,r+1,0,Math.PI*2);layer.fill();layer.fillStyle=color;layer.beginPath();layer.arc(x,y,r,0,Math.PI*2);layer.fill();layer.fillStyle=paperDollMix(color,'#ffffff',.58);layer.beginPath();layer.arc(x-r*.28,y-r*.3,Math.max(1,r*.27),0,Math.PI*2);layer.fill()
  }
  function paperDollGem(layer,x,y,r,profile){
    layer.save();layer.shadowColor=profile.accent;layer.shadowBlur=profile.rank===4?10:5;layer.fillStyle=paperDollMix(profile.accent,'#ffffff',.34);layer.strokeStyle=profile.shadow;layer.lineWidth=2;layer.beginPath();layer.moveTo(x,y-r);layer.lineTo(x+r*.78,y);layer.lineTo(x,y+r);layer.lineTo(x-r*.78,y);layer.closePath();layer.fill();layer.stroke();layer.restore()
  }
  function drawPaperDollMaterial(layer,item,slot,b){
    if(!b)return;let profile=paperDollProfile(item),x=b.x,y=b.y,w=b.w,h=b.h,rank=profile.rank;
    layer.save();
    // Preserve the authored sprite shading and silhouette. Gear only changes the
    // material inside its mask; no synthetic seams or outlines are painted over it.
    layer.globalCompositeOperation='source-atop';
    let tint=layer.createLinearGradient(x,y,x+w*.72,y+h);
    tint.addColorStop(0,paperDollMix(profile.primary,'#ffffff',.08));
    tint.addColorStop(.42,profile.primary);
    tint.addColorStop(1,paperDollMix(profile.primary,profile.shadow,.34));
    layer.globalAlpha=.42+rank*.025;layer.fillStyle=tint;layer.fillRect(x-2,y-2,w+4,h+4);
    let depth=layer.createRadialGradient(x+w*.31,y+h*.2,2,x+w*.55,y+h*.56,Math.max(w,h)*.78);
    depth.addColorStop(0,'rgba(255,255,255,.2)');
    depth.addColorStop(.45,'rgba(255,255,255,0)');
    depth.addColorStop(1,'rgba(0,0,0,.34)');
    layer.globalCompositeOperation='overlay';layer.globalAlpha=.34;layer.fillStyle=depth;layer.fillRect(x-3,y-3,w+6,h+6);
    if(rank>=2){
      let finish=layer.createRadialGradient(x+w*.5,y+h*.42,1,x+w*.5,y+h*.42,Math.max(8,Math.min(w,h)*.55));
      finish.addColorStop(0,paperDollRgba(profile.accent,rank===4?.24:.12));
      finish.addColorStop(1,paperDollRgba(profile.accent,0));
      layer.globalCompositeOperation='screen';layer.globalAlpha=1;layer.fillStyle=finish;layer.fillRect(x,y,w,h)
    }
    layer.restore()
  }
  const PAPER_DOLL_RENDER_LAYERS=[
    {slot:'coat',region:'chest-gloves'},
    {slot:'scarf',region:'neck'},
    {slot:'boots',region:'boots'},
    {slot:'hat',region:'hat'},
    {slot:'hammer',region:'hammer'}
  ];
  function cleanPaperDollMask(maskLayer){
    let image=maskLayer.getImageData(0,0,PAPER_DOLL_CELL,PAPER_DOLL_CELL),pixels=image.data,alpha=new Uint8ClampedArray(PAPER_DOLL_CELL*PAPER_DOLL_CELL);
    for(let pixel=0;pixel<alpha.length;pixel++)alpha[pixel]=pixels[pixel*4+3];
    for(let y=0;y<PAPER_DOLL_CELL;y++)for(let x=0;x<PAPER_DOLL_CELL;x++){
      let pixel=y*PAPER_DOLL_CELL+x,value=alpha[pixel],neighbors=0;
      if(x>0&&alpha[pixel-1]>18)neighbors++;
      if(x<PAPER_DOLL_CELL-1&&alpha[pixel+1]>18)neighbors++;
      if(y>0&&alpha[pixel-PAPER_DOLL_CELL]>18)neighbors++;
      if(y<PAPER_DOLL_CELL-1&&alpha[pixel+PAPER_DOLL_CELL]>18)neighbors++;
      pixels[pixel*4+3]=value<=14||value<88&&neighbors<2?0:Math.min(255,Math.round((value-12)*255/243))
    }
    maskLayer.putImageData(image,0,0)
  }
  function paperDollMaskBounds(maskLayer){
    let pixels=maskLayer.getImageData(0,0,PAPER_DOLL_CELL,PAPER_DOLL_CELL).data,minX=PAPER_DOLL_CELL,minY=PAPER_DOLL_CELL,maxX=-1,maxY=-1;
    for(let y=0;y<PAPER_DOLL_CELL;y+=2)for(let x=0;x<PAPER_DOLL_CELL;x+=2)if(pixels[(y*PAPER_DOLL_CELL+x)*4+3]>20){if(x<minX)minX=x;if(y<minY)minY=y;if(x>maxX)maxX=x;if(y>maxY)maxY=y}
    return maxX<0?null:{x:minX,y:minY,w:maxX-minX+2,h:maxY-minY+2}
  }
  const paperDollMaskFrameCache=new Map();
  function paperDollMaskFrame(pose,slot,frame){
    let key=pose+':'+slot+':'+frame,cached=paperDollMaskFrameCache.get(key);if(cached)return cached;
    let canvas=document.createElement('canvas'),layer=canvas.getContext('2d'),mx=frame%4*PAPER_DOLL_MASK_CELL,my=Math.floor(frame/4)*PAPER_DOLL_MASK_CELL;canvas.width=canvas.height=PAPER_DOLL_CELL;layer.imageSmoothingEnabled=true;layer.imageSmoothingQuality='high';layer.drawImage(paperDollMasks[pose][slot],mx,my,PAPER_DOLL_MASK_CELL,PAPER_DOLL_MASK_CELL,0,0,PAPER_DOLL_CELL,PAPER_DOLL_CELL);cleanPaperDollMask(layer);cached={canvas,bounds:paperDollMaskBounds(layer)};paperDollMaskFrameCache.set(key,cached);return cached
  }
  function drawPaperDollMark(layer,item,x,y,size){
    let set=item.setId&&SET_BY_ID[item.setId],mark=set&&set.mark||item.visual.mark||'\u2726';layer.save();layer.textAlign='center';layer.textBaseline='middle';layer.font='900 '+Math.max(10,size)+'px Georgia,serif';layer.lineWidth=Math.max(2,size*.16);layer.strokeStyle='#111827';layer.strokeText(mark,x,y);layer.fillStyle=item.visual.accent;layer.fillText(mark,x,y);layer.restore()
  }
  function drawPaperDollGeometry(layer,slot,item,b,pose,frame){
    if(!b)return;let profile=paperDollProfile(item),rank=profile.rank,x=b.x,y=b.y,w=b.w,h=b.h,accent=profile.accent,metal=profile.metal,dark=profile.shadow,translucent=paperDollRgba(paperDollMix(profile.primary,profile.light,.2),.68);
    layer.save();layer.lineJoin='round';layer.lineCap='round';layer.shadowColor=rank===4?accent:'transparent';layer.shadowBlur=rank===4?4:0;
    if(slot==='hat'){
      layer.strokeStyle=dark;layer.lineWidth=6;layer.beginPath();layer.moveTo(x+w*.18,y+h*.59);layer.quadraticCurveTo(x+w*.5,y+h*.67,x+w*.82,y+h*.58);layer.stroke();layer.strokeStyle=metal;layer.lineWidth=2.5;layer.stroke();
      if(['helm','battlement','vault'].includes(profile.hat)){
        layer.strokeStyle=metal;layer.lineWidth=3;layer.beginPath();layer.arc(x+w*.5,y+h*.35,w*.21,Math.PI,Math.PI*2);layer.stroke();
        if(profile.hat==='battlement')for(let i=0;i<3;i++)paperDollPlate(layer,x+w*(.38+i*.1),y+h*.12,w*.07,h*.14,2,translucent,dark,2)
      }else if(['crown','brokenCrown'].includes(profile.hat)){
        layer.fillStyle=translucent;layer.strokeStyle=metal;layer.lineWidth=2.5;layer.beginPath();layer.moveTo(x+w*.35,y+h*.34);for(let i=0;i<4;i++){let px=x+w*(.38+i*.09),py=y+h*(i%2?.08:.22);if(profile.hat==='brokenCrown'&&i===2)py=y+h*.27;layer.lineTo(px,py)}layer.lineTo(x+w*.68,y+h*.35);layer.closePath();layer.fill();layer.stroke()
      }else if(profile.hat==='reaver'){
        layer.fillStyle=translucent;layer.strokeStyle=metal;layer.lineWidth=3;for(const side of [-1,1]){let cx=x+w*(side<0?.31:.69);layer.beginPath();layer.moveTo(cx,y+h*.29);layer.lineTo(cx+side*w*.09,y+h*.02);layer.lineTo(cx+side*w*.13,y+h*.32);layer.closePath();layer.fill();layer.stroke()}
      }else if(['plume','oath'].includes(profile.hat)){
        layer.fillStyle=paperDollRgba(accent,.78);layer.strokeStyle=dark;layer.lineWidth=2.5;layer.beginPath();layer.moveTo(x+w*.42,y+h*.3);layer.quadraticCurveTo(x+w*.25,y-h*.04,x+w*.12,y+h*.18);layer.quadraticCurveTo(x+w*.28,y+h*.15,x+w*.45,y+h*.42);layer.closePath();layer.fill();layer.stroke()
      }else if(['crescent','fate'].includes(profile.hat)){
        layer.strokeStyle=metal;layer.lineWidth=4;layer.beginPath();layer.arc(x+w*.52,y+h*.25,w*.13,Math.PI*.7,Math.PI*1.94);layer.stroke();
        if(profile.hat==='fate'){layer.strokeStyle=accent;layer.lineWidth=1.8;layer.beginPath();layer.ellipse(x+w*.52,y+h*.28,w*.23,h*.17,-.15,0,Math.PI*2);layer.stroke()}
      }else if(profile.hat==='goggles'){
        for(const gx of [x+w*.43,x+w*.59]){layer.fillStyle=paperDollRgba(paperDollMix(profile.primary,'#bdefff',.62),.72);layer.strokeStyle=metal;layer.lineWidth=2.4;layer.beginPath();layer.arc(gx,y+h*.38,w*.065,0,Math.PI*2);layer.fill();layer.stroke()}
      }else if(['fins','star','lantern'].includes(profile.hat)){
        paperDollGem(layer,x+w*.5,y+h*.25,5+rank*.55,profile);layer.strokeStyle=metal;layer.lineWidth=2.5;layer.beginPath();layer.moveTo(x+w*.5,y+h*.06);layer.lineTo(x+w*.5,y+h*.2);layer.stroke()
      }else if(profile.hat==='veil'){
        layer.strokeStyle=paperDollRgba(profile.light,.8);layer.lineWidth=3;layer.beginPath();layer.moveTo(x+w*.3,y+h*.35);layer.quadraticCurveTo(x+w*.16,y+h*.76,x+w*.37,y+h*.68);layer.stroke()
      }
      drawPaperDollMark(layer,item,x+w*.52,y+h*.43,8+rank)
    }else if(slot==='scarf'){
      let claspX=x+w*.35,claspY=y+h*.35;layer.strokeStyle=dark;layer.lineWidth=4;layer.beginPath();layer.moveTo(x+w*.08,y+h*.57);layer.quadraticCurveTo(x+w*.23,y+h*.31,claspX,claspY);layer.stroke();layer.strokeStyle=metal;layer.lineWidth=2;layer.stroke();
      if(['banner','wind'].includes(profile.scarf)){layer.strokeStyle=accent;layer.lineWidth=3;layer.beginPath();layer.moveTo(x+w*.1,y+h*.42);layer.quadraticCurveTo(x+w*.02,y+h*.74,x+w*.17,y+h*.65);layer.stroke()}
      if(['veil','mantle'].includes(profile.scarf)){layer.strokeStyle=paperDollRgba(accent,.78);layer.lineWidth=2.5;layer.beginPath();layer.moveTo(x+w*.13,y+h*.51);layer.quadraticCurveTo(x+w*.06,y+h*.82,x+w*.27,y+h*.72);layer.stroke()}
      if(profile.scarf==='trail'){layer.strokeStyle=metal;layer.lineWidth=2;for(let i=0;i<2;i++){layer.beginPath();layer.moveTo(x+w*.15,y+h*(.36+i*.09));layer.quadraticCurveTo(x+w*.3,y+h*(.3+i*.08),x+w*.45,y+h*(.36+i*.07));layer.stroke()}}
      if(profile.scarf==='guard'){paperDollPlate(layer,x+w*.26,y+h*.25,w*.2,h*.22,4,paperDollRgba(profile.secondary,.82),metal,2);paperDollRivet(layer,x+w*.3,y+h*.31,1.5,metal);paperDollRivet(layer,x+w*.42,y+h*.31,1.5,metal)}
      if(profile.scarf==='purse'){layer.strokeStyle=metal;layer.lineWidth=1.8;layer.beginPath();layer.arc(claspX,claspY,7,0,Math.PI*2);layer.stroke();layer.beginPath();layer.moveTo(claspX+5,claspY+5);layer.quadraticCurveTo(claspX+14,claspY+13,claspX+19,claspY+5);layer.stroke()}
      paperDollGem(layer,claspX,claspY,3.3+rank*.45,profile)
    }else if(slot==='coat'){
      let shoulderY=y+h*.23,leftX=x+w*.2,rightX=x+w*.85,armored=['plate','fortress','forge','reaver','vault','crownless'].includes(profile.coat);
      layer.strokeStyle=metal;layer.lineWidth=armored?4:3;layer.beginPath();layer.moveTo(leftX-w*.08,shoulderY+h*.02);layer.quadraticCurveTo(leftX,shoulderY-h*.055,leftX+w*.09,shoulderY+h*.02);layer.moveTo(rightX-w*.08,shoulderY+h*.02);layer.quadraticCurveTo(rightX,shoulderY-h*.055,rightX+w*.07,shoulderY+h*.025);layer.stroke();
      if(armored){paperDollRivet(layer,leftX,shoulderY,2.1,metal);paperDollRivet(layer,rightX,shoulderY,2.1,metal)}
      if(['reaver','forge'].includes(profile.coat)){layer.fillStyle=metal;layer.strokeStyle=dark;layer.lineWidth=2;for(const [sx,side] of [[leftX,-1],[rightX,1]]){layer.beginPath();layer.moveTo(sx-side*w*.02,shoulderY);layer.lineTo(sx+side*w*.06,shoulderY-h*.09);layer.lineTo(sx+side*w*.075,shoulderY+h*.015);layer.closePath();layer.fill();layer.stroke()}}
      if(['royal','crownless','vault'].includes(profile.coat)){layer.strokeStyle=metal;layer.lineWidth=2.5;layer.beginPath();layer.moveTo(leftX+w*.02,shoulderY+h*.04);layer.quadraticCurveTo(x+w*.5,y+h*.41,rightX-w*.03,shoulderY+h*.04);layer.stroke()}
      if(['phantom','fate','lunar'].includes(profile.coat)){layer.strokeStyle=paperDollRgba(accent,.82);layer.lineWidth=2.4;layer.beginPath();layer.arc(x+w*.49,y+h*.45,w*.13,Math.PI*.78,Math.PI*1.9);layer.stroke()}
      if(['ranger','wayfarer','voyager'].includes(profile.coat)){layer.strokeStyle=metal;layer.lineWidth=1.6;for(const px of [x+w*.22,x+w*.72]){paperDollRivet(layer,px,y+h*.5,1.7,metal);layer.beginPath();layer.moveTo(px-w*.035,y+h*.56);layer.lineTo(px+w*.035,y+h*.56);layer.stroke()}}
      if(['scout','runner'].includes(profile.coat)){layer.fillStyle=paperDollRgba(accent,.72);for(const side of [-1,1]){let sx=x+w*(side<0?.24:.75);layer.beginPath();layer.moveTo(sx,shoulderY+h*.02);layer.lineTo(sx+side*w*.08,shoulderY+h*.08);layer.lineTo(sx+side*w*.015,shoulderY+h*.11);layer.closePath();layer.fill()}}
      if(['oath','tabard'].includes(profile.coat)){layer.strokeStyle=accent;layer.lineWidth=2.4;layer.beginPath();layer.moveTo(x+w*.4,y+h*.3);layer.lineTo(x+w*.5,y+h*.58);layer.lineTo(x+w*.6,y+h*.3);layer.stroke()}
      if(profile.coat==='lantern'){paperDollGem(layer,x+w*.49,y+h*.44,5.2,profile);layer.strokeStyle=metal;layer.lineWidth=1.8;layer.beginPath();layer.arc(x+w*.49,y+h*.44,9,0,Math.PI*2);layer.stroke()}
      drawPaperDollMark(layer,item,x+w*.49,y+h*.47,9+rank)
    }else if(slot==='hammer'){
      let px=x+w*.13,py=y+h*.13,pw=w*.74,ph=h*.72;layer.strokeStyle=dark;layer.lineWidth=5;paperDollRoundedPath(layer,px,py,pw,ph,Math.min(11,ph*.17));layer.stroke();layer.strokeStyle=metal;layer.lineWidth=2.8;paperDollRoundedPath(layer,px+w*.055,py+h*.055,pw-w*.11,ph-h*.11,Math.min(8,ph*.13));layer.stroke();
      for(const [rx,ry] of [[px+pw*.1,py+ph*.15],[px+pw*.9,py+ph*.15],[px+pw*.1,py+ph*.85],[px+pw*.9,py+ph*.85]])paperDollRivet(layer,rx,ry,1.9,metal);
      if(['moon','moonblade','phantom'].includes(profile.hammer)){layer.strokeStyle=accent;layer.lineWidth=4;layer.beginPath();layer.arc(px+pw*.52,py+ph*.5,ph*.22,Math.PI*.56,Math.PI*1.52);layer.stroke()}
      if(['coin','turbine','starforge','compass'].includes(profile.hammer)){layer.strokeStyle=metal;layer.lineWidth=2.4;let cx=px+pw*.52,cy=py+ph*.5;layer.beginPath();layer.arc(cx,cy,ph*.22,0,Math.PI*2);layer.stroke();for(let i=0;i<4;i++){let a=i*Math.PI/2;layer.beginPath();layer.moveTo(cx+Math.cos(a)*ph*.07,cy+Math.sin(a)*ph*.07);layer.lineTo(cx+Math.cos(a)*ph*.21,cy+Math.sin(a)*ph*.21);layer.stroke()}}
      if(['reaver','crown','fate'].includes(profile.hammer)){layer.fillStyle=metal;layer.strokeStyle=dark;layer.lineWidth=1.8;for(let i=0;i<3;i++){let sx=px+pw*(.24+i*.25);layer.beginPath();layer.moveTo(sx,py);layer.lineTo(sx+pw*.045,py-ph*.1);layer.lineTo(sx+pw*.085,py);layer.closePath();layer.fill();layer.stroke()}}
      if(profile.hammer==='fate'){layer.strokeStyle=accent;layer.lineWidth=2.5;layer.beginPath();layer.ellipse(px+pw*.5,py+ph*.5,pw*.31,ph*.36,-.18,0,Math.PI*2);layer.stroke()}
      if(profile.hammer==='anvil'){layer.fillStyle=paperDollRgba(metal,.38);layer.fillRect(px+pw*.08,py+ph*.18,pw*.84,ph*.2);layer.fillRect(px+pw*.15,py+ph*.62,pw*.7,ph*.18)}
      if(['banner','oath'].includes(profile.hammer)){layer.strokeStyle=accent;layer.lineWidth=2.4;layer.beginPath();layer.moveTo(px+pw*.5,py+ph*.14);layer.lineTo(px+pw*.5,py+ph*.86);layer.moveTo(px+pw*.33,py+ph*.27);layer.lineTo(px+pw*.67,py+ph*.27);layer.stroke()}
      if(['tower','vault'].includes(profile.hammer)){paperDollPlate(layer,px+pw*.31,py+ph*.25,pw*.38,ph*.5,5,paperDollRgba(profile.secondary,.76),metal,2);paperDollRivet(layer,px+pw*.38,py+ph*.34,1.5,metal);paperDollRivet(layer,px+pw*.62,py+ph*.66,1.5,metal)}
      if(profile.hammer==='lantern'){paperDollGem(layer,px+pw*.51,py+ph*.5,7,profile);layer.strokeStyle=metal;layer.lineWidth=2;layer.beginPath();layer.arc(px+pw*.51,py+ph*.5,11,0,Math.PI*2);layer.stroke()}
      drawPaperDollMark(layer,item,px+pw*.52,py+ph*.5,10+rank)
    }else if(slot==='boots'){
      for(const bx of [x+w*.18,x+w*.79]){
        let bootW=w*.16,baseY=y+h*.72;layer.strokeStyle=dark;layer.lineWidth=4;layer.beginPath();layer.moveTo(bx-bootW*.55,baseY);layer.quadraticCurveTo(bx,baseY+h*.1,bx+bootW*.62,baseY-h*.01);layer.stroke();layer.strokeStyle=metal;layer.lineWidth=2.5;layer.stroke();
        if(['plate','vault','reaver'].includes(profile.boots))paperDollRivet(layer,bx,baseY-h*.035,2.1,metal)
      }
      if(['trail','guard','forge','royal'].includes(profile.boots)){layer.strokeStyle=metal;layer.lineWidth=2;for(const bx of [x+w*.18,x+w*.79]){layer.beginPath();layer.moveTo(bx-w*.045,y+h*.58);layer.lineTo(bx+w*.04,y+h*.58);layer.moveTo(bx-w*.035,y+h*.63);layer.lineTo(bx+w*.05,y+h*.63);layer.stroke()}}
      if(['swift','phantom','fate'].includes(profile.boots)){layer.strokeStyle=accent;layer.lineWidth=2.5;for(const bx of [x+w*.18,x+w*.79]){layer.beginPath();layer.moveTo(bx-w*.02,y+h*.67);layer.lineTo(bx-w*.07,y+h*.56);layer.moveTo(bx+w*.005,y+h*.68);layer.lineTo(bx-w*.045,y+h*.61);layer.stroke()}}
      if(profile.boots==='reaver'){layer.fillStyle=metal;for(const bx of [x+w*.18,x+w*.79]){layer.beginPath();layer.moveTo(bx+w*.055,y+h*.7);layer.lineTo(bx+w*.1,y+h*.65);layer.lineTo(bx+w*.08,y+h*.75);layer.closePath();layer.fill()}}
    }
    layer.restore()
  }
  function composePaperDollPose(pose,resolveItem){
    let resolver=resolveItem||equippedItem;
    let source=pappaHammerSprites[pose],out=document.createElement('canvas'),scratch=document.createElement('canvas');out.width=PAPER_DOLL_CELL*4;out.height=PAPER_DOLL_CELL*2;scratch.width=scratch.height=PAPER_DOLL_CELL;let outCtx=out.getContext('2d'),layer=scratch.getContext('2d');if(!outCtx||!layer)return source;outCtx.imageSmoothingEnabled=layer.imageSmoothingEnabled=true;outCtx.imageSmoothingQuality=layer.imageSmoothingQuality='high';
    for(let frame=0;frame<8;frame++){let sx=frame%4*512,sy=Math.floor(frame/4)*512,dx=frame%4*PAPER_DOLL_CELL,dy=Math.floor(frame/4)*PAPER_DOLL_CELL;outCtx.drawImage(source,sx,sy,512,512,dx,dy,PAPER_DOLL_CELL,PAPER_DOLL_CELL);for(const renderLayer of PAPER_DOLL_RENDER_LAYERS){let slot=renderLayer.slot,item=resolver(slot);if(!item)continue;let mask=paperDollMaskFrame(pose,slot,frame);layer.clearRect(0,0,PAPER_DOLL_CELL,PAPER_DOLL_CELL);layer.globalCompositeOperation='source-over';layer.globalAlpha=1;layer.drawImage(source,sx,sy,512,512,0,0,PAPER_DOLL_CELL,PAPER_DOLL_CELL);layer.globalCompositeOperation='destination-in';layer.drawImage(mask.canvas,0,0);layer.globalCompositeOperation='source-over';drawPaperDollMaterial(layer,item,slot,mask.bounds);outCtx.drawImage(scratch,dx,dy)}}return out
  }
  function refreshPaperDoll(){
    let fullSetId=equippedFullSetId(),setReady=paperDollSetReady(fullSetId),key=(setReady?'skin:'+fullSetId+':':'paper:')+paperDollLoadoutKey();if(key===paperDollKey&&paperDollAtlases.idle)return;if(!setReady&&!paperDollAssetsReady())return;let next={};for(const pose of PAPER_DOLL_POSES)next[pose]=setReady?paperDollSetSprites[fullSetId][pose]:composePaperDollPose(pose);paperDollAtlases=next;paperDollKey=key;let preview=next.idle&&typeof next.idle.toDataURL==='function'?'url("'+next.idle.toDataURL('image/png')+'")':'url("'+next.idle.src+'")';ui.pappaHammerBaseSprite.style.backgroundImage=preview;ui.gearCharacterHero.style.backgroundImage=preview
  }
  function paperDollPreviewImage(gear){
    let item=gearDefinition(gear);if(!item)return '';
    let cacheKey=paperDollLoadoutKey()+'>'+gear.uid,cached=paperDollPreviewCache.get(cacheKey);
    if(!cached){
      try{let resolver=slot=>slot===item.slot?item:equippedItem(slot),fullSetId=equippedFullSetId(resolver),source=paperDollSetReady(fullSetId)?paperDollSetSprites[fullSetId].idle:composePaperDollPose('idle',resolver);cached=typeof source.toDataURL==='function'?'url("'+source.toDataURL('image/png')+'")':'url("'+source.src+'")'}catch(error){cached=''}
      if(cached)paperDollPreviewCache.set(cacheKey,cached);
      if(paperDollPreviewCache.size>24)paperDollPreviewCache.delete(paperDollPreviewCache.keys().next().value)
    }
    return cached
  }
  function paperDollPreview(gear){
    let item=gearDefinition(gear);if(!item||!ui.gearCharacterHero)return;let cached=paperDollPreviewImage(gear);if(!cached)return;
    let rarity=LOOT_RARITIES[item.rarity];ui.gearCharacterHero.style.backgroundImage=cached;ui.gearCharacterStage.style.setProperty('--preview-color',rarity.color);ui.gearCharacterStage.classList.add('gearPreviewing')
  }
  function restorePaperDollPreview(){
    if(!ui.gearCharacterHero)return;let atlas=paperDollAtlases.idle;if(atlas){let image=typeof atlas.toDataURL==='function'?'url("'+atlas.toDataURL('image/png')+'")':'url("'+atlas.src+'")';ui.gearCharacterHero.style.backgroundImage=image}ui.gearCharacterStage.classList.remove('gearPreviewing')
  }
  function paperDollAtlasReport(pose,includePreview){
    let atlas=paperDollAtlases[pose];if(!imageReady(atlas))return null;let width=atlas.naturalWidth||atlas.width,height=atlas.naturalHeight||atlas.height,probe=document.createElement('canvas'),probeCtx=probe.getContext('2d');probe.width=128;probe.height=64;probeCtx.drawImage(atlas,0,0,width,height,0,0,probe.width,probe.height);let pixels=probeCtx.getImageData(0,0,probe.width,probe.height).data,hash=2166136261,opaque=0;
    for(let index=0;index<pixels.length;index+=4){let alpha=pixels[index+3];if(alpha>18)opaque++;hash^=pixels[index];hash=Math.imul(hash,16777619);hash^=pixels[index+1];hash=Math.imul(hash,16777619);hash^=pixels[index+2];hash=Math.imul(hash,16777619);hash^=alpha;hash=Math.imul(hash,16777619)}
    let frames=[];for(let frame=0;frame<8;frame++){let frameProbe=document.createElement('canvas'),frameCtx=frameProbe.getContext('2d'),sx=frame%4*width/4,sy=Math.floor(frame/4)*height/2;frameProbe.width=frameProbe.height=128;frameCtx.drawImage(atlas,sx,sy,width/4,height/2,0,0,128,128);let framePixels=frameCtx.getImageData(0,0,128,128).data,minX=128,minY=128,maxX=-1,maxY=-1,edgeOpaque=0,frameHash=2166136261;for(let y=0;y<128;y++)for(let x=0;x<128;x++){let index=(y*128+x)*4,alpha=framePixels[index+3];if(alpha>18){minX=Math.min(minX,x);minY=Math.min(minY,y);maxX=Math.max(maxX,x);maxY=Math.max(maxY,y);if(x===0||x===127||y===0||y===127)edgeOpaque++}frameHash^=framePixels[index];frameHash=Math.imul(frameHash,16777619);frameHash^=framePixels[index+1];frameHash=Math.imul(frameHash,16777619);frameHash^=framePixels[index+2];frameHash=Math.imul(frameHash,16777619);frameHash^=alpha;frameHash=Math.imul(frameHash,16777619)}frames.push({frame,hash:(frameHash>>>0).toString(16).padStart(8,'0'),edgeOpaque,bounds:maxX<0?null:{x:minX,y:minY,w:maxX-minX+1,h:maxY-minY+1}})}
    let report={pose,width,height,hash:(hash>>>0).toString(16).padStart(8,'0'),opaque,corners:[pixels[3],pixels[(probe.width-1)*4+3],pixels[((probe.height-1)*probe.width)*4+3],pixels[(probe.width*probe.height-1)*4+3]],frames};
    if(includePreview){let preview=document.createElement('canvas'),previewCtx=preview.getContext('2d');preview.width=preview.height=512;previewCtx.drawImage(atlas,0,0,width/4,height/2,0,0,512,512);report.preview=preview.toDataURL('image/png')}
    return report
  }
  function equippedSetCounts(){let counts={};for(const slot of GEAR_SLOTS){let def=equippedItem(slot);if(def&&def.setId)counts[def.setId]=(counts[def.setId]||0)+1}return counts}
  function equippedRarityProfile(){let gear=GEAR_SLOTS.map(equippedGear).filter(Boolean).sort((a,b)=>LOOT_RARITIES[gearDefinition(b).rarity].rank-LOOT_RARITIES[gearDefinition(a).rarity].rank||gearScore(b)-gearScore(a))[0],item=gearDefinition(gear),rarity=item&&LOOT_RARITIES[item.rarity],setId=equippedFullSetId(),set=setId&&SET_BY_ID[setId];return rarity?{rank:rarity.rank,color:set?set.accent:rarity.color,glow:set?paperDollMix(set.accent,'#ffffff',.16):rarity.glow,name:rarity.name,setId}:{rank:0,color:'#596a84',glow:'#596a84',name:'FIELD',setId:null}}
  function applyLoadoutRarity(element,profile){if(!element)return;for(let rank=0;rank<=4;rank++)element.classList.remove('loadoutRarity'+rank);element.classList.add('loadoutRarity'+profile.rank);element.style.setProperty('--loadout-color',profile.color);element.style.setProperty('--loadout-glow',profile.glow)}
  function applyLoadoutSetVisual(element,setId){if(!element)return;element.classList.remove('loadoutCompleteSet','loadoutLegendarySet');if(element.removeAttribute)element.removeAttribute('data-set-mark');else if(element.dataset)delete element.dataset.setMark;let set=setId&&SET_BY_ID[setId];if(!set)return;element.classList.add('loadoutCompleteSet');if(set.rarity==='legendary')element.classList.add('loadoutLegendarySet');if(element.dataset)element.dataset.setMark=set.mark;element.style.setProperty('--set-color',set.color);element.style.setProperty('--set-accent',set.accent)}
  function setBonusTiers(set){return set&&set.tiers||[2,3,5]}
  function setSignaturePieces(set){return set&&set.signaturePieces||3}
  function activeSetBonuses(){let counts=equippedSetCounts(),active=[];for(const set of SET_DEFINITIONS){let count=counts[set.id]||0;for(const tier of setBonusTiers(set))if(count>=tier&&set.bonus[tier])active.push({set,count,tier,stats:set.bonus[tier]})}return active}
  function gearSignatureTier(setId,counts){let set=SET_BY_ID[setId],count=(counts||equippedSetCounts())[setId]||0,awakens=setSignaturePieces(set);return count>=5?2:count>=awakens?1:0}
  function gearSignatureProfileFromCounts(counts){
    let profile={};for(const set of SET_DEFINITIONS)profile[set.id]=gearSignatureTier(set.id,counts);
    profile.critEcho=profile.crimsonOath;profile.bulwark=profile.towerBulwark;profile.stormDash=profile.stormrunner;profile.hammerWave=profile.hammerChoir;profile.gravityWell=profile.blackHole;
    return profile
  }
  function gearSignatureProfile(){return gearSignatureProfileFromCounts(equippedSetCounts())}
  function gearSignatureMarkup(set,count){
    let signature=set&&GEAR_SIGNATURES[set.id];if(!signature)return '';
    let awakens=setSignaturePieces(set),tier=count>=5?2:count>=awakens?1:0,next=tier===2?'MASTERED':tier===1?'5 PIECES TO MASTER':awakens+' PIECES TO AWAKEN',effect=tier===2?signature.mastery:signature.unlock;
    return '<section class="gearSignature '+(tier?'active':'locked')+'" style="--signature-color:'+signature.color+'"><header><small>'+signature.role+' SIGNATURE</small><b>'+signature.name+'</b><em>'+next+'</em></header><p>'+effect+'</p></section>'
  }
  function setBonusStats(){let total={};for(const bonus of activeSetBonuses())for(const key of Object.keys(bonus.stats))total[key]=(total[key]||0)+bonus.stats[key];return total}
  function gearStats(){let total={hp:0,damage:0,magnet:0,speed:0,fire:0,armor:0,loot:0,dash:0,crit:0};for(const slot of GEAR_SLOTS){let gear=equippedGear(slot);if(!gear)continue;for(const key of Object.keys(gear.stats||{}))total[key]=(total[key]||0)+gear.stats[key]}let bonuses=setBonusStats();for(const key of Object.keys(bonuses))total[key]=(total[key]||0)+bonuses[key];total.armor=Math.min(.45,total.armor);total.crit=Math.min(.5,total.crit);total.fire=Math.min(.45,total.fire);total.speed=Math.min(.4,total.speed);total.dash=Math.min(.45,total.dash);return total}
  function gearScore(gear){if(!gear)return 0;let def=gearDefinition(gear),s=gear.stats||(def&&def.stats)||{};return (s.hp||0)*.18+(s.damage||0)*2+(s.magnet||0)*.08+(s.speed||0)*45+(s.fire||0)*42+(s.armor||0)*60+(s.loot||0)*35+(s.dash||0)*32+(s.crit||0)*50}
  function maxHp(){return Math.round(100+(save.level-1)*3+save.chassis*14+gearStats().hp)}
  function shotDamage(){return Math.round((8+(save.level-1)*.3+save.weapon*1.45+gearStats().damage)*10)/10}
  function magnetRange(){return Math.round(85+save.salvage*10+gearStats().magnet)}
  function schematicLevel(id){return Math.floor(clampNumber(save.schematics&&save.schematics[id],0,BOSS_SCHEMATICS[id].max))}
  function baseShields(){return schematicLevel('aegis')}
  function thermalBlast(level){return {charges:level>=3?2:level?1:0,damage:level?1+Math.max(0,level-1)*.25:1}}
  function schematicEffect(id,level){level=level==null?schematicLevel(id):level;if(id==='aegis')return '+'+level+' START SHIELD'+(level===1?'':'S');if(id==='thrusters')return '-'+level*6+'% DASH RECHARGE';if(id==='thermal')return level>=3?'DASH CHARGES 2 BLASTS  \u00B7  +50% DAMAGE':level===2?'DASH BLAST  \u00B7  +25% DAMAGE':'DASH CHARGES 1 BLAST';return '+'+level*5+'% LOOT VALUE'}
  function activeMap(){let id=save.selectedMap,map=EXPEDITION_MAPS[id];return map&&save.level>=map.minLevel?map:EXPEDITION_MAPS.guild}
  function routeConfig(){return route?ROUTES[route]:null}
  function expeditionFloor(){return expeditionCycle*5+depth}
  function cyclePacing(){return expeditionCycle?Math.max(.24,.4-expeditionCycle*.05):1}
  function zoneAt(level){let map=activeMap();if(map.zones)return map.zones[Math.max(0,Math.min(4,level-1))];if(level<=2)return COMMON_ZONES[Math.max(0,level-1)];let config=routeConfig()||ROUTES.dynamo;return config.zones[Math.max(0,Math.min(2,level-3))]}
  function currentBoss(){let map=activeMap();if(map.boss)return BOSSES[map.boss];let config=routeConfig()||ROUTES.dynamo;return BOSSES[config.boss]}
  function bossRewardOptions(){let ids=currentBoss().kind==='tyrant'?TYRANT_SCHEMATIC_IDS:WARDEN_SCHEMATIC_IDS,choices=ids.filter(id=>schematicLevel(id)<BOSS_SCHEMATICS[id].max);return choices.length?choices:['dividend']}
  function lootMultiplier(nextTier){let salvage=1+Math.min(.6,save.salvage*.035),gear=1+gearStats().loot,recycler=1+schematicLevel('recycler')*.05,routeBonus=routeConfig()?routeConfig().scrap:1,mapBonus=activeMap().coinValue;return (1+(depth-1)*.11)*(1+(nextTier==null?riskTier:nextTier)*.32)*salvage*gear*recycler*routeBonus*mapBonus}
  function gearArtMarkup(gear,size){let item=gearDefinition(gear);if(!item)return '';let visual=item.visual,rarity=LOOT_RARITIES[item.rarity],blackHole=Number.isInteger(visual.blackHoleColumn),legendary=!blackHole&&Number.isInteger(visual.legendaryRow)&&Number.isInteger(visual.legendaryColumn),setSprite=!blackHole&&!legendary&&Number.isInteger(visual.setGearRow)&&Number.isInteger(visual.setGearColumn),set=item.setId&&SET_BY_ID[item.setId],classes=['gearArt',item.slot];if(size)classes.push(size);if(item.setId)classes.push('setItem');if(blackHole)classes.push('blackHoleSprite','legendarySprite','legendary-blackHole');if(setSprite)classes.push('setGearSprite');if(legendary)classes.push('legendarySprite','legendary-'+(item.setId||'legacy'));let columns=blackHole?5:legendary?LEGENDARY_GEAR_COLUMNS:setSprite?SET_GEAR_COLUMNS:GEAR_ATLAS_COLUMNS,rows=blackHole?1:legendary?LEGENDARY_GEAR_ROWS:setSprite?SET_GEAR_ROWS:GEAR_ATLAS_ROWS,column=blackHole?visual.blackHoleColumn:legendary?visual.legendaryColumn:setSprite?visual.setGearColumn:visual.atlasColumn,row=blackHole?0:legendary?visual.legendaryRow:setSprite?visual.setGearRow:visual.atlasRow,x=column/(columns-1)*100,y=rows===1?0:row/(rows-1)*100,mark=String(item.mark||'').replace(/&/g,'&amp;').replace(/"/g,'&quot;');return '<span class="'+classes.join(' ')+'" aria-hidden="true" data-mark="'+mark+'" style="--gear-x:'+x.toFixed(3)+'%;--gear-y:'+y.toFixed(3)+'%;--gear-rarity:'+rarity.color+';--gear-item-color:'+(visual.color||rarity.color)+';--legendary-accent:'+(set?set.accent:rarity.glow)+'"></span>'}
  function formatGearStats(gear){let def=gearDefinition(gear),s=gear&&gear.stats||(def&&def.stats)||{},parts=[];if(s.hp)parts.push('+'+s.hp+' HP');if(s.damage)parts.push('+'+s.damage+' DMG');if(s.magnet)parts.push('+'+s.magnet+' REACH');if(s.speed)parts.push('+'+Math.round(s.speed*100)+'% MOVE');if(s.fire)parts.push('+'+Math.round(s.fire*100)+'% IMPACT');if(s.armor)parts.push('+'+Math.round(s.armor*100)+'% ARMOR');if(s.loot)parts.push('+'+Math.round(s.loot*100)+'% VALUE');if(s.dash)parts.push('-'+Math.round(s.dash*100)+'% DASH');if(s.crit)parts.push('+'+Math.round(s.crit*100)+'% CRIT');return parts}
  function gearQualityLabel(gear){let quality=Math.round((gear&&gear.quality||1)*100);return quality>=116?'PERFECT '+quality+'%':quality>=106?'SUPERIOR '+quality+'%':quality>=96?'SOLID '+quality+'%':'ROUGH '+quality+'%'}
  function bossGearOdds(level,nextRisk,chosenMap,chosenRoute){level=Math.max(1,Math.floor(level||save.level));let tier=nextRisk==null?riskTier:nextRisk,map=chosenMap||activeMap(),path=chosenRoute===undefined?routeConfig():chosenRoute,routeRare=path?path.lootRare:0,mapRare=map.rarityBonus||0,legendary=level>=16?Math.min(.24,.012+(level-16)*.007+tier*.005+routeRare*.2+mapRare*.38):0,mythic=level>=8?Math.min(.48,.08+(level-8)*.014+tier*.01+routeRare*.55+mapRare*.72):0,epic=level>=4?Math.min(.62,.2+(level-4)*.018+tier*.012+routeRare*.45+mapRare):0;epic=Math.min(epic,Math.max(0,.92-legendary-mythic));return {rare:Math.max(.08,1-legendary-mythic-epic),epic,mythic,legendary,high:legendary+mythic+epic}}
  function bossGearRarity(level){let roll=Math.random(),odds=bossGearOdds(level);return roll<odds.legendary?'legendary':roll<odds.legendary+odds.mythic?'mythic':roll<odds.legendary+odds.mythic+odds.epic?'epic':'rare'}
  function rollBossGear(level,forcedRarity){level=Math.max(1,Math.floor(level||save.level));let rarity=forcedRarity||bossGearRarity(level),pool=SET_ITEMS.filter(item=>item.rarity===rarity&&item.minLevel<=level);if(!pool.length){for(const fallback of level>=8?['mythic','epic','rare']:level>=4?['epic','rare']:['rare']){pool=SET_ITEMS.filter(item=>item.rarity===fallback&&item.minLevel<=level);if(pool.length){rarity=fallback;break}}}if(!pool.length)pool=SET_ITEMS.filter(item=>item.rarity==='rare'&&item.minLevel<=level);let def=pool[Math.floor(Math.random()*pool.length)],itemLevel=Math.max(1,level+(Math.random()<.18?1:Math.random()<.28?-1:0)),quality=.84+Math.random()*.3+Math.min(.06,riskTier*.012);return rollGearInstance(def,itemLevel,Math.min(1.35,quality))}
  function lootManifest(){return Object.values(lootBag).sort((a,b)=>{let ad=gearDefinition(a),bd=gearDefinition(b);return LOOT_RARITIES[bd.rarity].rank-LOOT_RARITIES[ad.rarity].rank||b.level-a.level||gearScore(b)-gearScore(a)})}
  function bestLootEntry(){return lootManifest()[0]||null}
  function formatTime(seconds){seconds=Math.max(0,Math.floor(seconds||0));return Math.floor(seconds/60)+':'+String(seconds%60).padStart(2,'0')}
  function depthForElapsed(time){let value=1,pace=cyclePacing();for(let i=1;i<DEPTH_THRESHOLDS.length;i++)if(time>=DEPTH_THRESHOLDS[i]*pace)value=i+1;return Math.min(5,value)}
  function zoneProgress(){if(depth>=5)return 1;let pace=cyclePacing(),start=DEPTH_THRESHOLDS[depth-1]*pace,end=DEPTH_THRESHOLDS[depth]*pace;return Math.max(0,Math.min(1,(elapsed-start)/(end-start)))}
  function blueprintTier(id){let copies=save.blueprints[id].copies;return copies>=BLUEPRINT_THRESHOLDS[3]?3:copies>=BLUEPRINT_THRESHOLDS[2]?2:copies>=BLUEPRINT_THRESHOLDS[1]?1:0}
  function blueprintMark(tier){return tier===3?'RANK III':tier===2?'RANK II':tier===1?'RANK I':'LOCKED'}
  function starterPowerAt(tier,tune){return tier?1+(tier-1)*.15+(tune||0)*.1:0}
  function starterPower(id){return starterPowerAt(blueprintTier(id),save.blueprints[id].tune)}
  function platingProtection(power){let shields=Math.floor(power+.0001);return {shields,armor:Math.min(.2,Math.max(0,power-shields)*.4)}}
  function starterEffect(id,power){
    if(!power)return 'RECOVER TO UNLOCK AS STARTER';
    if(id==='burst'){let strikes=Math.floor(power+.0001),echo=Math.round((power-strikes)*100);return '+'+strikes+' HAMMER ECHO'+(strikes===1?'':'ES')+(echo?'  \u00B7  '+echo+'% EXTRA ECHO':'')}
    if(id==='mark')return '+'+Math.round(power*10)+'% ELITE / BOSS DAMAGE  \u00B7  '+Math.round(Math.min(.28,power*.07)*100)+'% EXTRA BOSS DROP';
    if(id==='plating'){let protection=platingProtection(power),armor=Math.round(protection.armor*100);return '+'+protection.shields+' SHIELD'+(protection.shields===1?'':'S')+(armor?'  \u00B7  '+armor+'% ARMOR':'')}
    if(id==='overdrive')return '+'+Math.round(power*12)+'% MOVE  \u00B7  +'+Math.round(power*11)+'% IMPACT SPEED';
    return '+'+Math.round(power*34)+'% DAMAGE  \u00B7  -'+Math.round(power*11)+'% MAX HP';
  }
  function blueprintGoal(tier){return BLUEPRINT_THRESHOLDS[Math.min(3,tier+1)]}
  function blueprintRecoveryText(record,tier){let shown=Math.min(record.copies,BLUEPRINT_THRESHOLDS[3]);if(tier===3)return shown+' / '+BLUEPRINT_THRESHOLDS[3]+' RECOVERED  \u00B7  COPY MASTERY COMPLETE';return shown+' / '+blueprintGoal(tier)+' RECOVERED  \u00B7  NEXT '+blueprintMark(tier+1)}
  function blueprintProgress(record,tier){let goal=blueprintGoal(tier);return tier===3?100:Math.min(100,record.copies/goal*100)}
  function tuneCost(id){let record=save.blueprints[id],tier=blueprintTier(id);return Math.floor(80*(record.tune+1)*(1+tier*.45))}
  function modulePower(id){return cargo.reduce((sum,m)=>sum+(m.id===id?(m.power||(m.rare?2:1)):0),0)}
  function cargoStats(){
    let powers={};for(const module of cargo)powers[module.id]=(powers[module.id]||0)+(module.power||(module.rare?2:1));
    let synergies={};for(const synergy of SYNERGIES){synergies[synergy.id]=true;for(const id of synergy.needs)if(!(powers[id]>0)){synergies[synergy.id]=false;break}}
    let over=powers.overdrive||0,volatile=powers.volatile||0,mark=powers.mark||0,plating=platingProtection(powers.plating||0),gear=gearStats(),signature=gearSignatureProfile(),dashTech=1-schematicLevel('thrusters')*.06,surrounded=player?nearbyEnemyCount(player.x,player.y,245,false):0,committedPack=player&&(player.spinTime>0||player.spinLeap>0)?player.spinPack||0:0,pressure=Math.max(surrounded,committedPack),corePressure=1+Math.min(.22,surrounded*.009),riskDamage=signature.riskreaver?1+Math.min(signature.riskreaver===2?.62:.34,surrounded*(signature.riskreaver===2?.038:.026)):1,spinDamage=1+Math.min(1.15,pressure*.032)+(signature.riskreaver?signature.riskreaver===2?.28:.14:0),ironActive=!!(player&&player.maxHp&&player.hp/player.maxHp<=.4&&signature.ironGuild),ironDamage=ironActive?(signature.ironGuild===2?1.2:1.12):1,ironArmor=ironActive?(signature.ironGuild===2?.1:.06):0;
    return {burst:Math.min(3,powers.burst||0),shields:baseShields()+plating.shields,armor:Math.min(.55,plating.armor+gear.armor+ironArmor),speed:1+over*.12+gear.speed,fire:Math.max(.42,(1-over*.11)*(1-gear.fire)),damage:(1+volatile*.34)*corePressure*riskDamage*ironDamage,hp:Math.max(.58,1-volatile*.11),dashCd:2.2*dashTech*(1-gear.dash),crit:gear.crit,championDamage:1+mark*.1,bossDropChance:Math.min(.28,mark*.07),ram:synergies.kinetic?34+shotDamage()*1.2:0,shrapnel:synergies.shrapnel,counter:synergies.counter,pursuit:synergies.pursuit,finisher:synergies.finisher,signature,critEcho:signature.critEcho,bulwark:signature.bulwark,stormDash:signature.stormDash,hammerWave:signature.hammerWave,riskreaver:signature.riskreaver,riskTaken:1-Math.min(.38,surrounded*.013),surrounded,pressure,spinDamage,spinRadius:HAMMERSTORM.baseRadius+Math.min(58,pressure*1.35)+(signature.riskreaver?signature.riskreaver===2?32:18:0),spinRate:Math.min(1.75,1+over*.08+gear.fire),spinLifesteal:signature.riskreaver===2?.006:0}
  }
  function blueprintCount(){return MODULE_IDS.reduce((sum,id)=>sum+save.blueprints[id].copies,0)}
  function vaultProgress(){let spentSeals=save.vaultCycle*VAULT_SEALS,spentRelics=save.vaultCycle*VAULT_RELICS,seals=Math.max(0,save.cores-spentSeals),relics=Math.max(0,blueprintCount()-spentRelics),sealRatio=Math.min(1,seals/VAULT_SEALS),relicRatio=Math.min(1,relics/VAULT_RELICS);return {seals,relics,sealRatio,relicRatio,total:(sealRatio+relicRatio)/2}}
  function contractReady(){let progress=vaultProgress();return progress.seals>=VAULT_SEALS&&progress.relics>=VAULT_RELICS}
  function vaultExtraChance(){return Math.min(.35,.12+save.vaultCycle*.025+Math.max(0,save.level-8)*.004)}
  function vaultRarity(){let level=save.level,cycle=save.vaultCycle,legendary=level>=16?Math.min(.2,.035+cycle*.012+(level-16)*.006):0,mythic=level>=8?Math.min(.46,.16+cycle*.018+(level-8)*.012):0,epic=level>=4?Math.min(.72,.48+cycle*.015+(level-4)*.012):0,roll=Math.random();return roll<legendary?'legendary':roll<legendary+mythic?'mythic':roll<legendary+mythic+epic?'epic':'rare'}
  function rollVaultGear(){let gear=rollBossGear(Math.max(1,save.level),vaultRarity()),def=gearDefinition(gear);gear.quality=Math.min(1.35,Math.max(1.02,gear.quality+.08));let scale=(1+(gear.level-1)*.055)*gear.quality,stats={};for(const key of Object.keys(def.stats||{}))stats[key]=roundGearStat(key,def.stats[key]*scale*(.97+Math.random()*.1));gear.stats=stats;gear.value=Math.max(gear.value,Math.round(def.value*(1+(gear.level-1)*.08)*gear.quality*1.18));return gear}
  function synergyForPickup(id){return SYNERGIES.find(s=>s.needs.includes(id)&&s.needs.some(other=>other!==id&&modulePower(other)>0))}

  function resize(){
    const r=canvas.getBoundingClientRect();dpr=Math.min(2,window.devicePixelRatio||1);W=Math.max(1,r.width);H=Math.max(1,r.height);canvas.width=Math.floor(W*dpr);canvas.height=Math.floor(H*dpr);ctx.setTransform(dpr,0,0,dpr,0,0);
    const miniRect=miniMapCanvas.getBoundingClientRect();miniDpr=Math.min(2,window.devicePixelRatio||1);miniW=Math.max(1,miniRect.width);miniH=Math.max(1,miniRect.height);miniMapCanvas.width=Math.floor(miniW*miniDpr);miniMapCanvas.height=Math.floor(miniH*miniDpr);miniCtx.setTransform(miniDpr,0,0,miniDpr,0,0)
  }
  function setView(next){mode=next;ui.base.classList.toggle('active',next==='base');ui.expedition.classList.toggle('active',next==='run');ui.game.classList.toggle('runMode',next==='run');setMusicMode(next);if(next==='run')requestAnimationFrame(()=>{resize();last=performance.now()})}
  function noticeTone(tone){return tone==='#47c5b6'||tone==='#7ff4e6'?'#79a67e':tone==='#8f9dff'?'#9eb2d5':tone==='#ff7a3d'||tone==='#ff8b54'||tone==='#ff6b35'?'#c83f46':tone}
  function notice(text,tone){ui.notice.textContent=text;ui.notice.style.borderColor=noticeTone(tone)||'';ui.notice.classList.add('show');clearTimeout(notice.t);notice.t=setTimeout(()=>ui.notice.classList.remove('show'),1300)}
  function runNotice(text,tone){ui.runNotice.textContent=text;ui.runNotice.style.borderColor=noticeTone(tone)||'';ui.runNotice.classList.add('show');clearTimeout(runNotice.t);runNotice.t=setTimeout(()=>ui.runNotice.classList.remove('show'),1150)}
  const HELP_COPY={
    settingsButton:['Settings','Adjust sound, screen shake and particles, or open the playtest tools.'],
    gearLockerButton:['Adventure Bag','Inspect secured boss gear, compare rolls and equip Pappa Hammer.'],
    blueprintButton:['Relic Rack','Choose the Lucky Relic that begins each expedition and inspect permanent Boss Trophies.'],
    startButton:['Adventure Atlas','Choose a destination. New maps unlock when Pappa Hammer reaches levels 4, 8, 12 and 16.'],
    closeMaps:['Close Atlas','Return to the workshop without starting an expedition.'],
    closeGear:['Close Bag','Return to the workshop without changing your secured gear.'],
    gearSortButton:['Sort Gear','Cycle the order used for items in the Adventure Bag.'],
    sellFilteredGear:['Sell Filtered','Sell all visible unequipped gear. Worn items are always protected.'],
    gearTurnLeft:['Rotate Left','Turn the loadout preview left to inspect equipped gear.'],
    gearTurnRight:['Rotate Right','Turn the loadout preview right to inspect equipped gear.'],
    closeBlueprints:['Close Relic Rack','Return to the workshop.'],
    briefingStart:['Set Out','Begin the expedition after reviewing its three core rules.'],
    closeResult:['Return to Workshop','Bank secured coins and gear, then prepare the next expedition.'],
    closeContract:['Secure Vault Gear','Place every revealed Grand Vault item safely in the Adventure Bag and begin charging the next vault.'],
    extractButton:['Extract','Start the escape countdown. You can keep moving and fighting until it completes.'],
    cancelExtract:['Cancel Extraction','Stop the extraction countdown and remain in the tower.'],
    bossLootExtract:['Extract Now','Survive one final ambush to secure every coin and piece of boss gear currently at risk.'],
    bossLootPush:['Go Deeper','Carry all unsecured loot into another ascent. The next champion is harder but can drop stronger gear.'],
    routeFurnace:['Crimson Path','Face shield guards and the Crimson Champion. Every coin recovered is worth 16% more.'],
    routeDynamo:['Moonlit Path','Face scouts and the Vault Warden. Adds 8 percentage points to Epic-or-better boss gear odds.'],
    moduleSkip:['Leave Relic','Ignore this relic and continue without changing the current build.'],
    spinButton:['Hold Hammerstorm','Hold to dive and keep spinning. Dash between packs without releasing. More nearby enemies increase power and reach.'],
    dashButton:['Dash','Burst through danger. The ring refills as Dash becomes ready again.'],
    closeSettings:['Close Settings','Return to the workshop or resume the paused expedition.'],
    soundToggle:['Sound','Turn music and combat sound effects on or off.'],
    shakeToggle:['Screen Shake','Turn impact camera movement on or off.'],
    particlesToggle:['Particles','Turn decorative combat particles on or off.'],
    devButton:['Playtest Tools','Open shortcuts for testing progression, gear drops and boss fights.'],
    devScrap:['Add Coins','Adds test coins to the current expedition or workshop bank.'],
    devRig:['Equip Gear 2.0 Set','Creates and equips the complete Hammer Choir set so its Resonant Slam can be tested immediately.'],
    devBlackHole:['Equip Black Hole Set','Creates and equips the complete Legendary Black Hole set so its Gravity Well and cosmic visuals can be tested immediately.'],
    devHeal:['Full Heal','Restore Pappa Hammer to full health during an expedition.'],
    devCache:['Rare Cache','Drop a relic cache beside Pappa Hammer during an expedition.'],
    devLoot:['Legendary Loot','Drop test Legendary boss gear beside Pappa Hammer.'],
    devLevel:['Pappa Level','Immediately raise Pappa Hammer by one level to test maps, bosses and stronger gear drops.'],
    devWarden:['Fight Vault Warden','Jump directly to the Moonlit Path boss encounter.'],
    devTyrant:['Fight Champion','Jump directly to the Crimson Path boss encounter.'],
    devSchematic:['Next Trophy','Unlock the next available permanent Boss Trophy for testing.'],
    devReset:['Hard Reset','Permanently delete all local progress after a second confirmation.'],
    resumeButton:['Resume','Close settings and continue.'],
    abandonButton:['Abandon Expedition','Return immediately and lose all unsecured expedition cargo.']
  };
  let helpAnchor=null,helpTimer=0,helpHoverTimer=0,touchHelpPress=null,suppressedHelpTarget=null,suppressedHelpUntil=0;
  function cleanHelpText(value){return String(value||'').replace(/\s+/g,' ').trim()}
  function helpTarget(node){
    if(!node||!node.closest)return null;
    let target=node.closest('[data-help],button,[title],[data-info-ready],[role="button"],[role="switch"],[tabindex="0"]');
    let gearAnchor=target&&target.closest&&target.closest('.gearBagSlot,.gearLoadoutSlot,.baseGearSlot,.bossLootItem,.resultGearCard');
    if(!target||gearAnchor&&gearAnchor.hasAttribute('data-item'))return null;
    return target;
  }
  function helpDetails(target){
    let preset=HELP_COPY[target.id],nativeTitle=target.getAttribute&&target.getAttribute('title'),title=preset&&preset[0],text=preset&&preset[1];
    title=title||target.getAttribute&&target.getAttribute('data-help-title')||target.getAttribute&&target.getAttribute('aria-label')||nativeTitle;
    text=text||target.getAttribute&&target.getAttribute('data-help')||nativeTitle;
    if(!title){let heading=target.querySelector&&target.querySelector('strong,b');title=cleanHelpText(heading&&heading.textContent||target.textContent).slice(0,54)}
    if(!text){let copy=target.querySelector&&target.querySelector('p,span,em,small');text=cleanHelpText(copy&&copy.textContent);if(!text||text===title)text='Use this control to continue or change the current selection.'}
    if(nativeTitle&&target.removeAttribute){target.setAttribute('data-help',text);target.removeAttribute('title')}
    target.setAttribute&&target.setAttribute('data-info-ready','');
    return {title:cleanHelpText(title)||'Information',text:cleanHelpText(text).slice(0,180)};
  }
  function positionHelp(target){
    let tip=ui.helpTooltip,anchor=target.getBoundingClientRect(),card=tip.getBoundingClientRect(),pad=8,width=window.innerWidth||360,height=window.innerHeight||640,left=anchor.left+anchor.width/2-card.width/2,top=anchor.top-card.height-9;
    left=Math.max(pad,Math.min(width-card.width-pad,left));if(top<pad)top=anchor.bottom+9;if(top+card.height>height-pad)top=Math.max(pad,height-card.height-pad);tip.style.left=Math.round(left)+'px';tip.style.top=Math.round(top)+'px'
  }
  function showHelp(target,touch,duration){
    if(!target||!ui.helpTooltip)return;clearTimeout(helpHoverTimer);hideGearHover();let detail=helpDetails(target);helpAnchor=target;target.setAttribute&&target.setAttribute('aria-describedby','helpTooltip');ui.helpTooltipTitle.textContent=detail.title;ui.helpTooltipText.textContent=detail.text;ui.helpTooltip.classList.toggle('touchTip',!!touch);ui.helpTooltip.classList.add('show');ui.helpTooltip.setAttribute('aria-hidden','false');positionHelp(target);clearTimeout(helpTimer);if(touch)helpTimer=setTimeout(hideHelp,duration||3600)
  }
  function showHammerstormHelpOnce(){
    if(save.settings.hammerstormHelpSeen)return false;
    save.settings.hammerstormHelpSeen=true;persist();showHelp(ui.spin,true,5000);return true
  }
  function hideHelp(){clearTimeout(helpHoverTimer);if(helpAnchor&&helpAnchor.getAttribute&&helpAnchor.getAttribute('aria-describedby')==='helpTooltip')helpAnchor.removeAttribute('aria-describedby');helpAnchor=null;clearTimeout(helpTimer);ui.helpTooltip.classList.remove('show','touchTip');ui.helpTooltip.setAttribute('aria-hidden','true')}
  function gearHelpFromNode(node){
    let anchor=node&&node.closest&&node.closest('[data-item],.baseGearSlot');if(!anchor)return null;
    let uid=anchor.getAttribute&&anchor.getAttribute('data-item'),gear=uid&&(save.gear.find(item=>item.uid===uid)||bossLootRewards.find(item=>item.uid===uid)||vaultRewards.find(item=>item.uid===uid)||(runStats&&runStats.loot||[]).find(item=>item.uid===uid));
    return gear?{anchor,gear}:null
  }
  function clearTouchHelpPress(){
    if(!touchHelpPress)return;clearTimeout(touchHelpPress.timer);touchHelpPress.target&&touchHelpPress.target.classList.remove('infoHolding');touchHelpPress=null
  }
  function beginTouchHelp(event){
    if(event.pointerType!=='touch')return;
    let gearInfo=gearHelpFromNode(event.target),target=gearInfo?gearInfo.anchor:helpTarget(event.target);hideHelp();hideGearHover();
    if(!target)return;
    if(target===ui.spin)return;
    let state={id:event.pointerId,target,gearInfo,x:event.clientX,y:event.clientY,shown:false,timer:0};touchHelpPress=state;target.classList.add('infoHolding');
    state.timer=setTimeout(()=>{
      if(touchHelpPress!==state)return;state.shown=true;suppressedHelpTarget=target;suppressedHelpUntil=performance.now()+900;
      if(gearInfo)showGearHover(gearInfo.gear,target,event,true);else showHelp(target,true);
      if(navigator.vibrate)try{navigator.vibrate(12)}catch(e){}
    },520)
  }
  function moveTouchHelp(event){
    let state=touchHelpPress;if(!state||event.pointerId!==state.id||state.shown)return;
    if(Math.hypot(event.clientX-state.x,event.clientY-state.y)>13)clearTouchHelpPress()
  }
  function endTouchHelp(event){
    let state=touchHelpPress;if(!state||event.pointerId!==state.id)return;
    if(state.shown){event.preventDefault();event.stopPropagation();clearTimeout(helpTimer);helpTimer=setTimeout(()=>{hideHelp();hideGearHover()},3200)}
    clearTouchHelpPress()
  }
  function queueHelp(target){
    clearTimeout(helpHoverTimer);helpHoverTimer=setTimeout(()=>{if(target&&target.isConnected!==false)showHelp(target,false)},140)
  }
  function bindContextHelp(){
    document.addEventListener('pointerover',event=>{if(event.pointerType==='touch')return;let target=helpTarget(event.target);if(target&&target!==helpAnchor)queueHelp(target)});
    document.addEventListener('pointerout',event=>{if(event.pointerType==='touch')return;clearTimeout(helpHoverTimer);if(!helpAnchor)return;let next=event.relatedTarget;if(next&&helpAnchor.contains&&helpAnchor.contains(next))return;hideHelp()});
    document.addEventListener('focusin',event=>{let target=helpTarget(event.target);if(target)showHelp(target,false)});
    document.addEventListener('focusout',event=>{if(helpAnchor)hideHelp()});
    document.addEventListener('pointerdown',beginTouchHelp,true);
    document.addEventListener('pointermove',moveTouchHelp,true);
    document.addEventListener('pointerup',endTouchHelp,true);
    document.addEventListener('pointercancel',clearTouchHelpPress,true);
    document.addEventListener('click',event=>{if(!suppressedHelpTarget||performance.now()>suppressedHelpUntil)return;if(suppressedHelpTarget===event.target||suppressedHelpTarget.contains(event.target)){event.preventDefault();event.stopImmediatePropagation();suppressedHelpTarget=null}},true)
  }
  function ensureAudio(){if(!save.settings.sound)return null;try{audio.ctx=audio.ctx||new (window.AudioContext||window.webkitAudioContext)();if(audio.ctx.state==='suspended')audio.ctx.resume();if(!audio.timer&&typeof window.setInterval==='function')audio.timer=window.setInterval(musicStep,420);return audio.ctx}catch(e){return null}}
  function tone(freq,duration,volume,type,slide,delay){let a=ensureAudio();if(!a)return;let o=a.createOscillator(),g=a.createGain(),t=a.currentTime+(delay||0);o.type=type||'triangle';o.frequency.setValueAtTime(Math.max(25,freq),t);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(25,slide),t+duration*.85);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(volume||.02,t+.008);g.gain.exponentialRampToValueAtTime(.0001,t+duration);o.connect(g);g.connect(a.destination);o.start(t);o.stop(t+duration+.02)}
  function musicStep(){if(!save.settings.sound||!audio.ctx)return;let sets=audio.mode==='boss'?[55,55,65,49,73,65,55,49]:audio.mode==='run'?[110,131,147,98,110,165,147,131]:[82,98,110,73,82,123,110,98],notes=sets[audio.step++%sets.length];tone(notes,audio.mode==='boss' ? .32 : .24,audio.mode==='boss' ? .012 : .008,'sine',notes*.998);if(audio.step%4===0)tone(notes*2,.12,.006,'triangle',notes*1.5,.06)}
  function setMusicMode(next){audio.mode=next==='run'?(bossActive?'boss':'run'):'base';if(audio.ctx)ensureAudio()}
  function sound(name){
    if(!save.settings.sound)return;ensureAudio();if(name==='shoot'){tone(118,.065,.022,'square',62);tone(235,.045,.009,'triangle',145)}else if(name==='hit'){tone(105,.06,.024,'square',65);tone(900,.035,.008,'sawtooth',320)}else if(name==='kill'){tone(145,.11,.025,'square',48);tone(520,.08,.012,'triangle',760,.025)}else if(name==='pickup'){tone(540,.08,.018,'triangle',790)}else if(name==='hurt'){tone(92,.2,.042,'sawtooth',38);tone(46,.24,.02,'square',35)}else if(name==='upgrade'){tone(330,.13,.02,'triangle',660);tone(495,.14,.015,'triangle',990,.08)}else if(name==='rare'){tone(660,.2,.025,'triangle',1320);tone(990,.24,.018,'sine',1480,.08)}else if(name==='legendary'){tone(330,.42,.035,'triangle',1320);tone(495,.38,.028,'sine',1480,.08);tone(660,.34,.022,'triangle',1760,.16)}else if(name==='boss'){tone(58,.34,.045,'sawtooth',31);tone(116,.28,.018,'square',55,.04)}else if(name==='shield'){tone(780,.12,.025,'sine',1280);tone(390,.15,.012,'triangle',910)}else if(name==='dash'){tone(180,.1,.018,'sawtooth',520)}else if(name==='spinStart'){tone(92,.18,.032,'sawtooth',210);tone(46,.24,.024,'triangle',92,.04)}else if(name==='spinHit'){tone(64,.075,.034,'square',38);tone(310,.045,.011,'sawtooth',90,.012)}else if(name==='spinFinish'){tone(46,.32,.052,'sawtooth',25);tone(185,.24,.022,'square',74,.025);tone(620,.2,.015,'triangle',980,.08)}else if(name==='spinEnd'){tone(88,.14,.025,'triangle',46);tone(220,.08,.01,'square',120,.035)}else tone(150,.1,.018,'triangle',260)
  }

  function inventoryCount(){return save.gear.length}
  function inventoryValue(){return save.gear.reduce((sum,gear)=>sum+Math.max(1,Math.round(gear.value||0)),0)}
  function gearUnitValue(gear){let def=gearDefinition(gear);return Math.max(1,Math.round(gear&&gear.value||(def&&def.value)||1))}
  function gearIsEquipped(gear){return !!(gear&&Object.values(save.equipped).includes(gear.uid))}
  function gearCopyCounts(){let counts={};for(const gear of save.gear)counts[gear.itemId]=(counts[gear.itemId]||0)+1;return counts}
  function escapeMarkup(value){return String(value==null?'':value).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;')}
  function gearHoverComparison(gear){let item=gearDefinition(gear),equipped=gearIsEquipped(gear),worn=item&&equippedGear(item.slot),score=Math.round(gearScore(gear)*10)/10,wornScore=worn?Math.round(gearScore(worn)*10)/10:0,delta=Math.round((score-wornScore)*10)/10;if(equipped)return {text:'CURRENT LOADOUT',tone:'current'};if(!worn)return {text:'OPEN SLOT  +'+score+' POWER',tone:'upgrade'};if(delta>0)return {text:'UPGRADE  +'+delta+' POWER',tone:'upgrade'};if(delta<0)return {text:'LOWER  '+delta+' POWER',tone:'downgrade'};return {text:'MATCHED POWER',tone:'matched'}}
  const GEAR_STAT_NAMES={hp:'HP',damage:'DMG',magnet:'REACH',speed:'MOVE',fire:'IMPACT',armor:'ARMOR',loot:'VALUE',dash:'DASH',crit:'CRIT'};
  function formatGearDelta(key,value){let amount=['speed','fire','armor','loot','dash','crit'].includes(key)?Math.round(value*100)+'%':key==='damage'?Math.round(value*10)/10:Math.round(value);return (amount>0?'+':'')+amount+' '+GEAR_STAT_NAMES[key]}
  function gearDeltaMarkup(gear){
    let item=gearDefinition(gear),worn=item&&equippedGear(item.slot);if(!item||gearIsEquipped(gear))return '';
    let current=worn&&worn.stats||{},next=gear.stats||{},keys=[...new Set([...Object.keys(current),...Object.keys(next)])],deltas=keys.map(key=>({key,value:(next[key]||0)-(current[key]||0)})).filter(entry=>Math.abs(entry.value)>.0001).sort((a,b)=>Math.abs(b.value)-Math.abs(a.value)).slice(0,4);
    if(!deltas.length)return '<div class="gearDeltaGrid matched"><small>VS EQUIPPED</small><span>NO STAT CHANGE</span></div>';
    return '<div class="gearDeltaGrid"><small>'+(worn?'VS EQUIPPED':'EMPTY SLOT')+'</small>'+deltas.map(entry=>'<span class="'+(entry.value>0?'gain':'loss')+'">'+formatGearDelta(entry.key,entry.value)+'</span>').join('')+'</div>'
  }
  function loadoutGearMap(candidate){
    let map=Object.fromEntries(GEAR_SLOTS.map(slot=>[slot,equippedGear(slot)])),item=gearDefinition(candidate);if(item)map[item.slot]=candidate;return map
  }
  function loadoutSetCounts(map){
    let counts={};for(const slot of GEAR_SLOTS){let item=gearDefinition(map[slot]);if(item&&item.setId)counts[item.setId]=(counts[item.setId]||0)+1}return counts
  }
  function loadoutStats(map){
    let total={hp:0,damage:0,magnet:0,speed:0,fire:0,armor:0,loot:0,dash:0,crit:0},counts=loadoutSetCounts(map);
    for(const slot of GEAR_SLOTS)for(const key of Object.keys(map[slot]&&map[slot].stats||{}))total[key]=(total[key]||0)+map[slot].stats[key];
    for(const set of SET_DEFINITIONS){let count=counts[set.id]||0;for(const tier of setBonusTiers(set))if(count>=tier&&set.bonus[tier])for(const key of Object.keys(set.bonus[tier]))total[key]=(total[key]||0)+set.bonus[tier][key]}
    total.armor=Math.min(.45,total.armor);total.crit=Math.min(.5,total.crit);total.fire=Math.min(.45,total.fire);total.speed=Math.min(.4,total.speed);total.dash=Math.min(.45,total.dash);
    return {stats:total,counts,lifeSteal:gearSignatureProfileFromCounts(counts).riskreaver===2?.006:0}
  }
  function gearComparisonMarkup(gear){
    let item=gearDefinition(gear);if(!item)return '';let currentMap=loadoutGearMap(null),candidateMap=loadoutGearMap(gear),current=loadoutStats(currentMap),candidate=loadoutStats(candidateMap),worn=currentMap[item.slot],wornItem=gearDefinition(worn),set=item.setId&&SET_BY_ID[item.setId],rows=[
      ['DAMAGE',8+(save.level-1)*.3+save.weapon*1.45+current.stats.damage,8+(save.level-1)*.3+save.weapon*1.45+candidate.stats.damage,'number'],
      ['ARMOR',current.stats.armor,candidate.stats.armor,'percent'],
      ['IMPACT SPEED',current.stats.fire,candidate.stats.fire,'percent'],
      ['CRIT',current.stats.crit,candidate.stats.crit,'percent'],
      ['LIFE STEAL',current.lifeSteal,candidate.lifeSteal,'percent']
    ];
    function valueMarkup(value,type){return type==='percent'?Math.round(value*1000)/10+'%':Math.round(value*10)/10}
    function card(label,name,values,side){return '<section class="gearCompareCard '+side+'"><header><small>'+label+'</small><b>'+escapeMarkup(name)+'</b></header><div class="gearCompareRows">'+values.map(row=>{let delta=row[2]-row[1],tone=side==='candidate'?(delta>.0001?'gain':delta<-.0001?'loss':'same'):'same',value=side==='candidate'?row[2]:row[1];return '<span class="'+tone+'"><i>'+row[0]+'</i><b>'+valueMarkup(value,row[3])+'</b></span>'}).join('')+'</div></section>'}
    let progress=set?(candidate.counts[set.id]||0)+' / 5 '+set.name+' pieces':'No set bonus';
    return '<div class="gearComparison">'+card('EQUIPPED',wornItem?wornItem.name:'EMPTY SLOT',rows,'equipped')+card('PREVIEW',item.name,rows,'candidate')+'<div class="gearCompareSet">SET PROGRESS  <b>'+escapeMarkup(progress)+'</b></div></div>'
  }
  function positionGearHover(anchor,event){if(!gearHoverPreview.classList.contains('show'))return;if(gearHoverPreview.classList.contains('touchPreview')){gearHoverPreview.style.left='8px';gearHoverPreview.style.top='auto';return}let card=gearHoverPreview.getBoundingClientRect(),source=anchor.getBoundingClientRect(),pad=12,pointer=event&&Number.isFinite(event.clientX)&&Number.isFinite(event.clientY),x=pointer?event.clientX+18:source.right+10,y=pointer?event.clientY+16:source.top;if(x+card.width>window.innerWidth-pad)x=pointer?event.clientX-card.width-18:source.left-card.width-10;if(y+card.height>window.innerHeight-pad)y=window.innerHeight-card.height-pad;x=Math.max(pad,Math.min(window.innerWidth-card.width-pad,x));y=Math.max(pad,Math.min(window.innerHeight-card.height-pad,y));gearHoverPreview.style.left=Math.round(x)+'px';gearHoverPreview.style.top=Math.round(y)+'px'}
  function showGearHover(gear,anchor,event,touch){let item=gearDefinition(gear);if(!item||event&&event.pointerType==='touch'&&!touch)return;hideHelp();let rarity=LOOT_RARITIES[item.rarity],set=item.setId&&SET_BY_ID[item.setId],comparison=gearHoverComparison(gear),stats=formatGearStats(gear),score=Math.round(gearScore(gear)*10)/10,setCount=set?(equippedSetCounts()[set.id]||0):0;hoverGearUid=gear.uid;paperDollPreview(gear);if(ui.gearOverlay.classList.contains('show'))renderGearDetail(gear,gearCopyCounts());gearHoverPreview.style.setProperty('--gear-color',rarity.color);gearHoverPreview.style.setProperty('--gear-glow',rarity.glow);gearHoverPreview.innerHTML='<header><span><small>'+rarity.name+' '+GEAR_SLOT_META[item.slot].name+'</small><b>LEVEL '+gear.level+'</b></span><em>'+score+' POWER</em></header><div class="gearHoverBody"><div class="gearHoverArt">'+gearArtMarkup(gear,'hover')+'</div><div class="gearHoverCopy"><small>'+gearQualityLabel(gear)+'</small><h3>'+escapeMarkup(item.name)+'</h3><strong class="'+comparison.tone+'">'+comparison.text+'</strong></div></div>'+gearDeltaMarkup(gear)+'<div class="gearHoverStats">'+stats.map(stat=>'<span>'+stat+'</span>').join('')+'</div>'+(set&&GEAR_SIGNATURES[set.id]?gearSignatureMarkup(set,setCount):'')+'<footer><span>'+(set?escapeMarkup(set.mark)+' '+escapeMarkup(set.name)+' SET':'TOWER GEAR')+'</span><b>$'+gearUnitValue(gear)+'</b></footer>';gearHoverPreview.classList.toggle('touchPreview',!!touch);gearHoverPreview.classList.add('show');gearHoverPreview.setAttribute('aria-hidden','false');positionGearHover(anchor,event)}
  function hideGearHover(uid){if(uid&&hoverGearUid!==uid)return;hoverGearUid=null;restorePaperDollPreview();if(ui.gearOverlay.classList.contains('show'))renderGearDetail(save.gear.find(gear=>gear.uid===selectedGearUid),gearCopyCounts());gearHoverPreview.classList.remove('show','touchPreview');gearHoverPreview.style.bottom='';gearHoverPreview.setAttribute('aria-hidden','true')}
  function bindGearHover(element,gear){if(!element||!gear)return;if(element.removeAttribute)element.removeAttribute('title');element.setAttribute('data-item',gear.uid);element.setAttribute('data-info-ready','');element.setAttribute('aria-describedby','gearHoverPreview');element.addEventListener('pointerenter',event=>showGearHover(gear,element,event));element.addEventListener('pointermove',event=>{if(hoverGearUid===gear.uid&&event.pointerType!=='touch')positionGearHover(element,event)});element.addEventListener('pointerleave',event=>{if(event.pointerType!=='touch')hideGearHover(gear.uid)});element.addEventListener('focus',()=>showGearHover(gear,element));element.addEventListener('blur',()=>hideGearHover(gear.uid))}
  function gearMatchesFilters(gear){let item=gearDefinition(gear);return !!item&&(gearFilter==='all'||item.slot===gearFilter)&&(gearRarityFilter==='all'||item.rarity===gearRarityFilter)}
  function filteredGearSaleSummary(){let sellable=save.gear.filter(gear=>gearMatchesFilters(gear)&&!gearIsEquipped(gear));return {count:sellable.length,value:sellable.reduce((sum,gear)=>sum+gearUnitValue(gear),0)}}
  function resetFilteredSaleArm(){sellFilterArmedKey='';sellFilterArmedUntil=0}
  function setGearView(){gearView='unified';ui.gearPanel.classList.remove('loadoutMode')}
  function setGearFilter(slot){hideGearHover();gearFilter=slot||'all';resetFilteredSaleArm();renderGearFilters();renderGearRaritySummary();renderGearInventoryArea()}
  function setGearRarityFilter(rarity){hideGearHover();gearRarityFilter=rarity||'all';resetFilteredSaleArm();renderGearFilters();renderGearRaritySummary();renderGearInventoryArea()}
  function setGearSort(sort){hideGearHover();gearSort=GEAR_SORTS.some(entry=>entry.id===sort)?sort:'power';renderGearInventoryArea()}
  function cycleGearSort(){let index=GEAR_SORTS.findIndex(sort=>sort.id===gearSort);setGearSort(GEAR_SORTS[(index+1)%GEAR_SORTS.length].id)}
  function gearSortComparator(indexes){return (a,b)=>{let equipped=Number(gearIsEquipped(b))-Number(gearIsEquipped(a));if(equipped)return equipped;let ad=gearDefinition(a),bd=gearDefinition(b),ar=LOOT_RARITIES[ad.rarity].rank,br=LOOT_RARITIES[bd.rarity].rank,value=0;if(gearSort==='rarity')value=br-ar||b.level-a.level||gearScore(b)-gearScore(a);else if(gearSort==='level')value=b.level-a.level||br-ar||gearScore(b)-gearScore(a);else if(gearSort==='newest')value=(indexes.get(b.uid)||0)-(indexes.get(a.uid)||0);else if(gearSort==='value')value=gearUnitValue(b)-gearUnitValue(a)||br-ar;else if(gearSort==='name')value=ad.name.localeCompare(bd.name)||br-ar;else value=gearScore(b)-gearScore(a)||br-ar||b.level-a.level;return value||ad.name.localeCompare(bd.name)}}
  function gearSlotFeedback(slot,rarity){
    let slots=ui.gearLoadoutSlots.querySelectorAll?[...ui.gearLoadoutSlots.querySelectorAll('.gearLoadoutSlot[data-slot="'+slot+'"]')]:[],count=mobileArmory()?4:8;for(const target of slots){target.classList.remove('equipPop');void target.offsetWidth;target.classList.add('equipPop');target.style.setProperty('--gear-color',rarity.color);let burst=document.createElement('span');burst.className='gearSlotParticles';for(let index=0;index<count;index++){let particle=document.createElement('i'),angle=index/count*Math.PI*2,distance=22+(index%3)*7;particle.style.setProperty('--dx',Math.cos(angle)*distance+'px');particle.style.setProperty('--dy',Math.sin(angle)*distance+'px');burst.appendChild(particle)}target.appendChild(burst);setTimeout(()=>{target.classList.remove('equipPop');burst.remove()},520)}
  }
  function playGearEquipEffect(gear,awakened){let item=gearDefinition(gear),rarity=item&&LOOT_RARITIES[item.rarity],signature=item&&item.setId&&GEAR_SIGNATURES[item.setId];if(!rarity||!ui.gearCharacterStage)return;ui.gearCharacterStage.style.setProperty('--equip-color',signature&&awakened?signature.color:rarity.color);ui.gearCharacterStage.classList.remove('equipBurst','equipRank2','equipRank3','equipRank4','signatureAwaken');void ui.gearCharacterStage.offsetWidth;ui.gearCharacterStage.classList.add('equipBurst','equipRank'+Math.max(2,rarity.rank));gearSlotFeedback(item.slot,rarity);if(awakened)ui.gearCharacterStage.classList.add('signatureAwaken');setTimeout(()=>ui.gearCharacterStage.classList.remove('equipBurst','equipRank2','equipRank3','equipRank4','signatureAwaken'),awakened?1100:760)}
  function equipGear(uid){let gear=save.gear.find(entry=>entry.uid===uid),item=gearDefinition(gear);if(!gear||!item)return false;let equipping=save.equipped[item.slot]!==uid,beforeTier=item.setId?gearSignatureTier(item.setId):0;save.equipped[item.slot]=equipping?uid:null;let afterTier=item.setId?gearSignatureTier(item.setId):0,awakened=equipping&&afterTier>beforeTier;selectedGearUid=uid;gearTapUid=null;paperDollKey='';paperDollPreviewCache.clear();persist();refreshEquippedGearUI();if(equipping)playGearEquipEffect(gear,awakened);let rarity=LOOT_RARITIES[item.rarity];sound(awakened||equipping&&rarity.rank===4?'legendary':equipping&&rarity.rank>=2?'rare':'upgrade');return equipping}
  function unequipGearSlot(slot){let gear=equippedGear(slot);if(!gear)return false;save.equipped[slot]=null;selectedGearUid=gear.uid;gearTapUid=null;paperDollKey='';paperDollPreviewCache.clear();persist();refreshEquippedGearUI();sound('upgrade');return true}
  function sellGear(uid){let index=save.gear.findIndex(entry=>entry.uid===uid),gear=save.gear[index],item=gearDefinition(gear);if(index<0||!item||gearIsEquipped(gear))return;let value=gearUnitValue(gear);save.gear.splice(index,1);if(selectedGearUid===uid)selectedGearUid=null;save.scrap+=value;persist();refreshBase();renderGearLocker();notice(item.name.toUpperCase()+' SOLD  +$'+value,LOOT_RARITIES[item.rarity].color);sound('pickup')}
  function renderSellFilteredButton(summary){let armed=sellFilterArmedKey===gearFilter+'|'+gearRarityFilter+'|'+summary.count+'|'+summary.value&&performance.now()<=sellFilterArmedUntil;ui.sellFilteredGear.disabled=!summary.count;ui.sellFilteredGear.classList.toggle('armed',armed);ui.sellFilteredLabel.textContent=armed?'CONFIRM SALE':'SELL FILTERED';ui.sellFilteredSummary.textContent=summary.count?summary.count+' ITEM'+(summary.count===1?'':'S')+'  \u00B7  $'+summary.value:'NOTHING SELLABLE'}
  function sellFilteredGear(){let summary=filteredGearSaleSummary();if(!summary.count){notice('NO UNEQUIPPED GEAR IN THIS FILTER','#9aa5aa');return}let key=gearFilter+'|'+gearRarityFilter+'|'+summary.count+'|'+summary.value,now=performance.now();if(sellFilterArmedKey!==key||now>sellFilterArmedUntil){sellFilterArmedKey=key;sellFilterArmedUntil=now+2600;renderSellFilteredButton(summary);notice('PRESS AGAIN TO CONFIRM  \u00B7  EQUIPPED GEAR STAYS','#d6aa58');setTimeout(()=>{if(performance.now()>=sellFilterArmedUntil){resetFilteredSaleArm();renderSellFilteredButton(filteredGearSaleSummary())}},2650);return}let soldIds=new Set(save.gear.filter(gear=>!gearIsEquipped(gear)&&gearMatchesFilters(gear)).map(gear=>gear.uid));save.gear=save.gear.filter(gear=>gearIsEquipped(gear)||!gearMatchesFilters(gear));if(soldIds.has(selectedGearUid))selectedGearUid=null;save.scrap+=summary.value;resetFilteredSaleArm();persist();refreshBase();renderGearLocker();notice(summary.count+' ITEMS SOLD  +$'+summary.value,'#d6aa58');sound('upgrade')}
  function formatSetBonus(stats){return formatGearStats({stats}).join(' \u00B7 ')}
  function renderSetSummary(){let counts=equippedSetCounts(),sets=SET_DEFINITIONS.filter(set=>counts[set.id]);ui.gearSetSummary.innerHTML='';if(!sets.length){ui.gearSetSummary.innerHTML='<div class="setEmpty" data-help-title="Set Bonuses" data-help="Equip matching pieces to awaken fixed set bonuses. Every complete set masters a combat-changing signature."><b>SET BONUSES</b><span>Matching gear awakens build-defining effects.</span></div>';return}for(const set of sets.sort((a,b)=>counts[b.id]-counts[a.id])){let count=counts[set.id],signature=GEAR_SIGNATURES[set.id],bonusTiers=setBonusTiers(set),awakens=setSignaturePieces(set),card=document.createElement('article');card.className='setProgress rarity'+LOOT_RARITIES[set.rarity].rank+(signature?' featured':'');card.style.setProperty('--set-color',signature?signature.color:set.accent);card.tabIndex=0;card.setAttribute('data-help-title',set.name+' Set');card.setAttribute('data-help','You wear '+count+' of 5 pieces. Bonuses awaken at '+bonusTiers.join(', ')+' pieces.'+(signature?' '+signature.name+' awakens at '+awakens+' pieces and masters at 5.':''));let tiers=bonusTiers.map(tier=>'<span class="'+(count>=tier?'active':'locked')+'"><i>'+tier+'</i><b>'+formatSetBonus(set.bonus[tier])+'</b></span>').join('');card.innerHTML='<header><strong>'+set.mark+' '+set.name+'</strong><em>'+count+' / 5</em></header><div>'+tiers+'</div>'+(signature?gearSignatureMarkup(set,count):'');ui.gearSetSummary.appendChild(card)}}
  function renderBaseGear(){let equipped=[];ui.baseLoadout.innerHTML='';for(const slot of GEAR_SLOTS){let gear=equippedGear(slot),item=gearDefinition(gear),meta=GEAR_SLOT_META[slot],rarity=item&&LOOT_RARITIES[item.rarity],cell=document.createElement('i');cell.className='baseGearSlot'+(item?' filled rarity'+rarity.rank:'');cell.title=item?meta.name+': '+item.name+' \u00B7 Level '+gear.level:meta.name+': Empty';if(item){equipped.push(gear);cell.style.setProperty('--gear-color',rarity.color);cell.innerHTML=gearArtMarkup(gear,'micro');cell.tabIndex=0;bindGearHover(cell,gear)}else cell.textContent='\u00B7';ui.baseLoadout.appendChild(cell)}let highest=equipped.slice().sort((a,b)=>{let ad=gearDefinition(a),bd=gearDefinition(b);return LOOT_RARITIES[bd.rarity].rank-LOOT_RARITIES[ad.rarity].rank||gearScore(b)-gearScore(a)})[0],highestDef=gearDefinition(highest),sets=equippedSetCounts(),bestSet=Object.keys(sets).sort((a,b)=>sets[b]-sets[a])[0],fullSetId=equippedFullSetId(),profile=equippedRarityProfile();applyLoadoutRarity(ui.gearCharacterStage,profile);applyLoadoutRarity(ui.pappaHammerBase,profile);applyLoadoutSetVisual(ui.gearCharacterStage,fullSetId);applyLoadoutSetVisual(ui.pappaHammerBase,fullSetId);ui.gearLoadoutName.textContent=equipped.length+'/5 EQUIPPED'+(bestSet&&sets[bestSet]>=2?' \u00B7 '+SET_BY_ID[bestSet].name:highestDef?' \u00B7 '+LOOT_RARITIES[highestDef.rarity].name:'');ui.gearEquippedCount.textContent=equipped.length+' / 5';ui.gearPreviewName.textContent=highestDef?highestDef.name.toUpperCase():'FIELD LOADOUT';ui.gearPreviewName.style.setProperty('--loadout-color',profile.color);let stats=gearStats();ui.baseGearStats.innerHTML='<span tabindex="0" data-help-title="Health" data-help="Maximum damage Pappa can survive before an expedition ends."><b>'+maxHp()+'</b> HP</span><span tabindex="0" data-help-title="Hammer Damage" data-help="Base damage dealt by close-range hammer impacts before critical hits and relic bonuses."><b>'+shotDamage()+'</b> DMG</span><span tabindex="0" data-help-title="Pickup Reach" data-help="Distance from which nearby coins, caches and pickups are drawn toward Pappa."><b>'+magnetRange()+'</b> REACH</span><span tabindex="0" data-help-title="Critical Chance" data-help="Chance for a melee impact to deal amplified critical damage."><b>'+Math.round(stats.crit*100)+'%</b> CRIT</span>';refreshPaperDoll()}
  function renderGearFilters(){ui.gearFilters.innerHTML='';let filterNames={hat:'HELMET',scarf:'NECK',coat:'CHEST + GLOVES',hammer:'HAMMER',boots:'BOOTS'};for(const slot of ['all',...GEAR_SLOTS]){let button=document.createElement('button'),meta=slot==='all'?{name:'ALL GEAR',icon:'\u2606'}:Object.assign({},GEAR_SLOT_META[slot],{name:filterNames[slot]}),count=slot==='all'?inventoryCount():save.gear.filter(gear=>gearDefinition(gear).slot===slot).length;button.className=gearFilter===slot?'active':'';button.setAttribute('aria-pressed',gearFilter===slot?'true':'false');button.setAttribute('data-help-title',meta.name);button.setAttribute('data-help','Show '+(slot==='all'?'every secured item':meta.name.toLowerCase()+' items')+' in the bag. '+count+' currently match.');button.innerHTML='<i>'+meta.icon+'</i><span>'+meta.name+'</span><small>'+count+'</small>';button.addEventListener('click',()=>setGearFilter(slot));ui.gearFilters.appendChild(button)}ui.gearRarityFilters.innerHTML='';for(const rarity of ['all',...Object.keys(LOOT_RARITIES)]){let button=document.createElement('button'),count=rarity==='all'?inventoryCount():save.gear.filter(gear=>gearDefinition(gear).rarity===rarity).length,label=rarity==='all'?'ALL':LOOT_RARITIES[rarity].name;button.className=gearRarityFilter===rarity?'active':'';button.textContent=label+'  '+count;button.setAttribute('aria-pressed',gearRarityFilter===rarity?'true':'false');button.setAttribute('data-help-title',label+' Rarity');button.setAttribute('data-help','Filter the bag to '+(rarity==='all'?'all rarity grades.':'only '+label+' gear. '+count+' secured item'+(count===1?' matches.':'s match.')));if(rarity!=='all')button.style.setProperty('--filter-color',LOOT_RARITIES[rarity].color);button.addEventListener('click',()=>setGearRarityFilter(rarity));ui.gearRarityFilters.appendChild(button)}}
  function renderGearRaritySummary(){ui.gearRaritySummary.innerHTML='';for(const id of Object.keys(LOOT_RARITIES)){let rarity=LOOT_RARITIES[id],count=save.gear.filter(gear=>gearDefinition(gear).rarity===id).length,button=document.createElement('button');button.className='rarityCount rarity'+rarity.rank+(gearRarityFilter===id?' active':'');button.style.setProperty('--rarity-color',rarity.color);button.innerHTML='<i></i><span><b>'+count+'</b><small>'+rarity.name+'</small></span>';button.setAttribute('data-help-title',rarity.name+' Gear');button.setAttribute('data-help',count+' '+rarity.name+' item'+(count===1?' is':'s are')+' secured. Select to toggle this rarity filter.');button.addEventListener('click',()=>setGearRarityFilter(gearRarityFilter===id?'all':id));ui.gearRaritySummary.appendChild(button)}}
  function renderGearDetail(gear,copies){
    ui.gearDetail.innerHTML='';let item=gearDefinition(gear);
    if(!gear||!item){ui.gearDetail.innerHTML='<div class="gearDetailEmpty"><i class="gearBagIcon"></i><b>NO GEAR SELECTED</b></div>';return}
    let rarity=LOOT_RARITIES[item.rarity],equipped=gearIsEquipped(gear),worn=equippedGear(item.slot),set=item.setId&&SET_BY_ID[item.setId],setCount=set?(equippedSetCounts()[set.id]||0):0,score=Math.round(gearScore(gear)*10)/10,wornScore=worn?Math.round(gearScore(worn)*10)/10:0,delta=Math.round((score-wornScore)*10)/10,comparison=equipped?'CURRENT LOADOUT':!worn?'OPEN SLOT  +'+score+' POWER':delta>0?'UPGRADE  +'+delta+' POWER':delta<0?'DOWNGRADE  '+delta+' POWER':'MATCHED POWER',lore=set?'Part of the '+set.name+' set. Match pieces to awaken its fixed set bonuses.':'Recovered from a tower champion. Its combat stats were forged when it dropped.',root=document.createElement('article');
    root.className='gearDetailCard rarity'+rarity.rank+(equipped?' equipped':'');root.style.setProperty('--gear-color',rarity.color);root.style.setProperty('--gear-glow',rarity.glow);
    root.innerHTML='<header><span><small>'+rarity.name+' '+GEAR_SLOT_META[item.slot].name+'</small><b>LEVEL '+gear.level+'</b></span><em>'+comparison+'</em></header><div class="gearDetailArt">'+gearArtMarkup(gear,'detail')+'<i>'+rarity.name+'</i></div><div class="gearDetailTitle"><small>'+gearQualityLabel(gear)+' \u00B7 '+(copies[gear.itemId]||1)+' OWNED</small><h3>'+item.name+'</h3>'+(set?'<b>'+set.mark+' '+set.name+' SET  \u00B7  '+setCount+'/5 WORN</b>':'')+'</div><p class="gearDetailLore">'+lore+'</p>'+gearComparisonMarkup(gear)+(set&&GEAR_SIGNATURES[set.id]?gearSignatureMarkup(set,setCount):'')+'<div class="gearDetailStats">'+formatGearStats(gear).map(stat=>'<span>'+stat+'</span>').join('')+'</div><div class="gearDetailMeta"><span><small>POWER</small><b>'+score+'</b></span><span><small>SELL VALUE</small><b>$'+gearUnitValue(gear)+'</b></span></div>';
    let actions=document.createElement('div');actions.className='gearDetailActions';let equip=document.createElement('button');equip.className='equipGear';equip.textContent=equipped?'REMOVE':'EQUIP';equip.setAttribute('data-help-title',equipped?'Remove Gear':'Equip Gear');equip.setAttribute('data-help',equipped?'Remove this item from Pappa Hammer without selling it.':'Wear this item now. It replaces the current '+GEAR_SLOT_META[item.slot].name.toLowerCase()+' and updates Pappa visually.');equip.addEventListener('click',()=>equipGear(gear.uid));let sell=document.createElement('button');sell.className='sellGear';sell.textContent=equipped?'EQUIPPED \u00B7 SAFE':'SELL  $'+gearUnitValue(gear);sell.setAttribute('data-help-title','Sell Gear');sell.setAttribute('data-help',equipped?'Equipped gear is protected and cannot be sold.':'Sell this item permanently for $'+gearUnitValue(gear)+'.');sell.disabled=equipped;sell.addEventListener('click',()=>sellGear(gear.uid));actions.append(equip,sell);root.appendChild(actions);ui.gearDetail.appendChild(root)
  }
  function updateGearTurntable(){let angle=((gearTurnAngle%360)+360)%360,cos=Math.cos(angle*Math.PI/180),side=Math.sin(angle*Math.PI/180),view=Math.abs(side)>.72?(side>0?'RIGHT':'LEFT'):cos<0?'BACK':'FRONT';ui.gearCharacterStage.style.setProperty('--turn-scale-x',(Math.sign(cos||1)*(.34+Math.abs(cos)*.66)).toFixed(3));ui.gearCharacterStage.style.setProperty('--turn-skew',(side*4).toFixed(2)+'deg');ui.gearCharacterStage.style.setProperty('--turn-dark',cos<0?'.38':'0');ui.gearCharacterStage.classList.toggle('rearView',cos<0);ui.gearTurnReadout.textContent=view+' \u00B7 '+Math.round(angle)+'\u00B0'}
  function turnGear(delta){gearTurnAngle+=delta;updateGearTurntable()}
  function activateGearEntry(event,gear){
    if(!gear||performance.now()<suppressGearClickUntil)return;
    let touch=gearPointerType==='touch'||mobileArmory();if(touch&&gearTapUid===gear.uid){equipGear(gear.uid);return}
    selectedGearUid=gear.uid;gearTapUid=touch?gear.uid:null;updateGearInventoryStates();renderGearSelection()
  }
  function renderGearProgressAndStats(){
    ui.gearPappaLevel.textContent=save.level;let xpGoal=levelXpNeeded(save.level);ui.gearXpFill.style.width=Math.min(100,save.xp/xpGoal*100)+'%';ui.gearXpText.textContent=save.xp+' / '+xpGoal+' BOSS XP';
    let stats=gearStats();ui.gearStatsSummary.innerHTML='<span data-help-title="Health" data-help="Maximum damage Pappa Hammer can survive before unsecured expedition loot is lost."><small>HEALTH</small><b>'+maxHp()+'</b></span><span data-help-title="Damage" data-help="Power of close-range hammer impacts and physical shockwaves before critical hits."><small>DAMAGE</small><b>'+shotDamage()+'</b></span><span data-help-title="Reach" data-help="Distance from which coins, caches and nearby pickups are drawn toward Pappa Hammer."><small>REACH</small><b>'+magnetRange()+'</b></span><span data-help-title="Impact Speed" data-help="Faster close-range hammer strikes and faster Hammerstorm pulses."><small>IMPACT</small><b>+'+Math.round(stats.fire*100)+'%</b></span><span data-help-title="Critical Chance" data-help="Chance for a melee impact to deal amplified critical damage."><small>CRIT</small><b>'+Math.round(stats.crit*100)+'%</b></span>';
  }
  function renderGearLoadoutSlots(){
    gearPerf.slotRenders++;let displays=[
      {slot:'hat',display:'hat',name:'HELMET'},
      {slot:'scarf',display:'scarf',name:'NECK'},
      {slot:'coat',display:'coat',name:'CHEST'},
      {slot:'hammer',display:'hammer',name:'HAMMER'},
      {slot:'coat',display:'gloves',name:'GLOVES'},
      {slot:'boots',display:'boots',name:'BOOTS'}
    ];
    ui.gearLoadoutSlots.innerHTML='';
    for(const display of displays){
      let slot=display.slot,gear=equippedGear(slot),item=gearDefinition(gear),meta=GEAR_SLOT_META[slot],rarity=item&&LOOT_RARITIES[item.rarity],button=document.createElement('button');
      button.className='gearLoadoutSlot'+(item?' filled rarity'+rarity.rank:'')+(gearFilter===slot?' selected':'');button.setAttribute('data-slot',slot);button.setAttribute('data-display-slot',display.display);button.style.setProperty('--gear-color',rarity?rarity.color:'#596a84');
      button.setAttribute('aria-label',item?display.name+': '+item.name+'. Tap to remove.':'Empty '+display.name+' slot');if(gear){button.setAttribute('data-item',gear.uid);button.setAttribute('data-info-ready','');button.draggable=!mobileArmory()}else{button.setAttribute('data-help-title','Empty '+display.name+' Slot');button.setAttribute('data-help',display.display==='gloves'?'Gloves are visually linked to chest gear. Equip a chest item to update both areas.':'Equip compatible '+meta.name.toLowerCase()+' gear here.')}
      button.innerHTML='<i>'+(item?gearArtMarkup(gear,'small'):'<span class="gearSlotSilhouette">'+meta.icon+'</span>')+'</i><span><small>'+display.name+'</small><b>'+(item?item.name:'EMPTY')+'</b>'+(item?'<em>LEVEL '+gear.level+' \u00B7 EQUIPPED</em>':'')+'</span>';
      button.addEventListener('click',()=>{if(mobileArmory()&&gear)unequipGearSlot(slot);else setGearFilter(slot)});ui.gearLoadoutSlots.appendChild(button)
    }
    if(!ui.gearCharacterStage.querySelector('.gearEquipHint')){let hint=document.createElement('span');hint.className='gearEquipHint';hint.textContent='DROP TO EQUIP';ui.gearCharacterStage.appendChild(hint)}
  }
  function selectedGear(){return save.gear.find(gear=>gear.uid===selectedGearUid)}
  function renderMobileGearSelection(){
    let gear=selectedGear(),item=gearDefinition(gear);ui.mobileGearSelection.classList.toggle('empty',!item);ui.mobileGearSelectionArt.innerHTML='';ui.mobileGearEquip.disabled=!item;
    if(!item){ui.mobileGearSelectionMeta.textContent='SELECT GEAR';ui.mobileGearSelectionName.textContent='TAP AN ITEM TO INSPECT';ui.mobileGearSelectionPower.textContent='';ui.mobileGearEquip.textContent='EQUIP';return}
    let rarity=LOOT_RARITIES[item.rarity],equipped=gearIsEquipped(gear),worn=equippedGear(item.slot),delta=Math.round((gearScore(gear)-(worn&&worn.uid!==gear.uid?gearScore(worn):0))*10)/10;ui.mobileGearSelection.style.setProperty('--gear-color',rarity.color);ui.mobileGearSelectionArt.innerHTML=gearArtMarkup(gear,'small');ui.mobileGearSelectionMeta.textContent=rarity.name+' \u00B7 '+GEAR_SLOT_META[item.slot].name;ui.mobileGearSelectionName.textContent=item.name;ui.mobileGearSelectionPower.textContent=equipped?'CURRENTLY EQUIPPED':!worn?'OPEN SLOT \u00B7 '+Math.round(gearScore(gear))+' POWER':(delta>=0?'+':'')+delta+' POWER VS EQUIPPED';ui.mobileGearSelectionPower.className=equipped?'current':delta>0?'gain':delta<0?'loss':'same';ui.mobileGearEquip.textContent=equipped?'REMOVE':'EQUIP'
  }
  function renderGearSelection(){let copies=gearCopyCounts();renderGearDetail(selectedGear(),copies);renderMobileGearSelection()}
  function updateGearToolbarState(items){
    let sort=GEAR_SORTS.find(entry=>entry.id===gearSort)||GEAR_SORTS[0],slotNames={all:'ALL GEAR',hat:'HELMETS',scarf:'NECK',coat:'CHEST',hammer:'HAMMERS',boots:'BOOTS'},rarity=gearRarityFilter==='all'?'':LOOT_RARITIES[gearRarityFilter].name+' ';ui.gearSortLabel.textContent=sort.name;ui.mobileGearSortLabel.textContent=sort.name;ui.mobileGearFilterLabel.textContent=rarity+(slotNames[gearFilter]||'ALL GEAR');ui.gearInventorySummary.textContent='SHOWING '+items.length+' OF '+inventoryCount()+'  \u00B7  BAG VALUE $'+inventoryValue();renderSellFilteredButton(filteredGearSaleSummary())
  }
  function updateGearInventoryStates(){
    for(const [uid,entry] of gearItemNodes){let gear=save.gear.find(item=>item.uid===uid);if(!gear)continue;let equipped=gearIsEquipped(gear),selected=uid===selectedGearUid;entry.classList.toggle('equipped',equipped);entry.classList.toggle('selected',selected);entry.setAttribute('aria-selected',selected?'true':'false');entry.draggable=!mobileArmory();let art=entry.querySelector('.gearBagArt'),mark=art&&art.querySelector('.gearWornMark');if(equipped&&!mark&&art){mark=document.createElement('i');mark.className='gearWornMark';mark.innerHTML='&#128274;';art.appendChild(mark)}else if(!equipped&&mark)mark.remove()}
  }
  function renderGearInventoryArea(){
    gearPerf.gridRenders++;let indexes=new Map(save.gear.map((gear,index)=>[gear.uid,index])),copies=gearCopyCounts(),items=save.gear.filter(gearMatchesFilters).sort(gearSortComparator(indexes));
    if(!items.some(gear=>gear.uid===selectedGearUid))selectedGearUid=(items.find(gearIsEquipped)||items[0]||{}).uid||null;
    gearItemNodes.clear();ui.gearGrid.innerHTML='';
    for(const gear of items){
      let item=gearDefinition(gear),rarity=LOOT_RARITIES[item.rarity],equipped=gearIsEquipped(gear),selected=gear.uid===selectedGearUid,entry=document.createElement('button'),copyCount=copies[gear.itemId]||1;
      entry.className='gearBagSlot rarity'+rarity.rank+(equipped?' equipped':'')+(selected?' selected':'');entry.style.setProperty('--gear-color',rarity.color);entry.style.setProperty('--gear-glow',rarity.glow);entry.setAttribute('data-item',gear.uid);entry.setAttribute('data-info-ready','');entry.setAttribute('role','option');entry.setAttribute('aria-selected',selected?'true':'false');entry.draggable=!mobileArmory();
      entry.innerHTML='<span class="gearBagArt">'+gearArtMarkup(gear,'bag')+(copyCount>1?'<b class="gearCopyCount">x'+copyCount+'</b>':'')+(equipped?'<i class="gearWornMark">&#128274;</i>':'')+'</span><span class="gearBagSlotMeta"><b>LV '+gear.level+'</b><small>'+Math.round(gearScore(gear))+' PWR</small></span><em class="gearBagSlotName">'+item.name+'</em>';
      entry.addEventListener('click',event=>activateGearEntry(event,gear));entry.addEventListener('dblclick',event=>{if(mobileArmory())return;event.preventDefault();equipGear(gear.uid)});entry.addEventListener('contextmenu',event=>{event.preventDefault();if(!mobileArmory())equipGear(gear.uid)});ui.gearGrid.appendChild(entry);gearItemNodes.set(gear.uid,entry)
    }
    ui.gearEmpty.classList.toggle('show',items.length===0);updateGearToolbarState(items);renderGearSelection()
  }
  function refreshEquippedGearUI(){
    gearPerf.incrementalRenders++;renderBaseGear();updateGearTurntable();renderGearProgressAndStats();renderGearLoadoutSlots();renderSetSummary();updateGearInventoryStates();renderGearRaritySummary();renderGearSelection()
  }
  function renderGearLocker(){
    gearPerf.fullRenders++;renderBaseGear();updateGearTurntable();renderGearProgressAndStats();renderGearLoadoutSlots();renderSetSummary();renderGearFilters();renderGearRaritySummary();renderGearInventoryArea()
  }
  function openGearLocker(slot){gearFilter=slot||'all';gearRarityFilter='all';selectedGearUid=(GEAR_SLOTS.map(equippedGear).filter(Boolean).sort((a,b)=>gearScore(b)-gearScore(a))[0]||save.gear[0]||{}).uid||null;resetFilteredSaleArm();setGearView();renderGearLocker();ui.gearOverlay.classList.add('show')}
  function closeGearMobileSheet(){gearMobileSheetMode=null;ui.gearMobileSheet.classList.remove('show');ui.gearMobileSheet.setAttribute('aria-hidden','true')}
  function renderGearMobileSheet(){
    ui.gearMobileSheetOptions.innerHTML='';if(gearMobileSheetMode==='sort'){ui.gearMobileSheetTitle.textContent='SORT GEAR';for(const sort of GEAR_SORTS){let button=document.createElement('button');button.className=gearSort===sort.id?'active':'';button.innerHTML='<span>'+sort.name+'</span><i>'+(gearSort===sort.id?'CHECK':'')+'</i>';button.addEventListener('click',()=>{setGearSort(sort.id);closeGearMobileSheet()});ui.gearMobileSheetOptions.appendChild(button)}let reset=document.createElement('button');reset.className='reset';reset.innerHTML='<span>RESET TO POWER</span>';reset.addEventListener('click',()=>{setGearSort('power');closeGearMobileSheet()});ui.gearMobileSheetOptions.appendChild(reset);return}
    ui.gearMobileSheetTitle.textContent='FILTER GEAR';let slotLabels={all:'ALL GEAR',hat:'HELMETS',scarf:'NECK',coat:'CHEST',hammer:'HAMMERS',boots:'BOOTS'},slotGroup=document.createElement('div');slotGroup.className='gearSheetGroup';slotGroup.innerHTML='<small>GEAR TYPE</small>';for(const slot of ['all',...GEAR_SLOTS]){let button=document.createElement('button');button.className=gearFilter===slot?'active':'';button.textContent=slotLabels[slot];button.addEventListener('click',()=>{setGearFilter(slot);renderGearMobileSheet()});slotGroup.appendChild(button)}let rarityGroup=document.createElement('div');rarityGroup.className='gearSheetGroup raritySheetGroup';rarityGroup.innerHTML='<small>RARITY</small>';for(const rarityId of ['all',...Object.keys(LOOT_RARITIES)]){let button=document.createElement('button'),rarity=LOOT_RARITIES[rarityId];button.className=gearRarityFilter===rarityId?'active':'';button.textContent=rarityId==='all'?'ALL RARITIES':rarity.name;if(rarity)button.style.setProperty('--sheet-color',rarity.color);button.addEventListener('click',()=>{setGearRarityFilter(rarityId);renderGearMobileSheet()});rarityGroup.appendChild(button)}let actions=document.createElement('div');actions.className='gearSheetActions';let reset=document.createElement('button');reset.className='reset';reset.textContent='RESET';reset.addEventListener('click',()=>{gearFilter='all';gearRarityFilter='all';renderGearFilters();renderGearRaritySummary();renderGearInventoryArea();renderGearMobileSheet()});let done=document.createElement('button');done.className='done';done.textContent='DONE';done.addEventListener('click',closeGearMobileSheet);actions.append(reset,done);ui.gearMobileSheetOptions.append(slotGroup,rarityGroup,actions)
  }
  function openGearMobileSheet(mode){gearMobileSheetMode=mode;renderGearMobileSheet();ui.gearMobileSheet.classList.add('show');ui.gearMobileSheet.setAttribute('aria-hidden','false')}
  function closeGearLocker(){hideGearHover();closeGearMobileSheet();ui.gearOverlay.classList.remove('show');refreshBase()}
  function refreshResourceCounters(){ui.bank.textContent=Math.floor(save.scrap);ui.materials.textContent=save.materials;ui.legendaryCores.textContent=save.legendaryCores+' CORE'+(save.legendaryCores===1?'':'S');ui.cores.textContent=save.cores;ui.best.textContent=save.best;ui.pappaLevel.textContent=save.level}
  function refreshBase(){
    refreshResourceCounters();let secured=MODULE_IDS.reduce((sum,id)=>sum+save.blueprints[id].copies,0),gearCount=inventoryCount();ui.scene.classList.toggle('evolved1',gearCount>=1||secured>=1);ui.scene.classList.toggle('evolved2',gearCount>=5||secured>=4);ui.scene.classList.toggle('evolved3',gearCount>=12||secured>=9);renderBaseGear();
    ui.selectedMapLabel.textContent=activeMap().name;
    if(save.starter){ui.starterIcon.textContent=MODULES[save.starter].icon;ui.starterName.textContent=MODULES[save.starter].name.toUpperCase()+' '+blueprintMark(blueprintTier(save.starter))}else{ui.starterIcon.textContent='+';ui.starterName.textContent='NONE EQUIPPED'}
    let vault=vaultProgress(),ready=contractReady(),progress=vault.total*100;ui.contractReadout.textContent=Math.min(VAULT_SEALS,vault.seals)+'/'+VAULT_SEALS+' SEALS \u00B7 '+Math.min(VAULT_RELICS,vault.relics)+'/'+VAULT_RELICS+' RELICS';ui.contractFill.style.width=progress+'%';ui.contractTracker.style.setProperty('--vault-progress',progress+'%');ui.contractTracker.classList.toggle('warming',progress>=70&&!ready);ui.contractTracker.classList.toggle('imminent',progress>=90&&!ready);ui.contractTracker.classList.toggle('complete',ready);ui.contractTracker.setAttribute('aria-disabled',ready?'false':'true');ui.contractTitle.textContent=ready?'THE GRAND VAULT IS READY':progress>=70?'THE GRAND VAULT STIRS':'CHARGE THE GRAND VAULT';ui.contractPrompt.textContent=ready?'TAP TO OPEN':progress>=90?'ALMOST OPEN':progress>=70?'POWER RISING':'VAULT '+Math.floor(progress)+'%';
  }
  function renderWardenSchematics(){
    ui.wardenTechGrid.innerHTML='';for(const id of SCHEMATIC_IDS){let def=BOSS_SCHEMATICS[id],level=schematicLevel(id),entry=document.createElement('article');entry.className='wardenTech'+(level?' recovered':'')+(id==='thermal'?' tyrantTech':'');entry.tabIndex=0;entry.setAttribute('data-help-title',def.name);entry.setAttribute('data-help',def.desc+' '+(level?'Current permanent effect: '+schematicEffect(id,level)+'.':'Defeat the matching champion and choose this trophy to recover it.'));entry.innerHTML='<i>'+def.icon+'</i><span><strong>'+def.name+'</strong><small>'+def.desc+'</small></span><em>'+(level?schematicEffect(id,level):'NOT RECOVERED')+'</em><b>RANK '+level+'/'+def.max+'</b>';ui.wardenTechGrid.appendChild(entry)}
  }
  function renderBlueprints(){
    ui.blueprintGrid.innerHTML='';ui.starterReadout.textContent=save.starter?MODULES[save.starter].name+' '+blueprintMark(blueprintTier(save.starter))+'  \u00B7  '+starterEffect(save.starter,starterPower(save.starter)):'No relic equipped';renderWardenSchematics();
    for(const id of MODULE_IDS){let def=MODULES[id],record=save.blueprints[id],tier=blueprintTier(id),unlocked=tier>0,entry=document.createElement('article');entry.className='blueprintEntry '+(unlocked?'unlocked':'locked')+(save.starter===id?' equipped':'');entry.tabIndex=0;entry.setAttribute('data-help-title',def.name);entry.setAttribute('data-help',def.desc+' '+(unlocked?'Current Lucky Relic power is '+Math.round(starterPower(id)*100)+'%. Recover duplicate copies and polish it to improve the effect.':'Recover this relic during an expedition to unlock it permanently.'));
      let power=starterPower(id),output=Math.round(power*100),nextPower=tier<3?starterPowerAt(tier+1,record.tune):power,nextText=tier<3?'NEXT MASTERY  '+Math.round(nextPower*100)+'%  \u00B7  '+starterEffect(id,nextPower):'RELIC MASTERY COMPLETE';entry.style.setProperty('--copy-progress',blueprintProgress(record,tier)+'%');entry.innerHTML='<i>'+def.icon+'</i><div class="blueprintHeading"><strong>'+def.name+'</strong><b>'+blueprintMark(tier)+'</b></div><p>'+def.desc+'</p><div class="blueprintOutput"><span>LUCKY EFFECT <em>'+(unlocked?output+'% POWER':'LOCKED')+'</em></span><b>'+starterEffect(id,power)+'</b></div><div class="copyTrack"><i></i></div><div class="blueprintRecovery"><span>'+blueprintRecoveryText(record,tier)+'</span><small>'+nextText+'</small></div><div class="blueprintMeta"><span>POLISH '+record.tune+'/2  \u00B7  +'+record.tune*10+'% LUCKY POWER</span></div>';
      let actions=document.createElement('div');actions.className='benchActions';let equip=document.createElement('button');equip.className='equipButton';equip.textContent=save.starter===id?'REMOVE LUCKY RELIC':'EQUIP LUCKY RELIC';equip.setAttribute('data-help-title',save.starter===id?'Remove Lucky Relic':'Equip Lucky Relic');equip.setAttribute('data-help',unlocked?'Place this permanent relic in one cargo slot at the start of every expedition. Equipping another relic replaces it.':'Recover one copy of this relic before it can be equipped.');equip.disabled=!unlocked;equip.addEventListener('click',()=>equipStarter(save.starter===id?null:id));let tune=document.createElement('button');tune.className='tuneButton';let cost=tuneCost(id);tune.textContent=record.tune>=2?'POLISH MAX':'POLISH +10%  $ '+cost;tune.setAttribute('data-help-title','Polish '+def.name);tune.setAttribute('data-help',record.tune>=2?'This relic has reached its maximum permanent polish.':'Spend $'+cost+' to permanently add 10% Lucky Relic power. Copy mastery and polish stack.');tune.disabled=!unlocked||record.tune>=2||save.scrap<cost;tune.addEventListener('click',()=>tuneBlueprint(id));actions.append(equip,tune);entry.appendChild(actions);ui.blueprintGrid.appendChild(entry);
    }
    let extractRate=save.stats.runs?Math.round(save.stats.extractions/save.stats.runs*100)+'%':'0%',averageRun=save.stats.runs?formatTime(save.stats.totalTime/save.stats.runs):'0:00',stats=[['RUNS',save.stats.runs,'Expeditions started across this save.'],['EXTRACT RATE',extractRate,'Percentage of expeditions that ended with a successful extraction.'],['BOSSES',save.stats.bosses,'Tower champions defeated across every expedition.'],['AVG RUN',averageRun,'Average duration of all completed expeditions.']];ui.careerStats.innerHTML='';for(const pair of stats){let d=document.createElement('div');d.tabIndex=0;d.setAttribute('data-help-title',pair[0].replace(/\b\w/g,letter=>letter.toUpperCase()));d.setAttribute('data-help',pair[2]);d.innerHTML='<span>'+pair[0]+'</span><b>'+pair[1]+'</b>';ui.careerStats.appendChild(d)}
  }
  function openBlueprints(){renderBlueprints();ui.blueprintOverlay.classList.add('show')}
  function closeBlueprints(){ui.blueprintOverlay.classList.remove('show');refreshBase()}
  function equipStarter(id){save.starter=id;persist();renderBlueprints();refreshBase();sound('pickup')}
  function tuneBlueprint(id){let record=save.blueprints[id],cost=tuneCost(id);if(blueprintTier(id)<1||record.tune>=2||save.scrap<cost)return;save.scrap-=cost;record.tune++;persist();refreshBase();renderBlueprints();notice(MODULES[id].name.toUpperCase()+' POLISHED','#d6aa58');sound('upgrade')}

  function renderMapAtlas(){
    ui.mapPappaLevel.textContent=save.level;ui.mapGrid.innerHTML='';let next=EXPEDITION_MAP_IDS.map(id=>EXPEDITION_MAPS[id]).find(map=>save.level<map.minLevel);ui.nextMapUnlock.textContent=next?'NEXT MAP AT LEVEL '+next.minLevel:'ALL DESTINATIONS UNLOCKED';
    for(const id of EXPEDITION_MAP_IDS){
      let map=EXPEDITION_MAPS[id],unlocked=save.level>=map.minLevel,selected=activeMap()===map,previewLevel=Math.max(save.level,map.minLevel),odds=bossGearOdds(previewLevel,0,map,null),baseOdds=bossGearOdds(previewLevel,0,EXPEDITION_MAPS.guild,null),bonusPoints=Math.max(0,Math.round((odds.high-baseOdds.high)*100)),button=document.createElement('button');
      button.className='mapCard map-'+id+(unlocked?' unlocked':' locked')+(selected?' selected':'');button.disabled=!unlocked;button.style.setProperty('--map-accent',map.accent);button.setAttribute('data-help-title',map.name);button.setAttribute('data-help',unlocked?map.desc+' Epic-or-better boss gear starts at '+Math.round(odds.high*100)+'% here, '+(bonusPoints?bonusPoints+' points above the Frontier.':'before route and deeper-ascent bonuses.')+' Extra boss gear drop chance: '+Math.round(map.dropBonus*100)+'%.':'Reach Pappa Level '+map.minLevel+' to unlock this destination.');
      button.innerHTML='<span class="mapVista"><i>'+map.mark+'</i><em>'+(unlocked?map.tag:'LOCKED')+'</em></span><span class="mapCardCopy"><small>'+(unlocked?'LEVEL '+map.minLevel+' AREA':'REQUIRES LEVEL '+map.minLevel)+'</small><b>'+map.name+'</b><em>'+map.desc+'</em></span><span class="mapRewards"><i><small>ENEMIES</small><b>x'+map.enemyHp.toFixed(2)+'</b></i><i><small>COINS</small><b>x'+map.coinValue.toFixed(2)+'</b></i><i><small>EPIC+ ODDS</small><b>'+Math.round(odds.high*100)+'%</b></i><i><small>EXTRA DROP</small><b>'+Math.round(map.dropBonus*100)+'%</b></i></span><strong>'+(unlocked?(selected?'SELECTED  \u00B7  SET OUT':'CHOOSE DESTINATION'):'REACH LV '+map.minLevel)+'</strong>';if(unlocked)button.addEventListener('click',()=>selectMap(id));ui.mapGrid.appendChild(button)
    }
  }
  function openMapAtlas(){renderMapAtlas();ui.mapOverlay.classList.add('show')}
  function closeMapAtlas(){ui.mapOverlay.classList.remove('show')}
  function selectMap(id){let map=EXPEDITION_MAPS[id];if(!map||save.level<map.minLevel)return;save.selectedMap=id;persist();refreshBase();closeMapAtlas();if(!save.seenIntro)ui.briefingOverlay.classList.add('show');else startRun()}
  function requestStart(){openMapAtlas()}
  function completeBriefing(){save.seenIntro=true;persist();ui.briefingOverlay.classList.remove('show');startRun()}
  function updateZoneHud(){let zone=zoneAt(depth);ui.zoneDepth.textContent='FLOOR '+expeditionFloor()+' \u00B7 '+zone.threat;ui.zoneName.textContent=zone.name;ui.zoneHud.classList.toggle('boss',bossActive)}
  function updateCargoHud(){ui.cargoSlots.innerHTML='';for(let i=0;i<3;i++){let slot=document.createElement('div'),m=cargo[i],power=m?Math.round((m.power||1)*100)/100:0;slot.className='cargoSlot'+(m?' filled':'')+(m&&m.rareRecoveries?' rare':'')+(power>1?' fused':'');slot.tabIndex=0;if(m){let def=MODULES[m.id];slot.innerHTML='<span>'+def.icon+'</span>'+(power>1?'<b class="cargoRank">'+power.toFixed(power%1?1:0)+'</b>':'');slot.setAttribute('data-help-title',(m.starter?'Lucky ':'')+def.name);slot.setAttribute('data-help',def.desc+' Current expedition power: '+power+'. Matching relics fuse and increase this effect.')}else{slot.textContent='\u00B7';slot.setAttribute('data-help-title','Empty Relic Slot');slot.setAttribute('data-help','Find a relic cache during this expedition to fill this temporary slot.')}ui.cargoSlots.appendChild(slot)}}
  function applyCargoEffects(newModule){if(!player)return;let oldMax=player.maxHp||maxHp(),stats=cargoStats();player.maxHp=Math.max(40,Math.floor(maxHp()*stats.hp));player.hp=Math.min(player.maxHp,Math.max(1,player.hp*(player.maxHp/oldMax)));if(newModule&&newModule.id==='plating')player.shields=Math.min(stats.shields,(player.shields||0)+Math.max(1,Math.floor(newModule.power||(newModule.rare?2:1))));else player.shields=Math.min(stats.shields,player.shields||0);if(stats.burst<=0)player.burstCharge=0;updateCargoHud();updateHud()}
  const ARENA_OBSTACLE_LAYOUT=[
    [430,340,270,50],[755,355,54,220],[1090,255,250,50],[1685,350,300,50],[2010,530,56,250],
    [365,765,56,270],[610,1050,300,52],[890,1340,270,50],[1485,1320,320,52],[1995,1160,56,270],
    [1890,855,285,50],[520,1370,210,48],[2180,780,180,48],[1470,250,170,48]
  ];
  function isGuildMap(){return (save.selectedMap||'guild')==='guild'}
  function isDreamworldMap(){return (save.selectedMap||'guild')==='moonfall'}
  function isSkyglassMap(){return (save.selectedMap||'guild')==='skyglass'}
  function queryValue(name){let search=location&&location.search||'',match=search.match(new RegExp('(?:^|[?&])'+name+'=([^&]+)'));return match?decodeURIComponent(match[1]):''}
  function hashMapSeed(value){let hash=2166136261,text=String(value);for(let index=0;index<text.length;index++){hash^=text.charCodeAt(index);hash=Math.imul(hash,16777619)}return (hash>>>0)||1}
  function nextGuildSeed(){let requested=Number(queryValue('mapSeed')),mapId=save.selectedMap||'guild';if(Number.isFinite(requested)&&requested>0)return Math.floor(requested)>>>0;return hashMapSeed(mapId+':'+(save.stats&&save.stats.runs||0)+':'+save.level+':'+save.best+':'+save.bestRisk)}
  function mapCoverAsset(mapId,index){return mapId==='moonfall'?DREAMWORLD_COVER_IDS[(index*5+2)%DREAMWORLD_COVER_IDS.length]:mapId==='skyglass'?SKYGLASS_COVER_IDS[(index*5+1)%SKYGLASS_COVER_IDS.length]:null}
  function buildFixedArenaObstacles(){
    let mapId=save.selectedMap||'guild';
    obstacles=ARENA_OBSTACLE_LAYOUT.map((entry,index)=>({x:entry[0],y:entry[1],w:entry[2],h:entry[3],style:index%4,mapId,assetId:mapCoverAsset(mapId,index)}))
  }
  function buildArenaObstacles(seedOverride){
    guildTerrain=null;currentMapSeed=0;guildSpawnCursor=0;
    if(guildTerrainApi&&queryValue('fixedArena')!=='1'){
      let mapId=save.selectedMap||'guild';
      currentMapSeed=guildTerrainApi.normalizeSeed(seedOverride||nextGuildSeed());
      let generated=guildTerrainApi.generate(currentMapSeed,mapId);
      if(generated&&generated.validation&&generated.validation.valid){
        guildTerrain=generated;
        obstacles=generated.obstacles.map((obstacle,index)=>Object.assign({},obstacle,{mapId,assetId:mapCoverAsset(mapId,index)}));
        return
      }
    }
    buildFixedArenaObstacles()
  }
  function buildAdventureDecor(){
    if(guildTerrain){
      let mapId=save.selectedMap||'guild',assetIds=mapId==='moonfall'?['violetCrystals','dreamLotus','moonLantern','floatingRuinPillar']:mapId==='skyglass'?['coralGarden','jellyfishLantern','floatingReefPillar']:null;
      decor=guildTerrain.decor.map((entry,index)=>{
        let item=Object.assign({},entry,{mapId});
        if(assetIds){
          item.assetId=assetIds[(index*3+entry.type)%assetIds.length];
          let meta=mapId==='moonfall'?DREAMWORLD_PROP_META[item.assetId]:SKYGLASS_PROP_META[item.assetId];
          item.w=Math.min(meta.width,44+(index%3)*8);item.r=item.w*1.18;item.phase=entry.rot+index*.41;item.flip=index%3===0;item.solid=false
        }
        return item
      });
      return
    }
    if(isDreamworldMap()){
      decor=DREAMWORLD_DECOR_LAYOUT.map((entry,index)=>{let meta=DREAMWORLD_PROP_META[entry[0]],width=entry[3]||meta.width,solid=['crescentArch','starMapObelisk','dreamTree','brokenCrescentShrine'].includes(entry[0]);return {assetId:entry[0],x:entry[1],y:entry[2],w:width,r:width*1.2,phase:entry[4]||index*.47,flip:!!entry[5],rot:0,solid}});
      let accents=['violetCrystals','dreamLotus','moonLantern','floatingRuinPillar','starMapObelisk'];
      let scatter=seed=>{let value=Math.sin(seed*12.9898)*43758.5453;return value-Math.floor(value)};
      for(let i=0;i<28;i++){let assetId=accents[(i*3+1)%accents.length],x=250+(i%7)*315+(scatter(i+1)-.5)*150,y=220+Math.floor(i/7)*360+(scatter(i+101)-.5)*170,width=(assetId==='moonLantern'?48:assetId==='floatingRuinPillar'?54:assetId==='starMapObelisk'?58:64)+(i%3)*5;decor.push({assetId,x,y,w:width,r:width*1.2,phase:i*.63,flip:i%3===0,rot:0})}
      return
    }
    if(isSkyglassMap()){
      decor=SKYGLASS_DECOR_LAYOUT.map((entry,index)=>{let meta=SKYGLASS_PROP_META[entry[0]],width=entry[3]||meta.width,solid=['pearlShellShrine','seaGlassArch','tideCompassPedestal','celestialKoiStatue','spiralShellPortal'].includes(entry[0]);return {assetId:entry[0],x:entry[1],y:entry[2],w:width,r:width*1.18,phase:entry[4]||index*.53,flip:!!entry[5],rot:0,solid}});
      return
    }
    let mapId=save.selectedMap||'guild',seed=EXPEDITION_MAP_IDS.indexOf(mapId)+1,scatter=value=>{let n=Math.sin((value+seed*71)*12.9898)*43758.5453;return n-Math.floor(n)};
    for(let i=0;i<54;i++){let x=95+scatter(i+1)*(WORLD.w-190),y=95+scatter(i+101)*(WORLD.h-190),r=10+scatter(i+211)*22;if(Math.hypot(x-WORLD.w/2,y-WORLD.h/2)<245||pointBlocked(x,y,r+12))continue;decor.push({x,y,r,type:i%4,variant:i%3,rot:scatter(i+307)*Math.PI*2,mapId})}
  }
  function obstacleBounds(o,pad){pad=pad||0;return {left:o.x-o.w/2-pad,right:o.x+o.w/2+pad,top:o.y-o.h/2-pad,bottom:o.y+o.h/2+pad}}
  function decorCollision(d){let width=d.w||0;return d.solid?{x:d.x,y:d.y-width*.07,w:Math.max(28,width*.42),h:Math.max(20,width*.2),decor:d}:null}
  function rebuildCollisionMap(){collisionMap=obstacles.slice();for(const d of decor){let body=decorCollision(d);if(body)collisionMap.push(body)}}
  function collisionBodies(){return collisionMap.length?collisionMap:obstacles}
  function pointBlocked(x,y,r){for(const o of collisionBodies()){let b=obstacleBounds(o,r||0);if(x>b.left&&x<b.right&&y>b.top&&y<b.bottom)return true}return false}
  function projectileHitsCover(x,y,r){for(const o of collisionBodies()){let b=obstacleBounds(o),nx=Math.max(b.left,Math.min(b.right,x)),ny=Math.max(b.top,Math.min(b.bottom,y)),dx=x-nx,dy=y-ny;if(dx*dx+dy*dy<(r||1)*(r||1))return o}return null}
  function lineBlockedByCover(x1,y1,x2,y2,pad){let distance=Math.hypot(x2-x1,y2-y1),steps=Math.max(2,Math.ceil(distance/18));for(let step=1;step<steps;step++){let t=step/steps;if(pointBlocked(x1+(x2-x1)*t,y1+(y2-y1)*t,pad||0))return true}return false}
  function moveAroundCover(entity,dx,dy){let blocked=false,bodies=collisionBodies();entity.x+=dx;for(const o of bodies){let b=obstacleBounds(o,entity.r),inside=entity.x>b.left&&entity.x<b.right&&entity.y>b.top&&entity.y<b.bottom;if(!inside)continue;blocked=true;entity.x=dx>0?b.left:dx<0?b.right:(Math.abs(entity.x-b.left)<Math.abs(b.right-entity.x)?b.left:b.right)}entity.y+=dy;for(const o of bodies){let b=obstacleBounds(o,entity.r),inside=entity.x>b.left&&entity.x<b.right&&entity.y>b.top&&entity.y<b.bottom;if(!inside)continue;blocked=true;entity.y=dy>0?b.top:dy<0?b.bottom:(Math.abs(entity.y-b.top)<Math.abs(b.bottom-entity.y)?b.top:b.bottom)}entity.x=Math.max(entity.r,Math.min(WORLD.w-entity.r,entity.x));entity.y=Math.max(entity.r,Math.min(WORLD.h-entity.r,entity.y));return blocked}
  function openArenaPosition(x,y,r){x=Math.max(r,Math.min(WORLD.w-r,x));y=Math.max(r,Math.min(WORLD.h-r,y));if(!pointBlocked(x,y,r))return {x,y};for(let ring=48;ring<=360;ring+=48)for(let i=0;i<12;i++){let a=i*Math.PI/6,cx=Math.max(r,Math.min(WORLD.w-r,x+Math.cos(a)*ring)),cy=Math.max(r,Math.min(WORLD.h-r,y+Math.sin(a)*ring));if(!pointBlocked(cx,cy,r))return {x:cx,y:cy}}return {x:WORLD.w/2,y:WORLD.h/2}}
  function guildRoutePosition(level){
    if(!guildTerrain)return null;
    let index=Math.max(0,Math.min(guildTerrain.routePoints.length-1,Math.ceil(level||1))),point=guildTerrain.routePoints[index];
    return point?openArenaPosition(point.x,point.y,44):null
  }
  function updateMapSeedDebug(){
    if(!ui.mapSeedDebug)return;
    ui.mapSeedDebug.textContent=guildTerrain?'SEED '+currentMapSeed:'FIXED';
    ui.mapSeedDebug.classList.toggle('show',mode==='run')
  }
  function startRun(seedOverride){
    cargo=[];if(save.starter)cargo.push({id:save.starter,rare:false,starter:true,power:starterPower(save.starter),recoveries:0,rareRecoveries:0});
    player={x:WORLD.w/2,y:WORLD.h/2,r:18,hp:maxHp(),maxHp:maxHp(),speed:255,fire:0,inv:0,angle:0,facing:1,dashCd:0,dashTime:0,dashX:1,dashY:0,lastX:1,lastY:0,shields:baseShields(),guardCd:0,recoil:0,attackAnim:0,attackDuration:.24,animClock:0,volley:0,burstCharge:0,thermalCharges:0,ramHits:new Set(),signatureCrits:0,phantomStrike:0,travelCharge:0,fateSaved:false,vaultWardAwarded:0,spinCd:0,spinTime:0,spinLeap:0,spinLeapMax:0,spinAutoRemaining:0,spinAutoDuration:0,spinManual:false,spinAngle:0,spinPulse:0,spinHits:0,spinKills:0,spinCoins:0,spinPack:0,spinPeakPack:0,spinHeal:0,spinLifeTargets:new Set(),blackHoleAge:0,blackHolePulse:0};
    enemies=[];pendingStrikes=[];enemyBullets=[];lootDrops=[];particles=[];effects=[];hazards=[];decor=[];obstacles=[];collisionMap=[];caches=[];lootBag={};elapsed=0;runTime=0;spawnClock=.28;hazardClock=3.5;runScrap=0;depth=1;riskTier=0;routeDecision=false;route=null;moduleDecision=false;depthPulse=0;extracting=0;shake=0;flash=0;hitStop=0;paused=false;bossActive=false;bossDefeated=false;bossEntity=null;bossLootChest=null;pendingWardenReward=null;expeditionCycle=0;bossRunClears=0;postBossDecision=false;postBossIntent=null;bossLootRewards=[];bossLootSelected=0;bossLootResolved=[];bossLootPhase='idle';runGearEquipBackups={};bossExtraction=false;zoneEventTriggered=false;runStats={damage:0,kills:0,elites:0,risks:0,items:0,legendary:0,bosses:0,modules:[],warden:null,route:null,boss:null,map:save.selectedMap};
    buildArenaObstacles(seedOverride);buildAdventureDecor();rebuildCollisionMap();if(guildTerrain){let entrance=openArenaPosition(guildTerrain.entrance.x,guildTerrain.entrance.y,player.r+5);player.x=entrance.x;player.y=entrance.y;player.lastX=1;player.lastY=0;player.angle=0}resetWaveDirector(.34);triggerFloorSignatures();
    let firstCache=guildRoutePosition(1);spawnCache(firstCache?firstCache.x:player.x+190,firstCache?firstCache.y:player.y+25,false,false);ui.extractOverlay.classList.remove('show');ui.bossLootOverlay.classList.remove('show');ui.routeOverlay.classList.remove('show');ui.moduleOverlay.classList.remove('show');ui.resultOverlay.classList.remove('show');ui.lootToast.classList.remove('show','legendary');ui.bossHud.classList.remove('show','tyrant');ui.cargoHud.classList.remove('bossHidden');ui.depthRoute.classList.remove('bossHidden','furnace','dynamo');ui.expedition.classList.remove('legendaryCargo');ui.extract.classList.remove('hotLoot');ui.routeLabel.textContent=activeMap().short;ui.settingsOverlay.classList.remove('show');setView('run');applyCargoEffects(cargo[0]);updateCargoHud();updateZoneHud();updateRouteHud();updateMapSeedDebug();updateHud();save.stats.runs++;persist();let firstZone=zoneAt(1);runNotice(save.starter?MODULES[save.starter].name.toUpperCase()+' READY':firstZone.name,firstZone.accent);sound('start')
  }

  function showResult(survived,scrapAmount,reached,modules,newRecord,status,fieldData){
    fieldData=fieldData||{time:0,kills:0,damage:0,risks:0,items:0,loot:[]};let gear=(fieldData.loot||[]).filter(gearDefinition);ui.resultPanel.classList.toggle('lost',!survived);ui.resultTitle.textContent=status||(survived?'LOOT SECURED':'LOOT LOST');ui.resultScrap.textContent=survived?scrapAmount:'0';ui.resultDepth.textContent=reached;ui.resultTime.textContent=formatTime(fieldData.time);ui.resultKills.textContent=fieldData.kills;ui.resultDamage.textContent=fieldData.damage;ui.resultRisk.textContent=fieldData.risks;ui.resultItems.textContent=gear.length;ui.resultRecord.textContent=newRecord?'NEW FLOOR RECORD':'';ui.resultLoot.innerHTML='';ui.resultModules.innerHTML='';
    let counts={};for(const drop of gear){let item=gearDefinition(drop);counts[item.rarity]=(counts[item.rarity]||0)+1}let summary=Object.keys(LOOT_RARITIES).sort((a,b)=>LOOT_RARITIES[b].rank-LOOT_RARITIES[a].rank).filter(rarity=>counts[rarity]).map(rarity=>'<span style="--summary-color:'+LOOT_RARITIES[rarity].color+'"><b>'+counts[rarity]+'</b>'+LOOT_RARITIES[rarity].name+'</span>').join('');ui.resultLootSummary.innerHTML=gear.length?'<strong>'+(survived?'BOSS GEAR SECURED':'BOSS GEAR LOST')+'</strong><div>'+summary+'</div>':'<strong>NO BOSS GEAR THIS RUN</strong><small>Defeat a floor champion to earn equipment.</small>';
    for(const rarityId of Object.keys(LOOT_RARITIES).sort((a,b)=>LOOT_RARITIES[b].rank-LOOT_RARITIES[a].rank)){let drops=gear.filter(drop=>gearDefinition(drop).rarity===rarityId);if(!drops.length)continue;let rarity=LOOT_RARITIES[rarityId],group=document.createElement('section');group.className='resultLootGroup rarity'+rarity.rank+(survived?'':' lost');group.style.setProperty('--loot-color',rarity.color);group.innerHTML='<header><b>'+rarity.name+'</b><span>'+drops.length+' ITEM'+(drops.length===1?'':'S')+'</span></header>';let grid=document.createElement('div');for(const drop of drops){let item=gearDefinition(drop),set=item.setId&&SET_BY_ID[item.setId],card=document.createElement('article');card.className='resultGearCard rarity'+rarity.rank;card.tabIndex=0;card.setAttribute('data-item',drop.uid);card.setAttribute('data-info-ready','');card.innerHTML='<i>'+gearArtMarkup(drop,'card')+'</i><div><small>LEVEL '+drop.level+' \u00B7 '+GEAR_SLOT_META[item.slot].name+'</small><strong>'+item.name+'</strong>'+(set?'<em>'+set.mark+' '+set.name+' SET</em>':'')+'<p>'+formatGearStats(drop).join(' \u00B7 ')+'</p><span>'+gearQualityLabel(drop)+' \u00B7 $'+gearUnitValue(drop)+'</span></div>';bindGearHover(card,drop);grid.appendChild(card)}group.appendChild(grid);ui.resultLoot.appendChild(group)}
    let recovered=modules.filter(m=>!m.starter),reward=fieldData.wardenReward,map=EXPEDITION_MAPS[fieldData.map]||EXPEDITION_MAPS.guild,mapChip=document.createElement('span');mapChip.className='resultModule mapReward';mapChip.textContent=map.mark+'  '+map.name;ui.resultModules.appendChild(mapChip);if(reward){let chip=document.createElement('span');chip.className='resultModule wardenReward'+(survived?'':' lost');chip.textContent=reward==='dividend'?'MERCHANT GIFT  +'+CORE_DIVIDEND+' COINS':'BOSS TROPHY  '+BOSS_SCHEMATICS[reward].name.toUpperCase()+(survived?'  RANK '+fieldData.wardenRank:' LOST');ui.resultModules.appendChild(chip)}if(fieldData.route){let routeChip=document.createElement('span');routeChip.className='resultModule routeReward';routeChip.textContent=ROUTES[fieldData.route].name;ui.resultModules.appendChild(routeChip)}if(!recovered.length&&!reward){let empty=document.createElement('span');empty.className='resultModule';empty.textContent=survived?'No relics recovered':'Relics lost';ui.resultModules.appendChild(empty)}for(const m of recovered){let chip=document.createElement('span'),power=Math.round((m.power||1)*10)/10;chip.className='resultModule'+(survived?'':' lost');chip.textContent=MODULES[m.id].name+(power>1?'  POWER '+power:'');ui.resultModules.appendChild(chip)}ui.resultOverlay.classList.add('show');
  }
  function secureAtRiskGear(reportLoot){
    for(const gear of reportLoot){let stored=save.gear.find(entry=>entry.uid===gear.uid);if(stored)delete stored.atRisk;else{delete gear.atRisk;save.gear.push(gear)}save.lootFound[gear.itemId]=(save.lootFound[gear.itemId]||0)+1}
  }
  function discardAtRiskGear(){
    let risky=new Set(save.gear.filter(gear=>gear.atRisk).map(gear=>gear.uid));if(!risky.size)return;save.gear=save.gear.filter(gear=>!gear.atRisk);for(const slot of GEAR_SLOTS)if(risky.has(save.equipped[slot])){let backup=runGearEquipBackups[slot];save.equipped[slot]=backup&&save.gear.some(gear=>gear.uid===backup)?backup:null}paperDollKey='';paperDollPreviewCache.clear();refreshPaperDoll()
  }
  function returnBase(survived,status){
    let dividend=survived&&pendingWardenReward==='dividend'?CORE_DIVIDEND:0,reportScrap=runScrap,reportDepth=expeditionFloor(),reportCargo=cargo.map(m=>Object.assign({},m)),reportLoot=lootManifest().map(entry=>Object.assign({},entry,{stats:Object.assign({},entry.stats)})),itemCount=reportLoot.length,legendaryCount=reportLoot.filter(entry=>gearDefinition(entry).rarity==='legendary').length,reportData={time:Math.round(runTime),kills:runStats?runStats.kills:0,damage:runStats?Math.round(runStats.damage):0,risks:riskTier,bosses:bossRunClears,items:itemCount,legendary:legendaryCount,loot:reportLoot,map:runStats&&runStats.map||save.selectedMap,route,wardenReward:pendingWardenReward,wardenRank:0},newRecord=survived&&reportDepth>save.best,securedCores=survived?bossRunClears:0,wasComplete=save.contractComplete;
    if(survived){
      if(BOSS_SCHEMATICS[pendingWardenReward]){let def=BOSS_SCHEMATICS[pendingWardenReward];save.schematics[pendingWardenReward]=Math.min(def.max,schematicLevel(pendingWardenReward)+1);reportData.wardenRank=save.schematics[pendingWardenReward]}
      save.scrap+=reportScrap+dividend;save.best=Math.max(save.best,reportDepth);save.bestRisk=Math.max(save.bestRisk,riskTier);save.stats.extractions++;save.stats.totalScrap+=reportScrap;save.stats.itemsRecovered+=itemCount;save.stats.legendaryRecovered+=legendaryCount;if(securedCores)save.cores+=securedCores;
      secureAtRiskGear(reportLoot);
      for(const slot of GEAR_SLOTS){if(save.equipped[slot])continue;let recovered=reportLoot.filter(gear=>gearDefinition(gear).slot===slot).sort((a,b)=>LOOT_RARITIES[gearDefinition(b).rarity].rank-LOOT_RARITIES[gearDefinition(a).rarity].rank||gearScore(b)-gearScore(a));if(recovered[0])save.equipped[slot]=recovered[0].uid}
      for(const m of cargo){if(m.starter&&!m.recoveries)continue;let record=save.blueprints[m.id],recoveries=Math.max(0,Math.floor(m.recoveries||0));record.copies+=recoveries;record.rare+=Math.max(0,Math.floor(m.rareRecoveries||0))}
      paperDollKey='';save.contractComplete=contractReady();notice(itemCount?itemCount+' BOSS GEAR SECURED':'$'+reportScrap+' COINS SECURED','#79a67e')
    }else{discardAtRiskGear();save.stats.losses++;notice(itemCount?itemCount+' BOSS GEAR LOST':'RUN LOOT LOST','#ef5350')}
    save.stats.totalTime+=reportData.time;save.stats.totalKills+=reportData.kills;save.stats.totalDamage+=reportData.damage;save.stats.totalRisks+=reportData.risks;for(const id of runStats&&runStats.modules||[])save.playtest.modulePicks[id]=(save.playtest.modulePicks[id]||0)+1;save.playtest.runs.push({outcome:survived?'secured':'lost',depth:reportDepth,time:reportData.time,scrap:survived?reportScrap:0,kills:reportData.kills,damage:reportData.damage,risks:reportData.risks,bosses:bossRunClears,items:itemCount,legendary:legendaryCount,map:reportData.map,route,warden:pendingWardenReward});save.playtest.runs=save.playtest.runs.slice(-12);persist();
    routeDecision=false;moduleDecision=false;postBossDecision=false;postBossIntent=null;extracting=0;bossActive=false;bossLootChest=null;bossLootRewards=[];bossLootSelected=0;bossLootResolved=[];bossLootPhase='idle';runGearEquipBackups={};bossExtraction=false;paused=false;stick.active=false;stick.x=stick.y=0;ui.knob.style.transform='';ui.bossLootOverlay.classList.remove('show');ui.routeOverlay.classList.remove('show');ui.moduleOverlay.classList.remove('show');ui.extractOverlay.classList.remove('show');ui.lootToast.classList.remove('show','legendary');ui.bossHud.classList.remove('show','tyrant');ui.cargoHud.classList.remove('bossHidden');ui.depthRoute.classList.remove('bossHidden');ui.expedition.classList.remove('legendaryCargo');ui.extract.classList.remove('hotLoot');ui.settingsOverlay.classList.remove('show');setView('base');refreshBase();showResult(survived,reportScrap,reportDepth,reportCargo,newRecord,status,reportData)
    let records=[];if(newRecord)records.push('NEW FLOOR RECORD');if(survived&&legendaryCount)records.push(legendaryCount+' LEGENDARY SECURED');if(!survived&&legendaryCount)records.push(legendaryCount+' LEGENDARY LOST');if(securedCores)records.push(securedCores+' BOSS SEAL'+(securedCores===1?'':'S')+' SECURED');if(survived&&pendingWardenReward)records.push(pendingWardenReward==='dividend'?'MERCHANT GIFT SECURED':'TROPHY SECURED');if(!wasComplete&&save.contractComplete)records.push('CONTRACT COMPLETE');ui.resultRecord.textContent=records.join(' \u00B7 ');pendingWardenReward=null
  }
  function closeResultPanel(){ui.resultOverlay.classList.remove('show');refreshBase()}
  function renderVaultRewards(){
    let best=vaultRewards[0],item=gearDefinition(best),rarity=LOOT_RARITIES[item.rarity],set=item.setId&&SET_BY_ID[item.setId];ui.contractOverlay.style.setProperty('--vault-color',rarity.color);ui.vaultReward.innerHTML='<article class="vaultRewardMain rarity'+rarity.rank+'" data-item="'+best.uid+'" data-info-ready="" style="--gear-color:'+rarity.color+';--gear-glow:'+rarity.glow+'"><div>'+gearArtMarkup(best,'detail')+'</div><span><small>'+rarity.name+' \u00B7 LEVEL '+best.level+' \u00B7 '+gearQualityLabel(best)+'</small><b>'+escapeMarkup(item.name)+'</b>'+(set?'<em>'+escapeMarkup(set.mark)+' '+escapeMarkup(set.name)+' SET</em>':'')+'<strong>'+formatGearStats(best).join(' \u00B7 ')+'</strong></span></article>'+(vaultRewards[1]?'<article class="vaultRewardExtra" data-item="'+vaultRewards[1].uid+'" data-info-ready=""><span>+ BONUS ITEM</span>'+gearArtMarkup(vaultRewards[1],'small')+'<b>'+escapeMarkup(gearDefinition(vaultRewards[1]).name)+'</b></article>':'');for(const reward of ui.vaultReward.children){let uid=reward.getAttribute&&reward.getAttribute('data-item'),gear=vaultRewards.find(entry=>entry.uid===uid);if(gear)bindGearHover(reward,gear)}ui.vaultReward.classList.add('revealed');ui.vaultDescription.textContent=vaultRewards.length>1?'The vault held two pieces. Both are secured when claimed.':'The vault has chosen one piece for Pappa Hammer.';ui.vaultOdds.textContent='NEXT VAULT  \u00B7  3 NEW SEALS  \u00B7  12 NEW RELICS';ui.closeContract.disabled=false;ui.vaultClaimLabel.textContent='SECURE '+vaultRewards.length+' ITEM'+(vaultRewards.length===1?'':'S');ui.contractOverlay.classList.remove('opening');ui.contractOverlay.classList.add('revealed');sound(item.rarity==='legendary'?'legendary':'rare')
  }
  function openGrandVault(){
    if(mode!=='base'||!contractReady()||vaultOpening||ui.contractOverlay.classList.contains('show'))return;vaultOpening=true;vaultRewards=[rollVaultGear()];if(Math.random()<vaultExtraChance())vaultRewards.push(rollVaultGear());vaultRewards.sort((a,b)=>LOOT_RARITIES[gearDefinition(b).rarity].rank-LOOT_RARITIES[gearDefinition(a).rarity].rank||gearScore(b)-gearScore(a));ui.vaultCycle.textContent=String(save.vaultCycle+1).padStart(2,'0');ui.vaultEyebrow.textContent='GRAND VAULT  \u00B7  CYCLE '+(save.vaultCycle+1);ui.contractCompleteTitle.textContent='THE GRAND VAULT AWAKENS';ui.vaultDescription.textContent='The seals are turning. Something valuable is waiting inside.';ui.vaultOdds.textContent='GUARANTEED GEAR  \u00B7  '+Math.round(vaultExtraChance()*100)+'% BONUS ITEM';ui.vaultReward.classList.remove('revealed');ui.vaultReward.innerHTML='<span>UNLOCKING THE VAULT</span>';ui.closeContract.disabled=true;ui.vaultClaimLabel.textContent='OPENING...';ui.contractOverlay.classList.remove('revealed');ui.contractOverlay.classList.add('show','opening');sound('upgrade');setTimeout(renderVaultRewards,900)
  }
  function claimContract(){
    if(vaultOpening&&ui.closeContract.disabled||!vaultRewards.length)return;let legendary=0;for(const gear of vaultRewards){let item=gearDefinition(gear);save.gear.push(gear);save.lootFound[gear.itemId]=(save.lootFound[gear.itemId]||0)+1;save.stats.itemsRecovered++;if(item.rarity==='legendary'){save.stats.legendaryRecovered++;legendary++}if(!save.equipped[item.slot])save.equipped[item.slot]=gear.uid}save.vaultCycle++;save.stats.vaultsOpened++;save.contractSeen=true;save.contractComplete=false;selectedGearUid=vaultRewards[0].uid;paperDollKey='';let count=vaultRewards.length;vaultRewards=[];vaultOpening=false;persist();ui.contractOverlay.classList.remove('show','opening','revealed');refreshBase();notice('GRAND VAULT  \u00B7  '+count+' ITEM'+(count===1?'':'S')+' SECURED',legendary?'#ffc928':'#d6aa58');sound(legendary?'legendary':'rare')
  }
  function spawnExtractionAmbush(){let amount=Math.min(24,14+expeditionCycle*3+Math.floor(riskTier/2)),types=['rusher','rusher','rusher','shooter','lancer','brute'],anchors=waveSpawnAnchors(2),packId=++waveDirector.packId;for(let i=0;i<amount;i++){let anchor=anchors[i%anchors.length],angle=Math.random()*Math.PI*2,distance=12+Math.random()*54,position=openArenaPosition(anchor.x+Math.cos(angle)*distance,anchor.y+Math.sin(angle)*distance,34),type=types[(i+riskTier)%types.length],enemy=spawnEnemy(i===amount-1&&riskTier>=2,type,{position,packId,packX:anchor.x,packY:anchor.y});if(enemy){enemy.eventReward=0;enemy.spawnGrace=Math.max(enemy.spawnGrace||0,.46)}}shake=Math.max(shake,7);runNotice('FINAL HORDE  \u00B7  KEEP MOVING','#ef746c')}
  function beginExtract(fromBoss){if(mode!=='run'||extracting||bossLootChest||postBossDecision||routeDecision||moduleDecision||paused)return;bossExtraction=!!fromBoss;extracting=fromBoss?4.25:3.25;ui.extractOverlay.classList.add('show');if(fromBoss)spawnExtractionAmbush();else runNotice('KEEP MOVING UNTIL EXTRACTION','#39dc78');sound('pickup')}
  function cancelExtract(){extracting=0;bossExtraction=false;ui.extractOverlay.classList.remove('show')}
  function finishBossOutcome(){let intent=postBossIntent||'extract';postBossIntent=null;if(intent==='deeper')continueAfterBoss();else beginExtract(true)}
  function chooseBossOutcome(intent){if(!postBossDecision||bossLootPhase!=='path')return;postBossDecision=false;postBossIntent=intent;bossLootPhase='idle';ui.bossLootOverlay.classList.remove('show');if(bossRunClears===1&&!pendingWardenReward)openWardenReward({bossReward:true});else finishBossOutcome()}
  function triggerFloorSignatures(){
    let signature=gearSignatureProfile();
    if(signature.lanternGuard){player.shields=Math.max(player.shields,signature.lanternGuard);if(signature.lanternGuard===2)fieldRepair(.05);effects.push({x:player.x,y:player.y,r:8,maxR:58,life:.42,max:.42,color:'#ffe09a'})}
    if(signature.grandVoyager){let reward=Math.max(3,Math.round(expeditionFloor()*(signature.grandVoyager===2?2.4:1.2)));runScrap+=reward;effects.push({kind:'coinText',x:player.x,y:player.y-26,r:0,maxR:0,life:.62,max:.62,color:'#d6c58f',text:'+$'+reward});if(signature.grandVoyager===2&&depth>=3&&depth<5&&depth%2===0)spawnCache(player.x+150,player.y-40,true,false)}
  }
  function continueAfterBoss(){expeditionCycle++;riskTier+=2;if(runStats)runStats.risks++;bossDefeated=false;bossActive=false;bossEntity=null;bossLootChest=null;bossExtraction=false;bossLootRewards=[];bossLootSelected=0;bossLootResolved=[];bossLootPhase='idle';depth=1;elapsed=0;spawnClock=.3;hazardClock=2.8;zoneEventTriggered=false;enemies=[];enemyBullets=[];pendingStrikes=[];hazards=[];caches=[];resetWaveDirector(.3);fieldRepair(.12);triggerFloorSignatures();spawnCache(Math.max(50,Math.min(WORLD.w-50,player.x+190)),player.y+20,true,false);depthPulse=1.15;updateZoneHud();updateRouteHud();updateHud();runNotice('ASCENT CONTINUES  \u00B7  FLOOR '+expeditionFloor(),'#f2c14f');shake=Math.max(shake,6);sound('start')}
  function showRouteDecision(){routeDecision=true;ui.routeOverlay.classList.add('show');runNotice('ADVENTURE CROSSROADS','#d6aa58');sound('upgrade')}
  function chooseRoute(id){if(!routeDecision||!ROUTES[id])return;route=id;routeDecision=false;if(runStats)runStats.route=id;ui.routeOverlay.classList.remove('show');ui.depthRoute.classList.remove('furnace','dynamo');ui.depthRoute.classList.add(id);ui.routeLabel.textContent=ROUTES[id].short;enterDepth(3);runNotice(ROUTES[id].name,zoneAt(3).accent);sound('start')}
  function enterDepth(nextDepth){depth=nextDepth;if(depth===3||depth===5){riskTier++;if(runStats)runStats.risks++}zoneEventTriggered=false;hazards=[];hazardClock=2.2;depthPulse=1.15;fieldRepair(depth===5?.2:.15);triggerFloorSignatures();sound('upgrade');updateZoneHud();updateRouteHud();if(depth===5){waveDirector.phase='idle';startBoss();updateHud();return}resetWaveDirector(.3);let zone=zoneAt(depth),a=Math.random()*Math.PI*2,d=300+Math.random()*180,rareChance=.15+depth*.06+(routeConfig()?routeConfig().relicRare:0),objective=guildRoutePosition(depth);runNotice(zone.name,zone.accent);spawnCache(objective?objective.x:player.x+Math.cos(a)*d,objective?objective.y:player.y+Math.sin(a)*d,depth>=3&&Math.random()<rareChance,false)}
  function tryDash(){if(mode!=='run'||postBossDecision||routeDecision||moduleDecision||paused||!player||player.dashCd>0)return false;let move=movement(),dx=move.x||player.lastX||Math.cos(player.angle),dy=move.y||player.lastY||Math.sin(player.angle),l=Math.hypot(dx,dy)||1,stats=cargoStats(),thermal=schematicLevel('thermal'),blast=thermalBlast(thermal),signature=stats.signature,blackHoleDash=usesBlackHoleStorm(stats)&&(player.spinTime>0||player.spinLeap>0);if(player.spinLeap>0){player.spinLeap=0;player.spinTime=Math.max(player.spinTime,.001);player.spinPulse=Math.min(0,player.spinPulse||0)}player.dashX=dx/l;player.dashY=dy/l;player.dashTime=.16;player.dashFx=0;player.dashCd=stats.dashCd;player.ramHits=new Set();player.inv=Math.max(player.inv,signature.phantomCourt?(signature.phantomCourt===2?.58:.42):(stats.ram?.34:.24));if(signature.moonlitScout)player.signatureCrits=Math.max(player.signatureCrits,signature.moonlitScout===2?2:1);if(signature.phantomCourt)player.phantomStrike=signature.phantomCourt;if(thermal)player.thermalCharges=Math.max(player.thermalCharges||0,blast.charges);if(stats.stormDash)releaseStormDash(stats.stormDash,player.dashX,player.dashY);shake=Math.max(shake,3);if(blackHoleDash)spawnGravityMotes(player.x,player.y,18,stats.spinRadius*.78,true);else burst(player.x,player.y,thermal?'#c83f46':stats.stormDash?'#79e7f2':signature.phantomCourt?'#b7c7d9':stats.ram?'#d6aa58':'#f4ead6',thermal?16:10,thermal?1.1:.8);sound('dash');return true}
  function updateDashMotion(dt,stats){
    if(player.dashTime<=0)return false;
    player.dashTime=Math.max(0,player.dashTime-dt);player.x+=player.dashX*820*dt;player.y+=player.dashY*820*dt;if(Math.abs(player.dashX)>.08)player.facing=player.dashX<0?-1:1;player.dashFx=(player.dashFx||0)-dt;
    if(save.settings.particles&&player.dashFx<=0){player.dashFx+=mobileArmory()?.065:.035;if(usesBlackHoleStorm(stats)&&player.spinTime>0)spawnGravityMotes(player.x-player.dashX*16,player.y-player.dashY*16,2,stats.spinRadius*.46,true);else spawnParticle({x:player.x-player.dashX*18,y:player.y-player.dashY*18,vx:-player.dashX*40,vy:-player.dashY*40,life:.22,max:.22,r:7,color:stats.stormDash?'#79e7f2':stats.ram?'#f2c14f':'#47c5b6'})}
    if(stats.ram)for(const enemy of enemies){if(enemy.dead||player.ramHits.has(enemy))continue;let dx=enemy.x-player.x,dy=enemy.y-player.y;if(dx*dx+dy*dy<(enemy.r+player.r+8)*(enemy.r+player.r+8)){player.ramHits.add(enemy);damageEnemy(enemy,stats.ram,player.x,player.y,true)}}
    return true
  }
  function hammerstormTargets(radius){return enemies.filter(enemy=>!enemy.dead&&Math.hypot(enemy.x-player.x,enemy.y-player.y)<=radius).sort((a,b)=>Math.hypot(a.x-player.x,a.y-player.y)-Math.hypot(b.x-player.x,b.y-player.y))}
  function hammerstormLanding(){
    let targets=hammerstormTargets(HAMMERSTORM.acquireRadius),targetX=player.x,targetY=player.y;
    if(targets.length){let chosen=targets.slice(0,32),weight=0;targetX=0;targetY=0;for(const enemy of chosen){let distance=Math.hypot(enemy.x-player.x,enemy.y-player.y),value=1.25-distance/HAMMERSTORM.acquireRadius*.55;targetX+=enemy.x*value;targetY+=enemy.y*value;weight+=value}targetX/=weight;targetY/=weight}
    let dx=targetX-player.x,dy=targetY-player.y,length=Math.hypot(dx,dy)||1;if(length>HAMMERSTORM.maxLeap){targetX=player.x+dx/length*HAMMERSTORM.maxLeap;targetY=player.y+dy/length*HAMMERSTORM.maxLeap}let landing=openArenaPosition(targetX,targetY,player.r+5);
    return{targets,x:landing.x,y:landing.y}
  }
  function usesBlackHoleStorm(stats){return !!(stats&&(stats.gravityWell||stats.signature&&stats.signature.gravityWell))}
  function tryHammerSpin(){
    if(mode!=='run'||postBossDecision||routeDecision||moduleDecision||paused||!player||player.spinTime>0||player.spinLeap>0||player.dashTime>0)return false;
    let spinStats=cargoStats(),blackHole=usesBlackHoleStorm(spinStats),landing=hammerstormLanding(),targets=landing.targets;
    player.spinPack=targets.length;player.spinPeakPack=targets.length;player.spinLeap=targets.length?HAMMERSTORM.leapDuration:.001;player.spinLeapMax=player.spinLeap;player.spinAutoRemaining=0;player.spinAutoDuration=0;player.spinManual=false;player.spinStartX=player.x;player.spinStartY=player.y;player.spinTargetX=landing.x;player.spinTargetY=landing.y;player.spinTime=0;player.spinPulse=0;player.spinAngle=0;player.spinShock=0;player.spinHits=0;player.spinKills=0;player.spinCoins=0;player.spinHeal=0;player.spinLifeTargets=new Set();player.spinVortexX=player.x;player.spinVortexY=player.y;player.blackHoleAge=0;player.blackHolePulse=0;player.blackHoleTrail=0;player.inv=Math.max(player.inv,player.spinLeap+.08);player.fire=Math.max(player.fire,.2);
    if(blackHole)spawnGravityMotes(player.x,player.y,Math.min(30,14+Math.floor(targets.length/2)),spinStats.spinRadius,true);
    else{effects.push({kind:'spinCharge',x:player.x,y:player.y,r:8,maxR:58+Math.min(44,targets.length*1.35),life:.26,max:.26,color:targets.length>=24?'#ffc928':'#d6aa58'});burst(player.x,player.y,targets.length>=24?'#ffc928':'#d6aa58',Math.min(28,12+Math.floor(targets.length/3)),1.05+Math.min(.55,targets.length*.012))}
    shake=Math.max(shake,targets.length>=24?6:3);sound('spinStart');showHammerstormHelpOnce();return true
  }
  function updateBlackHoleVortex(dt,stats){
    let radius=stats.spinRadius*BLACK_HOLE_STORM.pullRadiusScale;player.spinVortexX=player.x;player.spinVortexY=player.y;
    for(const enemy of enemies){
      if(enemy.dead||enemy.boss)continue;
      let dx=player.x-enemy.x,dy=player.y-enemy.y,distance=Math.hypot(dx,dy)||1;
      if(distance>radius+enemy.r)continue;
      if(enemy.vortexLaneSeed==null)enemy.vortexLaneSeed=Math.floor(Math.abs(Math.sin((enemy.seed||1)*91.713))*997);
      let baseOrbit=player.r+enemy.r+BLACK_HOLE_STORM.orbitGap,available=Math.max(0,stats.spinRadius-enemy.r-8-baseOrbit),laneCount=Math.max(1,Math.min(BLACK_HOLE_STORM.orbitLanes,1+Math.floor(available/BLACK_HOLE_STORM.orbitLaneGap))),lane=enemy.vortexLaneSeed%laneCount,targetRadius=baseOrbit+(laneCount>1?lane*available/(laneCount-1):0),orbitBand=12+enemy.r*.22,resistance=enemy.elite?BLACK_HOLE_STORM.elitePull:1,proximity=Math.max(0,Math.min(1,1-(distance-targetRadius)/Math.max(1,radius-targetRadius))),nx=dx/distance,ny=dy/distance,radial,tangent;
      if(Math.abs(distance-targetRadius)<=orbitBand){
        radial=Math.max(-92,Math.min(175,(distance-targetRadius)*8.4));
        tangent=targetRadius*BLACK_HOLE_STORM.orbitSpeed
      }else{
        radial=(BLACK_HOLE_STORM.pullMin+(BLACK_HOLE_STORM.pullMax-BLACK_HOLE_STORM.pullMin)*proximity*proximity);
        tangent=radial*(.12+proximity*.28)
      }
      let targetVx=(nx*radial-ny*tangent)*resistance,targetVy=(ny*radial+nx*tangent)*resistance,smoothing=Math.min(1,dt*BLACK_HOLE_STORM.pullSmoothing);
      enemy.vortexVx=(enemy.vortexVx||0)+(targetVx-(enemy.vortexVx||0))*smoothing;enemy.vortexVy=(enemy.vortexVy||0)+(targetVy-(enemy.vortexVy||0))*smoothing;enemy.vortexActive=true;enemy.vortexInfluence=proximity*resistance;enemy.vortexOrbiting=Math.abs(distance-targetRadius)<=orbitBand;enemy.vortexTargetRadius=targetRadius
    }
  }
  function hammerSpinPulse(stats){
    let blackHole=usesBlackHoleStorm(stats),radius=stats.spinRadius,pulseTargets=enemies.filter(enemy=>!enemy.dead&&Math.hypot(enemy.x-player.x,enemy.y-player.y)<=radius+enemy.r&&!lineBlockedByCover(player.x,player.y,enemy.x,enemy.y,2)),hits=0,crits=0,newLifeTargets=0,pulseAngle=player.spinAngle;
    for(const enemy of pulseTargets){
      if((enemy.spinHitCd||0)>0)continue;enemy.spinHitCd=Math.max(.085,HAMMERSTORM.pulseInterval/stats.spinRate*.86);let critical=Math.random()<stats.crit,damage=shotDamage()*stats.damage*stats.spinDamage*(enemy.boss?.4:.56)*(critical?1.8:1);
      enemy.spinLaunched=!enemy.boss&&enemy.hp<=damage;damageEnemy(enemy,damage,enemy.x,enemy.y,true);hits++;if(critical){crits++;if(crits<=4)effects.push({kind:'spinCrit',x:enemy.x,y:enemy.y,r:5,maxR:38,life:.26,max:.26,color:blackHole?'#7ddcff':'#f4ead6'})}if(!player.spinLifeTargets.has(enemy)){player.spinLifeTargets.add(enemy);newLifeTargets++}
    }
    if(!hits)return;player.spinHits+=hits;player.spinShock=(player.spinShock||0)+1;
    if(blackHole){player.blackHolePulse=BLACK_HOLE_STORM.pulseDuration;spawnGravityMotes(player.x,player.y,Math.min(24,8+hits),radius*1.18,true)}
    else{effects.push({kind:'spinArc',x:player.x,y:player.y,r:radius*.48,maxR:radius,life:.2,max:.2,color:crits?'#f4ead6':'#d6aa58',angle:pulseAngle,hits});burst(player.x,player.y,crits?'#f4ead6':'#d6aa58',Math.min(26,8+hits),1+Math.min(.7,hits*.035))}
    shake=Math.max(shake,Math.min(13,3+hits*.42));if(hits>=4)hitStop=Math.max(hitStop,hits>=14?.055:hits>=8?.038:.022);
    let shockEvery=Math.max(3,6-Math.floor(Math.max(player.spinPack,hits)/15));if(player.spinShock%shockEvery===0)physicalShockwave(player.x,player.y,radius*1.48,shotDamage()*stats.damage*stats.spinDamage*.24,blackHole?'#4bbcff':'#f0c66a',radius*.72,{mode:'none',visual:blackHole?'blackHole':''});
    if(stats.spinLifesteal&&newLifeTargets){let remaining=Math.max(0,player.maxHp*.12-player.spinHeal),healing=Math.min(remaining,player.maxHp*stats.spinLifesteal*newLifeTargets);if(healing>0){player.hp=Math.min(player.maxHp,player.hp+healing);player.spinHeal+=healing;effects.push({kind:'healText',x:player.x,y:player.y-30,r:0,maxR:0,life:.46,max:.46,color:'#79d68a',text:'+'+Math.ceil(healing)})}}
    sound('spinHit')
  }
  function finishHammerSpin(){
    if(!player||player.spinFinishing)return;player.spinFinishing=true;let stats=cargoStats(),blackHole=usesBlackHoleStorm(stats),huge=player.spinKills>=10,massacre=player.spinKills>=24;if(player.spinCoins)effects.push({kind:'coinText',x:player.x,y:player.y-40,r:0,maxR:0,life:.8,max:.8,color:blackHole?'#7ddcff':'#ffc928',text:'+$'+player.spinCoins});
    if(blackHole){let radius=stats.spinRadius*(massacre?2.25:huge?1.95:1.7);effects.push({kind:'blackHoleCollapse',x:player.x,y:player.y,r:18,maxR:radius,life:BLACK_HOLE_STORM.collapseDuration,max:BLACK_HOLE_STORM.collapseDuration,color:'#4bbcff',size:radius*2});spawnGravityMotes(player.x,player.y,massacre?42:huge?30:20,radius*.72,false);shake=Math.max(shake,massacre?17:huge?12:7);hitStop=Math.max(hitStop,massacre?.1:huge?.068:.038);sound(huge?'spinFinish':'spinEnd')}
    else if(huge){effects.push({kind:'packClear',x:player.x,y:player.y,r:20,maxR:massacre?225:185,life:massacre?.92:.78,max:massacre?.92:.78,color:'#ffc928'});burst(player.x,player.y,'#ffc928',massacre?60:44,massacre?2.35:1.9);shake=Math.max(shake,massacre?19:14);hitStop=Math.max(hitStop,massacre?.11:.075);sound('spinFinish')}else sound('spinEnd');player.spinCd=0;player.spinTime=0;player.spinLeap=0;player.spinAutoRemaining=0;player.spinAutoDuration=0;player.spinManual=false;player.blackHolePulse=0;player.attackAnim=0;setTimeout(()=>{if(player)player.spinFinishing=false},0)
  }
  function updateHammerSpin(dt,stats,move){
    let blackHole=usesBlackHoleStorm(stats),manualThreshold=player.spinManual?.12:.18,manualInput=move.strength>manualThreshold;
    if(player.spinLeap>0&&manualInput){player.spinAutoRemaining=player.spinLeap;player.spinAutoDuration=player.spinLeap;player.spinLeap=0;player.spinTime=Math.max(player.spinTime,.001);player.spinPulse=Math.min(0,player.spinPulse||0);player.spinManual=true}
    if(player.spinLeap>0){player.spinLeap=Math.max(0,player.spinLeap-dt);if(blackHole){player.blackHoleAge+=dt;player.blackHoleTrail=(player.blackHoleTrail||0)-dt;if(player.blackHoleTrail<=0){player.blackHoleTrail=.07;spawnGravityMotes(player.x,player.y,3,stats.spinRadius*.72,true)}}let progress=1-player.spinLeap/player.spinLeapMax,eased=1-Math.pow(1-progress,3);player.x=player.spinStartX+(player.spinTargetX-player.spinStartX)*eased;player.y=player.spinStartY+(player.spinTargetY-player.spinStartY)*eased;player.angle=Math.atan2(player.spinTargetY-player.spinStartY,player.spinTargetX-player.spinStartX);if(Math.abs(player.spinTargetX-player.spinStartX)>.5)player.facing=player.spinTargetX<player.spinStartX?-1:1;if(!blackHole&&save.settings.particles&&Math.random()<.72)particles.push({x:player.x,y:player.y+15,vx:(Math.random()-.5)*28,vy:18+Math.random()*22,life:.24,max:.24,r:3+Math.random()*3,color:'#d6aa58'});if(player.spinLeap<=0){player.x=player.spinTargetX;player.y=player.spinTargetY;player.spinTime=.001;player.spinPulse=0;player.inv=Math.max(player.inv,.16);if(blackHole){effects.push({kind:'blackHoleVfx',phase:'spawn',x:player.x,y:player.y,r:10,maxR:stats.spinRadius*1.35,life:.34,max:.34,color:'#4bbcff',size:stats.spinRadius*2.7});spawnGravityMotes(player.x,player.y,22,stats.spinRadius*1.1,true)}else{effects.push({kind:'spinLanding',x:player.x,y:player.y,r:10,maxR:92+Math.min(42,player.spinPack),life:.36,max:.36,color:player.spinPack>=24?'#ffc928':'#f4ead6'});burst(player.x,player.y,player.spinPack>=24?'#ffc928':'#f4ead6',Math.min(36,22+Math.floor(player.spinPack/4)),1.45+Math.min(.5,player.spinPack*.014))}shake=Math.max(shake,player.spinPack>=24?11:8);hitStop=Math.max(hitStop,player.spinPack>=24?.05:.035)}return 'leap'}
    if(player.spinTime>0){player.spinTime+=dt;player.spinAngle+=dt*22*stats.spinRate;player.spinPulse-=dt;if(blackHole){player.blackHoleAge+=dt;player.blackHolePulse=Math.max(0,(player.blackHolePulse||0)-dt)}player.attackAnim=Math.max(player.attackAnim,.16);if(!updateDashMotion(dt,stats)){if(manualInput){player.spinManual=true;player.x+=move.x*player.speed*stats.speed*.34*dt;player.y+=move.y*player.speed*stats.speed*.34*dt;player.lastX=move.x;player.lastY=move.y;player.angle=Math.atan2(move.y,move.x);if(Math.abs(move.x)>.08)player.facing=move.x<0?-1:1}else if(player.spinAutoRemaining>0){if(player.spinManual){let landing=hammerstormLanding();player.spinStartX=player.x;player.spinStartY=player.y;player.spinTargetX=landing.x;player.spinTargetY=landing.y;player.spinAutoDuration=player.spinAutoRemaining;player.spinManual=false}player.spinAutoRemaining=Math.max(0,player.spinAutoRemaining-dt);let progress=1-player.spinAutoRemaining/Math.max(.001,player.spinAutoDuration),eased=1-Math.pow(1-progress,3);player.x=player.spinStartX+(player.spinTargetX-player.spinStartX)*eased;player.y=player.spinStartY+(player.spinTargetY-player.spinStartY)*eased;player.angle=Math.atan2(player.spinTargetY-player.spinStartY,player.spinTargetX-player.spinStartX);if(Math.abs(player.spinTargetX-player.spinStartX)>.5)player.facing=player.spinTargetX<player.spinStartX?-1:1}else player.spinManual=false}player.spinVortexX=player.x;player.spinVortexY=player.y;if(blackHole)updateBlackHoleVortex(dt,stats);let livePack=nearbyEnemyCount(player.x,player.y,245,false);player.spinPeakPack=Math.max(player.spinPeakPack,livePack);player.spinPack=Math.max(player.spinPack,livePack);while(player.spinPulse<=0){hammerSpinPulse(cargoStats());player.spinPulse+=HAMMERSTORM.pulseInterval/stats.spinRate}if(!spinHeld&&player.spinTime>=HAMMERSTORM.minSpin)finishHammerSpin();return 'spin'}
    return ''
  }

  function livingRegularEnemies(){return enemies.filter(enemy=>!enemy.dead&&!enemy.boss)}
  function nearbyEnemyCount(x,y,radius,includeBoss){let radiusSq=radius*radius,count=0;for(const enemy of enemies){if(enemy.dead||!includeBoss&&enemy.boss)continue;let dx=enemy.x-x,dy=enemy.y-y;if(dx*dx+dy*dy<=radiusSq)count++}return count}
  function resetWaveDirector(delay){waveDirector={number:0,phase:'breather',timer:delay==null?.34:delay,spawnClock:0,queue:[],anchors:[],packId:0,kills:0,startCount:0,targetPopulation:0,clearRewarded:false}}
  function guildWaveSpawnAnchors(amount){
    if(!guildTerrain||!guildTerrain.spawnZones.length)return null;
    let cam=camera(),halfW=W/(2*cam.zoom),halfH=H/(2*cam.zoom),view={left:cam.x-halfW-55,right:cam.x+halfW+55,top:cam.y-halfH-55,bottom:cam.y+halfH+55},playerCol=Math.max(0,Math.min(4,Math.floor(player.x/(WORLD.w/5)))),targetCol=Math.max(playerCol+1,Math.min(4,depth)),offset=guildSpawnCursor++%guildTerrain.spawnZones.length;
    let candidates=guildTerrain.spawnZones.map((zone,index)=>{
      let dx=zone.x-player.x,dy=zone.y-player.y,distance=Math.hypot(dx,dy),angle=Math.atan2(dy,dx),sector=Math.floor(((angle+Math.PI)/(Math.PI*2))*8)%8,outside=zone.x<view.left||zone.x>view.right||zone.y<view.top||zone.y>view.bottom,forward=zone.col>=playerCol,score=(outside?1200:0)+(forward?180:0)-Math.abs(zone.col-targetCol)*95+Math.min(900,distance)-Math.abs(index-offset)*.01;
      return{zone,index,distance,angle,sector,score}
    }).filter(entry=>entry.distance>380&&!pointBlocked(entry.zone.x,entry.zone.y,42)).sort((a,b)=>b.score-a.score);
    let anchors=[],usedEntries=new Set(),usedModules=new Set(),usedSectors=new Set(),diverseTarget=Math.min(amount,3);
    function addAnchor(entry){
      anchors.push(openArenaPosition(entry.zone.x,entry.zone.y,40));usedEntries.add(entry.index);usedModules.add(entry.zone.moduleId);usedSectors.add(entry.sector)
    }
    for(const entry of candidates){
      if(usedSectors.has(entry.sector)||usedModules.has(entry.zone.moduleId))continue;
      addAnchor(entry);
      if(anchors.length>=diverseTarget)break
    }
    for(const entry of candidates){
      if(anchors.length>=amount)break;
      if(usedEntries.has(entry.index)||usedModules.has(entry.zone.moduleId))continue;
      addAnchor(entry);
    }
    for(const entry of candidates){
      if(anchors.length>=amount)break;
      if(usedEntries.has(entry.index))continue;
      addAnchor(entry);
    }
    return anchors.length?anchors:null
  }
  function waveSpawnAnchors(amount){let generated=guildWaveSpawnAnchors(amount);if(generated)return generated;let anchors=[],cam=camera(),viewRadius=Math.max(W/cam.zoom,H/cam.zoom)*.58,base=Math.random()*Math.PI*2;for(let index=0;index<amount;index++){let angle=base+index*Math.PI*2/amount+(Math.random()-.5)*.34,distance=viewRadius+115+Math.random()*80,open=openArenaPosition(player.x+Math.cos(angle)*distance,player.y+Math.sin(angle)*distance,40);anchors.push(open)}return anchors}
  function waveEnemyType(index,count){let pool=zoneAt(depth).pool,heavy=pool.filter(type=>type==='brute'||type==='lancer'),ranged=pool.includes('shooter');if(heavy.length&&index%9===8)return heavy[index%heavy.length];if(ranged&&index%7===6)return 'shooter';if(pool.includes('rusher'))return index%5===4?pool[index%pool.length]:'rusher';return pool[index%pool.length]}
  function waveTargetPopulation(number){let mapPressure=Math.min(1.18,1/Math.max(.74,activeMap().spawnRate)),target=HORDE.basePopulation+(depth-1)*3+riskTier*2+expeditionCycle*5+Math.min(15,Math.max(0,number-1)*3);return Math.max(HORDE.basePopulation,Math.min(HORDE.maxPopulation,Math.round(target*mapPressure)))}
  function prepareNextWave(){
    if(bossActive||bossDefeated)return;let living=livingRegularEnemies().length,room=Math.max(0,LIMITS.enemies-living-4);if(room<8){waveDirector.phase='active';waveDirector.timer=.34;return}
    if(waveDirector.number&&waveDirector.kills&&!waveDirector.clearRewarded)rewardWaveClear();
    waveDirector.number++;let target=waveTargetPopulation(waveDirector.number),count=Math.min(room,Math.max(10,target-living)),anchorCount=count>=38?4:count>=22?3:2;waveDirector.targetPopulation=target;waveDirector.anchors=waveSpawnAnchors(anchorCount);waveDirector.queue=[];waveDirector.packId++;for(let index=0;index<count;index++)waveDirector.queue.push({type:waveEnemyType(index,count),elite:waveDirector.number>2&&index===count-1&&Math.random()<.32,anchor:index%anchorCount,packId:waveDirector.packId});waveDirector.phase='spawning';waveDirector.spawnClock=.02;waveDirector.timer=0;waveDirector.kills=0;waveDirector.startCount=count;waveDirector.clearRewarded=false;runNotice('HORDE '+waveDirector.number+'  \u00B7  '+target+' HOSTILES',zoneAt(depth).accent)
  }
  function rewardWaveClear(){
    if(waveDirector.clearRewarded)return;waveDirector.clearRewarded=true;let large=waveDirector.kills>=18,massacre=waveDirector.kills>=32,bonus=Math.max(3,Math.round((3+depth+waveDirector.number+waveDirector.kills*.08)*lootMultiplier()*.48)),blackHole=player&&usesBlackHoleStorm(cargoStats())&&(player.spinTime>0||player.spinFinishing);runScrap+=bonus;
    if(blackHole){let radius=massacre?205:large?158:108;effects.push({kind:'blackHoleVfx',phase:'burst',x:player.x,y:player.y,r:18,maxR:radius,life:massacre?.62:.48,max:massacre?.62:.48,color:'#4bbcff',size:radius*2});spawnGravityMotes(player.x,player.y,massacre?36:large?26:16,radius*.8,false)}
    else{effects.push({kind:'packClear',x:player.x,y:player.y,r:18,maxR:massacre?205:large?158:108,life:massacre?.9:.72,max:massacre?.9:.72,color:massacre?'#ffc928':large?'#d6aa58':'#9eb2d5'});burst(player.x,player.y,massacre?'#ffc928':large?'#d6aa58':'#9eb2d5',massacre?46:large?30:18,massacre?2:large?1.5:1.05)}
    effects.push({kind:'coinText',x:player.x,y:player.y-35,r:0,maxR:0,life:.72,max:.72,color:blackHole?'#dff7ff':'#f4ead6',text:'+$'+bonus});shake=Math.max(shake,massacre?11:large?7:3);sound(large?'spinFinish':'pickup')
  }
  function updateWaveDirector(dt){
    if(bossActive||bossDefeated)return;if(waveDirector.phase==='idle')resetWaveDirector(.28);
    if(waveDirector.phase==='breather'){waveDirector.timer-=dt;if(waveDirector.timer<=0)prepareNextWave();return}
    if(waveDirector.phase==='spawning'){
      waveDirector.spawnClock-=dt;while(waveDirector.spawnClock<=0&&waveDirector.queue.length&&enemies.length<LIMITS.enemies){let batch=HORDE.spawnBatch;while(batch--&&waveDirector.queue.length){let entry=waveDirector.queue.shift(),anchor=waveDirector.anchors[entry.anchor],angle=Math.random()*Math.PI*2,distance=16+Math.random()*68,open=openArenaPosition(anchor.x+Math.cos(angle)*distance,anchor.y+Math.sin(angle)*distance,34);spawnEnemy(entry.elite,entry.type,{position:open,packId:entry.packId,packX:anchor.x,packY:anchor.y})}waveDirector.spawnClock+=HORDE.spawnInterval+Math.random()*.022}
      if(!waveDirector.queue.length){waveDirector.phase='active';waveDirector.timer=Math.max(3.35,HORDE.reinforceAfter-waveDirector.number*.15)}
      return
    }
    if(waveDirector.phase==='active'){let living=livingRegularEnemies().length;if(!living){rewardWaveClear();waveDirector.phase='breather';waveDirector.timer=HORDE.clearBreather;return}waveDirector.timer-=dt;let overlapAt=Math.max(14,Math.ceil(waveDirector.targetPopulation*HORDE.overlapRatio)),softReinforceAt=Math.ceil(waveDirector.targetPopulation*.78);if(living<=overlapAt||waveDirector.timer<=0&&living<=softReinforceAt)prepareNextWave();else if(waveDirector.timer<=0)waveDirector.timer=.46}
  }

  function spawnEnemy(elite,forcedType,options){
    options=options||{};if(enemies.length>=LIMITS.enemies)return;let x=options.position?options.position.x:player.x,y=options.position?options.position.y:player.y,viewRadius=Math.max(330,Math.hypot(W,H)*.61),minimum=Math.max(350,viewRadius*.84);if(!options.position)for(let tries=0;tries<16;tries++){let a=Math.random()*Math.PI*2,d=viewRadius+90+Math.random()*145;x=Math.max(35,Math.min(WORLD.w-35,player.x+Math.cos(a)*d));y=Math.max(35,Math.min(WORLD.h-35,player.y+Math.sin(a)*d));if(Math.hypot(x-player.x,y-player.y)>minimum&&!pointBlocked(x,y,34))break}if(pointBlocked(x,y,34)){let open=openArenaPosition(x,y,34);x=open.x;y=open.y}
    let zone=zoneAt(depth),map=activeMap(),type=forcedType||zone.pool[Math.floor(Math.random()*zone.pool.length)],base=type==='brute'?{r:24,hp:43,speed:62,damage:16}:type==='shooter'?{r:17,hp:21,speed:78,damage:9}:type==='lancer'?{r:16,hp:25,speed:92,damage:14}:{r:15,hp:15,speed:132,damage:10},scale=(1+(depth-1)*.13+riskTier*.1)*map.enemyHp*.88,spawnDuration=ENEMY_SPAWN_GRACE,seed=(x*.013+y*.017+base.r*.11)%(Math.PI*2),entity={x,y,r:base.r*(elite?1.18:1),hp:base.hp*scale*(elite?2.05:1),max:base.hp*scale*(elite?2.05:1),speed:base.speed*(1+depth*.014)*(elite?1.05:1)*map.enemySpeed,damage:base.damage*(elite?1.28:1)*map.enemyDamage*.45*REGULAR_ENEMY_DAMAGE_SCALE,hit:0,attack:0,fire:.28+Math.random()*.62,charge:0,recover:0,dashTime:0,dashMax:0,dashDistance:0,dashX:0,dashY:0,dashSpeed:0,pattern:0,type,elite:!!elite,angle:0,strafe:Math.random()<.5?-1:1,anim:0,seed,think:.55+Math.abs(Math.sin(seed))*.45,stepFx:.08,recoil:0,aimX:0,aimY:0,spawnGrace:spawnDuration,spawnDuration,packId:options.packId||0,packX:options.packX||x,packY:options.packY||y,knockVx:0,knockVy:0,knockTime:0,spinHitCd:0};enemies.push(entity);return entity
  }
  function triggerZoneEvent(){if(zoneEventTriggered||depth>=5)return;zoneEventTriggered=true;let zone=zoneAt(depth),type=zone.pool[zone.pool.length-1],amount=8+depth*2,center=waveSpawnAnchors(1)[0],packId=++waveDirector.packId;for(let index=0;index<amount;index++){let angle=index/amount*Math.PI*2,distance=18+(index%3)*24,position=openArenaPosition(center.x+Math.cos(angle)*distance,center.y+Math.sin(angle)*distance,34),enemy=spawnEnemy(index===amount-1,type,{position,packId,packX:center.x,packY:center.y});if(enemy&&enemy.elite)enemy.eventReward=3+depth*2}shake=Math.max(shake,5);runNotice('HUNTER PACK INBOUND',zone.accent);sound('start')}
  function syncXpHud(){let goal=levelXpNeeded(save.level),progress=Math.max(0,Math.min(1,save.xp/goal)),percent=progress*100;ui.xpLevel.textContent=save.level;ui.xpFill.style.width=percent+'%';ui.xpSpark.style.left=percent+'%';ui.xpText.textContent=save.xp+' / '+goal+' XP'}
  function pulseXpLevel(){ui.xpHud.classList.remove('levelUp');void ui.xpHud.offsetWidth;ui.xpHud.classList.add('levelUp');clearTimeout(pulseXpLevel.t);pulseXpLevel.t=setTimeout(()=>ui.xpHud.classList.remove('levelUp'),1150)}
  function grantBossXp(amount){let before=save.level;save.xp+=Math.max(1,Math.floor(amount||1));while(save.level<999&&save.xp>=levelXpNeeded(save.level)){save.xp-=levelXpNeeded(save.level);save.level++}syncXpHud();if(save.level>before)pulseXpLevel();return save.level-before}
  function startBoss(){
    let def=currentBoss(),map=activeMap(),isTyrant=def.kind==='tyrant',isLagoon=def.kind==='leviathan',levelScale=1+(save.level-1)*.11,damageScale=1+(save.level-1)*.035;
    bossActive=true;extracting=0;hazards=[];ui.extractOverlay.classList.remove('show');enemies=[];enemyBullets=[];
    let a=Math.random()*Math.PI*2,bossAnchor=guildTerrain?guildTerrain.bossAnchor:null,x=bossAnchor?bossAnchor.x:Math.max(90,Math.min(WORLD.w-90,player.x+Math.cos(a)*410)),y=bossAnchor?bossAnchor.y:Math.max(90,Math.min(WORLD.h-90,player.y+Math.sin(a)*410)),open=openArenaPosition(x,y,isLagoon?66:isTyrant?58:52),hp=(620+riskTier*120+Math.min(540,save.weapon*18))*(isLagoon?1.15:isTyrant?1.08:1)*levelScale*map.bossHp*.9;
    x=open.x;y=open.y;
    bossEntity={x,y,r:isLagoon?60:isTyrant?54:48,hp,max:hp,speed:(isLagoon?48:isTyrant?46:51)*map.enemySpeed,damage:((isTyrant?20:isLagoon?18:18)+riskTier*1.5)*damageScale*map.bossDamage,hit:0,attack:0,fire:.82,charge:0,dashTime:0,type:'boss',boss:true,bossKind:def.kind,elite:true,angle:0,strafe:Math.random()<.5?-1:1,phase:0,bossStage:1,pattern:0,anim:0,recoil:0,aimX:0,aimY:0,stagger:0,spawnGrace:0,spawnDuration:0};
    enemies.push(bossEntity);if(runStats)runStats.boss=def.kind;ui.bossHud.classList.add('show');ui.bossHud.classList.toggle('tyrant',isTyrant);ui.bossHud.classList.toggle('lagoon',isLagoon);ui.bossName.textContent=def.name+'  \u00B7  LV '+save.level;ui.cargoHud.classList.add('bossHidden');ui.depthRoute.classList.add('bossHidden');ui.bossHealthFill.style.width='100%';ui.bossPhase.textContent=def.phase[0];depthPulse=1.2;shake=Math.max(shake,10);updateZoneHud();setMusicMode('run');runNotice(def.name+' \u00B7 '+def.intro,def.accent);sound('boss')
  }
  function setBossStage(e,stage){
    if(e.bossStage===stage)return;
    e.bossStage=stage;e.charge=0;e.fire=.72;e.stagger=.58;enemyBullets=[];hazards=[];
    let def=BOSSES[e.bossKind]||currentBoss(),label=def.phase[stage-1],color=e.bossKind==='leviathan'?(stage===3?'#f29ab8':stage===2?'#d9fbff':'#79e7f2'):e.bossKind==='tyrant'?'#c83f46':stage===2?'#d6aa58':'#9eb2d5';
    ui.bossPhase.textContent=label;runNotice(label,def.accent);
    effects.push({x:e.x,y:e.y,r:10,maxR:150,life:.58,max:.58,color});
    burst(e.x,e.y,color,26,1.45);shake=Math.max(shake,9);sound('boss')
  }
  function salvageReward(gear){let item=gearDefinition(gear);return item&&SALVAGE_REWARDS[item.rarity]||SALVAGE_REWARDS.common}
  function salvageRewardText(gear){let reward=salvageReward(gear);return '+'+reward.materials+' Material'+(reward.materials===1?'':'s')+(reward.cores?'  +  '+reward.cores+' Legendary Core':'')}
  function bossLootPreviewImage(gear){
    let preview=paperDollPreviewImage(gear);if(preview)return preview;let atlas=paperDollAtlases.idle||pappaHammerSprites.idle;return atlas?(typeof atlas.toDataURL==='function'?'url("'+atlas.toDataURL('image/png')+'")':'url("'+atlas.src+'")'):''
  }
  function renderBossLootDecision(){
    let gear=bossLootRewards[bossLootSelected],item=gearDefinition(gear);if(!gear||!item){showBossLootPath();return}let rarity=LOOT_RARITIES[item.rarity],set=item.setId&&SET_BY_ID[item.setId],score=Math.round(gearScore(gear)*10)/10;
    bossLootPhase='decision';ui.bossLootPanel.style.setProperty('--loot-color',rarity.color);ui.bossLootPanel.className='bossLootPanel decisionPhase rarity'+rarity.rank+(item.rarity==='legendary'?' legendary':'');ui.bossLootDecision.setAttribute('aria-hidden','false');ui.bossLootPath.setAttribute('aria-hidden','true');ui.bossLootEyebrow.textContent='CHAMPION DROP  \u00B7  '+(bossLootSelected+1)+' OF '+bossLootRewards.length;ui.bossLootTitle.textContent=item.rarity==='legendary'?'LEGENDARY GEAR!':'LOOT DECISION';ui.bossLootArt.innerHTML=gearArtMarkup(gear,'ritual');ui.bossLootRarity.textContent=rarity.mark+'  '+(set?set.name+' SET  \u00B7  ':'')+rarity.name+'  \u00B7  LEVEL '+gear.level;ui.bossLootName.textContent=item.name;ui.bossLootStats.textContent=gearQualityLabel(gear)+'  \u00B7  '+score+' POWER  \u00B7  '+GEAR_SLOT_META[item.slot].name.toUpperCase();ui.bossLootCompare.style.setProperty('--gear-color',rarity.color);ui.bossLootCompare.innerHTML=gearComparisonMarkup(gear);ui.bossLootDecisionCount.textContent='ITEM '+(bossLootSelected+1)+' OF '+bossLootRewards.length;ui.bossLootSalvageReward.textContent=salvageRewardText(gear);ui.bossLootPappa.style.backgroundImage=bossLootPreviewImage(gear);ui.bossLootDecision.classList.remove('resolving');ui.bossLootArt.classList.remove('decisionReveal');void ui.bossLootArt.offsetWidth;ui.bossLootArt.classList.add('decisionReveal');sound(item.rarity==='legendary'?'legendary':rarity.rank>=2?'rare':'pickup')
  }
  function equipRunGear(gear){
    let item=gearDefinition(gear);if(!item)return false;if(!Object.prototype.hasOwnProperty.call(runGearEquipBackups,item.slot))runGearEquipBackups[item.slot]=save.equipped[item.slot]||null;
    gear.atRisk=true;if(!save.gear.some(entry=>entry.uid===gear.uid))save.gear.push(gear);save.equipped[item.slot]=gear.uid;registerRunGear(gear,false,player.x,player.y);paperDollKey='';paperDollPreviewCache.clear();refreshPaperDoll();updateHud();return true
  }
  function renderBossLootReceipt(result,index){
    let gear=result.gear,item=gearDefinition(gear),rarity=LOOT_RARITIES[item.rarity],card=document.createElement('article');card.className='bossLootItem receipt rarity'+rarity.rank+(result.action==='salvage'?' salvaged':' equipped');card.style.setProperty('--item-color',rarity.color);card.style.setProperty('--loot-index',index);card.innerHTML=gearArtMarkup(gear,'ritualChip')+'<small>'+(result.action==='equip'?'EQUIPPED':'SALVAGED')+'</small>';return card
  }
  function showBossLootPath(){
    bossLootPhase='path';let equipped=bossLootResolved.filter(result=>result.action==='equip').length,salvaged=bossLootResolved.length-equipped,nextLevel=save.level+(expeditionCycle+1)*2,nextOdds=bossGearOdds(nextLevel,riskTier+2),best=bossLootRewards[0],rarity=LOOT_RARITIES[gearDefinition(best).rarity];
    ui.bossLootPanel.style.setProperty('--loot-color',rarity.color);ui.bossLootPanel.className='bossLootPanel pathPhase rarity'+rarity.rank;ui.bossLootDecision.setAttribute('aria-hidden','true');ui.bossLootPath.setAttribute('aria-hidden','false');ui.bossLootEyebrow.textContent='CHAMPION SPOILS RESOLVED  \u00B7  FLOOR '+expeditionFloor();ui.bossLootTitle.textContent='CHOOSE YOUR RISK';ui.bossLootCount.textContent=equipped+' EQUIPPED  \u00B7  '+salvaged+' SALVAGED';ui.bossLootGrid.innerHTML='';bossLootResolved.forEach((result,index)=>ui.bossLootGrid.appendChild(renderBossLootReceipt(result,index)));ui.bossLootValue.textContent='$'+runScrap+'  \u00B7  '+lootManifest().length+' GEAR  \u00B7  '+save.materials+' MATERIALS';ui.bossLootMultiplier.textContent=Math.round(nextOdds.high*100)+'% EPIC+  \u00B7  '+Math.round(activeMap().dropBonus*100)+'% EXTRA'
  }
  function resolveBossLoot(action){
    if(bossLootPhase!=='decision'||ui.bossLootDecision.classList.contains('resolving'))return;let gear=bossLootRewards[bossLootSelected],item=gearDefinition(gear),rarity=item&&LOOT_RARITIES[item.rarity];if(!gear||!item)return;
    ui.bossLootDecision.classList.add('resolving',action==='equip'?'equipped':'salvaged');if(action==='equip'){equipRunGear(gear);bossLootResolved.push({gear,action:'equip'});sound(item.rarity==='legendary'?'legendary':rarity.rank>=2?'rare':'upgrade')}else{let reward=salvageReward(gear);save.materials+=reward.materials;save.legendaryCores+=reward.cores;bossLootResolved.push({gear,action:'salvage',reward});refreshResourceCounters();persist();sound(item.rarity==='legendary'?'legendary':'pickup')}
    setTimeout(()=>{ui.bossLootDecision.classList.remove('resolving','equipped','salvaged');bossLootSelected++;if(bossLootSelected<bossLootRewards.length)renderBossLootDecision();else showBossLootPath()},160)
  }
  function showBossLootRitual(rewards,def,headline){
    let sorted=rewards.slice().sort((a,b)=>{let ad=gearDefinition(a),bd=gearDefinition(b);return LOOT_RARITIES[bd.rarity].rank-LOOT_RARITIES[ad.rarity].rank||gearScore(b)-gearScore(a)});bossLootRewards=sorted;bossLootSelected=0;bossLootResolved=[];postBossDecision=true;ui.bossLootGrid.innerHTML='';ui.bossLootOverlay.classList.remove('show');renderBossLootDecision();void ui.bossLootOverlay.offsetWidth;ui.bossLootOverlay.classList.add('show');ui.lootToast.classList.remove('show','legendary')
  }
  function finishBossLootChest(){
    if(!bossLootChest)return;let chest=bossLootChest,rewards=chest.rewards,def=chest.def,headline=chest.headline;bossLootChest=null;showBossLootRitual(rewards,def,headline)
  }
  function openBossLootChest(){
    if(!bossLootChest||bossLootChest.arrival>0||bossLootChest.opening>0||postBossDecision)return false;bossLootChest.opening=BOSS_LOOT_ORB_OPEN;bossLootChest.opened=true;bossLootChest.burstAt=.38;burst(bossLootChest.x,bossLootChest.y,bossLootChest.color,38,1.55);effects.push({x:bossLootChest.x,y:bossLootChest.y,r:10,maxR:118,life:.46,max:.46,color:bossLootChest.color});shake=Math.max(shake,7);sound(bossLootChest.rank>=4?'legendary':'rare');return true
  }
  function pointerWorldPosition(event){
    let rect=canvas.getBoundingClientRect(),cam=camera(),clientX=event.clientX==null?rect.left+rect.width/2:event.clientX,clientY=event.clientY==null?rect.top+rect.height/2:event.clientY,screenX=(clientX-rect.left)*W/Math.max(1,rect.width),screenY=(clientY-rect.top)*H/Math.max(1,rect.height);return {x:cam.x+(screenX-W/2)/cam.zoom,y:cam.y+(screenY-H/2)/cam.zoom}
  }
  function tryOpenBossLootAt(event){
    if(mode!=='run'||!bossLootChest||bossLootChest.arrival>0||bossLootChest.opening>0)return false;let point=pointerWorldPosition(event),radius=(bossLootChest.r||34)+24;if(Math.hypot(point.x-bossLootChest.x,point.y-bossLootChest.y)>radius)return false;return openBossLootChest()
  }
  function registerRunGear(gear,announce,x,y){let item=gearDefinition(gear);if(!gear||!item||lootBag[gear.uid])return;let rarity=LOOT_RARITIES[item.rarity];lootBag[gear.uid]=gear;if(runStats){runStats.items++;if(item.rarity==='legendary')runStats.legendary++}if(item.rarity==='legendary'){ui.expedition.classList.add('legendaryCargo');ui.extract.classList.add('hotLoot')}let vaultTier=gearSignatureProfile().grandVault,vaultGoal=vaultTier===2?Object.keys(lootBag).length:Math.floor(Object.keys(lootBag).length/2),vaultCap=vaultTier===2?2:1;if(vaultTier&&vaultGoal>(player.vaultWardAwarded||0)){player.vaultWardAwarded=vaultGoal;player.shields=Math.min(baseShields()+vaultCap,player.shields+1);effects.push({x:player.x,y:player.y,r:8,maxR:64,life:.44,max:.44,color:'#f4ead6'});sound('shield')}if(announce){showLootToast(gear);if(item.rarity==='legendary'){shake=Math.max(shake,8);flash=.045;burst(x,y,rarity.color,34,1.8);sound('legendary')}else{burst(x,y,rarity.color,rarity.rank>=2?16:9,rarity.rank>=2?1:.7);sound(rarity.rank>=2?'rare':'pickup')}}updateHud()}
  function defeatBoss(e){let def=BOSSES[e.bossKind]||currentBoss(),map=activeMap(),beforeLevel=save.level,xpGain=1+Math.min(2,Math.floor(riskTier/2)),levels=grantBossXp(xpGain),newMap=EXPEDITION_MAP_IDS.map(id=>EXPEDITION_MAPS[id]).find(entry=>entry.minLevel>beforeLevel&&entry.minLevel<=save.level),stats=cargoStats(),markedDrop=Math.random()<stats.bossDropChance?1:0,mapDrop=Math.random()<map.dropBonus?1:0,drops=Math.min(6,2+Math.min(2,expeditionCycle)+(riskTier>=2?1:0)+(Math.random()<.16?1:0)+markedDrop+mapDrop),gearLevel=save.level+expeditionCycle*2,rewards=[];for(let i=0;i<drops;i++)rewards.push(rollBossGear(gearLevel));let best=rewards.slice().sort((a,b)=>LOOT_RARITIES[gearDefinition(b).rarity].rank-LOOT_RARITIES[gearDefinition(a).rarity].rank||gearScore(b)-gearScore(a))[0],rarity=LOOT_RARITIES[gearDefinition(best).rarity],dropPoint=openArenaPosition(e.x,e.y,42);bossActive=false;bossDefeated=true;bossEntity=null;bossRunClears++;if(runStats)runStats.bosses=bossRunClears;save.stats.bosses++;persist();ui.bossHud.classList.remove('show');ui.cargoHud.classList.remove('bossHidden');ui.depthRoute.classList.remove('bossHidden');enemyBullets=[];hazards=[];for(const other of enemies)if(other!==e)other.dead=true;burst(e.x,e.y,def.accent,52,2.35);effects.push({x:e.x,y:e.y,r:18,maxR:230,life:.78,max:.78,color:def.accent});bossLootChest={x:dropPoint.x,y:dropPoint.y,r:38,spin:0,arrival:BOSS_LOOT_ORB_ARRIVAL,arrivalMax:BOSS_LOOT_ORB_ARRIVAL,opening:0,opened:false,burstAt:0,rewards,def,headline:newMap?'NEW MAP UNLOCKED':levels?'PAPPA LEVEL '+save.level:'CHAMPION SPOILS',color:rarity.color,rarity:rarity.name,rank:rarity.rank};shake=Math.max(shake,18);flash=.09;setMusicMode('run');updateZoneHud();updateRouteHud();runNotice(rarity.name+' LOOT ORB',rarity.color);sound(rarity.rank>=4?'legendary':'boss')}
  function spawnLoot(x,y,gear,scatter){let item=gearDefinition(gear);if(lootDrops.length>=LIMITS.loot||!gear||!item)return;let rank=LOOT_RARITIES[item.rarity].rank;lootDrops.push({x:x+(scatter?(Math.random()-.5)*26:0),y:y+(scatter?(Math.random()-.5)*26:0),r:7+rank*1.4,item,gear,spin:Math.random()*6,vx:scatter?(Math.random()-.5)*105:0,vy:scatter?(Math.random()-.5)*105:0})}
  function showLootToast(gear){
    let item=gearDefinition(gear),rarity=LOOT_RARITIES[item.rarity],set=item.setId&&SET_BY_ID[item.setId],legendary=item.rarity==='legendary';ui.lootToast.style.setProperty('--loot-color',rarity.color);ui.lootToast.style.setProperty('--legendary-accent',set?set.accent:rarity.glow);ui.lootToastIcon.innerHTML=gearArtMarkup(gear,'toast');ui.lootToastRarity.textContent=legendary?(set?set.name+' SET \u00B7 LEGENDARY':'LEGENDARY BOSS GEAR'):rarity.name+' \u00B7 LEVEL '+gear.level+' \u00B7 '+GEAR_SLOT_META[item.slot].name;ui.lootToastName.textContent=item.name;ui.lootToastValue.textContent=legendary?'SECURE IT \u00B7 '+gearQualityLabel(gear):gearQualityLabel(gear);ui.lootToast.classList.toggle('legendary',legendary);ui.lootToast.classList.remove('show');void ui.lootToast.offsetWidth;ui.lootToast.classList.add('show');clearTimeout(showLootToast.t);showLootToast.t=setTimeout(()=>ui.lootToast.classList.remove('show'),legendary?4600:2200)
  }
  function collectLoot(drop){
    registerRunGear(drop.gear,true,drop.x,drop.y)
  }
  function spawnCache(x,y,rare,bossReward){let pos=openArenaPosition(x,y,25);caches.push({x:pos.x,y:pos.y,r:19,rare:!!rare,bossReward:!!bossReward,spin:Math.random()*6,opened:false})}
  function particleLimit(){return mobileArmory()?220:LIMITS.particles}
  function spawnParticle(data){if(particles.length>=particleLimit())return null;let particle=particlePool.pop()||{};for(const key of Object.keys(particle))delete particle[key];Object.assign(particle,data);particles.push(particle);return particle}
  function spawnGravityMotes(x,y,count,radius,followPlayer){
    if(!save.settings.particles)return;count=mobileArmory()?Math.ceil(count*.64):count;
    for(let index=0;index<count;index++){
      let angle=Math.random()*Math.PI*2,orbit=radius*(.42+Math.random()*.58),life=.28+Math.random()*.28;
      spawnParticle({kind:'gravityMote',x:x+Math.cos(angle)*orbit,y:y+Math.sin(angle)*orbit,cx:x,cy:y,angle,orbit,angular:(index%2?1:-1)*(4.4+Math.random()*4.8),radial:-(radius*.8+Math.random()*radius*.7),followPlayer:!!followPlayer,vx:0,vy:0,life,max:life,r:1.5+Math.random()*2.7,color:index%4===0?'#f5fbff':index%3===0?'#7ddcff':'#207be6'})
    }
  }
  function updateParticles(dt){
    let write=0;
    for(let read=0;read<particles.length;read++){
      let p=particles[read];
      if(p.kind==='gravityMote'){
        p.angle+=p.angular*dt;p.orbit=Math.max(6,p.orbit+p.radial*dt);let cx=p.followPlayer&&player?player.x:p.cx,cy=p.followPlayer&&player?player.y:p.cy;p.x=cx+Math.cos(p.angle)*p.orbit;p.y=cy+Math.sin(p.angle)*p.orbit;
      }else{
        p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.pow(.06,dt);p.vy*=Math.pow(.06,dt)
      }
      p.life-=dt;if(p.life>0)particles[write++]=p;else if(particlePool.length<260)particlePool.push(p)
    }
    particles.length=write
  }
  function burst(x,y,color,count,power){if(!save.settings.particles)return;color=noticeTone(color);if(mobileArmory())count=Math.max(3,Math.ceil(count*.68));count=Math.min(count,particleLimit()-particles.length);for(let i=0;i<count;i++){let a=Math.random()*Math.PI*2,s=(20+Math.random()*80)*(power||1);spawnParticle({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life:.25+Math.random()*.35,max:.6,r:1.5+Math.random()*3,color})}}
  function impact(x,y,color,power){color=noticeTone(color);let strength=power||1;burst(x,y,color,Math.round(6+strength*5),.68+strength*.22);effects.push({x,y,r:3,maxR:22+strength*10,life:.12,max:.12,color});effects.push({kind:'hitSpark',x,y,angle:Math.random()*Math.PI*2,r:5,maxR:20+strength*8,life:.1,max:.1,color})}

  function randomModule(exclude,forceRare){let pool=MODULE_IDS.filter(id=>!exclude.includes(id)&&(!cargo.find(m=>m.id===id)||(cargo.find(m=>m.id===id).power||1)<RELIC_POWER_CAP));if(!pool.length)pool=MODULE_IDS.filter(id=>!exclude.includes(id));let id=pool[Math.floor(Math.random()*pool.length)],routeRare=routeConfig()?routeConfig().relicRare:0;return {id,rare:!!forceRare||Math.random()<Math.min(.07+depth*.03+routeRare,.34)}}
  function prepareRelic(module){let gain=module.gain||module.power||(module.rare?2:1);return {id:module.id,rare:!!module.rare,power:Math.min(RELIC_POWER_CAP,gain),recoveries:Math.max(1,module.recoveries||1),rareRecoveries:Math.max(module.rare?1:0,module.rareRecoveries||0)}}
  function fuseRelic(existing,pickup){let before=existing.power||1;existing.power=Math.min(RELIC_POWER_CAP,before+(pickup.power||1));existing.recoveries=(existing.recoveries||0)+Math.max(1,pickup.recoveries||1);existing.rareRecoveries=(existing.rareRecoveries||0)+(pickup.rareRecoveries||0);existing.rare=existing.rare||pickup.rare;return existing.power>before}
  function openModuleCache(cache){if(moduleDecision)return;if(cache.bossReward){openWardenReward(cache);return}moduleDecision=true;activeCache=cache;moduleStage='offer';let first=randomModule([],cache.rare),second=randomModule([first.id],false);moduleOffer=[first,second];renderModuleOffer();ui.moduleOverlay.classList.add('show');sound(cache.rare?'rare':'upgrade')}
  function moduleCard(module,onClick,replacement){let def=MODULES[module.id],existing=!replacement&&cargo.find(m=>m.id===module.id),gain=module.rare?2:1,next=existing?Math.min(RELIC_POWER_CAP,(existing.power||1)+gain):gain,combo=!existing&&!replacement&&synergyForPickup(module.id),button=document.createElement('button');button.className='moduleCard'+(module.rare?' rare':'')+(combo?' synergy':'')+(existing?' fusion':'');let tag=replacement?'INSTALLED \u00B7 POWER '+Math.round((module.power||1)*10)/10:existing?((existing.power||1)>=RELIC_POWER_CAP?'POWER MAX':'FUSE \u00B7 POWER '+Math.round((existing.power||1)*10)/10+' \u2192 '+next):combo?'COMBO \u00B7 '+combo.name:module.rare?'RARE \u00B7 +2 POWER':'RELIC \u00B7 +1 POWER';button.setAttribute('data-help-title',def.name);button.setAttribute('data-help',def.desc+' '+tag.replace(/\u00B7/g,'.')+'. Relics last only for the current expedition.');button.innerHTML='<i class="moduleIcon">'+def.icon+'</i><strong>'+def.name+'</strong><span>'+def.desc+'</span><em>'+tag+'</em>';button.addEventListener('click',onClick);return button}
  function wardenRewardCard(id){let button=document.createElement('button');button.className='moduleCard wardenCard'+(id==='thermal'?' tyrantCard':'');if(id==='dividend'){button.setAttribute('data-help-title','Merchant Gift');button.setAttribute('data-help','Take permanent coins because every trophy on this champion path is already mastered.');button.innerHTML='<i class="moduleIcon">$</i><strong>Merchant Gift</strong><span>All trophies from this path are mastered. Take a guaranteed purse of coins instead.</span><em>PERMANENT \u00B7 +'+CORE_DIVIDEND+' COINS</em>'}else{let def=BOSS_SCHEMATICS[id],level=schematicLevel(id);button.setAttribute('data-help-title',def.name);button.setAttribute('data-help',def.desc+' This permanent trophy improves from rank '+level+' to '+(level+1)+'.');button.innerHTML='<i class="moduleIcon">'+def.icon+'</i><strong>'+def.name+'</strong><span>'+def.desc+'</span><em>PERMANENT \u00B7 RANK '+level+' \u2192 '+(level+1)+' \u00B7 '+schematicEffect(id,level+1)+'</em>'}button.addEventListener('click',()=>chooseWardenReward(id));return button}
  function openWardenReward(cache){let def=currentBoss(),options=bossRewardOptions();moduleDecision=true;activeCache=cache;moduleStage='warden';pendingModule=null;ui.moduleEyebrow.textContent=def.name+' SEAL CLAIMED';ui.moduleTitle.textContent='CHOOSE A PERMANENT TROPHY';ui.moduleSkip.hidden=true;ui.moduleChoices.classList.add('wardenChoices');ui.moduleChoices.classList.toggle('soloChoice',options.length===1);ui.moduleChoices.innerHTML='';for(const id of options)ui.moduleChoices.appendChild(wardenRewardCard(id));ui.moduleOverlay.classList.add('show');sound('rare')}
  function chooseWardenReward(id){if(moduleStage!=='warden')return;pendingWardenReward=id;if(runStats)runStats.warden=id;moduleDecision=false;moduleStage='offer';activeCache=null;ui.moduleSkip.hidden=false;ui.moduleChoices.classList.remove('wardenChoices');ui.moduleOverlay.classList.remove('show');runNotice(id==='dividend'?'MERCHANT GIFT AT RISK':BOSS_SCHEMATICS[id].name.toUpperCase()+' AT RISK','#d6aa58');setTimeout(()=>finishBossOutcome(),220);sound('rare')}
  function renderModuleOffer(){moduleStage='offer';pendingModule=null;ui.moduleEyebrow.textContent='RELIC CACHE';ui.moduleTitle.textContent='CHOOSE A RELIC';ui.moduleSkip.hidden=false;ui.moduleChoices.classList.remove('wardenChoices','soloChoice');ui.moduleSkip.textContent='LEAVE IT';ui.moduleChoices.innerHTML='';for(const m of moduleOffer)ui.moduleChoices.appendChild(moduleCard(m,()=>chooseModule(m)))}
  function chooseModule(module){let pickup=prepareRelic(module),existing=cargo.find(m=>m.id===pickup.id);pendingModule=pickup;if(existing){let increased=fuseRelic(existing,pickup);pendingModule=existing;applyCargoEffects(existing);finishModuleChoice(increased);return}if(cargo.length<3){cargo.push(pickup);applyCargoEffects(pickup);finishModuleChoice(false);return}moduleStage='replace';ui.moduleEyebrow.textContent='RELIC RACK FULL';ui.moduleTitle.textContent='REPLACE WHICH RELIC?';ui.moduleSkip.textContent='BACK';ui.moduleChoices.innerHTML='';cargo.forEach((m,index)=>ui.moduleChoices.appendChild(moduleCard(m,()=>replaceModule(index),true)))}
  function replaceModule(index){cargo[index]=pendingModule;applyCargoEffects(pendingModule);finishModuleChoice(false)}
  function finishModuleChoice(fused){let chosen=pendingModule;moduleDecision=false;pendingModule=null;activeCache=null;ui.moduleOverlay.classList.remove('show');if(chosen){if(runStats)runStats.modules.push(chosen.id);runNotice(MODULES[chosen.id].name.toUpperCase()+(fused?' FUSED \u00B7 POWER '+Math.round((chosen.power||1)*10)/10:' INSTALLED'),fused||chosen.rare?'#d6aa58':'#79a67e')}sound(fused?'rare':'pickup')}
  function skipModule(){if(moduleStage==='warden')return;if(moduleStage==='replace'){renderModuleOffer();return}finishModuleChoice()}

  function movement(){let x=(keys.ArrowRight||keys.KeyD?1:0)-(keys.ArrowLeft||keys.KeyA?1:0)+stick.x,y=(keys.ArrowDown||keys.KeyS?1:0)-(keys.ArrowUp||keys.KeyW?1:0)+stick.y,l=Math.hypot(x,y),strength=Math.min(1,l);return l>.05?{x:x/l,y:y/l,strength}:{x:0,y:0,strength}}
  function nearestEnemy(range){let best=null,dist=range*range;for(const e of enemies){let dx=e.x-player.x,dy=e.y-player.y,d=dx*dx+dy*dy;if(d<dist&&!lineBlockedByCover(player.x,player.y,e.x,e.y,5)){dist=d;best=e}}return best}
  function playerDamageAgainst(enemy,damage){let stats=cargoStats(),mark=enemy.elite?stats.championDamage:1,finish=enemy.boss&&stats.finisher&&enemy.hp/enemy.max<=.35?1.2:1,kingTier=stats.signature.crownlessKing,king=(enemy.elite||enemy.boss)&&kingTier&&enemy.hp/enemy.max<=(kingTier===2?.4:.3)?(kingTier===2?1.35:1.2):1;return damage*mark*finish*king}
  function applyEnemyDisplacement(enemy,nx,ny,options,falloff){
    options=options||{};let profile=DISPLACEMENT[options.mode]||DISPLACEMENT.none,strength=options.strength==null?profile.strength:Math.max(0,options.strength);if(!profile.direction||!strength)return;
    let bossScale=enemy.boss?profile.bossScale:1,force=strength*profile.direction*falloff*bossScale;enemy.knockVx=nx*force;enemy.knockVy=ny*force;enemy.knockTime=enemy.boss?Math.min(.06,profile.duration):profile.duration
  }
  function physicalShockwave(x,y,radius,damage,color,minRadius,displacement){
    minRadius=minRadius||0;let hits=0;
    for(const enemy of enemies){if(enemy.dead)continue;let dx=enemy.x-x,dy=enemy.y-y,distance=Math.hypot(dx,dy)||1;if(distance<minRadius||distance>radius+enemy.r||lineBlockedByCover(x,y,enemy.x,enemy.y,2))continue;let falloff=.48+.52*(1-distance/(radius+enemy.r)),nx=dx/distance,ny=dy/distance;applyEnemyDisplacement(enemy,nx,ny,displacement,falloff);damageEnemy(enemy,playerDamageAgainst(enemy,damage*falloff),x,y,true);hits++}
    if(displacement&&displacement.visual==='blackHole'){effects.push({kind:'blackHoleVfx',phase:'pulse',x,y,r:Math.max(8,minRadius),maxR:radius,life:BLACK_HOLE_STORM.pulseDuration,max:BLACK_HOLE_STORM.pulseDuration,color:'#4bbcff',size:radius*2.18});spawnGravityMotes(x,y,Math.min(28,10+hits),radius*.9,false)}
    else{effects.push({kind:'pressureWave',x,y,r:Math.max(8,minRadius),maxR:radius,life:.38,max:.38,color:color||'#d6aa58'});if(save.settings.particles)burst(x,y,color||'#d6aa58',Math.min(34,12+hits),1.15+Math.min(.5,hits*.025))}
    if(hits){shake=Math.max(shake,Math.min(10,3+hits*.25));hitStop=Math.max(hitStop,hits>=12?.045:hits>=5?.026:.014)}return hits
  }
  function triggerGravityWell(x,y,damage,tier){
    let mastered=tier===2,radius=mastered?188:154,hits=physicalShockwave(x,y,radius,damage*(mastered?.46:.3),'#4bbcff',0,{mode:'vortex',strength:mastered?300:220,visual:'blackHole'});
    if(hits){shake=Math.max(shake,mastered?11:8);hitStop=Math.max(hitStop,mastered?.052:.036);sound('rare')}
    return hits
  }
  function counterBurst(){physicalShockwave(player.x,player.y,112,shotDamage()*.72,'#f4ead6',0,{mode:'none'});effects.push({kind:'groundCrack',x:player.x,y:player.y,r:10,maxR:74,life:.34,max:.34,color:'#d6aa58'})}
  function fieldRepair(fraction){if(!player||player.hp>=player.maxHp)return 0;let amount=Math.min(player.maxHp-player.hp,Math.ceil(player.maxHp*fraction));player.hp+=amount;effects.push({x:player.x,y:player.y,r:8,maxR:52,life:.45,max:.45,color:'#79a67e'});burst(player.x,player.y,'#b5d4ad',12,.7);return amount}
  function releaseStormDash(tier,dx,dy){let reach=tier===2?150:118,width=tier===2?72:58,damage=shotDamage()*(tier===2?.72:.5),hits=0;for(const enemy of enemies){if(enemy.dead)continue;let rx=enemy.x-player.x,ry=enemy.y-player.y,forward=rx*dx+ry*dy,side=Math.abs(rx*dy-ry*dx);if(forward<0||forward>reach||side>width||lineBlockedByCover(player.x,player.y,enemy.x,enemy.y,2))continue;enemy.knockVx=dx*(tier===2?390:320);enemy.knockVy=dy*(tier===2?390:320);enemy.knockTime=.2;damageEnemy(enemy,damage,player.x,player.y,true);hits++}effects.push({kind:'groundCrack',x:player.x+dx*reach*.45,y:player.y+dy*reach*.45,angle:Math.atan2(dy,dx),r:8,maxR:reach*.55,life:.34,max:.34,color:'#79e7f2'});if(hits)hitStop=Math.max(hitStop,.025)}
  function damagePlayer(amount){if(player.inv>0)return false;let stats=cargoStats();if(stats.bulwark&&(player.guardCd||0)<=0){player.guardCd=stats.bulwark===2?6:8;player.inv=.3;shake=Math.max(shake,5);burst(player.x,player.y,'#9eb2d5',22,1.2);effects.push({x:player.x,y:player.y,r:8,maxR:66,life:.38,max:.38,color:'#9eb2d5'});if(stats.bulwark===2)counterBurst();sound('shield');updateHud();return false}if(player.shields>0){player.shields--;player.inv=.35;shake=Math.max(shake,4);burst(player.x,player.y,'#e0ad4f',18,1.1);if(stats.counter)counterBurst();sound('shield');updateHud();return false}amount=Math.max(1,amount*(1-stats.armor)*stats.riskTaken);let applied=Math.min(player.hp,amount);player.hp-=amount;if(runStats)runStats.damage+=applied;player.inv=.6;shake=Math.max(shake,9);flash=.12;burst(player.x,player.y,'#b52d31',12,1);effects.push({x:player.x,y:player.y,r:5,maxR:42,life:.25,max:.25,color:'#b52d31'});sound('hurt');if(player.hp<=0&&stats.signature.fatebound===2&&!player.fateSaved){player.fateSaved=true;player.hp=Math.max(1,Math.ceil(player.maxHp*.18));player.inv=1.2;flash=.2;shake=Math.max(shake,14);burst(player.x,player.y,'#e65a62',38,1.8);effects.push({x:player.x,y:player.y,r:12,maxR:110,life:.7,max:.7,color:'#e65a62'});updateHud();sound('legendary');return false}if(player.hp<=0){player.hp=0;updateHud();returnBase(false,'PAPPA HAMMER DOWN');return true}return false}
  function burstVolleyBonus(power,rig){rig=rig||player;let shots=Math.floor(power+.0001),echo=Math.max(0,power-shots);rig.burstCharge=(rig.burstCharge||0)+echo;if(rig.burstCharge>=.9999){shots++;rig.burstCharge-=1}return Math.min(3,shots)}
  function releaseHammerStrike(strike){
    let angle=Math.atan2(strike.ny,strike.nx),originX=player.x,originY=player.y,impactX=originX+strike.nx*42,impactY=originY+strike.ny*42,critical=strike.forceCritical||Math.random()<strike.crit,echoBoost=1+Math.max(0,strike.count-1)*.34,damage=strike.damage*echoBoost*(critical?1.8:1),primary=null,best=Infinity;
    for(const enemy of enemies){if(enemy.dead)continue;let dx=enemy.x-impactX,dy=enemy.y-impactY,distance=Math.hypot(dx,dy);if(distance<=MELEE.impactRadius+enemy.r&&!lineBlockedByCover(originX,originY,enemy.x,enemy.y,2)){let nx=(enemy.x-originX)/(Math.hypot(enemy.x-originX,enemy.y-originY)||1),ny=(enemy.y-originY)/(Math.hypot(enemy.x-originX,enemy.y-originY)||1);if(nx*strike.nx+ny*strike.ny<-.1)continue;enemy.knockVx=nx*(enemy.boss?80:340);enemy.knockVy=ny*(enemy.boss?80:340);enemy.knockTime=enemy.boss?.06:.2;damageEnemy(enemy,playerDamageAgainst(enemy,damage),impactX,impactY,true);if(distance<best){best=distance;primary=enemy}}}
    let waveRadius=strike.explosive?MELEE.shockwaveRadius:strike.shockwave?MELEE.shockwaveRadius+28:116;physicalShockwave(impactX,impactY,waveRadius,damage*(strike.explosive?.5:.28),strike.thermal?'#c83f46':strike.color,MELEE.impactRadius*.7,{mode:'none'});if(strike.gravityWell)triggerGravityWell(impactX,impactY,damage,strike.gravityWell);
    if(primary&&!primary.dead){if(critical&&strike.critEcho)triggerCritEcho(primary,impactX,impactY,damage,strike.critEcho);if(critical&&strike.moonArc)triggerMoonArc(primary,impactX,impactY,damage,strike.moonArc);if(strike.shockwave)triggerHammerWave(primary,impactX,impactY,damage,strike.shockwave)}
    effects.push({kind:'hammerSwing',x:originX+strike.nx*9,y:originY+strike.ny*9,angle,r:12,maxR:strike.explosive?54:44,life:.22,max:.22,color:strike.thermal?'#c83f46':strike.color});effects.push({kind:'groundCrack',x:impactX,y:impactY,angle,r:6,maxR:waveRadius*.58,life:.4,max:.4,color:strike.thermal?'#c83f46':strike.color});
    if(save.settings.particles)for(let i=0;i<5&&particles.length<LIMITS.particles;i++){let spread=(Math.random()-.5)*.85,a=angle+spread,speed=65+Math.random()*85;particles.push({x:originX+strike.nx*18,y:originY+strike.ny*18,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,life:.16+Math.random()*.1,max:.26,r:2+Math.random()*2,color:i%2?'#f4ead6':strike.color})}
    shake=Math.max(shake,strike.explosive?7:4);hitStop=Math.max(hitStop,critical?.038:.022);sound('hit')
  }
  function fireAt(target){
    let dx=target.x-player.x,dy=target.y-player.y,l=Math.hypot(dx,dy)||1;if(l>MELEE.reach+target.r)return false;let nx=dx/l,ny=dy/l,stats=cargoStats(),thermal=player.thermalCharges>0,blast=thermalBlast(schematicLevel('thermal')),hammer=equippedItem('hammer'),hammerColor=hammer?hammer.visual.accent:'#d6aa58';
    player.angle=Math.atan2(dy,dx);player.facing=nx<0?-1:1;player.fire=Math.max(.1,Math.max(.18,.39-save.weapon*.011)*stats.fire);player.recoil=.08;if(player.attackAnim<=.04)player.attackAnim=player.attackDuration;player.volley++;
    let signature=stats.signature,banner=signature.redBanner&&player.volley%(signature.redBanner===2?4:5)===0?signature.redBanner:0,starfall=signature.starforge&&player.volley%(signature.starforge===2?4:6)===0?signature.starforge:0,fated=signature.fatebound&&player.volley%(signature.fatebound===2?5:7)===0,forceCritical=player.signatureCrits>0||fated,count=1+burstVolleyBonus(stats.burst),explosive=thermal||banner||starfall||(stats.shrapnel&&player.volley%3===0),damageBoost=(thermal?blast.damage:1)*(banner?(banner===2?1.3:1.18):1)*(starfall?(starfall===2?1.48:1.3):1)*(player.phantomStrike?(player.phantomStrike===2?1.45:1.25):1)*(1+(player.travelCharge||0)*(signature.grandWayfarer===2?.45:.25)),shockwave=stats.hammerWave&&player.volley%(stats.hammerWave===2?3:4)===0?stats.hammerWave:0,gravityWell=stats.gravityWell&&player.volley%(stats.gravityWell===2?3:5)===0?stats.gravityWell:0;
    if(player.signatureCrits>0)player.signatureCrits--;player.phantomStrike=0;player.travelCharge=0;
    if(thermal)player.thermalCharges--;
    pendingStrikes.push({delay:.075,nx,ny,count,explosive,thermal,banner,starfall,forceCritical,crit:stats.crit,critEcho:stats.critEcho,moonArc:signature.moonbreaker,shockwave,gravityWell,damage:shotDamage()*stats.damage*damageBoost,color:hammerColor});return true
  }
  function combatViewContains(x,y,r,margin,cam){cam=cam||camera();margin=margin==null?ENEMY_VIEW_MARGIN:margin;let halfW=W/(2*cam.zoom),halfH=H/(2*cam.zoom);return x+r>=cam.x-halfW-margin&&x-r<=cam.x+halfW+margin&&y+r>=cam.y-halfH-margin&&y-r<=cam.y+halfH+margin}
  function enemyCanAttack(e){let inset=e?Math.min(16,e.r*.4):0;return !!(e&&!(e.spawnGrace>0)&&combatViewContains(e.x,e.y,0,-inset)&&!lineBlockedByCover(e.x,e.y,player.x,player.y,5))}
  function lockEnemyAim(e,nx,ny){let length=Math.hypot(nx,ny)||1;e.aimX=nx/length;e.aimY=ny/length}
  function enemyShot(e,angle,speed,damage,kind,turn){
    if(enemyBullets.length>=LIMITS.enemyBullets||!enemyCanAttack(e))return false;
    let r=kind==='wave'?10:kind==='core'?9:kind==='flame'?8:kind==='arc'||kind==='shard'?7:6,x=e.x+Math.cos(angle)*e.r,y=e.y+Math.sin(angle)*e.r;
    if(!combatViewContains(x,y,r,0))return false;
    enemyBullets.push({x,y,vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r,life:4.6,damage,kind:kind||'rivet',turn:turn||0,source:e.bossKind||e.type,seen:true});return true
  }
  function shootEnemy(e,nx,ny){
    if(e.aimX||e.aimY){nx=e.aimX;ny=e.aimY}
    let a=Math.atan2(ny,nx),speed=205+depth*5,fan=(e.elite||depth>=3)&&e.pattern++%2===1,fired=false;
    if(fan){for(let i=-1;i<=1;i++)fired=enemyShot(e,a+i*.13,speed-(Math.abs(i)*12),e.damage*.38,'rivet')||fired}
    else fired=enemyShot(e,a,speed,e.damage,'rivet');
    if(fired){e.recoil=.18;sound('shoot')}else e.fire=Math.max(e.fire,.42)
  }
  function spawnChampionStandards(e,count){if(!enemyCanAttack(e))return;for(let i=0;i<count;i++){let a=i*Math.PI*2/count+e.phase,d=95+Math.random()*165,pos=openArenaPosition(player.x+Math.cos(a)*d,player.y+Math.sin(a)*d,52);hazards.push({x:pos.x,y:pos.y,r:48,type:'standard',warm:1.15,active:.42,life:1.65,hit:false,damage:e.damage*.58})}}
  function spawnLagoonPools(e,count){if(!enemyCanAttack(e))return;for(let i=0;i<count;i++){let a=i*Math.PI*2/count+e.phase,d=105+Math.random()*165,pos=openArenaPosition(player.x+Math.cos(a)*d,player.y+Math.sin(a)*d,56);hazards.push({x:pos.x,y:pos.y,r:52,type:'lagoonPool',warm:1.15,active:.56,life:1.78,hit:false,damage:e.damage*.52,phase:a})}}
  function spawnBossLane(e,type,angle,width,length,warm,damage,offset){
    if(!enemyCanAttack(e))return;
    let start=(offset||0)+e.r*.58,x=e.x+Math.cos(angle)*start,y=e.y+Math.sin(angle)*start;
    hazards.push({x,y,r:width*.5,type,angle,width,length,warm,active:.28,life:warm+.28,hit:false,damage,phase:e.phase})
  }
  function spawnVaultSeals(e,count){
    if(!enemyCanAttack(e))return;
    for(let i=0;i<count;i++){
      let a=i*Math.PI*2/count+e.phase,d=78+Math.random()*145,pos=openArenaPosition(player.x+Math.cos(a)*d,player.y+Math.sin(a)*d,42);
      hazards.push({x:pos.x,y:pos.y,r:40,type:'vaultSeal',warm:1.08,active:.42,life:1.5,hit:false,damage:e.damage*.48,phase:a})
    }
  }
  function spawnWardenLock(e,aim){
    if(!enemyCanAttack(e))return;
    let angle=aim+Math.PI*.5,length=430,x=player.x-Math.cos(angle)*length*.5,y=player.y-Math.sin(angle)*length*.5;
    hazards.push({x,y,r:29,type:'wardenLock',angle,width:58,length,warm:.7,active:.28,life:.98,hit:false,damage:e.damage*.54,phase:e.phase})
  }
  function tyrantVolley(e,nx,ny){
    if(!enemyCanAttack(e)){e.fire=.42;return}
    let aim=Math.atan2(ny,nx),stage=e.bossStage||1,pattern=e.pattern++;
    if(stage===1){
      if(pattern%3===2)spawnBossLane(e,'crimsonCleave',aim,54,390,.78,e.damage*.58);
      else for(let i=-3;i<=3;i++)enemyShot(e,aim+i*.13,212,e.damage*.52,'flame');
      if(pattern%2===1)for(let i=0;i<8;i++)enemyShot(e,i*Math.PI/4+e.phase,138,e.damage*.34,'flame')
    }else if(stage===2){
      for(let i=-4;i<=4;i++)enemyShot(e,aim+i*.14,225,e.damage*.46,'flame');
      spawnChampionStandards(e,3);
      if(pattern%2===0)spawnBossLane(e,'crimsonCleave',aim+(pattern%4?-.34:.34),62,430,.68,e.damage*.56);
      if(pattern%3===2)spawnEnemy(false,'brute')
    }else{
      if(pattern%2===0){
        spawnBossLane(e,'crimsonCleave',aim-.22,66,455,.58,e.damage*.62);
        spawnBossLane(e,'crimsonCleave',aim+.22,66,455,.58,e.damage*.62)
      }else{
        for(let i=0;i<14;i++)enemyShot(e,i*Math.PI*2/14+e.phase,188,e.damage*.38,'flame',(i%2?1:-1)*.12);
        for(let i=-2;i<=2;i++)enemyShot(e,aim+i*.11,260,e.damage*.58,'core')
      }
      if(pattern%2===1)spawnChampionStandards(e,4)
    }
    e.phase+=stage===3?.37:.29;e.recoil=.2;effects.push({x:e.x,y:e.y,r:e.r*.72,maxR:e.r*1.75,life:.28,max:.28,color:'#c83f46'});shake=Math.max(shake,stage===3?6:4);sound('boss')
  }
  function leviathanVolley(e,nx,ny){
    if(!enemyCanAttack(e)){e.fire=.42;return}
    let aim=Math.atan2(ny,nx),stage=e.bossStage||1,pattern=e.pattern++;
    if(stage===1){
      if(pattern%3===2)spawnBossLane(e,'tidalLane',aim,66,430,.88,e.damage*.5);
      else for(let i=-2;i<=2;i++)enemyShot(e,aim+i*.15,220,e.damage*.56,'shard',(i%2?1:-1)*.035);
      if(pattern%2===1)for(let i=0;i<10;i++){let a=i*Math.PI*2/10+e.phase,diff=Math.abs(Math.atan2(Math.sin(a-aim),Math.cos(a-aim)));if(diff>.42)enemyShot(e,a,150,e.damage*.34,'shard',(i%2?1:-1)*.07)}
    }else if(stage===2){
      for(let i=0;i<14;i++){let a=i*Math.PI*2/14+e.phase,diff=Math.abs(Math.atan2(Math.sin(a-aim),Math.cos(a-aim)));if(diff>.46)enemyShot(e,a,168,e.damage*.42,'shard',(i%2?1:-1)*.12)}
      spawnLagoonPools(e,3);
      if(pattern%2===1)spawnBossLane(e,'tidalLane',aim+Math.PI*.5,72,460,.78,e.damage*.48,-105);
      if(pattern%2===0)for(let i=-1;i<=1;i++)enemyShot(e,aim+i*.2,206,e.damage*.48,'wave');
    }else{
      if(pattern%2===0){
        spawnBossLane(e,'tidalLane',aim-.42,76,480,.62,e.damage*.54);
        spawnBossLane(e,'tidalLane',aim+.42,76,480,.62,e.damage*.54)
      }else{
        for(let i=0;i<16;i++){let a=i*Math.PI*2/16+e.phase,diff=Math.abs(Math.atan2(Math.sin(a-aim),Math.cos(a-aim)));if(diff>.38)enemyShot(e,a,190,e.damage*.4,'shard',(i%2?1:-1)*.2)}
        for(let i=-2;i<=2;i++)enemyShot(e,aim+i*.13,238,e.damage*.52,'wave',(i%2?1:-1)*.035)
      }
      if(pattern%2===0)spawnLagoonPools(e,4);
    }
    e.phase+=stage===3?.33:.41;e.recoil=.2;effects.push({x:e.x,y:e.y,r:e.r*.72,maxR:e.r*1.9,life:.32,max:.32,color:stage===3?'#f29ab8':'#79e7f2'});shake=Math.max(shake,stage===3?6:4);sound('boss')
  }
  function bossVolley(e,nx,ny){
    if(!enemyCanAttack(e)){e.fire=.42;return}
    if(e.bossKind==='tyrant'){tyrantVolley(e,nx,ny);return}
    if(e.bossKind==='leviathan'){leviathanVolley(e,nx,ny);return}
    let aim=Math.atan2(ny,nx),stage=e.bossStage||1,pattern=e.pattern++;
    if(stage===1){
      for(let i=-2;i<=2;i++)enemyShot(e,aim+i*.16,228,e.damage*.66,'core');
      if(pattern%2===1)for(let i=0;i<7;i++)enemyShot(e,i*Math.PI*2/7+e.phase,145,e.damage*.4,'rivet');
      if(pattern%3===2)spawnVaultSeals(e,2)
    }else if(stage===2){
      if(pattern%2===0)for(let i=0;i<16;i++){let a=i*Math.PI*2/16+e.phase,diff=Math.abs(Math.atan2(Math.sin(a-aim),Math.cos(a-aim)));if(diff>.27)enemyShot(e,a,174,e.damage*.46,'arc',(i%2?1:-1)*.14)}
      else spawnVaultSeals(e,3);
      if(pattern%3===2){spawnEnemy(false,'rusher');spawnEnemy(false,'rusher')}
    }else{
      if(pattern%2===0){
        spawnVaultSeals(e,4);
        for(let i=-2;i<=2;i++)enemyShot(e,aim+i*.12,260,e.damage*.66,'core')
      }else{
        for(let i=0;i<18;i++){let a=i*Math.PI*2/18+e.phase;enemyShot(e,a,194,e.damage*.42,'arc',(i%2?1:-1)*.28)}
        spawnWardenLock(e,aim)
      }
      if(pattern%3===2)spawnEnemy(true,'lancer')
    }
    e.phase+=stage===3?.31:.43;e.recoil=.2;effects.push({x:e.x,y:e.y,r:e.r*.7,maxR:e.r*1.9,life:.3,max:.3,color:stage===1?'#d6aa58':stage===2?'#f4ead6':'#9eb2d5'});shake=Math.max(shake,stage===3?6:4);sound('boss')
  }
  function destroyEnemy(e){
    if(e.dead)return;e.dead=true;if(runStats){runStats.kills++;if(e.elite)runStats.elites++}if(e.boss){defeatBoss(e);return}if(waveDirector.phase!=='idle')waveDirector.kills++;
    let stats=cargoStats(),signature=stats.signature,spinKill=!!(e.spinLaunched&&player&&(player.spinTime>0||player.spinFinishing));if(e.elite&&stats.pursuit){player.dashCd=0;effects.push({x:player.x,y:player.y,r:7,maxR:44,life:.3,max:.3,color:'#d6aa58'})}if(signature.trailwarden){let recovery=e.elite?(signature.trailwarden===2?1.4:.8):(signature.trailwarden===2?.28:.15);player.dashCd=Math.max(0,player.dashCd-recovery)}if(e.elite&&signature.kingsRoad){fieldRepair(signature.kingsRoad===2?.09:.05);if(signature.kingsRoad===2)player.shields=Math.max(player.shields,1)}shake=Math.max(shake,e.elite?6:spinKill?4:2.5);let base=1+depth+riskTier+(e.elite?5+depth*2:0)+(e.eventReward||0),coinMult=signature.coinseeker?(signature.coinseeker===2?1.6:1.3):1,eliteBounty=e.elite&&signature.coinseeker===2?4+depth:0,coins=Math.max(1,Math.round(base*lootMultiplier()*coinMult+eliteBounty));runScrap+=coins;
    if(spinKill){player.spinKills++;player.spinCoins+=coins;effects.push({kind:'enemyLaunch',x:e.x,y:e.y,r:e.r,maxR:e.r,life:.48,max:.48,color:e.elite?'#d6aa58':e.type==='brute'?'#c2b9a5':e.type==='lancer'?'#9eb2d5':'#c83f46',vx:(e.knockVx||0)*.82,vy:(e.knockVy||0)*.82,rot:(Math.random()-.5)*2.2,spin:(Math.random()<.5?-1:1)*(7+Math.random()*6),enemyType:e.type,elite:e.elite})}
    else effects.push({kind:'coinText',x:e.x,y:e.y,r:0,maxR:0,life:.42,max:.42,color:'#d6aa58',text:'+$'+coins});
    burst(e.x,e.y,e.elite?'#d6aa58':e.type==='brute'?'#c2b9a5':e.type==='lancer'?'#9eb2d5':'#c83f46',e.elite?20:spinKill?15:10,e.elite?1.35:spinKill?1.25:1);if(!spinKill)sound(e.elite?'rare':'kill');updateHud()
  }
  function triggerCritEcho(primary,x,y,damage,tier){let radius=tier===2?82:58,mult=tier===2?.48:.32;effects.push({x,y,r:7,maxR:radius,life:.3,max:.3,color:'#ec9295'});for(const other of enemies){if(other===primary||other.dead)continue;let dx=other.x-x,dy=other.y-y;if(dx*dx+dy*dy<radius*radius&&!lineBlockedByCover(x,y,other.x,other.y,2))damageEnemy(other,damage*mult,x,y,true)}if(tier===2)player.fire=Math.max(0,player.fire-.09)}
  function triggerMoonArc(primary,x,y,damage,tier){let current=primary,used=new Set([primary]),chains=tier===2?2:1,radius=tier===2?170:130,mult=tier===2?.52:.38;for(let chain=0;chain<chains;chain++){let target=enemies.filter(other=>!other.dead&&!used.has(other)&&Math.hypot(other.x-current.x,other.y-current.y)<=radius&&!lineBlockedByCover(current.x,current.y,other.x,other.y,2)).sort((a,b)=>Math.hypot(a.x-current.x,a.y-current.y)-Math.hypot(b.x-current.x,b.y-current.y))[0];if(!target)break;used.add(target);effects.push({kind:'lunarArc',x:current.x,y:current.y,tx:target.x,ty:target.y,r:4,maxR:18,life:.22,max:.22,color:'#aebcf0'});damageEnemy(target,damage*mult,current.x,current.y,true);current=target}}
  function triggerHammerWave(primary,x,y,damage,tier){let radius=tier===2?122:88,mult=tier===2?.66:.46;effects.push({x,y,r:10,maxR:radius,life:.42,max:.42,color:'#d7c1ff'});burst(x,y,'#d7c1ff',tier===2?24:16,tier===2?1.35:1);for(const other of enemies){if(other===primary||other.dead)continue;let dx=other.x-x,dy=other.y-y;if(dx*dx+dy*dy<radius*radius&&!lineBlockedByCover(x,y,other.x,other.y,2))damageEnemy(other,damage*mult,x,y,true)}shake=Math.max(shake,tier===2?5:3)}
  function damageEnemy(e,amount,x,y,strong){if(!e||e.dead)return;e.hp-=amount;e.hit=strong ? .115 : .07;impact(x==null?e.x:x,y==null?e.y:y,e.boss?'#f4ead6':strong?'#d6aa58':'#efe1c6',strong?1.5:.7);if(e.boss){ui.bossHealthFill.style.width=Math.max(0,e.hp/e.max*100)+'%';let pct=e.hp/e.max,stage=pct<=.33?3:pct<=.67?2:1;if(stage!==e.bossStage)setBossStage(e,stage)}if(e.hp<=0)destroyEnemy(e)}
  function spawnHazard(){if(depth!==3&&depth!==4)return;let a=Math.random()*Math.PI*2,d=130+Math.random()*190,isFurnace=route==='furnace',type=isFurnace?(depth===3?'steam':'fire'):'arc',warm=type==='steam'?1.15:type==='arc'?1:.9,active=type==='steam'?.7:type==='fire'?.58:.45,r=type==='steam'?64:type==='fire'?58:76,pos=openArenaPosition(player.x+Math.cos(a)*d,player.y+Math.sin(a)*d,r+4);hazards.push({x:pos.x,y:pos.y,r,type,warm,active,life:warm+active,hit:false,damage:type==='steam'?8:type==='fire'?11:depth===3?7:10})}
  function pointSegmentDistance(px,py,x,y,angle,length){
    let dx=Math.cos(angle),dy=Math.sin(angle),projection=Math.max(0,Math.min(length,(px-x)*dx+(py-y)*dy)),cx=x+dx*projection,cy=y+dy*projection;
    return Math.hypot(px-cx,py-cy)
  }
  function updateHazards(dt){
    hazardClock-=dt;
    if(!bossActive&&(depth===3||depth===4)&&hazardClock<=0){hazardClock=route==='furnace'?(depth===3?3.6:2.85):(depth===3?3.8:3.25);spawnHazard()}
    for(const h of hazards){
      h.life-=dt;if(h.warm>0){h.warm-=dt;continue}h.active-=dt;
      let lane=h.type==='crimsonCleave'||h.type==='tidalLane'||h.type==='wardenLock',inside=lane?pointSegmentDistance(player.x,player.y,h.x,h.y,h.angle,h.length)<h.width*.5:Math.hypot(player.x-h.x,player.y-h.y)<h.r;
      if(lane&&lineBlockedByCover(h.x,h.y,player.x,player.y,5))inside=false;
      if(!h.hit&&inside){h.hit=true;if(damagePlayer(h.damage||10))return true}
    }
    hazards=hazards.filter(h=>h.life>0);return false
  }

  function cancelEnemyWindup(e){e.charge=0;e.fire=Math.max(e.fire,.38);e.aimX=0;e.aimY=0}
  function startEnemyWindup(e,time,nx,ny){lockEnemyAim(e,nx,ny);e.charge=time;e.dashDistance=0}
  function prepareEnemyDash(e,distance,speed,overshoot){
    e.dashDistance=Math.max(e.r*3,Math.max(0,distance||0)+overshoot);
    e.dashSpeed=speed;e.dashTime=e.dashDistance/speed;e.dashMax=e.dashTime;e.dashX=e.aimX;e.dashY=e.aimY;e.attack=0;e.recoil=.16
  }
  function finishEnemyDash(e,recovery,color){
    e.dashTime=0;e.recover=Math.max(e.recover||0,recovery);e.charge=0;e.aimX=0;e.aimY=0;
    effects.push({kind:'tankImpact',x:e.x,y:e.y,angle:e.angle,r:8,maxR:e.type==='brute'?46:32,life:.24,max:.24,color:color||'#c83f46'})
  }
  function hordeDirection(e,nx,ny,dt){
    if(!e.packId||e.boss)return {x:nx,y:ny};
    let follow=.42+(e.type==='rusher'?.16:e.type==='brute'?.05:0),blend=Math.min(1,dt*follow);e.packX+=(player.x-e.packX)*blend;e.packY+=(player.y-e.packY)*blend;
    let dx=e.packX-e.x,dy=e.packY-e.y,distance=Math.hypot(dx,dy)||1,cohesion=Math.max(0,Math.min(.38,(distance-HORDE.cohesionRadius)/260));
    let x=nx*(1-cohesion)+dx/distance*cohesion,y=ny*(1-cohesion)+dy/distance*cohesion,length=Math.hypot(x,y)||1;return{x:x/length,y:y/length}
  }
  function separateEnemyHorde(dt){
    let cellSize=64,buckets=new Map(),regular=enemies.filter(enemy=>!enemy.dead&&!enemy.boss&&(enemy.knockTime||0)<=0);
    for(let index=0;index<regular.length;index++){let enemy=regular[index];enemy._separateOrder=index;let key=Math.floor(enemy.x/cellSize)+','+Math.floor(enemy.y/cellSize),bucket=buckets.get(key);if(bucket)bucket.push(enemy);else buckets.set(key,[enemy])}
    for(const enemy of regular){
      let cellX=Math.floor(enemy.x/cellSize),cellY=Math.floor(enemy.y/cellSize);
      for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++){let bucket=buckets.get((cellX+ox)+','+(cellY+oy));if(!bucket)continue;for(const other of bucket){if(other===enemy||other._separateOrder<=enemy._separateOrder)continue;let dx=other.x-enemy.x,dy=other.y-enemy.y,distance=Math.hypot(dx,dy)||.001,minimum=(enemy.r+other.r)*1.18;if(distance>=minimum)continue;let push=Math.min((minimum-distance)*.5,1.2+dt*38),nx=dx/distance,ny=dy/distance,enemyX=enemy.x-nx*push,enemyY=enemy.y-ny*push,otherX=other.x+nx*push,otherY=other.y+ny*push;if(!pointBlocked(enemyX,enemyY,enemy.r)){enemy.x=enemyX;enemy.y=enemyY}if(!pointBlocked(otherX,otherY,other.r)){other.x=otherX;other.y=otherY}}}
    }
    for(const enemy of regular)delete enemy._separateOrder
  }
  function updateEnemyEntity(e,dt){
    e.anim=(e.anim||0)+dt;e.hit=Math.max(0,e.hit-dt);e.attack=Math.max(0,e.attack-dt);e.fire-=dt;e.recover=Math.max(0,(e.recover||0)-dt);e.recoil=Math.max(0,(e.recoil||0)-dt);e.spawnGrace=Math.max(0,(e.spawnGrace||0)-dt);e.think=(e.think||0)-dt;e.stepFx=(e.stepFx||0)-dt;e.spinHitCd=Math.max(0,(e.spinHitCd||0)-dt);
    let beforeX=e.x,beforeY=e.y,dx=player.x-e.x,dy=player.y-e.y,l=Math.hypot(dx,dy)||1,nx=dx/l,ny=dy/l,direction=hordeDirection(e,nx,ny,dt);nx=direction.x;ny=direction.y;let arrival=e.spawnGrace>0?.82:1,canAttack=enemyCanAttack(e,ENEMY_VIEW_MARGIN),knocked=e.knockTime>0;e.angle=Math.atan2(dy,dx);
    if(knocked&&!e.boss){e.knockTime=Math.max(0,e.knockTime-dt);e.x+=(e.knockVx||0)*dt;e.y+=(e.knockVy||0)*dt;let friction=Math.pow(.018,dt);e.knockVx*=friction;e.knockVy*=friction;e.charge=0;e.dashTime=0;e.recover=Math.max(e.recover,.18)}
    else if(e.boss){
      if(e.stagger>0){e.stagger=Math.max(0,e.stagger-dt);e.charge=0;e.fire=Math.max(e.fire,.24);e.recoil=.06}
      else{
      let stage=e.bossStage||1,tyrant=e.bossKind==='tyrant',lagoon=e.bossKind==='leviathan',desired=lagoon?(stage===1?315:stage===2?280:245):tyrant?(stage===1?270:stage===2?235:205):(stage===1?295:stage===2?255:220),approach=l>desired+35?1:l<desired-45?-1:0,orbit=lagoon?(stage===3?.92:stage===2?.78:.6):tyrant?(stage===3?.48:stage===2?.34:.22):(stage===3?.72:stage===2?.56:.4),orbitDir=lagoon?e.strafe:1;
      if(lagoon&&e.think<=0){e.strafe*=-1;e.think=.95+Math.abs(Math.sin(e.anim*.7))*.55}
      orbit*=lagoon?.88+Math.sin(e.anim*.8)*.18:1;e.x+=(nx*approach-ny*orbit*orbitDir)*e.speed*dt;e.y+=(ny*approach+nx*orbit*orbitDir)*e.speed*dt;
      if(e.charge>0){if(!canAttack)cancelEnemyWindup(e);else{e.charge-=dt;if(e.charge<=0)bossVolley(e,e.aimX,e.aimY)}}
      else if(e.fire<=0){if(canAttack){startEnemyWindup(e,lagoon?(stage===1?.64:stage===2?.7:.48):tyrant?(stage===1?.6:stage===2?.56:.44):(stage===1?.56:stage===2?.68:.46),nx,ny);e.fire=lagoon?(stage===1?1.72:stage===2?1.5:1.18):tyrant?(stage===1?1.62:stage===2?1.42:1.16):(stage===1?1.7:stage===2?1.5:1.2)}else e.fire=.12}
      }
    }else if(e.type==='shooter'){
      if(e.think<=0){e.strafe*=-1;e.think=.62+Math.abs(Math.sin(e.anim*.7+e.seed))*.48}
      let approach=l>330?1:l<215?-1:0,orbit=.48+Math.sin(e.anim*1.7+e.seed)*.15,motion=e.charge>0?.25:e.recover>0?.55:1;
      e.x+=(nx*approach-ny*orbit*e.strafe)*e.speed*dt*motion*arrival;e.y+=(ny*approach+nx*orbit*e.strafe)*e.speed*dt*motion*arrival;
      if(e.charge>0){if(!canAttack)cancelEnemyWindup(e);else{e.charge-=dt;if(e.charge<=0)shootEnemy(e,nx,ny)}}
      else if(e.recover<=0&&e.fire<=0){if(canAttack){startEnemyWindup(e,.42,nx,ny);e.fire=Math.max(.82,1.78-depth*.04-riskTier*.055)}else e.fire=.12}
    }else if(e.type==='brute'){
      if(e.dashTime>0){e.dashTime-=dt;e.x+=e.dashX*(e.dashSpeed||TANK_RUSH_SPEED)*dt;e.y+=e.dashY*(e.dashSpeed||TANK_RUSH_SPEED)*dt;if(e.dashTime<=0)finishEnemyDash(e,TANK_RUSH_RECOVERY,'#c83f46')}
      else if(e.charge>0){if(!canAttack)cancelEnemyWindup(e);else{e.charge-=dt;e.x-=e.aimX*e.speed*.1*dt;e.y-=e.aimY*e.speed*.1*dt;if(e.charge<=0){prepareEnemyDash(e,e.lockDistance||l,TANK_RUSH_SPEED,TANK_RUSH_OVERSHOOT);sound('dash')}}}
      else if(e.recover<=0){let approach=l>145?1:l<92?-.18:0,weave=Math.sin(e.anim*2.25+e.seed)*.13;e.x+=(nx*approach-ny*weave)*e.speed*dt*arrival;e.y+=(ny*approach+nx*weave)*e.speed*dt*arrival;if(e.fire<=0){if(canAttack&&l<TANK_RUSH_RANGE&&l>70){e.lockDistance=l;startEnemyWindup(e,TANK_RUSH_WINDUP,nx,ny);e.fire=4.2}else e.fire=.14}}
    }else if(e.type==='lancer'){
      if(e.dashTime>0){e.dashTime-=dt;e.x+=e.dashX*(e.dashSpeed||LANCER_THRUST_SPEED)*dt;e.y+=e.dashY*(e.dashSpeed||LANCER_THRUST_SPEED)*dt;if(e.dashTime<=0)finishEnemyDash(e,.3,'#8f9dff')}
      else if(e.recover>0){e.x-=nx*e.speed*dt*.18;e.y-=ny*e.speed*dt*.18}
      else{let approach=l>300?1:l<205?-1:0,orbit=.62+Math.sin(e.anim*2.1+e.seed)*.12;e.x+=(nx*approach-ny*orbit*e.strafe)*e.speed*dt*arrival;e.y+=(ny*approach+nx*orbit*e.strafe)*e.speed*dt*arrival;if(e.charge>0){if(!canAttack)cancelEnemyWindup(e);else{e.charge-=dt;if(e.charge<=0){prepareEnemyDash(e,e.lockDistance||l,LANCER_THRUST_SPEED,50);effects.push({x:e.x,y:e.y,r:4,maxR:34,life:.14,max:.14,color:'#8f9dff'})}}}else if(e.fire<=0){if(canAttack&&l<LANCER_THRUST_RANGE&&l>105){e.lockDistance=l;startEnemyWindup(e,LANCER_THRUST_WINDUP,nx,ny);e.fire=Math.max(1.7,2.45-riskTier*.065)}else e.fire=.12}}
    }else{
      if(e.dashTime>0){e.dashTime-=dt;e.x+=e.dashX*(e.dashSpeed||RUSHER_POUNCE_SPEED)*dt;e.y+=e.dashY*(e.dashSpeed||RUSHER_POUNCE_SPEED)*dt;if(e.dashTime<=0)finishEnemyDash(e,.17,'#d6aa58')}
      else if(e.charge>0){if(!canAttack)cancelEnemyWindup(e);else{e.charge-=dt;if(e.charge<=0)prepareEnemyDash(e,e.lockDistance||l,RUSHER_POUNCE_SPEED,28)}}
      else if(e.recover<=0){let weave=Math.sin(e.anim*5.1+e.seed)*.22*e.strafe,pulse=1+Math.sin(e.anim*6.4+e.seed)*.05;e.x+=(nx-ny*weave)*e.speed*dt*pulse*arrival;e.y+=(ny+nx*weave)*e.speed*dt*pulse*arrival;if(e.fire<=0){if(canAttack&&l<205&&l>54){e.lockDistance=l;startEnemyWindup(e,RUSHER_POUNCE_WINDUP,nx,ny);e.fire=2.8+Math.abs(Math.sin(e.seed))*.32}else e.fire=.11}}
    }
    if(e.vortexActive&&!e.boss){e.x+=(e.vortexVx||0)*dt;e.y+=(e.vortexVy||0)*dt}else{let vortexDecay=Math.pow(.004,dt);e.vortexVx=(e.vortexVx||0)*vortexDecay;e.vortexVy=(e.vortexVy||0)*vortexDecay;e.vortexInfluence=Math.max(0,(e.vortexInfluence||0)-dt*5);e.vortexOrbiting=false}e.vortexActive=false;
    let wantedX=e.x,wantedY=e.y;e.x=beforeX;e.y=beforeY;let coverHit=moveAroundCover(e,wantedX-beforeX,wantedY-beforeY);if(coverHit&&e.dashTime>0){finishEnemyDash(e,e.type==='brute'?TANK_RUSH_RECOVERY:.38,e.type==='brute'?'#c83f46':'#8f9dff');effects.push({kind:'coverImpact',x:e.x,y:e.y,r:4,maxR:24,life:.18,max:.18,color:e.boss?'#ffc928':'#e4e7eb'})}else if(coverHit){moveAroundCover(e,-ny*e.strafe*e.speed*dt*.62,nx*e.strafe*e.speed*dt*.62)}
    let moved=Math.hypot(e.x-beforeX,e.y-beforeY);if(save.settings.particles&&e.spawnGrace<=0&&moved>.4&&e.stepFx<=0&&combatViewContains(e.x,e.y,e.r,20)&&particles.length<LIMITS.particles){e.stepFx=e.dashTime>0?.1:e.type==='rusher'?.22:.42;particles.push({x:e.x-(e.x-beforeX)*2,y:e.y-(e.y-beforeY)*2+e.r*.5,vx:Math.sin(e.anim*3+e.seed)*9,vy:10+Math.abs(Math.cos(e.anim*2+e.seed))*8,life:.22,max:.22,r:2,color:e.type==='brute'?'#d6aa58':'#9eb2d5'})}
    dx=player.x-e.x;dy=player.y-e.y;l=Math.hypot(dx,dy)||1;if(!knocked&&e.spawnGrace<=0&&l<e.r+player.r+3&&e.attack<=0){let rushing=e.dashTime>0;e.attack=.5;if(rushing){finishEnemyDash(e,e.type==='brute'?TANK_RUSH_RECOVERY:.28,e.type==='brute'?'#c83f46':'#8f9dff');effects.push({kind:'tankImpact',x:e.x,y:e.y,angle:e.angle,r:12,maxR:58,life:.22,max:.22,color:e.type==='brute'?'#c83f46':'#8f9dff'});shake=Math.max(shake,e.type==='brute'?6:4)}let rushDamage=e.type==='brute'?.45:e.type==='lancer'?.62:.5;if(damagePlayer(e.damage*(rushing?rushDamage:1)))return true}return false
  }

  function update(dt){
    if(mode!=='run'||paused)return;if(postBossDecision||routeDecision||moduleDecision)return;runTime+=dt;if(!bossActive&&!bossDefeated)elapsed+=dt;let nextDepth=depthForElapsed(elapsed);if(nextDepth>depth){if(nextDepth===3&&!route){if(!extracting){showRouteDecision();return}}else{enterDepth(nextDepth);if(postBossDecision||bossActive)return}}if(!bossActive&&!bossDefeated&&!zoneEventTriggered&&zoneProgress()>=.58)triggerZoneEvent();
    let playerBeforeX=player.x,playerBeforeY=player.y;
    let move=movement(),stats=cargoStats();player.inv=Math.max(0,player.inv-dt);player.fire-=dt;player.guardCd=Math.max(0,(player.guardCd||0)-dt);player.recoil=Math.max(0,player.recoil-dt);player.attackAnim=Math.max(0,(player.attackAnim||0)-dt);player.animClock=(player.animClock||0)+dt;player.dashCd=Math.max(0,player.dashCd-dt);let spinMotion=updateHammerSpin(dt,stats,move);
    if(!spinMotion&&!updateDashMotion(dt,stats)){player.x+=move.x*player.speed*stats.speed*dt;player.y+=move.y*player.speed*stats.speed*dt;if(move.x||move.y){player.lastX=move.x;player.lastY=move.y;player.angle=Math.atan2(move.y,move.x);if(Math.abs(move.x)>.08)player.facing=move.x<0?-1:1}}player.x=Math.max(player.r,Math.min(WORLD.w-player.r,player.x));player.y=Math.max(player.r,Math.min(WORLD.h-player.r,player.y));
    if(stats.signature.grandWayfarer&&(move.x||move.y||player.dashTime>0))player.travelCharge=Math.min(1,(player.travelCharge||0)+dt/(stats.signature.grandWayfarer===2?1.7:2.4));
    if(spinMotion!=='leap'){let playerWantedX=player.x,playerWantedY=player.y;player.x=playerBeforeX;player.y=playerBeforeY;let playerCoverHit=moveAroundCover(player,playerWantedX-playerBeforeX,playerWantedY-playerBeforeY);if(playerCoverHit&&player.dashTime>0){player.dashTime=0;effects.push({kind:'coverImpact',x:player.x,y:player.y,r:4,maxR:28,life:.2,max:.2,color:'#ffc928'});shake=Math.max(shake,2);sound('hit')}}if(updateHazards(dt))return;
    updateWaveDirector(dt);
    let target=nearestEnemy(MELEE.reach+32);if(target&&player.fire<=0&&!spinMotion)fireAt(target);
    for(const strike of pendingStrikes){strike.delay-=dt;if(strike.delay<=0&&!strike.released){strike.released=true;releaseHammerStrike(strike)}}pendingStrikes=pendingStrikes.filter(strike=>!strike.released);
    for(const e of enemies){if(e.dead)continue;if(updateEnemyEntity(e,dt))return}separateEnemyHorde(dt);enemies=enemies.filter(e=>!e.dead);
    let bulletCam=camera();for(const b of enemyBullets){if(b.turn){let a=b.turn*dt,cs=Math.cos(a),sn=Math.sin(a),vx=b.vx,vy=b.vy;b.vx=vx*cs-vy*sn;b.vy=vx*sn+vy*cs}b.x+=b.vx*dt;b.y+=b.vy*dt;b.life-=dt;if(projectileHitsCover(b.x,b.y,b.r)){b.dead=true;effects.push({kind:'coverImpact',x:b.x,y:b.y,r:3,maxR:18,life:.16,max:.16,color:'#e4e7eb'});continue}if(!combatViewContains(b.x,b.y,b.r,0,bulletCam)){b.dead=true;continue}let dx=b.x-player.x,dy=b.y-player.y;if(dx*dx+dy*dy<(b.r+player.r)*(b.r+player.r)){b.dead=true;if(damagePlayer(b.damage))return}}enemyBullets=enemyBullets.filter(b=>!b.dead&&b.life>0&&b.x>-30&&b.y>-30&&b.x<WORLD.w+30&&b.y<WORLD.h+30);
    const magnet=magnetRange();for(const drop of lootDrops){drop.spin+=dt*(2.5+LOOT_RARITIES[drop.item.rarity].rank*.45);drop.x+=drop.vx*dt;drop.y+=drop.vy*dt;drop.vx*=Math.pow(.02,dt);drop.vy*=Math.pow(.02,dt);let dx=player.x-drop.x,dy=player.y-drop.y,l=Math.hypot(dx,dy)||1;if(l<magnet){let pull=(1-l/magnet)*820;drop.x+=dx/l*pull*dt;drop.y+=dy/l*pull*dt}if(l<player.r+drop.r+5){drop.dead=true;collectLoot(drop)}}lootDrops=lootDrops.filter(drop=>!drop.dead);
    for(const c of caches){c.spin+=dt*1.4;let dx=player.x-c.x,dy=player.y-c.y,l=Math.hypot(dx,dy)||1;if(l<magnet*.72){let pull=(1-l/(magnet*.72))*320;c.x+=dx/l*pull*dt;c.y+=dy/l*pull*dt}if(l<player.r+c.r+7){c.opened=true;burst(c.x,c.y,c.rare?'#f2c14f':'#47c5b6',c.rare?28:16,c.rare?1.4:1);openModuleCache(c);break}}caches=caches.filter(c=>!c.opened);
    if(bossLootChest){bossLootChest.spin+=dt*(1.45+(bossLootChest.rank||0)*.12);if(bossLootChest.arrival>0)bossLootChest.arrival=Math.max(0,bossLootChest.arrival-dt);else if(bossLootChest.opening>0){bossLootChest.opening-=dt;if(bossLootChest.burstAt>0&&bossLootChest.opening<=bossLootChest.burstAt){bossLootChest.burstAt=0;burst(bossLootChest.x,bossLootChest.y,bossLootChest.color,52,2.2);flash=Math.max(flash,.05)}if(bossLootChest.opening<=0){finishBossLootChest();return}}}
    updateParticles(dt);for(const effect of effects){if(effect.kind==='enemyLaunch'){effect.x+=(effect.vx||0)*dt;effect.y+=(effect.vy||0)*dt;effect.vx*=Math.pow(.12,dt);effect.vy*=Math.pow(.12,dt);effect.rot+=(effect.spin||0)*dt}effect.life-=dt}effects=effects.filter(effect=>effect.life>0);shake*=Math.pow(.02,dt);flash=Math.max(0,flash-dt);depthPulse=Math.max(0,depthPulse-dt);
    if(extracting>0){extracting-=dt;ui.extractCount.textContent=Math.max(1,Math.ceil(extracting));if(extracting<=0){bossExtraction=false;ui.extractOverlay.classList.remove('show');returnBase(true);return}}updateHud();
  }

  function cameraZoom(){return W<720?CAMERA_ZOOM.mobile:CAMERA_ZOOM.desktop}
  function camera(){let zoom=cameraZoom(),halfW=W/(2*zoom),halfH=H/(2*zoom);return{x:Math.max(halfW,Math.min(WORLD.w-halfW,player.x)),y:Math.max(halfH,Math.min(WORLD.h-halfH,player.y)),zoom}}
  function worldToScreen(x,y,cam){return{x:x-cam.x+W/2,y:y-cam.y+H/2}}
  function roundedRect(x,y,w,h,r){ctx.beginPath();if(ctx.roundRect){ctx.roundRect(x,y,w,h,r);return}r=Math.min(r,w/2,h/2);ctx.moveTo(x+r,y);ctx.lineTo(x+w-r,y);ctx.quadraticCurveTo(x+w,y,x+w,y+r);ctx.lineTo(x+w,y+h-r);ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);ctx.lineTo(x+r,y+h);ctx.quadraticCurveTo(x,y+h,x,y+h-r);ctx.lineTo(x,y+r);ctx.quadraticCurveTo(x,y,x+r,y);ctx.closePath()}
  function drawGear(x,y,r,rot,color){ctx.save();ctx.translate(x,y);ctx.rotate(rot);ctx.fillStyle=color;for(let i=0;i<8;i++){ctx.rotate(Math.PI/4);ctx.fillRect(r*.72,-r*.14,r*.42,r*.28)}ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.fillStyle='#131719';ctx.beginPath();ctx.arc(0,0,r*.38,0,Math.PI*2);ctx.fill();ctx.restore()}
  function drawPappaHammer(){
    let move=movement(),spinning=player.spinTime>0,moving=player.dashTime>0||player.spinLeap>0||Math.abs(move.x)+Math.abs(move.y)>.05,attacking=player.attackAnim>0||spinning,pose=attacking?'attack':moving?'run':'idle',duration=pose==='attack'?player.attackDuration:pose==='run'?.52:1.65,progress=spinning?(player.spinAngle%(Math.PI*2))/(Math.PI*2):pose==='attack'?1-player.attackAnim/player.attackDuration:(player.animClock%duration)/duration,frame=Math.max(0,Math.min(7,Math.floor(progress*8))),sprite=paperDollAtlases[pose]||pappaHammerSprites[pose];
    ctx.save();
    ctx.fillStyle='rgba(0,0,0,.34)';ctx.beginPath();ctx.ellipse(-1,40,22,6,0,0,Math.PI*2);ctx.fill();
    if(imageReady(sprite))drawAtlasCell(sprite,frame%4,Math.floor(frame/4),4,2,96,96,false,false);
    else if(imageReady(pappaHammerImage))ctx.drawImage(pappaHammerImage,243,127,941,833,-27,-37,82,73);
    else{ctx.fillStyle='#101317';roundedRect(-16,-13,31,34,9);ctx.fill();ctx.fillStyle='#172b4b';roundedRect(-13,-9,27,28,8);ctx.fill();ctx.fillStyle='#b52d31';ctx.beginPath();ctx.moveTo(-13,-7);ctx.lineTo(10,-10);ctx.lineTo(4,2);ctx.closePath();ctx.fill();ctx.fillStyle='#080a0d';ctx.fillRect(-18,-20,36,7);roundedRect(-12,-29,24,12,4);ctx.fill();ctx.strokeStyle='#e8dfce';ctx.lineWidth=2;ctx.strokeRect(-8,-15,7,6);ctx.strokeRect(1,-15,7,6);ctx.fillStyle='#d0a35a';ctx.fillRect(13,-3,30,6);roundedRect(38,-12,19,24,4);ctx.fill()}
    ctx.restore()
  }
  function drawEquippedRarityAura(){let profile=equippedRarityProfile(),rank=profile.rank;if(rank<2)return;let blackHole=equippedFullSetId()==='blackHole',color=blackHole?'#4bbcff':profile.color,t=performance.now()/1000,pulse=.5+Math.sin(t*(rank===4?2.4:3.2))*.5;ctx.save();ctx.globalAlpha=rank===2?.26:rank===3?.32:.38;ctx.strokeStyle=color;ctx.lineWidth=rank===4?2.2:1.6;ctx.setLineDash(rank===2?[7,8]:rank===3?[3,6]:[10,5]);ctx.lineDashOffset=-t*(rank+1)*7;ctx.beginPath();ctx.ellipse(0,31,27+rank*2+pulse*2,8+rank,0,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);if(rank>=3){ctx.globalAlpha=.18+pulse*.12;for(let i=0;i<rank;i++){let angle=t*(rank===4?.5:.8)+i*Math.PI*2/rank,x=Math.cos(angle)*(25+rank*2),y=-4+Math.sin(angle)*17;ctx.save();ctx.translate(x,y);ctx.rotate(angle+Math.PI/4);ctx.strokeRect(-2.5,-2.5,5,5);ctx.restore()}}if(rank===4){ctx.globalAlpha=.34;ctx.fillStyle=blackHole?'#e9f9ff':'#fff1bf';ctx.font='900 8px Georgia,serif';ctx.textAlign='center';ctx.textBaseline='middle';for(let i=0;i<3;i++){let angle=-t*.7+i*Math.PI*2/3;ctx.fillText('\u2726',Math.cos(angle)*32,-4+Math.sin(angle)*22)}}ctx.restore()}
  function drawBlackHoleSheet(image,frame,size,alpha,rotation,scaleX){
    if(!imageReady(image))return false;let width=image.naturalWidth||image.width,height=image.naturalHeight||image.height,cell=width/4;ctx.save();ctx.globalAlpha=alpha;ctx.rotate(rotation||0);ctx.scale(scaleX||1,1);ctx.drawImage(image,(frame%4)*cell,0,cell,height,-size/2,-size/2,size,size);ctx.restore();return true
  }
  function blackHoleStormPhase(){
    if(player.spinLeap>0)return player.blackHoleAge<BLACK_HOLE_STORM.spawnDuration?'spawn':'dash';
    if(player.dashTime>0)return'dash';
    if(player.blackHolePulse>0)return'pulse';
    return nearbyEnemyCount(player.x,player.y,245,false)>0?'pull':'idle'
  }
  function drawBlackHoleStorm(stats){
    let phase=blackHoleStormPhase(),age=player.blackHoleAge||0,pulse=player.blackHolePulse||0,radius=stats.spinRadius*(phase==='dash'?1.08:1),size=radius*(phase==='dash'?2.4:2.26),frame,rotation=-age*.24,alpha=phase==='idle'?.58:.7;
    if(phase==='spawn')frame=Math.min(3,Math.floor(Math.min(1,age/BLACK_HOLE_STORM.spawnDuration)*4));
    else if(phase==='pulse')frame=Math.min(3,Math.floor(Math.min(1,1-pulse/BLACK_HOLE_STORM.pulseDuration)*4));
    else{let fps=phase==='dash'?BLACK_HOLE_STORM.dashFps:phase==='pull'?BLACK_HOLE_STORM.pullFps:BLACK_HOLE_STORM.idleFps;frame=Math.floor(age*fps)%4}
    ctx.save();
    if(phase==='dash'){let angle=Math.atan2(player.dashY||player.lastY||0,player.dashX||player.lastX||1);ctx.rotate(angle);ctx.translate(-size*.11,0);rotation=0}
    drawBlackHoleSheet(blackHoleVfxSprites[phase],frame,size,alpha,rotation,phase==='dash'?1.22:1);
    ctx.restore();
    let orbiters=mobileArmory()?BLACK_HOLE_STORM.mobileOrbiters:BLACK_HOLE_STORM.orbiters,pack=Math.max(1,Math.min(30,player.spinPack||1)),orbitScale=1+Math.min(.18,pack*.006);
    ctx.save();ctx.globalCompositeOperation='screen';
    for(let index=0;index<orbiters;index++){
      let direction=index%2?1:-1,angle=age*(1.05+index%4*.16)*direction+index*2.399,orbit=radius*(.54+(index%5)*.085)*orbitScale,x=Math.cos(angle)*orbit,y=Math.sin(angle)*orbit*.62,shard=2+(index%3)*1.2;
      ctx.save();ctx.translate(x,y);ctx.rotate(angle+Math.PI/2);ctx.globalAlpha=.35+(index%4)*.1;ctx.fillStyle=index%5===0?'#f5fbff':index%2?'#7ddcff':'#207be6';ctx.beginPath();ctx.moveTo(shard*2.3,0);ctx.lineTo(-shard,-shard*.65);ctx.lineTo(-shard*.35,0);ctx.lineTo(-shard,shard*.65);ctx.closePath();ctx.fill();ctx.restore()
    }
    ctx.restore()
  }
  function drawBlackHoleEffect(fx,progress,alpha){
    let phase=fx.phase||'pulse',image=blackHoleVfxSprites[phase],frame=Math.min(3,Math.floor(progress*4)),size=(fx.size||fx.maxR*2)*(phase==='spawn'?.74+progress*.26:1),rotation=(fx.rotation||0)-progress*.34;
    if(fx.kind==='blackHoleCollapse'){
      let collapseEnd=.58;
      if(progress<collapseEnd){phase='collapse';image=blackHoleVfxSprites.collapse;frame=Math.min(3,Math.floor(progress/collapseEnd*4));size=(fx.size||fx.maxR*2)*(1-progress*.56);alpha=Math.min(1,alpha*1.25)}
      else{let burstProgress=(progress-collapseEnd)/(1-collapseEnd);phase='burst';image=blackHoleVfxSprites.burst;frame=Math.min(3,Math.floor(burstProgress*4));size=(fx.size||fx.maxR*2)*(.42+burstProgress*.94);alpha=Math.max(0,(1-burstProgress)*1.15)}
    }
    ctx.save();ctx.globalCompositeOperation='source-over';drawBlackHoleSheet(image,frame,size,alpha,rotation,1);ctx.restore()
  }
  function imageReady(image){let width=image&&(image.naturalWidth||image.width),height=image&&(image.naturalHeight||image.height);return !!(width&&height&&image.complete!==false)}
  function drawAtlasCell(image,col,row,cols,rows,w,h,flip,hit){let iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height,sw=iw/cols,sh=ih/rows;ctx.save();if(flip)ctx.scale(-1,1);if(hit)ctx.filter='brightness(1.6) saturate(.65)';ctx.drawImage(image,col*sw,row*sh,sw,sh,-w/2,-h*.52,w,h);ctx.filter='none';ctx.restore()}
  function drawEnemyFallback(e){ctx.fillStyle=e.hit?'#f4ead6':e.type==='brute'?'#17243a':e.type==='shooter'?'#ece3d2':e.type==='lancer'?'#111a2a':'#253650';ctx.strokeStyle=e.elite?'#d6aa58':'#080b11';ctx.lineWidth=4;roundedRect(-e.r,-e.r*.75,e.r*2,e.r*1.5,e.type==='brute'?8:5);ctx.fill();ctx.stroke();ctx.fillStyle='#c83f46';ctx.fillRect(-e.r*.9,-e.r*.18,e.r*1.8,e.r*.28);ctx.fillStyle='#f4ead6';ctx.beginPath();ctx.arc(e.r*.3,-e.r*.22,3.5,0,Math.PI*2);ctx.fill()}
  function drawEnemyArt(e){
    let cells={rusher:[0,0],shooter:[1,0],brute:[0,1],lancer:[1,1]},cell=cells[e.type]||cells.rusher,flip=Math.cos(e.angle)<0,box=e.r*(e.type==='brute'?3.05:4.15),spawn=e.spawnDuration?Math.max(0,Math.min(1,1-e.spawnGrace/e.spawnDuration)):1,recoil=Math.min(1,(e.recoil||0)/.13),stride=Math.sin(e.anim*(e.type==='rusher'?10.4:e.type==='lancer'?7.3:e.type==='shooter'?4.8:3.2)+e.seed),bob=e.type==='brute'?Math.abs(stride)*.7:e.type==='shooter'?stride*1.35:Math.abs(stride)*1.8,lean=e.dashTime>0?-.13:e.recover>0?.07:e.charge>0?Math.sin(e.anim*18)*.04:e.type==='rusher'?stride*.04:0;
    ctx.save();ctx.globalAlpha=.45+spawn*.55;ctx.translate(-Math.cos(e.angle)*recoil*6,bob-recoil*1.5);ctx.rotate(lean);ctx.scale(.82+spawn*.18,.82+spawn*.18);ctx.fillStyle='rgba(3,7,14,.32)';ctx.beginPath();ctx.ellipse(0,e.r*.72,e.r*(e.type==='brute'?1.15:.88),e.r*.34,0,0,Math.PI*2);ctx.fill();if(e.elite){let markerY=-box*.51-5;ctx.fillStyle='#d6aa58';ctx.strokeStyle='#111827';ctx.lineWidth=1.5;for(let i=-1;i<=1;i++){let x=i*9,y=markerY+Math.abs(i)*2,s=i===0?5:3.5;ctx.beginPath();ctx.moveTo(x,y-s);ctx.lineTo(x+s,y);ctx.lineTo(x,y+s);ctx.lineTo(x-s,y);ctx.closePath();ctx.fill();ctx.stroke()}}if(imageReady(enemyAtlas))drawAtlasCell(enemyAtlas,cell[0],cell[1],2,2,box,box,flip,e.hit>0);else drawEnemyFallback(e);if(e.recover>0){let color=e.type==='brute'?'#ef746c':e.type==='lancer'?'#9eb2d5':'#d6aa58',amount=e.type==='brute'?3:2;ctx.globalAlpha=.55+Math.sin(e.anim*12)*.2;ctx.fillStyle=color;ctx.font='900 '+Math.max(8,e.r*.5)+'px Georgia';ctx.textAlign='center';for(let i=0;i<amount;i++){let a=-Math.PI*.82+i*Math.PI*.64/(amount-1||1);ctx.fillText('\u2726',Math.cos(a)*e.r*.72,Math.sin(a)*e.r*.68-e.r*.86)}}ctx.restore()
  }
  function drawLagoonBossFallback(e){
    let stage=e.bossStage||1,accent=stage===3?'#f29ab8':'#79e7f2';
    ctx.strokeStyle='#d9fbff';ctx.fillStyle=e.hit?'#f4feff':'#173c5a';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,e.r*.75,0,Math.PI*2);ctx.fill();ctx.stroke();
    ctx.strokeStyle=accent;ctx.lineWidth=7;ctx.beginPath();ctx.arc(0,0,e.r*1.05,-Math.PI*.2,Math.PI*1.45);ctx.stroke();
    ctx.fillStyle='#d9fbff';for(let i=0;i<7;i++){let a=i*Math.PI*2/7+e.anim*.15,r=e.r*(.72+(i%2)*.22);ctx.save();ctx.translate(Math.cos(a)*r,Math.sin(a)*r);ctx.rotate(a);ctx.beginPath();ctx.moveTo(12,0);ctx.lineTo(-7,-6);ctx.lineTo(-4,6);ctx.closePath();ctx.fill();ctx.restore()}
  }
  function drawLagoonBossArt(e){
    let stage=e.bossStage||1,charge=e.charge>0?1-Math.min(1,e.charge/.92):0,box=e.r*3.72,bob=Math.sin(e.anim*(stage===3?3.5:2.1))*3,wing=Math.sin(e.anim*(stage===3?5.2:3.15)),accent=stage===3?'#f29ab8':'#79e7f2';
    ctx.save();ctx.translate(0,bob-Math.sin(charge*Math.PI)*3);
    ctx.fillStyle='rgba(3,15,26,.38)';ctx.beginPath();ctx.ellipse(0,e.r*.82,e.r*1.25,e.r*.34,0,0,Math.PI*2);ctx.fill();
    ctx.globalAlpha=stage===1?.38:stage===2?.52:.66;ctx.strokeStyle=accent;ctx.lineWidth=stage===3?3:2;for(let ring=0;ring<2;ring++){let radius=e.r*(1.18+ring*.22+charge*.08);ctx.beginPath();ctx.arc(0,0,radius,e.anim*(ring?-.24:.31),e.anim*(ring?-.24:.31)+Math.PI*(1.18+stage*.14));ctx.stroke()}ctx.globalAlpha=1;
    for(let i=0;i<stage+1;i++){let a=e.anim*(i%2?-.55:.48)+i*Math.PI*2/(stage+1),radius=e.r*(1.18+i*.06);ctx.fillStyle=i%2?'#f29ab8':'#d9fbff';ctx.beginPath();ctx.arc(Math.cos(a)*radius,Math.sin(a)*radius,2.5+(i===stage?1:0),0,Math.PI*2);ctx.fill()}
    ctx.save();ctx.rotate(e.angle-Math.PI/2+Math.sin(e.anim*.9)*.025);ctx.scale(1+wing*.018+charge*.035,1-wing*.014-charge*.035);if(imageReady(skyglassLeviathanImage)){if(e.hit>0)ctx.filter='brightness(1.48) saturate(.72)';ctx.drawImage(skyglassLeviathanImage,-box/2,-box/2,box,box);ctx.filter='none'}else drawLagoonBossFallback(e);ctx.restore();
    if(charge>0){ctx.globalAlpha=.45+charge*.45;ctx.strokeStyle='#d9fbff';ctx.lineWidth=2;ctx.setLineDash([5,6]);ctx.beginPath();ctx.arc(0,0,e.r*(1.38+charge*.12),-e.anim*.7,Math.PI*1.45-e.anim*.7);ctx.stroke();ctx.setLineDash([])}
    ctx.restore()
  }
  function drawBossStagger(e){
    if(!(e.stagger>0))return;
    let progress=1-Math.min(1,e.stagger/.82),accent=(BOSSES[e.bossKind]||currentBoss()).accent,pulse=Math.sin(progress*Math.PI);
    ctx.save();ctx.globalAlpha=.28+pulse*.52;ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.setLineDash([7,6]);ctx.lineDashOffset=-e.anim*18;
    ctx.beginPath();ctx.arc(0,0,e.r*(1.18+progress*.62),0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.globalAlpha=.34+pulse*.36;ctx.fillStyle='#fff7dc';
    for(let i=0;i<5;i++){let a=i*Math.PI*2/5-e.anim*.8,r=e.r*(1.1+progress*.38);ctx.save();ctx.translate(Math.cos(a)*r,Math.sin(a)*r);ctx.rotate(a+Math.PI/4);ctx.fillRect(-3,-3,6,6);ctx.restore()}
    ctx.restore()
  }
  function drawBossArt(e){
    if(e.bossKind==='leviathan'){drawLagoonBossArt(e);return}
    if(!imageReady(bossAtlas)){drawBossEntity(e);return}
    let stage=e.bossStage||1,isChampion=e.bossKind==='tyrant',accent=isChampion?'#c83f46':'#d6aa58',box=e.r*(isChampion?3.28:3.38),facing=Math.cos(e.angle),flip=isChampion?facing>0:facing<0,charge=e.charge>0?1-Math.min(1,e.charge/.9):0;
    let bob=isChampion?Math.sin(e.anim*(stage===3?7.2:4.6))*1.8:Math.sin(e.anim*(stage===3?2.4:1.55))*.75;
    ctx.save();ctx.translate(0,bob);ctx.rotate(isChampion?-charge*.095:charge*.025);
    ctx.fillStyle='rgba(3,7,14,.42)';ctx.beginPath();ctx.ellipse(0,e.r*.93,e.r*(isChampion?1.08:1.24),e.r*.36,0,0,Math.PI*2);ctx.fill();
    if(isChampion){
      ctx.strokeStyle=accent+(stage===3?'bb':'72');ctx.lineWidth=stage===3?5:3;ctx.beginPath();ctx.arc(-e.r*.08,e.r*.08,e.r*(1.22+charge*.12),-Math.PI*.78,Math.PI*.48);ctx.stroke();
      ctx.strokeStyle='#d6aa58'+(stage===3?'99':'55');ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-e.r*1.08,e.r*.72);ctx.lineTo(e.r*(.6+charge*.24),-e.r*.78);ctx.stroke();
    }else{
      let frame=e.r*(1.06+charge*.1);ctx.strokeStyle=accent+(stage===3?'bb':'72');ctx.lineWidth=stage===3?4:3;roundedRect(-frame,-frame*.62,frame*2,frame*1.34,6);ctx.stroke();
      ctx.fillStyle='#111a2acc';ctx.strokeStyle='#f4ead688';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,e.r*.18,e.r*.13,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=accent;ctx.fillRect(-e.r*.045,e.r*.2,e.r*.09,e.r*.25);
    }
    if(e.charge>0){ctx.strokeStyle='#f4ead6aa';ctx.lineWidth=2;ctx.setLineDash(isChampion?[12,6]:[5,5]);ctx.beginPath();ctx.arc(0,e.r*.22,e.r*(1.34+charge*.16),-Math.PI*.82,Math.PI*.68);ctx.stroke();ctx.setLineDash([])}
    drawAtlasCell(bossAtlas,isChampion?1:0,0,2,1,box,box,flip,e.hit>0);ctx.restore()
  }
  function drawTreasureChest(c,cam){let p=worldToScreen(c.x,c.y,cam),accent=c.rare?'#d6aa58':'#c83f46';ctx.save();ctx.translate(p.x,p.y+Math.sin(c.spin)*1.5);ctx.rotate(Math.sin(c.spin*.7)*.035);ctx.fillStyle='rgba(3,7,14,.35)';ctx.beginPath();ctx.ellipse(0,17,20,6,0,0,Math.PI*2);ctx.fill();ctx.fillStyle='#17243a';ctx.strokeStyle='#090c13';ctx.lineWidth=4;roundedRect(-20,-12,40,28,5);ctx.fill();ctx.stroke();ctx.strokeStyle=accent;ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-18,-3);ctx.lineTo(18,-3);ctx.stroke();ctx.fillStyle=accent;roundedRect(-5,-7,10,14,2);ctx.fill();ctx.fillStyle='#f4ead6';ctx.beginPath();ctx.arc(0,-1,2,0,Math.PI*2);ctx.fill();if(c.rare){ctx.fillStyle='#f4ead6';ctx.font='900 12px Georgia';ctx.textAlign='center';ctx.fillText('\u2605',0,-17)}ctx.restore()}
  function drawBossLootChest(chest,cam){
    let p=worldToScreen(chest.x,chest.y,cam),arrival=chest.arrival||0,arrivalMax=chest.arrivalMax||BOSS_LOOT_ORB_ARRIVAL,arrivalProgress=1-arrival/arrivalMax,open=chest.opening>0,progress=open?1-Math.max(0,chest.opening)/BOSS_LOOT_ORB_OPEN:0,bob=Math.sin(chest.spin*1.45)*3.4,pulse=.5+Math.sin(chest.spin*2.1)*.5,color=chest.color,rank=chest.rank||0,reveal=arrival>0?Math.max(0,Math.min(1,(arrivalProgress-.22)/.46)):1,ease=1-Math.pow(1-reveal,3),orbY=-9+bob-(1-ease)*34,orbScale=.2+ease*.8;
    ctx.save();ctx.translate(p.x,p.y);
    if(arrival>0){
      let beamAlpha=Math.min(1,arrivalProgress/.12)*Math.min(1,(1-arrivalProgress)/.34),beamWidth=18+arrivalProgress*72,beam=ctx.createLinearGradient(-beamWidth,0,beamWidth,0);beam.addColorStop(0,color+'00');beam.addColorStop(.35,color+'55');beam.addColorStop(.5,'#fffbe8');beam.addColorStop(.65,color+'55');beam.addColorStop(1,color+'00');ctx.save();ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.max(0,beamAlpha);ctx.fillStyle=beam;ctx.fillRect(-beamWidth,-H*1.1,beamWidth*2,H*2.2);ctx.globalAlpha=beamAlpha*.9;ctx.fillStyle='#fffdf2';ctx.fillRect(-2.5,-H*1.1,5,H*2.2);ctx.strokeStyle=color;ctx.lineWidth=2;for(let i=0;i<10;i++){let angle=i*Math.PI/5+chest.spin*.16,length=54+rank*10+(i%3)*18;ctx.beginPath();ctx.moveTo(Math.cos(angle)*18,Math.sin(angle)*10);ctx.lineTo(Math.cos(angle)*length,Math.sin(angle)*length*.64);ctx.stroke()}ctx.restore()
    }
    ctx.globalAlpha=.2+.22*ease;ctx.fillStyle='#02050b';ctx.beginPath();ctx.ellipse(0,28,31+rank*2,8+rank*.6,0,0,Math.PI*2);ctx.fill();ctx.globalAlpha=1;
    ctx.save();ctx.translate(0,orbY);ctx.scale(orbScale,orbScale);
    let aura=ctx.createRadialGradient(0,0,6,0,0,53+rank*4);aura.addColorStop(0,color+'99');aura.addColorStop(.38,color+'42');aura.addColorStop(1,color+'00');ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.5+pulse*.2;ctx.fillStyle=aura;ctx.beginPath();ctx.arc(0,0,56+rank*3,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;
    ctx.strokeStyle=color;ctx.lineWidth=1.4;ctx.globalAlpha=.38+pulse*.32;ctx.beginPath();ctx.ellipse(0,34,31+rank*2,8+rank*.5,-chest.spin*.08,0,Math.PI*2);ctx.stroke();ctx.beginPath();ctx.ellipse(0,34,22+rank*1.5,5+rank*.35,chest.spin*.11,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=1;
    let fragmentCount=4+rank;for(let i=0;i<fragmentCount;i++){let angle=chest.spin*.42+i*Math.PI*2/fragmentCount,distance=39+rank*2+Math.sin(chest.spin*1.7+i)*3,x=Math.cos(angle)*distance,y=Math.sin(angle)*distance*.58,size=2.5+(i%2)*1.3;ctx.save();ctx.translate(x,y);ctx.rotate(angle+chest.spin);ctx.fillStyle=i%2?color:'#d8e1eb';ctx.strokeStyle='#060a11';ctx.lineWidth=1.2;ctx.beginPath();ctx.moveTo(0,-size*1.7);ctx.lineTo(size,0);ctx.lineTo(0,size*1.7);ctx.lineTo(-size,0);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}
    if(!open||progress<.84){
      ctx.save();ctx.globalAlpha=open?Math.max(0,1-progress*1.18):1;ctx.scale(1+progress*.16,1+progress*.16);let shell=ctx.createRadialGradient(-10,-13,3,3,5,34);shell.addColorStop(0,'#596372');shell.addColorStop(.38,'#27313e');shell.addColorStop(.78,'#111923');shell.addColorStop(1,'#05080d');ctx.fillStyle=shell;ctx.strokeStyle='#03050a';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,28,0,Math.PI*2);ctx.fill();ctx.stroke();for(let i=0;i<8;i++){let a0=-Math.PI/2+i*Math.PI/4+.04,a1=a0+Math.PI/4-.08;ctx.fillStyle=i%2?'rgba(9,14,22,.72)':'rgba(46,57,70,.54)';ctx.strokeStyle='rgba(3,6,10,.78)';ctx.lineWidth=1.4;ctx.beginPath();ctx.moveTo(Math.cos(a0+.35)*7,Math.sin(a0+.35)*7);ctx.arc(0,0,25,a0,a1);ctx.closePath();ctx.fill();ctx.stroke()}ctx.shadowColor=color;ctx.shadowBlur=10+rank*3;ctx.strokeStyle=color;ctx.lineWidth=2.1+rank*.22;for(let i=0;i<7;i++){let angle=-1.35+i*.82+(i%2)*.08,inner=6+(i%3),middle=15+(i%2)*3,outer=26;ctx.beginPath();ctx.moveTo(Math.cos(angle)*inner,Math.sin(angle)*inner);ctx.lineTo(Math.cos(angle+.16)*middle,Math.sin(angle+.16)*middle);ctx.lineTo(Math.cos(angle-.08)*outer,Math.sin(angle-.08)*outer);ctx.stroke()}ctx.shadowBlur=0;let core=ctx.createRadialGradient(-2,-3,1,0,0,10+rank);core.addColorStop(0,'#fffce8');core.addColorStop(.32,color);core.addColorStop(1,color+'00');ctx.globalCompositeOperation='lighter';ctx.fillStyle=core;ctx.beginPath();ctx.arc(0,0,11+rank,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';ctx.restore()
    }
    if(open){
      let energy=ctx.createRadialGradient(0,0,2,0,0,20+progress*46);energy.addColorStop(0,'#ffffff');energy.addColorStop(.2,color);energy.addColorStop(1,color+'00');ctx.globalCompositeOperation='lighter';ctx.globalAlpha=.95-progress*.18;ctx.fillStyle=energy;ctx.beginPath();ctx.arc(0,0,20+progress*46,0,Math.PI*2);ctx.fill();ctx.globalCompositeOperation='source-over';ctx.globalAlpha=1;for(let i=0;i<10;i++){let angle=i*Math.PI/5+chest.spin*.2,distance=12+progress*(48+(i%3)*10),size=5+(i%3)*1.5;ctx.save();ctx.translate(Math.cos(angle)*distance,Math.sin(angle)*distance*.72);ctx.rotate(angle+progress*2);ctx.fillStyle=i%2?'#111925':'#2c3745';ctx.strokeStyle=color;ctx.lineWidth=1.5;ctx.beginPath();ctx.moveTo(-size,-size*.45);ctx.lineTo(size*.2,-size);ctx.lineTo(size,size*.4);ctx.lineTo(-size*.3,size);ctx.closePath();ctx.fill();ctx.stroke();ctx.restore()}}
    ctx.restore();
    if(arrival<=0&&!open){ctx.font='900 8px system-ui';let label=(chest.rarity||'BOSS')+' LOOT ORB',labelWidth=120;ctx.fillStyle='#050914e8';ctx.strokeStyle=color;ctx.lineWidth=2;roundedRect(-labelWidth/2,-75,labelWidth,22,3);ctx.fill();ctx.stroke();ctx.fillStyle='#fff4d2';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText(label,0,-64);ctx.font='900 7px system-ui';ctx.fillStyle=color;ctx.fillText('TAP TO REVEAL',0,51)}
    ctx.restore()
  }
  function drawBossLootArrivalFlash(chest,cam){
    if(!chest||!(chest.arrival>0))return;let progress=1-chest.arrival/(chest.arrivalMax||BOSS_LOOT_ORB_ARRIVAL),point=worldToScreen(chest.x,chest.y,cam),x=W/2+(point.x-W/2)*cam.zoom,y=H/2+(point.y-H/2)*cam.zoom,fade=Math.pow(Math.max(0,1-progress),2),white=Math.min(.82,fade*.95),color=chest.color;ctx.save();ctx.globalCompositeOperation='screen';ctx.fillStyle='rgba(255,252,236,'+white+')';ctx.fillRect(-12,-12,W+24,H+24);let glow=ctx.createRadialGradient(x,y,8,x,y,Math.max(W,H)*.72);glow.addColorStop(0,'rgba(255,255,255,'+Math.min(.9,fade*1.2)+')');glow.addColorStop(.15,color+Math.round(Math.min(210,fade*210)).toString(16).padStart(2,'0'));glow.addColorStop(1,color+'00');ctx.fillStyle=glow;ctx.fillRect(0,0,W,H);ctx.globalAlpha=Math.min(.55,fade*.7);ctx.strokeStyle='#fffdf2';ctx.lineWidth=2;for(let i=0;i<16;i++){let angle=i*Math.PI/8+.08,length=Math.max(W,H)*.78,start=52+i%3*11;ctx.beginPath();ctx.moveTo(x+Math.cos(angle)*start,y+Math.sin(angle)*start);ctx.lineTo(x+Math.cos(angle)*length,y+Math.sin(angle)*length);ctx.stroke()}ctx.restore()
  }
  function drawAdventureItemShape(item,r,rarity){let visual=item.visual,variant=visual.variant||0,detail=variant%4;ctx.fillStyle=visual.color;ctx.strokeStyle=visual.accent;ctx.lineWidth=2+rarity.rank*.28;ctx.lineJoin='round';if(item.slot==='hat'){let brim=r*(.82+(variant%3)*.1),crown=r*(.46+(variant%2)*.1),height=r*(.82+(variant%4)*.08);ctx.beginPath();ctx.ellipse(0,r*.25,brim,r*(.22+detail*.025),0,0,Math.PI*2);ctx.fill();ctx.stroke();roundedRect(-crown,-height,crown*2,height+r*.25,detail===2?r*.35:2);ctx.fill();ctx.stroke();ctx.strokeStyle=rarity.color;ctx.beginPath();ctx.moveTo(-crown,-r*.14);ctx.lineTo(crown,-r*.14);if(variant%2)ctx.moveTo(-crown*.7,-height*.72),ctx.lineTo(crown*.72,-height*.52);ctx.stroke()}else if(item.slot==='scarf'){let flip=variant%2?-1:1;ctx.beginPath();ctx.moveTo(-r*.92,-r*.62);ctx.lineTo(r*.55,-r*.34);ctx.lineTo(r*(.68+detail*.08)*flip,r*.82);ctx.lineTo(0,r*(.24+detail*.07));ctx.lineTo(-r*(.66+(3-detail)*.06)*flip,r*.76);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle=rarity.color;ctx.beginPath();ctx.moveTo(-r*.62,-r*.28);ctx.lineTo(r*.43,r*.02);if(variant>=4)ctx.moveTo(-r*.35,r*.12),ctx.lineTo(r*.25,r*.4);ctx.stroke()}else if(item.slot==='coat'){let shoulder=r*(.82+detail*.05),hem=r*(.58+(variant%2)*.16);ctx.beginPath();ctx.moveTo(-r*.54,-r*.82);ctx.lineTo(-shoulder,-r*.22);ctx.lineTo(-hem,r*.92);ctx.lineTo(0,r*(.52+(variant%3)*.08));ctx.lineTo(hem,r*.92);ctx.lineTo(shoulder,-r*.22);ctx.lineTo(r*.54,-r*.82);ctx.lineTo(0,-r*(.38+(variant%2)*.12));ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle=rarity.color;ctx.beginPath();ctx.moveTo(0,-r*.4);ctx.lineTo(0,r*.58);ctx.moveTo(-r*.45,-r*.42);ctx.lineTo(0,-r*.08);ctx.lineTo(r*.45,-r*.42);if(variant>=4)ctx.moveTo(-hem*.75,r*.48),ctx.lineTo(hem*.75,r*.48);ctx.stroke()}else if(item.slot==='hammer'){let width=r*(1.55+detail*.13),height=r*(.65+(variant%2)*.12);ctx.fillStyle='#5e3d2c';ctx.strokeStyle='#2a1710';ctx.lineWidth=1.5;roundedRect(-r*.13,-r*.1,r*.26,r*1.5,r*.08);ctx.fill();ctx.stroke();ctx.fillStyle=visual.color;ctx.strokeStyle=visual.accent;ctx.lineWidth=2+rarity.rank*.28;roundedRect(-width/2,-r*.82,width,height,variant%3===2?r*.3:2);ctx.fill();ctx.stroke();ctx.strokeStyle=rarity.color;ctx.strokeRect(-width*.28,-r*.69,width*.56,height*.56);if(variant%2){ctx.beginPath();ctx.moveTo(-width*.42,-r*.5);ctx.lineTo(width*.42,-r*.5);ctx.stroke()}}else{let bootHeight=r*(1.05+detail*.08),toe=r*(.38+(variant%3)*.06);for(const x of [-r*.48,r*.45]){ctx.save();ctx.translate(x,0);ctx.rotate(x<0?-.14:.14);roundedRect(-r*.34,-bootHeight*.62,r*.68,bootHeight,variant%2?4:2);ctx.fill();ctx.stroke();ctx.beginPath();ctx.moveTo(-r*.34,bootHeight*.25);ctx.lineTo(toe,bootHeight*.25);ctx.lineTo(toe,bootHeight*.48);ctx.lineTo(-r*.18,bootHeight*.48);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle=rarity.color;ctx.beginPath();ctx.moveTo(-r*.23,-r*.12);ctx.lineTo(r*.24,-r*.12);if(variant>=4)ctx.moveTo(-r*.2,r*.08),ctx.lineTo(r*.26,r*.08);ctx.stroke();ctx.restore()}}let markY=item.slot==='hat'?-r*.43:item.slot==='hammer'?-r*.49:item.slot==='boots'?r*.02:0;ctx.fillStyle=visual.accent;ctx.strokeStyle='rgba(3,7,14,.6)';ctx.lineWidth=2;ctx.font='900 '+Math.max(7,r*.72)+'px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.strokeText(visual.mark,0,markY);ctx.fillText(visual.mark,0,markY)}
  function drawAdventureLootSprite(item,r){let visual=item.visual,blackHole=Number.isInteger(visual.blackHoleColumn),legendary=!blackHole&&Number.isInteger(visual.legendaryRow)&&Number.isInteger(visual.legendaryColumn),setSprite=!blackHole&&!legendary&&Number.isInteger(visual.setGearRow)&&Number.isInteger(visual.setGearColumn),atlas=blackHole?blackHoleDropAtlas:legendary?legendaryDropAtlas:setSprite?setGearDropAtlas:gearDropAtlas,cell=blackHole?80:legendary?LEGENDARY_DROP_CELL:setSprite?SET_GEAR_DROP_CELL:GEAR_DROP_CELL;if(!imageReady(atlas))return false;let column=blackHole?visual.blackHoleColumn:legendary?visual.legendaryColumn:setSprite?visual.setGearColumn:visual.atlasColumn,row=blackHole?0:legendary?visual.legendaryRow:setSprite?visual.setGearRow:visual.atlasRow,size=r*(blackHole?4.3:legendary?4.15:setSprite?3.85:3.65);ctx.drawImage(atlas,column*cell,row*cell,cell,cell,-size/2,-size/2,size,size);return true}
  function drawAdventureLoot(drop,cam){let item=drop.item,rarity=LOOT_RARITIES[item.rarity],rank=rarity.rank,p=worldToScreen(drop.x,drop.y,cam),bob=Math.sin(performance.now()/210+drop.spin)*2.2,r=drop.r;ctx.save();ctx.translate(p.x,p.y+bob);if(rank===4){ctx.globalAlpha=.24;let beam=ctx.createLinearGradient(0,-76,0,20);beam.addColorStop(0,'#f2c14f00');beam.addColorStop(.7,'#f2c14f99');beam.addColorStop(1,'#f2c14f00');ctx.fillStyle=beam;ctx.fillRect(-7,-76,14,96);ctx.globalAlpha=1}ctx.fillStyle='rgba(3,7,14,.32)';ctx.beginPath();ctx.ellipse(0,r*1.18,r*1.15,r*.32,0,0,Math.PI*2);ctx.fill();ctx.rotate(Math.sin(drop.spin)*.08+(item.visual.variant-3)*.01);ctx.shadowColor=rarity.glow;ctx.shadowBlur=rank*3;if(!drawAdventureLootSprite(item,r))drawAdventureItemShape(item,r,rarity);ctx.shadowBlur=0;if(rank>=2){ctx.strokeStyle=rarity.color;ctx.globalAlpha=.72;ctx.lineWidth=1.4;ctx.beginPath();ctx.arc(0,0,r*1.52,-drop.spin,Math.PI-drop.spin);ctx.stroke()}if(rank===4){ctx.globalAlpha=1;ctx.fillStyle='#fff5d6';ctx.font='900 7px Georgia';ctx.textAlign='center';for(let i=0;i<4;i++){let a=drop.spin*.25+i*Math.PI/2;ctx.fillText('\u2726',Math.cos(a)*r*1.78,Math.sin(a)*r*1.64)}}ctx.restore()}
  function drawTankTelegraph(e,p){
    let locked=e.aimX||e.aimY,nx=locked?e.aimX:Math.cos(e.angle),ny=locked?e.aimY:Math.sin(e.angle),angle=Math.atan2(ny,nx),progress=1-Math.min(1,e.charge/TANK_RUSH_WINDUP),start=e.r*.55,length=e.dashDistance||Math.min(TANK_RUSH_RANGE,e.lockDistance||TANK_RUSH_RANGE)+TANK_RUSH_OVERSHOOT,half=e.r+(player?player.r*.78:12),pulse=.72+Math.sin(performance.now()/70)*.16;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle);let lane=ctx.createLinearGradient(start,0,length,0);lane.addColorStop(0,'rgba(200,63,70,.08)');lane.addColorStop(.55,'rgba(200,63,70,'+(.14+progress*.14)+')');lane.addColorStop(1,'rgba(181,45,49,'+(.2+progress*.22)+')');ctx.fillStyle=lane;ctx.beginPath();ctx.moveTo(start,-half*.72);ctx.lineTo(length,-half);ctx.lineTo(length,half);ctx.lineTo(start,half*.72);ctx.closePath();ctx.fill();ctx.strokeStyle='rgba(244,234,214,'+(.35+progress*.45)+')';ctx.lineWidth=2;ctx.setLineDash([10,7]);ctx.beginPath();ctx.moveTo(start,-half*.72);ctx.lineTo(length,-half);ctx.moveTo(start,half*.72);ctx.lineTo(length,half);ctx.stroke();ctx.setLineDash([]);ctx.strokeStyle='rgba(200,63,70,'+Math.min(1,pulse+progress*.25)+')';ctx.lineWidth=3;for(let i=1;i<=3;i++){let x=start+(length-start)*(i*.23),s=7+i*1.5;ctx.beginPath();ctx.moveTo(x-s,-s);ctx.lineTo(x,0);ctx.lineTo(x-s,s);ctx.stroke()}ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(length-7,-7);ctx.lineTo(length+7,7);ctx.moveTo(length+7,-7);ctx.lineTo(length-7,7);ctx.stroke();ctx.restore()
  }
  function drawLancerTelegraph(e,p){
    let locked=e.aimX||e.aimY,nx=locked?e.aimX:Math.cos(e.angle),ny=locked?e.aimY:Math.sin(e.angle),angle=Math.atan2(ny,nx),progress=1-Math.min(1,e.charge/LANCER_THRUST_WINDUP),start=e.r*.62,length=e.dashDistance||Math.min(LANCER_THRUST_RANGE,e.lockDistance||LANCER_THRUST_RANGE)+46,half=8+progress*4,pulse=.72+Math.sin(performance.now()/62)*.18;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle);
    let lane=ctx.createLinearGradient(start,0,length,0);lane.addColorStop(0,'rgba(67,91,138,.08)');lane.addColorStop(.55,'rgba(103,139,203,'+(.13+progress*.13)+')');lane.addColorStop(1,'rgba(158,178,213,'+(.22+progress*.22)+')');ctx.fillStyle=lane;ctx.beginPath();ctx.moveTo(start,-half*.55);ctx.lineTo(length-15,-half);ctx.lineTo(length,0);ctx.lineTo(length-15,half);ctx.lineTo(start,half*.55);ctx.closePath();ctx.fill();
    ctx.strokeStyle='rgba(220,234,255,'+(.42+progress*.5)+')';ctx.lineWidth=1.8;ctx.setLineDash([13,7]);ctx.beginPath();ctx.moveTo(start,-half*.55);ctx.lineTo(length-15,-half);ctx.moveTo(start,half*.55);ctx.lineTo(length-15,half);ctx.stroke();ctx.setLineDash([]);
    ctx.strokeStyle='rgba(143,157,255,'+Math.min(1,pulse+progress*.22)+')';ctx.lineWidth=2.4;for(let i=1;i<=3;i++){let x=start+(length-start)*(i*.2),s=5+i;ctx.beginPath();ctx.moveTo(x-s,-s*.72);ctx.lineTo(x,0);ctx.lineTo(x-s,s*.72);ctx.stroke()}
    ctx.fillStyle='rgba(220,234,255,'+(.58+progress*.4)+')';ctx.beginPath();ctx.moveTo(length+5,0);ctx.lineTo(length-14,-half-3);ctx.lineTo(length-9,0);ctx.lineTo(length-14,half+3);ctx.closePath();ctx.fill();ctx.restore()
  }
  function drawEnemyAimTelegraph(e,p){
    if(!e.boss&&e.type==='lancer'){drawLancerTelegraph(e,p);return}
    let locked=e.aimX||e.aimY,nx=locked?e.aimX:Math.cos(e.angle),ny=locked?e.aimY:Math.sin(e.angle),angle=Math.atan2(ny,nx),tyrant=e.boss&&e.bossKind==='tyrant',lagoon=e.boss&&e.bossKind==='leviathan',chargeMax=e.boss?(lagoon?(e.bossStage===1?.82:e.bossStage===2?.92:.62):tyrant?(e.bossStage===1?.78:e.bossStage===2?.72:.55):(e.bossStage===2?.88:e.bossStage===3?.58:.72)):e.type==='lancer'?LANCER_THRUST_WINDUP:e.type==='rusher'?RUSHER_POUNCE_WINDUP:.58,progress=1-Math.min(1,e.charge/chargeMax),length=e.boss?Math.min(Math.hypot(W,H)*.72,410):e.type==='lancer'?(e.dashDistance||Math.min(LANCER_THRUST_RANGE,e.lockDistance||LANCER_THRUST_RANGE)+46):e.type==='rusher'?(e.dashDistance||Math.min(190,e.lockDistance||190)+28):Math.min(Math.hypot(W,H)*.62,340),color=lagoon?'121,231,242':tyrant?'200,63,70':e.type==='lancer'?'158,178,213':e.type==='rusher'?'214,170,88':'214,170,88';ctx.save();ctx.translate(p.x,p.y);ctx.rotate(angle);ctx.strokeStyle='rgba('+color+','+(.28+progress*.66)+')';ctx.lineWidth=e.boss?3:2;ctx.setLineDash(e.type==='lancer'?[13,7]:e.type==='rusher'?[5,5]:lagoon?[4,6]:[7,7]);ctx.beginPath();ctx.moveTo(e.r*.5,0);ctx.lineTo(length,0);ctx.stroke();if(lagoon){ctx.globalAlpha=.38+progress*.45;ctx.beginPath();ctx.moveTo(e.r*.6,-7);ctx.quadraticCurveTo(length*.5,7,length,-7);ctx.stroke()}ctx.setLineDash([]);ctx.globalAlpha=1;ctx.fillStyle='rgba('+color+','+(.4+progress*.5)+')';ctx.beginPath();ctx.moveTo(length,0);ctx.lineTo(length-10,-6);ctx.lineTo(length-10,6);ctx.closePath();ctx.fill();ctx.restore()
  }
  function drawEnemyProjectile(b,cam){
    let p=worldToScreen(b.x,b.y,cam),a=Math.atan2(b.vy,b.vx),isWarden=b.source==='warden',isChampion=b.source==='tyrant',isLagoon=b.source==='leviathan',color=b.kind==='shard'||b.kind==='wave'?'#79e7f2':b.kind==='arc'?'#9eb2d5':b.kind==='flame'?'#c83f46':b.kind==='core'?'#d6aa58':'#b52f3a';ctx.save();ctx.translate(p.x,p.y);ctx.rotate(a);
    if(isLagoon&&b.kind==='shard'){
      ctx.fillStyle='#2a9fc0';ctx.strokeStyle='#e9fdff';ctx.lineWidth=1.6;ctx.beginPath();ctx.moveTo(b.r*1.55,0);ctx.lineTo(-b.r*.5,-b.r*.65);ctx.lineTo(-b.r*1.18,0);ctx.lineTo(-b.r*.5,b.r*.65);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#f29ab8';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-b.r*.42,0);ctx.lineTo(b.r*1.05,0);ctx.stroke();
    }else if(isLagoon&&b.kind==='wave'){
      ctx.strokeStyle='#79e7f2';ctx.lineWidth=4;ctx.beginPath();ctx.arc(-b.r*.2,0,b.r*1.05,-1.18,1.18);ctx.stroke();ctx.strokeStyle='#e9fdff';ctx.lineWidth=1.6;ctx.beginPath();ctx.arc(-b.r*.45,0,b.r*.72,-1.05,1.05);ctx.stroke();ctx.fillStyle='#f29ab8';ctx.beginPath();ctx.arc(b.r*.42,0,b.r*.2,0,Math.PI*2);ctx.fill();
    }else if(isWarden&&b.kind==='rivet'){
      ctx.strokeStyle='#d6aa58';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-b.r*1.25,0);ctx.lineTo(b.r*.75,0);ctx.stroke();ctx.strokeStyle='#f4ead6';ctx.lineWidth=2;ctx.strokeRect(b.r*.32,-b.r*.5,b.r*.68,b.r);ctx.beginPath();ctx.moveTo(-b.r*.95,0);ctx.lineTo(-b.r*.95,b.r*.5);ctx.lineTo(-b.r*.55,b.r*.5);ctx.stroke();
    }else if(isWarden&&b.kind==='arc'){
      ctx.strokeStyle='#d6aa58';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,b.r*.95,-1.28,1.28);ctx.stroke();ctx.strokeStyle='#f4ead6';ctx.lineWidth=2;ctx.beginPath();ctx.arc(-1,0,b.r*.58,-1.08,1.08);ctx.stroke();ctx.fillStyle='#17243a';ctx.fillRect(-b.r*.24,-b.r*.24,b.r*.48,b.r*.48);
    }else if(isWarden&&b.kind==='core'){
      ctx.fillStyle='#17243a';ctx.strokeStyle='#d6aa58';ctx.lineWidth=2.5;roundedRect(-b.r,-b.r,b.r*2,b.r*2,2);ctx.fill();ctx.stroke();ctx.fillStyle='#f4ead6';ctx.beginPath();ctx.arc(0,-b.r*.18,b.r*.24,0,Math.PI*2);ctx.fill();ctx.fillRect(-b.r*.09,-b.r*.05,b.r*.18,b.r*.58);
    }else if(isChampion&&b.kind==='flame'){
      ctx.fillStyle='#c83f46';ctx.strokeStyle='#d6aa58';ctx.lineWidth=1.8;ctx.beginPath();ctx.moveTo(b.r*1.5,0);ctx.lineTo(-b.r*.5,-b.r*.72);ctx.lineTo(-b.r*1.22,0);ctx.lineTo(-b.r*.5,b.r*.72);ctx.closePath();ctx.fill();ctx.stroke();ctx.strokeStyle='#f4ead6';ctx.lineWidth=1;ctx.beginPath();ctx.moveTo(-b.r*.3,0);ctx.lineTo(b.r*.9,0);ctx.stroke();
    }else if(isChampion&&b.kind==='core'){
      ctx.fillStyle='#15111a';ctx.strokeStyle='#c83f46';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(b.r*1.2,0);ctx.lineTo(0,-b.r);ctx.lineTo(-b.r*.9,0);ctx.lineTo(0,b.r);ctx.closePath();ctx.fill();ctx.stroke();ctx.fillStyle='#d6aa58';ctx.beginPath();ctx.arc(0,0,b.r*.24,0,Math.PI*2);ctx.fill();
    }else if(b.kind==='rivet'){
      ctx.strokeStyle='#f4ead6';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-b.r*1.6,0);ctx.lineTo(b.r*.75,0);ctx.stroke();ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(b.r,0);ctx.lineTo(b.r*.25,-b.r*.55);ctx.lineTo(b.r*.25,b.r*.55);ctx.closePath();ctx.fill();
    }else if(b.kind==='arc'){
      ctx.strokeStyle=color;ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,b.r*.9,-1.2,1.2);ctx.stroke();ctx.strokeStyle='#f4ead6';ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(-2,0,b.r*.55,-1.05,1.05);ctx.stroke();
    }else if(b.kind==='flame'){
      ctx.fillStyle=color;ctx.beginPath();ctx.moveTo(b.r*1.2,0);ctx.quadraticCurveTo(-b.r*.2,-b.r,-b.r*1.25,0);ctx.quadraticCurveTo(-b.r*.2,b.r,b.r*1.2,0);ctx.fill();ctx.strokeStyle='#efcf8d';ctx.lineWidth=1.5;ctx.stroke();
    }else{
      ctx.fillStyle='#17243a';ctx.strokeStyle=color;ctx.lineWidth=2;roundedRect(-b.r,-b.r,b.r*2,b.r*2,3);ctx.fill();ctx.stroke();ctx.fillStyle=color;ctx.font='900 '+Math.max(8,b.r)+'px Georgia';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillText('\u2605',0,0)
    }
    ctx.restore()
  }
  function drawDreamworldGround(cam,zone,viewLeft,viewTop,viewRight,viewBottom){
    if(!isDreamworldMap()||!imageReady(dreamworldGround))return false;
    let tile=720,halfW=W/(2*cam.zoom),halfH=H/(2*cam.zoom),worldLeft=Math.max(0,cam.x-halfW-2),worldTop=Math.max(0,cam.y-halfH-2),worldRight=Math.min(WORLD.w,cam.x+halfW+2),worldBottom=Math.min(WORLD.h,cam.y+halfH+2),startX=Math.floor(worldLeft/tile)*tile,startY=Math.floor(worldTop/tile)*tile;
    ctx.save();ctx.globalAlpha=.86;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    for(let x=startX;x<worldRight;x+=tile)for(let y=startY;y<worldBottom;y+=tile){let p=worldToScreen(x,y,cam);ctx.drawImage(dreamworldGround,p.x,p.y,tile+1,tile+1)}
    ctx.globalAlpha=1;ctx.fillStyle=route==='furnace'&&depth>=3?'rgba(52,12,30,.2)':'rgba(5,9,28,.22)';ctx.fillRect(viewLeft-2,viewTop-2,viewRight-viewLeft+4,viewBottom-viewTop+4);
    let moonwash=ctx.createRadialGradient(W/2,H/2,45,W/2,H/2,Math.max(W,H)/cam.zoom*.68);moonwash.addColorStop(0,'rgba(112,125,255,.055)');moonwash.addColorStop(1,'rgba(4,7,22,.2)');ctx.fillStyle=moonwash;ctx.fillRect(viewLeft-2,viewTop-2,viewRight-viewLeft+4,viewBottom-viewTop+4);ctx.restore();return true
  }
  function drawDreamworldDecor(d,p){
    let meta=DREAMWORLD_PROP_META[d.assetId],image=dreamworldProps[d.assetId];if(!meta||!imageReady(image))return false;
    let iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height,w=d.w||meta.width,h=w*ih/iw,t=performance.now()/1000+(d.phase||0),bob=meta.float?Math.sin(t*1.3)*5:0,sway=d.assetId==='dreamTree'?Math.sin(t*.55)*.008:0;
    ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,0,0,.25)';ctx.beginPath();ctx.ellipse(0,4,w*.34,Math.max(5,w*.075),0,0,Math.PI*2);ctx.fill();
    if(meta.glow){let glow=ctx.createRadialGradient(0,-h*.18,2,0,-h*.18,w*.58);glow.addColorStop(0,meta.glow+'32');glow.addColorStop(1,meta.glow+'00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,-h*.18,w*.58,0,Math.PI*2);ctx.fill()}
    ctx.translate(0,bob);ctx.rotate(sway);if(d.flip)ctx.scale(-1,1);ctx.globalAlpha=.98;ctx.drawImage(image,-w/2,-h,w,h);ctx.restore();return true
  }
  function drawDreamworldCover(o,p,frontOnly){
    let image=dreamworldCover[o.assetId];if(!imageReady(image))return false;
    let vertical=o.h>o.w,long=vertical?o.h:o.w,thickness=vertical?o.w:o.h,iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height,drawW=long*1.16,drawH=drawW*ih/iw,foot=thickness/2+7,maxSize=Math.max(drawW,drawH);
    ctx.save();
    if(frontOnly){ctx.beginPath();ctx.rect(p.x-maxSize,p.y+o.h/2-12,maxSize*2,maxSize+30);ctx.clip()}
    ctx.translate(p.x,p.y);
    if(!frontOnly){ctx.fillStyle='rgba(0,0,0,.3)';ctx.beginPath();ctx.ellipse(5,o.h/2+7,Math.max(18,o.w*.47),Math.max(6,Math.min(15,o.h*.18)),0,0,Math.PI*2);ctx.fill()}
    if(vertical)ctx.rotate(Math.PI/2);
    if(o.assetId==='violetCrystalHedge'){ctx.shadowColor='#9c61ff';ctx.shadowBlur=10}
    ctx.globalAlpha=.99;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,-drawW/2,foot-drawH,drawW,drawH);ctx.shadowBlur=0;ctx.restore();return true
  }
  function drawSkyglassGround(cam,zone,viewLeft,viewTop,viewRight,viewBottom){
    if(!isSkyglassMap()||!imageReady(skyglassGround))return false;
    let tile=720,halfW=W/(2*cam.zoom),halfH=H/(2*cam.zoom),worldLeft=Math.max(0,cam.x-halfW-2),worldTop=Math.max(0,cam.y-halfH-2),worldRight=Math.min(WORLD.w,cam.x+halfW+2),worldBottom=Math.min(WORLD.h,cam.y+halfH+2),startX=Math.floor(worldLeft/tile)*tile,startY=Math.floor(worldTop/tile)*tile;
    ctx.save();ctx.globalAlpha=.84;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';
    for(let x=startX;x<worldRight;x+=tile)for(let y=startY;y<worldBottom;y+=tile){let p=worldToScreen(x,y,cam);ctx.drawImage(skyglassGround,p.x,p.y,tile+1,tile+1)}
    ctx.globalAlpha=1;ctx.fillStyle=route==='furnace'&&depth>=3?'rgba(42,17,30,.21)':'rgba(3,16,31,.24)';ctx.fillRect(viewLeft-2,viewTop-2,viewRight-viewLeft+4,viewBottom-viewTop+4);
    let tidewash=ctx.createRadialGradient(W/2,H/2,40,W/2,H/2,Math.max(W,H)/cam.zoom*.7);tidewash.addColorStop(0,'rgba(87,226,244,.045)');tidewash.addColorStop(.58,'rgba(21,111,145,.018)');tidewash.addColorStop(1,'rgba(2,10,22,.22)');ctx.fillStyle=tidewash;ctx.fillRect(viewLeft-2,viewTop-2,viewRight-viewLeft+4,viewBottom-viewTop+4);ctx.restore();return true
  }
  function drawSkyglassDecor(d,p){
    let meta=SKYGLASS_PROP_META[d.assetId],image=skyglassProps[d.assetId];if(!meta||!imageReady(image))return false;
    let iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height,w=d.w||meta.width,h=w*ih/iw,t=performance.now()/1000+(d.phase||0),bob=meta.float?Math.sin(t*1.12)*5:0,sway=d.assetId==='jellyfishLantern'?Math.sin(t*.72)*.018:d.assetId==='celestialKoiStatue'?Math.sin(t*.48)*.006:0;
    ctx.save();ctx.translate(p.x,p.y);ctx.fillStyle='rgba(0,8,18,.28)';ctx.beginPath();ctx.ellipse(0,5,w*.33,Math.max(5,w*.07),0,0,Math.PI*2);ctx.fill();
    if(meta.glow){let glow=ctx.createRadialGradient(0,-h*.22,2,0,-h*.22,w*.6);glow.addColorStop(0,meta.glow+'28');glow.addColorStop(1,meta.glow+'00');ctx.fillStyle=glow;ctx.beginPath();ctx.arc(0,-h*.22,w*.6,0,Math.PI*2);ctx.fill()}
    ctx.translate(0,bob);ctx.rotate(sway);if(d.flip)ctx.scale(-1,1);ctx.globalAlpha=.98;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,-w/2,-h,w,h);ctx.restore();return true
  }
  function drawSkyglassCover(o,p,frontOnly){
    let image=skyglassCover[o.assetId];if(!imageReady(image))return false;
    let vertical=o.h>o.w,long=vertical?o.h:o.w,thickness=vertical?o.w:o.h,iw=image.naturalWidth||image.width,ih=image.naturalHeight||image.height,drawW=long*1.16,drawH=drawW*ih/iw,foot=thickness/2+8,maxSize=Math.max(drawW,drawH);
    ctx.save();
    if(frontOnly){ctx.beginPath();ctx.rect(p.x-maxSize,p.y+o.h/2-12,maxSize*2,maxSize+32);ctx.clip()}
    ctx.translate(p.x,p.y);
    if(!frontOnly){ctx.fillStyle='rgba(0,8,18,.3)';ctx.beginPath();ctx.ellipse(5,o.h/2+8,Math.max(18,o.w*.48),Math.max(6,Math.min(15,o.h*.18)),0,0,Math.PI*2);ctx.fill()}
    if(vertical)ctx.rotate(Math.PI/2);
    if(o.assetId==='seaGlassShardWall'||o.assetId==='floatingReefBlocks'){ctx.shadowColor='#55dff2';ctx.shadowBlur=9}
    ctx.globalAlpha=.99;ctx.imageSmoothingEnabled=true;ctx.imageSmoothingQuality='high';ctx.drawImage(image,-drawW/2,foot-drawH,drawW,drawH);ctx.shadowBlur=0;ctx.restore();return true
  }
  function drawIllustratedGround(cam,zone,viewLeft,viewTop,viewRight,viewBottom){
    let mapId=save.selectedMap||'guild',theme=MAP_ENVIRONMENT_THEMES[mapId];if(!theme)return false;
    let tile=mapId==='foundry'?150:mapId==='summit'?176:144,worldLeft=cam.x-W/(2*cam.zoom)-tile,worldTop=cam.y-H/(2*cam.zoom)-tile,worldRight=cam.x+W/(2*cam.zoom)+tile,worldBottom=cam.y+H/(2*cam.zoom)+tile,startX=Math.floor(worldLeft/tile)*tile,startY=Math.floor(worldTop/tile)*tile;
    ctx.save();ctx.fillStyle=theme.floor;ctx.fillRect(viewLeft-3,viewTop-3,viewRight-viewLeft+6,viewBottom-viewTop+6);ctx.lineWidth=1;
    for(let x=startX;x<worldRight;x+=tile)for(let y=startY;y<worldBottom;y+=tile){
      let p=worldToScreen(x,y,cam),alternate=(Math.floor(x/tile)+Math.floor(y/tile))%2;
      if(mapId==='guild'){
        ctx.fillStyle=alternate?'#142238':'#111e31';ctx.strokeStyle=theme.line+'8c';roundedRect(p.x+2,p.y+2,tile-4,tile-4,8);ctx.fill();ctx.stroke();
        ctx.strokeStyle='#d6aa5818';ctx.beginPath();ctx.arc(p.x+tile/2,p.y+tile/2,tile*.18,0,Math.PI*2);ctx.stroke()
      }else if(mapId==='foundry'){
        ctx.fillStyle=alternate?'#211519':'#1a1115';ctx.strokeStyle=theme.line+'a0';roundedRect(p.x+3,p.y+3,tile-6,tile-6,3);ctx.fill();ctx.stroke();
        ctx.fillStyle='#d28a4a55';for(const point of [[12,12],[tile-12,12],[12,tile-12],[tile-12,tile-12]]){ctx.beginPath();ctx.arc(p.x+point[0],p.y+point[1],2.2,0,Math.PI*2);ctx.fill()}
        if((Math.floor(x/tile)*3+Math.floor(y/tile))%7===0){ctx.strokeStyle='#e7784538';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(p.x+tile*.22,p.y+tile*.58);ctx.lineTo(p.x+tile*.46,p.y+tile*.45);ctx.lineTo(p.x+tile*.7,p.y+tile*.56);ctx.stroke()}
      }else{
        ctx.fillStyle=alternate?'#1c1727':'#15121e';ctx.strokeStyle=theme.line+'88';ctx.beginPath();ctx.moveTo(p.x+tile/2,p.y+3);ctx.lineTo(p.x+tile-3,p.y+tile/2);ctx.lineTo(p.x+tile/2,p.y+tile-3);ctx.lineTo(p.x+3,p.y+tile/2);ctx.closePath();ctx.fill();ctx.stroke();
        ctx.strokeStyle='#f2c14f20';ctx.beginPath();ctx.moveTo(p.x+tile/2,p.y+tile*.25);ctx.lineTo(p.x+tile*.75,p.y+tile/2);ctx.lineTo(p.x+tile/2,p.y+tile*.75);ctx.lineTo(p.x+tile*.25,p.y+tile/2);ctx.closePath();ctx.stroke()
      }
    }
    let wash=ctx.createRadialGradient(W/2,H/2,65,W/2,H/2,Math.max(W,H)/cam.zoom*.7);wash.addColorStop(0,theme.detail+'0c');wash.addColorStop(1,'rgba(2,5,12,.34)');ctx.fillStyle=wash;ctx.fillRect(viewLeft-3,viewTop-3,viewRight-viewLeft+6,viewBottom-viewTop+6);ctx.restore();return true
  }
  function drawGuildTerrainModules(cam){
    if(!guildTerrain)return;
    let cellW=guildTerrain.grid.cellW,cellH=guildTerrain.grid.cellH,mapId=guildTerrain.mapId||save.selectedMap||'guild',theme=MAP_ENVIRONMENT_THEMES[mapId]||MAP_ENVIRONMENT_THEMES.guild,pathColor=theme.detail||'#d6aa58';
    ctx.save();ctx.lineJoin='round';ctx.lineCap='round';ctx.setLineDash(mapId==='skyglass'?[18,15]:mapId==='moonfall'?[7,15]:[14,12]);ctx.strokeStyle=pathColor+'20';ctx.lineWidth=mapId==='foundry'?4:3;ctx.beginPath();
    for(let index=0;index<guildTerrain.routePoints.length;index++){let point=guildTerrain.routePoints[index],screen=worldToScreen(point.x,point.y,cam);if(!index)ctx.moveTo(screen.x,screen.y);else ctx.lineTo(screen.x,screen.y)}
    ctx.stroke();ctx.setLineDash([]);
    for(const module of guildTerrain.modules){
      if(!combatViewContains(module.x,module.y,Math.max(cellW,cellH)*.7,30,cam))continue;
      let p=worldToScreen(module.x,module.y,cam),w=cellW-22,h=cellH-22,path=module.path;ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=path?.72:.34;ctx.strokeStyle=path?pathColor+'34':'rgba(111,133,164,.13)';ctx.lineWidth=path?2:1;roundedRect(-w/2,-h/2,w,h,mapId==='foundry'?8:mapId==='summit'?15:24);ctx.stroke();
      if(module.kind==='open'||module.kind==='courtyard'){ctx.strokeStyle=path?pathColor+'24':'rgba(93,116,151,.1)';ctx.beginPath();if(mapId==='summit'){ctx.moveTo(0,-Math.min(w,h)*.28);ctx.lineTo(Math.min(w,h)*.28,0);ctx.lineTo(0,Math.min(w,h)*.28);ctx.lineTo(-Math.min(w,h)*.28,0);ctx.closePath()}else ctx.arc(0,0,Math.min(w,h)*.25,0,Math.PI*2);ctx.stroke()}
      else if(module.kind==='crossroads'){ctx.strokeStyle=pathColor+'28';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-w*.36,0);ctx.lineTo(w*.36,0);ctx.moveTo(0,-h*.34);ctx.lineTo(0,h*.34);ctx.stroke()}
      else if(module.kind==='passage'){ctx.strokeStyle=pathColor+'24';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-w*.44,-h*.13);ctx.lineTo(w*.44,-h*.13);ctx.moveTo(-w*.44,h*.13);ctx.lineTo(w*.44,h*.13);ctx.stroke()}
      else if(module.kind==='blocked'){ctx.fillStyle='rgba(7,13,23,.14)';roundedRect(-w*.18,-h*.12,w*.36,h*.24,12);ctx.fill()}
      else if(module.kind==='entrance'){ctx.fillStyle=pathColor+'34';ctx.beginPath();ctx.moveTo(w*.12,0);ctx.lineTo(-w*.08,-h*.08);ctx.lineTo(-w*.08,h*.08);ctx.closePath();ctx.fill()}
      else if(module.kind==='boss'){ctx.strokeStyle='rgba(200,63,70,.2)';ctx.lineWidth=3;for(let ring=1;ring<=2;ring++){ctx.beginPath();ctx.arc(0,0,34+ring*24,0,Math.PI*2);ctx.stroke()}}
      ctx.restore()
    }
    ctx.restore()
  }
  function drawEnvironmentGround(cam,zone,viewLeft,viewTop,viewRight,viewBottom){return drawDreamworldGround(cam,zone,viewLeft,viewTop,viewRight,viewBottom)||drawSkyglassGround(cam,zone,viewLeft,viewTop,viewRight,viewBottom)||drawIllustratedGround(cam,zone,viewLeft,viewTop,viewRight,viewBottom)}
  function drawAdventureDecor(d,p,zone){
    if(d.assetId&&(drawDreamworldDecor(d,p)||drawSkyglassDecor(d,p)))return;
    let theme=MAP_ENVIRONMENT_THEMES[d.mapId]||MAP_ENVIRONMENT_THEMES.guild,r=d.r,detail=theme.detail;ctx.save();ctx.translate(p.x,p.y);ctx.rotate(d.rot);ctx.globalAlpha=.68;ctx.lineJoin='round';
    if(d.mapId==='foundry'){
      if(d.type===0){ctx.fillStyle='#0b080a99';ctx.strokeStyle=detail+'8c';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,r*.72,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle='#e7784530';for(let i=0;i<7;i++){let a=i*Math.PI*2/7;ctx.fillRect(Math.cos(a)*r*.45-2,Math.sin(a)*r*.45-2,4,4)}}
      else if(d.type===1){ctx.fillStyle='#291719aa';ctx.strokeStyle='#8c493c';roundedRect(-r,-r*.48,r*2,r*.96,3);ctx.fill();ctx.stroke();ctx.fillStyle='#d6aa5855';ctx.fillRect(-r*.72,-2,r*1.44,4)}
      else if(d.type===2){ctx.strokeStyle='#b85c3b88';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-r,0);ctx.lineTo(-r*.4,-r*.18);ctx.lineTo(r*.08,r*.08);ctx.lineTo(r*.62,-r*.15);ctx.lineTo(r,0);ctx.stroke()}
      else{ctx.fillStyle='#c4583d44';ctx.strokeStyle='#e7784577';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*.78,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.strokeStyle='#12090b';for(let i=-1;i<=1;i++){ctx.beginPath();ctx.moveTo(-r*.55,i*r*.22);ctx.lineTo(r*.55,i*r*.22);ctx.stroke()}}
    }else if(d.mapId==='summit'){
      if(d.type===0){ctx.strokeStyle=detail+'88';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*.72,0,Math.PI*2);ctx.stroke();ctx.beginPath();for(let i=0;i<8;i++){let a=i*Math.PI/4,rr=i%2?r*.28:r*.62;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.stroke()}
      else if(d.type===1){ctx.fillStyle='#4a182244';ctx.strokeStyle='#b78d555e';ctx.beginPath();ctx.moveTo(-r,-r*.42);ctx.lineTo(r*.72,-r*.6);ctx.lineTo(r,r*.4);ctx.lineTo(-r*.7,r*.58);ctx.closePath();ctx.fill();ctx.stroke()}
      else if(d.type===2){ctx.strokeStyle='#f2c14f66';ctx.lineWidth=4;ctx.beginPath();ctx.arc(0,0,r*.72,.2,Math.PI-.2);ctx.stroke();ctx.fillStyle='#f2c14f77';ctx.beginPath();ctx.arc(-r*.7,0,3,0,Math.PI*2);ctx.arc(r*.7,0,3,0,Math.PI*2);ctx.fill()}
      else{ctx.fillStyle='#eee2c522';ctx.strokeStyle='#d6aa5866';ctx.beginPath();ctx.moveTo(0,-r*.8);ctx.lineTo(r*.52,-r*.08);ctx.lineTo(r*.3,r*.68);ctx.lineTo(-r*.3,r*.68);ctx.lineTo(-r*.52,-r*.08);ctx.closePath();ctx.fill();ctx.stroke()}
    }else{
      if(d.type===0){ctx.strokeStyle=detail+'78';ctx.lineWidth=2;ctx.beginPath();ctx.arc(0,0,r*.72,0,Math.PI*2);ctx.stroke();ctx.beginPath();for(let i=0;i<8;i++){let a=i*Math.PI/4,rr=i%2?r*.3:r*.58;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.stroke()}
      else if(d.type===1){ctx.fillStyle='#20324a99';ctx.strokeStyle='#75869b66';roundedRect(-r,-r*.45,r*2,r*.9,5);ctx.fill();ctx.stroke();ctx.strokeStyle=detail+'55';ctx.beginPath();ctx.moveTo(-r*.72,0);ctx.lineTo(r*.72,0);ctx.stroke()}
      else if(d.type===2){ctx.strokeStyle='#d6aa5862';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(-r,0);ctx.quadraticCurveTo(0,r*.45,r,0);ctx.stroke()}
      else{ctx.fillStyle='#f0d99b25';ctx.strokeStyle='#d6aa5868';ctx.beginPath();ctx.moveTo(0,-r*.76);ctx.lineTo(r*.46,-r*.08);ctx.lineTo(r*.3,r*.62);ctx.lineTo(-r*.3,r*.62);ctx.lineTo(-r*.46,-r*.08);ctx.closePath();ctx.fill();ctx.stroke()}
    }
    ctx.restore()
  }
  function drawArenaCover(o,p,zone,frontOnly){
    if(o.assetId&&(drawDreamworldCover(o,p,frontOnly)||drawSkyglassCover(o,p,frontOnly)))return;
    let wide=o.w>o.h,theme=MAP_ENVIRONMENT_THEMES[o.mapId]||MAP_ENVIRONMENT_THEMES.guild,w=o.w,h=o.h,detail=theme.detail;ctx.save();ctx.translate(p.x,p.y);
    if(frontOnly){ctx.fillStyle=theme.shadow+'e8';roundedRect(-w/2+4,h/2-10,w-8,14,3);ctx.fill();ctx.strokeStyle=detail;ctx.globalAlpha=.72;ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(-w/2+8,h/2-8);ctx.lineTo(w/2-8,h/2-8);ctx.stroke();ctx.restore();return}
    ctx.fillStyle='rgba(0,0,0,.38)';roundedRect(-w/2+8,-h/2+10,w,h,8);ctx.fill();ctx.fillStyle=theme.cover;ctx.strokeStyle=theme.shadow;ctx.lineWidth=5;roundedRect(-w/2,-h/2,w,h,7);ctx.fill();ctx.stroke();ctx.fillStyle=theme.coverInset;ctx.strokeStyle=detail+'bb';ctx.lineWidth=2;roundedRect(-w/2+6,-h/2+6,w-12,h-12,4);ctx.fill();ctx.stroke();
    ctx.fillStyle=theme.shadow;ctx.globalAlpha=.7;if(wide){ctx.fillRect(-w/2+14,-5,w-28,10);for(let x=-w/2+23;x<w/2-12;x+=34){ctx.fillStyle=detail;ctx.beginPath();ctx.arc(x,-h/2+10,2.5,0,Math.PI*2);ctx.arc(x,h/2-10,2.5,0,Math.PI*2);ctx.fill()}}else{ctx.fillRect(-5,-h/2+14,10,h-28);for(let y=-h/2+23;y<h/2-12;y+=34){ctx.fillStyle=detail;ctx.beginPath();ctx.arc(-w/2+10,y,2.5,0,Math.PI*2);ctx.arc(w/2-10,y,2.5,0,Math.PI*2);ctx.fill()}}
    ctx.globalAlpha=.9;ctx.strokeStyle=detail;ctx.lineWidth=1.5;ctx.beginPath();ctx.arc(0,0,Math.min(16,Math.min(w,h)*.24),0,Math.PI*2);ctx.stroke();ctx.beginPath();for(let i=0;i<8;i++){let a=i*Math.PI/4,r=i%2?6:12;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.stroke();ctx.restore()
  }
  function drawLagoonPoolHazard(h,p){
    let warning=h.warm>0,time=performance.now()/650,pulse=.78+Math.sin(time*5)*.12,r=h.r*(warning?.94:.9);
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate((h.phase||0)*.2);
    ctx.globalAlpha=warning?.42:.72;ctx.fillStyle=warning?'rgba(20,104,140,.22)':'rgba(5,44,77,.58)';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=warning?'#d9fbff':'#79e7f2';ctx.lineWidth=warning?3:5;ctx.setLineDash(warning?[8,7]:[]);ctx.beginPath();ctx.arc(0,0,r*pulse,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.globalAlpha=warning?.55:.88;for(let i=0;i<3;i++){ctx.strokeStyle=i===2?'#f29ab8':'#79e7f2';ctx.lineWidth=2+i;ctx.beginPath();ctx.arc(0,0,r*(.28+i*.2),time*(i%2?-1:1)+i,-time*(i%2?-1:1)+Math.PI*(1.15+i*.12));ctx.stroke()}
    ctx.globalAlpha=1;ctx.strokeStyle='#f29ab8';ctx.lineWidth=warning?3:4;ctx.beginPath();ctx.moveTo(-r*.2,-r*.2);ctx.lineTo(r*.2,r*.2);ctx.moveTo(r*.2,-r*.2);ctx.lineTo(-r*.2,r*.2);ctx.stroke();ctx.restore()
  }
  function drawBossLaneHazard(h,p){
    let warning=h.warm>0,activeProgress=warning?0:Math.max(0,Math.min(1,h.active/.28)),crimson=h.type==='crimsonCleave',warden=h.type==='wardenLock',color=crimson?'#ef746c':warden?'#d6aa58':'#79e7f2',fill=crimson?'rgba(181,45,49,':warden?'rgba(214,170,88,':'rgba(40,181,214,',pulse=.72+Math.sin(performance.now()/80)*.16,w=h.width,l=h.length;
    ctx.save();ctx.translate(p.x,p.y);ctx.rotate(h.angle);
    ctx.globalAlpha=warning?.24+pulse*.16:.55+activeProgress*.25;ctx.fillStyle=fill+(warning?'.22)':'.5)');roundedRect(0,-w/2,l,w,w*.22);ctx.fill();
    ctx.strokeStyle=warning?'#fff4d2':color;ctx.lineWidth=warning?3:5;ctx.setLineDash(warning?[14,8]:[]);roundedRect(0,-w/2,l,w,w*.22);ctx.stroke();ctx.setLineDash([]);
    ctx.globalAlpha=warning?.52:.9;ctx.strokeStyle=color;ctx.lineWidth=2;
    for(let x=26;x<l-18;x+=42){ctx.beginPath();ctx.moveTo(x-8,-w*.22);ctx.lineTo(x+5,0);ctx.lineTo(x-8,w*.22);ctx.stroke()}
    if(!warning){ctx.globalAlpha=.7;ctx.fillStyle='#fff8df';for(let x=18;x<l;x+=34){ctx.beginPath();ctx.arc(x,0,2.5,0,Math.PI*2);ctx.fill()}}
    ctx.restore()
  }
  function drawVaultSealHazard(h,p){
    let warning=h.warm>0,time=performance.now()/700,pulse=.82+Math.sin(time*5)*.1,r=h.r;
    ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=warning?.5:.82;
    ctx.fillStyle=warning?'rgba(214,170,88,.12)':'rgba(84,57,19,.52)';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();
    ctx.strokeStyle=warning?'#fff1bd':'#d6aa58';ctx.lineWidth=warning?3:5;ctx.setLineDash(warning?[9,7]:[]);ctx.beginPath();ctx.arc(0,0,r*pulse,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);
    ctx.rotate(time*(warning?.65:1.5));ctx.strokeStyle='#d6aa58';ctx.lineWidth=3;ctx.strokeRect(-r*.34,-r*.34,r*.68,r*.68);
    ctx.rotate(-time*2.1);ctx.beginPath();for(let i=0;i<8;i++){let a=i*Math.PI/4,rr=i%2?r*.2:r*.46;ctx.lineTo(Math.cos(a)*rr,Math.sin(a)*rr)}ctx.closePath();ctx.stroke();
    ctx.strokeStyle=warning?'#f4ead6':'#c83f46';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-r*.16,-r*.16);ctx.lineTo(r*.16,r*.16);ctx.moveTo(r*.16,-r*.16);ctx.lineTo(-r*.16,r*.16);ctx.stroke();ctx.restore()
  }
  function drawAdventureHazard(h,p){
    if(h.type==='lagoonPool'){drawLagoonPoolHazard(h,p);return}
    if(h.type==='crimsonCleave'||h.type==='tidalLane'||h.type==='wardenLock'){drawBossLaneHazard(h,p);return}
    if(h.type==='vaultSeal'){drawVaultSealHazard(h,p);return}
    let warning=h.warm>0,pulse=.68+Math.sin(performance.now()/90)*.16,alpha=warning?pulse:Math.max(.58,Math.min(1,h.active*2)),r=h.r*(warning?1:.9),detail=h.type==='arc'?'#9eb2d5':h.type==='standard'?'#d6aa58':'#f4ead6';ctx.save();ctx.translate(p.x,p.y);ctx.globalAlpha=alpha;ctx.fillStyle=warning?'rgba(181,45,49,.14)':'rgba(181,45,49,.32)';ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.fill();ctx.save();ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.clip();ctx.strokeStyle=warning?'rgba(200,63,70,.22)':'rgba(244,234,214,.2)';ctx.lineWidth=5;for(let x=-r*2;x<r*2;x+=18){ctx.beginPath();ctx.moveTo(x-r,-r);ctx.lineTo(x+r,r);ctx.stroke()}ctx.restore();ctx.strokeStyle=warning?'#f4ead6':'#c83f46';ctx.lineWidth=warning?3:5;ctx.setLineDash(warning?[12,7]:[]);ctx.beginPath();ctx.arc(0,0,r,0,Math.PI*2);ctx.stroke();ctx.setLineDash([]);if(h.type==='standard'){ctx.rotate(-Math.PI*.18);ctx.strokeStyle='#d6aa58';ctx.lineWidth=4;ctx.beginPath();ctx.moveTo(0,h.r*.58);ctx.lineTo(0,-h.r*.62);ctx.stroke();ctx.fillStyle=warning?'#d6aa5866':'#c83f46aa';ctx.lineWidth=2;ctx.beginPath();ctx.moveTo(0,-h.r*.58);ctx.lineTo(h.r*.42,-h.r*.28);ctx.lineTo(0,h.r*.05);ctx.closePath();ctx.fill();ctx.stroke()}else if(h.type==='arc'){ctx.strokeStyle=detail;ctx.lineWidth=warning?4:7;ctx.beginPath();ctx.moveTo(-h.r*.3,-h.r*.5);ctx.lineTo(h.r*.05,-h.r*.12);ctx.lineTo(-h.r*.08,h.r*.02);ctx.lineTo(h.r*.32,h.r*.5);ctx.stroke()}else{ctx.strokeStyle=detail;ctx.lineWidth=4;for(let i=-1;i<=1;i++){let y=i*h.r*.24;ctx.beginPath();ctx.moveTo(-h.r*.38,y-h.r*.11);ctx.lineTo(0,y+h.r*.11);ctx.lineTo(h.r*.38,y-h.r*.11);ctx.stroke()}}ctx.strokeStyle='#c83f46';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(-h.r*.22,-h.r*.22);ctx.lineTo(h.r*.22,h.r*.22);ctx.moveTo(h.r*.22,-h.r*.22);ctx.lineTo(-h.r*.22,h.r*.22);ctx.stroke();ctx.restore()
  }
  function drawBossEntity(e){let stage=e.bossStage||1;if(e.bossKind==='tyrant'){let hot=stage===3?'#ffdf83':stage===2?'#ff9a4d':'#ff6b35',r=e.r,bob=Math.sin(e.anim*2.4)*2;ctx.translate(0,bob);ctx.strokeStyle=hot+'88';ctx.lineWidth=3;for(let ring=1;ring<=2;ring++){ctx.beginPath();ctx.arc(0,0,r*(1+.22*ring),e.anim*.18*ring,e.anim*.18*ring+Math.PI*(stage===3?1.8:1.15));ctx.stroke()}ctx.fillStyle=e.hit?'#fff0c2':'#4a2618';ctx.strokeStyle='#160b08';ctx.lineWidth=6;roundedRect(-r*.82,-r*.66,r*1.55,r*1.32,14);ctx.fill();ctx.stroke();ctx.fillStyle='#2a1711';ctx.strokeStyle='#b86632';ctx.lineWidth=3;roundedRect(-r*.72,-r*.55,r*1.24,r*1.1,10);ctx.fill();ctx.stroke();ctx.fillStyle='#382018';ctx.strokeStyle='#17100c';ctx.lineWidth=4;ctx.fillRect(-r*.48,-r*.9,r*.24,r*.37);ctx.strokeRect(-r*.48,-r*.9,r*.24,r*.37);ctx.fillRect(r*.12,-r*.88,r*.22,r*.34);ctx.strokeRect(r*.12,-r*.88,r*.22,r*.34);ctx.fillStyle='#c67838';ctx.fillRect(-r*.54,-r*.94,r*.36,r*.08);ctx.fillRect(r*.06,-r*.92,r*.34,r*.08);drawGear(-r*.55,r*.18,r*.27,-e.anim*1.1,'#8e542c');drawGear(r*.46,r*.2,r*.23,e.anim*1.35,'#a15a2d');ctx.fillStyle='#140b08';ctx.strokeStyle=hot;ctx.lineWidth=5;ctx.beginPath();ctx.arc(r*.02,0,r*.32,0,Math.PI*2);ctx.fill();ctx.stroke();ctx.fillStyle=e.charge>0?'#fff0c2':hot;ctx.shadowColor=hot;ctx.shadowBlur=stage===3?22:12;ctx.beginPath();ctx.arc(r*.02,0,r*.18,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#160807';for(let i=0;i<3;i++)ctx.fillRect(-r*.08+i*r*.1,-r*.14,r*.045,r*.28);ctx.fillStyle='#2b1710';ctx.strokeStyle='#b86632';ctx.lineWidth=3;roundedRect(r*.55,-r*.17,r*.66,r*.34,8);ctx.fill();ctx.stroke();ctx.fillStyle=hot;ctx.beginPath();ctx.arc(r*1.18,0,r*.13,0,Math.PI*2);ctx.fill();ctx.fillStyle='#d9a15f';for(let i=0;i<8;i++){let a=i*Math.PI/4;ctx.beginPath();ctx.arc(Math.cos(a)*r*.64,Math.sin(a)*r*.48,r*.035,0,Math.PI*2);ctx.fill()}}else{let stageColor=stage===3?'#8f9dff':stage===2?'#f2c14f':'#ef5350';ctx.rotate(-e.angle+e.anim*(.38+stage*.15));ctx.strokeStyle=stageColor+'99';ctx.lineWidth=4;for(let ring=1;ring<=2;ring++){ctx.beginPath();ctx.arc(0,0,e.r*(1+.24*ring),ring?e.anim*.15:0,Math.PI*2+e.anim*.15);ctx.stroke()}drawGear(0,0,e.r,e.anim*.8,e.hit?'#fff0c2':'#70342f');ctx.fillStyle='#161113';ctx.beginPath();ctx.arc(0,0,e.r*.58,0,Math.PI*2);ctx.fill();ctx.strokeStyle=stageColor;ctx.lineWidth=5;ctx.stroke();ctx.fillStyle=e.charge>0?'#fff0c2':stageColor;ctx.beginPath();ctx.arc(0,0,14,0,Math.PI*2);ctx.fill();ctx.shadowColor=stageColor;ctx.shadowBlur=18;ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#1a0c0c';ctx.beginPath();ctx.arc(0,0,6,0,Math.PI*2);ctx.fill()}}
  function drawMiniMap(){
    if(mode!=='run'||!player||miniW<2||miniH<2)return;
    miniCtx.clearRect(0,0,miniW,miniH);
    let pad=5,scale=Math.min((miniW-pad*2)/WORLD.w,(miniH-pad*2)/WORLD.h),mapW=WORLD.w*scale,mapH=WORLD.h*scale,mapX=(miniW-mapW)/2,mapY=(miniH-mapH)/2,zone=zoneAt(depth),toMap=(x,y)=>({x:mapX+x*scale,y:mapY+y*scale});
    miniCtx.fillStyle='#081321';miniCtx.fillRect(mapX,mapY,mapW,mapH);
    miniCtx.globalAlpha=.2;miniCtx.fillStyle=zone.accent;for(let x=mapX;x<mapX+mapW;x+=mapW/6)miniCtx.fillRect(x,mapY,1,mapH);for(let y=mapY;y<mapY+mapH;y+=mapH/4)miniCtx.fillRect(mapX,y,mapW,1);miniCtx.globalAlpha=1;
    if(guildTerrain&&bossActive&&!bossDefeated){
      miniCtx.strokeStyle='#d6aa5870';miniCtx.lineWidth=1.35;miniCtx.setLineDash([3,2]);miniCtx.beginPath();for(let index=0;index<guildTerrain.routePoints.length;index++){let routePoint=toMap(guildTerrain.routePoints[index].x,guildTerrain.routePoints[index].y);if(!index)miniCtx.moveTo(routePoint.x,routePoint.y);else miniCtx.lineTo(routePoint.x,routePoint.y)}miniCtx.stroke();miniCtx.setLineDash([]);
    }
    miniCtx.fillStyle='#40506a';for(const o of obstacles){let p=toMap(o.x-o.w/2,o.y-o.h/2);miniCtx.fillRect(p.x,p.y,Math.max(1.5,o.w*scale),Math.max(1.5,o.h*scale))}
    let cam=camera(),viewW=Math.min(WORLD.w,W/cam.zoom),viewH=Math.min(WORLD.h,H/cam.zoom),view=toMap(cam.x-viewW/2,cam.y-viewH/2);miniCtx.fillStyle='#e8f0ff0b';miniCtx.fillRect(view.x,view.y,viewW*scale,viewH*scale);miniCtx.strokeStyle='#b6c6dc88';miniCtx.lineWidth=1;miniCtx.strokeRect(view.x+.5,view.y+.5,Math.max(1,viewW*scale-1),Math.max(1,viewH*scale-1));
    let rareCaches=caches.filter(cache=>cache.rare&&!cache.opened),pulse=.85+Math.sin(performance.now()/180)*.15;for(const cache of rareCaches){let p=toMap(cache.x,cache.y),r=3.2*pulse;miniCtx.save();miniCtx.translate(p.x,p.y);miniCtx.rotate(Math.PI/4);miniCtx.fillStyle='#ffe19a';miniCtx.shadowColor='#f2c14f';miniCtx.shadowBlur=6;miniCtx.fillRect(-r/2,-r/2,r,r);miniCtx.restore()}if(bossLootChest){let p=toMap(bossLootChest.x,bossLootChest.y),r=(4.2+(bossLootChest.rank||0)*.4)*pulse;miniCtx.save();miniCtx.translate(p.x,p.y);miniCtx.fillStyle=bossLootChest.color;miniCtx.strokeStyle='#fff4d2';miniCtx.lineWidth=1.2;miniCtx.shadowColor=bossLootChest.color;miniCtx.shadowBlur=10;miniCtx.beginPath();miniCtx.arc(0,0,r,0,Math.PI*2);miniCtx.fill();miniCtx.stroke();miniCtx.globalAlpha=.7;miniCtx.beginPath();miniCtx.arc(0,0,r+2.2,0,Math.PI*2);miniCtx.stroke();miniCtx.restore()}
    if(bossActive&&bossEntity){let p=toMap(bossEntity.x,bossEntity.y);miniCtx.strokeStyle=currentBoss().accent;miniCtx.lineWidth=1.5;miniCtx.beginPath();miniCtx.arc(p.x,p.y,4.4,0,Math.PI*2);miniCtx.stroke();miniCtx.fillStyle='#c83f46';miniCtx.beginPath();miniCtx.arc(p.x,p.y,2.2,0,Math.PI*2);miniCtx.fill()}
    let pp=toMap(player.x,player.y),angle=player.angle||0;miniCtx.save();miniCtx.translate(pp.x,pp.y);miniCtx.rotate(angle);miniCtx.fillStyle='#fff3d2';miniCtx.strokeStyle='#c83f46';miniCtx.lineWidth=1.3;miniCtx.beginPath();miniCtx.moveTo(6,0);miniCtx.lineTo(-4,-3.8);miniCtx.lineTo(-2.2,0);miniCtx.lineTo(-4,3.8);miniCtx.closePath();miniCtx.fill();miniCtx.stroke();miniCtx.restore();
    miniCtx.strokeStyle='#a8874e';miniCtx.lineWidth=1;miniCtx.strokeRect(mapX+.5,mapY+.5,mapW-1,mapH-1);
    let cacheCount=rareCaches.length+(bossLootChest?1:0);ui.miniMapCacheCount.textContent=cacheCount?'\u2726 '+cacheCount:'';ui.miniMapCacheCount.classList.toggle('show',cacheCount>0)
  }
  function draw(){
    if(mode!=='run')return;ctx.clearRect(0,0,W,H);let cam=camera(),zone=zoneAt(depth),shakeNow=save.settings.shake?shake:0,sx=(Math.random()-.5)*shakeNow,sy=(Math.random()-.5)*shakeNow;ctx.save();ctx.translate(sx,sy);let g=ctx.createLinearGradient(0,0,0,H);g.addColorStop(0,zone.top);g.addColorStop(1,zone.bottom);ctx.fillStyle=g;ctx.fillRect(-10,-10,W+20,H+20);ctx.save();ctx.translate(W/2,H/2);ctx.scale(cam.zoom,cam.zoom);ctx.translate(-W/2,-H/2);
    let viewLeft=(W-W/cam.zoom)/2,viewTop=(H-H/cam.zoom)/2,viewRight=W-viewLeft,viewBottom=H-viewTop,grid=96,ox=(((-cam.x+W/2)%grid)+grid)%grid,oy=(((-cam.y+H/2)%grid)+grid)%grid,environmentGroundDrawn=drawEnvironmentGround(cam,zone,viewLeft,viewTop,viewRight,viewBottom);
    while(ox>viewLeft)ox-=grid;while(oy>viewTop)oy-=grid;
    if(!environmentGroundDrawn){ctx.strokeStyle=zone.grid;ctx.lineWidth=1;for(let x=ox;x<viewRight;x+=grid){ctx.beginPath();ctx.moveTo(x,viewTop);ctx.lineTo(x,viewBottom);ctx.stroke()}for(let y=oy;y<viewBottom;y+=grid){ctx.beginPath();ctx.moveTo(viewLeft,y);ctx.lineTo(viewRight,y);ctx.stroke()}ctx.fillStyle='#f4ead608';for(let x=ox;x<viewRight;x+=grid)for(let y=oy;y<viewBottom;y+=grid){ctx.beginPath();ctx.arc(x,y,2,0,Math.PI*2);ctx.fill()}}
    drawGuildTerrainModules(cam);
    if(depth===2){ctx.fillStyle=environmentGroundDrawn?'#c83f4607':'#c83f460a';for(let y=oy;y<viewBottom;y+=grid*2)ctx.fillRect(viewLeft,y,viewRight-viewLeft,grid*.24)}else if((depth===3||depth===4)&&route==='furnace'){ctx.strokeStyle=environmentGroundDrawn?'#c83f4618':'#c83f4625';ctx.lineWidth=depth===4?12:8;for(let x=ox-grid;x<viewRight+grid;x+=grid*2){ctx.beginPath();ctx.moveTo(x,viewTop);ctx.lineTo(x+(viewBottom-viewTop)*.32,viewBottom);ctx.stroke()}}else if(depth===3||depth===4){ctx.strokeStyle=environmentGroundDrawn?'#bfc8ff18':'#f4ead622';ctx.lineWidth=2;for(let x=ox;x<viewRight;x+=grid*2){ctx.beginPath();ctx.arc(x,H*.5,grid*.55,Math.PI*.35,Math.PI*1.65);ctx.stroke()}}else if(depth===5){ctx.strokeStyle=zone.accent+(environmentGroundDrawn?'20':'30');ctx.lineWidth=3;for(let r=90;r<Math.max(W,H)/cam.zoom;r+=120){ctx.beginPath();ctx.arc(W/2,H/2,r,0,Math.PI*2);ctx.stroke()}}
    for(const d of decor){if(d.assetId&&d.y>player.y+8||!combatViewContains(d.x,d.y,d.r,60,cam))continue;let p=worldToScreen(d.x,d.y,cam);drawAdventureDecor(d,p,zone)}
    for(const o of obstacles){if(!combatViewContains(o.x,o.y,Math.max(o.w,o.h)/2,30,cam))continue;drawArenaCover(o,worldToScreen(o.x,o.y,cam),zone,false)}
    for(const h of hazards){let p=worldToScreen(h.x,h.y,cam);drawAdventureHazard(h,p)}
    for(const c of caches)drawTreasureChest(c,cam);if(bossLootChest)drawBossLootChest(bossLootChest,cam);for(const drop of lootDrops)drawAdventureLoot(drop,cam);
    for(const b of enemyBullets)drawEnemyProjectile(b,cam);
    for(const e of enemies){
      let p=worldToScreen(e.x,e.y,cam);
      if(e.charge>0){if(e.type==='brute')drawTankTelegraph(e,p);else drawEnemyAimTelegraph(e,p)}
      ctx.save();ctx.translate(p.x,p.y);
      if(e.boss){drawBossStagger(e);drawBossArt(e)}else drawEnemyArt(e);
      ctx.restore();let hp=Math.max(0,e.hp/e.max);if(!e.boss&&(hp<1||e.elite)){ctx.fillStyle='#14101a';ctx.fillRect(p.x-e.r,p.y-e.r-11,e.r*2,4);ctx.fillStyle=e.elite?'#d6aa58':e.type==='lancer'?'#9eb2d5':'#c83f46';ctx.fillRect(p.x-e.r,p.y-e.r-11,e.r*2*hp,4)}
    }
    let pp=worldToScreen(player.x,player.y,cam),stats=cargoStats(),thermalReady=player.thermalCharges>0;ctx.save();ctx.translate(pp.x,pp.y);drawEquippedRarityAura();
    if(usesBlackHoleStorm(stats)&&(player.spinTime>0||player.spinLeap>0))drawBlackHoleStorm(stats);
    else if(player.spinTime>0){let radius=stats.spinRadius,glow=.55+Math.sin(player.spinAngle*1.8)*.2;ctx.save();ctx.globalAlpha=glow;ctx.rotate(player.spinAngle);ctx.strokeStyle='#d6aa58';ctx.lineWidth=9;ctx.lineCap='round';ctx.shadowColor='#ffc928';ctx.shadowBlur=12;for(let ring=0;ring<3;ring++){ctx.beginPath();ctx.arc(0,0,radius*(.62+ring*.14),-.76+ring*.44,.78+ring*.44);ctx.stroke()}ctx.strokeStyle='#f4ead6';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,radius*.92,-.56,.5);ctx.stroke();ctx.restore()}
    if(player.inv>0&&player.dashTime<=0&&!player.spinTime&&Math.floor(player.inv*16)%2===0)ctx.globalAlpha=.42;if(player.dashTime>0){ctx.strokeStyle=thermalReady?'#b52d31cc':stats.ram?'#e0ad4fcc':'#efe5d0aa';ctx.lineWidth=5;ctx.beginPath();ctx.arc(0,0,player.r+7,0,Math.PI*2);ctx.stroke()}if(player.shields>0){ctx.strokeStyle='#e0ad4faa';ctx.lineWidth=3;ctx.setLineDash([6,4]);ctx.beginPath();ctx.arc(0,0,player.r+8,0,Math.PI*2);ctx.stroke();ctx.setLineDash([])}if(thermalReady){ctx.strokeStyle='#b52d31aa';ctx.lineWidth=3;ctx.beginPath();ctx.arc(0,0,player.r+11+Math.sin(performance.now()/120)*2,0,Math.PI*2);ctx.stroke()}ctx.save();if(player.spinTime>0){ctx.rotate(player.spinAngle);ctx.scale(1.08,1.08)}else if(player.spinLeap>0){let leapProgress=1-player.spinLeap/player.spinLeapMax;ctx.translate(0,-Math.sin(leapProgress*Math.PI)*24);ctx.scale(1.04,1.04)}ctx.scale(player.facing<0?-1:1,1);drawPappaHammer();ctx.restore();ctx.restore();
    for(const o of obstacles){if(!combatViewContains(o.x,o.y,Math.max(o.w,o.h)/2,30,cam))continue;drawArenaCover(o,worldToScreen(o.x,o.y,cam),zone,true)}
    for(const d of decor){if(!d.assetId||d.y<=player.y+8||!combatViewContains(d.x,d.y,d.r,60,cam))continue;let p=worldToScreen(d.x,d.y,cam);drawAdventureDecor(d,p,zone)}
    for(const fx of effects){
      let q=worldToScreen(fx.x,fx.y,cam),progress=1-fx.life/fx.max,alpha=Math.max(0,fx.life/fx.max),radius=fx.r+(fx.maxR-fx.r)*progress;ctx.save();ctx.globalAlpha=alpha;ctx.translate(q.x,q.y);
      if(fx.kind==='hammerSwing'){ctx.rotate(fx.angle||0);ctx.strokeStyle=fx.color;ctx.lineCap='round';ctx.lineWidth=Math.max(1,5*(1-progress));ctx.beginPath();ctx.arc(0,0,radius,-1.02,1.02);ctx.stroke();ctx.globalAlpha=alpha*.65;ctx.strokeStyle='#f4ead6';ctx.lineWidth=Math.max(1,2.4*(1-progress));ctx.beginPath();ctx.arc(0,0,radius*.72,-.88,.88);ctx.stroke()}
      else if(fx.kind==='hitSpark'){ctx.rotate(fx.angle||0);ctx.strokeStyle=fx.color;ctx.lineCap='round';ctx.shadowColor=fx.color;ctx.shadowBlur=5;ctx.lineWidth=Math.max(1,3.5*(1-progress));for(let ray=0;ray<6;ray++){ctx.rotate(Math.PI/3);ctx.beginPath();ctx.moveTo(radius*.18,0);ctx.lineTo(radius,0);ctx.stroke()}}
      else if(fx.kind==='lunarArc'){let target=worldToScreen(fx.tx,fx.ty,cam);ctx.strokeStyle=fx.color;ctx.lineWidth=Math.max(1,4*(1-progress));ctx.shadowColor=fx.color;ctx.shadowBlur=8;ctx.beginPath();ctx.moveTo(0,0);ctx.quadraticCurveTo((target.x-q.x)*.48-10,(target.y-q.y)*.48-14,target.x-q.x,target.y-q.y);ctx.stroke()}
      else if(fx.kind==='coinText'){ctx.translate(0,-progress*28);ctx.fillStyle=fx.color;ctx.strokeStyle='#111827';ctx.lineWidth=3;ctx.font='900 11px Georgia,serif';ctx.textAlign='center';ctx.strokeText(fx.text||'+$',0,0);ctx.fillText(fx.text||'+$',0,0)}
      else if(fx.kind==='healText'){ctx.translate(0,-progress*34);ctx.fillStyle=fx.color;ctx.strokeStyle='#07130c';ctx.lineWidth=4;ctx.font='900 13px Georgia,serif';ctx.textAlign='center';ctx.strokeText(fx.text||'+HP',0,0);ctx.fillText(fx.text||'+HP',0,0)}
      else if(fx.kind==='spinArc'){ctx.rotate((fx.angle||0)+progress*1.8);ctx.strokeStyle=fx.color;ctx.shadowColor=fx.color;ctx.shadowBlur=10;ctx.lineCap='round';ctx.lineWidth=Math.max(2,11*(1-progress));for(let arm=0;arm<3;arm++){ctx.rotate(Math.PI*2/3);ctx.beginPath();ctx.arc(0,0,radius,-.62,.62);ctx.stroke()}}
      else if(fx.kind==='spinCrit'){ctx.rotate(progress*Math.PI);ctx.strokeStyle=fx.color;ctx.shadowColor=fx.color;ctx.shadowBlur=12;ctx.lineWidth=Math.max(1,5*(1-progress));for(let arm=0;arm<4;arm++){ctx.rotate(Math.PI/2);ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(radius,0);ctx.stroke()}}
      else if(fx.kind==='packClear'){ctx.strokeStyle=fx.color;ctx.shadowColor=fx.color;ctx.shadowBlur=16;ctx.lineWidth=Math.max(2,8*(1-progress));ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();ctx.rotate(progress*1.3);ctx.fillStyle=fx.color;for(let shard=0;shard<12;shard++){ctx.rotate(Math.PI/6);ctx.beginPath();ctx.moveTo(radius*.7,-3);ctx.lineTo(radius,0);ctx.lineTo(radius*.7,3);ctx.closePath();ctx.fill()}}
      else if(fx.kind==='blackHoleVfx'||fx.kind==='blackHoleCollapse')drawBlackHoleEffect(fx,progress,alpha);
      else if(fx.kind==='pressureWave'){ctx.strokeStyle=fx.color;ctx.lineWidth=Math.max(2,10*(1-progress));ctx.globalAlpha=alpha*.78;ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke();ctx.globalAlpha=alpha*.36;ctx.strokeStyle='#f4ead6';ctx.lineWidth=Math.max(1,3*(1-progress));ctx.beginPath();ctx.arc(0,0,radius*.92,0,Math.PI*2);ctx.stroke()}
      else if(fx.kind==='groundCrack'){ctx.rotate(fx.angle||0);ctx.strokeStyle=fx.color;ctx.lineWidth=Math.max(1,4*(1-progress));ctx.lineCap='round';for(let crack=0;crack<7;crack++){let a=(crack/7-.5)*Math.PI*1.5,length=radius*(.7+(crack%3)*.12);ctx.save();ctx.rotate(a);ctx.beginPath();ctx.moveTo(5,0);ctx.lineTo(length*.42,(crack%2?1:-1)*5);ctx.lineTo(length,0);ctx.stroke();ctx.restore()}}
      else if(fx.kind==='enemyLaunch'){let lift=Math.sin(progress*Math.PI),cells={rusher:[0,0],shooter:[1,0],brute:[0,1],lancer:[1,1]},cell=cells[fx.enemyType]||cells.rusher,box=fx.r*(fx.enemyType==='brute'?3.05:4.15);ctx.translate(0,-lift*34);ctx.rotate(fx.rot||0);ctx.scale(1+lift*.48,1+lift*.48);ctx.globalAlpha=alpha;if(imageReady(enemyAtlas))drawAtlasCell(enemyAtlas,cell[0],cell[1],2,2,box,box,false,false);else{ctx.fillStyle=fx.color;roundedRect(-fx.r,-fx.r*.7,fx.r*2,fx.r*1.4,5);ctx.fill()}}
      else if(fx.kind==='tankImpact'){ctx.rotate(fx.angle||0);ctx.fillStyle=fx.color;ctx.beginPath();ctx.moveTo(radius,0);ctx.lineTo(-radius*.3,-radius*.38);ctx.lineTo(-radius*.04,0);ctx.lineTo(-radius*.3,radius*.38);ctx.closePath();ctx.fill();ctx.strokeStyle='#f4ead6';ctx.lineWidth=Math.max(1,3*(1-progress));ctx.beginPath();ctx.moveTo(radius*.62,0);ctx.lineTo(-radius*.28,-radius*.58);ctx.moveTo(radius*.62,0);ctx.lineTo(-radius*.28,radius*.58);ctx.stroke()}
      else{ctx.strokeStyle=fx.color;ctx.lineWidth=Math.max(1,4*(1-progress));ctx.beginPath();ctx.arc(0,0,radius,0,Math.PI*2);ctx.stroke()}
      ctx.restore()
    }
    for(const p of particles){let q=worldToScreen(p.x,p.y,cam),particleAlpha=Math.max(0,p.life/p.max);ctx.globalAlpha=particleAlpha;if(p.kind==='gravityMote'){ctx.save();ctx.translate(q.x,q.y);ctx.rotate(p.angle+Math.PI/2);ctx.fillStyle=p.color;ctx.shadowColor=p.color;ctx.shadowBlur=5;ctx.beginPath();ctx.moveTo(0,-p.r*1.8);ctx.lineTo(p.r*.72,0);ctx.lineTo(0,p.r*2.8);ctx.lineTo(-p.r*.72,0);ctx.closePath();ctx.fill();ctx.restore()}else{ctx.fillStyle=p.color;ctx.beginPath();ctx.arc(q.x,q.y,p.r*.55,0,Math.PI*2);ctx.fill()}}ctx.globalAlpha=1;ctx.restore();let vignette=ctx.createRadialGradient(W/2,H/2,Math.min(W,H)*.25,W/2,H/2,Math.max(W,H)*.72);vignette.addColorStop(.55,'#0000');vignette.addColorStop(1,'#0009');ctx.fillStyle=vignette;ctx.fillRect(0,0,W,H);if(bossLootChest)drawBossLootArrivalFlash(bossLootChest,cam);if(flash>0){ctx.fillStyle='rgba(200,63,70,'+(flash*1.25)+')';ctx.fillRect(0,0,W,H)}ctx.restore();
    if(depthPulse>0){let a=Math.min(1,depthPulse*1.8),scale=1+(1.15-depthPulse)*.08,boss=currentBoss();ctx.save();ctx.globalAlpha=a;ctx.translate(W/2,H*.22);ctx.scale(scale,scale);ctx.textAlign='center';ctx.font='900 11px Georgia,serif';ctx.fillStyle='#f4ead6';ctx.fillText(depth===5?'CHAMPION AHEAD':'FLOOR '+expeditionFloor(),0,-13);ctx.font='900 28px Georgia,serif';ctx.fillStyle=zone.accent;ctx.fillText(depth===5?boss.name:zone.name,0,22);ctx.restore()}
    if(paused){ctx.fillStyle='#05090ba8';ctx.fillRect(0,0,W,H)}
  }

  function updateRouteHud(){let ticks=[...ui.routeTicks.children];ticks.forEach((tick,index)=>{let level=index+1;tick.className=level<depth||bossDefeated?'done':level===depth?(bossActive?'boss':'current'):''});let label=route?ROUTES[route].short:activeMap().short;ui.routeLabel.textContent=expeditionCycle?label+'  \u00B7  ASCENT '+(expeditionCycle+1):label;ui.depthRoute.classList.toggle('furnace',route==='furnace');ui.depthRoute.classList.toggle('dynamo',route==='dynamo');ui.routeProgress.style.width=(bossActive||bossDefeated?100:zoneProgress()*100)+'%'}
  function updateHud(){let hp=Math.max(0,player?player.hp:0),max=player?player.maxHp:maxHp(),danger=depth+riskTier*2,mult=lootMultiplier(),best=bestLootEntry(),bestItem=gearDefinition(best),legendary=lootManifest().some(entry=>gearDefinition(entry).rarity==='legendary');ui.healthText.textContent=Math.ceil(hp)+' / '+max+(player&&player.shields?'  \u25C6'+player.shields:'');ui.healthFill.style.width=(hp/max*100)+'%';ui.runScrap.textContent=runScrap;ui.lootBest.textContent=bestItem?bestItem.name:'NO BOSS GEAR';ui.lootBest.style.color=bestItem?LOOT_RARITIES[bestItem.rarity].color:'';ui.lootMetric.classList.toggle('legendary',legendary);ui.expedition.classList.toggle('legendaryCargo',legendary);ui.extract.classList.toggle('hotLoot',legendary);ui.extract.disabled=!!bossLootChest;ui.extract.classList.toggle('cacheLocked',!!bossLootChest);ui.depth.textContent=expeditionFloor();let risk=bossActive?'BOSS':danger<3?'LOW':danger<7?'RISING':danger<11?'HIGH':'EXTREME';ui.risk.textContent=risk+' x'+mult.toFixed(1);ui.risk.style.color=bossActive?currentBoss().accent:danger<3?'#7ccf63':danger<7?'#f2c14f':'#ef5350';if(player){let stats=cargoStats(),dashMax=stats.dashCd,dashReady=Math.max(0,1-player.dashCd/dashMax),pack=nearbyEnemyCount(player.x,player.y,HAMMERSTORM.acquireRadius,true),activeSpin=player.spinLeap>0||player.spinTime>0,spinCount=activeSpin?(player.spinKills||player.spinPack):pack;ui.dash.style.setProperty('--ready',dashReady*360+'deg');ui.dash.classList.toggle('cooling',player.dashCd>0);ui.spin.style.setProperty('--ready','360deg');ui.spin.classList.remove('cooling');ui.spin.classList.toggle('blackHole',usesBlackHoleStorm(stats));ui.spin.classList.toggle('active',activeSpin);ui.spin.classList.toggle('primed',!activeSpin&&pack>=8);ui.spin.classList.toggle('overloaded',!activeSpin&&pack>=18);ui.spin.classList.toggle('cataclysm',!activeSpin&&pack>=30);ui.spinPackCount.textContent=spinCount>99?'99+':spinCount}syncXpHud();updateRouteHud()}
  function loop(now){let dt=Math.min(.033,(now-last)/1000||0);last=now;if(hitStop>0)hitStop=Math.max(0,hitStop-dt);else update(dt);draw();drawMiniMap();requestAnimationFrame(loop)}

  function syncSettings(){for(const pair of [[ui.soundToggle,'sound'],[ui.shakeToggle,'shake'],[ui.particlesToggle,'particles']]){let on=save.settings[pair[1]];pair[0].classList.toggle('off',!on);pair[0].setAttribute('aria-checked',String(on));pair[0].querySelector('b').textContent=on?'ON':'OFF'}}
  function syncDevTools(){let inRun=mode==='run',next=SCHEMATIC_IDS.find(id=>schematicLevel(id)<BOSS_SCHEMATICS[id].max),lagoonBoss=activeMap().boss==='leviathan';ui.devScrap.textContent=inRun?'+500 RUN COINS':'+500 BANK COINS';ui.devHeal.disabled=!inRun;ui.devCache.disabled=!inRun;ui.devLoot.disabled=!inRun;ui.devWarden.textContent=lagoonBoss?'FIGHT SKYGLASS LEVIATHAN':'FIGHT VAULT WARDEN';ui.devTyrant.hidden=lagoonBoss;ui.devSchematic.disabled=!next;ui.devSchematic.textContent=next?'NEXT TROPHY':'TROPHIES MAX'}
  function openSettings(){settingsWasRun=mode==='run';if(settingsWasRun)paused=true;abandonArmed=false;devResetArmed=false;ui.abandon.textContent='ABANDON EXPEDITION';ui.abandon.classList.remove('confirm');ui.devReset.textContent='HARD RESET SAVE';ui.devReset.classList.remove('confirm');ui.devPanel.classList.remove('show');ui.devButton.setAttribute('aria-expanded','false');ui.settingsPanel.classList.toggle('baseMode',!settingsWasRun);syncSettings();syncDevTools();ui.settingsOverlay.classList.add('show')}
  function closeSettings(){ui.settingsOverlay.classList.remove('show');paused=false;abandonArmed=false;devResetArmed=false;last=performance.now()}
  function toggleSetting(key){save.settings[key]=!save.settings[key];persist();syncSettings();if(key==='sound'){if(save.settings.sound){ensureAudio();sound('pickup')}else if(audio.timer){clearInterval(audio.timer);audio.timer=null}}}
  function abandonRun(){if(!settingsWasRun)return;if(!abandonArmed){abandonArmed=true;ui.abandon.textContent='CONFIRM: LOSE RUN CARGO';ui.abandon.classList.add('confirm');return}returnBase(false,'EXPEDITION ABANDONED')}
  function toggleDevPanel(){let open=ui.devPanel.classList.toggle('show');ui.devButton.setAttribute('aria-expanded',String(open));devResetArmed=false;ui.devReset.textContent='HARD RESET SAVE';ui.devReset.classList.remove('confirm');syncDevTools()}
  function devFeedback(text){if(mode==='run')runNotice(text,'#f2c14f');else notice(text,'#f2c14f');sound('upgrade')}
  function devAddScrap(){if(mode==='run'){runScrap+=500;updateHud();devFeedback('+500 RUN COINS')}else{save.scrap+=500;persist();refreshBase();devFeedback('+500 BANK COINS')}}
  function devEquipSet(setId,feedback){let set=SET_BY_ID[setId];if(!set)return;for(const slot of GEAR_SLOTS){let item=SET_ITEMS.find(entry=>entry.setId===set.id&&entry.slot===slot),gear=rollGearInstance(item,Math.max(set.minLevel||1,save.level),1.08);save.gear.push(gear);save.lootFound[item.id]=(save.lootFound[item.id]||0)+1;save.equipped[slot]=gear.uid}paperDollKey='';persist();refreshBase();if(mode==='run'&&player){applyCargoEffects();player.hp=player.maxHp;updateHud()}devFeedback(feedback)}
  function devUpgradeRig(){devEquipSet('hammerChoir','RESONANT SLAM MASTERED')}
  function devEquipBlackHole(){devEquipSet('blackHole','GRAVITY WELL MASTERED')}
  function devRepair(){if(mode!=='run'||!player)return;player.hp=player.maxHp;player.shields=cargoStats().shields;updateHud();devFeedback('FULL REPAIR')}
  function devDropCache(){if(mode!=='run'||!player)return;closeSettings();spawnCache(player.x+54,player.y,true,false);runNotice('RARE CACHE DROPPED','#f2c14f')}
  function devDropLegendary(){if(mode!=='run'||!player)return;closeSettings();let gear=rollBossGear(Math.max(16,save.level),'legendary');spawnLoot(player.x+54,player.y,gear,false);runNotice('LEGENDARY BOSS GEAR SIGNAL','#f2c14f')}
  function devAddLevel(){if(save.level>=999)return;save.level++;save.xp=Math.min(save.xp,levelXpNeeded(save.level)-1);persist();refreshBase();if(mode==='run'){updateHud();pulseXpLevel()}devFeedback('PAPPA LEVEL '+save.level)}
  function devFightBoss(routeId){if(mode!=='run')startRun();else closeSettings();postBossDecision=false;postBossIntent=null;routeDecision=false;moduleDecision=false;extracting=0;bossLootChest=null;bossLootRewards=[];bossLootSelected=0;bossExtraction=false;bossDefeated=false;pendingWardenReward=null;activeCache=null;caches=[];route=routeId;if(runStats)runStats.route=routeId;ui.bossLootOverlay.classList.remove('show');ui.routeOverlay.classList.remove('show');ui.moduleOverlay.classList.remove('show');ui.extractOverlay.classList.remove('show');depth=5;elapsed=DEPTH_THRESHOLDS[4]*cyclePacing();updateRouteHud();startBoss();updateHud()}
  function devFightWarden(){devFightBoss('dynamo')}
  function devFightTyrant(){devFightBoss('furnace')}
  function devUnlockSchematic(){let id=SCHEMATIC_IDS.find(key=>schematicLevel(key)<BOSS_SCHEMATICS[key].max);if(!id)return;save.schematics[id]++;persist();refreshBase();syncDevTools();devFeedback(BOSS_SCHEMATICS[id].name.toUpperCase()+' +1')}
  function devHardReset(){if(!devResetArmed){devResetArmed=true;ui.devReset.textContent='CONFIRM: DELETE ALL PROGRESS';ui.devReset.classList.add('confirm');return}localStorage.removeItem(SAVE_KEY);window.location.reload()}
  function installPlaywrightBridge(){
    let local=/^(localhost|127\.0\.0\.1)$/.test(location.hostname),enabled=/(?:^|[?&])playwright(?:[=&]|$)/.test(location.search||'');
    if(!local||!enabled)return;
    window.__riskTest={
      openMap(mapId){
        let map=EXPEDITION_MAPS[mapId];if(!map)return false;
        save.level=Math.max(save.level,map.minLevel);save.selectedMap=mapId;save.seenIntro=true;
        startRun();paused=true;enemies=[];enemyBullets=[];hazards=[];particles=[];effects=[];
        return this.mapState()
      },
      openGuildSeed(seed){
        save.level=Math.max(1,save.level);save.selectedMap='guild';save.seenIntro=true;
        startRun(Number(seed)||1);paused=true;enemies=[];enemyBullets=[];hazards=[];particles=[];effects=[];
        return this.mapState()
      },
      openMapSeed(mapId,seed){
        let map=EXPEDITION_MAPS[mapId];if(!map)return false;
        save.level=Math.max(save.level,map.minLevel);save.selectedMap=mapId;save.seenIntro=true;
        startRun(Number(seed)||1);paused=true;enemies=[];enemyBullets=[];hazards=[];particles=[];effects=[];
        return this.mapState()
      },
      sampleSpawnAnchors(amount){
        return waveSpawnAnchors(Math.max(1,Math.min(6,Number(amount)||3))).map(point=>({x:Math.round(point.x),y:Math.round(point.y),blocked:pointBlocked(point.x,point.y,40),visible:combatViewContains(point.x,point.y,40,0),distance:Math.round(Math.hypot(point.x-player.x,point.y-player.y)),angle:Math.atan2(point.y-player.y,point.x-player.x)}))
      },
      movePlayer(x,y){
        if(mode!=='run'||!player)return null;
        let position=openArenaPosition(Number(x)||WORLD.w/2,Number(y)||WORLD.h/2,player.r);
        player.x=position.x;player.y=position.y;
        return this.mapState()
      },
      mapState(){
        return{
          map:save.selectedMap,
          player:player?{x:Math.round(player.x),y:Math.round(player.y)}:null,
          obstacles:obstacles.map(o=>({x:o.x,y:o.y,w:o.w,h:o.h,assetId:o.assetId||null})),
          decor:decor.length,
          collisionCount:collisionMap.length,
          world:{w:WORLD.w,h:WORLD.h},
          seed:currentMapSeed||null,
          procedural:!!guildTerrain,
          moduleKinds:guildTerrain?guildTerrain.modules.map(module=>module.kind):[],
          pathRows:guildTerrain?guildTerrain.pathRows.slice():[],
          routePoints:guildTerrain?guildTerrain.routePoints.map(point=>({x:Math.round(point.x),y:Math.round(point.y),col:point.col,row:point.row})):[],
          spawnZones:guildTerrain?guildTerrain.spawnZones.map(zone=>({x:Math.round(zone.x),y:Math.round(zone.y),col:zone.col,row:zone.row})):[],
          bossAnchor:guildTerrain?{x:Math.round(guildTerrain.bossAnchor.x),y:Math.round(guildTerrain.bossAnchor.y)}:null,
          bossGuideVisible:!!(guildTerrain&&bossActive&&!bossDefeated),
          validation:guildTerrain?guildTerrain.validation:null
        }
      },
      fightEnemy(type,distance,pattern){
        if(mode!=='run')startRun();
        postBossDecision=false;routeDecision=false;moduleDecision=false;paused=true;bossActive=false;bossDefeated=false;bossEntity=null;bossLootChest=null;obstacles=[];collisionMap=[];hazards=[];enemyBullets=[];enemies=[];depth=4;
        player.x=WORLD.w/2;player.y=WORLD.h/2;player.hp=player.maxHp;player.inv=0;
        let enemy=spawnEnemy(false,type);enemy.x=player.x+Math.max(90,distance||180);enemy.y=player.y;enemy.spawnGrace=0;enemy.fire=0;enemy.pattern=Math.max(0,pattern||0);enemy.think=1;
        updateEnemyEntity(enemy,1/120);
        return this.enemyMechanics()
      },
      advanceEnemy(seconds){
        let enemy=enemies.find(entry=>!entry.dead&&!entry.boss),step=1/120,remaining=Math.max(0,seconds||0);
        while(enemy&&remaining>0&&mode==='run'){let dt=Math.min(step,remaining);updateEnemyEntity(enemy,dt);remaining-=dt}
        return this.enemyMechanics()
      },
      primeEnemyAttack(pattern){
        let enemy=enemies.find(entry=>!entry.dead&&!entry.boss);if(!enemy)return null;
        enemy.charge=0;enemy.dashTime=0;enemy.recover=0;enemy.fire=0;enemy.pattern=Math.max(0,pattern||0);enemy.spawnGrace=0;updateEnemyEntity(enemy,1/120);
        return this.enemyMechanics()
      },
      enemyMechanics(){
        let enemy=enemies.find(entry=>!entry.dead&&!entry.boss);
        return enemy?{type:enemy.type,damage:Math.round(enemy.damage*1000)/1000,charge:enemy.charge,dashTime:enemy.dashTime,dashDistance:enemy.dashDistance,lockDistance:enemy.lockDistance||0,recover:enemy.recover||0,distance:Math.round(Math.hypot(player.x-enemy.x,player.y-enemy.y)),canAttack:enemyCanAttack(enemy),visible:combatViewContains(enemy.x,enemy.y,0,-Math.min(16,enemy.r*.4)),blocked:lineBlockedByCover(enemy.x,enemy.y,player.x,player.y,5),bullets:enemyBullets.length,playerHp:Math.round(player.hp*10)/10,playerInv:player.inv||0}:null
      },
      fightBoss(kind){
        if(kind==='leviathan'){save.level=Math.max(save.level,EXPEDITION_MAPS.skyglass.minLevel);save.selectedMap='skyglass'}
        else save.selectedMap='guild';
        devFightBoss(kind==='tyrant'?'furnace':'dynamo');
        return bossEntity&&bossEntity.bossKind
      },
      triggerBossPattern(stage,pattern){
        if(mode!=='run'||!bossActive||!bossEntity)return null;
        obstacles=[];collisionMap=[];bossEntity.x=Math.max(80,Math.min(WORLD.w-80,player.x+185));bossEntity.y=player.y;
        bossEntity.bossStage=Math.max(1,Math.min(3,stage||1));bossEntity.pattern=Math.max(0,pattern||0);bossEntity.stagger=0;bossEntity.spawnGrace=0;bossEntity.charge=0;bossEntity.fire=1;
        hazards=[];enemyBullets=[];
        let dx=player.x-bossEntity.x,dy=player.y-bossEntity.y,length=Math.hypot(dx,dy)||1;
        bossVolley(bossEntity,dx/length,dy/length);
        return this.bossMechanics()
      },
      bossMechanics(){
        return bossEntity?{kind:bossEntity.bossKind,stage:bossEntity.bossStage,stagger:bossEntity.stagger,canAttack:enemyCanAttack(bossEntity),visible:combatViewContains(bossEntity.x,bossEntity.y,0,-Math.min(16,bossEntity.r*.4)),blocked:lineBlockedByCover(bossEntity.x,bossEntity.y,player.x,player.y,5),spawnGrace:bossEntity.spawnGrace,distance:Math.round(Math.hypot(player.x-bossEntity.x,player.y-bossEntity.y)),hazards:hazards.map(hazard=>hazard.type),bullets:enemyBullets.length}:null
      },
      defeatChampion(){
        if(mode!=='run'||!bossActive||!bossEntity)return false;
        let champion=bossEntity;
        champion.x=Math.min(WORLD.w-70,player.x+92);
        champion.y=player.y-18;
        champion.hp=0;
        defeatBoss(champion);
        champion.dead=true;
        return !!bossLootChest
      },
      bossLootOrbPoint(){
        if(!bossLootChest)return null;
        let rect=canvas.getBoundingClientRect(),cam=camera(),point=worldToScreen(bossLootChest.x,bossLootChest.y,cam),screenX=W/2+(point.x-W/2)*cam.zoom,screenY=H/2+(point.y-H/2)*cam.zoom;
        return{x:screenX*rect.width/Math.max(1,W),y:screenY*rect.height/Math.max(1,H)}
      },
      state(){
        let decisionGear=bossLootPhase==='decision'&&bossLootRewards[bossLootSelected],decisionItem=gearDefinition(decisionGear);
        return{
          bossActive,
          bossDefeated,
          lootOrbReady:!!bossLootChest&&bossLootChest.arrival<=0&&bossLootChest.opening<=0,
          lootRevealOpening:!!bossLootChest&&bossLootChest.opened&&bossLootChest.opening>0,
          lootOverlay:ui.bossLootOverlay.classList.contains('show'),
          lootPhase:bossLootPhase,
          lootIndex:bossLootSelected,
          lootCount:bossLootRewards.length,
          lootRarity:decisionItem&&decisionItem.rarity||null,
          lootUid:decisionGear&&decisionGear.uid||null,
          materials:save.materials,
          legendaryCores:save.legendaryCores,
          equipped:Object.assign({},save.equipped),
          moduleOverlay:ui.moduleOverlay.classList.contains('show'),
          postBossIntent
        }
      },
      forceLootDecisionRarity(rarityId){
        if(bossLootPhase!=='decision'||!LOOT_BY_RARITY[rarityId]||!LOOT_BY_RARITY[rarityId].length)return false;let def=LOOT_BY_RARITY[rarityId][0],gear=rollGearInstance(def,Math.max(save.level,def.minLevel||1),1.08);bossLootRewards[bossLootSelected]=gear;renderBossLootDecision();return true
      },
      gearSignatures(){
        return Object.fromEntries(Object.entries(GEAR_SIGNATURES).map(([id,signature])=>[id,{name:signature.name,role:signature.role,unlock:signature.unlock,mastery:signature.mastery}]))
      },
      gearSetRules(){
        return Object.fromEntries(SET_DEFINITIONS.map(set=>[set.id,{tiers:setBonusTiers(set).slice(),signaturePieces:setSignaturePieces(set)}]))
      },
      gearSignatureTier(setId,count){
        return gearSignatureProfileFromCounts({[setId]:count})[setId]||0
      },
      spawnHammerstormPack(count,options){
        options=options||{};if(mode!=='run')startRun();
        postBossDecision=false;routeDecision=false;moduleDecision=false;paused=false;bossActive=false;bossDefeated=false;bossEntity=null;bossLootChest=null;activeCache=null;obstacles=[];collisionMap=[];hazards=[];enemyBullets=[];pendingStrikes=[];enemies=[];effects=[];particles=[];caches=[];lootDrops=[];ui.moduleOverlay.classList.remove('show');depth=2;
        player.x=WORLD.w/2;player.y=WORLD.h/2;player.hp=options.hurt?player.maxHp*.5:player.maxHp;player.inv=99;player.fire=99;player.spinCd=0;player.spinTime=0;player.spinLeap=0;player.spinAutoRemaining=0;player.spinAutoDuration=0;player.spinManual=false;player.spinHits=0;player.spinKills=0;player.spinCoins=0;player.spinHeal=0;player.spinLifeTargets=new Set();spinHeld=false;
        if(options.fullRiskreaver||options.fullBlackHole){
          let set=SET_BY_ID[options.fullBlackHole?'blackHole':'riskreaver'];
          for(const slot of GEAR_SLOTS){let item=SET_ITEMS.find(entry=>entry.setId===set.id&&entry.slot===slot),gear=rollGearInstance(item,Math.max(set.minLevel,save.level),1.08);save.gear.push(gear);save.equipped[slot]=gear.uid}
        }
        let amount=Math.max(1,Math.min(HORDE.maxPopulation,Math.floor(count||18))),centerX=player.x+150,centerY=player.y;
        paperDollKey='';waveDirector={number:1,phase:'active',timer:999,spawnClock:0,queue:[],anchors:[],packId:1,kills:0,startCount:amount,targetPopulation:amount,clearRewarded:false};
        for(let i=0;i<amount;i++){let angle=i/amount*Math.PI*2,radius=30+(i%4)*20,position={x:centerX+Math.cos(angle)*radius,y:centerY+Math.sin(angle)*radius},enemy=spawnEnemy(false,['rusher','rusher','lancer','brute'][i%4],{position,packId:1,packX:centerX,packY:centerY});enemy.spawnGrace=99;enemy.attack=99;enemy.fire=99;if(options.eliteEvery&&i%Math.max(1,options.eliteEvery)===0)enemy.elite=true;if(options.immuneBoss&&i===0){enemy.boss=true;enemy.bossStage=1;enemy.speed=0}if(options.fragile)enemy.hp=1;else if(options.vortexTest)enemy.hp=enemy.max=1e9;else if(options.durable)enemy.hp=enemy.max*12}
        return this.hammerstormState()
      },
      triggerHammerstorm(){
        spinHeld=true;return{started:tryHammerSpin(),state:this.hammerstormState()}
      },
      releaseHammerstorm(){
        spinHeld=false;return this.hammerstormState()
      },
      advanceHammerstorm(seconds){
        let remaining=Math.max(0,Number(seconds)||0),step=1/120;
        while(remaining>0&&mode==='run'){let dt=Math.min(step,remaining);if(hitStop>0)hitStop=Math.max(0,hitStop-dt);else update(dt);remaining-=dt}
        return this.hammerstormState()
      },
      setMovementInput(x,y){
        x=Number(x)||0;y=Number(y)||0;let length=Math.hypot(x,y),scale=length>1?1/length:1;stick.active=true;stick.x=x*scale;stick.y=y*scale;return this.hammerstormState()
      },
      clearMovementInput(){
        stick.active=false;stick.x=stick.y=0;return this.hammerstormState()
      },
      hammerstormState(){
        let living=enemies.filter(enemy=>!enemy.dead),launched=effects.filter(effect=>effect.kind==='enemyLaunch').length,stats=cargoStats();
        let blackHole=usesBlackHoleStorm(stats),active=player.spinTime>0||player.spinLeap>0;
        return{living:living.length,player:{x:Math.round(player.x),y:Math.round(player.y),hp:Math.round(player.hp*100)/100,maxHp:player.maxHp,dashTime:Math.round(player.dashTime*1000)/1000},spin:{cd:0,time:Math.round(player.spinTime*100)/100,leap:Math.round(player.spinLeap*100)/100,autoRemaining:Math.round((player.spinAutoRemaining||0)*1000)/1000,manual:!!player.spinManual,hits:player.spinHits,kills:player.spinKills,heal:Math.round(player.spinHeal*100)/100,pack:player.spinPack,damage:Math.round(stats.spinDamage*100)/100,radius:Math.round(stats.spinRadius),held:spinHeld,visual:blackHole?'blackHole':'hammerstorm',phase:blackHole&&active?blackHoleStormPhase():null,vortex:{x:Math.round(player.spinVortexX||player.x),y:Math.round(player.spinVortexY||player.y),pulling:living.filter(enemy=>(enemy.vortexInfluence||0)>.02).length,orbiting:living.filter(enemy=>enemy.vortexOrbiting).length}},playerProjectiles:0,launched,knocked:living.filter(enemy=>enemy.knockTime>0).length,enemyDistances:living.slice(0,12).map(enemy=>Math.round(Math.hypot(enemy.x-player.x,enemy.y-player.y))),enemyVortex:living.slice(0,60).map(enemy=>({boss:!!enemy.boss,elite:!!enemy.elite,distance:Math.round(Math.hypot(enemy.x-player.x,enemy.y-player.y)),influence:Math.round((enemy.vortexInfluence||0)*100)/100,orbiting:!!enemy.vortexOrbiting})),hitStop:Math.round(hitStop*1000)/1000,effects:effects.map(effect=>effect.kind||'ring'),gravityMotes:particles.filter(particle=>particle.kind==='gravityMote').length,blackHoleSheets:Object.fromEntries(Object.entries(blackHoleVfxSprites).map(([phase,image])=>[phase,imageReady(image)]))}
      },
      dashDuringHammerstorm(x,y){
        if(!player)return{started:false,state:null};let length=Math.hypot(Number(x)||0,Number(y)||0)||1;player.lastX=(Number(x)||0)/length;player.lastY=(Number(y)||0)/length;player.dashCd=0;let started=tryDash();return{started,state:this.hammerstormState()}
      },
      hammerstormHelpState(){
        return{seen:!!save.settings.hammerstormHelpSeen,visible:ui.helpTooltip.classList.contains('show'),title:ui.helpTooltipTitle.textContent}
      },
      spawnMeleeTarget(distance){
        this.spawnHammerstormPack(1,{durable:true});spinHeld=false;let enemy=enemies[0];enemy.x=player.x+Math.max(20,Number(distance)||20);enemy.y=player.y;enemy.hp=enemy.max=10000;enemy.speed=0;enemy.attack=99;enemy.fire=99;player.fire=0;return this.meleeState()
      },
      advanceMelee(seconds){
        let remaining=Math.max(0,Number(seconds)||0),step=1/120;while(remaining>0&&mode==='run'){let dt=Math.min(step,remaining);if(hitStop>0)hitStop=Math.max(0,hitStop-dt);else update(dt);remaining-=dt}return this.meleeState()
      },
      meleeState(){
        let enemy=enemies.find(entry=>!entry.dead);return{enemyHp:enemy?Math.round(enemy.hp*100)/100:0,enemyMax:enemy?enemy.max:0,projectiles:0,pending:pendingStrikes.length,effects:effects.map(effect=>effect.kind||'ring')}
      },
      shockwaveProbe(mode){
        if(!DISPLACEMENT[mode])return null;this.spawnHammerstormPack(1,{durable:true});let enemy=enemies[0],beforeHp=enemy.hp;enemy.x=player.x+100;enemy.y=player.y;enemy.knockVx=enemy.knockVy=enemy.knockTime=0;effects=[];physicalShockwave(player.x,player.y,150,1,'#d6aa58',0,{mode});return{mode,velocityX:Math.round(enemy.knockVx*100)/100,velocityY:Math.round(enemy.knockVy*100)/100,duration:enemy.knockTime,damaged:enemy.hp<beforeHp,effects:effects.map(effect=>effect.kind||'ring')}
      },
      blackHoleProbe(){
        this.spawnHammerstormPack(18,{durable:true});paused=true;
        let x=player.x+150,y=player.y,hits=triggerGravityWell(x,y,shotDamage(),2),vfx=effects.find(effect=>effect.kind==='blackHoleVfx');
        if(vfx)vfx.life=vfx.max*.48;
        let pulled=enemies.filter(enemy=>{let dx=enemy.x-x,dy=enemy.y-y;return dx*enemy.knockVx+dy*enemy.knockVy<0}).length;
        return{hits,pulled,enemies:enemies.length,effects:effects.map(effect=>effect.kind||'ring'),setId:equippedFullSetId()}
      },
      displacementModes(){
        return Object.keys(DISPLACEMENT)
      },
      startHordeWave(number){
        if(mode!=='run')startRun();postBossDecision=false;routeDecision=false;moduleDecision=false;paused=true;bossActive=false;bossDefeated=false;bossEntity=null;bossLootChest=null;obstacles=[];collisionMap=[];hazards=[];enemyBullets=[];pendingStrikes=[];enemies=[];effects=[];particles=[];caches=[];depth=1;player.x=WORLD.w/2;player.y=WORLD.h/2;player.hp=player.maxHp;player.inv=99;player.fire=99;
        resetWaveDirector(0);waveDirector.number=Math.max(0,Math.floor(number||1)-1);prepareNextWave();let guard=0;while(waveDirector.phase==='spawning'&&guard++<1000)updateWaveDirector(1/60);return this.hordeState()
      },
      cullHordeTo(amount){
        let keep=Math.max(0,Math.floor(amount||0)),living=livingRegularEnemies();for(let index=keep;index<living.length;index++){living[index].dead=true;waveDirector.kills++}enemies=enemies.filter(enemy=>!enemy.dead);updateWaveDirector(1/60);let guard=0;while(waveDirector.phase==='spawning'&&guard++<1000)updateWaveDirector(1/60);return this.hordeState()
      },
      hordeState(){
        let living=livingRegularEnemies(),types={};for(const enemy of living)types[enemy.type]=(types[enemy.type]||0)+1;return{living:living.length,number:waveDirector.number,phase:waveDirector.phase,target:waveDirector.targetPopulation,queued:waveDirector.queue.length,kills:waveDirector.kills,types}
      },
      previewGearSet(setId){
        let set=SET_BY_ID[setId];if(!set)return null;
        for(const slot of GEAR_SLOTS){
          let item=SET_ITEMS.find(entry=>entry.setId===setId&&entry.slot===slot),gear=rollGearInstance(item,Math.max(set.minLevel,save.level),1.08);
          save.gear.push(gear);save.equipped[slot]=gear.uid
        }
        paperDollKey='';refreshPaperDoll();refreshBase();openGearLocker();setGearView('loadout');renderGearLocker();
        return this.gearVisualState()
      },
      previewGearRarity(rarityId){
        let pool=LOOT_BY_RARITY[rarityId]||[];if(!pool.length)return null;
        for(const slot of GEAR_SLOTS)save.equipped[slot]=null;
        for(const slot of GEAR_SLOTS){
          let item=pool.find(entry=>entry.slot===slot);if(!item)continue;
          let gear=rollGearInstance(item,Math.max(item.minLevel||1,save.level),1.08);save.gear.push(gear);save.equipped[slot]=gear.uid
        }
        paperDollKey='';refreshPaperDoll();refreshBase();openGearLocker();setGearView('loadout');renderGearLocker();
        return this.gearVisualState()
      },
      gearVisualState(includePreview){
        let setId=equippedFullSetId(),set=setId&&SET_BY_ID[setId],profile=equippedRarityProfile();
        return{setId,rarity:set&&set.rarity||profile.name.toLowerCase(),paperDollKey,usesProductionSkin:paperDollSetReady(setId),visualProfile:setId&&SET_VISUAL_PROFILES[setId]?setId:null,layers:PAPER_DOLL_RENDER_LAYERS.map(layer=>Object.assign({},layer)),atlases:Object.fromEntries(PAPER_DOLL_POSES.map(pose=>[pose,paperDollAtlasReport(pose,!!includePreview)]))}
      },
      gearSetCatalog(){
        return SET_DEFINITIONS.map(set=>({id:set.id,name:set.name,rarity:set.rarity,minLevel:set.minLevel}))
      },
      equipmentInventory(){
        return save.gear.map(gear=>{let item=gearDefinition(gear);return{uid:gear.uid,itemId:gear.itemId,name:item&&item.name,slot:item&&item.slot,rarity:item&&item.rarity,equipped:gearIsEquipped(gear),power:Math.round(gearScore(gear)*10)/10}})
      },
      equipmentState(){
        return{equipped:Object.assign({},save.equipped),selectedGearUid,gearFilter,gearRarityFilter,gearSort,previewing:ui.gearCharacterStage.classList.contains('gearPreviewing'),unified:ui.gearPanel.classList.contains('adventureBagPanel')&&!ui.gearPanel.classList.contains('loadoutMode')}
      },
      equipmentRenderMetrics(){
        return Object.assign({},gearPerf)
      },
      resetEquipmentRenderMetrics(){
        for(const key of Object.keys(gearPerf))gearPerf[key]=0;
        return this.equipmentRenderMetrics()
      },
      triggerDash(){
        if(mode!=='run')startRun();
        paused=false;postBossDecision=false;routeDecision=false;moduleDecision=false;
        player.dashCd=0;
        tryDash();
        return this.combatPerformanceState()
      },
      combatPerformanceState(){
        return{mode,dashTime:player?player.dashTime:0,particles:particles.length,particlePool:particlePool.length,effects:effects.length,enemies:enemies.length}
      },
      gearVisualCoverage(){
        let missing=LOOT_ITEMS.filter(item=>item.setId?!SET_VISUAL_PROFILES[item.setId]:!FIELD_VISUAL_PROFILES.length).map(item=>item.id);
        return{items:LOOT_ITEMS.length,setItems:SET_ITEMS.length,legacyItems:LEGACY_LOOT_ITEMS.length,sets:SET_DEFINITIONS.length,profiles:Object.keys(SET_VISUAL_PROFILES).length,missing,usesStripePattern:/drawPaperDollPattern|drawPaperDollGeometry/.test(String(composePaperDollPose)),usesLegacyGearOverlay:/drawPappaGearBack|drawPappaGearFront/.test(String(drawPappaHammer))}
      },
      gearMaskBounds(pose,frame){
        if(!PAPER_DOLL_POSES.includes(pose)||frame<0||frame>7)return null;
        return Object.fromEntries(GEAR_SLOTS.map(slot=>[slot,paperDollMaskFrame(pose,slot,frame).bounds]))
      }
    }
  }

  function gearDragSource(target){let element=target&&target.closest&&target.closest('.gearBagSlot[data-item],.gearLoadoutSlot[data-item]');if(!element||!ui.gearPanel.contains(element))return null;return {element,uid:element.dataset.item,fromLoadout:element.classList.contains('gearLoadoutSlot')}}
  function gearDropTarget(target){return target&&target.closest&&target.closest('.gearLoadoutSlot[data-slot],.equipmentDropStage,.equipmentInventoryDrop')}
  function gearDropAllowed(target,gear,source){
    let item=gearDefinition(gear);if(!target||!item)return false;
    if(target.classList.contains('gearLoadoutSlot'))return target.dataset.slot===item.slot;
    if(target.classList.contains('equipmentDropStage'))return true;
    return target.classList.contains('equipmentInventoryDrop')&&source&&source.fromLoadout&&gearIsEquipped(gear)
  }
  function clearGearDropState(){
    document.querySelectorAll('.gearLoadoutSlot.compatible,.equipmentDropStage.compatible,.dropHover').forEach(element=>element.classList.remove('compatible','dropHover'));
    if(gearDragState&&gearDragState.ghost)gearDragState.ghost.remove();if(gearDragState&&gearDragState.source)gearDragState.source.element.classList.remove('dragging')
  }
  function showGearDropTargets(gear){
    let item=gearDefinition(gear);if(!item)return;ui.gearCharacterStage.classList.add('compatible');ui.gearLoadoutSlots.querySelectorAll('.gearLoadoutSlot[data-slot="'+item.slot+'"]').forEach(slot=>slot.classList.add('compatible'))
  }
  function performGearDrop(target,uid,source){
    let gear=save.gear.find(entry=>entry.uid===uid),item=gearDefinition(gear);if(!gearDropAllowed(target,gear,source))return false;
    if(target.classList.contains('equipmentInventoryDrop'))return unequipGearSlot(item.slot);
    if(save.equipped[item.slot]===uid)return true;
    equipGear(uid);return true
  }
  function createGearDragGhost(gear,x,y){
    let item=gearDefinition(gear),rarity=item&&LOOT_RARITIES[item.rarity],ghost=document.createElement('div');ghost.className='gearDragGhost';ghost.style.left=x+'px';ghost.style.top=y+'px';ghost.style.setProperty('--gear-color',rarity?rarity.color:'#d6aa58');ghost.innerHTML=gearArtMarkup(gear,'small');document.body.appendChild(ghost);return ghost
  }
  ui.gearPanel.addEventListener('dragstart',event=>{
    let source=gearDragSource(event.target),gear=source&&save.gear.find(entry=>entry.uid===source.uid);if(!source||!gear){event.preventDefault();return}
    gearDragState={source,uid:source.uid,ghost:null,native:true};source.element.classList.add('dragging');showGearDropTargets(gear);event.dataTransfer.effectAllowed='move';event.dataTransfer.setData('text/plain',source.uid)
  });
  ui.gearPanel.addEventListener('dragover',event=>{if(!gearDragState)return;let target=gearDropTarget(event.target),gear=save.gear.find(entry=>entry.uid===gearDragState.uid);document.querySelectorAll('.dropHover').forEach(element=>element.classList.remove('dropHover'));if(gearDropAllowed(target,gear,gearDragState.source)){event.preventDefault();event.dataTransfer.dropEffect='move';target.classList.add('dropHover')}});
  ui.gearPanel.addEventListener('drop',event=>{if(!gearDragState)return;let target=gearDropTarget(event.target);if(performGearDrop(target,gearDragState.uid,gearDragState.source)){event.preventDefault();suppressGearClickUntil=performance.now()+350}clearGearDropState();gearDragState=null});
  ui.gearPanel.addEventListener('dragend',()=>{clearGearDropState();gearDragState=null});
  ui.gearPanel.addEventListener('pointerdown',event=>{
    gearPointerType=event.pointerType||'mouse';if(event.pointerType==='touch'||mobileArmory())return;let source=gearDragSource(event.target);if(!source||event.button&&event.button!==0)return;
    gearDragState={source,uid:source.uid,id:event.pointerId,startX:event.clientX,startY:event.clientY,x:event.clientX,y:event.clientY,active:false,ghost:null,native:false}
  },true);
  ui.gearPanel.addEventListener('pointermove',event=>{
    if(!gearDragState||gearDragState.native||gearDragState.id!==event.pointerId)return;gearDragState.x=event.clientX;gearDragState.y=event.clientY;
    if(!gearDragState.active&&Math.hypot(event.clientX-gearDragState.startX,event.clientY-gearDragState.startY)>9){let gear=save.gear.find(entry=>entry.uid===gearDragState.uid);gearDragState.active=true;gearDragState.source.element.classList.add('dragging');gearDragState.ghost=createGearDragGhost(gear,event.clientX,event.clientY);showGearDropTargets(gear)}
    if(!gearDragState.active)return;event.preventDefault();gearDragState.ghost.style.left=event.clientX+'px';gearDragState.ghost.style.top=event.clientY+'px';let target=gearDropTarget(document.elementFromPoint(event.clientX,event.clientY)),gear=save.gear.find(entry=>entry.uid===gearDragState.uid);document.querySelectorAll('.dropHover').forEach(element=>element.classList.remove('dropHover'));if(gearDropAllowed(target,gear,gearDragState.source))target.classList.add('dropHover')
  },true);
  function endGearPointerDrag(event){
    if(!gearDragState||gearDragState.native||gearDragState.id!==event.pointerId)return;let state=gearDragState;
    if(state.active){let target=gearDropTarget(document.elementFromPoint(event.clientX,event.clientY));performGearDrop(target,state.uid,state.source);suppressGearClickUntil=performance.now()+420;event.preventDefault();event.stopPropagation()}
    clearGearDropState();gearDragState=null
  }
  ui.gearPanel.addEventListener('pointerup',endGearPointerDrag,true);ui.gearPanel.addEventListener('pointercancel',endGearPointerDrag,true);

  function gearEntryFromEvent(event){let entry=event.target.closest&&event.target.closest('.gearBagSlot[data-item]');return entry&&ui.gearGrid.contains(entry)?entry:null}
  ui.gearGrid.addEventListener('pointerdown',()=>hideGearHover(),true);
  ui.gearGrid.addEventListener('pointerover',event=>{let entry=gearEntryFromEvent(event);if(!entry||entry.contains(event.relatedTarget))return;let gear=save.gear.find(item=>item.uid===entry.dataset.item);if(!gear)return;entry.removeAttribute('title');entry.setAttribute('aria-describedby','gearHoverPreview');showGearHover(gear,entry,event)});
  ui.gearGrid.addEventListener('pointermove',event=>{let entry=gearEntryFromEvent(event);if(entry&&hoverGearUid===entry.dataset.item&&event.pointerType!=='touch')positionGearHover(entry,event)});
  ui.gearGrid.addEventListener('pointerout',event=>{let entry=gearEntryFromEvent(event);if(entry&&!entry.contains(event.relatedTarget))hideGearHover(entry.dataset.item)});
  ui.gearGrid.addEventListener('focusin',event=>{let entry=gearEntryFromEvent(event),gear=entry&&save.gear.find(item=>item.uid===entry.dataset.item);if(gear){entry.removeAttribute('title');entry.setAttribute('aria-describedby','gearHoverPreview');showGearHover(gear,entry)}});
  ui.gearGrid.addEventListener('focusout',event=>{let entry=gearEntryFromEvent(event);if(entry)hideGearHover(entry.dataset.item)});
  function loadoutGearFromEvent(event){let button=event.target.closest&&event.target.closest('.gearLoadoutSlot'),gear=button?equippedGear(button.dataset.slot):null;return {button,gear}}
  ui.gearLoadoutSlots.addEventListener('pointerover',event=>{let {button,gear}=loadoutGearFromEvent(event);if(button&&gear&&!button.contains(event.relatedTarget))showGearHover(gear,button,event)});
  ui.gearLoadoutSlots.addEventListener('pointermove',event=>{let {button,gear}=loadoutGearFromEvent(event);if(button&&gear&&hoverGearUid===gear.uid&&event.pointerType!=='touch')positionGearHover(button,event)});
  ui.gearLoadoutSlots.addEventListener('pointerout',event=>{let {button,gear}=loadoutGearFromEvent(event);if(button&&gear&&!button.contains(event.relatedTarget))hideGearHover(gear.uid)});
  ui.gearLoadoutSlots.addEventListener('focusin',event=>{let {button,gear}=loadoutGearFromEvent(event);if(button&&gear)showGearHover(gear,button)});
  ui.gearLoadoutSlots.addEventListener('focusout',event=>{let {gear}=loadoutGearFromEvent(event);if(gear)hideGearHover(gear.uid)});

  ui.start.addEventListener('click',requestStart);ui.contractTracker.addEventListener('click',openGrandVault);ui.closeMaps.addEventListener('click',closeMapAtlas);ui.briefingStart.addEventListener('click',completeBriefing);ui.gearLockerButton.addEventListener('click',()=>openGearLocker());ui.closeGear.addEventListener('click',closeGearLocker);ui.gearSortButton.addEventListener('click',cycleGearSort);ui.sellFilteredGear.addEventListener('click',sellFilteredGear);ui.mobileGearEquip.addEventListener('click',()=>{let gear=selectedGear();if(gear)equipGear(gear.uid)});ui.mobileGearSort.addEventListener('click',()=>openGearMobileSheet('sort'));ui.mobileGearFilter.addEventListener('click',()=>openGearMobileSheet('filter'));ui.gearMobileSheetShade.addEventListener('click',closeGearMobileSheet);ui.closeGearMobileSheet.addEventListener('click',closeGearMobileSheet);ui.gearTurnLeft.addEventListener('click',()=>turnGear(-45));ui.gearTurnRight.addEventListener('click',()=>turnGear(45));ui.gearCharacterStage.addEventListener('pointerdown',e=>{if(e.target.closest&&e.target.closest('.gearLoadoutSlot'))return;e.preventDefault();gearTurnDrag={id:e.pointerId,x:e.clientX,angle:gearTurnAngle};ui.gearCharacterStage.setPointerCapture&&ui.gearCharacterStage.setPointerCapture(e.pointerId);ui.gearCharacterStage.classList.add('turning')});ui.gearCharacterStage.addEventListener('pointermove',e=>{if(!gearTurnDrag||e.pointerId!==gearTurnDrag.id)return;gearTurnAngle=gearTurnDrag.angle+(e.clientX-gearTurnDrag.x)*.72;updateGearTurntable()});function endGearTurn(e){if(!gearTurnDrag||e.pointerId!==gearTurnDrag.id)return;gearTurnDrag=null;ui.gearCharacterStage.classList.remove('turning')}ui.gearCharacterStage.addEventListener('pointerup',endGearTurn);ui.gearCharacterStage.addEventListener('pointercancel',endGearTurn);ui.blueprintButton.addEventListener('click',openBlueprints);ui.closeBlueprints.addEventListener('click',closeBlueprints);ui.closeResult.addEventListener('click',closeResultPanel);ui.closeContract.addEventListener('click',claimContract);
  canvas.addEventListener('pointerup',event=>{if(tryOpenBossLootAt(event)){event.preventDefault();event.stopPropagation()}},{passive:false});
  ui.extract.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();beginExtract()});ui.cancelExtract.addEventListener('click',cancelExtract);ui.bossLootEquip.addEventListener('click',()=>resolveBossLoot('equip'));ui.bossLootSalvage.addEventListener('click',()=>resolveBossLoot('salvage'));ui.bossLootExtract.addEventListener('click',()=>chooseBossOutcome('extract'));ui.bossLootPush.addEventListener('click',()=>chooseBossOutcome('deeper'));ui.routeFurnace.addEventListener('click',()=>chooseRoute('furnace'));ui.routeDynamo.addEventListener('click',()=>chooseRoute('dynamo'));ui.moduleSkip.addEventListener('click',skipModule);
  ui.spin.addEventListener('pointerdown',e=>{e.preventDefault();e.stopPropagation();spinHeld=true;tryHammerSpin();if(ui.spin.setPointerCapture)try{ui.spin.setPointerCapture(e.pointerId)}catch(error){}});function releaseSpin(){spinHeld=false}ui.spin.addEventListener('pointerup',releaseSpin);ui.spin.addEventListener('pointercancel',releaseSpin);ui.spin.addEventListener('lostpointercapture',releaseSpin);ui.dash.addEventListener('pointerdown',e=>{e.preventDefault();tryDash()});
  ui.settingsButton.addEventListener('click',openSettings);ui.closeSettings.addEventListener('click',closeSettings);ui.resume.addEventListener('click',closeSettings);ui.soundToggle.addEventListener('click',()=>toggleSetting('sound'));ui.shakeToggle.addEventListener('click',()=>toggleSetting('shake'));ui.particlesToggle.addEventListener('click',()=>toggleSetting('particles'));ui.abandon.addEventListener('click',abandonRun);ui.devButton.addEventListener('click',toggleDevPanel);ui.devScrap.addEventListener('click',devAddScrap);ui.devRig.addEventListener('click',devUpgradeRig);ui.devBlackHole.addEventListener('click',devEquipBlackHole);ui.devHeal.addEventListener('click',devRepair);ui.devCache.addEventListener('click',devDropCache);ui.devLoot.addEventListener('click',devDropLegendary);ui.devLevel.addEventListener('click',devAddLevel);ui.devWarden.addEventListener('click',devFightWarden);ui.devTyrant.addEventListener('click',devFightTyrant);ui.devSchematic.addEventListener('click',devUnlockSchematic);ui.devReset.addEventListener('click',devHardReset);
  window.addEventListener('keydown',e=>{keys[e.code]=true;if(e.code==='Space'&&!e.repeat)tryDash();if((e.code==='KeyQ'||e.code==='KeyF')&&!e.repeat){spinHeld=true;tryHammerSpin()}if(e.code==='KeyE'&&!e.repeat)beginExtract();if(e.code==='Escape'&&!e.repeat){if(ui.settingsOverlay.classList.contains('show'))closeSettings();else if(ui.mapOverlay.classList.contains('show'))closeMapAtlas();else if(ui.gearOverlay.classList.contains('show'))closeGearLocker();else if(ui.blueprintOverlay.classList.contains('show'))closeBlueprints();else if(ui.resultOverlay.classList.contains('show'))closeResultPanel();else if(!ui.contractOverlay.classList.contains('show'))openSettings()}if(['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space'].includes(e.code))e.preventDefault()});window.addEventListener('keyup',e=>{keys[e.code]=false;if(e.code==='KeyQ'||e.code==='KeyF')spinHeld=false});window.addEventListener('resize',resize);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&mode==='run'&&!paused)openSettings()});
  function stickMove(e){let r=ui.joystick.getBoundingClientRect(),x=e.clientX-(r.left+r.width/2),y=e.clientY-(r.top+r.height/2),m=r.width*.34,l=Math.hypot(x,y)||1,cl=Math.min(m,l);stick.x=x/l*(cl/m);stick.y=y/l*(cl/m);ui.knob.style.transform='translate('+(stick.x*m)+'px,'+(stick.y*m)+'px)'}
  ui.joystick.addEventListener('pointerdown',e=>{stick.active=true;stick.id=e.pointerId;ui.joystick.setPointerCapture(e.pointerId);stickMove(e)});ui.joystick.addEventListener('pointermove',e=>{if(stick.active&&e.pointerId===stick.id)stickMove(e)});function stickEnd(e){if(e.pointerId!==stick.id)return;stick.active=false;stick.x=stick.y=0;ui.knob.style.transform=''}ui.joystick.addEventListener('pointerup',stickEnd);ui.joystick.addEventListener('pointercancel',stickEnd);
  let lastTouchEnd=0,lastTouchTarget=null;document.addEventListener('touchend',e=>{let now=Date.now(),button=e.target.closest&&e.target.closest('button');if(now-lastTouchEnd<340&&e.target===lastTouchTarget){e.preventDefault();if(button&&!button.disabled)button.click()}lastTouchEnd=now;lastTouchTarget=e.target},{passive:false});for(const event of ['gesturestart','gesturechange','gestureend','dblclick'])document.addEventListener(event,e=>e.preventDefault(),{passive:false});document.addEventListener('contextmenu',e=>e.preventDefault());

  for(const pose of PAPER_DOLL_POSES){pappaHammerSprites[pose].addEventListener('load',refreshPaperDoll);for(const slot of GEAR_SLOTS)paperDollMasks[pose][slot].addEventListener('load',refreshPaperDoll);for(const setId of Object.keys(paperDollSetSprites))paperDollSetSprites[setId][pose].addEventListener('load',refreshPaperDoll)}
  installPlaywrightBridge();bindContextHelp();persist();refreshBase();updateCargoHud();syncSettings();setView('base');requestAnimationFrame(loop);
})();
