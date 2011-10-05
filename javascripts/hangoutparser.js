(function(){
	var HangoutParser = window.HangoutParser = function()
	{
	}

	HangoutParser.prototype.parseSingleHangout = function(response)
	{
		var OZ_pos = response.indexOf('OZ_initData =');
		var OZ_pos_end = response.indexOf(';window.jstiming.load.tick(\'idp\');');

		if(OZ_pos == -1 || OZ_pos_end == -1)
		{
			return false;
		}

		try
		{
			eval('var initData = ' + response.slice(OZ_pos + 14, OZ_pos_end) + ';');

			var post = initData[20];//20 = single post

			if(!post)
			{
				return false;
			}

			if(!this.isHangoutPost(post))
			{
				return false;
			}

			if(this.isHangoutClosed(post))
			{
				return {type:'closed',id: post[82][2][1][0][0]};
			}
			else
			{
				var data = {
					id 	: post[82][2][1][0][0],
					type	: 'open',
					url	: post[82][2][1][0][1],
					clients	: this.normalizeClients(post[82][2][1][0][3]),
					public	: post[32] == "1" ? true : false,
					post_url: 'https://plus.google.com/' + post[21]
				}

				data.clients.push(this.collectOwnerInfo(post))
				
				return data;
			}
		}
		catch(e)
		{
			return false;
		}
	}

	HangoutParser.prototype.parseHangouts = function(response)
	{
		var OZ_pos = response.indexOf('OZ_initData =');
		var OZ_pos_end = response.indexOf(';window.jstiming.load.tick(\'idp\');');

		if(OZ_pos == -1 || OZ_pos_end == -1)
		{
			return [];
		}

		/*
			* Slcie the content's
		*/

		try
		{
			eval('var initData = ' + response.slice(OZ_pos + 14, OZ_pos_end) + ';');
			var postsets = initData[4][0];

			if(!postsets)
			{
				return [];
			}

			var hangouts = [];

			for(var p = 0; p < postsets.length; p++)
			{
				var post = postsets[p];

				if(!this.isHangoutPost(post))
				{
					continue;
				}

				if(this.isHangoutClosed(post))
				{
					hangouts.push({
						type:	'closed',
						id:	post[82][2][1][0][0]
					});
				}
				else
				{
					var data = {
						id 	: post[82][2][1][0][0],
						type	: 'open',
						url	: post[82][2][1][0][1],
						clients	: this.normalizeClients(post[82][2][1][0][3]),
						public	: post[32] == "1" ? true : false,
						post_url: 'https://plus.google.com/' + post[21]
					}

					data.clients.push(this.collectOwnerInfo(post));
					hangouts.push(data);
				}
			}

			return hangouts;
		}
		catch(e)
		{
			return [];
		}
	}

	HangoutParser.prototype.isHangoutClosed = function(post)
	{
		//When the hangout url is empty, the hangout is no more
		return post[82][2][1][0][1] == "" ? true : false;
	}
	
	HangoutParser.prototype.isHangoutPost = function(post)
	{
		return post[2].toLowerCase() == 'hangout';
	}

	HangoutParser.prototype.collectOwnerInfo = function(post)
	{
		return {
				name : post[3],
				photo : post[18].indexOf('http') != -1 ? post[18] : 'https:' + post[18], //Some images don't have http(s)
				id : post[16]
		}
	}


	HangoutParser.prototype.normalizeClients = function(clients)
	{
		var c = [];

		for(var i = 0; i < clients.length; i++)
		{
			c.push({
				name : clients[i][0],
				photo : clients[i][1],
				id : clients[i][2]
			});
		}

		return c;
	}
})()
