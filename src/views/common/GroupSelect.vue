<template>
  <el-select v-model="groupIds" multiple placeholder="请选择" @change="$forceUpdate()">
    <el-option
        v-for="item in groupSelectData"
        :key="item.id"
        :label="item.name"
        :value="item.id">
    </el-option>
  </el-select>
</template>

<script>

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
      groupSelectData: [],
      groupIds: []
    }
  },
  methods: {
    getgroups() {
      this.$axios.get('/authGroup', {
        params: {
          page: 1,
          limit: 1000
        }
      }).then(({data}) => {
        if (data.code === 0) {
          this.groupSelectData = data.page.list;
        }
      }).catch((ignored) => {
      });
    }
  },
  watch: {
    groupIds(val) {
      this.$emit('input', val)
    },
    value(val) {
      if (val === this.groupIds) {
        return
      }
      this.groupIds = val
    }
  },
  mounted() {
    this.getgroups();
  }
}
</script>

