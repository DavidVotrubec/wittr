import idb from 'idb';

var dbPromise = idb.open('test-db', 2, function(upgradeDb) {
  // This callback is called when DB instance of that version is created

  switch(upgradeDb.oldVersion) {
    case 0:
      var keyValStore = upgradeDb.createObjectStore('keyval');
      keyValStore.put("world", "hello 1");
    case 1:
      var peopleStore = upgradeDb.createObjectStore('people', {keyPath: 'name'});
  }
  
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

/**
 * Fill people in DB 
 **/
dbPromise.then(function(db){
  var tx = db.transaction('people', 'readwrite');
  var store = tx.objectStore('people');

  const names = [
    'David Votrubec',
    'Sharon Smiley',
    'David Pluhar',
    'Sharon Stone',
    'Smiley Blowjob',
    'Jesus is the Devil',
    'Devil is the lived backwards',
    'Broken Liver',
    'James Dean',
    'Eliska Votrubcova'
  ];

  const animals = [
    'dog',
    'doggy',
    'cat'
  ];
  const max = animals.length - 1;

  for(name of names) {
    let index = randomIntFromInterval(0, max);
    let addAge = randomIntFromInterval(3, 45);
    
    store.put({
      name: name,
      animal: animals[index],
      age: index * 10 + addAge
    });
  }

  return tx.complete;
}).then(() => console.log('people added'));


/**
 * Read people from DB 
 **/
dbPromise.then(db => {
  const tx = db.transaction('people');
  const store = tx.objectStore('people');

  return store.getAll(); // promise
}).then(people => {
  console.log('people', people);
});

// helper function
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}