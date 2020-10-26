'use strict';
const storage = require('electron').remote.require('electron-json-storage');
const fs = require('electron').remote.require('fs');
const dirapp = (__dirname).replace('electron.asar/renderer', 'app.asar') + '/';
const dirdata = storage.getDataPath() + '/';
class Joiner {
constructor() {
this.intervalVar = undefined;
this.totalTicks = 0;
this.usrUpdTimer = 60;
this.started = false;
this.waitAuth = false;
this.cookies = '';
this.withValue = false;
this.withLevel = false;
this.curr_value = 0;
this.curr_level = 0;
this.tries = 0;
this.dsave = ',';
this.dload = ',';
this.dcheck = '';
this.auto = false;
this.card = false;
this.dlc = false;
this.getTimeout = 19000;
this.domain = 'google.com';
this.auth = Lang.get('service.login') + this.constructor.name;
this.ua = mainWindow.webContents.session.getUserAgent();
this.settings = {
timer_from: { type: 'number', trans: 'service.timer_from', min: 5, max: this.getConfig('timer_to', 700), default: this.getConfig('timer_from', 500) },
timer_to: { type: 'number', trans: 'service.timer_to', min: this.getConfig('timer_from', 500), max: 2880, default: this.getConfig('timer_to', 700) },
interval_from: { type: 'number', trans: 'service.interval_from', min: 5, max: this.getConfig('interval_to', 15), default: this.getConfig('interval_from', 10) },
interval_to: { type: 'number', trans: 'service.interval_to', min: this.getConfig('interval_from', 10), max: 60, default: this.getConfig('interval_to', 15) },
pages: { type: 'number', trans: 'service.pages', min: 1, max: 50, default: this.getConfig('pages', 1) },
autostart: { type: 'checkbox', trans: 'service.autostart', default: this.getConfig('autostart', false) },
log: { type: 'checkbox', trans: 'service.log', default: this.getConfig('log', true) },
check_in_steam: { type: 'checkbox', trans: 'service.check_in_steam', default: this.getConfig('check_in_steam', true) },
sound: { type: 'checkbox', trans: 'service.sound', default: this.getConfig('sound', true) },
log_autoclear: { type: 'checkbox', trans: 'service.log_autoclear', default: this.getConfig('log_autoclear', false) },
blacklist_on: { type: 'checkbox', trans: 'service.blacklist_on', default: this.getConfig('blacklist_on', false) }
};
}
init() {
this.addIcon();
this.addPanel();
this.renderSettings();
this.updateCookies();
if (!Config.get('autostart_off', false) && this.getConfig('autostart', false)) {
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
'<span class="fa fa-play"></span>'
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
if (this.withLevel) {
let level = $(document.createElement('span'))
.addClass('level')
.html('<span data-lang="' + Lang.get('service.level_label') + '">' + Lang.get('service.level_label') + '</span>: ')
.appendTo(this.userInfo);
this.level_label = $(document.createElement('span'))
.text(this.curr_level)
.appendTo(level);
}
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
.html('<div class="fab fa-chrome" data-lang-title="' + Lang.get('service.open_website') + this.constructor.name + ' (' + this.websiteUrl + ')"></div>')
.attr('data-link', this.websiteUrl)
.appendTo(this.userPanel);
$(document.createElement('button'))
.addClass('open-website')
.html('<div class="fa fa-user-circle" data-lang-title="' + this.auth + '"></div>')
.css('margin-right', '-40px')
.attr('data-link', this.authLink)
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
this.tries = 0;
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
let authContent = this.authContent,
html = 'err';
$.ajax({
url: this.websiteUrl,
timeout: this.getTimeout,
success: function (htmls) {
htmls = htmls.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
html = htmls;
},
complete: function () {
if (html === 'err') {
callback(-1);
}
else if (html.indexOf(authContent) >= 0) {
callback(1);
}
else {
callback(0);
}
}
});
}
startJoiner(autostart) {
if (this.started) {
return false;
}
if (autostart) {
this.auto = true;
}
this.buttonState(Lang.get('service.btn_checking'), 'disabled');
this.authCheck((authState) => {
if (authState !== 0) {
this.runTimer();
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
this.runTimer();
});
if (!autostart) {
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
this.updateCookies();
this.totalTicks = 0;
this.started = true;
this.stimer = 1440;
this.setStatus('good');
this.log(Lang.get('service.started'));
if (this.auto) {
this.totalTicks = 86395;
this.auto = false;
}
if (this.intervalVar) {
clearInterval(this.intervalVar);
}
this.intervalVar = setInterval(() => {
if (!this.started) {
clearInterval(this.intervalVar);
}
if (this.totalTicks % this.doTimer() === 0) {
this.totalTicks = 1;
this.updateCookies();
GJuser.white = this.loadFile('whitelist');
GJuser.black = this.loadFile('blacklist');
if (Config.get('steam_local', false) && GJuser.own_date < Date.now()) {
GJuser.ownapps = this.loadFile('steam_app');
GJuser.ownsubs = this.loadFile('steam_sub');
} 
else if (!Config.get('steam_local', false) && GJuser.own_date < Date.now()) {
this.updateSteam();
}
if (this.dlc && GJuser.dlc_date !== (new Date()).getDate()) {
this.updateDlc();
}
if (this.card && GJuser.card_date !== (new Date()).getDate()) {
this.updateCard();
}
if (this.dlc && GJuser.skipdlc_date !== (new Date()).getDate()) {
this.updateSkipdlc();
}
this.authCheck((authState) => {
if (authState === 1) {
this.setStatus('work');
this.tries = 0;
this.updateUserInfo();
if (this.getConfig('log_autoclear', false)) {
this.logField.html('<div></div>');
}
this.log(Lang.get('service.connection_good'), 'srch');
this.joinService();
}
else if (authState === 0) {
if (this.tries < 3) {
this.setStatus('net');
this.tries++;
this.log('[' + this.tries + '] ' + Lang.get('service.connection_lost').replace('10', '5'), 'err');
this.stimer = 5;
}
else {
this.tries = 0;
this.log(Lang.get('service.session_expired'), 'err');
this.stopJoiner(true);
}
}
else {
if (this.tries < 8) {
this.setStatus('net');
this.tries++;
this.log('[' + this.tries + '] ' + Lang.get('service.connection_lost').replace('0', '5'), 'err');
this.stimer = 15;
}
else {
this.tries = 0;
this.log(Lang.get('connection_error'), 'err');
this.stopJoiner(true);
}
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
this.userInfo.find('.avatar').css('background-image', "url('" + userData.avatar + "')");
this.userInfo.find('.username').text(userData.username);
if (this.withValue) {
this.setValue(userData.value);
}
if (this.withLevel) {
this.setLevel(userData.level);
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
case 'intervalfrom':
_this.settings.intervalto.min = val;
_this.reinitNumber('intervalto');
break;
case 'intervalto':
_this.settings.intervalfrom.max = val;
_this.reinitNumber('intervalfrom');
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
case 'intervalfrom':
_this.settings.intervalto.min = val;
_this.reinitNumber('intervalto');
break;
case 'intervalto':
_this.settings.intervalfrom.max = val;
_this.reinitNumber('intervalfrom');
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
btnUp.on('mousedown', () => {
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
let addblack = '<span class="add-blacklist" black="' + steamappid + '" title="' + Lang.get('service.add_tbl') + ' (' + steamappid + ')">  [+]</span>',
rmvblack ='<span class="rmv-blacklist" black="' + steamappid + '" title="' + Lang.get('service.rmv_tbl') + ' (' + steamappid + ')">[-]</span>';
return addblack + rmvblack;
}
logWhite(steamappid) {
let addwhite = '<span class="add-whitelist" white="' + steamappid + '" title="' + Lang.get('service.add_twl') + ' (' + steamappid + ')">  [+]</span>',
rmvwhite ='<span class="rmv-whitelist" white="' + steamappid + '" title="' + Lang.get('service.rmv_twl') + ' (' + steamappid + ')">[-]</span>';
return addwhite + rmvwhite;
}
logWin(win) {
win = '<br>' + new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString() + win + '\n';
if (fs.existsSync(dirdata + 'win.txt')) {
let rd = fs.readFileSync(dirdata + 'win.txt');
if (rd.length < 5000) {
win = win + rd;
}
fs.writeFile(dirdata + 'win.txt', win, (err) => { });
this.lastWin();
}
else {
fs.writeFile(dirdata + 'win.txt', win, (err) => { });
this.lastWin();
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
setLevel(new_level) {
if (this.withLevel) {
this.level_label.text(new_level);
this.curr_level = parseInt(new_level);
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
if (this.getConfig('log', true) || logType === 'normal' || logType === 'err' || logType === 'enter' || logType === 'win') {
this.logField.append('<div class="' + logType + '"><span class="time">' + timeStr() + '</span>' + text + '</div>');
if (Config.get('autoscroll')) {
this.logWrap.scrollTop(this.logWrap[0].scrollHeight);
}
}
}
lastWin() {
if (fs.existsSync(dirdata + 'win.txt')) {
let rd = fs.readFileSync(dirdata + 'win.txt').toString().split('\n', 10).join().replace(/,/g, '');
$('.content-item .info .last_win').html(Lang.get('service.last_win') + rd);
}
}
loadFile(lfile) {
if (fs.existsSync(dirdata + lfile + '.txt')) {
let lread = fs.readFileSync(dirdata + lfile + '.txt');
if (lread.length > 0) {
lread = lread.toString();
if (lread.slice(-1) !== ',') {
lread = lread + ',';
}
if (lread[0] !== ',') {
lread = ',' + lread;
}
}
$('.content-item .info .data_' + lfile).html(Lang.get('service.data_' + lfile) + (lread.replace(/[^,]/g, '').length - 1) + Lang.get('service.data_file') + new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString());
return lread;
}
else {
$('.content-item .info .data_' + lfile).html(Lang.get('service.data_' + lfile) + ' ' + Lang.get('service.file_not_found') + ' /giveawayjoinerdata/' + lfile + '.txt');
return '';
}
}
updateSteam() {
$.ajax({
url: 'https://store.steampowered.com/dynamicstore/userdata/?t=' + Date.now(),
dataType: 'json',
success: function (data) {
if (JSON.stringify(data.rgOwnedApps) !== '[]') {
GJuser.ownapps = (JSON.stringify(data.rgOwnedApps).replace('[', ',')).replace(']', ',');
GJuser.ownsubs = (JSON.stringify(data.rgOwnedPackages).replace('[', ',')).replace(']', ',');
fs.writeFile(dirdata + 'steam_app.txt', GJuser.ownapps, (err) => { });
fs.writeFile(dirdata + 'steam_sub.txt', GJuser.ownsubs, (err) => { });
$('.content-item .info .data_steam_app').html(Lang.get('service.data_steam_app') + (GJuser.ownapps.replace(/[^,]/g, '').length - 1) + Lang.get('service.data_upd_n') + new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString());
$('.content-item .info .data_steam_sub').html(Lang.get('service.data_steam_sub') + (GJuser.ownsubs.replace(/[^,]/g, '').length - 1) + Lang.get('service.data_upd_n') + new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString());
GJuser.own_date = Date.now() + 10000;
}
else if (GJuser.ownapps === '' && GJuser.ownsubs === '') {
$('.content-item .info .data_steam_app').html(Lang.get('service.data_steam_app') + ' ' + Lang.get('service.steam_error'));
$('.content-item .info .data_steam_sub').html(Lang.get('service.data_steam_sub') + ' ' + Lang.get('service.steam_error'));
}
},error: () => {}
});
}
updateDlc() {
$.ajax({
url: 'https://bartervg.com/browse/dlc/json/',
dataType: 'json',
success: function (data) {
if (Object.keys(data).length > 7000) {
GJuser.dlc = JSON.stringify(Object.keys(data)).replace(/"/g, '').replace('[', ',').replace(']', ',');
fs.writeFile(dirdata + 'steam_dlc.txt', GJuser.dlc, (err) => { });
$('.content-item .info .data_steam_dlc').html(Lang.get('service.data_steam_dlc') + (GJuser.dlc.replace(/[^,]/g, '').length - 1) + Lang.get('service.data_upd_n') + new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString());
GJuser.dlc_date = (new Date()).getDate();
}
}
});
}
updateSkipdlc() {
if (GJuser.ownapps !== '') {
$.ajax({
url: 'https://bartervg.com/browse/dlc/json/',
dataType: 'json',
success: function (data) {
if (Object.keys(data).length > 7000) {
let skip_dlc = ',';
Object.keys(data).forEach((i) => {
if (!GJuser.ownapps.includes(',' + JSON.stringify(data[i].base_appID).replace(/"/g, '') + ',')) {
skip_dlc = skip_dlc + JSON.stringify(i).replace(/"/g, '') + ',';
}
});
if (skip_dlc !== ',') {
fs.writeFile(dirdata + 'steam_skipdlc.txt', skip_dlc, (err) => { });
GJuser.skip_dlc = skip_dlc;
$('.content-item .info .data_steam_skipdlc').html(Lang.get('service.data_steam_skipdlc') + (GJuser.skip_dlc.replace(/[^,]/g, '').length - 1) + Lang.get('service.data_upd_n') + new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString());
GJuser.skipdlc_date = (new Date()).getDate();
}
}
}
});
}
else {
$('.content-item .info .data_steam_skipdlc').html(Lang.get('service.data_steam_skipdlc') + ' ' + Lang.get('service.steam_error'));
}
}
updateCard() {
$.ajax({
url: 'https://bartervg.com/browse/cards/json/',
dataType: 'json',
success: function (data) {
if (Object.keys(data).length > 7000) {
GJuser.card = JSON.stringify(Object.keys(data)).replace(/"/g, '').replace('[', ',').replace(']', ',');
fs.writeFile(dirdata + 'steam_card.txt', GJuser.card, (err) => { });
$('.content-item .info .data_steam_card').html(Lang.get('service.data_steam_card') + (GJuser.card.replace(/[^,]/g, '').length - 1) + Lang.get('service.data_upd_n') + new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString());
GJuser.card_date = (new Date()).getDate();
}
},error: () => {}
});
}
joinService() {}
getUserInfo(callback) {
callback({
avatar: dirapp + 'images/' + this.constructor.name + '.png',
username: this.constructor.name + ' User',
value: 0,
level: 0
});
}
}
