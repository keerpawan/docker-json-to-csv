// Entrypoint for a node module that imports the github-client module

const githubClient = require('./github-client');

const repoName = process.argv[2];
const startPage = process.argv[3];
const lastPR = process.argv[4];

console.log(`Getting pulls for ${repoName} page: ${startPage} after PR: ${lastPR}`);

const testFileRegex = /.*org.vena.qa.api.*\.java/;
const codeFileRegex = /mt-parent.*org.vena.*\.java/;
const releaseTitleRegex = /Release.*/;
const fileMap = {};

// this function reads the arguments passed to the script REPO_PATH and calls getPulls
const getNextPulls = function(page) {
  return githubClient.getClosedPulls(repoName, page);
};

const getFiles = function(pullNumber) {
  return githubClient.getFiles(repoName, pullNumber);
}

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

  console.log(">>>>>>>>>>>>>>>>>>>>>>>> Found test and code files <<<<<<<<<<<<<<<<<<<<<<<<<<<<");

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
const writeMap = function(fileName) {
  console.log("writing map");
  console.log(`fileMap.length: ${Object.keys(fileMap).length}`);
  const fs = require('fs');
  const util = require('util');
  const writeFile = util.promisify(fs.writeFile);
  const mapString = JSON.stringify(fileMap, null, 2);
  return writeFile(`../data/${fileName}.json`, mapString);
};

const fullScan = async function() {
  let finalPullNumer;
  // number of pages to get (30 PRs per page) - Nothing found until page 76 or 9000th PR early 2020
  let pageNumber = startPage ? parseInt(startPage) : 76;
  const lastPRNumer = lastPR ? parseInt(lastPR) : 0;
  while (pageNumber > 0) {
    console.log("#############################################");
    console.log(`Getting pulls for page ${pageNumber}`);
    try {
      const pulls = await getNextPulls(pageNumber);
      const pullsData = pulls.data;
      // For each pull request, get the files
      for (const pull of pullsData) {
        console.log('-----------------------------------');
        console.log(`Evalutating pull request ${pull.merged_at} ${pull.number} "${pull.title}"`);
        // skip if pull request is not merged or not the last PR to start from
        if (pull.merged_at === null || pull.number < lastPRNumer || releaseTitleRegex.test(pull.title)) {
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
        finalPullNumer = pull.number;
      }
    } catch (err) {
      console.log("*******************ERROR************************");
      console.log(`Error getting pulls for page ${pageNumber}`);
      console.log(err);

      // Sleep for 1 minute
      const rateLimitReset = err.response.headers['x-ratelimit-reset'];
      const sleepDuration = rateLimitReset ? (rateLimitReset - Math.floor(Date.now() / 1000)) : 60;
      console.log(`Sleeping for ${sleepDuration} seconds`);
      await new Promise(resolve => setTimeout(resolve, sleepDuration * 1000));
      console.log("Waking up");
      continue;
    }
    pageNumber--;
  }
  console.log("\n\n\n");
  // Write to file
  writeMap(finalPullNumer);
  console.log("Done");
}

fullScan();
