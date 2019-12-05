'use strict';
class ChronoGG extends Joiner {
constructor() {
super();
this.settings.timer_to.default = 700;
this.settings.timer_from.default = 500;
this.websiteUrl = 'https://www.chrono.gg';
this.authContent = 'Coin Shop';
this.authLink = 'https://www.chrono.gg';
this.settings.log = { type: 'checkbox', trans: 'service.log', default: this.getConfig('log', true) };
this.settings.autostart = { type: 'checkbox', trans: 'service.autostart', default: this.getConfig('autostart', false) };
this.withValue = false;
delete this.settings.pages;
delete this.settings.interval_from;
delete this.settings.interval_to;
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
avatar: __dirname + '/images/ChronoGG.png',
username: 'ChronoGG'
};
callback(userData);
}
joinService() {
let _this = this;
_this.ua = mainWindow.webContents.session.getUserAgent();
_this.url = 'https://api.chrono.gg';
let chcurr = 1,
chnext = 1000;
_this.check = true;
function giveawayEnter() {
if (!_this.check || !_this.started) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checked') + 'ChronoGG', 'srch');
}
return;
}
if (fs.existsSync(storage.getDataPath().slice(0, -7) + 'chronogg' + chcurr + '.txt')) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.open_file') + ' /giveawayjoinerdata/chronogg' + chcurr + '.txt');
}
let chdata = fs.readFileSync(storage.getDataPath().slice(0, -7) + 'chronogg' + chcurr + '.txt');
if (chdata.includes('JWT')) {
let chauth = chdata.toString();
rq({
method: 'GET',
uri: _this.url + '/account',
headers: {
'accept': 'application/json',
'origin': 'https://www.chrono.gg',
'Authorization': chauth,
'user-agent': _this.ua,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'referer': 'https://www.chrono.gg/shop',
},
json: true
})
.then((acc) => {
if (acc.status === 200) {
let chacc = acc.coins;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + acc.email + '  |' + _this.trans('spins') + chacc.spins + '|' + _this.trans('legendaries') + chacc.legendaries + '|' + _this.trans('balance') + chacc.balance + '|', 'skip');
}
}
rq({
method: 'GET',
uri: _this.url + '/quest/spin',
headers: {
'accept': 'application/json',
'origin': 'https://www.chrono.gg',
'Authorization': chauth,
'user-agent': _this.ua,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'referer': 'https://www.chrono.gg/?a=default',
},
json: true
})
.then((spin) => {
let chquest = spin.quest;
let chchest = spin.chest;
if (!chchest.base) {
_this.log(acc.email + '  |' + _this.trans('quest') + (chquest.value + chquest.bonus) + '|' + _this.trans('total') + (acc.coins.balance + chquest.value + chquest.bonus) + '|', 'enter');
}
else {
_this.log(acc.email + '  |' + _this.trans('quest') + (chquest.value + chquest.bonus) + '|' + _this.trans('chest') + (chchest.base + chchest.bonus) + '|' + _this.trans('streak') + chchest.kind + '|' + _this.trans('total') + (acc.coins.balance + chquest.value + chquest.bonus + chchest.base + chchest.bonus) + '|', 'enter');
}
})
.catch((err) => {
if (_this.getConfig('log', true)) {
if (err.statusCode === 420) {
_this.log(_this.trans('spinned'), 'skip');
}
if (err.statusCode === 401) {
_this.log(Lang.get('service.session_expired'), 'err');
}
}
});
});
}
else {
if (_this.getConfig('log', true)) {
_this.log(_this.trans('jwt_err'), 'err');
}
}
}
else {
_this.check = false;
if (chcurr === 1) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.open_file') + ' /giveawayjoinerdata/chronogg1.txt');
_this.log(Lang.get('service.file_not_found'), 'err');
}
_this.stopJoiner(true);
}
}
chcurr++;
setTimeout(giveawayEnter, chnext);
}
giveawayEnter();
}
}
