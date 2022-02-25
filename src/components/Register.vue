<template>
  <div class="register-wrap">
    <el-form ref="registerForm"
             class="register-form"
             :rules="registerRules"
             :model="registerForm">
      <div class="register-face"><img src="@/assets/img/logo.png" alt="logo"></div>
      <el-form-item prop="username">
        <el-input type="text"
                  maxlength="18"
                  v-model="registerForm.username"
                  placeholder="账号" autocomplete="on">
          <i class="el-icon-user el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password"
                  v-model="registerForm.password"
                  placeholder="密码"
                  autocomplete="on"
                  maxlength="18">
          <i class="el-icon-lock el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="rePassword">
        <el-input type="password"
                  v-model="registerForm.rePassword"
                  placeholder="确认密码"
                  autocomplete="on"
                  maxlength="18">
          <i class="el-icon-lock el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="licence">
        <el-input type="text"
                  v-model="registerForm.licence"
                  placeholder="授权码"
                  autocomplete="on"
                  maxlength="32">
          <i class="iconfont el-icon-server-license el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="captcha">
        <el-input type="text"
                  maxlength="4"
                  v-model="registerForm.captcha"
                  placeholder="验证码"
                  autocomplete="on"
                  @keyup.enter.native="submitForm">
          <template slot="append">
            <div class="img">
              <canvas id="verifyCanvas" width="100" height="38" style="cursor: pointer;">不支持canvas</canvas>
            </div>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" style="width: 100%;" @click.native.prevent="submitForm">注册
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<script>
export default {
  name: "Register",
  data: function () {
    const validateUname = (rule, value, callback) => {
      this.$sync({
        url: "/before/usernameCheck",
        method: "get",
        params: {username: value}
      }).then(({data}) => {
        if (data && data.result) {
          callback(new Error('用户已存在'));
        } else {
          callback();
        }
      }).catch((ignored) => {
        callback(new Error('校验错误'));
      });
    };

    const validateRePwd = (rule, value, callback) => {
      if (this.registerForm.password !== this.registerForm.rePassword) {
        callback(new Error('密码不一致'));
      } else {
        callback();
      }
    };

    return {
      loading: false,
      registerForm: {
        username: "",
        password: "",
        rePassword: "",
        licence: "",
        captcha: "",
        cid: "",
      },
      registerRules: {
        username: [
          {required: true, message: "请输入账号", trigger: "blur"},
          {validator: validateUname, trigger: "blur"}
        ],
        password: [
          {required: true, message: "请输入密码", trigger: "blur"}
        ],
        rePassword: [
          {required: true, message: "请输入确认密码", trigger: "blur"},
          {validator: validateRePwd, trigger: "blur"}
        ],
        licence: [
          {required: true, message: "请输入授权码", trigger: "blur"},
          {min: 32, max: 32, message: "长度应为32", trigger: "change"}
        ],
        captcha: [
          {required: true, message: "请输入验证码", trigger: "blur"},
          {min: 4, max: 4, message: "长度应为四", trigger: "change"}
        ],
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
        this.$axios.post("/before/register", {}, {
          params: this.registerForm
        }).then(({data}) => {
          if (data.code === 0) {
            this.$success(data.msg);
            this.$router.push({name: "login"});
          } else {
            this.$warning(data.msg);
            this.flushCaptcha(this.registerForm);
          }
          this.loading = false;
        }).catch((err) => {
          this.$error(err.toString());
          this.loading = false;
        })
      });
    }
  },
  mounted() {
    //数据渲染完以后加载验证码
    this.flushCaptcha(this.registerForm);
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
  padding-top: 15%;
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

.register-wrap .img {
  position: relative;
  margin: 0;
  padding: 0;
  cursor: pointer;
  width: 100px;
  height: 38px;
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

.register-wrap .el-input-group__append {
  padding: 0 !important;
}
</style>
