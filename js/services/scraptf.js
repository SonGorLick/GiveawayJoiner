'use strict';
class ScrapTF extends Joiner {
constructor() {
super();
this.settings.interval_from.min = 9;
this.websiteUrl = 'https://scrap.tf';
this.authContent = 'Logout';
this.authLink = 'https://scrap.tf/login';
this.settings.sort_by_end = { type: 'checkbox', trans: this.transPath('sort_by_end'), default: this.getConfig('sort_by_end', false) };
this.settings.log = { type: 'checkbox', trans: this.transPath('log'), default: this.getConfig('log', true) };
this.settings.rnd = { type: 'checkbox', trans: this.transPath('rnd'), default: this.getConfig('rnd', false) };
this.withValue = false;
delete this.settings.pages;
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
let page = 1,
spurl = '';
GJuser.sp = ',';
_this.done = false;
if (this.getConfig('sort_by_end', false)) {
spurl = '/ending';
_this.sort = 1;
}
else {
_this.sort = 0;
}
$.ajax({
url: _this.url + '/raffles' + spurl,
success: function (data) {
data = data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
_this.sptent = $(data).find('.panel-raffle');
_this.sptented = $(data).find('.raffle-entered');
let csrf = data.substring(data.indexOf("ScrapTF.User.Hash =")+21,data.indexOf("ScrapTF.User.QueueHash")).slice(0, 64),
spcurr = 0;
for (let spcurred = 0; spcurred < _this.sptented.length; spcurred++) {
let linked = _this.sptented.eq(spcurred).find('.panel-heading .raffle-name a').attr('href').replace('/raffles/', '');
GJuser.sp = GJuser.sp + linked + ',';
}
let random = Array.from(Array(_this.sptent.length).keys());
if (_this.getConfig('rnd', false)) {
for(let i = random.length - 1; i > 0; i--){
const j = Math.floor(Math.random() * i);
const temp = random[i];
random[i] = random[j];
random[j] = temp;
}
}
setTimeout(function () {
}, (Math.floor(Math.random() * 2000)) + 7000);
function giveawayEnter() {
if (_this.sptent.length <= spcurr || !_this.started) {
if (_this.getConfig('log', true)) {
if (spcurr < 60) {
_this.log(Lang.get('service.reach_end'), 'skip');
}
_this.log(Lang.get('service.checked') + page + '#', 'srch');
}
return;
}
let spnext = _this.interval(),
sprnd = random[spcurr],
spcont = _this.sptent.eq(sprnd),
link = spcont.find('.panel-heading .raffle-name a').attr('href'),
name = spcont.find('.panel-heading .raffle-name a').text().trim(),
id = link.replace('/raffles/', '');
if (name === undefined || name === '') {
name = id;
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + (sprnd + 1) + '№|  ' + _this.logLink(_this.url + link, name), 'chk');
}
if (!GJuser.sp.includes(',' + id + ',') || GJuser.sp.length < 2) {
$.ajax({
url: _this.url + link,
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
data: {raffle: id, captha: '', hash: hash, csrf: csrf},
success: function (response) {
let spmess = JSON.stringify(response.message);
if (spmess === '"Entered raffle!"') {
_this.log(Lang.get('service.entered_in') + '|' + page + '#|' + (sprnd + 1) + '№|  ' + _this.logLink(_this.url + link, name), 'enter');
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
spnext = 1000;
if (entered) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'), 'skip');
}
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
spnext = 1000;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'), 'skip');
}
}
spcurr++;
if (spcurr === 60 && !_this.done) {
spnext = 15000;
$.ajax({
type: 'POST',
dataType: 'json',
url: _this.url + '/ajax/raffles/Paginate',
headers: {
'authority': 'scrap.tf',
'accept': 'application/json, text/javascript, */*; q=0.01',
'x-requested-with': 'XMLHttpRequest',
'content-type': 'application/x-www-form-urlencoded; charset=UTF-8'
},
data: {start: id, sort: _this.sort, puzzle: 0, csrf: csrfpage},
success: function (response) {
let success = JSON.stringify(response.success);
if (success) {
_this.done = JSON.stringify(response.done);
let html = $('<div>' + (response.html).replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload') + '</div>');
_this.sptent = html.find('.panel-raffle');
_this.sptented = html.find('.raffle-entered');
for (let spcurred = 0; spcurred < _this.sptented.length; spcurred++) {
let linked = _this.sptented.eq(spcurred).find('.panel-heading .raffle-name a').attr('href').replace('/raffles/', '');
GJuser.sp = GJuser.sp + linked + ',';
}
let random = Array.from(Array(_this.sptent.length).keys());
if (_this.getConfig('rnd', false)) {
for(let i = random.length - 1; i > 0; i--){
const j = Math.floor(Math.random() * i);
const temp = random[i];
random[i] = random[j];
random[j] = temp;
}
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checked') + page + '#', 'srch');
}
page++;
spcurr = 0;
}
}
});
}
setTimeout(giveawayEnter, spnext);
}
giveawayEnter();
}
});
}
}
