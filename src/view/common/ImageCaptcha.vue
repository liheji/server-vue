<template>
  <el-input type="text"
            class="image-captcha-wrap"
            v-model="captcha"
            placeholder="验证码" autocomplete="on"
            @keyup.enter.native="submitForm"
            @input.once="clearErrorMsg">
    <template slot="append">
      <div class="img">
        <img id="verifyImg" width="100" height="38" style="cursor: pointer;border: none;"/>
      </div>
    </template>
  </el-input>
</template>

<script>
export default {
  props: {
    value: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      captcha: '',
    }
  },
  methods: {
    flushCaptcha() {
      this.$axios.get("/before/imageCaptcha")
          .then(({data}) => {
            const image = document.getElementById("verifyImg");
            image.setAttribute("src", data.data);
            image.onclick = () => {
              this.flushCaptcha();
            }
          }).catch((ignored) => {
      });
    },
    submitForm() {
      this.$emit('submitForm')
    },
    clearErrorMsg() {
      this.$emit('clearErrorMsg')
    }
  },
  watch: {
    captcha(val) {
      this.$emit('input', val)
    },
    value(val) {
      if (val === this.captcha) {
        return
      }
      this.captcha = val;
    }
  },
  mounted() {
    this.flushCaptcha();
  },
  activated() {
    this.flushCaptcha();
  }
}
</script>
<style>
.image-captcha-wrap .img {
  position: relative;
  margin: 0;
  padding: 0;
  cursor: pointer;
  width: 100px;
  height: 38px;
}

.image-captcha-wrap .el-input-group__append {
  padding: 0 !important;
}
</style>
