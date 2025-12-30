# hyperfixi-python

Django 6.0 and FastAPI integration for HyperFixi.

## Quick Start

```bash
# Run tests
python3 -m pytest tests/ -v

# Install for development
pip install -e ".[dev]"

# With Django support
pip install -e ".[django]"

# With FastAPI support
pip install -e ".[fastapi]"
```

## Package Structure

```
hyperfixi/
├── core.py              # hs(), hs_attr(), escape_hyperscript()
├── validator.py         # Basic regex validation (Tier 1)
├── cli_validator.py     # Node.js CLI validation (Tier 2)
├── behaviors.py         # BehaviorRegistry, @behavior decorator
├── django/
│   ├── templatetags/hyperfixi.py  # {% hs %}, {% hs_behaviors %}
│   ├── context_processors.py      # Common scripts
│   └── management/commands/       # hyperfixi_check command
└── fastapi/
    └── jinja.py         # Jinja2 extension
```

## Key APIs

```python
# Core function - variable substitution with HTML escaping
from hyperfixi import hs
script = hs("on click fetch /api/user/{id}", id=123)

# Behavior decorator - register reusable hyperscript
from hyperfixi import behavior

@behavior("Removable")
def removable():
    """on click remove me"""

# Validation
from hyperfixi import validate, validate_basic
result = validate_basic("on click toggle .active")
```

## Django Usage

```python
# settings.py
INSTALLED_APPS = ['hyperfixi.django']
TEMPLATES[0]['OPTIONS']['context_processors'].append(
    'hyperfixi.django.context_processors.hyperscript'
)
```

```html
{% load hyperfixi %}
<button {% hs %}on click toggle .active{% endhs %}>Toggle</button>
{% hs_behaviors %}
```

## FastAPI Usage

```python
from hyperfixi.fastapi import setup_jinja
setup_jinja(templates)
```

```html
<button {{ hs("on click toggle .active") }}>Toggle</button>
```

## Validation Tiers

1. **Tier 1 (Basic)**: Pure Python regex (~80% error detection)
2. **Tier 2 (Full)**: Node.js CLI via `npx hyperfixi validate`

Falls back gracefully: Tier 2 → Tier 1 if Node.js unavailable.
