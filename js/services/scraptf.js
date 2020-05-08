'use strict';
class ScrapTF extends Joiner {
constructor() {
super();
this.domain = 'scrap.tf';
this.websiteUrl = 'https://scrap.tf';
this.authContent = 'My Auctions';
this.authLink = 'https://scrap.tf/login';
this.settings.timer_from = { type: 'number', trans: 'service.timer_from', min: 5, max: this.getConfig('timer_to', 90), default: this.getConfig('timer_from', 70) };
this.settings.timer_to = { type: 'number', trans: 'service.timer_to', min: this.getConfig('timer_from', 70), max: 2880, default: this.getConfig('timer_to', 90) };
this.settings.interval_from = { type: 'number', trans: 'service.interval_from', min: 10, max: this.getConfig('interval_to', 15), default: this.getConfig('interval_from', 10) };
this.settings.interval_to = { type: 'number', trans: 'service.interval_to', min: this.getConfig('interval_from', 10), max: 60, default: this.getConfig('interval_to', 15) };
this.settings.sort_by_end = { type: 'checkbox', trans: this.transPath('sort_by_end'), default: this.getConfig('sort_by_end', false) };
this.settings.sound = { type: 'checkbox', trans: 'service.sound', default: this.getConfig('sound', true) };
this.settings.rnd = { type: 'checkbox', trans: 'service.rnd', default: this.getConfig('rnd', false) };
this.withValue = false;
delete this.settings.check_in_steam;
delete this.settings.blacklist_on;
super.init();
}
authCheck(callback) {
let call = -1;
rq({
method: 'GET',
url: 'https://scrap.tf',
headers: {
'authority': 'scrap.tf',
'user-agent': this.ua,
'sec-fetch-site': 'none',
'sec-fetch-mode': 'navigate',
'sec-fetch-user': '?1',
'sec-fetch-dest': 'document',
'cookie': this.cookies
},
responseType: 'document'
})
.then((htmls) => {
let html = htmls.data;
html = html.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
if (html.indexOf('My Auctions') >= 0) {
call = 1;
}
else {
call = 0;
}
})
.finally(() => {
callback(call);
});
}
getUserInfo(callback) {
let userData = {
avatar: dirapp + 'images/ScrapTF.png',
username: 'ScrapTF User'
};
if (GJuser.username !== 'GiveawayJoiner') {
userData.avatar = GJuser.avatar;
userData.username = GJuser.username;
}
callback(userData);
}
joinService() {
let _this = this;
if (_this.getConfig('timer_to', 90) !== _this.getConfig('timer_from', 70)) {
let sptimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 90) - _this.getConfig('timer_from', 70))) + _this.getConfig('timer_from', 70));
_this.stimer = sptimer;
}
_this.url = 'https://scrap.tf';
let page = 1;
_this.spurl = '';
if (_this.getConfig('sort_by_end', false)) {
_this.spurl = '/ending';
_this.sort = 1;
}
else {
_this.sort = 0;
}
_this.lastid = '';
_this.won = _this.getConfig('won', 0);
_this.pagemax = _this.getConfig('pages', 1);
let callback = function () {
page++;
if (page <= _this.pagemax) {
_this.enterOnPage(page, callback);
}
};
this.enterOnPage(page, callback);
}
enterOnPage(page, callback) {
let _this = this;
GJuser.sp = ',';
let spurl = _this.url + '/raffles' + _this.spurl,
spreferer = _this.url + '/',
spdata = '',
sporig = '',
spmode = 'navigate',
spuser = '?1',
spdest = 'document',
sptype = 'GET',
sprtype = spdest;
if (page !== 1) {
spurl = _this.url + '/ajax/raffles/Paginate';
spdata = 'start=' + _this.lastid + '&sort=' + _this.sort + '&puzzle=0&csrf=' + _this.csrf;
spreferer = _this.url + '/raffles' + _this.spurl;
sporig = _this.url;
spmode = 'cors';
spuser = '';
spdest = 'empty';
sptype = 'POST';
sprtype = 'json';
}
rq({
method: sptype,
url: spurl,
headers: {
'authority': 'scrap.tf',
'user-agent': _this.ua,
'origin': sporig,
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': spmode,
'sec-fetch-user': spuser,
'sec-fetch-dest': spdest,
'referer': spreferer,
'cookie': _this.cookies
},
responseType: sprtype,
data: spdata,
})
.then((datas) => {
let data = datas.data;
if (page === 1) {
data = data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
_this.csrf = data.substring(data.indexOf("ScrapTF.User.Hash =")+21,data.indexOf("ScrapTF.User.QueueHash")).slice(0, 64);
let spwon = $(data).find('.nav-notice a').text().trim();
if (spwon.length > 0 && spwon.includes("You've won")) {
spwon = parseInt(spwon.match(/\d+/)[0]);
}
else {
spwon = 0;
}
if (spwon < _this.won) {
_this.setConfig('won', spwon);
}
if (spwon > 0 && spwon > _this.won) {
_this.log(_this.logLink(_this.url + '/notices', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + (spwon) + ')'), 'win');
_this.setStatus('win');
_this.setConfig('won', spwon);
if (_this.getConfig('sound', true)) {
new Audio(dirapp + 'sounds/won.wav').play();
}
}
}
if (page !== 1) {
let success = data.success;
if (success === true) {
_this.lastid = data.lastid;
let done = data.done;
if (done === true) {
_this.pagemax = page;
}
data = $('<div>' + (data.html).replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload') + '</div>');
}
}
let sptent = $(data).find('.panel-raffle'),
sptented = $(data).find('.raffle-entered');
if (sptent.length === 0) {
_this.pagemax = page;
}
if (page === 1) {
if (sptent.length < 60) {
_this.pagemax = page;
}
_this.lastid = sptent.eq(-1).find('.panel-heading .raffle-name a').attr('href').replace('/raffles/', '');
}
for (let spcurred = 0; spcurred < sptented.length; spcurred++) {
let linked = sptented.eq(spcurred).find('.panel-heading .raffle-name a').attr('href').replace('/raffles/', '');
GJuser.sp = GJuser.sp + linked + ',';
}
let spcurr = 0,
random = Array.from(Array(sptent.length).keys());
if (_this.getConfig('rnd', false)) {
for(let i = random.length - 1; i > 0; i--){
const j = Math.floor(Math.random() * i);
const temp = random[i];
random[i] = random[j];
random[j] = temp;
}
}
function giveawayEnter() {
if (_this.doTimer() - _this.totalTicks < 240) {
let sptimer = _this.getConfig('timer_from', 70);
if (_this.getConfig('timer_to', 90) !== _this.getConfig('timer_from', 70)) {
sptimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 90) - _this.getConfig('timer_from', 70))) + _this.getConfig('timer_from', 70));
}
_this.stimer = sptimer;
}
if (sptent.length <= spcurr || !_this.started) {
if (!_this.started) {
_this.pagemax = page;
}
if (_this.getConfig('log', true)) {
if (page === _this.pagemax) {
if (_this.started) {
_this.log(Lang.get('service.reach_end'), 'skip');
}
_this.log(Lang.get('service.checked') + page + '#-' + _this.getConfig('pages', 1) + '#', 'srch');
}
else {
_this.log(Lang.get('service.checked') + page + '#', 'srch');
}
}
if (callback) {
callback();
}
return;
}
let spnext = _this.interval(),
sprnd = random[spcurr],
spcont = sptent.eq(sprnd),
spname = spcont.find('.panel-heading .raffle-name a').text().trim(),
splink = spcont.find('.panel-heading .raffle-name a').attr('href'),
spended = spcont.find('.panel-heading .raffle-details span.raffle-state-ended').text().trim(),
id = splink.replace('/raffles/', '');
if (spname === undefined) {
spname = '?????? ' + '(' + id + ')';
}
if (spname.includes('<noload')) {
spname = spcont.find('.panel-heading .raffle-name a noload').text().trim();
}
if (spname.length > 70) {
spname = spname.slice(0, 70) + '...';
}
if (spname === '') {
spname = '?????? ' + '(' + id + ')';
}
let splog = _this.logLink(_this.url + splink, spname);
if (_this.getConfig('log', true)) {
splog = '|' + page + '#|' + (sprnd + 1) + '№|  ' + splog;
_this.log(Lang.get('service.checking') + splog, 'chk');
}
if (!GJuser.sp.includes(',' + id + ',') && !spended.includes('Ended')) {
spnext = spnext + Math.floor(spnext / 4) + 2100;
rq({
method: 'GET',
url: _this.url + splink,
headers: {
'authority': 'scrap.tf',
'user-agent': _this.ua,
'sec-fetch-site': 'none',
'sec-fetch-mode': 'navigate',
'sec-fetch-user': '?1',
'sec-fetch-dest': 'document',
'cookie': _this.cookies
},
responseType: 'document'
})
.then((raffles) => {
let raff = raffles.data;
raff = raff.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
let enter = raff.indexOf('>Enter Raffle<') >= 0,
entered = raff.indexOf('>Leave Raffle<') >= 0,
hash = raff.substring(raff.indexOf("ScrapTF.Raffles.EnterRaffle(")+39,raff.indexOf("<i18n>Enter Raffle</i18n></button>")).slice(0, 64),
spid = id;
_this.csrf = raff.substring(raff.indexOf("ScrapTF.User.Hash =")+21,raff.indexOf("ScrapTF.User.QueueHash")).slice(0, 64);
if (enter) {
let tmout = Math.floor(spnext / 4) + 2000;
setTimeout(function () {
rq({
method: 'POST',
url: _this.url + '/ajax/viewraffle/EnterRaffle',
headers: {
'authority': 'scrap.tf',
'user-agent': _this.ua,
'origin': _this.url,
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': _this.url + '/raffles/' + spid,
'cookie': _this.cookies
},
data: 'raffle=' + spid + '&captcha=&hash=' + hash + '&flag=false&csrf=' + _this.csrf,
})
.then((raffle) => {
let resp = raffle.data,
spmess = JSON.stringify(resp.message);
if (spmess === '"Entered raffle!"') {
_this.log(Lang.get('service.entered_in') + splog, 'enter');
}
else {
spnext = spnext * 2;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
})
.catch((error) => {
spnext = spnext * 2;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
});
}, tmout);
}
else {
if (entered && _this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'), 'jnd');
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.cant_join'), 'cant');
}
}
}
})
.catch((error) => {
spnext = spnext * 2;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
});
}
else {
spnext = 100;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'), 'jnd');
}
}
spcurr++;
setTimeout(giveawayEnter, spnext);
}
giveawayEnter();
});
}
}
