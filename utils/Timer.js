/**
 * Created by billy on 2017/7/10.
 */
/*

 用setTimeout的方式来实现Timer
 这样每个setTimeout就检查一次，也就相当于interval，
 所以就分为延迟执行，和间隔执行两种
 然而setTime方式的缺陷是无法实施更新interval
 所以全局tick的方式确实还是很靠谱的
 但是tick里面使用的方法是浏览器端方法，并非node方法
 */
const EventEmitter = require('events');
const TIMER_UPDATE = "TIMER_UPDATE";
const TIMER_COMPLETE = "TIMER_COMPLETE";

class Timer extends EventEmitter {
	constructor(delay, repeatCount)
	{
		super();
		repeatCount = repeatCount || 0;
		delay = delay || 0;
		this._delay = delay | 0;
		this.repeatCount = repeatCount | 0;
		this._timer = null;
		this._startTime = 0;
		this._currentCount = 0;
		this._running = false;
		this._lastDelay = 0;
	}

	reset()
	{
		this.stop();
		this._currentCount = 0;
		this._delay = 0;
		this._lastDelay = 0;
		this._timer = null;
	}

	start()
	{
		if (this._running)
		{
			return;
		}

		this._startTime = Date.now();
		var delay = this._lastDelay || this._delay;
		this._timer = setTimeout(this.$update.bind(this), delay);
		this._running = true;
	}

	stop()
	{
		if (!this._running)
		{
			return;
		}
		if (this._startTime > 0)
		{
			this._lastDelay = this._delay - (Date.now() - this._startTime) - this._lastDelay;
		}
		clearTimeout(this._timer);
		this._running = false;
	}

	$update(timeStamp)
	{
		this._currentCount++;
		var complete = (this.repeatCount > 0 && this._currentCount >= this.repeatCount);
		if (complete)
		{
			this.reset();
			this.emit(TIMER_COMPLETE);
		}
		else
		{
			this._startTime = Date.now();
			this._timer = setTimeout(this.$update.bind(this), this._delay);
		}
		this.emit(TIMER_UPDATE);
		return false;
	}

	get currentCount()
	{
		return this._currentCount;
	}

	get running()
	{
		return this._running;
	}

	get delay()
	{
		return this._delay;
	}

//	set delay($v)
//	{
//		if ($v < 1)
//		{
//			$v = 1;
//		}
//		if (this._delay == $v)
//		{
//			return;
//		}
//		this._delay = $v;
//	}
}

Timer.TIMER_UPDATE = TIMER_UPDATE;
Timer.TIMER_COMPLETE = TIMER_COMPLETE;

module.exports = Timer;