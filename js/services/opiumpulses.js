'use strict';
class OpiumPulses extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.opiumpulses.com/giveaways';
this.authContent = 'site/logout';
this.authLink = 'https://www.opiumpulses.com/site/login';
this.settings.maxcost = { type: 'number', trans: this.transPath('maxcost'), min: 0, max: 1000, default: this.getConfig('maxcost', 0) };
this.settings.free_only = { type: 'checkbox', trans: this.transPath('free_only'), default: this.getConfig('free_only', false) };
this.settings.check_all = { type: 'checkbox', trans: 'service.check_all', default: this.getConfig('check_all', false) };
this.settings.remove_ga = { type: 'checkbox', trans: this.transPath('remove_ga'), default: this.getConfig('remove_ga', false) };
this.settings.sound = { type: 'checkbox', trans: 'service.sound', default: this.getConfig('sound', true) };
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: dirapp + 'images/OpiumPulses.png',
username: 'OpiumPulses User',
value: 0
};
$.ajax({
url: 'https://www.opiumpulses.com/user/account',
success: function (html) {
html = $(html.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload'));
userData.username = html.find('.page-header__nav-func-user-wrapper a').text().split('Account')[0].trim();
userData.avatar = html.find('.input-group noload').attr('src').replace('/uploads/', 'https://www.opiumpulses.com/uploads/');
userData.value = html.find('.points-items li a').first().text().replace('Points:', '').trim();
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
_this.stimer = _this.getConfig('timer_from', 500);
if (_this.getConfig('timer_to', 700) !== _this.getConfig('timer_from', 500)) {
let optimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = optimer;
}
let page = 1;
_this.dsave = ',';
_this.dload = ',';
if (fs.existsSync(dirdata + 'opiumpulses.txt')) {
let opdata = fs.readFileSync(dirdata + 'opiumpulses.txt');
if (opdata.length > 1) {
_this.dload = opdata.toString();
}
}
_this.pagemax = _this.getConfig('pages', 1);
_this.costmax = _this.getConfig('maxcost', 0);
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
let oppage = '?&Giveaway_page=' + page;
if (page === 1) {
oppage = '';
}
$.ajax({
url: _this.url + '/giveaways' + oppage,
success: function (data) {
data = data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
let opfound = $(data).find('.giveaways-page-item');
if (data.indexOf('li class="next"') < 0) {
_this.pagemax = page;
}
if (page === 1) {
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
new Audio(dirapp + 'sounds/won.wav').play();
}
}
}
let opcurr = 0,
opretry = opfound.length;
function giveawayEnter() {
if (_this.doTimer() & _this.totalTicks < 240) {
_this.totalTicks = 0;
}
if (opfound.length < 40 || !_this.started) {
_this.pagemax = page;
}
if (opfound.length <= opcurr || !_this.started) {
if (opfound.length <= opcurr && page === _this.pagemax) {
let arpage = Math.floor(Math.random() * 9) + 1;
$.ajax({
url: _this.url + '/arcade/index?ArcadeGame_page=' + arpage,
success: function (data) {
data = $(data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload'));
let arfound = data.find('.arcade-item-img-btn-wrapper'),
arlnk = arfound.eq(Math.floor(Math.random() * 28)).find('a').attr('href');
if (arlnk !== undefined) {
$.ajax({
url: _this.url + arlnk,
success: function () {
}
});
}
}
});
setTimeout(function () {
fs.writeFile(dirdata + 'opiumpulses.txt', _this.dsave, (err) => { });
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
opway = opfound.eq(opcurr),
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
if (check === undefined) {
check = opway.find('.giveaways-page-item-img').attr('style').split('giveaway/')[1].split('/')[0];
}
if (_this.dload.includes(',' + code + '(d=')) {
opblack = _this.dload.split(',' + code + '(d=')[1].split('),')[0];
if (!_this.dsave.includes(',' + code + '(d=' + opblack + '),')) {
_this.dsave = _this.dsave + code + '(d=' + opblack + '),';
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
}
if (!_this.getConfig('check_all', false)) {
if (opblack !== '') {
if (_this.dload.includes(',' + code + '(n),')) {
if (!_this.dsave.includes(',' + code + '(n),')) {
_this.dsave = _this.dsave + code + '(n),';
}
njoin = 1;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps.includes(',' + opblack.replace('app/', '') + ',')) {
njoin = 2;
}
if (GJuser.ownapps.includes(',' + opblack.replace('sub/', '') + ',')) {
njoin = 2;
}
}
if (GJuser.black.includes(opblack + ',') && _this.getConfig('blacklist_on', false)) {
njoin = 3;
}
}
}
if (entered.includes('ENTERED') && _this.dload.includes(',' + code + '(d=')) {
if (njoin === 2) {
njoin = 7;
}
else if (njoin === 3) {
njoin = 8;
}
else {
njoin = 6;
}
}
if (njoin > 6 && _this.getConfig('remove_ga', false)) {
njoin = 0;
}
if (opblack !== '') {
opblack = _this.logBlack(opblack);
}
let oplog = _this.logLink(_this.url + link, name);
if (_this.getConfig('log', true)) {
oplog = '|' + page + '#|' + (opcurr + 1) + '№|' + cost + '$|  ' + oplog;
}
if (njoin > 0) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + oplog + opblack, 'chk');
switch (njoin) {
case 1:
_this.log(Lang.get('service.cant_join'), 'cant');
_this.log(Lang.get('service.data_have'), 'skip');
break;
case 2:
_this.log(Lang.get('service.have_on_steam'), 'steam');
break;
case 3:
_this.log(Lang.get('service.blacklisted'), 'black');
break;
case 4:
_this.log(Lang.get('service.points_low'), 'skip');
break;
case 5:
_this.log(Lang.get('service.skipped'), 'skip');
break;
case 6:
_this.log(Lang.get('service.already_joined'), 'jnd');
break;
case 7:
_this.log(Lang.get('service.already_joined') + ',' + Lang.get('service.have_on_steam').split('-')[1], 'err');
break;
case 8:
_this.log(Lang.get('service.already_joined') + ',' + Lang.get('service.blacklisted').split('-')[1], 'err');
break;
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
opsteam = data.find('.giveaways-single-sponsored h4 a').attr('href');
}
let openter = data.find('.giveaways-single-promo-content-info-points p').text();
let opown = 0,
opapp = 0,
opsub = 0,
opbun = 0,
opid = '???';
if (opsteam.includes('app/')) {
opapp = parseInt(opsteam.split('app/')[1].split('/')[0].split('?')[0].split('#')[0]);
opid = 'app/' + opapp;
}
if (opsteam.includes('sub/')) {
opsub = parseInt(opsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
opid = 'sub/' + opsub;
}
if (opsteam.includes('bundle/')) {
opbun = parseInt(opsteam.split('bundle/')[1].split('/')[0].split('?')[0].split('#')[0]);
opid = 'bundle/' + opbun;
}
if (!_this.dsave.includes(',' + code + '(d=') && opid !== '???') {
_this.dsave = _this.dsave + code + '(d=' + opid + '),';
}
if (_this.curr_value < cost) {
opown = 5;
}
if (_this.costmax < cost && _this.costmax !== 0) {
opown = 6;
}
if (cost !== 0 && _this.getConfig('free_only', false)) {
opown = 6;
}
if (openter === " You're not eligible to enter") {
if (!_this.dsave.includes(',' + code + '(n),')) {
_this.dsave = _this.dsave + code + '(n),';
}
opown = 3;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' && GJuser.ownsubs === '[]') {
opown = 2;
}
if (GJuser.ownapps.includes(',' + opapp + ',') && opapp > 0) {
opown = 1;
}
if (GJuser.ownsubs.includes(',' + opsub + ',') && opsub > 0) {
opown = 1;
}
}
if (GJuser.black.includes(opid + ',') && _this.getConfig('blacklist_on', false)) {
opown = 4;
}
if (entered.includes('ENTERED')) {
if (opown === 1) {
opown = 8;
}
else if (opown === 4) {
opown = 9;
}
else {
opown = 7;
}
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + oplog + _this.logBlack(opid), 'chk');
switch (opown) {
case 1:
_this.log(Lang.get('service.have_on_steam'), 'steam');
break;
case 2:
_this.log(Lang.get('service.steam_error'), 'err');
break;
case 3:
_this.log(Lang.get('service.cant_join'), 'cant');
break;
case 4:
_this.log(Lang.get('service.blacklisted'), 'black');
break;
case 5:
_this.log(Lang.get('service.points_low'), 'skip');
break;
case 6:
_this.log(Lang.get('service.skipped'), 'skip');
break;
case 7:
_this.log(Lang.get('service.already_joined'), 'jnd');
break;
case 8:
_this.log(Lang.get('service.already_joined') + ',' + Lang.get('service.have_on_steam').split('-')[1], 'err');
break;
case 9:
_this.log(Lang.get('service.already_joined') + ',' + Lang.get('service.blacklisted').split('-')[1], 'err');
break;
}
}
else {
oplog = oplog + _this.logBlack(opid);
}
if (opown === 0) {
let tmout = Math.floor(opnext / 2);
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
_this.log(Lang.get('service.entered_in') + oplog, 'enter');
},
error: function () {
opnext = opnext * 2;
if (opretry > 0) {
opfound.push(opway);
opretry = opretry - 1;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
}
});
}, tmout);
}
else if (opown > 7 && _this.getConfig('remove_ga', false)) {
let pmout = Math.floor(opnext / 2);
setTimeout(function () {
if (check !== undefined) {
let oprcookie = { url: 'https://www.opiumpulses.com', name: 'checkUser', value: check };
mainWindow.webContents.session.cookies.set(oprcookie, (error) => { });
$.ajax({
url: _this.url + '/giveaway/refund/' + check,
success: function () {
_this.curr_value = _this.curr_value + cost;
_this.setValue(_this.curr_value);
_this.log(Lang.get('service.removed') + _this.logLink(_this.url + link, name), 'info');
}, error: () => {}
});
}
}, pmout);
}
else {
opnext = 100;
}
},
error: function () {
opnext = opnext * 2;
if (opretry > 0) {
opfound.push(opway);
opretry = opretry - 1;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
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
