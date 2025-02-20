<template>
  <div class="home-container">
    <div class="content-card">
      <!-- 搜索区域 -->
      <div class="search-section">
        <a-input-search
          v-model:value="searchForm.searchText"
          placeholder="从海量图片中搜索..."
          enter-button
          size="large"
          @search="handleSearch"
          class="search-input"
        />
      </div>

      <!-- 分类导航 -->
      <div class="nav-section">
        <a-tabs v-model:activeKey="searchForm.category" @change="handleCategoryChange">
          <a-tab-pane key="" tab="全部" />
          <a-tab-pane v-for="category in categories" :key="category" :tab="category" />
        </a-tabs>

        <div class="nav-tags">
          <div class="tags-label">标签：</div>
          <div class="tags-content">
            <a-tabs v-model:activeKey="selectedTag" @change="handleTagChange">
              <a-tab-pane key="" tab="全部" />
              <a-tab-pane v-for="tag in tags" :key="tag" :tab="tag" />
            </a-tabs>
          </div>
        </div>
      </div>

      <!-- 图片展示区域 -->
      <div class="pictures-section">
        <a-list
          :grid="{ gutter: 24, xs: 1, sm: 2, md: 3, lg: 4, xl: 4, xxl: 6 }"
          :data-source="dataSource"
          :loading="loading"
          :pagination="{
            current,
            pageSize,
            total,
            onChange: handlePageChange,
            showSizeChanger: false,
          }"
        >
          <template #renderItem="{ item }">
            <a-list-item>
              <div class="picture-card" @click="handleCardClick(item.id)">
                <div class="picture-container">
                  <img :src="item.thumbnailUrl??item.url" :alt="item.picName" loading="lazy"/>
                </div>
                <div class="picture-info">
                  <h4>{{ item.picName }}</h4>
                  <div class="picture-meta">
                    <a-tag color="green">{{ item.category || '默认' }}</a-tag>
                    <div class="picture-tags" v-if="item.tags && item.tags.length">
                      <a-tag v-for="tag in item.tags" :key="tag" color="blue">{{ tag }}</a-tag>
                    </div>
                  </div>
                </div>
              </div>
            </a-list-item>
          </template>
        </a-list>

      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { listPictureVoPageUsingPost, getTagCategoryUsingGet } from '@/service/api/pictureController'

const router = useRouter()

const loading = ref(false)
const dataSource = ref<API.PictureVo[]>([])
const total = ref(0)
const current = ref(1)
const pageSize = ref(12)

// 分类和标签
const categories = ref<string[]>([])
const tags = ref<string[]>([])
const selectedTag = ref('')

// 搜索条件
const searchForm = ref<API.PictureQueryRequest>({
  searchText: '',
  category: '',
  tags: [],
})

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

// 加载图片列表
const loadData = async () => {
  loading.value = true
  try {
    const res = await listPictureVoPageUsingPost({
      ...searchForm.value,
      current: current.value,
      pageSize: pageSize.value,
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

// 处理搜索
const handleSearch = () => {
  current.value = 1
  loadData()
}

// 处理分类变化
const handleCategoryChange = (category: string) => {
  searchForm.value.category = category
  handleSearch()
}

// 处理标签选择
const handleTagChange = (tag: string) => {
  selectedTag.value = tag
  searchForm.value.tags = tag ? [tag] : []
  handleSearch()
}

// 处理分页变化
const handlePageChange = (page: number) => {
  current.value = page
  loadData()
}

// 处理卡片点击
const handleCardClick = (id?: number) => {
  if (id) {
    router.push(`/picture/${id}`)
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadTagsAndCategories()
  loadData()
})
</script>

<style scoped>
.home-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
}

.content-card {
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
  padding: 24px;
}

.search-section {
  margin-bottom: 24px;
}

.search-input {
  max-width: 800px;
  margin: 0 auto;
  display: block;
}

.nav-section {
  margin-bottom: 24px;
}

.nav-tags {
  margin-top: 16px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding-top: 8px;
}

.tags-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  white-space: nowrap;
  padding-top: 8px;
}

.tags-content {
  flex: 1;
}

/* 分类标签样式 */
:deep(.ant-tabs-nav) {
  margin: 0 !important;
}

:deep(.ant-tabs-tab) {
  padding: 6px 16px !important;
}

:deep(.ant-tabs-tab + .ant-tabs-tab) {
  margin: 0 0 0 16px !important;
}

/* 标签区域样式调整 */
.nav-tags {
  margin-top: 16px;
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding-top: 8px;
}

.tags-label {
  font-size: 14px;
  color: rgba(0, 0, 0, 0.65);
  white-space: nowrap;
  padding-top: 8px;
}

.tags-content {
  flex: 1;
}

/* 标签页样式区分 */
.tags-content :deep(.ant-tabs-tab) {
  padding: 4px 12px !important;
  font-size: 13px;
  color: rgba(0, 0, 0, 0.65);
}

.tags-content :deep(.ant-tabs-tab-active) {
  color: #1890ff !important;
}

.tags-content :deep(.ant-tabs-ink-bar) {
  height: 2px !important;
}

.tags-content :deep(.ant-tabs-nav::before) {
  display: none !important;
}

.pictures-section {
  margin-top: 24px;
}

.picture-card {
  background: #fff;
  border-radius: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

.picture-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.picture-container {
  position: relative;
  padding-top: 100%;
  overflow: hidden;
}

.picture-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.picture-info {
  padding: 12px;
}

.picture-info h4 {
  margin: 0 0 8px;
  font-size: 14px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picture-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

:deep(.ant-tag) {
  margin: 0;
}

:deep(.ant-list-pagination) {
  text-align: center;
  margin-top: 48px;
}
</style>
