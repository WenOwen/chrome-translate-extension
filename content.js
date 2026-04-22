// Content Script - 翻译浮窗 + 生词本 + 高亮
let tooltip = null;
let highlightedSpan = null;

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
    
    tooltip.querySelector('.add-word-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        const btn = e.target;
        addToWordbook(btn.dataset.original, btn.dataset.translated, btn);
    });
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

// 安全的文本高亮（使用 Selection API）
function safeHighlight() {
    // 移除旧高亮
    if (highlightedSpan) {
        try {
            const parent = highlightedSpan.parentNode;
            if (parent) {
                const text = highlightedSpan.textContent;
                parent.replaceChild(document.createTextNode(text), highlightedSpan);
                parent.normalize();
            }
        } catch (e) {}
        highlightedSpan = null;
    }
    
    const selection = window.getSelection();
    if (!selection || selection.rangeCount === 0 || selection.isCollapsed) return;
    
    try {
        const range = selection.getRangeAt(0);
        if (range.collapsed) return;
        
        // 创建高亮 span
        const span = document.createElement('span');
        span.className = 'translated-highlight';
        span.textContent = range.toString();
        
        // 尝试用高亮替换选中内容
        range.deleteContents();
        range.insertNode(span);
        
        // 清除选择
        selection.removeAllRanges();
        
        highlightedSpan = span;
    } catch (e) {
        console.log('Highlight failed:', e);
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

// 翻译
async function translateText(text, x, y) {
    if (!text || !text.trim()) {
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
            tooltip.querySelector('.add-word-btn').dataset.translated = translated;
            safeHighlight();
        } else {
            contentDiv.textContent = '翻译结果为空';
        }
    } catch (error) {
        contentDiv.textContent = '翻译失败，请重试';
    }
}

function showToast(message) {
    removeTooltip();
    const toast = document.createElement('div');
    toast.className = 'translate-tooltip';
    toast.style.cssText = 'position:fixed;left:50%;top:50%;transform:translate(-50%,-50%);';
    toast.innerHTML = `<span class="close-btn">×</span><div class="content">${message}</div>`;
    document.body.appendChild(toast);
    toast.querySelector('.close-btn').addEventListener('click', () => removeTooltip());
    setTimeout(() => removeTooltip(), 2000);
}

// 双击翻译
document.addEventListener('dblclick', (e) => {
    const selected = window.getSelection().toString().trim();
    if (selected) {
        const rect = window.getSelection().getRangeAt(0).getBoundingClientRect();
        translateText(selected, rect.left, rect.bottom + 5);
    }
});

// 点击其他地方关闭
document.addEventListener('click', (e) => {
    if (tooltip && !e.target.closest('.translate-tooltip')) {
        removeTooltip();
    }
});

// ESC 移除高亮
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        removeTooltip();
        if (highlightedSpan) {
            try {
                const parent = highlightedSpan.parentNode;
                if (parent) {
                    const text = highlightedSpan.textContent;
                    parent.replaceChild(document.createTextNode(text), highlightedSpan);
                    parent.normalize();
                }
            } catch (err) {}
            highlightedSpan = null;
        }
    }
});

// 监听快捷键和右键菜单
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'translateShortcut' || request.type === 'translate') {
        const selected = window.getSelection().toString().trim() || request.text;
        if (selected) {
            const range = window.getSelection().rangeCount > 0 ? window.getSelection().getRangeAt(0) : null;
            const rect = range ? range.getBoundingClientRect() : null;
            const x = rect ? rect.left : 100;
            const y = rect ? rect.bottom + 5 : 100;
            translateText(selected, x, y);
        } else {
            showToast('请先选择要翻译的英文文本');
        }
    }
});
