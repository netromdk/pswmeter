module.exports = function(grunt) {
  grunt.initConfig({
  	"pkg" : grunt.file.readJSON("package.json"),

  	uglify : {
  	  my_target : {
  	  	options : {
  	  	  banner : "// pswmeter @ https://github.com/netromdk/pswmeter (MIT License)\n"
  	  	},
  	  	files : {
                  "dist/psw.min.js" : "src/psw.js"
  	  	}
  	  }
  	}
  });

  grunt.loadNpmTasks("grunt-contrib-uglify");

  grunt.registerTask("compile", ["uglify"]);
}
