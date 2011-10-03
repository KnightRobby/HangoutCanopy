/*
	* templates for Popup
*/

var templates = {
	hangouts : {}
};

/*
	* Dynamic Hangout Row
*/

templates.hangouts.row = '<article id="${htmlid}">';
	templates.hangouts.row += '<div class="top_nav">';
		templates.hangouts.row += '<span>{{if public}}Pulic{{else}}Limited{{/if}}</span>';
	templates.hangouts.row += '</div>';
templates.hangouts.row += '</article>';
