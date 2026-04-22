// Content Script - 翻译浮窗 + 生词本
let tooltip = null;

// 创建翻译浮窗
function createTooltip(x, y, originalText, translatedText) {
    removeTooltip();
    
    tooltip = document.createElement('div');
    tooltip.className = 'translate-tooltip';
    tooltip.innerHTML = `
        <span class="close-btn" title="关闭">×</span>
        <div class="content">
            <div class="original-text" style="opacity: 0.7; font-size: 12px; margin-bottom: 6px; word-break: break-all;">${escapeHtml(originalText)}</div>
            <div class="translated-text">${translatedText}</div>
            <button class="add-word-btn" data-original="${escapeHtml(originalText)}" data-translated="${escapeHtml(translatedText)}">+ 加入生词本</button>
        </div>
    `;
    tooltip.style.left = x + 'px';
    tooltip.style.top = y + 'px';
    document.body.appendChild(tooltip);
    
    tooltip.querySelector('.close-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        removeTooltip();
    });
    
    // 加入生词本按钮
    tooltip.querySelector('.add-word-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const btn = e.target;
        const original = btn.dataset.original;
        const translated = btn.dataset.translated;
        addToWordbook(original, translated, btn);
    });
    
    return tooltip;
}

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function removeTooltip() {
    if (tooltip && tooltip.parentNode) {
        tooltip.parentNode.removeChild(tooltip);
        tooltip = null;
    }
}

// 加入生词本
function addToWordbook(original, translated, btn) {
    chrome.runtime.sendMessage({
        type: 'addWord',
        original: original,
        translated: translated
    }, (response) => {
        if (response && response.success) {
            btn.textContent = '✓ 已加入';
            btn.disabled = true;
            btn.style.background = 'rgba(39, 174, 96, 0.3)';
        }
    });
}

// 翻译文本
async function translateText(text, x, y) {
    if (!text || text.trim().length === 0) {
        showToast('请先选择要翻译的英文文本');
        return;
    }
    
    createTooltip(x, y, text, '翻译中...');
    const contentDiv = tooltip.querySelector('.translated-text');
    
    try {
        const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=' + encodeURIComponent(text);
        const response = await fetch(url);
        const data = await response.json();
        
        if (data && data[0]) {
            const translated = data[0].map(item => item[0]).join('');
            contentDiv.textContent = translated;
            // 更新按钮的 data-translated
            tooltip.querySelector('.add-word-btn').dataset.translated = translated;
        } else {
            contentDiv.textContent = '翻译结果为空';
        }
    } catch (error) {
        contentDiv.textContent = '翻译失败';
    }
}

function showToast(message) {
    removeTooltip();
    const toast = document.createElement('div');
    toast.className = 'translate-tooltip';
    toast.style.left = '50%';
    toast.style.top = '50%';
    toast.style.transform = 'translate(-50%, -50%)';
    toast.innerHTML = `<span class="close-btn">×</span><div class="content">${message}</div>`;
    document.body.appendChild(toast);
    
    toast.querySelector('.close-btn').addEventListener('click', () => removeTooltip());
    setTimeout(() => removeTooltip(), 2000);
}

// 双击翻译
document.addEventListener('dblclick', (e) => {
    const selectedText = window.getSelection().toString().trim();
    if (selectedText) {
        const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        const x = Math.min(rect.left + window.scrollX, window.innerWidth - 420);
        const y = Math.min(rect.bottom + window.scrollY + 10, window.innerHeight - 200);
        translateText(selectedText, x, y);
    }
});

// 点击其他地方关闭
document.addEventListener('click', (e) => {
    if (tooltip && !e.target.closest('.translate-tooltip')) {
        removeTooltip();
    }
});

// 监听 background 消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    try {
        if (request.type === 'translateShortcut') {
            const selectedText = window.getSelection().toString().trim();
            if (selectedText) {
                const range = window.getSelection().rangeCount > 0 ? window.getSelection().getRangeAt(0) : null;
                const rect = range ? range.getBoundingClientRect() : null;
                const x = rect ? Math.min(rect.left + window.scrollX, window.innerWidth - 420) : 100;
                const y = rect ? Math.min(rect.bottom + window.scrollY + 10, window.innerHeight - 200) : 100;
                translateText(selectedText, x, y);
            } else {
                showToast('请先选择要翻译的英文文本');
            }
        } else if (request.type === 'translate') {
            const selectedText = window.getSelection().toString().trim() || request.text;
            if (selectedText) {
                const range = window.getSelection().rangeCount > 0 ? window.getSelection().getRangeAt(0) : null;
                const rect = range ? range.getBoundingClientRect() : null;
                const x = rect ? Math.min(rect.left + window.scrollX, window.innerWidth - 420) : 100;
                const y = rect ? Math.min(rect.bottom + window.scrollY + 10, window.innerHeight - 200) : 100;
                translateText(selectedText, x, y);
            }
        }
    } catch (error) {
        console.error('Content script error:', error);
    }
});
