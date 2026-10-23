(()=>{"use strict";
const bar=document.querySelector(".resource-topic-filter");
const cards=[...document.querySelectorAll(".resource-article-card[data-topic]")];
if(!bar||cards.length===0)return;
const controls=[...bar.querySelectorAll("button[data-filter]")];
if(!controls.length)return;
bar.hidden=false;
function show(value){
  let count=0;
  for(const card of cards){
    const visible=value==="all"||card.dataset.topic===value;
    card.hidden=!visible;
    if(visible)count++;
  }
  for(const button of controls)button.setAttribute("aria-pressed",String(button.dataset.filter===value));
  const status=bar.querySelector("[data-filter-status]");
  if(status)status.textContent="当前显示 "+count+" 篇文章";
}
for(const button of controls)button.addEventListener("click",()=>show(button.dataset.filter));
show("all");
})();
