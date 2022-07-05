<template>
  <div class="account-wrap"
       v-if="hasAuthority('view_account')">
    <el-search-table-pagination
        stripe
        border
        type="remote"
        max-height="600"
        ref="accountTable"
        page-index-key="page"
        page-size-key="limit"
        list-field="data.data"
        total-field="data.total"
        url="/account"
        :columns="accountTable.columns"
        :page-sizes="[10, 20, 50]"
        :form-options="accountTable.options"
        @selection-change="handleSelectionChange">
      <template>
        <el-popconfirm
            v-if="hasAuthority('delete_account')"
            style="margin: 5px;"
            title="确认切换选中账号的状态吗？"
            @confirm="handleAccountLockSelect">
          <el-button
              size="mini"
              type="warning"
              slot="reference"
              :disabled="accountTable.selection.length <= 0">切换选中状态
          </el-button>
        </el-popconfirm>
      </template>

      <template slot-scope="scope" slot="operate">
        <el-button
            v-if="hasAuthority('change_account')"
            style="margin: 5px;"
            size="mini"
            type="success"
            icon="el-icon-edit"
            @click="handleAccountEdit(scope.$index, scope.row)">
        </el-button>
      </template>

      <template slot-scope="scope" slot="isEnabled">
        <el-switch v-if="hasAuthority('delete_account')" v-model="scope.row.isEnabled"
                   active-text="正常"
                   inactive-text="锁定"
                   @change="handleAccountEnable(scope.$index, scope.row)">
        </el-switch>
        <template v-else>
          <el-tag type="success" v-if="scope.row.isEnabled">正常</el-tag>
          <el-tag type="danger" v-else>锁定</el-tag>
        </template>
      </template>
      <template slot-scope="scope" slot="isSuperuser">
        <el-tag effect="dark" v-if="scope.row.isSuperuser">管理员</el-tag>
        <el-tag type="warning" effect="dark" v-else>普通用户</el-tag>
        <el-tag type="success" v-if="scope.row.id === $store.state.user.id" style="margin-left: 10px;">当前</el-tag>
      </template>
    </el-search-table-pagination>

    <el-dialog
        top="8vh"
        width="800px"
        title="编辑用户"
        :close-on-click-modal="false"
        :visible.sync="accountDialogVisible">
      <el-form :model="accountForm.formData"
               :rules="accountTable.rules"
               label-width="70px"
               ref="accountForm"
               style="margin-right: 20px;">
        <el-form-item label="用户名">
          {{ accountForm.formData.username }}
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-if="hasAuthority('delete_account')" v-model="accountForm.formData.isEnabled"
                     active-text="正常"
                     inactive-text="锁定">
          </el-switch>
          <template v-else>
            <el-tag type="success" effect="dark" v-if="accountForm.formData.isEnabled">正常</el-tag>
            <el-tag type="danger" effect="dark" v-else>锁定</el-tag>
          </template>
        </el-form-item>
        <el-form-item label="重置密码">
          <el-switch v-model="accountForm.formData.resetPassword"
                     active-text="重置(12345)"
                     inactive-text="保持">
          </el-switch>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input type="text" v-model="accountForm.formData.email"
                    placeholder="邮箱" autocomplete="on">
          </el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input type="text" v-model="accountForm.formData.mobile"
                    placeholder="手机号" autocomplete="on">
          </el-input>
        </el-form-item>
        <el-form-item label="身份" prop="isSuperuser">
          <el-select v-model="accountForm.formData.isSuperuser">
            <el-option label="普通用户" :value="false"></el-option>
            <el-option label="管理员(拥有所有权限)" :value="true"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分组" v-show="!accountForm.formData.isSuperuser">
          <el-select v-model="accountForm.formData.groupIds" multiple placeholder="请选择" @change="$forceUpdate()">
            <el-option
                v-for="item in accountForm.groupSelectData"
                :key="item.id"
                :label="item.name"
                :value="item.id">
            </el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="权限" v-show="!accountForm.formData.isSuperuser">
          <el-tree
              style="height: 220px;overflow-y: auto;"
              ref="permissionTree"
              :data="accountForm.permissionTreeData"
              show-checkbox
              node-key="id"
              accordion
              @check="handleTreeCheck"
              :default-checked-keys="accountForm.formData.permissionIds">
          </el-tree>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">立即提交</el-button>
          <el-button @click="$refs.accountForm.resetFields()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {dateFormat, camelName} from "@/util"

export default {
  name: "Account",
  data() {
    const validateMobile = (rule, value, callback) => {
      if (value != null && value.length > 0) {
        var len = value.trim().length;
        if (len < 11 || len > 14) {
          return callback(new Error("长度范围11~14"));
        }

        if (!/^((\+86)|(86))?1\d{10}$/g.test(value)) {
          return callback(new Error("手机号格式错误"));
        }
      }
      callback();
    };
    return {
      accountDialogVisible: false,
      accountForm: {
        formData: {
          id: -1,
          username: "",
          mobile: "",
          email: "",
          isEnabled: false,
          isSuperuser: false,
          resetPassword: false,
          groupIds: [],
          permissionIds: []
        },
        permissionTreeData: [],
        groupSelectData: [],
      },
      accountTable: {
        rules: {
          mobile: [
            {validator: validateMobile, trigger: "blur"}
          ],
          email: [
            {type: 'email', message: '邮箱无效', trigger: 'blur'}
          ]
        },
        options: {
          inline: true,
          size: "small",
          forms: [
            {prop: "username", label: "用户名"},
            {
              prop: 'isEnabled', label: '用户状态', itemType: 'select',
              options: [
                {value: '', label: 'All'},
                {value: true, label: '正常'},
                {value: false, label: '锁定'}
              ]
            }
          ]
        },
        columns: [
          {type: "selection"},
          {prop: "username", label: "用户名", sortable: true, minWidth: 100},
          {prop: "isSuperuser", label: "身份", slotName: "isSuperuser", sortable: true, width: 150},
          {
            prop: "mobile", label: "手机号", sortable: true, minWidth: 150,
            render: row => {
              return row.mobile ? row.mobile : "未绑定";

            }
          },
          {
            prop: "email", label: "邮箱", sortable: true, minWidth: 150,
            render: row => {
              return row.email ? row.email : "未绑定";
            }
          },
          {prop: "isEnabled", label: "状态", slotName: "isEnabled", sortable: true, width: 150},
          {
            prop: "lastLogin", label: "最后登录", showOverflowTooltip: true, minWidth: 200,
            render: row => {
              return row.lastLogin ? dateFormat(row.lastLogin) : "尚未登录";
            }
          },
          {
            prop: "updateTime", label: "修改时间", showOverflowTooltip: true, minWidth: 200,
            render: row => {
              return dateFormat(row.updateTime)
            }
          },
          {
            prop: "createTime", label: "创建时间", showOverflowTooltip: true, minWidth: 200,
            render: row => {
              return dateFormat(row.createTime)
            }
          },
          {label: "操作", width: 70, slotName: "operate", fixed: "right"}
        ],
        selection: [],
      }
    }
  },
  methods: {
    submitForm() {
      this.$refs.accountForm.validate((valid) => {
        if (!valid) {
          return false;
        }

        this.baseAccountEdit();
      });
    },
    handleAccountEnable(index, row) {
      this.baseAccountEnable([row.id]);
    },
    handleAccountLockSelect() {
      this.baseAccountEnable(this.accountTable.selection);
    },
    handleAccountEdit(index, row) {
      this.accountForm.formData = {
        id: row.id,
        username: row.username,
        mobile: row.mobile,
        email: row.email,
        isEnabled: row.isEnabled,
        isSuperuser: row.isSuperuser,
        resetPassword: false,
      }
      this.getPermissions(row.id);
    },
    baseAccountEdit() {
      if (this.accountForm.formData.isSuperuser) {
        this.accountForm.formData.groupIds = [];
        this.accountForm.formData.permissionIds = [];
      }
      this.$axios.put("/account", this.accountForm.formData).then(({data}) => {
        if (data.code === 0) {
          this.$success(data.msg);
          // 隐藏窗口
          this.accountDialogVisible = false;
          //执行表格重载
          this.$refs.accountTable.searchHandler(false);
        } else {
          this.$warning(data.msg);
        }
      }).catch((err) => {
        this.$error(err.toString());
      });
    },
    baseAccountEnable(accountIds) {
      this.$axios.put("/account/status", {accountIds: accountIds}).then(({data}) => {
        if (data.code === 0) {
          this.$success(`账户状态已切换，成功 ${data.count} 共 ${data.total}`);
          //执行表格重载
          this.$refs.accountTable.searchHandler(false);
        } else {
          this.$warning("账户状态切换失败");
        }
      }).catch((err) => {
        this.$error(err.toString());
      });
    },
    handleSelectionChange(changeItems) {
      //获取用户的选中
      this.accountTable.selection = changeItems.map(obj => {
        return obj.id;
      });
    },
    handleTreeCheck(node, status) {
      //获取选中权限
      this.accountForm.formData.permissionIds = status.checkedKeys.filter((id) => {
        return /\d+/.test(id);
      })
    },
    getPermissions(accountId) {
      this.$axios.get("/account/permissions", {
        params: {accountId: accountId}
      }).then(({data}) => {
        if (data.code === 0) {
          this.accountForm.formData.groupIds = data.data.groupIds;
          this.accountForm.formData.permissionIds = data.data.permissionIds;

          this.accountForm.groupSelectData = data.total.groups;
          const permissions = data.total.permissions;

          var tempData = {};
          for (var permission of permissions) {
            if (tempData[permission.model] === undefined) {
              tempData[permission.model] = []
            }
            tempData[permission.model].push({id: permission.id, label: `${permission.name}（${permission.codename}）`});
          }

          this.accountForm.permissionTreeData = [];
          for (var key in tempData) {
            this.accountForm.permissionTreeData.push({
              id: 'str_' + key,
              label: `${camelName(key, true)}（${key}）`,
              children: tempData[key]
            })
          }

          this.accountDialogVisible = true;
        }
      }).catch((ignored) => {
        this.accountDialogVisible = true;
      });
    }
  },
  filters: {
    subToStr(paramTime) {
      return Math.ceil(Math.abs(new Date(paramTime) - new Date().getTime()) / 1000 / 60 / 60 / 24);
    }
  }
}
</script>

<style scoped>
.account-wrap {
  margin: 10px;
}

.account-wrap .el-table .cell {
  white-space: nowrap !important;
}
</style>

