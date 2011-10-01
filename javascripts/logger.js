(function(){
	
	/*
		* Logger Class
	*/
	var Logger = window.Logger = function()
	{
		this.logs = [];
	}

	Logger.prototype.error = function(message, context)
	{
		this.createLog('error',message, context);
	}

	Logger.prototype.warn = function(message, context)
	{
		this.createLog('warn',message, context);
	}

	Logger.prototype.notice = function(message)
	{
		this.createLog('notice',message, null);
	}

	Logger.prototype.createLog = function(type, message, context)
	{
		var _log = {
			time		: new Date().getTime(),
			type		: type,
			message		: message,
			context		: context ? context : 'N/A'
		};

		this.logs.push(_log);

		if(__Debug == true)
		{
			console.log(_log.type + ': ' + _log.message);
		}
	}
})()
