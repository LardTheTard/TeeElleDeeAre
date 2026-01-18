const tooltip = document.createElement('div');
tooltip.style.display = 'none';
tooltip.className = 'custom-tooltip';
document.body.appendChild(tooltip);

const keysDown = new Set();

document.addEventListener('keydown', (e) => {
    if (!keysDown.has(e.key)) {
        keysDown.add(e.key);
        console.log(e.key + ' was pressed');
    }
});

document.addEventListener('keyup', (e) => {
    keysDown.delete(e.key);
    console.log(e.key + ' was released');
});

document.addEventListener('click', async (e) => {
    const link = e.target.closest('a');

    //testing tooltip ability
    if (link && link.href && keysDown.has('r')) {
        e.preventDefault();
        const url = link.href;
        const tooltipText = test(url)
        tooltip.textContent = tooltipText;
        tooltip.style.display = 'block';
        updateTooltipPosition(e);
        console.log('successfully added default r tooltip');
    }

    //testing fetching html from link
    else if (link && link.href && keysDown.has('t')) {
        e.preventDefault();
        tooltip.innerHTML = `<h1 id='norm_h1'> Loading content... </h1>`;
        tooltip.style.display = 'block';
        updateTooltipPosition(e);
        chrome.runtime.sendMessage(
            { action: 'fetchContent', url: link.href },
            async (response) => {
                if (response.success) {
                    await showTooltipContent(response.content);
                    console.log('Content:', response.content);
                } else {
                    tooltip.innerHTML = `<h1 id='norm_h1'> Error loading content </h1>`;
                    console.error('Error:', response.error);
                }
            }
        );
        console.log('successfully did a T action');
    }

    //link content summary
    else if (link && link.href && keysDown.has('s')) {
        e.preventDefault();
        tooltip.innerHTML = `<h1 id='norm_h1'> Fetching content... </h1>`;
        tooltip.style.display = 'block';
        updateTooltipPosition(e);
        
        // First fetch the page content
        chrome.runtime.sendMessage(
            { action: 'fetchContent', url: link.href },
            async (response) => {
                if (response.success) {
                    const text = await extractMainText(response.content);
                    
                    if (!text || text.length < 100) {
                        tooltip.innerHTML = 'Not enough text to summarize';
                        return;
                    }
                    
                    tooltip.innerHTML = `<h1 id='norm_h1'> Generating summary... </h1>`;
                    
                    // Now summarize with Llama
                    chrome.runtime.sendMessage(
                        { action: 'summarize', text: text },
                        (summaryResponse) => {
                            if (summaryResponse.success) {
                                tooltip.innerHTML = `
                                    <h1 id='norm_h1'>Page Summary</h1>
                                    <p id='norm_p'>${summaryResponse.summary}</p>
                                    <small>Powered by Llama</small>
                                `;
                            } else {
                                tooltip.innerHTML = `Error: ${summaryResponse.error}`;
                            }
                        }
                    );
                } else {
                    tooltip.innerHTML = 'Could not load page';
                    console.error('Error:', response.error);
                }
            }
        );
        console.log('successfully did an S action (summarize)');
    }

    //insert summary/text into specified google docs
    else if (link && link.href && keysDown.has('x')) {
        e.preventDefault();
        tooltip.innerHTML = `<h1 id='norm_h1'> Fetching content... </h1>`;
        tooltip.style.display = 'block';
        updateTooltipPosition(e);
        
        // First fetch the page content, same code as above.
        chrome.runtime.sendMessage(
            { action: 'fetchContent', url: link.href },
            async (response) => {
                if (response.success) {
                    const text = await extractMainText(response.content);
                    
                    if (!text || text.length < 100) {
                        tooltip.innerHTML = 'Not enough text to summarize';
                        return;
                    }
                    
                    tooltip.innerHTML = `<h1 id='norm_h1'> Generating summary... </h1>`;
                    
                    // Now summarize with Llama
                    chrome.runtime.sendMessage(
                        { action: 'summarize', text: text },
                        (summaryResponse) => {
                            if (summaryResponse.success) {
                                tooltip.innerHTML = `
                                    <h1 id='norm_h1'>Page Summary</h1>
                                    <p id='norm_p'>${summaryResponse.summary}</p>
                                    <small>Powered by Llama</small>
                                `;
                                getId().then(docId => {
                                    if (docId) {
                                        chrome.runtime.sendMessage({ action: 'updateDocsLink', id: docId, text: summaryResponse.summary}, (response) => {
                                            if (response.success) {
                                                console.log('inserted text successfully');
                                            } else {
                                                console.error('Error:', response.error);
                                            }
                                        })
                                    }
                                    else {
                                        tooltip.innerHTML = `<h1 id='norm_h1'> Haven't set document ID yet. </h1>`;
                                        tooltip.style.display = 'block';
                                    }
                                })
                            } else {
                                tooltip.innerHTML = `Error: ${summaryResponse.error}`;
                            }
                        }
                    );
                } else {
                    tooltip.innerHTML = 'Could not load page';
                    console.error('Error:', response.error);
                }
            }
        );
        console.log('successfully did an X action (summarize and insert)');
    }
});

// document.addEventListener('mouseover', (e) => {
//     const link = e.target.closest('a');
//     if (link && link.href) {
//         const url = link.href;
//         const tooltipText = getTooltipContent(link);
//         tooltip.textContent = tooltipText;
//         tooltip.style.display = 'block';
//         updateTooltipPosition(e);
//     }
// });

document.addEventListener('mousemove', (e) => {
    if (tooltip.style.display === 'block') {
      updateTooltipPosition(e);
    }
});

document.addEventListener('mouseout', (e) => {
    const link = e.target.closest('a');
    if (link) {
        tooltip.style.display = 'none';
    }
});

async function getId() {
    const { docId } = await chrome.storage.local.get('docId');
    if (docId) {
        return docId;
    }
    return null;
}

function updateTooltipPosition(e) {
    const offset = 15;
    let left = e.clientX + offset;
    let top = e.clientY + offset;
    
    // Keep tooltip in viewport
    const rect = tooltip.getBoundingClientRect();
    if (left + rect.width > window.innerWidth) {
      left = e.clientX - rect.width - offset;
    }
    if (top + rect.height > window.innerHeight) {
      top = e.clientY - rect.height - offset;
    }
    
    tooltip.style.left = left + 'px';
    tooltip.style.top = top + 'px';
}
  
function test(url) {
    if (url.includes('youtube')) {
        return 'YOUTUBEEEEEEEEE';
    }
    return `super idol de xiao rong`;
}

function analyzeContent(html) {
    const doc = convertHTMLToDoc(html);
    const info = [
        doc.querySelector('title')?.textContent, 
        doc.querySelectorAll('a').length,
        doc.querySelectorAll('img').length
    ]

    console.log('Title:', doc.querySelector('title')?.textContent);
    console.log('Links:', doc.querySelectorAll('a').length);
    console.log('Images:', doc.querySelectorAll('img').length);

    return info;
}

function convertHTMLToDoc(html) {
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    return doc;
}

async function showTooltipContent(html) {
    const info = analyzeContent(html);
    const text = await extractMainText(html);
    // const description = doc.querySelector('meta[name="description"]')?.content || 'No description';
    
    const title = info[0];
    const linksNum = info[1] ?? 0;
    const imgsNum = info[2] ?? 0;

    tooltip.style.display = 'block';
    tooltip.innerHTML = `
        <h1 id='norm_h1'> Title: ${title} </h1>
        <p id='norm_p'> Links: ${linksNum} </p>
        <p id='norm_p'> Images: ${imgsNum} </p> 
        <small> ${text} </small>
    `;
    console.log(text);
    //     <small> ${description} </small>
}

async function extractMainText(html) {
    // Get maxscope from storage, default to 100 if not set
    const { maxscope } = await chrome.storage.local.get('maxscope');
    const maxScopeValue = maxscope || 300;
    
    const doc = convertHTMLToDoc(html);
    const textList = doc.querySelectorAll('p, a, span, article');//page could also contain in articles or spans, not just p
    let text = '';

    for (let i = 0; i < textList.length && i < maxScopeValue; i++) {
        text = text + textList[i].textContent;
    }

    // Limit to 1000 chars for Pegasus
    return text;
} 