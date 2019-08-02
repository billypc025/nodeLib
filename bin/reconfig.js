#!/usr/bin/env node
require("../global");
require('shelljs/global');
var path = require("path");
var fs = require("fs");

var args = getArgs();
if (args.length == 0)
{
	process.exit();
}
var env = args[0];
var configFileName = "config." + env + ".js";
var indexFileName = "index.html";
var root = path.resolve("./") + "/";

if (!fs.existsSync(root + indexFileName))
{
	process.exit();
}
if (!fs.existsSync(root + configFileName))
{
	process.exit();
}
var indexFile = fs.readFileSync(root + indexFileName).toString();
var matchs = indexFile.match(/config[^\>]*\.js/g)
if (!matchs || matchs.length == 0)
{
	process.exit();
}
var templeConfig = matchs[0]

if (templeConfig != "config.js")
{
	indexFile = indexFile.replace(templeConfig, "config.js");
	fs.writeFileSync(root + indexFileName, indexFile);
}

cp('-R', root + configFileName, root + "config.js");
trace("DONE")
process.exit();