"use strict";
/**
 * Copyright 2014 Google Inc. All Rights Reserved.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    }
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
Object.defineProperty(exports, "__esModule", { value: true });
/**
 * Populate the `{{projectId}}` placeholder.
 *
 * @throws {Error} If a projectId is required, but one is not provided.
 *
 * @param {*} - Any input value that may contain a placeholder. Arrays and objects will be looped.
 * @param {string} projectId - A projectId. If not provided
 * @return {*} - The original argument with all placeholders populated.
 */
// tslint:disable-next-line:no-any
function replaceProjectIdToken(value, projectId) {
    if (Array.isArray(value)) {
        value = value.map(function (v) { return replaceProjectIdToken(v, projectId); });
    }
    if (value !== null && typeof value === 'object' &&
        typeof value.hasOwnProperty === 'function') {
        for (var opt in value) {
            if (value.hasOwnProperty(opt)) {
                value[opt] = replaceProjectIdToken(value[opt], projectId);
            }
        }
    }
    if (typeof value === 'string' &&
        value.indexOf('{{projectId}}') > -1) {
        if (!projectId || projectId === '{{projectId}}') {
            throw new MissingProjectIdError();
        }
        value = value.replace(/{{projectId}}/g, projectId);
    }
    return value;
}
exports.replaceProjectIdToken = replaceProjectIdToken;
/**
 * Custom error type for missing project ID errors.
 */
var MissingProjectIdError = /** @class */ (function (_super) {
    __extends(MissingProjectIdError, _super);
    function MissingProjectIdError() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.message = "Sorry, we cannot connect to Cloud Services without a project\n    ID. You may specify one with an environment variable named\n    \"GOOGLE_CLOUD_PROJECT\".".replace(/ +/g, ' ');
        return _this;
    }
    return MissingProjectIdError;
}(Error));
exports.MissingProjectIdError = MissingProjectIdError;
//# sourceMappingURL=index.js.map