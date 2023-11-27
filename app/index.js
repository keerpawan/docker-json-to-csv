'use strict';
const fs = require('fs');
const jsonexport = require('jsonexport');

const json2csvCallback = function (err, csv) {
  if (err) {
    console.log("error", err);
    throw err;
  }
  fs.writeFile('../data/output.csv', csv, 'utf8', function(err) {
    if (err) {
      console.log('Some error occured - file either not saved or corrupted file saved.');
    } else {
      console.log('It\'s saved!');
    }
  });
};

fs.readFile('../data/input.json', function(err, JSONFile) {
  if (err) throw err;
  const myData = JSON.parse(JSONFile);
  console.log("File read:", myData);
  console.log("Converting file...\n");
  jsonexport(myData, json2csvCallback);
});
