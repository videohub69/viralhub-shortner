import { initializeApp } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-app.js";
import { getFirestore, doc, setDoc, getDoc, getDocs, collection, deleteDoc } from "https://www.gstatic.com/firebasejs/11.0.1/firebase-firestore.js";

// 🔥 তোমার firebase config এখানে বসাও:
const firebaseConfig = {
  apiKey: "তোমার_api_key",
  authDomain: "viralhub-shortner.firebaseapp.com",
  projectId: "viralhub-shortner",
  storageBucket: "viralhub-shortner.appspot.com",
  messagingSenderId: "1234567890",
  appId: "1:1234567890:web:abc123xyz"
};

// Firebase init
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

const list = document.getElementById("linksList");
const saveBtn = document.getElementById("saveBtn");

// লিংক দেখানোর ফাংশন
async function showLinks() {
  list.innerHTML = "";
  const querySnapshot = await getDocs(collection(db, "links"));
  querySnapshot.forEach((docSnap) => {
    const data = docSnap.data();
    const div = document.createElement("div");
    div.className = "link-item";
    div.innerHTML = `
      <b>${location.origin + location.pathname}?id=${docSnap.id}</b><br>
      ➜ ${data.url}<br>
      <button onclick="window.editLink('${docSnap.id}','${data.url}')">Edit</button>
      <button onclick="window.deleteLink('${docSnap.id}')">Delete</button>
    `;
    list.appendChild(div);
  });
}

saveBtn.addEventListener("click", async () => {
  const id = document.getElementById("customId").value.trim();
  const url = document.getElementById("longUrl").value.trim();
  if (!id || !url) return alert("Please enter both ID and URL");

  await setDoc(doc(db, "links", id), { url });
  alert("✅ Link saved/updated!");
  document.getElementById("customId").value = "";
  document.getElementById("longUrl").value = "";
  showLinks();
});

window.editLink = async (id, oldUrl) => {
  const newUrl = prompt("Enter new URL:", oldUrl);
  if (newUrl) {
    await setDoc(doc(db, "links", id), { url: newUrl.trim() });
    showLinks();
  }
};

window.deleteLink = async (id) => {
  if (confirm("Delete this link?")) {
    await deleteDoc(doc(db, "links", id));
    showLinks();
  }
};

showLinks();

// 🔁 redirect check
const params = new URLSearchParams(window.location.search);
const shortId = params.get("id");
if (shortId) {
  const docSnap = await getDoc(doc(db, "links", shortId));
  if (docSnap.exists()) {
    window.location.href = docSnap.data().url;
  } else {
    document.body.innerHTML = `<h2>❌ Short link not found.</h2>`;
  }
}
