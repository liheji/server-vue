<template>
  <div class="captcha-wrap">
    <el-form ref="captchaForm"
             class="captcha-form"
             :rules="captchaForm.rules"
             :model="captchaForm.formData">
      <div class="captcha-face"><img src="@/assets/img/logo.png" alt="logo"></div>
      <el-form-item prop="username">
        <el-input type="text"
                  v-model="captchaForm.formData.username"
                  :placeholder="property === 'email' ? '邮箱' : '手机号'" autocomplete="on"
                  @input.once="clearErrorMsg">
          <i class="el-icon-user el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <send-captcha v-model="captchaForm.formData.password"
                      ref="sendCaptcha"
                      @sendCaptcha="sendCaptcha">
        </send-captcha>
      </el-form-item>
      <el-form-item prop="captcha" style="margin-bottom: 5px;">
        <image-captcha v-model="captchaForm.formData.captcha"
                       ref="imageCaptcha"
                       @submitForm="submitForm"
                       @clearErrorMsg="clearErrorMsg">
        </image-captcha>
      </el-form-item>
      <el-form-item style="margin-bottom: 0;">
        <el-checkbox v-model="captchaForm.formData.remember">14天免登录</el-checkbox>
        <div style="float: right;height: 40px;">
          <el-link :underline="false" @click="switchCaptchaType"
                   v-text="property === 'mobile'? '邮箱登录' : '手机号登录'"></el-link>
          &nbsp;
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
            <el-link :underline="false" index="/login" @click="routerPush($event)">
              <i class="el-icon-server-passwd-color el-input__icon iconfont" title="密码登录"></i>
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
import SendCaptcha from '@/view/common/SendCaptcha'
import ImageCaptcha from '@/view/common/ImageCaptcha'
import {base64Decode} from "@/util";

export default {
  name: "Captcha",
  components: {
    SendCaptcha,
    ImageCaptcha
  },
  data: function () {
    const validateUsername = (rule, value, callback) => {
      const username = this.captchaForm.formData.username;
      if (this.property === "mobile" && !/^((\+86)|(86))?1\d{10}$/g.test(username)) {
        callback(new Error('请输入正确的手机号'));
        return;
      }

      if (this.property === "email" && !/^[\w.-]+@([\w-]+\.)+\w+$/g.test(username)) {
        callback(new Error('请输入正确的邮箱'));
        return;
      }

      callback()
    };

    return {
      loading: false,
      moreLoginVisible: false,
      property: "email",
      captchaForm: {
        formData: {
          username: "",
          password: "",
          remember: false,
          captcha: "",
          'auth-type': "CAPTCHA"
        },
        rules: {
          username: [
            {required: true, message: "账号不能为空", trigger: "blur"},
            {validator: validateUsername, trigger: "blur"}
          ],
          password: [
            {required: true, message: "请输入校验码", trigger: "blur"},
            {min: 4, max: 4, message: "长度应为四", trigger: "change"}
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
    switchCaptchaType() {
      this.property = (this.property === 'mobile') ? 'email' : 'mobile';
    },
    routerPush(event) {
      const a = event.currentTarget
      this.$router.push({
        path: a.attributes.index.value
      });
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
            this.$store.commit("setUser", base64Decode(data.data));
            this.$router.push({path: this.redirect || "/main/personal", query: this.otherQuery});
          } else {
            this.$warning(data.msg);
            this.$refs.imageCaptcha.flushCaptcha()
            this.$refs.sendCaptcha.clear();
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
        this.$refs.sendCaptcha.start();
        this.$axios.get("/before/sendCaptcha", {
          params: {
            receiver: this.captchaForm.formData.username,
            property: this.property
          }
        }).then(({data}) => {
          if (data.code === 0) {
            this.$success(data.msg);
          } else {
            this.$warning("暂不支持手机号登录");
          }
        }).catch((err) => {
          this.$error(err.toString());
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

.captcha-wrap .el-input__icon {
  width: unset !important;
}

.captcha-wrap .iconfont {
  font-size: 40px !important;
  line-height: 40px !important;
  margin-left: 10px;
  margin-right: 10px;
}

</style>
