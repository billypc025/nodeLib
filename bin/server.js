/**
 * Created by billy on 2017/5/13.
 */
var g = require("../global");
var serverManager = require("../manager/ServerManager");
var options = {router: ""};

module.exports = function ($routerName)
{
	global.g = g;
	var currPath = g.path.resolve("./");
	var projPath = "";

	while (currPath != g.file.getDirectory(currPath))
	{
		var tempPath = g.path.join(currPath, "package.json");
		if (g.fs.existsSync(tempPath))
		{
			if (require(tempPath).proj == "nodecli")
			{
				projPath = g.file.getDirectory(tempPath);
			}
			break;
		}
		currPath = g.file.getDirectory(currPath);
	}

	if (projPath == "")
	{
		log.error("没有找到工程目录，请使用以下命令初始化工程目录！");
		log.info("nodecli init");
		process.exit();
	}

	global.libPath = g.path.resolve(__dirname);
	global.projPath = projPath;
	global.__libdir = libPath;   //nodeLib库路径
	global.__projdir = projPath; //项目目录路径
	global.__libpath = function ($path)  //以nodeLib库目录为根节点，获取绝对路径
	{
		return g.path.join(global.__libdir, $path);
	}
	global.__projpath = function ($path) //以项目目录为根节点，获取绝对路径
	{
		return g.path.join(global.__projdir, $path);
	}
	global.__utilsdir = __projpath("./utils/");
	global.__utilspath = function ($path)
	{
		return __utilsdir + $path;
	}

	var routerPath;
	if ($routerName)
	{
		routerPath = g.path.join(projPath, "./router/" + $routerName);
		if (!g.file.exists(routerPath))
		{
			if ($routerName.indexOf(".json") < 0)
			{
				var routerPath0 = g.path.join(projPath, "./router/" + $routerName + ".json");
				if (g.file.exists(routerPath0))
				{
					checkFile(routerPath0);
				}
				else
				{
					showErrorAndExit("指定的router目录不存在！", "找不到目录 \"" + routerPath + "\"");
				}
			}
			else
			{
				showErrorAndExit("指定的router文件不存在！", "找不到文件 \"" + routerPath + "\"");
			}
		}
		else
		{
			checkFile(routerPath);
		}
	}
	else
	{
		routerPath = g.path.join(projPath, "./router/");
		if (g.file.exists(routerPath))
		{
			showRouterList(routerPath);
		}
		else
		{
			log.error("找不到router目录！");
			process.exit();
		}
	}
}

function checkFile($filePath)
{
	if (g.file.isFile($filePath))
	{
		options.router = $filePath;
		start();
	}
	else
	{
		showRouterList($filePath);
	}
}

function showErrorAndExit(...arg)
{
	for (var i = 0; i < arg.length; i++)
	{
		log.error(arg[i]);
	}
	process.exit();
}

function showRouterList($basePath)
{
	var inquirer = require('inquirer');
	var selectOption = {
		type: "list",
		name: "router",
		message: "Select router to start Server!",
		choices: []
	};

	var fileList = g.file.getDirectoryListing(g.path.resolve($basePath));
	selectOption.choices = fileList.concat();

	inquirer.prompt(selectOption).then(function ($answer)
	{
		__merge(options, $answer, true);
		process.argv.push(options.router);
		start();
	});
}

function start()
{
	global.ip = g.localHost.getLocalIp();
	global.__ip = global.ip;
	log.success("start at:" + global.ip);
	serverManager.start(options);
}