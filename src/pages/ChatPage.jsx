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
import "../styles/Chat.css"; // Dark theme styling

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
      const contactId = querySnapshot.docs[0].id;
      const contactRef = doc(db, `contacts/${currentUser.uid}/list/${contactId}`);
      await setDoc(contactRef, { addedAt: serverTimestamp() });
      setEmailInput('');
    } else {
      alert('User not found');
    }
  };

  return (
    <aside className="chat-sidebar">
      <h2 className="chat-title">Chats</h2>
      <div className="chat-search">
        <input
          value={emailInput}
          onChange={(e) => setEmailInput(e.target.value)}
          placeholder="Add contact by email"
        />
        <button onClick={handleAddContact}>Add</button>
      </div>
      <div className="chat-contacts">
        {contacts.map((user) => (
          <div key={user.uid} className="chat-contact" onClick={() => selectUser(user)}>
            <div className="contact-name">{user.displayName}</div>
            <div className="contact-hint">Tap to chat</div>
          </div>
        ))}
      </div>
    </aside>
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
    <main className="chat-main">
      <header className="chat-header">{selectedUser.displayName}</header>
      <div className="message-area">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`message-bubble ${msg.senderId === currentUser.uid ? 'message-sent' : 'message-received'}`}
          >
            {msg.text}
          </div>
        ))}
      </div>
      <form className="message-input" onSubmit={sendMessage}>
        <input
          type="text"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Type a message..."
        />
        <button type="submit">Send</button>
      </form>
    </main>
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
      <div className="login-box">
        <h2>Welcome to WhatsApp Clone</h2>
        <button onClick={login}>Login with Google</button>
        <h3>Or login with Email</h3>
        <LogIn />
        <h3>New user? Sign up below:</h3>
        <Signup />
      </div>
    );
  }

  return (
    <div className="chat-container">
      <ChatList currentUser={user} selectUser={setSelectedUser} />
      {selectedUser ? (
        <ChatWindow currentUser={user} selectedUser={selectedUser} />
      ) : (
        <main className="chat-main">
          <div className="message-area center-text">Select a user to start chatting</div>
        </main>
      )}
      <button onClick={logout} className="logout-button">Logout</button>
    </div>
  );
};

export default ChatPage;
