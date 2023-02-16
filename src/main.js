import Vue from "vue"
import App from "@/view/App.vue"

//ElementUI插件
import ElementUI from "element-ui"
import "element-ui/lib/theme-chalk/index.css"
// 表格分页组件
// 来自 https://github.com/zollero/el-search-table-pagination
import ElPageTable from "@/components/table/ElPageTable"

//其他插件
import print from 'vue-print-nb'
import VueContextMenu from "vue-context-menu"

//自定义图标
import "@/assets/icon/iconfont.css"

//VueRouter插件
import VueRouter from "vue-router";
import router from "@/router";
// Vuex
import store from '@/store'

//第三方包
import Qs from "qs";
import axios from "axios"
import Cookies from "js-cookie"

//工具包（自定义）
import {dateFormat, calculateHash, base64Decode} from "@/util"

// katex 样式
// import 'katex/dist/katex.min.css'
// Katex 自动渲染函数
import renderMathInElement from 'katex/contrib/auto-render/auto-render'

//解决当前位置的冗余导航
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err);
};

//添加插件
Vue.use(ElementUI);
Vue.use(VueRouter);
Vue.use(print)
Vue.use(VueContextMenu);
Vue.component("ElPageTable", ElPageTable);

//实例化Vue
new Vue({
    el: "#app",
    render: h => h(App),
    router: router,
    store: store,
    beforeCreate() {
        //封装全局事件
        initGlobal(this);
        //配置 axios
        initAxios(this);
        //路由前置拦截器
        initRouter(this);
    },
    mounted() {
        this.$axios.get("/status")
            .then(({data}) => {
                if (data.code === 0) {
                    this.$store.commit("setIsLogin", true);
                    this.$store.commit("setUser", base64Decode(data.data));
                    if (this.$route.meta.withoutAuth) {
                        this.$router.push({name: "personal"});
                    }
                } else {
                    this.$router.push({path: "/login"});
                }
            }).catch((ignored) => {
        });
    }
});

function initGlobal(that) {
    //安装全局事件，需要一个空的Vue组件传递消息而不要需要组件加载数据
    Vue.prototype.$axios = axios;

    Vue.prototype.$bus = that;

    Vue.prototype.$cookie = Cookies;

    Vue.prototype.$formula = function (element) {
        renderMathInElement(element, {
            delimiters: [
                {left: '$$', right: '$$', display: true},
                {left: '$', right: '$', display: false}
            ],
            throwOnError: false
        })
    }

    //全局过滤器
    Vue.filter('formatDate', function (strTime) {
        return strTime ? dateFormat(strTime) : "";
    })

    //封装同步请求
    Vue.prototype.$sync = async (config) => {
        return await that.$axios(config);
    }

    Vue.prototype.$warning = (msg) => {
        that.$notify.warning({
            title: "警告",
            message: msg
        });
    };

    Vue.prototype.$success = (msg) => {
        that.$notify.success({
            title: "成功",
            message: msg
        });
    };

    Vue.prototype.$error = (msg) => {
        that.$notify.error({
            title: "错误",
            message: msg
        });
    };

    Vue.prototype.hasAuthority = (...args) => {
        if (that.$store.state.user.isSuperuser === true) {
            return true
        }
        for (const arg of args) {
            if (that.$store.state.permissions.has(arg)) {
                return true
            }
        }
        return false;
    };
}

function initAxios(that) {
    that.$axios.defaults.withCredentials = true;

    //*****************************测试开启*****************************
    // window.vx = that;
    // that.$axios.defaults.baseURL = "http://localhost:8080";
    //*****************************测试开启*****************************
    const formUrl = new Set(["/login"]);
    const secureMethod = new Set(["DELETE", "POST", "PUT"]);
    //请求拦截器，设置 "DELETE", "POST", "PUT" 请求体为JSON格式数据
    that.$axios.interceptors.request.use((config) => {
        // 密码登录或验证码登录使用 表单提交
        if (secureMethod.has(config.method.toUpperCase())) {
            config.data = config.data || {}
            config.headers['X-XSRF-TOKEN'] = Cookies.get("XSRF-TOKEN") || "";
            if (formUrl.has(config.url)) {
                config.data = Qs.stringify(config.data || {}, {arrayFormat: 'repeat'})
                config.headers['Content-Type'] = "application/x-www-form-urlencoded"
            } else {
                config.headers['Content-Type'] = "application/json"
            }
        }
        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    //响应拦截器
    that.$axios.interceptors.response.use(res => {
        return JSON.parse(JSON.stringify(res));
    }, (err) => {
        //没有权限401，去登录界面
        const err_code = err.response.status;
        if (err_code === 401 && !that.$route.meta.withoutAuth) {
            that.$router.push({
                name: "login",
                params: {msg: "会话错误"}
            });
        }
        return Promise.reject(err);
    });
}

function initRouter(that) {
    that.$router.beforeEach((to, from, next) => {
        if (to.meta.title) {
            document.title = to.meta.title;
        }

        //*****************************测试开启*****************************
        // next();
        //*****************************测试开启*****************************

        // 判断当前路由是否不需要进行权限控制
        if (to.meta.withoutAuth) {
            next();
        } else {
            //权限控制（通过session和token判断）
            if (that.$store.state.isLogin) {
                next();
            } else {
                //将跳转的路由path作为参数，登录成功后跳转到该路由
                next({
                    name: "login",
                    params: {msg: "未登录"},
                    query: {redirect: to.fullPath}
                });
            }
        }
    });

    //路由错误回调
    that.$router.onError(() => {
        that.$router.push({name: "error500"});
    });
}
