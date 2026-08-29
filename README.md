# 🦉 Night Owl Nagger

> **A tiny desktop owl that refuses to let developers turn "one last commit" into a 4 AM coding marathon. 🌙💻**

[![GitHub stars](https://img.shields.io/github/stars/mmsvirdha/night-owl-nagger)](https://github.com/mmsvirdha/night-owl-nagger/stargazers)
[![GitHub issues](https://img.shields.io/github/issues/mmsvirdha/night-owl-nagger)](https://github.com/mmsvirdha/night-owl-nagger/issues)
[![GitHub license](https://img.shields.io/github/license/mmsvirdha/night-owl-nagger)](https://github.com/mmsvirdha/night-owl-nagger/blob/main/LICENSE)
[![Made with Electron](https://img.shields.io/badge/Made%20with-Electron-47848F?logo=electron)](https://electronjs.org)

---

## 🌙 Because apparently sleep is optional for developers. 😂

As a developer, I'm always telling myself:

> *"Just one more feature…"*  
> *"Just one more bug fix…"*  
> *"Okay, last commit…"*

And suddenly…

**2:00 AM.** 😭

We've all been there.

You get so focused on building something that you forget about sleep, breaks, and occasionally the concept of time itself.

And yes, I'm also familiar with getting scolded by my dad for sitting with my laptop at an unreasonable hour. 👿💻😂

So I thought:

> **Why not build something that annoys me BEFORE my dad has to?**

That's how **Night Owl Nagger** was born. 🦉

---

## 🦉 What It Does

- 🦉 **Lives quietly in your system tray** — keeping an eye on the clock and judging your life choices
- 🌙 **Knows when it's late** — default night hours: **11 PM – 6 AM**
- 🗣️ **Speaks with emotion** — uses Microsoft Zira voice with different moods
- ✨ **Full-screen dramatic entrances** — mood-colored particles and light rays flare out from the corner
- 🔥 **Roasts you with savage-but-loving messages**
- ⏰ **Reminds you every few minutes** to go to sleep
- 🛌 **Snooze or sleep options** to control the nagging

---

## 💬 Messages Include Gems Like

```
👀 Bro, are you still there?
🌙 Bro, the sun is coming back. You should probably sleep.
🔄 Git commit, git push, git sleep.
🤖 Bro, you're a human, not a machine. Just sleep now and start tomorrow.
😭 You said 'one last task' two hours ago.
🌙 You're not Batman. Go to bed.
```

> **"One more task?"**  
> ❌ NO.  
> **"One more commit?"**  
> ❌ GO TO SLEEP.  
> **"Just five more minutes?"**  
> 💀 WE BOTH KNOW THAT'S A LIE.

---

## 🎯 Why You Need This

Are **you** also struggling with coding and sleeping?

- 😴 Say "one last task" and code for 3 more hours?
- ☀️ Watch the sunrise while debugging?
- 🦉 Code at 3 AM like you're Batman?
- 📱 Get scolded by parents for late-night laptop use?

**Then this is for YOU!**

Let's annoy each other into getting better sleep. This desktop owl will bully you (with love) into going to bed at a reasonable hour.

---

## 🚀 Quick Start

### Prerequisites
- [Node.js](https://nodejs.org) (v18+)

### Installation

```bash
# Clone the repository
git clone https://github.com/mmsvirdha/night-owl-nagger.git

# Navigate to project folder
cd night-owl-nagger

# Install dependencies
npm install

# Run the app
npm start
```

That's it! The owl appears in your system tray and starts nagging during night hours.

---

## 🎮 How to Use

1. **Find the owl** in your system tray (near the clock)
2. **Right-click** the tray icon for options:
   - **Show owl now** - Test it immediately
   - **Pause for tonight** - Stop nagging for the night
   - **Voice: On/Off** - Toggle voice synthesis
   - **Screen FX: On/Off** - Toggle full-screen animations
   - **Open config file** - Customize settings
   - **Quit** - Close the app

3. **Popup controls:**
   - **5 more minutes** - Snooze for 5 minutes (configurable)
   - **Ok, going to sleep 😴** - Pause for the rest of the night
   - **✕** - Just dismiss this one popup

---

## ⚙️ Customization

Right-click the tray icon → **Open config file** to customize:

```json
{
  "nightStartHour": 23,
  "nightEndHour": 6,
  "reminderIntervalMinutes": 5,
  "snoozeMinutes": 5,
  "voiceEnabled": true,
  "voiceRate": 1.0,
  "voicePitch": 1.0,
  "voiceVolume": 1.0,
  "fullScreenEffectEnabled": true
}
```

- `nightStartHour` / `nightEndHour` — When nagging starts/stops (24-hour clock)
- `reminderIntervalMinutes` — How often owl appears
- `snoozeMinutes` — How long "5 more minutes" lasts
- `voiceEnabled` — Toggle voice synthesis
- `voiceRate` / `voicePitch` / `voiceVolume` — Voice adjustments
- `fullScreenEffectEnabled` — Toggle full-screen animations

### Add Your Own Messages

Edit the `MESSAGES` array in `main.js`:

```javascript
const MESSAGES = [
  { text: "Your custom message here", mood: "dramatic" },
  // Add more...
];
```

**Available moods:** `deadpan`, `sleepy`, `dramatic`, `sarcastic`, `playful`, `annoyed`, `caring`

---

## 🗣️ Voice Features

The owl speaks with **emotional expression** using your OS's text-to-speech:

| Mood | Effect |
|------|--------|
| 🥱 Sleepy | Slow, tired voice |
| 🔥 Dramatic | Builds tension, lands hard |
| 🙄 Sarcastic | Smug, sing-songy tone |
| 🎵 Playful | Quick, bouncy |
| 😤 Annoyed | Sharp, clipped |
| 💕 Caring | Warm, gentle |
| 😐 Deadpan | Flat, suspicious |

**Microsoft Zira** (female voice) is prioritized on Windows.

---

## ✨ Full-Screen Effects

Each mood triggers a unique screen animation:

| Mood | Effect | Colors |
|------|--------|--------|
| Dramatic | Flash + Glow | White, Gold |
| Annoyed | Screen Shake | Red |
| Sleepy | Gentle Pulse | Blue |
| Sarcastic | Dramatic Swipe | Yellow |
| Playful | Bounce | Cyan |
| Caring | Warm Glow | Pink |
| Default | Subtle Fade | Gold |

The animation is **click-through** and lasts about **2.5 seconds** — it never blocks your work!

---

## 🎬 Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl + Shift + N` (Windows/Linux) | Show owl now |
| `Cmd + Shift + N` (macOS) | Show owl now |
| `Escape` | Dismiss popup |
| `Shift + Enter` | Snooze |
| `Ctrl + S` | Sleep now |

---

## 📁 Project Structure

```
night-owl-nagger/
├── package.json          # Dependencies and scripts
├── main.js              # Tray icon, night-time detection, scheduling
├── preload.js           # Safe bridge between renderer and main process
├── README.md            # This file
└── renderer/
    ├── index.html       # Popup UI markup
    ├── style.css        # Dark theme + animations
    ├── renderer.js      # Voice, animations, button logic
    ├── fx.html          # Full-screen burst effect window
    ├── fx.js            # Mood-colored particle animations
    └── tray-icon.png    # Tray icon (64x64 PNG)
```

---

## 🔧 Packaging as Standalone App

Build a distributable `.exe` / `.app` / `.AppImage`:

```bash
# Install electron-builder
npm install --save-dev electron-builder

# Build for your platform
npx electron-builder

# Or build for specific platform
npx electron-builder --win    # Windows
npx electron-builder --mac    # macOS
npx electron-builder --linux  # Linux
```

The packaged app will be in the `dist/` folder.

---

## 🚀 Running on Startup (Optional)

- **Windows**: Create a shortcut in `shell:startup`
- **macOS**: Add to Login Items in System Settings
- **Linux**: Add to autostart applications

---

## 🤝 Contributing

Contributions are welcome! Feel free to:

- ⭐ Star the repo
- 🐛 Report bugs
- 💡 Suggest features
- 🔧 Submit pull requests

---

## 📝 License

MIT License — feel free to use, modify, and share!

---

## 🙏 Acknowledgments

- Built with [Electron](https://electronjs.org/)
- Made with 💜 and too much caffeine

---

## 💬 Connect

- 🐙 GitHub: [@mmsvirdha](https://github.com/mmsvirdha)
- 💼 LinkedIn: [Zeenathul Virdha Musawwir](https://www.linkedin.com/in/zeenathul-virdha-musawwir-123b60329/)

---

## 🌟 Show Your Support

If this owl made you laugh or (hopefully) helped you sleep better:

⭐ **Star this repo** on GitHub  
🦉 **Share it with friends** who also need a digital dad  
💬 **Tag someone** who codes at 3 AM

---

## 🦉 Let's Go

**The owl is watching. And it won't stop until you sleep.**

No more late-night coding marathons. No more "just one more commit." No more getting scolded by dad at 2 AM. 😂

**Let the owl annoy you into better sleep habits.**

---

*Now go to sleep. Seriously. The owl is watching.* 🦉


---

## 🏷️ Tags

```
night-owl-nagger, electron, desktop-app, productivity, sleep-reminder, developer-tools, developer-humor, coding-life, procrastination, open-source, side-project, build-in-public, web-speech-api, javascript, nodejs, sleep-deprivation, late-night-coding, developer-life, programming-humor, work-life-balance
```

---

**#NightOwlNagger #DeveloperLife #Sleep #Coding #OpenSource #Productivity #ElectronJS #BuildInPublic #SideProject**

