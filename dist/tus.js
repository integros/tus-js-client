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
  endpoint: "",
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

      if (!this.options.endpoint) {
        this._emitError(new Error("tus: no endpoint provided"));
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

        // this.url = resolveUrl(this.options.endpoint, response.headers["Location"]);
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
      return new WebSocket("ws://" + this.options.endpoint + "/ws");
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
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvYmFzZTY0LmpzIiwibGliL2Vycm9yLmpzIiwibGliL2ZpbmdlcnByaW50LmpzIiwibGliL2luZGV4LmpzIiwibGliL3NvdXJjZS5qcyIsImxpYi9zdG9yYWdlLmpzIiwibGliL3VwbG9hZC5qcyIsIm5vZGVfbW9kdWxlcy9leHRlbmQvaW5kZXguanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7Ozs7OztRQ0lnQixNLEdBQUEsTTtBQUpoQjs7Y0FFZSxNO0lBQVIsSSxXQUFBLEk7QUFFQSxTQUFTLE1BQVQsQ0FBZ0IsSUFBaEIsRUFBc0I7QUFDM0IsU0FBTyxLQUFLLFNBQVMsbUJBQW1CLElBQW5CLENBQVQsQ0FBTCxDQUFQO0FBQ0Q7O0FBRU0sSUFBTSxvQ0FBYyxVQUFVLE1BQTlCOzs7Ozs7Ozs7Ozs7Ozs7SUNSRCxhOzs7QUFDSix5QkFBWSxLQUFaLEVBQWtEO0FBQUEsUUFBL0IsVUFBK0IsdUVBQWxCLElBQWtCO0FBQUEsUUFBWixHQUFZLHVFQUFOLElBQU07O0FBQUE7O0FBQUEsOEhBQzFDLE1BQU0sT0FEb0M7O0FBR2hELFVBQUssZUFBTCxHQUF1QixHQUF2QjtBQUNBLFVBQUssWUFBTCxHQUFvQixVQUFwQjs7QUFFQSxRQUFJLFVBQVUsTUFBTSxPQUFwQjtBQUNBLFFBQUksY0FBYyxJQUFsQixFQUF3QjtBQUN0QixrQ0FBMEIsV0FBVyxRQUFYLEVBQTFCO0FBQ0Q7QUFDRCxRQUFJLE9BQU8sSUFBWCxFQUFpQjtBQUNmLGdFQUF3RCxJQUFJLE1BQTVELHlCQUFzRixJQUFJLFlBQTFGO0FBQ0Q7QUFDRCxVQUFLLE9BQUwsR0FBZSxPQUFmO0FBYmdEO0FBY2pEOzs7RUFmeUIsSzs7a0JBa0JiLGE7Ozs7Ozs7O2tCQ1pTLFc7QUFOeEI7Ozs7OztBQU1lLFNBQVMsV0FBVCxDQUFxQixJQUFyQixFQUEyQjtBQUN4QyxTQUFPLENBQ1AsS0FETyxFQUVQLEtBQUssSUFG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QTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0EiLCJmaWxlIjoiZ2VuZXJhdGVkLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXNDb250ZW50IjpbIihmdW5jdGlvbiBlKHQsbixyKXtmdW5jdGlvbiBzKG8sdSl7aWYoIW5bb10pe2lmKCF0W29dKXt2YXIgYT10eXBlb2YgcmVxdWlyZT09XCJmdW5jdGlvblwiJiZyZXF1aXJlO2lmKCF1JiZhKXJldHVybiBhKG8sITApO2lmKGkpcmV0dXJuIGkobywhMCk7dmFyIGY9bmV3IEVycm9yKFwiQ2Fubm90IGZpbmQgbW9kdWxlICdcIitvK1wiJ1wiKTt0aHJvdyBmLmNvZGU9XCJNT0RVTEVfTk9UX0ZPVU5EXCIsZn12YXIgbD1uW29dPXtleHBvcnRzOnt9fTt0W29dWzBdLmNhbGwobC5leHBvcnRzLGZ1bmN0aW9uKGUpe3ZhciBuPXRbb11bMV1bZV07cmV0dXJuIHMobj9uOmUpfSxsLGwuZXhwb3J0cyxlLHQsbixyKX1yZXR1cm4gbltvXS5leHBvcnRzfXZhciBpPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7Zm9yKHZhciBvPTA7bzxyLmxlbmd0aDtvKyspcyhyW29dKTtyZXR1cm4gc30pIiwiLyogZ2xvYmFsOiB3aW5kb3cgKi9cblxuY29uc3Qge2J0b2F9ID0gd2luZG93O1xuXG5leHBvcnQgZnVuY3Rpb24gZW5jb2RlKGRhdGEpIHtcbiAgcmV0dXJuIGJ0b2EodW5lc2NhcGUoZW5jb2RlVVJJQ29tcG9uZW50KGRhdGEpKSk7XG59XG5cbmV4cG9ydCBjb25zdCBpc1N1cHBvcnRlZCA9IFwiYnRvYVwiIGluIHdpbmRvdztcbiIsImNsYXNzIERldGFpbGVkRXJyb3IgZXh0ZW5kcyBFcnJvciB7XG4gIGNvbnN0cnVjdG9yKGVycm9yLCBjYXVzaW5nRXJyID0gbnVsbCwgeGhyID0gbnVsbCkge1xuICAgIHN1cGVyKGVycm9yLm1lc3NhZ2UpO1xuXG4gICAgdGhpcy5vcmlnaW5hbFJlcXVlc3QgPSB4aHI7XG4gICAgdGhpcy5jYXVzaW5nRXJyb3IgPSBjYXVzaW5nRXJyO1xuXG4gICAgbGV0IG1lc3NhZ2UgPSBlcnJvci5tZXNzYWdlO1xuICAgIGlmIChjYXVzaW5nRXJyICE9IG51bGwpIHtcbiAgICAgIG1lc3NhZ2UgKz0gYCwgY2F1c2VkIGJ5ICR7Y2F1c2luZ0Vyci50b1N0cmluZygpfWA7XG4gICAgfVxuICAgIGlmICh4aHIgIT0gbnVsbCkge1xuICAgICAgbWVzc2FnZSArPSBgLCBvcmlnaW5hdGVkIGZyb20gcmVxdWVzdCAocmVzcG9uc2UgY29kZTogJHt4aHIuc3RhdHVzfSwgcmVzcG9uc2UgdGV4dDogJHt4aHIucmVzcG9uc2VUZXh0fSlgO1xuICAgIH1cbiAgICB0aGlzLm1lc3NhZ2UgPSBtZXNzYWdlO1xuICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERldGFpbGVkRXJyb3I7XG4iLCIvKipcbiAqIEdlbmVyYXRlIGEgZmluZ2VycHJpbnQgZm9yIGEgZmlsZSB3aGljaCB3aWxsIGJlIHVzZWQgdGhlIHN0b3JlIHRoZSBlbmRwb2ludFxuICpcbiAqIEBwYXJhbSB7RmlsZX0gZmlsZVxuICogQHJldHVybiB7U3RyaW5nfVxuICovXG5leHBvcnQgZGVmYXVsdCBmdW5jdGlvbiBmaW5nZXJwcmludChmaWxlKSB7XG4gIHJldHVybiBbXG5cdFx0XCJ0dXNcIixcblx0XHRmaWxlLm5hbWUsXG5cdFx0ZmlsZS50eXBlLFxuXHRcdGZpbGUuc2l6ZSxcblx0XHRmaWxlLmxhc3RNb2RpZmllZFxuICBdLmpvaW4oXCItXCIpO1xufVxuIiwiLyogZ2xvYmFsIHdpbmRvdyAqL1xuaW1wb3J0IFVwbG9hZCBmcm9tIFwiLi91cGxvYWRcIjtcbmltcG9ydCB7Y2FuU3RvcmVVUkxzfSBmcm9tIFwiLi9zdG9yYWdlXCI7XG5cbmNvbnN0IHtkZWZhdWx0T3B0aW9uc30gPSBVcGxvYWQ7XG5cbmlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiKSB7XG4gIC8vIEJyb3dzZXIgZW52aXJvbm1lbnQgdXNpbmcgWE1MSHR0cFJlcXVlc3RcbiAgY29uc3Qge1hNTEh0dHBSZXF1ZXN0LCBCbG9ifSA9IHdpbmRvdztcblxuICB2YXIgaXNTdXBwb3J0ZWQgPSAoXG4gICAgWE1MSHR0cFJlcXVlc3QgJiZcbiAgICBCbG9iICYmXG4gICAgdHlwZW9mIEJsb2IucHJvdG90eXBlLnNsaWNlID09PSBcImZ1bmN0aW9uXCJcbiAgKTtcbn0gZWxzZSB7XG4gIC8vIE5vZGUuanMgZW52aXJvbm1lbnQgdXNpbmcgaHR0cCBtb2R1bGVcbiAgdmFyIGlzU3VwcG9ydGVkID0gdHJ1ZTtcbn1cblxuLy8gVGhlIHVzYWdlIG9mIHRoZSBjb21tb25qcyBleHBvcnRpbmcgc3ludGF4IGluc3RlYWQgb2YgdGhlIG5ldyBFQ01BU2NyaXB0XG4vLyBvbmUgaXMgYWN0dWFsbHkgaW50ZWRlZCBhbmQgcHJldmVudHMgd2VpcmQgYmVoYXZpb3VyIGlmIHdlIGFyZSB0cnlpbmcgdG9cbi8vIGltcG9ydCB0aGlzIG1vZHVsZSBpbiBhbm90aGVyIG1vZHVsZSB1c2luZyBCYWJlbC5cbm1vZHVsZS5leHBvcnRzID0ge1xuICBVcGxvYWQsXG4gIGlzU3VwcG9ydGVkLFxuICBjYW5TdG9yZVVSTHMsXG4gIGRlZmF1bHRPcHRpb25zXG59O1xuIiwiY2xhc3MgRmlsZVNvdXJjZSB7XG4gIGNvbnN0cnVjdG9yKGZpbGUpIHtcbiAgICB0aGlzLl9maWxlID0gZmlsZTtcbiAgICB0aGlzLnNpemUgPSBmaWxlLnNpemU7XG4gIH1cblxuICBzbGljZShzdGFydCwgZW5kKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbGUuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gIH1cblxuICBjbG9zZSgpIHt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTb3VyY2UoaW5wdXQpIHtcbiAgLy8gU2luY2Ugd2UgZW11bGF0ZSB0aGUgQmxvYiB0eXBlIGluIG91ciB0ZXN0cyAobm90IGFsbCB0YXJnZXQgYnJvd3NlcnNcbiAgLy8gc3VwcG9ydCBpdCksIHdlIGNhbm5vdCB1c2UgYGluc3RhbmNlb2ZgIGZvciB0ZXN0aW5nIHdoZXRoZXIgdGhlIGlucHV0IHZhbHVlXG4gIC8vIGNhbiBiZSBoYW5kbGVkLiBJbnN0ZWFkLCB3ZSBzaW1wbHkgY2hlY2sgaXMgdGhlIHNsaWNlKCkgZnVuY3Rpb24gYW5kIHRoZVxuICAvLyBzaXplIHByb3BlcnR5IGFyZSBhdmFpbGFibGUuXG4gIGlmICh0eXBlb2YgaW5wdXQuc2xpY2UgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgaW5wdXQuc2l6ZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiBuZXcgRmlsZVNvdXJjZShpbnB1dCk7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoXCJzb3VyY2Ugb2JqZWN0IG1heSBvbmx5IGJlIGFuIGluc3RhbmNlIG9mIEZpbGUgb3IgQmxvYiBpbiB0aGlzIGVudmlyb25tZW50XCIpO1xufVxuIiwiLyogZ2xvYmFsIHdpbmRvdywgbG9jYWxTdG9yYWdlICovXG5cbmxldCBoYXNTdG9yYWdlID0gZmFsc2U7XG50cnkge1xuICBoYXNTdG9yYWdlID0gXCJsb2NhbFN0b3JhZ2VcIiBpbiB3aW5kb3c7XG5cbiAgLy8gQXR0ZW1wdCB0byBzdG9yZSBhbmQgcmVhZCBlbnRyaWVzIGZyb20gdGhlIGxvY2FsIHN0b3JhZ2UgdG8gZGV0ZWN0IFByaXZhdGVcbiAgLy8gTW9kZSBvbiBTYWZhcmkgb24gaU9TIChzZWUgIzQ5KVxuICB2YXIga2V5ID0gXCJ0dXNTdXBwb3J0XCI7XG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KSk7XG5cbn0gY2F0Y2ggKGUpIHtcbiAgLy8gSWYgd2UgdHJ5IHRvIGFjY2VzcyBsb2NhbFN0b3JhZ2UgaW5zaWRlIGEgc2FuZGJveGVkIGlmcmFtZSwgYSBTZWN1cml0eUVycm9yXG4gIC8vIGlzIHRocm93bi4gV2hlbiBpbiBwcml2YXRlIG1vZGUgb24gaU9TIFNhZmFyaSwgYSBRdW90YUV4Y2VlZGVkRXJyb3IgaXNcbiAgLy8gdGhyb3duIChzZWUgIzQ5KVxuICBpZiAoZS5jb2RlID09PSBlLlNFQ1VSSVRZX0VSUiB8fCBlLmNvZGUgPT09IGUuUVVPVEFfRVhDRUVERURfRVJSKSB7XG4gICAgaGFzU3RvcmFnZSA9IGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHRocm93IGU7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNhblN0b3JlVVJMcyA9IGhhc1N0b3JhZ2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRJdGVtKGtleSwgdmFsdWUpIHtcbiAgaWYgKCFoYXNTdG9yYWdlKSByZXR1cm47XG4gIHJldHVybiBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEl0ZW0oa2V5KSB7XG4gIGlmICghaGFzU3RvcmFnZSkgcmV0dXJuO1xuICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUl0ZW0oa2V5KSB7XG4gIGlmICghaGFzU3RvcmFnZSkgcmV0dXJuO1xuICByZXR1cm4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcbn1cbiIsIi8qIGdsb2JhbCB3aW5kb3cgKi9cbmltcG9ydCBmaW5nZXJwcmludCBmcm9tIFwiLi9maW5nZXJwcmludFwiO1xuaW1wb3J0IERldGFpbGVkRXJyb3IgZnJvbSBcIi4vZXJyb3JcIjtcbmltcG9ydCBleHRlbmQgZnJvbSBcImV4dGVuZFwiO1xuaW1wb3J0IHtnZXRTb3VyY2V9IGZyb20gXCIuL3NvdXJjZVwiO1xuaW1wb3J0ICogYXMgQmFzZTY0IGZyb20gXCIuL2Jhc2U2NFwiO1xuaW1wb3J0ICogYXMgU3RvcmFnZSBmcm9tIFwiLi9zdG9yYWdlXCI7XG5cbmNvbnN0IGRlZmF1bHRPcHRpb25zID0ge1xuICBlbmRwb2ludDogXCJcIixcbiAgZmluZ2VycHJpbnQsXG4gIHJlc3VtZTogdHJ1ZSxcbiAgb25Qcm9ncmVzczogbnVsbCxcbiAgb25DaHVua0NvbXBsZXRlOiBudWxsLFxuICBvblN1Y2Nlc3M6IG51bGwsXG4gIG9uRXJyb3I6IG51bGwsXG4gIGhlYWRlcnM6IHt9LFxuICBjaHVua1NpemU6IEluZmluaXR5LFxuICB3aXRoQ3JlZGVudGlhbHM6IGZhbHNlLFxuICB1cGxvYWRVcmw6IG51bGwsXG4gIHVwbG9hZFNpemU6IG51bGxcbn07XG5cbmNsYXNzIFVwbG9hZCB7XG5cbiAgY29uc3RydWN0b3IoZmlsZSwgb3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IGV4dGVuZCh0cnVlLCB7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgLy8gVGhlIHVuZGVybHlpbmcgRmlsZS9CbG9iIG9iamVjdFxuICAgIHRoaXMuZmlsZSA9IGZpbGU7XG5cbiAgICAvLyBUaGUgdW5kZXJseWluZyBXZWJTb2NrZXQgY29ubmVjdGlvbiB3aGljaCB3aWxsIGJlIHVzZSBmb3IgdXBsb2FkIGZpbGVcbiAgICB0aGlzLl93cyA9IG51bGw7XG5cbiAgICAvLyBUaGUgU291cmNlIG9iamVjdCB3aGljaCB3aWxsIHdyYXAgYXJvdW5kIHRoZSBnaXZlbiBmaWxlIGFuZCBwcm92aWRlcyB1c1xuICAgIC8vIHdpdGggYSB1bmlmaWVkIGludGVyZmFjZSBmb3IgZ2V0dGluZyBpdHMgc2l6ZSBhbmQgc2xpY2UgY2h1bmtzIGZyb20gaXRzXG4gICAgLy8gY29udGVudCBhbGxvd2luZyB1cyB0byBlYXNpbHkgaGFuZGxlIEZpbGVzLCBCbG9icywgQnVmZmVycyBhbmQgU3RyZWFtcy5cbiAgICB0aGlzLl9zb3VyY2UgPSBudWxsO1xuXG4gICAgLy8gVGhlIGZpbGUncyBzaXplIGluIGJ5dGVzXG4gICAgdGhpcy5fc2l6ZSA9IG51bGw7XG5cbiAgICAvLyBUcnVlIGlmIHRoZSBjdXJyZW50IFBBVENIIHJlcXVlc3QgaGFzIGJlZW4gYWJvcnRlZFxuICAgIHRoaXMuX2Fib3J0ZWQgPSBmYWxzZTtcblxuICAgIC8vIFRoZSBVUkwgYWdhaW5zdCB3aGljaCB0aGUgZmlsZSB3aWxsIGJlIHVwbG9hZGVkXG4gICAgdGhpcy51cmwgPSBudWxsO1xuXG4gICAgLy8gVGhlIGZpbmdlcnBpbnJ0IGZvciB0aGUgY3VycmVudCBmaWxlIChzZXQgYWZ0ZXIgc3RhcnQoKSlcbiAgICB0aGlzLl9maW5nZXJwcmludCA9IG51bGw7XG5cbiAgICAvLyBUaGUgb2Zmc2V0IHVzZWQgaW4gdGhlIGN1cnJlbnQgUEFUQ0ggcmVxdWVzdFxuICAgIHRoaXMuX29mZnNldCA9IG51bGw7XG4gIH1cblxuICBzdGFydFdTVGVzdCgpIHtcbiAgICB0aGlzLl9jcmVhdGVVcGxvYWQoKTtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuXG4gICAgaWYgKCF3aW5kb3cuV2ViU29ja2V0KSB7XG4gICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiB5b3VyIGJyb3dzZXIgZG9lc24ndCBzdXBwb3J0cyBXZWJTb2NrZXRcIikpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5vcHRpb25zLmVuZHBvaW50KSB7XG4gICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiBubyBlbmRwb2ludCBwcm92aWRlZFwiKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IGZpbGUgPSB0aGlzLmZpbGU7XG5cbiAgICBpZiAoIWZpbGUpIHtcbiAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IG5vIGZpbGUgb3Igc3RyZWFtIHRvIHVwbG9hZCBwcm92aWRlZFwiKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHNvdXJjZSA9IHRoaXMuX3NvdXJjZSA9IGdldFNvdXJjZShmaWxlLCB0aGlzLm9wdGlvbnMuY2h1bmtTaXplKTtcblxuICAgIC8vIEZpcnN0bHksIGNoZWNrIGlmIHRoZSBjYWxsZXIgaGFzIHN1cHBsaWVkIGEgbWFudWFsIHVwbG9hZCBzaXplIG9yIGVsc2VcbiAgICAvLyB3ZSB3aWxsIHVzZSB0aGUgY2FsY3VsYXRlZCBzaXplIGJ5IHRoZSBzb3VyY2Ugb2JqZWN0LlxuICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkU2l6ZSAhPSBudWxsKSB7XG4gICAgICBsZXQgc2l6ZSA9ICt0aGlzLm9wdGlvbnMudXBsb2FkU2l6ZTtcbiAgICAgIGlmIChpc05hTihzaXplKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0dXM6IGNhbm5vdCBjb252ZXJ0IGB1cGxvYWRTaXplYCBvcHRpb24gaW50byBhIG51bWJlclwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc2l6ZSA9IHNpemU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBzaXplID0gc291cmNlLnNpemU7XG5cbiAgICAgIC8vIFRoZSBzaXplIHByb3BlcnR5IHdpbGwgYmUgbnVsbCBpZiB3ZSBjYW5ub3QgY2FsY3VsYXRlIHRoZSBmaWxlJ3Mgc2l6ZSxcbiAgICAgIC8vIGZvciBleGFtcGxlIGlmIHlvdSBoYW5kbGUgYSBzdHJlYW0uXG4gICAgICBpZiAoc2l6ZSA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInR1czogY2Fubm90IGF1dG9tYXRpY2FsbHkgZGVyaXZlIHVwbG9hZCdzIHNpemUgZnJvbSBpbnB1dCBhbmQgbXVzdCBiZSBzcGVjaWZpZWQgbWFudWFsbHkgdXNpbmcgdGhlIGB1cGxvYWRTaXplYCBvcHRpb25cIik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NpemUgPSBzaXplO1xuICAgIH1cblxuICAgIC8vIFJlc2V0IHRoZSBhYm9ydGVkIGZsYWcgd2hlbiB0aGUgdXBsb2FkIGlzIHN0YXJ0ZWQgb3IgZWxzZSB0aGVcbiAgICAvLyBfc3RhcnRVcGxvYWQgd2lsbCBzdG9wIGJlZm9yZSBzZW5kaW5nIGEgcmVxdWVzdCBpZiB0aGUgdXBsb2FkIGhhcyBiZWVuXG4gICAgLy8gYWJvcnRlZCBwcmV2aW91c2x5LlxuICAgIHRoaXMuX2Fib3J0ZWQgPSBmYWxzZTtcblxuICAgIC8vIFRoZSB1cGxvYWQgaGFkIGJlZW4gc3RhcnRlZCBwcmV2aW91c2x5IGFuZCB3ZSBzaG91bGQgcmV1c2UgdGhpcyBVUkwuXG4gICAgaWYgKHRoaXMudXJsICE9IG51bGwpIHtcbiAgICAgIHRoaXMuX3Jlc3VtZVVwbG9hZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIEEgVVJMIGhhcyBtYW51YWxseSBiZWVuIHNwZWNpZmllZCwgc28gd2UgdHJ5IHRvIHJlc3VtZVxuICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkVXJsICE9IG51bGwpIHtcbiAgICAgIHRoaXMudXJsID0gdGhpcy5vcHRpb25zLnVwbG9hZFVybDtcbiAgICAgIHRoaXMuX3Jlc3VtZVVwbG9hZCgpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIC8vIFRyeSB0byBmaW5kIHRoZSBlbmRwb2ludCBmb3IgdGhlIGZpbGUgaW4gdGhlIHN0b3JhZ2VcbiAgICBpZiAodGhpcy5vcHRpb25zLnJlc3VtZSkge1xuICAgICAgdGhpcy5fZmluZ2VycHJpbnQgPSB0aGlzLm9wdGlvbnMuZmluZ2VycHJpbnQoZmlsZSk7XG4gICAgICBsZXQgcmVzdW1lZFVybCA9IFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLl9maW5nZXJwcmludCk7XG5cbiAgICAgIGlmIChyZXN1bWVkVXJsICE9IG51bGwpIHtcbiAgICAgICAgICB0aGlzLnVybCA9IHJlc3VtZWRVcmw7XG4gICAgICAgICAgdGhpcy5fcmVzdW1lVXBsb2FkKCk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgIH1cblxuICAgIC8vIEFuIHVwbG9hZCBoYXMgbm90IHN0YXJ0ZWQgZm9yIHRoZSBmaWxlIHlldCwgc28gd2Ugc3RhcnQgYSBuZXcgb25lXG4gICAgdGhpcy5fY3JlYXRlVXBsb2FkKCk7XG4gIH1cblxuICBfc2V0UmVxdWVzdEhlYWRlcnMoKSB7XG4gICAgbGV0IGhlYWRlcnMgPSB7XG4gICAgICBcIlR1cy1SZXN1bWFibGVcIjogXCIxLjAuMFwiXG4gICAgfTtcblxuICAgIGxldCBvcHRpb25zSGVhZGVycyA9IHRoaXMub3B0aW9ucy5oZWFkZXJzO1xuXG4gICAgZm9yIChsZXQgbmFtZSBpbiBvcHRpb25zSGVhZGVycykge1xuICAgICAgaGVhZGVyc1tuYW1lXSA9IG9wdGlvbnNIZWFkZXJzW25hbWVdO1xuICAgIH1cblxuICAgIHJldHVybiBoZWFkZXJzO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyB1cGxvYWQgdXNpbmcgdGhlIGNyZWF0aW9uIGV4dGVuc2lvbiBieSBzZW5kaW5nIGEgUE9TVFxuICAgKiByZXF1ZXN0IHRvIHRoZSBlbmRwb2ludC4gQWZ0ZXIgc3VjY2Vzc2Z1bCBjcmVhdGlvbiB0aGUgZmlsZSB3aWxsIGJlXG4gICAqIHVwbG9hZGVkXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgX2NyZWF0ZVVwbG9hZCgpIHtcbiAgICBsZXQgd3MgPSB0aGlzLl9uZXdXZWJTb2NrZXQoKTtcblxuICAgIHdzLm9ub3BlbiA9IChldmVudCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJbQ3JlYXRlXSBXUyBvcGVuZWQ6IFwiLCBldmVudCk7XG5cbiAgICAgIGxldCBoZWFkZXJzID0gdGhpcy5fc2V0UmVxdWVzdEhlYWRlcnMoKTtcbiAgICAgIGhlYWRlcnNbXCJVcGxvYWQtTGVuZ3RoXCJdID0gdGhpcy5fc2l6ZTtcblxuICAgICAgdmFyIG1ldGFkYXRhID0gZW5jb2RlTWV0YWRhdGEodGhpcy5vcHRpb25zLm1ldGFkYXRhKTtcbiAgICAgIGlmIChtZXRhZGF0YSAhPT0gXCJcIikge1xuICAgICAgICBoZWFkZXJzW1wiVXBsb2FkLU1ldGFkYXRhXCJdID0gbWV0YWRhdGE7XG4gICAgICB9XG5cbiAgICAgIHdzLnNlbmQoSlNPTi5zdHJpbmdpZnkoe1xuICAgICAgICBtZXRob2Q6IFwiUE9TVFwiLFxuICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICBib2R5OiBudWxsXG4gICAgICB9KSk7XG4gICAgfTtcblxuICAgIHdzLm9uZXJyb3IgPSAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiW0NyZWF0ZV0gV1MgZXJyb3I6IFwiLCBldmVudCk7XG4gICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0dXM6IGZhaWxlZCB0byBjcmVhdGUgdXBsb2FkXCIpO1xuICAgIH07XG5cbiAgICB3cy5vbmNsb3NlID0gKGV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIltDcmVhdGVdIFdTIGNsb3NlZDogXCIsIGV2ZW50KTtcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInR1czogZmFpbGVkIHRvIGNyZWF0ZSB1cGxvYWRcIik7XG4gICAgfTtcblxuICAgIHdzLm9ubWVzc2FnZSA9IChtZXNzYWdlKSA9PiB7XG4gICAgICBsZXQgcmVzcG9uc2UgPSBKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSk7XG5cbiAgICAgIC8vIFN0YXJ0IHVwbG9hZFxuICAgICAgY29uc29sZS5sb2coXCJbQ3JlYXRlXSBXUyBtZXNzYWdlOiBcIiwgbWVzc2FnZSk7XG4gICAgICBjb25zb2xlLmxvZyhcIltDcmVhdGVdIFdTIGRhdGE6IFwiLCByZXNwb25zZSk7XG5cbiAgICAgIGlmICghaW5TdGF0dXNDYXRlZ29yeShyZXNwb25zZS5zdGF0dXMsIDIwMCkpIHtcbiAgICAgICAgLy8gTXVzdCBfZW1pdFhockVycm9yXG4gICAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IHVuZXhwZWN0ZWQgcmVzcG9uc2Ugd2hpbGUgY3JlYXRpbmcgdXBsb2FkXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyB0aGlzLnVybCA9IHJlc29sdmVVcmwodGhpcy5vcHRpb25zLmVuZHBvaW50LCByZXNwb25zZS5oZWFkZXJzW1wiTG9jYXRpb25cIl0pO1xuICAgICAgdGhpcy51cmwgPSByZXNwb25zZS5oZWFkZXJzW1wiTG9jYXRpb25cIl07XG5cbiAgICAgIGlmICh0aGlzLm9wdGlvbnMucmVzdW1lKSB7XG4gICAgICAgIFN0b3JhZ2Uuc2V0SXRlbSh0aGlzLl9maW5nZXJwcmludCwgdGhpcy51cmwpO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9vZmZzZXQgPSAwO1xuICAgICAgdGhpcy5fc3RhcnRVcGxvYWQoKTtcbiAgICB9O1xuICB9XG5cbiAgX25ld1dlYlNvY2tldCgpe1xuICAgIHJldHVybiBuZXcgV2ViU29ja2V0KFwid3M6Ly9cIit0aGlzLm9wdGlvbnMuZW5kcG9pbnQrXCIvd3NcIik7XG4gIH1cblxuICBhYm9ydCgpIHtcbiAgICBpZiAodGhpcy5feGhyICE9PSBudWxsKSB7XG4gICAgICB0aGlzLl94aHIuYWJvcnQoKTtcbiAgICAgIHRoaXMuX3NvdXJjZS5jbG9zZSgpO1xuICAgICAgdGhpcy5fYWJvcnRlZCA9IHRydWU7XG4gICAgfVxuXG4gICAgaWYgKHRoaXMuX3JldHJ5VGltZW91dCAhPSBudWxsKSB7XG4gICAgICBjbGVhclRpbWVvdXQodGhpcy5fcmV0cnlUaW1lb3V0KTtcbiAgICAgIHRoaXMuX3JldHJ5VGltZW91dCA9IG51bGw7XG4gICAgfVxuICB9XG5cbiAgX2VtaXRYaHJFcnJvcih4aHIsIGVyciwgY2F1c2luZ0Vycikge1xuICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRGV0YWlsZWRFcnJvcihlcnIsIGNhdXNpbmdFcnIsIHhocikpO1xuICB9XG5cbiAgX2VtaXRFcnJvcihlcnIpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5vbkVycm9yKGVycik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cblxuICBfZW1pdFN1Y2Nlc3MoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25TdWNjZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5vblN1Y2Nlc3MoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHVibGlzaGVzIG5vdGlmaWNhdGlvbiB3aGVuIGRhdGEgaGFzIGJlZW4gc2VudCB0byB0aGUgc2VydmVyLiBUaGlzXG4gICAqIGRhdGEgbWF5IG5vdCBoYXZlIGJlZW4gYWNjZXB0ZWQgYnkgdGhlIHNlcnZlciB5ZXQuXG4gICAqIEBwYXJhbSAge251bWJlcn0gYnl0ZXNTZW50ICBOdW1iZXIgb2YgYnl0ZXMgc2VudCB0byB0aGUgc2VydmVyLlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGJ5dGVzVG90YWwgVG90YWwgbnVtYmVyIG9mIGJ5dGVzIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAgICovXG4gIF9lbWl0UHJvZ3Jlc3MoYnl0ZXNTZW50LCBieXRlc1RvdGFsKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25Qcm9ncmVzcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aGlzLm9wdGlvbnMub25Qcm9ncmVzcyhieXRlc1NlbnQsIGJ5dGVzVG90YWwpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQdWJsaXNoZXMgbm90aWZpY2F0aW9uIHdoZW4gYSBjaHVuayBvZiBkYXRhIGhhcyBiZWVuIHNlbnQgdG8gdGhlIHNlcnZlclxuICAgKiBhbmQgYWNjZXB0ZWQgYnkgdGhlIHNlcnZlci5cbiAgICogQHBhcmFtICB7bnVtYmVyfSBjaHVua1NpemUgIFNpemUgb2YgdGhlIGNodW5rIHRoYXQgd2FzIGFjY2VwdGVkIGJ5IHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyLlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGJ5dGVzQWNjZXB0ZWQgVG90YWwgbnVtYmVyIG9mIGJ5dGVzIHRoYXQgaGF2ZSBiZWVuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2NlcHRlZCBieSB0aGUgc2VydmVyLlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGJ5dGVzVG90YWwgVG90YWwgbnVtYmVyIG9mIGJ5dGVzIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAgICovXG4gIF9lbWl0Q2h1bmtDb21wbGV0ZShjaHVua1NpemUsIGJ5dGVzQWNjZXB0ZWQsIGJ5dGVzVG90YWwpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkNodW5rQ29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhpcy5vcHRpb25zLm9uQ2h1bmtDb21wbGV0ZShjaHVua1NpemUsIGJ5dGVzQWNjZXB0ZWQsIGJ5dGVzVG90YWwpO1xuICAgIH1cbiAgfVxuXG4gIC8qXG4gICAqIFRyeSB0byByZXN1bWUgYW4gZXhpc3RpbmcgdXBsb2FkLiBGaXJzdCBhIEhFQUQgcmVxdWVzdCB3aWxsIGJlIHNlbnRcbiAgICogdG8gcmV0cmlldmUgdGhlIG9mZnNldC4gSWYgdGhlIHJlcXVlc3QgZmFpbHMgYSBuZXcgdXBsb2FkIHdpbGwgYmVcbiAgICogY3JlYXRlZC4gSW4gdGhlIGNhc2Ugb2YgYSBzdWNjZXNzZnVsIHJlc3BvbnNlIHRoZSBmaWxlIHdpbGwgYmUgdXBsb2FkZWQuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgX3Jlc3VtZVVwbG9hZCgpIHtcbiAgICBsZXQgd3MgPSB0aGlzLl9uZXdXZWJTb2NrZXQoKTtcblxuICAgIHdzLm9ub3BlbiA9IChldmVudCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJbUmVzdW1lXSBXUyBvcGVuZWQ6IFwiLCBldmVudCk7XG5cbiAgICAgIHdzLnNlbmQoe1xuICAgICAgICBtZXRob2Q6IFwiSEVBRFwiLFxuICAgICAgICBoZWFkZXJzOiB0aGlzLl9zZXRSZXF1ZXN0SGVhZGVycygpLFxuICAgICAgICBib2R5OiBudWxsXG4gICAgICB9KTtcbiAgICB9O1xuXG4gICAgd3Mub25lcnJvciA9IChldmVudCkgPT4ge1xuICAgICAgY29uc29sZS5sb2coXCJbUmVzdW1lXSBXUyBlcnJvcjogXCIsIGV2ZW50KTtcbiAgICAgIC8vIE11c3QgX2VtaXRYaHJFcnJvclxuICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcihcInR1czogZmFpbGVkIHRvIHJlc3VtZSB1cGxvYWRcIikpO1xuICAgIH07XG5cbiAgICB3cy5vbmNsb3NlID0gKGV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIltSZXN1bWVdIFdTIGNsb3NlZDogXCIsIGV2ZW50KTtcbiAgICAgIC8vIE11c3QgX2VtaXRYaHJFcnJvclxuICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcihcInR1czogZmFpbGVkIHRvIHJlc3VtZSB1cGxvYWRcIikpO1xuICAgIH07XG5cbiAgICB3cy5vbm1lc3NhZ2UgPSAobWVzc2FnZSkgPT4ge1xuICAgICAgbGV0IHJlc3BvbnNlID0gSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpO1xuICAgICAgbGV0IGhlYWRlcnMgPSByZXNwb25zZS5oZWFkZXJzO1xuICAgICAgXG4gICAgICAvLyBSZXN1bWUgdXBsb2FkXG4gICAgICBjb25zb2xlLmxvZyhcIltSZXN1bWVdIFdTIG1lc3NhZ2U6IFwiLCBtZXNzYWdlKTtcbiAgICAgIGNvbnNvbGUubG9nKFwiW1Jlc3VtZV0gV1MgZGF0YTogXCIsIHJlc3BvbnNlKTtcblxuICAgICAgaWYgKCFpblN0YXR1c0NhdGVnb3J5KHJlc3BvbnNlLnN0YXR1cywgMjAwKSkge1xuICAgICAgICBpZiAodGhpcy5vcHRpb25zLnJlc3VtZSAmJiBpblN0YXR1c0NhdGVnb3J5KHJlc3BvbnNlLnN0YXR1cywgNDAwKSkge1xuICAgICAgICAgIC8vIFJlbW92ZSBzdG9yZWQgZmluZ2VycHJpbnQgYW5kIGNvcnJlc3BvbmRpbmcgZW5kcG9pbnQsXG4gICAgICAgICAgLy8gb24gY2xpZW50IGVycm9ycyBzaW5jZSB0aGUgZmlsZSBjYW4gbm90IGJlIGZvdW5kXG4gICAgICAgICAgU3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMuX2ZpbmdlcnByaW50KTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vICEhISEhISEhINCf0KDQntCi0JXQodCi0JjQotCsICEhISEhISEhXG4gICAgICAgIC8vIElmIHRoZSB1cGxvYWQgaXMgbG9ja2VkIChpbmRpY2F0ZWQgYnkgdGhlIDQyMyBMb2NrZWQgc3RhdHVzIGNvZGUpLCB3ZVxuICAgICAgICAvLyBlbWl0IGFuIGVycm9yIGluc3RlYWQgb2YgZGlyZWN0bHkgc3RhcnRpbmcgYSBuZXcgdXBsb2FkLiBUaGlzIHdheSB0aGVcbiAgICAgICAgLy8gcmV0cnkgbG9naWMgY2FuIGNhdGNoIHRoZSBlcnJvciBhbmQgd2lsbCByZXRyeSB0aGUgdXBsb2FkLiBBbiB1cGxvYWRcbiAgICAgICAgLy8gaXMgdXN1YWxseSBsb2NrZWQgZm9yIGEgc2hvcnQgcGVyaW9kIG9mIHRpbWUgYW5kIHdpbGwgYmUgYXZhaWxhYmxlXG4gICAgICAgIC8vIGFmdGVyd2FyZHMuXG4gICAgICAgIGlmIChyZXNwb25zZS5zdGF0dXMgPT09IDQyMykge1xuICAgICAgICAgIC8vIE11c3QgX2VtaXRYaHJFcnJvclxuICAgICAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IHVwbG9hZCBpcyBjdXJyZW50bHkgbG9ja2VkOyByZXRyeSBsYXRlclwiKSk7XG4gICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gVHJ5IHRvIGNyZWF0ZSBhIG5ldyB1cGxvYWRcbiAgICAgICAgdGhpcy51cmwgPSBudWxsO1xuICAgICAgICB0aGlzLl9jcmVhdGVVcGxvYWQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsZXQgb2Zmc2V0ID0gcGFyc2VJbnQoaGVhZGVyc1tcIlVwbG9hZC1PZmZzZXRcIl0sIDEwKTtcbiAgICAgIGlmIChpc05hTihvZmZzZXQpKSB7XG4gICAgICAgIC8vIE1VU1QgX2VtaXRYaHJFcnJvclxuICAgICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiBpbnZhbGlkIG9yIG1pc3Npbmcgb2Zmc2V0IHZhbHVlXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsZXQgbGVuZ3RoID0gcGFyc2VJbnQoaGVhZGVyc1tcIlVwbG9hZC1MZW5ndGhcIl0sIDEwKTtcbiAgICAgIGlmIChpc05hTihsZW5ndGgpKSB7XG4gICAgICAgIC8vIE1VU1QgX2VtaXRYaHJFcnJvclxuICAgICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiBpbnZhbGlkIG9yIG1pc3NpbmcgbGVuZ3RoIHZhbHVlXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICAvLyBVcGxvYWQgaGFzIGFscmVhZHkgYmVlbiBjb21wbGV0ZWQgYW5kIHdlIGRvIG5vdCBuZWVkIHRvIHNlbmQgYWRkaXRpb25hbFxuICAgICAgLy8gZGF0YSB0byB0aGUgc2VydmVyXG4gICAgICBpZiAob2Zmc2V0ID09PSBsZW5ndGgpIHtcbiAgICAgICAgdGhpcy5fZW1pdFByb2dyZXNzKGxlbmd0aCwgbGVuZ3RoKTtcbiAgICAgICAgdGhpcy5fZW1pdFN1Y2Nlc3MoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9vZmZzZXQgPSBvZmZzZXQ7XG4gICAgICB0aGlzLl9zdGFydFVwbG9hZCgpO1xuICAgIH07XG4gIH1cblxuICAvKipcbiAgICogU3RhcnQgdXBsb2FkaW5nIHRoZSBmaWxlIHVzaW5nIFBBVENIIHJlcXVlc3RzLiBUaGUgZmlsZSB3aWxsIGJlIGRpdmlkZWRcbiAgICogaW50byBjaHVua3MgYXMgc3BlY2lmaWVkIGluIHRoZSBjaHVua1NpemUgb3B0aW9uLiBEdXJpbmcgdGhlIHVwbG9hZFxuICAgKiB0aGUgb25Qcm9ncmVzcyBldmVudCBoYW5kbGVyIG1heSBiZSBpbnZva2VkIG11bHRpcGxlIHRpbWVzLlxuICAgKlxuICAgKiBAYXBpIHByaXZhdGVcbiAgICovXG4gIF9zdGFydFVwbG9hZCgpIHtcbiAgICAvLyBJZiB0aGUgdXBsb2FkIGhhcyBiZWVuIGFib3J0ZWQsIHdlIHdpbGwgbm90IHNlbmQgdGhlIG5leHQgUEFUQ0ggcmVxdWVzdC5cbiAgICAvLyBUaGlzIGlzIGltcG9ydGFudCBpZiB0aGUgYWJvcnQgbWV0aG9kIHdhcyBjYWxsZWQgZHVyaW5nIGEgY2FsbGJhY2ssIHN1Y2hcbiAgICAvLyBhcyBvbkNodW5rQ29tcGxldGUgb3Igb25Qcm9ncmVzcy5cbiAgICBpZiAodGhpcy5fYWJvcnRlZCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGxldCB3cyA9IHRoaXMuX25ld1dlYlNvY2tldCgpO1xuXG4gICAgd3Mub25vcGVuID0gKGV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIltTdGFydF0gV1Mgb3BlbmVkOiBcIiwgZXZlbnQpO1xuXG4gICAgICAvLyBUZXN0IHN1cHBvcnQgZm9yIHByb2dyZXNzIGV2ZW50cyBiZWZvcmUgYXR0YWNoaW5nIGFuIGV2ZW50IGxpc3RlbmVyXG4gICAgICAvLyBpZiAoXCJ1cGxvYWRcIiBpbiB4aHIpIHtcbiAgICAgIC8vICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gKGUpID0+IHtcbiAgICAgIC8vICAgICBpZiAoIWUubGVuZ3RoQ29tcHV0YWJsZSkge1xuICAgICAgLy8gICAgICAgcmV0dXJuO1xuICAgICAgLy8gICAgIH1cblxuICAgICAgLy8gICAgIHRoaXMuX2VtaXRQcm9ncmVzcyhzdGFydCArIGUubG9hZGVkLCB0aGlzLl9zaXplKTtcbiAgICAgIC8vICAgfTtcbiAgICAgIC8vIH1cblxuICAgICAgbGV0IGhlYWRlcnMgPSB0aGlzLl9zZXRSZXF1ZXN0SGVhZGVycygpO1xuICAgICAgaGVhZGVyc1tcIlVwbG9hZC1PZmZzZXRcIl0gPSB0aGlzLl9vZmZzZXQ7XG4gICAgICBoZWFkZXJzW1wiQ29udGVudC1UeXBlXCJdID0gXCJhcHBsaWNhdGlvbi9vZmZzZXQrb2N0ZXQtc3RyZWFtXCI7XG4gIFxuICAgICAgbGV0IHN0YXJ0ID0gdGhpcy5fb2Zmc2V0O1xuICAgICAgbGV0IGVuZCA9IHRoaXMuX29mZnNldCArIHRoaXMub3B0aW9ucy5jaHVua1NpemU7XG4gIFxuICAgICAgLy8gVGhlIHNwZWNpZmllZCBjaHVua1NpemUgbWF5IGJlIEluZmluaXR5IG9yIHRoZSBjYWxjbHVhdGVkIGVuZCBwb3NpdGlvblxuICAgICAgLy8gbWF5IGV4Y2VlZCB0aGUgZmlsZSdzIHNpemUuIEluIGJvdGggY2FzZXMsIHdlIGxpbWl0IHRoZSBlbmQgcG9zaXRpb24gdG9cbiAgICAgIC8vIHRoZSBpbnB1dCdzIHRvdGFsIHNpemUgZm9yIHNpbXBsZXIgY2FsY3VsYXRpb25zIGFuZCBjb3JyZWN0bmVzcy5cbiAgICAgIGlmIChlbmQgPT09IEluZmluaXR5IHx8IGVuZCA+IHRoaXMuX3NpemUpIHtcbiAgICAgICAgZW5kID0gdGhpcy5fc2l6ZTtcbiAgICAgIH1cblxuICAgICAgd3Muc2VuZCh7XG4gICAgICAgIG1ldGhvZDogXCJQQVRDSFwiLFxuICAgICAgICBoZWFkZXJzOiBoZWFkZXJzLFxuICAgICAgICBib2R5OiB0aGlzLl9zb3VyY2Uuc2xpY2Uoc3RhcnQsIGVuZClcbiAgICAgIH0pO1xuICAgIH07XG5cbiAgICB3cy5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIltTdGFydF0gV1MgZXJyb3I6IFwiLCBldmVudCk7XG5cbiAgICAgIGlmICh0aGlzLl9hYm9ydGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTXVzdCBfZW1pdFhockVycm9yXG4gICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiBmYWlsZWQgdG8gdXBsb2FkIGNodW5rIGF0IG9mZnNldCBcIiArIHRoaXMuX29mZnNldCkpO1xuICAgIH07XG5cbiAgICB3cy5vbmNsb3NlID0gKGV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIltTdGFydF0gV1MgY2xvc2U6IFwiLCBldmVudCk7XG4gICAgICBcbiAgICAgIGlmICh0aGlzLl9hYm9ydGVkKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgLy8gTXVzdCBfZW1pdFhockVycm9yXG4gICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiBmYWlsZWQgdG8gdXBsb2FkIGNodW5rIGF0IG9mZnNldCBcIiArIHRoaXMuX29mZnNldCkpO1xuICAgIH07XG5cbiAgICB3cy5vbm1lc3NhZ2UgPSAobWVzc2FnZSkgPT4ge1xuICAgICAgbGV0IHJlc3BvbnNlID0gSlNPTi5wYXJzZShtZXNzYWdlLmRhdGEpO1xuICAgICAgbGV0IGhlYWRlcnMgPSByZXNwb25zZS5oZWFkZXJzO1xuICAgICAgXG4gICAgICAvLyBSZXN1bWUgdXBsb2FkXG4gICAgICBjb25zb2xlLmxvZyhcIltTdGFydF0gV1MgbWVzc2FnZTogXCIsIG1lc3NhZ2UpO1xuICAgICAgY29uc29sZS5sb2coXCJbU3RhcnRdIFdTIGRhdGE6IFwiLCByZXNwb25zZSk7XG5cbiAgICAgIGlmICghaW5TdGF0dXNDYXRlZ29yeShyZXNwb25zZS5zdGF0dXMsIDIwMCkpIHtcbiAgICAgICAgLy8gTXVzdCBfZW1pdFhockVycm9yXG4gICAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IHVuZXhwZWN0ZWQgcmVzcG9uc2Ugd2hpbGUgdXBsb2FkaW5nIGNodW5rXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICBsZXQgb2Zmc2V0ID0gcGFyc2VJbnQoaGVhZGVyc1tcIlVwbG9hZC1PZmZzZXRcIl0sIDEwKTtcbiAgICAgIGlmIChpc05hTihvZmZzZXQpKSB7XG4gICAgICAgIC8vIE11c3QgX2VtaXRYaHJFcnJvclxuICAgICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiBpbnZhbGlkIG9yIG1pc3Npbmcgb2Zmc2V0IHZhbHVlXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9lbWl0UHJvZ3Jlc3Mob2Zmc2V0LCB0aGlzLl9zaXplKTtcbiAgICAgIHRoaXMuX2VtaXRDaHVua0NvbXBsZXRlKG9mZnNldCAtIHRoaXMuX29mZnNldCwgb2Zmc2V0LCB0aGlzLl9zaXplKTtcblxuICAgICAgdGhpcy5fb2Zmc2V0ID0gb2Zmc2V0O1xuXG4gICAgICBpZiAob2Zmc2V0ID09IHRoaXMuX3NpemUpIHtcbiAgICAgICAgLy8gWWF5LCBmaW5hbGx5IGRvbmUgOilcbiAgICAgICAgdGhpcy5fZW1pdFN1Y2Nlc3MoKTtcbiAgICAgICAgdGhpcy5fc291cmNlLmNsb3NlKCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc3RhcnRVcGxvYWQoKTtcbiAgICB9O1xuICB9XG59XG5cbmZ1bmN0aW9uIGVuY29kZU1ldGFkYXRhKG1ldGFkYXRhKSB7XG4gICAgaWYgKCFCYXNlNjQuaXNTdXBwb3J0ZWQpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuXG4gICAgdmFyIGVuY29kZWQgPSBbXTtcblxuICAgIGZvciAodmFyIGtleSBpbiBtZXRhZGF0YSkge1xuICAgICAgICBlbmNvZGVkLnB1c2goa2V5ICsgXCIgXCIgKyBCYXNlNjQuZW5jb2RlKG1ldGFkYXRhW2tleV0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW5jb2RlZC5qb2luKFwiLFwiKTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhIGdpdmVuIHN0YXR1cyBpcyBpbiB0aGUgcmFuZ2Ugb2YgdGhlIGV4cGVjdGVkIGNhdGVnb3J5LlxuICogRm9yIGV4YW1wbGUsIG9ubHkgYSBzdGF0dXMgYmV0d2VlbiAyMDAgYW5kIDI5OSB3aWxsIHNhdGlzZnkgdGhlIGNhdGVnb3J5IDIwMC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gaW5TdGF0dXNDYXRlZ29yeShzdGF0dXMsIGNhdGVnb3J5KSB7XG4gIHJldHVybiAoc3RhdHVzID49IGNhdGVnb3J5ICYmIHN0YXR1cyA8IChjYXRlZ29yeSArIDEwMCkpO1xufVxuXG5VcGxvYWQuZGVmYXVsdE9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgVXBsb2FkO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnZhciBpc0FycmF5ID0gZnVuY3Rpb24gaXNBcnJheShhcnIpIHtcblx0aWYgKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKTtcblx0fVxuXG5cdHJldHVybiB0b1N0ci5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG5cdGlmICghb2JqIHx8IHRvU3RyLmNhbGwob2JqKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgaGFzT3duQ29uc3RydWN0b3IgPSBoYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpO1xuXHR2YXIgaGFzSXNQcm90b3R5cGVPZiA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICYmIGhhc093bi5jYWxsKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsICdpc1Byb3RvdHlwZU9mJyk7XG5cdC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3Rcblx0aWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhaGFzT3duQ29uc3RydWN0b3IgJiYgIWhhc0lzUHJvdG90eXBlT2YpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIG9iaikgeyAvKiovIH1cblxuXHRyZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3VuZGVmaW5lZCcgfHwgaGFzT3duLmNhbGwob2JqLCBrZXkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoKSB7XG5cdHZhciBvcHRpb25zLCBuYW1lLCBzcmMsIGNvcHksIGNvcHlJc0FycmF5LCBjbG9uZTtcblx0dmFyIHRhcmdldCA9IGFyZ3VtZW50c1swXTtcblx0dmFyIGkgPSAxO1xuXHR2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcblx0dmFyIGRlZXAgPSBmYWxzZTtcblxuXHQvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG5cdGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnYm9vbGVhbicpIHtcblx0XHRkZWVwID0gdGFyZ2V0O1xuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcblx0XHQvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG5cdFx0aSA9IDI7XG5cdH1cblx0aWYgKHRhcmdldCA9PSBudWxsIHx8ICh0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGFyZ2V0ICE9PSAnZnVuY3Rpb24nKSkge1xuXHRcdHRhcmdldCA9IHt9O1xuXHR9XG5cblx0Zm9yICg7IGkgPCBsZW5ndGg7ICsraSkge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbaV07XG5cdFx0Ly8gT25seSBkZWFsIHdpdGggbm9uLW51bGwvdW5kZWZpbmVkIHZhbHVlc1xuXHRcdGlmIChvcHRpb25zICE9IG51bGwpIHtcblx0XHRcdC8vIEV4dGVuZCB0aGUgYmFzZSBvYmplY3Rcblx0XHRcdGZvciAobmFtZSBpbiBvcHRpb25zKSB7XG5cdFx0XHRcdHNyYyA9IHRhcmdldFtuYW1lXTtcblx0XHRcdFx0Y29weSA9IG9wdGlvbnNbbmFtZV07XG5cblx0XHRcdFx0Ly8gUHJldmVudCBuZXZlci1lbmRpbmcgbG9vcFxuXHRcdFx0XHRpZiAodGFyZ2V0ICE9PSBjb3B5KSB7XG5cdFx0XHRcdFx0Ly8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG5cdFx0XHRcdFx0aWYgKGRlZXAgJiYgY29weSAmJiAoaXNQbGFpbk9iamVjdChjb3B5KSB8fCAoY29weUlzQXJyYXkgPSBpc0FycmF5KGNvcHkpKSkpIHtcblx0XHRcdFx0XHRcdGlmIChjb3B5SXNBcnJheSkge1xuXHRcdFx0XHRcdFx0XHRjb3B5SXNBcnJheSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzUGxhaW5PYmplY3Qoc3JjKSA/IHNyYyA6IHt9O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBOZXZlciBtb3ZlIG9yaWdpbmFsIG9iamVjdHMsIGNsb25lIHRoZW1cblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGV4dGVuZChkZWVwLCBjbG9uZSwgY29weSk7XG5cblx0XHRcdFx0XHQvLyBEb24ndCBicmluZyBpbiB1bmRlZmluZWQgdmFsdWVzXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgY29weSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGNvcHk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3Rcblx0cmV0dXJuIHRhcmdldDtcbn07XG4iXX0=
