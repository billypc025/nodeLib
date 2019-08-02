/**
 * Created by billy on 2017/8/26.
 */
var g = require("../global");
var Manager = require("./Manager");

module.exports = class extends Manager {

	init()
	{
		this.managerType = "Script";
		var args = getArgs();
		args.shift();
		args.shift();

		this.defaultPath = this.param.path || "";
		this.defaultParam = this.param.param || {};

		if (args[0])
		{
			if (args[0].indexOf(".") > 0)
			{
				this.defaultPath = args[0];
				this.defaultParam = args[1] || this.defaultParam;
			}
			else
			{
				if (args[1])
				{
					this.defaultParam = args[1] || this.defaultParam;
				}
				else
				{
					this.defaultParam = args[0] || this.defaultParam;
				}
			}
		}

		super.init();
	}

	start()
	{
		super.start();
		setTimeout(()=>
		{
			this.startScript(this.defaultPath, this.defaultParam);
		}, 500);
	}

	startScript($path, $param)
	{
		if ($path == "noscript")
		{
			return;
		}

		if ($path)
		{
			var func = this.getFunc($path);
			if (func)
			{
				log.info(this.getMsg("starting script..."));
				func($param,
					($resultObj, $exit)=>
					{
						if ($resultObj)
						{
							log.info(this.getMsg("the result following:"));
							trace("");
							trace($resultObj);
							trace("");
						}
						log.success(this.getMsg("Done!"));
						if ($exit)
						{
							process.exit();
						}
					}, ($errorMsg)=>
					{
						log.error(this.getMsg("Error:", $errorMsg));
					})
			}
			else
			{
				log.error(this.getMsg("not found script:", $path));
			}
		}
		else
		{
			log.error(this.getMsg("no script path！"));
		}
	}
}