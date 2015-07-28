/* global UndoRedo: true */

/**
 * Undo-redo
 * @namespace
 */
UndoRedo = {};

/**
 * Undo-redo manager
 * @class
 */
UndoRedo.Manager = (function () {

    /**
     * @constructor
     * @param {Object} actions An object of actions to be registered upon initialization
     */
    function UndoRedoManager (actions) {
        this._actions = _.extend({}, actions);
        this._collection = new Meteor.Collection(null);
    }

    UndoRedoManager.DO = 'do';
    UndoRedoManager.UNDO = 'undo';

    /**
     * Registers a new action
     * @param {String} action The name of the action to be registered
     * @param {Object} eventHandlers An object with the event handlers (do, undo)
     */
    UndoRedoManager.prototype.registerAction = function (action, eventHandlers) {
        this._actions[action] = eventHandlers;
    };

    /**
     * Deregisters an action
     * @param {String} action The name of the action to be unregistered
     */
    UndoRedoManager.prototype.deregisterAction = function (action) {
        delete this._actions[action];
    };

    /**
     * Executing an action with parameters
     * @param {String} action The name of the action to be executed
     */
    UndoRedoManager.prototype.do = function (action) {
        var params = Array.prototype.slice.call(arguments, 1);

        var _id = this._collection.insert({
            action: action,
            params: {
                array: params
            },
            previousAction_id: this.previousAction_id
        });

        if (this.previousAction_id) {
            this._collection.update(this.previousAction_id, {
                $set: {
                    nextAction_id: _id
                }
            });
        }

        this.previousAction_id = _id;
        delete this.nextAction_id;

        return this._execute(action, UndoRedoManager.DO, params);
    };

    /**
     * Undo the previous action
     */
    UndoRedoManager.prototype.undo = function () {
        var previousAction = this.previousAction_id && this._collection.findOne(this.previousAction_id);

        if (!previousAction) {
            throw new Error('can not undo: no previous action');
        }

        this.previousAction_id = previousAction.previousAction_id;
        this.nextAction_id = previousAction._id;

        return this._execute(previousAction.action, UndoRedoManager.UNDO, previousAction.params.array);
    };

    /**
     * Redo the previously undone action
     */
    UndoRedoManager.prototype.redo = function () {
        var nextAction = this.nextAction_id && this._collection.findOne(this.nextAction_id);

        if (!nextAction) {
            throw new Error('can not redo: no next action');
        }

        this.previousAction_id = nextAction._id;
        this.nextAction_id = nextAction.nextAction_id;

        return this._execute(nextAction.action, UndoRedoManager.DO, nextAction.params.array);
    };

    UndoRedoManager.prototype._execute = function (action, event, params) {
        var actionEvents = this._actions[action];

        if (!actionEvents) {
            throw new Error('no such action: ' + action);
        }

        return actionEvents[event].apply(this, params);
    };

    return UndoRedoManager;
})();
