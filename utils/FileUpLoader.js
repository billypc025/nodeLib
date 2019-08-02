/**
 * Created by billy on 2017/11/9.
 */
var OSSClient = require("./upload/oss");
var COSClient = require("./upload/cos");
var LocalClient = require("./upload/local");

var _freeHash = {};

class FileUpLoader {
	constructor($param, $type)
	/* $type = OSS 入参配置
	 {
	 "region": "oss-cn-hangzhou",
	 "accessKeyId": "LTAIPkIl4nhxftbf",
	 "accessKeySecret": "vUKqMwQUsHOPbOp5HsxD5dwxLM6nhb",
	 "bucket": "chachadian-test",
	 "basePath": "boms/upload/"
	 }
	 */
	{

		/* $type = COS 入参配置
		 {
		 "Region": "ap-shanghai",
		 "SecretId": "AKIDqUt3xbz7zauxiCmLzMTJs9F4cw1qNlri",
		 "SecretKey": "kGWXJp68vSlocBcolTwA8rLaZJo69wUn",
		 "Bucket": "zhuawawa-1251508536",
		 "basePath": "test_inside/",
		 "baseUrl": "https://zhuawawa-1251508536.cos.ap-shanghai.myqcloud.com/test_inside/"
		 }
		 */

		this.param = __merge({}, $param);
		this.type = $type;
	}

	upload($path, $targetPath)
	{
		return this.getClient().upload($path, $targetPath);
	}

	delete($fileName)
	{
		return this.getClient().delete($fileName);
	}

	getClient()
	{
		return getClient(this.param, this.type);
	}

	getList($path)
	{
		return this.getClient().getList($path);
	}

	copy($toUrl, $fromUrl)
	{
		return this.getClient().copy($toUrl, $fromUrl);
	}

	getFile($path)
	{
		return this.getClient().getFile($path);
	}
}

function getClient($param, $type = "oss")
{
	var freeList = _freeHash[$type];
	if (!freeList)
	{
		freeList = [];
		_freeHash[$type] = freeList;
	}

	if (freeList.length > 0)
	{
		var client = freeList.shift();
		if (client.param != $param)
		{
			client.update($param);
		}
		client.param = $param;
		return client;
	}

	return createClient($param, $type);
}

function createClient($param, $type)
{
	var client;
	if ($type == "oss") //阿里云
	{
		client = new OSSClient($param);
	}
	else if ($type == "cos") //腾讯云
	{

	}
	else if ($type == "local") //上传在服务器本地目录
	{

	}
	client.type = $type;

	client.on("COMPLETE", ($client)=>
	{
		_freeHash[$client.type].push($client);
	})
	return client;
}

module.exports = FileUpLoader;