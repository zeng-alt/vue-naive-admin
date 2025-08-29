<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/16 18:50:10
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <n-breadcrumb>
    <n-breadcrumb-item v-if="!breadItems?.length" :clickable="false">
      {{t(route.meta.title, route.meta.title)}}
    </n-breadcrumb-item>
    <n-breadcrumb-item
      v-for="(item, index) of breadItems"
      v-else
      :key="item.code"
      :clickable="!!item.path"
      @click="handleItemClick(item)"
    >
      <n-dropdown
        :options="index < breadItems.length - 1 ? getDropOptions(item.children) : []"
        @select="handleDropSelect"
      >
        <div class="flex items-center">
          <i :class="item.icon" class="mr-8" />
          {{t(item.name, item.name)}}
        </div>
      </n-dropdown>
    </n-breadcrumb-item>
  </n-breadcrumb>
</template>

<script setup>
import { usePermissionStore } from '@/store'

import { useI18n } from 'vue-i18n'

const { t } = useI18n()

const router = useRouter()
const route = useRoute()
const permissionStore = usePermissionStore()

const breadItems = ref([])
watch(
  () => route.name,
  (v) => {
    breadItems.value = findMatchs(permissionStore.permissions, v)
  },
  { immediate: true },
)

function findMatchs(tree, code, parents = []) {
  for (const item of tree) {
    if (item.code === code) {
      return [...parents, item]
    }
    if (item.children?.length) {
      const found = findMatchs(item.children, code, [...parents, item])
      if (found) {
        return found
      }
    }
  }
  return null
}

function handleItemClick(item) {
  if (item.path && item.code !== route.name) {
    router.push(item.path)
  }
}

function getDropOptions(list = []) {
  return list
    .filter(item => item.show)
    .map(child => ({
      label: t(child.name),
      key: child.code,
      icon: () => h('i', { class: child.icon }),
    }))
}

function handleDropSelect(code) {
  if (code && code !== route.name) {
    router.push({ name: code })
  }
}
</script>
