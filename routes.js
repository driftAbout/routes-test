'use strict';

var linkRoutes = new Map();

function linkRoute(...args){
  let ctx = this || {}; 
  console.log('ctx:', ctx);
  if(!args.length) return linkRoute_event_handlers();
  let [route, callback] = args;
  if(!callback){
    if (window.location.pathname !== route) history.pushState( {route: route, target_attr: ctx.target_attr}, null, route); 
    return linkRoutes.get(route)(ctx);
  } 
  linkRoutes.set(route, callback);
}

function linkRoute_event_handlers() {

  /*********** History popstate event  ***********/
  window.onpopstate = function (event){
    let {id, href} = event.state.target_attr;
    let el = document.getElementById(id) || document.querySelector(`a[href="${href}"]`);
    let ctx = {
      target_attr: event.state.target_attr,
      target: el
    };
    linkRoute.call(ctx, event.state.route);
  };

  /*********** <a> click event handler ***********/
  document.body.addEventListener('click', function(e){
    if (e.target.localName !== 'a' || !linkRoutes.has(e.target.pathname)) return;
    e.preventDefault();
    let ctx = {
      target_attr: {
        href: e.target.attributes.href.value,
        id: e.target.id || '',
        class: e.target.className || ''
      },
      target: e.target
    };

    linkRoute.call(ctx, e.target.pathname);
  });

  /*********** window load event handler ***********/
  window.addEventListener('load', function(e) {
    console.log('load:', e);
    if(linkRoutes.has(e.target.location.pathname) && e.target.location.pathname !== '/'){
      let target = document.querySelector(`a[href="${e.target.location.pathname}"]`);
      let ctx = {
        target_attr: {
          href: target.attributes.href.value || '',
          id: target.id || '',
          class: e.target.className || ''
        },
        target: target
      };
      return linkRoute.call(ctx, event.target.location.pathname);
      //return linkRoute(event.target.location.pathname);
    }
    if(e.target.location.pathname !== '/') return history.pushState( {}, null, '/');
  });

}

linkRoute('/', app.view.init_index);
linkRoute('/hello', app.view.init_hello);
linkRoute('/goodbye', app.view.init_goodbye);
linkRoute('/saywhat', (ctx) => app.view.init_saywhat(ctx));
linkRoute();