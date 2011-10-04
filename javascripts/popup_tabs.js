// When the document loads do everything inside here ...
$(document).ready(function(){
	// When a link is clicked
	$("#menu li a").click(function(){
		// switch all tabs off
		$("#menu li").removeClass("selected");
	
		// switch this tab on
		$(this).parent().addClass("selected");
	
		// slide all content up
		$(".tab_area").slideUp();
	
		// slide this content up
		var content_show = $(this).parent().attr("id");
		$('#tab_' + content_show).slideDown();
	});
});
