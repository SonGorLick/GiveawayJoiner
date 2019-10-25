'use strict';
class Astats extends Joiner {
constructor() {
super();
this.websiteUrl = 'http://astats.astats.nl/astats/TopListGames.php?DisplayType=Giveaway';
this.authContent = 'Log out';
this.authLink = 'http://astats.astats.nl/astats/profile/Login.php';
this.withValue = false;
this.settings.check_in_steam = { type: 'checkbox', trans: this.transPath('check_in_steam'), default: this.getConfig('check_in_steam', true) };
this.settings.log = { type: 'checkbox', trans: this.transPath('log'), default: this.getConfig('log', false) };
super.init();
}
getUserInfo(callback) {
if (GJuser.as === '') {
GJuser.as = '1';
let userData = {
avatar: __dirname + '/images/Astats.png',
username: 'Astats User',
};
$.ajax({
url: 'http://astats.astats.nl/astats/User_Info.php',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
userData.username = data.find('.dropdown-toggle > b').text();
userData.avatar = data.find('.d0 > td:nth-of-type(1) > center > noload').attr('src');
},
complete: function () {
callback(userData);
}
});
}
}
joinService() {
let _this = this;
let page = 1;
_this.url = 'http://astats.astats.nl';
_this.pagemax = _this.getConfig('pages', 1);
if (_this.check === undefined) {
_this.check = 1;
$.ajax({
url: _this.url + '/astats/TopListGames.php?language=english'
});
}
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
let affset = (page - 1) * 200;
$.ajax({
url: _this.url + '/astats/TopListGames.php?&DisplayType=Giveaway&Offset=' + affset + '#',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
let afound = data.find('[style="text-align:right;"]'),
acurr = 0;
function giveawayEnter() {
if (afound.length === 0) {
_this.page.max = page;
}
if (afound.length <= acurr || !_this.started) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checked') + page);
}
if (callback) {
callback();
}
return;
}
let asnext = _this.interval();
let away = afound.eq(acurr);
let alink = away.find('a').attr('href'),
assteam = away.find('a noload').attr('src'),
asown = 0,
asapp = 0,
assub = 0,
asid = '???',
asstm = '';
if (alink !== undefined || assteam !== undefined) {
let ended = data.find('[href="' + alink + '"] > span').text().trim();
if (ended === 'This giveaway has ended.') {
_this.pagemax = page;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.reach_end'));
_this.log(Lang.get('service.checked') + page);
}
if (callback) {
callback();
}
return;
}
let ahave =  data.find('[href="' + alink + '"] font').attr('color'),
aname = data.find('[href="' + alink + '"]').text().trim();
if (assteam.includes('apps/')) {
asapp = parseInt(assteam.split('apps/')[1].split('/')[0].split('?')[0].split('#')[0]);
asid = 'app/' + asapp;
asstm = 'https://store.steampowered.com/app/' + asapp;
}
if (assteam.includes('sub/')) {
assub = parseInt(assteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
asid = 'sub/' + assub;
asstm = 'https://store.steampowered.com/sub/' + assub;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' || GJuser.ownsubs === '[]') {
_this.log(Lang.get('service.steam_error'), true);
asown = 2;
}
if (GJuser.ownapps.includes(',' + asapp + ',') && asapp > 0) {
asown = 1;
}
if (GJuser.ownsubs.includes(',' + assub + ',') && assub > 0) {
asown = 1;
}
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + _this.logLink(asstm, asid) + '|  ' + _this.logLink(_this.url + alink, aname));
if (asown === 1) {
_this.log(Lang.get('service.have_on_steam'));
}
}
if (asown === 0 && ahave === undefined) {
$.ajax({
url: _this.url + alink,
success: function (html) {
html = $(html.replace(/<img/gi, '<noload'));
let ajoin = html.find('.input-group-btn').text().trim();
if (ajoin === 'Add' && _this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'));
}
if (ajoin === 'Join') {
_this.log(Lang.get('service.entered_in') + ' |' + page + '#|' + _this.logLink(asstm, asid) + '|  ' + _this.logLink(_this.url + alink, aname));
$.ajax({
url: _this.url + alink,
method: 'POST',
data: 'Comment=&JoinGiveaway=Join',
success: function () {
}
});
}
}
});
}
else {
asnext = 50;
}
}
acurr++;
setTimeout(giveawayEnter, asnext);
}
giveawayEnter();
}
});
}
}
