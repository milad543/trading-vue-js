/*!
 * TradingVue.JS - v1.0.3 - Mon Jan 15 2024
 *     https://github.com/tvjsx/trading-vue-js
 *     Copyright (c) 2019 C451 Code's All Right;
 *     Licensed under the MIT license
 */
(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else if(typeof exports === 'object')
		exports["TradingVueJs"] = factory();
	else
		root["TradingVueJs"] = factory();
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ 546:
/***/ ((module) => {

/**
 * Utility compare functions
 */

module.exports = {

    /**
     * Compare two numbers.
     *
     * @param {Number} a
     * @param {Number} b
     * @returns {Number} 1 if a > b, 0 if a = b, -1 if a < b
     */
    numcmp: function (a, b) {
        return a - b;
    },

    /**
     * Compare two strings.
     *
     * @param {Number|String} a
     * @param {Number|String} b
     * @returns {Number} 1 if a > b, 0 if a = b, -1 if a < b
     */
    strcmp: function (a, b) {
        return a < b ? -1 : a > b ? 1 : 0;
    }

};


/***/ }),

/***/ 678:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

/**
 * Indexed Array Binary Search module
 */

/**
 * Dependencies
 */
var util = __webpack_require__(500),
    cmp = __webpack_require__(546),
    bin = __webpack_require__(101);

/**
 * Module interface definition
 */
module.exports = IndexedArray;

/**
 * Indexed Array constructor
 *
 * It loads the array data, defines the index field and the comparison function
 * to be used.
 *
 * @param {Array} data is an array of objects
 * @param {String} index is the object's property used to search the array
 */
function IndexedArray(data, index) {

    // is data sortable array or array-like object?
    if (!util.isSortableArrayLike(data))
        throw new Error("Invalid data");

    // is index a valid property?
    if (!index || data.length > 0 && !(index in data[0]))
        throw new Error("Invalid index");

    // data array
    this.data = data;

    // name of the index property
    this.index = index;

    // set index boundary values
    this.setBoundaries();

    // default comparison function
    this.compare = typeof this.minv === "number" ? cmp.numcmp : cmp.strcmp;

    // default search function
    this.search = bin.search;

    // cache of index values to array positions
    // each value stores an object as { found: true|false, index: array-index }
    this.valpos = {};

    // cursor and adjacent positions
    this.cursor = null;
    this.nextlow = null;
    this.nexthigh = null;
}

/**
 * Set the comparison function
 *
 * @param {Function} fn to compare index values that returnes 1, 0, -1
 */
IndexedArray.prototype.setCompare = function (fn) {
    if (typeof fn !== "function")
        throw new Error("Invalid argument");

    this.compare = fn;
    return this;
};

/**
 * Set the search function
 *
 * @param {Function} fn to search index values in the array of objects
 */
IndexedArray.prototype.setSearch = function (fn) {
    if (typeof fn !== "function")
        throw new Error("Invalid argument");

    this.search = fn;
    return this;
};

/**
 * Sort the data array by its index property
 */
IndexedArray.prototype.sort = function () {
    var self = this,
        index = this.index;

    // sort the array
    this.data.sort(function (a, b) {
        return self.compare(a[index], b[index]);
    });

    // recalculate boundary values
    this.setBoundaries();

    return this;
};

/**
 * Inspect and set the boundaries of the internal data array
 */
IndexedArray.prototype.setBoundaries = function () {
    var data = this.data,
        index = this.index;

    this.minv = data.length && data[0][index];
    this.maxv = data.length && data[data.length - 1][index];

    return this;
};

/**
 * Get the position of the object corresponding to the given index
 *
 * @param {Number|String} index is the id of the requested object
 * @returns {Number} the position of the object in the array
 */
IndexedArray.prototype.fetch = function (value) {
    // check data has objects
    if (this.data.length === 0) {
        this.cursor = null;
        this.nextlow = null;
        this.nexthigh = null;
        return this;
    }

    // check the request is within range
    if (this.compare(value, this.minv) === -1) {
        this.cursor = null;
        this.nextlow = null;
        this.nexthigh = 0;
        return this;
    }
    if (this.compare(value, this.maxv) === 1) {
        this.cursor = null;
        this.nextlow = this.data.length - 1;
        this.nexthigh = null;
        return this;
    }

    var valpos = this.valpos,
        pos = valpos[value];

    // if the request is memorized, just give it back
    if (pos) {
        if (pos.found) {
            this.cursor = pos.index;
            this.nextlow = null;
            this.nexthigh = null;
        } else {
            this.cursor = null;
            this.nextlow = pos.prev;
            this.nexthigh = pos.next;
        }
        return this;
    }

    // if not, do the search
    var result = this.search.call(this, value);
    this.cursor = result.index;
    this.nextlow = result.prev;
    this.nexthigh = result.next;
    return this;
};

/**
 * Get the object corresponding to the given index
 *
 * When no value is given, the function will default to the last fetched item.
 *
 * @param {Number|String} [optional] index is the id of the requested object
 * @returns {Object} the found object or null
 */
IndexedArray.prototype.get = function (value) {
    if (value)
        this.fetch(value);

    var pos = this.cursor;
    return pos !== null ? this.data[pos] : null;
};

/**
 * Get an slice of the data array
 *
 * Boundaries have to be in order.
 *
 * @param {Number|String} begin index is the id of the requested object
 * @param {Number|String} end index is the id of the requested object
 * @returns {Object} the slice of data array or []
 */
IndexedArray.prototype.getRange = function (begin, end) {
    // check if boundaries are in order
    if (this.compare(begin, end) === 1) {
        return [];
    }

    // fetch start and default to the next index above
    this.fetch(begin);
    var start = this.cursor || this.nexthigh;

    // fetch finish and default to the next index below
    this.fetch(end);
    var finish = this.cursor || this.nextlow;

    // if any boundary is not set, return no range
    if (start === null || finish === null) {
        return [];
    }

    // return range
    return this.data.slice(start, finish + 1);
};


/***/ }),

/***/ 101:
/***/ ((module) => {

/**
 * Binary search implementation
 */

/**
 * Main search recursive function
 */
function loop(data, min, max, index, valpos) {

    // set current position as the middle point between min and max
    var curr = (max + min) >>> 1;

    // compare current index value with the one we are looking for
    var diff = this.compare(data[curr][this.index], index);

    // found?
    if (!diff) {
        return valpos[index] = {
            "found": true,
            "index": curr,
            "prev": null,
            "next": null
        };
    }

    // no more positions available?
    if (min >= max) {
        return valpos[index] = {
            "found": false,
            "index": null,
            "prev": (diff < 0) ? max : max - 1,
            "next": (diff < 0) ? max + 1 : max
        };
    }

    // continue looking for index in one of the remaining array halves
    // current position can be skept as index is not there...
    if (diff > 0)
        return loop.call(this, data, min, curr - 1, index, valpos);
    else
        return loop.call(this, data, curr + 1, max, index, valpos);
}

/**
 * Search bootstrap
 * The function has to be executed in the context of the IndexedArray object
 */
function search(index) {
    var data = this.data;
    return loop.call(this, data, 0, data.length - 1, index, this.valpos);
}

/**
 * Export search function
 */
module.exports.search = search;


/***/ }),

/***/ 500:
/***/ ((module) => {

/**
 * Utils module
 */

/**
 * Check if an object is an array-like object
 *
 * @credit Javascript: The Definitive Guide, O'Reilly, 2011
 */
function isArrayLike(o) {
    if (o &&                                 // o is not null, undefined, etc.
        typeof o === "object" &&             // o is an object
        isFinite(o.length) &&                // o.length is a finite number
        o.length >= 0 &&                     // o.length is non-negative
        o.length === Math.floor(o.length) && // o.length is an integer
        o.length < 4294967296)               // o.length < 2^32
        return true;                         // Then o is array-like
    else
        return false;                        // Otherwise it is not
}

/**
 * Check for the existence of the sort function in the object
 */
function isSortable(o) {
    if (o &&                                 // o is not null, undefined, etc.
        typeof o === "object" &&             // o is an object
        typeof o.sort === "function")        // o.sort is a function
        return true;                         // Then o is array-like
    else
        return false;                        // Otherwise it is not
}

/**
 * Check for sortable-array-like objects
 */
module.exports.isSortableArrayLike = function (o) {
    return isArrayLike(o) && isSortable(o);
};


/***/ }),

/***/ 430:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\r\n/* Anit-boostrap tactix */\n.trading-vue *,\r\n::after,\r\n::before {\r\n  box-sizing: content-box;\n}\n.trading-vue img {\r\n  vertical-align: initial;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 47:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-botbar {\r\n    position: relative !important;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 790:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.t-vue-lbtn-grp {\r\n    margin-left: 0.5em;\r\n    display: flex;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 197:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-item-list {\r\n    position: absolute;\r\n    user-select: none;\r\n    margin-top: -5px;\n}\n.tvjs-item-list-item {\r\n    display: flex;\r\n    align-items: center;\r\n    padding-right: 20px;\r\n    font-size: 1.15em;\r\n    letter-spacing: 0.05em;\n}\n.tvjs-item-list-item:hover {\r\n    background-color: #76878319;\n}\n.tvjs-item-list-item * {\r\n    position: relative !important;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 537:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-legend {\r\n    position: relative;\r\n    z-index: 100;\r\n    font-size: 1.25em;\r\n    margin-left: 10px;\r\n    pointer-events: none;\r\n    text-align: left;\r\n    user-select: none;\r\n    font-weight: 300;\n}\n@media (min-resolution: 2x) {\n.trading-vue-legend {\r\n        font-weight: 400;\n}\n}\n.trading-vue-ohlcv {\r\n    pointer-events: none;\r\n    margin-bottom: 0.5em;\n}\n.t-vue-lspan {\r\n    font-variant-numeric: tabular-nums;\r\n    font-size: 0.95em;\r\n    color: #999999; /* TODO: move => params */\r\n    margin-left: 0.1em;\r\n    margin-right: 0.2em;\n}\n.t-vue-title {\r\n    margin-right: 0.25em;\r\n    font-size: 1.45em;\n}\n.t-vue-ind {\r\n  display: flex;\r\n    margin-left: 0.2em;\r\n    margin-bottom: 0.5em;\r\n    font-size: 1.0em;\r\n    margin-top: 0.3em;\n}\n.t-vue-ivalue {\r\n    margin-left: 0.5em;\n}\n.t-vue-unknown {\r\n    color: #999999; /* TODO: move => params */\n}\n.tvjs-appear-enter-active,\r\n.tvjs-appear-leave-active\r\n{\r\n    transition: all .25s ease;\n}\n.tvjs-appear-enter, .tvjs-appear-leave-to\r\n{\r\n    opacity: 0;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 264:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.t-vue-lbtn {\r\n    z-index: 100;\r\n    pointer-events: all;\r\n    cursor: pointer;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 866:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-section {\r\n  height: 0;\r\n  position: absolute;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 260:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-spinner {\r\n    display: inline-block;\r\n    position: relative;\r\n    width: 20px;\r\n    height: 16px;\r\n    margin: -4px 0px -1px 0px;\r\n    opacity: 0.7;\n}\n.tvjs-spinner div {\r\n    position: absolute;\r\n    top: 8px;\r\n    width: 4px;\r\n    height: 4px;\r\n    border-radius: 50%;\r\n    animation-timing-function: cubic-bezier(1, 1, 1, 1);\n}\n.tvjs-spinner div:nth-child(1) {\r\n    left: 2px;\r\n    animation: tvjs-spinner1 0.6s infinite;\r\n    opacity: 0.9;\n}\n.tvjs-spinner div:nth-child(2) {\r\n    left: 2px;\r\n    animation: tvjs-spinner2 0.6s infinite;\n}\n.tvjs-spinner div:nth-child(3) {\r\n    left: 9px;\r\n    animation: tvjs-spinner2 0.6s infinite;\n}\n.tvjs-spinner div:nth-child(4) {\r\n    left: 16px;\r\n    animation: tvjs-spinner3 0.6s infinite;\r\n    opacity: 0.9;\n}\n@keyframes tvjs-spinner1 {\n0% {\r\n        transform: scale(0);\n}\n100% {\r\n        transform: scale(1);\n}\n}\n@keyframes tvjs-spinner3 {\n0% {\r\n        transform: scale(1);\n}\n100% {\r\n        transform: scale(0);\n}\n}\n@keyframes tvjs-spinner2 {\n0% {\r\n        transform: translate(0, 0);\n}\n100% {\r\n        transform: translate(7px, 0);\n}\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 343:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-drift-enter-active {\r\n    transition: all .3s ease;\n}\n.tvjs-drift-leave-active {\r\n    transition: all .8s cubic-bezier(1.0, 0.5, 0.8, 1.0);\n}\n.tvjs-drift-enter, .tvjs-drift-leave-to\r\n{\r\n    transform: translateX(10px);\r\n    opacity: 0;\n}\n.tvjs-the-tip {\r\n    position: absolute;\r\n    width: 200px;\r\n    text-align: center;\r\n    z-index: 10001;\r\n    color: #ffffff;\r\n    font-size: 1.5em;\r\n    line-height: 1.15em;\r\n    padding: 10px;\r\n    border-radius: 3px;\r\n    right: 70px;\r\n    top: 10px;\r\n    text-shadow: 1px 1px black;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 746:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-toolbar {\r\n    position: absolute;\r\n    border-right: 1px solid black;\r\n    z-index: 101;\r\n    padding-top: 3px;\r\n    user-select: none;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 899:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-tbitem {\n}\n.trading-vue-tbitem:hover {\r\n    background-color: #76878319;\n}\n.trading-vue-tbitem-exp {\r\n    position: absolute;\r\n    right: -3px;\r\n    padding: 18.5px 5px;\r\n    font-stretch: extra-condensed;\r\n    transform: scaleX(0.6);\r\n    font-size: 0.6em;\r\n    opacity: 0.0;\r\n    user-select: none;\r\n    line-height: 0;\n}\n.trading-vue-tbitem:hover\r\n.trading-vue-tbitem-exp {\r\n    opacity: 0.5;\n}\n.trading-vue-tbitem-exp:hover {\r\n    background-color: #76878330;\r\n    opacity: 0.9 !important;\n}\n.trading-vue-tbicon {\r\n    position: absolute;\n}\n.trading-vue-tbitem.selected-item > .trading-vue-tbicon,\r\n.tvjs-item-list-item.selected-item > .trading-vue-tbicon {\r\n     filter: brightness(1.45) sepia(1) hue-rotate(90deg) saturate(4.5) !important;\n}\n.tvjs-pixelated {\r\n    -ms-interpolation-mode: nearest-neighbor;\r\n    image-rendering: -webkit-optimize-contrast;\r\n    image-rendering: -webkit-crisp-edges;\r\n    image-rendering: -moz-crisp-edges;\r\n    image-rendering: -o-crisp-edges;\r\n    image-rendering: pixelated;\n}\r\n\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 158:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.trading-vue-ux-wrapper {\n    position: absolute;\n    display: flex;\n}\n.tvjs-ux-wrapper-pin {\n    position: absolute;\n    width: 9px;\n    height: 9px;\n    z-index: 100;\n    background-color: #23a776;\n    border-radius: 10px;\n    margin-left: -6px;\n    margin-top: -6px;\n    pointer-events: none;\n}\n.tvjs-ux-wrapper-head {\n    position: absolute;\n    height: 23px;\n    width: 100%;\n}\n.tvjs-ux-wrapper-close {\n    position: absolute;\n    width: 11px;\n    height: 11px;\n    font-size: 1.5em;\n    line-height: 0.5em;\n    padding: 1px 1px 1px 1px;\n    border-radius: 10px;\n    right: 5px;\n    top: 5px;\n    user-select: none;\n    text-align: center;\n    z-index: 100;\n}\n.tvjs-ux-wrapper-close-hb {\n}\n.tvjs-ux-wrapper-close:hover {\n    background-color: #FF605C !important;\n    color: #692324 !important;\n}\n.tvjs-ux-wrapper-full {\n}\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 251:
/***/ ((module, exports, __webpack_require__) => {

// Imports
var ___CSS_LOADER_API_IMPORT___ = __webpack_require__(645);
exports = ___CSS_LOADER_API_IMPORT___(false);
// Module
exports.push([module.id, "\n.tvjs-widgets {\r\n    position: absolute;\r\n    z-index: 1000;\r\n    pointer-events: none;\n}\r\n", ""]);
// Exports
module.exports = exports;


/***/ }),

/***/ 645:
/***/ ((module) => {

"use strict";


/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
// eslint-disable-next-line func-names
module.exports = function (useSourceMap) {
  var list = []; // return the list of modules as css string

  list.toString = function toString() {
    return this.map(function (item) {
      var content = cssWithMappingToString(item, useSourceMap);

      if (item[2]) {
        return "@media ".concat(item[2], " {").concat(content, "}");
      }

      return content;
    }).join('');
  }; // import a list of modules into the list
  // eslint-disable-next-line func-names


  list.i = function (modules, mediaQuery, dedupe) {
    if (typeof modules === 'string') {
      // eslint-disable-next-line no-param-reassign
      modules = [[null, modules, '']];
    }

    var alreadyImportedModules = {};

    if (dedupe) {
      for (var i = 0; i < this.length; i++) {
        // eslint-disable-next-line prefer-destructuring
        var id = this[i][0];

        if (id != null) {
          alreadyImportedModules[id] = true;
        }
      }
    }

    for (var _i = 0; _i < modules.length; _i++) {
      var item = [].concat(modules[_i]);

      if (dedupe && alreadyImportedModules[item[0]]) {
        // eslint-disable-next-line no-continue
        continue;
      }

      if (mediaQuery) {
        if (!item[2]) {
          item[2] = mediaQuery;
        } else {
          item[2] = "".concat(mediaQuery, " and ").concat(item[2]);
        }
      }

      list.push(item);
    }
  };

  return list;
};

function cssWithMappingToString(item, useSourceMap) {
  var content = item[1] || ''; // eslint-disable-next-line prefer-destructuring

  var cssMapping = item[3];

  if (!cssMapping) {
    return content;
  }

  if (useSourceMap && typeof btoa === 'function') {
    var sourceMapping = toComment(cssMapping);
    var sourceURLs = cssMapping.sources.map(function (source) {
      return "/*# sourceURL=".concat(cssMapping.sourceRoot || '').concat(source, " */");
    });
    return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
  }

  return [content].join('\n');
} // Adapted from convert-source-map (MIT)


function toComment(sourceMap) {
  // eslint-disable-next-line no-undef
  var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
  var data = "sourceMappingURL=data:application/json;charset=utf-8;base64,".concat(base64);
  return "/*# ".concat(data, " */");
}

/***/ }),

/***/ 840:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;/*! Hammer.JS - v2.0.7 - 2016-04-22
 * http://hammerjs.github.io/
 *
 * Copyright (c) 2016 Jorik Tangelder;
 * Licensed under the MIT license */
(function(window, document, exportName, undefined) {
  'use strict';

var VENDOR_PREFIXES = ['', 'webkit', 'Moz', 'MS', 'ms', 'o'];
var TEST_ELEMENT = document.createElement('div');

var TYPE_FUNCTION = 'function';

var round = Math.round;
var abs = Math.abs;
var now = Date.now;

/**
 * set a timeout with a given scope
 * @param {Function} fn
 * @param {Number} timeout
 * @param {Object} context
 * @returns {number}
 */
function setTimeoutContext(fn, timeout, context) {
    return setTimeout(bindFn(fn, context), timeout);
}

/**
 * if the argument is an array, we want to execute the fn on each entry
 * if it aint an array we don't want to do a thing.
 * this is used by all the methods that accept a single and array argument.
 * @param {*|Array} arg
 * @param {String} fn
 * @param {Object} [context]
 * @returns {Boolean}
 */
function invokeArrayArg(arg, fn, context) {
    if (Array.isArray(arg)) {
        each(arg, context[fn], context);
        return true;
    }
    return false;
}

/**
 * walk objects and arrays
 * @param {Object} obj
 * @param {Function} iterator
 * @param {Object} context
 */
function each(obj, iterator, context) {
    var i;

    if (!obj) {
        return;
    }

    if (obj.forEach) {
        obj.forEach(iterator, context);
    } else if (obj.length !== undefined) {
        i = 0;
        while (i < obj.length) {
            iterator.call(context, obj[i], i, obj);
            i++;
        }
    } else {
        for (i in obj) {
            obj.hasOwnProperty(i) && iterator.call(context, obj[i], i, obj);
        }
    }
}

/**
 * wrap a method with a deprecation warning and stack trace
 * @param {Function} method
 * @param {String} name
 * @param {String} message
 * @returns {Function} A new function wrapping the supplied method.
 */
function deprecate(method, name, message) {
    var deprecationMessage = 'DEPRECATED METHOD: ' + name + '\n' + message + ' AT \n';
    return function() {
        var e = new Error('get-stack-trace');
        var stack = e && e.stack ? e.stack.replace(/^[^\(]+?[\n$]/gm, '')
            .replace(/^\s+at\s+/gm, '')
            .replace(/^Object.<anonymous>\s*\(/gm, '{anonymous}()@') : 'Unknown Stack Trace';

        var log = window.console && (window.console.warn || window.console.log);
        if (log) {
            log.call(window.console, deprecationMessage, stack);
        }
        return method.apply(this, arguments);
    };
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} target
 * @param {...Object} objects_to_assign
 * @returns {Object} target
 */
var assign;
if (typeof Object.assign !== 'function') {
    assign = function assign(target) {
        if (target === undefined || target === null) {
            throw new TypeError('Cannot convert undefined or null to object');
        }

        var output = Object(target);
        for (var index = 1; index < arguments.length; index++) {
            var source = arguments[index];
            if (source !== undefined && source !== null) {
                for (var nextKey in source) {
                    if (source.hasOwnProperty(nextKey)) {
                        output[nextKey] = source[nextKey];
                    }
                }
            }
        }
        return output;
    };
} else {
    assign = Object.assign;
}

/**
 * extend object.
 * means that properties in dest will be overwritten by the ones in src.
 * @param {Object} dest
 * @param {Object} src
 * @param {Boolean} [merge=false]
 * @returns {Object} dest
 */
var extend = deprecate(function extend(dest, src, merge) {
    var keys = Object.keys(src);
    var i = 0;
    while (i < keys.length) {
        if (!merge || (merge && dest[keys[i]] === undefined)) {
            dest[keys[i]] = src[keys[i]];
        }
        i++;
    }
    return dest;
}, 'extend', 'Use `assign`.');

/**
 * merge the values from src in the dest.
 * means that properties that exist in dest will not be overwritten by src
 * @param {Object} dest
 * @param {Object} src
 * @returns {Object} dest
 */
var merge = deprecate(function merge(dest, src) {
    return extend(dest, src, true);
}, 'merge', 'Use `assign`.');

/**
 * simple class inheritance
 * @param {Function} child
 * @param {Function} base
 * @param {Object} [properties]
 */
function inherit(child, base, properties) {
    var baseP = base.prototype,
        childP;

    childP = child.prototype = Object.create(baseP);
    childP.constructor = child;
    childP._super = baseP;

    if (properties) {
        assign(childP, properties);
    }
}

/**
 * simple function bind
 * @param {Function} fn
 * @param {Object} context
 * @returns {Function}
 */
function bindFn(fn, context) {
    return function boundFn() {
        return fn.apply(context, arguments);
    };
}

/**
 * let a boolean value also be a function that must return a boolean
 * this first item in args will be used as the context
 * @param {Boolean|Function} val
 * @param {Array} [args]
 * @returns {Boolean}
 */
function boolOrFn(val, args) {
    if (typeof val == TYPE_FUNCTION) {
        return val.apply(args ? args[0] || undefined : undefined, args);
    }
    return val;
}

/**
 * use the val2 when val1 is undefined
 * @param {*} val1
 * @param {*} val2
 * @returns {*}
 */
function ifUndefined(val1, val2) {
    return (val1 === undefined) ? val2 : val1;
}

/**
 * addEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function addEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.addEventListener(type, handler, false);
    });
}

/**
 * removeEventListener with multiple events at once
 * @param {EventTarget} target
 * @param {String} types
 * @param {Function} handler
 */
function removeEventListeners(target, types, handler) {
    each(splitStr(types), function(type) {
        target.removeEventListener(type, handler, false);
    });
}

/**
 * find if a node is in the given parent
 * @method hasParent
 * @param {HTMLElement} node
 * @param {HTMLElement} parent
 * @return {Boolean} found
 */
function hasParent(node, parent) {
    while (node) {
        if (node == parent) {
            return true;
        }
        node = node.parentNode;
    }
    return false;
}

/**
 * small indexOf wrapper
 * @param {String} str
 * @param {String} find
 * @returns {Boolean} found
 */
function inStr(str, find) {
    return str.indexOf(find) > -1;
}

/**
 * split string on whitespace
 * @param {String} str
 * @returns {Array} words
 */
function splitStr(str) {
    return str.trim().split(/\s+/g);
}

/**
 * find if a array contains the object using indexOf or a simple polyFill
 * @param {Array} src
 * @param {String} find
 * @param {String} [findByKey]
 * @return {Boolean|Number} false when not found, or the index
 */
function inArray(src, find, findByKey) {
    if (src.indexOf && !findByKey) {
        return src.indexOf(find);
    } else {
        var i = 0;
        while (i < src.length) {
            if ((findByKey && src[i][findByKey] == find) || (!findByKey && src[i] === find)) {
                return i;
            }
            i++;
        }
        return -1;
    }
}

/**
 * convert array-like objects to real arrays
 * @param {Object} obj
 * @returns {Array}
 */
function toArray(obj) {
    return Array.prototype.slice.call(obj, 0);
}

/**
 * unique array with objects based on a key (like 'id') or just by the array's value
 * @param {Array} src [{id:1},{id:2},{id:1}]
 * @param {String} [key]
 * @param {Boolean} [sort=False]
 * @returns {Array} [{id:1},{id:2}]
 */
function uniqueArray(src, key, sort) {
    var results = [];
    var values = [];
    var i = 0;

    while (i < src.length) {
        var val = key ? src[i][key] : src[i];
        if (inArray(values, val) < 0) {
            results.push(src[i]);
        }
        values[i] = val;
        i++;
    }

    if (sort) {
        if (!key) {
            results = results.sort();
        } else {
            results = results.sort(function sortUniqueArray(a, b) {
                return a[key] > b[key];
            });
        }
    }

    return results;
}

/**
 * get the prefixed property
 * @param {Object} obj
 * @param {String} property
 * @returns {String|Undefined} prefixed
 */
function prefixed(obj, property) {
    var prefix, prop;
    var camelProp = property[0].toUpperCase() + property.slice(1);

    var i = 0;
    while (i < VENDOR_PREFIXES.length) {
        prefix = VENDOR_PREFIXES[i];
        prop = (prefix) ? prefix + camelProp : property;

        if (prop in obj) {
            return prop;
        }
        i++;
    }
    return undefined;
}

/**
 * get a unique id
 * @returns {number} uniqueId
 */
var _uniqueId = 1;
function uniqueId() {
    return _uniqueId++;
}

/**
 * get the window object of an element
 * @param {HTMLElement} element
 * @returns {DocumentView|Window}
 */
function getWindowForElement(element) {
    var doc = element.ownerDocument || element;
    return (doc.defaultView || doc.parentWindow || window);
}

var MOBILE_REGEX = /mobile|tablet|ip(ad|hone|od)|android/i;

var SUPPORT_TOUCH = ('ontouchstart' in window);
var SUPPORT_POINTER_EVENTS = prefixed(window, 'PointerEvent') !== undefined;
var SUPPORT_ONLY_TOUCH = SUPPORT_TOUCH && MOBILE_REGEX.test(navigator.userAgent);

var INPUT_TYPE_TOUCH = 'touch';
var INPUT_TYPE_PEN = 'pen';
var INPUT_TYPE_MOUSE = 'mouse';
var INPUT_TYPE_KINECT = 'kinect';

var COMPUTE_INTERVAL = 25;

var INPUT_START = 1;
var INPUT_MOVE = 2;
var INPUT_END = 4;
var INPUT_CANCEL = 8;

var DIRECTION_NONE = 1;
var DIRECTION_LEFT = 2;
var DIRECTION_RIGHT = 4;
var DIRECTION_UP = 8;
var DIRECTION_DOWN = 16;

var DIRECTION_HORIZONTAL = DIRECTION_LEFT | DIRECTION_RIGHT;
var DIRECTION_VERTICAL = DIRECTION_UP | DIRECTION_DOWN;
var DIRECTION_ALL = DIRECTION_HORIZONTAL | DIRECTION_VERTICAL;

var PROPS_XY = ['x', 'y'];
var PROPS_CLIENT_XY = ['clientX', 'clientY'];

/**
 * create new input type manager
 * @param {Manager} manager
 * @param {Function} callback
 * @returns {Input}
 * @constructor
 */
function Input(manager, callback) {
    var self = this;
    this.manager = manager;
    this.callback = callback;
    this.element = manager.element;
    this.target = manager.options.inputTarget;

    // smaller wrapper around the handler, for the scope and the enabled state of the manager,
    // so when disabled the input events are completely bypassed.
    this.domHandler = function(ev) {
        if (boolOrFn(manager.options.enable, [manager])) {
            self.handler(ev);
        }
    };

    this.init();

}

Input.prototype = {
    /**
     * should handle the inputEvent data and trigger the callback
     * @virtual
     */
    handler: function() { },

    /**
     * bind the events
     */
    init: function() {
        this.evEl && addEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && addEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && addEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    },

    /**
     * unbind the events
     */
    destroy: function() {
        this.evEl && removeEventListeners(this.element, this.evEl, this.domHandler);
        this.evTarget && removeEventListeners(this.target, this.evTarget, this.domHandler);
        this.evWin && removeEventListeners(getWindowForElement(this.element), this.evWin, this.domHandler);
    }
};

/**
 * create new input type manager
 * called by the Manager constructor
 * @param {Hammer} manager
 * @returns {Input}
 */
function createInputInstance(manager) {
    var Type;
    var inputClass = manager.options.inputClass;

    if (inputClass) {
        Type = inputClass;
    } else if (SUPPORT_POINTER_EVENTS) {
        Type = PointerEventInput;
    } else if (SUPPORT_ONLY_TOUCH) {
        Type = TouchInput;
    } else if (!SUPPORT_TOUCH) {
        Type = MouseInput;
    } else {
        Type = TouchMouseInput;
    }
    return new (Type)(manager, inputHandler);
}

/**
 * handle input events
 * @param {Manager} manager
 * @param {String} eventType
 * @param {Object} input
 */
function inputHandler(manager, eventType, input) {
    var pointersLen = input.pointers.length;
    var changedPointersLen = input.changedPointers.length;
    var isFirst = (eventType & INPUT_START && (pointersLen - changedPointersLen === 0));
    var isFinal = (eventType & (INPUT_END | INPUT_CANCEL) && (pointersLen - changedPointersLen === 0));

    input.isFirst = !!isFirst;
    input.isFinal = !!isFinal;

    if (isFirst) {
        manager.session = {};
    }

    // source event is the normalized value of the domEvents
    // like 'touchstart, mouseup, pointerdown'
    input.eventType = eventType;

    // compute scale, rotation etc
    computeInputData(manager, input);

    // emit secret event
    manager.emit('hammer.input', input);

    manager.recognize(input);
    manager.session.prevInput = input;
}

/**
 * extend the data with some usable properties like scale, rotate, velocity etc
 * @param {Object} manager
 * @param {Object} input
 */
function computeInputData(manager, input) {
    var session = manager.session;
    var pointers = input.pointers;
    var pointersLength = pointers.length;

    // store the first input to calculate the distance and direction
    if (!session.firstInput) {
        session.firstInput = simpleCloneInputData(input);
    }

    // to compute scale and rotation we need to store the multiple touches
    if (pointersLength > 1 && !session.firstMultiple) {
        session.firstMultiple = simpleCloneInputData(input);
    } else if (pointersLength === 1) {
        session.firstMultiple = false;
    }

    var firstInput = session.firstInput;
    var firstMultiple = session.firstMultiple;
    var offsetCenter = firstMultiple ? firstMultiple.center : firstInput.center;

    var center = input.center = getCenter(pointers);
    input.timeStamp = now();
    input.deltaTime = input.timeStamp - firstInput.timeStamp;

    input.angle = getAngle(offsetCenter, center);
    input.distance = getDistance(offsetCenter, center);

    computeDeltaXY(session, input);
    input.offsetDirection = getDirection(input.deltaX, input.deltaY);

    var overallVelocity = getVelocity(input.deltaTime, input.deltaX, input.deltaY);
    input.overallVelocityX = overallVelocity.x;
    input.overallVelocityY = overallVelocity.y;
    input.overallVelocity = (abs(overallVelocity.x) > abs(overallVelocity.y)) ? overallVelocity.x : overallVelocity.y;

    input.scale = firstMultiple ? getScale(firstMultiple.pointers, pointers) : 1;
    input.rotation = firstMultiple ? getRotation(firstMultiple.pointers, pointers) : 0;

    input.maxPointers = !session.prevInput ? input.pointers.length : ((input.pointers.length >
        session.prevInput.maxPointers) ? input.pointers.length : session.prevInput.maxPointers);

    computeIntervalInputData(session, input);

    // find the correct target
    var target = manager.element;
    if (hasParent(input.srcEvent.target, target)) {
        target = input.srcEvent.target;
    }
    input.target = target;
}

function computeDeltaXY(session, input) {
    var center = input.center;
    var offset = session.offsetDelta || {};
    var prevDelta = session.prevDelta || {};
    var prevInput = session.prevInput || {};

    if (input.eventType === INPUT_START || prevInput.eventType === INPUT_END) {
        prevDelta = session.prevDelta = {
            x: prevInput.deltaX || 0,
            y: prevInput.deltaY || 0
        };

        offset = session.offsetDelta = {
            x: center.x,
            y: center.y
        };
    }

    input.deltaX = prevDelta.x + (center.x - offset.x);
    input.deltaY = prevDelta.y + (center.y - offset.y);
}

/**
 * velocity is calculated every x ms
 * @param {Object} session
 * @param {Object} input
 */
function computeIntervalInputData(session, input) {
    var last = session.lastInterval || input,
        deltaTime = input.timeStamp - last.timeStamp,
        velocity, velocityX, velocityY, direction;

    if (input.eventType != INPUT_CANCEL && (deltaTime > COMPUTE_INTERVAL || last.velocity === undefined)) {
        var deltaX = input.deltaX - last.deltaX;
        var deltaY = input.deltaY - last.deltaY;

        var v = getVelocity(deltaTime, deltaX, deltaY);
        velocityX = v.x;
        velocityY = v.y;
        velocity = (abs(v.x) > abs(v.y)) ? v.x : v.y;
        direction = getDirection(deltaX, deltaY);

        session.lastInterval = input;
    } else {
        // use latest velocity info if it doesn't overtake a minimum period
        velocity = last.velocity;
        velocityX = last.velocityX;
        velocityY = last.velocityY;
        direction = last.direction;
    }

    input.velocity = velocity;
    input.velocityX = velocityX;
    input.velocityY = velocityY;
    input.direction = direction;
}

/**
 * create a simple clone from the input used for storage of firstInput and firstMultiple
 * @param {Object} input
 * @returns {Object} clonedInputData
 */
function simpleCloneInputData(input) {
    // make a simple copy of the pointers because we will get a reference if we don't
    // we only need clientXY for the calculations
    var pointers = [];
    var i = 0;
    while (i < input.pointers.length) {
        pointers[i] = {
            clientX: round(input.pointers[i].clientX),
            clientY: round(input.pointers[i].clientY)
        };
        i++;
    }

    return {
        timeStamp: now(),
        pointers: pointers,
        center: getCenter(pointers),
        deltaX: input.deltaX,
        deltaY: input.deltaY
    };
}

/**
 * get the center of all the pointers
 * @param {Array} pointers
 * @return {Object} center contains `x` and `y` properties
 */
function getCenter(pointers) {
    var pointersLength = pointers.length;

    // no need to loop when only one touch
    if (pointersLength === 1) {
        return {
            x: round(pointers[0].clientX),
            y: round(pointers[0].clientY)
        };
    }

    var x = 0, y = 0, i = 0;
    while (i < pointersLength) {
        x += pointers[i].clientX;
        y += pointers[i].clientY;
        i++;
    }

    return {
        x: round(x / pointersLength),
        y: round(y / pointersLength)
    };
}

/**
 * calculate the velocity between two points. unit is in px per ms.
 * @param {Number} deltaTime
 * @param {Number} x
 * @param {Number} y
 * @return {Object} velocity `x` and `y`
 */
function getVelocity(deltaTime, x, y) {
    return {
        x: x / deltaTime || 0,
        y: y / deltaTime || 0
    };
}

/**
 * get the direction between two points
 * @param {Number} x
 * @param {Number} y
 * @return {Number} direction
 */
function getDirection(x, y) {
    if (x === y) {
        return DIRECTION_NONE;
    }

    if (abs(x) >= abs(y)) {
        return x < 0 ? DIRECTION_LEFT : DIRECTION_RIGHT;
    }
    return y < 0 ? DIRECTION_UP : DIRECTION_DOWN;
}

/**
 * calculate the absolute distance between two points
 * @param {Object} p1 {x, y}
 * @param {Object} p2 {x, y}
 * @param {Array} [props] containing x and y keys
 * @return {Number} distance
 */
function getDistance(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];

    return Math.sqrt((x * x) + (y * y));
}

/**
 * calculate the angle between two coordinates
 * @param {Object} p1
 * @param {Object} p2
 * @param {Array} [props] containing x and y keys
 * @return {Number} angle
 */
function getAngle(p1, p2, props) {
    if (!props) {
        props = PROPS_XY;
    }
    var x = p2[props[0]] - p1[props[0]],
        y = p2[props[1]] - p1[props[1]];
    return Math.atan2(y, x) * 180 / Math.PI;
}

/**
 * calculate the rotation degrees between two pointersets
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} rotation
 */
function getRotation(start, end) {
    return getAngle(end[1], end[0], PROPS_CLIENT_XY) + getAngle(start[1], start[0], PROPS_CLIENT_XY);
}

/**
 * calculate the scale factor between two pointersets
 * no scale is 1, and goes down to 0 when pinched together, and bigger when pinched out
 * @param {Array} start array of pointers
 * @param {Array} end array of pointers
 * @return {Number} scale
 */
function getScale(start, end) {
    return getDistance(end[0], end[1], PROPS_CLIENT_XY) / getDistance(start[0], start[1], PROPS_CLIENT_XY);
}

var MOUSE_INPUT_MAP = {
    mousedown: INPUT_START,
    mousemove: INPUT_MOVE,
    mouseup: INPUT_END
};

var MOUSE_ELEMENT_EVENTS = 'mousedown';
var MOUSE_WINDOW_EVENTS = 'mousemove mouseup';

/**
 * Mouse events input
 * @constructor
 * @extends Input
 */
function MouseInput() {
    this.evEl = MOUSE_ELEMENT_EVENTS;
    this.evWin = MOUSE_WINDOW_EVENTS;

    this.pressed = false; // mousedown state

    Input.apply(this, arguments);
}

inherit(MouseInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function MEhandler(ev) {
        var eventType = MOUSE_INPUT_MAP[ev.type];

        // on start we want to have the left mouse button down
        if (eventType & INPUT_START && ev.button === 0) {
            this.pressed = true;
        }

        if (eventType & INPUT_MOVE && ev.which !== 1) {
            eventType = INPUT_END;
        }

        // mouse must be down
        if (!this.pressed) {
            return;
        }

        if (eventType & INPUT_END) {
            this.pressed = false;
        }

        this.callback(this.manager, eventType, {
            pointers: [ev],
            changedPointers: [ev],
            pointerType: INPUT_TYPE_MOUSE,
            srcEvent: ev
        });
    }
});

var POINTER_INPUT_MAP = {
    pointerdown: INPUT_START,
    pointermove: INPUT_MOVE,
    pointerup: INPUT_END,
    pointercancel: INPUT_CANCEL,
    pointerout: INPUT_CANCEL
};

// in IE10 the pointer types is defined as an enum
var IE10_POINTER_TYPE_ENUM = {
    2: INPUT_TYPE_TOUCH,
    3: INPUT_TYPE_PEN,
    4: INPUT_TYPE_MOUSE,
    5: INPUT_TYPE_KINECT // see https://twitter.com/jacobrossi/status/480596438489890816
};

var POINTER_ELEMENT_EVENTS = 'pointerdown';
var POINTER_WINDOW_EVENTS = 'pointermove pointerup pointercancel';

// IE10 has prefixed support, and case-sensitive
if (window.MSPointerEvent && !window.PointerEvent) {
    POINTER_ELEMENT_EVENTS = 'MSPointerDown';
    POINTER_WINDOW_EVENTS = 'MSPointerMove MSPointerUp MSPointerCancel';
}

/**
 * Pointer events input
 * @constructor
 * @extends Input
 */
function PointerEventInput() {
    this.evEl = POINTER_ELEMENT_EVENTS;
    this.evWin = POINTER_WINDOW_EVENTS;

    Input.apply(this, arguments);

    this.store = (this.manager.session.pointerEvents = []);
}

inherit(PointerEventInput, Input, {
    /**
     * handle mouse events
     * @param {Object} ev
     */
    handler: function PEhandler(ev) {
        var store = this.store;
        var removePointer = false;

        var eventTypeNormalized = ev.type.toLowerCase().replace('ms', '');
        var eventType = POINTER_INPUT_MAP[eventTypeNormalized];
        var pointerType = IE10_POINTER_TYPE_ENUM[ev.pointerType] || ev.pointerType;

        var isTouch = (pointerType == INPUT_TYPE_TOUCH);

        // get index of the event in the store
        var storeIndex = inArray(store, ev.pointerId, 'pointerId');

        // start and mouse must be down
        if (eventType & INPUT_START && (ev.button === 0 || isTouch)) {
            if (storeIndex < 0) {
                store.push(ev);
                storeIndex = store.length - 1;
            }
        } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
            removePointer = true;
        }

        // it not found, so the pointer hasn't been down (so it's probably a hover)
        if (storeIndex < 0) {
            return;
        }

        // update the event in the store
        store[storeIndex] = ev;

        this.callback(this.manager, eventType, {
            pointers: store,
            changedPointers: [ev],
            pointerType: pointerType,
            srcEvent: ev
        });

        if (removePointer) {
            // remove from the store
            store.splice(storeIndex, 1);
        }
    }
});

var SINGLE_TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var SINGLE_TOUCH_TARGET_EVENTS = 'touchstart';
var SINGLE_TOUCH_WINDOW_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Touch events input
 * @constructor
 * @extends Input
 */
function SingleTouchInput() {
    this.evTarget = SINGLE_TOUCH_TARGET_EVENTS;
    this.evWin = SINGLE_TOUCH_WINDOW_EVENTS;
    this.started = false;

    Input.apply(this, arguments);
}

inherit(SingleTouchInput, Input, {
    handler: function TEhandler(ev) {
        var type = SINGLE_TOUCH_INPUT_MAP[ev.type];

        // should we handle the touch events?
        if (type === INPUT_START) {
            this.started = true;
        }

        if (!this.started) {
            return;
        }

        var touches = normalizeSingleTouches.call(this, ev, type);

        // when done, reset the started state
        if (type & (INPUT_END | INPUT_CANCEL) && touches[0].length - touches[1].length === 0) {
            this.started = false;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function normalizeSingleTouches(ev, type) {
    var all = toArray(ev.touches);
    var changed = toArray(ev.changedTouches);

    if (type & (INPUT_END | INPUT_CANCEL)) {
        all = uniqueArray(all.concat(changed), 'identifier', true);
    }

    return [all, changed];
}

var TOUCH_INPUT_MAP = {
    touchstart: INPUT_START,
    touchmove: INPUT_MOVE,
    touchend: INPUT_END,
    touchcancel: INPUT_CANCEL
};

var TOUCH_TARGET_EVENTS = 'touchstart touchmove touchend touchcancel';

/**
 * Multi-user touch events input
 * @constructor
 * @extends Input
 */
function TouchInput() {
    this.evTarget = TOUCH_TARGET_EVENTS;
    this.targetIds = {};

    Input.apply(this, arguments);
}

inherit(TouchInput, Input, {
    handler: function MTEhandler(ev) {
        var type = TOUCH_INPUT_MAP[ev.type];
        var touches = getTouches.call(this, ev, type);
        if (!touches) {
            return;
        }

        this.callback(this.manager, type, {
            pointers: touches[0],
            changedPointers: touches[1],
            pointerType: INPUT_TYPE_TOUCH,
            srcEvent: ev
        });
    }
});

/**
 * @this {TouchInput}
 * @param {Object} ev
 * @param {Number} type flag
 * @returns {undefined|Array} [all, changed]
 */
function getTouches(ev, type) {
    var allTouches = toArray(ev.touches);
    var targetIds = this.targetIds;

    // when there is only one touch, the process can be simplified
    if (type & (INPUT_START | INPUT_MOVE) && allTouches.length === 1) {
        targetIds[allTouches[0].identifier] = true;
        return [allTouches, allTouches];
    }

    var i,
        targetTouches,
        changedTouches = toArray(ev.changedTouches),
        changedTargetTouches = [],
        target = this.target;

    // get target touches from touches
    targetTouches = allTouches.filter(function(touch) {
        return hasParent(touch.target, target);
    });

    // collect touches
    if (type === INPUT_START) {
        i = 0;
        while (i < targetTouches.length) {
            targetIds[targetTouches[i].identifier] = true;
            i++;
        }
    }

    // filter changed touches to only contain touches that exist in the collected target ids
    i = 0;
    while (i < changedTouches.length) {
        if (targetIds[changedTouches[i].identifier]) {
            changedTargetTouches.push(changedTouches[i]);
        }

        // cleanup removed touches
        if (type & (INPUT_END | INPUT_CANCEL)) {
            delete targetIds[changedTouches[i].identifier];
        }
        i++;
    }

    if (!changedTargetTouches.length) {
        return;
    }

    return [
        // merge targetTouches with changedTargetTouches so it contains ALL touches, including 'end' and 'cancel'
        uniqueArray(targetTouches.concat(changedTargetTouches), 'identifier', true),
        changedTargetTouches
    ];
}

/**
 * Combined touch and mouse input
 *
 * Touch has a higher priority then mouse, and while touching no mouse events are allowed.
 * This because touch devices also emit mouse events while doing a touch.
 *
 * @constructor
 * @extends Input
 */

var DEDUP_TIMEOUT = 2500;
var DEDUP_DISTANCE = 25;

function TouchMouseInput() {
    Input.apply(this, arguments);

    var handler = bindFn(this.handler, this);
    this.touch = new TouchInput(this.manager, handler);
    this.mouse = new MouseInput(this.manager, handler);

    this.primaryTouch = null;
    this.lastTouches = [];
}

inherit(TouchMouseInput, Input, {
    /**
     * handle mouse and touch events
     * @param {Hammer} manager
     * @param {String} inputEvent
     * @param {Object} inputData
     */
    handler: function TMEhandler(manager, inputEvent, inputData) {
        var isTouch = (inputData.pointerType == INPUT_TYPE_TOUCH),
            isMouse = (inputData.pointerType == INPUT_TYPE_MOUSE);

        if (isMouse && inputData.sourceCapabilities && inputData.sourceCapabilities.firesTouchEvents) {
            return;
        }

        // when we're in a touch event, record touches to  de-dupe synthetic mouse event
        if (isTouch) {
            recordTouches.call(this, inputEvent, inputData);
        } else if (isMouse && isSyntheticEvent.call(this, inputData)) {
            return;
        }

        this.callback(manager, inputEvent, inputData);
    },

    /**
     * remove the event listeners
     */
    destroy: function destroy() {
        this.touch.destroy();
        this.mouse.destroy();
    }
});

function recordTouches(eventType, eventData) {
    if (eventType & INPUT_START) {
        this.primaryTouch = eventData.changedPointers[0].identifier;
        setLastTouch.call(this, eventData);
    } else if (eventType & (INPUT_END | INPUT_CANCEL)) {
        setLastTouch.call(this, eventData);
    }
}

function setLastTouch(eventData) {
    var touch = eventData.changedPointers[0];

    if (touch.identifier === this.primaryTouch) {
        var lastTouch = {x: touch.clientX, y: touch.clientY};
        this.lastTouches.push(lastTouch);
        var lts = this.lastTouches;
        var removeLastTouch = function() {
            var i = lts.indexOf(lastTouch);
            if (i > -1) {
                lts.splice(i, 1);
            }
        };
        setTimeout(removeLastTouch, DEDUP_TIMEOUT);
    }
}

function isSyntheticEvent(eventData) {
    var x = eventData.srcEvent.clientX, y = eventData.srcEvent.clientY;
    for (var i = 0; i < this.lastTouches.length; i++) {
        var t = this.lastTouches[i];
        var dx = Math.abs(x - t.x), dy = Math.abs(y - t.y);
        if (dx <= DEDUP_DISTANCE && dy <= DEDUP_DISTANCE) {
            return true;
        }
    }
    return false;
}

var PREFIXED_TOUCH_ACTION = prefixed(TEST_ELEMENT.style, 'touchAction');
var NATIVE_TOUCH_ACTION = PREFIXED_TOUCH_ACTION !== undefined;

// magical touchAction value
var TOUCH_ACTION_COMPUTE = 'compute';
var TOUCH_ACTION_AUTO = 'auto';
var TOUCH_ACTION_MANIPULATION = 'manipulation'; // not implemented
var TOUCH_ACTION_NONE = 'none';
var TOUCH_ACTION_PAN_X = 'pan-x';
var TOUCH_ACTION_PAN_Y = 'pan-y';
var TOUCH_ACTION_MAP = getTouchActionProps();

/**
 * Touch Action
 * sets the touchAction property or uses the js alternative
 * @param {Manager} manager
 * @param {String} value
 * @constructor
 */
function TouchAction(manager, value) {
    this.manager = manager;
    this.set(value);
}

TouchAction.prototype = {
    /**
     * set the touchAction value on the element or enable the polyfill
     * @param {String} value
     */
    set: function(value) {
        // find out the touch-action by the event handlers
        if (value == TOUCH_ACTION_COMPUTE) {
            value = this.compute();
        }

        if (NATIVE_TOUCH_ACTION && this.manager.element.style && TOUCH_ACTION_MAP[value]) {
            this.manager.element.style[PREFIXED_TOUCH_ACTION] = value;
        }
        this.actions = value.toLowerCase().trim();
    },

    /**
     * just re-set the touchAction value
     */
    update: function() {
        this.set(this.manager.options.touchAction);
    },

    /**
     * compute the value for the touchAction property based on the recognizer's settings
     * @returns {String} value
     */
    compute: function() {
        var actions = [];
        each(this.manager.recognizers, function(recognizer) {
            if (boolOrFn(recognizer.options.enable, [recognizer])) {
                actions = actions.concat(recognizer.getTouchAction());
            }
        });
        return cleanTouchActions(actions.join(' '));
    },

    /**
     * this method is called on each input cycle and provides the preventing of the browser behavior
     * @param {Object} input
     */
    preventDefaults: function(input) {
        var srcEvent = input.srcEvent;
        var direction = input.offsetDirection;

        // if the touch action did prevented once this session
        if (this.manager.session.prevented) {
            srcEvent.preventDefault();
            return;
        }

        var actions = this.actions;
        var hasNone = inStr(actions, TOUCH_ACTION_NONE) && !TOUCH_ACTION_MAP[TOUCH_ACTION_NONE];
        var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_Y];
        var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X) && !TOUCH_ACTION_MAP[TOUCH_ACTION_PAN_X];

        if (hasNone) {
            //do not prevent defaults if this is a tap gesture

            var isTapPointer = input.pointers.length === 1;
            var isTapMovement = input.distance < 2;
            var isTapTouchTime = input.deltaTime < 250;

            if (isTapPointer && isTapMovement && isTapTouchTime) {
                return;
            }
        }

        if (hasPanX && hasPanY) {
            // `pan-x pan-y` means browser handles all scrolling/panning, do not prevent
            return;
        }

        if (hasNone ||
            (hasPanY && direction & DIRECTION_HORIZONTAL) ||
            (hasPanX && direction & DIRECTION_VERTICAL)) {
            return this.preventSrc(srcEvent);
        }
    },

    /**
     * call preventDefault to prevent the browser's default behavior (scrolling in most cases)
     * @param {Object} srcEvent
     */
    preventSrc: function(srcEvent) {
        this.manager.session.prevented = true;
        srcEvent.preventDefault();
    }
};

/**
 * when the touchActions are collected they are not a valid value, so we need to clean things up. *
 * @param {String} actions
 * @returns {*}
 */
function cleanTouchActions(actions) {
    // none
    if (inStr(actions, TOUCH_ACTION_NONE)) {
        return TOUCH_ACTION_NONE;
    }

    var hasPanX = inStr(actions, TOUCH_ACTION_PAN_X);
    var hasPanY = inStr(actions, TOUCH_ACTION_PAN_Y);

    // if both pan-x and pan-y are set (different recognizers
    // for different directions, e.g. horizontal pan but vertical swipe?)
    // we need none (as otherwise with pan-x pan-y combined none of these
    // recognizers will work, since the browser would handle all panning
    if (hasPanX && hasPanY) {
        return TOUCH_ACTION_NONE;
    }

    // pan-x OR pan-y
    if (hasPanX || hasPanY) {
        return hasPanX ? TOUCH_ACTION_PAN_X : TOUCH_ACTION_PAN_Y;
    }

    // manipulation
    if (inStr(actions, TOUCH_ACTION_MANIPULATION)) {
        return TOUCH_ACTION_MANIPULATION;
    }

    return TOUCH_ACTION_AUTO;
}

function getTouchActionProps() {
    if (!NATIVE_TOUCH_ACTION) {
        return false;
    }
    var touchMap = {};
    var cssSupports = window.CSS && window.CSS.supports;
    ['auto', 'manipulation', 'pan-y', 'pan-x', 'pan-x pan-y', 'none'].forEach(function(val) {

        // If css.supports is not supported but there is native touch-action assume it supports
        // all values. This is the case for IE 10 and 11.
        touchMap[val] = cssSupports ? window.CSS.supports('touch-action', val) : true;
    });
    return touchMap;
}

/**
 * Recognizer flow explained; *
 * All recognizers have the initial state of POSSIBLE when a input session starts.
 * The definition of a input session is from the first input until the last input, with all it's movement in it. *
 * Example session for mouse-input: mousedown -> mousemove -> mouseup
 *
 * On each recognizing cycle (see Manager.recognize) the .recognize() method is executed
 * which determines with state it should be.
 *
 * If the recognizer has the state FAILED, CANCELLED or RECOGNIZED (equals ENDED), it is reset to
 * POSSIBLE to give it another change on the next cycle.
 *
 *               Possible
 *                  |
 *            +-----+---------------+
 *            |                     |
 *      +-----+-----+               |
 *      |           |               |
 *   Failed      Cancelled          |
 *                          +-------+------+
 *                          |              |
 *                      Recognized       Began
 *                                         |
 *                                      Changed
 *                                         |
 *                                  Ended/Recognized
 */
var STATE_POSSIBLE = 1;
var STATE_BEGAN = 2;
var STATE_CHANGED = 4;
var STATE_ENDED = 8;
var STATE_RECOGNIZED = STATE_ENDED;
var STATE_CANCELLED = 16;
var STATE_FAILED = 32;

/**
 * Recognizer
 * Every recognizer needs to extend from this class.
 * @constructor
 * @param {Object} options
 */
function Recognizer(options) {
    this.options = assign({}, this.defaults, options || {});

    this.id = uniqueId();

    this.manager = null;

    // default is enable true
    this.options.enable = ifUndefined(this.options.enable, true);

    this.state = STATE_POSSIBLE;

    this.simultaneous = {};
    this.requireFail = [];
}

Recognizer.prototype = {
    /**
     * @virtual
     * @type {Object}
     */
    defaults: {},

    /**
     * set options
     * @param {Object} options
     * @return {Recognizer}
     */
    set: function(options) {
        assign(this.options, options);

        // also update the touchAction, in case something changed about the directions/enabled state
        this.manager && this.manager.touchAction.update();
        return this;
    },

    /**
     * recognize simultaneous with an other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    recognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'recognizeWith', this)) {
            return this;
        }

        var simultaneous = this.simultaneous;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (!simultaneous[otherRecognizer.id]) {
            simultaneous[otherRecognizer.id] = otherRecognizer;
            otherRecognizer.recognizeWith(this);
        }
        return this;
    },

    /**
     * drop the simultaneous link. it doesnt remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRecognizeWith: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRecognizeWith', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        delete this.simultaneous[otherRecognizer.id];
        return this;
    },

    /**
     * recognizer can only run when an other is failing
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    requireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'requireFailure', this)) {
            return this;
        }

        var requireFail = this.requireFail;
        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        if (inArray(requireFail, otherRecognizer) === -1) {
            requireFail.push(otherRecognizer);
            otherRecognizer.requireFailure(this);
        }
        return this;
    },

    /**
     * drop the requireFailure link. it does not remove the link on the other recognizer.
     * @param {Recognizer} otherRecognizer
     * @returns {Recognizer} this
     */
    dropRequireFailure: function(otherRecognizer) {
        if (invokeArrayArg(otherRecognizer, 'dropRequireFailure', this)) {
            return this;
        }

        otherRecognizer = getRecognizerByNameIfManager(otherRecognizer, this);
        var index = inArray(this.requireFail, otherRecognizer);
        if (index > -1) {
            this.requireFail.splice(index, 1);
        }
        return this;
    },

    /**
     * has require failures boolean
     * @returns {boolean}
     */
    hasRequireFailures: function() {
        return this.requireFail.length > 0;
    },

    /**
     * if the recognizer can recognize simultaneous with an other recognizer
     * @param {Recognizer} otherRecognizer
     * @returns {Boolean}
     */
    canRecognizeWith: function(otherRecognizer) {
        return !!this.simultaneous[otherRecognizer.id];
    },

    /**
     * You should use `tryEmit` instead of `emit` directly to check
     * that all the needed recognizers has failed before emitting.
     * @param {Object} input
     */
    emit: function(input) {
        var self = this;
        var state = this.state;

        function emit(event) {
            self.manager.emit(event, input);
        }

        // 'panstart' and 'panmove'
        if (state < STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }

        emit(self.options.event); // simple 'eventName' events

        if (input.additionalEvent) { // additional event(panleft, panright, pinchin, pinchout...)
            emit(input.additionalEvent);
        }

        // panend and pancancel
        if (state >= STATE_ENDED) {
            emit(self.options.event + stateStr(state));
        }
    },

    /**
     * Check that all the require failure recognizers has failed,
     * if true, it emits a gesture event,
     * otherwise, setup the state to FAILED.
     * @param {Object} input
     */
    tryEmit: function(input) {
        if (this.canEmit()) {
            return this.emit(input);
        }
        // it's failing anyway
        this.state = STATE_FAILED;
    },

    /**
     * can we emit?
     * @returns {boolean}
     */
    canEmit: function() {
        var i = 0;
        while (i < this.requireFail.length) {
            if (!(this.requireFail[i].state & (STATE_FAILED | STATE_POSSIBLE))) {
                return false;
            }
            i++;
        }
        return true;
    },

    /**
     * update the recognizer
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        // make a new copy of the inputData
        // so we can change the inputData without messing up the other recognizers
        var inputDataClone = assign({}, inputData);

        // is is enabled and allow recognizing?
        if (!boolOrFn(this.options.enable, [this, inputDataClone])) {
            this.reset();
            this.state = STATE_FAILED;
            return;
        }

        // reset when we've reached the end
        if (this.state & (STATE_RECOGNIZED | STATE_CANCELLED | STATE_FAILED)) {
            this.state = STATE_POSSIBLE;
        }

        this.state = this.process(inputDataClone);

        // the recognizer has recognized a gesture
        // so trigger an event
        if (this.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED | STATE_CANCELLED)) {
            this.tryEmit(inputDataClone);
        }
    },

    /**
     * return the state of the recognizer
     * the actual recognizing happens in this method
     * @virtual
     * @param {Object} inputData
     * @returns {Const} STATE
     */
    process: function(inputData) { }, // jshint ignore:line

    /**
     * return the preferred touch-action
     * @virtual
     * @returns {Array}
     */
    getTouchAction: function() { },

    /**
     * called when the gesture isn't allowed to recognize
     * like when another is being recognized or it is disabled
     * @virtual
     */
    reset: function() { }
};

/**
 * get a usable string, used as event postfix
 * @param {Const} state
 * @returns {String} state
 */
function stateStr(state) {
    if (state & STATE_CANCELLED) {
        return 'cancel';
    } else if (state & STATE_ENDED) {
        return 'end';
    } else if (state & STATE_CHANGED) {
        return 'move';
    } else if (state & STATE_BEGAN) {
        return 'start';
    }
    return '';
}

/**
 * direction cons to string
 * @param {Const} direction
 * @returns {String}
 */
function directionStr(direction) {
    if (direction == DIRECTION_DOWN) {
        return 'down';
    } else if (direction == DIRECTION_UP) {
        return 'up';
    } else if (direction == DIRECTION_LEFT) {
        return 'left';
    } else if (direction == DIRECTION_RIGHT) {
        return 'right';
    }
    return '';
}

/**
 * get a recognizer by name if it is bound to a manager
 * @param {Recognizer|String} otherRecognizer
 * @param {Recognizer} recognizer
 * @returns {Recognizer}
 */
function getRecognizerByNameIfManager(otherRecognizer, recognizer) {
    var manager = recognizer.manager;
    if (manager) {
        return manager.get(otherRecognizer);
    }
    return otherRecognizer;
}

/**
 * This recognizer is just used as a base for the simple attribute recognizers.
 * @constructor
 * @extends Recognizer
 */
function AttrRecognizer() {
    Recognizer.apply(this, arguments);
}

inherit(AttrRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof AttrRecognizer
     */
    defaults: {
        /**
         * @type {Number}
         * @default 1
         */
        pointers: 1
    },

    /**
     * Used to check if it the recognizer receives valid input, like input.distance > 10.
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {Boolean} recognized
     */
    attrTest: function(input) {
        var optionPointers = this.options.pointers;
        return optionPointers === 0 || input.pointers.length === optionPointers;
    },

    /**
     * Process the input and return the state for the recognizer
     * @memberof AttrRecognizer
     * @param {Object} input
     * @returns {*} State
     */
    process: function(input) {
        var state = this.state;
        var eventType = input.eventType;

        var isRecognized = state & (STATE_BEGAN | STATE_CHANGED);
        var isValid = this.attrTest(input);

        // on cancel input and we've recognized before, return STATE_CANCELLED
        if (isRecognized && (eventType & INPUT_CANCEL || !isValid)) {
            return state | STATE_CANCELLED;
        } else if (isRecognized || isValid) {
            if (eventType & INPUT_END) {
                return state | STATE_ENDED;
            } else if (!(state & STATE_BEGAN)) {
                return STATE_BEGAN;
            }
            return state | STATE_CHANGED;
        }
        return STATE_FAILED;
    }
});

/**
 * Pan
 * Recognized when the pointer is down and moved in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function PanRecognizer() {
    AttrRecognizer.apply(this, arguments);

    this.pX = null;
    this.pY = null;
}

inherit(PanRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PanRecognizer
     */
    defaults: {
        event: 'pan',
        threshold: 10,
        pointers: 1,
        direction: DIRECTION_ALL
    },

    getTouchAction: function() {
        var direction = this.options.direction;
        var actions = [];
        if (direction & DIRECTION_HORIZONTAL) {
            actions.push(TOUCH_ACTION_PAN_Y);
        }
        if (direction & DIRECTION_VERTICAL) {
            actions.push(TOUCH_ACTION_PAN_X);
        }
        return actions;
    },

    directionTest: function(input) {
        var options = this.options;
        var hasMoved = true;
        var distance = input.distance;
        var direction = input.direction;
        var x = input.deltaX;
        var y = input.deltaY;

        // lock to axis?
        if (!(direction & options.direction)) {
            if (options.direction & DIRECTION_HORIZONTAL) {
                direction = (x === 0) ? DIRECTION_NONE : (x < 0) ? DIRECTION_LEFT : DIRECTION_RIGHT;
                hasMoved = x != this.pX;
                distance = Math.abs(input.deltaX);
            } else {
                direction = (y === 0) ? DIRECTION_NONE : (y < 0) ? DIRECTION_UP : DIRECTION_DOWN;
                hasMoved = y != this.pY;
                distance = Math.abs(input.deltaY);
            }
        }
        input.direction = direction;
        return hasMoved && distance > options.threshold && direction & options.direction;
    },

    attrTest: function(input) {
        return AttrRecognizer.prototype.attrTest.call(this, input) &&
            (this.state & STATE_BEGAN || (!(this.state & STATE_BEGAN) && this.directionTest(input)));
    },

    emit: function(input) {

        this.pX = input.deltaX;
        this.pY = input.deltaY;

        var direction = directionStr(input.direction);

        if (direction) {
            input.additionalEvent = this.options.event + direction;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Pinch
 * Recognized when two or more pointers are moving toward (zoom-in) or away from each other (zoom-out).
 * @constructor
 * @extends AttrRecognizer
 */
function PinchRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(PinchRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'pinch',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.scale - 1) > this.options.threshold || this.state & STATE_BEGAN);
    },

    emit: function(input) {
        if (input.scale !== 1) {
            var inOut = input.scale < 1 ? 'in' : 'out';
            input.additionalEvent = this.options.event + inOut;
        }
        this._super.emit.call(this, input);
    }
});

/**
 * Press
 * Recognized when the pointer is down for x ms without any movement.
 * @constructor
 * @extends Recognizer
 */
function PressRecognizer() {
    Recognizer.apply(this, arguments);

    this._timer = null;
    this._input = null;
}

inherit(PressRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PressRecognizer
     */
    defaults: {
        event: 'press',
        pointers: 1,
        time: 251, // minimal time of the pointer to be pressed
        threshold: 9 // a minimal movement is ok, but keep it low
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_AUTO];
    },

    process: function(input) {
        var options = this.options;
        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTime = input.deltaTime > options.time;

        this._input = input;

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (!validMovement || !validPointers || (input.eventType & (INPUT_END | INPUT_CANCEL) && !validTime)) {
            this.reset();
        } else if (input.eventType & INPUT_START) {
            this.reset();
            this._timer = setTimeoutContext(function() {
                this.state = STATE_RECOGNIZED;
                this.tryEmit();
            }, options.time, this);
        } else if (input.eventType & INPUT_END) {
            return STATE_RECOGNIZED;
        }
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function(input) {
        if (this.state !== STATE_RECOGNIZED) {
            return;
        }

        if (input && (input.eventType & INPUT_END)) {
            this.manager.emit(this.options.event + 'up', input);
        } else {
            this._input.timeStamp = now();
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Rotate
 * Recognized when two or more pointer are moving in a circular motion.
 * @constructor
 * @extends AttrRecognizer
 */
function RotateRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(RotateRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof RotateRecognizer
     */
    defaults: {
        event: 'rotate',
        threshold: 0,
        pointers: 2
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_NONE];
    },

    attrTest: function(input) {
        return this._super.attrTest.call(this, input) &&
            (Math.abs(input.rotation) > this.options.threshold || this.state & STATE_BEGAN);
    }
});

/**
 * Swipe
 * Recognized when the pointer is moving fast (velocity), with enough distance in the allowed direction.
 * @constructor
 * @extends AttrRecognizer
 */
function SwipeRecognizer() {
    AttrRecognizer.apply(this, arguments);
}

inherit(SwipeRecognizer, AttrRecognizer, {
    /**
     * @namespace
     * @memberof SwipeRecognizer
     */
    defaults: {
        event: 'swipe',
        threshold: 10,
        velocity: 0.3,
        direction: DIRECTION_HORIZONTAL | DIRECTION_VERTICAL,
        pointers: 1
    },

    getTouchAction: function() {
        return PanRecognizer.prototype.getTouchAction.call(this);
    },

    attrTest: function(input) {
        var direction = this.options.direction;
        var velocity;

        if (direction & (DIRECTION_HORIZONTAL | DIRECTION_VERTICAL)) {
            velocity = input.overallVelocity;
        } else if (direction & DIRECTION_HORIZONTAL) {
            velocity = input.overallVelocityX;
        } else if (direction & DIRECTION_VERTICAL) {
            velocity = input.overallVelocityY;
        }

        return this._super.attrTest.call(this, input) &&
            direction & input.offsetDirection &&
            input.distance > this.options.threshold &&
            input.maxPointers == this.options.pointers &&
            abs(velocity) > this.options.velocity && input.eventType & INPUT_END;
    },

    emit: function(input) {
        var direction = directionStr(input.offsetDirection);
        if (direction) {
            this.manager.emit(this.options.event + direction, input);
        }

        this.manager.emit(this.options.event, input);
    }
});

/**
 * A tap is ecognized when the pointer is doing a small tap/click. Multiple taps are recognized if they occur
 * between the given interval and position. The delay option can be used to recognize multi-taps without firing
 * a single tap.
 *
 * The eventData from the emitted event contains the property `tapCount`, which contains the amount of
 * multi-taps being recognized.
 * @constructor
 * @extends Recognizer
 */
function TapRecognizer() {
    Recognizer.apply(this, arguments);

    // previous time and center,
    // used for tap counting
    this.pTime = false;
    this.pCenter = false;

    this._timer = null;
    this._input = null;
    this.count = 0;
}

inherit(TapRecognizer, Recognizer, {
    /**
     * @namespace
     * @memberof PinchRecognizer
     */
    defaults: {
        event: 'tap',
        pointers: 1,
        taps: 1,
        interval: 300, // max time between the multi-tap taps
        time: 250, // max time of the pointer to be down (like finger on the screen)
        threshold: 9, // a minimal movement is ok, but keep it low
        posThreshold: 10 // a multi-tap can be a bit off the initial position
    },

    getTouchAction: function() {
        return [TOUCH_ACTION_MANIPULATION];
    },

    process: function(input) {
        var options = this.options;

        var validPointers = input.pointers.length === options.pointers;
        var validMovement = input.distance < options.threshold;
        var validTouchTime = input.deltaTime < options.time;

        this.reset();

        if ((input.eventType & INPUT_START) && (this.count === 0)) {
            return this.failTimeout();
        }

        // we only allow little movement
        // and we've reached an end event, so a tap is possible
        if (validMovement && validTouchTime && validPointers) {
            if (input.eventType != INPUT_END) {
                return this.failTimeout();
            }

            var validInterval = this.pTime ? (input.timeStamp - this.pTime < options.interval) : true;
            var validMultiTap = !this.pCenter || getDistance(this.pCenter, input.center) < options.posThreshold;

            this.pTime = input.timeStamp;
            this.pCenter = input.center;

            if (!validMultiTap || !validInterval) {
                this.count = 1;
            } else {
                this.count += 1;
            }

            this._input = input;

            // if tap count matches we have recognized it,
            // else it has began recognizing...
            var tapCount = this.count % options.taps;
            if (tapCount === 0) {
                // no failing requirements, immediately trigger the tap event
                // or wait as long as the multitap interval to trigger
                if (!this.hasRequireFailures()) {
                    return STATE_RECOGNIZED;
                } else {
                    this._timer = setTimeoutContext(function() {
                        this.state = STATE_RECOGNIZED;
                        this.tryEmit();
                    }, options.interval, this);
                    return STATE_BEGAN;
                }
            }
        }
        return STATE_FAILED;
    },

    failTimeout: function() {
        this._timer = setTimeoutContext(function() {
            this.state = STATE_FAILED;
        }, this.options.interval, this);
        return STATE_FAILED;
    },

    reset: function() {
        clearTimeout(this._timer);
    },

    emit: function() {
        if (this.state == STATE_RECOGNIZED) {
            this._input.tapCount = this.count;
            this.manager.emit(this.options.event, this._input);
        }
    }
});

/**
 * Simple way to create a manager with a default set of recognizers.
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Hammer(element, options) {
    options = options || {};
    options.recognizers = ifUndefined(options.recognizers, Hammer.defaults.preset);
    return new Manager(element, options);
}

/**
 * @const {string}
 */
Hammer.VERSION = '2.0.7';

/**
 * default settings
 * @namespace
 */
Hammer.defaults = {
    /**
     * set if DOM events are being triggered.
     * But this is slower and unused by simple implementations, so disabled by default.
     * @type {Boolean}
     * @default false
     */
    domEvents: false,

    /**
     * The value for the touchAction property/fallback.
     * When set to `compute` it will magically set the correct value based on the added recognizers.
     * @type {String}
     * @default compute
     */
    touchAction: TOUCH_ACTION_COMPUTE,

    /**
     * @type {Boolean}
     * @default true
     */
    enable: true,

    /**
     * EXPERIMENTAL FEATURE -- can be removed/changed
     * Change the parent input target element.
     * If Null, then it is being set the to main element.
     * @type {Null|EventTarget}
     * @default null
     */
    inputTarget: null,

    /**
     * force an input class
     * @type {Null|Function}
     * @default null
     */
    inputClass: null,

    /**
     * Default recognizer setup when calling `Hammer()`
     * When creating a new Manager these will be skipped.
     * @type {Array}
     */
    preset: [
        // RecognizerClass, options, [recognizeWith, ...], [requireFailure, ...]
        [RotateRecognizer, {enable: false}],
        [PinchRecognizer, {enable: false}, ['rotate']],
        [SwipeRecognizer, {direction: DIRECTION_HORIZONTAL}],
        [PanRecognizer, {direction: DIRECTION_HORIZONTAL}, ['swipe']],
        [TapRecognizer],
        [TapRecognizer, {event: 'doubletap', taps: 2}, ['tap']],
        [PressRecognizer]
    ],

    /**
     * Some CSS properties can be used to improve the working of Hammer.
     * Add them to this method and they will be set when creating a new Manager.
     * @namespace
     */
    cssProps: {
        /**
         * Disables text selection to improve the dragging gesture. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userSelect: 'none',

        /**
         * Disable the Windows Phone grippers when pressing an element.
         * @type {String}
         * @default 'none'
         */
        touchSelect: 'none',

        /**
         * Disables the default callout shown when you touch and hold a touch target.
         * On iOS, when you touch and hold a touch target such as a link, Safari displays
         * a callout containing information about the link. This property allows you to disable that callout.
         * @type {String}
         * @default 'none'
         */
        touchCallout: 'none',

        /**
         * Specifies whether zooming is enabled. Used by IE10>
         * @type {String}
         * @default 'none'
         */
        contentZooming: 'none',

        /**
         * Specifies that an entire element should be draggable instead of its contents. Mainly for desktop browsers.
         * @type {String}
         * @default 'none'
         */
        userDrag: 'none',

        /**
         * Overrides the highlight color shown when the user taps a link or a JavaScript
         * clickable element in iOS. This property obeys the alpha value, if specified.
         * @type {String}
         * @default 'rgba(0,0,0,0)'
         */
        tapHighlightColor: 'rgba(0,0,0,0)'
    }
};

var STOP = 1;
var FORCED_STOP = 2;

/**
 * Manager
 * @param {HTMLElement} element
 * @param {Object} [options]
 * @constructor
 */
function Manager(element, options) {
    this.options = assign({}, Hammer.defaults, options || {});

    this.options.inputTarget = this.options.inputTarget || element;

    this.handlers = {};
    this.session = {};
    this.recognizers = [];
    this.oldCssProps = {};

    this.element = element;
    this.input = createInputInstance(this);
    this.touchAction = new TouchAction(this, this.options.touchAction);

    toggleCssProps(this, true);

    each(this.options.recognizers, function(item) {
        var recognizer = this.add(new (item[0])(item[1]));
        item[2] && recognizer.recognizeWith(item[2]);
        item[3] && recognizer.requireFailure(item[3]);
    }, this);
}

Manager.prototype = {
    /**
     * set options
     * @param {Object} options
     * @returns {Manager}
     */
    set: function(options) {
        assign(this.options, options);

        // Options that need a little more setup
        if (options.touchAction) {
            this.touchAction.update();
        }
        if (options.inputTarget) {
            // Clean up existing event listeners and reinitialize
            this.input.destroy();
            this.input.target = options.inputTarget;
            this.input.init();
        }
        return this;
    },

    /**
     * stop recognizing for this session.
     * This session will be discarded, when a new [input]start event is fired.
     * When forced, the recognizer cycle is stopped immediately.
     * @param {Boolean} [force]
     */
    stop: function(force) {
        this.session.stopped = force ? FORCED_STOP : STOP;
    },

    /**
     * run the recognizers!
     * called by the inputHandler function on every movement of the pointers (touches)
     * it walks through all the recognizers and tries to detect the gesture that is being made
     * @param {Object} inputData
     */
    recognize: function(inputData) {
        var session = this.session;
        if (session.stopped) {
            return;
        }

        // run the touch-action polyfill
        this.touchAction.preventDefaults(inputData);

        var recognizer;
        var recognizers = this.recognizers;

        // this holds the recognizer that is being recognized.
        // so the recognizer's state needs to be BEGAN, CHANGED, ENDED or RECOGNIZED
        // if no recognizer is detecting a thing, it is set to `null`
        var curRecognizer = session.curRecognizer;

        // reset when the last recognizer is recognized
        // or when we're in a new session
        if (!curRecognizer || (curRecognizer && curRecognizer.state & STATE_RECOGNIZED)) {
            curRecognizer = session.curRecognizer = null;
        }

        var i = 0;
        while (i < recognizers.length) {
            recognizer = recognizers[i];

            // find out if we are allowed try to recognize the input for this one.
            // 1.   allow if the session is NOT forced stopped (see the .stop() method)
            // 2.   allow if we still haven't recognized a gesture in this session, or the this recognizer is the one
            //      that is being recognized.
            // 3.   allow if the recognizer is allowed to run simultaneous with the current recognized recognizer.
            //      this can be setup with the `recognizeWith()` method on the recognizer.
            if (session.stopped !== FORCED_STOP && ( // 1
                    !curRecognizer || recognizer == curRecognizer || // 2
                    recognizer.canRecognizeWith(curRecognizer))) { // 3
                recognizer.recognize(inputData);
            } else {
                recognizer.reset();
            }

            // if the recognizer has been recognizing the input as a valid gesture, we want to store this one as the
            // current active recognizer. but only if we don't already have an active recognizer
            if (!curRecognizer && recognizer.state & (STATE_BEGAN | STATE_CHANGED | STATE_ENDED)) {
                curRecognizer = session.curRecognizer = recognizer;
            }
            i++;
        }
    },

    /**
     * get a recognizer by its event name.
     * @param {Recognizer|String} recognizer
     * @returns {Recognizer|Null}
     */
    get: function(recognizer) {
        if (recognizer instanceof Recognizer) {
            return recognizer;
        }

        var recognizers = this.recognizers;
        for (var i = 0; i < recognizers.length; i++) {
            if (recognizers[i].options.event == recognizer) {
                return recognizers[i];
            }
        }
        return null;
    },

    /**
     * add a recognizer to the manager
     * existing recognizers with the same event name will be removed
     * @param {Recognizer} recognizer
     * @returns {Recognizer|Manager}
     */
    add: function(recognizer) {
        if (invokeArrayArg(recognizer, 'add', this)) {
            return this;
        }

        // remove existing
        var existing = this.get(recognizer.options.event);
        if (existing) {
            this.remove(existing);
        }

        this.recognizers.push(recognizer);
        recognizer.manager = this;

        this.touchAction.update();
        return recognizer;
    },

    /**
     * remove a recognizer by name or instance
     * @param {Recognizer|String} recognizer
     * @returns {Manager}
     */
    remove: function(recognizer) {
        if (invokeArrayArg(recognizer, 'remove', this)) {
            return this;
        }

        recognizer = this.get(recognizer);

        // let's make sure this recognizer exists
        if (recognizer) {
            var recognizers = this.recognizers;
            var index = inArray(recognizers, recognizer);

            if (index !== -1) {
                recognizers.splice(index, 1);
                this.touchAction.update();
            }
        }

        return this;
    },

    /**
     * bind event
     * @param {String} events
     * @param {Function} handler
     * @returns {EventEmitter} this
     */
    on: function(events, handler) {
        if (events === undefined) {
            return;
        }
        if (handler === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            handlers[event] = handlers[event] || [];
            handlers[event].push(handler);
        });
        return this;
    },

    /**
     * unbind event, leave emit blank to remove all handlers
     * @param {String} events
     * @param {Function} [handler]
     * @returns {EventEmitter} this
     */
    off: function(events, handler) {
        if (events === undefined) {
            return;
        }

        var handlers = this.handlers;
        each(splitStr(events), function(event) {
            if (!handler) {
                delete handlers[event];
            } else {
                handlers[event] && handlers[event].splice(inArray(handlers[event], handler), 1);
            }
        });
        return this;
    },

    /**
     * emit event to the listeners
     * @param {String} event
     * @param {Object} data
     */
    emit: function(event, data) {
        // we also want to trigger dom events
        if (this.options.domEvents) {
            triggerDomEvent(event, data);
        }

        // no handlers, so skip it all
        var handlers = this.handlers[event] && this.handlers[event].slice();
        if (!handlers || !handlers.length) {
            return;
        }

        data.type = event;
        data.preventDefault = function() {
            data.srcEvent.preventDefault();
        };

        var i = 0;
        while (i < handlers.length) {
            handlers[i](data);
            i++;
        }
    },

    /**
     * destroy the manager and unbinds all events
     * it doesn't unbind dom events, that is the user own responsibility
     */
    destroy: function() {
        this.element && toggleCssProps(this, false);

        this.handlers = {};
        this.session = {};
        this.input.destroy();
        this.element = null;
    }
};

/**
 * add/remove the css properties as defined in manager.options.cssProps
 * @param {Manager} manager
 * @param {Boolean} add
 */
function toggleCssProps(manager, add) {
    var element = manager.element;
    if (!element.style) {
        return;
    }
    var prop;
    each(manager.options.cssProps, function(value, name) {
        prop = prefixed(element.style, name);
        if (add) {
            manager.oldCssProps[prop] = element.style[prop];
            element.style[prop] = value;
        } else {
            element.style[prop] = manager.oldCssProps[prop] || '';
        }
    });
    if (!add) {
        manager.oldCssProps = {};
    }
}

/**
 * trigger dom event
 * @param {String} event
 * @param {Object} data
 */
function triggerDomEvent(event, data) {
    var gestureEvent = document.createEvent('Event');
    gestureEvent.initEvent(event, true, true);
    gestureEvent.gesture = data;
    data.target.dispatchEvent(gestureEvent);
}

assign(Hammer, {
    INPUT_START: INPUT_START,
    INPUT_MOVE: INPUT_MOVE,
    INPUT_END: INPUT_END,
    INPUT_CANCEL: INPUT_CANCEL,

    STATE_POSSIBLE: STATE_POSSIBLE,
    STATE_BEGAN: STATE_BEGAN,
    STATE_CHANGED: STATE_CHANGED,
    STATE_ENDED: STATE_ENDED,
    STATE_RECOGNIZED: STATE_RECOGNIZED,
    STATE_CANCELLED: STATE_CANCELLED,
    STATE_FAILED: STATE_FAILED,

    DIRECTION_NONE: DIRECTION_NONE,
    DIRECTION_LEFT: DIRECTION_LEFT,
    DIRECTION_RIGHT: DIRECTION_RIGHT,
    DIRECTION_UP: DIRECTION_UP,
    DIRECTION_DOWN: DIRECTION_DOWN,
    DIRECTION_HORIZONTAL: DIRECTION_HORIZONTAL,
    DIRECTION_VERTICAL: DIRECTION_VERTICAL,
    DIRECTION_ALL: DIRECTION_ALL,

    Manager: Manager,
    Input: Input,
    TouchAction: TouchAction,

    TouchInput: TouchInput,
    MouseInput: MouseInput,
    PointerEventInput: PointerEventInput,
    TouchMouseInput: TouchMouseInput,
    SingleTouchInput: SingleTouchInput,

    Recognizer: Recognizer,
    AttrRecognizer: AttrRecognizer,
    Tap: TapRecognizer,
    Pan: PanRecognizer,
    Swipe: SwipeRecognizer,
    Pinch: PinchRecognizer,
    Rotate: RotateRecognizer,
    Press: PressRecognizer,

    on: addEventListeners,
    off: removeEventListeners,
    each: each,
    merge: merge,
    extend: extend,
    assign: assign,
    inherit: inherit,
    bindFn: bindFn,
    prefixed: prefixed
});

// this prevents errors when Hammer is loaded in the presence of an AMD
//  style loader but by script tag, not by the loader.
var freeGlobal = (typeof window !== 'undefined' ? window : (typeof self !== 'undefined' ? self : {})); // jshint ignore:line
freeGlobal.Hammer = Hammer;

if (true) {
    !(__WEBPACK_AMD_DEFINE_RESULT__ = (function() {
        return Hammer;
    }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}

})(window, document, 'Hammer');


/***/ }),

/***/ 981:
/***/ ((module) => {

/*
 * Hamster.js v1.1.2
 * (c) 2013 Monospaced http://monospaced.com
 * License: MIT
 */

(function(window, document){
'use strict';

/**
 * Hamster
 * use this to create instances
 * @returns {Hamster.Instance}
 * @constructor
 */
var Hamster = function(element) {
  return new Hamster.Instance(element);
};

// default event name
Hamster.SUPPORT = 'wheel';

// default DOM methods
Hamster.ADD_EVENT = 'addEventListener';
Hamster.REMOVE_EVENT = 'removeEventListener';
Hamster.PREFIX = '';

// until browser inconsistencies have been fixed...
Hamster.READY = false;

Hamster.Instance = function(element){
  if (!Hamster.READY) {
    // fix browser inconsistencies
    Hamster.normalise.browser();

    // Hamster is ready...!
    Hamster.READY = true;
  }

  this.element = element;

  // store attached event handlers
  this.handlers = [];

  // return instance
  return this;
};

/**
 * create new hamster instance
 * all methods should return the instance itself, so it is chainable.
 * @param   {HTMLElement}       element
 * @returns {Hamster.Instance}
 * @constructor
 */
Hamster.Instance.prototype = {
  /**
   * bind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  wheel: function onEvent(handler, useCapture){
    Hamster.event.add(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.add(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  },

  /**
   * unbind events to the instance
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   * @returns {Hamster.Instance}
   */
  unwheel: function offEvent(handler, useCapture){
    // if no handler argument,
    // unbind the last bound handler (if exists)
    if (handler === undefined && (handler = this.handlers.slice(-1)[0])) {
      handler = handler.original;
    }

    Hamster.event.remove(this, Hamster.SUPPORT, handler, useCapture);

    // handle MozMousePixelScroll in older Firefox
    if (Hamster.SUPPORT === 'DOMMouseScroll') {
      Hamster.event.remove(this, 'MozMousePixelScroll', handler, useCapture);
    }

    return this;
  }
};

Hamster.event = {
  /**
   * cross-browser 'addWheelListener'
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  add: function add(hamster, eventName, handler, useCapture){
    // store the original handler
    var originalHandler = handler;

    // redefine the handler
    handler = function(originalEvent){

      if (!originalEvent) {
        originalEvent = window.event;
      }

      // create a normalised event object,
      // and normalise "deltas" of the mouse wheel
      var event = Hamster.normalise.event(originalEvent),
          delta = Hamster.normalise.delta(originalEvent);

      // fire the original handler with normalised arguments
      return originalHandler(event, delta[0], delta[1], delta[2]);

    };

    // cross-browser addEventListener
    hamster.element[Hamster.ADD_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // store original and normalised handlers on the instance
    hamster.handlers.push({
      original: originalHandler,
      normalised: handler
    });
  },

  /**
   * removeWheelListener
   * @param   {Instance}    hamster
   * @param   {String}      eventName
   * @param   {Function}    handler
   * @param   {Boolean}     useCapture
   */
  remove: function remove(hamster, eventName, handler, useCapture){
    // find the normalised handler on the instance
    var originalHandler = handler,
        lookup = {},
        handlers;
    for (var i = 0, len = hamster.handlers.length; i < len; ++i) {
      lookup[hamster.handlers[i].original] = hamster.handlers[i];
    }
    handlers = lookup[originalHandler];
    handler = handlers.normalised;

    // cross-browser removeEventListener
    hamster.element[Hamster.REMOVE_EVENT](Hamster.PREFIX + eventName, handler, useCapture || false);

    // remove original and normalised handlers from the instance
    for (var h in hamster.handlers) {
      if (hamster.handlers[h] == handlers) {
        hamster.handlers.splice(h, 1);
        break;
      }
    }
  }
};

/**
 * these hold the lowest deltas,
 * used to normalise the delta values
 * @type {Number}
 */
var lowestDelta,
    lowestDeltaXY;

Hamster.normalise = {
  /**
   * fix browser inconsistencies
   */
  browser: function normaliseBrowser(){
    // detect deprecated wheel events
    if (!('onwheel' in document || document.documentMode >= 9)) {
      Hamster.SUPPORT = document.onmousewheel !== undefined ?
                        'mousewheel' : // webkit and IE < 9 support at least "mousewheel"
                        'DOMMouseScroll'; // assume remaining browsers are older Firefox
    }

    // detect deprecated event model
    if (!window.addEventListener) {
      // assume IE < 9
      Hamster.ADD_EVENT = 'attachEvent';
      Hamster.REMOVE_EVENT = 'detachEvent';
      Hamster.PREFIX = 'on';
    }

  },

  /**
   * create a normalised event object
   * @param   {Function}    originalEvent
   * @returns {Object}      event
   */
   event: function normaliseEvent(originalEvent){
    var event = {
          // keep a reference to the original event object
          originalEvent: originalEvent,
          target: originalEvent.target || originalEvent.srcElement,
          type: 'wheel',
          deltaMode: originalEvent.type === 'MozMousePixelScroll' ? 0 : 1,
          deltaX: 0,
          deltaZ: 0,
          preventDefault: function(){
            if (originalEvent.preventDefault) {
              originalEvent.preventDefault();
            } else {
              originalEvent.returnValue = false;
            }
          },
          stopPropagation: function(){
            if (originalEvent.stopPropagation) {
              originalEvent.stopPropagation();
            } else {
              originalEvent.cancelBubble = false;
            }
          }
        };

    // calculate deltaY (and deltaX) according to the event

    // 'mousewheel'
    if (originalEvent.wheelDelta) {
      event.deltaY = - 1/40 * originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaX) {
      event.deltaX = - 1/40 * originalEvent.wheelDeltaX;
    }

    // 'DomMouseScroll'
    if (originalEvent.detail) {
      event.deltaY = originalEvent.detail;
    }

    return event;
  },

  /**
   * normalise 'deltas' of the mouse wheel
   * @param   {Function}    originalEvent
   * @returns {Array}       deltas
   */
  delta: function normaliseDelta(originalEvent){
    var delta = 0,
      deltaX = 0,
      deltaY = 0,
      absDelta = 0,
      absDeltaXY = 0,
      fn;

    // normalise deltas according to the event

    // 'wheel' event
    if (originalEvent.deltaY) {
      deltaY = originalEvent.deltaY * -1;
      delta  = deltaY;
    }
    if (originalEvent.deltaX) {
      deltaX = originalEvent.deltaX;
      delta  = deltaX * -1;
    }

    // 'mousewheel' event
    if (originalEvent.wheelDelta) {
      delta = originalEvent.wheelDelta;
    }
    // webkit
    if (originalEvent.wheelDeltaY) {
      deltaY = originalEvent.wheelDeltaY;
    }
    if (originalEvent.wheelDeltaX) {
      deltaX = originalEvent.wheelDeltaX * -1;
    }

    // 'DomMouseScroll' event
    if (originalEvent.detail) {
      delta = originalEvent.detail * -1;
    }

    // Don't return NaN
    if (delta === 0) {
      return [0, 0, 0];
    }

    // look for lowest delta to normalize the delta values
    absDelta = Math.abs(delta);
    if (!lowestDelta || absDelta < lowestDelta) {
      lowestDelta = absDelta;
    }
    absDeltaXY = Math.max(Math.abs(deltaY), Math.abs(deltaX));
    if (!lowestDeltaXY || absDeltaXY < lowestDeltaXY) {
      lowestDeltaXY = absDeltaXY;
    }

    // convert deltas to whole numbers
    fn = delta > 0 ? 'floor' : 'ceil';
    delta  = Math[fn](delta / lowestDelta);
    deltaX = Math[fn](deltaX / lowestDeltaXY);
    deltaY = Math[fn](deltaY / lowestDeltaXY);

    return [delta, deltaX, deltaY];
  }
};

if (typeof window.define === 'function' && window.define.amd) {
  // AMD
  window.define('hamster', [], function(){
    return Hamster;
  });
} else if (true) {
  // CommonJS
  module.exports = Hamster;
} else {}

})(window, window.document);


/***/ }),

/***/ 961:
/***/ ((module, exports, __webpack_require__) => {

var __WEBPACK_AMD_DEFINE_RESULT__;// Copyright (c) 2013 Pieroxy <pieroxy@pieroxy.net>
// This work is free. You can redistribute it and/or modify it
// under the terms of the WTFPL, Version 2
// For more information see LICENSE.txt or http://www.wtfpl.net/
//
// For more information, the home page:
// http://pieroxy.net/blog/pages/lz-string/testing.html
//
// LZ-based compression algorithm, version 1.4.5
var LZString = (function() {

// private property
var f = String.fromCharCode;
var keyStrBase64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
var keyStrUriSafe = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+-$";
var baseReverseDic = {};

function getBaseValue(alphabet, character) {
  if (!baseReverseDic[alphabet]) {
    baseReverseDic[alphabet] = {};
    for (var i=0 ; i<alphabet.length ; i++) {
      baseReverseDic[alphabet][alphabet.charAt(i)] = i;
    }
  }
  return baseReverseDic[alphabet][character];
}

var LZString = {
  compressToBase64 : function (input) {
    if (input == null) return "";
    var res = LZString._compress(input, 6, function(a){return keyStrBase64.charAt(a);});
    switch (res.length % 4) { // To produce valid Base64
    default: // When could this happen ?
    case 0 : return res;
    case 1 : return res+"===";
    case 2 : return res+"==";
    case 3 : return res+"=";
    }
  },

  decompressFromBase64 : function (input) {
    if (input == null) return "";
    if (input == "") return null;
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrBase64, input.charAt(index)); });
  },

  compressToUTF16 : function (input) {
    if (input == null) return "";
    return LZString._compress(input, 15, function(a){return f(a+32);}) + " ";
  },

  decompressFromUTF16: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 16384, function(index) { return compressed.charCodeAt(index) - 32; });
  },

  //compress into uint8array (UCS-2 big endian format)
  compressToUint8Array: function (uncompressed) {
    var compressed = LZString.compress(uncompressed);
    var buf=new Uint8Array(compressed.length*2); // 2 bytes per character

    for (var i=0, TotalLen=compressed.length; i<TotalLen; i++) {
      var current_value = compressed.charCodeAt(i);
      buf[i*2] = current_value >>> 8;
      buf[i*2+1] = current_value % 256;
    }
    return buf;
  },

  //decompress from uint8array (UCS-2 big endian format)
  decompressFromUint8Array:function (compressed) {
    if (compressed===null || compressed===undefined){
        return LZString.decompress(compressed);
    } else {
        var buf=new Array(compressed.length/2); // 2 bytes per character
        for (var i=0, TotalLen=buf.length; i<TotalLen; i++) {
          buf[i]=compressed[i*2]*256+compressed[i*2+1];
        }

        var result = [];
        buf.forEach(function (c) {
          result.push(f(c));
        });
        return LZString.decompress(result.join(''));

    }

  },


  //compress into a string that is already URI encoded
  compressToEncodedURIComponent: function (input) {
    if (input == null) return "";
    return LZString._compress(input, 6, function(a){return keyStrUriSafe.charAt(a);});
  },

  //decompress from an output of compressToEncodedURIComponent
  decompressFromEncodedURIComponent:function (input) {
    if (input == null) return "";
    if (input == "") return null;
    input = input.replace(/ /g, "+");
    return LZString._decompress(input.length, 32, function(index) { return getBaseValue(keyStrUriSafe, input.charAt(index)); });
  },

  compress: function (uncompressed) {
    return LZString._compress(uncompressed, 16, function(a){return f(a);});
  },
  _compress: function (uncompressed, bitsPerChar, getCharFromInt) {
    if (uncompressed == null) return "";
    var i, value,
        context_dictionary= {},
        context_dictionaryToCreate= {},
        context_c="",
        context_wc="",
        context_w="",
        context_enlargeIn= 2, // Compensate for the first entry which should not count
        context_dictSize= 3,
        context_numBits= 2,
        context_data=[],
        context_data_val=0,
        context_data_position=0,
        ii;

    for (ii = 0; ii < uncompressed.length; ii += 1) {
      context_c = uncompressed.charAt(ii);
      if (!Object.prototype.hasOwnProperty.call(context_dictionary,context_c)) {
        context_dictionary[context_c] = context_dictSize++;
        context_dictionaryToCreate[context_c] = true;
      }

      context_wc = context_w + context_c;
      if (Object.prototype.hasOwnProperty.call(context_dictionary,context_wc)) {
        context_w = context_wc;
      } else {
        if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
          if (context_w.charCodeAt(0)<256) {
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<8 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          } else {
            value = 1;
            for (i=0 ; i<context_numBits ; i++) {
              context_data_val = (context_data_val << 1) | value;
              if (context_data_position ==bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = 0;
            }
            value = context_w.charCodeAt(0);
            for (i=0 ; i<16 ; i++) {
              context_data_val = (context_data_val << 1) | (value&1);
              if (context_data_position == bitsPerChar-1) {
                context_data_position = 0;
                context_data.push(getCharFromInt(context_data_val));
                context_data_val = 0;
              } else {
                context_data_position++;
              }
              value = value >> 1;
            }
          }
          context_enlargeIn--;
          if (context_enlargeIn == 0) {
            context_enlargeIn = Math.pow(2, context_numBits);
            context_numBits++;
          }
          delete context_dictionaryToCreate[context_w];
        } else {
          value = context_dictionary[context_w];
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }


        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        // Add wc to the dictionary.
        context_dictionary[context_wc] = context_dictSize++;
        context_w = String(context_c);
      }
    }

    // Output the code for w.
    if (context_w !== "") {
      if (Object.prototype.hasOwnProperty.call(context_dictionaryToCreate,context_w)) {
        if (context_w.charCodeAt(0)<256) {
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<8 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        } else {
          value = 1;
          for (i=0 ; i<context_numBits ; i++) {
            context_data_val = (context_data_val << 1) | value;
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = 0;
          }
          value = context_w.charCodeAt(0);
          for (i=0 ; i<16 ; i++) {
            context_data_val = (context_data_val << 1) | (value&1);
            if (context_data_position == bitsPerChar-1) {
              context_data_position = 0;
              context_data.push(getCharFromInt(context_data_val));
              context_data_val = 0;
            } else {
              context_data_position++;
            }
            value = value >> 1;
          }
        }
        context_enlargeIn--;
        if (context_enlargeIn == 0) {
          context_enlargeIn = Math.pow(2, context_numBits);
          context_numBits++;
        }
        delete context_dictionaryToCreate[context_w];
      } else {
        value = context_dictionary[context_w];
        for (i=0 ; i<context_numBits ; i++) {
          context_data_val = (context_data_val << 1) | (value&1);
          if (context_data_position == bitsPerChar-1) {
            context_data_position = 0;
            context_data.push(getCharFromInt(context_data_val));
            context_data_val = 0;
          } else {
            context_data_position++;
          }
          value = value >> 1;
        }


      }
      context_enlargeIn--;
      if (context_enlargeIn == 0) {
        context_enlargeIn = Math.pow(2, context_numBits);
        context_numBits++;
      }
    }

    // Mark the end of the stream
    value = 2;
    for (i=0 ; i<context_numBits ; i++) {
      context_data_val = (context_data_val << 1) | (value&1);
      if (context_data_position == bitsPerChar-1) {
        context_data_position = 0;
        context_data.push(getCharFromInt(context_data_val));
        context_data_val = 0;
      } else {
        context_data_position++;
      }
      value = value >> 1;
    }

    // Flush the last char
    while (true) {
      context_data_val = (context_data_val << 1);
      if (context_data_position == bitsPerChar-1) {
        context_data.push(getCharFromInt(context_data_val));
        break;
      }
      else context_data_position++;
    }
    return context_data.join('');
  },

  decompress: function (compressed) {
    if (compressed == null) return "";
    if (compressed == "") return null;
    return LZString._decompress(compressed.length, 32768, function(index) { return compressed.charCodeAt(index); });
  },

  _decompress: function (length, resetValue, getNextValue) {
    var dictionary = [],
        next,
        enlargeIn = 4,
        dictSize = 4,
        numBits = 3,
        entry = "",
        result = [],
        i,
        w,
        bits, resb, maxpower, power,
        c,
        data = {val:getNextValue(0), position:resetValue, index:1};

    for (i = 0; i < 3; i += 1) {
      dictionary[i] = i;
    }

    bits = 0;
    maxpower = Math.pow(2,2);
    power=1;
    while (power!=maxpower) {
      resb = data.val & data.position;
      data.position >>= 1;
      if (data.position == 0) {
        data.position = resetValue;
        data.val = getNextValue(data.index++);
      }
      bits |= (resb>0 ? 1 : 0) * power;
      power <<= 1;
    }

    switch (next = bits) {
      case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
        c = f(bits);
        break;
      case 2:
        return "";
    }
    dictionary[3] = c;
    w = c;
    result.push(c);
    while (true) {
      if (data.index > length) {
        return "";
      }

      bits = 0;
      maxpower = Math.pow(2,numBits);
      power=1;
      while (power!=maxpower) {
        resb = data.val & data.position;
        data.position >>= 1;
        if (data.position == 0) {
          data.position = resetValue;
          data.val = getNextValue(data.index++);
        }
        bits |= (resb>0 ? 1 : 0) * power;
        power <<= 1;
      }

      switch (c = bits) {
        case 0:
          bits = 0;
          maxpower = Math.pow(2,8);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }

          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 1:
          bits = 0;
          maxpower = Math.pow(2,16);
          power=1;
          while (power!=maxpower) {
            resb = data.val & data.position;
            data.position >>= 1;
            if (data.position == 0) {
              data.position = resetValue;
              data.val = getNextValue(data.index++);
            }
            bits |= (resb>0 ? 1 : 0) * power;
            power <<= 1;
          }
          dictionary[dictSize++] = f(bits);
          c = dictSize-1;
          enlargeIn--;
          break;
        case 2:
          return result.join('');
      }

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

      if (dictionary[c]) {
        entry = dictionary[c];
      } else {
        if (c === dictSize) {
          entry = w + w.charAt(0);
        } else {
          return null;
        }
      }
      result.push(entry);

      // Add w+entry[0] to the dictionary.
      dictionary[dictSize++] = w + entry.charAt(0);
      enlargeIn--;

      w = entry;

      if (enlargeIn == 0) {
        enlargeIn = Math.pow(2, numBits);
        numBits++;
      }

    }
  }
};
  return LZString;
})();

if (true) {
  !(__WEBPACK_AMD_DEFINE_RESULT__ = (function () { return LZString; }).call(exports, __webpack_require__, exports, module),
		__WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
} else {}


/***/ }),

/***/ 799:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(430);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("e31606cc", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 495:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(47);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("5c706798", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 246:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(790);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("3cef57c8", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 171:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(197);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("ad023ec0", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 216:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(537);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("6383d5c6", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 719:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(264);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("cb2c20a2", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 479:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(866);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("f2361728", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 964:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(260);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("4c894658", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 138:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(343);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("2f682836", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 452:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(746);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("69c625e0", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 915:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(899);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("2964fc18", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 656:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(158);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("566749cb", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 13:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(251);
if(content.__esModule) content = content.default;
if(typeof content === 'string') content = [[module.id, content, '']];
if(content.locals) module.exports = content.locals;
// add the styles to the DOM
var add = (__webpack_require__(346)/* ["default"] */ .Z)
var update = add("5b9fc54d", content, false, {});
// Hot Module Replacement
if(false) {}

/***/ }),

/***/ 346:
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Z: () => (/* binding */ addStylesClient)
});

;// CONCATENATED MODULE: ./node_modules/vue-style-loader/lib/listToStyles.js
/**
 * Translates the list format produced by css-loader into something
 * easier to manipulate.
 */
function listToStyles (parentId, list) {
  var styles = []
  var newStyles = {}
  for (var i = 0; i < list.length; i++) {
    var item = list[i]
    var id = item[0]
    var css = item[1]
    var media = item[2]
    var sourceMap = item[3]
    var part = {
      id: parentId + ':' + i,
      css: css,
      media: media,
      sourceMap: sourceMap
    }
    if (!newStyles[id]) {
      styles.push(newStyles[id] = { id: id, parts: [part] })
    } else {
      newStyles[id].parts.push(part)
    }
  }
  return styles
}

;// CONCATENATED MODULE: ./node_modules/vue-style-loader/lib/addStylesClient.js
/*
  MIT License http://www.opensource.org/licenses/mit-license.php
  Author Tobias Koppers @sokra
  Modified by Evan You @yyx990803
*/



var hasDocument = typeof document !== 'undefined'

if (typeof DEBUG !== 'undefined' && DEBUG) {
  if (!hasDocument) {
    throw new Error(
    'vue-style-loader cannot be used in a non-browser environment. ' +
    "Use { target: 'node' } in your Webpack config to indicate a server-rendering environment."
  ) }
}

/*
type StyleObject = {
  id: number;
  parts: Array<StyleObjectPart>
}

type StyleObjectPart = {
  css: string;
  media: string;
  sourceMap: ?string
}
*/

var stylesInDom = {/*
  [id: number]: {
    id: number,
    refs: number,
    parts: Array<(obj?: StyleObjectPart) => void>
  }
*/}

var head = hasDocument && (document.head || document.getElementsByTagName('head')[0])
var singletonElement = null
var singletonCounter = 0
var isProduction = false
var noop = function () {}
var options = null
var ssrIdKey = 'data-vue-ssr-id'

// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
// tags it will allow on a page
var isOldIE = typeof navigator !== 'undefined' && /msie [6-9]\b/.test(navigator.userAgent.toLowerCase())

function addStylesClient (parentId, list, _isProduction, _options) {
  isProduction = _isProduction

  options = _options || {}

  var styles = listToStyles(parentId, list)
  addStylesToDom(styles)

  return function update (newList) {
    var mayRemove = []
    for (var i = 0; i < styles.length; i++) {
      var item = styles[i]
      var domStyle = stylesInDom[item.id]
      domStyle.refs--
      mayRemove.push(domStyle)
    }
    if (newList) {
      styles = listToStyles(parentId, newList)
      addStylesToDom(styles)
    } else {
      styles = []
    }
    for (var i = 0; i < mayRemove.length; i++) {
      var domStyle = mayRemove[i]
      if (domStyle.refs === 0) {
        for (var j = 0; j < domStyle.parts.length; j++) {
          domStyle.parts[j]()
        }
        delete stylesInDom[domStyle.id]
      }
    }
  }
}

function addStylesToDom (styles /* Array<StyleObject> */) {
  for (var i = 0; i < styles.length; i++) {
    var item = styles[i]
    var domStyle = stylesInDom[item.id]
    if (domStyle) {
      domStyle.refs++
      for (var j = 0; j < domStyle.parts.length; j++) {
        domStyle.parts[j](item.parts[j])
      }
      for (; j < item.parts.length; j++) {
        domStyle.parts.push(addStyle(item.parts[j]))
      }
      if (domStyle.parts.length > item.parts.length) {
        domStyle.parts.length = item.parts.length
      }
    } else {
      var parts = []
      for (var j = 0; j < item.parts.length; j++) {
        parts.push(addStyle(item.parts[j]))
      }
      stylesInDom[item.id] = { id: item.id, refs: 1, parts: parts }
    }
  }
}

function createStyleElement () {
  var styleElement = document.createElement('style')
  styleElement.type = 'text/css'
  head.appendChild(styleElement)
  return styleElement
}

function addStyle (obj /* StyleObjectPart */) {
  var update, remove
  var styleElement = document.querySelector('style[' + ssrIdKey + '~="' + obj.id + '"]')

  if (styleElement) {
    if (isProduction) {
      // has SSR styles and in production mode.
      // simply do nothing.
      return noop
    } else {
      // has SSR styles but in dev mode.
      // for some reason Chrome can't handle source map in server-rendered
      // style tags - source maps in <style> only works if the style tag is
      // created and inserted dynamically. So we remove the server rendered
      // styles and inject new ones.
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  if (isOldIE) {
    // use singleton mode for IE9.
    var styleIndex = singletonCounter++
    styleElement = singletonElement || (singletonElement = createStyleElement())
    update = applyToSingletonTag.bind(null, styleElement, styleIndex, false)
    remove = applyToSingletonTag.bind(null, styleElement, styleIndex, true)
  } else {
    // use multi-style-tag mode in all other cases
    styleElement = createStyleElement()
    update = applyToTag.bind(null, styleElement)
    remove = function () {
      styleElement.parentNode.removeChild(styleElement)
    }
  }

  update(obj)

  return function updateStyle (newObj /* StyleObjectPart */) {
    if (newObj) {
      if (newObj.css === obj.css &&
          newObj.media === obj.media &&
          newObj.sourceMap === obj.sourceMap) {
        return
      }
      update(obj = newObj)
    } else {
      remove()
    }
  }
}

var replaceText = (function () {
  var textStore = []

  return function (index, replacement) {
    textStore[index] = replacement
    return textStore.filter(Boolean).join('\n')
  }
})()

function applyToSingletonTag (styleElement, index, remove, obj) {
  var css = remove ? '' : obj.css

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = replaceText(index, css)
  } else {
    var cssNode = document.createTextNode(css)
    var childNodes = styleElement.childNodes
    if (childNodes[index]) styleElement.removeChild(childNodes[index])
    if (childNodes.length) {
      styleElement.insertBefore(cssNode, childNodes[index])
    } else {
      styleElement.appendChild(cssNode)
    }
  }
}

function applyToTag (styleElement, obj) {
  var css = obj.css
  var media = obj.media
  var sourceMap = obj.sourceMap

  if (media) {
    styleElement.setAttribute('media', media)
  }
  if (options.ssrId) {
    styleElement.setAttribute(ssrIdKey, obj.id)
  }

  if (sourceMap) {
    // https://developer.chrome.com/devtools/docs/javascript-debugging
    // this makes source maps inside style tags work properly in Chrome
    css += '\n/*# sourceURL=' + sourceMap.sources[0] + ' */'
    // http://stackoverflow.com/a/26603875
    css += '\n/*# sourceMappingURL=data:application/json;base64,' + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + ' */'
  }

  if (styleElement.styleSheet) {
    styleElement.styleSheet.cssText = css
  } else {
    while (styleElement.firstChild) {
      styleElement.removeChild(styleElement.firstChild)
    }
    styleElement.appendChild(document.createTextNode(css))
  }
}


/***/ }),

/***/ 61:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

var _typeof = (__webpack_require__(698)["default"]);
function _regeneratorRuntime() {
  "use strict"; /*! regenerator-runtime -- Copyright (c) 2014-present, Facebook, Inc. -- license (MIT): https://github.com/facebook/regenerator/blob/main/LICENSE */
  module.exports = _regeneratorRuntime = function _regeneratorRuntime() {
    return e;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports;
  var t,
    e = {},
    r = Object.prototype,
    n = r.hasOwnProperty,
    o = Object.defineProperty || function (t, e, r) {
      t[e] = r.value;
    },
    i = "function" == typeof Symbol ? Symbol : {},
    a = i.iterator || "@@iterator",
    c = i.asyncIterator || "@@asyncIterator",
    u = i.toStringTag || "@@toStringTag";
  function define(t, e, r) {
    return Object.defineProperty(t, e, {
      value: r,
      enumerable: !0,
      configurable: !0,
      writable: !0
    }), t[e];
  }
  try {
    define({}, "");
  } catch (t) {
    define = function define(t, e, r) {
      return t[e] = r;
    };
  }
  function wrap(t, e, r, n) {
    var i = e && e.prototype instanceof Generator ? e : Generator,
      a = Object.create(i.prototype),
      c = new Context(n || []);
    return o(a, "_invoke", {
      value: makeInvokeMethod(t, r, c)
    }), a;
  }
  function tryCatch(t, e, r) {
    try {
      return {
        type: "normal",
        arg: t.call(e, r)
      };
    } catch (t) {
      return {
        type: "throw",
        arg: t
      };
    }
  }
  e.wrap = wrap;
  var h = "suspendedStart",
    l = "suspendedYield",
    f = "executing",
    s = "completed",
    y = {};
  function Generator() {}
  function GeneratorFunction() {}
  function GeneratorFunctionPrototype() {}
  var p = {};
  define(p, a, function () {
    return this;
  });
  var d = Object.getPrototypeOf,
    v = d && d(d(values([])));
  v && v !== r && n.call(v, a) && (p = v);
  var g = GeneratorFunctionPrototype.prototype = Generator.prototype = Object.create(p);
  function defineIteratorMethods(t) {
    ["next", "throw", "return"].forEach(function (e) {
      define(t, e, function (t) {
        return this._invoke(e, t);
      });
    });
  }
  function AsyncIterator(t, e) {
    function invoke(r, o, i, a) {
      var c = tryCatch(t[r], t, o);
      if ("throw" !== c.type) {
        var u = c.arg,
          h = u.value;
        return h && "object" == _typeof(h) && n.call(h, "__await") ? e.resolve(h.__await).then(function (t) {
          invoke("next", t, i, a);
        }, function (t) {
          invoke("throw", t, i, a);
        }) : e.resolve(h).then(function (t) {
          u.value = t, i(u);
        }, function (t) {
          return invoke("throw", t, i, a);
        });
      }
      a(c.arg);
    }
    var r;
    o(this, "_invoke", {
      value: function value(t, n) {
        function callInvokeWithMethodAndArg() {
          return new e(function (e, r) {
            invoke(t, n, e, r);
          });
        }
        return r = r ? r.then(callInvokeWithMethodAndArg, callInvokeWithMethodAndArg) : callInvokeWithMethodAndArg();
      }
    });
  }
  function makeInvokeMethod(e, r, n) {
    var o = h;
    return function (i, a) {
      if (o === f) throw new Error("Generator is already running");
      if (o === s) {
        if ("throw" === i) throw a;
        return {
          value: t,
          done: !0
        };
      }
      for (n.method = i, n.arg = a;;) {
        var c = n.delegate;
        if (c) {
          var u = maybeInvokeDelegate(c, n);
          if (u) {
            if (u === y) continue;
            return u;
          }
        }
        if ("next" === n.method) n.sent = n._sent = n.arg;else if ("throw" === n.method) {
          if (o === h) throw o = s, n.arg;
          n.dispatchException(n.arg);
        } else "return" === n.method && n.abrupt("return", n.arg);
        o = f;
        var p = tryCatch(e, r, n);
        if ("normal" === p.type) {
          if (o = n.done ? s : l, p.arg === y) continue;
          return {
            value: p.arg,
            done: n.done
          };
        }
        "throw" === p.type && (o = s, n.method = "throw", n.arg = p.arg);
      }
    };
  }
  function maybeInvokeDelegate(e, r) {
    var n = r.method,
      o = e.iterator[n];
    if (o === t) return r.delegate = null, "throw" === n && e.iterator["return"] && (r.method = "return", r.arg = t, maybeInvokeDelegate(e, r), "throw" === r.method) || "return" !== n && (r.method = "throw", r.arg = new TypeError("The iterator does not provide a '" + n + "' method")), y;
    var i = tryCatch(o, e.iterator, r.arg);
    if ("throw" === i.type) return r.method = "throw", r.arg = i.arg, r.delegate = null, y;
    var a = i.arg;
    return a ? a.done ? (r[e.resultName] = a.value, r.next = e.nextLoc, "return" !== r.method && (r.method = "next", r.arg = t), r.delegate = null, y) : a : (r.method = "throw", r.arg = new TypeError("iterator result is not an object"), r.delegate = null, y);
  }
  function pushTryEntry(t) {
    var e = {
      tryLoc: t[0]
    };
    1 in t && (e.catchLoc = t[1]), 2 in t && (e.finallyLoc = t[2], e.afterLoc = t[3]), this.tryEntries.push(e);
  }
  function resetTryEntry(t) {
    var e = t.completion || {};
    e.type = "normal", delete e.arg, t.completion = e;
  }
  function Context(t) {
    this.tryEntries = [{
      tryLoc: "root"
    }], t.forEach(pushTryEntry, this), this.reset(!0);
  }
  function values(e) {
    if (e || "" === e) {
      var r = e[a];
      if (r) return r.call(e);
      if ("function" == typeof e.next) return e;
      if (!isNaN(e.length)) {
        var o = -1,
          i = function next() {
            for (; ++o < e.length;) if (n.call(e, o)) return next.value = e[o], next.done = !1, next;
            return next.value = t, next.done = !0, next;
          };
        return i.next = i;
      }
    }
    throw new TypeError(_typeof(e) + " is not iterable");
  }
  return GeneratorFunction.prototype = GeneratorFunctionPrototype, o(g, "constructor", {
    value: GeneratorFunctionPrototype,
    configurable: !0
  }), o(GeneratorFunctionPrototype, "constructor", {
    value: GeneratorFunction,
    configurable: !0
  }), GeneratorFunction.displayName = define(GeneratorFunctionPrototype, u, "GeneratorFunction"), e.isGeneratorFunction = function (t) {
    var e = "function" == typeof t && t.constructor;
    return !!e && (e === GeneratorFunction || "GeneratorFunction" === (e.displayName || e.name));
  }, e.mark = function (t) {
    return Object.setPrototypeOf ? Object.setPrototypeOf(t, GeneratorFunctionPrototype) : (t.__proto__ = GeneratorFunctionPrototype, define(t, u, "GeneratorFunction")), t.prototype = Object.create(g), t;
  }, e.awrap = function (t) {
    return {
      __await: t
    };
  }, defineIteratorMethods(AsyncIterator.prototype), define(AsyncIterator.prototype, c, function () {
    return this;
  }), e.AsyncIterator = AsyncIterator, e.async = function (t, r, n, o, i) {
    void 0 === i && (i = Promise);
    var a = new AsyncIterator(wrap(t, r, n, o), i);
    return e.isGeneratorFunction(r) ? a : a.next().then(function (t) {
      return t.done ? t.value : a.next();
    });
  }, defineIteratorMethods(g), define(g, u, "Generator"), define(g, a, function () {
    return this;
  }), define(g, "toString", function () {
    return "[object Generator]";
  }), e.keys = function (t) {
    var e = Object(t),
      r = [];
    for (var n in e) r.push(n);
    return r.reverse(), function next() {
      for (; r.length;) {
        var t = r.pop();
        if (t in e) return next.value = t, next.done = !1, next;
      }
      return next.done = !0, next;
    };
  }, e.values = values, Context.prototype = {
    constructor: Context,
    reset: function reset(e) {
      if (this.prev = 0, this.next = 0, this.sent = this._sent = t, this.done = !1, this.delegate = null, this.method = "next", this.arg = t, this.tryEntries.forEach(resetTryEntry), !e) for (var r in this) "t" === r.charAt(0) && n.call(this, r) && !isNaN(+r.slice(1)) && (this[r] = t);
    },
    stop: function stop() {
      this.done = !0;
      var t = this.tryEntries[0].completion;
      if ("throw" === t.type) throw t.arg;
      return this.rval;
    },
    dispatchException: function dispatchException(e) {
      if (this.done) throw e;
      var r = this;
      function handle(n, o) {
        return a.type = "throw", a.arg = e, r.next = n, o && (r.method = "next", r.arg = t), !!o;
      }
      for (var o = this.tryEntries.length - 1; o >= 0; --o) {
        var i = this.tryEntries[o],
          a = i.completion;
        if ("root" === i.tryLoc) return handle("end");
        if (i.tryLoc <= this.prev) {
          var c = n.call(i, "catchLoc"),
            u = n.call(i, "finallyLoc");
          if (c && u) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          } else if (c) {
            if (this.prev < i.catchLoc) return handle(i.catchLoc, !0);
          } else {
            if (!u) throw new Error("try statement without catch or finally");
            if (this.prev < i.finallyLoc) return handle(i.finallyLoc);
          }
        }
      }
    },
    abrupt: function abrupt(t, e) {
      for (var r = this.tryEntries.length - 1; r >= 0; --r) {
        var o = this.tryEntries[r];
        if (o.tryLoc <= this.prev && n.call(o, "finallyLoc") && this.prev < o.finallyLoc) {
          var i = o;
          break;
        }
      }
      i && ("break" === t || "continue" === t) && i.tryLoc <= e && e <= i.finallyLoc && (i = null);
      var a = i ? i.completion : {};
      return a.type = t, a.arg = e, i ? (this.method = "next", this.next = i.finallyLoc, y) : this.complete(a);
    },
    complete: function complete(t, e) {
      if ("throw" === t.type) throw t.arg;
      return "break" === t.type || "continue" === t.type ? this.next = t.arg : "return" === t.type ? (this.rval = this.arg = t.arg, this.method = "return", this.next = "end") : "normal" === t.type && e && (this.next = e), y;
    },
    finish: function finish(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.finallyLoc === t) return this.complete(r.completion, r.afterLoc), resetTryEntry(r), y;
      }
    },
    "catch": function _catch(t) {
      for (var e = this.tryEntries.length - 1; e >= 0; --e) {
        var r = this.tryEntries[e];
        if (r.tryLoc === t) {
          var n = r.completion;
          if ("throw" === n.type) {
            var o = n.arg;
            resetTryEntry(r);
          }
          return o;
        }
      }
      throw new Error("illegal catch attempt");
    },
    delegateYield: function delegateYield(e, r, n) {
      return this.delegate = {
        iterator: values(e),
        resultName: r,
        nextLoc: n
      }, "next" === this.method && (this.arg = t), y;
    }
  }, e;
}
module.exports = _regeneratorRuntime, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 698:
/***/ ((module) => {

function _typeof(o) {
  "@babel/helpers - typeof";

  return (module.exports = _typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, module.exports.__esModule = true, module.exports["default"] = module.exports), _typeof(o);
}
module.exports = _typeof, module.exports.__esModule = true, module.exports["default"] = module.exports;

/***/ }),

/***/ 687:
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

// TODO(Babel 8): Remove this file.

var runtime = __webpack_require__(61)();
module.exports = runtime;

// Copied from https://github.com/facebook/regenerator/blob/main/packages/runtime/runtime.js#L736=
try {
  regeneratorRuntime = runtime;
} catch (accidentalStrictMode) {
  if (typeof globalThis === "object") {
    globalThis.regeneratorRuntime = runtime;
  } else {
    Function("r", "regeneratorRuntime = r")(runtime);
  }
}


/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry need to be wrapped in an IIFE because it need to be in strict mode.
(() => {
"use strict";
// ESM COMPAT FLAG
__webpack_require__.r(__webpack_exports__);

// EXPORTS
__webpack_require__.d(__webpack_exports__, {
  Candle: () => (/* reexport */ CandleExt),
  Constants: () => (/* reexport */ constants),
  DataCube: () => (/* reexport */ DataCube),
  Interface: () => (/* reexport */ mixins_interface),
  Overlay: () => (/* reexport */ overlay),
  Tool: () => (/* reexport */ tool),
  TradingVue: () => (/* reexport */ TradingVue),
  Utils: () => (/* reexport */ utils),
  Volbar: () => (/* reexport */ VolbarExt),
  "default": () => (/* binding */ src),
  layout_cnv: () => (/* reexport */ layout_cnv),
  layout_vol: () => (/* reexport */ layout_vol),
  primitives: () => (/* binding */ primitives)
});

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=template&id=30f951ca&
var render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "trading-vue",
    style: {
      color: this.chart_props.colors.text,
      font: this.font_comp,
      width: this.width + "px",
      height: this.height + "px"
    },
    attrs: {
      id: _vm.id
    },
    on: {
      mousedown: _vm.mousedown,
      mouseleave: _vm.mouseleave
    }
  }, [_vm.toolbar ? _c("toolbar", _vm._b({
    ref: "toolbar",
    attrs: {
      config: _vm.chart_config
    },
    on: {
      "custom-event": _vm.custom_event
    }
  }, "toolbar", _vm.chart_props, false)) : _vm._e(), _vm._v(" "), _vm.controllers.length ? _c("widgets", {
    ref: "widgets",
    attrs: {
      map: _vm.ws,
      width: _vm.width,
      height: _vm.height,
      tv: this,
      dc: _vm.data
    }
  }) : _vm._e(), _vm._v(" "), _c("chart", _vm._b({
    key: _vm.reset,
    ref: "chart",
    attrs: {
      enableZoom: _vm.enableZoom,
      enableSideBarBoxValue: _vm.enableSideBarBoxValue,
      applyShaders: _vm.applyShaders,
      priceLine: _vm.priceLine,
      decimalPlace: _vm.decimalPlace,
      roundOffVolume: _vm.roundOffVolume,
      legendDecimal: _vm.legendDecimal,
      enableCrosshair: _vm.enableCrosshair,
      ignoreNegativeIndex: _vm.ignoreNegativeIndex,
      ignore_OHLC: _vm.ignore_OHLC,
      tv_id: _vm.id,
      config: _vm.chart_config
    },
    on: {
      "custom-event": _vm.custom_event,
      "range-changed": _vm.range_changed,
      chart_data_changed: _vm.chart_data_changed,
      "sidebar-transform": _vm.sidebar_transform,
      "legend-button-click": _vm.legend_button
    }
  }, "chart", _vm.chart_props, false)), _vm._v(" "), _c("transition", {
    attrs: {
      name: "tvjs-drift"
    }
  }, [_vm.tip ? _c("the-tip", {
    attrs: {
      data: _vm.tip
    },
    on: {
      "remove-me": function removeMe($event) {
        _vm.tip = null;
      }
    }
  }) : _vm._e()], 1)], 1);
};
var staticRenderFns = [];
render._withStripped = true;

;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=template&id=30f951ca&

;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayLikeToArray.js
function _arrayLikeToArray(arr, len) {
  if (len == null || len > arr.length) len = arr.length;
  for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i];
  return arr2;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayWithoutHoles.js

function _arrayWithoutHoles(arr) {
  if (Array.isArray(arr)) return _arrayLikeToArray(arr);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/iterableToArray.js
function _iterableToArray(iter) {
  if (typeof Symbol !== "undefined" && iter[Symbol.iterator] != null || iter["@@iterator"] != null) return Array.from(iter);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/unsupportedIterableToArray.js

function _unsupportedIterableToArray(o, minLen) {
  if (!o) return;
  if (typeof o === "string") return _arrayLikeToArray(o, minLen);
  var n = Object.prototype.toString.call(o).slice(8, -1);
  if (n === "Object" && o.constructor) n = o.constructor.name;
  if (n === "Map" || n === "Set") return Array.from(o);
  if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return _arrayLikeToArray(o, minLen);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/nonIterableSpread.js
function _nonIterableSpread() {
  throw new TypeError("Invalid attempt to spread non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/toConsumableArray.js




function _toConsumableArray(arr) {
  return _arrayWithoutHoles(arr) || _iterableToArray(arr) || _unsupportedIterableToArray(arr) || _nonIterableSpread();
}
;// CONCATENATED MODULE: ./src/stuff/constants.js
var SECOND = 1000;
var MINUTE = SECOND * 60;
var MINUTE3 = MINUTE * 3;
var MINUTE5 = MINUTE * 5;
var MINUTE15 = MINUTE * 15;
var MINUTE30 = MINUTE * 30;
var HOUR = MINUTE * 60;
var HOUR4 = HOUR * 4;
var HOUR12 = HOUR * 12;
var DAY = HOUR * 24;
var WEEK = DAY * 7;
var MONTH = WEEK * 4;
var YEAR = DAY * 365;
var MONTHMAP = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// Grid time steps
var TIMESCALES = [YEAR * 10, YEAR * 5, YEAR * 3, YEAR * 2, YEAR, MONTH * 6, MONTH * 4, MONTH * 3, MONTH * 2, MONTH, DAY * 15, DAY * 10, DAY * 7, DAY * 5, DAY * 3, DAY * 2, DAY, HOUR * 12, HOUR * 6, HOUR * 3, HOUR * 1.5, HOUR, MINUTE30, MINUTE15, MINUTE * 10, MINUTE5, MINUTE * 2, MINUTE];

// Grid $ steps
var $SCALES = [0.05, 0.1, 0.2, 0.25, 0.5, 0.8, 1, 2, 5];
var ChartConfig = {
  SBMIN: 60,
  // Minimal sidebar px
  SBMAX: Infinity,
  // Max sidebar, px
  TOOLBAR: 57,
  // Toolbar width px
  TB_ICON: 25,
  // Toolbar icon size px
  TB_ITEM_M: 6,
  // Toolbar item margin px
  TB_ICON_BRI: 1,
  // Toolbar icon brightness
  TB_ICON_HOLD: 420,
  // ms, wait to expand
  TB_BORDER: 1,
  // Toolbar border px
  TB_B_STYLE: 'dotted',
  // Toolbar border style
  TOOL_COLL: 7,
  // Tool collision threshold
  EXPAND: 0.15,
  // %/100 of range
  CANDLEW: 0.6,
  // %/100 of step
  GRIDX: 100,
  // px
  GRIDY: 47,
  // px
  BOTBAR: 28,
  // px
  PANHEIGHT: 22,
  // px
  DEFAULT_LEN: 50,
  // candles
  MINIMUM_LEN: 5,
  // candles,
  MIN_ZOOM: 25,
  // candles
  MAX_ZOOM: 1000,
  // candles,
  VOLSCALE: 0.15,
  // %/100 of height
  UX_OPACITY: 0.9,
  // Ux background opacity
  ZOOM_MODE: 'tv',
  // 'tv' or 'tl'
  L_BTN_SIZE: 21,
  // Legend Button size, px
  L_BTN_MARGIN: '-6px 0 -6px 0',
  // css margin
  SCROLL_WHEEL: 'prevent' // 'pass', 'click'
};

ChartConfig.FONT = "11px -apple-system,BlinkMacSystemFont,\n    Segoe UI,Roboto,Oxygen,Ubuntu,Cantarell,\n    Fira Sans,Droid Sans,Helvetica Neue,\n    sans-serif";
var IB_TF_WARN = 'When using IB mode you should specify ' + 'timeframe (\'tf\' filed in \'chart\' object),' + 'otherwise you can get an unexpected behaviour';
var MAP_UNIT = {
  '1s': SECOND,
  '5s': SECOND * 5,
  '10s': SECOND * 10,
  '20s': SECOND * 20,
  '30s': SECOND * 30,
  '1m': MINUTE,
  '3m': MINUTE3,
  '5m': MINUTE5,
  '15m': MINUTE15,
  '30m': MINUTE30,
  '1H': HOUR,
  '2H': HOUR * 2,
  '3H': HOUR * 3,
  '4H': HOUR4,
  '12H': HOUR12,
  '1D': DAY,
  '1W': WEEK,
  '1M': MONTH,
  '1Y': YEAR
};
/* harmony default export */ const constants = ({
  SECOND: SECOND,
  MINUTE: MINUTE,
  MINUTE5: MINUTE5,
  MINUTE15: MINUTE15,
  MINUTE30: MINUTE30,
  HOUR: HOUR,
  HOUR4: HOUR4,
  DAY: DAY,
  WEEK: WEEK,
  MONTH: MONTH,
  YEAR: YEAR,
  MONTHMAP: MONTHMAP,
  TIMESCALES: TIMESCALES,
  $SCALES: $SCALES,
  ChartConfig: ChartConfig,
  map_unit: MAP_UNIT,
  IB_TF_WARN: IB_TF_WARN
});
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Chart.vue?vue&type=template&id=6139f27a&
var Chartvue_type_template_id_6139f27a_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "trading-vue-chart",
    style: _vm.styles
  }, [_c("keyboard", {
    ref: "keyboard"
  }), _vm._v(" "), _vm._l(this._layout.grids, function (grid, i) {
    return _c("grid-section", {
      key: grid.id,
      ref: "sec",
      refInFor: true,
      attrs: {
        common: _vm.section_props(i),
        grid_id: i,
        enableZoom: _vm.enableZoom,
        enableSideBarBoxValue: _vm.enableSideBarBoxValue,
        decimalPlace: _vm.decimalPlace,
        roundOffVolume: _vm.roundOffVolume,
        legendDecimal: _vm.legendDecimal,
        applyShaders: _vm.applyShaders,
        priceLine: _vm.priceLine,
        enableCrosshair: _vm.enableCrosshair,
        ignore_OHLC: _vm.ignore_OHLC
      },
      on: {
        "register-kb-listener": _vm.register_kb,
        "remove-kb-listener": _vm.remove_kb,
        "range-changed": _vm.range_changed,
        "cursor-changed": _vm.cursor_changed,
        "cursor-locked": _vm.cursor_locked,
        "sidebar-transform": _vm.set_ytransform,
        "layer-meta-props": _vm.layer_meta_props,
        "custom-event": _vm.emit_custom_event,
        "legend-button-click": _vm.legend_button_click
      }
    });
  }), _vm._v(" "), _c("botbar", _vm._b({
    attrs: {
      shaders: _vm.shaders,
      timezone: _vm.timezone
    }
  }, "botbar", _vm.botbar_props, false))], 2);
};
var Chartvue_type_template_id_6139f27a_staticRenderFns = [];
Chartvue_type_template_id_6139f27a_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Chart.vue?vue&type=template&id=6139f27a&

;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/arrayWithHoles.js
function _arrayWithHoles(arr) {
  if (Array.isArray(arr)) return arr;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/iterableToArrayLimit.js
function _iterableToArrayLimit(r, l) {
  var t = null == r ? null : "undefined" != typeof Symbol && r[Symbol.iterator] || r["@@iterator"];
  if (null != t) {
    var e,
      n,
      i,
      u,
      a = [],
      f = !0,
      o = !1;
    try {
      if (i = (t = t.call(r)).next, 0 === l) {
        if (Object(t) !== t) return;
        f = !1;
      } else for (; !(f = (e = i.call(t)).done) && (a.push(e.value), a.length !== l); f = !0);
    } catch (r) {
      o = !0, n = r;
    } finally {
      try {
        if (!f && null != t["return"] && (u = t["return"](), Object(u) !== u)) return;
      } finally {
        if (o) throw n;
      }
    }
    return a;
  }
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/nonIterableRest.js
function _nonIterableRest() {
  throw new TypeError("Invalid attempt to destructure non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method.");
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/slicedToArray.js




function _slicedToArray(arr, i) {
  return _arrayWithHoles(arr) || _iterableToArrayLimit(arr, i) || _unsupportedIterableToArray(arr, i) || _nonIterableRest();
}
;// CONCATENATED MODULE: ./src/stuff/context.js
// Canvas context for text measurments

function Context($p) {
  var el = document.createElement('canvas');
  var ctx = el.getContext('2d');
  ctx.font = $p.font;
  return ctx;
}
/* harmony default export */ const context = (Context);
// EXTERNAL MODULE: ./node_modules/arrayslicer/lib/index.js
var lib = __webpack_require__(678);
var lib_default = /*#__PURE__*/__webpack_require__.n(lib);
;// CONCATENATED MODULE: ./src/stuff/utils.js



/* harmony default export */ const utils = ({
  clamp: function clamp(num, min, max) {
    return num <= min ? min : num >= max ? max : num;
  },
  add_zero: function add_zero(i) {
    if (i < 10) {
      i = '0' + i;
    }
    return i;
  },
  // Start of the day (zero millisecond)
  day_start: function day_start(t) {
    var start = new Date(t);
    return start.setUTCHours(0, 0, 0, 0);
  },
  // Start of the month
  month_start: function month_start(t) {
    var date = new Date(t);
    return Date.UTC(date.getFullYear(), date.getMonth(), 1);
  },
  // Start of the year
  year_start: function year_start(t) {
    return Date.UTC(new Date(t).getFullYear());
  },
  get_year: function get_year(t) {
    if (!t) return undefined;
    return new Date(t).getUTCFullYear();
  },
  get_month: function get_month(t) {
    if (!t) return undefined;
    return new Date(t).getUTCMonth();
  },
  // Nearest in array
  nearest_a: function nearest_a(x, array) {
    var dist = Infinity;
    var val = null;
    var index = -1;
    for (var i = 0; i < array.length; i++) {
      var xi = array[i];
      if (Math.abs(xi - x) < dist) {
        dist = Math.abs(xi - x);
        val = xi;
        index = i;
      }
    }
    return [index, val];
  },
  round: function round(num, decimals) {
    if (decimals === void 0) {
      decimals = 8;
    }
    return parseFloat(num.toFixed(decimals));
  },
  // Strip? No, it's ugly floats in js
  strip: function strip(number) {
    return parseFloat(parseFloat(number).toPrecision(12));
  },
  get_day: function get_day(t) {
    return t ? new Date(t).getDate() : null;
  },
  // Update array keeping the same reference
  overwrite: function overwrite(arr, new_arr) {
    arr.splice.apply(arr, [0, arr.length].concat(_toConsumableArray(new_arr)));
  },
  // Copy layout in reactive way
  copy_layout: function copy_layout(obj, new_obj) {
    for (var k in obj) {
      if (Array.isArray(obj[k])) {
        // (some offchart indicators are added/removed)
        // we need to update layout in a reactive way
        if (obj[k].length !== new_obj[k].length) {
          this.overwrite(obj[k], new_obj[k]);
          continue;
        }
        for (var m in obj[k]) {
          Object.assign(obj[k][m], new_obj[k][m]);
        }
      } else {
        Object.assign(obj[k], new_obj[k]);
      }
    }
  },
  // Detects candles interval
  detect_interval: function detect_interval(ohlcv) {
    var len = Math.min(ohlcv.length - 1, 99);
    var min = Infinity;
    ohlcv.slice(0, len).forEach(function (x, i) {
      var d = ohlcv[i + 1][0] - x[0];
      if (d === d && d < min) min = d;
    });
    // This saves monthly chart from being awkward
    if (min >= constants.MONTH && min <= constants.DAY * 30) {
      return constants.DAY * 31;
    }
    return min;
  },
  // Gets numberic part of overlay id (e.g 'EMA_1' = > 1)
  get_num_id: function get_num_id(id) {
    return parseInt(id.split('_').pop());
  },
  // Fast filter. Really fast, like 10X
  fast_filter: function fast_filter(arr, t1, t2) {
    if (!arr.length) return [arr, undefined];
    try {
      var ia = new (lib_default())(arr, '0');
      var res = ia.getRange(t1, t2);
      var i0 = ia.valpos[t1].next;
      return [res, i0];
    } catch (e) {
      // Something wrong with fancy slice lib
      // Fast fix: fallback to filter
      return [arr.filter(function (x) {
        return x[0] >= t1 && x[0] <= t2;
      }), 0];
    }
  },
  // Fast filter (index-based)
  fast_filter_i: function fast_filter_i(arr, t1, t2) {
    if (!arr.length) return [arr, undefined];
    var i1 = Math.floor(t1);
    if (i1 < 0) i1 = 0;
    var i2 = Math.floor(t2 + 1);
    var res = arr.slice(i1, i2);
    return [res, i1];
  },
  // Nearest indexes (left and right)
  fast_nearest: function fast_nearest(arr, t1) {
    var ia = new (lib_default())(arr, '0');
    ia.fetch(t1);
    return [ia.nextlow, ia.nexthigh];
  },
  now: function now() {
    return new Date().getTime();
  },
  pause: function pause(delay) {
    return new Promise(function (rs, rj) {
      return setTimeout(rs, delay);
    });
  },
  // Limit crazy wheel delta values
  smart_wheel: function smart_wheel(delta) {
    var abs = Math.abs(delta);
    if (abs > 500) {
      return (200 + Math.log(abs)) * Math.sign(delta);
    }
    return delta;
  },
  // Parse the original mouse event to find deltaX
  get_deltaX: function get_deltaX(event) {
    return event.originalEvent.deltaX / 12;
  },
  // Parse the original mouse event to find deltaY
  get_deltaY: function get_deltaY(event) {
    return event.originalEvent.deltaY / 12;
  },
  // Apply opacity to a hex color
  apply_opacity: function apply_opacity(c, op) {
    if (c.length === 7) {
      var n = Math.floor(op * 255);
      n = this.clamp(n, 0, 255);
      c += n.toString(16);
    }
    return c;
  },
  // Parse timeframe or return value in ms
  parse_tf: function parse_tf(smth) {
    if (typeof smth === 'string') {
      return constants.map_unit[smth];
    } else {
      return smth;
    }
  },
  // Detect index shift between the main data sub
  // and the overlay's sub (for IB-mode)
  index_shift: function index_shift(sub, data) {
    // Find the second timestamp (by value)
    if (!data.length) return 0;
    var first = data[0][0];
    var second;
    for (var i = 1; i < data.length; i++) {
      if (data[i][0] !== first) {
        second = data[i][0];
        break;
      }
    }
    for (var j = 0; j < sub.length; j++) {
      if (sub[j][0] === second) {
        return j - i;
      }
    }
    return 0;
  },
  // Fallback fix for Brave browser
  // https://github.com/brave/brave-browser/issues/1738
  measureText: function measureText(ctx, text, tv_id) {
    var m = ctx.measureTextOrg(text);
    if (m.width === 0) {
      var doc = document;
      var id = 'tvjs-measure-text';
      var el = doc.getElementById(id);
      if (!el) {
        var base = doc.getElementById(tv_id);
        el = doc.createElement('div');
        el.id = id;
        el.style.position = 'absolute';
        el.style.top = '-1000px';
        base.appendChild(el);
      }
      if (ctx.font) el.style.font = ctx.font;
      el.innerText = text.replace(/ /g, '.');
      return {
        width: el.offsetWidth
      };
    } else {
      return m;
    }
  },
  uuid: function uuid(temp) {
    if (temp === void 0) {
      temp = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx';
    }
    return temp.replace(/[xy]/g, function (c) {
      var r = Math.random() * 16 | 0,
        v = c == 'x' ? r : r & 0x3 | 0x8;
      return v.toString(16);
    });
  },
  uuid2: function uuid2() {
    return this.uuid('xxxxxxxxxxxx');
  },
  // Delayed warning, f = condition lambda fn
  warn: function warn(f, text, delay) {
    if (delay === void 0) {
      delay = 0;
    }
    setTimeout(function () {
      if (f()) console.warn(text);
    }, delay);
  },
  // Checks if script props updated
  // (and not style settings or something else)
  is_scr_props_upd: function is_scr_props_upd(n, prev) {
    var p = prev.find(function (x) {
      return x.v.$uuid === n.v.$uuid;
    });
    if (!p) return false;
    var props = n.p.settings.$props;
    if (!props) return false;
    return props.some(function (x) {
      return n.v[x] !== p.v[x];
    });
  },
  // Checks if it's time to make a script update
  // (based on execInterval in ms)
  delayed_exec: function delayed_exec(v) {
    if (!v.script || !v.script.execInterval) return true;
    var t = this.now();
    var dt = v.script.execInterval;
    if (!v.settings.$last_exec || t > v.settings.$last_exec + dt) {
      v.settings.$last_exec = t;
      return true;
    }
    return false;
  },
  // Format names such 'RSI, $length', where
  // length - is one of the settings
  format_name: function format_name(ov) {
    if (!ov.name) return undefined;
    var name = ov.name;
    for (var k in ov.settings || {}) {
      var val = ov.settings[k];
      var reg = new RegExp("\\$".concat(k), 'g');
      name = name.replace(reg, val);
    }
    return name;
  },
  // Default cursor mode
  xmode: function xmode() {
    return this.is_mobile ? 'explore' : 'default';
  },
  default_prevented: function default_prevented(event) {
    if (event.original) {
      return event.original.defaultPrevented;
    }
    return event.defaultPrevented;
  },
  calculate_data_index_without_ti_map: function calculate_data_index_without_ti_map(array, target, tf) {
    if (tf === void 0) {
      tf = "D";
    }
    var left = 0;
    var right = array.length - 1;
    var found = false;
    var interval_ms = this.detect_interval(array);
    console.log("searchResults", interval_ms);
    var GetValue = function GetValue(i) {
      var _array$i;
      return array === null || array === void 0 || (_array$i = array[i]) === null || _array$i === void 0 ? void 0 : _array$i[0];
    };
    while (left <= right) {
      var mid = Math.floor((left + right) / 2);
      var midTimestamp = GetValue(mid);
      if (midTimestamp === target) {
        return {
          index: mid,
          difference: 0
        }; // Found the target
      } else if (midTimestamp < target) {
        left = mid + 1; // Target is in the right half
      } else {
        right = mid - 1; // Target is in the left half
      }
    }

    var targetDate = new Date(target).toLocaleString();
    // Target not found, determine which side it would be on and calculate the difference
    var side;
    var difference;
    var closeInd;
    var maxInd = Math.max(left, right);
    var minIndex = Math.min(left, right);
    var diffBtwCandles = GetValue(maxInd) - GetValue(minIndex);
    if (target < GetValue(left)) {
      side = 'left';
      // difference = array[left] - target;
      difference = target - GetValue(right);
      closeInd = right;
    } else {
      side = 'right';
      difference = target - GetValue(right);
      closeInd = right;
    }
    var offSetValue = difference / interval_ms;
    var offSetValueBtwCandles = diffBtwCandles / interval_ms;
    var computedIndex = closeInd + offSetValue;
    return {
      targetDate: targetDate,
      index: computedIndex,
      difference: difference,
      offSetValueBtwCandles: offSetValueBtwCandles,
      offSetValue: offSetValue,
      side: side,
      closeInd: closeInd,
      right: right,
      left: left,
      tf: tf
    };
  },
  // WTF with modern web development
  is_mobile: function (w) {
    return 'onorientationchange' in w && (!!navigator.maxTouchPoints || !!navigator.msMaxTouchPoints || 'ontouchstart' in w || w.DocumentTouch && document instanceof w.DocumentTouch);
  }(typeof window !== 'undefined' ? window : {})
});
;// CONCATENATED MODULE: ./src/stuff/math.js
// Math/Geometry

/* harmony default export */ const math = ({
  // Distance from point to line
  // p1 = point, (p2, p3) = line
  point2line: function point2line(p1, p2, p3) {
    var _this$tri = this.tri(p1, p2, p3),
      area = _this$tri.area,
      base = _this$tri.base;
    return Math.abs(this.tri_h(area, base));
  },
  // Distance from point to segment
  // p1 = point, (p2, p3) = segment
  point2seg: function point2seg(p1, p2, p3) {
    var _this$tri2 = this.tri(p1, p2, p3),
      area = _this$tri2.area,
      base = _this$tri2.base;
    // Vector projection
    var proj = this.dot_prod(p1, p2, p3) / base;
    // Distance from left pin
    var l1 = Math.max(-proj, 0);
    // Distance from right pin
    var l2 = Math.max(proj - base, 0);
    // Normal
    var h = Math.abs(this.tri_h(area, base));
    return Math.max(h, l1, l2);
  },
  // Distance from point to ray
  // p1 = point, (p2, p3) = ray
  point2ray: function point2ray(p1, p2, p3) {
    var _this$tri3 = this.tri(p1, p2, p3),
      area = _this$tri3.area,
      base = _this$tri3.base;
    // Vector projection
    var proj = this.dot_prod(p1, p2, p3) / base;
    // Distance from left pin
    var l1 = Math.max(-proj, 0);
    // Normal
    var h = Math.abs(this.tri_h(area, base));
    return Math.max(h, l1);
  },
  tri: function tri(p1, p2, p3) {
    var area = this.area(p1, p2, p3);
    var dx = p3[0] - p2[0];
    var dy = p3[1] - p2[1];
    var base = Math.sqrt(dx * dx + dy * dy);
    return {
      area: area,
      base: base
    };
  },
  /* Area of triangle:
          p1
        /    \
      p2  _  p3
  */
  area: function area(p1, p2, p3) {
    return p1[0] * (p2[1] - p3[1]) + p2[0] * (p3[1] - p1[1]) + p3[0] * (p1[1] - p2[1]);
  },
  // Triangle height
  tri_h: function tri_h(area, base) {
    return area / base;
  },
  // Dot product of (p2, p3) and (p2, p1)
  dot_prod: function dot_prod(p1, p2, p3) {
    var v1 = [p3[0] - p2[0], p3[1] - p2[1]];
    var v2 = [p1[0] - p2[0], p1[1] - p2[1]];
    return v1[0] * v2[0] + v1[1] * v2[1];
  },
  // Symmetrical log
  log: function log(x) {
    // TODO: log for small values
    return Math.sign(x) * Math.log(Math.abs(x) + 1);
  },
  // Symmetrical exp
  exp: function exp(x) {
    return Math.sign(x) * (Math.exp(Math.abs(x)) - 1);
  },
  // Middle line on log scale based on range & px height
  log_mid: function log_mid(r, h) {
    var log_hi = this.log(r[0]);
    var log_lo = this.log(r[1]);
    var px = h / 2;
    var gx = log_hi - px * (log_hi - log_lo) / h;
    return this.exp(gx);
  },
  // Return new adjusted range, based on the previous
  // range, new $_hi, target middle line
  re_range: function re_range(r1, hi2, mid) {
    var log_hi1 = this.log(r1[0]);
    var log_lo1 = this.log(r1[1]);
    var log_hi2 = this.log(hi2);
    var log_$ = this.log(mid);
    var W = (log_hi2 - log_$) * (log_hi1 - log_lo1) / (log_hi1 - log_$);
    return this.exp(log_hi2 - W);
  } // Return new adjusted range, based on the previous
  // range, new $_hi, target middle line + dy (shift)
  // WASTE
  /*range_shift(r1, hi2, mid, dy, h) {
      let log_hi1 = this.log(r1[0])
      let log_lo1 = this.log(r1[1])
      let log_hi2 = this.log(hi2)
      let log_$ = this.log(mid)
        let W = h * (log_hi2 - log_$) /
              (h * (log_hi1 - log_$) / (log_hi1 - log_lo1) + dy)
        return this.exp(log_hi2 - W)
    }*/
});
;// CONCATENATED MODULE: ./src/components/js/layout_fn.js
// Layout functional interface



/* harmony default export */ function layout_fn(self, range) {
  var ib = self.ti_map.ib;
  var dt = range[1] - range[0];
  var r = self.spacex / dt;
  var ls = self.grid.logScale || false;
  Object.assign(self, {
    // Time to screen coordinates
    t2screen: function t2screen(t) {
      if (ib) t = self.ti_map.smth2i(t);
      return Math.floor((t - range[0]) * r) - 0.5;
    },
    // $ to screen coordinates
    $2screen: function $2screen(y) {
      if (ls) y = math.log(y);
      return Math.floor(y * self.A + self.B) - 0.5;
    },
    // Time-axis nearest step
    t_magnet: function t_magnet(t) {
      if (ib) t = self.ti_map.smth2i(t);
      var cn = self.candles || self.master_grid.candles;
      var arr = cn.map(function (x) {
        return x.raw[0];
      });
      var i = utils.nearest_a(t, arr)[0];
      if (!cn[i]) return;
      return Math.floor(cn[i].x) - 0.5;
    },
    // Screen-Y to dollar value (or whatever)
    screen2$: function screen2$(y) {
      if (ls) return math.exp((y - self.B) / self.A);
      return (y - self.B) / self.A;
    },
    // Screen-X to timestamp
    screen2t: function screen2t(x) {
      // TODO: most likely Math.floor not needed
      // return Math.floor(range[0] + x / r)
      return range[0] + x / r;
    },
    // $-axis nearest step
    $_magnet: function $_magnet(price) {},
    // Nearest candlestick
    c_magnet: function c_magnet(t) {
      var cn = self.candles || self.master_grid.candles;
      var arr = cn.map(function (x) {
        return x.raw[0];
      });
      var i = utils.nearest_a(t, arr)[0];
      return cn[i];
    },
    // Nearest data points
    data_magnet: function data_magnet(t) {/* TODO: implement */}
  });
  return self;
}
;// CONCATENATED MODULE: ./src/components/js/log_scale.js
// Log-scale mode helpers

// TODO: all-negative numbers (sometimes wrong scaling)


/* harmony default export */ const log_scale = ({
  candle: function candle(self, mid, p, $p) {
    return {
      x: mid,
      w: self.px_step * $p.config.CANDLEW,
      o: Math.floor(math.log(p[1]) * self.A + self.B),
      h: Math.floor(math.log(p[2]) * self.A + self.B),
      l: Math.floor(math.log(p[3]) * self.A + self.B),
      c: Math.floor(math.log(p[4]) * self.A + self.B),
      raw: p
    };
  },
  expand: function expand(self, height) {
    // expand log scale
    var A = -height / (math.log(self.$_hi) - math.log(self.$_lo));
    var B = -math.log(self.$_hi) * A;
    var top = -height * 0.1;
    var bot = height * 1.1;
    self.$_hi = math.exp((top - B) / A);
    self.$_lo = math.exp((bot - B) / A);
  }
});
;// CONCATENATED MODULE: ./src/components/js/grid_maker.js






var grid_maker_TIMESCALES = constants.TIMESCALES,
  grid_maker_$SCALES = constants.$SCALES,
  grid_maker_WEEK = constants.WEEK,
  grid_maker_MONTH = constants.MONTH,
  grid_maker_YEAR = constants.YEAR,
  grid_maker_HOUR = constants.HOUR,
  grid_maker_DAY = constants.DAY;
var MAX_INT = Number.MAX_SAFE_INTEGER;

// master_grid - ref to the master grid
function GridMaker(id, params, master_grid) {
  if (master_grid === void 0) {
    master_grid = null;
  }
  var sub = params.sub,
    interval = params.interval,
    range = params.range,
    ctx = params.ctx,
    $p = params.$p,
    layers_meta = params.layers_meta,
    height = params.height,
    y_t = params.y_t,
    ti_map = params.ti_map,
    grid = params.grid,
    timezone = params.timezone;
  var self = {
    ti_map: ti_map,
    hideValues: grid.hideValues
  };
  var lm = layers_meta[id];
  var y_range_fn = null;
  var ls = grid.logScale;
  if (lm && Object.keys(lm).length) {
    // Gets last y_range fn()
    var yrs = Object.values(lm).filter(function (x) {
      return x.y_range;
    });
    // The first y_range() determines the range
    if (yrs.length) y_range_fn = yrs[0].y_range;
  }

  // Calc vertical ($/₿) range
  function calc_$range() {
    if (!master_grid) {
      // $ candlestick range
      if (y_range_fn) {
        var _y_range_fn = y_range_fn(hi, lo),
          _y_range_fn2 = _slicedToArray(_y_range_fn, 2),
          hi = _y_range_fn2[0],
          lo = _y_range_fn2[1];
      } else {
        hi = -Infinity, lo = Infinity;
        for (var i = 0, n = sub.length; i < n; i++) {
          var x = sub[i];
          if (x[2] > hi) hi = x[2];
          if (x[3] < lo) lo = x[3];
        }
      }
    } else {
      // Offchart indicator range
      hi = -Infinity, lo = Infinity;
      for (var i = 0; i < sub.length; i++) {
        for (var j = 1; j < sub[i].length; j++) {
          var v = sub[i][j];
          if (v > hi) hi = v;
          if (v < lo) lo = v;
        }
      }
      if (y_range_fn) {
        var _y_range_fn3 = y_range_fn(hi, lo),
          _y_range_fn4 = _slicedToArray(_y_range_fn3, 3),
          hi = _y_range_fn4[0],
          lo = _y_range_fn4[1],
          exp = _y_range_fn4[2];
      }
    }
    // console.log("master_grid",master_grid,y_t)

    // Fixed y-range in non-auto mode
    if (y_t && !y_t.auto && y_t.range) {
      self.$_hi = y_t.range[0];
      self.$_lo = y_t.range[1];
    } else {
      if (!ls) {
        exp = exp === false ? 0 : 1;
        self.$_hi = hi + (hi - lo) * $p.config.EXPAND * exp;
        self.$_lo = lo - (hi - lo) * $p.config.EXPAND * exp;
      } else {
        self.$_hi = hi;
        self.$_lo = lo;
        log_scale.expand(self, height);
      }
      if (self.$_hi === self.$_lo) {
        if (!ls) {
          self.$_hi *= 1.05; // Expand if height range === 0
          self.$_lo *= 0.95;
        } else {
          log_scale.expand(self, height);
        }
      }
    }
  }
  function calc_sidebar() {
    if (sub.length < 2) {
      self.prec = 0;
      self.sb = $p.config.SBMIN;
      return;
    }

    // TODO: improve sidebar width calculation
    // at transition point, when one precision is
    // replaced with another

    // Gets formated levels (their lengths),
    // calculates max and measures the sidebar length
    // from it:

    // TODO: add custom formatter f()

    self.prec = calc_precision(sub);
    var lens = [];
    //lens.push(self.$_hi.toFixed(self.prec).length)
    //lens.push(self.$_lo.toFixed(self.prec).length)
    lens.push(self.$_hi.toFixed(2).length);
    lens.push(self.$_lo.toFixed(2).length);
    var str = '0'.repeat(Math.max.apply(Math, lens)) + '    ';
    self.sb = ctx.measureText(str).width;
    self.sb = Math.max(Math.floor(self.sb), $p.config.SBMIN);
    self.sb = Math.min(self.sb, $p.config.SBMAX);
  }

  // Calculate $ precision for the Y-axis
  function calc_precision(data) {
    var max_r = 0,
      max_l = 0;
    var min = Infinity;
    var max = -Infinity;

    // Speed UP
    for (var i = 0, n = data.length; i < n; i++) {
      var x = data[i];
      if (x[1] > max) max = x[1];else if (x[1] < min) min = x[1];
    }
    // Get max lengths of integer and fractional parts
    [min, max].forEach(function (x) {
      // Fix undefined bug
      var str = x != null ? x.toString() : '';
      if (x < 0.000001) {
        // Parsing the exponential form. Gosh this
        // smells trickily
        var _str$split = str.split('e-'),
          _str$split2 = _slicedToArray(_str$split, 2),
          ls = _str$split2[0],
          rs = _str$split2[1];
        var _ls$split = ls.split('.'),
          _ls$split2 = _slicedToArray(_ls$split, 2),
          l = _ls$split2[0],
          r = _ls$split2[1];
        if (!r) r = '';
        r = {
          length: r.length + parseInt(rs) || 0
        };
      } else {
        var _str$split3 = str.split('.'),
          _str$split4 = _slicedToArray(_str$split3, 2),
          l = _str$split4[0],
          r = _str$split4[1];
      }
      if (r && r.length > max_r) {
        max_r = r.length;
      }
      if (l && l.length > max_l) {
        max_l = l.length;
      }
    });

    // Select precision scheme depending
    // on the left and right part lengths
    //
    var even = max_r - max_r % 2 + 2;
    if (max_l === 1) {
      return Math.min(8, Math.max(2, even));
    }
    if (max_l <= 2) {
      return Math.min(4, Math.max(2, even));
    }
    return 2;
  }
  function calc_positions() {
    if (sub.length < 2) return;
    var dt = range[1] - range[0];

    // A pixel space available to draw on (x-axis)
    self.spacex = $p.width - self.sb;

    // Candle capacity
    var capacity = dt / interval;
    self.px_step = self.spacex / capacity;

    // px / time ratio
    var r = self.spacex / dt;
    self.startx = (sub[0][0] - range[0]) * r;

    // Candle Y-transform: (A = scale, B = shift)
    if (!grid.logScale) {
      self.A = -height / (self.$_hi - self.$_lo);
      self.B = -self.$_hi * self.A;
    } else {
      self.A = -height / (math.log(self.$_hi) - math.log(self.$_lo));
      self.B = -math.log(self.$_hi) * self.A;
    }
  }

  // Select nearest good-loking t step (m is target scale)
  function time_step() {
    var k = ti_map.ib ? 60000 : 1;
    var xrange = (range[1] - range[0]) * k;
    var m = xrange * ($p.config.GRIDX / $p.width);
    var s = grid_maker_TIMESCALES;
    return utils.nearest_a(m, s)[1] / k;
  }

  // Select nearest good-loking $ step (m is target scale)
  function dollar_step() {
    var yrange = self.$_hi - self.$_lo;
    var m = yrange * ($p.config.GRIDY / height);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    var d = Math.pow(10, p);
    var s = grid_maker_$SCALES.map(function (x) {
      return x * d;
    });

    // TODO: center the range (look at RSI for example,
    // it looks ugly when "80" is near the top)
    return utils.strip(utils.nearest_a(m, s)[1]);
  }
  function dollar_mult() {
    var mult_hi = dollar_mult_hi();
    var mult_lo = dollar_mult_lo();
    return Math.max(mult_hi, mult_lo);
  }

  // Price step multiplier (for the log-scale mode)
  function dollar_mult_hi() {
    var h = Math.min(self.B, height);
    if (h < $p.config.GRIDY) return 1;
    var n = h / $p.config.GRIDY; // target grid N
    var yrange = self.$_hi;
    if (self.$_lo > 0) {
      var yratio = self.$_hi / self.$_lo;
    } else {
      yratio = self.$_hi / 1; // TODO: small values
    }

    var m = yrange * ($p.config.GRIDY / h);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    return Math.pow(yratio, 1 / n);
  }
  function dollar_mult_lo() {
    var h = Math.min(height - self.B, height);
    if (h < $p.config.GRIDY) return 1;
    var n = h / $p.config.GRIDY; // target grid N
    var yrange = Math.abs(self.$_lo);
    if (self.$_hi < 0 && self.$_lo < 0) {
      var yratio = Math.abs(self.$_lo / self.$_hi);
    } else {
      yratio = Math.abs(self.$_lo) / 1;
    }
    var m = yrange * ($p.config.GRIDY / h);
    var p = parseInt(yrange.toExponential().split('e')[1]);
    return Math.pow(yratio, 1 / n);
  }
  function grid_x() {
    // If this is a subgrid, no need to calc a timeline,
    // we just borrow it from the master_grid
    if (!master_grid) {
      self.t_step = time_step();
      self.xs = [];
      var dt = range[1] - range[0];
      var r = self.spacex / dt;

      /* TODO: remove the left-side glitch
        let year_0 = Utils.get_year(sub[0][0])
      for (var t0 = year_0; t0 < range[0]; t0 += self.t_step) {}
        let m0 = Utils.get_month(t0)*/

      for (var i = 0; i < sub.length; i++) {
        var p = sub[i];
        var prev = sub[i - 1] || [];
        var prev_xs = self.xs[self.xs.length - 1] || [0, []];
        var x = Math.floor((p[0] - range[0]) * r);
        insert_line(prev, p, x);

        // Filtering lines that are too near
        var xs = self.xs[self.xs.length - 1] || [0, []];
        if (prev_xs === xs) continue;
        if (xs[1][0] - prev_xs[1][0] < self.t_step * 0.8) {
          // prev_xs is a higher "rank" label
          if (xs[2] <= prev_xs[2]) {
            self.xs.pop();
          } else {
            // Otherwise
            self.xs.splice(self.xs.length - 2, 1);
          }
        }
      }

      // TODO: fix grid extension for bigger timeframes
      if (interval < grid_maker_WEEK && r > 0) {
        extend_left(dt, r);
        extend_right(dt, r);
      }
    } else {
      self.t_step = master_grid.t_step;
      self.px_step = master_grid.px_step;
      self.startx = master_grid.startx;
      self.xs = master_grid.xs;
    }
  }
  function insert_line(prev, p, x, m0) {
    var prev_t = ti_map.ib ? ti_map.i2t(prev[0]) : prev[0];
    var p_t = ti_map.ib ? ti_map.i2t(p[0]) : p[0];
    if (ti_map.tf < grid_maker_DAY) {
      prev_t += timezone * grid_maker_HOUR;
      p_t += timezone * grid_maker_HOUR;
    }
    var d = timezone * grid_maker_HOUR;

    // TODO: take this block =========> (see below)
    if ((prev[0] || interval === grid_maker_YEAR) && utils.get_year(p_t) !== utils.get_year(prev_t)) {
      self.xs.push([x, p, grid_maker_YEAR]); // [px, [...], rank]
    } else if (prev[0] && utils.get_month(p_t) !== utils.get_month(prev_t)) {
      self.xs.push([x, p, grid_maker_MONTH]);
    }
    // TODO: should be added if this day !== prev day
    // And the same for 'botbar.js', TODO(*)
    else if (utils.day_start(p_t) === p_t) {
      self.xs.push([x, p, grid_maker_DAY]);
    } else if (p[0] % self.t_step === 0) {
      self.xs.push([x, p, interval]);
    }
  }
  function extend_left(dt, r) {
    if (!self.xs.length || !isFinite(r)) return;
    var t = self.xs[0][1][0];
    while (true) {
      t -= self.t_step;
      var x = Math.floor((t - range[0]) * r);
      if (x < 0) break;
      // TODO: ==========> And insert it here somehow
      if (t % interval === 0) {
        self.xs.unshift([x, [t], interval]);
      }
    }
  }
  function extend_right(dt, r) {
    if (!self.xs.length || !isFinite(r)) return;
    var t = self.xs[self.xs.length - 1][1][0];
    while (true) {
      t += self.t_step;
      var x = Math.floor((t - range[0]) * r);
      if (x > self.spacex) break;
      if (t % interval === 0) {
        self.xs.push([x, [t], interval]);
      }
    }
  }
  function grid_y() {
    // Prevent duplicate levels
    var m = Math.pow(10, -self.prec);
    self.$_step = Math.max(m, dollar_step());
    self.ys = [];
    var y1 = self.$_lo - self.$_lo % self.$_step;
    for (var y$ = y1; y$ <= self.$_hi; y$ += self.$_step) {
      var y = Math.floor(y$ * self.A + self.B);
      if (y > height) continue;
      if (!self.hideValues) self.ys.push([y, utils.strip(y$)]);
    }
  }
  function grid_y_log() {
    // TODO: Prevent duplicate levels, is this even
    // a problem here ?
    self.$_mult = dollar_mult();
    self.ys = [];
    if (!sub.length) return;
    var v = Math.abs(sub[sub.length - 1][1] || 1);
    var y1 = search_start_pos(v);
    var y2 = search_start_neg(-v);
    var yp = -Infinity; // Previous y value
    var n = height / $p.config.GRIDY; // target grid N

    var q = 1 + (self.$_mult - 1) / 2;

    // Over 0
    for (var y$ = y1; y$ > 0; y$ /= self.$_mult) {
      y$ = log_rounder(y$, q);
      var y = Math.floor(math.log(y$) * self.A + self.B);
      self.ys.push([y, utils.strip(y$)]);
      if (y > height) break;
      if (y - yp < $p.config.GRIDY * 0.7) break;
      if (self.ys.length > n + 1) break;
      yp = y;
    }

    // Under 0
    yp = Infinity;
    for (var y$ = y2; y$ < 0; y$ /= self.$_mult) {
      y$ = log_rounder(y$, q);
      var _y = Math.floor(math.log(y$) * self.A + self.B);
      if (yp - _y < $p.config.GRIDY * 0.7) break;
      self.ys.push([_y, utils.strip(y$)]);
      if (_y < 0) break;
      if (self.ys.length > n * 3 + 1) break;
      yp = _y;
    }

    // TODO: remove lines near to 0
  }

  // Search a start for the top grid so that
  // the fixed value always included
  function search_start_pos(value) {
    var N = height / $p.config.GRIDY; // target grid N
    var y = Infinity,
      y$ = value,
      count = 0;
    while (y > 0) {
      y = Math.floor(math.log(y$) * self.A + self.B);
      y$ *= self.$_mult;
      if (count++ > N * 3) return 0; // Prevents deadloops
    }

    return y$;
  }
  function search_start_neg(value) {
    var N = height / $p.config.GRIDY; // target grid N
    var y = -Infinity,
      y$ = value,
      count = 0;
    while (y < height) {
      y = Math.floor(math.log(y$) * self.A + self.B);
      y$ *= self.$_mult;
      if (count++ > N * 3) break; // Prevents deadloops
    }

    return y$;
  }

  // Make log scale levels look great again
  function log_rounder(x, quality) {
    var s = Math.sign(x);
    x = Math.abs(x);
    if (x > 10) {
      for (var div = 10; div < MAX_INT; div *= 10) {
        var nice = Math.floor(x / div) * div;
        if (x / nice > quality) {
          // More than 10% off
          break;
        }
      }
      div /= 10;
      return s * Math.floor(x / div) * div;
    } else if (x < 1) {
      for (var ro = 10; ro >= 1; ro--) {
        var _nice = utils.round(x, ro);
        if (x / _nice > quality) {
          // More than 10% off
          break;
        }
      }
      return s * utils.round(x, ro + 1);
    } else {
      return s * Math.floor(x);
    }
  }
  function apply_sizes() {
    self.width = $p.width - self.sb;
    self.height = height;
  }
  calc_$range();
  calc_sidebar();
  return {
    // First we need to calculate max sidebar width
    // (among all grids). Then we can actually make
    // them
    create: function create() {
      calc_positions();
      grid_x();
      if (grid.logScale) {
        grid_y_log();
      } else {
        grid_y();
      }
      apply_sizes();

      // Link to the master grid (candlesticks)
      if (master_grid) {
        self.master_grid = master_grid;
      }
      self.grid = grid; // Grid params

      // Here we add some helpful functions for
      // plugin creators
      return layout_fn(self, range);
    },
    get_layout: function get_layout() {
      return self;
    },
    set_sidebar: function set_sidebar(v) {
      return self.sb = v;
    },
    get_sidebar: function get_sidebar() {
      return self.sb;
    }
  };
}
/* harmony default export */ const grid_maker = (GridMaker);
;// CONCATENATED MODULE: ./src/components/js/layout.js


function _createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = layout_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function layout_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return layout_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return layout_arrayLikeToArray(o, minLen); }
function layout_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Calculates all necessary s*it to build the chart
// Heights, widths, transforms, ... = everything
// Why such a mess you ask? Well, that's because
// one components size can depend on other component
// data formatting (e.g. grid width depends on sidebar precision)
// So it's better to calc all in one place.





function Layout(params) {
  var chart = params.chart,
    sub = params.sub,
    offsub = params.offsub,
    interval = params.interval,
    range = params.range,
    ctx = params.ctx,
    layers_meta = params.layers_meta,
    ti_map = params.ti_map,
    $p = params.$props,
    y_ts = params.y_transforms;
  var mgrid = chart.grid || {};
  offsub = offsub.filter(function (x, i) {
    // Skip offchart overlays with custom grid id,
    // because they will be mergred with the existing grids
    return !(x.grid && x.grid.id);
  });

  // Splits space between main chart
  // and offchart indicator grids
  function grid_hs() {
    var height = $p.height - $p.config.BOTBAR;

    // When at least one height defined (default = 1),
    // Pxs calculated as: (sum of weights) / number
    if (mgrid.height || offsub.find(function (x) {
      return x.grid.height;
    })) {
      return weighted_hs(mgrid, height);
    }
    var n = offsub.length;
    var off_h = 2 * Math.sqrt(n) / 7 / (n || 1);

    // Offchart grid height
    var px = Math.floor(height * off_h);

    // Main grid height
    var m = height - px * n;
    return [m].concat(Array(n).fill(px));
  }
  function weighted_hs(grid, height) {
    var hs = [{
      grid: grid
    }].concat(_toConsumableArray(offsub)).map(function (x) {
      return x.grid.height || 1;
    });
    var sum = hs.reduce(function (a, b) {
      return a + b;
    }, 0);
    hs = hs.map(function (x) {
      return Math.floor(x / sum * height);
    });

    // Refine the height if Math.floor decreased px sum
    sum = hs.reduce(function (a, b) {
      return a + b;
    }, 0);
    for (var i = 0; i < height - sum; i++) hs[i % hs.length]++;
    return hs;
  }
  function candles_n_vol() {
    self.candles = [];
    self.volume = [];
    var maxv = Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
      return x[5];
    })));
    var vs = $p.config.VOLSCALE * $p.height / maxv;
    var x1,
      x2,
      mid,
      prev = undefined;
    var splitter = self.px_step > 5 ? 1 : 0;
    var hf_px_step = self.px_step * 0.5;
    for (var i = 0; i < sub.length; i++) {
      var p = sub[i];
      mid = self.t2screen(p[0]) + 0.5;
      self.candles.push(mgrid.logScale ? log_scale.candle(self, mid, p, $p) : {
        x: mid,
        w: self.px_step * $p.config.CANDLEW,
        o: Math.floor(p[1] * self.A + self.B),
        h: Math.floor(p[2] * self.A + self.B),
        l: Math.floor(p[3] * self.A + self.B),
        c: Math.floor(p[4] * self.A + self.B),
        raw: p
      });
      // Clear volume bar if there is a time gap
      if (sub[i - 1] && p[0] - sub[i - 1][0] > interval) {
        prev = null;
      }
      x1 = prev || Math.floor(mid - hf_px_step);
      x2 = Math.floor(mid + hf_px_step) - 0.5;
      self.volume.push({
        x1: x1,
        x2: x2,
        h: p[5] * vs,
        green: p[4] >= p[1],
        raw: p
      });
      prev = x2 + splitter;
    }
  }

  // Main grid
  var hs = grid_hs();
  var specs = {
    sub: sub,
    interval: interval,
    range: range,
    ctx: ctx,
    $p: $p,
    layers_meta: layers_meta,
    ti_map: ti_map,
    height: hs[0],
    y_t: y_ts[0],
    grid: mgrid,
    timezone: $p.timezone
  };
  var gms = [new grid_maker(0, specs)];

  // Sub grids
  var _iterator = _createForOfIteratorHelper(offsub.entries()),
    _step;
  try {
    for (_iterator.s(); !(_step = _iterator.n()).done;) {
      var _step$value = _slicedToArray(_step.value, 2),
        i = _step$value[0],
        _step$value$ = _step$value[1],
        data = _step$value$.data,
        grid = _step$value$.grid;
      specs.sub = data;
      specs.height = hs[i + 1];
      specs.y_t = y_ts[i + 1];
      specs.grid = grid || {};
      gms.push(new grid_maker(i + 1, specs, gms[0].get_layout()));
    }

    // Max sidebar among all grinds
  } catch (err) {
    _iterator.e(err);
  } finally {
    _iterator.f();
  }
  var sb = Math.max.apply(Math, _toConsumableArray(gms.map(function (x) {
    return x.get_sidebar();
  })));
  var grids = [],
    offset = 0;
  for (i = 0; i < gms.length; i++) {
    gms[i].set_sidebar(sb);
    grids.push(gms[i].create());
    grids[i].id = i;
    grids[i].offset = offset;
    offset += grids[i].height;
  }
  var self = grids[0];
  candles_n_vol();
  return {
    grids: grids,
    botbar: {
      width: $p.width,
      height: $p.config.BOTBAR,
      offset: offset,
      xs: grids[0] ? grids[0].xs : []
    }
  };
}
/* harmony default export */ const layout = (Layout);
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/classCallCheck.js
function classCallCheck_classCallCheck(instance, Constructor) {
  if (!(instance instanceof Constructor)) {
    throw new TypeError("Cannot call a class as a function");
  }
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/typeof.js
function typeof_typeof(o) {
  "@babel/helpers - typeof";

  return typeof_typeof = "function" == typeof Symbol && "symbol" == typeof Symbol.iterator ? function (o) {
    return typeof o;
  } : function (o) {
    return o && "function" == typeof Symbol && o.constructor === Symbol && o !== Symbol.prototype ? "symbol" : typeof o;
  }, typeof_typeof(o);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/toPrimitive.js

function _toPrimitive(input, hint) {
  if (typeof_typeof(input) !== "object" || input === null) return input;
  var prim = input[Symbol.toPrimitive];
  if (prim !== undefined) {
    var res = prim.call(input, hint || "default");
    if (typeof_typeof(res) !== "object") return res;
    throw new TypeError("@@toPrimitive must return a primitive value.");
  }
  return (hint === "string" ? String : Number)(input);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/toPropertyKey.js


function _toPropertyKey(arg) {
  var key = _toPrimitive(arg, "string");
  return typeof_typeof(key) === "symbol" ? key : String(key);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/createClass.js

function _defineProperties(target, props) {
  for (var i = 0; i < props.length; i++) {
    var descriptor = props[i];
    descriptor.enumerable = descriptor.enumerable || false;
    descriptor.configurable = true;
    if ("value" in descriptor) descriptor.writable = true;
    Object.defineProperty(target, _toPropertyKey(descriptor.key), descriptor);
  }
}
function createClass_createClass(Constructor, protoProps, staticProps) {
  if (protoProps) _defineProperties(Constructor.prototype, protoProps);
  if (staticProps) _defineProperties(Constructor, staticProps);
  Object.defineProperty(Constructor, "prototype", {
    writable: false
  });
  return Constructor;
}
;// CONCATENATED MODULE: ./src/components/js/updater.js



function updater_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = updater_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function updater_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return updater_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return updater_arrayLikeToArray(o, minLen); }
function updater_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Cursor updater: calculates current values for
// OHLCV and all other indicators


var CursorUpdater = /*#__PURE__*/function () {
  function CursorUpdater(comp) {
    classCallCheck_classCallCheck(this, CursorUpdater);
    this.comp = comp, this.grids = comp._layout.grids, this.cursor = comp.cursor;
  }
  createClass_createClass(CursorUpdater, [{
    key: "sync",
    value: function sync(e) {
      // TODO: values not displaying if a custom grid id is set:
      // grid: { id: N }
      this.cursor.grid_id = e.grid_id;
      var once = true;
      var _iterator = updater_createForOfIteratorHelper(this.grids),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var grid = _step.value;
          var c = this.cursor_data(grid, e);
          if (!this.cursor.locked) {
            // TODO: find a better fix to invisible cursor prob
            if (once) {
              this.cursor.t = this.cursor_time(grid, e, c);
              if (this.cursor.t) once = false;
            }
            if (c.values) {
              this.comp.$set(this.cursor.values, grid.id, c.values);
            }
          }
          if (grid.id !== e.grid_id) continue;
          this.cursor.x = grid.t2screen(this.cursor.t);
          this.cursor.y = c.y;
          this.cursor.y$ = c.y$;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }
  }, {
    key: "overlay_data",
    value: function overlay_data(grid, e) {
      var s = grid.id === 0 ? 'main_section' : 'sub_section';
      var data = this.comp[s].data;

      // Split offchart data between offchart grids
      if (grid.id > 0) {
        // Sequential grids
        var _d = data.filter(function (x) {
          return x.grid.id === undefined;
        });
        // grids with custom ids (for merging)
        var m = data.filter(function (x) {
          return x.grid.id === grid.id;
        });
        data = [_d[grid.id - 1]].concat(_toConsumableArray(m));
      }
      var t = grid.screen2t(e.x);
      var ids = {},
        res = {};
      var _iterator2 = updater_createForOfIteratorHelper(data),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var d = _step2.value;
          var ts = d.data.map(function (x) {
            return x[0];
          });
          var i = utils.nearest_a(t, ts)[0];
          d.type in ids ? ids[d.type]++ : ids[d.type] = 0;
          res["".concat(d.type, "_").concat(ids[d.type])] = d.data[i];
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      return res;
    }

    // Nearest datapoints
  }, {
    key: "cursor_data",
    value: function cursor_data(grid, e) {
      var data = this.comp.main_section.sub;
      var xs = data.map(function (x) {
        return grid.t2screen(x[0]) + 0.5;
      });
      var i = utils.nearest_a(e.x, xs)[0];
      if (!xs[i]) return {};
      return {
        x: Math.floor(xs[i]) - 0.5,
        y: Math.floor(e.y - 2) - 0.5 - grid.offset,
        y$: grid.screen2$(e.y - 2 - grid.offset),
        t: (data[i] || [])[0],
        values: Object.assign({
          ohlcv: grid.id === 0 ? data[i] : undefined
        }, this.overlay_data(grid, e))
      };
    }

    // Get cursor t-position (extended)
  }, {
    key: "cursor_time",
    value: function cursor_time(grid, mouse, candle) {
      var t = grid.screen2t(mouse.x);
      var r = Math.abs((t - candle.t) / this.comp.interval);
      var sign = Math.sign(t - candle.t);
      if (r >= 0.5) {
        // Outside the data range
        var n = Math.round(r);
        return candle.t + n * this.comp.interval * sign;
      }
      // Inside the data range
      return candle.t;
    }
  }]);
  return CursorUpdater;
}();
/* harmony default export */ const updater = (CursorUpdater);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=template&id=e10036a2&
var Sectionvue_type_template_id_e10036a2_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "trading-vue-section"
  }, [_c("chart-legend", {
    ref: "legend",
    attrs: {
      values: _vm.section_values,
      decimalPlace: _vm.decimalPlace,
      legendDecimal: _vm.legendDecimal,
      grid_id: _vm.grid_id,
      common: _vm.legend_props,
      meta_props: _vm.get_meta_props
    },
    on: {
      "legend-button-click": _vm.button_click
    }
  }), _vm._v(" "), _c("grid", _vm._b({
    ref: "grid",
    attrs: {
      grid_id: _vm.grid_id,
      enableZoom: _vm.enableZoom,
      decimalPlace: _vm.decimalPlace,
      priceLine: _vm.priceLine,
      enableCrosshair: _vm.enableCrosshair
    },
    on: {
      "register-kb-listener": _vm.register_kb,
      "remove-kb-listener": _vm.remove_kb,
      "range-changed": _vm.range_changed,
      "cursor-changed": _vm.cursor_changed,
      "cursor-locked": _vm.cursor_locked,
      "layer-meta-props": _vm.emit_meta_props,
      "custom-event": _vm.emit_custom_event,
      "sidebar-transform": _vm.sidebar_transform,
      "rezoom-range": _vm.rezoom_range
    }
  }, "grid", _vm.grid_props, false)), _vm._v(" "), _c("sidebar", _vm._b({
    ref: "sb-" + _vm.grid_id,
    attrs: {
      grid_id: _vm.grid_id,
      rerender: _vm.rerender,
      decimalPlace: _vm.decimalPlace,
      roundOffVolume: _vm.roundOffVolume,
      common: _vm.common,
      applyShaders: _vm.applyShaders,
      enableSideBarBoxValue: _vm.enableSideBarBoxValue
    },
    on: {
      "sidebar-transform": _vm.sidebar_transform
    }
  }, "sidebar", _vm.sidebar_props, false))], 1);
};
var Sectionvue_type_template_id_e10036a2_staticRenderFns = [];
Sectionvue_type_template_id_e10036a2_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=template&id=e10036a2&

;// CONCATENATED MODULE: ./src/stuff/frame.js


// Annimation frame with a fallback for
// slower devices


var FrameAnimation = /*#__PURE__*/function () {
  function FrameAnimation(cb) {
    var _this = this;
    classCallCheck_classCallCheck(this, FrameAnimation);
    this.t0 = this.t = utils.now();
    this.id = setInterval(function () {
      // The prev frame took too long
      if (utils.now() - _this.t > 100) return;
      if (utils.now() - _this.t0 > 1200) {
        _this.stop();
      }
      if (_this.id) cb(_this);
      _this.t = utils.now();
    }, 16);
  }
  createClass_createClass(FrameAnimation, [{
    key: "stop",
    value: function stop() {
      clearInterval(this.id);
      this.id = null;
    }
  }]);
  return FrameAnimation;
}();

// EXTERNAL MODULE: ./node_modules/hammerjs/hammer.js
var hammer = __webpack_require__(840);
// EXTERNAL MODULE: ./node_modules/hamsterjs/hamster.js
var hamster = __webpack_require__(981);
var hamster_default = /*#__PURE__*/__webpack_require__.n(hamster);
;// CONCATENATED MODULE: ./src/components/js/grid.js




function grid_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = grid_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function grid_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return grid_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return grid_arrayLikeToArray(o, minLen); }
function grid_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Grid.js listens to various user-generated events,
// emits Vue-events if something has changed (e.g. range)
// Think of it as an I/O system for Grid.vue







// Grid is good.
var Grid = /*#__PURE__*/function () {
  function Grid(canvas, comp) {
    classCallCheck_classCallCheck(this, Grid);
    this.MIN_ZOOM = comp.config.MIN_ZOOM;
    this.MAX_ZOOM = comp.config.MAX_ZOOM;
    if (utils.is_mobile) this.MIN_ZOOM *= 0.5;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this.range = this.$p.range;
    this.id = this.$p.grid_id;
    this.layout = this.$p.layout.grids[this.id];
    console.log("this.layout.grid", this.layout);
    this.interval = this.$p.interval;
    this.cursor = comp.$props.cursor;
    this.offset_x = 0;
    this.offset_y = 0;
    this.deltas = 0; // Wheel delta events
    this.wmode = this.$p.config.SCROLL_WHEEL;
    // if (this.$p.enableZoom) {
    this.listeners();
    // }
    this.overlays = [];
  }
  createClass_createClass(Grid, [{
    key: "listeners",
    value: function listeners() {
      var _this = this;
      //console.log(this.$p.enableZoom);
      this.hm = hamster_default()(this.canvas);
      if (this.$p.enableZoom) {
        this.hm.wheel(function (event, delta) {
          return _this.mousezoom(-delta * 50, event);
        });
      }
      var mc = this.mc = new hammer.Manager(this.canvas);
      var T = utils.is_mobile ? 10 : 0;
      mc.add(new hammer.Pan({
        threshold: T
      }));
      mc.add(new hammer.Tap());
      mc.add(new hammer.Pinch({
        threshold: 0
      }));
      mc.get("pinch").set({
        enable: true
      });
      if (utils.is_mobile) mc.add(new hammer.Press());
      mc.on("panstart", function (event) {
        if (_this.cursor.scroll_lock) return;
        if (_this.cursor.mode === "aim") {
          return _this.emit_cursor_coord(event);
        }
        var tfrm = _this.$p.y_transform;
        _this.drug = {
          x: event.center.x + _this.offset_x,
          y: event.center.y + _this.offset_y,
          r: _this.range.slice(),
          t: _this.range[1] - _this.range[0],
          o: tfrm ? tfrm.offset || 0 : 0,
          y_r: tfrm && tfrm.range ? tfrm.range.slice() : undefined,
          B: _this.layout.B,
          t0: utils.now()
        };
        _this.comp.$emit("cursor-changed", {
          grid_id: _this.id,
          x: event.center.x + _this.offset_x,
          y: event.center.y + _this.offset_y
        });
        _this.comp.$emit("cursor-locked", true);
      });
      mc.on("panmove", function (event) {
        if (utils.is_mobile) {
          console.log("panmove event mobile");
          _this.calc_offset();
          _this.propagate("mousemove", _this.touch2mouse(event));
        }
        if (_this.drug) {
          if (_this.$p.enableZoom) {
            console.log("panmove event if block");
            _this.mousedrag(_this.drug.x + event.deltaX, _this.drug.y + event.deltaY);
            _this.comp.$emit("cursor-changed", {
              grid_id: _this.id,
              x: event.center.x + _this.offset_x,
              y: event.center.y + _this.offset_y
            });
          }
        } else if (_this.cursor.mode === "aim") {
          _this.emit_cursor_coord(event);
        }
      });
      mc.on("panend", function (event) {
        if (utils.is_mobile && _this.drug) {
          _this.pan_fade(event);
        }
        _this.drug = null;
        _this.comp.$emit("cursor-locked", false);
      });
      mc.on("tap", function (event) {
        if (!utils.is_mobile) return;
        _this.sim_mousedown(event);
        if (_this.fade) _this.fade.stop();
        _this.comp.$emit("cursor-changed", {});
        _this.comp.$emit("cursor-changed", {
          /*grid_id: this.id,
                  x: undefined,//event.center.x + this.offset_x,
                  y: undefined,//event.center.y + this.offset_y,*/
          mode: "explore"
        });
        _this.update();
      });
      mc.on("pinchstart", function () {
        _this.drug = null;
        _this.pinch = {
          t: _this.range[1] - _this.range[0],
          r: _this.range.slice()
        };
      });
      mc.on("pinchend", function () {
        _this.pinch = null;
      });
      mc.on("pinch", function (event) {
        if (_this.$p.enableZoom) {
          if (_this.pinch) _this.pinchzoom(event.scale);
        }
      });
      mc.on("press", function (event) {
        if (!utils.is_mobile) return;
        if (_this.fade) _this.fade.stop();
        _this.calc_offset();
        _this.emit_cursor_coord(event, {
          mode: "aim"
        });
        setTimeout(function () {
          return _this.update();
        });
        _this.sim_mousedown(event);
      });
      var add = addEventListener;
      add("gesturestart", this.gesturestart);
      add("gesturechange", this.gesturechange);
      add("gestureend", this.gestureend);
    }
  }, {
    key: "gesturestart",
    value: function gesturestart(event) {
      event.preventDefault();
    }
  }, {
    key: "gesturechange",
    value: function gesturechange(event) {
      event.preventDefault();
    }
  }, {
    key: "gestureend",
    value: function gestureend(event) {
      event.preventDefault();
    }
  }, {
    key: "mousemove",
    value: function mousemove(event) {
      if (utils.is_mobile) return;
      this.comp.$emit("cursor-changed", {
        grid_id: this.id,
        x: event.layerX,
        y: event.layerY + this.layout.offset
      });
      this.calc_offset();
      this.propagate("mousemove", event);
    }
  }, {
    key: "mouseout",
    value: function mouseout(event) {
      if (utils.is_mobile) return;
      this.comp.$emit("cursor-changed", {});
      this.propagate("mouseout", event);
    }
  }, {
    key: "mouseup",
    value: function mouseup(event) {
      this.drug = null;
      this.comp.$emit("cursor-locked", false);
      this.propagate("mouseup", event);
    }
  }, {
    key: "mousedown",
    value: function mousedown(event) {
      if (utils.is_mobile) return;
      this.propagate("mousedown", event);
      this.comp.$emit("cursor-locked", true);
      if (event.defaultPrevented) return;
      this.comp.$emit("custom-event", {
        event: "grid-mousedown",
        args: [this.id, event]
      });
    }

    // Simulated mousedown (for mobile)
  }, {
    key: "sim_mousedown",
    value: function sim_mousedown(event) {
      var _this2 = this;
      if (event.srcEvent.defaultPrevented) return;
      this.comp.$emit("custom-event", {
        event: "grid-mousedown",
        args: [this.id, event]
      });
      this.propagate("mousemove", this.touch2mouse(event));
      this.update();
      this.propagate("mousedown", this.touch2mouse(event));
      setTimeout(function () {
        _this2.propagate("click", _this2.touch2mouse(event));
      });
    }

    // Convert touch to "mouse" event
  }, {
    key: "touch2mouse",
    value: function touch2mouse(e) {
      this.calc_offset();
      return {
        original: e.srcEvent,
        layerX: e.center.x + this.offset_x,
        layerY: e.center.y + this.offset_y,
        preventDefault: function preventDefault() {
          this.original.preventDefault();
        }
      };
    }
  }, {
    key: "click",
    value: function click(event) {
      this.propagate("click", event);
    }
  }, {
    key: "emit_cursor_coord",
    value: function emit_cursor_coord(event, add) {
      if (add === void 0) {
        add = {};
      }
      this.comp.$emit("cursor-changed", Object.assign({
        grid_id: this.id,
        x: event.center.x + this.offset_x,
        y: event.center.y + this.offset_y + this.layout.offset
      }, add));
    }
  }, {
    key: "pan_fade",
    value: function pan_fade(event) {
      var _this3 = this;
      var dt = utils.now() - this.drug.t0;
      var dx = this.range[1] - this.drug.r[1];
      var v = 42 * dx / dt;
      var v0 = Math.abs(v * 0.01);
      if (dt > 500) return;
      if (this.fade) this.fade.stop();
      this.fade = new FrameAnimation(function (self) {
        v *= 0.85;
        if (Math.abs(v) < v0) {
          self.stop();
        }
        _this3.range[0] += v;
        _this3.range[1] += v;
        _this3.change_range();
      });
    }
  }, {
    key: "calc_offset",
    value: function calc_offset() {
      var rect = this.canvas.getBoundingClientRect();
      this.offset_x = -rect.x;
      this.offset_y = -rect.y;
    }
  }, {
    key: "new_layer",
    value: function new_layer(layer) {
      if (layer.name === "crosshair") {
        this.crosshair = layer;
      } else {
        console.log("layer==>", layer);
        this.overlays.push(layer);
      }
      this.update();
    }
  }, {
    key: "del_layer",
    value: function del_layer(id) {
      this.overlays = this.overlays.filter(function (x) {
        return x.id !== id;
      });
      this.update();
    }
  }, {
    key: "show_hide_layer",
    value: function show_hide_layer(event) {
      var l = this.overlays.filter(function (x) {
        return x.id === event.id;
      });
      if (l.length) l[0].display = event.display;
    }
  }, {
    key: "update",
    value: function update() {
      var _this4 = this;
      // Update reference to the grid
      // TODO: check what happens if data changes interval
      this.layout = this.$p.layout.grids[this.id];
      // console.log("this.layout update",this.layout)
      // console.log("this.layout",this.layout)
      this.interval = this.$p.interval;
      if (!this.layout) return;
      this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      if (this.$p.shaders.length) this.apply_shaders();
      this.grid();
      var overlays = [];
      overlays.push.apply(overlays, _toConsumableArray(this.overlays));

      // z-index sorting
      overlays.sort(function (l1, l2) {
        return l1.z - l2.z;
      });
      overlays.forEach(function (l) {
        if (!l.display) return;
        _this4.ctx.save();
        var r = l.renderer;
        if (r.pre_draw) r.pre_draw(_this4.ctx);
        r.draw(_this4.ctx);
        if (r.post_draw) r.post_draw(_this4.ctx);
        _this4.ctx.restore();
      });

      // console.log("overlay==>",this.overlays[0]?.name)

      if (this.crosshair) {
        this.crosshair.renderer.draw(this.ctx);
      }
    }
  }, {
    key: "apply_shaders",
    value: function apply_shaders() {
      var layout = this.$p.layout.grids[this.id];
      var props = {
        layout: layout,
        range: this.range,
        interval: this.interval,
        tf: layout.ti_map.tf,
        cursor: this.cursor,
        colors: this.$p.colors,
        sub: this.data,
        font: this.$p.font,
        config: this.$p.config,
        meta: this.$p.meta
      };
      var _iterator = grid_createForOfIteratorHelper(this.$p.shaders),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var s = _step.value;
          this.ctx.save();
          s.draw(this.ctx, props);
          this.ctx.restore();
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }

    // Actually draws the grid (for real)
  }, {
    key: "grid",
    value: function grid() {
      this.ctx.strokeStyle = this.$p.colors.grid;
      this.ctx.beginPath();
      var ymax = this.layout.height;
      // for (var [x, p] of this.layout.xs) {
      //
      //     this.ctx.moveTo(x - 0.5, 0)
      //     this.ctx.lineTo(x - 0.5, ymax)
      //
      // }
      var _iterator2 = grid_createForOfIteratorHelper(this.layout.ys),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var _step2$value = _slicedToArray(_step2.value, 2),
            y = _step2$value[0],
            y$ = _step2$value[1];
          this.ctx.moveTo(0, y - 0.5);
          this.ctx.lineTo(this.layout.width, y - 0.5);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      this.ctx.stroke();
      if (this.$p.grid_id) this.upper_border();
    }
  }, {
    key: "upper_border",
    value: function upper_border() {
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(this.layout.width, 0.5);
      this.ctx.stroke();
    }
  }, {
    key: "mousezoom",
    value: function mousezoom(delta, event) {
      // TODO: for mobile
      if (this.wmode !== "pass") {
        if (this.wmode === "click" && !this.$p.meta.activated) {
          return;
        }
        event.originalEvent.preventDefault();
        event.preventDefault();
      }
      event.deltaX = event.deltaX || utils.get_deltaX(event);
      event.deltaY = event.deltaY || utils.get_deltaY(event);
      if (Math.abs(event.deltaX) > 0) {
        this.trackpad = true;
        if (Math.abs(event.deltaX) >= Math.abs(event.deltaY)) {
          delta *= 0.1;
        }
        this.trackpad_scroll(event);
      }
      if (this.trackpad) delta *= 0.032;
      delta = utils.smart_wheel(delta);

      // TODO: mouse zooming is a little jerky,
      // needs to follow f(mouse_wheel_speed) and
      // if speed is low, scroll shoud be slower
      if (delta < 0 && this.data.length <= this.MIN_ZOOM) return;
      if (delta > 0 && this.data.length > this.MAX_ZOOM) return;
      var k = this.interval / 1000;
      var diff = delta * k * this.data.length;
      var tl = this.comp.config.ZOOM_MODE === "tl";
      if (event.originalEvent.ctrlKey || tl) {
        var offset = event.originalEvent.offsetX;
        var diff1 = offset / (this.canvas.width - 1) * diff;
        var diff2 = diff - diff1;
        this.range[0] -= diff1;
        this.range[1] += diff2;
      } else {
        this.range[0] -= diff;
      }
      if (tl) {
        var _offset = event.originalEvent.offsetY;
        var _diff = _offset / (this.canvas.height - 1) * 2;
        var _diff2 = 2 - _diff;
        var z = diff / (this.range[1] - this.range[0]);
        //rezoom_range(z, diff_x, diff_y)
        this.comp.$emit("rezoom-range", {
          grid_id: this.id,
          z: z,
          diff1: _diff,
          diff2: _diff2
        });
      }
      this.change_range();
    }
  }, {
    key: "mousedrag",
    value: function mousedrag(x, y) {
      var dt = this.drug.t * (this.drug.x - x) / this.layout.width;
      var d$ = this.layout.$_hi - this.layout.$_lo;
      d$ *= (this.drug.y - y) / this.layout.height;
      var offset = this.drug.o + d$;
      var ls = this.layout.grid.logScale;
      if (ls && this.drug.y_r) {
        var dy = this.drug.y - y;
        var range = this.drug.y_r.slice();
        range[0] = math.exp((0 - this.drug.B + dy) / this.layout.A);
        range[1] = math.exp((this.layout.height - this.drug.B + dy) / this.layout.A);
      }
      if (this.drug.y_r && this.$p.y_transform && !this.$p.y_transform.auto) {
        this.comp.$emit("sidebar-transform", {
          grid_id: this.id,
          range: ls ? range || this.drug.y_r : [this.drug.y_r[0] - offset, this.drug.y_r[1] - offset]
        });
      }
      this.range[0] = this.drug.r[0] + dt;
      this.range[1] = this.drug.r[1] + dt;
      this.change_range();
    }
  }, {
    key: "pinchzoom",
    value: function pinchzoom(scale) {
      if (scale > 1 && this.data.length <= this.MIN_ZOOM) return;
      if (scale < 1 && this.data.length > this.MAX_ZOOM) return;
      var t = this.pinch.t;
      var nt = t * 1 / scale;
      this.range[0] = this.pinch.r[0] - (nt - t) * 0.5;
      this.range[1] = this.pinch.r[1] + (nt - t) * 0.5;
      this.change_range();
    }
  }, {
    key: "trackpad_scroll",
    value: function trackpad_scroll(event) {
      var dt = this.range[1] - this.range[0];
      this.range[0] += event.deltaX * dt * 0.011;
      this.range[1] += event.deltaX * dt * 0.011;
      this.change_range();
    }
  }, {
    key: "change_range",
    value: function change_range() {
      // TODO: better way to limit the view. Problem:
      // when you are at the dead end of the data,
      // and keep scrolling,
      // the chart continues to scale down a little.
      // Solution: I don't know yet

      if (!this.range.length || this.data.length < 2) return;
      var l = this.data.length - 1;
      var data = this.data;
      var range = this.range;
      range[0] = utils.clamp(range[0], -Infinity, data[l][0] - this.interval * 5.5);
      range[1] = utils.clamp(range[1], data[0][0] + this.interval * 5.5, Infinity);

      // TODO: IMPORTANT scrolling is jerky The Problem caused
      // by the long round trip of 'range-changed' event.
      // First it propagates up to update layout in Chart.vue,
      // then it moves back as watch() update. It takes 1-5 ms.
      // And because the delay is different each time we see
      // the lag. No smooth movement and it's annoying.
      // Solution: we could try to calc the layout immediatly
      // somewhere here. Still will hurt the sidebar & bottombar
      this.comp.$emit("range-changed", range, true);
    }

    // Propagate mouse event to overlays
  }, {
    key: "propagate",
    value: function propagate(name, event) {
      var _iterator3 = grid_createForOfIteratorHelper(this.overlays),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var layer = _step3.value;
          if (layer.renderer[name]) {
            layer.renderer[name](event);
          }
          var mouse = layer.renderer.mouse;
          var keys = layer.renderer.keys;
          if (mouse.listeners) {
            mouse.emit(name, event);
          }
          if (keys && keys.listeners) {
            keys.emit(name, event);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }
  }, {
    key: "destroy",
    value: function destroy() {
      var rm = removeEventListener;
      rm("gesturestart", this.gesturestart);
      rm("gesturechange", this.gesturechange);
      rm("gestureend", this.gestureend);
      if (this.mc) this.mc.destroy();
      if (this.hm) this.hm.unwheel();
    }
  }]);
  return Grid;
}();

;// CONCATENATED MODULE: ./src/mixins/canvas.js
// Interactive canvas-based component
// Should implement: mousemove, mouseout, mouseup, mousedown, click


/* harmony default export */ const canvas = ({
  methods: {
    setup: function setup() {
      var _this = this;
      var id = "".concat(this.$props.tv_id, "-").concat(this._id, "-canvas");
      var canvas = document.getElementById(id);
      var dpr = window.devicePixelRatio || 1;
      canvas.style.width = "".concat(this._attrs.width, "px");
      canvas.style.height = "".concat(this._attrs.height, "px");
      if (dpr < 1) dpr = 1; // Realy ? That's it? Issue #63
      this.$nextTick(function () {
        var rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * dpr;
        canvas.height = rect.height * dpr;
        var ctx = canvas.getContext('2d', {
          // TODO: test the boost:
          //alpha: false,
          //desynchronized: true,
          //preserveDrawingBuffer: false
        });
        ctx.scale(dpr, dpr);
        _this.redraw();
        // Fallback fix for Brave browser
        // https://github.com/brave/brave-browser/issues/1738
        if (!ctx.measureTextOrg) {
          ctx.measureTextOrg = ctx.measureText;
        }
        ctx.measureText = function (text) {
          return utils.measureText(ctx, text, _this.$props.tv_id);
        };
      });
    },
    create_canvas: function create_canvas(h, id, props) {
      var _this2 = this;
      this._id = id;
      this._attrs = props.attrs;
      return h('div', {
        "class": "trading-vue-".concat(id),
        style: {
          left: props.position.x + 'px',
          top: props.position.y + 'px',
          position: 'absolute'
        }
      }, [h('canvas', {
        on: {
          mousemove: function mousemove(e) {
            return _this2.renderer.mousemove(e);
          },
          mouseout: function mouseout(e) {
            return _this2.renderer.mouseout(e);
          },
          mouseup: function mouseup(e) {
            return _this2.renderer.mouseup(e);
          },
          mousedown: function mousedown(e) {
            return _this2.renderer.mousedown(e);
          }
        },
        attrs: Object.assign({
          id: "".concat(this.$props.tv_id, "-").concat(id, "-canvas")
        }, props.attrs),
        ref: 'canvas',
        style: props.style
      })].concat(props.hs || []));
    },
    redraw: function redraw() {
      if (!this.renderer) return;
      this.renderer.update();
    }
  },
  watch: {
    width: function width(val) {
      this._attrs.width = val;
      this.setup();
    },
    height: function height(val) {
      this._attrs.height = val;
      this.setup();
    }
  }
});
;// CONCATENATED MODULE: ./src/mixins/uxlist.js
// Manager for Inteerface objects

/* harmony default export */ const uxlist = ({
  methods: {
    on_ux_event: function on_ux_event(d, target) {
      if (d.event === 'new-interface') {
        if (d.args[0].target === target) {
          d.args[0].vars = d.args[0].vars || {};
          d.args[0].grid_id = d.args[1];
          d.args[0].overlay_id = d.args[2];
          this.uxs.push(d.args[0]);
          // this.rerender++
        }
      } else if (d.event === 'close-interface') {
        this.uxs = this.uxs.filter(function (x) {
          return x.uuid !== d.args[0];
        });
      } else if (d.event === 'modify-interface') {
        var ux = this.uxs.filter(function (x) {
          return x.uuid === d.args[0];
        });
        if (ux.length) {
          this.modify(ux[0], d.args[1]);
        }
      } else if (d.event === 'hide-interface') {
        var _ux = this.uxs.filter(function (x) {
          return x.uuid === d.args[0];
        });
        if (_ux.length) {
          _ux[0].hidden = true;
          this.modify(_ux[0], {
            hidden: true
          });
        }
      } else if (d.event === 'show-interface') {
        var _ux2 = this.uxs.filter(function (x) {
          return x.uuid === d.args[0];
        });
        if (_ux2.length) {
          this.modify(_ux2[0], {
            hidden: false
          });
        }
      } else {
        return d;
      }
    },
    modify: function modify(ux, obj) {
      if (obj === void 0) {
        obj = {};
      }
      for (var k in obj) {
        if (k in ux) {
          this.$set(ux, k, obj[k]);
        }
      }
    },
    // Remove all UXs for a given overlay id
    remove_all_ux: function remove_all_ux(id) {
      this.uxs = this.uxs.filter(function (x) {
        return x.overlay.id !== id;
      });
    }
  },
  data: function data() {
    return {
      uxs: []
    };
  }
});
;// CONCATENATED MODULE: ./src/components/js/crosshair.js


var Crosshair = /*#__PURE__*/function () {
  function Crosshair(comp) {
    classCallCheck_classCallCheck(this, Crosshair);
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this._visible = false;
    this.locked = false;
    this.layout = this.$p.layout;
    this.enableCrosshair = this.$p.enableCrosshair;
  }
  createClass_createClass(Crosshair, [{
    key: "draw",
    value: function draw(ctx) {
      // Update reference to the grid
      this.layout = this.$p.layout;
      var cursor = this.comp.$props.cursor;
      // console.log(this.vis)
      if (!this.visible && cursor.mode === 'explore') return;
      this.x = this.$p.cursor.x;
      this.y = this.$p.cursor.y;
      ctx.save();
      ctx.strokeStyle = this.$p.colors.cross;
      ctx.beginPath();
      ctx.setLineDash([5]);

      // H
      if (this.$p.cursor.grid_id === this.layout.id) {
        ctx.moveTo(0, this.y);
        ctx.lineTo(this.layout.width - 0.5, this.y);
      }

      // V
      ctx.moveTo(this.x, 0);
      ctx.lineTo(this.x, this.layout.height);
      if (this.enableCrosshair) {
        ctx.stroke();
      }
      ctx.restore();
    }
  }, {
    key: "hide",
    value: function hide() {
      this.visible = false;
      this.x = undefined;
      this.y = undefined;
    }
  }, {
    key: "visible",
    get: function get() {
      return this._visible;
    },
    set: function set(val) {
      this._visible = val;
    }
  }]);
  return Crosshair;
}();

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Crosshair.vue?vue&type=script&lang=js&


/* harmony default export */ const Crosshairvue_type_script_lang_js_ = ({
  name: 'Crosshair',
  props: ['cursor', 'colors', 'layout', 'sub', 'enableCrosshair'],
  watch: {
    cursor: {
      handler: function handler() {
        if (!this.ch) this.create();

        // Explore = default mode on mobile
        var cursor = this.$props.cursor;
        var explore = cursor.mode === 'explore';
        if (!cursor.x || !cursor.y) {
          this.ch.hide();
          this.$emit('redraw-grid');
          return;
        }
        this.ch.visible = !explore;
      },
      deep: true
    },
    enableCrosshair: {
      handler: function handler(n) {
        this.create();
      }
    }
  },
  methods: {
    create: function create() {
      this.ch = new Crosshair(this);

      // New grid overlay-renderer descriptor.
      // Should implement draw() (see Spline.vue)
      this.$emit('new-grid-layer', {
        name: 'crosshair',
        renderer: this.ch
      });
    }
  },
  render: function render(h) {
    return h();
  }
});
;// CONCATENATED MODULE: ./src/components/Crosshair.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Crosshairvue_type_script_lang_js_ = (Crosshairvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./node_modules/vue-loader/lib/runtime/componentNormalizer.js
/* globals __VUE_SSR_CONTEXT__ */

// IMPORTANT: Do NOT use ES2015 features in this file (except for modules).
// This module is a runtime utility for cleaner component module output and will
// be included in the final webpack user bundle.

function normalizeComponent(
  scriptExports,
  render,
  staticRenderFns,
  functionalTemplate,
  injectStyles,
  scopeId,
  moduleIdentifier /* server only */,
  shadowMode /* vue-cli only */
) {
  // Vue.extend constructor export interop
  var options =
    typeof scriptExports === 'function' ? scriptExports.options : scriptExports

  // render functions
  if (render) {
    options.render = render
    options.staticRenderFns = staticRenderFns
    options._compiled = true
  }

  // functional template
  if (functionalTemplate) {
    options.functional = true
  }

  // scopedId
  if (scopeId) {
    options._scopeId = 'data-v-' + scopeId
  }

  var hook
  if (moduleIdentifier) {
    // server build
    hook = function (context) {
      // 2.3 injection
      context =
        context || // cached call
        (this.$vnode && this.$vnode.ssrContext) || // stateful
        (this.parent && this.parent.$vnode && this.parent.$vnode.ssrContext) // functional
      // 2.2 with runInNewContext: true
      if (!context && typeof __VUE_SSR_CONTEXT__ !== 'undefined') {
        context = __VUE_SSR_CONTEXT__
      }
      // inject component styles
      if (injectStyles) {
        injectStyles.call(this, context)
      }
      // register component module identifier for async chunk inferrence
      if (context && context._registeredComponents) {
        context._registeredComponents.add(moduleIdentifier)
      }
    }
    // used by ssr in case component is cached and beforeCreate
    // never gets called
    options._ssrRegister = hook
  } else if (injectStyles) {
    hook = shadowMode
      ? function () {
          injectStyles.call(
            this,
            (options.functional ? this.parent : this).$root.$options.shadowRoot
          )
        }
      : injectStyles
  }

  if (hook) {
    if (options.functional) {
      // for template-only hot-reload because in that case the render fn doesn't
      // go through the normalizer
      options._injectStyles = hook
      // register for functional component in vue file
      var originalRender = options.render
      options.render = function renderWithStyleInjection(h, context) {
        hook.call(context)
        return originalRender(h, context)
      }
    } else {
      // inject component registration as beforeCreate hook
      var existing = options.beforeCreate
      options.beforeCreate = existing ? [].concat(existing, hook) : [hook]
    }
  }

  return {
    exports: scriptExports,
    options: options
  }
}

;// CONCATENATED MODULE: ./src/components/Crosshair.vue
var Crosshair_render, Crosshair_staticRenderFns
;



/* normalize component */
;
var component = normalizeComponent(
  components_Crosshairvue_type_script_lang_js_,
  Crosshair_render,
  Crosshair_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Crosshair = (component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/KeyboardListener.vue?vue&type=script&lang=js&
/* harmony default export */ const KeyboardListenervue_type_script_lang_js_ = ({
  name: 'KeyboardListener',
  created: function created() {
    this.$emit('register-kb-listener', {
      id: this._uid,
      keydown: this.keydown,
      keyup: this.keyup,
      keypress: this.keypress
    });
  },
  beforeDestroy: function beforeDestroy() {
    this.$emit('remove-kb-listener', {
      id: this._uid
    });
  },
  methods: {
    keydown: function keydown(event) {
      this.$emit('keydown', event);
    },
    keyup: function keyup(event) {
      this.$emit('keyup', event);
    },
    keypress: function keypress(event) {
      this.$emit('keypress', event);
    }
  },
  render: function render(h) {
    return h();
  }
});
;// CONCATENATED MODULE: ./src/components/KeyboardListener.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_KeyboardListenervue_type_script_lang_js_ = (KeyboardListenervue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/KeyboardListener.vue
var KeyboardListener_render, KeyboardListener_staticRenderFns
;



/* normalize component */
;
var KeyboardListener_component = normalizeComponent(
  components_KeyboardListenervue_type_script_lang_js_,
  KeyboardListener_render,
  KeyboardListener_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const KeyboardListener = (KeyboardListener_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxLayer.vue?vue&type=template&id=15e2a3ac&
var UxLayervue_type_template_id_15e2a3ac_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("span", {
    "class": "trading-vue-grid-ux-".concat(_vm.id),
    style: _vm.style
  }, _vm._l(_vm.uxs, function (ux) {
    return _c("ux-wrapper", {
      key: ux.uuid,
      attrs: {
        ux: ux,
        updater: _vm.updater,
        colors: _vm.colors,
        config: _vm.config
      },
      on: {
        "custom-event": _vm.on_custom_event
      }
    });
  }), 1);
};
var UxLayervue_type_template_id_15e2a3ac_staticRenderFns = [];
UxLayervue_type_template_id_15e2a3ac_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/UxLayer.vue?vue&type=template&id=15e2a3ac&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=template&id=5c211b12&
var UxWrappervue_type_template_id_5c211b12_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _vm.visible ? _c("div", {
    staticClass: "trading-vue-ux-wrapper",
    style: _vm.style,
    attrs: {
      id: "tvjs-ux-wrapper-".concat(_vm.ux.uuid)
    }
  }, [_c(_vm.ux.component, {
    tag: "component",
    attrs: {
      ux: _vm.ux,
      updater: _vm.updater,
      wrapper: _vm.wrapper,
      colors: _vm.colors
    },
    on: {
      "custom-event": _vm.on_custom_event
    }
  }), _vm._v(" "), _vm.ux.show_pin ? _c("div", {
    staticClass: "tvjs-ux-wrapper-pin",
    style: _vm.pin_style
  }) : _vm._e(), _vm._v(" "), _vm.ux.win_header !== false ? _c("div", {
    staticClass: "tvjs-ux-wrapper-head"
  }, [_c("div", {
    staticClass: "tvjs-ux-wrapper-close",
    style: _vm.btn_style,
    on: {
      click: _vm.close
    }
  }, [_vm._v("×")])]) : _vm._e()], 1) : _vm._e();
};
var UxWrappervue_type_template_id_5c211b12_staticRenderFns = [];
UxWrappervue_type_template_id_5c211b12_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/UxWrapper.vue?vue&type=template&id=5c211b12&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=script&lang=js&

/* harmony default export */ const UxWrappervue_type_script_lang_js_ = ({
  name: 'UxWrapper',
  props: ['ux', 'updater', 'colors', 'config'],
  data: function data() {
    return {
      x: 0,
      y: 0,
      w: 0,
      h: 0,
      visible: true
    };
  },
  computed: {
    uxr: function uxr() {
      return this.$props.ux; // just a ref
    },
    layout: function layout() {
      return this.$props.ux.overlay.layout;
    },
    settings: function settings() {
      return this.$props.ux.overlay.settings;
    },
    uuid: function uuid() {
      return "tvjs-ux-wrapper-".concat(this.uxr.uuid);
    },
    mouse: function mouse() {
      return this.uxr.overlay.mouse;
    },
    style: function style() {
      var st = {
        'display': this.uxr.hidden ? 'none' : undefined,
        'left': "".concat(this.x, "px"),
        'top': "".concat(this.y, "px"),
        'pointer-events': this.uxr.pointer_events || 'all',
        'z-index': this.z_index
      };
      if (this.uxr.win_styling !== false) st = Object.assign(st, {
        'border': "1px solid ".concat(this.$props.colors.grid),
        'border-radius': '3px',
        'background': "".concat(this.background)
      });
      return st;
    },
    pin_style: function pin_style() {
      return {
        'left': "".concat(-this.ox, "px"),
        'top': "".concat(-this.oy, "px"),
        'background-color': this.uxr.pin_color
      };
    },
    btn_style: function btn_style() {
      return {
        'background': "".concat(this.inactive_btn_color),
        'color': "".concat(this.inactive_btn_color)
      };
    },
    pin_pos: function pin_pos() {
      return this.uxr.pin_position ? this.uxr.pin_position.split(',') : ['0', '0'];
    },
    // Offset x
    ox: function ox() {
      if (this.pin_pos.length !== 2) return undefined;
      var x = this.parse_coord(this.pin_pos[0], this.w);
      return -x;
    },
    // Offset y
    oy: function oy() {
      if (this.pin_pos.length !== 2) return undefined;
      var y = this.parse_coord(this.pin_pos[1], this.h);
      return -y;
    },
    z_index: function z_index() {
      var base_index = this.settings['z-index'] || this.settings['zIndex'] || 0;
      var ux_index = this.uxr['z_index'] || 0;
      return base_index + ux_index;
    },
    background: function background() {
      var c = this.uxr.background || this.$props.colors.back;
      return utils.apply_opacity(c, this.uxr.background_opacity || this.$props.config.UX_OPACITY);
    },
    inactive_btn_color: function inactive_btn_color() {
      return this.uxr.inactive_btn_color || this.$props.colors.grid;
    },
    wrapper: function wrapper() {
      return {
        x: this.x,
        y: this.y,
        pin_x: this.x - this.ox,
        pin_y: this.y - this.oy
      };
    }
  },
  watch: {
    updater: function updater() {
      this.update_position();
    }
  },
  mounted: function mounted() {
    this.self = document.getElementById(this.uuid);
    this.w = this.self.offsetWidth; // TODO: => width: "content"
    this.h = this.self.offsetHeight; // TODO: => height: "content"
    this.update_position();
  },
  created: function created() {
    this.mouse.on('mousemove', this.mousemove);
    this.mouse.on('mouseout', this.mouseout);
  },
  beforeDestroy: function beforeDestroy() {
    this.mouse.off('mousemove', this.mousemove);
    this.mouse.off('mouseout', this.mouseout);
  },
  methods: {
    update_position: function update_position() {
      if (this.uxr.hidden) return;
      var lw = this.layout.width;
      var lh = this.layout.height;
      var pin = this.uxr.pin;
      switch (pin[0]) {
        case 'cursor':
          var x = this.uxr.overlay.cursor.x;
          break;
        case 'mouse':
          x = this.mouse.x;
          break;
        default:
          if (typeof pin[0] === 'string') {
            x = this.parse_coord(pin[0], lw);
          } else {
            x = this.layout.t2screen(pin[0]);
          }
      }
      switch (pin[1]) {
        case 'cursor':
          var y = this.uxr.overlay.cursor.y;
          break;
        case 'mouse':
          y = this.mouse.y;
          break;
        default:
          if (typeof pin[1] === 'string') {
            y = this.parse_coord(pin[1], lh);
          } else {
            y = this.layout.$2screen(pin[1]);
          }
      }
      this.x = x + this.ox;
      this.y = y + this.oy;
    },
    parse_coord: function parse_coord(str, scale) {
      str = str.trim();
      if (str === '0' || str === '') return 0;
      var plus = str.split('+');
      if (plus.length === 2) {
        return this.parse_coord(plus[0], scale) + this.parse_coord(plus[1], scale);
      }
      var minus = str.split('-');
      if (minus.length === 2) {
        return this.parse_coord(minus[0], scale) - this.parse_coord(minus[1], scale);
      }
      var per = str.split('%');
      if (per.length === 2) {
        return scale * parseInt(per[0]) / 100;
      }
      var px = str.split('px');
      if (px.length === 2) {
        return parseInt(px[0]);
      }
      return undefined;
    },
    mousemove: function mousemove() {
      this.update_position();
      this.visible = true;
    },
    mouseout: function mouseout() {
      if (this.uxr.pin.includes('cursor') || this.uxr.pin.includes('mouse')) this.visible = false;
    },
    on_custom_event: function on_custom_event(event) {
      this.$emit('custom-event', event);
      if (event.event === 'modify-interface') {
        if (this.self) {
          this.w = this.self.offsetWidth;
          this.h = this.self.offsetHeight;
        }
        this.update_position();
      }
    },
    close: function close() {
      this.$emit('custom-event', {
        event: 'close-interface',
        args: [this.$props.ux.uuid]
      });
    }
  }
});
;// CONCATENATED MODULE: ./src/components/UxWrapper.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_UxWrappervue_type_script_lang_js_ = (UxWrappervue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxWrapper.vue?vue&type=style&index=0&id=5c211b12&prod&lang=css&
var UxWrappervue_type_style_index_0_id_5c211b12_prod_lang_css_ = __webpack_require__(656);
;// CONCATENATED MODULE: ./src/components/UxWrapper.vue?vue&type=style&index=0&id=5c211b12&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/UxWrapper.vue



;


/* normalize component */

var UxWrapper_component = normalizeComponent(
  components_UxWrappervue_type_script_lang_js_,
  UxWrappervue_type_template_id_5c211b12_render,
  UxWrappervue_type_template_id_5c211b12_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const UxWrapper = (UxWrapper_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/UxLayer.vue?vue&type=script&lang=js&

/* harmony default export */ const UxLayervue_type_script_lang_js_ = ({
  name: 'UxLayer',
  components: {
    UxWrapper: UxWrapper
  },
  props: ['tv_id', 'id', 'uxs', 'updater', 'colors', 'config'],
  computed: {
    style: function style() {
      return {
        'top': this.$props.id !== 0 ? '1px' : 0,
        'left': 0,
        'width': '100%',
        'height': 'calc(100% - 2px)',
        'position': 'absolute',
        'z-index': '1',
        'pointer-events': 'none',
        'overflow': 'hidden'
      };
    }
  },
  created: function created() {},
  mounted: function mounted() {},
  beforeDestroy: function beforeDestroy() {},
  methods: {
    on_custom_event: function on_custom_event(event) {
      this.$emit('custom-event', event);
    }
  }
});
;// CONCATENATED MODULE: ./src/components/UxLayer.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_UxLayervue_type_script_lang_js_ = (UxLayervue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/UxLayer.vue





/* normalize component */
;
var UxLayer_component = normalizeComponent(
  components_UxLayervue_type_script_lang_js_,
  UxLayervue_type_template_id_15e2a3ac_render,
  UxLayervue_type_template_id_15e2a3ac_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const UxLayer = (UxLayer_component.exports);
;// CONCATENATED MODULE: ./src/stuff/mouse.js


function mouse_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = mouse_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function mouse_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return mouse_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return mouse_arrayLikeToArray(o, minLen); }
function mouse_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Mouse event handler for overlay
var Mouse = /*#__PURE__*/function () {
  function Mouse(comp) {
    classCallCheck_classCallCheck(this, Mouse);
    this.comp = comp;
    this.map = {};
    this.listeners = 0;
    this.pressed = false;
    this.x = comp.$props.cursor.x;
    this.y = comp.$props.cursor.y;
    this.t = comp.$props.cursor.t;
    this.y$ = comp.$props.cursor.y$;
  }

  // You can choose where to place the handler
  // (beginning or end of the queue)
  createClass_createClass(Mouse, [{
    key: "on",
    value: function on(name, handler, dir) {
      if (dir === void 0) {
        dir = 'unshift';
      }
      if (!handler) return;
      this.map[name] = this.map[name] || [];
      this.map[name][dir](handler);
      this.listeners++;
    }
  }, {
    key: "off",
    value: function off(name, handler) {
      if (!this.map[name]) return;
      var i = this.map[name].indexOf(handler);
      if (i < 0) return;
      this.map[name].splice(i, 1);
      this.listeners--;
    }

    // Called by grid.js
  }, {
    key: "emit",
    value: function emit(name, event) {
      var l = this.comp.layout;
      if (name in this.map) {
        var _iterator = mouse_createForOfIteratorHelper(this.map[name]),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var f = _step.value;
            f(event);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
      if (name === 'mousemove') {
        this.x = event.layerX;
        this.y = event.layerY;
        this.t = l.screen2t(this.x);
        this.y$ = l.screen2$(this.y);
      }
      if (name === 'mousedown') {
        this.pressed = true;
      }
      if (name === 'mouseup') {
        this.pressed = false;
      }
    }
  }]);
  return Mouse;
}();

;// CONCATENATED MODULE: ./src/mixins/overlay.js
// Usuful stuff for creating overlays. Include as mixin


/* harmony default export */ const overlay = ({
  props: ['id', 'num', 'interval', 'cursor', 'colors', 'layout', 'sub', 'data', 'settings', 'grid_id', 'font', 'config', 'meta', 'tf', 'i0', 'last'],
  mounted: function mounted() {
    // TODO(1): when hot reloading, dynamicaly changed mixins
    // dissapear (cuz it's a hack), the only way for now
    // is to reload the browser
    if (!this.draw) {
      this.draw = function (ctx) {
        var text = 'EARLY ADOPTER BUG: reload the browser & enjoy';
        console.warn(text);
      };
    }
    // Main chart?
    var main = this.$props.sub === this.$props.data;
    this.meta_info();

    // TODO(1): quick fix for vue2, in vue3 we use 3rd party emit
    try {
      new Function('return ' + this.$emit)();
      this._$emit = this.$emit;
      this.$emit = this.custom_event;
    } catch (e) {
      return;
    }
    this._$emit('new-grid-layer', {
      name: this.$options.name,
      id: this.$props.id,
      renderer: this,
      display: 'display' in this.$props.settings ? this.$props.settings['display'] : true,
      z: this.$props.settings['z-index'] || this.$props.settings['zIndex'] || (main ? 0 : -1)
    });

    // Overlay meta-props (adjusting behaviour)
    this._$emit('layer-meta-props', {
      grid_id: this.$props.grid_id,
      layer_id: this.$props.id,
      legend: this.legend,
      data_colors: this.data_colors,
      y_range: this.y_range
    });
    this.exec_script();
    this.mouse = new Mouse(this);
    if (this.init_tool) this.init_tool();
    if (this.init) this.init();
  },
  beforeDestroy: function beforeDestroy() {
    if (this.destroy) this.destroy();
    this._$emit('delete-grid-layer', this.$props.id);
  },
  methods: {
    use_for: function use_for() {
      /* override it (mandatory) */
      console.warn('use_for() should be implemented');
      console.warn("Format: use_for() {\n                  return ['type1', 'type2', ...]\n            }");
    },
    meta_info: function meta_info() {
      /* override it (optional) */
      var id = this.$props.id;
      console.warn("".concat(id, " meta_info() is req. for publishing"));
      console.warn("Format: meta_info() {\n                author: 'Satoshi Smith',\n                version: '1.0.0',\n                contact (opt) '<email>'\n                github: (opt) '<GitHub Page>',\n            }");
    },
    custom_event: function custom_event(event) {
      if (event.split(':')[0] === 'hook') return;
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      if (event === 'change-settings' || event === 'object-selected' || event === 'new-shader' || event === 'new-interface' || event === 'remove-tool') {
        args.push(this.grid_id, this.id);
        if (this.$props.settings.$uuid) {
          args.push(this.$props.settings.$uuid);
        }
        // console.log("overlay custom event",event,args)
      }

      if (event === 'new-interface') {
        args[0].overlay = this;
        args[0].uuid = this.last_ux_id = "".concat(this.grid_id, "-").concat(this.id, "-").concat(this.uxs_count++);
      }
      // TODO: add a namespace to the event name
      // TODO(2): this prevents call overflow, but
      // the root of evil is in (1)
      if (event === 'custom-event') return;
      // console.log('custom-event',{event, args})
      this._$emit('custom-event', {
        event: event,
        args: args
      });
    },
    // TODO: the event is not firing when the same
    // overlay type is added to the offchart[]
    exec_script: function exec_script() {
      if (this.calc) this.$emit('exec-script', {
        grid_id: this.$props.grid_id,
        layer_id: this.$props.id,
        src: this.calc(),
        use_for: this.use_for()
      });
    }
  },
  watch: {
    settings: {
      handler: function handler(n, p) {
        // console.log('watch_uuid',this.watch_uuid,n)
        if (this.watch_uuid) this.watch_uuid(n, p);
        this._$emit('show-grid-layer', {
          id: this.$props.id,
          display: 'display' in this.$props.settings ? this.$props.settings['display'] : true
        });
      },
      deep: true
    }
  },
  data: function data() {
    return {
      uxs_count: 0,
      last_ux_id: null
    };
  },
  render: function render(h) {
    return h();
  }
});
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Spline.vue?vue&type=script&lang=js&
// Spline renderer. (SMAs, EMAs, TEMAs...
// you know what I mean)
// TODO: make a real spline, not a bunch of lines...

// Adds all necessary stuff for you.

/* harmony default export */ const Splinevue_type_script_lang_js_ = ({
  name: 'Spline',
  mixins: [overlay],
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    line_type: function line_type() {
      return "lineType" in this.sett ? this.sett.lineType : "solid";
    },
    color: function color() {
      var n = this.$props.num % 5;
      return this.sett.color || this.COLORS[n];
    },
    data_index: function data_index() {
      return this.sett.dataIndex || 1;
    },
    // Don't connect separate parts if true
    skip_nan: function skip_nan() {
      return this.sett.skipNaN;
    },
    noidea: function noidea() {
      return 12;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.2'
      };
    },
    // Here goes your code. You are provided with:
    // { All stuff is reactive }
    // $props.layout -> positions of all chart elements +
    //  some helper functions (see layout_fn.js)
    // $props.interval -> candlestick time interval
    // $props.sub -> current subset of candlestick data
    // $props.data -> your indicator's data subset.
    //  Comes "as is", should have the following format:
    //  [[<timestamp>, ... ], ... ]
    // $props.colors -> colors (see TradingVue.vue)
    // $props.cursor -> current position of crosshair
    // $props.settings -> indicator's custom settings
    //  E.g. colors, line thickness, etc. You define it.
    // $props.num -> indicator's layer number (of All
    // layers in the current grid)
    // $props.id -> indicator's id (e.g. EMA_0)
    // ~
    // Finally, let's make the canvas dirty!
    draw: function draw(ctx) {
      ctx.lineWidth = this.line_width;
      // console.log("this.line_type",this.line_type)
      ctx.strokeStyle = this.color;
      ctx.beginPath();

      //--- line style
      if (this.line_type === 'dashed') {
        ctx.setLineDash([5, 10]);
      } else if (this.line_type === 'dotted') {
        ctx.setLineDash([3, 4]);
      }
      var layout = this.$props.layout;
      var i = this.data_index;
      var data = this.$props.data;
      if (!this.skip_nan) {
        for (var k = 0, n = data.length; k < n; k++) {
          var p = data[k];
          var x = layout.t2screen(p[0]);
          var y = layout.$2screen(p[i]);
          ctx.lineTo(x, y);
        }
      } else {
        var skip = false;
        for (var k = 0, n = data.length; k < n; k++) {
          var _p = data[k];
          var _x = layout.t2screen(_p[0]);
          var _y = layout.$2screen(_p[i]);
          if (_p[i] == null || _y !== _y) {
            skip = true;
          } else {
            if (skip) ctx.moveTo(_x, _y);
            ctx.lineTo(_x, _y);
            skip = false;
          }
        }
      }
      ctx.stroke();
    },
    // For all data with these types overlay will be
    // added to the renderer list. And '$props.data'
    // will have the corresponding values. If you want to
    // redefine the default behviour for a prticular
    // indicator (let's say EMA),
    // just create a new overlay with the same type:
    // e.g. use_for() { return ['EMA'] }.
    use_for: function use_for() {
      return ['Spline', 'EMA', 'SMA'];
    },
    // Colors for the legend, should have the
    // same dimention as a data point (excl. timestamp)
    data_colors: function data_colors() {
      return [this.color];
    }
  },
  mounted: function mounted() {
    //console.log("Spline Mounted")
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Spline.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Splinevue_type_script_lang_js_ = (Splinevue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Spline.vue
var Spline_render, Spline_staticRenderFns
;



/* normalize component */
;
var Spline_component = normalizeComponent(
  overlays_Splinevue_type_script_lang_js_,
  Spline_render,
  Spline_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Spline = (Spline_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Splines.vue?vue&type=script&lang=js&
// Channel renderer. (Keltner, Bollinger)

/* harmony default export */ const Splinesvue_type_script_lang_js_ = ({
  name: 'Splines',
  mixins: [overlay],
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    widths: function widths() {
      return this.sett.lineWidths || [];
    },
    clrx: function clrx() {
      var colors = this.sett.colors || [];
      var n = this.$props.num;
      if (!colors.length) {
        for (var i = 0; i < this.lines_num; i++) {
          colors.push(this.COLORS[(n + i) % 5]);
        }
      }
      return colors;
    },
    lines_num: function lines_num() {
      if (!this.$props.data[0]) return 0;
      return this.$props.data[0].length - 1;
    },
    // Don't connect separate parts if true
    skip_nan: function skip_nan() {
      return this.sett.skipNaN;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.0'
      };
    },
    draw: function draw(ctx) {
      for (var i = 0; i < this.lines_num; i++) {
        var _i = i % this.clrx.length;
        ctx.strokeStyle = this.clrx[_i];
        ctx.lineWidth = this.widths[i] || this.line_width;
        ctx.beginPath();
        this.draw_spline(ctx, i);
        ctx.stroke();
      }
    },
    draw_spline: function draw_spline(ctx, i) {
      var layout = this.$props.layout;
      var data = this.$props.data;
      if (!this.skip_nan) {
        for (var k = 0, n = data.length; k < n; k++) {
          var p = data[k];
          var x = layout.t2screen(p[0]);
          var y = layout.$2screen(p[i + 1]);
          ctx.lineTo(x, y);
        }
      } else {
        var skip = false;
        for (var k = 0, n = data.length; k < n; k++) {
          var _p = data[k];
          var _x = layout.t2screen(_p[0]);
          var _y = layout.$2screen(_p[i + 1]);
          if (_p[i + 1] == null || _y !== _y) {
            skip = true;
          } else {
            if (skip) ctx.moveTo(_x, _y);
            ctx.lineTo(_x, _y);
            skip = false;
          }
        }
      }
    },
    use_for: function use_for() {
      return ['Splines', 'DMI'];
    },
    data_colors: function data_colors() {
      return this.clrx;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Splines.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Splinesvue_type_script_lang_js_ = (Splinesvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Splines.vue
var Splines_render, Splines_staticRenderFns
;



/* normalize component */
;
var Splines_component = normalizeComponent(
  overlays_Splinesvue_type_script_lang_js_,
  Splines_render,
  Splines_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Splines = (Splines_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Range.vue?vue&type=script&lang=js&
// R S I . Because we love it

// Adds all necessary stuff for you.

/* harmony default export */ const Rangevue_type_script_lang_js_ = ({
  name: 'Range',
  mixins: [overlay],
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    color: function color() {
      return this.sett.color || '#ec206e';
    },
    band_color: function band_color() {
      return this.sett.bandColor || '#ddd';
    },
    back_color: function back_color() {
      return this.sett.backColor || '#381e9c16';
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.1'
      };
    },
    // Here goes your code. You are provided with:
    // { All stuff is reactive }
    // $props.layout -> positions of all chart elements +
    //  some helper functions (see layout_fn.js)
    // $props.interval -> candlestick time interval
    // $props.sub -> current subset of candlestick data
    // $props.data -> your indicator's data subset.
    //  Comes "as is", should have the following format:
    //  [[<timestamp>, ... ], ... ]
    // $props.colors -> colors (see TradingVue.vue)
    // $props.cursor -> current position of crosshair
    // $props.settings -> indicator's custom settings
    //  E.g. colors, line thickness, etc. You define it.
    // $props.num -> indicator's layer number (of All
    // layers in the current grid)
    // $props.id -> indicator's id (e.g. EMA_0)
    // ~
    // Finally, let's make the canvas dirty!
    draw: function draw(ctx) {
      var layout = this.$props.layout;
      var upper = layout.$2screen(this.sett.upper || 70);
      var lower = layout.$2screen(this.sett.lower || 30);
      var data = this.$props.data;

      // RSI values

      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      for (var k = 0, n = data.length; k < n; k++) {
        var p = data[k];
        var x = layout.t2screen(p[0]);
        var y = layout.$2screen(p[1]);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
      ctx.strokeStyle = this.band_color;
      ctx.setLineDash([5]); // Will be removed after draw()
      ctx.beginPath();

      // Fill the area between the bands
      ctx.fillStyle = this.back_color;
      ctx.fillRect(0, upper, layout.width, lower - upper);

      // Upper band
      ctx.moveTo(0, upper);
      ctx.lineTo(layout.width, upper);

      // Lower band
      ctx.moveTo(0, lower);
      ctx.lineTo(layout.width, lower);
      ctx.stroke();
    },
    // For all data with these types overlay will be
    // added to the renderer list. And '$props.data'
    // will have the corresponding values. If you want to
    // redefine the default behviour for a prticular
    // indicator (let's say EMA),
    // just create a new overlay with the same type:
    // e.g. use_for() { return ['EMA'] }.
    use_for: function use_for() {
      return ['Range', 'RSI'];
    },
    // Colors for the legend, should have the
    // same dimention as a data point (excl. timestamp)
    data_colors: function data_colors() {
      return [this.color];
    },
    // Y-Range tansform. For example you need a fixed
    // Y-range for an indicator, you can do it here!
    // Gets estimated range, @return you favorite range
    y_range: function y_range(hi, lo) {
      return [Math.max(hi, this.sett.upper || 70), Math.min(lo, this.sett.lower || 30)];
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Range.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Rangevue_type_script_lang_js_ = (Rangevue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Range.vue
var Range_render, Range_staticRenderFns
;



/* normalize component */
;
var Range_component = normalizeComponent(
  overlays_Rangevue_type_script_lang_js_,
  Range_render,
  Range_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Range = (Range_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Trades.vue?vue&type=script&lang=js&

/* harmony default export */ const Tradesvue_type_script_lang_js_ = ({
  name: 'Trades',
  mixins: [overlay],
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    default_font: function default_font() {
      return '12px ' + this.$props.font.split('px').pop();
    },
    buy_color: function buy_color() {
      return this.sett.buyColor || '#63df89';
    },
    sell_color: function sell_color() {
      return this.sett.sellColor || '#ec4662';
    },
    label_color: function label_color() {
      return this.sett.labelColor || '#999';
    },
    marker_size: function marker_size() {
      return this.sett.markerSize || 5;
    },
    show_label: function show_label() {
      return this.sett.showLabel !== false;
    },
    new_font: function new_font() {
      return this.sett.font || this.default_font;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.2'
      };
    },
    draw: function draw(ctx) {
      var layout = this.$props.layout;
      var data = this.$props.data;
      ctx.lineWidth = 1.5;
      ctx.strokeStyle = 'black';
      for (var k = 0, n = data.length; k < n; k++) {
        var p = data[k];
        ctx.fillStyle = p[1] ? this.buy_color : this.sell_color;
        ctx.beginPath();
        var x = layout.t2screen(p[0]); // x - Mapping
        var y = layout.$2screen(p[2]); // y - Mapping
        ctx.arc(x, y, this.marker_size + 0.5, 0, Math.PI * 2, true);
        ctx.fill();
        ctx.stroke();
        if (this.show_label && p[3]) {
          this.draw_label(ctx, x, y, p);
        }
      }
    },
    draw_label: function draw_label(ctx, x, y, p) {
      ctx.fillStyle = this.label_color;
      ctx.font = this.new_font;
      ctx.textAlign = 'center';
      ctx.fillText(p[3], x, y - 25);
    },
    use_for: function use_for() {
      return ['Trades'];
    },
    // Defines legend format (values & colors)
    legend: function legend(values) {
      switch (values[1]) {
        case 0:
          var pos = 'Sell';
          break;
        case 1:
          pos = 'Buy';
          break;
        default:
          pos = 'Unknown';
      }
      return [{
        value: pos
      }, {
        value: values[2].toFixed(4),
        color: this.$props.colors.text
      }].concat(values[3] ? [{
        value: values[3]
      }] : []);
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Trades.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Tradesvue_type_script_lang_js_ = (Tradesvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Trades.vue
var Trades_render, Trades_staticRenderFns
;



/* normalize component */
;
var Trades_component = normalizeComponent(
  overlays_Tradesvue_type_script_lang_js_,
  Trades_render,
  Trades_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Trades = (Trades_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Channel.vue?vue&type=script&lang=js&
// Channel renderer. (Keltner, Bollinger)
// TODO: allow color transparency
// TODO: improve performance: draw in one solid chunk

/* harmony default export */ const Channelvue_type_script_lang_js_ = ({
  name: 'Channel',
  mixins: [overlay],
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.75;
    },
    color: function color() {
      var n = this.$props.num % 5;
      return this.sett.color || this.COLORS[n];
    },
    show_mid: function show_mid() {
      return 'showMid' in this.sett ? this.sett.showMid : true;
    },
    back_color: function back_color() {
      return this.sett.backColor || this.color + '11';
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.1'
      };
    },
    /*draw(ctx) {
        ctx.lineWidth = this.line_width
        ctx.strokeStyle = this.color
        ctx.fillStyle = this.back_color
          for (var i = 0; i < this.$props.data.length - 1; i++) {
                let p1 = this.mapp(this.$props.data[i])
            let p2 = this.mapp(this.$props.data[i+1])
              if (!p2) continue
            if (p1.y1 !== p1.y1) continue // Fix NaN
              // Background
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y1)
            ctx.lineTo(p2.x + 0.1, p2.y1)
            ctx.lineTo(p2.x + 0.1, p2.y3)
            ctx.lineTo(p1.x, p1.y3)
            ctx.fill()
              // Lines
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y1)
            ctx.lineTo(p2.x, p2.y1)
            if (this.show_mid) {
                ctx.moveTo(p1.x, p1.y2)
                ctx.lineTo(p2.x, p2.y2)
            }
            ctx.moveTo(p1.x, p1.y3)
            ctx.lineTo(p2.x, p2.y3)
            ctx.stroke()
          }
    },*/
    draw: function draw(ctx) {
      // Background
      var data = this.data;
      var layout = this.layout;
      ctx.beginPath();
      ctx.fillStyle = this.back_color;
      for (var i = 0; i < data.length; i++) {
        var p = data[i];
        var x = layout.t2screen(p[0]);
        var y = layout.$2screen(p[1] || undefined);
        ctx.lineTo(x, y);
      }
      for (var i = data.length - 1; i >= 0; i--) {
        var _p = data[i];
        var _x = layout.t2screen(_p[0]);
        var _y = layout.$2screen(_p[3] || undefined);
        ctx.lineTo(_x, _y);
      }
      ctx.fill();

      // Lines
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;

      // Top line
      ctx.beginPath();
      for (var i = 0; i < data.length; i++) {
        var _p2 = data[i];
        var _x2 = layout.t2screen(_p2[0]);
        var _y2 = layout.$2screen(_p2[1] || undefined);
        ctx.lineTo(_x2, _y2);
      }
      ctx.stroke();
      // Bottom line
      ctx.beginPath();
      for (var i = 0; i < data.length; i++) {
        var _p3 = data[i];
        var _x3 = layout.t2screen(_p3[0]);
        var _y3 = layout.$2screen(_p3[3] || undefined);
        ctx.lineTo(_x3, _y3);
      }
      ctx.stroke();
      // Middle line
      if (!this.show_mid) return;
      ctx.beginPath();
      for (var i = 0; i < data.length; i++) {
        var _p4 = data[i];
        var _x4 = layout.t2screen(_p4[0]);
        var _y4 = layout.$2screen(_p4[2] || undefined);
        ctx.lineTo(_x4, _y4);
      }
      ctx.stroke();
    },
    mapp: function mapp(p) {
      var layout = this.$props.layout;
      return p && {
        x: layout.t2screen(p[0]),
        y1: layout.$2screen(p[1]),
        y2: layout.$2screen(p[2]),
        y3: layout.$2screen(p[3])
      };
    },
    use_for: function use_for() {
      return ['Channel', 'KC', 'BB'];
    },
    data_colors: function data_colors() {
      return [this.color, this.color, this.color];
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Channel.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Channelvue_type_script_lang_js_ = (Channelvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Channel.vue
var Channel_render, Channel_staticRenderFns
;



/* normalize component */
;
var Channel_component = normalizeComponent(
  overlays_Channelvue_type_script_lang_js_,
  Channel_render,
  Channel_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Channel = (Channel_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Segment.vue?vue&type=script&lang=js&
// Segment renderer.


/* harmony default export */ const Segmentvue_type_script_lang_js_ = ({
  name: 'Segment',
  mixins: [overlay],
  data: function data() {
    return {
      COLORS: ['#42b28a', '#5691ce', '#612ff9', '#d50b90', '#ff2316']
    };
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color: function color() {
      var n = this.$props.num % 5;
      return this.sett.color || this.COLORS[n];
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.0'
      };
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      var layout = this.$props.layout;
      var x1 = layout.t2screen(this.p1[0]);
      var y1 = layout.$2screen(this.p1[1]);
      ctx.moveTo(x1, y1);
      var x2 = layout.t2screen(this.p2[0]);
      var y2 = layout.$2screen(this.p2[1]);
      ctx.lineTo(x2, y2);
      ctx.stroke();
    },
    use_for: function use_for() {
      return ['Segment'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Segment.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Segmentvue_type_script_lang_js_ = (Segmentvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Segment.vue
var Segment_render, Segment_staticRenderFns
;



/* normalize component */
;
var Segment_component = normalizeComponent(
  overlays_Segmentvue_type_script_lang_js_,
  Segment_render,
  Segment_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Segment = (Segment_component.exports);
;// CONCATENATED MODULE: ./src/components/js/layout_cnv.js


// Claculates postions and sizes for candlestick
// and volume bars for the given subset of data


function layout_cnv(self) {
  var $p = self.$props;
  var sub = $p.data;
  var t2screen = $p.layout.t2screen;
  var layout = $p.layout;
  var candles = [];
  var volume = [];

  // The volume bar height is determined as a percentage of
  // the chart's height (VOLSCALE)
  var maxv = Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
    return x[5];
  })));
  var vs = $p.config.VOLSCALE * layout.height / maxv;
  var x1,
    x2,
    w,
    avg_w,
    mid,
    prev = undefined;

  // Subset interval against main interval
  var _new_interval = new_interval(layout, $p, sub),
    _new_interval2 = _slicedToArray(_new_interval, 2),
    interval2 = _new_interval2[0],
    ratio = _new_interval2[1];
  var px_step2 = layout.px_step * ratio;
  var splitter = px_step2 > 5 ? 1 : 0;

  // A & B are current chart tranformations:
  // A === scale,  B === Y-axis shift
  for (var i = 0; i < sub.length; i++) {
    var p = sub[i];
    mid = t2screen(p[0]) + 1;

    // Clear volume bar if there is a time gap
    if (sub[i - 1] && p[0] - sub[i - 1][0] > interval2) {
      prev = null;
    }
    x1 = prev || Math.floor(mid - px_step2 * 0.5);
    x2 = Math.floor(mid + px_step2 * 0.5) - 0.5;

    // TODO: add log scale support
    candles.push({
      x: mid,
      w: layout.px_step * $p.config.CANDLEW * ratio,
      o: Math.floor(p[1] * layout.A + layout.B),
      h: Math.floor(p[2] * layout.A + layout.B),
      l: Math.floor(p[3] * layout.A + layout.B),
      c: Math.floor(p[4] * layout.A + layout.B),
      raw: p
    });
    volume.push({
      x1: x1,
      x2: x2,
      h: p[5] * vs,
      green: p[4] >= p[1],
      raw: p
    });
    prev = x2 + splitter;
  }
  return {
    candles: candles,
    volume: volume
  };
}
function layout_vol(self) {
  var $p = self.$props;
  var sub = $p.data;
  var t2screen = $p.layout.t2screen;
  var layout = $p.layout;
  var volume = [];

  // Detect data second dimention size:
  var dim = sub[0] ? sub[0].length : 0;

  // Support special volume data (see API book), or OHLCV
  // Data indices:
  self._i1 = dim < 6 ? 1 : 5;
  self._i2 = dim < 6 ? function (p) {
    return p[2];
  } : function (p) {
    return p[4] >= p[1];
  };
  var maxv = Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
    return x[self._i1];
  })));
  var volscale = self.volscale || $p.config.VOLSCALE;
  var vs = volscale * layout.height / maxv;
  var x1,
    x2,
    mid,
    prev = undefined;

  // Subset interval against main interval
  var _new_interval3 = new_interval(layout, $p, sub),
    _new_interval4 = _slicedToArray(_new_interval3, 2),
    interval2 = _new_interval4[0],
    ratio = _new_interval4[1];
  var px_step2 = layout.px_step * ratio;
  var splitter = px_step2 > 5 ? 1 : 0;

  // A & B are current chart tranformations:
  // A === scale,  B === Y-axis shift
  for (var i = 0; i < sub.length; i++) {
    var p = sub[i];
    mid = t2screen(p[0]) + 1;

    // Clear volume bar if there is a time gap
    if (sub[i - 1] && p[0] - sub[i - 1][0] > interval2) {
      prev = null;
    }
    x1 = prev || Math.floor(mid - px_step2 * 0.5);
    x2 = Math.floor(mid + px_step2 * 0.5) - 0.5;
    volume.push({
      x1: x1,
      x2: x2,
      h: p[self._i1] * vs,
      green: self._i2(p),
      raw: p
    });
    prev = x2 + splitter;
  }
  return volume;
}
function new_interval(layout, $p, sub) {
  // Subset interval against main interval
  if (!layout.ti_map.ib) {
    var interval2 = $p.tf || utils.detect_interval(sub);
    var ratio = interval2 / $p.interval;
  } else {
    if ($p.tf) {
      var ratio = $p.tf / layout.ti_map.tf;
      var interval2 = ratio;
    } else {
      var interval2 = utils.detect_interval(sub);
      var ratio = interval2 / $p.interval;
    }
  }
  return [interval2, ratio];
}
;// CONCATENATED MODULE: ./src/components/primitives/candle.js


// Candle object for Candles overlay
var CandleExt = /*#__PURE__*/function () {
  function CandleExt(overlay, ctx, data) {
    classCallCheck_classCallCheck(this, CandleExt);
    this.ctx = ctx;
    this.self = overlay;
    this.style = data.raw[6] || this.self;
    this.draw(data);
  }
  createClass_createClass(CandleExt, [{
    key: "draw",
    value: function draw(data) {
      var green = data.raw[4] >= data.raw[1];
      var body_color = green ? this.style.colorCandleUp : this.style.colorCandleDw;
      var wick_color = green ? this.style.colorWickUp : this.style.colorWickDw;
      var w = Math.max(data.w, 1);
      var hw = Math.max(Math.floor(w * 0.5), 1);
      var h = Math.abs(data.o - data.c);
      var max_h = data.c === data.o ? 1 : 2;
      var x05 = Math.floor(data.x) - 0.5;
      this.ctx.strokeStyle = wick_color;
      this.ctx.beginPath();
      this.ctx.moveTo(x05, Math.floor(data.h));
      this.ctx.lineTo(x05, Math.floor(data.l));
      this.ctx.stroke();
      if (data.w > 1.5) {
        this.ctx.fillStyle = body_color;
        // TODO: Move common calculations to layout.js
        var s = green ? 1 : -1;
        this.ctx.fillRect(Math.floor(data.x - hw - 1), data.c, Math.floor(hw * 2 + 1), s * Math.max(h, max_h));
      } else {
        this.ctx.strokeStyle = body_color;
        this.ctx.beginPath();
        this.ctx.moveTo(x05, Math.floor(Math.min(data.o, data.c)));
        this.ctx.lineTo(x05, Math.floor(Math.max(data.o, data.c)) + (data.o === data.c ? 1 : 0));
        this.ctx.stroke();
      }
    }
  }]);
  return CandleExt;
}();

;// CONCATENATED MODULE: ./src/components/primitives/volbar.js


var VolbarExt = /*#__PURE__*/function () {
  function VolbarExt(overlay, ctx, data) {
    classCallCheck_classCallCheck(this, VolbarExt);
    this.ctx = ctx;
    this.$p = overlay.$props;
    this.self = overlay;
    this.style = data.raw[6] || this.self;
    this.draw(data);
  }
  createClass_createClass(VolbarExt, [{
    key: "draw",
    value: function draw(data) {
      var y0 = this.$p.layout.height;
      var w = data.x2 - data.x1;
      var h = Math.floor(data.h);
      this.ctx.fillStyle = data.green ? this.style.colorVolUp : this.style.colorVolDw;
      this.ctx.fillRect(Math.floor(data.x1), Math.floor(y0 - h - 0.5), Math.floor(w), Math.floor(h + 1));
    }
  }]);
  return VolbarExt;
}();

;// CONCATENATED MODULE: ./src/components/primitives/price.js


// Price bar & price line (shader)
var Price = /*#__PURE__*/function () {
  function Price(comp) {
    classCallCheck_classCallCheck(this, Price);
    this.comp = comp;
  }

  // Defines an inline shader (has access to both
  // target & overlay's contexts)
  createClass_createClass(Price, [{
    key: "init_shader",
    value: function init_shader() {
      var _this = this;
      var layout = this.comp.$props.layout;
      var config = this.comp.$props.config;
      var comp = this.comp;
      var last_bar = function last_bar() {
        return _this.last_bar();
      };
      //console.log("init_shader comp",comp?.isArrow)
      this.comp.$emit('new-shader', {
        target: 'sidebar',
        draw: function draw(ctx) {
          var bar = last_bar();
          if (!bar) return;
          var w = ctx.canvas.width;
          var h = config.PANHEIGHT;
          //let lbl = bar.price.toFixed(layout.prec)
          var lbl = bar.price.toFixed(comp.decimalPlace);
          ctx.fillStyle = bar.color;
          var x = -0.5;
          var a = 7;
          // let isArrow = comp.$props.settings

          if (comp !== null && comp !== void 0 && comp.isArrow) {
            //y according to arrow
            var y = bar.y - h * 0 - 0.5;

            //map client arrow work
            ctx.miterLimit = 4;
            ctx.font = "15px''";
            ctx.fillStyle = bar.color;
            ctx.font = "15px''";
            ctx.save();
            ctx.fillStyle = bar.color;
            ctx.font = "15px''";
            ctx.beginPath();
            //1. ctx.moveTo(0,16);
            ctx.moveTo(x - 0.5, y);
            //2. ctx.lineTo(19,0);
            ctx.lineTo(x - 0.5 + 19, y - 16);
            //3. ctx.lineTo(66.5,0);
            ctx.lineTo(x - 0.5 + 19 + 66.5, y - 16);
            //4. ctx.lineTo(66.5,35);
            ctx.lineTo(x - 0.5 + 19 + 66.5, y + 32 - 16);
            //5. ctx.lineTo(19,35);
            ctx.lineTo(x - 0.5 + 19, y + 32 - 16);
            //6. ctx.lineTo(0,16);
            ctx.lineTo(x - 0.5, y);
            ctx.closePath();
            ctx.fill();
            // ctx.stroke();
            ctx.restore();
            ctx.restore();
            ctx.fillStyle = comp.$props.colors.textHL;
            ctx.textAlign = 'left';

            //for arrow work
            ctx.fillText(lbl, a + 10, y + 5);
          } else {
            var _x = -0.5;
            var _y = bar.y - h * 0.5 - 0.5;
            var _a = 7;
            ctx.fillRect(_x - 0.5, _y, w + 1, h);
            ctx.fillStyle = comp.$props.colors.textHL;
            ctx.textAlign = 'left';
            ctx.fillText(lbl, _a, _y + 15);
          }
        }
      });
      this.shader = true;
    }

    // Regular draw call for overaly
  }, {
    key: "draw",
    value: function draw(ctx) {
      if (!this.comp.$props.meta.last) return;
      if (!this.shader) this.init_shader();
      var layout = this.comp.$props.layout;
      var last = this.comp.$props.last;
      var dir = last[4] >= last[1];
      var color = dir ? this.green() : this.red();
      var y = layout.$2screen(last[4]) + (dir ? 1 : 0);
      ctx.strokeStyle = color;
      ctx.setLineDash([1, 1]);
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(layout.width, y);
      ctx.stroke();
      ctx.setLineDash([]);
    }
  }, {
    key: "last_bar",
    value: function last_bar() {
      if (!this.comp.data.length) return undefined;
      var layout = this.comp.$props.layout;
      var last = this.comp.data[this.comp.data.length - 1];
      var y = layout.$2screen(last[4]);
      //let cndl = layout.c_magnet(last[0])
      return {
        y: y,
        //Math.floor(cndl.c) - 0.5,
        price: last[4],
        color: last[4] >= last[1] ? this.green() : this.red()
      };
    }
  }, {
    key: "last_price",
    value: function last_price() {
      return this.comp.$props.meta.last ? this.comp.$props.meta.last[4] : undefined;
    }
  }, {
    key: "green",
    value: function green() {
      return this.comp.colorCandleUp;
    }
  }, {
    key: "red",
    value: function red() {
      return this.comp.colorCandleDw;
    }
  }, {
    key: "drawArrow",
    value: function drawArrow(ctx, fromx, fromy, tox, toy, arrowWidth, color) {
      //variables to be used when creating the arrow
      ctx.strokeStyle = "rgba(0,0,0,0)";
      ctx.miterLimit = 4;
      ctx.font = "15px ''";
      ctx.fillStyle = "rgba(0,0,0,0)";
      ctx.font = "   15px ''";
      ctx.save();
      ctx.fillStyle = "#E65C5C";
      ctx.font = "   15px ''";
      ctx.beginPath();
      ctx.moveTo(0, 16);
      ctx.lineTo(19, 0);
      ctx.lineTo(66.5, 0);
      ctx.lineTo(66.5, 35);
      ctx.lineTo(19, 35);
      ctx.lineTo(0, 16);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();
      ctx.restore();
      ctx.restore();
      return;
      var headlen = 15;
      var angle = Math.atan2(toy - fromy, tox - fromx);
      ctx.save();
      ctx.strokeStyle = color;

      //starting path of the arrow from the start square to the end square
      //and drawing the stroke
      ctx.beginPath();
      ctx.moveTo(fromx, fromy);
      ctx.lineTo(tox, toy);
      ctx.lineWidth = arrowWidth;
      ctx.stroke();

      //starting a new path from the head of the arrow to one of the sides of
      //the point
      ctx.beginPath();
      ctx.moveTo(tox, toy);
      ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 4), toy - headlen * Math.sin(angle - Math.PI / 4));

      //path from the side point of the arrow, to the other side point
      ctx.lineTo(tox - headlen * Math.cos(angle + Math.PI / 4), toy - headlen * Math.sin(angle + Math.PI / 4));

      //path from the side point back to the tip of the arrow, and then
      //again to the opposite side point
      ctx.lineTo(tox, toy);
      ctx.lineTo(tox - headlen * Math.cos(angle - Math.PI / 4), toy - headlen * Math.sin(angle - Math.PI / 4));

      //draws the paths created above
      ctx.stroke();
      ctx.restore();
    }
  }]);
  return Price;
}();

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Candles.vue?vue&type=script&lang=js&
// Renedrer for candlesticks + volume (optional)
// It can be used as the main chart or an indicator






/* harmony default export */ const Candlesvue_type_script_lang_js_ = ({
  name: "Candles",
  mixins: [overlay],
  data: function data() {
    return {
      price: {}
    };
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    show_volume: function show_volume() {
      return "showVolume" in this.sett ? this.sett.showVolume : true;
    },
    price_line: function price_line() {
      return "priceLine" in this.sett ? this.sett.priceLine : true;
    },
    colorCandleUp: function colorCandleUp() {
      return this.sett.colorCandleUp || this.$props.colors.candleUp;
    },
    colorCandleDw: function colorCandleDw() {
      return this.sett.colorCandleDw || this.$props.colors.candleDw;
    },
    colorWickUp: function colorWickUp() {
      return this.sett.colorWickUp || this.$props.colors.wickUp;
    },
    colorWickDw: function colorWickDw() {
      return this.sett.colorWickDw || this.$props.colors.wickDw;
    },
    colorWickSm: function colorWickSm() {
      return this.sett.colorWickSm || this.$props.colors.wickSm;
    },
    colorVolUp: function colorVolUp() {
      return this.sett.colorVolUp || this.$props.colors.volUp;
    },
    colorVolDw: function colorVolDw() {
      return this.sett.colorVolDw || this.$props.colors.volDw;
    },
    isArrow: function isArrow() {
      return "isArrow" in this.sett ? this.sett.isArrow : false;
    },
    decimalPlace: function decimalPlace() {
      // return this.sett?.decimalPlace || 2;
      return "decimalPlace" in this.sett ? this.sett.decimalPlace : 2;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: "C451",
        version: "1.2.1"
      };
    },
    init: function init() {
      this.price = new Price(this);
    },
    draw: function draw(ctx) {
      // If data === main candlestick data
      // render as main chart:
      if (this.$props.sub === this.$props.data) {
        var cnv = {
          candles: this.$props.layout.candles,
          volume: this.$props.layout.volume
        };
        // Else, as offchart / onchart indicator:
      } else {
        cnv = layout_cnv(this);
      }
      if (this.show_volume) {
        var cv = cnv.volume;
        for (var i = 0, n = cv.length; i < n; i++) {
          new VolbarExt(this, ctx, cv[i]);
        }
      }
      var cc = cnv.candles;
      for (var i = 0, n = cc.length; i < n; i++) {
        new CandleExt(this, ctx, cc[i]);
      }
      if (this.price_line) this.price.draw(ctx);
    },
    use_for: function use_for() {
      return ["Candles"];
    },
    // In case it's added as offchart overlay
    y_range: function y_range() {
      var hi = -Infinity,
        lo = Infinity;
      for (var i = 0, n = this.sub.length; i < n; i++) {
        var x = this.sub[i];
        if (x[2] > hi) hi = x[2];
        if (x[3] < lo) lo = x[3];
      }
      var yRange = [hi, lo];
      // console.log("yRange",yRange)
      return yRange;
    }
  },
  watch: {
    isArrow: {
      handler: function handler(value) {
        //console.log("candles isArrows",value,this.price)
        this.price = new Price(this);
      }
    }
  },
  mounted: function mounted() {
    //console.log("candles mounted", this.$props);
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Candles.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Candlesvue_type_script_lang_js_ = (Candlesvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Candles.vue
var Candles_render, Candles_staticRenderFns
;



/* normalize component */
;
var Candles_component = normalizeComponent(
  overlays_Candlesvue_type_script_lang_js_,
  Candles_render,
  Candles_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Candles = (Candles_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Volume.vue?vue&type=script&lang=js&

function Volumevue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = Volumevue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function Volumevue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return Volumevue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Volumevue_type_script_lang_js_arrayLikeToArray(o, minLen); }
function Volumevue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Standalone renedrer for the volume




/* harmony default export */ const Volumevue_type_script_lang_js_ = ({
  name: 'Volume',
  mixins: [overlay],
  data: function data() {
    return {};
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    colorVolUp: function colorVolUp() {
      return this.sett.colorVolUp || this.$props.colors.volUp;
    },
    colorVolDw: function colorVolDw() {
      return this.sett.colorVolDw || this.$props.colors.volDw;
    },
    colorVolUpLegend: function colorVolUpLegend() {
      return this.sett.colorVolUpLegend || this.$props.colors.candleUp;
    },
    colorVolDwLegend: function colorVolDwLegend() {
      return this.sett.colorVolDwLegend || this.$props.colors.candleDw;
    },
    volscale: function volscale() {
      return this.sett.volscale || this.$props.grid_id > 0 ? 0.85 : this.$props.config.VOLSCALE;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.0'
      };
    },
    draw: function draw(ctx) {
      // TODO: volume average
      // TODO: Y-axis scaling
      var _iterator = Volumevue_type_script_lang_js_createForOfIteratorHelper(layout_vol(this)),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var v = _step.value;
          new VolbarExt(this, ctx, v);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    },
    use_for: function use_for() {
      return ['Volume'];
    },
    // Defines legend format (values & colors)
    // _i2 - detetected data index (see layout_cnv)
    legend: function legend(values) {
      var flag = this._i2 ? this._i2(values) : values[2];
      var color = flag ? this.colorVolUpLegend : this.colorVolDwLegend;
      return [{
        value: values[this._i1 || 1],
        color: color
      }];
    },
    // When added as offchart overlay
    // If data is OHLCV => recalc y-range
    // _i1 - detetected data index (see layout_cnv)
    y_range: function y_range(hi, lo) {
      var _this = this;
      if (this._i1 === 5) {
        var sub = this.$props.sub;
        return [Math.max.apply(Math, _toConsumableArray(sub.map(function (x) {
          return x[_this._i1];
        }))), Math.min.apply(Math, _toConsumableArray(sub.map(function (x) {
          return x[_this._i1];
        })))];
      } else {
        return [hi, lo];
      }
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Volume.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Volumevue_type_script_lang_js_ = (Volumevue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Volume.vue
var Volume_render, Volume_staticRenderFns
;



/* normalize component */
;
var Volume_component = normalizeComponent(
  overlays_Volumevue_type_script_lang_js_,
  Volume_render,
  Volume_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Volume = (Volume_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/Splitters.vue?vue&type=script&lang=js&
// Data section splitters (with labels)


/* harmony default export */ const Splittersvue_type_script_lang_js_ = ({
  name: 'Splitters',
  mixins: [overlay],
  data: function data() {
    return {};
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    new_font: function new_font() {
      return this.sett.font || '12px ' + this.$props.font.split('px').pop();
    },
    flag_color: function flag_color() {
      return this.sett.flagColor || '#4285f4';
    },
    label_color: function label_color() {
      return this.sett.labelColor || '#fff';
    },
    line_color: function line_color() {
      return this.sett.lineColor || '#4285f4';
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 1.0;
    },
    y_position: function y_position() {
      return this.sett.yPosition || 0.9;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.0.1'
      };
    },
    draw: function draw(ctx) {
      var _this = this;
      var layout = this.$props.layout;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.line_color;
      this.$props.data.forEach(function (p, i) {
        ctx.beginPath();
        var x = layout.t2screen(p[0]); // x - Mapping
        ctx.setLineDash([10, 10]);
        ctx.moveTo(x, 0);
        ctx.lineTo(x, _this.layout.height);
        ctx.stroke();
        if (p[1]) _this.draw_label(ctx, x, p);
      });
    },
    draw_label: function draw_label(ctx, x, p) {
      var side = p[2] ? 1 : -1;
      x += 2.5 * side;
      ctx.font = this.new_font;
      var pos = p[4] || this.y_position;
      var w = ctx.measureText(p[1]).width + 10;
      var y = this.layout.height * (1.0 - pos);
      y = Math.floor(y);
      ctx.fillStyle = p[3] || this.flag_color;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x + 10 * side, y - 10 * side);
      ctx.lineTo(x + (w + 10) * side, y - 10 * side);
      ctx.lineTo(x + (w + 10) * side, y + 10 * side);
      ctx.lineTo(x + 10 * side, y + 10 * side);
      ctx.closePath();
      ctx.fill();
      ctx.fillStyle = this.label_color;
      ctx.textAlign = side < 0 ? 'right' : 'left';
      ctx.fillText(p[1], x + 15 * side, y + 4);
    },
    use_for: function use_for() {
      return ['Splitters'];
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/Splitters.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_Splittersvue_type_script_lang_js_ = (Splittersvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/Splitters.vue
var Splitters_render, Splitters_staticRenderFns
;



/* normalize component */
;
var Splitters_component = normalizeComponent(
  overlays_Splittersvue_type_script_lang_js_,
  Splitters_render,
  Splitters_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Splitters = (Splitters_component.exports);
;// CONCATENATED MODULE: ./src/stuff/keys.js


function keys_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = keys_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function keys_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return keys_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return keys_arrayLikeToArray(o, minLen); }
function keys_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Keyboard event handler for overlay
var Keys = /*#__PURE__*/function () {
  function Keys(comp) {
    classCallCheck_classCallCheck(this, Keys);
    this.comp = comp;
    this.map = {};
    this.listeners = 0;
    this.keymap = {};
  }
  createClass_createClass(Keys, [{
    key: "on",
    value: function on(name, handler) {
      if (!handler) return;
      this.map[name] = this.map[name] || [];
      this.map[name].push(handler);
      this.listeners++;
    }

    // Called by grid.js
  }, {
    key: "emit",
    value: function emit(name, event) {
      if (name in this.map) {
        var _iterator = keys_createForOfIteratorHelper(this.map[name]),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var f = _step.value;
            f(event);
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
      if (name === 'keydown') {
        if (!this.keymap[event.key]) {
          this.emit(event.key);
        }
        this.keymap[event.key] = true;
      }
      if (name === 'keyup') {
        this.keymap[event.key] = false;
      }
    }
  }, {
    key: "pressed",
    value: function pressed(key) {
      return this.keymap[key];
    }
  }]);
  return Keys;
}();

;// CONCATENATED MODULE: ./src/mixins/tool.js
function tool_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = tool_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function tool_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return tool_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return tool_arrayLikeToArray(o, minLen); }
function tool_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Usuful stuff for creating tools. Include as mixin



/* harmony default export */ const tool = ({
  methods: {
    init_tool: function init_tool() {
      var _this = this;
      // Collision functions (float, float) => bool,
      this.collisions = [];
      this.pins = [];
      this.mouse.on('mousemove', function (e) {
        if (_this.collisions.some(function (f) {
          return f(_this.mouse.x, _this.mouse.y);
        })) {
          _this.show_pins = true;
        } else {
          _this.show_pins = false;
        }
        if (_this.drag) _this.drag_update();
      });
      this.mouse.on('mousedown', function (e) {
        if (utils.default_prevented(e)) return;
        if (_this.collisions.some(function (f) {
          return f(_this.mouse.x, _this.mouse.y);
        })) {
          if (!_this.selected) {
            _this.$emit('object-selected');
          }
          _this.start_drag();
          e.preventDefault();
          _this.pins.forEach(function (x) {
            return x.mousedown(e, true);
          });
        }
      });
      this.mouse.on('mouseup', function (e) {
        _this.drag = null;
        _this.$emit('scroll-lock', false);
      });
      this.keys = new Keys(this);
      this.keys.on('Delete', this.remove_tool);
      this.keys.on('Backspace', this.remove_tool);
      this.show_pins = false;
      this.drag = null;
    },
    render_pins: function render_pins(ctx) {
      if (this.selected || this.show_pins) {
        this.pins.forEach(function (x) {
          return x.draw(ctx);
        });
      }
    },
    set_state: function set_state(name) {
      this.$emit('change-settings', {
        $state: name
      });
    },
    watch_uuid: function watch_uuid(n, p) {
      // If layer $uuid is changed, then re-init
      // pins & collisions
      if (n.$uuid !== p.$uuid) {
        var _iterator = tool_createForOfIteratorHelper(this.pins),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var p = _step.value;
            p.re_init();
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
        this.collisions = [];
        this.show_pins = false;
        this.drag = null;
      }
    },
    pre_draw: function pre_draw() {
      // Delete all collision functions before
      // the draw() call and let primitives set
      // them again
      this.collisions = [];
    },
    remove_tool: function remove_tool() {
      if (this.selected) {
        console.log("remove_tool");
        this.$emit('remove-tool');
      }
    },
    start_drag: function start_drag() {
      this.$emit('scroll-lock', true);
      var cursor = this.$props.cursor;
      this.drag = {
        t: cursor.t,
        y$: cursor.y$
      };
      this.pins.forEach(function (x) {
        return x.rec_position();
      });
    },
    drag_update: function drag_update() {
      var dt = this.$props.cursor.t - this.drag.t;
      var dy = this.$props.cursor.y$ - this.drag.y$;
      this.pins.forEach(function (x) {
        return x.update_from([x.t1 + dt, x.y$1 + dy], true);
      });
    }
  },
  computed: {
    // Settings starting with $ are reserved
    selected: function selected() {
      return this.$props.settings.$selected;
    },
    state: function state() {
      return this.$props.settings.$state;
    }
  }
});
;// CONCATENATED MODULE: ./src/stuff/icons.json
const icons_namespaceObject = JSON.parse('{"extended.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAANElEQVR4nGNggABGEMEEIlhABAeI+AASF0AlHmAqA4kzKAAx8wGQuAMKwd6AoYzBAWonAwAcLwTgNfJ3RQAAAABJRU5ErkJggg==","ray.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAMklEQVR4nGNgQAJMIIIFRHCACAEQoQAiHICYvQEkjkrwYypjAIkzwk2zAREuqIQFzD4AE3kE4BEmGggAAAAASUVORK5CYII=","segment.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAgMAAAC5h23wAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAlQTFRFAAAATU1NJCQkCxcHIQAAAAN0Uk5TAP8SmutI5AAAACxJREFUeJxjYMACGAMgNAsLdpoVKi8AVe8A1QblQlWRKt0AoULw2w1zGxoAABdiAviQhF/mAAAAAElFTkSuQmCC","add.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAH5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoKBgYGGxsbKioqPz8/Pj4+BQUFCQkJAQEBZGRkh4eHAgICEBAQNjY2g4ODgYGBAAAAAwMDeXl5d3d3GBgYERERgICAgICANDQ0PDw8Y2NjCAgIhYWFGhoaJycnOjo6YWFhgICAdXV14Y16sQAAACp0Uk5TAAILDxIKESEnJiYoKCgTKSkpKCAnKSkFKCkpJiDl/ycpKSA2JyYpKSkpOkQ+xgAAARdJREFUeJzllNt2gyAQRTWiRsHLoDU0GpPYmMv//2BMS+sgl6Z9bM8bi73gnJkBz/sn8lcBIUHofwtG8TpJKUuTLI6cYF7QEqRKynP71VX9AkhNXVlsbMQrLLQVGyPZLsGHWgPrCxMJwHUPlXa79NBp2et5d9f3u3m1XxatQNn7SagOXCUjCjYUDuqxcWlHj4MSfw12FDJchFViRN8+1qcQoUH6lR1L1mEMEErofB6WzEUwylzomfzOQGiOJdXiWH7mQoUyMa4WXJQWOBvLFvPCGxt6FSr5kyH0qi0YddNG2/pgCsOjff4ZTizXPNwKIzl56OoGg9d9Z/+5cs6On+CFCfevFQ3ZaTycx1YMbvDdRvjkp/lHdAcPXzokxcwfDwAAAABJRU5ErkJggg==","cursor.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAgMAAAC5h23wAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAxQTFRFAAAATU1NTU1NTU1NwlMHHwAAAAR0Uk5TAOvhxbpPrUkAAAAkSURBVHicY2BgYHBggAByabxg1WoGBq2pRCk9AKUbcND43AEAufYHlSuusE4AAAAASUVORK5CYII=","display_off.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAU1QTFRFAAAAh4eHh4eHAAAAAAAAAAAAAwMDAAAAAAAAhoaGGBgYgYGBAAAAPz8/AgICg4ODCQkJhISEh4eHh4eHPj4+NjY2gYGBg4ODgYGBgYGBgoKCAQEBJycngoKChYWFEBAQg4ODCAgIKioqZGRkCgoKBQUFERERd3d3gYGBGxsbNDQ0hISEgYGBPDw8gYGBgYGBh4eHh4eHhYWFh4eHgoKChYWFgYGBgYGBg4ODhoaGg4ODYWFhgoKCBgYGdXV1goKCg4ODgYGBgICAgYGBAAAAg4ODhYWFhISEh4eHgoKChYWFOjo6goKCGhoah4eHh4eHh4eHgoKCh4eHeXl5hoaGgoKChISEgYGBgYGBgoKCY2NjgYGBgoKCh4eHgoKCgYGBhoaGg4ODhoaGhYWFh4eHgYGBhoaGhoaGhoaGg4ODgoKChISEgoKChYWFh4eHfKktUwAAAG90Uk5TACn/AhEFKA8SLCbxCigoVBNKUTYoJ/lh3PyAKSaTNiBtICYpISggKSkmJ0LEKef3lGxA8rn//+pcMSkpnCcptHPJKe0LUjnx5LzKKaMnX73hl64pLnhkzNSgKeLv17LQ+liIzaLe7PfTw5tFpz3K1fXR/gAAAgBJREFUeJzllNdXwjAUxknB0lIoCKVsGTIFQRAZ7r333nuv///R3LZ4mlDQZ/0ekp7b37n5bnITk+mfyDxv5Tir3fwjaElO5BIOKZFLJS1dQVfI0Y809TtEV+elo95RpFPWG+1go4fdQ5QybI8haaNBkM2ANbM09bnrwaPY7iFKrz7EMBdu7CHdVruXIt0M1hb+GKA3LTRKkp5lTA6Dg6xIkhaHhvQ1IlW/UCouQdJNJTRIpk1qO7+wUpcfpl537oBc7VNip3Gi/AmVPBAC1UrL6HXtSGVT+k2Yz0Focad07OMRf3P5BEbd63PFQx7HN+w61JoAm+uBlV48O/0jkLSMmtPCmQ8HwlYdykFV4/LJPp7e3hVyFdapHNehLk6PSjhSkBvwu/cFyJGIYvOyhoc1jjYQFGbygD4CWjoAMla/og3YoSw+KPhjPNoFcim4iFD+pFYA8zZ9WeYU5OBjZ3ORWyCfG03E+47kKpCIJTpGO4KP8XMgtw990xG/PBNTgmPEEXwf7P42oOdFIRAoBCtqTKL6Rcwq4Xsgh5xYC/mmSs6yJKk1YbnVeTq1NaEpmlHbmVn2EORkW2trF2ZzmHGTSUMGl1a9hp4ySRpdQ8yKGURpMmRIYg9pb1YPzg6kO79cLlE6bYFjEtv91bLEUxvhwbWwjY13BxUb9l8+mn9EX8x3Nki8ff5wAAAAAElFTkSuQmCC","display_on.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAR1QTFRFAAAAh4eHgYGBAAAAAAAAgYGBAAAAAwMDAAAAAAAAgYGBg4ODGBgYgYGBhISEAAAAPz8/AgIChoaGCQkJhYWFPj4+NjY2goKCgYGBAQEBJycngYGBgoKCEBAQCAgIhISEKioqZGRkCgoKBQUFERERd3d3gYGBg4ODgYGBGxsbNDQ0hISEgoKCgoKChYWFPDw8gYGBgYGBhoaGgoKCg4ODgoKCgYGBgoKCgoKCgoKCg4ODgoKChoaGgoKCgYGBhoaGg4ODYWFhBgYGdXV1gYGBg4ODgoKCgICAg4ODg4ODhISEAAAAg4ODOjo6gYGBGhoaeXl5goKCgYGBgoKChYWFgoKChISEgoKCY2NjgYGBg4ODgYGBgYGBg4ODgYGBo8n54AAAAF90Uk5TACn/AhH3BSgPEuhUJvFACigoLBM2KCeA6ykm+pMgIEkmKSEoICn9XCkmJ0u6nDop4sUypGuEzLZ6vmCYLZ/dLykpJynUYa8pcllCC1Ip2ycpisl1PadFsintbsPQZdi/bTW7AAAB4UlEQVR4nOWUZ1fCMBSGSSGWFiq0UDbIkr2XbBwMxS0b1P//M0xK9XSiftX7oel585zkvfcmMRj+SRhvzRRlthm/BU3Ry3TYzofTsajpIOjw2iNAjIiddehvHXSdA0mkXEEdG0fkE1DEKXmkSVqVIA6rBmsktUgAWLWHoGp30UNclbtLmwQgoyya91wPTbFy0mQXJ5zJQO6BgXRjfH0iSkX5stHIXr5r0bB/lu8syjR8rzsFbR2SpX+5J2eMP3csLtYsEY2K8BeTFuE2jaVCBw7bHOBuxq16AXmpbui3LtIfbRLUHMY2q4lcFo2WB4KA1SUAlWumNEKCzyxBKZxVHvYGaFguCBx1vM/x0IPzoqQoj5SdP4mns2cCGhBsrgj0uaeUBtzMyxQN8w4mYROTW8+r0oANp8W5mf6WQw5aCYJ2o7ymPaKMi2uVpmWM4TW6tdImgGo1bT4nK6DbbsCc0AZSdmLEFszzHrh6riVvRrNA3/9SE8QLWQu+Gjto9+gE9NBMwr9zi83gFeeFTe11zpm1CHE3HeyVCSknf3MIDcFTbfJKdbR1L4xX49L+/BoillV5uPJqkshD3JWSgpNMXP/lcrD8+hO84MnDr5YpFHv0Fe99VjJ0GBRs2H74aP6R+ACr+TFvZNAQ1wAAAABJRU5ErkJggg==","down.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAKVQTFRFAAAAg4ODgICAAAAAAAAAAAAACAgIAAAAAAAAAAAAAAAAOTk5hYWFEBAQfHx8ODg4dnZ2NDQ0XV1dGxsbKCgogICAFBQUIiIiZGRkgICAgICAFRUVAAAAgICAgICAgICAf39/Li4ugICAcHBwgoKCgICAgoKCgICAg4ODgYGBPj4+goKCgICAhISEgYGBgICAgoKCgICAgYGBgYGBf39/gICAgICAIdPQHAAAADd0Uk5TACn/KAIRIBMFDwooKyApKSknKSYmzCcmKfL7JRCUi2L3J7IpcLUrr0VbKXntNEnkMbxrUcG56CMpi50AAAFZSURBVHic5ZRpf4MgDIeFKFatWm/tfW091u7evv9Hm1Acoujm2y0vFPH5Jf+EEE37J6bblmlatv4jaBCI4rMfR0CMXtAEJ0fccgfM7tAkQHXzArdDxggmqGETGCnJWROkNlOwOqhIhKCtgbSicw1uK/dATSK0aRatIzytA8ik4XSiyJnLSm+VPxULgeyLI3uHRJH+qcB4WZGrKb4c20WwI7b3iUt74OS6XD+xZWrXUCtme0uKTvfcJ65CZFa9VOebqwXmft+oT8yF+/VymT4XeGB+Xx8L+j4gBcoFIDT+oMz6Qp93Y74pCeBpUXaLuW0rUk6r1iv3nP322ewYkgv2nZIvgpSPQDrY5wTjRJDNg9XAE/+uSXIVX812GdKEmtvR2rtWaw+5MAOuofJy79SXu9TgBl4d9DZdI0NjgyiswNCB/qk1J5Bmvp+lQOa9IJNhW4bxm6H5R+wLQYMSQXZNzbcAAAAASUVORK5CYII=","price_range.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAIUlEQVR4nGNggAPm/w9gTA4QIQMitECEJ1yMEgLNDiAAADfgBMRu78GgAAAAAElFTkSuQmCC","price_time.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAOklEQVR4nGNggAPm/w9gTA4QIQPEClpMQMITRHCACScQoQQihBgY9P//grKgYk5wdTACYhQHFjuAAABZFAlc4e1fcQAAAABJRU5ErkJggg==","remove.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAK5QTFRFAAAAh4eHgICAAAAAAAAAh4eHAAAAAwMDAAAAAAAAgICAGBgYAAAAPz8/AgICgICACQkJhoaGhoaGgICAPj4+NjY2gYGBg4ODgYGBAQEBJycngoKCEBAQgICAgICACAgIKioqZGRkCgoKBQUFERERd3d3gYGBGxsbNDQ0gICAPDw8YWFhBgYGdXV1gICAg4ODgICAAAAAOjo6GhoaeXl5gICAhYWFY2NjhYWFgICA9O0oCgAAADp0Uk5TACn/AhErBSgPEvEmCigowxMuMcgoJ7hWrCkmdCD6vSAmKSEoICkpJie6KSknKSkp0wspJynCMik11rrLte8AAAFwSURBVHic5ZTXkoIwFIZNAAPSpKkoRQV7Wcva3v/FFiRmEwise7t7bs7MP98k/ylJq/VPQjjKiiJrwo+gON0uxro7XiRTsRHs+voE4JjoRrf+6sD7AFTMvaDGRht9glLMUJtLqmUwD5XDCohHAmBUPQSV27GHtFK7xycBWJab5uPaR+Hlmue7GfZxHwyWFHVMQghXFgD2A8IOZtfssdNJIXcyFEaSfchzp9BuMVP+Fhvr5Qh0nGfqYTGhm3BcYFUaQBKOhMWzRqHyGFRY03ppQ5lCFZ30RloVZGQTaa3QqEt0OyrQnkSkk8I1YJkvAwPCMgY0UpbzXRZhVbosIWGbZTLNQszGMCM42FJEjWDDjIAMtp+xj6x2K+/DqNDc0r4Yc8yGl3uer2aIyT1iyd8sYSuY8cldZbVrH4zPebTvP8OMNSoedj6XzDyk3pwG98u0/ufqGu7tBW5c1PxriXFyHq5PQxXFzeDThvbmp/lH4gt6WxfZ03H8DwAAAABJRU5ErkJggg==","settings.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAW5QTFRFAAAAAAAAAAAAAAAAAAAAAAAAAAAACgoKBgYGGxsbKioqQEBAPj4+BQUFCAgIAQEBPz8/ZWVlh4eHZGRkAgICCQkJDw8PNjY2g4ODgoKCNTU1EBAQAAAAAwMDeXl5d3d3AAAAGBgYAAAAERERioqKgoKCgoKCgoKCgYGBgoKChISEhoaGNDQ0g4ODgICAgICAgICAgYGBgYGBhYWFgICAgICAPT09AAAAgYGBgICAgICAgICAgICAY2NjCAgIgICAgICAhYWFhYWFgYGBHBwcgICAhYWFGhoagYGBgYGBg4ODhoaGJycnAAAAhISEgICAg4ODPDw8AAAAgoKCgICAhISEOjo6h4eHgoKCgYGBgICAf39/gYGBgoKCgICAGBgYgYGBg4ODg4ODgICACwsLgYGBgICAgYGBgYGBgYGBgICAgYGBYWFhf39/g4ODPj4+gYGBg4ODgICAhYWFgoKCgYGBgICAgYGBgoKCdXV1T0kC9QAAAHp0Uk5TAAILDxMKESEnJiYpKSgTKSgpKSkoEyAnKSknIAYoKSkFJQEgKl94jYVvVC4nU9f/+K8pOu71KBCi3NPq/ikg0e01Nokm1UUnsZVqQSYOT9lrKRJz5lIpK12jyu+sesgnhGVLxCG55a6Um+GaKfJCKKRgKUt8ocergymDQ9knAAABsElEQVR4nOWUV1vCMBSGg1AQpBZrcVdE3KJxo4LgnuCoe4F7orjHv7doTk3bgF7rd5OnX94nZ+SkCP0TWQqsNpuVs/wI2h2FTleR2+XkHfa8YLHgKRGJSj2SN3fosvIKkVJlVXWONGrkWtEgn1zHJP1GMCs/g7XILFIUpXoTWmaKTnIImGovh72Gxqbmlta2dvgOGpsmQO0dnfhTXd3E6JH0pN1DNnr7MFE/HDsQ0qEO6Pxg9sCh4XDkGx2J6sovBD+G8eiYuo5PxLTKeLoJBZNgT2EcnjY0YYajUKsL7Fk1gcjU3PwChcYTFGorAnsRqlpa1tAVhUbdmr+6RtjIOlgbCjMBUdzc2t7ZzbJ7zAQ4p6GSfRVNwkeKLsvCg31w2JBdjlT0GDxZNzEnpcQ+xWfnFxeXVyp6Tay07gq+L/YUOoBvbomV0V8skiq//DutWfeEfJD1JPLCED4+Pb8kX986tApNQ4iqfSJT76bRzvlgBPODQXW/foYqK5lyeBeYJEL1gaoeGnwIBhjRoQ9SZgTAdEbO/9cKRfmZ+MpGPCVHQ3nBzzS4hKIkuNyh/5g+ALiAXSSas9hwAAAAAElFTkSuQmCC","time_range.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAAJElEQVR4nGNgwAsUGJhQCScQoQQihBgY9P//grKgYk4YOvACACOpBKG6Svj+AAAAAElFTkSuQmCC","trash.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABkAAAAZAQMAAAD+JxcgAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAAZQTFRFAAAATU1NkJ+rOQAAAAJ0Uk5TAP9bkSK1AAAALUlEQVR4nGNgAIN6ENHQACX4//9gYBBgYIESYC4LkA0lPEkmGFAI5v8PILYCAHygDJxlK0RUAAAAAElFTkSuQmCC","up.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACoAAAAqCAMAAADyHTlpAAAAAXNSR0IB2cksfwAAAAlwSFlzAAALEwAACxMBAJqcGAAAAMZQTFRFAAAAh4eHgICAAAAAAAAAAAAAAwMDAAAAAAAAGBgYAAAAPz8/AgICCQkJgICAh4eHPj4+NjY2AQEBJycnEBAQgICAgICACAgIKioqZGRkCgoKBQUFgYGBERERd3d3gYGBGxsbNDQ0gICAgYGBPDw8gYGBh4eHgICAYWFhBgYGgYGBdXV1goKCg4ODhYWFgICAgoKCAAAAhISEOjo6gICAGhoagYGBeXl5hoaGgICAY2Njg4ODgoKCgoKCgYGBgoKCg4ODgoKC64uw1gAAAEJ0Uk5TACn/AhEFKA8SJgooKBP7KignKSYg9c0gJikhKLQgKSkmJ7ywKY8s5SknlClxKTMpXwtFKe0neiku8ClKWmSbbFFjM5GHSgAAAW5JREFUeJzllGd/gjAQxk3AMFWWOHDvVa2rVbu//5cqhJWQQO3b9nkVjv/v7rnLKJX+iYS9JMuSKvwIiu3loKkZzYHXFgvBiqW1QKSWplfySzvmAyDUN50cG2X0DDLqoTKXVLJgIIXDCohHAqCzHhymeuShy/Ru8kkAhtmhWUTvW9fdEnPQaVLU0n8XF0L3kn5P6LTtZPKgNoK+RrUkcGtQ7S9TsgOxxinrkUPYD+LwLCIh7CTsWSVQqRmTuPqpitlZFLQlApXjrsYBc335wOw47ksmUSMMrgKi/gnAE/awCqNHmTUwDf5X34LlBuedsgbUsK15kPMxTIXzzvFSIdsSPBw7nGD1K+7bL3F9xStEnZhoCw71TbpL71GBBbUF1MZmZWTOi97PI3eIJn9zCEtOj0+umaOde2EszqW9/xr6rM54WFtc0vfQNak57Ibd/Jerohu3GFwYqPjVEhve2Z4cbQU1ikFsQ73z0fwj+ga3VBezGuggFQAAAABJRU5ErkJggg==","gear.png":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAACAAAAAgCAQAAADZc7J/AAAABGdBTUEAALGPC/xhBQAAACBjSFJNAAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAHdElNRQfnAQcPAREf1cYdAAABVklEQVRIx82VTU7DMBCFP6iaIjVIvQKI8neKNjStBCfpEVBZp2UPF+AIhFUL4gyV+FmHtll3hdiZjZE8sRMSkBDPm1jvzfOMPXbg/8LjkhSFYsUEr7rBBGWMcXWDVBikVcPrIlyhqLuFm8b3FgNCXW3fUvb1zoQMaLis9lnoZCMi1lYGayIiXdiCdja8xtwKKRpzatJgWClcoRhKg5fKBq/S4MMhuaVDkyZdYgf7Lg0eLcG54EcWfy8Njkgyq2chs0g4yApaTA1BxzIIDHZKy9UJu4bEt9htg91xd2IxNnK+jRJmxhrdwhJmdgnHvIlNii2Du8wmHn53jCPBX1j8gzRwNVJMgI9PkFnd2UjPlVv5SZ7CVenT+MK1nP76OkNbN3OZByVhz5VUg5AT/aSdWQanAHj06LmfNInSj2o+ViJ8mSfLvws3BbNS8BjrLJZEP/m1/RU+AaMscqqNBvrlAAAAJXRFWHRkYXRlOmNyZWF0ZQAyMDIzLTAxLTA3VDE1OjAxOjE2KzAwOjAw32e/YAAAACV0RVh0ZGF0ZTptb2RpZnkAMjAyMy0wMS0wN1QxNTowMToxNiswMDowMK46B9wAAAAodEVYdGRhdGU6dGltZXN0YW1wADIwMjMtMDEtMDdUMTU6MDE6MTcrMDA6MDBfWC23AAAAAElFTkSuQmCC"}');
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/defineProperty.js

function _defineProperty(obj, key, value) {
  key = _toPropertyKey(key);
  if (key in obj) {
    Object.defineProperty(obj, key, {
      value: value,
      enumerable: true,
      configurable: true,
      writable: true
    });
  } else {
    obj[key] = value;
  }
  return obj;
}
;// CONCATENATED MODULE: ./src/components/primitives/pin.js



// Semi-automatic pin object. For stretching things.


var Pin = /*#__PURE__*/function () {
  // (Comp reference, a name in overlay settings,
  // pin parameters)
  function Pin(comp, name, params) {
    var _this = this;
    if (params === void 0) {
      params = {};
    }
    classCallCheck_classCallCheck(this, Pin);
    this.RADIUS = comp.$props.config.PIN_RADIUS || 5.5;
    this.RADIUS_SQ = Math.pow(this.RADIUS + 7, 2);
    if (utils.is_mobile) {
      this.RADIUS += 2;
      this.RADIUS_SQ *= 2.5;
    }
    this.COLOR_BACK = comp.$props.colors.back;
    this.COLOR_BR = comp.$props.colors.text;
    this.comp = comp;
    this.layout = comp.layout;
    this.mouse = comp.mouse;
    this.name = name;
    this.state = params.state || 'settled';
    this.hidden = params.hidden || false;
    this.mouse.on('mousemove', function (e) {
      return _this.mousemove(e);
    });
    this.mouse.on('mousedown', function (e) {
      return _this.mousedown(e);
    });
    this.mouse.on('mouseup', function (e) {
      return _this.mouseup(e);
    });
    if (comp.state === 'finished') {
      this.state = 'settled';
      this.update_from(comp.$props.settings[name]);
    } else {
      this.update();
    }
    if (this.state !== 'settled') {
      this.comp.$emit('scroll-lock', true);
    }
  }
  createClass_createClass(Pin, [{
    key: "re_init",
    value: function re_init() {
      this.update_from(this.comp.$props.settings[this.name]);
    }
  }, {
    key: "draw",
    value: function draw(ctx) {
      if (this.hidden) return;
      switch (this.state) {
        case 'tracking':
          break;
        case 'dragging':
          if (!this.moved) this.draw_circle(ctx);
          break;
        case 'settled':
          this.draw_circle(ctx);
          break;
      }
    }
  }, {
    key: "draw_circle",
    value: function draw_circle(ctx) {
      this.layout = this.comp.layout;
      if (this.comp.selected) {
        var r = this.RADIUS,
          lw = 1.5;
      } else {
        var r = this.RADIUS * 0.95,
          lw = 1;
      }
      ctx.lineWidth = lw;
      ctx.strokeStyle = this.COLOR_BR;
      ctx.fillStyle = this.COLOR_BACK;
      ctx.beginPath();
      ctx.arc(this.x = this.layout.t2screen(this.t), this.y = this.layout.$2screen(this.y$), r + 0.5, 0, Math.PI * 2, true);
      ctx.fill();
      ctx.stroke();
    }
  }, {
    key: "update",
    value: function update() {
      this.y$ = this.comp.$props.cursor.y$;
      this.y = this.comp.$props.cursor.y;
      this.t = this.comp.$props.cursor.t;
      this.x = this.comp.$props.cursor.x;

      // Save pin as time in IB mode
      //if (this.layout.ti_map.ib) {
      //    this.t = this.layout.ti_map.i2t(this.t )
      //}

      // Reset the settings attahed to the pin (position)
      this.comp.$emit('change-settings', _defineProperty({}, this.name, [this.t, this.y$]));
    }
  }, {
    key: "update_from",
    value: function update_from(data, emit) {
      if (emit === void 0) {
        emit = false;
      }
      if (!data) return;
      this.layout = this.comp.layout;
      this.y$ = data[1];
      this.y = this.layout.$2screen(this.y$);
      this.t = data[0];
      this.x = this.layout.t2screen(this.t);

      // TODO: Save pin as time in IB mode
      //if (this.layout.ti_map.ib) {
      //    this.t = this.layout.ti_map.i2t(this.t )
      //}

      if (emit) this.comp.$emit('change-settings', _defineProperty({}, this.name, [this.t, this.y$]));
    }
  }, {
    key: "rec_position",
    value: function rec_position() {
      this.t1 = this.t;
      this.y$1 = this.y$;
    }
  }, {
    key: "mousemove",
    value: function mousemove(event) {
      switch (this.state) {
        case 'tracking':
        case 'dragging':
          this.moved = true;
          this.update();
          break;
      }
    }
  }, {
    key: "mousedown",
    value: function mousedown(event, force) {
      if (force === void 0) {
        force = false;
      }
      if (utils.default_prevented(event) && !force) return;
      switch (this.state) {
        case 'tracking':
          this.state = 'settled';
          if (this.on_settled) this.on_settled();
          this.comp.$emit('scroll-lock', false);
          break;
        case 'settled':
          if (this.hidden) return;
          if (this.hover()) {
            this.state = 'dragging';
            this.moved = false;
            this.comp.$emit('scroll-lock', true);
            this.comp.$emit('object-selected');
          }
          break;
      }
      if (this.hover()) {
        event.preventDefault();
      }
    }
  }, {
    key: "mouseup",
    value: function mouseup(event) {
      switch (this.state) {
        case 'dragging':
          this.state = 'settled';
          if (this.on_settled) this.on_settled();
          this.comp.$emit('scroll-lock', false);
          break;
      }
    }
  }, {
    key: "on",
    value: function on(name, handler) {
      switch (name) {
        case 'settled':
          this.on_settled = handler;
          break;
      }
    }
  }, {
    key: "hover",
    value: function hover() {
      var x = this.x;
      var y = this.y;
      return (x - this.mouse.x) * (x - this.mouse.x) + (y - this.mouse.y) * (y - this.mouse.y) < this.RADIUS_SQ;
    }
  }]);
  return Pin;
}();

;// CONCATENATED MODULE: ./src/components/primitives/seg.js


// Draws a segment, adds corresponding collision f-n



var Seg = /*#__PURE__*/function () {
  // Overlay ref, canvas ctx
  function Seg(overlay, ctx) {
    classCallCheck_classCallCheck(this, Seg);
    this.ctx = ctx;
    this.comp = overlay;
    this.T = overlay.$props.config.TOOL_COLL;
    if (utils.is_mobile) this.T *= 2;
  }

  // p1[t, $], p2[t, $] (time-price coordinates)
  createClass_createClass(Seg, [{
    key: "draw",
    value: function draw(p1, p2) {
      var layout = this.comp.$props.layout;
      var x1 = layout.t2screen(p1[0]);
      var y1 = layout.$2screen(p1[1]);
      var x2 = layout.t2screen(p2[0]);
      var y2 = layout.$2screen(p2[1]);
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      this.comp.collisions.push(this.make([x1, y1], [x2, y2]));
    }

    // Collision function. x, y - mouse coord.
  }, {
    key: "make",
    value: function make(p1, p2) {
      var _this = this;
      return function (x, y) {
        return math.point2seg([x, y], p1, p2) < _this.T;
      };
    }
  }]);
  return Seg;
}();

;// CONCATENATED MODULE: ./src/components/primitives/line.js


// Draws a line, adds corresponding collision f-n



var Line = /*#__PURE__*/function () {
  // Overlay ref, canvas ctx
  function Line(overlay, ctx) {
    classCallCheck_classCallCheck(this, Line);
    this.ctx = ctx;
    this.comp = overlay;
    this.T = overlay.$props.config.TOOL_COLL;
    if (utils.is_mobile) this.T *= 2;
  }

  // p1[t, $], p2[t, $] (time-price coordinates)
  createClass_createClass(Line, [{
    key: "draw",
    value: function draw(p1, p2) {
      var layout = this.comp.$props.layout;
      var x1 = layout.t2screen(p1[0]);
      var y1 = layout.$2screen(p1[1]);
      var x2 = layout.t2screen(p2[0]);
      var y2 = layout.$2screen(p2[1]);
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      var w = layout.width;
      var h = layout.height;
      // TODO: transform k (angle) to screen ratio
      // (this requires a new a2screen function)
      var k = (y2 - y1) / (x2 - x1);
      var s = Math.sign(x2 - x1 || y2 - y1);
      var dx = w * s * 2;
      var dy = w * k * s * 2;
      if (dy === Infinity) {
        dx = 0, dy = h * s;
      }
      this.ctx.moveTo(x2, y2);
      this.ctx.lineTo(x2 + dx, y2 + dy);
      if (!this.ray) {
        this.ctx.moveTo(x1, y1);
        this.ctx.lineTo(x1 - dx, y1 - dy);
      }
      this.comp.collisions.push(this.make([x1, y1], [x2, y2]));
    }

    // Collision function. x, y - mouse coord.
  }, {
    key: "make",
    value: function make(p1, p2) {
      var _this = this;
      var f = this.ray ? math.point2ray.bind(math) : math.point2line.bind(math);
      return function (x, y) {
        return f([x, y], p1, p2) < _this.T;
      };
    }
  }]);
  return Line;
}();

;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/setPrototypeOf.js
function _setPrototypeOf(o, p) {
  _setPrototypeOf = Object.setPrototypeOf ? Object.setPrototypeOf.bind() : function _setPrototypeOf(o, p) {
    o.__proto__ = p;
    return o;
  };
  return _setPrototypeOf(o, p);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/inherits.js

function _inherits(subClass, superClass) {
  if (typeof superClass !== "function" && superClass !== null) {
    throw new TypeError("Super expression must either be null or a function");
  }
  subClass.prototype = Object.create(superClass && superClass.prototype, {
    constructor: {
      value: subClass,
      writable: true,
      configurable: true
    }
  });
  Object.defineProperty(subClass, "prototype", {
    writable: false
  });
  if (superClass) _setPrototypeOf(subClass, superClass);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/assertThisInitialized.js
function _assertThisInitialized(self) {
  if (self === void 0) {
    throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
  }
  return self;
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/possibleConstructorReturn.js


function _possibleConstructorReturn(self, call) {
  if (call && (typeof_typeof(call) === "object" || typeof call === "function")) {
    return call;
  } else if (call !== void 0) {
    throw new TypeError("Derived constructors may only return object or undefined");
  }
  return _assertThisInitialized(self);
}
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/getPrototypeOf.js
function _getPrototypeOf(o) {
  _getPrototypeOf = Object.setPrototypeOf ? Object.getPrototypeOf.bind() : function _getPrototypeOf(o) {
    return o.__proto__ || Object.getPrototypeOf(o);
  };
  return _getPrototypeOf(o);
}
;// CONCATENATED MODULE: ./src/components/primitives/ray.js





function _createSuper(Derived) { var hasNativeReflectConstruct = _isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function _isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
// Draws a ray, adds corresponding collision f-n


var Ray = /*#__PURE__*/function (_Line) {
  _inherits(Ray, _Line);
  var _super = _createSuper(Ray);
  function Ray(overlay, ctx) {
    var _this;
    classCallCheck_classCallCheck(this, Ray);
    _this = _super.call(this, overlay, ctx);
    _this.ray = true;
    return _this;
  }
  return createClass_createClass(Ray);
}(Line);

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/LineTool.vue?vue&type=script&lang=js&
// Line drawing tool
// TODO: make an angle-snap when "Shift" is pressed








/* harmony default export */ const LineToolvue_type_script_lang_js_ = ({
  name: 'LineTool',
  mixins: [overlay, tool],
  data: function data() {
    return {};
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color: function color() {
      return this.sett.color || '#42b28a';
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '1.1.0'
      };
    },
    tool: function tool() {
      return {
        // Descriptor for the tool
        group: 'Lines',
        icon: icons_namespaceObject["segment.png"],
        type: 'Segment',
        hint: 'This hint will be shown on hover',
        data: [],
        // Default data
        settings: {},
        // Default settings
        // Modifications
        mods: {
          'Extended': {
            // Rewrites the default setting fields
            settings: {
              extended: true
            },
            icon: icons_namespaceObject["extended.png"]
          },
          'Ray': {
            // Rewrites the default setting fields
            settings: {
              ray: true
            },
            icon: icons_namespaceObject["ray.png"]
          }
        }
      };
    },
    // Called after overlay mounted
    init: function init() {
      var _this = this;
      // First pin is settled at the mouse position
      this.pins.push(new Pin(this, 'p1'));
      // Second one is following mouse until it clicks
      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking'
      }));
      this.pins[1].on('settled', function () {
        // Call when current tool drawing is finished
        // (Optionally) reset the mode back to 'Cursor'
        _this.set_state('finished');
        _this.$emit('drawing-mode-off');
      });
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;
      ctx.beginPath();
      if (this.sett.ray) {
        new Ray(this, ctx).draw(this.p1, this.p2);
      } else if (this.sett.extended) {
        new Line(this, ctx).draw(this.p1, this.p2);
      } else {
        new Seg(this, ctx).draw(this.p1, this.p2);
      }
      ctx.stroke();
      this.render_pins(ctx);
    },
    use_for: function use_for() {
      return ['LineTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/LineTool.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_LineToolvue_type_script_lang_js_ = (LineToolvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/LineTool.vue
var LineTool_render, LineTool_staticRenderFns
;



/* normalize component */
;
var LineTool_component = normalizeComponent(
  overlays_LineToolvue_type_script_lang_js_,
  LineTool_render,
  LineTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const LineTool = (LineTool_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/overlays/RangeTool.vue?vue&type=script&lang=js&

// Price/Time measurment tool






/* harmony default export */ const RangeToolvue_type_script_lang_js_ = ({
  name: 'RangeTool',
  mixins: [overlay, tool],
  data: function data() {
    return {};
  },
  // Define internal setting & constants here
  computed: {
    sett: function sett() {
      return this.$props.settings;
    },
    p1: function p1() {
      return this.$props.settings.p1;
    },
    p2: function p2() {
      return this.$props.settings.p2;
    },
    line_width: function line_width() {
      return this.sett.lineWidth || 0.9;
    },
    color: function color() {
      return this.sett.color || this.$props.colors.cross;
    },
    back_color: function back_color() {
      return this.sett.backColor || '#9b9ba316';
    },
    value_back: function value_back() {
      return this.sett.valueBack || '#9b9ba316';
    },
    value_color: function value_color() {
      return this.sett.valueColor || this.$props.colors.text;
    },
    prec: function prec() {
      return this.sett.precision || 2;
    },
    new_font: function new_font() {
      return '12px ' + this.$props.font.split('px').pop();
    },
    price: function price() {
      return 'price' in this.sett ? this.sett.price : true;
    },
    time: function time() {
      return 'time' in this.sett ? this.sett.time : false;
    },
    shift: function shift() {
      return this.sett.shiftMode;
    }
  },
  methods: {
    meta_info: function meta_info() {
      return {
        author: 'C451',
        version: '2.0.1'
      };
    },
    tool: function tool() {
      return {
        // Descriptor for the tool
        group: 'Measurements',
        icon: icons_namespaceObject["price_range.png"],
        type: 'Price',
        hint: 'Price Range',
        data: [],
        // Default data
        settings: {},
        // Default settings
        mods: {
          'Time': {
            // Rewrites the default setting fields
            icon: icons_namespaceObject["time_range.png"],
            settings: {
              price: false,
              time: true
            }
          },
          'PriceTime': {
            // Rewrites the default setting fields
            icon: icons_namespaceObject["price_time.png"],
            settings: {
              price: true,
              time: true
            }
          },
          'ShiftMode': {
            // Rewrites the default setting fields
            settings: {
              price: true,
              time: true,
              shiftMode: true
            },
            hidden: true
          }
        }
      };
    },
    // Called after overlay mounted
    init: function init() {
      var _this = this;
      // First pin is settled at the mouse position
      this.pins.push(new Pin(this, 'p1', {
        hidden: this.shift
      }));
      // Second one is following mouse until it clicks
      this.pins.push(new Pin(this, 'p2', {
        state: 'tracking',
        hidden: this.shift
      }));
      this.pins[1].on('settled', function () {
        // Call when current tool drawing is finished
        // (Optionally) reset the mode back to 'Cursor'
        _this.set_state('finished');
        _this.$emit('drawing-mode-off');
        // Deselect the tool in shiftMode
        if (_this.shift) _this._$emit('custom-event', {
          event: 'object-selected',
          args: []
        });
      });
    },
    draw: function draw(ctx) {
      if (!this.p1 || !this.p2) return;
      var dir = Math.sign(this.p2[1] - this.p1[1]);
      var layout = this.$props.layout;
      var xm = layout.t2screen((this.p1[0] + this.p2[0]) * 0.5);
      ctx.lineWidth = this.line_width;
      ctx.strokeStyle = this.color;

      // Background
      ctx.fillStyle = this.back_color;
      var x1 = layout.t2screen(this.p1[0]);
      var y1 = layout.$2screen(this.p1[1]);
      var x2 = layout.t2screen(this.p2[0]);
      var y2 = layout.$2screen(this.p2[1]);
      ctx.fillRect(x1, y1, x2 - x1, y2 - y1);
      if (this.price) this.vertical(ctx, x1, y1, x2, y2, xm);
      if (this.time) this.horizontal(ctx, x1, y1, x2, y2, xm);
      this.draw_value(ctx, dir, xm, y2);
      this.render_pins(ctx);
    },
    vertical: function vertical(ctx, x1, y1, x2, y2, xm) {
      var layout = this.$props.layout;
      var dir = Math.sign(this.p2[1] - this.p1[1]);
      ctx.beginPath();
      if (!this.shift) {
        // Top
        new Seg(this, ctx).draw([this.p1[0], this.p2[1]], [this.p2[0], this.p2[1]]);
        // Bottom
        new Seg(this, ctx).draw([this.p1[0], this.p1[1]], [this.p2[0], this.p1[1]]);
      }

      // Vertical Arrow
      ctx.moveTo(xm - 4, y2 + 5 * dir);
      ctx.lineTo(xm, y2);
      ctx.lineTo(xm + 4, y2 + 5 * dir);
      ctx.stroke();

      // Vertical Line
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      new Seg(this, ctx).draw([(this.p1[0] + this.p2[0]) * 0.5, this.p2[1]], [(this.p1[0] + this.p2[0]) * 0.5, this.p1[1]]);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    horizontal: function horizontal(ctx, x1, y1, x2, y2, xm) {
      var layout = this.$props.layout;
      var xdir = Math.sign(this.p2[0] - this.p1[0]);
      var ym = (layout.$2screen(this.p1[1]) + layout.$2screen(this.p2[1])) / 2;
      ctx.beginPath();
      if (!this.shift) {
        // Left
        new Seg(this, ctx).draw([this.p1[0], this.p1[1]], [this.p1[0], this.p2[1]]);
        // Right
        new Seg(this, ctx).draw([this.p2[0], this.p1[1]], [this.p2[0], this.p2[1]]);
      }

      // Horizontal Arrow
      ctx.moveTo(x2 - 5 * xdir, ym - 4);
      ctx.lineTo(x2, ym);
      ctx.lineTo(x2 - 5 * xdir, ym + 4);
      ctx.stroke();

      // Horizontal Line
      ctx.beginPath();
      ctx.setLineDash([5, 5]);
      ctx.moveTo(x1, ym);
      ctx.lineTo(x2, ym);
      ctx.stroke();
      ctx.setLineDash([]);
    },
    // WTF? I know dude, a lot of shitty code here
    draw_value: function draw_value(ctx, dir, xm, y) {
      var _this2 = this;
      ctx.font = this.new_font;
      // Price delta (anf percent)
      //let d$ = (this.p2[1] - this.p1[1]).toFixed(this.prec)
      //let p = (100 * (this.p2[1] / this.p1[1] - 1)).toFixed(this.prec)
      var d$ = (this.p2[1] - this.p1[1]).toFixed(2);
      var p = (100 * (this.p2[1] / this.p1[1] - 1)).toFixed(2);
      // Map interval to the actual tf (in ms)
      var f = function f(t) {
        return _this2.layout.ti_map.smth2t(t);
      };
      var dt = f(this.p2[0]) - f(this.p1[0]);
      var tf = this.layout.ti_map.tf;
      // Bars count (through the candle index)
      var f2 = function f2(t) {
        var c = _this2.layout.c_magnet(t);
        var cn = _this2.layout.candles || _this2.layout.master_grid.candles;
        return cn.indexOf(c);
      };
      // Bars count (and handling the negative values)
      var b = f2(this.p2[0]) - f2(this.p1[0]);
      // Format time delta
      // Format time delta
      var dtstr = this.t2str(dt);
      var text = [];
      if (this.price) text.push("".concat(d$, "  (").concat(p, "%)"));
      if (this.time) text.push("".concat(b, " bars, ").concat(dtstr));
      text = text.join('\n');
      // "Multiple" fillText
      var lines = text.split('\n');
      var w = Math.max.apply(Math, _toConsumableArray(lines.map(function (x) {
        return ctx.measureText(x).width + 20;
      })).concat([100]));
      var n = lines.length;
      var h = 20 * n;
      ctx.fillStyle = this.value_back;
      ctx.fillRect(xm - w * 0.5, y - (10 + h) * dir, w, h * dir);
      ctx.fillStyle = this.value_color;
      ctx.textAlign = 'center';
      lines.forEach(function (l, i) {
        ctx.fillText(l, xm, y + (dir > 0 ? 20 * i - 20 * n + 5 : 20 * i + 25));
      });
    },
    // Formats time from ms to `1D 12h` for example
    t2str: function t2str(t) {
      var sign = Math.sign(t);
      var abs = Math.abs(t);
      var tfs = [[1000, 's', 60], [60000, 'm', 60], [3600000, 'h', 24], [86400000, 'D', 7], [604800000, 'W', 4], [2592000000, 'M', 12], [31536000000, 'Y', Infinity], [Infinity, 'Eternity', Infinity]];
      for (var i = 0; i < tfs.length; i++) {
        tfs[i][0] = Math.floor(abs / tfs[i][0]);
        if (tfs[i][0] === 0) {
          var p1 = tfs[i - 1];
          var p2 = tfs[i - 2];
          var txt = sign < 0 ? '-' : '';
          if (p1) {
            txt += p1.slice(0, 2).join('');
          }
          var n2 = p2 ? p2[0] - p1[0] * p2[2] : 0;
          if (p2 && n2) {
            txt += ' ';
            txt += "".concat(n2).concat(p2[1]);
          }
          return txt;
        }
      }
    },
    use_for: function use_for() {
      return ['RangeTool'];
    },
    data_colors: function data_colors() {
      return [this.color];
    }
  }
});
;// CONCATENATED MODULE: ./src/components/overlays/RangeTool.vue?vue&type=script&lang=js&
 /* harmony default export */ const overlays_RangeToolvue_type_script_lang_js_ = (RangeToolvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/overlays/RangeTool.vue
var RangeTool_render, RangeTool_staticRenderFns
;



/* normalize component */
;
var RangeTool_component = normalizeComponent(
  overlays_RangeToolvue_type_script_lang_js_,
  RangeTool_render,
  RangeTool_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const RangeTool = (RangeTool_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Grid.vue?vue&type=script&lang=js&
function Gridvue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = Gridvue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function Gridvue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return Gridvue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Gridvue_type_script_lang_js_arrayLikeToArray(o, minLen); }
function Gridvue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Sets up all layers/overlays for the grid with 'grid_id'


















/* harmony default export */ const Gridvue_type_script_lang_js_ = ({
  name: "Grid",
  components: {
    Crosshair: components_Crosshair,
    KeyboardListener: KeyboardListener
  },
  mixins: [canvas, uxlist],
  props: ["sub", "layout", "range", "interval", "cursor", "colors", "overlays", "width", "height", "data", "grid_id", "y_transform", "font", "tv_id", "config", "meta", "shaders", "enableZoom", "priceLine", "decimalPlace", "enableCrosshair"],
  data: function data() {
    var _this = this;
    return {
      layer_events: {
        "new-grid-layer": this.new_layer,
        "delete-grid-layer": this.del_layer,
        "show-grid-layer": function showGridLayer(d) {
          _this.renderer.show_hide_layer(d);
          _this.redraw();
        },
        "redraw-grid": this.redraw,
        "layer-meta-props": function layerMetaProps(d) {
          return _this.$emit("layer-meta-props", d);
        },
        "custom-event": function customEvent(d) {
          return _this.$emit("custom-event", d);
        }
      },
      keyboard_events: {
        "register-kb-listener": function registerKbListener(event) {
          _this.$emit("register-kb-listener", event);
        },
        "remove-kb-listener": function removeKbListener(event) {
          _this.$emit("remove-kb-listener", event);
        },
        keyup: function keyup(event) {
          if (!_this.is_active) return;
          _this.renderer.propagate("keyup", event);
        },
        keydown: function keydown(event) {
          if (!_this.is_active) return; // TODO: is this neeeded?
          _this.renderer.propagate("keydown", event);
        },
        keypress: function keypress(event) {
          if (!_this.is_active) return;
          _this.renderer.propagate("keypress", event);
        }
      }
    };
  },
  computed: {
    is_active: function is_active() {
      return this.$props.cursor.t !== undefined && this.$props.cursor.grid_id === this.$props.grid_id;
    }
  },
  watch: {
    enableZoom: function enableZoom() {
      // console.log("props:",enableZoom);
    },
    // enableCrosshair() {
    //   console.log("props:",enableCrosshair);
    // },
    range: {
      handler: function handler() {
        var _this2 = this;
        // TODO: Left-side render lag fix:
        // Overlay data is updated one tick later than
        // the main sub. Fast fix is to delay redraw()
        // call. It will be a solution until a better
        // one comes by.
        this.$nextTick(function () {
          return _this2.redraw();
        });
      },
      deep: true
    },
    cursor: {
      handler: function handler() {
        if (!this.$props.cursor.locked) this.redraw();
      },
      deep: true
    },
    overlays: {
      // Track changes in calc() functions
      handler: function handler(ovs) {
        var _iterator = Gridvue_type_script_lang_js_createForOfIteratorHelper(ovs),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var ov = _step.value;
            var _iterator2 = Gridvue_type_script_lang_js_createForOfIteratorHelper(this.$children),
              _step2;
            try {
              for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
                var comp = _step2.value;
                if (typeof comp.id !== "string") continue;
                var tuple = comp.id.split("_");
                tuple.pop();
                if (tuple.join("_") === ov.name) {
                  comp.calc = ov.methods.calc;
                  if (!comp.calc) continue;
                  var calc = comp.calc.toString();
                  if (calc !== ov.__prevscript__) {
                    comp.exec_script();
                  }
                  ov.__prevscript__ = calc;
                }
              }
            } catch (err) {
              _iterator2.e(err);
            } finally {
              _iterator2.f();
            }
          }
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      },
      deep: true
    },
    // Redraw on the shader list change
    shaders: function shaders(n, p) {
      this.redraw();
    }
  },
  created: function created() {
    var _this3 = this;
    // List of all possible overlays (builtin + custom)
    //console.log("this.$props",this.$props)
    this._list = [Spline, Splines, Range, Trades, Channel, Segment, Candles, Volume, Splitters, LineTool, RangeTool].concat(this.$props.overlays);
    this._registry = {};

    // We need to know which components we will use.
    // Custom overlay components overwrite built-ins:
    var tools = [];
    this._list.forEach(function (x, i) {
      var use_for = x.methods.use_for();
      if (x.methods.tool) tools.push({
        use_for: use_for,
        info: x.methods.tool()
      });
      use_for.forEach(function (indicator) {
        _this3._registry[indicator] = i;
      });
    });
    this.$emit("custom-event", {
      event: "register-tools",
      args: tools
    });
    this.$on("custom-event", function (e) {
      return _this3.on_ux_event(e, "grid");
    });
  },
  beforeDestroy: function beforeDestroy() {
    if (this.renderer) this.renderer.destroy();
  },
  mounted: function mounted() {
    var _this4 = this;
    //  console.log("props:",this.priceLine);
    var el = this.$refs["canvas"];
    this.renderer = new Grid(el, this);
    this.setup();
    this.$nextTick(function () {
      return _this4.redraw();
    });
  },
  methods: {
    new_layer: function new_layer(layer) {
      var _this5 = this;
      // console.log("new_layer",layer)
      this.$nextTick(function () {
        return _this5.renderer.new_layer(layer);
      });
    },
    del_layer: function del_layer(layer) {
      var _this6 = this;
      this.$nextTick(function () {
        return _this6.renderer.del_layer(layer);
      });
      var grid_id = this.$props.grid_id;
      this.$emit("custom-event", {
        event: "remove-shaders",
        args: [grid_id, layer]
      });
      // TODO: close all interfaces
      this.$emit("custom-event", {
        event: "remove-layer-meta",
        args: [grid_id, layer]
      });
      this.remove_all_ux(layer);
    },
    get_overlays: function get_overlays(h) {
      var _this7 = this;
      // Distributes overlay data & settings according
      // to this._registry; returns compo list
      var comp_list = [],
        count = {};
      var _iterator3 = Gridvue_type_script_lang_js_createForOfIteratorHelper(this.$props.data),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var d = _step3.value;
          var comp = this._list[this._registry[d.type]];
          if (comp) {
            if (comp.methods.calc) {
              comp = this.inject_renderer(comp);
            }
            comp_list.push({
              cls: comp,
              type: d.type,
              data: d.data,
              settings: d.settings,
              i0: d.i0,
              tf: d.tf,
              last: d.last
            });
            count[d.type] = 0;
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      return comp_list.map(function (x, i) {
        // console.log("x.settings",x.type,x.settings)
        return h(x.cls, {
          on: _this7.layer_events,
          attrs: Object.assign(_this7.common_props(), {
            id: "".concat(x.type, "_").concat(count[x.type]++),
            type: x.type,
            data: x.data,
            settings: x.settings,
            i0: x.i0,
            tf: x.tf,
            num: i,
            data_234: 12,
            grid_id: _this7.$props.grid_id,
            meta: _this7.$props.meta,
            last: x.last
          })
        });
      });
    },
    common_props: function common_props() {
      return {
        cursor: this.$props.cursor,
        enableZoom: this.$props.enableZoom,
        enableCrosshair: this.$props.enableCrosshair,
        colors: this.$props.colors,
        layout: this.$props.layout.grids[this.$props.grid_id],
        interval: this.$props.interval,
        sub: this.$props.sub,
        font: this.$props.font,
        config: this.$props.config,
        priceLine: this.$props.priceLine
      };
    },
    emit_ux_event: function emit_ux_event(e) {
      var e_pass = this.on_ux_event(e, "grid");
      if (e_pass) this.$emit("custom-event", e);
    },
    // Replace the current comp with 'renderer'
    inject_renderer: function inject_renderer(comp) {
      var src = comp.methods.calc();
      if (!src.conf || !src.conf.renderer || comp.__renderer__) {
        return comp;
      }

      // Search for an overlay with the target 'name'
      var f = this._list.find(function (x) {
        return x.name === src.conf.renderer;
      });
      if (!f) return comp;
      comp.mixins.push(f);
      comp.__renderer__ = src.conf.renderer;
      return comp;
    }
  },
  render: function render(h) {
    var id = this.$props.grid_id;
    var layout = this.$props.layout.grids[id];
    return this.create_canvas(h, "grid-".concat(id), {
      position: {
        x: 0,
        y: layout.offset || 0
      },
      attrs: {
        width: layout.width,
        height: layout.height,
        overflow: "hidden"
      },
      style: {
        backgroundColor: this.$props.colors.back
      },
      hs: [h(components_Crosshair, {
        props: this.common_props(),
        on: this.layer_events
      }), h(KeyboardListener, {
        on: this.keyboard_events
      }), h(UxLayer, {
        props: {
          id: id,
          tv_id: this.$props.tv_id,
          uxs: this.uxs,
          colors: this.$props.colors,
          config: this.$props.config,
          domData: 1,
          updater: Math.random()
        },
        on: {
          "custom-event": this.emit_ux_event
        }
      })].concat(this.get_overlays(h))
    });
  }
});
;// CONCATENATED MODULE: ./src/components/Grid.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Gridvue_type_script_lang_js_ = (Gridvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/Grid.vue
var Grid_render, Grid_staticRenderFns
;



/* normalize component */
;
var Grid_component = normalizeComponent(
  components_Gridvue_type_script_lang_js_,
  Grid_render,
  Grid_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Grid = (Grid_component.exports);
;// CONCATENATED MODULE: ./src/components/js/sidebar.js


function sidebar_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = sidebar_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function sidebar_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return sidebar_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return sidebar_arrayLikeToArray(o, minLen); }
function sidebar_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }



var PANHEIGHT;
var Sidebar = /*#__PURE__*/function () {
  function Sidebar(canvas, comp, side) {
    if (side === void 0) {
      side = "right";
    }
    classCallCheck_classCallCheck(this, Sidebar);
    PANHEIGHT = comp.config.PANHEIGHT;
    this.canvas = canvas;
    this.ctx = canvas.getContext("2d");
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this.range = this.$p.range;
    this.id = this.$p.grid_id;
    this.layout = this.$p.layout.grids[this.id];
    this.side = side;
    this.calc_range_function = this.calc_range_by_layout;
    this.listeners();
  }
  createClass_createClass(Sidebar, [{
    key: "calc_range_by_layout",
    value: function calc_range_by_layout() {
      return [this.layout.$_hi, this.layout.$_lo];
    }
  }, {
    key: "listeners",
    value: function listeners() {
      var _this = this;
      var mc = this.mc = new hammer.Manager(this.canvas);
      mc.add(new hammer.Pan({
        direction: hammer.DIRECTION_VERTICAL,
        threshold: 0
      }));
      mc.add(new hammer.Tap({
        event: "doubletap",
        taps: 2,
        posThreshold: 50
      }));
      mc.on("panstart", function (event) {
        if (_this.$p.y_transform) {
          _this.zoom = _this.$p.y_transform.zoom;
        } else {
          _this.zoom = 1.0;
        }
        _this.y_range = [_this.layout.$_hi, _this.layout.$_lo];
        _this.drug = {
          y: event.center.y,
          z: _this.zoom,
          mid: math.log_mid(_this.y_range, _this.layout.height),
          A: _this.layout.A,
          B: _this.layout.B
        };
      });
      mc.on("panmove", function (event) {
        if (_this.drug) {
          _this.zoom = _this.calc_zoom(event);
          _this.comp.$emit("sidebar-transform", {
            grid_id: _this.id,
            zoom: _this.zoom,
            auto: false,
            range: _this.calc_range(),
            drugging: true
          });
          _this.update();
        }
      });
      mc.on("panend", function () {
        _this.drug = null;
        _this.comp.$emit("sidebar-transform", {
          grid_id: _this.id,
          drugging: false
        });
      });
      mc.on("doubletap", function () {
        _this.comp.$emit("sidebar-transform", {
          grid_id: _this.id,
          zoom: 1.0,
          auto: true
        });
        _this.zoom = 1.0;
        _this.update();
      });

      // TODO: Do later for mobile version
    }
  }, {
    key: "update",
    value: function update() {
      // Update reference to the grid
      this.layout = this.$p.layout.grids[this.id];
      var points = this.layout.ys;
      var x,
        y,
        w,
        h,
        side = this.side;
      var sb = this.layout.sb;

      //this.ctx.fillStyle = this.$p.colors.back
      this.ctx.font = this.$p.font;
      switch (side) {
        case "left":
          x = 0;
          y = 0;
          w = Math.floor(sb);
          h = this.layout.height;

          //this.ctx.fillRect(x, y, w, h)
          this.ctx.clearRect(x, y, w, h);
          this.ctx.strokeStyle = this.$p.colors.scale;
          this.ctx.beginPath();
          this.ctx.moveTo(x + 0.5, 0);
          this.ctx.lineTo(x + 0.5, h);
          this.ctx.stroke();
          break;
        case "right":
          x = 0;
          y = 0;
          w = Math.floor(sb);
          h = this.layout.height;
          //this.ctx.fillRect(x, y, w, h)
          this.ctx.clearRect(x, y, w, h);
          this.ctx.strokeStyle = this.$p.colors.scale;
          this.ctx.beginPath();
          this.ctx.moveTo(x + 0.5, 0);
          this.ctx.lineTo(x + 0.5, h);
          this.ctx.stroke();
          break;
      }
      this.ctx.fillStyle = this.$p.colors.text;
      this.ctx.beginPath();
      var _iterator = sidebar_createForOfIteratorHelper(points),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var p = _step.value;
          if (p[0] > this.layout.height) continue;
          var x1 = side === "left" ? w - 0.5 : x - 0.5;
          var x2 = side === "left" ? x1 - 4.5 : x1 + 4.5;
          this.ctx.moveTo(x1, p[0] - 0.5);
          this.ctx.lineTo(x2, p[0] - 0.5);
          var offst = side === "left" ? -10 : 10;
          this.ctx.textAlign = side === "left" ? "end" : "start";
          this.ctx.fillText(p[1].toFixed(this.$p.decimalPlace), x1 + offst, p[0] + 4);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.ctx.stroke();
      if (this.$p.grid_id) this.upper_border();
      this.apply_shaders();
      if (this.$p.cursor.y && this.$p.cursor.y$) this.panel();
    }
  }, {
    key: "apply_shaders",
    value: function apply_shaders() {
      if (this.$p.applyShaders) {
        var layout = this.$p.layout.grids[this.id];
        var props = {
          layout: layout,
          cursor: this.$p.cursor
        };
        var _iterator2 = sidebar_createForOfIteratorHelper(this.$p.shaders),
          _step2;
        try {
          for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
            var s = _step2.value;
            this.ctx.save();
            s.draw(this.ctx, props);
            this.ctx.restore();
          }
        } catch (err) {
          _iterator2.e(err);
        } finally {
          _iterator2.f();
        }
      }
    }
  }, {
    key: "upper_border",
    value: function upper_border() {
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(this.layout.width, 0.5);
      this.ctx.stroke();
    }

    // A gray bar behind the current price
  }, {
    key: "panel",
    value: function panel() {
      var _this$$p, _offChartOverlay, _this$$p2;
      if (this.$p.cursor.grid_id !== this.layout.id) {
        return;
      }

      //let lbl = this.$p.cursor.y$.toFixed(this.layout.prec)
      // console.log("this.$p.cursor.y$", this.$p.enableSideBarBoxValue);
      var lbl = this.$p.cursor.y$.toFixed(3);
      if (this.$p.enableSideBarBoxValue) {
        var roundOffValue = this.$p.cursor.y$ < 1.00 ? 3 : this.$p.cursor.y$ < 0.01 ? 4 : 2;
        lbl = this.$p.cursor.y$.toFixed(roundOffValue);
      }
      var offChartOverlay = (_this$$p = this.$p) === null || _this$$p === void 0 || (_this$$p = _this$$p.common) === null || _this$$p === void 0 ? void 0 : _this$$p.data;
      if (((_offChartOverlay = offChartOverlay[this.$p.grid_id - 1]) === null || _offChartOverlay === void 0 ? void 0 : _offChartOverlay.name) == 'Volume' && (_this$$p2 = this.$p) !== null && _this$$p2 !== void 0 && _this$$p2.roundOffVolume) {
        lbl = Math.round(lbl);
      }

      // else {
      //    lbl = this.$p.cursor.y$.toFixed(2);
      // }
      // let lbl = this.$p.cursor.y$.toFixed(this.$p.decimalPlace);
      this.ctx.fillStyle = this.$p.colors.panel;
      var panwidth = this.layout.sb + 1;
      var x = -0.5;
      var y = this.$p.cursor.y - PANHEIGHT * 0.5 - 0.5;
      var a = 7;
      this.ctx.fillRect(x - 0.5, y, panwidth, PANHEIGHT);
      this.ctx.fillStyle = this.$p.colors.textHL;
      this.ctx.textAlign = "left";
      var formattedNumber = parseFloat(lbl).toLocaleString();
      this.ctx.fillText(formattedNumber, a, y + 15);
    }
  }, {
    key: "calc_zoom",
    value: function calc_zoom(event) {
      var d = this.drug.y - event.center.y;
      var speed = d > 0 ? 3 : 1;
      var k = 1 + speed * d / this.layout.height;
      return utils.clamp(this.drug.z * k, 0.005, 100);
    }

    // Not the best place to calculate y-range but
    // this is the simplest solution I found up to
    // date
  }, {
    key: "calc_range",
    value: function calc_range(diff1, diff2) {
      var _this2 = this;
      if (diff1 === void 0) {
        diff1 = 1;
      }
      if (diff2 === void 0) {
        diff2 = 1;
      }
      var z = this.zoom / this.drug.z;
      var zk = (1 / z - 1) / 2;
      var range = this.y_range.slice();
      var delta = range[0] - range[1];
      if (!this.layout.grid.logScale) {
        range[0] = range[0] + delta * zk * diff1;
        range[1] = range[1] - delta * zk * diff2;
      } else {
        var px_mid = this.layout.height / 2;
        var new_hi = px_mid - px_mid * (1 / z);
        var new_lo = px_mid + px_mid * (1 / z);

        // Use old mapping to get a new range
        var f = function f(y) {
          return math.exp((y - _this2.drug.B) / _this2.drug.A);
        };
        var copy = range.slice();
        range[0] = f(new_hi);
        range[1] = f(new_lo);
      }
      return range;
    }
  }, {
    key: "rezoom_range",
    value: function rezoom_range(delta, diff1, diff2) {
      if (!this.$p.y_transform || this.$p.y_transform.auto) return;
      this.zoom = 1.0;
      // TODO: further work (improve scaling ratio)
      if (delta < 0) delta /= 3.75; // Btw, idk why 3.75, but it works
      delta *= 0.25;
      this.y_range = [this.layout.$_hi, this.layout.$_lo];
      this.drug = {
        y: 0,
        z: this.zoom,
        mid: math.log_mid(this.y_range, this.layout.height),
        A: this.layout.A,
        B: this.layout.B
      };
      this.zoom = this.calc_zoom({
        center: {
          y: delta * this.layout.height
        }
      });
      this.comp.$emit("sidebar-transform", {
        grid_id: this.id,
        zoom: this.zoom,
        auto: false,
        range: this.calc_range(diff1, diff2),
        drugging: true
      });
      this.drug = null;
      this.comp.$emit("sidebar-transform", {
        grid_id: this.id,
        drugging: false
      });
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.mc) this.mc.destroy();
    }
  }, {
    key: "mousemove",
    value: function mousemove() {}
  }, {
    key: "mouseout",
    value: function mouseout() {}
  }, {
    key: "mouseup",
    value: function mouseup() {}
  }, {
    key: "mousedown",
    value: function mousedown() {}
  }]);
  return Sidebar;
}();

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Sidebar.vue?vue&type=script&lang=js&
// The side bar (yep, that thing with a bunch of $$$)



/* harmony default export */ const Sidebarvue_type_script_lang_js_ = ({
  name: 'Sidebar',
  mixins: [canvas],
  props: ['sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'font', 'width', 'height', 'grid_id', 'enableSideBarBoxValue', 'rerender', 'y_transform', 'decimalPlace', 'applyShaders', 'tv_id', 'config', 'shaders', 'roundOffVolume', 'common'],
  watch: {
    range: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    cursor: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    rerender: function rerender() {
      var _this = this;
      this.$nextTick(function () {
        return _this.redraw();
      });
    }
  },
  mounted: function mounted() {
    var el = this.$refs['canvas'];
    this.renderer = new Sidebar(el, this);
    this.setup();
    this.redraw();
  },
  beforeDestroy: function beforeDestroy() {
    if (this.renderer) this.renderer.destroy();
  },
  render: function render(h) {
    var id = this.$props.grid_id;
    var layout = this.$props.layout.grids[id];
    return this.create_canvas(h, "sidebar-".concat(id), {
      position: {
        x: layout.width,
        y: layout.offset || 0
      },
      attrs: {
        rerender: this.$props.rerender,
        width: this.$props.width,
        height: layout.height
      },
      style: {
        backgroundColor: this.$props.colors.back
      }
    });
  }
});
;// CONCATENATED MODULE: ./src/components/Sidebar.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Sidebarvue_type_script_lang_js_ = (Sidebarvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/Sidebar.vue
var Sidebar_render, Sidebar_staticRenderFns
;



/* normalize component */
;
var Sidebar_component = normalizeComponent(
  components_Sidebarvue_type_script_lang_js_,
  Sidebar_render,
  Sidebar_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Sidebar = (Sidebar_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=template&id=0b450ece&
var Legendvue_type_template_id_0b450ece_render = function render() {
  var _vm$common;
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "trading-vue-legend",
    style: _vm.calc_style
  }, [_vm.grid_id === 0 ? _c("div", {
    staticClass: "trading-vue-ohlcv",
    style: {
      "max-width": _vm.common.width + "px"
    }
  }, [(_vm$common = _vm.common) !== null && _vm$common !== void 0 && _vm$common.showLegendPropsData && _vm.common.showLegendPropsData.length ? [_vm._l(_vm.common.showLegendPropsData, function (n, i) {
    return _c("b", {
      key: i
    }, [_vm._v(_vm._s(n.k) + " : " + _vm._s(n.v) + " ")]);
  }), _c("br")] : _vm._e(), _vm._v(" "), _vm.show_CustomProps ? _vm._l(_vm.legendTxtConfig, function (n, i) {
    return _c("span", {
      key: i,
      style: n.style
    }, [_vm._v(_vm._s(n.name) + " ")]);
  }) : _vm._e(), _vm._v(" "), !_vm.show_CustomProps ? _c("span", {
    staticClass: "t-vue-title",
    style: {
      color: _vm.common.colors.title
    }
  }, [_vm._v("\r\n              " + _vm._s(_vm.common.title_txt) + "\r\n        ")]) : _vm._e(), _vm._v(" "), _vm.show_values && !_vm.show_CustomProps ? _c("span", [_vm._v("\r\n            O"), _c("span", {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[0]))]), _vm._v("\r\n            H"), _c("span", {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[1]))]), _vm._v("\r\n            L"), _c("span", {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[2]))]), _vm._v("\r\n            C"), _c("span", {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[3]))]), _vm._v("\r\n            V"), _c("span", {
    staticClass: "t-vue-lspan"
  }, [_vm._v(_vm._s(_vm.ohlcv[4]))])]) : _vm._e(), _vm._v(" "), !_vm.show_values ? _c("span", {
    staticClass: "t-vue-lspan",
    style: {
      color: _vm.common.colors.text
    }
  }, [_vm._v("\r\n            " + _vm._s((_vm.common.meta.last || [])[4]) + "\r\n        ")]) : _vm._e(), _vm._v(" "), _vm.show_Settings ? _c("legend-button", {
    key: "main_chart_settings",
    attrs: {
      id: "main_settings",
      tv_id: _vm.grid_id,
      ov_id: _vm.common.chartType,
      grid_id: _vm.grid_id,
      index: _vm.grid_id,
      icon: _vm.settingIcon,
      config: {
        L_BTN_SIZE: 21
      }
    },
    on: {
      "legend-button-click": _vm.button_click
    }
  }) : _vm._e()], 2) : _vm._e(), _vm._v(" "), _vm._l(this.indicators, function (ind) {
    return _c("div", {
      staticClass: "t-vue-ind"
    }, [_c("span", {
      staticClass: "t-vue-iname"
    }, [_vm._v(_vm._s(ind.name))]), _vm._v(" "), ind.showLegendButtons ? _c("button-group", {
      attrs: {
        buttons: _vm.common.buttons,
        config: _vm.common.config,
        ov_id: ind.id,
        grid_id: _vm.grid_id,
        index: ind.index,
        tv_id: _vm.common.tv_id,
        display: ind.v
      },
      on: {
        "legend-button-click": _vm.button_click
      }
    }) : _vm._e(), _vm._v(" "), ind.v ? _c("span", {
      staticClass: "t-vue-ivalues"
    }, _vm._l(ind.values, function (v) {
      return _vm.show_values ? _c("span", {
        staticClass: "t-vue-lspan t-vue-ivalue",
        style: {
          color: v.color
        }
      }, [_vm._v("\r\n                " + _vm._s(v.value) + "\r\n            ")]) : _vm._e();
    }), 0) : _vm._e(), _vm._v(" "), ind.unk ? _c("span", {
      staticClass: "t-vue-unknown"
    }, [_vm._v("\r\n            (Unknown type)\r\n        ")]) : _vm._e(), _vm._v(" "), _c("transition", {
      attrs: {
        name: "tvjs-appear"
      }
    }, [ind.loading ? _c("spinner", {
      attrs: {
        colors: _vm.common.colors
      }
    }) : _vm._e()], 1)], 1);
  })], 2);
};
var Legendvue_type_template_id_0b450ece_staticRenderFns = [];
Legendvue_type_template_id_0b450ece_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=template&id=0b450ece&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=template&id=72b6dd45&
var ButtonGroupvue_type_template_id_72b6dd45_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("span", {
    staticClass: "t-vue-lbtn-grp"
  }, _vm._l(_vm.buttons, function (b, i) {
    return _c("legend-button", {
      key: i,
      attrs: {
        id: b.name || b,
        tv_id: _vm.tv_id,
        ov_id: _vm.ov_id,
        grid_id: _vm.grid_id,
        index: _vm.index,
        display: _vm.display,
        icon: b.icon,
        config: _vm.config
      },
      on: {
        "legend-button-click": _vm.button_click
      }
    });
  }), 1);
};
var ButtonGroupvue_type_template_id_72b6dd45_staticRenderFns = [];
ButtonGroupvue_type_template_id_72b6dd45_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=template&id=72b6dd45&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=template&id=7cd34a30&
var LegendButtonvue_type_template_id_7cd34a30_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("img", {
    staticClass: "t-vue-lbtn",
    style: {
      width: _vm.config.L_BTN_SIZE + "px",
      height: _vm.config.L_BTN_SIZE + "px"
    },
    attrs: {
      id: _vm.uuid,
      src: _vm.base64
    },
    on: {
      click: _vm.onclick
    }
  });
};
var LegendButtonvue_type_template_id_7cd34a30_staticRenderFns = [];
LegendButtonvue_type_template_id_7cd34a30_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=template&id=7cd34a30&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=script&lang=js&

/* harmony default export */ const LegendButtonvue_type_script_lang_js_ = ({
  name: 'LegendButton',
  props: ['id', 'tv_id', 'grid_id', 'ov_id', 'index', 'display', 'icon', 'config'],
  computed: {
    base64: function base64() {
      return this.icon || icons_namespaceObject[this.file_name];
    },
    file_name: function file_name() {
      var id = this.$props.id;
      if (this.$props.id === 'display') {
        id = this.$props.display ? 'display_on' : 'display_off';
      }
      return id + '.png';
    },
    uuid: function uuid() {
      var tv = this.$props.tv_id;
      var gr = this.$props.grid_id;
      var ov = this.$props.ov_id;
      return "".concat(tv, "-btn-g").concat(gr, "-").concat(ov);
    },
    data_type: function data_type() {
      return this.$props.grid_id === 0 ? 'onchart' : 'offchart';
    },
    data_index: function data_index() {
      return this.$props.index;
    }
  },
  mounted: function mounted() {},
  methods: {
    onclick: function onclick() {
      this.$emit('legend-button-click', {
        button: this.$props.id,
        type: this.data_type,
        dataIndex: this.data_index,
        grid: this.$props.grid_id,
        overlay: this.$props.ov_id
      });
    }
  }
});
;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_LegendButtonvue_type_script_lang_js_ = (LegendButtonvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/LegendButton.vue?vue&type=style&index=0&id=7cd34a30&prod&lang=css&
var LegendButtonvue_type_style_index_0_id_7cd34a30_prod_lang_css_ = __webpack_require__(719);
;// CONCATENATED MODULE: ./src/components/LegendButton.vue?vue&type=style&index=0&id=7cd34a30&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/LegendButton.vue



;


/* normalize component */

var LegendButton_component = normalizeComponent(
  components_LegendButtonvue_type_script_lang_js_,
  LegendButtonvue_type_template_id_7cd34a30_render,
  LegendButtonvue_type_template_id_7cd34a30_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const LegendButton = (LegendButton_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=script&lang=js&

/* harmony default export */ const ButtonGroupvue_type_script_lang_js_ = ({
  name: 'ButtonGroup',
  components: {
    LegendButton: LegendButton
  },
  props: ['buttons', 'tv_id', 'ov_id', 'grid_id', 'index', 'display', 'config'],
  methods: {
    button_click: function button_click(event) {
      this.$emit('legend-button-click', event);
    }
  }
});
;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_ButtonGroupvue_type_script_lang_js_ = (ButtonGroupvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ButtonGroup.vue?vue&type=style&index=0&id=72b6dd45&prod&lang=css&
var ButtonGroupvue_type_style_index_0_id_72b6dd45_prod_lang_css_ = __webpack_require__(246);
;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue?vue&type=style&index=0&id=72b6dd45&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/ButtonGroup.vue



;


/* normalize component */

var ButtonGroup_component = normalizeComponent(
  components_ButtonGroupvue_type_script_lang_js_,
  ButtonGroupvue_type_template_id_72b6dd45_render,
  ButtonGroupvue_type_template_id_72b6dd45_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const ButtonGroup = (ButtonGroup_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=template&id=a6fff878&
var Spinnervue_type_template_id_a6fff878_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "tvjs-spinner"
  }, _vm._l(4, function (i) {
    return _c("div", {
      key: i,
      style: {
        background: _vm.colors.text
      }
    });
  }), 0);
};
var Spinnervue_type_template_id_a6fff878_staticRenderFns = [];
Spinnervue_type_template_id_a6fff878_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Spinner.vue?vue&type=template&id=a6fff878&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=script&lang=js&
/* harmony default export */ const Spinnervue_type_script_lang_js_ = ({
  name: 'Spinner',
  props: ['colors']
});
;// CONCATENATED MODULE: ./src/components/Spinner.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Spinnervue_type_script_lang_js_ = (Spinnervue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Spinner.vue?vue&type=style&index=0&id=a6fff878&prod&lang=css&
var Spinnervue_type_style_index_0_id_a6fff878_prod_lang_css_ = __webpack_require__(964);
;// CONCATENATED MODULE: ./src/components/Spinner.vue?vue&type=style&index=0&id=a6fff878&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/Spinner.vue



;


/* normalize component */

var Spinner_component = normalizeComponent(
  components_Spinnervue_type_script_lang_js_,
  Spinnervue_type_template_id_a6fff878_render,
  Spinnervue_type_template_id_a6fff878_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Spinner = (Spinner_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=script&lang=js&




var settingPng = icons_namespaceObject["gear.png"];
/* harmony default export */ const Legendvue_type_script_lang_js_ = ({
  name: 'ChartLegend',
  components: {
    LegendButton: LegendButton,
    ButtonGroup: ButtonGroup,
    Spinner: Spinner
  },
  props: ['common', 'values', 'decimalPlace', 'grid_id', 'meta_props', 'legendDecimal'],
  computed: {
    show_CustomProps: function show_CustomProps() {
      var _this$common;
      return ((_this$common = this.common) === null || _this$common === void 0 ? void 0 : _this$common.show_CustomProps) || false;
    },
    show_Settings: function show_Settings() {
      var _this$common2;
      return ((_this$common2 = this.common) === null || _this$common2 === void 0 ? void 0 : _this$common2.showSettingsMain) || false;
    },
    settingIcon: function settingIcon() {
      return settingPng;
    },
    legendTxtConfig: function legendTxtConfig() {
      var _this$common3;
      return (_this$common3 = this.common) === null || _this$common3 === void 0 ? void 0 : _this$common3.legendTxtConfig;
    },
    ohlcv: function ohlcv() {
      if (!this.$props.values || !this.$props.values.ohlcv) {
        return Array(6).fill('n/a');
      }
      // const prec = this.layout.prec
      var prec = this.decimalPlace;
      // const prec = 3
      // TODO: main the main legend more customizable
      var id = this.main_type + '_0';
      var meta = this.$props.meta_props[id] || {};
      if (meta.legend) {
        return (meta.legend() || []).map(function (x) {
          return x.value;
        });
      }
      if (this.$props.legendDecimal) {
        return [this.$props.values.ohlcv[1].toFixed(this.$props.values.ohlcv[1] < 1 ? 3 : 2), this.$props.values.ohlcv[2].toFixed(this.$props.values.ohlcv[2] < 1 ? 3 : 2), this.$props.values.ohlcv[3].toFixed(this.$props.values.ohlcv[3] < 1 ? 3 : 2), this.$props.values.ohlcv[4].toFixed(this.$props.values.ohlcv[4] < 1 ? 3 : 2), this.$props.values.ohlcv[5] ? Number(this.$props.values.ohlcv[5].toFixed(0)).toLocaleString('en-AU') : 'n/a'];
      } else {
        return [this.$props.values.ohlcv[1].toFixed(prec), this.$props.values.ohlcv[2].toFixed(prec), this.$props.values.ohlcv[3].toFixed(prec), this.$props.values.ohlcv[4].toFixed(prec), this.$props.values.ohlcv[5] ? Number(this.$props.values.ohlcv[5].toFixed(0)).toLocaleString('en-AU') : 'n/a'];
      }
    },
    // TODO: add support for { grid: { id : N }}
    indicators: function indicators() {
      var _this = this;
      var values = this.$props.values;
      var f = this.format;
      var types = {};
      return this.json_data.filter(function (x) {
        return x.settings.legend !== false && !x.main;
      }).map(function (x) {
        if (!(x.type in types)) types[x.type] = 0;
        var id = x.type + "_".concat(types[x.type]++);
        return {
          v: 'display' in x.settings ? x.settings.display : true,
          name: x.name || id,
          index: (_this.off_data || _this.json_data).indexOf(x),
          id: id,
          values: values ? f(id, values) : _this.n_a(1),
          unk: !(id in (_this.$props.meta_props || {})),
          loading: x.loading,
          showLegendButtons: 'legendButtons' in x.settings ? x.settings.legendButtons : true
        };
      });
    },
    calc_style: function calc_style() {
      var top = this.layout.height > 150 ? 10 : 5;
      var grids = this.$props.common.layout.grids;
      var w = grids[0] ? grids[0].width : undefined;
      return {
        top: "".concat(this.layout.offset + top, "px"),
        width: "".concat(w - 20, "px")
      };
    },
    layout: function layout() {
      var id = this.$props.grid_id;
      return this.$props.common.layout.grids[id];
    },
    json_data: function json_data() {
      return this.$props.common.data;
    },
    off_data: function off_data() {
      return this.$props.common.offchart;
    },
    main_type: function main_type() {
      var f = this.common.data.find(function (x) {
        return x.main;
      });
      return f ? f.type : undefined;
    },
    show_values: function show_values() {
      return this.common.cursor.mode !== 'explore';
    }
  },
  methods: {
    format: function format(id, values) {
      var meta = this.$props.meta_props[id] || {};
      // Matches Overlay.data_colors with the data values
      // (see Spline.vue)
      if (!values[id]) return this.n_a(1);

      // Custom formatter
      if (meta.legend) return meta.legend(values[id]);
      return values[id].slice(1).map(function (x, i) {
        var cs = meta.data_colors ? meta.data_colors() : [];
        if (typeof x == 'number') {
          // Show 8 digits for small values
          x = x.toFixed(Math.abs(x) > 0.001 ? 4 : 8);
        }
        return {
          value: x,
          color: cs ? cs[i % cs.length] : undefined
        };
      });
    },
    n_a: function n_a(len) {
      return Array(len).fill({
        value: 'n/a'
      });
    },
    button_click: function button_click(event) {
      this.$emit('legend-button-click', event);
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Legendvue_type_script_lang_js_ = (Legendvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Legend.vue?vue&type=style&index=0&id=0b450ece&prod&lang=css&
var Legendvue_type_style_index_0_id_0b450ece_prod_lang_css_ = __webpack_require__(216);
;// CONCATENATED MODULE: ./src/components/Legend.vue?vue&type=style&index=0&id=0b450ece&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/Legend.vue



;


/* normalize component */

var Legend_component = normalizeComponent(
  components_Legendvue_type_script_lang_js_,
  Legendvue_type_template_id_0b450ece_render,
  Legendvue_type_template_id_0b450ece_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Legend = (Legend_component.exports);
;// CONCATENATED MODULE: ./src/mixins/shaders.js
function shaders_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = shaders_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function shaders_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return shaders_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return shaders_arrayLikeToArray(o, minLen); }
function shaders_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// Parser for shader events

/* harmony default export */ const shaders = ({
  methods: {
    // Init shaders from extensions
    init_shaders: function init_shaders(skin, prev) {
      if (skin !== prev) {
        if (prev) this.shaders = this.shaders.filter(function (x) {
          return x.owner !== prev.id;
        });
        var _iterator = shaders_createForOfIteratorHelper(skin.shaders),
          _step;
        try {
          for (_iterator.s(); !(_step = _iterator.n()).done;) {
            var Shader = _step.value;
            var shader = new Shader();
            shader.owner = skin.id;
            this.shaders.push(shader);
          }
          // TODO: Sort by zIndex
        } catch (err) {
          _iterator.e(err);
        } finally {
          _iterator.f();
        }
      }
    },
    on_shader_event: function on_shader_event(d, target) {
      if (d.event === 'new-shader') {
        if (d.args[0].target === target) {
          d.args[0].id = "".concat(d.args[1], "-").concat(d.args[2]);
          this.shaders.push(d.args[0]);
          this.rerender++;
        }
      }
      if (d.event === 'remove-shaders') {
        var id = d.args.join('-');
        this.shaders = this.shaders.filter(function (x) {
          return x.id !== id;
        });
      }
    }
  },
  watch: {
    skin: function skin(n, p) {
      this.init_shaders(n, p);
    }
  },
  data: function data() {
    return {
      shaders: []
    };
  }
});
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=script&lang=js&





/* harmony default export */ const Sectionvue_type_script_lang_js_ = ({
  name: "GridSection",
  components: {
    Grid: components_Grid,
    Sidebar: components_Sidebar,
    ChartLegend: Legend
  },
  mixins: [shaders],
  props: ["common", "grid_id", 'enableSideBarBoxValue', "enableZoom", "decimalPlace", "priceLine", "enableCrosshair", "applyShaders", "ignore_OHLC", "legendDecimal", "roundOffVolume"],
  data: function data() {
    return {
      meta_props: {},
      rerender: 0,
      last_ghash: ""
    };
  },
  computed: {
    // Component-specific props subsets:
    grid_props: function grid_props() {
      var _this = this;
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);

      // Split offchart data between offchart grids

      if (id > 0) {
        var _p$data;
        //console.log("grid.settings",id)
        var all = p.data;
        // p.data = [p.data[id - 1]]
        p.data = [p.data.filter(function (d) {
          return !_this.hasGridId(d);
        })[id - 1]];
        // Merge offchart overlays with custom ids with
        // the existing onse (by comparing the grid ids)
        (_p$data = p.data).push.apply(_p$data, _toConsumableArray(all.filter(function (x) {
          return x.grid && x.grid.id === id;
        })));
      }
      p.width = p.layout.grids[id].width;
      p.height = p.layout.grids[id].height;
      p.y_transform = p.y_ts[id];
      p.shaders = this.grid_shaders;
      return p;
    },
    sidebar_props: function sidebar_props() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);
      p.width = p.layout.grids[id].sb;
      p.height = p.layout.grids[id].height;
      p.y_transform = p.y_ts[id];
      p.shaders = this.sb_shaders;
      return p;
    },
    section_values: function section_values() {
      var id = this.$props.grid_id;
      // console.log("section_values")
      var p = Object.assign({}, this.$props.common);
      p.width = p.layout.grids[id].width;
      return p.cursor.values[id];
    },
    legend_props: function legend_props() {
      var _this2 = this;
      //console.log("legend_props")
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);

      // Split offchart data between offchart grids
      if (id > 0) {
        var _p$data2;
        var all = p.data;
        p.offchart = all;
        // p.data = [p.data[id - 1]];
        // Legend Props Update here 
        p.data = [p.data.filter(function (d) {
          return !_this2.hasGridId(d);
        })[id - 1]];
        (_p$data2 = p.data).push.apply(_p$data2, _toConsumableArray(all.filter(function (x) {
          return x.grid && x.grid.id === id;
        })));
      } else {
        var res = [];
        var showLegendPropsData = [];
        var legendTxtConfig = localStorage.getItem('legendTxtConfig');
        var showLegendProps = localStorage.getItem('showLegendProps');
        // console.log('legendTxtConfig',legendTxtConfig)
        if (this.$props.ignore_OHLC && legendTxtConfig) {
          res = JSON.parse(legendTxtConfig);
          //console.log('parse response ',res)
        }

        if (showLegendProps) {
          showLegendPropsData = JSON.parse(showLegendProps);
          if (Array.isArray(showLegendPropsData) && showLegendPropsData.length > 0) {
            p.showLegendPropsData = showLegendPropsData;
          }
        }
        var mainData = p.data.find(function (d) {
          return d.main;
        });
        var chartType = mainData.type ? mainData.type : "";
        var show_CustomProps = this.$props.ignore_OHLC.includes(chartType);
        var showSettingsMain = this.$props.common.showSettingsButton.includes(chartType);
        p.legendTxtConfig = res;
        p.chartType = chartType;
        p.show_CustomProps = show_CustomProps;
        p.showSettingsMain = showSettingsMain;
        // console.log(JSON.stringify({a:p.show_CustomProps,b:p.legendTxtConfig,mainType}))
      }

      return p;
    },
    get_meta_props: function get_meta_props() {
      return this.meta_props;
    },
    main_chart_type: function main_chart_type() {
      var id = this.$props.grid_id;
      var p = Object.assign({}, this.$props.common);
      if (id === 0) {
        var rangeParams = this.$props.common.range;
        var mainData = p.data.find(function (d) {
          return d.main;
        });
        var mainType = mainData.type ? mainData.type : "";
        // console.log('this.$props.range',mainType,JSON.stringify(rangeParams))
        return mainType;
      }
      return "";
    },
    grid_shaders: function grid_shaders() {
      return this.shaders.filter(function (x) {
        return x.target === "grid";
      });
    },
    sb_shaders: function sb_shaders() {
      return this.shaders.filter(function (x) {
        return x.target === "sidebar";
      });
    }
  },
  watch: {
    common: {
      handler: function handler(val, old_val) {
        var newhash = this.ghash(val);
        if (newhash !== this.last_ghash) {
          this.rerender++;
        }
        if (val.data.length !== old_val.data.length) {
          // Look at this nasty trick!
          this.rerender++;
        }
        this.last_ghash = newhash;
      },
      deep: true
    }
  },
  mounted: function mounted() {
    this.init_shaders(this.$props.common.skin);
    console.log('common.data', this.meta_props);
  },
  methods: {
    hasGridId: function hasGridId(single) {
      if (single !== null && single !== void 0 && single.grid) {
        var _single$grid;
        if (((_single$grid = single.grid) === null || _single$grid === void 0 ? void 0 : _single$grid.id) > 0) {
          return true;
        }
      }
      return false;
    },
    range_changed: function range_changed(r, manualInteraction) {
      if (manualInteraction === void 0) {
        manualInteraction = false;
      }
      console.log("range_changed", r);
      this.$emit("range-changed", r, manualInteraction);
    },
    cursor_changed: function cursor_changed(c) {
      c.grid_id = this.$props.grid_id;
      this.$emit("cursor-changed", c);
    },
    cursor_locked: function cursor_locked(state) {
      this.$emit("cursor-locked", state);
    },
    sidebar_transform: function sidebar_transform(s) {
      this.$emit("sidebar-transform", s);
    },
    emit_meta_props: function emit_meta_props(d) {
      console.log("layer-meta-props section.vue ", d);
      this.$set(this.meta_props, d.layer_id, d);
      this.$emit("layer-meta-props", d);
    },
    emit_custom_event: function emit_custom_event(d) {
      this.on_shader_event(d, "sidebar");
      this.$emit("custom-event", d);
    },
    button_click: function button_click(event) {
      this.$emit("legend-button-click", event);
    },
    register_kb: function register_kb(event) {
      this.$emit("register-kb-listener", event);
    },
    remove_kb: function remove_kb(event) {
      this.$emit("remove-kb-listener", event);
    },
    rezoom_range: function rezoom_range(event) {
      var id = "sb-" + event.grid_id;
      if (this.$refs[id]) {
        this.$refs[id].renderer.rezoom_range(event.z, event.diff1, event.diff2);
      }
    },
    ghash: function ghash(val) {
      // Measures grid heights configuration
      var hs = val.layout.grids.map(function (x) {
        return x.height;
      });
      return hs.reduce(function (a, b) {
        return a + b;
      }, "");
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Sectionvue_type_script_lang_js_ = (Sectionvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Section.vue?vue&type=style&index=0&id=e10036a2&prod&lang=css&
var Sectionvue_type_style_index_0_id_e10036a2_prod_lang_css_ = __webpack_require__(479);
;// CONCATENATED MODULE: ./src/components/Section.vue?vue&type=style&index=0&id=e10036a2&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/Section.vue



;


/* normalize component */

var Section_component = normalizeComponent(
  components_Sectionvue_type_script_lang_js_,
  Sectionvue_type_template_id_e10036a2_render,
  Sectionvue_type_template_id_e10036a2_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Section = (Section_component.exports);
;// CONCATENATED MODULE: ./src/components/js/botbar.js


function botbar_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = botbar_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function botbar_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return botbar_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return botbar_arrayLikeToArray(o, minLen); }
function botbar_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }


var botbar_MINUTE15 = constants.MINUTE15,
  botbar_MINUTE = constants.MINUTE,
  botbar_HOUR = constants.HOUR,
  botbar_DAY = constants.DAY,
  botbar_WEEK = constants.WEEK,
  botbar_MONTH = constants.MONTH,
  botbar_YEAR = constants.YEAR,
  botbar_MONTHMAP = constants.MONTHMAP;
var Botbar = /*#__PURE__*/function () {
  function Botbar(canvas, comp) {
    classCallCheck_classCallCheck(this, Botbar);
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.comp = comp;
    this.$p = comp.$props;
    this.data = this.$p.sub;
    this.range = this.$p.range;
    this.layout = this.$p.layout;
  }
  createClass_createClass(Botbar, [{
    key: "update",
    value: function update() {
      this.grid_0 = this.layout.grids[0];
      var width = this.layout.botbar.width;
      var height = this.layout.botbar.height;
      var sb = this.layout.grids[0].sb;

      //this.ctx.fillStyle = this.$p.colors.back
      this.ctx.font = this.$p.font;
      //this.ctx.fillRect(0, 0, width, height)
      this.ctx.clearRect(0, 0, width, height);
      this.ctx.strokeStyle = this.$p.colors.scale;
      this.ctx.beginPath();
      this.ctx.moveTo(0, 0.5);
      this.ctx.lineTo(Math.floor(width + 1), 0.5);
      this.ctx.stroke();
      this.ctx.fillStyle = this.$p.colors.text;
      this.ctx.beginPath();
      var _iterator = botbar_createForOfIteratorHelper(this.layout.botbar.xs),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var p = _step.value;
          var lbl = this.format_date(p);
          if (p[0] > width - sb) continue;
          this.ctx.moveTo(p[0] - 0.5, 0);
          this.ctx.lineTo(p[0] - 0.5, 4.5);
          if (!this.lbl_highlight(p[1][0])) {
            this.ctx.globalAlpha = 0.85;
          }
          this.ctx.textAlign = 'center';
          this.ctx.fillText(lbl, p[0], 18);
          this.ctx.globalAlpha = 1;
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.ctx.stroke();
      this.apply_shaders();
      if (this.$p.cursor.x && this.$p.cursor.t !== undefined) this.panel();
    }
  }, {
    key: "apply_shaders",
    value: function apply_shaders() {
      var layout = this.layout.grids[0];
      var props = {
        layout: layout,
        cursor: this.$p.cursor
      };
      var _iterator2 = botbar_createForOfIteratorHelper(this.comp.bot_shaders),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var s = _step2.value;
          this.ctx.save();
          s.draw(this.ctx, props);
          this.ctx.restore();
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }
  }, {
    key: "panel",
    value: function panel() {
      var lbl = this.format_cursor_x();
      this.ctx.fillStyle = this.$p.colors.panel;
      var measure = this.ctx.measureText(lbl + '    ');
      var panwidth = Math.floor(measure.width);
      var cursor = this.$p.cursor.x;
      // let x = Math.floor(cursor - panwidth * 0.5)
      var x = Math.floor(cursor);
      // console.log(x,cursor,panwidth)
      var y = -0.5;
      var panheight = this.comp.config.PANHEIGHT;
      this.ctx.fillRect(x, y, panwidth, panheight + 0.5);
      this.ctx.fillStyle = this.$p.colors.textHL;
      // this.ctx.textAlign = 'center'
      // this.ctx.fillText(lbl, cursor, y + 16)
      this.ctx.textAlign = 'left';
      this.ctx.fillText(lbl, cursor + 4, y + 16);
    }
  }, {
    key: "format_date",
    value: function format_date(p) {
      var t = p[1][0];
      t = this.grid_0.ti_map.i2t(t);
      var ti = this.$p.layout.grids[0].ti_map.tf;
      // Enable timezones only for tf < 1D
      var k = ti < botbar_DAY ? 1 : 0;
      var tZ = t + k * this.$p.timezone * botbar_HOUR;

      //t += new Date(t).getTimezoneOffset() * MINUTE
      var d = new Date(tZ);
      if (p[2] === botbar_YEAR || utils.year_start(t) === t) {
        return d.getUTCFullYear();
      }
      if (p[2] === botbar_MONTH || utils.month_start(t) === t) {
        return botbar_MONTHMAP[d.getUTCMonth()];
      }
      // TODO(*) see grid_maker.js
      if (utils.day_start(tZ) === tZ) return d.getUTCDate();
      var h = utils.add_zero(d.getUTCHours());
      var m = utils.add_zero(d.getUTCMinutes());
      return h + ':' + m;
    }
  }, {
    key: "format_cursor_x",
    value: function format_cursor_x() {
      var t = this.$p.cursor.t;
      t = this.grid_0.ti_map.i2t(t);
      //let ti = this.$p.interval
      var ti = this.$p.layout.grids[0].ti_map.tf;
      // Enable timezones only for tf < 1D
      var k = ti < botbar_DAY ? 1 : 0;

      //t += new Date(t).getTimezoneOffset() * MINUTE
      var d = new Date(t + k * this.$p.timezone * botbar_HOUR);
      if (ti === botbar_YEAR) {
        return d.getUTCFullYear();
      }
      if (ti < botbar_YEAR) {
        var yr = '`' + "".concat(d.getUTCFullYear()).slice(-2);
        var mo = botbar_MONTHMAP[d.getUTCMonth()];
        var dd = '01';
      }
      if (ti <= botbar_WEEK) dd = d.getUTCDate();
      var date = "".concat(dd, " ").concat(mo, " ").concat(yr);
      var time = '';
      if (ti < botbar_DAY) {
        var h = utils.add_zero(d.getUTCHours());
        var m = utils.add_zero(d.getUTCMinutes());
        time = h + ':' + m;
      }
      return "".concat(date, "  ").concat(time);
    }

    // Highlights the begining of a time interval
    // TODO: improve. Problem: let's say we have a new month,
    // but if there is no grid line in place, there
    // will be no month name on t-axis. Sad.
    // Solution: manipulate the grid, skew it, you know
  }, {
    key: "lbl_highlight",
    value: function lbl_highlight(t) {
      var ti = this.$p.interval;
      if (t === 0) return true;
      if (utils.month_start(t) === t) return true;
      if (utils.day_start(t) === t) return true;
      if (ti <= botbar_MINUTE15 && t % botbar_HOUR === 0) return true;
      return false;
    }
  }, {
    key: "mousemove",
    value: function mousemove() {}
  }, {
    key: "mouseout",
    value: function mouseout() {}
  }, {
    key: "mouseup",
    value: function mouseup() {}
  }, {
    key: "mousedown",
    value: function mousedown() {}
  }]);
  return Botbar;
}();

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Botbar.vue?vue&type=script&lang=js&
// The bottom bar (yep, that thing with a bunch of dates)



/* harmony default export */ const Botbarvue_type_script_lang_js_ = ({
  name: 'Botbar',
  mixins: [canvas],
  props: ['sub', 'layout', 'range', 'interval', 'cursor', 'colors', 'font', 'width', 'height', 'rerender', 'tv_id', 'config', 'shaders', 'timezone'],
  computed: {
    bot_shaders: function bot_shaders() {
      return this.$props.shaders.filter(function (x) {
        return x.target === 'botbar';
      });
    }
  },
  watch: {
    range: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    cursor: {
      handler: function handler() {
        this.redraw();
      },
      deep: true
    },
    rerender: function rerender() {
      var _this = this;
      this.$nextTick(function () {
        return _this.redraw();
      });
    }
  },
  mounted: function mounted() {
    var el = this.$refs['canvas'];
    this.renderer = new Botbar(el, this);
    this.setup();
    this.redraw();
  },
  render: function render(h) {
    var sett = this.$props.layout.botbar;
    return this.create_canvas(h, 'botbar', {
      position: {
        x: 0,
        y: sett.offset || 0
      },
      attrs: {
        rerender: this.$props.rerender,
        width: sett.width,
        height: sett.height
      },
      style: {
        backgroundColor: this.$props.colors.back
      }
    });
  }
});
;// CONCATENATED MODULE: ./src/components/Botbar.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Botbarvue_type_script_lang_js_ = (Botbarvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Botbar.vue?vue&type=style&index=0&id=1cb09285&prod&lang=css&
var Botbarvue_type_style_index_0_id_1cb09285_prod_lang_css_ = __webpack_require__(495);
;// CONCATENATED MODULE: ./src/components/Botbar.vue?vue&type=style&index=0&id=1cb09285&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/Botbar.vue
var Botbar_render, Botbar_staticRenderFns
;

;


/* normalize component */

var Botbar_component = normalizeComponent(
  components_Botbarvue_type_script_lang_js_,
  Botbar_render,
  Botbar_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const components_Botbar = (Botbar_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Keyboard.vue?vue&type=script&lang=js&
/* harmony default export */ const Keyboardvue_type_script_lang_js_ = ({
  name: 'Keyboard',
  created: function created() {
    window.addEventListener('keydown', this.keydown);
    window.addEventListener('keyup', this.keyup);
    window.addEventListener('keypress', this.keypress);
    this._listeners = {};
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('keydown', this.keydown);
    window.removeEventListener('keyup', this.keyup);
    window.removeEventListener('keypress', this.keypress);
  },
  methods: {
    keydown: function keydown(event) {
      for (var id in this._listeners) {
        var l = this._listeners[id];
        if (l && l.keydown) {
          l.keydown(event);
        } else {
          console.warn("No 'keydown' listener for ".concat(id));
        }
      }
    },
    keyup: function keyup(event) {
      for (var id in this._listeners) {
        var l = this._listeners[id];
        if (l && l.keyup) {
          l.keyup(event);
        } else {
          console.warn("No 'keyup' listener for ".concat(id));
        }
      }
    },
    keypress: function keypress(event) {
      for (var id in this._listeners) {
        var l = this._listeners[id];
        if (l && l.keypress) {
          l.keypress(event);
        } else {
          console.warn("No 'keypress' listener for ".concat(id));
        }
      }
    },
    register: function register(listener) {
      this._listeners[listener.id] = listener;
    },
    remove: function remove(listener) {
      delete this._listeners[listener.id];
    }
  },
  render: function render(h) {
    return h();
  }
});
;// CONCATENATED MODULE: ./src/components/Keyboard.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Keyboardvue_type_script_lang_js_ = (Keyboardvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/Keyboard.vue
var Keyboard_render, Keyboard_staticRenderFns
;



/* normalize component */
;
var Keyboard_component = normalizeComponent(
  components_Keyboardvue_type_script_lang_js_,
  Keyboard_render,
  Keyboard_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Keyboard = (Keyboard_component.exports);
;// CONCATENATED MODULE: ./src/mixins/datatrack.js
// Data tracker/watcher


/* harmony default export */ const datatrack = ({
  methods: {
    data_changed: function data_changed() {
      var n = this.ohlcv;
      var changed = false;
      if (this._data_n0 !== n[0] && this._data_len !== n.length) {
        changed = true;
      }
      this.check_all_data(changed);
      if (this.ti_map.ib) {
        this.reindex_delta(n[0], this._data_n0);
      }
      this._data_n0 = n[0];
      this._data_len = n.length;
      this.save_data_t();
      return changed;
    },
    check_all_data: function check_all_data(changed) {
      // If length of data in the Structure changed by > 1 point
      // emit a special event for DC to recalc the scripts
      // TODO: check overlays data too
      var len = this._data_len || 0;
      if (Math.abs(this.ohlcv.length - len) > 1 || this._data_n0 !== this.ohlcv[0]) {
        this.$emit('custom-event', {
          event: 'data-len-changed',
          args: []
        });
      }
    },
    reindex_delta: function reindex_delta(n, p) {
      n = n || [[0]];
      p = p || [[0]];
      var dt = n[0] - p[0];
      if (dt !== 0 && this._data_t) {
        // Convert t back to index
        try {
          // More precise method first
          var nt = this._data_t + 0.01; // fix for the filter lib
          var res = utils.fast_nearest(this.ohlcv, nt);
          var cndl = this.ohlcv[res[0]];
          var off = (nt - cndl[0]) / this.interval_ms;
          this["goto"](res[0] + off);
        } catch (e) {
          this["goto"](this.ti_map.t2i(this._data_t));
        }
      }
    },
    save_data_t: function save_data_t() {
      this._data_t = this.ti_map.i2t(this.range[1]); // save as t
    }
  },
  data: function data() {
    return {
      _data_n0: null,
      _data_len: 0,
      _data_t: 0
    };
  }
});
;// CONCATENATED MODULE: ./src/components/js/ti_mapping.js




// Time-index mapping (for non-linear t-axis)


var MAX_ARR = Math.pow(2, 32);

// 3 MODES of index calculation for overlays/subcharts:
// ::: indexSrc :::
// * "map"      -> use TI mapping functions to detect index
//                 (slowest, for stocks only. DEFAULT)
//
// * "calc"     -> calculate shift between sub & data
//                 (faster, but overlay data should be perfectly
//                  align with the main chart,
//                  1-1 candle/data point. Supports Renko)
//
// * "data"     -> overlay data should come with candle index
//                 (fastest, supports Renko)
var TI = /*#__PURE__*/function () {
  function TI() {
    classCallCheck_classCallCheck(this, TI);
    this.ib = false;
  }
  createClass_createClass(TI, [{
    key: "init",
    value: function init(params, res) {
      var sub = params.sub,
        interval = params.interval,
        meta = params.meta,
        $p = params.$props,
        interval_ms = params.interval_ms,
        sub_start = params.sub_start,
        ib = params.ib;
      this.ti_map = [];
      this.it_map = [];
      this.sub_i = [];
      this.ib = ib;
      this.sub = res;
      this.ss = sub_start;
      this.tf = interval_ms;
      var start = meta.sub_start;

      // Skip mapping for the regular mode
      if (this.ib) {
        this.map_sub(res);
      }
    }

    // Make maps for the main subset
  }, {
    key: "map_sub",
    value: function map_sub(res) {
      for (var i = 0; i < res.length; i++) {
        var t = res[i][0];
        var _i = this.ss + i;
        this.ti_map[t] = _i;
        this.it_map[_i] = t;

        // Overwrite t with i
        var copy = _toConsumableArray(res[i]);
        copy[0] = _i;
        this.sub_i.push(copy);
      }
    }

    // Map overlay data
    // TODO: parse() called 3 times instead of 2 for 'spx_sample.json'
  }, {
    key: "parse",
    value: function parse(data, mode) {
      if (!this.ib || !this.sub[0] || mode === 'data') return data;
      var res = [];
      var k = 0; // Candlestick index

      if (mode === 'calc') {
        var shift = utils.index_shift(this.sub, data);
        for (var i = 0; i < data.length; i++) {
          var _i = this.ss + i;
          var copy = _toConsumableArray(data[i]);
          copy[0] = _i + shift;
          res.push(copy);
        }
        return res;
      }

      // If indicator data starts after ohlcv, calc the first index
      if (data.length) {
        try {
          var k1 = utils.fast_nearest(this.sub, data[0][0])[0];
          if (k1 !== null && k1 >= 0) k = k1;
        } catch (e) {}
      }
      var t0 = this.sub[0][0];
      var tN = this.sub[this.sub.length - 1][0];
      for (var i = 0; i < data.length; i++) {
        var _copy = _toConsumableArray(data[i]);
        var tk = this.sub[k][0];
        var t = data[i][0];
        var index = this.ti_map[t];
        if (index === undefined) {
          // Linear extrapolation
          if (t < t0 || t > tN) {
            index = this.ss + k - (tk - t) / this.tf;
            t = data[i + 1] ? data[i + 1][0] : undefined;
          }

          // Linear interpolation
          else {
            var tk2 = this.sub[k + 1][0];
            index = tk === tk2 ? this.ss + k : this.ss + k + (t - tk) / (tk2 - tk);
            t = data[i + 1] ? data[i + 1][0] : undefined;
          }
        }
        // Race of data points & sub points (ohlcv)
        // (like turn based increments)
        while (k + 1 < this.sub.length - 1 && t > this.sub[k + 1][0]) {
          k++;
          tk = this.sub[k][0];
        }
        _copy[0] = index;
        res.push(_copy);
      }
      return res;
    }

    // index => time
  }, {
    key: "i2t",
    value: function i2t(i) {
      if (!this.ib || !this.sub.length) return i; // Regular mode

      // Discrete mapping
      var res = this.it_map[i];
      if (res !== undefined) return res;
      // Linear extrapolation
      else if (i >= this.ss + this.sub_i.length) {
        var di = i - (this.ss + this.sub_i.length) + 1;
        var last = this.sub[this.sub.length - 1];
        return last[0] + di * this.tf;
      } else if (i < this.ss) {
        var _di = i - this.ss;
        return this.sub[0][0] + _di * this.tf;
      }

      // Linear Interpolation
      var i1 = Math.floor(i) - this.ss;
      var i2 = i1 + 1;
      var len = this.sub.length;
      if (i2 >= len) i2 = len - 1;
      var sub1 = this.sub[i1];
      var sub2 = this.sub[i2];
      if (sub1 && sub2) {
        var t1 = sub1[0];
        var t2 = sub2[0];
        return t1 + (t2 - t1) * (i - i1 - this.ss);
      }
      return undefined;
    }

    // Map or bypass depending on the mode
  }, {
    key: "i2t_mode",
    value: function i2t_mode(i, mode) {
      return mode === 'data' ? i : this.i2t(i);
    }

    // time => index
    // TODO: when switch from IB mode to regular tools
    // disappear (bc there is no more mapping)
  }, {
    key: "t2i",
    value: function t2i(t) {
      if (!this.sub.length) return undefined;

      // Discrete mapping
      var res = this.ti_map[t];
      console.log("t2i Discrete mapping", res);
      if (res !== undefined) return res;
      var t0 = this.sub[0][0];
      var tN = this.sub[this.sub.length - 1][0];
      console.log("t2i value", {
        t0: t0,
        tN: tN
      });
      // Linear extrapolation
      if (t < t0) {
        console.log("t2i fall into first if");
        return this.ss - (t0 - t) / this.tf;
      } else if (t > tN) {
        console.log("t2i fall into else if");
        var k = this.sub.length - 1;
        return this.ss + k - (tN - t) / this.tf;
      }
      try {
        // Linear Interpolation
        console.log("t2i fall into fastest nearest ");
        var i = utils.fast_nearest(this.sub, t);
        var tk = this.sub[i[0]][0];
        var tk2 = this.sub[i[1]][0];
        var _k = (t - tk) / (tk2 - tk);
        return this.ss + i[0] + _k * (i[1] - i[0]);
      } catch (e) {}
      return undefined;
    }

    // Auto detect: is it time or index?
    // Assuming that index-based mode is ON
  }, {
    key: "smth2i",
    value: function smth2i(smth) {
      if (smth > MAX_ARR) {
        return this.t2i(smth); // it was time
      } else {
        return smth; // it was an index
      }
    }
  }, {
    key: "smth2t",
    value: function smth2t(smth) {
      if (smth < MAX_ARR) {
        return this.i2t(smth); // it was an index
      } else {
        return smth; // it was time
      }
    }

    // Global Time => Index (uses all data, approx. method)
    // Used by tv.goto()
  }, {
    key: "gt2i",
    value: function gt2i(smth, ohlcv) {
      if (smth > MAX_ARR) {
        var E = 0.1; // Fixes the arrayslicer bug
        var _Utils$fast_nearest = utils.fast_nearest(ohlcv, smth + E),
          _Utils$fast_nearest2 = _slicedToArray(_Utils$fast_nearest, 2),
          i1 = _Utils$fast_nearest2[0],
          i2 = _Utils$fast_nearest2[1];
        if (typeof i1 === 'number') {
          return i1;
        } else {
          return this.t2i(smth); // fallback
        }
      } else {
        return smth; // it was an index
      }
    }
  }]);
  return TI;
}();

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Chart.vue?vue&type=script&lang=js&













/* harmony default export */ const Chartvue_type_script_lang_js_ = ({
  name: 'Chart',
  components: {
    GridSection: Section,
    Botbar: components_Botbar,
    Keyboard: Keyboard
  },
  mixins: [shaders, datatrack],
  props: ['title_txt', 'data', 'width', 'height', 'font', 'colors', 'overlays', 'tv_id', 'config', 'buttons', 'toolbar', 'ib', 'applyShaders', 'skin', 'timezone', 'enableZoom', 'enableSideBarBoxValue', 'decimalPlace', 'ignore_OHLC', 'priceLine', 'ignoreNegativeIndex', 'enableCrosshair', 'legendDecimal', 'showSettingsButton', 'roundOffVolume'],
  data: function data() {
    return {
      // Current data slice
      sub: [],
      // Time range
      range: [],
      initRange: [],
      // Candlestick interval
      interval: 0,
      // Crosshair states
      cursor: {
        x: null,
        y: null,
        t: null,
        y$: null,
        grid_id: null,
        locked: false,
        values: {},
        scroll_lock: false,
        mode: utils.xmode()
      },
      // A trick to re-render botbar
      rerender: 0,
      // Layers meta-props (changing behaviour)
      layers_meta: {},
      // Y-transforms (for y-zoom and -shift)
      y_transforms: {},
      // Default OHLCV settings (when using DataStructure v1.0)
      settings_ohlcv: {},
      // Default overlay settings
      settings_ov: {},
      // Meta data
      last_candle: [],
      last_values: {},
      sub_start: undefined,
      activated: false,
      legendTxtConfig: undefined
    };
  },
  computed: {
    // Component-specific props subsets:
    main_section: function main_section() {
      var p = Object.assign({}, this.common_props());
      p.data = this.overlay_subset(this.onchart, 'onchart');
      p.data.push({
        type: this.chart.type || 'Candles',
        main: true,
        data: this.sub,
        i0: this.sub_start,
        settings: this.chart.settings || this.settings_ohlcv,
        grid: this.chart.grid || {},
        last: this.last_candle
      });
      p.overlays = this.$props.overlays;
      p.showSettingsButton = this.$props.showSettingsButton;
      return p;
    },
    get_layout: function get_layout() {
      return this._layout.grids;
    },
    sub_section: function sub_section() {
      var p = Object.assign({}, this.common_props());
      p.data = this.overlay_subset(this.offchart, 'offchart');
      p.overlays = this.$props.overlays;
      return p;
    },
    botbar_props: function botbar_props() {
      var p = Object.assign({}, this.common_props());
      p.width = p.layout.botbar.width;
      p.height = p.layout.botbar.height;
      p.rerender = this.rerender;
      return p;
    },
    offsub: function offsub() {
      return this.overlay_subset(this.offchart, 'offchart');
    },
    // Datasets: candles, onchart, offchart indicators
    ohlcv: function ohlcv() {
      return this.$props.data.ohlcv || this.chart.data || [];
    },
    chart: function chart() {
      return this.$props.data.chart || {
        grid: {}
      };
    },
    onchart: function onchart() {
      return this.$props.data.onchart || [];
    },
    offchart: function offchart() {
      console.log("this.$props.data.offchart", this.$props.data.offchart);
      return this.$props.data.offchart || [];
    },
    filter: function filter() {
      return this.$props.ib ? utils.fast_filter_i : utils.fast_filter;
    },
    styles: function styles() {
      var w = this.$props.toolbar ? this.$props.config.TOOLBAR : 0;
      return {
        'margin-left': "".concat(w, "px")
      };
    },
    meta: function meta() {
      return {
        last: this.last_candle,
        sub_start: this.sub_start,
        activated: this.activated
      };
    },
    forced_tf: function forced_tf() {
      return this.chart.tf;
    },
    forced_initRange: function forced_initRange() {
      return this.initRange.length > 0 ? this.initRange : null;
    },
    auto_y_axis: function auto_y_axis() {
      var gridKeys = Object.keys(this.y_transforms);
      console.log("gridKeys", gridKeys);
      if (gridKeys.length > 0 && gridKeys.includes("0")) {
        return this.y_transforms['0'].auto;
      }
      return true;
    }
  },
  watch: {
    width: function width() {
      this.update_layout();
      if (this._hook_resize) this.ce('?chart-resize');
    },
    height: function height() {
      this.update_layout();
      if (this._hook_resize) this.ce('?chart-resize');
    },
    ib: function ib(nw) {
      if (!nw) {
        // Change range index => time
        var t1 = this.ti_map.i2t(this.range[0]);
        var t2 = this.ti_map.i2t(this.range[1]);
        utils.overwrite(this.range, [t1, t2]);
        this.interval = this.interval_ms;
      } else {
        this.init_range(); // TODO: calc index range instead
        utils.overwrite(this.range, this.range);
        this.interval = 1;
      }
      var sub = this.subset(this.range, 'subset ib watch');
      utils.overwrite(this.sub, sub);
      this.update_layout();
    },
    timezone: function timezone() {
      this.update_layout();
    },
    colors: function colors() {
      utils.overwrite(this.range, this.range);
    },
    forced_tf: function forced_tf(n, p) {
      this.update_layout(true);
      this.ce('exec-all-scripts');
    },
    data: {
      handler: function handler(n, p) {
        var _this = this;
        if (!this.sub.length) this.init_range();
        var sub = this.subset(this.range, 'subset dataset');
        // Fixes Infinite loop warn, when the subset is empty
        // TODO: Consider removing 'sub' from data entirely
        if (this.sub.length || sub.length) {
          utils.overwrite(this.sub, sub);
        }
        var nw = this.data_changed();
        this.update_layout(nw);
        utils.overwrite(this.range, this.range);
        this.cursor.scroll_lock = !!n.scrollLock;
        if (n.scrollLock && this.cursor.locked) {
          this.cursor.locked = false;
        }
        if (this._hook_data) this.ce('?chart-data', nw);
        this.update_last_values();
        // TODO: update legend values for overalys
        this.rerender++;
        var findMain = this.main_section.data.find(function (d) {
          return d.main;
        });
        // this
        //   this.$emit('custom-event', {})
        //   console.log('this.rerender',findMain,this.sub.length)
        setTimeout(function () {
          _this.$emit("chart_data_changed", nw);
        });
      },
      deep: true
    }
  },
  created: function created() {
    // Context for text measurements
    this.ctx = new context(this.$props);

    // Initial layout (All measurments for the chart)
    this.init_range();
    this.sub = this.subset(this.range, 'subset created');
    utils.overwrite(this.range, this.range); // Fix for IB mode
    this._layout = new layout(this);

    // Updates current cursor values
    this.updater = new updater(this);
    this.update_last_values();
    this.init_shaders(this.skin);
  },
  methods: {
    range_changed: function range_changed(r, manualInteraction) {
      if (manualInteraction === void 0) {
        manualInteraction = false;
      }
      // Overwite & keep the original references
      // Quick fix for IB mode (switch 2 next lines)
      // TODO: wtf?
      var sub = this.subset(r, 'subset range changed');
      utils.overwrite(this.initRange, r);
      if (manualInteraction) {}
      // console.log('this.range before update',this.range)
      utils.overwrite(this.range, r);
      utils.overwrite(this.sub, sub);
      this.update_layout();
      // console.log('this.range after update',this.sub.length,r,this.range)
      // console.log('range_changes_working',this.ignoreNegativeIndex)
      if (this.ignoreNegativeIndex) {
        // let r2 = this.ti_map.t2i(r[0])
        this.$emit('range-changed', r, manualInteraction);
      } else {
        this.$emit('range-changed', r, manualInteraction);
      }
      if (this.$props.ib) this.save_data_t();

      // console.log('this.ti_map.t2i(r[0])',this.ti_map.t2i(r[0]))
    },
    range_changed_by_time: function range_changed_by_time(startTime, endTime) {
      // Find Index For Start 
      var dataChanged = this.data_changed();
      console.log("range_changed_by_time dataChanged", dataChanged);
      var startTimeIndex = this.ti_map.t2i(startTime);
      var endTimeIndex = this.ti_map.t2i(endTime);
      console.log("range_changed_by_time updatedIndex", {
        dataChanged: dataChanged,
        startTimeIndex: startTimeIndex,
        endTimeIndex: endTimeIndex
      });
      var newRange = [startTimeIndex, endTimeIndex];
      this.range_changed(newRange);
      // console.log('this.ti_map.t2i(r[0])',this.ti_map.t2i(r[0]))
    },
    "goto": function goto(t) {
      var dt = this.range[1] - this.range[0];
      this.range_changed([t - dt, t]);
    },
    setRange: function setRange(t1, t2) {
      this.range_changed([t1, t2]);
    },
    cursor_changed: function cursor_changed(e) {
      if (e.mode) this.cursor.mode = e.mode;
      if (this.cursor.mode !== 'explore') {
        this.updater.sync(e);
      }
      if (this._hook_xchanged) this.ce('?x-changed', e);
    },
    cursor_locked: function cursor_locked(state) {
      if (this.cursor.scroll_lock && state) return;
      this.cursor.locked = state;
      if (this._hook_xlocked) this.ce('?x-locked', state);
    },
    calc_interval: function calc_interval(caller) {
      var _this2 = this;
      var tf = utils.parse_tf(this.forced_tf);
      if (this.ohlcv.length < 2 && !tf) return;
      this.interval_ms = tf || utils.detect_interval(this.ohlcv);
      this.interval = this.$props.ib ? 1 : this.interval_ms;
      console.log("calc_interval", {
        interval: this.interval,
        interval_ms: this.interval_ms,
        forced_tf: this.forced_tf,
        caller: caller
      });
      utils.warn(function () {
        return _this2.$props.ib && !_this2.chart.tf;
      }, constants.IB_TF_WARN, constants.SECOND);
    },
    set_ytransform: function set_ytransform(s) {
      var obj = this.y_transforms[s.grid_id] || {};
      Object.assign(obj, s);
      this.$set(this.y_transforms, s.grid_id, obj);
      this.update_layout();
      utils.overwrite(this.range, this.range);
      if (s.grid_id === 0) {
        this.$emit('sidebar-transform', this.y_transforms['0']);
      }
    },
    default_range: function default_range() {
      var dl = this.$props.config.DEFAULT_LEN;
      var ml = this.$props.config.MINIMUM_LEN + 0.5;
      var l = this.ohlcv.length - 1;
      if (this.ohlcv.length < 2) return;
      if (this.ohlcv.length <= dl) {
        var s = 0,
          d = ml;
      } else {
        s = l - dl, d = 0.5;
      }
      if (!this.$props.ib) {
        utils.overwrite(this.range, [this.ohlcv[s][0] - this.interval * d, this.ohlcv[l][0] + this.interval * ml]);
      } else {
        var _this$chart3;
        var newArr = [s - this.interval * d, l + this.interval * ml];
        console.log("this.forced_initRange", this.forced_initRange);
        if (this.forced_initRange) {
          newArr = this.forced_initRange;
        } else {
          var _this$chart, _this$chart2;
          if ((_this$chart = this.chart) !== null && _this$chart !== void 0 && _this$chart.initRange && ((_this$chart2 = this.chart) === null || _this$chart2 === void 0 || (_this$chart2 = _this$chart2.initRange) === null || _this$chart2 === void 0 ? void 0 : _this$chart2.length) == 2) {
            newArr = this.chart.initRange;
          }
        }
        console.log("searchResults Library Data", newArr, (_this$chart3 = this.chart) === null || _this$chart3 === void 0 ? void 0 : _this$chart3.initRange, this.forced_initRange);
        utils.overwrite(this.range, newArr);
      }
    },
    subset: function subset(range, type) {
      if (range === void 0) {
        range = this.range;
      }
      var _this$filter = this.filter(this.ohlcv, range[0] - this.interval, range[1]),
        _this$filter2 = _slicedToArray(_this$filter, 2),
        res = _this$filter2[0],
        index = _this$filter2[1];
      this.ti_map = new TI();
      if (res) {
        this.sub_start = index;
        this.ti_map.init(this, res);
        if (!this.$props.ib) return res || [];
        // console.log("subset "+type,{
        //   range,index,res,sub_i:this.ti_map.sub_i
        // })
        return this.ti_map.sub_i;
      }
      return [];
    },
    common_props: function common_props() {
      return {
        title_txt: this.chart.name || this.$props.title_txt,
        layout: this._layout,
        sub: this.sub,
        range: this.range,
        interval: this.interval,
        cursor: this.cursor,
        colors: this.$props.colors,
        font: this.$props.font,
        y_ts: this.y_transforms,
        tv_id: this.$props.tv_id,
        config: this.$props.config,
        buttons: this.$props.buttons,
        meta: this.meta,
        skin: this.$props.skin,
        noidea: true
      };
    },
    overlay_subset: function overlay_subset(source, side) {
      var _this3 = this;
      return source.map(function (d, i) {
        var res = utils.fast_filter(d.data, _this3.ti_map.i2t_mode(_this3.range[0] - _this3.interval, d.indexSrc), _this3.ti_map.i2t_mode(_this3.range[1], d.indexSrc));
        return {
          type: d.type,
          name: utils.format_name(d),
          data: _this3.ti_map.parse(res[0] || [], d.indexSrc || 'map'),
          settings: d.settings || _this3.settings_ov,
          grid: d.grid || {},
          tf: utils.parse_tf(d.tf),
          i0: res[1],
          loading: d.loading,
          some: 1,
          last: (_this3.last_values[side] || [])[i]
        };
      });
    },
    section_props: function section_props(i) {
      return i === 0 ? this.main_section : this.sub_section;
    },
    init_range: function init_range() {
      this.calc_interval('init_range');
      this.default_range();
    },
    layer_meta_props: function layer_meta_props(d) {
      // TODO: check reactivity when layout is changed
      if (!(d.grid_id in this.layers_meta)) {
        this.$set(this.layers_meta, d.grid_id, {});
      }
      this.$set(this.layers_meta[d.grid_id], d.layer_id, d);

      // Rerender
      this.update_layout();
    },
    remove_meta_props: function remove_meta_props(grid_id, layer_id) {
      if (grid_id in this.layers_meta) {
        this.$delete(this.layers_meta[grid_id], layer_id);
      }
    },
    emit_custom_event: function emit_custom_event(d) {
      this.on_shader_event(d, 'botbar');
      // console.log('emit_custom_event',d)
      this.$emit('custom-event', d);
      if (d.event === 'remove-layer-meta') {
        this.remove_meta_props.apply(this, _toConsumableArray(d.args));
      }
    },
    update_layout: function update_layout(clac_tf) {
      if (clac_tf) this.calc_interval('update_layout');
      var lay = new layout(this);
      utils.copy_layout(this._layout, lay);
      if (this._hook_update) this.ce('?chart-update', lay);
    },
    legend_button_click: function legend_button_click(event) {
      this.$emit('legend-button-click', event);
    },
    register_kb: function register_kb(event) {
      if (!this.$refs.keyboard) return;
      this.$refs.keyboard.register(event);
    },
    remove_kb: function remove_kb(event) {
      if (!this.$refs.keyboard) return;
      this.$refs.keyboard.remove(event);
    },
    update_last_values: function update_last_values() {
      var _this4 = this;
      this.last_candle = this.ohlcv ? this.ohlcv[this.ohlcv.length - 1] : undefined;
      this.last_values = {
        onchart: [],
        offchart: []
      };
      this.onchart.forEach(function (x, i) {
        var d = x.data || [];
        _this4.last_values.onchart[i] = d[d.length - 1];
      });
      this.offchart.forEach(function (x, i) {
        var d = x.data || [];
        _this4.last_values.offchart[i] = d[d.length - 1];
      });
    },
    // Hook events for extensions
    ce: function ce(event) {
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      this.emit_custom_event({
        event: event,
        args: args
      });
    },
    // Set hooks list (called from an extension)
    hooks: function hooks() {
      var _this5 = this;
      for (var _len2 = arguments.length, list = new Array(_len2), _key2 = 0; _key2 < _len2; _key2++) {
        list[_key2] = arguments[_key2];
      }
      list.forEach(function (x) {
        return _this5["_hook_".concat(x)] = true;
      });
    },
    toggleSidebarCustomRange: function toggleSidebarCustomRange(vericalRange) {
      this.y_transforms['0'] = {
        grid_id: 0,
        zoom: 1,
        auto: false,
        range: vericalRange,
        drugging: false
      };
      this.update_layout();
      this.$emit('sidebar-transform', this.y_transforms['0']);
      // const lay = new Layout(this)
      // this.ce('?chart-update',lay)
    },
    toggleSideBarYAxis: function toggleSideBarYAxis() {
      var _this$$refs;
      var gridKeys = Object.keys(this.y_transforms);
      var mainSideBar = (_this$$refs = this.$refs) === null || _this$$refs === void 0 ? void 0 : _this$$refs.sec[0].$refs['sb-0'];
      if (gridKeys.length > 0 && gridKeys.includes("0")) {
        var isAuto = this.y_transforms['0'].auto;
        if (isAuto) {
          var _mainSideBar$renderer;
          this.y_transforms['0'].auto = !isAuto;
          if (mainSideBar !== null && mainSideBar !== void 0 && (_mainSideBar$renderer = mainSideBar.renderer) !== null && _mainSideBar$renderer !== void 0 && _mainSideBar$renderer.calc_range_function) {
            var currentRange = mainSideBar.renderer.calc_range_function();
            this.y_transforms['0'].range = currentRange;
          }
        } else {
          this.y_transforms['0'].auto = !isAuto;
        }
        this.update_layout();
        this.$emit('sidebar-transform', this.y_transforms['0']);
        console.log("noideawill", this.y_transforms['0'], gridKeys);
      } else {
        var _mainSideBar$renderer2;
        console.log("mainSideBar", mainSideBar);
        if (mainSideBar !== null && mainSideBar !== void 0 && (_mainSideBar$renderer2 = mainSideBar.renderer) !== null && _mainSideBar$renderer2 !== void 0 && _mainSideBar$renderer2.calc_range_function) {
          var _currentRange = mainSideBar.renderer.calc_range_function();
          this.y_transforms['0'] = {
            grid_id: 0,
            zoom: 1,
            auto: false,
            range: _currentRange,
            drugging: false
          };
          this.update_layout();
        }
        this.$emit('sidebar-transform', this.y_transforms['0']);
      }
    }
  },
  mounted: function mounted() {
    console.log("layout==>", this._layout.grids);
  }
});
;// CONCATENATED MODULE: ./src/components/Chart.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Chartvue_type_script_lang_js_ = (Chartvue_type_script_lang_js_); 
;// CONCATENATED MODULE: ./src/components/Chart.vue





/* normalize component */
;
var Chart_component = normalizeComponent(
  components_Chartvue_type_script_lang_js_,
  Chartvue_type_template_id_6139f27a_render,
  Chartvue_type_template_id_6139f27a_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Chart = (Chart_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=template&id=320099a6&
var Toolbarvue_type_template_id_320099a6_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    key: _vm.tool_count,
    staticClass: "trading-vue-toolbar",
    style: _vm.styles
  }, _vm._l(_vm.groups, function (tool, i) {
    return tool.icon && !tool.hidden ? _c("toolbar-item", {
      key: i,
      attrs: {
        data: tool,
        subs: _vm.sub_map,
        dc: _vm.data,
        config: _vm.config,
        colors: _vm.colors,
        selected: _vm.is_selected(tool)
      },
      on: {
        "item-selected": _vm.selected
      }
    }) : _vm._e();
  }), 1);
};
var Toolbarvue_type_template_id_320099a6_staticRenderFns = [];
Toolbarvue_type_template_id_320099a6_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Toolbar.vue?vue&type=template&id=320099a6&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=template&id=5ce1aaa3&
var ToolbarItemvue_type_template_id_5ce1aaa3_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    "class": ["trading-vue-tbitem", _vm.selected ? "selected-item" : ""],
    style: _vm.item_style,
    on: {
      click: function click($event) {
        return _vm.emit_selected("click");
      },
      mousedown: _vm.mousedown,
      touchstart: _vm.mousedown,
      touchend: function touchend($event) {
        return _vm.emit_selected("touch");
      }
    }
  }, [_c("div", {
    staticClass: "trading-vue-tbicon tvjs-pixelated",
    style: _vm.icon_style
  }), _vm._v(" "), _vm.data.group ? _c("div", {
    staticClass: "trading-vue-tbitem-exp",
    style: _vm.exp_style,
    on: {
      click: _vm.exp_click,
      mousedown: _vm.expmousedown,
      mouseover: _vm.expmouseover,
      mouseleave: _vm.expmouseleave
    }
  }, [_vm._v("\n        ᐳ\n    ")]) : _vm._e(), _vm._v(" "), _vm.show_exp_list ? _c("item-list", {
    attrs: {
      config: _vm.config,
      items: _vm.data.items,
      colors: _vm.colors,
      dc: _vm.dc
    },
    on: {
      "close-list": _vm.close_list,
      "item-selected": _vm.emit_selected_sub
    }
  }) : _vm._e()], 1);
};
var ToolbarItemvue_type_template_id_5ce1aaa3_staticRenderFns = [];
ToolbarItemvue_type_template_id_5ce1aaa3_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue?vue&type=template&id=5ce1aaa3&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=template&id=75847764&
var ItemListvue_type_template_id_75847764_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "tvjs-item-list",
    style: _vm.list_style(),
    on: {
      mousedown: _vm.thismousedown
    }
  }, _vm._l(_vm.items, function (item) {
    return !item.hidden ? _c("div", {
      "class": _vm.item_class(item),
      style: _vm.item_style(item),
      on: {
        click: function click(e) {
          return _vm.item_click(e, item);
        }
      }
    }, [_c("div", {
      staticClass: "trading-vue-tbicon tvjs-pixelated",
      style: _vm.icon_style(item)
    }), _vm._v(" "), _c("div", [_vm._v(_vm._s(item.type))])]) : _vm._e();
  }), 0);
};
var ItemListvue_type_template_id_75847764_staticRenderFns = [];
ItemListvue_type_template_id_75847764_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/ItemList.vue?vue&type=template&id=75847764&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=script&lang=js&
/* harmony default export */ const ItemListvue_type_script_lang_js_ = ({
  name: 'ItemList',
  props: ['config', 'items', 'colors', 'dc'],
  data: function data() {
    return {};
  },
  computed: {},
  mounted: function mounted() {
    window.addEventListener('mousedown', this.onmousedown);
  },
  beforeDestroy: function beforeDestroy() {
    window.removeEventListener('mousedown', this.onmousedown);
  },
  methods: {
    list_style: function list_style() {
      var conf = this.$props.config;
      var w = conf.TOOLBAR;
      var brd = this.colors.tbListBorder || this.colors.grid;
      var bstl = "1px solid ".concat(brd);
      return {
        left: "".concat(w, "px"),
        background: this.colors.back,
        borderTop: bstl,
        borderRight: bstl,
        borderBottom: bstl
      };
    },
    item_class: function item_class(item) {
      if (this.dc.tool === item.type) {
        return 'tvjs-item-list-item selected-item';
      }
      return 'tvjs-item-list-item';
    },
    item_style: function item_style(item) {
      var conf = this.$props.config;
      var h = conf.TB_ICON + conf.TB_ITEM_M * 2 + 8;
      var sel = this.dc.tool === item.type;
      return {
        height: "".concat(h, "px"),
        color: sel ? undefined : '#888888'
      };
    },
    icon_style: function icon_style(data) {
      var conf = this.$props.config;
      var br = conf.TB_ICON_BRI;
      var im = conf.TB_ITEM_M;
      return {
        'background-image': "url(".concat(data.icon, ")"),
        'width': '25px',
        'height': '25px',
        'margin': "".concat(im, "px"),
        'filter': "brightness(".concat(br, ")")
      };
    },
    item_click: function item_click(e, item) {
      e.cancelBubble = true;
      this.$emit('item-selected', item);
      this.$emit('close-list');
    },
    onmousedown: function onmousedown() {
      this.$emit('close-list');
    },
    thismousedown: function thismousedown(e) {
      e.stopPropagation();
    }
  }
});
;// CONCATENATED MODULE: ./src/components/ItemList.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_ItemListvue_type_script_lang_js_ = (ItemListvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ItemList.vue?vue&type=style&index=0&id=75847764&prod&lang=css&
var ItemListvue_type_style_index_0_id_75847764_prod_lang_css_ = __webpack_require__(171);
;// CONCATENATED MODULE: ./src/components/ItemList.vue?vue&type=style&index=0&id=75847764&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/ItemList.vue



;


/* normalize component */

var ItemList_component = normalizeComponent(
  components_ItemListvue_type_script_lang_js_,
  ItemListvue_type_template_id_75847764_render,
  ItemListvue_type_template_id_75847764_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const ItemList = (ItemList_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=script&lang=js&


/* harmony default export */ const ToolbarItemvue_type_script_lang_js_ = ({
  name: 'ToolbarItem',
  components: {
    ItemList: ItemList
  },
  props: ['data', 'selected', 'colors', 'tv_id', 'config', 'dc', 'subs'],
  data: function data() {
    return {
      exp_hover: false,
      show_exp_list: false,
      sub_item: null
    };
  },
  computed: {
    item_style: function item_style() {
      if (this.$props.data.type === 'System:Splitter') {
        return this.splitter;
      }
      var conf = this.$props.config;
      var im = conf.TB_ITEM_M;
      var m = (conf.TOOLBAR - conf.TB_ICON) * 0.5 - im;
      var s = conf.TB_ICON + im * 2;
      var b = this.exp_hover ? 0 : 3;
      return {
        'width': "".concat(s, "px"),
        'height': "".concat(s, "px"),
        'margin': "8px ".concat(m, "px 0px ").concat(m, "px"),
        'border-radius': "3px ".concat(b, "px ").concat(b, "px 3px")
      };
    },
    icon_style: function icon_style() {
      if (this.$props.data.type === 'System:Splitter') {
        return {};
      }
      var conf = this.$props.config;
      var br = conf.TB_ICON_BRI;
      var sz = conf.TB_ICON;
      var im = conf.TB_ITEM_M;
      var ic = this.sub_item ? this.sub_item.icon : this.$props.data.icon;
      return {
        'background-image': "url(".concat(ic, ")"),
        'width': "".concat(sz, "px"),
        'height': "".concat(sz, "px"),
        'margin': "".concat(im, "px"),
        'filter': "brightness(".concat(br, ")")
      };
    },
    exp_style: function exp_style() {
      var conf = this.$props.config;
      var im = conf.TB_ITEM_M;
      var s = conf.TB_ICON * 0.5 + im;
      var p = (conf.TOOLBAR - s * 2) / 4;
      return {
        padding: "".concat(s, "px ").concat(p, "px"),
        transform: this.show_exp_list ? 'scale(-0.6, 1)' : 'scaleX(0.6)'
      };
    },
    splitter: function splitter() {
      var conf = this.$props.config;
      var colors = this.$props.colors;
      var c = colors.grid;
      var im = conf.TB_ITEM_M;
      var m = (conf.TOOLBAR - conf.TB_ICON) * 0.5 - im;
      var s = conf.TB_ICON + im * 2;
      return {
        'width': "".concat(s, "px"),
        'height': '1px',
        'margin': "8px ".concat(m, "px 8px ").concat(m, "px"),
        'background-color': c
      };
    }
  },
  mounted: function mounted() {
    if (this.data.group) {
      var type = this.subs[this.data.group];
      var item = this.data.items.find(function (x) {
        return x.type === type;
      });
      if (item) this.sub_item = item;
    }
  },
  methods: {
    mousedown: function mousedown(e) {
      var _this = this;
      this.click_start = utils.now();
      this.click_id = setTimeout(function () {
        _this.show_exp_list = true;
      }, this.config.TB_ICON_HOLD);
    },
    expmouseover: function expmouseover() {
      this.exp_hover = true;
    },
    expmouseleave: function expmouseleave() {
      this.exp_hover = false;
    },
    expmousedown: function expmousedown(e) {
      if (this.show_exp_list) e.stopPropagation();
    },
    emit_selected: function emit_selected(src) {
      if (utils.now() - this.click_start > this.config.TB_ICON_HOLD) return;
      clearTimeout(this.click_id);
      //if (Utils.is_mobile && src === 'click') return
      // TODO: double firing
      if (!this.data.group) {
        this.$emit('item-selected', this.data);
      } else {
        var item = this.sub_item || this.data.items[0];
        this.$emit('item-selected', item);
      }
    },
    emit_selected_sub: function emit_selected_sub(item) {
      this.$emit('item-selected', item);
      this.sub_item = item;
    },
    exp_click: function exp_click(e) {
      if (!this.data.group) return;
      e.cancelBubble = true;
      this.show_exp_list = !this.show_exp_list;
    },
    close_list: function close_list() {
      this.show_exp_list = false;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_ToolbarItemvue_type_script_lang_js_ = (ToolbarItemvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/ToolbarItem.vue?vue&type=style&index=0&id=5ce1aaa3&prod&lang=css&
var ToolbarItemvue_type_style_index_0_id_5ce1aaa3_prod_lang_css_ = __webpack_require__(915);
;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue?vue&type=style&index=0&id=5ce1aaa3&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/ToolbarItem.vue



;


/* normalize component */

var ToolbarItem_component = normalizeComponent(
  components_ToolbarItemvue_type_script_lang_js_,
  ToolbarItemvue_type_template_id_5ce1aaa3_render,
  ToolbarItemvue_type_template_id_5ce1aaa3_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const ToolbarItem = (ToolbarItem_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=script&lang=js&
function Toolbarvue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = Toolbarvue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function Toolbarvue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return Toolbarvue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return Toolbarvue_type_script_lang_js_arrayLikeToArray(o, minLen); }
function Toolbarvue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

/* harmony default export */ const Toolbarvue_type_script_lang_js_ = ({
  name: 'Toolbar',
  components: {
    ToolbarItem: ToolbarItem
  },
  props: ['data', 'height', 'colors', 'tv_id', 'config'],
  data: function data() {
    return {
      tool_count: 0,
      sub_map: {}
    };
  },
  computed: {
    styles: function styles() {
      var colors = this.$props.colors;
      var b = this.$props.config.TB_BORDER;
      var w = this.$props.config.TOOLBAR - b;
      var c = colors.grid;
      var cb = colors.tbBack || colors.back;
      var brd = colors.tbBorder || colors.scale;
      var st = this.$props.config.TB_B_STYLE;
      return {
        'width': "".concat(w, "px"),
        'height': "".concat(this.$props.height - 3, "px"),
        'background-color': cb,
        'border-right': "".concat(b, "px ").concat(st, " ").concat(brd)
      };
    },
    groups: function groups() {
      var arr = [];
      var _iterator = Toolbarvue_type_script_lang_js_createForOfIteratorHelper(this.data.tools || []),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var tool = _step.value;
          if (!tool.group) {
            arr.push(tool);
            continue;
          }
          var g = arr.find(function (x) {
            return x.group === tool.group;
          });
          if (!g) {
            arr.push({
              group: tool.group,
              icon: tool.icon,
              items: [tool]
            });
          } else {
            g.items.push(tool);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return arr;
    }
  },
  watch: {
    data: {
      handler: function handler(n) {
        // For some reason Vue.js doesn't want to
        // update 'tools' automatically when new item
        // is pushed/removed. Yo, Vue, I herd you
        // you want more dirty tricks?
        if (n.tools) this.tool_count = n.tools.length;
      },
      deep: true
    }
  },
  mounted: function mounted() {},
  methods: {
    selected: function selected(tool) {
      this.$emit('custom-event', {
        event: 'tool-selected',
        args: [tool.type]
      });
      if (tool.group) {
        // TODO: emit the sub map to DC (save)
        this.sub_map[tool.group] = tool.type;
      }
    },
    is_selected: function is_selected(tool) {
      var _this = this;
      if (tool.group) {
        return !!tool.items.find(function (x) {
          return x.type === _this.data.tool;
        });
      }
      return tool.type === this.data.tool;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Toolbar.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Toolbarvue_type_script_lang_js_ = (Toolbarvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Toolbar.vue?vue&type=style&index=0&id=320099a6&prod&lang=css&
var Toolbarvue_type_style_index_0_id_320099a6_prod_lang_css_ = __webpack_require__(452);
;// CONCATENATED MODULE: ./src/components/Toolbar.vue?vue&type=style&index=0&id=320099a6&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/Toolbar.vue



;


/* normalize component */

var Toolbar_component = normalizeComponent(
  components_Toolbarvue_type_script_lang_js_,
  Toolbarvue_type_template_id_320099a6_render,
  Toolbarvue_type_template_id_320099a6_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Toolbar = (Toolbar_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=template&id=296e303a&
var Widgetsvue_type_template_id_296e303a_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "tvjs-widgets",
    style: {
      width: _vm.width + "px",
      height: _vm.height + "px"
    }
  }, _vm._l(Object.keys(_vm.map), function (id) {
    return _c(_vm.initw(id), {
      key: id,
      tag: "component",
      attrs: {
        id: id,
        main: _vm.map[id].ctrl,
        data: _vm.map[id].data,
        tv: _vm.tv,
        dc: _vm.dc
      }
    });
  }), 1);
};
var Widgetsvue_type_template_id_296e303a_staticRenderFns = [];
Widgetsvue_type_template_id_296e303a_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/Widgets.vue?vue&type=template&id=296e303a&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=script&lang=js&
/* harmony default export */ const Widgetsvue_type_script_lang_js_ = ({
  name: 'Widgets',
  props: ['width', 'height', 'map', 'tv', 'dc'],
  methods: {
    initw: function initw(id) {
      return this.$props.map[id].cls;
    }
  }
});
;// CONCATENATED MODULE: ./src/components/Widgets.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_Widgetsvue_type_script_lang_js_ = (Widgetsvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/Widgets.vue?vue&type=style&index=0&id=296e303a&prod&lang=css&
var Widgetsvue_type_style_index_0_id_296e303a_prod_lang_css_ = __webpack_require__(13);
;// CONCATENATED MODULE: ./src/components/Widgets.vue?vue&type=style&index=0&id=296e303a&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/Widgets.vue



;


/* normalize component */

var Widgets_component = normalizeComponent(
  components_Widgetsvue_type_script_lang_js_,
  Widgetsvue_type_template_id_296e303a_render,
  Widgetsvue_type_template_id_296e303a_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const Widgets = (Widgets_component.exports);
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/loaders/templateLoader.js??ruleSet[1].rules[2]!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=template&id=1be6bf21&
var TheTipvue_type_template_id_1be6bf21_render = function render() {
  var _vm = this,
    _c = _vm._self._c;
  return _c("div", {
    staticClass: "tvjs-the-tip",
    style: _vm.style,
    domProps: {
      innerHTML: _vm._s(_vm.data.text)
    },
    on: {
      mousedown: function mousedown($event) {
        return _vm.$emit("remove-me");
      }
    }
  });
};
var TheTipvue_type_template_id_1be6bf21_staticRenderFns = [];
TheTipvue_type_template_id_1be6bf21_render._withStripped = true;

;// CONCATENATED MODULE: ./src/components/TheTip.vue?vue&type=template&id=1be6bf21&

;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=script&lang=js&
/* harmony default export */ const TheTipvue_type_script_lang_js_ = ({
  name: 'TheTip',
  props: ['data'],
  computed: {
    style: function style() {
      return {
        background: this.data.color
      };
    }
  },
  mounted: function mounted() {
    var _this = this;
    setTimeout(function () {
      return _this.$emit('remove-me');
    }, 3000);
  }
});
;// CONCATENATED MODULE: ./src/components/TheTip.vue?vue&type=script&lang=js&
 /* harmony default export */ const components_TheTipvue_type_script_lang_js_ = (TheTipvue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/components/TheTip.vue?vue&type=style&index=0&id=1be6bf21&prod&lang=css&
var TheTipvue_type_style_index_0_id_1be6bf21_prod_lang_css_ = __webpack_require__(138);
;// CONCATENATED MODULE: ./src/components/TheTip.vue?vue&type=style&index=0&id=1be6bf21&prod&lang=css&

;// CONCATENATED MODULE: ./src/components/TheTip.vue



;


/* normalize component */

var TheTip_component = normalizeComponent(
  components_TheTipvue_type_script_lang_js_,
  TheTipvue_type_template_id_1be6bf21_render,
  TheTipvue_type_template_id_1be6bf21_staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const TheTip = (TheTip_component.exports);
;// CONCATENATED MODULE: ./src/mixins/xcontrol.js
function xcontrol_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = xcontrol_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function xcontrol_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return xcontrol_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return xcontrol_arrayLikeToArray(o, minLen); }
function xcontrol_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// extensions control

/* harmony default export */ const xcontrol = ({
  mounted: function mounted() {
    this.ctrllist();
    this.skin_styles();
  },
  methods: {
    // Build / rebuild component list
    ctrllist: function ctrllist() {
      this.ctrl_destroy();
      this.controllers = [];
      var _iterator = xcontrol_createForOfIteratorHelper(this.$props.extensions),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var x = _step.value;
          var name = x.Main.__name__;
          if (!this.xSettings[name]) {
            this.$set(this.xSettings, name, {});
          }
          var nc = new x.Main(this,
          // tv inst
          this.data,
          // dc
          this.xSettings[name] // settings
          );

          nc.name = name;
          this.controllers.push(nc);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return this.controllers;
    },
    // TODO: preventDefault
    pre_dc: function pre_dc(e) {
      var _iterator2 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ctrl = _step2.value;
          if (ctrl.update) {
            ctrl.update(e);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    },
    post_dc: function post_dc(e) {
      var _iterator3 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var ctrl = _step3.value;
          if (ctrl.post_update) {
            ctrl.post_update(e);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    },
    ctrl_destroy: function ctrl_destroy() {
      var _iterator4 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var ctrl = _step4.value;
          if (ctrl.destroy) ctrl.destroy();
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
    },
    skin_styles: function skin_styles() {
      var id = 'tvjs-skin-styles';
      var stbr = document.getElementById(id);
      if (stbr) {
        var parent = stbr.parentNode;
        parent.removeChild(stbr);
      }
      if (this.skin_proto && this.skin_proto.styles) {
        var sheet = document.createElement('style');
        sheet.setAttribute('id', id);
        sheet.innerHTML = this.skin_proto.styles;
        this.$el.appendChild(sheet);
      }
    }
  },
  computed: {
    ws: function ws() {
      var ws = {};
      var _iterator5 = xcontrol_createForOfIteratorHelper(this.controllers),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var ctrl = _step5.value;
          if (ctrl.widgets) {
            for (var id in ctrl.widgets) {
              ws[id] = ctrl.widgets[id];
              ws[id].ctrl = ctrl;
            }
          }
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
      return ws;
    },
    skins: function skins() {
      var sks = {};
      var _iterator6 = xcontrol_createForOfIteratorHelper(this.$props.extensions),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var x = _step6.value;
          for (var id in x.skins || {}) {
            sks[id] = x.skins[id];
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
      return sks;
    },
    skin_proto: function skin_proto() {
      return this.skins[this.$props.skin];
    },
    colorpack: function colorpack() {
      var sel = this.skins[this.$props.skin];
      return sel ? sel.colors : undefined;
    }
  },
  watch: {
    // TODO: This is fast & dirty fix, need
    // to fix the actual reactivity problem
    skin: function skin(n, p) {
      if (n !== p) this.resetChart();
      this.skin_styles();
    },
    extensions: function extensions() {
      this.ctrllist();
    },
    xSettings: {
      handler: function handler(n, p) {
        var _iterator7 = xcontrol_createForOfIteratorHelper(this.controllers),
          _step7;
        try {
          for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
            var ctrl = _step7.value;
            if (ctrl.onsettings) {
              ctrl.onsettings(n, p);
            }
          }
        } catch (err) {
          _iterator7.e(err);
        } finally {
          _iterator7.f();
        }
      },
      deep: true
    }
  },
  data: function data() {
    return {
      controllers: []
    };
  }
});
;// CONCATENATED MODULE: ./node_modules/babel-loader/lib/index.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=script&lang=js&

function TradingVuevue_type_script_lang_js_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = TradingVuevue_type_script_lang_js_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function TradingVuevue_type_script_lang_js_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return TradingVuevue_type_script_lang_js_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return TradingVuevue_type_script_lang_js_arrayLikeToArray(o, minLen); }
function TradingVuevue_type_script_lang_js_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }







/* harmony default export */ const TradingVuevue_type_script_lang_js_ = ({
  name: "TradingVue",
  components: {
    Chart: Chart,
    Toolbar: Toolbar,
    Widgets: Widgets,
    TheTip: TheTip
  },
  mixins: [xcontrol],
  props: {
    titleTxt: {
      type: String,
      "default": "TradingVue.js"
    },
    roundOffVolume: {
      type: Boolean,
      "default": false
    },
    id: {
      type: String,
      "default": "trading-vue-js"
    },
    width: {
      type: Number,
      "default": 800
    },
    height: {
      type: Number,
      "default": 421
    },
    colorTitle: {
      type: String,
      "default": "#42b883"
    },
    colorBack: {
      type: String,
      "default": "#121826"
    },
    colorGrid: {
      type: String,
      "default": "#2f3240"
    },
    colorText: {
      type: String,
      "default": "#dedddd"
    },
    colorTextHL: {
      type: String,
      "default": "#fff"
    },
    colorScale: {
      type: String,
      "default": "#838383"
    },
    colorCross: {
      type: String,
      "default": "#8091a0"
    },
    colorCandleUp: {
      type: String,
      "default": "#23a776"
    },
    colorCandleDw: {
      type: String,
      "default": "#e54150"
    },
    colorWickUp: {
      type: String,
      "default": "#23a77688"
    },
    colorWickDw: {
      type: String,
      "default": "#e5415088"
    },
    colorWickSm: {
      type: String,
      "default": "transparent" // deprecated
    },

    colorVolUp: {
      type: String,
      "default": "#79999e42"
    },
    colorVolDw: {
      type: String,
      "default": "#ef535042"
    },
    colorPanel: {
      type: String,
      "default": "#565c68"
    },
    colorTbBack: {
      type: String
    },
    colorTbBorder: {
      type: String,
      "default": "#8282827d"
    },
    colors: {
      type: Object
    },
    font: {
      type: String,
      "default": constants.ChartConfig.FONT
    },
    toolbar: {
      type: Boolean,
      "default": false
    },
    data: {
      type: Object,
      required: true
    },
    enableSideBarBoxValue: {
      type: Boolean,
      "default": false
    },
    // Your overlay classes here
    overlays: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    // Overwrites ChartConfig values,
    // see constants.js
    chartConfig: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    legendButtons: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    legendDecimal: {
      type: Boolean,
      "default": false
    },
    indexBased: {
      type: Boolean,
      "default": false
    },
    extensions: {
      type: Array,
      "default": function _default() {
        return [];
      }
    },
    xSettings: {
      type: Object,
      "default": function _default() {
        return {};
      }
    },
    skin: {
      type: String // Skin Name
    },

    timezone: {
      type: Number,
      "default": 0
    },
    enableZoom: {
      type: Boolean,
      "default": false
    },
    priceLine: {
      type: Boolean,
      "default": true
    },
    decimalPlace: {
      type: Number,
      "default": 2
    },
    applyShaders: {
      type: Boolean,
      "default": true
    },
    enableCrosshair: {
      type: Boolean,
      "default": false
    },
    enableArrow: {
      type: Boolean,
      "default": false
    },
    ignoreNegativeIndex: {
      type: Boolean,
      "default": false
    },
    ignore_OHLC: {
      type: Array[Object],
      "default": function _default() {
        return [];
      }
    },
    showSettingsButton: {
      type: Array[Object],
      "default": function _default() {
        return [];
      }
    }
  },
  data: function data() {
    return {
      reset: 0,
      tip: null
    };
  },
  computed: {
    // Copy a subset of TradingVue props
    chart_props: function chart_props() {
      var offset = this.$props.toolbar ? this.chart_config.TOOLBAR : 0;
      var chart_props = {
        title_txt: this.$props.titleTxt,
        overlays: this.$props.overlays.concat(this.mod_ovs),
        data: this.decubed,
        width: this.$props.width - offset,
        height: this.$props.height,
        font: this.font_comp,
        buttons: this.$props.legendButtons,
        toolbar: this.$props.toolbar,
        ib: this.$props.indexBased || this.index_based || false,
        colors: Object.assign({}, this.$props.colors || this.colorpack),
        skin: this.skin_proto,
        timezone: this.$props.timezone,
        showSettingsButton: this.$props.showSettingsButton
      };
      this.parse_colors(chart_props.colors);
      return chart_props;
    },
    chart_config: function chart_config() {
      return Object.assign({}, constants.ChartConfig, this.$props.chartConfig);
    },
    decubed: function decubed() {
      var data = this.$props.data;
      if (data.data !== undefined) {
        // DataCube detected
        data.init_tvjs(this);
        return data.data;
      } else {
        return data;
      }
    },
    index_based: function index_based() {
      var base = this.$props.data;
      if (base.chart) {
        return base.chart.indexBased;
      } else if (base.data) {
        return base.data.chart.indexBased;
      }
      return false;
    },
    mod_ovs: function mod_ovs() {
      var arr = [];
      var _iterator = TradingVuevue_type_script_lang_js_createForOfIteratorHelper(this.$props.extensions),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var x = _step.value;
          arr.push.apply(arr, _toConsumableArray(Object.values(x.overlays)));
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      return arr;
    },
    font_comp: function font_comp() {
      return this.skin_proto && this.skin_proto.font ? this.skin_proto.font : this.font;
    },
    auto_y_axis: function auto_y_axis() {
      var _this$$refs$chart;
      return ((_this$$refs$chart = this.$refs.chart) === null || _this$$refs$chart === void 0 ? void 0 : _this$$refs$chart.auto_y_axis) || true;
    }
  },
  beforeDestroy: function beforeDestroy() {
    this.custom_event({
      event: "before-destroy"
    });
    this.ctrl_destroy();
  },
  methods: {
    chart_data_changed: function chart_data_changed(flag) {
      this.$emit("chart_data_changed", flag);
    },
    // TODO: reset extensions?
    resetChart: function resetChart(resetRange) {
      var _this = this;
      if (resetRange === void 0) {
        resetRange = true;
      }
      this.reset++;
      var range = this.getRange();
      if (!resetRange && range[0] && range[1]) {
        this.$nextTick(function () {
          return _this.setRange.apply(_this, _toConsumableArray(range));
        });
      }
      if (resetRange) {
        var _this$$refs;
        var initRange = (_this$$refs = this.$refs) === null || _this$$refs === void 0 || (_this$$refs = _this$$refs.chart) === null || _this$$refs === void 0 ? void 0 : _this$$refs.initRange;
        if (initRange && initRange !== null && initRange !== void 0 && initRange[0] && initRange !== null && initRange !== void 0 && initRange[1]) {
          this.$nextTick(function () {
            return _this.setRange.apply(_this, _toConsumableArray(initRange));
          });
        }
      }
      this.$nextTick(function () {
        return _this.custom_event({
          event: "chart-reset",
          args: []
        });
      });
    },
    updateChart: function updateChart() {
      //  console.log(" update chart was called")
      //       this.$nextTick(() =>
      //         this.custom_event({
      //           event: "?chart-resize",
      //           args:[]
      //         })
      //       );
    },
    "goto": function goto(t) {
      // TODO: limit goto & setRange (out of data error)
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        t = ti_map.gt2i(t, this.$refs.chart.ohlcv);
      }
      this.$refs.chart["goto"](t);
    },
    setRange: function setRange(t1, t2) {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        var ohlcv = this.$refs.chart.ohlcv;
        t1 = ti_map.gt2i(t1, ohlcv);
        t2 = ti_map.gt2i(t2, ohlcv);
        // console.log('this.ignoreNegativeIndex and t1',t1, t2,this.ignoreNegativeIndex)
        if (t1 < 0 && this.ignoreNegativeIndex) {
          t1 = 0;
        }
      }
      this.$refs.chart.setRange(t1, t2);
    },
    getRange: function getRange() {
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        // Time range => index range
        // console.log('this.$refs.chart',this.$refs.chart)
        return this.$refs.chart.range.map(function (x) {
          return ti_map.i2t(x);
        });
      }
      return this.$refs.chart.range;
    },
    getCursor: function getCursor() {
      var cursor = this.$refs.chart.cursor;
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        var copy = Object.assign({}, cursor);
        copy.i = copy.t;
        copy.t = ti_map.i2t(copy.t);
        return copy;
      }
      return cursor;
    },
    getTimeIndex: function getTimeIndex(t) {
      // let cursor = this.$refs.chart.cursor;
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        // let copy = Object.assign({}, cursor);
        // copy.i = copy.t;
        // copy.t = ti_map.i2t(copy.t);
        return ti_map.t2i(t);
      }
      return null;
    },
    showTheTip: function showTheTip(text, color) {
      if (color === void 0) {
        color = "orange";
      }
      this.tip = {
        text: text,
        color: color
      };
    },
    legend_button: function legend_button(event) {
      this.custom_event({
        event: "legend-button-click",
        args: [event]
      });
    },
    custom_event: function custom_event(d) {
      if ("args" in d) {
        this.$emit.apply(this, [d.event].concat(_toConsumableArray(d.args)));
      } else {
        this.$emit(d.event);
      }
      var data = this.$props.data;
      var ctrl = this.controllers.length !== 0;
      if (ctrl) this.pre_dc(d);
      if (data.tv) {
        // If the data object is DataCube
        data.on_custom_event(d.event, d.args);
      }
      if (ctrl) this.post_dc(d);
    },
    range_changed: function range_changed(r, manualInteraction) {
      if (manualInteraction === void 0) {
        manualInteraction = false;
      }
      if (this.chart_props.ib) {
        var ti_map = this.$refs.chart.ti_map;
        r = r.map(function (x) {
          return ti_map.i2t(x);
        });
      }
      // update
      this.$emit("range-changed", r, manualInteraction);

      // this.custom_event({ event: "range-changed", args: [r,r2] });
      if (this.onrange) this.onrange(r);
    },
    sidebar_transform: function sidebar_transform(y_transform) {
      this.$emit('sidebar-transform', y_transform);
    },
    set_loader: function set_loader(dc) {
      var _this2 = this;
      this.onrange = function (r) {
        var pf = _this2.chart_props.ib ? "_ms" : "";
        var tf = _this2.$refs.chart["interval" + pf];
        dc.range_changed(r, tf);
      };
    },
    parse_colors: function parse_colors(colors) {
      for (var k in this.$props) {
        if (k.indexOf("color") === 0 && k !== "colors") {
          var k2 = k.replace("color", "");
          k2 = k2[0].toLowerCase() + k2.slice(1);
          if (colors[k2]) continue;
          colors[k2] = this.$props[k];
        }
      }
    },
    mousedown: function mousedown() {
      this.$refs.chart.activated = true;
    },
    mouseleave: function mouseleave() {
      this.$refs.chart.activated = false;
    },
    toggleSideBarYAxis: function toggleSideBarYAxis() {
      this.$refs.chart.toggleSideBarYAxis();
    },
    toggleSidebarCustomRange: function toggleSidebarCustomRange(verticalRange) {
      this.$refs.chart.toggleSidebarCustomRange(verticalRange);
    }
  },
  watch: {
    decimalPlace: function decimalPlace(n) {
      var base = this.$props.data;
      // console.log("props:",base);
      base.merge('chart.settings', {
        decimalPlace: n
      });
    },
    enableArrow: function enableArrow(n) {
      var base = this.$props.data;
      // console.log("props:",base);
      base.merge('chart.settings', {
        isArrow: n
      });
    }
  },
  mounted: function mounted() {
    var base = this.$props.data;
    // console.log("props:",this.$props.enableArrow);
    base.merge('chart.settings', {
      isArrow: this.$props.enableArrow,
      decimalPlace: this.$props.decimalPlace
    });
  }
});
;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=script&lang=js&
 /* harmony default export */ const src_TradingVuevue_type_script_lang_js_ = (TradingVuevue_type_script_lang_js_); 
// EXTERNAL MODULE: ./node_modules/vue-style-loader/index.js!./node_modules/css-loader/dist/cjs.js!./node_modules/vue-loader/lib/loaders/stylePostLoader.js!./node_modules/vue-loader/lib/index.js??vue-loader-options!./src/TradingVue.vue?vue&type=style&index=0&id=30f951ca&prod&lang=css&
var TradingVuevue_type_style_index_0_id_30f951ca_prod_lang_css_ = __webpack_require__(799);
;// CONCATENATED MODULE: ./src/TradingVue.vue?vue&type=style&index=0&id=30f951ca&prod&lang=css&

;// CONCATENATED MODULE: ./src/TradingVue.vue



;


/* normalize component */

var TradingVue_component = normalizeComponent(
  src_TradingVuevue_type_script_lang_js_,
  render,
  staticRenderFns,
  false,
  null,
  null,
  null
  
)

/* harmony default export */ const TradingVue = (TradingVue_component.exports);
;// CONCATENATED MODULE: ./node_modules/@babel/runtime/helpers/esm/asyncToGenerator.js
function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}
function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}
// EXTERNAL MODULE: ./node_modules/@babel/runtime/regenerator/index.js
var regenerator = __webpack_require__(687);
var regenerator_default = /*#__PURE__*/__webpack_require__.n(regenerator);
;// CONCATENATED MODULE: ./src/helpers/tmp/ww$$$.json
const ww$$$_namespaceObject = JSON.parse('["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"]');
// EXTERNAL MODULE: ./node_modules/lz-string/libs/lz-string.js
var lz_string = __webpack_require__(961);
var lz_string_default = /*#__PURE__*/__webpack_require__.n(lz_string);
;// CONCATENATED MODULE: ./src/helpers/script_ww_api.js




// Webworker interface

// Compiled webworker (see webpack/ww_plugin.js)



 // For webworker-loader to find the ww
var WebWork = /*#__PURE__*/function (_exec, _relay) {
  function WebWork(dc) {
    classCallCheck_classCallCheck(this, WebWork);
    this.dc = dc;
    this.tasks = {};
    this.onevent = function () {};
    this.start();
  }
  createClass_createClass(WebWork, [{
    key: "start",
    value: function start() {
      var _this = this;
      if (this.worker) this.worker.terminate();
      // URL.createObjectURL
      window.URL = window.URL || window.webkitURL;
      var data = lz_string_default().decompressFromBase64(ww$$$_namespaceObject[0]);
      var blob;
      try {
        blob = new Blob([data], {
          type: 'application/javascript'
        });
      } catch (e) {
        // Backwards-compatibility
        window.BlobBuilder = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder;
        blob = new BlobBuilder();
        blob.append(data);
        blob = blob.getBlob();
      }
      this.worker = new Worker(URL.createObjectURL(blob));
      this.worker.onmessage = function (e) {
        return _this.onmessage(e);
      };
    }
  }, {
    key: "start_socket",
    value: function start_socket() {
      var _this2 = this;
      if (!this.dc.sett.node_url) return;
      this.socket = new WebSocket(this.dc.sett.node_url);
      this.socket.addEventListener('message', function (e) {
        _this2.onmessage({
          data: JSON.parse(e.data)
        });
      });
      this.msg_queue = [];
    }
  }, {
    key: "send",
    value: function send(msg, tx_keys) {
      if (this.dc.sett.node_url) {
        return this.send_node(msg, tx_keys);
      }
      if (tx_keys) {
        var tx_objs = tx_keys.map(function (k) {
          return msg.data[k];
        });
        this.worker.postMessage(msg, tx_objs);
      } else {
        this.worker.postMessage(msg);
      }
    }

    // Send to node.js via websocket
  }, {
    key: "send_node",
    value: function send_node(msg, tx_keys) {
      if (!this.socket) this.start_socket();
      if (this.socket && this.socket.readyState) {
        // Send the old messages first
        while (this.msg_queue.length) {
          var m = this.msg_queue.shift();
          this.socket.send(JSON.stringify(m));
        }
        this.socket.send(JSON.stringify(msg));
      } else {
        this.msg_queue.push(msg);
      }
    }
  }, {
    key: "onmessage",
    value: function onmessage(e) {
      if (e.data.id in this.tasks) {
        this.tasks[e.data.id](e.data.data);
        delete this.tasks[e.data.id];
      } else {
        this.onevent(e);
      }
    }

    // Execute a task
  }, {
    key: "exec",
    value: function exec(_x, _x2, _x3) {
      return (_exec = _exec || _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee(type, data, tx_keys) {
        var _this3 = this;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              return _context.abrupt("return", new Promise(function (rs, rj) {
                var id = utils.uuid();
                _this3.send({
                  type: type,
                  id: id,
                  data: data
                }, tx_keys);
                _this3.tasks[id] = function (res) {
                  rs(res);
                };
              }));
            case 1:
            case "end":
              return _context.stop();
          }
        }, _callee);
      }))).apply(this, arguments);
    } // Execute a task, but just fucking do it,
    // do not wait for the result
  }, {
    key: "just",
    value: function just(type, data, tx_keys) {
      var id = utils.uuid();
      this.send({
        type: type,
        id: id,
        data: data
      }, tx_keys);
    }

    // Relay an event from iframe postMessage
    // (for the future)
  }, {
    key: "relay",
    value: function relay(_x4, _x5) {
      return (_relay = _relay || _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee2(event, just) {
        var _this4 = this;
        return regenerator_default().wrap(function _callee2$(_context2) {
          while (1) switch (_context2.prev = _context2.next) {
            case 0:
              if (just === void 0) {
                just = false;
              }
              return _context2.abrupt("return", new Promise(function (rs, rj) {
                _this4.send(event, event.tx_keys);
                if (!just) {
                  _this4.tasks[event.id] = function (res) {
                    rs(res);
                  };
                }
              }));
            case 2:
            case "end":
              return _context2.stop();
          }
        }, _callee2);
      }))).apply(this, arguments);
    }
  }, {
    key: "destroy",
    value: function destroy() {
      if (this.worker) this.worker.terminate();
    }
  }]);
  return WebWork;
}();
/* harmony default export */ const script_ww_api = (WebWork);
;// CONCATENATED MODULE: ./src/helpers/script_utils.js


var FDEFS = /(function |)([$A-Z_][0-9A-Z_$\.]*)[\s]*?\((.*?)\)/gmi;
var SBRACKETS = /([$A-Z_][0-9A-Z_$\.]*)[\s]*?\[([^"^\[^\]]+?)\]/gmi;
var TFSTR = /(\d+)(\w*)/gm;
var BUF_INC = 5;
var tf_cache = {};
function f_args(src) {
  FDEFS.lastIndex = 0;
  var m = FDEFS.exec(src);
  if (m) {
    var fkeyword = m[1].trim();
    var fname = m[2].trim();
    var fargs = m[3].trim();
    return fargs.split(',').map(function (x) {
      return x.trim();
    });
  }
  return [];
}
function f_body(src) {
  return src.slice(src.indexOf('{') + 1, src.lastIndexOf('}'));
}
function wrap_idxs(src, pre) {
  if (pre === void 0) {
    pre = '';
  }
  SBRACKETS.lastIndex = 0;
  var changed = false;
  do {
    var m = SBRACKETS.exec(src);
    if (m) {
      var vname = m[1].trim();
      var vindex = m[2].trim();
      if (vindex === '0' || parseInt(vindex) < BUF_INC) {
        continue;
      }
      switch (vname) {
        case 'let':
        case 'var':
        case 'return':
          continue;
      }

      //let wrap = `${pre}_v(${vname}, ${vindex})[${vindex}]`
      var wrap = "".concat(vname, "[").concat(pre, "_i(").concat(vindex, ", ").concat(vname, ")]");
      src = src.replace(m[0], wrap);
      changed = true;
    }
  } while (m);
  return changed ? src : src;
}

// Get all module helper classes
function make_module_lib(mod) {
  var lib = {};
  for (var k in mod) {
    if (k === 'main' || k === 'id') continue;
    var a = f_args(mod[k]);
    lib[k] = new Function(a, f_body(mod[k]));
  }
  return lib;
}
function get_raw_src(f) {
  if (typeof f === 'string') return f;
  var src = f.toString();
  return src.slice(src.indexOf('{') + 1, src.lastIndexOf('}'));
}

// Get tf in ms from pairs such (`15`, `m`)
function tf_from_pair(num, pf) {
  var mult = 1;
  switch (pf) {
    case 's':
      mult = Const.SECOND;
      break;
    case 'm':
      mult = Const.MINUTE;
      break;
    case 'H':
      mult = Const.HOUR;
      break;
    case 'D':
      mult = Const.DAY;
      break;
    case 'W':
      mult = Const.WEEK;
      break;
    case 'M':
      mult = Const.MONTH;
      break;
    case 'Y':
      mult = Const.YEAR;
      break;
  }
  return parseInt(num) * mult;
}
function tf_from_str(str) {
  if (typeof str === 'number') return str;
  if (tf_cache[str]) return tf_cache[str];
  TFSTR.lastIndex = 0;
  var m = TFSTR.exec(str);
  if (m) {
    tf_cache[str] = tf_from_pair(m[1], m[2]);
    return tf_cache[str];
  }
  return undefined;
}
function get_fn_id(pre, id) {
  return pre + '-' + id.split('<-').pop();
}

// Apply filter for all new overlays
function ovf(obj, f) {
  var nw = {};
  for (var id in obj) {
    nw[id] = {};
    for (var k in obj[id]) {
      if (k === 'data') continue;
      nw[id][k] = obj[id][k];
    }
    nw[id].data = f(obj[id].data);
  }
  return nw;
}

// Return index of the next element in
// dataset (since t). Impl: simple binary search
// TODO: optimize (remember the penultimate
// iteration and start from there)
function nextt(data, t, ti) {
  if (ti === void 0) {
    ti = 0;
  }
  var i0 = 0;
  var iN = data.length - 1;
  while (i0 <= iN) {
    var mid = Math.floor((i0 + iN) / 2);
    if (data[mid][ti] === t) {
      return mid;
    } else if (data[mid][ti] < t) {
      i0 = mid + 1;
    } else {
      iN = mid - 1;
    }
  }
  return t < data[mid][ti] ? mid : mid + 1;
}

// Estimated size of datasets
function size_of_dss(data) {
  var bytes = 0;
  for (var id in data) {
    if (data[id].data && data[id].data[0]) {
      var s0 = size_of(data[id].data[0]);
      bytes += s0 * data[id].data.length;
    }
  }
  return bytes;
}

// Used to measure the size of dataset
function size_of(object) {
  var list = [],
    stack = [object],
    bytes = 0;
  while (stack.length) {
    var value = stack.pop();
    var type = _typeof(value);
    if (type === 'boolean') {
      bytes += 4;
    } else if (type === 'string') {
      bytes += value.length * 2;
    } else if (type === 'number') {
      bytes += 8;
    } else if (type === 'object' && list.indexOf(value) === -1) {
      list.push(value);
      for (var i in value) {
        stack.push(value[i]);
      }
    }
  }
  return bytes;
}

// Update onchart/offchart
function update(data, val) {
  var i = data.length - 1;
  var last = data[i];
  if (!last || val[0] > last[0]) {
    data.push(val);
  } else {
    data[i] = val;
  }
}
function script_utils_now() {
  return new Date().getTime();
}
;// CONCATENATED MODULE: ./src/helpers/dataset.js




function dataset_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = dataset_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function dataset_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return dataset_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return dataset_arrayLikeToArray(o, minLen); }
function dataset_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }

// Dataset proxy between vuejs & WebWorker


var Dataset = /*#__PURE__*/function (_data) {
  function Dataset(dc, desc) {
    classCallCheck_classCallCheck(this, Dataset);
    // TODO: dataset url arrow fn tells WW
    // to load the ds directly from web

    this.type = desc.type;
    this.id = desc.id;
    this.dc = dc;

    // Send the data to WW
    if (desc.data) {
      this.dc.ww.just('upload-data', _defineProperty({}, this.id, desc));
      // Remove the data from the descriptor
      delete desc.data;
    }
    var proto = Object.getPrototypeOf(this);
    Object.setPrototypeOf(desc, proto);
    Object.defineProperty(desc, 'dc', {
      get: function get() {
        return dc;
      }
    });
  }

  // Watch for the changes of descriptors
  createClass_createClass(Dataset, [{
    key: "set",
    value:
    // Set data (overwrite the whole dataset)
    function set(data, exec) {
      if (exec === void 0) {
        exec = true;
      }
      this.dc.ww.just('dataset-op', {
        id: this.id,
        type: 'set',
        data: data,
        exec: exec
      });
    }

    // Update with new data (array of data points)
  }, {
    key: "update",
    value: function update(arr) {
      this.dc.ww.just('update-data', _defineProperty({}, this.id, arr));
    }

    // Send WW a chunk to merge. The merge algo
    // here is simpler than in DC. It just adds
    // data at the beginning or/and the end of ds
  }, {
    key: "merge",
    value: function merge(data, exec) {
      if (exec === void 0) {
        exec = true;
      }
      this.dc.ww.just('dataset-op', {
        id: this.id,
        type: 'mrg',
        data: data,
        exec: exec
      });
    }

    // Remove the ds from WW
  }, {
    key: "remove",
    value: function remove(exec) {
      if (exec === void 0) {
        exec = true;
      }
      this.dc.del("datasets.".concat(this.id));
      this.dc.ww.just('dataset-op', {
        id: this.id,
        type: 'del',
        exec: exec
      });
      delete this.dc.dss[this.id];
    }

    // Fetch data from WW
  }, {
    key: "data",
    value: function data() {
      return (_data = _data || _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee() {
        var ds;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              _context.next = 2;
              return this.dc.ww.exec('get-dataset', this.id);
            case 2:
              ds = _context.sent;
              if (ds) {
                _context.next = 5;
                break;
              }
              return _context.abrupt("return");
            case 5:
              return _context.abrupt("return", ds.data);
            case 6:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }))).apply(this, arguments);
    }
  }], [{
    key: "watcher",
    value: function watcher(n, p) {
      var nids = n.map(function (x) {
        return x.id;
      });
      var pids = p.map(function (x) {
        return x.id;
      });
      var _iterator = dataset_createForOfIteratorHelper(nids),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var id = _step.value;
          if (!pids.includes(id)) {
            var ds = n.filter(function (x) {
              return x.id === id;
            })[0];
            this.dss[id] = new Dataset(this, ds);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      var _iterator2 = dataset_createForOfIteratorHelper(pids),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var id = _step2.value;
          if (!nids.includes(id) && this.dss[id]) {
            this.dss[id].remove();
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    }

    // Make an object for data transfer
  }, {
    key: "make_tx",
    value: function make_tx(dc, types) {
      var main = dc.data.chart.data;
      var base = {};
      if (types.find(function (x) {
        return x.type === 'OHLCV';
      })) {
        base = {
          ohlcv: main
        };
      }

      // TODO: add more sophisticated search
      // (using 'script.datasets' paramerter)
      /*for (var req of types) {
          let ds = Object.values(dc.dss || {})
              .find(x => x.type === req.type)
          if (ds && ds.data) {
              base[ds.id] = {
                  id: ds.id,
                  type: ds.type,
                  data: ds.data
              }
          }
      }*/
      // TODO: Data request callback ?

      return base;
    }
  }]);
  return Dataset;
}(); // Dataset reciever (created on WW)

var DatasetWW = /*#__PURE__*/(/* unused pure expression or super */ null && (function () {
  function DatasetWW(id, data) {
    _classCallCheck(this, DatasetWW);
    this.last_upd = now();
    this.id = id;
    if (Array.isArray(data)) {
      // Regular array
      this.data = data;
      if (id === 'ohlcv') this.type = 'OHLCV';
    } else {
      // Dataset descriptor
      this.data = data.data;
      this.type = data.type;
    }
  }

  // Update from 'update-data' event
  // TODO: ds size limit (in MB / data points)
  _createClass(DatasetWW, [{
    key: "merge",
    value: function merge(data) {
      var len = this.data.length;
      if (!len) {
        this.data = data;
        return;
      }
      var t0 = this.data[0][0];
      var tN = this.data[len - 1][0];
      var l = data.filter(function (x) {
        return x[0] < t0;
      });
      var r = data.filter(function (x) {
        return x[0] > tN;
      });
      this.data = l.concat(this.data, r);
    }

    // On dataset operation
  }, {
    key: "op",
    value: function op(se, _op) {
      this.last_upd = now();
      switch (_op.type) {
        case 'set':
          this.data = _op.data;
          se.recalc_size();
          break;
        case 'del':
          delete se.data[this.id];
          se.recalc_size();
          break;
        case 'mrg':
          this.merge(_op.data);
          se.recalc_size();
          break;
      }
    }
  }], [{
    key: "update_all",
    value: function update_all(se, data) {
      for (var k in data) {
        if (k === 'ohlcv') continue;
        var id = k.split('.')[1] || k;
        if (!se.data[id]) continue;
        var arr = se.data[id].data;
        var iN = arr.length - 1;
        var last = arr[iN];
        var _iterator3 = dataset_createForOfIteratorHelper(data[k]),
          _step3;
        try {
          for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
            var dp = _step3.value;
            if (!last || dp[0] > last[0]) {
              arr.push(dp);
            }
          }
        } catch (err) {
          _iterator3.e(err);
        } finally {
          _iterator3.f();
        }
        se.data[id].last_upd = now();
      }
    }
  }]);
  return DatasetWW;
}()));
;// CONCATENATED MODULE: ./src/helpers/dc_events.js




function dc_events_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = dc_events_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function dc_events_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return dc_events_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return dc_events_arrayLikeToArray(o, minLen); }
function dc_events_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
// DataCube event handlers





var DCEvents = /*#__PURE__*/function () {
  function DCEvents() {
    var _this = this;
    classCallCheck_classCallCheck(this, DCEvents);
    this.ww = new script_ww_api(this);

    // Listen to the web-worker events
    this.ww.onevent = function (e) {
      var _iterator = dc_events_createForOfIteratorHelper(_this.tv.controllers),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var ctrl = _step.value;
          if (ctrl.ww) ctrl.ww(e.data);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      switch (e.data.type) {
        case 'request-data':
          // TODO: DataTunnel class for smarter data transfer
          if (_this.ww._data_uploading) break;
          var data = Dataset.make_tx(_this, e.data.data);
          _this.send_meta_2_ww();
          _this.ww.just('upload-data', data);
          _this.ww._data_uploading = true;
          break;
        case 'overlay-data':
          _this.on_overlay_data(e.data.data);
          break;
        case 'overlay-update':
          _this.on_overlay_update(e.data.data);
          break;
        case 'data-uploaded':
          _this.ww._data_uploading = false;
          break;
        case 'engine-state':
          _this.se_state = Object.assign(_this.se_state || {}, e.data.data);
          break;
        case 'modify-overlay':
          _this.modify_overlay(e.data.data);
          break;
        case 'script-signal':
          _this.tv.$emit('signal', e.data.data);
          break;
      }
      var _iterator2 = dc_events_createForOfIteratorHelper(_this.tv.controllers),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ctrl = _step2.value;
          if (ctrl.post_ww) ctrl.post_ww(e.data);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
    };
  }

  // Called when overalay/tv emits 'custom-event'
  createClass_createClass(DCEvents, [{
    key: "on_custom_event",
    value: function on_custom_event(event, args) {
      switch (event) {
        case 'register-tools':
          this.register_tools(args);
          break;
        case 'exec-script':
          this.exec_script(args);
          break;
        case 'exec-all-scripts':
          this.exec_all_scripts();
          break;
        case 'data-len-changed':
          this.data_changed(args);
          break;
        case 'tool-selected':
          if (!args[0]) break; // TODO: Quick fix, investigate
          if (args[0].split(':')[0] === 'System') {
            this.system_tool(args[0].split(':')[1]);
            break;
          }
          this.tv.$set(this.data, 'tool', args[0]);
          if (args[0] === 'Cursor') {
            this.drawing_mode_off();
          }
          break;
        case 'grid-mousedown':
          this.grid_mousedown(args);
          break;
        case 'drawing-mode-off':
          this.drawing_mode_off();
          break;
        case 'change-settings':
          this.change_settings(args);
          break;
        case 'range-changed':
          this.scripts_onrange.apply(this, _toConsumableArray(args));
          break;
        case 'scroll-lock':
          this.on_scroll_lock(args[0]);
          break;
        case 'object-selected':
          this.object_selected(args);
          break;
        case 'remove-tool':
          this.system_tool('Remove');
          break;
        case 'before-destroy':
          this.before_destroy();
          break;
      }
    }

    // Triggered when one or multiple settings are changed
    // We select only the changed ones & re-exec them on the
    // web worker
  }, {
    key: "on_settings",
    value: function on_settings(values, prev) {
      var _this2 = this;
      if (!this.sett.scripts) return;
      var delta = {};
      var changed = false;
      var _loop = function _loop() {
        var n = values[i];
        var arr = prev.filter(function (x) {
          return x.v === n.v;
        });
        if (!arr.length && n.p.settings.$props) {
          var id = n.p.settings.$uuid;
          if (utils.is_scr_props_upd(n, prev) && utils.delayed_exec(n.p)) {
            delta[id] = n.v;
            changed = true;
            _this2.tv.$set(n.p, 'loading', true);
          }
        }
      };
      for (var i = 0; i < values.length; i++) {
        _loop();
      }
      if (changed && Object.keys(delta).length) {
        var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
        var range = this.tv.getRange();
        this.ww.just('update-ov-settings', {
          delta: delta,
          tf: tf,
          range: range
        });
      }
    }

    // When the set of $uuids is changed
  }, {
    key: "on_ids_changed",
    value: function on_ids_changed(values, prev) {
      var rem = prev.filter(function (x) {
        return x !== undefined && !values.includes(x);
      });
      if (rem.length) {
        this.ww.just('remove-scripts', rem);
      }
    }

    // Combine all tools and their mods
  }, {
    key: "register_tools",
    value: function register_tools(tools) {
      var preset = {};
      var _iterator3 = dc_events_createForOfIteratorHelper(this.data.tools || []),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var tool = _step3.value;
          preset[tool.type] = tool;
          delete tool.type;
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      this.tv.$set(this.data, 'tools', []);
      var list = [{
        type: 'Cursor',
        icon: icons_namespaceObject["cursor.png"]
      }];
      var _iterator4 = dc_events_createForOfIteratorHelper(tools),
        _step4;
      try {
        for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
          var tool = _step4.value;
          var proto = Object.assign({}, tool.info);
          var type = tool.info.type || 'Default';
          proto.type = "".concat(tool.use_for, ":").concat(type);
          this.merge_presets(proto, preset[tool.use_for]);
          this.merge_presets(proto, preset[proto.type]);
          delete proto.mods;
          list.push(proto);
          for (var mod in tool.info.mods) {
            var mp = Object.assign({}, proto);
            mp = Object.assign(mp, tool.info.mods[mod]);
            mp.type = "".concat(tool.use_for, ":").concat(mod);
            this.merge_presets(mp, preset[tool.use_for]);
            this.merge_presets(mp, preset[mp.type]);
            list.push(mp);
          }
        }
      } catch (err) {
        _iterator4.e(err);
      } finally {
        _iterator4.f();
      }
      this.tv.$set(this.data, 'tools', list);
      this.tv.$set(this.data, 'tool', 'Cursor');
    }
  }, {
    key: "exec_script",
    value: function exec_script(args) {
      if (args.length && this.sett.scripts) {
        var obj = this.get_overlay(args[0]);
        if (!obj || obj.scripts === false) return;
        if (obj.script && obj.script.src) {
          args[0].src = obj.script.src; // opt, override the src
        }
        // Parse script props & get the values from the ov
        // TODO: remove unnecessary script initializations
        var s = obj.settings;
        var props = args[0].src.props || {};
        if (!s.$uuid) s.$uuid = "".concat(obj.type, "-").concat(utils.uuid2());
        args[0].uuid = s.$uuid;
        args[0].sett = s;
        for (var k in props || {}) {
          var proto = props[k];
          if (s[k] !== undefined) {
            proto.val = s[k]; // use the existing val
            continue;
          }
          if (proto.def === undefined) {
            // TODO: add support of info / errors to the legend
            console.error("Overlay ".concat(obj.id, ": script prop '").concat(k, "' ") + 'doesn\'t have a default value');
            return;
          }
          s[k] = proto.val = proto.def; // set the default
        }
        // Remove old props (dropped by the current exec)
        if (s.$props) {
          for (var k in s) {
            if (s.$props.includes(k) && !(k in props)) {
              delete s[k];
            }
          }
        }
        s.$props = Object.keys(args[0].src.props || {});
        this.tv.$set(obj, 'loading', true);
        var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
        var range = this.tv.getRange();
        if (obj.script && obj.script.output != null) {
          args[0].output = obj.script.output;
        }
        this.ww.just('exec-script', {
          s: args[0],
          tf: tf,
          range: range
        });
      }
    }
  }, {
    key: "exec_all_scripts",
    value: function exec_all_scripts() {
      if (!this.sett.scripts) return;
      this.set_loading(true);
      var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
      var range = this.tv.getRange();
      this.ww.just('exec-all-scripts', {
        tf: tf,
        range: range
      });
    }
  }, {
    key: "scripts_onrange",
    value: function scripts_onrange(r) {
      if (!this.sett.scripts) return;
      var delta = {};
      this.get('.').forEach(function (v) {
        if (v.script && v.script.execOnRange && v.settings.$uuid) {
          // TODO: execInterrupt flag?
          if (utils.delayed_exec(v)) {
            delta[v.settings.$uuid] = v.settings;
          }
        }
      });
      if (Object.keys(delta).length) {
        var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
        var range = this.tv.getRange();
        this.ww.just('update-ov-settings', {
          delta: delta,
          tf: tf,
          range: range
        });
      }
    }

    // Overlay modification from WW
  }, {
    key: "modify_overlay",
    value: function modify_overlay(upd) {
      var obj = this.get_overlay(upd);
      if (obj) {
        for (var k in upd.fields || {}) {
          if (typeof_typeof(obj[k]) === 'object') {
            this.merge("".concat(upd.uuid, ".").concat(k), upd.fields[k]);
          } else {
            this.tv.$set(obj, k, upd.fields[k]);
          }
        }
      }
    }
  }, {
    key: "data_changed",
    value: function data_changed(args) {
      if (!this.sett.scripts) return;
      if (this.sett.data_change_exec === false) return;
      var main = this.data.chart.data;
      if (this.ww._data_uploading) return;
      if (!this.se_state.scripts) return;
      this.send_meta_2_ww();
      this.ww.just('upload-data', {
        ohlcv: main
      });
      this.ww._data_uploading = true;
      this.set_loading(true);
    }
  }, {
    key: "set_loading",
    value: function set_loading(flag) {
      var skrr = this.get('.').filter(function (x) {
        return x.settings.$props;
      });
      var _iterator5 = dc_events_createForOfIteratorHelper(skrr),
        _step5;
      try {
        for (_iterator5.s(); !(_step5 = _iterator5.n()).done;) {
          var s = _step5.value;
          this.merge("".concat(s.id), {
            loading: flag
          });
        }
      } catch (err) {
        _iterator5.e(err);
      } finally {
        _iterator5.f();
      }
    }
  }, {
    key: "send_meta_2_ww",
    value: function send_meta_2_ww() {
      var tf = this.tv.$refs.chart.interval_ms || this.data.chart.tf;
      var range = this.tv.getRange();
      this.ww.just('send-meta-info', {
        tf: tf,
        range: range
      });
    }
  }, {
    key: "merge_presets",
    value: function merge_presets(proto, preset) {
      if (!preset) return;
      for (var k in preset) {
        if (k === 'settings') {
          Object.assign(proto[k], preset[k]);
        } else {
          proto[k] = preset[k];
        }
      }
    }
  }, {
    key: "grid_mousedown",
    value: function grid_mousedown(args) {
      var _this3 = this;
      // TODO: tool state finished?
      this.object_selected([]);
      // Remove the previous RangeTool
      var rem = function rem() {
        return _this3.get('RangeTool').filter(function (x) {
          return x.settings.shiftMode;
        }).forEach(function (x) {
          return _this3.del(x.id);
        });
      };
      if (this.data.tool && this.data.tool !== 'Cursor' && !this.data.drawingMode) {
        // Prevent from "null" tools (tool created with HODL)
        if (args[1].type !== 'tap') {
          this.tv.$set(this.data, 'drawingMode', true);
          this.build_tool(args[0]);
        } else {
          this.tv.showTheTip('<b>Hodl</b>+<b>Drug</b> to create, ' + '<b>Tap</b> to finish a tool');
        }
      } else if (this.sett.shift_measure && args[1].shiftKey) {
        rem();
        this.tv.$nextTick(function () {
          return _this3.build_tool(args[0], 'RangeTool:ShiftMode');
        });
      } else {
        rem();
      }
    }
  }, {
    key: "drawing_mode_off",
    value: function drawing_mode_off() {
      this.tv.$set(this.data, 'drawingMode', false);
      this.tv.$set(this.data, 'tool', 'Cursor');
    }

    // Place a new tool
  }, {
    key: "build_tool",
    value: function build_tool(grid_id, type) {
      var list = this.data.tools;
      type = type || this.data.tool;
      var proto = list.find(function (x) {
        return x.type === type;
      });
      if (!proto) return;
      var sett = Object.assign({}, proto.settings || {});
      var data = (proto.data || []).slice();
      if (!('legend' in sett)) sett.legend = false;
      if (!('z-index' in sett)) sett['z-index'] = 100;
      sett.$selected = true;
      sett.$state = 'wip';
      var side = grid_id ? 'offchart' : 'onchart';
      var id = this.add(side, {
        name: proto.name,
        type: type.split(':')[0],
        settings: sett,
        data: data,
        grid: {
          id: grid_id
        }
      });
      sett.$uuid = "".concat(id, "-").concat(utils.now());
      this.tv.$set(this.data, 'selected', sett.$uuid);
      this.add_trash_icon();
    }

    // Remove selected / Remove all, etc
  }, {
    key: "system_tool",
    value: function system_tool(type) {
      switch (type) {
        case 'Remove':
          if (this.data.selected) {
            this.del(this.data.selected);
            this.remove_trash_icon();
            this.drawing_mode_off();
            this.on_scroll_lock(false);
          }
          break;
      }
    }

    // Apply new overlay settings
  }, {
    key: "change_settings",
    value: function change_settings(args) {
      var settings = args[0];
      delete settings.id;
      var grid_id = args[1];
      this.merge("".concat(args[3], ".settings"), settings);
    }

    // Lock the scrolling mechanism
  }, {
    key: "on_scroll_lock",
    value: function on_scroll_lock(flag) {
      this.tv.$set(this.data, 'scrollLock', flag);
    }

    // When new object is selected / unselected
  }, {
    key: "object_selected",
    value: function object_selected(args) {
      var q = this.data.selected;
      if (q) {
        // Check if current drawing is finished
        //let res = this.get_one(`${q}.settings`)
        //if (res && res.$state !== 'finished') return
        this.merge("".concat(q, ".settings"), {
          $selected: false
        });
        this.remove_trash_icon();
      }
      this.tv.$set(this.data, 'selected', null);
      if (!args.length) return;
      this.tv.$set(this.data, 'selected', args[2]);
      this.merge("".concat(args[2], ".settings"), {
        $selected: true
      });
      this.add_trash_icon();
    }
  }, {
    key: "add_trash_icon",
    value: function add_trash_icon() {
      var type = 'System:Remove';
      if (this.data.tools.find(function (x) {
        return x.type === type;
      })) {
        return;
      }
      this.data.tools.push({
        type: type,
        icon: icons_namespaceObject["trash.png"]
      });
    }
  }, {
    key: "remove_trash_icon",
    value: function remove_trash_icon() {
      // TODO: Does not call Toolbar render (distr version)
      var type = 'System:Remove';
      utils.overwrite(this.data.tools, this.data.tools.filter(function (x) {
        return x.type !== type;
      }));
    }

    // Set overlay data from the web-worker
  }, {
    key: "on_overlay_data",
    value: function on_overlay_data(data) {
      var _this4 = this;
      this.get('.').forEach(function (x) {
        if (x.settings.$synth) _this4.del("".concat(x.id));
      });
      var _iterator6 = dc_events_createForOfIteratorHelper(data),
        _step6;
      try {
        for (_iterator6.s(); !(_step6 = _iterator6.n()).done;) {
          var ov = _step6.value;
          var obj = this.get_one("".concat(ov.id));
          if (obj) {
            this.tv.$set(obj, 'loading', false);
            if (!ov.data) continue;
            obj.data = ov.data;
          }
          if (!ov.new_ovs) continue;
          for (var id in ov.new_ovs.onchart) {
            if (!this.get_one("onchart.".concat(id))) {
              this.add('onchart', ov.new_ovs.onchart[id]);
            }
          }
          for (var id in ov.new_ovs.offchart) {
            if (!this.get_one("offchart.".concat(id))) {
              this.add('offchart', ov.new_ovs.offchart[id]);
            }
          }
        }
      } catch (err) {
        _iterator6.e(err);
      } finally {
        _iterator6.f();
      }
    }

    // Push overlay updates from the web-worker
  }, {
    key: "on_overlay_update",
    value: function on_overlay_update(data) {
      var _iterator7 = dc_events_createForOfIteratorHelper(data),
        _step7;
      try {
        for (_iterator7.s(); !(_step7 = _iterator7.n()).done;) {
          var ov = _step7.value;
          if (!ov.data) continue;
          var obj = this.get_one("".concat(ov.id));
          if (obj) {
            this.fast_merge(obj.data, ov.data, false);
          }
        }
      } catch (err) {
        _iterator7.e(err);
      } finally {
        _iterator7.f();
      }
    }

    // Clean-up unfinished business (tools)
  }, {
    key: "before_destroy",
    value: function before_destroy() {
      var f = function f(x) {
        return !x.settings.$state || x.settings.$state === 'finished';
      };
      this.data.onchart = this.data.onchart.filter(f);
      this.data.offchart = this.data.offchart.filter(f);
      this.drawing_mode_off();
      this.on_scroll_lock(false);
      this.object_selected([]);
      this.ww.destroy();
    }

    // Get overlay by grid-layer id
  }, {
    key: "get_overlay",
    value: function get_overlay(obj) {
      var id = obj.id || "g".concat(obj.grid_id, "_").concat(obj.layer_id);
      var dcid = obj.uuid || this.gldc[id];
      return this.get_one("".concat(dcid));
    }
  }]);
  return DCEvents;
}();

;// CONCATENATED MODULE: ./src/helpers/dc_core.js








function dc_core_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = dc_core_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function dc_core_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return dc_core_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return dc_core_arrayLikeToArray(o, minLen); }
function dc_core_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function dc_core_createSuper(Derived) { var hasNativeReflectConstruct = dc_core_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function dc_core_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
// DataCube "private" methods




var DCCore = /*#__PURE__*/function (_DCEvents, _range_changed) {
  _inherits(DCCore, _DCEvents);
  var _super = dc_core_createSuper(DCCore);
  function DCCore() {
    classCallCheck_classCallCheck(this, DCCore);
    return _super.apply(this, arguments);
  }
  createClass_createClass(DCCore, [{
    key: "init_tvjs",
    value:
    // Set TV instance (once). Called by TradingVue itself
    function init_tvjs($root) {
      var _this = this;
      if (!this.tv) {
        this.tv = $root;
        this.init_data();
        this.update_ids();

        // Listen to all setting changes
        // TODO: works only with merge()
        this.tv.$watch(function () {
          return _this.get_by_query('.settings');
        }, function (n, p) {
          return _this.on_settings(n, p);
        });

        // Listen to all indices changes
        this.tv.$watch(function () {
          return _this.get('.').map(function (x) {
            return x.settings.$uuid;
          });
        }, function (n, p) {
          return _this.on_ids_changed(n, p);
        });

        // Watch for all 'datasets' changes
        this.tv.$watch(function () {
          return _this.get('datasets');
        }, Dataset.watcher.bind(this));
      }
    }

    // Init Data Structure v1.1
  }, {
    key: "init_data",
    value: function init_data($root) {
      if (!('chart' in this.data)) {
        this.tv.$set(this.data, 'chart', {
          type: 'Candles',
          data: this.data.ohlcv || []
        });
      }
      if (!('onchart' in this.data)) {
        this.tv.$set(this.data, 'onchart', []);
      }
      if (!('offchart' in this.data)) {
        this.tv.$set(this.data, 'offchart', []);
      }
      if (!this.data.chart.settings) {
        this.tv.$set(this.data.chart, 'settings', {});
      }

      // Remove ohlcv cuz we have Data v1.1^
      delete this.data.ohlcv;
      if (!('datasets' in this.data)) {
        this.tv.$set(this.data, 'datasets', []);
      }

      // Init dataset proxies
      var _iterator = dc_core_createForOfIteratorHelper(this.data.datasets),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var ds = _step.value;
          if (!this.dss) this.dss = {};
          this.dss[ds.id] = new Dataset(this, ds);
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
    }

    // Range change callback (called by TradingVue)
    // TODO: improve (reliablity + chunk with limited size)
  }, {
    key: "range_changed",
    value: function range_changed(_x, _x2, _x3) {
      return (_range_changed = _range_changed || _asyncToGenerator( /*#__PURE__*/regenerator_default().mark(function _callee(range, tf, check) {
        var _this2 = this;
        var first, prom;
        return regenerator_default().wrap(function _callee$(_context) {
          while (1) switch (_context.prev = _context.next) {
            case 0:
              if (check === void 0) {
                check = false;
              }
              if (this.loader) {
                _context.next = 3;
                break;
              }
              return _context.abrupt("return");
            case 3:
              if (this.loading) {
                _context.next = 19;
                break;
              }
              first = this.data.chart.data[0][0];
              if (!(range[0] < first)) {
                _context.next = 19;
                break;
              }
              this.loading = true;
              _context.next = 9;
              return utils.pause(250);
            case 9:
              // Load bigger chunks
              range = range.slice(); // copy
              range[0] = Math.floor(range[0]);
              range[1] = Math.floor(first);
              prom = this.loader(range, tf, function (d) {
                // Callback way
                _this2.chunk_loaded(d);
              });
              if (!(prom && prom.then)) {
                _context.next = 19;
                break;
              }
              _context.t0 = this;
              _context.next = 17;
              return prom;
            case 17:
              _context.t1 = _context.sent;
              _context.t0.chunk_loaded.call(_context.t0, _context.t1);
            case 19:
              if (!check) this.last_chunk = [range, tf];
            case 20:
            case "end":
              return _context.stop();
          }
        }, _callee, this);
      }))).apply(this, arguments);
    } // A new chunk of data is loaded
    // TODO: bulletproof fetch
  }, {
    key: "chunk_loaded",
    value: function chunk_loaded(data) {
      // Updates only candlestick data, or
      if (Array.isArray(data)) {
        this.merge('chart.data', data);
      } else {
        // Bunch of overlays, including chart.data
        for (var k in data) {
          this.merge(k, data[k]);
        }
      }
      this.loading = false;
      if (this.last_chunk) {
        this.range_changed.apply(this, _toConsumableArray(this.last_chunk).concat([true]));
        this.last_chunk = null;
      }
    }

    // Update ids for all overlays
  }, {
    key: "update_ids",
    value: function update_ids() {
      this.data.chart.id = "chart.".concat(this.data.chart.type);
      console.log("this.data.chart.id", this.data.chart.id);
      var count = {};
      // grid_id,layer_id => DC id mapping
      this.gldc = {}, this.dcgl = {};
      var _iterator2 = dc_core_createForOfIteratorHelper(this.data.onchart),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var ov = _step2.value;
          if (count[ov.type] === undefined) {
            count[ov.type] = 0;
          }
          var i = count[ov.type]++;
          ov.id = "onchart.".concat(ov.type).concat(i);
          if (!ov.name) ov.name = ov.type + " ".concat(i);
          if (!ov.settings) this.tv.$set(ov, 'settings', {});

          // grid_id,layer_id => DC id mapping
          this.gldc["g0_".concat(ov.type, "_").concat(i)] = ov.id;
          this.dcgl[ov.id] = "g0_".concat(ov.type, "_").concat(i);
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      count = {};
      var grids = [{}];
      var gid = 0;
      var _iterator3 = dc_core_createForOfIteratorHelper(this.data.offchart),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var ov = _step3.value;
          if (count[ov.type] === undefined) {
            count[ov.type] = 0;
          }
          var _i = count[ov.type]++;
          ov.id = "offchart.".concat(ov.type).concat(_i);
          if (!ov.name) ov.name = ov.type + " ".concat(_i);
          if (!ov.settings) this.tv.$set(ov, 'settings', {});

          // grid_id,layer_id => DC id mapping
          gid++;
          var rgid = (ov.grid || {}).id || gid; // real grid_id
          // When we merge grid, skip ++
          if ((ov.grid || {}).id) gid--;
          if (!grids[rgid]) grids[rgid] = {};
          if (grids[rgid][ov.type] === undefined) {
            grids[rgid][ov.type] = 0;
          }
          var ri = grids[rgid][ov.type]++;
          this.gldc["g".concat(rgid, "_").concat(ov.type, "_").concat(ri)] = ov.id;
          this.dcgl[ov.id] = "g".concat(rgid, "_").concat(ov.type, "_").concat(ri);
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
    }

    // TODO: chart refine (from the exchange chart)
  }, {
    key: "update_candle",
    value: function update_candle(data) {
      var ohlcv = this.data.chart.data;
      var last = ohlcv[ohlcv.length - 1];
      var candle = data['candle'];
      var tf = this.tv.$refs.chart.interval_ms;
      var t_next = last[0] + tf;
      var now = data.t || utils.now();
      var t = now >= t_next ? now - now % tf : last[0];

      // Update the entire candle
      if (candle.length >= 6) {
        t = candle[0];
      } else {
        candle = [t].concat(_toConsumableArray(candle));
      }
      this.agg.push('ohlcv', candle);
      this.update_overlays(data, t, tf);
      return t >= t_next;
    }
  }, {
    key: "update_tick",
    value: function update_tick(data) {
      var ohlcv = this.data.chart.data;
      var last = ohlcv[ohlcv.length - 1];
      var tick = data['price'];
      var volume = data['volume'] || 0;
      var tf = this.tv.$refs.chart.interval_ms;
      if (!tf) {
        return console.warn('Define the main timeframe');
      }
      var now = data.t || utils.now();
      if (!last) last = [now - now % tf];
      var t_next = last[0] + tf;
      var t = now >= t_next ? now - now % tf : last[0];
      if ((t >= t_next || !ohlcv.length) && tick !== undefined) {
        // And new zero-height candle
        var nc = [t, tick, tick, tick, tick, volume];
        this.agg.push('ohlcv', nc, tf);
        ohlcv.push(nc);
        this.scroll_to(t);
      } else if (tick !== undefined) {
        // Update an existing one
        // TODO: make a separate class Sampler
        last[2] = Math.max(tick, last[2]);
        last[3] = Math.min(tick, last[3]);
        last[4] = tick;
        last[5] += volume;
        this.agg.push('ohlcv', last, tf);
      }
      this.update_overlays(data, t, tf);
      return t >= t_next;
    }

    // Updates all overlays with given values.
  }, {
    key: "update_overlays",
    value: function update_overlays(data, t, tf) {
      for (var k in data) {
        if (k === 'price' || k === 'volume' || k === 'candle' || k === 't') {
          continue;
        }
        if (k.includes('datasets.')) {
          this.agg.push(k, data[k], tf);
          continue;
        }
        if (!Array.isArray(data[k])) {
          var val = [data[k]];
        } else {
          val = data[k];
        }
        if (!k.includes('.data')) k += '.data';
        this.agg.push(k, [t].concat(_toConsumableArray(val)), tf);
      }
    }

    // Returns array of objects matching query.
    // Object contains { parent, index, value }
    // TODO: query caching
  }, {
    key: "get_by_query",
    value: function get_by_query(query, chuck) {
      var tuple = query.split('.');
      switch (tuple[0]) {
        case 'chart':
          var result = this.chart_as_piv(tuple);
          break;
        case 'onchart':
        case 'offchart':
          result = this.query_search(query, tuple);
          break;
        case 'datasets':
          result = this.query_search(query, tuple);
          var _iterator4 = dc_core_createForOfIteratorHelper(result),
            _step4;
          try {
            for (_iterator4.s(); !(_step4 = _iterator4.n()).done;) {
              var r = _step4.value;
              if (r.i === 'data') {
                r.v = this.dss[r.p.id].data();
              }
            }
          } catch (err) {
            _iterator4.e(err);
          } finally {
            _iterator4.f();
          }
          break;
        default:
          /* Should get('.') return also the chart? */
          /*let ch = this.chart_as_query([
              'chart',
              tuple[1]
          ])*/
          var on = this.query_search(query, ['onchart', tuple[0], tuple[1]]);
          var off = this.query_search(query, ['offchart', tuple[0], tuple[1]]);
          result = [].concat(_toConsumableArray(on), _toConsumableArray(off));
          break;
      }
      return result.filter(function (x) {
        return !(x.v || {}).locked || chuck;
      });
    }
  }, {
    key: "chart_as_piv",
    value: function chart_as_piv(tuple) {
      var field = tuple[1];
      if (field) return [{
        p: this.data.chart,
        i: field,
        v: this.data.chart[field]
      }];else return [{
        p: this.data,
        i: 'chart',
        v: this.data.chart
      }];
    }
  }, {
    key: "query_search",
    value: function query_search(query, tuple) {
      var _this3 = this;
      var side = tuple[0];
      var path = tuple[1] || '';
      var field = tuple[2];
      var arr = this.data[side].filter(function (x) {
        return x.id === query || x.id && x.id.includes(path) || x.name === query || x.name && x.name.includes(path) || query.includes((x.settings || {}).$uuid);
      });
      if (field) {
        return arr.map(function (x) {
          return {
            p: x,
            i: field,
            v: x[field]
          };
        });
      }
      return arr.map(function (x, i) {
        return {
          p: _this3.data[side],
          i: _this3.data[side].indexOf(x),
          v: x
        };
      });
    }
  }, {
    key: "merge_objects",
    value: function merge_objects(obj, data, new_obj) {
      if (new_obj === void 0) {
        new_obj = {};
      }
      // The only way to get Vue to update all stuff
      // reactively is to create a brand new object.
      // TODO: Is there a simpler approach?
      Object.assign(new_obj, obj.v);
      Object.assign(new_obj, data);
      this.tv.$set(obj.p, obj.i, new_obj);
    }

    // Merge overlapping time series
  }, {
    key: "merge_ts",
    value: function merge_ts(obj, data) {
      // Assume that both arrays are pre-sorted

      if (!data.length) return obj.v;
      var r1 = [obj.v[0][0], obj.v[obj.v.length - 1][0]];
      var r2 = [data[0][0], data[data.length - 1][0]];

      // Overlap
      var o = [Math.max(r1[0], r2[0]), Math.min(r1[1], r2[1])];
      if (o[1] >= o[0]) {
        var _obj$v, _data;
        var _this$ts_overlap = this.ts_overlap(obj.v, data, o),
          od = _this$ts_overlap.od,
          d1 = _this$ts_overlap.d1,
          d2 = _this$ts_overlap.d2;
        (_obj$v = obj.v).splice.apply(_obj$v, _toConsumableArray(d1));
        (_data = data).splice.apply(_data, _toConsumableArray(d2));

        // Dst === Overlap === Src
        if (!obj.v.length && !data.length) {
          this.tv.$set(obj.p, obj.i, od);
          return obj.v;
        }

        // If src is totally contained in dst
        if (!data.length) {
          data = obj.v.splice(d1[0]);
        }

        // If dst is totally contained in src
        if (!obj.v.length) {
          obj.v = data.splice(d2[0]);
        }
        this.tv.$set(obj.p, obj.i, this.combine(obj.v, od, data));
      } else {
        this.tv.$set(obj.p, obj.i, this.combine(obj.v, [], data));
      }
      return obj.v;
    }

    // TODO: review performance, move to worker
  }, {
    key: "ts_overlap",
    value: function ts_overlap(arr1, arr2, range) {
      var t1 = range[0];
      var t2 = range[1];
      var ts = {}; // timestamp map

      var a1 = arr1.filter(function (x) {
        return x[0] >= t1 && x[0] <= t2;
      });
      var a2 = arr2.filter(function (x) {
        return x[0] >= t1 && x[0] <= t2;
      });

      // Indices of segments
      var id11 = arr1.indexOf(a1[0]);
      var id12 = arr1.indexOf(a1[a1.length - 1]);
      var id21 = arr2.indexOf(a2[0]);
      var id22 = arr2.indexOf(a2[a2.length - 1]);
      for (var i = 0; i < a1.length; i++) {
        ts[a1[i][0]] = a1[i];
      }
      for (var i = 0; i < a2.length; i++) {
        ts[a2[i][0]] = a2[i];
      }
      var ts_sorted = Object.keys(ts).sort();
      return {
        od: ts_sorted.map(function (x) {
          return ts[x];
        }),
        d1: [id11, id12 - id11 + 1],
        d2: [id21, id22 - id21 + 1]
      };
    }

    // Combine parts together:
    // (destination, overlap, source)
  }, {
    key: "combine",
    value: function combine(dst, o, src) {
      function last(arr) {
        return arr[arr.length - 1][0];
      }
      if (!dst.length) {
        dst = o;
        o = [];
      }
      if (!src.length) {
        src = o;
        o = [];
      }

      // The overlap right in the middle
      if (src[0][0] >= dst[0][0] && last(src) <= last(dst)) {
        return Object.assign(dst, o);

        // The overlap is on the right
      } else if (last(src) > last(dst)) {
        // Psh(...) is faster but can overflow the stack
        if (o.length < 100000 && src.length < 100000) {
          var _dst;
          (_dst = dst).push.apply(_dst, _toConsumableArray(o).concat(_toConsumableArray(src)));
          return dst;
        } else {
          return dst.concat(o, src);
        }

        // The overlap is on the left
      } else if (src[0][0] < dst[0][0]) {
        // Push(...) is faster but can overflow the stack
        if (o.length < 100000 && src.length < 100000) {
          var _src;
          (_src = src).push.apply(_src, _toConsumableArray(o).concat(_toConsumableArray(dst)));
          return src;
        } else {
          return src.concat(o, dst);
        }
      } else {
        return [];
      }
    }

    // Simple data-point merge (faster)
  }, {
    key: "fast_merge",
    value: function fast_merge(data, point, main) {
      if (main === void 0) {
        main = true;
      }
      if (!data) return;
      var last_t = (data[data.length - 1] || [])[0];
      var upd_t = point[0];
      if (!data.length || upd_t > last_t) {
        data.push(point);
        if (main && this.sett.auto_scroll) {
          this.scroll_to(upd_t);
        }
      } else if (upd_t === last_t) {
        if (main) {
          this.tv.$set(data, data.length - 1, point);
        } else {
          data[data.length - 1] = point;
        }
      }
    }
  }, {
    key: "scroll_to",
    value: function scroll_to(t) {
      if (this.tv.$refs.chart.cursor.locked) return;
      var last = this.tv.$refs.chart.last_candle;
      if (!last) return;
      var tl = last[0];
      var d = this.tv.getRange()[1] - tl;
      if (d > 0) this.tv["goto"](t + d);
    }
  }]);
  return DCCore;
}(DCEvents);

;// CONCATENATED MODULE: ./src/helpers/sett_proxy.js
// Sends all dc.sett changes to the web-worker

/* harmony default export */ function sett_proxy(sett, ww) {
  var h = {
    get: function get(sett, k) {
      return sett[k];
    },
    set: function set(sett, k, v) {
      sett[k] = v;
      ww.just('update-dc-settings', sett);
      return true;
    }
  };
  ww.just('update-dc-settings', sett);
  return new Proxy(sett, h);
}
;// CONCATENATED MODULE: ./src/helpers/agg_tool.js


// Tick aggregation


var AggTool = /*#__PURE__*/function () {
  function AggTool(dc, _int) {
    if (_int === void 0) {
      _int = 100;
    }
    classCallCheck_classCallCheck(this, AggTool);
    this.symbols = {};
    this["int"] = _int; // Itarval in ms
    this.dc = dc;
    this.st_id = null;
    this.data_changed = false;
  }
  createClass_createClass(AggTool, [{
    key: "push",
    value: function push(sym, upd, tf) {
      var _this = this;
      // Start auto updates
      if (!this.st_id) {
        this.st_id = setTimeout(function () {
          return _this.update();
        });
      }
      tf = parseInt(tf);
      var old = this.symbols[sym];
      var t = utils.now();
      var isds = sym.includes('datasets.');
      this.data_changed = true;
      if (!old) {
        this.symbols[sym] = {
          upd: upd,
          t: t,
          data: []
        };
      } else if (upd[0] >= old.upd[0] + tf && !isds) {
        // Refine the previous data point
        this.refine(sym, old.upd.slice());
        this.symbols[sym] = {
          upd: upd,
          t: t,
          data: []
        };
      } else {
        // Tick updates the current
        this.symbols[sym].upd = upd;
        this.symbols[sym].t = t;
      }
      if (isds) {
        this.symbols[sym].data.push(upd);
      }
    }
  }, {
    key: "update",
    value: function update() {
      var _this2 = this;
      var out = {};
      for (var sym in this.symbols) {
        var upd = this.symbols[sym].upd;
        switch (sym) {
          case 'ohlcv':
            var data = this.dc.data.chart.data;
            this.dc.fast_merge(data, upd);
            out.ohlcv = data.slice(-2);
            break;
          default:
            if (sym.includes('datasets.')) {
              this.update_ds(sym, out);
              continue;
            }
            var data = this.dc.get_one("".concat(sym));
            if (!data) continue;
            this.dc.fast_merge(data, upd, false);
            break;
        }
      }
      // TODO: fill gaps
      if (this.data_changed) {
        this.dc.ww.just('update-data', out);
        this.data_changed = false;
      }
      setTimeout(function () {
        return _this2.update();
      }, this["int"]);
    }
  }, {
    key: "refine",
    value: function refine(sym, upd) {
      if (sym === 'ohlcv') {
        var data = this.dc.data.chart.data;
        this.dc.fast_merge(data, upd);
      } else {
        var data = this.dc.get_one("".concat(sym));
        if (!data) return;
        this.dc.fast_merge(data, upd, false);
      }
    }
  }, {
    key: "update_ds",
    value: function update_ds(sym, out) {
      var data = this.symbols[sym].data;
      if (data.length) {
        out[sym] = data;
        this.symbols[sym].data = [];
      }
    }
  }, {
    key: "clear",
    value: function clear() {
      this.symbols = {};
    }
  }]);
  return AggTool;
}();

;// CONCATENATED MODULE: ./src/helpers/datacube.js







function datacube_createForOfIteratorHelper(o, allowArrayLike) { var it = typeof Symbol !== "undefined" && o[Symbol.iterator] || o["@@iterator"]; if (!it) { if (Array.isArray(o) || (it = datacube_unsupportedIterableToArray(o)) || allowArrayLike && o && typeof o.length === "number") { if (it) o = it; var i = 0; var F = function F() {}; return { s: F, n: function n() { if (i >= o.length) return { done: true }; return { done: false, value: o[i++] }; }, e: function e(_e) { throw _e; }, f: F }; } throw new TypeError("Invalid attempt to iterate non-iterable instance.\nIn order to be iterable, non-array objects must have a [Symbol.iterator]() method."); } var normalCompletion = true, didErr = false, err; return { s: function s() { it = it.call(o); }, n: function n() { var step = it.next(); normalCompletion = step.done; return step; }, e: function e(_e2) { didErr = true; err = _e2; }, f: function f() { try { if (!normalCompletion && it["return"] != null) it["return"](); } finally { if (didErr) throw err; } } }; }
function datacube_unsupportedIterableToArray(o, minLen) { if (!o) return; if (typeof o === "string") return datacube_arrayLikeToArray(o, minLen); var n = Object.prototype.toString.call(o).slice(8, -1); if (n === "Object" && o.constructor) n = o.constructor.name; if (n === "Map" || n === "Set") return Array.from(o); if (n === "Arguments" || /^(?:Ui|I)nt(?:8|16|32)(?:Clamped)?Array$/.test(n)) return datacube_arrayLikeToArray(o, minLen); }
function datacube_arrayLikeToArray(arr, len) { if (len == null || len > arr.length) len = arr.length; for (var i = 0, arr2 = new Array(len); i < len; i++) arr2[i] = arr[i]; return arr2; }
function datacube_createSuper(Derived) { var hasNativeReflectConstruct = datacube_isNativeReflectConstruct(); return function _createSuperInternal() { var Super = _getPrototypeOf(Derived), result; if (hasNativeReflectConstruct) { var NewTarget = _getPrototypeOf(this).constructor; result = Reflect.construct(Super, arguments, NewTarget); } else { result = Super.apply(this, arguments); } return _possibleConstructorReturn(this, result); }; }
function datacube_isNativeReflectConstruct() { if (typeof Reflect === "undefined" || !Reflect.construct) return false; if (Reflect.construct.sham) return false; if (typeof Proxy === "function") return true; try { Boolean.prototype.valueOf.call(Reflect.construct(Boolean, [], function () {})); return true; } catch (e) { return false; } }
// Main DataHelper class. A container for data,
// which works as a proxy and CRUD interface






// Interface methods. Private methods in dc_core.js
var DataCube = /*#__PURE__*/function (_DCCore) {
  _inherits(DataCube, _DCCore);
  var _super = datacube_createSuper(DataCube);
  function DataCube(data, sett) {
    var _this;
    if (data === void 0) {
      data = {};
    }
    if (sett === void 0) {
      sett = {};
    }
    classCallCheck_classCallCheck(this, DataCube);
    var def_sett = {
      aggregation: 100,
      // Update aggregation interval
      script_depth: 0,
      // 0 === Exec on all data
      auto_scroll: true,
      // Auto scroll to a new candle
      scripts: true,
      // Enable overlays scripts,
      ww_ram_limit: 0,
      // WebWorker RAM limit (MB)
      node_url: null,
      // Use node.js instead of WW
      shift_measure: true // Draw measurment shift+click
    };

    sett = Object.assign(def_sett, sett);
    _this = _super.call(this);
    _this.sett = sett;
    _this.data = data;
    _this.sett = sett_proxy(sett, _this.ww);
    _this.agg = new AggTool(_assertThisInitialized(_this), sett.aggregation);
    _this.se_state = {};

    //this.agg.update = this.agg_update.bind(this)
    return _this;
  }

  // Add new overlay
  createClass_createClass(DataCube, [{
    key: "add",
    value: function add(side, overlay) {
      if (side !== 'onchart' && side !== 'offchart' && side !== 'datasets') {
        return;
      }
      this.data[side].push(overlay);
      this.update_ids();
      return overlay.id;
    }

    // Get all objects matching the query
  }, {
    key: "get",
    value: function get(query) {
      return this.get_by_query(query).map(function (x) {
        return x.v;
      });
    }

    // Get first object matching the query
  }, {
    key: "get_one",
    value: function get_one(query) {
      return this.get_by_query(query).map(function (x) {
        return x.v;
      })[0];
    }

    // Set data (reactively)
  }, {
    key: "set",
    value: function set(query, data) {
      var objects = this.get_by_query(query);
      var _iterator = datacube_createForOfIteratorHelper(objects),
        _step;
      try {
        for (_iterator.s(); !(_step = _iterator.n()).done;) {
          var obj = _step.value;
          var i = obj.i !== undefined ? obj.i : obj.p.indexOf(obj.v);
          if (i !== -1) {
            this.tv.$set(obj.p, i, data);
          }
        }
      } catch (err) {
        _iterator.e(err);
      } finally {
        _iterator.f();
      }
      this.update_ids();
    }

    // Merge object or array (reactively)
  }, {
    key: "merge",
    value: function merge(query, data) {
      var objects = this.get_by_query(query);
      var _iterator2 = datacube_createForOfIteratorHelper(objects),
        _step2;
      try {
        for (_iterator2.s(); !(_step2 = _iterator2.n()).done;) {
          var obj = _step2.value;
          if (Array.isArray(obj.v)) {
            if (!Array.isArray(data)) continue;
            // If array is a timeseries, merge it by timestamp
            // else merge by item index
            if (obj.v[0] && obj.v[0].length >= 2) {
              this.merge_ts(obj, data);
            } else {
              this.merge_objects(obj, data, []);
            }
          } else if (typeof_typeof(obj.v) === 'object') {
            this.merge_objects(obj, data);
          }
        }
      } catch (err) {
        _iterator2.e(err);
      } finally {
        _iterator2.f();
      }
      this.update_ids();
    }

    // Remove an overlay by query (id/type/name/...)
  }, {
    key: "del",
    value: function del(query) {
      var objects = this.get_by_query(query);
      var _iterator3 = datacube_createForOfIteratorHelper(objects),
        _step3;
      try {
        for (_iterator3.s(); !(_step3 = _iterator3.n()).done;) {
          var obj = _step3.value;
          // Find current index of the field (if not defined)
          var i = typeof obj.i !== 'number' ? obj.i : obj.p.indexOf(obj.v);
          if (i !== -1) {
            this.tv.$delete(obj.p, i);
          }
        }
      } catch (err) {
        _iterator3.e(err);
      } finally {
        _iterator3.f();
      }
      this.update_ids();
    }

    // Update/append data point, depending on timestamp
  }, {
    key: "update",
    value: function update(data) {
      if (data['candle']) {
        return this.update_candle(data);
      } else {
        return this.update_tick(data);
      }
    }

    // Lock overlays from being pulled by query_search
    // TODO: subject to review
  }, {
    key: "lock",
    value: function lock(query) {
      var objects = this.get_by_query(query);
      objects.forEach(function (x) {
        if (x.v && x.v.id && x.v.type) {
          x.v.locked = true;
        }
      });
    }

    // Unlock overlays from being pulled by query_search
    //
  }, {
    key: "unlock",
    value: function unlock(query) {
      var objects = this.get_by_query(query, true);
      objects.forEach(function (x) {
        if (x.v && x.v.id && x.v.type) {
          x.v.locked = false;
        }
      });
    }

    // Show indicator
  }, {
    key: "show",
    value: function show(query) {
      if (query === 'offchart' || query === 'onchart') {
        query += '.';
      } else if (query === '.') {
        query = '';
      }
      this.merge(query + '.settings', {
        display: true
      });
    }

    // Hide indicator
  }, {
    key: "hide",
    value: function hide(query) {
      if (query === 'offchart' || query === 'onchart') {
        query += '.';
      } else if (query === '.') {
        query = '';
      }
      this.merge(query + '.settings', {
        display: false
      });
    }

    // Set data loader callback
  }, {
    key: "onrange",
    value: function onrange(callback) {
      var _this2 = this;
      this.loader = callback;
      setTimeout(function () {
        return _this2.tv.set_loader(callback ? _this2 : null);
      }, 0);
    }
  }]);
  return DataCube;
}(DCCore);

;// CONCATENATED MODULE: ./src/mixins/interface.js
// Html interface, shown on top of the grid.
// Can be static (a tooltip) or interactive,
// e.g. a control panel.

/* harmony default export */ const mixins_interface = ({
  props: ['ux', 'updater', 'colors', 'wrapper'],
  mounted: function mounted() {
    this._$emit = this.$emit;
    this.$emit = this.custom_event;
    if (this.init) this.init();
  },
  methods: {
    close: function close() {
      this.$emit('custom-event', {
        event: 'close-interface',
        args: [this.$props.ux.uuid]
      });
    },
    // TODO: emit all the way to the uxlist
    // add apply the changes there
    modify: function modify(obj) {
      this.$emit('custom-event', {
        event: 'modify-interface',
        args: [this.$props.ux.uuid, obj]
      });
    },
    custom_event: function custom_event(event) {
      if (event.split(':')[0] === 'hook') return;
      for (var _len = arguments.length, args = new Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
        args[_key - 1] = arguments[_key];
      }
      this._$emit('custom-event', {
        event: event,
        args: args
      });
    }
  },
  computed: {
    overlay: function overlay() {
      return this.$props.ux.overlay;
    },
    layout: function layout() {
      return this.overlay.layout;
    },
    uxr: function uxr() {
      return this.$props.ux;
    }
  },
  data: function data() {
    return {};
  }
});
;// CONCATENATED MODULE: ./src/index.js















var primitives = {
  Candle: CandleExt,
  Volbar: VolbarExt,
  Line: Line,
  Pin: Pin,
  Price: Price,
  Ray: Ray,
  Seg: Seg
};
TradingVue.install = function (Vue) {
  Vue.component(TradingVue.name, TradingVue);
};
if (typeof window !== 'undefined' && window.Vue) {
  window.Vue.use(TradingVue);
  window.TradingVueLib = {
    TradingVue: TradingVue,
    Overlay: overlay,
    Utils: utils,
    Constants: constants,
    Candle: CandleExt,
    Volbar: VolbarExt,
    layout_cnv: layout_cnv,
    layout_vol: layout_vol,
    DataCube: DataCube,
    Tool: tool,
    Interface: mixins_interface,
    primitives: primitives
  };
}
/* harmony default export */ const src = (TradingVue);

})();

/******/ 	return __webpack_exports__;
/******/ })()
;
});
//# sourceMappingURL=trading-vue.js.map