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

document.addEventListener('click', (e) => {
    const link = e.target.closest('a');
    if (link && link.href && keysDown.has('r')) {
        e.preventDefault();
        const url = link.href;
        const tooltipText = getTooltipContent(url)
        tooltip.textContent = tooltipText;
        tooltip.style.display = 'block';
        updateTooltipPosition(e);
        console.log('successfully added default r tooltip');
    }
    else if (link && link.href && keysDown.has('t')) {
        e.preventDefault();
        chrome.runtime.sendMessage(
            { action: 'fetchUrl', url: link.href },
            (response) => {
                if (response.success) {
                    showTooltipContent(response.content)
                    console.log('Content:', response.content);
                } else {
                    console.error('Error:', response.error);
                }
            }
        );
        console.log('successfully did a T action');
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
  
function getTooltipContent(url) {
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

function showTooltipContent(html) {
    const info = analyzeContent(html);
    const doc = convertHTMLToDoc(html);
    const description = doc.querySelector('meta[name="description"]')?.content || 'No description';
    const textList = doc.querySelectorAll('p, a, span');//page could also contain in articles or spans, not just p
    let text = '';

    for (let i = 0; i < textList.length && i < 100; i++) {
        text = text + textList[i].textContent;
    }

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
    // tooltip.innerHTML = `
    //     <h1> Title: ${title} </h1>
    //     <p> Links: ${linksNum} </p>
    //     <p> Images: ${imgsNum} </p>
    //     <small> ${description} </small>
    // `;
}