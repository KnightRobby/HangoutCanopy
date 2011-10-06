(function(){
	/*
		* Watching Manager
	*/
	var WatchingManager = window.WatchingManager = function()
	{
		this.notifications = new window.Notifications();
		this.clients = {};
		this.hangoutMap = {};
	}

	WatchingManager.prototype.onHangout = function(hangout)
	{
		hangout.clients.forEach((function(value, i){

			if(value.id in this.clients)
			{
				if(!(value.id in this.hangoutMap) || this.hangoutMap[value.id] != hangout.id)
				{
					this.notifications.triggerWatchedHangoutNotification(hangout.id, value.id);
					this.hangoutMap[value.id] = hangout.id;
				}
			}

		}).bind(this));
	}

	WatchingManager.prototype.watchClient = function(id)
	{
		this.clients[id] = true;
	}

	WatchingManager.prototype.unwatchClient = function(id)
	{
		if((id in this.clients))
		{
			delete this.clients[id];
		}
	}
})()
