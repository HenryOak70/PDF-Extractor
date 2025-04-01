const { exec } = require("child_process");
const path = require("path");

/*
--- converts a PDF page to an image using ImageMagic
* @param {string} pdfPath - path to the PDF file
* @param {Promise<number>} - resolves with tne number of pages
*/
const getPdfPageCount = (pdfPath) => {
    return new Promise((resolve, reject) => {
        exec(`pdfinfo "${pdfPath}`, (err, stdout, stderr) => {
            if (err) {
                reject(`Error getting page count: ${stderr}`);
                return;
            }

            const match = stdout.match(/Pages:\s+(\d+)/);
            if (match) {
                resolve(parseInt(match[1], 10));
            } else {
                reject("Error: Unable to get the page count.");
            }
        });
    });
};

/*
--- converts a PDF page to an image using ImageMagic
* @param {string} pdfPath - path to the PDF file
* @param {number} pageNumber - the page number to convert
* @param {string} outputDir - directory to save the images
* @param {Promise<string>} - resolves with the output image path
* @param {Promise<number>} - resolves with tne number of pages
*/

const convertPdfToImage = (pdfPath, pageNumber, outputDir) =>{
    return new Promise((resolve, reject) => {
        const outputImagePath = path.join(outputDir, `page-${pageNumber}.png`);
        const cmd = `magick -density 300 "${pdfPath}[${pageNumber}]" -quality 100 "${outputImagePath}"`;
//        const cmd = `magick convert -density 300 "${pdfPath}[${pageNumber}]" -quality 100 "${outputImagePath}"`;

        exec(cmd, (err, stdout, stderr) => {
            if (err) {
                reject(`Error: ${stderr}`);
            } else {
                resolve(outputImagePath);
            }
        });
    });
};

module.exports ={ convertPdfToImage, getPdfPageCount };