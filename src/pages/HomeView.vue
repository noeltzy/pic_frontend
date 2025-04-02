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
        <div class="masonry-grid" v-if="dataSource.length">
          <div
            v-for="item in dataSource"
            :key="item.id"
            class="masonry-item"
            @click="handleCardClick(item.id)"
          >
            <div class="picture-card">
              <div class="picture-container">
                <img
                  :src="item.thumbnailUrl ?? item.url"
                  :alt="item.picName"
                  loading="lazy"
                  @load="handleImageLoad"
                />
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
          </div>
        </div>
        <a-empty v-else description="暂无图片" />

        <!-- 加载更多状态 -->
        <div class="load-more" v-if="dataSource.length > 0">
          <a-spin v-if="loading" />
          <div v-else-if="hasMore" class="load-more-trigger" ref="loadMoreTrigger"></div>
          <div v-else class="no-more">没有更多了</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue'
import { message } from 'ant-design-vue'
import { useRouter } from 'vue-router'
import { listPictureVoPageUsingPost, getTagCategoryUsingGet } from '@/service/api/pictureController'

const router = useRouter()

const loading = ref(false)
const dataSource = ref<API.PictureVo[]>([])
const total = ref(0)
const current = ref(1)
const pageSize = ref(12)
const hasMore = ref(true)
const loadMoreTrigger = ref<HTMLElement | null>(null)

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
const loadData = async (isLoadMore = false) => {
  if (loading.value || (!isLoadMore && !hasMore.value)) return

  loading.value = true
  try {
    const res = await listPictureVoPageUsingPost({
      ...searchForm.value,
      current: current.value,
      pageSize: pageSize.value,
    })
    if (res.data?.code === 0 && res.data?.data) {
      const newData = res.data.data.records || []
      if (isLoadMore) {
        dataSource.value = [...dataSource.value, ...newData]
      } else {
        dataSource.value = newData
      }
      total.value = res.data.data.total || 0
      hasMore.value = dataSource.value.length < total.value
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
  hasMore.value = true
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

// 处理卡片点击
const handleCardClick = (id?: number) => {
  if (id) {
    router.push(`/picture/${id}`)
  }
}

// 处理图片加载完成
const handleImageLoad = (event: Event) => {
  const img = event.target as HTMLImageElement
  if (img) {
    img.style.opacity = '1'
  }
}

// 处理滚动加载
const handleScroll = () => {
  if (!loadMoreTrigger.value) return

  const rect = loadMoreTrigger.value.getBoundingClientRect()
  if (rect.top <= window.innerHeight && hasMore.value && !loading.value) {
    current.value++
    loadData(true)
  }
}

// 页面加载时获取数据
onMounted(() => {
  loadTagsAndCategories()
  loadData()
  window.addEventListener('scroll', handleScroll)
})

// 组件卸载时移除滚动监听
onUnmounted(() => {
  window.removeEventListener('scroll', handleScroll)
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
  min-height: 400px;
}

.masonry-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 24px;
  padding: 8px;
}

.masonry-item {
  break-inside: avoid;
}

.picture-card {
  background: #fff;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.picture-card:hover {
  transform: translateY(-4px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.12);
}

.picture-container {
  position: relative;
  padding-top: 75%; /* 4:3 比例 */
  overflow: hidden;
  background: #f5f5f5;
}

.picture-container img {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  opacity: 0;
  transition: opacity 0.3s ease;
}

.picture-info {
  padding: 16px;
}

.picture-info h4 {
  margin: 0 0 12px;
  font-size: 16px;
  line-height: 1.5;
  color: rgba(0, 0, 0, 0.85);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.picture-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

:deep(.ant-tag) {
  margin: 0;
  border-radius: 4px;
  padding: 2px 8px;
}

.load-more {
  text-align: center;
  padding: 24px 0;
  color: rgba(0, 0, 0, 0.45);
}

.load-more-trigger {
  height: 20px;
  width: 100%;
}

.no-more {
  color: rgba(0, 0, 0, 0.25);
  font-size: 14px;
}

/* 响应式调整 */
@media (max-width: 768px) {
  .masonry-grid {
    grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
    gap: 16px;
  }
}

@media (max-width: 480px) {
  .masonry-grid {
    grid-template-columns: 1fr;
  }
}
</style>
