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
const successMessage = document.getElementById('successMessage');

// Base URL for short links
const baseUrl = window.location.origin + window.location.pathname;

// === Create or Update Short Link ===
async function saveShortLink() {
  const customId = customIdInput.value.trim();
  const longUrl = longUrlInput.value.trim();

  // Validate inputs
  if (!customId || !longUrl) {
    showNotification('Please fill both fields!', 'error');
    return;
  }

  // Validate URL format
  if (!isValidUrl(longUrl)) {
    showNotification('Please enter a valid URL (include http:// or https://)', 'error');
    return;
  }

  try {
    // Show loading state
    saveBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Creating...';
    saveBtn.disabled = true;

    // Add https if missing
    const formattedUrl = longUrl.startsWith('http') ? longUrl : `https://${longUrl}`;
    
    // Save to Firestore
    await setDoc(doc(db, "links", customId), { 
      url: formattedUrl,
      createdAt: new Date().toISOString()
    });

    // Show success result
    const shortUrl = `${baseUrl}?id=${customId}`;
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

    displayLinksList(links);
  } catch (error) {
    console.error("Error loading links: ", error);
  }
}

// === Display links in the UI ===
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

// === Copy to Clipboard ===
async function copyToClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
    showNotification('✅ URL copied to clipboard!', 'success');
  } catch (err) {
    console.error('Failed to copy: ', err);
    showNotification('❌ Failed to copy URL', 'error');
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
  // Create notification element
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.innerHTML = `
    <div class="notification-content">
      <i class="fas fa-${type === 'success' ? 'check-circle' : 'exclamation-circle'}"></i>
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

// === Redirect based on ID ===
async function redirectIfShortLink() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  
  if (!id) {
    // Not a redirect request, load the main app
    loadLinksList();
    return;
  }

  // It's a redirect request
  const ref = doc(db, "links", id);
  const docSnap = await getDoc(ref);

  if (docSnap.exists()) {
    window.location.href = docSnap.data().url;
  } else {
    document.body.innerHTML = `
      <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        height: 100vh;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      ">
        <div style="text-align: center; padding: 40px;">
          <i class="fas fa-exclamation-triangle" style="font-size: 4rem; margin-bottom: 20px;"></i>
          <h1 style="font-size: 2rem; margin-bottom: 10px;">Link Not Found</h1>
          <p style="font-size: 1.1rem; opacity: 0.9;">
            The short link you're looking for doesn't exist.
          </p>
          <button onclick="window.location.href = '${baseUrl}'" 
                  style="margin-top: 20px; padding: 12px 30px; background: white; color: #667eea; border: none; border-radius: 8px; cursor: pointer; font-weight: 600;">
            Create Your Own Short Link
          </button>
        </div>
      </div>
    `;
  }
}

// === Event Listeners ===
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

// === Initialize App ===
window.onload = redirectIfShortLink;

// === Expose functions to global scope ===
window.copyToClipboard = copyToClipboard;
window.saveShortLink = saveShortLink;
