/**
 * Created by billy on 2017/4/25.
 */

//调用本工程类库
//var timeTool = require("../utils/TimeTool");

//调用nodelib工具类库
//var zip = require("nodeLib/utils/zip");


//方式一：带命令及参数
/*
var globalCmd = require("../utils/actionPool")();

(function ()
{
	globalCmd.add(init); //初始化init命令
})()

!globalCmd.exe.apply(globalCmd.exe, getArgs()) && process.exit();

//init命令的具体实现
function init(...arg)
{
	//...
}
*/



//方式二：仅参数
/*
 var arg=getArgs();
 var msg=getArgs(0,"hello world");
 trace(msg);
 */