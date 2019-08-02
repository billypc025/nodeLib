/**
 * Created by billy on 2018/2/1.
 */
var fs = require("fs");
var EventEmitter = require("events").EventEmitter;
var COS = require("cos-nodejs-sdk-v5");
var _timeTool = require("../TimeTool");

var defaultOptions = {
	AppId: "", // AppId 已废弃，请拼接到 Bucket 后传入，例如：test-1250000000
	SecretId: "",
	SecretKey: "",
	FileParallelLimit: 3,
	ChunkParallelLimit: 3,
	ChunkSize: 1024 * 1024,
	ProgressInterval: 1000,
	Domain: "",
	ServiceDomain: "",
	Proxy: "",
};

class COSClient extends EventEmitter {
	constructor($param)
	{
		super();
		this.client = null;
		this.update($param);
	}

	update($param)
	{
		if (this.client == null)
		{
			this.client = new COS($param);
		}
		else
		{
			this.client.options = __merge(defaultOptions, $param);
		}
		this.client.param = $param;
	}

	/**
	 * 将指定的文件上传到oss指定目录
	 * @param $path 要上传的文件路径（原始文件路径）
	 * @param $targetPath oss目标路径（要上传到的目标位置）
	 * @returns {Promise}
	 */
	upload($path, $targetPath)
	{
		var promiseList = [];
		//	$path = "./assets/publish/201711";
		if (!fs.existsSync($path))
		{
			return error("noFile");
		}
		if (g.file.isDirectory($path)) //判断是否是文件夹
		{
			var list = g.file.getDirectoryAllListing($path);
			for (i = 0; i < list.length; i++)
			{
				var targetPath = list[i].replace($path, "")
				if ($targetPath)
				{
					targetPath = g.path.join($targetPath, targetPath);
				}

				promiseList.push(doUpload(this.client, list[i], targetPath));
			}
		}
		else
		{
			if (g.path.parse($targetPath).ext == "") //支持目标路径是一个目录
			{
				if ($targetPath.charAt($targetPath.length - 1) != "/")
				{
					$targetPath += "/";
				}
				$targetPath = $targetPath + g.path.parse($path).base
			}

			promiseList.push(doUpload(this.client, $targetPath, $path));
		}

		return Promise.all(promiseList).then(()=>
		{
			this.emit("COMPLETE", this);
		})
	}

	delete($fileName)
	{
		var promiseList = [];
		if (typeof $url == "string")
		{
			promiseList.push(doDelete(this.client, $url));
		}
		else
		{
			for (var url of $url)
			{
				promiseList.push(doDelete(this.client, url));
			}
		}
		return Promise.all(promiseList).then(()=>
		{
			this.emit("COMPLETE", this);
		})
	}
}

function doUpload($client, $path, $targetPath)
{
	let client = $client;
	var promise = new Promise((resolved, reject)=>
	{
		client.putObject({
			Bucket: client.param.Bucket, /* 必须 */ // Bucket 格式：test-1250000000
			Region: client.param.Region,
			Key: $path, /* 必须 */
			TaskReady: function (tid)
			{
				client.taskId = tid;
			},
			onProgress: function (progressData)
			{
			},
			// 格式1. 传入文件内容
			// Body: fs.readFileSync(filepath),
			// 格式2. 传入文件流，必须需要传文件大小
			Body: fs.readFileSync($targetPath),
			ContentLength: fs.statSync($targetPath).size
		}, function (err, data)
		{
			resolved();
			fs.unlinkSync($path);
		});
	})

	return promise;
}

function doDelete($client, $url)
{
	let client = $client;
	var promise = new Promise((resolved, reject)=>
	{
		client.deleteObject({
			Bucket: client.param.Bucket, // Bucket 格式：test-1250000000
			Region: client.param.Region,
			Key: $url
		}, function (err, data)
		{
			console.log(err || data);
		});
	});

	return promise;
}

function error($error)
{
	if (eval("error_" + $error))
	{
		return {then: eval("error_" + $error)};
	}
	return {
		then: ($cb)=>
		{
			$cb && $cb("error");
		}
	}
}

function error_noFile($callback)
{
	if ($callback)
	{
		$callback({
			code: 99999,
			msg: "file not exist!"
		});
	}
}

module.exports = COSClient;