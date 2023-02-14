<template>
  <div>
    <el-dialog
        width="600px"
        :title="!dataForm.id ? '新增' : '修改'"
        :close-on-click-modal="false"
        :visible.sync="visible">
      <el-form :model="dataForm" label-width="100px" ref="dataForm">
        <el-form-item label="权限代码">
          {{ dataForm.codename }}
        </el-form-item>
        <el-form-item label="权限表格">
          {{ dataForm.model }}
        </el-form-item>
        <el-form-item label="权限描述">
          <el-input v-model.trim="dataForm.name" autocomplete="on"></el-input>
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
export default {
  data() {
    return {
      visible: false,
      dataForm: {
        id: -1,
        codename: "",
        model: "",
        name: ""
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
          this.dataForm.model = row.model
          this.dataForm.name = row.name
        }
      })
    },
    // 表单提交
    dataFormSubmit() {
      this.$refs['dataForm'].validate((valid) => {
        if (valid) {
          // 清洗数据
          this.dataForm.id = this.dataForm.id || undefined;

          this.$axios.put("/authPermission", this.permissionForm).then(({data}) => {
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
    }
  }
}
</script>
