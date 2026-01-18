// Update token value display when slider changes and save to storage
document.getElementById('tokenSlider').addEventListener('input', (e) => {
    const value = e.target.value;
    document.getElementById('tokenValue').textContent = value;
    chrome.storage.local.set({ maxTokens: parseInt(value) });
});

// Load saved max_tokens value on popup open
chrome.storage.local.get('maxTokens', (result) => {
    const savedValue = result.maxTokens || 150;
    document.getElementById('tokenSlider').value = savedValue;
    document.getElementById('tokenValue').textContent = savedValue;
});

//same for scope
document.getElementById('scopeSlider').addEventListener('input', (e) => {
    const value = e.target.value;
    document.getElementById('scopeValue').textContent = value;
    chrome.storage.local.set({ maxScope: parseInt(value) });
});

chrome.storage.local.get('maxScope', (result) => {
    const savedValue = result.maxScope || 150;
    document.getElementById('scopeSlider').value = savedValue;
    document.getElementById('scopeValue').textContent = savedValue;
});

document.getElementById('sendBtn').addEventListener('click', () => {
    const docURL = document.getElementById('textInput').value;

    if (docURL.startsWith('https://docs.google.com/document/d/')) {
        const pathsegments = docURL.split('/');
        const docId = pathsegments[5];
        console.log(docId);
        setId(docId).then(() => {
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