/**
 * Created by billy on 2017/12/18.
 */

module.exports = equalParam;

function equalParam($param, $targetParam)
{
	var t1 = getType($param);
	var t2 = getType($targetParam);
	if (t1 == t2)
	{
		if (t1 == "Object")
		{
			var k1 = Object.keys($param);
			var k2 = Object.keys($targetParam);

			var isContains = k2.every(function (v)
			{
				return k1.indexOf(v) >= 0;
			});

			if (!isContains)
			{
				return false;
			}

			var b = true;
			for (var k in $targetParam)
			{
				b = b && equalParam($param[k], $targetParam[k]);
				if (!b)
				{
					return false;
				}
			}

			return b;
		}
		else if (t1 == "Array")
		{
			var a1 = $param;
			var a2 = $targetParam;

			if (a1.length != a2.length)
			{
				return false;
			}
			var b = true;
			for (var i = 0; i < a2.length; i++)
			{
				b = b && equalParam(a1[i], a2[i]);
				if (!b)
				{
					return false;
				}
			}

			return b;
		}
		else
		{
			if ($targetParam == "*")
			{
				return true;
			}
			if ($targetParam !== $param)
			{
				return false;
			}
		}
	}
	else
	{
		if ($targetParam == "*")
		{
			return true;
		}
		return false;
	}
	return true;
}