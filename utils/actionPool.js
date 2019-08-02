/**
 * Created by billy on 2017/9/7.
 */
module.exports = function ()
{
	return (function (func)
	{
		var hash = {};

		/**
		 * 新增一个方法到方法池
		 * @param funcName 方法名
		 * @param func 方法实体
		 */
		function add(funcName, func)
		{
			if (typeof funcName == "function")
			{
				func = funcName;
				funcName = func.name;
			}

			hash[funcName] = func;
		}

		/**
		 * 根据传入的一系列参数，从方发池里执行对应的方法，并传入参数
		 * @param arg 入参，0方法名 1-n为入参
		 * @returns {boolean} 返回是否成功执行方法
		 */
		function exe(...arg)
		{
			if (arg.length > 0)
			{
				var funcName = arg.splice(0, 1);
				var func = hash[funcName];
				if (func)
				{
					func.apply(func, arg);
					return true;
				}
			}
			return false;
		}

		return {
			add: add,
			exe: exe
		}
	})();
}