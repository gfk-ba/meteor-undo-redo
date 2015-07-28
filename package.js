Package.describe({
    summary: 'Undo-redo actions on the client',
  	version: '0.0.1',
    name: 'gfk:undo-redo',
    documentation: 'README.md',
    git: 'https://github.com/gfk-ba/meteor-undo-redo.git'
});

Package.onUse(function(api) {
    api.addFiles([
        'undo-redo.js'
    ], 'client');

    api.export('UndoRedo');
});

Package.onTest(function(api) {
    api.use([
        'mike:mocha-package@0.5.6',
        'practicalmeteor:sinon',
        'practicalmeteor:chai',
        'gfk:undo-redo'
    ]);

    api.addFiles([
        'undo-redo.test.js'
    ], 'client');
});
