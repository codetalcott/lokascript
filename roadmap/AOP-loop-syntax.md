Array Oriented Programming (APL, J, K, NumPy) has concepts that align beautifully with natural English and hyperscript's philosophy.
AOP Key Concepts
Implicit iteration - operations apply to all elements without loops
Vectorization - functions work on scalars OR arrays transparently
Broadcasting - operations expand naturally across collections
Filter/Map/Reduce as primitives, not loops
The insight: Hyperscript already has AOP characteristics!
add .highlight to <li/>        -- applies to ALL matching elements!
remove .hidden from .items     -- bulk operation, no loop
toggle .selected on <button/>  -- implicit iteration
These commands already work on collections without explicit loops!
Natural English is often array-oriented
We naturally say:
"Highlight all the items" (not "for each item, highlight it")
"Double the prices" (not "for each price, double it")
"Remove expired entries" (not "for each entry, if expired...")
Possible AOP-inspired syntax
Pattern	Meaning	Style
set items's opacity to 0.5	map property assignment	Possessive broadcast
remove items where expired	filter + action	Where clause
the sum of prices	reduce	Aggregate expression
the names of users	map to property	Projection
sort items by date	ordering	Natural sort
the first 5 of items	slicing	Positional
Comparison
-- Explicit indexed loop (awkward)
repeat for i from 0 to items.length - 1
  set item to items[i]
  put item.name into html
end

-- For-in loop (better)
for item in items
  put item.name into html
end

-- AOP style (best?)
put the names of items into html
-- or --
put items's name into html
Which direction should we explore?
for...in - Familiar, matches _hyperscript, medium effort
AOP extensions - More innovative, more natural, larger scope
Both - for...in for explicit control, AOP for bulk operations
The AOP approach might actually require fewer code changes for common cases since the infrastructure for collection operations exists. 