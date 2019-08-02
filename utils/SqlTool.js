/**
 * Created by billy on 2019/3/11.
 */
//require("nodeLib")
var _whereCheckHash = {
	in: getWhere_in,
	equal: getWhere_equal,
	between: getWhere_between,
	like: getWhere_like,
	more: ">",
	meq: ">=",
	less: "<",
	leq: "<=",
	"=": getWhere_equal,
	"!=": getWhere_notEqual,
	">": ">",
	">=": ">=",
	"<": "<",
	"<=": "<=",
	"(": ">",
	")": "<",
	"[": ">=",
	"]": "<=",
}

/**
 * 生成查询sql语句
 * @param $formName 表名 / 库名.表名
 * @param $columns  字段名:数组 / 字符串 依次往下排
 * @param $where    查询条件:键值对 {字段名:[判断条件,判断值]}
 * @param $order    排序方式:数组 [字段名] / [[字段名,倒序]]
 *
 * 示例调用:
 * select("user.user", ["id", "name", "type", "createTime"], ["type", ["createTime", "desc"]]);
 * select("static.static_const", "key","value", { isClient: ["=",1] });
 * select("static.static_const", "key","value", { isClient:"=1" });
 * select("user.user", "*", {createTime:["between","[1445672000,1547743000)"]},["createTime", "desc"]);
 * @returns {string}
 */
function select($formName, $columns, $where, $groupBy, $order, $page, $pageSize)
{
	if (!$formName)
	{
		return "";
	}

	var formName = $formName;
	var columnObj = null, whereObj = null, groupByObj = null, orderObj = null, page = null, pageSize = null;

	if (typeof $columns == "string")
	{
		columnObj = [$columns];
		for (var i = 2; i < arguments.length; i++)
		{
			var argObj = arguments[i];
			if (typeof argObj == "string")
			{
				columnObj.push(argObj);
			}
			else if (Array.isArray(argObj))
			{
				orderObj = argObj;
			}
			else if (typeof argObj == "number")
			{
				if (!page)
				{
					page = argObj;
				}
				else
				{
					pageSize = argObj;
				}
			}
			else if (typeof argObj == "object" && !Array.isArray(argObj))
			{
				var cols = Object.keys(argObj);
				if (cols.length == 1 && cols[0] == "groupby")
				{
					groupByObj = argObj;
				}
				else
				{
					whereObj = argObj;
				}
			}
		}
	}
	else if (Array.isArray($columns))
	{
		columnObj = $columns;
		if (Array.isArray($where))
		{
			orderObj = $where;
			page = $groupBy;
			pageSize = $order;
		}
		else
		{
			var cols = [];
			if ($where)
			{
				cols = Object.keys($where);
			}
			if (cols.length == 1 && cols[0] == "groupBy")
			{
				groupByObj = $where;
				if (Array.isArray($groupBy))
				{
					orderObj = $groupBy;
					page = $order;
					pageSize = $page;
				}
				else
				{
					page = $groupBy;
					pageSize = $order;
				}
			}
			else
			{
				whereObj = $where;
				if (Array.isArray($groupBy))
				{
					orderObj = $groupBy;
					page = $order;
					pageSize = $page;
				}
				else
				{
					if (typeof $groupBy == "object")
					{
						groupByObj = $groupBy;
						if (Array.isArray($order))
						{
							orderObj = $order;
							page = $page;
							pageSize = $pageSize;
						}
						else
						{
							page = $order;
							pageSize = $page;
						}
					}
					else
					{
						page = $groupBy;
						pageSize = $order;
					}
				}
			}
		}
	}
	if (!columnObj)
	{
		return "";
	}

	var sqlStr = join("select", column(columnObj), "from", form(formName));
	if (whereObj)
	{
		var whereStr = where(whereObj);
		whereStr && (sqlStr = join(sqlStr, "where", whereStr));
	}
	if (groupByObj)
	{
		var groupByStr = groupBy(groupByObj);
		groupByStr && (sqlStr = join(sqlStr, "group by", groupByStr));
	}
	if (orderObj)
	{
		var orderStr = order(orderObj);
		orderStr && (sqlStr = join(sqlStr, "order by", orderStr));
	}
	if (page)
	{
		if (pageSize)
		{
			var offset = (page - 1) * pageSize
			sqlStr = join(sqlStr, "limit", offset) + "," + pageSize;
		}
		else
		{
			sqlStr = join(sqlStr, "limit", page);
		}
	}
	sqlStr += ";";
//	console.log(sqlStr);
	return sqlStr;
}

/**
 * 生成插入sql
 * @param $formName 表名 / 库名.表名
 * @param $obj      要插入的数据 {字段名:值}
 *
 * 示例:
 * insert("user.user", {name: "billy", age: 30, startTime: 12323534});
 */
function insert($formName, $obj)
{
	var sqlStr = join("insert into", form($formName), insertData($obj));
	sqlStr += ";";
//	console.log(sqlStr);
	return sqlStr;
}

function insertUpdate($formName, $insertObj, $updateObj)
{
	var sqlStr = join("insert into", form($formName), insertData($insertObj), "on duplicate key update", updateData($updateObj));
	sqlStr += ";";
//	console.log(sqlStr);
	return sqlStr;
}

/**
 * 生成更新语句
 * @param $formName 表名 / 库名.表名
 * @param $obj      要更新的数据 {字段名:值}
 * @param $where    查询条件:键值对 {字段名:[判断条件,判断值]}
 */
function update($formName, $obj, $where)
{
	var sqlStr = join("update", form($formName), "set", updateData($obj));
	if ($where)
	{
		sqlStr = join(sqlStr, "where", where($where));
	}
	sqlStr += ";";
//	console.log(sqlStr);
	return sqlStr;
}

/**
 * 生成删除语句
 * @param $formName 表名 / 库名.表名
 * @param $where    查询条件:键值对 {字段名:[判断条件,判断值]}
 * @returns {*}
 */
function del($formName, $where)
{
	if ($where)
	{
		//删除语句, 必须有where, 以避免误删数据
		return join("delete from", form($formName), "where", where($where)) + ";";
	}
	return "";
}

function count($formName, $columaName, $where)
{
	$columaName = "`" + $columaName + "`";
	var sqlStr = join("select", "count(*) as", $columaName, "from", form($formName))
	if ($where && Object.keys($where).length > 0)
	{
		sqlStr = join(sqlStr, "where", where($where));
	}
	sqlStr += ";";
	return sqlStr;
}

/**
 * 生成insert .. select语句
 * @param $insertFormName 要插入数据的表名
 * @param $insertColumns  字段名列表
 * @param $selectFormName 要查询数据的表名
 * @param $selectColumns  字段名列表
 * @param $where          查询条件
 */
function insertSelect($insertFormName, $insertColumns, $selectFormName, $selectColumns, $where)
{
	if (!$insertFormName || !$insertColumns || !$selectFormName || !$selectColumns)
	{
		return "";
	}
	var sqlStr = join("insert into", form($insertFormName), "(" + column($insertColumns) + ")");
	sqlStr = join(sqlStr, "select", column($selectColumns), "from", form($selectFormName));
	if ($where)
	{
		sqlStr = join(sqlStr, "where", where($where));
	}
	sqlStr += ";";
//	console.log(sqlStr);
	return sqlStr;
}

function form($formName)
{
	var formName = $formName;
	if (Array.isArray($formName) && $formName.length == 2 && typeof $formName[0] == "string" && typeof $formName[1] == "object")
	{
		formName = $formName[0];
		formName = paramFormat(formName, $formName[1]);
	}
	if (formName.indexOf(".") > 0)
	{
		formName = formName.replace(/\./g, "`.`");
	}
	return "`" + formName + "`";
}

function join(...arg)
{
	return arg.join(" ");
}

function column($columnList)
{
	var str = "";
	for (var columnName of $columnList)
	{
		if (str)
		{
			str += ",";
		}
		columnName = trim(columnName);
		if (columnName.indexOf("(") < 0 && columnName.indexOf(" ") < 0)
		{
			if (columnName != "*")
			{
				str += "`" + columnName + "`";
			}
			else
			{
				str += "*";
			}
		}
		else
		{
			if (columnName.indexOf(" ") > 0)
			{
				if (columnName.indexOf(" as ") > 0)
				{
					columnName = columnName.replace("as ", "as `") + "`";
				}
			}
			var li = columnName.indexOf("(") + 1;
			var ri = columnName.indexOf(")");
			if (li > 0 && ri > 0 && li < ri)
			{
				var char = columnName.substring(li, ri);
				if (char != "*")
				{
					columnName = columnName.replace("(", "(`");
					columnName = columnName.replace(")", "`)");
				}
			}
			str += columnName;
		}
	}
	return str;
}

function groupBy($groupByObj)
{
	var val = $groupByObj.groupBy;
	if (Array.isArray(val))
	{
		return "`" + val.join("`,`") + "`";
	}
	else if (typeof val == "string")
	{
		if (val.charAt(0) == "`" && val.charAt(val.length - 1) == "`")
		{
			return val;
		}
		else
		{
			val = val.replace(/`/g, "");
			val = val.replace(/,/g, "`,`");
			return "`" + val + "`";
		}
	}
	return "";
}

function order($orderList)
{
	var str = "`" + $orderList.join("`,`") + "`";
	str = str.replace(/,`desc`/g, " desc");
	str = str.replace(/,desc`/g, "` desc");
	str = str.replace(/ desc`/g, "` desc");
	str = str.replace(/,`asc`/g, "");
	str = str.replace(/ asc`/g, "`");
	str = str.replace(/,asc`/g, "`");
	return str;
}

function insertData($obj)
{
	var firstObj = $obj;
	var objList = [$obj];
	if (Array.isArray($obj))
	{
		objList = $obj;
		firstObj = objList[0];
	}
	var colStr = "";
	var valStr = "";
	var colList = Object.keys(firstObj);
	for (var obj of objList)
	{
		var valItemStr = "";
		for (var i = 0; i < colList.length; i++)
		{
			var colName = colList[i];
			var colVal = obj[colName];
			if (obj == firstObj)
			{
				if (i > 0)
				{
					colStr += ",";
				}
				colStr += "`" + colName + "`";
			}
			if (i > 0)
			{
				valItemStr += ",";
			}
			valItemStr += val(colVal);
		}

		if (valStr)
		{
			valStr += ","
		}
		valStr += "(" + valItemStr + ")";
	}
	colStr = "(" + colStr + ")";
	return join(colStr, "values", valStr);
}

function updateData($obj)
{
	var str = "";
	for (var colName in $obj)
	{
		var colVal = $obj[colName];
		if (str)
		{
			str += ",";
		}
		str += "`" + colName + "`=" + val(colVal);
	}
	return str;
}

function val($value)
{
	if (typeof $value == "string")
	{
		if ($value.indexOf("`") < 0)
		{
			$value = $value.replace(/'/g, "\\\'");
			return "'" + $value + "'";
		}
	}
	return $value;
}

function where($where, $obj)
{
	var whereStr = $where;
	var paramHash = $obj;
	if (typeof $where == "object")
	{
		whereStr = "";
		paramHash = $where;
	}
	var columnNameList = Object.keys(paramHash);
	while (columnNameList.indexOf("_or_") == 0 || columnNameList.indexOf("_and_") == 0)
	{
		let columnName = columnNameList.shift();
		columnNameList.push(columnName);
	}
	for (let columnName of columnNameList)
	{
		if (columnName == "_or_" || columnName == "_and_")
		{
			var orWhereStr = "";
			var orParamHash = paramHash[columnName];
			for (var orColumnName in orParamHash)
			{
				var orParam = orParamHash[orColumnName];
				orWhereStr = where("", orParamHash);
			}
			if (orWhereStr)
			{
				orWhereStr = "(" + orWhereStr + ")";
				if (whereStr)
				{
					if (columnName == "_or_")
					{
						whereStr += " or ";
					}
					else if (columnName == "_and_")
					{
						whereStr += " and ";
					}
				}
				whereStr += orWhereStr;
			}
		}
		else
		{
			var param = paramHash[columnName];
			if (Array.isArray(param))
			{
				whereStr = getWhere(whereStr, columnName, param[0], param[1], param[2], param[3]);
			}
			else if (typeof param == "string")
			{
				var hasCheck = false;
				for (var checkStr in _whereCheckHash)
				{
					if (param.indexOf(checkStr) == 0)
					{
						hasCheck = true;
						break;
					}
				}

				if (hasCheck)
				{
					if (whereStr)
					{
						whereStr += " and "
					}
					whereStr += "`" + columnName + "`" + param;
				}
				else
				{
					whereStr = getWhere(whereStr, columnName, "=", param);
				}
			}
			else if (typeof param == "number")
			{
				whereStr = getWhere(whereStr, columnName, "=", param);
			}
		}
	}
	return whereStr;
}

function getWhere($where, $columnName, $check, $value, $extValue, $logic)
{
	var logicCheck = " and ";
	var len = arguments.length - 1;
	var lastValue = arguments[len];
	while (!lastValue)
	{
		len--;
		lastValue = arguments[len];
	}
	if (lastValue == "or" && arguments.length > 3)
	{
		logicCheck = " or ";
	}
	if ($value == undefined || $value == null)
	{
		return "";
	}
	$columnName = "`" + $columnName + "`";
	var check = _whereCheckHash[$check];
	if (!check)
	{
		return $where;
	}

	var newWhere = "";
	if (typeof check == "string")
	{
		newWhere = $columnName + check + $value;
	}
	else
	{
		newWhere = check($columnName, $value, $extValue, $logic);
	}

	if (newWhere)
	{
		if ($where)
		{
			$where += logicCheck;
		}
		$where += newWhere;
	}
	return $where;
}

function getWhere_equal($columnName, $value)
{
	return $columnName + "=" + val($value);
}

function getWhere_notEqual($columnName, $value)
{
	return $columnName + "!=" + val($value);
}

/**
 * 支持传入已经格式化的字符串,或者传入一个val[], 或者传入一个object[], 并指定其中某一个字段
 * 示例1:
 * $columnName = userId
 * $value =      [{id:"adfg9grse4",name:"A"}, {id:"b0gesj093g",name:"B"}]
 * $extValue=    id
 * 返回结果:      `userId` in ('adfg9grse4','b0gesj093g')
 *
 * 示例2:
 * $columnName = userId
 * $value =      ["adfg9grse4","b0gesj093g"]
 * 返回结果:      `userId` in ('adfg9grse4','b0gesj093g')
 *
 * 示例3:
 * $columnName = userId
 * $value =      "'adfg9grse4','b0gesj093g'"
 * 返回结果:      `userId` in ('adfg9grse4','b0gesj093g')
 */
function getWhere_in($columnName, $value, $extValue)
{
	var newValue = ""
	if (Array.isArray($value))
	{
		var list = $value;
		if (list.length > 0)
		{
			if (typeof list[0] == "string")
			{
				newValue = "'" + list.join("','") + "'";
			}
			else if (typeof list[0] == "number")
			{
				newValue = list.join(",");
			}
			else if (typeof list[0] == "object")
			{
				if ($extValue)
				{
					if (list.length == 1)
					{
						var tempVal = list[0][$extValue];
						if (typeof tempVal == "string")
						{
							newValue = "'" + tempVal + "'";
						}
						else
						{
							newValue = tempVal;
						}
					}
					else
					{
						newValue = list.reduce(function (a, b)
						{
							if (typeof b[$extValue] == "string")
							{
								if (typeof a == "string")
								{
									return a + ",'" + b[$extValue] + "'";
								}
								else
								{
									return "'" + a[$extValue] + "','" + b[$extValue] + "'";
								}
							}
							else if (typeof b[$extValue] == "number")
							{
								if (typeof a == "string")
								{
									return a + "," + b[$extValue];
								}
								else
								{
									return a[$extValue] + "," + b[$extValue];
								}
							}
						})
					}
				}
			}
		}
	}
	else if (typeof $value == "string")
	{
		newValue = $value;
//		if ($value.charAt(0) != "'" && $value.substr($value.length - 1) != "'")
//		{
//			$value = "'" + $value + "'";
//		}
	}

	if (newValue)
	{
		return $columnName + "in (" + newValue + ")";
	}
	return "";
}

/**
 *
 * @param $columnName
 * @param $value 字符串,采用数学区间的表示方法, 如左开右闭(0,1]
 * @returns {string}
 */
function getWhere_between($columnName, $value)
{
	var spllitIndex = $value.indexOf(",");
	if (spllitIndex <= 0)
	{
		return "";
	}
	var minSign = _whereCheckHash[$value.charAt(0)];
	var maxSign = _whereCheckHash[$value.charAt($value.length - 1)];
	if (!minSign || !maxSign)
	{
		return "";
	}
	var result = "";
	var min = $value.substring(1, $value.indexOf(","));
	if (min)
	{
		result = $columnName + minSign + min;
	}
	var max = $value.substring($value.indexOf(",") + 1, $value.length - 1);
	if (max)
	{
		if (result)
		{
			result += " and ";
		}
		result += $columnName + maxSign + max;
	}
	return result;
}

function getWhere_like($columnName, $value)
{
	if ($value.indexOf("%") < 0)
	{
		$value = "%" + $value + "%";
	}
	return $columnName + " like '" + $value + "'";
}

function getSql($sqlStr, $param)
{
	if ($param && !isEmpty($param))
	{
		$sqlStr = $sqlStr.replace(/\$/g, "");
		return paramFormat($sqlStr, $param);
	}

	return $sqlStr;
}

exports.where = where;
exports.getWhere = getWhere;
exports.getSql = getSql;
exports.sql = {
	select: select,
	insert: insert,
	update: update,
	insertUpdate: insertUpdate,
	insertSelect: insertSelect,
	delete: del,
	count: count
};

/**
 --【select 查询语句】-------------------------------------------------
 【语法1】select( 库名.表名, [字段名], {where条件},{groupBy:统计字段}, [排序条件], 页码, 分页)
 【语法2】select( 库名.表名, [字段名], {where条件}, [排序条件], limit)
 【语法3】select( 库名.表名, "字段1", "字段2", "字段3", ..., {where条件}, [排序条件], 页码/limit, 分页)

 {where条件} 没有可以不传
 {groupBy:统计字段} 没有可以不传
 [排序条件]  没有可以不传
 页码/limit  没有可以不传
 分页        没有可以不传

 --【insert 插入语句】--------------------------------------------------
 insert( 库名.表名, {数据对象})

 --【upadte 更新语句】--------------------------------------------------
 update( 库名.表名, {数据对象}, {where条件})
 {where条件} 没有可以不传

 --【delete 删除语句】--------------------------------------------------
 deldete( 库名.表名, {where条件})
 {where条件} 必须有where条件

 --【insertUpdate 插入或更新语句】
 insertUpdate( 库名.表名, {插入数据对象}, {更新数据对象})

 --【count 查询总数语句】
 count( 库名.表名, 字段名, {where条件})

 === where条件格式 ===================================================
 【语法1】{字段名: ["运算符", 条件值]}   示例:  {id:["=",0]}
 【语法2】{字段名: "运算符+条件值"}      示例:  {id:"=0"}
 【语法3】{字段名: 值}                  示例:  {id:0}     (* 仅当使用=时,可以直接简写值)
 【语法4】{字段名: ["运算符",条件值, "逻辑运算符"]}   示例: {id:["=",0,"or"]} (* 默认为and其他where条件,除非传入or)
 【语法5】{_or_: {where条件}}           示例:  {_or_: {id:0}}  增加一个括号运算并和其他条件or合并 or (id=0)
 【语法5】{_and_: {where条件}}           示例:  {_and_: {id:0}}  增加一个括号运算并和其他条件and合并 and (id=0)

 where运算符:
 = > < >= <= != like between
 【特殊语法1】 between,值必须为字符串, 并采用开闭区间的写法, 如 [1,5]  (1,5)  [1,5)  (1,5]
 示例:
 {num:["between","[1,5)"]}  (表示 num>=1 && num<5)

 */

//参考语句:
//select("user.user", ["id", "name", "type", "createTime"], ["type", ["createTime", "desc"]]);
//select("static.static_const", "key", "value", {isClient: ["=", 1]});
//select("static.static_const", "key", "value", {isClient: "=1"});
//select("static.static_const", "key", "value", {isClient: 1});
//select("user.user", "*", {createTime: ["between", "[1445672000,1547743000)"]}, ["createTime", "desc"]);
//select("user.user", ["id", "name", "type", "createTime"], {groupBy: "type"}, 1, 1);
//select("user.user", ["id", "name", "type", "createTime"], {groupBy: ["type","class"]}, 1, 1);
//select("user.user", ["id", "name", "type", "createTime"], {groupBy: "type,class"}, 1, 1);
//select("user.user", ["id", "name", "type", "createTime"], {groupBy: "type"}, 1, 1);
//insert("user.user", {name: "billy", age: 30});
//insert("user.user", [{name: "billy", age: 30}, {name: "tom", age: 22}]);
//update("user.user", {avatar: "", age:3, name: "tom", phone: "13813845678"}, {id: ["=","bs87gahegr7"]});
//update("user.user", {avatar: "", age:4, name: "tom", phone: "13813845678"}, {id: "='bs87gahegr7'"});
//del("user.user", {age: "<3"});

//select("static.static_const", "key", "value", {isClient: ["=", 1]}, ["startTime"], 1);
//select("static.static_const", "*", ["startTime desc", ["type", "asc"]], 1, 10);
//select(["school_{schoolId}.user", {schoolId: 1}], "*", ["startTime desc", ["type", "asc"]], 1, 10);
//insertUpdate("user.user", {userId: "1",	type: 1, num: 1, date: "2019-1-1"}, {num: "`num`+1", date: "2019-1-1"});

/**
 select("school.user_test_item", ["baseId", "itemId", "desc", "format", "iepView"], {
	testId: 2342,
	_and_: {
		desc: ["!=", ""],
		format: ["!=", "", "or"],
		iepView: ["=", 0, "or"],
		_or_: {
			id: 11,
			age: 32
		}
	},
	_or_: {
		id: 11,
		age: 32
	}
})
 */

/**
 var userList = [{id: "11"}]
 var whereParam = {parentId: 0};
 whereParam.userId = ["=", "AAAAAAAAAA"];
 whereParam._and_ = {
	testManId: ["in", userList, "id"],
	testManId1: ["in", userList, "id", "or"],
	testManId2: ["in", userList, "id", "or"]
};
 var tableName = paramFormat("school_{schoolId}", {schoolId: 1});
 var columnList = ["id", "userId", "type", "status", "startTime", "times", "endTime", "formId", "testManId",
 "testManId1", "testManId2", "testManId3", "testManId4", "testManId5", "testManId6", "testManId7", "testManId8"];
 var sqlStr = select(tableName, columnList, whereParam, ["startTime", "desc"], 1, 10);
 sqlStr += count(tableName, "total", whereParam);
 trace(sqlStr)
 */