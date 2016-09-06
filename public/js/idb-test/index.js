import idb from 'idb';

var dbPromise = idb.open('test-db', 4, function(updateDb) {
  // This callback is called when DB instance of that version is created

  switch(updateDb.oldVersion) {
    // The switch for DB update is the only switch where you should NOT use the break statement
    case 0:
      var keyValStore = updateDb.createObjectStore('keyval');
      keyValStore.put("world", "hello 1");
    case 1:
      updateDb.createObjectStore('people', {keyPath: 'name'});
    case 2:
      // create index on people by animal
      var peopleStore = updateDb.transaction.objectStore('people');
      // create index named 'animals' by property animal
      peopleStore.createIndex('animals', 'animal');
    case 3:
      // create index on people by age
      var peopleStore = updateDb.transaction.objectStore('people');
      peopleStore.createIndex('age', 'age');
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
  const peopleStore = tx.objectStore('people');

  //return store.getAll(); // promise
  const animals = peopleStore.index('animals');
  return animals.getAll(); 
}).then(people => {
  console.log('people by animals', people);
});

dbPromise.then(db => {
  const tx = db.transaction('people');
  const peopleStore = tx.objectStore('people');

  const peopleByAge = peopleStore.index('age');
  return peopleByAge.openCursor(); 
}).then(function logPerson(personCursor) {
  
  if (!personCursor){
    return;
  }

  console.log('cursor at', personCursor.value.name, personCursor.value.age);

  // iterative promise
  return personCursor.continue().then(logPerson);
}).then(() => {
  console.log('All people logged');
});

// helper function
function randomIntFromInterval(min,max)
{
    return Math.floor(Math.random()*(max-min+1)+min);
}