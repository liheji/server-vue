<template>
  <div class="permission-wrap" v-if="hasAuthority('view_permission')">
    <el-search-table-pagination
        stripe
        border
        type="remote"
        max-height="600"
        ref="permissionTable"
        page-index-key="page"
        page-size-key="limit"
        list-field="data.data"
        total-field="data.total"
        url="/authPermission"
        :columns="permissionTable.columns"
        :page-sizes="[10, 20, 50]"
        :form-options="permissionTable.options">
      <template slot-scope="scope" slot="operate">
        <el-button
            v-if="hasAuthority('change_permission')"
            size="mini"
            type="success"
            icon="el-icon-edit"
            @click="handlePermissionEdit(scope.$index, scope.row)">
        </el-button>
      </template>
    </el-search-table-pagination>

    <el-dialog
        width="600px"
        title="修改权限信息"
        :close-on-click-modal="false"
        :visible.sync="permissionDialogVisible">
      <el-form :model="permissionForm" label-width="100px" ref="permissionForm">
        <el-form-item label="权限代码">
          {{ permissionForm.codename }}
        </el-form-item>
        <el-form-item label="权限表格">
          {{ permissionForm.model }}
        </el-form-item>
        <el-form-item label="权限描述">
          <el-input v-model.trim="permissionForm.name" autocomplete="on"></el-input>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">立即提交</el-button>
          <el-button @click="$refs.permissionForm.resetFields()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
export default {
  name: "Permission",
  data() {
    return {
      permissionDialogVisible: false,
      permissionForm: {
        id: -1,
        codename: "",
        model: "",
        name: ""
      },
      permissionTable: {
        options: {
          inline: true,
          size: "small",
          forms: [
            {prop: "param", label: "权限信息"}
          ]
        },
        columns: [
          {prop: "codename", label: "权限代码", sortable: true, minWidth: 100},
          {prop: "model", label: "权限表格", sortable: true, minWidth: 100},
          {prop: "name", label: "权限描述", sortable: true, minWidth: 200},
          {label: "操作", width: 70, slotName: "operate", fixed: "right"}
        ]
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.permissionForm.validate((valid) => {
        if (!valid) {
          return false;
        }

        this.$axios.put("/authPermission", this.permissionForm).then(({data}) => {
          if (data.code === 0) {
            this.$success(data.msg);
            // 隐藏窗口
            this.permissionDialogVisible = false;
            //执行表格重载
            this.$refs.permissionTable.searchHandler(false);
          } else {
            this.$warning(data.msg);
          }
        }).catch((err) => {
          this.$error(err.toString());
        });
      });
    },
    handlePermissionEdit(index, row) {
      this.permissionForm = {
        id: row.id,
        codename: row.codename,
        model: row.model,
        name: row.name
      };

      this.permissionDialogVisible = true;
    }
  }
}
</script>

<style scoped>
.permission-wrap {
  margin: 10px;
}

.permission-wrap .el-table .cell {
  white-space: nowrap !important;
}
</style>

