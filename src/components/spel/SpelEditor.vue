<template>
  <div class="spel-editor-container">
    <MonacoEditor
      v-model:value="code"
      language="spel"
      :theme="theme"
      :options="editorOptions"
      :height="height"
      :width="width"
      @mount="handleEditorMount"
    />
  </div>
</template>

<script setup>
import { computed, ref, onBeforeUnmount, watch } from 'vue';
import { useDark } from '@vueuse/core'
import MonacoEditor from '@guolao/vue-monaco-editor';
import * as monaco from 'monaco-editor';
import { StandardContext, SpelExpressionEvaluator } from 'spel2js'
import { setupSPELLanguage } from './spel-language.js';
import { setupSPELSuggestions, setupContextAwareSuggestions, setupSPELHover } from './spel-suggestions.js';
import { debounce } from '@/utils/common.js';

// 声明 props
const props = defineProps({
  modelValue: String,
  authentication: {
    type: String,
    default: '{}',
  },
  principal: {
    type: String,
    default: '{}',
  },
  variables: {
    type: String,
    default: '{}',
  },

  env: {
    type: String,
    default: '{}',
  },
  height: {
    type: String,
    default: '100%'
  },
  width: {
    type: String,
    default: '100%'
  }
});

// 声明 emits
const emit = defineEmits(['update:modelValue']);

// 响应式变量
const code = ref(props.modelValue);

watch(
  () => props.modelValue,
  (newVal) => {
    code.value = newVal
  }
);

const isDark = useDark();
const theme = computed(() => isDark.value ? 'vs-dark' : 'vs');

// 编辑器选项
const editorOptions = {
  automaticLayout: true,
  fontSize: 14,
  minimap: { enabled: true },
  wordWrap: 'on',
  roundedSelection: true,
  scrollBeyondLastLine: false,
  hover: {
    above: false,
    enabled: true,
    optional: true
  },
  suggest: {
    preview: true,
    showMethods: true,
    showFunctions: true,
    showConstructors: true,
    showFields: true,
    showVariables: true,
    showClasses: true,
    showStructs: true,
    showInterfaces: true,
    showModules: true,
    showProperties: true,
    showEvents: true,
    showOperators: true,
    showUnits: true,
    showValues: true,
    showConstants: true,
    showEnums: true,
    showEnumMembers: true,
    showKeywords: true,
    showWords: true,
    showColors: true,
    showFiles: true,
    showReferences: true,
    showFolders: true,
    showTypeParameters: true,
    showSnippets: true
  }
};

// 在编辑器组件中添加
const evalExpression = () => {
  try {
    if (!code.value) {
      console.warn("表达式为空")
      return null;

    }
    const standardContext = StandardContext.create(JSON.parse(props.authentication), JSON.parse(props.principal))
    standardContext.env = JSON.parse(props.env)
    const compiled = SpelExpressionEvaluator.compile(code.value)
    // 这里可以添加实际的SPEL验证逻辑
    const result = compiled.eval(standardContext, JSON.parse(props.variables));
    console.log('表达式运行通过:', result);
    return result;
  } catch (error) {
    console.error('表达式运行错误:', error);
    $message.error('表达式运行错误: ' + error.message);
    return undefined;
  }
};

// 创建一个防抖版本的表达式求值函数
const debouncedEvalExpression = (callback) => {
  debounce(() => {
    const result = evalExpression();
    if (callback) callback(result);
  }, 500, true)();
};

const editorInstance = ref(null);

let spelRegistered = false;

// 挂载时的回调
const handleEditorMount = (editor) => {
  editorInstance.value = editor;

  try {
    // 初始化 SPEL 支持

    if (!spelRegistered) {
      setupSPELLanguage(monaco);
      setupSPELSuggestions(monaco);
      setupSPELHover(monaco);
      setupContextAwareSuggestions(monaco);
      spelRegistered = true;
    }

    // 监听内容变化
    editor.onDidChangeModelContent(() => {
      code.value = editor.getValue();
      emit('update:modelValue', code.value);
    });

    // Ctrl + Space 快捷建议
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Space, () => {
      editor.trigger('', 'editor.action.triggerSuggest', '');
    });

    console.log('SPEL编辑器已成功加载');
  } catch (error) {
    console.error('编辑器初始化错误:', error);
  }
};

// 卸载时清理资源
onBeforeUnmount(() => {
  console.log('准备卸载 SPEL 编辑器');
  setTimeout(() => {
    if (editorInstance.value) {
      editorInstance.value.dispose();
      editorInstance.value = null;
    }
    console.log('已清理 SPEL 编辑器');
  }, 0);
});

watch(() => props.modelValue, (newVal) => {
  if (editorInstance.value && newVal !== code.value) {
    editorInstance.value.setValue(newVal);
  }
}, { flush: 'post' });


defineExpose({
  evalExpression,
  debouncedEvalExpression
})
</script>

<style scoped>
.spel-editor-container {
  width: 100%;
  height: 100%;
  border: 1px solid #ddd;
  border-radius: 4px;
  overflow: hidden;
}
</style>