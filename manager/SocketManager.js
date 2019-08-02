/**
 * Created by billy on 2017/4/25.
 */
var g = require("../global");
var Manager = require("./Manager");
var time = require("../utils/TimeTool");
var _defaultPort = 12000;

g.data.clientPool = require("../data/SocketClientPool");

module.exports = class extends Manager {
	init()
	{
		this.disconnectCallList = [];
		this.managerType = "Socket";
		this.clientPool = g.data.clientPool.get(this.name);
		this.server = null;
		this.port = this.param.port || _defaultPort;
		this.requireLogin = !!this.param.requireLogin;
		this.timeoutId = 0;
		if (this.requireLogin)
		{
			var varType = typeof this.param.requireLogin;
			this.loginTimeout = 5000;
			this.loginModule = "/login/login";
			if (varType == "object")
			{
				this.loginTimeout = this.param.requireLogin.timeout || this.loginTimeout;
				this.loginModule = this.param.requireLogin.module || this.loginModule;
			}
			else if (varType == "number")
			{
				this.loginTimeout = this.param.requireLogin;
			}
			else if (varType == "string")
			{
				this.loginModule = this.param.requireLogin;
			}
		}
		this.loginTimeoutList = [];
		super.init();
	}

	start()
	{
		this.initServer();
		super.start();
	}

	addListener($type, $target, $func)
	{
		if ($type == "disconnect")
		{
			this.disconnectCallList.push([$target, $func]);
		}
	}

	initServer()
	{
		this.server = require("socket.io")(this.param);
		g.data.server.addServer(this.name, this.server);
		if (this.param.redis && !isEmpty(this.param.redis))
		{
			try
			{
				var redis = require('socket.io-redis');
				this.server.adapter(redis(this.param.redis));
			}
			catch (e)
			{
				log.error(this.getMsg("不存在的redis"));
			}
		}

		this.server.on('connection', ($client)=>
		{
//			var startTime = 0;
//			startTime = Date.now();
//			trace("[connection]", $client.client.id);
//			for (var n in $client.client.server.nsps)
//			{
//				trace(n);
//			}
			this.clientPool.add($client);

			if (this.requireLogin)
			{
				this.addLoginCheckList($client.id);
			}
			else
			{
				this.clientPool.addList($client.id);
			}

			$client.onevent = ($data)=>
			{
				//返回结构如下：
				//{type:2,nsp:'/',data:[eventType,params]};
//				log.log("[Socket] " + this.name + "[recieved]", $data)
				var clientData = this.clientPool.get($client.id);
				if (!this.requireLogin || (clientData && clientData.isLogin))
				{
					go(this, $data, clientData);
				}
				else if ($data.data.length > 0 && $data.data[0] == "login")
				{
					//这里应该使用一个标准回调，module里面只负责逻辑
					$data.data.shift();
					$data.data.unshift(this.loginModule);
					go(this, $data, clientData, ($returnData, $client)=>
					{
						this.clientPool.addList($client.id);
						this.removeLoginCheckList($client.id);
					}, ($returnData, $client)=>
					{
						this.clientPool.remove($client.id);
						this.removeLoginCheckList($client.id);
						$client.isLogin && $client.disconnect();
					});
				}
			}

			$client.on('disconnect', ()=>
			{
				for (var i = 0; i < this.disconnectCallList.length; i++)
				{
					var target = this.disconnectCallList[i][0];
					var func = this.disconnectCallList[i][1];
					func.call(target, $client.id);
				}
				this.clientPool.remove($client.id);
//				trace(Date.now() - startTime);
//				trace("[disconnect]", $client.client.id);

			});
		});

		if (this.param.protocol)
		{
			if (this.param.protocol == "https" && this.param.httpsOptions && this.param.httpsOptions.key && this.param.httpsOptions.cert && !(this.param.checkLocal && ip.indexOf("192.168") == 0))
			{
				this.param.httpsOptions.key = g.fs.readFileSync(this.param.httpsOptions.key);
				this.param.httpsOptions.cert = g.fs.readFileSync(this.param.httpsOptions.cert);
				let attachServer = require("https").createServer(this.param.httpsOptions);
				this.server.attach(attachServer, this.param);
				attachServer.listen(this.port);
			}
			else
			{
				let serverName = this.param.protocol;
				let attachServer = g.data.server.getServer(serverName);
				if (attachServer)
				{
					this.server.attach(attachServer, this.param);
				}
				else
				{
					this.server.attach(this.port, this.param);
				}
			}
		}
		else
		{
			this.server.attach(this.port, this.param);
		}
		log.info(this.getMsg("Server runing at port:", this.port));
	}

	broadcast($cmd, $data, exceptList)
	{
		if (exceptList != null)
		{
			if (!Array.isArray(exceptList))
			{
				exceptList = [exceptList];
			}

			exceptList = exceptList.map(function (v)
			{
				if (typeof v == "string")
				{
					return v;
				}
				return v.id;
			})
		}

		var clientList = this.clientPool.list;
		for (var i = 0; i < clientList.length; i++)
		{
			var clientData = this.clientPool.get(clientList[i]);
			if (exceptList == null || exceptList.indexOf(clientData.id) < 0)
			{
				clientData.client.emit("data", formatResponse($cmd || "", $data));
			}
		}
	}

	push($client, $cmd, $dataObj)
	{
		//识别$client为  client / clientId / clientIds
//		trace(getType($client));
	}

	addLoginCheckList($id)
	{
		this.loginTimeoutList.push($id);
		if (this.timeoutId == 0)
		{
			this.enterFrame();
		}
	}

	removeLoginCheckList($id)
	{
		var index = this.loginTimeoutList.indexOf($id);
		if (index >= 0)
		{
			this.loginTimeoutList.splice(index, 1);
		}

		if (this.loginTimeoutList.length == 0 && this.timeoutId > 0)
		{
			clearTimeout(this.timeoutId);
			this.timeoutId = 0;
		}
	}

	enterFrame()
	{
		if (this.loginTimeoutList.length > 0)
		{
			var currTime = Date.now();
			for (var i = 0; i < this.loginTimeoutList.length; i++)
			{
				var clientData = this.clientPool.get(this.loginTimeoutList[i]);
				if (clientData && currTime - clientData.connectTime >= this.loginTimeout)
				{
					this.clientPool.remove(clientData.id);
					this.loginTimeoutList.splice(i, 1);
					i--;
					clientData.client.disconnect();
				}
				else
				{
					break;
				}
			}

			if (this.loginTimeoutList.length > 0)
			{
				this.timeoutId = setTimeout(()=>
				{
					this.enterFrame();
				}, 1000);
			}
			else
			{
				this.timeoutId = 0;
			}
		}
	}

	close()
	{
		this.server && this.server.close();
	}
}

function go($mgr, $data, $clientData, $callBack, $errorBack)
{
	var nsp = $data.nsp;
	var type = $data.type;
	var dataArr = $data.data;
	var dataType = "";
	if (dataArr.length > 0)
	{
		dataType = dataArr[0];

		var func = $mgr.getFunc(dataType);
		if (func)
		{
			func(dataArr[1], function successBack($returnObj, $cmd)
				{
					//这里是否有什么办法，让回调可以直接进行一个单方的，或者多方的推送
					//因为socket主要是用于推送的
					//这里的推送分为，针对单人，针对多人
					//如果能根据id进行推送就会方便的很
					//所以这个回调就仅仅用于回调
					//另外再追加一个用于推送的
//					trace("[success]", dataType);
					$callBack && $callBack($returnObj, $clientData);
					$clientData && $clientData.client && $clientData.client.emit("data", formatResponse($cmd || dataType, $returnObj));
				},
				function errorBack($dataObj)
				{
//					trace("[error]", dataType);
					$errorBack && $errorBack($dataObj, $clientData);
					$clientData && $clientData.client && $clientData.client.emit("data", formatResponse(dataType, null, $dataObj));
				}, $clientData);
		}
		else
		{
			trace("@ Not Found Func:", dataType);
		}
	}
	else
	{
		trace("Request Error: require a eventType!");
	}
}