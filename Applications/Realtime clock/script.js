// --- JavaScript Logic (Contained in script.js) ---
// IIFE for encapsulation
(function() {
    // --- DOM Elements ---
    const currentTimeDisplay = document.getElementById('current-time-display');
    const hourSelect = document.getElementById('alarm-hour');
    const minuteSelect = document.getElementById('alarm-minute');
    const ampmSelect = document.getElementById('alarm-ampm');
    const setAlarmBtn = document.getElementById('set-alarm-btn');
    const alarmsList = document.getElementById('alarms-list');
    const noAlarmsMessage = document.getElementById('no-alarms-message');
    const alarmCount = document.getElementById('alarm-count');
    const clockContainer = document.getElementById('clock-container');
    const alarmAudio = document.getElementById('alarm-audio');
    
    // --- Modal Elements ---
    const messageModal = document.getElementById('message-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const modalCloseBtn = document.getElementById('modal-close-btn');

    // --- State and Intervals ---
    let alarms = [];
    let timeInterval;
    
    // --- Utility Functions ---

    /**
     * Shows a custom modal message instead of using alert().
     * @param {string} title - The title of the message.
     * @param {string} body - The main body of the message.
     */
    function showMessage(title, body) {
        modalTitle.textContent = title;
        modalBody.textContent = body;
        messageModal.classList.remove('hidden');
        // Set the primary action for the OK button
        modalCloseBtn.onclick = () => {
            stopRinging();
            messageModal.classList.add('hidden');
        };
    }

    /**
     * Stops the alarm sound and visual effects, and removes the alarm (one-time trigger).
     */
    function stopRinging() {
        // Find the alarm that is currently ringing 
        const ringingAlarmIndex = alarms.findIndex(alarm => alarm.isRinging);
        
        // FIX: The alarm must be removed when dismissed to prevent it from re-triggering 
        // every second for the rest of the minute. This makes it a one-time alarm.
        if (ringingAlarmIndex !== -1) {
            alarms.splice(ringingAlarmIndex, 1);
        }

        clockContainer.classList.remove('ringing');
        try {
            alarmAudio.pause();
            alarmAudio.muted = true;
            alarmAudio.currentTime = 0; // Rewind the audio
        } catch (e) {
            console.warn("Could not stop audio playback.", e);
        }
        renderAlarms();
    }


    /**
     * Formats a number to have a leading zero if less than 10.
     * @param {number} num - The number to format.
     * @returns {string} The formatted string.
     */
    const formatTimeComponent = (num) => String(num).padStart(2, '0');

    // --- Time Display and Alarm Check Logic ---

    /**
     * Updates the current time display and checks for active alarms.
     */
    function updateTime() {
        const now = new Date();
        let hours = now.getHours();
        const minutes = formatTimeComponent(now.getMinutes());
        const seconds = formatTimeComponent(now.getSeconds());
        let ampm = 'AM';

        if (hours >= 12) {
            ampm = 'PM';
            if (hours > 12) {
                hours -= 12;
            }
        }
        if (hours === 0) {
            hours = 12;
        }
        hours = formatTimeComponent(hours);

        const currentTimeStr = `${hours}:${minutes}:${seconds} ${ampm}`;
        currentTimeDisplay.textContent = currentTimeStr;
        
        checkAlarms(hours, minutes, ampm);
    }

    /**
     * Checks if any set alarm matches the current time.
     * @param {string} currentHour - Current hour (12h format, padded).
     * @param {string} currentMinute - Current minute (padded).
     * @param {string} currentAmpm - Current AM/PM.
     */
    function checkAlarms(currentHour, currentMinute, currentAmpm) {
        const triggerTime = `${currentHour}:${currentMinute} ${currentAmpm}`;
        
        // Check if any alarm should be triggered
        const activeAlarmIndex = alarms.findIndex(alarm => 
            // Note: We only check minutes to avoid triggering on every second of the alarm minute
            // The alarm will now only trigger once because it is removed in stopRinging()
            alarm.time.startsWith(`${currentHour}:${currentMinute}`) && alarm.time.endsWith(currentAmpm) && !alarm.isRinging
        );

        if (activeAlarmIndex !== -1) {
            // Trigger alarm
            const alarmToTrigger = alarms[activeAlarmIndex];
            alarmToTrigger.isRinging = true;

            // 1. Visual/CSS effect
            clockContainer.classList.add('ringing');
            
            // 2. Audio (if available, this will try to unmute and play)
            try {
                alarmAudio.muted = false;
                // Since a real URL is unavailable, this will likely fail or do nothing, 
                // but this is the standard implementation.
                alarmAudio.play().catch(e => console.log("Audio play failed, requires user interaction or a valid source.", e));
            } catch (e) {
                console.error("Audio error:", e);
            }
            
            // 3. Notification via modal
            showMessage("🔔 ALARM RINGING! 🔔", `It's time for the alarm set at ${alarmToTrigger.displayTime}.`);

            // Re-render the list to show the 'Ringing' status
            renderAlarms();
        }

        // Ensure effects are stopped if no alarm is marked as ringing (safety check)
        const isAnyAlarmRinging = alarms.some(alarm => alarm.isRinging);
        if (!isAnyAlarmRinging) {
            clockContainer.classList.remove('ringing');
            alarmAudio.pause();
            alarmAudio.muted = true;
        }
    }

    // --- Alarm Setup Functions ---

    /**
     * Populates the hour and minute dropdowns.
     */
    function populateTimeOptions() {
        // Hours (1-12)
        for (let i = 1; i <= 12; i++) {
            const hour = formatTimeComponent(i);
            const option = `<option value="${hour}">${hour}</option>`;
            hourSelect.insertAdjacentHTML('beforeend', option);
        }

        // Minutes (00-59)
        for (let i = 0; i < 60; i++) {
            const minute = formatTimeComponent(i);
            const option = `<option value="${minute}">${minute}</option>`;
            minuteSelect.insertAdjacentHTML('beforeend', option);
        }
    }
    
    /**
     * Renders the list of active alarms in the UI.
     */
    function renderAlarms() {
        alarmsList.innerHTML = '';
        alarmCount.textContent = alarms.length;

        if (alarms.length === 0) {
            noAlarmsMessage.classList.remove('hidden');
            return;
        }
        noAlarmsMessage.classList.add('hidden');

        // Sort alarms chronologically (simple string comparison works for HH:MM AM/PM format)
        alarms.sort((a, b) => a.time.localeCompare(b.time));

        alarms.forEach((alarm, index) => {
            const listItem = document.createElement('div');
            listItem.className = `flex justify-between items-center p-4 rounded-lg shadow-md transition duration-300 
                                  ${alarm.isRinging ? 'bg-red-900 border-2 border-red-500 ringing' : 'bg-gray-700 hover:bg-gray-600'}`;
            listItem.dataset.time = alarm.time;

            // SVG Bell Icon for status
            const bellIcon = '<svg class="w-5 h-5 mr-1" fill="currentColor" viewBox="0 0 20 20"><path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6zM10 18a3 3 0 01-3-3h6a3 3 0 01-3 3z"></path></svg>';
            
            const status = alarm.isRinging ? 
                `<span class="text-red-400 font-bold flex items-center">${bellIcon} Ringing...</span>` : 
                '<span class="text-green-400 font-semibold">Active</span>';

            listItem.innerHTML = `
                <div class="flex flex-col">
                    <span class="text-2xl font-mono text-indigo-300">${alarm.displayTime}</span>
                    ${status}
                </div>
                <button class="delete-alarm-btn px-4 py-2 bg-red-600 text-white font-medium rounded-lg hover:bg-red-500 transition duration-300 transform hover:scale-105" data-index="${index}">
                    Delete
                </button>
            `;

            // Use the alarm's unique ID for tracking deletes instead of the array index
            listItem.querySelector('.delete-alarm-btn').addEventListener('click', () => deleteAlarm(alarm.id));

            alarmsList.appendChild(listItem);
        });
    }

    /**
     * Handles the setting of a new alarm.
     */
    function setAlarm() {
        const hour = hourSelect.value;
        const minute = minuteSelect.value;
        const ampm = ampmSelect.value;

        if (!hour || !minute || !ampm) {
            showMessage("Input Error", "Please select a valid hour, minute, and AM/PM value.");
            return;
        }
        
        const alarmTime = `${hour}:${minute} ${ampm}`;
        
        // Check for duplicates
        if (alarms.some(alarm => alarm.time === alarmTime)) {
            showMessage("Duplicate Alarm", `An alarm is already set for ${alarmTime}.`);
            return;
        }

        const newAlarm = {
            id: crypto.randomUUID(), // Use a UUID for stable ID (better than Date.now())
            time: alarmTime,
            displayTime: `${hour}:${minute} ${ampm}`,
            isRinging: false
        };

        alarms.push(newAlarm);
        renderAlarms();
        showMessage("Success", `Alarm set for ${alarmTime}.`);

        // Reset selects
        hourSelect.value = "";
        minuteSelect.value = "";
        ampmSelect.value = "";
    }

    /**
     * Deletes an alarm from the list based on its ID.
     * @param {string} id - The unique ID of the alarm to delete.
     */
    function deleteAlarm(id) {
        const indexToDelete = alarms.findIndex(alarm => alarm.id === id);
        if (indexToDelete === -1) return;

        const deletedAlarm = alarms.splice(indexToDelete, 1)[0];
        
        // Stop effects if the alarm was ringing
        if (deletedAlarm && deletedAlarm.isRinging) {
            stopRinging();
            messageModal.classList.add('hidden'); 
        }

        renderAlarms();
    }

    // --- Initialization ---

    function init() {
        // 1. Populate time selection dropdowns
        populateTimeOptions();

        // 2. Set up event listeners
        setAlarmBtn.addEventListener('click', setAlarm);
        
        // 3. Start the continuous time update
        timeInterval = setInterval(updateTime, 1000);
        
        // 4. Initial update (to show time immediately)
        updateTime();
        renderAlarms();

        // 5. Setup modal listener to stop ringing when user dismisses the notification
        messageModal.addEventListener('click', (event) => {
            // Check if the click was on the close button or the backdrop
            if (event.target === modalCloseBtn || event.target === messageModal) {
                stopRinging();
                messageModal.classList.add('hidden');
            }
        });

        // NOTE FOR USER: The audio element is currently empty. 
        // To hear sound, you must add a source file (e.g., alarm.mp3) to your index.html:
        // <audio id="alarm-audio" loop muted src="alarm.mp3"></audio>
        console.warn("⚠️ Audio is silent: Please add a valid 'src' attribute to the <audio> tag in index.html to hear the alarm sound.");
    }

    // Start the application after the DOM is loaded
    window.onload = init;
})();
