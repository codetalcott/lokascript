# Lite Bundle Language Aliases

This directory contains keyword alias files for internationalizing the lite/lite-plus bundles.

## Usage

```html
<script src="lokascript-lite-plus.js"></script>
<script>
  // Add Spanish aliases at runtime
  lokascript.addAliases({
    alternar: 'toggle',
    agregar: 'add',
    quitar: 'remove',
    poner: 'put',
    establecer: 'set',
    esperar: 'wait',
    enviar: 'send',
    mostrar: 'show',
    ocultar: 'hide',
    incrementar: 'increment',
    decrementar: 'decrement',
    enfocar: 'focus',
    desenfocar: 'blur',
    ir: 'go',
    tomar: 'take',
    añadir: 'append',
  });

  // Now Spanish keywords work
  // <button _="en clic alternar .activo">Toggle</button>
</script>
```

## Creating a Language Bundle

To create a pre-bundled language variant:

1. Create an alias file (e.g., `es.ts`):

```typescript
// aliases/es.ts
export const SPANISH_COMMAND_ALIASES: Record<string, string> = {
  alternar: 'toggle',
  agregar: 'add',
  quitar: 'remove',
  // ... full list
};

export const SPANISH_EVENT_ALIASES: Record<string, string> = {
  clic: 'click',
  cambiar: 'change',
  enviar: 'submit',
  // ... full list
};
```

2. Create a bundle entry point:

```typescript
// browser-bundle-lite-plus-es.ts
import { SPANISH_COMMAND_ALIASES, SPANISH_EVENT_ALIASES } from './aliases/es';

// Merge aliases before export
Object.assign(COMMAND_ALIASES, SPANISH_COMMAND_ALIASES);
Object.assign(EVENT_ALIASES, SPANISH_EVENT_ALIASES);

// ... rest of lite-plus bundle
```

## Available Alias Files

| File    | Language | Commands | Events |
| ------- | -------- | -------- | ------ |
| `es.ts` | Spanish  | 16       | 8      |
| `tr.ts` | Turkish  | 16       | 8      |
| `ja.ts` | Japanese | 16       | 8      |

## Alias Mappings

### Command Aliases

| English   | Spanish     | Turkish     | Japanese   |
| --------- | ----------- | ----------- | ---------- |
| toggle    | alternar    | değiştir    | トグル     |
| add       | agregar     | ekle        | 追加       |
| remove    | quitar      | kaldır      | 削除       |
| put       | poner       | koy         | 置く       |
| set       | establecer  | ayarla      | 設定       |
| wait      | esperar     | bekle       | 待つ       |
| send      | enviar      | gönder      | 送る       |
| show      | mostrar     | göster      | 表示       |
| hide      | ocultar     | gizle       | 非表示     |
| increment | incrementar | artır       | 増加       |
| decrement | decrementar | azalt       | 減少       |
| focus     | enfocar     | odakla      | フォーカス |
| blur      | desenfocar  | odaktan çık | ぼかす     |
| go        | ir          | git         | 行く       |
| take      | tomar       | al          | 取る       |
| append    | añadir      | ekle        | 追加       |

### Event Aliases

| English | Spanish | Turkish | Japanese |
| ------- | ------- | ------- | -------- |
| click   | clic    | tıklama | クリック |
| change  | cambiar | değişim | 変更     |
| submit  | enviar  | gönder  | 送信     |
| load    | cargar  | yükle   | 読込     |
| keydown | tecla   | tuş     | キー押下 |

## Size Impact

Adding a language adds approximately:

- ~200-300 bytes (gzipped) per language for runtime aliases
- ~0 bytes if loaded at runtime via `addAliases()`
