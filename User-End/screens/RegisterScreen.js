import {
  Platform,
  Image,
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
import IpAddress from "../DeviceConfig";

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

    // Check if any required fields are empty
    if (!trimmedEmail || !firstName || !password || !repeatPassword) {
      alert("Please fill in all required fields");
      return;
    }

    // Check if passwords match
    if (password !== repeatPassword) {
      alert("Passwords do not match");
      return;
    }

    // Save progress and continue
    saveRegProgress("Register", {
      email: trimmedEmail,
      firstName,
      lastName,
      password,
      repeatPassword,
    });
    navigation.navigate("Image");
  };

  const signUpWithGoogle = async () => {
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      // Get user info
      const { email, familyName, givenName, photoUrl } = userInfo.user;

      // Send token to backend
      const response = await fetch(`http://${IpAddress}:3000/auth/google`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email,
          firstName: givenName,
          lastName: familyName,
          photoUrl,
        }),
      });

      if (!response.ok) {
        throw new Error("Google sign in failed");
      }

      const data = await response.json();

      // Save user data
      await AsyncStorage.setItem("userToken", data.token);
      await AsyncStorage.setItem("userData", JSON.stringify(data.user));

      // Navigate to next screen
      navigation.navigate("Image");
    } catch (error) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // user cancelled the login flow
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // operation (e.g. sign in) is in progress already
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        // play services not available or outdated
      } else {
        // some other error happened
        console.error(error);
      }
    }
  };

  return (
    <>
      <SafeAreaView style={styles.container}>
        <ScrollView style={styles.scrollView}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Ionicons name="arrow-back" size={25} color="#013220" />
          </TouchableOpacity>

          <View style={styles.headerContainer}>
            <Text style={styles.headerText}>Create Account</Text>
            <Text style={styles.subHeaderText}>
              Please fill in the details below
            </Text>
          </View>

          <TouchableOpacity
            style={styles.googleButton}
            onPress={signUpWithGoogle}
          >
            <Image
              source={require("../assets/google.png")}
              style={styles.googleIcon}
            />
            <Text style={styles.googleButtonText}>Continue with Google</Text>
          </TouchableOpacity>

          <View style={styles.dividerContainer}>
            <View style={styles.divider} />
            <Text style={styles.dividerText}>OR</Text>
            <View style={styles.divider} />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Email Address *</Text>
              <View style={styles.standardInputContainer}>
                <TextInput
                  value={email}
                  onChangeText={setEmail}
                  style={styles.input}
                  placeholder="Enter your email"
                  keyboardType="email-address"
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>First Name *</Text>
              <View style={styles.standardInputContainer}>
                <TextInput
                  value={firstName}
                  onChangeText={setFname}
                  style={styles.input}
                  placeholder="Enter your first name"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Last Name</Text>
              <View style={styles.standardInputContainer}>
                <TextInput
                  value={lastName}
                  onChangeText={setLname}
                  style={styles.input}
                  placeholder="Enter your last name"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.standardInputContainer}>
                <TextInput
                  secureTextEntry={!isPasswordVisible}
                  value={password}
                  onChangeText={setPassword}
                  style={styles.input}
                  placeholder="Enter your password"
                />
                <TouchableOpacity
                  onPress={() => setIsPasswordVisible(!isPasswordVisible)}
                  style={styles.eyeIconContainer}
                >
                  <Ionicons
                    name={isPasswordVisible ? "eye-outline" : "eye-off-outline"}
                    size={24}
                    color="#013220"
                  />
                </TouchableOpacity>
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.label}>Confirm Password *</Text>
              <View style={styles.standardInputContainer}>
                <TextInput
                  secureTextEntry={!isRepeatPasswordVisible}
                  value={repeatPassword}
                  onChangeText={setRepeatPassword}
                  style={styles.input}
                  placeholder="Confirm your password"
                />
                <TouchableOpacity
                  onPress={() =>
                    setIsRepeatPasswordVisible(!isRepeatPasswordVisible)
                  }
                  style={styles.eyeIconContainer}
                >
                  <Ionicons
                    name={
                      isRepeatPasswordVisible
                        ? "eye-outline"
                        : "eye-off-outline"
                    }
                    size={24}
                    color="#013220"
                  />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>

        <View style={styles.bottomContainer}>
          <TouchableOpacity
            onPress={next}
            style={[
              styles.nextButton,
              {
                backgroundColor:
                  firstName?.length > 0 &&
                  email.length > 0 &&
                  password === repeatPassword &&
                  password?.length > 0
                    ? "#013220"
                    : "#e0e0e0",
              },
            ]}
          >
            <Text
              style={[
                styles.nextButtonText,
                {
                  color:
                    firstName?.length > 0 &&
                    email.length > 0 &&
                    password === repeatPassword &&
                    password?.length > 0
                      ? "white"
                      : "gray",
                },
              ]}
            >
              Continue
            </Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </>
  );
};

export default NameScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: 20,
  },
  backButton: {
    marginTop: 10,
  },
  headerContainer: {
    marginTop: 20,
    marginBottom: 30,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#013220",
  },
  subHeaderText: {
    fontSize: 16,
    color: "gray",
    marginTop: 5,
  },
  googleButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  googleIcon: {
    width: 24,
    height: 24,
    marginRight: 10,
  },
  googleButtonText: {
    fontSize: 16,
    color: "#333",
  },
  dividerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginVertical: 20,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: "#ddd",
  },
  dividerText: {
    marginHorizontal: 10,
    color: "gray",
  },
  inputContainer: {
    gap: 15,
  },
  inputWrapper: {
    gap: 8,
  },
  label: {
    fontSize: 14,
    color: "#013220",
    fontWeight: "500",
  },
  standardInputContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    height: 50,
    paddingHorizontal: 12,
  },
  input: {
    flex: 1,
    fontSize: 16,
    height: "100%",
    padding: 0,
  },
  eyeIconContainer: {
    padding: 5,
  },
  bottomContainer: {
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: "#e0e0e0",
  },
  nextButton: {
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  nextButtonText: {
    fontSize: 16,
    fontWeight: "bold",
  },
});
