import { ImageParams } from './types';

/**
 * 计算给定参数所需的字节数
 */
export function calculateRequiredBytes(params: ImageParams): number {
  const bytesPerPixel = Math.ceil(params.bitsPerPixel / 8);
  let channelCount: number;
  switch (params.pixelFormat) {
    case 'rgba':
      channelCount = 4;
      break;
    case 'rgb':
      channelCount = 3;
      break;
    default:
      channelCount = 1;
      break;
  }
  return params.width * params.height * bytesPerPixel * channelCount;
}

/**
 * 验证图像参数是否有效
 */
export function validateImageParams(
  params: ImageParams,
  fileSize: number,
  locale: string = 'en'
): { valid: boolean; error?: string } {
  const lang = String(locale || '').toLowerCase().startsWith('zh') ? 'zh-cn' : 'en';
  const msg = {
    en: {
      invalidWidth: 'Invalid image width (1-32768)',
      invalidHeight: 'Invalid image height (1-32768)',
      invalidBits: 'Invalid bit depth. Supported: 8, 10, 12, 14, 16',
      invalidFormat: 'Invalid pixel format',
      fileTooSmall: (requiredBytes: number, actual: number) =>
        `File too small: need ${requiredBytes} bytes, got ${actual} bytes`,
      fileTooLarge: (expected: number, actual: number) =>
        `Unexpected file size: expected about ${expected} bytes, got ${actual} bytes`,
    },
    'zh-cn': {
      invalidWidth: '图像宽度无效 (1-32768)',
      invalidHeight: '图像高度无效 (1-32768)',
      invalidBits: '位深度无效，支持: 8, 10, 12, 14, 16',
      invalidFormat: '像素格式无效',
      fileTooSmall: (requiredBytes: number, actual: number) =>
        `文件大小不足: 需要 ${requiredBytes} 字节, 实际 ${actual} 字节`,
      fileTooLarge: (expected: number, actual: number) =>
        `文件大小异常: 预期约 ${expected} 字节, 实际 ${actual} 字节`,
    }
  }[lang];

  // 基本参数验证
  if (!params.width || params.width <= 0 || params.width > 32768) {
    return { valid: false, error: msg.invalidWidth };
  }
  
  if (!params.height || params.height <= 0 || params.height > 32768) {
    return { valid: false, error: msg.invalidHeight };
  }
  
  if (!params.bitsPerPixel || ![8, 10, 12, 14, 16].includes(params.bitsPerPixel)) {
    return { valid: false, error: msg.invalidBits };
  }

  if (!params.pixelFormat || !['grayscale', 'rgb', 'rgba', 'rggb', 'grbg', 'gbrg', 'bggr'].includes(params.pixelFormat)) {
    return { valid: false, error: msg.invalidFormat };
  }

  // 计算所需字节数
  const requiredBytes = calculateRequiredBytes(params);

  // 检查文件大小
  if (fileSize < requiredBytes) {
    return { valid: false, error: msg.fileTooSmall(requiredBytes, fileSize) };
  }

  // 检查是否超出合理范围（允许一定冗余）
  const maxAllowedBytes = requiredBytes * 1.5; // 允许50%冗余
  if (fileSize > maxAllowedBytes) {
    return { valid: false, error: msg.fileTooLarge(requiredBytes, fileSize) };
  }

  return { valid: true };
}