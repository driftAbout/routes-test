'use strict';

var app = app || {};

(function(module) {

  var linkRoutes = new Map();

  function linkRoute(...args){
    if(!args.length) return linkRoute_event_handlers();
    let [route, callback] = args;
    if(!callback){
      let ctx = {route: route};
      if (window.location.pathname !== route) history.pushState( ctx, null, route); 
      if (linkRoutes.has(route)) return linkRoutes.get(route)(ctx);
      let {callback, params} = regexGet(route);
      ctx.params = params;
      return callback(ctx);
    }
    if (!route.match(/:[^/]+/g)) return linkRoutes.set(route, callback);
    linkRoutes.set(route, {regex: route.replace(/:[^/]+/g, '[^/]+') , path_array: route.split(/\/:?/).filter(val=>val), callback: callback}); 
  }

  const regexGet = (route) => {
    for (let value of linkRoutes.values() ){
      let routeMatch = new RegExp(value.regex, 'g');
      if (value.regex && route.match(routeMatch)) {
        let callback = value.callback;
        let params = route.split(/\//).filter(val=>val).reduce((acc, cur, i) => {  
          if (cur !== value.path_array[i]) acc[value.path_array[i]] = cur;
          return acc;
        }, {} );
        return {callback: callback, params: params};
      }
    }
  };

  const regexHas = (route) => {
    if (linkRoutes.has(route)) return true;
    for (let value of linkRoutes.values() ){
      let routeMatch = new RegExp(value.regex, 'g');
      if (value.regex && route.match(routeMatch)) return true;
    }
    return false;
  };

  function linkRoute_event_handlers() {

    /*********** History popstate event  ***********/
    window.onpopstate = function (event){
      if(!event.state) return linkRoute('/');
      linkRoute(event.state.route);
    };

    /*********** <a> click event handler ***********/
    document.body.addEventListener('click', function(e){
      if (e.target.localName !== 'a' && !regexHas(e.target.pathname)) return;
      e.preventDefault();
      linkRoute(e.target.attributes.href.value);
    });

    /*********** window load event handler ***********/
    window.addEventListener('load', function(e) {
      if(regexHas(e.target.location.pathname) && e.target.location.pathname !== '/'){
        return linkRoute(event.target.location.pathname);
      }
      if(e.target.location.pathname !== '/') return history.pushState( {}, null, '/');
    });

  }

  module.linkRoute = linkRoute;
  // module.linkRoutes = linkRoutes;

})(app);

var Route = app.linkRoute;

Route('/', app.view.init_index);
Route('/hello', app.view.init_hello);
Route('/goodbye', app.view.init_goodbye);
Route('/saywhat', (ctx) => app.view.init_saywhat(ctx));
Route('/thisword/:word', (ctx) => console.log(ctx.params.word));
Route('/thisword/thatword/:words', (ctx) => console.log(ctx.params.words));
Route();