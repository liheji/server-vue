<template>
  <div class="upload-wrap" v-if="hasAuthority('add_uploadinfo')">
    <el-upload
        ref="upload"
        action="/uploadInfo"
        :headers="uploadHeaders"
        :before-upload="beforeUpload"
        :on-success="handleSuccess"
        :before-remove="beforeRemove"
        with-credentials
        multiple>
      <el-button size="medium" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">累计大小不要超过16GB</div>
    </el-upload>
  </div>
</template>

<script>
export default {
  name: "Upload",
  data() {
    return {
      uploadHeaders: {
        'X-XSRF-TOKEN': this.$cookie.get("XSRF-TOKEN") || "",
        'UPLOAD-TOKEN': ''
      },
    };
  },
  methods: {
    beforeUpload(file) {
      return this.uploadCheck(file, this.$refs.upload);
    },
    handleSuccess(resp, file) {
      //设置 UID对应的 href
      document.getElementById(file.uid).href = `/uploadInfo/download/${resp.data.id}`;
    },
    beforeRemove(file) {
      if (file) {
        if (file.status === 'success' && file.percentage === 0) {
          file.percentage = 100;
          return false;
        } else if (file.status !== 'success') {
          return true;
        } else {
          return this.$confirm(`从列表中移除 ${file.name} 文件？`);
        }
      } else {
        return false;
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.upload-wrap {
  margin: 10px;
}

.upload-wrap .el-upload-list {
  max-height: 600px;
  overflow-y: scroll;
}
</style>
