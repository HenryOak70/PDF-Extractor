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
        } else {
            console.log(`${pdfFileName} exists.` )
        }

        const totalPages = await functions.getPdfPageCount(pdfFilePath)
        console.log(`total pages in PDF file: ${totalPages}`);

    /*/ --- extract the pages from the pdf and save them as images
        await functions.pageExtractor.extractPageImages(pdfFilePath);
*/
        const currentPage = './pages/page_24.png'

    // --- enhance  the pages images
        await functions.pageEnhansor(currentPage);


    // ---- extract the structured text from the pages
        const extractedText = await functions.extractStructuredText(currentPage);
        console.log(`${bookName} text extracted successfully.`);


    /*/ ---- extract the images from the pages
        await functions.imageExtractor.extractImages(pdfData);
*/

    } catch (err) {
        console.error('Error during extraction:', err);
    }
}

async function main() {
    const bookName = await getBookName();
    await extractPdfContent(bookName);
}

main();