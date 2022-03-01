<template>
  <div class="forget-wrap">
    <el-form ref="forgetForm"
             class="forget-form"
             :rules="forgetRules"
             :model="forgetForm">
      <div class="forget-face"><img src="@/assets/img/logo.png" alt="logo"></div>
      <el-form-item prop="email">
        <el-input type="text"
                  v-model="forgetForm.email"
                  placeholder="邮箱"
                  autocomplete="on">
          <i class="iconfont el-icon-server-email el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="key">
        <el-input type="text"
                  maxlength="6"
                  v-model="forgetForm.key"
                  placeholder="校验码" autocomplete="on">
          <el-button slot="append"
                     style="width: 80px;border-radius: 0 4px 4px 0;padding: 13px 20px 12px 20px;"
                     :disabled="timing > 0"
                     :class="timing > 0 ? 'email-disactive' : 'email-active'"
                     @click="sendEmailCaptcha">
            {{ timing > 0 ? timing : "获取" }}
          </el-button>
        </el-input>
      </el-form-item>
      <el-form-item prop="password">
        <el-input type="password"
                  v-model="forgetForm.password"
                  placeholder="密码"
                  autocomplete="on"
                  maxlength="18">
          <i class="el-icon-lock el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="rePassword">
        <el-input type="password"
                  v-model="forgetForm.rePassword"
                  placeholder="确认密码"
                  autocomplete="on"
                  maxlength="18">
          <i class="el-icon-lock el-input__icon" slot="prefix"></i>
        </el-input>
      </el-form-item>
      <el-form-item prop="captcha" class="captcha">
        <el-input type="text"
                  maxlength="4"
                  v-model="forgetForm.captcha"
                  placeholder="验证码" autocomplete="on"
                  @keyup.enter.native="submitForm">
          <template slot="append">
            <div class="img">
              <canvas id="verifyCanvas" width="100" height="38" style="cursor: pointer;">不支持canvas</canvas>
            </div>
          </template>
        </el-input>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" :loading="loading" style="width: 100%;" @click.native.prevent="submitForm">提交修改
        </el-button>
      </el-form-item>
    </el-form>
  </div>
</template>
<script>
export default {
  name: "Forget",
  data: function () {
    const validateUname = (rule, value, callback) => {
      this.$sync({
        url: "/before/usernameCheck",
        method: "get",
        params: {username: value}
      }).then(({data}) => {
        if (data && data.result) {
          callback();
        } else {
          callback(new Error('邮箱不存在'));
        }
      }).catch((ignored) => {
        callback(new Error('校验错误'));
      });
    };

    const validateRePwd = (rule, value, callback) => {
      if (this.forgetForm.password !== this.forgetForm.rePassword) {
        callback(new Error('密码不一致'));
      } else {
        callback();
      }
    };

    return {
      loading: false,
      timing: 0,
      forgetForm: {
        email: "",
        password: "",
        rePassword: "",
        key: "",
        captcha: "",
      },
      forgetRules: {
        email: [
          {required: true, message: "请输入邮箱", trigger: "blur"},
          {type: 'email', message: "邮箱格式错误", trigger: "blur"},
          {validator: validateUname, trigger: "blur"}
        ],
        key: [
          {required: true, message: "请输入校验码", trigger: "blur"},
          {min: 6, max: 6, message: "长度应为6", trigger: "change"}
        ],
        password: [
          {required: true, message: "请输入密码", trigger: "blur"}
        ],
        rePassword: [
          {required: true, message: "请输入确认密码", trigger: "blur"},
          {validator: validateRePwd, trigger: "blur"}
        ],
        captcha: [
          {required: true, message: "请输入验证码", trigger: "blur"},
          {min: 4, max: 4, message: "长度应为四", trigger: "change"}
        ],
      }
    }
  },
  methods: {
    sendEmailCaptcha() {
      this.$refs.forgetForm.validateField("email", (valid) => {
        if (valid) {
          return false;
        }
        this.timing = 60;
        this.startTimer();
        this.$axios.get("/before/emailCaptcha", {
          params: {receiver: this.forgetForm.email}
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
        this.$axios.post("/before/forget", {}, {
          params: this.forgetForm
        }).then(({data}) => {
          if (data.code === 0) {
            this.$success(data.msg);
            this.$router.push({name: "login"});
          } else {
            this.$warning(data.msg);
            this.flushCaptcha();
          }
          this.loading = false;
        }).catch((err) => {
          this.$error(err.toString());
          this.loading = false;
        });
      });
    },
    startTimer() {
      clearInterval(this.timer);
      this.timer = setInterval(() => {
        if (this.timing <= 0) {
          this.timing = 0;
          clearInterval(this.timer);
        } else {
          this.timing--;
        }
      }, 1000);
    }
  },
  mounted() {
    this.flushCaptcha();
  },
  beforeDestroy() {
    clearInterval(this.timer);
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
  padding-top: 15%;
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

  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  border-radius: 10px;
}

.forget-wrap .img {
  position: relative;
  margin: 0;
  padding: 0;
  cursor: pointer;
  width: 100px;
  height: 38px;
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

.forget-wrap .captcha .el-input-group__append {
  padding: 0 !important;
}

.forget-wrap .email-active {
  color: #FFF !important;
  background-color: #409EFF !important;
  border-color: #409EFF !important;
}

.forget-wrap .email-disactive {
  pointer-events: none;
}
</style>
