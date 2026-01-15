chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchUrl') {
        fetch(request.url)
            .then(response => response.text())
            .then(content => {
            sendResponse({ success: true, content: content });
            })
            .catch(error => {
            sendResponse({ success: false, error: error.message });
            });
        
        return true; // Keep message channel open for async response
    }
});