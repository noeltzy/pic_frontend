<template>
  <div class="user-manage-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline">
        <a-form-item label="用户账号">
          <a-input
            v-model:value="searchForm.userAccount"
            placeholder="请输入用户账号"
            allow-clear
          />
        </a-form-item>
        <a-form-item label="用户名">
          <a-input v-model:value="searchForm.userName" placeholder="请输入用户名" allow-clear />
        </a-form-item>
        <a-form-item label="用户角色">
          <a-select
            v-model:value="searchForm.userRole"
            placeholder="请选择用户角色"
            style="width: 120px"
            allow-clear
          >
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item>
          <a-space>
            <a-button type="primary" @click="loadData"> 搜索 </a-button>
            <a-button @click="handleReset"> 重置 </a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <a-button type="primary" @click="() => (addVisible = true)">
        <template #icon><PlusOutlined /></template>
        添加用户
      </a-button>
    </div>

    <!-- 用户列表 -->
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="{
        current,
        pageSize,
        total,
        showSizeChanger: true,
        showQuickJumper: true,
        showTotal: (total: number) => `共 ${total} 条记录`,
      }"
      @change="handleTableChange"
      row-key="id"
    >
      <template #userAvatar="{ text }">
        <a-avatar :src="text">
          <template #icon><UserOutlined /></template>
        </a-avatar>
      </template>
      <template #userRole="{ text }">
        <a-tag :color="text === 'admin' ? 'red' : 'blue'">{{ text }}</a-tag>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-button type="link" @click="handleEdit(record)">编辑</a-button>
          <a-button type="link" danger @click="handleDelete(record)">删除</a-button>
        </a-space>
      </template>
    </a-table>

    <!-- 编辑用户弹��� -->
    <a-modal
      v-model:visible="editVisible"
      title="编辑用户"
      @ok="handleEditSubmit"
      :confirm-loading="editLoading"
    >
      <a-form :model="editForm" :label-col="{ span: 6 }" :wrapper-col="{ span: 16 }">
        <a-form-item label="用户账号">
          <a-input v-model:value="editForm.userAccount" disabled />
        </a-form-item>
        <a-form-item label="用户名">
          <a-input v-model:value="editForm.userName" />
        </a-form-item>
        <a-form-item label="用户角色">
          <a-select v-model:value="editForm.userRole">
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="用户头像">
          <a-input v-model:value="editForm.userAvatar" />
        </a-form-item>
        <a-form-item label="个人简介">
          <a-textarea v-model:value="editForm.userProfile" />
        </a-form-item>
      </a-form>
    </a-modal>

    <!-- 添加用户弹窗 -->
    <a-modal
      v-model:visible="addVisible"
      title="添加用户"
      @ok="handleAddSubmit"
      :confirm-loading="addLoading"
    >
      <a-form
        ref="addFormRef"
        :model="addForm"
        :rules="addFormRules"
        :label-col="{ span: 6 }"
        :wrapper-col="{ span: 16 }"
      >
        <a-form-item label="用户账号" name="userAccount">
          <a-input v-model:value="addForm.userAccount" placeholder="请输入用户账号（必填）" />
        </a-form-item>
        <a-form-item label="用户角色" name="userRole">
          <a-select v-model:value="addForm.userRole" placeholder="请选择用户角色（必填）">
            <a-select-option value="user">普通用户</a-select-option>
            <a-select-option value="admin">管理员</a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="手机号码" name="phone">
          <a-input v-model:value="addForm.phone" placeholder="请输入手机号码（选填）" />
        </a-form-item>
        <a-form-item label="用户头像" name="userAvatar">
          <a-input v-model:value="addForm.userAvatar" placeholder="请输入头像链接（选填）" />
        </a-form-item>
        <a-form-item label="个人简介" name="userProfile">
          <a-textarea v-model:value="addForm.userProfile" placeholder="请输入个人简介（选填）" />
        </a-form-item>
      </a-form>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { UserOutlined, PlusOutlined } from '@ant-design/icons-vue'
import type { TableProps } from 'ant-design-vue'
import {
  listUserVoPageUsingPost,
  deleteUserUsingPost,
  updateUserUsingPost,
  addUserUsingPost
} from '@/service/api/userController'

interface TableColumn {
  title: string
  dataIndex?: string
  width?: number
  slots?: {
    customRender?: string
  }
}

const loading = ref(false)
const dataSource = ref<API.UserVo[]>([])
const total = ref(0)
const current = ref(1)
const pageSize = ref(10)

// 搜索条件
const searchForm = ref({
  userAccount: '',
  userName: '',
  phone: '',
  userRole: undefined as string | undefined,
})

// 编辑表单
const editVisible = ref(false)
const editForm = ref<API.UserUpdateRequest>({})
const editLoading = ref(false)

// 添加表单
const addVisible = ref(false)
const addForm = ref<API.UserAddRequest>({})
const addLoading = ref(false)
const addFormRules = ref({
  userAccount: [{ required: true, message: '请输入用户账号', trigger: 'blur' }],
  userRole: [{ required: true, message: '请用户择用户角色', trigger: 'change' }],
})

// 获取用户列表
const loadData = async (params = {}) => {
  loading.value = true
  try {
    const res = await listUserVoPageUsingPost({
      ...searchForm.value,
      current: current.value,
      pageSize: pageSize.value,
      ...params,
    })
    if (res.data?.code === 0 && res.data?.data) {
      dataSource.value = res.data.data.records || []
      total.value = res.data.data.total || 0
    } else {
      message.error(res.data?.message || '获取用户列表失败')
    }
  } catch (error) {
    message.error('获取用户列表失败')
  } finally {
    loading.value = false
  }
}

// 删除用户
const handleDelete = (record: API.UserVo) => {
  if (!record.id) return
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除用户 ${record.userName || record.userAccount} 吗？`,
    async onOk() {
      try {
        const res = await deleteUserUsingPost({ id: record.id })
        if (res.data?.code === 0) {
          message.success('删除成功')
          loadData()
        } else {
          message.error(res.data?.message || '删除失败')
        }
      } catch (error) {
        message.error('删除失败')
      }
    },
  })
}

// 编辑用户
const handleEdit = (record: API.UserVo) => {
  editForm.value = { ...record }
  editVisible.value = true
}

// 提交编辑
const handleEditSubmit = async () => {
  if (!editForm.value.id) return
  editLoading.value = true
  try {
    const res = await updateUserUsingPost(editForm.value)
    if (res.data?.code === 0) {
      message.success('更新成功')
      editVisible.value = false
      loadData()
    } else {
      message.error(res.data?.message || '更新失败')
    }
  } catch (error) {
    message.error('更新失败')
  } finally {
    editLoading.value = false
  }
}

// 添加用户
const handleAddSubmit = async () => {
  addLoading.value = true
  try {
    const res = await addUserUsingPost(addForm.value)
    if (res.data?.code === 0) {
      message.success('添加成功')
      addVisible.value = false
      loadData()
    } else {
      message.error(res.data?.message || '添加失败')
    }
  } catch (error) {
    message.error('添加失败')
  } finally {
    addLoading.value = false
  }
}

// 处理分页变化
const handleTableChange: TableProps['onChange'] = (pagination) => {
  current.value = pagination.current || 1
  pageSize.value = pagination.pageSize || 10
  loadData()
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    userAccount: '',
    userName: '',
    phone: '',
    userRole: undefined,
  }
  loadData()
}

// 表格列定义
const columns: TableColumn[] = [
  {
    title: '用户ID',
    dataIndex: 'id',
    width: 80,
  },
  {
    title: '用户头像',
    dataIndex: 'userAvatar',
    width: 80,
    slots: {
      customRender: 'userAvatar',
    },
  },
  {
    title: '用户账号',
    dataIndex: 'userAccount',
    width: 120,
  },
  {
    title: '用户名',
    dataIndex: 'userName',
    width: 120,
  },
  {
    title: '手机号',
    dataIndex: 'phone',
    width: 120,
  },
  {
    title: '用户角色',
    dataIndex: 'userRole',
    width: 100,
    slots: {
      customRender: 'userRole',
    },
  },
  {
    title: '操作',
    width: 200,
    slots: {
      customRender: 'action',
    },
  },
]

// 页面加载时获取数据
onMounted(() => {
  loadData()
})
</script>

<style scoped>
.user-manage-container {
  padding: 24px;
  background: #fff;
  border-radius: 2px;
}

.search-form {
  margin-bottom: 24px;
  padding: 24px;
  background: #fafafa;
  border-radius: 2px;
}

:deep(.ant-form-item) {
  margin-bottom: 16px;
}

:deep(.ant-table-pagination) {
  margin: 16px 0;
}

.operation-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}
</style>
