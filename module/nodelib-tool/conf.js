/**
 * Created by billy on 2019/4/24.
 */

//管理员登录可以指定一个地址用于其他人登录,有一个地址设置界面
//非管理员登录时,就需要验证身份,并根据用户hash,写入对应的token,每次接口调用后都更新token
var UserPool = require("./UserPool");
var _data, _path, _timeoutId = 0;
var _userPool = new UserPool();
var _keyList;
var _confTemplate;

global.emiter.once("START_INIT_MANAGER", init);
function init()
{
	var pathObj = g.path.parse(g.data.server.path);
	_path = __projpath("./" + pathObj.name + ".conf");
	let confTemplateStr = g.fs.readFileSync(__libpath("../admin/admin.conf")).toString();
	_confTemplate = JSON.parse(confTemplateStr);
	_keyList = Object.keys(_confTemplate);
	if (!g.file.exists(_path))
	{
		_data = __merge({}, _confTemplate);
		g.fs.writeFileSync(_path, JSON.stringify(_data));
	}
	else
	{
		let confStr = g.fs.readFileSync(_path).toString();
		_data = JSON.parse(confStr);
		if (Object.keys(_data).length != Object.keys(_confTemplate).length)
		{
			_data = __merge(_data, _confTemplate);
			g.fs.writeFileSync(_path, JSON.stringify(_data));
		}
	}
	_userPool.update(_data.user_list);
	_data.user_list = _userPool.list;

	for (var managerData of g.data.manager.list)
	{
		if (managerData.enabled && _data.manager[managerData.name] && managerData.param)
		{
			__merge(managerData.param, _data.manager[managerData.name], true);
		}
	}
//	trace(_data);
}

function update($data)
{
	if ($data == "")
	{
		_data = __merge({}, _confTemplate);
	}
	else
	{
		for (var k in $data)
		{
			if (_keyList.indexOf(k) < 0)
			{
				delete $data[k];
			}
		}
		_data = __merge({}, $data);
		_data = __merge(_data, _confTemplate);
	}

	_userPool.update(_data.user_list);
	save();
//	g.fs.writeFileSync(_path, JSON.stringify(_data));
//	_data = $data;
}
exports.update = update;

function setUrl($url)
{
	_data.admin_url = $url;
	save();
}
exports.setUrl = setUrl;

function addUser($userObj)
{
	var userObj = _userPool.add($userObj);
	save();
	return userObj;
}
exports.addUser = addUser;

function delUser($name)
{
	_userPool.del($name);
	save();
}
exports.delUser = delUser;

function updateUser($userObj)
{
	_userPool.updateUser($userObj);
	save();
}
exports.updateUser = updateUser;

function getUser($name)
{
	return _userPool.getDataBy($name);
}
exports.getUser = getUser;

function updateManager($name, $obj)
{
	_data.manager[$name] = $obj;
	save();
}
exports.updateManager = updateManager;

function save()
{
	if (_timeoutId)
	{
		clearTimeout(_timeoutId);
	}
	_timeoutId = setTimeout(()=>
	{
		g.fs.writeFile(_path, JSON.stringify(_data), ()=>
		{
		});
	}, 1000)
}

defineProperty(exports, "data", function ()
{
	return _data;
});