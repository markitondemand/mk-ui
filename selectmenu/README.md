### Codepen Example
Check out our live [codepen](http://codepen.io/MarkitOnDemand/pen/YwRRwg) documentation.

##### Table of Contents
1. **Features**
2. **Markup**
  - Basic Setup
  - Multiselect
  - Groupings
  - Classname Transfering
  - Additional Labeling
  - Reset
  - Smart Width
  - Disabling
3. **JavaScript**
  - Options
  - Public API
  - Event Hooks

### Features
1. **Fully Keyboard Accessible.** We support a complete setup of using tabs, arrows, esc, enter, spacebar, etc. 100% friendly for keyboard users.
2. **Screen reader compatible.** We support screen readers using Aria and Role attributes dynamically with our JavaScript to help assist users in working with the selectmenu UI.
3. **Inherits all features from MkComponent.** MkComponent is the base object our Mk libaries extend from. MkComponent has build in object copying, GUID generators, a helpful Aria API, and a unique, light weight templating system for markup and formatting text. See more [here](http://codepen.io/MarkitOnDemand/post/mk-component). 
4. **Multipurposed.** Use Mkselectmenu as a custom selectbox, combobox, muliselect, or dropdown menu of items.
5. **Supports multiple and optgroups.** Yes, you can transform a selectmenu into a multiselect as well as take advantage of grouping options in buckets.
6. **Classname transfers.** Want custom classnames on certain selectmenus or even for individual option items? We support dynamic classname transfers from your original markup to our shadow user interface.
7. **Reset functionality.** We've added additional functionality for "resetting" your custom selectmenu. Some selectmenus can be extrodinarily complex with tons of options. It's important to give the user easy, strai forward ways of interacting.
8. **Additional labeling.** Inject child elements into the custom option interface for additional information and a unique, custon design.
9. **Flexible CSS Styling.** Classname hooks for each and every element exist so it's extremely easy to apply any sort of custom styling your heart desires.

### The Markup
There are a ton of options available for MkSelectmenu, which we'll get into one by one. First we're going to take a look at supplying these options via html attributes on your target element. Below is a bare-bones setup.

```html
<div class="mk-selectmenu-container">
  <select class="mk-selectmenu">
    <option value="0">Option 001</option>
    <option value="1" selected>Option 002</option>
    <option value="2">Option 003</option>
    <option value="3">Option 004</option>
  </select>
 </div>
```
##### Multiselect
That's really all we need to get a fully functioning selectmenu going. However, quite often we'll want the ability to select multiple values in a given group. This can easily be achieved by supplying the multiple attribute. Also, it's important to add a data-label to the select element when using it as a multiselect. The label is used as the text in the trigger/target element since using the selected values as a label can prove to be a problem.

```html
<div class="mk-selectmenu-container">
  <select class="mk-selectmenu" data-label="My Options" multiple>
    <option value="0">Option 001</option>
    <option value="1" selected>Option 002</option>
    <option value="2">Option 003</option>
    <option value="3">Option 004</option>
  </select>
 </div>
```
##### Groupings
Easy right? Next lets see how we can implement group options in buckets. It's important to note that we've added more functionality with groups. When you create a group you also allow the group header to be selected/deselected. This will select/deselect all elements nested within it. This behavior is not native to combobox groupings but it is a very user friendly added benefit.

```html
<div class="mk-selectmenu-container">
  <select class="mk-selectmenu">
    <optgroup label="Set One">
      <option value="0">Option 001</option>
      <option value="1" selected>Option 002</option>
    </optgroup>
    <optgroup label="Set Two">
      <option value="2">Option 003</option>
      <option value="3">Option 004</option>
    </optgroup>
  </select>
 </div>
```
##### Classname Transfering
Classname transfering is where you add custom classnames to your original element and our shadow user interface intercepts these classnames and applies them to the shadow markup. You can do this with the native select and option elements. This is handy for identifying unique instances of selectmenus or customizing options, for instance adding icons.

```html
<div class="mk-selectmenu-container">
  <select class="mk-selectmenu my-custom-class">
    <optgroup label="Set One">
      <option class="icon-1" value="0">Option 001</option>
      <option class="icon-2" value="1" selected>Option 002</option>
    </optgroup>
    <optgroup label="Set Two">
      <option class="icon-3" value="2">Option 003</option>
      <option class="icon-4" value="3">Option 004</option>
    </optgroup>
  </select>
 </div>
```
##### Additional Labeling
Add additional child nodes into the shadow option user interface by providing a data-alt-text on native option elements. Basically we inject additional or "alternative text" into each list item, which you can easily style however you like.

```html
<div class="mk-selectmenu-container">
  <select class="mk-selectmenu my-custom-class">
    <option value="0" data-alt-text="Option one is pretty cool">Option 001</option>
    <option value="1" data-alt-text="Option two is cooler" selected>Option 002</option>
    <option value="2" data-alt-text="Option three is not so cool">Option 003</option>
    <option value="3" data-alt-text="Option four is the coolest">Option 004</option>
  </select>
 </div>
```
##### Reset
With complex muliselect instances it can be easy for users to select a bunch of options then decide they don't want them anymore. Instead of having to deselect everything we've created the ability to render a "reset" button. With a clean and easy CSS handle you can position and style it anywhere you like and it has build in keyboard functionality for focusing when toggling through options.

```html
<div class="mk-selectmenu-container">
  <select class="mk-selectmenu my-custom-class" data-reset label="My Options" multiple>
    <option value="0">Option 001</option>
    <option value="1" selected>Option 002</option>
    <option value="2">Option 003</option>
    <option value="3">Option 004</option>
  </select>
 </div>
```

##### Smart Width
The smart width option allows you to sync the trigger and menu widths so the expand/collapse renders flush instead of having seperate widths that may line up in an ugly way. Simply add the data-smartwidth attribute to consume functionality.

```html
<div class="mk-selectmenu-container">
  <select class="mk-selectmenu my-custom-class" data-smartwidth label="My Options" multiple>
    <option value="0">Option 001</option>
    <option value="1" selected>Option 002</option>
    <option value="2">Option 003</option>
    <option value="3">Option 004</option>
  </select>
 </div>
```
##### Disabling
By adding the disabled attribute to either the select or individual option elements we can disable those in the shadow user interface when users attempt to select a perticular option.

```html
<div class="mk-selectmenu-container">
  <select class="mk-selectmenu my-custom-class">
    <option value="0" disabled>Option 001</option>
    <option value="1" selected>Option 002</option>
    <option value="2">Option 003</option>
    <option value="3">Option 004</option>
  </select>
 </div>
```
### The JavaScript
Mk Components are *not* self initializing so as the end developer, you are responsible for creating instances of this component. Don't worry, it's super easy. Let's take a look at two ways to do that.

```javascript
  //jQuery hook
  $(function() {
    var $select = $(my-element-selector);
        $select.mkselectmenu([optional options]);
  });
  
  //Via the Mk namespace
  $(function() {
    var $select = $(my-element-selector),
         select = new $.Mk.Selectmenu($select [, optional options]);
  });
```

##### Options
We can set all the same options as we did with html attributes in JavaScript land as well. In face, we can include more - like overriding templates. Here are all the possible options you can pass to the selectmenu.

```javascript
  {
    multiple: true/false,
    reset: true/false,
    smartwidth: true/false
    template_trigger: [array html],
    template_group: [array html],
    template_option: [array html],
    template_reset: [array html],
    template_alt: [array html],
    template_menu: [array html],
    template_live: [array html],
    template_wrapper: [array html],
    template_no_selected: [string text format],
    template_single_selected: [string text format],
    temlate_multiple_selected: [string text format],
    temlate_live_seperator: [string text format],
    template_reset_label: [string text format],
  }
```

##### Public API
Now lets check out the public properties and methods available to you as the end developer. First off, you can retrieve any instance of the selectmenu via jQuery.data.

```javascript
  var instance = $(my-selector).data('mk-selectmenu');
```
###### **show()**
Manually trigger the menu UI open.

###### **hide()**
Manually hide the menu UI.

###### **repaint()**
In the case you make dynamic, heavy modifications to the select element (add/remove options, change classnames, etc) you can call this method to redraw the shadow selectmenu user interface.

###### **update()**
Call update anytime you modify the native select in simple, light ways such as changing which option(s) are selected or changing attributes like multiple. Basically any change that doesn't need a complete redraw of the shadow user interface.

##### Event Hooks
All selectmenu events are namespaced with *.mk-selectmenu.* Currently, there are three possbile event hooks you can use: **change**, **show**, and **hide**. Let's take a look.

###### **change**
The event hook will return a change event object in the context of your base element (ie: select node). You can then pull values natively as you would a normal select/option combination.

```javascript
  $(my-selector).on('change.mk-selectmenu', function(e) {
    //change event object
    console.info(e);
    //value(s) of selected options
    console.info(this.value);
  });
```
###### **show/hide**
Self explanitory. Events are triggered when the selectmenu opens/closes.

````javascript
  $(my-selector).on('show.mk-selectmenu', function() {
    ///do something...
  })
  .on('hide.mk-selectmenu', function() {
    ///do something...
  });
```
