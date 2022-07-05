<template>
  <div class="server-warp" v-if="hasAuthority('use_web_socket')">
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
                 :disabled="serverLoginDialogVisible || this.socket.readyState !== 1"
                 @click="serverLoginDialogVisible = true">
        登录服务器
      </el-button>
    </el-row>
    <el-tree lazy
             ref="tree"
             :style='"border:1px solid black;padding:10px;overflow:auto;height:" + displayHeight + "px"'
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
      <li class="ctx-item" v-show="!currentNode.node.isLeaf" @click="treeUploadVisible = true">
        <i class="el-icon-upload2"></i>上传
      </li>
      <li class="ctx-item" v-show="currentNode.node.isLeaf" @click="treeDownload">
        <i class="el-icon-download"></i>下载
      </li>
      <li class="ctx-item" v-show="!currentNode.node.isLeaf" @click="treeAppend">
        <i class="el-icon-circle-plus-outline"></i>创建
      </li>
      <li class="ctx-item" @click="treeRemove">
        <i class="el-icon-delete"></i>删除
      </li>
      <li class="ctx-item" @click="nodeInfoDialogVisible = true">
        <i class="el-icon-warning-outline"></i>属性
      </li>
    </context-menu>

    <el-dialog
        title="文件信息"
        width="450px"
        :visible.sync="nodeInfoDialogVisible">
      <el-descriptions border size="small" :column="1">
        <el-descriptions-item label="文件名">
          <i :class="currentNode.node.data.isFile ? 'el-icon-document' : 'el-icon-folder'"></i>
          {{ currentNode.node.label }}
        </el-descriptions-item>
        <el-descriptions-item label="类型">
          <el-tag size="small">{{ currentNode.node.data.permit | fileType }}</el-tag>
        </el-descriptions-item>
        <el-descriptions-item label="大小" v-if="currentNode.node.data.isFile">
          {{ currentNode.node.data.size | sizeFormat }}
        </el-descriptions-item>
        <el-descriptions-item label="路径">
          <span>{{ currentNode.path }}</span>
          <el-link title="复制"
                   style="margin-left: 10px;"
                   class="el-icon-copy-document"
                   :underline="false"
                   @click="treeInfoCopy">
          </el-link>
        </el-descriptions-item>
        <el-descriptions-item label="修改时间">{{ currentNode.node.data.time | formatDate }}</el-descriptions-item>
        <el-descriptions-item label="所有者">{{ currentNode.node.data.user }}</el-descriptions-item>
        <el-descriptions-item label="所属组">{{ currentNode.node.data.group }}</el-descriptions-item>
        <el-descriptions-item label="链接至" v-if="currentNode.node.data.link">
          {{ currentNode.node.data.link }}
        </el-descriptions-item>
        <el-descriptions-item label="权限">{{ currentNode.node.data.permit }}</el-descriptions-item>
      </el-descriptions>
    </el-dialog>

    <el-dialog
        title="登录服务器"
        width="500px"
        :close-on-click-modal="false"
        :visible.sync="serverLoginDialogVisible">
      <el-tabs v-model="serverForm.formData.use">
        <el-tab-pane label="密码登录" name="0">
          <el-form label-width="80px" :model="serverForm.formData" :rules="serverForm.rules" ref="serverForm">
            <el-form-item label="主机地址" prop="host">
              <el-input v-model="serverForm.formData.host" autocomplete="on">
                <template slot="append">
                  &nbsp;:
                  <el-input type="number" v-model.number="serverForm.formData.port" @input="serverPortInput"></el-input>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="登录账户" prop="username">
              <el-input v-model="serverForm.formData.username"></el-input>
            </el-form-item>
            <el-form-item label="登录密码">
              <el-input type="password" v-model="serverForm.formData.password"
                        @keyup.enter.native="serverLogin"></el-input>
            </el-form-item>
          </el-form>
        </el-tab-pane>
        <el-tab-pane label="授权文件" name="1">
          <el-form label-width="80px" :model="serverForm.formData" :rules="serverForm.rules">
            <el-form-item label="主机地址" prop="host">
              <el-input v-model="serverForm.formData.host" autocomplete="on">
                <template slot="append">
                  &nbsp;:
                  <el-input type="number" v-model.number="serverForm.formData.port" @input="serverPortInput"></el-input>
                </template>
              </el-input>
            </el-form-item>
            <el-form-item label="登录账户" prop="username">
              <el-input v-model="serverForm.formData.username"></el-input>
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
                  :headers="serverForm.fileHeaders"
                  :show-file-list="false">
                <el-button size="mini" type="primary" @click="$refs.auth.clearFiles()">选择文件</el-button>
                <el-tag effect="plain" type="primary" size="medium"
                        style="margin-left: 10px;border: none;"
                        @click="$refs.auth.clearFiles()">
                  {{ serverForm.fileMsg }}
                </el-tag>
              </el-upload>
            </el-form-item>
          </el-form>
        </el-tab-pane>
      </el-tabs>
      <div slot="footer">
        <el-button @click="serverLoginDialogVisible = false">取消</el-button>
        <el-button type="primary"
                   :loading="serverForm.btnLoading"
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
      isMobile: isMobile(),
      nodeInfoDialogVisible: false,
      currentNode: {
        node: {data: {}},
        path: '',
      },
      treeProps: {
        label: 'name',
        isLeaf: 'isFile',
        children: 'children',
        disabled: 'disabled'
      },
      serverLoginDialogVisible: false,
      serverForm: {
        formData: {
          host: '',
          port: 22,
          username: 'root',
          password: '',
          authFile: '',

          use: '0',
          action: 0,
        },
        rules: {
          host: [
            {required: true, message: '请输入主机地址', trigger: 'blur'}
          ],
          username: [
            {required: true, message: '请输入用户名', trigger: 'blur'}
          ]
        },
        fileMsg: '未选择文件',
        fileHeaders: {
          'X-XSRF-TOKEN': this.$cookie.get("XSRF-TOKEN") || ""
        },
        btnLoading: false
      },
      websocketBtnLoading: false,
      socket: {readyState: 0},
      connectTimeOut: 5000,
      // 其他文件
      node: undefined,
      resolve: undefined,
      displayHeight: 800
    };
  },
  methods: {
    treeDownload() {
      console.log("treeDownload -> 不做");
    },
    treeAppend() {
      console.log("treeAppend -> 不做");
      // const data = this.currentNode.node.data;
      // const newChild = {
      //   id: this.id++,
      //   label: 'test' + this.id,
      //   children: []
      // };
      // if (!data.children) {
      //   this.$set(data, 'children', []);
      // }
      // data.children.push(newChild);
    },
    treeRemove() {
      console.log("treeRemove -> 不做");
      // const node = this.currentNode.node;
      // const data = this.currentNode.node.data;
      // this.$confirm(`确认删除 ${data.label} ？`).then(() => {
      //   const children = node.parent.childNodes;
      //   const index = children.findIndex(d => d.id === data.id);
      //   children.splice(index, 1);
      // });
    },
    treeInfoCopy({target}) {
      copyText(target.parentNode.firstChild);
    },
    treeOpenContextMenu(node) {
      this.currentNode.path = this.baseNodePath(node);
      this.currentNode.node = node;
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
        if (valid && (this.serverForm.formData.password || this.serverForm.formData.use === '1')) {
          this.serverForm.btnLoading = true;
          if (this.serverForm.formData.use === '1' && !this.serverForm.formData.authFile) {
            this.$refs.auth.submit();
          } else {
            this.serverConnect();
          }
        }
      })
    },
    serverPortInput() {
      if (this.serverForm.formData.port > 65535) {
        this.serverForm.formData.port = 65535;
      }
    },
    authFileChange(file) {
      if (file.size > 1048576) {
        this.$refs.auth.clearFiles();
        this.$warning('文件不能大于1M');
        return;
      }

      this.serverForm.fileMsg = file.name;
    },
    authFileError() {
      this.serverForm.fileMsg = '失败'
      this.serverForm.btnLoading = false;
    },
    authFileSuccess(resp) {
      this.serverForm.fileMsg = '文件上传成功'
      this.serverForm.formData.authFile = resp.data[0].fileName;
      this.serverConnect();
    },
    serverConnect() {
      if (this.socket.readyState === WebSocket.OPEN) {
        this.socket.send(JSON.stringify(this.serverForm.formData));
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
      this.$axios.get("/webSocketCaptcha").then(resp => {
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
              this.serverForm.btnLoading = false;
              if (data.code === 0) {
                this.serverLoginDialogVisible = false;
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
