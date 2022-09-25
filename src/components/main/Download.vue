<template>
  <div class="file-wrap" v-if="hasAuthority('view_file_info')">
    <el-page-table
        stripe
        border
        type="remote"
        max-height="600"
        ref="fileTable"
        page-index-key="page"
        page-size-key="limit"
        list-field="data.data"
        total-field="data.total"
        url="/fileInfo"
        :columns="fileForm.columns"
        :form-options="fileForm.options"
        @selection-change="handleSelectionChange">

      <template>
        <el-popconfirm
            v-if="hasAuthority('delete_file_info')"
            style="margin: 5px;"
            title="确认删除选中的文件吗？"
            @confirm="handleFileDeleteSelect">
          <el-button
              size="mini"
              type="danger"
              slot="reference"
              :disabled="fileForm.selection.length <= 0">删除选中
          </el-button>
        </el-popconfirm>
        <el-button
            v-if="hasAuthority('download_file_info')"
            size="mini"
            type="primary"
            :disabled="fileForm.selection.length <= 0"
            @click="handleFileDownloadSelect">下载选中
        </el-button>
      </template>

      <template slot-scope="scope" slot="operate">
        <el-popconfirm
            style="margin: 5px;"
            title="确认删除该文件吗？"
            @confirm="handleFileDelete(scope.$index, scope.row)">
          <el-button
              v-if="hasAuthority('delete_file_info')"
              size="mini"
              type="danger"
              icon="el-icon-delete"
              slot="reference">
          </el-button>
        </el-popconfirm>
        <el-button
            v-if="hasAuthority('download_file_info')"
            size="mini"
            type="primary"
            icon="el-icon-download"
            @click="handleFileDownloadThis(scope.$index, scope.row)">
        </el-button>
        <el-button
            v-if="hasAuthority('download_file_info')"
            size="mini"
            type="primary"
            icon="el-icon-view"
            @click="handleFilePreviewThis(scope.$index, scope.row)">
        </el-button>
      </template>
    </el-page-table>
  </div>
</template>

<script>
import {dateFormat, fileFormat} from "@/util"

export default {
  name: "Download",
  data() {
    return {
      fileForm: {
        options: {
          toolbar: true,
          inline: true,
          size: "small",
          forms: [
            {prop: "fileName", label: "文件名"},
          ]
        },
        columns: [
          {type: "selection"},
          {prop: "fileName", label: "文件名", sortable: true, width: 350},
          {
            prop: "fileSize", label: "文件大小", sortable: true, width: 150,
            render: row => fileFormat(row.fileInfo.fileSize)
          },
          {
            prop: "createTime", label: "创建时间", showOverflowTooltip: true, minWidth: 250,
            render: row => dateFormat(row.fileInfo.createTime)
          },
          {label: "操作", width: 180, slotName: "operate", fixed: "right"}
        ],
        selection: []
      }
    }
  },
  methods: {
    handleFileDeleteSelect() {
      this.baseFileDelete(this.fileForm.selection);
    },
    handleFileDelete(index, row) {
      this.baseFileDelete([row.id]);
    },
    handleFileDownloadSelect() {
      this.fileForm.selection.forEach((val) => {
        window.open(`/fileInfo/download/${val}`, '_blank');
      });
    },
    handleFileDownloadThis(index, row) {
      window.open(`/fileInfo/download/${row.id}`, '_blank');
    },
    handleFilePreviewThis(index, row) {
      window.open(`/fileInfo/preview/${row.id}`, '_blank');
    },
    handleSelectionChange(changeItems) {
      //获取用户的选中
      this.fileForm.selection = changeItems.map(obj => {
        return obj.id;
      });
    },
    baseFileDelete(fileIds) {
      this.$axios.delete("/fileInfo", {
        data: {fileIds: fileIds}
      }).then(({data}) => {
        if (data.code === 0) {
          this.$success(`文件已删除，已删除 ${data.count} 共 ${data.total}`);
          //执行表格重载
          this.$refs.fileTable.searchHandler(false);
        } else {
          this.$warning(data.msg);
        }
      }).catch((err) => {
        this.$error(err.toString());
      })
    }
  }
}
</script>

<style scoped>
.file-wrap {
  margin: 10px;
}

.file-wrap .el-table .cell {
  white-space: nowrap !important;
}
</style>
