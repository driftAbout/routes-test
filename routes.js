'use strict';

var linkRoutes = new Map();

function linkRoute(...args){
  if(!args.length) return linkRoute_event_handlers();
  let [route, callback] = args;
  if(!callback) return linkRoutes.get(route)();
  linkRoutes.set(route, callback);
}

function linkRoute_event_handlers() {

  /*********** History popstate event  ***********/
  window.onpopstate = function (event){
    linkRoute(event.target.location.pathname);
  };

  /*********** <a> click event handler ***********/
  document.body.addEventListener('click', function(e){
    if (e.target.localName !== 'a' || !linkRoutes.has(e.target.pathname)) return;
    e.preventDefault();
    history.pushState( {}, null, e.target.pathname);
    linkRoute(e.target.pathname);
  });

  /*********** window load event handler ***********/
  window.addEventListener('load', function(e) {
    if(linkRoutes.has(e.target.location.pathname) && e.target.location.pathname !== '/') return linkRoute(event.target.location.pathname);
    if(e.target.location.pathname !== '/') return history.pushState( {}, null, '/');
  });

}

linkRoute('/', app.view.init_index);
linkRoute('/hello', app.view.init_hello);
linkRoute('/goodbye', app.view.init_goodbye);
linkRoute('/saywhat', app.view.init_saywhat);
linkRoute();