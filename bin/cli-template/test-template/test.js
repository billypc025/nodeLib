//用于加入一条提示信息
addMsg("------------提示信息-------------");

//用于加入一个接口测试
addTest("user/login", {
	account: "18658110520",
	$pass: ["11223344", "1235234", "", null, "  ", "000", "*"]
}, function (status, d, param, success, error)
{
	if (status)
	{
		mysql.query("select id,account,pass,tel,name,rights from user	where account='18658110520'", (d)=>
		{
			this.end({}, {id: d[0].id});
		});
	}
	else
	{
		this.end({pass: "1235234"}, {code: "*"});
		this.end({pass: "*"}, {code: "*"});
	}
});