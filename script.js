// Firebase init
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, getDoc, setDoc, getDocs, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyByM3_zsGix3hqxL1WvgxLGXDCLjyCNByI",
  authDomain: "viralhub-shortner.firebaseapp.com",
  projectId: "viralhub-shortner",
  storageBucket: "viralhub-shortner.firebasestorage.app",
  messagingSenderId: "897777395591",
  appId: "1:897777395591:web:867accc5bce3b396a9d522",
  measurementId: "G-EPVVW2ZNP0"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const UI = document.getElementById("shortnerUI");
const longUrlInput = document.getElementById("longUrl");
const shortIdInput = document.getElementById("shortId");
const linksList = document.getElementById("linksList");

// Direct redirect if ?id= exists
async function redirectIfShortLink() {
  const params = new URLSearchParams(window.location.search);
  const id = params.get("id");
  if (!id) return showUI(); // No id, show the shortner UI

  try {
    const docSnap = await getDoc(doc(db, "links", id));
    if (docSnap.exists()) {
      window.location.replace(docSnap.data().url); // direct redirect
    } else {
      document.body.innerHTML = `<h2 style="text-align:center;color:red;">❌ Link not found!</h2>`;
    }
  } catch (err) {
    console.error(err);
    document.body.innerHTML = `<h2 style="text-align:center;color:red;">Error fetching link!</h2>`;
  }
}

// Show shortner UI if no ?id=
function showUI() {
  UI.style.display = "block";
  showLinks();
}

// Other functions for save / edit / delete
window.saveShortLink = async function () {
  const url = longUrlInput.value.trim();
  const id = shortIdInput.value.trim();
  if (!url || !id) return alert("Please enter both URL and ID!");
  await setDoc(doc(db, "links", id), { url });
  alert(`✅ Short link saved! ID: ${id}`);
  longUrlInput.value = "";
  shortIdInput.value = "";
  showLinks();
};

async function showLinks() {
  if (!linksList) return;
  linksList.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "links"));
  querySnapshot.forEach(docSnap => {
    const data = docSnap.data();
    const id = docSnap.id;
    const div = document.createElement("div");
    div.innerHTML = `
      <b>${location.origin + location.pathname}?id=${id}</b> ➜ ${data.url}
      <button onclick="editLink('${id}','${data.url}')">Edit</button>
      <button onclick="deleteLink('${id}')">Delete</button>
    `;
    linksList.appendChild(div);
  });
}

window.editLink = async (id, oldUrl) => {
  const newUrl = prompt("Enter new URL for ID: " + id, oldUrl);
  if (!newUrl) return;
  await setDoc(doc(db, "links", id), { url: newUrl });
  showLinks();
};

window.deleteLink = async (id) => {
  if (!confirm("Delete this link?")) return;
  await deleteDoc(doc(db, "links", id));
  showLinks();
};

// Init
redirectIfShortLink();
