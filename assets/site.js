(()=>{"use strict";
const nav=document.querySelector(".site-head");
const onScroll=()=>nav?.classList.toggle("is-scrolled",window.scrollY>12);
onScroll();window.addEventListener("scroll",onScroll,{passive:true});
const reduced=window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const revealEls=[...document.querySelectorAll(".reveal")];
if("IntersectionObserver" in window&&!reduced){
const obs=new IntersectionObserver((entries)=>{entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add("is-visible");obs.unobserve(e.target);}})},{threshold:.11,rootMargin:"0px 0px -20px 0px"});
revealEls.forEach(el=>obs.observe(el));
}else revealEls.forEach(el=>el.classList.add("is-visible"));
const visual=document.querySelector(".hero-visual");
if(visual&&!reduced&&window.matchMedia("(pointer:fine)").matches){
visual.addEventListener("pointermove",e=>{
const r=visual.getBoundingClientRect(),x=(e.clientX-r.left)/r.width-.5,y=(e.clientY-r.top)/r.height-.5;
visual.style.setProperty("--mx",(x*15).toFixed(1)+"px");
visual.style.setProperty("--my",(y*13).toFixed(1)+"px");
});
visual.addEventListener("pointerleave",()=>{visual.style.setProperty("--mx","0px");visual.style.setProperty("--my","0px")});
}
const buttons=[...document.querySelectorAll("[data-method]")];
const panels=[...document.querySelectorAll("[data-method-panel]")];
function activate(button,focus=false){if(!button)return;const key=button.dataset.method;buttons.forEach(b=>{const yes=b===button;b.setAttribute("aria-selected",String(yes));b.tabIndex=yes?0:-1});panels.forEach(p=>p.hidden=p.dataset.methodPanel!==key);if(focus)button.focus();}
buttons.forEach((b,i)=>{b.addEventListener("click",()=>activate(b));b.addEventListener("keydown",e=>{if(!["ArrowUp","ArrowDown","Home","End"].includes(e.key))return;e.preventDefault();let next=e.key==="Home"?0:e.key==="End"?buttons.length-1:(i+(e.key==="ArrowDown"?1:-1)+buttons.length)%buttons.length;activate(buttons[next],true);});});
if(buttons.length)activate(buttons.find(b=>b.getAttribute("aria-selected")==="true")||buttons[0]);
const toastEl=document.querySelector("#toast");
function toast(message){if(!toastEl)return;toastEl.textContent=message;toastEl.hidden=false;clearTimeout(toast._timer);toast._timer=setTimeout(()=>toastEl.hidden=true,3100);}
document.querySelectorAll("[data-copy]").forEach(button=>button.addEventListener("click",async()=>{
const value=button.dataset.copy;
try{if(!navigator.clipboard)throw new Error("clipboard missing");await navigator.clipboard.writeText(value);toast("已复制："+value);}
catch(_){toast("复制受限制，请手动复制："+value);}
}));
const form=document.querySelector("#brief-form");
if(form){
form.addEventListener("submit",e=>{
e.preventDefault();if(!form.reportValidity())return;
const data=new FormData(form);const name=String(data.get("name")||"").trim();const phone=String(data.get("phone")||"").trim();const company=String(data.get("company")||"").trim();const detail=String(data.get("detail")||"").trim();
const body=["你好，我想咨询百度推广代运营。","","称呼："+name,"联系电话："+phone,"公司："+(company||"未填写"),"当前需求：",detail||"希望进一步沟通。","","（百度推广代运营咨询，请确认后发送）"].join("\n");
const mail=document.querySelector("#mail-action"),box=document.querySelector("#mail-preview");
if(mail&&box){mail.href="mailto:775381540@qq.com?subject="+encodeURIComponent("百度推广代运营咨询｜"+name)+"&body="+encodeURIComponent(body);box.hidden=false;box.scrollIntoView({behavior:reduced?"auto":"smooth",block:"nearest"});toast("需求邮件已生成，请点击按钮在邮箱中发送");}
});
}
})();
