// Entrypoint for a node module that imports the github-client module

const githubClient = require('./github-client');

const repoName = process.argv[2];

console.log(`Getting pulls for ${repoName}`);

const fileMap = {};

// this function reads the arguments passed to the script REPO_PATH and calls getPulls
const getNextPulls = function(page) {
  return githubClient.getClosedPulls(repoName, page);
};

const getFiles = function(pullNumber) {
  return githubClient.getFiles(repoName, pullNumber);
}

const testFileRegex = /.*org.vena.qa.api.*\.java/;
const codeFileRegex = /mt-parent.*org.vena.*\.java/;

const updateMap = function(files) {
  console.log("updateMap called");

  const testFiles = [];
  const codeFiles = [];

  const fileNames = files.map(function(file) {
    if (testFileRegex.test(file.filename)) {
      testFiles.push(file.filename);
    }
    if (codeFileRegex.test(file.filename)) {
      codeFiles.push(file.filename);
    }
    return file.filename
  });

  console.log(`fileNames.length: ${fileNames.length}`);
  console.log(`testFiles.length: ${testFiles.length}`);
  console.log(`code.length: ${codeFiles.length}`);

  if (testFiles.length === 0 || codeFiles.length === 0) {
    console.log("No test or code files found");
    return; 
  }

    console.log(">>>>>>>>>>>>>>>>>>>>>>>> Found test and code files");

  codeFiles.forEach(function(codeFile) {
    if (fileMap[codeFile]) {
      const dedupedTestFiles = [...new Set([...fileMap[codeFile], ...testFiles])];
      fileMap[codeFile] = dedupedTestFiles;
    } else {
      fileMap[codeFile] = testFiles;
    }
  });

  console.log(`fileMap.length: ${Object.keys(fileMap).length}`);
};

// this function writes the fileMap to a file
const writeMap = function() {
  console.log("writing map");
  console.log(`fileMap.length: ${Object.keys(fileMap).length}`);
  const fs = require('fs');
  const util = require('util');
  const writeFile = util.promisify(fs.writeFile);
  const mapString = JSON.stringify(fileMap, null, 2);
  return writeFile('../data/fileMap.json', mapString);
};

const main = async function() {
  // number of pages to get (30 PRs per page) - Nothing found until 300
  let pageNumber = 300;
  while (pageNumber > 0) {
    console.log("#############################################");
    console.log(`Getting pulls for page ${pageNumber}`);
    try {
      const pulls = await getNextPulls(pageNumber);
      const pullsData = pulls.data;
      // For each pull request, get the files
      for (const pull of pullsData) {
        console.log('-----------------------------------');
        console.log(`Evalutating pull request ${pull.merged_at} ${pull.number}`);
        // skip if pull request is not merged
        if (pull.merged_at === null) {
          console.log(`Skipping pull request ${pull.number}`);
          continue;
        }
        console.log(`Getting files for pull request ${pull.number}`);

        // get files for pull request
        try {
          const files = await getFiles(pull.number);
          
          // update file to test map
          updateMap(files.data);
        } catch (err) {
          console.log("*******************ERROR************************");
          console.log(`Error getting files for pull request ${pull.number}`);
          console.log(err);
        }
      }
    } catch (err) {
      console.log("*******************ERROR************************");
      console.log(`Error getting pulls for page ${pageNumber}`);
      console.log(err);

      // Sleep for 1 minute
      console.log("Sleeping for 1 minute");
      await new Promise(resolve => setTimeout(resolve, 60000));
      console.log("Waking up");
      continue;
    }
    pageNumber--;
  }
  console.log("\n\n\n");
  // Write to file
  writeMap();
  console.log("Done");
}

main();
