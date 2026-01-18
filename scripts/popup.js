document.getElementById('sendBtn').addEventListener('click', () => {
    const docURL = document.getElementById('textInput').value;

    if (docURL.startsWith('https://docs.google.com/document/d/')) {
        const pathsegments = docURL.split('/');
        const docId = pathsegments[5];
        console.log(docId);
        setId(docId).then(response => {
            const captionText = document.getElementById('captionText');
            captionText.textContent = 'Set connected document to: ' + docId;//change docId to doc title
            captionText.style.display = 'block';
        })
        // chrome.runtime.sendMessage({ action: 'updateDocsLink', id: docId}, (response) => {
        //     if (response.success) {
        //         console.log('inserted text successfully');
        //     } else {
        //         console.error('Error:', response.error);
        //     }
        // })
    } else {
        const captionText = document.getElementById('captionText');
        captionText.textContent = 'Invalid input! Not a Google document URL!';
        captionText.style.display = 'block';
    }
})

async function setId(docId) {
    await chrome.storage.local.set({ docId: docId });
    return true;
}