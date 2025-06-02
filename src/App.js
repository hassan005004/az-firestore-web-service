import React, { useEffect, useState } from "react";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc
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
    const data = await firebaseService("users").populate(["profileRef"]).get();
    setUsers(data);
    // const data = await getDocs(usersCollection);
    // setUsers(data.docs.map((doc) => ({ ...doc.data(), id: doc.id })));
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  // CREATE
  const createUser = async () => {
    await firebaseService("users").insert({ "name": name });
    
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
      <h1>Firestore CRUD</h1>

      <input
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="New User Name"
      />
      <button onClick={createUser}>Add User</button>

      <ul>
        {users.map((user) => (
          <li key={user.id}>
            {user.name}{" "}
            <button onClick={() => updateUser(user.id)}>
              Update
            </button>{" "}
            <button onClick={() => deleteUser(user.id)}>Delete</button>
          </li>
        ))}
      </ul>


      <AuthScreen />
    </div>
  );
};

export default App;
