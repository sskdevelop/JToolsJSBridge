(function (win) {

    if (win.HostApp) {
        return
    }

    console.log("HostApp initialization begin");
    //定义事件
    var Event = {

        _listeners: {},

        addEvent: function (type, fn) {
            if (typeof this._listeners[type] === "undefined") {
                this._listeners[type] = [];
            }
            if (typeof fn === "function") {
                this._listeners[type].push(fn);
            }
            return this;
        },

        fireEvent: function (type, param) {
            var arrayEvent = this._listeners[type];
            if (arrayEvent instanceof Array) {
                for (var i = 0, length = arrayEvent.length; i < length; i += 1) {
                    if (typeof arrayEvent[i] === "function") {
                        arrayEvent[i](param);
                    }
                }
                this._listeners[type] = undefined;
            }
            return this;
        },

        removeEvent: function (type, fn) {
            var arrayEvent = this._listeners[type];
            if (typeof type === "string" && arrayEvent instanceof Array) {
                if (typeof fn === "function") {
                    for (var i = 0, length = arrayEvent.length; i < length; i += 1) {
                        if (arrayEvent[i] === fn) {
                            this._listeners[type].splice(i, 1);
                            break;
                        }
                    }
                } else {
                    delete this._listeners[type];
                }
            }
            return this;
        },
    };

    // 定义JavaScript调用
    var JSEventHandler = {

        callNativeFunction: function (functionNameString, params, callBack) {
            var methodName = (functionNameString.replace(/function\s?/mi, "").split("("))[0];
            var callBackName = methodName + 'CallBack' + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2) + Math.random().toString(36).substr(2);
            var message;
            if (!callBack) {
                if (!params) {
                    message = {
                        'methodName': methodName
                    };
                } else {
                    message = {
                        'methodName': methodName,
                        'params': params
                    };
                }
                window.webkit.messageHandlers.HostApp.postMessage(message);
            } else {
                if (!params) {
                    message = {
                        'methodName': methodName,
                        'callBackName': callBackName
                    };
                } else {
                    message = {
                        'methodName': methodName,
                        'callBackName': callBackName,
                        'params': params
                    };
                }

                if (!Event._listeners[callBackName]) {
                    Event.addEvent(callBackName, function (data) {
                        callBack(data);
                    });
                }
                window.webkit.messageHandlers.HostApp.postMessage(message);
            }
        },

        callBack: function (callBackName, data) {
            Event.fireEvent(callBackName, data);
        },

        removeAllCallBacks: function (data) {
            Event._listeners = {};
        },

    };

    // 定义宿主App
    win.HostApp = {
        JSEventHandler: JSEventHandler,
        os_type: "%@",
        os_version: "%@",
        app_name: "%@",
        app_version: "%@",

        toast: function (message) {
            var params = {
                message: message
            }
            JSEventHandler.callNativeFunction("hud", params, null);
        },

        alert: function (message) {
            alert(message);
            var params = {
                message: message
            };
            JSEventHandler.callNativeFunction("alert", params, null);
        },

        queryDialog: function (message, callBack) { // queryDialog为了遵循android规则
            if (confirm(message)) {
                var params = {
                    'operation': 'true'
                };
                JSEventHandler.callNativeFunction("confirm", params, callBack);
            } else {
                var params = {
                    'operation': 'false'
                };
                JSEventHandler.callNativeFunction("confirm", params, callBack);
            }
        },

        getUserID: function (callBack) {
            JSEventHandler.callNativeFunction("getUserID", null, callBack);
        },

        logout: function (callBack) {
            JSEventHandler.callNativeFunction("logout", null, callBack);
        },

        login: function (callBack) {
            JSEventHandler.callNativeFunction("login", null, callBack);
        },

        openNewWindow: function (urlString, callBack) {
            var params = {
                'urlString': urlString
            };
            JSEventHandler.callNativeFunction("openNewWindow", params, callBack);
        },

        logEvent: function (eventName, param) {
            var params;
            if (!param) {
                params = {
                    'eventName': eventName
                };
            } else {
                params = {
                    'eventName': eventName,
                    'param': param
                };
            }
            JSEventHandler.callNativeFunction("logEvent", params, null);
        },

        doGetNetworkType: function (callBack) {
            JSEventHandler.callNativeFunction("doGetNetworkType", null, callBack);
        },

    };

    console.log("HostApp initialization end");

    var readyEvent = document.createEvent('Events');
    readyEvent.initEvent('HostAppReady', true, true);
    document.dispatchEvent(readyEvent);
})(window);