/**
 * Created by billy on 2017/4/25.
 */
var co = require("co");

var _hash = {};
var _nameList = [];

function addModule($modName, $moduleClass, $managerData)
{
	var promise = new Promise((resloved, reject)=>
	{
		var isGlobalModule = false;
		var managerType = $managerData.type;
		managerType = managerType.charAt(0).toUpperCase() + managerType.substr(1);
		var managerName = $managerData.name;

		if (!$modName)
		{
			log.warn("[" + managerType + "] " + managerName + " 发现空模块名，请检查配置！");
			return;
		}
		if ($modName.indexOf("@") == 0)
		{
			isGlobalModule = true;
			$modName = $modName.substr(1);
		}
		else
		{
			$modName += "";
		}

		_nameList.push($modName);

		var moduleItem;
		var mustInit = false;
		if (!isGlobalModule || !_hash[$modName])
		{
			$moduleClass.prototype.add = addFunc($modName);
			try
			{
				moduleItem = new $moduleClass();
			}
			catch (e)
			{
				log.error("模块加载出错： " + $modName)
				trace(e);
				process.exit(0);
			}
			moduleItem.name = $modName;
			moduleItem.data = $managerData;
			moduleItem.funcList = moduleItem.funcList || [];
			moduleItem.funcHash = moduleItem.funcHash || {};
			moduleItem.isGlobal = isGlobalModule;
			if (moduleItem.init)
			{
				mustInit = true;
			}
			if (isGlobalModule && !_hash[$modName])
			{
				_hash[$modName] = moduleItem;
			}
		}
		else
		{
			moduleItem = _hash[$modName];
		}

		if (mustInit)
		{
			if (moduleItem.init.length > 0)
			{
				moduleItem.init(()=>
				{
					resloved(moduleItem);
				});
			}
			else
			{
				resloved(moduleItem);
			}
		}
		else
		{
			resloved(moduleItem);
		}
	})
	return promise;
}

function addFunc($modName)
{
	return function ($funcName, ...arg)
	{
		if (!this.funcList)
		{
			this.funcList = [];
		}

		if (!this.funcHash)
		{
			this.funcHash = {};
		}

		$funcName += "";

		var cmd = $modName;
		if ($modName.charAt(0) == "/")
		{
			cmd += "/" + $funcName;
		}
		else
		{
			cmd += "." + $funcName;
		}
		if (!$funcName)
		{
			log.error("[" + $modName + "] 发现不合法的方法名称！");
			return;
		}

		if (this.funcHash[cmd])
		{
			log.warn("[" + $modName + "] 发现重复的方法名: " + $funcName);
			return;
		}
		log.info("[Module] add: " + cmd);

		this.funcList.push(cmd);
		if (arg.length == 1)
		{
			this.funcHash[cmd] = arg[0].bind(this);
		}
		else
		{
			this.funcHash[cmd] = function ($data, $success, $error, $client, $response)
			{
				co(function *()
				{
					for (var i = 0; i < arg.length; i++)
					{
						var result = arg[i].call(this, $data, $success, $error, $client, $response);
						if (result === false)
						{
							break;
						}
						else if (result instanceof Promise)
						{
							var r = yield result;
							if (r === false)
							{
								break;
							}
						}
					}
				}.bind(this), ()=>
				{
					$error("");
				})
			}.bind(this);
		}
	};
}

exports.addModule = addModule;