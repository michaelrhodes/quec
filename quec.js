;(function() {
	"use strict"
	var helper = {
		local: window.localStorage,
		get: function(cache){ return JSON.parse(helper.local[cache]) },
		match: function(one, two) { return (/RegExp/.test(one.constructor)) ? one.test(two) : one === two },
		set: function(cache) { helper.local[cache.__path__] = JSON.stringify(cache) },
		split: function(string, delimiter) { return helper.trim(string).split(delimiter) },
		trim: function(string) { return string.replace(/\s/g, "") },
		unset: function(cache) { helper.local.removeItem(cache.__path__) },
		is: function(object, type) { return (new RegExp(type, "i")).test(object.constructor.toString()) },
		slug: function(string) { return string.toLowerCase().replace(/[^\s\w]/g, "").replace(/\s{2,}/g, " ").replace(/\s/g, "-") }
	},
	Quec = function(name) {
		// Create collection meta data
		this.name = helper.slug(name)
		return this
	},
	Cache = function(name, db) {
		// Create cache meta data
		this.__ai__ = 0
		this.__path__ = db + "." + name
		// If cache exists in localStorage
		if (!!helper.local[this.__path__]) {
			// Get stored cache
			var cache = helper.get(this.__path__)
			// Copy meta data to new object
			this.__ai__ = cache.__ai__
			// Copy items to new object
			this.each(cache, function(item) {
				this[item.id] = new Item(item.id, item)
			})
		}
	},
	Item = function(id, data) {
		// Create item meta data
		this.id = id
		// Insert data into item
		for (var property in data) {
			if (property != "id") {
				this[property] = data[property]
			}
		}
	}
	Quec.prototype = {
		// Helper method for creating/removing caches
		each: function(caches, callback) {
			for (var n = 0, total = caches.length; n < total; n++) {
				callback.call(this, caches[n])
			}
		},
		// Create a new cache in the collection
		add: function(caches) {
			// Force array
			if (helper.is(caches, "string")) {
				caches = helper.split(caches, ",")
			}
			this.each(caches, function(cache) {
				// Don't overwrite existing caches or the name property
				if (cache != "name" && !this[cache]) {
					this[cache] = new Cache(cache, this.name)
				}
			})
			return this
		},
		// Remove one or more caches from the collection
		remove: function(caches) {
			if (helper.is(caches, "string")) {
				caches = helper.split(caches, ",")
			}
			this.each(caches, function(cache) {
				if (!!this[cache]) {
					helper.unset(this[cache])
					delete this[cache]
				}
			})
			return this
		}
	}
	Cache.prototype = {
		each: function(items, callback) {
			for (var id in items) {
				if (isNaN(id)) continue
				callback.call(this, items[id])
			}
		},
		add: function(items) {
			var cache = this
			// Force array to allow iteration
			if (helper.is(items, "object")) {
				items = [items]
			}
			// Prevent invalid types from blowing up forEach
			if (helper.is(items, "array")) {
				items.forEach(function(item) {
					if (helper.is(item, "object")) {
						var id = cache.__ai__++
						item = new Item(id, item)
						cache[id] = item
					}
				})
			}
			helper.set(this)
			return this
		},
		update: function(query, data) {
			var data_changed = false
			this.each(this.where(query), function(item){
				for (var property in data) {
					if (property != "id" && item[property] !== data[property]) {
						item[property] = data[property]
						data_changed = true
					}
				}
			})
			if (data_changed)
				helper.set(this)
			return this
		},
		all: function(options) {
			return this.where({}, options)
		},
		where: function(query, options) {
			var cache = this,
				// Allow null to be passed in as query
				query = query,
				results = [],
				offset = (!!options) ? options.offset || null : null,
				limit = (!!options) ? options.limit : null,
				sort_by = (!!options) ? options.sort_by : null,
				match = false,
				item,
				item_value,
				query_value,
				inner_query_value
			// For each item in cache
			for (var id in cache) {
				// Skip if key is not an id
				if (isNaN(id))
					continue
				// Cache item
				item = cache[id]
				// Assert that a match is found,
				// then attempt to disprove.
				match = true
				// For each query property
				for (var query_property in query) {
					// Cache values
					item_value = item[query_property]
					query_value = query[query_property]
					// If query value is null
					if (query_value === null) {
						if (item.hasOwnProperty(query_property)) {
							match = false
							break
						}
					}
					// If query value is an Object
					else if (helper.is(query_value, "object")) {
						for (var inner_query_property in query_value) {
							inner_query_value = query_value[inner_query_property]
							if (!item.hasOwnProperty(query_property) || isNaN(item_value) ||
								 (inner_query_property == "min" && item_value < inner_query_value)	||
								 (inner_query_property == "max" && item_value > inner_query_value)) {
								match = false
								break
							}
						}
					}
					// If query value is a string or regular expression
					else if (!item.hasOwnProperty(query_property) || !helper.match(query_value, item_value)) {
						match = false
						break
					}
				}
				// If this item matches the query,
				// store it in the result object
				if (match) {
					results.push(item)
				}
			}
			// Sort results, if required
			if (sort_by !== null) {
				results.sort(function(a, b) {
					a = a[sort_by]
					b = b[sort_by]
					return (!a || !b) ? 0 : (a < b) ? -1 : (a > b) ? 1 : 0
				})
			}
			
			if (!!offset) {
				results = results.splice(offset)
			}
			
			if (!!limit) {
				results = results.splice(0, limit)
			}
			return results
		},
		remove: function(query, properties) {
			var property, n
			this.each(this.where(query), function(item) {
				// Remove entire item
				if (!properties) {
					delete this[item.id]
				}
				// Just remove item properties
				else {
					n = property.length
					while (n--) {
						delete this[item.id][property[n]]
					}
				}
			})
			helper.set(this)
			return this
		}
	}
	window.Quec = Quec
})()
