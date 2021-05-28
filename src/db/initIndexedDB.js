// Initialize IndexedDB
const request = indexedDB.open("AckDb", 1);
let db;

// Handle database upgrade
request.onupgradeneeded = () => {
  db = request.result;

  // Initialize a "collection"
  db.createObjectStore("NextAnimFireBase", { keyPath: "id" });
  db.createObjectStore("filmFireBase", { keyPath: "id" });
  db.createObjectStore("serieFirebase", { keyPath: "id" });
  db.createObjectStore("NotifFirebase", { keyPath: "id" });
  db.createObjectStore("ParamsOptn", { keyPath: "id" });
  db.createObjectStore("MangaFirebase", { keyPath: "id" });
};

// Request succeed
request.onsuccess = () => {
  db = request.result;
};

request.onblocked = () => {
  alert("Please close all other tabs wuth this site open");
};
