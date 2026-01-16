importScripts('../config.js');

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === 'fetchContent') {
        fetch(request.url)
            .then(response => response.text())
            .then(content => {
                sendResponse({ success: true, content: content});
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });
        
        return true; // Keep message channel open for async response
    }

    else if (request.action === 'summarize') {
        summarize(request.text)
            .then(summary => {
                sendResponse({ success: true, summary: summary });
            })
            .catch(error => {
                sendResponse({ success: false, error: error.message });
            });

        return true;
    }
});

async function summarize(text) {
    // Get HF_TOKEN from huggingface.co/settings/tokens
    
    const response = await fetch(
        'https://router.huggingface.co/v1/chat/completions',
        {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${HF_TOKEN}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: 'meta-llama/Llama-3.1-8B-Instruct', // or another available model
                messages: [
                    { 
                        role: 'user', 
                        content: `Summarize the following text in 2-3 sentences. Only return the summary, nothing else:\n\n${text.substring(0, 2000)}` 
                    }
                ],
                max_tokens: 150,
                temperature: 0.3
            })
        }
    );

    if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`API error (${response.status}): ${errorText}`);
    }
    
    const data = await response.json();
    
    if (data.error) {
        throw new Error(data.error);
    }
    
    return data.choices[0].message.content;
}