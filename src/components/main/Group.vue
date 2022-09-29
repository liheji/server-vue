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
        list-field="data.data"
        total-field="data.total"
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

    <el-dialog
        width="600px"
        :title="groupForm.popLabel"
        :close-on-click-modal="false"
        :visible.sync="groupDialogVisible">
      <el-form :model="groupForm.formData" :rules="groupForm.rules" label-width="100px" ref="groupForm">
        <el-form-item label="分组代码" prop="codename">
          <el-input v-if="groupForm.formData.id === undefined"
                    v-model.trim="groupForm.formData.codename"
                    autocomplete="on">
          </el-input>
          <template v-else>
            {{ groupForm.formData.codename }}
          </template>
        </el-form-item>
        <el-form-item label="分组描述" prop="name">
          <el-input v-model.trim="groupForm.formData.name" autocomplete="on"></el-input>
        </el-form-item>
        <el-form-item label="权限">
          <el-tree
              style="height: 220px;overflow-y: auto;"
              ref="permissionTree"
              :data="groupForm.permissionTreeData"
              show-checkbox
              node-key="id"
              accordion
              @check="handleTreeCheck"
              :default-checked-keys="groupForm.formData.permissionIds">
          </el-tree>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">立即提交</el-button>
          <el-button @click="$refs.groupForm.resetFields()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {camelName} from "@/util";

export default {
  name: "Group",
  data() {
    const validateCodename = (rule, value, callback) => {
      if (!/^\w+$/g.test(value)) {
        return callback(new Error("分组代码格式错误"));
      }
      callback();
    };
    return {
      groupDialogVisible: false,
      groupForm: {
        popLabel: "",
        formData: {
          codename: "",
          name: "",
          permissionIds: []
        },
        rules: {
          codename: [
            {required: true, message: '必须输入分组（角色）代码', trigger: 'blur'},
            {validator: validateCodename, trigger: "blur"}
          ]
        },
        permissionTreeData: []
      },
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
    submitForm() {
      this.$refs.groupForm.validate((valid) => {
        if (!valid) {
          return false;
        }

        if (this.groupForm.formData.id) {
          this.baseGroupEdit();
        } else {
          this.baseGroupAdd();
        }
      });
    },
    handleGroupAdd() {
      this.groupForm.popLabel = "添加分组";
      this.groupForm.formData = {
        codename: "",
        name: "",
        permissionIds: []
      };
      this.getPermissions(-1);
    },
    handleGroupDelete(index, row) {
      this.baseGroupDelete([row.id]);
      this.$refs.singleDeletePopover.showPopper = false;
    },
    handleGroupDeleteSelect() {
      this.baseGroupDelete(this.groupTable.selection);
      this.$refs.multipleDeletePopover.showPopper = false;
    },
    handleGroupEdit(index, row) {
      this.groupForm.popLabel = "修改分组信息";
      this.groupForm.formData = {
        id: row.id,
        codename: row.codename,
        name: row.name,
        permissionIds: []
      };
      this.getPermissions(row.id);
    },
    baseGroupAdd() {
      this.$axios.post("/authGroup", this.groupForm.formData).then(({data}) => {
        if (data.code === 0) {
          this.$success(data.msg);
          // 隐藏窗口
          this.groupDialogVisible = false;
          //执行表格重载
          this.$refs.groupTable.searchHandler(false);
        } else {
          this.$warning(data.msg);
        }
      }).catch((err) => {
        this.$error(err.toString());
      });
    },
    baseGroupEdit() {
      this.$axios.put("/authGroup", this.groupForm.formData).then(({data}) => {
        if (data.code === 0) {
          this.$success(data.msg);
          // 隐藏窗口
          this.groupDialogVisible = false;
          //执行表格重载
          this.$refs.groupTable.searchHandler(false);
        } else {
          this.$warning(data.msg);
        }
      }).catch((err) => {
        this.$error(err.toString());
      });
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
    getPermissions(groupId) {
      this.$axios.get("/authGroup/permissions", {
        params: {groupId: groupId}
      }).then(({data}) => {
        if (data.code === 0) {
          this.groupForm.formData.permissionIds = data.data.permissionIds;

          var tempData = {};
          const permissions = data.total.permissions;
          for (var permission of permissions) {
            if (tempData[permission.model] === undefined) {
              tempData[permission.model] = []
            }
            tempData[permission.model].push({id: permission.id, label: `${permission.name}（${permission.codename}）`});
          }

          this.groupForm.permissionTreeData = [];
          for (var key in tempData) {
            this.groupForm.permissionTreeData.push({
              id: 'str_' + key,
              label: `${camelName(key, true)}（${key}）`,
              children: tempData[key]
            })
          }

          this.groupDialogVisible = true;
        }
      }).catch((ignored) => {
        this.groupDialogVisible = true;
      });
    },
    handleSelectionChange(changeItems) {
      //获取用户的选中
      this.groupTable.selection = changeItems.map(obj => {
        return obj.id;
      });
    },
    handleTreeCheck(node, status) {
      //获取选中权限
      this.groupForm.formData.permissionIds = status.checkedKeys.filter((id) => {
        return /\d+/.test(id);
      })
    },
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

