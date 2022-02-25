<template>
  <div class="server-warp">
    <el-row id="serverRow" style="margin: 10px;">
      socket状态：
      <el-tag type="success" v-if="this.socket.readyState === 1">已连接</el-tag>
      <template v-else>
        <el-tag type="danger">错误</el-tag>
        <el-button size="small" type="primary"
                   style="margin-left: 10px;"
                   :loading="websocketBtnLoading"
                   @click="websocketConnect">
          连接
        </el-button>
      </template>
      <el-button size="small" type="primary" style="margin-left: 10px;"
                 :title="this.socket.readyState === 1 ? '登录服务器' : '连接socket后才能登录'"
                 :disabled="serverLoginVisible || this.socket.readyState !== 1"
                 @click="serverLoginVisible = true">
        登录服务器
      </el-button>
    </el-row>
    <el-tree lazy
             ref="tree"
             :style="mainStyle"
             icon-close-class="el-icon-folder"
             icon-open-class="el-icon-folder-opened"
             icon-leaf-class="el-icon-document"
             :props="treeProps"
             :load="treeLoadData"
             @node-click="treeNodeClick">
            <span class="custom-tree-node"
                  slot-scope="{ node }"
                  @contextmenu.prevent="treeOpenContextMenu(node)">
              <span>{{ node.label }}</span>
              <span>
                <i class="el-icon-more" @click.stop="treeOpenContextMenu(node)" v-show="node.isCurrent && isMobile"></i>
              </span>
            </span>
    </el-tree>

    <context-menu ref="ctx">
      <li class="ctx-item" v-show="!treeInfoNode.isLeaf" @click="treeUploadVisible = true">
        <i class="el-icon-upload2"></i>上传
      </li>
      <li class="ctx-item" v-show="treeInfoNode.isLeaf" @click="treeDownload">
        <i class="el-icon-download"></i>下载
      </li>
      <li class="ctx-item" v-show="!treeInfoNode.isLeaf" @click="treeAppend">
        <i class="el-icon-circle-plus-outline"></i>创建
      </li>
      <li class="ctx-item" @click="treeRemove">
        <i class="el-icon-delete"></i>删除
      </li>
      <li class="ctx-item" @click="treeInfoVisible = true">
        <i class="el-icon-warning-outline"></i>属性
      </li>
    </context-menu>

    <el-dialog
        title="文件信息"
        width="450px"
        :visible.sync="treeInfoVisible">
      <el-descriptions border size="small" :column="1">
        <el-descriptions-item label="文件名">
          <i :class="treeInfoNode.data.isFile ? 'el-icon-document' : 'el-icon-folder'"></i>
          {{ treeInfoNode.label }}
        </el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag size="small">{{ treeInfoNode.data.permit | fileType }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="大小" v-if="treeInfoNode.data.isFile">
          {{ treeInfoNode.data.size | sizeFormat }}
        </el-descriptions-item>
        <el-descriptions-item label="路径">
          <span>{{ treeInfoPath }}</span>
          <el-link title="复制"
                   style="margin-left: 10px;"
                   class="el-icon-copy-document"
                   :underline="false"
                   @click="treeInfoCopy">
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="修改时间">{{ treeInfoNode.data.time | formatDate }}</el-descriptions-item>
        <el-descriptions-item label="所有者">{{ treeInfoNode.data.user }}</el-descriptions-item>
        <el-descriptions-item label="所属组">{{ treeInfoNode.data.group }}</el-descriptions-item>
        <el-descriptions-item label="链接至" v-if="treeInfoNode.data.link">
          {{ treeInfoNode.data.link }}
        </el-descriptions-item>
        <el-descriptions-item label="权限">{{ treeInfoNode.data.permit }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog
        title="登录服务器"
        width="500px"
        :close-on-click-modal="false"
        :visible.sync="serverLoginVisible">
      <el-tabs v-model="serverForm.use">
        <el-tab-pane label="密码登录" name="0">
          <el-form label-width="80px" :model="serverForm" :rules="serverRules" ref="serverForm">
            <el-form-item label="主机地址" prop="host">
              <el-input v-model="serverForm.host" autocomplete="on">
                <template slot="append">
                  &nbsp;:
                  <el-input type="number" v-model.number="serverForm.port" @input="serverPortInput"></el-input>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="登录账户" prop="username">
              <el-input v-model="serverForm.username"></el-input>
            </el-form-item>
            <el-form-item label="登录密码">
              <el-input type="password" v-model="serverForm.password" @keyup.enter.native="serverLogin"></el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="授权文件" name="1">
          <el-form label-width="80px" :model="serverForm" :rules="serverRules">
            <el-form-item label="主机地址" prop="host">
              <el-input v-model="serverForm.host" autocomplete="on">
                <template slot="append">
                  &nbsp;:
                  <el-input type="number" v-model.number="serverForm.port" @input="serverPortInput"></el-input>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="登录账户" prop="username">
              <el-input v-model="serverForm.username"></el-input>
            </el-form-item>
            <el-form-item label="授权文件">
              <el-upload
                  ref="auth"
                  action="/fileAttr"
                  with-credentials
                  :limit="1"
                  :multiple="false"
                  :auto-upload="false"
                  :on-error="authFileError"
                  :on-change="authFileChange"
                  :on-success="authFileSuccess"
                  :show-file-list="false">
                <el-button size="mini" type="primary" @click="$refs.auth.clearFiles()">选择文件</el-button>
                <el-tag effect="plain" type="primary" size="medium"
                        style="margin-left: 10px;border: none;"
                        @click="$refs.auth.clearFiles()">
                  {{ serverFileMsg }}
                </el-tag>
              </el-upload>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer">
        <el-button @click="serverLoginVisible = false">取消</el-button>
        <el-button type="primary"
                   :loading="serverBtnLoading"
                   @click="serverLogin">
          确定
        </el-button>
      </div>
    </el-dialog>
  </div>
</template>

<script>
/**
 * - 普通文件
 * d 目录文件
 * l 链接文件
 * b 块设备文件
 * c 字符设备文件
 * p 管理文件
 * s 套接字文件
 */
import {isMobile, copyText, fileFormat} from "@/util";

const FILE_TYPE = {
  '-': "普通文件",
  'd': "目录文件",
  'l': "链接文件",
  'b': "块设备文件",
  'c': "字符设备文件",
  'p': "管理文件",
  's': "套接字文件"
};

export default {
  name: "Server",
  data() {
    return {
      id: 0,
      isMobile: isMobile(),

      treeInfoNode: {data: {}},
      treeInfoPath: '',
      treeInfoVisible: false,
      treeProps: {
        label: 'name',
        isLeaf: 'isFile',
        children: 'children',
        disabled: 'disabled'
      },

      serverLoginVisible: false,
      serverForm: {
        host: '',
        port: 22,
        username: 'root',
        password: '',
        authFile: '',

        use: '0',
        action: 0,
      },
      serverRules: {
        host: [
          {required: true, message: '请输入主机地址', trigger: 'blur'}
        ],
        username: [
          {required: true, message: '请输入用户名', trigger: 'blur'}
        ]
      },

      serverBtnLoading: false,
      websocketBtnLoading: false,
      serverFileMsg: '未选择文件',
      socket: {readyState: 0},
      connectTimeOut: 5000,
      node: undefined,
      resolve: undefined,
      displayHeight: 800
    };
  },
  computed: {
    mainStyle() {
      return `border:1px solid black;padding:10px;overflow:auto;height:${this.displayHeight}px`;
    }
  },
  methods: {
    treeDownload() {
      console.log("treeDownload -> 不做");
    },
    treeAppend() {
      console.log("treeAppend -> 不做");
      const data = this.treeInfoNode.data;
      const newChild = {
        id: this.id++,
        label: 'test' + this.id,
        children: []
      };
      if (!data.children) {
        this.$set(data, 'children', []);
      }
      data.children.push(newChild);
    },
    treeRemove() {
      console.log("treeRemove -> 不做");
      const node = this.treeInfoNode;
      const data = this.treeInfoNode.data;
      this.$confirm(`确认删除 ${data.label} ？`).then(() => {
        const children = node.parent.childNodes;
        const index = children.findIndex(d => d.id === data.id);
        children.splice(index, 1);
      });
    },
    treeInfoCopy({target}) {
      copyText(target.parentNode.firstChild);
    },
    treeOpenContextMenu(node) {
      this.treeInfoPath = this.baseNodePath(node);
      this.treeInfoNode = node;
      this.$refs.ctx.open();
    },
    treeLoadData(node, resolve) {
      this.node = node;
      this.resolve = resolve;
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify({
          path: this.baseNodePath(node),
          action: 1
        }));
      }
    },
    treeNodeClick(data, node) {
      if (typeof node.isLeafByUser === 'boolean' && node.isLeaf && !node.isLeafByUser) {
        node.expanded = !node.expanded;
      }
    },
    serverLogin() {
      this.$refs.serverForm.validate((valid) => {
        if (valid && (this.serverForm.password || this.serverForm.use === '1')) {
          this.serverBtnLoading = true;
          if (this.serverForm.use === '1' && !this.serverForm.authFile) {
            this.$refs.auth.submit();
          } else {
            this.serverConnect();
          }
        }
      })
    },
    serverPortInput() {
      if (this.serverForm.port > 65535) {
        this.serverForm.port = 65535;
      }
    },
    authFileChange(file) {
      if (file.size > 1048576) {
        this.$refs.auth.clearFiles();
        this.$warning('文件不能大于1M');
        return;
      }

      this.serverFileMsg = file.name;
    },
    authFileError() {
      this.serverFileMsg = '失败'
      this.serverBtnLoading = false;
    },
    authFileSuccess(resp) {
      this.serverFileMsg = '文件上传成功'
      this.serverForm.authFile = resp.data[0].fileName;
      this.serverConnect();
    },
    serverConnect() {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(this.serverForm));
      }
    },
    baseNodePath(node) {
      const res = [];
      var cur = node;
      while (cur !== undefined && cur != null) {
        res.unshift(cur.label);
        cur = cur.parent;
      }
      const tmp = res.join('/').trim();

      return tmp.length > 0 ? tmp : '/';
    },
    websocketConnect() {
      this.websocketBtnLoading = true;
      this.$axios.get("/secretCaptcha").then(resp => {
        setTimeout(() => {
          if (this.socket.readyState !== WebSocket.OPEN) {
            this.socket.close();
          }
        }, this.connectTimeOut);

        var baseUrl = location.origin.replace("http", "ws")
        //*****************************测试开启*****************************
        // baseUrl = baseUrl.replace("8081", "8080");
        //*****************************测试开启*****************************
        this.socket = new WebSocket(`${baseUrl}/websocket/${resp.data.key}`);
        this.socket.onopen = (event) => {
          this.websocketBtnLoading = false;
        }

        this.socket.onclose = (event) => {
          this.websocketBtnLoading = false;
          this.$error('socket 连接已断开');
        }

        this.socket.onmessage = (event) => {
          const data = JSON.parse(event.data);
          switch (data.action) {
            case 0:
              this.serverBtnLoading = false;
              if (data.code === 0) {
                this.serverLoginVisible = false;
                //清除原有数据
                const root = this.$refs.tree.root;
                root.loaded = false;
                root.childNodes = [];

                //加载新数据
                root.expand();

                this.$success(data.msg);
              } else {
                this.$error(data.msg);
              }
              break;
            case 1:
              if (data.code === 0) {
                this.resolve(data.data);
              } else {
                this.$error(data.msg);
              }
              break;
            default:
              console.log(data);
              break;
          }
        }
      }).catch((err) => {
        this.websocketBtnLoading = false;
        this.$error('连接失败：' + err.toString());
      });
    }
  },
  filters: {
    sizeFormat(value) {
      return '' || fileFormat(value);
    },
    fileType(value) {
      return (typeof value == "string") ? FILE_TYPE[value[0]] : '';
    }
  },
  mounted() {
    this.websocketConnect();

    this.$nextTick(() => {
      var subHeight = document.getElementsByTagName("footer")[0].clientHeight
          + document.getElementById("serverRow").clientHeight;
      const menu = document.getElementsByClassName("main-wrap");
      if (menu.length > 0) {
        subHeight += menu[0].clientHeight + 50;
      }
      this.displayHeight = document.documentElement.clientHeight - subHeight;
    })
  },
  beforeDestroy() {
    if (this.socket.readyState === WebSocket.OPEN) {
      this.socket.close();
    }
  }
}
</script>

<style>
.server-warp .custom-tree-node {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: space-between;
  font-size: 14px;
  padding-right: 8px;

}

.server-warp .custom-tree-node i {
  margin-left: 5px;
  margin-right: 5px;
}

.server-warp .el-input-group__append {
  padding: 0 !important;
}

.server-warp .el-input-group__append input {
  padding: 0 !important;
  background: #f5f7fa;
  border: none;
  width: 55px;
  font-size: inherit;
  height: 36px;
}
</style>
