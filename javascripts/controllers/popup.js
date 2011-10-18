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
		this.initializeWatching();
		this.initializeTweets();
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
		$.template("hangouts.row"		, templates.hangouts.row);
		$.template("hangouts.single"	, templates.hangouts.single);
		$.template("twitter"			, templates.twitter);
		$.template('watching'			, templates.watching);
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
			
			if(!hangouts[i].htmlid)
			{
				//We don't want weird chars
				console.log(hangouts[i]);
				return;
			}

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

			hangoutDOM.prepend(html);

			/*
				* Cleanup, Stops the data added being referenced
			*/
			delete hangouts[i].htmlid;
		}
	}
	
	PopupController.prototype.initializeWatching = function()
	{
		/*
		 * Fetch current watch list from background
		 * - Print to the DOM layer
		 *  - Show loader for some elements as they may not be cached
		 * - Bind hnadler for the submission form
		 *  - Parse for the id and fetch profile link, slide it into the lsit in the DOM
		 * */
		 /*
		  * Get the hangout watcher for the hangout manager
		  * */
		var watching = this.background.manager.watching;
		
		for(var id in watching.getWatched())
		{
			this.background.profiles.get(id, function(e, data){
				if(e) return;
				
				 var html = $.tmpl("watching", data);
				 
				 $('#watch_list').prepend(html);
				 
				 html.slideDown();
			});
		}
		
		/*
		 * Bind click event to the DOM for new watches
		 * */
		$('#watch_form').submit((function(){
			/*
			 * Validate the URL from the input
			 * */
			var url = $('#watch_url_input').val();
			if(url && url.indexOf('plus.google.com') == -1)
			{
				//Show Error
				return false;
			}
			
			/*
			 * Split the url up
			 * */
			var segments = url.split('/');
			 
			/*
			 * Validate segment 3 is there and it's numeric
			 * */

			if(!(segments[3] && !isNaN(parseFloat(segments[3])) && isFinite(segments[3])))
			{
				//Show Error
				return false;
			}
			
			/*
			 * Ok let's try and get the profile information
			 * */
			this.background.profiles.get(segments[3], function(err, data){
				if(err)
				{
					//Show error
					return false;
				}
				
				/*
				 * Add the ID to the Watching System
				 * */
				 watching.watchClient(data.id);
				 
				 //Slide it in
				 var html = $.tmpl("watching", data);
				 
				 $('#watch_list').prepend(html);
				 
				 html.slideDown();
			});
			
			return false;
		}).bind(this));
	}

	PopupController.prototype.initializeTweets = function()
	{
		/*
			* Get the latest tweets
		*/
		var tweets = this.background.twitter.getTweets();

		/*
			* Generate the template area
		*/
		var html = $.tmpl("twitter", {tweets: tweets});

		/*
			* Add it to the DOM
		*/
		$('#tab_twitter').html(html);
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
