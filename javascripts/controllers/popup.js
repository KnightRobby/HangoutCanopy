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
		this.initializeStreams();
		this.initializeWatching();
		this.initializeTweets();
		this.initializeClickMonitoring();
		this.initializeLucky();
	}

	PopupController.prototype.initializeClickMonitoring = function()
	{
		$("a[href^='http://'],a[href^='https://']").live('click', function(){
			/*
			 * Track the event
			 * */
			window._gaq.push(['_trackEvent',  "click", 'external_click', $(this).attr('href')]);
			
			/*
			 * Open a new window
			 * */
			chrome.tabs.create({url : $(this).attr('href')});
			
		});

		$('#hangouts .arrow').live('click', this.displayHangout.bind(this));
		$('#hangouts .refresh').live('click', this.updateHangout.bind(this));
	}

	PopupController.prototype.compileTemplates = function()
	{
		$.template("hangouts.row"		, templates.hangouts.row);
		$.template("hangouts.single"	, templates.hangouts.single);

		$.template("streams.row"		, templates.streams.row);

		$.template("twitter"			, templates.twitter);
		$.template('watching'			, templates.watching);
	}

	PopupController.prototype.initializeStreams = function()
	{
		setTimeout(this.initializeStreams.bind(this),5000);

		/*
			* Get streams set from background Controller
		*/
		var streams = this.background.manager.getStreams();

		/*
			* Get DOM Area for streams
		*/
		var streamDOM = $('#streams');

		//Remove after before main release
		$('.ads').css("height","188px");
		return;


		if(streams.length == 0)
		{
			$('#live').hide();
			$('.ads').css("height","188px");
			return;
		}

		/*
		 * Loop the streams and inject to the DOM
		 * */
		for(var i = 0; i < streams.length; i++)
		{
			streams[i].htmlid = streams[i].id.replace(/[^a-zA-Z0-9]+/g,''); //Should be base64

			var exists = $('#' + streams[i].htmlid, streamDOM).length > 0;
			console.log(exists, streams[i].htmlid);
			try
			{
				/*
					* Genreate the html
				*/
				var html = $.tmpl("streams.row", streams[i]);
			}
			catch(e)
			{
				continue;
			}

			/*
				* Set the hangout ID to the meta data
			*/
			html.data('stream_id', streams[i].id);

			/*
				* if it exists, Replace it
			*/
			if(exists)
			{
				$('#' + streams[i].htmlid, streamDOM).replaceWith(html);
				continue;
			}

			streamDOM.prepend(html);

			/*
				* Cleanup, Stops the data added being referenced
			*/
			delete streams[i].htmlid;
		}
	}

	PopupController.prototype.initializeHangouts = function()
	{
		setTimeout(this.initializeHangouts.bind(this),2000);
		
		/*
			* Get hangout set from background Controller
		*/
		var hangouts = this.background.manager.getHangouts();

		/*
			* Get DOM Area for hangouts
		*/
		var hangoutDOM = $('#hangouts');

		/*
		 * Loop the hangouts and inject to the DOM
		 * */
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
				continue;
			}

			/*
				* check to see if the old one exists
			*/
			var exists = $('#' + hangouts[i].htmlid, hangoutDOM).length > 0;

			try
			{
				/*
					* Genreate the html
				*/
				var html = $.tmpl("hangouts.row", hangouts[i]);
			}catch(e)
			{
				delete html;
				continue;
			}

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
				continue;
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

				data.image.url = data.image.url.replace('?sz=50', '');

				var html = $.tmpl("watching", data);
				 
				$('#watch_list').prepend(html);
				
				html.slideDown();
			});
		}
		
		//Bind the remove handler
		$('.watch_remove_btn').live('click', function(){
			/*
			 * Get id of container
			 * */
			var id = $(this).parent().attr('id').split('-')[1];
			watching.unwatchClient(id);
			
			/*
			 * Remove the container
			 * */
			$(this).parent().remove();
			
			/*
			 * Track unwatched
			 * */
			window._gaq.push(['_trackEvent',  "watching", 'unwatch', id]);
			
			return false;
		});

		$('#watch_form').submit((function(){
			var url	= $('#watch_url_input').val();

			/*
			 * Split the url up
			 * */
			var segments = url.split('/');
			 
			/*
			 * Validate segment 3 is there and it's numeric or segment 5
			 * */
			if(segments[3] == 'u')
			{
				segments[3] = segments[5];
			}
			
			if(!(segments[3] && !isNaN(parseFloat(segments[3])) && isFinite(segments[3])))
			{
				//Show Error
				return false;
			}
			
			/*
			 * Check to see if it's already being watched
			 * */
			if(watching.isWatched(segments[3]))
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
				data.image.url = data.image.url.replace("?sz=50","");
				
				/*
				 * Add the ID to the Watching System
				 * */
				watching.watchClient(data.id);
				 
				//Slide it in
				var html = $.tmpl("watching", data);				 
				$('#watch_list').prepend(html);
				html.slideDown();
				
				window._gaq.push(['_trackEvent',  "watching", 'watch', data.id]);
			});
			
			return false;

		}).bind(this))
	}
	
	
	PopupController.prototype.initializeLucky = function()
	{
	
	//Bind the Lucky Button
		$('#lucky').live('click',(function(){
		
			/*
			 * Get Random Lucky Hangout
			 * */
			var hangouts = this.background.manager.getHangouts();
			if( hangouts.length > 0) 
			{
				var random_number = Math.floor(Math.random() * hangouts.length );
			
				/*
				 *  Add the link of the random hangout
				 * */
				chrome.tabs.create({url :  hangouts[random_number].url  });

				/*
				 * Track the hangout
				*/
				window._gaq.push(['_trackEvent',  "click", 'lucky', hangouts[random_number].url]);
			}
			
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

		$('.close',area).click(function(){
			area.animate({left: '+=400'}, 800, function(){
				$('#slideout_panel_hangout').remove();
			});

			return false;
		});
	}
})();
