
!function( $ ) {

	$.Mk.create('Scale', {

		$container: null,

		_define: function() {

			this._name = 'mk-scale';
			this._templates = {};
		},

		_init: function($container) {

			this.$container = $($container);

			this._define();
			this._bind();
		},

		_bind: function() {

			var me = this;

			this.$container.on(
				this._ns('change'), 
				this._class('item input', true), function(e) {
					me._change(e);
				});
		},

		_change: function(e) {

			var cls = this._class('item', true),
				target = e.target,
				values = [],

				$item = $(target).closest(cls),
				$next = $item.nextAll(cls),
				$prev = $item.prevAll(cls),
				$last = $($prev[0]).find('input');

			if ($last.prop('checked') && !target.checked) {
				target.checked = true;
			}

			$prev.find('input').prop('checked', false);
			$next.find('input').prop('checked', true);

			if (target.checked) {
				values.push(target.value);
			}

			$next.each(function() {
				values.push(
					$(this).find('input').val());
			});

			this.$container.trigger(
				this._ns('changed'), [target, values]);
		},

		change: function (key, force) {

			var $items = this.$container.find(this._class('item input', true)),
				$el;

			//get by index of items
			if (typeof key == 'number') {
				$el = $($items.index(key));
			}
			//get by name or value attributes
			//on the input element
			else {
				$el = $items.find('[name=' + key + ']');

				if (!$el.length) {
					 $el = $items.find('[value=' + key + ']');
				}
			}

			$el.prop('checked', force !== undefined 
				? force 
				: !$el.prop('checked'));
			
			var e = jQuery.Event(this._ns('change'));
				e.target = $el[0];

			this.$container.trigger(e);
		},

		reset: function () {

			this.$container.find('input').each(function () {
				this.checked = false;
			});

			this.$container.trigger(this._ns('changed'),
				[null, [/* no values */]]);
		},
	});

}(window.jQuery);