'use strict';
class IndieDB extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.indiedb.com';
this.authContent = 'View your profile';
this.authLink = 'https://www.indiedb.com/members/login';
this.settings.sound = { type: 'checkbox', trans: 'service.sound', default: this.getConfig('sound', true) };
this.withValue = false;
delete this.settings.pages;
delete this.settings.interval_from;
delete this.settings.interval_to;
delete this.settings.check_in_steam;
delete this.settings.blacklist_on;
super.init();
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
if (_this.getConfig('timer_to', 700) !== _this.getConfig('timer_from', 500)) {
let idbtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = idbtimer;
}
_this.won = _this.getConfig('won', 0);
_this.url = 'https://www.indiedb.com';
$.ajax({
url: _this.url + '/giveaways/prizes',
success: function (html) {
html = html.replace(/<img/gi, '<noload');
let prizes = $(html).find('.body.clear .table .row.rowcontent span.subheading:nth-of-type(2)'),
idbprize = '',
idbwon = 0;
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
});
$.ajax({
url: _this.url + '/giveaways',
success: function (data) {
data = data.replace(/<img/gi, '<noload');
let cont = $(data).find('#articlecontent'),
link = cont.find('h2 a').attr('href'),
name = cont.find('h2 a').text();
if (link === undefined || !_this.started) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.reach_end'), 'skip');
_this.log(Lang.get('service.checked') + 'Giveaways', 'srch');
}
return;
}
let id = data.substring(data.indexOf('<meta property="og:image" content="')+81).slice(0, 8).match(/[\d]+/)[0];
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + ' ' + _this.logLink(link, name), 'chk');
}
let enter = data.indexOf('"buttonenter buttongiveaway">Join Giveaway<') >= 0,
entered = data.indexOf('"buttonenter buttonentered buttongiveaway">Success - Giveaway joined<') >= 0;
if (_this.getConfig('log', true) && entered) {
_this.log(Lang.get('service.already_joined'), 'jnd');
}
if (enter) {
let eLink = cont.find('p a.buttonenter').attr('href');
$.ajax({
url: _this.url + eLink
});
_this.log(Lang.get('service.entered_in') + _this.logLink(link, name), 'enter');
enter = false;
entered = true;
}
if (entered) {
let adds = cont.find('#giveawaysjoined > div p');
for (let curradds = 0; curradds < adds.length; curradds++) {
let addlink = adds.eq(curradds).find('a').attr('href'),
finish = adds.eq(curradds).find('a').attr('class');
if (!finish.includes('buttonentered')) {
finish = finish.replace('buttonenter buttoncomplete','').trim();
if (finish === '') {
finish = addlink;
}
if (!addlink.includes('http')) {
setTimeout(function () {
$.ajax({
url: _this.url + addlink,
success: function (data) {
data = data.replace(/<img/gi, '<noload');
let check = data.indexOf('<p><strong>Support us by subscribing:</strong></p>') >= 0;
if (_this.getConfig('log', true) && !check) {
_this.log(Lang.get('service.hided').split(' ')[0] + ' ' + name + ' ' + finish, 'info');
}
}
});
if (_this.getConfig('log', true) && !addlink.includes('the-challenge-of-adblock')) {
_this.log(Lang.get('service.hided').split(' ')[0] + ' ' + name + ' ' + finish, 'info');
}
}, 1000);
}
if (addlink.includes('http')) {
setTimeout(function () {
$.ajax({
url: _this.url + '/giveaways/ajax/'+ finish + '/' + id,
});
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.hided').split(' ')[0] + ' ' + name + ' ' + finish, 'info');
}
}, 1000);
}
}
}
entered = false;
}
if (!enter && !entered) {
setTimeout(function () {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.reach_end'), 'skip');
_this.log(Lang.get('service.checked') + 'Giveaways', 'srch');
}
}, 12000);
return;
}
}
});
}
}
