/**
 * Created by billy on 2016/11/24.
 */
const TYPE_D = "dd";
const TYPE_H = "hh";
const TYPE_M = "mm";
const TYPE_S = "ss";
const TYPE_HMS = "hh:mm:ss";
const TYPE_DHMS = "dd：hh:mm:ss";
const TYPE_MS = "mm:ss";

exports.TYPE_D = TYPE_D;
exports.TYPE_H = TYPE_H;
exports.TYPE_M = TYPE_M;
exports.TYPE_S = TYPE_S;
exports.TYPE_HMS = TYPE_HMS;
exports.TYPE_DHMS = TYPE_DHMS;

var __START_TIME = Date.now();

/**
 * 根据时间戳获取完整日期 yy-mm-dd hh:mm:ss
 * @param $time 时间戳（支持10位/13位）
 * @param $dibit 数字是否补足0，默认false
 * @returns {string}
 */
function getFullDate($time, $dibit)
{
	return getDate($time, $dibit) + " " + getTime($time, $dibit);
}
exports.getFullDate = getFullDate;

/**
 * 根据时间戳获取日期的数组形式 [yy,mm,dd,hh,mm,ss]
 * @param $time 时间戳（支持10位/13位）
 * @param $debit 数字是否补足0，默认false
 * @returns {Array.<T>|string|*}
 */
function getFullDateArray($time, $debit)
{
	return getDateArray($time, $debit)
		.concat(getTimeArray($time, $debit));
}
exports.getFullDateArray = getFullDateArray;

/**
 * 根据时间戳获取时间的日期格式 hh:mm:ss
 * @param $time 时间戳（支持10位/13位）
 * @param $dibit 数字是否补足0，默认false
 * @returns {string}
 */
function getTime($time, $debit)
{
	return getTimeArray($time, $debit)
		.join(":");
}
exports.getTime = getTime;

/**
 * 根据时间戳，获取时间的数组形式[hh,mm,ss]
 * @param $time 时间戳（支持10位/13位）
 * @param $debit 数字是否补足0，默认false
 * @returns {*}
 */
function getTimeArray($time = 0, $debit = false)
{
	if ($time == 0)
	{
		return getBasicTimeArray(new Date(), $debit);
	}
	else if ($time.toString().length == 10)
	{
		return getBasicTimeArray(new Date($time * 1000), $debit);
	}
	else
	{
		return getBasicTimeArray(new Date($time), $debit);
	}
}
exports.getTimeArray = getTimeArray;

/**
 * 根据时间戳，获取日期的日期形式 yy-mm-dd
 * @param $time 时间戳（支持10位/13位）
 * @param $dibit 数字是否补足0，默认false
 * @returns {string}
 */
function getDate($time, debit)
{
	return getDateArray($time, debit)
		.join("-");
}
exports.getDate = getDate;

/**
 * 根据时间戳，获取日期的数组形式 [yy,mm,dd]
 * @param $time 时间戳（支持10位/13位）
 * @param $debit 数字是否补足0，默认false
 * @returns {array}
 */
function getDateArray($time = 0, $debit = false)
{
	if ($time == 0)
	{
		return getBasicDateArray(new Date(), $debit);
	}
	else
	{
		if ($time.toString().length == 10)
		{
			return getBasicDateArray(new Date($time * 1000), $debit);
		}
		else
		{
			return getBasicDateArray(new Date($time), $debit);
		}
	}
}
exports.getDateArray = getDateArray;

function getBasicDateArray(da, debit)
{
	return [debit ? (da.getFullYear() < 10 ? "0" + da.getFullYear() : da.getFullYear().toString()) :
		da.getFullYear(), debit ? (da.getMonth() + 1 < 10 ? "0" + (da.getMonth() + 1) : (da.getMonth() + 1).toString()) :
	da.getMonth() + 1, debit ? (da.getDate() < 10 ? "0" + da.getDate() : da.getDate().toString()) :
		da.getDate()];
}

function getBasicTimeArray(da, debit)
{
	return [debit ? (da.getHours() < 10 ? "0" + da.getHours() : da.getHours().toString()) : da.getHours(), debit ?
		(da.getMinutes() < 10 ? "0" + da.getMinutes() : da.getMinutes().toString()) : da.getMinutes(), debit ?
		(da.getSeconds() < 10 ? "0" + da.getSeconds() : da.getSeconds().toString()) : da.getSeconds()];
}

/**
 * 获取当前时间戳
 * @param len 时间戳位数 10/13
 * @returns {number}
 */
function getNowStamp(len = 10)
{
	var da = new Date();
	var temptime = da.getTime()
		.toString();
	temptime = temptime.substr(0, len);
	return Number(temptime);
}
exports.getNowStamp = getNowStamp;

/**
 * 根据传入的时间（秒/时间戳）返回格式化的时间字符串
 * @param $time 秒、时间戳(10/13位)
 * @param type 格式化类型
 * @returns {*}
 */
function formatTime($time, type = TYPE_DHMS)
{
	if (String($time).length >= 10)
	{
		return getFullDate($time, true);
	}
	else
	{
		if ($time < 0)
		{
			return "00:00:00";
		}
		else
		{
			var a = getCountDown($time, type);
			for (var i = 0; i < a.length; i++)
			{
				a[i] = a[i] < 10 ? "0" + a[i] : a[i];
			}
			return a.join(":");
		}
	}
}
exports.formatTime = formatTime;

/**
 *  获取当前已经运行了多少豪秒
 * @returns {number}
 */
function getTimer()
{
	return Date.now() - __START_TIME;
}
exports.getTimer = getTimer;

/**
 *  根据传入的时间（秒/时间戳10位/时间戳13位），返回倒计时的数组形式[dd,hh,mm,ss]
 * @param $time 时间，秒/时间戳
 * @param type 格式化类型
 * @returns {Array}
 */
function getCountDown($time, type = TYPE_HMS, debit = false)
{
	var a = [];
	var t = $time;
	var n;
	if (type.indexOf(TYPE_S) >= 0)
	{
		n = $time % 60;
		n = (debit && n < 10) ? "0" + n : n;
		a.push(n);
	}
	if (type.indexOf(TYPE_M) >= 0)
	{
		n = Math.floor(Number(($time % 3600) / 60));
		n = (debit && n < 10) ? "0" + n : n;
		a.unshift(n);
	}
	if (type.indexOf(TYPE_H) >= 0)
	{
		if (type == TYPE_HMS) //如果格式是hh:mm:ss 那么 hh位应该显示真实的小时数，而不是按一天的秒数取余再算小时数
		{
			n = Math.floor($time / 3600);
			n = (debit && n < 10) ? "0" + n : n;
			a.unshift(n);
		}
		else
		{
			n = Math.floor(($time % 86400) / 3600);
			n = (debit && n < 10) ? "0" + n : n;
			a.unshift(n);
		}
	}
	if (type.indexOf(TYPE_D) >= 0)
	{
		n = Math.floor($time / 86400);
		n = (debit && n < 10) ? "0" + n : n;
		a.unshift(n);
	}
	return a;
}
exports.getCountDown = getCountDown;

/**
 * 获取指定时间戳距离0点已经过去了多少秒（不传，就是今天过去了多少秒）
 * @param $time
 * @returns {number}
 */
function getPastSecond($time = 0)
{
	var temp = getTimeArray($time);
	return Math.floor(Number(temp[0])) * 3600 + Math.floor(Number(temp[1])) * 60 + Math.floor(Number(temp[2]));
}
exports.getPastSecond = getPastSecond;

/**
 * 获取指定的week的日期数据
 * @param weekOffset 周偏移量，当前周为0，上一周为-1,下一周为1，依次类推
 * @param sundayFirst
 * @returns {Array}
 */
function getWeek(weekOffset = 0, sundayFirst = true)
{
	var resultList = [];
	var da = new Date();
	var y = da.getFullYear();
	var m = da.getMonth();
	var d = da.getDate() + weekOffset * 7;
	var day = da.getDay();
	if (!sundayFirst)
	{
		day--;
		day == -1 && (day = 6);
	}

	for (let i = 0; i < 7; i++)
	{
		var temp = new Date(y, m, d - day + i)
		resultList.push([temp.getTime(), temp.getTime() + 86400000, temp.getFullYear(), temp.getMonth(), temp.getDate()]);
	}

	return resultList;
}
exports.getWeek = getWeek;

/**
 * 获取指定的month的日期列表
 * @param monthOffset 月偏移量，当前月为0，上月为-1，下月为1，依次类推
 * @returns {nowYear:number; nowMonth:number; nowDate:number; year:number; month:number; list:number[][]}
 */
function getMonthByOffset(monthOffset = 0, sundayFirst = true)
{
	var resultList = [];
	var da = new Date();
	var nowY = da.getFullYear();
	var nowM = da.getMonth();
	var y = nowY;
	var m = nowM + monthOffset;
	var start = new Date(y, m, 1);
	var end = new Date(y, m + 1, 0);
	y = start.getFullYear();
	m = start.getMonth();
	var endDate = end.getDate();
	for (let i = 1; i <= end.getDate(); i++)
	{
		resultList.push([y, m, i]);
// 		resultList.push(y + "_" + m + "_" + i);
	}

	var day = new Date(y, m, 1).getDay();

	for (let i = 0; i < day; i++)
	{
		var tempDate = new Date(y, m, -i);

		resultList.unshift([tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate()]);
// 		resultList.unshift(tempDate.getFullYear() + "_" + tempDate.getUTCMonth() + "_" + tempDate.getDate());
	}
	day = end.getDay();
	for (let i = 1; i < 7 - day; i++)
	{
		var tempDate = new Date(y, m, i + endDate);
		resultList.push([tempDate.getFullYear(), tempDate.getMonth(), tempDate.getDate()]);
// 		resultList.push(tempDate.getFullYear() + "_" + tempDate.getUTCMonth() + "_" + tempDate.getDate());
	}

	var resultObj = Object.create(null);
	resultObj.nowYear = nowY;
	resultObj.nowMonth = nowM;
	resultObj.year = y;
	resultObj.month = m;
	resultObj.nowDate = da.getDate();
	var startDateArr = resultList[0];
	var endDateArr = resultList[resultList.length - 1];
	resultObj.startTime = new Date(startDateArr[0], startDateArr[1], startDateArr[2]).getTime() / 1000;
	resultObj.endTime = new Date(endDateArr[0], endDateArr[1], endDateArr[2]).getTime() / 1000 + 86400;
	resultObj.list = resultList
	return resultObj;
}
exports.getMonthByOffset = getMonthByOffset;

/**
 * 根据时间戳/日期，获取属于今年第几周（周一开始）
 * @param arg
 */
function getWeekNum(...arg)
{
	var startDate;
	var startTime;
	var startDay;
	var endDate;
	var endTime;
	var endDay;
	var startAtMonday = true;
	var offset = 0;
	if (arg.length <= 2)
	{
		endTime = arg[0];
		if (Array.isArray(arg[0]))
		{
			endDate = new Date(arg[0][0], arg[0][1], arg[0][2]);
		}
		else
		{
			if ((endTime + "").length == 10)
			{
				endTime = endTime * 1000;
			}
			endDate = new Date(endTime);
		}
		if (arg.length == 2 && arg[2] == false)
		{
			//默认从周一开始计算
			startAtMonday = false;
		}
	}
	else
	{
		endDate = new Date(arg[0], arg[1], arg[2]);
	}
	endTime = endDate.getTime();
	endDay = endDate.getDay();
	startDate = new Date(endDate.getFullYear(), 0, 1);
	startTime = startDate.getTime();
	startDay = startDate.getDay();
	var dayNum = int((endTime - startTime) / 1000 / 86400) + 1;
	if (startAtMonday)
	{
		dayNum = startDay == 0 ? dayNum - 1 : dayNum - (7 - startDay);
	}
	else
	{
		dayNum = dayNum - (8 - startDay);
	}
	return Math.ceil(dayNum / 7) + 1;
}
exports.getWeekNum = getWeekNum;

/**
 * 获取两个日期的间隔天数
 * @param $date1 日期1 格式可以是 1时间戳(数字/字符串) 2数组 3日期字符串
 * @param $date2 日期2 格式可以是 1时间戳(数字/字符串) 2数组 3日期字符串
 */
function getOffset($date1, $date2)
{
	var time1 = getTimeStampByDate($date1);
	var time2 = getTimeStampByDate($date2);

	return parseInt((time2 - time1) / 86400000);
}
exports.getOffset = getOffset;

function getTimeStampByDate($date)
{
	if (typeof $date == "string")
	{
		if (Number($date) != $date - 0)
		{
			var dateArr = $date.split(" ")[0].split("-");
			return new Date(dateArr).getTime();
		}
		else
		{
			if ($date.length == 10)
			{
				return Number($date) * 1000;
			}
			return Number($date);
		}
	}
	else if (Array.isArray($date))
	{
		return new Date($date).getTime();
	}
	else if (typeof $date == "number")
	{
		if (($date + "").length == 10)
		{
			return $date * 1000;
		}
		return $date;
	}
}