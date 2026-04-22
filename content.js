// 右键菜单翻译功能
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
    
    // 点击关闭
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
    if (!text || text.trim().length === 0) return;
    
    createTooltip(x, y, true);
    const contentDiv = tooltip.querySelector('.content');
    
    try {
        // 使用 Google Translate API
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

// 监听鼠标右键
document.addEventListener('contextmenu', (e) => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        // 延迟显示，等待菜单出现
        setTimeout(() => {
            // 使用Google翻译
        }, 10);
    }
});

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

// 与 popup 通信，接收选中的文字
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'translate' && request.text) {
        const selectedText = window.getSelection().toString().trim() || request.text;
        if (selectedText) {
            const rect = window.getSelection().getRangeAt(0)?.getBoundingClientRect();
            const x = rect ? rect.left + window.scrollX : 100;
            const y = rect ? rect.bottom + window.scrollY + 10 : 100;
            translateText(selectedText, x, y);
        }
    }
});