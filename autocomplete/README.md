### Code Example
Check out our live [codepen](http://codepen.io/MarkitOnDemand/pen/eZmbpj) documentation.

### Table of Contents
1. **Features**
2. **Markup**
  - Basic Setup
  - Remote URLs
  - Supplying Data
  - Multi/Single Selections
  - Tags
  - Time & Min-Width
  - Flash Class States
3. **JavaScript**
  - Options
  - Template Overriding
  - Public API
  - Event Hooks

### Features
1. **Fully Keyboard Accessible.** We support a complete setup of using tabs, arrows, esc, enter, spacebar, etc. 100% friendly for keyboard users.
2. **Screen reader compatible.** We support screen readers using Aria and Role attributes dynamically with our JavaScript to help assist users in working with the selectmenu UI.
3. **Inherits all features from MkComponent.** MkComponent is the base object our Mk libaries extend from. MkComponent has build in object copying, GUID generators, a helpful Aria API, and a unique, light weight templating system for markup and formatting text. See more [here](http://codepen.io/MarkitOnDemand/post/mk-component).
4. **Ajax or Preload.** Pass your autocomplete instance JSON data or supply it with a URL to query and cache results itself.
5. **Flash Classes.** Highlighting wrappers and classes, which wrap search terms/queries found in results for easy "keyword" styling, adds class names for input focus, capacity, loading, and disabled.
6. **Multisearch support.** Opt-in ability for selecting a single result set or multiple result sets up to infinity.
7. **Comma delimiters.** For multi-search options you can delimit your queries with a comma to create multiple result sets and add tags to the UI.
8. **Tagging.** Display a list of tags for selected search results as part of the UI. Smart text input width calculator for displaying tags and the search input together, inline.
9. **Flexible CSS Styling.** Classname hooks for each and every element exist so it's extremely easy to apply any sort of custom styling your heart desires.

### The Markup
There are quite a few different things we can do with this autocompete but for now let's take a look at the bare-bones markup.

```html
<fieldset class="mk-autocomplete">
  <input type="text"
    id="search" 
    name="search"
    placeholder="Enter a keyword" />
</fieldset>
```

This is the first step to the minimalistic setup of an autocomplete instance. Next you'll need to either supply it data via JavaScript or supply a URL for the library to hit via AJAX GET request.

##### Remote URLs

Below is an example of supplying the autocomplete with a remote URL to hit for data queries. The default data type it is expecting to be returned is JSON, which can also be changed via the data-type attribute (see below as well). Also, results will be cached via search term so wasted requests are not made.

```html
<fieldset class="mk-autocomplete">
  <input type="text"
    id="search" 
    name="search"
    placeholder="Enter a keyword" 
    data-remote="/path/to/my/api" 
    data-type="json" />
</fieldset>
```

##### Supplying Data

The other alternative is to supply the autocomplete data directly through javascript. This is useful for when we have a set array of data that doesn't change - like a list of states, countries, cars, etc. *By default, MkAutocomplete expects back an array of objects with the keys "name" and "value." See the Overriding Templates section for details on changing this.*

```javascript
  $("#search").mkautocomplete({
    data: [{
      "name": "Ford Motors",
      "value": 1
    }, {
      "name": "Mazda",
      "value": 2
    }]
  });
```

##### Multi/Single Selections

We're also able to control selecting a single result from our array of data OR selecting multiple results. We can also launch different queries and select different results from any of them, bucketing all results together behind the scenes for you. In the example below we are setting the data-selections attribute to 6, meaning we are allowing the user up to 6 selections from result sets. *By default, the selection count is unlimited.*

```html
<fieldset class="mk-autocomplete">
  <input type="text"
    id="search" 
    name="search"
    placeholder="Enter a keyword" 
    data-remote="/path/to/my/api" 
    data-type="json"
    data-selections="6" />
</fieldset>
```

##### Tags

Tags are a group of elements rendered to the user which represent all the selections the user has made from the autocomplete. For instance, if we have a list of U.S. States and the users selected "California," "Colorado," and "Louisiana" the autocomplete UI will render a Tags UI for the user to see. This can be opt-out of with pure css by setting the tag container to display: none (this will also keep it hidden from screen readers).

Below is NOT what you have to set up, but what will be rendered via autocomplete in our scenario of U.S. States above.

```html
<fieldset class="mk-autocomplete">
  <span class="mk-autocomplete-selected">
    <span class="mk-autocomplete-label">
      <a href="javascript: void(0)" role="button" data-value="1" data-action="remove">
        <span class="sr-only">Remove California</span>
      </a>
      <span class="value">California</span>
    </span>
    <span class="mk-autocomplete-label">
      <a href="javascript: void(0)" role="button" data-value="7" data-action="remove">
        <span class="sr-only">Remove Colorado</span>
      </a>
      <span class="value">Colorado</span>
    </span>
    <span class="mk-autocomplete-label">
      <a href="javascript: void(0)" role="button" data-value="21" data-action="remove">
        <span class="sr-only">Remove Louisiana</span>
      </a>
      <span class="value">Louisiana</span>
    </span>
  </span>
	<input type="text" 
    name="autocomplete" 
    placeholder="Enter a symbol" />
</fieldset>
```

##### Time & Min-Width

Lastly, we can provide time [delay] and min-width settings for the autocomplete. The time attribute is the amount of delay [in milliseconds] before autocomplete sends out a request for data. The min-width attribute is used in cases where Tags are present. As tags get added to the selections list, the input box gets smaller to accomidate. The min-width tells autocomplete the very smallest size to make the input box before wrapping to a new line.

```html
<fieldset class="mk-autocomplete">
  <input type="text"
    id="search" 
    name="search"
    placeholder="Enter a keyword" 
    data-remote="/path/to/my/api" 
    data-type="json"
    data-selections="6" 
    data-time="1000" 
    data-min-width="100" />
</fieldset>
```

##### Flash Class States

A flash class is a helper classname added to the autocomplete container which represents a state the autocomplete is currently in. Think of them as style hooks. There are currently four flash classes that exist: **disabled,** **capacity,** **loading,** and **focused.** These will give you hooks into adding loading icons, text, colors, etc. for the different states of autocomplete behavior.

### The JavaScript
Mk Components are *not* self initializing so as the end developer, you are responsible for creating instances of this component. Don't worry, it's super easy. Let's take a look at two ways to do that.

```javascript
  //jQuery hook
  $(function() {
    var $search = $(my-selector);
        $search.mkautocomplete([optional options]);
  });
  
  //Via the Mk namespace
  $(function() {
    var $search = $(my-selector),
         autocomplete = new $.Mk.Autocomplete($search [, optional options]);
  });
```

##### Options

When setting up your instance of the autocomplete, it's likely you'll want to add some additional options to it. You can set a handful of options via html attributes like shown above, but there are also a ton of other options available via JavaScript. Let's take a look at them all.

```javascript
{
  type: string [data type for ajax requests],
  remote: string [remote url for ajax requests],
  minwidth: string/int [see the Time & Min-Width section],
  selections: string/int [number of selections. see Multi/Single Selections],
  template_live: html array [see Overriding Templates],
  template_item: html array [see Overriding Templates],
  template_error: html array [see Overriding Templates],
  template_label: html array [see Overriding Templates],
  template_live: html array [see Overriding Templates],
  template_labels: html array [see Overriding Templates],
  template_list: html array [see Overriding Templates],
  template_container: html array [see Overriding Templates],
  template_loadlabel: string [format for loading label (accessibility)],
  template_retrievelabel: string [format for loaded label (accessibility)]
}
```

##### Template Overriding

To make customizing an autocomplete easy, we can supply the options object with a number of templates. Templates are provided as an array of strings where the strings represent markup. As an example, let's say our remote data API is handing back a JSON array of objects with two keys: "State" and "Code." By default, MkAutocomplete builds it's list expecing the keys "name" and "value." So we'll have to change that. Here's how we can do that with template overriding.

```javascript
  $(my-selector).mkautocomplete({
    template_item: [
      '<li>',
			  '<a tabindex="-1" href="javascript: void(0);" data-value="{{Code}}">{{Country}}</a>',
      '</li>'
    ]
  });
```

##### Public API
Now lets check out the public properties and methods available to you as the end developer. First off, you can retrieve any instance of the autocomplete via jQuery.data.

```javascript
  var instance = $(my-selector).data('mk-autocomplete');
```
###### **show()**
Show the results list associated with an autocomplete instance.

###### **hide()**
Hide the results list associated with an autocomplete instance.

###### **toggle()**
Toggles between show() and hide().

###### **off()**
If enabled, disable the autocomplete from interacting. This will not disable the actual input but instead will disable all autocomplete functionality, forcing the input to behave as a standard text input in the browser. 

###### **on()**
If disabled, set the autocomplete back to enabled. This will return all autocomplete functionality disabled by off().

###### **focus()**
Wrapper method for putting focus onto the autocomplete input. The added benefit is adding some class identifiers and a blur event.

###### **empty()**
Empty all current results the user has selected. 

##### Event Hooks
All autocomplete events are namespaced with *.mk-autocomplete.* Currently, there are three possible event hooks you can use: **change,** **submit,** and **capacity**. Let's take a look.

###### **change**

The change event is triggered each time a selection is made by the user. For example, a user selects "California" out of a list of states. The exeption is that if we have our number of selections limited to one, or we have reached the maximum amount of selections, change will not fire and instead, submit will fire.

````javascript
  $(my-selector).on('change.mk-autocomplete', function(e, selections) {
    //array of name/value pair objects
    console.info(selections);
  });
```

###### **submit**

The submit event is triggered when the selection limit is full. For instance, we setup our autocomplete to have a selection limit of 3 and the user selects "California," "Colorado," and "Lousisiana" out of a list of states. Likewise, if we setup our autocomplete for only one selection, the limit will always be reached thus submit will be the main event that fires vs. the change event.

````javascript
  $(my-selector).on('submit.mk-autocomplete', function(e, selections) {
    //array of name/value pair objects
    console.info(selections);
  });
```

###### **capacity**

Capacity fires when a user attempts to enter more values that we are limiting. For instance, we setup our autocomplete to have a selection limit of 3 and the user selects "California," "Colorado," and "Lousisiana" and then tries adding "Hawaii" out of a list of states. In single select mode, the capacity event never gets fired, as the single value is continually replaced with the new value and the submit event is triggered.

````javascript
  $(my-selector).on('capacity.mk-autocomplete', function(e, selections) {
    //array of name/value pair objects
    console.log(selections);
  });
```
