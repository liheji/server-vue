//引入Vue核心库
import Vue from 'vue'
//引入Vuex
import Vuex from 'vuex'
//应用Vuex插件
Vue.use(Vuex)

//准备actions对象——响应组件中用户的动作
const actions = {}
//准备mutations对象——修改state中的数据
const mutations = {
    // 设置用户信息
    setUser(state, user) {
        state.user = user;
    },
    setIsLogin(state, isLogin) {
        state.isLogin = isLogin;
    },
    setPermissions(state, permissions) {
        state.permissions = permissions;
    },
    setUserProperty(state, info) {
        state.user[info.property] = info.value;
    }
}
//准备state对象——保存具体的数据
const state = {
    user: {},
    permissions: new Set(),
    isLogin: false
}

//创建并暴露store
export default new Vuex.Store({
    actions,
    mutations,
    state
})
