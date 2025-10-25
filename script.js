// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { 
  getFirestore, 
  doc, 
  setDoc, 
  getDoc, 
  collection, 
  getDocs,
  onSnapshot 
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
const resultContainer = document.getElementById('result');
const shortUrlInput = document.getElementById('shortUrl');
const copyBtn = document.getElementById('copyBtn');
const previewLink = document.getElementById('previewLink');
const linksList = document.getElementById('linksList');

// Base URL for short links
const baseUrl = window.location.origin + window.location.pathname;

// === Enhanced Redirect Function ===
async function handleRedirection() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  
  if (!id) {
    // Not a redirect request, load the main app
    initializeMainApp();
    return;
  }

  // It's a redirect request - show loading and process
  showRedirectLoading(id);
  
  try {
    const ref = doc(db, "links", id);
    const docSnap = await getDoc(ref);

    if (docSnap.exists()) {
      const targetUrl = docSnap.data().url;
      await logRedirectAnalytics(id, targetUrl);
      performRedirect(targetUrl);
    } else {
      showRedirectError(id);
    }
  } catch (error) {
    console.error("Redirect error:", error);
    showRedirectError(id);
  }
}

// === Show redirect loading screen ===
function showRedirectLoading(id) {
  document.body.innerHTML = `
    <div class="redirect-container">
      <div class="redirect-loader">
        <div class="loader-spinner"></div>
        <h2>Redirecting...</h2>
        <p>Taking you to your destination</p>
        <div class="redirect-info">
          <div class="short-id">Short ID: <strong>${id}</strong></div>
          <div class="loading-bar">
            <div class="loading-progress"></div>
          </div>
        </div>
        <div class="redirect-links">
          <a href="${baseUrl}" class="btn-cancel">
            <i class="fas fa-home"></i>
            Back to Home
          </a>
        </div>
      </div>
    </div>
  `;
  
  // Add redirect styles
  addRedirectStyles();
}

// === Perform the actual redirect ===
function performRedirect(url) {
  // Add a small delay to show the loading screen
  setTimeout(() => {
    // Use meta refresh for better compatibility
    const metaRefresh = document.createElement('meta');
    metaRefresh.httpEquiv = "refresh";
    metaRefresh.content = `0;url=${url}`;
    document.head.appendChild(metaRefresh);
    
    // Also use window.location as backup
    window.location.href = url;
  }, 1500);
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
          <a href="${baseUrl}" class="btn-primary">
            <i class="fas fa-plus"></i>
            Create Short Link
          </a>
          <a href="${baseUrl}" class="btn-secondary">
            <i class="fas fa-home"></i>
            Back to Home
          </a>
        </div>
        
        <div class="error-stats">
          <div class="stat">
            <i class="fas fa-link"></i>
            <span>Create your first short URL</span>
          </div>
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
      
      .redirect-loader {
        background: white;
        padding: 40px;
        border-radius: 20px;
        box-shadow: 0 20px 40px rgba(0,0,0,0.1);
        text-align: center;
        max-width: 500px;
        width: 100%;
      }
      
      .loader-spinner {
        width: 60px;
        height: 60px;
        border: 4px solid #f3f3f3;
        border-top: 4px solid #667eea;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin: 0 auto 20px;
      }
      
      @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
      }
      
      .redirect-loader h2 {
        color: #2d3748;
        margin-bottom: 10px;
        font-size: 1.8rem;
      }
      
      .redirect-loader p {
        color: #718096;
        margin-bottom: 25px;
        font-size: 1.1rem;
      }
      
      .redirect-info {
        background: #f7fafc;
        padding: 20px;
        border-radius: 10px;
        margin: 20px 0;
      }
      
      .short-id {
        font-size: 1.1rem;
        margin-bottom: 15px;
      }
      
      .loading-bar {
        width: 100%;
        height: 6px;
        background: #e2e8f0;
        border-radius: 3px;
        overflow: hidden;
      }
      
      .loading-progress {
        width: 100%;
        height: 100%;
        background: linear-gradient(90deg, #667eea, #764ba2);
        animation: loading 2s ease-in-out infinite;
      }
      
      @keyframes loading {
        0% { transform: translateX(-100%); }
        100% { transform: translateX(100%); }
      }
      
      .redirect-links {
        margin-top: 20px;
      }
      
      .btn-cancel {
        display: inline-flex;
        align-items: center;
        gap: 8px;
        padding: 10px 20px;
        background: #e2e8f0;
        color: #4a5568;
        text-decoration: none;
        border-radius: 8px;
        transition: all 0.3s ease;
      }
      
      .btn-cancel:hover {
        background: #cbd5e0;
      }
      
      /* Error Page Styles */
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
      
      .error-stats {
        display: flex;
        justify-content: center;
        margin-top: 30px;
        padding-top: 20px;
        border-top: 1px solid #e2e8f0;
      }
      
      .stat {
        display: flex;
        align-items: center;
        gap: 10px;
        color: #718096;
      }
      
      .stat i {
        color: #667eea;
      }
      
      @media (max-width: 768px) {
        .redirect-loader, .error-content {
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

// === Log redirect analytics (optional) ===
async function logRedirectAnalytics(id, targetUrl) {
  try {
    // You can implement analytics tracking here
    console.log(`Redirect: ${id} -> ${targetUrl}`);
    
    // Example: Store analytics in Firestore
    // await setDoc(doc(db, "analytics", `${id}_${Date.now()}`), {
    //   id: id,
    //   targetUrl: targetUrl,
    //   timestamp: new Date().toISOString(),
    //   userAgent: navigator.userAgent,
    //   referrer: document.referrer
    // });
  } catch (error) {
    console.error("Analytics error:", error);
  }
}

// === Initialize Main App ===
function initializeMainApp() {
  loadLinksList();
  setupEventListeners();
}

// === Setup Event Listeners ===
function setupEventListeners() {
  saveBtn.addEventListener('click', saveShortLink);
  copyBtn.addEventListener('click', () => {
    copyToClipboard(shortUrlInput.value);
  });

  // Enter key support
  longUrlInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveShortLink();
  });

  customIdInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') saveShortLink();
  });
}

// === Rest of your existing functions (unchanged) ===
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
    
    await setDoc(doc(db, "links", customId), { 
      url: formattedUrl,
      createdAt: new Date().toISOString()
    });

    const shortUrl = `${baseUrl}?id=${customId}`;
    shortUrlInput.value = shortUrl;
    previewLink.href = shortUrl;
    resultContainer.classList.remove('hidden');
    
    showNotification('✅ Short link created successfully!', 'success');
    
    longUrlInput.value = '';
    customIdInput.value = '';
    
    loadLinksList();

  } catch (error) {
    console.error("Error saving document: ", error);
    showNotification('❌ Error creating short link. Please try again.', 'error');
  } finally {
    saveBtn.innerHTML = '<i class="fas fa-rocket"></i> Create Short Link';
    saveBtn.disabled = false;
  }
}

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

function displayLinksList(links) {
  if (links.length === 0) {
    linksList.innerHTML = `
      <div class="empty-state">
        <i class="fas fa-link"></i>
        <p>No links created yet. Create your first short URL above!</p>
      </div>
    `;
    return;
  }

  linksList.innerHTML = links.map(link => `
    <div class="link-item fade-in">
      <div class="link-header">
        <div class="link-short">${baseUrl}?id=${link.id}</div>
        <div class="link-actions">
          <button class="btn-small btn-copy-small" onclick="copyToClipboard('${baseUrl}?id=${link.id}')">
            <i class="far fa-copy"></i> Copy
          </button>
          <button class="btn-small btn-test" onclick="window.open('${baseUrl}?id=${link.id}', '_blank')">
            <i class="fas fa-external-link-alt"></i> Test
          </button>
        </div>
      </div>
      <div class="link-original">${link.url}</div>
    </div>
  `).join('');
}

async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('✅ URL copied to clipboard!', 'success');
  } catch (err) {
    console.error('Failed to copy: ', err);
    showNotification('❌ Failed to copy URL', 'error');
  }
}

function isValidUrl(string) {
  try {
    new URL(string);
    return true;
  } catch (_) {
    return false;
  }
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
      <span>${message}</span>
    </div>
  `;

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
      }
      .notification.success {
        background: #48bb78;
      }
      .notification.error {
        background: #f56565;
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
  setTimeout(() => notification.classList.add('show'), 100);
  setTimeout(() => {
    notification.classList.remove('show');
    setTimeout(() => {
      if (notification.parentNode) {
        notification.parentNode.removeChild(notification);
      }
    }, 300);
  }, 3000);
}

// === Initialize App ===
window.onload = handleRedirection;

// === Expose functions to global scope ===
window.copyToClipboard = copyToClipboard;
window.saveShortLink = saveShortLink;
