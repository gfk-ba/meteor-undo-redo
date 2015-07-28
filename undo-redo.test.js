/* global UndoRedo: false */
/* jshint expr: true */

describe('UndoRedo', function () {
    var sandbox;

    beforeEach(function () {
        sandbox = sinon.sandbox.create();
    });

    afterEach(function () {
        sandbox.restore();
    });

    describe('Manager', function () {
        describe('#constructor', function () {
            it('Should register passed actions', function () {
                var count = 0,
                    actions = {
                        add: {
                            'do': function (n) {
                                count = count + n;
                            },
                            undo: function (n) {
                                count = count - n;
                            }
                        },
                        subtract: {
                            'do': function (n) {
                                count = count - n;

                                return count;
                            },
                            undo: function (n) {
                                count = count + n;
                            }
                        }
                    };

                var manager = new UndoRedo.Manager(actions);

                manager.do('add', 2);
                expect(count).to.equal(2);

                manager.do('subtract', 1);
                expect(count).to.equal(1);
            });
        });

        describe('#registerAction', function () {
            it('Should register an action', function () {
                var count = 0,
                    manager = new UndoRedo.Manager();

                manager.registerAction('add', {
                    'do': function (n) {
                        count = count + n;
                    },
                    undo: function (n) {
                        count = count - n;
                    }
                });

                manager.do('add', 2);
                expect(count).to.equal(2);
            });
        });

        describe('#deregisterAction', function () {
            it('Should deregister an action', function () {
                var count = 0,
                    actions = {
                        add: {
                            'do': function (n) {
                                count = count + n;
                            },
                            undo: function (n) {
                                count = count - n;
                            }
                        }
                    };

                var manager = new UndoRedo.Manager(actions);

                manager.do('add', 2);
                expect(count).to.equal(2);

                manager.deregisterAction('add');

                expect(function () {
                    manager.do('add', 1);
                }).to.throw(Error, 'no such action: add');
                expect(count).to.equal(2);
            });
        });

        describe('#do', function () {
            it('Should execute the action with parameters', function () {
                var count = 0,
                    actions = {
                        add: {
                            'do': sandbox.spy(function (n) {
                                count = count + n;

                                return count;
                            }),
                            undo: sandbox.spy(function (n) {
                                count = count - n;

                                return count;
                            })
                        }
                    },
                    manager = new UndoRedo.Manager(actions);

                var result = manager.do('add', 1);

                expect(count).to.equal(1);
                expect(result).to.equal(count);
                expect(actions.add.do).to.have.been.calledOnce;
                expect(actions.add.do).to.have.been.calledWithExactly(1);
                expect(actions.add.undo).to.not.have.been.called;
            });
        });

        describe('#undo', function () {
            var count,
                actions,
                manager;

            beforeEach(function () {
                count = 0;
                actions = {
                    add: {
                        'do': sandbox.spy(function (n) {
                            count = count + n;

                            return count;
                        }),
                        undo: sandbox.spy(function (n) {
                            count = count - n;

                            return count;
                        })
                    }
                };
                manager = new UndoRedo.Manager(actions);
            });

            describe('When there is no previous action', function () {
                it('Should throw error', function () {
                    expect(function () {
                        manager.undo();
                    }).to.throw(Error, 'can not undo: no previous action');

                    expect(actions.add.undo).to.not.have.been.called;
                });
            });

            describe('When there is a previous action', function () {
                it('Should execute the undo event of the previous action', function () {
                    manager.do('add', 2);

                    var result = manager.undo();

                    expect(actions.add.undo).to.have.been.calledOnce;
                    expect(actions.add.undo).to.have.been.calledWithExactly(2);

                    expect(count).to.equal(0);
                    expect(result).to.equal(count);
                });
            });

            describe('When calling after redo', function () {
                it('Should undo again', function () {
                    manager.do('add', 2);

                    manager.undo();

                    manager.redo();

                    manager.undo();

                    expect(actions.add.do).to.have.been.calledTwice;
                    expect(actions.add.do).to.have.been.calledWithExactly(2);
                    expect(actions.add.undo).to.have.been.calledTwice;
                    expect(actions.add.undo).to.have.been.calledWithExactly(2);

                    expect(count).to.equal(0);
                });
            });
        });

        describe('#redo', function () {
            var count,
                actions,
                manager;

            beforeEach(function () {
                count = 0;
                actions = {
                    add: {
                        'do': sandbox.spy(function (n) {
                            count = count + n;

                            return count;
                        }),
                        undo: sandbox.spy(function (n) {
                            count = count - n;

                            return count;
                        })
                    }
                };
                manager = new UndoRedo.Manager(actions);
            });

            describe('When there is no next action', function () {
                it('Should throw error', function () {
                    manager.do('add', 2);

                    expect(function () {
                        manager.redo();
                    }).to.throw(Error, 'can not redo: no next action');

                    expect(actions.add.do).to.have.been.calledOnce;
                    expect(actions.add.do).to.have.been.calledWithExactly(2);

                    expect(count).to.equal(2);
                });
            });

            describe('When there is next action', function () {
                it('Should execute the redo event of the next action', function () {
                    manager.do('add', 2);

                    manager.undo();
                    var result = manager.redo();

                    expect(actions.add.do).to.have.been.calledTwice;
                    expect(actions.add.do).to.have.been.calledWithExactly(2);

                    expect(count).to.equal(2);
                    expect(result).to.equal(count);
                });
            });

            describe('When there is a new action after an undo', function () {
                it('Should not execute the redo event of the old next action', function () {
                    manager.do('add', 2);

                    manager.undo();

                    manager.do('add', 4);

                    expect(function () {
                        manager.redo();
                    }).to.throw(Error, 'can not redo: no next action');

                    expect(actions.add.do).to.have.been.calledTwice;
                    expect(actions.add.do).to.have.been.calledWithExactly(2);
                    expect(actions.add.do).to.have.been.calledWithExactly(4);

                    expect(count).to.equal(4);
                });
            });

            describe('When there is a new action after an undo and calling undo and redo again', function () {
                it('Should execute the redo event of the new next action', function () {
                    manager.do('add', 2);

                    manager.undo();

                    manager.do('add', 4);

                    manager.undo();

                    manager.redo();

                    expect(actions.add.do).to.have.been.calledThrice;
                    expect(actions.add.do).to.have.been.calledWithExactly(2);
                    expect(actions.add.do).to.have.been.calledWithExactly(4);

                    expect(count).to.equal(4);
                });
            });
        });
    });
});
