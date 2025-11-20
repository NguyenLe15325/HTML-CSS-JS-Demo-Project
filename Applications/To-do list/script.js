document.addEventListener('DOMContentLoaded', () => {
    // Get DOM elements
    const taskInput = document.getElementById('taskInput');
    const addButton = document.getElementById('addButton');
    const taskList = document.getElementById('taskList');

    // Load tasks from local storage when the page loads
    loadTasks();

    // Event listeners
    addButton.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        // Check if the pressed key is Enter (key code 13)
        if (e.key === 'Enter') {
            addTask();
        }
    });
    // Use event delegation on the task list
    taskList.addEventListener('click', handleTaskActions);

    /**
     * Handles adding a new task to the list.
     */
    function addTask() {
        const taskText = taskInput.value.trim();

        if (taskText === "") {
            alert("Please enter a task!");
            return;
        }

        // Create the task list item
        createTaskElement(taskText, false); // false means not completed

        // Save the updated list to local storage
        saveTasks();

        // Clear the input field
        taskInput.value = "";
        taskInput.focus(); // Keep focus on input for quick entry
    }

    /**
     * Creates and appends an individual task list item.
     * @param {string} text - The text of the task.
     * @param {boolean} isCompleted - Whether the task is completed.
     */
    function createTaskElement(text, isCompleted) {
        const listItem = document.createElement('li');
        listItem.className = 'task-item';

        // Set completed class if necessary (for styling)
        if (isCompleted) {
            listItem.classList.add('completed');
        }

        // Task Text Span
        const taskSpan = document.createElement('span');
        taskSpan.textContent = text;

        // Delete Button
        const deleteButton = document.createElement('button');
        deleteButton.className = 'delete-btn';
        deleteButton.textContent = 'Delete';

        // Append elements to the list item
        listItem.appendChild(taskSpan);
        listItem.appendChild(deleteButton);

        // Append the new list item to the main task list
        taskList.appendChild(listItem);
    }

    /**
     * Handles task completion toggling and deletion using event delegation.
     * @param {Event} e - The click event.
     */
    function handleTaskActions(e) {
        const target = e.target;
        
        if (target.classList.contains('delete-btn')) {
            // Delete the task
            const listItem = target.closest('.task-item');
            listItem.remove();
            saveTasks();

        } else if (target.tagName === 'SPAN') {
            // Toggle task completion
            const listItem = target.closest('.task-item');
            listItem.classList.toggle('completed');
            saveTasks();
        }
    }

    /**
     * Saves the current list of tasks to the browser's Local Storage.
     */
    function saveTasks() {
        const tasks = [];
        document.querySelectorAll('#taskList .task-item').forEach(item => {
            tasks.push({
                text: item.querySelector('span').textContent,
                completed: item.classList.contains('completed')
            });
        });
        localStorage.setItem('tasks', JSON.stringify(tasks));
    }

    /**
     * Loads tasks from Local Storage and renders them on the page.
     */
    function loadTasks() {
        const storedTasks = localStorage.getItem('tasks');
        if (storedTasks) {
            const tasks = JSON.parse(storedTasks);
            tasks.forEach(task => {
                createTaskElement(task.text, task.completed);
            });
        }
    }
});