/**
 * Created by billy on 2017/8/26.
 */
var g = require("../global");
var _timeTool = require("../utils/TimeTool");
var Manager = require("./Manager");
var _module = require("../module/module");
var exec = require("child_process").exec;
var Redis = require("redis");

module.exports = class extends Manager {

	init()
	{
		this._hash = {};
		this._isConnected = false;
		this.managerType = "Redis";
		if (!this.param.hasOwnProperty("allows") || this.param.allows.indexOf(__ip) >= 0)
		{
			this._isConnected = true;
			this.server = Redis.createClient({
				detect_buffers: true,
				host: this.param.host
			});
			this.server.auth(this.param.password);
		}

		/*
		 this.server = new Redis(
		 {
		 port: this.param.port,                // Redis port
		 host: this.param.host,                // Redis host
		 password: this.param.password
		 });
		 this.logLimit = this.param.logLimit || 5000;

		 if (this.param.monitor)
		 {
		 this.logNum = 0;
		 this.log = "";
		 this.currLog = {
		 time: 0,
		 list: []
		 };

		 this.monitor = this.param.monitor;
		 this.server.monitor(($err, $monitor)=>
		 {
		 g.data.server.addServer(this.name, this.server);
		 $monitor.on('monitor', ($time, $args, $source, $database)=>
		 {
		 if ($args.indexOf("exec") == 0)
		 {
		 this.logNum++;
		 this.log += this.currLog.list.join(",");
		 this.currLog = {
		 time: 0,
		 list: []
		 };
		 if (this.logNum >= this.logLimit)
		 {
		 g.fs.writeFileSync(g.path.resolve(this.param.monitor) + "log_" + timeTool.getNowStamp() + ".txt", this.log);
		 this.logNum = 0;
		 this.log = "";
		 }
		 }
		 else
		 {
		 if ($time != this.currLog.time)
		 {
		 var t0 = $time - this.currLog.time
		 this.currLog.list.push(t0 + " " + $args.join(" "));
		 this.currLog.time = $time;
		 }
		 else
		 {
		 this.currLog.list.push($args.join(" "));
		 }
		 }
		 });
		 });
		 }
		 */
		super.init();
	}

	set($key, $value, $ex, $timeout)
	{
		if (this._isConnected)
		{
			if ($ex && $timeout)
			{
				this.server.set($key, $value, $ex, $timeout);
			}
			else
			{
				this.server.set($key, $value);
			}
		}
		else
		{
			this._hash[$key] = $value;
		}
	}

	get($key, $callBack)
	{
		if (this._isConnected)
		{
			this.server.get($key, $callBack);
		}
		else
		{
			var dObj = this._hash[$key];
			delete this._hash[$key];
			$callBack(null, dObj);
		}
	}

	incrby($key, $increment, $callBack)
	{
		if (this._isConnected)
		{
			this.server.incrby($key, $increment, $callBack)
		}
		else
		{
			if (!this._hash[$key])
			{
				this._hash[$key] = 0
			}
			var dObj
			var increment = isNaN(Number($increment)) ? 0 : Number($increment)
			this._hash[$key] += increment
			dObj = this._hash[$key]
			$callBack(null, dObj);
		}
	}
}