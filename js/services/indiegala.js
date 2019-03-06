'use strict';
class IndieGala extends Joiner {
constructor() {
super();
this.authContent = "My Libraries";
this.websiteUrl = "https://www.indiegala.com/giveaways";
this.authLink = "https://www.indiegala.com/login";
this.wonsUrl = "https://www.indiegala.com/profile";
this.settings.max_level = { type: 'number', trans: this.transPath('max_level'), min: 0, max: 8, default: this.getConfig('max_level', 0) };
this.settings.max_cost = { type: 'number', trans: this.transPath('max_cost'), min: 1, max: 240, default: this.getConfig('max_cost', 15) };
this.settings.check_in_steam = { type: 'checkbox', trans: this.transPath('check_in_steam'), default: this.getConfig('check_in_steam', true) };
super.init();
}
authCheck(callback){
$.ajax({
url: 'https://www.indiegala.com/get_user_info',
dataType: 'json',
success: function (data) {
if( data.steamnick )
callback(1);
else
callback(0);
},
error: function () {
callback(-1);
}
});
}
getUserInfo(callback){
let userData = {
avatar: __dirname + '/images/IndieGala.png',
username: 'IG User',
value: 0
};
$.ajax({
url: 'https://www.indiegala.com/get_user_info',
data: {
uniq_param: (new Date()).getTime(),
show_coins: 'True'
},
dataType: 'json',
success: function(data){
userData.avatar = data.steamavatar;
userData.username = data.steamnick;
userData.value = data.silver_coins_tot;
},
complete: function(){
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
let user_level = this.getConfig('max_level', 0);
let user_cost = this.getConfig('max_cost', 15);
$.get('https://www.indiegala.com/giveaways/ajax_data/list?page_param=' + page + '&order_type_param=expiry&order_value_param=asc&filter_type_param=level&filter_value_param=all', function(data){
let tickets = $(JSON.parse(data).content).find('.tickets-col');
let curr_ticket = 0;
function giveawayEnter(){
if( tickets.length <= curr_ticket || !_this.started || _this.curr_value === 0){
if(callback)
callback();
return;
}
let next_after = _this.interval();
let ticket = tickets.eq(curr_ticket),
id = ticket.find('.ticket-right .relative').attr('rel'),
price = ticket.find('.ticket-price strong').text(),
level = parseInt(ticket.find('.type-level span').text().replace('+', '')),
name = ticket.find('h2 a').text(),
single = ticket.find('.extra-type .fa-clone').length === 0,
entered = false,
enterTimes = 0;
if( single )
entered = ticket.find('.giv-coupon').length === 0;
else {
enterTimes = parseInt(ticket.find('.giv-coupon .palette-color-11').text());
entered = enterTimes > 0;
}
if( entered || user_level < level || _this.curr_value < price || price > user_cost )
next_after = 50;
else
{
$.get('https://www.indiegala.com/giveaways/detail/' + id, function(data){
let steamlink = $(data).find('.info-row a').attr('href');
_this.appid = 0;
_this.subid = 0;
if( !steamlink.includes('/sub/') )
_this.appid = parseInt(steamlink.split("app/")[1].split("/")[0].split("?")[0].split("#")[0]);
if( !steamlink.includes('/app/') )
_this.subid = parseInt(steamlink.split("sub/")[1].split("/")[0].split("?")[0].split("#")[0]);
});
let owned = 0;
if( _this.getConfig('check_in_steam') ) {
if( GJuser.ownapps.includes(',' + _this.appid + ',') && _this.appid > 0 )
owned = 1;
if( GJuser.ownsubs.includes(',' + _this.subid + ',') && _this.subid > 0 )
owned = 1;
}
if( owned === 0 ) {
$.ajax({
type: "POST",
url: 'https://www.indiegala.com/giveaways/new_entry',
contentType: "application/json; charset=utf-8",
dataType: "json",
data: JSON.stringify({ giv_id: id, ticket_price: price }),
success: function(data){
if( data.status === 'ok' ){
_this.setValue(data.new_amount);
_this.log(Lang.get('service.entered_in') + name + '. ' + _this.trans('cost') + ' - ' + price);
}
}
});
}
else
next_after = 50;
}
curr_ticket++;
setTimeout(giveawayEnter, next_after);
}
giveawayEnter();
});
}
}
