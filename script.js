// ========================
// Firebase Initialization
// ========================
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  getDocs,
  collection,
  deleteDoc
} from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔹 Firebase config (তোমার নিজস্ব config বসাও এখানে)
const firebaseConfig = {
  apiKey: "AIzaSyByM3_zsGix3hqxL1WvgxLGXDCLjyCNByI",
  authDomain: "viralhub-shortner.firebaseapp.com",
  projectId: "viralhub-shortner",
  storageBucket: "viralhub-shortner.firebasestorage.app",
  messagingSenderId: "897777395591",
  appId: "1:897777395591:web:867accc5bce3b396a9d522",
  measurementId: "G-EPVVW2ZNP0"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ========================
// UI Elements
// ========================
const longUrlInput = document.getElementById("longUrl");
const shortIdInput = document.getElementById("shortId");
const linksList = document.getElementById("linksList");

// ========================
// Create or Update Link
// ========================
window.saveShortLink = async function () {
  const url = longUrlInput.value.trim();
  const id = shortIdInput.value.trim();

  if (!url || !id) return alert("Please enter both URL and ID!");

  try {
    await setDoc(doc(db, "links", id), { url });
    alert(`✅ Short link saved!\nID: ${id}`);
    longUrlInput.value = "";
    shortIdInput.value = "";
    showLinks();
  } catch (err) {
    console.error(err);
    alert("Error saving link: " + err.message);
  }
};

// ========================
// Show all links in Firestore
// ========================
async function showLinks() {
  if (!linksList) return;

  try {
    const querySnapshot = await getDocs(collection(db, "links"));
    linksList.innerHTML = "";

    if (querySnapshot.empty) {
      linksList.innerHTML = "<p>No links yet.</p>";
      return;
    }

    querySnapshot.forEach((docSnap) => {
      const data = docSnap.data();
      const id = docSnap.id;

      const div = document.createElement("div");
      div.className = "link-item";
      div.innerHTML = `
        <b>${location.origin + location.pathname}?id=${id}</b><br>
        ➜ ${data.url}<br>
        <button onclick="editLink('${id}','${data.url}')">Edit</button>
        <button onclick="deleteLink('${id}')">Delete</button>
      `;
      linksList.appendChild(div);
    });
  } catch (err) {
    console.error(err);
    linksList.innerHTML = "<p>Error loading links.</p>";
  }
}

// ========================
// Edit link
// ========================
window.editLink = async function (id, oldUrl) {
  const newUrl = prompt("Enter new URL for ID: " + id, oldUrl);
  if (!newUrl) return;
  try {
    await setDoc(doc(db, "links", id), { url: newUrl });
    alert("✅ Updated!");
    showLinks();
  } catch (err) {
    console.error(err);
    alert("Update failed: " + err.message);
  }
};

// ========================
// Delete link
// ========================
window.deleteLink = async function (id) {
  if (!confirm("Delete this link?")) return;
  try {
    await deleteDoc(doc(db, "links", id));
    alert("✅ Deleted!");
    showLinks();
  } catch (err) {
    console.error(err);
    alert("Delete failed: " + err.message);
  }
};

// ========================
// Redirect if ?id= is present
// ========================
async function redirectIfShortLink() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return;

  try {
    const docSnap = await getDoc(doc(db, "links", id));
    if (docSnap.exists()) {
      window.location.href = docSnap.data().url;
    } else {
      document.body.innerHTML = `<h2 style="text-align:center;color:red;">❌ Link not found!</h2>`;
    }
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<h2 style="text-align:center;color:red;">Error fetching link!</h2>`;
  }
}

// ========================
// Initialize
// ========================
window.onload = () => {
  showLinks();
  redirectIfShortLink();
};
