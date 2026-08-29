const { app, BrowserWindow, Tray, Menu, ipcMain, screen, nativeImage, shell } = require('electron');
const path = require('path');
const fs = require('fs');

// ---------- Config ----------
const CONFIG_PATH = path.join(app.getPath('userData'), 'config.json');
const DEFAULT_CONFIG = {
  nightStartHour: 23,              // 11 PM - when nagging starts
  nightEndHour: 6,                 // 6 AM - when nagging ends
  reminderIntervalMinutes: 5,      //  OWL EVERY 5 MINUTES (good for testing!)
  snoozeMinutes: 5,                //  SNOOZE FOR 5 MINUTES
  voiceEnabled: true,              //  Voice is ON
  voiceRate: 1.0,                  // Normal speed
  voicePitch: 1.0,                 // Normal pitch (will be overridden by mood)
  voiceVolume: 1.0,                // Full volume
  fullScreenEffectEnabled: true    // ✨ Full-screen animations ON
};

function loadConfig() {
  try {
    const raw = fs.readFileSync(CONFIG_PATH, 'utf-8');
    return { ...DEFAULT_CONFIG, ...JSON.parse(raw) };
  } catch {
    return { ...DEFAULT_CONFIG };
  }
}

function saveConfig(cfg) {
  fs.mkdirSync(path.dirname(CONFIG_PATH), { recursive: true });
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(cfg, null, 2));
}

let config = loadConfig();
saveConfig(config); // make sure a config file exists on first run so it's easy to find & edit

// ---------- Nag lines ----------
// Each line has a "mood" tag. The renderer uses this to pick a pitch/speed/
// pause style so the owl sounds like it's actually feeling something,
// instead of flatly reading text out loud. The same mood also drives the
// color palette of the full-screen effect below.
// Moods available: deadpan, sleepy, dramatic, sarcastic, playful, annoyed, caring
const MESSAGES = [
  { text: "👀 Bro, are you still there?", mood: "deadpan" },
  { text: "🥱 I'm tired just watching you.", mood: "sleepy" },
  { text: "🕐 It's late. Whatever you're fixing can be broken tomorrow.", mood: "sleepy" },
  { text: "🌙 Bro, the sun is coming back. You should probably sleep.", mood: "dramatic" },
  { text: "🌙 You're not Batman. Go to bed.", mood: "sarcastic" },
  { text: "🔄 Git commit, git push, git sleep.", mood: "playful" },
  { text: "😭 You said 'one last task' two hours ago.", mood: "annoyed" },
  { text: "💀 At this point, 'good night' is becoming 'good morning.'", mood: "dramatic" },
  { text: "🌅 Bro, why are we coding at sunrise?", mood: "annoyed" },
  { text: "🤖 Bro, you're a human, not a machine. Just sleep now and start tomorrow.", mood: "caring" }
];

// ---------- No-repeat message rotation ----------
// Shuffle all lines into a queue and hand them out one at a time, so you
// never see the same line twice in a row and don't get stuck on one
// favorite line before the others show up.
let messageQueue = [];
let lastMessage = null;

function shuffledCopy(arr) {
  const copy = [...arr];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function nextMessage() {
  if (messageQueue.length === 0) {
    messageQueue = shuffledCopy(MESSAGES);
    // avoid the freshly-shuffled queue starting with the same line that just ended
    if (messageQueue[messageQueue.length - 1] === lastMessage && messageQueue.length > 1) {
      [messageQueue[0], messageQueue[messageQueue.length - 1]] =
        [messageQueue[messageQueue.length - 1], messageQueue[0]];
    }
  }
  lastMessage = messageQueue.pop();
  return lastMessage;
}

// ---------- Night-time logic ----------
function isNightTime() {
  const hour = new Date().getHours();
  const { nightStartHour, nightEndHour } = config;
  if (nightStartHour === nightEndHour) return false;
  if (nightStartHour < nightEndHour) {
    return hour >= nightStartHour && hour < nightEndHour;
  }
  // window wraps past midnight, e.g. 23 -> 6
  return hour >= nightStartHour || hour < nightEndHour;
}

// ---------- Popup window ----------
let popupWindow = null;
let tray = null;
let snoozeUntil = 0;
let pausedForTonight = false;
let lastShownAt = 0;

// ---------- Full-screen effect window ----------
// A separate, transparent, click-through window sized to the whole monitor.
// It's the only way to actually animate across the real desktop — the owl
// popup itself is only 300x230, so anything drawn inside it can never
// cover the full screen.
let fxWindow = null;
const FX_DURATION_MS = 2500; // how long the burst animation runs for

function createFullScreenEffect(mood) {
  if (!config.fullScreenEffectEnabled) return;

  if (fxWindow) {
    fxWindow.close();
    fxWindow = null;
  }

  const { bounds } = screen.getPrimaryDisplay();

  fxWindow = new BrowserWindow({
    x: bounds.x,
    y: bounds.y,
    width: bounds.width,
    height: bounds.height,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    movable: false,
    focusable: false,
    hasShadow: false,
    fullscreenable: false,
    webPreferences: {
      contextIsolation: true
    }
  });

  fxWindow.setAlwaysOnTop(true, 'screen-saver');
  fxWindow.setIgnoreMouseEvents(true, { forward: true }); // click-through: never blocks anything underneath
  fxWindow.loadFile(path.join(__dirname, 'renderer', 'fx.html'), { query: { mood } });

  fxWindow.on('closed', () => {
    fxWindow = null;
  });

  // Safety net in case the renderer's own self-close doesn't fire for any reason
  setTimeout(() => {
    if (fxWindow) {
      fxWindow.close();
    }
  }, FX_DURATION_MS + 800);
}

function closeFullScreenEffect() {
  if (fxWindow) {
    fxWindow.close();
    fxWindow = null;
  }
}

function createPopup() {
  if (popupWindow) return;

  const { workAreaSize } = screen.getPrimaryDisplay();
  const width = 300;
  const height = 230;

  popupWindow = new BrowserWindow({
    width,
    height,
    x: workAreaSize.width - width - 24,
    y: workAreaSize.height - height - 24,
    frame: false,
    transparent: true,
    alwaysOnTop: true,
    skipTaskbar: true,
    resizable: false,
    hasShadow: false,
    focusable: true,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true
    }
  });

  popupWindow.setAlwaysOnTop(true, 'screen-saver');
  popupWindow.loadFile(path.join(__dirname, 'renderer', 'index.html'));

  popupWindow.webContents.once('did-finish-load', () => {
    const msg = nextMessage();
    popupWindow.webContents.send('set-message', {
      text: msg.text,
      mood: msg.mood,
      voiceEnabled: config.voiceEnabled,
      rateMult: config.voiceRate,
      pitchMult: config.voicePitch,
      volumeMult: config.voiceVolume
    });

    // Trigger the full-screen burst the moment the owl's message is set
    createFullScreenEffect(msg.mood);
  });

  popupWindow.on('closed', () => {
    popupWindow = null;
  });

  lastShownAt = Date.now();
}

function checkAndMaybeShow() {
  const now = Date.now();

  if (pausedForTonight) {
    if (!isNightTime()) pausedForTonight = false; // reset once night window ends
    return;
  }

  if (now < snoozeUntil) return;
  if (popupWindow) return; // already showing one

  if (!isNightTime()) return;

  const intervalMs = config.reminderIntervalMinutes * 60 * 1000;
  if (now - lastShownAt >= intervalMs) {
    createPopup();
  }
}

// ---------- App lifecycle ----------
app.whenReady().then(() => {
  const iconPath = path.join(__dirname, 'renderer', 'tray-icon.png');
  const icon = nativeImage.createFromPath(iconPath);
  tray = new Tray(icon.isEmpty() ? nativeImage.createEmpty() : icon);
  tray.setToolTip('Night Owl Nagger');

  function buildMenu() {
    return Menu.buildFromTemplate([
      { label: 'Show owl now', click: () => createPopup() },
      { label: 'Pause for tonight', click: () => { pausedForTonight = true; if (popupWindow) popupWindow.close(); } },
      { type: 'separator' },
      { label: `Night hours: ${String(config.nightStartHour).padStart(2, '0')}:00 – ${String(config.nightEndHour).padStart(2, '0')}:00`, enabled: false },
      { label: `Reminder every ${config.reminderIntervalMinutes} min`, enabled: false },
      {
        label: config.voiceEnabled ? '🔊 Voice: On (click to mute)' : '🔇 Voice: Off (click to enable)',
        click: () => { config.voiceEnabled = !config.voiceEnabled; saveConfig(config); tray.setContextMenu(buildMenu()); }
      },
      {
        label: config.fullScreenEffectEnabled ? '✨ Screen FX: On (click to disable)' : '✨ Screen FX: Off (click to enable)',
        click: () => { config.fullScreenEffectEnabled = !config.fullScreenEffectEnabled; saveConfig(config); tray.setContextMenu(buildMenu()); }
      },
      { label: 'Open config file', click: () => shell.openPath(CONFIG_PATH) },
      { label: 'Reload config (after editing)', click: () => { config = loadConfig(); tray.setContextMenu(buildMenu()); } },
      { type: 'separator' },
      { label: 'Quit', click: () => { app.exit(0); } }
    ]);
  }
  tray.setContextMenu(buildMenu());

  // Check every minute, but only ever actually pop up according to reminderIntervalMinutes
  setInterval(checkAndMaybeShow, 60 * 1000);
  checkAndMaybeShow(); // also check immediately at launch, in case it's already night
});

ipcMain.on('dismiss', () => {
  if (popupWindow) popupWindow.close();
  closeFullScreenEffect();
});

ipcMain.on('snooze', () => {
  snoozeUntil = Date.now() + config.snoozeMinutes * 60 * 1000;
  if (popupWindow) popupWindow.close();
  closeFullScreenEffect();
});

ipcMain.on('sleep-now', () => {
  pausedForTonight = true;
  if (popupWindow) popupWindow.close();
  closeFullScreenEffect();
});

app.on('window-all-closed', (e) => {
  e.preventDefault(); // keep living in the tray instead of quitting
});