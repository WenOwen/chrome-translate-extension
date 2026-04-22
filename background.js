// Background Service Worker - 每次启动都会注册

// 创建右键菜单（每次启动都创建，避免被清除）
function createContextMenu() {
    chrome.contextMenus.removeAll(() => {
        chrome.contextMenus.create({
            id: 'translate-to-chinese',
            title: '🌐 翻译成中文',
            contexts: ['selection']
        });
    });
}

// 初始化时创建右键菜单
createContextMenu();

// 快捷键命令监听
chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'translate') {
        try {
            const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
            if (tab && tab.id) {
                chrome.tabs.sendMessage(tab.id, { type: 'translateShortcut' });
            }
        } catch (error) {
            console.error('翻译快捷键失败:', error);
        }
    }
});

// 右键菜单点击处理
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'translate-to-chinese' && info.selectionText) {
        chrome.tabs.sendMessage(tab.id, {
            type: 'translate',
            text: info.selectionText
        });
    }
});

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'getSelectedText') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            if (tabs[0] && tabs[0].id) {
                chrome.scripting.executeScript({
                    target: { tabId: tabs[0].id },
                    func: () => window.getSelection().toString().trim()
                }, (results) => {
                    sendResponse({ text: results[0]?.result || '' });
                });
            }
        });
        return true;
    }
});
