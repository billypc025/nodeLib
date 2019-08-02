/**
 * Created by billy on 2019/4/24.
 */
var qs = require('querystring');

function response($res, $content)
{
	if (typeof $content == "string")
	{
		$res.writeHead(200, {"Content-Type": "text/html"});
	}
	else if (typeof $content == "number")
	{
		$content = JSON.stringify(formatResponse("", null, $content));
		$res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
	}
	else if (typeof $content == "object")
	{
		$content = JSON.stringify(formatResponse("", $content));
		$res.writeHead(200, {"Content-Type": "application/json;charset=utf-8"});
	}
	if ($content)
	{
		$res.write($content, "utf8", function ()
		{
			$res.end();
		});
	}
	else
	{
		$res.end();
	}
}
exports.response = response;

function getPostData($request)
{
	var promise = new Promise((resolved, reject)=>
	{
		var postData = "";
		$request.addListener("data", function (data)
		{
			postData += data.toString();
		});
		$request.addListener("end", function ()
		{
			let query;
			if ((postData.charAt(0) == "{" && postData.charAt(postData.length - 1) == "}")
				|| (postData.charAt(0) == "[" && postData.charAt(postData.length - 1) == "]"))
			{
				try
				{
					query = JSON.parse(postData);
				}
				catch (e)
				{
					query = qs.parse(postData);
				}
			}
			else
			{
				query = qs.parse(postData);
			}

			resolved(query);
		});
	})

	return promise;
}
exports.getPostData = getPostData;

function getManagerInfo($managerObj)
{
	var results = [];
	if ($managerObj.type == "mysql")
	{
		let param = $managerObj.param;
		results.push(info("Host", param.host));
		results.push(info("DB", param.database));
		results.push(info("User", param.user));
	}
	else if ($managerObj.type == "redis")
	{
		let param = $managerObj.param;
		results.push(info("Host", param.host));
		results.push(info("Port", param.port));
	}
	else if ($managerObj.type == "script")
	{
		let module = $managerObj.module;
		if (module)
		{
			let arr = Object.keys(module);
			results.push(mod(arr[0], module[arr[0]]));
		}
	}
	else if ($managerObj.type == "http")
	{
		let param = $managerObj.param;
		if (param)
		{
			if (param.protocol)
			{
				results.push(mark("Https"));
			}
			if (param.port)
			{
				results.push(info("Port", param.port));
			}
		}
		let module = $managerObj.module;
		if (module)
		{
			let arr = Object.keys(module);
			for (var modName of arr)
			{
				results.push(mod(modName, module[modName]));
			}
		}
	}
	else if ($managerObj.type == "socket")
	{
		let param = $managerObj.param;
		if (param)
		{
			var isHttpServer = false;
			if (param.protocol)
			{
				if (param.protocol != "https")
				{
					isHttpServer = true;
					results.push(mark("Https", param.protocol));
				}
				else
				{
					results.push(mark("Https"));
				}
			}
			if (param.path)
			{
				results.push(info("Path", param.path));
			}

			if (isHttpServer)
			{
				results.push(info("Port", g.data.manager.getManager(param.protocol).data.param.port));
			}
			else if (param.port)
			{
				results.push(info("Port", param.port));
			}
		}
		let module = $managerObj.module;
		if (module)
		{
			let arr = Object.keys(module);
			for (var modName of arr)
			{
				results.push(mod(modName, module[modName]));
			}
		}
	}

	return results;

	function info($name, $val)
	{
		return {
			type: 1,
			name: $name,
			val: $val
		}
	}

	function mod($name, $val)
	{
		return {
			type: 2,
			name: $name,
			val: $val
		}
	}

	function mark($name, $val)
	{
		return {
			type: 3,
			name: $name,
			val: $val
		}
	}
}
exports.getManagerInfo = getManagerInfo;