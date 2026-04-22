// Background Service Worker - Fixed
console.log('Background script starting');

chrome.runtime.onInstalled.addListener(() => {
  console.log('Creating context menu');
  chrome.contextMenus.create({
    id: 'translate-to-chinese',
    title: '🌐 翻译成中文',
    contexts: ['selection']
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  console.log('Context menu clicked:', info.selectionText);
  if (info.menuItemId === 'translate-to-chinese' && info.selectionText) {
    chrome.tabs.sendMessage(tab.id, {
      type: 'translate',
      text: info.selectionText
    });
  }
});

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

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  console.log('Message:', request.type);
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
});

console.log('Background script initialized');
