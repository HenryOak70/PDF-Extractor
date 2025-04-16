/**
 * detects the section number from the pages
 * @param {string} imagePath - path to the image file
 * @returns {Promise<number|null} - detected section number or null if is not found
 */

async function findSections(plainTextLines) {
    try {
    // --- use a set to store the section numbers
        const sections = [];
    // --- since errors were detected due to the images
    // --- we'll use this array to keep track of the numbers considered sections
        const detectedNumbers = new Set();

        for (let i = 0; i < plainTextLines.length; i++) {
            const trimmedLine = plainTextLines[i].trim();
            if (/^\d+$/.test(trimmedLine)) {
                const number = parseInt(trimmedLine, 10);
                const previousLine= plainTextLines[i - 1] ? plainTextLines[i - 1].trim() : '';
                const followingLine= plainTextLines[i + 1] ? plainTextLines[i + 1].trim() : '';

                if (previousLine=== '' && followingLine !== '') {
                // --- store the section number and its index line
                    sections.push({number, startIndex: i + 1 });
                    detectedNumbers.add(i);
                }
            }
        }
    // --- sort the array
        sections.sort((a, b) => a.number - b.number);
    // --- filter the non-sequential sections
        const sequentialSections = [];
        if (sections.length > 0) {
            sequentialSections.push(sections[0]);
            for (let i = 1; i < sections.length; i++) {
                if (sections[i].number === sequentialSections[sequentialSections.length - 1].number + 1) {
                    sequentialSections.push(sections[i]);
                }
            }
        }
        return sequentialSections.length > 0 ? sequentialSections : sections;
    } catch (err) {
        console.error("Error detecting the section numbers:", err);
        return [];
    }
}

module.exports = { findSections };