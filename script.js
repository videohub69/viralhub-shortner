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

// State variables
let currentEditId = null;
let isEditMode = false;

// === Enhanced Redirect Function - Direct to Target URL ===
async function handleRedirection() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  
  if (!id) {
    // Not a redirect request, load the main app
    initializeMainApp();
    return;
  }

  // It's a redirect request - redirect directly to target URL
  await processDirectRedirect(id);
}

// === Process Direct Redirect ===
async function processDirectRedirect(id) {
  try {
    const ref = doc(db, "links", id);
    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
      const targetUrl = docSnap.data().url;
      
      // Validate URL format
      let finalUrl = targetUrl;
      if (!finalUrl.startsWith('http://') && !finalUrl.startsWith('https://')) {
        finalUrl = 'https://' + finalUrl;
      }
      
      // Direct immediate redirect
      console.log(`Redirecting ${id} -> ${finalUrl}`);
      window.location.replace(finalUrl);
      
    } else {
      showRedirectError(id);
    }
  } catch (error) {
    console.error("Redirect error:", error);
    showRedirectError(id);
  }
}

// === Show redirect error ===
function showRedirectError(id) {
  document.body.innerHTML = `
    <div class="redirect-container error">
      <div class="error-content">
        <div class="error-icon">
          <i class="fas fa-exclamation-triangle"></i>
        </div>
        <h2>Link Not Found</h2>
        <p>The short link <strong>"${id}"</strong> doesn't exist or may have been deleted.</p>
        
        <div class="error-suggestions">
          <h3>What you can do:</h3>
          <ul>
            <li>Check if the short ID is correct</li>
            <li>Contact the link owner</li>
            <li>Create your own short link</li>
          </ul>
        </div>
        
        <div class="error-actions">
          <button onclick="goToMainApp()" class="btn-primary">
            <i class="fas fa-plus"></i>
            Create Short Link
          </button>
          <button onclick="goToMainApp()" class="btn-secondary">
            <i class="fas fa-home"></i>
            Back to Home
          </button>
        </div>
      </div>
    </div>
  `;
  
  addRedirectStyles();
}

// === Add redirect page styles ===
function addRedirectStyles() {
  const styles = `
    <style>
      .redirect-container {
        min-height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 20px;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      }
      
      .error .error-content {
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        text-align: center;
        max-width: 500px;
        width: 100%;
      }
      
      .error-icon {
        font-size: 4rem;
        color: #e53e3e;
        margin-bottom: 20px;
      }
      
      .error-content h2 {
        color: #2d3748;
        margin-bottom: 15px;
        font-size: 2rem;
      }
      
      .error-content p {
        color: #718096;
        margin-bottom: 25px;
        font-size: 1.1rem;
      }
      
      .error-suggestions {
        background: #fff5f5;
        padding: 20px;
        border-radius: 10px;
        margin: 25px 0;
        text-align: left;
      }
      
      .error-suggestions h3 {
        color: #c53030;
        margin-bottom: 15px;
        font-size: 1.2rem;
      }
      
      .error-suggestions ul {
        color: #718096;
        padding-left: 20px;
      }
      
      .error-suggestions li {
        margin-bottom: 8px;
      }
      
      .error-actions {
        display: flex;
        gap: 15px;
        justify-content: center;
        margin: 30px 0;
        flex-wrap: wrap;
      }
      
      .btn-primary, .btn-secondary {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 12px 24px;
        border-radius: 8px;
        text-decoration: none;
        font-weight: 600;
        transition: all 0.3s ease;
        border: none;
        cursor: pointer;
        font-size: 1rem;
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
      }
      
      @media (max-width: 768px) {
        .error-content {
          padding: 30px 20px;
        }
        
        .error-actions {
          flex-direction: column;
          align-items: center;
        }
        
        .btn-primary, .btn-secondary {
          width: 200px;
          justify-content: center;
        }
      }
    </style>
  `;
  
  document.head.insertAdjacentHTML('beforeend', styles);
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
  if (saveBtn) {
    saveBtn.addEventListener('click', saveShortLink);
  }
  
  if (updateBtn) {
    updateBtn.addEventListener('click', updateShortLink);
  }
  
  if (cancelBtn) {
    cancelBtn.addEventListener('click', cancelEdit);
  }
  
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
}

// === Create New Short Link ===
async function saveShortLink() {
  const customId = customIdInput.value.trim();
  const longUrl = longUrlInput.value.trim();

  if (!customId || !longUrl) {
    showNotification('Please fill both fields!', 'error');
    return;
  }

  if (!isValidUrl(longUrl)) {
    showNotification('Please enter a valid URL (include http:// or https://)', 'error');
    return;
  }

  try {
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
    
    await setDoc(doc(db, "links", customId), { 
      url: formattedUrl,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

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
    saveBtn.innerHTML = '<i class="fas fa-rocket"></i> Create Short Link';
    saveBtn.disabled = false;
  }
}

// === Edit Short Link ===
function editShortLink(linkId, currentUrl) {
  currentEditId = linkId;
  isEditMode = true;
  
  // Populate form with current data
  customIdInput.value = linkId;
  longUrlInput.value = currentUrl;
  
  // Disable custom ID input during edit (can't change ID)
  customIdInput.disabled = true;
  
  // Update UI for edit mode
  formTitle.innerHTML = '<i class="fas fa-edit"></i> Edit Short Link';
  saveBtn.classList.add('hidden');
  updateBtn.classList.remove('hidden');
  cancelBtn.classList.remove('hidden');
  document.querySelector('.shortener-card').classList.add('edit-mode');
  
  // Scroll to form
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
    updateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Updating...';
    updateBtn.disabled = true;

    const formattedUrl = longUrl.startsWith('http') ? longUrl : `https://${longUrl}`;
    
    await setDoc(doc(db, "links", currentEditId), { 
      url: formattedUrl,
      createdAt: (await getDoc(doc(db, "links", currentEditId))).data().createdAt,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    showNotification('✅ Link updated successfully!', 'success');
    
    // Reset form
    cancelEdit();
    
    // Refresh links list
    loadLinksList();

  } catch (error) {
    console.error("Error updating document: ", error);
    showNotification('❌ Error updating link. Please try again.', 'error');
  } finally {
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
  
  // Reset UI
  formTitle.innerHTML = '<i class="fas fa-plus"></i> Create New Short Link';
  saveBtn.classList.remove('hidden');
  updateBtn.classList.add('hidden');
  cancelBtn.classList.add('hidden');
  document.querySelector('.shortener-card').classList.remove('edit-mode');
  resultContainer.classList.add('hidden');
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

    links.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    displayLinksList(links);
  } catch (error) {
    console.error("Error loading links: ", error);
  }
}

// === Display links in the UI ===
function displayLinksList(links) {
  if (!linksList) return;
  
  if (links.length === 0) {
    linksList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-link"></i>
        <p>No links created yet. Create your first short URL above!</p>
      </div>
    `;
    return;
  }

  const currentUrl = window.location.origin + window.location.pathname;
  
  linksList.innerHTML = links.map(link => `
    <div class="link-item fade-in">
      <div class="link-header">
        <div class="link-short">${currentUrl}?id=${link.id}</div>
        <div class="link-actions">
          <button class="btn-small btn-copy-small" onclick="copyToClipboard('${currentUrl}?id=${link.id}')">
            <i class="far fa-copy"></i> Copy
          </button>
          <button class="btn-small btn-test" onclick="testRedirect('${currentUrl}?id=${link.id}')">
            <i class="fas fa-external-link-alt"></i> Test
          </button>
          <button class="btn-small btn-edit" onclick="editShortLink('${link.id}', '${link.url}')">
            <i class="fas fa-edit"></i> Edit
          </button>
          <button class="btn-small btn-delete" onclick="deleteShortLink('${link.id}')">
            <i class="fas fa-trash"></i> Delete
          </button>
        </div>
      </div>
      <div class="link-original">${link.url}</div>
      <div class="link-meta">
        <small>Created: ${new Date(link.createdAt).toLocaleDateString()}</small>
        <small>${link.updatedAt ? `Updated: ${new Date(link.updatedAt).toLocaleDateString()}` : ''}</small>
      </div>
    </div>
  `).join('');
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
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

// === Show Notification ===
function showNotification(message, type) {
  // Remove existing notifications
  const existingNotifications = document.querySelectorAll('.notification');
  existingNotifications.forEach(notification => notification.remove());

  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${getNotificationIcon(type)}"></i>
      <span>${message}</span>
    </div>
  `;

  // Add styles for notification
  if (!document.querySelector('.notification-styles')) {
    const styles = document.createElement('style');
    styles.className = 'notification-styles';
    styles.textContent = `
      .notification {
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transform: translateX(400px);
        transition: transform 0.3s ease;
        max-width: 400px;
        box-shadow: 0 10px 30px rgba(0,0,0,0.2);
      }
      .notification.success {
        background: #48bb78;
      }
      .notification.error {
        background: #f56565;
      }
      .notification.info {
        background: #4299e1;
      }
      .notification-content {
        display: flex;
        align-items: center;
        gap: 10px;
      }
      .notification.show {
        transform: translateX(0);
      }
    `;
    document.head.appendChild(styles);
  }

  document.body.appendChild(notification);

  // Show notification
  setTimeout(() => notification.classList.add('show'), 100);

  // Remove notification after 3 seconds
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
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

// === Initialize App ===
window.onload = handleRedirection;

// === Expose functions to global scope ===
window.copyToClipboard = copyToClipboard;
window.saveShortLink = saveShortLink;
window.testRedirect = testRedirect;
window.goToMainApp = goToMainApp;
window.editShortLink = editShortLink;
window.deleteShortLink = deleteShortLink;
