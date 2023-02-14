<template>
  <div class="permission-wrap" v-if="hasAuthority('view_permission')">
    <el-page-table
        stripe
        border
        type="remote"
        max-height="600"
        ref="permissionTable"
        page-index-key="page"
        page-size-key="limit"
        list-field="data.page.list"
        total-field="data.page.totalCount"
        url="/authPermission"
        :columns="permissionTable.columns"
        :page-sizes="[10, 20, 50]"
        :form-options="permissionTable.options"
        :toolbar-options="permissionTable.toolbar">
      <template slot-scope="scope" slot="operate">
        <el-button
            v-if="hasAuthority('change_permission')"
            size="mini"
            type="success"
            icon="el-icon-edit"
            @click="handlePermissionEdit(scope.$index, scope.row)">
        </el-button>
      </template>
    </el-page-table>
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
import AddOrUpdate from '@/view/modules/system/PermissionAddOrUpdate'

export default {
  name: "Permission",
  components: {
    AddOrUpdate
  },
  data() {
    return {
      addOrUpdateVisible: false,
      permissionTable: {
        options: {
          inline: true,
          size: "small",
          forms: [
            {prop: "param", label: "权限信息"}
          ]
        },
        toolbar: {
          size: "mini",
          all: true
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
    getDataList() {
      this.$refs.permissionTable.searchHandler(false);
    },
    handlePermissionEdit(index, row) {
      if (!this.hasAuthority('change_permission')) {
        this.$warning("你无权添加分组");
        return;
      }
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(row)
      })
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

