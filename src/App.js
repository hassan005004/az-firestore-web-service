import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  or,
  where,
  and
} from "firebase/firestore";
import { db } from "./firebase";
import firebaseService from "./services/firebaseService";
import AuthScreen from "./auth/authScreen";

const App = () => {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");

  const usersCollection = collection(db, "users");

  // READ
  const fetchUsers = async () => {
    // const data = await firebaseService("users").populate(["profileRef"]).get();
    // setUsers(data);

    // const data1 = await firebaseService("users")
    //   .where("name", "name1")
    //   .where("fname", "fname1")
    //   .get();

    const data1 = await firebaseService("users")
      .where((q) => q.where("fname", "==", 'fname1').orWhere("fname", "==", 'fname1'))
      .where("name", "==", "name1")
      .get();


    // const data1 = await firebaseService("users").raw(and(or(
    //   where("fname", "==", "fname1"),
    //   where("fname", "==", "fname2")
    // ),
    // where("name", "==", "name1")));

    setUsers(data1);

    // const data2 = await firebaseService("users")
    //   .where((q) => {
    //     q.where("city", "like", "new%").orWhere("name", "like", "%ss%");
    //   })
    //   .get();
    // setUsers(data2);


    // const data = await getDocs(usersCollection);
    // setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    // createUser();
    fetchUsers();
  }, []);

  // CREATE
  const createUser = async () => {
    await firebaseService("users").insert({ "name": "name", "fname": "fname" });
    await firebaseService("users").insert({ "name": "name1", "fname": "fname1" });
    
    // await addDoc(usersCollection, { name });

    setName("");
    fetchUsers();
  };

  // UPDATE
  const updateUser = async (id) => {
    // await firebaseService("users").update(id, { "name": "newName" });
      const userService = firebaseService("users");
    await userService.update(id, { name: "updated name" });
    await userService.ref("profiles", { age: 30 });

    // const userDoc = doc(db, "users", id);
    // await updateDoc(userDoc, { name: newName });

    fetchUsers();
  };

  // DELETE
  const deleteUser = async (id) => {
    alert(id);
    await firebaseService("users").delete(id);

    // const userDoc = doc(db, "users", id);
    // await deleteDoc(userDoc);
    
    fetchUsers();
  };

  return (
    <div>
      <h1>Firestore Service</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New User Name"
      />
      <button onClick={createUser}>Add User</button>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name}{" "}{user.fname}
            <button onClick={() => updateUser(user.id)}>
              Update
            </button>{" "}
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>

      <div>Auth Service Example</div>

      <AuthScreen />
    </div>
  );
};

export default App;
