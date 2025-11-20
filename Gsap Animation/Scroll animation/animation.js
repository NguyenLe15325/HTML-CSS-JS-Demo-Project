// 1. Register the plugin (Mandatory in a modular/professional setup)
gsap.registerPlugin(ScrollTrigger);

// 2. Initialize the Timeline
// We use a Timeline to orchestrate the sequential steps
const masterTimeline = gsap.timeline({
    // 3. Attach the ScrollTrigger to the Timeline
    scrollTrigger: {
        trigger: "#scroll-pin-container", // The element that controls the scroll area
        start: "top top", // Start the animation when the top of the trigger hits the top of the viewport
        end: "bottom+=3000", // The animation lasts for 3000 pixels of scrolling distance
        pin: true, // Keep the #scroll-pin-container fixed during the animation duration
        scrub: 1, // Smoothly link the scroll position to the timeline progress (1 second lag)
        // markers: true, // Uncomment for debugging markers
    },
    defaults: { duration: 1.5, ease: "power2.inOut" } // Default settings for tweens in this timeline
});

// 4. Define the Animation Sequence

// Step 1: Reveal the main title (takes 1.5 units of scroll)
masterTimeline.to("#main-title", { opacity: 1, y: 0 }, 0); // Start at time 0

// Step 2: Reveal Step 1 card (starts after the title is halfway done for a smooth transition)
masterTimeline.to("#step-1", { opacity: 1, x: 0 }, "<0.5"); // "<0.5" means 0.5 units after the previous tween started

// Step 3: Reveal Step 2 card (starts when Step 1 is halfway complete for a small overlap)
masterTimeline.to("#step-2", { opacity: 1, x: 0 }, "-=0.75"); // "-=0.75" means 0.75 units before the previous tween ends

// Step 4: Reveal Step 3 card (starts after Step 2 finishes)
masterTimeline.to("#step-3", { opacity: 1, scale: 1, rotation: 0 }, "+=0.5"); // "+=0.5" adds a small pause after Step 2

// Step 5: (Optional) A final dramatic move for all elements before unpinning
masterTimeline.to("#scroll-pin-container > *", { 
    scale: 0.95, 
    opacity: 0.2, 
    y: -100, 
    duration: 2.5, 
    ease: "power1.in" 
}, "+=1"); // A long, slow exit after a 1-unit pause