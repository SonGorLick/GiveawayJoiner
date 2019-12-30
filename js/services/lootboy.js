'use strict';
class LootBoy extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.lootboy.de';
this.authContent = 'Download the free app now';
this.authLink = 'https://github.com/pumPCin/GiveawayJoiner/wiki/LootBoy';
this.auth = Lang.get('service.wiki') + 'LootBoy';
this.settings.timer_from = { type: 'number', trans: 'service.timer_from', min: 5, max: this.getConfig('timer_to', 700), default: this.getConfig('timer_from', 500) };
this.settings.timer_to = { type: 'number', trans: 'service.timer_to', min: this.getConfig('timer_from', 500), max: 2880, default: this.getConfig('timer_to', 700) };
this.withValue = false;
delete this.settings.pages;
delete this.settings.check_in_steam;
delete this.settings.blacklist_on;
super.init();
}
authCheck(callback) {
$.ajax({
url: 'https://www.lootboy.de',
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
avatar: dirapp + 'images/LootBoy.png',
username: 'LootBoy'
};
callback(userData);
}
joinService() {
let _this = this;
if (_this.getConfig('timer_to', 700) !== _this.getConfig('timer_from', 500)) {
let lbtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = lbtimer;
}
_this.ua = mainWindow.webContents.session.getUserAgent();
_this.url = 'https://api.lootboy.de';
let lbcurr = 1;
_this.check = true;
function giveawayEnter() {
let lbnext = _this.interval();
if (!_this.check || !_this.started) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checked') + 'LootBoy', 'srch');
}
return;
}
if (fs.existsSync(dirdata + 'lootboy' + lbcurr + '.txt')) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.open_file') + 'lootboy' + lbcurr + '.txt', 'info');
}
let lbdata = fs.readFileSync(dirdata + 'lootboy' + lbcurr + '.txt');
if (lbdata.includes('Bearer')) {
let lbd = (lbdata.toString()).split(','),
lbauth = lbd[0],
lbbrr = lbd[1];
rq({
method: 'GET',
uri: _this.url + '/v2/users/' + lbauth,
headers: {
'accept': 'application/json',
'origin': 'https://www.lootboy.de',
'Authorization': lbbrr,
'user-agent': _this.ua,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'referer': 'https://www.lootboy.de',
},
json: true
})
.then((stat) => {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.acc') + stat.username + ' -' + Lang.get('service.gems') + stat.lootgemBalance + ',' + Lang.get('service.coins') + stat.lootcoinBalance);
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Daily Coins', 'chk');
}
rq({
method: 'GET',
uri: _this.url + '/v1/offers?lang=en',
headers: {
'accept': 'application/json',
'origin': 'https://www.lootboy.de',
'Authorization': lbbrr,
'user-agent': _this.ua,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'referer': 'https://www.lootboy.de/offers',
},
json: true
})
.then((offers) => {
rq({
method: 'PUT',
uri: _this.url + '/v2/users/self/appStart',
headers: {
'content-length': 0,
'accept': 'application/json',
'origin': 'https://www.lootboy.de',
'Authorization': lbbrr,
'user-agent': _this.ua,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'referer': 'https://www.lootboy.de/offers',
},
json: true
})
.then((coin) => {
if (stat.lootcoinBalance - coin.newLootcoinBalance > 0) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.done') + Lang.get('service.coins') + (stat.lootcoinBalance - coin.newLootcoinBalance), 'enter');
}
else {
_this.log(Lang.get('service.acc') + stat.username + ' - ' + Lang.get('service.done') + Lang.get('service.coins') + (stat.lootcoinBalance - coin.newLootcoinBalance), 'enter');
}
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.skip'), 'skip');
}
}
});
offers.forEach(function(offer) {
let tmout = Math.floor(Math.random() * Math.floor(lbnext / 10)) + Math.floor(lbnext / 5);
setTimeout(function () {
rq({
method: 'PUT',
uri: _this.url + '/v1/offers/' + offer.id + '?lang=en',
headers: {
'content-length': 0,
'accept': 'application/json',
'origin': 'https://www.lootboy.de',
'Authorization': lbbrr,
'user-agent': _this.ua,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'referer': 'https://www.lootboy.de/offers',
},
json: true
})
.then((gem) => {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + offer.description.trim(), 'chk');
}
if (!gem.alreadyTaken) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.done') + Lang.get('service.gems') + offer.diamondBonus, 'enter');
}
else {
_this.log(Lang.get('service.acc') + stat.username + ' - ' + Lang.get('service.done') + Lang.get('service.gems') + offer.diamondBonus, 'enter');
}
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.skip'), 'skip');
}
}
});
}, tmout);
});
});
})
.catch((err) => {
_this.log(Lang.get('service.ses_not_found'), 'err');
});
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.dt_err'), 'err');
}
}
}
else {
_this.check = false;
if (lbcurr === 1) {
fs.writeFile(dirdata + 'lootboy1.txt', '', (err) => { });
_this.log(Lang.get('service.dt_no') + '/giveawayjoinerdata/lootboy1.txt', 'err');
_this.stopJoiner(true);
}
}
lbcurr++;
setTimeout(giveawayEnter, lbnext);
}
giveawayEnter();
}
}
