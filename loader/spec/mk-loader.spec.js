describe('mk-loader', function () {
	var $target = $('.panel-body');
 	var targetContents = $target.html();
 	describe('Loader', function () {

		describe ('when $(target).mkloader(true) is called it', function () {
			beforeEach(function () {
				$target.mkloader(true);
			});

			afterEach(function () {
				$target.mkloader(false);
			});

			it('should set aria-busy to true', function () {
				expect($target.attr('aria-busy')).toBeTruthy();
			})

			it('should set the aria-relevant attribute', function () {
				expect($target.attr('aria-relevant')).toBeTruthy();
			})

			it('should set the aria-live attribute', function () {
				expect($target.attr('aria-live')).toBeTruthy();
			})

			describe('and after a delay it', function(){

				beforeEach(function(done){
					setTimeout(function(){
						done();
					}, 250);
				});

				it('should append .mk-loader-container to its affecting container', function () {
					expect($target.find('.mk-loader-container').length).toEqual(1);
				});

				it ('should only append one loading overlay if called multiple times', function () {
					for(var i = 0; i < 10; i ++) {
						$target.mkloader(true);
					}
					expect($target.find('.mk-loader-container').length).toEqual(1);
				});
			});
		});
	});

	describe('when $(target).removeLoader() is called', function () {
		beforeEach(function () {
			$target.mkloader(true);
			$target.mkloader(false);
		});

		it('should remove .mk-loader-overlay from the container contents immediately', function () {
			expect($target.find('.mk-loader-container').length).toEqual(0);
		});
		it('should be able to be called multiple times without corrupting the container\'s original content', function () {

			for (var i = 0; i < 10; i++) {
				$target.mkloader(false);
			}
			expect($target.html()).toEqual(targetContents);
		});

		describe('and after a delay it', function(){
			beforeEach(function(done){
				setTimeout(function(){
					done();
				}, 250);
			});

			it('should still have the loader overlay removed from the container contents', function () {
				expect($target.find('.mk-loader-container').length).toEqual(0);
			});
		});
	});
	describe('API from the object instance', function () {
		beforeEach(function () {
			loader = new $.Mk.Loader($target);
		})

		it('shold display a loader with the show method', function () {
			loader.show();
			expect($target.find('.mk-loader-container').length).toEqual(1);
		});

		it('should remove the loader with the hide method', function () {
			loader.show();
			loader.hide();
			expect($target.find('.mk-loader-container').length).toEqual(0);
		});

		it('should focus the top of the container with the focus method', function () {
			var $bottomFocusable = $("<button>").addClass('bottom-focus');
			var $topFocusable = $("<button>").addClass('top-focus');
			$target.append($bottomFocusable).prepend($topFocusable);

			$bottomFocusable.focus();
			var focusOnBottom = $(document.activeElement).is($bottomFocusable);

			loader.focus();
			// not an accurate test. I can't figure out a way to properly test
			// the focus has shifted to the top of target and not just the top of the page.
			var focusOnTop = !$( document.activeElement ).is($bottomFocusable);
			expect(focusOnBottom).toEqual(focusOnTop);
			$bottomFocusable.remove();
			$topFocusable.remove();
		});
	});
});
