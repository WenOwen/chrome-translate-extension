// Background Service Worker for Chrome Extension

// 注册右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'translate-to-chinese',
    title: '🌐 翻译成中文',
    contexts: ['selection']
  });
});

// 右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'translate-to-chinese' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'translate',
      text: info.selectionText
    });
  }
});

// 快捷键命令
chrome.commands.onCommand.addListener((command) => {
  if (command === 'translate') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'translateShortcut' });
      }
    });
  }
});

// popup 消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getSelectedText') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0] && tabs[0].id !== undefined) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => window.getSelection().toString().trim()
        }, (injectionResults) => {
          if (chrome.runtime.lastError) {
            sendResponse({ text: '' });
          } else {
            sendResponse({ text: injectionResults[0].result || '' });
          }
        });
      } else {
        sendResponse({ text: '' });
      }
    });
    return true;
  }
});
