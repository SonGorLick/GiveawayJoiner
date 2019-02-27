'use strict';
class IndieGala extends Seeker {
constructor() {
super();
this.authContent = "My Libraries";
this.websiteUrl = "https://www.indiegala.com/giveaways";
this.authLink = "https://www.indiegala.com/login";
this.wonsUrl = "https://www.indiegala.com/profile";
this.settings.max_level = { type: 'number', trans: this.transPath('max_level'), min: 0, max: 8, default: this.getConfig('max_level', 0) };
this.settings.max_cost = { type: 'number', trans: this.transPath('max_cost'), min: 1, max: 240, default: this.getConfig('max_cost', 15) };
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
let gpage = 1;
let callback = function() {
gpage++;
if ( gpage <= _this.getConfig('pages', 1) )
_this.enterOnPage(gpage, callback);
};
this.enterOnPage(gpage, callback);
}
enterOnPage(gpage, callback){
let _this = this;
let user_lvl = this.getConfig('max_level', 0);
let user_mcst = this.getConfig('max_cost', 15);
$.get('https://www.indiegala.com/giveaways/ajax_data/list?page_param=' + gpage + '&order_type_param=expiry&order_value_param=asc&filter_type_param=level&filter_value_param=all', function(data){
let tickets = $(JSON.parse(data).content).find('.tickets-col');
let curr_ticket = 0;
function giveawayEnter(){
let user_gcns = _this.curr_value;
if( tickets.length <= curr_ticket || !_this.started || user_gcns === 0){
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
if( entered || user_lvl < level || user_gcns < price || price > user_mcst )
next_after = 50;
else
{
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
curr_ticket++;
setTimeout(giveawayEnter, next_after);
}
giveawayEnter();
});
}
}
