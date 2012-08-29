/*!
 * Prefixr mixin for Chocolat
 * Copyright(c) 2012 Nicholas Penree <nick@penree.com>
 * MIT Licensed
 */

/**
 * Module dependencies.
 */

var http = require('http');

/**
 * Hook up menu items.
 */

Hooks.addMenuItem('Actions/CSS/Prefixize', 'control-command-shift-x', function() {
  var output = '', sel, text;
  
  Recipe.run(function(recipe) {
    sel = (!recipe.selection.length)? new Range(0, recipe.length) : recipe.selection;
    text = recipe.textInRange(sel);
    
    if (!text || Document.current().rootScope() !== 'css.source') {
      Alert.beep();
      return;
    }
    
    var req = http.request({
      host: 'prefixr.com',
      port: 80,
      path: '/api/index.php?css=' + encodeURIComponent(text)
    }, function(res) {      
      res.setEncoding('utf8');
      
      res.on('data', function (chunk) {
        output += chunk;
      });
      
      res.on('end', function() {
        if (res.statusCode === 200 && output) {
          Recipe.run(function(r) {
            r.replaceTextInRange(sel, output);
          });
        }
      });
    });
    
    req.on('error', function(err) {
      Alert.show('Unable to contact the Prefixr service.', err.message, ['OK']);
      Alert.beep();
    });
    
    req.end();
    
    return undefined;
  });
});