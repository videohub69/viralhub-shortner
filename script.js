// ========================
// Import Firebase SDKs
// ========================
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

// ========================
// Firebase Configuration
// ========================
const firebaseConfig = {
    apiKey: "AIzaSyByM3_zsGix3hqxL1WvgxLGXDCLjyCNByI",
    authDomain: "viralhub-shortner.firebaseapp.com",
    projectId: "viralhub-shortner",
    storageBucket: "viralhub-shortner.firebasestorage.app",
    messagingSenderId: "897777395591",
    appId: "1:897777395591:web:867accc5bce3b396a9d522",
    measurementId: "G-EPVVW2ZNP0"
};

// ========================
// Initialize Firebase
// ========================
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========================
// DOM Elements
// ========================
const longUrlInput = document.getElementById('longUrl');
const customIdInput = document.getElementById('customId');
const saveBtn = document.getElementById('saveBtn');
const updateBtn = document.getElementById('updateBtn');
const cancelBtn = document.getElementById('cancelBtn');
const resultContainer = document.getElementById('result');
const shortUrlInput = document.getElementById('shortUrl');
const previewLink = document.getElementById('previewLink');
const linksList = document.getElementById('linksList');
const formTitle = document.getElementById('formTitle');
const linksCount = document.getElementById('linksCount');

// ========================
// State variables
// ========================
let currentEditId = null;
let isEditMode = false;

// ========================
// Immediate Redirect
// ========================
(async function checkImmediateRedirect() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get("id");

    if (id) {
        const UI = document.getElementById('shortnerUI');
        if (UI) UI.style.display = 'none'; // hide UI

        try {
            const ref = doc(db, "links", id);
            const docSnap = await getDoc(ref);

            if (docSnap.exists()) {
                let targetUrl = docSnap.data().url;
                if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
                    targetUrl = 'https://' + targetUrl;
                }
                window.location.replace(targetUrl); // direct redirect
                return;
            } else {
                showLinkNotFoundError(id);
            }
        } catch (err) {
            console.error("Redirect error:", err);
            showLinkNotFoundError(id);
        }
    } else {
        initializeMainApp();
    }
})();

// ========================
// Link Not Found
// ========================
function showLinkNotFoundError(id) {
    document.documentElement.innerHTML = `
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Link Not Found</title>
        <style>
            body {font-family:sans-serif;text-align:center;padding:50px;background:#f5f5f5;color:#333;}
            h1 {font-size:2rem;color:#e53e3e;}
            .btn {padding:10px 20px;margin:10px;background:#667eea;color:white;border:none;border-radius:5px;cursor:pointer;}
        </style>
    </head>
    <body>
        <h1>❌ Link Not Found</h1>
        <p>The ID "${id}" does not exist.</p>
        <button class="btn" onclick="window.location.href=window.location.origin+window.location.pathname;">Go Home</button>
    </body>
    </html>
    `;
}

// ========================
// Initialize Main App
// ========================
function initializeMainApp() {
    loadLinksList();
    setupEventListeners();
}

// ========================
// Event Listeners
// ========================
function setupEventListeners() {
    if (saveBtn) saveBtn.addEventListener('click', saveShortLink);
    if (updateBtn) updateBtn.addEventListener('click', updateShortLink);
    if (cancelBtn) cancelBtn.addEventListener('click', cancelEdit);

    if (longUrlInput) longUrlInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') isEditMode ? updateShortLink() : saveShortLink();
    });
    if (customIdInput) customIdInput.addEventListener('keypress', e => {
        if (e.key === 'Enter') isEditMode ? updateShortLink() : saveShortLink();
    });
}

// ========================
// Validate URL
// ========================
function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch (_) {
        try { new URL('https://' + url); return true; }
        catch (_) { return false; }
    }
}

// ========================
// Save New Short Link
// ========================
async function saveShortLink() {
    const id = customIdInput.value.trim();
    let url = longUrlInput.value.trim();

    if (!id || !url) return alert('Please fill both fields!');
    if (!isValidUrl(url)) return alert('Invalid URL!');

    if (!url.startsWith('http')) url = 'https://' + url;

    const docRef = doc(db, 'links', id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) return alert('ID already exists!');

    await setDoc(docRef, { url, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() });

    alert('✅ Short link created!');
    longUrlInput.value = ''; customIdInput.value = '';
    loadLinksList();
}

// ========================
// Edit Link
// ========================
function editShortLink(id, url) {
    currentEditId = id;
    isEditMode = true;
    customIdInput.value = id;
    customIdInput.disabled = true;
    longUrlInput.value = url;

    saveBtn.style.display = 'none';
    updateBtn.style.display = 'inline-block';
    cancelBtn.style.display = 'inline-block';
}

// ========================
// Update Link
// ========================
async function updateShortLink() {
    if (!currentEditId) return;
    let url = longUrlInput.value.trim();
    if (!url) return alert('Please enter URL!');
    if (!isValidUrl(url)) return alert('Invalid URL!');
    if (!url.startsWith('http')) url = 'https://' + url;

    await setDoc(doc(db, 'links', currentEditId), { url, updatedAt: new Date().toISOString() }, { merge: true });
    alert('✅ Link updated!');
    cancelEdit();
    loadLinksList();
}

// ========================
// Cancel Edit
// ========================
function cancelEdit() {
    currentEditId = null;
    isEditMode = false;
    customIdInput.value = '';
    longUrlInput.value = '';
    customIdInput.disabled = false;
    saveBtn.style.display = 'inline-block';
    updateBtn.style.display = 'none';
    cancelBtn.style.display = 'none';
}

// ========================
// Delete Link
// ========================
async function deleteShortLink(id) {
    if (!confirm('Delete this link?')) return;
    await deleteDoc(doc(db, 'links', id));
    alert('✅ Link deleted!');
    loadLinksList();
}

// ========================
// Load Links List
// ========================
async function loadLinksList() {
    if (!linksList) return;
    const querySnapshot = await getDocs(collection(db, 'links'));
    const links = [];
    querySnapshot.forEach(docSnap => links.push({ id: docSnap.id, ...docSnap.data() }));

    linksList.innerHTML = links.map(link => {
        const shortUrl = `${window.location.origin}${window.location.pathname}?id=${link.id}`;
        return `
            <div class="link-item">
                <b>${shortUrl}</b> ➜ ${link.url}<br>
                <button onclick="editShortLink('${link.id}','${link.url}')">Edit</button>
                <button onclick="deleteShortLink('${link.id}')">Delete</button>
            </div>
        `;
    }).join('');
}

// ========================
// Expose functions globally
// ========================
window.editShortLink = editShortLink;
window.deleteShortLink = deleteShortLink;
window.saveShortLink = saveShortLink;
window.updateShortLink = updateShortLink;
window.cancelEdit = cancelEdit;
