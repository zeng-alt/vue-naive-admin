<!--------------------------------
 - @Author: Ronnie Zhang
 - @LastEditor: Ronnie Zhang
 - @LastEditTime: 2024/04/01 15:51:34
 - @Email: zclzone@outlook.com
 - Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 --------------------------------->

 <template>
  <div>
    <n-space vertical :size="12">
      <div class="flex justify-between items-center">
        <h3>graphql服务</h3>
        <div class="flex items-center">
          <NButton class="ml-12" size="small" :disabled="!currentMenu" type="error" @click="handleCancelAuthorization()">
            <i v-if="currentMenu" class="i-material-symbols:delete-outline mr-4 text-14" />
            取消授权
          </NButton>
          <NButton
            size="small"
            class="ml-12"
            :disabled="!currentMenu"
            type="primary"
            @click="handleAuthorization()"
          >
            <i v-if="currentMenu" class="i-line-md:confirm-circle mr-4 text-14" />
            授权
          </NButton>
        </div>
      </div>
      <n-tree
        :show-irrelevant-nodes="false"
        :pattern="pattern"
        :data="treeData"
        :selected-keys="[currentMenu?.code]"
        :on-update:selected-keys="onSelect"
        key-field="code"
        label-field="name"

        block-line default-expand-all
      />
    </n-space>
    <GraphqlRole ref="roleModalRef" />
  </div>

</template>

<script setup>
import GraphqlRole from './GraphqlRole.vue'

const props = defineProps({
  treeData: {
    type: Array,
    default: () => [],
  },
  currentMenu: {
    type: Object,
    default: () => null,
  },
})

const emit = defineEmits(['update:currentMenu'])

const roleModalRef = ref(null)
const pattern = ref('')

function handleCancelAuthorization() {
  roleModalRef.value?.handleOpen({
    action: 'cancelAuthorize',
    type: 'service',
    title: `${props.currentMenu.code}服务取消授权`,
    service: `/${props.currentMenu.code}/graphql`,
  })
}

function handleAuthorization() {
  roleModalRef.value?.handleOpen({
    action: 'authorize',
    type: 'service',
    title: `${props.currentMenu.code}服务授权`,
    service: `/${props.currentMenu.code}/graphql`,
  })
}

function onSelect(keys, option, { action, node }) {
  emit('update:currentMenu', action === 'select' ? node : null)
}

</script>