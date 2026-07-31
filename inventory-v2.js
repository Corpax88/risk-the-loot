(function(){
  'use strict';

  const bridge=window.RiskLootInventoryV2Bridge;
  if(!bridge)return;

  const state={open:false,selectedUid:null,tapUid:null,slot:'all',rarity:'all',sort:'power',snapshot:null};
  const sortNames={power:'POWER',rarity:'RARITY',newest:'NEWEST',name:'NAME'};
  const compareFormat=(value,type)=>type==='percent'?(Math.round(value*1000)/10)+'%':String(Math.round(value*10)/10);

  const launcher=document.createElement('button');
  launcher.id='inventoryV2Button';
  launcher.className='inventoryV2Launcher';
  launcher.type='button';
  launcher.innerHTML='<small>EXPERIMENTAL</small><b>INVENTORY V2</b>';
  launcher.setAttribute('aria-label','Open experimental Inventory V2');
  document.getElementById('baseView').appendChild(launcher);

  const overlay=document.createElement('section');
  overlay.id='inventoryV2Overlay';
  overlay.className='inventoryV2Overlay';
  overlay.setAttribute('role','dialog');
  overlay.setAttribute('aria-modal','true');
  overlay.setAttribute('aria-label','Experimental Inventory V2');
  overlay.setAttribute('aria-hidden','true');
  overlay.innerHTML=`
    <div class="inventoryV2Shell">
      <header class="inventoryV2Topbar">
        <span><small>EXPERIMENTAL SIDE-BY-SIDE BUILD</small><b>INVENTORY V2</b></span>
        <div>
          <button id="inventoryV2OpenLegacy" class="inventoryV2Legacy" type="button">OPEN V1</button>
          <button id="inventoryV2Close" class="inventoryV2Close" type="button" aria-label="Close Inventory V2">&times;</button>
        </div>
      </header>
      <div class="inventoryV2Workspace">
        <section class="inventoryV2Character" aria-label="Pappa Hammer preview">
          <div class="inventoryV2Portrait"><div id="inventoryV2Hero" class="inventoryV2Hero"></div></div>
          <div id="inventoryV2Slots" class="inventoryV2Slots"></div>
          <div id="inventoryV2BuildStats" class="inventoryV2BuildStats"></div>
        </section>
        <section class="inventoryV2Collection">
          <header class="inventoryV2CollectionHeader">
            <span><small>SECURED LOOT</small><b id="inventoryV2Count">0 ITEMS</b></span>
            <div class="inventoryV2Controls">
              <label><span>TYPE</span><select id="inventoryV2SlotFilter"></select></label>
              <label><span>RARITY</span><select id="inventoryV2RarityFilter"></select></label>
              <button id="inventoryV2Sort" type="button">SORT: POWER</button>
            </div>
          </header>
          <div id="inventoryV2Grid" class="inventoryV2Grid" role="listbox" aria-label="Inventory V2 secured gear"></div>
        </section>
        <aside id="inventoryV2Detail" class="inventoryV2Detail" aria-live="polite"></aside>
      </div>
    </div>`;
  document.body.appendChild(overlay);

  const $=id=>document.getElementById(id);
  const ui={hero:$('inventoryV2Hero'),slots:$('inventoryV2Slots'),stats:$('inventoryV2BuildStats'),count:$('inventoryV2Count'),grid:$('inventoryV2Grid'),detail:$('inventoryV2Detail'),slot:$('inventoryV2SlotFilter'),rarity:$('inventoryV2RarityFilter'),sort:$('inventoryV2Sort'),close:$('inventoryV2Close'),legacy:$('inventoryV2OpenLegacy')};

  function buildFilters(snapshot){
    if(!ui.slot.options.length){
      ui.slot.innerHTML='<option value="all">ALL TYPES</option>'+snapshot.slots.map(slot=>'<option value="'+slot.id+'">'+slot.name+'</option>').join('');
      ui.rarity.innerHTML='<option value="all">ALL RARITIES</option>'+['common','uncommon','rare','epic','legendary'].map(id=>'<option value="'+id+'">'+id.toUpperCase()+'</option>').join('');
    }
    ui.slot.value=state.slot;ui.rarity.value=state.rarity
  }

  function selected(snapshot){return snapshot.gear.find(item=>item.uid===state.selectedUid)||null}
  function visibleItems(snapshot){
    let list=snapshot.gear.filter(item=>(state.slot==='all'||item.slot===state.slot)&&(state.rarity==='all'||item.rarity===state.rarity));
    return list.sort((a,b)=>{
      if(state.sort==='rarity')return b.rarityRank-a.rarityRank||b.power-a.power;
      if(state.sort==='newest')return b.newest-a.newest;
      if(state.sort==='name')return a.name.localeCompare(b.name);
      return b.power-a.power||b.rarityRank-a.rarityRank
    })
  }

  function renderSlots(snapshot){
    ui.slots.innerHTML=snapshot.slots.map(slot=>{
      let item=snapshot.equipped[slot.id];
      return '<button class="inventoryV2Slot '+(item?'filled':'empty')+'" data-slot="'+slot.id+'" data-uid="'+(item?item.uid:'')+'" style="--item-color:'+(item?item.color:'#74694f')+'" type="button"><i>'+(item?item.art:slot.icon)+'</i><span><small>'+slot.name+'</small><b>'+(item?item.name:'EMPTY')+'</b></span></button>'
    }).join('')
  }

  function renderStats(snapshot){
    ui.stats.innerHTML='<span><small>HP</small><b>'+snapshot.summary.hp+'</b></span><span><small>DAMAGE</small><b>'+snapshot.summary.damage+'</b></span><span><small>CRIT</small><b>'+snapshot.summary.crit+'%</b></span><span><small>ARMOR</small><b>'+snapshot.summary.armor+'%</b></span>'
  }

  function renderGrid(snapshot){
    let list=visibleItems(snapshot);ui.count.textContent=list.length+' / '+snapshot.summary.count+' ITEMS';
    if(!list.length){ui.grid.innerHTML='<div class="inventoryV2Empty"><b>NO GEAR FOUND</b><span>Change the active filters.</span></div>';return}
    ui.grid.innerHTML=list.map(item=>'<button class="inventoryV2Card rarity'+item.rarityRank+(item.equipped?' equipped':'')+(state.selectedUid===item.uid?' selected':'')+'" role="option" aria-selected="'+(state.selectedUid===item.uid)+'" data-uid="'+item.uid+'" style="--item-color:'+item.color+'" type="button"><span class="inventoryV2CardArt">'+item.art+'</span><span class="inventoryV2CardCopy"><small>'+item.rarityName+' '+item.slotName+'</small><b>'+item.name+'</b><em>'+item.power+' POWER</em></span>'+(item.equipped?'<i class="inventoryV2EquippedMark">E</i>':'')+'</button>').join('')
  }

  function renderDetail(snapshot){
    let item=selected(snapshot);
    if(!item){ui.detail.innerHTML='<div class="inventoryV2NoSelection"><i>&#9670;</i><b>SELECT GEAR</b><span>Inspect an item to compare it with the current loadout.</span></div>';return}
    let comparison=item.comparison,rows=comparison?comparison.rows.map(row=>'<span class="'+row.tone+'"><small>'+row.label+'</small><b>'+compareFormat(row.candidate,row.type)+'</b><em>'+(row.tone==='same'?'=':(row.delta>0?'+':'')+compareFormat(row.delta,row.type))+'</em></span>').join(''):'',set=item.set;
    ui.detail.style.setProperty('--item-color',item.color);
    ui.detail.innerHTML='<div class="inventoryV2InspectArt">'+item.art+'</div><div class="inventoryV2InspectTitle"><small>'+item.rarityName+' &middot; LEVEL '+item.level+' &middot; '+item.slotName+'</small><h2>'+item.name+'</h2><span>'+item.quality+' &middot; '+item.power+' POWER</span></div><div class="inventoryV2Comparison"><header><small>VS EQUIPPED</small><b>'+comparison.wornName+'</b></header>'+rows+'</div>'+(set?'<div class="inventoryV2Set"><span><small>'+set.name+' SET</small><b>'+set.candidate+'/5</b></span><i><em style="width:'+(set.candidate/5*100)+'%"></em></i><p>'+(set.next?set.next.label+' &middot; '+set.next.effect:'FULL SET ACTIVE')+'</p></div>':'')+'<button id="inventoryV2Equip" class="inventoryV2Equip" type="button">'+(item.equipped?'REMOVE':'EQUIP')+'</button>'
  }

  function render(previewUid){
    state.snapshot=bridge.snapshot(previewUid);buildFilters(state.snapshot);renderSlots(state.snapshot);renderStats(state.snapshot);renderGrid(state.snapshot);renderDetail(state.snapshot);ui.hero.style.backgroundImage=state.snapshot.characterImage||'';ui.sort.textContent='SORT: '+sortNames[state.sort]
  }

  function open(){
    bridge.closeLegacy();state.open=true;state.tapUid=null;state.snapshot=bridge.snapshot();if(!state.selectedUid||!state.snapshot.gear.some(item=>item.uid===state.selectedUid))state.selectedUid=(state.snapshot.gear.find(item=>!item.equipped)||state.snapshot.gear[0]||{}).uid||null;
    render(state.selectedUid);overlay.classList.add('show');overlay.setAttribute('aria-hidden','false');document.body.classList.add('inventoryV2Open');requestAnimationFrame(()=>ui.close.focus())
  }
  function close(){state.open=false;overlay.classList.remove('show');overlay.setAttribute('aria-hidden','true');document.body.classList.remove('inventoryV2Open');launcher.focus()}
  function equipSelected(){
    let item=selected(state.snapshot);if(!item)return;
    if(item.equipped)bridge.unequip(item.slot);else bridge.equip(item.uid);state.tapUid=null;
    render();overlay.querySelector('.inventoryV2Slot[data-slot="'+item.slot+'"]').classList.add('changed');setTimeout(()=>{let slot=overlay.querySelector('.inventoryV2Slot.changed');if(slot)slot.classList.remove('changed')},340)
  }

  launcher.addEventListener('click',open);ui.close.addEventListener('click',close);ui.legacy.addEventListener('click',()=>{close();bridge.openLegacy()});
  ui.slot.addEventListener('change',()=>{state.slot=ui.slot.value;render()});ui.rarity.addEventListener('change',()=>{state.rarity=ui.rarity.value;render()});ui.sort.addEventListener('click',()=>{let order=['power','rarity','newest','name'],index=order.indexOf(state.sort);state.sort=order[(index+1)%order.length];render()});
  ui.grid.addEventListener('click',event=>{let card=event.target.closest('.inventoryV2Card');if(!card)return;let coarse=matchMedia('(pointer:coarse)').matches;if(coarse&&state.tapUid===card.dataset.uid){equipSelected();return}state.selectedUid=card.dataset.uid;state.tapUid=coarse?card.dataset.uid:null;render(state.selectedUid)});
  ui.grid.addEventListener('pointerover',event=>{if(event.pointerType==='touch')return;let card=event.target.closest('.inventoryV2Card');if(card)ui.hero.style.backgroundImage=bridge.snapshot(card.dataset.uid).characterImage||''});
  ui.grid.addEventListener('pointerout',event=>{if(event.pointerType==='touch')return;let card=event.target.closest('.inventoryV2Card');if(card&&!card.contains(event.relatedTarget))ui.hero.style.backgroundImage=bridge.snapshot(state.selectedUid).characterImage||''});
  ui.detail.addEventListener('click',event=>{if(event.target.closest('#inventoryV2Equip'))equipSelected()});
  ui.slots.addEventListener('click',event=>{let slot=event.target.closest('.inventoryV2Slot');if(!slot)return;if(slot.dataset.uid){state.selectedUid=slot.dataset.uid;render(state.selectedUid)}else{state.slot=slot.dataset.slot;render()}});
  overlay.addEventListener('pointerdown',event=>{if(event.target===overlay)close()});
  window.addEventListener('keydown',event=>{if(!state.open||event.key!=='Escape')return;event.preventDefault();event.stopImmediatePropagation();close()},{capture:true});

  window.InventoryV2=Object.freeze({open,close,isOpen:()=>state.open,snapshot:()=>state.snapshot});
})();
