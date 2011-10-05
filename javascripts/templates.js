/*
	* templates for Popup
*/

var templates = {
	hangouts : {
	}
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
templates.hangouts.single = '<div class="single_preview">';
	templates.hangouts.single +='<a href="#" class="close">Close</a><a href="#" class="button">Join This Hangout</a>';
templates.hangouts.single += '</div>';
