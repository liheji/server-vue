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
    // 生成环境不生成 Map文件，调试时请开起
    productionSourceMap: false,
    configureWebpack: config => {
        if (process.env.NODE_ENV === "production") {
            config.externals = { // 不会被打包的库
                // 第三方库
                'qs': 'Qs',
                'xlsx': 'XLSX',
                'axios': 'axios',
                'js-cookie': 'Cookies',
                'file-saver': 'saveAs',
                // 组件库
                'vue-print-nb': 'print',
                'vue-context-menu': 'VueContextMenu',
                // 核心库
                'vue': 'Vue',
                'vue-router': 'VueRouter',
                // 依赖核心库的库
                'vuex': 'Vuex',
                // Katex
                "katex/contrib/auto-render/auto-render": "renderMathInElement",
            }
        }
    },
    lintOnSave: false,
    // devServer: {
    //     proxy: "http://localhost:8080"
    // }
}
