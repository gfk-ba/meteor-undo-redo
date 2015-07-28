gfk:undo-redo [![Build Status](https://travis-ci.org/gfk-ba/meteor-undo-redo.svg)](https://travis-ci.org/gfk-ba/meteor-undo-redo)
=============

An add-on Meteor package for undoing, redoing actions on the client.


## Installation

In a Meteor app directory, enter:

```bash
$ meteor add gfk:undo-redo
```

## Usage

Create an UndoRedo.Manager and register the actions.

```js
var manager = new UndoRedo.Manager();

var count = 0;

manager.registerAction('increase', {
    'do': function (n) {
        count = count + n;

        return count;
    },
    undo: function (n) {
        count = count - n;

        return count;
    }
});
```

You can also register actions upon initialization.

```js
var count = 0;

var manager = new UndoRedo.Manager({
    increase: {
        'do': function (n) {
            count = count + n;

            return count;
        },
        undo: function (n) {
            count = count - n;

            return count;
        }
    }
});
```

You can do some action.

```js
var result = manager.do('increase', 5);
```

And then you can change your mind.

```js
var result = manager.undo();
```

And then maybe you can change your mind again and redo it.

```js
var result = manager.redo();
```

It is possible to deregister actions you don't need anymore.

```js
manager.deregisterAction('increase');
```
