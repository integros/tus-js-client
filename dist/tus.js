(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.tus = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.encode = encode;
/* global: window */

var _window = window,
    btoa = _window.btoa;
function encode(data) {
  return btoa(unescape(encodeURIComponent(data)));
}

var isSupported = exports.isSupported = "btoa" in window;

},{}],2:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

var DetailedError = function (_Error) {
  _inherits(DetailedError, _Error);

  function DetailedError(error) {
    var causingErr = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : null;
    var xhr = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : null;

    _classCallCheck(this, DetailedError);

    var _this = _possibleConstructorReturn(this, (DetailedError.__proto__ || Object.getPrototypeOf(DetailedError)).call(this, error.message));

    _this.originalRequest = xhr;
    _this.causingError = causingErr;

    var message = error.message;
    if (causingErr != null) {
      message += ", caused by " + causingErr.toString();
    }
    if (xhr != null) {
      message += ", originated from request (response code: " + xhr.status + ", response text: " + xhr.responseText + ")";
    }
    _this.message = message;
    return _this;
  }

  return DetailedError;
}(Error);

exports.default = DetailedError;

},{}],3:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = fingerprint;
/**
 * Generate a fingerprint for a file which will be used the store the endpoint
 *
 * @param {File} file
 * @return {String}
 */
function fingerprint(file) {
  return ["tus", file.name, file.type, file.size, file.lastModified].join("-");
}

},{}],4:[function(require,module,exports){
"use strict";

var _upload = require("./upload");

var _upload2 = _interopRequireDefault(_upload);

var _storage = require("./storage");

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/* global window */
var defaultOptions = _upload2.default.defaultOptions;


if (typeof window !== "undefined") {
  // Browser environment using XMLHttpRequest
  var _window = window,
      XMLHttpRequest = _window.XMLHttpRequest,
      Blob = _window.Blob;


  var isSupported = XMLHttpRequest && Blob && typeof Blob.prototype.slice === "function";
} else {
  // Node.js environment using http module
  var isSupported = true;
}

// The usage of the commonjs exporting syntax instead of the new ECMAScript
// one is actually inteded and prevents weird behaviour if we are trying to
// import this module in another module using Babel.
module.exports = {
  Upload: _upload2.default,
  isSupported: isSupported,
  canStoreURLs: _storage.canStoreURLs,
  defaultOptions: defaultOptions
};

},{"./storage":6,"./upload":7}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

exports.getSource = getSource;

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FileSource = function () {
  function FileSource(file) {
    _classCallCheck(this, FileSource);

    this._file = file;
    this.size = file.size;
  }

  _createClass(FileSource, [{
    key: "slice",
    value: function slice(start, end) {
      return this._file.slice(start, end);
    }
  }, {
    key: "close",
    value: function close() {}
  }]);

  return FileSource;
}();

function getSource(input) {
  // Since we emulate the Blob type in our tests (not all target browsers
  // support it), we cannot use `instanceof` for testing whether the input value
  // can be handled. Instead, we simply check is the slice() function and the
  // size property are available.
  if (typeof input.slice === "function" && typeof input.size !== "undefined") {
    return new FileSource(input);
  }

  throw new Error("source object may only be an instance of File or Blob in this environment");
}

},{}],6:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.setItem = setItem;
exports.getItem = getItem;
exports.removeItem = removeItem;
/* global window, localStorage */

var hasStorage = false;
try {
  hasStorage = "localStorage" in window;

  // Attempt to store and read entries from the local storage to detect Private
  // Mode on Safari on iOS (see #49)
  var key = "tusSupport";
  localStorage.setItem(key, localStorage.getItem(key));
} catch (e) {
  // If we try to access localStorage inside a sandboxed iframe, a SecurityError
  // is thrown. When in private mode on iOS Safari, a QuotaExceededError is
  // thrown (see #49)
  if (e.code === e.SECURITY_ERR || e.code === e.QUOTA_EXCEEDED_ERR) {
    hasStorage = false;
  } else {
    throw e;
  }
}

var canStoreURLs = exports.canStoreURLs = hasStorage;

function setItem(key, value) {
  if (!hasStorage) return;
  return localStorage.setItem(key, value);
}

function getItem(key) {
  if (!hasStorage) return;
  return localStorage.getItem(key);
}

function removeItem(key) {
  if (!hasStorage) return;
  return localStorage.removeItem(key);
}

},{}],7:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global window */


var _fingerprint = require("./fingerprint");

var _fingerprint2 = _interopRequireDefault(_fingerprint);

var _error = require("./error");

var _error2 = _interopRequireDefault(_error);

var _extend = require("extend");

var _extend2 = _interopRequireDefault(_extend);

var _source = require("./source");

var _base = require("./base64");

var Base64 = _interopRequireWildcard(_base);

var _storage = require("./storage");

var Storage = _interopRequireWildcard(_storage);

function _interopRequireWildcard(obj) { if (obj && obj.__esModule) { return obj; } else { var newObj = {}; if (obj != null) { for (var key in obj) { if (Object.prototype.hasOwnProperty.call(obj, key)) newObj[key] = obj[key]; } } newObj.default = obj; return newObj; } }

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var defaultOptions = {
  wsendpoint: "",
  fingerprint: _fingerprint2.default,
  resume: true,
  onProgress: null,
  onChunkComplete: null,
  onSuccess: null,
  onError: null,
  headers: {},
  chunkSize: Infinity,
  withCredentials: false,
  uploadUrl: null,
  uploadSize: null
};

var Upload = function () {
  function Upload(file, options) {
    _classCallCheck(this, Upload);

    this.options = (0, _extend2.default)(true, {}, defaultOptions, options);

    // The underlying File/Blob object
    this.file = file;

    // The underlying WebSocket connection which will be use for upload file
    this._ws = null;

    // The Source object which will wrap around the given file and provides us
    // with a unified interface for getting its size and slice chunks from its
    // content allowing us to easily handle Files, Blobs, Buffers and Streams.
    this._source = null;

    // The file's size in bytes
    this._size = null;

    // True if the current PATCH request has been aborted
    this._aborted = false;

    // The URL against which the file will be uploaded
    this.url = null;

    // The fingerpinrt for the current file (set after start())
    this._fingerprint = null;

    // The offset used in the current PATCH request
    this._offset = null;
  }

  _createClass(Upload, [{
    key: "startWSTest",
    value: function startWSTest() {
      this._createUpload();
    }
  }, {
    key: "start",
    value: function start() {

      if (!window.WebSocket) {
        this._emitError(new Error("tus: your browser doesn't supports WebSocket"));
        return;
      }

      if (!this.options.wsendpoint) {
        this._emitError(new Error("tus: no wsendpoint provided"));
        return;
      }

      var file = this.file;

      if (!file) {
        this._emitError(new Error("tus: no file or stream to upload provided"));
        return;
      }

      var source = this._source = (0, _source.getSource)(file, this.options.chunkSize);

      // Firstly, check if the caller has supplied a manual upload size or else
      // we will use the calculated size by the source object.
      if (this.options.uploadSize != null) {
        var size = +this.options.uploadSize;
        if (isNaN(size)) {
          throw new Error("tus: cannot convert `uploadSize` option into a number");
        }

        this._size = size;
      } else {
        var _size = source.size;

        // The size property will be null if we cannot calculate the file's size,
        // for example if you handle a stream.
        if (_size == null) {
          throw new Error("tus: cannot automatically derive upload's size from input and must be specified manually using the `uploadSize` option");
        }

        this._size = _size;
      }

      // Reset the aborted flag when the upload is started or else the
      // _startUpload will stop before sending a request if the upload has been
      // aborted previously.
      this._aborted = false;

      // The upload had been started previously and we should reuse this URL.
      if (this.url != null) {
        this._resumeUpload();
        return;
      }

      // A URL has manually been specified, so we try to resume
      if (this.options.uploadUrl != null) {
        this.url = this.options.uploadUrl;
        this._resumeUpload();
        return;
      }

      // Try to find the endpoint for the file in the storage
      if (this.options.resume) {
        this._fingerprint = this.options.fingerprint(file);
        var resumedUrl = Storage.getItem(this._fingerprint);

        if (resumedUrl != null) {
          this.url = resumedUrl;
          this._resumeUpload();
          return;
        }
      }

      // An upload has not started for the file yet, so we start a new one
      this._createUpload();
    }
  }, {
    key: "_setRequestHeaders",
    value: function _setRequestHeaders() {
      var headers = {
        "Tus-Resumable": "1.0.0"
      };

      var optionsHeaders = this.options.headers;

      for (var name in optionsHeaders) {
        headers[name] = optionsHeaders[name];
      }

      return headers;
    }

    /**
     * Create a new upload using the creation extension by sending a POST
     * request to the endpoint. After successful creation the file will be
     * uploaded
     *
     * @api private
     */

  }, {
    key: "_createUpload",
    value: function _createUpload() {
      var _this = this;

      var ws = this._newWebSocket();

      ws.onopen = function (event) {
        console.log("[Create] WS opened: ", event);

        var headers = _this._setRequestHeaders();
        headers["Upload-Length"] = _this._size;

        var metadata = encodeMetadata(_this.options.metadata);
        if (metadata !== "") {
          headers["Upload-Metadata"] = metadata;
        }

        ws.send(JSON.stringify({
          method: "POST",
          headers: headers,
          body: null
        }));
      };

      ws.onerror = function (event) {
        console.log("[Create] WS error: ", event);
        throw new Error("tus: failed to create upload");
      };

      ws.onclose = function (event) {
        console.log("[Create] WS closed: ", event);
        throw new Error("tus: failed to create upload");
      };

      ws.onmessage = function (message) {
        var response = JSON.parse(message.data);

        // Start upload
        console.log("[Create] WS message: ", message);
        console.log("[Create] WS data: ", response);

        if (!inStatusCategory(response.status, 200)) {
          // Must _emitXhrError
          _this._emitError(new Error("tus: unexpected response while creating upload"));
          return;
        }

        // this.url = resolveUrl(this.options.wsendpoint, response.headers["Location"]);
        _this.url = response.headers["Location"];

        if (_this.options.resume) {
          Storage.setItem(_this._fingerprint, _this.url);
        }

        _this._offset = 0;
        _this._startUpload();
      };
    }
  }, {
    key: "_newWebSocket",
    value: function _newWebSocket() {
      return new WebSocket("ws://" + this.options.wsendpoint + "/ws");
    }
  }, {
    key: "abort",
    value: function abort() {
      if (this._xhr !== null) {
        this._xhr.abort();
        this._source.close();
        this._aborted = true;
      }

      if (this._retryTimeout != null) {
        clearTimeout(this._retryTimeout);
        this._retryTimeout = null;
      }
    }
  }, {
    key: "_emitXhrError",
    value: function _emitXhrError(xhr, err, causingErr) {
      this._emitError(new _error2.default(err, causingErr, xhr));
    }
  }, {
    key: "_emitError",
    value: function _emitError(err) {
      if (typeof this.options.onError === "function") {
        this.options.onError(err);
      } else {
        throw err;
      }
    }
  }, {
    key: "_emitSuccess",
    value: function _emitSuccess() {
      if (typeof this.options.onSuccess === "function") {
        this.options.onSuccess();
      }
    }

    /**
     * Publishes notification when data has been sent to the server. This
     * data may not have been accepted by the server yet.
     * @param  {number} bytesSent  Number of bytes sent to the server.
     * @param  {number} bytesTotal Total number of bytes to be sent to the server.
     */

  }, {
    key: "_emitProgress",
    value: function _emitProgress(bytesSent, bytesTotal) {
      if (typeof this.options.onProgress === "function") {
        this.options.onProgress(bytesSent, bytesTotal);
      }
    }

    /**
     * Publishes notification when a chunk of data has been sent to the server
     * and accepted by the server.
     * @param  {number} chunkSize  Size of the chunk that was accepted by the
     *                             server.
     * @param  {number} bytesAccepted Total number of bytes that have been
     *                                accepted by the server.
     * @param  {number} bytesTotal Total number of bytes to be sent to the server.
     */

  }, {
    key: "_emitChunkComplete",
    value: function _emitChunkComplete(chunkSize, bytesAccepted, bytesTotal) {
      if (typeof this.options.onChunkComplete === "function") {
        this.options.onChunkComplete(chunkSize, bytesAccepted, bytesTotal);
      }
    }

    /*
     * Try to resume an existing upload. First a HEAD request will be sent
     * to retrieve the offset. If the request fails a new upload will be
     * created. In the case of a successful response the file will be uploaded.
     *
     * @api private
     */

  }, {
    key: "_resumeUpload",
    value: function _resumeUpload() {
      var _this2 = this;

      var ws = this._newWebSocket();

      ws.onopen = function (event) {
        console.log("[Resume] WS opened: ", event);

        ws.send({
          method: "HEAD",
          headers: _this2._setRequestHeaders(),
          body: null
        });
      };

      ws.onerror = function (event) {
        console.log("[Resume] WS error: ", event);
        // Must _emitXhrError
        _this2._emitError(new Error("tus: failed to resume upload"));
      };

      ws.onclose = function (event) {
        console.log("[Resume] WS closed: ", event);
        // Must _emitXhrError
        _this2._emitError(new Error("tus: failed to resume upload"));
      };

      ws.onmessage = function (message) {
        var response = JSON.parse(message.data);
        var headers = response.headers;

        // Resume upload
        console.log("[Resume] WS message: ", message);
        console.log("[Resume] WS data: ", response);

        if (!inStatusCategory(response.status, 200)) {
          if (_this2.options.resume && inStatusCategory(response.status, 400)) {
            // Remove stored fingerprint and corresponding endpoint,
            // on client errors since the file can not be found
            Storage.removeItem(_this2._fingerprint);
          }

          // !!!!!!!! ПРОТЕСТИТЬ !!!!!!!!
          // If the upload is locked (indicated by the 423 Locked status code), we
          // emit an error instead of directly starting a new upload. This way the
          // retry logic can catch the error and will retry the upload. An upload
          // is usually locked for a short period of time and will be available
          // afterwards.
          if (response.status === 423) {
            // Must _emitXhrError
            _this2._emitError(new Error("tus: upload is currently locked; retry later"));
            return;
          }

          // Try to create a new upload
          _this2.url = null;
          _this2._createUpload();
          return;
        }

        var offset = parseInt(headers["Upload-Offset"], 10);
        if (isNaN(offset)) {
          // MUST _emitXhrError
          _this2._emitError(new Error("tus: invalid or missing offset value"));
          return;
        }

        var length = parseInt(headers["Upload-Length"], 10);
        if (isNaN(length)) {
          // MUST _emitXhrError
          _this2._emitError(new Error("tus: invalid or missing length value"));
          return;
        }

        // Upload has already been completed and we do not need to send additional
        // data to the server
        if (offset === length) {
          _this2._emitProgress(length, length);
          _this2._emitSuccess();
          return;
        }

        _this2._offset = offset;
        _this2._startUpload();
      };
    }

    /**
     * Start uploading the file using PATCH requests. The file will be divided
     * into chunks as specified in the chunkSize option. During the upload
     * the onProgress event handler may be invoked multiple times.
     *
     * @api private
     */

  }, {
    key: "_startUpload",
    value: function _startUpload() {
      var _this3 = this;

      // If the upload has been aborted, we will not send the next PATCH request.
      // This is important if the abort method was called during a callback, such
      // as onChunkComplete or onProgress.
      if (this._aborted) {
        return;
      }

      var ws = this._newWebSocket();

      ws.onopen = function (event) {
        console.log("[Start] WS opened: ", event);

        // Test support for progress events before attaching an event listener
        // if ("upload" in xhr) {
        //   xhr.upload.onprogress = (e) => {
        //     if (!e.lengthComputable) {
        //       return;
        //     }

        //     this._emitProgress(start + e.loaded, this._size);
        //   };
        // }

        var headers = _this3._setRequestHeaders();
        headers["Upload-Offset"] = _this3._offset;
        headers["Content-Type"] = "application/offset+octet-stream";

        var start = _this3._offset;
        var end = _this3._offset + _this3.options.chunkSize;

        // The specified chunkSize may be Infinity or the calcluated end position
        // may exceed the file's size. In both cases, we limit the end position to
        // the input's total size for simpler calculations and correctness.
        if (end === Infinity || end > _this3._size) {
          end = _this3._size;
        }

        ws.send({
          method: "PATCH",
          headers: headers,
          body: _this3._source.slice(start, end)
        });
      };

      ws.onerror = function (event) {
        console.log("[Start] WS error: ", event);

        if (_this3._aborted) {
          return;
        }

        // Must _emitXhrError
        _this3._emitError(new Error("tus: failed to upload chunk at offset " + _this3._offset));
      };

      ws.onclose = function (event) {
        console.log("[Start] WS close: ", event);

        if (_this3._aborted) {
          return;
        }

        // Must _emitXhrError
        _this3._emitError(new Error("tus: failed to upload chunk at offset " + _this3._offset));
      };

      ws.onmessage = function (message) {
        var response = JSON.parse(message.data);
        var headers = response.headers;

        // Resume upload
        console.log("[Start] WS message: ", message);
        console.log("[Start] WS data: ", response);

        if (!inStatusCategory(response.status, 200)) {
          // Must _emitXhrError
          _this3._emitError(new Error("tus: unexpected response while uploading chunk"));
          return;
        }

        var offset = parseInt(headers["Upload-Offset"], 10);
        if (isNaN(offset)) {
          // Must _emitXhrError
          _this3._emitError(new Error("tus: invalid or missing offset value"));
          return;
        }

        _this3._emitProgress(offset, _this3._size);
        _this3._emitChunkComplete(offset - _this3._offset, offset, _this3._size);

        _this3._offset = offset;

        if (offset == _this3._size) {
          // Yay, finally done :)
          _this3._emitSuccess();
          _this3._source.close();
          return;
        }

        _this3._startUpload();
      };
    }
  }]);

  return Upload;
}();

function encodeMetadata(metadata) {
  if (!Base64.isSupported) {
    return "";
  }

  var encoded = [];

  for (var key in metadata) {
    encoded.push(key + " " + Base64.encode(metadata[key]));
  }

  return encoded.join(",");
}

/**
 * Checks whether a given status is in the range of the expected category.
 * For example, only a status between 200 and 299 will satisfy the category 200.
 *
 * @api private
 */
function inStatusCategory(status, category) {
  return status >= category && status < category + 100;
}

Upload.defaultOptions = defaultOptions;

exports.default = Upload;

},{"./base64":1,"./error":2,"./fingerprint":3,"./source":5,"./storage":6,"extend":8}],8:[function(require,module,exports){
'use strict';

var hasOwn = Object.prototype.hasOwnProperty;
var toStr = Object.prototype.toString;

var isArray = function isArray(arr) {
	if (typeof Array.isArray === 'function') {
		return Array.isArray(arr);
	}

	return toStr.call(arr) === '[object Array]';
};

var isPlainObject = function isPlainObject(obj) {
	if (!obj || toStr.call(obj) !== '[object Object]') {
		return false;
	}

	var hasOwnConstructor = hasOwn.call(obj, 'constructor');
	var hasIsPrototypeOf = obj.constructor && obj.constructor.prototype && hasOwn.call(obj.constructor.prototype, 'isPrototypeOf');
	// Not own constructor property must be Object
	if (obj.constructor && !hasOwnConstructor && !hasIsPrototypeOf) {
		return false;
	}

	// Own properties are enumerated firstly, so to speed up,
	// if last one is own, then all properties are own.
	var key;
	for (key in obj) { /**/ }

	return typeof key === 'undefined' || hasOwn.call(obj, key);
};

module.exports = function extend() {
	var options, name, src, copy, copyIsArray, clone;
	var target = arguments[0];
	var i = 1;
	var length = arguments.length;
	var deep = false;

	// Handle a deep copy situation
	if (typeof target === 'boolean') {
		deep = target;
		target = arguments[1] || {};
		// skip the boolean and the target
		i = 2;
	}
	if (target == null || (typeof target !== 'object' && typeof target !== 'function')) {
		target = {};
	}

	for (; i < length; ++i) {
		options = arguments[i];
		// Only deal with non-null/undefined values
		if (options != null) {
			// Extend the base object
			for (name in options) {
				src = target[name];
				copy = options[name];

				// Prevent never-ending loop
				if (target !== copy) {
					// Recurse if we're merging plain objects or arrays
					if (deep && copy && (isPlainObject(copy) || (copyIsArray = isArray(copy)))) {
						if (copyIsArray) {
							copyIsArray = false;
							clone = src && isArray(src) ? src : [];
						} else {
							clone = src && isPlainObject(src) ? src : {};
						}

						// Never move original objects, clone them
						target[name] = extend(deep, clone, copy);

					// Don't bring in undefined values
					} else if (typeof copy !== 'undefined') {
						target[name] = copy;
					}
				}
			}
		}
	}

	// Return the modified object
	return target;
};

},{}]},{},[4])(4)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvYmFzZTY0LmpzIiwibGliL2Vycm9yLmpzIiwibGliL2ZpbmdlcnByaW50LmpzIiwibGliL2luZGV4LmpzIiwibGliL3NvdXJjZS5qcyIsImxpYi9zdG9yYWdlLmpzIiwibGliL3VwbG9hZC5qcyIsIm5vZGVfbW9kdWxlcy9leHRlbmQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztRQ0lnQixNLEdBQUEsTTtBQUpoQjs7Y0FFZSxNO0lBQVIsSSxXQUFBLEk7QUFFQSxTQUFTLE1BQVQsQ0FBZ0IsSUFBaEIsRUFBc0I7QUFDM0IsU0FBTyxLQUFLLFNBQVMsbUJBQW1CLElBQW5CLENBQVQsQ0FBTCxDQUFQO0FBQ0Q7O0FBRU0sSUFBTSxvQ0FBYyxVQUFVLE1BQTlCOzs7Ozs7Ozs7Ozs7Ozs7SUNSRCxhOzs7QUFDSix5QkFBWSxLQUFaLEVBQWtEO0FBQUEsUUFBL0IsVUFBK0IsdUVBQWxCLElBQWtCO0FBQUEsUUFBWixHQUFZLHVFQUFOLElBQU07O0FBQUE7O0FBQUEsOEhBQzFDLE1BQU0sT0FEb0M7O0FBR2hELFVBQUssZUFBTCxHQUF1QixHQUF2QjtBQUNBLFVBQUssWUFBTCxHQUFvQixVQUFwQjs7QUFFQSxRQUFJLFVBQVUsTUFBTSxPQUFwQjtBQUNBLFFBQUksY0FBYyxJQUFsQixFQUF3QjtBQUN0QixrQ0FBMEIsV0FBVyxRQUFYLEVBQTFCO0FBQ0Q7QUFDRCxRQUFJLE9BQU8sSUFBWCxFQUFpQjtBQUNmLGdFQUF3RCxJQUFJLE1BQTVELHlCQUFzRixJQUFJLFlBQTFGO0FBQ0Q7QUFDRCxVQUFLLE9BQUwsR0FBZSxPQUFmO0FBYmdEO0FBY2pEOzs7RUFmeUIsSzs7a0JBa0JiLGE7Ozs7Ozs7O2tCQ1pTLFc7QUFOeEI7Ozs7OztBQU1lLFNBQVMsV0FBVCxDQUFxQixJQUFyQixFQUEyQjtBQUN4QyxTQUFPLENBQ1AsS0FETyxFQUVQLEtBQUssSUFG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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZ2xvYmFsOiB3aW5kb3cgKi9cblxuY29uc3Qge2J0b2F9ID0gd2luZG93O1xuXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlKGRhdGEpIHtcbiAgcmV0dXJuIGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGRhdGEpKSk7XG59XG5cbmV4cG9ydCBjb25zdCBpc1N1cHBvcnRlZCA9IFwiYnRvYVwiIGluIHdpbmRvdztcbiIsImNsYXNzIERldGFpbGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKGVycm9yLCBjYXVzaW5nRXJyID0gbnVsbCwgeGhyID0gbnVsbCkge1xuICAgIHN1cGVyKGVycm9yLm1lc3NhZ2UpO1xuXG4gICAgdGhpcy5vcmlnaW5hbFJlcXVlc3QgPSB4aHI7XG4gICAgdGhpcy5jYXVzaW5nRXJyb3IgPSBjYXVzaW5nRXJyO1xuXG4gICAgbGV0IG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgIGlmIChjYXVzaW5nRXJyICE9IG51bGwpIHtcbiAgICAgIG1lc3NhZ2UgKz0gYCwgY2F1c2VkIGJ5ICR7Y2F1c2luZ0Vyci50b1N0cmluZygpfWA7XG4gICAgfVxuICAgIGlmICh4aHIgIT0gbnVsbCkge1xuICAgICAgbWVzc2FnZSArPSBgLCBvcmlnaW5hdGVkIGZyb20gcmVxdWVzdCAocmVzcG9uc2UgY29kZTogJHt4aHIuc3RhdHVzfSwgcmVzcG9uc2UgdGV4dDogJHt4aHIucmVzcG9uc2VUZXh0fSlgO1xuICAgIH1cbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERldGFpbGVkRXJyb3I7XG4iLCIvKipcbiAqIEdlbmVyYXRlIGEgZmluZ2VycHJpbnQgZm9yIGEgZmlsZSB3aGljaCB3aWxsIGJlIHVzZWQgdGhlIHN0b3JlIHRoZSBlbmRwb2ludFxuICpcbiAqIEBwYXJhbSB7RmlsZX0gZmlsZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaW5nZXJwcmludChmaWxlKSB7XG4gIHJldHVybiBbXG5cdFx0XCJ0dXNcIixcblx0XHRmaWxlLm5hbWUsXG5cdFx0ZmlsZS50eXBlLFxuXHRcdGZpbGUuc2l6ZSxcblx0XHRmaWxlLmxhc3RNb2RpZmllZFxuICBdLmpvaW4oXCItXCIpO1xufVxuIiwiLyogZ2xvYmFsIHdpbmRvdyAqL1xuaW1wb3J0IFVwbG9hZCBmcm9tIFwiLi91cGxvYWRcIjtcbmltcG9ydCB7Y2FuU3RvcmVVUkxzfSBmcm9tIFwiLi9zdG9yYWdlXCI7XG5cbmNvbnN0IHtkZWZhdWx0T3B0aW9uc30gPSBVcGxvYWQ7XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gIC8vIEJyb3dzZXIgZW52aXJvbm1lbnQgdXNpbmcgWE1MSHR0cFJlcXVlc3RcbiAgY29uc3Qge1hNTEh0dHBSZXF1ZXN0LCBCbG9ifSA9IHdpbmRvdztcblxuICB2YXIgaXNTdXBwb3J0ZWQgPSAoXG4gICAgWE1MSHR0cFJlcXVlc3QgJiZcbiAgICBCbG9iICYmXG4gICAgdHlwZW9mIEJsb2IucHJvdG90eXBlLnNsaWNlID09PSBcImZ1bmN0aW9uXCJcbiAgKTtcbn0gZWxzZSB7XG4gIC8vIE5vZGUuanMgZW52aXJvbm1lbnQgdXNpbmcgaHR0cCBtb2R1bGVcbiAgdmFyIGlzU3VwcG9ydGVkID0gdHJ1ZTtcbn1cblxuLy8gVGhlIHVzYWdlIG9mIHRoZSBjb21tb25qcyBleHBvcnRpbmcgc3ludGF4IGluc3RlYWQgb2YgdGhlIG5ldyBFQ01BU2NyaXB0XG4vLyBvbmUgaXMgYWN0dWFsbHkgaW50ZWRlZCBhbmQgcHJldmVudHMgd2VpcmQgYmVoYXZpb3VyIGlmIHdlIGFyZSB0cnlpbmcgdG9cbi8vIGltcG9ydCB0aGlzIG1vZHVsZSBpbiBhbm90aGVyIG1vZHVsZSB1c2luZyBCYWJlbC5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBVcGxvYWQsXG4gIGlzU3VwcG9ydGVkLFxuICBjYW5TdG9yZVVSTHMsXG4gIGRlZmF1bHRPcHRpb25zXG59O1xuIiwiY2xhc3MgRmlsZVNvdXJjZSB7XG4gIGNvbnN0cnVjdG9yKGZpbGUpIHtcbiAgICB0aGlzLl9maWxlID0gZmlsZTtcbiAgICB0aGlzLnNpemUgPSBmaWxlLnNpemU7XG4gIH1cblxuICBzbGljZShzdGFydCwgZW5kKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbGUuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gIH1cblxuICBjbG9zZSgpIHt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTb3VyY2UoaW5wdXQpIHtcbiAgLy8gU2luY2Ugd2UgZW11bGF0ZSB0aGUgQmxvYiB0eXBlIGluIG91ciB0ZXN0cyAobm90IGFsbCB0YXJnZXQgYnJvd3NlcnNcbiAgLy8gc3VwcG9ydCBpdCksIHdlIGNhbm5vdCB1c2UgYGluc3RhbmNlb2ZgIGZvciB0ZXN0aW5nIHdoZXRoZXIgdGhlIGlucHV0IHZhbHVlXG4gIC8vIGNhbiBiZSBoYW5kbGVkLiBJbnN0ZWFkLCB3ZSBzaW1wbHkgY2hlY2sgaXMgdGhlIHNsaWNlKCkgZnVuY3Rpb24gYW5kIHRoZVxuICAvLyBzaXplIHByb3BlcnR5IGFyZSBhdmFpbGFibGUuXG4gIGlmICh0eXBlb2YgaW5wdXQuc2xpY2UgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgaW5wdXQuc2l6ZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiBuZXcgRmlsZVNvdXJjZShpbnB1dCk7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoXCJzb3VyY2Ugb2JqZWN0IG1heSBvbmx5IGJlIGFuIGluc3RhbmNlIG9mIEZpbGUgb3IgQmxvYiBpbiB0aGlzIGVudmlyb25tZW50XCIpO1xufVxuIiwiLyogZ2xvYmFsIHdpbmRvdywgbG9jYWxTdG9yYWdlICovXG5cbmxldCBoYXNTdG9yYWdlID0gZmFsc2U7XG50cnkge1xuICBoYXNTdG9yYWdlID0gXCJsb2NhbFN0b3JhZ2VcIiBpbiB3aW5kb3c7XG5cbiAgLy8gQXR0ZW1wdCB0byBzdG9yZSBhbmQgcmVhZCBlbnRyaWVzIGZyb20gdGhlIGxvY2FsIHN0b3JhZ2UgdG8gZGV0ZWN0IFByaXZhdGVcbiAgLy8gTW9kZSBvbiBTYWZhcmkgb24gaU9TIChzZWUgIzQ5KVxuICB2YXIga2V5ID0gXCJ0dXNTdXBwb3J0XCI7XG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KSk7XG5cbn0gY2F0Y2ggKGUpIHtcbiAgLy8gSWYgd2UgdHJ5IHRvIGFjY2VzcyBsb2NhbFN0b3JhZ2UgaW5zaWRlIGEgc2FuZGJveGVkIGlmcmFtZSwgYSBTZWN1cml0eUVycm9yXG4gIC8vIGlzIHRocm93bi4gV2hlbiBpbiBwcml2YXRlIG1vZGUgb24gaU9TIFNhZmFyaSwgYSBRdW90YUV4Y2VlZGVkRXJyb3IgaXNcbiAgLy8gdGhyb3duIChzZWUgIzQ5KVxuICBpZiAoZS5jb2RlID09PSBlLlNFQ1VSSVRZX0VSUiB8fCBlLmNvZGUgPT09IGUuUVVPVEFfRVhDRUVERURfRVJSKSB7XG4gICAgaGFzU3RvcmFnZSA9IGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHRocm93IGU7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNhblN0b3JlVVJMcyA9IGhhc1N0b3JhZ2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRJdGVtKGtleSwgdmFsdWUpIHtcbiAgaWYgKCFoYXNTdG9yYWdlKSByZXR1cm47XG4gIHJldHVybiBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEl0ZW0oa2V5KSB7XG4gIGlmICghaGFzU3RvcmFnZSkgcmV0dXJuO1xuICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUl0ZW0oa2V5KSB7XG4gIGlmICghaGFzU3RvcmFnZSkgcmV0dXJuO1xuICByZXR1cm4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcbn1cbiIsIi8qIGdsb2JhbCB3aW5kb3cgKi9cbmltcG9ydCBmaW5nZXJwcmludCBmcm9tIFwiLi9maW5nZXJwcmludFwiO1xuaW1wb3J0IERldGFpbGVkRXJyb3IgZnJvbSBcIi4vZXJyb3JcIjtcbmltcG9ydCBleHRlbmQgZnJvbSBcImV4dGVuZFwiO1xuaW1wb3J0IHtnZXRTb3VyY2V9IGZyb20gXCIuL3NvdXJjZVwiO1xuaW1wb3J0ICogYXMgQmFzZTY0IGZyb20gXCIuL2Jhc2U2NFwiO1xuaW1wb3J0ICogYXMgU3RvcmFnZSBmcm9tIFwiLi9zdG9yYWdlXCI7XG5cbmNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICB3c2VuZHBvaW50OiBcIlwiLFxuICBmaW5nZXJwcmludCxcbiAgcmVzdW1lOiB0cnVlLFxuICBvblByb2dyZXNzOiBudWxsLFxuICBvbkNodW5rQ29tcGxldGU6IG51bGwsXG4gIG9uU3VjY2VzczogbnVsbCxcbiAgb25FcnJvcjogbnVsbCxcbiAgaGVhZGVyczoge30sXG4gIGNodW5rU2l6ZTogSW5maW5pdHksXG4gIHdpdGhDcmVkZW50aWFsczogZmFsc2UsXG4gIHVwbG9hZFVybDogbnVsbCxcbiAgdXBsb2FkU2l6ZTogbnVsbFxufTtcblxuY2xhc3MgVXBsb2FkIHtcblxuICBjb25zdHJ1Y3RvcihmaWxlLCBvcHRpb25zKSB7XG4gICAgdGhpcy5vcHRpb25zID0gZXh0ZW5kKHRydWUsIHt9LCBkZWZhdWx0T3B0aW9ucywgb3B0aW9ucyk7XG5cbiAgICAvLyBUaGUgdW5kZXJseWluZyBGaWxlL0Jsb2Igb2JqZWN0XG4gICAgdGhpcy5maWxlID0gZmlsZTtcblxuICAgIC8vIFRoZSB1bmRlcmx5aW5nIFdlYlNvY2tldCBjb25uZWN0aW9uIHdoaWNoIHdpbGwgYmUgdXNlIGZvciB1cGxvYWQgZmlsZVxuICAgIHRoaXMuX3dzID0gbnVsbDtcblxuICAgIC8vIFRoZSBTb3VyY2Ugb2JqZWN0IHdoaWNoIHdpbGwgd3JhcCBhcm91bmQgdGhlIGdpdmVuIGZpbGUgYW5kIHByb3ZpZGVzIHVzXG4gICAgLy8gd2l0aCBhIHVuaWZpZWQgaW50ZXJmYWNlIGZvciBnZXR0aW5nIGl0cyBzaXplIGFuZCBzbGljZSBjaHVua3MgZnJvbSBpdHNcbiAgICAvLyBjb250ZW50IGFsbG93aW5nIHVzIHRvIGVhc2lseSBoYW5kbGUgRmlsZXMsIEJsb2JzLCBCdWZmZXJzIGFuZCBTdHJlYW1zLlxuICAgIHRoaXMuX3NvdXJjZSA9IG51bGw7XG5cbiAgICAvLyBUaGUgZmlsZSdzIHNpemUgaW4gYnl0ZXNcbiAgICB0aGlzLl9zaXplID0gbnVsbDtcblxuICAgIC8vIFRydWUgaWYgdGhlIGN1cnJlbnQgUEFUQ0ggcmVxdWVzdCBoYXMgYmVlbiBhYm9ydGVkXG4gICAgdGhpcy5fYWJvcnRlZCA9IGZhbHNlO1xuXG4gICAgLy8gVGhlIFVSTCBhZ2FpbnN0IHdoaWNoIHRoZSBmaWxlIHdpbGwgYmUgdXBsb2FkZWRcbiAgICB0aGlzLnVybCA9IG51bGw7XG5cbiAgICAvLyBUaGUgZmluZ2VycGlucnQgZm9yIHRoZSBjdXJyZW50IGZpbGUgKHNldCBhZnRlciBzdGFydCgpKVxuICAgIHRoaXMuX2ZpbmdlcnByaW50ID0gbnVsbDtcblxuICAgIC8vIFRoZSBvZmZzZXQgdXNlZCBpbiB0aGUgY3VycmVudCBQQVRDSCByZXF1ZXN0XG4gICAgdGhpcy5fb2Zmc2V0ID0gbnVsbDtcbiAgfVxuXG4gIHN0YXJ0V1NUZXN0KCkge1xuICAgIHRoaXMuX2NyZWF0ZVVwbG9hZCgpO1xuICB9XG5cbiAgc3RhcnQoKSB7XG5cbiAgICBpZiAoIXdpbmRvdy5XZWJTb2NrZXQpIHtcbiAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IHlvdXIgYnJvd3NlciBkb2Vzbid0IHN1cHBvcnRzIFdlYlNvY2tldFwiKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgaWYgKCF0aGlzLm9wdGlvbnMud3NlbmRwb2ludCkge1xuICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcihcInR1czogbm8gd3NlbmRwb2ludCBwcm92aWRlZFwiKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGZpbGUgPSB0aGlzLmZpbGU7XG5cbiAgICBpZiAoIWZpbGUpIHtcbiAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IG5vIGZpbGUgb3Igc3RyZWFtIHRvIHVwbG9hZCBwcm92aWRlZFwiKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHNvdXJjZSA9IHRoaXMuX3NvdXJjZSA9IGdldFNvdXJjZShmaWxlLCB0aGlzLm9wdGlvbnMuY2h1bmtTaXplKTtcblxuICAgIC8vIEZpcnN0bHksIGNoZWNrIGlmIHRoZSBjYWxsZXIgaGFzIHN1cHBsaWVkIGEgbWFudWFsIHVwbG9hZCBzaXplIG9yIGVsc2VcbiAgICAvLyB3ZSB3aWxsIHVzZSB0aGUgY2FsY3VsYXRlZCBzaXplIGJ5IHRoZSBzb3VyY2Ugb2JqZWN0LlxuICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkU2l6ZSAhPSBudWxsKSB7XG4gICAgICBsZXQgc2l6ZSA9ICt0aGlzLm9wdGlvbnMudXBsb2FkU2l6ZTtcbiAgICAgIGlmIChpc05hTihzaXplKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0dXM6IGNhbm5vdCBjb252ZXJ0IGB1cGxvYWRTaXplYCBvcHRpb24gaW50byBhIG51bWJlclwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc2l6ZSA9IHNpemU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBzaXplID0gc291cmNlLnNpemU7XG5cbiAgICAgIC8vIFRoZSBzaXplIHByb3BlcnR5IHdpbGwgYmUgbnVsbCBpZiB3ZSBjYW5ub3QgY2FsY3VsYXRlIHRoZSBmaWxlJ3Mgc2l6ZSxcbiAgICAgIC8vIGZvciBleGFtcGxlIGlmIHlvdSBoYW5kbGUgYSBzdHJlYW0uXG4gICAgICBpZiAoc2l6ZSA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInR1czogY2Fubm90IGF1dG9tYXRpY2FsbHkgZGVyaXZlIHVwbG9hZCdzIHNpemUgZnJvbSBpbnB1dCBhbmQgbXVzdCBiZSBzcGVjaWZpZWQgbWFudWFsbHkgdXNpbmcgdGhlIGB1cGxvYWRTaXplYCBvcHRpb25cIik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NpemUgPSBzaXplO1xuICAgIH1cblxuICAgIC8vIFJlc2V0IHRoZSBhYm9ydGVkIGZsYWcgd2hlbiB0aGUgdXBsb2FkIGlzIHN0YXJ0ZWQgb3IgZWxzZSB0aGVcbiAgICAvLyBfc3RhcnRVcGxvYWQgd2lsbCBzdG9wIGJlZm9yZSBzZW5kaW5nIGEgcmVxdWVzdCBpZiB0aGUgdXBsb2FkIGhhcyBiZWVuXG4gICAgLy8gYWJvcnRlZCBwcmV2aW91c2x5LlxuICAgIHRoaXMuX2Fib3J0ZWQgPSBmYWxzZTtcblxuICAgIC8vIFRoZSB1cGxvYWQgaGFkIGJlZW4gc3RhcnRlZCBwcmV2aW91c2x5IGFuZCB3ZSBzaG91bGQgcmV1c2UgdGhpcyBVUkwuXG4gICAgaWYgKHRoaXMudXJsICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3Jlc3VtZVVwbG9hZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEEgVVJMIGhhcyBtYW51YWxseSBiZWVuIHNwZWNpZmllZCwgc28gd2UgdHJ5IHRvIHJlc3VtZVxuICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkVXJsICE9IG51bGwpIHtcbiAgICAgIHRoaXMudXJsID0gdGhpcy5vcHRpb25zLnVwbG9hZFVybDtcbiAgICAgIHRoaXMuX3Jlc3VtZVVwbG9hZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRyeSB0byBmaW5kIHRoZSBlbmRwb2ludCBmb3IgdGhlIGZpbGUgaW4gdGhlIHN0b3JhZ2VcbiAgICBpZiAodGhpcy5vcHRpb25zLnJlc3VtZSkge1xuICAgICAgdGhpcy5fZmluZ2VycHJpbnQgPSB0aGlzLm9wdGlvbnMuZmluZ2VycHJpbnQoZmlsZSk7XG4gICAgICBsZXQgcmVzdW1lZFVybCA9IFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLl9maW5nZXJwcmludCk7XG5cbiAgICAgIGlmIChyZXN1bWVkVXJsICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLnVybCA9IHJlc3VtZWRVcmw7XG4gICAgICAgICAgdGhpcy5fcmVzdW1lVXBsb2FkKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFuIHVwbG9hZCBoYXMgbm90IHN0YXJ0ZWQgZm9yIHRoZSBmaWxlIHlldCwgc28gd2Ugc3RhcnQgYSBuZXcgb25lXG4gICAgdGhpcy5fY3JlYXRlVXBsb2FkKCk7XG4gIH1cblxuICBfc2V0UmVxdWVzdEhlYWRlcnMoKSB7XG4gICAgbGV0IGhlYWRlcnMgPSB7XG4gICAgICBcIlR1cy1SZXN1bWFibGVcIjogXCIxLjAuMFwiXG4gICAgfTtcblxuICAgIGxldCBvcHRpb25zSGVhZGVycyA9IHRoaXMub3B0aW9ucy5oZWFkZXJzO1xuXG4gICAgZm9yIChsZXQgbmFtZSBpbiBvcHRpb25zSGVhZGVycykge1xuICAgICAgaGVhZGVyc1tuYW1lXSA9IG9wdGlvbnNIZWFkZXJzW25hbWVdO1xuICAgIH1cblxuICAgIHJldHVybiBoZWFkZXJzO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyB1cGxvYWQgdXNpbmcgdGhlIGNyZWF0aW9uIGV4dGVuc2lvbiBieSBzZW5kaW5nIGEgUE9TVFxuICAgKiByZXF1ZXN0IHRvIHRoZSBlbmRwb2ludC4gQWZ0ZXIgc3VjY2Vzc2Z1bCBjcmVhdGlvbiB0aGUgZmlsZSB3aWxsIGJlXG4gICAqIHVwbG9hZGVkXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgX2NyZWF0ZVVwbG9hZCgpIHtcbiAgICBsZXQgd3MgPSB0aGlzLl9uZXdXZWJTb2NrZXQoKTtcblxuICAgIHdzLm9ub3BlbiA9IChldmVudCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJbQ3JlYXRlXSBXUyBvcGVuZWQ6IFwiLCBldmVudCk7XG5cbiAgICAgIGxldCBoZWFkZXJzID0gdGhpcy5fc2V0UmVxdWVzdEhlYWRlcnMoKTtcbiAgICAgIGhlYWRlcnNbXCJVcGxvYWQtTGVuZ3RoXCJdID0gdGhpcy5fc2l6ZTtcblxuICAgICAgdmFyIG1ldGFkYXRhID0gZW5jb2RlTWV0YWRhdGEodGhpcy5vcHRpb25zLm1ldGFkYXRhKTtcbiAgICAgIGlmIChtZXRhZGF0YSAhPT0gXCJcIikge1xuICAgICAgICBoZWFkZXJzW1wiVXBsb2FkLU1ldGFkYXRhXCJdID0gbWV0YWRhdGE7XG4gICAgICB9XG5cbiAgICAgIHdzLnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICBib2R5OiBudWxsXG4gICAgICB9KSk7XG4gICAgfTtcblxuICAgIHdzLm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiW0NyZWF0ZV0gV1MgZXJyb3I6IFwiLCBldmVudCk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0dXM6IGZhaWxlZCB0byBjcmVhdGUgdXBsb2FkXCIpO1xuICAgIH07XG5cbiAgICB3cy5vbmNsb3NlID0gKGV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIltDcmVhdGVdIFdTIGNsb3NlZDogXCIsIGV2ZW50KTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInR1czogZmFpbGVkIHRvIGNyZWF0ZSB1cGxvYWRcIik7XG4gICAgfTtcblxuICAgIHdzLm9ubWVzc2FnZSA9IChtZXNzYWdlKSA9PiB7XG4gICAgICBsZXQgcmVzcG9uc2UgPSBKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSk7XG5cbiAgICAgIC8vIFN0YXJ0IHVwbG9hZFxuICAgICAgY29uc29sZS5sb2coXCJbQ3JlYXRlXSBXUyBtZXNzYWdlOiBcIiwgbWVzc2FnZSk7XG4gICAgICBjb25zb2xlLmxvZyhcIltDcmVhdGVdIFdTIGRhdGE6IFwiLCByZXNwb25zZSk7XG5cbiAgICAgIGlmICghaW5TdGF0dXNDYXRlZ29yeShyZXNwb25zZS5zdGF0dXMsIDIwMCkpIHtcbiAgICAgICAgLy8gTXVzdCBfZW1pdFhockVycm9yXG4gICAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IHVuZXhwZWN0ZWQgcmVzcG9uc2Ugd2hpbGUgY3JlYXRpbmcgdXBsb2FkXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyB0aGlzLnVybCA9IHJlc29sdmVVcmwodGhpcy5vcHRpb25zLndzZW5kcG9pbnQsIHJlc3BvbnNlLmhlYWRlcnNbXCJMb2NhdGlvblwiXSk7XG4gICAgICB0aGlzLnVybCA9IHJlc3BvbnNlLmhlYWRlcnNbXCJMb2NhdGlvblwiXTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZXN1bWUpIHtcbiAgICAgICAgU3RvcmFnZS5zZXRJdGVtKHRoaXMuX2ZpbmdlcnByaW50LCB0aGlzLnVybCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX29mZnNldCA9IDA7XG4gICAgICB0aGlzLl9zdGFydFVwbG9hZCgpO1xuICAgIH07XG4gIH1cblxuICBfbmV3V2ViU29ja2V0KCl7XG4gICAgcmV0dXJuIG5ldyBXZWJTb2NrZXQoXCJ3czovL1wiK3RoaXMub3B0aW9ucy53c2VuZHBvaW50K1wiL3dzXCIpO1xuICB9XG5cbiAgYWJvcnQoKSB7XG4gICAgaWYgKHRoaXMuX3hociAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5feGhyLmFib3J0KCk7XG4gICAgICB0aGlzLl9zb3VyY2UuY2xvc2UoKTtcbiAgICAgIHRoaXMuX2Fib3J0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9yZXRyeVRpbWVvdXQgIT0gbnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JldHJ5VGltZW91dCk7XG4gICAgICB0aGlzLl9yZXRyeVRpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIF9lbWl0WGhyRXJyb3IoeGhyLCBlcnIsIGNhdXNpbmdFcnIpIHtcbiAgICB0aGlzLl9lbWl0RXJyb3IobmV3IERldGFpbGVkRXJyb3IoZXJyLCBjYXVzaW5nRXJyLCB4aHIpKTtcbiAgfVxuXG4gIF9lbWl0RXJyb3IoZXJyKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25FcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aGlzLm9wdGlvbnMub25FcnJvcihlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgX2VtaXRTdWNjZXNzKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uU3VjY2VzcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aGlzLm9wdGlvbnMub25TdWNjZXNzKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICAqIFB1Ymxpc2hlcyBub3RpZmljYXRpb24gd2hlbiBkYXRhIGhhcyBiZWVuIHNlbnQgdG8gdGhlIHNlcnZlci4gVGhpc1xuICAgKiBkYXRhIG1heSBub3QgaGF2ZSBiZWVuIGFjY2VwdGVkIGJ5IHRoZSBzZXJ2ZXIgeWV0LlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGJ5dGVzU2VudCAgTnVtYmVyIG9mIGJ5dGVzIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAgICogQHBhcmFtICB7bnVtYmVyfSBieXRlc1RvdGFsIFRvdGFsIG51bWJlciBvZiBieXRlcyB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gICAqL1xuICBfZW1pdFByb2dyZXNzKGJ5dGVzU2VudCwgYnl0ZXNUb3RhbCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uUHJvZ3Jlc3MgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhpcy5vcHRpb25zLm9uUHJvZ3Jlc3MoYnl0ZXNTZW50LCBieXRlc1RvdGFsKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHVibGlzaGVzIG5vdGlmaWNhdGlvbiB3aGVuIGEgY2h1bmsgb2YgZGF0YSBoYXMgYmVlbiBzZW50IHRvIHRoZSBzZXJ2ZXJcbiAgICogYW5kIGFjY2VwdGVkIGJ5IHRoZSBzZXJ2ZXIuXG4gICAqIEBwYXJhbSAge251bWJlcn0gY2h1bmtTaXplICBTaXplIG9mIHRoZSBjaHVuayB0aGF0IHdhcyBhY2NlcHRlZCBieSB0aGVcbiAgICogICAgICAgICAgICAgICAgICAgICAgICAgICAgIHNlcnZlci5cbiAgICogQHBhcmFtICB7bnVtYmVyfSBieXRlc0FjY2VwdGVkIFRvdGFsIG51bWJlciBvZiBieXRlcyB0aGF0IGhhdmUgYmVlblxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgYWNjZXB0ZWQgYnkgdGhlIHNlcnZlci5cbiAgICogQHBhcmFtICB7bnVtYmVyfSBieXRlc1RvdGFsIFRvdGFsIG51bWJlciBvZiBieXRlcyB0byBiZSBzZW50IHRvIHRoZSBzZXJ2ZXIuXG4gICAqL1xuICBfZW1pdENodW5rQ29tcGxldGUoY2h1bmtTaXplLCBieXRlc0FjY2VwdGVkLCBieXRlc1RvdGFsKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25DaHVua0NvbXBsZXRlID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5vbkNodW5rQ29tcGxldGUoY2h1bmtTaXplLCBieXRlc0FjY2VwdGVkLCBieXRlc1RvdGFsKTtcbiAgICB9XG4gIH1cblxuICAvKlxuICAgKiBUcnkgdG8gcmVzdW1lIGFuIGV4aXN0aW5nIHVwbG9hZC4gRmlyc3QgYSBIRUFEIHJlcXVlc3Qgd2lsbCBiZSBzZW50XG4gICAqIHRvIHJldHJpZXZlIHRoZSBvZmZzZXQuIElmIHRoZSByZXF1ZXN0IGZhaWxzIGEgbmV3IHVwbG9hZCB3aWxsIGJlXG4gICAqIGNyZWF0ZWQuIEluIHRoZSBjYXNlIG9mIGEgc3VjY2Vzc2Z1bCByZXNwb25zZSB0aGUgZmlsZSB3aWxsIGJlIHVwbG9hZGVkLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIF9yZXN1bWVVcGxvYWQoKSB7XG4gICAgbGV0IHdzID0gdGhpcy5fbmV3V2ViU29ja2V0KCk7XG5cbiAgICB3cy5vbm9wZW4gPSAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiW1Jlc3VtZV0gV1Mgb3BlbmVkOiBcIiwgZXZlbnQpO1xuXG4gICAgICB3cy5zZW5kKHtcbiAgICAgICAgbWV0aG9kOiBcIkhFQURcIixcbiAgICAgICAgaGVhZGVyczogdGhpcy5fc2V0UmVxdWVzdEhlYWRlcnMoKSxcbiAgICAgICAgYm9keTogbnVsbFxuICAgICAgfSk7XG4gICAgfTtcblxuICAgIHdzLm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiW1Jlc3VtZV0gV1MgZXJyb3I6IFwiLCBldmVudCk7XG4gICAgICAvLyBNdXN0IF9lbWl0WGhyRXJyb3JcbiAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IGZhaWxlZCB0byByZXN1bWUgdXBsb2FkXCIpKTtcbiAgICB9O1xuXG4gICAgd3Mub25jbG9zZSA9IChldmVudCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJbUmVzdW1lXSBXUyBjbG9zZWQ6IFwiLCBldmVudCk7XG4gICAgICAvLyBNdXN0IF9lbWl0WGhyRXJyb3JcbiAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IGZhaWxlZCB0byByZXN1bWUgdXBsb2FkXCIpKTtcbiAgICB9O1xuXG4gICAgd3Mub25tZXNzYWdlID0gKG1lc3NhZ2UpID0+IHtcbiAgICAgIGxldCByZXNwb25zZSA9IEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKTtcbiAgICAgIGxldCBoZWFkZXJzID0gcmVzcG9uc2UuaGVhZGVycztcbiAgICAgIFxuICAgICAgLy8gUmVzdW1lIHVwbG9hZFxuICAgICAgY29uc29sZS5sb2coXCJbUmVzdW1lXSBXUyBtZXNzYWdlOiBcIiwgbWVzc2FnZSk7XG4gICAgICBjb25zb2xlLmxvZyhcIltSZXN1bWVdIFdTIGRhdGE6IFwiLCByZXNwb25zZSk7XG5cbiAgICAgIGlmICghaW5TdGF0dXNDYXRlZ29yeShyZXNwb25zZS5zdGF0dXMsIDIwMCkpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZXN1bWUgJiYgaW5TdGF0dXNDYXRlZ29yeShyZXNwb25zZS5zdGF0dXMsIDQwMCkpIHtcbiAgICAgICAgICAvLyBSZW1vdmUgc3RvcmVkIGZpbmdlcnByaW50IGFuZCBjb3JyZXNwb25kaW5nIGVuZHBvaW50LFxuICAgICAgICAgIC8vIG9uIGNsaWVudCBlcnJvcnMgc2luY2UgdGhlIGZpbGUgY2FuIG5vdCBiZSBmb3VuZFxuICAgICAgICAgIFN0b3JhZ2UucmVtb3ZlSXRlbSh0aGlzLl9maW5nZXJwcmludCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyAhISEhISEhISDQn9Cg0J7QotCV0KHQotCY0KLQrCAhISEhISEhIVxuICAgICAgICAvLyBJZiB0aGUgdXBsb2FkIGlzIGxvY2tlZCAoaW5kaWNhdGVkIGJ5IHRoZSA0MjMgTG9ja2VkIHN0YXR1cyBjb2RlKSwgd2VcbiAgICAgICAgLy8gZW1pdCBhbiBlcnJvciBpbnN0ZWFkIG9mIGRpcmVjdGx5IHN0YXJ0aW5nIGEgbmV3IHVwbG9hZC4gVGhpcyB3YXkgdGhlXG4gICAgICAgIC8vIHJldHJ5IGxvZ2ljIGNhbiBjYXRjaCB0aGUgZXJyb3IgYW5kIHdpbGwgcmV0cnkgdGhlIHVwbG9hZC4gQW4gdXBsb2FkXG4gICAgICAgIC8vIGlzIHVzdWFsbHkgbG9ja2VkIGZvciBhIHNob3J0IHBlcmlvZCBvZiB0aW1lIGFuZCB3aWxsIGJlIGF2YWlsYWJsZVxuICAgICAgICAvLyBhZnRlcndhcmRzLlxuICAgICAgICBpZiAocmVzcG9uc2Uuc3RhdHVzID09PSA0MjMpIHtcbiAgICAgICAgICAvLyBNdXN0IF9lbWl0WGhyRXJyb3JcbiAgICAgICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiB1cGxvYWQgaXMgY3VycmVudGx5IGxvY2tlZDsgcmV0cnkgbGF0ZXJcIikpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIFRyeSB0byBjcmVhdGUgYSBuZXcgdXBsb2FkXG4gICAgICAgIHRoaXMudXJsID0gbnVsbDtcbiAgICAgICAgdGhpcy5fY3JlYXRlVXBsb2FkKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbGV0IG9mZnNldCA9IHBhcnNlSW50KGhlYWRlcnNbXCJVcGxvYWQtT2Zmc2V0XCJdLCAxMCk7XG4gICAgICBpZiAoaXNOYU4ob2Zmc2V0KSkge1xuICAgICAgICAvLyBNVVNUIF9lbWl0WGhyRXJyb3JcbiAgICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcihcInR1czogaW52YWxpZCBvciBtaXNzaW5nIG9mZnNldCB2YWx1ZVwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbGV0IGxlbmd0aCA9IHBhcnNlSW50KGhlYWRlcnNbXCJVcGxvYWQtTGVuZ3RoXCJdLCAxMCk7XG4gICAgICBpZiAoaXNOYU4obGVuZ3RoKSkge1xuICAgICAgICAvLyBNVVNUIF9lbWl0WGhyRXJyb3JcbiAgICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcihcInR1czogaW52YWxpZCBvciBtaXNzaW5nIGxlbmd0aCB2YWx1ZVwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gVXBsb2FkIGhhcyBhbHJlYWR5IGJlZW4gY29tcGxldGVkIGFuZCB3ZSBkbyBub3QgbmVlZCB0byBzZW5kIGFkZGl0aW9uYWxcbiAgICAgIC8vIGRhdGEgdG8gdGhlIHNlcnZlclxuICAgICAgaWYgKG9mZnNldCA9PT0gbGVuZ3RoKSB7XG4gICAgICAgIHRoaXMuX2VtaXRQcm9ncmVzcyhsZW5ndGgsIGxlbmd0aCk7XG4gICAgICAgIHRoaXMuX2VtaXRTdWNjZXNzKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fb2Zmc2V0ID0gb2Zmc2V0O1xuICAgICAgdGhpcy5fc3RhcnRVcGxvYWQoKTtcbiAgICB9O1xuICB9XG5cbiAgLyoqXG4gICAqIFN0YXJ0IHVwbG9hZGluZyB0aGUgZmlsZSB1c2luZyBQQVRDSCByZXF1ZXN0cy4gVGhlIGZpbGUgd2lsbCBiZSBkaXZpZGVkXG4gICAqIGludG8gY2h1bmtzIGFzIHNwZWNpZmllZCBpbiB0aGUgY2h1bmtTaXplIG9wdGlvbi4gRHVyaW5nIHRoZSB1cGxvYWRcbiAgICogdGhlIG9uUHJvZ3Jlc3MgZXZlbnQgaGFuZGxlciBtYXkgYmUgaW52b2tlZCBtdWx0aXBsZSB0aW1lcy5cbiAgICpcbiAgICogQGFwaSBwcml2YXRlXG4gICAqL1xuICBfc3RhcnRVcGxvYWQoKSB7XG4gICAgLy8gSWYgdGhlIHVwbG9hZCBoYXMgYmVlbiBhYm9ydGVkLCB3ZSB3aWxsIG5vdCBzZW5kIHRoZSBuZXh0IFBBVENIIHJlcXVlc3QuXG4gICAgLy8gVGhpcyBpcyBpbXBvcnRhbnQgaWYgdGhlIGFib3J0IG1ldGhvZCB3YXMgY2FsbGVkIGR1cmluZyBhIGNhbGxiYWNrLCBzdWNoXG4gICAgLy8gYXMgb25DaHVua0NvbXBsZXRlIG9yIG9uUHJvZ3Jlc3MuXG4gICAgaWYgKHRoaXMuX2Fib3J0ZWQpIHtcbiAgICAgIHJldHVybjtcbiAgICB9XG5cbiAgICBsZXQgd3MgPSB0aGlzLl9uZXdXZWJTb2NrZXQoKTtcblxuICAgIHdzLm9ub3BlbiA9IChldmVudCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJbU3RhcnRdIFdTIG9wZW5lZDogXCIsIGV2ZW50KTtcblxuICAgICAgLy8gVGVzdCBzdXBwb3J0IGZvciBwcm9ncmVzcyBldmVudHMgYmVmb3JlIGF0dGFjaGluZyBhbiBldmVudCBsaXN0ZW5lclxuICAgICAgLy8gaWYgKFwidXBsb2FkXCIgaW4geGhyKSB7XG4gICAgICAvLyAgIHhoci51cGxvYWQub25wcm9ncmVzcyA9IChlKSA9PiB7XG4gICAgICAvLyAgICAgaWYgKCFlLmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgIC8vICAgICAgIHJldHVybjtcbiAgICAgIC8vICAgICB9XG5cbiAgICAgIC8vICAgICB0aGlzLl9lbWl0UHJvZ3Jlc3Moc3RhcnQgKyBlLmxvYWRlZCwgdGhpcy5fc2l6ZSk7XG4gICAgICAvLyAgIH07XG4gICAgICAvLyB9XG5cbiAgICAgIGxldCBoZWFkZXJzID0gdGhpcy5fc2V0UmVxdWVzdEhlYWRlcnMoKTtcbiAgICAgIGhlYWRlcnNbXCJVcGxvYWQtT2Zmc2V0XCJdID0gdGhpcy5fb2Zmc2V0O1xuICAgICAgaGVhZGVyc1tcIkNvbnRlbnQtVHlwZVwiXSA9IFwiYXBwbGljYXRpb24vb2Zmc2V0K29jdGV0LXN0cmVhbVwiO1xuICBcbiAgICAgIGxldCBzdGFydCA9IHRoaXMuX29mZnNldDtcbiAgICAgIGxldCBlbmQgPSB0aGlzLl9vZmZzZXQgKyB0aGlzLm9wdGlvbnMuY2h1bmtTaXplO1xuICBcbiAgICAgIC8vIFRoZSBzcGVjaWZpZWQgY2h1bmtTaXplIG1heSBiZSBJbmZpbml0eSBvciB0aGUgY2FsY2x1YXRlZCBlbmQgcG9zaXRpb25cbiAgICAgIC8vIG1heSBleGNlZWQgdGhlIGZpbGUncyBzaXplLiBJbiBib3RoIGNhc2VzLCB3ZSBsaW1pdCB0aGUgZW5kIHBvc2l0aW9uIHRvXG4gICAgICAvLyB0aGUgaW5wdXQncyB0b3RhbCBzaXplIGZvciBzaW1wbGVyIGNhbGN1bGF0aW9ucyBhbmQgY29ycmVjdG5lc3MuXG4gICAgICBpZiAoZW5kID09PSBJbmZpbml0eSB8fCBlbmQgPiB0aGlzLl9zaXplKSB7XG4gICAgICAgIGVuZCA9IHRoaXMuX3NpemU7XG4gICAgICB9XG5cbiAgICAgIHdzLnNlbmQoe1xuICAgICAgICBtZXRob2Q6IFwiUEFUQ0hcIixcbiAgICAgICAgaGVhZGVyczogaGVhZGVycyxcbiAgICAgICAgYm9keTogdGhpcy5fc291cmNlLnNsaWNlKHN0YXJ0LCBlbmQpXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgd3Mub25lcnJvciA9IChldmVudCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJbU3RhcnRdIFdTIGVycm9yOiBcIiwgZXZlbnQpO1xuXG4gICAgICBpZiAodGhpcy5fYWJvcnRlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIE11c3QgX2VtaXRYaHJFcnJvclxuICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcihcInR1czogZmFpbGVkIHRvIHVwbG9hZCBjaHVuayBhdCBvZmZzZXQgXCIgKyB0aGlzLl9vZmZzZXQpKTtcbiAgICB9O1xuXG4gICAgd3Mub25jbG9zZSA9IChldmVudCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJbU3RhcnRdIFdTIGNsb3NlOiBcIiwgZXZlbnQpO1xuICAgICAgXG4gICAgICBpZiAodGhpcy5fYWJvcnRlZCkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIE11c3QgX2VtaXRYaHJFcnJvclxuICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcihcInR1czogZmFpbGVkIHRvIHVwbG9hZCBjaHVuayBhdCBvZmZzZXQgXCIgKyB0aGlzLl9vZmZzZXQpKTtcbiAgICB9O1xuXG4gICAgd3Mub25tZXNzYWdlID0gKG1lc3NhZ2UpID0+IHtcbiAgICAgIGxldCByZXNwb25zZSA9IEpTT04ucGFyc2UobWVzc2FnZS5kYXRhKTtcbiAgICAgIGxldCBoZWFkZXJzID0gcmVzcG9uc2UuaGVhZGVycztcbiAgICAgIFxuICAgICAgLy8gUmVzdW1lIHVwbG9hZFxuICAgICAgY29uc29sZS5sb2coXCJbU3RhcnRdIFdTIG1lc3NhZ2U6IFwiLCBtZXNzYWdlKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiW1N0YXJ0XSBXUyBkYXRhOiBcIiwgcmVzcG9uc2UpO1xuXG4gICAgICBpZiAoIWluU3RhdHVzQ2F0ZWdvcnkocmVzcG9uc2Uuc3RhdHVzLCAyMDApKSB7XG4gICAgICAgIC8vIE11c3QgX2VtaXRYaHJFcnJvclxuICAgICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiB1bmV4cGVjdGVkIHJlc3BvbnNlIHdoaWxlIHVwbG9hZGluZyBjaHVua1wiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgbGV0IG9mZnNldCA9IHBhcnNlSW50KGhlYWRlcnNbXCJVcGxvYWQtT2Zmc2V0XCJdLCAxMCk7XG4gICAgICBpZiAoaXNOYU4ob2Zmc2V0KSkge1xuICAgICAgICAvLyBNdXN0IF9lbWl0WGhyRXJyb3JcbiAgICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcihcInR1czogaW52YWxpZCBvciBtaXNzaW5nIG9mZnNldCB2YWx1ZVwiKSk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fZW1pdFByb2dyZXNzKG9mZnNldCwgdGhpcy5fc2l6ZSk7XG4gICAgICB0aGlzLl9lbWl0Q2h1bmtDb21wbGV0ZShvZmZzZXQgLSB0aGlzLl9vZmZzZXQsIG9mZnNldCwgdGhpcy5fc2l6ZSk7XG5cbiAgICAgIHRoaXMuX29mZnNldCA9IG9mZnNldDtcblxuICAgICAgaWYgKG9mZnNldCA9PSB0aGlzLl9zaXplKSB7XG4gICAgICAgIC8vIFlheSwgZmluYWxseSBkb25lIDopXG4gICAgICAgIHRoaXMuX2VtaXRTdWNjZXNzKCk7XG4gICAgICAgIHRoaXMuX3NvdXJjZS5jbG9zZSgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3N0YXJ0VXBsb2FkKCk7XG4gICAgfTtcbiAgfVxufVxuXG5mdW5jdGlvbiBlbmNvZGVNZXRhZGF0YShtZXRhZGF0YSkge1xuICAgIGlmICghQmFzZTY0LmlzU3VwcG9ydGVkKSB7XG4gICAgICAgIHJldHVybiBcIlwiO1xuICAgIH1cblxuICAgIHZhciBlbmNvZGVkID0gW107XG5cbiAgICBmb3IgKHZhciBrZXkgaW4gbWV0YWRhdGEpIHtcbiAgICAgICAgZW5jb2RlZC5wdXNoKGtleSArIFwiIFwiICsgQmFzZTY0LmVuY29kZShtZXRhZGF0YVtrZXldKSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGVuY29kZWQuam9pbihcIixcIik7XG59XG5cbi8qKlxuICogQ2hlY2tzIHdoZXRoZXIgYSBnaXZlbiBzdGF0dXMgaXMgaW4gdGhlIHJhbmdlIG9mIHRoZSBleHBlY3RlZCBjYXRlZ29yeS5cbiAqIEZvciBleGFtcGxlLCBvbmx5IGEgc3RhdHVzIGJldHdlZW4gMjAwIGFuZCAyOTkgd2lsbCBzYXRpc2Z5IHRoZSBjYXRlZ29yeSAyMDAuXG4gKlxuICogQGFwaSBwcml2YXRlXG4gKi9cbmZ1bmN0aW9uIGluU3RhdHVzQ2F0ZWdvcnkoc3RhdHVzLCBjYXRlZ29yeSkge1xuICByZXR1cm4gKHN0YXR1cyA+PSBjYXRlZ29yeSAmJiBzdGF0dXMgPCAoY2F0ZWdvcnkgKyAxMDApKTtcbn1cblxuVXBsb2FkLmRlZmF1bHRPcHRpb25zID0gZGVmYXVsdE9wdGlvbnM7XG5cbmV4cG9ydCBkZWZhdWx0IFVwbG9hZDtcbiIsIid1c2Ugc3RyaWN0JztcblxudmFyIGhhc093biA9IE9iamVjdC5wcm90b3R5cGUuaGFzT3duUHJvcGVydHk7XG52YXIgdG9TdHIgPSBPYmplY3QucHJvdG90eXBlLnRvU3RyaW5nO1xuXG52YXIgaXNBcnJheSA9IGZ1bmN0aW9uIGlzQXJyYXkoYXJyKSB7XG5cdGlmICh0eXBlb2YgQXJyYXkuaXNBcnJheSA9PT0gJ2Z1bmN0aW9uJykge1xuXHRcdHJldHVybiBBcnJheS5pc0FycmF5KGFycik7XG5cdH1cblxuXHRyZXR1cm4gdG9TdHIuY2FsbChhcnIpID09PSAnW29iamVjdCBBcnJheV0nO1xufTtcblxudmFyIGlzUGxhaW5PYmplY3QgPSBmdW5jdGlvbiBpc1BsYWluT2JqZWN0KG9iaikge1xuXHRpZiAoIW9iaiB8fCB0b1N0ci5jYWxsKG9iaikgIT09ICdbb2JqZWN0IE9iamVjdF0nKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0dmFyIGhhc093bkNvbnN0cnVjdG9yID0gaGFzT3duLmNhbGwob2JqLCAnY29uc3RydWN0b3InKTtcblx0dmFyIGhhc0lzUHJvdG90eXBlT2YgPSBvYmouY29uc3RydWN0b3IgJiYgb2JqLmNvbnN0cnVjdG9yLnByb3RvdHlwZSAmJiBoYXNPd24uY2FsbChvYmouY29uc3RydWN0b3IucHJvdG90eXBlLCAnaXNQcm90b3R5cGVPZicpO1xuXHQvLyBOb3Qgb3duIGNvbnN0cnVjdG9yIHByb3BlcnR5IG11c3QgYmUgT2JqZWN0XG5cdGlmIChvYmouY29uc3RydWN0b3IgJiYgIWhhc093bkNvbnN0cnVjdG9yICYmICFoYXNJc1Byb3RvdHlwZU9mKSB7XG5cdFx0cmV0dXJuIGZhbHNlO1xuXHR9XG5cblx0Ly8gT3duIHByb3BlcnRpZXMgYXJlIGVudW1lcmF0ZWQgZmlyc3RseSwgc28gdG8gc3BlZWQgdXAsXG5cdC8vIGlmIGxhc3Qgb25lIGlzIG93biwgdGhlbiBhbGwgcHJvcGVydGllcyBhcmUgb3duLlxuXHR2YXIga2V5O1xuXHRmb3IgKGtleSBpbiBvYmopIHsgLyoqLyB9XG5cblx0cmV0dXJuIHR5cGVvZiBrZXkgPT09ICd1bmRlZmluZWQnIHx8IGhhc093bi5jYWxsKG9iaiwga2V5KTtcbn07XG5cbm1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24gZXh0ZW5kKCkge1xuXHR2YXIgb3B0aW9ucywgbmFtZSwgc3JjLCBjb3B5LCBjb3B5SXNBcnJheSwgY2xvbmU7XG5cdHZhciB0YXJnZXQgPSBhcmd1bWVudHNbMF07XG5cdHZhciBpID0gMTtcblx0dmFyIGxlbmd0aCA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cdHZhciBkZWVwID0gZmFsc2U7XG5cblx0Ly8gSGFuZGxlIGEgZGVlcCBjb3B5IHNpdHVhdGlvblxuXHRpZiAodHlwZW9mIHRhcmdldCA9PT0gJ2Jvb2xlYW4nKSB7XG5cdFx0ZGVlcCA9IHRhcmdldDtcblx0XHR0YXJnZXQgPSBhcmd1bWVudHNbMV0gfHwge307XG5cdFx0Ly8gc2tpcCB0aGUgYm9vbGVhbiBhbmQgdGhlIHRhcmdldFxuXHRcdGkgPSAyO1xuXHR9XG5cdGlmICh0YXJnZXQgPT0gbnVsbCB8fCAodHlwZW9mIHRhcmdldCAhPT0gJ29iamVjdCcgJiYgdHlwZW9mIHRhcmdldCAhPT0gJ2Z1bmN0aW9uJykpIHtcblx0XHR0YXJnZXQgPSB7fTtcblx0fVxuXG5cdGZvciAoOyBpIDwgbGVuZ3RoOyArK2kpIHtcblx0XHRvcHRpb25zID0gYXJndW1lbnRzW2ldO1xuXHRcdC8vIE9ubHkgZGVhbCB3aXRoIG5vbi1udWxsL3VuZGVmaW5lZCB2YWx1ZXNcblx0XHRpZiAob3B0aW9ucyAhPSBudWxsKSB7XG5cdFx0XHQvLyBFeHRlbmQgdGhlIGJhc2Ugb2JqZWN0XG5cdFx0XHRmb3IgKG5hbWUgaW4gb3B0aW9ucykge1xuXHRcdFx0XHRzcmMgPSB0YXJnZXRbbmFtZV07XG5cdFx0XHRcdGNvcHkgPSBvcHRpb25zW25hbWVdO1xuXG5cdFx0XHRcdC8vIFByZXZlbnQgbmV2ZXItZW5kaW5nIGxvb3Bcblx0XHRcdFx0aWYgKHRhcmdldCAhPT0gY29weSkge1xuXHRcdFx0XHRcdC8vIFJlY3Vyc2UgaWYgd2UncmUgbWVyZ2luZyBwbGFpbiBvYmplY3RzIG9yIGFycmF5c1xuXHRcdFx0XHRcdGlmIChkZWVwICYmIGNvcHkgJiYgKGlzUGxhaW5PYmplY3QoY29weSkgfHwgKGNvcHlJc0FycmF5ID0gaXNBcnJheShjb3B5KSkpKSB7XG5cdFx0XHRcdFx0XHRpZiAoY29weUlzQXJyYXkpIHtcblx0XHRcdFx0XHRcdFx0Y29weUlzQXJyYXkgPSBmYWxzZTtcblx0XHRcdFx0XHRcdFx0Y2xvbmUgPSBzcmMgJiYgaXNBcnJheShzcmMpID8gc3JjIDogW107XG5cdFx0XHRcdFx0XHR9IGVsc2Uge1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc1BsYWluT2JqZWN0KHNyYykgPyBzcmMgOiB7fTtcblx0XHRcdFx0XHRcdH1cblxuXHRcdFx0XHRcdFx0Ly8gTmV2ZXIgbW92ZSBvcmlnaW5hbCBvYmplY3RzLCBjbG9uZSB0aGVtXG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBleHRlbmQoZGVlcCwgY2xvbmUsIGNvcHkpO1xuXG5cdFx0XHRcdFx0Ly8gRG9uJ3QgYnJpbmcgaW4gdW5kZWZpbmVkIHZhbHVlc1xuXHRcdFx0XHRcdH0gZWxzZSBpZiAodHlwZW9mIGNvcHkgIT09ICd1bmRlZmluZWQnKSB7XG5cdFx0XHRcdFx0XHR0YXJnZXRbbmFtZV0gPSBjb3B5O1xuXHRcdFx0XHRcdH1cblx0XHRcdFx0fVxuXHRcdFx0fVxuXHRcdH1cblx0fVxuXG5cdC8vIFJldHVybiB0aGUgbW9kaWZpZWQgb2JqZWN0XG5cdHJldHVybiB0YXJnZXQ7XG59O1xuIl19
