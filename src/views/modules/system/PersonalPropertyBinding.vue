<template>
  <div>
    <el-dialog
        :title="title"
        width="400px"
        :close-on-click-modal="false"
        :visible.sync="visible">
      <el-form label-width="0" :model="dataForm" :rules="dataRule" ref="dataForm">
        <el-form-item prop="value">
          <el-input type="text"
                    v-model="dataForm.value"
                    autocomplete="on"
                    :readonly="!isBinding"
                    :validate-event="false">
            <i :class="icon" slot="prefix"></i>
          </el-input>
        </el-form-item>
        <el-form-item prop="captcha">
          <send-captcha v-model="dataForm.captcha"
                        ref="sendCaptcha"
                        @sendCaptcha="sendCaptcha">
          </send-captcha>
        </el-form-item>
      </el-form>
      <div slot="footer">
        <el-button @click="visible=!visible">取消</el-button>
        <el-button type="primary" @click="dataFormSubmit">提交</el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import SendCaptcha from '@/views/common/SendCaptcha'

export default {
  components: {
    SendCaptcha
  },
  data() {
    return {
      icon: '',
      title: '',
      isBinding: false,

      visible: false,
      dataForm: {
        value: "",
        captcha: "",
        property: ""
      },
      dataRule: {
        value: [],
        captcha: [
          {required: true, message: "请输入校验码", trigger: "blur"},
          {min: 4, max: 4, message: "长度应为四", trigger: "change"}
        ]
      }
    }
  },
  methods: {
    init(row) {
      if (row == null || infoDict[row.property] === undefined) {
        this.$warning('不存在的属性');
        return;
      }
      // 修改验证规则
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        this.dataForm.value = row.value
        this.dataForm.property = row.property
        this.dataRule.value = validateDict[row.property](this)
        // 设置不同的属性
        this.isBinding = (row.value === "" || row.value == null)
        this.icon = iconDict[row.property]
        this.title = (this.isBinding ? '绑定' : '解绑') + infoDict[row.property]
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 清洗数据
          const formData = {
            value: this.isBinding ? this.dataForm.value : '',
            captcha: this.dataForm.captcha,
            property: this.dataForm.property
          }
          this.$axios.put("/account/personal", formData).then(({data}) => {
            if (data.code === 0) {
              this.$store.commit("setUserProperty", {
                property: formData.property,
                value: formData.value
              });
              this.$message({
                message: data.msg,
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.visible = false
                  this.$refs.sendCaptcha.clear();
                }
              })
            } else {
              this.$warning(data.msg);
            }
          }).catch((err) => {
            this.$error(err.toString());
          });
        }
      })
    },
    sendCaptcha() {
      this.$refs['dataForm'].validateField("value", (valid) => {
        if (!valid) {

          this.$refs.sendCaptcha.start();
          this.$axios.get("/sendCaptcha", {
            params: {receiver: this.dataForm.value, property: this.dataForm.property}
          }).then(({data}) => {
            if (data.code === 0) {
              this.$success(data.msg);
            } else {
              this.$warning(data.msg);
            }
          }).catch((err) => {
            this.$error(err.toString());
          })
        }
      })
    }
  }
}

const infoDict = {
  email: '邮箱',
  mobile: '手机号'
}

const iconDict = {
  email: 'el-icon-server-email-outline el-input__icon iconfont',
  mobile: 'el-input__icon el-icon-mobile'
}

const validateDict = {
  email: (that) => {
    return [
      {required: true, message: "请输入邮箱", trigger: "blur"},
      {type: 'email', message: "邮箱格式错误", trigger: "blur"},
      {
        validator: (rule, value, callback) => {
          if (that.isBinding === false) {
            callback();
          } else {
            that.$sync({
              url: "/before/accountUnique",
              method: "get",
              params: {param: value}
            }).then(({data}) => {
              if (data && data.code === 0) {
                callback(new Error('邮箱已存在'));
              } else {
                callback();
              }
            }).catch((ignored) => {
              callback(new Error('校验出错，请再次尝试提交'));
            });
          }
        }
      }
    ]
  },
  mobile: (that) => {
    return [
      {required: true, message: "请输入手机号", trigger: "blur"},
      {min: 11, max: 14, message: "手机号格式错误", trigger: "blur"},
      {
        validator: (rule, value, callback) => {
          if (that.isBinding === false) {
            callback();
          } else {
            if (!/^((\+86)|(86))?1\d{10}$/g.test(value)) {
              return callback(new Error("手机号格式错误"));
            }

            that.$sync({
              url: "/before/accountUnique",
              method: "get",
              params: {param: value}
            }).then(({data}) => {
              if (data && data.code === 0) {
                callback(new Error('手机号已存在'));
              } else {
                callback();
              }
            }).catch((ignored) => {
              callback(new Error('校验出错，请再次尝试提交'));
            });
          }
        }
      }
    ]
  }
}
</script>
