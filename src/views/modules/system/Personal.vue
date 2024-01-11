<template>
  <div class="personal-wrap">
    <el-descriptions title="用户信息" :column="1">
      <el-descriptions-item label="用户名">{{ user.username }}</el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag size="small" v-if="user.isEnabled" type="success">正常</el-tag>
        <el-tag size="small" v-else type="danger">禁用</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="身份">
        <el-tag size="small" v-if="user.isSuperuser" effect="dark">管理员</el-tag>
        <el-tag size="small" v-else type="warning" effect="dark">普通用户</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="手机号">
        {{ user.mobile || "未绑定" }}
        <el-link style="margin-left: 10px;" v-if="hasMobile" type="primary"
                 @click="handlePropertyBinding('mobile', user.mobile)">
          解绑
        </el-link>
        <el-link style="margin-left: 10px;" v-else type="primary"
                 @click="handlePropertyBinding('mobile', user.mobile)">
          绑定
        </el-link>
      </el-descriptions-item>
      <el-descriptions-item label="E-mail">
        {{ user.email || "未绑定" }}
        <el-link style="margin-left: 10px;" v-if="hasEmail" type="primary"
                 @click="handlePropertyBinding('email', user.email)">
          解绑
        </el-link>
        <el-link style="margin-left: 10px;" v-else type="primary"
                 @click="handlePropertyBinding('email', user.email)">
          绑定
        </el-link>
      </el-descriptions-item>
      <el-descriptions-item v-for="auth in authAccounts" :key="auth.authCode" :label="authCodeToType(auth.authCode)">
        <el-avatar :size="20" :src="auth.avatarUrl"
                   v-if="auth.id !== undefined && auth.id != null && auth.id > 0"
                   style="margin-right: 5px">
        </el-avatar>
        {{ auth.name || "未绑定" }}
        <el-popconfirm
            style="margin-left: 10px;"
            v-if="auth.id !== undefined && auth.id != null && auth.id > 0"
            title="确认解绑账号吗？"
            @confirm="unbindAuth(auth.id)">
          <el-link type="primary" slot="reference">解绑</el-link>
        </el-popconfirm>
        <el-link style="margin-left: 10px;" v-else type="primary" :href="'/oauth2/authorization/'+ auth.authCode">
          绑定
        </el-link>
      </el-descriptions-item>
      <el-descriptions-item label="最后登录时间">{{ user.lastLogin | formatDate }}</el-descriptions-item>
      <el-descriptions-item label="最后更新时间">{{ user.updateTime | formatDate }}</el-descriptions-item>
      <el-descriptions-item label="加入时间">{{ user.createTime | formatDate }}</el-descriptions-item>
    </el-descriptions>
    <el-button type="primary" size="small" @click="handlePasswordUpdate">修改密码</el-button>
    <property-binding v-if="propertyBindingVisible" ref="propertyBinding"></property-binding>
    <password-update v-if="passwordUpdateVisible" ref="passwordUpdate"></password-update>
  </div>
</template>

<script>
import {mapState} from 'vuex'
import PasswordUpdate from '@/views/modules/system/PersonalPasswordUpdate'
import PropertyBinding from '@/views/modules/system/PersonalPropertyBinding'

export default {
  name: "Personal",
  components: {
    PasswordUpdate,
    PropertyBinding
  },
  data() {
    return {
      authAccounts: [],
      passwordUpdateVisible: false,
      propertyBindingVisible: false,
    };
  },
  computed: {
    ...mapState(["user"]),
    hasMobile() {
      return !!this.user.mobile;
    },
    hasEmail() {
      return !!this.user.email;
    }
  },
  methods: {
    handlePasswordUpdate() {
      this.passwordUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.passwordUpdate.init()
      })
    },
    handlePropertyBinding(property, value) {
      this.propertyBindingVisible = true
      this.$nextTick(() => {
        this.$refs.propertyBinding.init({
          value: value,
          property: property
        })
      })
    },
    authCodeToType(authCode) {
      switch (authCode) {
        case "qq":
          return "QQ";
        case "baidu":
          return "百度";
        case "github":
          return "GitHub";
        case "weibo":
          return "微博";
        case "gitee":
          return "Gitee";
        case "google":
          return "谷歌";
        case "huawei":
          return "华为";
        case "xiaomi":
          return "小米";
        default:
          return "Default";
      }
    },
    unbindAuth(id) {
      if (id != null) {
        this.$axios.delete(`/authAccount`, {
          data: {id: id}
        }).then(({data}) => {
          if (data.code === 0) {
            this.$success(data.msg);
            const resultAuth = this.authAccounts;
            this.authAccounts = resultAuth.map(obj => {
              if (obj.id === id) {
                obj.id = null;
                obj.openId = null;
                obj.name = null;
                obj.avatarUrl = null;
                obj.accountId = null;
              }
            })
          } else {
            this.$warning(data.msg);
          }
        }).catch((err) => {
          this.$error(err.toString());
        })
      }
    }
  },
  mounted() {
    this.$axios.get("/authAccount").then(({data}) => {
      if (data.code === 0) {
        this.authAccounts = data.data;
        this.authAccounts.sort((a, b) => {
          return a.authCode.length - b.authCode.length;
        })
        // 追加没有的
      }
    }).catch((ignored) => {
    });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.personal-wrap {
  margin: 20px;
}

.personal-wrap .mobile .el-form-item {
  margin-bottom: 0 !important;
}

.personal-wrap .el-descriptions-item__container {
  line-height: 20px !important;
}

.personal-wrap .el-descriptions-item__container .el-descriptions-item__content,
.el-descriptions-item__container .el-descriptions-item__label {
  align-items: unset !important;
}
</style>
