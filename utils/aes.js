/**
 * Created by billy on 2017/10/21.
 */
var aes256 = require("aes256");

exports.encode = function ($text, $key)
{
	$key = $key || "";
	if ($text)
	{
		return aes256.encrypt($key, $text);
	}
	return "";
}

exports.decode = function ($text, $key)
{
	$key = $key || "";
	if ($text)
	{
		return aes256.decrypt($key, $text);
	}
	return "";
}