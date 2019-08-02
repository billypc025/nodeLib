/**
 * Created by billy on 2019/4/24.
 */
var co = require("co");
var conf = require("./conf");
var {response, getPostData}=require("./utils");

function setUrl($req, $res, $query)
{
	getPostData($req).then(($data)=>
	{
		if (!hasData($data, "url"))
		{
			response($res, 9999);
			return;
		}

		conf.setUrl($data.url);
		response($res, {url: $data.url});
	})
}
exports.setUrl = setUrl;

function addUser($req, $res, $query)
{
	getPostData($req).then(($data)=>
	{
		if (!hasData($data, "name", "pass"))
		{
			response($res, 9999);
			return;
		}

		if (!conf.getUser($data.name))
		{
			var userObj = conf.addUser($data);
			response($res, userObj);
			return;
		}
		else
		{
			response($res, 2001);//has user
			return;
		}
	})
}
exports.addUser = addUser;

function delUser($req, $res, $query)
{
	getPostData($req).then(($data)=>
	{
		if (!hasData($data, "name"))
		{
			response($res, 9999);
			return;
		}

		conf.delUser($data.name);
		response($res, {});
	})
}
exports.delUser = delUser;

function updateUser($req, $res, $query)
{
	getPostData($req).then(($data)=>
	{
		if (!hasData($data, "name"))
		{
			response($res, 9999);
			return;
		}

		conf.updateUser($data);
		var userObj = conf.getUser($data.name);
		response($res, userObj);
	})
}
exports.updateUser = updateUser;

function getConf($req, $res, $query)
{
	response($res, conf.data);
}
exports.getConf = getConf;

function saveConf($req, $res, $query)
{
	getPostData($req).then(($data)=>
	{
		conf.update($data)
		response($res, {});
	})
}
exports.saveConf = saveConf;

function getMysqlConf($req, $res, $query)
{
	getPostData($req).then(($data)=>
	{
		if (!hasData($data, "name"))
		{
			response($res, 9999);
			return;
		}
		var managerData = g.data.manager.get($data.name);
		if (!managerData || managerData.type != "mysql")
		{
			response($res, 9999);
			return;
		}

		response($res, managerData.param);
	})
}
exports.getMysqlConf = getMysqlConf;

function setMysqlConf($req, $res, $query)
{
	getPostData($req).then(($data)=>
	{
		if (!hasData($data, "name", "host", "user", "password", "database"))
		{
			response($res, 9999);
			return;
		}
		var managerData = g.data.manager.get($data.name);
		if (!managerData || managerData.type != "mysql")
		{
			response($res, 9999);
			return;
		}
		var param = {
			host: $data.host,
			user: $data.user,
			password: $data.password,
			database: $data.database
		}
		managerData.param = __merge({}, param);

		conf.updateManager($data.name, param);
		response($res, {});
	})
}
exports.setMysqlConf = setMysqlConf;