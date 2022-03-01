<template>
  <div class="login-wrap">
    <el-form ref="loginForm"
             class="login-form"
             :rules="loginRules"
             :model="loginForm">
      <div class="login-face"><img src="@/assets/img/logo.png" alt="logo"></div>
      <el-form-item prop="username">
        <el-input type="text" maxlength="18"
                  v-model="loginForm.username"
                  placeholder="账号" autocomplete="on"
                  @input.once="delete $route.params.msg">
          <i class="el-icon-user el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password"
                  v-model="loginForm.password"
                  placeholder="密码"
                  autocomplete="on"
                  maxlength="18"
                  @input.once="delete $route.params.msg">
          <i class="el-icon-lock el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="captcha" style="margin-bottom: 5px;">
        <el-input type="text" maxlength="4"
                  v-model="loginForm.captcha"
                  placeholder="验证码" autocomplete="on"
                  @keyup.enter.native="submitForm"
                  @input.once="delete $route.params.msg">
          <template slot="append">
            <div class="img">
              <canvas id="verifyCanvas" width="100" height="38" style="cursor: pointer;">不支持canvas</canvas>
            </div>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item style="margin-bottom: 0;">
        <el-checkbox v-model="loginForm.remember">14天免登录</el-checkbox>
        <div style="float: right;height: 40px;">
          <el-link :underline="false" index="/forget" @click="routerPush">忘记密码？</el-link>
          <el-link :underline="false" index="/register" @click="routerPush">注册</el-link>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" style="width: 100%;" @click.native.prevent="submitForm">登录
        </el-button>
        <div class="el-form-item__error" v-if="$route.params.msg">{{ $route.params.msg }}</div>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "Login",
  data: function () {
    return {
      loading: false,
      loginForm: {
        username: "",
        password: "",
        captcha: "",
        remember: false,
      },
      loginRules: {
        username: [
          {required: true, message: "请输入账号", trigger: "blur"}
        ],
        password: [
          {required: true, message: "请输入密码", trigger: "blur"}
        ],
        captcha: [
          {required: true, message: "请输入验证码", trigger: "blur"},
          {min: 4, max: 4, message: "长度应为四", trigger: "change"},
        ],
      },
      redirect: undefined,
      otherQuery: {}
    }
  },
  methods: {
    routerPush({target}) {
      this.$router.push({
        path: target.parentElement.attributes.index.value
      });
    },
    submitForm() {
      this.$refs.loginForm.validate((valid) => {
        if (!valid) {
          return false;
        }
        this.loading = true;
        this.$axios.post("/login", {}, {
          params: this.loginForm
        }).then(({data}) => {
          if (data.code === 0) {
            this.$bus.isLogin = true;
            this.$bus.user = data.data;
            this.$router.push({path: this.redirect || "/main/personal", query: this.otherQuery});
          } else {
            this.$warning(data.msg);
            this.flushCaptcha();
          }
          this.loading = false;
        }).catch((err) => {
          this.$error(err.toString());
          this.loading = false;
        })
      });
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== "redirect") {
          acc[cur] = query[cur];
        }
        return acc;
      }, {})
    }
  },
  watch: {
    $route: {
      handler: function (route) {
        const query = route.query;
        if (query) {
          this.redirect = query.redirect;
          this.otherQuery = this.getOtherQuery(query);
        }
      },
      immediate: true
    }
  },
  mounted() {
    //数据渲染完以后加载验证码
    this.flushCaptcha();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.login-wrap {
  -webkit-box-sizing: border-box;
  -moz-box-sizing: border-box;
  -o-box-sizing: border-box;
  box-sizing: border-box;
  width: 100%;
  height: 100%;
  padding-top: 15%;
  background-repeat: no-repeat;
  background-position: center right;
  background-size: 100%;
}

.login-wrap .login-form {
  margin: 0 auto;
  width: 285px;
  padding: 30px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  text-align: left;
  box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.1);

  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  border-radius: 10px;
}

.login-wrap .img {
  position: relative;
  margin: 0;
  padding: 0;
  cursor: pointer;
  width: 100px;
  height: 38px;
}

.login-wrap .login-face {
  margin: -95px auto 20px;
  width: 120px;
  height: 120px;
  -webkit-border-radius: 50%;
  -moz-border-radius: 50%;
  border-radius: 50%;
  border: 5px solid #fff;
  overflow: hidden;
  box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.1);
  background: white;
}

.login-wrap img {
  width: 100%
}

.login-wrap .el-input-group__append {
  padding: 0 !important;
}
</style>
