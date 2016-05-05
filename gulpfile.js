var gulp = require('gulp');

gulp.task('default', function() {
    // place code for your default task here
});

// Define base folders
var src = 'src/';
var dest = 'dist/';
// Include plugins
var jsmin = require('gulp-jsmin');
var rename = require('gulp-rename');
//var imagemin = require('gulp-imagemin');
var cssnano = require('gulp-cssnano');
var htmlmin = require('gulp-htmlmin');
//var imageResize = require('gulp-image-resize');


gulp.task('imagesize', function() {
    gulp.src('images/**/*')
        .pipe(imageResize({
            width: 150,
            height: 100,
            crop: true,
            upscale: false
        }))
        .pipe(gulp.dest('../dist/images'));
});

gulp.task('imagesize2', function() {
    gulp.src('views/images/**/*')
        .pipe(imageResize({
            width: 150,
            height: 100,
            crop: true,
            upscale: false
        }))
        .pipe(gulp.dest('../dist/views/images'));
});


// Concatenate & Minify JS
gulp.task('js', function() {
    gulp.src('src/js/*.js')
        .pipe(jsmin())
        .pipe(gulp.dest('dist/js/'));
});

gulp.task('js2', function() {
    gulp.src('views/js/*.js')
        .pipe(jsmin())
        .pipe(gulp.dest('dist/views/js/'));
});

gulp.task('css', function() {
    return gulp.src('src/css/*.css')
        .pipe(cssnano())
        .pipe(gulp.dest('dist/css/'));
});

gulp.task('css2', function() {
    return gulp.src('views/css/*.css')
        .pipe(cssnano())
        .pipe(gulp.dest('dist/views/css/'));
});

gulp.task('html2', function() {
    return gulp.src('views/*.html')
        .pipe(htmlmin())
        .pipe(gulp.dest('dist/views/'));
});

gulp.task('html', function() {
    return gulp.src('src/*.html')
        .pipe(htmlmin())
        .pipe(gulp.dest('dist'));
});

gulp.task('images', function() {
    return gulp.src('images/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            //use: [pngquant()]
        }))
        .pipe(gulp.dest('../dist/images'));
});

gulp.task('images2', function() {
    return gulp.src('views/images/**/*')
        .pipe(imagemin({
            progressive: true,
            svgoPlugins: [{
                removeViewBox: false
            }],
            //use: [pngquant()]
        }))
        .pipe(gulp.dest('../dist/views/images/'));
});
// Watch for changes in files
//.task('watch', function() {
// Watch .js files
//gulp.watch(src + 'js/*.js', ['js']);
// Watch .scss files
//gulp.watch(src + 'css/*.css', ['css']);
// Watch image files
//gulp.watch(src + 'images/**/*', ['images']);
//  gulp.watch(src + '*.html', ['html']);
//});
// Default Task
gulp.task('default', ['js', 'css', 'html']);