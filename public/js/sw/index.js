console.log('Hi, I am service worker');

self.addEventListener('fetch', function(event){
    console.log('fetching 2', event.request);
    
    if (event.request.url.indexOf('.jpg') != -1) {
        event.respondWith(fetch('imgs/dr-evil.gif'));
    }    
})