<template>
  <div class="device-warp">
    <el-row :gutter="10">
      <el-col v-for="item in devices"
              :xs="{span: 24}"
              :sm="{span: 12}"
              :md="{span: 8}"
              :lg="{span: 6}"
              :key="item.type">
        <el-card>
          <div slot="header" class="">
            <span>设备信息</span>
            <i :class="typeIcon(item.type)" style="margin-left: 12px;"></i>
          </div>
          <el-descriptions :column="1">
            <el-descriptions-item label="状态">
              <el-tag size="small" type="success" v-if="item.isValid">在线</el-tag>
              <el-tag size="small" type="danger" v-else>离线</el-tag>
              <el-tag size="small" v-if="item.isCurrent" style="margin-left: 10px;">当前设备</el-tag>
            </el-descriptions-item>
            <el-descriptions-item label="设备类型">{{ typeName(item.type) }}</el-descriptions-item>
            <el-descriptions-item label="IP地址">{{ item.ip }}</el-descriptions-item>
            <el-descriptions-item label="操作系统">{{ item.operateSystem }}</el-descriptions-item>
            <el-descriptions-item label="浏览器">{{ item.browser }}</el-descriptions-item>
            <el-descriptions-item label="最后登录">{{ item.lastUsed | formatDate }}</el-descriptions-item>
          </el-descriptions>
          <el-button type="danger" size="small" style="margin-top:10px;margin-right: 10px;"
                     @click="deviceQuit(item)"
                     :disabled="!item.isValid"
                     :loading="loading && current.id === item.id"
                     v-html="buttonText(item.isValid)">
          </el-button>
        </el-card>
      </el-col>
    </el-row>
  </div>
</template>

<script>
const deviceType = {
  Computer: {
    icon: "el-icon-monitor",
    name: "电脑"
  },
  Mobile: {
    icon: "el-icon-mobile-phone",
    name: "手机"
  },
  Tablet: {
    icon: "el-icon-mobile",
    name: "平板"
  },
  Other: {
    icon: "el-icon-watch",
    name: "其他"
  }
};

export default {
  name: "Device",
  data() {
    return {
      current: {},
      loading: false,
      devices: []
    }
  },
  methods: {
    buttonText(isValid) {
      var orgText = "&nbsp;&nbsp;注销设备&nbsp;&nbsp;";
      if (!isValid) {
        orgText = "&nbsp;&nbsp;设备已注销&nbsp;&nbsp;";
      }
      return orgText
    },
    typeIcon(value) {
      return deviceType[value].icon;
    },
    typeName(value) {
      return deviceType[value].name;
    },
    deviceQuit(item) {
      this.current = item;
      this.$axios.put("/device", {}, {
        params: {tp: item.type}
      }).then(({data}) => {
        if (data.code === 0) {
          this.$success(data.msg);
          this.devices.forEach((it) => {
            if (it.type === item.type) {
              it.isValid = !it.isValid;
            }
          });

          if (item.isCurrent) {
            this.$router.push({name: "login"});
          }
        } else {
          this.$warning(data.msg);
        }
      }).catch((err) => {
        this.$error(err.toString());
        this.loading = false;
      })
    }
  },
  beforeCreate() {
    //数据加载之前加载设备信息
    this.$axios.get("/device").then(({data}) => {
      this.devices = data.data;
    }).catch((ignored) => {
    });
  }
}
</script>

<style>
.device-warp {
  text-align: center;
}
</style>
