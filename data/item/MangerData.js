/**
 * Created by billy on 2017/8/24.
 */
module.exports = class {
	constructor($data)
	{
		this._data = $data;
		this._name = "";
		this._type = "";
		this._param = {};
		this._module = {};
		this._enabled = true;
		this._manager = null;
		this.update($data)
	}

	update($data)
	{
		$data.hasOwnProperty("name") && (this._name = $data.name);
		$data.hasOwnProperty("type") && (this._type = $data.type.toLowerCase());
		$data.hasOwnProperty("param") && (this._param = __merge({}, $data.param));
		$data.hasOwnProperty("module") && (this._module = __merge({}, $data.module));
		$data.hasOwnProperty("enabled") && (this._enabled = $data.enabled);
		$data.hasOwnProperty("manager") && (this._manager = $data.manager);
	}

	get name()
	{
		return this._name;
	}

	get type()
	{
		return this._type;
	}

	get param()
	{
		return this._param;
	}

	get module()
	{
		return this._module;
	}

	get enabled()
	{
		return this._enabled;
	}

	get data()
	{
		return this._data;
	}

	get manager()
	{
		return this._manager;
	}

};