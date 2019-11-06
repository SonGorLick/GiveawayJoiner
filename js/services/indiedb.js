'use strict';
class IndieDB extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.indiedb.com';
this.authContent = 'View your profile';
this.authLink = 'https://www.indiedb.com/members/login';
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
idbcurr = 0;
function giveawayEnter() {
if (content.length <= idbcurr || !_this.started) {
return;
}
let idbnext = _this.interval();
let cont = content.eq(idbcurr),
link = cont.find('a').attr('href'),
name = cont.find('a').attr('title'),
id = cont.find('a noload').attr('src').replace('https://media.indiedb.com/cache/images/giveaways/1/1', '').match(/[\d]+/)[0];
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
_this.log(Lang.get('service.entered_in') + ' |' + (idbcurr + 1) + '№|  ' + _this.logLink(link, name));
}
if (enter || entered) {
let adds = $(data).find('#giveawaysjoined > div p');
for (let curradds = 0; curradds < adds.length; curradds++) {
let addlink = adds.eq(curradds).find('a').attr('href'),
finish = adds.eq(curradds).find('a').attr('class');
if (!finish.includes('buttonentered')) {
if (!addlink.includes('http')) {
$.ajax({
url: _this.url + addlink
});
}
if (addlink.includes('http')) {
$.ajax({
type: 'POST',
crossDomain: true,
timeout: 60000,
dataType: 'json',
url: _this.url + '/giveaways/ajax/'+ finish.replace('buttonenter buttoncomplete ','') + '/' + id,
data: {ajax: 't'}
});
}
}
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
