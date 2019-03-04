'use strict';
window.timeStr = function () {
let date = new Date();
let h = date.getHours(), i = date.getMinutes(), s = date.getSeconds();
return (h > 9 ? h : '0' + h ) + ":" + (i > 9 ? i : '0' + i ) + ":" + (s > 9 ? s : '0' + s );
};
window.async = function(func, callback) {
setTimeout(function() {
func();
if (callback) callback();
}, 1);
};
