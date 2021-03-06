"use strict";

var gulp = require("gulp");
var sass = require("gulp-sass");
var plumber = require("gulp-plumber");
var minify = require("gulp-csso");
var imagemin = require("gulp-imagemin");
var postcss = require("gulp-postcss");
var autoprefixer = require("autoprefixer");
var mqpacker = require("css-mqpacker");
var svgstore = require("gulp-svgstore");
var svgmin = require("gulp-svgmin");
var server = require("browser-sync").create();
var rename = require("gulp-rename");
var gulpSequence = require("gulp-sequence");
var del = require("del");

gulp.task("style", function() {
  gulp.src("sass/style.scss")
    .pipe(plumber())
    .pipe(sass())
    .pipe(postcss([
      autoprefixer({browsers: [
        "last 2 versions"
      ]}),
      mqpacker({
        sort: false
      })
    ]))
    .pipe(gulp.dest("build/css"))
    .pipe(minify())
    .pipe(rename("style.min.css"))
    .pipe(gulp.dest("build/css"))
    .pipe(server.stream())
});

gulp.task("imagemin", function () {
  return gulp.src("build/img/**/*.{png,jpg,gif}")
    .pipe(imagemin([
      imagemin.jpegtran({progressive: true}),
      imagemin.optipng({optimizationLevel: 3})
    ]))
    .pipe(gulp.dest("build/img"))
});

gulp.task("symbols", function () {
  return gulp.src("build/img/icons/*.svg")
    .pipe(svgmin())
    .pipe(svgstore({
      inlineSvg: true
    }))
    .pipe(rename("symbols.svg"))
    .pipe(gulp.dest("build/img"))
})

// Copy all html's files and paste in "build" folder.
gulp.task("html:copy", function () {
  return gulp.src("*.html")
    .pipe(gulp.dest("build"));
});

gulp.task("html:update", ["html:copy"], function (done) {
  server.reload();
  done();
})

// Copy all js's files and paste in "build" folder.
gulp.task("js:copy", function () {
  return gulp.src("js/**/*.js")
    .pipe(gulp.dest("build/js"));
});

gulp.task("js:update", ["js:copy"], function (done) {
  server.reload();
  done();
})

gulp.task("serve", function() {
  server.init({
    server: "build/",
    notify: false,
    open: true,
    cors: true,
    ui: false
  });

  gulp.watch("sass/**/*.{scss,sass}", ["style"]);
  gulp.watch("*.html", ["html:update"]);
  gulp.watch("js/**/*.js", ["js:update"]);
});

gulp.task("clean", function () {
  return del("build");
});

gulp.task("copy", function () {
  return gulp.src([
    "fonts/**/*.{woff,woff2}",
    "img/**",
    "js/**",
    "*.html"
    ], {
      base: "."
    })
  .pipe(gulp.dest("build"));
});

gulp.task("build", function(fn) {
  return gulpSequence(
    "clean",
    "copy",
    "style",
    "imagemin",
    "symbols",
    fn
  );
});
