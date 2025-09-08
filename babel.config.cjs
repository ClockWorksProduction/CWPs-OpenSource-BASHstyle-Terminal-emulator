module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current'
        }
      }
    ]
  ],
  overrides: [
    {
      test: ['./test/**/*.js'],
      presets: [
        [
          '@babel/preset-env',
          {
            modules: false
          }
        ]
      ]
    }
  ]
};