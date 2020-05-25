'use strict';
class TF2R extends Joiner {
constructor() {
super();
this.domain = 'tf2r.com';
this.websiteUrl = 'https://tf2r.com';
this.authContent = 'Notifications';
this.authLink = 'https://tf2r.com/login';
this.settings.check_all = { type: 'checkbox', trans: 'service.check_all', default: this.getConfig('check_all', false) };
delete this.settings.pages;
delete this.settings.check_in_steam;
delete this.settings.blacklist_on;
super.init();
}
getUserInfo(callback) {
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
let tftimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = tftimer;
_this.dsave = ',';
_this.dload = ',';
if (fs.existsSync(dirdata + 'tf2r.txt')) {
let tfdata = fs.readFileSync(dirdata + 'tf2r.txt');
if (tfdata.length > 1) {
_this.dload = tfdata.toString();
}
}
_this.url = 'https://tf2r.com';
_this.won = _this.getConfig('won', 0);
if ((new Date()).getDate() !== _this.dcheck) {
$.ajax({
url: _this.url + '/notifications.html',
success: function (html) {
html = html.replace(/<img/gi, '<noload');
let tfprizes = $(html).find('#content .indent .notif'),
tfprize = '',
tfwon = 0;
_this.dcheck = (new Date()).getDate();
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
}, error: () => {}
});
}
$.ajax({
url: _this.url + '/raffles.html',
success: function (data) {
data = data.replace(/<img/gi, '<noload');
let giveaways = $(data).find('.pubrhead-text-right'),
tfcurr = 0,
tfcrr = 0,
tfarray = Array.from(Array(giveaways.length).keys());
function giveawayEnter() {
if (tfarray.length <= tfcurr || !_this.started) {
if (giveaways.length <= tfcurr) {
setTimeout(function () {
fs.writeFile(dirdata + 'tf2r.txt', _this.dsave, (err) => { });
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.data_saved'), 'info');
}
}, _this.interval());
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.reach_end'), 'skip');
_this.log(Lang.get('service.checked') + 'Public Raffles', 'srch');
}
if (_this.started) {
_this.setStatus('good');
}
return;
}
let tfnext = _this.interval(),
tfcrr = tfarray[tfcurr],
giveaway = giveaways.eq(tfcrr),
link = giveaway.find('a').attr('href'),
name = giveaway.find('a').text().trim(),
rid = link.replace('https://tf2r.com/k', '').replace('.html', '');
if (name.length === 0) {
name = '?????? ' + '(' + rid + ')';
}
let tflog = _this.logLink(link, name);
if (_this.getConfig('log', true)) {
tflog = '|' + (tfcrr + 1) + '№|  ' + tflog;
_this.log(Lang.get('service.checking') + tflog, 'chk');
}
if (!_this.dload.includes(rid + ',') || _this.getConfig('check_all', false)) {
$.ajax({
url: link,
success: function (data) {
data = data.replace(/<img/gi, '<noload');
let html = $('<div>' + data + '</div>'),
entered = html.find('#enbut').length === 0;
if (!entered) {
let tmout = Math.floor(tfnext / 2);
setTimeout(function () {
rq({
method: 'POST',
url: _this.url + '/job.php',
data: 'enterraffle=true&rid=' + rid + '&ass=yup,%20indeed',
headers: {
'User-Agent': _this.ua,
Cookie: _this.cookies
}
})
.then((bodys) => {
let body = bodys.data;
if (body.status === 'ok') {
_this.log(Lang.get('service.entered_in') + tflog, 'enter');
_this.dsave = _this.dsave + rid + ',';
}
else {
if (tfarray.filter(i => i === tfcrr).length === 1) {
tfarray.push(tfcrr);
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
else if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
})
.catch(() => {
tfnext = 59000;
if (tfarray.filter(i => i === tfcrr).length === 1) {
tfarray.push(tfcrr);
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
else if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.connection_error'), 'err');
}
});
}, tmout);
}
else {
tfnext = 100;
if (!_this.dsave.includes(rid + ',')) {
_this.dsave = _this.dsave + rid + ',';
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'), 'jnd');
}
}
},
error: function () {
tfnext = 59000;
if (tfarray.filter(i => i === tfcrr).length === 1) {
tfarray.push(tfcrr);
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
else if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
});
}
else {
tfnext = 100;
if (!_this.dsave.includes(rid + ',')) {
_this.dsave = _this.dsave + rid + ',';
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'), 'jnd');
_this.log(Lang.get('service.data_have'), 'skip');
}
}
tfcurr++;
setTimeout(giveawayEnter, tfnext);
}
giveawayEnter();
},
error: function () {
return;
}
});
}
}
