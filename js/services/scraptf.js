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
this.setConfig('check_in_steam', false);
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
let sptimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 90) - _this.getConfig('timer_from', 70))) + _this.getConfig('timer_from', 70));
_this.stimer = sptimer;
_this.url = 'https://scrap.tf';
let page = 1;
_this.spurl = '';
if (_this.getConfig('sort_by_end', false)) {
_this.spurl = '/ending';
_this.dload = 1;
}
else {
_this.dload = 0;
}
_this.dcheck = '';
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
_this.dsave = ',';
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
spdata = 'start=' + _this.dcheck + '&sort=' + _this.dload + '&puzzle=0&csrf=' + _this.csrf;
spreferer = _this.url + '/raffles' + _this.spurl;
sporig = _this.url;
spmode = 'cors';
spuser = '';
spdest = 'empty';
sptype = 'POST';
sprtype = 'json';
}
let data = 'err';
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
data = datas.data;
})
.finally(() => {
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
else if (page !== 1) {
let success = data.success;
if (success === true) {
_this.dcheck = data.lastid;
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
_this.dcheck = sptent.eq(-1).find('.panel-heading .raffle-name a').attr('href').replace('/raffles/', '');
}
for (let spcurred = 0; spcurred < sptented.length; spcurred++) {
let linked = sptented.eq(spcurred).find('.panel-heading .raffle-name a').attr('href').replace('/raffles/', '');
_this.dsave = _this.dsave + linked + ',';
}
let spcurr = 0,
spcrr = 0,
sparray = Array.from(Array(sptent.length).keys());
if (data === 'err') {
_this.pagemax = page;
_this.log(Lang.get('service.connection_error'), 'err');
}
function giveawayEnter() {
if (_this.doTimer() - _this.totalTicks < 240) {
_this.totalTicks = 1;
}
if (sparray.length <= spcurr || !_this.started) {
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
if (page === _this.pagemax && _this.started) {
if (_this.statusIcon.attr('data-status') !== 'win') {
_this.setStatus('good');
}
}
if (callback) {
callback();
}
return;
}
let spnext = _this.interval(),
spcrr = sparray[spcurr],
spcont = sptent.eq(spcrr),
spname = spcont.find('.panel-heading .raffle-name a').text().trim(),
splink = spcont.find('.panel-heading .raffle-name a').attr('href'),
spended = spcont.find('.panel-heading .raffle-details span.raffle-state-ended').text().trim(),
id = splink.replace('/raffles/', '');
if (spname === undefined) {
spname = '?????? ' + '(' + id + ')';
}
else if (spname.includes('<noload')) {
spname = '?????? ' + '(' + id + ')';
}
if (spname === '') {
spname = '?????? ' + '(' + id + ')';
}
else if (spname.length > 70) {
spname = spname.slice(0, 70) + '...';
}
let splog = _this.logLink(_this.url + splink, spname);
if (_this.getConfig('log', true)) {
splog = '|' + page + '#|' + (spcrr + 1) + '№|  ' + splog;
_this.log(Lang.get('service.checking') + splog, 'chk');
}
if (!_this.dsave.includes(',' + id + ',') && !spended.includes('Ended')) {
spnext = spnext + Math.floor(spnext / 4) + 2100;
let raff = 'err';
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
.then((raffs) => {
raff = raffs.data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
})
.finally(() => {
if (raff === 'err') {
spnext = 19000;
if (sparray.filter(i => i === spcrr).length === 1) {
sparray.push(spcrr);
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
else if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
else {
let enter = raff.indexOf('<i class="fa fa-sign-in"></i> Enter Raffle</button>') > 0,
entered = raff.indexOf('<i class="fa fa-sign-out"></i> Leave Raffle</button>') >= 0,
btncheck = raff.indexOf('<div class="col-xs-7 enter-raffle-btns">') >= 0,
spid = id,
hash = raff.substring(raff.indexOf("ScrapTF.Raffles.EnterRaffle('" + spid + "', '")+39,raff.indexOf('><i class="fa fa-sign-in"></i> Enter Raffle</button>')).slice(0, 64);
_this.csrf = raff.substring(raff.indexOf("ScrapTF.User.Hash =")+21,raff.indexOf("ScrapTF.User.QueueHash")).slice(0, 64);
if (enter && btncheck) {
let tmout = Math.floor(spnext / 4) + 2000,
resp = 'err';
setTimeout(() => {
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
.then((resps) => {
resp = resps.data;
})
.finally(() => {
if (resp === 'err') {
spnext = 19000;
if (sparray.filter(i => i === spcrr).length === 1) {
sparray.push(spcrr);
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
else if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
else {
let spmess = JSON.stringify(resp.message);
if (spmess === '"Entered raffle!"') {
_this.log(Lang.get('service.entered_in') + splog, 'enter');
}
else {
spnext = 19000;
if (sparray.filter(i => i === spcrr).length === 1) {
sparray.push(spcrr);
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
else if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
}
});
}, tmout);
}
else if (_this.getConfig('log', true)) {
if (entered) {
_this.log(Lang.get('service.already_joined'), 'jnd');
}
else if (!btncheck) {
_this.log(Lang.get('service.cant_join'), 'black');
}
else {
_this.log(Lang.get('service.cant_join'), 'cant');
}
}
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
