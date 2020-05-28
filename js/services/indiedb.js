'use strict';
class IndieDB extends Joiner {
constructor() {
super();
this.domain = 'indiedb.com';
this.websiteUrl = 'https://www.indiedb.com';
this.authContent = 'View your profile';
this.authLink = 'https://www.indiedb.com/members/login';
delete this.settings.pages;
delete this.settings.interval_from;
delete this.settings.interval_to;
delete this.settings.check_in_steam;
delete this.settings.blacklist_on;
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
callback(call);
});
}
getUserInfo(callback) {
let userData = {
avatar: dirapp + 'images/IndieDB.png',
username: 'IndieDB User'
};
if (GJuser.username !== 'GiveawayJoiner') {
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
link = cont.find('h2 a').attr('href'),
name = cont.find('h2 a').text(),
id = '';
if (link !== undefined) {
id = data.substring(data.indexOf('<meta property="og:image" content="')+81).slice(0, 8).match(/[\d]+/)[0];
enter = data.indexOf('"buttonenter buttongiveaway">Join Giveaway<') >= 0;
entered = data.indexOf('"buttonenter buttonentered buttongiveaway">Success - Giveaway joined<') >= 0;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + ' ' + _this.logLink(link, name), 'chk');
if (entered) {
_this.log(Lang.get('service.already_joined'), 'jnd');
}
}
}
if (enter) {
entered = true;
let eLink = cont.find('p a.buttonenter').attr('href');
rq({
method: 'GET',
url: _this.url + eLink,
headers: _this.dload,
responseType: 'document'
});
_this.log(Lang.get('service.entered_in') + _this.logLink(link, name), 'enter');
}
let adds = '',
curradds = 0;
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
_this.setStatus('win');
_this.setConfig('won', idbwon);
if (_this.getConfig('sound', true)) {
new Audio(dirapp + 'sounds/won.wav').play();
}
}
}
}
);
}
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.reach_end'), 'skip');
_this.log(Lang.get('service.checked') + 'Giveaways', 'srch');
}
if (_this.started) {
_this.setStatus('good');
}
return;
}
let idbnext = 5000,
addlink = adds.eq(curradds).find('a').attr('href'),
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
_this.log(Lang.get('service.done') + name + ' - ' + finish, 'info');
}
})
.finally(() => {
if (!addlink.includes('the-challenge-of-adblock')) {
_this.log(Lang.get('service.done') + name + ' - ' + finish, 'info');
}
});
}
else if (addlink.includes('http')) {
rq({
method: 'GET',
url: _this.url + '/giveaways/ajax/'+ finish + '/' + id,
headers: _this.dload,
responseType: 'document'
})
.finally(() => {
_this.log(Lang.get('service.done') + name + ' - ' + finish, 'info');
});
}
}
else {
idbnext = 100;
}
curradds++;
setTimeout(giveawayEnter, idbnext);
}
giveawayEnter();
});
}
}
