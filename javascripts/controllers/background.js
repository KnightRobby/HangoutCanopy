(function(){
	/*
		* Hangout Canopy V2
		* http://hangoutcanopy.com
		*  Developers : Robert Pit
	*/

	BackgroundController = window.BackgroundController = function()
	{
		this.logger	= new window.Logger();
		this.connection	= new window.Connection();
		this.storage	= new window.Storage();
		this.manager	= new window.HangoutManager();

		/*
			* Get settings from storage
		*/
		this.notifications = this.storage.get('notifications', false);


		/*
			* Connect to the server
		*/
		this.connection.connect();
		
		/*
			* Bind Namespaces
		*/
		this.connection.bindEventListener('connect'		, this.onSocketConnected.bind(this));
		this.connection.bindEventListener('disconnect'		, this.onSocketDisconnect.bind(this));
		this.connection.bindEventListener('reconnect'		, this.onSocketReconnect.bind(this));
		this.connection.bindEventListener('reconnect_failed'	, this.onSocketReconnectFailed.bind(this));
		this.connection.bindEventListener('hangout_live'	, this.onHangoutLive.bind(this));
		this.connection.bindEventListener('hangout_closed'	, this.onHangoutClosed.bind(this));
		this.connection.bindEventListener('settings'		, this.onSettings.bind(this));
	}

	BackgroundController.prototype.getHangoutManager = function()
	{
		return this.manager;
	}

	BackgroundController.prototype.onSettings = function(settings)
	{
		this.logger.notice('Got settings from server');
		this.manager.start();
	}

	/*
		* Send hangout to the server
	*/
	BackgroundController.prototype.sendHangout = function(hangout)
	{
		this.logger.notice('Sending new hangout to server: ' + hangout.id);
		this.connection.send('hangout_live', hangout);
	}

	/*
		* inform server hangout has closed
	*/
	BackgroundController.prototype.sendHangoutClosed = function(hangout)
	{
		this.logger.notice('Informing server of Hangout Closed: ' + hangout.id);
		this.connection.send('hangout_closed', hangout);
	}

	/*
		* On Connect Event
	*/
	BackgroundController.prototype.onSocketConnected = function()
	{
		this.logger.notice('Connected to server');
	}

	/*
		* On Disconnect Event
	*/
	BackgroundController.prototype.onSocketDisconnect = function()
	{
		this.logger.notice('Disconnected from Server');
	}

	/*
		* On Reconnect Event
	*/
	BackgroundController.prototype.onSocketReconnect = function()
	{
		this.logger.notice('Reconnected to Server');
	}

	/*
		* On Reconnect Failure Event
	*/
	BackgroundController.prototype.onSocketReconnectFailed = function()
	{
		this.logger.notice('Reconnect Attempt Failed');
	}

	/*
		* On New Hangout Event
	*/
	BackgroundController.prototype.onHangoutLive = function(hangout)
	{
		this.logger.notice('Got Hangout from Server: ' + hangout.id);
		this.manager.addExternalHangout(hangout);
	}

	/*
		* On Hangout Closed
	*/
	BackgroundController.prototype.onHangoutClosed = function(id)
	{
		this.logger.notice('Got Hangout closed from Server: ' + id);
		this.manager.removeExternalHangout(id);
	}
})()
