'use strict';
const { app, nativeImage, shell, Menu, session, Tray, BrowserWindow, ipcMain, ipcRenderer } = require('electron');
const storage = require('electron-json-storage');
const fs = require('fs');
const Request = require('request-promise');
const devMode = app.getVersion() === '2.0.17';
let appLoaded = false;
let authWindow = null;
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
app.disableHardwareAcceleration();
if (process.platform === 'win32') {
_itr = __dirname + '/icons/icon.ico'
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
const isSecondInstance = app.makeSingleInstance((commandLine, workingDirectory) => {
if (mainWindow) {
if (mainWindow.isMinimized())
mainWindow.restore();
if( !mainWindow.isVisible() )
mainWindow.show();
mainWindow.focus();
}
});
if ( isSecondInstance ){
app.quit();
}
ipcMain.on('save-user', function(event, data) {
user = data;
global.user = data;
});
ipcMain.on('change-lang', function(event, data) {
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
_session.setUserAgent('Mozilla/5.0 (Linux; Android 8.0.0; SM-G960F Build/R16NW) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/62.0.3202.84 Mobile Safari/537.36');
authWindow = new BrowserWindow({
width: 280,
height: 340,
skipTaskbar: true,
title: 'GiveawayJoiner',
icon: _icn,
show: false,
center: true,
resizable: false,
frame: false,
webPreferences: {
session: _session,
devTools: devMode
}
});
authWindow.setMenu(null);
mainWindow = new BrowserWindow({
width: 730,
height: 500,
skipTaskbar: true,
title: 'GiveawayJoiner',
icon: _icn,
show: false,
center: true,
resizable: false,
frame: false,
webPreferences: {
session: _session,
devTools: devMode
}
});
mainWindow.setMenu(null);
if(devMode){
mainWindow.webContents.openDevTools();
}
Browser = new BrowserWindow({
parent: mainWindow,
icon: _icn,
title: 'GiveawayJoiner',
width: 1024,
height: 600,
minWidth: 600,
minHeight: 500,
modal: _bmd,
frame: _bfr,
show: false,
center: true,
webPreferences: {
nodeIntegration: false,
session: _session,
devTools: false
}
});
Browser.loadFile('blank.html');
Browser.setMenu(null);
Browser.on('close', (e) => {
e.preventDefault();
Browser.loadFile('blank.html');
Browser.hide();
if(mainWindow.hidden)
authWindow.focus();
else
mainWindow.focus();
});
authWindow.on('close', () => {
authWindow.removeAllListeners('close');
mainWindow.close();
});
mainWindow.on('close', () => {
mainWindow.removeAllListeners('close');
authWindow.close();
});
authWindow.on('closed', () => {
authWindow = null;
});
mainWindow.on('closed', () => {
mainWindow = null;
});
tray = new Tray(nativeImage.createFromPath(_itr));
tray.setToolTip("GiveawayJoiner " + app.getVersion());
tray.on('click', () => {
if( user === null )
authWindow.isVisible() ? authWindow.hide() : authWindow.show();
else
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
authWindow: authWindow,
mainWindow: mainWindow,
Request: Request
};
});
function startApp(){
if( appLoaded )
return;
let afterLangs = function(){
authWindow.loadFile('auth.html');
authWindow.on('ready-to-show', function() {
authWindow.show();
if( Config.get('start_minimized') )
authWindow.hide();
else
authWindow.focus();
});
};
Lang.loadLangs(afterLangs);
appLoaded = true;
}
class LanguageClass {
constructor(){
this.default = 'en_US';
this.languages = {};
this.langsCount = 0;
Request({uri: 'https://raw.githubusercontent.com/pumPCin/GiveawayJoiner/master/giveawayjoinerdata/all.json', json: true})
.then((data) => {
if(data.response !== false){
data = JSON.parse(data.response).langs;
let checked = 0;
for(let one in data){
let name = data[one].name;
let size = data[one].size;
let loadLang = () => {
Request( { uri: 'https://raw.githubusercontent.com/pumPCin/GiveawayJoiner/master/giveawayjoinerdata/' + name } )
.then(( lang ) => {
fs.writeFile(storage.getDataPath() + '/' + name, lang, (err) => { });
})
.finally(() => {
checked++;
if( checked >= data.length )
startApp();
});
};
if( !fs.existsSync( storage.getDataPath() + '/' + name ) )
loadLang();
else{
fs.stat(storage.getDataPath() + '/' + name, (err, stats) => {
if( stats.size !== size )
loadLang();
else
checked++;
if( checked === data.length )
startApp();
});
}
}
}
else
startApp();
})
.catch(() => {
startApp();
console.log('catchLang Constructor');
});
}
loadLangs(callback){
let _this = this;
if( fs.existsSync(storage.getDataPath()) ){
let lng_to_load = [];
let dir = fs.readdirSync(storage.getDataPath());
for(let x = 0; x < dir.length; x++){
if( dir[x].indexOf('lang.') >= 0 ){
lng_to_load.push(dir[x].replace('.json', ''));
}
}
if( !lng_to_load.length )
return;
storage.getMany(lng_to_load, function(error, langs){
if(error) throw new Error(`Can't load selected translation`);
let lng;
for(lng in langs.lang )
_this.langsCount++;
if( langs.lang[Config.get('lang', _this.default)] === undefined ){
_this.default = lng;
Config.set('lang', _this.default);
}
_this.languages = langs.lang;
if(callback)
callback();
});
}
}
get(key){
let response = this.languages;
let splited = (Config.get('lang', this.default) + '.' + key).split('.');
for(let i = 0; i < splited.length; i++){
if( response[splited[i]] !== undefined ){
response = response[splited[i]];
}
else{
response = key;
break;
}
}
return response;
}
change(setLang){
Config.set('lang', setLang);
}
count(){
return this.langsCount;
}
current(){
return Config.get('lang', this.default);
}
list(){
return this.languages;
}
}
class ConfigClass {
constructor(){
let _this = this;
this.settings = {};
storage.get("configs", function(error, data){
if(error) throw error;
_this.settings = data;
_this.set('inits', ( _this.get('inits', 0) + 1) );
});
}
set(key, value){
this.settings[key] = value;
storage.set("configs", this.settings);
}
get(key, def_val){
if( this.settings[key] !== undefined )
return this.settings[key];
if( def_val !== undefined )
return def_val;
return false;
}
}
