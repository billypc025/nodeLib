/**
 * Created by billy on 2017/12/4.
 */
var _req = require("superagent");
var EventEmitter = require("events").EventEmitter;
var _emiter = new EventEmitter();
var formatParam = require("./formatAddParam");
var formatCheckParam = require("./formatChechParam");
var equalParam = require("./equalParam");

var _param;
var _list = [];
var _cookies = [];
var _count = 1;
var _isRunning = false;

var _httpInfo = {};
_httpInfo.result = {
	k: "result",
	v: 1
};
_httpInfo.data = {
	k: "data"
};
_httpInfo.error = {
	k: "errorCode",
}

_httpInfo.errorMsg = {
	k: "errorMsg",
};

var __result;
var __success;
var __data;
var __error;
var __errorMsg;

var _lastFunc = "";
var _currObj;
var _currData;
var _isEnd = false;
var _log = "";

global.addMsg = addMsg;
global.addTest = addTest;
global.addModule = addModule;
global.check = check;
global.end = end;
global.info = function (...arg)
{
	if (typeof _currObj != "function")
	{
		arg.unshift.apply(arg, ["     ", "ok -", _currObj.func, _currObj.param]);
	}
	else
	{
		arg.unshift.apply(arg, ["     ", "fun -"]);
	}
	info.apply(null, arg);
}
global.success = function (...arg)
{
	if (typeof _currObj != "function")
	{
		arg.unshift.apply(arg, ["     ", "ok -", _currObj.func, _currObj.param]);
	}
	else
	{
		arg.unshift.apply(arg, ["     ", "fun -"]);
	}
	success.apply(null, arg);
}
global.error = function (...arg)
{
	if (typeof _currObj != "function")
	{
		arg.unshift.apply(arg, ["     ", "err -", _currObj.func, _currObj.param]);
	}
	else
	{
		arg.unshift.apply(arg, ["     ", "fun -"]);
	}
	error.apply(null, arg);
}

exports.init = function ($param)
{
	_param = $param || {};

//	_httpInfo = __merge(_httpInfo, _param.req, true);

	if (_param.hasOwnProperty("req"))
	{
		if (_param.req.hasOwnProperty("result"))
		{
			_httpInfo.result.k = _param.req.result.name;
			_httpInfo.result.v = _param.req.result.success;
		}

		if (_param.req.hasOwnProperty("data"))
		{
			_httpInfo.data.k = _param.req.data.name;
		}

		if (_param.req.hasOwnProperty("error"))
		{
			_httpInfo.error.k = _param.req.error.name;
		}

		if (_param.req.hasOwnProperty("errorMsg"))
		{
			_httpInfo.errorMsg.k = _param.req.errorMsg.name;
		}
	}
	delete _param.rep;

	__result = _httpInfo.result.k;
	__success = _httpInfo.result.v;
	__data = _httpInfo.data.k;
	__error = _httpInfo.error.k;
	__errorMsg = _httpInfo.errorMsg.k;
}

exports.on = function (...arg)
{
	_emiter.on.apply(_emiter, arg);
}

//$url, $func, $param, $method, $callBack

//$url, $func, $param, $callBack      "" "" {} ()
//$url, $func, $method, $callBack     "" "" "" ()
//$url, $func, $param, $method        "" "" {} ""
//$func, $param, $method, $callBack   "" {} "" ()

//$url, $func, $callBack      "" "" ()
//$url, $func, $method        "" "" ""
//$url, $func, $param         "" "" {}
//$func, $param, $callBack    "" {} ()
//$func, $param, $method      "" {} ""
//$func, $method, $callBack   "" "" ()

//$url, $func         "" ""
//$func, $param       "" {}
//$func, $method      "" ""
//$func, $callBack    "" ()

//$msg

function check($param, $targetParam, returnObj, successObj, $callBack)
{
	var isEqual = equalParam($param, $targetParam);

	if (isEqual)
	{
		if (typeof successObj == "function")
		{
			successObj(__merge({}, returnObj))
		}
		else
		{
			var access = equalParam(returnObj, successObj);

			if ($callBack && typeof $callBack == "function")
			{
				$callBack(access, returnObj);
			}
			else
			{
				if (access)
				{
					//返回值符合预期
					success("\t", "ok -", $param);
				}
				else
				{
					//返回值不符合预期
					error("\t", "err -", $param, returnObj);
				}
			}
		}
	}

	return isEqual;
}

function addModule($path)
{

}

function addMsg($msg)
{
	_list.push($msg);
}

function addTest($url, $func, $param, $method, $callBack)
{
	if (typeof $url == "function")
	{
		_list.push($url);
		return;
	}

	var paramObj = formatParam($url, $func, $param, $method, $callBack);

	if (typeof paramObj == "string")
	{
		if (_isRunning)
		{
			_list.splice(1, 0, paramObj)
		}
		else
		{
			_list.push(paramObj);
		}
	}
	else
	{
		var list = createObj(paramObj);

		for (var i = 0; i < list.length; i++)
		{
			list[i] = createItemObj(list[i]);

			if (_isRunning)
			{
				_list.splice(1, 0, list[i])
			}
			else
			{
				_list.push(list[i]);
			}
		}
	}
}

function createItemObj($paramObj)
{
	var obj = {};
	obj.url = $paramObj.url || _param.url;
	obj.url = obj.url + "/" + $paramObj.func;
	obj.func = $paramObj.func;
	obj.method = $paramObj.method || _param.method || "post";
	obj.method = obj.method.toLowerCase();
	obj.callback = $paramObj.callback;

	if (obj.method == "post")
	{
		obj.param = $paramObj.param;
	}
	else if (obj.method == "get")
	{
		if ($paramObj.param && Object.keys($paramObj.param).length > 0)
		{
			obj.url += "?";
			for (var k in  $paramObj.param)
			{
				obj.url += k + "=" + encodeURI($paramObj.param[k]);
			}
		}
	}
	obj.callback = $paramObj.callback;
	return obj;
}

function createObj(obj)
{
	var arrKey = [];
	var arrLen = [];
	var arrIndex = [];
	for (var k in obj.param)
	{
		if (Array.isArray(obj.param[k]) && k.charAt(0) == "$")
		{
			var valueList = obj.param[k];
			arrKey.push(k);
			arrLen.push(valueList.length);
			arrIndex.push(0);
		}
	}

	var list = [];
	while (true)
	{
		var tObj = __merge({}, obj);
//		delete tObj.param;
//		tObj.param = {};
		for (var i = 0; i < arrKey.length; i++)
		{
			var key = arrKey[i];
			delete tObj.param[key];
			var index = arrIndex[i];
			value = obj.param[key][index];
			var newKey = key.replace("$", "");
			tObj.param[newKey] = value;
		}

		list.push(tObj);

		var ti = 0;
		while (ti < arrKey.length)
		{
			arrIndex[ti] += 1;
			if (arrIndex[ti] >= arrLen[ti])
			{
				arrIndex[ti] = 0;
				ti++;
			}
			else
			{
				break;
			}
		}

		if (ti >= arrKey.length)
		{
			break;
		}
	}

	return list;
}

exports.startTest = function ()
{
	if (!_isRunning)
	{
		_isRunning = true;
		startNext();
	}
}

function setLog($log)
{
	_log += $log + "\r\n";
}

function showInfo(count, func)
{
	if (_lastFunc == func)
	{
		_count--;
		return;
	}

	_lastFunc = func;
	log.info("");
	log.info(count + " " + func);
	setLog("");
	setLog(count + " " + func);
}
function info(...arg)
{
	arg = arg.map(function (v)
	{
		if (typeof v == "object")
		{
			return JSON.stringify(v);
		}
		return v;
	});

	var $log = arg.join(" ");
	log.info($log);
	setLog($log);
}
function success(...arg)
{
	arg = arg.map(function (v)
	{
		if (typeof v == "object")
		{
			return JSON.stringify(v);
		}
		return v;
	});

	var $log = arg.join(" ");
	log.success($log);
	setLog($log);
}
function error(...arg)
{
	arg = arg.map(function (v)
	{
		if (typeof v == "object")
		{
			return JSON.stringify(v);
		}
		return v;
	});
	var $log = arg.join(" ");
	log.error($log);
	setLog($log);
}

function next()
{
	if (typeof _currObj != "function" && typeof _currObj != "string")
	{
		_count++;
	}
	_list.shift();
	setTimeout(startNext, 200);
}

function end(...arg)
{
	if (_isEnd)
	{
		return;
	}

	if (typeof _currObj == "function")
	{
		if (arg.length > 0)
		{
			arg.unshift.apply(arg, ["\t", "fun -"]);
			info.apply(null, arg);
		}
		next();
		return;
	}

	if (arg.length > 0)
	{
		arg.unshift(_currObj.param);
		if (_currData[__result] == __success)
		{
			arg.splice(2, 0, _currData[__data]);
		}
		else
		{
			arg.splice(2, 0, _currData[__errorMsg]);
		}
		if (check.apply(null, arg))
		{
			_isEnd = true;
			next();
		}
	}
	else
	{
		_isEnd = true;
		success.apply(null, ["\t", "ok -", _currObj.param]);
		next();
	}
}

function startNext()
{
	if (_list.length > 0)
	{
		_currObj = _list[0];
		if (typeof _currObj == "string")
		{
			info(_currObj);
			_list.shift();
			startNext();
		}
		else if (typeof _currObj == "function")
		{
			_currObj();
		}
		else
		{
			callTest(_currObj).then((d)=>
			{
				_currData = d;
				_isEnd = false;
				showInfo("[" + _count + "]", _currObj.func);

				if (_currObj.callback)
				{
					if (d[__result] == __success)
					{
						_currObj.callback.call(this, true, d[__data], _currObj.param, (...arg)=>
							{
								arg.unshift(_currObj.param);
								arg.unshift("ok -");
								arg.unshift("\t");
								success.apply(null, arg);
							}, (...arg)=>
							{
								arg.unshift(_currObj.param);
								arg.unshift("err - ");
								arg.unshift("\t");
								error.apply(null, arg);
							},
							_cookies);
					}
					else
					{
						_currObj.callback.call(this, false, d[__errorMsg], _currObj.param, (...arg)=>
						{
							arg.unshift(_currObj.param);
							arg.unshift("ok - ");
							arg.unshift("\t");
							success.apply(null, arg);
						}, (...arg)=>
						{
							arg.unshift(_currObj.param);
							arg.unshift("err - ");
							arg.unshift("\t");
							error.apply(null, arg);
						}, _cookies);
					}
//				this.callback = _currObj.callback.bind(this);
//				this.callback(d.data, _currObj.param, _cookies);
				}
				//这中间可能要调用sql去数据库查询最终数据，所以这里也是异步的
			}, (d)=>
			{
				error("[" + _count + "]", _currObj.func, "fail");
				this.end();
			});
		}
	}
	else
	{
		_isRunning = false;
		_emiter.emit("COMPLETE", _log);
	}
}

function callTest($obj)
{
	return createNet($obj);
	/*
	 var list = [];
	 if (Array.isArray($obj))
	 {
	 $obj.map(function (v)
	 {
	 return createNet(v);
	 });
	 }
	 else
	 {
	 $obj = [$obj];
	 }

	 return Promise.all($obj);
	 */
}

function createNet($obj)
{
	var promise = new Promise((resloved, reject)=>
	{
		var req;
		if ($obj.method == "get")
		{
			req = _req.get($obj.url);
		}
		else
		{
			req = _req.post($obj.url);
		}

		if (_cookies.length > 0)
		{
			req.set('Cookie', _cookies[0]);
		}
		req.set("Content-Type", "application/json")
			.type("form")
			.send($obj.param)
			.end((err, res)=>
			{
//				trace(res.text)
				if (err)
				{
					reject(err);
				}
				else
				{
//					trace(res.header);
					if (res.headers.hasOwnProperty("set-cookie"))
					{
						_cookies = _cookies.concat(res.headers["set-cookie"]);
					}
					resloved(JSON.parse(res.text));
				}
			});
	})
	return promise;
}

//这里还需要做这样的处理
/*
 1.将test并入到nodecli
 如果test作为一个router类型的话，那么就能够通过test来创建新的router，但是这个router里面就没办法拥有多个模块
 而应该是创建另外一种类型的工程，在工程下创建的模块能自动并入到router中，去，以下列举一下目录层级，应该是这样的

 工程目录      通过nodecli init test创建
 router文件   通过nodecli add router {$name}创建
 module       通过nodecli add module {$name}创建

 这样在一个router文件中，就可以加入多个模块
 而工程的总入口文件是一个地址

 入口文件打开以后，应该是选择各个项目进行测试
 */