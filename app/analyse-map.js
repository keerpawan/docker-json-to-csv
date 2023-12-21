
// This code reads a json file from provided process.argv[2] and loops through each object and prints the value to console
const fs = require('fs');
const util = require('util');

const filePath = process.argv[2];
console.log(`filePath: ${filePath}`);

const readMap = function() {  
  const readFile = util.promisify(fs.readFile);
  return readFile(`${filePath}.json`, 'utf8');
}

let describeMap = {}
let describeReverseMap = {}

// this function takes a key value map, where the value is an array
// it returns a new map where the repeated values become the keys and the values are the keys from the original map
// e.g. {a: [1, 2], b: [2, 3]} becomes {1: [a], 2: [a, b], 3: [b]}
const reverseMap = function(map) {
  console.log("reverseMap called");
  const reversedMap = {};
  Object.keys(map).forEach(function(key) {
    describeMap[key] = map[key].length;
    map[key].forEach(function(value) {
      if (reversedMap[value]) {
        reversedMap[value].push(key);
      } else {
        reversedMap[value] = [key];
      }
      describeReverseMap[value] = reversedMap[value].length;
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

// this function saves the describe map to a file
const writeDescribeMap = function() {
  console.log("writing describe map");
  const writeFile = util.promisify(fs.writeFile);
  const mapString = JSON.stringify(describeMap, null, 2);
  return writeFile(`${filePath}-describe.json`, mapString);
}

// this function saves the describe reverse map to a file
const writeDescribeReverseMap = function() {
  console.log("writing describe reverse map");
  const writeFile = util.promisify(fs.writeFile);
  const mapString = JSON.stringify(describeReverseMap, null, 2);
  return writeFile(`${filePath}-describe-reversed.json`, mapString);
}

readMap()
    .then(JSON.parse)
    .then(reverseMap)
    .then(writeMap)
    .then(writeDescribeMap)
    .then(writeDescribeReverseMap)
    .catch(console.error);
