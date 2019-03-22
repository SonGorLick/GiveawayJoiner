'use strict';
class Follx extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://follx.com';
this.authLink = 'https://follx.com/logIn';
this.authContent = '/account';
this.settings.check_in_steam = { type: 'checkbox', trans: this.transPath('check_in_steam'), default: this.getConfig('check_in_steam', true) };
this.settings.sound = { type: 'checkbox', trans: this.transPath('sound'), default: this.getConfig('sound', true) };
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: __dirname + '/images/Follx.png',
username: 'Follx User',
value: 0
};
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
_this.check = 0;
_this.won = this.getConfig('won', 0);
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
let prize_win = parseInt(html.find('.hide-on-med-and-down.user-panel.s6.col > .icons > .marker.cup').text().trim());
if (isNaN(prize_win)) {
prize_win = 0;
}
if ((prize_win - _this.won) < 0) {
this.setConfig('won', prize_win);
}
if (prize_win > 0 && (prize_win - _this.won) > 0) {
_this.log(this.logLink('https://follx.com/giveaways/won', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + (prize_win - _this.won) + ')'));
_this.setConfig('won', prize_win);
if (_this.getConfig('sound', true)) {
new Audio(__dirname + '/sounds/won.wav').play();
}
}
}
let found_games = html.find('.giveaway_card');
let curr_giveaway = 0;
function giveawayEnter() {
if (found_games.length <= curr_giveaway || !_this.started) {
if (callback) {
callback();
}
return;
}
let next_after = _this.interval();
let card = found_games.eq(curr_giveaway),
link = card.find('.head_info a').attr('href'),
name = card.find('.head_info').attr('title'),
have = card.find('.giveaway-indicators > .have').length > 0,
entered = card.find('.entered').length > 0;
if (have || entered) {
next_after = 50;
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
if (_this.getConfig('check_in_steam')) {
if (GJuser.ownapps.includes(',' + fxapp + ',') && fxapp > 0) {
fxown = 1;
}
if (GJuser.ownsubs.includes(',' + fxsub + ',') && fxsub > 0) {
fxown = 1;
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
_this.log(Lang.get('service.entered_in') + _this.logLink(link, name) + ' - ' + _this.logLink(fxstm, fxid));
}
}
});
}
}
});
}
else {
next_after = 50;
}
}
curr_giveaway++;
setTimeout(giveawayEnter, next_after);
}
giveawayEnter();
}
});
}
}
