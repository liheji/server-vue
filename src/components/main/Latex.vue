<template>
  <div class="latex-wrap" v-if="hasAuthority('use_latex_account')">
    <el-row>
      <div class="el-upload__text" style="margin-top: 10px">将图片<em>拖拽</em>、<em>粘贴</em>到下方，或<em>点击下方</em>选择图片</div>
      <el-upload
          ref="latex"
          :action="GetLatexAction"
          :drag="true"
          :multiple="false"
          style="width: 100%"
          accept="image/jpg,image/png"
          :http-request="latexHttpRequest"
          :on-progress="handleLatexProgress"
          :on-success="handleLatexSuccess"
          :on-error="handleLatexError"
          :before-upload="handLatexBeforeUpload"
          :auto-upload="true"
          :show-file-list="false">
        <i class="el-icon-upload"></i>
        <div class="el-upload__text" style="margin-top: 10px">将图片<em>拖拽</em>、<em>粘贴</em>到此处，或<em>点击</em>选择图片</div>
        <div style="height: 100%;width: 100%;position: absolute;left: 0;top: 0;">
          <el-image style="height: 100%;width: auto" @click.stop.once
                    v-show="imagePreviewUrl.trim() !== ''"
                    :src="imagePreviewUrl"
                    :preview-src-list="[imagePreviewUrl]">
          </el-image>
        </div>
      </el-upload>
    </el-row>
    <el-row>
      <el-form style="margin-top: 22px">
        <el-form-item>
          <div>Latex公式
            <el-tooltip placement="top">
              <div slot="content">
                复制账户代码后<br/>
                可以在 LatexLive 官网的控制台执行<br/>
                刷新即可使用当前账号登录<br/>
                官网：https://latexlive.com<br/>
              </div>
              <el-button type="primary" size="mini" icon="el-icon-question" style="margin-left: 10px"
                         @click="copyCommand">
                复制账户代码
              </el-button>
            </el-tooltip>
          </div>
          <el-input type="textarea" v-model="latexResult"
                    placeholder="请输入Latex公式" maxlength="16384" resize="none" rows="8">
          </el-input>
        </el-form-item>

        <el-form-item>
          <div>Latex公式预览</div>
          <div style="border: 1px solid #DCDFE6;border-radius: 4px;height: 340px">
            <div class="latex-preview">
              <div id="latex-view" v-html="latexPreview" style="overflow: auto;height:280px"></div>
            </div>
            <div class="latex-operate">
              <el-button type="primary" size="medium" icon="el-icon-document-copy" @click="copyLatexSvg">
                复制SVG
              </el-button>
            </div>
          </div>
        </el-form-item>
      </el-form>
    </el-row>

    <el-dialog
        style=""
        :visible="process.dealVisible"
        title="任务进度"
        top="25%"
        width="250px"
        :show-close="false"
        :close-on-click-modal="false"
        :close-on-press-escap="false">
      <div style="margin-top: -10px;">
        <el-progress :text-inside="true"
                     :stroke-width="20"
                     :percentage="process.percentage"
                     :color="process.percentage === 100 ? '#67C23A' : '#409EFF'">
        </el-progress>
        <p v-show="process.percentage === 100">
          <i class="el-icon-loading"></i>&nbsp;处理中...
        </p>
      </div>
    </el-dialog>
  </div>
</template>
<script>
import axios from "axios"


import {copyText} from "@/util";

const axiosJson = axios.create({
  method: "post",
  headers: {'Content-Type': 'application/json;charset=utf-8'}
});

export default {
  name: "Latex",
  data() {
    return {
      process: {
        dealVisible: false,
        percentage: 0,
      },
      loginByAccountForm: {
        loginname: "",
        password: ""
      },
      getLatexForm: {
        mytoken: "",
        src: ""
      },
      latexResult: "",
      imagePreviewUrl: "",
      LoginByAccountAction: "https://www.latexlive.com:5002/api/Client/LoginByAccount",
      GetLatexAction: "https://www.latexlive.com:5002/api/Mathpix/GetLaTexFromMathPix",
    };
  },
  computed: {
    latexPreview() {
      if (this.latexResult === undefined || this.latexResult.trim() === "") {
        return "";
      }

      return "$$\n" + this.latexResult.replace(/\$/g, "").trim() + "\n$$";
    }
  },
  methods: {
    latexHttpRequest(option) {
      this.process.percentage = 0;
      this.process.dealVisible = true;

      const fileReader = new FileReader()
      fileReader.onload = () => {
        this.getLatexForm.src = fileReader.result
        if (this.loginByAccountForm.loginname === "" || this.loginByAccountForm.password === "") {
          this.baseGetAccount(() => {
            this.baseGetLatex(option)
          }, option.onError);
        } else {
          this.baseGetLatex(option)
        }
      }
      fileReader.readAsDataURL(option.file);
    },
    handleLatexProgress(event, file) {
      this.process.percentage = Math.floor((event.loaded * 100 / event.total));
    },
    handleLatexSuccess(resp, file) {
      if (resp.result === 0) {
        const info = JSON.parse(resp.detail.info)
        if (info.latex_styled && info.latex_styled.trim() !== "") {
          this.latexResult = info.latex_styled
        } else {
          this.latexResult = info.text
              .replace(/\\\(/g, "$")
              .replace(/\\\)/g, "$")
              .replace(/\\\[/g, "$$")
              .replace(/\\\]/g, "$$")
              .trim();
        }
      } else {
        this.$message({
          message: resp.detail.errinfo,
          type: "warning"
        });
      }
      this.process.dealVisible = false;
    },
    handleLatexError(err, file) {
      this.$message({
        message: err.toString(),
        type: "error"
      });
      this.process.dealVisible = false;
    },
    handLatexBeforeUpload(file) {
      try {
        file.url = window.URL.createObjectURL(file);
      } catch (err) {
        console.error('[Element Error][Upload]', err);
        return;
      }
      this.imagePreviewUrl = file.url;
    },
    baseGetLatex(option) {
      axiosJson({
        url: option.action,
        data: this.getLatexForm,
        onUploadProgress: (event) => {
          option.onProgress(event, option.rawFile)
        }
      }).then(({data}) => {
        // 更新原 Token
        this.getLatexForm.mytoken = data.detail.token
        if (data.result === 1) {
          this.baseGetAccount(() => {
            this.baseGetLatex(option)
          }, option.onError);
        } else {
          option.onSuccess(data, option.rawFile)
        }
      }).catch(err => {
        option.onError(err, option.rawFile)
      })
    },
    baseLoginByAccount(success, error) {
      axiosJson({
        url: this.LoginByAccountAction,
        data: this.loginByAccountForm,
      }).then(({data}) => {
        if (data.result === 0) {
          this.getLatexForm.mytoken = data.detail.token;
          success()
        } else {
          // 退出登录
          this.basePostAccount();
          this.loginByAccountForm.loginname = ""
          this.loginByAccountForm.password = ""
          error(data.detail.errinfo);
        }
      }).catch(err => {
        error(err);
      })
    },
    baseGetAccount(success, error) {
      // 退出登录
      this.basePostAccount();
      this.$axios.get("/latex").then(({data}) => {
        if (data.code === 0) {
          // 更新账号信息
          this.loginByAccountForm.loginname = data.account.username;
          this.loginByAccountForm.password = data.account.password;
          this.baseLoginByAccount(success, error)
        } else {
          error(data.msg);
        }
      }).catch(err => {
        error(err);
      })
    },
    basePostAccount() {
      if (this.loginByAccountForm.loginname !== "" && this.loginByAccountForm.password !== "") {
        this.$sync({
          url: "/latex",
          method: "post",
          data: {"username": this.loginByAccountForm.loginname}
        }).then(_ => {
          this.loginByAccountForm.loginname = "";
          this.loginByAccountForm.password = "";
        }).catch(_ => {
          console.log("Post Account Fail!")
        })
      }
    },
    copyLatexSvg() {
      if (this.latexResult === undefined || this.latexResult.trim() === "") {
        this.$message({
          message: "未检测到公式",
          type: "warning"
        });
        return
      }
      if (window.MathJax && navigator.clipboard) {
        const tex = this.latexResult.trim();
        navigator.clipboard.writeText(window.MathJax.tex2svg(tex, {}).firstElementChild.outerHTML);
        this.$message({
          message: "复制成功",
          type: "success"
        });
      } else {
        this.$message({
          message: "浏览器不支持",
          type: "warning"
        });
      }
    },
    copyCommand() {
      if (this.getLatexForm.mytoken === undefined || this.getLatexForm.mytoken.trim() === "") {
        this.$message({
          message: "未登录账号",
          type: "warning"
        });
        return
      }

      navigator.clipboard.writeText(`localStorage.setItem('mytoken', '${this.getLatexForm.mytoken}')`);
      this.$message({
        message: "复制成功",
        type: "success"
      });
    }
  },
  mounted() {
    // 加载 MathJax
    if (window.MathJax === undefined) {
      var script = document.createElement('script');
      script.src = 'https://cdn.lhjjjlxays.top/npm/mathjax@3/es5/tex-svg.js';
      script.async = true;
      document.head.appendChild(script);
    }
    // 粘贴板事件
    document.body.onpaste = (event) => {
      if (!(event.clipboardData && event.clipboardData.items)) return
      const items = event.clipboardData.items
      if (items.length <= 0) return

      var file = null;
      if (items[0].type.indexOf('image') !== -1) {
        // 是图片
        file = items[0].getAsFile()
      }

      // 获取文件失败
      if (file == null) return
      this.$refs.latex.handleStart(file);
      this.$refs.latex.submit();
    }
  },
  updated() {
    // 重新渲染 Latex
    this.$formula(document.getElementById("latex-view"))
  },
  beforeDestroy() {
    document.body.onpaste = null;
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.latex-wrap {
  margin-top: 22px;
}

.latex-wrap .el-upload {
  display: unset;
}

.latex-wrap .el-upload-dragger {
  width: 100%;
}

.latex-wrap textarea {
  font-family: Monaco, "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace;
  font-weight: 30;
  font-size: 1.1rem;
}

.latex-wrap .latex-preview {
  width: 100%;
  height: 280px;
  font-family: Monaco, "Lucida Console", "Liberation Mono", "DejaVu Sans Mono", "Bitstream Vera Sans Mono", "Courier New", monospace;
  font-weight: 30;
  font-size: 2.2rem;
  overflow-y: auto;
}

.latex-wrap .latex-operate {
  margin: 10px 10px 10px 0;
  float: right;
}

.latex-wrap .el-upload__text {
  line-height: 40px;
  position: relative;
  font-size: 14px;
}

.latex-wrap .el-upload__text em {
  color: #409eff;
  font-style: normal;
}
</style>
