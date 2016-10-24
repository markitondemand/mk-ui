### Codepen Example
Check out our live [codepen](http://codepen.io/MarkitOnDemand/pen/adQMBK) documentation.

##### Table of Contents
1. **Features**
2. **Markup**
  - Basic Setup
  - Element Linking
  - Reverse Logic
  - Right to Left
  - Click/Enter Vs. Mouseover/Out
  - Advanced Tooltips
3. **JavaScript**
  - Public API
  - Event Hooks

### Features
1. **Fully Keyboard Accessible.** We support a complete setup of using tabs, arrows, esc, enter, spacebar, etc. 100% friendly for keyboard users.
2. **Screen reader compatible.** We support screen readers using Aria and Role attributes dynamically with our JavaScript to help assist users in working with the selectmenu UI.
3. **Inherits all features from MkComponent.** MkComponent is the base object our Mk libaries extend from. MkComponent has build in object copying, GUID generators, a helpful Aria API, and a unique, light weight templating system for markup and formatting text. See more [here](http://codepen.io/MarkitOnDemand/post/mk-component). 
4. **Multipurposed.** Use Mktooltip as simple tooltip text display or an advanced popup region full of interactivity.
5. **Flexible positioning.** You can easily modify how you want your tooltip to behave: position top to bottom, right to left, or reverse the logic completely with simple attribute values.
6. **Flexible contents.** You can literally populate a tooltip with whatever content you want: spans, forms, videos, you name it.
9. **Flexible CSS Styling.** Classname hooks for each and every element exist so it's extremely easy to apply any sort of custom styling your heart desires.

### The Markup
There are quite a few different things we can do with these tooltips but for now let's take a look at a bare bones setup.

```html
<a href="javascript: void(0);" 
    role="button" 
    class="mk-tooltip-trigger" 
    data-title="Hello there. I'm a tooltip">Hover me</a>
```

That's really all you need to create simply little hover fellows that give additional information and context to your element. But we can also supply tooltip with completely seperate elements instead of just text.

##### Element Linking

Below is an example of what we're calling 'element linking' which essencially links a trigger and a tooltip together. You can link these elements by either nesting the tooltip as a child of the trigger OR having the trigger and the tooltip as sibling elements.

```html
<a href="javascript: void(0);" role="button" class="mk-tooltip-trigger">
  Hover me
  <span class="mk-tooltip">Hello there. I'm a tooltip</span>
</a>

<div>
  <a href="javascript: void(0);" role="button" class="mk-tooltip-trigger">
    Hover me
  </a>
  <div class="mk-tooltip">
    <h4>Hello there!</h4>
    <p>I'm a tooltip</p>
  </div>
</div>
```

##### Reverse Logic

By default tooltips will attempt to position themselves top-center of the trigger element. If real estate is scarce on the Y axis it will move to below the trigger element. If left or right real estate is scarce, it will adust it's X axis position to fit into view as much as possible. That said, it's also possible to reverse the order of this logic. For instance, we want tooltips to always be positioned bottom first before attempting to be positioned at the top of a trigger.

```html
<div>
  <a href="javascript: void(0);" role="button" class="mk-tooltip-trigger">Hover me</a>
  <div class="mk-tooltip" data-display="reverse">
    <h4>Hello there!</h4>
    <p>I'm a tooltip</p>
  </div>
</div>
```

##### Right to Left

Closely realted to the above reverse logic, we can also tell the tooltips to position themselfs left-to-right instead of top-to-bottom. They will still maintain the logic of fitting into the real estate provided and adjust themselves if necessary.

```javascript
<div>
  <a href="javascript: void(0);" role="button" class="mk-tooltip-trigger">Hover me</a>
  <div class="mk-tooltip" data-display="rtl">
    <h4>Hello there!</h4>
    <p>I'm a tooltip</p>
  </div>
</div>
```

##### Click/Enter Vs. Mouseover/Out

Who says tooltips have to be triggered by mouseover/out only? By default tooltips are opt-in to mouseover/out event handlers but this is easily changed to click/enter with a simple attribute addition.

```javascript
<div>
  <a href="javascript: void(0);" role="button" class="mk-tooltip-trigger" data-toggle="click">Click Me Instead</a>
  <div class="mk-tooltip">
    <h4>Hello there!</h4>
    <p>I'm a tooltip</p>
  </div>
</div>
```

##### Advanced Tooltips

Finally, it's worth mentioning that you can basically do anything with these things including adding your own highly dynamic content including media, forms, etc. The tooltip recognizes when we have dynamic content and switches roles around allowing for focus into the tooltip and tabbing/clicking/keyboarding through all its content.

```html
<a href="javascript: void(0);" role="button" class="mk-tooltip-trigger" data-toggle="click">Edit User Info</a>
<div class="mk-tooltip">
  <form class="form">
    <fieldset>
      <label for="name">User Name</label>
      <input class="form-control" type="text" name="name" id="name" value="" placeholder="Username" />
    </fieldset>
    <fieldset>
      <label for="password">Password</label>
      <input class="form-control" type="password" name="password" id="password" value="" placeholder="Password" />
    </fieldset>
    <button class="btn btn-primary">Submit</button>
  </form>
</div>
```

### The JavaScript
Mk Components are *not* self initializing so as the end developer, you are responsible for creating instances of this component. Don't worry, it's super easy. Let's take a look at two ways to do that.

This component actually serves as a delegate instead of having to initialize every tooltip on the page. Not only is this performance efficient but it saves a lot of hassel when adding/removing dynamic content. It also works as a 'lazy' component in that it only does what it has to when it has to - so if you have 1000 tooltips on your page and a user only interacts with one, it only does work to that one tooltip - everything else is left alone.

```javascript
  //jQuery hook
  $(function() {
    var $body = $(document.body);
        $body.mktooltip();
  });
  
  //Via the Mk namespace
  $(function() {
    var $body = $(document.body),
         tooltip = new $.Mk.Tooltip($body);
  });
```
##### Public API
Now lets check out the public properties and methods available to you as the end developer. First off, you can retrieve any instance of the tooltip via jQuery.data.

```javascript
  var instance = $(my-selector).data('mk-tooltip');
```
###### **show( trigger, xy )**
Show a tooltip by passing in the trigger element. You can optionally pass in an object with x and y integers if you would like to manually position the tooltip yourself.

###### **hide( trigger )**
Hide a tooltip by passing in the trigger element. If nothing is passed in, hideAll() is triggered.

###### **hideAll()**
Hide all tooltips in a given delegate region.

###### **lock( trigger )**
Prevents a tooltip from hiding when mouseout or click until it is unlocked.

###### **unlock( trigger )**
Removes a tooltip's hiding lock.

##### Event Hooks
All tooltip events are namespaced with *.mk-tooltip.* Currently, there are two possible event hooks you can use: **show** and **hide**. Let's take a look.

###### **show/hide**
Self explanitory. Events are triggered when the tooltip shows/hides.

````javascript
  $(my-selector).on('show.mk-tooltip', function(e, $trigger, $tooltip) {
    ///do something...
  })
  .on('hide.mk-tooltip', function(e, $tooltip, $trigger) {
    ///do something...
  });
```
