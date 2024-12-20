import { ref } from 'vue'
import { defineStore } from 'pinia'
import { getLoginUserVoUsingGet } from '@/service/api/userController.ts'

// 从 localStorage 获取用户信息
const getStoredUser = (): API.LoginUserVo => {
  const storedUser = localStorage.getItem('loginUser')
  return storedUser ? JSON.parse(storedUser) : { userName: '未登录' }
}

export const useLoginUserStore = defineStore(
  'loginUser',
  () => {
    // 初始化时从 localStorage 获取数据
    const loginUser = ref<API.LoginUserVo>(getStoredUser())

    // 获取登录用户信息
    async function fetchLoginUser() {
      try {
        const res = await getLoginUserVoUsingGet()
        if (res.data?.code === 0 && res.data?.data) {
          setLoginUser(res.data.data)
        } else {
          // 如果获取失败，清除登录状态
          clearLoginUser()
        }
      } catch (error) {
        clearLoginUser()
      }
    }

    // 设置登录用户
    function setLoginUser(newLoginUser: API.LoginUserVo) {
      loginUser.value = newLoginUser
      // 保存到 localStorage
      localStorage.setItem('loginUser', JSON.stringify(newLoginUser))
    }

    // 清除登录用户
    function clearLoginUser() {
      loginUser.value = { userName: '未登录' }
      localStorage.removeItem('loginUser')
    }

    return {
      loginUser,
      fetchLoginUser,
      setLoginUser,
      clearLoginUser,
    }
  },
  {
    persist: true, // 开启持久化
  }
)
