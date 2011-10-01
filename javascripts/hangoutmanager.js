(function(){
	/*
		* Hangout Manager
		* Controls the flow of Hangouts, Detecting and Recieving
	*/
	
	var HangoutManager = window.HangoutManager = function()
	{
		this.ajax	= new window.Ajax();
		this.parser	= new window.HangoutParser();
		this.storage	= new window.Storage();

		/*
			* Storage Containers
		*/
		this.hangouts = [];

		/*
			* Get required configuration
		*/
		this.detectionTimeout	= this.storage.get('detection_timeout', 10000);
		this.monitorTimeout	= this.storage.get('monitor_timeout', 10000);

		/*
			* Start the detection process
		*/
		this.detection();

		/*
			* Start the monitoring process
		*/
		this.monitor();
	}

	/*
		* Monitor Hangouts
	*/
	HangoutManager.prototype.monitor = function()
	{
	}

	/*
		* Detection of Hangouts
	*/
	HangoutManager.prototype.detection = function()
	{
		this.ajax.get('https://plus.google.com/', (function(Request){
			setTimeout(this.detection.bind(this), this.detectionTimeout);

			/*
				* Assure Google Responded
			*/
			if(Request.status != 200)
			{
				return;
			}
			
			/*
				* Parse the hangouts
			*/
			var hangouts = this.parser.parseHangouts(Request.responseText);


			/*
				* Validate we have hangouts
			*/
			if(hangouts.length == 0)
			{
				return;
			}

			/*
				* Loop Each Hangout
			*/
			for(var i = 0; i < hangouts.length; i++)
			{
				this.addinternalHangout(hangouts[i]);
			}
		}).bind(this));
	}

	HangoutManager.prototype.removeExternalHangout = function(id)
	{
	}

	HangoutManager.prototype.addExternalHangout = function(hangout)
	{
		hangout.last_checked = this.getTimestamp();
	}

	HangoutManager.prototype.removeInternalHangout = function(id)
	{
	}

	HangoutManager.prototype.addinternalHangout = function(hangout)
	{
		/*
			* Update / Add last checked timestamp
		*/
		hangout.lastChecked = this.getTimestamp();

		/*
			* Check to see if the hangout already exists
		*/
		if(this.hangoutExists(hangout.id))
		{
			if(this.hangoutHasChange(hangout))
			{
				/*
					* Emit to the server
				*/
			}
		}else
		{
			/*
				* emit it to the server
			*/
		}
	}

	HangoutManager.prototype.hangoutExists = function(id)
	{
		var exists = false;

		this.hangouts.forEach(function(value, index){
			if(value.id == id){exists = true;}
		},this);

		return exists;
	}

	HangoutManager.prototype.hangoutHasChange = function(hangout)
	{
		
	}

	HangoutManager.prototype.getTimestamp = function()
	{
		return new Date().getTime();
	}
})()
