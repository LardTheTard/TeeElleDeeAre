importScripts('../config.js'); //import the hugging face key from config.js that exists
//in root. config.js is in gitignore

// Get token, make new token if not exist
function getToken() {
    return new Promise((resolve, reject) => {
        chrome.identity.getAuthToken({ interactive: true }, (token) => {
            if (chrome.runtime.lastError) {
                return reject(chrome.runtime.lastError);
            }
            resolve(token);
        });
    });
}

//clicked with 's' 't' ''x', sent a message from tooltip.js and now need to access the link's
//inner content for either summarizing or raw display
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

    else if (request.action === 'updateDocsLink') {
        getToken().then(token => {
            if (token) {
                // console.log(token);
                // console.log(request.id);
                // console.log(request.text);
                insertText(request.id, token, request.text)
                    .then(() => {
                        sendResponse({ success: true });
                    })
                    .catch(error => {
                        sendResponse({ success: false, error: error.message });
                    });
            } 
        })
        return true;
    }
});

async function summarize(text) {
    // Get max_tokens from storage, default to 150 if not set
    const { maxTokens } = await chrome.storage.local.get('maxTokens');
    const maxTokensValue = maxTokens || 150;
    let sentenceNum = '';
    if (maxTokensValue <= 150) {
        sentenceNum = '2-3';
    } else if (150 < maxTokensValue && maxTokensValue <= 250) {
        sentenceNum = '3-4';
    } else if (250 < maxTokensValue && maxTokensValue <= 350) {
        sentenceNum = '4-5';
    } else {
        sentenceNum = '5-6';
    }

    
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
                model: 'meta-llama/Llama-3.1-8B-Instruct', 
                messages: [
                    { 
                        role: 'user', 
                        content: `Summarize the following text in ${sentenceNum} sentences. Only return the summary, nothing else:\n\n${text}` 
                    }
                ],
                max_tokens: maxTokensValue,
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

async function insertText(id, token, text) {
    const res = await fetch(
        `https://docs.googleapis.com/v1/documents/${id}:batchUpdate`,
        {
        method: 'POST',
        headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            requests: [{
            insertText: {
                location: { index: 1 },
                text
            }
            }]
        })
        }
    );

    return res.json();
}

//old gettoken function, doesnt automatically refresh token unlike current function.

// async function getToken() {
//     if (cachedToken) return cachedToken;
//     const { oauthToken } = await chrome.storage.local.get('oauthToken');
//     if (oauthToken) {
//         cachedToken = oauthToken;
//         return oauthToken;
//     }
//     chrome.identity.getAuthToken({ interactive: true }, async (token) => {
//         if (chrome.runtime.lastError) {
//           console.error(chrome.runtime.lastError);
//           return;
//         }
//         await chrome.storage.local.set({ oauthToken: token });
//         cachedToken = token;
//         console.log('first set OAuth token:', token);
//     })
//     if (cachedToken) {
//         return cachedToken;
//     }
//     console.log("token error");
//     return null;
// }