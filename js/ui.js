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
GJuser.ownapps = '[]';
GJuser.ownsubs = '[]';
GJuser.black = '';
GJuser.as = '';
GJuser.op = '';
GJuser.sp = '';
GJuser.tf = '';
GJuser.zp = '';
GJuser.asn = '';
GJuser.opn = '';
GJuser.tfn = '';
GJuser.zpn = '';
GJuser.aschk = '';
GJuser.zpchk = '';
GJuser.iglvl = undefined;
$(function () {
if (!Config.get('steam_local', false)) {
$.ajax({
url: 'https://store.steampowered.com/dynamicstore/userdata/?t=' + Date.now(),
dataType: 'json',
success: function (data) {
if (JSON.stringify(data.rgOwnedApps) !== '[]') {
GJuser.ownapps = (JSON.stringify(data.rgOwnedApps).replace('[', ',')).replace(']', ',');
GJuser.ownsubs = (JSON.stringify(data.rgOwnedPackages).replace('[', ',')).replace(']', ',');
}
},error: () => {}
});
}
reloadLangStrings();
profileSection();
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
$(document).on('click', '.open-website[data-link]', function () {
openWebsite($(this).attr('data-link'));
});
$(document).on('click', '.login[data-link]', function () {
openWebsite($(this).attr('data-link'));
});
$(document).on('click', '.add-blacklist[black]', function () {
if (GJuser.black !== '') {
if (!GJuser.black.includes($(this).attr('black') + ',')) {
GJuser.black = GJuser.black + $(this).attr('black') + ',';
fs.writeFile(dirdata + 'blacklist.txt', GJuser.black, (err) => { });
}
}
});
$(document).on('click', '.rmv-blacklist[black]', function () {
if (GJuser.black !== '') {
if (GJuser.black.includes($(this).attr('black') + ',')) {
GJuser.black = GJuser.black.replace(',' + $(this).attr('black') + ',', ',');
fs.writeFile(dirdata + 'blacklist.txt', GJuser.black, (err) => { });
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
let info_links = $('.content-item .info-links');
$(document.createElement('button'))
.addClass('open-website')
.html('<div class="fab fa-steam" title="' + Lang.get('service.steam_login') + '"></div>')
.attr('data-link', 'https://store.steampowered.com/login')
.appendTo(info_links);
$(document.createElement('button'))
.addClass('open-website')
.html('<div class="fa fa-user-secret" title="' + Lang.get('service.ua_check') + '"></div>')
.css('margin-left', '10px')
.attr('data-link', 'https://www.whatsmyua.info')
.appendTo(info_links);
$(document.createElement('button'))
.addClass('open-website')
.html('<div class="fa fa-ip" title="IP"></div>')
.css('margin-left', '10px')
.attr('data-link', 'https://whatsmyip.com/your-ip-address')
.appendTo(info_links);
}
function renderUser(userData) {
$('.content-item .info .username').html('GiveawayJoiner');
$.ajax({
url: 'https://store.steampowered.com/account',
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
}
});
}
function openWebsite(url) {
Browser.loadURL(url);
Browser.setTitle('GiveawayJoiner - ' + Lang.get('service.browser_loading'));
Browser.show();
}
