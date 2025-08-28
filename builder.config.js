
import { defineConfig, ja_JP, nl_NL} from '@vueform/builder'
import ch from './public/locales/zh_CN'
// You might place this anywhere else in your project
import '@vueform/builder/vueform.css';


export default defineConfig({
    expressions: {
        enabled: true,
    },
    builderLocales: {
        ja_JP, nl_NL,
        zh_CN: ch,
    },
    locales: {
        en: 'English',
        zh_CN: 'Chinese',
        ja: 'Japanese',
        nl: 'Dutch',
    },
    import: true
})

