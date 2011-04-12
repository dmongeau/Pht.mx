// JavaScript Document


$(function() {
	
	/*
	 *
	 * Scroll
	 *
	 */
	var $header = $('#header');
	
	function updateHeaderSize() {
		var width = ($header.find('.lists img').length*80)+$header.find('.fixed').outerWidth();
		$('#page').css('width',(width+20)+'px');
		$('#header').css('width',(width+50)+'px');
	}
	
	function updateContentSize() {
		$('#content-placeholder').css({
			'width': $('#content').outerWidth(),
			'height': $('#content').outerHeight()+100
		});
	}
	
	updateHeaderSize();
	updateContentSize();
	
	var delayed = false;
	$(window).scroll(function() {
		if(!$('#content-placeholder').length) {
			$('#content').after('<div id="content-placeholder"></div>');
			updateContentSize();
			$('#content').css('position','fixed');
		}
		$('#content').css('top',-window.pageYOffset+'px');
		$('#header .lists').css('left',-window.pageXOffset+'px');
	});
	
	$(window).resize(function() {
		/*var wdwWidth = $(window).width();
		var contentWidth = $('#content').width();
		if(wdwWidth < 960 && wdwWidth > 700 && contentWidth != '700px') {
			$('#content').removeClass('large').removeClass('medium').addClass('small');
			updateContentSize();
		} else if(wdwWidth >= 960 && wdwWidth < 1200 && contentWidth != '960px') {
			$('#content').removeClass('small').removeClass('medium').removeClass('large');
			updateContentSize();
		} else if(wdwWidth >= 1200 && wdwWidth < 1400 && contentWidth != '960px') {
			$('#content').removeClass('large').removeClass('small').addClass('medium');
			updateContentSize();
		} else if(wdwWidth >= 1400 && contentWidth != '960px') {
			$('#content').removeClass('medium').removeClass('small').addClass('large');
			updateContentSize();
		}*/
		var wdwHeight = $(window).height();
		//document.title = wdwHeight;
		/*if(wdwHeight < 565) {
			
			if($('#content').hasClass('small')) { return; };
			$('#content').removeClass('large').removeClass('medium').removeClass('x-large').addClass('small');
			updateContentSize();
			
		} else if(wdwHeight >= 615 && wdwHeight < 665) {
			
			if($('#content').hasClass('medium')) { return; };
			$('#content').removeClass('large').removeClass('small').removeClass('x-large').addClass('medium');
			updateContentSize();
			
		} else if(wdwHeight >= 665 && wdwHeight < 765) {
			
			if($('#content').hasClass('large')) { return; };
			$('#content').removeClass('medium').removeClass('small').removeClass('x-large').addClass('large');
			updateContentSize();
			
		}  else if(wdwHeight >= 765) {
			
			if($('#content').hasClass('x-large')) { return; };
			$('#content').removeClass('medium').removeClass('small').removeClass('large').addClass('x-large');
			updateContentSize();
			
		} else if($('#content').hasClass('x-large') || $('#content').hasClass('large') || $('#content').hasClass('medium') || $('#content').hasClass('small')) {
			
			$('#content').removeClass('small').removeClass('medium').removeClass('large').removeClass('x-large');
			updateContentSize();
			
		} */
		if(wdwHeight < 450) {
			
			/*if($('#content').hasClass('small')) { return; };
			$('#content').removeClass('large').removeClass('medium').removeClass('x-large').addClass('small');*/
			$('#content .photo img').css('maxHeight','300px');
			updateContentSize();
			
			
		} else {
			
			$('#content .photo img').css('maxHeight',(wdwHeight-150)+'px');
			updateContentSize();
			
		}
	});
	$(window).trigger('resize');
	$(window).trigger('scroll');
	/*
	 *
	 * Drag drop image
	 *
	 */
	 
	 $('#header .me').catcherDropbox({
		'onDrop' : function(files) {
			$('#header .me').removeClass('me-hover');
			
			function updateImage(url) {
				$('#header .me').html('<img src="'+url+'" />');
				$('#header .me').addClass('me-set');
			}
			
			if(typeof(files) == 'string') {
				updateImage(files);
			} else if(files instanceof jQuery) {
				updateImage(files.attr('src'));
			} else if(files && files[0]) {
				jQuery.ImageCatcher.readFile(files[0],updateImage);
			}
		},
		'onDragOver' : function() {
			$(this).addClass('hover');
		},
		'onDragOut' : function() {
			$(this).addClass('hover');
		}
	});
	 
	$('#header .controls .list').catcherDropbox({
		'onDrop' : function(files) {
			$(this).removeClass('hover');
			
			function addList(url) {
				$('#header .lists').prepend('<img src="'+url+'" width="75" height="75" />');
				$('img').catcherDraggable();
				updateHeaderSize();
			}
			console.log(files);
			if(typeof(files) == 'string') {
				addList(files);
			} else if(files instanceof jQuery) {
				addList(files.attr('src'));
			} else if(files && files[0]) {
				jQuery.ImageCatcher.readFile(files[0],addList);
			}
		},
		'onDragOver' : function() {
			$(this).addClass('hover');
		},
		'onDragOut' : function() {
			$(this).removeClass('hover');
		}
	});
	 
	$('#header .controls .add').catcherDropbox({
		'onDrop' : function(files) {
			$(this).removeClass('hover');
			
			function addPhoto(url) {
				var user = ($('#header .me img').length) ? $('#header .me img').attr('src'):'/statics/img/user.png';
				var $photo = $('<div class="photo" style="display:none;">'+
								'<div class="left"><img src="'+user+'" /></div>'+
								'<div class="right"><img src="'+url+'" /></div>'+
								'<div class="clear"></div></div>');
				$('#content').prepend($photo);
				$('img').catcherDraggable();
				$photo.slideDown('fast',function() {
					updateContentSize();
				});
			}
			
			if(typeof(files) == 'string') {
				addPhoto(files);
			} else if(files instanceof jQuery) {
				addPhoto(files.attr('src'));
			} else if(files) {
				for(var i = 0; i < files.length; i++) {
					jQuery.ImageCatcher.readFile(files[i],addPhoto);
				}
			}
		},
		'onDragOver' : function() {
			$(this).addClass('hover');
		},
		'onDragOut' : function() {
			$(this).removeClass('hover');
		}
	});
	 
	$('#header .controls .remove').catcherDropbox({
		'onDrop' : function(files) {
			$(this).removeClass('hover');
			
			if(files instanceof jQuery) {
				var $el = files;
				if($el.parents('.photo').length) {
					$el.parents('.photo').slideUp('fast',function() {
						$(this).remove();
						updateContentSize();
					});
				} else if($el.parents('.lists').length) {
					$el.animate({'width':'1px'},'fast',function() {
						$(this).remove();
						updateHeaderSize();
					});
				}
			} 
		},
		'onDragOver' : function() {
			$(this).addClass('hover');
		},
		'onDragOut' : function() {
			$(this).removeClass('hover');
		}
	});
	
	$('img').catcherDraggable();
	 
	/*new ImageCatcher.DropBox($('#header .me').get(0),{
		'onDrop' : function(files) {
			$('#header .me').removeClass('me-hover');
			
			function updateImage(url) {
				$('#header .me').html('<img src="'+url+'" />');
				$('#header .me').addClass('me-set');
			}
			
			if(typeof(files) == 'string') {
				updateImage(files);
			} else if(files && files[0]) {
				ImageCatcher.readFile(files[0],updateImage);
			}
		},
		'onDragOver' : function() {
			$('#header .me').addClass('me-hover');
		},
		'onDragOut' : function() {
			$('#header .me').removeClass('me-hover');
		}
	});
	
	new ImageCatcher.DropBox($('#header .controls .list').get(0),{
		'onDrop' : function(files) {
			$('#header .controls .list').removeClass('hover');
			
			function addList(url) {
				$('#header .lists').prepend('<img src="'+url+'" width="75" height="75" />');
				updateHeaderSize();
			}
			
			if(typeof(files) == 'string') {
				addList(files);
			} else if(files && files[0]) {
				ImageCatcher.readFile(files[0],addList);
			}
		},
		'onDragOver' : function() {
			$('#header .controls .list').addClass('hover');
		},
		'onDragOut' : function() {
			$('#header .controls .list').removeClass('hover');
		}
	});
	
	new ImageCatcher.DropBox($('#header .controls .add').get(0),{
		'onDrop' : function(files) {
			$('#header .controls .add').removeClass('hover');
			
			function addPhoto(url) {
				var user = ($('#header .me img').length) ? $('#header .me img').attr('src'):'user.png';
				var $photo = $('<div class="photo" style="display:none;">'+
								'<div class="left"><img src="'+user+'" /></div>'+
								'<div class="right"><img src="'+url+'" /></div>'+
								'<div class="clear"></div></div>');
				$('#content').prepend($photo);
				updateContentSize();
				$photo.slideDown();
			}
			
			if(typeof(files) == 'string') {
				addPhoto(files);
			} else if(files) {
				for(var i = 0; i < files.length; i++) {
					ImageCatcher.readFile(files[i],addPhoto);
				}
			}
		},
		'onDragOver' : function() {
			$('#header .controls .add').addClass('hover');
		},
		'onDragOut' : function() {
			$('#header .controls .add').removeClass('hover');
		}
	});
	
	
	new ImageCatcher.Draggable(document.getElementsByTagName('img'));*/
	
});