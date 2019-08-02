/**
 * Created by billy on 2019/4/26.
 */

var _key = "hiBilly-025";
class TokenPool {
	constructor()
	{
		this._hash = {};
		this._tokenHash = {};
	}

	add($name)
	{
		var token = getToken();
		if (this._hash[$name])
		{
			var oldToken = this._hash[$name];
			delete this._tokenHash[oldToken];
		}
		this._hash[$name] = token;
		this._tokenHash[token] = $name;
		return token;
	}

	get($token)
	{
		return this._tokenHash[$token];
	}
}

function getToken()
{
	var time = new Date().getTime() + "";
	time += (Math.random() + "").substr(4, 10);
	return g.aes.encode(time, _key);
}

TokenPool.constructor.name = "TokenPool";
module.exports = TokenPool;