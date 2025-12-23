// Task Queue (FIFO)
let taskQueue = [];

const taskForm = document.getElementById('task-form');
const taskTitle = document.getElementById('task-title');
const taskType = document.getElementById('task-type');
const taskDesc = document.getElementById('task-desc');
const queueList = document.getElementById('queue-list');
const queueCount = document.getElementById('queue-count');
const processNextBtn = document.getElementById('process-next-btn');
const clearAllBtn = document.getElementById('clear-all-btn');
const processingContent = document.getElementById('processing-content');

window.addEventListener('DOMContentLoaded', () => {
    const saved = localStorage.getItem('taskQueue');
    if (saved) {
        taskQueue = JSON.parse(saved);
        renderQueue();
    }
});

taskForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const newTask = {
        id: Date.now(),
        title: taskTitle.value.trim(),
        type: taskType.value,
        description: taskDesc.value.trim(),
        addedAt: new Date().toLocaleString()
    };
    
    taskQueue.push(newTask);
    saveToStorage();
    renderQueue();
    
    taskForm.reset();
    taskTitle.focus();
});

processNextBtn.addEventListener('click', () => {
    if (taskQueue.length === 0) {
        alert('No tasks in the queue!');
        return;
    }
    
    processNextBtn.disabled = true;
    processNextBtn.innerHTML = '<span class="spinner-border spinner-border-sm me-1"></span>Completing...';
    
    const task = taskQueue[0];
    processingContent.className = 'alert alert-info mb-0';
    processingContent.innerHTML = `
        <div class="d-flex align-items-center">
            <span class="spinner-border spinner-border-sm me-2"></span>
            <div>
                <strong>${task.title}</strong> (${task.type})
                <br><small class="text-muted">Completing task...</small>
            </div>
        </div>
    `;
    
    setTimeout(() => {
        taskQueue.shift(); 
        saveToStorage();
        renderQueue();
        
        processingContent.className = 'alert alert-success mb-0';
        processingContent.innerHTML = `
            <div>
                <strong>✓ Task Completed!</strong><br>
                <small>${task.title} (${task.type}) - Finished at ${new Date().toLocaleString()}</small>
            </div>
        `;
        
        processNextBtn.disabled = false;
        processNextBtn.textContent = 'Mark as Done';
        
        setTimeout(() => {
            if (taskQueue.length === 0) {
                processingContent.className = 'alert alert-secondary mb-0';
                processingContent.textContent = 'No completed tasks yet.';
            }
        }, 3000);
    }, 2000);
});

clearAllBtn.addEventListener('click', () => {
    if (taskQueue.length === 0) {
        alert('Queue is already empty!');
        return;
    }
    
    if (confirm('Are you sure you want to clear all tasks?')) {
        taskQueue = [];
        saveToStorage();
        renderQueue();
        processingContent.className = 'alert alert-secondary mb-0';
        processingContent.textContent = 'No completed tasks yet.';
    }
});

function renderQueue() {
    queueList.innerHTML = '';
    queueCount.textContent = `${taskQueue.length} task${taskQueue.length !== 1 ? 's' : ''}`;
    
    if (taskQueue.length === 0) {
        queueList.innerHTML = '<li class="text-muted fst-italic">Queue is empty. Add a task to get started!</li>';
        processNextBtn.disabled = true;
        return;
    }
    
    processNextBtn.disabled = false;
    
    taskQueue.forEach((task, index) => {
        const li = document.createElement('li');
        li.className = 'mb-2';
        li.innerHTML = `
            <div class="card ${index === 0 ? 'border-success' : ''}">
                <div class="card-body p-3">
                    <div class="d-flex justify-content-between align-items-start">
                        <div class="flex-grow-1">
                            <h5 class="h6 mb-1">
                                ${index === 0 ? '<span class="badge bg-success me-2">Next</span>' : `<span class="badge bg-secondary me-2">#${index + 1}</span>`}
                                ${task.title}
                            </h5>
                            <p class="mb-1 small">
                                <span class="badge bg-info text-dark">${task.type}</span>
                            </p>
                            ${task.description ? `<p class="text-muted small mb-1">${task.description}</p>` : ''}
                            <small class="text-muted">Added: ${task.addedAt}</small>
                        </div>
                    </div>
                </div>
            </div>
        `;
        queueList.appendChild(li);
    });
}

function saveToStorage() {
    localStorage.setItem('taskQueue', JSON.stringify(taskQueue));
}
