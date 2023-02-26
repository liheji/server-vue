<template>
  <div>
    <div class="main-wrap">
      <el-menu :default-active="$route.path"
               class="el-menu-demo"
               mode="horizontal"
               menu-trigger="click"
               router>
        <el-menu-item>
          {{ user.username }}
          <el-badge v-if="exitEmail" :is-dot="false">
            <el-tag type="success">已登录</el-tag>
          </el-badge>
          <el-popover
              v-else
              placement="bottom"
              title="警告"
              width="180"
              trigger="hover">
            <div style="margin: 5px;">
              请尽快绑定邮箱，邮箱主要用于<br>
              1.登录系统<br>
              2.忘记密码时身份认证
            </div>
            <el-badge is-dot slot="reference">
              <el-tag type="success">已登录</el-tag>
            </el-badge>
          </el-popover>
        </el-menu-item>
        <el-submenu index="2">
          <template slot="title">更多功能</template>
          <el-menu-item index="/main/personal"><i class="el-icon-server-user-detail iconfont"></i>个人信息</el-menu-item>
          <el-menu-item v-if="hasAuthority('view_account')" index="/main/account">
            <i class="el-icon-server-user-manage iconfont"></i>
            用户管理
          </el-menu-item>
          <el-menu-item v-if="hasAuthority('view_group')" index="/main/group">
            <i class="el-icon-copy-document"></i>
            分组管理
          </el-menu-item>
          <el-menu-item v-if="hasAuthority('view_permission')" index="/main/permission">
            <i class="el-icon-lock"></i>
            权限管理
          </el-menu-item>
          <el-menu-item v-if="hasAuthority('add_uploadinfo')" index="/main/upload"><i class="el-icon-upload2"></i>上传文件
          </el-menu-item>
          <el-menu-item v-if="hasAuthority('view_uploadinfo')" index="/main/download"><i class="el-icon-download"></i>下载管理
          </el-menu-item>
          <el-menu-item v-if="hasAuthority('use_wakeup')" index="/main/hrbeu"><i class="el-icon-s-grid"></i>课表格式化
          </el-menu-item>
          <el-menu-item v-if="hasAuthority('use_websocket')" index="/main/socket"><i class="el-icon-coordinate"></i>Socket测试
          </el-menu-item>
          <el-menu-item v-if="hasAuthority('use_websocket')" index="/main/server"><i class="el-icon-folder"></i>文件管理
          </el-menu-item>
          <el-menu-item v-if="hasAuthority('use_latexaccount')" index="/main/latex"><i
              class="el-icon-server-latex iconfont"></i>Latex公式
          </el-menu-item>
          <el-menu-item index="/main/device"><i class="el-icon-mobile"></i>登录设备</el-menu-item>
        </el-submenu>
        <el-menu-item>
          <region-cascader :region.sync="location"></region-cascader>
        </el-menu-item>
        <el-menu-item v-if="hasAuthority('add_account')" @click="secretVisible=true">
          <el-link>生成授权码</el-link>
        </el-menu-item>
        <el-menu-item v-if="isLogin" @click="logOut">
          <el-link>注销登录</el-link>
        </el-menu-item>
      </el-menu>
    </div>

    <keep-alive include="Upload,Format,Server">
      <router-view></router-view>
    </keep-alive>

    <el-dialog
        title="生成授权码"
        width="500px"
        :close-on-click-modal="false"
        :visible.sync="secretVisible">
      <el-collapse>
        <el-collapse-item title="注意事项" name="1">
          <div>1.每个授权码有效期为3天</div>
          <div>2.授权码仅用于新用户的注册</div>
          <div>3.每个授权码只能注册一个账号</div>
          <div>4.授权码仅展示一次，且不可撤销</div>
        </el-collapse-item>
        <el-collapse-item title="生成授权码" name="2">
          <div>
            <el-button type="primary" size="small" @click="genRegisterCaptcha" :loading="secretLoading">生成</el-button>
            <el-tag type="success" style="margin-left: 20px;">{{ secret }}
              <i title="复制"
                 v-if="secret.length === 32"
                 style="margin-left: 10px;"
                 class="el-icon-copy-document"
                 @click="keyCopy">
              </i></el-tag>
          </div>
        </el-collapse-item>
      </el-collapse>
      <div slot="footer">
        <el-button type="primary" @click="secretVisible = false" size="medium">关闭</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import RegionCascader from '@/views/common/RegionCascader'
import {mapState} from 'vuex'
import {copyText} from "@/util";

export default {
  name: "Main",
  components: {
    RegionCascader
  },
  data() {
    return {
      location: '',
      secret: "尚未生成",
      secretLoading: false,
      secretVisible: false,
    }
  },
  computed: {
    ...mapState(["user", "isLogin"]),
    exitEmail() {
      return !!this.user.email;
    }
  },
  methods: {
    genRegisterCaptcha() {
      this.secretLoading = true;
      this.$axios.get("/secretCaptcha?code=register_secret").then(({data}) => {
        if (data.code === 0) {
          this.secret = data.key;
        } else {
          this.secret = data.msg;
        }
        this.secretLoading = false;
      }).catch((err) => {
        this.secret = err.toString();
        this.secretLoading = false;
      });
    },
    logOut() {
      this.$axios.post("/logout")
          .then(({data}) => {
            if (data.code === 0) {
              this.$success(data.msg);
              this.$router.push({name: "login"});
            } else {
              this.$warning(data.msg);
            }
          }).catch((err) => {
        this.$error(err.toString());
      });
    },
    keyCopy({target}) {
      copyText(target.parentNode.firstChild);
    }
  },
  mounted() {
    if (this.user.isSuperuser) {
      this.$store.commit("setPermissions", new Set())
    } else {
      this.$axios.get("/account/permissions/0", {
        params: {isCode: true}
      }).then(({data}) => {
        if (data.code === 0) {
          this.$store.commit("setPermissions", new Set(data.data))
        }
      }).catch((ignored) => {
      });
    }
  }
}
</script>

<style>
.main-wrap {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: left;
  color: #2c3e50;
  width: 100%;
  height: 100%;
  padding-top: 10px;
}

.main-wrap .el-menu-item .el-badge__content {
  top: 14px;
}
</style>
