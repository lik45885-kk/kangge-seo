(()=>{"use strict";
/* Visual enhancement only. All content, links and text remain in HTML. */
const reducedQuery=window.matchMedia("(prefers-reduced-motion: reduce)");
const viewportQuery=window.matchMedia("(min-width: 900px) and (hover: hover) and (pointer: fine)");
const saveData=!!(navigator.connection&&navigator.connection.saveData);

/* Gentle entry for uncovered text. Other sections already use .reveal
   in site.js, so avoid applying a second transform to those ancestors. */
const main=document.querySelector("main");
if(main&&"IntersectionObserver" in window&&!reducedQuery.matches){
  const selector=[
    "h1","h2","h3","p",".eyebrow",".kicker",".folio-eyebrow",
    ".folio-intro",".page-meta",".story-draft-note",
    ".resource-contact"
  ].join(",");
  const blocked=".reveal,.hero-cinematic,.folio-stage,.photo-collection,.resource-note,.contact-method,.folio-note-link,.folio-work-card";
  const nodes=[...main.querySelectorAll(selector)].filter(el=>
    !el.closest(blocked)&&!el.closest("[hidden]")&&
    !el.closest("nav")&&!el.closest(".personal-tabs")
  );
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      if(entry.isIntersecting){
        entry.target.classList.add("motion-in");
        observer.unobserve(entry.target);
      }
    }
  },{rootMargin:"0px 0px -10% 0px",threshold:0.01});
  nodes.forEach((el,i)=>{
    // Already visible at load: don't hide or flash it.
    if(el.getBoundingClientRect().top<window.innerHeight*.85)return;
    el.classList.add("motion-text");
    el.style.setProperty("--motion-delay",String(Math.min(i%4,3)*65)+"ms");
    observer.observe(el);
  });
  if(typeof reducedQuery.addEventListener==="function"){
    reducedQuery.addEventListener("change",event=>{
      if(event.matches)main.querySelectorAll(".motion-text").forEach(el=>{
        el.classList.add("motion-in");observer.unobserve(el);
      });
    });
  }
}

/* Photography: maximum ±6px scroll movement on desktop only.
   The original files, colors and natural aspect ratios are untouched. */
const gallery=document.querySelector(".photo-collection");
const images=gallery?[...gallery.querySelectorAll(".gallery-photo img")]:[];
if(gallery&&images.length&&"IntersectionObserver" in window){
  const visible=new Set();
  let rafId=0;
  let enabled=false;
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  const canMove=()=>!reducedQuery.matches&&viewportQuery.matches&&!saveData;

  function update(){
    rafId=0;
    if(!enabled||document.hidden)return;
    const viewHeight=window.innerHeight||1;
    for(const img of visible){
      const rect=img.getBoundingClientRect();
      const delta=(rect.top+rect.height*.5-viewHeight*.5)/(viewHeight*.9);
      const pixels=clamp(-delta*6,-6,6);
      img.style.setProperty("--photo-shift",pixels.toFixed(2)+"px");
    }
  }
  function requestUpdate(){
    if(enabled&&!rafId&&!document.hidden)rafId=requestAnimationFrame(update);
  }
  const observer=new IntersectionObserver(entries=>{
    for(const entry of entries){
      const image=entry.target.querySelector("img");
      if(!image)continue;
      if(entry.isIntersecting)visible.add(image);
      else {
        visible.delete(image);
        image.style.removeProperty("--photo-shift");
      }
    }
    requestUpdate();
  },{rootMargin:"130px 0px 130px 0px",threshold:0});
  gallery.querySelectorAll(".gallery-photo").forEach(el=>observer.observe(el));

  function sync(){
    enabled=canMove();
    document.body.classList.toggle("photo-parallax-enabled",enabled);
    if(!enabled){
      if(rafId){cancelAnimationFrame(rafId);rafId=0}
      for(const img of images)img.style.removeProperty("--photo-shift");
    }else requestUpdate();
  }
  window.addEventListener("scroll",requestUpdate,{passive:true});
  window.addEventListener("resize",()=>{sync();requestUpdate()},{passive:true});
  document.addEventListener("visibilitychange",requestUpdate);
  for(const query of [reducedQuery,viewportQuery]){
    if(typeof query.addEventListener==="function")query.addEventListener("change",sync);
  }
  sync();
}
})();