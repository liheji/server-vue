<template>
  <el-tree
      style="height: 220px;overflow-y: auto;"
      :data="permissionTreeData"
      show-checkbox
      node-key="id"
      accordion
      @check="handleTreeCheck"
      :default-checked-keys="defaultChecked">
  </el-tree>
</template>

<script>
import {camelName} from "@/util"

export default {
  //接受父组件传来的值
  props: {
    value: {
      type: Array,
      default: () => []
    }
  },
  data() {
    return {
      permissionTreeData: [],
      defaultChecked: [],
      permissionIds: []
    }
  },
  methods: {
    handleTreeCheck(node, status) {
      //获取选中权限
      this.permissionIds = status.checkedKeys.filter((id) => {
        return /\d+/.test(id);
      })
    },
    getPermissions() {
      this.$axios.get('/authPermission', {
        params: {
          page: 1,
          limit: 1000
        }
      }).then(({data}) => {
        if (data.code === 0) {
          const permissions = data.page.list;
          // 按照表分类
          const tempData = {};
          for (const permission of permissions) {
            if (tempData[permission.model] === undefined) {
              tempData[permission.model] = []
            }
            tempData[permission.model].push({id: permission.id, label: `${permission.name}（${permission.codename}）`});
          }
          // 设置 TREE
          this.permissionTreeData = [];
          for (const key in tempData) {
            this.permissionTreeData.push({
              id: 'str_' + key,
              label: `${camelName(key, true)}（${key}）`,
              children: tempData[key]
            })
          }
        }
      }).catch((ignored) => {
      });
    }
  },
  watch: {
    permissionIds(val) {
      this.$emit('input', val)
    },
    value(val) {
      if (val === this.defaultChecked) {
        return
      }
      this.defaultChecked = val
    }
  },
  mounted() {
    this.getPermissions();
  }
}
</script>

<style scoped>

</style>
