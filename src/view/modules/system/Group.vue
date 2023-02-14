<template>
  <div class="group-wrap" v-if="hasAuthority('view_group')">
    <el-page-table
        stripe
        border
        type="remote"
        max-height="600"
        ref="groupTable"
        page-index-key="page"
        page-size-key="limit"
        list-field="data.page.list"
        total-field="data.page.totalCount"
        url="/authGroup"
        :columns="groupTable.columns"
        :page-sizes="[10, 20, 50]"
        :form-options="groupTable.options"
        :toolbar-options="groupTable.toolbar"
        @selection-change="handleSelectionChange">

      <template>
        <el-popover
            width="200"
            ref="multipleDeletePopover">
          <p>
            <i class="el-popconfirm__icon el-icon-question" style="color: rgb(255, 153, 0);"></i>
            确认删除选中的分组吗？
          </p>
          <p style="color: red;font-size: 10px;">注意：关联的数据会被删除。</p>
          <div style="text-align: right; margin: 0">
            <el-button size="mini" type="text" @click="$refs.multipleDeletePopover.showPopper = false">取消</el-button>
            <el-button size="mini" type="primary" @click="handleGroupDeleteSelect">确定</el-button>
          </div>
          <el-button
              size="mini"
              type="danger"
              slot="reference"
              :disabled="groupTable.selection.length <= 0">删除选中
          </el-button>
        </el-popover>
        <el-button
            v-if="hasAuthority('add_group')"
            style="margin-left: 10px;"
            size="mini"
            type="success"
            @click="handleGroupAdd">添加分组
        </el-button>
      </template>

      <template slot-scope="scope" slot="operate">
        <el-popover
            width="200"
            ref="singleDeletePopover">
          <p>
            <i class="el-popconfirm__icon el-icon-question" style="color: rgb(255, 153, 0);"></i>
            确认删除该分组吗？
          </p>
          <p style="color: red;font-size: 10px;">注意：关联的数据会被删除。</p>
          <div style="text-align: right; margin: 0">
            <el-button size="mini" type="text" @click="$refs.singleDeletePopover.showPopper = false">取消</el-button>
            <el-button size="mini" type="primary" @click="handleGroupDelete(scope.$index, scope.row);">确定</el-button>
          </div>
          <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              slot="reference">
          </el-button>
        </el-popover>
        <el-button
            v-if="hasAuthority('change_group')"
            style="margin-left: 10px;"
            size="mini"
            type="success"
            icon="el-icon-edit"
            @click="handleGroupEdit(scope.$index, scope.row)">
        </el-button>
      </template>
    </el-page-table>
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
import AddOrUpdate from '@/view/modules/system/GroupAddOrUpdate'
import {camelName} from "@/util";

export default {
  name: "Group",
  components: {
    AddOrUpdate
  },
  data() {
    return {
      addOrUpdateVisible: false,
      groupTable: {
        options: {
          inline: true,
          size: "small",
          forms: [
            {prop: "param", label: "分组信息"}
          ]
        },
        toolbar: {
          size: "mini",
          all: true
        },
        columns: [
          {type: "selection"},
          {prop: "codename", label: "分组代码", sortable: true, minWidth: 100},
          {prop: "name", label: "分组描述", sortable: true, minWidth: 200},
          {label: "操作", width: 135, slotName: "operate", fixed: "right"}
        ],
        selection: []
      }
    }
  },
  methods: {
    getDataList() {
      this.$refs.groupTable.searchHandler(false);
    },
    handleGroupAdd() {
      if (!this.hasAuthority('change_account')) {
        this.$warning("你无权添加分组");
        return;
      }
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(null)
      })
    },
    handleGroupEdit(index, row) {
      if (!this.hasAuthority('change_account')) {
        this.$warning("你无权修改分组信息");
        return;
      }
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(row)
      })
    },
    handleGroupDelete(index, row) {
      this.baseGroupDelete([row.id]);
      this.$refs.singleDeletePopover.showPopper = false;
    },
    handleGroupDeleteSelect() {
      this.baseGroupDelete(this.groupTable.selection);
      this.$refs.multipleDeletePopover.showPopper = false;
    },
    baseGroupDelete(groupIds) {
      this.$axios.delete("/authGroup", {
        data: {groupIds: groupIds}
      }).then(({data}) => {
        if (data.code === 0) {
          this.$success(`分组已删除，已删除 ${data.count} 共 ${data.total}`);
          //执行表格重载
          this.$refs.groupTable.searchHandler(false);
        } else {
          this.$warning("分组删除失败");
        }
      }).catch((err) => {
        this.$error(err.toString());
      });
    },
    handleSelectionChange(changeItems) {
      //获取用户的选中
      this.groupTable.selection = changeItems.map(obj => {
        return obj.id;
      });
    }
  }
}
</script>

<style scoped>
.group-wrap {
  margin: 10px;
}

.group-wrap .el-table .cell {
  white-space: nowrap !important;
}
</style>

