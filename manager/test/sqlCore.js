/**
 * Created by billy on 2017/12/19.
 */
exports.init = function ()
{
	var list = g.data.manager.getNameByType("mysql")
	for (var i = 0; i < list.length; i++)
	{
		var name = list[i];
		if (!global[name])
		{
			global[name] = g.data.manager.getManager(name);
		}
		else
		{
			log.error("Invalid name in mysql Server: " + name);
			process.exit();
		}
	}
}