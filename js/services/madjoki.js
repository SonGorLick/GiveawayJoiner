'use strict';
class Madjoki extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://steam.madjoki.com/apps/free';
this.authContent = 'Logout';
this.authLink = 'https://steam.madjoki.com/login';
this.settings.timer_from = { type: 'number', trans: 'service.timer_from', min: 5, max: this.getConfig('timer_to', 90), default: this.getConfig('timer_from', 70) };
this.settings.timer_to = { type: 'number', trans: 'service.timer_to', min: this.getConfig('timer_from', 70), max: 2880, default: this.getConfig('timer_to', 90) };
this.settings.mj_black = { type: 'checkbox', trans: this.transPath('mj_black'), default: this.getConfig('mj_black', true) };
this.settings.add_game = { type: 'checkbox', trans: this.transPath('add_game'), default: this.getConfig('add_game', true) };
this.settings.add_media = { type: 'checkbox', trans: this.transPath('add_media'), default: this.getConfig('add_media', false) };
this.settings.auto_mj_black = { type: 'checkbox', trans: this.transPath('auto_mj_black'), default: this.getConfig('auto_mj_black', true) };
this.settings.add_app = { type: 'checkbox', trans: this.transPath('add_app'), default: this.getConfig('add_app', false) };
this.settings.add_music = { type: 'checkbox', trans: this.transPath('add_music'), default: this.getConfig('add_music', false) };
this.settings.add_tool = { type: 'checkbox', trans: this.transPath('add_tool'), default: this.getConfig('add_tool', false) };
this.settings.add_dlc = { type: 'checkbox', trans: this.transPath('add_dlc'), default: this.getConfig('add_dlc', true) };
this.settings.add_video = { type: 'checkbox', trans: this.transPath('add_video'), default: this.getConfig('add_video', false) };
this.settings.add_pack = { type: 'checkbox', trans: this.transPath('add_pack'), default: this.getConfig('add_pack', false) };
this.settings.add_demo = { type: 'checkbox', trans: this.transPath('add_demo'), default: this.getConfig('add_demo', false) };
this.settings.add_series = { type: 'checkbox', trans: this.transPath('add_series'), default: this.getConfig('add_series', false) };
this.settings.add_cfg = { type: 'checkbox', trans: this.transPath('add_cfg'), default: this.getConfig('add_cfg', false) };
delete this.settings.interval_from;
delete this.settings.interval_to;
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
_this.limit = 0;
_this.added = ',';
if (_this.dsave !== ',') {
page = 1;
}
_this.pagemax = _this.getConfig('pages', 1) + 14;
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
html = 'err',
mjurl = _this.url;
if (page === 0 && _this.dsave === ',') {
mjurl = 'https://store.steampowered.com/account/languagepreferences';
}
else if (page !== 0 && page <= 7 && _this.dsave !== ',') {
mjurl = mjurl + 'apps/free?type=' + Math.pow(2, (page - 1));
}
else if (page > 7 && page <= 14 && _this.dsave !== ',') {
mjurl = mjurl + 'apps/free?type=' + Math.pow(2, page);
}
else if (page > 14 && _this.dsave !== ',') {
mjurl = mjurl + 'apps/free?page=' + (page - 14) + '&desc=0';
}
else {
mjurl = mjurl + 'apps/free';
}
$.ajax({
url: mjurl,
success: function (datas) {
datas = datas.replace(/<img/gi, '<noload');
html = $('<div>' + datas + '</div>');
if (page === 0 && _this.dsave === ',') {
_this.dsave = datas.substring(datas.indexOf('var g_sessionID = "')+19,datas.indexOf('var g_ServerTime')).slice(0, 24);
}
},
complete: function () {
let mjfound = '',
mjtime = '';
if (page > 0) {
CSRF = html.find('meta[name="_token"]').attr('content');
if (CSRF.length < 10) {
_this.log('CSRF token not found', 'err');
return;
}
mjfound = html.find('tbody tr');
mjtime = html.find('.alert-info.alert > time').text();
}
let mjcurr = 0,
mjcrr = 0,
mjarray = Array.from(Array(mjfound.length).keys());
if (html === 'err') {
_this.pagemax = page;
_this.log(Lang.get('service.connection_error'), 'err');
}
function giveawayEnter() {
if (_this.limit >= 50 || mjfound.length < 50 && page > 14) {
_this.pagemax = page;
}
if (mjarray.length <= mjcurr || _this.limit >= 50 || !_this.started) {
if (_this.limit >= 50) {
_this.log('Steam limit - 50', 'skip');
}
if (page === _this.pagemax) {
if (mjarray.length <= mjcurr) {
_this.log(Lang.get('service.reach_end'), 'skip');
}
if (page - 14 < 0) {
_this.log(Lang.get('service.checked') + '0#-' + _this.getConfig('pages', 1) + '#', 'srch');
}
else {
_this.log(Lang.get('service.checked') + (page - 14) + '#-' + _this.getConfig('pages', 1) + '#', 'srch');
}
setTimeout(() => {
fs.writeFile(dirdata + 'mj_blacklist.txt', _this.dload, (err) => { });
}, 5000);
}
else if (page - 14 > 0) {
_this.log(Lang.get('service.checked') + (page - 14) + '#', 'srch');
}
if (page === _this.pagemax) {
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
_this.log(Lang.get('service.done') + upd.message, 'info');
}
}, error: () => {}
});
}
if (_this.started) {
if (_this.statusIcon.attr('data-status') !== 'win') {
_this.setStatus('good');
}
}
}
if (callback) {
callback();
}
return;
}
let mjnext = 4000,
mjcrr = mjarray[mjcurr],
card = mjfound.eq(mjcrr),
name = card.find('td:nth-of-type(6) > a').text(),
mjsteam = card.find('td:nth-of-type(6) > a').attr('href'),
mjsubid = card.find('td:nth-of-type(3)').text().trim(),
mjname = card.find('td:nth-of-type(4)').text().trim(),
mjown = 0,
mjapp = 0,
mjsub = 0,
mjbun = 0,
mjid = '';
if (mjsteam.includes('app/')) {
mjapp = parseInt(mjsteam.split('app/')[1].split('/')[0].split('?')[0].split('#')[0]);
mjid = 'app/' + mjapp;
}
else if (mjsteam.includes('sub/')) {
mjsub = parseInt(mjsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
mjid = 'sub/' + mjsub;
}
else if (mjsteam.includes('bundle/')) {
mjbun = parseInt(mjsteam.split('bundle/')[1].split('/')[0].split('?')[0].split('#')[0]);
mjid = 'bundle/' + mjbun;
}
if (_this.dload.includes(',' + mjsubid + ',') && _this.getConfig('mj_black', true)) {
mjown = 4;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '' && GJuser.ownsubs === '') {
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
if (mjname === 'Game' && !_this.getConfig('add_game', true)) {
mjown = 5;
}
if (mjname === 'DLC' && !_this.getConfig('add_dlc', true)) {
mjown = 5;
}
if (mjname === 'Demo' && !_this.getConfig('add_demo', false)) {
mjown = 5;
}
if (mjname === 'Application' && !_this.getConfig('add_app', false)) {
mjown = 5;
}
if (mjname === 'Tool' && !_this.getConfig('add_tool', false)) {
mjown = 5;
}
if (mjname === 'Media' && !_this.getConfig('add_media', false)) {
mjown = 5;
}
if (mjname === 'Music' && !_this.getConfig('add_music', false)) {
mjown = 5;
}
if (mjname === 'Video' && !_this.getConfig('add_video', false)) {
mjown = 5;
}
if (mjname === 'Series' && !_this.getConfig('add_series', false)) {
mjown = 5;
}
if (mjname === 'Package' && !_this.getConfig('add_pack', false)) {
mjown = 5;
}
if (mjname === 'Config' && !_this.getConfig('add_cfg', false)) {
mjown = 5;
}
if (_this.added.includes(',' + mjsubid + ',')) {
mjown = 7;
}
if (_this.dsave === ',' || _this.dsave === undefined) {
_this.pagemax = page;
mjcurr = 1000;
mjown = 6;
}
let mjlog = _this.logLink(mjsteam, name);
if (_this.getConfig('log', true)) {
if (page < 15) {
mjlog = '|0#|' + mjsubid + '|' + mjname + '|  ' + mjlog;
}
else {
mjlog = '|' + (page - 14) + '#|' + (mjcrr + 1) + '№|' + mjsubid + '|' + mjname + '|  ' + mjlog;
}
}
else {
mjlog = mjlog  + _this.logBlack(mjid);
}
if (mjown !== 7) {
_this.log(Lang.get('service.checking') + mjlog + _this.logBlack(mjid), 'chk');
}
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
_this.log(Lang.get('service.blacklisted') + ' Madjoki', 'black');
break;
case 5:
_this.log(Lang.get('service.skipped'), 'skip');
break;
case 6:
_this.log('Steam g_session data error', 'err');
break;
}
if (mjown === 0) {
let rp = 'err';
$.ajax({
method: 'POST',
url: 'https://store.steampowered.com/checkout/addfreelicense',
data: ({action: 'add_to_cart', sessionid: _this.dsave, subid: mjsubid}),
headers: {
'Content-Type': 'application/x-www-form-urlencoded'
},
success: function (rps) {
rp = rps;
if (rp.indexOf('add_free_content_success_area') >= 0) {
_this.log(Lang.get('service.added') + mjlog, 'enter');
_this.added = _this.added + mjsubid + ',';
}
else if (rp.indexOf('error_box') >= 0) {
if (_this.getConfig('auto_mj_black', true)) {
_this.dload = _this.dload + mjsubid + ',';
}
_this.log(Lang.get('service.cant_join'), 'cant');
}
else {
rp = 'err';
}
},
complete: function () {
_this.limit++;
if (rp === 'err') {
mjnext = 29000;
if (mjarray.filter(i => i === mjcrr).length === 1) {
mjarray.push(mjcrr);
_this.log(Lang.get('service.err_join'), 'cant');
}
else {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
}
});
}
else {
mjnext = 100;
}
mjcurr++;
setTimeout(giveawayEnter, mjnext);
}
giveawayEnter();
}
});
}
}
