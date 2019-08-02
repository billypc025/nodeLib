/**
 * Created by billy on 2019/4/24.
 */
var co = require("co");
var _timeTool = require("../../utils/TimeTool");
var conf = require("./conf");
var git = require("./git");
var {response, getPostData, getManagerInfo}=require("./utils");
var TokenPool = require("./TokenPool");
var _tokenPool = new TokenPool();

function index($req, $res, $query)
{
	co(function*()
	{
		var serverInfo = g.data.server;
		var managerList = [];
		for (var manager of serverInfo.managerList)
		{
			managerList.push({
				name: manager.name,
				type: manager.type,
				info: getManagerInfo(manager),
				enabled: manager.enabled
			});
		}

		var gitBranch = yield git.getBranch();
		var gitCommit = yield git.getCommit();
		gitCommit.time = _timeTool.formatTime(new Date(gitCommit.time).getTime());
		var html = g.fs.readFileSync(__libpath("../admin/admin_index.html")).toString();
		html = paramFormat(html, {
			serverData: JSON.stringify({
				path: serverInfo.path,
				startTime: _timeTool.formatTime(serverInfo.startTime, true),
				gitBranch: gitBranch,
				gitCommit: gitCommit,
			}),
			managerList: JSON.stringify(managerList),
			isRestarting: g.nodelib.onRestart
		})
		response($res, html);
	}).catch(function ($err)
	{
//		trace($err)
		response($res, 0);
	})
}
exports.index = index;

function login($req, $res, $query)
{
	getPostData($req).then(($data)=>
	{
		if (!hasData($data, "name", "pass"))
		{
			response($res, 9999);
			return;
		}

		var userObj = conf.getUser($data.name);
		if (!userObj || userObj.pass != $data.pass)
		{
			response($res, 1000);
			return;
		}
		updateCookie($res, $data.name);
		response($res, {n: 1});
	})
}
exports.login = login;

function checkLogin($req, $res)
{
	var promise = new Promise((resolved, reject)=>
	{
		var token = g.cookie.get($req, "token");
		var userName = _tokenPool.get(token);
		if (!userName)
		{
			clearCookie($res);
			response($res, 1000);
			resolved(false);
			return;
		}
		resolved(true);
	})
	return promise;
}
exports.checkLogin = checkLogin;

function checkLogin_page($req, $res)
{
	var promise = new Promise((resolved, reject)=>
	{
		var token = g.cookie.get($req, "token");
		var userName = _tokenPool.get(token);
		if (!userName)
		{
			var html = g.fs.readFileSync(__libpath("../admin/admin_login.html")).toString();
			response($res, html);
			resolved(false);
			return;
		}
		resolved(true);
	})
	return promise;
}
exports.checkLogin_page = checkLogin_page;

function updateCookie($res, $userName)
{
	var token = _tokenPool.add($userName);
	g.cookie.create($res, "token", token, {path: "/"});
}

function clearCookie($res)
{
	g.cookie.clear($res, "chachadian_wxapp", {path: "/"});
}