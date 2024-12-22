<template>
  <div id="addPictureBatchPage">
    <h2 style="margin-bottom: 16px">批量创建图片</h2>
    <a-form layout="vertical" :model="formData" @finish="handleSubmit">
      <a-form-item label="关键词" name="searchText">
        <a-input v-model:value="formData.searchText" placeholder="请输入关键词" />
      </a-form-item>
      <a-form-item label="抓取数量" name="count">
        <a-input-number
          v-model:value="formData.count"
          placeholder="请输入数量"
          style="min-width: 180px"
          :min="1"
          :max="30"
          allow-clear
        />
      </a-form-item>
      <a-form-item label="分类">
        <a-select
          v-model:value="formData.category"
          placeholder="请选择分类"
          style="width: 200px"
          allow-clear
        >
          <a-select-option v-for="category in categories" :key="category" :value="category">
            {{ category }}
          </a-select-option>
        </a-select>
      </a-form-item>

      <a-form-item label="名称前缀" name="namePrefix">
        <a-input v-model:value="formData.prefixName" placeholder="请输入名称前缀，会自动补充序号" />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%" :loading="loading">
          执行任务
        </a-button>
      </a-form-item>
    </a-form>
  </div>

</template>

<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue'
import { message } from 'ant-design-vue'
import {
  getTagCategoryUsingGet, uploadPictureByBatchUsingPost
} from "@/service/api/pictureController.ts";
import { useRouter } from 'vue-router'


const formData = reactive<API.PictureUploadByBatchRequest>({
  count: 10,
})
const loading = ref(false)


const router = useRouter()
/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  loading.value = true;
  const res = await uploadPictureByBatchUsingPost({
    ...formData,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success(`创建成功，共 ${res.data.data} 条`)
    await router.push({
      path: '/',
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
  loading.value = false;
}

const categories = ref<[]>([])
const tags = ref<[]>([])
// 获取标签和分类选项
const getTagCategory = async () => {
  const res = await getTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    tags.value = res.data.data.tags
    categories.value = res.data.data.categories
  } else {
    message.error('加载选项失败，' + res.data.message)
  }
}


onMounted(() => {
  getTagCategory()
})

</script>

<style scoped>
#addPictureBatchPage {
  max-width: 1400px;
  margin: 0 auto;
  padding: 24px;
  background: #fff;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
}

h2 {
  color: #333;
  font-size: 24px;
  font-weight: 600;
  margin-bottom: 32px;
}

:deep(.ant-form-item) {
  margin-bottom: 24px;
}

:deep(.ant-form-item-label) {
  font-weight: 500;
  color: #333;
}

:deep(.ant-input),
:deep(.ant-select-selector),
:deep(.ant-input-affix-wrapper) {
  border-radius: 4px;
  transition: all 0.3s;
}

:deep(.ant-input:hover),
:deep(.ant-select-selector:hover),
:deep(.ant-input-affix-wrapper:hover) {
  border-color: #40a9ff;
}

:deep(.ant-input:focus),
:deep(.ant-select-selector:focus),
:deep(.ant-input-affix-wrapper:focus) {
  border-color: #1890ff;
  box-shadow: 0 0 0 2px rgba(24, 144, 255, 0.1);
}

:deep(.ant-btn-primary) {
  height: 40px;
  font-size: 16px;
}

@media (max-width: 576px) {
  #batchAddPicturePage {
    padding: 16px;
  }
}
</style>
