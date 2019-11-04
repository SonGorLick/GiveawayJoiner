'use strict';
class Astats extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://astats.astats.nl/astats/';
this.authContent = 'Log out';
this.authLink = 'https://astats.astats.nl/astats/profile/Login.php';
this.withValue = false;
this.settings.check_in_steam = { type: 'checkbox', trans: this.transPath('check_in_steam'), default: this.getConfig('check_in_steam', true) };
this.settings.rnd = { type: 'checkbox', trans: this.transPath('rnd'), default: this.getConfig('rnd', true) };
this.settings.blacklist_on = { type: 'checkbox', trans: this.transPath('blacklist_on'), default: this.getConfig('blacklist_on', false) };
this.settings.log = { type: 'checkbox', trans: this.transPath('log'), default: this.getConfig('log', true) };
super.init();
}
getUserInfo(callback) {
if (GJuser.as.length > 601) {
GJuser.as = ',';
}
let userData = {
avatar: __dirname + '/images/Astats.png',
username: 'Astats User',
};
$.ajax({
url: 'https://astats.astats.nl/astats/User_Info.php',
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
_this.url = 'https://astats.astats.nl';
_this.pagemax = _this.getConfig('pages', 1);
if (GJuser.as === '') {
GJuser.as = ',';
$.ajax({
url: _this.url + '/astats/TopListGames.php?language=english'
});
}
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
let affset = (page - 1) * 200;
if (page === 1) {
_this.pageurl = '/astats/TopListGames.php?&DisplayType=Giveaway';
}
else {
_this.pageurl = '/astats/TopListGames.php?&DisplayType=Giveaway&Offset=' + affset + '#';
}
$.ajax({
url: _this.url + _this.pageurl,
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
let afound = data.find('[style="text-align:right;"]'),
acurr = 0,
random = Array.from(Array(afound.length).keys());
if (_this.getConfig('rnd', true)) {
for(let i = random.length - 1; i > 0; i--){
const j = Math.floor(Math.random() * i);
const temp = random[i];
random[i] = random[j];
random[j] = temp;
}
}
function giveawayEnter() {
if (afound.length === 0) {
_this.pagemax = page;
}
if (afound.length <= acurr || !_this.started) {
if (_this.getConfig('log', true)) {
if (_this.pagemax === page) {
_this.log(Lang.get('service.reach_end'));
}
_this.log(Lang.get('service.checked') + page);
}
if (callback) {
callback();
}
return;
}
let asnext = _this.interval(),
arnd = random[acurr],
away = afound.eq(arnd),
alink = away.find('a').attr('href'),
assteam = away.find('a noload').attr('src'),
asown = 0,
asapp = 0,
assub = 0,
asid = '???',
asstm = '';
if (alink !== undefined || assteam !== undefined) {
let aname = data.find('[href="' + alink + '"]').text().trim();
if (!aname.includes('This giveaway has ended.')) {
let ahave =  data.find('[href="' + alink + '"] font').attr('color'),
asjoin = alink.replace('/astats/Giveaway.php?GiveawayID=','');
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
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' || GJuser.ownsubs === '[]') {
_this.log(Lang.get('service.steam_error'), true);
asown = 2;
}
if (GJuser.ownapps.includes(',' + asapp + ',') && asapp > 0) {
asown = 1;
}
if (GJuser.ownsubs.includes(',' + assub + ',') && assub > 0) {
asown = 1;
}
}
if (GJuser.as.includes(',' + asjoin + ',')) {
asown = 3;
}
if (GJuser.black.includes(asid + ',') && _this.getConfig('blacklist_on', false)) {
asown = 4;
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + page + '#|' + _this.logLink(asstm, asid) + '|  ' + _this.logLink(_this.url + alink, aname));
if (asown === 1) {
_this.log(Lang.get('service.have_on_steam'));
}
if (asown === 3) {
_this.log(Lang.get('service.already_joined'));
}
if (asown === 4) {
_this.log(Lang.get('service.blacklisted'));
}
}
if (asown === 0 && ahave === undefined) {
let tmout = (Math.floor(Math.random() * 1000)) + 1000;
setTimeout(function () {
}, tmout);
$.ajax({
url: _this.url + alink,
success: function (html) {
html = $(html.replace(/<img/gi, '<noload'));
let ajoin = html.find('.input-group-btn').text().trim();
if (ajoin === 'Add') {
GJuser.as = GJuser.as + asjoin + ',';
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.already_joined'));
}
}
if (ajoin !== 'Add' && ajoin !== 'Join' && _this.getConfig('log', true)) {
_this.log(Lang.get('service.cant_join'));
}
if (ajoin === 'Join') {
let pmout = (Math.floor(Math.random() * 1000)) + 1000;
setTimeout(function () {
}, pmout);
GJuser.as = GJuser.as + asjoin + ',';
$.ajax({
url: _this.url + alink,
method: 'POST',
data: 'Comment=&JoinGiveaway=Join',
success: function () {
_this.log(Lang.get('service.entered_in') + ' |' + page + '#|' + _this.logLink(asstm, asid) + '|  ' + _this.logLink(_this.url + alink, aname));
}
});
}
}
});
}
else {
asnext = 50;
}
}
else {
_this.pagemax = page;
asnext = 50;
}
}
acurr++;
setTimeout(giveawayEnter, asnext);
}
giveawayEnter();
}
});
}
}
