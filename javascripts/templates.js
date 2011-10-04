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
		templates.hangouts.row += '<img alt="${clients[0].name}" title="${clients[0].name}" width="48" height="48" src="${clients[0].photo}?sz=48" />';
	templates.hangouts.row += '</div>';

	/*
		* Right content area
	*/
	templates.hangouts.row += '<div class="info">';
		templates.hangouts.row += '<div class="top_nav">';
			templates.hangouts.row += '<span class="public"><a href="${post_url}">{{if public}}Pulic{{else}}Limited{{/if}}</a></span>';
		templates.hangouts.row += '</div>';
		/*
			* Client Images
		*/
		templates.hangouts.row += '<div class="cleints">';

			templates.hangouts.row += '{{each(i,v) clients}}';
				templates.hangouts.row += '<img width="32" height="32" src="${v.photo}sz=32" />';
			templates.hangouts.row += '{{/each}}';

		templates.hangouts.row += '</div>';

	templates.hangouts.row += '</div>';
templates.hangouts.row += '</article>';
