'use strict';
class OpiumPulses extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.opiumpulses.com/treasure';
this.authContent = 'site/logout';
this.authLink = 'https://www.opiumpulses.com/site/login';
this.settings.maxcost = { type: 'number', trans: this.transPath('maxcost'), min: 0, max: 1000, default: this.getConfig('maxcost', 0) };
this.settings.free_only = { type: 'checkbox', trans: this.transPath('free_only'), default: this.getConfig('free_only', false) };
this.settings.sound = { type: 'checkbox', trans: 'service.sound', default: this.getConfig('sound', true) };
this.settings.rnd = { type: 'checkbox', trans: 'service.rnd', default: this.getConfig('rnd', false) };
super.init();
}
getUserInfo(callback) {
if (GJuser.op === '') {
GJuser.op = ',';
if (fs.existsSync(storage.getDataPath().slice(0, -7) + 'opiumpulses.txt')) {
let opdata = fs.readFileSync(storage.getDataPath().slice(0, -7) + 'opiumpulses.txt');
if (opdata.length > 1 && opdata.length < 4000) {
GJuser.op = opdata.toString();
}
}
}
let userData = {
avatar: __dirname + '/images/OpiumPulses.png',
username: 'OpiumPulses User',
value: 0
};
$.ajax({
url: 'https://www.opiumpulses.com/user/account',
success: function (html) {
html = $(html.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload'));
userData.username = html.find('.page-header__nav-func-user-wrapper a').text().split('Account')[0].trim();
userData.avatar = 'https://www.opiumpulses.com' + html.find('.input-group noload').attr('src');
userData.value = html.find('.points-items li a').first().text().replace('Points:', '').trim();
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
if (_this.getConfig('timer_to', 90) !== _this.getConfig('timer_from', 70)) {
let optimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 90) - _this.getConfig('timer_from', 70))) + _this.getConfig('timer_from', 70));
_this.stimer = optimer;
}
let page = 1;
_this.pagemax = _this.getConfig('pages', 1);
_this.costmax = _this.getConfig('maxcost', 0);
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
}
enterOnPage(page, callback) {
let _this = this;
let oppage = '&Giveaway_page=' + page;
if (page === 1) {
oppage = '';
}
$.ajax({
url: _this.url + '/giveaways?ajax=giveawaylistview' + oppage,
timeout: 15000,
success: function (data) {
data = data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
if (_this.check === 0) {
_this.check = 1;
let opwon = $(data).find('[href="/user/giveawaykeys"] > span').text().trim();
if (opwon === undefined) {
opwon = 0;
}
else {
opwon = parseInt(opwon);
}
if (opwon > 0 && opwon > _this.won) {
_this.log(_this.logLink(_this.url + '/user/giveawaykeys', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + (opwon - _this.won) + ')'), 'win');
_this.setStatus('win');
_this.setConfig('won', opwon);
if (_this.getConfig('sound', true)) {
new Audio(__dirname + '/sounds/won.wav').play();
}
}
}
let opfound = $(data).find('.giveaways-page-item'),
opcurr = 0,
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
$.ajax({
url: _this.url + '/arcade',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload'));
let arfound = data.find('.arcade-item-img-btn-wrapper'),
arlnk = arfound.eq(Math.floor(Math.random() * 28)).find('a').attr('href');
if (arlnk !== undefined) {
$.ajax({
url: _this.url + arlnk
});
}
}
});
setTimeout(function () {
fs.writeFile(storage.getDataPath().slice(0, -7) + 'opiumpulses.txt', GJuser.op, (err) => { });
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.data_saved'), 'info');
}
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
check = opway.find('.giveaways-page-item-img-btn-wrapper a').attr('onclick'),
eLink = opway.find('.giveaways-page-item-img-btn-enter').attr('href'),
cost = parseInt(opway.find('.giveaways-page-item-header-points').text().replace('points', '').trim()),
code = link.slice(11, 16),
njoin = 0,
opblack = '';
if (isNaN(cost)) {
cost = 0;
}
if (_this.curr_value < cost) {
njoin = 4;
}
if (_this.costmax < cost && _this.costmax !== 0) {
njoin = 5;
}
if (cost !== 0 && _this.getConfig('free_only', false)) {
njoin = 5;
}
if (GJuser.op.includes(',' + code + '-n,')) {
njoin = 1;
}
if (GJuser.op.includes(',' + code + '(s=') && _this.getConfig('check_in_steam', true)) {
opblack = parseInt(GJuser.op.split(',' + code + '(s=')[1].split('),')[0]);
njoin = 2;
}
if (GJuser.op.includes(',' + code + '(b=') && _this.getConfig('blacklist_on', false)) {
opblack = parseInt(GJuser.op.split(',' + code + '(b=')[1].split('),')[0]);
njoin = 3;
}
if (entered.includes('ENTERED')) {
njoin = 6;
}
if (opblack !== '') {
opblack = _this.logBlack(opblack);
}
if (njoin > 0) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + (oprnd + 1) + '№|' + cost + '$|  ' + _this.logLink(_this.url + link, name) + opblack, 'chk');
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
_this.log(Lang.get('service.already_joined'), 'jnd');
}
}
opnext = 100;
}
else {
$.ajax({
url: _this.url + link,
success: function (data) {
data = $(data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload'));
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
if (openter === " You're not eligible to enter") {
GJuser.op = GJuser.op + code + '-n,';
opown = 3;
}
if (_this.getConfig('check_in_steam', true) && opown !== 3) {
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
if (opown === 1) {
GJuser.op = GJuser.op + code + '(s=' + opid + '),';
}
}
if (GJuser.black.includes(opid + ',') && _this.getConfig('blacklist_on', false) && opown !== 3) {
GJuser.op = GJuser.op + code + '(b=' + opid + '),';
opown = 4;
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + (oprnd + 1) + '№|' + cost + '$|  ' + _this.logLink(_this.url + link, name) + _this.logBlack(opid), 'chk');
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
if (check !== undefined) {
check = check.replace('checkUser(', '').replace(')', '');
let opcookie = { url: 'https://www.opiumpulses.com', name: 'checkUser', value: check };
mainWindow.webContents.session.cookies.set(opcookie, (error) => { });
}
$.ajax({
url: _this.url + eLink,
success: function () {
_this.curr_value = _this.curr_value - cost;
_this.setValue(_this.curr_value);
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.entered_in') + '|' + page + '#|' + (oprnd + 1) + '№|' + cost + '$|  ' + _this.logLink(_this.url + link, name), 'enter');
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
