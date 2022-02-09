'use strict';
class OpiumPulses extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.opiumpulses.com/giveaways';
this.website = 'https://www.opiumpulses.com';
this.authContent = 'site/logout';
this.authLink = 'https://www.opiumpulses.com/site/login';
this.withValue = true;
this.card = true;
this.dlc = true;
this.settings.maxcost = { type: 'number', trans: this.transPath('maxcost'), min: 0, max: 1000, default: this.getConfig('maxcost', 0) };
this.settings.card_only = { type: 'checkbox', trans: 'service.card_only', default: this.getConfig('card_only', false) };
this.settings.skip_dlc = { type: 'checkbox', trans: 'service.skip_dlc', default: this.getConfig('skip_dlc', false) };
this.settings.check_all = { type: 'checkbox', trans: 'service.check_all', default: this.getConfig('check_all', false) };
this.settings.whitelist_nocards = { type: 'checkbox', trans: 'service.whitelist_nocards', default: this.getConfig('whitelist_nocards', false) };
this.settings.skip_skipdlc = { type: 'checkbox', trans: 'service.skip_skipdlc', default: this.getConfig('skip_skipdlc', false) };
this.settings.remove_ga = { type: 'checkbox', trans: this.transPath('remove_ga'), default: this.getConfig('remove_ga', false) };
this.settings.free_only = { type: 'checkbox', trans: 'service.free_only', default: this.getConfig('free_only', false) };
this.settings.ignore_free = { type: 'checkbox', trans: this.transPath('ignore_free'), default: this.getConfig('ignore_free', false) };
this.settings.skip_origin = { type: 'checkbox', trans: this.transPath('skip_origin'), default: this.getConfig('skip_origin', false) };
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: '../app.asar/images/OpiumPulses.png',
username: 'OpiumPulses User',
value: 0
};
$.ajax({
url: 'https://www.opiumpulses.com/user/account',
success: function (html) {
html = $(html.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload'));
let username = html.find('.page-header__nav-func-user-wrapper a').text(),
avatar = html.find('.input-group noload').attr('src'),
value = html.find('.points-items li a').first().text();
if (value !== undefined && value.includes('Points:')) {
userData.value = value.replace('Points:', '').trim();
}
if (username !== undefined && username !== '') {
userData.username = username.split('Account')[0].trim();
}
if (avatar !== undefined) {
userData.avatar = avatar.replace('/uploads/', 'https://www.opiumpulses.com/uploads/');
}
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
let optimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = optimer;
let page = 1;
_this.dsave = ',';
_this.dload = ',';
_this.wait = false;
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
let oppage = '?&Giveaway_page=' + page,
data = 'err';
if (page === 1) {
oppage = '';
}
$.ajax({
url: _this.url + '/giveaways' + oppage,
success: function (datas) {
datas = datas.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
data = datas;
},
complete: function () {
let opfound = $(data).find('.giveaways-page-item');
if (data.indexOf('li class="next"') === -1) {
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
_this.logWin(' OpiumPulses - ' + (opwon - _this.won));
_this.setStatus('win');
_this.setConfig('won', opwon);
if (_this.getConfig('sound', true)) {
new Audio('../app.asar/sounds/won.wav').play();
}
}
}
let opcurr = 0,
opcrr = 0,
oparray = Array.from(Array(opfound.length).keys());
if (data === 'err') {
_this.pagemax = page;
_this.log(Lang.get('service.connection_error'), 'err');
}
function giveawayEnter() {
if (_this.doTimer() - _this.totalTicks < 240) {
_this.totalTicks = 1;
}
if (opfound.length < 40 || !_this.started) {
_this.pagemax = page;
}
if (oparray.length <= opcurr || !_this.started) {
if (opfound.length <= opcurr && page === _this.pagemax) {
let opdtnow = new Date();
opdtnow.setDate(opdtnow.getUTCDate());
opdtnow.setHours(opdtnow.getUTCHours() + 7);
let opdnow = opdtnow.getDate();
if (opdnow !== _this.dcheck) {
let arpage = Math.floor(Math.random() * 9) + 1,
arc = 'err';
$.ajax({
url: _this.url + '/arcade/index?ArcadeGame_page=' + arpage,
success: function (arcs) {
arcs = $(arcs.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload'));
arc = arcs;
},
complete: function () {
if (arc !== 'err') {
let arfound = arc.find('.arcade-item-img-btn-wrapper'),
arlnk = arfound.eq(Math.floor(Math.random() * 28)).find('a').attr('href');
if (arlnk !== undefined) {
$.ajax({
url: _this.url + arlnk,
success: function () {
let opdtnew = new Date();
opdtnew.setDate(opdtnew.getUTCDate());
opdtnew.setHours(opdtnew.getUTCHours() + 7);
_this.dcheck = opdtnew.getDate();
_this.log(Lang.get('service.done') + 'Play Game - ' + arlnk.split('/')[3].replace(/-/g, ' '), 'info');
}, error: () => {}
});
}
}
}
});
}
setTimeout(() => {
fs.writeFile(dirdata + 'opiumpulses.txt', _this.dsave, (err) => { });
_this.log(Lang.get('service.data_saved'), 'info');
}, _this.interval());
}
if (opfound.length < 40) {
_this.log(Lang.get('service.reach_end'), 'skip');
}
if (page === _this.pagemax) {
_this.log(Lang.get('service.checked') + page + '#-' + _this.getConfig('pages', 1) + '#', 'srch');
}
else {
_this.log(Lang.get('service.checked') + page + '#', 'srch');
}
if (page === _this.pagemax && _this.started) {
setTimeout(() => {
if (_this.statusIcon.attr('data-status') === 'work') {
_this.setStatus('good');
}
}, _this.interval());
}
if (callback) {
callback();
}
return;
}
let opnext = _this.interval(),
opcrr = oparray[opcurr],
opway = opfound.eq(opcrr),
link = opway.find('.giveaways-page-item-img-btn-more').attr('href'),
name = opway.find('.giveaways-page-item-footer-name').text().trim(),
store = opway.find('.giveaways-page-item-footer noload').attr('src'),
type = opway.find('.giveaways-page-item-footer noload noload').attr('src'),
entered = opway.find('.giveaways-page-item-img-btn-wrapper').text(),
check = opway.find('.giveaways-page-item-img-btn-wrapper a').attr('onclick'),
eLink = opway.find('.giveaways-page-item-img-btn-enter').attr('href'),
cost = parseInt(opway.find('.giveaways-page-item-header-points').text().replace('points', '').trim()),
code = link.slice(11, 16),
njoin = 0,
opstore = 'steam',
optype ='?|',
opblack = '';
if (store !== undefined && store.includes('-icon-origin-')) {
opstore = 'origin';
opblack = opstore;
if (!_this.dload.includes(',' + code + '(d=' + opblack + '),')) {
_this.dload = _this.dload + code + '(d=' + opblack + '),';
}
if (!_this.dsave.includes(',' + code + '(d=' + opblack + '),')) {
_this.dsave = _this.dsave + code + '(d=' + opblack + '),';
}
}
if (type !== undefined) {
if (type.includes('everyone')) {
optype = 'E|';
}
else if (type.includes('veterans')) {
optype = 'V|';
}
else if (type.includes('newbies')) {
optype = 'N|';
}
else if (type.includes('customers')) {
optype = 'C|';
}
else if (type.includes('underdogs')) {
optype = 'U|';
}
type = ' (for_' + type.split('/')[7].replace('-r.png', '') + ')';
}
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
if (cost !== 0 || !_this.getConfig('ignore_free', false)) {
if (
(_this.getConfig('skip_dlc', false) && GJuser.dlc.includes(',' + opblack.replace('app/', '') + ',') && !_this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_dlc', false) && GJuser.dlc.includes(',' + opblack.replace('app/', '') + ',') && !GJuser.white.includes(opblack + ',') && _this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_skipdlc', false) && GJuser.skip_dlc.includes(',' + opblack.replace('app/', '') + ',') && !_this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_skipdlc', false) && GJuser.skip_dlc.includes(',' + opblack.replace('app/', '') + ',') && !GJuser.white.includes(opblack + ',') && _this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('card_only', false) && !GJuser.card.includes(',' + opblack.replace('app/', '') + ',') && !_this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('card_only', false) && !GJuser.card.includes(',' + opblack.replace('app/', '') + ',') && !GJuser.white.includes(opblack + ',') && _this.getConfig('whitelist_nocards', false))
)
{
njoin = 5;
}
}
if (_this.getConfig('check_in_steam', true) && opstore === 'steam') {
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
if (_this.getConfig('skip_origin', false) && opstore === 'origin') {
njoin = 5;
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
let oplog = _this.logLink(_this.url + link, name),
oplg = '|' + page + '#|' + (opcrr + 1) + '№|' + optype + cost + '$|  ';
if (opblack !== '') {
if (GJuser.skip_dlc.includes(',' + opblack.replace('app/', '') + ',')) {
oplog = '⊟ ' + oplog;
}
else if (GJuser.dlc.includes(',' + opblack.replace('app/', '') + ',')) {
oplog = '⊞ ' + oplog;
}
if (GJuser.card.includes(',' + opblack.replace('app/', '') + ',')) {
oplog = '♦ ' + oplog;
}
if (opstore === 'steam') {
opblack = _this.logWhite(opblack) + _this.logBlack(opblack);
}
else {
opblack = '';
}
}
if (_this.getConfig('log', true)) {
oplog = oplg + oplog;
}
if (_this.wait) {
njoin = -1;
}
else {
_this.log(Lang.get('service.checking') + oplog + opblack, 'chk');
}
if (njoin > 0) {
switch (njoin) {
case 1:
_this.log(Lang.get('service.cant_join') + ', ' + Lang.get('service.data_have'), 'cant');
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
_this.log(Lang.get('service.already_joined') + ',' + Lang.get('service.have_on_steam').split('-')[1], 'cant');
break;
case 8:
_this.log(Lang.get('service.already_joined') + ',' + Lang.get('service.blacklisted').split('-')[1], 'cant');
break;
}
opnext = 100;
opcurr++;
}
else if (njoin === 0) {
_this.wait = true;
let html = 'err';
$.ajax({
url: _this.url + link,
success: function (htmls) {
htmls = $(htmls.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload'));
html = htmls;
},
complete: function () {
if (html === 'err') {
opnext = 59000;
if (oparray.filter(i => i === opcrr).length === 1) {
oparray.push(opcrr);
_this.log(Lang.get('service.err_join'), 'cant');
opcurr++;
_this.wait = false;
}
else {
_this.log(Lang.get('service.connection_error'), 'err');
opcurr++;
_this.wait = false;
}
}
else {
let opsteam = html.find('.giveaways-single-sponsored h1 a').attr('href');
if (opsteam === undefined) {
opsteam = html.find('.giveaways-single-sponsored h4 a').attr('href');
}
if (opsteam !== undefined && !opsteam.includes('app/') && !opsteam.includes('sub/') && !opsteam.includes('bundle/')) {
opsteam = html.find('.giveaways-single-sponsored-content-descr noload').first().attr('src');
if (opsteam !== undefined) {
if (opsteam.includes('/apps/')) {
opsteam = opsteam.replace('/apps/', '/app/');
}
else if (opsteam.includes('/subs/')) {
opsteam = opsteam.replace('/subs/', '/sub/');
}
else if (opsteam.includes('/bundles/')) {
opsteam = opsteam.replace('/bundles/', '/bundle/');
}
}
else {
opsteam = '';
}
}
let openter = html.find('.giveaways-single-promo-content-info-points p').text();
let opown = 0,
opapp = 0,
opsub = 0,
opbun = 0,
opid = '???';
if (opstore === 'origin') {
opid = opstore;
}
if (opsteam !== undefined && opstore === 'steam') {
if (opsteam.includes('app/')) {
opapp = parseInt(opsteam.split('app/')[1].split('/')[0].split('?')[0].split('#')[0]);
opid = 'app/' + opapp;
}
else if (opsteam.includes('sub/')) {
opsub = parseInt(opsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
opid = 'sub/' + opsub;
}
else if (opsteam.includes('bundle/')) {
opbun = parseInt(opsteam.split('bundle/')[1].split('/')[0].split('?')[0].split('#')[0]);
opid = 'bundle/' + opbun;
}
}
if (!_this.dsave.includes(',' + code + '(d=')) {
_this.dsave = _this.dsave + code + '(d=' + opid + '),';
}
if (_this.curr_value < cost) {
opown = 5;
}
if (
(_this.costmax < cost && _this.costmax !== 0) ||
(cost !== 0 && _this.getConfig('free_only', false))
)
{
opown = 6;
}
if (cost !== 0 || !_this.getConfig('ignore_free', false)) {
if (
(_this.getConfig('skip_dlc', false) && GJuser.dlc.includes(',' + opapp + ',') && !_this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_dlc', false) && GJuser.dlc.includes(',' + opapp + ',') && !GJuser.white.includes(opid + ',') && _this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_skipdlc', false) && GJuser.skip_dlc.includes(',' + opapp + ',') && !_this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_skipdlc', false) && GJuser.skip_dlc.includes(',' + opapp + ',') && !GJuser.white.includes(opid + ',') && _this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('card_only', false) && !GJuser.card.includes(',' + opapp + ',') && !_this.getConfig('whitelist_nocards', false) && opid !== '???') ||
(_this.getConfig('card_only', false) && !GJuser.card.includes(',' + opapp + ',') && !GJuser.white.includes(opid + ',') && _this.getConfig('whitelist_nocards', false) && opid !== '???')
)
{
opown = 6;
}
}
if (openter === " You're not eligible to enter") {
if (!_this.dsave.includes(',' + code + '(n),')) {
_this.dsave = _this.dsave + code + '(n),';
}
opown = 3;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '' && GJuser.ownsubs === '') {
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
if (_this.getConfig('skip_origin', false) && opstore === 'origin') {
opown = 6;
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
oplog = _this.logLink(_this.url + link, name);
if (opstore === 'steam') {
opblack = _this.logWhite(opid) + _this.logBlack(opid);
}
else {
opblack = '';
}
if (GJuser.skip_dlc.includes(',' + opapp + ',')) {
oplog = '⊟ ' + oplog;
}
else if (GJuser.dlc.includes(',' + opapp + ',')) {
oplog = '⊞ ' + oplog;
}
if (GJuser.card.includes(',' + opapp + ',')) {
oplog = '♦ ' + oplog;
}
if (_this.getConfig('log', true)) {
oplog = oplg + oplog;
}
else {
oplog = oplog + opblack;
}
_this.unlog();
_this.log(Lang.get('service.checking') + oplog + opblack, 'chk');
if (opown > 0 && (opown < 8 || !_this.getConfig('remove_ga', false))) {
switch (opown) {
case 1:
_this.log(Lang.get('service.have_on_steam'), 'steam');
break;
case 2:
_this.log(Lang.get('service.steam_error'), 'err');
break;
case 3:
_this.log(Lang.get('service.cant_join') + type, 'cant');
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
_this.log(Lang.get('service.already_joined') + ',' + Lang.get('service.have_on_steam').split('-')[1], 'cant');
break;
case 9:
_this.log(Lang.get('service.already_joined') + ',' + Lang.get('service.blacklisted').split('-')[1], 'cant');
break;
}
opcurr++;
_this.wait = false;
}
else if (opown === 0) {
let tmout = Math.floor(opnext / 2);
setTimeout(() => {
if (check !== undefined) {
check = check.replace('checkUser(', '').replace(')', '');
let opcookie = { url: 'https://www.opiumpulses.com', name: 'checkUser', value: check };
mainWindow.webContents.session.cookies.set(opcookie, (error) => { });
}
let resp = 'err';
$.ajax({
url: _this.url + eLink,
success: function () {
resp = 'ok';
},
complete: function () {
if (resp === 'err') {
opnext = 59000;
if (oparray.filter(i => i === opcrr).length === 1) {
oparray.push(opcrr);
_this.log(Lang.get('service.err_join'), 'cant');
opcurr++;
_this.wait = false;
}
else {
_this.log(Lang.get('service.connection_error'), 'err');
opcurr++;
_this.wait = false;
}
}
else {
_this.curr_value = _this.curr_value - cost;
_this.setValue(_this.curr_value);
_this.log(Lang.get('service.entered_in') + oplog, 'enter');
opcurr++;
_this.wait = false;
}
}
});
}, tmout);
}
else if (opown > 7 && _this.getConfig('remove_ga', false)) {
switch (opown) {
case 8:
_this.log(Lang.get('service.already_joined') + ',' + Lang.get('service.have_on_steam').split('-')[1], 'cant');
break;
case 9:
_this.log(Lang.get('service.already_joined') + ',' + Lang.get('service.blacklisted').split('-')[1], 'cant');
break;
}
let pmout = Math.floor(opnext / 2);
setTimeout(() => {
if (check !== undefined) {
let oprcookie = { url: 'https://www.opiumpulses.com', name: 'checkUser', value: check };
mainWindow.webContents.session.cookies.set(oprcookie, (error) => { });
let respr = 'err';
$.ajax({
url: _this.url + '/giveaway/refund/' + check,
success: function () {
respr = 'ok';
},
complete: function () {
if (respr === 'err') {
_this.log(Lang.get('service.connection_error'), 'err');
opcurr++;
_this.wait = false;
}
else {
_this.curr_value = _this.curr_value + cost;
_this.setValue(_this.curr_value);
_this.log(Lang.get('service.removed') + _this.logLink(_this.url + link, name), 'info');
opcurr++;
_this.wait = false;
}
}
});
}
}, pmout);
}
}
}
});
}
setTimeout(giveawayEnter, opnext);
}
giveawayEnter();
}
});
}
}
