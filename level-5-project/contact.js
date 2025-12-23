// Contact Manager using Map for O(1) operations
class ContactManager {
    constructor() {
        // Map provides O(1) average time complexity for get, set, delete operations
        this.contacts = new Map();
        this.loadFromStorage();
    }

    /**
     * Add or update a contact - O(1) operation
     * @param {string} name - Contact name (key)
     * @param {string} phone - Phone number (value)
     */
    addContact(name, phone) {
        if (!name.trim() || !phone.trim()) {
            return { success: false, message: 'Name and phone cannot be empty' };
        }
        
        const normalizedName = name.trim();
        const isUpdate = this.contacts.has(normalizedName);
        
        this.contacts.set(normalizedName, phone.trim());
        this.saveToStorage();
        
        const message = isUpdate 
            ? `Contact "${normalizedName}" updated successfully!`
            : `Contact "${normalizedName}" added successfully!`;
        
        return { success: true, message, isUpdate };
    }

    /**
     * Search for a contact by name - O(1) operation
     * @param {string} name - Contact name to search
     * @returns {object} Contact details or null
     */
    searchContact(name) {
        const normalizedName = name.trim();
        
        if (this.contacts.has(normalizedName)) {
            return {
                name: normalizedName,
                phone: this.contacts.get(normalizedName)
            };
        }
        
        return null;
    }

    /**
     * Delete a contact - O(1) operation
     * @param {string} name - Contact name to delete
     */
    deleteContact(name) {
        const normalizedName = name.trim();
        
        if (this.contacts.has(normalizedName)) {
            this.contacts.delete(normalizedName);
            this.saveToStorage();
            return { success: true, message: `Contact "${normalizedName}" deleted!` };
        }
        
        return { success: false, message: `Contact "${normalizedName}" not found` };
    }

    /**
     * Get all contacts - O(n) operation for display
     * @returns {array} Array of all contacts
     */
    getAllContacts() {
        return Array.from(this.contacts.entries()).map(([name, phone]) => ({ name, phone }));
    }

    /**
     * Get total number of contacts
     */
    getContactCount() {
        return this.contacts.size;
    }

    /**
     * Save contacts to localStorage
     */
    saveToStorage() {
        const data = Array.from(this.contacts.entries());
        localStorage.setItem('contacts', JSON.stringify(data));
    }

    /**
     * Load contacts from localStorage
     */
    loadFromStorage() {
        const data = localStorage.getItem('contacts');
        if (data) {
            try {
                const entries = JSON.parse(data);
                entries.forEach(([name, phone]) => {
                    this.contacts.set(name, phone);
                });
            } catch (error) {
                console.error('Error loading contacts from storage:', error);
            }
        }
    }

    /**
     * Clear all contacts
     */
    clearAllContacts() {
        this.contacts.clear();
        this.saveToStorage();
    }
}

// Initialize Contact Manager
const manager = new ContactManager();

// DOM Elements
const contactForm = document.getElementById('contactForm');
const contactNameInput = document.getElementById('contactName');
const contactPhoneInput = document.getElementById('contactPhone');
const contactsList = document.getElementById('contactsList');
const contactCount = document.getElementById('contactCount');
const searchInput = document.getElementById('searchInput');
const searchBtn = document.getElementById('searchBtn');
const searchResult = document.getElementById('searchResult');

/**
 * Render all contacts to the DOM
 */
function renderContacts() {
    const contacts = manager.getAllContacts();
    contactCount.textContent = contacts.length;

    if (contacts.length === 0) {
        contactsList.innerHTML = '<p class="text-muted text-center p-3 mb-0">No contacts yet. Add one to get started!</p>';
        return;
    }

    contactsList.innerHTML = contacts.map(contact => `
        <div class="contact-item">
            <div class="contact-info">
                <h6 class="contact-name">${escapeHtml(contact.name)}</h6>
                <p class="contact-phone">${escapeHtml(contact.phone)}</p>
            </div>
            <div class="contact-actions">
                <button class="btn btn-sm btn-warning" onclick="editContact('${escapeHtml(contact.name)}')">
                    Edit
                </button>
                <button class="btn btn-sm btn-danger" onclick="deleteContactHandler('${escapeHtml(contact.name)}')">
                    Delete
                </button>
            </div>
        </div>
    `).join('');
}

/**
 * Handle form submission - Add or Update Contact
 */
contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const name = contactNameInput.value;
    const phone = contactPhoneInput.value;
    
    const result = manager.addContact(name, phone);
    
    if (result.success) {
        showToast(result.message, 'success');
        contactForm.reset();
        contactNameInput.focus();
        renderContacts();
        clearSearchResult();
    } else {
        showToast(result.message, 'danger');
    }
});

/**
 * Handle search
 */
searchBtn.addEventListener('click', performSearch);
searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        performSearch();
    }
});

function performSearch() {
    const searchTerm = searchInput.value.trim();
    
    if (!searchTerm) {
        showToast('Please enter a name to search', 'warning');
        clearSearchResult();
        return;
    }
    
    const result = manager.searchContact(searchTerm);
    
    if (result) {
        searchResult.innerHTML = `
            <div class="alert alert-success p-3 mb-0">
                <h6 class="mb-2">✓ Found!</h6>
                <p class="mb-1"><strong>${escapeHtml(result.name)}</strong></p>
                <p class="mb-0"><strong>Phone:</strong> ${escapeHtml(result.phone)}</p>
            </div>
        `;
    } else {
        searchResult.innerHTML = `
            <div class="alert alert-danger p-3 mb-0">
                <h6 class="mb-0">✗ Contact "${escapeHtml(searchTerm)}" not found</h6>
            </div>
        `;
    }
}

function clearSearchResult() {
    searchResult.innerHTML = '';
    searchInput.value = '';
}

//   Edit contact - Load into form
function editContact(name) {
    const contact = manager.searchContact(name);
    if (contact) {
        contactNameInput.value = contact.name;
        contactPhoneInput.value = contact.phone;
        contactNameInput.focus();
        scrollToForm();
    }
}

//   Delete contact handler
let pendingDeleteName = null;
const confirmDeleteModalEl = document.getElementById('confirmDeleteModal');
const confirmDeleteText = document.getElementById('confirmDeleteText');
const confirmDeleteBtn = document.getElementById('confirmDeleteBtn');
const confirmDeleteModal = confirmDeleteModalEl ? new bootstrap.Modal(confirmDeleteModalEl) : null;

function deleteContactHandler(name) {
    pendingDeleteName = name;
    if (confirmDeleteText) {
        confirmDeleteText.textContent = `Are you sure you want to delete "${name}"?`;
    }
    if (confirmDeleteModal) {
        confirmDeleteModal.show();
    } else {
        const result = manager.deleteContact(name);
        showToast(result.message, result.success ? 'success' : 'danger');
        renderContacts();
        clearSearchResult();
    }
}

if (confirmDeleteBtn) {
    confirmDeleteBtn.addEventListener('click', () => {
        if (!pendingDeleteName) return;
        const result = manager.deleteContact(pendingDeleteName);
        showToast(result.message, result.success ? 'success' : 'danger');
        renderContacts();
        clearSearchResult();
        pendingDeleteName = null;
        if (confirmDeleteModal) confirmDeleteModal.hide();
    });
}

/**
 * Escape HTML to prevent XSS
 */
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

/**
 * Show alert message
 */
function showToast(message, type = 'info') {
    const background = {
        success: 'linear-gradient(90deg, #00b09b, #96c93d)',
        danger: 'linear-gradient(90deg, #ff5858, #f09819)',
        warning: 'linear-gradient(90deg, #f7971e, #ffd200)',
        info: 'linear-gradient(90deg, #1e90ff, #6fa3ff)'
    }[type] || 'linear-gradient(90deg, #1e90ff, #6fa3ff)';

    Toastify({
        text: message,
        duration: 3500,
        gravity: 'top',
        position: 'right',
        close: true,
        style: { background }
    }).showToast();
}

/**
 * Scroll to form
 */
function scrollToForm() {
    contactForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
}

// Initial render
renderContacts();
