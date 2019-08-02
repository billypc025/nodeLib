/**
 * Created by billy on 2017/8/24.
 */
var _name = ""; //服务名称
var _pass = ""; //重置口令
var _path = "";
var _managerList = [];
var _managerNameList = [];
var _param = null;
var _serverHash = {};
var _startTime = 0;

exports.init = function ($serverInfo)
{
	_startTime = new Date().getTime();
	_name = $serverInfo.name || "";
	_pass = $serverInfo.pass || "";
	_path = $serverInfo.path || "";
	_param = __merge({}, $serverInfo.param) || {};
	_managerList = __merge([], $serverInfo.info);
	if (!Array.isArray(_managerList))
	{
		_managerList = [_managerList];
	}

	for (var i = 0; i < _managerList.length; i++)
	{
		_managerNameList.push(_managerList[i].name || "");
	}
}

exports.addServer = function ($serverKey, $server)
{
	_serverHash[$serverKey] = $server;
}

exports.getServer = function ($serverKey)
{
	if (typeof $serverKey == "string")
	{
		return _serverHash[$serverKey];
	}
	else
	{
		$serverKey = $serverKey.filter(function (v)
		{
			if (_serverHash[v])
			{
				return true;
			}
			else
			{
				return false;
			}
		});

		$serverKey = $serverKey.map(function (v)
		{
			return _serverHash[v];
		});

		return $serverKey;
	}
}

defineProperty(exports, "name", function ()
{
	return _name;
});

defineProperty(exports, "pass", function ()
{
	return _pass;
});

defineProperty(exports, "path", function ()
{
	return _path;
});

defineProperty(exports, "param", function ()
{
	return _param;
});

defineProperty(exports, "managerList", function ()
{
	return _managerList;
});

defineProperty(exports, "managerNameList", function ()
{
	return _managerNameList;
});

defineProperty(exports, "startTime", function ()
{
	return _startTime;
});