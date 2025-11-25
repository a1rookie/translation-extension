import type { SupportedLanguage } from '../types';

export class LanguageDetector {
  /**
   * 简单的语言检测（基于字符类型）
   */
  detect(text: string): SupportedLanguage {
    // 中文检测
    if (/[\u4e00-\u9fa5]/.test(text)) {
      return 'zh';
    }
    
    // 日文检测（平假名、片假名）
    if (/[\u3040-\u309f\u30a0-\u30ff]/.test(text)) {
      return 'ja';
    }
    
    // 韩文检测
    if (/[\uac00-\ud7af]/.test(text)) {
      return 'ko';
    }
    
    // 俄文检测（西里尔字母）
    if (/[\u0400-\u04ff]/.test(text)) {
      return 'ru';
    }
    
    // 默认英文
    return 'en';
  }

  /**
   * 获取目标语言（如果源语言是中文，翻译成英文；否则翻译成中文）
   */
  getTargetLanguage(sourceLang: SupportedLanguage, defaultTarget: string = 'zh'): string {
    if (sourceLang === 'zh') {
      return 'en';
    }
    return defaultTarget;
  }
}
