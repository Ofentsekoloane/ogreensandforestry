// SmoothScroll for websites v1.2.1
// Licensed under the terms of the MIT license.



(function () {
    // Scroll Variables (tweakable)
    const defaultOptions = {
        frameRate: 150, // [Hz]
        animationTime: 400, // [px]
        stepSize: 120, // [px]
        pulseAlgorithm: true,
        pulseScale: 8,
        pulseNormalize: 1,
        accelerationDelta: 20, // 20
        accelerationMax: 1, // 1
        keyboardSupport: true, // option
        arrowScroll: 50, // [px]
        touchpadSupport: true,
        fixedBackground: true,
        excluded: ""
    };

    let options = defaultOptions;
    let isExcluded = false;
    let isFrame = false;
    let direction = { x: 0, y: 0 };
    let initDone = false;
    let root = document.documentElement;
    let activeElement;
    let observer;
    let deltaBuffer = [120, 120, 120];
    const key = {
        left: 37,
        up: 38,
        right: 39,
        down: 40,
        spacebar: 32,
        pageup: 33,
        pagedown: 34,
        end: 35,
        home: 36
    };

    // SETTINGS
    options = defaultOptions;

    // INITIALIZE
    const initTest = () => {
        const disableKeyboard = false;
        if (disableKeyboard) {
            removeEvent("keydown", keydown);
        }
        if (options.keyboardSupport && !disableKeyboard) {
            addEvent("keydown", keydown);
        }
    };

    const init = () => {
        if (!document.body) return;
        const body = document.body;
        const html = document.documentElement;
        const windowHeight = window.innerHeight;
        const scrollHeight = body.scrollHeight;
        root = document.compatMode.indexOf("CSS") >= 0 ? html : body;
        activeElement = body;
        initTest();
        initDone = true;
        if (top !== self) {
            isFrame = true;
        } else if (
            scrollHeight > windowHeight &&
            (body.offsetHeight <= windowHeight || html.offsetHeight <= windowHeight)
        ) {
            html.style.height = "auto";
            if (typeof window.requestAnimationFrame === "function") {
                window.requestAnimationFrame(() => {
                    if (typeof refresh === "function") refresh();
                });
            } else {
                setTimeout(() => {
                    if (typeof refresh === "function") refresh();
                }, 16);
            }
            if (root.offsetHeight <= windowHeight) {
                const underlay = document.createElement("div");
                underlay.style.clear = "both";
                underlay.className = "smoothscroll-underlay";
                body.appendChild(underlay);
            }
        }
        if (!options.fixedBackground && !isExcluded) {
            body.style.backgroundAttachment = "scroll";
            html.style.backgroundAttachment = "scroll";
        }
    };


/************************************************
 * SCROLLING 
 ************************************************/
 
    let que = [];
    let pending = false;
    let lastScroll = Date.now();

    // Pushes scroll actions to the scrolling queue.
    const scrollArray = (elem, left, top, delay = 1000) => {
        directionCheck(left, top);
        if (options.accelerationMax !== 1) {
            const now = Date.now();
            const elapsed = now - lastScroll;
            if (elapsed < options.accelerationDelta) {
                let factor = (1 + 30 / elapsed) / 2;
                if (factor > 1) {
                    factor = Math.min(factor, options.accelerationMax);
                    left *= factor;
                    top *= factor;
                }
            }
            lastScroll = Date.now();
        }
        que.push({
            x: left,
            y: top,
            lastX: left < 0 ? 0.99 : -0.99,
            lastY: top < 0 ? 0.99 : -0.99,
            start: Date.now()
        });
        if (pending) return;
        const scrollWindow = elem === document.body;
        const step = (time) => {
            const now = Date.now();
            let scrollX = 0;
            let scrollY = 0;
            for (let i = 0; i < que.length; i++) {
                const item = que[i];
                const elapsed = now - item.start;
                const finished = elapsed >= options.animationTime;
                let position = finished ? 1 : elapsed / options.animationTime;
                if (options.pulseAlgorithm) {
                    position = pulse(position);
                }
                const x = (item.x * position - item.lastX) >> 0;
                const y = (item.y * position - item.lastY) >> 0;
                scrollX += x;
                scrollY += y;
                item.lastX += x;
                item.lastY += y;
                if (finished) {
                    que.splice(i, 1);
                    i--;
                }
            }
            if (scrollWindow) {
                window.scrollBy(scrollX, scrollY);
            } else {
                if (scrollX) elem.scrollLeft += scrollX;
                if (scrollY) elem.scrollTop += scrollY;
            }
            if (!left && !top) {
                que = [];
            }
            if (que.length) {
                requestFrame(step, elem, delay / options.frameRate + 1);
            } else {
                pending = false;
            }
        };
        requestFrame(step, elem, 0);
        pending = true;
    };


/***********************************************
 * EVENTS
 ***********************************************/

/**
 * Mouse wheel handler.
 * @param {Object} event
 */
    const wheel = (event) => {
        if (!initDone) {
            init();
        }
        const target = event.target;
        const overflowing = overflowingAncestor(target);
        if (
            !overflowing ||
            event.defaultPrevented ||
            isNodeName(activeElement, "embed") ||
            (isNodeName(target, "embed") && /\.pdf/i.test(target.src))
        ) {
            return true;
        }
        let deltaX = event.wheelDeltaX || 0;
        let deltaY = event.wheelDeltaY || 0;
        if (!deltaX && !deltaY) {
            deltaY = event.wheelDelta || 0;
        }
        if (!options.touchpadSupport && isTouchpad(deltaY)) {
            return true;
        }
        if (Math.abs(deltaX) > 1.2) {
            deltaX *= options.stepSize / 120;
        }
        if (Math.abs(deltaY) > 1.2) {
            deltaY *= options.stepSize / 120;
        }
        scrollArray(overflowing, -deltaX, -deltaY);
        event.preventDefault();
    };

/**
 * Keydown event handler.
 * @param {Object} event
 */
    const keydown = (event) => {
        const target = event.target;
        const modifier =
            event.ctrlKey ||
            event.altKey ||
            event.metaKey ||
            (event.shiftKey && event.keyCode !== key.spacebar);
        if (
            /input|textarea|select|embed/i.test(target.nodeName) ||
            target.isContentEditable ||
            event.defaultPrevented ||
            modifier
        ) {
            return true;
        }
        if (isNodeName(target, "button") && event.keyCode === key.spacebar) {
            return true;
        }
        let shift, x = 0, y = 0;
        const elem = overflowingAncestor(activeElement);
        let clientHeight = elem.clientHeight;
        if (elem === document.body) {
            clientHeight = window.innerHeight;
        }
        switch (event.keyCode) {
            case key.up:
                y = -options.arrowScroll;
                break;
            case key.down:
                y = options.arrowScroll;
                break;
            case key.spacebar:
                shift = event.shiftKey ? 1 : -1;
                y = -shift * clientHeight * 0.9;
                break;
            case key.pageup:
                y = -clientHeight * 0.9;
                break;
            case key.pagedown:
                y = clientHeight * 0.9;
                break;
            case key.home:
                y = -elem.scrollTop;
                break;
            case key.end:
                const damt = elem.scrollHeight - elem.scrollTop - clientHeight;
                y = damt > 0 ? damt + 10 : 0;
                break;
            case key.left:
                x = -options.arrowScroll;
                break;
            case key.right:
                x = options.arrowScroll;
                break;
            default:
                return true;
        }
        scrollArray(elem, x, y);
        event.preventDefault();
    };

/**
 * Mousedown event only for updating activeElement
 */
    const mousedown = (event) => {
        activeElement = event.target;
    };


/***********************************************
 * OVERFLOW
 ***********************************************/
 
    let cache = {};
    setInterval(() => { cache = {}; }, 10 * 1000);
    const uniqueID = (() => {
        let i = 0;
        return (el) => {
            return el.uniqueID || (el.uniqueID = i++);
        };
    })();
    const setCache = (elems, overflowing) => {
        for (let i = elems.length; i--;) cache[uniqueID(elems[i])] = overflowing;
        return overflowing;
    };
    const overflowingAncestor = (el) => {
        const elems = [];
        const rootScrollHeight = root.scrollHeight;
        do {
            const cached = cache[uniqueID(el)];
            if (cached) {
                return setCache(elems, cached);
            }
            elems.push(el);
            if (rootScrollHeight === el.scrollHeight) {
                if (!isFrame || root.clientHeight + 10 < rootScrollHeight) {
                    return setCache(elems, document.body);
                }
            } else if (el.clientHeight + 10 < el.scrollHeight) {
                const overflow = getComputedStyle(el, "").getPropertyValue("overflow-y");
                if (overflow === "scroll" || overflow === "auto") {
                    return setCache(elems, el);
                }
            }
        } while ((el = el.parentNode));
    };


/***********************************************
 * HELPERS
 ***********************************************/

    const addEvent = (type, fn, bubble = false) => {
        window.addEventListener(type, fn, bubble);
    };
    const removeEvent = (type, fn, bubble = false) => {
        window.removeEventListener(type, fn, bubble);
    };
    const isNodeName = (el, tag) => {
        return (el.nodeName || "").toLowerCase() === tag.toLowerCase();
    };
    const directionCheck = (x, y) => {
        x = x > 0 ? 1 : -1;
        y = y > 0 ? 1 : -1;
        if (direction.x !== x || direction.y !== y) {
            direction.x = x;
            direction.y = y;
            que = [];
            lastScroll = 0;
        }
    };
    let deltaBufferTimer;
    const isTouchpad = (deltaY) => {
        if (!deltaY) return;
        deltaY = Math.abs(deltaY);
        deltaBuffer.push(deltaY);
        deltaBuffer.shift();
        clearTimeout(deltaBufferTimer);
        const allEquals = deltaBuffer[0] === deltaBuffer[1] && deltaBuffer[1] === deltaBuffer[2];
        const allDivisable =
            isDivisible(deltaBuffer[0], 120) &&
            isDivisible(deltaBuffer[1], 120) &&
            isDivisible(deltaBuffer[2], 120);
        return !(allEquals || allDivisable);
    };
    const isDivisible = (n, divisor) => {
        return Math.floor(n / divisor) === n / divisor;
    };
    const requestFrame =
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        ((callback, element, delay) => {
            window.setTimeout(callback, delay || 1000 / 60);
        });


/***********************************************
 * PULSE
 ***********************************************/
 
/**
 * Viscous fluid with a pulse for part and decay for the rest.
 * - Applies a fixed force over an interval (a damped acceleration), and
 * - Lets the exponential bleed away the velocity over a longer interval
 * - Michael Herf, http://stereopsis.com/stopping/
 */
    const pulse_ = (x) => {
        let val, start, expx;
        x = x * options.pulseScale;
        if (x < 1) {
            val = x - (1 - Math.exp(-x));
        } else {
            start = Math.exp(-1);
            x -= 1;
            expx = 1 - Math.exp(-x);
            val = start + expx * (1 - start);
        }
        return val * options.pulseNormalize;
    };
    const pulse = (x) => {
        if (x >= 1) return 1;
        if (x <= 0) return 0;
        if (options.pulseNormalize === 1) {
            options.pulseNormalize /= pulse_(1);
        }
        return pulse_(x);
    };

    const isChrome = /chrome/i.test(window.navigator.userAgent);
    const isMouseWheelSupported = "onmousewheel" in document;
    if (isMouseWheelSupported && isChrome) {
        addEvent("mousedown", mousedown);
        addEvent("mousewheel", wheel);
        addEvent("load", init);
    }
})();