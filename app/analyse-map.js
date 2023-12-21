
// This code reads a json file from provided process.argv[2] and loops through each object and prints the value to console
const fs = require('fs');
const util = require('util');

const filePath = process.argv[2];
console.log(`filePath: ${filePath}`);

const readMap = function() {  
  const readFile = util.promisify(fs.readFile);
  return readFile(`${filePath}.json`, 'utf8');
}

// this function takes a key value map, where the value is an array
// it returns a new map where the repeated values become the keys and the values are the keys from the original map
// e.g. {a: [1, 2], b: [2, 3]} becomes {1: [a], 2: [a, b], 3: [b]}
const reverseMap = function(map) {
  console.log("reverseMap called");
  const reversedMap = {};
  Object.keys(map).forEach(function(key) {
    map[key].forEach(function(value) {
      if (reversedMap[value]) {
        reversedMap[value].push(key);
      } else {
        reversedMap[value] = [key];
      }
    });
  });
  return reversedMap;
}

// this function saves the reversed map to a file
const writeMap = function(map) {
  console.log("writing map");
  const writeFile = util.promisify(fs.writeFile);
  const mapString = JSON.stringify(map, null, 2);
  return writeFile(`${filePath}-reversed.json`, mapString);
}

readMap()
    .then(JSON.parse)
    .then(reverseMap)
    .then(writeMap)
    .catch(console.error);
