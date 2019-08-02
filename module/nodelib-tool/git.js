/**
 * Created by billy on 2019/4/24.
 */
var co = require("co");
var _exeTool = require("../../utils/childProcess");
var {response}=require("./utils");

function pull($req, $res)
{
	var childExe = _exeTool.get("git pull");
	childExe.exe().then(()=>
	{
		response($res, "");
	}, ()=>
	{
		response($res, "");
	});
}
exports.pull = pull;

function fetch($req, $res)
{
	co(function*()
	{
		var childExe = _exeTool.get();
		childExe.add("git fetch origin master");
		yield childExe.exe();
		childExe.add("git log --name-status --pretty=oneline --no-merges master..origin/master");
		var msg = yield childExe.exe();
		response($res, msg);
	}).catch(function ($err)
	{
		response($res, "");
	})
}
exports.fetch = fetch;

function getBranch()
{
	var promise = new Promise((resolved, reject)=>
	{
		var childExe = _exeTool.get("git branch");
		childExe.exe().then(($data)=>
		{
			if ($data)
			{
				var matchs = $data.match(/\*.+/g);
				if (matchs && matchs.length > 0)
				{
					var result = matchs[0].replace("*", "");
					result = trim(result);
					resolved(result);
					return;
				}
			}
			resolved("");
		}, ()=>
		{
			resolved("");
		});
	})
	return promise;
}
exports.getBranch = getBranch;

function getCommit()
{
	var promise = new Promise((resolved, reject)=>
	{
		var childExe = _exeTool.get("git log -n 1");
		childExe.exe().then(($data)=>
		{
			if ($data)
			{
				$data = $data.toLowerCase();
				var time = trim($data.match(/date:.+/g)[0].replace("date:", ""));
				var id = trim($data.match(/commit.+/g)[0].replace("commit", ""));
				resolved({
					time: time,
					id: id
				});
			}
			resolved("");
		}, ()=>
		{
			resolved("");
		});
	})
	return promise;
}
exports.getCommit = getCommit;