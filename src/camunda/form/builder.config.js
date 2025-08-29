
import { defineConfig, ja_JP, nl_NL, en_US} from '@vueform/builder'
import {loadLocaleMessages} from '@/utils/common'
// You might place this anywhere else in your project
import '@vueform/builder/vueform.css';

const messages = await loadLocaleMessages('zh_CN')


export default defineConfig({

    expressions: {
        enabled: true,
    },
    builderLocales: {
        ja_JP, nl_NL,
        zh_CN: messages.form,
        en_US,
    },
    locales: {
        en: 'English',
        zh_CN: 'Chinese',
        ja: 'Japanese',
        nl: 'Dutch',
    },
    import: true
})

