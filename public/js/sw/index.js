console.log('Hi, I am service worker');

self.addEventListener('fetch', function(event){
    console.log('fetching 2', event.request);
    
    if (event.request.url.endsWith('.jpg')) {
        event.respondWith(fetch('imgs/dr-evil.gif'));
        return;
    }
    
    event.respondWith(fetch(event.request).then(response => {
        if (response.status === 404) {
            return new Response("Whoa brother, this page was lost just like your memory.");
        }
        else {
            return response;
        }
    }));    
});