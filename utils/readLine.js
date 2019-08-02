/**
 * Created by billy on 2017/2/25.
 */
var Readline = require('readline');

var rl
if (!rl)
{
	rl = Readline.createInterface({
		input: process.stdin,
		output: process.stdout
	});
}

/**
 * 用于命令行读取输入
 * @param $msg 提示信息
 * @returns {Promise} 回调Promise
 */
function show($msg)
{
	$msg = $msg || "";
	return new Promise(function (resolved, reject)
	{
		rl.question($msg, onComplete);

		function onComplete()
		{
			resolved.apply(null, arguments);
		}
	});
}

/**
 * 用于命令行提示Y/N
 * @param $msg 提示信息
 * @returns {Promise} 回调Promise
 */
function showYesNo($msg)
{
	$msg = $msg || "";
	$msg += " (Y/N)";
	return new Promise(function (resolved, reject)
	{
		rl.question($msg, onComplete);

		function onComplete(v)
		{
			v = v.toUpperCase() == "Y" ? "Y" : "N"
			resolved(v);
		}
	});
}

module.exports = {
	show: show,
	showYesNo: showYesNo
}