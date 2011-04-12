// JavaScript Document


$(function() {
	
	/*
	 *
	 * Update size
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
	
	/*
	 *
	 * Scroll
	 *
	 */
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
	$(window).trigger('scroll');
	
	
	/*
	 *
	 * Image resize
	 *
	 */
	$(window).resize(function() {
		var wdwHeight = $(window).height();
		var wdwWidth = $(window).width();
		if(wdwHeight < 450 || wdwWidth < 660) {
			
			if(wdwHeight < 450) {
				$('#content .photo img').css('maxHeight','300px');
				updateContentSize();
			} else {
				$('#content .photo img').css('maxWidth','500px');
				updateContentSize();
			}
			
		} else {
			
			$('#content .photo img').css({
				'maxWidth':(wdwWidth-160)+'px',
				'maxHeight':(wdwHeight-150)+'px'
			});
			updateContentSize();
			
		}
	});
	$(window).trigger('resize');
	
	$(window).load(function() {
		$(window).trigger('scroll');
		$(window).trigger('resize');
	});
	
	/*
	 *
	 * Navigation by key
	 *
	 */
	var shifted = false;
	$(document).bind('keydown',function(e) {
		shifted = e.shiftKey;
		var tab = (e.keyCode == 3 || e.keyCode == 9 || e.keyCode == 13);
		if (!shifted && tab) {
			e.preventDefault();
			e.stopPropagation();
			$('#header .lists img.current').next().addClass('current');
			$('#header .lists img.current:eq(0)').removeClass('current');
		} else if (shifted && tab) {
			e.preventDefault();
			e.stopPropagation();
			$('#header .lists img.current').prev().addClass('current');
			$('#header .lists img.current:eq(1)').removeClass('current');
		}
	});
	$(document).bind('keyup',function(e) {
		shifted = (e.shiftKey && shifted) ? false:shifted;
	});
	
	
	/*
	 *
	 * Drop object
	 *
	 */
	 
	 $('#header .me').catcherDropbox({
		'onDrop' : function(files) {
			$('#header .me').removeClass('me-hover');
			
			function updateImage(url) {
				$('#header .me').html('<img src="'+url+'" />');
				$('#header .me').addClass('me-set');
				$('#header .me img').catcherDraggable();
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
				$photo.find('img').catcherDraggable();
				$photo.slideDown('fast',function() {
					updateContentSize();
				});
				$(window).trigger('resize');
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
				} else if($el.parents('.me').length) {
					$('#header .me').removeClass('me-set').removeClass('hover');
					$el.fadeOut('fast',function() {
						$(this).remove();
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
	
	
	/*
	 *
	 * Draggable image
	 *
	 */
	 
	$('img').catcherDraggable();
	 
	
	
});