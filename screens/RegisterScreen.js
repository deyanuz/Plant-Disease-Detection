import {
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import { TouchableOpacity } from "react-native";
import { getRegProgress, saveRegProgress } from "../registrationUtils";

const NameScreen = () => {
  const [email, setEmail] = useState("");
  const [firstName, setFname] = useState("");
  const [lastName, setLname] = useState("");
  const [password, setPassword] = useState();
  const [repeatPassword, setRepeatPassword] = useState();
  const navigation = useNavigation();

  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isRepeatPasswordVisible, setIsRepeatPasswordVisible] = useState(false);

  useEffect(() => {
    getRegProgress("Register").then((data) => {
      if (data) {
        setEmail(data.email || "");
        setFname(data.firstName || "");
        setLname(data.lastName || "");
      }
    });
  }, []);

  const next = () => {
    const trimmedEmail = email.trim();
    setEmail(trimmedEmail);
    console.log(trimmedEmail + "a");
    if (trimmedEmail !== "") {
      saveRegProgress("Register", {
        email: trimmedEmail,
        firstName,
        lastName,
        password,
        repeatPassword,
      });
    }
    navigation.navigate("Image");
  };
  return (
    <>
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: "white",
        }}
      >
        <ScrollView style={{ marginBottom: 10 }}>
          <View style={{ marginHorizontal: 10 }}>
            <Ionicons name="arrow-back" size={25} color="black" />
          </View>

          <View style={{ marginHorizontal: 10, marginVertical: 15 }}>
            <Text style={{ fontSize: 20, fontWeight: "bold" }}>
              Complete your profile
            </Text>
          </View>

          <View
            style={{
              backgroundColor: "white",
              marginHorizontal: 10,
              marginTop: 25,
              gap: 20,
              flexDirection: "column",
            }}
          >
            <View>
              <Text style={{ fontSize: 16, color: "gray" }}>Enter Email *</Text>
              <TextInput
                value={email}
                onChangeText={setEmail}
                style={{
                  padding: 10,
                  borderColor: "#d0d0d0",
                  borderWidth: 1,
                  marginTop: 10,
                  borderRadius: 10,
                }}
              />
            </View>
          </View>
          <View
            style={{
              backgroundColor: "white",
              marginHorizontal: 10,
              marginTop: 25,
              gap: 20,
              flexDirection: "column",
            }}
          >
            <View>
              <Text style={{ fontSize: 16, color: "gray" }}>First Name *</Text>
              <TextInput
                value={firstName}
                onChangeText={setFname}
                style={{
                  padding: 10,
                  borderColor: "#d0d0d0",
                  borderWidth: 1,
                  marginTop: 10,
                  borderRadius: 10,
                }}
              />
            </View>
          </View>
          <View
            style={{
              backgroundColor: "white",
              marginHorizontal: 10,
              marginTop: 25,
              gap: 20,
              flexDirection: "column",
            }}
          >
            <View>
              <Text style={{ fontSize: 16, color: "gray" }}>Last Name</Text>
              <TextInput
                value={lastName}
                onChangeText={setLname}
                style={{
                  padding: 10,
                  borderColor: "#d0d0d0",
                  borderWidth: 1,
                  marginTop: 10,
                  borderRadius: 10,
                }}
              />
            </View>
          </View>
          <View
            style={{
              backgroundColor: "white",
              marginHorizontal: 10,
              marginTop: 25,
              gap: 20,
              flexDirection: "column",
            }}
          >
            <View>
              <Text style={{ fontSize: 16, color: "gray" }}>Password *</Text>
              <View
                style={{
                  padding: 10,
                  borderColor: "#d0d0d0",
                  borderWidth: 1,
                  marginTop: 10,
                  borderRadius: 10,
                  flexDirection: "row",
                }}
              >
                <TextInput
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  style={{ flex: 1 }}
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={{ paddingRight: 10 }}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                    size={26}
                    color="#bebebe"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View
            style={{
              backgroundColor: "white",
              marginHorizontal: 10,
              marginTop: 25,
              gap: 20,
              flexDirection: "column",
            }}
          >
            <View>
              <Text style={{ fontSize: 16, color: "gray" }}>
                Repeat Password *
              </Text>
              <View
                style={{
                  borderColor: "#d0d0d0",
                  borderWidth: 1,
                  padding: 10,
                  marginTop: 10,
                  borderRadius: 10,
                  flexDirection: "row",
                }}
              >
                <TextInput
                  secureTextEntry={!isRepeatPasswordVisible}
                  value={repeatPassword}
                  onChangeText={setRepeatPassword}
                  style={{ flex: 1 }}
                />
                <TouchableOpacity
                  onPress={() =>
                    setIsRepeatPasswordVisible(!isRepeatPasswordVisible)
                  }
                  style={{ paddingRight: 10 }}
                >
                  <Ionicons
                    name={
                      isRepeatPasswordVisible
                        ? "eye-outline"
                        : "eye-off-outline"
                    }
                    size={26}
                    color="#bebebe"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
      <View style={{ backgroundColor: "white" }}>
        <Pressable
          onPress={next}
          style={{
            color: "white",
            padding: 15,
            backgroundColor: firstName?.length > 0 ? "#a71ec9" : "#e0e0e0",
            marginTop: "auto",
            marginBottom: 30,
            padding: 12,
            marginHorizontal: 10,
            borderRadius: 6,
          }}
        >
          <Text
            style={{
              textAlign: "center",
              color: firstName?.length > 0 ? "white" : "gray",
              fontSize: 15,
              fontWeight: "500",
            }}
          >
            Next
          </Text>
        </Pressable>
      </View>
    </>
  );
};

export default NameScreen;

const styles = StyleSheet.create({});
