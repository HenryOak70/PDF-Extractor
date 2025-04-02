const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const { convertPdfToImage, getPdfPageCount } = require('./converter');

async function extractPageImages(pdfFilePath) {
    const pagesFolderPath = path.join(__dirname, '../pages/img');
    const leftRightFolderPath = path.join(__dirname, '../pages');

    try {
// TEST - get a specific range of pages
        const numPages = 2;
/* --- to get all the pages
        const numPages = await getPdfPageCount(pdfFilePath);
        console.log(`PDF has ${numPages} pages.`);
*/

        for (let i = 0; i < numPages; i++) {
            try {
            // --- convert PDF page to image
                const imagePath = await convertPdfToImage(pdfFilePath, i, pagesFolderPath);
                console.log(`Page ${i + 1} saved to ${imagePath}`);

            // --- crop the image into two parts left and right (pages)
                const image = sharp(imagePath);
            // --- get the image dimensions
                const metadata = await image.metadata();
                const width = metadata.width;
                const height = metadata.height;

            // --- name convention for the cropped images
                let leftImagePath, rightImagePath;

            // --- check if it's the cover page
                if (i ===0) {
                    leftImagePath = path.join(leftRightFolderPath, `back_cover.png`);
                    rightImagePath = path.join(leftRightFolderPath, `front_cover.png`);
                } else {
                    leftImagePath = path.join(leftRightFolderPath, `page_${(i - 1) * 2}.png`);
                    rightImagePath = path.join(leftRightFolderPath, `page_${(i - 1) * 2 + 1}.png`);
                }

                const halfWidth = Math.floor(width / 2)

            // --- crop the image left and right parts
                await sharp(imagePath).extract({ left: 0, top: 0, width: halfWidth, height: height }).toFile(leftImagePath);
                await sharp(imagePath).extract({ left: halfWidth, top: 0, width: halfWidth, height: height }).toFile(rightImagePath);

            } catch (err) {
                console.error(`Error converting page ${i}`, err);
                break;
            }
        }
        console.log('Page image extraction complete.');
    } catch (err) {
        console.error('Error extracting page images:', err);
    }
}

module.exports = { extractPageImages };