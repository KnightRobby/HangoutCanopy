(function(){
	var PopupController = window.PopupController = function()
	{
		this.background = chrome.extension.getBackgroundPage().getController();

		/*
			* Compile Templates, During DOM Load
		*/
		this.compileTemplates();
	}

	PopupController.prototype.init = function()
	{
		this.initializeHangouts();
	}

	PopupController.prototype.compileTemplates = function()
	{
		$.template("hangouts.row", templates.hangouts.row);
	}

	PopupController.prototype.initializeHangouts = function()
	{
		setTimeout(this.initializeHangouts.bind(this),5000);
		
		/*
			* Get hangout set from background Controller
		*/
		var hangouts = this.background.manager.getHangouts();

		/*
			* Get DOM Area for hangouts
		*/
		var hangoutDOM = $('#hangouts');

		for(var i = 0; i < hangouts.length; i++)
		{
			/*
				* Create a valid ID for the html
			*/
			hangouts[i].htmlid = hangouts[i].id.replace(/[^a-zA-Z0-9]+/g,'');

			/*
				* check to see if the old one exists
			*/
			var exists = $('#' + hangouts[i].htmlid, hangoutDOM).length > 0;

			/*
				* Genreate the html
			*/
			var html = $.tmpl("hangouts.row", hangouts[i]);

			/*
				* if it exists, Replace it
			*/
			if(exists)
			{
				$('#' + hangouts[i].htmlid, hangoutDOM).replaceWith(html);
				return;
			}

			hangoutDOM.prepend(html).slideDown();
		}
	}
})();
