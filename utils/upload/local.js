/**
 * Created by billy on 2018/2/1.
 */
var _timeTool = require("../TimeTool");

function hhhhhhhh()
{
	var filePathObj = g.path.parse(filePath);
	var fileName = filePathObj.base;
	fileName = fileName.replace("upload_", "");
	fileName = fileName.substring(8, 24) + filePathObj.ext;

	var dir = _timeTool.getDate(0, true);
	var returnUrl = dir + "/" + fileName;
	var dirPath = "./assets/upload/" + dir;
	filePath = dirPath + "/" + fileName;
	g.fs.exists(dirPath, ($exist)=>
	{

		if ($exist)
		{
			this.rename({
				sourcePath: files.btn.path,
				targetPath: filePath,
				fileName: returnUrl,
				fileSize: fileSize,
				redirectUrl: $data.redirectUrl
			}, $succcess)
		}
		else
		{
			g.fs.mkdir(dirPath, (err)=>
			{

				if (err)
				{
					$error("上传文件出错");
				}
				else
				{
					this.rename({
						sourcePath: files.btn.path,
						targetPath: filePath,
						fileName: returnUrl,
						fileSize: fileSize,
						redirectUrl: $data.redirectUrl
					}, $succcess)
				}
			})
		}
	})
//				fs.rename(files.btn.path, filePath, ()=>
//				{
//					var html = g.data.file.get("/template").get("upload.html", {
//						fileName: fileName,
//						size: fileSize,
//						redirectUrl: $data.redirectUrl
//					});
//					$succcess(html, {"Content-Type": "text/html"}, "text", true);
//				});

}

function del()
{
	if (typeof fileName == "string")
	{
		this.delFile(fileName);
	}
	else
	{
		for (var url of fileName)
		{
			this.delFile(url);
		}
	}
}