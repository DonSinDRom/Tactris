module.exports.ObjectKeys = function () {
	'use strict';
	var hasOwnProperty = Object.prototype.hasOwnProperty,
		hasDontEnumBug = !({
			toString: null
		}).propertyIsEnumerable('toString'),
		dontEnums = [
			'toString',
			'toLocaleString',
			'valueOf',
			'hasOwnProperty',
			'isPrototypeOf',
			'propertyIsEnumerable',
			'constructor'
		],
		dontEnumsLength = dontEnums.length;
	return function (obj) {
		if (typeof obj !== 'object' && (typeof obj !== 'function' || obj === null)) {
			throw new TypeError('Object.keys called on non-object');
		}
		var result = [],
			prop, i;
		for (prop in obj) {
			if (hasOwnProperty.call(obj, prop)) {
				result.push(prop);
			}
		}
		if (hasDontEnumBug) {
			for (i = 0; i < dontEnumsLength; i++) {
				if (hasOwnProperty.call(obj, dontEnums[i])) {
					result.push(dontEnums[i]);
				}
			}
		}
		return result;
	};
};

module.exports.ArrayEvery = function (callbackfn, thisArg) {
	'use strict';
	var T, k;
	if (this == null) {
		throw new TypeError('this is null or not defined');
	}
	var O = Object(this);
	var len = O.length >>> 0;
	if (typeof callbackfn !== 'function') {
		throw new TypeError();
	}
	if (arguments.length > 1) {
		T = thisArg;
	}
	k = 0;
	while (k < len) {
		var kValue;
		if (k in O) {
			kValue = O[k];
			var testResult = callbackfn.call(T, kValue, k, O);
			if (!testResult) {
				return false;
			}
		}
		k++;
	}
	return true;
};

module.exports.ArraySome = function (fun /*, thisArg*/ ) {
	'use strict';
	if (this == null) {
		throw new TypeError('Array.prototype.some called on null or undefined');
	}
	if (typeof fun !== 'function') {
		throw new TypeError();
	}
	var t = Object(this);
	var len = t.length >>> 0;
	var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
	for (var i = 0; i < len; i++) {
		if (i in t && fun.call(thisArg, t[i], i, t)) {
			return true;
		}
	}
	return false;
};

module.exports.ArrayFilter = function (fun /*, thisArg*/ ) {
	'use strict';
	if (this === void 0 || this === null) {
		throw new TypeError();
	}
	var t = Object(this);
	var len = t.length >>> 0;
	if (typeof fun !== 'function') {
		throw new TypeError();
	}
	var res = [];
	var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
	for (var i = 0; i < len; i++) {
		if (i in t) {
			var val = t[i];
			if (fun.call(thisArg, val, i, t)) {
				res.push(val);
			}
		}
	}
	return res;
};

module.exports.ArrayFind = function (predicate) {
	if (this === null) {
		throw new TypeError('Array.prototype.find called on null or undefined');
	}
	if (typeof predicate !== 'function') {
		throw new TypeError('predicate must be a function');
	}
	var list = Object(this);
	var length = list.length >>> 0;
	var thisArg = arguments[1];
	var value;
	for (var i = 0; i < length; i++) {
		value = list[i];
		if (predicate.call(thisArg, value, i, list)) {
			return value;
		}
	}
	return undefined;
};

module.exports.ArrayFindIndex = function (predicate) {
	if (this === null) {
		throw new TypeError('Array.prototype.findIndex called on null or undefined');
	}
	if (typeof predicate !== 'function') {
		throw new TypeError('predicate must be a function');
	}
	var list = Object(this);
	var length = list.length >>> 0;
	var thisArg = arguments[1];
	var value;
	for (var i = 0; i < length; i++) {
		value = list[i];
		if (predicate.call(thisArg, value, i, list)) {
			return i;
		}
	}
	return -1;
};

module.exports.ArrayForEach = function (callback, thisArg) {
	var T, k;
	if (this == null) {
		throw new TypeError(' this is null or not defined');
	}
	var O = Object(this);
	var len = O.length >>> 0;
	if (typeof callback !== "function") {
		throw new TypeError(callback + ' is not a function');
	}
	if (arguments.length > 1) {
		T = thisArg;
	}
	k = 0;
	while (k < len) {
		var kValue;
		if (k in O) {
			kValue = O[k];
			callback.call(T, kValue, k, O);
		}
		k++;
	}
};

module.exports.ArrayIncludes = function (searchElement /*, fromIndex*/ ) {
	'use strict';
	var O = Object(this);
	var len = parseInt(O.length) || 0;
	if (len === 0) {
		return false;
	}
	var n = parseInt(arguments[1]) || 0;
	var k;
	if (n >= 0) {
		k = n;
	} else {
		k = len + n;
		if (k < 0) {
			k = 0;
		}
	}
	var currentElement;
	while (k < len) {
		currentElement = O[k];
		if (searchElement === currentElement ||
			(searchElement !== searchElement && currentElement !== currentElement)) {
			return true;
		}
		k++;
	}
	return false;
};
