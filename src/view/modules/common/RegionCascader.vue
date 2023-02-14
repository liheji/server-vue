<template>
  <div>
    <el-cascader
        ref="region"
        filterable
        clearable
        placeholder="试试搜索：成都"
        v-model="location"
        :options="options">
    </el-cascader>
  </div>
</template>

<script>
import regionData from '@/components/data/region.json'

const region = (values) => {
  var ret = ''
  var data = regionData
  for (var i = 0; i < 3; i++) {
    data.forEach(it => {
      if (it.value === values[i]) {
        ret += it.label
        data = it.children
      }
    })
  }
  return ret
}

export default {
  //接受父组件传来的值
  props: {
    value: {
      type: String,
      default: () => ''
    },
    region: {
      type: String,
      default: () => ''
    }
  },
  data() {
    return {
      options: regionData,
      location: [],
    }
  },
  watch: {
    location(val) {
      if (val && val.length >= 3) {
        this.$emit('input', val[2])
        this.$emit('update:region', region(val))
      } else {
        this.$emit('input', '')
        this.$emit('update:region', '')
      }
    },
    value(val) {
      if (val && val.length === 6) {
        this.location = []
        this.location.push(val.substring(0, 2) + '0000')
        this.location.push(val.substring(0, 4) + '00')
        this.location.push(val)
        this.$emit('update:region', region(this.location))
      }
    }
  }
}
</script>
<style scoped>
</style>
