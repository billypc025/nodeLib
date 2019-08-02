/**
 * Created by billy on 2017/12/18.
 */
var _overloadHash = {
	"h'{}()": ["url", "func", "param", "callback"],
	"h''()": ["url", "func", "method", "callback"],
	"h'{}'": ["url", "func", "param", "method"],
	"''{}'": ["func", "param", "method", "callback"],

	"h'()": ["url", "func", "callback"],
	"h''": ["url", "func", "method"],
	"h'{}": ["url", "func", "param"],
	"'{}()": ["func", "param", "callback"],
	"'{}'": ["func", "param", "method"],
	"''()": ["func", "method", "callback"],

	"h'": ["url", "func"],
	"'{}": ["func", "param"],
	"''": ["func", "method"],
	"'()": ["func", "callback"],

	"'": ["msg"]
}

module.exports = function ()
{
	var obj = {};
	var arg = [];
	for (var i = 0, l = arguments.length; i < l; i++)
	{
		if (arguments[i] != null && arguments[i] != undefined)
		{
			arg.push(arguments[i]);
		}
	}

	var typeStr = arg.map(function (v)
	{
		return getType(v);
	}).join("");

	if (arg.length == 5)
	{
		obj.url = arg[0];
		obj.func = arg[1];
		obj.param = arg[2];
		obj.method = arg[3];
		obj.callback = arg[4];
	}
	else if (arg.length > 1)
	{
		obj.url = "";
		obj.func = "";
		obj.param = {};
		obj.method = "";
		obj.callback = null;
		var list = _overloadHash[typeStr];
		if (list)
		{
			for (var i = 0; i < list.length; i++)
			{
				obj[list[i]] = arg[i];
			}
		}
	}
	else
	{
		return arg[0] + "";
	}

	return obj;
}

function getType($obj)
{
	if (typeof $obj == "string")
	{
		if ($obj.indexOf("http") >= 0)
		{
			return "h";
		}
		return "'";
	}
	else if (typeof $obj == "function")
	{
		return "()";
	}
	else if (typeof $obj == "object")
	{
		return "{}";
	}

	return 0;
}