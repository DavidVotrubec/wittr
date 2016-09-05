import PostsView from './views/Posts';
import ToastsView from './views/Toasts';
import idb from 'idb';

export default function IndexController(container) {
  this._container = container;
  this._postsView = new PostsView(this._container);
  this._toastsView = new ToastsView(this._container);
  this._lostConnectionToast = null;
  this._openSocket();
  this._registerServiceWorker();
}

IndexController.prototype._registerServiceWorker = function(){
  const indexController = this;

  if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/sw.js').then(function(registration) {
      debugger
      console.log('registered a service worker');

      // The API described in the Offline-first application course seems to be bit out of date
      // or not yet supported.
      // It works in Chrome, but not FF and IE

      // If the controller is null, then it means that the page was either hard-refreshed (shift F5) 
      // or there is no active worker 
      if (!navigator.serviceWorker.controller) {
        return;
      }

      // If there is new version of the SW, then notify the user about it
      // so he can start using it immediatelly
      if (registration.waiting) {
        indexController._updateReady();
        return;
      }

      // If it is installing, then track the progress of the installation
      if (registration.installing) {
        debugger
        indexController._trackInstalling(registration.installing);
        return;
      }

      // otherwise wait for new updates to arrive
      registration.addEventListener('updatefound', function() {
        debugger
        indexController._trackInstalling(registration.installing);
        return; 
      });

    }).catch(function(err) {
      console.error('error registering service worker');
    });
  }
  else {
    console.warn('serviceWorker not available');
  }
};

// open a connection to the server for live updates
IndexController.prototype._openSocket = function() {
  var indexController = this;
  var latestPostDate = this._postsView.getLatestPostDate();

  // create a url pointing to /updates with the ws protocol
  var socketUrl = new URL('/updates', window.location);
  socketUrl.protocol = 'ws';

  if (latestPostDate) {
    socketUrl.search = 'since=' + latestPostDate.valueOf();
  }

  // this is a little hack for the settings page's tests,
  // it isn't needed for Wittr
  socketUrl.search += '&' + location.search.slice(1);

  var ws = new WebSocket(socketUrl.href);

  // add listeners
  ws.addEventListener('open', function() {
    if (indexController._lostConnectionToast) {
      indexController._lostConnectionToast.hide();
    }
  });

  ws.addEventListener('message', function(event) {
    requestAnimationFrame(function() {
      indexController._onSocketMessage(event.data);
    });
  });

  ws.addEventListener('close', function() {
    // tell the user
    if (!indexController._lostConnectionToast) {
      indexController._lostConnectionToast = indexController._toastsView.show("Unable to connect. Retrying…");
    }

    // try and reconnect in 5 seconds
    setTimeout(function() {
      indexController._openSocket();
    }, 5000);
  });
};

// called when the web socket sends message data
IndexController.prototype._onSocketMessage = function(data) {
  var messages = JSON.parse(data);
  this._postsView.addPosts(messages);
};

/**
 * Notify the user about new version of SW
 */
IndexController.prototype._updateReady = function(){
  debugger
  var toast = this._toastsView.show("New updates available", {
    buttons: ['whatever ...']
  })
};


/**
 * Track the progress of installation of SW
 */
IndexController.prototype._trackInstalling = function(serviceWorker){
  debugger;

  var indexController = this;

  serviceWorker.addEventListener('statechange', function(){
    if (serviceWorker.state == 'installed') {
      indexController._updateReady();
    }
  });
};