const path = require('path');
const fs = require('fs');
const { convertPdfToImage, getPdfPageCount } = require('./converter');

async function extractPageImages(pdfFilePath) {
    const pagesFolderPath = path.join(__dirname, '../pages');

    try {
// TEST - get a specific range of pages
        const numPages = 10
/* --- to get all the pages
        const numPages = await getPdfPageCount(pdfFilePath);
        console.log(`PDF has ${numPages} pages.`);
*/

        for (let i = 0; i < numPages; i++) {
            try {
                const imagePath = await convertPdfToImage(pdfFilePath, i, pagesFolderPath);
                console.log(`Page ${i +1} saved to ${imagePath}`);
            } catch (convertErr) {
                console.error(`Error converting page ${i}`, convertErr);
                break;
            }
        }
        console.log('Page image extraction complete.');
    } catch (err) {
        console.error('Error extracting page images:', err);
    }
}

module.exports = { extractPageImages };