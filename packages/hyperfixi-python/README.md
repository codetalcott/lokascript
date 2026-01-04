# hyperfixi-python

Django and FastAPI integration for HyperFixi hyperscript.

## Installation

```bash
pip install hyperfixi

# With Django
pip install hyperfixi[django]

# With FastAPI
pip install hyperfixi[fastapi]
```

## Django Usage

```python
# settings.py
INSTALLED_APPS = [
    ...
    'hyperfixi.django',
]
```

```html
{% load hyperfixi %}

<button {{ hs("on click toggle .active") }}>Toggle</button>
```

## Template Scanning

Scan templates to generate minimal bundle configurations:

```bash
python manage.py hyperfixi_bundle --output bundle-config.json
```

Then generate the JavaScript bundle:

```bash
cd packages/core
npm run generate:bundle -- --config /path/to/bundle-config.json
```

## License

MIT
