// @refresh reset
import React, { useState, useCallback, useEffect } from 'react'
import { GiftedChat, Send } from 'react-native-gifted-chat'
import {
  StyleSheet,
  Text,
  View,
  Button,
  TextInput,
  Image
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firebase from '@react-native-firebase/app';
import '@react-native-firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDBfTeGz2OQqtI9hITabeNlNkaGS9JlzJo",
  authDomain: "gmmessagingserv.firebaseapp.com",
  projectId: "gmmessagingserv",
  storageBucket: "gmmessagingserv.appspot.com",
  messagingSenderId: "56993964978",
  appId: "1:56993964978:web:5bb2cca93ad3a000fa7aab",
  measurementId: "G-4LMLK28MM6",
  databaseURL: "https://gmmessagingserv-default-rtdb.firebaseio.com"
};

if (firebase.apps.length === 0) {
  firebase.initializeApp(firebaseConfig)
    .then(response => {
      console.log("Bağlantı başarılı");
    })
    .catch(err => console.log(err));
}

const db = firebase.firestore()
const chatsRef = db.collection('chats').where('user._id', 'in', ['zkc8qe', '48qsdg'])
const chatsRef2 = db.collection('chats')
const App = () => {

  const [user, setUser] = useState(null);
  const [name, setName] = useState('');
  const [messages, setMessages] = useState([]);
  useEffect(() => {
    readUser();
    const unsubscribe = chatsRef.onSnapshot(querySnapshot => {
      const messagesFirestore = querySnapshot.docChanges().filter(({ type }) => type === 'added')
        .map(({ doc }) => {
          const message = doc.data()
          return { ...message, createdAt: message.createdAt.toDate() };
        }).sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      appendMessages(messagesFirestore)
    })
    return () => unsubscribe()

  }, [])

  const appendMessages = useCallback((messages) => {
    setMessages((previousMessages) => GiftedChat.append(previousMessages, messages))
  }, [messages])

  const readUser = async () => {
    const user = await AsyncStorage.getItem('user');
    if (user) {
      setUser(JSON.parse(user));

    }
  }
  async function handlePress() {
    const _id = Math.random().toString(36).substring(7);
    const user = {
      _id,
      name
    }
    await AsyncStorage.setItem('user', JSON.stringify(user));
    setUser(user);
  }

  async function handleSend(messages) {
    console.log('0')
    const writes = Promise.all(messages.map(m => chatsRef2.add(m))).then(response => console.log(response)).catch(err => console.log(err))
    console.log('1')
    await Promise.all(writes).then((response) => console.log(response)).catch((err) => console.log(err))
  }
  if (!user) {
    return (
      <View style={styles.container}>
        <TextInput style={styles.input} placeholder="Lütfen isminizi girin" value={name} onChangeText={setName} />
        <Button onPress={handlePress} title="Sohbete Başla" />
      </View>
    )
  }
  const renderSend = (props) => (
    <Send {...props} >
      <Image source={require('./assets/sendButton.png')} style={{ width: 30, height: 30, margin: 5}} />
    </Send>
  )

  return (

    <GiftedChat
      messages={messages}
      user={user}
      onSend={handleSend}
      placeholder='Mesajınızı yazın'
      textInputStyle={{ color: 'black', fontSize: 13, }}
      renderSend={renderSend}

    />

  )
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 30,
  },
  input: {
    height: 50,
    width: "100%",
    borderWidth: 1,
    padding: 15,
    borderColor: 'gray',
    marginBottom: 20
  }
});

export default App;
