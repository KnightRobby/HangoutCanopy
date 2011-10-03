(function(){
	var HangoutCanopyWatch = function()
	{

		/*
			* Get the Content Pane
		*/
		try
		{
			var button = document.getElementById('contentPane').childNodes[0].childNodes[0].childNodes[0].childNodes[0];
		}
		catch(E)
		{
			return;
		}

		/*
			* Assure the element we have is a button
		*/
		if(button.getAttribute('role') == 'button')
		{
		}
	}

	new HangoutCanopyWatch();
})()
