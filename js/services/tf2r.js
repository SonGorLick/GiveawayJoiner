'use strict';
class TF2R extends Joiner {
constructor() {
super();
this.domain = 'tf2r.com';
this.websiteUrl = 'http://tf2r.com';
this.authContent = 'Notifications';
this.authLink = 'http://tf2r.com/login';
this.settings.timer_from = { type: 'number', trans: 'service.timer_from', min: 5, max: this.getConfig('timer_to', 700), default: this.getConfig('timer_from', 500) };
this.settings.timer_to = { type: 'number', trans: 'service.timer_to', min: this.getConfig('timer_from', 500), max: 2880, default: this.getConfig('timer_to', 700) };
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
if (fs.existsSync(storage.getDataPath().slice(0, -7) + 'tf2r.txt')) {
let tfdata = fs.readFileSync(storage.getDataPath().slice(0, -7) + 'tf2r.txt');
if (tfdata.length > 1 && tfdata.length < 4000) {
GJuser.tf = tfdata.toString();
}
}
}
let userData = {
avatar: __dirname + '/images/TF2R.png',
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
_this.url = 'http://tf2r.com';
_this.ua = mainWindow.webContents.session.getUserAgent();
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
fs.writeFile(storage.getDataPath().slice(0, -7) + 'tf2r.txt', GJuser.tf, (err) => { });
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
name = giveaway.find('a').text(),
rid = link.replace('http://tf2r.com/k', '').replace('.html', '');
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + (tfrnd + 1) + '№|  ' + _this.logLink(link, name), 'chk');
}
if (!GJuser.tf.includes(rid + ',')) {
$.ajax({
url: link,
success: function (data) {
data = data.replace(/<img/gi, '<noload');
let html = $('<div>' + data + '</div>'),
entered = html.find('#enbut').length === 0;
if (!entered) {
let tmout = Math.floor(Math.random() * Math.floor(tfnext / 10)) + Math.floor(tfnext / 5);
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
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.entered_in') + '|' + (tfrnd + 1) + '№|  ' + _this.logLink(link, name), 'enter');
}
else {
_this.log(Lang.get('service.entered_in') + _this.logLink(link, name), 'enter');
}
GJuser.tf = GJuser.tf + rid + ',';
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
GJuser.tf = GJuser.tf + rid + ',';
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
