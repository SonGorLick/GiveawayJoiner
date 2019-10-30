'use strict';
const remote = require('electron').remote;
const ipc = require('electron').ipcRenderer;
const shared = remote.getGlobal('sharedData');
const Request = shared.Request;
let Config = shared.Config;
let Lang = shared.Lang;
let GJuser = remote.getGlobal('user');
let Browser = shared.Browser;
let authWindow = shared.authWindow;
let mainWindow = shared.mainWindow;
let intervalTicks = 0;
GJuser.ownapps = '[]';
GJuser.ownsubs = '[]';
GJuser.black = '';
GJuser.ig = '';
GJuser.as = '';
GJuser.op = ',';
GJuser.iglvl = undefined;
$(function () {
setInterval(intervalSchedules, 1000);
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
let menu_switcher = $('.list_type');
if (Config.get('menu_as_list')) {
menu_switcher.addClass('state');
}
authWindow.hide();
mainWindow.show();
if (Config.get('start_minimized')) {
mainWindow.hide();
}
else {
mainWindow.focus();
}
let icons = $('.services-icons');
let maxTop = parseInt(icons.css('top').replace('px', ''));
$('.services_switcher').bind('mousewheel', function (e) {
let scroll = e.originalEvent.wheelDelta / 150 > 0 ? 30 : -30;
let height = icons.height();
let minTop = $(this).height() - height;
let top = parseInt(icons.css('top').replace('px', ''));
let newTop = top + scroll;
if (scroll > 0 && newTop <= maxTop || scroll < 0 && newTop >= minTop) {
top = newTop;
}
icons.css('top', top + 'px');
});
menu_switcher.click(function () {
$(this).toggleClass('state');
icons.css('top', maxTop + 'px');
Config.set('menu_as_list', $(this).hasClass('state'));
});
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
$('.joiner-button.logout').click(function () {
let clicked = $(this).addClass('disabled');
mainWindow.hide();
mainWindow.loadURL(__dirname + '/blank.html');
ipc.send('save-user', null);
mainWindow.close();
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
});
function intervalSchedules() {
if (intervalTicks % 600 === 0) {
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
}
intervalTicks++;
}
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
$('.build .version').text(currentBuild);
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
.html('<div class="fab fa-steam" title="Steam"></div>')
.attr('data-link', 'https://store.steampowered.com/login')
.appendTo(info_links);
$(document.createElement('button'))
.addClass('open-website')
.html('<div class="fa fa-mask" title="User-Agent: /giveawayjoinerdata/user-agent.txt"></div>')
.css('margin-left', '7px')
.attr('data-link', 'https://www.whatsmyua.info')
.appendTo(info_links);
}
function renderUser(userData) {
$('.content-item .info .avatar').css({'background-image': 'url("' + userData.avatar + '")'});
$('.content-item .info .username').html(userData.username);
}
function openWebsite(url) {
Browser.loadURL(url);
Browser.setTitle('GiveawayJoiner - ' + Lang.get('auth.browser_loading'));
Browser.show();
}
