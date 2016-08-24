console.log('Hi, I am service worker');

self.addEventListener('fetch', function(event){
    console.log('fetching', event.request);
})