<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/05 21:28:36
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <div class="wh-full flex-col bg-[url(@/assets/images/login_bg.webp)] bg-cover">
    <div
      class="m-auto max-w-700 min-w-345 f-c-c rounded-8 bg-opacity-20 bg-cover p-12 card-shadow auto-bg"
    >
      <div class="hidden w-380 px-20 py-35 md:block">
        <img src="@/assets/images/login_banner.webp" class="w-full" alt="login_banner">
      </div>

      <div class="w-320 flex-col px-20 py-32">
        <h2 class="f-c-c text-24 text-#6a6a6a font-normal">
          <img src="@/assets/images/logo.png" class="mr-12 h-50">
          {{ title }}
        </h2>

        <div v-if="tenantEnabled" class="mt-32 flex items-center">
          <i class="i-fe:building mr-12 text-16px opacity-60" />
          <n-select
            v-model:value="selectedTenant"
            class="h-40 flex-1 items-center"
            :options="tenants"
            label-field="companyName"
            value-field="tenantKey"
            placeholder="请选择租户"
          />
        </div>

        <n-input
          v-model:value="loginInfo.username"
          autofocus
          :class="tenantEnabled ? 'mt-20' : 'mt-32'"
          class="h-40 items-center"
          placeholder="请输入用户名"
          :maxlength="20"
        >
          <template #prefix>
            <i class="i-fe:user mr-12 opacity-20" />
          </template>
          <template #separator />
        </n-input>
        <n-input
          v-model:value="loginInfo.password"
          class="mt-20 h-40 items-center"
          type="password"
          show-password-on="mousedown"
          placeholder="请输入密码"
          :maxlength="20"
          @keydown.enter="handleLogin()"
        >
          <template #prefix>
            <i class="i-fe:lock mr-12 opacity-20" />
          </template>
        </n-input>

        <div v-if="captchaEnabled" class="mt-20 flex items-center">
          <n-input
            v-model:value="loginInfo.captcha"
            class="h-40 items-center"
            palceholder="请输入验证码"
            :maxlength="4"
            @keydown.enter="handleLogin()"
          >
            <template #prefix>
              <i class="i-fe:key mr-12 opacity-20" />
            </template>
          </n-input>
          <img
            v-if="captchaUrl"
            :src="captchaUrl"
            alt="验证码"
            height="40"
            class="ml-12 w-80 cursor-pointer"
            @click="getCaptcha"
          >
        </div>

        <n-checkbox
          class="mt-20"
          :checked="isRemember"
          label="记住我"
          :on-update:checked="(val) => (isRemember = val)"
        />

        <div class="mt-20 flex items-center">
          <n-button
            class="h-40 flex-1 rounded-5 text-16"
            type="primary"
            ghost
            @click="quickLogin()"
          >
            一键体验
          </n-button>

          <n-button
            class="ml-32 h-40 flex-1 rounded-5 text-16"
            type="primary"
            :loading="loading"
            @click="handleLogin()"
          >
            登录
          </n-button>
        </div>
      </div>
    </div>

    <TheFooter class="py-12" />
  </div>
</template>

<script setup>
import { GET_PARAMETER, GET_TENANTS } from '@/apollo'
import { useAuthStore } from '@/store'
import { lStorage, request, throttle } from '@/utils'
import { useQuery } from '@vue/apollo-composable'
import { useStorage } from '@vueuse/core'
import api from './api'

const authStore = useAuthStore()
const router = useRouter()
const route = useRoute()
const title = import.meta.env.VITE_TITLE

// 获取租户显示配置
const { result: tenantConfigResult } = useQuery(GET_PARAMETER, {
  parameterInput: { parameterKey: 'tenant' },
})

const tenantEnabled = computed(() => {
  const config = tenantConfigResult.value?.findParameter
  return config?.parameterValue === 'true'
})

// 获取租户列表
const { result: tenantsResult } = useQuery(GET_TENANTS, {}, {
  clientId: 'tenant',
})

const tenants = computed(() => {
  const list = tenantsResult.value?.queryTenant || []
  // 添加默认的总部租户
  return [
    { tenantKey: 'master', companyName: '总部' },
    ...list,
  ]
})

// 当前选中的租户
const selectedTenant = ref('master')

const { result: captchaConfigResult } = useQuery(GET_PARAMETER, {
  parameterInput: { parameterKey: 'captcha' },
})

const captchaEnabled = computed(() => {
  const config = captchaConfigResult.value?.findParameter
  return config?.parameterValue === 'true'
})

const loginInfo = ref({
  username: '',
  password: '',
  captcha: '',
  captchaKey: '',
})

const captchaUrl = ref('')
const initCaptcha = throttle(() => {
  const response = `/auth/v1/captcha?${Date.now()}`
  captchaUrl.value = response
}, 500)

/**
 * 获取验证码
 */
async function getCaptcha() {
  if (!captchaEnabled.value)
    return
  initCaptcha()
  const data = await request.get(captchaUrl.value)
  captchaUrl.value = `data:image/gif;base64,${data.captchaImg}`
  loginInfo.value.captchaKey = data.captchaKey
}

const localLoginInfo = lStorage.get('loginInfo')
if (localLoginInfo) {
  loginInfo.value.username = localLoginInfo.username || ''
  loginInfo.value.password = localLoginInfo.password || ''
}

// 监听验证码配置变化，当启用时获取验证码
watch(captchaEnabled, (enabled) => {
  if (enabled) {
    getCaptcha()
  }
}, { immediate: true })

function quickLogin() {
  loginInfo.value.username = 'admin'
  loginInfo.value.password = '123456'
  handleLogin(true)
}

const isRemember = useStorage('isRemember', true)
const loading = ref(false)
async function handleLogin(isQuick) {
  const { username, password, captcha, captchaKey } = loginInfo.value
  if (!username || !password)
    return $message.warning('请输入用户名和密码')
  if (captchaEnabled.value && !isQuick && !captcha)
    return $message.warning('请输入验证码')
  try {
    loading.value = true
    $message.loading('正在验证，请稍后...', { key: 'login' })
    const { accessToken } = await api.login({
      username,
      password: password.toString(),
      captchaKey: captchaEnabled.value ? captchaKey : undefined,
      captcha: captchaEnabled.value ? captcha : undefined,
      isQuick,
    }, {
      headers: {
        'X-TENANT-ID': selectedTenant.value,
      },
    })
    if (isRemember.value) {
      lStorage.set('loginInfo', { username, password })
    }
    else {
      lStorage.remove('loginInfo')
    }
    onLoginSuccess(accessToken)
  }
  catch (error) {
    // 10003为验证码错误专属业务码
    if (error?.code === 10003) {
      // 为防止爆破，验证码错误则刷新验证码
      getCaptcha()
    }
    $message.destroy('login')
    console.error(error)
  }
  loading.value = false
}

async function onLoginSuccess(data = {}) {
  authStore.setToken(data)
  $message.loading('登录中...', { key: 'login' })
  try {
    $message.success('登录成功', { key: 'login' })
    if (route.query.redirect) {
      const path = route.query.redirect
      delete route.query.redirect
      router.push({ path, query: route.query })
    }
    else {
      router.push('/')
    }
  }
  catch (error) {
    console.error(error)
    $message.destroy('login')
  }
}
</script>
