'use strict';
class OyunKeyi extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.oyunkeyi.com';
this.authContent = '/profil';
this.authLink = 'https://www.oyunkeyi.com/auth/steam';
this.wonsUrl = 'https://www.oyunkeyi.com/kazandiklarim';
this.settings.min_cost = { type: 'number', trans: this.transPath('min_cost'), min: 0, max: this.getConfig('max_cost', 0), default: this.getConfig('min_cost', 0) };
this.settings.max_cost = { type: 'number', trans: this.transPath('max_cost'), min: this.getConfig('min_cost', 0), max: 200, default: this.getConfig('max_cost', 0) };
this.settings.check_in_steam = { type: 'checkbox', trans: this.transPath('check_in_steam'), default: this.getConfig('check_in_steam', true) };
super.init();
}
getUserInfo(callback){
let userData = {
avatar: __dirname + '/images/OyunKeyi.png',
username: 'OK user',
value: 0
};
$.ajax({
url: 'https://www.oyunkeyi.com/profil/' + GJuser.steamid,
success: function(data){
data = $(data.replace(/<img/gi, '<noload'));
userData.username = data.find('.col-md-9 h3').text();
userData.avatar = data.find('.dropdown-toggle noload').attr('src');
userData.value = data.find('.dropdown-toggle span').text().replace('(Point: ', '').replace(')', '');
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
let user_min = this.getConfig('min_cost', 0),
user_max = this.getConfig('max_cost', 0);
$.get('https://www.oyunkeyi.com/?page=' + page, (data) => {
data = data.replace(/<img/gi, '<noload');
let found_games = $(data).find('.card');
let curr_giveaway = 0;
function giveawayEnter(){
if( found_games.length <= curr_giveaway || !_this.started || _this.curr_value === 0) {
if(callback)
callback();
return;
}
let next_after = _this.interval();
let giveaway = found_games.eq(curr_giveaway),
link = giveaway.find('.card-body a').attr('href'),
cost = parseInt(giveaway.find('.card-body a').text().split("(")[1].split("P)")[0]),
entered = giveaway.attr('style');
if( _this.curr_value < cost || cost < user_min || cost > user_max && user_max > 0 || entered.includes('background') )
next_after = 50;
else
{
let oksteam = giveaway.find('.card-body a').eq(2).attr('href'),
name = giveaway.find('.card-body a').text().split("(")[0].trim(),
eLink = link.replace('cekilis', 'katil'),
okown = 0,
okapp = 0,
oksub = 0,
okid = '';
if( oksteam.includes('app/') ) {
okapp = parseInt(oksteam.split("app/")[1].split("/")[0].split("?")[0].split("#")[0]);
okid = '[app/' + okapp + ']';
}
if( oksteam.includes('sub/') ) {
oksub = parseInt(oksteam.split("sub/")[1].split("/")[0].split("?")[0].split("#")[0]);
okid = '[sub/' + oksub + ']';
}
if( _this.getConfig('check_in_steam') ) {
if( GJuser.ownapps.includes(',' + okapp + ',') && okapp > 0 )
okown = 1;
if( GJuser.ownsubs.includes(',' + oksub + ',') && oksub > 0 )
okown = 1;
}
if( okown === 0 ) {
$.get(eLink);
_this.log(Lang.get('service.entered_in') + _this.logLink(link, name) + ' ' + _this.logLink(oksteam, okid) + '. ' + _this.trans('cost') + ' - ' + cost);
_this.curr_value = _this.curr_value - cost;
_this.setValue(_this.curr_value);
}
else {
next_after = 50;
}
}
curr_giveaway++;
setTimeout(giveawayEnter, next_after);
}
giveawayEnter();
});
}
}
