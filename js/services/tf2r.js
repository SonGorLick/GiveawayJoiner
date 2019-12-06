'use strict';
class TF2R extends Joiner {
constructor() {
super();
this.domain = 'tf2r.com';
this.websiteUrl = 'http://tf2r.com';
this.authContent = 'Notifications';
this.authLink = 'http://tf2r.com/login';
this.settings.rnd = { type: 'checkbox', trans: 'service.rnd', default: this.getConfig('rnd', false) };
this.settings.autostart = { type: 'checkbox', trans: 'service.autostart', default: this.getConfig('autostart', false) };
this.settings.log = { type: 'checkbox', trans: 'service.log', default: this.getConfig('log', true) };
this.withValue = false;
this.getTimeout = 10000;
delete this.settings.pages;
super.init();
}
authCheck(callback) {
let authContent = this.authContent;
this.ajaxReq(this.websiteUrl, (response) => {
if (response.success) {
if (response.data.indexOf(authContent) >= 0) {
callback(1);
}
else {
callback(0);
}
}
else {
callback(-1);
}
});
}
getUserInfo(callback) {
if (GJuser.tf.length > 301) {
GJuser.tf = ',';
}
let userData = {
avatar: __dirname + '/images/TF2R.png',
username: 'TF2R User'
};
this.ajaxReq('http://tf2r.com/notifications.html', (response) => {
if (response.success) {
userData.username = $(response.data).find('#nameho').text();
userData.avatar = $(response.data).find('#avatar a noload').attr('src');
}
callback(userData);
});
}
joinService() {
let _this = this;
if (_this.getConfig('timer_to', 70) !== _this.getConfig('timer_from', 50)) {
let tftimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 70) - _this.getConfig('timer_from', 50))) + _this.getConfig('timer_from', 50));
_this.stimer = tftimer;
}
_this.url = 'http://tf2r.com';
_this.ajaxReq(_this.url + '/raffles.html', (response) => {
let giveaways = $(response.data).find('.pubrhead-text-right');
let tfcurr = 0;
let random = Array.from(Array(giveaways.length).keys());
if (_this.getConfig('rnd', true)) {
for(let i = random.length - 1; i > 0; i--){
const j = Math.floor(Math.random() * i);
const temp = random[i];
random[i] = random[j];
random[j] = temp;
}
}
function giveawayEnter() {
if (giveaways.length <= tfcurr || !_this.started) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.reach_end'), 'skip');
_this.log(Lang.get('service.checked') + 'Public Raffles', 'srch');
}
return;
}
let tfrnd = random[tfcurr],
giveaway = giveaways.eq(tfrnd),
link = giveaway.find('a').attr('href'),
name = giveaway.find('a').text(),
rid = link.replace('http://tf2r.com/k', '').replace('.html', '');
_this.ajaxReq(link, (response) => {
if (response.success) {
let html = $('<div>' + response.data + '</div>');
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + (tfrnd + 1) + '№|  ' + _this.logLink(link, name), 'chk');
}
let entered = html.find('#enbut').length === 0;
if (entered || GJuser.tf.includes(rid + ',')) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'), 'skip');
}
return;
}
rq({
method: 'POST',
uri: _this.url + '/job.php',
form: {
enterraffle: 'true',
rid: rid,
ass: 'yup, indeed'
},
headers: {
'User-Agent': mainWindow.webContents.session.getUserAgent(),
Cookie: _this.cookies
},
json: true
})
.then((body) => {
if (body.status === 'ok') {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.entered_in') + '|' + (tfrnd + 1) + '№|  ' + _this.logLink(link, name), 'enter');
}
else {
_this.log(Lang.get('service.entered_in') + _this.logLink(link, name), 'enter');
}
GJuser.tf = GJuser.tf + rid + ',';
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
});
}
});
tfcurr++;
setTimeout(giveawayEnter, _this.interval());
}
giveawayEnter();
});
}
ajaxReq(url, callback) {
let response = {
success: false,
data: ''
};
$.ajax({
url: url,
timeout: this.getTimeout,
success: function (html) {
response.success = true;
html = html.replace(/<img/gi, '<noload');
response.data = html;
},
error: function (error) {
if (error.responseText !== undefined && error.responseText.indexOf('!DOCTYPE') >= 0) {
response.success = true;
response.data = error.responseText;
}
},
complete: function () {
callback(response);
}
});
}
}
