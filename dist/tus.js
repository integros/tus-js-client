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

},{"./storage":7,"./upload":8}],5:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.newRequest = newRequest;
exports.resolveUrl = resolveUrl;

var _resolveUrl = require("resolve-url");

var _resolveUrl2 = _interopRequireDefault(_resolveUrl);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function newRequest() {
  return new window.XMLHttpRequest();
} /* global window */
function resolveUrl(origin, link) {
  return (0, _resolveUrl2.default)(origin, link);
}

},{"resolve-url":10}],6:[function(require,module,exports){
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

},{}],7:[function(require,module,exports){
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

},{}],8:[function(require,module,exports){
"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }(); /* global window */


// We import the files used inside the Node environment which are rewritten
// for browsers using the rules defined in the package.json


var _fingerprint = require("./fingerprint");

var _fingerprint2 = _interopRequireDefault(_fingerprint);

var _error = require("./error");

var _error2 = _interopRequireDefault(_error);

var _extend = require("extend");

var _extend2 = _interopRequireDefault(_extend);

var _request = require("./request");

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
  wsendpoint: "",
  fingerprint: _fingerprint2.default,
  resume: true,
  onProgress: null,
  onChunkComplete: null,
  onSuccess: null,
  onError: null,
  onCancelSuccess: null,
  onCancelError: null,
  headers: {},
  chunkSize: Infinity,
  withCredentials: false,
  uploadUrl: null,
  uploadSize: null,
  overridePatchMethod: false,
  retryDelays: null
};

var Upload = function () {
  function Upload(file, options) {
    _classCallCheck(this, Upload);

    this.options = (0, _extend2.default)(true, {}, defaultOptions, options);

    // The underlying File/Blob object
    this.file = file;

    // The URL against which the file will be uploaded
    this.url = null;

    // The underlying XHR object for the current PATCH request
    this._xhr = null;

    // The fingerpinrt for the current file (set after start())
    this._fingerprint = null;

    // The offset used in the current PATCH request
    this._offset = null;

    // True if the current PATCH request has been aborted
    this._aborted = false;

    // The file's size in bytes
    this._size = null;

    // The Source object which will wrap around the given file and provides us
    // with a unified interface for getting its size and slice chunks from its
    // content allowing us to easily handle Files, Blobs, Buffers and Streams.
    this._source = null;

    // The current count of attempts which have been made. Null indicates none.
    this._retryAttempt = 0;

    // The timeout's ID which is used to delay the next retry
    this._retryTimeout = null;

    // The offset of the remote upload before the latest attempt was started.
    this._offsetBeforeRetry = 0;
  }

  _createClass(Upload, [{
    key: "start",
    value: function start() {
      var _this = this;

      var file = this.file;

      if (!file) {
        this._emitError(new Error("tus: no file or stream to upload provided"));
        return;
      }

      if (!this.options.wsendpoint) {
        this._emitError(new Error("tus: no wsendpoint provided"));
        return;
      }

      if (!this.options.endpoint) {
        this._emitError(new Error("tus: no endpoint provided"));
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

      var retryDelays = this.options.retryDelays;
      if (retryDelays != null) {
        if (Object.prototype.toString.call(retryDelays) !== "[object Array]") {
          throw new Error("tus: the `retryDelays` option must either be an array or null");
        } else {
          var errorCallback = this.options.onError;
          this.options.onError = function (err) {
            // Restore the original error callback which may have been set.
            _this.options.onError = errorCallback;

            // We will reset the attempt counter if
            // - we were already able to connect to the server (offset != null) and
            // - we were able to upload a small chunk of data to the server
            var shouldResetDelays = _this._offset != null && _this._offset > _this._offsetBeforeRetry;
            if (shouldResetDelays) {
              _this._retryAttempt = 0;
            }

            var isOnline = true;
            if (typeof window !== "undefined" && "navigator" in window && window.navigator.onLine === false) {
              isOnline = false;
            }

            // We only attempt a retry if
            // - we didn't exceed the maxium number of retries, yet, and
            // - this error was caused by a request or it's response and
            // - the error is not a client error (status 4xx) and
            // - the browser does not indicate that we are offline
            var shouldRetry = _this._retryAttempt < retryDelays.length && err.originalRequest != null && !inStatusCategory(err.originalRequest.status, 400) && isOnline;

            if (!shouldRetry) {
              _this._emitError(err);
              return;
            }

            var delay = retryDelays[_this._retryAttempt++];

            _this._offsetBeforeRetry = _this._offset;
            _this.options.uploadUrl = _this.url;

            _this._retryTimeout = setTimeout(function () {
              _this.start();
            }, delay);
          };
        }
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
    key: "cancel",
    value: function cancel() {
      var _this2 = this;

      if (this._xhr != null && this._aborted == false) {
        this._xhr.onabort = function () {
          _this2._cancelUpload();
        };
        this.abort();
      } else {
        this._cancelUpload();
      }
    }

    /**
    * Cancel upload using the delete extension by sending a DELETE
    * request to the uploadUrl.
    *
    * @api private
    */

  }, {
    key: "_cancelUpload",
    value: function _cancelUpload() {
      var _this3 = this;

      var xhr = (0, _request.newRequest)();
      xhr.open("DELETE", this.url, true);

      xhr.onload = function () {
        if (!inStatusCategory(xhr.status, 200)) {
          if (xhr.status === 423) {
            _this3._cancelUpload();
            return;
          }
          if (inStatusCategory(xhr.status, 400)) {
            Storage.removeItem(_this3._fingerprint);
            _this3._emitCancelSuccess();
            return;
          }
        }
        Storage.removeItem(_this3._fingerprint);
        _this3._emitCancelSuccess();
        return;
      };

      xhr.onerror = function (err) {
        _this3._emitXhrCancelError(xhr, new Error("tus: failed to cancel upload"), err);
      };

      this._setupXHR(xhr);
      xhr.send(null);
    }
  }, {
    key: "_emitXhrCancelError",
    value: function _emitXhrCancelError(xhr, err, causingErr) {
      this._emitCancelError(new _error2.default(err, causingErr, xhr));
    }
  }, {
    key: "_emitCancelError",
    value: function _emitCancelError(err) {
      if (typeof this.options.onError === "function") {
        this.options.onCancelError(err);
      } else {
        throw err;
      }
    }
  }, {
    key: "_emitCancelSuccess",
    value: function _emitCancelSuccess() {
      if (typeof this.options.onCancelSuccess === "function") {
        this.options.onCancelSuccess();
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

    /**
     * Set the headers used in the request and the withCredentials property
     * as defined in the options
     *
     * @param {XMLHttpRequest} xhr
     */

  }, {
    key: "_setupXHR",
    value: function _setupXHR(xhr) {
      this._xhr = xhr;

      xhr.setRequestHeader("Tus-Resumable", "1.0.0");
      var headers = this.options.headers;

      for (var name in headers) {
        xhr.setRequestHeader(name, headers[name]);
      }

      xhr.withCredentials = this.options.withCredentials;
    }
  }, {
    key: "_setupXHR",
    value: function _setupXHR(xhr) {
      this._xhr = xhr;

      xhr.setRequestHeader("Tus-Resumable", "1.0.0");
      var headers = this.options.headers;

      for (var name in headers) {
        xhr.setRequestHeader(name, headers[name]);
      }

      xhr.withCredentials = this.options.withCredentials;
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
      var _this4 = this;

      var ws = new WebSocket("ws://" + this.options.wsendpoint + "/ws");

      ws.onopen = function () {

        var payload = {
          method: "POST",
          headers: {}
        };

        var headers = {
          "Tus-Resumable": "1.0.0",
          "Upload-Length": _this4._size.toString()
        };

        var metadata = encodeMetadata(_this4.options.metadata);
        if (metadata !== "") {
          headers["Upload-Metadata"] = metadata;
        }

        var optionHeaders = _this4.options.headers;
        for (var name in optionHeaders) {
          headers[name] = optionHeaders[name];
        }

        payload.headers = headers;

        ws.send(JSON.stringify(payload));
      };

      ws.onerror = function (event) {
        console.log("[WS Error]", event);
        // MUST _emitXhrError (_emitWsError)
        _this4._emitError(new Error("tus: failed to create upload"));
      };

      ws.onclose = function (event) {
        console.log("[WS Closeddddd]", event);

        if (event.code != 1000) {
          // MUST _emitXhrError (_emitWsError)
          _this4._emitError(new Error("tus: closed to create upload"));
        }
      };

      ws.onmessage = function (message) {
        var response = JSON.parse(message.data);

        if (!inStatusCategory(response.status, 200)) {
          // MUST _emitXhrError (_emitWsError)
          _this4._emitError(new Error("tus: unexpected response while creating upload"));
          return;
        }

        _this4.url = response.headers["Location"];

        if (_this4.options.resume) {
          Storage.setItem(_this4._fingerprint, _this4.url);
        }

        _this4._offset = 0;
        ws.close(1000);
        _this4._startUpload();
      };
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
      var _this5 = this;

      var xhr = (0, _request.newRequest)();
      xhr.open("HEAD", this.url, true);

      xhr.onload = function () {
        if (!inStatusCategory(xhr.status, 200)) {
          if (_this5.options.resume && inStatusCategory(xhr.status, 400)) {
            // Remove stored fingerprint and corresponding endpoint,
            // on client errors since the file can not be found
            Storage.removeItem(_this5._fingerprint);
          }

          // If the upload is locked (indicated by the 423 Locked status code), we
          // emit an error instead of directly starting a new upload. This way the
          // retry logic can catch the error and will retry the upload. An upload
          // is usually locked for a short period of time and will be available
          // afterwards.
          if (xhr.status === 423) {
            _this5._emitXhrError(xhr, new Error("tus: upload is currently locked; retry later"));
            return;
          }

          // Try to create a new upload
          _this5.url = null;
          _this5._createUpload();
          return;
        }

        var offset = parseInt(xhr.getResponseHeader("Upload-Offset"), 10);
        if (isNaN(offset)) {
          _this5._emitXhrError(xhr, new Error("tus: invalid or missing offset value"));
          return;
        }

        var length = parseInt(xhr.getResponseHeader("Upload-Length"), 10);
        if (isNaN(length)) {
          _this5._emitXhrError(xhr, new Error("tus: invalid or missing length value"));
          return;
        }

        // Upload has already been completed and we do not need to send additional
        // data to the server
        if (offset === length) {
          _this5._emitProgress(length, length);
          _this5._emitSuccess();
          return;
        }

        _this5._offset = offset;
        _this5._startUpload();
      };

      xhr.onerror = function (err) {
        _this5._emitXhrError(xhr, new Error("tus: failed to resume upload"), err);
      };

      this._setupXHR(xhr);
      xhr.send(null);
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
      var _this6 = this;

      // If the upload has been aborted, we will not send the next PATCH request.
      // This is important if the abort method was called during a callback, such
      // as onChunkComplete or onProgress.
      if (this._aborted) {
        return;
      }

      var xhr = (0, _request.newRequest)();

      // Some browser and servers may not support the PATCH method. For those
      // cases, you can tell tus-js-client to use a POST request with the
      // X-HTTP-Method-Override header for simulating a PATCH request.
      if (this.options.overridePatchMethod) {
        xhr.open("POST", this.url, true);
        xhr.setRequestHeader("X-HTTP-Method-Override", "PATCH");
      } else {
        xhr.open("PATCH", this.url, true);
      }

      xhr.onload = function () {
        if (!inStatusCategory(xhr.status, 200)) {
          _this6._emitXhrError(xhr, new Error("tus: unexpected response while uploading chunk"));
          return;
        }

        var offset = parseInt(xhr.getResponseHeader("Upload-Offset"), 10);
        if (isNaN(offset)) {
          _this6._emitXhrError(xhr, new Error("tus: invalid or missing offset value"));
          return;
        }

        _this6._emitProgress(offset, _this6._size);
        _this6._emitChunkComplete(offset - _this6._offset, offset, _this6._size);

        _this6._offset = offset;

        if (offset == _this6._size) {
          // Yay, finally done :)
          _this6._emitSuccess();
          _this6._source.close();
          return;
        }

        _this6._startUpload();
      };

      xhr.onerror = function (err) {
        // Don't emit an error if the upload was aborted manually
        if (_this6._aborted) {
          return;
        }

        _this6._emitXhrError(xhr, new Error("tus: failed to upload chunk at offset " + _this6._offset), err);
      };

      // Test support for progress events before attaching an event listener
      if ("upload" in xhr) {
        xhr.upload.onprogress = function (e) {
          if (!e.lengthComputable) {
            return;
          }

          _this6._emitProgress(start + e.loaded, _this6._size);
        };
      }

      this._setupXHR(xhr);

      xhr.setRequestHeader("Upload-Offset", this._offset);
      xhr.setRequestHeader("Content-Type", "application/offset+octet-stream");

      var start = this._offset;
      var end = this._offset + this.options.chunkSize;

      // The specified chunkSize may be Infinity or the calcluated end position
      // may exceed the file's size. In both cases, we limit the end position to
      // the input's total size for simpler calculations and correctness.
      if (end === Infinity || end > this._size) {
        end = this._size;
      }

      xhr.send(this._source.slice(start, end));
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

},{"./base64":1,"./error":2,"./fingerprint":3,"./request":5,"./source":6,"./storage":7,"extend":9}],9:[function(require,module,exports){
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

},{}],10:[function(require,module,exports){
// Copyright 2014 Simon Lydell
// X11 (“MIT”) Licensed. (See LICENSE.)

void (function(root, factory) {
  if (typeof define === "function" && define.amd) {
    define(factory)
  } else if (typeof exports === "object") {
    module.exports = factory()
  } else {
    root.resolveUrl = factory()
  }
}(this, function() {

  function resolveUrl(/* ...urls */) {
    var numUrls = arguments.length

    if (numUrls === 0) {
      throw new Error("resolveUrl requires at least one argument; got none.")
    }

    var base = document.createElement("base")
    base.href = arguments[0]

    if (numUrls === 1) {
      return base.href
    }

    var head = document.getElementsByTagName("head")[0]
    head.insertBefore(base, head.firstChild)

    var a = document.createElement("a")
    var resolved

    for (var index = 1; index < numUrls; index++) {
      a.href = arguments[index]
      resolved = a.href
      base.href = resolved
    }

    head.removeChild(base)

    return resolved
  }

  return resolveUrl

}));

},{}]},{},[4])(4)
});
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJsaWIvYmFzZTY0LmpzIiwibGliL2Vycm9yLmpzIiwibGliL2ZpbmdlcnByaW50LmpzIiwibGliL2luZGV4LmpzIiwibGliL3JlcXVlc3QuanMiLCJsaWIvc291cmNlLmpzIiwibGliL3N0b3JhZ2UuanMiLCJsaWIvdXBsb2FkLmpzIiwibm9kZV9tb2R1bGVzL2V4dGVuZC9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yZXNvbHZlLXVybC9yZXNvbHZlLXVybC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQTs7Ozs7O1FDSWdCLE0sR0FBQSxNO0FBSmhCOztjQUVlLE07SUFBUixJLFdBQUEsSTtBQUVBLFNBQVMsTUFBVCxDQUFnQixJQUFoQixFQUFzQjtBQUMzQixTQUFPLEtBQUssU0FBUyxtQkFBbUIsSUFBbkIsQ0FBVCxDQUFMLENBQVA7QUFDRDs7QUFFTSxJQUFNLG9DQUFjLFVBQVUsTUFBOUI7Ozs7Ozs7Ozs7Ozs7OztJQ1JELGE7OztBQUNKLHlCQUFZLEtBQVosRUFBa0Q7QUFBQSxRQUEvQixVQUErQix1RUFBbEIsSUFBa0I7QUFBQSxRQUFaLEdBQVksdUVBQU4sSUFBTTs7QUFBQTs7QUFBQSw4SEFDMUMsTUFBTSxPQURvQzs7QUFHaEQsVUFBSyxlQUFMLEdBQXVCLEdBQXZCO0FBQ0EsVUFBSyxZQUFMLEdBQW9CLFVBQXBCOztBQUVBLFFBQUksVUFBVSxNQUFNLE9BQXBCO0FBQ0EsUUFBSSxjQUFjLElBQWxCLEVBQXdCO0FBQ3RCLGtDQUEwQixXQUFXLFFBQVgsRUFBMUI7QUFDRDtBQUNELFFBQUksT0FBTyxJQUFYLEVBQWlCO0FBQ2YsZ0VBQXdELElBQUksTUFBNUQseUJBQXNGLElBQUksWUFBMUY7QUFDRDtBQUNELFVBQUssT0FBTCxHQUFlLE9BQWY7QUFiZ0Q7QUFjakQ7OztFQWZ5QixLOztrQkFrQmIsYTs7Ozs7Ozs7a0JDWlMsVztBQU54Qjs7Ozs7O0FBTWUsU0FB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QUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDdEZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQSIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIvKiBnbG9iYWw6IHdpbmRvdyAqL1xuXG5jb25zdCB7YnRvYX0gPSB3aW5kb3c7XG5cbmV4cG9ydCBmdW5jdGlvbiBlbmNvZGUoZGF0YSkge1xuICByZXR1cm4gYnRvYSh1bmVzY2FwZShlbmNvZGVVUklDb21wb25lbnQoZGF0YSkpKTtcbn1cblxuZXhwb3J0IGNvbnN0IGlzU3VwcG9ydGVkID0gXCJidG9hXCIgaW4gd2luZG93O1xuIiwiY2xhc3MgRGV0YWlsZWRFcnJvciBleHRlbmRzIEVycm9yIHtcbiAgY29uc3RydWN0b3IoZXJyb3IsIGNhdXNpbmdFcnIgPSBudWxsLCB4aHIgPSBudWxsKSB7XG4gICAgc3VwZXIoZXJyb3IubWVzc2FnZSk7XG5cbiAgICB0aGlzLm9yaWdpbmFsUmVxdWVzdCA9IHhocjtcbiAgICB0aGlzLmNhdXNpbmdFcnJvciA9IGNhdXNpbmdFcnI7XG5cbiAgICBsZXQgbWVzc2FnZSA9IGVycm9yLm1lc3NhZ2U7XG4gICAgaWYgKGNhdXNpbmdFcnIgIT0gbnVsbCkge1xuICAgICAgbWVzc2FnZSArPSBgLCBjYXVzZWQgYnkgJHtjYXVzaW5nRXJyLnRvU3RyaW5nKCl9YDtcbiAgICB9XG4gICAgaWYgKHhociAhPSBudWxsKSB7XG4gICAgICBtZXNzYWdlICs9IGAsIG9yaWdpbmF0ZWQgZnJvbSByZXF1ZXN0IChyZXNwb25zZSBjb2RlOiAke3hoci5zdGF0dXN9LCByZXNwb25zZSB0ZXh0OiAke3hoci5yZXNwb25zZVRleHR9KWA7XG4gICAgfVxuICAgIHRoaXMubWVzc2FnZSA9IG1lc3NhZ2U7XG4gIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgRGV0YWlsZWRFcnJvcjtcbiIsIi8qKlxuICogR2VuZXJhdGUgYSBmaW5nZXJwcmludCBmb3IgYSBmaWxlIHdoaWNoIHdpbGwgYmUgdXNlZCB0aGUgc3RvcmUgdGhlIGVuZHBvaW50XG4gKlxuICogQHBhcmFtIHtGaWxlfSBmaWxlXG4gKiBAcmV0dXJuIHtTdHJpbmd9XG4gKi9cbmV4cG9ydCBkZWZhdWx0IGZ1bmN0aW9uIGZpbmdlcnByaW50KGZpbGUpIHtcbiAgcmV0dXJuIFtcblx0XHRcInR1c1wiLFxuXHRcdGZpbGUubmFtZSxcblx0XHRmaWxlLnR5cGUsXG5cdFx0ZmlsZS5zaXplLFxuXHRcdGZpbGUubGFzdE1vZGlmaWVkXG4gIF0uam9pbihcIi1cIik7XG59XG4iLCIvKiBnbG9iYWwgd2luZG93ICovXG5pbXBvcnQgVXBsb2FkIGZyb20gXCIuL3VwbG9hZFwiO1xuaW1wb3J0IHtjYW5TdG9yZVVSTHN9IGZyb20gXCIuL3N0b3JhZ2VcIjtcblxuY29uc3Qge2RlZmF1bHRPcHRpb25zfSA9IFVwbG9hZDtcblxuaWYgKHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIpIHtcbiAgLy8gQnJvd3NlciBlbnZpcm9ubWVudCB1c2luZyBYTUxIdHRwUmVxdWVzdFxuICBjb25zdCB7WE1MSHR0cFJlcXVlc3QsIEJsb2J9ID0gd2luZG93O1xuXG4gIHZhciBpc1N1cHBvcnRlZCA9IChcbiAgICBYTUxIdHRwUmVxdWVzdCAmJlxuICAgIEJsb2IgJiZcbiAgICB0eXBlb2YgQmxvYi5wcm90b3R5cGUuc2xpY2UgPT09IFwiZnVuY3Rpb25cIlxuICApO1xufSBlbHNlIHtcbiAgLy8gTm9kZS5qcyBlbnZpcm9ubWVudCB1c2luZyBodHRwIG1vZHVsZVxuICB2YXIgaXNTdXBwb3J0ZWQgPSB0cnVlO1xufVxuXG4vLyBUaGUgdXNhZ2Ugb2YgdGhlIGNvbW1vbmpzIGV4cG9ydGluZyBzeW50YXggaW5zdGVhZCBvZiB0aGUgbmV3IEVDTUFTY3JpcHRcbi8vIG9uZSBpcyBhY3R1YWxseSBpbnRlZGVkIGFuZCBwcmV2ZW50cyB3ZWlyZCBiZWhhdmlvdXIgaWYgd2UgYXJlIHRyeWluZyB0b1xuLy8gaW1wb3J0IHRoaXMgbW9kdWxlIGluIGFub3RoZXIgbW9kdWxlIHVzaW5nIEJhYmVsLlxubW9kdWxlLmV4cG9ydHMgPSB7XG4gIFVwbG9hZCxcbiAgaXNTdXBwb3J0ZWQsXG4gIGNhblN0b3JlVVJMcyxcbiAgZGVmYXVsdE9wdGlvbnNcbn07XG4iLCIvKiBnbG9iYWwgd2luZG93ICovXG5pbXBvcnQgcmVzb2x2ZSBmcm9tIFwicmVzb2x2ZS11cmxcIjtcblxuZXhwb3J0IGZ1bmN0aW9uIG5ld1JlcXVlc3QoKSB7XG4gIHJldHVybiBuZXcgd2luZG93LlhNTEh0dHBSZXF1ZXN0KCk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiByZXNvbHZlVXJsKG9yaWdpbiwgbGluaykge1xuICByZXR1cm4gcmVzb2x2ZShvcmlnaW4sIGxpbmspO1xufVxuIiwiY2xhc3MgRmlsZVNvdXJjZSB7XG4gIGNvbnN0cnVjdG9yKGZpbGUpIHtcbiAgICB0aGlzLl9maWxlID0gZmlsZTtcbiAgICB0aGlzLnNpemUgPSBmaWxlLnNpemU7XG4gIH1cblxuICBzbGljZShzdGFydCwgZW5kKSB7XG4gICAgcmV0dXJuIHRoaXMuX2ZpbGUuc2xpY2Uoc3RhcnQsIGVuZCk7XG4gIH1cblxuICBjbG9zZSgpIHt9XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTb3VyY2UoaW5wdXQpIHtcbiAgLy8gU2luY2Ugd2UgZW11bGF0ZSB0aGUgQmxvYiB0eXBlIGluIG91ciB0ZXN0cyAobm90IGFsbCB0YXJnZXQgYnJvd3NlcnNcbiAgLy8gc3VwcG9ydCBpdCksIHdlIGNhbm5vdCB1c2UgYGluc3RhbmNlb2ZgIGZvciB0ZXN0aW5nIHdoZXRoZXIgdGhlIGlucHV0IHZhbHVlXG4gIC8vIGNhbiBiZSBoYW5kbGVkLiBJbnN0ZWFkLCB3ZSBzaW1wbHkgY2hlY2sgaXMgdGhlIHNsaWNlKCkgZnVuY3Rpb24gYW5kIHRoZVxuICAvLyBzaXplIHByb3BlcnR5IGFyZSBhdmFpbGFibGUuXG4gIGlmICh0eXBlb2YgaW5wdXQuc2xpY2UgPT09IFwiZnVuY3Rpb25cIiAmJiB0eXBlb2YgaW5wdXQuc2l6ZSAhPT0gXCJ1bmRlZmluZWRcIikge1xuICAgIHJldHVybiBuZXcgRmlsZVNvdXJjZShpbnB1dCk7XG4gIH1cblxuICB0aHJvdyBuZXcgRXJyb3IoXCJzb3VyY2Ugb2JqZWN0IG1heSBvbmx5IGJlIGFuIGluc3RhbmNlIG9mIEZpbGUgb3IgQmxvYiBpbiB0aGlzIGVudmlyb25tZW50XCIpO1xufVxuIiwiLyogZ2xvYmFsIHdpbmRvdywgbG9jYWxTdG9yYWdlICovXG5cbmxldCBoYXNTdG9yYWdlID0gZmFsc2U7XG50cnkge1xuICBoYXNTdG9yYWdlID0gXCJsb2NhbFN0b3JhZ2VcIiBpbiB3aW5kb3c7XG5cbiAgLy8gQXR0ZW1wdCB0byBzdG9yZSBhbmQgcmVhZCBlbnRyaWVzIGZyb20gdGhlIGxvY2FsIHN0b3JhZ2UgdG8gZGV0ZWN0IFByaXZhdGVcbiAgLy8gTW9kZSBvbiBTYWZhcmkgb24gaU9TIChzZWUgIzQ5KVxuICB2YXIga2V5ID0gXCJ0dXNTdXBwb3J0XCI7XG4gIGxvY2FsU3RvcmFnZS5zZXRJdGVtKGtleSwgbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KSk7XG5cbn0gY2F0Y2ggKGUpIHtcbiAgLy8gSWYgd2UgdHJ5IHRvIGFjY2VzcyBsb2NhbFN0b3JhZ2UgaW5zaWRlIGEgc2FuZGJveGVkIGlmcmFtZSwgYSBTZWN1cml0eUVycm9yXG4gIC8vIGlzIHRocm93bi4gV2hlbiBpbiBwcml2YXRlIG1vZGUgb24gaU9TIFNhZmFyaSwgYSBRdW90YUV4Y2VlZGVkRXJyb3IgaXNcbiAgLy8gdGhyb3duIChzZWUgIzQ5KVxuICBpZiAoZS5jb2RlID09PSBlLlNFQ1VSSVRZX0VSUiB8fCBlLmNvZGUgPT09IGUuUVVPVEFfRVhDRUVERURfRVJSKSB7XG4gICAgaGFzU3RvcmFnZSA9IGZhbHNlO1xuICB9IGVsc2Uge1xuICAgIHRocm93IGU7XG4gIH1cbn1cblxuZXhwb3J0IGNvbnN0IGNhblN0b3JlVVJMcyA9IGhhc1N0b3JhZ2U7XG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRJdGVtKGtleSwgdmFsdWUpIHtcbiAgaWYgKCFoYXNTdG9yYWdlKSByZXR1cm47XG4gIHJldHVybiBsb2NhbFN0b3JhZ2Uuc2V0SXRlbShrZXksIHZhbHVlKTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIGdldEl0ZW0oa2V5KSB7XG4gIGlmICghaGFzU3RvcmFnZSkgcmV0dXJuO1xuICByZXR1cm4gbG9jYWxTdG9yYWdlLmdldEl0ZW0oa2V5KTtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHJlbW92ZUl0ZW0oa2V5KSB7XG4gIGlmICghaGFzU3RvcmFnZSkgcmV0dXJuO1xuICByZXR1cm4gbG9jYWxTdG9yYWdlLnJlbW92ZUl0ZW0oa2V5KTtcbn1cbiIsIi8qIGdsb2JhbCB3aW5kb3cgKi9cbmltcG9ydCBmaW5nZXJwcmludCBmcm9tIFwiLi9maW5nZXJwcmludFwiO1xuaW1wb3J0IERldGFpbGVkRXJyb3IgZnJvbSBcIi4vZXJyb3JcIjtcbmltcG9ydCBleHRlbmQgZnJvbSBcImV4dGVuZFwiO1xuXG4vLyBXZSBpbXBvcnQgdGhlIGZpbGVzIHVzZWQgaW5zaWRlIHRoZSBOb2RlIGVudmlyb25tZW50IHdoaWNoIGFyZSByZXdyaXR0ZW5cbi8vIGZvciBicm93c2VycyB1c2luZyB0aGUgcnVsZXMgZGVmaW5lZCBpbiB0aGUgcGFja2FnZS5qc29uXG5pbXBvcnQge25ld1JlcXVlc3R9IGZyb20gXCIuL3JlcXVlc3RcIjtcbmltcG9ydCB7Z2V0U291cmNlfSBmcm9tIFwiLi9zb3VyY2VcIjtcbmltcG9ydCAqIGFzIEJhc2U2NCBmcm9tIFwiLi9iYXNlNjRcIjtcbmltcG9ydCAqIGFzIFN0b3JhZ2UgZnJvbSBcIi4vc3RvcmFnZVwiO1xuXG5jb25zdCBkZWZhdWx0T3B0aW9ucyA9IHtcbiAgZW5kcG9pbnQ6IFwiXCIsXG4gIHdzZW5kcG9pbnQ6IFwiXCIsXG4gIGZpbmdlcnByaW50LFxuICByZXN1bWU6IHRydWUsXG4gIG9uUHJvZ3Jlc3M6IG51bGwsXG4gIG9uQ2h1bmtDb21wbGV0ZTogbnVsbCxcbiAgb25TdWNjZXNzOiBudWxsLFxuICBvbkVycm9yOiBudWxsLFxuICBvbkNhbmNlbFN1Y2Nlc3M6IG51bGwsXG4gIG9uQ2FuY2VsRXJyb3I6IG51bGwsXG4gIGhlYWRlcnM6IHt9LFxuICBjaHVua1NpemU6IEluZmluaXR5LFxuICB3aXRoQ3JlZGVudGlhbHM6IGZhbHNlLFxuICB1cGxvYWRVcmw6IG51bGwsXG4gIHVwbG9hZFNpemU6IG51bGwsXG4gIG92ZXJyaWRlUGF0Y2hNZXRob2Q6IGZhbHNlLFxuICByZXRyeURlbGF5czogbnVsbFxufTtcblxuY2xhc3MgVXBsb2FkIHtcbiAgY29uc3RydWN0b3IoZmlsZSwgb3B0aW9ucykge1xuICAgIHRoaXMub3B0aW9ucyA9IGV4dGVuZCh0cnVlLCB7fSwgZGVmYXVsdE9wdGlvbnMsIG9wdGlvbnMpO1xuXG4gICAgLy8gVGhlIHVuZGVybHlpbmcgRmlsZS9CbG9iIG9iamVjdFxuICAgIHRoaXMuZmlsZSA9IGZpbGU7XG5cbiAgICAvLyBUaGUgVVJMIGFnYWluc3Qgd2hpY2ggdGhlIGZpbGUgd2lsbCBiZSB1cGxvYWRlZFxuICAgIHRoaXMudXJsID0gbnVsbDtcblxuICAgIC8vIFRoZSB1bmRlcmx5aW5nIFhIUiBvYmplY3QgZm9yIHRoZSBjdXJyZW50IFBBVENIIHJlcXVlc3RcbiAgICB0aGlzLl94aHIgPSBudWxsO1xuXG4gICAgLy8gVGhlIGZpbmdlcnBpbnJ0IGZvciB0aGUgY3VycmVudCBmaWxlIChzZXQgYWZ0ZXIgc3RhcnQoKSlcbiAgICB0aGlzLl9maW5nZXJwcmludCA9IG51bGw7XG5cbiAgICAvLyBUaGUgb2Zmc2V0IHVzZWQgaW4gdGhlIGN1cnJlbnQgUEFUQ0ggcmVxdWVzdFxuICAgIHRoaXMuX29mZnNldCA9IG51bGw7XG5cbiAgICAvLyBUcnVlIGlmIHRoZSBjdXJyZW50IFBBVENIIHJlcXVlc3QgaGFzIGJlZW4gYWJvcnRlZFxuICAgIHRoaXMuX2Fib3J0ZWQgPSBmYWxzZTtcblxuICAgIC8vIFRoZSBmaWxlJ3Mgc2l6ZSBpbiBieXRlc1xuICAgIHRoaXMuX3NpemUgPSBudWxsO1xuXG4gICAgLy8gVGhlIFNvdXJjZSBvYmplY3Qgd2hpY2ggd2lsbCB3cmFwIGFyb3VuZCB0aGUgZ2l2ZW4gZmlsZSBhbmQgcHJvdmlkZXMgdXNcbiAgICAvLyB3aXRoIGEgdW5pZmllZCBpbnRlcmZhY2UgZm9yIGdldHRpbmcgaXRzIHNpemUgYW5kIHNsaWNlIGNodW5rcyBmcm9tIGl0c1xuICAgIC8vIGNvbnRlbnQgYWxsb3dpbmcgdXMgdG8gZWFzaWx5IGhhbmRsZSBGaWxlcywgQmxvYnMsIEJ1ZmZlcnMgYW5kIFN0cmVhbXMuXG4gICAgdGhpcy5fc291cmNlID0gbnVsbDtcblxuICAgIC8vIFRoZSBjdXJyZW50IGNvdW50IG9mIGF0dGVtcHRzIHdoaWNoIGhhdmUgYmVlbiBtYWRlLiBOdWxsIGluZGljYXRlcyBub25lLlxuICAgIHRoaXMuX3JldHJ5QXR0ZW1wdCA9IDA7XG5cbiAgICAvLyBUaGUgdGltZW91dCdzIElEIHdoaWNoIGlzIHVzZWQgdG8gZGVsYXkgdGhlIG5leHQgcmV0cnlcbiAgICB0aGlzLl9yZXRyeVRpbWVvdXQgPSBudWxsO1xuXG4gICAgLy8gVGhlIG9mZnNldCBvZiB0aGUgcmVtb3RlIHVwbG9hZCBiZWZvcmUgdGhlIGxhdGVzdCBhdHRlbXB0IHdhcyBzdGFydGVkLlxuICAgIHRoaXMuX29mZnNldEJlZm9yZVJldHJ5ID0gMDtcbiAgfVxuXG4gIHN0YXJ0KCkge1xuICAgIGxldCBmaWxlID0gdGhpcy5maWxlO1xuXG4gICAgaWYgKCFmaWxlKSB7XG4gICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiBubyBmaWxlIG9yIHN0cmVhbSB0byB1cGxvYWQgcHJvdmlkZWRcIikpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5vcHRpb25zLndzZW5kcG9pbnQpIHtcbiAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IG5vIHdzZW5kcG9pbnQgcHJvdmlkZWRcIikpO1xuICAgICAgcmV0dXJuO1xuICAgIH1cblxuICAgIGlmICghdGhpcy5vcHRpb25zLmVuZHBvaW50KSB7XG4gICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiBubyBlbmRwb2ludCBwcm92aWRlZFwiKSk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHNvdXJjZSA9IHRoaXMuX3NvdXJjZSA9IGdldFNvdXJjZShmaWxlLCB0aGlzLm9wdGlvbnMuY2h1bmtTaXplKTtcblxuICAgIC8vIEZpcnN0bHksIGNoZWNrIGlmIHRoZSBjYWxsZXIgaGFzIHN1cHBsaWVkIGEgbWFudWFsIHVwbG9hZCBzaXplIG9yIGVsc2VcbiAgICAvLyB3ZSB3aWxsIHVzZSB0aGUgY2FsY3VsYXRlZCBzaXplIGJ5IHRoZSBzb3VyY2Ugb2JqZWN0LlxuICAgIGlmICh0aGlzLm9wdGlvbnMudXBsb2FkU2l6ZSAhPSBudWxsKSB7XG4gICAgICBsZXQgc2l6ZSA9ICt0aGlzLm9wdGlvbnMudXBsb2FkU2l6ZTtcbiAgICAgIGlmIChpc05hTihzaXplKSkge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0dXM6IGNhbm5vdCBjb252ZXJ0IGB1cGxvYWRTaXplYCBvcHRpb24gaW50byBhIG51bWJlclwiKTtcbiAgICAgIH1cblxuICAgICAgdGhpcy5fc2l6ZSA9IHNpemU7XG4gICAgfSBlbHNlIHtcbiAgICAgIGxldCBzaXplID0gc291cmNlLnNpemU7XG5cbiAgICAgIC8vIFRoZSBzaXplIHByb3BlcnR5IHdpbGwgYmUgbnVsbCBpZiB3ZSBjYW5ub3QgY2FsY3VsYXRlIHRoZSBmaWxlJ3Mgc2l6ZSxcbiAgICAgIC8vIGZvciBleGFtcGxlIGlmIHlvdSBoYW5kbGUgYSBzdHJlYW0uXG4gICAgICBpZiAoc2l6ZSA9PSBudWxsKSB7XG4gICAgICAgIHRocm93IG5ldyBFcnJvcihcInR1czogY2Fubm90IGF1dG9tYXRpY2FsbHkgZGVyaXZlIHVwbG9hZCdzIHNpemUgZnJvbSBpbnB1dCBhbmQgbXVzdCBiZSBzcGVjaWZpZWQgbWFudWFsbHkgdXNpbmcgdGhlIGB1cGxvYWRTaXplYCBvcHRpb25cIik7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX3NpemUgPSBzaXplO1xuICAgIH1cblxuICAgIGxldCByZXRyeURlbGF5cyA9IHRoaXMub3B0aW9ucy5yZXRyeURlbGF5cztcbiAgICBpZiAocmV0cnlEZWxheXMgIT0gbnVsbCkge1xuICAgICAgaWYgKE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbChyZXRyeURlbGF5cykgIT09IFwiW29iamVjdCBBcnJheV1cIikge1xuICAgICAgICB0aHJvdyBuZXcgRXJyb3IoXCJ0dXM6IHRoZSBgcmV0cnlEZWxheXNgIG9wdGlvbiBtdXN0IGVpdGhlciBiZSBhbiBhcnJheSBvciBudWxsXCIpO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgbGV0IGVycm9yQ2FsbGJhY2sgPSB0aGlzLm9wdGlvbnMub25FcnJvcjtcbiAgICAgICAgdGhpcy5vcHRpb25zLm9uRXJyb3IgPSAoZXJyKSA9PiB7XG4gICAgICAgICAgLy8gUmVzdG9yZSB0aGUgb3JpZ2luYWwgZXJyb3IgY2FsbGJhY2sgd2hpY2ggbWF5IGhhdmUgYmVlbiBzZXQuXG4gICAgICAgICAgdGhpcy5vcHRpb25zLm9uRXJyb3IgPSBlcnJvckNhbGxiYWNrO1xuXG4gICAgICAgICAgLy8gV2Ugd2lsbCByZXNldCB0aGUgYXR0ZW1wdCBjb3VudGVyIGlmXG4gICAgICAgICAgLy8gLSB3ZSB3ZXJlIGFscmVhZHkgYWJsZSB0byBjb25uZWN0IHRvIHRoZSBzZXJ2ZXIgKG9mZnNldCAhPSBudWxsKSBhbmRcbiAgICAgICAgICAvLyAtIHdlIHdlcmUgYWJsZSB0byB1cGxvYWQgYSBzbWFsbCBjaHVuayBvZiBkYXRhIHRvIHRoZSBzZXJ2ZXJcbiAgICAgICAgICBsZXQgc2hvdWxkUmVzZXREZWxheXMgPSB0aGlzLl9vZmZzZXQgIT0gbnVsbCAmJiAodGhpcy5fb2Zmc2V0ID4gdGhpcy5fb2Zmc2V0QmVmb3JlUmV0cnkpO1xuICAgICAgICAgIGlmIChzaG91bGRSZXNldERlbGF5cykge1xuICAgICAgICAgICAgdGhpcy5fcmV0cnlBdHRlbXB0ID0gMDtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgaXNPbmxpbmUgPSB0cnVlO1xuICAgICAgICAgIGlmICh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiICYmXG4gICAgICAgICAgICAgXCJuYXZpZ2F0b3JcIiBpbiB3aW5kb3cgJiZcbiAgICAgICAgICAgICB3aW5kb3cubmF2aWdhdG9yLm9uTGluZSA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgICAgIGlzT25saW5lID0gZmFsc2U7XG4gICAgICAgICAgICAgfVxuXG4gICAgICAgICAgLy8gV2Ugb25seSBhdHRlbXB0IGEgcmV0cnkgaWZcbiAgICAgICAgICAvLyAtIHdlIGRpZG4ndCBleGNlZWQgdGhlIG1heGl1bSBudW1iZXIgb2YgcmV0cmllcywgeWV0LCBhbmRcbiAgICAgICAgICAvLyAtIHRoaXMgZXJyb3Igd2FzIGNhdXNlZCBieSBhIHJlcXVlc3Qgb3IgaXQncyByZXNwb25zZSBhbmRcbiAgICAgICAgICAvLyAtIHRoZSBlcnJvciBpcyBub3QgYSBjbGllbnQgZXJyb3IgKHN0YXR1cyA0eHgpIGFuZFxuICAgICAgICAgIC8vIC0gdGhlIGJyb3dzZXIgZG9lcyBub3QgaW5kaWNhdGUgdGhhdCB3ZSBhcmUgb2ZmbGluZVxuICAgICAgICAgIGxldCBzaG91bGRSZXRyeSA9IHRoaXMuX3JldHJ5QXR0ZW1wdCA8IHJldHJ5RGVsYXlzLmxlbmd0aCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIGVyci5vcmlnaW5hbFJlcXVlc3QgIT0gbnVsbCAmJlxuICAgICAgICAgICAgICAgICAgICAgICAgICAgICFpblN0YXR1c0NhdGVnb3J5KGVyci5vcmlnaW5hbFJlcXVlc3Quc3RhdHVzLCA0MDApICYmXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgaXNPbmxpbmU7XG5cbiAgICAgICAgICBpZiAoIXNob3VsZFJldHJ5KSB7XG4gICAgICAgICAgICB0aGlzLl9lbWl0RXJyb3IoZXJyKTtcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgICB9XG5cbiAgICAgICAgICBsZXQgZGVsYXkgPSByZXRyeURlbGF5c1t0aGlzLl9yZXRyeUF0dGVtcHQrK107XG5cbiAgICAgICAgICB0aGlzLl9vZmZzZXRCZWZvcmVSZXRyeSA9IHRoaXMuX29mZnNldDtcbiAgICAgICAgICB0aGlzLm9wdGlvbnMudXBsb2FkVXJsID0gdGhpcy51cmw7XG5cbiAgICAgICAgICB0aGlzLl9yZXRyeVRpbWVvdXQgPSBzZXRUaW1lb3V0KCgpID0+IHtcbiAgICAgICAgICAgIHRoaXMuc3RhcnQoKTtcbiAgICAgICAgICB9LCBkZWxheSk7XG4gICAgICAgIH07XG4gICAgICB9XG4gICAgfVxuXG4gICAgLy8gUmVzZXQgdGhlIGFib3J0ZWQgZmxhZyB3aGVuIHRoZSB1cGxvYWQgaXMgc3RhcnRlZCBvciBlbHNlIHRoZVxuICAgIC8vIF9zdGFydFVwbG9hZCB3aWxsIHN0b3AgYmVmb3JlIHNlbmRpbmcgYSByZXF1ZXN0IGlmIHRoZSB1cGxvYWQgaGFzIGJlZW5cbiAgICAvLyBhYm9ydGVkIHByZXZpb3VzbHkuXG4gICAgdGhpcy5fYWJvcnRlZCA9IGZhbHNlO1xuXG4gICAgLy8gVGhlIHVwbG9hZCBoYWQgYmVlbiBzdGFydGVkIHByZXZpb3VzbHkgYW5kIHdlIHNob3VsZCByZXVzZSB0aGlzIFVSTC5cbiAgICBpZiAodGhpcy51cmwgIT0gbnVsbCkge1xuICAgICAgdGhpcy5fcmVzdW1lVXBsb2FkKCk7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gQSBVUkwgaGFzIG1hbnVhbGx5IGJlZW4gc3BlY2lmaWVkLCBzbyB3ZSB0cnkgdG8gcmVzdW1lXG4gICAgaWYgKHRoaXMub3B0aW9ucy51cGxvYWRVcmwgIT0gbnVsbCkge1xuICAgICAgICB0aGlzLnVybCA9IHRoaXMub3B0aW9ucy51cGxvYWRVcmw7XG4gICAgICAgIHRoaXMuX3Jlc3VtZVVwbG9hZCgpO1xuICAgICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgLy8gVHJ5IHRvIGZpbmQgdGhlIGVuZHBvaW50IGZvciB0aGUgZmlsZSBpbiB0aGUgc3RvcmFnZVxuICAgIGlmICh0aGlzLm9wdGlvbnMucmVzdW1lKSB7XG4gICAgICAgIHRoaXMuX2ZpbmdlcnByaW50ID0gdGhpcy5vcHRpb25zLmZpbmdlcnByaW50KGZpbGUpO1xuICAgICAgICBsZXQgcmVzdW1lZFVybCA9IFN0b3JhZ2UuZ2V0SXRlbSh0aGlzLl9maW5nZXJwcmludCk7XG5cbiAgICAgICAgaWYgKHJlc3VtZWRVcmwgIT0gbnVsbCkge1xuICAgICAgICAgICAgdGhpcy51cmwgPSByZXN1bWVkVXJsO1xuICAgICAgICAgICAgdGhpcy5fcmVzdW1lVXBsb2FkKCk7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyBBbiB1cGxvYWQgaGFzIG5vdCBzdGFydGVkIGZvciB0aGUgZmlsZSB5ZXQsIHNvIHdlIHN0YXJ0IGEgbmV3IG9uZVxuICAgIHRoaXMuX2NyZWF0ZVVwbG9hZCgpO1xuICB9XG5cbiAgYWJvcnQoKSB7XG4gICAgaWYgKHRoaXMuX3hociAhPT0gbnVsbCkge1xuICAgICAgdGhpcy5feGhyLmFib3J0KCk7XG4gICAgICB0aGlzLl9zb3VyY2UuY2xvc2UoKTtcbiAgICAgIHRoaXMuX2Fib3J0ZWQgPSB0cnVlO1xuICAgIH1cblxuICAgIGlmICh0aGlzLl9yZXRyeVRpbWVvdXQgIT0gbnVsbCkge1xuICAgICAgY2xlYXJUaW1lb3V0KHRoaXMuX3JldHJ5VGltZW91dCk7XG4gICAgICB0aGlzLl9yZXRyeVRpbWVvdXQgPSBudWxsO1xuICAgIH1cbiAgfVxuXG4gIGNhbmNlbCgpIHtcbiAgICBpZiAodGhpcy5feGhyICE9IG51bGwgJiYgdGhpcy5fYWJvcnRlZCA9PSBmYWxzZSkge1xuICAgICAgdGhpcy5feGhyLm9uYWJvcnQgPSAoKSA9PiB7XG4gICAgICAgIHRoaXMuX2NhbmNlbFVwbG9hZCgpO1xuICAgICAgfTtcbiAgICAgIHRoaXMuYWJvcnQoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgdGhpcy5fY2FuY2VsVXBsb2FkKCk7XG4gICAgfVxuICB9XG5cbiAgLyoqXG4gICogQ2FuY2VsIHVwbG9hZCB1c2luZyB0aGUgZGVsZXRlIGV4dGVuc2lvbiBieSBzZW5kaW5nIGEgREVMRVRFXG4gICogcmVxdWVzdCB0byB0aGUgdXBsb2FkVXJsLlxuICAqXG4gICogQGFwaSBwcml2YXRlXG4gICovXG4gIF9jYW5jZWxVcGxvYWQoKSB7XG4gICAgbGV0IHhociA9IG5ld1JlcXVlc3QoKTtcbiAgICB4aHIub3BlbihcIkRFTEVURVwiLCB0aGlzLnVybCwgdHJ1ZSk7XG5cbiAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuICAgICAgaWYgKCFpblN0YXR1c0NhdGVnb3J5KHhoci5zdGF0dXMsIDIwMCkpIHtcbiAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDQyMykge1xuICAgICAgICAgIHRoaXMuX2NhbmNlbFVwbG9hZCgpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgICBpZiAoaW5TdGF0dXNDYXRlZ29yeSh4aHIuc3RhdHVzLCA0MDApKSB7XG4gICAgICAgICAgU3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMuX2ZpbmdlcnByaW50KTtcbiAgICAgICAgICB0aGlzLl9lbWl0Q2FuY2VsU3VjY2VzcygpO1xuICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgU3RvcmFnZS5yZW1vdmVJdGVtKHRoaXMuX2ZpbmdlcnByaW50KTtcbiAgICAgIHRoaXMuX2VtaXRDYW5jZWxTdWNjZXNzKCk7XG4gICAgICByZXR1cm47XG4gICAgfTtcblxuICAgIHhoci5vbmVycm9yID0gKGVycikgPT4ge1xuICAgICAgdGhpcy5fZW1pdFhockNhbmNlbEVycm9yKHhociwgbmV3IEVycm9yKFwidHVzOiBmYWlsZWQgdG8gY2FuY2VsIHVwbG9hZFwiKSwgZXJyKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fc2V0dXBYSFIoeGhyKTtcbiAgICB4aHIuc2VuZChudWxsKTtcbiAgfVxuXG4gIF9lbWl0WGhyQ2FuY2VsRXJyb3IoeGhyLCBlcnIsIGNhdXNpbmdFcnIpIHtcbiAgICB0aGlzLl9lbWl0Q2FuY2VsRXJyb3IobmV3IERldGFpbGVkRXJyb3IoZXJyLCBjYXVzaW5nRXJyLCB4aHIpKTtcbiAgfVxuXG4gIF9lbWl0Q2FuY2VsRXJyb3IoZXJyKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25FcnJvciA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aGlzLm9wdGlvbnMub25DYW5jZWxFcnJvcihlcnIpO1xuICAgIH0gZWxzZSB7XG4gICAgICB0aHJvdyBlcnI7XG4gICAgfVxuICB9XG5cbiAgX2VtaXRDYW5jZWxTdWNjZXNzKCkge1xuICAgIGlmICh0eXBlb2YgdGhpcy5vcHRpb25zLm9uQ2FuY2VsU3VjY2VzcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aGlzLm9wdGlvbnMub25DYW5jZWxTdWNjZXNzKCk7XG4gICAgfVxuICB9XG5cbiAgX2VtaXRYaHJFcnJvcih4aHIsIGVyciwgY2F1c2luZ0Vycikge1xuICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRGV0YWlsZWRFcnJvcihlcnIsIGNhdXNpbmdFcnIsIHhocikpO1xuICB9XG5cbiAgX2VtaXRFcnJvcihlcnIpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkVycm9yID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5vbkVycm9yKGVycik7XG4gICAgfSBlbHNlIHtcbiAgICAgIHRocm93IGVycjtcbiAgICB9XG4gIH1cblxuICBfZW1pdFN1Y2Nlc3MoKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25TdWNjZXNzID09PSBcImZ1bmN0aW9uXCIpIHtcbiAgICAgIHRoaXMub3B0aW9ucy5vblN1Y2Nlc3MoKTtcbiAgICB9XG4gIH1cblxuICAvKipcbiAgICogUHVibGlzaGVzIG5vdGlmaWNhdGlvbiB3aGVuIGRhdGEgaGFzIGJlZW4gc2VudCB0byB0aGUgc2VydmVyLiBUaGlzXG4gICAqIGRhdGEgbWF5IG5vdCBoYXZlIGJlZW4gYWNjZXB0ZWQgYnkgdGhlIHNlcnZlciB5ZXQuXG4gICAqIEBwYXJhbSAge251bWJlcn0gYnl0ZXNTZW50ICBOdW1iZXIgb2YgYnl0ZXMgc2VudCB0byB0aGUgc2VydmVyLlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGJ5dGVzVG90YWwgVG90YWwgbnVtYmVyIG9mIGJ5dGVzIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAgICovXG4gIF9lbWl0UHJvZ3Jlc3MoYnl0ZXNTZW50LCBieXRlc1RvdGFsKSB7XG4gICAgaWYgKHR5cGVvZiB0aGlzLm9wdGlvbnMub25Qcm9ncmVzcyA9PT0gXCJmdW5jdGlvblwiKSB7XG4gICAgICB0aGlzLm9wdGlvbnMub25Qcm9ncmVzcyhieXRlc1NlbnQsIGJ5dGVzVG90YWwpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBQdWJsaXNoZXMgbm90aWZpY2F0aW9uIHdoZW4gYSBjaHVuayBvZiBkYXRhIGhhcyBiZWVuIHNlbnQgdG8gdGhlIHNlcnZlclxuICAgKiBhbmQgYWNjZXB0ZWQgYnkgdGhlIHNlcnZlci5cbiAgICogQHBhcmFtICB7bnVtYmVyfSBjaHVua1NpemUgIFNpemUgb2YgdGhlIGNodW5rIHRoYXQgd2FzIGFjY2VwdGVkIGJ5IHRoZVxuICAgKiAgICAgICAgICAgICAgICAgICAgICAgICAgICAgc2VydmVyLlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGJ5dGVzQWNjZXB0ZWQgVG90YWwgbnVtYmVyIG9mIGJ5dGVzIHRoYXQgaGF2ZSBiZWVuXG4gICAqICAgICAgICAgICAgICAgICAgICAgICAgICAgICAgICBhY2NlcHRlZCBieSB0aGUgc2VydmVyLlxuICAgKiBAcGFyYW0gIHtudW1iZXJ9IGJ5dGVzVG90YWwgVG90YWwgbnVtYmVyIG9mIGJ5dGVzIHRvIGJlIHNlbnQgdG8gdGhlIHNlcnZlci5cbiAgICovXG4gIF9lbWl0Q2h1bmtDb21wbGV0ZShjaHVua1NpemUsIGJ5dGVzQWNjZXB0ZWQsIGJ5dGVzVG90YWwpIHtcbiAgICBpZiAodHlwZW9mIHRoaXMub3B0aW9ucy5vbkNodW5rQ29tcGxldGUgPT09IFwiZnVuY3Rpb25cIikge1xuICAgICAgdGhpcy5vcHRpb25zLm9uQ2h1bmtDb21wbGV0ZShjaHVua1NpemUsIGJ5dGVzQWNjZXB0ZWQsIGJ5dGVzVG90YWwpO1xuICAgIH1cbiAgfVxuXG4gIC8qKlxuICAgKiBTZXQgdGhlIGhlYWRlcnMgdXNlZCBpbiB0aGUgcmVxdWVzdCBhbmQgdGhlIHdpdGhDcmVkZW50aWFscyBwcm9wZXJ0eVxuICAgKiBhcyBkZWZpbmVkIGluIHRoZSBvcHRpb25zXG4gICAqXG4gICAqIEBwYXJhbSB7WE1MSHR0cFJlcXVlc3R9IHhoclxuICAgKi9cbiAgX3NldHVwWEhSKHhocikge1xuICAgIHRoaXMuX3hociA9IHhocjtcblxuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiVHVzLVJlc3VtYWJsZVwiLCBcIjEuMC4wXCIpO1xuICAgIGxldCBoZWFkZXJzID0gdGhpcy5vcHRpb25zLmhlYWRlcnM7XG5cbiAgICBmb3IgKGxldCBuYW1lIGluIGhlYWRlcnMpIHtcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIGhlYWRlcnNbbmFtZV0pO1xuICAgIH1cblxuICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0aGlzLm9wdGlvbnMud2l0aENyZWRlbnRpYWxzO1xuICB9XG5cbiAgX3NldHVwWEhSKHhocikge1xuICAgIHRoaXMuX3hociA9IHhocjtcblxuICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKFwiVHVzLVJlc3VtYWJsZVwiLCBcIjEuMC4wXCIpO1xuICAgIGxldCBoZWFkZXJzID0gdGhpcy5vcHRpb25zLmhlYWRlcnM7XG5cbiAgICBmb3IgKGxldCBuYW1lIGluIGhlYWRlcnMpIHtcbiAgICAgIHhoci5zZXRSZXF1ZXN0SGVhZGVyKG5hbWUsIGhlYWRlcnNbbmFtZV0pO1xuICAgIH1cblxuICAgIHhoci53aXRoQ3JlZGVudGlhbHMgPSB0aGlzLm9wdGlvbnMud2l0aENyZWRlbnRpYWxzO1xuICB9XG5cbiAgLyoqXG4gICAqIENyZWF0ZSBhIG5ldyB1cGxvYWQgdXNpbmcgdGhlIGNyZWF0aW9uIGV4dGVuc2lvbiBieSBzZW5kaW5nIGEgUE9TVFxuICAgKiByZXF1ZXN0IHRvIHRoZSBlbmRwb2ludC4gQWZ0ZXIgc3VjY2Vzc2Z1bCBjcmVhdGlvbiB0aGUgZmlsZSB3aWxsIGJlXG4gICAqIHVwbG9hZGVkXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgX2NyZWF0ZVVwbG9hZCgpIHtcbiAgICBsZXQgd3MgPSBuZXcgV2ViU29ja2V0KFwid3M6Ly9cIit0aGlzLm9wdGlvbnMud3NlbmRwb2ludCtcIi93c1wiKTtcblxuICAgIHdzLm9ub3BlbiA9ICgpID0+IHtcblxuICAgICAgbGV0IHBheWxvYWQgPSB7XG4gICAgICAgIG1ldGhvZDogXCJQT1NUXCIsXG4gICAgICAgIGhlYWRlcnM6IHt9XG4gICAgICB9O1xuXG4gICAgICBsZXQgaGVhZGVycyA9IHtcbiAgICAgICAgXCJUdXMtUmVzdW1hYmxlXCI6IFwiMS4wLjBcIixcbiAgICAgICAgXCJVcGxvYWQtTGVuZ3RoXCI6IHRoaXMuX3NpemUudG9TdHJpbmcoKVxuICAgICAgfTtcblxuICAgICAgdmFyIG1ldGFkYXRhID0gZW5jb2RlTWV0YWRhdGEodGhpcy5vcHRpb25zLm1ldGFkYXRhKTtcbiAgICAgIGlmIChtZXRhZGF0YSAhPT0gXCJcIikge1xuICAgICAgICBoZWFkZXJzW1wiVXBsb2FkLU1ldGFkYXRhXCJdID0gbWV0YWRhdGE7XG4gICAgICB9XG5cbiAgICAgIGxldCBvcHRpb25IZWFkZXJzID0gdGhpcy5vcHRpb25zLmhlYWRlcnM7XG4gICAgICBmb3IgKGxldCBuYW1lIGluIG9wdGlvbkhlYWRlcnMpIHtcbiAgICAgICAgaGVhZGVyc1tuYW1lXSA9IG9wdGlvbkhlYWRlcnNbbmFtZV07XG4gICAgICB9XG5cbiAgICAgIHBheWxvYWQuaGVhZGVycyA9IGhlYWRlcnM7XG5cbiAgICAgIHdzLnNlbmQoSlNPTi5zdHJpbmdpZnkocGF5bG9hZCkpO1xuICAgIH07XG5cbiAgICB3cy5vbmVycm9yID0gKGV2ZW50KSA9PiB7XG4gICAgICBjb25zb2xlLmxvZyhcIltXUyBFcnJvcl1cIiwgZXZlbnQpO1xuICAgICAgLy8gTVVTVCBfZW1pdFhockVycm9yIChfZW1pdFdzRXJyb3IpXG4gICAgICB0aGlzLl9lbWl0RXJyb3IobmV3IEVycm9yKFwidHVzOiBmYWlsZWQgdG8gY3JlYXRlIHVwbG9hZFwiKSk7XG4gICAgfTtcblxuICAgIHdzLm9uY2xvc2UgPSAoZXZlbnQpID0+IHtcbiAgICAgIGNvbnNvbGUubG9nKFwiW1dTIENsb3NlZGRkZGRdXCIsIGV2ZW50KTtcbiAgICAgIFxuICAgICAgaWYgKGV2ZW50LmNvZGUgIT0gMTAwMCkge1xuICAgICAgICAvLyBNVVNUIF9lbWl0WGhyRXJyb3IgKF9lbWl0V3NFcnJvcilcbiAgICAgICAgdGhpcy5fZW1pdEVycm9yKG5ldyBFcnJvcihcInR1czogY2xvc2VkIHRvIGNyZWF0ZSB1cGxvYWRcIikpO1xuICAgICAgfVxuICAgICAgXG4gICAgfTtcblxuICAgIHdzLm9ubWVzc2FnZSA9IChtZXNzYWdlKSA9PiB7XG4gICAgICBsZXQgcmVzcG9uc2UgPSBKU09OLnBhcnNlKG1lc3NhZ2UuZGF0YSk7XG5cbiAgICAgIGlmICghaW5TdGF0dXNDYXRlZ29yeShyZXNwb25zZS5zdGF0dXMsIDIwMCkpIHtcbiAgICAgICAgLy8gTVVTVCBfZW1pdFhockVycm9yIChfZW1pdFdzRXJyb3IpXG4gICAgICAgIHRoaXMuX2VtaXRFcnJvcihuZXcgRXJyb3IoXCJ0dXM6IHVuZXhwZWN0ZWQgcmVzcG9uc2Ugd2hpbGUgY3JlYXRpbmcgdXBsb2FkXCIpKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLnVybCA9IHJlc3BvbnNlLmhlYWRlcnNbXCJMb2NhdGlvblwiXTtcblxuICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZXN1bWUpIHtcbiAgICAgICAgU3RvcmFnZS5zZXRJdGVtKHRoaXMuX2ZpbmdlcnByaW50LCB0aGlzLnVybCk7XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX29mZnNldCA9IDA7XG4gICAgICB3cy5jbG9zZSgxMDAwKTtcbiAgICAgIHRoaXMuX3N0YXJ0VXBsb2FkKCk7XG4gICAgfTtcbiAgfVxuXG4gIC8qXG4gICAqIFRyeSB0byByZXN1bWUgYW4gZXhpc3RpbmcgdXBsb2FkLiBGaXJzdCBhIEhFQUQgcmVxdWVzdCB3aWxsIGJlIHNlbnRcbiAgICogdG8gcmV0cmlldmUgdGhlIG9mZnNldC4gSWYgdGhlIHJlcXVlc3QgZmFpbHMgYSBuZXcgdXBsb2FkIHdpbGwgYmVcbiAgICogY3JlYXRlZC4gSW4gdGhlIGNhc2Ugb2YgYSBzdWNjZXNzZnVsIHJlc3BvbnNlIHRoZSBmaWxlIHdpbGwgYmUgdXBsb2FkZWQuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgX3Jlc3VtZVVwbG9hZCgpIHtcbiAgICBsZXQgeGhyID0gbmV3UmVxdWVzdCgpO1xuICAgIHhoci5vcGVuKFwiSEVBRFwiLCB0aGlzLnVybCwgdHJ1ZSk7XG5cbiAgICB4aHIub25sb2FkID0gKCkgPT4ge1xuICAgICAgaWYgKCFpblN0YXR1c0NhdGVnb3J5KHhoci5zdGF0dXMsIDIwMCkpIHtcbiAgICAgICAgaWYgKHRoaXMub3B0aW9ucy5yZXN1bWUgJiYgaW5TdGF0dXNDYXRlZ29yeSh4aHIuc3RhdHVzLCA0MDApKSB7XG4gICAgICAgICAgLy8gUmVtb3ZlIHN0b3JlZCBmaW5nZXJwcmludCBhbmQgY29ycmVzcG9uZGluZyBlbmRwb2ludCxcbiAgICAgICAgICAvLyBvbiBjbGllbnQgZXJyb3JzIHNpbmNlIHRoZSBmaWxlIGNhbiBub3QgYmUgZm91bmRcbiAgICAgICAgICBTdG9yYWdlLnJlbW92ZUl0ZW0odGhpcy5fZmluZ2VycHJpbnQpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gSWYgdGhlIHVwbG9hZCBpcyBsb2NrZWQgKGluZGljYXRlZCBieSB0aGUgNDIzIExvY2tlZCBzdGF0dXMgY29kZSksIHdlXG4gICAgICAgIC8vIGVtaXQgYW4gZXJyb3IgaW5zdGVhZCBvZiBkaXJlY3RseSBzdGFydGluZyBhIG5ldyB1cGxvYWQuIFRoaXMgd2F5IHRoZVxuICAgICAgICAvLyByZXRyeSBsb2dpYyBjYW4gY2F0Y2ggdGhlIGVycm9yIGFuZCB3aWxsIHJldHJ5IHRoZSB1cGxvYWQuIEFuIHVwbG9hZFxuICAgICAgICAvLyBpcyB1c3VhbGx5IGxvY2tlZCBmb3IgYSBzaG9ydCBwZXJpb2Qgb2YgdGltZSBhbmQgd2lsbCBiZSBhdmFpbGFibGVcbiAgICAgICAgLy8gYWZ0ZXJ3YXJkcy5cbiAgICAgICAgaWYgKHhoci5zdGF0dXMgPT09IDQyMykge1xuICAgICAgICAgIHRoaXMuX2VtaXRYaHJFcnJvcih4aHIsIG5ldyBFcnJvcihcInR1czogdXBsb2FkIGlzIGN1cnJlbnRseSBsb2NrZWQ7IHJldHJ5IGxhdGVyXCIpKTtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICAvLyBUcnkgdG8gY3JlYXRlIGEgbmV3IHVwbG9hZFxuICAgICAgICB0aGlzLnVybCA9IG51bGw7XG4gICAgICAgIHRoaXMuX2NyZWF0ZVVwbG9hZCgpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCBvZmZzZXQgPSBwYXJzZUludCh4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJVcGxvYWQtT2Zmc2V0XCIpLCAxMCk7XG4gICAgICBpZiAoaXNOYU4ob2Zmc2V0KSkge1xuICAgICAgICB0aGlzLl9lbWl0WGhyRXJyb3IoeGhyLCBuZXcgRXJyb3IoXCJ0dXM6IGludmFsaWQgb3IgbWlzc2luZyBvZmZzZXQgdmFsdWVcIikpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCBsZW5ndGggPSBwYXJzZUludCh4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJVcGxvYWQtTGVuZ3RoXCIpLCAxMCk7XG4gICAgICBpZiAoaXNOYU4obGVuZ3RoKSkge1xuICAgICAgICB0aGlzLl9lbWl0WGhyRXJyb3IoeGhyLCBuZXcgRXJyb3IoXCJ0dXM6IGludmFsaWQgb3IgbWlzc2luZyBsZW5ndGggdmFsdWVcIikpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIC8vIFVwbG9hZCBoYXMgYWxyZWFkeSBiZWVuIGNvbXBsZXRlZCBhbmQgd2UgZG8gbm90IG5lZWQgdG8gc2VuZCBhZGRpdGlvbmFsXG4gICAgICAvLyBkYXRhIHRvIHRoZSBzZXJ2ZXJcbiAgICAgIGlmIChvZmZzZXQgPT09IGxlbmd0aCkge1xuICAgICAgICB0aGlzLl9lbWl0UHJvZ3Jlc3MobGVuZ3RoLCBsZW5ndGgpO1xuICAgICAgICB0aGlzLl9lbWl0U3VjY2VzcygpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX29mZnNldCA9IG9mZnNldDtcbiAgICAgIHRoaXMuX3N0YXJ0VXBsb2FkKCk7XG4gICAgfTtcblxuICAgIHhoci5vbmVycm9yID0gKGVycikgPT4ge1xuICAgICAgdGhpcy5fZW1pdFhockVycm9yKHhociwgbmV3IEVycm9yKFwidHVzOiBmYWlsZWQgdG8gcmVzdW1lIHVwbG9hZFwiKSwgZXJyKTtcbiAgICB9O1xuXG4gICAgdGhpcy5fc2V0dXBYSFIoeGhyKTtcbiAgICB4aHIuc2VuZChudWxsKTtcbiAgfVxuXG4gIC8qKlxuICAgKiBTdGFydCB1cGxvYWRpbmcgdGhlIGZpbGUgdXNpbmcgUEFUQ0ggcmVxdWVzdHMuIFRoZSBmaWxlIHdpbGwgYmUgZGl2aWRlZFxuICAgKiBpbnRvIGNodW5rcyBhcyBzcGVjaWZpZWQgaW4gdGhlIGNodW5rU2l6ZSBvcHRpb24uIER1cmluZyB0aGUgdXBsb2FkXG4gICAqIHRoZSBvblByb2dyZXNzIGV2ZW50IGhhbmRsZXIgbWF5IGJlIGludm9rZWQgbXVsdGlwbGUgdGltZXMuXG4gICAqXG4gICAqIEBhcGkgcHJpdmF0ZVxuICAgKi9cbiAgX3N0YXJ0VXBsb2FkKCkge1xuICAgIC8vIElmIHRoZSB1cGxvYWQgaGFzIGJlZW4gYWJvcnRlZCwgd2Ugd2lsbCBub3Qgc2VuZCB0aGUgbmV4dCBQQVRDSCByZXF1ZXN0LlxuICAgIC8vIFRoaXMgaXMgaW1wb3J0YW50IGlmIHRoZSBhYm9ydCBtZXRob2Qgd2FzIGNhbGxlZCBkdXJpbmcgYSBjYWxsYmFjaywgc3VjaFxuICAgIC8vIGFzIG9uQ2h1bmtDb21wbGV0ZSBvciBvblByb2dyZXNzLlxuICAgIGlmICh0aGlzLl9hYm9ydGVkKSB7XG4gICAgICByZXR1cm47XG4gICAgfVxuXG4gICAgbGV0IHhociA9IG5ld1JlcXVlc3QoKTtcblxuICAgIC8vIFNvbWUgYnJvd3NlciBhbmQgc2VydmVycyBtYXkgbm90IHN1cHBvcnQgdGhlIFBBVENIIG1ldGhvZC4gRm9yIHRob3NlXG4gICAgLy8gY2FzZXMsIHlvdSBjYW4gdGVsbCB0dXMtanMtY2xpZW50IHRvIHVzZSBhIFBPU1QgcmVxdWVzdCB3aXRoIHRoZVxuICAgIC8vIFgtSFRUUC1NZXRob2QtT3ZlcnJpZGUgaGVhZGVyIGZvciBzaW11bGF0aW5nIGEgUEFUQ0ggcmVxdWVzdC5cbiAgICBpZiAodGhpcy5vcHRpb25zLm92ZXJyaWRlUGF0Y2hNZXRob2QpIHtcbiAgICAgIHhoci5vcGVuKFwiUE9TVFwiLCB0aGlzLnVybCwgdHJ1ZSk7XG4gICAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIlgtSFRUUC1NZXRob2QtT3ZlcnJpZGVcIiwgXCJQQVRDSFwiKTtcbiAgICB9IGVsc2Uge1xuICAgICAgeGhyLm9wZW4oXCJQQVRDSFwiLCB0aGlzLnVybCwgdHJ1ZSk7XG4gICAgfVxuXG4gICAgeGhyLm9ubG9hZCA9ICgpID0+IHtcbiAgICAgIGlmICghaW5TdGF0dXNDYXRlZ29yeSh4aHIuc3RhdHVzLCAyMDApKSB7XG4gICAgICAgIHRoaXMuX2VtaXRYaHJFcnJvcih4aHIsIG5ldyBFcnJvcihcInR1czogdW5leHBlY3RlZCByZXNwb25zZSB3aGlsZSB1cGxvYWRpbmcgY2h1bmtcIikpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIGxldCBvZmZzZXQgPSBwYXJzZUludCh4aHIuZ2V0UmVzcG9uc2VIZWFkZXIoXCJVcGxvYWQtT2Zmc2V0XCIpLCAxMCk7XG4gICAgICBpZiAoaXNOYU4ob2Zmc2V0KSkge1xuICAgICAgICB0aGlzLl9lbWl0WGhyRXJyb3IoeGhyLCBuZXcgRXJyb3IoXCJ0dXM6IGludmFsaWQgb3IgbWlzc2luZyBvZmZzZXQgdmFsdWVcIikpO1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG5cbiAgICAgIHRoaXMuX2VtaXRQcm9ncmVzcyhvZmZzZXQsIHRoaXMuX3NpemUpO1xuICAgICAgdGhpcy5fZW1pdENodW5rQ29tcGxldGUob2Zmc2V0IC0gdGhpcy5fb2Zmc2V0LCBvZmZzZXQsIHRoaXMuX3NpemUpO1xuXG4gICAgICB0aGlzLl9vZmZzZXQgPSBvZmZzZXQ7XG5cbiAgICAgIGlmIChvZmZzZXQgPT0gdGhpcy5fc2l6ZSkge1xuICAgICAgICAvLyBZYXksIGZpbmFsbHkgZG9uZSA6KVxuICAgICAgICB0aGlzLl9lbWl0U3VjY2VzcygpO1xuICAgICAgICB0aGlzLl9zb3VyY2UuY2xvc2UoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9zdGFydFVwbG9hZCgpO1xuICAgIH07XG5cbiAgICB4aHIub25lcnJvciA9IChlcnIpID0+IHtcbiAgICAgIC8vIERvbid0IGVtaXQgYW4gZXJyb3IgaWYgdGhlIHVwbG9hZCB3YXMgYWJvcnRlZCBtYW51YWxseVxuICAgICAgaWYgKHRoaXMuX2Fib3J0ZWQpIHtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuXG4gICAgICB0aGlzLl9lbWl0WGhyRXJyb3IoeGhyLCBuZXcgRXJyb3IoXCJ0dXM6IGZhaWxlZCB0byB1cGxvYWQgY2h1bmsgYXQgb2Zmc2V0IFwiICsgdGhpcy5fb2Zmc2V0KSwgZXJyKTtcbiAgICB9O1xuXG4gICAgLy8gVGVzdCBzdXBwb3J0IGZvciBwcm9ncmVzcyBldmVudHMgYmVmb3JlIGF0dGFjaGluZyBhbiBldmVudCBsaXN0ZW5lclxuICAgIGlmIChcInVwbG9hZFwiIGluIHhocikge1xuICAgICAgeGhyLnVwbG9hZC5vbnByb2dyZXNzID0gKGUpID0+IHtcbiAgICAgICAgaWYgKCFlLmxlbmd0aENvbXB1dGFibGUpIHtcbiAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICB0aGlzLl9lbWl0UHJvZ3Jlc3Moc3RhcnQgKyBlLmxvYWRlZCwgdGhpcy5fc2l6ZSk7XG4gICAgICB9O1xuICAgIH1cblxuICAgIHRoaXMuX3NldHVwWEhSKHhocik7XG5cbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIlVwbG9hZC1PZmZzZXRcIiwgdGhpcy5fb2Zmc2V0KTtcbiAgICB4aHIuc2V0UmVxdWVzdEhlYWRlcihcIkNvbnRlbnQtVHlwZVwiLCBcImFwcGxpY2F0aW9uL29mZnNldCtvY3RldC1zdHJlYW1cIik7XG5cbiAgICBsZXQgc3RhcnQgPSB0aGlzLl9vZmZzZXQ7XG4gICAgbGV0IGVuZCA9IHRoaXMuX29mZnNldCArIHRoaXMub3B0aW9ucy5jaHVua1NpemU7XG5cbiAgICAvLyBUaGUgc3BlY2lmaWVkIGNodW5rU2l6ZSBtYXkgYmUgSW5maW5pdHkgb3IgdGhlIGNhbGNsdWF0ZWQgZW5kIHBvc2l0aW9uXG4gICAgLy8gbWF5IGV4Y2VlZCB0aGUgZmlsZSdzIHNpemUuIEluIGJvdGggY2FzZXMsIHdlIGxpbWl0IHRoZSBlbmQgcG9zaXRpb24gdG9cbiAgICAvLyB0aGUgaW5wdXQncyB0b3RhbCBzaXplIGZvciBzaW1wbGVyIGNhbGN1bGF0aW9ucyBhbmQgY29ycmVjdG5lc3MuXG4gICAgaWYgKGVuZCA9PT0gSW5maW5pdHkgfHwgZW5kID4gdGhpcy5fc2l6ZSkge1xuICAgICAgZW5kID0gdGhpcy5fc2l6ZTtcbiAgICB9XG5cbiAgICB4aHIuc2VuZCh0aGlzLl9zb3VyY2Uuc2xpY2Uoc3RhcnQsIGVuZCkpO1xuICB9XG59XG5cbmZ1bmN0aW9uIGVuY29kZU1ldGFkYXRhKG1ldGFkYXRhKSB7XG4gICAgaWYgKCFCYXNlNjQuaXNTdXBwb3J0ZWQpIHtcbiAgICAgICAgcmV0dXJuIFwiXCI7XG4gICAgfVxuXG4gICAgdmFyIGVuY29kZWQgPSBbXTtcblxuICAgIGZvciAodmFyIGtleSBpbiBtZXRhZGF0YSkge1xuICAgICAgICBlbmNvZGVkLnB1c2goa2V5ICsgXCIgXCIgKyBCYXNlNjQuZW5jb2RlKG1ldGFkYXRhW2tleV0pKTtcbiAgICB9XG5cbiAgICByZXR1cm4gZW5jb2RlZC5qb2luKFwiLFwiKTtcbn1cblxuLyoqXG4gKiBDaGVja3Mgd2hldGhlciBhIGdpdmVuIHN0YXR1cyBpcyBpbiB0aGUgcmFuZ2Ugb2YgdGhlIGV4cGVjdGVkIGNhdGVnb3J5LlxuICogRm9yIGV4YW1wbGUsIG9ubHkgYSBzdGF0dXMgYmV0d2VlbiAyMDAgYW5kIDI5OSB3aWxsIHNhdGlzZnkgdGhlIGNhdGVnb3J5IDIwMC5cbiAqXG4gKiBAYXBpIHByaXZhdGVcbiAqL1xuZnVuY3Rpb24gaW5TdGF0dXNDYXRlZ29yeShzdGF0dXMsIGNhdGVnb3J5KSB7XG4gIHJldHVybiAoc3RhdHVzID49IGNhdGVnb3J5ICYmIHN0YXR1cyA8IChjYXRlZ29yeSArIDEwMCkpO1xufVxuXG5VcGxvYWQuZGVmYXVsdE9wdGlvbnMgPSBkZWZhdWx0T3B0aW9ucztcblxuZXhwb3J0IGRlZmF1bHQgVXBsb2FkO1xuIiwiJ3VzZSBzdHJpY3QnO1xuXG52YXIgaGFzT3duID0gT2JqZWN0LnByb3RvdHlwZS5oYXNPd25Qcm9wZXJ0eTtcbnZhciB0b1N0ciA9IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmc7XG5cbnZhciBpc0FycmF5ID0gZnVuY3Rpb24gaXNBcnJheShhcnIpIHtcblx0aWYgKHR5cGVvZiBBcnJheS5pc0FycmF5ID09PSAnZnVuY3Rpb24nKSB7XG5cdFx0cmV0dXJuIEFycmF5LmlzQXJyYXkoYXJyKTtcblx0fVxuXG5cdHJldHVybiB0b1N0ci5jYWxsKGFycikgPT09ICdbb2JqZWN0IEFycmF5XSc7XG59O1xuXG52YXIgaXNQbGFpbk9iamVjdCA9IGZ1bmN0aW9uIGlzUGxhaW5PYmplY3Qob2JqKSB7XG5cdGlmICghb2JqIHx8IHRvU3RyLmNhbGwob2JqKSAhPT0gJ1tvYmplY3QgT2JqZWN0XScpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHR2YXIgaGFzT3duQ29uc3RydWN0b3IgPSBoYXNPd24uY2FsbChvYmosICdjb25zdHJ1Y3RvcicpO1xuXHR2YXIgaGFzSXNQcm90b3R5cGVPZiA9IG9iai5jb25zdHJ1Y3RvciAmJiBvYmouY29uc3RydWN0b3IucHJvdG90eXBlICYmIGhhc093bi5jYWxsKG9iai5jb25zdHJ1Y3Rvci5wcm90b3R5cGUsICdpc1Byb3RvdHlwZU9mJyk7XG5cdC8vIE5vdCBvd24gY29uc3RydWN0b3IgcHJvcGVydHkgbXVzdCBiZSBPYmplY3Rcblx0aWYgKG9iai5jb25zdHJ1Y3RvciAmJiAhaGFzT3duQ29uc3RydWN0b3IgJiYgIWhhc0lzUHJvdG90eXBlT2YpIHtcblx0XHRyZXR1cm4gZmFsc2U7XG5cdH1cblxuXHQvLyBPd24gcHJvcGVydGllcyBhcmUgZW51bWVyYXRlZCBmaXJzdGx5LCBzbyB0byBzcGVlZCB1cCxcblx0Ly8gaWYgbGFzdCBvbmUgaXMgb3duLCB0aGVuIGFsbCBwcm9wZXJ0aWVzIGFyZSBvd24uXG5cdHZhciBrZXk7XG5cdGZvciAoa2V5IGluIG9iaikgeyAvKiovIH1cblxuXHRyZXR1cm4gdHlwZW9mIGtleSA9PT0gJ3VuZGVmaW5lZCcgfHwgaGFzT3duLmNhbGwob2JqLCBrZXkpO1xufTtcblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbiBleHRlbmQoKSB7XG5cdHZhciBvcHRpb25zLCBuYW1lLCBzcmMsIGNvcHksIGNvcHlJc0FycmF5LCBjbG9uZTtcblx0dmFyIHRhcmdldCA9IGFyZ3VtZW50c1swXTtcblx0dmFyIGkgPSAxO1xuXHR2YXIgbGVuZ3RoID0gYXJndW1lbnRzLmxlbmd0aDtcblx0dmFyIGRlZXAgPSBmYWxzZTtcblxuXHQvLyBIYW5kbGUgYSBkZWVwIGNvcHkgc2l0dWF0aW9uXG5cdGlmICh0eXBlb2YgdGFyZ2V0ID09PSAnYm9vbGVhbicpIHtcblx0XHRkZWVwID0gdGFyZ2V0O1xuXHRcdHRhcmdldCA9IGFyZ3VtZW50c1sxXSB8fCB7fTtcblx0XHQvLyBza2lwIHRoZSBib29sZWFuIGFuZCB0aGUgdGFyZ2V0XG5cdFx0aSA9IDI7XG5cdH1cblx0aWYgKHRhcmdldCA9PSBudWxsIHx8ICh0eXBlb2YgdGFyZ2V0ICE9PSAnb2JqZWN0JyAmJiB0eXBlb2YgdGFyZ2V0ICE9PSAnZnVuY3Rpb24nKSkge1xuXHRcdHRhcmdldCA9IHt9O1xuXHR9XG5cblx0Zm9yICg7IGkgPCBsZW5ndGg7ICsraSkge1xuXHRcdG9wdGlvbnMgPSBhcmd1bWVudHNbaV07XG5cdFx0Ly8gT25seSBkZWFsIHdpdGggbm9uLW51bGwvdW5kZWZpbmVkIHZhbHVlc1xuXHRcdGlmIChvcHRpb25zICE9IG51bGwpIHtcblx0XHRcdC8vIEV4dGVuZCB0aGUgYmFzZSBvYmplY3Rcblx0XHRcdGZvciAobmFtZSBpbiBvcHRpb25zKSB7XG5cdFx0XHRcdHNyYyA9IHRhcmdldFtuYW1lXTtcblx0XHRcdFx0Y29weSA9IG9wdGlvbnNbbmFtZV07XG5cblx0XHRcdFx0Ly8gUHJldmVudCBuZXZlci1lbmRpbmcgbG9vcFxuXHRcdFx0XHRpZiAodGFyZ2V0ICE9PSBjb3B5KSB7XG5cdFx0XHRcdFx0Ly8gUmVjdXJzZSBpZiB3ZSdyZSBtZXJnaW5nIHBsYWluIG9iamVjdHMgb3IgYXJyYXlzXG5cdFx0XHRcdFx0aWYgKGRlZXAgJiYgY29weSAmJiAoaXNQbGFpbk9iamVjdChjb3B5KSB8fCAoY29weUlzQXJyYXkgPSBpc0FycmF5KGNvcHkpKSkpIHtcblx0XHRcdFx0XHRcdGlmIChjb3B5SXNBcnJheSkge1xuXHRcdFx0XHRcdFx0XHRjb3B5SXNBcnJheSA9IGZhbHNlO1xuXHRcdFx0XHRcdFx0XHRjbG9uZSA9IHNyYyAmJiBpc0FycmF5KHNyYykgPyBzcmMgOiBbXTtcblx0XHRcdFx0XHRcdH0gZWxzZSB7XG5cdFx0XHRcdFx0XHRcdGNsb25lID0gc3JjICYmIGlzUGxhaW5PYmplY3Qoc3JjKSA/IHNyYyA6IHt9O1xuXHRcdFx0XHRcdFx0fVxuXG5cdFx0XHRcdFx0XHQvLyBOZXZlciBtb3ZlIG9yaWdpbmFsIG9iamVjdHMsIGNsb25lIHRoZW1cblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGV4dGVuZChkZWVwLCBjbG9uZSwgY29weSk7XG5cblx0XHRcdFx0XHQvLyBEb24ndCBicmluZyBpbiB1bmRlZmluZWQgdmFsdWVzXG5cdFx0XHRcdFx0fSBlbHNlIGlmICh0eXBlb2YgY29weSAhPT0gJ3VuZGVmaW5lZCcpIHtcblx0XHRcdFx0XHRcdHRhcmdldFtuYW1lXSA9IGNvcHk7XG5cdFx0XHRcdFx0fVxuXHRcdFx0XHR9XG5cdFx0XHR9XG5cdFx0fVxuXHR9XG5cblx0Ly8gUmV0dXJuIHRoZSBtb2RpZmllZCBvYmplY3Rcblx0cmV0dXJuIHRhcmdldDtcbn07XG4iLCIvLyBDb3B5cmlnaHQgMjAxNCBTaW1vbiBMeWRlbGxcclxuLy8gWDExICjigJxNSVTigJ0pIExpY2Vuc2VkLiAoU2VlIExJQ0VOU0UuKVxyXG5cclxudm9pZCAoZnVuY3Rpb24ocm9vdCwgZmFjdG9yeSkge1xyXG4gIGlmICh0eXBlb2YgZGVmaW5lID09PSBcImZ1bmN0aW9uXCIgJiYgZGVmaW5lLmFtZCkge1xyXG4gICAgZGVmaW5lKGZhY3RvcnkpXHJcbiAgfSBlbHNlIGlmICh0eXBlb2YgZXhwb3J0cyA9PT0gXCJvYmplY3RcIikge1xyXG4gICAgbW9kdWxlLmV4cG9ydHMgPSBmYWN0b3J5KClcclxuICB9IGVsc2Uge1xyXG4gICAgcm9vdC5yZXNvbHZlVXJsID0gZmFjdG9yeSgpXHJcbiAgfVxyXG59KHRoaXMsIGZ1bmN0aW9uKCkge1xyXG5cclxuICBmdW5jdGlvbiByZXNvbHZlVXJsKC8qIC4uLnVybHMgKi8pIHtcclxuICAgIHZhciBudW1VcmxzID0gYXJndW1lbnRzLmxlbmd0aFxyXG5cclxuICAgIGlmIChudW1VcmxzID09PSAwKSB7XHJcbiAgICAgIHRocm93IG5ldyBFcnJvcihcInJlc29sdmVVcmwgcmVxdWlyZXMgYXQgbGVhc3Qgb25lIGFyZ3VtZW50OyBnb3Qgbm9uZS5cIilcclxuICAgIH1cclxuXHJcbiAgICB2YXIgYmFzZSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJiYXNlXCIpXHJcbiAgICBiYXNlLmhyZWYgPSBhcmd1bWVudHNbMF1cclxuXHJcbiAgICBpZiAobnVtVXJscyA9PT0gMSkge1xyXG4gICAgICByZXR1cm4gYmFzZS5ocmVmXHJcbiAgICB9XHJcblxyXG4gICAgdmFyIGhlYWQgPSBkb2N1bWVudC5nZXRFbGVtZW50c0J5VGFnTmFtZShcImhlYWRcIilbMF1cclxuICAgIGhlYWQuaW5zZXJ0QmVmb3JlKGJhc2UsIGhlYWQuZmlyc3RDaGlsZClcclxuXHJcbiAgICB2YXIgYSA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoXCJhXCIpXHJcbiAgICB2YXIgcmVzb2x2ZWRcclxuXHJcbiAgICBmb3IgKHZhciBpbmRleCA9IDE7IGluZGV4IDwgbnVtVXJsczsgaW5kZXgrKykge1xyXG4gICAgICBhLmhyZWYgPSBhcmd1bWVudHNbaW5kZXhdXHJcbiAgICAgIHJlc29sdmVkID0gYS5ocmVmXHJcbiAgICAgIGJhc2UuaHJlZiA9IHJlc29sdmVkXHJcbiAgICB9XHJcblxyXG4gICAgaGVhZC5yZW1vdmVDaGlsZChiYXNlKVxyXG5cclxuICAgIHJldHVybiByZXNvbHZlZFxyXG4gIH1cclxuXHJcbiAgcmV0dXJuIHJlc29sdmVVcmxcclxuXHJcbn0pKTtcclxuIl19
