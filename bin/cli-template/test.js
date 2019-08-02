/**
 * Created by billy on 2017/4/25.
 */

module.exports = class {
	constructor()
	{
		this.id = new Date().getTime();
		this.count = 0;
		this.add("test", this.test);
		this.add("test2", this.test2);
		this.add("hello", this.hello);
	}

	test($data, $succcess, $error, $client)
	{
		this.count++;
		if (typeof $data == "object" && $data.num)
		{
			$succcess({
				num: $data.num * $data.num,
				count: this.count,
				id: this.id
			});
		}
		else
		{
			$error({
				code: 10001,
				msg: "没有传入必要的参数"
			});
		}
	}

	test2($data, $succcess, $error, $client)
	{
		var filePath = path.resolve("./assets/index.txt");
		var stats = fs.statSync(filePath);
		var file = fs.createReadStream(filePath);
		$succcess(file, {
			'Content-Type': 'application/octet-stream',
			'Content-Length': stats.size,
			'Content-Disposition': 'attachment;filename=test.txt'
		}, "download");
	}

	hello($data, $succcess, $error, $client)
	{
		var str = "";
		if (!isEmpty($data))
		{
			str = JSON.stringify($data);
		}
		$succcess("hello " + str);
	}
}