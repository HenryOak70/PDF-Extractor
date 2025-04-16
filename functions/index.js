const pdfParser = require('./pdfParser');
const imageExtractor = require('./imageExtractor');
const textExtractor = require('./textExtractor');
const pageExtractor = require('./pageExtractor');
const { convertPdfToImage, getPdfPageCount } = require('./converter');
const { extractStructuredText } = require('./textExtractorAdvanced');

module.exports = {
    pdfParser,
    imageExtractor,
    textExtractor,
    pageExtractor,
    convertPdfToImage,
    getPdfPageCount,
    extractStructuredText,
};