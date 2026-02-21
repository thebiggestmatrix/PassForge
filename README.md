<div align="center">

<img src="https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white" alt="HTML5" />
<img src="https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white" alt="CSS3" />
<img src="https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black" alt="JavaScript" />
<img src="https://img.shields.io/badge/Tailwind_CSS-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="Tailwind" />
<img src="https://img.shields.io/badge/License-MIT-22c55e?style=for-the-badge" alt="License" />

<br /><br />

# ✨ PassForge

# Demo page: https://thebiggestmatrix.github.io/PassForge/

---

<div align="center">


### Secure Password Generator

A modern, beautiful, and fully client-side password generator built with vanilla HTML, CSS, and JavaScript. Generate strong, customizable passwords with real-time strength analysis - all running locally in your browser.

<br />

[Features](#-features) · [Getting Started](#-getting-started) · [Usage](#-usage) · [Tech Stack](#-tech-stack) · [Project Structure](#-project-structure) · [License](#-license)

<br />

</div>

---

## 🎯 Features

### 🔐 Password Generation
- **Adjustable length** - from **4 to 128** characters via an interactive slider or manual input
- **Character set toggles** - independently enable/disable lowercase, uppercase, numbers, and symbols
- **Exclude similar characters** - removes confusing characters like `i`, `l`, `1`, `I`, `O`, `0`
- **Exclude ambiguous symbols** - removes hard-to-read symbols like `{ } [ ] ( ) / \ ' " ~`
- **Batch generation** - generate **1, 3, 5, or 10** passwords at once
- **Guaranteed character inclusion** - at least one character from each enabled set is always present
- **Fisher-Yates shuffle** - cryptographically fair distribution of characters

### 📊 Real-Time Analysis
- **Strength indicator** - 5-segment color bar with labels from *Very Weak* to *Very Strong*
- **Entropy calculation** - displays password entropy in bits
- **Crack time estimation** - human-readable estimates (Instantly → Eternity ♾️)
- **Reactive updates** - all stats and passwords regenerate instantly when any option changes

### 🎨 Beautiful UI
- **Dark glassmorphism theme** - frosted glass cards with subtle borders and shadows
- **Animated particle system** - canvas-based floating particles with connection lines and mouse interaction
- **Grid background** - subtle violet-tinted grid with glowing intersection dots
- **Gradient blobs** - layered atmospheric gradient orbs for depth
- **Smooth animations** - fade-in effects, hover transitions, and pulse animations
- **Fully responsive** - looks great on mobile, tablet, and desktop

### 🛡️ Privacy & Security
- **100% client-side** - no data ever leaves your browser
- **No tracking** - zero analytics, cookies, or telemetry
- **No server calls** - everything is computed locally in JavaScript
- **No dependencies on external APIs** - works completely offline after loading

### 📋 Additional Features
- **One-click copy** - copy any password to clipboard instantly
- **Show/hide passwords** - toggle blur effect for privacy when sharing screen
- **Copy history** - keeps track of previously copied passwords with timestamps and strength indicators
- **History management** - expand/collapse history panel, clear all entries

---

## 🚀 Getting Started

No build step required! Just open `index.html` in your browser.

```bash
# Clone the repository
git clone https://github.com/thebiggestmatrix/PassForge.git
cd PassForge

# Open in browser
open index.html
```

Or simply double-click `index.html` to launch it.

---

## 🎮 Usage

### Generating Passwords

1. **Adjust the length** using the slider or type a number directly (4–128)
2. **Toggle character sets** - enable or disable lowercase, uppercase, numbers, and symbols
3. **Fine-tune** with advanced options like excluding similar or ambiguous characters
4. **Choose quantity** - generate 1, 3, 5, or 10 passwords at once
5. Passwords **auto-generate** whenever you change any setting

### Copying & Managing

- Click the **copy icon** 📋 next to any password to save it to your clipboard
- Use the **eye icon** 👁️ to show/hide individual passwords
- Click **Regenerate** to create new passwords with the same settings
- Expand **Copy History** to see all previously copied passwords

### Understanding Strength

| Indicator | Score | Description |
|-----------|-------|-------------|
| 🔴 Very Weak | 0–2 | Easily crackable, avoid using |
| 🟠 Weak | 3–4 | Below minimum security standards |
| 🟡 Fair | 5–6 | Acceptable for low-security use |
| 🟢 Strong | 7–8 | Good for most purposes |
| 🔵 Very Strong | 9 | Excellent - recommended |

**Tips for strong passwords:**
- Use **16+ characters**
- Enable **all character sets** (lowercase, uppercase, numbers, symbols)
- Avoid excluding characters unless necessary for compatibility

---

## 🛠️ Tech Stack

| Technology | Purpose |
|---|---|
| HTML5 | Semantic page structure |
| CSS3 | Custom styles, animations, slider, toggles |
| JavaScript (ES6+) | Password generation, DOM manipulation, particle system |
| [Tailwind CSS (CDN)](https://tailwindcss.com/) | Utility-first CSS framework |
| [Lucide Icons (CDN)](https://lucide.dev/) | Beautiful, consistent icon library |

---

## 📁 Project Structure

```
passforge/
├── index.html      # Main HTML page
├── style.css       # Custom styles (grid, slider, toggles, animations)
├── script.js       # All application logic and particle animation
├── README.md       # This file
└── LICENSE.md      # MIT License
```

### Key Files Explained

| File | Description |
|---|---|
| `index.html` | Full page structure with Tailwind CDN and Lucide CDN, all interactive elements |
| `style.css` | Custom CSS for grid background, range slider, toggle switches, scrollbar, and animations |
| `script.js` | Password generation (Fisher-Yates), strength analysis, entropy calculation, canvas particle system, and all DOM event handling |

---

## 🔧 How It Works

### Password Generation Algorithm

1. **Character pool construction** - builds a string from all enabled character sets
2. **Guaranteed inclusion** - picks one random character from each enabled set
3. **Fill remaining** - fills the rest with random characters from the combined pool
4. **Fisher-Yates shuffle** - shuffles the entire array for uniform distribution

### Strength Scoring (0–9)

Points are awarded for:
- Length thresholds (8, 12, 16, 24 characters)
- Presence of each character type (lowercase, uppercase, numbers, symbols)
- Character uniqueness ratio (≥70% unique characters)

### Entropy Calculation

```
entropy = length × log₂(pool_size)
```

Where `pool_size` is the total number of possible characters based on enabled sets:
- Lowercase: 26 | Uppercase: 26 | Numbers: 10 | Symbols: 29

---

## 🌐 Browser Support

| Browser | Support |
|---|---|
| Chrome 90+ | ✅ Full support |
| Firefox 90+ | ✅ Full support |
| Safari 15+ | ✅ Full support |
| Edge 90+ | ✅ Full support |
| Mobile browsers | ✅ Responsive design |

---

## 📄 License

This project is licensed under the **MIT License** - see the [LICENSE.md](LICENSE.md) file for details.

You are free to use, modify, and distribute this software for any purpose.

---

<div align="center">

Made with ❤️ and a passion for security

**⭐ Star this repo if you find it useful!**

</div>
