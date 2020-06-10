'use strict';
class IndieGala extends Joiner {
constructor() {
super();
this.domain = 'indiegala.com';
this.authContent = 'Your account';
this.websiteUrl = 'https://www.indiegala.com/library';
this.authLink = 'https://www.indiegala.com/login';
this.withValue = true;
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
this.settings.multi_join = { type: 'checkbox', trans: this.transPath('multi_join'), default: this.getConfig('multi_join', false) };
this.settings.reserve_on_sbl = { type: 'checkbox', trans: this.transPath('reserve_on_sbl'), default: this.getConfig('reserve_on_sbl', false) };
this.settings.ending_first = { type: 'checkbox', trans: this.transPath('ending_first'), default: this.getConfig('ending_first', false) };
this.settings.reserve_for_smpl = { type: 'checkbox', trans: this.transPath('reserve_for_smpl'), default: this.getConfig('reserve_for_smpl', false) };
this.settings.sort_by_level = { type: 'checkbox', trans: 'service.sort_by_level', default: this.getConfig('sort_by_level', false) };
this.settings.reserve_no_multi = { type: 'checkbox', trans: this.transPath('reserve_no_multi'), default: this.getConfig('reserve_no_multi', false) };
this.settings.sbl_ending_ig = { type: 'checkbox', trans: this.transPath('sbl_ending_ig'), default: this.getConfig('sbl_ending_ig', false) };
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: dirapp + 'images/IndieGala.png',
username: 'IndieGala User',
value: 0
};
$.ajax({
url: 'https://www.indiegala.com/library',
success: function (html) {
html = $(html.replace(/<img/gi, '<noload'));
userData.value = html.find('.settings-galasilver').attr('value');
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
_this.dcheck = 0;
if (_this.dload === ',') {
_this.dload = 0;
}
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
if (_this.dsave === ',') {
_this.dsave = _this.lvlmax;
$.ajax({
url: _this.url + '/library/giveaways/user-level-and-coins',
dataType: 'json',
success: function (iglevel) {
if (iglevel.current_level !== undefined) {
_this.dsave = iglevel.current_level;
if (_this.lvlmax > _this.dsave || _this.lvlmax === 0) {
_this.lvlmax = _this.dsave;
}
}
}, error: () => {}
});
}
if (_this.dload === 0) {
$.ajax({
url: _this.url + '/library/giveaways/giveaways-completed/tocheck',
success: function (tocheck) {
let igchecks = '-all',
igchck = [],
igchckid = '',
igchecked = ' [Check error]';
if (tocheck.indexOf('>Check all<') >= 0) {
igchck[0] = '0';
}
else if (tocheck.indexOf('"status": "ok", "html"')) {
igchecks = '';
igchecks = $(tocheck.html).find('.library-giveaways-check-if-won-btn');
for (let i = 0; i < igchecks.length; i++) {
igchck[i] = igchecks.eq(i).attr('onclick').replace("giveawayCheckIfWinner(this, event, '", "").replace("')", "");
}
}
else {
igchecks = 'err';
}
let ic = 0,
iw = 0,
il = 0;
if (igchck.length > 0) {
igchck.forEach(function(check) {
if (igchecks !== '-all') {
igchckid = {entry_id: check};
}
rq({
method: 'POST',
url: _this.url + '/library/giveaways/check-if-winner' + igchecks,
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
},
data: igchckid
})
.then((win) => {
let igwin = win.data;
if (igwin.checked >= 0) {
_this.dload = 3;
igchecked = ' [Check all]';
iw = igwin.won;
il = igwin.checked - iw;
}
else if (igwin.winner === true) {
iw++;
igchecked = ' [By one]';
}
else if (igwin.winner === false) {
il++;
igchecked = ' [By one]';
}
})
.finally(() => {
ic++;
if (ic >= igchck.length) {
_this.log(Lang.get('service.done') + 'Completed to check - ' + (iw + il) + igchecked, 'info');
if (iw > 0) {
_this.log(_this.logLink(_this.url + '/library', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + (iw) + ')'), 'win');
_this.setStatus('win');
if (_this.getConfig('sound', true)) {
new Audio(dirapp + 'sounds/won.wav').play();
}
}
}
});
});
}
else {
if (igchecks === 'err') {
_this.log(Lang.get('service.done') + 'Completed to check - 0' + igchecked, 'info');
}
else {
_this.dload = 3;
_this.log(Lang.get('service.done') + 'Completed to check - This list is actually empty', 'info');
}
}
}, error: () => {}
});
}
else {
_this.dload = _this.dload - 1;
}
if (_this.dsave === 0) {
_this.sort = false;
}
if (_this.curr_value === undefined || _this.curr_value === 0) {
_this.setValue(240);
}
if (_this.ending_first && _this.ending !== 0 && _this.sort) {
_this.sort = false;
_this.sort_after = true;
}
if (_this.lvlmax > _this.dsave || _this.lvlmax === 0) {
_this.lvlmax = _this.dsave;
}
if (_this.lvlmin > _this.dsave) {
_this.lvlmin = _this.dsave;
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
tickets = '',
data = 'err',
igpage = page;
_this.dcheck = 0;
if (!_this.sort && _this.dsave > 0) {
_this.lvl = 'all';
}
$.ajax({
url: _this.url + '/giveaways/' + page + '/expiry/asc/level/' + _this.lvl,
success: function (datas) {
datas = datas.replace(/<img/gi, '<noload');
data = datas;
if (data.indexOf('<div class="giveaways">') >= 0) {
_this.igprtry = 0;
tickets = $(data).find('.page-contents-list > .items-list-row.row > div.items-list-col.col-3 > .items-list-item > .relative');
if (igpage > 1 && data.indexOf('class="fa fa-angle-right"></i></a>') < 0) {
_this.pagemax = page;
_this.dcheck = 1;
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
_this.dcheck = 1;
}
if (_this.curr_value === 0) {
_this.dcheck = 2;
}
}
if (tickets.length <= igcurr || !_this.started || _this.curr_value === 0 || _this.igprtry > 0) {
if (!_this.started) {
_this.dload = 0;
}
if (_this.igprtry === 0) {
if (_this.getConfig('log', true)) {
if (_this.curr_value === 0 && _this.dcheck === 2) {
_this.log(Lang.get('service.value_label') + ' - 0', 'skip');
}
if (_this.dcheck === 1 && !_this.sort && _this.started) {
_this.log(Lang.get('service.reach_end'), 'skip');
}
let igplog = Lang.get('service.checked');
if (_this.sort) {
igplog = igplog + _this.lvl + 'L|';
}
if (page === _this.pagemax) {
igplog = igplog + page + '#-' + _this.getConfig('pages', 1) + '#';
}
else {
igplog = igplog + page + '#';
}
_this.log(igplog, 'srch');
}
if (_this.sort_after && page === _this.pagemax) {
page = 1;
_this.pagemax = _this.getConfig('pages', 1);
_this.sort = true;
_this.lvl = _this.lvlmax + 1;
_this.sort_after = false;
}
if (page === _this.pagemax && _this.started) {
_this.setStatus('good');
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
igsteam = ticket.find('a > noload').attr('data-img-src'),
name = ticket.find('.items-list-item-title').text(),
link = ticket.find('.items-list-item-title > a').attr('href'),
time = ticket.find('.items-list-item-ticket.items-list-item-data-cont > .relative > .items-list-item-data > .items-list-item-data-left > .items-list-item-data-left-bottom').text(),
sold = ticket.find('.items-list-item-ticket.items-list-item-data-cont > .relative > .items-list-item-data > .items-list-item-data-right > .items-list-item-data-right-bottom').text(),
price = ticket.find('.items-list-item-ticket.items-list-item-data-cont > .relative > .items-list-item-data > .items-list-item-data-button > a').attr('data-price'),
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
if (name.length > 75) {
name = name.slice(0, 75) + '...';
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
if (_this.getConfig('log', true)) {
if (entered) {
iglog = '|' + page + '#|' + (igcurr + 1) + '№|  ' + iglog;
}
else {
iglog = '|' + page + '#|' + (igcurr + 1) + '№|' + sold + 't|' + igtime + level + 'L|' + price + '$|  ' + iglog;
}
if (igrtry === 0 && single) {
_this.log(Lang.get('service.checking') + iglog + _this.logBlack(igid), 'chk');
}
if (igrtry === 0 && Times === 0 && !single) {
_this.log('[m] ' + Lang.get('service.checking') + iglog + _this.logBlack(igid), 'chk');
}
}
else {
iglog = iglog + _this.logBlack(igid);
}
if (_this.curr_value < price) {
igown = 7;
}
if (
(_this.entmin > sold) ||
(_this.lvlmin > level) ||
(_this.lvlmax < level && _this.lvlmax !== 0) ||
(price < _this.getConfig('min_cost', 0) && _this.getConfig('min_cost', 0) !== 0) ||
(price > _this.getConfig('max_cost', 0) && _this.getConfig('max_cost', 0) !== 0) ||
(_this.reserve > (_this.curr_value - price) && !single && enterTimes > 0 && _this.getConfig('reserve_no_multi', false)) ||
(_this.reserve > (_this.curr_value - price) && !_this.sort && !_this.getConfig('reserve_for_smpl', false)) ||
(_this.reserve > (_this.curr_value - price) && _this.sort && !_this.getConfig('reserve_on_sbl', false))
)
{
igown = 5;
}
if (_this.dsave < level) {
igown = 8;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' && GJuser.ownsubs === '[]') {
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
(time > _this.ending && _this.ending !== 0 && !_this.sort) ||
(time > _this.ending && _this.ending !== 0 && _this.sort && !_this.getConfig('sbl_ending_ig', false))
)
{
igown = 6;
_this.pagemax = page;
igcurr = 100;
}
if (igown > 0) {
if (_this.getConfig('log', true)) {
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
_this.log(Lang.get('service.cant_join'), 'cant');
break;
}
}
ignext = 100;
igrtry = 0;
Times = 0;
igcurr++;
}
else {
igrtry++;
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
else if (resp.status === 'level') {
Times = 0;
igcurr++;
igrtry = 0;
if (_this.lvlmax > 0) {
_this.lvlmax = _this.lvlmax - 1;
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.cant_join'), 'cant');
}
}
else if (resp.status === 'silver') {
_this.setValue(price - 1);
Times = 0;
igcurr++;
igrtry = 0;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.points_low'), 'skip');
}
}
else if (resp.status === 'duplicate') {
igcurr++;
igrtry = 0;
_this.log(Lang.get('service.entered_in') + iglog, 'enter');
}
else {
_this.log(resp.status, 'err');
_this.log(JSON.stringify(resp), 'err');
ignext = (Math.floor(Math.random() * 1000)) + 1000;
}
}
if (igrtry >= 12) {
igrtry = 0;
Times = 0;
ignext = 29000;
igcurr++;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
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
