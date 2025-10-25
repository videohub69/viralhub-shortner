// Import Firebase SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// Your Firebase configuration (your own keys)
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

// === Create or Update Short Link ===
async function saveShortLink() {
  const shortId = document.getElementById("shortId").value.trim();
  const longUrl = document.getElementById("longUrl").value.trim();

  if (!shortId || !longUrl) {
    alert("Please fill both fields!");
    return;
  }

  try {
    await setDoc(doc(db, "links", shortId), { url: longUrl });
    alert(`✅ Short link saved!\nYour short URL: https://viralhub.github.io/01/?id=${shortId}`);
  } catch (error) {
    console.error("Error saving document: ", error);
  }
}

// === Redirect based on ID ===
async function redirectIfShortLink() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  const ref = doc(db, "links", id);
  const docSnap = await getDoc(ref);

  if (docSnap.exists()) {
    window.location.href = docSnap.data().url;
  } else {
    document.body.innerHTML = `<h2 style="text-align:center;color:red;">❌ Link not found!</h2>`;
  }
}

// === Run on load ===
window.onload = redirectIfShortLink;

// === Expose save function to button ===
window.saveShortLink = saveShortLink;
