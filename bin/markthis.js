#!/usr/bin/env node
/**
 * Created by billy on 2017/9/7.
 */

var g = require("../global");
var fileName = getArgs(0, null);
var targetName = getArgs(1, null);
g.mark.convertFile(fileName, targetName, function ($err)
{
	if ($err)
	{
		log.error($err);
	}
	else
	{
		log.success("ALL DONE-----------------------");
	}
	process.exit();
})