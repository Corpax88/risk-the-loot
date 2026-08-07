const fs=require('fs'),vm=require('vm'),assert=require('assert');

class Classes{
  constructor(){this.s=new Set()}
  add(...names){names.forEach(name=>this.s.add(name))}
  remove(...names){names.forEach(name=>this.s.delete(name))}
  toggle(name,value){if(value===undefined)value=!this.s.has(name);value?this.s.add(name):this.s.delete(name);return value}
  contains(name){return this.s.has(name)}
}

class Element{
  constructor(id){this.id=id;this.className='';this.classList=new Classes();this.style={setProperty(key,value){this[key]=value}};this.listeners={};this.children=[];this.dataset={};this.disabled=false;this.history=[];this.textContent='';this._html='';this.attributes={};this.isConnected=true;this.offsetWidth=116}
  set textContent(value){this._text=String(value);if(this.history)this.history.push(this._text)}
  get textContent(){return this._text}
  set innerHTML(value){this._html=value;if(value==='')this.children=[]}
  get innerHTML(){return this._html}
  addEventListener(name,fn){(this.listeners[name]||(this.listeners[name]=[])).push(fn)}
  appendChild(element){this.children.push(element);return element}
  append(...elements){elements.forEach(element=>this.appendChild(element))}
  setAttribute(key,value){this.attributes[key]=value}
  removeAttribute(key){delete this.attributes[key]}
  querySelector(selector){if(selector==='b'||selector==='span')return this['_'+selector]||(this['_'+selector]=new Element(selector));return null}
  querySelectorAll(){return []}
  getBoundingClientRect(){return {left:0,top:0,width:960,height:540}}
  setPointerCapture(){}
  hasPointerCapture(){return false}
  releasePointerCapture(){}
  closest(){return null}
  contains(element){return this===element||this.children.includes(element)}
  remove(){this.isConnected=false}
  click(){if(this.disabled)return;for(const fn of this.listeners.click||[])fn({preventDefault(){},stopPropagation(){},target:this})}
  getContext(){return context2d}
}

const gradient={addColorStop(){}};
const context2d=new Proxy({createLinearGradient(){return gradient},createRadialGradient(){return gradient},setTransform(){}},{get(object,key){return key in object?object[key]:(()=>{})},set(object,key,value){object[key]=value;return true}});
const html=fs.readFileSync('index.html','utf8'),elements={};
for(const match of html.matchAll(/id="([^"]+)"/g))elements[match[1]]=new Element(match[1]);
for(let index=0;index<5;index++)elements.routeTicks.appendChild(new Element('tick'+index));

const scene=new Element('scene'),resultPanel=new Element('resultPanel'),settingsPanel=new Element('settingsPanel'),documentListeners={},windowListeners={},raf=[];
const document={
  hidden:false,
  body:new Element('body'),
  getElementById:id=>elements[id]||(elements[id]=new Element(id)),
  querySelector:selector=>selector==='.workshopScene'?scene:selector==='.resultPanel'?resultPanel:selector==='.settingsPanel'?settingsPanel:new Element(selector),
  querySelectorAll:()=>[],
  createElement:tag=>new Element(tag),
  elementFromPoint:()=>null,
  addEventListener:(name,fn)=>{(documentListeners[name]||(documentListeners[name]=[])).push(fn)}
};

let saved=JSON.stringify({
  version:14,
  scrap:987654,
  materials:88,
  level:70,
  xp:900,
  gear:[{uid:'old-hat',itemId:'stormrunner-hat',level:70,quality:1,stats:{hp:99}}],
  equipped:{hat:'old-hat'}
});
let clock=0,seed=1337;
const seededMath=Object.create(Math);
seededMath.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const sandbox={
  console,
  document,
  location:{hostname:'localhost',search:'?playwright'},
  localStorage:{getItem:()=>saved,setItem:(key,value)=>{saved=value}},
  performance:{now:()=>clock},
  requestAnimationFrame:fn=>{raf.push(fn)},
  setTimeout:fn=>{fn();return 1},
  clearTimeout(){},
  Math:seededMath,
  Date,
  JSON,
  window:null,
  RiskLootProgression:require('../progression.js')
};
sandbox.window=sandbox;
sandbox.window.devicePixelRatio=1;
sandbox.window.addEventListener=(name,fn)=>{(windowListeners[name]||(windowListeners[name]=[])).push(fn)};

const bridge=`window.__foundationSmoke={
  saveRef:save,
  saveVersion:SAVE_VERSION,
  activeGear:LOOT_ITEMS.length,
  activeSets:ACTIVE_SET_DEFINITIONS.length,
  archivedGear:ARCHIVED_GEAR_ITEMS.length,
  atlasCount:Object.keys(productionGearAtlases).length,
  gearSlots:GEAR_SLOTS.slice(),
  baseAsset:pappaHammerImage.src,
  foundation:PAPPA_V1_FOUNDATION,
  rollBossGear,
  rollVaultGear,
  renderDevGearOptions,
  openGrandVault,
  claimContract
};})();`;
const gameSource=fs.readFileSync('script.js','utf8').replace(/\}\)\(\);\s*$/,bridge);
vm.createContext(sandbox);
vm.runInContext(gameSource,sandbox);

const test=sandbox.__foundationSmoke;
let current=JSON.parse(saved);
assert.equal(test.saveVersion,16,'mobile master save schema is not active');
assert.equal(current.version,16,'incompatible development save was not reset');
assert.equal(current.scrap,0,'legacy currency survived the intentional reset');
assert.equal(current.materials,0,'legacy materials survived the intentional reset');
assert.equal(current.level,1,'legacy progression survived the intentional reset');
assert.deepEqual(current.gear,[],'legacy gear survived the intentional reset');
assert.equal(Object.keys(current.equipped).length,10,'canonical equipment slots were not initialized');
assert(Object.values(current.equipped).every(value=>value===null),'fresh equipment is not empty');

assert.equal(test.foundation.active,true,'Pappa V1 foundation flag is not active');
assert.equal(test.activeGear,7,'Stormcaller proof does not expose all seven modular layers');
assert.equal(test.activeSets,1,'Stormcaller proof set is not the only active set');
assert(test.archivedGear>0,'retired catalog was not retained as source history');
assert.equal(test.atlasCount,7,'Stormcaller proof does not load exactly seven direct production layers');
assert.equal(test.rollBossGear(1,'rare'),null,'bosses can still roll retired gear');
assert.equal(test.rollVaultGear(),null,'Grand Vault can still roll retired gear');
assert(test.baseAsset.includes('pappa-hammer-player-mobile-v1.png?v=20260807-mobile-master-v1'),'approved mobile master is not the runtime source');
assert.deepEqual(Array.from(test.gearSlots),['hat','cape','chest','legs','boots','scarf','weapon','necklace','ring1','ring2'],'equipment foundation slots changed');

elements.gearLockerButton.click();
assert(elements.gearOverlay.classList.contains('show'),'Adventure Bag did not open');
assert.equal(elements.gearGrid.children.length,0,'retired gear rendered in the inventory');
assert(elements.gearEmpty.classList.contains('show'),'clean-foundation empty state is hidden');
assert.equal(elements.gearLoadoutSlots.children.length,10,'empty loadout did not render all slots');
elements.closeGear.click();
assert(!elements.gearOverlay.classList.contains('show'),'Adventure Bag did not close');

test.renderDevGearOptions();
assert(!elements.devGearSpawn.disabled&&!elements.devGearEquip.disabled,'Stormcaller proof cannot be granted by dev tools');
assert(elements.devGearSelect.children.some(group=>group.children.some(option=>option.textContent.includes('STORMCALLER'))),'Stormcaller proof is missing from the dev gear selector');

test.saveRef.cores=3;
Object.values(test.saveRef.blueprints)[0].copies=12;
const materialsBefore=test.saveRef.materials;
test.openGrandVault();
assert(elements.contractOverlay.classList.contains('show'),'Grand Vault did not open');
assert(elements.vaultReward.innerHTML.includes('FORGE MATERIAL'),'Grand Vault did not switch to the foundation material reward');
test.claimContract();
assert(test.saveRef.materials>materialsBefore,'Grand Vault material reward was not claimed');

elements.startButton.click();
assert(elements.mapOverlay.classList.contains('show'),'Adventure Atlas did not open');
assert.equal(elements.mapGrid.children.length,5,'preserved map progression did not render');

console.log('Release smoke passed: V1 reset -> approved base -> Stormcaller proof -> material bridge -> playable map flow');
