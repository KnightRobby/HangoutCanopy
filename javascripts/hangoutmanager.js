(function(){
    /*
     * Manages hangouts, internal and external, monitoring and the detection
     */
    var HangoutManager = window.HangoutManager = function()
    {
        /*
         * Required libraries required to function
         */
        this.ajax       = new window.Ajax();
        this.parser     = new window.HangoutParser();
        this.storage	= new window.Storage();
        this.logger     = new window.Logger();
        this.watching   = new window.WatchingManager();
        
        /*
         * Setup local variables
         */
        this.hangouts = new Array();
        this.active = false;
        
        /*
         * Settings for the object
         */
        this.detectionTimeout    = this.storage.get('detection_timeout', 5000);
        this.monitorTimeout      = this.storage.get('monitor_timeout', 10000);
    }

    /*
     * Returns the hangouts Array object
     */
    HangoutManager.prototype.getHangouts = function()
    {
        return this.hangouts;
    }
    
    /*
     * Start the hangout detection and monitoring
     */
    HangoutManager.prototype.start = function()
    {
        if(this.active) return; //Prevent double call
            
        this.logger.notice("Activating Detection and Monitoring loops");
        
        this.monitor();
        this.detection();
    }
        
    /*
     * Monitors the interal hangouts, so public / not public
     */
    HangoutManager.prototype.monitor = function()
    {
        var hangout;
        
        if(false !== ( hangout = this.getOldestHangout() ))
        {
            this.logger.notice('Discovered Hangout for update: ' + hangout.id);
            
            this.ajax.get(hangout.post_url, (function(Request){
                
                /*
                 * First check to do is to make srue it's a 200 response
                 */
                if(Request.status != 200)
                {
                    /*
                     * Were unable to monitor if it does not exists
                     */
                    this.logger.warn("Google plus replied with error", Request);
                    this.removeInternalHangout(hangout.id);
                    return;
                }
                
                /*
                 * Parse the hangout page to get the meta data.
                 */
                var newHangout;
                if((newHangout = this.parser.parseSingleHangout(Request.responseText)))
                {
                    /*
                     * if the hangout is closed, remove it from the stack
                     */
                    if(newHangout.type == 'closed')
                    {
                        this.removeInternalHangout(newHangout);
                    }
                    
                    /*
                     * if the hangout is open, send it to the addInternalHangout method
                     */
                    if(newHangout.type == 'open')
                    {
                        this.addInternalHangout(newHangout);
                    }
                };
                
            }).bind(this))
        }
        
        //loop this call every X seconds
        setTimeout(this.monitor.bind(this), this.monitorTimeout);
    }

    /*
     * Detects hangouts from the main stream
     */
    HangoutManager.prototype.detection = function()
    {
        this.ajax.get('https://plus.google.com/', (function(Request){
            /*
             * validate we get a 200 OK from Google.
             */
            if(Request.status != 200)
            {
                this.logger.warn("Unable to request plus.google.com, got: ", Request);
                return;
            }
            
            /*
             * Parse the hangouts into an iteratable list
             */
            var hangouts;
            if((hangouts = this.parser.parseHangouts(Request.responseText)))
            {
                /*
                 * Loop the hangouts Array and check them individually 
                 */
                for(var i = 0; i < hangouts.length; i++)
                {
                    /*
                     * if the hangout is open, send it to the addInternalHangout method
                     */
                    if(hangouts[i].type == 'open')
                    {
                        this.addInternalHangout(hangouts[i]);
                    }
                    
                    /*
                     * if the hangout is closed, remove it from the stack
                     */
                    if(hangouts[i].type == 'closed')
                    {
                        this.removeInternalHangout(hangouts[i]);
                    }
                }
            };
            
        }).bind(this));
        
        //Loop this call every X seconds
        setTimeout(this.detection.bind(this), this.detectionTimeout);
    }

    /*
     * Removes an External Hangout from the stack, should only be triggered
     * By the socket.io event
     */
    HangoutManager.prototype.removeExternalHangout = function(id)
    {
        var pointer = this.getHangoutPointer(id);
        
        /*
         * If the hangout exists then splcie it away
         */
        if(pointer != -1)
        {
            this.hangouts.splice(pointer, 1);
        }
    }

    /*
     * Adds/Updates an External Hangout from the stack, should only be triggered
     * By the socket.io event
     */
    HangoutManager.prototype.addExternalHangout = function(hangout)
    {
        /*
         * Mark the hangout.internal as false, prevent client from updating it
         */
        hangout.internal = false;
        
        /*
         * Check to see if the hangout already exists
         */
        if(true == (this.hangoutExists(hangout.id)))
        {
            /*
             * Get the pointer so we can see if it's internal / external
             */
            var pointer = this.getHangoutPointer(hangout.id);
            
            /*
             * Mark this hangout internal accordingly
             */
            hangout.internal = this.hangouts[ pointer ].internal == true;
            
            /*
             * Slice the old hangout out of the stack
             */
            this.hangouts.splice(pointer, 1);
        }
        
        /*
         * Add the hangout to the top of the stack
         */
        this.hangouts.unshift(hangout);
    }

    /*
     * Removes an Internal Hangout from the stack.
     *
     * @Param id (hangout id)
     */
    HangoutManager.prototype.removeInternalHangout = function(id)
    {
        if(!id)
        {
            throw "removeInternalHangout: No id passed or invalid";
        }
        
        /*
         * Loop the hangouts to find what index contains the id
         */
        for(var i = 0; i < this.hangouts.length; i++)
        {
            if(this.hangouts[i].id == id)
            {
                /*
                 * use splice to remove cleanly
                 */
                this.hangouts.splice(i, 1);
                return;
            }
        }
    }
        
    /*
     * Removes an Internal Hangout from the stack.
     * 
     * @Param hangout (HangoutObject)
     */
    HangoutManager.prototype.addInternalHangout = function(hangout)
    {
        /*
         * Add teh key that states the hangout is internal
         */
        hangout.internal = true;
        
        /*
         * let the WatchingManager know about this hangout
         */
        this.watching.onHangout(hangout);
        
        /*
         * Check to see if the hangout already exists
         * If so, Ping it out to the server, and insert into our stack
         */
        if(this.hangoutExists(hangout.id) == false)
        {
            /*
             * Assure it's public before we transmit the data
             */
            if(hangout.public == true && this.hangoutHasChanged(hangout))
            {
                getController().sendHangout(hangout);
            }
            
            /*
             * Add it to our internal stack
             * Use unshift to push the hangoutto the top of the stack
             */
            this.hangouts.unshift(hangout)
            return;
        }
        
        /*
         * Get the pointer for the hangout within the stack
         */
        var pointer = this.getHangoutPointer(hangout.id);
        
        /*
         * Remove the Hangout from the stack
         */
        this.hangouts.splice(pointer, 1);
        
        /*
         * Insert the hangout into the top of the stack
         */
        this.hangouts.unshift(hangout);
    }
        
    /*
     * Returns the index of the hangout in the hangout stack
     *
     * @Param id (hangout id)
     */
    HangoutManager.prototype.getHangoutPointer = function(id)
    {
        for(var i = 0; i < this.hangouts.length; i++)
        {
            if(this.hangouts[i].id == id)
            {
                return i;
            }
        }
        
        return -1;
    }

    /*
     * Check to see if a hangout exists
     *
     * @Param id (hangout id)
     */
    HangoutManager.prototype.hangoutExists = function(id)
    {
        for(var i = 0; i < this.hangouts.length; i++)
        {
            if(this.hangouts[i].id == id)
            {
                return true;
            }
        }
        
        return false;
    }

    /*
     * Returns an HangoutObject from the stack
     *
     * @Param id (hangout id)
     */
    HangoutManager.prototype.getHangout = function(id)
    {
        if(this.hangoutExists(id))
        {
            var pointer = this.getHangoutPointer(id);
            return this.hangouts[pointer];
        }
        
        return null;
    }

    /*
     * Check to see ifthere is a difference in the cleints of a hangout
     * Returns Booleon
     */
    HangoutManager.prototype.hangoutHasChange = function(hangout)
    {
        var pointer = this.getHangoutPointer(hangout.id);
        
        if(this.hangouts[pointer])
        {
            /*
             * Validate that the clients lengths are the same, saves processing power
             */
            if(this.hangouts[pointer].clients.length != hangout.client.length)
            {
                return true;
            }
            
            /*
             * Create an object map to store client id's from the new hangout
             */
            var objectMap = {};
            
            /*
             * loop the hangout clients to get the id's in the ObjectMap
             */
            for(var i = 0; i < hangout.clients.length; i++)
            {
                objectMap[ hangout.clients[i].id ] = true;
            }
            
            /*
             * Now we map the old hangout, and see if the old clients exists or not
             */
            for(var x = 0; x < this.hangouts[pointer].clients.length; x++)
            {
                if(false == (this.hangouts[pointer].clients[x].id in objectMap))
                {
                    return true;
                };
            }
        }
                
        return true;// true by default
    }
        
    /*
     * Returns the hangout that has not been check for a while
     * This restructures the the hangout stack in order to keep track of the hangouts
     * Returns Mixed
     */
    HangoutManager.prototype.getOldestHangout = function()
    {
        /*
         * Get the indexes of the hangouts and reverse them
         * We reverse them to look for hangouts from the end to the top of the stack
         */
        var keys = Object.keys(this.hangouts).reverse();
        
        /*
         * Loop the keys and look for the first hangout that is internal
         */
        for(var i = 0; i < keys.length; i++)
        {
            if(this.hangouts[ keys[i] ].internal)
            {
                return this.hangouts[ keys[i] ];
            }
        }
        
        /*
         * Return False by default
         */
        return false;
    }
})();
