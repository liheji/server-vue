<template>
  <div class="account-wrap"
       v-if="hasAuthority('view_account')">
    <el-page-table
        stripe
        border
        type="remote"
        max-height="600"
        ref="accountTable"
        page-index-key="page"
        page-size-key="limit"
        list-field="data.page.list"
        total-field="data.page.totalCount"
        url="/account"
        :columns="accountTable.columns"
        :form-options="accountTable.options"
        :toolbar-options="accountTable.toolbar"
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
    </el-page-table>
    <!-- 弹窗, 新增 / 修改 -->
    <add-or-update v-if="addOrUpdateVisible" ref="addOrUpdate" @refreshDataList="getDataList"></add-or-update>
  </div>
</template>

<script>
import AddOrUpdate from '@/view/modules/system/AccountAddOrUpdate'
import {dateFormat} from "@/util"

export default {
  components: {
    AddOrUpdate
  },
  name: "Account",
  data() {
    return {
      addOrUpdateVisible: false,
      accountTable: {
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
        toolbar: {
          size: "mini",
          all: true
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
    getDataList() {
      this.$refs.accountTable.searchHandler(false);
    },
    handleAccountAdd() {
      if (!this.hasAuthority('add_account')) {
        this.$warning("你无权添加用户");
        return;
      }
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(null)
      })
    },
    handleAccountEdit(index, row) {
      if (!this.hasAuthority('change_account')) {
        this.$warning("你无权修改用户信息");
        return;
      }
      this.addOrUpdateVisible = true
      this.$nextTick(() => {
        this.$refs.addOrUpdate.init(row)
      })
    },
    handleAccountEnable(index, row) {
      this.baseAccountEnable([row.id]);
    },
    handleAccountLockSelect() {
      this.baseAccountEnable(this.accountTable.selection);
    },
    baseAccountEnable(accountIds) {
      this.$axios.put("/account/status", accountIds).then(({data}) => {
        if (data.code === 0) {
          this.$success("账户状态切换完成");
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

