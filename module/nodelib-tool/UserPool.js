/**
 * Created by billy on 2019/4/24.
 */

class UserPool {
	constructor()
	{
		this._list = [];
		this._hash = {};
		this._tokenHash = {};
		this._passHash = {};
	}

	update($list)
	{
		this._list = [];
		this._hash = {};
		this._tokenHash = {};
		this._passHash = {};
		for (var userObj of $list)
		{
			this.add(userObj);
		}
	}

	add($userObj)
	{
		if (this._hash[$userObj.name])
		{
			return;
		}
		var userObj = createData($userObj);
		this._hash[userObj.name] = userObj;
		this._passHash[userObj.name] = userObj.pass;
		this._list.push(userObj);
		return userObj;
	}

	del($name)
	{
		if (!this._hash[$name])
		{
			return;
		}

		var userObj = this._hash[$name];
		delete this._hash[$name];
		delete this._passHash[$name];
		this._list.splice(this._list.indexOf(userObj), 1);
	}

	updateUser($userObj)
	{
		if (!this._hash[$userObj.name])
		{
			return;
		}

		var userObj = this._hash[$userObj.name];

		if (hasData($userObj, "enabled"))
		{
			if ($userObj.enabled != 0 && $userObj.enabled != 1)
			{
				return;
			}
			userObj.enabled = $userObj.enabled;
		}

		if (hasData($userObj, "pass"))
		{
			if ($userObj.pass)
			{
				userObj.pass = $userObj.pass;
				this._passHash[userObj.name] = $userObj.pass;
			}
		}
	}

	getDataBy($name)
	{
		return this._hash[$name];
	}

	getPassBy($name)
	{
		return this._passHash[$name];
	}

	get list()
	{
		return this._list;
	}
}

function createData($data)
{
	var obj = {};
	obj.name = getValueByKey($data, "name", "");
	obj.pass = getValueByKey($data, "pass", "");
	obj.enabled = getValueByKey($data, "enabled", 1);
	return obj;
}

UserPool.constructor.name = "UserPool";
module.exports = UserPool;