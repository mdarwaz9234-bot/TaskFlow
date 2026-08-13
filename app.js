/* ==========================================================================
   TaskFlow — Application Logic & State Management
   ========================================================================== */

// 1. App State
let tasks = [];
let currentFilter = 'all';
let searchQuery = '';

// 2. DOM Elements Selection
const taskForm = document.getElementById('task-form');
const taskInput = document.getElementById('task-input');
const prioritySelect = document.getElementById('priority-select');
const taskList = document.getElementById('task-list');
const emptyState = document.getElementById('empty-state');
const itemsLeft = document.getElementById('items-left');
const clearCompletedBtn = document.getElementById('clear-completed-btn');
const filterBtns = document.querySelectorAll('.tab-btn');
const searchInput = document.getElementById('search-input');

// 3. Storage Helpers (localStorage)
const STORAGE_KEY = 'taskflow_tasks_v1';

function loadTasks() {
  const saved = localStorage.getItem(STORAGE_KEY);
  if (saved) {
    try {
      tasks = JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse saved tasks:', e);
      tasks = [];
    }
  }
}

function saveTasks() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));
}

// 4. Task Operations
function addTask(title, priority) {
  const newTask = {
    id: Date.now().toString(),
    title: title.trim(),
    priority: priority,
    completed: false,
    createdAt: new Date().toISOString()
  };

  tasks.unshift(newTask); // Add to beginning of array
  saveTasks();
  render();
}

function toggleTask(id) {
  tasks = tasks.map(task => {
    if (task.id === id) {
      return { ...task, completed: !task.completed };
    }
    return task;
  });
  saveTasks();
  render();
}

function deleteTask(id) {
  tasks = tasks.filter(task => task.id !== id);
  saveTasks();
  render();
}

function clearCompleted() {
  tasks = tasks.filter(task => !task.completed);
  saveTasks();
  render();
}

// 5. Render Logic
function render() {
  // Filter tasks based on current tab and search query
  const filteredTasks = tasks.filter(task => {
    const matchesFilter = 
      currentFilter === 'all' ? true :
      currentFilter === 'active' ? !task.completed :
      currentFilter === 'completed' ? task.completed : true;

    const matchesSearch = task.title.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Clear current list content
  taskList.innerHTML = '';

  // Show or Hide Empty State
  if (filteredTasks.length === 0) {
    emptyState.style.display = 'block';
  } else {
    emptyState.style.display = 'none';
  }

  // Generate Task Cards
  filteredTasks.forEach(task => {
    const li = document.createElement('li');
    li.className = `task-item ${task.completed ? 'completed' : ''}`;
    
    li.innerHTML = `
      <div class="task-left">
        <input 
          type="checkbox" 
          class="task-checkbox" 
          ${task.completed ? 'checked' : ''} 
          data-id="${task.id}" 
        />
        <span class="task-title">${escapeHtml(task.title)}</span>
        <span class="badge badge-${task.priority}">${task.priority}</span>
      </div>
      <button class="delete-btn" data-id="${task.id}" title="Delete Task">&times;</button>
    `;

    taskList.appendChild(li);
  });

  // Update Remaining Items Counter
  const activeCount = tasks.filter(t => !t.completed).length;
  itemsLeft.textContent = `${activeCount} ${activeCount === 1 ? 'task' : 'tasks'} remaining`;
}

// Helper to prevent XSS attacks when rendering titles
function escapeHtml(str) {
  return str.replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
}

// 6. Event Listeners
taskForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const title = taskInput.value;
  const priority = prioritySelect.value;

  if (title.trim()) {
    addTask(title, priority);
    taskInput.value = '';
  }
});

taskList.addEventListener('click', (e) => {
  const id = e.target.getAttribute('data-id');
  if (!id) return;

  if (e.target.classList.contains('task-checkbox')) {
    toggleTask(id);
  } else if (e.target.classList.contains('delete-btn')) {
    deleteTask(id);
  }
});

filterBtns.forEach(btn => {
  btn.addEventListener('click', () => {
    filterBtns.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentFilter = btn.getAttribute('data-filter');
    render();
  });
});

searchInput.addEventListener('input', (e) => {
  searchQuery = e.target.value;
  render();
});

clearCompletedBtn.addEventListener('click', () => {
  clearCompleted();
});

// 7. Initialization
loadTasks();
render();
