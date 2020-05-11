'use strict';
class ZP extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.zeepond.com';
this.authContent = 'profile-pic';
this.authLink = 'https://www.zeepond.com/cb-login';
this.auth = this.auth + Lang.get('service.zp.login');
this.settings.interval_from = { type: 'number', trans: 'service.interval_from', min: 10, max: this.getConfig('interval_to', 15), default: this.getConfig('interval_from', 10) };
this.settings.interval_to = { type: 'number', trans: 'service.interval_to', min: this.getConfig('interval_from', 10), max: 60, default: this.getConfig('interval_to', 15) };
this.settings.skip_after = { type: 'checkbox', trans: this.transPath('skip_after'), default: this.getConfig('skip_after', true) };
this.settings.rnd = { type: 'checkbox', trans: 'service.rnd', default: this.getConfig('rnd', false) };
this.settings.check_all = { type: 'checkbox', trans: this.transPath('check_all'), default: this.getConfig('check_all', false) };
this.settings.sound = { type: 'checkbox', trans: 'service.sound', default: this.getConfig('sound', true) };
this.withValue = false;
delete this.settings.pages;
super.init();
}
getUserInfo(callback) {
if (GJuser.zp === '') {
GJuser.zp = ',';
if (fs.existsSync(dirdata + 'zp.txt')) {
let zpdata = fs.readFileSync(dirdata + 'zp.txt');
if (zpdata.length > 1) {
GJuser.zp = zpdata.toString();
}
}
}
let userData = {
avatar: dirapp + 'images/ZP.png',
username: 'ZP User'
};
if (GJuser.username !== 'GiveawayJoiner') {
userData.avatar = GJuser.avatar;
userData.username = GJuser.username;
}
callback(userData);
}
joinService() {
let _this = this;
if (_this.getConfig('timer_to', 700) !== _this.getConfig('timer_from', 500)) {
let zptimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = zptimer;
}
GJuser.zpn = ',';
_this.skip = false;
_this.month = 1;
let zpmonth = new Date().getMonth();
if (zpmonth > 2 && zpmonth < 10) {
_this.month = 0;
}
_this.won = _this.getConfig('won', 0);
_this.url = 'https://www.zeepond.com';
if ((new Date()).getDate() !== GJuser.zpchk) {
GJuser.zpchk = (new Date()).getDate();
$.ajax({
url: _this.url + '/my-account/my-prizes',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload').replace(/<ins/gi, '<noload'));
let zpwon = data.find('.form-group');
if (zpwon === undefined) {
zpwon = 0;
}
else {
zpwon = zpwon.length;
}
if (zpwon < _this.won) {
_this.setConfig('won', zpwon);
}
if (zpwon > 0 && zpwon > _this.won) {
_this.log(_this.logLink(_this.url + '/my-account/my-prizes', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + (zpwon - _this.won) + ')'), 'win');
_this.setStatus('win');
_this.setConfig('won', zpwon);
if (_this.getConfig('sound', true)) {
new Audio(dirapp + 'sounds/won.wav').play();
}
}
}
});
}
$.ajax({
url: _this.url + '/zeepond/giveaways/enter-a-competition',
success: function (data) {
data = data.replace(/<img/gi, '<noload').replace(/<ins/gi, '<noload');
let comp = $(data).find('.bv-item-wrapper'),
zpcurr = 0,
random = Array.from(Array(comp.length).keys());
if (_this.getConfig('rnd', false)) {
for(let i = random.length - 1; i > 0; i--){
const j = Math.floor(Math.random() * i);
const temp = random[i];
random[i] = random[j];
random[j] = temp;
}
}
function giveawayEnter() {
if (comp.length <= zpcurr || _this.skip || !_this.started) {
if (comp.length <= zpcurr || _this.skip) {
setTimeout(function () {
fs.writeFile(dirdata + 'zp.txt', GJuser.zpn, (err) => { });
GJuser.zp = GJuser.zpn;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.data_saved'), 'info');
}
}, _this.interval());
}
if (_this.getConfig('log', true)) {
if (_this.started && !_this.skip) {
_this.log(Lang.get('service.reach_end'), 'skip');
}
_this.log(Lang.get('service.checked') + 'Giveaways', 'srch');
}
return;
}
let zpnext = _this.interval(),
zprnd = random[zpcurr],
zpcomp = comp.eq(zprnd),
zplink = _this.url + zpcomp.find('.bv-item-image a').attr('href'),
zpnam = zplink.replace('https://www.zeepond.com/zeepond/giveaways/enter-a-competition/', ''),
njoin = 0,
zpblack = '',
zpdtnow = new Date();
zpdtnow.setDate(zpdtnow.getUTCDate());
zpdtnow.setHours(zpdtnow.getUTCHours() + 10 + _this.month);
let zpdnow = zpdtnow.getDate();
if (GJuser.zp.includes(',' + zpnam + '(d=')) {
zpblack = GJuser.zp.split(',' + zpnam + '(d=')[1].split('),')[0];
GJuser.zpn = GJuser.zpn + zpnam + '(d=' + zpblack + '),';
}
if (!_this.getConfig('check_all', false)) {
if (GJuser.zp.includes(',' + zpnam + '(z=')) {
let zpdga = parseInt(GJuser.zp.split(',' + zpnam + '(z=')[1].split('),')[0]);
if (zpdnow === zpdga) {
GJuser.zpn = GJuser.zpn + zpnam + '(z=' + zpdga + '),';
njoin = 3;
}
}
if (zpblack !== '') {
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps.includes(',' + zpblack.replace('app/', '') + ',')) {
njoin = 1;
}
if (GJuser.ownapps.includes(',' + zpblack.replace('sub/', '') + ',')) {
njoin = 1;
}
}
if (GJuser.black.includes(zpblack + ',') && _this.getConfig('blacklist_on', false)) {
njoin = 2;
}
}
if (GJuser.zp.includes(',' + zpnam + '(w),')) {
GJuser.zpn = GJuser.zpn + zpnam + '(w),';
njoin = 4;
}
}
if (zpblack !== '') {
zpblack = _this.logBlack(zpblack);
}
let zplog = _this.logLink(zplink, zpnam.replace(/-/g, ' '));
if (_this.getConfig('log', true) && njoin > 0) {
zplog = '|' + (zprnd + 1) + '№|  ' + zplog;
_this.log(Lang.get('service.checking') + zplog + zpblack, 'chk');
switch (njoin) {
case 1:
_this.log(Lang.get('service.have_on_steam'), 'steam');
break;
case 2:
_this.log(Lang.get('service.blacklisted'), 'black');
break;
case 3:
_this.log(Lang.get('service.time'), 'skip');
_this.log(Lang.get('service.data_have'), 'skip');
break;
case 4:
_this.log(Lang.get('service.won_skip'), 'jnd');
_this.log(Lang.get('service.data_have'), 'skip');
break;
}
}
if (njoin === 0) {
$.ajax({
url: zplink,
success: function (html) {
html = html.replace(/<img/gi, '<noload');
let won = html.indexOf('You have already won a prize in this competition') >= 0,
entered = html.indexOf('You have already entered today') >= 0,
enter = html.indexOf('>Enter this competition<') >= 0,
zpname = zpnam.replace(/-/g, ' '),
zpsteam = '';
if (enter || entered || won) {
zpname = $(html).find('.mycompetition .form-group .span8 > h1').text().trim();
zpsteam = html.substring(html.indexOf('href="https://store.steam')+6, html.indexOf('</a></p>')).slice(0, 55);
}
let zpown = 0,
zpapp = 0,
zpsub = 0,
zpbun = 0,
zpid = '';
if (!zpsteam.includes('https://store.steam')) {
zpsteam = undefined;
}
if (!enter) {
zpown = 3;
if (!entered && !won) {
GJuser.zpn = GJuser.zpn + zpnam + '(z=' + zpdnow + '),';
}
}
if (entered) {
GJuser.zpn = GJuser.zpn + zpnam + '(z=' + zpdnow + '),';
zpown = 5;
if (_this.getConfig('skip_after', true)) {
_this.skip = true;
}
}
if (zpsteam !== undefined) {
if (zpsteam.includes('app/')) {
zpapp = parseInt(zpsteam.split('app/')[1].split('/')[0].split('?')[0].split('#')[0]);
zpid = 'app/' + zpapp;
}
if (zpsteam.includes('sub/')) {
zpsub = parseInt(zpsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
zpid = 'sub/' + zpsub;
}
if (zpsteam.includes('bundle/')) {
zpbun = parseInt(zpsteam.split('bundle/')[1].split('/')[0].split('?')[0].split('#')[0]);
zpid = 'bundle/' + zpbun;
}
if (!GJuser.zpn.includes(',' + zpnam + '(d=') && zpid !== '') {
GJuser.zpn = GJuser.zpn + zpnam + '(d=' + zpid + '),';
}
else if (zpid === '') {
zpid = '???';
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' && GJuser.ownsubs === '[]') {
zpown = 2;
}
if (GJuser.ownapps.includes(',' + zpapp + ',') && zpapp > 0) {
zpown = 1;
}
if (GJuser.ownsubs.includes(',' + zpsub + ',') && zpsub > 0) {
zpown = 1;
}
}
if (GJuser.black.includes(zpid + ',') && _this.getConfig('blacklist_on', false)) {
zpown = 4;
}
}
if (won) {
zpown = 6;
if (!GJuser.zpn.includes(',' + zpnam + '(w),')) {
GJuser.zpn = GJuser.zpn + zpnam + '(w),';
}
}
if (zpid !== '') {
zpid = _this.logBlack(zpid);
}
zplog = _this.logLink(zplink, zpname);
if (_this.getConfig('log', true)) {
zplog = '|' + (zprnd + 1) + '№|  ' + zplog;
_this.log(Lang.get('service.checking') + zplog + zpid, 'chk');
switch (zpown) {
case 1:
_this.log(Lang.get('service.have_on_steam'), 'steam');
break;
case 2:
_this.log(Lang.get('service.steam_error'), 'err');
break;
case 3:
_this.log(Lang.get('service.cant_join'), 'cant');
break;
case 4:
_this.log(Lang.get('service.blacklisted'), 'black');
break;
case 5:
_this.log(Lang.get('service.already_joined'), 'jnd');
break;
case 6:
_this.log(Lang.get('service.won_skip'), 'jnd');
break;
}
}
else {
zplog = zplog + zpid;
}
if (zpown === 0) {
let tmout = Math.floor(zpnext / 2);
setTimeout(function () {
$.ajax({
url: zplink + '/enter_competition',
success: function (response) {
response = $(response.replace(/<img/gi, '<noload').replace(/<ins/gi, '<noload'));
let zpdtnew = new Date();
zpdtnew.setDate(zpdtnew.getUTCDate());
zpdtnew.setHours(zpdtnew.getUTCHours() + 10 + _this.month);
let zpdnew = ('0' + zpdtnew.getDate().toString()).slice(-2);
GJuser.zpn = GJuser.zpn + zpnam + '(z=' + zpdnew + '),';
_this.log(Lang.get('service.entered_in') + zplog, 'enter');
},
error: function () {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
});
}, tmout);
}
}
});
}
else {
zpnext = 100;
}
zpcurr++;
setTimeout(giveawayEnter, zpnext);
}
giveawayEnter();
}
});
}
}
