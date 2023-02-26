<template>
  <div>
    <el-dialog
        width="600px"
        :title="!dataForm.id ? '新增' : '修改'"
        :close-on-click-modal="false"
        :visible.sync="visible">
      <el-form :model="dataForm" :rules="dataRule" label-width="100px" ref="dataForm"
               @keyup.enter.native="dataFormSubmit()">
        <el-form-item label="分组代码" prop="codename">
          <template v-if="!dataForm.id">
            <el-input type="text" v-model="dataForm.codename" placeholder="分组代码" autocomplete="on"></el-input>
          </template>
          <template v-else>
            {{ dataForm.codename }}
          </template>
        </el-form-item>
        <el-form-item label="分组描述" prop="name">
          <el-input v-model.trim="dataForm.name" autocomplete="on"></el-input>
        </el-form-item>
        <el-form-item label="权限">
          <permission-tree v-model="dataForm.permissionIds"></permission-tree>
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
import PermissionTree from '@/views/common/PermissionTree'

export default {
  components: {
    PermissionTree
  },
  data() {
    const validateCodename = (rule, value, callback) => {
      if (!/^\w+$/g.test(value)) {
        return callback(new Error("分组代码格式错误"));
      }
      callback();
    };
    return {
      visible: false,
      dataForm: {
        id: 0,
        codename: "",
        name: "",
        permissionIds: []
      },
      dataRule: {
        codename: [
          {required: true, message: '必须输入分组（角色）代码', trigger: 'blur'},
          {validator: validateCodename, trigger: "blur"}
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
          this.dataForm.codename = row.codename
          this.dataForm.name = row.name
          this.dataForm.permissionIds = []
          this.getPermissionIds(this.dataForm.id)
        }
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 清洗数据
          this.dataForm.id = this.dataForm.id || undefined;

          this.$axios({
            method: !this.dataForm.id ? 'post' : 'put',
            url: "/authGroup",
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
    getPermissionIds(groupId) {
      this.$axios.get(`/authGroup/permissions/${groupId}`)
          .then(({data}) => {
            if (data.code === 0) {
              this.dataForm.permissionIds = data.data;
            }
          }).catch((ignored) => {
      });
    }
  }
}
</script>
