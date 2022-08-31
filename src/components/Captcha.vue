<template>
  <div class="captcha-wrap">
    <el-form ref="captchaForm"
             class="captcha-form"
             :rules="captchaForm.rules"
             :model="captchaForm.formData">
      <div class="captcha-face"><img src="@/assets/img/logo.png" alt="logo"></div>
      <el-form-item prop="username">
        <el-input type="text" maxlength="18"
                  v-model="captchaForm.formData.username"
                  :placeholder="property === 'email' ? '邮箱' : '手机号'" autocomplete="on"
                  @input.once="delete $route.params.msg">
          <i class="el-icon-user el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="text"
                  maxlength="6"
                  v-model="captchaForm.formData.password"
                  placeholder="校验码" autocomplete="on">
          <el-button slot="append"
                     style="margin: 0;width: 80px;border-radius: 0 4px 4px 0;padding: 13px 20px 12px 20px;"
                     :disabled="timing > 0"
                     :class="timing > 0 ? 'timing-disactive' : 'timing-active'"
                     @click="sendCaptcha">
            {{ timing > 0 ? timing : "获取" }}
          </el-button>
        </el-input>
      </el-form-item>
      <el-form-item style="margin-bottom: 0;">
        <el-checkbox v-model="captchaForm.formData.remember">14天免登录</el-checkbox>
        <div style="float: right;height: 40px;">
          <el-link :underline="false" @click="switchCaptchaType"
                   v-text="property === 'mobile'? '切换为邮箱' : '切换为手机号'"></el-link>
          &nbsp;
          <el-link :underline="false" index="/register" @click="routerPush">注册</el-link>
        </div>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" style="width: 100%;" @click.native.prevent="submitForm">登录
        </el-button>
      </el-form-item>
      <el-form-item style="margin-top:-20px;">
        <el-link :underline="false" @click="moreLogin">
          更多登录方式
          <i class="el-collapse-item__arrow el-icon-arrow-right"></i>
        </el-link>
        <el-collapse-transition>
          <div style="text-align: center;margin-top: 10px;" v-show="moreLoginVisible">
            <el-link :underline="false" index="/captcha" @click="routerPush">
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
          </div>
        </el-collapse-transition>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import {genRandomString} from "@/util";

export default {
  name: "Captcha",
  data: function () {
    const validateUsername = (rule, value, callback) => {
      const username = this.captchaForm.formData.username;
      if (this.property.trim().length <= 0 ||
          (this.property === "mobile" && !/^((\+86)|(86))?1\d{10}$/g.test(username))) {
        callback(new Error('密码不一致'));
        return;
      }

      if (this.property === "email" &&
          !/^[\w.-]+@([\w-]+\.)+\w+$/g.test(username)) {
        callback(new Error('密码不一致'));
        return;
      }

      callback()
    };

    return {
      timing: 0,
      loading: false,
      moreLoginVisible: false,
      property: "email",
      captchaForm: {
        formData: {
          username: "",
          password: "",
          remember: false,
          'auth-type': "CAPTCHA"
        },
        rules: {
          username: [
            {required: true, message: "请输入账号", trigger: "blur"},
            {validator: validateUsername, trigger: "blur"}
          ],
          password: [
            {required: true, message: "请输入校验码", trigger: "blur"},
            {min: 6, max: 6, message: "长度应为6", trigger: "change"}
          ]
        }
      },
      redirect: undefined,
      otherQuery: {}
    }
  },
  methods: {
    switchCaptchaType() {
      this.property = (this.property === 'mobile') ? 'email' : 'mobile';
    },
    routerPush({path}) {
      for (var p of path) {
        if (p.localName.trim() === "a") {
          this.$router.push({
            path: p.attributes.index.value
          });
          break
        }
      }
    },
    submitForm() {
      this.$refs.captchaForm.validate((valid) => {
        if (!valid) {
          return false;
        }
        this.loading = true;
        this.$axios.post("/login", this.captchaForm.formData).then(({data}) => {
          if (data.code === 0) {
            this.$store.commit("setIsLogin", true);
            this.$store.commit("setUser", data.data);
            this.$router.push({path: this.redirect || "/main/personal", query: this.otherQuery});
          } else {
            this.$warning(data.msg);
          }
          this.loading = false;
        }).catch((err) => {
          this.$error(err.toString());
          this.loading = false;
        })
      });
    },
    sendCaptcha() {
      this.$refs.captchaForm.validateField("username", (valid) => {
        if (valid) {
          return false;
        }

        this.timing = 60;
        this.startTimer();
        this.$axios.get("/before/sendCaptcha", {
          params: {
            receiver: this.captchaForm.formData.username,
            property: this.property
          }
        }).then(({data}) => {
          if (data.code === 0) {
            this.$success(data.msg);
          } else {
            this.$notify({
              type: 'success',
              title: '成功',
              dangerouslyUseHTMLString: true,
              message: "模拟请求<br>验证码发送成功<br>验证码：" + genRandomString(6)
            });
          }
        }).catch((err) => {
          this.$error(err.toString());
        })
      });
    },
    moreLogin({path}) {
      this.moreLoginVisible = !this.moreLoginVisible;
      for (var p of path) {
        if (p.localName.trim() === "span") {
          if (this.moreLoginVisible) {
            p.firstElementChild.classList.add("is-active")
          } else {
            p.firstElementChild.classList.remove("is-active")
          }
          break
        }
      }
    },
    startTimer() {
      this.timer = setInterval(() => {
        if (this.timing <= 0) {
          this.timing = 0;
          clearInterval(this.timer);
        } else {
          this.timing--;
        }
      }, 1000);
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.captcha-wrap {
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

.captcha-wrap .captcha-form {
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

.captcha-wrap .img {
  position: relative;
  margin: 0;
  padding: 0;
  cursor: pointer;
  width: 100px;
  height: 38px;
}

.captcha-wrap .captcha-face {
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

.captcha-wrap img {
  width: 100%
}

.captcha-wrap .el-input-group__append {
  padding: 0 !important;
}

.captcha-wrap .el-input__icon {
  width: unset !important;
}

.captcha-wrap .iconfont {
  font-size: 40px !important;
  line-height: 40px !important;
  margin-left: 10px;
  margin-right: 10px;
}

.captcha-wrap .timing-active {
  color: #FFF !important;
  background-color: #409EFF !important;
  border-color: #409EFF !important;
}
</style>
