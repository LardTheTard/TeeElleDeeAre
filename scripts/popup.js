document.getElementById('sendBtn').addEventListener('click', () => {
    const docURL = document.getElementById('textInput').value;

    if (docURL.startsWith('https://docs.google.com/document/d/')) {
        const pathsegments = docURL.split('/');
        const docId = pathsegments[5];
        console.log(docId);
        chrome.runtime.sendMessage({ action: 'updateDocsLink', id: docId}, 
        (response) => {
            if (response.success) {
                console.log('inserted text successfully');
            } else {
                console.error('Error:', response.error);
            }
        }
    )
    } else {
        const captionText = document.getElementById('captionText');
        captionText.textContent = 'Invalid input! Not a Google document URL!';
        captionText.style.display = 'block';
    }
})