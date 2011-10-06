(function(){
	var NotificationController = window.NotificationController = function()
	{
		this.background = chrome.extension.getBackgroundPage().getController();
		
		/*
			* Set up variables
		*/
		this.hangout = null;
		this.client = null;

		/*
			* Validate the notification can be shown
		*/
		this.setup();

		/*
			* bind Onload
		*/
		window.onload = this.onLoad.bind(this);
	}

	NotificationController.prototype.setup = function()
	{
		var urlParams = {};
		(function () {
		    var e,
			a = /\+/g,  // Regex for replacing addition symbol with a space
			r = /([^&=]+)=?([^&]*)/g,
			d = function (s) { return decodeURIComponent(s.replace(a, " ")); },
			q = window.location.search.substring(1);

		    while (e = r.exec(q))
		       urlParams[d(e[1])] = d(e[2]);
		})();

		/*
			* CID = Client ID
			* HID = Hangout ID
		*/

		if(!urlParams.cid || !urlParams.hid)
		{
			window.close();
		}

		/*
			* Validate the hangout exists and the client does as well
		*/
		var hangout = this.background.manager.getHangout(urlParams.hid);
		console.log(hangout);
		if(!hangout)
		{
			window.close();
		}

		var client = null;
		hangouts.clients.forEach(function(index, value){
			if(value.id == urlParams.clid){ client = value; }
		});

		if(!client)
		{
			window.close();
		}

		/*
			* Set the data to the object
		*/
	}

	NotificationController.prototype.onLoad = function()
	{
		document.write('Loaded: ' + this.client.name);
	}
})()
