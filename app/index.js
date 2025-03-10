'use strict';
const fs = require('fs');
const path = require('path');
const jsonexport = require('jsonexport');
const { promisify } = require('util');

const readFileAsync = promisify(fs.readFile);
const writeFileAsync = promisify(fs.writeFile);
const readdirAsync = promisify(fs.readdir);

async function convertJsonToCsv(jsonFilePath) {
    try {
        const jsonContent = await readFileAsync(jsonFilePath);
        const jsonData = JSON.parse(jsonContent);
        
        return new Promise((resolve, reject) => {
            jsonexport(jsonData, (err, csv) => {
                if (err) reject(err);
                else resolve(csv);
            });
        });
    } catch (err) {
        console.error(`Error processing ${jsonFilePath}:`, err);
        throw err;
    }
}

async function processJsonFiles() {
    try {
        const dataDir = '../data';
        const files = await readdirAsync(dataDir);
        const jsonFiles = files.filter(file => file.endsWith('.json'));

        console.log(`Found ${jsonFiles.length} JSON files to process`);

        for (const jsonFile of jsonFiles) {
            try {
                const inputPath = path.join(dataDir, jsonFile);
                const outputPath = path.join(dataDir, `out-${jsonFile.replace('.json', '.csv')}`);

                console.log(`Processing ${jsonFile}...`);
                const csv = await convertJsonToCsv(inputPath);
                await writeFileAsync(outputPath, csv, 'utf8');
                console.log(`Successfully converted ${jsonFile} to ${path.basename(outputPath)}`);
            } catch (err) {
                console.error(`Failed to process ${jsonFile}:`, err);
                // Continue with next file even if one fails
                continue;
            }
        }
        console.log('All files processed');
    } catch (err) {
        console.error('Error reading directory:', err);
        throw err;
    }
}

// Start processing
processJsonFiles().catch(err => {
    console.error('Processing failed:', err);
    process.exit(1);
});
