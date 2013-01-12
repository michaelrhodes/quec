# Quec /ˈkyuːsi/

A persistent, queryable Object cache built on top of Local Storage.

## Collection

### Creating a new collection

``` js
var library = new Quec("library")
```
  
## Cache

### Adding a cache

``` js
library.add("books")
```

### Adding multiple caches

``` js
library.add(["borrowers", "fines"])
```

### Removing a cache

``` js
library.remove("books")
```

### Removing multiple caches

``` js
library.remove(["borrowers", "fines"])
```
  
## Item

### Adding an item

``` js
library.books.add({
  title: "Of Mice and Men",
  author: "John Steinbeck",
  year: 1937
})
```

### Adding multiple items

``` js
library.books.add([{
  title: "Of Mice and Men",
  author: "John Steinbeck",
  year: 1937
},{
  title: "Vineland",
  author: "Thomas Pynchon",
  year: 1990
},{
  title: "Chimera",
  author: "John Barth",
  year: 1972
}])
```

### Selecting items

Every cache has two methods for selecting items.

#### all(options)

By default, all() will return every item in the cache.

``` js
library.books.all()
```

However, the result set can be augmented with the options: limit, offset, and sort_by.

``` js
library.books.all({
  limit: 2,
  offset: 1,
  sort_by: "year"
})
```

#### where(query, options)

where() expects a query object, but also accepts the above-noted augmentation options.

##### query

A query is an object whose keys match those in the cached items. Any items not containing _all_ query keys will be excluded from the result set. There are three ways to match cached values: **exact**, **regex**, and **range**.

###### exact

``` js
library.books.where({
  author: "Thomas Pynchon"
})
```

###### regex

``` js
library.books.where({
  author: /^John/
})
```

###### range

A range is only used for numeric values and can be specified with a minimum and/or maximum value.

``` js
library.books.where({
  year: { min: 1940, max: 1995 }
})
```

##### options

Like all(), where() allows you to augment the result set with limit, offset, and sort_by.

``` js
library.books.where({
  author: /^John/
},{
  limit: 1,
  offset: 2,
  sort_by: "title"
})
```

### Updating items

By combining the query object from where(), and the data object from add(), it's possible to update the values of multiple items at once.

``` js
library.books.update({
  title: "Chimera"
},{
  author: "(Not) John Barth"
})
```

### Removing items

``` js
library.books.remove({
  year: { max: 1984 }
})
```
