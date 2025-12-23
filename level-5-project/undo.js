const actionsStack = [];
const redoStack = [];
const STORAGE_KEY = 'undoRedoState';

const actionInput = document.getElementById('action-input');
const actionsList = document.getElementById('actions-list');
const undoneList = document.getElementById('undone-list');
const undoBtn = document.getElementById('undo-btn');
const redoBtn = document.getElementById('redo-btn');
const clearBtn = document.getElementById('clear-btn');
const actionForm = document.getElementById('action-form');
const cloudStatus = document.getElementById('cloud-status');
const actionsCount = document.getElementById('actions-count');
const undoneCount = document.getElementById('undone-count');
const lastSaved = document.getElementById('last-saved');
const toastContainer = document.getElementById('toast-container');

loadFromStorage();
renderStacks();

function renderStacks() {
    renderList(actionsList, actionsStack);
    renderList(undoneList, redoStack);
    undoBtn.disabled = actionsStack.length === 0;
    redoBtn.disabled = redoStack.length === 0;
    actionsCount.textContent = actionsStack.length;
    undoneCount.textContent = redoStack.length;
}

function renderList(target, data) {
    target.innerHTML = '';
    if (!data.length) {
        const li = document.createElement('li');
        li.className = 'list-group-item text-muted';
        li.textContent = 'Empty';
        target.appendChild(li);
        return;
    }
    [...data].reverse().forEach(item => {
        const li = document.createElement('li');
        li.className = 'list-group-item';
        li.textContent = item;
        target.appendChild(li);
    });
}

function addAction(text) {
    actionsStack.push(text);
    redoStack.length = 0;
    renderStacks();
    scheduleAutoSave();
}

function undoAction() {
    if (!actionsStack.length) return;
    const last = actionsStack.pop();
    redoStack.push(last);
    renderStacks();
    scheduleAutoSave();
}

function redoAction() {
    if (!redoStack.length) return;
    const last = redoStack.pop();
    actionsStack.push(last);
    renderStacks();
    scheduleAutoSave();
}

function clearAll() {
    actionsStack.length = 0;
    redoStack.length = 0;
    renderStacks();
    scheduleAutoSave();
}

let autoSaveTimer = null;
function scheduleAutoSave() {
    setCloudStatus('Pending save', 'bg-secondary');
    if (autoSaveTimer) clearTimeout(autoSaveTimer);
    autoSaveTimer = setTimeout(saveLocally, 350);
}

function saveLocally() {
    setCloudStatus('Saving...', 'bg-warning text-dark');
    try {
        const payload = {
            actions: actionsStack,
            redo: redoStack,
            savedAt: new Date().toISOString()
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        setCloudStatus('Saved locally', 'bg-success');
        lastSaved.textContent = `Last saved: ${new Date().toLocaleTimeString()}`;
    } catch (err) {
        console.error(err);
        setCloudStatus('Error', 'bg-danger');
        showErrorToast('Failed to save locally. Check storage availability.');
    } finally {
        autoSaveTimer = null;
    }
}

function loadFromStorage() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return;
    try {
        const { actions = [], redo = [], savedAt } = JSON.parse(raw);
        actionsStack.push(...actions);
        redoStack.push(...redo);
        if (savedAt) {
            lastSaved.textContent = `Last saved: ${new Date(savedAt).toLocaleTimeString()}`;
            setCloudStatus('Loaded', 'bg-success');
        }
    } catch (err) {
        console.error('Failed to load saved state', err);
        setCloudStatus('Idle', 'bg-primary');
    }
}

function setCloudStatus(text, cls) {
    cloudStatus.textContent = text;
    cloudStatus.className = `badge ${cls}`;
}

function showErrorToast(message) {
    const toastEl = document.createElement('div');
    toastEl.className = 'toast align-items-center text-bg-danger border-0';
    toastEl.setAttribute('role', 'alert');
    toastEl.setAttribute('aria-live', 'assertive');
    toastEl.setAttribute('aria-atomic', 'true');
    toastEl.innerHTML = `
        <div class="d-flex">
            <div class="toast-body">${message}</div>
            <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
        </div>`;
    toastContainer.appendChild(toastEl);
    const toast = new bootstrap.Toast(toastEl, { delay: 4000 });
    toast.show();
    toastEl.addEventListener('hidden.bs.toast', () => toastEl.remove());
}

actionForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = actionInput.value.trim();
    if (!text) return;
    addAction(text);
    actionInput.value = '';
    actionInput.focus();
});

undoBtn.addEventListener('click', undoAction);
redoBtn.addEventListener('click', redoAction);
clearBtn.addEventListener('click', clearAll);

document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undoAction();
    }
    if (e.ctrlKey && e.key.toLowerCase() === 'y') {
        e.preventDefault();
        redoAction();
    }
});
