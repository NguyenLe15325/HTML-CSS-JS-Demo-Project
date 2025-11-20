// Register GSAP plugins
gsap.registerPlugin(ScrollTrigger);

// Store animation reference for loop control
let loopAnimation;

// Demo 1: Basic to() animation
function demo1() {
  gsap.to("#box1", { 
    x: 300, 
    duration: 1, 
    ease: "power2.out" 
  });
}

function reset1() {
  gsap.to("#box1", { x: 0, duration: 0.5 });
}

// Demo 2: from() animation
function demo2() {
  gsap.fromTo("#box2",
    { opacity: 0, y: -100 },
    { opacity: 1, y: 0, duration: 1, ease: "bounce.out" }
  );
}

// Demo 3: Multiple properties
function demo3() {
  gsap.to("#box3", {
    x: 250,
    rotation: 360,
    scale: 1.5,
    duration: 2,
    ease: "bounce.out"
  });
}

function reset3() {
  gsap.to("#box3", {
    x: 0,
    rotation: 0,
    scale: 1,
    duration: 0.5
  });
}

// Demo 4: Timeline
function demo4() {
  const tl = gsap.timeline();
  tl.to(".timeline-box", { 
    x: 200, 
    duration: 0.5,
    stagger: 0.2,
    ease: "power2.out"
  });
}

function reset4() {
  gsap.to(".timeline-box", { x: 0, duration: 0.5 });
}

// Demo 5: Stagger
function demo5() {
  gsap.to(".stagger-box", {
    y: -50,
    duration: 0.5,
    stagger: 0.1,
    ease: "power2.out",
    yoyo: true,
    repeat: 1
  });
}

function reset5() {
  gsap.to(".stagger-box", { y: 0, duration: 0.3 });
}

// Demo 6: ScrollTrigger (auto-initializes)
gsap.to("#scrollBox", {
  rotation: 720,
  scale: 1.5,
  scrollTrigger: {
    trigger: "#scrollBox",
    start: "top center",
    end: "bottom top",
    scrub: 1,
    scroller: "#scroll-container"
  }
});

// Demo 7: Repeat & Yoyo
function demo7() {
  if (loopAnimation) loopAnimation.kill();
  loopAnimation = gsap.to("#box7", {
    x: 200,
    duration: 1,
    repeat: -1,
    yoyo: true,
    ease: "power1.inOut"
  });
}

function stop7() {
  if (loopAnimation) {
    loopAnimation.kill();
    gsap.to("#box7", { x: 0, duration: 0.5 });
  }
}

// Demo 8: gsap.set()
function demo8() {
  gsap.set("#box8", { 
    x: 200, 
    backgroundColor: "#ff6b6b",
    scale: 1.2
  });
}

function reset8() {
  gsap.set("#box8", { 
    x: 0, 
    backgroundColor: "#667eea",
    scale: 1
  });
}

// Demo 9: Callbacks
function demo9() {
  const box = document.querySelector("#box9");
  gsap.to("#box9", {
    x: 200,
    duration: 1,
    ease: "power2.out",
    onStart: () => {
      box.textContent = "Starting...";
      console.log("Animation started");
    },
    onUpdate: () => {
      const progress = Math.round(gsap.getProperty("#box9", "x"));
      box.textContent = `${progress}px`;
    },
    onComplete: () => {
      box.textContent = "Done!";
      console.log("Animation completed");
    }
  });
}

function reset9() {
  gsap.to("#box9", { 
    x: 0, 
    duration: 0.5,
    onComplete: () => {
      document.querySelector("#box9").textContent = "Callbacks";
    }
  });
}

// Demo 10: Delay
function demo10() {
  gsap.to("#box10", {
    x: 200,
    duration: 2,
    delay: 0.5,
    ease: "elastic.out(1, 0.3)"
  });
}

function reset10() {
  gsap.to("#box10", { x: 0, duration: 0.5 });
}

// Demo 11: FromTo
function demo11() {
  gsap.fromTo("#box11",
    { x: -100, opacity: 0 },
    { x: 200, opacity: 1, duration: 1, ease: "power2.out" }
  );
}

function reset11() {
  gsap.to("#box11", { x: 0, opacity: 1, duration: 0.5 });
}

// Demo 12: Text Animation
function demo12() {
  const text = document.querySelector("#animatedText");
  const originalText = "Hello GSAP!";
  const chars = originalText.split('');
  
  text.innerHTML = chars.map(char => 
    `<span style="display:inline-block">${char === ' ' ? '&nbsp;' : char}</span>`
  ).join('');
  
  gsap.from(text.children, {
    opacity: 0,
    y: -50,
    rotationX: -90,
    stagger: 0.05,
    ease: "back.out",
    duration: 0.8
  });
}

// Utility Functions (Reusable animations)
function fadeIn(element, options = {}) {
  return gsap.from(element, {
    opacity: 0,
    y: 20,
    duration: 0.6,
    ease: "power2.out",
    ...options
  });
}

function slideIn(element, direction = "left") {
  const xValue = direction === "left" ? -100 : 100;
  return gsap.from(element, {
    x: xValue,
    opacity: 0,
    duration: 0.8,
    ease: "power3.out"
  });
}

function scaleIn(element, options = {}) {
  return gsap.from(element, {
    scale: 0,
    opacity: 0,
    duration: 0.5,
    ease: "back.out(1.7)",
    ...options
  });
}

// Initialize animations on page load
document.addEventListener('DOMContentLoaded', () => {
  console.log("GSAP Tutorial loaded!");
  console.log("Use the buttons to trigger animations");
});