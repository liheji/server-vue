<template>
  <div class="socket-wrap">
    <el-container>
      <el-header height="100px">
        <el-form size="small">
          <el-form-item>
            <el-input v-model="msg" placeholder="请输入内容" @keyup.enter.native="handleSend">
              <el-button slot="append" icon="el-icon-position" @click="handleSend">发送</el-button>
            </el-input>
          </el-form-item>
          <el-form-item>
            <el-button :type="btnType" :disabled="this.socket.readyState === 1" :loading="connectBtnLoading"
                       @click="handleConnect">
              {{ btnPrefix }}连接
            </el-button>
            <el-button type="danger" :disabled="this.socket.readyState !== 1" @click="handleDisConnect">
              断开
            </el-button>
          </el-form-item>
        </el-form>
      </el-header>

      <el-main :style="mainStyle">
        <el-timeline :reverse="true">
          <el-timeline-item
              v-for="(activity, index) in activities"
              :key="index"
              :icon="activity.icon"
              :size="activity.size"
              :color="activity.color"
              :timestamp="activity.timestamp">
            {{ activity.content }}
          </el-timeline-item>
        </el-timeline>
      </el-main>
    </el-container>
  </div>
</template>
<script>
import {dateFormat} from "@/util";

export default {
  name: "Socket",
  data() {
    return {
      msg: "",
      activities: [],
      socket: {readyState: 0},
      connectTimeOut: 5000,
      connectBtnLoading: false,
      displayHeight: 800
    };
  },
  computed: {
    btnType() {
      return (this.socket.readyState === WebSocket.OPEN) ? "success" : "primary";
    },
    btnPrefix() {
      return (this.socket.readyState === WebSocket.OPEN) ? "已" : "";
    },
    mainStyle() {
      return `overflow: auto; height: ${this.displayHeight}px`;
    }
  },
  methods: {
    handleConnect() {
      //设置 UID对应的 href
      this.connectBtnLoading = true;
      this.pushMsg("正在连接服务器...")

      this.$axios.get("/secretCaptcha").then(resp => {
        setTimeout(() => {
          if (this.socket.readyState !== WebSocket.OPEN) {
            this.socket.close();
          }
        }, this.connectTimeOut);

        var baseUrl = location.origin.replace("http", "ws");
        //*****************************测试开启*****************************
        // baseUrl = baseUrl.replace("8081", "8080");
        //*****************************测试开启*****************************
        this.socket = new WebSocket(`${baseUrl}/websocket/${resp.data.key}`);
        this.socket.onerror = (event) => {
          this.pushMsg("认证失败", '#F56C6C');
        }

        this.socket.onopen = (event) => {
          this.connectBtnLoading = false;
          this.pushMsg("连接成功", '#0bbd87');
        }

        this.socket.onclose = (event) => {
          this.connectBtnLoading = false;
          this.pushMsg("服务器已关闭", '#E6A23C');
        }

        this.socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          switch (data.action) {
            case 2:
              this.pushMsg(`收到：${data.msg}`, '#409EFF', 'el-icon-bottom-right');
              break;
            default:
              console.log(data);
              break
          }
        }
      });
    },
    handleSend() {
      if (this.socket.readyState === WebSocket.OPEN && this.msg.length > 0) {
        this.pushMsg(`发送：${this.msg}`, '#409EFF', 'el-icon-top-right');
        this.socket.send(JSON.stringify({
          action: 2,
          msg: this.msg
        }));
        this.msg = '';
      } else {
        this.$warning("尚未连接到服务器");
      }
    },
    handleDisConnect() {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.close();
      }
    },
    pushMsg(content, color, icon) {
      var obj = {
        content: content,
        timestamp: dateFormat(new Date()),
      };

      if (typeof color === 'string' && color.trim().length > 0) {
        obj.color = color;
      }

      if (typeof icon === 'string' && icon.trim().length > 0) {
        obj.icon = icon;
        obj.size = 'large';
      }

      this.activities.push(obj);
    }
  },
  mounted() {
    this.$nextTick(() => {
      var subHeight = document.getElementsByTagName("footer")[0].clientHeight;
      const menu = document.getElementsByClassName("main-wrap");
      const container = document.getElementsByClassName("el-header")
      if (menu.length > 0) {
        subHeight += menu[0].clientHeight;
      }

      if (container.length > 0) {
        subHeight += container[0].clientHeight + 50;
      }

      this.displayHeight = document.documentElement.clientHeight - subHeight;
    })
  },
  beforeDestroy() {
    this.handleDisConnect();
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.socket-wrap {
  margin: 10px;
}
</style>
