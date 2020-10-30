'use strict';
class GGP extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://ggplayers.com';
this.authLink = 'https://ggplayers.com/login/';
this.authContent = 'Log Out';
this.settings.interval_from = { type: 'number', trans: 'service.interval_from', min: 10, max: this.getConfig('interval_to', 20), default: this.getConfig('interval_from', 15) };
this.settings.interval_to = { type: 'number', trans: 'service.interval_to', min: this.getConfig('interval_from', 15), max: 60, default: this.getConfig('interval_to', 20) };
this.settings.cost_only = { type: 'checkbox', trans: 'service.cost_only', default: this.getConfig('cost_only', false) };
this.settings.free_only = { type: 'checkbox', trans: 'service.free_only', default: this.getConfig('free_only', false) };
this.withValue = true;
this.setConfig('check_in_steam', false);
delete this.settings.check_in_steam;
delete this.settings.blacklist_on;
delete this.settings.sound;
super.init();
}
authCheck(callback) {
let html = 'err';
$.ajax({
url: 'https://ggplayers.com',
success: function (htmls) {
htmls = htmls.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
html = htmls;
},
complete: function () {
if (html === 'err') {
callback(-1);
}
else if (html.indexOf('Log Out') >= 0) {
if (!fs.existsSync(dirdata + 'ggp_acc.txt')) {
let mmbr = ($(html).find('[id="menu-item-60694"]')).find('a').attr('href');
fs.writeFile(dirdata + 'ggp_acc.txt', mmbr + ',0', (err) => { });
}
callback(1);
}
else {
callback(0);
}
}
});
}
getUserInfo(callback) {
let userData = {
avatar: '../app.asar/images/GGP.png',
username: 'GGP User',
value: 0
};
if (fs.existsSync(dirdata + 'ggp_acc.txt')) {
let data = fs.readFileSync(dirdata + 'ggp_acc.txt'),
dat = (data.toString()).split(',');
userData.value = dat[1];
}
if (GJuser.username !== 'User') {
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
_this.dload = 0;
_this.url = 'https://ggplayers.com';
_this.pagemax = _this.getConfig('pages', 1);
let gppdtnow = new Date();
gppdtnow.setDate(gppdtnow.getUTCDate());
gppdtnow.setHours(gppdtnow.getUTCHours() + 8);
let gppdnow = gppdtnow.getDate();
if (_this.dsave === ',') {
if (fs.existsSync(dirdata + 'ggp_acc.txt')) {
let ggpdata = fs.readFileSync(dirdata + 'ggp_acc.txt'),
ggpd = (ggpdata.toString()).split(',');
_this.dsave = ggpd[0];
page = 0;
}
}
else if (gppdnow !== _this.dcheck) {
page = 0;
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
ggpfound = '',
ggpurl = _this.url + '/giveaways/';
if (page > 1) {
ggpurl = ggpurl + 'page/' + page + '/';
}
else if (page === 0) {
ggpurl = _this.dsave;
}
$.ajax({
url: ggpurl,
success: function (datas) {
datas = datas.replace(/<img/gi, '<noload');
data = $(datas);
if (page === 0) {
let points = data.find('[class="activity gamipress-buddypress-user-points gamipress-buddypress-user-competition-rewards"]').text().trim();
fs.writeFile(dirdata + 'ggp_acc.txt', _this.dsave + ',' + points, (err) => { });
_this.setValue(points);
let gppdtnew = new Date();
gppdtnew.setDate(gppdtnew.getUTCDate());
gppdtnew.setHours(gppdtnew.getUTCHours() + 8);
_this.dcheck = gppdtnew.getDate();
}
else {
ggpfound = data.find('.container-wrapper > ul > li');
}
},
complete: function () {
let ggpcurr = 0,
ggpcrr = 0,
ggparray = Array.from(Array(ggpfound.length).keys());
if (data === 'err') {
_this.pagemax = page;
_this.log(Lang.get('service.connection_error'), 'err');
}
function giveawayEnter() {
if (ggpfound.length === 0 && page !== 0 || !_this.started) {
_this.pagemax = page;
}
if (ggparray.length <= ggpcurr || !_this.started) {
if (_this.started && page === _this.pagemax && _this.dload === 1) {
let finish = 'err',
email = 'err';
$.ajax({
url: _this.url + '/checkout/',
success: function (checkout) {
checkout = checkout.replace(/<img/gi, '<noload');
email = $(checkout).find('.woocommerce-input-wrapper > input').attr('value');
finish = checkout.substring(checkout.indexOf('name="woocommerce-process-checkout-nonce" value="')+49,checkout.indexOf('</article>')).slice(0, 10);
},
complete: function () {
if (finish === 'err' || email === 'err') {
_this.log(Lang.get('service.connection_error'), 'err');
}
else {
$.ajax({
method: 'POST',
url: _this.url + '/?wc-ajax=checkout',
data: {billing_email: email, payment_method: 'gamipress_competition-rewards', terms: 'on', 'terms-field': 1, 'woocommerce-process-checkout-nonce': finish, _wp_http_referer: '%2F%3Fwc-ajax%3Dupdate_order_review'},
success: function (bill) {
if (bill.result === 'success') {
_this.log(Lang.get('service.done') + 'All orders purchased', 'enter');
fs.writeFile(dirdata + 'ggp_acc.txt', _this.dsave + ',' + _this.curr_value, (err) => { });
}
else {
_this.log(Lang.get('service.connection_error'), 'err');
}
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
else if (page !== 0) {
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
if (
(cost > 0 && _this.getConfig('free_only', false)) ||
(cost === 0 && _this.getConfig('cost_only', false))
)
{
ggpown = 1;
}
if (enter === 'View winners' || _this.dsave === ',') {
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
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.added') + ggplog.replace('$|  ', '$|' + lotcheck + 't|  '), 'info');
}
else {
_this.log('[' + lotcheck + 't] ' + Lang.get('service.added') + ggplog, 'info');
}
_this.curr_value = _this.curr_value - cost;
_this.setValue(_this.curr_value);
_this.dload = 1;
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
ggpnext = 500;
}
ggpcurr++;
setTimeout(giveawayEnter, ggpnext);
}
giveawayEnter();
}
});
}
}
