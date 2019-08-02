/**
 * Created by billy on 2017/7/10.
 */
var path = require("path");
var fs = require("fs");
var _hash = {};
exports.txtFileList = [".html", ".js", ".json", ".htm", ".txt", ".ini", ".sql", ".sql", ".css", ".scss", ".log"];

class FilePool {
	constructor()
	{
		this.fileHash = {};
	}

	/**
	 * 加入文件池/文件集
	 * @param $path 目录路径
	 * @param $option {containChildren:true/false, filters:*全部/[]扩展名列表}
	 */
	add($path, $option)
	{
		$option = formatOption($option);
		var fileHash = this.fileHash;

		if (fs.existsSync($path))
		{
			readFile($path, 0);
		}

		function readFile($_path, $depth)
		{
			if (isDirectory($_path))
			{
				if ($depth > 0 && $option.containChildren || !$option.containChildren || $depth == 0)
				{
					var sqlFileList = fs.readdirSync($_path);
					for (var i = 0; i < sqlFileList.length; i++)
					{
						var fileName = sqlFileList[i];
						var filePath = path.resolve($_path, fileName);
						readFile(filePath, $depth + 1);
					}
				}
			}
			else
			{
				var pathObj = path.parse($_path);
				if (!$option.filters || $option.filters.indexOf("*") >= 0 || $option.filters.indexOf(pathObj.ext) >= 0)
				{
					var fileContent = fs.readFileSync($_path);
					if (exports.isTxtFile(pathObj.ext))
					{
						fileContent = fileContent.toString();
					}

					fileHash[pathObj.base] = fileContent;
				}
			}
		}
	}

	/**
	 * 读取文件/文件集
	 * @param $path 目录路径
	 * @param $option {containChildren:true/false, filters:*全部/[]扩展名列表}
	 */
	get($fileName, $options)
	{
		var content = this.fileHash[$fileName];
		if (content)
		{
			return replaceVal($fileName, content, $options);
		}
		else
		{
			this.add($fileName);
		}
	}
}

exports.get = function ($name)
{
	$name = $name || "/";
	if (!_hash[$name])
	{
		_hash[$name] = new FilePool();
	}
	return _hash[$name];
}

function replaceVal($fileName, $content, $option)
{
	if ($option && getType($option) == "Object")
	{
		for (var k in $option)
		{
			$content = replaceValByKey($fileName, $content, k, $option[k]);
		}
	}
	return $content;
}

function replaceValByKey($fileName, $content, $key, $value)
{
	var r = new RegExp("\\{\\$" + $key + "\\}", "g");

//	if ($fileName.indexOf(".sql") > 0 && typeof $value == "string")
//	{
//		$value = $value.replace(/\'/g, "\\'");
//	}

	return $content.replace(r, $value);
}

function formatOption($option)
{
	$option = __merge({}, $option);
	$option.containChildren = $option.containChildren || false;
	$option.filters = $option.filters || ["*"];
	return $option;
}

function isDirectory($path)
{
	try
	{
		var stat = fs.statSync($path);
	}
	catch (e)
	{
		return false;
	}
	return stat.isDirectory();
}

exports.isTxtFile = function ($extName)
{
	return exports.txtFileList.indexOf($extName) >= 0;
}