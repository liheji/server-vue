<template>
  <div class="format-wrap">
    <el-upload
        action="/format"
        :on-success="handleFormatSuccess"
        :before-upload="beforeFormatUpload"
        :before-remove="beforeFormatRemove"
        :data="formatData"
        accept="text/html, application/vnd.ms-excel, application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
        with-credentials>
      <el-button size="medium" type="primary">点击上传</el-button>
      <el-select style="margin-left: 10px;" v-model="formatData.software" placeholder="必须选择">
        <el-option value="com.suda.yzune.wakeupschedule" label="WakeUp课程表"></el-option>
        <el-option value="com.strivexj.timetable" label="Simple课程表"></el-option>
      </el-select>
      <div slot="tip" class="el-upload__tip" v-html="formatTips"></div>
    </el-upload>
  </div>
</template>

<script>
export default {
  name: "Format",
  data() {
    return {
      formatTips: "未选择文件",
      formatData: {
        token: this.token,
        software: "com.suda.yzune.wakeupschedule"
      }
    };
  },
  methods: {
    handleFormatSuccess(resp, file) {
      //设置 UID对应的 href
      const a = document.createElement("a");
      a.style.marginLeft = "20px";
      if (resp.code === 0) {
        this.tips = "格式化完成(<span style='color: red;'>10分钟后失效</span>)";
        a.innerHTML = resp.fileName;
        a.href = `/fileAttr/download?param=${resp.fileName}`;
      } else {
        this.tips = `<span style='color: red;'>${resp.msg}</span>`;
        a.innerHTML = resp.msg;
      }
      document.getElementById(file.uid).appendChild(a);
    },
    beforeFormatUpload() {
      this.tips = "格式化中...";
    },
    beforeFormatRemove(file) {
      return this.$confirm(`从列表中移除 ${file.name} 文件？`);
    }
  },
  mounted() {
    if (!this.token) {
      delete this.formatData.token;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.format-wrap {
  margin: 10px;
}

.format-wrap .el-upload-list {
  max-height: 600px;
  overflow-y: scroll;
}
</style>
