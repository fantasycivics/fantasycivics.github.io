let gulp = require('gulp');
let browserify = require('browserify');
let babelify = require('babelify');
let source = require('vinyl-source-stream');
let merge = require('merge-stream');
let buffer = require('vinyl-buffer');
let uglify = require('gulp-uglify');
let sourcemaps = require('gulp-sourcemaps');
let livereload = require('gulp-livereload');
let sass = require('gulp-sass');
let moduleimporter = require('sass-module-importer');

gulp.task('build', function(){
	let files = [
		//{file: 'main', src: 'src/js', dest: 'public/js'},
	];
	return merge(files.map(function(fileData){
		let file = fileData.file;
		let src = fileData.src;
		let dest = fileData.dest;
		return browserify({entries: './' + src + '/' + file + '.js', debug: true})
			.transform('babelify', {presets: ['es2015']})
			.bundle()
			.pipe(source(file + '.js'))
			.pipe(buffer())
			.pipe(sourcemaps.init())
			.pipe(uglify())
			.pipe(sourcemaps.write('./maps'))
			.pipe(gulp.dest('./' + dest))
			.pipe(livereload());
	}));
});

gulp.task('sass', function(){
	return gulp.src('./src/scss/styles.sass')
		.pipe(sourcemaps.init())
		.pipe(sass({
			importer: moduleimporter()
		}))
		.pipe(sourcemaps.write('./'))
		.pipe(gulp.dest('./public/css'));
});

gulp.task('watch', ['build'], function(){
	livereload.listen();
	gulp.watch('./src/js/*.js', ['build']);
});

gulp.task('default', ['build', 'watch']);