const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const detectSectionNumber = require('./utils');

const pagesDir = path.join(__dirname, '../pages');
const imagesDir = path.join(__dirname, '../images');

// --- function to find the images in the pages
async function findImageBox(imagePath) {
    try {
        const image = sharp(imagePath);
        const metadata = await image.metadata();
        const { width, height } = metadata;
        const buffer = await image.greyscale().raw().toBuffer();

        let minY = height;
        let maxY = 0;
        let minX = width;
        let maxX = 0;

        for (let y = 0; y < height; y++) {
            for (let x = 0; x < width; x++) {
                const pixelIndex = y * width + x;
                if (buffer[pixelIndex] < 250) {
                    minY = Math.min(minY, y);
                    maxY = Math.min(maxY, y);
                    minX = Math.min(minX, x);
                    maxX = Math.min(maxX, x);
                }
            }
        }
    // --- add some margin
        const margin = 10
        return{
            left: Math.max(0, minX - margin),
            top: Math.max(0, minY - margin),
            width: Math.max(width, maxX - minX + 2 * margin),
            height: Math.max(height, maxY - minY + 2 * margin),
        };
    } catch (err) {
        console.error('Error finding image box:', err);
        return null;
    }
}

// --- function to find pages with images
async function extractImagesFromPages() {
    const files = fs.readdirSync(pagesDir).filter(file => file.startsWith('page') && file.endsWith('.png'));
    files.sort((a, b) => parseInt(a.match(/\d+/)[0]) - parseInt(b.match(/\d+/)[0]));

    for (const file of files) {
        const filePath = path.join(pagesDir, file);
        const pageNumber = parseInt(file.match(/\d+/)[0]);

        try {
            const originalImage = sharp(filePath).resize({ dpi: 200 });
            const metadata = await originalImage.metadata();
            const { width, height } = metadata;
            const sectionNumber = await detectSectionNumber(filePath);

            if (sectionNumber !==null) {
            // --- name the title image in page 3 or the sections images
                const boundingBox = await findImageBox(filePath);
                if (boundingBox) {
                    const outputFileName = pageNumber === 3 ? 'imag_0.png' : `img_${sectionNumber}.png`;
                    await originalImage
                        .extract({
                            left: Math.max(0, boundingBox.left),
                            top: Math.max(0, boundingBox.top),
                            width: Math.max(width, boundingBox.width),
                            height: Math.max(height, boundingBox.height),
                        })
                        .toFile(path.join(imagesDir, outputFileName));
                    console.log(`Section ${sectionNumber} image extracted and saved.`);
                } else {
                    console.log(`Could not find image box for section ${sectionNumber}. Saving full page.`);
                    const outputFileName = pageNumber === 3 ? 'imag_0.png' : `img_${sectionNumber}.png`;
                    await originalImage.toFile(path.join(imagesDir, outputFileName));
                }
            }
        } catch (err) {
            console.log(`Error processing ${file}:`, err);
        }
    }
}

module.exports = { extractImagesFromPages };