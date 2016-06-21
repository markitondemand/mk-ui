describe('mk-datepicker', function () {
	var wrapper;
	var datepicker;
	var instance;

	beforeEach(function () {
		wrapper = $('<div>').prop('id', 'test-mock').addClass('mk-datepicker-test')
		datepicker = $('<input>').attr('type', 'text').addClass('mk-datepicker-trigger')
		wrapper.append(datepicker);
		$('body').append(wrapper);
	});

	afterEach(function () {
		wrapper.remove();
		wrapper = datepicker = instance = undefined;
	});

  describe('initializing', function () {

	beforeEach(function () { });

  	it('does not self-initialize', function () {
  		var preInitCount = wrapper.find('.mk-datepicker-calendar').length;
  		expect(preInitCount).toEqual(0);
  	});

  	it('extends jquery for initializing', function () {
  		var preInitCount = wrapper.find(".mk-datepicker-calendar").length;
  		datepicker.mkdatepicker();
  		var postInitCount = wrapper.find(".mk-datepicker-calendar").length;
  		expect(postInitCount).toBeGreaterThan(preInitCount);
  	});
  });

  describe('interaction', function () {
	  beforeEach(function () {
		  datepicker.mkdatepicker({
			  initial: '5/22/2016'
		  });
		  instance = datepicker.data('mk-datepicker');
	  });

	  it('can select a new date by click', function () {
		  wrapper.find('.aria-deselected').first().click();
		  var selectedDate = datepicker.val();
		  wrapper.find('.aria-deselected').first().click();
		  var newSelectionDate = datepicker.val();
		  expect(selectedDate).not.toEqual(newSelectionDate);
	  });
	  it('can cycle months forward', function () {
		  wrapper.find('.mk-datepicker-next-m').click();
		  var label = wrapper.find('.mk-datepicker-label').text();
		  expect(label).toEqual('june 2016');
	  });
	  it('can cycle months backward', function () {
		  wrapper.find('.mk-datepicker-prev-m').click();
		  var label = wrapper.find('.mk-datepicker-label').text();
		  expect(label).toEqual('april 2016');
	  });
	  it('can cycle years forward', function () {
		  wrapper.find('.mk-datepicker-next-y').click();
		  var label = wrapper.find('.mk-datepicker-label').text();
		  expect(label).toEqual('may 2017');
	  });

	  it('can cycle years backward', function () {
		  wrapper.find('.mk-datepicker-prev-y').click();
		  var label = wrapper.find('.mk-datepicker-label').text();
		  expect(label).toEqual('may 2015');
	  });
  });

	describe('options via init object', function () {
		beforeEach(function () {
			wrapper.append(datepicker);
			$('body').append(wrapper);
		});

		it('can display an inline or popup calendar via option.inline', function () {
			datepicker.mkdatepicker({ inline: true });
			var isInline = wrapper.find('.inline').length;
			expect(isInline).toBeTruthy();
		});

	 it('accepts a date format config via option.format', function () {
		var formattedDate = 'jan 01, 2016';
	 	datepicker.mkdatepicker({
			format: 'mmm dd, yyyy',
			initial: 'jan 01, 2016'
		});
		wrapper.find('.aria-selected').click();
		var selectedDate = datepicker.val();
		expect(selectedDate).toEqual(formattedDate);
	 });

	it('accepts a format for day headers via option.headerFormat', function () {
		datepicker.mkdatepicker({
			headerFormat: 'dddd'
		});
		var firstDay = wrapper.find('.mk-datepicker-header').first().text();
		expect(firstDay).toEqual('sunday');
	});

	it('accepts an intial focus date as option.initial', function () {
		datepicker.mkdatepicker({
			initial: '5/22/2012'
		});
		var instance = datepicker.data('mk-datepicker');
		expect(instance.day).toEqual(22);
		expect(instance.month).toEqual(4);
		expect(instance.year).toEqual(2012);
	});

	 describe('accepts a min date as option.min', function () {
		beforeEach(function () {
			datepicker.mkdatepicker({
				min: '5/20/2010',
				initial: '5/22/2010'
			});
			instance = datepicker.data('mk-datepicker');
		});

		it('blocks selecting a day prior to the min', function () {
			var dayPriorToMin = 19;
			wrapper.find('[data-date="' + dayPriorToMin + '"]').click();
			var selectedDate = wrapper.find('.aria-selected').attr('data-date');
			expect(selectedDate).not.toEqual(dayPriorToMin);
			expect(instance.day).not.toEqual(dayPriorToMin);
		});

		it('blocks moving the datepicker outside of the min range', function () {
			var labelBeforeClick = wrapper.find('.mk-datepicker-label').text();
			wrapper.find('.mk-datepicker-prev-m').click();
			wrapper.find('.mk-datepicker-prev-y').click();
			var labelAfterClick = wrapper.find('.mk-datepicker-label').text();
			expect(labelBeforeClick).toEqual(labelAfterClick);
		});
	 });

	 describe('accepts a max date as option.max', function () {
		 beforeEach(function () {
			datepicker.mkdatepicker({
				max: '5/25/2010',
				initial: '5/22/2010'
			});
			instance = datepicker.data('mk-datepicker');
		});

		it('blocks selecting a day prior to the max', function () {
			// functions by disabling date, preventing clicks. Firing a click event through js
			// would not be blocked.
			var dayAfterMax = 26;
			var disabledDate = wrapper.find('[data-date="' + dayAfterMax + '"]:disabled').length;
			expect(disabledDate).not.toEqual(1);
		});

		it('blocks moving the datepicker outside of the min range', function () {
			var labelBeforeClick = wrapper.find('.mk-datepicker-label').text();
			wrapper.find('.mk-datepicker-next-m').click();
			wrapper.find('.mk-datepicker-next-y').click();
			var labelAfterClick = wrapper.find('.mk-datepicker-label').text();
			expect(labelBeforeClick).toEqual(labelAfterClick);
		});
	});
  });

  describe('API', function () {

	beforeEach(function () {
		wrapper.append(datepicker);
		$('body').append(wrapper);
		datepicker.mkdatepicker({
			format: 'mm/dd/yyyy',
			initial: "01/01/2016"
		});
		instance = datepicker.data('mk-datepicker');
	});

	  it('show() method opens the datepicker calendar', function () {
		  var calendar = wrapper.find('.mk-datepicker');
		  var isHidden = calendar.css('display') == 'none';
		  instance.show();
		  var isVisible = calendar.css('display') == 'block';
		  expect(isHidden).toEqual(true);
		  expect(isVisible).toEqual(true);
	  });

	  it('hide() method hides a displayed calendar', function () {
		  var calendar = wrapper.find('.mk-datepicker');
		  instance.show();
		  var isVisible = calendar.css('display') == 'block';
		  instance.hide();
		  var isHidden = calendar.css('display') == 'none';
		  expect(isHidden).toEqual(true);
		  expect(isVisible).toEqual(true);
	  });

	  describe('.refresh()', function () {
		  var currentDay;
		  var currentMonth;
		  var currentYear;
		  var calendar;

		  beforeEach(function () {
			  currentDay = instance.day;
			  currentMonth = instance.month;
			  currentYear = instance.year;
		  })

		  it('updates the .day, .month, and .year', function () {
			  instance.refresh(++currentDay, ++currentMonth, ++currentYear);
			  expect(instance.day).toEqual(currentDay);
			  expect(instance.month).toEqual(currentMonth);
			  expect(instance.year).toEqual(currentYear);
		  });

		  it('updates the calendar month and year', function () {
			  var focusedMonthYear = wrapper.find('.mk-datepicker-label').text();
			  expect(focusedMonthYear).toEqual('january 2016'); // check init is correct
			  instance.refresh(++currentDay, ++currentMonth, ++currentYear);
			  var updatedMonthYear = wrapper.find('.mk-datepicker-label').text();
			  expect(updatedMonthYear).toEqual('february 2017');
		  });

		  it('updates the focused day', function () {
  			  var focusedDay = wrapper.find('.aria-selected').attr('data-date');
			  instance.refresh(++currentDay, ++currentMonth, ++currentYear);
			  var updatedDay = parseInt(wrapper.find('.aria-selected').attr('data-date'));
			  expect(focusedDay).not.toEqual(updatedDay);
			  expect(updatedDay).toEqual(++focusedDay);
		  });
	  }); // end 'refresh()'

	  it('.updateOptions() accepts new options and refreshes', function () {
		  var currentOptions = instance.options;
		  instance.updateOptions({
			 format: 'mm,dd,yyyy',
			 headerFormat: 'dddd',
			 initial: '5,14,2016',
	 		 inline: true,
			 max: '5,18,2016',
			 min: '5,12,2016'
		 });
		 var newOptions = instance.options;
		 var allOptionsChanged = true;
		 for(var prop in currentOptions) {
			(currentOptions[prop] == newOptions[prop] ? allOptionsChanged = false : null);
		 }
		 expect(allOptionsChanged).toBe(true);
		 var dateSelected = wrapper.find('.aria-selected').attr('data-date');
		 expect(dateSelected).toEqual('14');
	  });

	  xdescribe('updateLink()', function () {
	  });

	  it('.date exposes the focused date', function () {
		  expect(instance.date).toEqual(new Date("01/01/2016"));
	  });

	  it('.year exposes the year', function () {
		  expect(instance.year).toEqual(2016);
	  });

	  it('.month exposes the month', function () {
		  expect(instance.month).toEqual(0);
	  });

	  it('.day exposese the day', function () {
		  expect(instance.day).toEqual(1);
	  });

	  it('.selected exposes the selected date in date object', function () {
		  wrapper.find('[data-date="31"]').last().click();
		  expect(instance.selected).toEqual(new Date("01/31/2016"));
	  });
  })

  describe('accessible features', function () {

	  beforeEach(function () {
		  datepicker.mkdatepicker();
		  instance = datepicker.data('mk-datepicker');
	  });

	  it('labels all day cells with the date via aria-label', function () {
		  var allLabelled = true;
		  wrapper.find('.mk-datepicker-cell').each(function (i, e) {
			  $(e).attr('aria-label') ? null: allLabelled = false;
		  });
		  expect(allLabelled).toBe(true);
	  });


	  it('labels table headers with arial-label', function () {
		  var allLabelled = true;
		  wrapper.find('thead th > *').each(function (i, e) {
			  $(e).attr('aria-label') ? null: allLabelled = false;
		  });
		  expect(allLabelled).toBe(true);
	  });

	  it('has a caption', function () {
		  var hasCaption = wrapper.find('caption').length;
		  expect(hasCaption).toBeTruthy();
	  });

	  it('applies an aria-labelledby to the table and points to caption', function () {
		  var captionLabelId = wrapper.find('table').attr('aria-labelledby');
		  console.log(captionLabelId);
		  var ariaTarget = $("#" + captionLabelId);
		  expect(ariaTarget.length).toEqual(1);
	  });

	  it('applies aria-selected to the active date', function () {
		  var hasAriaSelected = wrapper.find('.aria-selected').attr('aria-selected');
		  expect(hasAriaSelected).toEqual('true');
	  });

	  it('applies aria-hidden to the datepicker', function () {
		  	var hasAriaHidden = wrapper.find('.mk-datepicker').attr('aria-hidden');
			expect(hasAriaHidden).toEqual('true');
	  });

	  it('toggle aria-hidden when datepicker is open', function () {
			instance.show();
		  	var hasAriaHidden = wrapper.find('.mk-datepicker').attr('aria-hidden');
			expect(hasAriaHidden).toEqual('false');
	  });

	  it('applies aria-live to to the caption', function () {
		  var hasAriaLive = wrapper.find('caption').attr('aria-live');
		  expect(hasAriaLive).toEqual('assertive');
	  });

	  it('applies grid, gridcell & heading roles', function () {
		  var hasGrid = wrapper.find('[role="grid"]').length;
		  var hasGridCell = wrapper.find('[role="gridcell"]').length;
		  var hasHeading = wrapper.find('[role="heading"]').length;
		  expect(hasGrid).toBeTruthy();
		  expect(hasGridCell).toBeTruthy();
		  expect(hasHeading).toBeTruthy();
	  });

	  it('labels controls with "sr-only"-based aria-labelledby', function () {
		  var prevMthLabId = wrapper.find('.mk-datepicker-prev-m').attr('aria-labelledby');
		  var nextMthLabId = wrapper.find('.mk-datepicker-next-m').attr('aria-labelledby');
		  var prevYrLabId  = wrapper.find('.mk-datepicker-prev-y').attr('aria-labelledby');
		  var nextYrLabId  = wrapper.find('.mk-datepicker-next-y').attr('aria-labelledby');
		  var prevMthLab = wrapper.find('#'+prevMthLabId).length;
		  var nextMthLab = wrapper.find('#'+nextMthLabId).length;
		  var prevYrLab = wrapper.find('#'+prevYrLabId).length;
		  var nextYrLab = wrapper.find('#'+nextYrLabId).length;
		  expect(prevMthLab).toBeTruthy();
		  expect(nextMthLab).toBeTruthy();
		  expect(prevYrLab).toBeTruthy();
		  expect(nextYrLab).toBeTruthy();
	  });
  })
});
