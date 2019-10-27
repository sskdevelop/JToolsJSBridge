# Webview Js注入说明

## 完整的Js注入文件如下，注入函数改变的话，Js代码有可能会变。

```javascript
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
 message = {'methodName': methodName};
 } else {
 message = {'methodName': methodName, 'params': params};
 }
 window.webkit.messageHandlers.HostApp.postMessage(message);
 } else {
 if (!params) {
 message = {'methodName': methodName, 'callBackName': callBackName};
 } else {
 message = {'methodName': methodName, 'callBackName': callBackName, 'params': params};
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
 os_type:"%@",
 os_version:"%@",
 app_name:"%@",
 app_version:"%@",
 
 toast: function (message) {
 var params = {message: message}
 JSEventHandler.callNativeFunction("hud", params, null);
 },
 
 alert: function (message) {
 alert(message);
 var params = {message: message};
 JSEventHandler.callNativeFunction("alert", params, null);
 },
 
 queryDialog: function (message, callBack) { // queryDialog为了遵循android规则
 if (confirm(message)) {
 var params = {'operation': 'true'};
 JSEventHandler.callNativeFunction("confirm", params, callBack);
 } else {
 var params = {'operation': 'false'};
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
 var params = {'urlString': urlString};
 JSEventHandler.callNativeFunction("openNewWindow", params, callBack);
 },
 
 logEvent: function (eventName, param) {
 var params;
 if (!param) {
 params = {'eventName': eventName};
 } else {
 params = {'eventName': eventName, 'param': param};
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

```



## iOS端实现

在window注入一个HostApp对象，注入的js函数参数支持以下变量类型：

* String 字符串
* 数值类型 int long float double
* boolean
* fuction 函数



注入的函数格式为 

```javascript
foo(param2, param2, callback)
```

每个函数只有一个function callback，只能为最后一个参数，callback返回一个json对象，json对象格式为：

``` json
{
    "success": true
}
```

必须包含一个success属性，用来表示调用的结果



## 目前实现的函数



### 展示提示：

```javascript
HostApp.toast("Message") // 显示一个toast
HostApp.alert("Message") // 显示一个提示对话框
```



### 确认对话框：

```javascript
 HostApp.queryDialog('确认对话框测试', function (json) {});
```

App会显示一个对话框，有确认和取消按钮，用户点击的结果通过json对象返回给js，json对象格式为：

```json
{"success":true}
```

true表示用户点击了确认，false表示用户点击了取消



### 获取UserID：

```javascript
 HostApp.getUserID(function(userID) {});
```

返回结果：

```json
{
    "success": true,
      "userID": "abdceasdfe"
}
```

### 退出登录

```javascript
HostApp.logout(function (result) {});
```

返回结果：

```json
{"success":true}
```

### 登录

```javascript
HostApp.login(function (result) {});
```

返回结果：

```json
{"success":true}
```

### 打开一个新的Webview窗口

```javascript
 HostApp.openNewWindow('https://m.youtube.com/watch?v=OC-YdBz8Llw', function (result) {});
```

返回结果：

```json
{"success":true}
```

### 统计事件

```javascript
HostApp.logEvent('health_article_read');
HostApp.logEvent('health_article_read', jsonObject);
```

### 获取网络类型

``` javascript
HostApp.doGetNetworkType(function (result) {
        HostApp.alert(JSON.stringify(result));
});
```

网络类型有三种

```
wifi
mobile
none
```

返回结果

```
{
    "success": true,
    "network_type": "wifi"
}
```
