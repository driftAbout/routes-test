'use strict';

var app = app || {};

(function(module) {

  function Context(ctx_obj){
    this.target = ctx_obj.target;
    this.id = ctx_obj.id;
    this.class = ctx_obj.class;
    this.href = ctx_obj.href;
    this.route = '';
    this.ctx = {};
    this.create_context();
  }

  Context.prototype.create_context = function(){
    this.ctx.target = this.target || document.getElementById(this.id) || document.querySelector(`${this.class}[href="${this.href}"]`) || document.querySelector(`a[href="${this.href}"]`);
    this.ctx.target_attr = {
      href: this.ctx.target.attributes.href.value,
      id: this.ctx.target.id || '',
      class: this.ctx.target.className || ''
    };
  };

  var linkRoutes = new Map();

  function linkRoute(...args){
    if(!args.length) return linkRoute_event_handlers();
    let [route, callback] = args;
    if(!callback){
      let ctx = new Context(this).ctx;
      if (window.location.pathname !== route) history.pushState( {route: route, target_attr: ctx.target_attr}, null, route); 
      return linkRoutes.get(route)(ctx);
    }
    linkRoutes.set(route, callback);
  }

  function linkRoute_event_handlers() {

    /*********** History popstate event  ***********/
    window.onpopstate = function (event){
      if(!event.state) return linkRoute.call({href: '/'}, '/');
      linkRoute.call(event.state.target_attr, event.state.route);
    };

    /*********** <a> click event handler ***********/
    document.body.addEventListener('click', function(e){
      if (e.target.localName !== 'a' || !linkRoutes.has(e.target.pathname)) return;
      e.preventDefault();
      linkRoute.call({target: e.target}, e.target.attributes.href.value);
    });

    /*********** window load event handler ***********/
    window.addEventListener('load', function(e) {
      if(linkRoutes.has(e.target.location.pathname) && e.target.location.pathname !== '/'){
        return linkRoute.call({href: event.target.location.pathname}, event.target.location.pathname);
      }
      if(e.target.location.pathname !== '/') return history.pushState( {}, null, '/');
    });

  }

  module.linkRoute = linkRoute;

})(app);

var Route = app.linkRoute;

Route('/', app.view.init_index);
Route('/hello', app.view.init_hello);
Route('/goodbye', app.view.init_goodbye);
Route('/saywhat', (ctx) => app.view.init_saywhat(ctx));
Route();
