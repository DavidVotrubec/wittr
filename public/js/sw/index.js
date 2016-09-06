const currentVersion = 'david_v04';

// Listen for the install event
self.addEventListener('install', function(event){
    // waitUntil() is a special method which extends the lifetime of an event
    // it is valid only for ServiceWorker, if used elsewhere an Error is thrown
    // https://developer.mozilla.org/en-US/docs/Web/API/ExtendableEvent/waitUntil
    event.waitUntil(
        // create or retrieve named cache
        caches.open(currentVersion).then(cache => {
            // The addAll() returns a promise
            // which is rejected if any of the requests for dependencies fails
            // indicating that this ServiceWorker failed to install
            // and should be discarded.
            // If all requests passed, then the results are stored in our cache
            // and the SW is installed and it will activate
            return cache.addAll([
                '/',
                '/js/main.js',
                '/css/main.css',
                '/imgs/icon.png',
                'https://fonts.gstatic.com/s/roboto/v15/d-6IYplOFocCacKzxwXSOD8E0i7KZn-EPnyo3HZu7kw.woff',
                'https://fonts.gstatic.com/s/roboto/v15/2UX7WLTfW3W8TclTUvlFyQ.woff'
            ]);
        }).then(function(){
            //
            // This snippet was copied from https://davidwalsh.name/service-worker-claim
            //
            // `skipWaiting()` forces the waiting ServiceWorker to become the
            // active ServiceWorker, triggering the `onactivate` event.
            // Together with `Clients.claim()` this allows a worker to take effect
            // immediately in the client(s)
            return self.skipWaiting();
        })
    );
});

// Listening on requests and interferring with them
self.addEventListener('fetch', function(event){
    
    event.respondWith(caches.match(event.request).then(cachedResponse => {
        // if we had cached response, then return it
        // otherwise perform fetch() and then store it in cache
        // Notice that we are using caches here instead of cache
        
        if (cachedResponse) {
            console.log(`Serving cached response for ${event.request.url}`);
        }

        return cachedResponse || fetch(event.request).then(response => {
            return caches.open(currentVersion).then(cache => {
                // We have to store the clone of the response
                // because each response can be read only once, then it is discarded
                cache.put(event.request, response.clone());

                return response;
            });
        }).catch(() => {
            // nothing in the cache and network is not available
            return caches.match('/imgs/dr-evil.gif');
        });
    }));   
});

// Delete old caches to free up disk space when new version of app becomes active
// But do not delete cache for our current version
self.addEventListener('activate', function(event){
    const whiteList = [currentVersion];

    // pro-long the event's lifetime until cache is cleared
    event.waitUntil(caches.keys().then(keys => {
            return Promise.all(keys.map(key => {
                if (whiteList.indexOf(key) == -1) {
                    // caches.delete() returns a promise - https://developer.mozilla.org/en-US/docs/Web/API/Cache/delete
                    return caches.delete(key);
                }
            }));
        }).then(function(){
            debugger
            // take over control of client website(s) 
            return self.clients.claim();
        })
    );
    
});

// Listen for messages
self.addEventListener('message', function(message) {
    const action = message.data;
    debugger

    if (action == 'refresh') {
        self.skipWaiting().then(() => {
            // debugger
            // return self.clients.claim();
        });
    }
    
});