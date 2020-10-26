'use strict';
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const shared = remote.getGlobal('sharedData');
const rq = shared.rq;
let Config = shared.Config;
let Lang = shared.Lang;
let GJuser = remote.getGlobal('user');
let Browser = shared.Browser;
let mainWindow = shared.mainWindow;
let intervalTicks = 0;
GJuser.own_date = 0;
GJuser.dlc_date = 0;
GJuser.skipdlc_date = 0;
GJuser.card_date = 0;
$(function () {
reloadLangStrings();
$('.content-item .info .data_ajax').html('Ajax IP: ');
$('.content-item .info .data_axios').html('Axios IP: ');
$('.content-item .info .ua').html(Lang.get('service.ua') + '<br>' + mainWindow.webContents.session.getUserAgent());
GJuser.white = loadFile('whitelist');
GJuser.black = loadFile('blacklist');
GJuser.ownapps = loadFile('steam_app');
GJuser.ownsubs = loadFile('steam_sub');
GJuser.dlc = loadFile('steam_dlc');
GJuser.skip_dlc = loadFile('steam_skipdlc');
GJuser.card = loadFile('steam_card');
if (!Config.get('steam_local', false)) {
updateSteam();
}
updateDlc();
updateCard();
setTimeout(() => {
updateSkipdlc();
}, 1000);
profileSection();
lastWin();
let setters = $('.settings .setter').each(function () {
let item = $(this);
switch (item.attr('type')) {
case 'checkbox':
item.prop('checked', Config.get(item.attr('id')));
break;
}
});
mainWindow.show();
if (Config.get('start_minimized')) {
mainWindow.hide();
}
else {
mainWindow.focus();
}
$('.menu li span').click(function () {
let parent = $(this).parent();
$('.menu li, .content-item').removeClass('active');
parent.add('.content-item[data-id="' + parent.attr('data-id') + '"]').addClass('active');
});
$(document).on('click', '.service-panel > ul li', function () {
$('.service-panel > ul li, .in-service-panel').removeClass('active');
$('.in-service-panel[data-id="' + $(this).attr('data-id') + '"]')
.add('.service-panel > ul li[data-id="' + $(this).attr('data-id') + '"]').addClass('active');
});
setters.change(function () {
let changed = $(this);
let value = changed.val();
switch (changed.attr('type')) {
case 'checkbox':
value = changed.prop('checked');
break;
}
if (changed.attr('id') === 'lang') {
ipc.send('change-lang', value);
return;
}
Config.set(changed.attr('id'), value);
});
ipc.on('change-lang', () => {
reloadLangStrings();
});
$(document).on('click', '.update_whitelist', function () {
GJuser.white = loadFile('whitelist');
});
$(document).on('click', '.update_blacklist', function () {
GJuser.black = loadFile('blacklist');
});
$(document).on('click', '.update_steam_own', function () {
if (!Config.get('steam_local', false)) {
updateSteam();
}
else {
GJuser.ownapps = loadFile('steam_app');
GJuser.ownsubs = loadFile('steam_sub');
}
});
$(document).on('click', '.update_steam_dlc', function () {
updateDlc();
});
$(document).on('click', '.update_steam_skipdlc', function () {
updateSkipdlc();
});
$(document).on('click', '.update_steam_card', function () {
updateCard();
});
$(document).on('click', '.update_ip', function () {
let ip = 'https://api.ipify.org?format=json';
$.ajax({
url: ip,
dataType: 'json',
success: function (data) {
$('.content-item .info .data_ajax').html('Ajax IP: ' + data.ip);
}
});
rq({
method: 'GET',
url: ip
})
.then((d) => {
$('.content-item .info .data_axios').html('Axios IP: ' + d.data.ip);
});
});
$(document).on('click', '.open-website[steam_login]', function () {
Browser.loadURL('https://store.steampowered.com/login');
Browser.show();
Browser.once('close', () => {
renderUser(GJuser);
updateSteam();
setTimeout(() => {
updateSkipdlc();
}, 1000);
});
});
$(document).on('click', '.open-website[data-link]', function () {
openWebsite($(this).attr('data-link'));
});
$(document).on('click', '.add-whitelist[white]', function () {
if (GJuser.white !== '') {
if (!GJuser.white.includes($(this).attr('white') + ',')) {
GJuser.white = GJuser.white + $(this).attr('white') + ',';
fs.writeFile(dirdata + 'whitelist.txt', GJuser.white, (err) => { });
$('.content-item .info .data_whitelist').html(Lang.get('service.data_whitelist') + (GJuser.white.replace(/[^,]/g, '').length - 1) + Lang.get('service.data_upd_f') + new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString());
}
}
});
$(document).on('click', '.rmv-whitelist[white]', function () {
if (GJuser.white !== '') {
if (GJuser.white.includes($(this).attr('white') + ',')) {
GJuser.white = GJuser.white.replace(',' + $(this).attr('white') + ',', ',');
fs.writeFile(dirdata + 'whitelist.txt', GJuser.white, (err) => { });
$('.content-item .info .data_whitelist').html(Lang.get('service.data_whitelist') + (GJuser.white.replace(/[^,]/g, '').length - 1) + Lang.get('service.data_upd_f') + new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString());
}
}
});
$(document).on('click', '.add-blacklist[black]', function () {
if (GJuser.black !== '') {
if (!GJuser.black.includes($(this).attr('black') + ',')) {
GJuser.black = GJuser.black + $(this).attr('black') + ',';
fs.writeFile(dirdata + 'blacklist.txt', GJuser.black, (err) => { });
$('.content-item .info .data_blacklist').html(Lang.get('service.data_blacklist') + (GJuser.black.replace(/[^,]/g, '').length - 1) + Lang.get('service.data_upd_f') + new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString());
}
}
});
$(document).on('click', '.rmv-blacklist[black]', function () {
if (GJuser.black !== '') {
if (GJuser.black.includes($(this).attr('black') + ',')) {
GJuser.black = GJuser.black.replace(',' + $(this).attr('black') + ',', ',');
fs.writeFile(dirdata + 'blacklist.txt', GJuser.black, (err) => { });
$('.content-item .info .data_blacklist').html(Lang.get('service.data_blacklist') + (GJuser.black.replace(/[^,]/g, '').length - 1) + Lang.get('service.data_upd_f') + new Date().toLocaleTimeString() + ' ' + new Date().toLocaleDateString());
}
}
});
});
function reloadLangStrings() {
$('[data-lang]').each(function () {
$(this).html(Lang.get($(this).attr('data-lang')));
});
$('[data-lang-title]').each(function () {
$(this).attr('title', Lang.get($(this).attr('data-lang-title')));
});
}
function profileSection() {
renderUser(GJuser);
$('.build .version').text(currentBuild + ' (Electron ' + process.versions.electron + ')');
let lang_select = $('select#lang');
let lang_list = Lang.list();
if (Lang.count() <= 1) {
lang_select.remove();
}
else {
for (let lang in lang_list) {
let option = $(document.createElement('option'))
.attr('id', lang_list[lang].lang_culture)
.val(lang).text('[' + lang_list[lang].lang_culture + '] ' + lang_list[lang].lang_name);
if (Lang.current() === lang) {
option.prop('selected', true);
}
lang_select.append(option);
}
}
$(document.createElement('button'))
.addClass('open-website')
.html('<div class="fab fa-steam" title="' + Lang.get('service.steam_login') + '"></div>')
.attr('steam_login', '')
.appendTo('.content-item .steam_login');
let upd_btn = $('<div class="fa fa-dataupd" title="' + Lang.get('service.update_data') + '"></div>');
let upd_button = '<div class="fa fa-dataupd" title="' + Lang.get('service.update_data') + '"></div>';
$(document.createElement('button'))
.addClass('update_data')
.html(upd_button)
.appendTo('.content-item .update_whitelist');
$(document.createElement('button'))
.addClass('update_data')
.html(upd_button)
.appendTo('.content-item .update_blacklist');
$(document.createElement('button'))
.addClass('update_data')
.html(upd_button)
.appendTo('.content-item .update_steam_own');
$(document.createElement('button'))
.addClass('update_data')
.html(upd_button)
.appendTo('.content-item .update_steam_dlc');
$(document.createElement('button'))
.addClass('update_data')
.html(upd_button)
.appendTo('.content-item .update_steam_skipdlc');
$(document.createElement('button'))
.addClass('update_data')
.html(upd_button)
.appendTo('.content-item .update_steam_card');
$(document.createElement('button'))
.addClass('update_data')
.html(upd_button)
.appendTo('.content-item .update_ip');
}
function renderUser(userData) {
$('.content-item .info .username').html('User');
$('.content-item .info .avatar').css({'background-image': 'url("../app.asar/images/local.png")'});
$.ajax({
url: 'https://store.steampowered.com/account/languagepreferences',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
let name = data.find('.responsive_menu_user_persona > a').text().trim(),
logo = data.find('#global_actions > a > noload').attr('src');
if (logo !== undefined) {
userData.avatar = logo.replace('.jpg', '_full.jpg');
$('.content-item .info .avatar').css({'background-image': 'url("' + userData.avatar + '")'});
}
if (name !== undefined && name.length > 0) {
userData.username = name;
$('.content-item .info .username').html(userData.username);
}
}, error: () => {}
});
}
function lastWin() {
if (fs.existsSync(dirdata + 'win.txt')) {
let rd = fs.readFileSync(dirdata + 'win.txt').toString().split('\n', 10).join().replace(/,/g, '');
$('.content-item .info .last_win').html(Lang.get('service.last_win') + rd);
}
}
function loadFile(lfile) {
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
function updateSteam() {
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
function updateDlc() {
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
function updateSkipdlc() {
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
function updateCard() {
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
function openWebsite(url) {
Browser.loadURL(url);
Browser.setTitle('GiveawayJoiner - ' + Lang.get('service.browser_loading'));
Browser.show();
}
window.minimizeWindow = () => {
if (process.platform !== "darwin") {
remote.getCurrentWindow().hide();
}
else {
remote.BrowserWindow.getFocusedWindow().minimize();
}
};
window.closeWindow = () => {
window.close();
};
