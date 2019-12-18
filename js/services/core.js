'use strict';
const storage = require('electron-json-storage');
const fs = require('fs');
class Joiner {
constructor() {
this.intervalVar = undefined;
this.totalTicks = 0;
this.usrUpdTimer = 60;
this.started = false;
this.waitAuth = false;
this.domain = 'google.com';
this.cookies = '';
this.withValue = true;
this.curr_value = 0;
this.getTimeout = 15000;
this.settings = {
timer_from: { type: 'number', trans: 'service.timer_from', min: 5, max: this.getConfig('timer_to', 90), default: this.getConfig('timer_from', 70) },
timer_to: { type: 'number', trans: 'service.timer_to', min: this.getConfig('timer_from', 70), max: 2880, default: this.getConfig('timer_to', 90) },
interval_from: { type: 'number', trans: 'service.interval_from', min: 0, max: this.getConfig('interval_to', 15), default: this.getConfig('interval_from', 10) },
interval_to: { type: 'number', trans: 'service.interval_to', min: this.getConfig('interval_from', 10), max: 60, default: this.getConfig('interval_to', 15) },
pages: { type: 'number', trans: 'service.pages', min: 1, max: 30, default: this.getConfig('pages', 1) },
check_in_steam: { type: 'checkbox', trans: 'service.check_in_steam', default: this.getConfig('check_in_steam', true) },
autostart: { type: 'checkbox', trans: 'service.autostart', default: this.getConfig('autostart', false) },
blacklist_on: { type: 'checkbox', trans: 'service.blacklist_on', default: this.getConfig('blacklist_on', false) },
log: { type: 'checkbox', trans: 'service.log', default: this.getConfig('log', true) }
};
}
init() {
this.addIcon();
this.addPanel();
this.renderSettings();
this.updateCookies();
if (Config.get('autostart') || this.getConfig('autostart')) {
$.ajax({
url: 'https://store.steampowered.com/dynamicstore/userdata/?t=' + Date.now(),
dataType: 'json',
success: function (data) {
if (JSON.stringify(data.rgOwnedApps) !== '[]') {
GJuser.ownsubs = (JSON.stringify(data.rgOwnedPackages).replace('[', ',')).replace(']', ',');
GJuser.ownapps = (JSON.stringify(data.rgOwnedApps).replace('[', ',')).replace(']', ',');
}
}
});
if (fs.existsSync(storage.getDataPath().slice(0, -7) + 'blacklist.txt')) {
let blacklist = fs.readFileSync(storage.getDataPath().slice(0, -7) + 'blacklist.txt');
if (blacklist.length > 0) {
GJuser.black = blacklist.toString();
if (GJuser.black.slice(-1) !== ',') {
GJuser.black = GJuser.black + ',';
}
}
}
this.startJoiner(true);
}
}
addIcon() {
this.icon = $(document.createElement('div'))
.addClass('service-icon')
.appendTo('.services-icons');
$(document.createElement('div')).addClass('bg')
.css({'background-image': "url('images/" + this.constructor.name + ".png')"})
.appendTo(this.icon);
this.statusIcon = $(document.createElement('div'))
.addClass('service-status')
.attr('data-status', 'normal')
.html(
'<span class="fa fa-play"></span>' +
'<span class="fa fa-stop"></span>'
)
.appendTo(this.icon);
$(document.createElement('span'))
.addClass('service-name')
.text(this.constructor.name)
.appendTo(this.icon);
this.icon.on('click', () => {
this.setActive();
});
}
addPanel() {
this.panel = $(document.createElement('div'))
.addClass('service-panel')
.attr('id', this.constructor.name.toLowerCase())
.appendTo('.services-panels');
$('<ul>' +
'<li class="active fa fa-history" data-id="logs" data-lang-title="service.logs">' + '</li>' +
'<li class="active fa fa-wrench" data-id="settings" data-lang-title="service.settings">' + '</li>' +
'</ul>')
.appendTo(this.panel);
this.logWrap = $(document.createElement('div'))
.addClass('service-logs in-service-panel styled-scrollbar active')
.attr('data-id', 'logs')
.appendTo(this.panel);
this.logField = $(document.createElement('div'))
.appendTo(this.logWrap);
$(document.createElement('span'))
.addClass('clear-log')
.html('<div class="fa fa-trash-alt" data-lang-title="service.clear_log"></div>')
.click(() => {
this.clearLog();
})
.appendTo(this.logWrap);
this.settingsPanel = $(document.createElement('div'))
.addClass('service-settings in-service-panel')
.attr('data-id', 'settings')
.appendTo(this.panel);
this.settingsNums = $(document.createElement('div'))
.addClass('settings-numbers').appendTo(this.settingsPanel);
this.settingsChecks = $(document.createElement('div'))
.addClass('settings-checkbox').appendTo(this.settingsPanel);
this.userPanel = $(document.createElement('div'))
.addClass('service-user-panel')
.appendTo(this.panel);
this.userInfo = $(document.createElement('div'))
.addClass('user-info no-selectable')
.html('<div class="avatar"></div>' +
'<span class="username"></span>')
.appendTo(this.userPanel);
if (this.withValue) {
let value = $(document.createElement('span'))
.addClass('value')
.html('<span data-lang="' + Lang.get('service.value_label') + '">' + Lang.get('service.value_label') + '</span>: ')
.appendTo(this.userInfo);
this.value_label = $(document.createElement('span'))
.text(this.curr_value)
.appendTo(value);
}
$(document.createElement('button'))
.addClass('open-website')
.html('<div class="fab fa-chrome" data-lang-title="service.open_website"></div>')
.attr('data-link', this.websiteUrl)
.appendTo(this.userPanel);
this.mainButton = $('<button>' + Lang.get('service.btn_start') + '</button>')
.addClass('joiner-button start-button')
.hover(() => {
this.mainButton.addClass('hovered');
if (this.started) {
this.buttonState(Lang.get('service.btn_stop'));
}
}, () => {
this.mainButton.removeClass('hovered');
if (this.started) {
if (Config.get('timer_view', false)) {
this.buttonState(window.timeToStr(this.doTimer() - this.totalTicks % this.doTimer()));
}
else {
this.buttonState(Lang.get('service.btn_work'));
}
}
})
.click(() => {
if (this.mainButton.hasClass('disabled')) {
return;
}
if (!this.started) {
this.startJoiner();
}
else {
this.stopJoiner();
}
})
.appendTo(this.userPanel);
}
setActive() {
$('.service-icon, .service-panel').removeClass('active');
this.icon.addClass('active');
this.panel.addClass('active');
}
authCheck(callback) {
let authContent = this.authContent;
$.ajax({
url: this.websiteUrl,
timeout: this.getTimeout,
success: function (html) {
html = html.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload').replace(/<source/gi, '<noload');
if (html.indexOf(authContent) >= 0) {
callback(1);
}
else {
callback(0);
}
},
error: function () {
callback(-1);
}
});
}
startJoiner(autostart) {
if (this.started) {
return false;
}
this.buttonState(Lang.get('service.btn_checking'), 'disabled');
this.authCheck((authState) => {
if (authState === 1) {
this.runTimer();
}
else if (authState === -1) {
this.log(Lang.get('service.connection_error'), 'err');
this.buttonState(Lang.get('service.btn_start'));
if (autostart) {
this.setStatus('bad');
}
}
else {
if (autostart) {
this.setStatus('bad');
this.buttonState(Lang.get('service.btn_start'));
this.log(Lang.get('service.cant_start'), 'err');
}
else {
this.buttonState(Lang.get('service.btn_awaiting'), 'disabled');
this.waitAuth = true;
Browser.webContents.on('did-finish-load', () => {
if (this.waitAuth && Browser.getURL().indexOf(this.websiteUrl) >= 0) {
Browser.webContents.executeJavaScript('document.querySelector("body").innerHTML')
.then(body => {
if (body.indexOf(this.authContent) >= 0) {
Browser.close();
this.waitAuth = false;
}
});
}
});
Browser.setTitle('GiveawayJoiner - ' + Lang.get('service.browser_loading'));
Browser.loadURL(this.authLink);
Browser.once('close', () => {
Browser.webContents.removeAllListeners('did-finish-load');
this.waitAuth = false;
this.authCheck((authState) => {
if (authState === 1) {
this.runTimer();
}
else {
this.buttonState(Lang.get('service.btn_start'));
}
});
});
Browser.show();
}
}
});
}
stopJoiner(bad) {
let status = bad ? 'bad' : 'normal';
if (!this.started) {
return false;
}
this.started = false;
this.setStatus(status);
clearInterval(this.intervalVar);
this.log(Lang.get('service.stopped'));
this.buttonState(Lang.get('service.btn_start'));
}
runTimer() {
this.totalTicks = 0;
this.started = true;
let atimer = this.getConfig('timer_from', 50);
this.stimer = atimer;
this.setStatus('good');
this.log(Lang.get('service.started'));
this.updateUserInfo();
if (this.intervalVar) {
clearInterval(this.intervalVar);
}
this.intervalVar = setInterval(() => {
if (!this.started) {
clearInterval(this.intervalVar);
}
if (this.totalTicks % this.doTimer() === 0) {
this.updateUserInfo();
$.ajax({
url: 'https://store.steampowered.com/dynamicstore/userdata/?t=' + Date.now(),
dataType: 'json',
success: function (data) {
if (JSON.stringify(data.rgOwnedApps) !== '[]') {
GJuser.ownsubs = (JSON.stringify(data.rgOwnedPackages).replace('[', ',')).replace(']', ',');
GJuser.ownapps = (JSON.stringify(data.rgOwnedApps).replace('[', ',')).replace(']', ',');
}
}
});
if (fs.existsSync(storage.getDataPath().slice(0, -7) + 'blacklist.txt')) {
let blacklist = fs.readFileSync(storage.getDataPath().slice(0, -7) + 'blacklist.txt');
if (blacklist.length > 0) {
GJuser.black = blacklist.toString();
if (GJuser.black.slice(-1) !== ',') {
GJuser.black = GJuser.black + ',';
}
}
}
this.authCheck((authState) => {
if (authState === 1) {
if (Config.get('log_autoclear', false)) {
this.logField.html('<div></div>');
}
this.log(Lang.get('service.connection_good'), 'srch');
let atimer = this.getConfig('timer_from', 50);
this.stimer = atimer;
this.updateCookies();
this.joinService();
}
else if (authState === 0) {
this.log(Lang.get('service.session_expired'), 'err');
this.stopJoiner(true);
}
else {
this.log(Lang.get('service.connection_lost'), 'err');
this.stimer = 10;
}
});
}
if (!this.mainButton.hasClass('hovered')) {
if (Config.get('timer_view', false)) {
this.buttonState(window.timeToStr(this.doTimer() - this.totalTicks % this.doTimer()));
}
else {
this.buttonState(Lang.get('service.btn_work'));
}
}
this.totalTicks++;
}, 1000);
}
updateUserInfo() {
this.getUserInfo((userData) => {
if (userData.avatar === undefined) {
userData.avatar = __dirname + '/icons/icon.png';
}
if (userData.avatar.includes('electron.asar')) {
userData.avatar = userData.avatar.replace('electron.asar/renderer', 'app.asar');
userData.avatar = userData.avatar.replace('electron.asar', 'app.asar');
}
this.userInfo.find('.avatar').css('background-image', "url('" + userData.avatar + "')");
this.userInfo.find('.username').text(userData.username);
if (this.withValue) {
this.setValue(userData.value);
}
this.userInfo.addClass('visible');
});
}
renderSettings() {
for (let control in this.settings) {
let input = this.settings[control];
switch (input.type) {
case 'number':
case 'float_number':
case 'ten_number':
let step = 1;
if (input.type === 'float_number') {
step = 0.01;
}
if (input.type === 'ten_number') {
step = 10;
}
if (input.default < input.min) {
input.default = input.min;
this.setConfig(control, input.default);
}
else if (input.default > input.max) {
input.default = input.max;
this.setConfig(control, input.default);
}
let numberWrap = $(document.createElement('div'))
.addClass('input-wrap number no-selectable')
.attr('data-control', this.constructor.name.toLowerCase() + '.' + control)
.appendTo(this.settingsNums);
numberWrap.html(
'<div class="button btn-down"><span class="fa fa-minus"></span></div>' +
'<div class="value-label">' + input.default + '</div>' +
'<div class="button btn-up"><span class="fa fa-plus"></span></div>' +
'<div class="label" title="' + Lang.get(input.trans + '_title') + '" data-lang-title="' + input.trans + '_title" data-lang="' + input.trans + '">' + Lang.get(input.trans) + '</div>'
);
let _this = this;
let vLabel = numberWrap.find('.value-label');
let btnUp = numberWrap.find('.btn-up');
let btnDn = numberWrap.find('.btn-down');
if (input.default === input.max) btnUp.addClass('disabled');
if (input.default === input.min) btnDn.addClass('disabled');
let pressTimeout = undefined;
let iterations = 0;
let up = function () {
let val = parseFloat(vLabel.text());
if (val < input.max) {
val = val + step;
btnDn.removeClass('disabled');
}
if (input.type === 'float_number') {
val = parseFloat(val.toFixed(2));
}
if (val === input.max) {
btnUp.addClass('disabled');
}
vLabel.text(val);
_this.setConfig(control, val);
switch (control) {
case 'min_level':
_this.settings.max_level.min = val;
_this.reinitNumber('max_level');
break;
case 'max_level':
_this.settings.min_level.max = val;
_this.reinitNumber('min_level');
break;
case 'min_cost':
_this.settings.max_cost.min = val;
_this.reinitNumber('max_cost');
break;
case 'max_cost':
_this.settings.min_cost.max = val;
_this.reinitNumber('min_cost');
break;
case 'interval_from':
_this.settings.interval_to.min = val;
_this.reinitNumber('interval_to');
break;
case 'interval_to':
_this.settings.interval_from.max = val;
_this.reinitNumber('interval_from');
break;
case 'timer_from':
_this.settings.timer_to.min = val;
_this.reinitNumber('timer_to');
break;
case 'timer_to':
_this.settings.timer_from.max = val;
_this.reinitNumber('timer_from');
break;
}
};
let dn = function () {
let val = parseFloat(vLabel.text());
if (val > input.min) {
val = val - step;
btnUp.removeClass('disabled');
}
if (input.type === 'float_number') {
val = parseFloat(val.toFixed(2));
}
if (val === input.min) {
btnDn.addClass('disabled');
}
vLabel.text(val);
_this.setConfig(control, val);
switch (control) {
case 'min_level':
_this.settings.max_level.min = val;
_this.reinitNumber('max_level');
break;
case 'max_level':
_this.settings.min_level.max = val;
_this.reinitNumber('min_level');
break;
case 'min_cost':
_this.settings.max_cost.min = val;
_this.reinitNumber('max_cost');
break;
case 'max_cost':
_this.settings.min_cost.max = val;
_this.reinitNumber('min_cost');
break;
case 'interval_from':
_this.settings.interval_to.min = val;
_this.reinitNumber('interval_to');
break;
case 'interval_to':
_this.settings.interval_from.max = val;
_this.reinitNumber('interval_from');
break;
case 'timer_from':
_this.settings.timer_to.min = val;
_this.reinitNumber('timer_to');
break;
case 'timer_to':
_this.settings.timer_from.max = val;
_this.reinitNumber('timer_from');
break;
}
};
btnUp.on('mousedown', () =>{
let func = function () {
iterations++;
up();
if (iterations > 10 ? iterations = 10: iterations)
pressTimeout = setTimeout(func, 420 / iterations);
};
func();
})
.on('mouseup mouseleave', () => {
iterations = 0;
clearTimeout(pressTimeout);
});
btnDn.on('mousedown', () => {
let func = function () {
iterations++;
dn();
if (iterations > 10 ? iterations = 10: iterations)
pressTimeout = setTimeout(func, 420 / iterations);
};
func();
})
.on('mouseup mouseleave', () => {
iterations = 0;
clearTimeout(pressTimeout);
});
break;
case 'checkbox':
let checkboxWrap = $(document.createElement('div'))
.addClass('input-wrap checkbox no-selectable')
.appendTo(this.settingsChecks);
checkboxWrap.html(
'<label title="' + input.trans + '_title' + '" data-lang-title="' + input.trans + '_title">' +
'<input type="checkbox"/>' +
'<span data-lang="' + input.trans + '">' +
Lang.get(input.trans) +
'</span>' +
'</label>'
);
let checkbox = checkboxWrap.find('input').prop('checked', input.default);
checkbox.change(() => {
this.setConfig(control, checkbox.prop('checked'));
});
break;
}
}
}
reinitNumber(control) {
let wrap = $('[data-control="' + this.constructor.name.toLowerCase() + '.' + control + '"]'),
val = parseInt(wrap.find('.value-label').text());
wrap.find('.button').removeClass('disabled');
if (val <= this.settings[control].min) {
wrap.find('.btn-down').addClass('disabled');
}
if (val >= this.settings[control].max) {
wrap.find('.btn-up').addClass('disabled');
}
}
logLink(address, anchor) {
return '<span class="open-website" data-link="' + address + '">' + anchor + '</span>';
}
logBlack(steamappid) {
if (!GJuser.black.includes(steamappid + ',')) {
return '<span class="add-to-blacklist" black="' + steamappid + '" title="' + Lang.get('service.add_tbl') + '">  [+]</span>';
}
else {
return '<span class="add-to-blacklist" black="' + steamappid + '" title="' + Lang.get('service.rmv_tbl') + '">  [-]</span>';
}
}
updateCookies() {
mainWindow.webContents.session.cookies.get({domain: this.domain})
.then((cookies) => {
let newCookies = '';
for (let one in cookies) {
if (newCookies.length !== 0) {
newCookies += '; ';
}
newCookies += cookies[one].name + '=' + cookies[one].value;
}
this.cookies = newCookies;
});
}
interval() {
let min = this.getConfig('interval_from', this.settings.interval_from.default);
let max = this.getConfig('interval_to', this.settings.interval_to.default) + 1;
return (Math.floor(Math.random() * (max - min)) + min) * 1000;
}
doTimer() {
return this.stimer * 60;
}
setStatus(status) {
this.statusIcon.attr('data-status', status);
}
buttonState(text, className) {
this.mainButton.removeClass('disabled').text(text);
if (className) {
this.mainButton.addClass(className);
}
}
setValue(new_value) {
if (this.withValue) {
this.value_label.text(new_value);
this.curr_value = parseInt(new_value);
}
}
getConfig(key, def) {
if (def === undefined) {
def = this.settings[key].default;
}
return Config.get(this.constructor.name.toLowerCase() + '_' + key, def);
}
setConfig(key, val) {
return Config.set(this.constructor.name.toLowerCase() + '_' + key, val);
}
transPath(key) {
return ('service.' + this.constructor.name.toLowerCase() + '.' + key);
}
trans(key) {
return Lang.get('service.' + this.constructor.name.toLowerCase() + '.' + key);
}
clearLog() {
this.logField.html('<div><span class="time">' + timeStr() + '</span>' + Lang.get('service.log_cleared') + '</div>');
}
log(text, logType) {
if (logType === '' || logType === undefined) {
logType = 'normal';
}
this.logField.append('<div class="' + logType + '"><span class="time">' + timeStr() + '</span>' + text + '</div>');
if (Config.get('autoscroll')) {
this.logWrap.scrollTop(this.logWrap[0].scrollHeight);
}
}
joinService() {}
getUserInfo(callback) {
callback({
avatar: __dirname + '/icons/icon.png',
username: 'GJ User',
value: 0
});
}
}
