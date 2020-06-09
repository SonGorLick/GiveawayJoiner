'use strict';
class GGP extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://ggplayers.com';
this.authLink = 'https://ggplayers.com/login/';
this.authContent = 'user-wrap';
this.settings.interval_from = { type: 'number', trans: 'service.interval_from', min: 10, max: this.getConfig('interval_to', 20), default: this.getConfig('interval_from', 15) };
this.settings.interval_to = { type: 'number', trans: 'service.interval_to', min: this.getConfig('interval_from', 15), max: 60, default: this.getConfig('interval_to', 20) };
this.settings.free_only = { type: 'checkbox', trans: 'service.free_only', default: this.getConfig('free_only', false) };
this.withValue = true;
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: dirapp + 'images/GGP.png',
username: 'GGP User',
value: 0
};
if (fs.existsSync(dirdata + 'ggp_account.txt')) {
let data = fs.readFileSync(dirdata + 'ggp_account.txt'),
dat = (data.toString()).split(',');
userData.value = dat[2];
}
if (GJuser.username !== 'GiveawayJoiner') {
userData.avatar = GJuser.avatar;
userData.username = GJuser.username;
}
callback(userData);
}
joinService() {
let _this = this;
let ggptimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = ggptimer;
let page = 1;
_this.ggporder = 0;
_this.url = 'https://ggplayers.com';
_this.pagemax = _this.getConfig('pages', 1);
if (fs.existsSync(dirdata + 'ggp_account.txt')) {
let ggpdata = fs.readFileSync(dirdata + 'ggp_account.txt'),
ggpd = (ggpdata.toString()).split(',');
_this.member = ggpd[0];
_this.email = ggpd[1];
if ((new Date()).getDate() !== _this.dcheck) {
$.ajax({
url: _this.url + '/members/' + _this.member,
success: function (ggps) {
ggps = $(ggps.replace(/<img/gi, '<noload'));
let points = ggps.find('.bb-user-content-wrap > .gamipress-buddypress-points > .gamipress-buddypress-competition-rewards.gamipress-buddypress-points-type > .gamipress-buddypress-user-competition-rewards.gamipress-buddypress-user-points.activity').text().trim();
fs.writeFile(dirdata + 'ggp_account.txt', _this.member + ',' + _this.email + ',' + points, (err) => { });
_this.setValue(points);
_this.dcheck = (new Date()).getDate();
}
});
}
}
else {
$.ajax({
url: _this.url + '/my-points/',
success: function (mmbr) {
mmbr = mmbr.replace(/<img/gi, '<noload');
_this.member = mmbr.substring(mmbr.indexOf('<a class="user-link" href="https://ggplayers.com/members/')+57,mmbr.indexOf('<span class="user-name">')).replace('">', '').trim();
$.ajax({
url: _this.url + '/members/' + _this.member + 'settings/',
success: function (mail) {
mail = mail.replace(/<img/gi, '<noload');
_this.email = mail.substring(mail.indexOf('name="email" id="email" value="')+31,mail.indexOf('<div class="info bp-feedback">')).replace('" class="settings-input"  autocapitalize="none"/>', '').trim();
fs.writeFile(dirdata + 'ggp_account.txt', _this.member + ',' + _this.email + ',0', (err) => { });
}
});
}
});
}
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
let data = 'err',
ggpurl = _this.url + '/giveaways/';
if (page > 1) {
ggpurl = ggpurl + 'page/' + page + '/';
}
$.ajax({
url: ggpurl,
success: function (datas) {
datas = datas.replace(/<img/gi, '<noload');
data = $(datas);
},
complete: function () {
let ggpfound = data.find('.bb-grid.site-content-grid > #primary > main > ul > li');
let ggpcurr = 0,
ggpcrr = 0,
ggparray = Array.from(Array(ggpfound.length).keys());
if (data === 'err') {
_this.pagemax = page;
_this.log(Lang.get('service.connection_error'), 'err');
}
function giveawayEnter() {
if (ggpfound.length === 0 || !_this.started) {
_this.pagemax = page;
}
if (ggparray.length <= ggpcurr || !_this.started) {
if (_this.started && page === _this.pagemax && _this.ggporder === 1) {
let finish = 'err';
$.ajax({
url: _this.url + '/checkout/',
success: function (checkout) {
checkout = checkout.replace(/<img/gi, '<noload');
finish = checkout.substring(checkout.indexOf('name="woocommerce-process-checkout-nonce" value="')+49,checkout.indexOf('</article>')).slice(0, 10);
},
complete: function () {
if (finish === 'err') {
_this.log(Lang.get('service.connection_error'), 'err');
}
else {
$.ajax({
method: 'POST',
url: _this.url + '/?wc-ajax=checkout',
data: {billing_email: _this.email, payment_method: 'gamipress_competition-rewards', terms: 'on', 'terms-field': 1, 'woocommerce-process-checkout-nonce': finish, _wp_http_referer: '%2F%3Fwc-ajax%3Dupdate_order_review'},
success: function () {
_this.log(Lang.get('service.done') + 'All orders purchased', 'enter');
fs.writeFile(dirdata + 'ggp_account.txt', _this.member + ',' + _this.email + ',' + _this.curr_value, (err) => { });
}
});
}
}
});
}
if (_this.getConfig('log', true)) {
setTimeout(() => {
if (page === _this.pagemax) {
if (ggpcurr < 16) {
_this.log(Lang.get('service.reach_end'), 'skip');
}
_this.log(Lang.get('service.checked') + page + '#-' + _this.getConfig('pages', 1) + '#', 'srch');
}
else {
_this.log(Lang.get('service.checked') + page + '#', 'srch');
}
}, 15000);
}
if (page === _this.pagemax && _this.started) {
setTimeout(() => {
_this.setStatus('good');
}, 15000);
}
if (callback) {
callback();
}
return;
}
let ggpnext = _this.interval(),
ggpcrr = ggparray[ggpcurr],
card = ggpfound.eq(ggpcrr),
card2 = card.find('a').eq(0),
link = card2.attr('href'),
name = card2.find('h2').text().trim(),
cost = card2.find('span > span').text().replace(' GG Points', ''),
enter = card.find('a').eq(1).text().trim(),
ggpown = 0;
if (cost === 'JOIN FOR FREE') {
cost = 0;
}
if (cost > _this.curr_value) {
ggpown = 2;
}
if (cost > 0 && _this.getConfig('free_only', false)) {
ggpown = 1;
}
if (enter === 'View winners') {
ggpown = 4;
_this.pagemax = page;
}
if (enter === 'Joined') {
ggpown = 3;
}
let ggplog = _this.logLink(link, name);
if (_this.getConfig('log', true) && ggpown !== 4) {
ggplog = '|' + page + '#|' + (ggpcrr + 1) + '№|' + cost + '$|  ' + ggplog;
_this.log(Lang.get('service.checking') + ggplog, 'chk');
switch (ggpown) {
case 1:
_this.log(Lang.get('service.skipped'), 'skip');
break;
case 2:
_this.log(Lang.get('service.points_low'), 'skip');
break;
case 3:
_this.log(Lang.get('service.already_joined'), 'jnd');
break;
}
}
if (ggpown === 0) {
let html = 'err';
$.ajax({
url: link,
success: function (htmls) {
htmls = htmls.replace(/<img/gi, '<noload');
html = htmls;
},
complete: function () {
if (html === 'err') {
ggpnext = 19000;
if (ggparray.filter(i => i === ggpcrr).length === 1) {
ggparray.push(ggpcrr);
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
else if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
else {
let lotid = html.substring(html.indexOf("<link rel='shortlink' href='https://ggplayers.com/?p=")+53,html.indexOf('<link rel="alternate" type="application/json+oembed"')).replace("' />", "").trim(),
lotenter = html.indexOf('>Participate<') >= 0,
lotcheck = 0;
lotid = parseInt(lotid);
if (lotenter) {
let random = Array.from(Array(300).keys());
for(let i = random.length - 1; i > 0; i--){
const j = Math.floor(Math.random() * i);
const temp = random[i];
random[i] = random[j];
random[j] = temp;
}
for (let i = 0; random.length >= i; i++) {
if (html.indexOf('Sold!">' + random[(i + 1)] + '<') < 0) {
lotcheck = random[(i + 1)];
i = 1000;
}
}
if (lotcheck > 0 && lotid > 0) {
let body = 'err';
$.ajax({
method: 'POST',
url: _this.url + '/?wc-ajax=wc_lottery_get_taken_numbers&selected_number=' + lotcheck + '&lottery_id=' + lotid + '&reserve_ticket=no',
success: function () {
body = 'ok';
},
complete: function () {
if (body === 'err') {
ggpnext = 19000;
if (ggparray.filter(i => i === ggpcrr).length === 1) {
ggparray.push(ggpcrr);
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
else if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
else {
let resp = 'err';
$.ajax({
method: 'POST',
url: link,
data: {lottery_tickets_number: lotcheck, quantity: 1, max_quantity: 0, 'add-to-cart': lotid},
success: function () {
resp = 'ok';
},
complete: function () {
if (resp === 'err') {
ggpnext = 19000;
if (ggparray.filter(i => i === ggpcrr).length === 1) {
ggparray.push(ggpcrr);
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
else if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
else {
_this.log(Lang.get('service.added') + ggplog + ' [' + lotcheck + 't]', 'info');
_this.curr_value = _this.curr_value - cost;
_this.setValue(_this.curr_value);
_this.ggporder = 1;
}
}
});
}
}
});
}
}
}
}
});
}
else {
ggpnext = 100;
}
ggpcurr++;
setTimeout(giveawayEnter, ggpnext);
}
giveawayEnter();
}
});
}
}
