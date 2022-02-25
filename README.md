# vue-element

## Project setup
```
yarn install
```

### Compiles and hot-reloads for development
```
yarn serve
```

### Compiles and minifies for production
```
yarn build
```

### Lints and fixes files
```
yarn lint
```

### Customize configuration
See [Configuration Reference](https://cli.vuejs.org/config/).


## 修改 element-ui 中的某些内容
2. key 解释
```text
"main" 打包或运行时导入的 js
    修改：为 a.el-upload-list__item-name 元素添加 id 为 file.uid
"style" 打包或运行时导入的 css
"model" 使用 import 导入的文件（文件中无）
```
