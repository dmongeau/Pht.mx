// JavaScript Document


var ImageCatcher = function(el) {
	
	var self = this;
	
	this._el = (el || 'body');
	this._isBody = this._el == 'body' || this._el == document.body ? true:false;
	
	this._attachEvent(window,'load',function() {
		
		self._el = self._el == 'body' ? document.body:self._el;
		
		self._createDropbox.call(self,function(files) {
			var count = files.length;
			for(var i = 0; i < count; i++) {
				var file = files[i];
				var reader = new FileReader();
				reader.onload = function (event) {
					self._addImage.call(self,event.target.result);
					window.setTimeout(function() {
						document.body.scrollTop = 0;
					},10);
				};
				reader.readAsDataURL(file);
			}
		});
		
		self._attachEvent.call(self,self._el,'mouseout',self._showDrop);
		self._attachEvent.call(self,self._el,'mouseover',self._hideDrop);
		if(self._isBody) {
			self._attachEvent.call(self,window,'blur',self._showDrop);
			self._attachEvent.call(self,window,'focus',self._hideDrop);
		}
		
		self._catchPaste(function(url) {
			if(url.search(/(ftp|http|https):\/\/(\w+:{0,1}\w*@)?(\S+)(:[0-9]+)?(\/|\/([\w#!:.?+=&%@!\-\/]))?/) != -1) {
				self._addImage(url);
				window.setTimeout(function() {
					document.body.scrollTop = 0;
				},10);
			}
			
		});
		
	});
	
	
};

ImageCatcher.prototype._el = null;
ImageCatcher.prototype._isBody = null;
ImageCatcher.prototype._drop = null;
ImageCatcher.prototype._cmdKeycode = null;

ImageCatcher.prototype._attachEvent = function(el,ev,callback) {
	
	callback = typeof(callback) == 'function' ? callback:function(){};
	
	var _oldCallback = el['on'+ev] && typeof(el['on'+ev]) == 'function' ? el['on'+ev]:function(){};
	
	el['on'+ev] = function(e) {
		
		if(!e) e = window.event;
		if (e.keyCode) e.kC = e.keyCode;
		else if (e.which) e.kC = e.which;
		
		_oldCallback();
		callback(e);
	};
	
};

ImageCatcher.prototype._createDropbox = function(callback) {
	
	callback = typeof(callback) == 'function' ? callback:function(){};
	
	var self = this;
	
	var drop = document.createElement('div');
	drop.id = 'drop';
	
	drop.addEventListener("dragenter", function(event){
		event.stopPropagation();
		event.preventDefault();
	}, false);
	drop.addEventListener("dragover", function(event){
		event.stopPropagation();
		event.preventDefault();
		
		drop.className = 'hover';
		
	}, false);
	drop.addEventListener("dragleave", function(event){
		event.stopPropagation();
		event.preventDefault();
		
		drop.className = '';
		
	}, false);
	drop.addEventListener("drop", function(event){
			
		event.stopPropagation();
		event.preventDefault();
		
		var dt = event.dataTransfer,
			files = dt.files;
		
		self._hideDropbox();
		
		callback(files);
		
		self._el.removeChild(drop);
		
		self._createDropbox();
		
	}, false);
	this._el.appendChild(drop);
	this._drop = drop;
};

ImageCatcher.prototype._showDropbox = function() {
	if(this._drop) {
		this._drop.style.display = 'block';
	}
};

ImageCatcher.prototype._hideDropbox = function() {
	if(this._drop) {
		this._drop.style.display = 'none';
	}
};

ImageCatcher.prototype._createImage = function(url) {
	var img = new Image();
	img.src = url;
	img.onload = function() {
		if(img.width > img.height && img.width > 200) {
			img.width = 200;	
		} else if(img.width < img.height && img.height > 200) {
			img.height = 200;	
		}
	};
	return img;
};

ImageCatcher.prototype._addImage = function(url) {
	this._el.insertBefore(this._createImage(url),this._el.childNodes[0]);
};


ImageCatcher.prototype._catchPaste = function(callback) {
	
	callback = typeof(callback) == 'function' ? callback:function(){};
	
	var self = this;
	var ctrl = false;
	
	var uA = navigator.userAgent.toLowerCase();
	if(uA.indexOf('chrome') > -1 || uA.indexOf('safari') > -1) { this._cmdKeycode = 91; }
	else if(uA.indexOf('firefox') > -1) { this._cmdKeycode = 224; }
	else if(uA.indexOf('opera') > -1) { this._cmdKeycode = 17; }
	
	this._attachEvent(document,'keydown',function(event) {
		
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
					callback(txta.value);
				},10);
			}
		}
		
	});

	this._attachEvent(document,'keyup',function(event) {
		if(self._isCtrl.call(self,event)) {
			ctrl = false;
		}
	});
	
};

ImageCatcher.prototype._isCtrl = function(e) {
	
	var ctrl = (e.ctrlKey || e.kC == this._cmdKeycode) ? true:false;
	if(this._cmdKeycode == 91 && e.kC == 93) { ctrl = true; }
	
	return ctrl;
};