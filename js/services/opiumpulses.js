'use strict';
class OpiumPulses extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.opiumpulses.com';
this.authContent = 'site/logout';
this.authLink = 'https://www.opiumpulses.com/site/login';
this.settings.arcade = { type: 'checkbox', trans: this.transPath('arcade'), default: this.getConfig('arcade', false) };
this.settings.check_in_steam = { type: 'checkbox', trans: this.transPath('check_in_steam'), default: this.getConfig('check_in_steam', true) };
this.settings.blacklist_on = { type: 'checkbox', trans: this.transPath('blacklist_on'), default: this.getConfig('blacklist_on', false) };
this.settings.sound = { type: 'checkbox', trans: this.transPath('sound'), default: this.getConfig('sound', true) };
this.settings.log = { type: 'checkbox', trans: this.transPath('log'), default: this.getConfig('log', true) };
super.init();
}
getUserInfo(callback) {
if (GJuser.op.length > 601) {
GJuser.op = ',';
}
let userData = {
avatar: __dirname + '/images/OpiumPulses.png',
username: 'OP User',
value: 0
};
$.ajax({
url: 'https://www.opiumpulses.com/user/account',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload').replace(/<source/gi, '<noload'));
userData.username = data.find('.page-header__nav-func-user-wrapper a').text().split('Account')[0].trim();
userData.avatar = 'https://www.opiumpulses.com' + data.find('.input-group noload').attr('src');
userData.value = data.find('.points-items li a').first().text().replace('Points:', '').trim();
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
let page = 1,
arpg = 1;
_this.pagemax = _this.getConfig('pages', 1);
_this.pgarc = 2;
_this.check = 0;
_this.won = _this.getConfig('won', 0);
_this.url = 'https://www.opiumpulses.com';
let callback = function () {
page++;
if (page <= _this.pagemax) {
_this.enterOnPage(page, callback);
}
};
this.enterOnPage(page, callback);
if (_this.getConfig('arcade', false)) {
let arcade = function () {
arpg++;
if (arpg <= _this.pgarc) {
_this.pgarc++;
_this.enterOnArcade(arpg, arcade);
}
};
this.enterOnArcade(arpg, arcade);
}
}
enterOnPage(page, callback) {
let _this = this;
$.ajax({
url: _this.url + '/giveaways?ajax=giveawaylistview&Giveaway_page=' + page,
success: function (data) {
data = $(data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload').replace(/<source/gi, '<noload'));
if (_this.check === 0) {
_this.check = 1;
let opwon = parseInt(data.find('[href="/user/giveawaykeys"] > span').text().trim());
if (opwon > 0 && opwon > _this.won) {
_this.log(_this.logLink(_this.url + '/user/giveawaykeys', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + (opwon - _this.won) + ')'), true);
_this.setConfig('won', opwon);
if (_this.getConfig('sound', true)) {
new Audio(__dirname + '/sounds/won.wav').play();
}
}
}
let opfound = data.find('.giveaways-page-item');
let opcurr = 0;
function giveawayEnter() {
if (opfound.length < 40) {
_this.pagemax = page;
}
if (opfound.length <= opcurr || !_this.started || _this.curr_value === 0) {
if (_this.getConfig('log', true)) {
if (opfound.length < 40) {
_this.log(Lang.get('service.reach_end'));
}
_this.log(Lang.get('service.checked') + page);
}
if (callback) {
callback();
}
return;
}
let opnext = _this.interval();
let opway = opfound.eq(opcurr),
link = opway.find('.giveaways-page-item-img-btn-more').attr('href'),
name = opway.find('.giveaways-page-item-footer-name').text().trim(),
entered = opway.find('.giveaways-page-item-img-btn-wrapper').text(),
eLink = opway.find('.giveaways-page-item-img-btn-enter').attr('href'),
cost = parseInt(opway.find('.giveaways-page-item-header-points').text().replace('points', '').trim()),
code = (link.slice(11, 16)),
njoin = 0;
if (isNaN(cost)) {
cost = 0;
}
if (GJuser.op.includes(',' + code + ',')) {
njoin = 1;
}
if (_this.curr_value < cost || entered.includes('ENTERED') || njoin === 1) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + cost + 'P|  ' + _this.logLink(_this.url + link, name));
if (njoin === 1) {
_this.log(Lang.get('service.cant_join'));
}
if (entered.includes('ENTERED')) {
_this.log(Lang.get('service.already_joined'));
}
if (_this.curr_value < cost && !entered.includes('ENTERED')) {
_this.log(Lang.get('service.points_low'));
}
}
opnext = 50;
}
else {
$.ajax({
url: _this.url + link,
success: function (data) {
data = $(data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload').replace(/<source/gi, '<noload'));
let opsteam = data.find('.giveaways-single-sponsored h1 a').attr('href');
if (opsteam === undefined) {
opsteam = $(data).find('.giveaways-single-sponsored h4 a').attr('href');
}
let openter = data.find('.giveaways-single-promo-content-info-points p').text();
let opown = 0,
opapp = 0,
opsub = 0,
opid = '???';
if (opsteam.includes('app/')) {
opapp = parseInt(opsteam.split('app/')[1].split('/')[0].split('?')[0].split('#')[0]);
opid = 'app/' + opapp;
}
if (opsteam.includes('sub/')) {
opsub = parseInt(opsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
opid = 'sub/' + opsub;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' || GJuser.ownsubs === '[]') {
_this.log(Lang.get('service.steam_error'), true);
opown = 2;
}
if (GJuser.ownapps.includes(',' + opapp + ',') && opapp > 0) {
opown = 1;
}
if (GJuser.ownsubs.includes(',' + opsub + ',') && opsub > 0) {
opown = 1;
}
}
if (openter === " You're not eligible to enter") {
GJuser.op = GJuser.op + code + ',';
opown = 3;
}
if (GJuser.black.includes(opid + ',') && _this.getConfig('blacklist_on', false)) {
opown = 4;
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + ' |' + page + '#|' + cost + 'P|'+ _this.logLink(opsteam, opid) + '|  ' + _this.logLink(_this.url + link, name));
if (opown === 3) {
_this.log(Lang.get('service.cant_join'));
}
if (opown === 1) {
_this.log(Lang.get('service.have_on_steam'));
}
if (opown === 4) {
_this.log(Lang.get('service.blacklisted'));
}
}
if (opown === 0) {
let pmout = (Math.floor(Math.random() * 1000)) + 1000;
setTimeout(function () {
}, pmout);
$.ajax({
url: _this.url + eLink,
success: function () {
_this.curr_value = _this.curr_value - cost;
_this.setValue(_this.curr_value);
_this.log(Lang.get('service.entered_in') + ' |' + page + '#|' + cost + 'P|'+ _this.logLink(opsteam, opid) + '|  ' + _this.logLink(_this.url + link, name));
}
});
}
else {
opnext = 50;
}
}
});
}
opcurr++;
setTimeout(giveawayEnter, opnext);
}
giveawayEnter();
}
});
}
enterOnArcade(arpg, arcade) {
let _this = this;
$.ajax({
url: _this.url + '/arcade/index?ArcadeGame_page=' + arpg,
success: function (data) {
data = $(data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload').replace(/<source/gi, '<noload'));
let arfound = data.find('.arcade-item-img-btn-wrapper');
let arcurr = 0;
function giveawayArcade() {
if (arfound.length < 28) {
_this.pgarc = arpg;
}
if (arfound.length <= arcurr || !_this.started) {
if (arcade) {
arcade();
}
return;
}
let arway = arfound.eq(arcurr),
arlnk = arway.find('a').attr('href');
if (arlnk !== undefined) {
$.ajax({
url: _this.url + arlnk
});
}
arcurr++;
setTimeout(giveawayArcade, 1000);
}
giveawayArcade();
}
});
}
}
