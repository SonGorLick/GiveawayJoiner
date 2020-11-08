'use strict';
const { app, nativeImage, shell, session, Tray, BrowserWindow, Menu, ipcMain, ipcRenderer } = require('electron');
const storage = require('electron-json-storage');
const fs = require('fs');
const rq = require('axios').default;
let devMode = false;
let _ua = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.111 Safari/537.36';
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
app.commandLine.appendSwitch('--no-sandbox');
app.commandLine.appendSwitch('disk-cache-size', 100);
app.commandLine.appendSwitch('disable-site-isolation-trials')
app.commandLine.appendSwitch('disable-features', 'OutOfBlinkCors');
app.disableHardwareAcceleration();
if (process.platform === 'win32') {
_itr = __dirname + '/icons/icon.ico';
udata = (udata.slice(0, -4)).toLowerCase();
}
if (process.platform === 'darwin') {
_bmd = false;
_bfr = true;
_itr = __dirname + '/icons/trayTemplate.png';
udata = (udata.slice(0, -34)).toLowerCase();
}
_icn = _itr;
app.setPath('userData', udata + 'data');
storage.setDataPath(udata + 'data');
if (fs.existsSync(storage.getDataPath() + '/user-agent.txt')) {
let content = fs.readFileSync(storage.getDataPath() + '/user-agent.txt').toString().split('\n')[0];
if (content.length > 50) {
_ua = content;
}
}
else {
fs.writeFile(storage.getDataPath() + '/user-agent.txt', _ua, (err) => { });
}
if (!fs.existsSync(storage.getDataPath() + '/blacklist.txt')) {
fs.writeFile(storage.getDataPath() + '/blacklist.txt', ',app/0,sub/0,bundle/0,', (err) => { });
}
if (!fs.existsSync(storage.getDataPath() + '/whitelist.txt')) {
fs.writeFile(storage.getDataPath() + '/whitelist.txt', ',app/0,sub/0,bundle/0,', (err) => { });
}
if (fs.existsSync(storage.getDataPath() + '/devmode')) {
devMode = true;
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
app.on('activate', () => {
mainWindow.show();
});
app.on('before-quit', () => {
app.quitting = true;
});
app.on('ready', () => {
Config = new ConfigClass();
Lang = new LanguageClass();
_session = session.fromPartition('persist:GiveawayJoiner');
_session.setUserAgent(_ua);
Menu.setApplicationMenu(null);
mainWindow = new BrowserWindow({
width: 876,
height: 616,
skipTaskbar: false,
title: 'GiveawayJoiner',
icon: _icn,
show: false,
center: true,
backgroundColor: '#263238',
resizable: false,
frame: false,
hasShadow: false,
webPreferences: {
session: _session,
devTools: devMode,
backgroundThrottling: false,
contextIsolation: false,
nodeIntegration: true,
webviewTag: true,
webSecurity: false,
enableRemoteModule: true
}
});
if (devMode) {
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
backgroundColor: '#263238',
hasShadow: false,
webPreferences: {
session: _session,
devTools: false,
contextIsolation: false,
webviewTag: true,
webSecurity: false,
enableRemoteModule: true
}
});
Browser.loadFile('blank.html');
Browser.on('close', (e) => {
e.preventDefault();
Browser.loadFile('blank.html');
Browser.hide();
mainWindow.focus();
});
mainWindow.on('close', (e) => {
if (app.quitting || process.platform !== 'darwin') {
mainWindow = null;
}
else {
e.preventDefault();
mainWindow.hide();
}
});
tray = new Tray(nativeImage.createFromPath(_itr));
tray.setToolTip('GiveawayJoiner');
tray.on('click', () => {
mainWindow.isVisible() ? mainWindow.hide() : mainWindow.show();
});
global.sharedData = {
devMode: devMode,
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
username: 'User',
avatar: __dirname + '/icons/icon.png'
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
this.default = 'ru_RU';
this.languages = {};
this.langsCount = 0;
let url = 'https://raw.githubusercontent.com/pumPCin/GiveawayJoiner/master/giveawayjoinerdata/';
rq({url: url + 'all.json'})
.then((all) => {
let data = all.data;
if (data.response !== false) {
data = JSON.parse(data.response).langs;
let checked = 0;
for (let one in data) {
let name = data[one].name;
let loadLang = () => {
rq({url: url + name, responseType: 'document'})
.then((language) => {
let lang = JSON.stringify(language.data);
fs.writeFile(storage.getDataPath() + '/' + name, lang, (err) => { });
})
.finally(() => {
checked++;
if (checked >= data.length) {
startApp();
}
});
};
if (fs.existsSync(storage.getDataPath() + '/' + name)) {
checked++;
}
else {
loadLang();
}
if (checked >= data.length) {
startApp();
}
}
}
else {
startApp();
}
})
.catch(() => {
startApp();
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
