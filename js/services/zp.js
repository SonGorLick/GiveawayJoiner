'use strict';
class ZP extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.zeepond.com';
this.authContent = 'profile-pic';
this.authLink = 'https://www.zeepond.com/cb-login';
this.auth = this.auth + Lang.get('service.zp.login');
this.settings.interval_from = { type: 'number', trans: 'service.interval_from', min: 10, max: this.getConfig('interval_to', 20), default: this.getConfig('interval_from', 15) };
this.settings.interval_to = { type: 'number', trans: 'service.interval_to', min: this.getConfig('interval_from', 15), max: 60, default: this.getConfig('interval_to', 20) };
this.settings.skip_after = { type: 'checkbox', trans: this.transPath('skip_after'), default: this.getConfig('skip_after', true) };
this.settings.skip_xbox = { type: 'checkbox', trans: this.transPath('skip_xbox'), default: this.getConfig('skip_xbox', false) };
this.settings.check_all = { type: 'checkbox', trans: this.transPath('check_all'), default: this.getConfig('check_all', false) };
delete this.settings.pages;
super.init();
}
getUserInfo(callback) {
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
let zptimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = zptimer;
_this.dsave = ',';
_this.dload = ',';
if (fs.existsSync(dirdata + 'zp.txt')) {
let zpdata = fs.readFileSync(dirdata + 'zp.txt');
if (zpdata.length > 1) {
_this.dload = zpdata.toString();
}
}
_this.skip = false;
_this.month = 1;
let zpmonth = new Date().getMonth();
if (zpmonth > 2 && zpmonth < 10) {
_this.month = 0;
}
_this.won = _this.getConfig('won', 0);
_this.url = 'https://www.zeepond.com';
if ((new Date()).getDate() !== _this.dcheck) {
$.ajax({
url: _this.url + '/my-account/my-prizes',
success: function (win) {
win = $(win.replace(/<img/gi, '<noload').replace(/<ins/gi, '<noload'));
let zpwon = win.find('.form-group');
_this.dcheck = (new Date()).getDate();
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
}, error: () => {}
});
}
let data = 'err';
$.ajax({
url: _this.url + '/zeepond/giveaways/enter-a-competition',
success: function (datas) {
datas = datas.replace(/<img/gi, '<noload').replace(/<ins/gi, '<noload');
data = datas;
},
complete: function () {
let comp = $(data).find('.bv-item-wrapper'),
zpcurr = 0,
zpcrr = 0,
zparray = Array.from(Array(comp.length).keys());
if (data === 'err') {
_this.log(Lang.get('service.connection_error'), 'err');
}
function giveawayEnter() {
if (zparray.length <= zpcurr || _this.skip || !_this.started) {
if (comp.length <= zpcurr || _this.skip) {
setTimeout(() => {
fs.writeFile(dirdata + 'zp.txt', _this.dsave, (err) => { });
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
if (_this.started) {
setTimeout(() => {
_this.setStatus('good');
}, _this.interval());
}
return;
}
let zpnext = _this.interval(),
zpcrr = zparray[zpcurr],
zpcomp = comp.eq(zpcrr),
zplink = _this.url + zpcomp.find('.bv-item-image a').attr('href'),
zpnam = zplink.replace('https://www.zeepond.com/zeepond/giveaways/enter-a-competition/', ''),
njoin = 0,
zpblack = '',
zpdtnow = new Date();
zpdtnow.setDate(zpdtnow.getUTCDate());
zpdtnow.setHours(zpdtnow.getUTCHours() + 10 + _this.month);
let zpdnow = zpdtnow.getDate();
if (_this.dload.includes(',' + zpnam + '(d=')) {
zpblack = _this.dload.split(',' + zpnam + '(d=')[1].split('),')[0];
if (!_this.dsave.includes(',' + zpnam + '(d=' + zpblack + '),')) {
_this.dsave = _this.dsave + zpnam + '(d=' + zpblack + '),';
}
}
if (!_this.getConfig('check_all', false)) {
if (_this.dload.includes(',' + zpnam + '(z=')) {
let zpdga = parseInt(_this.dload.split(',' + zpnam + '(z=')[1].split('),')[0]);
if (zpdnow === zpdga) {
if (!_this.dsave.includes(',' + zpnam + '(z=' + zpdga + '),')) {
_this.dsave = _this.dsave + zpnam + '(z=' + zpdga + '),';
}
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
if (_this.getConfig('skip_xbox', false)) {
if (zpnam.includes('-xbox-') || zpnam.includes('-x-box-')) {
njoin = 5;
}
}
if (_this.dload.includes(',' + zpnam + '(w),')) {
if (!_this.dsave.includes(',' + zpnam + '(w)')) {
_this.dsave = _this.dsave + zpnam + '(w),';
}
njoin = 4;
}
}
if (zpblack !== '') {
zpblack = _this.logBlack(zpblack);
}
let zplog = _this.logLink(zplink, zpnam.replace(/-/g, ' '));
if (_this.getConfig('log', true)) {
zplog = '|' + (zpcrr + 1) + '№|  ' + zplog;
}
if (_this.getConfig('log', true) && njoin > 0) {
_this.log(Lang.get('service.checking') + zplog + zpblack, 'chk');
switch (njoin) {
case 1:
_this.log(Lang.get('service.have_on_steam'), 'steam');
break;
case 2:
_this.log(Lang.get('service.blacklisted'), 'black');
break;
case 3:
_this.log(Lang.get('service.time'), 'cant');
_this.log(Lang.get('service.data_have'), 'skip');
break;
case 4:
_this.log(Lang.get('service.won_skip'), 'jnd');
_this.log(Lang.get('service.data_have'), 'skip');
break;
case 5:
_this.log(Lang.get('service.skipped'), 'skip');
break;
}
}
if (njoin === 0) {
zpnext = zpnext + Math.floor(zpnext / 4) + 2100;
let html = 'err';
$.ajax({
url: zplink,
success: function (htmls) {
htmls = htmls.replace(/<img/gi, '<noload');
html = htmls;
},
complete: function () {
if (html === 'err') {
zpnext = 59000;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + zplog + zpblack, 'chk');
}
if (zparray.filter(i => i === zpcrr).length === 1) {
zparray.push(zpcrr);
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
else if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
else {
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
if (!_this.dsave.includes(',' + zpnam + '(z=' + zpdnow + '),')) {
_this.dsave = _this.dsave + zpnam + '(z=' + zpdnow + '),';
}
}
}
if (entered) {
if (!_this.dsave.includes(',' + zpnam + '(z=' + zpdnow + '),')) {
_this.dsave = _this.dsave + zpnam + '(z=' + zpdnow + '),';
}
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
else if (zpsteam.includes('sub/')) {
zpsub = parseInt(zpsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
zpid = 'sub/' + zpsub;
}
else if (zpsteam.includes('bundle/')) {
zpbun = parseInt(zpsteam.split('bundle/')[1].split('/')[0].split('?')[0].split('#')[0]);
zpid = 'bundle/' + zpbun;
}
if (!_this.dsave.includes(',' + zpnam + '(d=') && zpid !== '') {
_this.dsave = _this.dsave + zpnam + '(d=' + zpid + '),';
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
if (!_this.dsave.includes(',' + zpnam + '(w),')) {
_this.dsave = _this.dsave + zpnam + '(w),';
}
}
if (zpid !== '') {
zpid = _this.logBlack(zpid);
}
zplog = _this.logLink(zplink, zpname);
if (_this.getConfig('log', true)) {
zplog = '|' + (zpcrr + 1) + '№|  ' + zplog;
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
let tmout = Math.floor(zpnext / 4) + 2000,
resp = 'err';
setTimeout(() => {
$.ajax({
url: zplink + '/enter_competition',
success: function () {
resp = 'ok';
},
complete: function () {
if (resp === 'err') {
zpnext = 59000;
if (zparray.filter(i => i === zpcrr).length === 1) {
zparray.push(zpcrr);
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.err_join'), 'err');
}
}
else if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
else {
let zpdtnew = new Date();
zpdtnew.setDate(zpdtnew.getUTCDate());
zpdtnew.setHours(zpdtnew.getUTCHours() + 10 + _this.month);
let zpdnew = ('0' + zpdtnew.getDate().toString()).slice(-2);
_this.dsave = _this.dsave + zpnam + '(z=' + zpdnew + '),';
_this.log(Lang.get('service.entered_in') + zplog, 'enter');
}
}
});
}, tmout);
}
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
