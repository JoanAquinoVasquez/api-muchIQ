module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@constants': './src/constants',
            '@services': './src/services',
            '@hooks': './src/hooks',
            '@navigation': './src/navigation',
            '@types': './src/types',
          }
        }
      ]
    ]
  };
};