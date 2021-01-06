//initialize all of our variables
var concat, gulp, gutil, sass, uglify, imagemin, minifyCSS, browserSync, autoprefixer, gulpSequence, shell, sourceMaps, plumber, clean;

var autoPrefixBrowserList = ['last 2 version', 'safari 5', 'ie 8', 'ie 9', 'opera 12.1', 'ios 6', 'android 4'];

//load all of our dependencies
//add more here if you want to include more libraries
gulp         = require('gulp');
concat       = require('gulp-concat');
gutil        = require('gulp-util');
uglify       = require('gulp-uglify');
sass         = require('gulp-sass');
sourceMaps   = require('gulp-sourcemaps');
imagemin     = require('gulp-imagemin');
minifyCSS    = require('gulp-minify-css');
browserSync  = require('browser-sync');
autoprefixer = require('gulp-autoprefixer');
gulpSequence = require('gulp-sequence').use(gulp);
shell        = require('gulp-shell');
plumber      = require('gulp-plumber');
clean        = require('gulp-clean');

gulp.task('browserSync', function() {
  browserSync.init({
    server: {
        baseDir: "app",
        index: "./index.html"
    },
    options: {
        reloadDelay: 250
    },
    notify: false,
    port: 8080,
    browser: ["google-chrome"]
  });
});

//compressing images & handle SVG files
gulp.task('images', function(tmp) {
  gulp.src(['app/images/*.jpg', 'app/images/*.png'])
    //prevent pipe breaking caused by errors from gulp plugins
    .pipe(plumber())
    .pipe(imagemin({ optimizationLevel: 5, progressive: true, interlaced: true }))
    .pipe(gulp.dest('app/images'));
});

//compressing images & handle SVG files
gulp.task('images-deploy', function() {
  gulp.src(['app/images/**/*'])
    //prevent pipe breaking caused by errors from gulp plugins
    .pipe(plumber())
    .pipe(gulp.dest('dist/images'));
});

//compiling our Javascripts
gulp.task('scripts', function() {
  //this is where our dev JS scripts are
  gulp.src(['app/scripts/*.js'])
  //prevent pipe breaking caused by errors from gulp plugins
  .pipe(plumber())
  //catch errors
  .on('error', gutil.log)
  //notify browserSync to refresh
  .pipe(browserSync.reload({stream: true}));
});

//compiling our Javascripts for deployment
gulp.task('scripts-deploy', function() {
  //this is where our dev JS scripts are
  return gulp.src(['app/scripts/*.js'])
  //prevent pipe breaking caused by errors from gulp plugins
  .pipe(plumber())
  //compress :D
  .pipe(uglify())
  //where we will store our finalized, compressed script
  .pipe(gulp.dest('dist/scripts'));
});

//compiling our SCSS files
gulp.task('styles', function() {
  //the initializer / master SCSS file, which will just be a file that imports everything
  return gulp.src('app/styles/sass/style.scss')
    //prevent pipe breaking caused by errors from gulp plugins
    .pipe(plumber({
        errorHandler: function (err) {
          console.log(err);
          this.emit('end');
        }
    }))
    //get sourceMaps ready
    .pipe(sourceMaps.init())
    //include SCSS and list every "include" folder
    .pipe(sass({
      errLogToConsole: true,
      includePaths: [
          'app/styles/sass/'
      ]
    }))
    .pipe(autoprefixer({
      browsers: autoPrefixBrowserList,
      cascade:  true
    }))
    //catch errors
    .on('error', gutil.log)
    //the final filename of our combined css file
    .pipe(concat('styles.css'))
    //get our sources via sourceMaps
    .pipe(sourceMaps.write())
    //where to save our final, compressed css file
    .pipe(gulp.dest('app/styles'))
    //notify browserSync to refresh
    .pipe(browserSync.reload({stream: true}));
});

//compiling our SCSS files for deployment
gulp.task('styles-deploy', function() {
  //the initializer / master SCSS file, which will just be a file that imports everything
  return gulp.src('app/styles/sass/style.scss')
    .pipe(plumber())
    //include SCSS includes folder
    .pipe(sass({
        includePaths: [
            'app/styles/scss',
        ]
    }))
    .pipe(autoprefixer({
        browsers: autoPrefixBrowserList,
        cascade:  true
    }))
    //the final filename of our combined css file
    .pipe(concat('styles.css'))
    .pipe(minifyCSS())
    //where to save our final, compressed css file
    .pipe(gulp.dest('dist/styles'));
});

//basically just keeping an eye on all HTML files
gulp.task('html', function() {
  // clean html generator
  gulp.src('app/*.html')
  //watch any and all HTML files and refresh when something changes
  .pipe(plumber())
  .pipe(browserSync.reload({stream: true}))
  //catch errors
  .on('error', gutil.log)
});

//migrating over all HTML files for deployment
gulp.task('html-deploy', function() {

  //grab everything, which should include htaccess, robots, etc
  gulp.src('app/*')
  //prevent pipe breaking caused by errors from gulp plugins
  .pipe(plumber())
  .pipe(gulp.dest('dist'));

  //grab any hidden files too
  gulp.src('app/.*')
  //prevent pipe breaking caused by errors from gulp plugins
  .pipe(plumber())
  .pipe(gulp.dest('dist'));

  //grab package json
  gulp.src('./*.json')
  //prevent pipe breaking caused by errors from gulp plugins
  .pipe(plumber())
  .pipe(gulp.dest('dist'));

  //grab Dockerfile
  gulp.src('./Dockerfile')
  //prevent pipe breaking caused by errors from gulp plugins
  .pipe(plumber())
  .pipe(gulp.dest('dist'));


  gulp.src('app/*.html')
  //prevent pipe breaking caused by errors from gulp plugins
  .pipe(plumber())
  .pipe(gulp.dest('dist/'));

  //grab all of the styles
  gulp.src(['app/styles/*.css', '!app/styles/styles.css'])
  //prevent pipe breaking caused by errors from gulp plugins
  .pipe(plumber())
  .pipe(gulp.dest('dist/styles'));
});

//cleans our dist directory in case things got deleted
gulp.task('clean', function() {
  return gulp.src('dist/', {read: false})
    .pipe(clean());
});

//create folders using shell
gulp.task('scaffold', function() {
  return shell.task([
    'mkdir dist',
    'mkdir dist/images',
    'mkdir dist/scripts',
    'mkdir dist/styles'
    ]
  );
});

//this is our master task when you run `gulp` in CLI / Terminal
//this is the main watcher to use when in active development
//  this will:
//  startup the web server,
//  start up browserSync
//  compress all scripts and SCSS files
gulp.task('default', ['browserSync', 'scripts', 'styles', 'html'], function() {
    //a list of watchers, so it will watch all of the following files waiting for changes
    gulp.watch('app/scripts/*.js', ['scripts']);
    gulp.watch('app/styles/sass/**', ['styles']);
    gulp.watch('app/images/**', ['images']);
    gulp.watch('app/*.html', ['html']);
});

//this is our deployment task, it will set everything for deployment-ready files
gulp.task('build', gulpSequence('clean', 'scaffold', ['scripts-deploy', 'styles-deploy', 'images-deploy'], 'html-deploy'));
