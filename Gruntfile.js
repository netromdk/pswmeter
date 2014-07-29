module.exports = function(grunt) {
  grunt.initConfig({
  	"pkg" : grunt.file.readJSON("package.json"),

  	"uglify" : {
  	  "my_target" : {
  	  	"files" : {
  	  	  "psw.min.js" : "psw.js"
  	  	}
  	  }
  	}
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTasks("compile", ["uglify"]);
}