'use strict';

module.exports.initialize = function (length) {
	'use strict';
	var arr = [];
	for (var i = 0; i < length; i++) {
		arr.push(i);
	}
	return arr;
};

module.exports.max = function () {
	return Math.max.apply(null, this);
};

module.exports.min = function () {
	return Math.min.apply(null, this);
};
