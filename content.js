// Content script for Instagram DOM scraping and auto-scroll
class InstagramManager {
  constructor() {
    this.followers = new Map();
    this.following = new Map();
    this.isScrolling = false;
    this.scrollDelay = 800; // Slower for better accuracy
    this.minScrollAttempts = 50; // Increased minimum
    this.maxNoProgressAttempts = 25; // More patient before stopping
  }

  sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async waitForElement(selector, timeout = 15000) {
    const start = Date.now();
    while (Date.now() - start < timeout) {
      const el = document.querySelector(selector);
      if (el) return el;
      await this.sleep(100);
    }
    throw new Error(`Element ${selector} not found`);
  }

  // IMPROVED: More aggressive username extraction
  extractUsername(element) {
    try {
      // Method 1: Find all links with href
      const links = element.querySelectorAll('a[href^="/"]');
      for (const link of links) {
        const href = link.getAttribute('href');
        if (!href || href === '/') continue;
        
        // Extract username from href - more strict pattern
        const match = href.match(/^\/([a-zA-Z0-9._]{1,30})(?:\/|$)/);
        if (match && match[1]) {
          const username = match[1];
          // Exclude system paths
          const excludedPaths = ['p', 'reel', 'reels', 'tv', 'stories', 'explore', 'accounts', 'direct', 'create'];
          if (!excludedPaths.includes(username)) {
            return username;
          }
        }
      }

      // Method 2: Look for span with username pattern (more strict)
      const textElements = element.querySelectorAll('span, div, a');
      for (const el of textElements) {
        const text = el.textContent.trim();
        // Instagram username pattern: 1-30 chars, letters, numbers, dots, underscores
        if (/^[a-zA-Z0-9._]{1,30}$/.test(text)) {
          // Verify it's not just a number or common button text
          if (!/^\d+$/.test(text) && 
              !['Follow', 'Following', 'Message', 'Unfollow', 'Remove', 'Requested'].includes(text)) {
            return text;
          }
        }
      }

      return null;
    } catch (error) {
      console.error('Extract username error:', error);
      return null;
    }
  }

  // Extract user data including avatar
  extractUserData(element) {
    try {
      const username = this.extractUsername(element);
      if (!username) return null;

      let avatarUrl = null;
      const img = element.querySelector('img');
      if (img) {
        avatarUrl = img.getAttribute('src');
      }

      return { username, avatarUrl };
    } catch (error) {
      return null;
    }
  }

  // IMPROVED: Better scroll container detection
  findScrollContainer(dialog) {
    console.log('🔍 Searching for scroll container...');
    
    // Strategy 1: Look for common Instagram scroll containers
    const selectors = [
      'div[style*="overflow-y: scroll"]',
      'div[style*="overflow: hidden auto"]',
      'div[style*="overflow-y: auto"]',
      'div._aano',
      'div.x1iyjqo2',
      'div[role="dialog"] > div > div'
    ];

    for (const selector of selectors) {
      const containers = dialog.querySelectorAll(selector);
      for (const container of containers) {
        if (container.scrollHeight > container.clientHeight + 10) {
          console.log(`✅ Found scroll container with selector: ${selector}`);
          console.log(`   scrollHeight: ${container.scrollHeight}, clientHeight: ${container.clientHeight}`);
          return container;
        }
      }
    }

    // Strategy 2: Find by computed style - check all divs in dialog
    const allDivs = Array.from(dialog.querySelectorAll('div'));
    for (const div of allDivs) {
      const style = window.getComputedStyle(div);
      const overflowY = style.overflowY;
      
      if ((overflowY === 'scroll' || overflowY === 'auto') && 
          div.scrollHeight > div.clientHeight + 10 &&
          div.clientHeight > 200) {
        console.log('✅ Found container by computed style');
        console.log(`   scrollHeight: ${div.scrollHeight}, clientHeight: ${div.clientHeight}`);
        return div;
      }
    }

    console.warn('⚠️ Using dialog as fallback container');
    return dialog;
  }

  // IMPROVED: More thorough user extraction
  extractUsersFromDialog(dialog, userMap) {
    let newUsers = 0;
    const seenInThisPass = new Set();
    
    // Get ALL potential user container elements
    const potentialElements = new Set();
    
    // Strategy 1: Find by role="button" (common for user rows)
    dialog.querySelectorAll('div[role="button"]').forEach(el => potentialElements.add(el));
    
    // Strategy 2: Find links to profiles
    dialog.querySelectorAll('a[href^="/"]').forEach(link => {
      const href = link.getAttribute('href');
      // Must be a profile link (not post, reel, etc)
      if (href && /^\/[a-zA-Z0-9._]{1,30}\/?$/.test(href)) {
        // Get the parent container (usually 2-3 levels up)
        let parent = link.parentElement;
        for (let i = 0; i < 4 && parent; i++) {
          potentialElements.add(parent);
          parent = parent.parentElement;
        }
      }
    });

    // Strategy 3: Find elements with avatar images
    dialog.querySelectorAll('img[alt*="profile"]').forEach(img => {
      let parent = img.parentElement;
      for (let i = 0; i < 4 && parent; i++) {
        potentialElements.add(parent);
        parent = parent.parentElement;
      }
    });

    console.log(`   Checking ${potentialElements.size} potential user elements`);

    // Extract users from all potential elements
    potentialElements.forEach(el => {
      const userData = this.extractUserData(el);
      if (userData && userData.username && !seenInThisPass.has(userData.username)) {
        seenInThisPass.add(userData.username);
        
        if (!userMap.has(userData.username)) {
          userMap.set(userData.username, userData);
          newUsers++;
          console.log(`   ➕ New user: @${userData.username}`);
        }
      }
    });

    return newUsers;
  }

  // IMPROVED: Smarter scroll with verification
  async performScroll(container) {
    const beforeScroll = container.scrollTop;
    const beforeHeight = container.scrollHeight;
    
    // Scroll to bottom
    container.scrollTop = container.scrollHeight;
    
    // Wait for content to load
    await this.sleep(300);
    
    const afterScroll = container.scrollTop;
    const afterHeight = container.scrollHeight;
    
    const scrolled = afterScroll - beforeScroll;
    const heightGrew = afterHeight > beforeHeight;
    
    return { scrolled, heightGrew, atBottom: (afterScroll + container.clientHeight >= afterHeight - 10) };
  }

  // IMPROVED: Main scroll function with better stopping logic
  async autoScrollDialog(type) {
    console.log(`\n${'='.repeat(60)}`);
    console.log(`🚀 Starting auto-scroll for ${type}`);
    console.log(`${'='.repeat(60)}\n`);
    
    this.isScrolling = true;
    
    try {
      const dialog = await this.waitForElement('div[role="dialog"]', 15000);
      console.log('✅ Dialog found');
      
      await this.sleep(2500); // Wait for initial load
      
      const scrollContainer = this.findScrollContainer(dialog);
      const userMap = type === 'followers' ? this.followers : this.following;
      
      let scrollAttempts = 0;
      let consecutiveNoProgress = 0;
      let lastUserCount = 0;
      let totalScrollDistance = 0;
      let stableCount = 0;

      console.log('🔄 Starting scroll loop\n');

      while (this.isScrolling && scrollAttempts < 400) {
        // Extract users BEFORE scroll
        const beforeExtract = this.extractUsersFromDialog(dialog, userMap);
        
        // Perform scroll
        const scrollResult = await this.performScroll(scrollContainer);
        totalScrollDistance += scrollResult.scrolled;
        
        // Wait for Instagram to load new content
        await this.sleep(this.scrollDelay);
        
        // Extract users AFTER scroll and load
        const afterExtract = this.extractUsersFromDialog(dialog, userMap);
        const newUsersFound = beforeExtract + afterExtract;
        const currentUserCount = userMap.size;

        // Log progress
        if (scrollAttempts % 3 === 0 || newUsersFound > 0) {
          console.log(`[${scrollAttempts}] Users: ${currentUserCount} (+${newUsersFound} new) | Scrolled: ${scrollResult.scrolled}px | Height grew: ${scrollResult.heightGrew}`);
        }

        // Send progress to popup
        if (scrollAttempts % 2 === 0) {
          chrome.runtime.sendMessage({
            action: 'scrollProgress',
            type: type,
            count: currentUserCount,
            attempts: scrollAttempts
          }).catch(() => {});
        }

        // Check progress
        if (currentUserCount > lastUserCount) {
          consecutiveNoProgress = 0;
          stableCount = 0;
          lastUserCount = currentUserCount;
        } else {
          consecutiveNoProgress++;
          stableCount++;
        }

        scrollAttempts++;

        // IMPROVED STOPPING CONDITIONS
        // Only consider stopping after minimum attempts
        if (scrollAttempts >= this.minScrollAttempts) {
          
          // Condition 1: No new users for extended period AND at bottom
          if (consecutiveNoProgress >= this.maxNoProgressAttempts && scrollResult.atBottom) {
            console.log('\n✅ Stop: No new users and reached bottom');
            break;
          }
          
          // Condition 2: Can't scroll at all for 15 attempts (truly at end)
          if (scrollResult.scrolled === 0 && consecutiveNoProgress >= 15) {
            console.log('\n✅ Stop: Cannot scroll further');
            break;
          }
          
          // Condition 3: Count stable and at bottom
          if (stableCount >= 30 && scrollResult.atBottom) {
            console.log('\n✅ Stop: Count stable at bottom');
            break;
          }
        }

        // Longer pause every 20 scrolls
        if (scrollAttempts % 20 === 0) {
          console.log('   ⏸️ Extended pause for content loading...');
          await this.sleep(2000);
        }
      }

      // FINAL EXTRACTION PASSES (multiple passes to catch stragglers)
      console.log('\n🔍 Final extraction passes...');
      for (let i = 0; i < 3; i++) {
        await this.sleep(1000);
        const finalNew = this.extractUsersFromDialog(dialog, userMap);
        console.log(`   Pass ${i + 1}: Found ${finalNew} more users`);
        if (finalNew === 0) break;
      }
      
      const finalCount = userMap.size;
      console.log(`\n${'='.repeat(60)}`);
      console.log(`✅ SCAN COMPLETE!`);
      console.log(`   Total ${type}: ${finalCount}`);
      console.log(`   Scroll attempts: ${scrollAttempts}`);
      console.log(`   Total scroll distance: ${totalScrollDistance}px`);
      console.log(`${'='.repeat(60)}\n`);
      
      this.isScrolling = false;
      return Array.from(userMap.values());
      
    } catch (error) {
      console.error('❌ Error:', error);
      this.isScrolling = false;
      throw error;
    }
  }

  async scrapeList(type) {
    console.log(`\n🎯 Starting scrape for ${type}...`);
    
    const username = this.getCurrentUsername();
    if (!username) {
      throw new Error('Cannot find username. Go to your profile: instagram.com/your_username');
    }

    console.log(`👤 Username: ${username}`);
    
    // Check if already on the page with dialog open
    if (window.location.href.includes(`/${type}/`)) {
      console.log(`✅ Already on ${type} page`);
      await this.sleep(2000);
      
      if (document.querySelector('div[role="dialog"]')) {
        console.log('✅ Dialog is open');
        return await this.autoScrollDialog(type);
      }
    }

    // Click the followers/following link
    console.log(`🔍 Looking for ${type} link...`);
    await this.sleep(1000);
    
    // Find link by href
    const links = Array.from(document.querySelectorAll('a'));
    let targetLink = links.find(link => {
      const href = link.getAttribute('href');
      return href && href.includes(`/${username}/${type}/`);
    });

    // Fallback: find by text content
    if (!targetLink) {
      targetLink = links.find(link => {
        const text = link.textContent.toLowerCase().trim();
        return text.includes(type.toLowerCase());
      });
    }

    if (!targetLink) {
      throw new Error(`Cannot find ${type} link. Make sure you're on your profile page.`);
    }

    console.log(`✅ Found link, clicking...`);
    targetLink.click();
    
    console.log('⏳ Waiting for dialog...');
    await this.sleep(3000);
    
    return await this.autoScrollDialog(type);
  }

  getCurrentUsername() {
    // Method 1: From URL path
    const pathMatch = window.location.pathname.match(/^\/([^\/]+)/);
    if (pathMatch && pathMatch[1]) {
      const username = pathMatch[1];
      const excludedPaths = ['accounts', 'explore', 'direct', 'reels', 'stories', 'p', 'reel', 'tv', 'create'];
      if (!excludedPaths.includes(username)) {
        return username;
      }
    }

    // Method 2: From profile links in header
    const headerLinks = document.querySelectorAll('header a[href^="/"]');
    for (const link of headerLinks) {
      const href = link.getAttribute('href');
      if (href && href !== '/') {
        const match = href.match(/^\/([a-zA-Z0-9._]{1,30})\/?$/);
        if (match) {
          return match[1];
        }
      }
    }

    return null;
  }

  findUnfollowers() {
    const unfollowers = [];
    this.following.forEach((userData, username) => {
      if (!this.followers.has(username)) {
        unfollowers.push(userData);
      }
    });
    return unfollowers;
  }

  stopScrolling() {
    console.log('🛑 Stop requested');
    this.isScrolling = false;
  }

  loadFollowers(data) {
    this.followers.clear();
    data.forEach(user => this.followers.set(user.username, user));
    console.log(`📥 Loaded ${this.followers.size} followers`);
  }

  loadFollowing(data) {
    this.following.clear();
    data.forEach(user => this.following.set(user.username, user));
    console.log(`📥 Loaded ${this.following.size} following`);
  }
}

const manager = new InstagramManager();

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'scrapeFollowers' || request.action === 'scrapeFollowing') {
    (async () => {
      try {
        const type = request.action === 'scrapeFollowers' ? 'followers' : 'following';
        const result = await manager.scrapeList(type);
        sendResponse({ success: true, data: result });
      } catch (error) {
        console.error('❌ Error:', error);
        sendResponse({ success: false, error: error.message });
      }
    })();
    return true;
  }
  
  try {
    switch (request.action) {
      case 'findUnfollowers':
        sendResponse({ success: true, data: manager.findUnfollowers() });
        break;
      case 'stopScrolling':
        manager.stopScrolling();
        sendResponse({ success: true });
        break;
      case 'loadData':
        if (request.followers) manager.loadFollowers(request.followers);
        if (request.following) manager.loadFollowing(request.following);
        sendResponse({ success: true });
        break;
      default:
        sendResponse({ success: false, error: 'Unknown action' });
    }
  } catch (error) {
    sendResponse({ success: false, error: error.message });
  }
});

console.log('✅ Instagram Unfollower Manager loaded!');