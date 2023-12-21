// This program reads a json file provided as process.argv[2] which is a key value map where the value is an array of tests
// it takes repo name from process.argv[3] and calls the getFiles function from app/github-client.js to get the files for the PR
// it reads the PR number from process.argv[4]
// It calls the getFiles function from app/github-client.js to get the files for the PR
// For each file it gets the value property from the file object to dermine which tests to run

const fs = require('fs');
const util = require('util');
const githubClient = require('./github-client');
const helper = require('./helper');

const filePath = process.argv[2];
const repoName = process.argv[3];
const prNumber = process.argv[4];

console.log(`filePath: ${filePath}`);
console.log(`repoName: ${repoName}`);
console.log(`prNumber: ${prNumber}`);

let map = {};

const readMap = function() {  
    console.log("readMap called");
    const readFile = util.promisify(fs.readFile);
    return readFile(`${filePath}.json`, 'utf8');
}

const parseMap = function(mapString) {
    console.log("parseMap called");
    map = JSON.parse(mapString);
    return map;
}

const getFiles = function() {
    console.log("getFiles called");
    return githubClient.getFiles(repoName, prNumber);
}

const lookupTests = function(files) {
    console.log("lookupTests called");
    
    const { testFiles, codeFiles } = helper.sortFileTypes(files);

    console.log(`codeFiles.length: ${codeFiles.length}`);
    console.log(`testFiles.length: ${testFiles.length}`);
    
    console.log(codeFiles);

    let tests = [];

    codeFiles.forEach(function(codeFile) {
        const testFiles = map[codeFile];
        console.log(`testFiles.length: ${testFiles.length} for ${codeFile}`);
        if (testFiles) {
            tests.push(...testFiles);
        }
    });

    tests = [...new Set([...tests], ...testFiles)];

    console.log(`tests.length: ${tests.length}`);

    return tests;
}

const writeTests = function(tests) {
  console.log("writing map");
  const writeFile = util.promisify(fs.writeFile);
  const mapString = JSON.stringify(tests, null, 2);
  return writeFile(`${filePath}-${prNumber}.json`, mapString);
}

readMap()
    .then(parseMap)
    .then(getFiles)
    .then(function(files) {
        return lookupTests(files.data);
    })
    .then(writeTests)
    .catch(function(err) {
        console.log(err);
    });
