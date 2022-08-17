<template>
  <div class="upload-wrap" v-if="hasAuthority('add_file_info')">
    <el-upload
        ref="upload"
        action="/fileInfo"
        :data="uploadData"
        :headers="uploadHeaders"
        :before-upload="beforeUpload"
        :on-success="handleSuccess"
        :before-remove="beforeRemove"
        with-credentials
        multiple>
      <div>
        <el-button size="medium" type="primary">点击上传</el-button>
        <el-tag effect="plain" type="primary" size="medium"
                style="margin-left: 10px;border: none;">
          {{ fileMag }}
        </el-tag>
      </div>
      <div slot="tip" class="el-upload__tip">累计大小不要超过16GB</div>
    </el-upload>
  </div>
</template>

<script>
export default {
  name: "Upload",
  data() {
    return {
      fileMag: "未选择文件",
      uploadData: {
        token: this.$store.state.passToken
      },
      uploadHeaders: {
        'X-XSRF-TOKEN': this.$cookie.get("XSRF-TOKEN") || "",
        'UPLOAD-TOKEN': ''
      },
    };
  },
  methods: {
    beforeUpload(file) {
      this.fileMag = `正在校验 ${file.name} 文件`
      const ret = this.uploadCheck(file, this.$refs.upload);
      this.fileMag = `正在上传 ${file.name} 文件`
      return ret;
    },
    handleSuccess(resp, file, fileList) {
      //设置 UID对应的 href
      this.fileMag = `${file.status} 上传成功`
      document.getElementById(file.uid).href = `/fileInfo/download/${resp.data.id}`;
      var i = 0;
      for (i = 0; i < fileList.length; i++) {
        if (fileList[i].status === 'ready') break;
      }

      if (i >= fileList.length) {
        this.fileMag = `上传完成`
      }
    },
    beforeRemove(file, fileList) {
      if (file.status === 'success' && file.percentage === 0) {
        file.percentage = 100;
        return false;
      } else {
        return this.$confirm(`从列表中移除 ${file.name} 文件？`);
      }
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
