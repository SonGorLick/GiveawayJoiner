'use strict';
class ZeePond extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://www.zeepond.com';
this.authContent = 'My Profile';
this.authLink = 'https://www.zeepond.com/cb-login';
this.wonsUrl = 'https://www.zeepond.com/my-account/my-prizes';
this.withValue = false;
delete this.settings.pages;
super.init();
}
getUserInfo(callback){
let userData = {
avatar: __dirname + '/images/ZeePond.png',
username: 'ZP user'
};
$.ajax({
url: 'https://www.zeepond.com/my-account/my-profile/view-profile',
success: function(data){
data = $(data.replace(/<img/gi, '<noload'));
userData.username = data.find('.cb-page-header-title').text();
userData.avatar = data.find('#cbfv_29 noload').attr('src');
},
complete: function () {
callback(userData);
}
});
}
seekService(){
let _this = this;
$.get('https://www.zeepond.com/zeepond/giveaways/enter-a-competition', (data) => {
data = $(data.replace(/<img/gi, '<noload'));
let competitions = data.find('.bv-item-wrapper');
let currcomp = 0;
function giveawayEnter(){
if( competitions.length <= currcomp || !_this.started )
return;
let next_after = _this.interval();
let comp = competitions.eq(currcomp),
link = 'https://www.zeepond.com' + comp.find('.bv-item-image a').attr('href'),
name = (comp.find('.bv-item-image noload').attr('src').split('/images/competitions/')[1].split('.jpg')[0]).replace(/-/g, ' ');
$.get(link, (data) => {
data = data.replace(/<img/gi, '<noload');
let entered = data.indexOf('You have already entered today') >= 0;
if( entered ) {
next_after = 50;
}
else
{
$.get(link + '/enter_competition', (data) => {
data = $(data.replace(/<img/gi, '<noload'));
_this.log(Lang.get('service.entered_in') + _this.logLink(link, name));
});
}
});
currcomp++;
setTimeout(giveawayEnter, next_after);
}
giveawayEnter();
});
}
}
