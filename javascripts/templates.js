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
	templates.hangouts.row += '<div class="top_nav">';
		templates.hangouts.row += '<span>{{if public}}Pulic{{else}}Limited{{/if}}</span>';
	templates.hangouts.row += '</div>';
	templates.hangouts.row += '<div class="main_image rounded_image">';
		templates.hangouts.row += '<img width="48" height="48" src="${clients[0].photo}?sz=48" />';
	templates.hangouts.row += '</div>';
	templates.hangouts.row += '<div class="info">';
		templates.hangouts.row += '<p>Some text here that will be in each row</p>';
	templates.hangouts.row += '</div>';
templates.hangouts.row += '</article>';
