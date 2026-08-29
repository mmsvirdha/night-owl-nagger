const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('owlAPI', {
  onMessage: (callback) => ipcRenderer.on('set-message', (_event, payload) => callback(payload)),
  dismiss: () => ipcRenderer.send('dismiss'),
  snooze: () => ipcRenderer.send('snooze'),
  sleepNow: () => ipcRenderer.send('sleep-now')
});
