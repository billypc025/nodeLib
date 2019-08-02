/**
 * Created by billy on 2017/8/26.
 */
var g = require("../global");
var Manager = require("./Manager");

var _defaultPort = 80;
var _defaultPath = "/index.html";

module.exports = class extends Manager {
	init()
	{
		this.port = this._data.port;
		this.defaultPath = this._data.defaultPath || _defaultPath;
		super.init();
	}

	start()
	{
		this.initServer();
	}

	initServer()
	{
		this.server = require('express')();
		var http = require('http').createServer(this.server);
		this.server.all('*', function ($request, $response)
		{
			var func = this.getFunc($request.path);
			var query = $request.query;
			this.doRequest(func, query, $request, $response);
			$response.send('<h6>Welcome Realtime Server</h6>');
		});
		http.listen(this.port, ()=>
		{
			log.info("[Express] " + this._managerData.name + ": Server runing at port: " + this.port + ".");
			super.start();
		});
	}

	doRequest($pathFunc, $dataObj, $request, $response)
	{
		if ($pathFunc)
		{
			$pathFunc($dataObj,
				function ($resultObj, $headerObj, $responseType)
				{

				}, function ($errorObj, $headerObj)
				{

				}, $request);
		}
		else
		{
			log._warn("[Http] Not Found Func: ", $pathName);
		}
	}
}