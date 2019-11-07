'use strict';
class IndieDB extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.indiedb.com';
this.authContent = 'View your profile';
this.authLink = 'https://www.indiedb.com/members/login';
this.settings.rnd = { type: 'checkbox', trans: this.transPath('rnd'), default: this.getConfig('rnd', false) };
this.settings.log = { type: 'checkbox', trans: this.transPath('log'), default: this.getConfig('log', true) };
this.withValue = false;
delete this.settings.pages;
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: __dirname + '/images/IndieDB.png',
username: 'IndieDB User'
};
$.ajax({
url: 'https://www.indiedb.com/messages/updates',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
userData.avatar = data.find('li.avatar a noload').attr('src');
userData.username = data.find('li.username a').text();
},
complete: function () {
callback(userData);
}
});
}
joinService() {
let _this = this;
_this.url = 'https://www.indiedb.com';
$.ajax({
url: _this.url + '/giveaways',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
let content = data.find('.rowcontent'),
idbcurr = 0,
random = Array.from(Array(content.length).keys());
if (_this.getConfig('rnd', false)) {
for(let i = random.length - 1; i > 0; i--){
const j = Math.floor(Math.random() * i);
const temp = random[i];
random[i] = random[j];
random[j] = temp;
}
}
function giveawayEnter() {
if (content.length <= idbcurr || !_this.started) {
return;
}
let idbnext = _this.interval();
let idbrnd = random[idbcurr],
cont = content.eq(idbrnd),
link = cont.find('a').attr('href'),
name = cont.find('a').attr('title'),
id = cont.find('a noload').attr('src').replace('https://media.indiedb.com/cache/images/giveaways/1/1', '').match(/[\d]+/)[0];
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + '|' + (idbrnd + 1) + '№|  ' + _this.logLink(link, name));
}
$.ajax({
url: _this.url + link,
success: function (data) {
data = data.replace(/<img/gi, '<noload');
let enter = data.indexOf('"buttonenter buttongiveaway">Join Giveaway<') >= 0,
entered = data.indexOf('"buttonenter buttonentered buttongiveaway">Success - Giveaway joined<') >= 0;
if (enter) {
let eLink = $(data).find('a.buttonenter').attr('href');
$.ajax({
url: _this.url + eLink
});
_this.log(Lang.get('service.entered_in') + ' |' + (idbrnd + 1) + '№|  ' + _this.logLink(link, name));
entered = true;
}
if (entered) {
if (_this.getConfig('log', true) && !enter) {
_this.log(Lang.get('service.already_joined'));
}
let adds = $(data).find('#giveawaysjoined > div p');
for (let curradds = 0; curradds < adds.length; curradds++) {
let addlink = adds.eq(curradds).find('a').attr('href'),
finish = adds.eq(curradds).find('a').attr('class');
if (!finish.includes('buttonentered')) {
finish = finish.replace('buttonenter buttoncomplete','').trim();
if (finish === '') {
finish = addlink;
}
if (!addlink.includes('http')) {
$.ajax({
url: _this.url + addlink,
success: function (data) {
data = data.replace(/<img/gi, '<noload');
let check = data.indexOf('<p><strong>Support us by subscribing:</strong></p>') >= 0
if (_this.getConfig('log', true) && !check) {
_this.log(Lang.get('service.entered_in') + ' ' + finish + ' - ' + name);
}
}
});
}
if (addlink.includes('http')) {
$.ajax({
url: _this.url + '/giveaways/ajax/'+ finish + '/' + id,
success: function () {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.entered_in') + ' ' + finish + ' - ' + name);
}
}
});
}
}
}
}
if (!enter && !entered) {
idbnext = 50;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.cant_join'));
}
}
}
});
idbcurr++;
setTimeout(giveawayEnter, idbnext);
}
giveawayEnter();
}
});
}
}
