/**
 * Created by billy on 2017/8/21.
 */
var path = require("path");
var file = require("fs");
var fs = require("./FileUtil");
var exec = require('child_process').exec;

module.exports = function ($sourcePath, $outputFile, $password, $callBack)
{
	if ($sourcePath == undefined)
	{
		$callBack && $callBack({
			status: 1,
			msg: "需要指定一个待压缩的目标文件或文件夹！"
		});
	}

	$password = $password || "";

	var fileDirName = "";

	$sourcePath = path.resolve($sourcePath);
	if (!fs.exists(path.resolve($sourcePath)))
	{
		$callBack && $callBack({
			status: 2,
			msg: "待压缩的目标文件或文件夹不存在！"
		});
	}

	var basePath = fs.getDirectory($sourcePath);

	if (fs.isFile($sourcePath))
	{
		fileDirName = new Date().getTime() + "";
		fileDirName = path.join(basePath, fileDirName);
		fs.createDirectory(fileDirName);
		fs.copy($sourcePath, fileDirName);

	}

	if (!$outputFile)
	{
		$outputFile = path.join(basePath, fs.getFileName($sourcePath));
	}
//	else if (outputFile.indexOf("$") >= 0)
//	{
//		outputFile = outputFile.replace("$", basePath + fs.getFileName(sourcePath))
//	}

	if ($outputFile.indexOf(".zip") < 0)
	{
		$outputFile += ".zip";
	}

	if (fileDirName)
	{
		$sourcePath = fileDirName;
	}

	var compilerPath = path.join(__dirname, "ZipTool_v1.0.2.jar");
	compilerPath = addQuotes(compilerPath);
	$outputFile = addQuotes($outputFile);
	$sourcePath = addQuotes($sourcePath);
	var cmd = getGlobalJava() + " ";
	cmd += "-jar " + compilerPath + " ";
	cmd += "zip " + $outputFile + " ";
	cmd += $sourcePath + " ";
	cmd += $password || "";
	var zip = exec(cmd);
//	zip.stdout.on("data", function (data)
//	{
//		globals.log(data);
//	});
//	zip.stderr.on("data", function (data)
//	{
//		console.log(data);
//	});
	zip.on("exit", function (result)
	{
		if (result == 0)
		{
			if (fileDirName)
			{
				fs.remove(fileDirName);
			}
			$callBack && $callBack({
				status: 0,
				msg: ""
			});
		}
		else
		{
			console.error("打包出现异常！");
		}
	});
}

function getGlobalJava()
{
	var JAVA_EXT = process.platform == 'win32' ? '.exe' : '';

	var java = path.join(process.execPath, "../jre/bin", "java" + JAVA_EXT);
	if (!file.exists(java))
	{
		java = null;
		if (process.env["JAVA_HOME"])
		{
			if (process.env["JAVA_HOME"].indexOf("bin") > 0)
			{
				java = path.join(process.env["JAVA_HOME"], "java" + JAVA_EXT);
			}
			else
			{
				java = path.join(process.env["JAVA_HOME"], "bin", "java" + JAVA_EXT);
			}
			if (!file.existsSync(java))
			{
				java = null;
			}
		}
	}
	if (!java)
	{
		java = "java";
	}
	else
	{
		java = '"' + java + '"';
	}
	return java;
}

function addQuotes(str)
{
	return "\"" + str + "\"";
}

function createZipFile($sourcePath, $outputFile, $call, $password)
{
	var compilerPath = path.join(__dirname, "ZipTool_v1.0.2.jar");
	var exe = require("./childProcess").get();
	exe.add(getGlobalJava());
	exe.add("-jar", compilerPath, "zip", $outputFile, $sourcePath, $password || "");
	exe.exe($call, function ($error, $errMsg)
	{
		console.log($errMsg);
	})
}