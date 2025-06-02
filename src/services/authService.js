// services/authService.js
import { auth, db, firebase } from "../firebase";
import { doc, setDoc, getDoc } from "firebase/firestore";
import firebaseCompat from "firebase/compat/app";

const signup = async (email, password, role) => {
  const userCredential = await auth.createUserWithEmailAndPassword(email, password);
  const user = userCredential.user;

  await setDoc(doc(db, "users", user.uid), {
    email,
    role,
    createdAt: firebase.firestore.FieldValue.serverTimestamp(),
  });

  return user;
};

const login = async (email, password) => {
  const userCredential = await auth.signInWithEmailAndPassword(email, password);
  return userCredential.user;
};

const googleLogin = async () => {
  const provider = new firebaseCompat.auth.GoogleAuthProvider();
  const result = await auth.signInWithPopup(provider);
  const user = result.user;

  const userDocRef = doc(db, "users", user.uid);
  const userDocSnap = await getDoc(userDocRef);

  if (!userDocSnap.exists()) {
    await setDoc(userDocRef, {
      email: user.email,
      role: "user",
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    });
  }

  return user;
};

const fetchUserRole = async (uid) => {
  const userDocRef = doc(db, "users", uid);
  const userDocSnap = await getDoc(userDocRef);

  if (userDocSnap.exists()) {
    return userDocSnap.data().role || "user";
  }

  return "user";
};

const logout = () => auth.signOut();

export default {
  signup,
  login,
  googleLogin,
  fetchUserRole,
  logout,
};
