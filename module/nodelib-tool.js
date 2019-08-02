/**
 * Created by billy on 2019/4/3.
 */
var co = require("co");
var _timeTool = require("../utils/TimeTool");
var _serverManager = require("../manager/ServerManager");
var _managerPool = require("../data/ManagerPool");
var url = require("url");
var conf = require("./nodelib-tool/conf");
var superAdmin = require("./nodelib-tool/superAdmin");
var admin = require("./nodelib-tool/admin");
var git = require("./nodelib-tool/git");
var {response, getPostData, getManagerInfo}=require("./nodelib-tool/utils");

var _superAdminHash = {
	index: index,
	reboot: reboot,
	update_router: update_router,
	git_pull: git.pull,
	git_fetch: git.fetch,
	admin_seturl: superAdmin.setUrl,
	admin_adduser: superAdmin.addUser,
	admin_deluser: superAdmin.delUser,
	admin_updateuser: superAdmin.updateUser,
	admin_getconf: superAdmin.getConf,
	admin_saveconf: superAdmin.saveConf,
	admin_getmysqlconf: superAdmin.getMysqlConf,
	admin_setmysqlconf: superAdmin.setMysqlConf
}

var _adminHash = {
	index: [admin.checkLogin_page, admin.index],
	reboot: [admin.checkLogin, reboot],
	update_router: [admin.checkLogin, update_router],
	git_pull: [admin.checkLogin, git.pull],
	git_fetch: [admin.checkLogin, git.fetch],
	admin_login: admin.login
}

g.nodelib = {
	conf: conf,
	onRestart: false
};

function check($cmd)
{
	if ($cmd.indexOf("/nodelib-tool/") != 0)
	{
		return null;
	}

	var cmdArr = $cmd.split("/");
	if (cmdArr.length != 4 || cmdArr[2].length == 0)
	{
		return null;
	}

	var adminUrl = cmdArr[2];
	var cmd = cmdArr[3];
//	trace(adminUrl.toUpperCase(), conf.data.admin_url.toUpperCase(), adminUrl.toUpperCase() == conf.data.admin_url.toUpperCase())
	if (_adminHash[cmd] && conf.data.admin_url != "" && adminUrl.toUpperCase() == conf.data.admin_url.toUpperCase())
	{
		return {
			type: "admin",
			cmd: cmd
		};
	}
	if (_superAdminHash[cmd] && g.md5(adminUrl).toUpperCase() == g.data.server.pass.toUpperCase())
	{
		return {
			type: "superAdmin",
			cmd: cmd
		};
	}
	return null;
}
exports.check = check;

function exe($cmdObj, $req, $res)
{
	if (!$cmdObj)
	{
		return;
	}

//	trace($cmdObj.type, $cmdObj.cmd, !!_adminHash[$cmdObj.cmd]);
	if ($cmdObj.type == "superAdmin" && _superAdminHash[$cmdObj.cmd])
	{
		var query = url.parse($req.url, true).query;
		_superAdminHash[$cmdObj.cmd]($req, $res, query);
	}
	else if ($cmdObj.type == "admin" && _adminHash[$cmdObj.cmd])
	{
		var query = url.parse($req.url, true).query;
		var func = _adminHash[$cmdObj.cmd];
		if (Array.isArray(func))
		{
			co(function *()
			{
				for (var i = 0; i < func.length; i++)
				{
					var result = func[i]($req, $res, query);
					if (result === false)
					{
						break;
					}
					else if (result instanceof Promise)
					{
						var r = yield result;
						if (r === false)
						{
							break;
						}
					}
				}
			}, ()=>
			{
				response($res, 5555);
			})

		}
		else
		{
			func($req, $res, query);
		}
	}

	return;
}
exports.exe = exe;

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
		var html = g.fs.readFileSync(__libpath("../admin/index.html")).toString();
		html = paramFormat(html, {
			serverData: JSON.stringify({
				path: serverInfo.path,
				startTime: _timeTool.formatTime(serverInfo.startTime, true),
				gitBranch: gitBranch,
				gitCommit: gitCommit,
			}),
			managerList: JSON.stringify(managerList),
			adminConf: JSON.stringify(conf.data),
			isRestarting: g.nodelib.onRestart
		})
		response($res, html);
	}).catch(function ($err)
	{
		response($res, 0);
	})
}

function reboot($req, $res)
{
	co(function*()
	{
		g.nodelib.onRestart = true;
		for (var manager of _managerPool.list)
		{
			yield stopManager(manager);
		}
		_managerPool.clear();
		_serverManager.start({router: g.data.server.path});
		global.emiter.once("ALL_INITED", ()=>
		{
			g.nodelib.onRestart = false;
			response($res, "ok");
		})
	}).catch(function (err)
	{
	});
}

function update_router($req, $res)
{
	getPostData($req).then(($data)=>
	{
		if (!hasData($data, "name"))
		{
			response($res, 9999);
			return;
		}
		//更新router所有数据,要重新读router文件

		co(function*()
		{
			g.nodelib.onRestart = true;
			var managerData = g.data.manager.get($data.name)
			if (managerData && managerData.manager)
			{
				yield stopManager(managerData);
			}
			_serverManager.startManager(managerData, ()=>
			{
				g.nodelib.onRestart = false;
				response($res, "ok");
			});
		}).catch(function (err)
		{
			response($res, "ok");
		});
	});
}

function stopManager($manager)
{
	var promise = new Promise((resolved, rejecgt)=>
	{
		var childPromise;
		if (!$manager.enabled)
		{
			resolved();
			return;
		}

		if ($manager.type == "http" || $manager.type == "mysql" || $manager.type == "socket")
		{
			childPromise = $manager.manager.close();
		}

		if (childPromise)
		{
			childPromise.then(()=>
			{
				resolved();
			})
		}
		else
		{
			resolved();
		}
	});

	return promise;
}