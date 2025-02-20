<template>
  <!-- 空间信息 -->
  <a-flex justify="space-between">
    <h2>{{ space.spaceName }}（私有空间）</h2>
    <a-space size="middle">
      <a-button type="primary" :href="`/picture/upload?spaceId=${id}`" target="_blank">
        + 创建图片
      </a-button>
      <a-tooltip :title="`占用空间 ${space.totalSize} / ${space.maxSize}`">
        <a-progress
          type="circle"
          :percent="
            space.totalSize && space.maxSize
              ? ((space.totalSize * 100) / space.maxSize).toFixed(1)
              : 0
          "
          :size="42"
        />
      </a-tooltip>
    </a-space>
  </a-flex>

  <!-- 图片列表 -->
  <SpacePictureList :dataList="dataList" :loading="loading" />
  <a-pagination
    style="text-align: right"
    v-model:current="searchParams.current"
    v-model:pageSize="searchParams.pageSize"
    :total="total"
    :show-total="() => `图片总数 ${total} / ${space.maxCount}`"
    @change="onPageChange"
  />
</template>
<script lang="ts" setup>
import { listPictureVoPageUsingPost } from '@/service/api/pictureController'
import SpacePictureList from './SpacePictureList.vue'
import { message } from 'ant-design-vue'
import { onMounted, reactive, ref } from 'vue'
import { getSpaceVoByIdUsingGet } from '@/service/api/spaceController'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
const loginUserStore = useLoginUserStore()
const props = defineProps<{
  id: string | number
}>()
const space = ref<API.SpaceVO>({})

// 获取空间详情
const fetchSpaceDetail = async () => {
  try {
    const res = await getSpaceVoByIdUsingGet({
      id: props.id,
    })
    if (res.data.code === 0 && res.data.data) {
      space.value = res.data.data
    } else {
      message.error('获取空间详情失败，' + res.data.message)
    }
  } catch (e: any) {
    message.error('获取空间详情失败：' + e.message)
  }
}

onMounted(() => {
  fetchSpaceDetail()
})

// 数据
const dataList = ref([])
const total = ref(0)
const loading = ref(true)

// 搜索条件
const searchParams = reactive<API.PictureQueryRequest>({
  current: 1,
  pageSize: 12,
  sortField: 'createTime',
  sortOrder: 'descend',
})

// 分页参数
const onPageChange = (page, pageSize) => {
  searchParams.current = page
  searchParams.pageSize = pageSize
  fetchData()
}

// 获取数据
const fetchData = async () => {
  console.log(space.value.user?.id)
  loading.value = true
  // 转换搜索参数
  const params = {
    spaceId: props.id,
    userId: loginUserStore.loginUser.id,
    ...searchParams,
  }

  const res = await listPictureVoPageUsingPost(params)
  if (res.data.data) {
    dataList.value = res.data.data.records ?? []
    total.value = res.data.data.total ?? 0
  } else {
    message.error('获取数据失败，' + res.data.message)
  }
  loading.value = false
}

// 页面加载时请求一次
onMounted(() => {
  fetchData()
})
</script>

<style></style>
