// Popup script for Instagram Unfollower Manager
class PopupManager {
  constructor() {
    this.followersCount = 0;
    this.followingCount = 0;
    this.unfollowers = [];
    
    this.init();
  }

  init() {
    // Get DOM elements
    this.els = {
      followersCount: document.getElementById('followersCount'),
      followingCount: document.getElementById('followingCount'),
      scrapeFollowersBtn: document.getElementById('scrapeFollowersBtn'),
      scrapeFollowingBtn: document.getElementById('scrapeFollowingBtn'),
      findUnfollowersBtn: document.getElementById('findUnfollowersBtn'),
      stopBtn: document.getElementById('stopBtn'),
      clearDataBtn: document.getElementById('clearDataBtn'),
      progress: document.getElementById('progress'),
      progressBar: document.getElementById('progressBar'),
      progressText: document.getElementById('progressText'),
      results: document.getElementById('results'),
      resultsTitle: document.getElementById('resultsTitle'),
      resultsList: document.getElementById('resultsList')
    };

    // Attach event listeners
    this.els.scrapeFollowersBtn.addEventListener('click', () => this.scrapeFollowers());
    this.els.scrapeFollowingBtn.addEventListener('click', () => this.scrapeFollowing());
    this.els.findUnfollowersBtn.addEventListener('click', () => this.findUnfollowers());
    this.els.stopBtn.addEventListener('click', () => this.stopScanning());
    this.els.clearDataBtn.addEventListener('click', () => this.clearAllData());

    // Load saved data
    this.loadSavedData();

    // Listen for progress updates
    chrome.runtime.onMessage.addListener((request) => {
      if (request.action === 'scrollProgress') {
        this.updateProgress(request);
      }
    });
  }

  async getCurrentTab() {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
    return tab;
  }

  async sendMessage(action, data = {}) {
    const tab = await this.getCurrentTab();
    
    console.log('Current tab URL:', tab.url);
    
    if (!tab.url.includes('instagram.com')) {
      this.showError('Please navigate to Instagram first!\n\nCurrent page: ' + tab.url);
      return null;
    }

    return new Promise((resolve) => {
      chrome.tabs.sendMessage(tab.id, { action, ...data }, (response) => {
        if (chrome.runtime.lastError) {
          console.error('Chrome runtime error:', chrome.runtime.lastError);
          this.showError('Connection Error!\n\nPlease:\n1. Refresh Instagram page (F5)\n2. Make sure you\'re on your profile\n3. Try again');
          resolve(null);
        } else {
          resolve(response);
        }
      });
    });
  }

  showProgress(text) {
    this.els.progress.classList.add('active');
    this.els.progressText.textContent = text;
    this.els.progressBar.style.width = '0%';
    this.els.results.classList.remove('active');
    this.disableButtons(true);
  }

  hideProgress() {
    this.els.progress.classList.remove('active');
    this.disableButtons(false);
  }

  updateProgress(data) {
    const percent = Math.min((data.attempts / 100) * 100, 100);
    this.els.progressBar.style.width = `${percent}%`;
    this.els.progressText.textContent = `Found ${data.count} users... (${data.attempts} scrolls)`;
  }

  disableButtons(disabled) {
    this.els.scrapeFollowersBtn.disabled = disabled;
    this.els.scrapeFollowingBtn.disabled = disabled;
    this.els.findUnfollowersBtn.disabled = disabled || (this.followersCount === 0 || this.followingCount === 0);
    this.els.clearDataBtn.disabled = disabled;
  }

  async scrapeFollowers() {
    this.showProgress('Scanning followers...');
    
    const response = await this.sendMessage('scrapeFollowers');
    
    if (response && response.success) {
      this.followersCount = response.data.length;
      this.els.followersCount.textContent = this.followersCount;
      
      // Save to storage
      chrome.storage.local.set({ followers: response.data });
      
      console.log(`✅ Found ${this.followersCount} followers!`);
    } else if (response) {
      this.showError('Error: ' + response.error);
    }
    
    this.hideProgress();
  }

  async scrapeFollowing() {
    this.showProgress('Scanning following...');
    
    const response = await this.sendMessage('scrapeFollowing');
    
    if (response && response.success) {
      this.followingCount = response.data.length;
      this.els.followingCount.textContent = this.followingCount;
      
      // Save to storage
      chrome.storage.local.set({ following: response.data });
      
      console.log(`✅ Found ${this.followingCount} following!`);
    } else if (response) {
      this.showError('Error: ' + response.error);
    }
    
    this.hideProgress();
  }

  async findUnfollowers() {
    // First load data into content script
    const storageData = await new Promise(resolve => {
      chrome.storage.local.get(['followers', 'following'], resolve);
    });

    if (storageData.followers && storageData.following) {
      await this.sendMessage('loadData', {
        followers: storageData.followers,
        following: storageData.following
      });
    }

    this.showProgress('Finding unfollowers...');
    
    const response = await this.sendMessage('findUnfollowers');
    
    if (response && response.success) {
      this.unfollowers = response.data;
      this.displayResults(this.unfollowers);
      
      // Save to storage
      chrome.storage.local.set({ unfollowers: this.unfollowers });
      
      console.log(`✅ Found ${this.unfollowers.length} unfollowers!`);
    } else if (response) {
      this.showError('Error: ' + response.error);
    }
    
    this.hideProgress();
  }

  async stopScanning() {
    await this.sendMessage('stopScrolling');
    this.hideProgress();
  }

  async clearAllData() {
    const confirmed = confirm(
      '⚠️ Clear All Data?\n\n' +
      'This will delete:\n' +
      '• All followers data\n' +
      '• All following data\n' +
      '• Unfollowers list\n' +
      '• All saved information\n\n' +
      'You will need to scan again from scratch.\n\n' +
      'Are you sure you want to continue?'
    );

    if (!confirmed) {
      return;
    }

    try {
      // Clear Chrome storage
      await chrome.storage.local.clear();
      
      // Reset instance variables
      this.followersCount = 0;
      this.followingCount = 0;
      this.unfollowers = [];
      
      // Reset UI elements
      this.els.followersCount.textContent = '0';
      this.els.followingCount.textContent = '0';
      this.els.results.classList.remove('active');
      this.els.resultsList.innerHTML = '';
      
      // Re-enable buttons
      this.disableButtons(false);
      
      // Show success message
      alert('✅ All data cleared successfully!\n\nExtension reset to initial state.');
      console.log('✅ All data cleared from Chrome local storage');
      
    } catch (error) {
      console.error('❌ Error clearing data:', error);
      alert('❌ Error clearing data. Please try again or reload the extension.');
    }
  }

  displayResults(users) {
    this.els.results.classList.add('active');
    this.els.resultsTitle.textContent = `Unfollowers (${users.length})`;
    
    if (users.length === 0) {
      this.els.resultsList.innerHTML = '<div style="text-align: center; padding: 20px; color: #666;">Everyone follows you back! 🎉</div>';
      return;
    }

    this.els.resultsList.innerHTML = users.map((user) => {
      return `
        <div class="user-item">
          <div class="user-avatar">${user.username.charAt(0).toUpperCase()}</div>
          <div class="user-name">@${user.username}</div>
        </div>
      `;
    }).join('');
  }

  showError(message) {
    alert(message);
  }

  async loadSavedData() {
    chrome.storage.local.get(['followers', 'following', 'unfollowers'], (data) => {
      if (data.followers) {
        this.followersCount = data.followers.length;
        this.els.followersCount.textContent = this.followersCount;
      }
      
      if (data.following) {
        this.followingCount = data.following.length;
        this.els.followingCount.textContent = this.followingCount;
      }
      
      if (data.unfollowers && data.unfollowers.length > 0) {
        this.unfollowers = data.unfollowers;
        this.displayResults(this.unfollowers);
      }

      this.disableButtons(false);
    });
  }
}

// Initialize popup manager
const popup = new PopupManager();