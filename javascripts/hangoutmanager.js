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
		this.logger	= new window.Logger();

		/*
			* Storage Containers
		*/
		this.hangouts = [];

		/*
			* Get required configuration
		*/
		this.detectionTimeout	= this.storage.get('detection_timeout', 5000);
		this.monitorTimeout	= this.storage.get('monitor_timeout', 10000);
	}

	HangoutManager.prototype.getHangouts = function()
	{
		return this.hangouts;
	}

	HangoutManager.prototype.start = function()
	{
		/*
			* Start the detection process
		*/
		this.detection();
		this.logger.notice("Hangout Detection Started");

		/*
			* Start the monitoring process
		*/
		this.monitor();
		this.logger.notice("Hangout Monitoring Started");
	}

	/*
		* Monitor Hangouts
	*/
	HangoutManager.prototype.monitor = function()
	{
		var hangout = this.getOldestHangout();

		if(hangout != false)
		{
			this.ajax.get(hangout.post_url, (function(Request){
				/*
					* Check for 200 OK
				*/
				if(Request.status != 200)
				{
					return;
				}

				/*
					* Parse the hangout
				*/
				var newHangout = this.parser.parseSingleHangout(Request.responseText);

				if(!newHangout)
				{
					return;
				}

				switch(newHangout.type)
				{
					case 'open':
						this.addInternalHangout(newHangout);
					break;
					case 'closed':
						this.removeInternalHangout(newHangout);
					break;
				}
			}).bind(this));
		}
		setTimeout(this.monitor.bind(this), this.detectionTimeout);
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
				switch(hangouts[i].type)
				{
					case 'open':
						this.addInternalHangout(hangouts[i]);
					break;
					case 'closed':
						this.removeInternalHangout(hangouts[i]);
					break;
				}
			}
		}).bind(this));
	}

	HangoutManager.prototype.removeExternalHangout = function(id)
	{
		this.hangouts.forEach(function(value, index, context){
			if(value.id == id)
			{
				this.hangouts.splice(index, 1);
			}
		}, this);
	}

	HangoutManager.prototype.addExternalHangout = function(hangout)
	{
		hangout.last_checked = this.getTimestamp();
		hangout.internal = false;
		var _index = false;

		this.hangouts.forEach(function(value, index, context){
			if(value.id == hangout.id)
			{
				hangout.internal = this.hangouts[index].internal == true ? true : false;
				this.hangouts.splice(index, 1);
			}
		},this);

		this.hangouts.push(hangout);
	}

	HangoutManager.prototype.removeInternalHangout = function(hangout)
	{
		this.hangouts.forEach(function(value, index){
			if(value.id == hangout.id){
				this.hangouts.splice(index, 1);
				getController().sendHangoutClosed(hangout);
			}
		},this);
	}

	HangoutManager.prototype.addInternalHangout = function(hangout)
	{
		/*
			* Update / Add last checked timestamp
		*/
		hangout.lastChecked	= this.getTimestamp();
		hangout.internal	= true;

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
				if(hangout.public == true)
				{
					getController().sendHangout(hangout);
				}
			}
		}else
		{
			/*
				* Emit it to the server
			*/
			if(hangout.public == true)
			{
				getController().sendHangout(hangout);
			}
		}

		/*
			* update the internal stack
		*/
		var updated = false;
		this.hangouts.forEach(function(value, index, context){
			if(value.id == hangout.id)
			{
				this.hangouts[index] = hangout;
				updated = true;
			}
		},this);

		if(!updated)
		{
			this.hangouts.push(hangout);
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

	HangoutManager.prototype.getHangout = function(id)
	{
		var hangout = null;

		this.hangouts.forEach(function(value, index){
			if(value.id == id){hangout = value;}
		},this);

		return hangout;
	}

	HangoutManager.prototype.hangoutHasChange = function(hangout)
	{
		var oldHangout;

		this.hangouts.forEach(function(value, index){
			if(value.id == hangout.id){oldHangout = value;}
		},this);

		if(!oldHangout)
		{
			return true;
		}

		if(oldHangout.clients.length != hangout.clients.length)
		{
			return true;
		}

		/*
			* validate clients themselfs
		*/
		var ids = {};    
		for(var i = 0; i < oldHangout.clients.length; i++)
		{
			ids[oldHangout.clients[i].id] = true;
		}

		for(var i = 0; i < hangout.clients.length; i++)
		{
			var bid = hangout.clients[i].id;

			if(!(bid in ids))
			{
		    		return true;
			}
		}

		return false;
	}

	HangoutManager.prototype.getOldestHangout = function()
	{
		var oldest = false;

		this.hangouts.forEach(function(value, index, context){
			if(value.internal == true)
			{
				if(oldest == false)
				{
					oldest = value;
					return;
				}

				if(oldest.lastChecked > value.lastChecked)
				{
					oldest = value;
				}
			}
		},this);

		return oldest;
	}

	HangoutManager.prototype.getTimestamp = function()
	{
		return new Date().getTime();
	}
})()
