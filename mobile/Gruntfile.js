(function(){
  "use strict";
  
  /*global module : false */

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    uglify: {
      options: {
        banner: "/*! <%= pkg.name %> <%= grunt.template.today('yyyy-mm-dd') %> */\n"
      },
      build: {
        src: ["www/js/index.js",
              "www/js/jquery/jquery.js",
              "www/js/lodash/lodash.min.js",
              "www/js/lodash/lodash.string.min.js",
              "www/js/JST.js",
              "www/js/OGRE/ogre.js",
              "www/js/OGRE/ogre.ui.js"],
        dest: "www/js/<%= pkg.name %>.min.js"
      }
    },
    jst: {
      compile: {
        files: {
          "www/js/JST.js": [  "www/templates/**/*.html", 
                              "www/templates/**/*.ejs" ]
        }
      }
    }
  });

  // Load the plugin that provides the "uglify" task.
  grunt.loadNpmTasks("grunt-contrib-uglify");
  // Load the plugin that provides the "JST" task.
  grunt.loadNpmTasks("grunt-contrib-jst");

  // task(s).  
  grunt.registerTask("default", ["jst"]);
  grunt.registerTask("prod", ["jst", "uglify"]);
};

}());