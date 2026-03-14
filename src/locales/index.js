import { createI18n } from 'vue-i18n'
import { loadLocaleMessages } from '@/utils/common.js'
import { lStorage } from '@/utils'

export const DEFAULT_LOCALE = 'en_US'

export async function setupI18n(app) {
  const savedLocale = lStorage.get('locale') || DEFAULT_LOCALE

  // 仅加载默认语言和当前保存的语言（如果不同）
  const messages = {
    [DEFAULT_LOCALE]: await loadLocaleMessages(DEFAULT_LOCALE),
  }

  if (savedLocale !== DEFAULT_LOCALE) {
    messages[savedLocale] = await loadLocaleMessages(savedLocale)
  }

  const i18n = createI18n({
    legacy: false,
    locale: savedLocale,
    fallbackLocale: DEFAULT_LOCALE,
    messages,
    missing: (locale, key) => key,
    warnHtmlInMessage: 'off',
    missingWarn: false,
    fallbackWarn: false,
  })
  app.use(i18n)
}

export async function setI18nLanguage(i18n, locale) {
  if (i18n.locale.value === locale) {
    return
  }

  // 如果语言包尚未加载，则进行加载
  if (!i18n.availableLocales.includes(locale)) {
    const messages = await loadLocaleMessages(locale)
    i18n.setLocaleMessage(locale, messages)
  }

  i18n.locale.value = locale
  lStorage.set('locale', locale)
  document.querySelector('html').setAttribute('lang', locale)
}
