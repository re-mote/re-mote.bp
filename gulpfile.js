const gulp = require('gulp');
const del = require('del');
const autoprefixer = require('gulp-autoprefixer');
const browserSync = require('browser-sync');
const sass = require('gulp-sass');
const pug = require('gulp-pug');
const concat = require("gulp-concat");
const rename = require("gulp-rename");
const imagemin = require('gulp-imagemin');
const sourcemaps = require('gulp-sourcemaps');
const uglify = require('gulp-uglify');
const plumber = require('gulp-plumber');
const gulpif = require('gulp-if');
const CacheBuster = require('gulp-cachebust');

const cachebust = new CacheBuster();


const paths = {
  dirs: {
    build: './public'
  },
  html: {
    src: './src/pages/*.pug',
    dest: './public',
    watch: ['./src/pages/*.pug', './src/templates/*.pug', './src/blocks/**/*.pug']
  },
  css: {
    src: './src/styles/style.scss',
    dest: './public/css',
    watch: ['./src/blocks/**/*.scss', './src/styles/**/*.scss', './src/styles/*.scss']
  },
  jsVendor: {
    src: ['./node_modules/jquery/dist/jquery.min.js', './src/plugins/*.js'],
    dest: './public/js',
    watch: './src/plugins/*.js',
  },
  js: {
    src: './src/blocks/**/*.js',
    dest: './public/js',
    watch: './src/blocks/**/*.js',
  },
  images: {
    src: './src/blocks/**/img/*',
    dest: './public/img',
    watch: ['./src/blocks/**/img/*']
  },
  fonts: {
    src: './src/fonts/*',
    dest: './public/fonts',
    watch: './src/fonts/*'
  }
};

gulp.task('clean', function () {
  return del(paths.dirs.build);
});

gulp.task('templates', function () {
  return gulp.src(paths.html.src)
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulpif(global.isBuild,cachebust.references()))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('templates_page', function () {
  return gulp.src(paths.html.src, {
    since: gulp.lastRun('templates_page')
  })
    .pipe(plumber())
    .pipe(pug({
      pretty: true
    }))
    .pipe(gulp.dest(paths.html.dest))
    .pipe(browserSync.reload({
      stream: true
    }));
});


gulp.task('styles', function () {
  return gulp.src(paths.css.src)
    .pipe(plumber())
    .pipe(sourcemaps.init())
      .pipe(sass())
      .pipe(autoprefixer())
    .pipe(sourcemaps.write())
    .pipe(gulpif(global.isBuild, cachebust.resources()))
    .pipe(gulp.dest(paths.css.dest))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('scriptsVendor', function () {
  return gulp.src(paths.jsVendor.src)
    .pipe(plumber())
    .pipe(sourcemaps.init())
      .pipe(concat('vendor.js'))
    .pipe(sourcemaps.write())
    .pipe(gulpif(global.isBuild, cachebust.resources()))
    .pipe(gulp.dest(paths.jsVendor.dest))
    .pipe(browserSync.reload({
      stream: true
    }));

});


gulp.task('scripts', function () {
  return gulp.src(paths.js.src)
    .pipe(plumber())
    .pipe(sourcemaps.init())
      .pipe(concat('scripts.js'))
    .pipe(sourcemaps.write())
    .pipe(gulpif(global.isBuild, cachebust.resources()))
    .pipe(gulp.dest(paths.js.dest))
    .pipe(browserSync.reload({
      stream: true
    }));

});

gulp.task('images', function () {
  return gulp.src(paths.images.src)
    .pipe(plumber())
    .pipe(imagemin())
    .pipe(rename({
      dirname: ''
    }))
    .pipe(gulp.dest(paths.images.dest));
});

gulp.task('fonts', function () {
  return gulp.src(paths.fonts.src)
    .pipe(plumber())
    .pipe(gulp.dest(paths.fonts.dest))
    .pipe(browserSync.reload({
      stream: true
    }));
});

gulp.task('server', function () {
  browserSync.init({
    server: {
      baseDir: paths.dirs.build
    },
    reloadOnRestart: true
  });
  gulp.watch([paths.html.watch[1], paths.html.watch[2]], gulp.parallel('templates'));
  gulp.watch(paths.html.src, gulp.parallel('templates_page'));
  gulp.watch(paths.css.watch, gulp.parallel('styles'));
  gulp.watch(paths.js.watch, gulp.parallel('scripts'));
  gulp.watch(paths.jsVendor.watch, gulp.parallel('scriptsVendor'));
  gulp.watch(paths.images.watch, gulp.parallel('images'));
  gulp.watch(paths.fonts.watch, gulp.parallel('fonts'));
});

gulp.task('build', gulp.series(
  (cb) => {
    global.isBuild = true;
    return cb();
  },
  'clean',
  'styles',
  'scriptsVendor',
  'scripts',
  'fonts',
  'templates',
  'images'
));

gulp.task('dev', gulp.series(
  'clean',
  'styles',
  'scriptsVendor',
  'scripts',
  'fonts',
  'templates',
  'images',
  'server'
));
