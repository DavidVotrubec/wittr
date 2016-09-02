const currentVersion = 'v1';

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