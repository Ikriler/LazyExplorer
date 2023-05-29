var QueryString = function(){
  var query_string = {};
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if (typeof query_string[pair[0]] === "undefined") {
      query_string[pair[0]] = decodeURIComponent(pair[1]);
    } else if (typeof query_string[pair[0]] === "string") {
      var arr = [ query_string[pair[0]],decodeURIComponent(pair[1]) ];
      query_string[pair[0]] = arr;
    } else {
      query_string[pair[0]].push(decodeURIComponent(pair[1]));
    }
  } 
  return query_string;
}

var all_settings;
chrome.storage.local.get('settings', function (settings) {
    all_settings = settings.settings;
	if (all_settings === undefined)
		return;
	if (all_settings.recordscroll === undefined)
		return;
    if (all_settings.recordscroll) {
        window.addEventListener("scroll", function (e) {
            setTimeout(function () {
                chrome.storage.local.get('recording', function (isRecording) {
                    if (isRecording.recording) {
                        updateScrollEvent(e);
                    }
                });
            }, 1);
        }, false);
    }

    addDocumentEventListener("open"); 
    addDocumentEventListener("touchstart"); 
    addDocumentEventListener("propertychange"); 
    addDocumentEventListener("wfSubmit"); 

    if (all_settings.recordmousedown)
        addDocumentEventListener("mousedown");
    if (all_settings.recordmouseup)
        addDocumentEventListener("mouseup");
    if (all_settings.recordmouseover)
        addDocumentEventListener("mouseover");
    if (all_settings.recordmouseout)
        addDocumentEventListener("mouseout");
    if (all_settings.recordselect)
        addDocumentEventListener("select");
    if (all_settings.recordfocusin)
        addDocumentEventListener("focusin");
    if (all_settings.recordfocusout)
        addDocumentEventListener("focusout");
    if (all_settings.recordclick)
        addDocumentEventListener("click");
    if (all_settings.recordkeydown)
        addDocumentEventListener("keydown");
    if (all_settings.recordkeypress)
        addDocumentEventListener("keypress");
    if (all_settings.recordkeyup)
        addDocumentEventListener("keyup");
    if (all_settings.recordinput)
        addDocumentEventListener("input");
    if (all_settings.recordchange)
        addDocumentEventListener("change");
    addDocumentEventListener("cut");
    addDocumentEventListener("copy");
    addDocumentEventListener("paste");

    if (all_settings.suppressalerts) {
        chrome.storage.local.get('simulating', function (simulating) {
            if (simulating.simulating) {
                document.getElementsByTagName('head')[0].setAttribute('wf_suppressalerts','');
            }
        });
    }

    if (window.location.href.substring(0, 19) != "chrome-extension://" && window.location.href.substring(0, 16) != "moz-extension://" && all_settings.emulatehover) {
        var styles = document.styleSheets;
        for (var i = 0, len = styles.length; i < len; i++) {
            var rules = styles[i].cssRules;
            if (rules) {
                var newstyle = "";
                for (var j = 0; j < rules.length; j++) {
                    if (rules[j].cssText.indexOf(":hover") > -1) {
                        newstyle += rules[j].cssText.replace(/:hover/g, ".wildfire-hover") + ";";
                    }
                }
                var style_tag = document.createElement('style');
                style_tag.appendChild(document.createTextNode(newstyle));
                document.body.appendChild(style_tag);
            } else {
                loadCSSCors(styles[i].href);
            }
        }

        function loadCSSCors(stylesheet_uri) {
            var path_parts = stylesheet_uri.split('/');
            path_parts.pop();
            var relative_host_dir = path_parts.join('/') + "/";

            var _xhr = XMLHttpRequest;
            var has_cred = false;
            try {
                has_cred = _xhr && ('withCredentials' in (new _xhr()));
            } catch (e) {
            }
            if (!has_cred) {
                console.error('CORS not supported');
                return;
            }
            var xhr = new _xhr();
            xhr.open('GET', stylesheet_uri);
            xhr.onload = function () {
                xhr.onload = xhr.onerror = null;
                if (xhr.status < 200 || xhr.status >= 300) {
                    console.error('style failed to load: ' + stylesheet_uri)
                } else if (xhr.responseText.indexOf(":hover") > -1) {
                    var style_tag = document.createElement('style');
                    var newstyle = xhr.responseText.replace(/:hover/g, ".wildfire-hover");
                    newstyle = newstyle.replace(/url\((?!http|\/\/)/g, "url(" + relative_host_dir);
                    style_tag.appendChild(document.createTextNode(newstyle));
                    document.body.appendChild(style_tag);
                }
                xhr.onerror = function () {
                    xhr.onload = xhr.onerror = null;
                    console.error('XHR CORS CSS fail:' + styleURI);
                };
            };
            xhr.send();
        }
    }
});

function getFrameIndex() {
    if (window.top === window.self)
        return 0;
    for (var i=0; i<window.top.frames.length; i++) {
        if (window.top.frames[i] === window.self) {
            return i+1;
        }
    }
    return -1;
}

function processPath(elementPath) {
    if (!elementPath)
        return "";

    var numPathElements = elementPath.length;
    var path = [];
    
    uniqueEl = false;
    for (var i=0; i<numPathElements-1 && !uniqueEl; i++) {
        if (elementPath[i].id!=null && elementPath[i].id!="") {
            uniqueEl = true;
            path.push({
                uniqueId: elementPath[i].id,
                tagName: elementPath[i].tagName
            });
        } else {
            var childIndex = null;
            for (var j=0; elementPath[i].parentNode!=null && j<elementPath[i].parentNode.childNodes.length; j++) {
                if (elementPath[i].parentNode.childNodes[j]===elementPath[i]) {
                    childIndex = j;
                }
            }
            if (childIndex==null && elementPath[i]==document) {
                ;
            } else {
                path.push({
                    uniqueId: null,
                    childIndex: childIndex,
                    tagName: elementPath[i].tagName
                });
            }
        }
    }
    
    return path;
}

function getCSSPath(el, ignoreIds) {
    if (!(el instanceof Element))
        return;
    var path = [];
    while (el.nodeType === Node.ELEMENT_NODE) {
        var selector = el.nodeName.toLowerCase();
        if (el.id && !ignoreIds) {
            selector += '#' + el.id.replace( /(:|\.|\[|\]|,)/g, "\\$1" );
            path.unshift(selector);
            break;
        } else {
            var sib = el, nth = 1;
            while (sib = sib.previousElementSibling) {
                if (sib.nodeName.toLowerCase() == selector)
                    nth++;
            }
            if (nth != 1)
                selector += ":nth-of-type("+nth+")";
        }
        path.unshift(selector);
        el = el.parentNode;
        if (el == null)
            return;
    }
    return path.join(" > ");
}

function simulate(element, eventName) {
    var options = extend(defaultOptions, arguments[2] || {});
    var oEvent, eventType = null;

    if (element === undefined || element == null) {
        throw new Error('Element not found');
    }

    for (var name in eventMatchers) {
        if (eventMatchers[name].test(eventName)) { eventType = name; break; }
    }

    if (!eventType)
        throw new SyntaxError('Only HTMLEvent, MouseEvents and KeyboardEvents interfaces are supported');

    if (eventType == 'KeyboardEvents') {
        var oEvent = new KeyboardEvent(eventName, {bubbles : true, cancelable : true,
            code : String.fromCharCode(options.keyCode).toLowerCase(),
            key : String.fromCharCode(options.keyCode).toLowerCase(), shiftKey : false});
    } else {
        oEvent = document.createEvent(eventType);
        if (eventType == 'HTMLEvents') {
            oEvent.initEvent(eventName, options.bubbles, options.cancelable);
        } else {
            oEvent.initMouseEvent(eventName, options.bubbles, options.cancelable, document.defaultView,
                options.button, options.clientX, options.clientY, options.clientX, options.clientY,
                options.ctrlKey, options.altKey, options.shiftKey, options.metaKey, options.button, element);
        }
    }

    return [element.dispatchEvent(oEvent)];
}

function extend(destination, source) {
    for (var property in source)
        destination[property] = source[property];
    return destination;
}

var eventMatchers = {
    'HTMLEvents': /^(?:load|unload|abort|error|select|change|submit|reset|focus|blur|resize|scroll)$/,
    'MouseEvents': /^(?:click|dblclick|mouse(?:down|up|over|move|out))$/,
    'KeyboardEvents': /^(?:key(?:down|up|press))$/
}

var defaultOptions = {
    clientX: 0,
    clientY: 0,
    button: 0,
    ctrlKey: false,
    altKey: false,
    shiftKey: false,
    metaKey: false,
    bubbles: true,
    cancelable: true
}
var scrollTimer = null;
var scrollObject = null;
var scrollStartTime;
var scrollStartTop;
var scrollStartLeft;

function finishScrollEvent() {
    scrollObject = document.body; 

    chrome.runtime.sendMessage({
        action: "addEvent",
        evt: "scroll",
        evt_data: {
            bubbles: false, 
            cancelable: false, 
            scrollTopStart: scrollStartTop,
            scrollTopEnd: scrollObject.scrollTop,
            scrollLeftStart: scrollStartLeft,
            scrollLeftEnd: scrollObject.scrollLeft,
            inFrame: getFrameIndex(),
            url: window.location.href,
            scrollTime: Date.now()-scrollStartTime,
            endtime: Date.now()
        },
        time: scrollStartTime
    });

    scrollObject = null;
    scrollStartTop = null; 
    scrollStartLeft = null; 
}

function updateScrollEvent(e) {
    var scrollTimeMillis = 100;

    if (scrollObject == null) {
        scrollStartTime = Date.now();
        scrollObject = document.body;
        scrollStartTop = scrollObject.scrollTop;
        scrollStartLeft = scrollObject.scrollLeft;
        scrollTimer = setTimeout(finishScrollEvent, scrollTimeMillis);
    } else {
        clearTimeout(scrollTimer);
        scrollTimer = setTimeout(finishScrollEvent, scrollTimeMillis);
    } 
}

function addDocumentEventListener(eventName) {
	document.body.addEventListener(eventName, function (e) {
		var evt_data = {
			path: processPath(e.path),
			csspath: getCSSPath(e.target, false),
			csspathfull: getCSSPath(e.target, true),
			clientX: e.clientX,
			clientY: e.clientY,
			altKey: e.altKey,
			ctrlKey: e.ctrlKey,
			shiftKey: e.shiftKey,
			metaKey: e.metaKey,
			button: e.button,
			bubbles: e.bubbles,
			cancelable: e.cancelable,
			innerText: e.target.innerText || "",
			inFrame: getFrameIndex(),
			url: window.location.href
		};
		if (eventName == "select")
			evt_data['selectValue'] = e.target.value;
		if (eventName == "keyup" || eventName == "keydown" || eventName == "keypress")
			evt_data['keyCode'] = e.keyCode;
        if (eventName == "input" || eventName == "propertychange" || eventName == "change") {
            evt_data['type'] = e.target.tagName.toLowerCase();
            if (evt_data['type']=="input" || evt_data['type']=="textarea")
                evt_data['value'] = e.target.value;
            else
    			evt_data['value'] = e.target.innerText;
		}

        if (eventName == "cut")
            eventName = "clipboard_cut";
        if (eventName == "copy")
            eventName = "clipboard_copy";
        if (eventName == "paste")
            eventName = "clipboard_paste";
		if (eventName=="wfSubmit")
			eventName = "submit";

		setTimeout(function () {
			chrome.storage.local.get('recording', function (isRecording) {
				if (isRecording.recording) {
                    chrome.runtime.sendMessage({
                        action: "addEvent",
                        evt: eventName,
                        evt_data: evt_data,
                        time: Date.now()
                    });
				}
			});
		}, 1);
	}, false);
}