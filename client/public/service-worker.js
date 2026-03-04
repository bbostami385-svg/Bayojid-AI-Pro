const CACHE_NAME = "ai-chat-v1";
const urlsToCache = [
  "/",
  "/index.html",
  "/manifest.json",
  "/icon-192.png",
  "/icon-512.png",
];

// Install event
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
});

// Activate event
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Fetch event
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") {
    return;
  }

  // Skip API requests (let them go to network)
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request).catch(() => {
        return new Response("অফলাইন - API উপলব্ধ নয় / Offline - API not available", {
          status: 503,
          statusText: "Service Unavailable",
        });
      })
    );
    return;
  }

  // Cache first strategy for static assets
  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) {
        return response;
      }

      return fetch(event.request).then((response) => {
        // Don't cache non-successful responses
        if (!response || response.status !== 200 || response.type === "error") {
          return response;
        }

        // Clone the response
        const responseToCache = response.clone();

        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return response;
      });
    })
  );
});

// Background sync for offline messages
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-messages") {
    event.waitUntil(syncMessages());
  }
});

async function syncMessages() {
  try {
    // Get pending messages from IndexedDB
    const db = await openDatabase();
    const pendingMessages = await getPendingMessages(db);

    // Send them to the server
    for (const message of pendingMessages) {
      try {
        await fetch("/api/trpc/chat.addMessage", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(message),
        });

        // Remove from pending
        await removePendingMessage(db, message.id);
      } catch (error) {
        console.error("Failed to sync message:", error);
      }
    }
  } catch (error) {
    console.error("Sync failed:", error);
  }
}

function openDatabase() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open("ai-chat-db", 1);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);

    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains("pending-messages")) {
        db.createObjectStore("pending-messages", { keyPath: "id" });
      }
    };
  });
}

function getPendingMessages(db) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-messages"], "readonly");
    const store = transaction.objectStore("pending-messages");
    const request = store.getAll();

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
  });
}

function removePendingMessage(db, id) {
  return new Promise((resolve, reject) => {
    const transaction = db.transaction(["pending-messages"], "readwrite");
    const store = transaction.objectStore("pending-messages");
    const request = store.delete(id);

    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve();
  });
}

// Push notifications
self.addEventListener("push", (event) => {
  const options = {
    body: event.data ? event.data.text() : "নতুন বার্তা / New message",
    icon: "/icon-192.png",
    badge: "/icon-192.png",
    tag: "ai-chat-notification",
    requireInteraction: false,
  };

  event.waitUntil(self.registration.showNotification("AI Chat", options));
});

// Notification click
self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(
    clients.matchAll({ type: "window" }).then((clientList) => {
      for (let client of clientList) {
        if (client.url === "/" && "focus" in client) {
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow("/");
      }
    })
  );
});
