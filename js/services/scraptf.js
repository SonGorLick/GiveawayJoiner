'use strict';
class ScrapTF extends Joiner {
constructor() {
super();
this.settings.interval_from.min = 9;
this.websiteUrl = 'https://scrap.tf';
this.authContent = 'Logout';
this.authLink = 'https://scrap.tf/login';
this.settings.sort_by_end = { type: 'checkbox', trans: this.transPath('sort_by_end'), default: this.getConfig('sort_by_end', false) };
this.settings.sound = { type: 'checkbox', trans: this.transPath('sound'), default: this.getConfig('sound', true) };
this.settings.rnd = { type: 'checkbox', trans: this.transPath('rnd'), default: this.getConfig('rnd', false) };
this.settings.log = { type: 'checkbox', trans: this.transPath('log'), default: this.getConfig('log', true) };
this.withValue = false;
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: __dirname + '/images/ScrapTF.png',
username: 'ScrapTF User'
};
$.ajax({
url: 'https://scrap.tf',
success: function (data) {
data = data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
userData.avatar = data.substring(data.indexOf('style="" src="')+14,data.indexOf('class="nav-username"')).slice(0, 121);
userData.username = $(data).find('.nav-username').text();
GJuser.sp = userData.avatar;
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
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
type = 'get',
head = {},
datatype = 'html',
spdata = {};
if (page !== 1) {
spurl = _this.url + '/ajax/raffles/Paginate';
type = 'post';
head = {
'authority': 'scrap.tf',
'accept': 'application/json, text/javascript, */*; q=0.01',
'x-requested-with': 'XMLHttpRequest',
'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
};
datatype = 'json';
spdata = {start: _this.lastid, sort: _this.sort, puzzle: 0, csrf: _this.csrf};
}
$.ajax({
type: type,
dataType: datatype,
url: spurl,
headers: head,
data: spdata,
success: function (data) {
if (page === 1) {
data = data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
_this.csrf = data.substring(data.indexOf("ScrapTF.User.Hash =")+21,data.indexOf("ScrapTF.User.QueueHash")).slice(0, 64);
let spwon = $(data).find('.nav-notice a').text().trim();
if (spwon.length > 0) {
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
_this.setConfig('won', spwon);
if (_this.getConfig('sound', true)) {
new Audio(__dirname + '/sounds/won.wav').play();
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
if (sptent.length <= spcurr || !_this.started) {
if (_this.getConfig('log', true)) {
if (page === _this.pagemax) {
_this.log(Lang.get('service.reach_end'), 'skip');
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
splink = spcont.find('.panel-heading .raffle-name a').attr('href'),
id = splink.replace('/raffles/', ''),
spname = spcont.find('.panel-heading .raffle-name a').text().trim();
if (spname === undefined || spname === '' || spname.length === 0 || spname.length > 100) {
spname = id;
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + (sprnd + 1) + '№|  ' + _this.logLink(_this.url + splink, spname), 'chk');
}
if (!GJuser.sp.includes(',' + id + ',')) {
$.ajax({
url: _this.url + splink,
success: function (data) {
data = data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
let enter = data.indexOf('>Enter Raffle<') >= 0,
entered = data.indexOf('>Leave Raffle<') >= 0,
hash = data.substring(data.indexOf("ScrapTF.Raffles.EnterRaffle(")+39,data.indexOf("<i18n>Enter Raffle</i18n></button>")).slice(0, 64);
if (enter) {
let tmout = (Math.floor(Math.random() * 2000)) + 5000;
setTimeout(function () {
$.ajax({
type: 'POST',
dataType: 'json',
url: _this.url + '/ajax/viewraffle/EnterRaffle',
headers: {
'authority': 'scrap.tf',
'accept': 'application/json, text/javascript, */*; q=0.01',
'x-requested-with': 'XMLHttpRequest',
'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
},
data: {raffle: id, captha: '', hash: hash, csrf: _this.csrf},
success: function (response) {
let spmess = JSON.stringify(response.message);
if (spmess === '"Entered raffle!"') {
_this.log(Lang.get('service.entered_in') + '|' + page + '#|' + (sprnd + 1) + '№|  ' + _this.logLink(_this.url + splink, spname), 'enter');
}
else {
spnext = 15000;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
}
});
}, tmout);
}
else {
if (entered && _this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'), 'skip');
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.cant_join'), 'cant');
}
}
}
}
});
}
else {
spnext = 100;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'), 'skip');
}
}
spcurr++;
setTimeout(giveawayEnter, spnext);
}
giveawayEnter();
}
});
}
}
