<template>
  <div class="format-wrap" v-if="hasAuthority('use_wakeup')">
    <el-upload
        action="/wakeup"
        :on-success="handleFormatSuccess"
        :before-upload="beforeFormatUpload"
        :before-remove="beforeFormatRemove"
        :headers="formatHeaders"
        accept="text/html"
        with-credentials>
      <el-button slot="trigger" size="medium" type="primary" title="上传课程表excel或html文件">点击上传</el-button>
      <div style="display:inline;margin-left: 20px; padding:10px 0;">
        <img width="35" height="35" style="margin-bottom: -14px;"
             src="https://pp.myapp.com/ma_icon/0/icon_52528981_1626526229/256"/>
        <el-link target="_blank"
                 title="点击查看应用详情"
                 style="margin-bottom: -1px;margin-left: 2px;"
                 href="https://www.coolapk.com/apk/com.suda.yzune.wakeupschedule">
          WakeUp课程表
        </el-link>
      </div>
      <div slot="tip" class="el-upload__tip" v-html="formatTips"></div>
    </el-upload>
    <div style="margin-top: 20px">
      <el-row v-for="item in formatFiles" :key="item.from.uid">
        <el-link icon="el-icon-circle-check" :href="item.href" target="_blank" :type="item.href == null ? 'danger' : 'success'">{{ item.result }}</el-link>
      </el-row>
    </div>
  </div>
</template>

<script>
export default {
  name: "Hrbeu",
  data() {
    return {
      formatTips: "未选择文件",
      formatHeaders: {
        'X-XSRF-TOKEN': this.$cookie.get("XSRF-TOKEN") || ""
      },
      formatFiles: []
    };
  },
  methods: {
    handleFormatSuccess(resp, file) {
      //设置 UID对应的 href
      if (resp.code === 0) {
        this.formatTips = "格式化完成(<span style='color: red;'>10分钟后失效</span>)";
        this.formatFiles.push({
          from: file,
          result: resp.fileName,
          href: `/uploadInfo/download/${resp.fileName}`
        })
      } else {
        this.formatTips = `<span style='color: red;'>${resp.msg}</span>`;
        this.formatFiles.push({
          from: file,
          result: resp.msg
        })
      }
    },
    beforeFormatUpload() {
      this.formatTips = "格式化中...";
    },
    beforeFormatRemove(file) {
      return this.$confirm(`从列表中移除 ${file.name} 文件？`);
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
