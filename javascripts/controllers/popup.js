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
		this.initializeClickMonitoring();
	}

	PopupController.prototype.initializeClickMonitoring = function()
	{
		$("a[href^='http://'],a[href^='https://']").live('click', function(){
			chrome.tabs.create({
				url : $(this).attr('href')
			});
		});

		$('#hangouts .arrow').live('click', this.displayHangout.bind(this));
		$('#hangouts .refresh').live('click', this.updateHangout.bind(this));
	}

	PopupController.prototype.compileTemplates = function()
	{
		$.template("hangouts.row", 	templates.hangouts.row);
		$.template("hangouts.single",	templates.hangouts.single);
	}

	PopupController.prototype.initializeHangouts = function()
	{
		setTimeout(this.initializeHangouts.bind(this),1000);
		
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
				* Set the hangout ID to the meta data
			*/
			html.data('hangout_id', hangouts[i].id);

			/*
				* if it exists, Replace it
			*/
			if(exists)
			{
				$('#' + hangouts[i].htmlid, hangoutDOM).replaceWith(html);
				return;
			}

			hangoutDOM.prepend(html).slideDown();

			/*
				* Cleanup, Stops the data added being referenced
			*/
			delete hangouts[i].htmlid;
		}
	}

	PopupController.prototype.updateHangout = function()
	{
		/*
			* Used for the resync hangout button.
		*/
	}

	PopupController.prototype.displayHangout = function(evt)
	{
		$('.slideout_panel').remove();
		var hangoutID = $(evt.srcElement).closest('.hangout').data('hangout_id');

		/*
			* Get hangout from the manager
		*/
		if(!this.background.manager.hangoutExists(hangoutID))
		{
			return false;
		}


		var hangout = this.background.manager.getHangout(hangoutID);

		/*
			* Generate HTML From template
		*/
		var html = $.tmpl("hangouts.single", hangout);

		/*
			* Create the DIV
		*/
		var area = html.attr('id','slideout_panel_hangout').appendTo('body').animate({left: '-=400'},1000,function(){});

		/*
			* Bind required clicks to the generated html.
		*/

		$('.close',area).click(function(){area.animate({left: '+=400'}, 800, function(){
				$('#slideout_panel_hangout').remove();
			});
			return false;
		});
	}
})();
