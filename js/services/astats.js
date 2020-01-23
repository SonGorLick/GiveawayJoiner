'use strict';
class Astats extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://astats.astats.nl/astats/';
this.authContent = 'Log out';
this.authLink = 'https://astats.astats.nl/astats/profile/Login.php';
this.withValue = false;
this.settings.check_all = { type: 'checkbox', trans: 'service.check_all', default: this.getConfig('check_all', false) };
this.settings.sound = { type: 'checkbox', trans: 'service.sound', default: this.getConfig('sound', true) };
this.settings.rnd = { type: 'checkbox', trans: 'service.rnd', default: this.getConfig('rnd', false) };
super.init();
}
getUserInfo(callback) {
if (GJuser.as === '' && fs.existsSync(dirdata + 'astats.txt')) {
let asdata = fs.readFileSync(dirdata + 'astats.txt');
if (asdata.length > 1 && asdata.length < 4000) {
GJuser.as = asdata.toString();
}
}
let userData = {
avatar: dirapp + 'images/Astats.png',
username: 'Astats User'
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
let astimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 90) - _this.getConfig('timer_from', 70))) + _this.getConfig('timer_from', 70));
_this.stimer = astimer;
}
let page = 1;
_this.won = _this.getConfig('won', 0);
_this.url = 'https://astats.astats.nl';
_this.pagemax = _this.getConfig('pages', 1);
if (GJuser.as === '') {
GJuser.as = ',';
$.ajax({
url: _this.url + '/astats/TopListGames.php?language=english'
});
}
$.ajax({
url: _this.url + '/astats/profile/User_Inbox.php',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
let aswon = data.find('td:nth-of-type(4) > a').text('Congratulations you are a giveaway winner!');
if (aswon === undefined) {
aswon = 0;
}
else {
aswon = aswon.length;
}
if (aswon < _this.won) {
_this.setConfig('won', aswon);
}
if (aswon > 0 && aswon > _this.won) {
_this.log(_this.logLink(_this.url + '/astats/profile/User_Inbox.php', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + (aswon - _this.won) + ')'), 'win');
_this.setStatus('win');
_this.setConfig('won', aswon);
if (_this.getConfig('sound', true)) {
new Audio(dirapp + 'sounds/won.wav').play();
}
}
}
});
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
if (_this.getConfig('rnd', false)) {
for(let i = random.length - 1; i > 0; i--){
const j = Math.floor(Math.random() * i);
const temp = random[i];
random[i] = random[j];
random[j] = temp;
}
}
function giveawayEnter() {
if (afound.length === 0 || !_this.started) {
_this.pagemax = page;
}
if (afound.length <= acurr || !_this.started) {
if (afound.length <= acurr && page === _this.pagemax) {
setTimeout(function () {
fs.writeFile(dirdata + 'astats.txt', GJuser.as, (err) => { });
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.data_saved'), 'info');
}
}, _this.interval());
}
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
let asnext = _this.interval(),
arnd = random[acurr],
away = afound.eq(arnd),
alink = away.find('a').attr('href'),
assteam = away.find('a noload').attr('src'),
asown = 0,
asapp = 0,
assub = 0,
asid = '???';
if (alink !== undefined || assteam !== undefined) {
let aname = data.find('[href="' + alink + '"]').text().trim(),
ended = data.find('[href="' + alink + '"] > span').text().trim(),
asjoin = alink.replace('/astats/Giveaway.php?GiveawayID=','');
if (aname.includes('This giveaway has ended.') || ended === 'This giveaway has ended.') {
GJuser.as = GJuser.as.replace(',' + asjoin + ',', ',');
_this.pagemax = page;
asnext = 50;
}
else {
let ahave = data.find('[href="' + alink + '"] font').attr('color');
if (assteam.includes('apps/')) {
asapp = parseInt(assteam.split('apps/')[1].split('/')[0].split('?')[0].split('#')[0]);
asid = 'app/' + asapp;
}
if (assteam.includes('sub/')) {
assub = parseInt(assteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
asid = 'sub/' + assub;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' || GJuser.ownsubs === '[]') {
asown = 2;
}
if (GJuser.ownapps.includes(',' + asapp + ',') && asapp > 0) {
asown = 1;
}
if (GJuser.ownsubs.includes(',' + assub + ',') && assub > 0) {
asown = 1;
}
}
if (GJuser.black.includes(asid + ',') && _this.getConfig('blacklist_on', false)) {
asown = 4;
}
if (ahave === '#FF0000') {
asown = 1;
}
if (GJuser.as.includes(',' + asjoin + ',') && !_this.getConfig('check_all', false)) {
asown = 3;
}
let aslog = _this.logLink(_this.url + alink, aname);
if (_this.getConfig('log', true)) {
aslog = '|' + page + '#|' + (arnd + 1) + '№|  ' + aslog;
_this.log(Lang.get('service.checking') + aslog + _this.logBlack(asid), 'chk');
switch (asown) {
case 1:
_this.log(Lang.get('service.have_on_steam'), 'steam');
break;
case 2:
_this.log(Lang.get('service.steam_error'), 'err');
break;
case 3:
_this.log(Lang.get('service.already_joined'), 'jnd');
_this.log(Lang.get('service.data_have'), 'skip');
break;
case 4:
_this.log(Lang.get('service.blacklisted'), 'black');
break;
}
}
else {
aslog = aslog + _this.logBlack(asid);
}
if (asown === 0) {
$.ajax({
url: _this.url + alink,
success: function (html) {
html = $(html.replace(/<img/gi, '<noload'));
let ajoin = html.find('.input-group-btn').text().trim();
if (ajoin === 'Add') {
asown = 1;
if (!GJuser.as.includes(',' + asjoin + ',')) {
GJuser.as = GJuser.as + asjoin + ',';
}
}
if (ajoin !== 'Add' && ajoin !== 'Join') {
asown = 2;
}
if (ajoin === 'Join') {
asown = 0;
}
if (_this.getConfig('log', true)) {
switch (asown) {
case 1:
_this.log(Lang.get('service.already_joined'), 'jnd');
break;
case 2:
_this.log(Lang.get('service.cant_join'), 'cant');
break;
}
}
if (asown === 0) {
let tmout = Math.floor(asnext / 4);
setTimeout(function () {
$.ajax({
url: _this.url + alink,
method: 'POST',
data: 'Comment=&JoinGiveaway=Join',
success: function () {
if (!GJuser.as.includes(',' + asjoin + ',')) {
GJuser.as = GJuser.as + asjoin + ',';
}
_this.log(Lang.get('service.entered_in') + aslog, 'enter');
}
});
}, tmout);
}
else {
asnext = 1000;
}
}
});
}
else {
asnext = 100;
}
}
}
else {
asnext = 100;
}
acurr++;
setTimeout(giveawayEnter, asnext);
}
giveawayEnter();
}
});
}
}
