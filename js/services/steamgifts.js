'use strict';
class SteamGifts extends Joiner {
constructor() {
super();
this.domain = 'steamgifts.com';
this.websiteUrl = 'https://www.steamgifts.com';
this.website = this.websiteUrl;
this.authContent = '>Logout<';
this.authLink = 'https://www.steamgifts.com/?login';
this.withValue = true;
this.withLevel = true;
this.card = true;
this.dlc = true;
this.setConfig('login_steam', true);
this.settings.timer_from = { type: 'number', trans: 'service.timer_from', min: 5, max: this.getConfig('timer_to', 90), default: this.getConfig('timer_from', 70) };
this.settings.timer_to = { type: 'number', trans: 'service.timer_to', min: this.getConfig('timer_from', 70), max: 2880, default: this.getConfig('timer_to', 90) };
this.settings.ending = { type: 'number', trans: this.transPath('ending'), min: 0, max: 2880, default: this.getConfig('ending', 0) };
this.settings.min_chance = { type: 'float_number', trans: this.transPath('min_chance'), min: 0, max: 100, default: this.getConfig('min_chance', 0) };
this.settings.min_entries = { type: 'ten_number', trans: 'service.min_entries', min: 0, max: 10000, default: this.getConfig('min_entries', 0) };
this.settings.min_level = { type: 'number', trans: 'service.min_level', min: 0, max: this.getConfig('max_level', 0), default: this.getConfig('min_level', 0) };
this.settings.max_level = { type: 'number', trans: 'service.max_level', min: this.getConfig('min_level', 0), max: 10, default: this.getConfig('max_level', 0) };
this.settings.min_cost = { type: 'number', trans: 'service.min_cost', min: 0, max: this.getConfig('max_cost', 0), default: this.getConfig('min_cost', 0) };
this.settings.max_cost = { type: 'number', trans: 'service.max_cost', min: this.getConfig('min_cost', 0), max: 300, default: this.getConfig('max_cost', 0) };
this.settings.points_reserve = { type: 'number', trans: 'service.points_reserve', min: 0, max: 500, default: this.getConfig('points_reserve', 0) };
this.settings.whitelist_only = { type: 'checkbox', trans: 'service.whitelist_only', default: this.getConfig('whitelist_only', false) };
this.settings.wishlist_only = { type: 'checkbox', trans: this.transPath('wishlist_only'), default: this.getConfig('wishlist_only', false) };
this.settings.group_only = { type: 'checkbox', trans: this.transPath('group_only'), default: this.getConfig('group_only', false) };
this.settings.whitelist_first = { type: 'checkbox', trans: this.transPath('whitelist_first'), default: this.getConfig('whitelist_first', false) };
this.settings.wishlist_first = { type: 'checkbox', trans: this.transPath('wishlist_first'), default: this.getConfig('wishlist_first', false) };
this.settings.group_first = { type: 'checkbox', trans: this.transPath('group_first'), default: this.getConfig('group_first', false) };
this.settings.card_only = { type: 'checkbox', trans: 'service.card_only', default: this.getConfig('card_only', false) };
this.settings.reserve_on_wish = { type: 'checkbox', trans: this.transPath('reserve_on_wish'), default: this.getConfig('reserve_on_wish', false) };
this.settings.reserve_on_group = { type: 'checkbox', trans: this.transPath('reserve_on_group'), default: this.getConfig('reserve_on_group', false) };
this.settings.card_first = { type: 'checkbox', trans: this.transPath('card_first'), default: this.getConfig('card_first', false) };
this.settings.ignore_on_wish = { type: 'checkbox', trans: this.transPath('ignore_on_wish'), default: this.getConfig('ignore_on_wish', false) };
this.settings.ignore_on_group = { type: 'checkbox', trans: this.transPath('ignore_on_group'), default: this.getConfig('ignore_on_group', false) };
this.settings.multiple_first = { type: 'checkbox', trans: this.transPath('multiple_first'), default: this.getConfig('multiple_first', false) };
this.settings.sort_by_copies = { type: 'checkbox', trans: this.transPath('sort_by_copies'), default: this.getConfig('sort_by_copies', false) };
this.settings.hide_ga = { type: 'checkbox', trans: this.transPath('hide_ga'), default: this.getConfig('hide_ga', false) };
this.settings.skip_ost = { type: 'checkbox', trans: 'service.skip_ost', default: this.getConfig('skip_ost', false) };
this.settings.sort_by_level = { type: 'checkbox', trans: 'service.sort_by_level', default: this.getConfig('sort_by_level', false) };
this.settings.remove_ga = { type: 'checkbox', trans: this.transPath('remove_ga'), default: this.getConfig('remove_ga', true) };
this.settings.skip_dlc = { type: 'checkbox', trans: 'service.skip_dlc', default: this.getConfig('skip_dlc', false) };
this.settings.sort_by_chance = { type: 'checkbox', trans: this.transPath('sort_by_chance'), default: this.getConfig('sort_by_chance', false) };
this.settings.free_ga = { type: 'checkbox', trans: this.transPath('free_ga'), default: this.getConfig('free_ga', false) };
super.init();
}
authCheck(callback) {
let call = -1;
rq({
method: 'GET',
url: 'https://www.steamgifts.com',
headers: {
'connection': 'keep-alive',
'authority': 'www.steamgifts.com',
'from': 'esgst.extension@gmail.com',
'user-agent': this.ua,
'esgst-version': '8.9.1',
'content-type': 'application/x-www-form-urlencoded',
'accept': '*/*',
'origin': 'https://www.steamgifts.com',
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': 'https://www.steamgifts.com/',
'cookie': this.cookies
},
responseType: 'document'
})
.then((htmls) => {
let html = htmls.data;
html = html.replace(/<img/gi, '<noload');
if (html.indexOf('>Logout<') >= 0) {
call = 1;
}
else {
call = 0;
}
})
.finally(() => {
if (call === 1) {
callback(1);
}
else if (call === -1) {
callback(-1);
}
else if (!GJuser.waitAuth) {
GJuser.waitAuth = true;
call = -1;
Browser.webContents.on('did-finish-load', () => {
if (Browser.getURL().indexOf('https://steamcommunity.com/openid/login?openid.ns') >= 0) {
Browser.webContents.executeJavaScript('document.getElementById("imageLogin").click()');
}
if (Browser.getURL().indexOf('https://www.steamgifts.com') >= 0) {
Browser.webContents.executeJavaScript('document.querySelector("body").innerHTML')
.then((body) => {
if (body.indexOf('>Logout<') >= 0) {
Browser.webContents.removeAllListeners('did-finish-load');
setTimeout(() => {
call = 1;
Browser.close();
}, 1000);
}
setTimeout(() => {
call = 0;
Browser.close();
}, 10000);
});
setTimeout(() => {
call = -1;
Browser.close();
}, 30000);
}
else {
setTimeout(() => {
Browser.loadURL('https://www.steamgifts.com');
}, 5000);
setTimeout(() => {
call = -1;
Browser.close();
}, 30000);
}
});
Browser.setTitle(Lang.get('service.browser_loading'));
Browser.loadURL('https://www.steamgifts.com/?login');
Browser.once('close', () => {
Browser.webContents.removeAllListeners('did-finish-load');
Browser.loadFile('blank.html');
GJuser.waitAuth = false;
callback(call);
});
}
else {
callback(-2);
}
});
}
getUserInfo(callback) {
this.setValue(500);
let userData = {
avatar: '../app.asar/images/SteamGifts.png',
username: 'SteamGifts User',
value: 500,
level: 0
};
if (GJuser.username !== 'User') {
userData.avatar = GJuser.avatar;
userData.username = GJuser.username;
}
if (fs.existsSync(dirdata + 'steamgifts.txt')) {
let lvl = parseInt(fs.readFileSync(dirdata + 'steamgifts.txt').toString());
userData.level = lvl;
this.setLevel(lvl);
}
else if (this.getConfig('max_level', 0) !== undefined) {
userData.level = this.getConfig('max_level', 0);
this.setLevel(userData.level);
fs.writeFile(dirdata + 'steamgifts.txt', userData.level.toString(), (err) => { });
}
else {
this.setLevel(0);
fs.writeFile(dirdata + 'steamgifts.txt', '0', (err) => { });
}
rq({
method: 'GET',
url: 'https://www.steamgifts.com/account/settings/profile',
headers: {
'connection': 'keep-alive',
'authority': 'www.steamgifts.com',
'from': 'esgst.extension@gmail.com',
'user-agent': this.ua,
'esgst-version': '8.9.1',
'content-type': 'application/x-www-form-urlencoded',
'accept': '*/*',
'origin': 'https://www.steamgifts.com',
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': 'https://www.steamgifts.com/',
'cookie': this.cookies
},
responseType: 'document'
})
.then((data) => {
data = $(data.data);
let avatar = data.find('.nav__avatar-inner-wrap').attr('style'),
username = data.find('input[name=username]').val(),
value = data.find('.nav__points').text(),
level = data.find('.nav__points').next().text();
if (level !== undefined && level.includes('Level ')) {
userData.level = level.replace('Level ', '');
fs.writeFile(dirdata + 'steamgifts.txt', userData.level.toString(), (err) => { });
}
if (value !== undefined && value !== '') {
userData.value = value;
}
if (username !== undefined && username !== '') {
userData.username = username;
}
if (avatar !== undefined && avatar.includes('background-image:url(')) {
userData.avatar = avatar.replace('background-image:url(', '').replace(');', '');
}
})
.finally(() => {
callback(userData);
});
}
joinService() {
let sgtimer = (Math.floor(Math.random() * (this.getConfig('timer_to', 90) - this.getConfig('timer_from', 70))) + this.getConfig('timer_from', 70));
this.stimer = sgtimer;
let page = -1;
this.token = '';
this.dsave = ',';
this.sgretry = 0;
this.wait = false;
this.giveaways = [];
this.won = this.getConfig('won', 0);
this.url = 'https://www.steamgifts.com';
let processCommon = () => {
if (!this.started) {
return;
}
if (page <= this.getConfig('pages', 1)) {
this.giveawaysFromUrl(page, processCommon);
}
else {
this.giveawaysEnter();
}
page++;
};
processCommon();
}
giveawaysFromUrl(page, callback) {
let sgurl = this.url + '/giveaways/search?',
sgtype = 'p',
sgpage = page;
if (sgpage === -1) {
sgurl = sgurl + 'type=wishlist';
sgtype = 'w';
}
else if (sgpage === 0) {
sgurl = sgurl + 'type=group';
sgtype = 'g';
}
else {
sgurl = sgurl + 'page=' + sgpage;
}
let pdata = '';
rq({
method: 'GET',
url: sgurl,
headers: {
'connection': 'keep-alive',
'authority': 'www.steamgifts.com',
'from': 'esgst.extension@gmail.com',
'user-agent': this.ua,
'esgst-version': '8.9.1',
'content-type': 'application/x-www-form-urlencoded',
'accept': '*/*',
'origin': this.url,
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': this.url + '/',
'cookie': this.cookies
},
responseType: 'document'
})
.then((pdatas) => {
pdata = $('<div>' + pdatas.data + '</div>');
})
.finally(() => {
let sgtoken = pdata.find('input[name="xsrf_token"]').val();
if (sgtoken !== undefined && sgtoken.length > 9) {
this.token = sgtoken;
}
if (sgpage === -1) {
let sgwon = parseInt(pdata.find('.nav__button-container--active.nav__button-container--notification.nav__button-container:nth-of-type(2) > .nav__button > .nav__notification').text().trim());
if (isNaN(sgwon)) {
sgwon = 0;
}
if (sgwon < this.won) {
this.setConfig('won', sgwon);
}
if (sgwon > 0 && sgwon > this.won) {
this.log(this.logLink(this.url + '/giveaways/won', Lang.get('service.win') + ' (' + Lang.get('service.qty') + ': ' + (sgwon) + ')'), 'win');
this.logWin(' SteamGifts - ' + (sgwon - this.won));
this.setStatus('win');
this.setConfig('won', sgwon);
if (this.getConfig('sound', true)) {
new Audio('../app.asar/sounds/won.wav').play();
}
}
}
pdata.find('.pinned-giveaways__outer-wrap').remove();
pdata.find('.giveaway__row-outer-wrap').each((index, item) => {
let sgaway = $(item),
copies = 1,
link = this.url + sgaway.find('a.giveaway__heading__name').attr('href'),
entries = parseInt(sgaway.find('.fa.fa-tag+span').text().replace(/[^0-9]/g, '')),
left = sgaway.find('[data-timestamp]').first().text().split(' '),
time = 'm',
factor = 1;
switch (left[1]) {
case 'second': case 'seconds': time = 's'; break;
case 'minute': case 'minutes': time = 'm'; break;
case 'hour': case 'hours': factor = 60; time = 'h'; break;
case 'day': case 'days': factor = 1440; time = 'd'; break;
case 'week': case 'weeks': factor = 10080; time = 'w'; break;
case 'month': case 'months': factor = 40320; time = 'mth'; break;
}
let cost = sgaway.find('.giveaway__heading__thin').first().text();
if (cost.indexOf('P)') >= 0) {
cost = parseInt(cost.replace(/[^0-9]/g, ''));
}
else if (cost.indexOf('Copies)') >= 0) {
copies = parseInt(cost.replace(/[^0-9]/g, ''));
cost = parseInt(sgaway.find('.giveaway__heading__thin').eq(1).text().replace(/[^0-9]/g, ''));
}
else {
cost = parseInt(sgaway.find('a.giveaway__icon[rel]').prev().text().replace(/[^0-9]/g, ''));
}
let chance = parseFloat(((copies / entries) * 100).toFixed(2));
if (sgtype !== 'p') {
sgpage = sgtype;
}
let GA = {
page: sgpage,
order: (index + 1),
chance: (chance === Infinity ? 0 : chance),
lnk: link,
left: (parseInt(left[0]) * factor),
time: left[0] + time,
copies: copies,
entries: entries,
code: link.match(/away\/(.*)\//)[1],
gameid: sgaway.attr('data-game-id'),
nam: sgaway.find('a.giveaway__heading__name').text(),
level: sgaway.find('.giveaway__column--contributor-level').length > 0 ? parseInt(sgaway.find('.giveaway__column--contributor-level').text().replace('+', '').replace('Level ', '')) : 0,
levelPass: sgaway.find('.giveaway__column--contributor-level--negative').length === 0,
cost: cost,
sgsteam: sgaway.find('a.giveaway__icon').attr('href'),
entered: sgaway.find('.giveaway__row-inner-wrap.is-faded').length > 0,
type: sgtype,
card: false,
dlc: false,
white: false
};
if (GA.sgsteam === undefined) {
GA.sgsteam = '';
}
else if (GA.sgsteam.includes('app/')) {
let sgpp = parseInt(GA.sgsteam.split('app/')[1].split('/')[0].split('?')[0].split('#')[0]);
if (GJuser.card.includes(',' + sgpp + ',')) {
GA.card = true;
}
if (GJuser.dlc.includes(',' + sgpp + ',')) {
GA.dlc = true;
}
if (GJuser.white.includes('app/' + sgpp + ',')) {
GA.white = true;
}
}
else if (GA.sgsteam.includes('sub/')) {
let sgps = parseInt(GA.sgsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
if (GJuser.white.includes('sub/' + sgps + ',')) {
GA.white = true;
}
}
else if (GA.sgsteam.includes('bundle/')) {
let sgpb = parseInt(GA.sgsteam.split('bundle/')[1].split('/')[0].split('?')[0].split('#')[0]);
if (GJuser.white.includes('bundle/' + sgpb + ',')) {
GA.white = true;
}
}
if (
(GA.levelPass) &&
(this.getConfig('ending', 0) === 0 || GA.left <= this.getConfig('ending', 0)) &&
(GA.type === 'p' || GA.type === 'g' && this.getConfig('group_first', false) || GA.type === 'g' && this.getConfig('group_only', false) || GA.type === 'w' && this.getConfig('wishlist_first', false) || GA.type === 'w' && this.getConfig('wishlist_only', false))
)
this.giveaways.push(GA);
});
if (callback) {
callback();
}
});
}
giveawaysEnter(callback) {
let _this = this;
let sgcurr = 0,
sga = [],
sgb = [],
sgc = [];
if (_this.getConfig('sort_by_chance', false)) {
_this.giveaways.sort((a, b) => {
return b.chance - a.chance;
});
}
if (_this.getConfig('sort_by_level', false)) {
_this.giveaways.sort((a, b) => {
return b.level - a.level;
});
}
if (_this.getConfig('sort_by_copies', false)) {
_this.giveaways.sort((a, b) => {
return b.copies - a.copies;
});
}
if (_this.getConfig('multiple_first', false)) {
sga = _this.giveaways.filter(GA => GA.copies > 1);
sgb = _this.giveaways.filter(GA => GA.copies === 1);
_this.giveaways = [].concat(sga, sgb);
}
if (_this.getConfig('card_first', false)) {
sga = _this.giveaways.filter(GA => GA.card === true);
sgb = _this.giveaways.filter(GA => GA.card === false);
_this.giveaways = [].concat(sga, sgb);
}
if (_this.getConfig('group_first', false)) {
sga = _this.giveaways.filter(GA => GA.type === 'g');
sgb = _this.giveaways.filter(GA => GA.type !== 'g');
_this.giveaways = [].concat(sga, sgb);
}
if (_this.getConfig('wishlist_first', false)) {
sga = _this.giveaways.filter(GA => GA.type === 'w');
sgb = _this.giveaways.filter(GA => GA.type !== 'w');
_this.giveaways = [].concat(sga, sgb);
}
if (_this.getConfig('whitelist_first', false)) {
sga = _this.giveaways.filter(GA => GA.white === true);
sgb = _this.giveaways.filter(GA => GA.white === false);
_this.giveaways = [].concat(sga, sgb);
}
if (_this.getConfig('whitelist_only', false) && !_this.getConfig('wishlist_only', false) && !_this.getConfig('group_only', false)) {
sga = _this.giveaways.filter(GA => GA.white === true);
_this.giveaways = sga;
}
if (_this.getConfig('whitelist_only', false) && _this.getConfig('wishlist_only', false) && !_this.getConfig('group_only', false)) {
sga = _this.giveaways.filter(GA => GA.white === true);
sgb = _this.giveaways.filter(GA => GA.type === 'w');
_this.giveaways = [].concat(sga, sgb);
}
if (_this.getConfig('whitelist_only', false) && !_this.getConfig('wishlist_only', false) && _this.getConfig('group_only', false)) {
sga = _this.giveaways.filter(GA => GA.white === true);
sgb = _this.giveaways.filter(GA => GA.type === 'g');
_this.giveaways = [].concat(sga, sgb);
}
if (!_this.getConfig('whitelist_only', false) && _this.getConfig('wishlist_only', false) && !_this.getConfig('group_only', false)) {
sga = _this.giveaways.filter(GA => GA.type === 'w');
_this.giveaways = sga;
}
if (!_this.getConfig('whitelist_only', false) && !_this.getConfig('wishlist_only', false) && _this.getConfig('group_only', false)) {
sga = _this.giveaways.filter(GA => GA.type === 'g');
_this.giveaways = sga;
}
if (!_this.getConfig('whitelist_only', false) && _this.getConfig('wishlist_only', false) && _this.getConfig('group_only', false)) {
sga = _this.giveaways.filter(GA => GA.type === 'w');
sgb = _this.giveaways.filter(GA => GA.type === 'g');
_this.giveaways = [].concat(sga, sgb);
}
if (_this.getConfig('whitelist_only', false) && _this.getConfig('wishlist_only', false) && _this.getConfig('group_only', false)) {
sga = _this.giveaways.filter(GA => GA.white === true);
sgb = _this.giveaways.filter(GA => GA.type === 'w');
sgc = _this.giveaways.filter(GA => GA.type === 'g');
_this.giveaways = [].concat(sga, sgb, sgc);
}
function processOne() {
if (_this.doTimer() - _this.totalTicks < 240) {
_this.totalTicks = 1;
}
if (_this.giveaways.length <= sgcurr || !_this.started) {
_this.log(Lang.get('service.checked') + '1#-' + _this.getConfig('pages', 1) + '#', 'srch');
if (_this.statusIcon.attr('data-status') === 'work') {
_this.setStatus('good');
}
if (callback) {
callback(false);
}
return;
}
let sgnext = _this.interval();
let GA = _this.giveaways[sgcurr],
sgown = 0,
sgapp = 0,
sgsub = 0,
sgbun = 0,
sgblack = '',
sgid = '???',
sgref = _this.url + '/';
if (GA.page === 'w') {
sgref = sgref + 'giveaways/search?type=wishlist';
}
else if (GA.page === 'g') {
sgref = sgref + 'giveaways/search?type=group';
}
else if (GA.page > 1) {
sgref = sgref + 'giveaways/search?page=' + GA.page;
}
if (_this.getConfig('skip_ost', false) && !GA.nam.toLowerCase().includes(' + original soundtrack')) {
if (GA.nam.toLowerCase().includes('soundtrack') || GA.nam.toLowerCase().includes(' - ost')) {
sgown = 8;
}
}
if (GA.sgsteam.includes('app/')) {
sgapp = parseInt(GA.sgsteam.split('app/')[1].split('/')[0].split('?')[0].split('#')[0]);
sgid = 'app/' + sgapp;
}
else if (GA.sgsteam.includes('sub/')) {
sgsub = parseInt(GA.sgsteam.split('sub/')[1].split('/')[0].split('?')[0].split('#')[0]);
sgid = 'sub/' + sgsub;
}
else if (GA.sgsteam.includes('bundle/')) {
sgbun = parseInt(GA.sgsteam.split('bundle/')[1].split('/')[0].split('?')[0].split('#')[0]);
sgid = 'bundle/' + sgbun;
}
if (_this.curr_value < GA.cost && GA.cost > 0) {
sgown = 3;
}
if (
(!GA.white) &&
(GA.type === 'p') &&
(_this.getConfig('points_reserve', 0) > 0) &&
((_this.curr_value - GA.cost) < _this.getConfig('points_reserve', 0)) &&
(GA.cost > 0)
)
{
sgown = 7;
}
if (
(GA.type !== 'w' && !GA.white && GA.dlc && _this.getConfig('skip_dlc', false)) ||
(GA.type !== 'w' && !GA.white && !GA.card && _this.getConfig('card_only', false))
)
{
sgown = 8;
}
if (GA.entered) {
sgown = 5;
}
else if (_this.giveaways.filter(i => i.code === GA.code && i.entered === true).length > 0) {
sgown = 5;
}
if (_this.getConfig('check_in_steam', true)) {
if (GJuser.ownapps === '' && GJuser.ownsubs === '') {
sgown = 2;
}
if (GJuser.ownapps.includes(',' + sgapp + ',') && sgapp > 0) {
sgown = 1;
}
if (GJuser.ownsubs.includes(',' + sgsub + ',') && sgsub > 0) {
sgown = 1;
}
}
if (GJuser.black.includes(sgid + ',') && _this.getConfig('blacklist_on', false)) {
sgown = 4;
}
if (GA.entered && sgown === 1) {
sgown = 6;
}
let sglog = _this.logLink(GA.lnk, GA.nam);
if (GA.dlc) {
if (GJuser.skip_dlc.includes(',' + sgapp + ',')) {
sglog = '⊟ ' + sglog;
}
else {
sglog = '⊞ ' + sglog;
}
}
if (GA.card) {
sglog = '♦ ' + sglog;
}
if (sgid !== '???') {
sgblack = _this.logWhite(sgid) + _this.logBlack(sgid);
}
if (_this.getConfig('log', true)) {
sglog = '|' + GA.page + '#|' + GA.order + '№|'+ GA.copies + 'x|' + GA.entries + 'e|' + GA.chance + '%|' + GA.time + '|' + GA.level + 'L|' + GA.cost + '$|  ' + sglog;
}
else {
sglog = sglog + sgblack;
}
sglog = Lang.get('service.checking') + sglog;
if (GA.white) {
sglog = '[w] ' + sglog;
}
if (_this.dsave.includes(',' + sgid + ',') && sgown !== 6) {
sgown = 1;
}
if (_this.wait) {
sgown = -1;
}
else if (_this.sgretry === 0) {
_this.log(sglog + sgblack, 'chk');
}
sglog = sglog.replace(Lang.get('service.checking'), '').replace('[w] ', '');
if (sgown > 0) {
switch (sgown) {
case 1:
_this.log(Lang.get('service.have_on_steam'), 'steam');
break;
case 2:
_this.log(Lang.get('service.steam_error'), 'err');
break;
case 3:
_this.log(Lang.get('service.points_low'), 'skip');
break;
case 4:
_this.log(Lang.get('service.blacklisted'), 'black');
break;
case 5:
_this.log(Lang.get('service.already_joined'), 'jnd');
break;
case 6:
_this.log(Lang.get('service.already_joined') + ',' + Lang.get('service.have_on_steam').split('-')[1], 'cant');
break;
case 7:
_this.log(Lang.get('service.points_low') + ' (' + Lang.get('service.points_reserve') + ' - ' + _this.getConfig('points_reserve', 0) + ')', 'skip');
break;
case 8:
_this.log(Lang.get('service.skipped'), 'skip');
break;
}
sgnext = 50;
if (sgown === 6 && _this.getConfig('remove_ga', true)) {
sgnext = 2000;
rq({
method: 'POST',
url: _this.url + '/ajax.php',
headers: {
'authority': 'www.steamgifts.com',
'from': 'esgst.extension@gmail.com',
'user-agent': _this.ua,
'esgst-version': '8.9.1',
'content-type': 'application/x-www-form-urlencoded',
'accept': '*/*',
'origin': _this.url,
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': sgref,
'cookie': _this.cookies
},
data: 'xsrf_token=' + _this.token + '&do=entry_delete&code=' + GA.code
})
.then((data) => {
data = data.data;
if (data.type === 'success') {
_this.log(Lang.get('service.removed') + _this.logLink(GA.lnk, GA.nam), 'info');
_this.setValue(data.points);
GA.entered = false;
}
});
}
if ((sgown === 1 || sgown === 6) && !_this.dsave.includes(',' + sgid + ',') && _this.getConfig('hide_ga', false)) {
sgnext = 2000;
sgown = 6;
rq({
method: 'POST',
url: _this.url + '/ajax.php',
headers: {
'authority': 'www.steamgifts.com',
'from': 'esgst.extension@gmail.com',
'user-agent': _this.ua,
'esgst-version': '8.9.1',
'content-type': 'application/x-www-form-urlencoded',
'accept': '*/*',
'origin': _this.url,
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': sgref,
'cookie': _this.cookies
},
data: 'xsrf_token=' + _this.token + '&do=hide_giveaways_by_game_id&game_id=' + GA.gameid
})
.then(() => {
_this.log(Lang.get('service.hided') + _this.logLink(GA.lnk, GA.nam), 'info');
_this.dsave = _this.dsave + sgid + ',';
});
}
sgcurr++;
}
else if (
(sgown === 0) &&
(GA.white || GA.type === 'w' && _this.getConfig('ignore_on_wish', false) || GA.type === 'g' && _this.getConfig('ignore_on_group', false) || _this.getConfig('max_level', 0) === 0 || GA.level >= _this.getConfig('min_level', 0) && GA.level <= _this.getConfig('max_level', 0) && _this.getConfig('max_level', 0) > 0) &&
(GA.white || GA.type === 'w' && _this.getConfig('ignore_on_wish', false) || GA.type === 'g' && _this.getConfig('ignore_on_group', false) || GA.cost >= _this.getConfig('min_cost', 0) || GA.cost === 0 && _this.getConfig('free_ga', false)) &&
(GA.white || GA.type === 'w' && _this.getConfig('ignore_on_wish', false) || GA.type === 'g' && _this.getConfig('ignore_on_group', false) || _this.getConfig('max_cost', 0) === 0 || GA.cost <= _this.getConfig('max_cost', 0)) &&
(GA.white || GA.type === 'w' && _this.getConfig('ignore_on_wish', false) || GA.type === 'g' && _this.getConfig('ignore_on_group', false) || GA.type === 'w' && _this.getConfig('reserve_on_wish', false) || GA.type === 'g' && _this.getConfig('reserve_on_group', false) || (_this.curr_value - GA.cost) >= _this.getConfig('points_reserve', 0) || GA.cost === 0) &&
(GA.white || GA.type === 'w' && _this.getConfig('ignore_on_wish', false) || GA.type === 'g' && _this.getConfig('ignore_on_group', false) || _this.getConfig('min_chance', 0) === 0 || GA.chance >= _this.getConfig('min_chance', 0)) &&
(GA.white || GA.type === 'w' && _this.getConfig('ignore_on_wish', false) || GA.type === 'g' && _this.getConfig('ignore_on_group', false) || _this.getConfig('min_entries', 0) === 0 || GA.entries >= _this.getConfig('min_entries', 0))
)
{
_this.wait = true;
rq({
method: 'GET',
url: GA.lnk,
headers: {
'connection': 'keep-alive',
'authority': 'www.steamgifts.com',
'from': 'esgst.extension@gmail.com',
'user-agent': _this.ua,
'esgst-version': '8.9.1',
'content-type': 'application/x-www-form-urlencoded',
'accept': '*/*',
'origin': _this.url,
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': sgref,
'cookie': _this.cookies
},
responseType: 'document'
})
.then((ga) => {
ga = ga.data;
ga = $(ga.replace(/<img/gi, '<noload'));
let sgname = ga.find('.featured__heading__medium').text(),
sgerr = ga.find('.sidebar__error').text(),
sgend = ga.find('.sidebar__entry-insert');
sglog = Lang.get('service.checking') + sglog.replace(GA.nam, sgname);
if (GA.white) {
sglog = '[w] ' + sglog;
}
if (_this.sgretry === 0) {
_this.unlog();
_this.log(sglog + sgblack, 'chk');
}
sglog = sglog.replace(Lang.get('service.checking'), '').replace('[w] ', '');
if (_this.getConfig('skip_ost', false) && !sgname.toLowerCase().includes(' + original soundtrack')) {
if (sgname.toLowerCase().includes('soundtrack') || sgname.toLowerCase().includes(' - ost')) {
sgown = 1;
}
}
if (sgerr !== undefined) {
if (sgerr === ' Not Enough Points') {
_this.setValue(GA.cost - 1);
sgown = 3;
}
else if (sgerr.includes('Level') && sgerr.includes('Required')) {
_this.curr_level = parseInt(sgerr.replace(/\D/g, '')) - 1;
_this.setLevel(parseInt(sgerr.replace(/\D/g, '')) - 1);
sgown = 4;
}
else if (sgerr === ' Exists in Account') {
sgown = 5;
}
else if (sgerr === ' Missing Base Game') {
sgown = 6;
}
else if (sgerr.length > 3) {
_this.log(sgerr);
}
}
if (sgend === undefined) {
sgown = 2;
}
})
.finally(() => {
if (sgown > 0) {
switch (sgown) {
case 1:
_this.log(Lang.get('service.skipped'), 'skip');
break;
case 2:
_this.log(Lang.get('service.time'), 'cant');
break;
case 3:
_this.log(Lang.get('service.cant_join') + ' (' + Lang.get('service.value_label') + ' - ' + (GA.cost - 1) + '?)', 'skip');
break;
case 4:
_this.log(Lang.get('service.cant_join') + ' (' + Lang.get('service.level_label') + ' - ' + _this.curr_level + '?)', 'skip');
break;
case 5:
_this.log(Lang.get('service.cant_join') + ',' + Lang.get('service.have_on_steam').split('-')[1], 'cant');
break;
case 6:
_this.log(Lang.get('service.cant_join') + ' (Missing Base Game)', 'cant');
break;
}
sgcurr++;
_this.wait = false;
}
else if (sgown === 0) {
let sgdata = 'err';
rq({
method: 'POST',
url: _this.url + '/ajax.php',
headers: {
'authority': 'www.steamgifts.com',
'from': 'esgst.extension@gmail.com',
'user-agent': _this.ua,
'esgst-version': '8.9.1',
'content-type': 'application/x-www-form-urlencoded',
'accept': '*/*',
'origin': _this.url,
'sec-fetch-site': 'same-origin',
'sec-fetch-mode': 'cors',
'sec-fetch-dest': 'empty',
'referer': sgref,
'cookie': _this.cookies
},
data: 'xsrf_token=' + _this.token + '&do=entry_insert&code=' + GA.code
})
.then((sgenter) => {
sgdata = sgenter.data;
})
.finally(() => {
if (sgdata === 'err') {
if (_this.sgretry < 4) {
_this.sgretry++;
_this.wait = false;
}
else {
_this.sgretry = 0;
_this.log(Lang.get('service.err_join'), 'cant');
sgcurr++;
_this.wait = false;
}
}
else if (sgdata.type === 'success') {
_this.sgretry = 0;
_this.log(Lang.get('service.entered_in') + sglog, 'enter');
_this.setValue(sgdata.points);
GA.entered = true;
sgcurr++;
_this.wait = false;
}
else if (sgdata.type === 'error') {
if (sgdata.msg === 'Not Enough Points') {
_this.sgretry = 0;
_this.log(Lang.get('service.cant_join') + ' (' + Lang.get('service.value_label') + ' - ' + (sgdata.points) + ')', 'cant');
_this.setValue(sgdata.points);
sgcurr++;
_this.wait = false;
}
else {
_this.log(JSON.stringify(sgdata));
if (_this.sgretry < 4) {
_this.sgretry++;
_this.wait = false;
}
else {
_this.sgretry = 0;
_this.log(Lang.get('service.err_join'), 'cant');
sgcurr++;
_this.wait = false;
}
}
}
else {
if (_this.sgretry < 4) {
_this.sgretry++;
_this.wait = false;
}
else {
_this.sgretry = 0;
_this.log(Lang.get('service.err_join'), 'cant');
sgcurr++;
_this.wait = false;
}
}
});
}
});
}
else if (sgown !== -1) {
if (sgown === 0) {
_this.log(Lang.get('service.skipped'), 'skip');
}
sgnext = 50;
sgcurr++;
_this.wait = false;
}
setTimeout(processOne, sgnext);
}
processOne();
}
}
