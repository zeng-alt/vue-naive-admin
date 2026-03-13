<template>
  <div class="custom-split-wrapper">
    <n-split direction="horizontal" style="height: 300px;">
      <template #1>
        <div class="left-pane mr-20">
          左边内容
        </div>
      </template>

      <template #2>
        <div class="right-pane ml-20">
          右边内容
        </div>
      </template>

      <template #resize-trigger>
        <div class="custom-divider" />
      </template>
    </n-split>
  </div>
</template>

<style scoped>
.custom-divider {
  width: 4px;
  background-color: transparent;
  transition: background-color 0.3s;
  height: 100%;
  cursor: col-resize;
}

.custom-divider:hover {
  background-color: rgba(0, 0, 0, 0.2); /* 显示分割条颜色 */
}

/* 左右面板样式 */
.left-pane {
  background-color: #f0f9ff;
  height: 100%;
  padding: 12px;
}

.right-pane {
  background-color: #fff7e6;
  height: 100%;
  padding: 12px;
}
</style>
