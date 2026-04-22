// Content Script - 页面内翻译功能
let tooltip = null;

// 创建翻译提示框
function createTooltip(x, y) {
    removeTooltip();
    
    tooltip = document.createElement('div');
    tooltip.className = 'translate-tooltip';
    tooltip.innerHTML = '<span class="close-btn" title="关闭">×</span><div class="content">翻译中...</div>';
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    document.body.appendChild(tooltip);
    
    tooltip.querySelector('.close-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        removeTooltip();
    });
    
    return tooltip;
}

function removeTooltip() {
    if (tooltip && tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
        tooltip = null;
    }
}

// 翻译文本
async function translateText(text, x, y) {
    if (!text || text.trim().length === 0) {
        showToast('请先选择要翻译的英文文本');
        return;
    }
    
    createTooltip(x, y);
    const contentDiv = tooltip.querySelector('.content');
    
    try {
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=' + encodeURIComponent(text);
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data[0]) {
            const translated = data[0].map(item => item[0]).join('');
            contentDiv.textContent = translated;
        } else {
            contentDiv.textContent = '翻译结果为空';
        }
    } catch (error) {
        contentDiv.textContent = '翻译失败';
        console.error('翻译错误:', error);
    }
}

function showToast(message) {
    removeTooltip();
    tooltip = document.createElement('div');
    tooltip.className = 'translate-tooltip';
    tooltip.innerHTML = `<span class="close-btn">×</span><div class="content">${message}</div>`;
    tooltip.style.left = '50%';
    tooltip.style.top = '50%';
    tooltip.style.transform = 'translate(-50%, -50%)';
    document.body.appendChild(tooltip);
    
    tooltip.querySelector('.close-btn').addEventListener('click', () => removeTooltip());
    setTimeout(() => removeTooltip(), 2000);
}

// 双击翻译
document.addEventListener('dblclick', (e) => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        const x = rect.left + window.scrollX;
        const y = rect.bottom + window.scrollY + 10;
        translateText(selectedText, x, y);
    }
});

// 点击其他地方关闭提示框
document.addEventListener('click', (e) => {
    if (tooltip && !e.target.closest('.translate-tooltip')) {
        removeTooltip();
    }
});

// 监听来自 background script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        if (request.type === 'translateShortcut') {
            const selectedText = window.getSelection().toString().trim();
            if (selectedText) {
                const selection = window.getSelection();
                const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
                const rect = range ? range.getBoundingClientRect() : null;
                const x = rect ? rect.left + window.scrollX : 100;
                const y = rect ? rect.bottom + window.scrollY + 10 : 100;
                translateText(selectedText, x, y);
            } else {
                showToast('请先选择要翻译的英文文本');
            }
        } else if (request.type === 'translate') {
            const selectedText = window.getSelection().toString().trim() || request.text;
            if (selectedText) {
                const rect = window.getSelection().getRangeAt(0)?.getBoundingClientRect();
                const x = rect ? rect.left + window.scrollX : 100;
                const y = rect ? rect.bottom + window.scrollY + 10 : 100;
                translateText(selectedText, x, y);
            }
        }
    } catch (error) {
        console.error('Content script error:', error);
    }
});
