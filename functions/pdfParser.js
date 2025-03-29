const fs = require('fs');
const pdfParse = require('pdf-parse');

async function parsePdf(pdfPath) {
    try {
        const pdfBuffer = fs.readFileSync(pdfPath);
        const data = await pdfParse(pdfBuffer);
        return data;
    } catch (err) {
        console.error('Error parsing PDF:', err);
        return null;
    }
}

module.exports = { parsePdf };