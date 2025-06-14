let isSPELSuggestions = false

export const setupSPELSuggestions = (monaco) => {

  if (isSPELSuggestions) return

  const createSuggestion = (item, range) => {
    return {
      label: item.label,
      kind: item.kind || monaco.languages.CompletionItemKind.Text,
      documentation: item.documentation,
      detail: item.detail,
      insertText: item.insertText || item.label,
      insertTextRules: item.insertTextRules,
      range: range,
      // 添加filterText和sortText确保更好的匹配
      filterText: item.label.toLowerCase(),
      sortText: item.sortText || item.label
    };
  };

  // 基础SPEL建议
  const baseSuggestions = [
    // 逻辑运算符
    { label: 'and', kind: monaco.languages.CompletionItemKind.Keyword, detail: '逻辑与' },
    { label: 'true', kind: monaco.languages.CompletionItemKind.Keyword, detail: '真' },
    { label: 'false', kind: monaco.languages.CompletionItemKind.Keyword, detail: '假' },
    { label: 'or', kind: monaco.languages.CompletionItemKind.Keyword, detail: '逻辑或' },
    { label: 'not', kind: monaco.languages.CompletionItemKind.Keyword, detail: '逻辑非' },

    // 比较运算符
    { label: 'eq', kind: monaco.languages.CompletionItemKind.Operator, detail: '等于 (==)' },
    { label: 'ne', kind: monaco.languages.CompletionItemKind.Operator, detail: '不等于 (!=)' },
    { label: 'lt', kind: monaco.languages.CompletionItemKind.Operator, detail: '小于 (<)' },
    { label: 'le', kind: monaco.languages.CompletionItemKind.Operator, detail: '小于等于 (<=)' },
    { label: 'gt', kind: monaco.languages.CompletionItemKind.Operator, detail: '大于 (>)' },
    { label: 'ge', kind: monaco.languages.CompletionItemKind.Operator, detail: '大于等于 (>=)' },

    // 特殊构造
    {
      label: 'T()',
      kind: monaco.languages.CompletionItemKind.Function,
      insertText: 'T(${1:fully.qualified.className})',
      documentation: '类型构造函数',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    },
    {
      label: 'new',
      kind: monaco.languages.CompletionItemKind.Keyword,
      insertText: 'new ${1:type}(${2:args})',
      documentation: '创建新实例',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    }
  ];

  // Spring Security 特定建议
  const securitySuggestions = [
    // 认证相关
    {
      label: 'authentication',
      kind: monaco.languages.CompletionItemKind.Variable,
      documentation: '当前认证对象',
      detail: '当前认证对象'
    },
    {
      label: 'principal',
      kind: monaco.languages.CompletionItemKind.Variable,
      documentation: '当前用户主体',
      detail: '当前用户主体'
    },
    {
      label: 'credentials',
      kind: monaco.languages.CompletionItemKind.Variable,
      documentation: '当前凭证',
      detail: '当前凭证'
    },
    {
      label: 'env',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: "env['${1:year}']",
      documentation: '当前环境变量',
      detail: '当前环境变量',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    },

    // 权限检查
    {
      label: 'hasRole()',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'hasRole(${1:roleName})',
      documentation: '检查是否有指定角色',
      detail: '检查是否有指定角色',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    },
    {
      label: 'hasAnyRole()',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'hasAnyRole(${1:role1}, ${2:role2})',
      documentation: '检查是否有任意指定角色',
      detail: '检查是否有任意指定角色',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    },
    {
      label: 'hasAuthority()',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'hasAuthority(${1:authority})',
      documentation: '检查是否有指定权限',
      detail: '检查是否有指定权限',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    },
    {
      label: 'hasAnyAuthority()',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'hasAnyAuthority(${1:auth1}, ${2:auth2})',
      documentation: '检查是否有任意指定权限',
      detail: '检查是否有任意指定权限',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    },
    {
      label: 'isAnonymous()',
      kind: monaco.languages.CompletionItemKind.Method,
      documentation: '检查是否是匿名用户',
      detail: 'Spring Security'
    },
    {
      label: 'isRememberMe()',
      kind: monaco.languages.CompletionItemKind.Method,
      documentation: '检查是否是记住我用户',
      detail: 'Spring Security'
    },
    {
      label: 'isFullyAuthenticated()',
      kind: monaco.languages.CompletionItemKind.Method,
      documentation: '检查是否是完全认证用户',
      detail: 'Spring Security'
    },

    // 访问控制
    {
      label: 'permitAll',
      kind: monaco.languages.CompletionItemKind.Keyword,
      documentation: '允许所有访问',
      detail: 'Spring Security'
    },
    {
      label: 'denyAll',
      kind: monaco.languages.CompletionItemKind.Keyword,
      documentation: '拒绝所有访问',
      detail: 'Spring Security'
    },

    // 安全表达式
    {
      label: 'hasPermission()',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'hasPermission(${1:target}, ${2:permission})',
      documentation: '检查是否有对象权限',
      detail: 'Spring Security',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    },
    {
      label: 'hasIpAddress()',
      kind: monaco.languages.CompletionItemKind.Method,
      insertText: 'hasIpAddress(${1:ipAddress})',
      documentation: '检查IP地址是否匹配',
      detail: 'Spring Security',
      insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
    }
  ];

  // 注册代码提示提供者
  monaco.languages.registerCompletionItemProvider('spel', {
    provideCompletionItems: (model, position) => {
      // 获取当前单词范围
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };

      // 获取当前位置的文本
      const lineContent = model.getLineContent(position.lineNumber);
      const textUntilPosition = lineContent.substring(0, position.column - 1);

      // 检查是否在属性访问后（支持 . 和 ?.）
      const propertyAccessMatch = textUntilPosition.match(/(\w+)(?:\.|\?\.)$/);

      // 合并所有建议并确保有正确的range
      const allSuggestions = [
        ...baseSuggestions,
        ...securitySuggestions
      ].map(item => createSuggestion(item, range));

      return { suggestions: allSuggestions };
    }
  });

  isSPELSuggestions = true;
}

let isSPELHover = false;

export const setupSPELHover = (monaco) => {
  if (isSPELHover) return;
  // 定义 Hover 提示的内容
  const hoverDocs = {
    'authentication': {
      contents: [
        { value: '**authentication**: 当前认证对象' },
        { value: '代表当前登录用户的认证信息，如用户名、权限等。' }
      ]
    },
    'env': {
      contents: [
        { value: '**env**: 环境变量' },
        { value: '代表当前登录环境信息，如时间、地点等。' }
      ]
    },
    'principal': {
      contents: [
        { value: '**principal**: 当前用户主体' },
        { value: '通常是 UserDetails 对象，包含用户名、权限等。' }
      ]
    },
    'credentials': {
      contents: [
        { value: '**credentials**: 当前凭证' },
        { value: '认证过程中提交的密码信息，通常不用于直接显示。' }
      ]
    }
    // 你可以继续添加更多 hover 文档
  };

  monaco.languages.registerHoverProvider('spel', {
    provideHover: function (model, position) {
      const wordInfo = model.getWordAtPosition(position);
      if (!wordInfo) return;

      const word = wordInfo.word;
      if (hoverDocs[word]) {
        return {
          range: new monaco.Range(
            position.lineNumber,
            wordInfo.startColumn,
            position.lineNumber,
            wordInfo.endColumn
          ),
          contents: hoverDocs[word].contents
        };
      }

      return null;
    }
  });
  isSPELHover = true;
};

// 添加上下文变量建议
export const addVariableSuggestions = (monaco, variables) => {
  const variableSuggestions = variables.map(varName => ({
    label: varName,
    kind: monaco.languages.CompletionItemKind.Variable,
    insertText: varName,
    documentation: '上下文变量'
  }));

  monaco.languages.registerCompletionItemProvider('spel', {
    provideCompletionItems: (model, position) => {
      return { suggestions: variableSuggestions };
    }
  });
}


// 在spel-suggestions.js中添加
export const addMethodSuggestions = (monaco, methods) => {
  const methodSuggestions = methods.map(method => ({
    label: method.name,
    kind: monaco.languages.CompletionItemKind.Method,
    insertText: method.insertText || `${method.name}(${method.params.join(', ')})`,
    documentation: method.documentation,
    insertTextRules: monaco.languages.CompletionItemInsertTextRule.InsertAsSnippet
  }));

  monaco.languages.registerCompletionItemProvider('spel', {
    provideCompletionItems: (model, position) => {
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };

      // 获取当前行内容
      const lineContent = model.getLineContent(position.lineNumber);
      const textUntilPosition = lineContent.substring(0, position.column - 1);

      // 如果是角色相关方法，建议角色
      if (textUntilPosition.includes('hasRole') ||
          textUntilPosition.includes('hasAnyRole')) {
        return {
          suggestions: securityRoleSuggestions.map(item => createSuggestion(item, range))
        };
      }

      // 默认返回所有建议
      const allSuggestions = [
        ...baseSuggestions,
        ...securitySuggestions
      ].map(item => createSuggestion(item, range));

      return { suggestions: allSuggestions };
    }
  });
}


let isContextAwareSuggestions = false;
// 在spel-suggestions.js中添加
export const setupContextAwareSuggestions = (monaco) => {

  if (isContextAwareSuggestions) return;
  // 定义对象属性映射
  const objectProperties = {
    'authentication': [
      { name: 'name', type: 'String', desc: '认证名称' },
      { name: 'principal', type: 'Object', desc: '用户主体' },
      { name: 'credentials', type: 'Object', desc: '凭证' },
      { name: 'authorities', type: 'Collection<GrantedAuthority>', desc: '权限集合' },
      { name: 'details', type: 'Object', desc: '认证详情' },
      { name: 'isAuthenticated', type: 'boolean', desc: '是否已认证' }
    ],
    'principal': [
      { name: 'username', type: 'String', desc: '用户名' },
      { name: 'password', type: 'String', desc: '密码(通常为空)' },
      { name: 'enabled', type: 'boolean', desc: '是否启用' },
      { name: 'accountNonExpired', type: 'boolean', desc: '账户是否未过期' },
      { name: 'accountNonLocked', type: 'boolean', desc: '账户是否未锁定' },
      { name: 'credentialsNonExpired', type: 'boolean', desc: '凭证是否未过期' },
      { name: 'authorities', type: 'Collection<GrantedAuthority>', desc: '权限集合' }
    ],
    'credentials': [
      { name: 'toString', type: 'String', desc: '凭证字符串表示' }
    ]
  };

  monaco.languages.registerCompletionItemProvider('spel', {
    triggerCharacters: ['.', '?'],
    provideCompletionItems: (model, position) => {
      const lineContent = model.getLineContent(position.lineNumber);
      const textUntilPosition = lineContent.substring(0, position.column - 1);

      // 获取当前单词范围
      const word = model.getWordUntilPosition(position);
      const range = {
        startLineNumber: position.lineNumber,
        endLineNumber: position.lineNumber,
        startColumn: word.startColumn,
        endColumn: word.endColumn
      };

      // 检测对象属性访问 (如 "authentication.")
      const propertyAccessMatch = textUntilPosition.match(/(\w+)(?:\.|\?\.)$/);
      if (propertyAccessMatch) {
        const objectName = propertyAccessMatch[1];
        if (objectProperties[objectName]) {
          return {
            suggestions: objectProperties[objectName].map(prop => ({
              label: prop.name,
              kind: monaco.languages.CompletionItemKind.Property,
              insertText: prop.name,
              documentation: {
                value: `**${prop.name}**: ${prop.type}\n\n${prop.desc}`,
                isTrusted: true
              },
              detail: `${objectName} 属性`,
              range: range
            }))
          };
        }
      }

      // 原有其他建议逻辑...
      return { suggestions: [] };
    }
  });

  isContextAwareSuggestions = true;
}