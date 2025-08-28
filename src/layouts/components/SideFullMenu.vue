<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2023/12/16 18:50:35
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

<template>
  <div class="side-menu-container">
  <n-menu
    ref="menu"
    class="side-menu"
    accordion
    :indent="18"
    v-if="!appStore.collapsed"
    :options="permissionStore.menus"
    :value="activeKey"
    @update:value="handleMenuSelect"
  />
  <!-- 折叠状态下的自定义菜单 -->
  <div v-else class="collapsed-menu">
      <div
        v-for="item in permissionStore.menus"
        :key="item.key"
        class="collapsed-menu-item"
        :class="{ 'collapsed-menu-item--disabled': item.disabled }"
      >
        <!-- 有子菜单的项目 -->
        <template v-if="item.children && item.children.length > 0">
          <!-- 父菜单未禁用时，使用下拉菜单 -->
          <n-dropdown
            v-if="!item.disabled"
            trigger="hover"
            :options="item.children"
            :inverted="inverted"
            placement="right-start"
            :show-arrow="true"
            @select="handleMenuSelect"
          >
            <div class="collapsed-menu-content">
              <div class="collapsed-menu-icon">
                <component v-if="item.icon" :is="item.icon" />
              </div>
              <div class="collapsed-menu-label">
                <n-ellipsis style="max-width: 70px; font-size: 10px;">
                  {{ item.label.length > 6 ? item.label.substring(0, 6) : item.label }}
                </n-ellipsis>
              </div>
            </div>
          </n-dropdown>
          <!-- 父菜单禁用时，显示工具提示（如果名称长）或直接显示 -->
          <template v-else>
            <n-tooltip
              v-if="item.label.length > 6"
              trigger="hover"
              :delay="300"
              placement="right"
            >
              <template #trigger>
                <div class="collapsed-menu-content disabled">
                  <div class="collapsed-menu-icon">
                    <component v-if="item.icon" :is="item.icon" />
                  </div>
                  <div class="collapsed-menu-label">
                    <n-ellipsis style="max-width: 70px; font-size: 10px;">
                      {{ item.label }}
                    </n-ellipsis>
                  </div>
                </div>
              </template>
              <span>{{ item.label }}</span>
            </n-tooltip>
            <div
              v-else
              class="collapsed-menu-content disabled"
            >
              <div class="collapsed-menu-icon">
                <component v-if="item.icon" :is="item.icon" />
              </div>
              <div class="collapsed-menu-label">
                <n-ellipsis style="max-width: 70px; font-size: 10px;">
                  {{ item.label }}
                </n-ellipsis>
              </div>
            </div>
          </template>
        </template>
        <!-- 没有子菜单的项目 -->
        <template v-else>
          <!-- 菜单名很长的项目，使用工具提示显示完整名称 -->
          <n-tooltip
            v-if="item.label.length > 6"
            trigger="hover"
            :delay="300"
            placement="right"
          >
            <template #trigger>
              <div
                class="collapsed-menu-content"
                :class="{ 'disabled': item.disabled }"
                @click="!item.disabled && handleMenuSelect(item.key, item)"
              >
                <div class="collapsed-menu-icon">
                  <component v-if="item.icon" :is="item.icon" />
                </div>
                <div class="collapsed-menu-label">
                  <n-ellipsis style="max-width: 70px; font-size: 10px;">
                    {{ item.label }}
                  </n-ellipsis>
                </div>
              </div>
            </template>
            <span>{{ item.label }}</span>
          </n-tooltip>
          <!-- 菜单名不长的项目，直接显示 -->
          <div
            v-else
            class="collapsed-menu-content"
            :class="{ 'disabled': item.disabled }"
            @click="!item.disabled && handleMenuSelect(item.key, item)"
          >
            <div class="collapsed-menu-icon">
              <component v-if="item.icon" :is="item.icon" />
            </div>
            <div class="collapsed-menu-label">
              <n-ellipsis style="max-width: 70px; font-size: 10px;">
                {{ item.label }}
              </n-ellipsis>
            </div>
          </div>
        </template>
      </div>
  </div>
</div>
</template>

<script setup>

import { useAppStore, usePermissionStore } from '@/store'
import { isExternal } from '@/utils'
import { NEllipsis, NDropdown, NTooltip } from "naive-ui";
import { ref, computed } from 'vue'
import { useRoute, useRouter } from 'vue-router'

const route = useRoute()
const router = useRouter()
const appStore = useAppStore()
const permissionStore = usePermissionStore()

const activeKey = computed(() => route.meta?.parentKey || route.name)

const inverted = ref(false);

const menu = ref(null)
watch(route, async () => {
  await nextTick()
  menu.value?.showOption()
})

function handleMenuSelect(key, item) {
  if (isExternal(item?.originPath)) {
    $dialog.confirm({
      type: 'info',
      title: `请选择打开方式`,
      positiveText: '外链打开',
      negativeText: '在本站内嵌打开',
      confirm() {
        window.open(item?.originPath)
      },
      cancel: () => {
        router.push(item.path)
      },
    })
  }
  else {
    if (!item.path)
      return
    router.push(item.path)
  }
}
</script>

<style>
.side-menu:not(.n-menu--collapsed) {
  .n-menu-item-content {
    &::before {
      left: 8px;
      right: 8px;
    }
    &.n-menu-item-content--selected::before {
      border-left: 4px solid rgb(var(--primary-color));
    }
  }
}


.collapsed-menu {
  padding: 8px 0;
}

.collapsed-menu-item {
  margin: 4px 8px;
}

.collapsed-menu-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 12px 8px;
  cursor: pointer;
  transition: background-color 0.3s ease;
  border-radius: 6px;
}

.collapsed-menu-content:hover:not(.disabled) {
  background-color: rgba(0, 0, 0, 0.05);
}

.collapsed-menu-content.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.collapsed-menu-icon {
  margin-bottom: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.collapsed-menu-label {
  text-align: center;
  line-height: 1.2;
  width: 100%;
}

/* 暗色主题下的样式 */
.n-layout-sider--inverted .collapsed-menu-content:hover:not(.disabled) {
  background-color: rgba(255, 255, 255, 0.1);
}

/* 下拉菜单样式调整 */
:deep(.n-dropdown-menu) {
  min-width: 160px;
}

.side-menu-container {
  height: 100%;
}
</style>
