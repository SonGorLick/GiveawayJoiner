'use strict';
class IndieGala extends Joiner {
constructor() {
super();
this.domain = 'indiegala.com';
this.authContent = 'Your account';
this.websiteUrl = 'https://www.indiegala.com';
this.website = this.websiteUrl;
this.authLink = 'https://www.indiegala.com/login';
this.withValue = true;
this.withLevel = true;
this.card = true;
this.dlc = true;
this.settings.timer_from = { type: 'number', trans: 'service.timer_from', min: 5, max: this.getConfig('timer_to', 90), default: this.getConfig('timer_from', 70) };
this.settings.timer_to = { type: 'number', trans: 'service.timer_to', min: this.getConfig('timer_from', 70), max: 2880, default: this.getConfig('timer_to', 90) };
this.settings.ending = { type: 'number', trans: this.transPath('ending'), min: 0, max: 720, default: this.getConfig('ending', 0) };
this.settings.join_qty = { type: 'number', trans: this.transPath('join_qty'), min: 1, max: 100, default: this.getConfig('join_qty', 1) };
this.settings.min_entries = { type: 'ten_number', trans: 'service.min_entries', min: 0, max: 10000, default: this.getConfig('min_entries', 0) };
this.settings.min_level = { type: 'number', trans: 'service.min_level', min: 0, max: this.getConfig('max_level', 0), default: this.getConfig('min_level', 0) };
this.settings.max_level = { type: 'number', trans: 'service.max_level', min: this.getConfig('min_level', 0), max: 8, default: this.getConfig('max_level', 0) };
this.settings.min_cost = { type: 'number', trans: 'service.min_cost', min: 0, max: this.getConfig('max_cost', 0), default: this.getConfig('min_cost', 0) };
this.settings.max_cost = { type: 'number', trans: 'service.max_cost', min: this.getConfig('min_cost', 0), max: 240, default: this.getConfig('max_cost', 0) };
this.settings.points_reserve = { type: 'number', trans: 'service.points_reserve', min: 0, max: 500, default: this.getConfig('points_reserve', 0) };
this.settings.sort_by_level = { type: 'checkbox', trans: this.transPath('sort_by_level'), default: this.getConfig('sort_by_level', false) };
this.settings.sort_by_price = { type: 'checkbox', trans: 'service.sort_by_price', default: this.getConfig('sort_by_price', false) };
this.settings.multi_join = { type: 'checkbox', trans: this.transPath('multi_join'), default: this.getConfig('multi_join', false) };
this.settings.ending_first = { type: 'checkbox', trans: this.transPath('ending_first'), default: this.getConfig('ending_first', false) };
this.settings.sort_by_entries = { type: 'checkbox', trans: 'service.sort_by_entries', default: this.getConfig('sort_by_entries', false) };
this.settings.reserve_no_multi = { type: 'checkbox', trans: this.transPath('reserve_no_multi'), default: this.getConfig('reserve_no_multi', false) };
this.settings.sbl_ending_ig = { type: 'checkbox', trans: this.transPath('sbl_ending_ig'), default: this.getConfig('sbl_ending_ig', false) };
this.settings.skip_ost = { type: 'checkbox', trans: 'service.skip_ost', default: this.getConfig('skip_ost', false) };
this.settings.reserve_on_sbl = { type: 'checkbox', trans: this.transPath('reserve_on_sbl'), default: this.getConfig('reserve_on_sbl', false) };
this.settings.card_only = { type: 'checkbox', trans: 'service.card_only', default: this.getConfig('card_only', false) };
this.settings.skip_dlc = { type: 'checkbox', trans: 'service.skip_dlc', default: this.getConfig('skip_dlc', false) };
this.settings.reserve_for_smpl = { type: 'checkbox', trans: this.transPath('reserve_for_smpl'), default: this.getConfig('reserve_for_smpl', false) };
this.settings.whitelist_only = { type: 'checkbox', trans: 'service.whitelist_only', default: this.getConfig('whitelist_only', false) };
this.settings.skip_skipdlc = { type: 'checkbox', trans: 'service.skip_skipdlc', default: this.getConfig('skip_skipdlc', false) };
this.settings.skip_trial = { type: 'checkbox', trans: 'service.skip_trial', default: this.getConfig('skip_trial', false) };
this.settings.whitelist_nocards = { type: 'checkbox', trans: 'service.whitelist_nocards', default: this.getConfig('whitelist_nocards', false) };
this.settings.steam_only = { type: 'checkbox', trans: this.transPath('steam_only'), default: this.getConfig('steam_only', false) };
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: '../app.asar/images/IndieGala.png',
username: 'IndieGala User',
value: 0,
level: 0
};
$.ajax({
url: 'https://www.indiegala.com/library',
success: function (html) {
html = $(html.replace(/<img/gi, '<noload'));
userData.value = html.find('.settings-galasilver').attr('value');
if (fs.existsSync(dirdata + 'indiegala.txt')) {
let lvl = parseInt(fs.readFileSync(dirdata + 'indiegala.txt').toString());
userData.level = lvl;
}
userData.avatar = html.find('.profile-private-page-avatar > noload').attr('src');
if (userData.avatar.includes('profile_backend')) {
userData.avatar = 'https://www.indiegala.com' + userData.avatar;
}
userData.username = html.find('.profile-private-page-user-row').text();
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
let igtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 90) - _this.getConfig('timer_from', 70))) + _this.getConfig('timer_from', 70));
_this.stimer = igtimer;
let page = 1;
_this.igprtry = 0;
_this.dload = 0;
_this.lvlmax = _this.getConfig('max_level', 0);
_this.lvlmin = _this.getConfig('min_level', 0);
_this.entmin = _this.getConfig('min_entries', 0);
_this.pagemax = _this.getConfig('pages', 1);
_this.sort = _this.getConfig('sort_by_level', false);
_this.ending = _this.getConfig('ending', 0);
_this.ending_first = _this.getConfig('ending_first', false);
_this.reserve = _this.getConfig('points_reserve', 0);
_this.sort_after = false;
_this.url = 'https://www.indiegala.com';
_this.notsteam = ',';
if (fs.existsSync(dirdata + 'ig_notsteam.txt')) {
let igdata = fs.readFileSync(dirdata + 'ig_notsteam.txt');
if (igdata.length > 1 && igdata.length < 5000) {
_this.notsteam = igdata.toString();
}
}
if (fs.existsSync(dirdata + 'indiegala.txt')) {
let igl = parseInt(fs.readFileSync(dirdata + 'indiegala.txt').toString());
_this.setLevel(igl);
if (_this.lvlmax > igl || _this.lvlmax === 0) {
_this.lvlmax = igl;
}
if (_this.lvlmin > igl) {
_this.lvlmin = igl;
}
}
if (_this.getConfig('lvl_date', 0) < Date.now() || !fs.existsSync(dirdata + 'indiegala.txt')) {
if (_this.lvlmax === 0) {
_this.lvlmax = 8;
}
rq({
method: 'GET',
url: _this.url + '/library/giveaways/user-level-and-coins',
headers: {
'authority': 'www.indiegala.com',
'accept': 'application/json, text/javascript, */*; q=0.01',
'origin': _this.url,
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'cors',
'x-requested-with': 'XMLHttpRequest',
'user-agent': _this.ua,
'referer': _this.url + '/library',
'cookie': _this.cookies
}
})
.then((iglevel) => {
iglevel = iglevel.data;
if (iglevel.current_level !== null && iglevel.current_level !== undefined && iglevel.current_level !== '-') {
iglevel = parseInt(iglevel.current_level);
_this.setLevel(iglevel);
if (_this.lvlmax > iglevel || _this.lvlmax === 0) {
_this.lvlmax = iglevel;
}
if (_this.lvlmin > iglevel) {
_this.lvlmin = iglevel;
}
_this.setConfig('lvl_date', Date.now() + 86400000);
fs.writeFile(dirdata + 'indiegala.txt', iglevel.toString(), (err) => { });
}
else if (!fs.existsSync(dirdata + 'indiegala.txt')) {
_this.setLevel(_this.lvlmax);
fs.writeFile(dirdata + 'indiegala.txt', _this.lvlmax, (err) => { });
}
});
}
if (_this.curr_level === 0) {
_this.sort = false;
}
if (_this.curr_value === undefined || _this.curr_value === 0) {
_this.setValue(240);
}
if (_this.ending_first && _this.ending !== 0 && _this.sort) {
_this.sort = false;
_this.sort_after = true;
}
if (_this.lvlmax > _this.curr_level || _this.lvlmax === 0) {
_this.lvlmax = _this.curr_level;
}
if (_this.lvlmin > _this.curr_level) {
_this.lvlmin = _this.curr_level;
}
_this.lvl = _this.lvlmax;
let callback = function () {
if (_this.igprtry === 0) {
page++;
}
if (page <= _this.pagemax) {
_this.enterOnPage(page, callback);
}
if (_this.sort && page > _this.pagemax && _this.lvl > _this.lvlmin) {
_this.lvl = _this.lvl - 1;
_this.pagemax = _this.getConfig('pages', 1);
page = 1;
_this.enterOnPage(page, callback);
}
};
_this.enterOnPage(page, callback);
}
enterOnPage(page, callback) {
let _this = this,
igsort = 'expiry/asc',
tickets = '',
data = 'err',
igpage = page;
_this.dload = 0;
if (!_this.sort && _this.curr_level !== 0) {
_this.lvl = 'all';
}
if (_this.getConfig('sort_by_price', false)) {
igsort = 'price/asc';
}
else if (_this.getConfig('sort_by_entries', false)) {
igsort = 'participants/asc';
}
$.ajax({
url: _this.url + '/giveaways/ajax/' + page + '/' + igsort + '/level/' + _this.lvl,
success: function (datas) {
data = datas.replace(/\n/g, "\\n").replace('"text/javascript" src="', "'text/javascript' src='").replace('"></script>', "'></script>");
if (data.indexOf('"status": "ok"') >= 0 && data.indexOf('>0 items<') === -1) {
_this.igprtry = 0;
tickets = $(JSON.parse(data).html).find('.items-list-item > .relative');
if (igpage > 1 && data.indexOf('<i aria-hidden=\"true\" class=\"fa fa-angle-right\"></i>') >= 0) {
_this.pagemax = page;
_this.dload = 1;
}
}
else {
if (_this.igprtry < 3) {
_this.igprtry++;
}
else {
_this.igprtry = 0;
}
}
},
complete: function () {
if (data === 'err') {
if (_this.igprtry < 3) {
_this.igprtry++;
}
else {
_this.igprtry = 0;
}
}
let igcurr = 0,
igrtry = 0,
Times = 0;
function giveawayEnter() {
if (_this.doTimer() - _this.totalTicks < 240) {
_this.totalTicks = 1;
}
if (tickets.length < 20 && _this.igprtry === 0 || _this.curr_value === 0 || !_this.started) {
_this.pagemax = page;
if (tickets.length > 0 && _this.curr_value !== 0 && _this.started) {
_this.dload = 1;
}
if (_this.curr_value === 0) {
_this.dload = 2;
}
}
if (page === 1 && tickets.length === 0 && _this.started && !_this.fail_restart) {
_this.fail_restart = true;
igrtry = 0;
igcurr = 200;
_this.pagemax = page;
_this.setConfig('auth_date', 0);
_this.setStatus('net');
_this.log(Lang.get('service.connection_lost').split(',')[0] + ',' + Lang.get('service.session_expired').split(',')[1], 'err');
_this.totalTicks = 1;
_this.stimer = 1;
}
if (tickets.length <= igcurr || !_this.started || _this.curr_value === 0 || _this.igprtry > 0 || _this.fail_restart) {
if (!_this.started) {
_this.setConfig('lvl_date', 0);
_this.setConfig('check_date', 0);
}
if (_this.igprtry === 0 && !_this.fail_restart) {
if (_this.curr_value === 0 && _this.dload === 2) {
_this.log(Lang.get('service.value_label') + ' - 0', 'skip');
}
if (_this.dload === 1 && !_this.sort && _this.started) {
_this.log(Lang.get('service.reach_end'), 'skip');
}
let igplog = Lang.get('service.checked');
if (_this.sort) {
igplog = igplog + _this.lvl + 'L|';
}
if (page === _this.pagemax) {
igplog = igplog + page + '#-' + _this.getConfig('pages', 1) + '#';
fs.writeFile(dirdata + 'ig_notsteam.txt', _this.notsteam, (err) => { });
if (_this.getConfig('check_date', 0) < Date.now() && _this.started) {
let igcheck = 'err',
iw = 0,
il = 0;
$.ajax({
url: _this.url + '/library/giveaways/giveaways-completed/tocheck',
success: function (chk) {
if (chk.indexOf('>Check all<') >= 0) {
igcheck = 'all';
}
else if (chk.indexOf('"code":"e300"') >= 0) {
igcheck = 'cant';
}
else if (chk.indexOf('This list is actually empty') >= 0) {
igcheck = 'empty';
}
if (igcheck === 'all') {
rq({
method: 'POST',
url: _this.url + '/library/giveaways/check-if-winner-all',
headers: {
'authority': 'www.indiegala.com',
'accept': 'application/json, text/javascript, */*; q=0.01',
'origin': _this.url,
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'cors',
'x-requested-with': 'XMLHttpRequest',
'user-agent': _this.ua,
'referer': _this.url + '/library',
'cookie': _this.cookies
}
})
.then((win) => {
let igwin = win.data;
_this.setConfig('check_date', Date.now() + 43200000);
iw = igwin.won;
il = igwin.checked;
if (igwin.status === 'server_error: 500') {
il = 'All';
iw = 0;
}
})
.finally(() => {
_this.log(Lang.get('service.done') + 'Completed to check - ' + il, 'info');
if (iw > 0) {
_this.log(_this.logLink(_this.url + '/library', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + iw + ')'), 'win');
_this.logWin(' IndieGala - ' + iw);
_this.setStatus('win');
if (_this.getConfig('sound', true)) {
new Audio('../app.asar/sounds/won.wav').play();
}
}
});
}
else if (igcheck === 'err') {
_this.log(Lang.get('service.done') + 'Completed to check - Check error', 'info');
}
else if (igcheck === 'cant') {
_this.setConfig('check_date', Date.now() + 43200000);
_this.log(Lang.get('service.done') + 'Completed to check - Data not available at this moment', 'info');
}
else {
_this.setConfig('check_date', Date.now() + 43200000);
_this.log(Lang.get('service.done') + 'Completed to check - List empty', 'info');
}
}
});
}
}
else {
igplog = igplog + page + '#';
}
if (!_this.fail_restart) {
_this.log(igplog, 'srch');
if (_this.sort_after && page === _this.pagemax) {
page = 1;
_this.pagemax = _this.getConfig('pages', 1);
_this.sort = true;
_this.lvl = _this.lvlmax + 1;
_this.sort_after = false;
}
if (page === _this.pagemax && _this.started) {
if (_this.statusIcon.attr('data-status') === 'work') {
_this.setStatus('good');
}
}
}
}
if (callback) {
callback();
}
return;
}
let ignext = _this.interval();
let ticket = tickets.eq(igcurr),
singl = ticket.find('figcaption > .items-list-item-type').text().trim(),
level = ticket.find('figcaption > .items-list-item-type > span').text().trim(),
igsteam = ticket.find('a > img').attr('data-img-src'),
name = ticket.find('.items-list-item-title').text(),
link = ticket.find('.items-list-item-title > a').attr('href'),
time = ticket.find('.items-list-item-data-cont > .relative > .items-list-item-data > .items-list-item-data-left > .items-list-item-data-left-bottom').text(),
sold = ticket.find('.items-list-item-data-cont > .relative > .items-list-item-data > .items-list-item-data-right > .items-list-item-data-right-bottom').text(),
price = ticket.find('.items-list-item-data-cont > .relative > .items-list-item-data > .items-list-item-data-button > a').attr('data-price'),
single = false,
entered = false,
enterTimes = 1,
igown = 0,
igapp = 0,
igsub = 0,
igbun = 0,
igid = '???',
igtime = '',
id = link.split('/')[4];
if (_this.getConfig('skip_ost', false)) {
if (name.includes(' SoundTrack') || name.includes(' Soundtrack') || name.includes(' - OST')) {
igown = 5;
}
}
if (singl.includes('single ticket')) {
single = true;
}
if (price !== undefined && price !== '') {
price = parseInt(price);
}
if (sold !== undefined && sold !== '') {
sold = parseInt(sold);
}
if (level === undefined || level === '') {
level = 0;
}
else {
level = parseInt((level.replace(/[^0-9]/g,'')));
}
if (igsteam.includes('apps/')) {
igapp = parseInt(igsteam.split('apps/')[1].split('/')[0].split('?')[0].split('#')[0]);
igid = 'app/' + igapp;
}
else if (igsteam.includes('subs/')) {
igsub = parseInt(igsteam.split('subs/')[1].split('/')[0].split('?')[0].split('#')[0]);
igid = 'sub/' + igsub;
}
else if (igsteam.includes('bundles/')) {
igbun = parseInt(igsteam.split('bundles/')[1].split('/')[0].split('?')[0].split('#')[0]);
igid = 'bundle/' + igbun;
}
if (time.includes('day')) {
igtime = time.replace(/[^0-9]/g,'');
time = (24 * igtime);
igtime = igtime + 'd|';
}
else if (time.includes('hour')) {
time = time.replace(/[^0-9]/g,'');
igtime = time + 'h|';
}
else if (time.includes('minute')) {
igtime = time.replace(/[^0-9]/g,'') + 'm|';
time = 0;
}
else if (time === 'Expired') {
igtime = 'end|';
time = 0;
}
if (single) {
if (price === undefined || price === '') {
entered = true;
}
enterTimes = 0;
}
if (!single && Times === 0) {
enterTimes = 0;
if (!_this.getConfig('multi_join', false)) {
entered = true;
}
}
let iglog = _this.logLink(_this.url + link, name);
if (GJuser.dlc.includes(',' + igapp + ',')) {
if (GJuser.skip_dlc.includes(',' + igapp + ',')) {
iglog = '⊟ ' + iglog;
}
else {
iglog = '⊞ ' + iglog;
}
}
if (GJuser.card.includes(',' + igapp + ',')) {
iglog = '♦ ' + iglog;
}
if (_this.getConfig('log', true)) {
if (entered) {
iglog = '|' + page + '#|' + (igcurr + 1) + '№|  ' + iglog;
}
else {
iglog = '|' + page + '#|' + (igcurr + 1) + '№|' + sold + 'e|' + igtime + level + 'L|' + price + '$|  ' + iglog;
}
}
else {
iglog = iglog + _this.logWhite(igid) + _this.logBlack(igid);
}
if (GJuser.white.includes(igid + ',')) {
iglog = '[w] ' + iglog;
}
else if (_this.getConfig('whitelist_only', false)) {
igown = 5;
}
if (igrtry === 0 && single) {
_this.log(Lang.get('service.checking') + iglog + _this.logWhite(igid) + _this.logBlack(igid), 'chk');
}
if (igrtry === 0 && Times === 0 && !single) {
_this.log('[m] ' + Lang.get('service.checking') + iglog + _this.logWhite(igid) + _this.logBlack(igid), 'chk');
}
if (_this.curr_value < price) {
igown = 7;
}
if (
(_this.entmin > sold) ||
(_this.lvlmin > level) ||
(_this.lvlmax < level && _this.lvlmax !== 0) ||
(_this.getConfig('skip_dlc', false) && GJuser.dlc.includes(',' + igapp + ',') && !_this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_dlc', false) && GJuser.dlc.includes(',' + igapp + ',') && !GJuser.white.includes(igid + ',') && _this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_skipdlc', false) && GJuser.skip_dlc.includes(',' + igapp + ',') && !_this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_skipdlc', false) && GJuser.skip_dlc.includes(',' + igapp + ',') && !GJuser.white.includes(igid + ',') && _this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('card_only', false) && !GJuser.card.includes(',' + igapp + ',') && !_this.getConfig('whitelist_nocards', false) && igid !== '???') ||
(_this.getConfig('card_only', false) && !GJuser.card.includes(',' + igapp + ',') && !GJuser.white.includes(igid + ',') && _this.getConfig('whitelist_nocards', false) && igid !== '???') ||
(price < _this.getConfig('min_cost', 0) && _this.getConfig('min_cost', 0) !== 0) ||
(price > _this.getConfig('max_cost', 0) && _this.getConfig('max_cost', 0) !== 0) ||
(_this.reserve > (_this.curr_value - price) && !single && enterTimes > 0 && _this.getConfig('reserve_no_multi', false)) ||
(_this.reserve > (_this.curr_value - price) && !_this.sort && !_this.getConfig('reserve_for_smpl', false)) ||
(_this.reserve > (_this.curr_value - price) && _this.sort && !_this.getConfig('reserve_on_sbl', false))
)
{
igown = 5;
}
if (_this.curr_level < level) {
igown = 8;
}
if (_this.getConfig('skip_trial', false) && GJuser.trial.includes(igid + ',')) {
igown = 9;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '' && GJuser.ownsubs === '') {
igown = 2;
}
if (GJuser.ownapps.includes(',' + igapp + ',') && igapp > 0) {
igown = 1;
}
if (GJuser.ownsubs.includes(',' + igsub + ',') && igsub > 0) {
igown = 1;
}
}
if (GJuser.black.includes(igid + ',') && _this.getConfig('blacklist_on', false)) {
igown = 4;
}
if (entered) {
igown = 3;
}
if (
(igtime === 'end|') ||
(time > _this.ending && _this.ending !== 0 && !_this.sort) ||
(time > _this.ending && _this.ending !== 0 && _this.sort && !_this.getConfig('sbl_ending_ig', false))
)
{
igown = 6;
}
if (_this.getConfig('steam_only', false) && _this.notsteam.includes(',' + id + ',')) {
igown = 10;
}
if (igown > 0) {
switch (igown) {
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
if (single) {
_this.log(Lang.get('service.skipped'), 'skip');
}
else {
_this.log('[' + (Times + 1) + '] ' + Lang.get('service.skipped'), 'skip');
}
break;
case 6:
_this.log(Lang.get('service.time'), 'skip');
break;
case 7:
_this.log(Lang.get('service.points_low'), 'skip');
break;
case 8:
_this.log(Lang.get('service.cant_join') + ' (' + Lang.get('service.level_label') + ' - ' + _this.curr_level + ')', 'skip');
break;
case 9:
_this.log(Lang.get('service.trial'), 'info');
break;
case 10:
_this.log(Lang.get('service.not_steam') + ', ' + Lang.get('service.data_have'), 'info');
break;
}
ignext = 100;
igrtry = 0;
Times = 0;
igcurr++;
}
else {
igrtry++;
let igga = 'err';
$.ajax({
url: _this.url + link,
success: function (iggas) {
igga = $(iggas.replace(/<img/gi, '<noload'));
igga = igga.find('.card-description').text().trim();
},
complete: function () {
if (igga !== 'err') {
igga = igga.toLowerCase();
}
if (_this.getConfig('steam_only', false)) {
if (
igga.includes('gog.com') ||
igga.includes('gog key') ||
igga.includes('origin key') ||
igga.includes('epic key')
)
{
igown = 1;
}
}
if (_this.getConfig('skip_trial', false)) {
if (
igga.includes('alpha key') ||
igga.includes('beta key') ||
igga.includes('early access')
)
{
igown = 2;
}
}
if (igown > 0) {
switch (igown) {
case 1:
_this.log(Lang.get('service.not_steam'), 'info');
if (!_this.notsteam.includes(',' + id + ',')) {
_this.notsteam = _this.notsteam + id + ',';
}
break;
case 2:
_this.log(Lang.get('service.trial'), 'info');
break;
}
ignext = 100;
igrtry = 0;
Times = 0;
igcurr++;
}
else {
let resp = 'err';
rq({
method: 'POST',
url: _this.url + '/giveaways/join',
headers: {
'authority': 'www.indiegala.com',
'accept': 'application/json, text/javascript, */*; q=0.01',
'origin': _this.url,
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'cors',
'x-requested-with': 'XMLHttpRequest',
'user-agent': _this.ua,
'referer': _this.url + link,
'cookie': _this.cookies
},
data: {id: id}
})
.then((resps) => {
resp = resps.data;
})
.finally(() => {
if (resp === 'err') {
ignext = 29000;
}
else {
if (resp.status === 'ok') {
igrtry = 0;
_this.setValue(resp.silver_tot);
if (Times === 0 && single) {
igcurr++;
_this.log(Lang.get('service.entered_in') + iglog, 'enter');
}
else {
Times++;
_this.log('[' + (Times) + '] ' + Lang.get('service.entered_in') + iglog, 'enter');
if (_this.getConfig('multi_join', false) && Times < _this.getConfig('join_qty', 1)) {
ignext = (Math.floor(Math.random() * 500)) + 1000;
}
else {
Times = 0;
igcurr++;
}
}
}
else if (resp.status === 'owner' || resp.status === 'limit_reached' || resp.status === 'not_available' || resp.status === 'banned') {
Times = 0;
igcurr++;
igrtry = 0;
_this.log(Lang.get('service.cant_join') + ' (' + resp.status + ')' , 'cant');
}
else if (resp.status === 'level') {
Times = 0;
igcurr++;
igrtry = 0;
let newlvl = level - 1;
if (_this.curr_level > newlvl) {
_this.setLevel(newlvl);
if (_this.lvlmax > newlvl || _this.lvlmax === 0) {
_this.lvlmax = newlvl;
}
if (_this.lvlmin > newlvl) {
_this.lvlmin = newlvl;
}
}
_this.log(Lang.get('service.cant_join') + ' (' + Lang.get('service.level_label') + ' - ' + newlvl + '?)', 'cant');
}
else if (resp.status === 'silver') {
_this.setValue(price - 1);
Times = 0;
igcurr++;
igrtry = 0;
_this.log(Lang.get('service.cant_join') + ' (' + Lang.get('service.value_label') + ' - ' + (price - 1) + '?)', 'cant');
}
else if (resp.status === 'duplicate') {
igcurr++;
igrtry = 0;
_this.log(Lang.get('service.entered_in') + iglog, 'enter');
}
else if (resp.status === 'login') {
_this.fail_restart = true;
igrtry = 0;
igcurr = 200;
ignext = 100;
_this.pagemax = page;
_this.setConfig('auth_date', 0);
_this.setStatus('net');
_this.log(Lang.get('service.err_join'), 'cant');
_this.log(Lang.get('service.session_expired'), 'err');
_this.totalTicks = 1;
_this.stimer = 1;
}
else {
ignext = (Math.floor(Math.random() * 1000)) + 3000;
}
}
if (igrtry >= 12) {
_this.fail_restart = true;
igrtry = 0;
igcurr = 200;
ignext = 100;
_this.pagemax = page;
_this.setConfig('auth_date', 0);
_this.setStatus('net');
_this.log(Lang.get('service.err_join'), 'cant');
_this.log(Lang.get('service.connection_lost'), 'err');
_this.totalTicks = 1;
_this.stimer = 5;
}
});
}
}
});
}
setTimeout(giveawayEnter, ignext);
}
giveawayEnter();
}
});
}
}
