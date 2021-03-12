
// Определяем переменную "preprocessor"
let preprocessor = 'less'; 

//* Переменные

const {src, dest, parallel, series, watch} = require('gulp');

const browserSync     = require('browser-sync').create(); // атоматическая перезагрузка страницы
const concat          = require('gulp-concat'); // Переносит все файлы в один файд
const uglify          = require('gulp-uglify-es').default; // Сжимает файл
const less            = require('gulp-less'); // less
const LessAutoprefix  = require('less-plugin-autoprefix');  // автоматически ставить префиксы
const autoprefix      = new LessAutoprefix({ browsers: ['last 2 versions'] });  // автоматически ставить префиксы
const cleancss        = require('gulp-clean-css'); // Минимизирует css файл
const imagemin        = require('gulp-imagemin'); // Минимизация изображений 
const newer           = require('gulp-newer'); // Проверяет наличие оптимизированного изображения 
const del             = require('del'); // Позволяет удалять файлы

//* Иницилизация 

    //*=== Browser-Sync

function browsersync () {
    browserSync.init({
        server: {baseDir: 'app/'},
            
        notify: false, // Отключает и включает уведомление 
        online: true // Включает и выключает возможность работать без вай - фая
        
    }) 
} 

// * Функция для стилей
function styles() {
    return src('app/less/main.less') //Возвращает main.less
    .pipe(less({
        plugins: [autoprefix] // Подключает планин с аутопрефиксами
    }))
    .pipe(concat('main.min.css')) // Конкантинипует все фалы в один
    .pipe(cleancss()) // Минимизируем файл
    .pipe(dest('app/css/')) // Перемещает файлы в указанную папку
    .pipe(browserSync.stream())

}

// * Функция для скриптов
function scripts () {
    return src ([
        'node_modules/jquery/dist/jquery.min.js',
        'app/js/main.js',
    ])
    .pipe(concat('main.min.js'))
    .pipe(uglify())
    .pipe(dest('app/js/'))
    .pipe(browserSync.stream())
}

// * Функция для изображений = сжимает и перетаскивает в папку dist
function images() {
    return src('app/img/src/**/* ')
    .pipe(newer('app/img/dist')) // Проверяет оптимизированно ли уже изображение 
    .pipe(imagemin())
    .pipe(dest('app/img/dist'))
}


function cleanimg() {
    return del('app/img/dist/**/*', {force: true})
}

// * Удаляет все в папке dist
function cleandist() {
    return del('dist/**/*', {force: true})
}

// * Ватчинг файлов
function startwach () {
    watch(['app/**/*.js', '!app/**/*.min.js'], scripts);
    watch('app/**/less/**/*', styles);
    watch('app/img/src/**/*', images);
}

// * Вотчинг изображений
function imgwach () {
    
    watch('app/**/*.html').on('change', browserSync.reload);
    
}

// * Билд
function buildcopy() {
    return src ([
        'app/css/**/*.min.css',
        'app/js/**/*.min.js',
        'app/img/dist/**/*',
        'app/**/*.html'
    ], { base: 'app' })
    .pipe(dest('dist'))
}


// * Экспорт функций в таск

exports.browsersync = browsersync;
exports.script      = scripts;
exports.style       = styles;
exports.images      = images;
exports.cleanimg    = cleanimg;
exports.cleandist    = cleandist;

exports.build     = series(cleandist, styles, scripts, images, buildcopy)

exports.default     = parallel(styles, scripts, browsersync, imgwach, startwach)

