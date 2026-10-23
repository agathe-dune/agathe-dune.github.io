const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;
const header = document.querySelector(".site-header");

/* Découpes pour les animations de texte */
function splitChars(el) {
  const text = el.textContent;
  el.textContent = "";
  [...text].forEach((c, i) => {
    const s = document.createElement("span");
    s.className = "char";
    s.style.setProperty("--i", i);
    s.textContent = c === " " ? "\u00a0" : c;
    el.append(s);
  });
}
if (!reduceMotion) {
  document.querySelectorAll(".section__title, .contact__title").forEach(t => {
    t.setAttribute("aria-label", t.textContent);
    t.innerHTML = `<span class="mask" aria-hidden="true"><span>${t.innerHTML}</span></span>`;
  });
  document.querySelectorAll(".name__line > span").forEach(l => { l.closest("h1").setAttribute("aria-label", "Agathe Dune"); splitChars(l); });
  document.querySelectorAll(".initials").forEach(splitChars);
}

/* Apparition au défilement */
const revealables = document.querySelectorAll("[data-reveal]");
if ("IntersectionObserver" in window && !reduceMotion) {
  const reveal = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (!e.isIntersecting) return;
      e.target.classList.add("is-in");
      reveal.unobserve(e.target);
    });
  }, { rootMargin: "0px 0px -8% 0px" });
  document.querySelectorAll(".cards, .wall, .series, .case, .facts").forEach(group => {
    group.querySelectorAll("[data-reveal]").forEach((el, i) => el.style.setProperty("--d", `${(i % 4) * 0.1}s`));
  });
  revealables.forEach(el => reveal.observe(el));
  const lines = new IntersectionObserver(entries => entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add("is-lined"); lines.unobserve(e.target); }
  }));
  document.querySelectorAll(".section").forEach(s => lines.observe(s));
} else {
  revealables.forEach(el => el.classList.add("is-in"));
  document.querySelectorAll(".section").forEach(s => s.classList.add("is-lined"));
}

/* Inclinaison des cartes 3D et boutons magnétiques (souris uniquement) */
if (!reduceMotion && matchMedia("(hover: hover) and (pointer: fine)").matches) {
  document.querySelectorAll(".card__link").forEach(link => {
    const media = link.querySelector(".card__media");
    link.addEventListener("pointermove", e => {
      const r = media.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      media.style.transform = `perspective(900px) rotateY(${x * 8}deg) rotateX(${-y * 8}deg)`;
    });
    link.addEventListener("pointerleave", () => { media.style.transform = ""; });
  });
  document.querySelectorAll(".button, .counter, .hero__links a").forEach(el => {
    el.classList.add("magnetic");
    el.addEventListener("pointermove", e => {
      const r = el.getBoundingClientRect();
      el.style.translate = `${(e.clientX - r.left - r.width / 2) * 0.2}px ${(e.clientY - r.top - r.height / 2) * 0.3}px`;
    });
    el.addEventListener("pointerleave", () => { el.style.translate = ""; });
  });
}

/* Compteur de projets */
const count = document.querySelector("[data-count]");
if (count) {
  const total = new Set([...document.querySelectorAll("[data-project]")].map(el => el.dataset.project)).size;
  if (reduceMotion || !("IntersectionObserver" in window)) count.textContent = total;
  else {
    const run = new IntersectionObserver(([e]) => {
      if (!e.isIntersecting) return;
      run.disconnect();
      const start = performance.now();
      const tick = t => {
        const p = Math.min((t - start) / 900, 1);
        count.textContent = Math.round(total * (1 - Math.pow(1 - p, 3)));
        if (p < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
    });
    run.observe(count);
  }
}

/* En-tête : filet au défilement, se cache en descendant */
let lastY = scrollY;
const floats = [...document.querySelectorAll("[data-parallax]")];
const progress = document.querySelector(".progress");
let ticking = false;
function onScroll() {
  const y = scrollY;
  header.classList.toggle("is-scrolled", y > 10);
  header.classList.toggle("is-past-hero", y > innerHeight * 0.35);
  header.classList.toggle("is-hidden", y > lastY && y > 400 && !header.contains(document.activeElement));
  lastY = y;
  progress.style.setProperty("--p", y / Math.max(1, document.documentElement.scrollHeight - innerHeight));
  if (!reduceMotion) floats.forEach(f => { f.style.transform = `translateY(${y * f.dataset.parallax}px)`; });
  ticking = false;
}
addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }, { passive: true });
onScroll();

/* Fleurs du pied de page : elles poussent à l'arrivée */
const contact = document.querySelector(".contact");
if (contact) {
  if (reduceMotion || !("IntersectionObserver" in window)) contact.classList.add("is-grown");
  else {
    const grow = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { contact.classList.add("is-grown"); grow.disconnect(); }
    }, { threshold: 0.25 });
    grow.observe(contact);
  }
}

/* Pose : le sketch se dévoile depuis le curseur */
document.querySelectorAll(".pose").forEach(pose => {
  const at = e => {
    const r = pose.getBoundingClientRect();
    if (!r.width || !r.height) return;
    pose.style.setProperty("--x", `${((e.clientX - r.left) / r.width) * 100}%`);
    pose.style.setProperty("--y", `${((e.clientY - r.top) / r.height) * 100}%`);
  };
  pose.addEventListener("pointerenter", e => { if (e.pointerType === "mouse") { at(e); pose.classList.add("is-sketch"); } });
  pose.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") { at(e); pose.classList.remove("is-sketch"); } });
  pose.addEventListener("click", e => { if (e.pointerType !== "mouse") { at(e); pose.classList.toggle("is-sketch"); } });
});

/* Menu mobile */
const toggle = document.querySelector(".menu-toggle");
function setMenu(open) {
  header.classList.toggle("is-open", open);
  toggle.setAttribute("aria-expanded", open);
  toggle.textContent = open ? "Fermer" : "Menu";
}
toggle.addEventListener("click", () => setMenu(!header.classList.contains("is-open")));
header.querySelectorAll("nav a").forEach(a => a.addEventListener("click", () => setMenu(false)));
addEventListener("keydown", e => { if (e.key === "Escape" && header.classList.contains("is-open")) { setMenu(false); toggle.focus(); } });

/* Lien actif dans la navigation */
const links = [...document.querySelectorAll(".site-header nav a")];
const spy = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (!e.isIntersecting) return;
    links.forEach(a => a.hash === "#" + e.target.id ? a.setAttribute("aria-current", "true") : a.removeAttribute("aria-current"));
  });
}, { rootMargin: "-45% 0px -50% 0px" });
links.map(a => document.getElementById(a.hash.slice(1))).filter(Boolean).forEach(t => spy.observe(t));

/* 3D : model-viewer */
function setupViewer(v) {
  if (reduceMotion) { v.removeAttribute("auto-rotate"); v.removeAttribute("autoplay"); }
  v.addEventListener("load", () => {
    for (const m of v.model.materials) {
      const s = m.pbrMetallicRoughness.baseColorTexture?.texture?.sampler;
      if (s) { s.setMagFilter(9728); s.setMinFilter(9728); }
    }
  });
}
document.querySelectorAll("model-viewer").forEach(setupViewer);
function loadModelViewer() {
  if (customElements.get("model-viewer") || document.querySelector("script[data-mv]")) return;
  const s = document.createElement("script");
  s.type = "module";
  s.dataset.mv = "";
  s.src = "https://cdn.jsdelivr.net/npm/@google/model-viewer@3.5.0/dist/model-viewer.min.js";
  document.head.append(s);
}
addEventListener("load", () => ("requestIdleCallback" in window ? requestIdleCallback(loadModelViewer, { timeout: 2000 }) : setTimeout(loadModelViewer, 800)));

/* Lightbox */
const box = document.querySelector(".lightbox");
const boxImg = box.querySelector("img");
let items = [], index = 0;

function show(i) {
  index = (i + items.length) % items.length;
  const a = items[index];
  boxImg.classList.add("is-loading");
  boxImg.onload = () => boxImg.classList.remove("is-loading");
  boxImg.src = a.href;
  boxImg.alt = a.querySelector("img").alt;
  box.querySelector(".lb-caption").textContent = a.dataset.caption;
  box.querySelector(".lb-count").textContent = items.length > 1 ? `${index + 1} / ${items.length}` : "";
  box.querySelectorAll(".lb-prev, .lb-next").forEach(b => (b.hidden = items.length < 2));
}
document.addEventListener("click", e => {
  const a = e.target.closest("a[data-zoom]");
  if (!a) return;
  e.preventDefault();
  items = [...a.closest("[data-gallery]").querySelectorAll("a[data-zoom]")];
  show(items.indexOf(a));
  box.showModal();
});
box.querySelector(".lb-prev").addEventListener("click", () => show(index - 1));
box.querySelector(".lb-next").addEventListener("click", () => show(index + 1));
box.querySelector(".lb-close").addEventListener("click", () => box.close());
box.addEventListener("click", e => { if (e.target === box) box.close(); });
box.addEventListener("keydown", e => {
  if (e.key === "ArrowLeft") show(index - 1);
  if (e.key === "ArrowRight") show(index + 1);
});
box.addEventListener("close", () => boxImg.removeAttribute("src"));

/* Fiche projet */
const sheet = document.querySelector(".sheet");
const sheetBody = sheet.querySelector(".sheet__body");
const sheetNext = sheet.querySelector(".sheet__next");
const projects = [...document.querySelectorAll("[data-sheet]")];

function openSheet(id) {
  const tpl = document.getElementById("sheet-" + id);
  if (!tpl) return;
  sheetBody.replaceChildren(tpl.content.cloneNode(true));
  const title = sheetBody.querySelector(".sheet__title");
  const titleBtn = document.createElement("button");
  titleBtn.type = "button";
  titleBtn.className = "sheet__title-btn";
  titleBtn.setAttribute("aria-label", `${title.textContent}, revenir aux projets`);
  titleBtn.innerHTML = `<span class="arrow" aria-hidden="true">←</span>`;
  titleBtn.append(title.textContent);
  titleBtn.addEventListener("click", closeSheet);
  title.replaceChildren(titleBtn);
  sheetBody.querySelectorAll(".sheet__head > *, .process > li, .sheet__note").forEach((el, i) => {
    el.classList.add("js-in");
    el.style.setProperty("--d", `${Math.min(i, 8) * 0.06}s`);
  });
  sheetBody.querySelectorAll("model-viewer").forEach(setupViewer);

  const i = projects.findIndex(p => p.dataset.sheet === id);
  const next = projects[(i + 1) % projects.length];
  sheetNext.innerHTML = "";
  const a = document.createElement("a");
  a.className = "next-link";
  a.href = "#projet-" + next.dataset.sheet;
  a.innerHTML = `<span>Projet suivant</span><strong></strong>`;
  a.querySelector("strong").append(next.querySelector(".card__title").textContent, Object.assign(document.createElement("span"), { className: "arrow", textContent: "→", ariaHidden: "true" }));
  a.addEventListener("click", e => { e.preventDefault(); openSheet(next.dataset.sheet); });
  sheetNext.append(a);

  history.replaceState(null, "", "#projet-" + id);
  if (!sheet.open) sheet.showModal();
  sheet.scrollTo(0, 0);
  sheet.querySelector(".sheet__close").focus({ focusVisible: false });
}
projects.forEach(p => p.addEventListener("click", e => { e.preventDefault(); openSheet(p.dataset.sheet); }));
function afterSheetClose() {
  if (!location.hash.startsWith("#projet-")) return;
  const id = location.hash.slice(8);
  history.replaceState(null, "", location.pathname + location.search);
  projects.find(p => p.dataset.sheet === id)?.focus();
}
function closeSheet() { sheet.close(); afterSheetClose(); }
sheet.querySelector(".sheet__close").addEventListener("click", closeSheet);
sheet.querySelector(".sheet__back").addEventListener("click", closeSheet);
sheet.addEventListener("close", afterSheetClose);
if (location.hash.startsWith("#projet-")) openSheet(location.hash.slice(8));
