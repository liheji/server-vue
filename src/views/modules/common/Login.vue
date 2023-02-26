<template>
  <div class="login-wrap">
    <el-form ref="loginForm"
             class="login-form"
             :rules="loginForm.rules"
             :model="loginForm.formData">
      <div class="login-face"><img src="@/assets/img/logo.png" alt="logo"></div>
      <el-form-item prop="username">
        <el-input type="text" maxlength="18"
                  v-model="loginForm.formData.username"
                  placeholder="账号" autocomplete="on"
                  @input.once="clearErrorMsg">
          <i class="el-icon-user el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password"
                  v-model="loginForm.formData.password"
                  placeholder="密码"
                  autocomplete="on"
                  maxlength="18"
                  @input.once="clearErrorMsg">
          <i class="el-icon-lock el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="captcha" style="margin-bottom: 5px;">
        <image-captcha v-model="loginForm.formData.captcha"
                       ref="imageCaptcha"
                       @submitForm="submitForm"
                       @clearErrorMsg="clearErrorMsg">
        </image-captcha>
      </el-form-item>
      <el-form-item style="margin-bottom: 0;">
        <el-checkbox v-model="loginForm.formData.remember">14天免登录</el-checkbox>
        <div style="float: right;height: 40px;">
          <el-link :underline="false" index="/forget" @click="routerPush($event)">忘记密码？</el-link>
          <el-link :underline="false" index="/register" @click="routerPush($event)">注册</el-link>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" style="width: 100%;" @click.native.prevent="submitForm">登录
        </el-button>
        <div class="el-form-item__error" style="margin-top: 12px;position: absolute;width: 100%;text-align: right;"
             v-if="$route.params.msg || $route.query.msg">
          <span>{{ errorMsg }}</span>
        </div>
      </el-form-item>
      <el-form-item style="margin-top:-20px;">
        <el-link :underline="false" @click="moreLogin($event)">
          更多登录方式
          <i class="el-collapse-item__arrow el-icon-arrow-right"></i>
        </el-link>
        <el-collapse-transition>
          <div style="text-align: center;margin-top: 10px;" v-show="moreLoginVisible">
            <el-link :underline="false" index="/captcha" @click="routerPush($event)">
              <i class="el-icon-server-captcha-color el-input__icon iconfont" title="验证码登录"></i>
            </el-link>
            <el-link :underline="false" href="/oauth2/authorization/qq">
              <i class="el-icon-server-qq-color el-input__icon iconfont" title="QQ登录"></i>
            </el-link>
            <el-link :underline="false" href="/oauth2/authorization/baidu">
              <i class="el-icon-server-baidu-color el-input__icon iconfont" title="百度登录"></i>
            </el-link>
            <el-link :underline="false" href="/oauth2/authorization/github">
              <i class="el-icon-server-github-color el-input__icon iconfont" title="GitHub登录"></i>
            </el-link>
            <!--            <el-link :underline="false" href="/oauth2/authorization/qq">-->
            <!--              <img src="@/assets/img/qq.png" alt="QQ登录">-->
            <!--            </el-link>-->
          </div>
        </el-collapse-transition>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import ImageCaptcha from '@/views/common/ImageCaptcha'
import {base64Decode} from "@/util";

export default {
  name: "Login",
  components: {
    ImageCaptcha
  },
  data: function () {
    return {
      loading: false,
      moreLoginVisible: false,
      loginForm: {
        formData: {
          username: "",
          password: "",
          captcha: "",
          remember: false,
          'auth-type': "PASSWORD"
        },
        rules: {
          username: [
            {required: true, message: "请输入账号", trigger: "blur"}
          ],
          password: [
            {required: true, message: "请输入密码", trigger: "blur"}
          ],
          captcha: [
            {required: true, message: "请输入验证码", trigger: "blur"}
          ]
        }
      },
      redirect: undefined,
      otherQuery: {}
    }
  },
  computed: {
    errorMsg() {
      let str = this.$route.params.msg || this.$route.query.msg;
      if (str && str.length > 13) {
        str = str.substring(0, 10) + "...";
      }
      return str;
    }
  },
  methods: {
    routerPush(event) {
      const a = event.currentTarget
      this.$router.push({
        path: a.attributes.index.value
      });
    },
    submitForm() {
      this.$refs.loginForm.validate((valid) => {
        if (!valid) {
          return false;
        }
        this.loading = true;
        this.$axios.post("/login", this.loginForm.formData).then(({data}) => {
          if (data.code === 0) {
            this.$store.commit("setIsLogin", true);
            this.$store.commit("setUser", base64Decode(data.data));
            this.$router.push({path: this.redirect || "/main/personal", query: this.otherQuery});
          } else {
            this.$warning(data.msg);
            this.$refs.imageCaptcha.flushCaptcha();
          }
          this.loading = false;
        }).catch((err) => {
          this.$error(err.toString());
          this.loading = false;
        })
      });
    },
    moreLogin(event) {
      this.moreLoginVisible = !this.moreLoginVisible;
      const i = event.currentTarget.getElementsByTagName("i")[0]
      if (this.moreLoginVisible) {
        i.classList.add("is-active")
      } else {
        i.classList.remove("is-active")
      }
    },
    getOtherQuery(query) {
      return Object.keys(query).reduce((acc, cur) => {
        if (cur !== "redirect") {
          acc[cur] = query[cur];
        }
        return acc;
      }, {})
    },
    clearErrorMsg() {
      this.$route.query.msg = undefined;
      this.$route.params.msg = undefined;
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
  padding-top: 10%;
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

.login-wrap .el-input__icon {
  width: unset !important;
}

.login-wrap .iconfont {
  font-size: 40px !important;
  line-height: 40px !important;
  margin-left: 10px;
  margin-right: 10px;
}

</style>
