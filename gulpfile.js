const gulp = require('gulp');
const inject = require('gulp-inject');
const webserver = require('gulp-webserver');
const babel = require("gulp-babel");
const sass = require('gulp-sass');
sass.compiler = require('node-sass');
//minifying for the production version
const htmlclean = require('gulp-htmlclean');
const cleanCSS = require('gulp-clean-css');
const concat = require('gulp-concat');
const uglify = require('gulp-uglify');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync').create();
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
    srcSCSS: 'src/**/*.scss',
    srcCSS: 'src/**/*.css',
    srcJS: 'src/**/*.js', tmp: 'tmp',//tmp folder
    tmpIndex: 'tmp/index.html', //index.html in tmp folder
    tmpCSS: 'tmp/**/*.css', //css files in tmp folder
    tmpJS: 'tmp/**/*.js', //js files in tmp folder
    dev : 'dev',
    devCSS : 'dev/**/*.css',
    devJs : 'dev/**/*.js', dist:'dist', //js compiled files in dev
    distIndex: 'dist/index.html',
    distCSS: 'dist/**/*.css',
    distJS: 'dist/**/*.js'
};

gulp.task('hi', function(done){
    console.log('hi');
    done();
});
//setup all the task for html, scss and JS files
gulp.task('html', async function(){
    return gulp.src(paths.srcHTML).pipe(gulp.dest(paths.tmp));
});
//setup sass and convert to css before executing the css file;
gulp.task('sass', async function(){
    return gulp.src(paths.srcSCSS)
    .pipe(sass())
    .pipe(gulp.dest('./src'));
});

gulp.task('sass:watch', async function() {
    gulp.watch('./src/**/*.scss', gulp.series('build'));
});
//use autoprefixer for css
gulp.task('prefix', async ()=> {
    gulp.src(paths.srcCSS)
    .pipe(autoprefixer({
        cascade:false
    }))
    .pipe(gulp.dest(paths.dev));
});
//execute css after sass is executed and autoprefixer have been used

gulp.task('css', gulp.series('sass', 'prefix',function(){
    return gulp.src(paths.devCSS).pipe(gulp.dest(paths.tmp));
}));

gulp.task('js', async function(){
    return gulp.src(paths.devJs).pipe(gulp.dest(paths.tmp));
});
//combining all the tasks and running the all of them parallel because of async
gulp.task('copy',gulp.parallel('html','css','js'));
//computing the production version of the above dev files
gulp.task('html:dist', async function(){
    return gulp.src(paths.srcHTML)
    .pipe(htmlclean())
    .pipe(gulp.dest(paths.dist));
});
gulp.task('css:dist', async function(){
    return gulp.src(paths.devCSS)
    .pipe(concat('style.min.css'))
    .pipe(cleanCSS())
    .pipe(gulp.dest(paths.dist));
});
gulp.task('js:dist', async function(){
    return gulp.src(paths.devJs)
    .pipe(concat('script.min.js'))
    .pipe(uglify())
    .pipe(gulp.dest(paths.dist));
});
//use gulp inject for dev
gulp.task('inject', gulp.series('copy', function () {
    var css = gulp.src(paths.tmpCSS);
    var js = gulp.src(paths.tmpJS); //using es5 js from dev
    return gulp.src(paths.tmpIndex)
    .pipe(inject( css, { relative:true } ))
    .pipe(inject( js, { relative:true } ))
    .pipe(gulp.dest(paths.tmp));
}));
//lets build the es6 files to es5
gulp.task('build', async function() {
    return gulp.src(paths.srcJS)
    .pipe(babel())
    .pipe(gulp.dest(paths.dev));
});
gulp.task('js:watch', () => {
    gulp.watch('./**/*.js', gulp.series('build'));
});

//main task to run the server use, npm run gulp serve for dev
gulp.task('serve:dev', gulp.series('build', 'inject', function(){
    return gulp.src(paths.tmp)
    .pipe(webserver({
        port:3000,
        livereload: true
    }));
}));
//watch the serve for dev and run it before production
gulp.task('watch', gulp.series('serve:dev', function(){
    gulp.watch(paths.src,gulp.series('inject'));
}));
//to run the default gulp task
gulp.task('default',gulp.series('watch'));

//repeat the above steps for production version
gulp.task('copy:dist',gulp.parallel('html:dist','css:dist','js:dist'));
//gulp inject for production version
gulp.task('inject:dist', gulp.series('copy:dist', function () {
    var css = gulp.src(paths.distCSS);
    var js = gulp.src(paths.distJS); //using es5 js from dev
    return gulp.src(paths.distIndex)
    .pipe(inject( css, { relative:true } ))
    .pipe(inject( js, { relative:true } ))
    .pipe(gulp.dest(paths.dist));
}));
//run the production version
gulp.task('build:prod', gulp.series('inject:dist'));

//using browsersync for the above to watch changes in sass and javascript
gulp.task('browserSync', function(){
    browserSync.init({
        server:{
            baseDir:'src'
        }
    });
});
//browserSync for sass
gulp.task('sass:Sync', async function () {
    return gulp.src(paths.srcSCSS)
    .pipe(sass())
    .pipe(gulp.dest(paths.src))
    .pipe(browserSync.reload({
        stream: true
    }));
});
//browserSync for javascript
gulp.task('js:Sync', async function(){
    return gulp.src(paths.srcJS)
    .pipe(babel())
    .pipe(gulp.dest(paths.dev))
    .pipe(browserSync.reload({
        stream : true
    }));
});
//add gulp watch and browserSync
gulp.task('watch:Sync', gulp.series('browserSync','sass:Sync','js:Sync'), async function () {
    gulp.watch('./src/**/*.scss', gulp.series('sass:sync'));
    gulp.watch(paths.srcHTML, browserSync.reload);
    gulp.watch(paths.srcJS, browserSync.reload);
});