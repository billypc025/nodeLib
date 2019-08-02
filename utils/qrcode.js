/**
 * Created by billy on 2017/9/7.
 */
var qrcode = require("qrcode");

/**
 * 生成二维码
 * @param $txt 二维码字符串
 * @param $filePath 文件路径（缺省）
 * @param $callBack 回调方法 function($err,$data)
 * @returns {Promise} 回调Promise
 */
module.exports = function ($txt, $filePath, $callBack)
{
	return new Promise(function (resolved, reject)
	{
		if (typeof $filePath == "function")
		{
			$callBack = $filePath;
			$filePath = null;
		}

		if ($txt)
		{
			if ($filePath)
			{
				qrcode.toFile($filePath, text, function (err, data)
				{
					if (!err)
					{
						callBack();
					}
					else
					{
						callBack("保存失败");
						throw err
					}
				})
			}
			else
			{
				qrcode.toString(text, {type: "terminal"}, callBack)
			}
		}
		else
		{
			callBack("缺少必要的参数txt!");
		}

		function callBack($msg)
		{
			$callBack && $callBack($msg);

			if ($msg)
			{
				reject($msg);
			}
			else
			{
				resolved();
			}
		}
	})
}
