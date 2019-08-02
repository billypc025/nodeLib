/**
 * Created by billy on 2017/9/15.
 */

var _hash = {};

class ClientPool {
	constructor()
	{
		this.hash = {};
		this.list = [];
	}

	add($client)
	{
		var id = $client.id;
		if (!this.hash[id])
		{
			this.hash[id] = createData($client);
		}
	}

	addList($id)
	{
		if (this.list.indexOf($id) < 0)
		{
			this.list.push($id);
			this.hash[$id].isLogin = true;
		}
	}

	get($id)
	{
		return this.hash[$id];
	}

	remove($id)
	{
		var client = this.hash[$id];
		if (client)
		{
			this.list.splice(this.list.indexOf($id), 1);
			delete this.hash[$id];
		}
	}
}

function createData($client)
{
	var clientData = {};
	clientData.id = $client.id;
	clientData.client = $client;
	clientData.isLogin = false;
	clientData.connectTime = Date.now();
	clientData.update = updateData.bind(clientData);
	return clientData;
}

function updateData($obj)
{
	$obj.hasOwnProperty("isLogin") && (this.isLogin = $obj.isLogin);
}

exports.get = function ($name)
{
	if (!_hash[$name])
	{
		var clientPool = new ClientPool();
		_hash[$name] = clientPool;
	}
	return _hash[$name];
}