// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
    getFirestore, 
    doc, 
    setDoc, 
    getDoc, 
    collection, 
    getDocs,
    deleteDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Your Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyByM3_zsGix3hqxL1WvgxLGXDCLjyCNByI",
    authDomain: "viralhub-shortner.firebaseapp.com",
    projectId: "viralhub-shortner",
    storageBucket: "viralhub-shortner.firebasestorage.app",
    messagingSenderId: "897777395591",
    appId: "1:897777395591:web:867accc5bce3b396a9d522",
    measurementId: "G-EPVVW2ZNP0"
};

// Initialize Firebase + Firestore
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// DOM Elements
const longUrlInput = document.getElementById('longUrl');
const customIdInput = document.getElementById('customId');
const saveBtn = document.getElementById('saveBtn');
const updateBtn = document.getElementById('updateBtn');
const cancelBtn = document.getElementById('cancelBtn');
const resultContainer = document.getElementById('result');
const shortUrlInput = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const previewLink = document.getElementById('previewLink');
const linksList = document.getElementById('linksList');
const formTitle = document.getElementById('formTitle');
const linksCount = document.getElementById('linksCount');

// State variables
let currentEditId = null;
let isEditMode = false;

// === Immediate Redirect Check - Runs First ===
(function checkImmediateRedirect() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");
    
    if (id) {
        // If there's an ID parameter, redirect immediately without loading the app
        processImmediateRedirect(id);
    } else {
        // No ID parameter, initialize the main app
        initializeMainApp();
    }
})();

// === Process Immediate Redirect ===
async function processImmediateRedirect(id) {
    try {
        const ref = doc(db, "links", id);
        const docSnap = await getDoc(ref);

        if (docSnap.exists()) {
            const targetUrl = docSnap.data().url;
            
            // Validate and format URL
            let finalUrl = targetUrl;
            if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
                finalUrl = 'https://' + finalUrl;
            }
            
            // IMMEDIATE REDIRECT - No app loading, no delay
            console.log('Redirecting to:', finalUrl);
            window.location.href = finalUrl;
            return; // Stop execution here
            
        } else {
            // Link not found - show error
            showLinkNotFoundError(id);
        }
    } catch (error) {
        console.error("Redirect error:", error);
        showLinkNotFoundError(id);
    }
}

// === Show Link Not Found Error ===
function showLinkNotFoundError(id) {
    // Completely replace the page with error message
    document.documentElement.innerHTML = `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Link Not Found - QuickLink</title>
        <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css" rel="stylesheet">
        <style>
            * {
                margin: 0;
                padding: 0;
                box-sizing: border-box;
            }
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                min-height: 100vh;
                display: flex;
                justify-content: center;
                align-items: center;
                padding: 20px;
                color: white;
            }
            .error-container {
                background: rgba(255, 255, 255, 0.95);
                padding: 50px 40px;
                border-radius: 20px;
                box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
                text-align: center;
                max-width: 500px;
                width: 100%;
                color: #2d3748;
            }
            .error-icon {
                font-size: 5rem;
                color: #e53e3e;
                margin-bottom: 25px;
            }
            .error-container h1 {
                font-size: 2.2rem;
                margin-bottom: 15px;
                color: #2d3748;
            }
            .error-container p {
                color: #718096;
                margin-bottom: 30px;
                font-size: 1.1rem;
                line-height: 1.6;
            }
            .link-id {
                background: #fff5f5;
                padding: 10px 15px;
                border-radius: 8px;
                margin: 20px 0;
                font-family: monospace;
                font-size: 1.1rem;
                color: #c53030;
                border: 1px solid #fed7d7;
            }
            .suggestions {
                background: #f7fafc;
                padding: 25px;
                border-radius: 12px;
                margin: 25px 0;
                text-align: left;
                border: 1px solid #e2e8f0;
            }
            .suggestions h3 {
                color: #4a5568;
                margin-bottom: 15px;
                font-size: 1.2rem;
            }
            .suggestions ul {
                color: #718096;
                padding-left: 20px;
            }
            .suggestions li {
                margin-bottom: 10px;
                line-height: 1.5;
            }
            .actions {
                display: flex;
                gap: 15px;
                justify-content: center;
                margin: 30px 0;
                flex-wrap: wrap;
            }
            .btn {
                display: inline-flex;
                align-items: center;
                gap: 8px;
                padding: 14px 28px;
                border-radius: 10px;
                font-weight: 600;
                text-decoration: none;
                transition: all 0.3s ease;
                border: none;
                cursor: pointer;
                font-size: 1rem;
                font-family: inherit;
            }
            .btn-primary {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
            }
            .btn-primary:hover {
                transform: translateY(-2px);
                box-shadow: 0 10px 20px rgba(102, 126, 234, 0.3);
            }
            .btn-secondary {
                background: #e2e8f0;
                color: #4a5568;
            }
            .btn-secondary:hover {
                background: #cbd5e0;
                transform: translateY(-1px);
            }
            @media (max-width: 768px) {
                .error-container {
                    padding: 40px 25px;
                }
                .actions {
                    flex-direction: column;
                    align-items: center;
                }
                .btn {
                    width: 200px;
                    justify-content: center;
                }
            }
        </style>
    </head>
    <body>
        <div class="error-container">
            <div class="error-icon">
                <i class="fas fa-exclamation-triangle"></i>
            </div>
            <h1>Link Not Found</h1>
            <p>The short link you're trying to access doesn't exist or may have been deleted.</p>
            
            <div class="link-id">
                Short ID: <strong>${id}</strong>
            </div>
            
            <div class="suggestions">
                <h3>What you can do:</h3>
                <ul>
                    <li>Check if the short ID is correct</li>
                    <li>Contact the person who shared this link with you</li>
                    <li>Create your own short links for free</li>
                </ul>
            </div>
            
            <div class="actions">
                <button class="btn btn-primary" onclick="goToMainApp()">
                    <i class="fas fa-plus"></i>
                    Create Short Link
                </button>
                <button class="btn btn-secondary" onclick="goToMainApp()">
                    <i class="fas fa-home"></i>
                    Back to Home
                </button>
            </div>
            
            <div style="margin-top: 25px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
                <p style="color: #a0aec0; font-size: 0.9rem;">
                    <i class="fas fa-link"></i>
                    Powered by QuickLink URL Shortener
                </p>
            </div>
        </div>
        
        <script>
            function goToMainApp() {
                // Remove the id parameter and go to main app
                const baseUrl = window.location.origin + window.location.pathname;
                window.location.href = baseUrl;
            }
        </script>
    </body>
    </html>
    `;
}

// === Go to main app ===
function goToMainApp() {
    const newUrl = window.location.origin + window.location.pathname;
    window.location.href = newUrl;
}

// === Initialize Main App ===
function initializeMainApp() {
    loadLinksList();
    setupEventListeners();
}

// === Setup Event Listeners ===
function setupEventListeners() {
    // Save button
    if (saveBtn) {
        saveBtn.addEventListener('click', saveShortLink);
    }
    
    // Update button
    if (updateBtn) {
        updateBtn.addEventListener('click', updateShortLink);
    }
    
    // Cancel button
    if (cancelBtn) {
        cancelBtn.addEventListener('click', cancelEdit);
    }
    
    // Copy button
    if (copyBtn) {
        copyBtn.addEventListener('click', () => {
            copyToClipboard(shortUrlInput.value);
        });
    }

    // Enter key support
    if (longUrlInput) {
        longUrlInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (isEditMode) {
                    updateShortLink();
                } else {
                    saveShortLink();
                }
            }
        });
    }

    if (customIdInput) {
        customIdInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                if (isEditMode) {
                    updateShortLink();
                } else {
                    saveShortLink();
                }
            }
        });
    }

    // Input validation
    if (longUrlInput) {
        longUrlInput.addEventListener('input', validateUrl);
    }
    if (customIdInput) {
        customIdInput.addEventListener('input', validateCustomId);
    }
}

// === Input Validation ===
function validateUrl() {
    const url = longUrlInput.value.trim();
    if (url && !isValidUrl(url) && !url.startsWith('http')) {
        longUrlInput.style.borderColor = '#f56565';
    } else {
        longUrlInput.style.borderColor = '#e2e8f0';
    }
}

function validateCustomId() {
    const id = customIdInput.value.trim();
    if (id && !/^[a-zA-Z0-9_-]+$/.test(id)) {
        customIdInput.style.borderColor = '#f56565';
    } else {
        customIdInput.style.borderColor = '#e2e8f0';
    }
}

// === Create New Short Link ===
async function saveShortLink() {
    const customId = customIdInput.value.trim();
    const longUrl = longUrlInput.value.trim();

    // Validation
    if (!customId || !longUrl) {
        showNotification('Please fill both fields!', 'error');
        return;
    }

    if (!isValidUrl(longUrl)) {
        showNotification('Please enter a valid URL (include http:// or https://)', 'error');
        return;
    }

    if (!/^[a-zA-Z0-9_-]+$/.test(customId)) {
        showNotification('Custom ID can only contain letters, numbers, hyphens, and underscores.', 'error');
        return;
    }

    try {
        // Show loading state
        saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
        saveBtn.disabled = true;

        const formattedUrl = longUrl.startsWith('http') ? longUrl : `https://${longUrl}`;
        
        // Check if ID already exists
        const existingDoc = await getDoc(doc(db, "links", customId));
        if (existingDoc.exists()) {
            showNotification('❌ This custom ID already exists. Please choose a different one.', 'error');
            saveBtn.innerHTML = '<i class="fas fa-rocket"></i> Create Short Link';
            saveBtn.disabled = false;
            return;
        }
        
        // Save to Firestore
        await setDoc(doc(db, "links", customId), { 
            url: formattedUrl,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        });

        // Show success result
        const shortUrl = `${window.location.origin}${window.location.pathname}?id=${customId}`;
        shortUrlInput.value = shortUrl;
        previewLink.href = shortUrl;
        resultContainer.classList.remove('hidden');
        
        showNotification('✅ Short link created successfully!', 'success');
        
        // Clear inputs
        longUrlInput.value = '';
        customIdInput.value = '';
        
        // Refresh links list
        loadLinksList();

    } catch (error) {
        console.error("Error saving document: ", error);
        showNotification('❌ Error creating short link. Please try again.', 'error');
    } finally {
        // Reset button state
        saveBtn.innerHTML = '<i class="fas fa-rocket"></i> Create Short Link';
        saveBtn.disabled = false;
    }
}

// === Edit Short Link ===
function editShortLink(linkId, currentUrl) {
    console.log('Editing link:', linkId, currentUrl);
    
    currentEditId = linkId;
    isEditMode = true;
    
    // Populate form with current data
    customIdInput.value = linkId;
    longUrlInput.value = currentUrl;
    
    // Disable custom ID input during edit (can't change ID)
    customIdInput.disabled = true;
    customIdInput.style.background = '#f7fafc';
    customIdInput.style.color = '#718096';
    
    // Update UI for edit mode
    formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Short Link';
    saveBtn.classList.add('hidden');
    updateBtn.classList.remove('hidden');
    cancelBtn.classList.remove('hidden');
    
    // Scroll to form and focus
    longUrlInput.focus();
    showNotification('📝 You are now editing the link. Update the URL below.', 'info');
}

// === Update Short Link ===
async function updateShortLink() {
    const longUrl = longUrlInput.value.trim();

    if (!longUrl) {
        showNotification('Please enter a URL!', 'error');
        return;
    }

    if (!isValidUrl(longUrl)) {
        showNotification('Please enter a valid URL (include http:// or https://)', 'error');
        return;
    }

    try {
        // Show loading state
        updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
        updateBtn.disabled = true;

        const formattedUrl = longUrl.startsWith('http') ? longUrl : `https://${longUrl}`;
        
        console.log('Updating document:', currentEditId, 'with URL:', formattedUrl);
        
        // Update in Firestore
        await setDoc(doc(db, "links", currentEditId), { 
            url: formattedUrl,
            updatedAt: new Date().toISOString()
        }, { merge: true });

        showNotification('✅ Link updated successfully!', 'success');
        
        // Reset form
        cancelEdit();
        
        // Refresh links list
        loadLinksList();

    } catch (error) {
        console.error("Error updating document: ", error);
        console.error("Error details:", error.message, error.code);
        
        let errorMessage = '❌ Error updating link. Please try again.';
        
        if (error.code === 'permission-denied') {
            errorMessage = '❌ Permission denied. Check Firebase security rules.';
        } else if (error.code === 'not-found') {
            errorMessage = '❌ Link not found. It may have been deleted.';
        }
        
        showNotification(errorMessage, 'error');
    } finally {
        // Reset button state
        updateBtn.innerHTML = '<i class="fas fa-save"></i> Update Link';
        updateBtn.disabled = false;
    }
}

// === Cancel Edit ===
function cancelEdit() {
    currentEditId = null;
    isEditMode = false;
    
    // Clear form
    customIdInput.value = '';
    longUrlInput.value = '';
    customIdInput.disabled = false;
    customIdInput.style.background = '';
    customIdInput.style.color = '';
    
    // Reset UI
    formTitle.innerHTML = '<i class="fas fa-plus"></i> Create New Short Link';
    saveBtn.classList.remove('hidden');
    updateBtn.classList.add('hidden');
    cancelBtn.classList.add('hidden');
    resultContainer.classList.add('hidden');
    
    // Reset input borders
    longUrlInput.style.borderColor = '#e2e8f0';
    customIdInput.style.borderColor = '#e2e8f0';
}

// === Delete Short Link ===
async function deleteShortLink(linkId) {
    if (!confirm('Are you sure you want to delete this short link? This action cannot be undone.')) {
        return;
    }

    try {
        await deleteDoc(doc(db, "links", linkId));
        showNotification('✅ Link deleted successfully!', 'success');
        loadLinksList();
        
        // If we're editing this link, cancel edit mode
        if (currentEditId === linkId) {
            cancelEdit();
        }
    } catch (error) {
        console.error("Error deleting document: ", error);
        showNotification('❌ Error deleting link. Please try again.', 'error');
    }
}

// === Load and display all links ===
async function loadLinksList() {
    try {
        const querySnapshot = await getDocs(collection(db, "links"));
        const links = [];
        
        querySnapshot.forEach((doc) => {
            links.push({
                id: doc.id,
                ...doc.data()
            });
        });

        // Sort by creation date (newest first)
        links.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        
        // Update count
        if (linksCount) {
            linksCount.textContent = links.length;
        }
        
        displayLinksList(links);
    } catch (error) {
        console.error("Error loading links: ", error);
        showNotification('❌ Error loading links. Please refresh the page.', 'error');
    }
}

// === Display links in the UI ===
function displayLinksList(links) {
    if (!linksList) return;
    
    if (links.length === 0) {
        linksList.innerHTML = `
            <div class="empty-state">
                <div class="empty-icon">
                    <i class="fas fa-link"></i>
                </div>
                <h3>No links yet</h3>
                <p>Create your first short URL to get started!</p>
            </div>
        `;
        return;
    }

    const currentUrl = window.location.origin + window.location.pathname;
    
    linksList.innerHTML = links.map(link => {
        // Escape special characters in URL for onclick attribute
        const escapedUrl = link.url.replace(/'/g, "\\'");
        
        return `
        <div class="link-item">
            <div class="link-header">
                <div class="link-short">${currentUrl}?id=${link.id}</div>
                <div class="link-actions">
                    <button class="btn-small btn-copy-small" onclick="copyToClipboard('${currentUrl}?id=${link.id}')">
                        <i class="far fa-copy"></i> Copy
                    </button>
                    <button class="btn-small btn-test" onclick="testRedirect('${currentUrl}?id=${link.id}')">
                        <i class="fas fa-external-link-alt"></i> Test
                    </button>
                    <button class="btn-small btn-edit" onclick="editShortLink('${link.id}', '${escapedUrl}')">
                        <i class="fas fa-edit"></i> Edit
                    </button>
                    <button class="btn-small btn-delete" onclick="deleteShortLink('${link.id}')">
                        <i class="fas fa-trash"></i> Delete
                    </button>
                </div>
            </div>
            <div class="link-original">${link.url}</div>
            <div class="link-meta">
                <small><i class="far fa-calendar"></i> Created: ${formatDate(link.createdAt)}</small>
                <small>${link.updatedAt ? `<i class="fas fa-sync-alt"></i> Updated: ${formatDate(link.updatedAt)}` : ''}</small>
            </div>
        </div>
        `;
    }).join('');
}

// === Format date for display ===
function formatDate(dateString) {
    try {
        const date = new Date(dateString);
        return date.toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    } catch (error) {
        return 'Unknown date';
    }
}

// === Test redirect in new tab ===
function testRedirect(url) {
    window.open(url, '_blank');
}

// === Copy to Clipboard ===
async function copyToClipboard(text) {
    try {
        await navigator.clipboard.writeText(text);
        showNotification('✅ URL copied to clipboard!', 'success');
    } catch (err) {
        console.error('Failed to copy: ', err);
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        try {
            document.execCommand('copy');
            showNotification('✅ URL copied to clipboard!', 'success');
        } catch (fallbackErr) {
            showNotification('❌ Failed to copy URL', 'error');
        }
        document.body.removeChild(textArea);
    }
}

// === URL Validation ===
function isValidUrl(string) {
    try {
        // Try to create URL object
        new URL(string);
        return true;
    } catch (_) {
        // If basic URL parsing fails, try with https prefix
        try {
            new URL('https://' + string);
            return true;
        } catch (_) {
            return false;
        }
    }
}

// === Show Notification ===
function showNotification(message, type) {
    // Remove existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => {
        if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
        }
    });

    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.innerHTML = `
        <div class="notification-content">
            <i class="fas fa-${getNotificationIcon(type)}"></i>
            <span>${message}</span>
        </div>
    `;

    // Add styles for notification if not exists
    if (!document.querySelector('.notification-styles')) {
        const styles = document.createElement('style');
        styles.className = 'notification-styles';
        styles.textContent = `
            .notification {
                position: fixed;
                top: 25px;
                right: 25px;
                padding: 18px 22px;
                border-radius: 12px;
                color: white;
                font-weight: 600;
                z-index: 10000;
                transform: translateX(400px);
                transition: all 0.3s ease;
                max-width: 400px;
                box-shadow: 0 10px 30px rgba(0,0,0,0.2);
                backdrop-filter: blur(10px);
            }
            .notification.success {
                background: rgba(72, 187, 120, 0.95);
            }
            .notification.error {
                background: rgba(245, 101, 101, 0.95);
            }
            .notification.info {
                background: rgba(66, 153, 225, 0.95);
            }
            .notification-content {
                display: flex;
                align-items: center;
                gap: 12px;
            }
            .notification.show {
                transform: translateX(0);
            }
            .notification.hide {
                transform: translateX(400px);
            }
        `;
        document.head.appendChild(styles);
    }

    document.body.appendChild(notification);

    // Show notification
    setTimeout(() => notification.classList.add('show'), 100);

    // Remove notification after 4 seconds
    setTimeout(() => {
        notification.classList.remove('show');
        notification.classList.add('hide');
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 4000);
}

// === Get notification icon ===
function getNotificationIcon(type) {
    const icons = {
        success: 'check-circle',
        error: 'exclamation-circle',
        info: 'info-circle'
    };
    return icons[type] || 'info-circle';
}

// === Expose functions to global scope ===
window.copyToClipboard = copyToClipboard;
window.saveShortLink = saveShortLink;
window.testRedirect = testRedirect;
window.goToMainApp = goToMainApp;
window.editShortLink = editShortLink;
window.deleteShortLink = deleteShortLink;
