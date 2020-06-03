
(function(l, r) { if (l.getElementById('livereloadscript')) return; r = l.createElement('script'); r.async = 1; r.src = '//' + (window.location.host || 'localhost').split(':')[0] + ':35729/livereload.js?snipver=1'; r.id = 'livereloadscript'; l.getElementsByTagName('head')[0].appendChild(r) })(window.document);
var app = (function () {
    'use strict';

    function noop() { }
    function add_location(element, file, line, column, char) {
        element.__svelte_meta = {
            loc: { file, line, column, char }
        };
    }
    function run(fn) {
        return fn();
    }
    function blank_object() {
        return Object.create(null);
    }
    function run_all(fns) {
        fns.forEach(run);
    }
    function is_function(thing) {
        return typeof thing === 'function';
    }
    function safe_not_equal(a, b) {
        return a != a ? b == b : a !== b || ((a && typeof a === 'object') || typeof a === 'function');
    }
    function null_to_empty(value) {
        return value == null ? '' : value;
    }

    function append(target, node) {
        target.appendChild(node);
    }
    function insert(target, node, anchor) {
        target.insertBefore(node, anchor || null);
    }
    function detach(node) {
        node.parentNode.removeChild(node);
    }
    function element(name) {
        return document.createElement(name);
    }
    function svg_element(name) {
        return document.createElementNS('http://www.w3.org/2000/svg', name);
    }
    function text(data) {
        return document.createTextNode(data);
    }
    function space() {
        return text(' ');
    }
    function listen(node, event, handler, options) {
        node.addEventListener(event, handler, options);
        return () => node.removeEventListener(event, handler, options);
    }
    function attr(node, attribute, value) {
        if (value == null)
            node.removeAttribute(attribute);
        else if (node.getAttribute(attribute) !== value)
            node.setAttribute(attribute, value);
    }
    function children(element) {
        return Array.from(element.childNodes);
    }
    function custom_event(type, detail) {
        const e = document.createEvent('CustomEvent');
        e.initCustomEvent(type, false, false, detail);
        return e;
    }

    let current_component;
    function set_current_component(component) {
        current_component = component;
    }
    function get_current_component() {
        if (!current_component)
            throw new Error(`Function called outside component initialization`);
        return current_component;
    }
    function onMount(fn) {
        get_current_component().$$.on_mount.push(fn);
    }

    const dirty_components = [];
    const binding_callbacks = [];
    const render_callbacks = [];
    const flush_callbacks = [];
    const resolved_promise = Promise.resolve();
    let update_scheduled = false;
    function schedule_update() {
        if (!update_scheduled) {
            update_scheduled = true;
            resolved_promise.then(flush);
        }
    }
    function add_render_callback(fn) {
        render_callbacks.push(fn);
    }
    let flushing = false;
    const seen_callbacks = new Set();
    function flush() {
        if (flushing)
            return;
        flushing = true;
        do {
            // first, call beforeUpdate functions
            // and update components
            for (let i = 0; i < dirty_components.length; i += 1) {
                const component = dirty_components[i];
                set_current_component(component);
                update(component.$$);
            }
            dirty_components.length = 0;
            while (binding_callbacks.length)
                binding_callbacks.pop()();
            // then, once components are updated, call
            // afterUpdate functions. This may cause
            // subsequent updates...
            for (let i = 0; i < render_callbacks.length; i += 1) {
                const callback = render_callbacks[i];
                if (!seen_callbacks.has(callback)) {
                    // ...so guard against infinite loops
                    seen_callbacks.add(callback);
                    callback();
                }
            }
            render_callbacks.length = 0;
        } while (dirty_components.length);
        while (flush_callbacks.length) {
            flush_callbacks.pop()();
        }
        update_scheduled = false;
        flushing = false;
        seen_callbacks.clear();
    }
    function update($$) {
        if ($$.fragment !== null) {
            $$.update();
            run_all($$.before_update);
            const dirty = $$.dirty;
            $$.dirty = [-1];
            $$.fragment && $$.fragment.p($$.ctx, dirty);
            $$.after_update.forEach(add_render_callback);
        }
    }
    const outroing = new Set();
    let outros;
    function transition_in(block, local) {
        if (block && block.i) {
            outroing.delete(block);
            block.i(local);
        }
    }
    function transition_out(block, local, detach, callback) {
        if (block && block.o) {
            if (outroing.has(block))
                return;
            outroing.add(block);
            outros.c.push(() => {
                outroing.delete(block);
                if (callback) {
                    if (detach)
                        block.d(1);
                    callback();
                }
            });
            block.o(local);
        }
    }
    function create_component(block) {
        block && block.c();
    }
    function mount_component(component, target, anchor) {
        const { fragment, on_mount, on_destroy, after_update } = component.$$;
        fragment && fragment.m(target, anchor);
        // onMount happens before the initial afterUpdate
        add_render_callback(() => {
            const new_on_destroy = on_mount.map(run).filter(is_function);
            if (on_destroy) {
                on_destroy.push(...new_on_destroy);
            }
            else {
                // Edge case - component was destroyed immediately,
                // most likely as a result of a binding initialising
                run_all(new_on_destroy);
            }
            component.$$.on_mount = [];
        });
        after_update.forEach(add_render_callback);
    }
    function destroy_component(component, detaching) {
        const $$ = component.$$;
        if ($$.fragment !== null) {
            run_all($$.on_destroy);
            $$.fragment && $$.fragment.d(detaching);
            // TODO null out other refs, including component.$$ (but need to
            // preserve final state?)
            $$.on_destroy = $$.fragment = null;
            $$.ctx = [];
        }
    }
    function make_dirty(component, i) {
        if (component.$$.dirty[0] === -1) {
            dirty_components.push(component);
            schedule_update();
            component.$$.dirty.fill(0);
        }
        component.$$.dirty[(i / 31) | 0] |= (1 << (i % 31));
    }
    function init(component, options, instance, create_fragment, not_equal, props, dirty = [-1]) {
        const parent_component = current_component;
        set_current_component(component);
        const prop_values = options.props || {};
        const $$ = component.$$ = {
            fragment: null,
            ctx: null,
            // state
            props,
            update: noop,
            not_equal,
            bound: blank_object(),
            // lifecycle
            on_mount: [],
            on_destroy: [],
            before_update: [],
            after_update: [],
            context: new Map(parent_component ? parent_component.$$.context : []),
            // everything else
            callbacks: blank_object(),
            dirty
        };
        let ready = false;
        $$.ctx = instance
            ? instance(component, prop_values, (i, ret, ...rest) => {
                const value = rest.length ? rest[0] : ret;
                if ($$.ctx && not_equal($$.ctx[i], $$.ctx[i] = value)) {
                    if ($$.bound[i])
                        $$.bound[i](value);
                    if (ready)
                        make_dirty(component, i);
                }
                return ret;
            })
            : [];
        $$.update();
        ready = true;
        run_all($$.before_update);
        // `false` as a special case of no DOM component
        $$.fragment = create_fragment ? create_fragment($$.ctx) : false;
        if (options.target) {
            if (options.hydrate) {
                const nodes = children(options.target);
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.l(nodes);
                nodes.forEach(detach);
            }
            else {
                // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
                $$.fragment && $$.fragment.c();
            }
            if (options.intro)
                transition_in(component.$$.fragment);
            mount_component(component, options.target, options.anchor);
            flush();
        }
        set_current_component(parent_component);
    }
    class SvelteComponent {
        $destroy() {
            destroy_component(this, 1);
            this.$destroy = noop;
        }
        $on(type, callback) {
            const callbacks = (this.$$.callbacks[type] || (this.$$.callbacks[type] = []));
            callbacks.push(callback);
            return () => {
                const index = callbacks.indexOf(callback);
                if (index !== -1)
                    callbacks.splice(index, 1);
            };
        }
        $set() {
            // overridden by instance, if it has props
        }
    }

    function dispatch_dev(type, detail) {
        document.dispatchEvent(custom_event(type, Object.assign({ version: '3.20.1' }, detail)));
    }
    function append_dev(target, node) {
        dispatch_dev("SvelteDOMInsert", { target, node });
        append(target, node);
    }
    function insert_dev(target, node, anchor) {
        dispatch_dev("SvelteDOMInsert", { target, node, anchor });
        insert(target, node, anchor);
    }
    function detach_dev(node) {
        dispatch_dev("SvelteDOMRemove", { node });
        detach(node);
    }
    function listen_dev(node, event, handler, options, has_prevent_default, has_stop_propagation) {
        const modifiers = options === true ? ["capture"] : options ? Array.from(Object.keys(options)) : [];
        if (has_prevent_default)
            modifiers.push('preventDefault');
        if (has_stop_propagation)
            modifiers.push('stopPropagation');
        dispatch_dev("SvelteDOMAddEventListener", { node, event, handler, modifiers });
        const dispose = listen(node, event, handler, options);
        return () => {
            dispatch_dev("SvelteDOMRemoveEventListener", { node, event, handler, modifiers });
            dispose();
        };
    }
    function attr_dev(node, attribute, value) {
        attr(node, attribute, value);
        if (value == null)
            dispatch_dev("SvelteDOMRemoveAttribute", { node, attribute });
        else
            dispatch_dev("SvelteDOMSetAttribute", { node, attribute, value });
    }
    function set_data_dev(text, data) {
        data = '' + data;
        if (text.data === data)
            return;
        dispatch_dev("SvelteDOMSetData", { node: text, data });
        text.data = data;
    }
    function validate_slots(name, slot, keys) {
        for (const slot_key of Object.keys(slot)) {
            if (!~keys.indexOf(slot_key)) {
                console.warn(`<${name}> received an unexpected slot "${slot_key}".`);
            }
        }
    }
    class SvelteComponentDev extends SvelteComponent {
        constructor(options) {
            if (!options || (!options.target && !options.$$inline)) {
                throw new Error(`'target' is a required option`);
            }
            super();
        }
        $destroy() {
            super.$destroy();
            this.$destroy = () => {
                console.warn(`Component was already destroyed`); // eslint-disable-line no-console
            };
        }
        $capture_state() { }
        $inject_state() { }
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation.

    Permission to use, copy, modify, and/or distribute this software for any
    purpose with or without fee is hereby granted.

    THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
    REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
    AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
    INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
    LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
    OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
    PERFORMANCE OF THIS SOFTWARE.
    ***************************************************************************** */
    /* global Reflect, Promise */

    var extendStatics = function(d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };

    function __extends(d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    }

    var __assign = function() {
        __assign = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign.apply(this, arguments);
    };

    function __rest(s, e) {
        var t = {};
        for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
            t[p] = s[p];
        if (s != null && typeof Object.getOwnPropertySymbols === "function")
            for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
                if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                    t[p[i]] = s[p[i]];
            }
        return t;
    }

    function __spreadArrays() {
        for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
        for (var r = Array(s), k = 0, i = 0; i < il; i++)
            for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
                r[k] = a[j];
        return r;
    }

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign$1 = function() {
        __assign$1 = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign$1.apply(this, arguments);
    };

    var clamp = function (min, max) { return function (v) {
        return Math.max(Math.min(v, max), min);
    }; };
    var sanitize = function (v) { return (v % 1 ? Number(v.toFixed(5)) : v); };
    var floatRegex = /(-)?(\d[\d\.]*)/g;
    var colorRegex = /(#[0-9a-f]{6}|#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))/gi;
    var singleColorRegex = /^(#[0-9a-f]{3}|#(?:[0-9a-f]{2}){2,4}|(rgb|hsl)a?\((-?\d+%?[,\s]+){2,3}\s*[\d\.]+%?\))$/i;

    var number = {
        test: function (v) { return typeof v === 'number'; },
        parse: parseFloat,
        transform: function (v) { return v; }
    };
    var alpha = __assign$1(__assign$1({}, number), { transform: clamp(0, 1) });
    var scale = __assign$1(__assign$1({}, number), { default: 1 });

    var createUnitType = function (unit) { return ({
        test: function (v) {
            return typeof v === 'string' && v.endsWith(unit) && v.split(' ').length === 1;
        },
        parse: parseFloat,
        transform: function (v) { return "" + v + unit; }
    }); };
    var degrees = createUnitType('deg');
    var percent = createUnitType('%');
    var px = createUnitType('px');
    var vh = createUnitType('vh');
    var vw = createUnitType('vw');
    var progressPercentage = __assign$1(__assign$1({}, percent), { parse: function (v) { return percent.parse(v) / 100; }, transform: function (v) { return percent.transform(v * 100); } });

    var getValueFromFunctionString = function (value) {
        return value.substring(value.indexOf('(') + 1, value.lastIndexOf(')'));
    };
    var clampRgbUnit = clamp(0, 255);
    var isRgba = function (v) { return v.red !== undefined; };
    var isHsla = function (v) { return v.hue !== undefined; };
    var splitColorValues = function (terms) {
        return function (v) {
            if (typeof v !== 'string')
                return v;
            var values = {};
            var valuesArray = getValueFromFunctionString(v).split(/,\s*/);
            for (var i = 0; i < 4; i++) {
                values[terms[i]] =
                    valuesArray[i] !== undefined ? parseFloat(valuesArray[i]) : 1;
            }
            return values;
        };
    };
    var rgbaTemplate = function (_a) {
        var red = _a.red, green = _a.green, blue = _a.blue, _b = _a.alpha, alpha$$1 = _b === void 0 ? 1 : _b;
        return "rgba(" + red + ", " + green + ", " + blue + ", " + alpha$$1 + ")";
    };
    var hslaTemplate = function (_a) {
        var hue = _a.hue, saturation = _a.saturation, lightness = _a.lightness, _b = _a.alpha, alpha$$1 = _b === void 0 ? 1 : _b;
        return "hsla(" + hue + ", " + saturation + ", " + lightness + ", " + alpha$$1 + ")";
    };
    var rgbUnit = __assign$1(__assign$1({}, number), { transform: function (v) { return Math.round(clampRgbUnit(v)); } });
    function isColorString(color, colorType) {
        return color.startsWith(colorType) && singleColorRegex.test(color);
    }
    var rgba = {
        test: function (v) { return (typeof v === 'string' ? isColorString(v, 'rgb') : isRgba(v)); },
        parse: splitColorValues(['red', 'green', 'blue', 'alpha']),
        transform: function (_a) {
            var red = _a.red, green = _a.green, blue = _a.blue, _b = _a.alpha, alpha$$1 = _b === void 0 ? 1 : _b;
            return rgbaTemplate({
                red: rgbUnit.transform(red),
                green: rgbUnit.transform(green),
                blue: rgbUnit.transform(blue),
                alpha: sanitize(alpha.transform(alpha$$1))
            });
        }
    };
    var hsla = {
        test: function (v) { return (typeof v === 'string' ? isColorString(v, 'hsl') : isHsla(v)); },
        parse: splitColorValues(['hue', 'saturation', 'lightness', 'alpha']),
        transform: function (_a) {
            var hue = _a.hue, saturation = _a.saturation, lightness = _a.lightness, _b = _a.alpha, alpha$$1 = _b === void 0 ? 1 : _b;
            return hslaTemplate({
                hue: Math.round(hue),
                saturation: percent.transform(sanitize(saturation)),
                lightness: percent.transform(sanitize(lightness)),
                alpha: sanitize(alpha.transform(alpha$$1))
            });
        }
    };
    var hex = __assign$1(__assign$1({}, rgba), { test: function (v) { return typeof v === 'string' && isColorString(v, '#'); }, parse: function (v) {
            var r = '';
            var g = '';
            var b = '';
            if (v.length > 4) {
                r = v.substr(1, 2);
                g = v.substr(3, 2);
                b = v.substr(5, 2);
            }
            else {
                r = v.substr(1, 1);
                g = v.substr(2, 1);
                b = v.substr(3, 1);
                r += r;
                g += g;
                b += b;
            }
            return {
                red: parseInt(r, 16),
                green: parseInt(g, 16),
                blue: parseInt(b, 16),
                alpha: 1
            };
        } });
    var color = {
        test: function (v) {
            return (typeof v === 'string' && singleColorRegex.test(v)) ||
                isRgba(v) ||
                isHsla(v);
        },
        parse: function (v) {
            if (rgba.test(v)) {
                return rgba.parse(v);
            }
            else if (hsla.test(v)) {
                return hsla.parse(v);
            }
            else if (hex.test(v)) {
                return hex.parse(v);
            }
            return v;
        },
        transform: function (v) {
            if (isRgba(v)) {
                return rgba.transform(v);
            }
            else if (isHsla(v)) {
                return hsla.transform(v);
            }
            return v;
        }
    };

    var COLOR_TOKEN = '${c}';
    var NUMBER_TOKEN = '${n}';
    var convertNumbersToZero = function (v) {
        return typeof v === 'number' ? 0 : v;
    };
    var complex = {
        test: function (v) {
            if (typeof v !== 'string' || !isNaN(v))
                return false;
            var numValues = 0;
            var foundNumbers = v.match(floatRegex);
            var foundColors = v.match(colorRegex);
            if (foundNumbers)
                numValues += foundNumbers.length;
            if (foundColors)
                numValues += foundColors.length;
            return numValues > 0;
        },
        parse: function (v) {
            var input = v;
            var parsed = [];
            var foundColors = input.match(colorRegex);
            if (foundColors) {
                input = input.replace(colorRegex, COLOR_TOKEN);
                parsed.push.apply(parsed, foundColors.map(color.parse));
            }
            var foundNumbers = input.match(floatRegex);
            if (foundNumbers) {
                parsed.push.apply(parsed, foundNumbers.map(number.parse));
            }
            return parsed;
        },
        createTransformer: function (prop) {
            var template = prop;
            var token = 0;
            var foundColors = prop.match(colorRegex);
            var numColors = foundColors ? foundColors.length : 0;
            if (foundColors) {
                for (var i = 0; i < numColors; i++) {
                    template = template.replace(foundColors[i], COLOR_TOKEN);
                    token++;
                }
            }
            var foundNumbers = template.match(floatRegex);
            var numNumbers = foundNumbers ? foundNumbers.length : 0;
            if (foundNumbers) {
                for (var i = 0; i < numNumbers; i++) {
                    template = template.replace(foundNumbers[i], NUMBER_TOKEN);
                    token++;
                }
            }
            return function (v) {
                var output = template;
                for (var i = 0; i < token; i++) {
                    output = output.replace(i < numColors ? COLOR_TOKEN : NUMBER_TOKEN, i < numColors ? color.transform(v[i]) : sanitize(v[i]));
                }
                return output;
            };
        },
        getAnimatableNone: function (target) {
            var parsedTarget = complex.parse(target);
            var targetTransformer = complex.createTransformer(target);
            return targetTransformer(parsedTarget.map(convertNumbersToZero));
        }
    };

    var invariant = function () { };

    var prevTime = 0;
    var onNextFrame = typeof window !== 'undefined' && window.requestAnimationFrame !== undefined
        ? function (callback) { return window.requestAnimationFrame(callback); }
        : function (callback) {
            var timestamp = Date.now();
            var timeToCall = Math.max(0, 16.7 - (timestamp - prevTime));
            prevTime = timestamp + timeToCall;
            setTimeout(function () { return callback(prevTime); }, timeToCall);
        };

    var createStep = (function (setRunNextFrame) {
        var processToRun = [];
        var processToRunNextFrame = [];
        var numThisFrame = 0;
        var isProcessing = false;
        var i = 0;
        var cancelled = new WeakSet();
        var toKeepAlive = new WeakSet();
        var renderStep = {
            cancel: function (process) {
                var indexOfCallback = processToRunNextFrame.indexOf(process);
                cancelled.add(process);
                if (indexOfCallback !== -1) {
                    processToRunNextFrame.splice(indexOfCallback, 1);
                }
            },
            process: function (frame) {
                var _a;
                isProcessing = true;
                _a = [
                    processToRunNextFrame,
                    processToRun
                ], processToRun = _a[0], processToRunNextFrame = _a[1];
                processToRunNextFrame.length = 0;
                numThisFrame = processToRun.length;
                if (numThisFrame) {
                    var process_1;
                    for (i = 0; i < numThisFrame; i++) {
                        process_1 = processToRun[i];
                        process_1(frame);
                        if (toKeepAlive.has(process_1) === true && !cancelled.has(process_1)) {
                            renderStep.schedule(process_1);
                            setRunNextFrame(true);
                        }
                    }
                }
                isProcessing = false;
            },
            schedule: function (process, keepAlive, immediate) {
                if (keepAlive === void 0) { keepAlive = false; }
                if (immediate === void 0) { immediate = false; }
                var addToCurrentBuffer = immediate && isProcessing;
                var buffer = addToCurrentBuffer ? processToRun : processToRunNextFrame;
                cancelled.delete(process);
                if (keepAlive)
                    toKeepAlive.add(process);
                if (buffer.indexOf(process) === -1) {
                    buffer.push(process);
                    if (addToCurrentBuffer)
                        numThisFrame = processToRun.length;
                }
            }
        };
        return renderStep;
    });

    var StepId;
    (function (StepId) {
        StepId["Read"] = "read";
        StepId["Update"] = "update";
        StepId["Render"] = "render";
        StepId["PostRender"] = "postRender";
        StepId["FixedUpdate"] = "fixedUpdate";
    })(StepId || (StepId = {}));

    var maxElapsed = 40;
    var defaultElapsed = (1 / 60) * 1000;
    var useDefaultElapsed = true;
    var willRunNextFrame = false;
    var isProcessing = false;
    var frame = {
        delta: 0,
        timestamp: 0
    };
    var stepsOrder = [
        StepId.Read,
        StepId.Update,
        StepId.Render,
        StepId.PostRender
    ];
    var setWillRunNextFrame = function (willRun) { return (willRunNextFrame = willRun); };
    var _a = stepsOrder.reduce(function (acc, key) {
        var step = createStep(setWillRunNextFrame);
        acc.sync[key] = function (process, keepAlive, immediate) {
            if (keepAlive === void 0) { keepAlive = false; }
            if (immediate === void 0) { immediate = false; }
            if (!willRunNextFrame)
                startLoop();
            step.schedule(process, keepAlive, immediate);
            return process;
        };
        acc.cancelSync[key] = function (process) { return step.cancel(process); };
        acc.steps[key] = step;
        return acc;
    }, {
        steps: {},
        sync: {},
        cancelSync: {}
    }), steps = _a.steps, sync = _a.sync, cancelSync = _a.cancelSync;
    var processStep = function (stepId) { return steps[stepId].process(frame); };
    var processFrame = function (timestamp) {
        willRunNextFrame = false;
        frame.delta = useDefaultElapsed
            ? defaultElapsed
            : Math.max(Math.min(timestamp - frame.timestamp, maxElapsed), 1);
        if (!useDefaultElapsed)
            defaultElapsed = frame.delta;
        frame.timestamp = timestamp;
        isProcessing = true;
        stepsOrder.forEach(processStep);
        isProcessing = false;
        if (willRunNextFrame) {
            useDefaultElapsed = false;
            onNextFrame(processFrame);
        }
    };
    var startLoop = function () {
        willRunNextFrame = true;
        useDefaultElapsed = true;
        if (!isProcessing)
            onNextFrame(processFrame);
    };
    var getFrameData = function () { return frame; };

    var DEFAULT_OVERSHOOT_STRENGTH = 1.525;
    var reversed = function (easing) {
        return function (p) {
            return 1 - easing(1 - p);
        };
    };
    var mirrored = function (easing) {
        return function (p) {
            return p <= 0.5 ? easing(2 * p) / 2 : (2 - easing(2 * (1 - p))) / 2;
        };
    };
    var createReversedEasing = reversed;
    var createMirroredEasing = mirrored;
    var createExpoIn = function (power) {
        return function (p) {
            return Math.pow(p, power);
        };
    };
    var createBackIn = function (power) {
        return function (p) {
            return p * p * ((power + 1) * p - power);
        };
    };
    var createAnticipateEasing = function (power) {
        var backEasing = createBackIn(power);
        return function (p) {
            return (p *= 2) < 1 ? 0.5 * backEasing(p) : 0.5 * (2 - Math.pow(2, -10 * (p - 1)));
        };
    };
    var linear = function (p) {
        return p;
    };
    var easeIn = /*#__PURE__*/createExpoIn(2);
    var easeOut = /*#__PURE__*/reversed(easeIn);
    var easeInOut = /*#__PURE__*/mirrored(easeIn);
    var circIn = function (p) {
        return 1 - Math.sin(Math.acos(p));
    };
    var circOut = /*#__PURE__*/reversed(circIn);
    var circInOut = /*#__PURE__*/mirrored(circOut);
    var backIn = /*#__PURE__*/createBackIn(DEFAULT_OVERSHOOT_STRENGTH);
    var backOut = /*#__PURE__*/reversed(backIn);
    var backInOut = /*#__PURE__*/mirrored(backIn);
    var anticipate = /*#__PURE__*/createAnticipateEasing(DEFAULT_OVERSHOOT_STRENGTH);
    var BOUNCE_FIRST_THRESHOLD = 4.0 / 11.0;
    var BOUNCE_SECOND_THRESHOLD = 8.0 / 11.0;
    var BOUNCE_THIRD_THRESHOLD = 9.0 / 10.0;
    var ca = 4356.0 / 361.0;
    var cb = 35442.0 / 1805.0;
    var cc = 16061.0 / 1805.0;
    var bounceOut = function (p) {
        var p2 = p * p;
        return p < BOUNCE_FIRST_THRESHOLD ? 7.5625 * p2 : p < BOUNCE_SECOND_THRESHOLD ? 9.075 * p2 - 9.9 * p + 3.4 : p < BOUNCE_THIRD_THRESHOLD ? ca * p2 - cb * p + cc : 10.8 * p * p - 20.52 * p + 10.72;
    };
    var bounceIn = function (p) {
        return 1.0 - bounceOut(1.0 - p);
    };
    var bounceInOut = function (p) {
        return p < 0.5 ? 0.5 * (1.0 - bounceOut(1.0 - p * 2.0)) : 0.5 * bounceOut(p * 2.0 - 1.0) + 0.5;
    };
    var NEWTON_ITERATIONS = 8;
    var NEWTON_MIN_SLOPE = 0.001;
    var SUBDIVISION_PRECISION = 0.0000001;
    var SUBDIVISION_MAX_ITERATIONS = 10;
    var K_SPLINE_TABLE_SIZE = 11;
    var K_SAMPLE_STEP_SIZE = 1.0 / (K_SPLINE_TABLE_SIZE - 1.0);
    var FLOAT_32_SUPPORTED = typeof Float32Array !== 'undefined';
    var a = function (a1, a2) {
        return 1.0 - 3.0 * a2 + 3.0 * a1;
    };
    var b = function (a1, a2) {
        return 3.0 * a2 - 6.0 * a1;
    };
    var c = function (a1) {
        return 3.0 * a1;
    };
    var getSlope = function (t, a1, a2) {
        return 3.0 * a(a1, a2) * t * t + 2.0 * b(a1, a2) * t + c(a1);
    };
    var calcBezier = function (t, a1, a2) {
        return ((a(a1, a2) * t + b(a1, a2)) * t + c(a1)) * t;
    };
    function cubicBezier(mX1, mY1, mX2, mY2) {
        var sampleValues = FLOAT_32_SUPPORTED ? new Float32Array(K_SPLINE_TABLE_SIZE) : new Array(K_SPLINE_TABLE_SIZE);
        var binarySubdivide = function (aX, aA, aB) {
            var i = 0;
            var currentX;
            var currentT;
            do {
                currentT = aA + (aB - aA) / 2.0;
                currentX = calcBezier(currentT, mX1, mX2) - aX;
                if (currentX > 0.0) {
                    aB = currentT;
                } else {
                    aA = currentT;
                }
            } while (Math.abs(currentX) > SUBDIVISION_PRECISION && ++i < SUBDIVISION_MAX_ITERATIONS);
            return currentT;
        };
        var newtonRaphsonIterate = function (aX, aGuessT) {
            var i = 0;
            var currentSlope = 0;
            var currentX;
            for (; i < NEWTON_ITERATIONS; ++i) {
                currentSlope = getSlope(aGuessT, mX1, mX2);
                if (currentSlope === 0.0) {
                    return aGuessT;
                }
                currentX = calcBezier(aGuessT, mX1, mX2) - aX;
                aGuessT -= currentX / currentSlope;
            }
            return aGuessT;
        };
        var calcSampleValues = function () {
            for (var i = 0; i < K_SPLINE_TABLE_SIZE; ++i) {
                sampleValues[i] = calcBezier(i * K_SAMPLE_STEP_SIZE, mX1, mX2);
            }
        };
        var getTForX = function (aX) {
            var intervalStart = 0.0;
            var currentSample = 1;
            var lastSample = K_SPLINE_TABLE_SIZE - 1;
            var dist = 0.0;
            var guessForT = 0.0;
            var initialSlope = 0.0;
            for (; currentSample !== lastSample && sampleValues[currentSample] <= aX; ++currentSample) {
                intervalStart += K_SAMPLE_STEP_SIZE;
            }
            --currentSample;
            dist = (aX - sampleValues[currentSample]) / (sampleValues[currentSample + 1] - sampleValues[currentSample]);
            guessForT = intervalStart + dist * K_SAMPLE_STEP_SIZE;
            initialSlope = getSlope(guessForT, mX1, mX2);
            if (initialSlope >= NEWTON_MIN_SLOPE) {
                return newtonRaphsonIterate(aX, guessForT);
            } else if (initialSlope === 0.0) {
                return guessForT;
            } else {
                return binarySubdivide(aX, intervalStart, intervalStart + K_SAMPLE_STEP_SIZE);
            }
        };
        calcSampleValues();
        var resolver = function (aX) {
            var returnValue;
            if (mX1 === mY1 && mX2 === mY2) {
                returnValue = aX;
            } else if (aX === 0) {
                returnValue = 0;
            } else if (aX === 1) {
                returnValue = 1;
            } else {
                returnValue = calcBezier(getTForX(aX), mY1, mY2);
            }
            return returnValue;
        };
        return resolver;
    }

    var easing = /*#__PURE__*/Object.freeze({
        __proto__: null,
        reversed: reversed,
        mirrored: mirrored,
        createReversedEasing: createReversedEasing,
        createMirroredEasing: createMirroredEasing,
        createExpoIn: createExpoIn,
        createBackIn: createBackIn,
        createAnticipateEasing: createAnticipateEasing,
        linear: linear,
        easeIn: easeIn,
        easeOut: easeOut,
        easeInOut: easeInOut,
        circIn: circIn,
        circOut: circOut,
        circInOut: circInOut,
        backIn: backIn,
        backOut: backOut,
        backInOut: backInOut,
        anticipate: anticipate,
        bounceOut: bounceOut,
        bounceIn: bounceIn,
        bounceInOut: bounceInOut,
        cubicBezier: cubicBezier
    });

    var zeroPoint = {
        x: 0,
        y: 0,
        z: 0
    };
    var isNum = function (v) { return typeof v === 'number'; };

    var radiansToDegrees = (function (radians) { return (radians * 180) / Math.PI; });

    var angle = (function (a, b) {
        if (b === void 0) { b = zeroPoint; }
        return radiansToDegrees(Math.atan2(b.y - a.y, b.x - a.x));
    });

    var applyOffset = (function (from, to) {
        var hasReceivedFrom = true;
        if (to === undefined) {
            to = from;
            hasReceivedFrom = false;
        }
        return function (v) {
            if (hasReceivedFrom) {
                return v - from + to;
            }
            else {
                from = v;
                hasReceivedFrom = true;
                return to;
            }
        };
    });

    var curryRange = (function (func) { return function (min, max, v) { return (v !== undefined ? func(min, max, v) : function (cv) { return func(min, max, cv); }); }; });

    var clamp$1 = function (min, max, v) {
        return Math.min(Math.max(v, min), max);
    };
    var clamp$1$1 = curryRange(clamp$1);

    var conditional = (function (check, apply) { return function (v) {
        return check(v) ? apply(v) : v;
    }; });

    var isPoint = (function (point) {
        return point.hasOwnProperty('x') && point.hasOwnProperty('y');
    });

    var isPoint3D = (function (point) {
        return isPoint(point) && point.hasOwnProperty('z');
    });

    var distance1D = function (a, b) { return Math.abs(a - b); };
    var distance = (function (a, b) {
        if (b === void 0) { b = zeroPoint; }
        if (isNum(a) && isNum(b)) {
            return distance1D(a, b);
        }
        else if (isPoint(a) && isPoint(b)) {
            var xDelta = distance1D(a.x, b.x);
            var yDelta = distance1D(a.y, b.y);
            var zDelta = isPoint3D(a) && isPoint3D(b) ? distance1D(a.z, b.z) : 0;
            return Math.sqrt(Math.pow(xDelta, 2) + Math.pow(yDelta, 2) + Math.pow(zDelta, 2));
        }
        return 0;
    });

    var progress = (function (from, to, value) {
        var toFromDifference = to - from;
        return toFromDifference === 0 ? 1 : (value - from) / toFromDifference;
    });

    var mix = (function (from, to, progress) {
        return -progress * from + progress * to + from;
    });

    /*! *****************************************************************************
    Copyright (c) Microsoft Corporation. All rights reserved.
    Licensed under the Apache License, Version 2.0 (the "License"); you may not use
    this file except in compliance with the License. You may obtain a copy of the
    License at http://www.apache.org/licenses/LICENSE-2.0

    THIS CODE IS PROVIDED ON AN *AS IS* BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
    KIND, EITHER EXPRESS OR IMPLIED, INCLUDING WITHOUT LIMITATION ANY IMPLIED
    WARRANTIES OR CONDITIONS OF TITLE, FITNESS FOR A PARTICULAR PURPOSE,
    MERCHANTABLITY OR NON-INFRINGEMENT.

    See the Apache Version 2.0 License for specific language governing permissions
    and limitations under the License.
    ***************************************************************************** */

    var __assign$2 = function() {
        __assign$2 = Object.assign || function __assign(t) {
            for (var s, i = 1, n = arguments.length; i < n; i++) {
                s = arguments[i];
                for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p)) t[p] = s[p];
            }
            return t;
        };
        return __assign$2.apply(this, arguments);
    };

    var mixLinearColor = function (from, to, v) {
        var fromExpo = from * from;
        var toExpo = to * to;
        return Math.sqrt(Math.max(0, v * (toExpo - fromExpo) + fromExpo));
    };
    var colorTypes = [hex, rgba, hsla];
    var getColorType = function (v) {
        return colorTypes.find(function (type) { return type.test(v); });
    };
    var mixColor = (function (from, to) {
        var fromColorType = getColorType(from);
        var toColorType = getColorType(to);
        invariant(fromColorType.transform === toColorType.transform);
        var fromColor = fromColorType.parse(from);
        var toColor = toColorType.parse(to);
        var blended = __assign$2({}, fromColor);
        var mixFunc = fromColorType === hsla ? mix : mixLinearColor;
        return function (v) {
            for (var key in blended) {
                if (key !== 'alpha') {
                    blended[key] = mixFunc(fromColor[key], toColor[key], v);
                }
            }
            blended.alpha = mix(fromColor.alpha, toColor.alpha, v);
            return fromColorType.transform(blended);
        };
    });

    var combineFunctions = function (a, b) { return function (v) { return b(a(v)); }; };
    var pipe = (function () {
        var transformers = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            transformers[_i] = arguments[_i];
        }
        return transformers.reduce(combineFunctions);
    });

    function getMixer(origin, target) {
        if (isNum(origin)) {
            return function (v) { return mix(origin, target, v); };
        }
        else if (color.test(origin)) {
            return mixColor(origin, target);
        }
        else {
            return mixComplex(origin, target);
        }
    }
    var mixArray = function (from, to) {
        var output = from.slice();
        var numValues = output.length;
        var blendValue = from.map(function (fromThis, i) { return getMixer(fromThis, to[i]); });
        return function (v) {
            for (var i = 0; i < numValues; i++) {
                output[i] = blendValue[i](v);
            }
            return output;
        };
    };
    var mixObject = function (origin, target) {
        var output = __assign$2({}, origin, target);
        var blendValue = {};
        for (var key in output) {
            if (origin[key] !== undefined && target[key] !== undefined) {
                blendValue[key] = getMixer(origin[key], target[key]);
            }
        }
        return function (v) {
            for (var key in blendValue) {
                output[key] = blendValue[key](v);
            }
            return output;
        };
    };
    function analyse(value) {
        var parsed = complex.parse(value);
        var numValues = parsed.length;
        var numNumbers = 0;
        var numRGB = 0;
        var numHSL = 0;
        for (var i = 0; i < numValues; i++) {
            if (numNumbers || typeof parsed[i] === 'number') {
                numNumbers++;
            }
            else {
                if (parsed[i].hue !== undefined) {
                    numHSL++;
                }
                else {
                    numRGB++;
                }
            }
        }
        return { parsed: parsed, numNumbers: numNumbers, numRGB: numRGB, numHSL: numHSL };
    }
    var mixComplex = function (origin, target) {
        var template = complex.createTransformer(target);
        var originStats = analyse(origin);
        var targetStats = analyse(target);
        return pipe(mixArray(originStats.parsed, targetStats.parsed), template);
    };

    var mixNumber = function (from, to) { return function (p) { return mix(from, to, p); }; };
    function detectMixerFactory(v) {
        if (typeof v === 'number') {
            return mixNumber;
        }
        else if (typeof v === 'string') {
            if (color.test(v)) {
                return mixColor;
            }
            else {
                return mixComplex;
            }
        }
        else if (Array.isArray(v)) {
            return mixArray;
        }
        else if (typeof v === 'object') {
            return mixObject;
        }
    }
    function createMixers(output, ease, customMixer) {
        var mixers = [];
        var mixerFactory = customMixer || detectMixerFactory(output[0]);
        var numMixers = output.length - 1;
        for (var i = 0; i < numMixers; i++) {
            var mixer = mixerFactory(output[i], output[i + 1]);
            if (ease) {
                var easingFunction = Array.isArray(ease) ? ease[i] : ease;
                mixer = pipe(easingFunction, mixer);
            }
            mixers.push(mixer);
        }
        return mixers;
    }
    function fastInterpolate(_a, _b) {
        var from = _a[0], to = _a[1];
        var mixer = _b[0];
        return function (v) { return mixer(progress(from, to, v)); };
    }
    function slowInterpolate(input, mixers) {
        var inputLength = input.length;
        var lastInputIndex = inputLength - 1;
        return function (v) {
            var mixerIndex = 0;
            var foundMixerIndex = false;
            if (v <= input[0]) {
                foundMixerIndex = true;
            }
            else if (v >= input[lastInputIndex]) {
                mixerIndex = lastInputIndex - 1;
                foundMixerIndex = true;
            }
            if (!foundMixerIndex) {
                var i = 1;
                for (; i < inputLength; i++) {
                    if (input[i] > v || i === lastInputIndex) {
                        break;
                    }
                }
                mixerIndex = i - 1;
            }
            var progressInRange = progress(input[mixerIndex], input[mixerIndex + 1], v);
            return mixers[mixerIndex](progressInRange);
        };
    }
    function interpolate(input, output, _a) {
        var _b = _a === void 0 ? {} : _a, _c = _b.clamp, clamp = _c === void 0 ? true : _c, ease = _b.ease, mixer = _b.mixer;
        var inputLength = input.length;
        invariant(inputLength === output.length);
        invariant(!ease || !Array.isArray(ease) || ease.length === inputLength - 1);
        if (input[0] > input[inputLength - 1]) {
            input = [].concat(input);
            output = [].concat(output);
            input.reverse();
            output.reverse();
        }
        var mixers = createMixers(output, ease, mixer);
        var interpolator = inputLength === 2
            ? fastInterpolate(input, mixers)
            : slowInterpolate(input, mixers);
        return clamp
            ? pipe(clamp$1$1(input[0], input[inputLength - 1]), interpolator)
            : interpolator;
    }

    var toDecimal = (function (num, precision) {
        if (precision === void 0) { precision = 2; }
        precision = Math.pow(10, precision);
        return Math.round(num * precision) / precision;
    });

    var smoothFrame = (function (prevValue, nextValue, duration, smoothing) {
        if (smoothing === void 0) { smoothing = 0; }
        return toDecimal(prevValue +
            (duration * (nextValue - prevValue)) / Math.max(smoothing, duration));
    });

    var smooth = (function (strength) {
        if (strength === void 0) { strength = 50; }
        var previousValue = 0;
        var lastUpdated = 0;
        return function (v) {
            var currentFramestamp = getFrameData().timestamp;
            var timeDelta = currentFramestamp !== lastUpdated ? currentFramestamp - lastUpdated : 0;
            var newValue = timeDelta
                ? smoothFrame(previousValue, v, timeDelta, strength)
                : previousValue;
            lastUpdated = currentFramestamp;
            previousValue = newValue;
            return newValue;
        };
    });

    var snap = (function (points) {
        if (typeof points === 'number') {
            return function (v) { return Math.round(v / points) * points; };
        }
        else {
            var i_1 = 0;
            var numPoints_1 = points.length;
            return function (v) {
                var lastDistance = Math.abs(points[0] - v);
                for (i_1 = 1; i_1 < numPoints_1; i_1++) {
                    var point = points[i_1];
                    var distance = Math.abs(point - v);
                    if (distance === 0)
                        return point;
                    if (distance > lastDistance)
                        return points[i_1 - 1];
                    if (i_1 === numPoints_1 - 1)
                        return point;
                    lastDistance = distance;
                }
            };
        }
    });

    var identity = function (v) { return v; };
    var springForce = function (alterDisplacement) {
        if (alterDisplacement === void 0) { alterDisplacement = identity; }
        return curryRange(function (constant, origin, v) {
            var displacement = origin - v;
            var springModifiedDisplacement = -(0 - constant + 1) * (0 - alterDisplacement(Math.abs(displacement)));
            return displacement <= 0
                ? origin + springModifiedDisplacement
                : origin - springModifiedDisplacement;
        });
    };
    var springForceLinear = springForce();
    var springForceExpo = springForce(Math.sqrt);

    var velocityPerSecond = (function (velocity, frameDuration) {
        return frameDuration ? velocity * (1000 / frameDuration) : 0;
    });

    var wrap = function (min, max, v) {
        var rangeSize = max - min;
        return ((((v - min) % rangeSize) + rangeSize) % rangeSize) + min;
    };
    var wrap$1 = curryRange(wrap);

    var clampProgress = clamp$1$1(0, 1);

    var createStyler = function (_a) {
        var onRead = _a.onRead,
            onRender = _a.onRender,
            _b = _a.uncachedValues,
            uncachedValues = _b === void 0 ? new Set() : _b,
            _c = _a.useCache,
            useCache = _c === void 0 ? true : _c;
        return function (_a) {
            if (_a === void 0) {
                _a = {};
            }
            var props = __rest(_a, []);
            var state = {};
            var changedValues = [];
            var hasChanged = false;
            function setValue(key, value) {
                if (key.startsWith('--')) {
                    props.hasCSSVariable = true;
                }
                var currentValue = state[key];
                state[key] = value;
                if (state[key] === currentValue) return;
                if (changedValues.indexOf(key) === -1) {
                    changedValues.push(key);
                }
                if (!hasChanged) {
                    hasChanged = true;
                    sync.render(styler.render);
                }
            }
            var styler = {
                get: function (key, forceRead) {
                    if (forceRead === void 0) {
                        forceRead = false;
                    }
                    var useCached = !forceRead && useCache && !uncachedValues.has(key) && state[key] !== undefined;
                    return useCached ? state[key] : onRead(key, props);
                },
                set: function (values, value) {
                    if (typeof values === 'string') {
                        setValue(values, value);
                    } else {
                        for (var key in values) {
                            setValue(key, values[key]);
                        }
                    }
                    return this;
                },
                render: function (forceRender) {
                    if (forceRender === void 0) {
                        forceRender = false;
                    }
                    if (hasChanged || forceRender === true) {
                        onRender(state, props, changedValues);
                        hasChanged = false;
                        changedValues.length = 0;
                    }
                    return this;
                }
            };
            return styler;
        };
    };

    var CAMEL_CASE_PATTERN = /([a-z])([A-Z])/g;
    var REPLACE_TEMPLATE = '$1-$2';
    var camelToDash = function (str) {
        return str.replace(CAMEL_CASE_PATTERN, REPLACE_TEMPLATE).toLowerCase();
    };

    var camelCache = /*#__PURE__*/new Map();
    var dashCache = /*#__PURE__*/new Map();
    var prefixes = ['Webkit', 'Moz', 'O', 'ms', ''];
    var numPrefixes = prefixes.length;
    var isBrowser = typeof document !== 'undefined';
    var testElement;
    var setDashPrefix = function (key, prefixed) {
        return dashCache.set(key, camelToDash(prefixed));
    };
    var testPrefix = function (key) {
        testElement = testElement || document.createElement('div');
        for (var i = 0; i < numPrefixes; i++) {
            var prefix = prefixes[i];
            var noPrefix = prefix === '';
            var prefixedPropertyName = noPrefix ? key : prefix + key.charAt(0).toUpperCase() + key.slice(1);
            if (prefixedPropertyName in testElement.style || noPrefix) {
                if (noPrefix && key === 'clipPath' && dashCache.has(key)) {
                    return;
                }
                camelCache.set(key, prefixedPropertyName);
                setDashPrefix(key, "" + (noPrefix ? '' : '-') + camelToDash(prefixedPropertyName));
            }
        }
    };
    var setServerProperty = function (key) {
        return setDashPrefix(key, key);
    };
    var prefixer = function (key, asDashCase) {
        if (asDashCase === void 0) {
            asDashCase = false;
        }
        var cache = asDashCase ? dashCache : camelCache;
        if (!cache.has(key)) {
            isBrowser ? testPrefix(key) : setServerProperty(key);
        }
        return cache.get(key) || key;
    };

    var axes = ['', 'X', 'Y', 'Z'];
    var order = ['translate', 'scale', 'rotate', 'skew', 'transformPerspective'];
    var transformProps = /*#__PURE__*/order.reduce(function (acc, key) {
        return axes.reduce(function (axesAcc, axesKey) {
            axesAcc.push(key + axesKey);
            return axesAcc;
        }, acc);
    }, ['x', 'y', 'z']);
    var transformPropDictionary = /*#__PURE__*/transformProps.reduce(function (dict, key) {
        dict[key] = true;
        return dict;
    }, {});
    function isTransformProp(key) {
        return transformPropDictionary[key] === true;
    }
    function sortTransformProps(a, b) {
        return transformProps.indexOf(a) - transformProps.indexOf(b);
    }
    var transformOriginProps = /*#__PURE__*/new Set(['originX', 'originY', 'originZ']);
    function isTransformOriginProp(key) {
        return transformOriginProps.has(key);
    }

    var int = /*#__PURE__*/__assign( /*#__PURE__*/__assign({}, number), { transform: Math.round });
    var valueTypes = {
        color: color,
        backgroundColor: color,
        outlineColor: color,
        fill: color,
        stroke: color,
        borderColor: color,
        borderTopColor: color,
        borderRightColor: color,
        borderBottomColor: color,
        borderLeftColor: color,
        borderWidth: px,
        borderTopWidth: px,
        borderRightWidth: px,
        borderBottomWidth: px,
        borderLeftWidth: px,
        borderRadius: px,
        radius: px,
        borderTopLeftRadius: px,
        borderTopRightRadius: px,
        borderBottomRightRadius: px,
        borderBottomLeftRadius: px,
        width: px,
        maxWidth: px,
        height: px,
        maxHeight: px,
        size: px,
        top: px,
        right: px,
        bottom: px,
        left: px,
        padding: px,
        paddingTop: px,
        paddingRight: px,
        paddingBottom: px,
        paddingLeft: px,
        margin: px,
        marginTop: px,
        marginRight: px,
        marginBottom: px,
        marginLeft: px,
        rotate: degrees,
        rotateX: degrees,
        rotateY: degrees,
        rotateZ: degrees,
        scale: scale,
        scaleX: scale,
        scaleY: scale,
        scaleZ: scale,
        skew: degrees,
        skewX: degrees,
        skewY: degrees,
        distance: px,
        translateX: px,
        translateY: px,
        translateZ: px,
        x: px,
        y: px,
        z: px,
        perspective: px,
        opacity: alpha,
        originX: progressPercentage,
        originY: progressPercentage,
        originZ: px,
        zIndex: int,
        fillOpacity: alpha,
        strokeOpacity: alpha,
        numOctaves: int
    };
    var getValueType = function (key) {
        return valueTypes[key];
    };
    var getValueAsType = function (value, type) {
        return type && typeof value === 'number' ? type.transform(value) : value;
    };

    var SCROLL_LEFT = 'scrollLeft';
    var SCROLL_TOP = 'scrollTop';
    var scrollKeys = /*#__PURE__*/new Set([SCROLL_LEFT, SCROLL_TOP]);

    var blacklist = /*#__PURE__*/new Set([SCROLL_LEFT, SCROLL_TOP, 'transform']);
    var translateAlias = {
        x: 'translateX',
        y: 'translateY',
        z: 'translateZ'
    };
    function isCustomTemplate(v) {
        return typeof v === 'function';
    }
    function buildTransform(state, transform, transformKeys, transformIsDefault, enableHardwareAcceleration, allowTransformNone) {
        if (allowTransformNone === void 0) {
            allowTransformNone = true;
        }
        var transformString = '';
        var transformHasZ = false;
        transformKeys.sort(sortTransformProps);
        var numTransformKeys = transformKeys.length;
        for (var i = 0; i < numTransformKeys; i++) {
            var key = transformKeys[i];
            transformString += (translateAlias[key] || key) + "(" + transform[key] + ") ";
            transformHasZ = key === 'z' ? true : transformHasZ;
        }
        if (!transformHasZ && enableHardwareAcceleration) {
            transformString += 'translateZ(0)';
        } else {
            transformString = transformString.trim();
        }
        if (isCustomTemplate(state.transform)) {
            transformString = state.transform(transform, transformIsDefault ? '' : transformString);
        } else if (allowTransformNone && transformIsDefault) {
            transformString = 'none';
        }
        return transformString;
    }
    function buildStyleProperty(state, enableHardwareAcceleration, styles, transform, transformOrigin, transformKeys, isDashCase, allowTransformNone) {
        if (enableHardwareAcceleration === void 0) {
            enableHardwareAcceleration = true;
        }
        if (styles === void 0) {
            styles = {};
        }
        if (transform === void 0) {
            transform = {};
        }
        if (transformOrigin === void 0) {
            transformOrigin = {};
        }
        if (transformKeys === void 0) {
            transformKeys = [];
        }
        if (isDashCase === void 0) {
            isDashCase = false;
        }
        if (allowTransformNone === void 0) {
            allowTransformNone = true;
        }
        var transformIsDefault = true;
        var hasTransform = false;
        var hasTransformOrigin = false;
        for (var key in state) {
            var value = state[key];
            var valueType = getValueType(key);
            var valueAsType = getValueAsType(value, valueType);
            if (isTransformProp(key)) {
                hasTransform = true;
                transform[key] = valueAsType;
                transformKeys.push(key);
                if (transformIsDefault) {
                    if (valueType.default && value !== valueType.default || !valueType.default && value !== 0) {
                        transformIsDefault = false;
                    }
                }
            } else if (isTransformOriginProp(key)) {
                transformOrigin[key] = valueAsType;
                hasTransformOrigin = true;
            } else if (!blacklist.has(key) || !isCustomTemplate(valueAsType)) {
                styles[prefixer(key, isDashCase)] = valueAsType;
            }
        }
        if (hasTransform || typeof state.transform === 'function') {
            styles.transform = buildTransform(state, transform, transformKeys, transformIsDefault, enableHardwareAcceleration, allowTransformNone);
        }
        if (hasTransformOrigin) {
            styles.transformOrigin = (transformOrigin.originX || '50%') + " " + (transformOrigin.originY || '50%') + " " + (transformOrigin.originZ || 0);
        }
        return styles;
    }
    function createStyleBuilder(_a) {
        var _b = _a === void 0 ? {} : _a,
            _c = _b.enableHardwareAcceleration,
            enableHardwareAcceleration = _c === void 0 ? true : _c,
            _d = _b.isDashCase,
            isDashCase = _d === void 0 ? true : _d,
            _e = _b.allowTransformNone,
            allowTransformNone = _e === void 0 ? true : _e;
        var styles = {};
        var transform = {};
        var transformOrigin = {};
        var transformKeys = [];
        return function (state) {
            transformKeys.length = 0;
            buildStyleProperty(state, enableHardwareAcceleration, styles, transform, transformOrigin, transformKeys, isDashCase, allowTransformNone);
            return styles;
        };
    }

    function onRead(key, options) {
        var element = options.element,
            preparseOutput = options.preparseOutput;
        var defaultValueType = getValueType(key);
        if (isTransformProp(key)) {
            return defaultValueType ? defaultValueType.default || 0 : 0;
        } else if (scrollKeys.has(key)) {
            return element[key];
        } else {
            var domValue = window.getComputedStyle(element, null).getPropertyValue(prefixer(key, true)) || 0;
            return preparseOutput && defaultValueType && defaultValueType.test(domValue) && defaultValueType.parse ? defaultValueType.parse(domValue) : domValue;
        }
    }
    function onRender(state, _a, changedValues) {
        var element = _a.element,
            buildStyles = _a.buildStyles,
            hasCSSVariable = _a.hasCSSVariable;
        Object.assign(element.style, buildStyles(state));
        if (hasCSSVariable) {
            var numChangedValues = changedValues.length;
            for (var i = 0; i < numChangedValues; i++) {
                var key = changedValues[i];
                if (key.startsWith('--')) {
                    element.style.setProperty(key, state[key]);
                }
            }
        }
        if (changedValues.indexOf(SCROLL_LEFT) !== -1) {
            element[SCROLL_LEFT] = state[SCROLL_LEFT];
        }
        if (changedValues.indexOf(SCROLL_TOP) !== -1) {
            element[SCROLL_TOP] = state[SCROLL_TOP];
        }
    }
    var cssStyler = /*#__PURE__*/createStyler({
        onRead: onRead,
        onRender: onRender,
        uncachedValues: scrollKeys
    });
    function createCssStyler(element, _a) {
        if (_a === void 0) {
            _a = {};
        }
        var enableHardwareAcceleration = _a.enableHardwareAcceleration,
            allowTransformNone = _a.allowTransformNone,
            props = __rest(_a, ["enableHardwareAcceleration", "allowTransformNone"]);
        return cssStyler(__assign({ element: element, buildStyles: createStyleBuilder({
                enableHardwareAcceleration: enableHardwareAcceleration,
                allowTransformNone: allowTransformNone
            }), preparseOutput: true }, props));
    }

    var camelCaseAttributes = /*#__PURE__*/new Set(['baseFrequency', 'diffuseConstant', 'kernelMatrix', 'kernelUnitLength', 'keySplines', 'keyTimes', 'limitingConeAngle', 'markerHeight', 'markerWidth', 'numOctaves', 'targetX', 'targetY', 'surfaceScale', 'specularConstant', 'specularExponent', 'stdDeviation', 'tableValues']);

    var defaultOrigin = 0.5;
    var svgAttrsTemplate = function () {
        return {
            style: {}
        };
    };
    var progressToPixels = function (progress, length) {
        return px.transform(progress * length);
    };
    var unmeasured = { x: 0, y: 0, width: 0, height: 0 };
    function calcOrigin(origin, offset, size) {
        return typeof origin === 'string' ? origin : px.transform(offset + size * origin);
    }
    function calculateSVGTransformOrigin(dimensions, originX, originY) {
        return calcOrigin(originX, dimensions.x, dimensions.width) + " " + calcOrigin(originY, dimensions.y, dimensions.height);
    }
    var svgStyleConfig = {
        enableHardwareAcceleration: false,
        isDashCase: false
    };
    function buildSVGAttrs(_a, dimensions, totalPathLength, cssBuilder, attrs, isDashCase) {
        if (dimensions === void 0) {
            dimensions = unmeasured;
        }
        if (cssBuilder === void 0) {
            cssBuilder = createStyleBuilder(svgStyleConfig);
        }
        if (attrs === void 0) {
            attrs = svgAttrsTemplate();
        }
        if (isDashCase === void 0) {
            isDashCase = true;
        }
        var attrX = _a.attrX,
            attrY = _a.attrY,
            originX = _a.originX,
            originY = _a.originY,
            pathLength = _a.pathLength,
            _b = _a.pathSpacing,
            pathSpacing = _b === void 0 ? 1 : _b,
            _c = _a.pathOffset,
            pathOffset = _c === void 0 ? 0 : _c,
            state = __rest(_a, ["attrX", "attrY", "originX", "originY", "pathLength", "pathSpacing", "pathOffset"]);
        var style = cssBuilder(state);
        for (var key in style) {
            if (key === 'transform') {
                attrs.style.transform = style[key];
            } else {
                var attrKey = isDashCase && !camelCaseAttributes.has(key) ? camelToDash(key) : key;
                attrs[attrKey] = style[key];
            }
        }
        if (originX !== undefined || originY !== undefined || style.transform) {
            attrs.style.transformOrigin = calculateSVGTransformOrigin(dimensions, originX !== undefined ? originX : defaultOrigin, originY !== undefined ? originY : defaultOrigin);
        }
        if (attrX !== undefined) attrs.x = attrX;
        if (attrY !== undefined) attrs.y = attrY;
        if (totalPathLength !== undefined && pathLength !== undefined) {
            attrs[isDashCase ? 'stroke-dashoffset' : 'strokeDashoffset'] = progressToPixels(-pathOffset, totalPathLength);
            attrs[isDashCase ? 'stroke-dasharray' : 'strokeDasharray'] = progressToPixels(pathLength, totalPathLength) + " " + progressToPixels(pathSpacing, totalPathLength);
        }
        return attrs;
    }
    function createAttrBuilder(dimensions, totalPathLength, isDashCase) {
        if (isDashCase === void 0) {
            isDashCase = true;
        }
        var attrs = svgAttrsTemplate();
        var cssBuilder = createStyleBuilder(svgStyleConfig);
        return function (state) {
            return buildSVGAttrs(state, dimensions, totalPathLength, cssBuilder, attrs, isDashCase);
        };
    }

    var getDimensions = function (element) {
        return typeof element.getBBox === 'function' ? element.getBBox() : element.getBoundingClientRect();
    };
    var getSVGElementDimensions = function (element) {
        try {
            return getDimensions(element);
        } catch (e) {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
    };

    var isPath = function (element) {
        return element.tagName === 'path';
    };
    var svgStyler = /*#__PURE__*/createStyler({
        onRead: function (key, _a) {
            var element = _a.element;
            key = !camelCaseAttributes.has(key) ? camelToDash(key) : key;
            if (!isTransformProp(key)) {
                return element.getAttribute(key);
            } else {
                var valueType = getValueType(key);
                return valueType ? valueType.default || 0 : 0;
            }
        },
        onRender: function (state, _a) {
            var element = _a.element,
                buildAttrs = _a.buildAttrs;
            var attrs = buildAttrs(state);
            for (var key in attrs) {
                if (key === 'style') {
                    Object.assign(element.style, attrs.style);
                } else {
                    element.setAttribute(key, attrs[key]);
                }
            }
        }
    });
    var svg = function (element) {
        var dimensions = getSVGElementDimensions(element);
        var pathLength = isPath(element) && element.getTotalLength ? element.getTotalLength() : undefined;
        return svgStyler({
            element: element,
            buildAttrs: createAttrBuilder(dimensions, pathLength)
        });
    };

    var viewport = /*#__PURE__*/createStyler({
        useCache: false,
        onRead: function (key) {
            return key === 'scrollTop' ? window.pageYOffset : window.pageXOffset;
        },
        onRender: function (_a) {
            var _b = _a.scrollTop,
                scrollTop = _b === void 0 ? 0 : _b,
                _c = _a.scrollLeft,
                scrollLeft = _c === void 0 ? 0 : _c;
            return window.scrollTo(scrollLeft, scrollTop);
        }
    });

    var cache = /*#__PURE__*/new WeakMap();
    var isHTMLElement = function (node) {
        return node instanceof HTMLElement || typeof node.click === 'function';
    };
    var isSVGElement = function (node) {
        return node instanceof SVGElement || 'ownerSVGElement' in node;
    };
    var createDOMStyler = function (node, props) {
        var styler;
        if (node === window) {
            styler = viewport(node);
        } else if (isHTMLElement(node)) {
            styler = createCssStyler(node, props);
        } else if (isSVGElement(node)) {
            styler = svg(node);
        }
        cache.set(node, styler);
        return styler;
    };
    var getStyler = function (node, props) {
        return cache.has(node) ? cache.get(node) : createDOMStyler(node, props);
    };
    function index(nodeOrSelector, props) {
        var node = typeof nodeOrSelector === 'string' ? document.querySelector(nodeOrSelector) : nodeOrSelector;
        return getStyler(node, props);
    }

    var Chainable = /*#__PURE__*/function () {
        function Chainable(props) {
            if (props === void 0) {
                props = {};
            }
            this.props = props;
        }
        Chainable.prototype.applyMiddleware = function (middleware) {
            return this.create(__assign(__assign({}, this.props), { middleware: this.props.middleware ? __spreadArrays([middleware], this.props.middleware) : [middleware] }));
        };
        Chainable.prototype.pipe = function () {
            var funcs = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                funcs[_i] = arguments[_i];
            }
            var pipedUpdate = funcs.length === 1 ? funcs[0] : pipe.apply(void 0, funcs);
            return this.applyMiddleware(function (update) {
                return function (v) {
                    return update(pipedUpdate(v));
                };
            });
        };
        Chainable.prototype.while = function (predicate) {
            return this.applyMiddleware(function (update, complete) {
                return function (v) {
                    return predicate(v) ? update(v) : complete();
                };
            });
        };
        Chainable.prototype.filter = function (predicate) {
            return this.applyMiddleware(function (update) {
                return function (v) {
                    return predicate(v) && update(v);
                };
            });
        };
        return Chainable;
    }();

    var Observer = /*#__PURE__*/function () {
        function Observer(_a, observer) {
            var _this = this;
            var middleware = _a.middleware,
                onComplete = _a.onComplete;
            this.isActive = true;
            this.update = function (v) {
                if (_this.observer.update) _this.updateObserver(v);
            };
            this.complete = function () {
                if (_this.observer.complete && _this.isActive) _this.observer.complete();
                if (_this.onComplete) _this.onComplete();
                _this.isActive = false;
            };
            this.error = function (err) {
                if (_this.observer.error && _this.isActive) _this.observer.error(err);
                _this.isActive = false;
            };
            this.observer = observer;
            this.updateObserver = function (v) {
                return observer.update(v);
            };
            this.onComplete = onComplete;
            if (observer.update && middleware && middleware.length) {
                middleware.forEach(function (m) {
                    return _this.updateObserver = m(_this.updateObserver, _this.complete);
                });
            }
        }
        return Observer;
    }();
    var createObserver = function (observerCandidate, _a, onComplete) {
        var middleware = _a.middleware;
        if (typeof observerCandidate === 'function') {
            return new Observer({ middleware: middleware, onComplete: onComplete }, { update: observerCandidate });
        } else {
            return new Observer({ middleware: middleware, onComplete: onComplete }, observerCandidate);
        }
    };

    var Action = /*#__PURE__*/function (_super) {
        __extends(Action, _super);
        function Action() {
            return _super !== null && _super.apply(this, arguments) || this;
        }
        Action.prototype.create = function (props) {
            return new Action(props);
        };
        Action.prototype.start = function (observerCandidate) {
            if (observerCandidate === void 0) {
                observerCandidate = {};
            }
            var isComplete = false;
            var subscription = {
                stop: function () {
                    return undefined;
                }
            };
            var _a = this.props,
                init = _a.init,
                observerProps = __rest(_a, ["init"]);
            var observer = createObserver(observerCandidate, observerProps, function () {
                isComplete = true;
                subscription.stop();
            });
            var api = init(observer);
            subscription = api ? __assign(__assign({}, subscription), api) : subscription;
            if (observerCandidate.registerParent) {
                observerCandidate.registerParent(subscription);
            }
            if (isComplete) subscription.stop();
            return subscription;
        };
        return Action;
    }(Chainable);
    var action = function (init) {
        return new Action({ init: init });
    };

    var BaseMulticast = /*#__PURE__*/function (_super) {
        __extends(BaseMulticast, _super);
        function BaseMulticast() {
            var _this = _super !== null && _super.apply(this, arguments) || this;
            _this.subscribers = [];
            return _this;
        }
        BaseMulticast.prototype.complete = function () {
            this.subscribers.forEach(function (subscriber) {
                return subscriber.complete();
            });
        };
        BaseMulticast.prototype.error = function (err) {
            this.subscribers.forEach(function (subscriber) {
                return subscriber.error(err);
            });
        };
        BaseMulticast.prototype.update = function (v) {
            for (var i = 0; i < this.subscribers.length; i++) {
                this.subscribers[i].update(v);
            }
        };
        BaseMulticast.prototype.subscribe = function (observerCandidate) {
            var _this = this;
            var observer = createObserver(observerCandidate, this.props);
            this.subscribers.push(observer);
            var subscription = {
                unsubscribe: function () {
                    var index = _this.subscribers.indexOf(observer);
                    if (index !== -1) _this.subscribers.splice(index, 1);
                }
            };
            return subscription;
        };
        BaseMulticast.prototype.stop = function () {
            if (this.parent) this.parent.stop();
        };
        BaseMulticast.prototype.registerParent = function (subscription) {
            this.stop();
            this.parent = subscription;
        };
        return BaseMulticast;
    }(Chainable);

    var stepProgress = function (steps, progress) {
        var segment = 1 / (steps - 1);
        var subsegment = 1 / (2 * (steps - 1));
        var percentProgressOfTarget = Math.min(progress, 1);
        var subsegmentProgressOfTarget = percentProgressOfTarget / subsegment;
        var segmentProgressOfTarget = Math.floor((subsegmentProgressOfTarget + 1) / 2);
        return segmentProgressOfTarget * segment;
    };

    var isValueList = function (v) {
        return Array.isArray(v);
    };
    var isSingleValue = function (v) {
        var typeOfV = typeof v;
        return typeOfV === 'string' || typeOfV === 'number';
    };
    var ValueReaction = /*#__PURE__*/function (_super) {
        __extends(ValueReaction, _super);
        function ValueReaction(props) {
            var _this = _super.call(this, props) || this;
            _this.scheduleVelocityCheck = function () {
                return sync.postRender(_this.velocityCheck);
            };
            _this.velocityCheck = function (_a) {
                var timestamp = _a.timestamp;
                if (timestamp !== _this.lastUpdated) {
                    _this.prev = _this.current;
                }
            };
            _this.prev = _this.current = props.value || 0;
            if (isSingleValue(_this.current)) {
                _this.updateCurrent = function (v) {
                    return _this.current = v;
                };
                _this.getVelocityOfCurrent = function () {
                    return _this.getSingleVelocity(_this.current, _this.prev);
                };
            } else if (isValueList(_this.current)) {
                _this.updateCurrent = function (v) {
                    return _this.current = __spreadArrays(v);
                };
                _this.getVelocityOfCurrent = function () {
                    return _this.getListVelocity();
                };
            } else {
                _this.updateCurrent = function (v) {
                    _this.current = {};
                    for (var key in v) {
                        if (v.hasOwnProperty(key)) {
                            _this.current[key] = v[key];
                        }
                    }
                };
                _this.getVelocityOfCurrent = function () {
                    return _this.getMapVelocity();
                };
            }
            if (props.initialSubscription) _this.subscribe(props.initialSubscription);
            return _this;
        }
        ValueReaction.prototype.create = function (props) {
            return new ValueReaction(props);
        };
        ValueReaction.prototype.get = function () {
            return this.current;
        };
        ValueReaction.prototype.getVelocity = function () {
            return this.getVelocityOfCurrent();
        };
        ValueReaction.prototype.update = function (v) {
            _super.prototype.update.call(this, v);
            this.prev = this.current;
            this.updateCurrent(v);
            var _a = getFrameData(),
                delta = _a.delta,
                timestamp = _a.timestamp;
            this.timeDelta = delta;
            this.lastUpdated = timestamp;
            sync.postRender(this.scheduleVelocityCheck);
        };
        ValueReaction.prototype.subscribe = function (observerCandidate) {
            var sub = _super.prototype.subscribe.call(this, observerCandidate);
            this.subscribers[this.subscribers.length - 1].update(this.current);
            return sub;
        };
        ValueReaction.prototype.getSingleVelocity = function (current, prev) {
            return typeof current === 'number' && typeof prev === 'number' ? velocityPerSecond(current - prev, this.timeDelta) : velocityPerSecond(parseFloat(current) - parseFloat(prev), this.timeDelta) || 0;
        };
        ValueReaction.prototype.getListVelocity = function () {
            var _this = this;
            return this.current.map(function (c, i) {
                return _this.getSingleVelocity(c, _this.prev[i]);
            });
        };
        ValueReaction.prototype.getMapVelocity = function () {
            var velocity = {};
            for (var key in this.current) {
                if (this.current.hasOwnProperty(key)) {
                    velocity[key] = this.getSingleVelocity(this.current[key], this.prev[key]);
                }
            }
            return velocity;
        };
        return ValueReaction;
    }(BaseMulticast);
    var value = function (value, initialSubscription) {
        return new ValueReaction({ value: value, initialSubscription: initialSubscription });
    };

    var multi = function (_a) {
        var getCount = _a.getCount,
            getFirst = _a.getFirst,
            getOutput = _a.getOutput,
            mapApi = _a.mapApi,
            setProp = _a.setProp,
            startActions = _a.startActions;
        return function (actions) {
            return action(function (_a) {
                var update = _a.update,
                    complete = _a.complete,
                    error = _a.error;
                var numActions = getCount(actions);
                var output = getOutput();
                var updateOutput = function () {
                    return update(output);
                };
                var numCompletedActions = 0;
                var subs = startActions(actions, function (a, name) {
                    var hasCompleted = false;
                    return a.start({
                        complete: function () {
                            if (!hasCompleted) {
                                hasCompleted = true;
                                numCompletedActions++;
                                if (numCompletedActions === numActions) sync.update(complete);
                            }
                        },
                        error: error,
                        update: function (v) {
                            setProp(output, name, v);
                            sync.update(updateOutput, false, true);
                        }
                    });
                });
                return Object.keys(getFirst(subs)).reduce(function (api, methodName) {
                    api[methodName] = mapApi(subs, methodName);
                    return api;
                }, {});
            });
        };
    };

    var composite = /*#__PURE__*/multi({
        getOutput: function () {
            return {};
        },
        getCount: function (subs) {
            return Object.keys(subs).length;
        },
        getFirst: function (subs) {
            return subs[Object.keys(subs)[0]];
        },
        mapApi: function (subs, methodName) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return Object.keys(subs).reduce(function (output, propKey) {
                    var _a;
                    if (subs[propKey][methodName]) {
                        args[0] && args[0][propKey] !== undefined ? output[propKey] = subs[propKey][methodName](args[0][propKey]) : output[propKey] = (_a = subs[propKey])[methodName].apply(_a, args);
                    }
                    return output;
                }, {});
            };
        },
        setProp: function (output, name, v) {
            return output[name] = v;
        },
        startActions: function (actions, starter) {
            return Object.keys(actions).reduce(function (subs, key) {
                subs[key] = starter(actions[key], key);
                return subs;
            }, {});
        }
    });

    var parallel = /*#__PURE__*/multi({
        getOutput: function () {
            return [];
        },
        getCount: function (subs) {
            return subs.length;
        },
        getFirst: function (subs) {
            return subs[0];
        },
        mapApi: function (subs, methodName) {
            return function () {
                var args = [];
                for (var _i = 0; _i < arguments.length; _i++) {
                    args[_i] = arguments[_i];
                }
                return subs.map(function (sub, i) {
                    if (sub[methodName]) {
                        return Array.isArray(args[0]) ? sub[methodName](args[0][i]) : sub[methodName].apply(sub, args);
                    }
                });
            };
        },
        setProp: function (output, name, v) {
            return output[name] = v;
        },
        startActions: function (actions, starter) {
            return actions.map(function (action, i) {
                return starter(action, i);
            });
        }
    });
    var parallel$1 = function () {
        var actions = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            actions[_i] = arguments[_i];
        }
        return parallel(actions);
    };

    var createVectorTests = function (typeTests) {
        var testNames = Object.keys(typeTests);
        var isVectorProp = function (prop, key) {
            return prop !== undefined && !typeTests[key](prop);
        };
        var getVectorKeys = function (props) {
            return testNames.reduce(function (vectorKeys, key) {
                if (isVectorProp(props[key], key)) vectorKeys.push(key);
                return vectorKeys;
            }, []);
        };
        var testVectorProps = function (props) {
            return props && testNames.some(function (key) {
                return isVectorProp(props[key], key);
            });
        };
        return { getVectorKeys: getVectorKeys, testVectorProps: testVectorProps };
    };
    var unitTypes = [px, percent, degrees, vh, vw];
    var findUnitType = function (prop) {
        return unitTypes.find(function (type) {
            return type.test(prop);
        });
    };
    var isUnitProp = function (prop) {
        return Boolean(findUnitType(prop));
    };
    var createAction = function (action, props) {
        return action(props);
    };
    var reduceArrayValue = function (i) {
        return function (props, key) {
            props[key] = props[key][i];
            return props;
        };
    };
    var createArrayAction = function (action, props, vectorKeys) {
        var firstVectorKey = vectorKeys[0];
        var actionList = props[firstVectorKey].map(function (v, i) {
            var childActionProps = vectorKeys.reduce(reduceArrayValue(i), __assign({}, props));
            return getActionCreator(v)(action, childActionProps);
        });
        return parallel$1.apply(void 0, actionList);
    };
    var reduceObjectValue = function (key) {
        return function (props, propKey) {
            props[propKey] = props[propKey][key];
            return props;
        };
    };
    var createObjectAction = function (action, props, vectorKeys) {
        var firstVectorKey = vectorKeys[0];
        var actionMap = Object.keys(props[firstVectorKey]).reduce(function (map, key) {
            var childActionProps = vectorKeys.reduce(reduceObjectValue(key), __assign({}, props));
            map[key] = getActionCreator(props[firstVectorKey][key])(action, childActionProps);
            return map;
        }, {});
        return composite(actionMap);
    };
    var createUnitAction = function (action, _a) {
        var from = _a.from,
            to = _a.to,
            props = __rest(_a, ["from", "to"]);
        var unitType = findUnitType(from) || findUnitType(to);
        var transform = unitType.transform,
            parse = unitType.parse;
        return action(__assign(__assign({}, props), { from: typeof from === 'string' ? parse(from) : from, to: typeof to === 'string' ? parse(to) : to })).pipe(transform);
    };
    var createMixerAction = function (mixer) {
        return function (action, _a) {
            var from = _a.from,
                to = _a.to,
                props = __rest(_a, ["from", "to"]);
            return action(__assign(__assign({}, props), { from: 0, to: 1 })).pipe(mixer(from, to));
        };
    };
    var createColorAction = /*#__PURE__*/createMixerAction(mixColor);
    var createComplexAction = /*#__PURE__*/createMixerAction(mixComplex);
    var createVectorAction = function (action, typeTests) {
        var _a = createVectorTests(typeTests),
            testVectorProps = _a.testVectorProps,
            getVectorKeys = _a.getVectorKeys;
        var vectorAction = function (props) {
            var isVector = testVectorProps(props);
            if (!isVector) return action(props);
            var vectorKeys = getVectorKeys(props);
            var testKey = vectorKeys[0];
            var testProp = props[testKey];
            return getActionCreator(testProp)(action, props, vectorKeys);
        };
        return vectorAction;
    };
    var getActionCreator = function (prop) {
        if (typeof prop === 'number') {
            return createAction;
        } else if (Array.isArray(prop)) {
            return createArrayAction;
        } else if (isUnitProp(prop)) {
            return createUnitAction;
        } else if (color.test(prop)) {
            return createColorAction;
        } else if (complex.test(prop)) {
            return createComplexAction;
        } else if (typeof prop === 'object') {
            return createObjectAction;
        } else {
            return createAction;
        }
    };

    var scrubber = function (_a) {
        var _b = _a.from,
            from = _b === void 0 ? 0 : _b,
            _c = _a.to,
            to = _c === void 0 ? 1 : _c,
            _d = _a.ease,
            ease = _d === void 0 ? linear : _d,
            _e = _a.reverseEase,
            reverseEase = _e === void 0 ? false : _e;
        if (reverseEase) {
            ease = createReversedEasing(ease);
        }
        return action(function (_a) {
            var update = _a.update;
            return {
                seek: function (progress) {
                    return update(progress);
                }
            };
        }).pipe(ease, function (v) {
            return mix(from, to, v);
        });
    };
    var vectorScrubber = /*#__PURE__*/createVectorAction(scrubber, {
        ease: function (func) {
            return typeof func === 'function';
        },
        from: number.test,
        to: number.test
    });

    var clampProgress$1 = /*#__PURE__*/clamp$1$1(0, 1);
    var tween = function (props) {
        if (props === void 0) {
            props = {};
        }
        return action(function (_a) {
            var update = _a.update,
                complete = _a.complete;
            var _b = props.duration,
                duration = _b === void 0 ? 300 : _b,
                _c = props.ease,
                ease = _c === void 0 ? easeOut : _c,
                _d = props.flip,
                flip = _d === void 0 ? 0 : _d,
                _e = props.loop,
                loop = _e === void 0 ? 0 : _e,
                _f = props.yoyo,
                yoyo = _f === void 0 ? 0 : _f,
                _g = props.repeatDelay,
                repeatDelay = _g === void 0 ? 0 : _g;
            var _h = props.from,
                from = _h === void 0 ? 0 : _h,
                _j = props.to,
                to = _j === void 0 ? 1 : _j,
                _k = props.elapsed,
                elapsed = _k === void 0 ? 0 : _k,
                _l = props.flipCount,
                flipCount = _l === void 0 ? 0 : _l,
                _m = props.yoyoCount,
                yoyoCount = _m === void 0 ? 0 : _m,
                _o = props.loopCount,
                loopCount = _o === void 0 ? 0 : _o;
            var playhead = vectorScrubber({ from: from, to: to, ease: ease }).start(update);
            var currentProgress = 0;
            var process;
            var isActive = false;
            var reverseAnimation = function (reverseEase) {
                var _a;
                if (reverseEase === void 0) {
                    reverseEase = false;
                }
                _a = [to, from], from = _a[0], to = _a[1];
                playhead = vectorScrubber({ from: from, to: to, ease: ease, reverseEase: reverseEase }).start(update);
            };
            var isTweenComplete = function () {
                var isComplete = isActive && elapsed > duration + repeatDelay;
                if (!isComplete) return false;
                if (isComplete && !loop && !flip && !yoyo) return true;
                elapsed = duration - (elapsed - repeatDelay);
                if (loop && loopCount < loop) {
                    loopCount++;
                    return false;
                } else if (flip && flipCount < flip) {
                    flipCount++;
                    reverseAnimation();
                    return false;
                } else if (yoyo && yoyoCount < yoyo) {
                    yoyoCount++;
                    reverseAnimation(yoyoCount % 2 !== 0);
                    return false;
                }
                return true;
            };
            var updateTween = function () {
                currentProgress = clampProgress$1(progress(0, duration, elapsed));
                playhead.seek(currentProgress);
            };
            var startTimer = function () {
                isActive = true;
                process = sync.update(function (_a) {
                    var delta = _a.delta;
                    elapsed += delta;
                    updateTween();
                    if (isTweenComplete()) {
                        cancelSync.update(process);
                        complete && sync.update(complete, false, true);
                    }
                }, true);
            };
            var stopTimer = function () {
                isActive = false;
                if (process) cancelSync.update(process);
            };
            startTimer();
            return {
                isActive: function () {
                    return isActive;
                },
                getElapsed: function () {
                    return clamp$1$1(0, duration, elapsed);
                },
                getProgress: function () {
                    return currentProgress;
                },
                stop: function () {
                    stopTimer();
                },
                pause: function () {
                    stopTimer();
                    return this;
                },
                resume: function () {
                    if (!isActive) startTimer();
                    return this;
                },
                seek: function (newProgress) {
                    elapsed = mix(0, duration, newProgress);
                    sync.update(updateTween, false, true);
                    return this;
                },
                reverse: function () {
                    reverseAnimation();
                    return this;
                }
            };
        });
    };

    var clampProgress$1$1 = /*#__PURE__*/clamp$1$1(0, 1);
    var defaultEasings = function (values, easing) {
        return values.map(function () {
            return easing || easeOut;
        }).splice(0, values.length - 1);
    };
    var defaultTimings = function (values) {
        var numValues = values.length;
        return values.map(function (value, i) {
            return i !== 0 ? i / (numValues - 1) : 0;
        });
    };
    var interpolateScrubbers = function (input, scrubbers, update) {
        var rangeLength = input.length;
        var finalInputIndex = rangeLength - 1;
        var finalScrubberIndex = finalInputIndex - 1;
        var subs = scrubbers.map(function (scrub) {
            return scrub.start(update);
        });
        return function (v) {
            if (v <= input[0]) {
                subs[0].seek(0);
            }
            if (v >= input[finalInputIndex]) {
                subs[finalScrubberIndex].seek(1);
            }
            var i = 1;
            for (; i < rangeLength; i++) {
                if (input[i] > v || i === finalInputIndex) break;
            }
            var progressInRange = progress(input[i - 1], input[i], v);
            subs[i - 1].seek(clampProgress$1$1(progressInRange));
        };
    };
    var keyframes = function (_a) {
        var easings = _a.easings,
            _b = _a.ease,
            ease = _b === void 0 ? linear : _b,
            times = _a.times,
            values = _a.values,
            tweenProps = __rest(_a, ["easings", "ease", "times", "values"]);
        easings = Array.isArray(easings) ? easings : defaultEasings(values, easings);
        times = times || defaultTimings(values);
        var scrubbers = easings.map(function (easing, i) {
            return vectorScrubber({
                from: values[i],
                to: values[i + 1],
                ease: easing
            });
        });
        return tween(__assign(__assign({}, tweenProps), { ease: ease })).applyMiddleware(function (update) {
            return interpolateScrubbers(times, scrubbers, update);
        });
    };

    var listen$1 = function (element, events, options) {
        return action(function (_a) {
            var update = _a.update;
            var eventNames = events.split(' ').map(function (eventName) {
                element.addEventListener(eventName, update, options);
                return eventName;
            });
            return {
                stop: function () {
                    return eventNames.forEach(function (eventName) {
                        return element.removeEventListener(eventName, update, options);
                    });
                }
            };
        });
    };

    var defaultPointerPos = function () {
        return {
            clientX: 0,
            clientY: 0,
            pageX: 0,
            pageY: 0,
            x: 0,
            y: 0
        };
    };
    var eventToPoint = function (e, point) {
        if (point === void 0) {
            point = defaultPointerPos();
        }
        point.clientX = point.x = e.clientX;
        point.clientY = point.y = e.clientY;
        point.pageX = e.pageX;
        point.pageY = e.pageY;
        return point;
    };

    var points = [/*#__PURE__*/defaultPointerPos()];
    var isTouchDevice = false;
    if (typeof document !== 'undefined') {
        var updatePointsLocation = function (_a) {
            var touches = _a.touches;
            isTouchDevice = true;
            var numTouches = touches.length;
            points.length = 0;
            for (var i = 0; i < numTouches; i++) {
                var thisTouch = touches[i];
                points.push(eventToPoint(thisTouch));
            }
        };
        listen$1(document, 'touchstart touchmove', {
            passive: true,
            capture: true
        }).start(updatePointsLocation);
    }
    var multitouch = function (_a) {
        var _b = _a === void 0 ? {} : _a,
            _c = _b.preventDefault,
            preventDefault = _c === void 0 ? true : _c,
            _d = _b.scale,
            scale = _d === void 0 ? 1.0 : _d,
            _e = _b.rotate,
            rotate = _e === void 0 ? 0.0 : _e;
        return action(function (_a) {
            var update = _a.update;
            var output = {
                touches: points,
                scale: scale,
                rotate: rotate
            };
            var initialDistance = 0.0;
            var initialRotation = 0.0;
            var isGesture = points.length > 1;
            if (isGesture) {
                var firstTouch = points[0],
                    secondTouch = points[1];
                initialDistance = distance(firstTouch, secondTouch);
                initialRotation = angle(firstTouch, secondTouch);
            }
            var updatePoint = function () {
                if (isGesture) {
                    var firstTouch = points[0],
                        secondTouch = points[1];
                    var newDistance = distance(firstTouch, secondTouch);
                    var newRotation = angle(firstTouch, secondTouch);
                    output.scale = scale * (newDistance / initialDistance);
                    output.rotate = rotate + (newRotation - initialRotation);
                }
                update(output);
            };
            var onMove = function (e) {
                if (preventDefault || e.touches.length > 1) e.preventDefault();
                sync.update(updatePoint);
            };
            var updateOnMove = listen$1(document, 'touchmove', {
                passive: !preventDefault
            }).start(onMove);
            if (isTouchDevice) sync.update(updatePoint);
            return {
                stop: function () {
                    cancelSync.update(updatePoint);
                    updateOnMove.stop();
                }
            };
        });
    };
    var getIsTouchDevice = function () {
        return isTouchDevice;
    };

    var point = /*#__PURE__*/defaultPointerPos();
    var isMouseDevice = false;
    if (typeof document !== 'undefined') {
        var updatePointLocation = function (e) {
            isMouseDevice = true;
            eventToPoint(e, point);
        };
        listen$1(document, 'mousedown mousemove', true).start(updatePointLocation);
    }
    var mouse = function (_a) {
        var _b = (_a === void 0 ? {} : _a).preventDefault,
            preventDefault = _b === void 0 ? true : _b;
        return action(function (_a) {
            var update = _a.update;
            var updatePoint = function () {
                return update(point);
            };
            var onMove = function (e) {
                if (preventDefault) e.preventDefault();
                sync.update(updatePoint);
            };
            var updateOnMove = listen$1(document, 'mousemove').start(onMove);
            if (isMouseDevice) sync.update(updatePoint);
            return {
                stop: function () {
                    cancelSync.update(updatePoint);
                    updateOnMove.stop();
                }
            };
        });
    };

    var getFirstTouch = function (_a) {
        var firstTouch = _a[0];
        return firstTouch;
    };
    var pointer = function (props) {
        if (props === void 0) {
            props = {};
        }
        return getIsTouchDevice() ? multitouch(props).pipe(function (_a) {
            var touches = _a.touches;
            return touches;
        }, getFirstTouch) : mouse(props);
    };
    var index$1 = function (_a) {
        if (_a === void 0) {
            _a = {};
        }
        var x = _a.x,
            y = _a.y,
            props = __rest(_a, ["x", "y"]);
        if (x !== undefined || y !== undefined) {
            var applyXOffset_1 = applyOffset(x || 0);
            var applyYOffset_1 = applyOffset(y || 0);
            var delta_1 = { x: 0, y: 0 };
            return pointer(props).pipe(function (point) {
                delta_1.x = applyXOffset_1(point.x);
                delta_1.y = applyYOffset_1(point.y);
                return delta_1;
            });
        } else {
            return pointer(props);
        }
    };

    var appendUnit = function (unit) {
        return function (v) {
            return "" + v + unit;
        };
    };
    var steps$1 = function (st, min, max) {
        if (min === void 0) {
            min = 0;
        }
        if (max === void 0) {
            max = 1;
        }
        return function (v) {
            var current = progress(min, max, v);
            return mix(min, max, stepProgress(st, current));
        };
    };
    var transformMap = function (childTransformers) {
        return function (v) {
            var output = __assign({}, v);
            for (var key in childTransformers) {
                if (childTransformers.hasOwnProperty(key)) {
                    var childTransformer = childTransformers[key];
                    output[key] = childTransformer(v[key]);
                }
            }
            return output;
        };
    };

    var transformers = /*#__PURE__*/Object.freeze({
        __proto__: null,
        applyOffset: applyOffset,
        clamp: clamp$1$1,
        conditional: conditional,
        interpolate: interpolate,
        blendArray: mixArray,
        blendColor: mixColor,
        pipe: pipe,
        smooth: smooth,
        snap: snap,
        generateStaticSpring: springForce,
        nonlinearSpring: springForceExpo,
        linearSpring: springForceLinear,
        wrap: wrap$1,
        appendUnit: appendUnit,
        steps: steps$1,
        transformMap: transformMap
    });

    /* EventInfoBox.svelte generated by Svelte v3.20.1 */

    const file = "EventInfoBox.svelte";

    function create_fragment(ctx) {
    	let div7;
    	let div3;
    	let div0;
    	let span0;
    	let t0_value = /*eventDetails*/ ctx[0].date + "";
    	let t0;
    	let t1;
    	let div1;
    	let span1;
    	let t2_value = /*eventDetails*/ ctx[0].title + "";
    	let t2;
    	let t3;
    	let div2;
    	let img;
    	let img_src_value;
    	let img_alt_value;
    	let t4;
    	let div6;
    	let div4;
    	let span2;
    	let t5_value = /*eventDetails*/ ctx[0].text + "";
    	let t5;
    	let t6;
    	let div5;
    	let a;
    	let t7;
    	let a_href_value;

    	const block = {
    		c: function create() {
    			div7 = element("div");
    			div3 = element("div");
    			div0 = element("div");
    			span0 = element("span");
    			t0 = text(t0_value);
    			t1 = space();
    			div1 = element("div");
    			span1 = element("span");
    			t2 = text(t2_value);
    			t3 = space();
    			div2 = element("div");
    			img = element("img");
    			t4 = space();
    			div6 = element("div");
    			div4 = element("div");
    			span2 = element("span");
    			t5 = text(t5_value);
    			t6 = space();
    			div5 = element("div");
    			a = element("a");
    			t7 = text("Source");
    			add_location(span0, file, 9, 12, 163);
    			attr_dev(div0, "class", "policy-event-date svelte-fbqbnd");
    			add_location(div0, file, 8, 8, 119);
    			add_location(span1, file, 12, 12, 265);
    			attr_dev(div1, "class", "policy-event-title svelte-fbqbnd");
    			add_location(div1, file, 11, 9, 220);
    			if (img.src !== (img_src_value = /*eventDetails*/ ctx[0].imgSource)) attr_dev(img, "src", img_src_value);
    			attr_dev(img, "alt", img_alt_value = "Ban on Raw Coal");
    			attr_dev(img, "class", "svelte-fbqbnd");
    			add_location(img, file, 15, 12, 367);
    			attr_dev(div2, "class", "policy-event-photo svelte-fbqbnd");
    			add_location(div2, file, 14, 8, 322);
    			attr_dev(div3, "class", "policy-info-top svelte-fbqbnd");
    			add_location(div3, file, 7, 4, 81);
    			add_location(span2, file, 20, 12, 541);
    			attr_dev(div4, "class", "policy-event-text svelte-fbqbnd");
    			add_location(div4, file, 19, 8, 497);
    			attr_dev(a, "href", a_href_value = /*eventDetails*/ ctx[0].source);
    			attr_dev(a, "target", "_blank");
    			attr_dev(a, "class", "svelte-fbqbnd");
    			add_location(a, file, 23, 12, 643);
    			attr_dev(div5, "class", "policy-event-source svelte-fbqbnd");
    			add_location(div5, file, 22, 8, 597);
    			attr_dev(div6, "class", "policy-info-bottom svelte-fbqbnd");
    			add_location(div6, file, 18, 4, 456);
    			attr_dev(div7, "class", "policy-info-box svelte-fbqbnd");
    			add_location(div7, file, 6, 0, 47);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div7, anchor);
    			append_dev(div7, div3);
    			append_dev(div3, div0);
    			append_dev(div0, span0);
    			append_dev(span0, t0);
    			append_dev(div3, t1);
    			append_dev(div3, div1);
    			append_dev(div1, span1);
    			append_dev(span1, t2);
    			append_dev(div3, t3);
    			append_dev(div3, div2);
    			append_dev(div2, img);
    			append_dev(div7, t4);
    			append_dev(div7, div6);
    			append_dev(div6, div4);
    			append_dev(div4, span2);
    			append_dev(span2, t5);
    			append_dev(div6, t6);
    			append_dev(div6, div5);
    			append_dev(div5, a);
    			append_dev(a, t7);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*eventDetails*/ 1 && t0_value !== (t0_value = /*eventDetails*/ ctx[0].date + "")) set_data_dev(t0, t0_value);
    			if (dirty & /*eventDetails*/ 1 && t2_value !== (t2_value = /*eventDetails*/ ctx[0].title + "")) set_data_dev(t2, t2_value);

    			if (dirty & /*eventDetails*/ 1 && img.src !== (img_src_value = /*eventDetails*/ ctx[0].imgSource)) {
    				attr_dev(img, "src", img_src_value);
    			}

    			if (dirty & /*eventDetails*/ 1 && t5_value !== (t5_value = /*eventDetails*/ ctx[0].text + "")) set_data_dev(t5, t5_value);

    			if (dirty & /*eventDetails*/ 1 && a_href_value !== (a_href_value = /*eventDetails*/ ctx[0].source)) {
    				attr_dev(a, "href", a_href_value);
    			}
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div7);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    function instance($$self, $$props, $$invalidate) {
    	let { eventDetails } = $$props;
    	const writable_props = ["eventDetails"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<EventInfoBox> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("EventInfoBox", $$slots, []);

    	$$self.$set = $$props => {
    		if ("eventDetails" in $$props) $$invalidate(0, eventDetails = $$props.eventDetails);
    	};

    	$$self.$capture_state = () => ({ eventDetails });

    	$$self.$inject_state = $$props => {
    		if ("eventDetails" in $$props) $$invalidate(0, eventDetails = $$props.eventDetails);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [eventDetails];
    }

    class EventInfoBox extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance, create_fragment, safe_not_equal, { eventDetails: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "EventInfoBox",
    			options,
    			id: create_fragment.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*eventDetails*/ ctx[0] === undefined && !("eventDetails" in props)) {
    			console.warn("<EventInfoBox> was created without expected prop 'eventDetails'");
    		}
    	}

    	get eventDetails() {
    		throw new Error("<EventInfoBox>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set eventDetails(value) {
    		throw new Error("<EventInfoBox>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* PolicyEvent.svelte generated by Svelte v3.20.1 */
    const file$1 = "PolicyEvent.svelte";

    function create_fragment$1(ctx) {
    	let div4;
    	let div2;
    	let div1;
    	let div0;
    	let div0_class_value;
    	let div1_class_value;
    	let div2_class_value;
    	let t;
    	let div3;
    	let div3_class_value;
    	let current;

    	const eventinfobox = new EventInfoBox({
    			props: { eventDetails: /*eventDetails*/ ctx[0] },
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			div2 = element("div");
    			div1 = element("div");
    			div0 = element("div");
    			t = space();
    			div3 = element("div");
    			create_component(eventinfobox.$$.fragment);
    			attr_dev(div0, "class", div0_class_value = "" + (null_to_empty("policy-dot policy-dot" + /*position*/ ctx[1]) + " svelte-1ux17o6"));
    			add_location(div0, file$1, 124, 12, 3837);
    			attr_dev(div1, "class", div1_class_value = "" + (null_to_empty("policy-dot-hit-area policy-dot-hit-area" + /*position*/ ctx[1]) + " svelte-1ux17o6"));
    			add_location(div1, file$1, 123, 8, 3760);
    			attr_dev(div2, "class", div2_class_value = "" + (null_to_empty("policy-dot-container policy-dot-container" + /*position*/ ctx[1]) + " svelte-1ux17o6"));
    			add_location(div2, file$1, 122, 4, 3685);
    			attr_dev(div3, "class", div3_class_value = "" + (null_to_empty("policy-info-container policy-info-container" + /*position*/ ctx[1]) + " svelte-1ux17o6"));
    			add_location(div3, file$1, 127, 4, 3920);
    			attr_dev(div4, "class", "policy-event");
    			add_location(div4, file$1, 121, 0, 3654);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, div2);
    			append_dev(div2, div1);
    			append_dev(div1, div0);
    			append_dev(div4, t);
    			append_dev(div4, div3);
    			mount_component(eventinfobox, div3, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			if (!current || dirty & /*position*/ 2 && div0_class_value !== (div0_class_value = "" + (null_to_empty("policy-dot policy-dot" + /*position*/ ctx[1]) + " svelte-1ux17o6"))) {
    				attr_dev(div0, "class", div0_class_value);
    			}

    			if (!current || dirty & /*position*/ 2 && div1_class_value !== (div1_class_value = "" + (null_to_empty("policy-dot-hit-area policy-dot-hit-area" + /*position*/ ctx[1]) + " svelte-1ux17o6"))) {
    				attr_dev(div1, "class", div1_class_value);
    			}

    			if (!current || dirty & /*position*/ 2 && div2_class_value !== (div2_class_value = "" + (null_to_empty("policy-dot-container policy-dot-container" + /*position*/ ctx[1]) + " svelte-1ux17o6"))) {
    				attr_dev(div2, "class", div2_class_value);
    			}

    			const eventinfobox_changes = {};
    			if (dirty & /*eventDetails*/ 1) eventinfobox_changes.eventDetails = /*eventDetails*/ ctx[0];
    			eventinfobox.$set(eventinfobox_changes);

    			if (!current || dirty & /*position*/ 2 && div3_class_value !== (div3_class_value = "" + (null_to_empty("policy-info-container policy-info-container" + /*position*/ ctx[1]) + " svelte-1ux17o6"))) {
    				attr_dev(div3, "class", div3_class_value);
    			}
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(eventinfobox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(eventinfobox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(eventinfobox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$1.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const BUFFER = 10;
    const expandDuration = 400;
    const contractDuration = 600;

    function instance$1($$self, $$props, $$invalidate) {
    	let { currentFrame } = $$props;
    	let { position } = $$props;
    	let { eventDetails } = $$props;

    	// TODO: Remove
    	eventDetails = {
    		date: "June 20th 2019",
    		title: "Government Bans Raw Coal",
    		text: "The government bans the burning of raw coal within the city limits. The ban does not apply to power plants.",
    		source: "https://breathemongolia.org/",
    		imgSource: "./banRawCoal.jpg"
    	};

    	let policyDotStyler;
    	let policyInfoContainerStyler;

    	const policyInfoContractedState = {
    		scale: 0,
    		translateX: "-50%",
    		translateY: "-25%"
    	};

    	const policyInfoExpandedState = {
    		scale: 1,
    		translateX: "-25%",
    		translateY: "30%"
    	};

    	let policyDotExpandKeyFrames = keyframes({
    		values: [{ scale: 1 }, { scale: 2 }],
    		times: [0, 1],
    		duration: expandDuration,
    		easings: [easeOut]
    	});

    	let policyInfoExpandKeyFrames = keyframes({
    		values: [policyInfoContractedState, policyInfoExpandedState],
    		times: [0, 1],
    		duration: expandDuration,
    		easings: [easeOut]
    	});

    	let policyDotContractKeyFrames = keyframes({
    		values: [{ scale: 2 }, { scale: 1 }],
    		times: [0, 1],
    		duration: contractDuration,
    		easings: [easeIn]
    	});

    	let policyInfoContractKeyFrames = keyframes({
    		values: [policyInfoExpandedState, policyInfoContractedState],
    		times: [0, 1],
    		duration: contractDuration,
    		easings: [easeIn]
    	});

    	// To highlight the whole event, expand the dot and show the policy info box
    	const highlightEvent = () => {
    		policyDotExpandKeyFrames.start(style => {
    			policyDotStyler.set(style);
    		});

    		policyInfoExpandKeyFrames.start(style => {
    			policyInfoContainerStyler.set(style);
    		});
    	};

    	// To diminish the whole event, contract the dot and hide the policy info box
    	const diminishEvent = () => {
    		policyDotContractKeyFrames.start(style => {
    			policyDotStyler.set(style);
    		});

    		policyInfoContractKeyFrames.start(style => {
    			policyInfoContainerStyler.set(style);
    		});
    	};

    	onMount(async () => {
    		// Create a styler to style the policy dot - to control the dot's animation
    		const policyDot = document.querySelector(".policy-dot" + position);

    		policyDotStyler = index(policyDot);

    		// Create a styler to style the dot container - to position the policy dot on the timeline
    		const policyDotContainer = document.querySelector(".policy-dot-container" + position);

    		let policyDotContainerStyler = index(policyDotContainer);
    		policyDotContainerStyler.set("left", position);
    		const policyInfoContainer = document.querySelector(".policy-info-container" + position);
    		policyInfoContainerStyler = index(policyInfoContainer);
    		policyInfoContainerStyler.set("left", position);
    	});

    	const writable_props = ["currentFrame", "position", "eventDetails"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<PolicyEvent> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("PolicyEvent", $$slots, []);

    	$$self.$set = $$props => {
    		if ("currentFrame" in $$props) $$invalidate(2, currentFrame = $$props.currentFrame);
    		if ("position" in $$props) $$invalidate(1, position = $$props.position);
    		if ("eventDetails" in $$props) $$invalidate(0, eventDetails = $$props.eventDetails);
    	};

    	$$self.$capture_state = () => ({
    		styler: index,
    		value,
    		pointer: index$1,
    		listen: listen$1,
    		transform: transformers,
    		easing,
    		keyframes,
    		onMount,
    		EventInfoBox,
    		currentFrame,
    		position,
    		eventDetails,
    		BUFFER,
    		policyDotStyler,
    		policyInfoContainerStyler,
    		policyInfoContractedState,
    		policyInfoExpandedState,
    		expandDuration,
    		contractDuration,
    		policyDotExpandKeyFrames,
    		policyInfoExpandKeyFrames,
    		policyDotContractKeyFrames,
    		policyInfoContractKeyFrames,
    		highlightEvent,
    		diminishEvent
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentFrame" in $$props) $$invalidate(2, currentFrame = $$props.currentFrame);
    		if ("position" in $$props) $$invalidate(1, position = $$props.position);
    		if ("eventDetails" in $$props) $$invalidate(0, eventDetails = $$props.eventDetails);
    		if ("policyDotStyler" in $$props) policyDotStyler = $$props.policyDotStyler;
    		if ("policyInfoContainerStyler" in $$props) policyInfoContainerStyler = $$props.policyInfoContainerStyler;
    		if ("policyDotExpandKeyFrames" in $$props) policyDotExpandKeyFrames = $$props.policyDotExpandKeyFrames;
    		if ("policyInfoExpandKeyFrames" in $$props) policyInfoExpandKeyFrames = $$props.policyInfoExpandKeyFrames;
    		if ("policyDotContractKeyFrames" in $$props) policyDotContractKeyFrames = $$props.policyDotContractKeyFrames;
    		if ("policyInfoContractKeyFrames" in $$props) policyInfoContractKeyFrames = $$props.policyInfoContractKeyFrames;
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*currentFrame, position*/ 6) {
    			 {
    				// When the current frame passes certain positions, highlight or reduce event
    				if (currentFrame == position - BUFFER) {
    					highlightEvent();
    				}

    				if (currentFrame == position + BUFFER * 4) {
    					diminishEvent();
    				}
    			}
    		}
    	};

    	return [eventDetails, position, currentFrame];
    }

    class PolicyEvent extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$1, create_fragment$1, safe_not_equal, {
    			currentFrame: 2,
    			position: 1,
    			eventDetails: 0
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "PolicyEvent",
    			options,
    			id: create_fragment$1.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentFrame*/ ctx[2] === undefined && !("currentFrame" in props)) {
    			console.warn("<PolicyEvent> was created without expected prop 'currentFrame'");
    		}

    		if (/*position*/ ctx[1] === undefined && !("position" in props)) {
    			console.warn("<PolicyEvent> was created without expected prop 'position'");
    		}

    		if (/*eventDetails*/ ctx[0] === undefined && !("eventDetails" in props)) {
    			console.warn("<PolicyEvent> was created without expected prop 'eventDetails'");
    		}
    	}

    	get currentFrame() {
    		throw new Error("<PolicyEvent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentFrame(value) {
    		throw new Error("<PolicyEvent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get position() {
    		throw new Error("<PolicyEvent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set position(value) {
    		throw new Error("<PolicyEvent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get eventDetails() {
    		throw new Error("<PolicyEvent>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set eventDetails(value) {
    		throw new Error("<PolicyEvent>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* Scrubber.svelte generated by Svelte v3.20.1 */
    const file$2 = "Scrubber.svelte";

    function create_fragment$2(ctx) {
    	let div6;
    	let div0;
    	let button0;
    	let svg0;
    	let defs0;
    	let style0;
    	let t0;
    	let g1;
    	let g0;
    	let path0;
    	let t1;
    	let button1;
    	let svg1;
    	let defs1;
    	let style1;
    	let t2;
    	let g3;
    	let g2;
    	let path1;
    	let path2;
    	let t3;
    	let div5;
    	let div1;
    	let t4;
    	let div4;
    	let div3;
    	let div2;
    	let t5;
    	let t6;
    	let t7;
    	let current;
    	let dispose;

    	const policyevent0 = new PolicyEvent({
    			props: {
    				currentFrame: /*currentFrame*/ ctx[0],
    				position: 30
    			},
    			$$inline: true
    		});

    	const policyevent1 = new PolicyEvent({
    			props: {
    				currentFrame: /*currentFrame*/ ctx[0],
    				position: 130
    			},
    			$$inline: true
    		});

    	const policyevent2 = new PolicyEvent({
    			props: {
    				currentFrame: /*currentFrame*/ ctx[0],
    				position: 310
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div6 = element("div");
    			div0 = element("div");
    			button0 = element("button");
    			svg0 = svg_element("svg");
    			defs0 = svg_element("defs");
    			style0 = svg_element("style");
    			t0 = text(".cls-play-1 {\n                        stroke: #000;\n                        fill: #000;\n                        stroke-miterlimit: 10;\n                    }\n                    ");
    			g1 = svg_element("g");
    			g0 = svg_element("g");
    			path0 = svg_element("path");
    			t1 = space();
    			button1 = element("button");
    			svg1 = svg_element("svg");
    			defs1 = svg_element("defs");
    			style1 = svg_element("style");
    			t2 = text(".cls-pause-1 {\n                        stroke: #000;\n                        stroke-miterlimit: 10;\n                    }\n                    ");
    			g3 = svg_element("g");
    			g2 = svg_element("g");
    			path1 = svg_element("path");
    			path2 = svg_element("path");
    			t3 = space();
    			div5 = element("div");
    			div1 = element("div");
    			t4 = space();
    			div4 = element("div");
    			div3 = element("div");
    			div2 = element("div");
    			t5 = space();
    			create_component(policyevent0.$$.fragment);
    			t6 = space();
    			create_component(policyevent1.$$.fragment);
    			t7 = space();
    			create_component(policyevent2.$$.fragment);
    			add_location(style0, file$2, 65, 20, 1927);
    			add_location(defs0, file$2, 64, 16, 1900);
    			attr_dev(path0, "class", "cls-play-1");
    			attr_dev(path0, "d", "M106.78,74.45,19.36,124.92A12.57,12.57,0,0,1,.5,114V13.09A12.57,12.57,0,0,1,19.36,2.2l87.42,50.48a12.57,12.57,0,0,1,0,21.77Z");
    			attr_dev(path0, "transform", "translate(0 -0.01)");
    			add_location(path0, file$2, 75, 20, 2299);
    			attr_dev(g0, "id", "Layer_1-2");
    			attr_dev(g0, "data-name", "Layer 1-2");
    			add_location(g0, file$2, 74, 20, 2238);
    			attr_dev(g1, "id", "Layer_2");
    			attr_dev(g1, "data-name", "Layer 2");
    			add_location(g1, file$2, 73, 16, 2181);
    			attr_dev(svg0, "id", "Layer_1");
    			attr_dev(svg0, "data-name", "Layer 1");
    			attr_dev(svg0, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg0, "viewBox", "0 0 113.57 127.1");
    			attr_dev(svg0, "class", "svelte-1h8y2xq");
    			add_location(svg0, file$2, 63, 12, 1783);
    			attr_dev(button0, "class", "start-button control-button svelte-1h8y2xq");
    			add_location(button0, file$2, 62, 8, 1694);
    			add_location(style1, file$2, 84, 20, 2805);
    			add_location(defs1, file$2, 83, 16, 2778);
    			attr_dev(path1, "class", "cls-pause-1");
    			attr_dev(path1, "d", "M10.5.5h0a10,10,0,0,1,10,10v114a10,10,0,0,1-10,10h0a10,10,0,0,1-10-10V10.5A10,10,0,0,1,10.5.5Z");
    			add_location(path1, file$2, 93, 20, 3142);
    			attr_dev(path2, "class", "cls-pause-1");
    			attr_dev(path2, "d", "M60.5.5h0a10,10,0,0,1,10,10v114a10,10,0,0,1-10,10h0a10,10,0,0,1-10-10V10.5A10,10,0,0,1,60.5.5Z");
    			add_location(path2, file$2, 94, 20, 3289);
    			attr_dev(g2, "id", "Layer_1-2");
    			attr_dev(g2, "data-name", "Layer 1-2");
    			add_location(g2, file$2, 92, 20, 3081);
    			attr_dev(g3, "id", "Layer_2");
    			attr_dev(g3, "data-name", "Layer 2");
    			add_location(g3, file$2, 91, 16, 3024);
    			attr_dev(svg1, "id", "Layer_1");
    			attr_dev(svg1, "data-name", "Layer 1");
    			attr_dev(svg1, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg1, "viewBox", "0 0 71 135");
    			attr_dev(svg1, "class", "svelte-1h8y2xq");
    			add_location(svg1, file$2, 82, 12, 2667);
    			attr_dev(button1, "class", "pause-button control-button svelte-1h8y2xq");
    			add_location(button1, file$2, 81, 8, 2578);
    			attr_dev(div0, "class", "scrubber-controls svelte-1h8y2xq");
    			add_location(div0, file$2, 61, 4, 1654);
    			attr_dev(div1, "class", "range svelte-1h8y2xq");
    			add_location(div1, file$2, 102, 8, 3544);
    			attr_dev(div2, "class", "handle svelte-1h8y2xq");
    			add_location(div2, file$2, 106, 16, 3668);
    			attr_dev(div3, "class", "handle-hit-area svelte-1h8y2xq");
    			add_location(div3, file$2, 105, 12, 3622);
    			attr_dev(div4, "class", "handle-container svelte-1h8y2xq");
    			add_location(div4, file$2, 104, 8, 3579);
    			attr_dev(div5, "class", "slider svelte-1h8y2xq");
    			add_location(div5, file$2, 101, 4, 3515);
    			attr_dev(div6, "class", "scrubber svelte-1h8y2xq");
    			add_location(div6, file$2, 60, 0, 1627);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor, remount) {
    			insert_dev(target, div6, anchor);
    			append_dev(div6, div0);
    			append_dev(div0, button0);
    			append_dev(button0, svg0);
    			append_dev(svg0, defs0);
    			append_dev(defs0, style0);
    			append_dev(style0, t0);
    			append_dev(svg0, g1);
    			append_dev(g1, g0);
    			append_dev(g0, path0);
    			append_dev(div0, t1);
    			append_dev(div0, button1);
    			append_dev(button1, svg1);
    			append_dev(svg1, defs1);
    			append_dev(defs1, style1);
    			append_dev(style1, t2);
    			append_dev(svg1, g3);
    			append_dev(g3, g2);
    			append_dev(g2, path1);
    			append_dev(g2, path2);
    			append_dev(div6, t3);
    			append_dev(div6, div5);
    			append_dev(div5, div1);
    			append_dev(div5, t4);
    			append_dev(div5, div4);
    			append_dev(div4, div3);
    			append_dev(div3, div2);
    			append_dev(div5, t5);
    			mount_component(policyevent0, div5, null);
    			append_dev(div5, t6);
    			mount_component(policyevent1, div5, null);
    			append_dev(div5, t7);
    			mount_component(policyevent2, div5, null);
    			current = true;
    			if (remount) run_all(dispose);

    			dispose = [
    				listen_dev(button0, "click", /*handleStartAnimation*/ ctx[2], false, false, false),
    				listen_dev(button1, "click", /*handlePauseAnimation*/ ctx[1], false, false, false)
    			];
    		},
    		p: function update(ctx, [dirty]) {
    			const policyevent0_changes = {};
    			if (dirty & /*currentFrame*/ 1) policyevent0_changes.currentFrame = /*currentFrame*/ ctx[0];
    			policyevent0.$set(policyevent0_changes);
    			const policyevent1_changes = {};
    			if (dirty & /*currentFrame*/ 1) policyevent1_changes.currentFrame = /*currentFrame*/ ctx[0];
    			policyevent1.$set(policyevent1_changes);
    			const policyevent2_changes = {};
    			if (dirty & /*currentFrame*/ 1) policyevent2_changes.currentFrame = /*currentFrame*/ ctx[0];
    			policyevent2.$set(policyevent2_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(policyevent0.$$.fragment, local);
    			transition_in(policyevent1.$$.fragment, local);
    			transition_in(policyevent2.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(policyevent0.$$.fragment, local);
    			transition_out(policyevent1.$$.fragment, local);
    			transition_out(policyevent2.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div6);
    			destroy_component(policyevent0);
    			destroy_component(policyevent1);
    			destroy_component(policyevent2);
    			run_all(dispose);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$2.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const maxScrubberWidth = 1000; // width of scrubber in px

    function instance$2($$self, $$props, $$invalidate) {
    	let { currentFrame } = $$props;
    	let { pauseAnimation } = $$props;
    	let { startAnimation } = $$props;
    	let { updateCurrentFrame } = $$props;
    	var isUserRunning = false; // Whether or not the USER has paused the animation
    	let handleStyler;

    	onMount(async () => {
    		const handle = document.querySelector(".handle-hit-area");
    		$$invalidate(7, handleStyler = index(handle));

    		const handleX = value(0, newX => {
    			updateCurrentFrame(newX);
    		});

    		// const range = document.querySelector('.range');
    		const pointerX = x => index$1({ x }).pipe(xy => xy.x, transformers.clamp(0, maxScrubberWidth));

    		const startDrag = () => {
    			pauseAnimation();
    			pointerX(currentFrame).start(handleX);
    		};

    		const stopDrag = () => {
    			handleX.stop();
    			updateCurrentFrame(handleStyler.get("x"));
    			isUserRunning && startAnimation();
    		};

    		listen$1(handle, "mousedown touchstart").start(startDrag);
    		listen$1(document, "mouseup touchend").start(stopDrag);
    	});

    	const handlePauseAnimation = () => {
    		isUserRunning = false;
    		pauseAnimation();
    	};

    	const handleStartAnimation = () => {
    		isUserRunning = true;
    		startAnimation();
    	};

    	const writable_props = ["currentFrame", "pauseAnimation", "startAnimation", "updateCurrentFrame"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Scrubber> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Scrubber", $$slots, []);

    	$$self.$set = $$props => {
    		if ("currentFrame" in $$props) $$invalidate(0, currentFrame = $$props.currentFrame);
    		if ("pauseAnimation" in $$props) $$invalidate(3, pauseAnimation = $$props.pauseAnimation);
    		if ("startAnimation" in $$props) $$invalidate(4, startAnimation = $$props.startAnimation);
    		if ("updateCurrentFrame" in $$props) $$invalidate(5, updateCurrentFrame = $$props.updateCurrentFrame);
    	};

    	$$self.$capture_state = () => ({
    		onMount,
    		styler: index,
    		value,
    		pointer: index$1,
    		listen: listen$1,
    		transform: transformers,
    		easing,
    		keyframes,
    		PolicyEvent,
    		currentFrame,
    		pauseAnimation,
    		startAnimation,
    		updateCurrentFrame,
    		isUserRunning,
    		maxScrubberWidth,
    		handleStyler,
    		handlePauseAnimation,
    		handleStartAnimation
    	});

    	$$self.$inject_state = $$props => {
    		if ("currentFrame" in $$props) $$invalidate(0, currentFrame = $$props.currentFrame);
    		if ("pauseAnimation" in $$props) $$invalidate(3, pauseAnimation = $$props.pauseAnimation);
    		if ("startAnimation" in $$props) $$invalidate(4, startAnimation = $$props.startAnimation);
    		if ("updateCurrentFrame" in $$props) $$invalidate(5, updateCurrentFrame = $$props.updateCurrentFrame);
    		if ("isUserRunning" in $$props) isUserRunning = $$props.isUserRunning;
    		if ("handleStyler" in $$props) $$invalidate(7, handleStyler = $$props.handleStyler);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*handleStyler, currentFrame*/ 129) {
    			 {
    				handleStyler && handleStyler.set("x", currentFrame);
    			}
    		}
    	};

    	return [
    		currentFrame,
    		handlePauseAnimation,
    		handleStartAnimation,
    		pauseAnimation,
    		startAnimation,
    		updateCurrentFrame
    	];
    }

    class Scrubber extends SvelteComponentDev {
    	constructor(options) {
    		super(options);

    		init(this, options, instance$2, create_fragment$2, safe_not_equal, {
    			currentFrame: 0,
    			pauseAnimation: 3,
    			startAnimation: 4,
    			updateCurrentFrame: 5
    		});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Scrubber",
    			options,
    			id: create_fragment$2.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*currentFrame*/ ctx[0] === undefined && !("currentFrame" in props)) {
    			console.warn("<Scrubber> was created without expected prop 'currentFrame'");
    		}

    		if (/*pauseAnimation*/ ctx[3] === undefined && !("pauseAnimation" in props)) {
    			console.warn("<Scrubber> was created without expected prop 'pauseAnimation'");
    		}

    		if (/*startAnimation*/ ctx[4] === undefined && !("startAnimation" in props)) {
    			console.warn("<Scrubber> was created without expected prop 'startAnimation'");
    		}

    		if (/*updateCurrentFrame*/ ctx[5] === undefined && !("updateCurrentFrame" in props)) {
    			console.warn("<Scrubber> was created without expected prop 'updateCurrentFrame'");
    		}
    	}

    	get currentFrame() {
    		throw new Error("<Scrubber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set currentFrame(value) {
    		throw new Error("<Scrubber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get pauseAnimation() {
    		throw new Error("<Scrubber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set pauseAnimation(value) {
    		throw new Error("<Scrubber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get startAnimation() {
    		throw new Error("<Scrubber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set startAnimation(value) {
    		throw new Error("<Scrubber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	get updateCurrentFrame() {
    		throw new Error("<Scrubber>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set updateCurrentFrame(value) {
    		throw new Error("<Scrubber>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    function ascending(a, b) {
      return a < b ? -1 : a > b ? 1 : a >= b ? 0 : NaN;
    }

    function bisector(compare) {
      if (compare.length === 1) compare = ascendingComparator(compare);
      return {
        left: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) < 0) lo = mid + 1;
            else hi = mid;
          }
          return lo;
        },
        right: function(a, x, lo, hi) {
          if (lo == null) lo = 0;
          if (hi == null) hi = a.length;
          while (lo < hi) {
            var mid = lo + hi >>> 1;
            if (compare(a[mid], x) > 0) hi = mid;
            else lo = mid + 1;
          }
          return lo;
        }
      };
    }

    function ascendingComparator(f) {
      return function(d, x) {
        return ascending(f(d), x);
      };
    }

    var ascendingBisect = bisector(ascending);
    var bisectRight = ascendingBisect.right;

    var e10 = Math.sqrt(50),
        e5 = Math.sqrt(10),
        e2 = Math.sqrt(2);

    function ticks(start, stop, count) {
      var reverse,
          i = -1,
          n,
          ticks,
          step;

      stop = +stop, start = +start, count = +count;
      if (start === stop && count > 0) return [start];
      if (reverse = stop < start) n = start, start = stop, stop = n;
      if ((step = tickIncrement(start, stop, count)) === 0 || !isFinite(step)) return [];

      if (step > 0) {
        start = Math.ceil(start / step);
        stop = Math.floor(stop / step);
        ticks = new Array(n = Math.ceil(stop - start + 1));
        while (++i < n) ticks[i] = (start + i) * step;
      } else {
        start = Math.floor(start * step);
        stop = Math.ceil(stop * step);
        ticks = new Array(n = Math.ceil(start - stop + 1));
        while (++i < n) ticks[i] = (start - i) / step;
      }

      if (reverse) ticks.reverse();

      return ticks;
    }

    function tickIncrement(start, stop, count) {
      var step = (stop - start) / Math.max(0, count),
          power = Math.floor(Math.log(step) / Math.LN10),
          error = step / Math.pow(10, power);
      return power >= 0
          ? (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1) * Math.pow(10, power)
          : -Math.pow(10, -power) / (error >= e10 ? 10 : error >= e5 ? 5 : error >= e2 ? 2 : 1);
    }

    function tickStep(start, stop, count) {
      var step0 = Math.abs(stop - start) / Math.max(0, count),
          step1 = Math.pow(10, Math.floor(Math.log(step0) / Math.LN10)),
          error = step0 / step1;
      if (error >= e10) step1 *= 10;
      else if (error >= e5) step1 *= 5;
      else if (error >= e2) step1 *= 2;
      return stop < start ? -step1 : step1;
    }

    function initRange(domain, range) {
      switch (arguments.length) {
        case 0: break;
        case 1: this.range(domain); break;
        default: this.range(range).domain(domain); break;
      }
      return this;
    }

    function define(constructor, factory, prototype) {
      constructor.prototype = factory.prototype = prototype;
      prototype.constructor = constructor;
    }

    function extend(parent, definition) {
      var prototype = Object.create(parent.prototype);
      for (var key in definition) prototype[key] = definition[key];
      return prototype;
    }

    function Color() {}

    var darker = 0.7;
    var brighter = 1 / darker;

    var reI = "\\s*([+-]?\\d+)\\s*",
        reN = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)\\s*",
        reP = "\\s*([+-]?\\d*\\.?\\d+(?:[eE][+-]?\\d+)?)%\\s*",
        reHex = /^#([0-9a-f]{3,8})$/,
        reRgbInteger = new RegExp("^rgb\\(" + [reI, reI, reI] + "\\)$"),
        reRgbPercent = new RegExp("^rgb\\(" + [reP, reP, reP] + "\\)$"),
        reRgbaInteger = new RegExp("^rgba\\(" + [reI, reI, reI, reN] + "\\)$"),
        reRgbaPercent = new RegExp("^rgba\\(" + [reP, reP, reP, reN] + "\\)$"),
        reHslPercent = new RegExp("^hsl\\(" + [reN, reP, reP] + "\\)$"),
        reHslaPercent = new RegExp("^hsla\\(" + [reN, reP, reP, reN] + "\\)$");

    var named = {
      aliceblue: 0xf0f8ff,
      antiquewhite: 0xfaebd7,
      aqua: 0x00ffff,
      aquamarine: 0x7fffd4,
      azure: 0xf0ffff,
      beige: 0xf5f5dc,
      bisque: 0xffe4c4,
      black: 0x000000,
      blanchedalmond: 0xffebcd,
      blue: 0x0000ff,
      blueviolet: 0x8a2be2,
      brown: 0xa52a2a,
      burlywood: 0xdeb887,
      cadetblue: 0x5f9ea0,
      chartreuse: 0x7fff00,
      chocolate: 0xd2691e,
      coral: 0xff7f50,
      cornflowerblue: 0x6495ed,
      cornsilk: 0xfff8dc,
      crimson: 0xdc143c,
      cyan: 0x00ffff,
      darkblue: 0x00008b,
      darkcyan: 0x008b8b,
      darkgoldenrod: 0xb8860b,
      darkgray: 0xa9a9a9,
      darkgreen: 0x006400,
      darkgrey: 0xa9a9a9,
      darkkhaki: 0xbdb76b,
      darkmagenta: 0x8b008b,
      darkolivegreen: 0x556b2f,
      darkorange: 0xff8c00,
      darkorchid: 0x9932cc,
      darkred: 0x8b0000,
      darksalmon: 0xe9967a,
      darkseagreen: 0x8fbc8f,
      darkslateblue: 0x483d8b,
      darkslategray: 0x2f4f4f,
      darkslategrey: 0x2f4f4f,
      darkturquoise: 0x00ced1,
      darkviolet: 0x9400d3,
      deeppink: 0xff1493,
      deepskyblue: 0x00bfff,
      dimgray: 0x696969,
      dimgrey: 0x696969,
      dodgerblue: 0x1e90ff,
      firebrick: 0xb22222,
      floralwhite: 0xfffaf0,
      forestgreen: 0x228b22,
      fuchsia: 0xff00ff,
      gainsboro: 0xdcdcdc,
      ghostwhite: 0xf8f8ff,
      gold: 0xffd700,
      goldenrod: 0xdaa520,
      gray: 0x808080,
      green: 0x008000,
      greenyellow: 0xadff2f,
      grey: 0x808080,
      honeydew: 0xf0fff0,
      hotpink: 0xff69b4,
      indianred: 0xcd5c5c,
      indigo: 0x4b0082,
      ivory: 0xfffff0,
      khaki: 0xf0e68c,
      lavender: 0xe6e6fa,
      lavenderblush: 0xfff0f5,
      lawngreen: 0x7cfc00,
      lemonchiffon: 0xfffacd,
      lightblue: 0xadd8e6,
      lightcoral: 0xf08080,
      lightcyan: 0xe0ffff,
      lightgoldenrodyellow: 0xfafad2,
      lightgray: 0xd3d3d3,
      lightgreen: 0x90ee90,
      lightgrey: 0xd3d3d3,
      lightpink: 0xffb6c1,
      lightsalmon: 0xffa07a,
      lightseagreen: 0x20b2aa,
      lightskyblue: 0x87cefa,
      lightslategray: 0x778899,
      lightslategrey: 0x778899,
      lightsteelblue: 0xb0c4de,
      lightyellow: 0xffffe0,
      lime: 0x00ff00,
      limegreen: 0x32cd32,
      linen: 0xfaf0e6,
      magenta: 0xff00ff,
      maroon: 0x800000,
      mediumaquamarine: 0x66cdaa,
      mediumblue: 0x0000cd,
      mediumorchid: 0xba55d3,
      mediumpurple: 0x9370db,
      mediumseagreen: 0x3cb371,
      mediumslateblue: 0x7b68ee,
      mediumspringgreen: 0x00fa9a,
      mediumturquoise: 0x48d1cc,
      mediumvioletred: 0xc71585,
      midnightblue: 0x191970,
      mintcream: 0xf5fffa,
      mistyrose: 0xffe4e1,
      moccasin: 0xffe4b5,
      navajowhite: 0xffdead,
      navy: 0x000080,
      oldlace: 0xfdf5e6,
      olive: 0x808000,
      olivedrab: 0x6b8e23,
      orange: 0xffa500,
      orangered: 0xff4500,
      orchid: 0xda70d6,
      palegoldenrod: 0xeee8aa,
      palegreen: 0x98fb98,
      paleturquoise: 0xafeeee,
      palevioletred: 0xdb7093,
      papayawhip: 0xffefd5,
      peachpuff: 0xffdab9,
      peru: 0xcd853f,
      pink: 0xffc0cb,
      plum: 0xdda0dd,
      powderblue: 0xb0e0e6,
      purple: 0x800080,
      rebeccapurple: 0x663399,
      red: 0xff0000,
      rosybrown: 0xbc8f8f,
      royalblue: 0x4169e1,
      saddlebrown: 0x8b4513,
      salmon: 0xfa8072,
      sandybrown: 0xf4a460,
      seagreen: 0x2e8b57,
      seashell: 0xfff5ee,
      sienna: 0xa0522d,
      silver: 0xc0c0c0,
      skyblue: 0x87ceeb,
      slateblue: 0x6a5acd,
      slategray: 0x708090,
      slategrey: 0x708090,
      snow: 0xfffafa,
      springgreen: 0x00ff7f,
      steelblue: 0x4682b4,
      tan: 0xd2b48c,
      teal: 0x008080,
      thistle: 0xd8bfd8,
      tomato: 0xff6347,
      turquoise: 0x40e0d0,
      violet: 0xee82ee,
      wheat: 0xf5deb3,
      white: 0xffffff,
      whitesmoke: 0xf5f5f5,
      yellow: 0xffff00,
      yellowgreen: 0x9acd32
    };

    define(Color, color$1, {
      copy: function(channels) {
        return Object.assign(new this.constructor, this, channels);
      },
      displayable: function() {
        return this.rgb().displayable();
      },
      hex: color_formatHex, // Deprecated! Use color.formatHex.
      formatHex: color_formatHex,
      formatHsl: color_formatHsl,
      formatRgb: color_formatRgb,
      toString: color_formatRgb
    });

    function color_formatHex() {
      return this.rgb().formatHex();
    }

    function color_formatHsl() {
      return hslConvert(this).formatHsl();
    }

    function color_formatRgb() {
      return this.rgb().formatRgb();
    }

    function color$1(format) {
      var m, l;
      format = (format + "").trim().toLowerCase();
      return (m = reHex.exec(format)) ? (l = m[1].length, m = parseInt(m[1], 16), l === 6 ? rgbn(m) // #ff0000
          : l === 3 ? new Rgb((m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), ((m & 0xf) << 4) | (m & 0xf), 1) // #f00
          : l === 8 ? new Rgb(m >> 24 & 0xff, m >> 16 & 0xff, m >> 8 & 0xff, (m & 0xff) / 0xff) // #ff000000
          : l === 4 ? new Rgb((m >> 12 & 0xf) | (m >> 8 & 0xf0), (m >> 8 & 0xf) | (m >> 4 & 0xf0), (m >> 4 & 0xf) | (m & 0xf0), (((m & 0xf) << 4) | (m & 0xf)) / 0xff) // #f000
          : null) // invalid hex
          : (m = reRgbInteger.exec(format)) ? new Rgb(m[1], m[2], m[3], 1) // rgb(255, 0, 0)
          : (m = reRgbPercent.exec(format)) ? new Rgb(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, 1) // rgb(100%, 0%, 0%)
          : (m = reRgbaInteger.exec(format)) ? rgba$1(m[1], m[2], m[3], m[4]) // rgba(255, 0, 0, 1)
          : (m = reRgbaPercent.exec(format)) ? rgba$1(m[1] * 255 / 100, m[2] * 255 / 100, m[3] * 255 / 100, m[4]) // rgb(100%, 0%, 0%, 1)
          : (m = reHslPercent.exec(format)) ? hsla$1(m[1], m[2] / 100, m[3] / 100, 1) // hsl(120, 50%, 50%)
          : (m = reHslaPercent.exec(format)) ? hsla$1(m[1], m[2] / 100, m[3] / 100, m[4]) // hsla(120, 50%, 50%, 1)
          : named.hasOwnProperty(format) ? rgbn(named[format]) // eslint-disable-line no-prototype-builtins
          : format === "transparent" ? new Rgb(NaN, NaN, NaN, 0)
          : null;
    }

    function rgbn(n) {
      return new Rgb(n >> 16 & 0xff, n >> 8 & 0xff, n & 0xff, 1);
    }

    function rgba$1(r, g, b, a) {
      if (a <= 0) r = g = b = NaN;
      return new Rgb(r, g, b, a);
    }

    function rgbConvert(o) {
      if (!(o instanceof Color)) o = color$1(o);
      if (!o) return new Rgb;
      o = o.rgb();
      return new Rgb(o.r, o.g, o.b, o.opacity);
    }

    function rgb(r, g, b, opacity) {
      return arguments.length === 1 ? rgbConvert(r) : new Rgb(r, g, b, opacity == null ? 1 : opacity);
    }

    function Rgb(r, g, b, opacity) {
      this.r = +r;
      this.g = +g;
      this.b = +b;
      this.opacity = +opacity;
    }

    define(Rgb, rgb, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Rgb(this.r * k, this.g * k, this.b * k, this.opacity);
      },
      rgb: function() {
        return this;
      },
      displayable: function() {
        return (-0.5 <= this.r && this.r < 255.5)
            && (-0.5 <= this.g && this.g < 255.5)
            && (-0.5 <= this.b && this.b < 255.5)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      hex: rgb_formatHex, // Deprecated! Use color.formatHex.
      formatHex: rgb_formatHex,
      formatRgb: rgb_formatRgb,
      toString: rgb_formatRgb
    }));

    function rgb_formatHex() {
      return "#" + hex$1(this.r) + hex$1(this.g) + hex$1(this.b);
    }

    function rgb_formatRgb() {
      var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
      return (a === 1 ? "rgb(" : "rgba(")
          + Math.max(0, Math.min(255, Math.round(this.r) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.g) || 0)) + ", "
          + Math.max(0, Math.min(255, Math.round(this.b) || 0))
          + (a === 1 ? ")" : ", " + a + ")");
    }

    function hex$1(value) {
      value = Math.max(0, Math.min(255, Math.round(value) || 0));
      return (value < 16 ? "0" : "") + value.toString(16);
    }

    function hsla$1(h, s, l, a) {
      if (a <= 0) h = s = l = NaN;
      else if (l <= 0 || l >= 1) h = s = NaN;
      else if (s <= 0) h = NaN;
      return new Hsl(h, s, l, a);
    }

    function hslConvert(o) {
      if (o instanceof Hsl) return new Hsl(o.h, o.s, o.l, o.opacity);
      if (!(o instanceof Color)) o = color$1(o);
      if (!o) return new Hsl;
      if (o instanceof Hsl) return o;
      o = o.rgb();
      var r = o.r / 255,
          g = o.g / 255,
          b = o.b / 255,
          min = Math.min(r, g, b),
          max = Math.max(r, g, b),
          h = NaN,
          s = max - min,
          l = (max + min) / 2;
      if (s) {
        if (r === max) h = (g - b) / s + (g < b) * 6;
        else if (g === max) h = (b - r) / s + 2;
        else h = (r - g) / s + 4;
        s /= l < 0.5 ? max + min : 2 - max - min;
        h *= 60;
      } else {
        s = l > 0 && l < 1 ? 0 : h;
      }
      return new Hsl(h, s, l, o.opacity);
    }

    function hsl(h, s, l, opacity) {
      return arguments.length === 1 ? hslConvert(h) : new Hsl(h, s, l, opacity == null ? 1 : opacity);
    }

    function Hsl(h, s, l, opacity) {
      this.h = +h;
      this.s = +s;
      this.l = +l;
      this.opacity = +opacity;
    }

    define(Hsl, hsl, extend(Color, {
      brighter: function(k) {
        k = k == null ? brighter : Math.pow(brighter, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      darker: function(k) {
        k = k == null ? darker : Math.pow(darker, k);
        return new Hsl(this.h, this.s, this.l * k, this.opacity);
      },
      rgb: function() {
        var h = this.h % 360 + (this.h < 0) * 360,
            s = isNaN(h) || isNaN(this.s) ? 0 : this.s,
            l = this.l,
            m2 = l + (l < 0.5 ? l : 1 - l) * s,
            m1 = 2 * l - m2;
        return new Rgb(
          hsl2rgb(h >= 240 ? h - 240 : h + 120, m1, m2),
          hsl2rgb(h, m1, m2),
          hsl2rgb(h < 120 ? h + 240 : h - 120, m1, m2),
          this.opacity
        );
      },
      displayable: function() {
        return (0 <= this.s && this.s <= 1 || isNaN(this.s))
            && (0 <= this.l && this.l <= 1)
            && (0 <= this.opacity && this.opacity <= 1);
      },
      formatHsl: function() {
        var a = this.opacity; a = isNaN(a) ? 1 : Math.max(0, Math.min(1, a));
        return (a === 1 ? "hsl(" : "hsla(")
            + (this.h || 0) + ", "
            + (this.s || 0) * 100 + "%, "
            + (this.l || 0) * 100 + "%"
            + (a === 1 ? ")" : ", " + a + ")");
      }
    }));

    /* From FvD 13.37, CSS Color Module Level 3 */
    function hsl2rgb(h, m1, m2) {
      return (h < 60 ? m1 + (m2 - m1) * h / 60
          : h < 180 ? m2
          : h < 240 ? m1 + (m2 - m1) * (240 - h) / 60
          : m1) * 255;
    }

    function basis(t1, v0, v1, v2, v3) {
      var t2 = t1 * t1, t3 = t2 * t1;
      return ((1 - 3 * t1 + 3 * t2 - t3) * v0
          + (4 - 6 * t2 + 3 * t3) * v1
          + (1 + 3 * t1 + 3 * t2 - 3 * t3) * v2
          + t3 * v3) / 6;
    }

    function basis$1(values) {
      var n = values.length - 1;
      return function(t) {
        var i = t <= 0 ? (t = 0) : t >= 1 ? (t = 1, n - 1) : Math.floor(t * n),
            v1 = values[i],
            v2 = values[i + 1],
            v0 = i > 0 ? values[i - 1] : 2 * v1 - v2,
            v3 = i < n - 1 ? values[i + 2] : 2 * v2 - v1;
        return basis((t - i / n) * n, v0, v1, v2, v3);
      };
    }

    function constant(x) {
      return function() {
        return x;
      };
    }

    function linear$1(a, d) {
      return function(t) {
        return a + t * d;
      };
    }

    function exponential(a, b, y) {
      return a = Math.pow(a, y), b = Math.pow(b, y) - a, y = 1 / y, function(t) {
        return Math.pow(a + t * b, y);
      };
    }

    function gamma(y) {
      return (y = +y) === 1 ? nogamma : function(a, b) {
        return b - a ? exponential(a, b, y) : constant(isNaN(a) ? b : a);
      };
    }

    function nogamma(a, b) {
      var d = b - a;
      return d ? linear$1(a, d) : constant(isNaN(a) ? b : a);
    }

    var rgb$1 = (function rgbGamma(y) {
      var color = gamma(y);

      function rgb$1(start, end) {
        var r = color((start = rgb(start)).r, (end = rgb(end)).r),
            g = color(start.g, end.g),
            b = color(start.b, end.b),
            opacity = nogamma(start.opacity, end.opacity);
        return function(t) {
          start.r = r(t);
          start.g = g(t);
          start.b = b(t);
          start.opacity = opacity(t);
          return start + "";
        };
      }

      rgb$1.gamma = rgbGamma;

      return rgb$1;
    })(1);

    function rgbSpline(spline) {
      return function(colors) {
        var n = colors.length,
            r = new Array(n),
            g = new Array(n),
            b = new Array(n),
            i, color;
        for (i = 0; i < n; ++i) {
          color = rgb(colors[i]);
          r[i] = color.r || 0;
          g[i] = color.g || 0;
          b[i] = color.b || 0;
        }
        r = spline(r);
        g = spline(g);
        b = spline(b);
        color.opacity = 1;
        return function(t) {
          color.r = r(t);
          color.g = g(t);
          color.b = b(t);
          return color + "";
        };
      };
    }

    var rgbBasis = rgbSpline(basis$1);

    function numberArray(a, b) {
      if (!b) b = [];
      var n = a ? Math.min(b.length, a.length) : 0,
          c = b.slice(),
          i;
      return function(t) {
        for (i = 0; i < n; ++i) c[i] = a[i] * (1 - t) + b[i] * t;
        return c;
      };
    }

    function isNumberArray(x) {
      return ArrayBuffer.isView(x) && !(x instanceof DataView);
    }

    function genericArray(a, b) {
      var nb = b ? b.length : 0,
          na = a ? Math.min(nb, a.length) : 0,
          x = new Array(na),
          c = new Array(nb),
          i;

      for (i = 0; i < na; ++i) x[i] = interpolate$1(a[i], b[i]);
      for (; i < nb; ++i) c[i] = b[i];

      return function(t) {
        for (i = 0; i < na; ++i) c[i] = x[i](t);
        return c;
      };
    }

    function date(a, b) {
      var d = new Date;
      return a = +a, b = +b, function(t) {
        return d.setTime(a * (1 - t) + b * t), d;
      };
    }

    function interpolateNumber(a, b) {
      return a = +a, b = +b, function(t) {
        return a * (1 - t) + b * t;
      };
    }

    function object(a, b) {
      var i = {},
          c = {},
          k;

      if (a === null || typeof a !== "object") a = {};
      if (b === null || typeof b !== "object") b = {};

      for (k in b) {
        if (k in a) {
          i[k] = interpolate$1(a[k], b[k]);
        } else {
          c[k] = b[k];
        }
      }

      return function(t) {
        for (k in i) c[k] = i[k](t);
        return c;
      };
    }

    var reA = /[-+]?(?:\d+\.?\d*|\.?\d+)(?:[eE][-+]?\d+)?/g,
        reB = new RegExp(reA.source, "g");

    function zero(b) {
      return function() {
        return b;
      };
    }

    function one(b) {
      return function(t) {
        return b(t) + "";
      };
    }

    function string(a, b) {
      var bi = reA.lastIndex = reB.lastIndex = 0, // scan index for next number in b
          am, // current match in a
          bm, // current match in b
          bs, // string preceding current number in b, if any
          i = -1, // index in s
          s = [], // string constants and placeholders
          q = []; // number interpolators

      // Coerce inputs to strings.
      a = a + "", b = b + "";

      // Interpolate pairs of numbers in a & b.
      while ((am = reA.exec(a))
          && (bm = reB.exec(b))) {
        if ((bs = bm.index) > bi) { // a string precedes the next number in b
          bs = b.slice(bi, bs);
          if (s[i]) s[i] += bs; // coalesce with previous string
          else s[++i] = bs;
        }
        if ((am = am[0]) === (bm = bm[0])) { // numbers in a & b match
          if (s[i]) s[i] += bm; // coalesce with previous string
          else s[++i] = bm;
        } else { // interpolate non-matching numbers
          s[++i] = null;
          q.push({i: i, x: interpolateNumber(am, bm)});
        }
        bi = reB.lastIndex;
      }

      // Add remains of b.
      if (bi < b.length) {
        bs = b.slice(bi);
        if (s[i]) s[i] += bs; // coalesce with previous string
        else s[++i] = bs;
      }

      // Special optimization for only a single match.
      // Otherwise, interpolate each of the numbers and rejoin the string.
      return s.length < 2 ? (q[0]
          ? one(q[0].x)
          : zero(b))
          : (b = q.length, function(t) {
              for (var i = 0, o; i < b; ++i) s[(o = q[i]).i] = o.x(t);
              return s.join("");
            });
    }

    function interpolate$1(a, b) {
      var t = typeof b, c;
      return b == null || t === "boolean" ? constant(b)
          : (t === "number" ? interpolateNumber
          : t === "string" ? ((c = color$1(b)) ? (b = c, rgb$1) : string)
          : b instanceof color$1 ? rgb$1
          : b instanceof Date ? date
          : isNumberArray(b) ? numberArray
          : Array.isArray(b) ? genericArray
          : typeof b.valueOf !== "function" && typeof b.toString !== "function" || isNaN(b) ? object
          : interpolateNumber)(a, b);
    }

    function interpolateRound(a, b) {
      return a = +a, b = +b, function(t) {
        return Math.round(a * (1 - t) + b * t);
      };
    }

    function constant$1(x) {
      return function() {
        return x;
      };
    }

    function number$1(x) {
      return +x;
    }

    var unit = [0, 1];

    function identity$1(x) {
      return x;
    }

    function normalize(a, b) {
      return (b -= (a = +a))
          ? function(x) { return (x - a) / b; }
          : constant$1(isNaN(b) ? NaN : 0.5);
    }

    function clamper(a, b) {
      var t;
      if (a > b) t = a, a = b, b = t;
      return function(x) { return Math.max(a, Math.min(b, x)); };
    }

    // normalize(a, b)(x) takes a domain value x in [a,b] and returns the corresponding parameter t in [0,1].
    // interpolate(a, b)(t) takes a parameter t in [0,1] and returns the corresponding range value x in [a,b].
    function bimap(domain, range, interpolate) {
      var d0 = domain[0], d1 = domain[1], r0 = range[0], r1 = range[1];
      if (d1 < d0) d0 = normalize(d1, d0), r0 = interpolate(r1, r0);
      else d0 = normalize(d0, d1), r0 = interpolate(r0, r1);
      return function(x) { return r0(d0(x)); };
    }

    function polymap(domain, range, interpolate) {
      var j = Math.min(domain.length, range.length) - 1,
          d = new Array(j),
          r = new Array(j),
          i = -1;

      // Reverse descending domains.
      if (domain[j] < domain[0]) {
        domain = domain.slice().reverse();
        range = range.slice().reverse();
      }

      while (++i < j) {
        d[i] = normalize(domain[i], domain[i + 1]);
        r[i] = interpolate(range[i], range[i + 1]);
      }

      return function(x) {
        var i = bisectRight(domain, x, 1, j) - 1;
        return r[i](d[i](x));
      };
    }

    function copy(source, target) {
      return target
          .domain(source.domain())
          .range(source.range())
          .interpolate(source.interpolate())
          .clamp(source.clamp())
          .unknown(source.unknown());
    }

    function transformer() {
      var domain = unit,
          range = unit,
          interpolate = interpolate$1,
          transform,
          untransform,
          unknown,
          clamp = identity$1,
          piecewise,
          output,
          input;

      function rescale() {
        var n = Math.min(domain.length, range.length);
        if (clamp !== identity$1) clamp = clamper(domain[0], domain[n - 1]);
        piecewise = n > 2 ? polymap : bimap;
        output = input = null;
        return scale;
      }

      function scale(x) {
        return isNaN(x = +x) ? unknown : (output || (output = piecewise(domain.map(transform), range, interpolate)))(transform(clamp(x)));
      }

      scale.invert = function(y) {
        return clamp(untransform((input || (input = piecewise(range, domain.map(transform), interpolateNumber)))(y)));
      };

      scale.domain = function(_) {
        return arguments.length ? (domain = Array.from(_, number$1), rescale()) : domain.slice();
      };

      scale.range = function(_) {
        return arguments.length ? (range = Array.from(_), rescale()) : range.slice();
      };

      scale.rangeRound = function(_) {
        return range = Array.from(_), interpolate = interpolateRound, rescale();
      };

      scale.clamp = function(_) {
        return arguments.length ? (clamp = _ ? true : identity$1, rescale()) : clamp !== identity$1;
      };

      scale.interpolate = function(_) {
        return arguments.length ? (interpolate = _, rescale()) : interpolate;
      };

      scale.unknown = function(_) {
        return arguments.length ? (unknown = _, scale) : unknown;
      };

      return function(t, u) {
        transform = t, untransform = u;
        return rescale();
      };
    }

    function continuous() {
      return transformer()(identity$1, identity$1);
    }

    // Computes the decimal coefficient and exponent of the specified number x with
    // significant digits p, where x is positive and p is in [1, 21] or undefined.
    // For example, formatDecimal(1.23) returns ["123", 0].
    function formatDecimal(x, p) {
      if ((i = (x = p ? x.toExponential(p - 1) : x.toExponential()).indexOf("e")) < 0) return null; // NaN, ±Infinity
      var i, coefficient = x.slice(0, i);

      // The string returned by toExponential either has the form \d\.\d+e[-+]\d+
      // (e.g., 1.2e+3) or the form \de[-+]\d+ (e.g., 1e+3).
      return [
        coefficient.length > 1 ? coefficient[0] + coefficient.slice(2) : coefficient,
        +x.slice(i + 1)
      ];
    }

    function exponent(x) {
      return x = formatDecimal(Math.abs(x)), x ? x[1] : NaN;
    }

    function formatGroup(grouping, thousands) {
      return function(value, width) {
        var i = value.length,
            t = [],
            j = 0,
            g = grouping[0],
            length = 0;

        while (i > 0 && g > 0) {
          if (length + g + 1 > width) g = Math.max(1, width - length);
          t.push(value.substring(i -= g, i + g));
          if ((length += g + 1) > width) break;
          g = grouping[j = (j + 1) % grouping.length];
        }

        return t.reverse().join(thousands);
      };
    }

    function formatNumerals(numerals) {
      return function(value) {
        return value.replace(/[0-9]/g, function(i) {
          return numerals[+i];
        });
      };
    }

    // [[fill]align][sign][symbol][0][width][,][.precision][~][type]
    var re = /^(?:(.)?([<>=^]))?([+\-( ])?([$#])?(0)?(\d+)?(,)?(\.\d+)?(~)?([a-z%])?$/i;

    function formatSpecifier(specifier) {
      if (!(match = re.exec(specifier))) throw new Error("invalid format: " + specifier);
      var match;
      return new FormatSpecifier({
        fill: match[1],
        align: match[2],
        sign: match[3],
        symbol: match[4],
        zero: match[5],
        width: match[6],
        comma: match[7],
        precision: match[8] && match[8].slice(1),
        trim: match[9],
        type: match[10]
      });
    }

    formatSpecifier.prototype = FormatSpecifier.prototype; // instanceof

    function FormatSpecifier(specifier) {
      this.fill = specifier.fill === undefined ? " " : specifier.fill + "";
      this.align = specifier.align === undefined ? ">" : specifier.align + "";
      this.sign = specifier.sign === undefined ? "-" : specifier.sign + "";
      this.symbol = specifier.symbol === undefined ? "" : specifier.symbol + "";
      this.zero = !!specifier.zero;
      this.width = specifier.width === undefined ? undefined : +specifier.width;
      this.comma = !!specifier.comma;
      this.precision = specifier.precision === undefined ? undefined : +specifier.precision;
      this.trim = !!specifier.trim;
      this.type = specifier.type === undefined ? "" : specifier.type + "";
    }

    FormatSpecifier.prototype.toString = function() {
      return this.fill
          + this.align
          + this.sign
          + this.symbol
          + (this.zero ? "0" : "")
          + (this.width === undefined ? "" : Math.max(1, this.width | 0))
          + (this.comma ? "," : "")
          + (this.precision === undefined ? "" : "." + Math.max(0, this.precision | 0))
          + (this.trim ? "~" : "")
          + this.type;
    };

    // Trims insignificant zeros, e.g., replaces 1.2000k with 1.2k.
    function formatTrim(s) {
      out: for (var n = s.length, i = 1, i0 = -1, i1; i < n; ++i) {
        switch (s[i]) {
          case ".": i0 = i1 = i; break;
          case "0": if (i0 === 0) i0 = i; i1 = i; break;
          default: if (!+s[i]) break out; if (i0 > 0) i0 = 0; break;
        }
      }
      return i0 > 0 ? s.slice(0, i0) + s.slice(i1 + 1) : s;
    }

    var prefixExponent;

    function formatPrefixAuto(x, p) {
      var d = formatDecimal(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1],
          i = exponent - (prefixExponent = Math.max(-8, Math.min(8, Math.floor(exponent / 3))) * 3) + 1,
          n = coefficient.length;
      return i === n ? coefficient
          : i > n ? coefficient + new Array(i - n + 1).join("0")
          : i > 0 ? coefficient.slice(0, i) + "." + coefficient.slice(i)
          : "0." + new Array(1 - i).join("0") + formatDecimal(x, Math.max(0, p + i - 1))[0]; // less than 1y!
    }

    function formatRounded(x, p) {
      var d = formatDecimal(x, p);
      if (!d) return x + "";
      var coefficient = d[0],
          exponent = d[1];
      return exponent < 0 ? "0." + new Array(-exponent).join("0") + coefficient
          : coefficient.length > exponent + 1 ? coefficient.slice(0, exponent + 1) + "." + coefficient.slice(exponent + 1)
          : coefficient + new Array(exponent - coefficient.length + 2).join("0");
    }

    var formatTypes = {
      "%": function(x, p) { return (x * 100).toFixed(p); },
      "b": function(x) { return Math.round(x).toString(2); },
      "c": function(x) { return x + ""; },
      "d": function(x) { return Math.round(x).toString(10); },
      "e": function(x, p) { return x.toExponential(p); },
      "f": function(x, p) { return x.toFixed(p); },
      "g": function(x, p) { return x.toPrecision(p); },
      "o": function(x) { return Math.round(x).toString(8); },
      "p": function(x, p) { return formatRounded(x * 100, p); },
      "r": formatRounded,
      "s": formatPrefixAuto,
      "X": function(x) { return Math.round(x).toString(16).toUpperCase(); },
      "x": function(x) { return Math.round(x).toString(16); }
    };

    function identity$2(x) {
      return x;
    }

    var map = Array.prototype.map,
        prefixes$1 = ["y","z","a","f","p","n","µ","m","","k","M","G","T","P","E","Z","Y"];

    function formatLocale(locale) {
      var group = locale.grouping === undefined || locale.thousands === undefined ? identity$2 : formatGroup(map.call(locale.grouping, Number), locale.thousands + ""),
          currencyPrefix = locale.currency === undefined ? "" : locale.currency[0] + "",
          currencySuffix = locale.currency === undefined ? "" : locale.currency[1] + "",
          decimal = locale.decimal === undefined ? "." : locale.decimal + "",
          numerals = locale.numerals === undefined ? identity$2 : formatNumerals(map.call(locale.numerals, String)),
          percent = locale.percent === undefined ? "%" : locale.percent + "",
          minus = locale.minus === undefined ? "-" : locale.minus + "",
          nan = locale.nan === undefined ? "NaN" : locale.nan + "";

      function newFormat(specifier) {
        specifier = formatSpecifier(specifier);

        var fill = specifier.fill,
            align = specifier.align,
            sign = specifier.sign,
            symbol = specifier.symbol,
            zero = specifier.zero,
            width = specifier.width,
            comma = specifier.comma,
            precision = specifier.precision,
            trim = specifier.trim,
            type = specifier.type;

        // The "n" type is an alias for ",g".
        if (type === "n") comma = true, type = "g";

        // The "" type, and any invalid type, is an alias for ".12~g".
        else if (!formatTypes[type]) precision === undefined && (precision = 12), trim = true, type = "g";

        // If zero fill is specified, padding goes after sign and before digits.
        if (zero || (fill === "0" && align === "=")) zero = true, fill = "0", align = "=";

        // Compute the prefix and suffix.
        // For SI-prefix, the suffix is lazily computed.
        var prefix = symbol === "$" ? currencyPrefix : symbol === "#" && /[boxX]/.test(type) ? "0" + type.toLowerCase() : "",
            suffix = symbol === "$" ? currencySuffix : /[%p]/.test(type) ? percent : "";

        // What format function should we use?
        // Is this an integer type?
        // Can this type generate exponential notation?
        var formatType = formatTypes[type],
            maybeSuffix = /[defgprs%]/.test(type);

        // Set the default precision if not specified,
        // or clamp the specified precision to the supported range.
        // For significant precision, it must be in [1, 21].
        // For fixed precision, it must be in [0, 20].
        precision = precision === undefined ? 6
            : /[gprs]/.test(type) ? Math.max(1, Math.min(21, precision))
            : Math.max(0, Math.min(20, precision));

        function format(value) {
          var valuePrefix = prefix,
              valueSuffix = suffix,
              i, n, c;

          if (type === "c") {
            valueSuffix = formatType(value) + valueSuffix;
            value = "";
          } else {
            value = +value;

            // Determine the sign. -0 is not less than 0, but 1 / -0 is!
            var valueNegative = value < 0 || 1 / value < 0;

            // Perform the initial formatting.
            value = isNaN(value) ? nan : formatType(Math.abs(value), precision);

            // Trim insignificant zeros.
            if (trim) value = formatTrim(value);

            // If a negative value rounds to zero after formatting, and no explicit positive sign is requested, hide the sign.
            if (valueNegative && +value === 0 && sign !== "+") valueNegative = false;

            // Compute the prefix and suffix.
            valuePrefix = (valueNegative ? (sign === "(" ? sign : minus) : sign === "-" || sign === "(" ? "" : sign) + valuePrefix;
            valueSuffix = (type === "s" ? prefixes$1[8 + prefixExponent / 3] : "") + valueSuffix + (valueNegative && sign === "(" ? ")" : "");

            // Break the formatted value into the integer “value” part that can be
            // grouped, and fractional or exponential “suffix” part that is not.
            if (maybeSuffix) {
              i = -1, n = value.length;
              while (++i < n) {
                if (c = value.charCodeAt(i), 48 > c || c > 57) {
                  valueSuffix = (c === 46 ? decimal + value.slice(i + 1) : value.slice(i)) + valueSuffix;
                  value = value.slice(0, i);
                  break;
                }
              }
            }
          }

          // If the fill character is not "0", grouping is applied before padding.
          if (comma && !zero) value = group(value, Infinity);

          // Compute the padding.
          var length = valuePrefix.length + value.length + valueSuffix.length,
              padding = length < width ? new Array(width - length + 1).join(fill) : "";

          // If the fill character is "0", grouping is applied after padding.
          if (comma && zero) value = group(padding + value, padding.length ? width - valueSuffix.length : Infinity), padding = "";

          // Reconstruct the final output based on the desired alignment.
          switch (align) {
            case "<": value = valuePrefix + value + valueSuffix + padding; break;
            case "=": value = valuePrefix + padding + value + valueSuffix; break;
            case "^": value = padding.slice(0, length = padding.length >> 1) + valuePrefix + value + valueSuffix + padding.slice(length); break;
            default: value = padding + valuePrefix + value + valueSuffix; break;
          }

          return numerals(value);
        }

        format.toString = function() {
          return specifier + "";
        };

        return format;
      }

      function formatPrefix(specifier, value) {
        var f = newFormat((specifier = formatSpecifier(specifier), specifier.type = "f", specifier)),
            e = Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3,
            k = Math.pow(10, -e),
            prefix = prefixes$1[8 + e / 3];
        return function(value) {
          return f(k * value) + prefix;
        };
      }

      return {
        format: newFormat,
        formatPrefix: formatPrefix
      };
    }

    var locale;
    var format;
    var formatPrefix;

    defaultLocale({
      decimal: ".",
      thousands: ",",
      grouping: [3],
      currency: ["$", ""],
      minus: "-"
    });

    function defaultLocale(definition) {
      locale = formatLocale(definition);
      format = locale.format;
      formatPrefix = locale.formatPrefix;
      return locale;
    }

    function precisionFixed(step) {
      return Math.max(0, -exponent(Math.abs(step)));
    }

    function precisionPrefix(step, value) {
      return Math.max(0, Math.max(-8, Math.min(8, Math.floor(exponent(value) / 3))) * 3 - exponent(Math.abs(step)));
    }

    function precisionRound(step, max) {
      step = Math.abs(step), max = Math.abs(max) - step;
      return Math.max(0, exponent(max) - exponent(step)) + 1;
    }

    function tickFormat(start, stop, count, specifier) {
      var step = tickStep(start, stop, count),
          precision;
      specifier = formatSpecifier(specifier == null ? ",f" : specifier);
      switch (specifier.type) {
        case "s": {
          var value = Math.max(Math.abs(start), Math.abs(stop));
          if (specifier.precision == null && !isNaN(precision = precisionPrefix(step, value))) specifier.precision = precision;
          return formatPrefix(specifier, value);
        }
        case "":
        case "e":
        case "g":
        case "p":
        case "r": {
          if (specifier.precision == null && !isNaN(precision = precisionRound(step, Math.max(Math.abs(start), Math.abs(stop))))) specifier.precision = precision - (specifier.type === "e");
          break;
        }
        case "f":
        case "%": {
          if (specifier.precision == null && !isNaN(precision = precisionFixed(step))) specifier.precision = precision - (specifier.type === "%") * 2;
          break;
        }
      }
      return format(specifier);
    }

    function linearish(scale) {
      var domain = scale.domain;

      scale.ticks = function(count) {
        var d = domain();
        return ticks(d[0], d[d.length - 1], count == null ? 10 : count);
      };

      scale.tickFormat = function(count, specifier) {
        var d = domain();
        return tickFormat(d[0], d[d.length - 1], count == null ? 10 : count, specifier);
      };

      scale.nice = function(count) {
        if (count == null) count = 10;

        var d = domain(),
            i0 = 0,
            i1 = d.length - 1,
            start = d[i0],
            stop = d[i1],
            step;

        if (stop < start) {
          step = start, start = stop, stop = step;
          step = i0, i0 = i1, i1 = step;
        }

        step = tickIncrement(start, stop, count);

        if (step > 0) {
          start = Math.floor(start / step) * step;
          stop = Math.ceil(stop / step) * step;
          step = tickIncrement(start, stop, count);
        } else if (step < 0) {
          start = Math.ceil(start * step) / step;
          stop = Math.floor(stop * step) / step;
          step = tickIncrement(start, stop, count);
        }

        if (step > 0) {
          d[i0] = Math.floor(start / step) * step;
          d[i1] = Math.ceil(stop / step) * step;
          domain(d);
        } else if (step < 0) {
          d[i0] = Math.ceil(start * step) / step;
          d[i1] = Math.floor(stop * step) / step;
          domain(d);
        }

        return scale;
      };

      return scale;
    }

    function linear$2() {
      var scale = continuous();

      scale.copy = function() {
        return copy(scale, linear$2());
      };

      initRange.apply(scale, arguments);

      return linearish(scale);
    }

    function colors(specifier) {
      var n = specifier.length / 6 | 0, colors = new Array(n), i = 0;
      while (i < n) colors[i] = "#" + specifier.slice(i * 6, ++i * 6);
      return colors;
    }

    function ramp(scheme) {
      return rgbBasis(scheme[scheme.length - 1]);
    }

    var scheme = new Array(3).concat(
      "fc8d59ffffbf91bfdb",
      "d7191cfdae61abd9e92c7bb6",
      "d7191cfdae61ffffbfabd9e92c7bb6",
      "d73027fc8d59fee090e0f3f891bfdb4575b4",
      "d73027fc8d59fee090ffffbfe0f3f891bfdb4575b4",
      "d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4",
      "d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4",
      "a50026d73027f46d43fdae61fee090e0f3f8abd9e974add14575b4313695",
      "a50026d73027f46d43fdae61fee090ffffbfe0f3f8abd9e974add14575b4313695"
    ).map(colors);

    var interpolateRdYlBu = ramp(scheme);

    /* Thermometer.svelte generated by Svelte v3.20.1 */
    const file$3 = "Thermometer.svelte";

    function create_fragment$3(ctx) {
    	let div;
    	let svg;
    	let defs;
    	let style;
    	let t0;
    	let g;
    	let path0;
    	let path1;
    	let rect;
    	let circle;
    	let text_1;
    	let t1;
    	let t2;
    	let text_1_fill_value;

    	const block = {
    		c: function create() {
    			div = element("div");
    			svg = svg_element("svg");
    			defs = svg_element("defs");
    			style = svg_element("style");
    			t0 = text(".cls-1 {\n        fill: rgba(255, 255, 255, 0.521);\n      }\n\n      .cls-2 {\n        fill: none;\n        stroke: #333;\n        stroke-miterlimit: 10;\n        stroke-width: 2px;\n      }\n\n      .cls-4 {\n        font-size: 40px;\n        font-family: MyriadPro-Regular, Myriad Pro;\n        letter-spacing: 0em;\n      }\n    ");
    			g = svg_element("g");
    			path0 = svg_element("path");
    			path1 = svg_element("path");
    			rect = svg_element("rect");
    			circle = svg_element("circle");
    			text_1 = svg_element("text");
    			t1 = text(/*temp*/ ctx[0]);
    			t2 = text("°C");
    			add_location(style, file$3, 40, 4, 1311);
    			add_location(defs, file$3, 39, 2, 1300);
    			attr_dev(path0, "class", "cls-1");
    			attr_dev(path0, "d", "M694,689a91,91,0,0,1-59-160.28V137a59,59,0,1,1,118,0V528.72A91,91,0,0,1,694,689Z");
    			attr_dev(path0, "transform", "translate(-602 -77)");
    			add_location(path0, file$3, 60, 4, 1671);
    			attr_dev(path1, "class", "cls-2");
    			attr_dev(path1, "d", "M694,689a91,91,0,0,1-59-160.28V137a59,59,0,1,1,118,0V528.72A91,91,0,0,1,694,689Z");
    			attr_dev(path1, "transform", "translate(-602 -77)");
    			add_location(path1, file$3, 61, 4, 1814);
    			add_location(g, file$3, 59, 2, 1663);
    			attr_dev(rect, "class", "cls-3");
    			attr_dev(rect, "fill", /*tempColor*/ ctx[3]);
    			attr_dev(rect, "x", "49");
    			attr_dev(rect, "y", /*starting_y*/ ctx[2]);
    			attr_dev(rect, "width", "86");
    			attr_dev(rect, "height", /*height*/ ctx[1]);
    			attr_dev(rect, "rx", "43");
    			add_location(rect, file$3, 63, 2, 1962);
    			attr_dev(circle, "class", "cls-3");
    			attr_dev(circle, "fill", /*tempColor*/ ctx[3]);
    			attr_dev(circle, "cx", "92");
    			attr_dev(circle, "cy", "521");
    			attr_dev(circle, "r", "75");
    			add_location(circle, file$3, 66, 2, 2181);
    			attr_dev(text_1, "class", "cls-4");
    			attr_dev(text_1, "fill", text_1_fill_value = "#fff");
    			attr_dev(text_1, "transform", "translate(53.42 532)");
    			add_location(text_1, file$3, 67, 2, 2248);
    			attr_dev(svg, "id", "Layer_1");
    			attr_dev(svg, "data-name", "Layer 1");
    			attr_dev(svg, "xmlns", "http://www.w3.org/2000/svg");
    			attr_dev(svg, "viewBox", "0 0 184 613");
    			add_location(svg, file$3, 38, 0, 1202);
    			attr_dev(div, "class", "thermometer svelte-1wabr3v");
    			add_location(div, file$3, 37, 0, 1176);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div, anchor);
    			append_dev(div, svg);
    			append_dev(svg, defs);
    			append_dev(defs, style);
    			append_dev(style, t0);
    			append_dev(svg, g);
    			append_dev(g, path0);
    			append_dev(g, path1);
    			append_dev(svg, rect);
    			append_dev(svg, circle);
    			append_dev(svg, text_1);
    			append_dev(text_1, t1);
    			append_dev(text_1, t2);
    		},
    		p: function update(ctx, [dirty]) {
    			if (dirty & /*tempColor*/ 8) {
    				attr_dev(rect, "fill", /*tempColor*/ ctx[3]);
    			}

    			if (dirty & /*starting_y*/ 4) {
    				attr_dev(rect, "y", /*starting_y*/ ctx[2]);
    			}

    			if (dirty & /*height*/ 2) {
    				attr_dev(rect, "height", /*height*/ ctx[1]);
    			}

    			if (dirty & /*tempColor*/ 8) {
    				attr_dev(circle, "fill", /*tempColor*/ ctx[3]);
    			}

    			if (dirty & /*temp*/ 1) set_data_dev(t1, /*temp*/ ctx[0]);
    		},
    		i: noop,
    		o: noop,
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$3.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const MAX_HEIGHT = 534; // total height of mercury rect - DO NOT CHANGE
    const MIN_HEIGHT = 105; // how far the mercury rect dips below the mercury circle -DO NOT CHANGE
    const TOPMOST_Y = 17; // DO NOT CHANGE - mercury of thermometer starts at y=17px and moves down
    const red = "#cc2f10";
    const yellow = "#ccb310";
    const blue = "#1065cc";

    function instance$3($$self, $$props, $$invalidate) {
    	let { temp } = $$props;
    	const HEIGHT_CHANGE = MAX_HEIGHT - MIN_HEIGHT; // 429
    	const BOTTOMMOST_Y = TOPMOST_Y + HEIGHT_CHANGE;
    	var getColor = linear$2().domain([-40, 0, 40]).range([blue, yellow, red]);
    	let pixelChangeFromBaseline = 0; // -40 C to start 
    	let height = MIN_HEIGHT;
    	let starting_y = BOTTOMMOST_Y;
    	let tempColor = "#c1272d";

    	const scaleTempToPixels = temp => {
    		return HEIGHT_CHANGE / 80 * (temp + 40);
    	};

    	const writable_props = ["temp"];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<Thermometer> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("Thermometer", $$slots, []);

    	$$self.$set = $$props => {
    		if ("temp" in $$props) $$invalidate(0, temp = $$props.temp);
    	};

    	$$self.$capture_state = () => ({
    		scaleLinear: linear$2,
    		interpolateRdYlBu,
    		temp,
    		MAX_HEIGHT,
    		MIN_HEIGHT,
    		HEIGHT_CHANGE,
    		TOPMOST_Y,
    		BOTTOMMOST_Y,
    		red,
    		yellow,
    		blue,
    		getColor,
    		pixelChangeFromBaseline,
    		height,
    		starting_y,
    		tempColor,
    		scaleTempToPixels
    	});

    	$$self.$inject_state = $$props => {
    		if ("temp" in $$props) $$invalidate(0, temp = $$props.temp);
    		if ("getColor" in $$props) $$invalidate(7, getColor = $$props.getColor);
    		if ("pixelChangeFromBaseline" in $$props) $$invalidate(4, pixelChangeFromBaseline = $$props.pixelChangeFromBaseline);
    		if ("height" in $$props) $$invalidate(1, height = $$props.height);
    		if ("starting_y" in $$props) $$invalidate(2, starting_y = $$props.starting_y);
    		if ("tempColor" in $$props) $$invalidate(3, tempColor = $$props.tempColor);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	$$self.$$.update = () => {
    		if ($$self.$$.dirty & /*temp, pixelChangeFromBaseline*/ 17) {
    			 {
    				$$invalidate(4, pixelChangeFromBaseline = scaleTempToPixels(temp));
    				$$invalidate(1, height = MIN_HEIGHT + pixelChangeFromBaseline);
    				$$invalidate(2, starting_y = BOTTOMMOST_Y - pixelChangeFromBaseline);
    				$$invalidate(3, tempColor = getColor(temp));
    			}
    		}
    	};

    	return [temp, height, starting_y, tempColor];
    }

    class Thermometer extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$3, create_fragment$3, safe_not_equal, { temp: 0 });

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "Thermometer",
    			options,
    			id: create_fragment$3.name
    		});

    		const { ctx } = this.$$;
    		const props = options.props || {};

    		if (/*temp*/ ctx[0] === undefined && !("temp" in props)) {
    			console.warn("<Thermometer> was created without expected prop 'temp'");
    		}
    	}

    	get temp() {
    		throw new Error("<Thermometer>: Props cannot be read directly from the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}

    	set temp(value) {
    		throw new Error("<Thermometer>: Props cannot be set directly on the component instance unless compiling with 'accessors: true' or '<svelte:options accessors/>'");
    	}
    }

    /* ComponentLibrary.svelte generated by Svelte v3.20.1 */
    const file$4 = "ComponentLibrary.svelte";

    function create_fragment$4(ctx) {
    	let div4;
    	let h1;
    	let t1;
    	let div3;
    	let div0;
    	let h20;
    	let t3;
    	let t4;
    	let div1;
    	let h21;
    	let t6;
    	let span;
    	let t7;
    	let t8;
    	let t9;
    	let t10;
    	let div2;
    	let h22;
    	let t12;
    	let current;

    	const thermometer = new Thermometer({
    			props: { temp: /*temp*/ ctx[1] },
    			$$inline: true
    		});

    	const scrubber = new Scrubber({
    			props: {
    				currentFrame: /*currentFrame*/ ctx[0],
    				pauseAnimation: /*pauseAnimation*/ ctx[2],
    				startAnimation: /*startAnimation*/ ctx[3],
    				updateCurrentFrame: /*updateCurrentFrame*/ ctx[4]
    			},
    			$$inline: true
    		});

    	const eventinfobox = new EventInfoBox({
    			props: {
    				classname: "event-info",
    				eventDetails: /*eventDetails*/ ctx[5]
    			},
    			$$inline: true
    		});

    	const block = {
    		c: function create() {
    			div4 = element("div");
    			h1 = element("h1");
    			h1.textContent = "Component Library";
    			t1 = space();
    			div3 = element("div");
    			div0 = element("div");
    			h20 = element("h2");
    			h20.textContent = "Thermometer";
    			t3 = space();
    			create_component(thermometer.$$.fragment);
    			t4 = space();
    			div1 = element("div");
    			h21 = element("h2");
    			h21.textContent = "Scrubber";
    			t6 = space();
    			span = element("span");
    			t7 = text("current frame: ");
    			t8 = text(/*currentFrame*/ ctx[0]);
    			t9 = space();
    			create_component(scrubber.$$.fragment);
    			t10 = space();
    			div2 = element("div");
    			h22 = element("h2");
    			h22.textContent = "Policy Event Info Box";
    			t12 = space();
    			create_component(eventinfobox.$$.fragment);
    			add_location(h1, file$4, 57, 4, 1364);
    			add_location(h20, file$4, 61, 12, 1508);
    			attr_dev(div0, "class", "component thermometer svelte-1djncr2");
    			add_location(div0, file$4, 60, 9, 1460);
    			add_location(h21, file$4, 69, 10, 1673);
    			add_location(span, file$4, 70, 10, 1701);
    			attr_dev(div1, "class", "component scrubber svelte-1djncr2");
    			add_location(div1, file$4, 68, 8, 1630);
    			add_location(h22, file$4, 81, 12, 2067);
    			attr_dev(div2, "class", "component policy-event-info-box svelte-1djncr2");
    			add_location(div2, file$4, 80, 9, 2009);
    			attr_dev(div3, "class", "components");
    			add_location(div3, file$4, 58, 4, 1395);
    			attr_dev(div4, "class", "component-library");
    			add_location(div4, file$4, 56, 0, 1328);
    		},
    		l: function claim(nodes) {
    			throw new Error("options.hydrate only works if the component was compiled with the `hydratable: true` option");
    		},
    		m: function mount(target, anchor) {
    			insert_dev(target, div4, anchor);
    			append_dev(div4, h1);
    			append_dev(div4, t1);
    			append_dev(div4, div3);
    			append_dev(div3, div0);
    			append_dev(div0, h20);
    			append_dev(div0, t3);
    			mount_component(thermometer, div0, null);
    			append_dev(div3, t4);
    			append_dev(div3, div1);
    			append_dev(div1, h21);
    			append_dev(div1, t6);
    			append_dev(div1, span);
    			append_dev(span, t7);
    			append_dev(span, t8);
    			append_dev(div1, t9);
    			mount_component(scrubber, div1, null);
    			append_dev(div3, t10);
    			append_dev(div3, div2);
    			append_dev(div2, h22);
    			append_dev(div2, t12);
    			mount_component(eventinfobox, div2, null);
    			current = true;
    		},
    		p: function update(ctx, [dirty]) {
    			const thermometer_changes = {};
    			if (dirty & /*temp*/ 2) thermometer_changes.temp = /*temp*/ ctx[1];
    			thermometer.$set(thermometer_changes);
    			if (!current || dirty & /*currentFrame*/ 1) set_data_dev(t8, /*currentFrame*/ ctx[0]);
    			const scrubber_changes = {};
    			if (dirty & /*currentFrame*/ 1) scrubber_changes.currentFrame = /*currentFrame*/ ctx[0];
    			scrubber.$set(scrubber_changes);
    		},
    		i: function intro(local) {
    			if (current) return;
    			transition_in(thermometer.$$.fragment, local);
    			transition_in(scrubber.$$.fragment, local);
    			transition_in(eventinfobox.$$.fragment, local);
    			current = true;
    		},
    		o: function outro(local) {
    			transition_out(thermometer.$$.fragment, local);
    			transition_out(scrubber.$$.fragment, local);
    			transition_out(eventinfobox.$$.fragment, local);
    			current = false;
    		},
    		d: function destroy(detaching) {
    			if (detaching) detach_dev(div4);
    			destroy_component(thermometer);
    			destroy_component(scrubber);
    			destroy_component(eventinfobox);
    		}
    	};

    	dispatch_dev("SvelteRegisterBlock", {
    		block,
    		id: create_fragment$4.name,
    		type: "component",
    		source: "",
    		ctx
    	});

    	return block;
    }

    const FRAME_RATE = 30; //fps

    function instance$4($$self, $$props, $$invalidate) {
    	let nFrames = 431; // total number of frames in animation
    	let currentFrame = 1;
    	let animationPaused = true;
    	let temp = -40;

    	let incrementFrame = function () {
    		if (animationPaused) return;

    		if (currentFrame + 1 >= nFrames) {
    			$$invalidate(0, currentFrame = 1);
    		} else {
    			$$invalidate(0, currentFrame++, currentFrame);
    		}

    		if (currentFrame >= 40 && currentFrame <= 80) {
    			$$invalidate(1, temp--, temp);
    		} else if (currentFrame > 150 && currentFrame < 200) {
    			$$invalidate(1, temp -= 0.3);
    		} else {
    			$$invalidate(1, temp += 0.5);
    		}

    		$$invalidate(1, temp = Math.round(temp));
    	};

    	const pauseAnimation = () => {
    		animationPaused = true;
    	};

    	const startAnimation = () => {
    		animationPaused = false;
    	};

    	const updateCurrentFrame = frame => {
    		$$invalidate(0, currentFrame = frame);
    	};

    	var intervalTimer = setInterval(incrementFrame, FRAME_RATE);

    	// EventInfoBox
    	let eventDetails = {
    		date: "June 20th 2019",
    		title: "Government Bans Raw Coal",
    		text: "The government bans the burning of raw coal within the city limits. The ban does not apply to power plants.",
    		source: "https://breathemongolia.org/",
    		imgSource: "./banRawCoal.jpg"
    	};

    	const writable_props = [];

    	Object.keys($$props).forEach(key => {
    		if (!~writable_props.indexOf(key) && key.slice(0, 2) !== "$$") console.warn(`<ComponentLibrary> was created with unknown prop '${key}'`);
    	});

    	let { $$slots = {}, $$scope } = $$props;
    	validate_slots("ComponentLibrary", $$slots, []);

    	$$self.$capture_state = () => ({
    		Scrubber,
    		EventInfoBox,
    		Thermometer,
    		FRAME_RATE,
    		nFrames,
    		currentFrame,
    		animationPaused,
    		temp,
    		incrementFrame,
    		pauseAnimation,
    		startAnimation,
    		updateCurrentFrame,
    		intervalTimer,
    		eventDetails
    	});

    	$$self.$inject_state = $$props => {
    		if ("nFrames" in $$props) nFrames = $$props.nFrames;
    		if ("currentFrame" in $$props) $$invalidate(0, currentFrame = $$props.currentFrame);
    		if ("animationPaused" in $$props) animationPaused = $$props.animationPaused;
    		if ("temp" in $$props) $$invalidate(1, temp = $$props.temp);
    		if ("incrementFrame" in $$props) incrementFrame = $$props.incrementFrame;
    		if ("intervalTimer" in $$props) intervalTimer = $$props.intervalTimer;
    		if ("eventDetails" in $$props) $$invalidate(5, eventDetails = $$props.eventDetails);
    	};

    	if ($$props && "$$inject" in $$props) {
    		$$self.$inject_state($$props.$$inject);
    	}

    	return [
    		currentFrame,
    		temp,
    		pauseAnimation,
    		startAnimation,
    		updateCurrentFrame,
    		eventDetails
    	];
    }

    class ComponentLibrary extends SvelteComponentDev {
    	constructor(options) {
    		super(options);
    		init(this, options, instance$4, create_fragment$4, safe_not_equal, {});

    		dispatch_dev("SvelteRegisterComponent", {
    			component: this,
    			tagName: "ComponentLibrary",
    			options,
    			id: create_fragment$4.name
    		});
    	}
    }

    const app = new ComponentLibrary({
      target: document.body
    });

    return app;

}());
//# sourceMappingURL=bundle.js.map
