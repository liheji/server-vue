import Vue from "vue"
import App from "./App.vue"

//ElementUI插件
import ElementUI from "element-ui"
import "element-ui/lib/theme-chalk/index.css"

//其他插件
import VueContextMenu from "vue-context-menu"
import ElSearchTablePagination from "el-search-table-pagination"

//自定义图标
import "@/assets/icon/iconfont.css"

//VueRouter插件
import VueRouter from "vue-router";
import router from "./router";

//第三方包
import axios from "axios"
import cookie from "js-cookie"

//工具包（自定义）
import {dateFormat, QS} from "@/util"

//解决当前位置的冗余导航
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err);
};

//添加插件
Vue.use(ElementUI);
Vue.use(VueRouter);
Vue.use(VueContextMenu);
Vue.use(ElSearchTablePagination, {
    axios
});

//实例化Vue
new Vue({
    el: "#app",
    render: h => h(App),
    router: router,
    data() {
        return {
            user: {},
            isLogin: false
        }
    },
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
                    this.isLogin = true;
                    this.user = JSON.parse(window.atob(data.data));
                    if (this.$route.meta.withoutAuth) {
                        this.$router.push({name: "personal"});
                    }
                }
            }).catch((ignored) => {
        });
    }
});

function initGlobal(that) {
    //安装全局事件，需要一个空的Vue组件传递消息而不要需要组件加载数据
    Vue.prototype.$bus = that;
    Vue.prototype.cookie = cookie;

    //查询源URL
    Vue.prototype.$token = QS("token").trim();

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

    Vue.prototype.flushCaptcha = () => {
        that.$axios.get("/before/imageCaptcha")
            .then(({data}) => {
                const img = new Image();
                img.src = data.data;
                img.onload = () => {
                    const canvas = document.getElementById("verifyCanvas");
                    const ctx = canvas.getContext("2d");
                    ctx.drawImage(img, 0, 0, 100, 38);
                    canvas.onclick = () => {
                        that.flushCaptcha();
                    }
                }
            }).catch((ignored) => {
        });
    }
}

function initAxios(that) {
    that.$axios.defaults.withCredentials = true;

    //*****************************测试开启*****************************
    // that.$axios.defaults.baseURL = "http://localhost:8080";
    //*****************************测试开启*****************************
    //请求拦截器
    that.$axios.interceptors.request.use((config) => {
        //添加params请求参数
        if (that.$token) {
            const ps = config.params ? config.params : {};
            ps.token = that.$token;
            config.params = ps;
        }

        config.headers['X-XSRF-TOKEN'] = that.cookie.get("XSRF-TOKEN") || "";

        return config;
    }, (error) => {
        return Promise.reject(error);
    });

    //响应拦截器
    that.$axios.interceptors.response.use(res => res, (err) => {
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

        //判断当前路由是否不需要进行权限控制
        if (to.meta.withoutAuth) {
            next();
        } else {
            //权限控制（通过session和token判断）
            if (that.isLogin || that.$token) {
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
