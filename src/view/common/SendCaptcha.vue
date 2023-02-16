<template>
  <el-input type="text"
            class="send-captcha-wrap"
            maxlength="6"
            v-model="key"
            placeholder="校验码" autocomplete="on">
    <el-button slot="append"
               style="width: 80px;border-radius: 0 4px 4px 0;padding: 13px 20px 12px 20px;"
               :disabled="timing > 0"
               :class="timing > 0 ? 'timing-disactive' : 'timing-active'"
               @click="sendCaptcha">
      {{ timing > 0 ? timing : "获取" }}
    </el-button>
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
      timing: 0,
      key: '',
    }
  },
  methods: {
    start(val) {
      this.timing = val || 60;
      this.startTimer();
    },
    clear() {
      if (this.timer) {
        clearInterval(this.timer);
      }
      this.timing = 0;
    },
    sendCaptcha() {
      this.$emit('sendCaptcha')
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
  watch: {
    key(val) {
      this.$emit('input', val)
    },
    value(val) {
      if (val === this.key) {
        return
      }
      this.key = val;
    }
  }
}
</script>
<style>
.send-captcha-wrap .timing-active {
  color: #FFF !important;
  background-color: #409EFF !important;
  border-color: #409EFF !important;
}

.send-captcha-wrap .timing-disactive {
  pointer-events: none !important;;
}
</style>
