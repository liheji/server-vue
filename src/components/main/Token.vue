<template>
  <div class="token-wrap">
    <el-search-table-pagination
        stripe
        border
        type="remote"
        max-height="600"
        ref="tokenTable"
        page-index-key="page"
        page-size-key="limit"
        list-field="data.data"
        total-field="data.total"
        url="/passToken"

        :columns="tokenColumns"
        :page-sizes="[10, 20, 50]"
        :form-options="tokenFormOptions"

        @selection-change="handleSelectionChange">

      <template>
        <el-popconfirm
            style="margin: 5px;"
            title="确认删除选中的Token吗？"
            @confirm="handleTokenDeleteSelect">
          <el-button
              size="mini"
              type="danger"
              slot="reference"
              :disabled="tokenSelection.length <= 0">删除选中
          </el-button>
        </el-popconfirm>
        <el-popconfirm
            style="margin: 5px;"
            title="确认锁定选中的Token吗？"
            @confirm="handleTokenLockSelect">
          <el-button
              size="mini"
              type="warning"
              slot="reference"
              :disabled="tokenSelection.length <= 0">锁定选中
          </el-button>
        </el-popconfirm>
        <el-button
            size="mini"
            type="success"
            @click="handleTokenAdd">添加Token
        </el-button>
      </template>

      <template slot-scope="scope" slot="operate">
        <el-popconfirm
            style="margin: 5px;"
            title="确认删除该Token吗？"
            @confirm="handleTokenDelete(scope.$index, scope.row)">
          <el-button
              size="mini"
              type="danger"
              icon="el-icon-delete"
              slot="reference">
          </el-button>
        </el-popconfirm>

        <el-popconfirm
            style="margin: 5px;"
            title="确认锁定该Token吗？"
            @confirm="handleTokenLock(scope.$index, scope.row)">
          <el-button
              size="mini"
              type="warning"
              icon="el-icon-lock"
              slot="reference">
          </el-button>
        </el-popconfirm>
        <el-button
            style="margin: 5px;"
            size="mini"
            type="success"
            icon="el-icon-edit"
            @click="handleTokenEdit(scope.$index, scope.row)">
        </el-button>
      </template>
      <template slot-scope="scope" slot="expireTime">
        <el-tag type="success" v-if="new Date(scope.row.expireTime).getTime() === 0">永不过期</el-tag>
        <el-tag type="danger" v-else-if="(new Date(scope.row.expireTime).getTime() - new Date().getTime()) <= 0">已过期
        </el-tag>
        <el-tag v-else>还有{{ scope.row.expireTime | subToStr }}天过期</el-tag>
      </template>
    </el-search-table-pagination>

    <el-dialog
        width="600px"
        :title="tokenForm.popLabel"
        :close-on-click-modal="false"
        :visible.sync="addTokenVisible">
      <el-form :model="tokenForm" :rules="tokenRules" label-width="50px" ref="tokenForm">
        <el-form-item label="注释" prop="tokenNote">
          <el-input v-model.trim="tokenForm.tokenNote" autocomplete="on"></el-input>
        </el-form-item>

        <el-form-item label="过期" prop="expireDay">
          <el-select v-model="tokenForm.expireDay" placeholder="请选择">
            <el-option value="" label="过期时间"></el-option>
            <el-option value="7" label="7天"></el-option>
            <el-option value="30" label="30天"></el-option>
            <el-option value="60" label="60天"></el-option>
            <el-option value="90" label="90天"></el-option>
            <el-option value="0" label="永久"></el-option>
            <el-option value="-1" label="自定义"></el-option>
          </el-select>

          <el-date-picker
              style="margin-left: 10px"
              v-model="tokenForm.expireTime"
              type="datetime"
              placeholder="选择日期时间"
              align="right"
              v-if="dayOptions.indexOf(tokenForm.expireDay) === -1">
          </el-date-picker>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="submitForm">立即提交</el-button>
          <el-button @click="$refs.tokenForm.resetFields()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import {dateFormat} from "@/util"

export default {
  name: "Token",
  data() {
    const checkExpireDay = (rule, value, callback) => {
      if (!value) {
        return callback(new Error("请选择过期时间"));
      }

      if (value === "-1" && !this.tokenForm.expireTime) {
        return callback(new Error("请填写自定义过期时间"));
      }

      callback();
    };

    return {
      addTokenVisible: false,
      dayOptions: ["", "7", "30", "60", "90", "0"],
      tokenForm: {
        popLabel: "",
        tokenNote: "",
        expireDay: "",
        expireTime: "",
      },
      tokenRules: {
        expireDay: [
          {validator: checkExpireDay, trigger: "blur"}
        ]
      },
      tokenFormOptions: {
        inline: true,
        size: "small",
        forms: [
          {prop: "tokenNote", label: "Token注释"},
        ]
      },
      tokenColumns: [
        {type: "selection"},
        {prop: "tokenKey", label: "Token值", sortable: true, minWidth: 300},
        {prop: "tokenNote", label: "Token注释", sortable: true, minWidth: 150},
        {prop: "expireTime", label: "过期时间", slotName: "expireTime", sortable: true, width: 150},
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
        {label: "操作", width: 185, slotName: "operate", fixed: "right"}
      ],
      tokenSelection: []
    }
  },
  computed: {
    tokenData() {
      const data = {
        tokenNote: this.tokenForm.tokenNote,
        expireStamp: 0
      };

      if (this.tokenForm.expireDay === "-1") {
        data.expireStamp = new Date(this.tokenForm.expireTime).getTime();
      } else {
        const now = Number(this.tokenForm.expireDay);
        data.expireStamp = (now === 0) ? 0 : new Date().getTime() + now * 24 * 60 * 60 * 1000;
      }

      if (this.tokenForm.id) {
        data.id = this.tokenForm.id;
      }

      return data;
    }
  },
  methods: {
    submitForm() {
      this.$refs.tokenForm.validate((valid) => {
        if (!valid) {
          return false;
        }

        if (this.tokenForm.id) {
          this.baseTokenEdit();
        } else {
          this.baseTokenAdd();
        }
      });
    },
    handleTokenAdd() {
      this.tokenForm = {
        popLabel: "添加Token",
        tokenNote: "",
        expireDay: "",
        expireTime: "",
      };
      this.addTokenVisible = true;
    },
    handleTokenDelete(index, row) {
      this.baseTokenDelete(row.id);
    },
    handleTokenLock(index, row) {
      this.baseTokenLock(row.id);
    },
    handleTokenDeleteSelect() {
      this.baseTokenDelete(this.tokenSelection.join(","));
    },
    handleTokenLockSelect() {
      this.baseTokenLock(this.tokenSelection.join(","));
    },
    handleTokenEdit(index, row) {
      this.tokenForm = {
        id: row.id,
        popLabel: "修改Token",
        tokenNote: row.tokenNote,
        expireDay: "",
        expireTime: "",
      };
      this.addTokenVisible = true;
    },
    baseTokenAdd() {
      this.$axios.post("/passToken", {}, {
        params: this.tokenData
      }).then(({data}) => {
        if (data.code === 0) {
          this.$success(data.msg);
          // 隐藏窗口
          this.addTokenVisible = false;
          //执行表格重载
          this.$refs.tokenTable.searchHandler(false);
        } else {
          this.$warning(data.msg);
        }
      }).catch((err) => {
        this.$error(err.toString());
      });
    },
    baseTokenEdit() {
      this.$axios.put("/passToken", {}, {
        params: this.tokenData
      }).then(({data}) => {
        if (data.code === 0) {
          this.$success(data.msg);
          // 隐藏窗口
          this.addTokenVisible = false;
          //执行表格重载
          this.$refs.tokenTable.searchHandler(false);
        } else {
          this.$warning(data.msg);
        }
      }).catch((err) => {
        this.$error(err.toString());
      });
    },
    baseTokenDelete(idStr) {
      this.$axios.delete("/passToken", {
        params: {id: idStr}
      }).then(({data}) => {
        if (data.code === 0) {
          this.$success(`Token已删除，已删除 ${data.count} 共 ${data.total}`);
          //执行表格重载
          this.$refs.tokenTable.searchHandler(false);
        } else {
          this.$warning("Token删除失败");
        }
      }).catch((err) => {
        this.$error(err.toString());
      });
    },
    baseTokenLock(idStr) {
      this.$axios.put("/passToken/lock", {}, {
        params: {id: idStr}
      }).then(({data}) => {
        if (data.code === 0) {
          this.$success(`Token已禁用，已禁用 ${data.count} 共 ${data.total}`);
          //执行表格重载
          this.$refs.tokenTable.searchHandler(false);
        } else {
          this.$warning("Token禁用失败");
        }
      }).catch((err) => {
        this.$error(err.toString());
      });
    },
    handleSelectionChange(changeItems) {
      //获取用户的选中
      this.tokenSelection = changeItems.map(obj => {
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
.token-wrap {
  margin: 10px;
}

.token-wrap .el-table .cell {
  white-space: nowrap !important;
}
</style>

