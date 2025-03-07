<template>
  <a-layout-sider
    v-if="userStore.loginUser.userName != '未登录'"
    v-model:collapsed="collapsed"
    :trigger="null"
    collapsible
  >
    <div class="logo" />
    <a-menu
      v-model:selectedKeys="selectedKeys"
      mode="inline"
      :items="menuItems"
      @click="onMenuClick"
    />
  </a-layout-sider>
</template>
<script lang="ts" setup>
import { computed, h, ref, watchEffect } from 'vue'
import { PictureOutlined, TeamOutlined, UserOutlined } from '@ant-design/icons-vue'
import { useLoginUserStore } from '@/stores/useLoginUserStore'
import { useRouter } from 'vue-router'
import { listMyTeamSpaceUsingPost } from '@/service/api/spaceUserController'
import { message } from 'ant-design-vue'

const selectedKeys = ref<string[]>(['/'])
const collapsed = ref<boolean>(false)
const userStore = useLoginUserStore()
const router = useRouter()

// 定义菜单项的类型接口
interface MenuItem {
  key: string
  label: string
  icon: () => any // 由于 h 函数返回 VNode，这里使用 any
}

const fixedMenuItems: MenuItem[] = [
  {
    key: '/',
    label: '公共图库',
    icon: () => h(PictureOutlined),
  },
  {
    key: '/user/space',
    label: '个人空间',
    icon: () => h(UserOutlined),
  },
  {
    key: '/add_space?spaceType=1',
    label: '创建团队',
    icon: () => h(TeamOutlined),
  },
]
// 加载团队空间列表
const teamSpaceList = ref<API.SpaceUserVO[]>([])
// 菜单逻辑
const menuItems = computed(() => {
  if (teamSpaceList.value.length < 1) {
    return fixedMenuItems
  }
  //如果用户有团队空间，则展示固定菜单和团队空间菜单
  //展示团队空间分组
  const teamSpaceSubMenus = teamSpaceList.value.map((spaceUser) => {
    const space = spaceUser.space
    return {
      key: '/space/' + spaceUser.spaceId,
      label: space?.spaceName ?? '未命名',
    }
  })
  const teamSpaceMenuGroup = {
    type: 'group',
    label: '我的团队',
    key: 'teamSpace',
    children: teamSpaceSubMenus,
  }
  return [...fixedMenuItems, teamSpaceMenuGroup]
})

const fetchTeamSpaceList = async () => {
  const res = await listMyTeamSpaceUsingPost()
  if (res.data.code === 0 && res.data.data) {
    teamSpaceList.value = res.data.data
  } else {
    message.error('加载我的团队空间失败，' + res.data.message)
  }
}
watchEffect(() => {
  // 登录才加载
  if (userStore.loginUser.id) {
    fetchTeamSpaceList()
  }
})

router.afterEach((to, from, failure) => {
  selectedKeys.value = [to.path]
})

const onMenuClick = ({ key }: { key: string }) => {
  router.push({
    path: key,
  })
}
</script>
<style>
#components-layout-demo-custom-trigger .trigger {
  font-size: 18px;
  line-height: 64px;
  padding: 0 24px;
  cursor: pointer;
  transition: color 0.3s;
}

#components-layout-demo-custom-trigger .trigger:hover {
  color: #1890ff;
}

#components-layout-demo-custom-trigger .logo {
  height: 32px;
  background: rgba(255, 255, 255, 0.3);
  margin: 16px;
}

.site-layout .site-layout-background {
  background: #fff;
}
</style>
