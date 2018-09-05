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
Object.defineProperty(exports, "__esModule", { value: true });
var assert = require("assert");
var src_1 = require("../src");
describe('projectId placeholder', function () {
    var PROJECT_ID = 'project-id';
    it('should replace any {{projectId}} it finds', function () {
        assert.deepStrictEqual(src_1.replaceProjectIdToken({
            here: 'A {{projectId}} Z',
            nested: {
                here: 'A {{projectId}} Z',
                nested: {
                    here: 'A {{projectId}} Z',
                },
            },
            array: [
                {
                    here: 'A {{projectId}} Z',
                    nested: {
                        here: 'A {{projectId}} Z',
                    },
                    nestedArray: [
                        {
                            here: 'A {{projectId}} Z',
                            nested: {
                                here: 'A {{projectId}} Z',
                            },
                        },
                    ],
                },
            ],
        }, PROJECT_ID), {
            here: 'A ' + PROJECT_ID + ' Z',
            nested: {
                here: 'A ' + PROJECT_ID + ' Z',
                nested: {
                    here: 'A ' + PROJECT_ID + ' Z',
                },
            },
            array: [
                {
                    here: 'A ' + PROJECT_ID + ' Z',
                    nested: {
                        here: 'A ' + PROJECT_ID + ' Z',
                    },
                    nestedArray: [
                        {
                            here: 'A ' + PROJECT_ID + ' Z',
                            nested: {
                                here: 'A ' + PROJECT_ID + ' Z',
                            },
                        },
                    ],
                },
            ],
        });
    });
    it('should replace more than one {{projectId}}', function () {
        assert.deepStrictEqual(src_1.replaceProjectIdToken({
            here: 'A {{projectId}} M {{projectId}} Z',
        }, PROJECT_ID), {
            here: 'A ' + PROJECT_ID + ' M ' + PROJECT_ID + ' Z',
        });
    });
    it('should throw if it needs a projectId and cannot find it', function () {
        assert.throws(function () {
            src_1.replaceProjectIdToken({
                here: '{{projectId}}',
            });
        }, /Sorry, we cannot connect/);
    });
});
//# sourceMappingURL=index.js.map