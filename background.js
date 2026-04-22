// Background Service Worker
console.log('Background script starting');

// 注册右键菜单
chrome.runtime.onInstalled.addListener(() => {
  console.log('Creating context menu');
  chrome.contextMenus.create({
    id: 'translate-to-chinese',
    title: '🌐 翻译成中文',
    contexts: ['selection']
  });
});

// 右键菜单点击
chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info.selectionText);
  if (info.menuItemId === 'translate-to-chinese' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'translate',
      text: info.selectionText
    });
  }
});

// 快捷键命令
chrome.commands.onCommand.addListener((command) => {
  console.log('Command:', command);
  if (command === 'translate') {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.tabs.sendMessage(tabs[0].id, { type: 'translateShortcut' });
      }
    });
  }
});

// 消息监听（来自 content script 和 popup）
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message received:', request.type);
  
  if (request.type === 'getSelectedText') {
    chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
      if (tabs && tabs[0] && tabs[0].id) {
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: function() {
            return window.getSelection().toString().trim();
          }
        }, function(results) {
          if (results && results[0]) {
            sendResponse({ text: results[0].result || '' });
          } else {
            sendResponse({ text: '' });
          }
        });
      } else {
        sendResponse({ text: '' });
      }
    });
    return true;
  }
  
  // 添加到生词本
  if (request.type === 'addWord') {
    chrome.storage.sync.get(['wordbook'], function(result) {
      const wordbook = result.wordbook || [];
      const newWord = {
        original: request.original,
        translated: request.translated,
        date: new Date().toISOString()
      };
      wordbook.unshift(newWord); // 最新在前
      // 限制最多保存 500 条
      if (wordbook.length > 500) {
        wordbook.pop();
      }
      chrome.storage.sync.set({ wordbook: wordbook }, function() {
        sendResponse({ success: true, count: wordbook.length });
      });
    });
    return true;
  }
  
  // 获取生词本
  if (request.type === 'getWordbook') {
    chrome.storage.sync.get(['wordbook'], function(result) {
      sendResponse({ wordbook: result.wordbook || [] });
    });
    return true;
  }
  
  // 删除生词
  if (request.type === 'deleteWord') {
    chrome.storage.sync.get(['wordbook'], function(result) {
      let wordbook = result.wordbook || [];
      wordbook = wordbook.filter(function(w, i) {
        return i !== request.index;
      });
      chrome.storage.sync.set({ wordbook: wordbook }, function() {
        sendResponse({ success: true });
      });
    });
    return true;
  }
  
  // 清空生词本
  if (request.type === 'clearWordbook') {
    chrome.storage.sync.set({ wordbook: [] }, function() {
      sendResponse({ success: true });
    });
    return true;
  }
});

console.log('Background script initialized');
