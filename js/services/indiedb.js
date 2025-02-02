'use strict';
class IndieDB extends Joiner {
constructor() {
super();
this.domain = 'indiedb.com';
this.websiteUrl = 'https://www.indiedb.com';
this.website = this.websiteUrl;
this.authContent = 'View your profile';
this.settings.steam_only = { type: 'checkbox', trans: 'service.steam_only', default: this.getConfig('steam_only', false) };
this.settings.login_steam = { type: 'checkbox', trans: 'service.login_steam', default: this.getConfig('login_steam', false) };
if (this.getConfig('login_steam', false)) {
this.authLink = 'https://www.indiedb.com/members/loginext/steam';
}
else {
this.authLink = 'https://www.indiedb.com/members/login';
}
this.setConfig('check_in_steam', false);
delete this.settings.pages;
delete this.settings.interval_from;
delete this.settings.interval_to;
super.init();
}
authCheck(callback) {
let call = -1;
rq({
method: 'GET',
url: 'https://www.indiedb.com',
headers: {
'authority': 'www.indiedb.com',
'user-agent': this.ua,
'sec-fetch-site': 'none',
'sec-fetch-mode': 'navigate',
'sec-fetch-user': '?1',
'sec-fetch-dest': 'document',
'cookie': this.cookies
},
responseType: 'document'
})
.then((auths) => {
let auth = auths.data;
auth = auth.replace(/<img/gi, '<noload');
if (auth.indexOf('View your profile') >= 0) {
call = 1;
}
else {
call = 0;
}
})
.finally(() => {
if (call === 1) {
callback(1);
}
else if (call === -1) {
callback(-1);
}
else if (!GJuser.waitAuth) {
GJuser.waitAuth = true;
call = -1;
Browser.webContents.on('did-finish-load', () => {
if (Browser.getURL().indexOf('https://steamcommunity.com/openid/login?openid.ns') >= 0) {
Browser.webContents.executeJavaScript('document.getElementById("imageLogin").click()');
}
if (Browser.getURL().indexOf('https://www.indiedb.com') >= 0) {
Browser.webContents.executeJavaScript('document.querySelector("body").innerHTML')
.then((body) => {
if (body.indexOf('View your profile') >= 0) {
Browser.webContents.removeAllListeners('did-finish-load');
setTimeout(() => {
call = 1;
Browser.close();
}, 1000);
}
setTimeout(() => {
call = 0;
Browser.close();
}, 10000);
});
setTimeout(() => {
call = -1;
Browser.close();
}, 30000);
}
else {
setTimeout(() => {
Browser.loadURL('https://www.indiedb.com');
}, 5000);
setTimeout(() => {
call = -1;
Browser.close();
}, 30000);
}
});
Browser.setTitle(Lang.get('service.browser_loading'));
if (this.getConfig('login_steam', false)) {
Browser.loadURL('https://www.indiedb.com/members/loginext/steam');
}
else {
call = 0;
Browser.close();
}
Browser.once('close', () => {
Browser.webContents.removeAllListeners('did-finish-load');
Browser.loadFile('blank.html');
GJuser.waitAuth = false;
callback(call);
});
}
else {
callback(-2);
}
});
}
getUserInfo(callback) {
let userData = {
avatar: '../app.asar/images/IndieDB.png',
username: 'IndieDB User'
};
if (GJuser.username !== 'User') {
userData.avatar = GJuser.avatar;
userData.username = GJuser.username;
}
callback(userData);
}
joinService() {
let _this = this;
let idbtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = idbtimer;
_this.won = _this.getConfig('won', 0);
_this.url = 'https://www.indiedb.com';
_this.idburl = 'www.indiedb.com';
_this.dload = {
'authority': _this.idburl,
'user-agent': _this.ua,
'sec-fetch-site': 'none',
'sec-fetch-mode': 'navigate',
'sec-fetch-user': '?1',
'sec-fetch-dest': 'document',
'cookie': _this.cookies
};
let data = 'err',
enter = false,
entered = false;
rq({
method: 'GET',
url: _this.url + '/giveaways',
headers: _this.dload,
responseType: 'document'
})
.then((datas) => {
data = datas.data.replace(/<img/gi, '<noload');
})
.finally(() => {
if (data === 'err') {
_this.log(Lang.get('service.connection_error'), 'err');
}
let cont = $(data).find('#articlecontent'),
info = $(data).find('#giveawaysprofilemenu > div.inner > div > div.table.tablemenu > div'),
link = cont.find('h2 a').attr('href'),
name = cont.find('h2 a').text(),
idbsteam = '',
id = '',
ga = '',
entries = '?',
copies = '?',
idbown = 0,
idbapp = 0,
idbsub = 0,
idbbun = 0,
idbid = '???';
if (info !== undefined) {
if (info.length === 6) {
idbsteam = info.eq(1).find('span > a').attr('href');
ga = info.eq(2).find('span').text().trim();
copies = info.eq(3).find('span').text().trim();
entries = info.eq(4).find('span').text().trim();
}
else {
ga = info.eq(1).find('span').text().trim();
copies = info.eq(2).find('span').text().trim();
entries = info.eq(3).find('span').text().trim();
}
}
if (link !== undefined) {
link = _this.url + link;
id = data.substring(data.indexOf('<meta property="og:image" content="')+81).slice(0, 8).match(/[\d]+/)[0];
enter = data.indexOf('"buttonenter buttongiveaway">Join Giveaway<') >= 0;
entered = data.indexOf('"buttonenter buttonentered buttongiveaway">Success - Giveaway joined<') >= 0;
if (entered) {
idbown = 3;
}
let idblog = _this.logLink(link, name);
if (_this.getConfig('log', true)) {
idblog = '|' + copies + 'x|' + entries + 'e|  ' + idblog;
}
if (ga === 'Steam') {
if (idbsteam !== undefined && idbsteam.includes('https://store.steam')) {
if (idbsteam.includes('app/')) {
idbapp = parseInt(idbsteam.split('app/')[1].split('/')[0].split('?')[0].split('#')[0]);
idbid = 'app/' + idbapp;
}
else if (idbsteam.includes('sub/')) {
idbsub = parseInt(idbsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
idbid = 'sub/' + idbsub;
}
else if (idbsteam.includes('bundle/')) {
idbbun = parseInt(idbsteam.split('bundle/')[1].split('/')[0].split('?')[0].split('#')[0]);
idbid = 'bundle/' + idbbun;
}
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '' && GJuser.ownsubs === '') {
idbown = 2;
}
if (GJuser.ownapps.includes(',' + idbapp + ',') && idbapp > 0) {
idbown = 1;
}
if (GJuser.ownsubs.includes(',' + idbsub + ',') && idbsub > 0) {
idbown = 1;
}
}
if (GJuser.black.includes(idbid + ',') && _this.getConfig('blacklist_on', false)) {
idbown = 4;
}
if (GJuser.card.includes(',' + idbapp + ',')) {
idblog = '♦ ' + idblog;
}
if (!_this.getConfig('log', true)) {
idblog = idblog + _this.logWhite(idbid) + _this.logBlack(idbid);
}
}
else if (_this.getConfig('steam_only', false)) {
idbown = 5;
}
if (idbid !== '???') {
_this.log(Lang.get('service.checking') + ' ' + idblog + _this.logWhite(idbid) + _this.logBlack(idbid), 'chk');
}
else {
_this.log(Lang.get('service.checking') + ' ' + idblog, 'chk');
}
if (idbown > 0) {
switch (idbown) {
case 1:
_this.log(Lang.get('service.have_on_steam'), 'steam');
break;
case 2:
_this.log(Lang.get('service.steam_error'), 'err');
break;
case 3:
_this.log(Lang.get('service.already_joined'), 'jnd');
break;
case 4:
_this.log(Lang.get('service.blacklisted'), 'black');
break;
case 5:
_this.log(Lang.get('service.skipped'), 'skip');
break;
}
}
else if (idbown === 0 && enter) {
entered = true;
let eLink = cont.find('p a.buttonenter').attr('href');
rq({
method: 'GET',
url: _this.url + eLink,
headers: _this.dload,
responseType: 'document'
});
_this.log(Lang.get('service.entered_in') + idblog, 'enter');
}
}
let adds = '',
curradds = -1;
if (entered) {
adds = cont.find('#giveawaysjoined > div p');
}
function giveawayEnter() {
if (adds.length <= curradds || !_this.started) {
if ((new Date()).getDate() !== _this.dcheck) {
let win = 'err';
rq({
method: 'GET',
url: _this.url + '/giveaways/prizes',
headers: _this.dload,
responseType: 'document'
})
.then((wins) => {
win = wins.data;
})
.finally(() => {
if (win !== 'err') {
win = win.replace(/<img/gi, '<noload');
let prizes = $(win).find('.body.clear .table .row.rowcontent span.subheading:nth-of-type(2)'),
idbprize = '',
idbwon = 0;
_this.dcheck = (new Date()).getDate();
if (prizes === undefined) {
prizes = '';
}
for (let idbcurr = 0; idbcurr < prizes.length; idbcurr++) {
idbprize = prizes.eq(idbcurr).text().trim();
if (idbprize !== '-' && !idbprize.includes('Check in')) {
idbwon++;
}
}
if (idbwon < _this.won) {
_this.setConfig('won', idbwon);
}
if (idbwon > 0 && idbwon > _this.won) {
_this.log(_this.logLink(_this.url + '/giveaways/prizes', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + (idbwon - _this.won) + ')'), 'win');
_this.logWin(' IndieDB - ' + (idbwon - _this.won));
_this.setStatus('win');
_this.setConfig('won', idbwon);
if (_this.getConfig('sound', true)) {
new Audio('../app.asar/sounds/won.wav').play();
}
}
}
}
);
}
_this.log(Lang.get('service.reach_end'), 'skip');
setTimeout(() => {
_this.log(Lang.get('service.checked') + 'Giveaways', 'srch');
}, 10000);
if (_this.started) {
setTimeout(() => {
if (_this.statusIcon.attr('data-status') === 'work') {
_this.setStatus('good');
}
}, 10000);
}
return;
}
let idbnext = 7000;
if (curradds >= 0) {
let addlink = adds.eq(curradds).find('a').attr('href'),
finish = adds.eq(curradds).find('a').attr('class');
if (!finish.includes('buttonentered')) {
finish = finish.replace('buttonenter buttoncomplete','').trim();
if (finish === '') {
finish = addlink;
}
if (!addlink.includes('http')) {
rq({
method: 'GET',
url: _this.url + addlink,
headers: _this.dload,
responseType: 'document'
})
.then((resps) => {
let resp = resps.data;
resp = resp.replace(/<img/gi, '<noload');
let check = resp.indexOf('<p><strong>Support us by subscribing:</strong></p>') >= 0;
if (!check) {
_this.log(Lang.get('service.done') + name + ' - ' + finish, 'enter');
}
})
.finally(() => {
if (!addlink.includes('the-challenge-of-adblock')) {
_this.log(Lang.get('service.done') + name + ' - ' + finish, 'enter');
}
});
}
else if (addlink.includes('http')) {
rq({
method: 'POST',
url: _this.url + '/giveaways/ajax/'+ finish + '/' + id,
headers: {
'authority': _this.idburl,
'user-agent': _this.ua,
'content-type': 'application/x-www-form-urlencoded; charset=UTF-8',
'accept': 'application/json, text/javascript, */*; q=0.01',
'cookie': _this.cookies
},
data: 'ajax=t'
})
.then((i) => {})
.finally(() => {
_this.log(Lang.get('service.done') + name + ' - ' + finish, 'enter');
});
}
}
else {
idbnext = 200;
}
}
curradds++;
setTimeout(giveawayEnter, idbnext);
}
giveawayEnter();
});
}
}
