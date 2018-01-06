'use strict';

var app = app || {};

(function(module) {

  const view = {};

  view.init_hello = () => {
    $('.container').hide();
    $('#hello').show();
  };

  view.init_goodbye = () => {
    $('.container').hide();
    $('#goodbye').show();
  };

  view.init_saywhat = () => {
    $('.container').hide();
    $('#saywhat').show();
  };

  module.view = view;

})(app);