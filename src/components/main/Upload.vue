<template>
  <div class="upload-wrap" v-if="hasAuthority('add_file_attr')">
    <el-upload
        action="/fileAttr"
        :data="uploadData"
        :headers="uploadHeaders"
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
      uploadData: {
        token: this.$store.state.passToken
      },
      uploadHeaders: {
        'X-XSRF-TOKEN': this.$cookie.get("XSRF-TOKEN") || ""
      },
    };
  },
  methods: {
    handleSuccess(resp, file) {
      //设置 UID对应的 href
      document.getElementById(file.uid).href = `/fileAttr/download?param=${resp.data[0].id}`;
    },
    beforeRemove(file) {
      return this.$confirm(`从列表中移除 ${file.name} 文件？`);
    }
  },
  mounted() {
    if (!this.$store.state.passToken) {
      delete this.uploadData.token;
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
