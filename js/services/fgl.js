'use strict';
class FGL extends Joiner {
constructor() {
super();
this.websiteUrl = 'https://freegamelottery.com';
this.authContent = 'My Points';
this.authLink = 'https://github.com/pumPCin/GiveawayJoiner/wiki/FGL';
this.auth = Lang.get('service.wiki') + 'FGL';
this.authLink = 'https://freegamelottery.com';
this.withValue = false;
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
avatar: dirapp + 'images/FGL.png',
username: 'FGL'
};
callback(userData);
}
joinService() {
let _this = this;
if (_this.getConfig('timer_to', 700) !== _this.getConfig('timer_from', 500)) {
let fgtimer = (Math.floor(Math.random() * (_this.getConfig('timer_to', 700) - _this.getConfig('timer_from', 500))) + _this.getConfig('timer_from', 500));
_this.stimer = fgtimer;
}
_this.url = 'https://d.freegamelottery.com/draw/register-visit';
_this.fgurl = 'https://d.freegamelottery.com';
let fgcurr = 1;
_this.check = true;
function giveawayEnter() {
let fgnext = _this.interval();
if (!_this.check || !_this.started) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checked') + 'FGL', 'srch');
}
return;
}
if (fs.existsSync(dirdata + 'fgl' + fgcurr + '.txt')) {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.open_file') + 'fgl' + fgcurr + '.txt', 'info');
}
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
fgstackpotvisit = false;
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
success: function (data) {
data = JSON.parse(data.replace('var System = ', '').replace('}};', '}}'));
fgid = data.user.id;
fgname = data.user.login;
fgmaindraw = data.draws.main.actual.id;
fgsurveydraw = data.draws.survey.actual.id;
fgvideodraw = data.draws.video.actual.id;
fgstackpotdraw = data.draws.stackpot.actual.id;
fgmainvisit = data.draws.main.actual.haveVisited;
fgsurveyvisit = data.draws.survey.actual.haveVisited;
fgvideovisit = data.draws.video.actual.haveVisited;
fgstackpotvisit = data.draws.stackpot.actual.haveVisited;
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.acc') + fgname);
}
if (fgmaindraw > 0) {
if (!fgmainvisit) {
$.ajax({
url: _this.url,
method: 'POST',
data: 'drawId=' + fgmaindraw,
success: function () {
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Visit MAIN DRAW', 'chk');
_this.log(Lang.get('service.entered_in') + 'MAIN DRAW', 'enter');
}
else {
_this.log(Lang.get('service.acc') + fgname + ': ' + Lang.get('service.entered_in') + 'MAIN DRAW', 'enter');
}
}
});
}
else {
if (_this.getConfig('log', true)) {
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
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Visit SURVEY DRAW', 'chk');
_this.log(Lang.get('service.entered_in') + 'SURVEY DRAW', 'enter');
}
else {
_this.log(Lang.get('service.acc') + fgname + ': ' + Lang.get('service.entered_in') + 'SURVEY DRAW', 'enter');
}
}
});
}
else {
if (_this.getConfig('log', true)) {
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
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Visit VIDEO DRAW', 'chk');
_this.log(Lang.get('service.entered_in') + 'VIDEO DRAW', 'enter');
}
else {
_this.log(Lang.get('service.acc') + fgname + ': ' + Lang.get('service.entered_in') + 'VIDEO DRAW', 'enter');
}
}
});
}
else {
if (_this.getConfig('log', true)) {
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
if (_this.getConfig('log', true)) {
_this.log(Lang.get('service.checking') + Lang.get('service.offer') + 'Visit STACKPOT', 'chk');
_this.log(Lang.get('service.entered_in') + 'STACKPOT', 'enter');
}
else {
_this.log(Lang.get('service.acc') + fgname + ': ' + Lang.get('service.entered_in') + 'STACKPOT', 'enter');
}
}
});
}
else {
if (_this.getConfig('log', true)) {
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
_this.log(Lang.get('service.dt_err'), 'err');
}
}
else {
_this.check = false;
if (fgcurr === 1) {
fs.writeFile(dirdata + 'fgl1.txt', '', (err) => { });
_this.log(Lang.get('service.dt_no') + '/giveawayjoinerdata/fgl1.txt', 'err');
_this.stopJoiner(true);
}
}
fgcurr++;
setTimeout(giveawayEnter, fgnext);
}
giveawayEnter();
}
}
