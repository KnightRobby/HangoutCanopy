/*
	* templates for Popup
*/

var templates = {
	hangouts : {}
};

/*
	* Dynamic Hangout Row
*/

templates.hangouts.row = '<article id="${htmlid}" class="hangout" data-public="{{if public}}true{{else}}false{{/if}}">';
	/*
		* Main image
	*/
	templates.hangouts.row += '<div class="main_image rounded_image">';
		templates.hangouts.row += '<a href="#" ><img alt="${clients[0].name}" title="${clients[0].name}" width="48" height="48" src="${clients[0].photo}?sz=48" /></a>';
	templates.hangouts.row += '</div>';

	/*
		* Right content area
	*/
	templates.hangouts.row += '<div class="info">';
	
		/*
			* Client Images
		*/
		templates.hangouts.row += '<div class="clients">';
			templates.hangouts.row +='<p>is hanging out with</p>';
			templates.hangouts.row +='<br class="clear" />';
		
			templates.hangouts.row += '{{each(i,v) clients}}';
				templates.hangouts.row +='{{if i!=0 }}';
				templates.hangouts.row += '<a href="#"><img width="32" height="32" src="${v.photo}sz=32" /></a>';
				templates.hangouts.row +='{{/if}}';
			templates.hangouts.row += '{{/each}}';

		templates.hangouts.row += '</div>';
		templates.hangouts.row += '<div class="top_nav">';
				templates.hangouts.row += '<span class="public"><a href="${post_url}">{{if public}}Public{{else}}Limited{{/if}}</a></span>';
		templates.hangouts.row += '</div>';
	
	templates.hangouts.row += '</div>';
templates.hangouts.row += '</article>';
