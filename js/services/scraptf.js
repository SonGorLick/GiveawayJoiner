'use strict';
class ScrapTF extends Joiner {
constructor() {
super();
this.settings.interval_from.min = 9;
this.websiteUrl = 'https://scrap.tf';
this.authContent = 'Logout';
this.authLink = 'https://scrap.tf/login';
this.withValue = false;
delete this.settings.pages;
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: __dirname + '/images/Scraptf.png',
username: 'Scraptf User',
};
$.ajax({
url: 'https://scrap.tf',
success: function (html) {
html = $(html.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload'));
userData.username = html.find('.nav-username').text();
userData.avatar = html.find('.pull-left.nav-avatar > .avatar-container > noload').attr('src');
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
_this.url = 'https://scrap.tf';
GJuser.sp = ',';
$.ajax({
url: _this.url + '/raffles',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload'));
let sptent = data.find('.panel-raffle'),
sptented = data.find('.raffle-entered'),
spcurr = 0;
for (let spcurred = 0; spcurred < sptented.length; spcurred++) {
let linked = sptented.eq(spcurred).find('.panel-heading .raffle-name a').attr('href').replace('/raffles/', '');
GJuser.sp = GJuser.sp + linked + ',';
}
let pmout = (Math.floor(Math.random() * 4000)) + 5000;
setTimeout(function () {
}, pmout);
function giveawayEnter() {
if (sptent.length <= spcurr || !_this.started) {
return;
}
let spnext = _this.interval();
let spcont = sptent.eq(spcurr),
link = spcont.find('.panel-heading .raffle-name a').attr('href'),
name = spcont.find('.panel-heading .raffle-name a').text(),
entered = link.replace('/raffles/', '');
if (name === undefined || name === '') {
name = _this.url + link;
}
if (!GJuser.sp.includes(',' + entered + ',')) {
$.ajax({
url: _this.url + link,
success: function (data) {
data = data.replace(/<img/gi, '<noload').replace(/<audio/gi, '<noload');
let enter = data.indexOf('>Enter Raffle<') >= 0,
hash = data.substring(data.indexOf("ScrapTF.Raffles.EnterRaffle(")+39,data.indexOf("<i18n>Enter Raffle</i18n></button>")).slice(0, 64),
csrf = data.substring(data.indexOf("ScrapTF.User.Hash =")+21,data.indexOf("ScrapTF.User.QueueHash")).slice(0, 64);
if (enter) {
let tmout = (Math.floor(Math.random() * 3000)) + 3000;
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
success: function () {
_this.log(Lang.get('service.entered_in') + _this.logLink(_this.url + link, name));
}
});
}, tmout);
}
}
});
}
else {
spnext = 50;
}
spcurr++;
setTimeout(giveawayEnter, spnext);
}
giveawayEnter();
}
});
}
}
