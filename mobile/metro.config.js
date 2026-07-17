// metro.config.js
const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// ── Shim các thư viện web/node-only không chạy được trên React Native ──────
// css-tree được kéo vào bởi: react-native-qrcode-svg → qrcode dependency chain
// css-tree tự dùng relative import '../node' mà Metro không resolve được
config.resolver.resolveRequest = (context, moduleName, platform) => {
  const fromPath = context.originModulePath || '';

  // Chặn toàn bộ css-tree package import
  if (moduleName === 'css-tree') {
    return { filePath: path.resolve(__dirname, 'shims/empty.js'), type: 'sourceFile' };
  }

  // Chặn relative import '../node' bên trong css-tree
  if (moduleName === '../node' && fromPath.includes('css-tree')) {
    return { filePath: path.resolve(__dirname, 'shims/empty.js'), type: 'sourceFile' };
  }

  // Chặn bất kỳ module nào từ css-tree require relative path chứa '/node'
  if (fromPath.includes(`node_modules${path.sep}css-tree`) && moduleName.endsWith('/node')) {
    return { filePath: path.resolve(__dirname, 'shims/empty.js'), type: 'sourceFile' };
  }

  // Fallback về resolver mặc định
  return context.resolveRequest(context, moduleName, platform);
};

// Thêm extraNodeModules để map trực tiếp (backup layer)
config.resolver.extraNodeModules = {
  ...config.resolver.extraNodeModules,
  'css-tree': path.resolve(__dirname, 'shims/empty.js'),
};

module.exports = config;
