import React, { useState, useEffect, useContext } from "react";
import {
  View,
  Text,
  TextInput,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from "react-native";
import axios from "axios";
import IpAddress from "../DeviceConfig";
import { AuthContext } from "../auth/AuthContext";
import Icon from "react-native-vector-icons/Entypo";

const ChatbotScreen = () => {
  const [messages, setMessages] = useState([]);
  const [userInput, setUserInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { userID } = useContext(AuthContext);

  // Load chat history when component mounts
  useEffect(() => {
    if (userID) {
      loadChatHistory();
    }
  }, [userID]);

  const loadChatHistory = async () => {
    try {
      const response = await axios.get(
        `http://${IpAddress}:8000/chat-history/${userID}`
      );
      const chatHistory = response.data.chatHistory;

      // Convert chat history to message format
      const historyMessages = [];
      chatHistory.forEach((entry) => {
        historyMessages.push(
          { sender: "user", text: entry.question },
          { sender: "bot", text: entry.answer }
        );
      });

      setMessages(historyMessages);
    } catch (error) {
      console.error("Error loading chat history:", error);
    }
  };

  const handleSend = async () => {
    if (userInput.trim() === "" || !userID) return;

    setIsLoading(true);

    // Add the user's message to the chat
    const newMessages = [...messages, { sender: "user", text: userInput }];
    setMessages(newMessages);
    const currentInput = userInput;
    setUserInput("");

    try {
      // Send the user input to the chatbot API with userID
      const response = await axios.post(`http://${IpAddress}:8000/chatbot`, {
        question: currentInput,
        userID: userID,
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
      console.error("Chatbot error:", error);
      // Handle errors
      setMessages([
        ...newMessages,
        { sender: "bot", text: "An error occurred. Please try again later." },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChatHistory = async () => {
    Alert.alert(
      "Clear Chat History",
      "Are you sure you want to clear all chat history?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Clear",
          style: "destructive",
          onPress: async () => {
            try {
              await axios.delete(
                `http://${IpAddress}:8000/chat-history/user/${userID}`
              );
              setMessages([]);
              Alert.alert("Success", "Chat history cleared successfully");
            } catch (error) {
              console.error("Error clearing chat history:", error);
              Alert.alert("Error", "Failed to clear chat history");
            }
          },
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Plant Disease Assistant</Text>
        <TouchableOpacity onPress={clearChatHistory} style={styles.clearButton}>
          <Icon name="trash" size={20} color="#D9534F" />
        </TouchableOpacity>
      </View>

      {/* Chat Messages */}
      <ScrollView
        style={styles.chatContainer}
        contentContainerStyle={styles.chatContent}
        showsVerticalScrollIndicator={false}
      >
        {messages.length === 0 && (
          <View style={styles.welcomeContainer}>
            <Icon name="chat" size={50} color="#013220" />
            <Text style={styles.welcomeText}>
              Ask me anything about plant diseases, gardening tips, or
              agricultural advice!
            </Text>
          </View>
        )}

        {messages.map((msg, index) => (
          <View
            key={index}
            style={[
              styles.messageContainer,
              msg.sender === "user" ? styles.userMessage : styles.botMessage,
            ]}
          >
            <Text
              style={[
                styles.messageText,
                msg.sender === "user"
                  ? styles.userMessageText
                  : styles.botMessageText,
              ]}
            >
              {msg.text}
            </Text>
          </View>
        ))}

        {isLoading && (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="small" color="#013220" />
            <Text style={styles.loadingText}>AI is thinking...</Text>
          </View>
        )}
      </ScrollView>

      {/* Input Container */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={userInput}
          onChangeText={setUserInput}
          placeholder="Ask about plant diseases..."
          placeholderTextColor="#999"
          multiline
          maxLength={500}
        />
        <TouchableOpacity
          onPress={handleSend}
          style={[
            styles.sendButton,
            (!userInput.trim() || isLoading) && styles.sendButtonDisabled,
          ]}
          disabled={!userInput.trim() || isLoading}
        >
          <Icon name="paper-plane" size={20} color="#FFF" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: "#FFF",
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: "#013220",
  },
  clearButton: {
    padding: 8,
  },
  chatContainer: {
    flex: 1,
    paddingHorizontal: 15,
  },
  chatContent: {
    paddingVertical: 15,
  },
  welcomeContainer: {
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 50,
    paddingHorizontal: 20,
  },
  welcomeText: {
    fontSize: 16,
    color: "#666",
    textAlign: "center",
    marginTop: 15,
    lineHeight: 22,
  },
  messageContainer: {
    padding: 12,
    marginVertical: 6,
    borderRadius: 15,
    maxWidth: "85%",
    elevation: 2,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#013220",
    borderBottomRightRadius: 5,
  },
  botMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#FFF",
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  messageText: {
    fontSize: 15,
    lineHeight: 20,
  },
  userMessageText: {
    color: "#FFF",
  },
  botMessageText: {
    color: "#333",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    padding: 12,
    marginVertical: 6,
    backgroundColor: "#FFF",
    borderRadius: 15,
    borderBottomLeftRadius: 5,
    borderWidth: 1,
    borderColor: "#E0E0E0",
  },
  loadingText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#666",
  },
  inputContainer: {
    flexDirection: "row",
    padding: 15,
    backgroundColor: "#FFF",
    borderTopWidth: 1,
    borderTopColor: "#E0E0E0",
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#E0E0E0",
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    marginRight: 10,
    fontSize: 15,
    maxHeight: 100,
    backgroundColor: "#F8F8F8",
  },
  sendButton: {
    width: 45,
    height: 45,
    backgroundColor: "#013220",
    borderRadius: 22.5,
    alignItems: "center",
    justifyContent: "center",
    elevation: 3,
    shadowColor: "#013220",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  sendButtonDisabled: {
    backgroundColor: "#CCC",
  },
});

export default ChatbotScreen;
