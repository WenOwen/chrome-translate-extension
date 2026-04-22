// Background Service Worker
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.type === 'getSelectedText') {
        // 从当前标签页获取选中文本
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
            chrome.scripting.executeScript({
                target: { tabId: tabs[0].id },
                func: () => window.getSelection().toString().trim()
            }, (results) => {
                sendResponse({ text: results[0]?.result || '' });
            });
        });
        return true; // 保持消息通道
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
        // 发送到 content script 进行翻译
        chrome.tabs.sendMessage(tab.id, {
            type: 'translate',
            text: info.selectionText
        });
    }
});