'use strict';
class OyunKeyi extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.oyunkeyi.com';
this.authContent = '/satin-aldiklarim';
this.authLink = "https://www.oyunkeyi.com/auth/steam";
this.wonsUrl = "https://www.oyunkeyi.com/katildiklarim";
this.settings.max_cost = { type: 'number', trans: this.transPath('max_cost'), min: 0, max: 200, default: this.getConfig('max_cost', 10) };
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
data = $(data);
userData.username = data.find('.col-md-9 h3').text();
userData.avatar = data.find('.dropdown-toggle img').attr('src');
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
let user_cost = this.getConfig('max_cost', 10);
$.get('https://www.oyunkeyi.com/?page=' + page, (data) => {
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
cost = parseInt(giveaway.find('.card-body a').text().split("(")[1].split("P)")[0]);
if( _this.curr_value >= cost || cost <= user_cost && user_cost > 0 ) {
let oksteam = giveaway.find('.card-body a').eq(2).attr('href'),
name = giveaway.find('.card-body a').text().split("(")[0],
eLink = link.replace('cekilis', 'katil');
let okown = 0;
let okapp = 0;
let oksub = 0;
let okid = '';
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
$.get(link, function(data){
let entered = $(data).find('.btn-danger').text();
if( entered === 'Remove Entry' ) {
next_after = 50;
}
else
{
$.get(eLink);
_this.log(Lang.get('service.entered_in') + _this.logLink(link, name) + ' ' + _this.logLink(oksteam, okid) + '. ' + _this.trans('cost') + ' - ' + cost);
_this.curr_value = _this.curr_value - cost;
_this.setValue(_this.curr_value);
}
});
}
else
next_after = 50;
}
else
{
next_after = 50;
}
curr_giveaway++;
setTimeout(giveawayEnter, next_after);
}
giveawayEnter();
});
}
}
