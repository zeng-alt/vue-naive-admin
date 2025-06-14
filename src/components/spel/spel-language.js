let isLanguageRegistered = false;

export const setupSPELLanguage = (monaco) => {
  try {
    if (isLanguageRegistered) return;
    // 检查是否已注册
    if (monaco.languages.getLanguages().some(lang => lang.id === 'spel')) {
      return;
    }
    // 注册SPEL语言
    monaco.languages.register({ id: 'spel' });

    // 设置语法高亮规则
    monaco.languages.setMonarchTokensProvider('spel', {
      defaultToken: '',
      tokenPostfix: '.spel',

      keywords: [
        'and', 'or', 'not', 'null', 'instanceof', 'matches', 'between',
        'div', 'mod', 'eq', 'ne', 'lt', 'le', 'gt', 'ge', 'true', 'false',
        'new', 'T', 'authentication', 'principal', 'this', 'resultObject'
      ],

      operators: [
        '+', '-', '*', '/', '%', '^', '?', ':', '?.', '?:',
        '(', ')', '[', ']', '.', ',', '!', '=', '<', '>', '=='
      ],

      functions: ['hasRole', 'isAuthenticated', 'hasPermission'],

      // 添加自定义方法匹配规则
      methodPattern: /[a-zA-Z_$][\w$]*(?=\s*\()/,

      symbols: /[=><!~?:&|+\-*/^%]+/,

      escapes: /\\(?:[abfnrtv\\"']|x[0-9A-Fa-f]{1,4}|u[0-9A-Fa-f]{4}|U[0-9A-Fa-f]{8})/,

      tokenizer: {
        root: [
          // 添加方法匹配规则
          [/[a-zA-Z_$][\w$]*(?=\s*\()/, 'method'],

          // 标识符和关键字
          [/[a-zA-Z_$][\w$]*/, {
            cases: {
              '@keywords': 'keyword',
              '@default': 'identifier',
              '@functions': 'function'
            }
          }],

          // 空白字符
          { include: '@whitespace' },

          // 分隔符和操作符
          [/[{}()\[\]]/, '@brackets'],
          [/[<>](?!@symbols)/, '@brackets'],
          [/@symbols/, {
            cases: {
              '@operators': 'operator',
              '@default': ''
            }
          }],

          // 数字
          [/\d*\.\d+([eE][\-+]?\d+)?/, 'number.float'],
          [/0[xX][0-9a-fA-F]+/, 'number.hex'],
          [/\d+/, 'number'],

          // 分隔符
          [/[;,.]/, 'delimiter'],

          // 字符串
          [/"([^"\\]|\\.)*$/, 'string.invalid'],
          [/'([^'\\]|\\.)*$/, 'string.invalid'],
          [/"/, 'string', '@string_double'],
          [/'/, 'string', '@string_single'],

          // SPEL特殊符号
          [/#\w+/, 'variable.predefined'],
          [/\$[a-zA-Z_]\w*/, 'variable']
        ],

        whitespace: [
          [/[ \t\r\n]+/, 'white'],
          [/\/\*/, 'comment', '@comment'],
          [/\/\/.*$/, 'comment']
        ],

        comment: [
          [/[^\/*]+/, 'comment'],
          [/\*\//, 'comment', '@pop'],
          [/[\/*]/, 'comment']
        ],

        string_double: [
          [/[^\\"]+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/"/, 'string', '@pop']
        ],

        string_single: [
          [/[^\\']+/, 'string'],
          [/@escapes/, 'string.escape'],
          [/\\./, 'string.escape.invalid'],
          [/'/, 'string', '@pop']
        ]
      }
    });

    // monaco.editor.defineTheme('spelTheme', {
    //   base: 'vs',
    //   inherit: true,
    //   rules: [
    //     { token: 'method', foreground: '#795E26', fontStyle: 'bold' },
    //     { token: 'function', foreground: '#795E26' },
    //     { token: 'keyword', foreground: '#0000FF' },
    //     { token: 'string', foreground: '#A31515' },
    //     { token: 'number', foreground: '#098658' },
    //     { token: 'comment', foreground: '#008000' },
    //     { token: 'operator', foreground: '#000000' },
    //     { token: 'delimiter', foreground: '#000000' },
    //     { token: 'variable', foreground: '#001080' }
    //   ],
    //   colors: {
    //     'editor.background': '#FFFFFF'
    //   }
    // });

    // // 应用主题
    // monaco.editor.setTheme('spelTheme');
    isLanguageRegistered = true
  } catch (error) {
    console.error('SPEL语言设置失败:', error);
    throw error;
  }
}