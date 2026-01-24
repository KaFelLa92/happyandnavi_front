/**
 * Babel 설정 파일
 * 
 * 모듈 경로 별칭(alias) 설정을 포함합니다.
 * @components, @screens 등의 별칭으로 import가 가능합니다.
 */
module.exports = function(api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // React Native Reanimated 플러그인 (애니메이션용)
      'react-native-reanimated/plugin',
      // 모듈 경로 별칭 설정
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@components': './src/components',
            '@screens': './src/screens',
            '@services': './src/services',
            '@utils': './src/utils',
            '@hooks': './src/hooks',
            '@context': './src/context',
            '@assets': './src/assets',
            '@styles': './src/styles',
            '@constants': './src/constants',
            '@navigation': './src/navigation',
          },
        },
      ],
    ],
  };
};
