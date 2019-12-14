'use strict';
require('v8-compile-cache');
class SteamGifts extends Joiner {
constructor() {
super();
this.settings.timer_from.min = 5;
this.websiteUrl = 'https://www.steamgifts.com';
this.authContent = 'Account';
this.authLink = 'https://www.steamgifts.com/?login';
this.settings.ending = { type: 'number', trans: this.transPath('ending'), min: 0, max: 2880, default: this.getConfig('ending', 0) };
this.settings.min_chance = { type: 'float_number', trans: this.transPath('min_chance'), min: 0, max: 100, default: this.getConfig('min_chance', 0) };
this.settings.min_entries = { type: 'ten_number', trans: 'service.min_entries', min: 0, max: 10000, default: this.getConfig('min_entries', 0) };
this.settings.min_level = { type: 'number', trans: 'service.min_level', min: 0, max: this.getConfig('max_level', 0), default: this.getConfig('min_level', 0) };
this.settings.max_level = { type: 'number', trans: 'service.max_level', min: this.getConfig('min_level', 0), max: 10, default: this.getConfig('max_level', 0) };
this.settings.min_cost = { type: 'number', trans: 'service.min_cost', min: 0, max: this.getConfig('max_cost', 0), default: this.getConfig('min_cost', 0) };
this.settings.max_cost = { type: 'number', trans: 'service.max_cost', min: this.getConfig('min_cost', 0), max: 300, default: this.getConfig('max_cost', 0) };
this.settings.points_reserve = { type: 'number', trans: 'service.points_reserve', min: 0, max: 500, default: this.getConfig('points_reserve', 0) };
this.settings.multiple_first = { type: 'checkbox', trans: this.transPath('multiple_first'), default: this.getConfig('multiple_first', false) };
this.settings.wishlist_first = { type: 'checkbox', trans: this.transPath('wishlist_first'), default: this.getConfig('wishlist_first', false) };
this.settings.sort_by_copies = { type: 'checkbox', trans: this.transPath('sort_by_copies'), default: this.getConfig('sort_by_copies', false) };
this.settings.group_first = { type: 'checkbox', trans: this.transPath('group_first'), default: this.getConfig('group_first', false) };
this.settings.sort_by_level = { type: 'checkbox', trans: 'service.sort_by_level', default: this.getConfig('sort_by_level', false) };
this.settings.wishlist_only = { type: 'checkbox', trans: this.transPath('wishlist_only'), default: this.getConfig('wishlist_only', false) };
this.settings.sort_by_chance = { type: 'checkbox', trans: this.transPath('sort_by_chance'), default: this.getConfig('sort_by_chance', false) };
this.settings.group_only = { type: 'checkbox', trans: this.transPath('group_only'), default: this.getConfig('group_only', false) };
this.settings.reserve_on_wish = { type: 'checkbox', trans: this.transPath('reserve_on_wish'), default: this.getConfig('reserve_on_wish', false) };
this.settings.reserve_on_group = { type: 'checkbox', trans: this.transPath('reserve_on_group'), default: this.getConfig('reserve_on_group', false) };
this.settings.hide_ga = { type: 'checkbox', trans: this.transPath('hide_ga'), default: this.getConfig('hide_ga', false) };
this.settings.ignore_on_wish = { type: 'checkbox', trans: this.transPath('ignore_on_wish'), default: this.getConfig('ignore_on_wish', false) };
this.settings.sound = { type: 'checkbox', trans: 'service.sound', default: this.getConfig('sound', true) };
this.settings.ignore_on_group = { type: 'checkbox', trans: this.transPath('ignore_on_group'), default: this.getConfig('ignore_on_group', false) };
this.token = '';
this.giveaways = [];
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: __dirname + '/images/SteamGifts.png',
username: 'SG User',
value: 0
};
$.ajax({
url: 'https://www.steamgifts.com/account/settings/profile',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
userData.avatar = data.find('.nav__avatar-inner-wrap').attr('style').replace('background-image:url(', '').replace(');', '');
userData.username = data.find('input[name=username]').val();
userData.value = data.find('.nav__points').text();
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let page = 1;
if (this.getConfig('timer_to', 70) !== this.getConfig('timer_from', 50)) {
let sgtimer = (Math.floor(Math.random() * (this.getConfig('timer_to', 70) - this.getConfig('timer_from', 50))) + this.getConfig('timer_from', 50));
this.stimer = sgtimer;
}
this.check = 0;
this.won = this.getConfig('won', 0);
this.giveaways = [];
this.gawf = [];
this.gagf = [];
this.gamf = [];
this.url = 'https://www.steamgifts.com';
let processCommon = () => {
if (!this.started) {
return;
}
if (page <= this.getConfig('pages', 1)) {
this.wish = false;
this.group = false;
this.giveawaysFromUrl(this.url + '/giveaways/search?page=' + page, processCommon);
}
else {
this.wish = false;
this.group = false;
this.giveawaysEnter();
}
page++;
};
this.wish = true;
this.group = false;
this.giveawaysFromUrl(this.url + '/giveaways/search?type=wishlist', () => {
this.wish = true;
this.group = false;
if (!this.getConfig('group_only')) {
this.giveawaysEnter();
if (this.getConfig('wishlist_only')) {
return;
}
}
this.group = true;
this.wish = false;
this.giveawaysFromUrl(this.url + '/giveaways/search?type=group', () => {
this.group = true;
this.wish = false;
this.giveawaysEnter();
if (this.getConfig('group_only')) {
return;
}
this.wish = false;
this.group = false;
processCommon();
});
});
}
giveawaysFromUrl(url, callback) {
$.ajax({
url: url,
method: 'GET',
success: (data) => {
data = $('<div>' + data + '</div>');
this.token = data.find('input[name="xsrf_token"]').val();
if (this.token.length < 10) {
this.log(this.trans('token_error'), 'err');
this.stopJoiner(true);
return;
}
if (this.check === 0) {
this.check = 1;
let sgwon = parseInt(data.find('.nav__button-container--active.nav__button-container--notification.nav__button-container:nth-of-type(2) > .nav__button > .nav__notification').text().trim());
if (isNaN(sgwon)) {
sgwon = 0;
}
if (sgwon < this.won) {
this.setConfig('won', sgwon);
}
if (sgwon > 0 && sgwon > this.won) {
this.log(this.logLink(this.url + '/giveaways/won', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + (sgwon) + ')'), 'win');
this.setConfig('won', sgwon);
if (this.getConfig('sound', true)) {
new Audio(__dirname + '/sounds/won.wav').play();
}
}
}
data.find('.giveaway__row-outer-wrap').each((index, item) => {
let sgaway = $(item);
let copies = 1;
let link = this.url + sgaway.find('a.giveaway__heading__name').attr('href');
let entries = parseInt(sgaway.find('.fa.fa-tag+span').text().replace(/[^0-9]/g, ''));
let left = sgaway.find('[data-timestamp]').first().text().split(' ');
let factor = 1;
switch (left[1]) {
case 'hour': case 'hours': factor = 60; break;
case 'day': case 'days': factor = 1440; break;
case 'week': case 'weeks': factor = 10080; break;
case 'month': case 'months': factor = 40320; break;
}
let detectQty = sgaway.find('.giveaway__heading__thin').first().text();
if (detectQty.indexOf('Copies') > 0) {
copies = parseInt(detectQty.replace(/[^0-9]/g, ''));
}
let chance = parseFloat(((copies / entries) * 100).toFixed(2));
let GA = {
chance: (chance === Infinity ? 0 : chance),
pinned: sgaway.closest('.pinned-giveaways__outer-wrap').length > 0,
link: link,
left: (parseInt(left[0]) * factor),
copies: copies,
entries: entries,
code: link.match(/away\/(.*)\//)[1],
gameid: sgaway.attr('data-game-id'),
name: sgaway.find('a.giveaway__heading__name').text(),
level: sgaway.find('.giveaway__column--contributor-level').length > 0 ? parseInt(sgaway.find('.giveaway__column--contributor-level').text().replace('+', '').replace('Level ', '')) : 0,
levelPass: sgaway.find('.giveaway__column--contributor-level--negative').length === 0,
cost: parseInt(sgaway.find('a.giveaway__icon[rel]').prev().text().replace(/[^0-9]/g, '')),
sgsteam: sgaway.find('a.giveaway__icon').attr('href'),
entered: sgaway.find('.giveaway__row-inner-wrap.is-faded').length > 0,
wish: this.wish,
group: this.group
};
if (
(!GA.entered && !GA.pinned && GA.levelPass) &&
(!GA.wish || this.getConfig('wishlist_first', false) || this.getConfig('wishlist_only', false)) &&
(!GA.group || this.getConfig('group_first', false) || this.getConfig('group_only', false)) &&
(this.getConfig('ending', 0) === 0 || GA.left <= this.getConfig('ending', 0)) &&
(this.getConfig('min_chance', 0) === 0 || GA.chance >= this.getConfig('min_chance', 0) || GA.wish && this.getConfig('ignore_on_wish', false) || GA.group && this.getConfig('ignore_on_group', false)) &&
(this.getConfig('min_entries', 0) === 0 || GA.entries >= this.getConfig('min_entries', 0) || GA.wish && this.getConfig('ignore_on_wish', false) || GA.group && this.getConfig('ignore_on_group', false))
)
this.giveaways.push(GA);
});
},
complete: () => {
if (callback) {
callback();
}
}
});
}
giveawaysEnter(callback) {
let _this = this;
let sgcurr = 0;
if (this.getConfig('sort_by_chance', false) && (this.wish || this.group)) {
this.giveaways.sort((a, b) => {
return b.chance - a.chance;
});
}
if (this.getConfig('sort_by_level', false) && (this.wish || this.group)) {
this.giveaways.sort((a, b) => {
return b.level - a.level;
});
}
if (this.getConfig('sort_by_copies', false) && (this.wish || this.group)) {
this.giveaways.sort((a, b) => {
return b.copies - a.copies;
});
}
if (this.getConfig('wishlist_first', false) && !this.getConfig('wishlist_only', false) && this.wish) {
this.gawf = this.giveaways.filter(GA => GA.wish === true);
this.giveaways = [];
}
if (this.getConfig('group_first', false) && !this.getConfig('group_only', false) && this.group) {
this.gagf = this.giveaways.filter(GA => GA.group === true);
this.giveaways = [];
}
if (this.getConfig('multiple_first', false)) {
this.gamf = this.giveaways.filter(GA => GA.copies > 1);
this.giveaways = this.giveaways.filter(GA => GA.copies === 1);
}
if (this.getConfig('sort_by_chance', false)) {
this.giveaways.sort((a, b) => {
return b.chance - a.chance;
});
}
if (this.getConfig('sort_by_level', false)) {
this.giveaways.sort((a, b) => {
return b.level - a.level;
});
}
if (this.getConfig('sort_by_copies', false)) {
this.giveaways.sort((a, b) => {
return b.copies - a.copies;
});
}
if (this.getConfig('group_first', false) && !this.getConfig('group_only', false) && !this.wish && !this.group) {
this.giveaways.unshift.apply(this.giveaways, this.gagf);
}
if (this.getConfig('wishlist_first', false) && !this.getConfig('wishlist_only', false) && !this.wish && !this.group) {
this.giveaways.unshift.apply(this.giveaways, this.gawf);
}
if (this.getConfig('multiple_first', false)) {
this.giveaways.unshift.apply(this.giveaways, this.gamf);
}
function processOne() {
if (_this.giveaways.length <= sgcurr || !_this.started) {
if (_this.getConfig('log', true) && sgcurr > 0) {
_this.log(Lang.get('service.checked') + '1#-' + _this.getConfig('pages', 1) + '#', 'srch');
}
if (callback) {
callback(false);
}
return;
}
let sgnext = _this.interval();
let GA = _this.giveaways[sgcurr],
sgown = 0,
sgapp = 0,
sgsub = 0,
sgid = '???';
if (GA.sgsteam.includes('app/')) {
sgapp = parseInt(GA.sgsteam.split('app/')[1].split('/')[0].split('?')[0].split('#')[0]);
sgid = 'app/' + sgapp;
}
if (GA.sgsteam.includes('sub/')) {
sgsub = parseInt(GA.sgsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
sgid = 'sub/' + sgsub;
}
if (_this.curr_value < GA.cost && GA.cost > 0) {
sgown = 3;
}
if (GA.entered) {
sgown = 5;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' || GJuser.ownsubs === '[]') {
_this.log(Lang.get('service.steam_error'), 'err');
sgown = 2;
}
if (GJuser.ownapps.includes(',' + sgapp + ',') && sgapp > 0) {
sgown = 1;
}
if (GJuser.ownsubs.includes(',' + sgsub + ',') && sgsub > 0) {
sgown = 1;
}
}
if (GJuser.black.includes(sgid + ',') && _this.getConfig('blacklist_on', false)) {
sgown = 4;
}
if (GA.entered && sgown === 1) {
sgown = 6;
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|'+ GA.copies + 'x|' + GA.level + 'L|' + GA.cost + '$|' + GA.chance + '%|' + _this.logLink(GA.sgsteam, sgid) + '|  '+ _this.logLink(GA.link, GA.name) + _this.logBlack(sgid), 'chk');
if (sgown === 1) {
_this.log(Lang.get('service.have_on_steam'), 'steam');
}
if (sgown === 3) {
_this.log(Lang.get('service.points_low'), 'skip');
}
if (sgown === 4) {
_this.log(Lang.get('service.blacklisted'), 'black');
}
if (sgown === 5) {
_this.log(Lang.get('service.already_joined'), 'skip');
}
if (sgown === 6) {
_this.log(Lang.get('service.already_joined'), 'err');
_this.log(Lang.get('service.have_on_steam'), 'steam');
}
}
if ((sgown === 1 || sgown === 6) && _this.getConfig('hide_ga', false)) {
sgown = 6;
$.ajax({
url: _this.url + '/ajax.php',
method: 'POST',
dataType: 'json',
data: {
xsrf_token: _this.token,
do: 'hide_giveaways_by_game_id',
game_id: GA.gameid
},
success: function () {
_this.log(Lang.get('service.hided') + '|' + _this.logLink(GA.sgsteam, sgid) + '|  '+ _this.logLink(GA.link, GA.name), 'cant');
}
});
}
if (
(sgown === 0) &&
(GA.wish && _this.getConfig('ignore_on_wish', false) || GA.group && _this.getConfig('ignore_on_group', false) || _this.getConfig('max_level', 0) === 0 || GA.level >= _this.getConfig('min_level', 0) && GA.level <= _this.getConfig('max_level', 0) && _this.getConfig('max_level', 0) > 0) &&
(GA.wish && _this.getConfig('ignore_on_wish', false) || GA.group && _this.getConfig('ignore_on_group', false) || GA.cost >= _this.getConfig('min_cost', 0) || GA.cost === 0) &&
(GA.wish && _this.getConfig('ignore_on_wish', false) || GA.group && _this.getConfig('ignore_on_group', false) || _this.getConfig('max_cost', 0) === 0 || GA.cost <= _this.getConfig('max_cost', 0)) &&
(GA.wish && _this.getConfig('ignore_on_wish', false) || GA.group && _this.getConfig('ignore_on_group', false) || _this.getConfig('points_reserve', 0) === 0 || ((_this.curr_value - GA.cost) >= _this.getConfig('points_reserve', 0)))
)
{
$.ajax({
url: _this.url + '/ajax.php',
method: 'POST',
dataType: 'json',
data: {
xsrf_token: _this.token,
do: 'entry_insert',
code: GA.code
},
success: function (data) {
if (data.type === 'success') {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.entered_in') + '|'+ GA.copies + 'x|' + GA.level + 'L|' + GA.cost + '$|' + GA.chance + '%|' + _this.logLink(GA.sgsteam, sgid) + '|  ' + _this.logLink(GA.link, GA.name) + _this.logBlack(sgid), 'enter');
}
else {
_this.log(Lang.get('service.entered_in') + _this.logLink(GA.link, GA.name) + _this.logBlack(sgid), 'enter');
}
_this.setValue(data.points);
GA.entered = true;
}
}
});
}
else {
if (sgown === 0 && _this.getConfig('log', true)) {
_this.log(Lang.get('service.skipped'), 'skip');
}
if (sgown !== 6) {
sgnext = 100;
}
}
sgcurr++;
setTimeout(processOne, sgnext);
}
processOne();
}
}
