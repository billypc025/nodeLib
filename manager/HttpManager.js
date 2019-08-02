/**
 * Created by billy on 2017/5/13.
 */

var g = require("../global");
var http = require('http');
var https = require('https');
var url = require('url');
var qs = require('querystring');
var _module = require("../module/module");
var Manager = require("./Manager");
var cookie = require("node-cookie");
var nodeLibTool = require("../module/nodelib-tool");
var _local = require("../utils/localhost");
var _timeTool = require("../utils/TimeTool");
var types = {
	"css": "text/css",
	"gif": "image/gif",
	"html": "text/html",
	"ico": "image/x-icon",
	"jpeg": "image/jpeg",
	"jpg": "image/jpeg",
	"js": "text/javascript",
	"json": "application/json",
	"pdf": "application/pdf",
	"png": "image/png",
	"svg": "image/svg+xml",
	"swf": "application/x-shockwave-flash",
	"tiff": "image/tiff",
	"txt": "text/plain",
	"wav": "audio/x-wav",
	"wma": "audio/x-ms-wma",
	"wmv": "video/x-ms-wmv",
	"xml": "text/xml"
};

var _defaultPort = 8080;
var _header = {
	"Content-Type": "application/json;charset=utf-8",
	"Access-Control-Allow-Origin": "*",
	"Access-Control-Allow-Credentials": "true",
	'Access-Control-Allow-Methods': "PUT,POST,GET,DELETE,OPTIONS",
	"Access-Control-Allow-Headers": "X-Requested-With",
}
g.cookie = cookie;

module.exports = class extends Manager {

	init()
	{
		var statusName = "status";
		var successStatus = 1;
		var failStatus = 0;
		var dataName = "data";
		var errorName = "error";
		var errorMsg = "";

		if (this.param && this.param.hasOwnProperty("req"))
		{
			if (this.param.req.result)
			{
				statusName = this.param.req.result.name || statusName;
				successStatus = this.param.req.result.success || successStatus;
				failStatus = this.param.req.result.fail || failStatus;
			}
			if (this.param.req.data)
			{
				dataName = this.param.req.data.name || dataName;
			}
			if (this.param.req.error)
			{
				errorName = this.param.req.error.name || errorName;
			}
			if (this.param.req.errorMsg)
			{
				errorMsg = this.param.req.errorMsg.name || errorMsg;
			}

			//不对，这里应该是将程序里面返回的{code:222}，进行分割处理
			//但是这些error其实是业务逻辑自己返回的，所以其实是可以定义的
			//那么其中一种就可以是对status字段进行覆盖处理
		}

		this.webParam = null;
		if (this.param && this.param.hasOwnProperty("param"))
		{
			this.webParam = this.param.param;
		}

		global.formatResponse = function ($cmd, $dataObj, error)
		{
			var result = {cmd: $cmd};
			result[statusName] = successStatus;
			result[dataName] = $dataObj;

			//这里就需要对结构进行定义
			if (error)
			{
				result.status = failStatus;
				result[errorName] = error;

				if (errorMsg.indexOf(".") > 0)
				{

				}
				else
				{
					result[errorMsg] = error.msg;
				}
			}
			return result;
		}

		this.managerType = "Http";
		this.server = null;
		this.header = __merge(_header, this.param.header, true);
		this.port = this.param.port || _defaultPort;
		this.protocol = this.param.protocol || "http";
		if (this.param.htmlTemplate)
		{
			var templatePath = __projpath(this.param.htmlTemplate);
			if (g.file.exists(templatePath))
			{
				this.filePool = g.data.file.get("/template");
				this.filePool.add(templatePath, {containChildren: true});
			}
			else
			{
				log.error(this.getMsg("htmlTemplate does not exist", templatePath));
			}

			if (this.param.router)
			{
				this.router = this.param.router;
			}
		}
		super.init();
	}

	start()
	{
		this.initServer();
		super.start();
	}

	initServer()
	{
		var server;
// 		trace(this.protocol == "https", this.param.httpsOptions)
		if (this.protocol == "https" && this.param.httpsOptions && this.param.httpsOptions.key && this.param.httpsOptions.cert && !(this.param.checkLocal && ip.indexOf("192.168") == 0))
		{
			this.param.httpsOptions.key = g.fs.readFileSync(this.param.httpsOptions.key);
			this.param.httpsOptions.cert = g.fs.readFileSync(this.param.httpsOptions.cert);
			server = https.createServer(this.param.httpsOptions, (request, response)=>
			{
				if (!this.param.hasOwnProperty("method")
					|| this.param.method == ""
					|| this.param.method == "*"
					|| this.param.method.tolowercase() == request.method.tolowercase())
				{
					var paramObj = url.parse(request.url);
					var nodelibCmd = nodeLibTool.check(paramObj.pathname);
					if (nodelibCmd)
					{
						nodeLibTool.exe(nodelibCmd, request, response);
					}
					else
					{
						var func = this.getFunc(paramObj.pathname);
						if (request.method && doMethod[request.method])
						{
							request.webParam = this.webParam;
							request.ip = _local.getLocalIp(request);
							doMethod[request.method](this.router, func, paramObj.pathname, request, response, this.header);
						}
					}
				}
			});
		}
		else
		{
			server = http.createServer((request, response)=>
			{
				if (!this.param.hasOwnProperty("method")
					|| this.param.method == ""
					|| this.param.method == "*"
					|| this.param.method.tolowercase() == request.method.tolowercase())
				{
					var paramObj = url.parse(request.url);
					var nodelibCmd = nodeLibTool.check(paramObj.pathname);
					if (nodelibCmd)
					{
						nodeLibTool.exe(nodelibCmd, request, response);
					}
					else
					{
						var func = this.getFunc(paramObj.pathname);
						if (request.method && doMethod[request.method])
						{
							log.success(paramObj.pathname + ": " + _timeTool.getFullDate(0, true));
							request.webParam = this.webParam;
							doMethod[request.method](this.router, func, paramObj.pathname, request, response, this.header);
						}
					}
				}
			});
		}

		server.listen(this.port);
		this.server = server;
		g.data.server.addServer(this.name, this.server);
		log.info(this.getMsg("Server runing at port:", this.port));
	}

	close($callBack)
	{
		var promise = new Promise((resolved, reject)=>
		{
			if (this.server)
			{
				this.server.close($callBack);
				resolved();
			}
		})
		return promise;
	}
}

var doMethod = {
	GET: function ($router, $func, $pathName, $request, $response, $header)
	{
		let query = url.parse($request.url, true).query;
		$request.requestData = query;
		doRequest($router, $func, $pathName, query, $request, $response, $header);
	},
	POST: function ($router, $func, $pathName, $request, $response, $header)
	{
		if ($pathName.indexOf("/upload") > 0)
		{
			let query = url.parse($request.url, true).query;
			doRequest($router, $func, $pathName, query, $request, $response, $header);
		}
		else
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
				$request.requestData = query;
				doRequest($router, $func, $pathName, query, $request, $response, $header);
			});
		}
	},
	OPTIONS: function ($router, $func, $pathName, $request, $response, $header)
	{
		$response.statusCode = 204;
		writeOut(204, "", $request, $response, {
			"Content-Type": "application/json;charset=utf-8",
			"Access-Control-Allow-Headers": "X-Requested-With,content-type"
		}, "", $header);
	}
}

function doRequest($router, $pathFunc, $pathName, $dataObj, $request, $response, $header)
{
	if ($pathFunc)
	{
		formatDataObj($dataObj);
		$pathFunc($dataObj,
			function ($resultObj, $headerObj, $responseType, $noFormat)
			{
				if ($responseType == "template")
				{
					$resultObj = __merge($resultObj || {}, {host: $request.headers.host || ""})
					var content = g.data.file.get("/template").get($headerObj, $resultObj);
					if (content)
					{
						writeOut(200, content, $request, $response, {"Content-Type": "text/html"}, "text", $header);
					}
				}
				else
				{
					if (!$noFormat)
					{
						$resultObj = formatResponse($pathName, $resultObj);
					}
					writeOut(200, $resultObj, $request, $response, $headerObj, $responseType, $header);
				}
			}, function ($errorObj, $headerObj, $noFormat)
			{
				if (!$noFormat)
				{
					$errorObj = formatResponse($pathName, null, $errorObj);
				}
				writeOut(200, $errorObj, $request, $response, $headerObj, "", $header);
			}, $request, $response);
	}
	else
	{
		if ($router && $router[$pathName])
		{
			var path = $router[$pathName];
			var fileType = getFileType(path);
			if (fileType != "none")
			{
				var content = g.data.file.get("/template").get(path, {host: $request.headers.host || ""});
				if (content)
				{
					writeOut(200, content, $request, $response, {"Content-Type": "text/html"}, "text", $header);
				}
			}
		}
		else
		{
//		log._warn(this.getMsg("Not Found Func-", $pathName));
			writeOut(404, "", $request, $response);
		}
	}
}

function writeOut($status, $resultObj, $request, $response, $headerObj, $responseType, $header)
{
	var header = __merge({}, $header, true);
	header = __merge(header, $headerObj, true);
	if (header["Access-Control-Allow-Origin"] && header["Access-Control-Allow-Origin"] == "{origin}")
	{
		header["Access-Control-Allow-Origin"] = $request.headers.origin || "*";
	}

	$response.writeHead($status, header);
	if ($responseType == "download")
	{
//		$resultObj.on("data", (chunk) =>
//		{
//			trace(123123)
//			$response.write(chunk, "binary")
//		});
//		$resultObj.on("end", function ()
//		{
//			$response.end();
//		});

		let fileStream = g.fs.createReadStream($resultObj.data);
		fileStream.pipe($response);
	}
	else if ($responseType == "downloadBuff")
	{
		let fileStream = $resultObj.data;
		fileStream.pipe($response).on("finish", () => $response.end());
	}
	else if ($responseType == "text")
	{
		$response.write($resultObj, "utf8", function ()
		{
			$response.end();
		});
	}
	else
	{
		if ($status == 404)
		{
			$response.end();
		}
		else
		{
			if ($resultObj)
			{
				$response.write(JSON.stringify($resultObj), "utf8", function ()
				{
					$response.end();
				});
			}
			else
			{
				$response.end();
			}
		}
	}
}

var _fileTypeHash = {
	"txt": "text",
	"html": "text/html",
	"htm": "text/html",
	"js": "text/javascript",
	"json": "application/json; charset=utf-8"
};
function getFileType($fileName)
{
	var pathObj = g.path.parse($fileName);
	var ext = pathObj.ext.substr(1);
	return _fileTypeHash[ext] || "none";
}

function formatDataObj($dataObj)
{
	for (var k in $dataObj)
	{
		var val = $dataObj[k];
		if (typeof val == "string" && val.length < 11)
		{
			if (isNum(val))
			{
				$dataObj[k] = val - 0;
			}
		}
	}
}