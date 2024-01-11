<template>
  <div class="forget-wrap">
    <el-form ref="forgetForm"
             class="forget-form"
             :rules="forgetForm.rules"
             :model="forgetForm.formData">
      <div class="forget-face"><img src="@/assets/img/logo.png" alt="logo"></div>
      <el-form-item prop="username">
        <el-input type="text"
                  v-model="forgetForm.formData.username"
                  placeholder="邮箱或手机号"
                  autocomplete="on"
                  :validate-event="false">
          <i class="el-icon-user el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="key">
        <send-captcha v-model="forgetForm.formData.key"
                      ref="sendCaptcha"
                      @sendCaptcha="sendCaptcha">
        </send-captcha>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password"
                  v-model="forgetForm.formData.password"
                  placeholder="密码"
                  autocomplete="on"
                  maxlength="18">
          <i class="el-icon-lock el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="rePassword">
        <el-input type="password"
                  v-model="forgetForm.formData.rePassword"
                  placeholder="确认密码"
                  autocomplete="on"
                  maxlength="18">
          <i class="el-icon-lock el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="captcha" class="captcha">
        <image-captcha v-model="forgetForm.formData.captcha"
                       ref="imageCaptcha"
                       @submitForm="submitForm">
        </image-captcha>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" style="width: 100%;" @click.native.prevent="submitForm">提交修改
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
import SendCaptcha from '@/views/common/SendCaptcha'
import ImageCaptcha from '@/views/common/ImageCaptcha'

export default {
  name: "Forget",
  components: {
    SendCaptcha,
    ImageCaptcha
  },
  data: function () {
    const validateUname = (rule, value, callback) => {
      if (!/^[A-Za-z0-9\u4e00-\u9fa5]+@[a-zA-Z0-9_-]+(\.[a-zA-Z0-9_-]+)+$/.test(value) &&
          !/^1(3[0-9]|4[01456879]|5[0-35-9]|6[2567]|7[0-8]|8[0-9]|9[0-35-9])\d{8}$/.test(value)) {
        callback(new Error('邮箱或手机号格式错误'));
        return;
      }

      this.$sync({
        url: "/before/accountUnique",
        method: "get",
        params: {param: value}
      }).then(({data}) => {
        if (data && data.code === 0) {
          callback();
        } else {
          callback(new Error('用户未绑定邮箱或手机号'));
        }
      }).catch((ignored) => {
        callback(new Error('校验出错，请再次尝试'));
      });
    };

    const validateRePwd = (rule, value, callback) => {
      if (this.forgetForm.formData.password !== this.forgetForm.formData.rePassword) {
        callback(new Error('密码不一致'));
      } else {
        callback();
      }
    };

    return {
      loading: false,
      forgetForm: {
        formData: {
          username: "",
          password: "",
          rePassword: "",
          key: "",
          captcha: "",
        },
        rules: {
          username: [
            {required: true, message: "请输入邮箱或手机号", trigger: "blur"},
            {validator: validateUname}
          ],
          key: [
            {required: true, message: "请输入校验码", trigger: "blur"},
            {min: 4, max: 4, message: "长度应为四", trigger: "blur"}
          ],
          password: [
            {required: true, message: "请输入密码", trigger: "blur"},
            {min: 5, max: 18, message: "长度应在5-18", trigger: "blur"}
          ],
          rePassword: [
            {required: true, message: "请确认密码", trigger: "blur"},
            {min: 5, max: 18, message: "长度应在5-18", trigger: "blur"},
            {validator: validateRePwd, trigger: "blur"}
          ],
          captcha: [
            {required: true, message: "请输入验证码", trigger: "blur"}
          ]
        }
      }
    }
  },
  methods: {
    sendCaptcha() {
      this.$refs.forgetForm.validateField("username", (valid) => {
        if (valid) {
          return false;
        }

        this.$refs.sendCaptcha.start();
        this.$axios.get("/before/sendCaptcha", {
          params: {
            receiver: this.forgetForm.formData.username,
            property: this.forgetForm.formData.username.indexOf("@") >= 0 ? "email" : "mobile"
          }
        }).then(({data}) => {
          if (data.code === 0) {
            this.$success(data.msg);
          } else {
            this.$warning(data.msg);
          }
        }).catch((err) => {
          this.$error(err.toString());
        });
      });
    },
    submitForm() {
      this.$refs.forgetForm.validate((valid) => {
        if (!valid) {
          return false;
        }
        this.loading = true;
        this.$axios.post("/before/forget", this.forgetForm.formData).then(({data}) => {
          if (data.code === 0) {
            this.$success(data.msg);
            this.$router.push({name: "login"});
          } else {
            this.$warning(data.msg);
            this.$refs.imageCaptcha.flushCaptcha()
            this.$refs.sendCaptcha.clear();
          }
          this.loading = false;
        }).catch((err) => {
          this.$error(err.toString());
          this.loading = false;
        });
      });
    }
  }
}
</script>

<style>
.forget-wrap {
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

.forget-wrap .forget-form {
  margin: 0 auto;
  width: 300px;
  padding: 30px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  text-align: left;
  box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.1);

  -webkit-border-radius: 8px;
  -moz-border-radius: 8px;
  border-radius: 8px;
}

.forget-wrap .forget-face {
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

.forget-wrap img {
  width: 100%
}
</style>
