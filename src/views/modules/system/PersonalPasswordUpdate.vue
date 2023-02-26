<template>
  <div>
    <el-dialog
        title="修改密码"
        width="400px"
        :close-on-click-modal="false"
        :visible.sync="visible">
      <el-form label-width="0" :model="dataForm" :rules="dataRules" ref="dataForm">
        <el-form-item prop="value">
          <el-input type="password" v-model="dataForm.value" autocomplete="off" placeholder="原密码"></el-input>
        </el-form-item>

        <el-form-item prop="newPassword">
          <el-input type="password" v-model="dataForm.newPassword" autocomplete="off"
                    placeholder="新密码"></el-input>
        </el-form-item>
        <el-form-item prop="reNewPassword">
          <el-input type="password" v-model="dataForm.reNewPassword" autocomplete="off"
                    placeholder="再次输入新密码"></el-input>
        </el-form-item>
        <el-form-item prop="captcha" style="margin-bottom: 5px;">
          <image-captcha v-model="dataForm.captcha"
                         ref="imageCaptcha"
                         @submitForm="dataFormSubmit">
          </image-captcha>
        </el-form-item>
      </el-form>

      <div slot="footer">
        <el-button @click="visible = false;$refs.dataForm.resetFields()">取消</el-button>
        <el-button type="primary" @click="dataFormSubmit">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
import ImageCaptcha from '@/views/common/ImageCaptcha'

export default {
  components: {
    ImageCaptcha
  },
  data() {
    const validateRePwd = (rule, value, callback) => {
      if (this.dataForm.newPassword !== this.dataForm.reNewPassword) {
        callback(new Error('密码不一致'));
      } else {
        callback();
      }
    };

    return {
      visible: false,
      dataForm: {
        value: "",
        newPassword: "",
        reNewPassword: "",
        captcha: "",
        property: "password"
      },
      dataRules: {
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
          {required: true, message: "请输入验证码", trigger: "blur"}
        ]
      }
    }
  },
  methods: {
    init() {
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        this.$refs.imageCaptcha.flushCaptcha()
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          this.$axios.put("/account/personal", this.dataForm).then(({data}) => {
            if (data.code === 0) {
              this.$message({
                message: data.msg,
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.visible = false
                }
              })
            } else {
              this.$warning(data.msg);
              this.$refs.imageCaptcha.flushCaptcha()
            }
          }).catch((err) => {
            this.$error(err.toString());
          })
        }
      })
    }
  }
}
</script>
