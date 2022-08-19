module.exports = {
    assetsDir: "static",
    pages: {
        index: {
            // page 的入口
            entry: "src/main.js",
            // 模板来源
            template: "public/index.html",
            // 在 dist/index.html 的输出
            filename: "index.html",
        }
    },
    configureWebpack: config => {
        if (process.env.NODE_ENV === "production") {
            config.externals = { // 不会被打包的库
                'vue': 'Vue',
                'vue-router': 'VueRouter',
                // 其他
                'axios': 'axios'
            }
        }
    },
    lintOnSave: false,
    // devServer: {
    //     proxy: "http://localhost:8080"
    // }
}
