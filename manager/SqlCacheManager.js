/**
 * Created by billy on 2017/7/11.
 */

const EXPIRE_TIME = 0;

var _config = {
	expireTime: EXPIRE_TIME
};

var _clientConfig = {};
var _hash = {};
//根据sqlClient进行缓存，过期时间也需要设置
//另外是否需要根据每个接口来定义过期时间？
//首先全局节点是有过期时间的
//先检查当前接口的过期时间，如果没有，就使用sqlClient的，如果没有就使用全局的，如果没有就使用默认的

exports.init = function ($option)
{
	_config = __merge(_config, $option, true);
}

exports.initClient = function ($sqlClient, $option)
{
	var clientConfig = getClientConfig($sqlClient)
	clientConfig = __merge(clientConfig, $option, true);
}

exports.query = function ($sqlClient, $sql, $callBack)
{
	//判断来的$sql是否是object，如果是object就检查一下过期时间
	//如果是字符串，就用父级的过期时间
	//然后判断是否已经过期
	//问题就在于redis这里并不能进行sql查询，所以这里仍旧得需要介入sql
	//并且无法对整库进行缓存，这也是不切实际的，所以这里的缓存方案就得好好想一想
	//缓存的目的就是数据是现成的，那么临时表是一个方案，如果有临时表的话。。。
	//那么问题就转化为了，如何用临时表来存储一些数据？需要建立多少个中间表，才能搞定这个事情
	//也许中间表可以存在redis里面？
	//基本是数据都是每天来一次的，所以其实可以每天跑一次，将每个店铺每一天的数据都记录下来，这样就能大大加快统计的速度
	//这个倒是可以有。并且这个数据放在redis里面进行持久化也是可行的
	var sql = $sql;
	var expire = 0;
	if (!isString($sql))
	{
		if ($sql.hasOwnProperty("sql"))
		{
			sql = $sql.sql;
		}
	}
	if (_hash[$sqlClient.name] && _hash[$sqlClient.name][$sql])
	{
		$callBack
	}

	if (!_hash[$sqlClient.name])
	{
		_hash[$sqlClient.name] = {
			id: $sqlClient.name,
			expireTime: 0
		}
	}
}

function getClientConfig($client)
{
	var client = $client.name;
	if (_clientConfig[client])
	{
		_clientConfig[client] = __merge({}, _config);
	}

	return _clientConfig[client];
}