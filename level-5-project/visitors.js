// Unique Visitor Tracker - Set-Based Implementation
// Time Complexity: O(1) for add/check operations using Set
// Space Complexity: O(n) where n is number of unique visitors

class UniqueVisitorTracker {
    constructor() {
        this.uniqueVisitors = new Set();
        this.duplicateCount = 0;
        this.loadFromStorage();
    }

    addVisitor(visitorId) {
        if (!visitorId || typeof visitorId !== 'string') {
            return false;
        }

        const trimmedId = visitorId.trim();
        
        if (this.uniqueVisitors.has(trimmedId)) {
            this.duplicateCount++;
            this.saveToStorage();
            return false;
        }

        this.uniqueVisitors.add(trimmedId);
        this.saveToStorage();
        return true;
    }

    getTotalUnique() {
        return this.uniqueVisitors.size;
    }

    getAllVisitors() {
        return Array.from(this.uniqueVisitors).sort();
    }

    getDuplicateCount() {
        return this.duplicateCount;
    }

    clearAll() {
        this.uniqueVisitors.clear();
        this.duplicateCount = 0;
        this.saveToStorage();
    }

    saveToStorage() {
        const data = {
            visitors: Array.from(this.uniqueVisitors),
            duplicateCount: this.duplicateCount
        };
        localStorage.setItem('visitorData', JSON.stringify(data));
    }

    loadFromStorage() {
        const stored = localStorage.getItem('visitorData');
        if (stored) {
            try {
                const data = JSON.parse(stored);
                this.uniqueVisitors = new Set(data.visitors || []);
                this.duplicateCount = data.duplicateCount || 0;
            } catch (e) {
                console.error('Error loading from storage:', e);
            }
        }
    }
}

const tracker = new UniqueVisitorTracker();

const visitorInput = document.getElementById('visitorInput');
const addBtn = document.getElementById('addBtn');
const clearBtn = document.getElementById('clearBtn');
const totalCountEl = document.getElementById('totalCount');
const duplicateCountEl = document.getElementById('duplicateCount');
const visitorsListEl = document.getElementById('visitorsList');

function renderVisitors() {
    const total = tracker.getTotalUnique();
    const visitors = tracker.getAllVisitors();

    totalCountEl.textContent = total;
    duplicateCountEl.textContent = tracker.getDuplicateCount();

    if (total === 0) {
        visitorsListEl.innerHTML = '<p class="text-muted text-center">No visitors tracked yet</p>';
        return;
    }

    const listHTML = visitors.map((visitor, index) => `
        <div class="visitor-item">
            <span class="badge bg-info me-2">${index + 1}</span>
            <span class="visitor-id">${escapeHtml(visitor)}</span>
        </div>
    `).join('');

    visitorsListEl.innerHTML = listHTML;
}

function showToast(message, type = 'info') {
    const typeConfig = {
        success: { background: '#198754', icon: '✓' },
        error: { background: '#dc3545', icon: '✕' },
        warning: { background: '#ffc107', icon: '⚠' },
        info: { background: '#0d6efd', icon: 'ℹ' }
    };

    const config = typeConfig[type] || typeConfig.info;

    Toastify({
        text: message,
        duration: 3000,
        gravity: 'top',
        position: 'right',
        backgroundColor: config.background,
        stopOnFocus: true,
        onClick: function () { this.hideToast(); }
    }).showToast();
}

function escapeHtml(text) {
    const map = {
        '&': '&amp;',
        '<': '&lt;',
        '>': '&gt;',
        '"': '&quot;',
        "'": '&#039;'
    };
    return text.replace(/[&<>"']/g, m => map[m]);
}

function handleAddVisitor() {
    const visitorId = visitorInput.value;

    if (!visitorId.trim()) {
        showToast('Please enter a visitor ID/email', 'warning');
        visitorInput.focus();
        return;
    }

    const isNew = tracker.addVisitor(visitorId);

    if (!isNew) {
        showToast(`${visitorId} already exists!`, 'error');
        visitorInput.classList.add('is-invalid');
        setTimeout(() => visitorInput.classList.remove('is-invalid'), 1500);
    } else {
        showToast(`${visitorId} added successfully!`, 'success');
        visitorInput.classList.add('is-valid');
        setTimeout(() => visitorInput.classList.remove('is-valid'), 1500);
    }

    visitorInput.value = '';
    renderVisitors();
    visitorInput.focus();
}

function handleClearAll() {
    const confirmDiv = document.createElement('div');
    confirmDiv.style.cssText = 'display: flex; gap: 10px;';
    
    const yesBtn = document.createElement('button');
    yesBtn.textContent = 'Yes, Clear';
    yesBtn.style.cssText = 'padding: 5px 12px; background: #198754; color: white; border: none; border-radius: 4px; cursor: pointer;';
    
    const noBtn = document.createElement('button');
    noBtn.textContent = 'Cancel';
    noBtn.style.cssText = 'padding: 5px 12px; background: #6c757d; color: white; border: none; border-radius: 4px; cursor: pointer;';

    yesBtn.addEventListener('click', () => {
        tracker.clearAll();
        renderVisitors();
        showToast('All visitor data cleared!', 'success');
    });

    noBtn.addEventListener('click', () => {
        showToast('Clear cancelled', 'info');
    });

    confirmDiv.appendChild(yesBtn);
    confirmDiv.appendChild(noBtn);

    Toastify({
        node: confirmDiv,
        duration: -1,
        gravity: 'top',
        position: 'right',
        backgroundColor: '#ffc107',
        stopOnFocus: true
    }).showToast();
}

addBtn.addEventListener('click', handleAddVisitor);
clearBtn.addEventListener('click', handleClearAll);

visitorInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        handleAddVisitor();
    }
});

renderVisitors();
visitorInput.focus();
