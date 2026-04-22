// Background Service Worker
// 监听快捷键命令
chrome.commands.onCommand.addListener(async (command) => {
    if (command === 'translate') {
        // 获取当前活动标签页
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        if (tab) {
            // 向 content script 发送翻译请求
            chrome.tabs.sendMessage(tab.id, { type: 'translateShortcut' });
        }
    }
});

// 监听来自 popup 的消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'getSelectedText') {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: () => window.getSelection().toString().trim()
            }, (results) => {
                sendResponse({ text: results[0]?.result || '' });
            });
        });
        return true;
    }
});

// 创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'translate-to-chinese',
        title: '🌐 翻译成中文',
        contexts: ['selection']
    });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'translate-to-chinese' && info.selectionText) {
        chrome.tabs.sendMessage(tab.id, {
            type: 'translate',
            text: info.selectionText
        });
    }
});