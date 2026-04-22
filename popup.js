// Popup Script

// Tab 切换
document.querySelectorAll('.tab').forEach(tab => {
    tab.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
        document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(tab.dataset.tab + '-tab').classList.add('active');
        
        if (tab.dataset.tab === 'wordbook') {
            loadWordbook();
        }
    });
});

// 翻译功能
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const translateBtn = document.getElementById('translate-btn');
const status = document.getElementById('status');

translateBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    if (!text) {
        showStatus('请输入要翻译的文本', 'error');
        return;
    }
    
    translateBtn.disabled = true;
    showStatus('翻译中...');
    
    try {
        const translated = await translateToChinese(text);
        outputText.textContent = translated;
        showStatus('翻译成功 ✓', 'success');
    } catch (error) {
        outputText.textContent = '翻译失败';
        showStatus('翻译失败 ✗', 'error');
    } finally {
        translateBtn.disabled = false;
    }
});

async function translateToChinese(text) {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=' + encodeURIComponent(text);
    const response = await fetch(url);
    const data = await response.json();
    if (data && data[0]) {
        return data[0].map(item => item[0]).join('');
    }
    throw new Error('翻译结果解析失败');
}

function showStatus(text, type = '') {
    status.textContent = text;
    status.className = 'status ' + type;
}

// 回车翻译
inputText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        translateBtn.click();
    }
});

// 生词本功能
const wordList = document.getElementById('word-list');
const wordCount = document.getElementById('word-count');
const clearBtn = document.getElementById('clear-btn');

function loadWordbook() {
    chrome.runtime.sendMessage({ type: 'getWordbook' }, (response) => {
        const words = response && response.wordbook ? response.wordbook : [];
        renderWordbook(words);
    });
}

function renderWordbook(words) {
    wordCount.textContent = `共 ${words.length} 个单词`;
    
    if (words.length === 0) {
        wordList.innerHTML = `
            <div class="empty-state">
                <div class="icon">📖</div>
                <div>生词本为空</div>
                <div style="font-size: 12px; margin-top: 4px;">选中英文按 Alt+Q 翻译，点击浮窗中的"加入生词本"</div>
            </div>
        `;
        return;
    }
    
    wordList.innerHTML = words.map((w, i) => `
        <div class="word-item">
            <button class="delete-btn" data-index="${i}">×</button>
            <div class="original">${escapeHtml(w.original)}</div>
            <div class="translated">${escapeHtml(w.translated)}</div>
            <div class="date">${formatDate(w.date)}</div>
        </div>
    `).join('');
    
    // 删除按钮
    wordList.querySelectorAll('.delete-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const index = parseInt(btn.dataset.index);
            deleteWord(index);
        });
    });
}

function deleteWord(index) {
    chrome.runtime.sendMessage({ type: 'deleteWord', index: index }, () => {
        loadWordbook();
    });
}

clearBtn.addEventListener('click', () => {
    if (confirm('确定要清空生词本吗？')) {
        chrome.runtime.sendMessage({ type: 'clearWordbook' }, () => {
            loadWordbook();
        });
    }
});

function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

function formatDate(isoString) {
    const date = new Date(isoString);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}
