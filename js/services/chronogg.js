'use strict';
class ChronoGG extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.chrono.gg';
this.authContent = '';
this.authLink = 'https://github.com/pumPCin/GiveawayJoiner/wiki/Chrono';
this.auth = Lang.get('service.wiki') + 'ChronoGG';
this.settings.intervalfrom = { type: 'number', trans: 'service.intervalfrom', min: 0, max: this.getConfig('intervalto', 0), default: this.getConfig('intervalfrom', 0) };
this.settings.intervalto = { type: 'number', trans: 'service.intervalto', min: this.getConfig('intervalfrom', 0), max: 360, default: this.getConfig('intervalto', 0) };
this.withValue = false;
delete this.settings.interval_from;
delete this.settings.interval_to;
delete this.settings.pages;
delete this.settings.check_in_steam;
delete this.settings.blacklist_on;
delete this.settings.sound;
super.init();
}
authCheck(callback) {
$.ajax({
url: 'https://www.chrono.gg',
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
avatar: dirapp + 'images/ChronoGG.png',
username: 'ChronoGG'
};
callback(userData);
}
joinService() {
let _this = this;
let chtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = chtimer;
if (_this.getConfig('intervalfrom', 0) === 0 || _this.getConfig('intervalto', 0) === 0) {
_this.dload = 0;
}
else {
if (_this.dload === 0 || _this.dload === ',') {
_this.dload = 1;
}
}
_this.churl = 'https://api.chrono.gg';
_this.url = 'https://www.chrono.gg';
_this.dcheck = true;
if (!fs.existsSync(dirdata + 'chronogg1.txt')) {
_this.log(Lang.get('service.dt_no') + '/giveawayjoinerdata/chronogg1.txt', 'err');
_this.stopJoiner(true);
}
let chcurr = _this.dload,
chnext = 7000;
function giveawayEnter() {
if (!_this.dcheck || !_this.started) {
if (!_this.started) {
_this.dload = 1;
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checked') + 'ChronoGG', 'srch');
}
return;
}
if (_this.dload > 0) {
_this.dload = _this.dload + 1;
_this.dcheck = false;
if (!fs.existsSync(dirdata + 'chronogg' + _this.dload + '.txt')) {
_this.dload = 1;
}
else {
let chtimer = (Math.floor(Math.random() * (_this.getConfig('intervalto', 0) - _this.getConfig('intervalfrom', 0))) + _this.getConfig('intervalfrom', 0));
_this.stimer = chtimer;
}
}
if (fs.existsSync(dirdata + 'chronogg' + chcurr + '.txt') && chcurr > 0) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.open_file') + 'chronogg' + chcurr + '.txt', 'info');
}
let chdata = fs.readFileSync(dirdata + 'chronogg' + chcurr + '.txt');
if (chdata.includes('JWT')) {
let chauth = chdata.toString();
rq({
method: 'GET',
url: _this.churl + '/account',
headers: {
'user-agent': _this.ua,
'origin': _this.url,
'accept-encoding': 'gzip, deflate, br',
'accept': 'application/json',
'authorization': chauth,
'referer': _this.url + '/',
}
})
.then((account) => {
let acc = account.data;
if (acc.status === 200) {
let chacc = acc.coins;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.acc') + acc.email + ':' + Lang.get('service.coins') + '- ' + chacc.balance);
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Daily Spin Coin', 'chk');
}
}
rq({
method: 'GET',
url: _this.churl + '/quest/spin',
headers: {
'user-agent': _this.ua,
'origin': _this.url,
'accept-encoding': 'gzip, deflate, br',
'accept': 'application/json',
'authorization': chauth,
'referer': _this.url + '/',
}
})
.then((spins) => {
let spin = spins.data,
chquest = spin.quest,
chchest = spin.chest,
chcoins = chquest.value + chquest.bonus;
if (chchest.base) {
chcoins = chcoins + chchest.base + chchest.bonus;
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.done') + Lang.get('service.coins') + '- ' + chcoins, 'enter');
}
else {
_this.log(Lang.get('service.acc') + acc.email + ': ' + Lang.get('service.done') + Lang.get('service.coins') + '- ' + chcoins, 'enter');
}
})
.catch((error) => {
if (_this.getConfig('log', true)) {
if (error.response) {
if (error.response.status === 420) {
_this.log(Lang.get('service.skip'), 'skip');
}
} else {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
});
})
.catch((error) => {
if (error.response) {
if (error.response.status === 401) {
_this.log(Lang.get('service.ses_not_found') + ' - ' + Lang.get('service.session_expired'), 'err');
}
} else {
_this.log(Lang.get('service.connection_error'), 'err');
}
});
}
else {
_this.log(Lang.get('service.dt_err') + '/giveawayjoinerdata/chronogg' + chcurr + '.txt', 'err');
}
}
else {
if (chcurr > 0) {
_this.dcheck = false;
}
}
chcurr++;
setTimeout(giveawayEnter, chnext);
}
giveawayEnter();
}
}
