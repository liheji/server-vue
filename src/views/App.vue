<template>
  <div id="app">
    <el-container>
      <el-main>
        <router-view></router-view>
      </el-main>
      <el-footer>
        <div>
          <p>
            <span>{{ date }}&nbsp;©&nbsp;</span>
            <el-link href="https://yilee.top" target="_blank" rel="noopener noreferrer">憶夣</el-link>
            <svg viewBox="0 0 1024 1024" xmlns="http://www.w3.org/2000/svg" width="20" height="20"
                 style="vertical-align: middle;margin: 0 3px 0 3px">
              <path
                  d="M778.24 163.84c-76.8-40.96-165.888-61.44-269.312-61.44s-192.512 20.48-269.312 61.44h-133.12l23.552 337.92c8.192 113.664 67.584 217.088 162.816 280.576l215.04 144.384 215.04-144.384c96.256-63.488 155.648-166.912 163.84-280.576l23.552-337.92H778.24z m47.104 333.824c-7.168 94.208-56.32 181.248-135.168 233.472l-181.248 120.832L327.68 731.136c-78.848-53.248-129.024-139.264-135.168-233.472L173.056 225.28h136.192v-26.624c58.368-23.552 124.928-34.816 199.68-34.816s141.312 12.288 199.68 34.816V225.28H844.8l-19.456 272.384z"
                  fill="#409eff"></path>
              <path
                  d="M685.056 328.704v-46.08H455.68c2.048-4.096 6.144-9.216 11.264-15.36 5.12-7.168 9.216-12.288 11.264-15.36L419.84 240.64c-31.744 46.08-75.776 87.04-133.12 123.904 4.096 4.096 10.24 11.264 18.432 21.504l17.408 17.408c23.552-15.36 45.056-31.744 63.488-50.176 26.624 25.6 49.152 43.008 67.584 51.2-46.08 15.36-104.448 27.648-175.104 35.84 2.048 5.12 6.144 13.312 9.216 24.576 4.096 11.264 6.144 19.456 7.168 24.576l39.936-7.168v218.112H389.12V680.96h238.592v19.456h54.272V481.28H348.16c60.416-12.288 114.688-27.648 163.84-46.08 49.152 19.456 118.784 34.816 210.944 46.08 5.12-17.408 10.24-34.816 17.408-51.2-62.464-4.096-116.736-12.288-161.792-24.576 38.912-20.48 74.752-46.08 106.496-76.8z m-150.528 194.56h94.208v41.984h-94.208v-41.984z m0 78.848h94.208v41.984h-94.208v-41.984z m-144.384-78.848h94.208v41.984H390.144v-41.984z m0 78.848h94.208v41.984H390.144v-41.984zM424.96 326.656h182.272c-26.624 22.528-57.344 41.984-94.208 57.344-31.744-15.36-61.44-34.816-88.064-57.344z"
                  fill="#409eff"></path>
            </svg>
            <el-link href="https://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer">蜀ICP备20005689号-3</el-link>
            |
            <svg viewBox="0 0 62 67" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="20" height="20"
                 style="vertical-align: middle;margin: 0 3px 0 3px">
              <image x="0" y="0" width="62" height="67"
                     xlink:href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAD4AAABDCAMAAADzo0ZpAAAAIGNIUk0AAHomAACAhAAA+gAAAIDo AAB1MAAA6mAAADqYAAAXcJy6UTwAAAL9UExURUdwTLKTUcioWOHIbNOvV8OkVdWyWNmpTNufQtiu VNOoTcSkUuSzUtqpTM2jTZt5PriDOd29XMyaSdO2Xt6oR9CdR92oTNiiRdenSMy0X+OtT9agRtm0 V9quVdGhSb+LO8yVQdGZQMKOPcyfStzMd+K4VOLEc9CYR9+4WM2UP82TPe3JXsmTP6d2NcyKOr2C NuCwVui1UOzDVsKOPO/XgPDXbJ51OtifQMiINdaaRNiaPLV2MmdKMSkoMTU5OHpSL8iMO92fQM+N NJJRJEMzMA8fNwIeQwEgUAUhSgMcOhspOKl3OuGpRb5/NAIjXAEeS0dEO5l0PNSaPuiuRt6sS5lj MFAxMggkUCY6V0JMWE9UVmVgVl1fWgYkVHJiRr2IPDNDWXRwW7WXUcGQQ8+VPtOeStKiScmgTryg WqmHRNmiQt2RQgEgVZGCWs6rWeG1TtOVO92sR9CYQdmwUpeLYQMjVwgmW9+wTNuuTdesUteqTNan SdWfQNikRt66V920UOW1TdCkUjM9TRcwWIh9WtSiRNWNPM6HM+e5UQ8pVtupR89uL89HI8ovG88b E8o7IOK/VqmQU+G5U9YJDtoKDt6GS9tuOdAOD8ghFcJrKuLAXZ6HVQclVotyRc1VKNYOENYQEdcj F9k7I+PIhNcvHtsPEBswUeWqZOLBaPftnuDDdNcVEd+xUN20Xdu0Vt+7bNiFOtthOWZaP+CkQdMP ENyoUdmtWdYaE9pNK+KVV9IpGpF5S+GhVNF5Nd24ZtVkL9ymRNx7QtVZLeXDX964d9CeRO3KXH5y U+nTgdigTdF+POvCWOvObObKbtx4M+a9V+vSc66cf+nHZeGvSPPadNSoUOvekOCYRuK0VlhQPeK3 XfDRY8iXSLp7OPHdhcuSPdWUN8oREAoYMbFCLcF+MD0ZK+SwUKESFxMYL3cYJsQOD8h+LbIRFSkh RogQFmUTHM+SOCgXKKMzJU0TIdevYQEYMwITMr53LcSFNbhwKKdjJ7FrKaZXH4gzFP///xvGvwYA AAA3dFJOUwAOTrSiLn7J+rRjF+fhjwYehm485oP37Ngi+rxx3KZY/uBA7VybzP3Nu8vrnWPghP3v 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"/>
            </svg>
            <el-link href="https://beian.mps.gov.cn/" target="_blank" rel="noopener noreferrer">川公网安备51152902000032号</el-link>
          </p>
        </div>
      </el-footer>
    </el-container>
  </div>
</template>

<script>
export default {
  name: "App",
  data() {
    return {
      date: new Date().getFullYear()
    }
  }
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
  bottom: 0;
  width: 99%;
  margin-bottom: 10px;
  text-align: center;
}

#app footer .el-link {
  vertical-align: unset !important;
  font-size: unset !important;
}
</style>
