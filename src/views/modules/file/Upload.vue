<template>
  <div class="upload-wrap" v-if="hasAuthority('add_uploadinfo')">
    <el-upload
        ref="upload"
        action="/uploadInfo"
        :headers="uploadHeaders"
        :before-upload="beforeUpload"
        :on-success="handleSuccess"
        :before-remove="beforeRemove"
        :on-preview="onPreview"
        :check-before="true"
        with-credentials
        multiple>
      <el-button size="medium" type="primary">点击上传</el-button>
      <div slot="tip" class="el-upload__tip">累计大小不要超过16GB</div>
    </el-upload>
  </div>
</template>

<script>
import {uploadCheck} from "@/util";

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
      return uploadCheck(file, this.$refs.upload, this);
    },
    handleSuccess(resp, file) {
      //设置文件对应的 href
      file.href = `/uploadInfo/download/${resp.data.id}`;
    },
    beforeRemove(file) {
      if (file) {
        if (file.status === 'success' && !file.percentage) {
          file.percentage = 100;
          return false;
        } else if (file.status !== 'success') {
          // 秒传错误，立即删除
          return true;
        } else {
          return this.$confirm(`从列表中移除 ${file.name} 文件？`);
        }
      } else {
        return false;
      }
    },
    onPreview(file) {
      if (file.href) {
        window.open(file.href)
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
