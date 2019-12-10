'use strict';
class OpiumPulses extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.opiumpulses.com';
this.authContent = 'site/logout';
this.authLink = 'https://www.opiumpulses.com/site/login';
this.settings.max_cost = { type: 'number', trans: 'service.max_cost', min: 0, max: 1000, default: this.getConfig('max_cost', 0) };
this.settings.rnd = { type: 'checkbox', trans: 'service.rnd', default: this.getConfig('rnd', false) };
this.settings.sound = { type: 'checkbox', trans: 'service.sound', default: this.getConfig('sound', true) };
this.settings.check_in_steam = { type: 'checkbox', trans: 'service.check_in_steam', default: this.getConfig('check_in_steam', true) };
this.settings.log = { type: 'checkbox', trans: 'service.log', default: this.getConfig('log', true) };
this.settings.blacklist_on = { type: 'checkbox', trans: 'service.blacklist_on', default: this.getConfig('blacklist_on', false) };
this.settings.autostart = { type: 'checkbox', trans: 'service.autostart', default: this.getConfig('autostart', false) };
super.init();
}
getUserInfo(callback) {
if (GJuser.op === '') {
GJuser.op = ',';
if (fs.existsSync(storage.getDataPath().slice(0, -7) + 'opiumpulses.txt')) {
let opdata = fs.readFileSync(storage.getDataPath().slice(0, -7) + 'opiumpulses.txt');
if (opdata.length > 1 && opdata.length < 2000) {
GJuser.op = opdata.toString();
}
}
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
if (_this.getConfig('timer_to', 70) !== _this.getConfig('timer_from', 50)) {
let optimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 70) - _this.getConfig('timer_from', 50))) + _this.getConfig('timer_from', 50));
_this.stimer = optimer;
}
let page = 1;
_this.pagemax = _this.getConfig('pages', 1);
_this.costmax = _this.getConfig('max_cost', 0);
_this.check = 0;
_this.won = _this.getConfig('won', 0);
_this.url = 'https://www.opiumpulses.com';
$.ajax({
url: _this.url + '/arcade',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload').replace(/<source/gi, '<noload'));
let arfound = data.find('.arcade-item-img-btn-wrapper'),
arlnk = arfound.eq(Math.floor(Math.random() * 28)).find('a').attr('href');
if (arlnk !== undefined) {
$.ajax({
url: _this.url + arlnk
});
}
}
});
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
$.ajax({
url: _this.url + '/giveaways?ajax=giveawaylistview&Giveaway_page=' + page,
success: function (data) {
data = $(data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload').replace(/<source/gi, '<noload'));
if (_this.check === 0) {
_this.check = 1;
let opwon = parseInt(data.find('[href="/user/giveawaykeys"] > span').text().trim());
if (opwon > 0 && opwon > _this.won) {
_this.log(_this.logLink(_this.url + '/user/giveawaykeys', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + (opwon - _this.won) + ')'), 'win');
_this.setConfig('won', opwon);
if (_this.getConfig('sound', true)) {
new Audio(__dirname + '/sounds/won.wav').play();
}
}
}
let opfound = data.find('.giveaways-page-item');
let opcurr = 0,
random = Array.from(Array(opfound.length).keys());
if (_this.getConfig('rnd', false)) {
for(let i = random.length - 1; i > 0; i--){
const j = Math.floor(Math.random() * i);
const temp = random[i];
random[i] = random[j];
random[j] = temp;
}
}
function giveawayEnter() {
if (opfound.length < 40) {
_this.pagemax = page;
}
if (opfound.length <= opcurr || !_this.started || _this.curr_value === 0) {
if (opfound.length <= opcurr && page === _this.pagemax) {
setTimeout(function () {
fs.writeFile(storage.getDataPath().slice(0, -7) + 'opiumpulses.txt', GJuser.op, (err) => { });
}, _this.interval());
}
if (_this.getConfig('log', true)) {
if (opfound.length < 40) {
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
let opnext = _this.interval(),
oprnd = random[opcurr],
opway = opfound.eq(oprnd),
link = opway.find('.giveaways-page-item-img-btn-more').attr('href'),
name = opway.find('.giveaways-page-item-footer-name').text().trim(),
entered = opway.find('.giveaways-page-item-img-btn-wrapper').text(),
eLink = opway.find('.giveaways-page-item-img-btn-enter').attr('href'),
cost = parseInt(opway.find('.giveaways-page-item-header-points').text().replace('points', '').trim()),
code = link.slice(11, 16),
njoin = 0;
if (isNaN(cost)) {
cost = 0;
}
if (_this.curr_value < cost) {
njoin = 4;
}
if (_this.costmax < cost && _this.costmax !== 0) {
njoin = 5;
}
if (GJuser.op.includes(',' + code + '-n,')) {
njoin = 1;
}
if (GJuser.op.includes(',' + code + '-s,') && _this.getConfig('check_in_steam', true)) {
njoin = 2;
}
if (GJuser.op.includes(',' + code + '-b,') && _this.getConfig('blacklist_on', false)) {
njoin = 3;
}
if (entered.includes('ENTERED')) {
njoin = 6;
}
if (njoin > 0) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + (oprnd + 1) + '№|' + cost + '$|  ' + _this.logLink(_this.url + link, name), 'chk');
if (njoin === 1) {
_this.log(Lang.get('service.cant_join'), 'cant');
}
if (njoin === 2) {
_this.log(Lang.get('service.have_on_steam'), 'steam');
}
if (njoin === 3) {
_this.log(Lang.get('service.blacklisted'), 'black');
}
if (njoin === 4) {
_this.log(Lang.get('service.points_low'), 'skip');
}
if (njoin === 5) {
_this.log(Lang.get('service.skipped'), 'skip');
}
if (njoin === 6) {
_this.log(Lang.get('service.already_joined'), 'skip');
}
}
opnext = 100;
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
_this.log(Lang.get('service.steam_error'), 'err');
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
opown = 3;
}
if (GJuser.black.includes(opid + ',') && _this.getConfig('blacklist_on', false)) {
opown = 4;
}
if (opown === 1) {
GJuser.op = GJuser.op + code + '-s,';
}
if (opown === 3) {
GJuser.op = GJuser.op + code + '-n,';
}
if (opown === 4) {
GJuser.op = GJuser.op + code + '-b,';
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + (oprnd + 1) + '№|' + cost + '$|' + _this.logLink(opsteam, opid) + '|  ' + _this.logLink(_this.url + link, name) + _this.logBlack(opid), 'chk');
if (opown === 1) {
_this.log(Lang.get('service.have_on_steam'), 'steam');
}
if (opown === 3) {
_this.log(Lang.get('service.cant_join'), 'cant');
}
if (opown === 4) {
_this.log(Lang.get('service.blacklisted'), 'black');
}
}
if (opown === 0) {
let tmout = Math.floor(Math.random() * Math.floor(opnext / 10)) + Math.floor(opnext / 5);
setTimeout(function () {
$.ajax({
url: _this.url + eLink,
success: function () {
_this.curr_value = _this.curr_value - cost;
_this.setValue(_this.curr_value);
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.entered_in') + '|' + page + '#|' + (oprnd + 1) + '№|' + cost + '$|' + _this.logLink(opsteam, opid) + '|  ' + _this.logLink(_this.url + link, name) + _this.logBlack(opid), 'enter');
}
else {
_this.log(Lang.get('service.entered_in') + _this.logLink(_this.url + link, name) + _this.logBlack(opid), 'enter');
}
}
});
}, tmout);
}
else {
opnext = 100;
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
}
