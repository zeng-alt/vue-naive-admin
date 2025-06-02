<template>
  <CommonPage>

    <n-split
      :resize-trigger-size="1"
      direction="horizontal"
      :max="0.75"
      :min="0.15"
      :default-size="0.25"
      @update:size="handleSplitResize"
    >
      <template #resize-trigger>

        <div class="w-full h-450 flex items-center justify-center">
          <n-icon>
            <i class="i-fa:ArrowSplit20Filled mr-4 text-14" />
          </n-icon>
        </div>

      </template>
      <template #1>
        <TenantList ref="tenantListRef" v-model:current-tenant="currentTenant" @add="handleAdd" :split-size="splitSize"></TenantList>
      </template>
      <template #2>
        <n-scrollbar style="max-height: 600px">
          <div v-if="currentTenant" class="flex flex-col w-full">
            <div class="flex justify-between mb-4 ml-20">
              <h3 class="mb-12">
                租户详情
              </h3>
              <div class="flex gap-16">
                <NButton size="small" v-if="action === 'edit' || action === 'add'" type="success" @click="handleSave()">
                  <i class="i-material-symbols:save mr-4 text-14" />
                  保存
                </NButton>
                <NButton size="small" v-if="action != 'edit' && action != 'add'" type="primary" @click="handleEdit()">
                  <i class="i-material-symbols:edit-outline mr-4 text-14" />
                  编辑
                </NButton>
                <NButton size="small" v-if="action === 'add' || action === 'edit'" type="warning" @click="handleCancel()">
                  <i class="i-material-symbols:block mr-4 text-14" />
                  取消
                </NButton>
                <NButton size="small" type="info" @click="testDataSource()">
                  <i class="i-material-symbols:checklist mr-4 text-14" />
                  测试数据源
                </NButton>
                <NButton size="small" type="tertiary" @click="publishDataSource()">
                  <i class="i-material-symbols:checklist mr-4 text-14" />
                  发布数据源
                </NButton>
              </div>
            </div>
            <n-descriptions label-style="width: 120px" class="ml-20" label-placement="left" bordered :column="2">
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
                  <n-input v-model:value="editData.companyName" :rule="required"/>
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
                  <n-date-picker v-model:formatted-value="editData.expireTime" value-format="yyyy-MM-dd HH:mm:ss" type="datetime" />
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
                  <n-select v-model:value="editData.status" :options="[{ label: '停用', value: '0' }, { label: '正常', value: '1' }]" />
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
                  <n-input type="textarea" v-model:value="editData.intro" />
                </template>
                <template v-else>
                  {{ currentTenant.intro ?? '--' }}
                </template>
              </n-descriptions-item>
            </n-descriptions>
            <div class="flex justify-between mb-4 ml-20 mt-20">
              <h3 class="mb-12">
                租户数据源
              </h3>
            </div>
            <n-descriptions class="mb-4 ml-20" label-style="width: 120px" label-placement="left" bordered :column="2">
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
                  <n-input v-model:value="editData.tenantDataSource.password" />
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

          <div v-else class="w-full h-450 flex items-center justify-center">
            <n-empty size="large" description="请选择租户查看详情" />
          </div>
      </n-scrollbar>
      </template>

    </n-split>
  </CommonPage>

</template>

<script setup>
import TenantList from './components/TenantList.vue';
import { CommonPage, QuestionLabel } from '@/components';
import { ref } from 'vue'
import { saveTenant } from './apollo'
import cloneDeep from 'lodash/cloneDeep'

defineOptions({ name: 'TenantMgt' })

const action = ref("")

const required = {
  required: true,
  message: '此为必填项',
  trigger: ['blur', 'change'],
}

const splitSize = ref(0.25)

const currentTenant = ref(null)

const editData = ref({})

const tenantListRef = ref(null)


function testDataSource() {

}

function publishDataSource() {

}

function handleCancel() {
  action.value = ''
}

function handleAdd() {
  action.value = 'add'
  editData.value = {
    status: '1',
    tenantDataSource: {}
  }
}

async function handleSave() {
  try {
    await saveTenant(editData.value)
    currentTenant.value = editData.value
    action.value = ''
    $message.success('保存成功')
    tenantListRef.value?.handleSearch()
  } catch (error) {
    console.error(error)
      $message.error('保存失败')
  }
}

async function handleEdit() {
  editData.value = cloneDeep(currentTenant.value)
  if (currentTenant.value.tenantDataSource) {
    editData.value.tenantDataSource.password = '' // 密码字段示例处理
  } else {
    editData.value.tenantDataSource = {}
  }
  action.value = 'edit'
}

function handleSplitResize(size) {
  splitSize.value = size
}

const data =  [{
  id: 1,
  whateverLabel: 'Tenant 1',
}]
</script>