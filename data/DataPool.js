var _dataPool = {};

exports.save = function ($k, $v)
{
	if (_dataPool[$k])
	{
		_dataPool[$k].v = $v;
		_dataPool[$k].t = Date.now();
	}
	else
	{
		_dataPool[$k] = {
			k: $k,
			v: $v,
			t: Date.now()
		}
	}
}

exports.get = function ($k)
{
	return _dataPool[$k];
}

exports.remove = function ($k)
{
	delete _dataPool[$k];
}

exports.removeAll = function ()
{
	_dataPool = {};
}

exports.file = require("./FilePool");
exports.oldfile = require("./FilePool_old");
exports.manager = require("./ManagerPool");
exports.server = require("./ServerInfo");