##### Table Of Contents

1. What is MkComponent?
2. Features
  - How to Use
  - Utils
  - Template System
  - Format System
  - Transition Support
  - Aria
  - Extending Existing Components
3. The Aria API

### What is MkComponent
MkComponent is an JavaScript object which providing useful tools and functionality to extending objects. This object is Abstract and meant for extension only. Extending this object gives the end component helpful tools for creating rich, dynamic UI and keyboard/screen reader accessible user interfaces.

### Features
Again, MkComponent is not made for stand-alone use. It's sole purpose is to provide useful features to extending objects. Such features include Templating Engines, Formatting Engines, GUID Generator, Object Copy, and an Aria API. Now lets get into how to use it.

##### How to Use

First, we want to setup a file which will hold the contents of our new component. For the sake of this article, let's make a dropdown.js file where we'll build a dropdown component. Inside that file we'll create a closue which will hold our component. Finally, our component is going to extend MkComponent so we'll need to use the MkComponent API which only has one method available: **create**. The MkComponent has been namespaced onto jQuery as the name Mk.

```javascript
!function( $ ) {

  'use strict';
  
  $.Mk.create('Dropdown', {
    //prototype goes here...
  });

}( window.jQuery );
```

We can now access this component like so:

```javascript
  var Dropdown = $.Mk.Dropdown;
 ```
 
In this way you can add static members or add more members to the prototype in the old fashion way using *object.prototype.member*.

```javascript
  $.Mk.Dropdown.staticMemeber = function() { ... };
  $.Mk.Dropdown.prototype.member = function() { ... };
```

But we're not going to use any of that in this example so let's get back to our dropdown file because there is more to the setup.

Since we're extending MkComponent it's more than likely we're going to be creating JavaScript which renders useful, interactive User Interfaces to the end user. This means we'll probably need some kind of html/markup creation at some point. MkComponent holds all it's markup in a template property which is a type of object. We'll also want to create a 'name' for our component which will be used as classname and GUID prefixers. We can set all this lovely stuff up in the **_define** method which gets triggered on initialization.

```javascript
!function( $ ) {

  'use strict';
  
  $.Mk.create('Dropdown', {
  
    _define: function() {
    
      this._name = 'my-dropdown';
      
      this._templates = {
        list: ['<ul />'],
        item: [
          '<li>',
            '<a href="javascript: void(0);">{{label}}</a>',
          '</li>'
        ]
      };
    }
  });

}( window.jQuery );
```

If we are expecting arguments to be passed to our component on initialization, say for passing in a container or target element and a set of options, we can override the default **_init** method. The default init calls **_define** so make sure to add that into your override.

```javascript
!function( $ ) {

  'use strict';
  
  $.Mk.create('Dropdown', {
  
    _define: function() {
    
      this._name = 'my-dropdown';
      
      this._templates = {
        list: ['<ul />'],
        item: [
          '<li>',
            '<a href="javascript: void(0);">{{label}}</a>',
          '</li>'
        ]
      };
    },
    
    _init: function($target, options) {
      
      this.$target = $($target);
      this.options = this._copy(options);
      this._define();
    }
  });

}( window.jQuery );
```

##### Utils

Notice in the example above we're using a method called **_copy** inside of our _init method. This is a utility built into MkComponent which will copy objects thus removing any kind of pointer issues. There are actually a handful of these utilities available to help our creation process.

###### **_copy( object )**
Copy an object removing pointer refernces for a clean, new object to manipulate.

###### **_uid()**
Generates a unique id each time it's called. This method will also prefix the 'name' property onto the id for easy identification when developing *(ie: _uid() => 'my-dropdown-424f2148-0417-4647-90dc-4f69e5a7eacc')*.

###### **_class( name, asSelector )**
Generates a dynamic class name combining the argument 'name' with the component name prefixed *(ie: _class('container') => 'my-dropdown-container')*. Additionally you can pass in a boolean for the argument 'asSelector' which will hand you back the classname as a selector vs. a raw class string. Default for asSelector is false.

###### **_ns( name )**
Generates a namespace combining the argument 'name' with the component name prefixed *(ie: _ns('click') => 'click.my-dropdown')*. Useful for event namespacing and dynamic for easy extension.

##### Templating System

Remember how we setup a template property holding our shadow markup for our component? Well now it's time to use it with the Template System. For simplicity sake and the fact that we want to keep this example very basic, lets create a super simple method which creates our dropdown list. We'll call this method **_build** and we'll execute it during _init.

```javascript
!function( $ ) {

  'use strict';
  
  $.Mk.create('Dropdown', {
  
    _define: function() {
    
      this._name = 'my-dropdown';
      
      this._templates = {
        list: ['<ul />'],
        item: [
          '<li>',
            '<a href="javascript: void(0);">{{label}}</a>',
          '</li>'
        ]
      };
    },
    
    _init: function($target, options) {
      
      this.$target = $($target);
      this.options = this._copy(options);
      this._define();
      
      this.$list = this._build();
      this.$list.insertAfter(this.$target);
    },
    
    _build: function() {
      
     var $list = this._template('list');
          $list.addClass(this._class('menu'));
          
      for(var i = 1, $item; i <= 5; i++) {
          $item = this._template('item', {label: this._label(i)});
          $item.addClass(this._class('item'));
          $list.append($item);
      }
      return $list;
    }
  });

}( window.jQuery );
```

Looking at the above we can see that the method _template() takes in a string name referencing a template in our _templates property. The method also taking in an object of key/value pairs which supply data points to the template. Finally the method returns you the template as a jQuery fragment.

##### Formatting System

Just like the Templating System we can use the MkComponent Formatting System. The formatting method can take in a string to format, a reference to a template, or a string name referencing a template in our _template property. Like the Template System you can also pass in an object of key/value pair data. which will be injected into your string. The formatter returns you said string.

```javascript
!function( $ ) {

  'use strict';
  
  $.Mk.create('Dropdown', {
  
    _define: function() {
    
      this._name = 'my-dropdown';
      
      this._templates = {
        list: ['<ul />'],
        item: [
          '<li>',
            '<a href="javascript: void(0);">{{label}}</a>',
          '</li>'
        ]
      };
    },
    
    _init: function($target, options) {
      
      this.$target = $($target);
      this.options = this._copy(options);
      this._define();
      
      this.$list = this._build();
      this.$list.insertAfter(this.$target);
    },
    
    _build: function() {
      
      var $list = this._template('list');
          $list.addClass(this._class('menu'));
          
      for(var i = 1, $item; i <= 5; i++) {
          $item = this._template('item', {label: this._label(i)});
          $item.addClass(this._class('item'));
          $list.append($item);
      }
      return $list;
    },
    
    _label: function(i) {
    
      var data = {number: i};
    
      if (i < 10) {
        return this._format('Item Number 0{{number}}', data);
      }
      return this._format('Item Number {{number}}', data)
    }
  });

}( window.jQuery );
```

##### Transition Support
MkComponent comes with transition event detectors, an opt-in ability to globally set transition classes, and a useful transition/clearTransition method for easily adding callbacks which work as immediate executing functions when transitions are off, making use of handling functionlity for you.

Let's take a look at wrapping some functionality up in a transition callback.

```javascript
!function( $ ) {

  'use strict';
  
  $.Mk.create('Dropdown', {
  
    _define: function() {
    
      this._name = 'my-dropdown';
      
      this._templates = {
        list: ['<ul />'],
        item: [
          '<li>',
            '<a href="javascript: void(0);">{{label}}</a>',
          '</li>'
        ]
      };
    },
    
    _init: function($target, options) {
      
      this.$target = $($target);
      this.options = this._copy(options);
      this._define();
      
      this.$list = this._build();
      this.$list.insertAfter(this.$target);
      
      this._bind();
    },
    
    _build: function() {
      
      var $list = this._template('list');
          $list.addClass(this._class('menu'));
          
      for(var i = 1, $item; i <= 5; i++) {
          $item = this._template('item', {label: this._label(i)});
          $item.addClass(this._class('item'));
          $list.append($item);
      }
      return $list;
    },
    
    _label: function(i) {
    
      var data = {number: i};
    
      if (i < 10) {
        return this._format('Item Number 0{{number}}', data);
      }
      return this._format('Item Number {{number}}', data)
    },
    
    _bind: function() {
      
      var me = this;
      
      this.$target.on(this._ns('click'), function() {
        me._click(e);
      });
    },
    
    _click: function(e) {
      
      e.preventDefault();
      
      var me = this;
      
      this.transition(this.$target, function() {
        alert('we just did a css transition, now let's do something else!');
      });
      this.$target.addClass('transitioning-open');
    }
  });

}( window.jQuery );
```

With the above code, when transitions are enabled, the class will be added and animations will do their thing. When complete, the callback will fire off. When transitions are turned off, the callback will just fire off so there is no bulking up your code with if/else statements or any of that nonsense.

To turn transitions on/off you can either simply include the mk-transition.js file OR somewhere in your code provide the following:

```javascript
//turn them on
$.Mk.transitions(true);

//turn them off
$.Mk.transitions(false);

//get the value
var transitionsEnabled = $.Mk.transitions();
```

##### Aria

Lets talk about Aria. Aria is the key ingredient when making rich web components play nicely with keyboard and screen reader accessible users. Aria, and Roles, are basically responsible for interpreters to unerstand what your components are and what they are doing while interacting. Aria and Roles are absolutely essencial when it comes to making WCAG 2.0 compliant user interfaces.

That said, this example is very, very basic and thus adding in a bunch of aria is almost unnecessary. However, for the sake of examples and how the aria API works lets just go crazy and add stuff.

```javascript
!function( $ ) {

  'use strict';
  
  $.Mk.create('Dropdown', {
  
    _define: function() {
    
      this._name = 'my-dropdown';
      
      this._templates = {
        list: ['<ul />'],
        item: [
          '<li>',
            '<a href="javascript: void(0);">{{label}}</a>',
          '</li>'
        ]
      };
    },
    
    _init: function($target, options) {
      
      this.$target = $($target);
      this.options = this._copy(options);
      this._define();
      
      this.$list = this._build();
      this.$list.insertAfter(this.$target);
      
      this._bind();
    },
    
    _build: function() {
      
      var $list = this._template('list');
          $list.addClass(this._class('menu'));
      
      this.aria(this.$target).owns($list);
      this.aria($list).role('menu').describedby(this.$target).hidden();
          
      for(var i = 1, $item; i <= 5; i++) {
          $item = this._template('item', {label: this._label(i)});
          $item.addClass(this._class('item'));
          
          this.aria($item).role('menuitem').selected(i == 1);
          $list.append($item);
      }
      return $list;
    },
    
    _label: function(i) {
    
      var data = {number: i};
    
      if (i < 10) {
        return this._format('Item Number 0{{number}}', data);
      }
      return this._format('Item Number {{number}}', data)
    },
    
    _bind: function() {
      
      var me = this;
      
      this.$target.on(this._ns('click'), function() {
        me._click(e);
      });
    },
    
    _click: function(e) {
      
      e.preventDefault();
      
      var me = this;
      
      this.transition(this.$target, function() {
        //notify aria api our element is now active
        me.aria(me.$target).visible();
        //do other stuff...
      });
      this.$target.addClass('transitioning-open');
    }
  });

}( window.jQuery );
```

Let's break down the above example. First we are calling out that the $list is owned by the $target element. Secondly, we are assigning a role of 'menu' to the list and letting Aria know you can describe the list by it's owner element, the $target. We are also calling hidde() on the list to apply aria and classname attributes which signify to screen readers the menu is not open for reading at this time. Next up, for each item we are adding a role of 'menuitem' in association with its parent 'menu.' Then, if we are on the first item in the list, we want to set the selected state to true. Finally, we are telling aria that our element is visible after a click even is fired (in the transition callback).

As you can see, it's quite complex to set up aria and this is just a basic setup! Imaging having to track hovers, keyboard toggling, expanding/collapsing, etc. etc. It can get crazy. The Aria API helps ease some of that madness by handling a lot of the tracking for you, generating IDs when it can, and applying the correct attributes and classname for easy handling and CSS styling.

##### Extending Existing Components

In many cases, we want all kinds of functionality a current component has but we want to either add more functionality or alter it. It can also be a very clean, reusable solution to take a currently existing component and build your setting on top of it by extending the vanilla component. MkComponent comes with built in extending for this... with some rules. First off, you are only allowed to extend objects built with MkComponent. Secondly... well there is no second rule. So let's see an example of extending a component for the sake of modifying some existing functionality. For simplicities sake we'll modify something strait forward like a template.

```javascript

//Store old _define method in a variable
//We do not use Super for extending to make things as strait forward as possible.
var _define = $.Mk.prototype.Autocomplete._define;

$.Mk.Create('MyObject', $.Mk.Autocomplete, {
  _define: function() {
  
    _define.apply(this);
    
    //Create a new template for 'item'
    this._templates.item = [
      '<li class="some-classname">',
        '<a href="javascript:void(0)" data-value="{{value}}">{{name}}</a>',
        '<span class="label">Result {{count}} of {{total}}</span>',
       '</li>'
    ];
  }
});
```

### The Aria API
The MkComponent Aria API is quite large and is only getting bigger with each and every complex component we have to build. Below is the list of every method the Aria API comes with. Remember, to access the aria API all we need to do is call the **aria** method in the context of our MkComponent instance (see above for example).

###### **owns( node )**
The element in context will now own node via aria-owns attribute. 

###### **controls( node )**
The element in context will now control node via aria-controls attribute.

###### **describedby( node )**
The element in context can now be described in additional details by node via the aria-describedby attribute.

###### **labelledby( node )**
The element in context can now be labelled in addadditionalitinal details by node via the aria-labelledby attribute.

###### **activedescendant( node )**
Let's assistive technologies know which element is in context via aria-activedescendant (which element the user currently has focus on) inside a given parent. The parent is the element in context while node represents the active element in focus.

###### **haspopup( bool )**
Notify assistive technologies if the element in context is associated with a popup style element via aria-haspopup (an element which can be show/hidden like a tooltip, dropdown, or modal).

###### **hidden( bool )**
Notify assistive technologies whether the element in context should be ignored or read by screen readers via aria-hidden. Also applies a classname of aria-hidden for styling. Default for bool is true.

###### **visible()**
Notify assistive technologies whether the element in context should be read by the screen reader or not via aria-hidden. Also applies a classname of aria-visible for styling.

###### **expanded( bool )**
Notify assistive technologies whether the element in context is expanded or collapsed via aria-expanded. Also applies a classname of aria-expanded for styling. Default for bool is true.

###### **collapsed()**
Notify assistive technologies the element in context is collapsed via aria-expanded. Also applies a classname of aria-collapsed for styling.

###### **disabled( bool )**
Notify assistive technologies the element in context is disabled or enabled via aria-disabled. Also applies a classname of aria-disabled/enabled for styling. Default for bool is true.

###### **enabled()**
Notify assistive technologies the element in context is enabled via aria-disabled. Also applies a classname of aria-enabled for styling.

###### **selected( bool )**
Notify assistive technologies the element in context is selected/deselected via aria-selected. Also applies a classname of aria-selected/deselected for styling. Default for bool is true.

###### **deselected()**
Notify assistive technologies the element in context is deselected via aria-selected. Also applies a classname of aria-deselected for styling.

###### **atomic( bool )**
Notify assistive technologies the element in context is dynamic via aria-atomic. Default for bool is true.

###### **deatomize()**
Notify assistive technologies the element in context is no longer dynamic via aria-atomic.

###### **relevant( additions/removals/text/all/empty [string] )**
Notify assistive technologies the element in context is atomic and set the aria-relevant attribute to the provided string value. It's recommended you also provide an aria-live attribute (see below for live, dead, and assertive methods).

###### **relevantAdditions()**
Notify assistive technologies the element in context is atomic and set the aria-relevant attribute to 'additions.' This notifies the user of content that has been added only.

###### **relevantRemovals()**
Notify assistive technologies the element in context is atomic and set the aria-relevant attribute to 'removals.' This notifies the user of content that has been removed only.

###### **relevantAll()**
Notify assistive technologies the element in context is atomic and set the aria-relevant attribute to 'all.' This notifies the user of all content and text changes.

###### **irrelevant()**
Removes any aria-relevant and aria-atomic attributes associated with the element in context.

###### **live( polite/assertive/off/empty [string] )**
Notify assistive technologies the element in context has dynamic content and update the user by means of being polite, assertive, or turn notifications off completely. Default value is polite.

###### **dead()**
Notify assistive technologies the element in context no longer has dynamic content and do not update the user of changes made to the element or child nodes.

###### **assertive()**
Notify assistive technologies the element in context has dynamic content and update the user by means of assertive. This will stop all reading of other content immediately and put focus back onto the element in context.

###### **role( role [string] )**
Set the role attribute of the element in context to the role string provided.

###### **index( tabindex )**
Set an elements tab index with a string or integer.

###### **noindex()**
Remove an elements tabindex
