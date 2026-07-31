(function(){
  'use strict';

  const bridge=window.RiskLootInventoryV2Bridge;
  if(!bridge||document.getElementById('inventoryV2Overlay'))return;

  const state={
    open:false,
    selectedUid:null,
    tapUid:null,
    hoverUid:null,
    slot:'all',
    rarity:'all',
    sort:'power',
    snapshot:null,
    drag:null,
    suppressClickUntil:0,
    equipLocked:false,
    previousFocus:null,
    unlockTimer:0,
    renderCount:0
  };
  const sortNames={power:'POWER',rarity:'RARITY',newest:'NEWEST',name:'NAME'};
  const compareFormat=(value,type)=>type==='percent'?(Math.round(value*1000)/10)+'%':String(Math.round(value*10)/10);
  const coarsePointer=()=>matchMedia('(pointer:coarse)').matches;

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
          <div class="inventoryV2Portrait" data-drop-zone="hero"><div id="inventoryV2Hero" class="inventoryV2Hero"></div></div>
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
  const ui={
    shell:overlay.querySelector('.inventoryV2Shell'),
    portrait:overlay.querySelector('.inventoryV2Portrait'),
    hero:$('inventoryV2Hero'),
    slots:$('inventoryV2Slots'),
    stats:$('inventoryV2BuildStats'),
    count:$('inventoryV2Count'),
    grid:$('inventoryV2Grid'),
    detail:$('inventoryV2Detail'),
    slot:$('inventoryV2SlotFilter'),
    rarity:$('inventoryV2RarityFilter'),
    sort:$('inventoryV2Sort'),
    close:$('inventoryV2Close'),
    legacy:$('inventoryV2OpenLegacy')
  };

  function buildFilters(snapshot){
    if(!ui.slot.options.length){
      ui.slot.innerHTML='<option value="all">ALL TYPES</option>'+snapshot.slots.map(slot=>'<option value="'+slot.id+'">'+slot.name+'</option>').join('');
      ui.rarity.innerHTML='<option value="all">ALL RARITIES</option>'+['common','uncommon','rare','epic','legendary'].map(id=>'<option value="'+id+'">'+id.toUpperCase()+'</option>').join('')
    }
    if(![...ui.slot.options].some(option=>option.value===state.slot))state.slot='all';
    if(![...ui.rarity.options].some(option=>option.value===state.rarity))state.rarity='all';
    ui.slot.value=state.slot;
    ui.rarity.value=state.rarity
  }

  function selected(snapshot){return snapshot&&snapshot.gear.find(item=>item.uid===state.selectedUid)||null}

  function visibleItems(snapshot){
    let list=snapshot.gear.filter(item=>(state.slot==='all'||item.slot===state.slot)&&(state.rarity==='all'||item.rarity===state.rarity));
    return list.sort((a,b)=>{
      let result=0;
      if(state.sort==='rarity')result=b.rarityRank-a.rarityRank||b.power-a.power;
      else if(state.sort==='newest')result=b.newest-a.newest;
      else if(state.sort==='name')result=a.name.localeCompare(b.name)||a.slot.localeCompare(b.slot);
      else result=b.power-a.power||b.rarityRank-a.rarityRank;
      return result||a.uid.localeCompare(b.uid)
    })
  }

  function reconcileSelection(snapshot,ensureVisible){
    let list=visibleItems(snapshot),exists=snapshot.gear.some(item=>item.uid===state.selectedUid),visible=list.some(item=>item.uid===state.selectedUid);
    if(!exists||ensureVisible&&!visible)state.selectedUid=(list[0]||{}).uid||null;
    if(state.tapUid!==state.selectedUid)state.tapUid=null;
    return list
  }

  function renderSlots(snapshot){
    ui.slots.innerHTML=snapshot.slots.map(slot=>{
      let item=snapshot.equipped[slot.id];
      return '<button class="inventoryV2Slot '+(item?'filled':'empty')+(item&&state.selectedUid===item.uid?' selected':'')+'" data-slot="'+slot.id+'" data-uid="'+(item?item.uid:'')+'" style="--item-color:'+(item?item.color:'#74694f')+'" type="button" aria-label="'+slot.name+(item?' equipped: '+item.name:' empty')+'"><i>'+(item?item.art:slot.icon)+'</i><span><small>'+slot.name+'</small><b>'+(item?item.name:'EMPTY')+'</b></span></button>'
    }).join('')
  }

  function activeBuild(snapshot){
    let equipped=Object.values(snapshot.equipped).filter(Boolean),set=(snapshot.setProgress||[]).slice().sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name))[0]||null;
    return{power:Math.round(equipped.reduce((sum,item)=>sum+item.power,0)*10)/10,set,equipped:equipped.length}
  }

  function nextBonusText(next){
    if(!next)return'BUILDING SET';
    let label=String(next.label||'BONUS').replace(/^NEXT\s+/i,'');
    return'NEXT '+label+(next.effect?' \u00B7 '+next.effect:'')
  }

  function renderStats(snapshot){
    let build=activeBuild(snapshot),set=build.set,setStatus=set?(set.count>=5?'FULL SET ACTIVE':nextBonusText(set.next)):'NO SET ACTIVE';
    ui.stats.style.setProperty('--set-color',set?set.color:'#d6aa58');
    ui.stats.innerHTML='<span class="inventoryV2Power"><small>POWER</small><b>'+build.power+'</b></span><span class="inventoryV2BuildIdentity"><small>'+(set?'ACTIVE BUILD':'LOADOUT')+'</small><b>'+(set?set.name:'FIELD GEAR')+'</b><em>'+setStatus+'</em></span><span class="inventoryV2SetCount"><small>SET</small><b>'+(set?set.count+'/5':build.equipped+'/5')+'</b></span>'
  }

  function renderGrid(snapshot,list){
    ui.count.textContent=list.length+' / '+snapshot.summary.count+' ITEMS';
    if(!list.length){ui.grid.innerHTML='<div class="inventoryV2Empty"><b>NO GEAR FOUND</b><span>Change the active filters.</span></div>';return}
    let draggable=!coarsePointer();
    ui.grid.innerHTML=list.map(item=>'<button class="inventoryV2Card rarity'+item.rarityRank+(item.equipped?' equipped':'')+(state.selectedUid===item.uid?' selected':'')+'" role="option" aria-selected="'+(state.selectedUid===item.uid)+'" data-uid="'+item.uid+'" style="--item-color:'+item.color+'" type="button" draggable="'+draggable+'"><span class="inventoryV2CardArt">'+item.art+'</span><span class="inventoryV2CardCopy"><small>'+item.rarityName+' '+item.slotName+'</small><b>'+item.name+'</b><em>'+item.power+' POWER</em></span>'+(item.equipped?'<i class="inventoryV2EquippedMark">E</i>':'')+'</button>').join('')
  }

  function renderDetail(snapshot){
    let item=selected(snapshot);
    if(!item){ui.detail.style.removeProperty('--item-color');ui.detail.innerHTML='<div class="inventoryV2NoSelection"><i>&#9670;</i><b>SELECT GEAR</b><span>Inspect an item to compare it with the current loadout.</span></div>';return}
    let comparison=item.comparison,rows=comparison?comparison.rows.map(row=>'<span class="'+row.tone+'"><small>'+row.label+'</small><b>'+compareFormat(row.candidate,row.type)+'</b><em>'+(row.tone==='same'?'=':(row.delta>0?'+':'')+compareFormat(row.delta,row.type))+'</em></span>').join(''):'',set=item.set,worn=comparison&&snapshot.gear.find(entry=>entry.uid===comparison.wornUid),powerDelta=Math.round((item.power-(worn?worn.power:0))*10)/10,powerTone=item.equipped?'same':powerDelta>0?'gain':powerDelta<0?'loss':'same',action=item.equipped?'REMOVE':comparison&&comparison.wornUid?'REPLACE':'EQUIP';
    ui.detail.style.setProperty('--item-color',item.color);
    ui.detail.innerHTML='<div class="inventoryV2InspectArt">'+item.art+'</div><div class="inventoryV2InspectTitle"><small>'+item.rarityName+' &middot; '+item.slotName+'</small><h2>'+item.name+'</h2><span class="inventoryV2SelectionSummary"><b>'+item.power+' POWER</b><em class="'+powerTone+'">'+(item.equipped?'EQUIPPED':(powerDelta>0?'+':'')+powerDelta+' VS WORN')+'</em></span>'+(set?'<span class="inventoryV2SelectionSet">'+set.name+' &middot; '+set.candidate+'/5 &middot; '+(set.candidate>=5?'FULL SET':nextBonusText(set.next))+'</span>':'')+'</div><div class="inventoryV2Comparison"><header><small>VS EQUIPPED</small><b>'+(comparison?comparison.wornName:'EMPTY SLOT')+'</b></header>'+rows+'</div>'+(set?'<div class="inventoryV2Set"><span><small>'+set.name+' SET</small><b>'+set.candidate+'/5</b></span><i><em style="width:'+(set.candidate/5*100)+'%"></em></i><p>'+(set.next?set.next.label+' &middot; '+set.next.effect:'FULL SET ACTIVE')+'</p></div>':'')+'<button id="inventoryV2Equip" class="inventoryV2Equip" type="button" '+(state.equipLocked?'disabled':'')+'>'+action+'</button>'
  }

  function render(options){
    options=options||{};
    state.snapshot=options.snapshot||bridge.snapshot(options.previewUid);
    buildFilters(state.snapshot);
    let list=reconcileSelection(state.snapshot,!!options.ensureVisible);
    renderSlots(state.snapshot);
    renderStats(state.snapshot);
    renderGrid(state.snapshot,list);
    renderDetail(state.snapshot);
    ui.hero.style.backgroundImage=state.snapshot.characterImage||'';
    ui.sort.textContent='SORT: '+sortNames[state.sort];
    state.renderCount++
  }

  function clearDrag(){
    if(state.drag&&state.drag.source)state.drag.source.classList.remove('dragging');
    if(state.drag&&state.drag.target)state.drag.target.classList.remove('dragTarget');
    overlay.querySelectorAll('.dragTarget').forEach(target=>target.classList.remove('dragTarget'));
    document.querySelectorAll('.inventoryV2DragGhost').forEach(ghost=>ghost.remove());
    state.drag=null
  }

  function unlockEquipSoon(){
    if(state.unlockTimer)clearTimeout(state.unlockTimer);
    state.unlockTimer=setTimeout(()=>{
      state.unlockTimer=0;
      state.equipLocked=false;
      let button=ui.detail.querySelector('#inventoryV2Equip');
      if(button)button.disabled=false
    },140)
  }

  function applyEquipment(item,remove){
    if(!item||state.equipLocked)return false;
    state.equipLocked=true;
    state.tapUid=null;
    let result=remove?bridge.unequip(item.slot):bridge.equip(item.uid);
    let snapshot=result&&result.snapshot||bridge.snapshot();
    render({snapshot,ensureVisible:false});
    unlockEquipSoon();
    return !!(result&&result.changed)
  }

  function equipSelected(){
    let item=selected(state.snapshot);
    return applyEquipment(item,!!(item&&item.equipped))
  }

  function equipDragged(uid){
    let item=state.snapshot&&state.snapshot.gear.find(entry=>entry.uid===uid);
    if(!item||item.equipped)return false;
    state.selectedUid=uid;
    return applyEquipment(item,false)
  }

  function open(){
    if(state.open){render({ensureVisible:true,previewUid:state.selectedUid});ui.close.focus();return}
    bridge.closeLegacy();
    clearDrag();
    state.open=true;
    state.tapUid=null;
    state.hoverUid=null;
    state.previousFocus=document.activeElement;
    overlay.classList.add('show');
    overlay.setAttribute('aria-hidden','false');
    document.body.classList.add('inventoryV2Open');
    render({ensureVisible:true,previewUid:state.selectedUid});
    requestAnimationFrame(()=>ui.close.focus({preventScroll:true}))
  }

  function close(options){
    options=options||{};
    clearDrag();
    state.tapUid=null;
    state.hoverUid=null;
    state.open=false;
    if(state.unlockTimer){clearTimeout(state.unlockTimer);state.unlockTimer=0;state.equipLocked=false}
    bridge.flush&&bridge.flush();
    overlay.classList.remove('show');
    overlay.setAttribute('aria-hidden','true');
    document.body.classList.remove('inventoryV2Open');
    if(options.restoreFocus!==false){let target=state.previousFocus&&state.previousFocus.isConnected?state.previousFocus:launcher;target.focus({preventScroll:true})}
    state.previousFocus=null
  }

  function selectCard(card){
    if(!card)return;
    let uid=card.dataset.uid,item=state.snapshot.gear.find(entry=>entry.uid===uid);
    if(!item)return;
    let secondTap=coarsePointer()&&state.tapUid===uid&&state.selectedUid===uid;
    state.selectedUid=uid;
    if(secondTap){equipSelected();return}
    state.tapUid=coarsePointer()?uid:null;
    render({previewUid:uid})
  }

  function setDragTarget(target){
    if(!state.drag)return;
    if(state.drag.target===target)return;
    if(state.drag.target)state.drag.target.classList.remove('dragTarget');
    state.drag.target=target;
    if(target)target.classList.add('dragTarget')
  }

  function validDropTarget(target){
    if(!state.drag||!target)return false;
    if(target.matches('.inventoryV2Portrait'))return true;
    if(target.matches('.inventoryV2Slot')){
      let item=state.snapshot.gear.find(entry=>entry.uid===state.drag.uid);
      return !!item&&item.slot===target.dataset.slot
    }
    return false
  }

  launcher.addEventListener('click',open);
  ui.close.addEventListener('click',()=>close());
  ui.legacy.addEventListener('click',()=>{close({restoreFocus:false});bridge.openLegacy()});
  ui.slot.addEventListener('change',()=>{state.slot=ui.slot.value;state.tapUid=null;render({ensureVisible:true})});
  ui.rarity.addEventListener('change',()=>{state.rarity=ui.rarity.value;state.tapUid=null;render({ensureVisible:true})});
  ui.sort.addEventListener('click',()=>{let order=['power','rarity','newest','name'],index=order.indexOf(state.sort);state.sort=order[(index+1)%order.length];state.tapUid=null;render({ensureVisible:true})});

  ui.grid.addEventListener('click',event=>{
    if(performance.now()<state.suppressClickUntil)return;
    selectCard(event.target.closest('.inventoryV2Card'))
  });
  ui.grid.addEventListener('pointerover',event=>{
    if(event.pointerType==='touch'||state.drag)return;
    let card=event.target.closest('.inventoryV2Card');
    if(!card||state.hoverUid===card.dataset.uid)return;
    state.hoverUid=card.dataset.uid;
    let preview=bridge.snapshot(state.hoverUid).characterImage;
    if(preview)ui.hero.style.backgroundImage=preview
  });
  ui.grid.addEventListener('pointerout',event=>{
    if(event.pointerType==='touch'||state.drag)return;
    let card=event.target.closest('.inventoryV2Card');
    if(!card||card.contains(event.relatedTarget))return;
    state.hoverUid=null;
    let preview=bridge.snapshot(state.selectedUid).characterImage;
    if(preview)ui.hero.style.backgroundImage=preview
  });
  ui.grid.addEventListener('dragstart',event=>{
    let card=event.target.closest('.inventoryV2Card');
    if(!card||coarsePointer()){event.preventDefault();return}
    clearDrag();
    let rect=card.getBoundingClientRect(),ghost=card.cloneNode(true);
    ghost.className='inventoryV2DragGhost';
    ghost.removeAttribute('id');
    ghost.style.width=rect.width+'px';
    ghost.style.height=rect.height+'px';
    document.body.appendChild(ghost);
    card.classList.add('dragging');
    state.suppressClickUntil=performance.now()+250;
    state.drag={uid:card.dataset.uid,source:card,ghost,target:null,startedAt:performance.now()};
    event.dataTransfer.effectAllowed='move';
    event.dataTransfer.setData('text/plain',card.dataset.uid);
    event.dataTransfer.setDragImage(ghost,rect.width/2,rect.height/2)
  });
  ui.grid.addEventListener('dragend',clearDrag);

  overlay.addEventListener('dragover',event=>{
    let target=event.target.closest('.inventoryV2Slot,.inventoryV2Portrait');
    if(!validDropTarget(target)){setDragTarget(null);return}
    event.preventDefault();
    event.dataTransfer.dropEffect='move';
    setDragTarget(target)
  });
  overlay.addEventListener('drop',event=>{
    let target=event.target.closest('.inventoryV2Slot,.inventoryV2Portrait'),uid=state.drag&&state.drag.uid;
    if(validDropTarget(target)){event.preventDefault();equipDragged(uid)}
    clearDrag()
  });
  overlay.addEventListener('dragleave',event=>{if(state.drag&&state.drag.target&&!state.drag.target.contains(event.relatedTarget))setDragTarget(null)});
  overlay.addEventListener('pointerdown',event=>{if(event.target===overlay)close()});
  ui.detail.addEventListener('click',event=>{if(event.target.closest('#inventoryV2Equip'))equipSelected()});
  ui.slots.addEventListener('click',event=>{
    let slot=event.target.closest('.inventoryV2Slot');
    if(!slot)return;
    state.tapUid=null;
    if(slot.dataset.uid){state.selectedUid=slot.dataset.uid;render({previewUid:state.selectedUid})}
    else{state.slot=slot.dataset.slot;render({ensureVisible:true})}
  });

  window.addEventListener('keydown',event=>{
    if(!state.open||event.key!=='Escape')return;
    event.preventDefault();
    event.stopImmediatePropagation();
    close()
  },{capture:true});
  window.addEventListener('blur',clearDrag);
  document.addEventListener('pointercancel',()=>{
    if(state.drag&&performance.now()-state.drag.startedAt>250)clearDrag()
  },{capture:true});
  document.addEventListener('pointerup',()=>{
    if(!state.drag)return;
    let activeDrag=state.drag;
    setTimeout(()=>{if(state.drag===activeDrag)clearDrag()},120)
  },{capture:true});

  window.InventoryV2=Object.freeze({
    version:2,
    open,
    close,
    isOpen:()=>state.open,
    snapshot:()=>state.snapshot,
    diagnostics:()=>({
      renderCount:state.renderCount,
      selectedUid:state.selectedUid,
      tapUid:state.tapUid,
      dragActive:!!state.drag,
      overlays:document.querySelectorAll('#inventoryV2Overlay').length,
      launchers:document.querySelectorAll('#inventoryV2Button').length,
      cards:ui.grid.querySelectorAll('.inventoryV2Card').length,
      uniqueCards:new Set([...ui.grid.querySelectorAll('.inventoryV2Card')].map(card=>card.dataset.uid)).size,
      dragGhosts:document.querySelectorAll('.inventoryV2DragGhost').length
    })
  })
})();
