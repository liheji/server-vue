<template>
  <div id="app">
    <el-container>
      <el-main>
        <router-view></router-view>
      </el-main>
      <el-footer>
        <div>
          <p>Copyright 2021 - 互联网ICP备案：
            <a href="https://beian.miit.gov.cn/" target="_blank">蜀ICP备20005689号</a>
          </p>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "App"
}
</script>

<style>
html, body, #app, .el-container {
  /*外部间距也是如此设置*/
  margin: 0;
  /*设置内部填充为0，几个布局元素之间没有间距*/
  padding: 0;
  /*统一设置高度为100%*/
  height: 100%;
}

#app footer {
  /*position: absolute;*/
  bottom: 0;
  width: 99%;
  margin-bottom: 10px;
  text-align: center;
}

#app footer a, p {
  color: #000000;
}

#app footer a:hover {
  color: #C4A648 !important;
}

#app footer a:link, a:visited, a:hover, a:active {
  text-decoration: none;
}
</style>
