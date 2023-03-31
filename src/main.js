import Vue from "vue"
import App from "@/views/App.vue"

//ElementUI插件
import ElementUI from "element-ui"
import "element-ui/lib/theme-chalk/index.css"
//自定义图标
import "@/assets/icon/iconfont.css"

// 表格分页组件
// 来自 https://github.com/zollero/el-search-table-pagination
import ElPageTable from "@/components/table/ElPageTable"

//其他插件
import print from "vue-print-nb"
import VueContextMenu from "vue-context-menu"

//VueRouter插件
import VueRouter from "vue-router";
import router from "@/router";

//解决当前位置的冗余导航
const originalPush = VueRouter.prototype.push;
VueRouter.prototype.push = function push(location) {
    return originalPush.call(this, location).catch(err => err);
};

// Vuex
import store from "@/store"

//工具包（自定义）
import {base64Decode} from "@/util/hash"
import {initGlobal, initAxios, initRouter} from "@/plugin/global"

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

