'use strict';
window.timeStr = function () {
let date = new Date();
let h = date.getHours(), i = date.getMinutes(), s = date.getSeconds();
return (h >= 9 ? h : '0' + h ) + ":" + (i >= 9 ? i : '0' + i ) + ":" + (s >= 9 ? s : '0' + s );
};
window.timeToStr = function (time) {
let str = '';
let h = Math.floor(time / 60 / 60),
i = Math.floor(time / 60 - h * 60),
s = time % 60;
if( h < 10 ){h = '0' + h};
str += h + ':';
if( i < 10 ){i = '0' + i};
str += i + ':';
if( s < 10 ){s = '0' + s};
str += s;
return str;
};
window.async = function(func, callback) {
setTimeout(function() {
func();
if (callback) callback();
}, 1);
};
