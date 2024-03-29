<template>
  <div>
    <search-form
        v-if="formOptions"
        ref="searchForm"
        :forms="formOptions.forms"
        :size="formOptions.size"
        :fuzzy="formOptions.fuzzy"
        :inline="formOptions.inline"
        :label-width="formOptions.labelWidth"
        :item-width="formOptions.itemWidth"
        :submit-handler="searchHandler"
        :submit-loading="loading"
        :showResetBtn="formOptions.showResetBtn"
        :submitBtnText="formOptions.submitBtnText"
        :resetBtnText="formOptions.resetBtnText"
        :resetBtnCallback="formOptions.resetBtnCallback"/>

    <slot name="form" :loading="loading" :search="searchHandler"/>

    <slot/>

    <div class="page-button-group" style="float: right; margin-bottom: 20px;" v-if="toolbarOptions !== undefined">
      <el-popover
          v-if="toolbarOptions.cols === true || toolbarOptions.all === true "
          placement="bottom-end"
          @hide="handleColHide"
          trigger="click">
        <el-checkbox-group v-model="colSelections" style="display: grid; text-align: left">
          <el-checkbox v-for="(item, i) in columns"
                       :key="i"
                       :label="i"
                       v-show="item.prop !== undefined">
            {{ item.label }}
          </el-checkbox>
        </el-checkbox-group>
        <el-button type="primary" :size="toolbarOptions.size || 'mini'" plain icon="el-icon-menu"
                   slot="reference"></el-button>
      </el-popover>

      <el-popover
          v-if="toolbarOptions.export === true || toolbarOptions.all === true"
          placement="bottom-end"
          trigger="click">
        <div style="text-align: left; margin-left: 10px;">
          <el-link :underline="false" @click="exportExcel('csv')">导出为 csv</el-link>
          <br>
          <el-link :underline="false" @click="exportExcel('xls')">导出为 xls</el-link>
          <br>
          <el-link :underline="false" @click="exportExcel('xlsx')">导出为 xlsx</el-link>
        </div>
        <el-button type="primary" :size="toolbarOptions.size || 'mini'" plain icon="el-icon-folder-opened"
                   slot="reference"></el-button>
      </el-popover>

      <span v-if="toolbarOptions.print === true || toolbarOptions.all === true">
        <el-button type="primary" :size="toolbarOptions.size || 'mini'" plain icon="el-icon-printer"
                   v-print="printer"></el-button>
      </span>
    </div>

    <el-table v-loading.lock="loading"
              id="el-page-table-print"
              ref="table"
              :data="tableData"
              :border="border"
              :size="size"
              :stripe="stripe"
              :height="height"
              :max-height="maxHeight"
              :fit="fit"
              :show-header="showHeader"
              :highlight-current-row="highlightCurrentRow"
              :current-row-key="currentRowKey"
              :row-class-name="rowClassName"
              :row-style="rowStyle"
              :row-key="rowKey"
              :empty-text="emptyText"
              :default-expand-all="defaultExpandAll"
              :expand-row-keys="expandRowKeys"
              :default-sort="defaultSort"
              :tooltip-effect="tooltipEffect"
              :show-summary="showSummary"
              :sum-text="sumText"
              :summary-method="summaryMethod"
              :style="tableStyle"
              @select="(selection, row) => emitEventHandler('select', selection, row)"
              @select-all="selection => emitEventHandler('select-all', selection)"
              @selection-change="selection => emitEventHandler('selection-change', selection)"
              @cell-mouse-enter="(row, column, cell, event) => emitEventHandler('cell-mouse-enter', row, column, cell, event)"
              @cell-mouse-leave="(row, column, cell, event) => emitEventHandler('cell-mouse-leave', row, column, cell, event)"
              @cell-click="(row, column, cell, event) => emitEventHandler('cell-click', row, column, cell, event)"
              @cell-dblclick="(row, column, cell, event) => emitEventHandler('cell-dblclick', row, column, cell, event)"
              @row-click="(row, event, column) => emitEventHandler('row-click', row, event, column)"
              @row-dblclick="(row, event) => emitEventHandler('row-dblclick', row, event)"
              @row-contextmenu="(row, event) => emitEventHandler('row-contextmenu', row, event)"
              @header-click="(column, event) => emitEventHandler('header-click', column, event)"
              @sort-change="args => emitEventHandler('sort-change', args)"
              @filter-change="filters => emitEventHandler('filter-change', filters)"
              @current-change="(currentRow, oldCurrentRow) => emitEventHandler('current-change', currentRow, oldCurrentRow)"
              @header-dragend="(newWidth, oldWidth, column, event) => emitEventHandler('header-dragend', newWidth, oldWidth, column, event)"
              @expand-change="(row, expanded) => emitEventHandler('expand-change', row, expanded)">

      <slot name="prepend"/>

      <template v-for="(column, columnIndex) in tableColumns">
        <el-table-column
            :key="columnIndex"
            :column-key="column.columnKey"
            :prop="column.prop"
            :label="column.label"
            :width="column.minWidth ? '-' : (column.width || 140)"
            :minWidth="column.minWidth || column.width || 140"
            :fixed="column.fixed"
            :render-header="column.renderHeader"
            :sortable="column.sortable"
            :sort-by="column.sortBy"
            :sort-method="column.method"
            :resizable="column.resizable"
            :formatter="column.formatter"
            :show-overflow-tooltip="column.showOverflowTooltip"
            :align="column.align"
            :header-align="column.headerAlign || column.align"
            :class-name="column.className"
            :label-class-name="column.labelClassName"
            :selectable="column.selectable"
            :reserve-selection="column.reserveSelection"
            :filters="column.filters"
            :filter-placement="column.filterPlacement"
            :filter-multiple="column.filterMultiple"
            :filter-method="column.filterMethod"
            :filtered-value="column.filteredValue"
            v-show="column.show !== false"
            v-if="column.type === undefined">
          <template slot-scope="scope" :scope="newSlotScope ? 'scope' : false">
            <span v-if="column.filter">
              {{ Vue.filter(column['filter'])(scope.row[column.prop]) }}
            </span>
            <span v-else-if="column.slotName">
              <slot :name="column.slotName" :row="scope.row" :$index="scope.$index"/>
            </span>
            <span v-else-if="column.render">
              {{ column.render(scope.row) }}
            </span>
            <span v-else-if="column.formatter">
              {{ column.formatter(scope.row, scope.column, scope.row[column.prop], scope.$index) }}
            </span>
            <span v-else>
              {{ scope.row[column.prop] }}
            </span>
          </template>
        </el-table-column>
        <el-table-column v-bind="column" :key="columnIndex" v-show="column.show !== false"
                         v-else></el-table-column>
      </template>

      <slot name="append"/>
    </el-table>

    <div v-if="showPagination"
         style="margin-top: 10px;text-align: right;">
      <el-pagination
          @size-change="handleSizeChange"
          @current-change="handleCurrentChange"
          :current-page="pagination.pageIndex"
          :page-sizes="pageSizes"
          :page-size="pagination.pageSize"
          :layout="paginationLayout"
          :total="total">
      </el-pagination>
    </div>

    <el-table
        border
        id="el-page-table-export"
        ref="elPgeTableExport"
        v-show="false"
        :data="tableData"
        v-if="isExport">

      <template v-for="(column, columnIndex) in columns">
        <el-table-column
            :key="columnIndex"
            :column-key="column.columnKey"
            :prop="column.prop"
            :label="column.label"
            :width="column.minWidth ? '-' : (column.width || 140)"
            :minWidth="column.minWidth || column.width || 140"
            v-if="column.prop !== undefined">
          <template slot-scope="scope" :scope="newSlotScope ? 'scope' : false">
            <span v-if="column.filter">
              {{ Vue.filter(column['filter'])(scope.row[column.prop]) }}
            </span>
            <span v-else-if="column.slotName">
              <slot :name="column.slotName" :row="scope.row" :$index="scope.$index"/>
            </span>
            <span v-else-if="column.render">
              {{ column.render(scope.row) }}
            </span>
            <span v-else-if="column.formatter">
              {{ column.formatter(scope.row, scope.column, scope.row[column.prop], scope.$index) }}
            </span>
            <span v-else>
              {{ scope.row[column.prop] }}
            </span>
          </template>
        </el-table-column>
      </template>
    </el-table>

  </div>
</template>

<script>
import Vue from 'vue'
import searchForm from './ElSearchForm.vue'
import {saveAs} from 'file-saver';
import * as XLSX from 'xlsx';

export default {
  name: 'ElPageTable',
  components: {
    searchForm
  },
  props: {
    // Element UI Table attributes
    height: [String, Number],
    maxHeight: [String, Number],
    size: String,
    stripe: Boolean,
    border: Boolean,
    fit: {
      type: Boolean,
      default: true
    },
    showHeader: {
      type: Boolean,
      default: true
    },
    highlightCurrentRow: Boolean,
    currentRowKey: [String, Number],
    rowClassName: [String, Function],
    rowStyle: [String, Function],
    rowKey: [String, Function],
    emptyText: String,
    defaultExpandAll: Boolean,
    expandRowKeys: Array,
    defaultSort: Object,
    tooltipEffect: String,
    showSummary: Boolean,
    sumText: String,
    summaryMethod: Function,
    // custom attributes
    tableStyle: {
      type: String,
      default: "width:100%;margin-top:20px;",
    },
    fetch: {
      type: Function
    },
    url: {
      type: String
    },
    method: {
      type: String,
      default: 'get',
      validator: value => {
        const methodTypes = ['get', 'post', 'put', 'delete'];
        return methodTypes.indexOf(value.toLowerCase()) !== -1;
      }
    },
    headers: {
      type: Object,
      default: () => {
        return {}
      }
    },
    listField: {
      type: String,
      default: 'data.list'
    },
    totalField: {
      type: String,
      default: 'data.total'
    },
    params: {
      type: Object,
      default: () => {
        return {}
      }
    },
    formOptions: {
      type: Object
    },
    toolbarOptions: {
      type: Object
    },
    autoLoad: {
      type: Boolean,
      default: true
    },
    type: {
      type: String,
      default: 'remote',
      validator(value) {
        const types = ['remote', 'local']
        const validType = types.indexOf(value) !== -1
        if (!validType) {
          throw new Error(`Invalid type of '${value}', please set one type of 'remote' or 'local'.`)
        }
        return validType
      }
    },
    data: {
      type: Array
    },
    dataHandler: {
      type: Function
    },
    columns: {
      type: Array,
      required: true
    },
    showPagination: {
      type: Boolean,
      default: true
    },
    pageSizes: {
      type: Array,
      default: () => {
        return [10, 20, 50]
      }
    },
    paginationLayout: {
      type: String,
      default: 'total, prev, pager, next, jumper, sizes'
    },
    pageIndexKey: {
      type: String,
      default: 'pageIndex'
    },
    pageSizeKey: {
      type: String,
      default: 'pageSize'
    }
  },
  data() {
    const _this = this
    return {
      Vue,
      pagination: {
        pageIndex: 1,
        pageSize: (() => {
          const {pageSizes} = _this
          if (pageSizes.length > 0) {
            return pageSizes[0]
          }
          return 20
        })()
      },
      total: 0,
      loading: false,
      tableData: [],
      cacheLocalData: [],
      colSelections: [],
      tableColumns: undefined,
      isExport: false,
      printer: {
        id: '#el-page-table-print',
        popTitle: document.title
      }
    }
  },
  computed: {
    newSlotScope() {
      return Number(Vue.version.replace(/\./g, '')) >= 250
    }
  },
  methods: {
    handleSizeChange(size) {
      this.pagination.pageSize = size
      this.dataChangeHandler()
    },
    handleCurrentChange(pageIndex) {
      this.pagination.pageIndex = pageIndex
      this.dataChangeHandler()
    },
    searchHandler(resetPageIndex = true) {
      if (resetPageIndex) {
        this.pagination.pageIndex = 1
      }
      this.dataChangeHandler(arguments[0])
    },
    dataChangeHandler() {
      const {type} = this
      if (type === 'local') {
        this.dataFilterHandler(arguments[0])
      } else if (type === 'remote') {
        this.fetchHandler(arguments[0])
      }
    },
    dataFilter(data) {
      const {pageIndex, pageSize} = this.pagination
      return data.filter((v, i) => {
        return i >= (pageIndex - 1) * pageSize && i < pageIndex * pageSize
      })
    },
    dataFilterHandler(formParams) {
      const {cacheLocalData, params, pagination} = this
      const {pageIndex, pageSize} = pagination
      const mergeParams = Object.assign(params, formParams)
      const validParamKeys = Object.keys(mergeParams).filter(v => {
        return mergeParams[v] !== undefined && mergeParams[v] !== ''
      })
      const searchForm = this.$refs['searchForm']
      let paramFuzzy
      if (searchForm) {
        paramFuzzy = searchForm.getParamFuzzy()
      }

      if (validParamKeys.length > 0) {
        const validData = cacheLocalData.filter(v => {
          let valids = []
          validParamKeys.forEach(vv => {
            if (typeof v[vv] === 'number') {
              valids.push(
                  paramFuzzy && paramFuzzy[vv] ? (String(v[vv]).indexOf(String(mergeParams[vv])) !== -1)
                      : (String(v[vv]) === String(mergeParams[vv]))
              )
            } else {
              valids.push(
                  paramFuzzy && paramFuzzy[vv] ? (v[vv].indexOf(mergeParams[vv]) !== -1) : (v[vv] === mergeParams[vv])
              )
            }
          })
          return valids.every(vvv => {
            return vvv
          })
        })

        this.tableData = this.dataFilter(validData)
        this.total = validData.length
      } else {
        this.total = cacheLocalData.length
        this.tableData = this.dataFilter(cacheLocalData)
      }
    },
    fetchHandler(formParams = {}) {
      this.loading = true
      let {
        fetch, method, url, $axios, headers,
        listField, pageIndexKey, pageSizeKey,
        totalField, params, showPagination,
        pagination
      } = this

      params = JSON.parse(JSON.stringify(Object.assign(params, formParams)))

      if (showPagination) {
        params = Object.assign(params, {
          [pageIndexKey]: pagination.pageIndex,
          [pageSizeKey]: pagination.pageSize
        })
      }

      let requestObject = null

      if (fetch) {
        requestObject = fetch(params)
      } else {
        $axios.interceptors.request.use(
            config => {
              Object.keys(headers).forEach(v => {
                config.headers[v] = headers[v]
              })
              return config;
            },
            error => {
              return Promise.reject(error);
            }
        )

        method = method.toLowerCase();

        if (method === 'get') {
          requestObject = $axios[method](url, {params})
        } else {
          requestObject = $axios[method](url, params)
        }
      }

      requestObject.then(response => {
        let result = response

        if (response && !(response instanceof Array)) {
          if (listField && listField.indexOf('.') !== -1) {
            listField.split('.').forEach(vv => {
              result = result[vv]
            })
          } else {
            result = response[listField]
          }
        }

        if (!result || !(result instanceof Array)) {
          throw new Error(`The result of key:${listField} is not Array.`)
        }

        if (this.dataHandler) {
          this.tableData = result.map(this.dataHandler)
        } else {
          this.tableData = result
        }

        let totalValue = response
        if (Object.prototype.toString.call(response) === '[object Array]') {
          totalValue = response.length
        } else if (typeof response === 'object') {
          if (totalField && totalField.indexOf('.') !== -1) {
            totalField.split('.').forEach(vv => {
              totalValue = totalValue[vv]
            })
          } else {
            totalValue = response[totalField]
          }
        } else {
          totalValue = 0
        }
        this.total = totalValue

        this.loading = false
      }).catch(error => {
        // console.error('Get remote data failed. ', error)
        this.loading = false
      })
    },
    emitEventHandler(event) {
      this.$emit(event, ...Array.from(arguments).slice(1))
    },
    loadLocalData(data) {
      const {autoLoad} = this
      if (!data) {
        throw new Error(`When the type is 'local', you must set attribute 'data' and 'data' must be a array.`)
      }
      const cacheData = JSON.parse(JSON.stringify(data))
      this.cacheLocalData = cacheData
      if (autoLoad) {
        this.tableData = this.dataFilter(cacheData)
        this.total = cacheData.length
      }
    },
    handleColHide() {
      const set = new Set(this.colSelections);
      this.tableColumns = this.columns.filter((_, index) => {
        return set.has(index);
      });
    },
    exportExcel(type) {
      // 关闭弹窗
      document.body.click();
      this.isExport = true;
      setTimeout(() => {
        type = type || "csv"
        const wb = XLSX.utils.table_to_book(document.querySelector("#el-page-table-export"));
        /* 获取二进制字符串作为输出 */
        const wbOut = XLSX.write(wb, {
          bookType: type,
          bookSST: true,
          type: "array",
          align: 'center',
          valign: 'vcenter',
        });
        try {
          saveAs(
              new Blob([wbOut], {type: "application/octet-stream"}),
              `${document.title}.${type}`
          );
          // eslint-disable-next-line no-empty
        } catch (ignored) {
          console.error('Failed to Export: ', ignored)
        }
        this.isExport = false;
      }, 2000);
    }
  },
  mounted() {
    // event: expand changed to `expand-change` in Element v2.x
    this.$refs['table'].$on('expand', (row, expanded) => this.emitEventHandler('expand', row, expanded))
    const {type, autoLoad, data, formOptions, params} = this
    if (type === 'remote' && autoLoad) {
      if (formOptions) {
        this.$refs['searchForm'].getParams((error, formParams) => {
          if (!error) {
            this.fetchHandler(Object.assign(formParams, params))
          }
        })
      } else {
        this.fetchHandler(params)
      }
    } else if (type === 'local') {
      this.loadLocalData(data)
    }
    this.columns.forEach((val, index) => {
      this.colSelections.push(index);
    });
  },
  watch: {
    data: function (value) {
      this.loadLocalData(value)
    },
    columns: {
      handler(newVal) {
        this.tableColumns = newVal;
      },
      deep: true,
      immediate: true
    }
  }
}
</script>
<style scoped>
.page-button-group {
  display: inline-block;
  vertical-align: middle;
}

.page-button-group::after, .page-button-group::before {
  display: table;
  content: ""
}

.page-button-group::after {
  clear: both
}

.page-button-group .el-button {
  float: left;
  position: relative;

}

.page-button-group > :not(:first-child):not(:last-child) .el-button {
  border-radius: 0;
  border-left-color: hsla(0, 0%, 100%, .5);
  border-right-color: hsla(0, 0%, 100%, .5);
}

.page-button-group > :first-child .el-button {
  border-right-color: rgba(255, 255, 255, .5);
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
}

.page-button-group > :last-child .el-button {
  border-left-color: rgba(255, 255, 255, .5);
  border-top-left-radius: 0;
  border-bottom-left-radius: 0;
}
</style>
