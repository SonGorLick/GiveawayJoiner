'use strict';
window.timeStr = function () {
let date = new Date();
let h = date.getHours(), i = date.getMinutes(), s = date.getSeconds();
return (h > 9 ? h : '0' + h ) + ":" + (i > 9 ? i : '0' + i ) + ":" + (s > 9 ? s : '0' + s );
};
window.timeToStr = function (time) {
let str = '';
let h = Math.floor(time / 3600),
i = Math.floor(time / 60 - h * 60),
s = time % 60;
str = (h > 9 ? h : '0' + h ) + ':' + (i > 9 ? i : '0' + i ) + ':' + (s > 9 ? s : '0' + s );
return str;
};
window.async = function(func, callback) {
setTimeout(function() {
func();
if (callback) callback();
}, 1);
};
