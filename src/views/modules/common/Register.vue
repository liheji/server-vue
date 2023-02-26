<template>
  <div class="register-wrap">
    <el-form ref="registerForm"
             class="register-form"
             :rules="registerForm.rules"
             :model="registerForm.formData">
      <div class="register-face"><img src="@/assets/img/logo.png" alt="logo"></div>
      <el-form-item prop="username">
        <el-input type="text"
                  maxlength="18"
                  v-model="registerForm.formData.username"
                  placeholder="账号"
                  autocomplete="on"
                  :validate-event="false">
          <i class="el-icon-user el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password"
                  v-model="registerForm.formData.password"
                  placeholder="密码"
                  autocomplete="on"
                  maxlength="18">
          <i class="el-icon-lock el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="rePassword">
        <el-input type="password"
                  v-model="registerForm.formData.rePassword"
                  placeholder="确认密码"
                  autocomplete="on"
                  maxlength="18">
          <i class="el-icon-lock el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="licence">
        <el-input type="text"
                  v-model="registerForm.formData.licence"
                  placeholder="授权码"
                  autocomplete="on"
                  maxlength="32">
          <i class="el-icon-server-license el-input__icon iconfont" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="captcha">
        <image-captcha v-model="registerForm.formData.captcha"
                       ref="imageCaptcha"
                       @submitForm="submitForm">
        </image-captcha>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" style="width: 100%;" @click.native.prevent="submitForm">注册
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
import ImageCaptcha from '@/views/common/ImageCaptcha'

export default {
  name: "Register",
  components: {
    ImageCaptcha
  },
  data: function () {
    const validateUname = (rule, value, callback) => {
      if (!/^[a-zA-Z]\w+$/.test(value)) {
        callback(new Error('必须以字母开头'));
        return;
      }

      this.$sync({
        url: "/before/accountUnique",
        method: "get",
        params: {param: value}
      }).then(({data}) => {
        if (data && data.code === 0) {
          callback(new Error('用户已存在'));
        } else {
          callback();
        }
      }).catch((ignored) => {
        callback(new Error('校验出错，请再次尝试'));
      });
    };

    const validateRePwd = (rule, value, callback) => {
      if (this.registerForm.formData.password !== this.registerForm.formData.rePassword) {
        callback(new Error('密码不一致'));
      } else {
        callback();
      }
    };

    return {
      loading: false,
      registerForm: {
        formData: {
          username: "",
          password: "",
          rePassword: "",
          licence: "",
          captcha: "",
        },
        rules: {
          username: [
            {required: true, message: "请输入账号", trigger: "blur"},
            {min: 5, max: 18, message: "长度应在5-18", trigger: "blur"},
            {validator: validateUname}
          ],
          password: [
            {required: true, message: "请输入密码", trigger: "blur"},
            {min: 5, max: 18, message: "长度应在5-18", trigger: "blur"},
          ],
          rePassword: [
            {required: true, message: "请输入确认密码", trigger: "blur"},
            {min: 5, max: 18, message: "长度应在5-18", trigger: "blur"},
            {validator: validateRePwd, trigger: "blur"}
          ],
          licence: [
            {required: true, message: "请输入授权码", trigger: "blur"},
            {min: 32, max: 32, message: "长度应为32", trigger: "blur"}
          ],
          captcha: [
            {required: true, message: "请输入验证码", trigger: "blur"}
          ]
        }
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.registerForm.validate((valid) => {
        if (!valid) {
          return false;
        }
        this.loading = true;
        this.$axios.post("/before/register", this.registerForm.formData).then(({data}) => {
          if (data.code === 0) {
            this.$success(data.msg);
            this.$router.push({name: "login"});
          } else {
            this.$warning(data.msg);
            this.$refs.imageCaptcha.flushCaptcha()
          }
          this.loading = false;
        }).catch((err) => {
          this.$error(err.toString());
          this.loading = false;
        })
      });
    }
  }
}
</script>

<style>
.register-wrap {
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

.register-wrap .register-form {
  margin: 0 auto;
  width: 300px;
  padding: 30px 35px 15px 35px;
  background: #fff;
  border: 1px solid #eaeaea;
  text-align: left;
  box-shadow: 0 0 20px 2px rgba(0, 0, 0, 0.1);

  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  border-radius: 10px;
}

.register-wrap .register-face {
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

.register-wrap img {
  width: 100%
}
</style>
