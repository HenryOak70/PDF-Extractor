const tesseract = require('tesseract.js');
const path = require('path');
const fs = require('fs');

// this function extracts the text from the page images extracted from the PDF
async function extractTextFromImage(imagePath) {
    try {
        console.log(`Processing image: ${imagePath}`);

        const { data } = await tesseract.recognize(imagePath, 'eng', {
        // --- logs OCR progress
            logger: (m) => console.log(m),
        });

        console.log('Extracted text (OCR):');
        console.log(data.text);

        return data.text;
    } catch (err) {
        console.error(`Error extractingtext from ${imagePath}:`, err);
        return null;
    }
}

async function extractTextFromPage() {
    const pagesFolderPath = path.join(__dirname, '../pages');

// --- get the page file
    const files = fs.readdirSync(pagesFolderPath).filter(file => file.endsWith('.png'));

    if (files.length === 0) {
        console.log('No pages available.');
        return;
    }
// --- pick the page to work with (e.g. 6)
    const pagePath = path.join(pagesFolderPath, files[6]);
    return await extractTextFromImage(pagePath);
}

module.exports = { extractTextFromPage };