import { createRequire } from "node:module";
var __create = Object.create;
var __getProtoOf = Object.getPrototypeOf;
var __defProp = Object.defineProperty;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
function __accessProp(key) {
  return this[key];
}
var __toESMCache_node;
var __toESMCache_esm;
var __toESM = (mod, isNodeMode, target) => {
  var canCache = mod != null && typeof mod === "object";
  if (canCache) {
    var cache = isNodeMode ? __toESMCache_node ??= new WeakMap : __toESMCache_esm ??= new WeakMap;
    var cached = cache.get(mod);
    if (cached)
      return cached;
  }
  target = mod != null ? __create(__getProtoOf(mod)) : {};
  const to = isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target;
  for (let key of __getOwnPropNames(mod))
    if (!__hasOwnProp.call(to, key))
      __defProp(to, key, {
        get: __accessProp.bind(mod, key),
        enumerable: true
      });
  if (canCache)
    cache.set(mod, to);
  return to;
};
var __commonJS = (cb, mod) => () => (mod || cb((mod = { exports: {} }).exports, mod), mod.exports);
var __require = /* @__PURE__ */ createRequire(import.meta.url);

// node_modules/@duneanalytics/client-sdk/dist/cjs/types/error.js
var require_error = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.DuneError = undefined;

  class DuneError extends Error {
    constructor(msg) {
      super(msg);
      Object.setPrototypeOf(this, DuneError.prototype);
    }
  }
  exports.DuneError = DuneError;
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/types/query.js
var require_query = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/types/queryParameter.js
var require_queryParameter = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.QueryParameter = exports.ParameterType = undefined;
  var ParameterType;
  (function(ParameterType2) {
    ParameterType2["TEXT"] = "text";
    ParameterType2["NUMBER"] = "number";
    ParameterType2["DATE"] = "date";
    ParameterType2["ENUM"] = "enum";
  })(ParameterType || (exports.ParameterType = ParameterType = {}));

  class QueryParameter {
    constructor(type, name, value) {
      this.type = type;
      this.value = value.toString();
      this.name = name;
    }
    static text(name, value) {
      return new QueryParameter(ParameterType.TEXT, name, value);
    }
    static number(name, value) {
      return new QueryParameter(ParameterType.NUMBER, name, value.toString());
    }
    static date(name, value) {
      return new QueryParameter(ParameterType.DATE, name, value.toString());
    }
    static enum(name, value) {
      return new QueryParameter(ParameterType.ENUM, name, value.toString());
    }
    static unravel(params) {
      const reducedParams = params?.reduce((acc, { name, value }) => ({ ...acc, [name]: value }), {});
      return reducedParams || {};
    }
  }
  exports.QueryParameter = QueryParameter;
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/types/requestArgs.js
var require_requestArgs = __commonJS((exports) => {
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.ContentType = exports.ColumnType = exports.QueryEngine = undefined;
  exports.payloadJSON = payloadJSON;
  exports.payloadSearchParams = payloadSearchParams;
  exports.validateAndBuildGetResultParams = validateAndBuildGetResultParams;
  var assert_1 = __importDefault(__require("assert"));
  var queryParameter_1 = require_queryParameter();
  var QueryEngine;
  (function(QueryEngine2) {
    QueryEngine2["Medium"] = "medium";
    QueryEngine2["Large"] = "large";
  })(QueryEngine || (exports.QueryEngine = QueryEngine = {}));
  function payloadJSON(payload) {
    return JSON.stringify(payloadRecords(payload));
  }
  function payloadRecords(payload) {
    if (payload !== undefined) {
      if ("query_parameters" in payload) {
        const { query_parameters, ...rest } = payload;
        return {
          ...rest,
          query_parameters: query_parameters ? queryParameter_1.QueryParameter.unravel(query_parameters) : []
        };
      }
      return payload;
    }
    return {};
  }
  function payloadSearchParams(payload) {
    if (payload !== undefined) {
      const intermPayload = payload;
      if ("query_parameters" in payload) {
        const { query_parameters, ...rest } = intermPayload;
        const result = Object.keys(rest).reduce((acc, key) => {
          if (rest[key] !== undefined) {
            acc[key] = rest[key];
          }
          return acc;
        }, {});
        if (Array.isArray(payload.query_parameters)) {
          for (const qp of payload.query_parameters) {
            result[`params.${qp.name}`] = qp.value;
          }
        }
        return result;
      }
      return payload;
    }
    return {};
  }
  function validateAndBuildGetResultParams({ limit, offset, sample_count, filters, sort_by, columns, query_parameters }) {
    (0, assert_1.default)(sample_count === undefined || limit === undefined && offset === undefined && filters === undefined, "sampling cannot be combined with filters or pagination");
    if (columns !== undefined) {
      if (typeof columns === "string") {
        columns = columns.split(",");
      }
      const output = columns.map((column) => {
        if (column.includes('"')) {
          return `"${column.replace(/\\/g, "\\\\").replace(/"/g, "\\\"")}"`;
        } else {
          return column;
        }
      });
      columns = output.join(",");
    }
    if (sort_by !== undefined && Array.isArray(sort_by)) {
      sort_by = sort_by.join(",");
    }
    query_parameters = query_parameters || [];
    return {
      limit,
      offset,
      sample_count,
      filters,
      sort_by,
      columns,
      query_parameters
    };
  }
  var ColumnType;
  (function(ColumnType2) {
    ColumnType2["Varchar"] = "varchar";
    ColumnType2["Varbinary"] = "varbinary";
    ColumnType2["Uint256"] = "uint256";
    ColumnType2["Int256"] = "int256";
    ColumnType2["Bigint"] = "bigint";
    ColumnType2["Integer"] = "integer";
    ColumnType2["Double"] = "double";
    ColumnType2["Boolean"] = "boolean";
    ColumnType2["Timestamp"] = "timestamp";
    ColumnType2["Date"] = "date";
  })(ColumnType || (exports.ColumnType = ColumnType = {}));
  var ContentType;
  (function(ContentType2) {
    ContentType2["Json"] = "application/json";
    ContentType2["Csv"] = "text/csv";
    ContentType2["NDJson"] = "application/x-ndjson";
  })(ContentType || (exports.ContentType = ContentType = {}));
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/types/response.js
var require_response = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.ExecutionState = undefined;
  exports.concatResultCSV = concatResultCSV;
  exports.concatResultResponse = concatResultResponse;
  var ExecutionState;
  (function(ExecutionState2) {
    ExecutionState2["COMPLETED"] = "QUERY_STATE_COMPLETED";
    ExecutionState2["EXECUTING"] = "QUERY_STATE_EXECUTING";
    ExecutionState2["PENDING"] = "QUERY_STATE_PENDING";
    ExecutionState2["CANCELLED"] = "QUERY_STATE_CANCELLED";
    ExecutionState2["FAILED"] = "QUERY_STATE_FAILED";
    ExecutionState2["EXPIRED"] = "QUERY_STATE_EXPIRED";
  })(ExecutionState || (exports.ExecutionState = ExecutionState = {}));
  function concatResultCSV(left, right) {
    left.next_uri = right.next_uri;
    left.next_offset = right.next_offset;
    const leftData = left.data.trimEnd().split(`
`);
    const rightData = right.data.split(`
`);
    rightData.shift();
    return {
      next_uri: right.next_uri,
      next_offset: right.next_offset,
      data: leftData.concat(rightData).join(`
`)
    };
  }
  function concatResultResponse(left, right) {
    if (left.execution_id !== right.execution_id) {
      throw new Error(`Can't combine results: ExecutionIds (${left.execution_id} != ${right.execution_id})`);
    } else if (left.result === undefined) {
      throw new Error(`Can't combine results: Left Entry has no results`);
    } else if (right.result === undefined) {
      throw new Error(`Can't combine results: Right Entry has no results`);
    }
    const { next_offset, next_uri, result: _, ...remainingValues } = right;
    return {
      next_uri,
      next_offset,
      result: concatResult(left.result, right.result),
      ...remainingValues
    };
  }
  function concatResult(left, right) {
    return {
      rows: [...left.rows, ...right.rows],
      metadata: concatResultMetadata(left.metadata, right.metadata)
    };
  }
  function concatResultMetadata(left, right) {
    if (right === undefined) {
      throw new Error("Can not concatenate with empty metadata");
    }
    const { row_count, result_set_bytes, datapoint_count, ...remainingValues } = right;
    return {
      row_count: left.row_count + row_count,
      result_set_bytes: left.result_set_bytes + result_set_bytes,
      datapoint_count: left.datapoint_count + datapoint_count,
      ...remainingValues
    };
  }
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/types/index.js
var require_types = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = exports && exports.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(require_error(), exports);
  __exportStar(require_query(), exports);
  __exportStar(require_queryParameter(), exports);
  __exportStar(require_requestArgs(), exports);
  __exportStar(require_response(), exports);
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/utils.js
var require_utils = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.logPrefix = undefined;
  exports.sleep = sleep;
  exports.ageInHours = ageInHours;
  exports.withDefaults = withDefaults;
  exports.logPrefix = "dune-client:";
  function sleep(seconds) {
    return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
  }
  function ageInHours(timestamp) {
    const now = new Date;
    const time = new Date(timestamp);
    const resultAge = now.getTime() - time.getTime();
    return resultAge / (1000 * 60 * 60);
  }
  function withDefaults(obj, defaults) {
    const result = { ...obj };
    for (const key in defaults) {
      if (result[key] === undefined) {
        result[key] = defaults[key];
      }
    }
    return result;
  }
});

// node_modules/loglevel/lib/loglevel.js
var require_loglevel = __commonJS((exports, module) => {
  (function(root, definition) {
    if (typeof define === "function" && define.amd) {
      define(definition);
    } else if (typeof module === "object" && module.exports) {
      module.exports = definition();
    } else {
      root.log = definition();
    }
  })(exports, function() {
    var noop = function() {};
    var undefinedType = "undefined";
    var isIE = typeof window !== undefinedType && typeof window.navigator !== undefinedType && /Trident\/|MSIE /.test(window.navigator.userAgent);
    var logMethods = [
      "trace",
      "debug",
      "info",
      "warn",
      "error"
    ];
    var _loggersByName = {};
    var defaultLogger = null;
    function bindMethod(obj, methodName) {
      var method = obj[methodName];
      if (typeof method.bind === "function") {
        return method.bind(obj);
      } else {
        try {
          return Function.prototype.bind.call(method, obj);
        } catch (e) {
          return function() {
            return Function.prototype.apply.apply(method, [obj, arguments]);
          };
        }
      }
    }
    function traceForIE() {
      if (console.log) {
        if (console.log.apply) {
          console.log.apply(console, arguments);
        } else {
          Function.prototype.apply.apply(console.log, [console, arguments]);
        }
      }
      if (console.trace)
        console.trace();
    }
    function realMethod(methodName) {
      if (methodName === "debug") {
        methodName = "log";
      }
      if (typeof console === undefinedType) {
        return false;
      } else if (methodName === "trace" && isIE) {
        return traceForIE;
      } else if (console[methodName] !== undefined) {
        return bindMethod(console, methodName);
      } else if (console.log !== undefined) {
        return bindMethod(console, "log");
      } else {
        return noop;
      }
    }
    function replaceLoggingMethods() {
      var level = this.getLevel();
      for (var i = 0;i < logMethods.length; i++) {
        var methodName = logMethods[i];
        this[methodName] = i < level ? noop : this.methodFactory(methodName, level, this.name);
      }
      this.log = this.debug;
      if (typeof console === undefinedType && level < this.levels.SILENT) {
        return "No console available for logging";
      }
    }
    function enableLoggingWhenConsoleArrives(methodName) {
      return function() {
        if (typeof console !== undefinedType) {
          replaceLoggingMethods.call(this);
          this[methodName].apply(this, arguments);
        }
      };
    }
    function defaultMethodFactory(methodName, _level, _loggerName) {
      return realMethod(methodName) || enableLoggingWhenConsoleArrives.apply(this, arguments);
    }
    function Logger(name, factory) {
      var self = this;
      var inheritedLevel;
      var defaultLevel;
      var userLevel;
      var storageKey = "loglevel";
      if (typeof name === "string") {
        storageKey += ":" + name;
      } else if (typeof name === "symbol") {
        storageKey = undefined;
      }
      function persistLevelIfPossible(levelNum) {
        var levelName = (logMethods[levelNum] || "silent").toUpperCase();
        if (typeof window === undefinedType || !storageKey)
          return;
        try {
          window.localStorage[storageKey] = levelName;
          return;
        } catch (ignore) {}
        try {
          window.document.cookie = encodeURIComponent(storageKey) + "=" + levelName + ";";
        } catch (ignore) {}
      }
      function getPersistedLevel() {
        var storedLevel;
        if (typeof window === undefinedType || !storageKey)
          return;
        try {
          storedLevel = window.localStorage[storageKey];
        } catch (ignore) {}
        if (typeof storedLevel === undefinedType) {
          try {
            var cookie = window.document.cookie;
            var cookieName = encodeURIComponent(storageKey);
            var location = cookie.indexOf(cookieName + "=");
            if (location !== -1) {
              storedLevel = /^([^;]+)/.exec(cookie.slice(location + cookieName.length + 1))[1];
            }
          } catch (ignore) {}
        }
        if (self.levels[storedLevel] === undefined) {
          storedLevel = undefined;
        }
        return storedLevel;
      }
      function clearPersistedLevel() {
        if (typeof window === undefinedType || !storageKey)
          return;
        try {
          window.localStorage.removeItem(storageKey);
        } catch (ignore) {}
        try {
          window.document.cookie = encodeURIComponent(storageKey) + "=; expires=Thu, 01 Jan 1970 00:00:00 UTC";
        } catch (ignore) {}
      }
      function normalizeLevel(input) {
        var level = input;
        if (typeof level === "string" && self.levels[level.toUpperCase()] !== undefined) {
          level = self.levels[level.toUpperCase()];
        }
        if (typeof level === "number" && level >= 0 && level <= self.levels.SILENT) {
          return level;
        } else {
          throw new TypeError("log.setLevel() called with invalid level: " + input);
        }
      }
      self.name = name;
      self.levels = {
        TRACE: 0,
        DEBUG: 1,
        INFO: 2,
        WARN: 3,
        ERROR: 4,
        SILENT: 5
      };
      self.methodFactory = factory || defaultMethodFactory;
      self.getLevel = function() {
        if (userLevel != null) {
          return userLevel;
        } else if (defaultLevel != null) {
          return defaultLevel;
        } else {
          return inheritedLevel;
        }
      };
      self.setLevel = function(level, persist) {
        userLevel = normalizeLevel(level);
        if (persist !== false) {
          persistLevelIfPossible(userLevel);
        }
        return replaceLoggingMethods.call(self);
      };
      self.setDefaultLevel = function(level) {
        defaultLevel = normalizeLevel(level);
        if (!getPersistedLevel()) {
          self.setLevel(level, false);
        }
      };
      self.resetLevel = function() {
        userLevel = null;
        clearPersistedLevel();
        replaceLoggingMethods.call(self);
      };
      self.enableAll = function(persist) {
        self.setLevel(self.levels.TRACE, persist);
      };
      self.disableAll = function(persist) {
        self.setLevel(self.levels.SILENT, persist);
      };
      self.rebuild = function() {
        if (defaultLogger !== self) {
          inheritedLevel = normalizeLevel(defaultLogger.getLevel());
        }
        replaceLoggingMethods.call(self);
        if (defaultLogger === self) {
          for (var childName in _loggersByName) {
            _loggersByName[childName].rebuild();
          }
        }
      };
      inheritedLevel = normalizeLevel(defaultLogger ? defaultLogger.getLevel() : "WARN");
      var initialLevel = getPersistedLevel();
      if (initialLevel != null) {
        userLevel = normalizeLevel(initialLevel);
      }
      replaceLoggingMethods.call(self);
    }
    defaultLogger = new Logger;
    defaultLogger.getLogger = function getLogger(name) {
      if (typeof name !== "symbol" && typeof name !== "string" || name === "") {
        throw new TypeError("You must supply a name when creating a logger.");
      }
      var logger = _loggersByName[name];
      if (!logger) {
        logger = _loggersByName[name] = new Logger(name, defaultLogger.methodFactory);
      }
      return logger;
    };
    var _log = typeof window !== undefinedType ? window.log : undefined;
    defaultLogger.noConflict = function() {
      if (typeof window !== undefinedType && window.log === defaultLogger) {
        window.log = _log;
      }
      return defaultLogger;
    };
    defaultLogger.getLoggers = function getLoggers() {
      return _loggersByName;
    };
    defaultLogger["default"] = defaultLogger;
    return defaultLogger;
  });
});

// node_modules/@duneanalytics/client-sdk/dist/package.json
var require_package = __commonJS((exports, module) => {
  module.exports = {
    name: "@duneanalytics/client-sdk",
    version: "0.3.1",
    author: "Ben Smith <bh2smith@gmail.com>",
    description: "Node Client for Dune Analytics' officially supported API.",
    repository: "git@github.com:duneanalytics/ts-dune-client.git",
    main: "dist/cjs/index.js",
    module: "dist/esm/index.js",
    types: "dist/esm/index.d.ts",
    files: [
      "dist/**/*"
    ],
    scripts: {
      build: "rm -rf dist/* && pnpm build:esm && pnpm build:cjs && cp package.json dist",
      "build:esm": "tsc -p tsconfig.esm.json",
      "build:cjs": "tsc -p tsconfig.cjs.json",
      test: "vitest run",
      fmt: 'prettier --write "./**/*.ts"',
      lint: 'eslint ./src && prettier --check "./**/*.ts"'
    },
    packageManager: "pnpm@10.29.2",
    pnpm: {
      overrides: {
        esbuild: ">=0.28.1",
        vite: ">=8.0.16",
        "brace-expansion": ">=5.0.6"
      }
    },
    dependencies: {
      loglevel: "^1.9.2"
    },
    devDependencies: {
      "@types/node": "^26.0.0",
      "@typescript-eslint/eslint-plugin": "^8.59.2",
      "@typescript-eslint/parser": "^8.59.2",
      eslint: "^10.3.0",
      "eslint-config-prettier": "^10.1.8",
      prettier: "^3.8.3",
      tsx: "^4.21.0",
      typescript: "^6.0.3",
      vite: "^8.0.16",
      vitest: "^4.1.5"
    }
  };
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/api/router.js
var require_router = __commonJS((exports) => {
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Router = undefined;
  var types_1 = require_types();
  var package_json_1 = require_package();
  var loglevel_1 = __importDefault(require_loglevel());
  var utils_1 = require_utils();
  var BASE_URL = "https://api.dune.com/api";
  var RequestMethod;
  (function(RequestMethod2) {
    RequestMethod2["GET"] = "GET";
    RequestMethod2["POST"] = "POST";
    RequestMethod2["PATCH"] = "PATCH";
    RequestMethod2["DELETE"] = "DELETE";
  })(RequestMethod || (RequestMethod = {}));

  class Router {
    constructor(apiKey, apiVersion = "v1") {
      this.apiKey = apiKey;
      this.apiVersion = apiVersion;
    }
    async post(route, params, content_type = types_1.ContentType.Json) {
      return this._request(RequestMethod.POST, this.url(route), params, false, content_type);
    }
    async _handleResponse(responsePromise) {
      try {
        const response = await responsePromise;
        if (!response.ok) {
          const errorText = await response.text();
          throw new types_1.DuneError(`HTTP - Status: ${response.status}, Message: ${errorText}`);
        }
        return await response.json();
      } catch (error) {
        loglevel_1.default.error(utils_1.logPrefix, error);
        throw new types_1.DuneError(`Response ${error}`);
      }
    }
    async _request(method, url, payload, raw = false, content_type = types_1.ContentType.Json) {
      let body;
      if (Buffer.isBuffer(payload)) {
        body = payload;
      } else {
        body = (0, types_1.payloadJSON)(payload);
      }
      loglevel_1.default.debug(utils_1.logPrefix, `${method} received input url=${url}, payload=${body}`);
      const requestData = {
        method,
        headers: {
          "x-dune-api-key": this.apiKey,
          "User-Agent": `client-sdk@${package_json_1.version} (https://www.npmjs.com/package/@duneanalytics/client-sdk)`,
          "Content-Type": content_type
        },
        ...method !== RequestMethod.GET && {
          body
        }
      };
      let pathParams = "";
      if (method === "GET" && payload) {
        const searchParams = new URLSearchParams((0, types_1.payloadSearchParams)(payload)).toString();
        pathParams = searchParams ? `?${searchParams}` : "";
      }
      loglevel_1.default.debug("Final request URL", url + pathParams);
      const response = fetch(url + pathParams, requestData);
      if (raw) {
        return response;
      }
      return this._handleResponse(response);
    }
    async _get(route, params, raw = false) {
      return this._request(RequestMethod.GET, this.url(route), params, raw);
    }
    async _delete(route) {
      return this._request(RequestMethod.DELETE, this.url(route));
    }
    async _getByUrl(url, params, raw = false) {
      return this._request(RequestMethod.GET, url, params, raw);
    }
    async _patch(route, params) {
      return this._request(RequestMethod.PATCH, this.url(route), params);
    }
    url(route) {
      return `${BASE_URL}/${this.apiVersion}/${route}`;
    }
  }
  exports.Router = Router;
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/deprecation.js
var require_deprecation = __commonJS((exports) => {
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.deprecationWarning = deprecationWarning;
  var loglevel_1 = __importDefault(require_loglevel());
  var warnedMethods = new Set;
  function deprecationWarning(methodName, alternative, since) {
    if (warnedMethods.has(methodName)) {
      return;
    }
    warnedMethods.add(methodName);
    const sinceInfo = since ? ` since version ${since}` : "";
    loglevel_1.default.warn(`[DEPRECATION]${sinceInfo}: ${methodName}() is deprecated. Use ${alternative}() instead.`);
  }
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/constants.js
var require_constants = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.DEFAULT_GET_PARAMS = exports.MAX_NUM_ROWS_PER_BATCH = exports.DUNE_CSV_NEXT_OFFSET_HEADER = exports.DUNE_CSV_NEXT_URI_HEADER = exports.THREE_MONTHS_IN_HOURS = exports.POLL_FREQUENCY_SECONDS = undefined;
  exports.POLL_FREQUENCY_SECONDS = 1;
  exports.THREE_MONTHS_IN_HOURS = 2191;
  exports.DUNE_CSV_NEXT_URI_HEADER = "x-dune-next-uri";
  exports.DUNE_CSV_NEXT_OFFSET_HEADER = "x-dune-next-offset";
  exports.MAX_NUM_ROWS_PER_BATCH = 32000;
  exports.DEFAULT_GET_PARAMS = {
    query_parameters: [],
    limit: exports.MAX_NUM_ROWS_PER_BATCH,
    offset: 0
  };
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/api/execution.js
var require_execution = __commonJS((exports) => {
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.ExecutionAPI = undefined;
  var types_1 = require_types();
  var loglevel_1 = __importDefault(require_loglevel());
  var utils_1 = require_utils();
  var router_1 = require_router();
  var deprecation_1 = require_deprecation();
  var constants_1 = require_constants();

  class ExecutionAPI extends router_1.Router {
    async executeQuery(queryID, params = {}) {
      const { query_parameters = [], performance = types_1.QueryEngine.Medium } = params;
      const response = await this.post(`query/${queryID}/execute`, {
        query_parameters,
        performance
      });
      loglevel_1.default.debug(utils_1.logPrefix, `execute response ${JSON.stringify(response)}`);
      return response;
    }
    async executeSql(params) {
      const { sql, performance = types_1.QueryEngine.Medium } = params;
      const response = await this.post(`sql/execute`, {
        sql,
        performance
      });
      loglevel_1.default.debug(utils_1.logPrefix, `execute sql response ${JSON.stringify(response)}`);
      return response;
    }
    async executeQueryPipeline(queryID, params = {}) {
      const { performance = types_1.QueryEngine.Medium } = params;
      return this.post(`query/${queryID}/pipeline/execute`, {
        performance
      });
    }
    async cancelExecution(executionId) {
      const { success } = await this.post(`execution/${executionId}/cancel`);
      return success;
    }
    async getExecutionStatus(executionId) {
      const response = await this._get(`execution/${executionId}/status`);
      loglevel_1.default.debug(utils_1.logPrefix, `get_status response ${JSON.stringify(response)}`);
      return response;
    }
    async getExecutionResults(executionId, params = constants_1.DEFAULT_GET_PARAMS) {
      const response = await this._get(`execution/${executionId}/results`, (0, types_1.validateAndBuildGetResultParams)(params));
      loglevel_1.default.debug(utils_1.logPrefix, `get_result response ${JSON.stringify(response)}`);
      return response;
    }
    async getResultCSV(executionId, params = constants_1.DEFAULT_GET_PARAMS) {
      const response = await this._get(`execution/${executionId}/results/csv`, (0, types_1.validateAndBuildGetResultParams)(params), true);
      loglevel_1.default.debug(utils_1.logPrefix, `get_result response ${JSON.stringify(response)}`);
      return this.buildCSVResponse(response);
    }
    async getLastExecutionResults(queryId, params = constants_1.DEFAULT_GET_PARAMS, expiryAgeHours = constants_1.THREE_MONTHS_IN_HOURS) {
      const results = await this._get(`query/${queryId}/results`, (0, types_1.validateAndBuildGetResultParams)(params));
      const lastRun = results.execution_ended_at;
      const maxAge = expiryAgeHours;
      const isExpired = lastRun !== undefined && (0, utils_1.ageInHours)(lastRun) > maxAge;
      return { results: await this._fetchEntireResult(results), isExpired };
    }
    async getLastResultCSV(queryId, params = constants_1.DEFAULT_GET_PARAMS) {
      const response = await this._get(`query/${queryId}/results/csv`, (0, types_1.validateAndBuildGetResultParams)(params), true);
      return this._fetchEntireResultCSV(await this.buildCSVResponse(response));
    }
    async buildCSVResponse(response) {
      const nextOffset = response.headers.get(constants_1.DUNE_CSV_NEXT_OFFSET_HEADER);
      return {
        data: await response.text(),
        next_uri: response.headers.get(constants_1.DUNE_CSV_NEXT_URI_HEADER),
        next_offset: nextOffset ? parseInt(nextOffset) : undefined
      };
    }
    async _fetchEntireResult(results) {
      let next_uri = results.next_uri;
      let batch;
      while (next_uri !== undefined) {
        batch = await this._getByUrl(next_uri);
        results = (0, types_1.concatResultResponse)(results, batch);
        next_uri = batch.next_uri;
      }
      return results;
    }
    async _fetchEntireResultCSV(results) {
      let next_uri = results.next_uri;
      let batch;
      while (next_uri !== null) {
        batch = await this.buildCSVResponse(await this._getByUrl(next_uri, undefined, true));
        results = (0, types_1.concatResultCSV)(results, batch);
        next_uri = batch.next_uri;
      }
      return results;
    }
    async execute(queryID, parameters) {
      (0, deprecation_1.deprecationWarning)("execute", "executeQuery", "0.0.2");
      return this.executeQuery(queryID, { query_parameters: parameters });
    }
    async getStatus(jobID) {
      (0, deprecation_1.deprecationWarning)("getStatus", "getExecutionStatus", "0.0.2");
      return this.getExecutionStatus(jobID);
    }
    async getResult(jobID) {
      (0, deprecation_1.deprecationWarning)("getResult", "getExecutionResults", "0.0.2");
      return this.getExecutionResults(jobID);
    }
  }
  exports.ExecutionAPI = ExecutionAPI;
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/api/query.js
var require_query2 = __commonJS((exports) => {
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.QueryAPI = undefined;
  var router_1 = require_router();
  var types_1 = require_types();
  var loglevel_1 = __importDefault(require_loglevel());

  class QueryAPI extends router_1.Router {
    async createQuery(params) {
      if (params.is_private === undefined) {
        params.is_private = false;
      }
      params.query_parameters = params.query_parameters ? params.query_parameters : [];
      const responseJson = await this.post("query/", params);
      return responseJson.query_id;
    }
    async readQuery(queryId) {
      const responseJson = await this._get(`query/${queryId}`);
      return responseJson;
    }
    async updateQuery(queryId, params) {
      if (Object.keys(params).length === 0) {
        loglevel_1.default.warn("updateQuery: called with no proposed changes.");
        return queryId;
      }
      const responseJson = await this._patch(`query/${queryId}`, params);
      return responseJson.query_id;
    }
    async archiveQuery(queryId) {
      const response = await this.post(`query/${queryId}/archive`);
      const query = await this.readQuery(response.query_id);
      return query.is_archived;
    }
    async unarchiveQuery(queryId) {
      const response = await this.post(`query/${queryId}/unarchive`);
      const query = await this.readQuery(response.query_id);
      return query.is_archived;
    }
    async makePrivate(queryId) {
      const response = await this.post(`query/${queryId}/private`);
      const query = await this.readQuery(response.query_id);
      if (!query.is_private) {
        throw new types_1.DuneError("Query was not made private!");
      }
      return response.query_id;
    }
    async makePublic(queryId) {
      const response = await this.post(`query/${queryId}/unprivate`);
      const query = await this.readQuery(response.query_id);
      if (query.is_private) {
        throw new types_1.DuneError("Query is still private.");
      }
      return response.query_id;
    }
  }
  exports.QueryAPI = QueryAPI;
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/api/table.js
var require_table = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.TableAPI = undefined;
  var router_1 = require_router();
  var types_1 = require_types();
  var utils_1 = require_utils();
  var deprecation_1 = require_deprecation();

  class TableAPI extends router_1.Router {
    async uploadCsv(args) {
      (0, deprecation_1.deprecationWarning)("table.uploadCsv", "uploads.uploadCsv");
      const response = await this.post("table/upload/csv", args);
      try {
        return Boolean(response.success);
      } catch (error) {
        console.error(`Upload CSV Error ${error instanceof Error ? error.message : String(error)}`);
        throw new types_1.DuneError(`UploadCsvResponse ${JSON.stringify(response)}`);
      }
    }
    async create(args) {
      (0, deprecation_1.deprecationWarning)("table.create", "uploads.create");
      return this.post("table/create", (0, utils_1.withDefaults)(args, { description: "", is_private: false }));
    }
    async delete(args) {
      (0, deprecation_1.deprecationWarning)("table.delete", "uploads.delete");
      const route = `table/${args.namespace}/${args.table_name}`;
      return this._delete(route);
    }
    async insert(args) {
      (0, deprecation_1.deprecationWarning)("table.insert", "uploads.insert");
      return this.post(`table/${args.namespace}/${args.table_name}/insert`, args.data, args.content_type);
    }
  }
  exports.TableAPI = TableAPI;
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/api/custom.js
var require_custom = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.CustomAPI = undefined;
  var router_1 = require_router();

  class CustomAPI extends router_1.Router {
    async getResults(args) {
      const x = await this._get(`endpoints/${args.handle}/${args.slug}/results`, args);
      return x;
    }
  }
  exports.CustomAPI = CustomAPI;
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/api/usage.js
var require_usage = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.UsageAPI = undefined;
  var router_1 = require_router();

  class UsageAPI extends router_1.Router {
    async getUsage() {
      return this.post("usage");
    }
  }
  exports.UsageAPI = UsageAPI;
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/api/pipeline.js
var require_pipeline = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.PipelineAPI = undefined;
  var router_1 = require_router();

  class PipelineAPI extends router_1.Router {
    async getPipelineStatus(pipelineExecutionId) {
      return this._get(`pipelines/executions/${pipelineExecutionId}/status`);
    }
  }
  exports.PipelineAPI = PipelineAPI;
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/api/dataset.js
var require_dataset = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.DatasetAPI = undefined;
  var router_1 = require_router();

  class DatasetAPI extends router_1.Router {
    async list(args) {
      return this._get("datasets", args);
    }
    async getBySlug(slug) {
      return this._get(`datasets/${slug}`);
    }
  }
  exports.DatasetAPI = DatasetAPI;
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/api/uploads.js
var require_uploads = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.UploadsAPI = undefined;
  var router_1 = require_router();
  var types_1 = require_types();
  var utils_1 = require_utils();

  class UploadsAPI extends router_1.Router {
    async list(args) {
      return this._get("uploads", args);
    }
    async create(args) {
      return this.post("uploads", (0, utils_1.withDefaults)(args, { description: "", is_private: false }));
    }
    async uploadCsv(args) {
      const response = await this.post("uploads/csv", args);
      try {
        return Boolean(response.success);
      } catch (error) {
        console.error(`Upload CSV Error ${error instanceof Error ? error.message : String(error)}`);
        throw new types_1.DuneError(`UploadCsvResponse ${JSON.stringify(response)}`);
      }
    }
    async delete(args) {
      const route = `uploads/${args.namespace}/${args.table_name}`;
      return this._delete(route);
    }
    async clear(args) {
      const route = `uploads/${args.namespace}/${args.table_name}/clear`;
      return this.post(route);
    }
    async insert(args) {
      return this.post(`uploads/${args.namespace}/${args.table_name}/insert`, args.data, args.content_type);
    }
  }
  exports.UploadsAPI = UploadsAPI;
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/api/client.js
var require_client = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
  } : function(o, v) {
    o["default"] = v;
  });
  var __importStar = exports && exports.__importStar || function() {
    var ownKeys = function(o) {
      ownKeys = Object.getOwnPropertyNames || function(o2) {
        var ar = [];
        for (var k in o2)
          if (Object.prototype.hasOwnProperty.call(o2, k))
            ar[ar.length] = k;
        return ar;
      };
      return ownKeys(o);
    };
    return function(mod) {
      if (mod && mod.__esModule)
        return mod;
      var result = {};
      if (mod != null) {
        for (var k = ownKeys(mod), i = 0;i < k.length; i++)
          if (k[i] !== "default")
            __createBinding(result, mod, k[i]);
      }
      __setModuleDefault(result, mod);
      return result;
    };
  }();
  var __importDefault = exports && exports.__importDefault || function(mod) {
    return mod && mod.__esModule ? mod : { default: mod };
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.DuneClient = undefined;
  var fs = __importStar(__require("fs/promises"));
  var types_1 = require_types();
  var utils_1 = require_utils();
  var loglevel_1 = __importDefault(require_loglevel());
  var utils_2 = require_utils();
  var execution_1 = require_execution();
  var constants_1 = require_constants();
  var query_1 = require_query2();
  var table_1 = require_table();
  var custom_1 = require_custom();
  var usage_1 = require_usage();
  var pipeline_1 = require_pipeline();
  var dataset_1 = require_dataset();
  var uploads_1 = require_uploads();
  var deprecation_1 = require_deprecation();
  var TERMINAL_STATES = [
    types_1.ExecutionState.CANCELLED,
    types_1.ExecutionState.COMPLETED,
    types_1.ExecutionState.FAILED,
    types_1.ExecutionState.EXPIRED
  ];

  class DuneClient {
    constructor(apiKey) {
      this.exec = new execution_1.ExecutionAPI(apiKey);
      this.query = new query_1.QueryAPI(apiKey);
      this.table = new table_1.TableAPI(apiKey);
      this.custom = new custom_1.CustomAPI(apiKey);
      this.usage = new usage_1.UsageAPI(apiKey);
      this.pipeline = new pipeline_1.PipelineAPI(apiKey);
      this.dataset = new dataset_1.DatasetAPI(apiKey);
      this.uploads = new uploads_1.UploadsAPI(apiKey);
    }
    async runQuery(args) {
      const { queryId, opts } = args;
      args.limit = opts?.batchSize || args.limit;
      const { state, execution_id } = await this.refreshResults(queryId, args, opts?.pingFrequency);
      if (state === types_1.ExecutionState.COMPLETED) {
        return this.exec.getExecutionResults(execution_id, args);
      } else {
        const message = `Refresh returned an incomplete terminal state`;
        loglevel_1.default.error(utils_2.logPrefix, {
          message,
          execution_id,
          state
        });
        throw new types_1.DuneError(`${message} (execution_id=${execution_id}, state=${state})`);
      }
    }
    async runQueryCSV(args) {
      const { queryId, opts } = args;
      args.limit = opts?.batchSize || args.limit;
      const { state, execution_id } = await this.refreshResults(queryId, args, opts?.pingFrequency);
      if (state === types_1.ExecutionState.COMPLETED) {
        return this.exec.getLastResultCSV(queryId, args);
      } else {
        const message = `refresh (execution ${execution_id}) yields incomplete terminal state ${state}`;
        loglevel_1.default.error(utils_2.logPrefix, message);
        throw new types_1.DuneError(message);
      }
    }
    async getLatestResult(args) {
      const { queryId, opts } = args;
      args.limit = opts?.batchSize || args.limit;
      const lastestResults = await this.exec.getLastExecutionResults(queryId, args, opts?.maxAgeHours);
      let results;
      if (lastestResults.isExpired) {
        loglevel_1.default.info(utils_2.logPrefix, `results expired, re-running query.`);
        results = await this.runQuery(args);
      } else {
        results = lastestResults.results;
      }
      return results;
    }
    async downloadCSV(args, outFile) {
      const { queryId, opts } = args;
      args.limit = opts?.batchSize || args.limit;
      const { isExpired } = await this.exec.getLastExecutionResults(queryId, args, args.opts?.maxAgeHours);
      let results;
      if (isExpired) {
        results = this.runQueryCSV(args);
      } else {
        results = this.exec.getLastResultCSV(args.queryId, args);
      }
      const csvData = (await results).data;
      await fs.writeFile(outFile, csvData, "utf8");
      loglevel_1.default.info(`CSV data has been saved to ${outFile}`);
    }
    async runSql(args) {
      const { name, query_sql, isPrivate, query_parameters, archiveAfter } = args;
      const queryId = await this.query.createQuery({
        name: name ? name : "API Query",
        query_sql,
        query_parameters,
        is_private: isPrivate
      });
      let results;
      try {
        results = await this.runQuery({ queryId, ...args });
      } finally {
        if (archiveAfter) {
          await this.query.archiveQuery(queryId);
        }
      }
      return results;
    }
    async refreshResults(queryId, params, pingFrequency = constants_1.POLL_FREQUENCY_SECONDS) {
      loglevel_1.default.info(utils_2.logPrefix, `refreshing query https://dune.com/queries/${queryId} with parameters ${JSON.stringify(params)}`);
      const { execution_id } = await this.exec.executeQuery(queryId, params);
      let status = await this.exec.getExecutionStatus(execution_id);
      while (!TERMINAL_STATES.includes(status.state)) {
        loglevel_1.default.info(utils_2.logPrefix, `waiting for query execution ${execution_id} to complete: current state ${status.state}`);
        await (0, utils_1.sleep)(pingFrequency);
        status = await this.exec.getExecutionStatus(execution_id);
      }
      return status;
    }
    async refresh(queryID, parameters = [], pingFrequency) {
      (0, deprecation_1.deprecationWarning)("refresh", "runQuery", "0.0.2");
      return this.runQuery({
        queryId: queryID,
        query_parameters: parameters,
        opts: { pingFrequency }
      });
    }
  }
  exports.DuneClient = DuneClient;
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/api/index.js
var require_api = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = exports && exports.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  __exportStar(require_client(), exports);
  __exportStar(require_custom(), exports);
  __exportStar(require_dataset(), exports);
  __exportStar(require_execution(), exports);
  __exportStar(require_pipeline(), exports);
  __exportStar(require_query2(), exports);
  __exportStar(require_router(), exports);
  __exportStar(require_table(), exports);
  __exportStar(require_uploads(), exports);
  __exportStar(require_usage(), exports);
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/paginator.js
var require_paginator = __commonJS((exports) => {
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Paginator = undefined;
  var types_1 = require_types();

  class Paginator {
    constructor(client, executionId, pageSize, firstPage, totalRows) {
      this.client = client;
      this.executionId = executionId;
      this.pageSize = pageSize;
      this.currentPageNumber = firstPage.number;
      this.pageCache = new Map;
      this.pageCache.set(this.currentPageNumber, firstPage);
      this.totalRows = totalRows;
    }
    static async new(client, executionStatus, pageLimit) {
      if (executionStatus.state !== types_1.ExecutionState.COMPLETED) {
        throw new Error("Paginator can only be constructed on Complete execution state.");
      }
      const executionId = executionStatus.execution_id;
      const results = await client.getExecutionResults(executionId, {
        limit: pageLimit,
        offset: 0
      });
      if (!results.result) {
        throw new Error("Can't paginate execution without results.");
      }
      const totalRows = results.result.metadata.total_row_count;
      const firstPage = {
        number: 1,
        values: results.result.rows
      };
      return new Paginator(client, executionId, pageLimit, firstPage, totalRows);
    }
    maxPage() {
      return Math.ceil(this.totalRows / this.pageSize);
    }
    async nextPage() {
      if (this.currentPageNumber < this.maxPage()) {
        const nextPage = await this.getPage(this.currentPageNumber + 1);
        this.currentPageNumber++;
        return nextPage;
      }
      console.warn("You are already on the last page!");
      return;
    }
    async previousPage() {
      if (this.currentPageNumber > 1) {
        const previousPage = await this.getPage(this.currentPageNumber - 1);
        this.currentPageNumber--;
        return previousPage;
      }
      console.warn("You are already on the first page.");
      return;
    }
    async lastPage() {
      const lastPage = await this.getPage(this.maxPage());
      this.currentPageNumber = this.maxPage();
      return lastPage;
    }
    async getPage(n) {
      if (n >= 1 && n <= this.maxPage()) {
        if (this.pageCache.has(n)) {
          return this.pageCache.get(n);
        }
        const pageNResults = await this.client.getExecutionResults(this.executionId, {
          limit: this.pageSize,
          offset: this.pageSize * (n - 1)
        });
        if (!pageNResults.result) {
          throw new Error(`Expected results for page ${n} of ${this.maxPage}`);
        }
        const pageN = {
          number: n,
          values: pageNResults.result.rows
        };
        this.pageCache.set(n, pageN);
        return pageN;
      }
      console.warn(`Invalid page number requested ${n}: Must be contained in [1, ${this.maxPage()}]`);
      return;
    }
    getCurrentPageValues() {
      return this.pageCache.get(this.currentPageNumber);
    }
  }
  exports.Paginator = Paginator;
});

// node_modules/@duneanalytics/client-sdk/dist/cjs/index.js
var require_cjs = __commonJS((exports) => {
  var __createBinding = exports && exports.__createBinding || (Object.create ? function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() {
        return m[k];
      } };
    }
    Object.defineProperty(o, k2, desc);
  } : function(o, m, k, k2) {
    if (k2 === undefined)
      k2 = k;
    o[k2] = m[k];
  });
  var __exportStar = exports && exports.__exportStar || function(m, exports2) {
    for (var p in m)
      if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p))
        __createBinding(exports2, m, p);
  };
  Object.defineProperty(exports, "__esModule", { value: true });
  exports.Paginator = exports.UploadsAPI = exports.DatasetAPI = exports.PipelineAPI = exports.UsageAPI = exports.TableAPI = exports.CustomAPI = exports.ExecutionAPI = exports.QueryAPI = exports.DuneClient = undefined;
  var api_1 = require_api();
  Object.defineProperty(exports, "DuneClient", { enumerable: true, get: function() {
    return api_1.DuneClient;
  } });
  Object.defineProperty(exports, "QueryAPI", { enumerable: true, get: function() {
    return api_1.QueryAPI;
  } });
  Object.defineProperty(exports, "ExecutionAPI", { enumerable: true, get: function() {
    return api_1.ExecutionAPI;
  } });
  Object.defineProperty(exports, "CustomAPI", { enumerable: true, get: function() {
    return api_1.CustomAPI;
  } });
  Object.defineProperty(exports, "TableAPI", { enumerable: true, get: function() {
    return api_1.TableAPI;
  } });
  Object.defineProperty(exports, "UsageAPI", { enumerable: true, get: function() {
    return api_1.UsageAPI;
  } });
  Object.defineProperty(exports, "PipelineAPI", { enumerable: true, get: function() {
    return api_1.PipelineAPI;
  } });
  Object.defineProperty(exports, "DatasetAPI", { enumerable: true, get: function() {
    return api_1.DatasetAPI;
  } });
  Object.defineProperty(exports, "UploadsAPI", { enumerable: true, get: function() {
    return api_1.UploadsAPI;
  } });
  __exportStar(require_types(), exports);
  var paginator_1 = require_paginator();
  Object.defineProperty(exports, "Paginator", { enumerable: true, get: function() {
    return paginator_1.Paginator;
  } });
});

// src/dune.ts
var import_client_sdk = __toESM(require_cjs(), 1);
// node_modules/diff/libesm/diff/base.js
class Diff {
  diff(oldStr, newStr, options = {}) {
    let callback;
    if (typeof options === "function") {
      callback = options;
      options = {};
    } else if ("callback" in options) {
      callback = options.callback;
    }
    const oldString = this.castInput(oldStr, options);
    const newString = this.castInput(newStr, options);
    const oldTokens = this.removeEmpty(this.tokenize(oldString, options));
    const newTokens = this.removeEmpty(this.tokenize(newString, options));
    return this.diffWithOptionsObj(oldTokens, newTokens, options, callback);
  }
  diffWithOptionsObj(oldTokens, newTokens, options, callback) {
    var _a;
    const done = (value) => {
      value = this.postProcess(value, options);
      if (callback) {
        setTimeout(function() {
          callback(value);
        }, 0);
        return;
      } else {
        return value;
      }
    };
    const newLen = newTokens.length, oldLen = oldTokens.length;
    let editLength = 1;
    let maxEditLength = newLen + oldLen;
    if (options.maxEditLength != null) {
      maxEditLength = Math.min(maxEditLength, options.maxEditLength);
    }
    const maxExecutionTime = (_a = options.timeout) !== null && _a !== undefined ? _a : Infinity;
    const abortAfterTimestamp = Date.now() + maxExecutionTime;
    const bestPath = [{ oldPos: -1, lastComponent: undefined }];
    let newPos = this.extractCommon(bestPath[0], newTokens, oldTokens, 0, options);
    if (bestPath[0].oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
      return done(this.buildValues(bestPath[0].lastComponent, newTokens, oldTokens));
    }
    let minDiagonalToConsider = -Infinity, maxDiagonalToConsider = Infinity;
    const execEditLength = () => {
      for (let diagonalPath = Math.max(minDiagonalToConsider, -editLength);diagonalPath <= Math.min(maxDiagonalToConsider, editLength); diagonalPath += 2) {
        let basePath;
        const removePath = bestPath[diagonalPath - 1], addPath = bestPath[diagonalPath + 1];
        if (removePath) {
          bestPath[diagonalPath - 1] = undefined;
        }
        let canAdd = false;
        if (addPath) {
          const addPathNewPos = addPath.oldPos - diagonalPath;
          canAdd = addPath && 0 <= addPathNewPos && addPathNewPos < newLen;
        }
        const canRemove = removePath && removePath.oldPos + 1 < oldLen;
        if (!canAdd && !canRemove) {
          bestPath[diagonalPath] = undefined;
          continue;
        }
        if (!canRemove || canAdd && removePath.oldPos < addPath.oldPos) {
          basePath = this.addToPath(addPath, true, false, 0, options);
        } else {
          basePath = this.addToPath(removePath, false, true, 1, options);
        }
        newPos = this.extractCommon(basePath, newTokens, oldTokens, diagonalPath, options);
        if (basePath.oldPos + 1 >= oldLen && newPos + 1 >= newLen) {
          return done(this.buildValues(basePath.lastComponent, newTokens, oldTokens)) || true;
        } else {
          bestPath[diagonalPath] = basePath;
          if (basePath.oldPos + 1 >= oldLen) {
            maxDiagonalToConsider = Math.min(maxDiagonalToConsider, diagonalPath - 1);
          }
          if (newPos + 1 >= newLen) {
            minDiagonalToConsider = Math.max(minDiagonalToConsider, diagonalPath + 1);
          }
        }
      }
      editLength++;
    };
    if (callback) {
      (function exec() {
        setTimeout(function() {
          if (editLength > maxEditLength || Date.now() > abortAfterTimestamp) {
            return callback(undefined);
          }
          if (!execEditLength()) {
            exec();
          }
        }, 0);
      })();
    } else {
      while (editLength <= maxEditLength && Date.now() <= abortAfterTimestamp) {
        const ret = execEditLength();
        if (ret) {
          return ret;
        }
      }
    }
  }
  addToPath(path, added, removed, oldPosInc, options) {
    const last = path.lastComponent;
    if (last && !options.oneChangePerToken && last.added === added && last.removed === removed) {
      return {
        oldPos: path.oldPos + oldPosInc,
        lastComponent: { count: last.count + 1, added, removed, previousComponent: last.previousComponent }
      };
    } else {
      return {
        oldPos: path.oldPos + oldPosInc,
        lastComponent: { count: 1, added, removed, previousComponent: last }
      };
    }
  }
  extractCommon(basePath, newTokens, oldTokens, diagonalPath, options) {
    const newLen = newTokens.length, oldLen = oldTokens.length;
    let oldPos = basePath.oldPos, newPos = oldPos - diagonalPath, commonCount = 0;
    while (newPos + 1 < newLen && oldPos + 1 < oldLen && this.equals(oldTokens[oldPos + 1], newTokens[newPos + 1], options)) {
      newPos++;
      oldPos++;
      commonCount++;
      if (options.oneChangePerToken) {
        basePath.lastComponent = { count: 1, previousComponent: basePath.lastComponent, added: false, removed: false };
      }
    }
    if (commonCount && !options.oneChangePerToken) {
      basePath.lastComponent = { count: commonCount, previousComponent: basePath.lastComponent, added: false, removed: false };
    }
    basePath.oldPos = oldPos;
    return newPos;
  }
  equals(left, right, options) {
    if (options.comparator) {
      return options.comparator(left, right);
    } else {
      return left === right || !!options.ignoreCase && left.toLowerCase() === right.toLowerCase();
    }
  }
  removeEmpty(array) {
    const ret = [];
    for (let i = 0;i < array.length; i++) {
      if (array[i]) {
        ret.push(array[i]);
      }
    }
    return ret;
  }
  castInput(value, options) {
    return value;
  }
  tokenize(value, options) {
    return Array.from(value);
  }
  join(chars) {
    return chars.join("");
  }
  postProcess(changeObjects, options) {
    return changeObjects;
  }
  get useLongestToken() {
    return false;
  }
  buildValues(lastComponent, newTokens, oldTokens) {
    const components = [];
    let nextComponent;
    while (lastComponent) {
      components.push(lastComponent);
      nextComponent = lastComponent.previousComponent;
      delete lastComponent.previousComponent;
      lastComponent = nextComponent;
    }
    components.reverse();
    const componentLen = components.length;
    let componentPos = 0, newPos = 0, oldPos = 0;
    for (;componentPos < componentLen; componentPos++) {
      const component = components[componentPos];
      if (!component.removed) {
        if (!component.added && this.useLongestToken) {
          let value = newTokens.slice(newPos, newPos + component.count);
          value = value.map(function(value2, i) {
            const oldValue = oldTokens[oldPos + i];
            return oldValue.length > value2.length ? oldValue : value2;
          });
          component.value = this.join(value);
        } else {
          component.value = this.join(newTokens.slice(newPos, newPos + component.count));
        }
        newPos += component.count;
        if (!component.added) {
          oldPos += component.count;
        }
      } else {
        component.value = this.join(oldTokens.slice(oldPos, oldPos + component.count));
        oldPos += component.count;
      }
    }
    return components;
  }
}

// node_modules/diff/libesm/diff/line.js
class LineDiff extends Diff {
  constructor() {
    super(...arguments);
    this.tokenize = tokenize;
  }
  equals(left, right, options) {
    if (options.ignoreWhitespace) {
      if (!options.newlineIsToken || !left.includes(`
`)) {
        left = left.trim();
      }
      if (!options.newlineIsToken || !right.includes(`
`)) {
        right = right.trim();
      }
    } else if (options.ignoreNewlineAtEof && !options.newlineIsToken) {
      if (left.endsWith(`
`)) {
        left = left.slice(0, -1);
      }
      if (right.endsWith(`
`)) {
        right = right.slice(0, -1);
      }
    }
    return super.equals(left, right, options);
  }
}
var lineDiff = new LineDiff;
function diffLines(oldStr, newStr, options) {
  return lineDiff.diff(oldStr, newStr, options);
}
function tokenize(value, options) {
  if (options.stripTrailingCr) {
    value = value.replace(/\r\n/g, `
`);
  }
  const retLines = [], linesAndNewlines = value.split(/(\n|\r\n)/);
  if (!linesAndNewlines[linesAndNewlines.length - 1]) {
    linesAndNewlines.pop();
  }
  for (let i = 0;i < linesAndNewlines.length; i++) {
    const line = linesAndNewlines[i];
    if (i % 2 && !options.newlineIsToken) {
      retLines[retLines.length - 1] += line;
    } else {
      retLines.push(line);
    }
  }
  return retLines;
}

// node_modules/diff/libesm/patch/create.js
function needsQuoting(s) {
  for (let i = 0;i < s.length; i++) {
    if (s[i] < " " || s[i] > "~" || s[i] === '"' || s[i] === "\\") {
      return true;
    }
  }
  return false;
}
function quoteFileNameIfNeeded(s) {
  if (!needsQuoting(s)) {
    return s;
  }
  let result = '"';
  const bytes = new TextEncoder().encode(s);
  let i = 0;
  while (i < bytes.length) {
    const b = bytes[i];
    if (b === 7) {
      result += "\\a";
    } else if (b === 8) {
      result += "\\b";
    } else if (b === 9) {
      result += "\\t";
    } else if (b === 10) {
      result += "\\n";
    } else if (b === 11) {
      result += "\\v";
    } else if (b === 12) {
      result += "\\f";
    } else if (b === 13) {
      result += "\\r";
    } else if (b === 34) {
      result += "\\\"";
    } else if (b === 92) {
      result += "\\\\";
    } else if (b >= 32 && b <= 126) {
      result += String.fromCharCode(b);
    } else {
      result += "\\" + b.toString(8).padStart(3, "0");
    }
    i++;
  }
  result += '"';
  return result;
}
var INCLUDE_HEADERS = {
  includeIndex: true,
  includeUnderline: true,
  includeFileHeaders: true
};
function structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
  let optionsObj;
  if (!options) {
    optionsObj = {};
  } else if (typeof options === "function") {
    optionsObj = { callback: options };
  } else {
    optionsObj = options;
  }
  if (typeof optionsObj.context === "undefined") {
    optionsObj.context = 4;
  }
  const context = optionsObj.context;
  if (optionsObj.newlineIsToken) {
    throw new Error("newlineIsToken may not be used with patch-generation functions, only with diffing functions");
  }
  if (!optionsObj.callback) {
    return diffLinesResultToPatch(diffLines(oldStr, newStr, optionsObj));
  } else {
    const { callback } = optionsObj;
    diffLines(oldStr, newStr, Object.assign(Object.assign({}, optionsObj), { callback: (diff) => {
      const patch = diffLinesResultToPatch(diff);
      callback(patch);
    } }));
  }
  function diffLinesResultToPatch(diff) {
    if (!diff) {
      return;
    }
    diff.push({ value: "", lines: [] });
    function contextLines(lines) {
      return lines.map(function(entry) {
        return " " + entry;
      });
    }
    const hunks = [];
    let oldRangeStart = 0, newRangeStart = 0, curRange = [], oldLine = 1, newLine = 1;
    for (let i = 0;i < diff.length; i++) {
      const current = diff[i], lines = current.lines || splitLines(current.value);
      current.lines = lines;
      if (current.added || current.removed) {
        if (!oldRangeStart) {
          const prev = diff[i - 1];
          oldRangeStart = oldLine;
          newRangeStart = newLine;
          if (prev) {
            curRange = context > 0 ? contextLines(prev.lines.slice(-context)) : [];
            oldRangeStart -= curRange.length;
            newRangeStart -= curRange.length;
          }
        }
        for (const line of lines) {
          curRange.push((current.added ? "+" : "-") + line);
        }
        if (current.added) {
          newLine += lines.length;
        } else {
          oldLine += lines.length;
        }
      } else {
        if (oldRangeStart) {
          if (lines.length <= context * 2 && i < diff.length - 2) {
            for (const line of contextLines(lines)) {
              curRange.push(line);
            }
          } else {
            const contextSize = Math.min(lines.length, context);
            for (const line of contextLines(lines.slice(0, contextSize))) {
              curRange.push(line);
            }
            const hunk = {
              oldStart: oldRangeStart,
              oldLines: oldLine - oldRangeStart + contextSize,
              newStart: newRangeStart,
              newLines: newLine - newRangeStart + contextSize,
              lines: curRange
            };
            hunks.push(hunk);
            oldRangeStart = 0;
            newRangeStart = 0;
            curRange = [];
          }
        }
        oldLine += lines.length;
        newLine += lines.length;
      }
    }
    for (const hunk of hunks) {
      for (let i = 0;i < hunk.lines.length; i++) {
        if (hunk.lines[i].endsWith(`
`)) {
          hunk.lines[i] = hunk.lines[i].slice(0, -1);
        } else {
          hunk.lines.splice(i + 1, 0, "\\ No newline at end of file");
          i++;
        }
      }
    }
    return {
      oldFileName,
      newFileName,
      oldHeader,
      newHeader,
      hunks
    };
  }
}
function formatPatch(patch, headerOptions) {
  var _a, _b, _c, _d, _e, _f;
  if (!headerOptions) {
    headerOptions = INCLUDE_HEADERS;
  }
  if (Array.isArray(patch)) {
    if (patch.length > 1 && !headerOptions.includeFileHeaders && !patch.every((p) => p.isGit)) {
      throw new Error("Cannot omit file headers on a multi-file patch. " + "(The result would be unparseable; how would a tool trying to apply " + "the patch know which changes are to which file?)");
    }
    return patch.map((p) => formatPatch(p, headerOptions)).join(`
`);
  }
  const ret = [];
  if (patch.isGit) {
    headerOptions = INCLUDE_HEADERS;
    if (!patch.oldFileName) {
      throw new Error("oldFileName must be specified for Git patches");
    }
    if (!patch.newFileName) {
      throw new Error("newFileName must be specified for Git patches");
    }
    let gitOldName = patch.oldFileName;
    let gitNewName = patch.newFileName;
    if (patch.isCreate && gitOldName === "/dev/null") {
      gitOldName = gitNewName.replace(/^b\//, "a/");
    } else if (patch.isDelete && gitNewName === "/dev/null") {
      gitNewName = gitOldName.replace(/^a\//, "b/");
    }
    ret.push("diff --git " + quoteFileNameIfNeeded(gitOldName) + " " + quoteFileNameIfNeeded(gitNewName));
    if (patch.isDelete) {
      ret.push("deleted file mode " + ((_a = patch.oldMode) !== null && _a !== undefined ? _a : "100644"));
    }
    if (patch.isCreate) {
      ret.push("new file mode " + ((_b = patch.newMode) !== null && _b !== undefined ? _b : "100644"));
    }
    if (patch.oldMode && patch.newMode && !patch.isDelete && !patch.isCreate) {
      ret.push("old mode " + patch.oldMode);
      ret.push("new mode " + patch.newMode);
    }
    if (patch.isRename) {
      ret.push("rename from " + quoteFileNameIfNeeded(((_c = patch.oldFileName) !== null && _c !== undefined ? _c : "").replace(/^a\//, "")));
      ret.push("rename to " + quoteFileNameIfNeeded(((_d = patch.newFileName) !== null && _d !== undefined ? _d : "").replace(/^b\//, "")));
    }
    if (patch.isCopy) {
      ret.push("copy from " + quoteFileNameIfNeeded(((_e = patch.oldFileName) !== null && _e !== undefined ? _e : "").replace(/^a\//, "")));
      ret.push("copy to " + quoteFileNameIfNeeded(((_f = patch.newFileName) !== null && _f !== undefined ? _f : "").replace(/^b\//, "")));
    }
  } else {
    if (headerOptions.includeIndex && patch.oldFileName == patch.newFileName && patch.oldFileName !== undefined) {
      ret.push("Index: " + patch.oldFileName);
    }
    if (headerOptions.includeUnderline) {
      ret.push("===================================================================");
    }
  }
  const hasHunks = patch.hunks.length > 0;
  if (headerOptions.includeFileHeaders && patch.oldFileName !== undefined && patch.newFileName !== undefined && (!patch.isGit || hasHunks)) {
    ret.push("--- " + quoteFileNameIfNeeded(patch.oldFileName) + (patch.oldHeader ? "\t" + patch.oldHeader : ""));
    ret.push("+++ " + quoteFileNameIfNeeded(patch.newFileName) + (patch.newHeader ? "\t" + patch.newHeader : ""));
  }
  for (let i = 0;i < patch.hunks.length; i++) {
    const hunk = patch.hunks[i];
    const oldStart = hunk.oldLines === 0 ? hunk.oldStart - 1 : hunk.oldStart;
    const newStart = hunk.newLines === 0 ? hunk.newStart - 1 : hunk.newStart;
    ret.push("@@ -" + oldStart + "," + hunk.oldLines + " +" + newStart + "," + hunk.newLines + " @@");
    for (const line of hunk.lines) {
      ret.push(line);
    }
  }
  return ret.join(`
`) + `
`;
}
function createTwoFilesPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options) {
  if (typeof options === "function") {
    options = { callback: options };
  }
  if (!(options === null || options === undefined ? undefined : options.callback)) {
    const patchObj = structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, options);
    if (!patchObj) {
      return;
    }
    return formatPatch(patchObj, options === null || options === undefined ? undefined : options.headerOptions);
  } else {
    const { callback } = options;
    structuredPatch(oldFileName, newFileName, oldStr, newStr, oldHeader, newHeader, Object.assign(Object.assign({}, options), { callback: (patchObj) => {
      if (!patchObj) {
        callback(undefined);
      } else {
        callback(formatPatch(patchObj, options.headerOptions));
      }
    } }));
  }
}
function splitLines(text) {
  const hasTrailingNl = text.endsWith(`
`);
  const result = text.split(`
`).map((line) => line + `
`);
  if (hasTrailingNl) {
    result.pop();
  } else {
    result.push(result.pop().slice(0, -1));
  }
  return result;
}
// src/files.ts
import { readFileSync, existsSync } from "node:fs";
import { dirname, join } from "node:path";
import { execSync } from "node:child_process";

// node_modules/smol-toml/dist/date.js
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var DATE_TIME_RE = /^(\d{4}-\d{2}-\d{2})?[T ]?(?:(\d{2}):\d{2}(?::\d{2}(?:\.\d+)?)?)?(Z|[-+]\d{2}:\d{2})?$/i;

class TomlDate extends Date {
  #hasDate = false;
  #hasTime = false;
  #offset = null;
  constructor(date) {
    let hasDate = true;
    let hasTime = true;
    let offset = "Z";
    if (typeof date === "string") {
      let match = date.match(DATE_TIME_RE);
      if (match) {
        if (!match[1]) {
          hasDate = false;
          date = `0000-01-01T${date}`;
        }
        hasTime = !!match[2];
        hasTime && date[10] === " " && (date = date.replace(" ", "T"));
        if (match[2] && +match[2] > 23) {
          date = "";
        } else {
          offset = match[3] || null;
          date = date.toUpperCase();
          if (!offset && hasTime)
            date += "Z";
        }
      } else {
        date = "";
      }
    }
    super(date);
    if (!isNaN(this.getTime())) {
      this.#hasDate = hasDate;
      this.#hasTime = hasTime;
      this.#offset = offset;
    }
  }
  isDateTime() {
    return this.#hasDate && this.#hasTime;
  }
  isLocal() {
    return !this.#hasDate || !this.#hasTime || !this.#offset;
  }
  isDate() {
    return this.#hasDate && !this.#hasTime;
  }
  isTime() {
    return this.#hasTime && !this.#hasDate;
  }
  isValid() {
    return this.#hasDate || this.#hasTime;
  }
  toISOString() {
    let iso = super.toISOString();
    if (this.isDate())
      return iso.slice(0, 10);
    if (this.isTime())
      return iso.slice(11, 23);
    if (this.#offset === null)
      return iso.slice(0, -1);
    if (this.#offset === "Z")
      return iso;
    let offset = +this.#offset.slice(1, 3) * 60 + +this.#offset.slice(4, 6);
    offset = this.#offset[0] === "-" ? offset : -offset;
    let offsetDate = new Date(this.getTime() - offset * 60000);
    return offsetDate.toISOString().slice(0, -1) + this.#offset;
  }
  static wrapAsOffsetDateTime(jsDate, offset = "Z") {
    let date = new TomlDate(jsDate);
    date.#offset = offset;
    return date;
  }
  static wrapAsLocalDateTime(jsDate) {
    let date = new TomlDate(jsDate);
    date.#offset = null;
    return date;
  }
  static wrapAsLocalDate(jsDate) {
    let date = new TomlDate(jsDate);
    date.#hasTime = false;
    date.#offset = null;
    return date;
  }
  static wrapAsLocalTime(jsDate) {
    let date = new TomlDate(jsDate);
    date.#hasDate = false;
    date.#offset = null;
    return date;
  }
}

// node_modules/smol-toml/dist/error.js
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
function getLineColFromPtr(string, ptr) {
  let lines = string.slice(0, ptr).split(/\r\n|\n|\r/g);
  return [lines.length, lines.pop().length + 1];
}
function makeCodeBlock(string, line, column) {
  let lines = string.split(/\r\n|\n|\r/g);
  let codeblock = "";
  let numberLen = (Math.log10(line + 1) | 0) + 1;
  for (let i = line - 1;i <= line + 1; i++) {
    let l = lines[i - 1];
    if (!l)
      continue;
    codeblock += i.toString().padEnd(numberLen, " ");
    codeblock += ":  ";
    codeblock += l;
    codeblock += `
`;
    if (i === line) {
      codeblock += " ".repeat(numberLen + column + 2);
      codeblock += `^
`;
    }
  }
  return codeblock;
}

class TomlError extends Error {
  line;
  column;
  codeblock;
  constructor(message, options) {
    const [line, column] = getLineColFromPtr(options.toml, options.ptr);
    const codeblock = makeCodeBlock(options.toml, line, column);
    super(`Invalid TOML document: ${message}

${codeblock}`, options);
    this.line = line;
    this.column = column;
    this.codeblock = codeblock;
  }
}

// node_modules/smol-toml/dist/primitive.js
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var INT_REGEX = /^((0x[0-9a-fA-F](_?[0-9a-fA-F])*)|(([+-]|0[ob])?\d(_?\d)*))$/;
var FLOAT_REGEX = /^[+-]?\d(_?\d)*(\.\d(_?\d)*)?([eE][+-]?\d(_?\d)*)?$/;
var LEADING_ZERO = /^[+-]?0[0-9_]/;
function parseString(str, ptr) {
  let c = str[ptr++];
  let first = c;
  let isLiteral = c === "'";
  let isMultiline = c === str[ptr] && c === str[ptr + 1];
  if (isMultiline) {
    if (str[ptr += 2] === `
`)
      ptr++;
    else if (str[ptr] === "\r" && str[ptr + 1] === `
`)
      ptr += 2;
  }
  let parsed = "";
  let sliceStart = ptr;
  let state = 0;
  for (let i = ptr;i < str.length; i++) {
    c = str[i];
    if (isMultiline && (c === `
` || c === "\r" && str[i + 1] === `
`)) {
      state = state && 3;
    } else if (c < " " && c !== "\t" || c === "") {
      throw new TomlError("control characters are not allowed in strings", {
        toml: str,
        ptr: i
      });
    } else if ((!state || state === 3) && c === first && (!isMultiline || str[i + 1] === first && str[i + 2] === first)) {
      if (isMultiline) {
        if (str[i + 3] === first)
          i++;
        if (str[i + 3] === first)
          i++;
      }
      return [
        state ? parsed : parsed + str.slice(sliceStart, i),
        i + (isMultiline ? 3 : 1)
      ];
    } else if (!state) {
      if (!isLiteral && c === "\\") {
        parsed += str.slice(sliceStart, sliceStart = i);
        state = 1;
      }
    } else if (state === 1) {
      if (c === "x" || c === "u" || c === "U") {
        let value = 0;
        let len = c === "x" ? 2 : c === "u" ? 4 : 8;
        for (let j = 0;j < len; j++, i++) {
          let hex = str.charCodeAt(i + 1);
          let digit = hex >= 48 && hex <= 57 ? hex - 48 : hex >= 65 && hex <= 70 ? hex - 65 + 10 : hex >= 97 && hex <= 102 ? hex - 97 + 10 : -1;
          if (digit < 0)
            throw new TomlError("invalid non-hex character in unicode escape", { toml: str, ptr: i + 1 });
          value = value << 4 | digit;
        }
        if (value < 0 || value > 1114111 || value >= 55296 && value <= 57343) {
          throw new TomlError("invalid unicode escape", { toml: str, ptr: i });
        }
        parsed += String.fromCodePoint(value);
        sliceStart = i + 1;
        state = 0;
      } else if (c === " " || c === "\t") {
        state = 2;
      } else {
        if (c === "b")
          parsed += "\b";
        else if (c === "t")
          parsed += "\t";
        else if (c === "n")
          parsed += `
`;
        else if (c === "f")
          parsed += "\f";
        else if (c === "r")
          parsed += "\r";
        else if (c === "e")
          parsed += "\x1B";
        else if (c === '"')
          parsed += '"';
        else if (c === "\\")
          parsed += "\\";
        else
          throw new TomlError("unrecognized escape sequence", { toml: str, ptr: i });
        sliceStart = i + 1;
        state = 0;
      }
    } else if (c !== " " && c !== "\t") {
      if (state === 2) {
        throw new TomlError("invalid escape: only line-ending whitespace may be escaped", {
          toml: str,
          ptr: sliceStart
        });
      }
      state = !isLiteral && c === "\\" ? 1 : 0;
      sliceStart = i;
    }
  }
  throw new TomlError("unfinished string", { toml: str, ptr });
}
function parseValue(value, toml, ptr, integersAsBigInt) {
  if (value === "true")
    return true;
  if (value === "false")
    return false;
  if (value === "-inf")
    return -Infinity;
  if (value === "inf" || value === "+inf")
    return Infinity;
  if (value === "nan" || value === "+nan" || value === "-nan")
    return NaN;
  if (value === "-0")
    return integersAsBigInt ? 0n : 0;
  let isInt = INT_REGEX.test(value);
  if (isInt || FLOAT_REGEX.test(value)) {
    if (LEADING_ZERO.test(value)) {
      throw new TomlError("leading zeroes are not allowed", {
        toml,
        ptr
      });
    }
    value = value.replace(/_/g, "");
    let numeric = +value;
    if (isNaN(numeric)) {
      throw new TomlError("invalid number", {
        toml,
        ptr
      });
    }
    if (isInt) {
      if ((isInt = !Number.isSafeInteger(numeric)) && !integersAsBigInt) {
        throw new TomlError("integer value cannot be represented losslessly", {
          toml,
          ptr
        });
      }
      if (isInt || integersAsBigInt === true)
        numeric = BigInt(value);
    }
    return numeric;
  }
  const date = new TomlDate(value);
  if (!date.isValid()) {
    throw new TomlError("invalid value", {
      toml,
      ptr
    });
  }
  return date;
}

// node_modules/smol-toml/dist/util.js
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
function indexOfNewline(str, start = 0, end = str.length) {
  let idx = str.indexOf(`
`, start);
  if (str[idx - 1] === "\r")
    idx--;
  return idx <= end ? idx : -1;
}
function skipComment(str, ptr) {
  for (let i = ptr;i < str.length; i++) {
    let c = str[i];
    if (c === `
`)
      return i;
    if (c === "\r" && str[i + 1] === `
`)
      return i + 1;
    if (c < " " && c !== "\t" || c === "") {
      throw new TomlError("control characters are not allowed in comments", {
        toml: str,
        ptr
      });
    }
  }
  return str.length;
}
function skipVoid(str, ptr, banNewLines, banComments) {
  let c;
  while (true) {
    while ((c = str[ptr]) === " " || c === "\t" || !banNewLines && (c === `
` || c === "\r" && str[ptr + 1] === `
`))
      ptr++;
    if (banComments || c !== "#")
      break;
    ptr = skipComment(str, ptr);
  }
  return ptr;
}
function skipUntil(str, ptr, sep, end, banNewLines = false) {
  if (!end) {
    ptr = indexOfNewline(str, ptr);
    return ptr < 0 ? str.length : ptr;
  }
  for (let i = ptr;i < str.length; i++) {
    let c = str[i];
    if (c === "#") {
      i = indexOfNewline(str, i);
      if (i < 0)
        break;
    } else if (c === sep) {
      return i + 1;
    } else if (c === end || banNewLines && (c === `
` || c === "\r" && str[i + 1] === `
`)) {
      return i;
    }
  }
  throw new TomlError("cannot find end of structure", {
    toml: str,
    ptr
  });
}

// node_modules/smol-toml/dist/extract.js
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
function sliceAndTrimEndOf(str, startPtr, endPtr) {
  let value = str.slice(startPtr, endPtr);
  let commentIdx = value.indexOf("#");
  if (commentIdx > -1) {
    skipComment(str, commentIdx);
    value = value.slice(0, commentIdx);
  }
  return [value.trimEnd(), commentIdx];
}
function extractValue(str, ptr, end, depth, integersAsBigInt) {
  if (depth === 0) {
    throw new TomlError("document contains excessively nested structures. aborting.", {
      toml: str,
      ptr
    });
  }
  let c = str[ptr];
  if (c === "[" || c === "{") {
    let [value, endPtr2] = c === "[" ? parseArray(str, ptr, depth, integersAsBigInt) : parseInlineTable(str, ptr, depth, integersAsBigInt);
    if (end) {
      endPtr2 = skipVoid(str, endPtr2);
      if (str[endPtr2] === ",")
        endPtr2++;
      else if (str[endPtr2] !== end) {
        throw new TomlError("expected comma or end of structure", {
          toml: str,
          ptr: endPtr2
        });
      }
    }
    return [value, endPtr2];
  }
  if (c === '"' || c === "'") {
    let [parsed, endPtr2] = parseString(str, ptr);
    if (end) {
      endPtr2 = skipVoid(str, endPtr2);
      if (str[endPtr2] && str[endPtr2] !== "," && str[endPtr2] !== end && str[endPtr2] !== `
` && str[endPtr2] !== "\r") {
        throw new TomlError("unexpected character encountered", {
          toml: str,
          ptr: endPtr2
        });
      }
      if (str[endPtr2] === ",")
        endPtr2++;
    }
    return [parsed, endPtr2];
  }
  let endPtr = skipUntil(str, ptr, ",", end);
  let slice = sliceAndTrimEndOf(str, ptr, endPtr - (str[endPtr - 1] === "," ? 1 : 0));
  if (!slice[0]) {
    throw new TomlError("incomplete key-value declaration: no value specified", {
      toml: str,
      ptr
    });
  }
  if (end && slice[1] > -1) {
    endPtr = skipVoid(str, ptr + slice[1]);
    if (str[endPtr] === ",")
      endPtr++;
  }
  return [
    parseValue(slice[0], str, ptr, integersAsBigInt),
    endPtr
  ];
}

// node_modules/smol-toml/dist/struct.js
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
var KEY_PART_RE = /^[a-zA-Z0-9-_]+[ \t]*$/;
function parseKey(str, ptr, end = "=") {
  let dot = ptr - 1;
  let parsed = [];
  let endPtr = str.indexOf(end, ptr);
  if (endPtr < 0) {
    throw new TomlError("incomplete key-value: cannot find end of key", {
      toml: str,
      ptr
    });
  }
  do {
    let c = str[ptr = ++dot];
    if (c !== " " && c !== "\t") {
      if (c === '"' || c === "'") {
        if (c === str[ptr + 1] && c === str[ptr + 2]) {
          throw new TomlError("multiline strings are not allowed in keys", {
            toml: str,
            ptr
          });
        }
        let [part, eos] = parseString(str, ptr);
        dot = str.indexOf(".", eos);
        let strEnd = str.slice(eos, dot < 0 || dot > endPtr ? endPtr : dot);
        let newLine = indexOfNewline(strEnd);
        if (newLine > -1) {
          throw new TomlError("newlines are not allowed in keys", {
            toml: str,
            ptr: ptr + dot + newLine
          });
        }
        if (strEnd.trimStart()) {
          throw new TomlError("found extra tokens after the string part", {
            toml: str,
            ptr: eos
          });
        }
        if (endPtr < eos) {
          endPtr = str.indexOf(end, eos);
          if (endPtr < 0) {
            throw new TomlError("incomplete key-value: cannot find end of key", {
              toml: str,
              ptr
            });
          }
        }
        parsed.push(part);
      } else {
        dot = str.indexOf(".", ptr);
        let part = str.slice(ptr, dot < 0 || dot > endPtr ? endPtr : dot);
        if (!KEY_PART_RE.test(part)) {
          throw new TomlError("only letter, numbers, dashes and underscores are allowed in keys", {
            toml: str,
            ptr
          });
        }
        parsed.push(part.trimEnd());
      }
    }
  } while (dot + 1 && dot < endPtr);
  return [parsed, skipVoid(str, endPtr + 1, true, true)];
}
function parseInlineTable(str, ptr, depth, integersAsBigInt) {
  let res = {};
  let seen = new Set;
  let c;
  ptr++;
  while ((c = str[ptr++]) !== "}" && c) {
    if (c === ",") {
      throw new TomlError("expected value, found comma", {
        toml: str,
        ptr: ptr - 1
      });
    } else if (c === "#")
      ptr = skipComment(str, ptr);
    else if (c !== " " && c !== "\t" && c !== `
` && c !== "\r") {
      let k;
      let t = res;
      let hasOwn = false;
      let [key, keyEndPtr] = parseKey(str, ptr - 1);
      for (let i = 0;i < key.length; i++) {
        if (i)
          t = hasOwn ? t[k] : t[k] = {};
        k = key[i];
        if ((hasOwn = Object.hasOwn(t, k)) && (typeof t[k] !== "object" || seen.has(t[k]))) {
          throw new TomlError("trying to redefine an already defined value", {
            toml: str,
            ptr
          });
        }
        if (!hasOwn && k === "__proto__") {
          Object.defineProperty(t, k, { enumerable: true, configurable: true, writable: true });
        }
      }
      if (hasOwn) {
        throw new TomlError("trying to redefine an already defined value", {
          toml: str,
          ptr
        });
      }
      let [value, valueEndPtr] = extractValue(str, keyEndPtr, "}", depth - 1, integersAsBigInt);
      seen.add(value);
      t[k] = value;
      ptr = valueEndPtr;
    }
  }
  if (!c) {
    throw new TomlError("unfinished table encountered", {
      toml: str,
      ptr
    });
  }
  return [res, ptr];
}
function parseArray(str, ptr, depth, integersAsBigInt) {
  let res = [];
  let c;
  ptr++;
  while ((c = str[ptr++]) !== "]" && c) {
    if (c === ",") {
      throw new TomlError("expected value, found comma", {
        toml: str,
        ptr: ptr - 1
      });
    } else if (c === "#")
      ptr = skipComment(str, ptr);
    else if (c !== " " && c !== "\t" && c !== `
` && c !== "\r") {
      let e = extractValue(str, ptr - 1, "]", depth - 1, integersAsBigInt);
      res.push(e[0]);
      ptr = e[1];
    }
  }
  if (!c) {
    throw new TomlError("unfinished array encountered", {
      toml: str,
      ptr
    });
  }
  return [res, ptr];
}

// node_modules/smol-toml/dist/parse.js
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */
function peekTable(key, table, meta, type) {
  let t = table;
  let m = meta;
  let k;
  let hasOwn = false;
  let state;
  for (let i = 0;i < key.length; i++) {
    if (i) {
      t = hasOwn ? t[k] : t[k] = {};
      m = (state = m[k]).c;
      if (type === 0 && (state.t === 1 || state.t === 2)) {
        return null;
      }
      if (state.t === 2) {
        let l = t.length - 1;
        t = t[l];
        m = m[l].c;
      }
    }
    k = key[i];
    if ((hasOwn = Object.hasOwn(t, k)) && m[k]?.t === 0 && m[k]?.d) {
      return null;
    }
    if (!hasOwn) {
      if (k === "__proto__") {
        Object.defineProperty(t, k, { enumerable: true, configurable: true, writable: true });
        Object.defineProperty(m, k, { enumerable: true, configurable: true, writable: true });
      }
      m[k] = {
        t: i < key.length - 1 && type === 2 ? 3 : type,
        d: false,
        i: 0,
        c: {}
      };
    }
  }
  state = m[k];
  if (state.t !== type && !(type === 1 && state.t === 3)) {
    return null;
  }
  if (type === 2) {
    if (!state.d) {
      state.d = true;
      t[k] = [];
    }
    t[k].push(t = {});
    state.c[state.i++] = state = { t: 1, d: false, i: 0, c: {} };
  }
  if (state.d) {
    return null;
  }
  state.d = true;
  if (type === 1) {
    t = hasOwn ? t[k] : t[k] = {};
  } else if (type === 0 && hasOwn) {
    return null;
  }
  return [k, t, state.c];
}
function parse(toml, { maxDepth = 1000, integersAsBigInt } = {}) {
  let res = {};
  let meta = {};
  let tbl = res;
  let m = meta;
  for (let ptr = skipVoid(toml, 0);ptr < toml.length; ) {
    if (toml[ptr] === "[") {
      let isTableArray = toml[++ptr] === "[";
      let k = parseKey(toml, ptr += +isTableArray, "]");
      if (isTableArray) {
        if (toml[k[1] - 1] !== "]") {
          throw new TomlError("expected end of table declaration", {
            toml,
            ptr: k[1] - 1
          });
        }
        k[1]++;
      }
      let p = peekTable(k[0], res, meta, isTableArray ? 2 : 1);
      if (!p) {
        throw new TomlError("trying to redefine an already defined table or value", {
          toml,
          ptr
        });
      }
      m = p[2];
      tbl = p[1];
      ptr = k[1];
    } else {
      let k = parseKey(toml, ptr);
      let p = peekTable(k[0], tbl, m, 0);
      if (!p) {
        throw new TomlError("trying to redefine an already defined table or value", {
          toml,
          ptr
        });
      }
      let v = extractValue(toml, k[1], undefined, maxDepth, integersAsBigInt);
      p[1][p[0]] = v[0];
      ptr = v[1];
    }
    ptr = skipVoid(toml, ptr, true);
    if (toml[ptr] && toml[ptr] !== `
` && toml[ptr] !== "\r") {
      throw new TomlError("each key-value declaration must be followed by an end-of-line", {
        toml,
        ptr
      });
    }
    ptr = skipVoid(toml, ptr);
  }
  return res;
}

// node_modules/smol-toml/dist/stringify.js
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// node_modules/smol-toml/dist/index.js
/*!
 * Copyright (c) Squirrel Chat et al., All rights reserved.
 * SPDX-License-Identifier: BSD-3-Clause
 *
 * Redistribution and use in source and binary forms, with or without
 * modification, are permitted provided that the following conditions are met:
 *
 * 1. Redistributions of source code must retain the above copyright notice, this
 *    list of conditions and the following disclaimer.
 * 2. Redistributions in binary form must reproduce the above copyright notice,
 *    this list of conditions and the following disclaimer in the
 *    documentation and/or other materials provided with the distribution.
 * 3. Neither the name of the copyright holder nor the names of its contributors
 *    may be used to endorse or promote products derived from this software without
 *    specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE
 * DISCLAIMED. IN NO EVENT SHALL THE COPYRIGHT HOLDER OR CONTRIBUTORS BE LIABLE
 * FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL
 * DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR
 * SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER
 * CAUSED AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY,
 * OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE
 * OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGE.
 */

// src/files.ts
function extractQueryId(name) {
  const match = name.match(/_(\d+)\.sql$/);
  return match ? parseInt(match[1], 10) : null;
}
function readQueryFile(path) {
  try {
    return readFileSync(path, { encoding: "utf8" });
  } catch {
    return "";
  }
}
function readDuneToml(sqlFilePath) {
  const dir = dirname(sqlFilePath);
  const tomlPath = join(dir, "dune.toml");
  if (!existsSync(tomlPath))
    return null;
  try {
    const content = readFileSync(tomlPath, { encoding: "utf8" });
    const parsed = parse(content);
    if (!parsed.query || typeof parsed.query.id !== "number")
      return null;
    return {
      queryId: parsed.query.id,
      name: parsed.query.name,
      description: parsed.query.description
    };
  } catch {
    return null;
  }
}
function resolveQueryConfig(filePath) {
  const tomlConfig = readDuneToml(filePath);
  if (tomlConfig) {
    return { ...tomlConfig, file: filePath };
  }
  const queryId = extractQueryId(filePath);
  if (queryId === null)
    return null;
  return { queryId, file: filePath };
}
function detectChangedFiles(queryPath, base) {
  const diffBase = base || detectDiffBase();
  try {
    const result = execSync(`git diff --name-only --diff-filter=ACMRT ${diffBase} HEAD -- "${queryPath}"`, { encoding: "utf8" });
    return result.trim().split(`
`).filter((f) => f.endsWith(".sql") && f !== "");
  } catch {
    return [];
  }
}
function detectDiffBase() {
  const baseRef = process.env.GITHUB_BASE_REF;
  if (baseRef)
    return `origin/${baseRef}`;
  const eventPath = process.env.GITHUB_EVENT_PATH;
  if (eventPath) {
    try {
      const event = JSON.parse(readFileSync(eventPath, { encoding: "utf8" }));
      if (event.before && event.before !== "0000000000000000000000000000000000000000") {
        return event.before;
      }
    } catch {}
  }
  return "HEAD~1";
}

// src/dune.ts
var DEFAULT_API_BASE_URL = "https://api.dune.com/api";

class QueryClient extends import_client_sdk.QueryAPI {
  baseUrl;
  constructor(apiKey, baseUrl = DEFAULT_API_BASE_URL) {
    super(apiKey);
    this.baseUrl = baseUrl;
  }
  url(route) {
    return `${this.baseUrl}/v1/${route}`;
  }
}
function normalizeSql(sql) {
  return sql.replace(/\r\n/g, `
`).trim();
}
async function processUpdates(options) {
  const { apiKey, files, dryRun = false, apiBaseUrl } = options;
  const results = [];
  const queryManager = new QueryClient(apiKey, apiBaseUrl);
  for (const file of files) {
    const config = resolveQueryConfig(file);
    if (!config) {
      results.push({
        status: "failed",
        file,
        error: `Could not resolve query ID from '${file}': use '*_{queryId}.sql' naming or add a dune.toml`
      });
      continue;
    }
    const querySql = readQueryFile(file);
    if (!querySql) {
      results.push({
        status: "skipped",
        file,
        reason: "File is empty or deleted"
      });
      continue;
    }
    let currentSql;
    try {
      currentSql = (await queryManager.readQuery(config.queryId)).query_sql;
    } catch {
      currentSql = null;
    }
    if (currentSql !== null && normalizeSql(currentSql) === normalizeSql(querySql)) {
      results.push({ status: "unchanged", queryId: config.queryId, file });
      continue;
    }
    const diff = currentSql !== null ? createTwoFilesPatch(`query-${config.queryId} (dune)`, file, normalizeSql(currentSql) + `
`, normalizeSql(querySql) + `
`) : undefined;
    if (dryRun) {
      results.push({ status: "updated", queryId: config.queryId, file, diff });
      continue;
    }
    try {
      const updateParams = {
        query_sql: querySql
      };
      if (config.name)
        updateParams.name = config.name;
      if (config.description)
        updateParams.description = config.description;
      await queryManager.updateQuery(config.queryId, updateParams);
      results.push({ status: "updated", queryId: config.queryId, file, diff });
    } catch (error) {
      results.push({
        status: "failed",
        queryId: config.queryId,
        file,
        error: error.message
      });
    }
  }
  return results;
}

// src/cli.ts
function parseArgs() {
  const args = process.argv.slice(2);
  let apiKey = process.env.DUNE_API_KEY || "";
  let files = [];
  let queryPath = "queries";
  let base;
  let dryRun = false;
  let apiBaseUrl;
  for (let i = 0;i < args.length; i++) {
    switch (args[i]) {
      case "--api-key":
        apiKey = args[++i];
        break;
      case "--files":
      case "--changed":
        files = args[++i].split(",");
        break;
      case "--query-path":
        queryPath = args[++i];
        break;
      case "--base":
        base = args[++i];
        break;
      case "--base-url":
        apiBaseUrl = args[++i];
        break;
      case "--dry-run":
        dryRun = true;
        break;
      case "--help":
      case "-h":
        printUsage();
        process.exit(0);
    }
  }
  if (!apiKey) {
    console.error("Error: API key required. Use --api-key or set DUNE_API_KEY env var.");
    process.exit(1);
  }
  return { apiKey, files, queryPath, base, dryRun, apiBaseUrl };
}
function printUsage() {
  console.log(`
Usage: dune-update [options]

Options:
  --api-key <key>      Dune API key (or set DUNE_API_KEY env var)
  --files <paths>      Comma-separated list of changed query files
  --query-path <dir>   Directory containing queries (default: queries)
  --base <ref>         Git ref to diff against (default: HEAD~1)
  --base-url <url>     Dune API base URL (default: https://api.dune.com/api)
  --dry-run            Preview changes without executing updates
  -h, --help           Show this help message

Examples:
  dune-update --api-key <key> --files queries/foo_123.sql
  dune-update --query-path queries --dry-run
  DUNE_API_KEY=<key> dune-update --query-path queries
`);
}
async function main() {
  const {
    apiKey,
    files: explicitFiles,
    queryPath,
    base,
    dryRun,
    apiBaseUrl
  } = parseArgs();
  const files = explicitFiles.length > 0 ? explicitFiles : detectChangedFiles(queryPath, base);
  if (files.length === 0) {
    console.log("No changed query files detected.");
    return;
  }
  if (dryRun) {
    console.log(`[Dry Run] Previewing changes (no updates will be made):
`);
  }
  console.log(`Processing ${files.length} changed query file(s)
`);
  const results = await processUpdates({ apiKey, files, dryRun, apiBaseUrl });
  let hasFailures = false;
  for (const result of results) {
    switch (result.status) {
      case "updated": {
        const prefix = dryRun ? "Would update" : "Updated";
        console.log(`  ${prefix} query ${result.queryId} from ${result.file}`);
        if (dryRun && result.diff) {
          console.log(result.diff.replace(/^/gm, "    "));
        }
        break;
      }
      case "unchanged":
        console.log(`  Unchanged query ${result.queryId} (${result.file} matches Dune)`);
        break;
      case "skipped":
        console.log(`  Skipped ${result.file}: ${result.reason}`);
        break;
      case "failed":
        console.log(`  Failed ${result.file}: ${result.error}`);
        hasFailures = true;
        break;
    }
  }
  const updated = results.filter((r) => r.status === "updated").length;
  const unchanged = results.filter((r) => r.status === "unchanged").length;
  const skipped = results.filter((r) => r.status === "skipped").length;
  const failed = results.filter((r) => r.status === "failed").length;
  console.log(`
Results: ${updated} updated, ${unchanged} unchanged, ${skipped} skipped, ${failed} failed`);
  if (hasFailures)
    process.exit(1);
}
main();

//# debugId=0E20CBBF9C3D552064756E2164756E21
