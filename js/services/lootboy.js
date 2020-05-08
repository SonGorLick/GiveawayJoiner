'use strict';
class LootBoy extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.lootboy.de';
this.authContent = '';
this.authLink = 'https://github.com/pumPCin/GiveawayJoiner/wiki/LootBoy';
this.auth = Lang.get('service.wiki') + 'LootBoy';
this.withValue = false;
delete this.settings.pages;
delete this.settings.check_in_steam;
delete this.settings.blacklist_on;
super.init();
}
authCheck(callback) {
callback(1);
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
_this.lburl = 'https://api.lootboy.de';
_this.url = 'https://www.lootboy.de';
_this.check = true;
let lbcurr = 0,
lbua = _this.ua;
function giveawayEnter() {
let lbnext = _this.interval();
if (!_this.check || !_this.started) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checked') + 'LootBoy', 'srch');
}
return;
}
lbua = _this.ua;
if (fs.existsSync(dirdata + 'lootboy' + lbcurr + '_ua.txt') && lbcurr > 0) {
lbua = fs.readFileSync(dirdata + 'lootboy' + lbcurr + '_ua.txt').toString();
}
if (fs.existsSync(dirdata + 'lootboy' + lbcurr + '.txt') && lbcurr > 0) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.open_file') + 'lootboy' + lbcurr + '.txt', 'info');
if (lbua !== _this.ua) {
_this.log(lbua, 'skip');
}
}
let lbdata = fs.readFileSync(dirdata + 'lootboy' + lbcurr + '.txt');
if (lbdata.includes('Bearer') && lbdata.includes(',')) {
let lbd = (lbdata.toString()).split(','),
lbauth = lbd[0],
lbbrr = lbd[1];
rq({
method: 'GET',
uri: _this.lburl + '/v2/users/' + lbauth,
headers: {
'pragma': 'no-cache',
'cache-control': 'no-cache',
'accept': 'application/json',
'origin': _this.url,
'Authorization': lbbrr,
'user-agent': lbua,
'referer': _this.url,
},
json: true
})
.then((stat) => {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.acc') + stat.username + ':' + Lang.get('service.gems') + '- ' + stat.lootgemBalance + ',' + Lang.get('service.coins') + '- ' + stat.lootcoinBalance);
}
rq({
method: 'PUT',
uri: _this.lburl + '/v2/users/self/appStart',
headers: {
'pragma': 'no-cache',
'cache-control': 'no-cache',
'content-length': 0,
'accept': 'application/json',
'origin': _this.url,
'Authorization': lbbrr,
'user-agent': lbua,
'referer': _this.url,
},
json: true
})
.then((coin) => {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Daily Coins', 'chk');
}
if (coin.newLootcoinBalance - stat.lootcoinBalance > 0) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.done') + Lang.get('service.coins') + '- ' + (coin.newLootcoinBalance - stat.lootcoinBalance), 'enter');
}
else {
_this.log(Lang.get('service.acc') + stat.username + ': ' + Lang.get('service.done') + Lang.get('service.coins') + '- ' + (coin.newLootcoinBalance - stat.lootcoinBalance), 'enter');
}
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.skip'), 'skip');
}
}
});
rq({
method: 'GET',
uri: _this.lburl + '/v1/offers?lang=en',
headers: {
'pragma': 'no-cache',
'cache-control': 'no-cache',
'accept': 'application/json',
'origin': _this.url,
'Authorization': lbbrr,
'user-agent': lbua,
'referer': _this.url + '/offers',
},
json: true
})
.then((offers) => {
let lboffers = offers;
rq({
method: 'GET',
uri: _this.lburl + '/v1/offers/taken?lang=en',
headers: {
'pragma': 'no-cache',
'cache-control': 'no-cache',
'accept': 'application/json',
'origin': _this.url,
'Authorization': lbbrr,
'user-agent': lbua,
'referer': _this.url + '/offers',
},
json: true
})
.then((taken) => {
let lbtaken = JSON.stringify(taken.offers);
for (let i = 0; i < lboffers.length; i++) {
lboffers[i].have = lbtaken.includes(lboffers[i].id);
}
lboffers = lboffers.filter(off => off.have === false);
if (lboffers.length === 0) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.no_offer') + 'Diamonds Quests', 'cant');
}
}
else {
lboffers.forEach(function(offer) {
let tmout = Math.floor(lbnext / 4);
setTimeout(function () {
rq({
method: 'PUT',
uri: _this.lburl + '/v1/offers/' + offer.id + '?lang=en',
headers: {
'pragma': 'no-cache',
'cache-control': 'no-cache',
'content-length': 0,
'accept': 'application/json',
'origin': _this.url,
'Authorization': lbbrr,
'user-agent': lbua,
'referer': _this.url + '/offers',
},
json: true
})
.then((gem) => {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + offer.description.trim(), 'chk');
}
if (!gem.alreadyTaken) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.done') + Lang.get('service.gems') + '- ' + offer.diamondBonus, 'enter');
}
else {
_this.log(Lang.get('service.acc') + stat.username + ': ' + Lang.get('service.done') + Lang.get('service.gems') + '- ' + offer.diamondBonus, 'enter');
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
}
});
});
rq({
method: 'GET',
uri: _this.lburl + '/v1/comics?lang=en',
headers: {
'pragma': 'no-cache',
'cache-control': 'no-cache',
'accept': 'application/json',
'origin': _this.url,
'Authorization': lbbrr,
'user-agent': lbua,
'referer': _this.url + '/comics',
},
json: true
})
.then((comics) => {
let lbcomics = comics;
rq({
method: 'GET',
uri: _this.lburl + '/v1/comics/readComics?lang=en',
headers: {
'pragma': 'no-cache',
'cache-control': 'no-cache',
'accept': 'application/json',
'origin': _this.url,
'Authorization': lbbrr,
'user-agent': lbua,
'referer': _this.url + '/comics',
},
json: true
})
.then((readed) => {
let lbreaded = JSON.stringify(readed);
for (let i = 0; i < lbcomics.length; i++) {
lbcomics[i].have = lbreaded.includes(lbcomics[i].id);
}
lbcomics = lbcomics.filter(cmc => cmc.have === false);
if (lbcomics.length > 4) {
lbcomics.length = 4;
}
if (lbcomics.length === 0) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.no_offer') + 'Read Comics', 'cant');
}
}
else {
lbcomics.forEach(function(comic) {
rq({
method: 'PUT',
uri: _this.lburl + '/v1/comics/' + comic.id + '/read?lang=en',
headers: {
'pragma': 'no-cache',
'cache-control': 'no-cache',
'content-length': 0,
'accept': 'application/json',
'origin': _this.url,
'Authorization': lbbrr,
'user-agent': lbua,
'referer': _this.url + '/comics/' + comic.id,
},
json: true
})
.then((comread) => {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Comics #' + comic.number + ' ' + comic.title, 'chk');
}
if (comread.gotBonus) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.done') + Lang.get('service.coins') + '- ' + comread.lootcoinBonus, 'enter');
}
else {
_this.log(Lang.get('service.acc') + stat.username + ': ' + Lang.get('service.coins') + '- ' + comread.lootcoinBonus, 'enter');
}
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.skip'), 'skip');
}
}
});
});
}
});
});
})
.catch((err) => {
_this.log(Lang.get('service.ses_not_found') + ' - ' + Lang.get('service.session_expired'), 'err');
});
}
else {
_this.log(Lang.get('service.dt_err'), 'err');
}
}
else {
if (lbcurr > 0) {
_this.check = false;
if (lbcurr === 1) {
fs.writeFile(dirdata + 'lootboy1.txt', '', (err) => { });
_this.log(Lang.get('service.dt_no') + '/giveawayjoinerdata/lootboy1.txt', 'err');
_this.stopJoiner(true);
}
}
}
lbcurr++;
setTimeout(giveawayEnter, lbnext);
}
giveawayEnter();
}
}
