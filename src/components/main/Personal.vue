<template>
  <div class="account-wrap">
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
        <el-link style="margin-left: 10px;" v-if="exitMobile" type="primary"
                 @click="mobileDialogVisible=!mobileDialogVisible;mobileForm.formData.value=user.mobile">
          解绑
        </el-link>
        <el-link style="margin-left: 10px;" v-else type="primary"
                 @click="mobileDialogVisible=!mobileDialogVisible;mobileForm.formData.value=''">
          绑定
        </el-link>
      </el-descriptions-item>
      <el-descriptions-item label="E-mail">
        {{ user.email || "未绑定" }}
        <el-link style="margin-left: 10px;" v-if="exitEmail" type="primary"
                 @click="emailDialogVisible=!emailDialogVisible;emailForm.formData.value=user.email">
          解绑
        </el-link>
        <el-link style="margin-left: 10px;" v-else type="primary"
                 @click="emailDialogVisible=!emailDialogVisible;emailForm.formData.value=''">
          绑定
        </el-link>
      </el-descriptions-item>
      <el-descriptions-item label="最后登录时间">{{ user.lastLogin | formatDate }}</el-descriptions-item>
      <el-descriptions-item label="最后更新时间">{{ user.updateTime | formatDate }}</el-descriptions-item>
      <el-descriptions-item label="加入时间">{{ user.createTime | formatDate }}</el-descriptions-item>
    </el-descriptions>
    <el-button type="primary" size="small" @click="flushCaptcha();pwdDialogVisible=true">修改密码</el-button>

    <el-dialog
        title="绑定或解绑手机号"
        width="400px"
        :close-on-click-modal="false"
        :visible.sync="mobileDialogVisible">
      <el-form label-width="0" :model="mobileForm.formData" :rules="mobileForm.rules" ref="mobileForm">
        <el-form-item prop="value">
          <el-input type="text"
                    v-model="mobileForm.formData.value"
                    placeholder="手机号"
                    :readonly="exitMobile"
                    autocomplete="on">
            <i class="el-icon-server-mobile el-input__icon iconfont" slot="prefix"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="captcha">
          <el-input type="text"
                    maxlength="6"
                    v-model="mobileForm.formData.captcha"
                    placeholder="校验码" autocomplete="on">
            <el-button slot="append"
                       style="margin: 0;width: 80px;border-radius: 0 4px 4px 0;padding: 13px 20px 12px 20px;"
                       :disabled="timing > 0"
                       :class="timing > 0 ? 'timing-disactive' : 'timing-active'"
                       @click="sendCaptcha(mobileForm.formData.value, 'mobile')">
              {{ timing > 0 ? timing : "获取" }}
            </el-button>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="mobileDialogVisible=!mobileDialogVisible">取消</el-button>
        <el-button type="primary"
                   :loading="loading"
                   @click="bindMobile">
          提交
        </el-button>
      </div>
    </el-dialog>

    <el-dialog
        title="绑定或解绑邮箱"
        width="400px"
        :close-on-click-modal="false"
        :visible.sync="emailDialogVisible">
      <el-form label-width="0" :model="emailForm.formData" :rules="emailForm.rules" ref="emailForm">
        <el-form-item prop="value">
          <el-input type="text"
                    v-model="emailForm.formData.value"
                    placeholder="邮箱"
                    :readonly="exitEmail"
                    autocomplete="on">
            <i class="el-icon-server-email el-input__icon iconfont" slot="prefix"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="captcha">
          <el-input type="text"
                    maxlength="6"
                    v-model="emailForm.formData.captcha"
                    placeholder="校验码" autocomplete="on">
            <el-button slot="append"
                       style="margin: 0;width: 80px;border-radius: 0 4px 4px 0;padding: 13px 20px 12px 20px;"
                       :disabled="timing > 0"
                       :class="timing > 0 ? 'timing-disactive' : 'timing-active'"
                       @click="sendCaptcha(emailForm.formData.value,'email')">
              {{ timing > 0 ? timing : "获取" }}
            </el-button>
          </el-input>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="emailDialogVisible=!emailDialogVisible">取消</el-button>
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
        :visible.sync="pwdDialogVisible">
      <el-form label-width="0" :model="pwdForm.formData" :rules="pwdForm.rules" ref="pwdForm">
        <el-form-item prop="value">
          <el-input type="password" v-model="pwdForm.formData.value" autocomplete="off" placeholder="原密码"></el-input>
        </el-form-item>

        <el-form-item prop="newPassword">
          <el-input type="password" v-model="pwdForm.formData.newPassword" autocomplete="off"
                    placeholder="新密码"></el-input>
        </el-form-item>
        <el-form-item prop="reNewPassword">
          <el-input type="password" v-model="pwdForm.formData.reNewPassword" autocomplete="off"
                    placeholder="再次输入新密码"></el-input>
        </el-form-item>
        <el-form-item prop="captcha" style="margin-bottom: 5px;">
          <el-input type="text" maxlength="4"
                    v-model="pwdForm.formData.captcha"
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
        <el-button @click="pwdDialogVisible = false;$refs.pwdForm.resetFields()">取消</el-button>
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
import {mapState} from 'vuex'
import {genRandomString} from "@/util";

export default {
  name: "Personal",
  data() {
    const validateEmail = (rule, value, callback) => {
      if (this.exitEmail) {
        callback();
      } else {
        this.$sync({
          url: "/before/uniqueCheck",
          method: "get",
          params: {param: value}
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
      if (this.pwdForm.formData.newPassword !== this.pwdForm.formData.reNewPassword) {
        callback(new Error('密码不一致'));
      } else {
        callback();
      }
    };

    const validateMobile = (rule, value, callback) => {
      if (this.exitMobile) {
        callback();
      } else {
        if (!/^((\+86)|(86))?1\d{10}$/g.test(value)) {
          return callback(new Error("手机号格式错误"));
        }

        this.$sync({
          url: "/before/uniqueCheck",
          method: "get",
          params: {param: value}
        }).then(({data}) => {
          if (data && data.result) {
            callback(new Error('手机号已存在'));
          } else {
            callback();
          }
        }).catch((ignored) => {
          callback(new Error('校验错误'));
        });
      }
    };

    return {
      timing: 0,
      loading: false,
      pwdDialogVisible: false,
      emailDialogVisible: false,
      mobileDialogVisible: false,
      pwdForm: {
        formData: {
          value: "",
          newPassword: "",
          reNewPassword: "",
          captcha: "",
          property: "password"
        },
        rules: {
          value: [
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
        }
      },
      emailForm: {
        formData: {
          value: this.$store.state.user.email,
          captcha: "",
          property: "email"
        },
        rules: {
          value: [
            {required: true, message: "请输入邮箱", trigger: "blur"},
            {type: 'email', message: "邮箱格式错误", trigger: "blur"},
            {validator: validateEmail, trigger: "blur"}
          ],
          captcha: [
            {required: true, message: "请输入校验码", trigger: "blur"},
            {min: 6, max: 6, message: "长度应为6", trigger: "change"}
          ]
        }
      },
      mobileForm: {
        formData: {
          value: this.$store.state.user.mobile,
          captcha: "",
          property: "mobile"
        },
        rules: {
          value: [
            {required: true, message: "请输入手机号", trigger: "blur"},
            {min: 11, max: 14, message: "手机号格式错误", trigger: "blur"},
            {validator: validateMobile, trigger: "blur"}
          ],
          captcha: [
            {required: true, message: "请输入校验码", trigger: "blur"},
            {min: 6, max: 6, message: "长度应为6", trigger: "change"}
          ]
        }
      }
    };
  },
  computed: {
    ...mapState(['user']),
    exitMobile() {
      return !!this.user.mobile;
    },
    exitEmail() {
      return !!this.user.email;
    }
  },
  methods: {
    sendCaptcha(receiver, property) {
      this.timing = 60;
      this.startTimer();
      this.$axios.get("/sendCaptcha", {
        params: {receiver: receiver, property: property}
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
    },
    pwdSubmitForm() {
      this.$refs.pwdForm.validate((valid) => {
        if (!valid) {
          return false;
        }

        this.loading = true;
        this.$axios.put("/account/personal", this.pwdForm.formData).then(({data}) => {
          if (data.code === 0) {
            this.$success(data.msg);
            //清除数据
            this.$refs.pwdForm.resetFields();
            // 隐藏窗口
            this.pwdDialogVisible = false;
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
      if (this.exitEmail) {
        this.emailForm.formData.value = "";
        this.$refs.emailForm.validateField("captcha", (valid) => {
          if (valid) {
            return false;
          }
          this.baseBindEmail();
        });
      } else {
        this.$refs.emailForm.validate((valid) => {
          if (!valid) {
            return false;
          }
          this.baseBindEmail();
        });
      }
    },
    bindMobile() {
      if (this.exitMobile) {
        this.mobileForm.formData.value = "";
        this.$refs.mobileForm.validateField("captcha", (valid) => {
          if (valid) {
            return false;
          }
          this.baseBindMobile()
        });
      } else {
        this.$refs.mobileForm.validate((valid) => {
          if (!valid) {
            return false;
          }
          this.baseBindMobile()
        });
      }
    },
    baseBindEmail() {
      this.loading = true;
      this.$axios.put("/account/personal", this.emailForm.formData).then(({data}) => {
        if (data.code === 0) {
          this.$store.commit("setUserProperty", {
            property: this.emailForm.formData.property,
            value: this.emailForm.formData.value
          });
          this.$refs.emailForm.resetFields();
          this.emailDialogVisible = false;
          clearInterval(this.timer);
          this.timing = 0;
        } else {
          this.$warning(data.msg);
        }
        this.loading = false;
      }).catch((err) => {
        this.$error(err.toString());
        this.loading = false;
      });
    },
    baseBindMobile() {
      this.loading = true;
      this.$axios.put("/account/personal", this.mobileForm.formData).then(({data}) => {
        if (data.code === 0) {
          this.$store.commit("setUserProperty", {
            property: this.mobileForm.formData.property,
            value: this.mobileForm.formData.value
          })
          this.$refs.mobileForm.resetFields();
          this.mobileDialogVisible = false;
          clearInterval(this.timer);
          this.timing = 0;
        } else {
          this.$warning(data.msg);
        }
        this.loading = false;
      }).catch((err) => {
        this.$error(err.toString());
        this.loading = false;
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

.account-wrap .timing-active {
  color: #FFF !important;
  background-color: #409EFF !important;
  border-color: #409EFF !important;
}

.account-wrap .timing-disactive {
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
