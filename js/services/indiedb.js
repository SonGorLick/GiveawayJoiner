'use strict';
class IndieDB extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.indiedb.com';
this.authContent = 'View your profile';
this.authLink = 'https://www.indiedb.com/members/login';
this.settings.log = { type: 'checkbox', trans: this.transPath('log'), default: this.getConfig('log', true) };
this.withValue = false;
delete this.settings.pages;
delete this.settings.interval_from;
delete this.settings.interval_to;
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
if (_this.getConfig('log', true) && !enter) {
_this.log(Lang.get('service.already_joined'), 'skip');
}
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
$.ajax({
url: _this.url + addlink,
success: function (data) {
data = data.replace(/<img/gi, '<noload');
let check = data.indexOf('<p><strong>Support us by subscribing:</strong></p>') >= 0;
if (_this.getConfig('log', true) && !check) {
_this.log(Lang.get('service.entered_in') + finish + ' - ' + name, 'enter');
}
}
});
if (_this.getConfig('log', true) && !addlink.includes('the-challenge-of-adblock')) {
_this.log(Lang.get('service.entered_in') + finish + ' - ' + name, 'enter');
}
}
if (addlink.includes('http')) {
$.ajax({
url: _this.url + '/giveaways/ajax/'+ finish + '/' + id,
});
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.entered_in') + finish + ' - ' + name, 'enter');
}
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
}, 10000);
return;
}
}
});
}
}
