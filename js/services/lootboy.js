'use strict';
class LootBoy extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.lootboy.de';
this.website = this.websiteUrl;
this.authContent = '';
this.authLink = 'https://github.com/pumPCin/GiveawayJoiner/wiki/LootBoy';
this.auth = Lang.get('service.wiki') + 'LootBoy';
this.settings.intervalfrom = { type: 'number', trans: 'service.intervalfrom', min: 0, max: this.getConfig('intervalto', 15), default: this.getConfig('intervalfrom', 10) };
this.settings.intervalto = { type: 'number', trans: 'service.intervalto', min: this.getConfig('intervalfrom', 10), max: 360, default: this.getConfig('intervalto', 15) };
this.settings.startfrom = { type: 'number', trans: 'service.startfrom', min: 1, max: 100, default: this.getConfig('startfrom', 1) };
this.setConfig('check_in_steam', false);
delete this.settings.interval_from;
delete this.settings.interval_to;
delete this.settings.pages;
delete this.settings.check_in_steam;
delete this.settings.blacklist_on;
delete this.settings.sound;
super.init();
}
authCheck(callback) {
setTimeout(() => {
callback(1);
}, 1000);
}
getUserInfo(callback) {
let userData = {
avatar: '../app.asar/images/LootBoy.png',
username: 'LootBoy'
};
callback(userData);
}
joinService() {
let _this = this;
let lbtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = lbtimer;
if (_this.getConfig('intervalfrom', 10) === 0 || _this.getConfig('intervalto', 15) === 0) {
_this.dload = 0;
}
else {
if (_this.dload === 0 || _this.dload === ',') {
_this.dload = 1;
}
}
let lbcurr = _this.dload,
lbua = _this.ua,
lbnext = 19000;
if (_this.getConfig('startfrom', 1) > 1) {
lbcurr = _this.getConfig('startfrom', 1);
_this.setConfig('startfrom', 1);
_this.reinitNumber('startfrom');
}
_this.lburl = 'https://api.lootboy.de';
_this.url = 'https://www.lootboy.de';
_this.dsave = 1;
_this.dcheck = true;
let lbregion = 'RU';
if (fs.existsSync(dirdata + 'lootboy_region.txt')) {
lbregion = fs.readFileSync(dirdata + 'lootboy_region.txt').toString().split('\n')[0];
}
if (!fs.existsSync(dirdata + 'lootboy1.txt')) {
_this.log(Lang.get('service.dt_no') + '../giveawayjoinerdata/lootboy1.txt', 'err');
_this.stopJoiner(true);
}
function giveawayEnter() {
if (!_this.dcheck || !_this.started) {
if (!_this.started) {
_this.dload = 1;
}
_this.log(Lang.get('service.checked') + 'LootBoy', 'srch');
if (_this.dsave === 1 && _this.started) {
if (_this.statusIcon.attr('data-status') === 'work') {
_this.setStatus('good');
}
}
return;
}
if (_this.dload > 0) {
_this.dload = _this.dload + 1;
_this.dcheck = false;
if (!fs.existsSync(dirdata + 'lootboy' + _this.dload + '.txt')) {
_this.dload = 1;
}
else {
_this.dsave = 0;
let lbtimer = (Math.floor(Math.random() * (_this.getConfig('intervalto', 15) - _this.getConfig('intervalfrom', 10))) + _this.getConfig('intervalfrom', 10));
_this.totalTicks = 1;
_this.stimer = lbtimer;
}
}
if (fs.existsSync(dirdata + 'lootboy' + lbcurr + '_ua.txt') && lbcurr > 0) {
lbua = fs.readFileSync(dirdata + 'lootboy' + lbcurr + '_ua.txt').toString().split('\n')[0];
}
else {
lbua = _this.ua;
}
if (fs.existsSync(dirdata + 'lootboy' + lbcurr + '.txt') && lbcurr > 0) {
_this.log(Lang.get('service.open_file') + 'lootboy' + lbcurr + '.txt', 'info');
if (lbua !== _this.ua) {
_this.log(lbua, 'skip');
}
let lbdata = fs.readFileSync(dirdata + 'lootboy' + lbcurr + '.txt').toString().split('\n')[0];
if (lbdata.includes(',Bearer')) {
let lbd = lbdata.split(','),
lbauth = lbd[0],
lbbrr = lbd[1],
stat = 'err';
rq({
method: 'GET',
url: _this.url,
headers: {
'authority': 'www.lootboy.de',
'accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9',
'user-agent': lbua,
'sec-fetch-site': 'none',
'sec-fetch-mode': 'navigate',
'sec-fetch-user': '?1',
'sec-fetch-dest': 'document',
},
responseType: 'document'
})
.then(() => {
})
.finally(() => {
rq({
method: 'GET',
url: _this.lburl + '/v2/users/' + lbauth,
headers: {
'authority': 'api.lootboy.de',
'Authorization': lbbrr,
'user-agent': lbua,
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': _this.url,
}
})
.then((stats) => {
stat = stats.data;
})
.finally(() => {
if (stat === 'err') {
_this.log(Lang.get('service.connection_error') + ' (' + Lang.get('service.ses_not_found') + '/' + Lang.get('service.session_expired').split(',')[0] + ')', 'err');
lbnext = 50000;
}
else {
lbnext = 19000;
let lblog = '';
if (!_this.getConfig('log', true)) {
lblog = Lang.get('service.acc') + stat.username + ': ';
}
_this.log(Lang.get('service.acc') + stat.username + ': ' + Lang.get('service.gems') + '- ' + stat.lootgemBalance + ',' + Lang.get('service.coins') + '- ' + stat.lootcoinBalance + ' [' + lbregion + ']', 'jnd');
let coin = 'err';
rq({
method: 'PUT',
url: _this.lburl + '/v2/users/self/appStart',
headers: {
'content-length': 0,
'authority': 'api.lootboy.de',
'Authorization': lbbrr,
'user-agent': lbua,
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': _this.url,
}
})
.then((coins) => {
coin = coins.data;
})
.finally(() => {
if (coin === 'err') {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Daily Claim', 'chk');
_this.log(Lang.get('service.err_offer'), 'err');
}
else if (coin.newLootcoinBalance - stat.lootcoinBalance > 0) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Daily Claim', 'chk');
_this.log(lblog + Lang.get('service.received') + Lang.get('service.coins') + '- ' + (coin.newLootcoinBalance - stat.lootcoinBalance), 'enter');
}
else {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Daily Claim', 'chk');
_this.log(Lang.get('service.skip'), 'skip');
}
});
let lbcomics = 'err';
rq({
method: 'GET',
url: _this.lburl + '/v1/comics?lang=en',
headers: {
'authority': 'api.lootboy.de',
'Authorization': lbbrr,
'user-agent': lbua,
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': _this.url + '/comics',
}
})
.then((comics) => {
lbcomics = comics.data;
})
.finally(() => {
if (lbcomics === 'err') {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Read Comics', 'chk');
_this.log(Lang.get('service.connection_error'), 'err');
}
else {
let lbreaded = 'err';
rq({
method: 'GET',
url: _this.lburl + '/v1/comics/readComics?lang=en',
headers: {
'authority': 'api.lootboy.de',
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'Authorization': lbbrr,
'user-agent': lbua,
'referer': _this.url + '/comics',
}
})
.then((readed) => {
lbreaded = JSON.stringify(readed.data);
})
.finally(() => {
if (lbreaded === 'err') {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Read Comics', 'chk');
_this.log(Lang.get('service.connection_error'), 'err');
}
else {
for (let i = 0; i < lbcomics.length; i++) {
lbcomics[i].have = lbreaded.includes(lbcomics[i].id);
}
lbcomics = lbcomics.filter(cmc => cmc.have === false);
if (lbcomics.length > 4) {
lbcomics.length = 4;
}
if (lbcomics.length === 0) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Read Comics', 'chk');
_this.log(Lang.get('service.no_offer') + 'Read Comics', 'skip');
}
else {
lbcomics.forEach(function(comic) {
let comread = 'err';
rq({
method: 'PUT',
url: _this.lburl + '/v1/comics/' + comic.id + '/read?lang=en',
headers: {
'content-length': 0,
'authority': 'api.lootboy.de',
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'Authorization': lbbrr,
'user-agent': lbua,
'referer': _this.url + '/comics/' + comic.id,
}
})
.then((comreads) => {
comread = comreads.data;
})
.finally(() => {
if (comread === 'err') {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Comics #' + comic.number + ' ' + comic.title, 'chk');
_this.log(Lang.get('service.err_offer'), 'err');
}
else if (comread.gotBonus) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Comics #' + comic.number + ' ' + comic.title, 'chk');
_this.log(lblog + Lang.get('service.received') + Lang.get('service.coins') + '- ' + comread.lootcoinBonus, 'enter');
}
else {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Comics #' + comic.number + ' ' + comic.title, 'chk');
_this.log(Lang.get('service.skip'), 'skip');
}
});
});
}
}
});
}
});
let lboffers = 'err';
rq({
method: 'GET',
url: _this.lburl + '/v1/offers?platform=web&lang=en',
headers: {
'authority': 'api.lootboy.de',
'Authorization': lbbrr,
'user-agent': lbua,
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': _this.url + '/offers',
}
})
.then((offers) => {
lboffers = offers.data;
})
.finally(() => {
if (lboffers === 'err') {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Diamonds Quests', 'chk');
_this.log(Lang.get('service.connection_error'), 'err');
}
else {
let lbtaken = 'err';
rq({
method: 'GET',
url: _this.lburl + '/v1/offers/taken?lang=en',
headers: {
'authority': 'api.lootboy.de',
'Authorization': lbbrr,
'user-agent': lbua,
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': _this.url + '/offers',
}
})
.then((taken) => {
lbtaken = JSON.stringify(taken.data.offers);
})
.finally(() => {
if (lbtaken === 'err') {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Diamonds Quests', 'chk');
_this.log(Lang.get('service.connection_error'), 'err');
}
else {
for (let i = 0; i < lboffers.length; i++) {
lboffers[i].have = lbtaken.includes(lboffers[i].id);
}
lboffers = lboffers.filter(off => off.have === false);
if (lboffers.length === 0) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Diamonds Quests', 'chk');
_this.log(Lang.get('service.no_offer') + 'Diamonds Quests', 'skip');
}
else {
lboffers.forEach(function(offer) {
let gem = 'err',
lbrega = ' = ' + JSON.stringify(offer.availableInCountries).replace(/"/g, ''),
lbregb = ' ≠ ' + JSON.stringify(offer.excludedCountries).replace(/"/g, '');
if (lbrega === ' = []') {
lbrega = '';
}
if (lbregb === ' ≠ []') {
lbregb = '';
}
if ((lbrega.includes(lbregion) || lbrega === '') && !lbregb.includes(lbregion)) {
rq({
method: 'PUT',
url: _this.lburl + '/v1/offers/' + offer.id + '?lang=en',
headers: {
'content-length': 0,
'authority': 'api.lootboy.de',
'Authorization': lbbrr,
'user-agent': lbua,
'content-type': 'application/json',
'origin': _this.url,
'sec-fetch-site': 'same-site',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': _this.url + '/offers',
}
})
.then((gems) => {
gem = gems.data;
})
.finally(() => {
if (gem === 'err') {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + offer.description.trim() + lbrega + lbregb, 'chk');
_this.log(Lang.get('service.err_offer'), 'err');
}
else if (!gem.alreadyTaken) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + offer.description.trim() + lbrega + lbregb, 'chk');
_this.log(lblog + Lang.get('service.received') + Lang.get('service.gems') + '- ' + offer.diamondBonus, 'enter');
}
else {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + offer.description.trim() + lbrega + lbregb, 'chk');
_this.log(Lang.get('service.skip'), 'skip');
}
});
}
else {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + offer.description.trim() + lbrega + lbregb, 'chk');
_this.log(Lang.get('service.skip_rg'), 'skip');
}
});
}
}
});
}
});
}
});
});
}
else {
_this.log(Lang.get('service.dt_err') + '../giveawayjoinerdata/lootboy' + lbcurr + '.txt', 'err');
}
}
else {
if (lbcurr > 0) {
_this.dcheck = false;
}
}
lbcurr++;
setTimeout(giveawayEnter, lbnext);
}
giveawayEnter();
}
}
