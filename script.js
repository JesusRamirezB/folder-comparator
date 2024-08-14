// Function to compare folders
async function compareFolders() {
    const sourceFolder = document.getElementById('sourceFolder').files;
    const destinationFolder = document.getElementById('destinationFolder').files;
    const resultDiv = document.getElementById('result');
    const statusDiv = document.getElementById('status');

    if (sourceFolder.length === 0 || destinationFolder.length === 0) {
        resultDiv.innerHTML = "<p>Please select both source and destination folders.</p>";
        return;
    }

    // Map files in both folders
    const sourceFiles = await mapFiles(sourceFolder);
    const destinationFiles = await mapFiles(destinationFolder);

    let allFilesIdentical = true;
    let resultHtml = "<h3>Comparison Results:</h3><ul>";

    // Compare files in source with destination
    for (const fileName in sourceFiles) {
        if (destinationFiles[fileName]) {
            const { identical } = await compareFileContents(sourceFiles[fileName], destinationFiles[fileName], fileName);
            if (identical) {
                resultHtml += `<li class="file-status passed">${fileName}</li>`;
            } else {
                allFilesIdentical = false;
                resultHtml += `<li class="file-status failed">${fileName}</li>`;
            }
        } else {
            allFilesIdentical = false;
            resultHtml += `<li class="file-status failed">Missing in destination: ${fileName}</li>`;
        }
    }

    // Check for extra files in destination
    for (const fileName in destinationFiles) {
        if (!sourceFiles[fileName]) {
            allFilesIdentical = false;
            resultHtml += `<li class="file-status failed">Extra file in destination: ${fileName}</li>`;
        }
    }

    // Update status
    statusDiv.innerHTML = allFilesIdentical 
        ? '<span class="status-text passed">Passed</span>' 
        : '<span class="status-text failed">Failed</span>';

    resultDiv.innerHTML = resultHtml;
}

// Function to map files in the folder (ignoring folder structure)
const mapFiles = async (fileList) => {
    const fileMap = {};

    Array.from(fileList).forEach(file => {
        const fileName = file.name; // Use only the file name
        fileMap[fileName] = file;
    });

    return fileMap;
};

// Function to compare the contents of two files
const compareFileContents = async (file1, file2, fileName) => {
    if (file1.size !== file2.size) {
        return { fileName, identical: false };
    }

    try {
        const [file1Content, file2Content] = await Promise.all([
            readFileAsText(file1),
            readFileAsText(file2)
        ]);

        // Normalize line endings to compare text files accurately
        const normalizeLineEndings = (text) => text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
        const normalizedFile1Content = normalizeLineEndings(file1Content);
        const normalizedFile2Content = normalizeLineEndings(file2Content);

        return { fileName, identical: normalizedFile1Content === normalizedFile2Content };
    } catch (error) {
        throw new Error(`Error reading files: ${error.message}`);
    }
};

// Function to read file content as text
const readFileAsText = (file) => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
        reader.readAsText(file);
    });
};
