'use strict';
class OpiumPulses extends Seeker {
constructor() {
super();
this.websiteUrl = 'http://www.opiumpulses.com';
this.authContent = 'site/logout';
this.authLink = "https://www.opiumpulses.com/site/login";
this.wonsUrl = "http://www.opiumpulses.com/user/giveawaykeys";
this.oupd = 0;
super.init();
}
getUserInfo(callback){
if ( _this.oupd === 1 ) {
callback(userData);
}
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
userData.avatar = "http://www.opiumpulses.com" + data.find('img.img-thumbnail').attr('src');
userData.value = data.find('.points-items li a').first().text().replace('Points:', '').trim();
},
complete: function () {
_this.oupd = 1;
callback(userData);
}
});
}
seekService(){
_this.oupd = 0;
let _this = this;
let opage = 1;
let callback = function() {
opage++;
if ( opage <= _this.getConfig('pages', 1) )
_this.enterOnPage(opage, callback);
};
this.enterOnPage(opage, callback);
}
enterOnPage(opage, callback){
let _this = this;
$.get('http://www.opiumpulses.com/giveaways?Giveaway_page=' + opage, function(data){
let user_opnts = $(data).find('.points-items li a').first().text().replace('Points:', '').trim();
let found_games = $(data).find('.giveaways-page-item');
let curr_opga = 0;
function giveawayEnter(){
if( found_games.length <= curr_opga || !_this.started || user_opnts === 0) {
if(callback)
callback();
return;
}
let next_after = _this.interval();
let giveaway = found_games.eq(curr_opga),
name = giveaway.find('.giveaways-page-item-footer-name').text().trim(),
eLink = giveaway.find('.giveaways-page-item-img-btn-enter').attr('href'),
link = giveaway.find('.giveaways-page-item-img-btn-more').attr('href'),
cost = parseInt(giveaway.find('.giveaways-page-item-header-points').text().replace('points', '').trim()),
free = isNaN(cost);
if( free ) {
cost = 0;
}
if ( user_opnts >= cost ) {
$.get("http://www.opiumpulses.com" + link, function(data){
let entered = data.indexOf("entered this giveaway") >= 0;
if( entered )
next_after = 50;
else
{
$.get("http://www.opiumpulses.com" + eLink, function(){
_this.log(Lang.get('service.entered_in') + _this.logLink("http://www.opiumpulses.com" + link, name + '. ' + _this.trans('cost') + ' - ' + cost));
});
}
});
}
curr_opga++;
setTimeout(giveawayEnter, next_after);
}
giveawayEnter();
});
}
}
