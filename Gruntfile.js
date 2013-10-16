module.exports = function(grunt) {

    // Project configuration.
    grunt.initConfig({
        pkg: grunt.file.readJSON('package.json'),
        concat: {
            options: {
                separator: '\n\n',
                stripBanners: true,
                banner: '// <%= pkg.name %> <%= pkg.version %> | (c) <%= grunt.template.today("yyyy") %> Ryan Niemeyer |  http://www.opensource.org/licenses/mit-license\n'
            },
            dist: {
                src: ['src/intro.txt', 'src/utilities.js', 'src/amdBindings.js', 'src/amdTemplateEngine.js', 'src/outro.txt'],
                dest: 'build/<%= pkg.name %>.js'
            }
        },
        uglify: {
            options: {
                stripBanners: true,
                banner: '// <%= pkg.name %> <%= pkg.version %> | (c) <%= grunt.template.today("yyyy") %> Ryan Niemeyer |  http://www.opensource.org/licenses/mit-license\n'
            },
            build: {
                src: 'build/<%= pkg.name %>.js',
                dest: 'build/<%= pkg.name %>.min.js'
            }
        },
        jshint: {
            src: {
                files: {
                    src: ["src/**/*.js"]
                }
            }
        },
        watch: {
            scripts: {
                files: ['src/*.*'],
                tasks: ['default'],
                options: {
                    nospawn: true
                }
            }
        }
    });

    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-uglify');
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks('grunt-contrib-watch');

    // Default task(s).
    grunt.registerTask('default', ['jshint', 'concat', 'uglify']);

};