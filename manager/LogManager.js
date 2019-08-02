/**
 * Created by billy on 2018/3/12.
 */

var _interval = 5;
var _timeTool = require("../utils/TimeTool");
var _hash = {};

var LogManager = class {
	constructor($param)
	{
		this.name = "system";
		this.interval = _interval * 1000;
		this.log = "";
		this.intervalId = 0;
		this.isStart = false;
		this.init($param);
	}

	init($param)
	{
		if ($param)
		{
			$param.hasOwnProperty("interval") && (this.interval = $param.interval * 1000);
			$param.hasOwnProperty("name") && (this.name = $param.name);
		}

		if (!this.isStart)
		{
			this.isStart = true;
			this.intervalId = setInterval(()=>
			{
				if (this.log)
				{
					saveLog(this.name, this.log);
					this.log = "";
				}
			}, this.interval);
		}
	}

	out(...arg)
	{
		var noRN = false;
		if (arg.length > 1 && arg[arg.length - 1] == "@")
		{
			noRN = true;
			arg.pop();
		}

		if (!noRN)
		{
			this.log += "【" + _timeTool.getFullDate() + "】\r\n";
		}
		for (var outObj of arg)
		{
			this._addLog(outObj);
		}

		if (!noRN)
		{
			this.log += "\r\n\r\n";
		}

		if (this.log.split("\r\n").length > 100)
		{
			saveLog(this.name, this.log);
			this.log = "";
		}
	}

	_addLog($outObj)
	{
		if (typeof $outObj != "string" && typeof $outObj != "number")
		{
			this.log += JSON.stringify(debug($outObj));
		}
		else
		{
			this.log += $outObj + "";
		}

		if (this.log)
		{
			this.log += "\r\n";
		}
	}
}

function saveLog($name, $log)
{
	if ($log != "")
	{
		//获取今日的日志文件路径，然后进行写入操作
		var fullDateArr = _timeTool.getFullDateArray(0, true);
		var dateStr = fullDateArr[0] + "-" + fullDateArr[1] + "-" + fullDateArr[2];
		var timeStr = fullDateArr[3] + ".00.00";
		var filePath = __projpath("./log/" + dateStr + "/" + $name + "_" + timeStr + ".txt");
		var basePath = g.path.dirname(filePath);
		if (g.fs.existsSync(basePath))
		{
			try
			{
				//文件夹路径存在，可以写入文件
				if (!g.fs.existsSync(filePath))
				{
					g.fs.writeFile(filePath, $log, function ()
					{
					});
				}
				else
				{
					g.fs.appendFile(filePath, $log, function ()
					{
					});
				}
			}
			catch (e)
			{
				trace($log);
			}
		}
		else
		{
			//文件夹路径不存在，创建文件夹
			g.file.createDirectory(basePath);
			if (!g.fs.existsSync(filePath))
			{
				g.fs.writeFile(filePath, $log);
			}
			else
			{
				g.fs.appendFile(filePath, $log);
			}
		}
	}
}

_hash["system"] = new LogManager({name: "system"});
module.exports = function ($param)
{
	if ($param && $param.name)
	{
		if (!_hash[$param.name])
		{
			_hash[$param.name] = new LogManager($param);
		}

		return _hash[$param.name];
	}

	return _hash["system"];
}