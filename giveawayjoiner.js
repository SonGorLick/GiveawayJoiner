'use strict';
const { app, nativeImage, shell, session, Tray, BrowserWindow, Menu, ipcMain, ipcRenderer } = require('electron');
const storage = require('electron-json-storage');
const fs = require('fs');
const rq = require('request-promise-native');
let _devMode = false;
let _ua = 'Mozilla/5.0 (iPhone; CPU iPhone OS 13_3 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) CriOS/78.0.3904.84 Mobile/15E148 Safari/604.1';
let appLoaded = false;
let mainWindow = null;
let Browser = null;
let _session = null;
let Config = null;
let Lang = null;
let tray = null;
let user = null;
let _icn = null;
let _bmd = 'true';
let _bfr = 'false';
let _itr = __dirname + '/icons/tray.png';
let udata = process.execPath;
app.commandLine.appendSwitch('disable-software-rasterizer');
app.commandLine.appendSwitch('disk-cache-size', 60);
app.disableHardwareAcceleration();
if (process.platform === 'win32') {
_itr = __dirname + '/icons/icon.ico';
udata = (udata.slice(0, -4)).toLowerCase();
}
if (process.platform === 'darwin') {
app.dock.hide();
_bmd = 'false';
_bfr = 'true';
_itr = __dirname + '/icons/trayTemplate.png';
udata = (udata.slice(0, -34)).toLowerCase();
}
_icn = _itr;
app.setPath('userData', udata + 'data');
storage.setDataPath(udata + 'data');
if (fs.existsSync(storage.getDataPath() + '/devmode')) {
_devMode = true;
}
if (fs.existsSync(storage.getDataPath() + '/user-agent.txt')) {
let content = fs.readFileSync(storage.getDataPath() + '/user-agent.txt');
if (content.length > 0) {
_ua = content.toString();
}
}
else {
fs.writeFile(storage.getDataPath() + '/user-agent.txt', _ua, (err) => { });
}
if (!fs.existsSync(storage.getDataPath() + '/blacklist.txt')) {
fs.writeFile(storage.getDataPath() + '/blacklist.txt', 'app/0,sub/0,', (err) => { });
}
ipcMain.on('save-user', function (event, data) {
user = data;
global.user = data;
});
ipcMain.on('change-lang', (event, data) => {
Lang.change(data);
event.sender.send('change-lang', data);
});
app.on('window-all-closed', () => {
app.quit();
});
app.on('ready', () => {
Config = new ConfigClass();
Lang = new LanguageClass();
_session = session.fromPartition('persist:GiveawayJoiner');
_session.setUserAgent(_ua);
Menu.setApplicationMenu(null);
mainWindow = new BrowserWindow({
width: 876,
height: 600,
skipTaskbar: _bfr,
title: 'GiveawayJoiner',
icon: _icn,
show: false,
center: true,
resizable: false,
frame: false,
webPreferences: {
session: _session,
devTools: _devMode,
contextIsolation: false,
nodeIntegration: true,
webviewTag: true,
webSecurity: false,
webaudio: false
}
});
if (_devMode) {
mainWindow.webContents.openDevTools({ mode: 'detach' });
}
Browser = new BrowserWindow({
parent: mainWindow,
icon: _icn,
title: 'GiveawayJoiner',
width: 1200,
height: 700,
minWidth: 800,
minHeight: 600,
modal: _bmd,
frame: _bfr,
show: false,
center: true,
webPreferences: {
session: _session,
devTools: false,
contextIsolation: false,
webviewTag: true,
webSecurity: false,
webaudio: false
}
});
Browser.loadFile('blank.html');
Browser.on('close', (e) => {
e.preventDefault();
Browser.loadFile('blank.html');
Browser.hide();
if (mainWindow.hidden) {
mainWindow.focus();
}
});
mainWindow.on('close', () => {
mainWindow.removeAllListeners('close');
});
mainWindow.on('closed', () => {
mainWindow = null;
});
tray = new Tray(nativeImage.createFromPath(_itr));
tray.setToolTip('GiveawayJoiner');
tray.on('click', () => {
mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
});
global.sharedData = {
_devMode: _devMode,
shell: shell,
TrayIcon: tray,
ipcMain: ipcMain,
Lang: Lang,
Config: Config,
Browser: Browser,
mainWindow: mainWindow,
rq: rq
};
});
function startApp() {
if (appLoaded) {
return;
}
let afterLangs = function () {
let data = {
response: {
username: 'GiveawayJoiner',
avatar: __dirname + '/icons/icon.png',
steamid: '1'
}
};
user = data.response;
global.user = data.response;
mainWindow.loadFile('index.html');
mainWindow.on('ready-to-show', () => {
mainWindow.show();
if (Config.get('start_minimized')) {
mainWindow.hide();
}
else {
mainWindow.focus();
}
});
};
Lang.loadLangs(afterLangs);
appLoaded = true;
}
class LanguageClass {
constructor() {
this.default = 'en_US';
this.languages = {};
this.langsCount = 0;
rq({uri: 'https://raw.githubusercontent.com/pumPCin/GiveawayJoiner/master/giveawayjoinerdata/all.json', json: true})
.then((data) => {
if (data.response !== false) {
data = JSON.parse(data.response).langs;
let checked = 0;
for (let one in data) {
let name = data[one].name;
let size = data[one].size;
let loadLang = () => {
rq({uri: 'https://raw.githubusercontent.com/pumPCin/GiveawayJoiner/master/giveawayjoinerdata/' + name})
.then((lang) => {
fs.writeFile(storage.getDataPath() + '/' + name, lang, (err) => { });
checked++;
if (checked >= data.length) {
startApp();
}
});
};
if (!fs.existsSync(storage.getDataPath() + '/' + name)) {
loadLang();
}
else {
fs.stat(storage.getDataPath() + '/' + name, (err, stats) => {
if (stats.size !== size) {
loadLang();
}
else {
checked++;
}
if (checked === data.length) {
startApp();
}
});
}
}
}
else {
startApp();
}
})
.catch(() => {
startApp();
console.log('catchLang Constructor');
});
}
loadLangs(callback) {
let _this = this;
if (fs.existsSync(storage.getDataPath())) {
let lng_to_load = [];
let dir = fs.readdirSync(storage.getDataPath());
for (let x = 0; x < dir.length; x++) {
if (dir[x].indexOf('lang.') >= 0) {
lng_to_load.push(dir[x].replace('.json', ''));
}
}
if (!lng_to_load.length) {
return;
}
storage.getMany(lng_to_load, function (error, langs) {
if (error) throw new Error("Can't load selected translation");
let lng;
for (lng in langs.lang) {
_this.langsCount++;
}
if (langs.lang[Config.get('lang', _this.default)] === undefined) {
_this.default = lng;
Config.set('lang', _this.default);
}
_this.languages = langs.lang;
if (callback) {
callback();
}
});
}
}
get(key) {
let response = this.languages;
let splited = (Config.get('lang', this.default) + '.' + key).split('.');
for (let i = 0; i < splited.length; i++) {
if (response[splited[i]] !== undefined) {
response = response[splited[i]];
}
else {
response = key;
break;
}
}
return response;
}
change(setLang) {
Config.set('lang', setLang);
}
count() {
return this.langsCount;
}
current() {
return Config.get('lang', this.default);
}
list() {
return this.languages;
}
}
class ConfigClass {
constructor() {
let _this = this;
this.settings = {};
storage.get('configs', function (error, data) {
if (error) throw error;
_this.settings = data;
});
}
set(key, value) {
this.settings[key] = value;
storage.set('configs', this.settings);
}
get(key, def_val) {
if (this.settings[key] !== undefined) {
return this.settings[key];
}
if (def_val !== undefined) {
return def_val;
}
return false;
}
}
