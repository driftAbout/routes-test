'use strict';

var app = app || {};

(function(module) {

  var linkRoutes = new Map();

  function linkRoute(...args){
    if(!args.length) return linkRoute_event_handlers();
    let [route, callback] = args;
    if(!callback){
      let {callback, ctx} = getRoute(route);
      if(!callback) return;
      if (window.location.pathname !== route) history.pushState( ctx, null, route);
      return callback(ctx);
    }
    setRoute.call(route, callback);
  }

  const getRoute = (route) => {
    let ctx = {route: route};
    if (linkRoutes.has(route)) return {callback: linkRoutes.get(route), ctx: ctx};
    let value = searchRoutes(route);
    if(!value) return {};
    let callback = value.callback;
    let route_path_array = route.split(/\//).filter(val=>val);
    let params = route_path_array.reduce((acc, cur, i) => {
      if (cur !== value.path_array[i]) acc[value.path_array[i]] = cur;
      return acc;
    }, {} );
    ctx.params = params;
    return {callback: callback, ctx: ctx};
  };

  function setRoute(callback){
    if (!this.match(/:[^/]+/g)) return linkRoutes.set(this, callback);
    linkRoutes.set(this, {regex: this.replace(/:[^/]+/g, '[^/]+') , path_array: this.split(/\/:?/).filter(val=>val), callback: callback});
  }

  const hasRoute = (route) => {
    if (linkRoutes.has(route)) return true;
    if (searchRoutes(route)) return true;
    return false;
  };

  const searchRoutes = (route) => {
    for (let value of linkRoutes.values() ){
      let routeMatch = new RegExp(value.regex + '$', 'g');
      if (value.regex && route.match(routeMatch) ) return value;
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
      if (e.target.localName !== 'a' && !hasRoute(e.target.pathname)) return;
      e.preventDefault();
      linkRoute(e.target.attributes.href.value);
    });

    /*********** window load event handler ***********/
    window.addEventListener('load', function(e) {
      if(hasRoute(e.target.location.pathname) && e.target.location.pathname !== '/'){
        return linkRoute(event.target.location.pathname);
      }
      if(e.target.location.pathname !== '/') return history.pushState( {}, null, '/');
    });

  }

  module.linkRoute = linkRoute;
  module.linkRoutes = linkRoutes;

})(app);

var Route = app.linkRoute;

Route('/', app.view.init_index);
Route('/hello', app.view.init_hello);
Route('/goodbye', app.view.init_goodbye);
Route('/saywhat', (ctx) => app.view.init_saywhat(ctx));
Route('/thisword/:word', (ctx) => console.log(ctx.params.word));
Route('/thisword/thatword/:words', (ctx) => console.log(ctx.params.words));
Route();