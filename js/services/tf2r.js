'use strict';
class TF2R extends Joiner {
constructor() {
super();
this.domain = 'tf2r.com';
this.websiteUrl = 'https://tf2r.com';
this.authContent = 'Notifications';
this.authLink = 'https://tf2r.com/login';
this.settings.check_all = { type: 'checkbox', trans: 'service.check_all', default: this.getConfig('check_all', false) };
this.settings.sound = { type: 'checkbox', trans: 'service.sound', default: this.getConfig('sound', true) };
this.settings.rnd = { type: 'checkbox', trans: 'service.rnd', default: this.getConfig('rnd', false) };
this.withValue = false;
this.getTimeout = 10000;
delete this.settings.pages;
delete this.settings.check_in_steam;
delete this.settings.blacklist_on;
super.init();
}
getUserInfo(callback) {
if (GJuser.tf === '') {
GJuser.tf = ',';
if (fs.existsSync(dirdata + 'tf2r.txt')) {
let tfdata = fs.readFileSync(dirdata + 'tf2r.txt');
if (tfdata.length > 1 && tfdata.length < 4000) {
GJuser.tf = tfdata.toString();
}
}
}
let userData = {
avatar: dirapp + 'images/TF2R.png',
username: 'TF2R User'
};
if (GJuser.username !== 'GiveawayJoiner') {
userData.avatar = GJuser.avatar;
userData.username = GJuser.username;
}
callback(userData);
}
joinService() {
let _this = this;
if (_this.getConfig('timer_to', 700) !== _this.getConfig('timer_from', 500)) {
let tftimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = tftimer;
}
_this.url = 'https://tf2r.com';
_this.won = _this.getConfig('won', 0);
_this.ua = mainWindow.webContents.session.getUserAgent();
$.ajax({
url: _this.url + '/notifications.html',
success: function (html) {
html = html.replace(/<img/gi, '<noload');
let tfprizes = $(html).find('#content .indent .notif'),
tfprize = '',
tfwon = 0;
if (tfprizes === undefined) {
tfprizes = '';
}
for (let tfi = 0; tfi < tfprizes.length; tfi++) {
tfprize = tfprizes.eq(tfi).text().trim();
if (!tfprize.includes('sadly you didnt win')) {
tfwon++;
}
}
if (tfwon < _this.won) {
_this.setConfig('won', tfwon);
}
if (tfwon > 0 && tfwon > _this.won) {
_this.log(_this.logLink(_this.url + '/notifications.html', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + (tfwon - _this.won) + ')'), 'win');
_this.setStatus('win');
_this.setConfig('won', tfwon);
if (_this.getConfig('sound', true)) {
new Audio(dirapp + 'sounds/won.wav').play();
}
}
}
});
$.ajax({
url: _this.url + '/raffles.html',
success: function (data) {
data = data.replace(/<img/gi, '<noload');
let giveaways = $(data).find('.pubrhead-text-right'),
tfcurr = 0,
random = Array.from(Array(giveaways.length).keys());
if (_this.getConfig('rnd', false)) {
for(let i = random.length - 1; i > 0; i--){
const j = Math.floor(Math.random() * i);
const temp = random[i];
random[i] = random[j];
random[j] = temp;
}
}
function giveawayEnter() {
if (giveaways.length <= tfcurr || !_this.started) {
if (giveaways.length <= tfcurr) {
setTimeout(function () {
fs.writeFile(dirdata + 'tf2r.txt', GJuser.tf, (err) => { });
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.data_saved'), 'info');
}
}, _this.interval());
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.reach_end'), 'skip');
_this.log(Lang.get('service.checked') + 'Public Raffles', 'srch');
}
return;
}
let tfnext = _this.interval(),
tfrnd = random[tfcurr],
giveaway = giveaways.eq(tfrnd),
link = giveaway.find('a').attr('href'),
name = giveaway.find('a').text().trim(),
rid = link.replace('https://tf2r.com/k', '').replace('.html', '');
if (name.length === 0) {
name = '?????? ' + '(' + rid + ')';
}
let tflog = _this.logLink(link, name);
if (_this.getConfig('log', true)) {
tflog = '|' + (tfrnd + 1) + '№|  ' + tflog;
_this.log(Lang.get('service.checking') + tflog, 'chk');
}
if (!GJuser.tf.includes(rid + ',') && !_this.getConfig('check_all', false)) {
$.ajax({
url: link,
success: function (data) {
data = data.replace(/<img/gi, '<noload');
let html = $('<div>' + data + '</div>'),
entered = html.find('#enbut').length === 0;
if (!entered) {
let tmout = Math.floor(tfnext / 4);
setTimeout(function () {
rq({
method: 'POST',
uri: _this.url + '/job.php',
form: {
enterraffle: 'true',
rid: rid,
ass: 'yup, indeed'
},
headers: {
'User-Agent': _this.ua,
Cookie: _this.cookies
},
json: true
})
.then((body) => {
if (body.status === 'ok') {
_this.log(Lang.get('service.entered_in') + tflog, 'enter');
if (!GJuser.tf.includes(',' + rid + ',')) {
GJuser.tf = GJuser.tf + rid + ',';
}
}
else {
tfnext = 100;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
});
}, tmout);
}
else {
tfnext = 100;
if (!GJuser.tf.includes(',' + rid + ',')) {
GJuser.tf = GJuser.tf + rid + ',';
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'), 'jnd');
}
}
}
});
}
else {
tfnext = 100;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'), 'jnd');
_this.log(Lang.get('service.data_have'), 'skip');
}
}
tfcurr++;
setTimeout(giveawayEnter, tfnext);
}
giveawayEnter();
}
});
}
}
