// // src/services/firebaseService.js
// /**
// https://chatgpt.com/c/68355d05-48d0-8011-a330-30eed58df7d4
//  * limit(int)
//  * skip(int)
//  * where(field, op, value) - where(filed, value)
//  * get()
//  * first()
//  * paginate(page, perPage)
//  * insert(json)
//  * update(id, json)
//  * delete(id)
//  * when(active, (q) => q.where("status", "==", "active"))
//  * for method example
//     const names = ["Alice", "Bob"];
//     for(names, (q, name) => q.where("name", "==", name))


// firebaseService("users")
//   .where("role", "admin")
//   .orderBy("createdAt", "desc")
//   .populate(["profileRef", "profileRef.countryRef"])
//   .hasMany("posts")
//   .onSnapshot((users) => {
//     console.log("Live users:", users);
//   });

// await firebaseService("users")
//   .insert({ name: "Alice" })
//   .ref("profiles", { bio: "Engineer" })
//   .ref("profiles.addresses", { city: "NYC" });

// await firebaseService("users")
//   .update("user123", { name: "Updated Name" })
//   .ref("profiles", { bio: "Senior Dev" });





// Basic Where Clauses
// ✔️ where($column, $operator = null, $value = null, $boolean = 'and')
// ❓orWhere(...)
// ❓whereBetween($column, array $values)
// ❓orWhereBetween(...)
// ❓whereNotBetween(...)
// ❓whereIn($column, array $values)
// ❓orWhereIn(...)
// ❓whereNotIn(...)
// ❓orWhereNotIn(...)
// ❓whereNull($column)
// ❓orWhereNull(...)
// ❓whereNotNull($column)
// ❓orWhereNotNull(...)
// ❓whereDate($column, $operator, $value)
// ❓whereMonth($column, $operator, $value)
// ❓whereDay($column, $operator, $value)
// ❓whereYear($column, $operator, $value)
// ❓whereTime($column, $operator, $value)
// ❓whereColumn($column, $operator, $value)
// ❓orWhereColumn(...)

// Advanced Where Clauses
// ❓whereExists(Closure $callback)
// ❓whereHas($relation, Closure $callback)
// ❓whereDoesntHave($relation, Closure $callback)
// ❓has($relation)
// ❓doesntHave($relation)
// ❓withCount($relation)

// Ordering and Limiting
// ❓orderBy($column, $direction = 'asc')
// ❓inRandomOrder()
// ❓latest($column = 'created_at')
// ❓oldest($column = 'created_at')
// ✔️limit($value)
// ❓offset($value)
// ✔️skip($value) (alias of offset)
// ❓take($value) (alias of limit)

// Joins
// ❓join($table, $first, $operator, $second)
// ❓leftJoin(...)
// ❓rightJoin(...)
// ❓crossJoin(...)

// Aggregation
// ❓count()
// ❓max($column)
// ❓min($column)
// ❓avg($column)
// ❓sum($column)

// Insert / Update / Delete
// ✔️insert(array $data)
// ❓insertGetId(array $data)
// ✔️update(array $values)
// ✔️delete()
// ❌truncate()

// Upserts
// ❌updateOrInsert(array $attributes, array $values = [])
// ❌upsert(array $values, array $uniqueBy, array $update = null)

// Retrieving Results
// ✔️get()
// ✔️first()
// ❌firstOrFail()
// ❌find($id)
// ❌findOrFail($id)
// ❌pluck($column)
// ❌value($column)
// ❓exists()
// ❓doesntExist()

// Pagination
// paginate($perPage = 15)
// ❌simplePaginate($perPage = 15)
// ❌cursorPaginate($perPage = 15)

// Raw Expressions
// ❓selectRaw($expression)
// ❓whereRaw($expression)
// ❌havingRaw($expression)
// ❓orderByRaw($expression)

// Scopes (Eloquent)
// ❌scopeActive($query) → used via $query->active() in your model

// With Relationships (Eloquent)
// ❌with($relations)
// ❌load($relations)
// ❌withCount($relations)
// 
// */

import { db } from "../firebase";
import {
  collection,
  doc,
  addDoc,
  setDoc,
  updateDoc,
  deleteDoc,
  getDocs,
  getDoc,
  where as firestoreWhere,
  limit as firestoreLimit,
  and,
  or,
  query,
} from "firebase/firestore";

const firebaseService = (collectionName, collectionId) => {
  let ref = collection(db, collectionName);

  if(collectionId)
    ref = doc(db, collectionName, collectionId);

  let whereFilters = [];
  let orWhereFilters = [];
  let clientSideFilters = [];
  let queryLimit = null;
  let api = {};
  let lastInsertedOrUpdated = null;
  let populateFields = [];

  api.where = (fieldOrCb, opOrValue, maybeValue) => {
    if (typeof fieldOrCb === "function") {
      // Nested conditions in where callback
      const subQuery = firebaseService(collectionName);
      fieldOrCb(subQuery);

      const subWhere = subQuery._getWhereFilters?.() || [];
      const subOrWhere = subQuery._getOrWhereFilters?.() || [];

      let nestedFilters = [];

      if (subWhere.length > 1) nestedFilters.push(and(...subWhere));
      else if (subWhere.length === 1) nestedFilters.push(subWhere[0]);

      if (subOrWhere.length > 1) nestedFilters.push(or(...subOrWhere));
      else if (subOrWhere.length === 1) nestedFilters.push(subOrWhere[0]);

      if (nestedFilters.length > 1) {
        whereFilters.push(and(...nestedFilters));
      } else if (nestedFilters.length === 1) {
        whereFilters.push(nestedFilters[0]);
      }

      const subClientFilters = subQuery._getClientFilters?.() || [];
      if (subClientFilters.length > 0) {
        clientSideFilters.push((doc) => subClientFilters.every((fn) => fn(doc)));
      }
    } else {
      // Simple where clause
      const { field, op, value } = normalizeWhereArgs(fieldOrCb, opOrValue, maybeValue);
      if (op === "like") {
        const predicate = handleLikePredicate(field, value);
        if (predicate) clientSideFilters.push(predicate);
      } else {
        whereFilters.push(firestoreWhere(field, op, value));
      }
    }
    return api;
  };

  api.orWhere = (fieldOrCb, opOrValue, maybeValue) => {
    if (typeof fieldOrCb === "function") {
      const subQuery = firebaseService(collectionName);
      fieldOrCb(subQuery);

      const subWhere = subQuery._getWhereFilters?.() || [];
      const subOrWhere = subQuery._getOrWhereFilters?.() || [];

      let nestedFilters = [];

      if (subWhere.length > 1) nestedFilters.push(and(...subWhere));
      else if (subWhere.length === 1) nestedFilters.push(subWhere[0]);

      if (subOrWhere.length > 1) nestedFilters.push(or(...subOrWhere));
      else if (subOrWhere.length === 1) nestedFilters.push(subOrWhere[0]);

      if (nestedFilters.length > 1) {
        orWhereFilters.push(and(...nestedFilters));
      } else if (nestedFilters.length === 1) {
        orWhereFilters.push(nestedFilters[0]);
      }

      const subClientFilters = subQuery._getClientFilters?.() || [];
      if (subClientFilters.length > 0) {
        clientSideFilters.push((doc) => subClientFilters.some((fn) => fn(doc)));
      }
    } else {
      const { field, op, value } = normalizeWhereArgs(fieldOrCb, opOrValue, maybeValue);
      if (op === "like") {
        const predicate = handleLikePredicate(field, value);
        if (predicate) clientSideFilters.push(predicate);
      } else {
        orWhereFilters.push(firestoreWhere(field, op, value));
      }
    }
    return api;
  };

  api.limit = (n) => {
    queryLimit = n;
    return api;
  };

  api.paginate = (page, perPage) => {
    if (page < 1) page = 1;
    const skipCount = (page - 1) * perPage;
    api._paginate = { skipCount, perPage };
    return api;
  };

  api.when = (condition, callback) => {
    if (condition) callback(api);
    return api;
  };

  api.for = (array, callback) => {
    if (Array.isArray(array)) {
      array.forEach((item) => callback(api, item));
    }
    return api;
  };

  api.populate = (fields) => {
    if (typeof fields === "string") {
      populateFields.push(fields);
    } else if (Array.isArray(fields)) {
      fields.forEach((field) => {
        if (typeof field === "string") populateFields.push(field);
      });
    } else {
      console.warn("populate() expects a string or array of strings");
    }
    return api;
  };

  api.get = async () => {
    let q = ref;

    // Combine whereFilters with AND
    const andFilter = whereFilters.length ? and(...whereFilters) : null;
    // Combine orWhereFilters with OR
    const orFilter = orWhereFilters.length ? or(...orWhereFilters) : null;

    if (andFilter && orFilter) {
      // Firestore limitation: cannot do or(and(...), or(...)) directly
      // Instead, combine all filters inside a single OR: (AND filters combined OR OR filters combined)
      // So here, combine filters inside or(...) together.

      // We need to flatten to one OR list:
      // OR filters = [...orWhereFilters]
      // Add the entire andFilter as one OR condition

      q = query(q, or(andFilter, ...orWhereFilters));
    } else if (andFilter) {
      q = query(q, andFilter);
    } else if (orFilter) {
      q = query(q, orFilter);
    }

    // Apply limit or pagination limit
    if (api._paginate) {
      const { skipCount, perPage } = api._paginate;
      q = query(q, firestoreLimit(skipCount + perPage));
    } else if (queryLimit !== null) {
      q = query(q, firestoreLimit(queryLimit));
    }

    let snapshot;
    let results;
    if(!collectionId){
      snapshot = await getDocs(q);
      results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }else{
      snapshot = await getDoc(q);
      results = snapshot.data();
    }

    // Clear filters after query run
    whereFilters = [];
    orWhereFilters = [];


    // Apply client-side filters (like 'like' operator)
    if (clientSideFilters.length) {
      results = results.filter((doc) =>
        clientSideFilters.every((fn) => fn(doc))
      );
      clientSideFilters = [];
    }

    // Apply pagination slice if needed
    if (api._paginate) {
      const { skipCount, perPage } = api._paginate;
      results = results.slice(skipCount, skipCount + perPage);
      api._paginate = null;
    }

    queryLimit = null;

    // Populate refs if requested
    if (populateFields.length > 0) {
      for (const field of populateFields) {
        for (let doc of results) {
          const refVal = field.split('.').reduce((obj, key) => obj?.[key], doc);
          if (refVal && typeof refVal.get === "function") {
            try {
              const refSnap = await getDoc(refVal);
              if (refSnap.exists()) {
                doc[`${field}__populated`] = { id: refSnap.id, ...refSnap.data() };
              }
            } catch (e) {
              console.error(`Failed to populate field '${field}'`, e);
            }
          }
        }
      }
      populateFields = [];
    }

    return results;
  };

  api.first = async () => {
    const results = await api.get();
    return results[0] || null;
  };

  api.raw = async (queryConstraints) => {
    let q = query(ref, queryConstraints);
    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  };

  api.insert = async (data) => {
    const docRef = await addDoc(ref, data);
    lastInsertedOrUpdated = docRef;
    return docRef;
  };

  api.update = async (data) => {
    const docRef = doc(db, collectionName, collectionId);
    await updateDoc(docRef, data);
    lastInsertedOrUpdated = docRef;
    return docRef;
  };

  api.delete = async (id) => {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  };

  api.lastInsertedOrUpdated = () => lastInsertedOrUpdated;

  // Internal getters for nested queries
  api._getWhereFilters = () => whereFilters;
  api._getOrWhereFilters = () => orWhereFilters;
  api._getClientFilters = () => clientSideFilters;

  // Helpers
  function normalizeWhereArgs(field, op, val) {
    if (val === undefined) {
      val = op;
      op = "==";
    }
    return { field, op, value: val };
  }

  function handleLikePredicate(field, pattern) {
    // Simulate 'like' with client-side filter (case-insensitive)
    const regex = new RegExp(pattern.replace(/%/g, ".*"), "i");
    return (doc) => regex.test(doc[field]);
  }

  return api;
};

export default firebaseService;
