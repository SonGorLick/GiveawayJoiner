'use strict';
class FGL extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://freegamelottery.com';
this.authContent = 'My Points';
this.authLink = 'https://github.com/pumPCin/GiveawayJoiner/wiki/FGL';
this.auth = Lang.get('service.wiki') + 'FGL';
this.settings.intervalfrom = { type: 'number', trans: 'service.intervalfrom', min: 0, max: this.getConfig('intervalto', 0), default: this.getConfig('intervalfrom', 0) };
this.settings.intervalto = { type: 'number', trans: 'service.intervalto', min: this.getConfig('intervalfrom', 0), max: 360, default: this.getConfig('intervalto', 0) };
this.setConfig('check_in_steam', false);
delete this.settings.interval_from;
delete this.settings.interval_to;
delete this.settings.pages;
delete this.settings.check_in_steam;
delete this.settings.blacklist_on;
super.init();
}
authCheck(callback) {
$.ajax({
url: 'https://freegamelottery.com',
success: function () {
callback(1);
},
error: function () {
callback(-1);
}
});
}
getUserInfo(callback) {
let userData = {
avatar: '../app.asar/images/FGL.png',
username: 'FGL'
};
callback(userData);
}
joinService() {
let _this = this;
let fgtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = fgtimer;
if (_this.getConfig('intervalfrom', 0) === 0 || _this.getConfig('intervalto', 0) === 0) {
_this.dload = 0;
}
else {
if (_this.dload === 0 || _this.dload === ',') {
_this.dload = 1;
}
}
_this.url = 'https://d.freegamelottery.com/draw/register-visit';
_this.fgurl = 'https://d.freegamelottery.com';
_this.dcheck = true;
if (!fs.existsSync(dirdata + 'fgl1.txt')) {
_this.log(Lang.get('service.dt_no') + '/giveawayjoinerdata/fgl1.txt', 'err');
_this.stopJoiner(true);
}
let fgcurr = _this.dload,
fgnext = 10000;
function giveawayEnter() {
if (!_this.dcheck || !_this.started) {
if (!_this.started) {
_this.dload = 1;
}
_this.log(Lang.get('service.checked') + 'FGL', 'srch');
if (_this.started) {
if (_this.statusIcon.attr('data-status') === 'work') {
_this.setStatus('good');
}
}
return;
}
if (_this.dload > 0) {
_this.dload = _this.dload + 1;
_this.dcheck = false;
if (!fs.existsSync(dirdata + 'fgl' + _this.dload + '.txt')) {
_this.dload = 1;
}
else {
let fgtimer = (Math.floor(Math.random() * (_this.getConfig('intervalto', 0) - _this.getConfig('intervalfrom', 0))) + _this.getConfig('intervalfrom', 0));
_this.stimer = fgtimer;
}
}
if (fs.existsSync(dirdata + 'fgl' + fgcurr + '.txt') && fgcurr > 0) {
_this.log(Lang.get('service.open_file') + 'fgl' + fgcurr + '.txt', 'info');
let fgdata = fs.readFileSync(dirdata + 'fgl' + fgcurr + '.txt');
if (fgdata.includes(',')) {
let fgd = (fgdata.toString()).split(','),
fglogin = fgd[0],
fgpass= fgd[1],
fgid = '',
fgname = fglogin,
fgmaindraw = 0,
fgsurveydraw = 0,
fgvideodraw = 0,
fgstackpotdraw = 0,
fgmainvisit = false,
fgsurveyvisit = false,
fgvideovisit = false,
fgstackpotvisit = false,
fglog = '';
$.ajax({
url: 'https://freegamelottery.com/user/login',
method: 'POST',
data: 'username=' + fglogin + '&password=' + fgpass + '&rememberMe=1',
headers: {
'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8'
},
success: function (data) {
if (data.result === 'success') {
$.ajax({
url: _this.fgurl + '/dashboard-system.js',
success: function (account) {
let fgacc = JSON.parse(account.replace('var System = ', '').replace('}};', '}}'));
fgid = fgacc.user.id;
fgname = fgacc.user.login;
if (!account.includes('"main":{"actual":null')) {
fgmaindraw = fgacc.draws.main.actual.id;
fgmainvisit = fgacc.draws.main.actual.haveVisited;
}
else {
fgmaindraw = 1;
fgmainvisit = true;
}
if (!account.includes('"survey":{"actual":null')) {
fgsurveydraw = fgacc.draws.survey.actual.id;
fgsurveyvisit = fgacc.draws.survey.actual.haveVisited;
}
else {
fgsurveydraw = 1;
fgsurveyvisit = true;
}
if (!account.includes('"video":{"actual":null')) {
fgvideodraw = fgacc.draws.video.actual.id;
fgvideovisit = fgacc.draws.video.actual.haveVisited;
}
else {
fgvideodraw = 1;
fgvideovisit = true;
}
if (!account.includes('"stackpot":{"actual":null')) {
fgstackpotdraw = fgacc.draws.stackpot.actual.id;
fgstackpotvisit = fgacc.draws.stackpot.actual.haveVisited;
}
else {
fgstackpotdraw = 1;
fgstackpotvisit = true;
}
_this.log(Lang.get('service.acc') + fgname, 'jnd');
if (!_this.getConfig('log', true)) {
fglog = Lang.get('service.acc') + fgname + ': ';
}
if (account.indexOf('"winner":{"id":' + fgid + ',') >= 0) {
_this.log(fglog + Lang.get('service.win'), 'win');
_this.logWin(' FGL (' + fgname + ')');
_this.setStatus('win');
if (_this.getConfig('sound', true)) {
new Audio('../app.asar/sounds/won.wav').play();
}
}
if (fgmaindraw > 0) {
if (!fgmainvisit) {
$.ajax({
url: _this.url,
method: 'POST',
data: 'drawId=' + fgmaindraw,
success: function () {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Visit MAIN DRAW', 'chk');
_this.log(fglog + Lang.get('service.entered_in') + 'MAIN DRAW', 'enter');
}
});
}
else {
if (fgmaindraw > 1) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Visit MAIN DRAW', 'chk');
_this.log(Lang.get('service.skip'), 'skip');
}
}
}
else {
_this.log(Lang.get('service.connection_error'), 'err');
}
if (fgsurveydraw > 0) {
if (!fgsurveyvisit) {
$.ajax({
url: _this.url,
method: 'POST',
data: 'type=survey&drawId=' + fgsurveydraw,
success: function () {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Visit SURVEY DRAW', 'chk');
_this.log(fglog + Lang.get('service.entered_in') + 'SURVEY DRAW', 'enter');
}
});
}
else {
if (fgsurveydraw > 1) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Visit SURVEY DRAW', 'chk');
_this.log(Lang.get('service.skip'), 'skip');
}
}
}
else {
_this.log(Lang.get('service.connection_error'), 'err');
}
if (fgvideodraw > 0) {
if (!fgvideovisit) {
$.ajax({
url: _this.url,
method: 'POST',
data: 'drawId=' + fgvideodraw,
success: function () {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Visit VIDEO DRAW', 'chk');
_this.log(fglog + Lang.get('service.entered_in') + 'VIDEO DRAW', 'enter');
}
});
}
else {
if (fgvideodraw > 1) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Visit VIDEO DRAW', 'chk');
_this.log(Lang.get('service.skip'), 'skip');
}
}
}
else {
_this.log(Lang.get('service.connection_error'), 'err');
}
if (fgstackpotdraw > 0) {
if (!fgstackpotvisit) {
$.ajax({
url: _this.url,
method: 'POST',
data: 'type=stackpot&drawId=' + fgstackpotdraw,
success: function () {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Visit STACKPOT', 'chk');
_this.log(fglog + Lang.get('service.entered_in') + 'STACKPOT', 'enter');
}
});
}
else {
if (fgstackpotdraw > 1) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Visit STACKPOT', 'chk');
_this.log(Lang.get('service.skip'), 'skip');
}
}
}
else {
_this.log(Lang.get('service.connection_error'), 'err');
}
}
});
}
else {
_this.log(Lang.get('service.connection_error'), 'err');
}
},
error: function () {
_this.log(Lang.get('service.connection_error'), 'err');
}
});
}
else {
_this.log(Lang.get('service.dt_err') + '/giveawayjoinerdata/fgl' + fgcurr + '.txt', 'err');
}
}
else {
if (fgcurr > 0) {
_this.dcheck = false;
}
}
fgcurr++;
setTimeout(giveawayEnter, fgnext);
}
giveawayEnter();
}
}
