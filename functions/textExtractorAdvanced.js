const tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');
const { findSections } = require('./utils');


const stepsFolder = path.join(__dirname, '../steps');

/* --- extract the text from an image
* @param {string} imagePath - path to the image file
*/

async function extractStructuredText(imagePath) {
    try {
        console.log(`Processing: ${imagePath}`);

    // --- extract text using OCR
        const { data: { text } } = await tesseract.recognize(imagePath, 'eng');
        if (!text) {
            console.log('No text found.');
            return;
        }

    // --- identify the text lines
        const lines = text.split('\n');

/**
 * if there is a image between the blocks
 * insert the call to the imageExtractor
 */

    // --- get the sections information (number and line)
        const sections = await findSections(lines);

        if(sections.length === 0) return console.log('No section numbers found.');

        for (let i = 0; i < sections.length; i++) {
            const currentSection = sections[i];
            const sectionNumber = currentSection.number;
            const startLineIndex = currentSection.startIndex;
            const nextSection = sections[i + 1];
        // --- check if there is another section and define the limits
            const endLineIndex = nextSection ? nextSection.startIndex - 2 : lines.length - 1

            console.log(`Processing section: ${sectionNumber} (lines ${startLineIndex}-${endLineIndex})`);

        // --- extract the sections text
            const extractedTextLines = lines.slice(startLineIndex, endLineIndex + 1);
            const extractedText = extractedTextLines.join(' ');

        // --- clean and structure text
            const { summary, choices } = cleanExtractedText(extractedText);

        // --- create JSON object
            const jsonData = { summary, choices };

        // --- save the file
            const outputPath = path.join(stepsFolder, `${sectionNumber}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));
            console.log(`Saved: ${outputPath}`);
        }

    } catch (err) {
        console.error('Error extracting structured text:', err);
    }
}

/**
 * clean extracted text and extract structured choices.
 * @param {string} text - raw text from OCR
 * @returns {Object} - contains cleaned text and choices.
 */

function cleanExtractedText(text) {
// --- fix common OCR errors
    let cleanedText = text
    .replace(/\blf\b/g, "If")
    .replace(/\bTm\b/g, "I'm")
    .replace(/\bum\b/g, "turn")
    .replace(/\blfyou\b/g, "If you")
    .replace(/\bvou\b/g, "you")
    .replace(/\bTf\b/g, "If")
    .replace(/\btum\b/g, "turn")
    .replace(/\bV\b/g, "I")
    .replace(/[\n\r]+/g, ' ')
    .replace(/\s{2,}/g, ' ');

// --- Extract structured choices
    const choices = [];
    const choiceRegex = /.If you(.*?)turn to (\d+)/gi;
    let match;

    while ((match = choiceRegex.exec(cleanedText)) !== null) {
        choices.push({
            text: match[1].trim(),
            next: parseInt(match[2], 10),
        });
    }

// --- trim the cleaned text for the summary
    const summaryEndIndex = cleanedText.indexOf('. If you');
    const summary = summaryEndIndex !== -1 ? cleanedText.substring(0, summaryEndIndex).trim() : cleanedText.trim();
console.log(cleanedText);

    return { summary, choices };
}

module.exports = { extractStructuredText };