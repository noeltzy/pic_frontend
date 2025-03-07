<template>
  <div id="addPicturePage">
    <a-typography-paragraph v-if="spaceId" type="secondary">
      保存至空间：<a :href="`/space/${spaceId}`" target="_blank">{{ spaceId }}</a>
    </a-typography-paragraph>

    <h2 style="margin-bottom: 16px">{{ oldPic?.id ? '修改图片' : '创建图片' }}</h2>
    <a-space>
      <a-button
        v-if="picture?.id && spaceId && !isExpandingImage"
        type="primary"
        @click="handleAiExpand"
        >AI 扩图</a-button
      >
      <a-button v-if="isExpandingImage" type="primary" :loading="true" disabled>扩图中...</a-button>
      <a-button v-if="expandTaskCompleted" type="primary" @click="showExpandResult"
        >查看结果</a-button
      >
      <a-button v-if="picture?.id" type="primary" @click="openImageEditor">编辑图片</a-button>
    </a-space>

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

    <a-modal
      v-model:open="aiExpandResultModal"
      title="阔图结果"
      ok-text="上传结果"
      cancel-text="关闭"
      @ok="aiUrlUpload"
      @cancel="handleCancel"
    >
      <!-- 限制高度 100px -->
      <img :src="aiExpandResultPictureUrl" style="max-height: 200px" />
    </a-modal>

    <!-- 图片编辑模态框 -->
    <a-modal
      v-model:open="imageEditorVisible"
      title="图片编辑"
      width="800px"
      :footer="null"
      :destroyOnClose="true"
    >
      <PictureEditor
        v-if="imageEditorVisible && picture?.url"
        :imageUrl="picture.url"
        :onComplete="handleEditorComplete"
      />
      <div class="editor-footer">
        <a-button @click="closeImageEditor">取消</a-button>
        <a-button type="primary" @click="uploadEditedImage" :loading="uploadingEditedImage">
          保存并上传
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watch } from 'vue'
import PictureUpload from '@/pages/picture/components/PictureUpload.vue'
import { message } from 'ant-design-vue'
import {
  editePictureUsingPost,
  getPictureVoByIdUsingGet,
  getTagCategoryUsingGet,
  createPictureOutPaintingTaskUsingPost,
  getPictureOutPaintingTaskUsingGet,
  uploadPictureByUrlUsingPost,
  uploadPictureUsingPost,
} from '@/service/api/pictureController.ts'
import { useRoute, useRouter } from 'vue-router'
import UrlPictureUpload from '@/pages/picture/components/UrlPictureUpload.vue'
import PictureEditor from '@/pages/picture/components/PictureEditor.vue'

const taskId = ref<string>()
const picture = ref<API.PictureVo>()
const pictureForm = reactive<API.PictureEditRequest>({})
const aiExpandResultPictureUrl = ref<string>()

// 图片编辑相关状态
const imageEditorVisible = ref<boolean>(false)
const editedImageUrl = ref<string>('')
const uploadingEditedImage = ref<boolean>(false)

// AI扩图相关状态
const isExpandingImage = ref<boolean>(false)
const expandTaskCompleted = ref<boolean>(false)
const pollingInterval = ref<number | null>(null)

const onSuccess = (newPicture: API.PictureVo) => {
  picture.value = newPicture
}
const router = useRouter()
const activeKey = ref<'file' | 'url'>('file')

const spaceId = computed(() => {
  return route.query?.spaceId
})
const aiExpandResultModal = ref<boolean>(false)
const handleCancel = () => {
  aiExpandResultModal.value = false
}

// 打开图片编辑器
const openImageEditor = () => {
  imageEditorVisible.value = true
}

// 关闭图片编辑器
const closeImageEditor = () => {
  imageEditorVisible.value = false
  editedImageUrl.value = ''
}

// 处理编辑完成
const handleEditorComplete = (url: string) => {
  editedImageUrl.value = url
}

// 上传编辑后的图片
const uploadEditedImage = async () => {
  if (!editedImageUrl.value) {
    message.warning('请先编辑图片')
    return
  }

  uploadingEditedImage.value = true
  try {
    // 将base64图片URL转换为Blob对象
    const response = await fetch(editedImageUrl.value)
    const blob = await response.blob()

    // 创建File对象
    const file = new File([blob], 'edited-image.jpg', { type: 'image/jpeg' })

    // 如果已有图片ID，则更新该图片
    const params: API.uploadPictureUsingPOSTParams = {}
    if (picture.value?.id) {
      params.id = picture.value.id
    }
    if (spaceId.value) {
      params.spaceId = spaceId.value
    }

    const res = await uploadPictureUsingPost(params, {}, file)

    // 使用正确的类型断言
    const responseData = res.data as API.BaseResponsePictureVo_

    if (responseData?.code === 0 && responseData?.data) {
      message.success('图片编辑成功')
      picture.value = responseData.data
      imageEditorVisible.value = false
    } else {
      message.error('上传失败，' + (responseData?.message || '未知错误'))
    }
  } catch (error) {
    console.error('上传编辑图片失败:', error)
    message.error('上传失败，请重试')
  } finally {
    uploadingEditedImage.value = false
  }
}

const aiUrlUpload = async () => {
  const res = await uploadPictureByUrlUsingPost({
    url: aiExpandResultPictureUrl.value,
    spaceId: spaceId?.value,
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('上传成功')
    const id = res.data.data.id
    console.log(id)
    aiExpandResultModal.value = false
    await router.replace({
      path: '/picture/upload',
      query: {
        id: id,
        spaceId: spaceId?.value,
        _t: Date.now(),
      },
    })
  } else {
    message.error('上传失败，' + res.data.message)
  }
}
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

// 显示扩图结果
const showExpandResult = () => {
  aiExpandResultModal.value = true
}

const handleAiExpand = async () => {
  const res = await createPictureOutPaintingTaskUsingPost({
    pictureId: picture.value?.id,
    parameters: {
      xScale: 2,
      yScale: 2,
    },
  })
  if (res.data.code === 0 && res.data.data) {
    message.success('创建成功')
    taskId.value = res.data.data.output?.taskId

    // 开始轮询查询任务状态
    isExpandingImage.value = true
    expandTaskCompleted.value = false

    // 清除可能存在的之前的轮询
    if (pollingInterval.value) {
      clearInterval(pollingInterval.value)
    }

    // 设置轮询间隔为3秒
    pollingInterval.value = setInterval(queryExpandTaskStatus, 3000)
  } else {
    message.error('创建失败，' + res.data.message)
  }
}

// 查询扩图任务状态
const queryExpandTaskStatus = async () => {
  if (!taskId.value) {
    return
  }

  try {
    const res = await getPictureOutPaintingTaskUsingGet({ taskId: taskId.value })
    if (res.data.code === 0 && res.data.data) {
      const taskStatus = res.data.data.output?.taskStatus

      if (taskStatus === 'SUCCEEDED') {
        // 任务成功完成
        console.log(res.data.data.output.outputImageUrl)
        message.success('图片扩充成功')
        aiExpandResultPictureUrl.value = res.data.data.output.outputImageUrl

        // 更新状态
        isExpandingImage.value = false
        expandTaskCompleted.value = true

        // 清除轮询
        if (pollingInterval.value) {
          clearInterval(pollingInterval.value)
          pollingInterval.value = null
        }
      } else if (taskStatus === 'FAILED' || taskStatus === 'CANCELLED') {
        // 任务失败
        message.error('扩图任务失败: ' + taskStatus)
        isExpandingImage.value = false

        // 清除轮询
        if (pollingInterval.value) {
          clearInterval(pollingInterval.value)
          pollingInterval.value = null
        }
      }
      // 其他状态继续轮询
    } else {
      message.error('查询失败，' + res.data.message)
    }
  } catch (error) {
    console.error('查询扩图任务状态失败:', error)
    message.error('查询失败，请重试')
  }
}

const route = useRoute()
const oldPic = ref<API.PictureVo>()
const getOldPicture = async () => {
  const id = route.query?.id
  // 如果URL携带pictureID 代表是编辑图片，那么首先要获取图片基本信息
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
    }
  }
}
onMounted(() => {
  getTagCategory()
})
onMounted(() => {
  getOldPicture()
})

// 监听路由参数变化
watch(
  () => route.query,
  async () => {
    await getOldPicture()
  },
  { immediate: true, deep: true },
)

// 组件卸载时清除轮询
onUnmounted(() => {
  if (pollingInterval.value) {
    clearInterval(pollingInterval.value)
    pollingInterval.value = null
  }
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

.editor-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid #f0f0f0;
}
</style>
