# Mithril FLIP Component

A Mithril wrapper component for simplifying and assisting with the FLIP based animation technique.
* https://aerotwist.com/blog/flip-your-animations/
* https://css-tricks.com/animating-layouts-with-the-flip-technique/

## Quick Overview
The `FLIP` component enables you to add transition behavior to your plain old Mithril children vnodes. 
You can create your vnode children (e.g. `m('div')` or `m(Component)` ) without having to think about or implement the
transition and animation hooks, then subsequently wrap your child / children vnodes with the `FLIP` component.
You wire up your desired transition / animation handling with callbacks on the `FLIP` component.

## How it Works
The `FLIP` component requires a keyed child or children for managing the lifecycle hooks required to achieve inbound, outbound,
and moving animations.

`FLIP` children vnodes are augmented with Mithril's standard lifecycle hooks `oncreate`, `onupdate`, and `onbeforeremove`.
You provide `enter()`, `exit()`, and `move()` callbacks on the `FLIP` attrs and the `FLIP` component handles the ceremony of
determining when to call the corresponding `FLIP` callback based on each child's dom.

`FLIP`'s `view()` function will simply return the passed children parameters.

```$javascript
m(FLIP, {
    enter: (vnodeChild, flip) => doSomethingCoolOnEnter()  // called for each child created in this redraw
    move: (vnodeChild, flip) => doSomethingCoolOnMove()    // called for each child moving in this redraw
    enter: (vnodeChild, flip) => doSomethingCoolOnExit()   // called for each child being removed in this redraw
}, [
    m('div', {key: 1}, 'hello'),
    m('div', {key: 2}, 'world')
])
```

In the above example, `enter()`, `exit()`, and `move()` will be called for each child depending where that child is
in it's create / update / remove lifetime.

Additionally, the second parameter `flip` is an object that contains all the keyed children's bounding rects
obtained with [getBoundingClientRect](https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect).
This gives all the details need to perform FLIP based delta's and starting animation / transition points.

## Examples
* Example - [String Animation](https://rawgit.com/cavemansspa/mithril-flip/master/index.html)
* Example - [List Animation](https://flems.io/#0=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)
