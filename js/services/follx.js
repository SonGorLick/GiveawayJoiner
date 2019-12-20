'use strict';
class Follx extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://follx.com';
this.authLink = 'https://follx.com/logIn';
this.authContent = '/account';
this.settings.timer_from = { type: 'number', trans: 'service.timer_from', min: 5, max: this.getConfig('timer_to', 700), default: this.getConfig('timer_from', 500) };
this.settings.timer_to = { type: 'number', trans: 'service.timer_to', min: this.getConfig('timer_from', 500), max: 2880, default: this.getConfig('timer_to', 700) };
this.settings.sound = { type: 'checkbox', trans: 'service.sound', default: this.getConfig('sound', true) };
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: __dirname + '/images/Follx.png',
username: 'Follx User',
value: 0
};
$.ajax({
url: 'https://follx.com',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
userData.username = data.find('.common-header .user .expander-content a.username.truncate').text().trim();
userData.value = data.find('.common-header .user .expander-content .energy > span').text().trim();
userData.avatar = data.find('.common-header .user span.avatar').attr('style').replace("background-image: url('",'').replace("')", '');
GJuser.steamid = data.find('.common-header .user .expander-content a.username.truncate').attr('href').replace('https://follx.com/users/', '');
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
if (_this.getConfig('timer_to', 700) !== _this.getConfig('timer_from', 500)) {
let fxtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = fxtimer;
}
let page = 1;
_this.sync = 0;
_this.url = 'https://follx.com';
_this.pagemax = _this.getConfig('pages', 1);
let callback = function () {
page++;
if (page <= _this.pagemax) {
_this.enterOnPage(page, callback);
}
};
this.enterOnPage(page, callback);
}
enterOnPage(page, callback) {
let _this = this;
let CSRF = '';
$.ajax({
url: _this.url + '/giveaways?page=' + page,
success: function (html) {
html = $('<div>' + html.replace(/<img/gi, '<noload') + '</div>');
CSRF = html.find('meta[name="csrf-token"]').attr('content');
if (CSRF.length < 10) {
_this.log(this.trans('token_error'), 'err');
_this.stopJoiner(true);
return;
}
if (_this.sync === 0) {
_this.sync = 1;
$.ajax({
url: _this.url + '/ajax/syncAccount',
method: 'POST',
headers: {
'X-CSRF-TOKEN': CSRF,
'Accept-Language': 'ru-RU,ru;q=0.9,en-US;q=0.8,en;q=0.7',
'Accept': 'application/json, text/javascript, */*; q=0.01',
'X-Requested-With': 'XMLHttpRequest',
},
dataType: 'json'
});
}
if (_this.check === 0) {
_this.check = 1;
let fxwon = html.find('.hide-on-med-and-down.user-panel.s6.col > .icons > .has.marker.cup').attr('href');
if (fxwon !== undefined) {
_this.log(_this.logLink('https://follx.com/giveaways/won', Lang.get('service.win')), 'win');
_this.setStatus('win');
if (_this.getConfig('sound', true)) {
new Audio(__dirname + '/sounds/won.wav').play();
}
}
}
let fxfound = html.find('.giveaway_card');
let fxcurr = 0;
function giveawayEnter() {
if (fxfound.length < 20) {
_this.pagemax = page;
}
if (fxfound.length <= fxcurr || !_this.started) {
if (_this.getConfig('log', true)) {
if (fxfound.length < 20) {
_this.log(Lang.get('service.reach_end'), 'skip');
}
if (page === _this.pagemax) {
_this.log(Lang.get('service.checked') + page + '#-' + _this.getConfig('pages', 1) + '#', 'srch');
}
else {
_this.log(Lang.get('service.checked') + page + '#', 'srch');
}
}
if (callback) {
callback();
}
return;
}
let fxnext = _this.interval(),
card = fxfound.eq(fxcurr),
link = card.find('.head_info a').attr('href'),
name = card.find('.head_info').attr('title'),
entered = card.find('.entered').length > 0,
fxsteam = card.find('.head_info').attr('style'),
fxown = 0,
fxapp = 0,
fxsub = 0,
fxid = '???';
if (fxsteam.includes('apps/')) {
fxapp = parseInt(fxsteam.split('apps/')[1].split('/')[0].split('?')[0].split('#')[0]);
fxid = 'app/' + fxapp;
}
if (fxsteam.includes('sub/')) {
fxsub = parseInt(fxsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
fxid = 'sub/' + fxsub;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' || GJuser.ownsubs === '[]') {
_this.log(Lang.get('service.steam_error'), 'err');
fxown = 2;
}
if (GJuser.ownapps.includes(',' + fxapp + ',') && fxapp > 0) {
fxown = 1;
}
if (GJuser.ownsubs.includes(',' + fxsub + ',') && fxsub > 0) {
fxown = 1;
}
}
if (GJuser.black.includes(fxid + ',') && _this.getConfig('blacklist_on', false)) {
fxown = 4;
}
if (entered) {
fxown = 3;
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + (fxcurr + 1) + '№|  ' + _this.logLink(link, name) + _this.logBlack(fxid), 'chk');
if (fxown === 1) {
_this.log(Lang.get('service.have_on_steam'), 'steam');
}
if (fxown === 3) {
_this.log(Lang.get('service.already_joined'), 'skip');
}
if (fxown === 4) {
_this.log(Lang.get('service.blacklisted'), 'black');
}
}
if (fxown === 0) {
let fxcrr = fxcurr + 1;
$.ajax({
url: link,
success: function (html) {
html = html.replace(/<img/gi, '<noload');
if (html.indexOf('data-action="enter"') > 0) {
$.ajax({
method: 'POST',
url: link + '/action',
data: 'action=enter',
dataType: 'json',
headers: {
'X-Requested-With': 'XMLHttpRequest',
'X-CSRF-TOKEN': CSRF
},
success: function (data) {
if (data.response) {
_this.setValue(data.points);
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.entered_in') + '|' + page + '#|' + fxcrr + '№|  ' + _this.logLink(link, name) + _this.logBlack(fxid), 'enter');
}
else {
_this.log(Lang.get('service.entered_in') + _this.logLink(link, name) + _this.logBlack(fxid), 'enter');
}
}
}
});
}
}
});
}
else {
fxnext = 100;
}
fxcurr++;
setTimeout(giveawayEnter, fxnext);
}
giveawayEnter();
}
});
}
}
