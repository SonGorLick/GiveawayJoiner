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
username: 'IDB User'
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
url: 'https://www.indiedb.com/giveaways',
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
let content = data.find('.rowcontent');
let currcont = 0;
function giveawayEnter() {
if (content.length <= currcont || !_this.started) {
return;
}
let next_after = _this.interval();
let cont = content.eq(currcont),
link = cont.find('a').attr('href'),
name = cont.find('a').attr('title');
$.ajax({
url: _this.url + link,
success: function (data) {
data = data.replace(/<img/gi, '<noload');
let entered = data.indexOf('"buttonenter buttongiveaway">Join Giveaway<') >= 0;
if (entered) {
let eLink = $(data).find('a.buttonenter').attr('href');
$.ajax({
url: _this.url + eLink,
success: function (data) {
data = $(data.replace(/<img/gi, '<noload'));
_this.log(Lang.get('service.entered_in') + _this.logLink(link, name));
let adds = data.find('#giveawaysjoined > div p');
for (let curradds = 0; curradds < adds.length; curradds++) {
let addlink = adds.eq(curradds).find('a').attr('href');
if (!addlink.includes('https')) {
$.ajax({
url: _this.url + addlink,
success: function () {
}
});
}
}
}
});
}
else {
next_after = 50;
}
}
});
currcont++;
setTimeout(giveawayEnter, next_after);
}
giveawayEnter();
}
});
}
}
