(()=>{"use strict";
const tabs=[...document.querySelectorAll("[data-folio-tab]")];
const panels=[...document.querySelectorAll("[data-folio-panel]")];
const stage=document.querySelector(".folio-stage");
if(tabs.length!==panels.length||!tabs.length)return;
function setActive(tab,focus=false){
  const id=tab.dataset.folioTab;
  for(const b of tabs){const selected=b===tab;b.setAttribute("aria-selected",String(selected));b.tabIndex=selected?0:-1;}
  for(const panel of panels){panel.hidden=(panel.dataset.folioPanel!==id);}
  if(stage)stage.style.setProperty("--method-progress",String(Math.round((tabs.indexOf(tab)+1)/tabs.length*100))+"%");
  if(focus)tab.focus();
}
for(let i=0;i<tabs.length;i++){
  const tab=tabs[i];
  tab.addEventListener("click",()=>setActive(tab));
  tab.addEventListener("keydown",event=>{
    if(!["ArrowRight","ArrowLeft","ArrowDown","ArrowUp","Home","End"].includes(event.key))return;
    event.preventDefault();
    const key=event.key;
    let j=key==="Home"?0:key==="End"?tabs.length-1:
      (i+(key==="ArrowRight"||key==="ArrowDown"?1:-1)+tabs.length)%tabs.length;
    setActive(tabs[j],true);
  });
}
setActive(tabs.find(b=>b.getAttribute("aria-selected")==="true")||tabs[0]);
})();