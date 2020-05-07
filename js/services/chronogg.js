'use strict';
class ChronoGG extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.chrono.gg';
this.authContent = '';
this.authLink = 'https://github.com/pumPCin/GiveawayJoiner/wiki/Chrono';
this.auth = Lang.get('service.wiki') + 'ChronoGG';
this.withValue = false;
delete this.settings.pages;
delete this.settings.check_in_steam;
delete this.settings.blacklist_on;
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
if (_this.getConfig('timer_to', 700) !== _this.getConfig('timer_from', 500)) {
let chtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = chtimer;
}
_this.churl = 'https://api.chrono.gg';
_this.url = 'https://www.chrono.gg';
let chcurr = 0;
_this.check = true;
function giveawayEnter() {
let chnext = _this.interval();
if (!_this.check || !_this.started) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checked') + 'ChronoGG', 'srch');
}
return;
}
if (fs.existsSync(dirdata + 'chronogg' + chcurr + '.txt') && chcurr > 0) {
let chauth = fs.readFileSync(dirdata + 'chronogg' + chcurr + '.txt').toString();
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.open_file') + 'chronogg' + chcurr + '.txt', 'info');
}
if (chauth.includes('JWT')) {
rq({
method: 'GET',
url: _this.churl + '/account',
headers: {
'user-agent': _this.ua,
'origin': _this.url,
'accept-encoding': 'gzip, deflate, br',
'accept': 'application/json',
'authorization': chauth,
'referer': _this.url,
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
setTimeout(function () {
rq({
method: 'GET',
url: _this.churl + '/quest/spin',
headers: {
'user-agent': _this.ua,
'origin': _this.url,
'accept-encoding': 'gzip, deflate, br',
'accept': 'application/json',
'authorization': chauth,
'referer': _this.url,
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
if (error.response) {
if (error.response.status === 420) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.skip'), 'skip');
}
}
} else if (error.request) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.connection_error'), 'err');
}
} else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
});
}, 1000);
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
})
.catch((error) => {
if (error.response) {
if (error.response.status === 401) {
_this.log(Lang.get('service.ses_not_found') + ' - ' + Lang.get('service.session_expired'), 'err');
}
} else if (error.request) {
_this.log(Lang.get('service.connection_error'), 'err');
} else {
_this.log(Lang.get('service.connection_error'), 'err');
}
});
}
else {
_this.log(Lang.get('service.dt_err'), 'err');
}
}
else {
if (chcurr > 0) {
_this.check = false;
if (chcurr === 1) {
fs.writeFile(dirdata + 'chronogg1.txt', '', (err) => { });
_this.log(Lang.get('service.dt_no') + '/giveawayjoinerdata/chronogg1.txt', 'err');
_this.stopJoiner(true);
}
}
}
chcurr++;
setTimeout(giveawayEnter, chnext);
}
giveawayEnter();
}
}
