### Codepen Example
Check out our live [codepen](http://codepen.io/MarkitOnDemand/pen/mVarxm) documentation.

##### Table Of Contents

1. Features
2. Markup
  - Basic Setup
  - Min, Max, & Initial
  - Value Vs. Data-initial
  - Formatting
  - Linking Datepickers
  - Using Readonly
3. JavaScript
  - Options
  - Public API
  - Event Hooks
4. Advanced Date Formatting

### Features
1. **Fully Keyboard Accessible.** We support a complete setup of using tabs, arrows, esc, enter, spacebar, page up, page downm home, and end keys. 100% friendly for keyboard users.
2. **Screen reader compatible.** We support screen readers using Aria and Role attributes dynamically with our JavaScript to help assist users in working with the calendar API.
3. **Inherits all features from MkComponent.** MkComponent is the base object our Mk libaries extend from. MkComponent has build in object copying, GUID generators, a helpful Aria API, and a unique, light weight templating system for markup and formatting text. See more [here](http://codepen.io/MarkitOnDemand/post/mk-component).  
4. **Supports min, max and initial date ranges.** Supply datepickers with a minimum, maximum, and/or initial date setup via html attributes or a JavaScript options object.
5. **Sync min and max range via elements.** Supply a selector as a min or max date to sync one datepicker with another. Very useful when you have seperate min amd max calendar APIs.
6. **Flexible date formatting support.** Massive support for different date formatting styles in the traditional format notation (ie: dddd mmmm, dd, yyyy).
7. **Display as a popup or inline.** Flexibility to have your calendar render inline (hide/show functionality diabled) with your target element or become a "popup" style element (hide/show functionality enabled).
8. **Flexible CSS Styling.** Classname hooks for previous month days, next month days, disabled dates, each day of the week, current date, selected date, and every other key element in a calendar are easily targeted via CSS for easy and highly customizable styling.

### The Markup
There are a ton of options available for MkDatepicker, which we'll get into one by one. First we're going to take a look at supplying these options via html attributes on your target element. Below is a bare-bones setup. For semantic purposes we'll want to use an input element and accompany it with a label.

```html
<div class="mk-datepicker-container">
  <label for="start-date">Vacation Departure</label>
  <input type="text" 
    class="mk-datepicker-trigger" 
    id="start-date" 
    name="start-date" 
    placeholder="Choose a start date" />
 </div>
```
##### Min, Max, and Initial
That's really all we need to get a fully functioning datepicker going. However, it's more than likely we'll want to format the date, set an initial date, and add a minimum and maximum range. Here's how we can do that strictly with markup:

```html
<div class="mk-datepicker-container">
  <label for="start-date">Vacation Departure</label>
  <input type="text" 
    class="mk-datepicker-trigger" 
    id="start-date" 
    name="start-date" 
    placeholder="Choose a start date" 
    data-format="mmmm dd, yyyy" 
    data-initial="May 15, 2016"
    data-min="January 01, 1990" 
    data-max="December 31, 2016" />
 </div>
```
##### Using Value Vs. Data-initial
Notice how we are setting our initial date with an attribute called "data-inital." This is useful if we want to start the datepicker on a certain date but not necessarily give the input a value yet. If we want the datepicker to start on a certain date AND we are okay with supplying a value to the input by default then we can simply use the value attribute.

```html
<div class="mk-datepicker-container">
  <label for="start-date">Vacation Departure</label>
  <input type="text" 
    class="mk-datepicker-trigger" 
    id="start-date" 
    name="start-date" 
    value="May 15, 2016"
    placeholder="Choose a start date" 
    data-format="mmmm dd, yyyy" 
    data-min="January 01, 1990" 
    data-max="December 31, 2016" />
 </div>
```
##### Consistency in Formatting
Now notice how the min and max dates supplied as attributes follow the same structure as the format we are providing. It's important to keep consistency as MkDatepicker will parse/format all dates in the format specified (default format is mm/dd/yyyy). Check out the last section of this article for formatting options. Below are two examples of formatting setup. The first will crap out while the second plays nicely.

```html

<!-- Example 1: Dates and format are inconsistent -->

<input type="text" 
    class="mk-datepicker-trigger"
    value="05/18/2016" 
    data-format="mmmm dd, yyyy" />
    
<!-- Example 2: Dates and format are consistent -->

<input type="text" 
    class="mk-datepicker-trigger"
    value="05/18/2016" 
    data-format="mm/dd/yyyy" />
```
##### Linking MkDatepicker
Sometime we have instances where we have two seperate inputs, one for a min date and one for a max date, which both have their own datepickers and we need to sync them. This is easily achievable by providing a selector to the min or max attributes. Synced datepickers will communicate with one another throughout interactions. 

```html
<div class="mk-datepicker-container">
  <label for="start-date">Vacation Departure</label>
  <input type="text" 
    class="mk-datepicker-trigger" 
    id="start-date" 
    name="start-date" 
    value="May 15, 2016"
    placeholder="Choose a start date" 
    data-format="mmmm dd, yyyy" 
    data-max="#end-date" />
 </div>
 <div class="mk-datepicker-container">
  <label for="end-date">Vacation End</label>
  <input type="text" 
    class="mk-datepicker-trigger" 
    id="end-date" 
    name="end-date" 
    value="May 15, 2016"
    placeholder="Choose an end date" 
    data-format="mmmm dd, yyyy" 
    data-min="#start-date" />
 </div>
```
##### Using Readonly
Sometimes we want to disable the user from entering dates without using the UI. Mobile apps take advantage of this by popping up their own date selector UI so the user must enter a date in a specific format under the apps constraints. We can do this as well by simply adding the readonly attribute to our target element. Now the user cannot enter a date in an unspecified format or garble the value up with odd characters.

```html
<div class="mk-datepicker-container">
  <label for="start-date">Vacation Departure</label>
  <input readonly 
    type="text" 
    class="mk-datepicker-trigger" 
    id="start-date" 
    name="start-date" 
    placeholder="Choose a start date"  />
 </div>
```
### The JavaScript
Mk Components are *not* self initializing so as the end developer, you are responsible for creating instances of this component. Don't worry, it's super easy. Let's take a look at two ways to do that.

```javascript
  //jQuery hook
  $(function() {
    var $datepicker = $(my-element-selector);
        $datepicker.mkdatepicker([optional options]);
  });
  
  //Via the Mk namespace
  $(function() {
    var $datepicker = $(my-element-selector),
         datepicker  = new $.Mk.Datepicker($datepicker [, optional options]);
  });
```
##### Supplying Options Via JavaScript
Below is the list of options available to provide via options object. Again, you can provide any of these through html attributes, or any combination of both.

```javascript
  {
    inline: true/false (popup or inline calendar),
    format: string (date formatting),
    headerFormat: string (weekday headers formatting),
    initial: string (as format) or Date,
    min: string (as format), Date, or selector,
    max: string (as format), Date, or selector,
	activeDates: Array<Date Objects> (applies active class to given dates) 
  }
```
##### Public API
Now lets check out the public properties and methods available to you as the end developer. First off, you can retrieve any instance of the datepicker via jQuery.data.

```javascript
  var instance = $(my-selector).data('mk-datepicker');
```
###### **show()**
Manually trigger a popup style datepicker to come out of hiding.

###### **hide(bool returnFocus)**
Manually hide a popup style datepicker with an optional boolean argument, returnFocus, to return keyboard focus to its target element. Default value is false.

###### **refresh(int day, int month, int year)**
Trigger a calendar refresh. Day, month, and year arguments are all optional but will modify the current day, month, year, or all of the above, and the re-render a new calendar in that date's context. 

###### **updateOptions(object options)**
Update a datepicker instance options and refresh the datepicker user interface.

###### **updateLink()**
When syncing two datepickers with each other, if you modify one it's probably a good idea to notify the other. This method will do just that and keep both linked datepickers in sync.

###### **date [object Date]**
Property holding the date currently in focus as a JavaScript Date object.

###### **year [int]**
Property holding the current year in focus as an integer.

###### **month [int]**
Property holding the current month in focus as an integer.

###### **day [int]**
Property holding the current day in focus as an integer.

###### **selected [object Date]**
Property holding currently selected date as a JavaScript Date object.

##### Event Hooks
All datepicker events are namespaced with *.mk-datepicker.* Currently, there are three possbile event hooks you can use: **change**, **show**, and **hide**. Let's take a look.

###### **change**
The event hook will return context for the element, a change event object, and a JavaScript Date object instance of the date selected.

```javascript
  $(my-selector).on('change.mk-datepicker', function(e, date) {
    //change event object
    console.info(e);
    //JavaScript Date object
    console.info(date);
    //string formatted date value
    console.info(this.value);
  });
```
###### **show/hide**
Self explanitory. Events are triggered when the calendar popup is either shown or hidden.

````javascript
  $(my-selector).on('show.mk-datepicker', function() {
    ///do something...
  })
  .on('hide.mk-datepicker', function() {
    ///do something...
  });
```
### Date Formatting
Below are the differet parts of the MkDatepicker formatter. You can pick and choose any of these and use them in combination. Likewise, you can use any of these characters in your date format: comma (,) space (\s) dash (-) and slash (/).

**m** - Month as 1-12

**mm** - Month as 01-12

**mmm** - Month as shorthand names (ie: Jan, Feb, Mar)

**mmmm** - Month as full names (ie: January, Febuary, March)

**d** - Date as 1-31

**dd** - Date as 01-31

**dddd** - Date as weekday (ie: Monday, Tuesday, Wednesday)

**yy** - Year as two digits (ie: 16, 97, 85)

**yyyy** - Year as full (ie: 2016, 1997, 1985)
