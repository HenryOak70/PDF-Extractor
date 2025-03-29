const fs = require('fs');
const path = require('path');

async function extractImages(pdfData) {
    let imageCounter = 1;

    if (pdfData && pdfData.pages) {
        for (const page of pdfData.pages) {
        // --- check if the page contains image data
            if (page.pageInfo && page.pageInfo.resources && page.pageInfo.XObject) {
                const xObjects = page.pageInfo.resources.XObject;
                for (const xObjectName in XObjects) {
                    if (xObjects.hasOwnProperty(xObjectName) && xObjectName.startsWith('Im')) {
                        const image = xObjects[xObjectName];
                        if (image.data) {
                            const imageData = image.data;
                            const imageFormat = image.Subtype === 'Image' ? (image.Filter === 'DCTDecode' ? 'jpg' : (image.Filter === 'FlateDecode' ? 'png' : 'unknown')) : 'unknown';
                            const saveImageName = `${imageCounter}.${imageFormat.toLowerCase()}`;
                            const imagePath = path.join(__dirname, '../images', saveImageName);

                            try {
                                fs.writeFileSync(imagePath, imageData, 'binary');
                                console.log(`Image saved to: ${imagePath}`);
                                imageCounter++;
                            } catch (err) {
                                console.error(`Error saving image ${saveImageName}:`, err);
                            }
                        }
                    }
                }
            } else {
                console.log(`No images found on page ${imageCounter}.`);
            }
        }
    } else {
        console.log('No pages found in this PDF.');
    }
}

module.exports = { extractImages };