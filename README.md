# Getting Started with Create React App

Firestore service file for react app, this helps for laravel user to connect with firestore db easily. The main purpose of this is to calling all functions in one manner or similar manner.

## Usage
```
Below are the usage steps for this project
```

### Delete Recrod
```
// To insert record to the collection

firebaseService('collectionPath').insert({
    test: "test data"
});

```

### Update Recrod
```
// To update record with documnetId from the collection

firebaseService('collectionPath', 'documnetId').update({
    test: "test data"
});

// Please note matching fields will be updated and new fields will be added
```

### Insert or Update Recrod
```
// If documentId found the record will update otherwise it will insert

firebaseService('collectionPath', 'documnetId').insertOrUpdate({
    test: "test data"
});

// Please note matching fields will be updated and new fields will be added
```

### Delete Recrod
```
// To delete record with documnetId from the collection

firebaseService('collectionPath', documentId).delete();

```

### Get Recrods
```
// To get all records from the collection

firebaseService('collectionPath').get();

```
```
// To get record from documnetId from the collection

firebaseService('collectionPath', documentId).get();

```

### First Recrods
```
// To one record you can also use this, give first recrod as per criteria

firebaseService('collectionPath').first();

```

### Where Recrods
```
// Add where conditions to records

firebaseService('collectionPath').where("test", "=", "test data").get();

firebaseService('collectionPath').where("test", "==", "test data").get();

firebaseService('collectionPath').where("test", ">", "test data").get();

firebaseService('collectionPath').where("test", ">", "test data").get();

// Add where callback to records for more complex conditions

firebaseService('collectionPath').where((q) => q.where("status", "==", "active")).get();

```

### When Recrods
```
// Add conditional where conditions to recrods

firebaseService('collectionPath').where(status, (q) => q.where("status", "==", "active")).get();

// Here status is a variable
// If doucmentId exsist it will call where condition otherwise it will not
```

### Limit Recrods
```
// Add limit to the query

firebaseService('collectionPath', documentId).limit(3).get()

```

### OrderBY Recrods
```
// Add orderBy to the query

firebaseService('collectionPath').orderBy('sorting', 'asc').get()

// Please note asc or desc is lower case
```