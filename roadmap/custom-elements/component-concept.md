There’s only one web API for executing JavaScript code when a particular tag appears on a page, and that’s the Custom Elements API.

Anything else is much more fiddly. We could try to use a MutationObserver, as does Stimulus and many other libraries looking for special attributes contained within HTML, but that’s a much harder prospect. We could require some kind of JavaScript code to call a function explicitly in order to process a chunk of incoming HTML, but that would require a tighter coupling between action processing and whatever code is pulling down HTML in the first place.

Here’s the great thing about web component technology: we know it will work anywhere, anytime. Literally the moment a custom HTML tag shows up in some DOM somewhere, our client-side connectedCallback function will execute. This turns out to be the perfect mechanism for what I am calling Action Web Components.

Similar to how an HTML Web Component in popular parlance is a custom element which wraps standard HTML and applies interactivity to those child elements when rendered on a page, an Action Web Component performs a one-time operation when it’s rendered on the page and then (not always but typically) removes itself from the DOM upon completion. These actions don’t themselves have any visual appearance—they aren’t content, but commands.

It’s telling that Turbo Stream Actions are built using the custom elements API. In that case, there’s one tag—<turbo-stream>—which is responsible for reading in attributes and using that data to determine which action to execute. We’re however going to go a step further in our quest to stay close-to-the-metal: we’ll stick with a simple 1:1 action type == tag name nomenclature, using an ac prefix.

Let’s explore our first example.

Example Action: Class Toggle

Let’s say in response to a particular event on the frontend (say, a button click), you want to add a class to an element on the page with a certain ID.

Here’s how that would look in HTML, the idea being that this could be directly rendered out in a response via a fragment (or it could live embedded in a larger template partial).:

<ac-toggle-class target="checkmark-12345" classname="success"></ac-toggle-class>
and this is how we would define the action in JavaScript as a web component:

customElements.define("ac-toggle-class", class extends ActionWebComponent {
  connectedCallback() {
    let force = this.getAttribute("force") || undefined
    if (force) {
      force = force == "true"
    }

    this.target.classList.toggle(this.getAttribute("classname"), force)
    this.remove()
  }
})
Our ActionWebComponent base class is extremely minimal, merely providing a few convenience methods such as using this.target to refer to the DOM element with the ID matching the tag’s target attribute. As you can see here, we get the CSS class via the classname attribute and then either toggle it by default or force it on or off via the presence of force="true" or force="false" attributes. The custom element removes itself as soon as it runs, leaving behind no trace in the DOM upon completion.

And…that’s it! It seems almost too simple to be true. Literally any place you might write <ac-toggle-class> in your codebase, your HTML now has the power to affect your UI.

There are numerous other such actions we could imagine…actions such as updating some HTML element with new children, scrolling to an element, focusing on an element, redirecting to another page after a short delay, or displaying a message in an alert.