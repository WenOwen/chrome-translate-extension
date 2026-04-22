// Background Service Worker - 简化版

// 安装时创建右键菜单
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'translate-to-chinese',
    title: '🌐 翻译成中文',
    contexts: ['selection']
  });
});

// 右键菜单
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'translate-to-chinese' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'translate',
      text: info.selectionText
    });
  }
});

// 快捷键
chrome.commands.onCommand.addListener((command) => {
  if (command === 'translate') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'translateShortcut' });
      }
    });
  }
});

// 消息
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.type === 'getSelectedText') {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => window.getSelection().toString().trim()
        }, (results) => {
          sendResponse({ text: results?.[0]?.result || '' });
        });
      } else {
        sendResponse({ text: '' });
      }
    });
    return true;
  }
  
  if (request.type === 'addWord') {
    chrome.storage.sync.get(['wordbook'], (result) => {
      const wordbook = result.wordbook || [];
      wordbook.unshift({
        original: request.original,
        translated: request.translated,
        date: new Date().toISOString()
      });
      if (wordbook.length > 500) wordbook.pop();
      chrome.storage.sync.set({ wordbook }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
  
  if (request.type === 'getWordbook') {
    chrome.storage.sync.get(['wordbook'], (result) => {
      sendResponse({ wordbook: result.wordbook || [] });
    });
    return true;
  }
  
  if (request.type === 'deleteWord') {
    chrome.storage.sync.get(['wordbook'], (result) => {
      const wordbook = result.wordbook || [];
      wordbook.splice(request.index, 1);
      chrome.storage.sync.set({ wordbook }, () => {
        sendResponse({ success: true });
      });
    });
    return true;
  }
  
  if (request.type === 'clearWordbook') {
    chrome.storage.sync.set({ wordbook: [] }, () => {
      sendResponse({ success: true });
    });
    return true;
  }
});
