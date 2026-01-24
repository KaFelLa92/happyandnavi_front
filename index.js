/**
 * =========================================
 * 앱 진입점 (index.js)
 * =========================================
 */

import { registerRootComponent } from 'expo';
import App from './App';

// registerRootComponent은 AppRegistry.registerComponent를 호출하고
// 환경에 맞는 처리를 해줍니다.
registerRootComponent(App);
