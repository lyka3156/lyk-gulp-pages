//  gulpfile.js的入口文件

const { src, dest, watch, series, parallel } = require("gulp");


const path = require("path");
const cwd = process.cwd();

let dataConfig = {
  // defualt config
  build: {
    src: "src",
    dist: "dist",
    temp: "temp",
    public: "public",
    paths: {
      styles: "assets/styles/*.scss",
      scripts: "assets/styles/*.js",
      pages: "*.html",
      images: "assets/images/**",
      fonts: "assets/fonts/**"
    }
  }
};
try {
  const loadConfig = require(path.join(cwd, "data.config.js"));
  dataConfig = { ...dataConfig, ...loadConfig };
} catch{
}



const loadPlugins = require("gulp-load-plugins");
const plugins = loadPlugins();

const del = require("del");

const browserSync = require("browser-sync");
const bs = browserSync.create();

const serverPath = dataConfig.build.temp;
const buildPath = dataConfig.build.dist;
const srcPath = dataConfig.build.src;
const publicPath = dataConfig.build.public;

const clean = () => del([serverPath, buildPath]);

const style = doneOrFileName => {
  let fileName = typeof (doneOrFileName) === "string" ? doneOrFileName : dataConfig.build.paths.styles;
  return src(fileName, { base: srcPath, cwd: srcPath })
    .pipe(plugins.sass({ outputStyle: "expanded" }))
    .pipe(dest(serverPath))
    .pipe(bs.reload({ stream: true }));
}


const script = doneOrFileName => {
  let fileName = typeof (doneOrFileName) === "string" ? doneOrFileName : dataConfig.build.paths.scripts;
  return src(fileName, { base: srcPath, cwd: srcPath })
    .pipe(
      plugins.babel({
        presets: [require("@babel/preset-env")],
        plugins: [require("@babel/plugin-proposal-class-properties")],
      })
    )
    .pipe(dest(serverPath))
    .pipe(bs.reload({ stream: true }));
}


const page = doneOrFileName => {
  let fileName = typeof (doneOrFileName) === "string" ? doneOrFileName : dataConfig.build.paths.pages;
  return src(fileName, { base: srcPath, cwd: srcPath })
    .pipe(plugins.swig({ data: dataConfig.data, defaults: { cache: false } }))
    .pipe(dest(serverPath))
    .pipe(bs.reload({ stream: true }));
}

const image = () =>
  src(dataConfig.build.paths.images, { base: srcPath, cwd: srcPath })
    .pipe(plugins.imagemin())
    .pipe(dest(buildPath));

const font = () =>
  src(dataConfig.build.paths.fonts, { base: srcPath, cwd: srcPath })
    .pipe(plugins.imagemin())
    .pipe(dest(buildPath));

const extra = () => src("**", { base: publicPath, cwd: publicPath }).pipe(dest(buildPath));

const server = () => {
  watch(dataConfig.build.paths.styles, { cwd: srcPath }, style);
  watch(dataConfig.build.paths.scripts, { cwd: srcPath }).on("change", (fileName) => script(fileName));
  watch(dataConfig.build.paths.pages, { cwd: srcPath }).on("change", (fileName) => page(fileName));

  watch(
    [dataConfig.build.paths.images, dataConfig.build.paths.fonts],
    { cwd: srcPath },
    bs.reload
  );

  watch(
    "**",
    { cwd: publicPath },
    bs.reload
  );

  bs.init({
    port: 2080,
    open: false,
    server: {
      baseDir: [serverPath, srcPath, publicPath],
      routes: {
        "/node_modules": "node_modules",
      },
    },
  });
};

const useref = () =>
  src(dataConfig.build.paths.pages, { base: serverPath, cwd: serverPath })
    .pipe(plugins.useref({ searchPath: [serverPath, "."] }))
    .pipe(plugins.if(/\.js$/, plugins.uglify()))
    .pipe(plugins.if(/\.css$/, plugins.cleanCss()))
    .pipe(
      plugins.if(
        /\.html$/,
        plugins.htmlmin({
          collapseWhitespace: true,
          minifyCSS: true,
          minifyJS: true,
        })
      )
    )
    .pipe(dest(buildPath));

const compile = parallel(style, script, page);

const dev = series(clean, compile, server);

const build = series(
  clean,
  parallel(series(compile, useref), image, font, extra)
);

module.exports = {
  dev,
  build,
};

