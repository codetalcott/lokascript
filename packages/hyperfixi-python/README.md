# lokascript-python

Django and FastAPI integration for LokaScript hyperscript.

## Installation

```bash
pip install lokascript

# With Django
pip install lokascript[django]

# With FastAPI
pip install lokascript[fastapi]
```

## Django Usage

```python
# settings.py
INSTALLED_APPS = [
    ...
    'lokascript.django',
]
```

```html
{% load lokascript %}

<button {{ hs("on click toggle .active") }}>Toggle</button>
```

## Template Scanning

Scan templates to generate minimal bundle configurations:

```bash
python manage.py lokascript_bundle --output bundle-config.json
```

Then generate the JavaScript bundle:

```bash
cd packages/core
npm run generate:bundle -- --config /path/to/bundle-config.json
```

## License

MIT
