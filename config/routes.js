/**
 * Route Mappings
 * (sails.config.routes)
 *
 * Your routes map URLs to views and controllers.
 *
 * If Sails receives a URL that doesn't match any of the routes below,
 * it will check for matching files (images, scripts, stylesheets, etc.)
 * in your assets directory.  e.g. `http://localhost:1337/images/foo.jpg`
 * might match an image file: `/assets/images/foo.jpg`
 *
 * Finally, if those don't match either, the default 404 handler is triggered.
 * See `config/404.js` to adjust your app's 404 logic.
 *
 * Note: Sails doesn't ACTUALLY serve stuff from `assets`-- the default Gruntfile in Sails copies
 * flat files from `assets` to `.tmp/public`.  This allows you to do things like compile LESS or
 * CoffeeScript for the front-end.
 *
 * For more information on configuring custom routes, check out:
 * http://sailsjs.org/#/documentation/concepts/Routes/RouteTargetSyntax.html
 */

module.exports.routes = {

  /***************************************************************************
  *                                                                          *
  * Make the view located at `views/homepage.ejs` (or `views/homepage.jade`, *
  * etc. depending on your default view engine) your home page.              *
  *                                                                          *
  * (Alternatively, remove this and add an `index.html` file in your         *
  * `assets` directory)                                                      *
  *                                                                          *
  ***************************************************************************/

  '/': {
    controller: 'session',
    action : "new"
  },
  '/create': {
    controller: 'session',
    action : "create"
  },
  "/signout" :{
    controller: 'session',
    action : "destroy"
  },

  'get /public/files/*': function(req, res, next) {
    return res.sendfile(sails.config.appPath+req.path);
  },
  "post /element/create?" : "elementController.create",
  "get /element/create?" : function(req, res, next){
    return res.forbidden();
  },
  "put /element/create?" : function(req, res, next){
    return res.forbidden();
  },
  "delete /element/create?" : function(req, res, next){
    return res.forbidden();
  },

  "put /work/updateElementTask/:id?" : "workController.updateElementTask",
  "get /work/updateElementTask?" : function(req, res, next){
    return res.forbidden();
  },
  "post /work/updateElementTask?" : function(req, res, next){
    return res.forbidden();
  },
  "delete /work/updateElementTask?" : function(req, res, next){
    return res.forbidden();
  },

  "get /work" : function(req, res, next){
    if(req.isSocket){
      return Work.watch(req.socket);  
    }
    return next();
  },
  "get /worker" : function(req, res, next){
    if(req.isSocket){
      return Worker.watch(req.socket);  
    }
    return next();
  },
  "get /workschedule" : function(req, res, next){
    if(req.isSocket){
      return WorkSchedule.watch(req.socket);  
    }
    return next();
  }

  /***************************************************************************
  *                                                                          *
  * Custom routes here...                                                    *
  *                                                                          *
  *  If a request to a URL doesn't match any of the custom routes above, it  *
  * is matched against Sails route blueprints. See `config/blueprints.js`    *
  * for configuration options and examples.                                  *
  *                                                                          *
  ***************************************************************************/

};
