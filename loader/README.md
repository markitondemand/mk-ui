### Codepen Example
Check out our live [codepen](http://codepen.io/MarkitOnDemand/pen/jWQJQG) documentation.

##### Table of Contents
1. **Features**
2. **About**
3. **Markup**
4. **JavaScript**
  - Public API
  - Event Hooks

### Features
1. **Screen reader compatible.** We support screen readers using Aria and Role attributes dynamically with our JavaScript to help assist users interacting with dynamic content.
3. **Inherits all features from MkComponent.** MkComponent is the base object our Mk libaries extend from. MkComponent has build in object copying, GUID generators, a helpful Aria API, and a unique, light weight templating system for markup and formatting text. See more [here](http://codepen.io/MarkitOnDemand/post/mk-component). 
4. **Flexible Focus.** Easily manage focus to your triger element or shift focus to your newly loaded dynamic content.
5. **Flexible Positioning** Relatively position containers to take advantage of our stand-alone css center positioning or position your loaders any way you like.
9. **Flexible CSS Styling.** Classname hooks for each and every element exist so it's extremely easy to apply any sort of custom styling your heart desires.

### About
Mk Loader is a simple JavaScript library which injects a loading UI, commonly used for dynamic content, into any specified element of the DOM. The 'special' part of Mk Loader is the screen reader capabilities. We do the work of setting up aria-live, aria-atomic, aria-relevant, and aria-busy attributes for you as well as keep a hidden live region available for custom alerts to the user.

### The Markup
There is no markup for loaders. All shadow markup generated is via 100% client side JavaScript. Loaders are created/removed with the JavaScript loader API only. However, you can easily change the markup a loader generates using the MkComponent Template Engine.

### The JavaScript
Mk Components are *not* self initializing so as the end developer, you are responsible for creating instances of this component. Don't worry, it's super easy. Let's take a look at two ways to do that.

To create/remove a loader all we must do is query a node to inject the loader into, and specify whether or not we want to show one or hide one. It's that simple. Here's how to do it with either jQuery or stand-alone.

*The 'shiftFocus' boolean, when set to true, will set focus onto your new content when it is done loading and has been injected into the DOM. Defaults to false which keeps focus where the user is.*

```javascript
  //
  //jQuery hooks
  //---------------------
  
  //show/create loader
  $(my-selector).mkloader(true [, bool shiftFocus]);
  //hide/remove loader
  $(mk-selector).mkloader(false [, bool shiftFocus]);
  
  //
  //Via the Mk namespace
  //----------------------
  var $module = $(my-selector),
      loader  = new $.Mk.Loader($module [, bool shiftFocus]);
      
  //show/create
  loader.show();
  
  //hide/remove
  loader.hide();
  
```
##### Public API
Now lets check out the public properties and methods available to you as the end developer.

###### **show()**
Create a loader, if one does not exist, inside a container node and show it. Notify the user content is loading.

###### **hide()**
Remove a loader, if one exists, inside a container node. Notify the user content has loaded and set screen reader focus on the new content additions.

###### **focus()**
Shift focus to the top of the container, for new content to be read and tabbed through. This is useful if you have a button below a region of content and the region updates and you want focus to be put on that updated content for tabbing/behavior. *called automatically when shiftFocus is set to true.*

##### Event Hooks
There are currently no event hooks.
