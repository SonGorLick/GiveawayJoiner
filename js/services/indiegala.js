'use strict';
class IndieGala extends Joiner {
constructor() {
super();
this.domain = 'indiegala.com';
this.authContent = 'My Profile';
this.websiteUrl = 'https://www.indiegala.com';
this.authLink = 'https://www.indiegala.com/login';
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
this.settings.sound = { type: 'checkbox', trans: 'service.sound', default: this.getConfig('sound', true) };
super.init();
}
authCheck(callback) {
$.ajax({
url: 'https://www.indiegala.com/',
success: function () {
$.ajax({
url: 'https://www.indiegala.com/get_user_info',
data: {
uniq_param: (new Date()).getTime(),
show_coins: 'True'
},
dataType: 'json',
success: function (data) {
if (data.status === 'ok') {
GJuser.ig = data.profile;
if (data.giveaways_user_lever !== undefined || GJuser.iglvl === undefined) {
GJuser.iglvl = data.giveaways_user_lever;
}
else {
GJuser.iglvl = this.getConfig('max_level', 0);
}
callback(1);
}
else {
GJuser.ig = '';
callback(0);
}
},
error: function () {
callback(-1);
}
});
}
});
}
getUserInfo(callback) {
let userData = {
avatar: dirapp + 'images/IndieGala.png',
username: 'IndieGala User',
value: 0
};
$.ajax({
url: 'https://www.indiegala.com/get_user_info',
data: {
uniq_param: (new Date()).getTime(),
show_coins: 'True'
},
dataType: 'json',
success: function (data) {
userData.value = data.silver_coins_tot;
if (data.use_steam_username_avatar === 'true') {
userData.avatar = data.steamavatar.replace('.jpg', '_medium.jpg');
userData.username = data.steamnick;
}
else {
userData.avatar = 'https://www.indiegala.com' + data.cookie_useravatar;
userData.username = data.cookie_username;
if (userData.username === '...') {
userData.username = data.email;
}
}
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
if (_this.getConfig('timer_to', 90) !== _this.getConfig('timer_from', 70)) {
let igtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 90) - _this.getConfig('timer_from', 70))) + _this.getConfig('timer_from', 70));
_this.stimer = igtimer;
}
let page = 1;
_this.igprtry = 0;
_this.iglast = 0;
_this.ua = mainWindow.webContents.session.getUserAgent();
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
$.ajax({
url: _this.url + '/giveaways/library_completed',
type: 'POST',
data: '{"list_type":"tocheck","page":1}',
dataType: 'json',
success: function (response) {
if (response.check_it_all_enabled === true) {
rq({
method: 'GET',
uri: _this.url + '/giveaways/check_if_won_all',
headers: {
'origin': _this.url,
'referer': _this.url + '/profile?user_id=' + GJuser.iglvl,
'user-agent': _this.ua,
'cookie': _this.cookies
},
json: false
})
.then((html) => {
let igwon = $(html).find('p').eq(1).text().trim();
if (igwon.includes('Congratulations! You won')) {
igwon = igwon.replace('Congratulations! You won','').replace('Giveaways','').trim();
_this.log(_this.logLink(_this.url + '/profile?user_id=' + GJuser.ig, Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + igwon + ')'), 'win');
_this.setStatus('win');
if (_this.getConfig('sound', true)) {
new Audio(dirapp + 'sounds/won.wav').play();
}
}
});
}
}
});
$.ajax({
url: _this.url + '/claimprofile/sync_username_avatar',
type: 'POST'
});
if (GJuser.iglvl === 0) {
_this.sort = false;
}
if (_this.curr_value === undefined) {
_this.setValue(240);
}
if (_this.ending_first && _this.ending !== 0 && _this.sort) {
_this.sort = false;
_this.sort_after = true;
}
if (_this.lvlmax > GJuser.iglvl || _this.lvlmax === 0) {
_this.lvlmax = GJuser.iglvl;
}
if (_this.lvlmin > GJuser.iglvl) {
_this.lvlmin = GJuser.iglvl;
}
_this.lvl = _this.lvlmax;
let callback = function () {
page++;
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
let _this = this;
if (!_this.sort && GJuser.iglvl > 0) {
_this.lvl = 'all';
}
if (_this.igprtry > 0) {
page = _this.igprtry;
}
let tickets = '';
$.ajax({
url: _this.url + '/giveaways/ajax_data/list?page_param=' + page + '&order_type_param=expiry&order_value_param=asc&filter_type_param=level&filter_value_param=' + _this.lvl,
success: function (data) {
if (data.indexOf('Incapsula_Resource') >= 0) {
_this.igprtry = page;
}
else {
tickets = $(JSON.parse(data).content).find('.tickets-col');
_this.igprtry = 0;
}
let igcurr = 0,
igrtry = 0,
Times = 0;
if (page > 1 && data.indexOf('prev-next palette-background-7') >= 0) {
_this.pagemax = page;
_this.iglast = 1;
}
function giveawayEnter() {
if (_this.doTimer() - _this.totalTicks < 240) {
let igtimer = _this.getConfig('timer_from', 70);
if (_this.getConfig('timer_to', 90) !== _this.getConfig('timer_from', 70)) {
igtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 90) - _this.getConfig('timer_from', 70))) + _this.getConfig('timer_from', 70));
}
_this.stimer = igtimer;
}
if (tickets.length < 12 && _this.igprtry === 0 || _this.curr_value === 0 || !_this.started) {
_this.pagemax = page;
}
if (tickets.length <= igcurr || !_this.started || _this.curr_value === 0 || _this.igprtry > 0) {
if (_this.igprtry === 0) {
if (_this.getConfig('log', true)) {
if (_this.iglast !== 0 && !_this.sort && _this.started) {
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
}
if (callback) {
callback();
}
return;
}
let ignext = _this.interval();
let ticket = tickets.eq(igcurr),
price = ticket.find('.ticket-price strong').text(),
level = parseInt(ticket.find('.type-level span').text().replace('+', '')),
single = ticket.find('.extra-type .fa-clone').length === 0,
id = ticket.find('.ticket-right .relative').attr('rel'),
igsteam = ticket.find('.giv-game-img').attr('data-src'),
name = ticket.find('h2 a').text(),
time = ticket.find('.box_pad_5 > .info-row:nth-of-type(5)').text(),
sold = ticket.find('.box_pad_5 > .info-row:nth-of-type(3) > .tickets-sold').text().trim(),
entered = false,
enterTimes = 1,
igown = 0,
igapp = 0,
igsub = 0,
igid = '???',
igtime = '';
if (name.length > 77) {
name = name.slice(0, 77) + '...';
}
if (igsteam.includes('apps/')) {
igapp = parseInt(igsteam.split('apps/')[1].split('/')[0].split('?')[0].split('#')[0]);
igid = 'app/' + igapp;
}
if (igsteam.includes('sub/')) {
igsub = parseInt(igsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
igid = 'sub/' + igsub;
}
if (time.includes('day')) {
igtime = time.replace('day left','').replace('days left','').trim();
time = (24 * igtime);
igtime = igtime + 'd|';
}
else {
if (time.includes('hour')) {
time = time.replace('hour left','').replace('hours left','').trim();
igtime = time + 'h|';
}
else {
if (time.includes('minute')) {
igtime = time.replace('minute left','').replace('minutes left','').replace('Less than 1','0').trim() + 'm|';
time = 0;
}
}
}
if (single) {
entered = ticket.find('.giv-coupon').length === 0;
enterTimes = 0;
}
if (!single && Times === 0) {
enterTimes = parseInt(ticket.find('.giv-coupon .palette-color-11').text());
if (!_this.getConfig('multi_join', false)) {
entered = enterTimes >= _this.getConfig('join_qty', 1);
}
if (isNaN(enterTimes)) {
enterTimes = 0;
igown = 8;
}
}
let iglog = _this.logLink(_this.url + '/giveaways/detail/' + id, name);
if (_this.getConfig('log', true)) {
iglog = '|' + page + '#|' + (igcurr + 1) + '№|' + igtime + level + 'L|' + price + '$|  ' + iglog;
if (igrtry === 0 && single) {
_this.log(Lang.get('service.checking') + iglog + _this.logBlack(igid), 'chk');
}
if (igrtry === 0 && Times === 0 && !single) {
_this.log('[' + enterTimes + '] ' + Lang.get('service.checking') + iglog + _this.logBlack(igid), 'chk');
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
(GJuser.iglvl < level) ||
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
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' || GJuser.ownsubs === '[]') {
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
_this.log(Lang.get('service.skipped'), 'skip');
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
rq({
method: 'POST',
uri: _this.url + '/giveaways/new_entry',
form: JSON.stringify({giv_id: id, ticket_price: price}),
headers: {
'authority': 'www.indiegala.com',
'accept': 'application/json, text/javascript, */*; q=0.01',
'origin': _this.url,
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'cors',
'x-requested-with': 'XMLHttpRequest',
'user-agent': _this.ua,
'referer': _this.url + '/giveaways/' + page + '/expiry/asc/level/' + _this.lvl,
'cookie': _this.cookies
},
json: true
})
.then((response) => {
if (response.status === 'duplicate') {
igcurr++;
igrtry = 0;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.entered_in') + iglog, 'enter');
}
}
if (response.status === 'ok') {
igrtry = 0;
_this.setValue(response.new_amount);
if (Times === 0 && single) {
igcurr++;
_this.log(Lang.get('service.entered_in') + iglog, 'enter');
}
else {
Times++;
_this.log('[' + (Times) + '] ' + Lang.get('service.entered_in') + iglog, 'enter');
if (_this.getConfig('multi_join', false) && Times < _this.getConfig('join_qty', 1)) {
ignext = (Math.floor(Math.random() * 400)) + 600;
}
else {
Times = 0;
igcurr++;
}
}
}
else {
ignext = (Math.floor(Math.random() * 600)) + 800;
}
})
.catch(() => {
});
}
if (igrtry >= 12) {
igrtry = 0;
Times = 0;
ignext = 61000;
igcurr++;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
setTimeout(giveawayEnter, ignext);
}
giveawayEnter();
}
});
}
}
