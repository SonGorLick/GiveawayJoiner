'use strict';
class Follx extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://follx.com';
this.authLink = 'https://follx.com/logIn';
this.authContent = '/account';
this.settings.check_in_steam = { type: 'checkbox', trans: this.transPath('check_in_steam'), default: this.getConfig('check_in_steam', true) };
this.settings.sound = { type: 'checkbox', trans: this.transPath('sound'), default: this.getConfig('sound', true) };
this.settings.log = { type: 'checkbox', trans: this.transPath('log'), default: this.getConfig('log', true) };
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: __dirname + '/images/Follx.png',
username: 'Follx User',
value: 0
};
if (GJuser.steamid === '1') {
$.ajax({
url: 'https://follx.com',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
GJuser.steamid = data.find('.common-header .user .expander-content a.username.truncate').attr('href').replace('https://follx.com/users/', '');
}
});
}
$.ajax({
url: 'https://follx.com/users/' + GJuser.steamid,
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
userData.avatar = data.find('.card-cover noload').attr('src');
userData.username = data.find('.username').first().text();
userData.value = data.find('.user .energy span').first().text();
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
let page = 1;
_this.sync = 0;
_this.log(GJuser.black);
if (_this.check === undefined) {
setTimeout(2000);
_this.check = 0;
}
let callback = function () {
page++;
if (page <= _this.getConfig('pages', 1)) {
_this.enterOnPage(page, callback);
}
};
this.enterOnPage(page, callback);
}
enterOnPage(page, callback) {
let _this = this;
let CSRF = '';
$.ajax({
url: 'https://follx.com/giveaways?page=' + page,
success: function (html) {
html = $('<div>' + html.replace(/<img/gi, '<noload') + '</div>');
CSRF = html.find('meta[name="csrf-token"]').attr('content');
if (CSRF.length < 10) {
_this.log(this.trans('token_error'), true);
_this.stopJoiner(true);
return;
}
if (_this.sync === 0) {
_this.sync = 1;
$.ajax({
url: 'https://follx.com/ajax/syncAccount',
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
_this.log(_this.logLink('https://follx.com/giveaways/won', Lang.get('service.win')), true);
if (_this.getConfig('sound', true)) {
new Audio(__dirname + '/sounds/won.wav').play();
}
}
}
let fxfound = html.find('.giveaway_card');
let fxcurr = 0;
function giveawayEnter() {
if (fxfound.length <= fxcurr || !_this.started) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checked') + page);
}
if (callback) {
callback();
}
return;
}
let fxnext = _this.interval();
let card = fxfound.eq(fxcurr),
link = card.find('.head_info a').attr('href'),
name = card.find('.head_info').attr('title'),
entered = card.find('.entered').length > 0;
if (entered) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + page + '#|  ' + _this.logLink(link, name));
_this.log(Lang.get('service.already_joined'));
}
fxnext = 50;
}
else {
let fxsteam = card.find('.head_info').attr('style'),
fxown = 0,
fxapp = 0,
fxsub = 0,
fxid = '???',
fxstm = '';
if (fxsteam.includes('apps/')) {
fxapp = parseInt(fxsteam.split('apps/')[1].split('/')[0].split('?')[0].split('#')[0]);
fxid = 'app/' + fxapp;
fxstm = 'https://store.steampowered.com/app/' + fxapp;
}
if (fxsteam.includes('sub/')) {
fxsub = parseInt(fxsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
fxid = 'sub/' + fxsub;
fxstm = 'https://store.steampowered.com/sub/' + fxsub;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' || GJuser.ownsubs === '[]') {
_this.log(Lang.get('service.steam_error'), true);
fxown = 2;
}
if (GJuser.ownapps.includes(',' + fxapp + ',') && fxapp > 0) {
fxown = 1;
}
if (GJuser.ownsubs.includes(',' + fxsub + ',') && fxsub > 0) {
fxown = 1;
}
}
if (GJuser.black.includes(fxid + ',')) {
fxown = 4;
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + _this.logLink(fxstm, fxid) + '|  ' + _this.logLink(link, name));
if (fxown === 1) {
_this.log(Lang.get('service.have_on_steam'));
}
if (fxown === 4) {
_this.log(Lang.get('service.blacklisted'));
}
}
if (fxown === 0) {
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
_this.log(Lang.get('service.entered_in') + ' |' + page + '#|' + _this.logLink(fxstm, fxid) + '|  ' + _this.logLink(link, name));
}
}
});
}
}
});
}
else {
fxnext = 50;
}
}
fxcurr++;
setTimeout(giveawayEnter, fxnext);
}
giveawayEnter();
}
});
}
}
