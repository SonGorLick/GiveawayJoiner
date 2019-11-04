'use strict';
class TF2R extends Joiner {
constructor() {
super();
this.domain = 'tf2r.com';
this.websiteUrl = 'http://tf2r.com';
this.authContent = 'Notifications';
this.authLink = 'http://tf2r.com/login';
this.withValue = false;
this.getTimeout = 10000;
delete this.settings.pages;
super.init();
}
authCheck(callback) {
let authContent = this.authContent;
this.ajaxReq(this.websiteUrl, (response) => {
if (response.success) {
if (response.data.indexOf(authContent) >= 0) {
callback(1);
}
else {
callback(0);
}
}
else {
callback(-1);
}
});
}
getUserInfo(callback) {
if (GJuser.tf.length > 601) {
GJuser.tf = ',';
}
let userData = {
avatar: __dirname + '/images/TF2R.png',
username: 'TF2R User'
};
this.ajaxReq('http://tf2r.com/notifications.html', (response) => {
if (response.success) {
userData.username = $(response.data).find('#nameho').text();
userData.avatar = $(response.data).find('#avatar a img').attr('src');
}
callback(userData);
});
}
joinService() {
let _this = this;
_this.ajaxReq('http://tf2r.com/raffles.html', (response) => {
let giveaways = $(response.data).find('.pubrhead-text-right');
_this.log('giveaways found - ' + giveaways.length);
let tfcurr = 0;
function giveawayEnter() {
if (giveaways.length <= tfcurr || !_this.started) {
return;
}
let giveaway = giveaways.eq(tfcurr),
link = giveaway.find('a').attr('href'),
name = giveaway.find('a').text(),
rid = link.replace('http://tf2r.com/k', '').replace('.html', '');
_this.log('giveaway - ' + name + ' |link - ' + link);
_this.ajaxReq(link, (response) => {
if (response.success) {
let html = $('<div>' + response.data + '</div>');
let entered = html.find('#enbut').length === 0;
if (entered || response.data.indexOf('Fuck off') >= 0 || GJuser.tf.includes(rid + ',')) {
return;
}
$.ajax({
url: link,
success: function (data) {
data = data.replace(/<img/gi, '<noload');
let lastentrys = 0;
lastentrys = data.substring(data.indexOf("var entryc =")+1,data.indexOf("var lastchat")).slice(0, 10).trim().replace(';', '');
_this.log('giveaway lastentrys - ' + lastentrys);
Request({
method: 'POST',
uri: 'http://tf2r.com/job.php',
form: {
checkraffle: 'true',
rid: rid,
lastentrys: lastentrys + 1,
lastchat: 0
},
headers: {
'User-Agent': mainWindow.webContents.session.getUserAgent(),
Cookie: _this.cookies
},
json: true
})
.then((body) => {
if (body.status === 'ok') {
_this.log(Lang.get('service.entered_in') + _this.logLink(link, name));
GJuser.tf = GJuser.tf + rid + ',';
}
});
}
});
}
});
tfcurr++;
setTimeout(giveawayEnter, _this.interval());
}
giveawayEnter();
});
}
ajaxReq(url, callback) {
let response = {
success: false,
data: ''
};
$.ajax({
url: url,
timeout: this.getTimeout,
success: function (html) {
response.success = true;
response.data = html;
},
error: function (error) {
if (error.responseText !== undefined && error.responseText.indexOf('!DOCTYPE') >= 0) {
response.success = true;
response.data = error.responseText;
}
},
complete: function () {
callback(response);
}
});
}
}
