const fs = require('fs');
const path = require('path');
const readline = require('readline');
const functions = require('./functions');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

// --- path to the books folder
const booksFolderPath = path.join(__dirname, 'books')

// --- prompt for the book name
function getBookName() {
    return new Promise((resolve) => {
        rl.question('Enter the the name of the book file (without extension): ', (bookName) => {
            resolve(bookName);
            rl.close();
        });
    });
}

async function extractPdfContent(bookName) {
    const pdfFileName = `${bookName}.pdf`;
    const pdfFilePath = path.join(booksFolderPath, pdfFileName);

    try {
    // --- check if the PDF file exists
        if (!fs.existsSync(pdfFilePath)) {
            console.error(`Error: PDF file not found at ${pdfFilePath}`);
            return;
        }

        console.log(`Processing PDF file: ${pdfFileName}`);
        const pdfData = await functions.pdfParser.parsePdf(pdfFilePath);
        if (!pdfData) {
            console.error('Failed to parse PDF.');
            return;
        }

        await functions.imageExtractor.extractImages(pdfData);
        await functions.textExtractor.extractText(pdfData);

        console.log('Extraction complete.');

    } catch (err) {
        console.error('Error during extraction:', err);
    }
}

async function main() {
    const bookName = await getBookName();
    await extractPdfContent(bookName);
}

main();