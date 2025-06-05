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

// // src/services/firebaseService.js
// /**
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

//  */

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
  orderBy as firestoreOrderBy,
  query,
} from "firebase/firestore";


const firebaseService = (collectionName, documentId) => {
  let ref = collection(db, collectionName);

  if (documentId)
    ref = doc(db, collectionName, documentId);

  let whereFilters = [];
  let clientSideFilters = [];
  let queryLimit = null;
  let api = {};
  let lastInsertedOrUpdated = null;
  let populateFields = [];
  let orderByFields = [];

  api.where = (field, opOrValue, maybeValue) => {
    let op, value;
    if (maybeValue === undefined) {
      op = "==";
      value = opOrValue;
    } else {
      op = opOrValue.toLowerCase();
      value = maybeValue;
    }
    if (op === "=") op = "==";

    if (op === "like") {
      if (typeof value === "string") {
        const startsWithPercent = value.startsWith("%");
        const endsWithPercent = value.endsWith("%");
        const valLower = value.toLowerCase();

        if (startsWithPercent && endsWithPercent) {
          const searchTerm = valLower.slice(1, -1);
          clientSideFilters.push((doc) =>
            doc[field]?.toLowerCase().includes(searchTerm)
          );
        } else if (startsWithPercent) {
          const searchTerm = valLower.slice(1);
          clientSideFilters.push((doc) =>
            doc[field]?.toLowerCase().endsWith(searchTerm)
          );
        } else if (endsWithPercent) {
          const prefix = value.slice(0, -1);
          whereFilters.push(firestoreWhere(field, ">=", prefix));
          whereFilters.push(firestoreWhere(field, "<=", prefix + "\uf8ff"));
        } else {
          whereFilters.push(firestoreWhere(field, "==", value));
        }
      } else {
        throw new Error("The 'like' operator expects a string with % wildcard.");
      }
    } else {
      whereFilters.push(firestoreWhere(field, op, value));
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

  api.orderBy = (field, direction = 'asc') => {
    orderByFields.push(firestoreOrderBy(field, direction));
    return api;
  };

  api.get = async () => {
    // let q = whereFilters.length ? query(ref, ...whereFilters) : ref;
    let queryParts = [ref, ...whereFilters, ...orderByFields];
    if (api._paginate) {
      const { skipCount, perPage } = api._paginate;
      queryParts.push(firestoreLimit(skipCount + perPage));
    } else if (queryLimit !== null) {
      queryParts.push(firestoreLimit(queryLimit));
    }
    let q = query(...queryParts);

    // if (api._paginate) {
    //   const { skipCount, perPage } = api._paginate;
    //   q = query(q, firestoreLimit(skipCount + perPage));
    // } else if (queryLimit !== null) {
    //   q = query(q, firestoreLimit(queryLimit));
    // }

    whereFilters = [];

    let snapshot;
    let results;
    if(!documentId){
      snapshot = await getDocs(q);
      results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }else{
      snapshot = await getDoc(q);
      results = snapshot.data();
    }
    // let results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

    if (clientSideFilters.length) {
      results = results.filter((doc) =>
        clientSideFilters.every((fn) => fn(doc))
      );
      clientSideFilters = [];
    }

    if (api._paginate) {
      const { skipCount, perPage } = api._paginate;
      results = results.slice(skipCount, skipCount + perPage);
      api._paginate = null;
    }

    if (populateFields.length > 0) {
      for (const field of populateFields) {
        for (let doc of results) {
          const ref = field.split('.').reduce((obj, key) => obj?.[key], doc);
          if (ref && typeof ref.get === "function") {
            try {
              const refSnap = await getDoc(ref);
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

    queryLimit = null;
    return results;
  };

  api.first = async () => {
    const results = await api.get();
    return results[0] || null;
  };

  api.insert = async (data) => {
    const docRef = await addDoc(ref, data);
    lastInsertedOrUpdated = { id: docRef.id, data };
    return api;
  };

  api.update = async (data) => {
    const docRef = doc(db, collectionName, documentId);
    await updateDoc(docRef, data);
    lastInsertedOrUpdated = { documentId, data };
    return api;
  };

  api.insertOrUpdate = async (data) => {
    if (documentId) {
      return api.update(data);
    } else {
      return api.insert(data);
    }
  };

  api.delete = async () => {
    const docRef = doc(db, collectionName, documentId);
    await deleteDoc(docRef);
    return id;
  };

  api.ref = async (relationPath, relationData) => {
    if (!lastInsertedOrUpdated || !lastInsertedOrUpdated.id) {
      throw new Error("Call insert or update before ref()");
    }

    // Base doc info (user)
    const baseDocId = lastInsertedOrUpdated.id;
    const baseDocRef = doc(db, collectionName, baseDocId);

    // relationPath is the *collection name* for related data (e.g., "profiles")
    // We'll create/update a doc in that top-level collection
    const relatedCollectionName = relationPath;

    const relatedCollectionRef = collection(db, relatedCollectionName);

    // Check if document exists that matches (you might want to adjust your matching logic)
    // For example, if relationData has a unique field (like userId), query by that

    // Here we try to find a doc with the same user id if possible:
    let relatedDocRef = null;

    // We'll do a query to check if a doc exists related to this user (assuming relationData contains a userId field or email)
    // Adjust this to your actual unique field for the relation
    const uniqueField = "userId"; // or "email" or something you track
    let existingDocSnapshot = null;

    if (relationData[uniqueField]) {
      const q = query(
        relatedCollectionRef,
        firestoreWhere(uniqueField, "==", relationData[uniqueField]),
        firestoreLimit(1)
      );
      existingDocSnapshot = await getDocs(q);
    }

    if (existingDocSnapshot && !existingDocSnapshot.empty) {
      // Update the existing related doc
      relatedDocRef = existingDocSnapshot.docs[0].ref;
      await updateDoc(relatedDocRef, relationData);
    } else {
      // Create a new related doc
      relatedDocRef = await addDoc(relatedCollectionRef, relationData);
    }

    // Update the base user doc with reference field, e.g. profilesRef
    const refFieldName = relatedCollectionName + "Ref";
    await updateDoc(baseDocRef, {
      [refFieldName]: relatedDocRef,
    });

    return api;
  };


  // api.ref = async (relationPath, relationData) => {
  //   if (!lastInsertedOrUpdated || !lastInsertedOrUpdated.id) {
  //     throw new Error("Call insert or update before ref()");
  //   }

  //   let baseDocId = lastInsertedOrUpdated.id;
  //   let baseDocRef = doc(db, collectionName, baseDocId);

  //   const pathParts = relationPath.split(".");
  //   // Construct the reference field name to store in parent doc
  //   const fieldName = pathParts.map(p => p + "Ref").join(".");

  //   // We'll track the current base document path as a string to build subcollection paths
  //   let currentDocPath = `${collectionName}/${baseDocId}`;

  //   for (let i = 0; i < pathParts.length; i++) {
  //     const subColName = pathParts[i];
  //     const subColPath = `${currentDocPath}/${subColName}`;
  //     const subColRef = collection(db, subColPath);

  //     // Check if related document exists in the subcollection
  //     const snapshot = await getDocs(subColRef);

  //     if (!snapshot.empty) {
  //       // If exists, update first doc found
  //       const existingDoc = snapshot.docs[0];
  //       const existingDocRef = existingDoc.ref;
  //       await updateDoc(existingDocRef, relationData);

  //       currentDocPath = existingDocRef.path;

  //       // If last in path, update parent doc ref field
  //       if (i === pathParts.length - 1) {
  //         await updateDoc(baseDocRef, {
  //           [fieldName]: existingDocRef
  //         });
  //       }
  //     } else {
  //       // If not exists, create new doc
  //       const createdDocRef = await addDoc(subColRef, relationData);

  //       currentDocPath = createdDocRef.path;

  //       // If last in path, update parent doc ref field
  //       if (i === pathParts.length - 1) {
  //         await updateDoc(baseDocRef, {
  //           [fieldName]: createdDocRef
  //         });
  //       }
  //     }
  //   }

  //   return api;
  // };


  // api.ref = async (relationPath, relationData) => {
  //   if (!lastInsertedOrUpdated) throw new Error("Call insert or update before ref()");

  //   // Split nested relation paths: e.g. "profiles" or "profiles.subprofile"
  //   const pathParts = relationPath.split(".");

  //   let baseDocRef = doc(db, collectionName, lastInsertedOrUpdated.id);

  //   // We'll iterate through pathParts to get or create the nested subcollection doc:
  //   let currentDocRef = baseDocRef;

  //   for (let i = 0; i < pathParts.length; i++) {
  //     const colName = pathParts[i];

  //     // Reference to the subcollection at this level:
  //     const subColRef = collection(db, currentDocRef.path + "/" + colName);

  //     // Check if a document already exists in this subcollection:
  //     const snapshot = await getDocs(subColRef);

  //     let docId;

  //     if (!snapshot.empty) {
  //       // Document exists — pick the first doc (you may adjust logic if multiple docs allowed)
  //       docId = snapshot.docs[0].id;

  //       // Update this existing doc with new data if this is the last path part
  //       if (i === pathParts.length - 1) {
  //         await updateDoc(doc(subColRef, docId), relationData);
  //       }
  //     } else {
  //       // Document doesn't exist — create new
  //       if (i === pathParts.length - 1) {
  //         // Insert the relationData in the last subcollection level
  //         const createdDocRef = await addDoc(subColRef, relationData);
  //         docId = createdDocRef.id;
  //       } else {
  //         // For intermediate levels (nested), create empty doc or with empty data:
  //         const createdDocRef = await addDoc(subColRef, {});
  //         docId = createdDocRef.id;
  //       }
  //     }

  //     // Update currentDocRef to point to the document we just created/updated
  //     currentDocRef = doc(subColRef, docId);
  //   }

  //   // Build the field name for the reference in the parent document
  //   // For example, "profiles" => "profilesRef", "profiles.subprofile" => "profilesSubprofileRef"
  //   const fieldName = pathParts.map(p => p.charAt(0).toUpperCase() + p.slice(1)).join("") + "Ref";

  //   // Update the original (parent) document with the DocumentReference pointing to last created/updated doc
  //   await updateDoc(baseDocRef, {
  //     [fieldName]: currentDocRef,
  //   });

  //   return api;
  // };


  return api;
};

export default firebaseService;


// // import { db } from "../firebase"; // Make sure this is the correct path
// // import {
// //   collection,
// //   doc,
// //   addDoc,
// //   updateDoc,
// //   deleteDoc,
// //   getDoc,
// //   getDocs,
// //   where as firestoreWhere,
// //   limit as firestoreLimit,
// //   startAfter as firestoreStartAfter,
// //   query,
// // } from "firebase/firestore";

// // const firebaseService = (collectionName) => {
// //   const ref = collection(db, collectionName); // Make sure `db` is valid Firestore instance
// //   let whereFilters = [];
// //   let clientSideFilters = [];
// //   let queryLimit = null;
// //   let skipCount = 0;

// //   const api = {
// //     where: (field, opOrValue, maybeValue) => {
// //       let op, value;
// //       if (maybeValue === undefined) {
// //         op = "==";
// //         value = opOrValue;
// //       } else {
// //         op = opOrValue.toLowerCase();
// //         value = maybeValue;
// //       }
// //       if (op === "=") op = "==";

// //       if (op === "like") {
// //         if (typeof value === "string") {
// //           const startsWithPercent = value.startsWith("%");
// //           const endsWithPercent = value.endsWith("%");

// //           if (startsWithPercent && endsWithPercent) {
// //             // contains query %abc%
// //             const searchTerm = value.slice(1, -1).toLowerCase();
// //             // no Firestore support, so client filter later
// //             clientSideFilters.push((doc) =>
// //               doc.name.toLowerCase().includes(searchTerm)
// //             );
// //           } else if (startsWithPercent) {
// //             // endsWith query %abc
// //             const searchTerm = value.slice(1).toLowerCase();
// //             clientSideFilters.push((doc) =>
// //               doc.name.toLowerCase().endsWith(searchTerm)
// //             );
// //           } else if (endsWithPercent) {
// //             // prefix query abc%
// //             const prefix = value.slice(0, -1);
// //             whereFilters.push(firestoreWhere(field, ">=", prefix));
// //             whereFilters.push(firestoreWhere(field, "<=", prefix + "\uf8ff"));
// //           } else {
// //             // no wildcard, exact match
// //             whereFilters.push(firestoreWhere(field, "==", value));
// //           }
// //         } else {
// //           throw new Error(
// //             "The 'like' operator expects a string with % wildcard."
// //           );
// //         }
// //       } else {
// //         whereFilters.push(firestoreWhere(field, op, value));
// //       }

// //       return api;
// //     },

// //     limit: (n) => {
// //       queryLimit = n;
// //       return api;
// //     },

// //     skip: (n) => {
// //       skipCount = n;
// //       return api;
// //     },

// //     // get: async () => {
// //     //   const q = whereFilters.length ? query(ref, ...whereFilters) : ref;
// //     //   const snapshot = await getDocs(q);
// //     //   whereFilters = [];
// //     //   return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
// //     // },

// //     get: async () => {
// //       let q = whereFilters.length ? query(ref, ...whereFilters) : ref;

// //       // If paginate is set, fetch skip + limit documents
// //       if (api._paginate) {
// //         const { skipCount, perPage } = api._paginate;
// //         q = query(q, firestoreLimit(skipCount + perPage));
// //       } else if (queryLimit !== null) {
// //         q = query(q, firestoreLimit(queryLimit));
// //       }

// //       const snapshot = await getDocs(q);
// //       whereFilters = [];

// //       let results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

// //       if (clientSideFilters.length) {
// //         results = results.filter((doc) =>
// //           clientSideFilters.every((fn) => fn(doc))
// //         );
// //         clientSideFilters = [];
// //       }

// //       if (api._paginate) {
// //         const { skipCount, perPage } = api._paginate;
// //         results = results.slice(skipCount, skipCount + perPage);
// //         api._paginate = null;
// //       }

// //       queryLimit = null;
// //       skipCount = 0;

// //       return results;
// //     },


// //     paginate: (page, perPage) => {
// //       if (page < 1) page = 1;
// //       const skipCount = (page - 1) * perPage;
// //       // Save for get()
// //       api._paginate = { skipCount, perPage };
// //       return api;
// //     },

// //     first: async () => {
// //       const results = await api.get();
// //       return results[0] || null;
// //     },

// //     insert: async (data) => {
// //       const docRef = await addDoc(ref, data);
// //       return { id: docRef.id, ...data };
// //     },

// //     update: async (id, data) => {
// //       const docRef = doc(db, collectionName, id);
// //       await updateDoc(docRef, data);
// //       return { id, ...data };
// //     },

// //     delete: async (id) => {
// //       const docRef = doc(db, collectionName, id);
// //       await deleteDoc(docRef);
// //       return id;
// //     }
// //   };

// //   return api;
// // };

// // export default firebaseService;


// import { db } from "../firebase";
// import {
//   collection,
//   doc,
//   addDoc,
//   setDoc,
//   updateDoc,
//   deleteDoc,
//   getDocs,
//   getDoc,
//   where as firestoreWhere,
//   limit as firestoreLimit,
//   and,
//   or,
//   query,
// } from "firebase/firestore";

// const firebaseService = (collectionName, collectionId) => {
//   let ref = collection(db, collectionName);

//   if(collectionId)
//     ref = doc(db, collectionName, collectionId);

//   let whereFilters = [];
//   let orWhereFilters = [];
//   let clientSideFilters = [];
//   let queryLimit = null;
//   let api = {};
//   let lastInsertedOrUpdated = null;
//   let populateFields = [];

//   api.where = (fieldOrCb, opOrValue, maybeValue) => {
//     if (typeof fieldOrCb === "function") {
//       // Nested conditions in where callback
//       const subQuery = firebaseService(collectionName);
//       fieldOrCb(subQuery);

//       const subWhere = subQuery._getWhereFilters?.() || [];
//       const subOrWhere = subQuery._getOrWhereFilters?.() || [];

//       let nestedFilters = [];

//       if (subWhere.length > 1) nestedFilters.push(and(...subWhere));
//       else if (subWhere.length === 1) nestedFilters.push(subWhere[0]);

//       if (subOrWhere.length > 1) nestedFilters.push(or(...subOrWhere));
//       else if (subOrWhere.length === 1) nestedFilters.push(subOrWhere[0]);

//       if (nestedFilters.length > 1) {
//         whereFilters.push(and(...nestedFilters));
//       } else if (nestedFilters.length === 1) {
//         whereFilters.push(nestedFilters[0]);
//       }

//       const subClientFilters = subQuery._getClientFilters?.() || [];
//       if (subClientFilters.length > 0) {
//         clientSideFilters.push((doc) => subClientFilters.every((fn) => fn(doc)));
//       }
//     } else {
//       // Simple where clause
//       const { field, op, value } = normalizeWhereArgs(fieldOrCb, opOrValue, maybeValue);
//       if (op === "like") {
//         const predicate = handleLikePredicate(field, value);
//         if (predicate) clientSideFilters.push(predicate);
//       } else {
//         whereFilters.push(firestoreWhere(field, op, value));
//       }
//     }
//     return api;
//   };

//   api.orWhere = (fieldOrCb, opOrValue, maybeValue) => {
//     if (typeof fieldOrCb === "function") {
//       const subQuery = firebaseService(collectionName);
//       fieldOrCb(subQuery);

//       const subWhere = subQuery._getWhereFilters?.() || [];
//       const subOrWhere = subQuery._getOrWhereFilters?.() || [];

//       let nestedFilters = [];

//       if (subWhere.length > 1) nestedFilters.push(and(...subWhere));
//       else if (subWhere.length === 1) nestedFilters.push(subWhere[0]);

//       if (subOrWhere.length > 1) nestedFilters.push(or(...subOrWhere));
//       else if (subOrWhere.length === 1) nestedFilters.push(subOrWhere[0]);

//       if (nestedFilters.length > 1) {
//         orWhereFilters.push(and(...nestedFilters));
//       } else if (nestedFilters.length === 1) {
//         orWhereFilters.push(nestedFilters[0]);
//       }

//       const subClientFilters = subQuery._getClientFilters?.() || [];
//       if (subClientFilters.length > 0) {
//         clientSideFilters.push((doc) => subClientFilters.some((fn) => fn(doc)));
//       }
//     } else {
//       const { field, op, value } = normalizeWhereArgs(fieldOrCb, opOrValue, maybeValue);
//       if (op === "like") {
//         const predicate = handleLikePredicate(field, value);
//         if (predicate) clientSideFilters.push(predicate);
//       } else {
//         orWhereFilters.push(firestoreWhere(field, op, value));
//       }
//     }
//     return api;
//   };

//   api.limit = (n) => {
//     queryLimit = n;
//     return api;
//   };

//   api.paginate = (page, perPage) => {
//     if (page < 1) page = 1;
//     const skipCount = (page - 1) * perPage;
//     api._paginate = { skipCount, perPage };
//     return api;
//   };

//   api.when = (condition, callback) => {
//     if (condition) callback(api);
//     return api;
//   };

//   api.for = (array, callback) => {
//     if (Array.isArray(array)) {
//       array.forEach((item) => callback(api, item));
//     }
//     return api;
//   };

//   api.populate = (fields) => {
//     if (typeof fields === "string") {
//       populateFields.push(fields);
//     } else if (Array.isArray(fields)) {
//       fields.forEach((field) => {
//         if (typeof field === "string") populateFields.push(field);
//       });
//     } else {
//       console.warn("populate() expects a string or array of strings");
//     }
//     return api;
//   };

//   api.get = async () => {
//     let q = ref;

//     // Combine whereFilters with AND
//     const andFilter = whereFilters.length ? and(...whereFilters) : null;
//     // Combine orWhereFilters with OR
//     const orFilter = orWhereFilters.length ? or(...orWhereFilters) : null;

//     if (andFilter && orFilter) {
//       // Firestore limitation: cannot do or(and(...), or(...)) directly
//       // Instead, combine all filters inside a single OR: (AND filters combined OR OR filters combined)
//       // So here, combine filters inside or(...) together.

//       // We need to flatten to one OR list:
//       // OR filters = [...orWhereFilters]
//       // Add the entire andFilter as one OR condition

//       q = query(q, or(andFilter, ...orWhereFilters));
//     } else if (andFilter) {
//       q = query(q, andFilter);
//     } else if (orFilter) {
//       q = query(q, orFilter);
//     }

//     // Apply limit or pagination limit
//     if (api._paginate) {
//       const { skipCount, perPage } = api._paginate;
//       q = query(q, firestoreLimit(skipCount + perPage));
//     } else if (queryLimit !== null) {
//       q = query(q, firestoreLimit(queryLimit));
//     }

//     let snapshot;
//     let results;
//     if(!collectionId){
//       snapshot = await getDocs(q);
//       results = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//     }else{
//       snapshot = await getDoc(q);
//       results = snapshot.data();
//     }

//     // Clear filters after query run
//     whereFilters = [];
//     orWhereFilters = [];


//     // Apply client-side filters (like 'like' operator)
//     if (clientSideFilters.length) {
//       results = results.filter((doc) =>
//         clientSideFilters.every((fn) => fn(doc))
//       );
//       clientSideFilters = [];
//     }

//     // Apply pagination slice if needed
//     if (api._paginate) {
//       const { skipCount, perPage } = api._paginate;
//       results = results.slice(skipCount, skipCount + perPage);
//       api._paginate = null;
//     }

//     queryLimit = null;

//     // Populate refs if requested
//     if (populateFields.length > 0) {
//       for (const field of populateFields) {
//         for (let doc of results) {
//           const refVal = field.split('.').reduce((obj, key) => obj?.[key], doc);
//           if (refVal && typeof refVal.get === "function") {
//             try {
//               const refSnap = await getDoc(refVal);
//               if (refSnap.exists()) {
//                 doc[`${field}__populated`] = { id: refSnap.id, ...refSnap.data() };
//               }
//             } catch (e) {
//               console.error(`Failed to populate field '${field}'`, e);
//             }
//           }
//         }
//       }
//       populateFields = [];
//     }

//     return results;
//   };

//   api.first = async () => {
//     const results = await api.get();
//     return results[0] || null;
//   };

//   api.raw = async (queryConstraints) => {
//     let q = query(ref, queryConstraints);
//     const snapshot = await getDocs(q);
//     return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
//   };

//   api.insert = async (data) => {
//     const docRef = await addDoc(ref, data);
//     lastInsertedOrUpdated = docRef;
//     return docRef;
//   };

//   api.update = async (data) => {
//     const docRef = doc(db, collectionName, collectionId);
//     await updateDoc(docRef, data);
//     lastInsertedOrUpdated = docRef;
//     return docRef;
//   };

//   api.insertOrUpdate = async (data) => {
//     if(collectionId){
//       return api.update(data);
//     }else{
//       return api.insert(data);
//     }
//   };

//   api.delete = async () => {
//     const docRef = doc(db, collectionName, collectionId);
//     await deleteDoc(docRef);
//     return true;
//   };

//   api.lastInsertedOrUpdated = () => lastInsertedOrUpdated;

//   // Internal getters for nested queries
//   api._getWhereFilters = () => whereFilters;
//   api._getOrWhereFilters = () => orWhereFilters;
//   api._getClientFilters = () => clientSideFilters;

//   // Helpers
//   function normalizeWhereArgs(field, op, val) {
//     if (val === undefined) {
//       val = op;
//       op = "==";
//     }
//     return { field, op, value: val };
//   }

//   function handleLikePredicate(field, pattern) {
//     // Simulate 'like' with client-side filter (case-insensitive)
//     const regex = new RegExp(pattern.replace(/%/g, ".*"), "i");
//     return (doc) => regex.test(doc[field]);
//   }

//   return api;
// };

// export default firebaseService;
