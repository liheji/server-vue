// 该文件专门用于创建整个应用的路由器
import VueRouter from "vue-router"
import {routeHandler} from "@/util"
//引入组件
import Login from "@/components/Login"
import Captcha from "@/components/Captcha"
import Forget from "@/components/Forget"
import Register from "@/components/Register"

import Error404 from "@/components/Error404"
import Error500 from "@/components/Error500"

import Main from "@/components/Main"
import Token from "@/components/main/Token"
import Group from "@/components/main/Group"
import Upload from "@/components/main/Upload"
import Format from "@/components/main/Format"
import Device from "@/components/main/Device"
import Socket from "@/components/main/Socket"
import Server from "@/components/main/Server"
import Account from "@/components/main/Account"
import Download from "@/components/main/Download"
import Personal from "@/components/main/Personal"
import Permission from "@/components/main/Permission"

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
            title: "系统登录",
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
                name: "token",
                path: "token",
                component: Token,
                meta: {
                    title: "Token管理"
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
                name: "format",
                path: "format",
                component: Format,
                meta: {
                    title: "课表格式化"
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
