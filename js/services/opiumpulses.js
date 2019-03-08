'use strict';
class OpiumPulses extends Joiner {
constructor() {
super();
this.websiteUrl = 'http://www.opiumpulses.com';
this.authContent = 'site/logout';
this.authLink = "https://www.opiumpulses.com/site/login";
this.wonsUrl = "http://www.opiumpulses.com/user/giveawaykeys";
this.settings.check_in_steam = { type: 'checkbox', trans: this.transPath('check_in_steam'), default: this.getConfig('check_in_steam', true) };
super.init();
}
getUserInfo(callback){
let userData = {
avatar: __dirname + '/images/OpiumPulses.png',
username: 'OP user',
value: 0
};
$.ajax({
url: 'http://www.opiumpulses.com/user/account',
success: function(data){
data = $(data);
userData.username = data.find('#User_username').val();
userData.avatar = 'http://www.opiumpulses.com' + data.find('img.img-thumbnail').attr('src');
userData.value = data.find('.points-items li a').first().text().replace('Points:', '').trim();
},
complete: function () {
callback(userData);
}
});
}
seekService(){
let _this = this;
let page = 1;
let callback = function() {
page++;
if ( page <= _this.getConfig('pages', 1) )
_this.enterOnPage(page, callback);
};
this.enterOnPage(page, callback);
}
enterOnPage(page, callback){
let _this = this;
$.get('http://www.opiumpulses.com/giveaways?Giveaway_page=' + page, (data) => {
data = $(data);
let found_games = data.find('.giveaways-page-item');
let curr_giveaway = 0;
function giveawayEnter(){
if( found_games.length <= curr_giveaway || !_this.started || _this.curr_value === 0) {
if(callback)
callback();
return;
}
let next_after = _this.interval();
let giveaway = found_games.eq(curr_giveaway),
name = giveaway.find('.giveaways-page-item-footer-name').text().trim(),
eLink = giveaway.find('.giveaways-page-item-img-btn-enter').attr('href'),
link = giveaway.find('.giveaways-page-item-img-btn-more').attr('href'),
cost = parseInt(giveaway.find('.giveaways-page-item-header-points').text().replace('points', '').trim()),
free = isNaN(cost);
if( free ) {
cost = 0;
}
if ( _this.curr_value >= cost ) {
$.get("http://www.opiumpulses.com" + link, (data) => {
let entered = data.indexOf("entered this giveaway") >= 0;
if( entered )
next_after = 50;
else
{
let opsteam = data.find('.giveaways-single-sponsored h1 a').first().attr('href');
let opapp = 0;
let opsub = 0;
let opid = '';
if( !opsteam.includes('sub/') ) {
opapp = parseInt(opsteam.split("app/")[1].split("/")[0].split("?")[0].split("#")[0]);
opid = '[app/' + opapp + ']';
}
if( !opsteam.includes('app/') ) {
opsub = parseInt(opsteam.split("sub/")[1].split("/")[0].split("?")[0].split("#")[0]);
opid = '[sub/' + opsub + ']';
}
let opown = 0;
if( _this.getConfig('check_in_steam') ) {
if( GJuser.ownapps.includes(',' + opapp + ',') && opapp > 0 )
opown = 1;
if( GJuser.ownsubs.includes(',' + opsub + ',') && opsub > 0 )
opown = 1;
}
if( opown === 0 ) {
$.get("http://www.opiumpulses.com" + eLink, function(){
_this.log(Lang.get('service.entered_in') + _this.logLink("http://www.opiumpulses.com" + link, name) + ' ' + _this.logLink(opsteam, opid) + '. ' + _this.trans('cost') + ' - ' + cost);
_this.curr_value = _this.curr_value - cost;
_this.setValue(_this.curr_value);
});
}
else
next_after = 50;
}
});
}
curr_giveaway++;
setTimeout(giveawayEnter, next_after);
}
giveawayEnter();
});
}
}
