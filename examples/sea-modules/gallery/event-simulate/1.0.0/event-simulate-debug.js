/**
 * 模拟事件
 * @refer https://github.com/yui/yui3/raw/master/src/event-simulate/js/event-simulate.js
 */
define("gallery/event-simulate/1.0.0/event-simulate-debug", [ "$-debug" ], function(require, exports) {
    "use strict";
    var $ = require("$-debug"), UA = $.browser;
    // shortcuts
    var toString = Object.prototype.toString, isFunction = function(o) {
        return toString.call(o) === "[object Function]";
    }, isString = function(o) {
        return toString.call(o) === "[object String]";
    }, isBoolean = function(o) {
        return toString.call(o) === "[object Boolean]";
    }, isObject = function(o) {
        return o === Object(o);
    }, isNumber = function(o) {
        return toString.call(o) === "[object Number]";
    }, doc = document, win = window, mix = function(r, s) {
        for (var p in s) {
            r[p] = s[p];
        }
    }, // mouse events supported
    mouseEvents = {
        click: 1,
        dblclick: 1,
        mouseover: 1,
        mouseout: 1,
        mouseenter: 1,
        mouseleave: 1,
        mousedown: 1,
        mouseup: 1,
        mousemove: 1
    }, msPointerEvents = {
        MSPointerOver: 1,
        MSPointerOut: 1,
        MSPointerDown: 1,
        MSPointerUp: 1,
        MSPointerMove: 1
    }, // key events supported
    keyEvents = {
        keydown: 1,
        keyup: 1,
        keypress: 1
    }, // HTML events supported
    uiEvents = {
        submit: 1,
        blur: 1,
        change: 1,
        focus: 1,
        resize: 1,
        scroll: 1,
        select: 1
    }, // events that bubble by default
    bubbleEvents = {
        scroll: 1,
        resize: 1,
        reset: 1,
        submit: 1,
        change: 1,
        select: 1,
        error: 1,
        abort: 1
    }, // touch events supported
    touchEvents = {
        touchstart: 1,
        touchmove: 1,
        touchend: 1,
        touchcancel: 1
    }, gestureEvents = {
        gesturestart: 1,
        gesturechange: 1,
        gestureend: 1
    };
    // all key and mouse events bubble
    mix(bubbleEvents, mouseEvents);
    mix(bubbleEvents, keyEvents);
    mix(bubbleEvents, touchEvents);
    /*
     * Simulates a key event using the given event information to populate
     * the generated event object. This method does browser-equalizing
     * calculations to account for differences in the DOM and IE event models
     * as well as different browser quirks. Note: keydown causes Safari 2.x to
     * crash.
     * @method simulateKeyEvent
     * @private
     * @static
     * @param {HTMLElement} target The target of the given event.
     * @param {String} type The type of event to fire. This can be any one of
     *      the following: keyup, keydown, and keypress.
     * @param {Boolean} bubbles (Optional) Indicates if the event can be
     *      bubbled up. DOM Level 3 specifies that all key events bubble by
     *      default. The default is true.
     * @param {Boolean} cancelable (Optional) Indicates if the event can be
     *      canceled using preventDefault(). DOM Level 3 specifies that all
     *      key events can be cancelled. The default
     *      is true.
     * @param {Window} view (Optional) The view containing the target. This is
     *      typically the window object. The default is window.
     * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
     *      is pressed while the event is firing. The default is false.
     * @param {int} keyCode (Optional) The code for the key that is in use.
     *      The default is 0.
     * @param {int} charCode (Optional) The Unicode code for the character
     *      associated with the key being used. The default is 0.
     */
    function simulateKeyEvent(target, type, bubbles, cancelable, view, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode) {
        // check target
        if (!target) {
            throw "simulateKeyEvent(): Invalid target.";
        }
        // check event type
        if (isString(type)) {
            type = type.toLowerCase();
            switch (type) {
              case "textevent":
                //DOM Level 3
                type = "keypress";
                break;

              case "keyup":
              case "keydown":
              case "keypress":
                break;

              default:
                throw "simulateKeyEvent(): Event type " + type + " not supported.";
            }
        } else {
            throw "simulateKeyEvent(): Event type must be a string.";
        }
        // setup default values
        if (!isBoolean(bubbles)) {
            bubbles = true;
        }
        if (!isBoolean(cancelable)) {
            cancelable = true;
        }
        if (!isObject(view)) {
            view = window;
        }
        if (!isBoolean(ctrlKey)) {
            ctrlKey = false;
        }
        if (!isBoolean(altKey)) {
            altKey = false;
        }
        if (!isBoolean(shiftKey)) {
            shiftKey = false;
        }
        if (!isBoolean(metaKey)) {
            metaKey = false;
        }
        if (!isNumber(keyCode)) {
            keyCode = 0;
        }
        if (!isNumber(charCode)) {
            charCode = 0;
        }
        // try to create a mouse event
        var customEvent = null;
        // check for DOM-compliant browsers first
        if (isFunction(doc.createEvent)) {
            try {
                // try to create key event
                customEvent = doc.createEvent("KeyEvents");
                /*
                 * Interesting problem: Firefox implemented a non-standard
                 * version of initKeyEvent() based on DOM Level 2 specs.
                 * Key event was removed from DOM Level 2 and re-introduced
                 * in DOM Level 3 with a different interface. Firefox is the
                 * only browser with any implementation of Key Events, so for
                 * now, assume it's Firefox if the above line doesn't error.
                 */
                // @TODO: Decipher between Firefox's implementation and a correct one.
                customEvent.initKeyEvent(type, bubbles, cancelable, view, ctrlKey, altKey, shiftKey, metaKey, keyCode, charCode);
            } catch (ex) {
                /*
                 * If it got here, that means key events aren't officially supported.
                 * Safari/WebKit is a real problem now. WebKit 522 won't let you
                 * set keyCode, charCode, or other properties if you use a
                 * UIEvent, so we first must try to create a generic event. The
                 * fun part is that this will throw an error on Safari 2.x. The
                 * end result is that we need another try...catch statement just to
                 * deal with this mess.
                 */
                try {
                    //try to create generic event - will fail in Safari 2.x
                    customEvent = doc.createEvent("Events");
                } catch (uierror) {
                    //the above failed, so create a UIEvent for Safari 2.x
                    customEvent = doc.createEvent("UIEvents");
                } finally {
                    customEvent.initEvent(type, bubbles, cancelable);
                    //initialize
                    customEvent.view = view;
                    customEvent.altKey = altKey;
                    customEvent.ctrlKey = ctrlKey;
                    customEvent.shiftKey = shiftKey;
                    customEvent.metaKey = metaKey;
                    customEvent.keyCode = keyCode;
                    customEvent.charCode = charCode;
                }
            }
            //fire the event
            target.dispatchEvent(customEvent);
        } else if (isObject(doc.createEventObject)) {
            //IE
            //create an IE event object
            customEvent = doc.createEventObject();
            //assign available properties
            customEvent.bubbles = bubbles;
            customEvent.cancelable = cancelable;
            customEvent.view = view;
            customEvent.ctrlKey = ctrlKey;
            customEvent.altKey = altKey;
            customEvent.shiftKey = shiftKey;
            customEvent.metaKey = metaKey;
            /*
             * IE doesn't support charCode explicitly. CharCode should
             * take precedence over any keyCode value for accurate
             * representation.
             */
            customEvent.keyCode = charCode > 0 ? charCode : keyCode;
            //fire the event
            target.fireEvent("on" + type, customEvent);
        } else {
            throw "simulateKeyEvent(): No event simulation framework present.";
        }
    }
    /*
     * Simulates a mouse event using the given event information to populate
     * the generated event object. This method does browser-equalizing
     * calculations to account for differences in the DOM and IE event models
     * as well as different browser quirks.
     * @method simulateMouseEvent
     * @private
     * @static
     * @param {HTMLElement} target The target of the given event.
     * @param {String} type The type of event to fire. This can be any one of
     *      the following: click, dblclick, mousedown, mouseup, mouseout,
     *      mouseover, and mousemove.
     * @param {Boolean} bubbles (Optional) Indicates if the event can be
     *      bubbled up. DOM Level 2 specifies that all mouse events bubble by
     *      default. The default is true.
     * @param {Boolean} cancelable (Optional) Indicates if the event can be
     *      canceled using preventDefault(). DOM Level 2 specifies that all
     *      mouse events except mousemove can be cancelled. The default
     *      is true for all events except mousemove, for which the default
     *      is false.
     * @param {Window} view (Optional) The view containing the target. This is
     *      typically the window object. The default is window.
     * @param {int} detail (Optional) The number of times the mouse button has
     *      been used. The default value is 1.
     * @param {int} screenX (Optional) The x-coordinate on the screen at which
     *      point the event occured. The default is 0.
     * @param {int} screenY (Optional) The y-coordinate on the screen at which
     *      point the event occured. The default is 0.
     * @param {int} clientX (Optional) The x-coordinate on the client at which
     *      point the event occured. The default is 0.
     * @param {int} clientY (Optional) The y-coordinate on the client at which
     *      point the event occured. The default is 0.
     * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
     *      is pressed while the event is firing. The default is false.
     * @param {int} button (Optional) The button being pressed while the event
     *      is executing. The value should be 0 for the primary mouse button
     *      (typically the left button), 1 for the terciary mouse button
     *      (typically the middle button), and 2 for the secondary mouse button
     *      (typically the right button). The default is 0.
     * @param {HTMLElement} relatedTarget (Optional) For mouseout events,
     *      this is the element that the mouse has moved to. For mouseover
     *      events, this is the element that the mouse has moved from. This
     *      argument is ignored for all other events. The default is null.
     */
    function simulateMouseEvent(target, type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget) {
        // check target
        if (!target) {
            throw "simulateMouseEvent(): Invalid target.";
        }
        // check event type
        if (isString(type)) {
            // make sure it's a supported mouse event or an msPointerEvent. 
            if (!mouseEvents[type.toLowerCase()] && !msPointerEvents[type]) {
                throw "simulateMouseEvent(): Event type " + type + " not supported.";
            }
        } else {
            throw "simulateMouseEvent(): Event type must be a string.";
        }
        // setup default values
        if (!isBoolean(bubbles)) {
            bubbles = true;
        }
        if (!isBoolean(cancelable)) {
            cancelable = type !== "mousemove";
        }
        if (!isObject(view)) {
            view = window;
        }
        if (!isNumber(detail)) {
            detail = 1;
        }
        if (!isNumber(screenX)) {
            screenX = 0;
        }
        if (!isNumber(screenY)) {
            screenY = 0;
        }
        if (!isNumber(clientX)) {
            clientX = 0;
        }
        if (!isNumber(clientY)) {
            clientY = 0;
        }
        if (!isBoolean(ctrlKey)) {
            ctrlKey = false;
        }
        if (!isBoolean(altKey)) {
            altKey = false;
        }
        if (!isBoolean(shiftKey)) {
            shiftKey = false;
        }
        if (!isBoolean(metaKey)) {
            metaKey = false;
        }
        if (!isNumber(button)) {
            button = 0;
        }
        relatedTarget = relatedTarget || null;
        // try to create a mouse event
        var customEvent = null;
        // check for DOM-compliant browsers first
        if (isFunction(doc.createEvent)) {
            customEvent = doc.createEvent("MouseEvents");
            // Safari 2.x (WebKit 418) still doesn't implement initMouseEvent()
            if (customEvent.initMouseEvent) {
                customEvent.initMouseEvent(type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, button, relatedTarget);
            } else {
                //Safari
                // the closest thing available in Safari 2.x is UIEvents
                customEvent = doc.createEvent("UIEvents");
                customEvent.initEvent(type, bubbles, cancelable);
                customEvent.view = view;
                customEvent.detail = detail;
                customEvent.screenX = screenX;
                customEvent.screenY = screenY;
                customEvent.clientX = clientX;
                customEvent.clientY = clientY;
                customEvent.ctrlKey = ctrlKey;
                customEvent.altKey = altKey;
                customEvent.metaKey = metaKey;
                customEvent.shiftKey = shiftKey;
                customEvent.button = button;
                customEvent.relatedTarget = relatedTarget;
            }
            /*
             * Check to see if relatedTarget has been assigned. Firefox
             * versions less than 2.0 don't allow it to be assigned via
             * initMouseEvent() and the property is readonly after event
             * creation, so in order to keep .relatedTarget
             * working, assign to the IE proprietary toElement property
             * for mouseout event and fromElement property for mouseover
             * event.
             */
            if (relatedTarget && !customEvent.relatedTarget) {
                if (type === "mouseout") {
                    customEvent.toElement = relatedTarget;
                } else if (type === "mouseover") {
                    customEvent.fromElement = relatedTarget;
                }
            }
            // fire the event
            target.dispatchEvent(customEvent);
        } else if (isObject(doc.createEventObject)) {
            //IE
            // create an IE event object
            customEvent = doc.createEventObject();
            // assign available properties
            customEvent.bubbles = bubbles;
            customEvent.cancelable = cancelable;
            customEvent.view = view;
            customEvent.detail = detail;
            customEvent.screenX = screenX;
            customEvent.screenY = screenY;
            customEvent.clientX = clientX;
            customEvent.clientY = clientY;
            customEvent.ctrlKey = ctrlKey;
            customEvent.altKey = altKey;
            customEvent.metaKey = metaKey;
            customEvent.shiftKey = shiftKey;
            // fix button property for IE's wacky implementation
            switch (button) {
              case 0:
                customEvent.button = 1;
                break;

              case 1:
                customEvent.button = 4;
                break;

              case 2:
                //leave as is
                break;

              default:
                customEvent.button = 0;
            }
            /*
             * Have to use relatedTarget because IE won't allow assignment
             * to toElement or fromElement on generic events. This keeps
             * .relatedTarget.
             */
            customEvent.relatedTarget = relatedTarget;
            //fire the event
            target.fireEvent("on" + type, customEvent);
        } else {
            throw "simulateMouseEvent(): No event simulation framework present.";
        }
    }
    /*
     * Simulates a UI event using the given event information to populate
     * the generated event object. This method does browser-equalizing
     * calculations to account for differences in the DOM and IE event models
     * as well as different browser quirks.
     * @method simulateHTMLEvent
     * @private
     * @static
     * @param {HTMLElement} target The target of the given event.
     * @param {String} type The type of event to fire. This can be any one of
     *      the following: click, dblclick, mousedown, mouseup, mouseout,
     *      mouseover, and mousemove.
     * @param {Boolean} bubbles (Optional) Indicates if the event can be
     *      bubbled up. DOM Level 2 specifies that all mouse events bubble by
     *      default. The default is true.
     * @param {Boolean} cancelable (Optional) Indicates if the event can be
     *      canceled using preventDefault(). DOM Level 2 specifies that all
     *      mouse events except mousemove can be cancelled. The default
     *      is true for all events except mousemove, for which the default
     *      is false.
     * @param {Window} view (Optional) The view containing the target. This is
     *      typically the window object. The default is window.
     * @param {int} detail (Optional) The number of times the mouse button has
     *      been used. The default value is 1.
     */
    function simulateUIEvent(target, type, bubbles, cancelable, view, detail) {
        // check target
        if (!target) {
            throw "simulateUIEvent(): Invalid target.";
        }
        // check event type
        if (isString(type)) {
            type = type.toLowerCase();
            // make sure it's a supported mouse event
            if (!uiEvents[type]) {
                throw "simulateUIEvent(): Event type '" + type + "' not supported.";
            }
        } else {
            throw "simulateUIEvent(): Event type must be a string.";
        }
        //try to create a mouse event
        var customEvent = null;
        //setup default values
        if (!isBoolean(bubbles)) {
            bubbles = type in bubbleEvents;
        }
        if (!isBoolean(cancelable)) {
            cancelable = type === "submit";
        }
        if (!isObject(view)) {
            view = window;
        }
        if (!isNumber(detail)) {
            detail = 1;
        }
        // check for DOM-compliant browsers first
        if (isFunction(doc.createEvent)) {
            //just a generic UI Event object is needed
            customEvent = doc.createEvent("UIEvents");
            customEvent.initUIEvent(type, bubbles, cancelable, view, detail);
            //fire the event
            target.dispatchEvent(customEvent);
        } else if (isObject(doc.createEventObject)) {
            //IE
            // create an IE event object
            customEvent = doc.createEventObject();
            // assign available properties
            customEvent.bubbles = bubbles;
            customEvent.cancelable = cancelable;
            customEvent.view = view;
            customEvent.detail = detail;
            // fire the event
            target.fireEvent("on" + type, customEvent);
        } else {
            throw "simulateUIEvent(): No event simulation framework present.";
        }
    }
    /*
     * (iOS only) This is for creating native DOM gesture events which only iOS
     * v2.0+ is supporting.
     * 
     * @method simulateGestureEvent
     * @private
     * @param {HTMLElement} target The target of the given event.
     * @param {String} type The type of event to fire. This can be any one of
     *      the following: touchstart, touchmove, touchend, touchcancel.
     * @param {Boolean} bubbles (Optional) Indicates if the event can be
     *      bubbled up. DOM Level 2 specifies that all mouse events bubble by
     *      default. The default is true.
     * @param {Boolean} cancelable (Optional) Indicates if the event can be
     *      canceled using preventDefault(). DOM Level 2 specifies that all
     *      touch events except touchcancel can be cancelled. The default
     *      is true for all events except touchcancel, for which the default
     *      is false.
     * @param {Window} view (Optional) The view containing the target. This is
     *      typically the window object. The default is window.
     * @param {int} detail (Optional) Specifies some detail information about 
     *      the event depending on the type of event.
     * @param {int} screenX (Optional) The x-coordinate on the screen at which
     *      point the event occured. The default is 0.
     * @param {int} screenY (Optional) The y-coordinate on the screen at which
     *      point the event occured. The default is 0.
     * @param {int} clientX (Optional) The x-coordinate on the client at which
     *      point the event occured. The default is 0.
     * @param {int} clientY (Optional) The y-coordinate on the client at which
     *      point the event occured. The default is 0.
     * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
     *      is pressed while the event is firing. The default is false. 
     * @param {float} scale (iOS v2+ only) The distance between two fingers 
     *      since the start of an event as a multiplier of the initial distance. 
     *      The default value is 1.0.
     * @param {float} rotation (iOS v2+ only) The delta rotation since the start 
     *      of an event, in degrees, where clockwise is positive and 
     *      counter-clockwise is negative. The default value is 0.0.   
     */
    function simulateGestureEvent(target, type, bubbles, // boolean
    cancelable, // boolean
    view, // DOMWindow
    detail, // long
    screenX, screenY, // long
    clientX, clientY, // long
    ctrlKey, altKey, shiftKey, metaKey, // boolean
    scale, // float
    rotation) {
        var customEvent;
        if (!UA.ios || UA.ios < 2) {
            throw "simulateGestureEvent(): Native gesture DOM eventframe is not available in this platform.";
        }
        // check taget    
        if (!target) {
            throw "simulateGestureEvent(): Invalid target.";
        }
        // check event type
        if (isString(type)) {
            type = type.toLowerCase();
            //make sure it's a supported touch event
            if (!gestureEvents[type]) {
                throw "simulateTouchEvent(): Event type '" + type + "' not supported.";
            }
        } else {
            throw "simulateGestureEvent(): Event type must be a string.";
        }
        // setup default values
        if (isBoolean(bubbles)) {
            bubbles = true;
        }
        // bubble by default
        if (isBoolean(cancelable)) {
            cancelable = true;
        }
        if (isObject(view)) {
            view = window;
        }
        if (isNumber(detail)) {
            detail = 2;
        }
        // usually not used.
        if (isNumber(screenX)) {
            screenX = 0;
        }
        if (isNumber(screenY)) {
            screenY = 0;
        }
        if (isNumber(clientX)) {
            clientX = 0;
        }
        if (isNumber(clientY)) {
            clientY = 0;
        }
        if (isBoolean(ctrlKey)) {
            ctrlKey = false;
        }
        if (isBoolean(altKey)) {
            altKey = false;
        }
        if (isBoolean(shiftKey)) {
            shiftKey = false;
        }
        if (isBoolean(metaKey)) {
            metaKey = false;
        }
        if (isNumber(scale)) {
            scale = 1;
        }
        if (isNumber(rotation)) {
            rotation = 0;
        }
        customEvent = doc.createEvent("GestureEvent");
        customEvent.initGestureEvent(type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, target, scale, rotation);
        target.dispatchEvent(customEvent);
    }
    /*
     * @method simulateTouchEvent
     * @private
     * @param {HTMLElement} target The target of the given event.
     * @param {String} type The type of event to fire. This can be any one of
     *      the following: touchstart, touchmove, touchend, touchcancel.
     * @param {Boolean} bubbles (Optional) Indicates if the event can be
     *      bubbled up. DOM Level 2 specifies that all mouse events bubble by
     *      default. The default is true.
     * @param {Boolean} cancelable (Optional) Indicates if the event can be
     *      canceled using preventDefault(). DOM Level 2 specifies that all
     *      touch events except touchcancel can be cancelled. The default
     *      is true for all events except touchcancel, for which the default
     *      is false.
     * @param {Window} view (Optional) The view containing the target. This is
     *      typically the window object. The default is window.
     * @param {int} detail (Optional) Specifies some detail information about 
     *      the event depending on the type of event.
     * @param {int} screenX (Optional) The x-coordinate on the screen at which
     *      point the event occured. The default is 0.
     * @param {int} screenY (Optional) The y-coordinate on the screen at which
     *      point the event occured. The default is 0.
     * @param {int} clientX (Optional) The x-coordinate on the client at which
     *      point the event occured. The default is 0.
     * @param {int} clientY (Optional) The y-coordinate on the client at which
     *      point the event occured. The default is 0.
     * @param {Boolean} ctrlKey (Optional) Indicates if one of the CTRL keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} altKey (Optional) Indicates if one of the ALT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} shiftKey (Optional) Indicates if one of the SHIFT keys
     *      is pressed while the event is firing. The default is false.
     * @param {Boolean} metaKey (Optional) Indicates if one of the META keys
     *      is pressed while the event is firing. The default is false. 
     * @param {TouchList} touches A collection of Touch objects representing 
     *      all touches associated with this event.
     * @param {TouchList} targetTouches A collection of Touch objects 
     *      representing all touches associated with this target.
     * @param {TouchList} changedTouches A collection of Touch objects 
     *      representing all touches that changed in this event.
     * @param {float} scale (iOS v2+ only) The distance between two fingers 
     *      since the start of an event as a multiplier of the initial distance. 
     *      The default value is 1.0.
     * @param {float} rotation (iOS v2+ only) The delta rotation since the start 
     *      of an event, in degrees, where clockwise is positive and 
     *      counter-clockwise is negative. The default value is 0.0.   
     */
    function simulateTouchEvent(target, type, bubbles, // boolean
    cancelable, // boolean
    view, // DOMWindow
    detail, // long
    screenX, screenY, // long
    clientX, clientY, // long
    ctrlKey, altKey, shiftKey, metaKey, // boolean
    touches, // TouchList
    targetTouches, // TouchList
    changedTouches, // TouchList
    scale, // float
    rotation) {
        var customEvent;
        // check taget    
        if (!target) {
            throw "simulateTouchEvent(): Invalid target.";
        }
        // check event type
        if (isString(type)) {
            type = type.toLowerCase();
            // make sure it's a supported touch event
            if (!touchEvents[type]) {
                throw "simulateTouchEvent(): Event type '" + type + "' not supported.";
            }
        } else {
            throw "simulateTouchEvent(): Event type must be a string.";
        }
        // note that the caller is responsible to pass appropriate touch objects.
        // check touch objects
        // Android(even 4.0) doesn't define TouchList yet
        /*if(type === 'touchstart' || type === 'touchmove') {
            if(!touches instanceof TouchList) {
                throw 'simulateTouchEvent(): Invalid touches. It must be a TouchList';
            } else {
                if(touches.length === 0) {
                    throw 'simulateTouchEvent(): No touch object found.';
                }
            }
        } else if(type === 'touchend') {
            if(!changedTouches instanceof TouchList) {
                throw 'simulateTouchEvent(): Invalid touches. It must be a TouchList';
            } else {
                if(changedTouches.length === 0) {
                    throw 'simulateTouchEvent(): No touch object found.');
                }
            }
        }*/
        if (type === "touchstart" || type === "touchmove") {
            if (touches.length === 0) {
                throw "simulateTouchEvent(): No touch object in touches";
            }
        } else if (type === "touchend") {
            if (changedTouches.length === 0) {
                throw "simulateTouchEvent(): No touch object in changedTouches";
            }
        }
        // setup default values
        if (!isBoolean(bubbles)) {
            bubbles = true;
        }
        // bubble by default.
        if (!isBoolean(cancelable)) {
            cancelable = type !== "touchcancel";
        }
        if (!isObject(view)) {
            view = window;
        }
        if (!isNumber(detail)) {
            detail = 1;
        }
        // usually not used. defaulted to # of touch objects.
        if (!isNumber(screenX)) {
            screenX = 0;
        }
        if (!isNumber(screenY)) {
            screenY = 0;
        }
        if (!isNumber(clientX)) {
            clientX = 0;
        }
        if (!isNumber(clientY)) {
            clientY = 0;
        }
        if (!isBoolean(ctrlKey)) {
            ctrlKey = false;
        }
        if (!isBoolean(altKey)) {
            altKey = false;
        }
        if (!isBoolean(shiftKey)) {
            shiftKey = false;
        }
        if (!isBoolean(metaKey)) {
            metaKey = false;
        }
        if (!isNumber(scale)) {
            scale = 1;
        }
        if (!isNumber(rotation)) {
            rotation = 0;
        }
        // check for DOM-compliant browsers first
        if (isFunction(doc.createEvent)) {
            if (UA.android) {
                /*
                    * Couldn't find android start version that supports touch event. 
                    * Assumed supported(btw APIs broken till icecream sandwitch) 
                    * from the beginning.
                */
                if (UA.android < 4) {
                    /*
                        * Touch APIs are broken in androids older than 4.0. We will use 
                        * simulated touch apis for these versions. 
                        * App developer still can listen for touch events. This events
                        * will be dispatched with touch event types.
                        * 
                        * (Note) Used target for the relatedTarget. Need to verify if
                        * it has a side effect.
                    */
                    customEvent = doc.createEvent("MouseEvents");
                    customEvent.initMouseEvent(type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, 0, target);
                    customEvent.touches = touches;
                    customEvent.targetTouches = targetTouches;
                    customEvent.changedTouches = changedTouches;
                } else {
                    customEvent = doc.createEvent("TouchEvent");
                    // Andoroid isn't compliant W3C initTouchEvent method signature.
                    customEvent.initTouchEvent(touches, targetTouches, changedTouches, type, view, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey);
                }
            } else if (UA.ios) {
                if (UA.ios >= 2) {
                    customEvent = doc.createEvent("TouchEvent");
                    // Available iOS 2.0 and later
                    customEvent.initTouchEvent(type, bubbles, cancelable, view, detail, screenX, screenY, clientX, clientY, ctrlKey, altKey, shiftKey, metaKey, touches, targetTouches, changedTouches, scale, rotation);
                } else {
                    throw "simulateTouchEvent(): No touch event simulation framework present for iOS, " + UA.ios + ".";
                }
            } else {
                throw "simulateTouchEvent(): Not supported agent yet, " + UA.userAgent;
            }
            // fire the event
            target.dispatchEvent(customEvent);
        } else {
            throw "simulateTouchEvent(): No event simulation framework present.";
        }
    }
    /**
     * Simulates the event or gesture with the given name on a target.
     * @param {HTMLElement} target The DOM element that's the target of the event.
     * @param {String} type The type of event or name of the supported gesture to simulate 
     *      (i.e., "click", "doubletap", "flick").
     * @param {Object} options (Optional) Extra options to copy onto the event object. 
     *      For gestures, options are used to refine the gesture behavior.
     * @return {void}
     * @for Event
     * @method simulate
     * @static
     */
    exports.simulate = function(target, type, options) {
        if (target[0]) {
            target = target[0];
        }
        options = options || {};
        if (mouseEvents[type] || msPointerEvents[type]) {
            simulateMouseEvent(target, type, options.bubbles, options.cancelable, options.view, options.detail, options.screenX, options.screenY, options.clientX, options.clientY, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, options.relatedTarget);
        } else if (keyEvents[type]) {
            simulateKeyEvent(target, type, options.bubbles, options.cancelable, options.view, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.keyCode, options.charCode);
        } else if (uiEvents[type]) {
            simulateUIEvent(target, type, options.bubbles, options.cancelable, options.view, options.detail);
        } else if (touchEvents[type]) {
            if (window && "ontouchstart" in window && !UA.phantomjs && !(UA.chrome && UA.chrome < 6)) {
                simulateTouchEvent(target, type, options.bubbles, options.cancelable, options.view, options.detail, options.screenX, options.screenY, options.clientX, options.clientY, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.touches, options.targetTouches, options.changedTouches, options.scale, options.rotation);
            } else {
                throw "simulate(): Event " + type + " can't be simulated. Use gesture-simulate module instead.";
            }
        } else if (UA.ios && UA.ios >= 2 && gestureEvents[type]) {
            simulateGestureEvent(target, type, options.bubbles, options.cancelable, options.view, options.detail, options.screenX, options.screenY, options.clientX, options.clientY, options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.scale, options.rotation);
        } else {
            throw "simulate(): Event '" + type + "' can't be simulated.";
        }
    };
});
