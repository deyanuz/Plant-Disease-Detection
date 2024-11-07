import {
  Image,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import React, { useEffect, useState } from "react";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "react-native-vector-icons/Ionicons";
import images from "../images";
import { useNavigation } from "@react-navigation/native";
import { getRegProgress, saveRegProgress } from "../registrationUtils";

const SelectImageScreen = () => {
  const [image, setImage] = useState();
  const navigation = useNavigation();
  useEffect(() => {
    getRegProgress("Image").then((data) => {
      if (data) {
        setImage(data.image || "");
      }
    });
  }, []);
  const saveImage = () => {
    if (image?.trim() !== "") {
      saveRegProgress("Image", { image });
    }
    navigation.navigate("PreFinal");
  };
  return (
    <>
      <SafeAreaView style={{ flex: 1, backgroundColor: "white" }}>
        <View style={{ marginHorizontal: 10 }}>
          <Ionicons name="arrow-back" size={25} color="black" />
        </View>

        <View style={{ marginHorizontal: 10, marginVertical: 15 }}>
          <Text style={{ fontSize: 20, fontWeight: "bold" }}>
            Complete your profile
          </Text>
          <Text style={{ marginTop: 10, color: "gray" }}>
            What would you like your mates to call you ❤️
          </Text>
        </View>
        <View style={{ marginVertical: 25 }}>
          <View style={{ justifyContent: "center", alignItems: "center" }}>
            <Image
              source={{ uri: image ? image : images[0]?.image }}
              style={{
                width: 100,
                height: 100,
                borderRadius: 50,
                borderColor: "#a71ec9",
                borderWidth: 2,
                resizeMode: "cover",
              }}
            />
          </View>

          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginVertical: 25,
              justifyContent: "center",
            }}
          >
            {images?.map((it, i) => (
              <Pressable
                key={i}
                style={{ margin: 10, gap: 10 }}
                onPress={() => setImage(it?.image)}
              >
                <Image
                  source={{ uri: it?.image }}
                  style={{
                    width: 70,
                    height: 70,
                    borderRadius: 35,
                    borderColor: image == it?.image ? "#a71ec9" : "transparent",
                    borderWidth: 2,
                    resizeMode: "contain",
                  }}
                />
              </Pressable>
            ))}
          </View>
          <Text
            style={{ textAlign: "center", color: "gray", marginVertical: 20 }}
          >
            Or
          </Text>
          <View style={{ marginHorizontal: 20, marginVertical: 20 }}>
            <View>
              <Text>Enter your image link</Text>
              <TextInput
                value={image}
                onChangeText={setImage}
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
        </View>
      </SafeAreaView>
      <Pressable
        onPress={saveImage}
        style={{
          color: "white",
          padding: 15,
          backgroundColor: "#a71ec9",
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
            color: "white",
            fontSize: 15,
            fontWeight: "500",
          }}
        >
          Next
        </Text>
      </Pressable>
    </>
  );
};

export default SelectImageScreen;

const styles = StyleSheet.create({});
