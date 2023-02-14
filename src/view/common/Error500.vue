<template>
  <div class="error-warp">
    <div class="main-agileits">
      <h1>Error Page</h1>
      <!-- content -->
      <div class="mainw3-agileinfo form">
        <div class="agileits-subscribe">
          <div class="subscribe-w3lsbottom">
            <h6>Oops! Something wrong</h6>
            <h2 style="display: inline;">500</h2>
            <p class="page-agilemk" style="display: inline;">Internal Server Error</p>
          </div>
          <div class="clear"></div>
        </div>
      </div>
    </div>

    <!-- ok -->
    <div class="main vlcone mfp-hide" id="small-dialog1">
      <div class="w3ls-form">
        <input type="text" placeholder="查询原因" v-model="search" autocomplete="off" @keyup.enter="searchByBaidu">
        <input type="button" @click="searchByBaidu" value="搜索"/>
      </div>
    </div>
  </div>
</template>

<script>
import "@/assets/css/error.css"

export default {
  name: "Error500",
  data() {
    return {
      search: ""
    };
  },
  methods: {
    searchByBaidu() {
      if (this.search.trim().length === 0) return;
      window.location.href = `https://www.baidu.com/s?ie=UTF-8&wd=${this.search}`;
    }
  },
  beforeCreate() {
    document.querySelector("body").classList.add("body-background");
  },
  beforeDestroy() {
    document.querySelector("body").classList.remove("body-background");
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>

</style>
