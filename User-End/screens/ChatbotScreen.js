import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Button,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import IpAddress from "../DeviceConfig";

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");

  const handleSend = async () => {
    if (userInput.trim() === "") return;

    // Add the user's message to the chat
    const newMessages = [...messages, { sender: "user", text: userInput }];
    setMessages(newMessages);
    setUserInput("");

    try {
      // Send the user input to the chatbot API
      const response = await axios.post(`http://${IpAddress}:8000/chatbot`, {
        question: userInput,
      });

      // Add the chatbot's response to the chat
      setMessages([
        ...newMessages,
        {
          sender: "bot",
          text: response.data.response || "No response received.",
        },
      ]);
    } catch (error) {
      // Handle errors
      setMessages([
        ...newMessages,
        { sender: "bot", text: "An error occurred. Please try again later." },
      ]);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
      >
        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              msg.sender === "user" ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text style={styles.messageText}>{msg.text}</Text>
          </View>
        ))}
      </ScrollView>
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Type your question..."
        />
        <TouchableOpacity onPress={handleSend} style={styles.button}>
          <Text style={{ color: "white" }}>Send</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chatContainer: {
    flex: 1,
    padding: 10,
  },
  chatContent: {
    flexGrow: 1,
    justifyContent: "flex-end",
  },
  messageContainer: {
    padding: 10,
    marginVertical: 5,
    borderRadius: 10,
    maxWidth: "80%",
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#d1e7dd",
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f5d7f8",
  },
  messageText: {
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: "row",
    padding: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginRight: 10,
  },
  button: {
    width: "15%",
    paddingVertical: 15,
    backgroundColor: "#5e6bf7",
    borderRadius: 7,
    alignItems: "center",
    marginVertical: 3,
  },
});

export default ChatbotScreen;
