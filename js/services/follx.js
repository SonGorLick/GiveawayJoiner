'use strict';
class Follx extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://follx.com';
this.authLink = 'https://follx.com/logIn';
this.authContent = '/account';
this.withValue = true;
this.withLevel = true;
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: dirapp + 'images/Follx.png',
username: 'Follx User',
value: 0,
level: 0
};
$.ajax({
url: 'https://follx.com',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
userData.username = data.find('.common-header .user .expander-content a.username.truncate').text().trim();
userData.value = data.find('.common-header .user .expander-content .energy > span').text().trim();
userData.level = data.find('.icons > span.level').text().slice(0, 11).replace(/[^0-9]/g, '');
userData.avatar = data.find('.common-header .user span.avatar').attr('style').replace("background-image: url('",'').replace("')", '');
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
let fxtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = fxtimer;
let page = 1;
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
let CSRF = '',
data = 'err';
$.ajax({
url: _this.url + '/giveaways?page=' + page,
success: function (datas) {
datas = $('<div>' + datas.replace(/<img/gi, '<noload') + '</div>');
data = datas;
},
complete: function () {
CSRF = data.find('meta[name="csrf-token"]').attr('content');
if (CSRF.length < 10) {
_this.log('CSRF token not found', 'err');
return;
}
if (page === 1) {
$.ajax({
url: _this.url + '/ajax/syncAccount',
method: 'POST',
headers: {
'X-CSRF-TOKEN': CSRF,
'Accept': 'application/json, text/javascript, */*; q=0.01',
'X-Requested-With': 'XMLHttpRequest',
},
dataType: 'json',
error: () => {}
});
let fxwon = data.find('.hide-on-med-and-down.user-panel.s6.col > .icons > .has.marker.cup').attr('href');
if (fxwon !== undefined) {
_this.log(_this.logLink('https://follx.com/giveaways/won', Lang.get('service.win')), 'win');
_this.logWin(' Follx');
_this.setStatus('win');
if (_this.getConfig('sound', true)) {
new Audio(dirapp + 'sounds/won.wav').play();
}
}
}
let fxfound = data.find('.giveaway_card');
let fxcurr = 0,
fxcrr = 0,
fxarray = Array.from(Array(fxfound.length).keys());
if (data === 'err') {
_this.pagemax = page;
_this.log(Lang.get('service.connection_error'), 'err');
}
function giveawayEnter() {
if (fxfound.length < 20 || !_this.started) {
_this.pagemax = page;
}
if (fxarray.length <= fxcurr || !_this.started) {
if (fxfound.length < 20) {
_this.log(Lang.get('service.reach_end'), 'skip');
}
if (page === _this.pagemax) {
_this.log(Lang.get('service.checked') + page + '#-' + _this.getConfig('pages', 1) + '#', 'srch');
}
else {
_this.log(Lang.get('service.checked') + page + '#', 'srch');
}
if (page === _this.pagemax && _this.started) {
if (_this.statusIcon.attr('data-status') !== 'win') {
_this.setStatus('good');
}
}
if (callback) {
callback();
}
return;
}
let fxnext = _this.interval(),
fxcrr = fxarray[fxcurr],
card = fxfound.eq(fxcrr),
link = card.find('.head_info a').attr('href'),
name = card.find('.head_info').attr('title'),
price = card.find('.head_info a .giveaway-icons span.energy').text().trim(),
copies = card.find('.head_info a .giveaway-icons span.copies').text().trim(),
entered = card.find('.entered').length > 0,
fxsteam = card.find('.head_info').attr('style'),
fxown = 0,
fxapp = 0,
fxsub = 0,
fxbun = 0,
fxid = '???';
if (copies === '') {
copies = 1;
}
if (fxsteam.includes('apps/')) {
fxapp = parseInt(fxsteam.split('apps/')[1].split('/')[0].split('?')[0].split('#')[0]);
fxid = 'app/' + fxapp;
}
else if (fxsteam.includes('subs/')) {
fxsub = parseInt(fxsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
fxid = 'sub/' + fxsub;
}
else if (fxsteam.includes('bundles/')) {
fxbun = parseInt(fxsteam.split('bundles/')[1].split('/')[0].split('?')[0].split('#')[0]);
fxid = 'bundle/' + fxbun;
}
if (price > _this.curr_value) {
fxown = 5;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '' && GJuser.ownsubs === '') {
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
let fxlog = _this.logLink(link, name);
if (_this.getConfig('log', true)) {
fxlog = '|' + page + '#|' + (fxcrr + 1) + '№|' + copies + 'x|' + price + '$|  ' + fxlog;
}
else {
fxlog = fxlog + _this.logBlack(fxid);
}
_this.log(Lang.get('service.checking') + fxlog + _this.logBlack(fxid), 'chk');
switch (fxown) {
case 1:
_this.log(Lang.get('service.have_on_steam'), 'steam');
break;
case 2:
_this.log(Lang.get('service.steam_error'), 'err');
break;
case 3:
_this.log(Lang.get('service.already_joined'), 'jnd');
break;
case 4:
_this.log(Lang.get('service.blacklisted'), 'black');
break;
case 5:
_this.log(Lang.get('service.points_low'), 'skip');
break;
}
if (fxown === 0) {
let html = 'err',
njoin = 0;
$.ajax({
url: link,
success: function (htmls) {
htmls = htmls.replace(/<img/gi, '<noload');
html = htmls;
},
complete: function () {
if (html === 'err') {
fxnext = 59000;
if (fxarray.filter(i => i === fxcrr).length === 1) {
fxarray.push(fxcrr);
_this.log(Lang.get('service.err_join'), 'cant');
}
else {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
else {
if (html.indexOf('data-action="enter"') < 0) {
njoin = 1;
}
if (html.indexOf('data-dtext="Вступить в группу"') >= 0) {
njoin = 2;
}
if (html.indexOf('Уже есть') >= 0) {
njoin = 3;
}
switch (njoin) {
case 1:
_this.log(Lang.get('service.err_join'), 'cant');
break;
case 2:
_this.log(Lang.get('service.cant_join'), 'cant');
break;
case 3:
_this.log(Lang.get('service.have_on_steam'), 'steam');
break;
}
if (njoin === 0) {
let body = 'err';
$.ajax({
method: 'POST',
url: link + '/action',
data: 'action=enter',
dataType: 'json',
headers: {
'X-Requested-With': 'XMLHttpRequest',
'X-CSRF-TOKEN': CSRF
},
success: function (bodys) {
body = bodys;
},
complete: function () {
if (body === 'err' || !body.response) {
fxnext = 59000;
if (fxarray.filter(i => i === fxcrr).length === 1) {
fxarray.push(fxcrr);
_this.log(Lang.get('service.err_join'), 'cant');
}
else {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
else {
_this.setValue(data.points);
_this.log(Lang.get('service.entered_in') + fxlog, 'enter');
}
}
});
}
else {
fxnext = 100;
}
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
