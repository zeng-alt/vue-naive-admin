<template>
  <n-card hoverable>

    <n-tabs
      type="card"
      size="small"
      v-model:value="currentFileName"
    >
      <template #suffix>
        <n-button size="tiny" type="warning" @click="formatJson">格式化json</n-button>
      </template>
      <n-tab-pane
        v-for="file in files"
        :key="file"
        :name="file"
        :tab="file"
      >
        <MonacoEditor
          :theme="theme"
          height="300px"
          v-model:value="code"
          language="json"
        />
      </n-tab-pane>
    </n-tabs>
  </n-card>
</template>

<script setup>
import { useDark } from '@vueuse/core'
import MonacoEditor from '@guolao/vue-monaco-editor';

// --------- Props & Emits ---------
const props = defineProps({
  type: { type: String, default: 'preAuth', required: true },
  authKey: { type: String, required: true },
  // this: { type: String, default: {} },
  // returnObject: { type: String, default: '{}' },
  env: { type: String, default: '{}' },
  variable: { type: String, default: '{}' },
  authentication: { type: String, default: '{}' },
  principal: { type: String, default: '{}' },
});

const emit = defineEmits([
  'update:env',
  'update:variable',
  'update:authentication',
  'update:principal',
]);

// --------- 编辑器设置 ---------
const isDark = useDark();
const theme = computed(() => (isDark.value ? 'vs-dark' : 'vs'));

const files = ['env', 'variable', 'authentication', 'principal', 'this', 'returnObject'];
const currentFileName = ref('env');

const fileContents = ref({
  env: props.env,
  variable: props.variable,
  authentication: props.authentication,
  principal: props.principal,
});

const code = ref(fileContents.value[currentFileName.value]);

watch(
  () => props.variable,
  (newVal) => {
    fileContents.value.variable = newVal;
    code.value = fileContents.value[currentFileName.value]
  }
);

function formatJson() {
  try {
    code.value = JSON.stringify(JSON.parse(code.value), null, 2);
  } catch (error) {
    $message.error('JSON 格式错误');
    console.error('JSON 格式错误:', error);
  }
}

// 当切换标签页时，更新编辑器内容
watch(currentFileName, (newVal) => {
  code.value = fileContents.value[newVal];
});

// 当编辑器内容变化时，更新本地缓存，并 emit 给父组件
watch(code, (newCode) => {
  const key = currentFileName.value;
  fileContents.value[key] = newCode;
  emit(`update:${key}`, newCode);
});
</script>