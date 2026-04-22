// Popup 翻译功能
const inputText = document.getElementById('input-text');
const outputText = document.getElementById('output-text');
const translateBtn = document.getElementById('translate-btn');
const status = document.getElementById('status');

// 监听翻译按钮点击
translateBtn.addEventListener('click', async () => {
    const text = inputText.value.trim();
    if (!text) {
        status.textContent = '请输入要翻译的文本';
        status.className = 'error';
        return;
    }
    
    translateBtn.disabled = true;
    status.textContent = '翻译中...';
    status.className = '';
    
    try {
        const translated = await translateToChinese(text);
        outputText.textContent = translated;
        status.textContent = '翻译成功 ✓';
        status.className = 'success';
    } catch (error) {
        outputText.textContent = '翻译失败: ' + error.message;
        status.textContent = '翻译失败 ✗';
        status.className = 'error';
    } finally {
        translateBtn.disabled = false;
    }
});

// 使用 Google Translate API (免费)
async function translateToChinese(text) {
    const url = 'https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=zh-CN&dt=t&q=' + encodeURIComponent(text);
    
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error('网络请求失败');
    }
    
    const data = await response.json();
    
    // 解析 Google Translate 返回格式
    if (data[0]) {
        return data[0].map(item => item[0]).join('');
    }
    throw new Error('翻译结果解析失败');
}

// 支持 Enter 键触发翻译
inputText.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        translateBtn.click();
    }
});
