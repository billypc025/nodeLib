/**
 * Created by billy on 2017/8/23.
 */
var g = require("../global");
var EventEmitter = require("events").EventEmitter;

var _serverTypes = ["http", "socket", "web", "mysql", "redis", "express", "script", "test"];
var _managerInitNum = 0;
var _routerObj = null;

global.emiter = new EventEmitter();

var nodeLibTool = require("../module/nodelib-tool");

exports.start = function ($options)
{
	_managerInitNum = 0;
	global.emiter.emit("START_INIT_ROUTER");
	initRouter($options.router);
	global.emiter.emit("START_INIT_DATA");
	initData();
	global.emiter.emit("START_INIT_MANAGER");
	initManager();
}

function initRouter($router)
{
	var routerPath = g.path.resolve($router);
	if (!g.fs.existsSync(routerPath))
	{
		log.error(" 指定的router文件不存在！");
		log.error(" 找不到文件 \"" + routerPath + "\"");
		process.exit(0);
	}

	try
	{
		var msgInfo = "Load Router:" + routerPath;
		log.info(msgInfo);
		log.info(msgInfo.replace(/./g, "-"));
		_routerObj = require(routerPath);
		_routerObj.path = routerPath;
	}
	catch (e)
	{
		log.error(routerPath + "不是有效的json文件");
		log.error(e.toString().split("\n")[0]);
		process.exit(0);
	}
}

function initData()
{
	g.data.server.init(_routerObj);
	g.data.manager.init(_routerObj.info);
}

function initManager()
{
	var managerList = g.data.manager.list;
	if (_managerInitNum < managerList.length)
	{
		var managerItem = managerList[_managerInitNum];

		if (managerItem.enabled)
		{
			startManager(managerList[_managerInitNum], function ($managerName, $success)
			{
				global.emiter.emit("COMPLETED_MANAGER_ITEM", $managerName);
				nextManager(managerItem.name, $success ? "Started" : "failed");
			})
		}
		else
		{
			nextManager(managerItem, "Skipped");
		}
	}
	else
	{
		log.success("--------------- All INITED ---------------");
		log.success("start at:" + global.ip);
		global.emiter.emit("ALL_INITED");
		trace("");
	}
}

function nextManager($managerName, $status)
{
	var managerList = g.data.manager.list;
	var manager = managerList[_managerInitNum];
	var infoMsg = "[Server " + $status + "] ";
	infoMsg += $managerName;
	infoMsg += " (" + (_managerInitNum + 1) + "/" + managerList.length + ")";
	switch ($status)
	{
		case "Started":
			log.success(infoMsg);
			break;

		case "Skipped":
			log._success(infoMsg);
			break;

		case "failed":
			log.error(infoMsg);
			break;
	}
	_managerInitNum++;
	setTimeout(function ()
	{
		initManager();
	}, 500);
}

function startManager($managerData, $callBack)
{
	if (!$managerData.type)
	{
		log.error("路由配置缺少服务类型!");
		log.info("请指定一种服务类型: [" + _serverTypes.join(", ") + "]");
		process.exit();
	}

	var managerType = $managerData.type;
	if (_serverTypes.indexOf(managerType) < 0)
	{
		log.error("不存在的服务类型：" + managerType);
		log.info("请指定一种服务类型: [http, socket, web]");
		process.exit();
	}

	global.emiter.emit("BEFORE_CREATE_MANAGER", $managerData);
	managerType = managerType.charAt(0).toUpperCase() + managerType.substr(1);
	var ManagerClass = require("./" + managerType + "Manager");
	var managerItem = new ManagerClass($managerData);
	global.emiter.emit("BEFORE_PRESTART_MANAGER_ITEM", $managerData);
	managerItem.preStart($callBack);
}
exports.startManager = startManager;