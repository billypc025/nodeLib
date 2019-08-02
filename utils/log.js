/**
 * Created by billy on 2017/4/25.
 */
var path = require("path");
var timeTool = require("./TimeTool");
var color = require("cli-color");

function print()
{
	var fileName = "";
	var dataObj = ""
	if (arguments.length == 0)
	{
		return;
	}

	if (arguments.length >= 2)
	{
		fileName = arguments[0];
		dataObj = arguments[1];
	}
	else
	{
		fileName = "log";
		dataObj = arguments[0];
	}

	var str = "";
	if (typeof dataObj != "string" && typeof dataObj != "number")
	{
		str = JSON.stringify(debug(dataObj));
	}
	else
	{
		str = dataObj + "";
	}

	require("fs").writeFile("./print/" + fileName + "_" + timeTool.getNowStamp() + ".txt", str);
}

var _log = "";

function log()
{
	console.log.apply(console.log, arguments);

	var str = JSON.stringify(debug(arguments[0], 1, 2));

	for (var i = 1; i < arguments.length; i++)
	{
		str += " " + JSON.stringify(debug(arguments[i], 1, 2))
	}

	_log += "\r\n" + str;

//	if (_log.length > 200000)
	if (_log.length > 20)
	{
		require("fs").writeFile("./log/" + fileName + "_" + timeTool.getNowStamp() + ".txt", _log);
		_log = "";
	}
}

function error(msg)
{
	console.log(color.red.bold(msg));
}

function _error(msg)
{
	console.log(color.red(msg));
}

function success(msg)
{
	console.log(color.green.bold(msg));
}

function _success(msg)
{
	console.log(color.green(msg));
}

function warn(msg)
{
	console.log(color.yellow.bold(msg));
}

function _warn(msg)
{
	console.log(color.yellow(msg));
}

function info(msg)
{
	console.log(color.cyan.bold(msg));
}

function _info(msg)
{
	console.log(color.cyan(msg));
}

module.exports = {
	print: print,
	log: log,
	error: error,
	_error: _error,
	success: success,
	_success: _success,
	warn: warn,
	_warn: _warn,
	info: info,
	_info: _info
}