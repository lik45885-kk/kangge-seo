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
try{
let copied=false;
if(navigator.clipboard&&window.isSecureContext){try{await navigator.clipboard.writeText(value);copied=true;}catch(_){}}
if(!copied){
const previous=document.activeElement,field=document.createElement("textarea");
field.value=value;field.setAttribute("readonly","");field.style.cssText="position:fixed;left:-9999px;top:0;opacity:0";
document.body.appendChild(field);field.select();field.setSelectionRange(0,value.length);
try{copied=document.execCommand("copy");}finally{field.remove();previous?.focus({preventScroll:true});}
}
if(!copied)throw new Error("copy unavailable");
toast("已复制："+value);
}
catch(_){toast("复制受限制，请手动复制："+value);}
}));
})();
