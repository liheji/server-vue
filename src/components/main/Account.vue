<template>
  <div class="account-wrap">
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

        :columns="accountColumns"
        :page-sizes="[10, 20, 50]"
        :form-options="accountFormOptions"

        @selection-change="handleSelectionChange">

      <template>
        <el-popconfirm
            style="margin: 5px;"
            title="确认切换选中账号的状态吗？"
            @confirm="handleAccountLockSelect">
          <el-button
              size="mini"
              type="warning"
              slot="reference"
              :disabled="accountSelection.length <= 0">切换选中状态
          </el-button>
        </el-popconfirm>
      </template>

      <template slot-scope="scope" slot="operate">
        <el-button
            style="margin: 5px;"
            size="mini"
            type="success"
            icon="el-icon-edit"
            @click="handleAccountEdit(scope.$index, scope.row)">
        </el-button>
      </template>

      <template slot-scope="scope" slot="isEnabled">
        <el-switch v-model="scope.row.isEnabled"
                   active-text="正常"
                   inactive-text="锁定"
                   @change="handleAccountEnable(scope.$index, scope.row)">
        </el-switch>
      </template>
    </el-search-table-pagination>

    <el-dialog
        width="600px"
        title="编辑用户"
        :close-on-click-modal="false"
        :visible.sync="accountVisible">
      <el-form :model="accountForm"
               :rules="accountRules"
               label-width="70px"
               ref="accountForm"
               style="margin-right: 20px;">
        <el-form-item label="用户名">
          {{ accountForm.username }}
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input type="text" v-model="accountForm.mobile"
                    placeholder="手机号" autocomplete="on">
          </el-input>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input type="text" v-model="accountForm.email"
                    placeholder="邮箱" autocomplete="on">
          </el-input>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-model="accountForm.isEnabled"></el-switch>
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
import {dateFormat} from "@/util"

export default {
  name: "Account",
  data() {
    const validateMobile = (rule, value, callback) => {
      if (!/^((\+86)|(86))?1\d{10}$/g.test(value)) {
        return callback(new Error("手机号格式错误"));
      }
      callback();
    };

    return {
      accountVisible: false,
      dayOptions: ["", "7", "30", "60", "90", "0"],
      accountForm: {
        id: 0,
        username: "",
        mobile: "",
        email: "",
        isEnabled: "",
      },
      accountRules: {
        mobile: [
          {min: 11, max: 14, message: '长度应为11-14', trigger: 'blur'},
          {validator: validateMobile, trigger: "blur"}
        ],
        email: [
          {type: 'email', message: '邮箱无效', trigger: 'blur'}
        ]
      },
      accountFormOptions: {
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
      accountColumns: [
        {type: "selection"},
        {prop: "username", label: "用户名", sortable: true, minWidth: 150},
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
          prop: "lastLogin", label: "最后登录", showOverflowTooltip: true, minWidth: 250,
          render: row => {
            return row.lastLogin ? dateFormat(row.lastLogin) : "尚未登录";
          }
        },
        {
          prop: "updateTime", label: "修改时间", showOverflowTooltip: true, minWidth: 250,
          render: row => {
            return dateFormat(row.updateTime)
          }
        },
        {
          prop: "createTime", label: "创建时间", showOverflowTooltip: true, minWidth: 250,
          render: row => {
            return dateFormat(row.createTime)
          }
        },
        {label: "操作", width: 70, slotName: "operate", fixed: "right"}
      ],
      accountSelection: []
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
      this.baseAccountEnable(row.id);
    },
    handleAccountLockSelect() {
      this.baseAccountEnable(this.accountSelection.join(","));
    },
    handleAccountEdit(index, row) {
      this.accountForm.id = row.id;
      this.accountForm.username = row.username;
      this.accountForm.mobile = row.mobile;
      this.accountForm.email = row.email;
      this.accountForm.isEnabled = row.isEnabled;
      //
      this.accountVisible = true;
    },
    baseAccountEdit() {
      this.$axios.put("/account", {}, {
        params: this.accountForm
      }).then(({data}) => {
        if (data.code === 0) {
          this.$success(data.msg);
          // 隐藏窗口
          this.accountVisible = false;
          //执行表格重载
          this.$refs.accountTable.searchHandler(false);
        } else {
          this.$warning(data.msg);
        }
      }).catch((err) => {
        this.$error(err.toString());
      });
    },
    baseAccountEnable(idStr) {
      this.$axios.put("/account/enable", {}, {
        params: {id: idStr}
      }).then(({data}) => {
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
      this.accountSelection = changeItems.map(obj => {
        return obj.id;
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

