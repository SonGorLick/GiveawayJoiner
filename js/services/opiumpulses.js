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
else {
_this.oupd = 1;
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
_this.enterOnPage(page, callback);
}
enterOnPage(page, callback){
let _this = this;
_this.oupd = 0;
$.get('http://www.opiumpulses.com/giveaways?Giveaway_page=' + page, function(data){
let user_points = $(data).find('.points-items li a').first().text().replace('Points:', '').trim();
let found_games = $(data).find('.giveaways-page-item');
let curr_giveaway = 0;
function giveawayEnter(){
if( found_games.length <= curr_giveaway || !_this.started || user_points === 0) {
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
if ( user_points >= cost ) {
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
curr_giveaway++;
setTimeout(giveawayEnter, next_after);
}
giveawayEnter();
});
}
}
