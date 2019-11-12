'use strict';
class ScrapTF extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://scrap.tf';
this.authContent = 'Logout';
this.authLink = 'https://scrap.tf/login';
this.settings.rnd = { type: 'checkbox', trans: this.transPath('rnd'), default: this.getConfig('rnd', false) };
this.settings.log = { type: 'checkbox', trans: this.transPath('log'), default: this.getConfig('log', true) };
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
let page = 1;
_this.pagemax = 2;
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
let spurl = '';
GJuser.sp = ',';
if (page === 1) {
spurl = '/ending';
}
$.ajax({
url: _this.url + '/raffles' + spurl,
success: function (data) {
data = $(data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload'));
let sptent = data.find('.panel-raffle'),
sptented = data.find('.raffle-entered'),
spcurr = 0;
for (let spcurred = 0; spcurred < sptented.length; spcurred++) {
let linked = sptented.eq(spcurred).find('.panel-heading .raffle-name a').attr('href').replace('/raffles/', '');
GJuser.sp = GJuser.sp + linked + ',';
}
let random = Array.from(Array(sptent.length).keys());
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
if (sptent.length <= spcurr || !_this.started) {
if (_this.getConfig('log', true)) {
if (page === 1) {
_this.log(Lang.get('service.checked') + 'Public Raffles (Sort by Time Left)');
}
else {
_this.log(Lang.get('service.checked') + 'Public Raffles (Sort by Newest)');
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
link = spcont.find('.panel-heading .raffle-name a').attr('href'),
name = spcont.find('.panel-heading .raffle-name a').text().trim(),
entered = link.replace('/raffles/', '');
if (name === undefined || name === '') {
name = entered;
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + (sprnd + 1) + '№|  ' + _this.logLink(_this.url + link, name));
}
if (!GJuser.sp.includes(',' + entered + ',') || GJuser.sp.length < 2) {
$.ajax({
url: _this.url + link,
success: function (data) {
data = data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
let enter = data.indexOf('>Enter Raffle<') >= 0,
hash = data.substring(data.indexOf("ScrapTF.Raffles.EnterRaffle(")+39,data.indexOf("<i18n>Enter Raffle</i18n></button>")).slice(0, 64),
csrf = data.substring(data.indexOf("ScrapTF.User.Hash =")+21,data.indexOf("ScrapTF.User.QueueHash")).slice(0, 64);
if (enter) {
let tmout = (Math.floor(Math.random() * 3000)) + 4000;
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
data: {raffle: entered, captha: '', hash: hash, csrf: csrf},
success: function (response) {
let spresp = JSON.stringify(response.message);
if (spresp === 'Entered raffle!') {
_this.log(Lang.get('service.entered_in') + '|' + page + '#|' + (sprnd + 1) + '№|  ' + _this.logLink(_this.url + link, name));
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join') + '(' + response.message + ')', true);
spnext = 1000;
}
}
}
});
}, tmout);
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.cant_join'));
spnext = 1000;
}
}
}
});
}
else {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'));
spnext = 1000;
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
