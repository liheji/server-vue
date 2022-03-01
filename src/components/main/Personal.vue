<template>
  <div class="account-wrap">
    <el-descriptions title="用户信息" :column="1">
      <el-descriptions-item label="用户名">{{ $bus.user.username }}</el-descriptions-item>
      <el-descriptions-item label="手机号">
        <el-form ref="mobileForm" label-width="0" v-if="mobileVisible" class="mobile"
                 size="mini"
                 :inline="true"
                 :rules="mobileRules"
                 :model="mobileForm">
          <el-form-item prop="mobile">
            <el-input v-model="mobileForm.mobile" placeholder="手机号"></el-input>
          </el-form-item>
          <el-form-item>
            <el-button type="primary" @click="bindMobile">确认</el-button>
          </el-form-item>
        </el-form>
        <span v-else>
          {{ $bus.user.mobile || "未绑定" }}
          <el-link style="margin-left: 10px;" v-if="exitMobile" type="primary"
                   @click="bindMobile">
            解绑
          </el-link>
          <el-link style="margin-left: 10px;" v-else type="primary"
                   @click="mobileVisible=!mobileVisible">
            绑定
          </el-link>
        </span>
      </el-descriptions-item>
      <el-descriptions-item label="E-mail">
        {{ $bus.user.email || "未绑定" }}
        <el-link style="margin-left: 10px;" v-if="exitEmail" type="primary"
                 @click="emailVisible=!emailVisible;emailForm.email=$bus.user.email">
          解绑
        </el-link>
        <el-link style="margin-left: 10px;" v-else type="primary"
                 @click="emailVisible=!emailVisible;emailForm.email=''">
          绑定
        </el-link>
      </el-descriptions-item>
      <el-descriptions-item label="状态">
        <el-tag size="small" v-if="$bus.user.isEnabled" type="success">正常</el-tag>
        <el-tag size="small" v-else type="danger">禁用</el-tag>
      </el-descriptions-item>
      <el-descriptions-item label="最后登录时间">{{ $bus.user.lastLogin | formatDate }}</el-descriptions-item>
      <el-descriptions-item label="最后更新时间">{{ $bus.user.updateTime | formatDate }}</el-descriptions-item>
      <el-descriptions-item label="加入时间">{{ $bus.user.createTime | formatDate }}</el-descriptions-item>
    </el-descriptions>
    <el-button type="primary" size="small" @click="flushCaptcha();pwdVisible=!pwdVisible">修改密码</el-button>

    <el-dialog
        title="绑定邮箱"
        width="400px"
        :close-on-click-modal="false"
        :visible.sync="emailVisible">
      <el-form label-width="0" :model="emailForm" :rules="emailRules" ref="emailForm">
        <el-form-item prop="email">
          <el-input type="text"
                    v-model="emailForm.email"
                    placeholder="邮箱"
                    :readonly="exitEmail"
                    autocomplete="on">
            <i class="iconfont el-icon-server-email el-input__icon" slot="prefix"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="key">
          <el-input type="text"
                    maxlength="6"
                    v-model="emailForm.key"
                    placeholder="校验码" autocomplete="on">
            <el-button slot="append"
                       style="margin: 0;width: 80px;border-radius: 0 4px 4px 0;padding: 13px 20px 12px 20px;"
                       :disabled="timing > 0"
                       :class="timing > 0 ? 'email-disactive' : 'email-active'"
                       @click="sendCaptcha">
              {{ timing > 0 ? timing : "获取" }}
            </el-button>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="emailVisible=!emailVisible">取消</el-button>
        <el-button type="primary"
                   :loading="loading"
                   @click="bindEmail">
          提交
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
        title="修改密码"
        width="400px"
        :close-on-click-modal="false"
        :visible.sync="pwdVisible">
      <el-form label-width="0" :model="pwdForm" :rules="pwdRules" ref="pwdForm">
        <el-form-item prop="password">
          <el-input type="password" v-model="pwdForm.password" autocomplete="off" placeholder="原密码"></el-input>
        </el-form-item>

        <el-form-item prop="newPassword">
          <el-input type="password" v-model="pwdForm.newPassword" autocomplete="off" placeholder="新密码"></el-input>
        </el-form-item>
        <el-form-item prop="reNewPassword">
          <el-input type="password" v-model="pwdForm.reNewPassword" autocomplete="off" placeholder="再次输入新密码"></el-input>
        </el-form-item>
        <el-form-item prop="captcha" style="margin-bottom: 5px;">
          <el-input type="text" maxlength="4"
                    v-model="pwdForm.captcha"
                    placeholder="验证码" autocomplete="off"
                    @keyup.enter.native="pwdSubmitForm">
            <template slot="append">
              <div class="img">
                <canvas id="verifyCanvas" width="100" height="38" style="cursor: pointer;">不支持canvas</canvas>
              </div>
            </template>
          </el-input>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="pwdVisible = false">取消</el-button>
        <el-button type="primary"
                   :loading="loading"
                   @click="pwdSubmitForm">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Personal",
  data() {
    const validateUname = (rule, value, callback) => {
      if (this.exitEmail) {
        callback();
      } else {
        this.$sync({
          url: "/before/usernameCheck",
          method: "get",
          params: {username: value}
        }).then(({data}) => {
          if (data && data.result) {
            callback(new Error('邮箱已存在'));
          } else {
            callback();
          }
        }).catch((ignored) => {
          callback(new Error('校验错误'));
        });
      }
    };

    const validateRePwd = (rule, value, callback) => {
      if (this.pwdForm.newPassword !== this.pwdForm.reNewPassword) {
        callback(new Error('密码不一致'));
      } else {
        callback();
      }
    };

    const validateMobile = (rule, value, callback) => {
      if (!/^((\+86)|(86))?1\d{10}$/g.test(value)) {
        return callback(new Error("手机号格式错误"));
      }

      callback();
    };

    return {
      timing: 0,
      loading: false,
      pwdVisible: false,
      emailVisible: false,
      mobileVisible: false,
      uploadData: {
        token: this.token
      },
      pwdForm: {
        password: "",
        newPassword: "",
        reNewPassword: "",
        captcha: ""
      },
      pwdRules: {
        password: [
          {required: true, message: "请输入密码", trigger: "blur"}
        ],
        newPassword: [
          {required: true, message: "请输入新密码", trigger: "blur"},
          {min: 5, max: 18, message: "长度应在5-18间", trigger: "blur"}
        ],
        reNewPassword: [
          {required: true, message: "请输入确认密码", trigger: "blur"},
          {validator: validateRePwd, trigger: "blur"}
        ],
        captcha: [
          {required: true, message: "请输入验证码", trigger: "blur"},
          {min: 4, max: 4, message: "长度应为四", trigger: "change"},
        ],
      },
      emailForm: {
        email: this.$bus.user.email,
        key: ""
      },
      emailRules: {
        email: [
          {required: true, message: "请输入邮箱", trigger: "blur"},
          {type: 'email', message: "邮箱格式错误", trigger: "blur"},
          {validator: validateUname, trigger: "blur"}
        ],
        key: [
          {required: true, message: "请输入校验码", trigger: "blur"},
          {min: 6, max: 6, message: "长度应为6", trigger: "change"}
        ]
      },
      mobileForm: {
        mobile: this.$bus.user.mobile,
      },
      mobileRules: {
        mobile: [
          {required: true, message: "请输入手机号", trigger: "blur"},
          {min: 11, max: 14, message: "手机号格式错误", trigger: "blur"},
          {validator: validateMobile, trigger: "blur"}
        ]
      }
    };
  },
  computed: {
    exitMobile() {
      return !!this.$bus.user.mobile;
    },
    exitEmail() {
      return !!this.$bus.user.email;
    }
  },
  methods: {
    sendCaptcha() {
      this.timing = 60;
      this.startTimer();
      this.$axios.get("/emailCaptcha", {
        params: {receiver: this.emailForm.email}
      }).then(({data}) => {
        if (data.code === 0) {
          this.$success(data.msg);
        } else {
          this.$warning(data.msg);
        }
      }).catch((err) => {
        this.$error(err.toString());
      })
    },
    pwdSubmitForm() {
      this.$refs.pwdForm.validate((valid) => {
        if (!valid) {
          return false;
        }
        this.loading = true;
        this.$axios.put("/account/personal", {}, {
          params: this.pwdForm
        }).then(({data}) => {
          if (data.code === 0) {
            this.$success(data.msg);
            //清除数据
            this.$refs.pwdForm.resetFields();
            // 隐藏窗口
            this.pwdVisible = false;
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
    bindEmail() {
      //新建数据
      const formData = {
        email: this.emailForm.email,
        key: this.emailForm.key,
      };
      if (this.exitEmail) {
        formData.email = "";
        this.$refs.emailForm.validateField("key", (str) => {
          if (str) {
            return false;
          }
          this.baseBindEmail(formData);
        });
      } else {
        this.$refs.emailForm.validate((valid) => {
          if (!valid) {
            return false;
          }
          this.baseBindEmail(formData);
        });
      }
    },
    bindMobile() {
      const formData = {mobile: this.mobileForm.mobile};
      if (this.exitMobile) {
        formData.mobile = "";
        this.baseBindMobile(formData)
      } else {
        this.$refs.mobileForm.validate((valid) => {
          if (!valid) {
            return false;
          }
          this.baseBindMobile(formData)
        });
      }
    },
    baseBindEmail(formData) {
      this.loading = true;
      this.$axios.put("/account/personal", {}, {
        params: formData
      }).then(({data}) => {
        if (data.code === 0) {
          this.emailForm.email = '';
          this.$bus.user.email = formData.email;
          this.emailVisible = false;
        } else {
          this.$warning(data.msg);
        }
        this.loading = false;
      }).catch((err) => {
        this.$error(err.toString());
        this.loading = false;
      });
    },
    baseBindMobile(formData) {
      this.loading = true;
      this.$axios.put("/account/personal", {}, {
        params: formData
      }).then(({data}) => {
        if (data.code === 0) {
          this.mobileForm.mobile = '';
          this.$bus.user.mobile = formData.mobile;
        } else {
          this.$warning(data.msg);
        }
        this.loading = false;
        this.mobileVisible = false;
      }).catch((err) => {
        this.$error(err.toString());

        this.loading = false;
        this.mobileVisible = false;
      });
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
    }
  },
  mounted() {
    if (!this.token) {
      delete this.uploadData.token;
    }
  },
  beforeDestroy() {
    clearInterval(this.timer);
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.account-wrap {
  margin: 20px;
}

.account-wrap .el-input-group__append .img {
  position: relative;
  margin: 0;
  padding: 0;
  cursor: pointer;
  width: 100px;
  height: 38px;
}

.account-wrap .email-active {
  color: #FFF !important;
  background-color: #409EFF !important;
  border-color: #409EFF !important;
}

.account-wrap .email-disactive {
  pointer-events: none !important;;
}

.account-wrap .mobile .el-form-item {
  margin-bottom: 0 !important;
}

.account-wrap .el-descriptions-item__container {
  line-height: 28px !important;
}

.account-wrap .el-input-group__append {
  padding: 0 !important;
}
</style>
