(function(){
	var Storage = window.Storage = function()
	{
		this.storage = window.localStorage;
	}

	Storage.prototype.set = function(key, value)
	{
		this.storage.setItem(key, value);
	}

	Storage.prototype.get = function(key, _default)
	{
		return this.storage.getItem(key) ? this.storage.getItem(key) : _default;
	}

	Storage.prototype.remove = function(key)
	{
		this.storage.removeItem(key);
	}
})()
