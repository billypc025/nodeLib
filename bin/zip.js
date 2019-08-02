#!/usr/bin/env node
var argv = process.argv;
var zip = require("../utils/zip");
var color = require("cli-color");
require("../utils/log");
zip(argv[2], argv[3], argv[4], function ($data)
{
	if ($data.status == 0)
	{
		console.log(color.green.bold("------------ done -------------"));
	}
	else
	{
		console.log(color.red.bold($data.msg));
	}
	process.exit();
})