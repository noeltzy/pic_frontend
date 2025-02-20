<template>
  <div class="picture-manage-container">
    <!-- 搜索表单 -->
    <div class="search-form">
      <a-form layout="inline">
        <a-form-item label="图片名称">
          <a-input v-model:value="searchForm.name" placeholder="请输入图片名称" allow-clear />
        </a-form-item>
        <a-form-item label="关键词">
          <a-input v-model:value="searchForm.searchText" placeholder="请输入关键词" allow-clear />
        </a-form-item>
        <a-form-item label="分类">
          <a-select
            v-model:value="searchForm.category"
            placeholder="请选择分类"
            style="width: 200px"
            allow-clear
          >
            <a-select-option v-for="category in categories" :key="category" :value="category">
              {{ category }}
            </a-select-option>
          </a-select>
        </a-form-item>
        <a-form-item label="标签">
          <a-select
            v-model:value="searchForm.tags"
            mode="multiple"
            placeholder="请选择标签"
            style="width: 300px"
            allow-clear
          >
            <a-select-option v-for="tag in tags" :key="tag" :value="tag">
              {{ tag }}
            </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item label="审核状态">
          <a-select
            v-model:value="searchForm.reviewStatus"
            placeholder="请选择审核状态"
            style="width: 100px"
            allow-clear
          >
            <a-select-option value="0"> 未审核 </a-select-option>
            <a-select-option value="1"> 审核通过 </a-select-option>
            <a-select-option value="2"> 审核拒绝 </a-select-option>
          </a-select>
        </a-form-item>

        <a-form-item>
          <a-space>
            <a-button type="primary" @click="loadData">搜索</a-button>
            <a-button @click="handleReset">重置</a-button>
          </a-space>
        </a-form-item>
      </a-form>
    </div>

    <!-- 操作按钮区域 -->
    <div class="operation-bar">
      <a-upload
        name="file"
        :show-upload-list="false"
        :before-upload="beforeUpload"
        :customRequest="handleUpload"
      >
        <a-button type="primary">
          <template #icon><UploadOutlined /></template>
          上传图片
        </a-button>
      </a-upload>

      <a-button @click="handleBatchUpload" type="primary">
        <template #icon><UploadOutlined /></template>
        批量上传
      </a-button>
    </div>

    <!-- 图片列表 -->
    <a-table
      :columns="columns"
      :data-source="dataSource"
      :loading="loading"
      :pagination="{
        current,
        pageSize,
        total,
        showTotal: () => `共 ${total} 条记录`,
      }"
      @change="handleTableChange"
      row-key="id"
    >
      <template #picUrl="{ text }">
        <img :src="text" class="thumbnail" @click="() => handlePreview(text)" alt="图片缩略图" />
      </template>
      <template #picInfo="{ record }">
        <div class="pic-info">
          <p>格式：{{ record.picFormat }}</p>
          <p>尺寸：{{ record.picWidth }}x{{ record.picHeight }}</p>
          <p>比例：{{ record.picScale }}</p>
          <p>大小：{{ formatFileSize(record.picSize) }}</p>
        </div>
      </template>

      <template #spaceRender="{ record }">
        <div class="space-info">
          <p>{{ record.spaceId == undefined ? '公共图库' : record.spaceId }}</p>
        </div>
      </template>
      <template #reviewInfo="{ record }">
        <div class="pic-info">
          <p>审核人：{{ record.reviewerId }}</p>
          <p>审核状态：{{ PIC_REVIEW_STATUS_MAP[record.reviewStatus] }}</p>
          <p>消息：{{ record.reviewMessage }}</p>
        </div>
      </template>
      <template #categoryAndTags="{ record }">
        <div class="category-tags">
          <div class="category-label">
            <a-tag color="green">{{ record.category || '默认分类' }}</a-tag>
          </div>
          <div class="tags-container" v-if="record.tags && record.tags.length">
            <a-tag v-for="tag in JSON.parse(record.tags)" :key="tag" color="blue" class="small-tag">
              {{ tag }}
            </a-tag>
          </div>
        </div>
      </template>
      <template #action="{ record }">
        <a-space>
          <a-button type="link" :href="`/picture/upload?id=${record.id}`" target="_blank"
            >编辑</a-button
          >
          <a-button type="link" danger @click="handleDelete(record)">删除</a-button>
        </a-space>
      </template>
      <template #review="{ record }">
        <a-space>
          <a-button
            v-if="record.reviewStatus !== 1"
            type="link"
            @click="handleReview(record, 1)"
            target="_blank"
            >通过</a-button
          >
          <a-button
            v-if="record.reviewStatus !== 2"
            type="link"
            danger
            @click="handleReview(record, 2)"
            >拒绝</a-button
          >
        </a-space>
      </template>
    </a-table>
    <!-- 图片预览弹窗 -->
    <a-modal
      v-model:visible="previewVisible"
      :footer="null"
      @cancel="() => (previewVisible = false)"
    >
      <img :src="previewImage" style="width: 100%" alt="_" />
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message, Modal } from 'ant-design-vue'
import { UploadOutlined } from '@ant-design/icons-vue'
import type { TableProps } from 'ant-design-vue'
import {
  deletePictureUsingPost,
  uploadPictureUsingPost,
  getTagCategoryUsingGet,
  listPicturePageUsingPost,
  reviewPictureUsingPost,
} from '@/service/api/pictureController'
import { PIC_REVIEW_STATUS_MAP } from '@/constants/reviewStatusConstants.ts'
import router from '@/router'

// 表格列定义
const columns = [
  {
    title: '图片',
    dataIndex: 'url',
    width: 100,
    slots: {
      customRender: 'picUrl',
    },
  },
  {
    title: '图片名称',
    dataIndex: 'name',
    width: 150,
  },
  {
    title: '空间',
    dataIndex: 'spaceId',
    width: 150,
    slots: {
      customRender: 'spaceRender',
    },
  },
  {
    title: '图片信息',
    dataIndex: 'picInfo',
    width: 200,
    slots: {
      customRender: 'picInfo',
    },
  },

  {
    title: '分类/标签',
    dataIndex: 'categoryAndTags',
    width: 200,
    slots: {
      customRender: 'categoryAndTags',
    },
  },
  {
    title: '简介',
    dataIndex: 'introduction',
    ellipsis: true,
    with: 300,
  },
  {
    title: '审核信息',
    with: 150,
    slots: {
      customRender: 'reviewInfo',
    },
  },
  {
    title: '审核',
    width: 150,
    slots: {
      customRender: 'review',
    },
  },

  {
    title: '操作',
    width: 150,
    slots: {
      customRender: 'action',
    },
  },
]

const loading = ref(false)
const dataSource = ref<API.Picture[]>([])
const total = ref(0)
const current = ref(1)
const pageSize = ref(10)

// 分类和标签
const categories = ref<string[]>([])
const tags = ref<string[]>([])

// 搜索条件
const searchForm = ref<API.PictureQueryRequest>({
  name: '',
  category: undefined,
  tags: [],
  searchText: '',
})

// 图片预览
const previewVisible = ref(false)
const previewImage = ref('')

// 图片预览
const handlePreview = (url: string) => {
  previewImage.value = url
  previewVisible.value = true
}

// 获取分类和标签
const loadTagsAndCategories = async () => {
  try {
    const res = await getTagCategoryUsingGet()
    if (res.data?.code === 0 && res.data?.data) {
      categories.value = res.data.data.categories || []
      tags.value = res.data.data.tags || []
    }
  } catch (error) {
    message.error('获取分类和标签失败')
  }
}

// ���取图片列表
const loadData = async (params = {}) => {
  loading.value = true
  try {
    const res = await listPicturePageUsingPost({
      ...searchForm.value,
      current: current.value,
      pageSize: pageSize.value,
      ...params,
    })
    if (res.data?.code === 0 && res.data?.data) {
      dataSource.value = res.data.data.records || []
      total.value = res.data.data.total || 0
    } else {
      message.error(res.data?.message || '获取图片列表失败')
    }
  } catch (error) {
    message.error('获取图片列表失败')
  } finally {
    loading.value = false
  }
}

// 删除图片
const handleDelete = (record: API.PictureVo) => {
  if (!record.id) return
  Modal.confirm({
    title: '确认删除',
    content: `确定要删除图片 ${record.picName} 吗？`,
    async onOk() {
      try {
        const res = await deletePictureUsingPost({ id: record.id })
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
// 处理审核
const handleReview = async (record: API.Picture, reviewStatus: number) => {
  const reviewMessage = reviewStatus == 1 ? '管理员审核通过' : '管理员审核拒绝'
  const res = await reviewPictureUsingPost({
    reviewStatus,
    reviewMessage,
    id: record.id,
  })
  if (res.data?.code === 0) {
    message.success('审核成功')
    loadData()
  } else {
    message.error(res.data?.message || '审核失败')
  }
}

// 处理分页变化
const handleTableChange: TableProps['onChange'] = (pagination) => {
  if (pagination) {
    current.value = pagination.current || 1
    pageSize.value = pagination.pageSize || 10
    loadData()
  }
}

// 重置搜索
const handleReset = () => {
  searchForm.value = {
    name: '',
    category: undefined,
    tags: [],
    searchText: '',
  }
  loadData()
}

// 上传图片前的校验
const beforeUpload = (file: File) => {
  const isImage = file.type.startsWith('image/')
  if (!isImage) {
    message.error('只能上传图片文件!')
  }
  const isLt2M = file.size / 1024 / 1024 < 2
  if (!isLt2M) {
    message.error('图片必须小于2MB!')
  }
  return isImage && isLt2M
}

// 处理图片上传
const handleUpload = async ({ file }: { file: File }) => {
  try {
    const res = await uploadPictureUsingPost({}, {}, file)
    if (res.data?.code === 0) {
      message.success('上传成功')
      loadData()
    } else {
      message.error(res.data?.message || '上传失败')
    }
  } catch (error) {
    message.error('上传失败')
  }
}

// 批量上传: 直接跳转
const handleBatchUpload = () => {
  router.push({
    path: '/picture/batchUpload',
  })
}

// 页面加载时获取数据
onMounted(() => {
  loadTagsAndCategories()
  loadData()
})

// 添加文件大小格式化函数
const formatFileSize = (size?: number) => {
  if (!size) return '0 B'
  const units = ['B', 'KB', 'MB', 'GB']
  let index = 0
  while (size >= 1024 && index < units.length - 1) {
    size /= 1024
    index++
  }
  return `${size.toFixed(2)} ${units[index]}`
}
</script>

<style scoped>
.picture-manage-container {
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

.operation-bar {
  margin-bottom: 16px;
  display: flex;
  justify-content: flex-end;
}

.thumbnail {
  width: 60px;
  height: 60px;
  object-fit: cover;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.3s;
}

.thumbnail:hover {
  transform: scale(1.1);
}

.pic-info {
  font-size: 12px;
  line-height: 1.5;
}

.pic-info p {
  margin: 0;
}

.category-tags {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.category-label {
  display: inline-block;
}

.category-label :deep(.ant-tag) {
  margin: 0;
  font-size: 13px;
  padding: 0 8px;
}

.tags-container {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

:deep(.small-tag) {
  font-size: 12px;
  padding: 0 4px;
  margin: 0;
}
</style>
