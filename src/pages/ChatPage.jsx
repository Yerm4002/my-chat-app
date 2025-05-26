import React, { useState, useEffect } from 'react';
import { auth, provider, db } from '../firebase';
import {
  signInWithPopup,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  doc,
  getDoc,
  setDoc,
  getDocs,
  serverTimestamp
} from 'firebase/firestore';
import LogIn from '../components/LogIn';
import Signup from '../components/Signup';
import "../styles/Chat.css"; // Optional if you have other global styles

// Chat List Component
const ChatList = ({ currentUser, selectUser }) => {
  const [contacts, setContacts] = useState([]);
  const [emailInput, setEmailInput] = useState('');

  useEffect(() => {
    const q = query(collection(db, `contacts/${currentUser.uid}/list`));
    const unsubscribe = onSnapshot(q, async (snapshot) => {
      const contactPromises = snapshot.docs.map(async (docSnap) => {
        const userRef = doc(db, 'users', docSnap.id);
        const userDoc = await getDoc(userRef);
        return { uid: userDoc.id, ...userDoc.data() };
      });
      const contactUsers = await Promise.all(contactPromises);
      setContacts(contactUsers);
    });
    return () => unsubscribe();
  }, [currentUser]);

  const handleAddContact = async () => {
    if (!emailInput.trim()) return;
    const q = query(collection(db, 'users'), where('email', '==', emailInput));
    const querySnapshot = await getDocs(q);
    if (!querySnapshot.empty) {
      const contactUser = querySnapshot.docs[0].data();
      const contactId = querySnapshot.docs[0].id;
      const contactRef = doc(db, `contacts/${currentUser.uid}/list/${contactId}`);
      await setDoc(contactRef, { addedAt: serverTimestamp() });
      setEmailInput('');
    } else {
      alert('User not found');
    }
  };

  return (
    <div className="w-1/3 h-screen overflow-y-auto border-r border-gray-300 p-4 bg-white shadow-md">
      <h2 className="text-2xl font-bold text-green-600 mb-6">Chats</h2>
      <div className="flex items-center mb-6">
        <input
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="Add contact by email"
          className="flex-1 px-4 py-2 border border-gray-300 rounded-l-md bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          onClick={handleAddContact}
          className="px-4 py-2 bg-green-500 text-white font-semibold rounded-r-md hover:bg-green-600 transition"
        >
          Add
        </button>
      </div>
      <div className="space-y-3">
        {contacts.map((user) => (
          <div
            key={user.uid}
            className="p-4 bg-gray-50 rounded-md shadow-sm border border-gray-200 hover:bg-green-50 cursor-pointer transition"
            onClick={() => selectUser(user)}
          >
            <div className="font-medium text-gray-800">{user.displayName}</div>
            <div className="text-sm text-gray-500">Tap to chat</div>
          </div>
        ))}
      </div>
    </div>
  );
};

// Chat Window Component
const ChatWindow = ({ currentUser, selectedUser }) => {
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState('');

  const chatId = [currentUser.uid, selectedUser.uid].sort().join('_');

  useEffect(() => {
    const q = query(
      collection(db, `privateMessages/${chatId}/messages`),
      orderBy('timestamp')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setMessages(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
    });
    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!message.trim()) return;
    await addDoc(collection(db, `privateMessages/${chatId}/messages`), {
      text: message,
      senderId: currentUser.uid,
      timestamp: serverTimestamp(),
    });
    setMessage('');
  };

  return (
    <div className="w-2/3 h-screen flex flex-col bg-white">
      <div className="p-4 border-b bg-green-100 text-green-800 font-bold shadow-sm">
        {selectedUser.displayName}
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-2 bg-[#f0f2f5]">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`px-4 py-2 rounded-xl max-w-xs ${
              msg.senderId === currentUser.uid
                ? 'bg-green-300 ml-auto text-right'
                : 'bg-white text-left border'
            }`}
          >
            {msg.text}
          </div>
        ))}
      </div>

      <form onSubmit={sendMessage} className="p-4 border-t bg-white flex gap-2">
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 px-4 py-2 border rounded-full bg-gray-100 focus:outline-none focus:ring-2 focus:ring-green-400"
        />
        <button
          type="submit"
          className="px-5 py-2 bg-green-500 text-white rounded-full font-semibold hover:bg-green-600 transition"
        >
          Send
        </button>
      </form>
    </div>
  );
};

// Main App Component
const ChatPage = () => {
  const [user, setUser] = useState(null);
  const [selectedUser, setSelectedUser] = useState(null);

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);

        const userRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(userRef);
        if (!docSnap.exists()) {
          await setDoc(userRef, {
            uid: currentUser.uid,
            displayName: currentUser.displayName,
            email: currentUser.email,
          });
        }
      }
    });
    return () => unsub();
  }, []);

  const login = () => signInWithPopup(auth, provider);
  const logout = () => signOut(auth);

  if (!user) {
    return (
      <div className="p-10 text-center bg-white max-w-md mx-auto mt-16 rounded-lg shadow-md">
        <h2 className="text-3xl font-bold text-green-600 mb-6">Welcome to WhatsApp Clone</h2>

        <button
          onClick={login}
          className="bg-green-500 text-white px-6 py-2 rounded font-semibold mb-6 hover:bg-green-600 transition"
        >
          Login with Google
        </button>

        <h3 className="text-lg mt-4 mb-2 font-medium text-gray-700">Or login with Email</h3>
        <LogIn />

        <h3 className="text-lg mt-6 mb-2 font-medium text-gray-700">New user? Sign up below:</h3>
        <Signup />
      </div>
    );
  }

  return (
    <div className="flex h-screen">
      <ChatList currentUser={user} selectUser={setSelectedUser} />
      {selectedUser ? (
        <ChatWindow currentUser={user} selectedUser={selectedUser} />
      ) : (
        <div className="w-2/3 flex items-center justify-center text-gray-400 text-lg">
          Select a user to start chatting
        </div>
      )}
      <button
        onClick={logout}
        className="absolute top-4 right-4 bg-red-500 text-white px-4 py-2 rounded font-semibold hover:bg-red-600 transition"
      >
        Logout
      </button>
    </div>
  );
};

export default ChatPage;
