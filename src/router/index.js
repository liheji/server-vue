// 该文件专门用于创建整个应用的路由器
import VueRouter from "vue-router"
// 引入主页框架组件
import Main from "@/views/Main"
//引入公共组件
import Login from "@/views/modules/common/Login"
import Captcha from "@/views/modules/common/Captcha"
import Forget from "@/views/modules/common/Forget"
import Register from "@/views/modules/common/Register"
import Error404 from "@/views/modules/common/Error404"
import Error500 from "@/views/modules/common/Error500"

//引入系统组件
import Personal from "@/views/modules/system/Personal"
import Device from "@/views/modules/system/Device"
import Group from "@/views/modules/system/Group"
import Permission from "@/views/modules/system/Permission"
import Account from "@/views/modules/system/Account"

import Latex from "@/views/modules/latex/Latex"
// wakeup
import Hrbeu from "@/views/modules/wakeup/Hrbeu"
// websocket
import Socket from "@/views/modules/websocket/Socket"
import Server from "@/views/modules/websocket/Server"
// file
import Upload from "@/views/modules/file/Upload"
import Download from "@/views/modules/file/Download"

/**
 * 路由拦截器，设置 title
 * @param to 目标路由
 * @param from 源路由
 * @param next
 */
const routeHandler = function (to, from, next) {
    if (to.meta.title) {
        document.title = to.meta.title;
    }
    next();
}

//创建并暴露一个路由器
const router = new VueRouter({
    routes: [{
        path: "",
        redirect: "login",
    }, {
        name: "login",
        path: "/login",
        component: Login,
        beforeEnter: routeHandler,
        meta: {
            title: "实用工具",
            withoutAuth: true
        }
    }, {
        name: "captcha",
        path: "/captcha",
        component: Captcha,
        beforeEnter: routeHandler,
        meta: {
            title: "系统登录",
            withoutAuth: true
        }
    }, {
        name: "forget",
        path: "/forget",
        component: Forget,
        beforeEnter: routeHandler,
        meta: {
            title: "忘记密码",
            withoutAuth: true
        }
    }, {
        name: "register",
        path: "/register",
        component: Register,
        beforeEnter: routeHandler,
        meta: {
            title: "注册账号",
            withoutAuth: true
        }
    }, {
        name: "main",
        path: "/main",
        component: Main,
        children: [
            {
                path: "",
                redirect: "personal"
            },
            {
                name: "personal",
                path: "personal",
                component: Personal,
                meta: {
                    title: "用户信息"
                }
            }, {
                name: "account",
                path: "account",
                component: Account,
                meta: {
                    title: "用户管理"
                }
            }, {
                name: "upload",
                path: "upload",
                component: Upload,
                meta: {
                    title: "文件上传"
                }
            }, {
                name: "latex",
                path: "latex",
                component: Latex,
                meta: {
                    title: "Latex公式"
                }
            }, {
                name: "group",
                path: "group",
                component: Group,
                meta: {
                    title: "分组管理"
                }
            }, {
                name: "permission",
                path: "permission",
                component: Permission,
                meta: {
                    title: "权限管理"
                }
            }, {
                name: "hrbeu",
                path: "hrbeu",
                component: Hrbeu,
                meta: {
                    title: "哈尔滨工程大学（研究生院）课程表格式化"
                }
            }, {
                name: "download",
                path: "download",
                component: Download,
                meta: {
                    title: "下载管理"
                }
            }, {
                name: "socket",
                path: "socket",
                component: Socket,
                meta: {
                    title: "Socket测试"
                }
            }, {
                name: "server",
                path: "server",
                component: Server,
                meta: {
                    title: "文件管理"
                }
            }, {
                name: "device",
                path: "device",
                component: Device,
                meta: {
                    title: "登录管理"
                }
            }

        ]
    }, {
        name: "error500",
        path: "/500",
        component: Error500,
        meta: {
            title: "500 Internal Server Error"
        }
    }, {
        name: "error404",
        path: "*",
        component: Error404,
        meta: {
            title: "404 Not Found"
        }
    }]
});

export default router
