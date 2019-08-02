/**
 * Created by billy on 2017/9/6.
 */
var exec = require('child_process').exec;

exports.get = function (...arg)
{
	var child = new EXEC_CHILD();
	child.add.apply(child, arg);
	return child;
}

function EXEC_CHILD(...arg)
{
	this.cmdList = [];
	this.add.apply(this, arg);
}

function add(...arg)
{
	if (arg.length == 0)
	{
		return;
	}

	for (var i = 0; i < arg.length; i++)
	{
		var cmd = arg[i];
		if (typeof cmd == "string")
		{
			cmd = trim(cmd);
		}
		this.cmdList.push(cmd);
	}
}
EXEC_CHILD.prototype.add = add;

function show()
{
	return this.cmdList.join(" ");
}
EXEC_CHILD.prototype.show = show;

function exe($callBack, $errorBack)
{
	return new Promise((resolved, reject)=>
	{
		if (this.cmdList.length == 0)
		{
			$errorBack && $errorBack("requset some cmd");
			reject("requset some cmd");
		}
		else
		{
			var cmdStr = this.cmdList.join(" ");
			this.cmdList = [];
			exec(cmdStr, function ($error, $stdout, $stderr)
			{
				if ($error)
				{
					$errorBack && $errorBack($error, $stderr);
					reject($error, $stderr);
				}
				else
				{
					$callBack && $callBack($stdout);
					resolved($stdout);
				}
			});
		}
	});
}
EXEC_CHILD.prototype.exe = exe;

function exeResult()
{
	return new Promise((resolved, reject)=>
	{
		if (this.cmdList.length == 0)
		{
			reject({
				state: 0,
				msg: "requset some cmd"
			});
		}
		else
		{
			var cmdStr = this.cmdList.join(" ");
			this.cmdList = [];
			exec(cmdStr, function ($error, $stdout, $stderr)
			{
				if ($error)
				{
					reject({
						state: 0,
						msg: $error,
						stderr: $stderr
					});
				}
				else
				{
					resolved({
						state: 1,
						stdout: $stdout
					});
				}
			});
		}
	});
}
EXEC_CHILD.prototype.exeResult = exeResult;