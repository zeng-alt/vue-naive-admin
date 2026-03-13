import dayjs from 'dayjs'
import { StandardContext } from 'spel2js'
// composables/useSpelContext.js
import { computed } from 'vue'
import { useUserStore } from '@/store'

// 获取客户端真实IP
function getClientIP() {
  // 从请求头中获取IP
  const headers = window.performance?.getEntriesByType('resource')?.[0]?.requestHeaders
  if (headers) {
    // 优先获取 X-Forwarded-For
    const forwardedFor = headers['x-forwarded-for']
    if (forwardedFor) {
      return forwardedFor.split(',')[0].trim()
    }
    // 其次获取 X-Real-IP
    const realIP = headers['x-real-ip']
    if (realIP) {
      return realIP
    }
  }
  // 如果都获取不到，返回空字符串
  return ''
}

// 缓存客户端IP
const clientIP = getClientIP()

// 获取当前环境变量
function getEnvVariables() {
  const now = dayjs()
  // const now = dayjs().format('YYYY-MM-DD HH:mm:ss');
  return {
    now,
    year: now.year(),
    month: now.month() + 1, // 月份从 0 开始
    day: now.date(),
    hour: now.hour(),
  }
}

export function useEvaluationContext() {
  const userStore = useUserStore()

  const context = computed(() => {
    const principal = userStore.getUser()
    const env = getEnvVariables()

    const authentication = {
      authenticated: true,
      details: {
        remoteAddress: clientIP,
        sessionId: null,
      },
      authorities: [],
      principal,
    }

    const standardContext = StandardContext.create(authentication, principal)
    standardContext.env = env

    return standardContext
  })

  return {
    context,
  }
}
