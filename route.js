'use strict';

var app = app || {};

(function(module) {

  //object to store route callbacks
  var linkRoutes = new Map();

  // variable to store home path depending on dev or production environment
  var base;

  function linkRoute(...args){
    //the function needs to be called with out args to activate
    //if there are no args, then activate the event handlers
    if(!args.length) return init_event_handlers();
    //set variables for the first two arguments
    let [route, callback] = args;
    //if there is only one argument, assume it is a route
    //callback will be undefined so use the route as the key to fetch the callback from the linkRoutes Map
    if(!callback){
      //getRoute returns an object with a function reference, ctx object, and history option
      //if the route has parameters, the object will contain the parameter values
      let {callback, ctx, historyOpt} = getRoute(route);
      //if the returned callback for a route is undefined, a route was not found, so do nothing
      if(!callback) return;
      //the base, if defined, is only needed for the url in the history state
      let url = base ? `${base}${route}` : route;
      //if a callback was found for a route, set the history state
      //if the route was called from the popstate event, the pathname and route will be the same so don't set the history state again
      if (window.location.pathname !== url && historyOpt) history.pushState( ctx, null, url);
      //invoke the callback function with the object as an argument
      return callback(ctx);
    }
    //if there were at least two arguments, route and callback, set the properties in the linkRoutes map object
    setRoute.call(args);
  }

  //method to set the base variable => route.base('/myGitHUbRepoName')
  linkRoute.base = function(link_base) {
    base = link_base;
  };

  const getRoute = (route) => {
    //create an object with the route
    //even if the callback doesn't require an object, it is used with the history state
    let ctx = {route: route};
    //if the route does not have parameters, it will have a direct match accessible with standard Map methods
    if (linkRoutes.has(route)) return Object.assign(linkRoutes.get(route), {ctx: ctx});
    //if there was not a direct match, check the route with regex against routes with parameters
    let value = searchRoutes(route);
    //if no match was found, return an empty object
    if(!value) return {};
    //if a match was found, get the callback function reference from the object
    let callback = value.callback;
    //if a match was found using regex, it means the route had parameters
    //the values of the parameters need to be extracted and added to the ctx object as key value pairs
    //split the called route on "/" into an array
    let route_path_array = route.split(/\//).filter(val=>val);
    //use reduce to compare each part of the called route to the array of the stored route with parameters
    // called route: '/users/23' => ['users', 23]
    //stored route: '/users/:id' => ['users', 'id']
    //params is a key value pair where the path parts do not match i.e. 'id' !== '23' => {id: 23}
    let params = route_path_array.reduce((acc, cur, i) => {
      if (cur !== value.path_array[i]) acc[value.path_array[i]] = cur;
      return acc;
    }, {} );
    ctx.params = params;
    return {callback: callback, ctx: ctx, historyOpt: value.historyOpt};
  };

  function setRoute(){
    let [route, callback] = this;
    let historyOpt = this.length === 2 ? true : this[2];
    //if the route does not contain a parameter, no /:something/, use the Map set method with the route as key and callback as value
    if (!route.match(/:[^/]+/g)) return linkRoutes.set(route, {callback: callback, historyOpt: historyOpt});
    //if the route has a parameter, use the route as key and create a regex expression and array, for comparison for searching, as value
    linkRoutes.set(route, {regex: route.replace(/:[^/]+/g, '[^/]+') , path_array: route.split(/\/:?/).filter(val=>val), callback: callback, historyOpt: historyOpt});
  }

  const hasRoute = (route) => {
    //check for a direct match for a route 
    if (linkRoutes.has(route)) return true;
    //check for a regex match
    if (searchRoutes(route)) return true;
    return false;
  };

  const searchRoutes = (route) => {
    //loop through each value in the linkRoutes Map 
    //use the stored regex, value.regex to see if the called route exists
    for (let value of linkRoutes.values() ){
      let routeMatch = new RegExp(value.regex + '$', 'g');
      if (value.regex && route.match(routeMatch) ) return value;
    }
    return false;
  };

  //set the popstate, click and load handlers
  function init_event_handlers() {

    /*********** History popstate event  ***********/
    window.onpopstate = function (event){
      //if the state is undefined, route to home
      if(!event.state) return linkRoute('/');
      //use the route property of the history state as the route
      linkRoute(event.state.route);
    };

    /*********** <a> click event handler ***********/
    document.body.addEventListener('click', function(e){
    // if the clicked item in the body is not <a> and the target.pathname is a saved route,  prevent default and invoke the callback
      if (e.target.localName !== 'a' || !hasRoute(e.target.pathname)) return;
      e.preventDefault();
      linkRoute(e.target.attributes.href.value);
    });

    /*********** window load event handler ***********/
    //if the page reloads and has been redirected to the home page, check the url to se if it matches
    //if it doesn't invoke the callback for that route
    window.addEventListener('load', function(e) {
      let referrerRoute = e.target.location.pathname;
      if( e.target.referrer ){
        referrerRoute = e.target.referrer.replace(e.target.baseURI, '/');
      }
      if(hasRoute(referrerRoute) && referrerRoute !== '/'){
        return linkRoute(referrerRoute);
      }
      //if the path is not the home path or a path saved as a route, then redirect to the home
      let url = base ? `${base}/` : '/';
      if(e.target.location.pathname !== '/') return history.pushState( {}, null, url);
    });

  }

  module.linkRoute = linkRoute;
 
})(app);

var route = app.linkRoute;
