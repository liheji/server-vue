<template>
  <div>
    <el-dialog
        :title="!dataForm.id ? '新增' : '编辑'"
        :close-on-click-modal="false"
        :visible.sync="visible">
      <el-form :model="dataForm"
               :rules="dataRule"
               label-width="70px"
               ref="dataForm"
               style="margin-right: 20px;" @keyup.enter.native="dataFormSubmit()">
        <el-form-item label="用户名">
          <template v-if="!dataForm.id">
            <el-input type="text" v-model="dataForm.username" placeholder="用户名" autocomplete="on"></el-input>
          </template>
          <template v-else>
            {{ dataForm.username }}
          </template>
        </el-form-item>
        <el-form-item label="状态">
          <el-switch v-if="hasAuthority('delete_account')" v-model="dataForm.isEnabled"
                     active-text="正常"
                     inactive-text="锁定">
          </el-switch>
          <template v-else>
            <el-tag type="success" effect="dark" v-if="dataForm.isEnabled">正常</el-tag>
            <el-tag type="danger" effect="dark" v-else>锁定</el-tag>
          </template>
        </el-form-item>
        <el-form-item label="重置密码">
          <el-switch v-model="dataForm.resetPassword"
                     active-text="重置(12345)"
                     inactive-text="保持">
          </el-switch>
        </el-form-item>
        <el-form-item label="邮箱" prop="email">
          <el-input type="text" v-model="dataForm.email"
                    placeholder="邮箱" autocomplete="on">
          </el-input>
        </el-form-item>
        <el-form-item label="手机号" prop="mobile">
          <el-input type="text" v-model="dataForm.mobile"
                    placeholder="手机号" autocomplete="on">
          </el-input>
        </el-form-item>
        <el-form-item label="身份" prop="isSuperuser">
          <el-select v-model="dataForm.isSuperuser">
            <el-option label="普通用户" :value="false"></el-option>
            <el-option label="管理员(拥有所有权限)" :value="true"></el-option>
          </el-select>
        </el-form-item>
        <el-form-item label="分组" v-show="!dataForm.isSuperuser">
          <group-select v-model="dataForm.groupIds"></group-select>
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="dataFormSubmit">立即提交</el-button>
          <el-button @click="$refs.dataForm.resetFields()">重置</el-button>
        </el-form-item>
      </el-form>
    </el-dialog>
  </div>
</template>

<script>
import GroupSelect from '@/views/common/GroupSelect'
import PermissionTree from '@/views/common/PermissionTree'

export default {
  components: {
    GroupSelect,
    PermissionTree
  },
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
      visible: false,
      dataForm: {
        id: 0,
        username: "",
        mobile: "",
        email: "",
        isEnabled: false,
        isSuperuser: false,
        resetPassword: false,
        groupIds: [],
      },
      dataRule: {
        mobile: [
          {validator: validateMobile, trigger: "blur"}
        ],
        email: [
          {type: 'email', message: '邮箱无效', trigger: 'blur'}
        ]
      }
    }
  },
  methods: {
    init(row) {
      this.dataForm.id = 0;
      if (row && row.id && row.id > 0) {
        this.dataForm.id = row.id
      }
      this.visible = true
      this.$nextTick(() => {
        this.$refs['dataForm'].resetFields()
        if (this.dataForm.id) {
          this.dataForm.username = row.username
          this.dataForm.mobile = row.mobile
          this.dataForm.email = row.email
          this.dataForm.isEnabled = row.isEnabled
          this.dataForm.isSuperuser = row.isSuperuser
          this.dataForm.resetPassword = false
          this.getGroupIds(this.dataForm.id)
          this.getPermissionIds(this.dataForm.id)
        }
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 清洗数据
          if (this.dataForm.isSuperuser) {
            this.dataForm.groupIds = [];
          }
          this.dataForm.id = this.dataForm.id || undefined;

          this.$axios({
            method: !this.dataForm.id ? 'post' : 'put',
            url: "/account",
            data: this.dataForm
          }).then(({data}) => {
            if (data.code === 0) {
              this.$message({
                message: data.msg,
                type: 'success',
                duration: 1500,
                onClose: () => {
                  this.visible = false
                  this.$emit('refreshDataList')
                }
              })
            } else {
              this.$warning(data.msg);
            }
          }).catch((err) => {
            this.$error(err.toString());
          });
        }
      })
    },
    getGroupIds(accountId) {
      this.$axios.get(`/account/groups/${accountId}`)
          .then(({data}) => {
            if (data.code === 0) {
              this.dataForm.groupIds = data.data;
            }
          }).catch((ignored) => {
      });
    }
  }
}
</script>
<style>
</style>
