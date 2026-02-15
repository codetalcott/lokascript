/**
 * Declarative Playwright Code Mappings
 *
 * Maps BDD keywords (multilingual) to Playwright code templates.
 * Templates use ${target}, ${value}, and ${expected} placeholders.
 *
 * Languages: EN, ES, JA, AR, KO, ZH, TR, FR
 */

// =============================================================================
// Types
// =============================================================================

export interface StateMapping {
  /** BDD state keywords that trigger this mapping (all languages) */
  keywords: string[];
  /** Playwright assertion template. Use ${target} placeholder. */
  template: string;
}

export interface ActionMapping {
  /** BDD action keywords that trigger this mapping (all languages) */
  keywords: string[];
  /** Playwright action template. Use ${target} and ${value} placeholders. */
  template: string;
}

export interface AssertionMapping {
  /** BDD assertion keywords that trigger this mapping (all languages) */
  keywords: string[];
  /** Playwright assertion template. Use ${target} and ${expected} placeholders. */
  template: string;
}

// =============================================================================
// GIVEN State Mappings
// =============================================================================

export const STATE_MAPPINGS: StateMapping[] = [
  {
    keywords: ['exists', 'existe', '存在', 'موجود', '존재', 'mevcut', 'existe'],
    template: "  await expect(page.locator('${target}')).toBeAttached();",
  },
  {
    keywords: ['visible', '表示', 'ظاهر', '표시', '可见', 'görünür'],
    template: "  await expect(page.locator('${target}')).toBeVisible();",
  },
  {
    keywords: ['hidden', 'oculto', '非表示', 'مخفي', '숨김', '隐藏', 'gizli', 'caché'],
    template: "  await expect(page.locator('${target}')).toBeHidden();",
  },
  {
    keywords: ['loaded', 'cargado', '読込', 'محمل', '로드됨', '加载', 'yüklü', 'chargé'],
    template: "  await page.waitForLoadState('domcontentloaded');",
  },
  {
    keywords: [
      'disabled',
      'deshabilitado',
      '無効',
      'معطل',
      '비활성',
      '禁用',
      'devre dışı',
      'désactivé',
    ],
    template: "  await expect(page.locator('${target}')).toBeDisabled();",
  },
  {
    keywords: ['enabled', 'habilitado', '有効', 'مفعل', '활성', '启用', 'etkin', 'activé'],
    template: "  await expect(page.locator('${target}')).toBeEnabled();",
  },
  {
    keywords: ['checked', 'marcado', 'チェック済み', 'محدد', '체크됨', '选中', 'işaretli', 'coché'],
    template: "  await expect(page.locator('${target}')).toBeChecked();",
  },
  {
    keywords: [
      'focused',
      'enfocado',
      'フォーカス',
      'مركز',
      '포커스',
      '聚焦',
      'odaklanmış',
      'focalisé',
    ],
    template: "  await expect(page.locator('${target}')).toBeFocused();",
  },
];

// =============================================================================
// WHEN Action Mappings
// =============================================================================

export const ACTION_MAPPINGS: ActionMapping[] = [
  {
    keywords: ['click', 'clicked', 'clic', 'クリック', 'نقر', '클릭', '点击', 'tıkla', 'tıklama'],
    template: "  await page.locator('${target}').click();",
  },
  {
    keywords: ['type', 'typed', 'escribir', '入力', 'كتابة', '입력', '输入', 'yaz', 'saisir'],
    template: "  await page.locator('${target}').fill('${value}');",
  },
  {
    keywords: ['hover', 'sobrevolar', 'ホバー', 'تحويم', '호버', '悬停', 'survol'],
    template: "  await page.locator('${target}').hover();",
  },
  {
    keywords: ['navigate', 'navegar', '移動', 'انتقال', '이동', '导航', 'git', 'naviguer'],
    template: "  await page.goto('${value}');",
  },
  {
    keywords: ['submit', 'enviar', '送信', 'إرسال', '제출', '提交', 'gönder', 'soumettre'],
    template: "  await page.locator('${target}').press('Enter');",
  },
  {
    keywords: [
      'double-click',
      'doble-clic',
      'ダブルクリック',
      'نقر-مزدوج',
      '더블클릭',
      '双击',
      'çift-tıkla',
      'double-clic',
    ],
    template: "  await page.locator('${target}').dblclick();",
  },
  {
    keywords: [
      'right-click',
      'clic-derecho',
      '右クリック',
      'نقر-يمين',
      '우클릭',
      '右击',
      'sağ-tıkla',
      'clic-droit',
    ],
    template: "  await page.locator('${target}').click({ button: 'right' });",
  },
  {
    keywords: ['press', 'presionar', 'キー', 'ضغط', '키', '按', 'bas', 'appuyer'],
    template: "  await page.keyboard.press('${value}');",
  },
  {
    keywords: ['check', 'marcar', 'チェック', 'تحديد', '체크', '勾选', 'işaretle', 'cocher'],
    template: "  await page.locator('${target}').check();",
  },
  {
    keywords: [
      'uncheck',
      'desmarcar',
      'チェック解除',
      'إلغاء-تحديد',
      '체크해제',
      '取消勾选',
      'işareti-kaldır',
      'décocher',
    ],
    template: "  await page.locator('${target}').uncheck();",
  },
  {
    keywords: ['select', 'seleccionar', '選択', 'اختيار', '선택', '选择', 'seç', 'sélectionner'],
    template: "  await page.locator('${target}').selectOption('${value}');",
  },
  {
    keywords: ['wait', 'esperar', '待機', 'انتظار', '대기', '等待', 'bekle', 'attendre'],
    template: "  await page.locator('${target}').waitFor();",
  },
  {
    keywords: ['clear', 'limpiar', 'クリア', 'مسح', '지우기', '清除', 'temizle', 'effacer'],
    template: "  await page.locator('${target}').clear();",
  },
  {
    keywords: ['focus', 'enfocar', 'フォーカス', 'تركيز', '포커스', '聚焦', 'odakla', 'focaliser'],
    template: "  await page.locator('${target}').focus();",
  },
];

// =============================================================================
// THEN Assertion Mappings
// =============================================================================

export const ASSERTION_MAPPINGS: AssertionMapping[] = [
  {
    keywords: ['visible', '表示', 'ظاهر', '표시', '可见', 'görünür'],
    template: "  await expect(page.locator('${target}')).toBeVisible();",
  },
  {
    keywords: ['hidden', 'oculto', '非表示', 'مخفي', '숨김', '隐藏', 'gizli', 'caché'],
    template: "  await expect(page.locator('${target}')).toBeHidden();",
  },
  {
    keywords: ['text', 'texto', 'テキスト', 'نص', '텍스트', '文本', 'metin', 'texte'],
    template: "  await expect(page.locator('${target}')).toHaveText('${expected}');",
  },
  {
    keywords: ['count', 'cantidad', '数', 'عدد', '수', '数量', 'sayı', 'nombre'],
    template: "  await expect(page.locator('${target}')).toHaveCount(${expected});",
  },
  {
    keywords: ['value', 'valor', '値', 'قيمة', '값', '值', 'değer', 'valeur'],
    template: "  await expect(page.locator('${target}')).toHaveValue('${expected}');",
  },
  {
    keywords: ['contains', 'contiene', '含む', 'يحتوي-على', '포함', '包含', 'içerir', 'contient'],
    template: "  await expect(page.locator('${target}')).toContainText('${expected}');",
  },
  {
    keywords: [
      'disabled',
      'deshabilitado',
      '無効',
      'معطل',
      '비활성',
      '禁用',
      'devre dışı',
      'désactivé',
    ],
    template: "  await expect(page.locator('${target}')).toBeDisabled();",
  },
  {
    keywords: ['enabled', 'habilitado', '有効', 'مفعل', '활성', '启用', 'etkin', 'activé'],
    template: "  await expect(page.locator('${target}')).toBeEnabled();",
  },
  {
    keywords: ['checked', 'marcado', 'チェック済み', 'محدد', '체크됨', '选中', 'işaretli', 'coché'],
    template: "  await expect(page.locator('${target}')).toBeChecked();",
  },
  {
    keywords: [
      'focused',
      'enfocado',
      'フォーカス',
      'مركز',
      '포커스',
      '聚焦',
      'odaklanmış',
      'focalisé',
    ],
    template: "  await expect(page.locator('${target}')).toBeFocused();",
  },
];
