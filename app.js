'use strict';

var app = app || {};

(function(module) {

  const view = {};

  view.init_index = () => {
    $('.container').hide();
  };

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

  $('h2').on('click', () => linkRoute('/'));

})(app);