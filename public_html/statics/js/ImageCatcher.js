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
var ImageCatcher = {};

Array.is = function(array) { return !( !array || (!array.length || array.length == 0) || typeof array !== 'object' || !array.constructor || array.nodeType || array.item ); }

/*
 * Simple extend function
 */
ImageCatcher.extend = function(obj, extObj) {
    if (arguments.length > 2) {
        for (var a = 1; a < arguments.length; a++) {
            ImageCatcher.extend(obj, arguments[a]);
        }
    } else {
        for (var i in extObj) {
            obj[i] = extObj[i];
        }
    }
    return obj;
}

/*
 * Cross-browser function to attach event
 */
ImageCatcher.attachEvent = function(el,ev,callback) {
	
	callback = typeof(callback) == 'function' ? callback:function(){};
	
	ev = typeof(ev) == 'string' ? [ev]:ev;
	el = !el[0] ? [el]:el;
	
	for(var i = 0; i < ev.length; i++) {
		eventName = 'on'+ev[i];
		for(var ii = 0; ii < el.length; ii++) {
			var _oldCallback = el[ii][eventName] && typeof(el[ii][eventName]) == 'function' ? el[ii][eventName]:function(){};
			el[ii][eventName] = function(e) {
				
				if(!e) e = window.event;
				if (e && e.keyCode) e.kC = e.keyCode;
				else if (e && e.which) e.kC = e.which;
				
				_oldCallback(e);
				callback(e);
			};
		}
	}
	
};

/*
 * Validate ur;
 */
ImageCatcher.isURL = function(url) {
	return (url.search(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/) != -1) ||
			(url.search(/data\:image/) != -1);
};

/*
 * Read file from dataTransfer object
 */
ImageCatcher.readFile = function(file,callback) {

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
ImageCatcher.DropBox = function(el,opts) {
	
	var self = this;
	
	this._opts = ImageCatcher.extend({
		'onDrop' : function() {},
		'onDragEnter' : function() {},
		'onDragOver' : function() {},
		'onDragOut' : function() {}
	},(opts || {}));
	
	this._el = (el || document.body);
	this._isBody = this._el == document.body ? true:false;
	
	ImageCatcher.attachEvent(window,'load',function() {
		
		self._createDropBox.call(self,function(files) {
			var self = this;
			self._opts.onDrop.call(self,files);
		});
		
		if(self._isBody) {
			ImageCatcher.attachEvent.call(self,self._el,'mouseout',self._showDrop);
			ImageCatcher.attachEvent.call(self,self._el,'mouseover',self._hideDrop);
			if(self._isBody) {
				ImageCatcher.attachEvent.call(self,window,'blur',self._showDrop);
				ImageCatcher.attachEvent.call(self,window,'focus',self._hideDrop);
			}
		}
		
	});
	
	
};

/*
 *
 * Properties
 *
 */
ImageCatcher.DropBox.prototype._el = null;
ImageCatcher.DropBox.prototype._isBody = null;
ImageCatcher.DropBox.prototype._drop = null;


/*
 *
 * Method to create the drop box where image files should be dropped
 *
 */
ImageCatcher.DropBox.prototype._createDropBox = function(callback) {
	
	callback = typeof(callback) == 'function' ? callback:function(){};
	
	var self = this;
	
	if(self._isBody) {
		var drop = document.createElement('div');
		drop.id = 'drop';
		drop.style.width = self._el.style.width;
		drop.style.height = self._el.style.height;
		this._el.appendChild(drop);
	} else {
		var drop = this._el;
	}
	this._drop = drop;
	
	/*
	 *
	 * Handle drag & drop events
	 *
	 */
	ImageCatcher.attachEvent(drop,"dragenter", function(e){
		
		e.returnValue = false;
		e.stopPropagation();
		e.preventDefault();
		
		self._opts.onDragEnter.call(self,e,drop);
		
	}, false);
	ImageCatcher.attachEvent(drop,"dragover", function(e){
		
		e.returnValue = false;
		e.stopPropagation();
		e.preventDefault();
		
		self._opts.onDragOver.call(self,e,drop);
		
	}, false);
	
	ImageCatcher.attachEvent(drop,"dragleave", function(e) {
		
		e.returnValue = false;
		e.stopPropagation();
		e.preventDefault();
		
		self._opts.onDragOut.call(self,e,drop);
		
	}, false);
	
	ImageCatcher.attachEvent(drop,"drop", function(e){
		
		e.stopPropagation();
		e.preventDefault();
		
		e.dataTransfer.dropEffect = 'move';
		
		if(e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files.length && FileReader) {
			callback.call(self,e.dataTransfer.files);
			document.title = 'drop-files';
		} else if(url = e.dataTransfer.getData('Text')) {
			document.title = 'dataTransfer';
			if(ImageCatcher.isURL(url)) {
				callback.call(self,url);
			}
		} else {
			alert('dropOther');
		}
		
		if(self._isBody) {
			self._hideDropBox.call(self);
			self._el.removeChild(drop);
			self._createDropBox.call(self,callback);
		}
		
	}, false);
	
	ImageCatcher.attachEvent(drop,"mouseover", function(e){
		
		self._opts.onDragOver.call(self,e,drop);
		
		if(ImageCatcher.Draggable._isDragging) {
			ImageCatcher.Draggable._dropCallback = function(e,target) {
				callback.call(self,target.src);
			}
		}
		
	}, false);
	
	ImageCatcher.attachEvent(drop,"mouseout", function(e){
		
		self._opts.onDragOut.call(self,e,drop);
		
		if(ImageCatcher.Draggable._dropCallback) {
			ImageCatcher.Draggable._dropCallback = null;
		}
		
	}, false);
	
};

ImageCatcher.DropBox.prototype._showDropBox = function() {
		
	if(this._drop) {
		this._drop.style.display = 'block';
	}
};

ImageCatcher.DropBox.prototype._hideDropBox = function() {
	if(this._drop) {
		this._drop.style.display = 'none';
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
ImageCatcher.Draggable = function(el,opts) {
	
	var self = this;
	
	this._opts = ImageCatcher.extend({
		'onDragStart' : function() {},
		'onDragOver' : function() {},
		'onDragOut' : function() {}
	},(opts || {}));
	
	this._el = (el || document.body);
	this._isBody = this._el == document.body ? true:false;
	
	ImageCatcher.attachEvent(this._el,"dragstart", function(e){
		
		/*e.returnValue = false;
		e.stopPropagation();
		e.preventDefault();*/
		
		var dt = e.dataTransfer;
		dt.effectAllowed = 'move';
		dt.setData("Text", e.target.src);
		
		/*self._opts.onDragStart.call(self,e,this._el);
		
		self._drag = e.target;
		self._isDragging = true;
		
		if(!self._placeholder) {
		
			document.title = 'dragstart';
			self._placeholder = document.createElement('div');
			self._placeholder.id = 'draggable-placeholder';
			self._placeholder.style.position = 'absolute';
			self._placeholder.style.width = '75px';
			self._placeholder.style.height = '75px';
			self._placeholder.style.background = '#ffcc00';
			self._placeholder.style.zIndex = 4999;
			
			var img = document.createElement('img');
			img.src = self._drag.src;
			img.width = 75;
			img.height = 75;
			self._placeholder.appendChild(img);
			
			document.body.appendChild(self._placeholder);
		}*/
		
	}, false);
	
	ImageCatcher.attachEvent(document.body,"mousemove", function(e){
		
		if(self._placeholder && ImageCatcher.Draggable._isDragging) {
			//document.title = 'mousemove : '+e.pageY+'x'+e.pageX;
			self._placeholder.style.top = (e.pageY+1)+'px';
			self._placeholder.style.left = (e.pageX+1)+'px';
		}
		
	}, false);
	
	/*ImageCatcher.attachEvent(this._el,"dragend", function(e){
		
		document.title = 'dragend';
		
		if(self._isDragging) {
			self._isDragging = false;
			self._drag = false;
			document.body.removeChild(self._placeholder);
			self._placeholder = null;
		}
		
	}, false);*/
	
	ImageCatcher.attachEvent(this._el,"mousedown", function(e){
		
		self._opts.onDragStart.call(self,e,this._el);
		
		ImageCatcher.Draggable._dragObject = e.target;
		ImageCatcher.Draggable._isDragging = true;
		
		if(!self._placeholder) {
		
			document.title = 'dragstart';
			self._placeholder = document.createElement('div');
			self._placeholder.id = 'draggable-placeholder';
			self._placeholder.style.position = 'absolute';
			self._placeholder.style.width = '75px';
			self._placeholder.style.height = '75px';
			self._placeholder.style.background = '#ffcc00';
			self._placeholder.style.zIndex = 4999;
			
			var img = document.createElement('img');
			img.src = ImageCatcher.Draggable._dragObject.src;
			img.width = 75;
			img.height = 75;
			self._placeholder.appendChild(img);
			
			document.body.appendChild(self._placeholder);
		}
		
	}, false);
	
	ImageCatcher.attachEvent(document.body,"mouseup", function(e){
		
		//document.title = 'dragend';
		
		if(ImageCatcher.Draggable._isDragging) {
		
			if(ImageCatcher.Draggable._dropCallback) {
				ImageCatcher.Draggable._dropCallback(e,ImageCatcher.Draggable._dragObject);
			}
			ImageCatcher.Draggable._isDragging = false;
			ImageCatcher.Draggable._dragObject = false;
			document.body.removeChild(self._placeholder);
			self._placeholder = null;
		}
		
		
	}, false);
	
	
};

/*
 *
 * Properties
 *
 */
ImageCatcher.Draggable._isDragging = false;
ImageCatcher.Draggable._dragObject = null;
ImageCatcher.Draggable._dropCallback = null;
ImageCatcher.Draggable.prototype._el = null;
ImageCatcher.Draggable.prototype._placeholder = null;
ImageCatcher.Draggable.prototype._isBody = null;

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
ImageCatcher.Paste = function(callback) {
		
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
ImageCatcher.Paste.prototype._uA = null;
ImageCatcher.Paste.prototype._cmdKeycode = null;

/*
 * Catch paste event
 */
ImageCatcher.Paste.prototype.catchPaste = function(callback) {
	
	callback = typeof(callback) == 'function' ? callback:function(){};
	
	var self = this;
	var ctrl = false;
	
	if(!this._ua) { this._ua = navigator.userAgent.toLowerCase(); }
	if(this._ua.indexOf('chrome') > -1 || this._ua.indexOf('safari') > -1) { this._cmdKeycode = 91; }
	else if(this._ua.indexOf('firefox') > -1) { this._cmdKeycode = 224; }
	else if(this._ua.indexOf('opera') > -1) { this._cmdKeycode = 17; }
	
	ImageCatcher.attachEvent(document,'keydown',function(event) {
		
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
					if(ImageCatcher.isURL(url)) {
						callback(url);
					}
				},10);
			}
		}
		
	});

	ImageCatcher.attachEvent(document,'keyup',function(event) {
		if(self._isCtrl.call(self,event)) {
			ctrl = false;
		}
	});
	
};

ImageCatcher.Paste.prototype._isCtrl = function(e) {
	
	var ctrl = (e.ctrlKey || e.kC == this._cmdKeycode) ? true:false;
	if(this._cmdKeycode == 91 && e.kC == 93) { ctrl = true; }
	
	return ctrl;
};



