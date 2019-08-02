/**
 * Created by billy on 2017/7/10.
 */
var path = require("path");
var fs = require("fs");

var _fileHash = new Map();

/**
 * 读取文件/文件集
 * @param $path 目录路径
 * @param $option {containChildren:true/false, filters:*全部/[]扩展名列表}
 */
exports.add = function ($path, $option)
{
	$option = formatOption($option);

	if (fs.existsSync($path))
	{
		readFile($path, 0);
	}

	function readFile($_path, $depth)
	{
		if (isDirectory($_path))
		{
			if ($depth > 0 && $option.containChildren || !$option.containChildren)
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
				_fileHash.set(pathObj.base, fs.readFileSync($_path).toString());
			}
		}
	}
}

exports.get = function ($fileName, $options)
{
	if (_fileHash.has($fileName))
	{
		return replaceVal(_fileHash.get($fileName), $options);
	}
	else
	{
		this.add($fileName);
	}

	function replaceVal($content, $option)
	{
		if ($option && getType($option) == "Object")
		{
			for (var k in $option)
			{
				$content = replaceValByKey($content, k, $option[k]);
			}
		}
		return $content;
	}

	function replaceValByKey($content, $key, $value)
	{
		var r = new RegExp("\\{\\$" + $key + "\\}", "g");

		if ($fileName.indexOf(".sql") > 0 && typeof $value == "string")
		{
			$value = $value.replace(/\'/g, "\\'");
		}

		return $content.replace(r, $value);
	}
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