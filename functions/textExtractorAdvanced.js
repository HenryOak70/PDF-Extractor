const tesseract = require('tesseract.js');
const fs = require('fs');
const path = require('path');

const stepsFolder = path.join(__dirname, '../steps');

/* --- extract the text from an image
* @param {string} imagePath - path to the image file
*/

async function extractStructuredText(imagePath) {
    try {
        console.log(`Processing: ${imagePath}`);
    // --- run OCR
        const {data: { text} } =await tesseract.recognize(imagePath);
        const { cleanedText, choices } = cleanExtractedText(text);

    // --- split the text in the page based on the numbers on the beginning of the blocks
        const blocks = text.split(/\n\s*(?=\d+)/).map(block => block.trim()).filter(Boolean);

        for (const block of blocks) {
            const match = block.match(/^(\d+)\s*(.*?)(\s*If you.*turn to \d+.*)?$/s);
            if (!match) continue;

        // --- set the SECTION, TEXT and CHOICES
            const number = match[1];
            const summary = match[2].trim();
            const choicesText = match [3] || '';

        // --- create JSON object
            const jsonData = { summary, choices };

        // --- save the file
            const outputPath = path.join(stepsFolder, `${number}.json`);
            fs.writeFileSync(outputPath, JSON.stringify(jsonData, null, 2));

            console.log(`Saved: ${outputPath}`);
        }

    } catch (err) {
        console.error('Error extracting structured text:', err);
    }
}

function cleanExtractedText(text) {
// --- fix common OCR errors
    let cleanedText = text
    .replace(/\blf\b/g, "If")
    .replace(/\bTm\b/g, "I'm")
    .replace(/\bum\b/g, "turn")
    .replace(/\bvou\b/g, "you")
    .replace(/\bV\b/g, "I")
    .replace(/[\n\r]+/g, ' ')
    .replace(/\s{2,}/g, ' ');

// --- Extract structured choices
    const choices = [];
    const choiceRegex = /If you(.*?)turn to (\d+)/gi;
    let match;

    while ((match = choiceRegex.exec(cleanedText)) !== null) {
        choices.push({
            text: match[1].trim(),
            next: parseInt(match[2], 10),
        });
    }
    return { cleanedText, choices };
}

module.exports = { extractStructuredText, cleanExtractedText };