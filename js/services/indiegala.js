'use strict';
class IndieGala extends Joiner {
constructor() {
super();
this.authContent = 'My Libraries';
this.websiteUrl = 'https://www.indiegala.com/giveaways';
this.authLink = 'https://www.indiegala.com/login';
this.settings.min_level = { type: 'number', trans: this.transPath('min_level'), min: 0, max: this.getConfig('max_level', 0), default: this.getConfig('min_level', 0) };
this.settings.max_level = { type: 'number', trans: this.transPath('max_level'), min: this.getConfig('min_level', 0), max: 8, default: this.getConfig('max_level', 0) };
this.settings.min_cost = { type: 'number', trans: this.transPath('min_cost'), min: 0, max: this.getConfig('max_cost', 0), default: this.getConfig('min_cost', 0) };
this.settings.max_cost = { type: 'number', trans: this.transPath('max_cost'), min: this.getConfig('min_cost', 0), max: 240, default: this.getConfig('max_cost', 0) };
this.settings.sort_by_level = { type: 'checkbox', trans: this.transPath('sort_by_level'), default: this.getConfig('sort_by_level', true) };
this.settings.check_in_steam = { type: 'checkbox', trans: this.transPath('check_in_steam'), default: this.getConfig('check_in_steam', true) };
this.settings.sound = { type: 'checkbox', trans: this.transPath('sound'), default: this.getConfig('sound', true) };
super.init();
}
authCheck(callback) {
let tmout = (Math.floor(Math.random() * 7000)) + 10000;
$.ajax({
url: 'https://www.indiegala.com',
timeout: tmout,
success: function () {
callback(1);
},
error: function () {
callback(-1);
}
});
}
getUserInfo(callback) {
let userData = {
avatar: __dirname + '/images/IndieGala.png',
username: 'IG User',
value: 0
};
let tmout = (Math.floor(Math.random() * 7000)) + 10000;
$.ajax({
url: 'https://www.indiegala.com/profile' + GJuser.ig,
timeout: tmout,
success: function (data) {
if (GJuser.ig !== '') {
data = $(data.replace(/<img/gi, '<noload'));
userData.avatar = data.find('.left.relative noload').attr('src');
userData.username = data.find('.pb-user-data-visible span.username-text').text();
userData.value = data.find('.pb-header-bottom-silver span.profile-silver-amount').text();
}
if (GJuser.ig === '') {
tmout = (Math.floor(Math.random() * 7000)) + 10000;
$.ajax({
url: 'https://www.indiegala.com/get_user_info',
timeout: tmout,
success: function (html) {
GJuser.ig = '?user_id=' + html.slice(29, 61);
}
});
}
},
complete: function (data) {
callback(userData);
}
});
}
joinService() {
let _this = this;
let page = 1;
_this.igcostmin = _this.getConfig('min_cost', 0);
_this.igcostmax = _this.getConfig('max_cost', 0);
_this.iglvlmin = _this.getConfig('min_level', 0);
_this.iglvlmax = _this.getConfig('max_level', 0);
_this.igsort = _this.getConfig('sort_by_level', true);
_this.lvl = _this.iglvlmax;
_this.check = 0;
_this.url = 'https://www.indiegala.com';
let callback = function () {
page++;
if (page <= _this.getConfig('pages', 1)) {
_this.enterOnPage(page, callback);
}
else {
if (_this.lvl > _this.iglvlmin && _this.igsort) {
_this.lvl = _this.lvl - 1;
page = 1;
_this.enterOnPage(page, callback);
}
}
};
_this.enterOnPage(page, callback);
}
enterOnPage(page, callback) {
let _this = this;
if (_this.check === 0) {
_this.check = 1;
let ptmout = (Math.floor(Math.random() * 7000)) + 10000;
$.ajax({
url: _this.url + '/profile',
timeout: ptmout,
success: function () {
$.ajax({
url: _this.url + '/giveaways/library_completed',
type: 'POST',
data: '{"list_type":"tocheck","page":1}',
dataType: 'json',
success: function () {
$.ajax({
url: _this.url + '/giveaways/check_if_won_all',
success: function (html) {
if (html.indexOf('Incapsula incident') >= 0) {
_this.log(_this.trans('captcha') + _this.logLink(_this.url + '/giveaways', 'captcha'), true);
_this.stopJoiner(true);
}
else {
let igwon = $(html).find('p').eq(1).text().trim();
if (igwon !== 'You did not win... :(') {
igwon = igwon.replace('Congratulations! You won','').replace('Giveaways','').trim();
_this.log(_this.logLink(_this.url + '/profile', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + igwon + ')'), true);
if (_this.getConfig('sound', true)) {
new Audio(__dirname + '/sounds/won.wav').play();
}
}
}
}
});
}
});
}
});
}
if (!_this.igsort) {
_this.lvl = 'All'
}
$.ajax({
url: _this.url + '/giveaways/ajax_data/list?page_param=' + page + '&order_type_param=expiry&order_value_param=asc&filter_type_param=level&filter_value_param=' + _this.lvl,
success: function (data) {
let tickets = $(JSON.parse(data).content).find('.tickets-col');
let igcurr = 0;
function giveawayEnter() {
if (tickets.length <= igcurr || !_this.started || _this.curr_value === 0) {
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
entered = false,
enterTimes = 0;
if (single) {
entered = ticket.find('.giv-coupon').length === 0;
}
else {
enterTimes = parseInt(ticket.find('.giv-coupon .palette-color-11').text());
entered = enterTimes > 0;
}
if (entered || _this.iglvlmax < level || _this.iglvlmin > level || _this.curr_value < price || price < _this.igcostmin || price > _this.igcostmax && _this.igcostmax > 0) {
ignext = 70;
}
else {
let id = ticket.find('.ticket-right .relative').attr('rel'),
igsteam = ticket.find('.giv-game-img').attr('data-src'),
name = ticket.find('h2 a').text(),
igown = 0,
igapp = 0,
igsub = 0,
igid = '???',
igstm = '';
if (igsteam.includes('apps/')) {
igapp = parseInt(igsteam.split('apps/')[1].split('/')[0].split('?')[0].split('#')[0]);
igid = 'app/' + igapp;
igstm = 'https://store.steampowered.com/app/' + igapp;
}
if (igsteam.includes('sub/')) {
igsub = parseInt(igsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
igid = 'sub/' + igsub;
igstm = 'https://store.steampowered.com/sub/' + igsub;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps.includes(',' + igapp + ',') && igapp > 0) {
igown = 1;
}
if (GJuser.ownsubs.includes(',' + igsub + ',') && igsub > 0) {
igown = 1;
}
}
if (igown === 0) {
$.ajax({
type: 'POST',
url: _this.url + '/giveaways/new_entry',
contentType: 'application/json; charset=utf-8',
dataType: 'json',
data: JSON.stringify({giv_id: id, ticket_price: price}),
success: function (data) {
if (data.status === 'ok') {
_this.setValue(data.new_amount);
_this.log(Lang.get('service.entered_in') + _this.logLink(_this.url + '/giveaways/detail/' + id, name) + ' - ' + _this.logLink(igstm, igid) + ' - ' + price + ' iC');
}
}
});
}
else {
ignext = 70;
}
}
igcurr++;
setTimeout(giveawayEnter, ignext);
}
giveawayEnter();
}
});
}
}
