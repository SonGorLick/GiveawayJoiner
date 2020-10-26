'use strict';
class Astats extends Joiner {
constructor() {
super();
this.settings.timer_from.min = 5;
this.websiteUrl = 'http://astats.astats.nl/astats/';
this.authContent = 'Log out';
this.authLink = 'http://astats.astats.nl/astats/profile/Login.php';
this.card = true;
this.dlc = true;
this.settings.card_only = { type: 'checkbox', trans: 'service.card_only', default: this.getConfig('card_only', false) };
this.settings.skip_dlc = { type: 'checkbox', trans: 'service.skip_dlc', default: this.getConfig('skip_dlc', false) };
this.settings.check_all = { type: 'checkbox', trans: 'service.check_all', default: this.getConfig('check_all', false) };
this.settings.whitelist_nocards = { type: 'checkbox', trans: 'service.whitelist_nocards', default: this.getConfig('whitelist_nocards', false) };
this.settings.skip_skipdlc = { type: 'checkbox', trans: 'service.skip_skipdlc', default: this.getConfig('skip_skipdlc', false) };
super.init();
}
getUserInfo(callback) {
let userData = {
avatar: dirapp + 'images/Astats.png',
username: 'Astats User'
};
if (GJuser.username !== 'User') {
userData.avatar = GJuser.avatar;
userData.username = GJuser.username;
}
callback(userData);
}
joinService() {
let _this = this;
let astimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = astimer;
let page = 1;
_this.won = _this.getConfig('won', 0);
_this.url = 'http://astats.astats.nl';
_this.pagemax = _this.getConfig('pages', 1);
_this.dsave = ',';
_this.dload = ',';
if (fs.existsSync(dirdata + 'astats.txt')) {
let adata = fs.readFileSync(dirdata + 'astats.txt');
if (adata.length > 1) {
_this.dload = adata.toString();
}
}
if (_this.dload === ',') {
$.ajax({
url: _this.url + '/astats/TopListGames.php?language=english'
});
}
if ((new Date()).getDate() !== _this.dcheck) {
let win = 'err';
$.ajax({
url: _this.url + '/astats/profile/User_Inbox.php',
success: function (wins) {
wins = $(wins.replace(/<img/gi, '<noload'));
win = wins;
},
complete: function () {
if (win !== 'err') {
let aswon = win.find('td:nth-of-type(4) > a').text('Congratulations you are a giveaway winner!');
_this.dcheck = (new Date()).getDate();
if (aswon === undefined) {
aswon = 0;
}
else {
aswon = aswon.length;
}
if (aswon < _this.won) {
_this.setConfig('won', aswon);
}
if (aswon > 0 && aswon > _this.won) {
_this.log(_this.logLink(_this.url + '/astats/profile/User_Inbox.php', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + (aswon - _this.won) + ')'), 'win');
_this.logWin(' Astats - ' + (aswon - _this.won));
_this.setStatus('win');
_this.setConfig('won', aswon);
if (_this.getConfig('sound', true)) {
new Audio(dirapp + 'sounds/won.wav').play();
}
}
}
}
});
}
let callback = function () {
page++;
if (page <= _this.pagemax) {
_this.enterOnPage(page, callback);
}
};
this.enterOnPage(page, callback);
}
enterOnPage(page, callback) {
let _this = this;
let affset = (page - 1) * 200;
if (page === 1) {
_this.pageurl = '/astats/TopListGames.php?&DisplayType=Giveaway';
}
else {
_this.pageurl = '/astats/TopListGames.php?&DisplayType=Giveaway&Offset=' + affset + '#';
}
let data = 'err';
$.ajax({
url: _this.url + _this.pageurl,
success: function (datas) {
datas = $(datas.replace(/<img/gi, '<noload'));
data = datas;
},
complete: function () {
let afound = data.find('[style="text-align:right;"]'),
acurr = 0,
acrr = 0,
aarray = Array.from(Array(afound.length).keys());
if (data === 'err') {
_this.pagemax = page;
_this.log(Lang.get('service.connection_error'), 'err');
}
function giveawayEnter() {
if (_this.doTimer() - _this.totalTicks < 240) {
_this.totalTicks = 1;
}
if (afound.length === 0 || !_this.started) {
_this.pagemax = page;
}
if (aarray.length <= acurr || !_this.started) {
$.ajax({
url: _this.url + '/astats/User_Info.php'
});
if (afound.length <= acurr && page === _this.pagemax) {
setTimeout(() => {
fs.writeFile(dirdata + 'astats.txt', _this.dsave, (err) => { });
_this.log(Lang.get('service.data_saved'), 'info');
}, _this.interval());
}
if (page === _this.pagemax) {
_this.log(Lang.get('service.reach_end'), 'skip');
_this.log(Lang.get('service.checked') + page + '#-' + _this.getConfig('pages', 1) + '#', 'srch');
}
else {
_this.log(Lang.get('service.checked') + page + '#', 'srch');
}
if (page === _this.pagemax && _this.started) {
setTimeout(() => {
if (_this.statusIcon.attr('data-status') !== 'win') {
_this.setStatus('good');
}
}, _this.interval());
}
if (callback) {
callback();
}
return;
}
let asnext = _this.interval(),
acrr = aarray[acurr],
away = afound.eq(acrr),
alink = away.find('a').attr('href'),
assteam = away.find('a noload').attr('src'),
asown = 0,
asapp = 0,
assub = 0,
asbun = 0,
asid = '???';
if (alink !== undefined || assteam !== undefined) {
let aname = data.find('[href="' + alink + '"]').text().trim(),
ended = data.find('[href="' + alink + '"] > span').text().trim(),
asjoin = alink.replace('/astats/Giveaway.php?GiveawayID=','');
if (aname.includes('This giveaway has ended.') || ended === 'This giveaway has ended.') {
_this.pagemax = page;
asnext = 50;
}
else {
let ahave = data.find('[href="' + alink + '"] font').attr('color');
if (assteam.includes('apps/')) {
asapp = parseInt(assteam.split('apps/')[1].split('/')[0].split('?')[0].split('#')[0]);
asid = 'app/' + asapp;
}
else if (assteam.includes('sub/')) {
assub = parseInt(assteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
asid = 'sub/' + assub;
}
else if (assteam.includes('bundle/')) {
asbun = parseInt(assteam.split('bundle/')[1].split('/')[0].split('?')[0].split('#')[0]);
asid = 'bundle/' + asbun;
}
if (
(_this.getConfig('skip_dlc', false) && GJuser.dlc.includes(',' + asapp + ',') && !_this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_dlc', false) && GJuser.dlc.includes(',' + asapp + ',') && !GJuser.white.includes(asid + ',') && _this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_skipdlc', false) && GJuser.skip_dlc.includes(',' + asapp + ',') && !_this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('skip_skipdlc', false) && GJuser.skip_dlc.includes(',' + asapp + ',') && !GJuser.white.includes(asid + ',') && _this.getConfig('whitelist_nocards', false)) ||
(_this.getConfig('card_only', false) && !GJuser.card.includes(',' + asapp + ',') && !_this.getConfig('whitelist_nocards', false) && asid !== '???') ||
(_this.getConfig('card_only', false) && !GJuser.card.includes(',' + asapp + ',') && !GJuser.white.includes(asid + ',') && _this.getConfig('whitelist_nocards', false) && asid !== '???')
)
{
asown = 6;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '' && GJuser.ownsubs === '') {
asown = 2;
}
if (GJuser.ownapps.includes(',' + asapp + ',') && asapp > 0) {
asown = 1;
}
if (GJuser.ownsubs.includes(',' + assub + ',') && assub > 0) {
asown = 1;
}
}
if (GJuser.black.includes(asid + ',') && _this.getConfig('blacklist_on', false)) {
asown = 4;
}
if (!_this.getConfig('check_all', false)) {
if (asown === 0 && ahave === '#FF0000' && !_this.getConfig('check_in_steam', true)) {
asown = 5;
}
if (_this.dload.includes(',' + asjoin + ',')) {
if (!_this.dsave.includes(',' + asjoin + ',')) {
_this.dsave = _this.dsave + asjoin + ',';
}
asown = 3;
}
}
let aslog = _this.logLink(_this.url + alink, aname);
if (GJuser.skip_dlc.includes(',' + asapp + ',')) {
aslog = '⊟ ' + aslog;
}
else if (GJuser.dlc.includes(',' + asapp + ',')) {
aslog = '⊞ ' + aslog;
}
if (GJuser.card.includes(',' + asapp + ',')) {
aslog = '♦ ' + aslog;
}
if (_this.getConfig('log', true)) {
aslog = '|' + page + '#|' + (acrr + 1) + '№|  ' + aslog;
}
else {
aslog = aslog + _this.logWhite(asid) + _this.logBlack(asid);
}
_this.log(Lang.get('service.checking') + aslog + _this.logWhite(asid) + _this.logBlack(asid), 'chk');
switch (asown) {
case 1:
_this.log(Lang.get('service.have_on_steam'), 'steam');
break;
case 2:
_this.log(Lang.get('service.steam_error'), 'err');
break;
case 3:
_this.log(Lang.get('service.already_joined') + ', ' + Lang.get('service.data_have'), 'jnd');
break;
case 4:
_this.log(Lang.get('service.blacklisted'), 'black');
break;
case 5:
_this.log(Lang.get('service.cant_join') + ',' + Lang.get('service.have_on_steam').split('-')[1], 'cant');
break;
case 6:
_this.log(Lang.get('service.skipped'), 'skip');
break;
}
if (asown === 0) {
let html = 'err';
$.ajax({
url: _this.url + alink,
success: function (htmls) {
htmls = htmls.replace(/<img/gi, '<noload');
html = htmls;
},
complete: function () {
if (html === 'err') {
asnext = 59000;
if (aarray.filter(i => i === acrr).length === 1) {
aarray.push(acrr);
_this.log(Lang.get('service.err_join'), 'cant');
}
else {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
else {
let ajoin = $(html).find('.input-group-btn').text().trim();
if (ajoin === 'Add') {
asown = 1;
if (!_this.dsave.includes(',' + asjoin + ',')) {
_this.dsave = _this.dsave + asjoin + ',';
}
}
else if (ajoin === 'Join') {
asown = 0;
}
else if (html.indexOf('You need to have more AStats points to join.') >= 0) {
asown = 3;
}
else {
asown = 2;
}
switch (asown) {
case 1:
_this.log(Lang.get('service.already_joined'), 'jnd');
break;
case 2:
_this.log(Lang.get('service.cant_join'), 'cant');
break;
case 3:
_this.log(Lang.get('service.points_low'), 'skip');
break;
}
if (asown === 0) {
let tmout = Math.floor(asnext / 2),
resp = 'err';
setTimeout(() => {
$.ajax({
url: _this.url + alink,
method: 'POST',
data: 'Comment=&JoinGiveaway=Join',
success: function () {
resp = 'ok';
},
complete: function () {
if (resp === 'err') {
asnext = 59000;
if (aarray.filter(i => i === acrr).length === 1) {
aarray.push(acrr);
_this.log(Lang.get('service.err_join'), 'cant');
}
else {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
else {
if (!_this.dsave.includes(',' + asjoin + ',')) {
_this.dsave = _this.dsave + asjoin + ',';
}
_this.log(Lang.get('service.entered_in') + aslog, 'enter');
}
}
});
}, tmout);
}
else {
asnext = 1000;
}
}
}
});
}
else {
asnext = 100;
}
}
}
else {
asnext = 100;
}
acurr++;
setTimeout(giveawayEnter, asnext);
}
giveawayEnter();
}
});
}
}
