# 📊 Instagram Unfollower Manager

A professional Chrome extension to help you manage your Instagram following and discover who doesn't follow you back.

![Version](https://img.shields.io/badge/version-1.0.0-blue.svg)
![License](https://img.shields.io/badge/license-MIT-green.svg)
![Chrome](https://img.shields.io/badge/platform-Chrome-yellow.svg)

---

## ✨ Features

- 🔍 **Scan Followers** - Automatically scroll and extract all your followers
- 📤 **Scan Following** - Get a complete list of accounts you follow
- 🎯 **Find Unfollowers** - Instantly identify who doesn't follow you back
- 💾 **Data Persistence** - Your scan results are saved locally
- 🗑️ **Clear Data** - Reset everything and start fresh
- 🎨 **Beautiful UI** - Modern gradient design with smooth animations
- 👤 **Simple Display** - Clean list with username initials
- ⚡ **Smart Scrolling** - Intelligent auto-scroll with progress tracking
- 🔒 **Privacy Focused** - All data stored locally, no external servers

---

## 🚀 Quick Installation

### Step 1: Download Extension

**Option A: Clone with Git**
```bash
git clone https://github.com/amirrahemi01/instagram-unfollower.git
```

**Option B: Download ZIP**
1. Click the green **"Code"** button above
2. Select **"Download ZIP"**
3. Extract the ZIP file to a folder

### Step 2: Install in Chrome

1. Open Chrome and go to `chrome://extensions/`
2. Enable **"Developer mode"** (toggle in top-right corner)
3. Click **"Load unpacked"** button
4. Select the extension folder you downloaded
5. The extension icon (📊) will appear in your toolbar

### Step 3: Pin Extension (Optional)
- Click the puzzle icon (🧩) in Chrome toolbar
- Find "Instagram Unfollower Manager"
- Click the pin icon (📌) to keep it visible

---

## 📖 How to Use

### 1️⃣ Navigate to Instagram
- Open [Instagram.com](https://www.instagram.com) in Chrome
- Log in to your account
- Go to **your profile page** (click your profile picture)

### 2️⃣ Scan Your Followers
- Click the extension icon (📊) in toolbar
- Click **"Scan Followers"** button
- Wait for scanning to complete (1-5 minutes depending on follower count)
- Extension will automatically scroll and collect all followers

### 3️⃣ Scan Following
- Click **"Scan Following"** button
- Wait for the scan to complete
- All accounts you follow will be collected

### 4️⃣ Find Unfollowers
- After both scans complete, click **"Find Unfollowers"**
- View the list of people who don't follow you back
- Each user shows their username with a colored avatar initial

### 5️⃣ Clear Data (Optional)
- Click **"Clear All Data"** button to reset everything
- Useful when you want to start fresh
- All saved data will be deleted from local storage

---

## ⚙️ How It Works

### Technical Overview
The extension uses:
- **Content Script** - Reads Instagram's DOM structure
- **Smart Auto-Scroll** - Intelligently scrolls through follower/following dialogs
- **Multiple Extraction Methods** - Uses various strategies to find usernames accurately
- **Chrome Storage API** - Saves data locally in your browser
- **Background Service Worker** - Manages data persistence

### Scanning Process
1. Opens the followers/following dialog on Instagram
2. Detects the scrollable container automatically
3. Scrolls incrementally while extracting user data
4. Uses multiple passes to ensure accuracy
5. Saves results to local storage
6. Displays results in a clean, organized list

### Privacy & Security
- ✅ All data stored **locally** in your browser
- ✅ No data sent to external servers
- ✅ No tracking or analytics
- ✅ Open source - you can review all code
- ✅ Only requests access to Instagram.com

---

## 🛠️ Troubleshooting

### Common Issues & Solutions

#### ❌ "Connection Error"
**Problem:** Extension can't connect to Instagram tab

**Solutions:**
1. Refresh the Instagram page (F5)
2. Make sure you're on `instagram.com`
3. Reload extension from `chrome://extensions/`
4. Try closing and reopening Instagram tab

#### ❌ "Cannot find username"
**Problem:** Extension can't detect your profile

**Solutions:**
1. Make sure you're on your profile page
2. URL should be: `instagram.com/YOUR_USERNAME`
3. Try clicking your profile picture in top-right corner
4. Refresh the page and try again

#### ❌ Scan Not Finding All Users
**Problem:** Extension shows 120 followers but you have 140

**Solutions:**
1. **Run the scan twice** - Second scan often catches more
2. Ensure stable internet connection
3. Don't interact with Instagram during scanning
4. Close other resource-heavy tabs
5. For large accounts (1000+), some discrepancy is normal (~95-98% accuracy)

#### ❌ Scan Gets Stuck
**Problem:** Progress bar stops moving

**Solutions:**
1. Click **"Stop Scanning"** button
2. Refresh Instagram page
3. Check browser console (F12) for errors
4. Try again after 5 minutes (Instagram may be rate-limiting)

#### ❌ Extension Not Loading
**Problem:** Extension doesn't appear in toolbar

**Solutions:**
1. Check all files are present in folder:
   - manifest.json
   - background.js
   - content.js
   - popup.html
   - popup.js
   - icons/ folder with images
2. Go to `chrome://extensions/` and check for errors
3. Make sure Developer Mode is enabled
4. Try reloading the extension

### Performance Tips

**Scanning Times (Expected):**
- **Small** (< 100 users): 30-60 seconds
- **Medium** (100-500): 1-3 minutes
- **Large** (500-2000): 3-7 minutes
- **Very Large** (2000+): 5-15 minutes

**For Best Results:**
- Use stable internet connection
- Close unnecessary tabs
- Don't interact with Instagram during scan
- Let the scan complete fully
- Run scan twice for maximum accuracy

---

## ⚠️ Important Notes

### Rate Limiting
- Instagram may rate-limit if you scan too frequently
- Wait 5-10 minutes between scans if you encounter issues
- Extension uses delays to minimize rate limit risks

### Accuracy
- Scans are typically 95-99% accurate
- Large follower counts may take longer
- Some users may be missed due to Instagram's lazy loading
- Private account requests are included

### Limitations
- Only works on Instagram.com
- Requires manual installation (not on Chrome Web Store yet)
- Instagram UI changes may affect functionality
- Very large accounts (5000+) may be slower

### Legal & Ethical Use
- ⚠️ Use responsibly and respect Instagram's Terms of Service
- ⚠️ Don't use for spam, harassment, or malicious purposes
- ⚠️ Respect other users' privacy
- ⚠️ For personal use only

---

## 🤝 Contributing

Contributions are welcome! Here's how you can help:

### Ways to Contribute
- 🐛 Report bugs
- 💡 Suggest new features
- 📝 Improve documentation
- 🔧 Submit pull requests
- ⭐ Star the repository

### How to Contribute
1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes
4. Test thoroughly
5. Commit: `git commit -m 'Add amazing feature'`
6. Push: `git push origin feature/amazing-feature`
7. Open a Pull Request

### Development Guidelines
- Follow existing code style
- Add comments for complex logic
- Test on multiple account sizes
- Update README if adding features
- Include error handling

---

## 📁 Project Structure

```
instagram-unfollower-manager/
├── manifest.json         # Extension configuration
├── background.js         # Service worker for data storage
├── content.js            # Instagram page scraping logic
├── popup.html            # Extension popup UI
├── popup.js              # Popup functionality
├── icons/                # Extension icons
│   ├── icon16.png
│   ├── icon48.png
│   └── icon128.png
├── README.md             # This file
└── LICENSE               # MIT License
```

---

## 🐛 Known Issues

- Scanning very large lists (5000+) may be slow
- Instagram UI updates may break functionality
- Some users may be missed due to lazy loading
- Results show username only (no profile links)

**Please report issues on GitHub Issues page!**

---

## 🗺️ Roadmap

Future features planned:
- [ ] Export to CSV/JSON
- [ ] Statistics dashboard
- [ ] Dark mode support
- [ ] Track changes over time
- [ ] Multi-language support
- [x] Firefox support
- [ ] Chrome Web Store publication

---

## 📄 License

This project is licensed under the **MIT License**.

```
MIT License

Copyright (c) 2025 Amir Rahemi

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
```

---

## ⚖️ Disclaimer

This extension is **not affiliated with, endorsed by, or connected to** Instagram or Meta Platforms, Inc. 

**Use at your own risk.** The developers are not responsible for:
- Account restrictions or bans
- Data loss or inaccuracies
- Any violations of Instagram's Terms of Service
- Any misuse of this extension

**Recommendation:** Use responsibly, respect rate limits, and follow Instagram's community guidelines.

---

## 👨‍💻 Author & Contact

**Created by:** Amir Rahemi

- 🌐 GitHub: [@amirrahemi01](https://github.com/amirrahemi01)
- 📧 Email: amirrahemi01@gmail.com
- 💼 Portfolio: [amirrahemi.com](https://amirrahemi.com)

---

## 🙏 Acknowledgments

- Built with ❤️ for the Instagram community
- Thanks to all contributors and users
- Inspired by the need for better follower management tools
- Special thanks to the open-source community

---

## 📧 Support & Feedback

### Need Help?
1. Check the [Troubleshooting](#troubleshooting) section above
2. Search [existing issues](https://github.com/amirrahemi01/instagram-unfollower-manager/issues)
3. Open a new issue with:
   - Browser version
   - Error messages
   - Console logs (F12 → Console)
   - Steps to reproduce

### Feature Requests
Have an idea? [Open an issue](https://github.com/amirrahemi01/instagram-unfollower-manager/issues/new) with the "enhancement" label!

### Bug Reports
Found a bug? [Report it](https://github.com/amirrahemi01/instagram-unfollower-manager/issues/new) with:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Screenshots if applicable

---

## ⭐ Star History

If you find this extension useful, please consider:
- ⭐ **Starring the repository**
- 🔄 **Sharing with friends**
- 🐛 **Reporting bugs**
- 💡 **Suggesting features**
- 🤝 **Contributing code**

---

## 📊 Stats

![GitHub stars](https://img.shields.io/github/stars/YOUR_GITHUB_USERNAME/instagram-unfollower-manager?style=social)
![GitHub forks](https://img.shields.io/github/forks/YOUR_GITHUB_USERNAME/instagram-unfollower-manager?style=social)
![GitHub issues](https://img.shields.io/github/issues/YOUR_GITHUB_USERNAME/instagram-unfollower-manager)
![GitHub license](https://img.shields.io/github/license/YOUR_GITHUB_USERNAME/instagram-unfollower-manager)

---

<div align="center">

**MADE WITH ❤️ BY AMIR RAHEMI IN RASHT**

[⬆ Back to Top](#-instagram-unfollower-manager)

</div>