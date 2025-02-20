<template>
  <div id="addPicturePage">
    <a-typography-paragraph v-if="spaceId" type="secondary">
      保存至空间：<a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
    </a-typography-paragraph>

    <h2 style="margin-bottom: 16px">{{ oldPic?.id ? '修改图片' : '创建图片' }}</h2>

    <!--    图片上传组件url-->
    <a-tabs v-model:activeKey="activeKey">
      <a-tab-pane key="file" tab="文件上传">
        <PictureUpload :picture="picture" :onSuccess="onSuccess" />
      </a-tab-pane>
      <a-tab-pane key="url" tab="url上传" force-render>
        <UrlPictureUpload :picture="picture" :onSuccess="onSuccess" />
      </a-tab-pane>
    </a-tabs>

    <a-form v-if="picture?.id" layout="vertical" :model="pictureForm" @finish="handleSubmit">
      <a-form-item label="名称" name="name">
        <a-input
          v-model:value="pictureForm.name"
          :default-value="picture?.picName"
          placeholder="请输入名称"
        />
      </a-form-item>
      <a-form-item label="简介" name="introduction">
        <a-textarea
          v-model:value="pictureForm.introduction"
          placeholder="请输入简介"
          :rows="2"
          autoSize
          allowClear
        />
      </a-form-item>
      <a-form-item label="分类" name="category">
        <a-auto-complete
          v-model:value="pictureForm.category"
          placeholder="请输入分类"
          :options="categoryOptions"
          allowClear
        />
      </a-form-item>
      <a-form-item label="标签" name="tags">
        <a-select
          v-model:value="pictureForm.tags"
          mode="tags"
          placeholder="请输入标签"
          :options="tagOptions"
          allowClear
        />
      </a-form-item>
      <a-form-item>
        <a-button type="primary" html-type="submit" style="width: 100%"
          >{{ oldPic?.id ? '修改图片' : '创建图片' }}
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue'
import PictureUpload from '@/pages/picture/components/PictureUpload.vue'
import { message } from 'ant-design-vue'
import {
  editePictureUsingPost,
  getPictureVoByIdUsingGet,
  getTagCategoryUsingGet,
} from '@/service/api/pictureController.ts'
import { useRoute, useRouter } from 'vue-router'
import UrlPictureUpload from '@/pages/picture/components/UrlPictureUpload.vue'

const picture = ref<API.PictureVo>()
const pictureForm = reactive<API.PictureEditRequest>({})
const onSuccess = (newPicture: API.PictureVo) => {
  picture.value = newPicture
}
const router = useRouter()
const activeKey = ref<'file' | 'url'>('file')

const spaceId = computed(() => {
  return route.query?.spaceId
})

/**
 * 提交表单
 * @param values
 */
const handleSubmit = async (values: any) => {
  const pictureId = picture?.value?.id
  if (!pictureId) {
    return
  }

  const res = await editePictureUsingPost({
    id: pictureId,
    spaceId: spaceId.value,
    ...values,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    // 跳转到图片详情页
    await router.push({
      path: `/picture/${pictureId}`,
    })
  } else {
    message.error('创建失败，' + res.data.message)
  }
}
const categoryOptions = ref<{}[]>([])
const tagOptions = ref<{}[]>([])
// 获取标签和分类选项
const getTagCategory = async () => {
  const res = await getTagCategoryUsingGet()
  if (res.data.code === 0 && res.data.data) {
    // 转换成下拉选项组件接受的格式
    tagOptions.value = (res.data.data.tags ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
    categoryOptions.value = (res.data.data.categories ?? []).map((data: string) => {
      return {
        value: data,
        label: data,
      }
    })
  } else {
    message.error('加载选项失败，' + res.data.message)
  }
}

const route = useRoute()
const oldPic = ref<API.PictureVo>()
const getOldPicture = async () => {
  const id = route.query?.id
  console.log(id)
  if (id) {
    const res = await getPictureVoByIdUsingGet({ id: id })
    const data = res.data
    oldPic.value = data.data
    if (data.code === 0 && data.data) {
      picture.value = data.data
      pictureForm.name = data.data.picName
      pictureForm.introduction = data.data.introduction
      pictureForm.category = data.data.category
      pictureForm.tags = data.data.tags
      console.log(data.data)
    }
  }
}
onMounted(() => {
  getTagCategory()
})
onMounted(() => {
  getOldPicture()
})
</script>

<style scoped>
#addPicturePage {
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
  #addPicturePage {
    padding: 16px;
  }
}
</style>
