import idb from 'idb';

var dbPromise = idb.open('test-db-2', 2, function(upgradeDb) {
  // This callback is called when DB instance of that version is created
  var keyValStore = upgradeDb.createObjectStore('keyval');
  keyValStore.put("world", "hello 1");
});

// read "hello" in "keyval"
dbPromise.then(function(db) {
  var tx = db.transaction('keyval');
  var keyValStore = tx.objectStore('keyval');
  return keyValStore.get('hello');
}).then(function(val) {
  console.log('The value of "hello" is:', val);
});

// set "foo" to be "bar" in "keyval"
dbPromise.then(function(db) {
  var tx = db.transaction('keyval', 'readwrite');
  var keyValStore = tx.objectStore('keyval');
  keyValStore.put('bar', 'foo');
  return tx.complete;
}).then(function() {
  console.log('Added foo:bar to keyval');
});

dbPromise.then(function(db) {
  // TODO: in the keyval store, set
  // "favoriteAnimal" to your favourite animal
  // eg "cat" or "dog"
  var tx = db.transaction('keyval', 'readwrite');
  var store = tx.objectStore('keyval');
  store.put('animal', 'snake');
  return tx.complete;
}).then(function(){
  console.log('favoriteAnimal stored');
});