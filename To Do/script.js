document.addEventListener('DOMContentLoaded', () => {
    
    const taskInput = document.getElementById('task-input');
    const addBtn = document.getElementById('add-btn');
    const taskList = document.getElementById('task-list');
    const filterBtns = document.querySelectorAll('.filter-btn');
    const themeToggle = document.getElementById('theme-toggle');
    const dateDisplay = document.getElementById('date-display');
    const emptyState = document.getElementById('empty-state');
    
    
    const editModal = document.getElementById('edit-modal');
    const editInput = document.getElementById('edit-input');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const cancelEditBtn = document.getElementById('cancel-edit-btn');

    
    let tasks = JSON.parse(localStorage.getItem('smartTasks')) || [];
    let currentFilter = 'all';
    let editingId = null;

    
    renderTasks();
    updateDate();
    loadTheme();

    
    
    
    addBtn.addEventListener('click', addTask);
    taskInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addTask();
    });

    
    themeToggle.addEventListener('click', toggleTheme);

    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            filterBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.dataset.filter;
            renderTasks();
        });
    });

    
    saveEditBtn.addEventListener('click', () => {
        if (editInput.value.trim() !== '') {
            updateTask(editingId, editInput.value.trim());
        }
        closeModal();
    });

    cancelEditBtn.addEventListener('click', closeModal);
    
    
    editModal.addEventListener('click', (e) => {
        if (e.target === editModal) closeModal();
    });

    
    taskList.addEventListener('click', (e) => {
        const target = e.target;
        const taskItem = target.closest('.task-item');
        
        if (!taskItem) return;
        
        const id = parseInt(taskItem.getAttribute('data-id'));

        
        if (target.closest('.task-content')) {
            toggleComplete(id);
        }
        
        else if (target.closest('.edit-btn')) {
            editTask(id);
        }
    
        else if (target.closest('.delete-btn')) {
            deleteTask(id);
        }
    });

    

    function addTask() {
        const text = taskInput.value.trim();
        if (text === '') return;

        const newTask = {
            id: Date.now(),
            text: text,
            completed: false
        };

        tasks.push(newTask);
        saveToLocalStorage();
        renderTasks();
        taskInput.value = '';
        taskInput.focus();
    }

    function deleteTask(id) {
        const taskElement = document.querySelector(`[data-id="${id}"]`);
        
        
        if (taskElement) {
            taskElement.classList.add('removing');
            taskElement.addEventListener('animationend', () => {
                tasks = tasks.filter(task => task.id !== id);
                saveToLocalStorage();
                renderTasks();
            });
        } else {
            
            tasks = tasks.filter(task => task.id !== id);
            saveToLocalStorage();
            renderTasks();
        }
    }

    function toggleComplete(id) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, completed: !task.completed };
            }
            return task;
        });
        saveToLocalStorage();
        renderTasks();
    }

    function editTask(id) {
        const task = tasks.find(t => t.id === id);
        if (task) {
            editingId = id;
            editInput.value = task.text;
            editModal.classList.add('active');
            editInput.focus();
        }
    }

    function updateTask(id, newText) {
        tasks = tasks.map(task => {
            if (task.id === id) {
                return { ...task, text: newText };
            }
            return task;
        });
        saveToLocalStorage();
        renderTasks();
    }

    function closeModal() {
        editModal.classList.remove('active');
        editingId = null;
        editInput.value = '';
    }

    function saveToLocalStorage() {
        localStorage.setItem('smartTasks', JSON.stringify(tasks));
    }

    function updateDate() {
        const options = { weekday: 'long', month: 'long', day: 'numeric' };
        const today = new Date();
        dateDisplay.textContent = today.toLocaleDateString('en-US', options);
    }

    function loadTheme() {
        const isDark = localStorage.getItem('theme') === 'dark';
        if (isDark) {
            document.body.classList.add('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-sun"></i>';
        } else {
            document.body.classList.remove('dark-mode');
            themeToggle.innerHTML = '<i class="fas fa-moon"></i>';
        }
    }

    function toggleTheme() {
        document.body.classList.toggle('dark-mode');
        const isDark = document.body.classList.contains('dark-mode');
        localStorage.setItem('theme', isDark ? 'dark' : 'light');
        themeToggle.innerHTML = isDark ? '<i class="fas fa-sun"></i>' : '<i class="fas fa-moon"></i>';
    }

    function renderTasks() {
        taskList.innerHTML = '';
        
        
        let filteredTasks = tasks;
        if (currentFilter === 'pending') {
            filteredTasks = tasks.filter(task => !task.completed);
        } else if (currentFilter === 'completed') {
            filteredTasks = tasks.filter(task => task.completed);
        }

        
        if (filteredTasks.length === 0) {
            emptyState.classList.remove('hidden');
        } else {
            emptyState.classList.add('hidden');
        }

    
        filteredTasks.forEach(task => {
            const li = document.createElement('li');
            li.className = `task-item ${task.completed ? 'completed' : ''}`;
            li.setAttribute('data-id', task.id);

            li.innerHTML = `
                <div class="task-content">
                    <div class="custom-checkbox"></div>
                    <span class="task-text">${escapeHtml(task.text)}</span>
                </div>
                <div class="task-actions">
                    <button class="action-btn edit-btn" title="Edit">
                        <i class="fas fa-pen"></i>
                    </button>
                    <button class="action-btn delete-btn" title="Delete">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            `;

            taskList.appendChild(li);
        });
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
});