#!/usr/bin/env node
require('shelljs/global');
var g = require("../global");
var fs = require("fs");
var path = require("path");
var OS = require("os");
var opener = require("opener");
var timeTool = require("../utils/TimeTool");
var exec = require("child_process").exec;

var globalCmd = require("../utils/actionPool")();
var addCmd = require("../utils/actionPool")();

var libPath = path.join(__dirname, "../");
var currPath = path.resolve("./");
var projPath = "";

var os = OS.platform().indexOf("win32") >= 0 ? "win" : "unix";

(function ()
{
	while (currPath != g.file.getDirectory(currPath))
	{
		var tempPath = path.join(currPath, "package.json");
		if (fs.existsSync(tempPath))
		{
			if (require(tempPath).proj == "nodecli")
			{
				projPath = path.join(g.file.getDirectory(tempPath), "");
			}
			break;
		}
		currPath = g.file.getDirectory(currPath);
	}
})();

(function ()
{
	global.getProjPath = function ($path)
	{
		if ($path.indexOf(projPath) < 0)
		{
			return path.join(projPath, $path);
		}
		return $path;
	}

	global.getCliPath = function ($path)
	{
		if ($path.indexOf(libPath) < 0)
		{
			return path.join(libPath, $path);
		}
		return $path;
	}

	global.projExist = function ($path)
	{
		return fs.existsSync(getProjPath($path));
	}

	global.copyFile = function ($libPath, $projPath)
	{
		var sourcePath = getCliPath($libPath);
		var targetPath = getProjPath($projPath);
		if (g.file.isDirectory(sourcePath))
		{
			var list = g.file.getDirectoryListing(sourcePath);
			for (var i = 0; i < list.length; i++)
			{
				var temppath = g.path.resolve(list[i]).replace(sourcePath, "");
				copyFile(sourcePath + temppath, targetPath + temppath);
			}
		}
		else
		{
			cp('-Rf', sourcePath, targetPath);
		}
	}

	global.writeFile = function ($path, $data)
	{
		g.fs.writeFileSync(getProjPath($path), $data);
	}

	global.getCliFile = function ($path)
	{
		return fs.readFileSync(getCliPath($path)).toString();
	}

	global.getProjFile = function ($path)
	{
		return fs.readFileSync(getProjPath($path)).toString();
	}

	global.showUsage = function ()
	{
		var usage = getCliFile("./bin/cli-template/cli-usage");
		log.info(usage);
	}

	global.showSelectList = function ($selectList, $callBack)
	{
		var inquirer = require('inquirer');
		var selectOption = {
			type: "list",
			name: "value",
			message: "Select a Router File",
			choices: []
		};

		selectOption.choices = $selectList.concat();

		inquirer.prompt(selectOption).then(function ($answer)
		{
			$callBack($answer);
		});
	}

	global.checkInit = function ()
	{
		if (projPath == "")
		{
			log.error("没有找到工程目录，请使用以下命令初始化工程目录！");
			log.info("nodecli init");
			process.exit();
		}
	}

	global.showMsg = function ($msg, $callBack)
	{
		var inquirer = require('inquirer');
		var question = {
			type: "input",
			name: "value",
			message: $msg
		};

		inquirer.prompt(question).then(function ($answer)
		{
			$callBack($answer.value);
		});
	}
})();

(function ()
{
	globalCmd.add(init);
	globalCmd.add(add);
	globalCmd.add(update);
	globalCmd.add(open);
	globalCmd.add(start);
	globalCmd.log = function (...arg)
	{
		arg.unshift("[nodecli]")
		global.log.info(arg.join(" "));
	}
	addCmd.add("router", addRouter);
	addCmd.add("server", addServer);
	addCmd.add("module", addModule);
	addCmd.add("test", addTest);
	addCmd.add("bin", addBin);
})()

if (!globalCmd.exe.apply(globalCmd.exe, getArgs()))
{
	if (process.argv[1] &&
		(process.argv[1].indexOf("cli.js") == process.argv[1].length - 6
		|| process.argv[1].indexOf("nodecli") == process.argv[1].length - 7))
	{
		showUsage();
		process.exit();
	}
}

function init()
{
	var dirList = ["log", "module", "router", "node_modules"];
	globalCmd.log("Init Project Start");

	if (!projExist("./package.json"))
	{
		copyFile("./bin/cli-template/package.json", "./package.json");
		trace("Create File: " + getProjPath("./package.json"));
	}

	if (!projExist("./.gitignore"))
	{
		copyFile("./.gitignore", "./.gitignore");
		trace("Create File: " + getProjPath("./.gitignore"));
	}

	for (var i = 0; i < dirList.length; i++)
	{
		var dirName = dirList[i];
		if (!projExist(dirName))
		{
			g.fs.mkdirSync(getProjPath(dirName));
			trace("Create Directory: " + dirName);
		}
	}

	updateFile();

	globalCmd.log("Project is Inited!");
	process.exit();
}

function add(...arg)
{
	checkInit();

	if (!addCmd.exe.apply(addCmd.exe, arg))
	{
		showUsage();
		process.exit();
	}
}

function update()
{
//	checkInit();

	exec("git --git-dir=" + libPath + ".git --work-tree=" + libPath + " checkout .", function (e, d)
	{
		exec("git --git-dir=" + libPath + ".git --work-tree=" + libPath + " pull", function (e, d)
		{
			trace("Update nodeLib Complete.");

			var editInfo = os == "win" ? "#" + "!" + "node" : "#" + "!" + "/usr/bin/env" +
			" node";
			var packageJson = require("../package.json");
			if (packageJson.bin && Object.keys(packageJson.bin).length > 0)
			{
				for (var k in packageJson.bin)
				{
					var file = path.join(libPath, packageJson.bin[k]);

					if (!fs.existsSync(file))
					{
						if (file.indexOf(".js") != file.length - 3)
						{
							file += ".js";
						}

						if (!fs.existsSync(file))
						{
							trace("检查到不存在的bin文件: " + file);
						}
					}
					else
					{
						var fileContent = fs.readFileSync(file).toString();
						fileContent = fileContent.replace(new RegExp("#" + "!.+", "g"), "{$" + "EDIT_INFO}");
						if (fileContent.indexOf("{$" + "EDIT_INFO}") >= 0)
						{
							fileContent = fileContent.replace("{$" + "EDIT_INFO}", editInfo);
						}
						else
						{
							fileContent = editInfo + "\n" + fileContent;
						}
						trace("转换bin文件：" + file);
						fs.writeFileSync(file, fileContent);
					}
				}
			}
			trace("开始导入库, 耐心等待...");
			require("child_process").execSync("npm link", {cwd: libPath});

			if (projPath != "")
			{
				updateFile();
			}

			process.exit();
		});
	});
}

function updateFile()
{
	var fileList = fs.readFileSync(path.join(__dirname, "./cli-template/fileList")).toString();
	var fileList = getCliFile("./bin/cli-template/fileList");
	fileList = fileList.replace(/\r\n/g, "\n");
	fileList = fileList.replace(/\r/g, "");
	fileList = fileList.replace(/\n/g, ",");
	fileList = fileList.split(",");

	for (var i = 0; i < fileList.length; i++)
	{
		var targetFilePath = getProjPath(fileList[i]);
		var pathObj = g.path.parse(targetFilePath);
		var targetDir = pathObj.dir;
		if (pathObj.ext == "")
		{
			targetDir += "\\" + pathObj.base;
		}
		if (!projExist(targetDir))
		{
			g.file.createDirectory(targetDir);
		}

		copyFile(fileList[i], fileList[i]);
		trace("Copy File: " + getProjPath(fileList[i]));
	}
}

function open()
{
	opener(libPath, function ()
	{
		process.exit();
	});
}

function start($routerName)
{
	checkInit();
	require("./server")($routerName);
}

exports.start = start;

function addRouter($routerName, $serverType)
{
	if ($routerName)
	{
		if ($routerName.indexOf(".json") > 0)
		{
			$routerName = $routerName.replace(".json", "");
		}

		var routerList = g.file.getDirectoryListing(getProjPath("./router"));
		routerList = routerList.map(function (v)
		{
			return g.file.getFileName(v);
		});

		if (routerList.indexOf($routerName) < 0)
		{
			globalCmd.log("Add Router:", $routerName);
			copyFile("./bin/cli-template/router.json", "./router/" + $routerName + ".json");
			trace("Create File:" + getProjPath("./router/" + $routerName + ".json"));
			globalCmd.log("Router File Created.");
		}
		else
		{
			log._info("已经存在router文件: " + $routerName);
		}

		if ($serverType)
		{
			addServer($routerName, $serverType);
		}
		else
		{
			process.exit();
		}
	}
	else
	{
		log.error("请指定1个router文件名称");
		process.exit();
	}
}

function addServer($routerName, $serverType)
{
	if ($serverType == undefined)
	{
		$serverType = $routerName;
		$routerName = null;
	}

	if (!$routerName)
	{
		var routerList = g.file.getDirectoryListing(getProjPath("./router"));
		routerList = routerList.map(function (v)
		{
			return g.file.getFileName(v);
		});

		if (routerList.length == 1)
		{
			toAdd(routerList[0], $serverType);
		}
		else if (routerList.length > 1)
		{
			var routerFileList = g.file.getDirectoryListing(getProjPath("./router"));
			showSelectList(routerFileList, function ($select)
			{
				var routerName = g.file.getFileName($select.value);
				toAdd(routerName, $serverType);
			});
		}
		else
		{
			log.error("没有找到router文件!");
			log.info("使用该命令创建router文件: nodecli add {router}");
			process.exit();
		}
	}
	else
	{
		toAdd($routerName, $serverType);
	}

	function toAdd(routerName, serverType)
	{
		if (routerName.indexOf(".json") < 0)
		{
			routerName += ".json";
		}
		routerName = g.file.getFileName(routerName);

		routerName = "./router/" + routerName + ".json";
		if (projExist(routerName))
		{
			var routerTemplatePath = getCliPath("./bin/cli-template/router");
			var serverFileList = g.file.getDirectoryListing(routerTemplatePath);
			var serverTypeList = serverFileList.map(function (v)
			{
				return g.file.getFileName(v)
			});

			if (serverType && serverTypeList.indexOf(serverType) >= 0)
			{
				toCreate(routerName, serverType);
			}
			else
			{
				showSelectList(serverTypeList, function ($select)
				{
					toCreate(routerName, $select.value);
				})
			}
		}
		else
		{
			log.error("没有找到router文件!");
			process.exit();
		}
	}

	function toCreate(routerName, serverType)
	{
		var routerObj = require(getProjPath(routerName));
		var serverObj = require("./cli-template/router/" + serverType + ".json");
		routerObj.info.push(serverObj);
		writeFile(routerName, JSON.stringify(routerObj, null, 2));
		globalCmd.log("Server Type Added: " + serverType);

		var testFilePath = getCliPath("./bin/cli-template/test.js");
		if (!projExist("./module/template.js"))
		{
			copyFile("./bin/cli-template/test.js", "./module/template.js");
			trace("Create File:" + getProjPath("./module/template.js"));
		}
		process.exit();
	}
}

function addModule($moduleName)
{
	if ($moduleName)
	{
		$moduleName = $moduleName.replace(/ /g, "");
	}

	if (!$moduleName)
	{
		showMsg("please input a name for module file：", function ($input)
		{
			$moduleName = $input;
			checkName();
		});
	}
	else
	{
		checkName();
	}

	function checkName()
	{
		if (!$moduleName)
		{
			process.exit();
		}

		if ($moduleName.indexOf(".js") < 0)
		{
			$moduleName += ".js";
		}

		if (projExist("./module/" + $moduleName))
		{
			log.warn("Module is Existd: " + getProjPath("./module/" + $moduleName));
			process.exit();
		}

		addModuleByName();
	}

	function addModuleByName()
	{
		copyFile("./bin/cli-template/module-template.js", "./module/" + $moduleName);
		trace("Create File:" + getProjPath("./module/" + $moduleName));
		process.exit();
	}
}

function addTest($testDir)
{
	if ($testDir)
	{
		$testDir = $testDir.replace(/ /g, "");
	}

	if (!$testDir)
	{
		showMsg("please input a name for test directory：", function ($input)
		{
			$testDir = $input;
			checkName();
		});
	}
	else
	{
		checkName();
	}

	function checkName()
	{
		if (!$testDir)
		{
			process.exit();
		}

		if (projExist("./module/" + $testDir))
		{
			log.warn("Module is Existd: " + getProjPath("./module/" + $testDir));
			process.exit();
		}

		addTestByName();
	}

	function addTestByName()
	{
		copyFile("./bin/cli-template/test-template", "./module/" + $testDir);
		trace("Create Directory:" + getProjPath("./module/" + $testDir));
		process.exit();
	}
}

function addBin($binName)
{
	if ($binName)
	{
		$binName = $binName.replace(/ /g, "");
	}

	if (!$binName)
	{
		showMsg("please input a name for bin file：", function ($input)
		{
			$binName = $input;
			checkName();
		});
	}
	else
	{
		checkName();
	}

	function checkName()
	{
		if (!$binName)
		{
			process.exit();
		}
		addBinByName();
	}

	function addBinByName()
	{
		var packageObj = require(getProjPath("./package.json"));

		if (!packageObj.bin)
		{
			packageObj.bin = {};
		}
		if (!packageObj.bin[$binName])
		{
			packageObj.bin[$binName] = "./bin/" + $binName + ".js";

			if (!projExist("./bin/"))
			{
				g.file.createDirectory(getProjPath("./bin/"));
			}

			copyFile("./bin/cli-template/bin-template.js", "./bin/" + $binName + ".js");
			writeFile("./package.json", JSON.stringify(packageObj, null, "\t"));
			trace("Create File: " + getProjPath("./bin/" + $binName + ".js"));
			process.exit();
		}
		else
		{
			log.warn("已经存在 " + $binName + " : " + packageObj.bin[$binName]);
			process.exit();
		}
	}
}