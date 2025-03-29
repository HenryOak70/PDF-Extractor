async function extractText(pdfData) {
    // --- for basic text extraction
    if (pdfData && pdfData.text) {
        console.log('Extract text (Basic):');
        console.log(pdfData.text);
    } else {
        console.log('OCR is needed.');
    }

    const ocrResult = await performOCR(pdfData);
    console.log('Extracted text (OCR):');
    console.log(ocrResult);
}

async function performOCR(pdfData) {


    return;
}

module.exports = { extractText };