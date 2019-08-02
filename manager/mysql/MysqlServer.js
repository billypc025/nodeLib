/**
 * Created by billy on 2017/8/25.
 */
var mysql = require("mysql");

var _default_port = 3306;
var _default_connectTimeout = 50000;

module.exports = class {

	constructor($options)
	{
		this._waitList = [];
		this.host = $options.host;
		this.port = $options.port || _default_port;
		this.database = $options.database;
		this.user = $options.user;
		this.password = $options.password;
		this.isConnected = false;
		this.multipleStatements = true;
		this.connectTimeout = $options.connectTimeout || _default_connectTimeout;
//		this.connection = mysql.createConnection(this.toObject());
		this.connection = mysql.createPool(this.toObject());

		this.onEnd_connection = onEnd_connection.bind(this);
		this.onConnect_connection = onConnect_connection.bind(this);
		this.connection.on("error", this.onEnd_connection);
		this.connection.on("end", this.onEnd_connection);
		this.connection.on("connect", this.onConnect_connection);
	}

	connect($callBack)
	{
		this.connection.connect(function ()
		{
			$callBack && $callBack();
		});
	}

	close($callBack)
	{
		this._waitList = null;
		this.connection.removeListener("error", this.onEnd_connection);
		this.connection.removeListener("end", this.onEnd_connection);
		this.connection.removeListener("connect", this.onConnect_connection);
		this.onEnd_connection = null;
		this.onConnect_connection = null;
		var promise = new Promise((resolved, reject)=>
		{
			this.connection.end(()=>
			{
				this.connection = null;
				$callBack && $callBack();
				resolved();
			});
		})
		return promise;
	}

	query($sql, $callBack, $errorBack)
	{
//		trace("this.isConnected:" + this.isConnected);
//		if (this.isConnected)
//		{
		if ($sql)
		{
			try
			{
				this.connection.query($sql, (err, rows, fields)=>
				{
					if (err)
					{
						log.error(err.sql);
						log.error(err.sqlMessage);
						g.log.out(err);
						$errorBack && $errorBack(err);
					}
					else
					{
						$callBack && $callBack(rows, fields);
					}
				});
			}
			catch (e)
			{
				g.log.out(e);
				$errorBack && $errorBack(e);
			}
		}
		else
		{
			g.log.out("Query was empty");
			$errorBack && $errorBack("Query was empty");
		}
//		}
//		else
//		{
//			this._waitList.push([$sql, $callBack, $errorBack]);
//			this.connect();
//		}
	}

	toString()
	{
		return this.host + ","
			+ this.port + ","
			+ this.database + ","
			+ this.user + ",";
	}

	toObject()
	{
		return {
			host: this.host,
			port: this.port,
			database: this.database,
			user: this.user,
			password: this.password,
			connectTimeout: this.connectTimeout,
			multipleStatements: this.multipleStatements
		}
	}

	static getString($configData)
	{
		return $configData.host + ","
			+ ($configData.port || _default_port) + ","
			+ $configData.database + ","
			+ $configData.user + ",";
	}
}

function onConnect_connection()
{
	this.isConnected = true;
	if (this._waitList.length > 0)
	{
		while (this._waitList.length > 0)
		{
			var queryList = this._waitList.shift();
			this.query(queryList[0], queryList[1], queryList[2]);
		}
	}
}

function onEnd_connection()
{
	this.isConnected = false;
}