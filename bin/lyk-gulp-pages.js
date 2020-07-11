#!/usr/bin/env node

// 1. 将工作目录设置为当前工作目录
process.argv.push("--cwd")
process.argv.push(process.cwd())

// 2. 将gulpfile.js文件的目录设置为gulpfile.js的入口目录(lib/index.js)
process.argv.push("--gulpfile")
// require.resolve("..") 找的是package.json的main(lib/index.js)
process.argv.push(require.resolve(".."))


console.log(process.argv);
// [
//     'C:\\Program Files\\nodejs\\node.exe',
//     'C:\\Users\\Administrator\\AppData\\Roaming\\npm\\node_modules\\lyk-gulp-pages\\bin\\lyk-gulp-pages.js',
//     'dev',
//     '--cwd',
//     'E:\\react-lgjy\\fed-e-task-part2-module1\\code\\task3-code\\gulp-build-demo',
//     '--gulpfile',
//     'E:\\react-lgjy\\fed-e-task-part2-module1\\code\\task3-code\\lyk-gulp-pages\\lib\\index.js'
// ]

// 3. 执行gulp命令
// 相当于执行 yarn gulp
require("gulp/bin/gulp")
