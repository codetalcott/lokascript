# Project Wishlist & Long-Term Vision

This document outlines the long-term vision and potential future directions for our integrated Fixi.js and Hyperscript library. While the core goal is to perfect a simple, powerful, and modular tool for web development, the underlying philosophy has the potential to grow far beyond its initial scope.

These ideas represent ambitious but logical extensions that build upon the library's foundation of declarative, HTML-centric design.

---

## 1. Syntactic Sugar for Common Patterns

**Goal:** To make the 80% of common use cases even faster and more intuitive to write by introducing concise, high-level commands that act as shorthands for more verbose patterns.

**Description:** While the core syntax is powerful, we can improve developer ergonomics by adding aliases for frequent actions. This preserves the single-attribute model but reduces cognitive load.

**Proposed Commands:**

* **`load`:** A shorthand for fetching and swapping content.
  * **Example:** `on click load /content into #target`
  * **Expands to:** `on click fetch /content and put it into #target`

* **`post`:** A shorthand for submitting forms via POST.
  * **Example:** `on submit post to /save`
  * **Expands to:** `on submit fetch /save with method:'POST', body:formToJSON(me)`

* **`poll`:** A declarative way to set up polling.
  * **Example:** `poll /updates every 10s`
  * **Expands to:** `init repeat every 10s fetch /updates and replace me`

---

## 2. Declarative Real-Time Communication

**Goal:** To make building real-time features (live notifications, chat, etc.) as simple as adding a few attributes, integrating SSE, WebSockets, and Web Transport as first-class citizens.

**Description:** We will treat real-time server messages just like user events (`click`) or lifecycle events (`load`). A parent element will declare a persistent connection, and child elements will listen for messages.

**Proposed Syntax:**

* **`sse-connect="<url>"`:** Establishes a one-way Server-Sent Events stream.
  * **Listener:** `on sse:eventName ...`
  * **Example:** `<div data-script="on sse:news prepend it to me"></div>`

* **`ws-connect="<url>"`:** Establishes a two-way WebSocket connection.
  * **Listener:** `on ws:message ...`
  * **Sender:** A `ws-send` attribute on a form to send its data over the socket.
  * **Example:** `<form ws-send data-script="on submit clear my <input/>">...</form>`

---

## 3. Model-Context Protocol (MCP) Integration

**Goal:** To support complex server responses that can update multiple, independent parts of the page from a single request, by implementing the client-side of MCP.

**Description:** While our event-based patterns can achieve multi-swap, explicitly supporting MCP would offer a more declarative, server-centric alternative. The library would parse `multipart/mixed` responses and swap content into named views.

**Proposed Syntax:**

* **Client-side Targeting:** Use a `data-view` attribute to name regions.
  * `<main data-view="main-content">...</main>`
  * `<div data-view="cart-badge">(2)</div>`

* **Server-side Response:** The server sends a `multipart/mixed` response with `MCP-Target` headers, which the library automatically routes to the correct `data-view`.

    ```http
    --boundary
    MCP-Target: main-content

    <p>Item added!</p>
    --boundary
    MCP-Target: cart-badge

    <span>(3)</span>
    --boundary--
    ```

---

## 4. Internationalization (i18n): A Global Syntax

**Goal:** To make the library's natural-language syntax accessible to developers globally, allowing them to write logic in their native language.

**Description:** This would be achieved via a keyword aliasing system. A developer could load a locale file that maps the core English commands to their language's equivalents.

**Example:** A developer could load a Spanish locale and write:

```html
<button data-script="al hacer-click obtener /item/1 y ponerlo en #details">
  Ver Artículo
</button>
```

This feature would lower the barrier to entry and foster a global community around the library.

---

## 5. Agent-Oriented AI Integration

**Goal:** To evolve the library from a UI tool into a premier runtime for a new generation of AI-native applications, where the client interacts with an LLM-powered backend.

**Description:** We will introduce a new, high-level `ask` command designed for communicating with AI. The AI server can then respond with a structured JSON-based MCP "UI patch" that the client applies, enabling complex, reasoned, multi-part UI updates from a single natural language prompt.

**Proposed Syntax:**

* **Client-side `ask` command:**

    ```html
    <button data-script="on click ask '/ai/analyze' with
                          about: '#report',
                          prompt: 'Summarize this and extract KPIs.'
                        then
                          apply mcp from it">
      Analyze with AI
    </button>
    ```

* **Server-side JSON MCP Response:**

    ```json
    {
      "operations": [
        { "op": "swap", "target": "summary-view", "content": "<p>...</p>" },
        { "op": "swap", "target": "kpi-widget", "content": "<div>...</div>" },
        { "op": "event", "name": "analysisComplete", "detail": { ... } }
      ]
    }
    ```

This positions the project at the cutting edge, providing the ideal client-side tooling for the next generation of intelligent, conversational web applications.

---

## 6. Defer until later: Mobile Extension (Hyperview Model)

**Goal:** To extend the same declarative syntax to native mobile development, allowing teams to use a single, unified paradigm for both web and mobile UIs.

**Description:** Inspired by Hyperview, this would involve creating a separate runtime for a platform like React Native. The server would send an abstract description of the UI (like HXML or our JSON MCP), and the native runtime would translate it into native components (`<View>`, `<Text>`). The `data-script` attribute would work as expected, but its commands would manipulate native component state instead of the DOM.

**Example:**

```xml
<screen>
  <view>
    <button data-script="on press fetch /api/data then showToast('Data loaded')">
      <text>Load Native Data</text>
    </button>
  </view>
</screen>
```

This would enable a truly write-once (the server logic and syntax patterns) and render-anywhere (web or native) architecture.
