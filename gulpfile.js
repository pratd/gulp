var gulp = require('gulp');
var inject = require('gulp-inject');
//the commented code is part of testing gulp
// async function defaultTask(cb) {
//     // place code for your default task here
//     console.log('hi');
// }

// exports.default = defaultTask;

//the above is used to test if gulp works
//the following task is for the question of pill, to print hi

//In the following we will place the source file paths for our project
var paths = {
    src: 'src/**/*',
    srcHTML: 'src/**/*.html',
    srcCSS: 'src/**/*.scss',
    srcJS: 'src/**/*.js', tmp: 'tmp',//tmp folder
    tmpIndex: 'tmp/index.html', //index.html in tmp folder
    tmpCSS: 'tmp/**/*.scss', //css files in tmp folder
    tmpJS: 'tmp/**/*.js' //js files in tmp folder
};gulp.task('hi', async function(){
    console.log('hi');
});
//setup all the task for html, scss and JS files
gulp.task('html', async function(){
    return gulp.src(paths.srcHTML).pipe(gulp.dest(paths.tmp));
});
gulp.task('css', async function(){
    return gulp.src(paths.srcCSS).pipe(gulp.dest(paths.tmp));
});
gulp.task('js', async function(){
    return gulp.src(paths.srcJS).pipe(gulp.dest(paths.tmp));
});
//combining all the tasks and running the all of them parallel because of async
gulp.task('copy',gulp.parallel('html','css','js'));