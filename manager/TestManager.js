/**
 * Created by billy on 2017/5/13.
 */
var g = require("../global");
var Manager = require("./Manager");
var _testCore = require("./test/core");
var _sqlCore = require("./test/sqlCore");
var _timeTool = require("../utils/TimeTool");
var _log = "";
var _errorLog = "";

//这里其实还是用module的方式进行模块化安装

module.exports = class extends Manager {

	init()
	{
		this.managerType = "Test";
		this.list = [];
		this.step = 0;
		_sqlCore.init();
		super.init();
	}

	initModule()
	{
		//此处在初始化模块的时候，是否会存在异步呢？
		//这是极其有可能的，并且其实在执行的时候，也是希望能够一个模块一个模块的去执行
		//那么有没有一个用例就是一个文件呢？
		//用例有自有编号，
		//然后有一个用例清单文件
		//所有文件结构就变成了router文件实际是一个清单？
		//不对，router里面仍然是挂模块，但是模块里面有一个清单
		//每个用例到底是测一个接口？还是测一连串逻辑功能呢？
		//如果是功能性的接口测试，就得设计流程，设计出各种操作流程以验证在不同的处理逻辑下，接口都是可用的。
		//而且这里面还牵涉到组织数据，以及清理数据

		//所以我们来过一下完整的接口测试流程
		//首先构建测试数据（可以使用接口直接进行构建，直接使用sql进行构建）
		//或者也可以一边创建一边删除，因为有的部分是可以用接口去做删除处理的
		//所以如果每个用例是一个文件，那么router里面到底配置啥？list还是path目录
		//如果是list，就需要列举所有的文件，如果单个文件是用例的话，并且只有1个接口的话，那么
		//其实是可以灵活考虑这个文件的，模块用来分割每一次的进度，而1个文件内就直接安装接口调用的列表
		//要么列表这里就支持两种加入方式，加入单个文件，加入单个目录
		//所有router里面加入的list文件路径
		//list文件就是模块
		//最后清理掉所有过程中产生的测试数据
		//所以这里就需要准备一个addModule方法
		for (var routerPath in this.module)
		{
			var modulePath = this.module[routerPath];
			modulePath = __projpath(modulePath);

			this.addModule(routerPath + 1, modulePath);
			//这里要判断路径是目录还是文件，那么这里是否支持，将单个文件进行屏蔽的功能
		}
		this.start();
		//我昨天怎么想的来着
		//首先router得有mysql支持
		//的能生成本次的日志
		//得能单独对某一个接口进行反复测试
		//所以得提供一个http，并且能在http界面上点击进行测试，并返回，这个留着之后升级版
	}

	addModule($name, $path)
	{
		$name += "";
		if (g.file.isDirectory($path))
		{
			if (!g.file.exists($path))
			{
				return;
			}

			var fileList = g.file.getDirectoryAllListing($path);
			for (var i = 0; i < fileList.lengthl; i++)
			{
				var filePath = fileList[i];
				if (g.file.getExtension(filePath) != "js")
				{
					fileList.splice(i, 1);
					i--;
				}
			}

			fileList.sort(function (a, b)
			{
				var a0 = a.substr(0, a.indexOf(".")) - 0;
				var b0 = a.substr(0, b.indexOf(".")) - 0;
				if (isNaN(a0) && isNaN(b0))
				{
					return compareString(a, b);
				}
				else
				{
					if (!isNaN(a0) && !isNaN(b0))
					{
						return a0 - b0;
					}
					else
					{
						return isNaN(a0) ? 1 : -1;
					}
				}
			})
			this.list.push([$name, fileList]);
		}
		else
		{
			if ($path.indexOf(".js") != $path.length - 3)
			{
				$path += ".js";
			}

			if (!g.file.isFile($path)) //不是文件就返回
			{
				return;
			}

			if (g.file.getExtension($path) != "js")
			{
				return;
			}

			this.list.push([$name, $path]);
		}
	}

	start()
	{
		super.start();
		this.initTest(); //此处有一个不断执行的逻辑，放在哪一层级比较合理？

		global.emiter.addListener("ALL_INITED", ()=>
		{
			this.startDataInit();
		});
	}

	initTest()
	{
		_testCore.init(this.data.param);
		_testCore.on("COMPLETE", ($log)=>
		{
			_log += "[Module] - " + this.list[this.step][0] + "\r\n";
			_log += $log;
			this.step++;
			this.startTest();
		})
		log.info("[Test] " + this.name);
	}

	startDataInit()
	{
		this.startTest();
	}

	startTest()
	{
		if (this.step >= this.list.length)
		{
			log.success("--------------------------- All Test Done! ---------------------------");

			var time = _timeTool.getFullDate();
			time = time.replace(/:/g, ".");
			g.fs.writeFileSync(__projpath("./log/" + time + ".txt"), _log);
			process.exit();
		}
		else
		{
			var name = this.list[this.step][0];
			log.info("[Test] - " + name);
			var filePath = this.list[this.step][1];
			if (typeof filePath == "string")
			{
				log._info(g.file.getRelativePath(__projdir, filePath));
				require(filePath);
			}
			else if (Array.isArray(filePath))
			{
				for (var i = 0; i < filePath.length; i++)
				{
					log._info(g.file.getRelativePath(__projdir, filePath[i]));
					trace(filePath[i])
					require(filePath[i]);
				}
			}
			_testCore.startTest();
		}
	}
}
