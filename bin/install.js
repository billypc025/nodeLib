/**
 * Created by billy on 2017/5/13.
 */
var exe = require("child_process").execSync;
var path = require("path");
var fs = require("fs");
var os = require("os");

init();
trace("----------开始初始化及安装---------");
var cnpmInfo = exe("cnpm");
if (cnpmInfo.length < 400)
{
	trace("没有找到淘宝镜像，现在开始安装");
	exe("npm install -g cnpm --registry=https://registry.npm.taobao.org");
	trace("淘宝镜像全局安装成功");
}
trace("开始安装模块");
exe("cnpm install");
trace("模块安装完毕");
var editInfo = os.platform().indexOf("win32") >= 0 ? "#!node" : "#!/usr/bin/env node";
var packageJson = require("../package.json");
if (packageJson.bin && Object.keys(packageJson.bin).length > 0)
{
	for (var k in packageJson.bin)
	{
		var file = path.resolve(packageJson.bin[k]);

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
			fileContent = fileContent.replace(/#!.+/g, "{$EDIT_INFO}");
			if (fileContent.indexOf("{$EDIT_INFO}") >= 0)
			{
				fileContent = fileContent.replace("{$EDIT_INFO}", editInfo);
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
exe("npm link");
trace("ALL DONE -----------------------------");
process.exit();

function init()
{
	var infoNum = 0;
	global.trace = function ($msg)
	{
		infoNum++;
		console.log(infoNum + ". " + $msg);
	}
}