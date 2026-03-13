/**********************************
 * @Author: Ronnie Zhang
 * @LastEditor: Ronnie Zhang
 * @LastEditTime: 2023/12/13 20:54:36
 * @Email: zclzone@outlook.com
 * Copyright © 2023 Ronnie Zhang(大脸怪) | https://isme.top
 **********************************/

export const defaultLayout = 'normal'

// export const defaultPrimaryColor = '#316C72'

export const defaultPrimaryColor = '#722ED1FF'

// 控制 LayoutSetting 组件是否可见
export const layoutSettingVisible = true

export const naiveThemeOverrides = {
  common: {
    primaryColor: '#316C72FF',
    primaryColorHover: '#316C72E3',
    primaryColorPressed: '#2B4C59FF',
    primaryColorSuppl: '#316C72E3',
  },
}

export const basePermissions = [
  {
    code: 'ExternalLink',
    name: '外链(可内嵌打开)',
    type: 'MENU',
    icon: 'i-fe:external-link',
    order: 98,
    enable: true,
    show: true,
    children: [
      {
        code: 'ShowDocs',
        name: '项目文档',
        type: 'MENU',
        path: 'https://isme.top',
        icon: 'i-me:docs',
        order: 1,
        enable: true,
        show: true,
      },
      {
        code: 'ApiFoxDocs',
        name: '接口文档',
        type: 'MENU',
        path: 'https://apifox.com/apidoc/shared-ff4a4d32-c0d1-4caf-b0ee-6abc130f734a',
        icon: 'i-me:apifox',
        order: 2,
        enable: true,
        show: true,
        keepAlive: true,
      },
      {
        code: 'NaiveUI',
        name: 'Naive UI',
        type: 'MENU',
        path: 'https://www.naiveui.com/zh-CN/os-theme',
        icon: 'i-me:naiveui',
        order: 3,
        enable: true,
        show: true,
      },
      {
        code: 'MyBlog',
        name: '博客-掘金',
        type: 'MENU',
        path: 'https://juejin.cn/user/1961184475483255/posts',
        icon: 'i-simple-icons:juejin',
        order: 4,
        enable: true,
        show: true,
      },
      {
        code: 'Form',
        name: 'router.dynamicForm',
        type: 'MENU',
        path: '/form',
        component: '/src/views/camunda/form/index.vue',
        icon: 'i-simple-icons:juejin',
        order: 4,
        enable: true,
        show: true,
      },
      {
        code: 'Bpmn',
        name: 'bpmn',
        keepAlive: true,
        type: 'MENU',
        path: '/bpmn',
        component: '/src/views/camunda/bpmn/index.vue',
        icon: 'i-simple-icons:juejin',
        order: 4,
        enable: true,
        show: true,
      },
      {
        code: 'dmn',
        name: 'dmn',
        type: 'MENU',
        meta: { keepAlive: true },
        path: '/dmn',
        component: '/src/views/camunda/dmn/index.vue',
        icon: 'i-simple-icons:juejin',
        order: 4,
        enable: true,
        show: true,
      },
    ],
  },
]
