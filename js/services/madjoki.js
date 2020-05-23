'use strict';
class Madjoki extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://steam.madjoki.com';
this.authContent = 'Logout';
this.authLink = 'https://steam.madjoki.com/login';
this.withValue = false;
this.settings.timer_from = { type: 'number', trans: 'service.timer_from', min: 5, max: this.getConfig('timer_to', 90), default: this.getConfig('timer_from', 70) };
this.settings.timer_to = { type: 'number', trans: 'service.timer_to', min: this.getConfig('timer_from', 70), max: 2880, default: this.getConfig('timer_to', 90) };
this.settings.mj_black = { type: 'checkbox', trans: this.transPath('mj_black'), default: this.getConfig('mj_black', true) };
this.settings.add_game = { type: 'checkbox', trans: this.transPath('add_game'), default: this.getConfig('add_game', true) };
this.settings.auto_mj_black = { type: 'checkbox', trans: this.transPath('auto_mj_black'), default: this.getConfig('auto_mj_black', true) };
this.settings.add_dlc = { type: 'checkbox', trans: this.transPath('add_dlc'), default: this.getConfig('add_dlc', true) };
this.settings.add_tool = { type: 'checkbox', trans: this.transPath('add_tool'), default: this.getConfig('add_tool', false) };
this.settings.add_app = { type: 'checkbox', trans: this.transPath('add_app'), default: this.getConfig('add_app', false) };
this.settings.add_media = { type: 'checkbox', trans: this.transPath('add_media'), default: this.getConfig('add_media', false) };
this.settings.add_demo = { type: 'checkbox', trans: this.transPath('add_demo'), default: this.getConfig('add_demo', false) };
delete this.settings.interval_from;
delete this.settings.interval_to;
delete this.settings.pages;
delete this.settings.sound;
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: dirapp + 'images/Madjoki.png',
username: 'Madjoki'
};
callback(userData);
}
joinService() {
let _this = this;
let mjtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 90) - _this.getConfig('timer_from', 70))) + _this.getConfig('timer_from', 70));
_this.stimer = mjtimer;
let page = 0;
_this.dcheck = 0;
_this.pagemax = 5;
if (fs.existsSync(dirdata + 'mj_blacklist.txt')) {
let mjdata = fs.readFileSync(dirdata + 'mj_blacklist.txt');
if (mjdata.length > 1) {
_this.dload = mjdata.toString();
}
}
else {
fs.writeFile(dirdata + 'mj_blacklist.txt', ',', (err) => { });
}
_this.url = 'https://steam.madjoki.com/';
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
let CSRF = '',
mjname = '',
mjpage = Math.pow(2, page);
if (mjpage === 0) {
mjpage = 1;
}
$.ajax({
url: _this.url + 'apps/free?type=' + mjpage,
success: function (html) {
html = $('<div>' + html.replace(/<img/gi, '<noload') + '</div>');
CSRF = html.find('meta[name="_token"]').attr('content');
let mjfound = html.find('tbody tr'),
mjtime = html.find('.alert-info.alert > time').text();
if (CSRF.length < 10) {
_this.log('CSRF token not found', 'err');
_this.stopJoiner(true);
return;
}
let mjcurr = 0;
switch (page) {
case 0:
if (_this.getConfig('add_game', true)) {
mjname = 'Game';
}
break;
case 1:
if (_this.getConfig('add_app', false)) {
mjname = 'App';
}
break;
case 2:
if (_this.getConfig('add_tool', false)) {
mjname = 'Tool';
}
break;
case 3:
if (_this.getConfig('add_demo', false)) {
mjname = 'Demo';
}
break;
case 4:
if (_this.getConfig('add_media', false)) {
mjname = 'Media';
}
break;
case 5:
if (_this.getConfig('add_dlc', true)) {
mjname = 'DLC';
}
break;
}
if (page === 0) {
if (
(!mjtime.includes('minute')) &&
(!mjtime.includes('second')) &&
(!mjtime.includes('hour '))
)
{
$.ajax({
url: _this.url + 'api/updatemetadata',
method: 'POST',
headers: {
'X-CSRF-TOKEN': CSRF,
'Accept': 'accept: */*',
'X-Requested-With': 'XMLHttpRequest',
},
dataType: 'json',
success : function (upd) {
if (upd.message !== undefined) {
_this.log(Lang.get('service.hided').split(' ')[0] + ' ' + upd.message, 'info');
}
}
});
}
}
function giveawayEnter() {
if (mjname === '') {
mjcurr = 100;
}
if (_this.dcheck >= 50) {
page = _this.pagemax;
}
if (mjfound.length <= mjcurr || _this.dcheck >= 50 || !_this.started) {
if (_this.getConfig('log', true)) {
if (_this.dcheck >= 50) {
_this.log('Steam limit - 50', 'skip');
}
if (page === _this.pagemax) {
_this.log(Lang.get('service.checked') + 'All Free Packages', 'srch');
setTimeout(function () {
fs.writeFile(dirdata + 'mj_blacklist.txt', _this.dload, (err) => { });
}, 6000);
}
}
if (callback) {
callback();
}
return;
}
let mjnext = 3000,
card = mjfound.eq(mjcurr),
name = card.find('td:nth-of-type(6) > a').text(),
mjsteam = card.find('td:nth-of-type(6) > a').attr('href'),
mjsubid = card.find('td:nth-of-type(3)').text().trim(),
mjown = 0,
mjapp = 0,
mjsub = 0,
mjbun = 0,
mjid = '???';
if (mjsteam.includes('app/')) {
mjapp = parseInt(mjsteam.split('app/')[1].split('/')[0].split('?')[0].split('#')[0]);
mjid = 'app/' + mjapp;
}
if (mjsteam.includes('sub/')) {
mjsub = parseInt(mjsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
mjid = 'sub/' + mjsub;
}
if (mjsteam.includes('bundle/')) {
mjbun = parseInt(mjsteam.split('bundle/')[1].split('/')[0].split('?')[0].split('#')[0]);
mjid = 'bundle/' + mjbun;
}
if (_this.dload.includes(',' + mjsubid + ',') && _this.getConfig('mj_black', true)) {
mjown = 4;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '[]' && GJuser.ownsubs === '[]') {
mjown = 2;
}
if (GJuser.ownapps.includes(',' + mjapp + ',') && mjapp > 0) {
mjown = 1;
}
if (GJuser.ownsubs.includes(',' + mjsub + ',') && mjsub > 0) {
mjown = 1;
}
}
if (GJuser.black.includes(mjid + ',') && _this.getConfig('blacklist_on', false)) {
mjown = 3;
}
if (GJuser.steam === '' || GJuser.steam === undefined) {
mjown = 5;
}
let mjlog = _this.logLink(mjsteam, name);
if (_this.getConfig('log', true)) {
mjlog = '|' + mjname + '#|' + (mjcurr + 1) + '№|' + mjsubid + '|  ' + mjlog;
_this.log(Lang.get('service.checking') + mjlog, 'chk');
switch (mjown) {
case 1:
_this.log(Lang.get('service.have_on_steam'), 'steam');
break;
case 2:
_this.log(Lang.get('service.steam_error'), 'err');
break;
case 3:
_this.log(Lang.get('service.blacklisted'), 'black');
break;
case 4:
_this.log(Lang.get('service.blacklisted') + ' Madjoki', 'skip');
break;
case 5:
_this.log('Steam g_session data error', 'err');
_this.pagemax = page;
mjcurr = 1000;
break;
}
}
if (mjown === 0) {
$.ajax({
method: 'POST',
url: 'https://store.steampowered.com/checkout/addfreelicense',
data: ({action: 'add_to_cart', sessionid: GJuser.steam, subid: mjsubid}),
headers: {
'Content-Type': 'application/x-www-form-urlencoded'
},
success: function (rp) {
_this.dcheck++;
if (rp.indexOf('add_free_content_success_area') >= 0) {
_this.log(Lang.get('service.done') + mjlog, 'enter');
}
else if (rp.indexOf('error_box') >= 0) {
if (_this.getConfig('auto_mj_black', true)) {
_this.dload = _this.dload + mjsubid + ',';
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.cant_join'), 'cant');
}
}
else if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
},
error: function () {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
});
}
mjcurr++;
setTimeout(giveawayEnter, mjnext);
}
giveawayEnter();
}
});
}
}
