// Content Script - 页面内翻译功能
let tooltip = null;

// 创建翻译提示框
function createTooltip(x, y, isLoading = false) {
    removeTooltip();
    
    tooltip = document.createElement('div');
    tooltip.className = 'translate-tooltip' + (isLoading ? ' loading' : '');
    tooltip.innerHTML = '<span class="close-btn" title="关闭">×</span><div class="content"></div>';
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
    
    createTooltip(x, y, true);
    const contentDiv = tooltip.querySelector('.content');
    
    try {
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=' + encodeURIComponent(text);
        const response = await fetch(url);
        const data = await response.json();
        
        if (data[0]) {
            const translated = data[0].map(item => item[0]).join('');
            contentDiv.textContent = translated;
            tooltip.classList.remove('loading');
        }
    } catch (error) {
        contentDiv.textContent = '翻译失败: ' + error.message;
        tooltip.classList.remove('loading');
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
    if (!e.target.closest('.translate-tooltip')) {
        removeTooltip();
    }
});

// 监听来自 background script 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'translateShortcut') {
        // 快捷键触发的翻译
        const selectedText = window.getSelection().toString().trim();
        if (selectedText) {
            const selection = window.getSelection();
            const range = selection.rangeCount > 0 ? selection.getRangeAt(0) : null;
            const rect = range ? range.getBoundingClientRect() : null;
            const x = rect ? rect.left + window.scrollX : window.scrollX + 50;
            const y = rect ? rect.bottom + window.scrollY + 10 : window.scrollY + 50;
            translateText(selectedText, x, y);
        } else {
            showToast('请先选择要翻译的英文文本');
        }
    } else if (request.type === 'translate' && request.text) {
        // 右键菜单触发的翻译
        const selectedText = window.getSelection().toString().trim() || request.text;
        if (selectedText) {
            const rect = window.getSelection().getRangeAt(0)?.getBoundingClientRect();
            const x = rect ? rect.left + window.scrollX : window.scrollX + 50;
            const y = rect ? rect.bottom + window.scrollY + 10 : window.scrollY + 50;
            translateText(selectedText, x, y);
        }
    }
});