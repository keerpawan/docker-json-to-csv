'use strict';

const { Octokit } = require("@octokit/core");
// or: import { Octokit } from "@octokit/core";

// This is a module that loads environment variables from a .env file into process.env
require('dotenv').config();

// Octokit.js
// https://github.com/octokit/core.js#readme
const octokit = new Octokit({
    auth: process.env.GITHUB_TOKEN
})

const getClosedPullsUrl = function(repoName, page = 1) {
    // defaults to 30 PRs per page
    return `GET /repos/${repoName}/pulls?page=${page}&state=closed&per_page=100`
}

const getFilesUrl = function(repoName, pullNumber) {
    return `GET /repos/${repoName}/pulls/${pullNumber}/files`
}

// This function takes a url and options and returns a promise for the request
const makeRequest = function(url, repoName) {
  const repoNames = repoName.split('/');
   return octokit.request(url, {
      headers: {
        owner: repoNames[0],
        repo: repoNames[1],
        'X-GitHub-Api-Version': '2022-11-28'
      }
    })
};

// this function gets pulls for a repo
const getClosedPulls = function(repoName, page) {
    const url = getClosedPullsUrl(repoName, page);
    return makeRequest(url, repoName);
};

const getFiles = function(repoName, pullNumber) {
    const url = getFilesUrl(repoName, pullNumber);
    return makeRequest(url, repoName);
};

exports.getClosedPulls = getClosedPulls;
exports.getFiles = getFiles;
