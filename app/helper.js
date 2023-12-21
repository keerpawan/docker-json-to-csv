const sortFileTypes = function(files) {
    const testFileRegex = /.*org.vena.qa.api.*\.java/;
    const codeFileRegex = /mt-parent.*org.vena.*\.java/;
  
    const testFiles = [];
    const codeFiles = [];
  
    const fileNames = files.map(function (file) {
      if (testFileRegex.test(file.filename)) {
        testFiles.push(file.filename);
      }
      if (codeFileRegex.test(file.filename)) {
        codeFiles.push(file.filename);
      }
      return file.filename;
    });
    return { fileNames, testFiles, codeFiles };
  }

exports.sortFileTypes = sortFileTypes;
