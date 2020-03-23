module.exports = {
  env: {
    browser: true,
    es6: true
  },
  extends: 'eslint:recommended',
  globals: {
    Page: true,
    wx: true,
    module: true,
    process: true,
    require: true,
    Component: true,
    __dirname: true,
    App: true
  },
  parserOptions: {
    ecmaVersion: 2018,
    sourceType: 'module'
  },
  parser: 'babel-eslint',
  rules: {
    /**
     * ·off 或 0：表示不验证规则,warn 或 1：表示验证规则，当不满足时，给警告。error或 2 ：表示验证规则，不满足时报错
     */
    // 禁止直接使用Object.prototypes 的内置属性
    'no-prototype-builtins': 'off',
    'default-case': 'error',
    //未使用变量
    'no-unused-vars': 'warn',
    // 变量前加修饰符  var let const 等
    'no-undef': 'warn',
    //避免重复类成员
    'no-dupe-class-members': 'error',
    // 禁止重复导入
    'no-duplicate-imports': 'error'
    // 类名首字母大写
    // 'new-cap': 'warn'
  }
}
