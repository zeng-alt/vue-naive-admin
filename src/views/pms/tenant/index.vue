<template>
  <CommonPage>
    <n-split
      :resize-trigger-size="16"
      direction="horizontal"
      :max="0.75"
      :min="0.15"
      :default-size="0.25"
      @update:size="handleSplitResize"
    >
      <template #resize-trigger>
        <div :class="isDark ? 'modern-divider-dark' : 'modern-divider'">
          <div class="divider-handle">
            <div class="handle-indicator">
              <span />
              <span />
              <span />
            </div>
          </div>
        </div>
      </template>

      <template #1>
        <TenantList
          ref="tenantListRef"
          v-model:current-tenant="currentTenant"
          :split-size="splitSize"
          @add="handleAdd"
        />
      </template>

      <template #2>
        <div class="right-panel">
          <n-scrollbar style="max-height: 600px">
            <div v-if="currentTenant" class="w-full flex flex-col">
              <!-- 头部操作区域 -->
              <div class="header-section">
                <div class="title-area">
                  <h3 class="page-title">
                    <i class="i-material-symbols:domain mr-8" />
                    租户详情
                  </h3>
                  <n-tag
                    size="small"
                    :type="currentTenant.status ? 'success' : 'warning'"
                    :bordered="false"
                  >
                    {{ currentTenant.status ? '正常' : '停用' }}
                  </n-tag>
                </div>
                <div class="action-buttons">
                  <n-button
                    v-if="action === 'edit' || action === 'add'"
                    size="small"
                    type="success"
                    class="action-btn"
                    @click="handleSave()"
                  >
                    <i class="i-material-symbols:save mr-4 text-14" />
                    保存
                  </n-button>
                  <n-button
                    v-if="action !== 'edit' && action !== 'add'"
                    size="small"
                    type="primary"
                    class="action-btn"
                    @click="handleEdit()"
                  >
                    <i class="i-material-symbols:edit-outline mr-4 text-14" />
                    编辑
                  </n-button>
                  <n-button
                    v-if="action === 'add' || action === 'edit'"
                    size="small"
                    type="warning"
                    class="action-btn"
                    @click="handleCancel()"
                  >
                    <i class="i-material-symbols:block mr-4 text-14" />
                    取消
                  </n-button>
                  <n-button
                    v-policyRule="{ key: 'TestDataSource', variables: { dataSource: currentTenant.tenantDataSource } }"
                    size="small"
                    type="info"
                    class="action-btn"
                    @click="testDataSource()"
                  >
                    <i class="i-material-symbols:checklist mr-4 text-14" />
                    测试数据源
                  </n-button>
                  <n-button
                    size="small"
                    type="tertiary"
                    class="action-btn"
                    @click="publishDataSource()"
                  >
                    <i class="i-material-symbols:checklist mr-4 text-14" />
                    发布数据源
                  </n-button>
                </div>
              </div>

              <!-- 表单内容 -->
              <div class="content-area">
                <n-form
                  ref="formRef"
                  :model="editData"
                  :rules="rules"
                  label-placement="left"
                  label-width="120"
                  require-mark-placement="right-hanging"
                >
                  <!-- 基本信息 -->
                  <div class="section-card">
                    <div class="section-header">
                      <i class="i-material-symbols:info mr-8" />
                      基本信息
                    </div>
                    <n-descriptions
                      label-style="width: 120px"
                      label-placement="left"
                      bordered
                      :column="2"
                    >
                      <n-descriptions-item label="编码">
                        <template v-if="action === 'add'">
                          <n-input v-model:value="editData.tenantKey" />
                        </template>
                        <template v-else>
                          {{ currentTenant.tenantKey }}
                        </template>
                      </n-descriptions-item>
                      <n-descriptions-item label="企业名称">
                        <template v-if="action === 'edit' || action === 'add'">
                          <n-input v-model:value="editData.companyName" />
                        </template>
                        <template v-else>
                          {{ currentTenant.companyName }}
                        </template>
                      </n-descriptions-item>
                      <n-descriptions-item label="社会信用代码">
                        <template v-if="action === 'edit' || action === 'add'">
                          <n-input v-model:value="editData.licenseNumber" />
                        </template>
                        <template v-else>
                          {{ currentTenant.licenseNumber ?? '--' }}
                        </template>
                      </n-descriptions-item>
                      <n-descriptions-item label="联系人">
                        <template v-if="action === 'edit' || action === 'add'">
                          <n-input v-model:value="editData.contactUserName" />
                        </template>
                        <template v-else>
                          {{ currentTenant.contactUserName ?? '--' }}
                        </template>
                      </n-descriptions-item>
                      <n-descriptions-item label="联系电话">
                        <template v-if="action === 'edit' || action === 'add'">
                          <n-input v-model:value="editData.contactPhone" />
                        </template>
                        <template v-else>
                          {{ currentTenant.contactPhone ?? '--' }}
                        </template>
                      </n-descriptions-item>
                      <n-descriptions-item label="过期时间">
                        <template v-if="action === 'edit' || action === 'add'">
                          <n-date-picker
                            v-model:formatted-value="editData.expireTime"
                            value-format="yyyy-MM-dd HH:mm:ss"
                            type="datetime"
                          />
                        </template>
                        <template v-else>
                          {{ currentTenant.expireTime ?? '--' }}
                        </template>
                      </n-descriptions-item>
                      <n-descriptions-item label="用户数量">
                        <template v-if="action === 'edit' || action === 'add'">
                          <n-input-number v-model:value="editData.accountCount" />
                        </template>
                        <template v-else>
                          {{ currentTenant.accountCount ?? '--' }}
                        </template>
                      </n-descriptions-item>
                      <n-descriptions-item label="租户状态">
                        <template v-if="action === 'edit' || action === 'add'">
                          <n-select
                            v-model:value="editData.status"
                            :options="[{ label: '停用', value: '0' }, { label: '正常', value: '1' }]"
                          />
                        </template>
                        <template v-else>
                          {{ currentTenant.status ? '正常' : '停用' }}
                        </template>
                      </n-descriptions-item>
                      <n-descriptions-item label="地址">
                        <template v-if="action === 'edit' || action === 'add'">
                          <n-input v-model:value="editData.address" />
                        </template>
                        <template v-else>
                          {{ currentTenant.address ?? '--' }}
                        </template>
                      </n-descriptions-item>
                      <n-descriptions-item label="企业简介">
                        <template v-if="action === 'edit' || action === 'add'">
                          <n-input v-model:value="editData.intro" type="textarea" />
                        </template>
                        <template v-else>
                          {{ currentTenant.intro ?? '--' }}
                        </template>
                      </n-descriptions-item>
                    </n-descriptions>
                  </div>

                  <!-- 数据源信息 -->
                  <div class="section-card">
                    <div class="section-header">
                      <i class="i-material-symbols:database mr-8" />
                      租户数据源
                    </div>
                    <n-descriptions
                      label-style="width: 120px"
                      label-placement="left"
                      bordered
                      :column="2"
                    >
                      <n-descriptions-item>
                        <template #label>
                          <QuestionLabel label="数据源db" content="数据库名" />
                        </template>
                        <template v-if="action === 'add'">
                          <n-input v-model:value="editData.tenantDataSource.db" />
                        </template>
                        <template v-else>
                          {{ currentTenant.tenantDataSource?.db ?? '--' }}
                        </template>
                      </n-descriptions-item>
                      <n-descriptions-item label="密码">
                        <template v-if="action === 'edit' || action === 'add'">
                          <n-input v-model:value="editData.tenantDataSource.password" type="password" />
                        </template>
                        <template v-else>
                          {{ '.......' }}
                        </template>
                      </n-descriptions-item>
                      <n-descriptions-item label="模式">
                        <template v-if="action === 'add'">
                          <n-input v-model:value="editData.tenantDataSource.schema" />
                        </template>
                        <template v-else>
                          {{ currentTenant.tenantDataSource?.schema ?? '--' }}
                        </template>
                      </n-descriptions-item>
                      <n-descriptions-item label="mode">
                        <template v-if="action === 'add' || action === 'edit'">
                          <n-select
                            v-model:value="editData.tenantDataSource.mode"
                            :options="[
                              { label: '数据行', value: 'COLUMN' },
                              { label: '数据库', value: 'DATABASE' },
                              { label: '数据schema', value: 'SCHEMA' },
                              { label: '混合', value: 'MIXED' },
                            ]"
                          />
                        </template>
                        <template v-else>
                          {{ currentTenant.tenantDataSource?.mode ?? '--' }}
                        </template>
                      </n-descriptions-item>
                      <n-descriptions-item label="状态">
                        <template v-if="action === 'edit' || action === 'add'">
                          <n-switch v-model:value="editData.tenantDataSource.enabled" />
                        </template>
                        <template v-else>
                          {{ currentTenant.tenantDataSource?.enabled ? '启用' : '禁用' }}
                        </template>
                      </n-descriptions-item>
                    </n-descriptions>
                  </div>
                </n-form>
              </div>
            </div>

            <!-- 空状态 -->
            <div v-else class="empty-state">
              <n-empty size="large" description="请从左侧选择租户查看详情" />
            </div>
          </n-scrollbar>
        </div>
      </template>
    </n-split>
  </CommonPage>
</template>

<script setup>
import { useDark } from '@vueuse/core'
import cloneDeep from 'lodash/cloneDeep'
import { ref } from 'vue'
import { CommonPage, QuestionLabel } from '@/components'
import { useAppStore } from '@/store'
import api from './api'
import { saveTenant } from './apollo'
import TenantList from './components/TenantList.vue'

defineOptions({ name: 'TenantMgt' })
const appStore = useAppStore()
const primaryColor = computed(() => appStore.primaryColor)
const isDark = useDark()

const action = ref('')
const formRef = ref(null)

const rules = {
  'tenantKey': {
    required: true,
    message: '请输入编码',
    trigger: 'blur',
  },
  'companyName': {
    required: true,
    message: '请输入企业名称',
    trigger: 'blur',
  },
  'contactPhone': {
    pattern: /^1[3-9]\d{9}$/,
    message: '请输入正确的手机号码',
    trigger: 'blur',
  },
  'expireTime': {
    required: true,
    message: '请选择过期时间',
    trigger: 'blur',
  },
  'tenantDataSource.db': {
    required: true,
    message: '请输入数据库名',
    trigger: 'blur',
  },
  'tenantDataSource.password': {
    required: true,
    message: '请输入密码',
    trigger: 'blur',
  },
}

const splitSize = ref(0.25)
const currentTenant = ref(null)
const editData = ref({})
const tenantListRef = ref(null)

async function testDataSource() {
  api.testDataSource(currentTenant.value.tenantDataSource?.id)
}

function publishDataSource() {
  // 发布数据源逻辑
}

function handleCancel() {
  action.value = ''
}

function handleAdd() {
  action.value = 'add'
  editData.value = {
    status: '1',
    tenantDataSource: {},
  }
}

async function handleSave() {
  try {
    await formRef.value?.validate()
    await saveTenant(editData.value)
    currentTenant.value = editData.value
    action.value = ''
    $message.success('保存成功')
    tenantListRef.value?.handleSearch()
  }
  catch (error) {
    console.error(error)
    $message.error('保存失败')
  }
}

async function handleEdit() {
  editData.value = cloneDeep(currentTenant.value)
  if (currentTenant.value.tenantDataSource) {
    editData.value.tenantDataSource.password = ''
  }
  else {
    editData.value.tenantDataSource = {}
  }
  action.value = 'edit'
}

function handleSplitResize(size) {
  splitSize.value = size
}
</script>

<style scoped>
/* 现代化分割线样式 */
.modern-divider {
  width: 16px;
  height: 100%;
  background: transparent;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease;
  border-left: 1px solid #e8e8ea;
  border-right: 1px solid #e8e8ea;
}

.modern-divider-dark {
  width: 16px;
  height: 100%;
  background: transparent;
  cursor: col-resize;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  transition: all 0.2s ease;
  border-left: 1px solid #3a3a3c;
  border-right: 1px solid #3a3a3c;
}

/* 分割条手柄 */
.divider-handle {
  width: 100%;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
}

.handle-indicator {
  display: flex;
  flex-direction: column;
  gap: 2px;
  opacity: 0.3;
  transition: all 0.2s ease;
}

.handle-indicator span {
  width: 2px;
  height: 2px;
  border-radius: 50%;
  background: #8e8e93;
  transition: all 0.2s ease;
}

/* 悬停效果 */
.modern-divider:hover {
  border-left-color: #007aff;
  border-right-color: #007aff;
}

.modern-divider-dark:hover {
  border-left-color: #0a84ff;
  border-right-color: #0a84ff;
}

.modern-divider:hover .handle-indicator,
.modern-divider-dark:hover .handle-indicator {
  opacity: 0.8;
}

.modern-divider:hover .handle-indicator span {
  background: #007aff;
  transform: scale(1.5);
}

.modern-divider-dark:hover .handle-indicator span {
  background: #0a84ff;
  transform: scale(1.5);
}

/* 激活状态 */
.modern-divider:active .handle-indicator span,
.modern-divider-dark:active .handle-indicator span {
  background: #0056cc;
  transform: scale(1.2);
}

.modern-divider-dark:active .handle-indicator span {
  background: #0066cc;
}

.right-panel {
  height: 100%;
  background: #ffffff;
  overflow: hidden;
}

/* 头部区域 */
.header-section {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 20px;
  border-bottom: 1px solid #e0e0e6;
  margin-bottom: 0;
}

.title-area {
  display: flex;
  align-items: center;
  gap: 12px;
}

.page-title {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333;
  display: flex;
  align-items: center;
}

.action-buttons {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.action-btn {
  transition: all 0.2s ease;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 3px 8px rgba(0, 0, 0, 0.15);
}

/* 内容区域 */
.content-area {
  padding: 20px;
  flex: 1;
  overflow-y: auto;
}

.section-card {
  background: white;
  border-radius: 12px;
  padding: 20px;
  margin-bottom: 20px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
  border: 1px solid #f0f0f0;
  transition: all 0.2s ease;
}

.section-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
  border-color: #e6f7ff;
}

.section-header {
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  padding-bottom: 8px;
  border-bottom: 2px solid #f0f0f0;
}

/* 空状态 */
.empty-state {
  height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 20px;
  border-radius: 12px;
}

/* 暗色主题适配 */

.dark .right-panel {
  background: #141414;
}

.dark .header-section {
  border-bottom-color: #404040;
}

.dark .section-card {
  background: #1f1f1f;
  border-color: #404040;
}

.dark .section-card:hover {
  border-color: v-bind(primaryColor);
}

.dark .section-header {
  color: #fff;
  border-bottom-color: #404040;
}

.dark .page-title {
  color: #fff;
  border-bottom-color: #404040;
}

.dark .handle-indicator span {
  background: #8e8e93;
}

/* 响应式适配 */
@media (max-width: 768px) {
  .header-section {
    flex-direction: column;
    gap: 16px;
    align-items: stretch;
  }

  .action-buttons {
    justify-content: center;
  }

  .content-area {
    padding: 16px;
  }

  .section-card {
    padding: 16px;
  }
}
</style>
