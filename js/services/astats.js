'use strict';
class Astats extends Joiner {
constructor() {
super();
this.websiteUrl = 'http://astats.astats.nl';
this.authContent = 'Logout';
this.authLink = 'http://astats.astats.nl/astats/profile/Login.php';
this.withValue = false;
delete this.settings.pages;
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: __dirname + '/images/Astats.png',
username: 'AS user',
};
$.ajax({
url: 'http://astats.astats.nl/astats/User_Info.php?SteamID64=' + GJuser.steamid,
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
userData.username = data.find('.dropdown-toggle > b').text();
userData.avatar = data.find('.d0 > td:nth-of-type(1) > center > noload').attr('src');
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
let page = 1;
_this.url = 'http://astats.astats.nl';
let callback = function () {
page++;
if (page <= _this.getConfig('pages', 1)) {
_this.enterOnPage(page, callback);
}
};
this.enterOnPage(page, callback);
}
enterOnPage(page, callback) {
let _this = this;
$.ajax({
url: _this.url + '/astats/TopListGames.php?&DisplayType=Giveaway&Offset=0',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
let afound = data.find('[style="text-align:right;"]'),
acurr = 0;
function giveawayEnter() {
if (afound.length <= acurr || !_this.started) {
if (callback) {
callback();
}
return;
}
let next_after = _this.interval();
let away = afound.eq(acurr);
let alink = away.find('a').attr('href'),
assteam = away.find('a noload').attr('src'),
asown = 0,
asapp = 0,
assub = 0,
asid = '???',
asstm = '';
if (alink === undefined || assteam === undefined) {
next_after = 50;
}
else {
let ended = data.find('[href="' + alink + '"] > span').text().trim();
if (assteam.includes('apps/')) {
asapp = parseInt(assteam.split('apps/')[1].split('/')[0].split('?')[0].split('#')[0]);
asid = 'app/' + asapp;
asstm = 'https://store.steampowered.com/app/' + asapp;
}
if (assteam.includes('sub/')) {
assub = parseInt(assteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
asid = 'sub/' + assub;
asstm = 'https://store.steampowered.com/sub/' + assub;
}
if (GJuser.ownapps.includes(',' + asapp + ',') && asapp > 0) {
asown = 1;
}
if (GJuser.ownsubs.includes(',' + assub + ',') && assub > 0) {
asown = 1;
}
if (asown === 0 && ended !== 'This giveaway has ended.') {
let tmout = (Math.floor(Math.random() * 10000)) + 7000;
$.ajax({
url: _this.url + alink,
timeout: tmout,
success: function (html) {
html = $(html.replace(/<img/gi, '<noload'));
let aname = html.find('.panel-gameinfo.panel-default.panel > .panel-heading').text().trim(),
ajoin = html.find('.input-group-btn').text().trim();
if (ajoin === 'Join') {
let pmout = (Math.floor(Math.random() * 10000)) + 7000;
$.ajax({
url: _this.url + alink,
method: 'POST',
data: 'Comment=&JoinGiveaway=Join',
timeout: pmout,
success: function () {
_this.log(Lang.get('service.entered_in') + _this.logLink(_this.url + alink, aname) + ' - ' + _this.logLink(asstm, asid));
}
});
}
else {
next_after = 50;
}
}
});
}
else {
next_after = 50;
}
}
acurr++;
setTimeout(giveawayEnter, next_after);
}
giveawayEnter();
}
});
}
}
