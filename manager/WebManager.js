/**
 * Created by billy on 2017/5/13.
 */
var g = require("../global");
var serve = require("serve-handler");
const http = require("http");
var Manager = require("./Manager");

var _default_port = 80;
var _webroot = __dirname + "/webroot";

module.exports = class extends Manager {

	init()
	{
		this.managerType = "Web";
		this.port = this.param.port || _default_port;
		this.webroot = this.param.webroot || "./";

		this.webroot = g.path.resolve(this.webroot);
		if (!g.file.exists(this.webroot))
		{
			this.webroot = "";
			log.error("没有找到指定的webroot路径：" + this.webroot);
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
		if (this.webroot != "")
		{
			this.server = http.createServer((request, response) =>
			{
				return serve(request, response, {
					public: this.webroot,
					unlisted: [
						"/node_modules",
						".gitignore",
						".idea",
						"/src"
					]
				});
			})

			this.server.listen(this.port, () =>
			{
				log.info("[Web] " + this.name + ": Server runing at port: " + this.port);
			});
		}
		else
		{
			log.error("[Web] " + this.name + ": Server start failed!");
		}
	}
}