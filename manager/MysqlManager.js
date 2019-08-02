/**
 * Created by billy on 2017/6/28.
 */
var MysqlServer = require('./mysql/MysqlServer');
var Manager = require("./Manager");

module.exports = class extends Manager {
	init()
	{
		this.managerType = "MySql";
		this.server = new MysqlServer(this.param);
		g.data.server.addServer(this.name, this.server);
		super.init();
	}

	query()
	{
		this.server.query.apply(this.server, arguments);
	}

	toObject()
	{
		return this.server.toObject();
	}

	connect()
	{
		this.server.connect.apply(this.server, arguments);
	}

	close()
	{
		return this.server.close();
	}
}