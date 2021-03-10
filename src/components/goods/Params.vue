<template>
    <div>
      <!-- 面包屑导航区域 -->
      <el-breadcrumb separator-class="el-icon-arrow-right">
        <el-breadcrumb-item :to="{ path: '/home' }">首页</el-breadcrumb-item>
        <el-breadcrumb-item>商品管理</el-breadcrumb-item>
        <el-breadcrumb-item>参数列表</el-breadcrumb-item>
      </el-breadcrumb>
      <!-- 卡片视图区域 -->
      <el-card>
        <el-alert title="注意：只允许为第三季分类设置相关参数！" type="warning" show-icon :closable="false"></el-alert>
        <el-row class="cat_opt">
          <el-col>
            <span>选择商品分类：</span>
            <el-cascader
              v-model="selectedCateKeys"
              :options="catelist"
              :props="cateProps"
              @change="handleChange"
              style="margin-left: 5px">
            </el-cascader>
          </el-col>
        </el-row>
        <el-tabs v-model="activeName" @tab-click="handleTableClick">
          <el-tab-pane label="动态参数" name="many">
            <el-button type="primary" size="mini" :disabled="selectedCateKeys.length !== 3" @click="addDialogVisible = true">添加参数</el-button>
            <el-table :data="manyTableData" stripe border>
              <el-table-column type="expand">
                <template v-slot:default="slotProps">
                  <el-tag :key="i" v-for="(item, i) in slotProps.row.attr_vals" closable @close="handleClose(i, slotProps.row)">{{item}}</el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="slotProps.row.inputVisible"
                    v-model="slotProps.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(slotProps.row)"
                    @blur="handleInputConfirm(slotProps.row)">
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(slotProps.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="参数名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template v-slot:default="slotProps">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(slotProps.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(slotProps.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
          <el-tab-pane label="静态属性" name="only">
            <el-button type="primary" size="mini" :disabled="selectedCateKeys.length !== 3" @click="addDialogVisible = true">添加属性</el-button>
            <el-table :data="onlyTableData" stripe border>
              <el-table-column type="expand">
                <template v-slot:default="slotProps">
                  <el-tag :key="i" v-for="(item, i) in slotProps.row.attr_vals" closable @close="handleClose(i, slotProps.row)">{{item}}</el-tag>
                  <el-input
                    class="input-new-tag"
                    v-if="slotProps.row.inputVisible"
                    v-model="slotProps.row.inputValue"
                    ref="saveTagInput"
                    size="small"
                    @keyup.enter.native="handleInputConfirm(slotProps.row)"
                    @blur="handleInputConfirm(slotProps.row)">
                  </el-input>
                  <el-button v-else class="button-new-tag" size="small" @click="showInput(slotProps.row)">+ New Tag</el-button>
                </template>
              </el-table-column>
              <el-table-column type="index"></el-table-column>
              <el-table-column label="属性名称" prop="attr_name"></el-table-column>
              <el-table-column label="操作">
                <template v-slot:default="slotProps">
                  <el-button type="primary" icon="el-icon-edit" size="mini" @click="showEditDialog(slotProps.row.attr_id)">编辑</el-button>
                  <el-button type="danger" icon="el-icon-delete" size="mini" @click="removeParams(slotProps.row.attr_id)">删除</el-button>
                </template>
              </el-table-column>
            </el-table>
          </el-tab-pane>
        </el-tabs>
      </el-card>
      <!-- 添加分类的对话框  -->
      <el-dialog
        :title="'添加' + titleText"
        :visible.sync="addDialogVisible"
        width="50%"
        @close="addDialogClosed">
        <el-form :model="addForm" :rules="addFormrules" ref="addFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="addForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="addParams">确 定</el-button>
        </span>
      </el-dialog>
      <!-- 修改分类的对话框  -->
      <el-dialog
        :title="'修改' + titleText"
        :visible.sync="editDialogVisible"
        width="50%"
        @close="editDialogClosed">
        <el-form :model="editForm" :rules="editFormrules" ref="editFormRef" label-width="100px">
          <el-form-item :label="titleText" prop="attr_name">
            <el-input v-model="editForm.attr_name"></el-input>
          </el-form-item>
        </el-form>
        <span slot="footer" class="dialog-footer">
          <el-button @click="addDialogVisible = false">取 消</el-button>
          <el-button type="primary" @click="editParams">确 定</el-button>
        </span>
      </el-dialog>
    </div>
</template>

<script>
export default {
  data() {
    return {
      //商品分类列表
      catelist: [],
      //级联选择框的配置对象
      cateProps: { 
        expandTrigger: 'hover',
        value: 'cat_id',
        label: 'cat_name',
        children: 'children'
      },
      //级联选择框双向绑定到的数组
      selectedCateKeys: [],
      //被激活的页签名
      activeName: 'many',
      manyTableData: [],
      onlyTableData: [],
      //添加对话框的显示与隐藏
      addDialogVisible: false,
      //添加参数的表单数据对象
      addForm: {
        attr_name: ''
      },
      //添加参数的验证规则对象
      addFormrules: {
        attr_name: [
          {required: true, message: '请输入参数', trigger: 'blur'}
        ]
      },
      editDialogVisible: false,
      editForm: {},
      editFormrules: {
        attr_name: [
          {required: true, message: '请输入参数', trigger: 'blur'}
        ]
      }
    }
  },
  created() {
    this.getCateList()
  },
  methods: {
    //获取所有的商品分类列表
    async getCateList() {
      const { data: res } = await this.$http.get('categories')
      if (res.meta.status !== 200) return this.$message.error('获取分类数据失败！')
      this.catelist = res.data
    },
    //级联选择框选中项变化触发的函数
    handleChange() {
      this.getParamsData()
    },
    handleTableClick() {
      this.getParamsData()
    },
    async getParamsData() {
      if (this.selectedCateKeys.length !== 3) {
        this.selectedCateKeys = []
        this.manyTableData = []
        this.onlyTableData = []
        return
      }
      //选中项发生变化获取参数
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes`, {params: {sel: this.activeName}})
      if (res.meta.status !== 200) return this.$message.error('获取参数列表失败！')
      
      res.data.forEach(item => {
        item.attr_vals = item.attr_vals ? item.attr_vals.split(' ') : []
        item.inputVisible = false
        item.inputValue = ''
      });
      
      if (this.activeName === 'many') this.manyTableData = res.data
      else this.onlyTableData = res.data
    },
    addDialogClosed() {
      this.$refs.addFormRef.resetFields()
    },
    addParams() {
      this.$refs.addFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.post(`categories/${this.cateId}/attributes`, {
          attr_name: this.addForm.attr_name,
          attr_sel: this.activeName
        })
        if (res.meta.status !== 201) return this.$message.error('添加参数失败！')
        this.$message.success('添加参数成功')
        this.getParamsData()
        this.addDialogVisible = false
      })
    },
    async showEditDialog(attr_id) {
      const {data: res} = await this.$http.get(`categories/${this.cateId}/attributes/${attr_id}`, {
        params: {attr_sel: this.activeName}
      })
      if (res.meta.status !== 200) return this.$message('获取参数信息失败！')
      this.editForm = res.data
      this.editDialogVisible = true
    },
    editDialogClosed() {
      this.$refs.editFormRef.resetFields()
    },
    editParams() {
      this.$refs.editFormRef.validate(async valid => {
        if (!valid) return
        const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${this.editForm.attr_id}`, 
        {attr_name: this.editForm.attr_name, attr_sel: this.activeName})
        if (res.meta.status !== 200) return this.$message.error('更改参数失败！')
        this.$message.success('更改参数成功！')
        this.getParamsData()
        this.editDialogVisible = false
      })     
    },
    async removeParams(attr_id) {
      const confirmResult = await this.$confirm('此操作将永久删除该参数, 是否继续?', '提示', {
          confirmButtonText: '确定',
          cancelButtonText: '取消',
          type: 'warning'
      }).catch(err => err)

      if (confirmResult !== 'confirm') return this.$message.info('已取消删除')
      const {data: res} = await this.$http.delete(`categories/${this.cateId}/attributes/${attr_id}`)
      if (res.meta.status !== 200) return this.$message.error('删除参数失败！')
      this.$message.success('删除参数成功！')
      this.getParamsData()
    },
    async handleInputConfirm(row) {
      if (row.inputValue.trim().length === 0) {
        row.inputValue = ''
        row.inputVisible = false
        return
      }
      row.attr_vals.push(row.inputValue.trim())
      row.inputValue = ''
      row.inputVisible = false
      this.saveAttrVals(row)
    },
    async saveAttrVals(row) {
      const {data: res} = await this.$http.put(`categories/${this.cateId}/attributes/${row.attr_id}`, {
        attr_name: row.attr_name,
        attr_sel: row.attr_sel,
        attr_vals: row.attr_vals.join(' ')
      })
      if (res.meta.status !== 200) return this.$message.error('修改参数失败！')
      this.$message.success('修改参数成功！')
    },
    showInput(row) {
      row.inputVisible = true
      //文本框自动获得焦点
      //$nextTick方法作用，就是当页面上元素被重新渲染之后，才会执行回调函数钟的代码
      this.$nextTick(_ => {
        this.$refs.saveTagInput.$refs.input.focus();
      });
    },
    handleClose(i, row) {
      row.attr_vals.splice(i, 1)
      this.saveAttrVals(row)
    }
  },
  computed: {
    cateId() {
      if (this.selectedCateKeys.length === 3) return this.selectedCateKeys[2]
      return null
    },
    titleText() {
      if (this.activeName === 'many') return '动态参数'
      else return '静态属性'
    }
  }
}
</script>

<style lang="less" scoped>
.cat_opt {
  margin: 10px 0;
}
.el-tag {
  margin: 0 5px;
}
.input-new-tag {
  width: 120px;
}
</style>