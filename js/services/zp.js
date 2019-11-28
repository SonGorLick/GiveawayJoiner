'use strict';
class ZP extends Joiner {
constructor() {
super();
this.settings.timer_to.default = 700;
this.settings.timer_from.default = 500;
this.settings.interval_from.min = 9;
this.websiteUrl = 'https://www.zeepond.com';
this.authContent = 'My Profile';
this.authLink = 'https://www.zeepond.com/cb-login';
this.settings.rnd = { type: 'checkbox', trans: 'service.rnd', default: this.getConfig('rnd', false) };
this.settings.check_all = { type: 'checkbox', trans: this.transPath('check_all'), default: this.getConfig('check_all', false) };
this.settings.blacklist_on = { type: 'checkbox', trans: 'service.blacklist_on', default: this.getConfig('blacklist_on', false) };
this.settings.check_in_steam = { type: 'checkbox', trans: 'service.check_in_steam', default: this.getConfig('check_in_steam', true) };
this.settings.log = { type: 'checkbox', trans: 'service.log', default: this.getConfig('log', true) };
this.withValue = false;
delete this.settings.pages;
super.init();
}
getUserInfo(callback) {
if (GJuser.zp.length > 10000) {
GJuser.zp = ',';
}
let userData = {
avatar: __dirname + '/images/ZP.png',
username: 'ZP User'
};
$.ajax({
url: 'https://www.zeepond.com',
success: function (data) {
data = data.replace(/<img/gi, '<noload').replace(/<ins/gi, '<noload');
userData.avatar = $(data).find('.profile-pic').attr('style').replace('background-color:transparent; background-image:url(', '').replace(');', '');
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
if (_this.getConfig('timer_to', 70) !== _this.getConfig('timer_from', 50)) {
let zptimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 70) - _this.getConfig('timer_from', 50))) + _this.getConfig('timer_from', 50));
_this.stimer = zptimer;
}
_this.skip = false;
_this.url = 'https://www.zeepond.com';
$.ajax({
url: _this.url + '/zeepond/giveaways/enter-a-competition',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload').replace(/<ins/gi, '<noload'));
let comp = data.find('.bv-item-wrapper'),
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
njoin = 0;
if (GJuser.zp.includes(',' + zpnam + '(z=') && !_this.getConfig('check_all', false)) {
let zpga = GJuser.zp.split(',' + zpnam + '(z=')[1].split('),')[0],
zpdtnw = new Date(),
zptnw = (zpdtnw.getHours() * 60) + zpdtnw.getMinutes(),
zpdnw = zpdtnw.getDate(),
zpdga = parseInt(zpga.slice(0, 2)),
zptga = parseInt(zpga.slice(2, 6));
if (zpdnw === zpdga || (zpdnw !== zpdga && zptnw < zptga)) {
njoin = 3;
}
}
if (GJuser.zp.includes(',' + zpnam + '(s),') && _this.getConfig('check_in_steam', true)) {
njoin = 1;
}
if (GJuser.zp.includes(',' + zpnam + '(b),') && _this.getConfig('blacklist_on', false)) {
njoin = 2;
}
if (_this.getConfig('log', true) && njoin > 0) {
_this.log(Lang.get('service.checking') + '|' + (zprnd + 1) + '№|  ' + _this.logLink(zplink, zpnam.replace(/-/g, ' ')), 'chk');
if (njoin === 1) {
_this.log(Lang.get('service.have_on_steam'), 'steam');
}
if (njoin === 2) {
_this.log(Lang.get('service.blacklisted'), 'black');
}
if (njoin === 3) {
_this.log(Lang.get('service.already_joined'), 'skip');
}
}
if (njoin === 0) {
$.ajax({
url: zplink,
success: function (html) {
html = html.replace(/<img/gi, '<noload');
let zpname = $(html).find('.mycompetition .form-group .span8 > h1').text().trim(),
zpsteam = html.substring(html.indexOf('href="https://store.steam')+6, html.indexOf('</a></p>')).slice(0, 55),
entered = html.indexOf('You have already entered today') >= 0,
enter = html.indexOf('>Enter this competition<') >= 0,
zpown = 0,
zpapp = 0,
zpsub = 0,
zpid = '???',
zpstm = '';
if (!zpsteam.includes('https://store.steam')) {
zpsteam = undefined;
}
if (entered) {
if (!_this.getConfig('check_all', false)) {
_this.skip = true;
}
zpown = 5;
}
if (zpsteam !== undefined) {
if (zpsteam.includes('app/')) {
zpapp = parseInt(zpsteam.split('app/')[1].split('/')[0].split('?')[0].split('#')[0]);
zpid = 'app/' + zpapp;
zpstm = 'https://store.steampowered.com/app/' + zpapp;
}
if (zpsteam.includes('sub/')) {
zpsub = parseInt(zpsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
zpid = 'sub/' + zpsub;
zpstm = 'https://store.steampowered.com/sub/' + zpsub;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' || GJuser.ownsubs === '[]') {
_this.log(Lang.get('service.steam_error'), 'err');
zpown = 2;
}
if (GJuser.ownapps.includes(',' + zpapp + ',') && zpapp > 0) {
zpown = 1;
}
if (GJuser.ownsubs.includes(',' + zpsub + ',') && zpsub > 0) {
zpown = 1;
}
if (zpown === 1) {
GJuser.zp = GJuser.zp + zpnam + '(s),';
}
}
if (GJuser.black.includes(zpid + ',') && _this.getConfig('blacklist_on', false)) {
GJuser.zp = GJuser.zp + zpnam + '(b),';
zpown = 4;
}
}
if (_this.getConfig('log', true)) {
if (zpstm !== '') {
_this.log(Lang.get('service.checking') + '|' + (zprnd + 1) + '№|' + _this.logLink(zpstm, zpid) + '|  ' + _this.logLink(zplink, zpname), 'chk');
}
else {
_this.log(Lang.get('service.checking') + '|' + (zprnd + 1) + '№|  ' + _this.logLink(zplink, zpname), 'chk');
}
if (entered && zpown === 5) {
_this.log(Lang.get('service.already_joined'), 'skip');
}
if (zpown === 1) {
_this.log(Lang.get('service.have_on_steam'), 'steam');
}
if (zpown === 4) {
_this.log(Lang.get('service.blacklisted'), 'black');
}
}
if (enter && zpown === 0) {
let tmout = Math.floor(Math.random() * Math.floor(zpnext / 3)) + Math.floor(zpnext / 3);
setTimeout(function () {
$.ajax({
url: zplink + '/enter_competition',
success: function (response) {
response = $(response.replace(/<img/gi, '<noload').replace(/<ins/gi, '<noload'));
let zpdt = new Date(),
zph = zpdt.getHours(),
zpm = (zpdt.getMinutes() + 1),
zpd = zpdt.getDate(),
zpt = ('0' + zpd.toString()).slice(-2) + ('0000' + ((zph * 60) + zpm).toString()).slice(-4);
if (GJuser.zp.includes(zpnam + '(z=')) {
let zptold = GJuser.zp.split(',' + zpnam + '(z=')[1].split('),')[0];
GJuser.zp = GJuser.zp.replace(zpnam + '(z=' + zptold, zpnam + '(z=' + zpt);
}
else {
GJuser.zp = GJuser.zp + zpnam + '(z=' + zpt + '),';
}
if (zpstm !== '') {
_this.log(Lang.get('service.entered_in') + '|' + (zprnd + 1) + '№|' + _this.logLink(zpstm, zpid) + '|  ' + _this.logLink(zplink, zpname), 'enter');
}
else {
_this.log(Lang.get('service.entered_in') + '|' + (zprnd + 1) + '№|  ' + _this.logLink(zplink, zpname), 'enter');
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
