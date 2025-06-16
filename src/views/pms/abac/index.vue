<template>
  <CommonPage>
    <template #action>
      <n-popover trigger="hover" class="ml-40">
        <template #trigger>
          <n-button @click="onClick" type="info" size="small">
            <n-icon size="20">
              <BookInformation20Regular />
            </n-icon>
            查看规则文档
          </n-button>
            <!-- <i class="i-material-symbols:info-outline" /> -->
        </template>
        <span>查看spel文档</span>
      </n-popover>
    </template>
    <n-split
      :resize-trigger-size="1"
      direction="horizontal"
      :max="0.75"
      :size="splitSize"
      :default-size="0.3"
    >
      <template #resize-trigger>
        <div class="w-full h-450 flex items-center justify-center">
          <n-button v-if="splitSize != 0" quaternary size="small" type="primary" @click="zoomOut()">
            <i class="i-material-symbols:switchRight mr-4 text-18" />
          </n-button>
          <n-button v-else size="small" quaternary type="primary" @click="zoomIn()">
            <i class="i-material-symbols:switchLeft mr-4 text-18" />
          </n-button>
        </div>
      </template>
      <template #1>
        <AbacList
          ref="abacListRef"
          v-model:current-abac="currentAbac"
          @select-abac="initAbac"
        >
        </AbacList>
      </template>
      <template v-if="currentAbac" #2>
        <n-scrollbar style="max-height: 600px">
          <div class="flex flex-col w-full">
            <div class="flex justify-between mb-4 ml-20 mr-20">
              <h3 class="mb-12">
                策略详情
              </h3>
              <n-space>
                <n-switch v-model:value="securityExpression.enable" @update:value="handleSwitch" :loading="enableLoading">
                  <template #checked>
                    开启
                  </template>
                  <template #unchecked>
                    关闭
                  </template>
                </n-switch>
                <n-popselect v-model="type" :options="options" trigger="click" @update:value="handleTypeChange">

                  <n-button type="success" size="small">{{ type == 'preAuth' ? '前置' : '后置' }}</n-button>
                </n-popselect>
              </n-space>
            </div>

            <n-descriptions label-style="width: 120px" class="ml-20" label-placement="left" bordered :column="2">
              <n-descriptions-item label="编码">
                  {{ currentAbac.code }}
              </n-descriptions-item>
              <n-descriptions-item label="资源类型">
                <template v-if="action === 'edit'">
                  <n-input v-model:value="editData.resourceType" />
                </template>
                <template v-else>
                  {{ currentAbac.resourceType }}
                </template>
              </n-descriptions-item>
              <n-descriptions-item label="名称">
                  {{ currentAbac.name ?? '--' }}
              </n-descriptions-item>
            </n-descriptions>
          </div>

          <div
            class="flex gap-4 ml-20 mt-20 mr-20"
            :class="splitSize != 0 ? 'flex-col' : 'flex-row'"
          >
            <n-collapse-transition :show="show" class="flex-1 min-w-0">
              <SpelContext
                :type="type"
                v-model:env="env"
                v-model:variable="variable"
                v-model:authentication="authentication"
                v-model:principal="principal"
                :auth-key="currentAbac.code"
              ></SpelContext>
            </n-collapse-transition>

            <n-card title="策略规则" class="flex-1 min-w-0 overflow-hidden" hoverable>
              <template #header-extra>
                <n-space>

                  <n-input :value="result" :disabled="true" placeholder="spel计算结果">
                    <template #prefix>
                      <n-icon>
                        <i class="i-material-symbols:calculate" />
                      </n-icon>
                    </template>
                  </n-input>
                  <n-switch v-model:value="show">
                    <template #checked>
                      展开
                    </template>
                    <template #unchecked>
                      折叠
                    </template>
                  </n-switch>
                  <n-button size="small" type="error" @click="handleRunExpression">
                    <i class="i-material-symbols:playArrow mr-4 text-14" />
                    运行
                  </n-button>
                  <n-button size="small" type="primary" @click="handleSave">
                    <i class="i-material-symbols:save mr-4 text-14" />
                    保存
                  </n-button>
                  <n-button size="small" type="primary" @click="handleRefresh">
                    <i class="i-material-symbols:refresh mr-4 text-14" />
                    刷新缓存
                  </n-button>
                </n-space>
              </template>
              <template #default>
                <SpelEditor
                  ref="$securityEditor"
                  v-model="securityExpression.code"
                  :variables="variable"
                  :env="env"
                  :authentication="authentication"
                  :principal="principal"
                  :height="'280px'"
                />
              </template>
            </n-card>
          </div>

          <!-- <div v-else class="w-full h-450 flex items-center justify-center">
            <n-empty size="large" description="请选择策略查看详情" />
          </div> -->

        </n-scrollbar>
      </template>

    </n-split>
  </CommonPage>
</template>

<script setup>
import { BookInformation20Regular } from '@vicons/fluent'
import { SpelEditor } from '@/components'
import { NButton, NSwitch } from 'naive-ui'
import { ref } from 'vue'
import AbacList from './components/AbacList.vue'
import { useRouter } from 'vue-router'
import SpelContext from './components/SpelContext.vue'
import { useEvaluationContext } from '@/composables'
import { findPolicyRule, savePolicyRule } from './apollo'
import api from './api.js'
import { apolloClients } from '@/utils/graphql'
import { SpelExpressionEvaluator } from 'spel2js'

defineOptions({ name: 'AbacMgt' })

const options = [
  {label: '前置', value: 'preAuth'},
  {label: '后置', value: 'postAuth'},
]

const router = useRouter()

const $securityEditor = ref(null)

const env = ref('{}')
const variable = ref('{}')
const authentication = ref('{}')
const principal = ref('{}')
const type = ref('preAuth')
const show = ref(false)
const action = ref("")
const splitSize = ref(0.4)
const currentAbac = ref(null)
const editData = ref({})
const abacListRef = ref(null)
const securityExpression = ref({
  code: '',
  id: null,
  enable:  true
})
const result = ref("")


async function initAbac(isPreAuth = true) {
  type.value = isPreAuth ? 'preAuth' : 'postAuth'
  securityExpression.value = {
    code: '',
    id: null,
    enable:  true
  }
  result.value = ''
  if (currentAbac.value) {
    // let data = await api.getPolicyRule(currentAbac.value.code, type.value === 'preAuth')
    // securityExpression.value = {
    //   code: data?.condition || '',
    //   id: data?.id,
    //   enable:  data?.id ? data?.enable : true
    // }

    let {data} = await findPolicyRule(currentAbac.value.id, type.value === 'preAuth', 'network-only')
    securityExpression.value = {
      code: data?.findPolicyRule?.condition || '',
      id: data?.findPolicyRule?.id,
      enable:  data?.findPolicyRule?.id ? data?.findPolicyRule?.enable : true
    }
    variable.value = '{}'
  } else {
    const context = useEvaluationContext().context.value
    principal.value = JSON.stringify(context.principal, null, 2)
    authentication.value = JSON.stringify(context.authentication, null, 2)
    env.value = JSON.stringify(context.env, null, 2)
  }
}

initAbac()


const enableLoading = ref(false)

async function handleSwitch(value) {
  try {
    enableLoading.value = true
    await api.saveRule({
      id: securityExpression.value.id,
      condition: securityExpression.value.code,
      preAuth: type.value === 'preAuth',
      enable: securityExpression.value.id ? securityExpression.value.enable : true,
      permissionId: currentAbac.value.id
    })

    enableLoading.value = false

  } catch (error) {
    console.error(error)
    $message.success('保存失败')
    enableLoading.value = false
  }
}

function handleTypeChange(type) {
  initAbac(type === 'preAuth')
}

function handleRunExpression() {
  $securityEditor.value?.debouncedEvalExpression(value => {
    result.value = new String(value)
  })
}

function onClick() {
  console.log('onClick')
  router.push({ path: '/pms/abac/info'})
}

async function handleRefresh() {
  try {
    await api.getPolicyRule(currentAbac.value.code, type.value === 'preAuth')
    $message.success('刷新成功')
  } catch (e) {
    console.error(e)
    $notification.error({
      title: '刷新失败',
      description: 请重新点击刷新缓存按钮
    })
  }
}

async function handleSave() {
  try {
    SpelExpressionEvaluator.compile(securityExpression.value.code)

    await api.saveRule({
      id: securityExpression.value.id,
      condition: securityExpression.value.code,
      preAuth: type.value === 'preAuth',
      enable: securityExpression.value.id ? securityExpression.value.enable : true,
      permissionId: currentAbac.value.id
    })
    // let {data} = await findPolicyRule(currentAbac.value.id, type.value === 'preAuth', 'network-only')
    // // securityExpression.value.id = data.savePolicyRule?.id || null
    // // securityExpression.value.enable = data.savePolicyRule?.enable || false

    // securityExpression.value = {
    //   code: data?.findPolicyRule?.condition || '',
    //   id: data?.findPolicyRule?.id,
    //   enable:  data?.findPolicyRule?.id ? data?.findPolicyRule?.enable : true
    // }

    let {data} = await findPolicyRule(currentAbac.value.id, type.value === 'preAuth', 'network-only')
    securityExpression.value = {
      code: data?.findPolicyRule?.condition || '',
      id: data?.findPolicyRule?.id,
      enable:  data?.findPolicyRule?.id ? data?.findPolicyRule?.enable : true
    }
    // let data = await api.getPolicyRule(currentAbac.value.code, type.value === 'preAuth')
    // securityExpression.value = {
    //   code: data?.condition || '',
    //   id: data?.id,
    //   enable:  data?.id ? data?.enable : true
    // }
    await nextTick()
    $message.success('保存成功')
    handleRefresh()
  } catch (error) {
    console.error(error)
    $message.error('保存失败')
  }
}

function zoomOut() {
  splitSize.value = 0
}

function zoomIn() {
  splitSize.value = 0.4
}

onMounted(() => {
  apolloClients.main.cache.evict({ fieldName: 'findPolicyRuleEntity' })
  apolloClients.main.cache.gc()
})

</script>

<style scoped>
.n-layout-header,
.n-layout-footer {
  background: rgba(128, 128, 128, 0.2);
  padding: 24px;
}

.n-layout-sider {
  background: rgba(128, 128, 128, 0.3);
}

.n-layout-content {
  background: rgba(128, 128, 128, 0.4);
}
</style>
