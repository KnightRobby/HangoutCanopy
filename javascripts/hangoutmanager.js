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
			/*
				* parse main page for hangouts
			*/
			var hangouts = this.parser.parseHangouts(Request.responseText);

			/*
				* loop hangouts
			*/
			for(var i = 0; i < hangouts.length; i++)
			{
				var hangout = hangouts[i];

				if(hangout.type == 'open')
				{
					hangout.internal = true;
					if(this.hangoutExists(hangout))
					{
						/*
							* Check for changes
						*/
						if(this.hangoutHasChanged(hangout) === false)
						{
							continue;
						}
					}
					/*
						* Let server know about the hangout
					*/
					if(hangout.public == true)
					{
						window.getController().sendHangout(hangout);
					}

					this.setHangout(hangout);
				}

				if(hangout.type == 'closed')
				{
					window.getController().sendHangoutClosed(hangout);
					this.removeHangout({id: hangout.id});
					return;
				}
			}

			/*
				* Restart the detection
			*/
			setTimeout(this.detection.bind(this), this.detectionTimeout);
		}).bind(this));
	}

	HangoutManager.prototype.removeHangout = function(hangout)
	{
		for(var i = 0; i < this.hangouts.length; i++)
		{
			if(this.hangouts[i].id == hangout.id)
			{
				this.hangouts.splice(i,1);
				return;
			}
		}
	}

	HangoutManager.prototype.setHangout = function(hangout)
	{
		hangout.internal = true;
		hangout.last_checked = new Date().getTime() / 1000;
		for(var i = 0; i < this.hangouts.length; i++)
		{
			if(this.hangouts[i].id == hangout.id)
			{
				this.hangouts[i] = hangout;
				return;
			}
		}

		this.hangouts.push(hangout);
	}

	HangoutManager.prototype.setExternalHangout = function(hangout)
	{
		hangout.internal = false;
		for(var i = 0; i < this.hangouts.length; i++)
		{
			if(this.hangouts[i].id == hangout.id)
			{
				hangout.internal = this.hangouts[i].internal ? false : true;
				this.hangouts[i] = hangout;
				return;
			}
		}

		this.hangouts.push(hangout);
	}

	HangoutManager.prototype.hangoutHasChanged = function(newHangout)
	{
		var oldHangout = this.hangouts[newHangout.id];

		if(oldHangout.clients.length != newHangout.clients.length)
		{
			return true;
		}

		/*
			* Map users to validate a change
		*/
		return false;
	}

	HangoutManager.prototype.hangoutExists = function(id)
	{
		for(var i = 0; i < this.hangouts.length; i++)
		{
			if(this.hangouts[i].id == id)
			{
				return true;
			}
		}
		return false;
	}

	HangoutManager.prototype.getOldestHangout = function()
	{
		var oldest = false;
		for (var key in this.hangouts)
		{
			if(!this.hangouts.hasOwnProperty(key))
			{
				continue;
			}

			if(!this.hangouts[key].internal)
			{
				continue;
			}

			/*
				* Check to see if we have set the oldest variable already
			*/
			if(!oldest)
			{
				oldest = key;
				continue;
			}

			var _oldest = this.hangouts[oldest].last_checked;
			var _current = this.hangouts[key].last_checked;

			/*
				* Compare the current with the odlest one
			*/
			if(_current < _oldest)
			{
				oldest = key;
			}
		}
		return oldest;
	}
})()
