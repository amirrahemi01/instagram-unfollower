// Background service worker for Instagram Unfollower Manager

// Listen for extension installation
chrome.runtime.onInstalled.addListener((details) => {
  if (details.reason === 'install') {
    console.log('Instagram Unfollower Manager installed!');
    
    // Initialize storage
    chrome.storage.local.set({
      followers: [],
      following: [],
      unfollowers: [],
      lastScanDate: null
    });
  }
});

// Listen for messages from content script and popup
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  // Handle different message types
  switch (request.action) {
    case 'scrollProgress':
      // Forward progress updates to popup
      chrome.runtime.sendMessage(request);
      break;
    
    case 'saveScanData':
      // Save scan data to storage
      chrome.storage.local.set({
        [request.type]: request.data,
        lastScanDate: new Date().toISOString()
      }, () => {
        sendResponse({ success: true });
      });
      return true;
    
    case 'getScanData':
      // Retrieve scan data from storage
      chrome.storage.local.get(['followers', 'following', 'unfollowers', 'lastScanDate'], (data) => {
        sendResponse({ success: true, data });
      });
      return true;
    
    case 'clearData':
      // Clear all stored data
      chrome.storage.local.set({
        followers: [],
        following: [],
        unfollowers: [],
        lastScanDate: null
      }, () => {
        sendResponse({ success: true });
      });
      return true;
  }
});

// Keep service worker alive
chrome.runtime.onConnect.addListener((port) => {
  console.log('Connection established');
});