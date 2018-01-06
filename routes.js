'use strict';

const linkRoutes = new Map();

const linkRoute = (...args) => {
  if(!args) return;
  let [route, callback] = args;
  if(!callback) return linkRoutes.get(route)();
  linkRoutes.set(route, callback);
};

linkRoute('/', app.view.init_hello);
linkRoute('/goodbye', app.view.init_goodbye);
linkRoute('/sayWhat', app.view.init_saywhat);


/*********** History popstate event  ***********/
window.onpopstate = function (event){
  linkRoute(event.target.location.pathname);
};

/*********** <a> click event handler ***********/
document.body.addEventListener('click',  function(e){
  if (e.target.localName !== 'a' || !linkRoutes.get(e.target.pathname) ) return;
  console.log(e);
  e.preventDefault();
  history.pushState( {}, null, e.target.pathname);
  linkRoute(e.target.pathname);
});

/*********** window load event handler ***********/
window.addEventListener("load", function(e) {
  console.log(e);
  if(linkRoutes.has(e.target.location.pathname) && e.target.location.pathname !== '/') return linkRoute(event.target.location.pathname);
  if(e.target.location.pathname !== '/') return history.pushState( {}, null, '/');
});
