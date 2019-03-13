'use strict';
class OpiumPulses extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.opiumpulses.com/user/account';
this.authContent = 'site/logout';
this.authLink = "https://www.opiumpulses.com/site/login";
this.wonsUrl = "https://www.opiumpulses.com/user/giveawaykeys";
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
url: 'https://www.opiumpulses.com/user/account',
success: function(data){
data = $(data.replace(/<img/gi, '<noload'));
userData.username = data.find('.page-header__nav-func-user-wrapper a').text().split("Account")[0].trim();
userData.avatar = 'https://www.opiumpulses.com' + data.find('.input-group noload').attr('src');
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
$.get('https://www.opiumpulses.com/giveaways?ajax=giveawaylistview&Giveaway_page=' + page, (data) => {
data = $(data.replace(/<img/gi, '<noload'));
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
entered = giveaway.find('.giveaways-page-item-img-btn-wrapper').text(),
cost = parseInt(giveaway.find('.giveaways-page-item-header-points').text().replace('points', '').trim());
if( isNaN(cost) ) {
cost = 0;
}
if ( _this.curr_value < cost|| entered.includes('ENTERED') )
next_after = 50;
else
{
let link = giveaway.find('.giveaways-page-item-img-btn-more').attr('href'),
name = giveaway.find('.giveaways-page-item-footer-name').text().trim(),
eLink = giveaway.find('.giveaways-page-item-img-btn-enter').attr('href');
$.get("https://www.opiumpulses.com" + link, (data) => {
data = data.replace(/<img/gi, '<noload');
let opsteam = $(data).find('.giveaways-single-sponsored h1 a').attr('href');
if( opsteam === undefined ) {
opsteam = $(data).find('.giveaways-single-sponsored h4 a').attr('href');
}
let opown = 0,
opapp = 0,
opsub = 0,
opid = '';
if( opsteam.includes('app/') ) {
opapp = parseInt(opsteam.split("app/")[1].split("/")[0].split("?")[0].split("#")[0]);
opid = '[app/' + opapp + ']';
}
if( opsteam.includes('sub/') ) {
opsub = parseInt(opsteam.split("sub/")[1].split("/")[0].split("?")[0].split("#")[0]);
opid = '[sub/' + opsub + ']';
}
if( _this.getConfig('check_in_steam') ) {
if( GJuser.ownapps.includes(',' + opapp + ',') && opapp > 0 )
opown = 1;
if( GJuser.ownsubs.includes(',' + opsub + ',') && opsub > 0 )
opown = 1;
}
if( opown === 0 ) {
$.get("https://www.opiumpulses.com" + eLink, (data) => {
data = data.replace(/<img/gi, '<noload');
_this.log(Lang.get('service.entered_in') + _this.logLink("https://www.opiumpulses.com" + link, name) + ' ' + _this.logLink(opsteam, opid) + '. ' + _this.trans('cost') + ' - ' + cost);
_this.curr_value = _this.curr_value - cost;
_this.setValue(_this.curr_value);
});
}
else {
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
