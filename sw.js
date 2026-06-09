self.addEventListener("install", () => {
  console.log("SW yüklendi");
});

self.addEventListener("fetch", (event) => {
  event.respondWith(fetch(event.request));
});