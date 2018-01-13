'use strict';

(function(){
  //set base if the project is served from git hub pages
  if (window.location.host.indexOf('github.io') !== -1) route.base('/book-list-client');

  //create a watched route
  //route(path, callback) or route(path, callback, browserHistory)
  //browserHistory defaults as true and the path will be added to the browser history
  //route(path, callback, false) => adding false as the last argument will keep this path out of the history
  route('/', app.view.init_index);
  route('/hello', app.view.init_hello);
  route('/goodbye', app.view.init_goodbye);
  route('/saywhat', (ctx) => app.view.init_saywhat(ctx));
  route('/thisword/:word', (ctx) => console.log(ctx.params.word), false);
  route('/thisword/thatword/:words', (ctx) => console.log(ctx.params.words));
  route();

})();