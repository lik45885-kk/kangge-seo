(()=>{"use strict";
const bar=document.querySelector(".resource-topic-filter");
const cards=[...document.querySelectorAll(".resource-article-card[data-topic]")];
if(!bar||cards.length===0)return;
const controls=[...bar.querySelectorAll("button[data-filter]")];
if(!controls.length)return;
bar.hidden=false;

const input=bar.querySelector("#article-search");
const clearBtn=bar.querySelector(".resource-search-clear");
const status=bar.querySelector("[data-filter-status]");
let topic="all";

const norm=v=>String(v==null?"":v).toLowerCase().replace(/\s+/g,"");
const searchable=cards.map(card=>({
  card,
  text:norm([
    card.querySelector("h3")?card.querySelector("h3").textContent:"",
    card.querySelector("p")?card.querySelector("p").textContent:"",
    card.dataset.keywords||"",
    card.getAttribute("href")||""
  ].join(" "))
}));

function emptyNote(){
  let note=document.querySelector(".resource-search-empty");
  if(!note){
    note=document.createElement("div");
    note.className="resource-search-empty";
    note.textContent="没有匹配的文章。换个更短的关键词试试，例如“否词”“表单”“预算”“oCPC”。";
    const grid=document.querySelector(".resource-article-grid");
    if(grid&&grid.parentNode)grid.parentNode.insertBefore(note,grid.nextSibling);
  }
  return note;
}

function apply(){
  const q=norm(input?input.value:"");
  let count=0;
  searchable.forEach(({card,text})=>{
    const okTopic=topic==="all"||card.dataset.topic===topic;
    const okQuery=q===""||text.includes(q);
    const visible=okTopic&&okQuery;
    card.hidden=!visible;
    if(visible)count++;
  });
  for(const section of document.querySelectorAll("[data-archive-group]")){
    section.hidden=q!==""||(topic!=="all"&&section.dataset.archiveGroup!==topic);
  }
  for(const button of controls)button.setAttribute("aria-pressed",String(button.dataset.filter===topic));
  if(status)status.textContent="当前显示 "+count+" 篇文章";
  if(clearBtn)clearBtn.hidden=q==="";
  const note=emptyNote();
  note.style.display=(q!==""&&count===0)?"block":"none";
}

for(const button of controls)button.addEventListener("click",()=>{topic=button.dataset.filter;apply();});
if(input){
  input.addEventListener("input",apply);
  input.addEventListener("keydown",e=>{
    if(e.key==="Escape"){input.value="";apply();return;}
    if(e.key==="Enter"){
      const first=cards.find(c=>!c.hidden);
      if(first){const href=first.getAttribute("href");if(href)window.location.href=href;}
    }
  });
}
if(clearBtn)clearBtn.addEventListener("click",()=>{input.value="";input.focus();apply();});
apply();
})();
