/* ==========================================================================
   SCRIPT.JS — Vivaha & Co.
   AOS / GSAP / Swiper init + site interactions
   ========================================================================== */

/* ---------- Global Config ---------- */
const WHATSAPP_NUMBER = "919999999999"; // TODO: replace with real WhatsApp business number
const CALL_NUMBER = "+919999999999"; // TODO: replace with real phone number

function buildWhatsAppLink(message){
  const text = encodeURIComponent(message || "Hello! I'd like to know more about your matchmaking services.");
  return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
}

/* Apply WhatsApp href to every element carrying [data-wa-msg] or default class
   Defensive: only ever touches elements explicitly marked with .js-whatsapp,
   and skips anything that already points to a real internal page (safety net). */
function wireWhatsAppButtons(){
  document.querySelectorAll("a.js-whatsapp").forEach(el=>{
    const existingHref = el.getAttribute("href") || "";
    const looksInternal = /\.html(#.*)?$/i.test(existingHref) || existingHref.startsWith("/");
    if(looksInternal) return; // never overwrite a real page link
    const msg = el.getAttribute("data-wa-msg");
    el.setAttribute("href", buildWhatsAppLink(msg));
    el.setAttribute("target","_blank");
    el.setAttribute("rel","noopener");
  });
  document.querySelectorAll("a.js-call").forEach(el=>{
    const existingHref = el.getAttribute("href") || "";
    const looksInternal = /\.html(#.*)?$/i.test(existingHref) || existingHref.startsWith("/");
    if(looksInternal) return;
    el.setAttribute("href", `tel:${CALL_NUMBER}`);
  });
}

/* ---------- Header on scroll ---------- */
function initHeaderScroll(){
  const header = document.querySelector(".site-header");
  if(!header) return;
  const toggle = ()=>{
    if(window.scrollY > 40) header.classList.add("is-scrolled");
    else header.classList.remove("is-scrolled");
  };
  toggle();
  window.addEventListener("scroll", toggle, {passive:true});
}

/* ---------- Mobile nav ---------- */
function initMobileNav(){
  const openBtn = document.querySelector(".js-open-mobile-nav");
  const closeBtn = document.querySelector(".js-close-mobile-nav");
  const nav = document.querySelector(".mobile-nav");
  if(!openBtn || !nav) return;

  const openNav = (e)=>{ e.preventDefault(); nav.classList.add("open"); };
  const closeNav = (e)=>{ e?.preventDefault(); nav.classList.remove("open"); };

  openBtn.addEventListener("click", openNav);
  closeBtn?.addEventListener("click", closeNav);

  // Clicking a real nav link inside the overlay: let the browser navigate,
  // just visually close the overlay first — don't block or rewrite the href.
  nav.querySelectorAll("a").forEach(a=>{
    a.addEventListener("click", (e)=>{
      e.stopPropagation();
      nav.classList.remove("open");
    });
  });

  // Safety net: Escape key always closes it.
  document.addEventListener("keydown", (e)=>{
    if(e.key === "Escape") closeNav();
  });
}

/* ---------- Scroll to top button ---------- */
function initScrollTop(){
  const btn = document.querySelector(".scroll-top-btn");
  if(!btn) return;
  window.addEventListener("scroll", ()=>{
    btn.classList.toggle("show", window.scrollY > 600);
  }, {passive:true});
  btn.addEventListener("click", ()=>window.scrollTo({top:0,behavior:"smooth"}));
}

/* ---------- Counter animation ---------- */
function initCounters(){
  const counters = document.querySelectorAll("[data-counter]");
  if(!counters.length) return;
  const animate = (el)=>{
    const target = parseFloat(el.getAttribute("data-counter"));
    const suffix = el.getAttribute("data-suffix") || "";
    const obj = {val:0};
    gsap.to(obj,{
      val:target, duration:2, ease:"power2.out",
      onUpdate:()=>{ el.textContent = Math.floor(obj.val).toLocaleString() + suffix; }
    });
  };
  const io = new IntersectionObserver((entries)=>{
    entries.forEach(entry=>{
      if(entry.isIntersecting){
        animate(entry.target);
        io.unobserve(entry.target);
      }
    });
  }, {threshold:.4});
  counters.forEach(c=>io.observe(c));
}

/* ---------- FAQ accordion ---------- */
function initFaq(){
  document.querySelectorAll(".faq-item").forEach(item=>{
    const q = item.querySelector(".faq-q");
    q?.addEventListener("click", ()=>{
      const isActive = item.classList.contains("active");
      item.parentElement.querySelectorAll(".faq-item").forEach(i=>i.classList.remove("active"));
      if(!isActive) item.classList.add("active");
    });
  });
}

/* ---------- GSAP Hero entrance ---------- */
function initHeroAnim(){
  if(typeof gsap === "undefined") return;
  gsap.from(".hero-eyebrow",{opacity:0,y:20,duration:.8,ease:"power3.out",delay:.1});
  gsap.from(".hero h1",{opacity:0,y:30,duration:.9,ease:"power3.out",delay:.25});
  gsap.from(".hero .lead-sub",{opacity:0,y:30,duration:.9,ease:"power3.out",delay:.4});
  gsap.from(".hero .hero-cta-row",{opacity:0,y:24,duration:.9,ease:"power3.out",delay:.55});
  gsap.from(".hero-stats-row",{opacity:0,y:24,duration:.9,ease:"power3.out",delay:.7});
  gsap.from(".hero-card-photo",{opacity:0,scale:.92,duration:1.1,ease:"power3.out",delay:.3});
  gsap.from(".float-card.fc1",{opacity:0,x:-40,duration:1,ease:"power3.out",delay:.9});
  gsap.from(".float-card.fc2",{opacity:0,x:40,duration:1,ease:"power3.out",delay:1.05});

  /* gentle floating loop */
  gsap.to(".float-card.fc1",{y:-12,duration:2.6,ease:"sine.inOut",yoyo:true,repeat:-1,delay:1.4});
  gsap.to(".float-card.fc2",{y:-14,duration:3,ease:"sine.inOut",yoyo:true,repeat:-1,delay:1.6});
  gsap.to(".hero-orn.tl",{y:-16,rotation:4,duration:5,ease:"sine.inOut",yoyo:true,repeat:-1});
  gsap.to(".hero-orn.br",{y:14,rotation:-3,duration:6,ease:"sine.inOut",yoyo:true,repeat:-1});
}

/* ---------- Swiper sliders ---------- */
function initSwipers(){
  if(typeof Swiper === "undefined") return;

  if(document.querySelector(".profile-swiper-bride")){
    new Swiper(".profile-swiper-bride",{
      slidesPerView:1.05, spaceBetween:22, loop:false,
      breakpoints:{576:{slidesPerView:2},992:{slidesPerView:3},1200:{slidesPerView:4}},
      pagination:{el:".profile-swiper-bride .swiper-pagination",clickable:true},
    });
  }
  if(document.querySelector(".profile-swiper-groom")){
    new Swiper(".profile-swiper-groom",{
      slidesPerView:1.05, spaceBetween:22, loop:false,
      breakpoints:{576:{slidesPerView:2},992:{slidesPerView:3},1200:{slidesPerView:4}},
      pagination:{el:".profile-swiper-groom .swiper-pagination",clickable:true},
    });
  }
  if(document.querySelector(".story-swiper")){
    new Swiper(".story-swiper",{
      slidesPerView:1.05, spaceBetween:24, loop:true,
      autoplay:{delay:4500,disableOnInteraction:false},
      breakpoints:{768:{slidesPerView:2},1200:{slidesPerView:3}},
      pagination:{el:".story-swiper .swiper-pagination",clickable:true},
    });
  }
  if(document.querySelector(".testimonial-swiper")){
    new Swiper(".testimonial-swiper",{
      slidesPerView:1.05, spaceBetween:24, loop:true,
      autoplay:{delay:5000,disableOnInteraction:false},
      breakpoints:{768:{slidesPerView:2},1200:{slidesPerView:3}},
      pagination:{el:".testimonial-swiper .swiper-pagination",clickable:true},
    });
  }
  if(document.querySelector(".community-swiper")){
    new Swiper(".community-swiper",{
      slidesPerView:2.2, spaceBetween:16, loop:false,
      breakpoints:{576:{slidesPerView:3.2},768:{slidesPerView:4.2},1200:{slidesPerView:6}},
    });
  }
}

/* ---------- Form (static demo -> routes to WhatsApp) ---------- */
function initContactForm(){
  const form = document.querySelector(".js-contact-form");
  if(!form) return;
  form.addEventListener("submit", (e)=>{
    e.preventDefault();
    const name = form.querySelector("[name='name']")?.value || "";
    const phone = form.querySelector("[name='phone']")?.value || "";
    const looking = form.querySelector("[name='looking']")?.value || "";
    const msg = form.querySelector("[name='message']")?.value || "";
    const text = `Hi, I'm ${name} (${phone}). I'm looking for ${looking}. ${msg}`;
    window.open(buildWhatsAppLink(text), "_blank");
  });
}

/* ---------- Init ---------- */
document.addEventListener("DOMContentLoaded", ()=>{
  wireWhatsAppButtons();
  initHeaderScroll();
  initMobileNav();
  initScrollTop();
  initFaq();
  initContactForm();

  if(typeof AOS !== "undefined"){
    AOS.init({ duration:800, once:true, offset:60, easing:"ease-out-cubic" });
  }
  initHeroAnim();
  initCounters();
  initSwipers();
});
