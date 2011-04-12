/*
 *
 * ImageCatcher
 *
 * Catch image from clipboard and/or drag and drop over the window
 *
 * @author David Mongeau-Petitpas <dmp@commun.ca>
 * @package ImageCatcher
 * @version 0.1
 *
 */
jQuery.ImageCatcher = {};

/*
 * Validate ur;
 */
jQuery.ImageCatcher.isURL = function(url) {
	return (url.search(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/) != -1) ||
			(url.search(/data\:image/) != -1);
};

/*
 * Read file from dataTransfer object
 */
jQuery.ImageCatcher.readFile = function(file,callback) {

	callback = typeof(callback) == 'function' ? callback:function(){};
	var reader = new FileReader();
	reader.onload = function(e) {
		callback(e.target.result);
	};
	reader.readAsDataURL(file);
};


/*---------------------------------------------------------------------------*/


/*
 *
 * DropBox
 *
 * Catch image from clipboard and/or drag and drop over the window
 *
 * @author David Mongeau-Petitpas <dmp@commun.ca>
 * @package ImageCatcher
 * @version 0.1
 *
 */
jQuery.ImageCatcher.DropBox = function(el,opts) {
	
	var self = this;
	
	this.settings = jQuery.extend({
		'onDrop' : function() {},
		'onDragEnter' : function() {},
		'onDragOver' : function() {},
		'onDragOut' : function() {}
	},(opts || {}));
	
	this.$el = $(el);
	this.isBody = this.$el.get(0) == document.body ? true:false;
	
	jQuery(function() {
		
		self._createDropBox.call(self,function(files,self) {
			self.settings.onDrop.call(this,files,self);
		});
		
		if(self._isBody) {
			self.$el.mouseout(self._showDrop);
			self.$el.mouseover(self._hideDrop);
			$(window).blur(self._showDrop);
			$(window).focus(self._hideDrop);
		}
		
	});
	
	
};

/*
 *
 * Properties
 *
 */
jQuery.ImageCatcher.DropBox.prototype._el = null;
jQuery.ImageCatcher.DropBox.prototype._$el = null;
jQuery.ImageCatcher.DropBox.prototype._isBody = null;
jQuery.ImageCatcher.DropBox.prototype._$drop = null;


/*
 *
 * Method to create the drop box where image files should be dropped
 *
 */
jQuery.ImageCatcher.DropBox.prototype._createDropBox = function(callback) {
	
	callback = typeof(callback) == 'function' ? callback:function(){};
	
	var self = this;
	
	if(self._isBody) {
		var $drop = $('<div id="imagecatcher_dropbox"></div>').css({
						'width' : self.$el.css('width'),
						'height' : self.$el.css('height')
					});
		this.$el.append($drop);
	} else {
		var $drop = this.$el;
	}
	this.$drop = $drop;
	
	/*
	 *
	 * Handle drag & drop events
	 *
	 */
	$drop.bind("dragenter", function(e){
		
		e.returnValue = false;
		e.stopPropagation();
		e.preventDefault();
		
		self.settings.onDragEnter.call($drop,e,self);
		
	});
	$drop.bind("dragover", function(e){
		
		e.returnValue = false;
		e.stopPropagation();
		e.preventDefault();
		
		self.settings.onDragOver.call($drop,e,self);
		
	});
	
	$drop.bind("dragleave", function(e) {
		
		e.returnValue = false;
		e.stopPropagation();
		e.preventDefault();
		
		self.settings.onDragOut.call($drop,e,self);
		
	});
	
	$drop.bind("drop", function(e){
		
		e.stopPropagation();
		e.preventDefault();
		
		var ev = e.originalEvent;
		var dt = (ev.dataTransfer || null);
		if(dt) {
			ev.dataTransfer.dropEffect = 'move';
		}
		
		//If files are dropped
		if(dt && dt.files && dt.files.length && FileReader) {
			
			callback.call($(this), dt.files, self);
		
		//If draggable item
		} else if(url = dt.getData('Text')) {
			
			if(jQuery.ImageCatcher.isURL(url)) {
				callback.call($(this), url, self);
			}
			
		} else {
			
			document.title = ('dropOther');
			
		}
		
		if(self._isBody) {
			$drop.remove();
			self._createDropBox.call(self,callback);
		}
		
	});
	
	$drop.bind("mouseover", function(e){
		
		if(jQuery.ImageCatcher.Draggable.isDragging) {
			self.settings.onDragOver.call($drop,e,self);
			jQuery.ImageCatcher.Draggable._dropCallback = function(e,$target) {
				callback.call($drop, $target, self);
			}
		}
		
	});
	
	$drop.bind("mouseout", function(e){
		
		self.settings.onDragOut.call($drop,e,self);
		
		if(jQuery.ImageCatcher.Draggable._dropCallback) {
			jQuery.ImageCatcher.Draggable._dropCallback = null;
		}
		
	}, false);
	
};

jQuery.ImageCatcher.DropBox.prototype._showDropBox = function() {
		
	if(this.$drop) {
		this.$drop.show();
	}
};

jQuery.ImageCatcher.DropBox.prototype._hideDropBox = function() {
	if(this.$drop) {
		this.$drop.hide();
	}
};

/*---------------------------------------------------------------------------*/


/*
 *
 * Draggable
 *
 * Make image or object draggable
 *
 * @author David Mongeau-Petitpas <dmp@commun.ca>
 * @package ImageCatcher
 * @version 0.1
 *
 */
jQuery.ImageCatcher.Draggable = function(el,opts) {
	
	var self = this;
	
	this.settings = jQuery.extend({
		'onDragStart' : function() {},
		'onDragOver' : function() {},
		'onDragOut' : function() {}
	},(opts || {}));
	
	this.$el = $(el);
	
	this.$el.bind('dragstart',function(e){
		
		e.returnValue = false;
		e.stopPropagation();
		e.preventDefault();
		
		var dt = e.originalEvent.dataTransfer;
		dt.effectAllowed = 'move';
		dt.setData("Text", $(this).attr('src'));
		
	});
	
	this.$el.bind('mousedown',function(e){
		
		self.settings.onDragStart.call(self,e,this._el);
		
		jQuery.ImageCatcher.Draggable.$dragObject = $(this);
		jQuery.ImageCatcher.Draggable.isDragging = true;
		
		if(!$('#draggable-placeholder').length) {
			self.$placeholder = $('<div id="draggable-placeholder"></div>').css({
				'position' : 'absolute',
				'width' : '75px',
				'height' : '75px',
				'background' : '#ffcc00',
				'zIndex' : 4999,
				'top' : (e.pageY+1)+'px',
				'left' : (e.pageX+1)+'px',
				'opacity' : 0.5
			}).hide();
			self.$placeholder.html($('<img src="'+jQuery.ImageCatcher.Draggable.$dragObject.attr('src')+'" width="75" height="75" />'));
			
			$('body').append(self.$placeholder);
		}
		
	});
	
	$(document).mousemove(function(e){
		
		if(self.$placeholder && jQuery.ImageCatcher.Draggable.isDragging) {
			//document.title = 'mousemove : '+e.pageY+'x'+e.pageX;
			self.$placeholder.css({
				'top' : (e.pageY+1)+'px',
				'left' : (e.pageX+1)+'px'
			}).show();
		}
		
	}, false);
	
	$(document).bind('mouseup',function(e){
		
		//document.title = 'dragend';
		
		if(jQuery.ImageCatcher.Draggable.isDragging) {
		
			if(jQuery.ImageCatcher.Draggable._dropCallback) {
				jQuery.ImageCatcher.Draggable._dropCallback(e,jQuery.ImageCatcher.Draggable.$dragObject);
			}
			jQuery.ImageCatcher.Draggable.isDragging = false;
			jQuery.ImageCatcher.Draggable.$dragObject = null;
			$('#draggable-placeholder').remove();
			self.$placeholder = null;
		}
		
		
	});
	
	
};

/*
 *
 * Properties
 *
 */
jQuery.ImageCatcher.Draggable.isDragging = false;
jQuery.ImageCatcher.Draggable.$dragObject = null;
jQuery.ImageCatcher.Draggable._dropCallback = null;
jQuery.ImageCatcher.Draggable.prototype.$el = null;
jQuery.ImageCatcher.Draggable.prototype.$placeholder = null;

/*---------------------------------------------------------------------------*/

/*
 *
 * Paste
 *
 * Retrieve image url in your clipboard when you paste in the current window
 *
 * @author David Mongeau-Petitpas <dmp@commun.ca>
 * @package ImageCatcher
 * @version 0.1
 *
 */
jQuery.ImageCatcher.Paste = function(callback) {
		
		var self = this;
		
		callback = typeof(callback) == 'function' ? callback:function(){};
		
		if(self._opts.paste) {
			self.catchPaste(function(url) {
				callback.call(self,url);
			});
		}
		
};

/*
 * Properties
 */
jQuery.ImageCatcher.Paste.prototype._uA = null;
jQuery.ImageCatcher.Paste.prototype._cmdKeycode = null;

/*
 * Catch paste event
 */
jQuery.ImageCatcher.Paste.prototype.catchPaste = function(callback) {
	
	callback = typeof(callback) == 'function' ? callback:function(){};
	
	var self = this;
	var ctrl = false;
	
	if(!this._ua) { this._ua = navigator.userAgent.toLowerCase(); }
	if(this._ua.indexOf('chrome') > -1 || this._ua.indexOf('safari') > -1) { this._cmdKeycode = 91; }
	else if(this._ua.indexOf('firefox') > -1) { this._cmdKeycode = 224; }
	else if(this._ua.indexOf('opera') > -1) { this._cmdKeycode = 17; }
	
	jQuery.ImageCatcher.attachEvent(document,'keydown',function(event) {
		
		ctrl = (self._isCtrl.call(self,event) || ctrl) ? true:false;
		
		if (ctrl){
			if (event.kC == 86) {
				if(!document.getElementById('_clipboardData')) {
					var txta = document.createElement('textarea');
					txta.id = '_clipboardData';
					txta.style.position = 'absolute';
					txta.style.left = '-2000px';
					document.body.appendChild(txta);
				} else {
					var txta = document.getElementById('_clipboardData');
					txta.value = '';
				}
				txta.focus();
				window.setTimeout(function() {
					var url = txta.value;
					if(jQuery.ImageCatcher.isURL(url)) {
						callback(url);
					}
				},10);
			}
		}
		
	});

	jQuery.ImageCatcher.attachEvent(document,'keyup',function(event) {
		if(self._isCtrl.call(self,event)) {
			ctrl = false;
		}
	});
	
};

jQuery.ImageCatcher.Paste.prototype._isCtrl = function(e) {
	
	var ctrl = (e.ctrlKey || e.kC == this._cmdKeycode) ? true:false;
	if(this._cmdKeycode == 91 && e.kC == 93) { ctrl = true; }
	
	return ctrl;
};




jQuery.fn.extend({
	
	'catcherDropbox' : function(opts) {
		jQuery.each(this,function() {
			if(!$(this).data('ImageCatcher_Dropbox')) {
				$(this).data('ImageCatcher_Dropbox',new jQuery.ImageCatcher.DropBox(this,opts));
			}
		});
	},
	
	'catcherDraggable' : function(opts) {
		jQuery.each(this,function() {
			if(!$(this).data('ImageCatcher_Draggable')) {
				$(this).data('ImageCatcher_Draggable',new jQuery.ImageCatcher.Draggable(this,opts));
			}
		});
	}
	
});

