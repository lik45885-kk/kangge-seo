(()=>{"use strict";
const nav=document.querySelector(".site-head");
const onScroll=()=>nav?.classList.toggle("is-scrolled",window.scrollY>12);
onScroll();window.addEventListener("scroll",onScroll,{passive:true});
const aboutNav=document.querySelector(".nav-about");
if(aboutNav){
const summary=aboutNav.querySelector("summary");
document.addEventListener("click",event=>{if(!aboutNav.contains(event.target))aboutNav.open=false;});
aboutNav.addEventListener("keydown",event=>{if(event.key==="Escape"&&aboutNav.open){event.preventDefault();aboutNav.open=false;summary.focus();}});
aboutNav.addEventListener("focusout",event=>{if(!aboutNav.contains(event.relatedTarget))aboutNav.open=false;});
}
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
const galleryToggle=document.querySelector("[data-gallery-toggle]");
if(galleryToggle){
const extraPhotos=[...document.querySelectorAll("[data-gallery-extra]")];
const label=galleryToggle.querySelector("[data-gallery-label]");
const total=document.querySelectorAll(".photo-collection img").length;
extraPhotos.forEach(photo=>photo.hidden=true);
galleryToggle.hidden=extraPhotos.length===0;
galleryToggle.addEventListener("click",()=>{
const expanded=galleryToggle.getAttribute("aria-expanded")!=="true";
extraPhotos.forEach(photo=>photo.hidden=!expanded);
galleryToggle.setAttribute("aria-expanded",String(expanded));
galleryToggle.setAttribute("aria-label",expanded?"收起照片":"查看全部"+total+"张照片");
label.textContent=expanded?"收起照片":"查看全部照片";
if(!expanded)galleryToggle.scrollIntoView({block:"center",behavior:reduced?"auto":"smooth"});
});
}
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
