// DOM element references
const hourHand = document.getElementById('hour');
const minuteHand = document.getElementById('minute');
const secondHand = document.getElementById('second');
const digitalDisplay = document.getElementById('digital-display');

/**
 * Pads a single-digit number with a leading zero for the digital display.
 * @param {number} num - The number to pad.
 * @returns {string|number} The padded string or original number.
 */
function padZero(num) {
    return num < 10 ? `0${num}` : num;
}

/**
 * Main function to get the current time and set the hand rotations.
 */
function updateClock() {
    const now = new Date();
    const hours = now.getHours();
    const minutes = now.getMinutes();
    const seconds = now.getSeconds();

    // --- Hand Rotation Calculations ---
    
    // 1. Second Hand: 6 degrees per second (360 / 60)
    const secondsDeg = (seconds / 60) * 360; 
    secondHand.style.transform = `translateX(-50%) rotate(${secondsDeg}deg)`;

    // 2. Minute Hand: 6 degrees per minute + offset based on seconds
    // The offset ensures the minute hand moves gradually, not just on the minute mark.
    const minutesDeg = ((minutes / 60) * 360) + ((seconds / 60) * 6);
    minuteHand.style.transform = `translateX(-50%) rotate(${minutesDeg}deg)`;

    // 3. Hour Hand: 30 degrees per hour + offset based on minutes
    // (hours % 12) converts 24h format to 12h format.
    const hoursDeg = ((hours % 12) / 12) * 360 + ((minutes / 60) * 30);
    hourHand.style.transform = `translateX(-50%) rotate(${hoursDeg}deg)`;
    
    // --- Digital Display Update ---
    const ampm = hours >= 12 ? 'PM' : 'AM';
    // Use modulo 12, but if the result is 0 (midnight or noon), display 12.
    const displayHours = hours % 12 || 12; 
    
    digitalDisplay.textContent = `${padZero(displayHours)}:${padZero(minutes)}:${padZero(seconds)} ${ampm}`;
}

// Run the clock update once the window is loaded, then set an interval for real-time updates
window.onload = function() {
    updateClock();
    // Update every 1000 milliseconds (1 second)
    setInterval(updateClock, 1000); 
};
