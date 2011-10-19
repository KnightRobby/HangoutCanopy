/*
	* templates for Popup
*/

var templates = {
	twitter		: '',
	hangouts	: {},
};

/*
	* Dynamic Hangout Row
*/

templates.hangouts.row = '<article id="${htmlid}" class="hangout" data-public="{{if public}}true{{else}}false{{/if}}">';
	/*
		* Main image
	*/
	templates.hangouts.row += '<div class="main_image rounded_image">';
		templates.hangouts.row += '<a title="${clients[0].name}" href="https://plus.google.com/${clients[0].id}" ><img alt="" width="48" height="48" src="${clients[0].photo}?sz=48" /></a>';
	templates.hangouts.row += '</div>';

	/*
		* Right content area
	*/
	templates.hangouts.row += '<div class="info">';
	
		/*
			* Client Images
		*/
		templates.hangouts.row += '<div class="clients">';
			/*
				* Text Logic
			*/
			templates.hangouts.row += '<p>';
				/*{{if extra}}<br />Title: <font style="font-weight:bold;">${title}</strong>{{/if}}*/
				templates.hangouts.row += '{{if extra}}<strong>${title}</strong>{{else}}';
						templates.hangouts.row += '<strong>${clients[0].name}</strong> is hanging out with ';
					templates.hangouts.row += '{{if clients.length == 1}} no one {{else}}${clients.length - 1} people{{/if}}';
				templates.hangouts.row += '{{/if}}';				
			templates.hangouts.row += '</p>';
			templates.hangouts.row +='<br class="clear" />';
		
			templates.hangouts.row += '{{each(i,v) clients}}';
				templates.hangouts.row +='{{if i!=0 }}';
				templates.hangouts.row += '<a title="${v.name}" href="https://plus.google.com/${v.id}"><img width="32" height="32" src="${v.photo}?sz=32" /></a>';
				templates.hangouts.row +='{{/if}}';
			templates.hangouts.row += '{{/each}}';
			templates.hangouts.row += '<a href="#" class="arrow"></a>';
		templates.hangouts.row += '</div>';
		templates.hangouts.row += '<div class="top_nav">';
				templates.hangouts.row += '<span class="public"><a href="${post_url}">{{if public}}Public{{else}}Limited{{/if}}</a></span>';
		templates.hangouts.row += '</div>';
	templates.hangouts.row += '</div>';
templates.hangouts.row += '</article>';


/*
	* Single Hangout Preview
*/
templates.hangouts.single = '<div class="slideout_panel">';
	templates.hangouts.single +='<div class="panel_header">';
		templates.hangouts.single += '<a title="Close This Slidepanel"  href="#" class="close">Close</a>';
		templates.hangouts.single += '<a title="Link to the post" href="${post_url}" class="post">Post</a>';
		templates.hangouts.single += '<a title="Join This Hangout" href="${url}" class="join button">Join</a>';
	templates.hangouts.single +='</div>';
	templates.hangouts.single += '<div class="panel_users">';
		templates.hangouts.single += '<ul>';
			templates.hangouts.single += '{{each(i,v) clients}}';
				templates.hangouts.single += '<li>';
					templates.hangouts.single += '<a href="https://plus.google.com/${v.id}"><img src="${v.photo}?sz=32" width="32" height="32" /></a>';
					templates.hangouts.single += '<span><a href="https://plus.google.com/${v.id}" title="${v.name}">${v.name}</span>';
					templates.hangouts.single += '<a href="https://plus.google.com/${v.id}" title="Profile" class="join profile button">Profile</a>';
					templates.hangouts.single += '<br class="clear" />';
				templates.hangouts.single += '</li>';
			templates.hangouts.single += '{{/each}}';
		templates.hangouts.single += '</ul>';
templates.hangouts.single += '</div>';

/*
	* Twitter Feed
*/
templates.twitter ='<div class="section_header twitter_header">';
templates.twitter += '<a class="follow" href="http://www.twitter.com/HangoutCanopy"><img src="http://twitter-badges.s3.amazonaws.com/follow_us-a.png" alt="Follow HangoutCanopy on Twitter"/></a>';
templates.twitter += '</div>';
templates.twitter += '<div class="twitter_feed section_content">';
	templates.twitter += '<ul class="tweets">';
		templates.twitter += '{{each(index, tweet) tweets}}';
			templates.twitter += '<li id="tweet_${tweet.id}">';
				templates.twitter +='<img src="${tweet.user.profile_image_url}" />';
				templates.twitter +='<p>${tweet.text}</p>';
				templates.twitter +='<span><a href="http://twitter.com/#!/Hangoutcanopy/status/${tweet.id_str}">View Tweet<a/></span>';
				templates.twitter +='<br class="clear" />';
			templates.twitter += '</li>';
		templates.twitter += '{{/each}}';
	templates.twitter += '<ul>';
templates.twitter += '</div>';



/*
  * Watching Feed   
*/
templates.watching = '<li id="watching-${id}">';
	templates.watching += '<a href="https://plus.google.com/${id}" class="watch_thumbs"><img src="${image.url}?sz=32" alt=""></a>';
	templates.watching += '<a href="https://plus.google.com/${id}" class="watch_name">${displayName}</a>';
	templates.watching += '<a href="#" class="watch_remove_btn join button">Remove</a>';
	templates.watching += '<br class="clear">';
templates.watching += '</li>';
