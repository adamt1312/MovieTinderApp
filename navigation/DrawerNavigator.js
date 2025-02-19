import React from "react";
import {
  createDrawerNavigator,
  DrawerContentScrollView,
  DrawerItemList,
  DrawerItem,
} from "@react-navigation/drawer";
import { MaterialIcons } from "@expo/vector-icons";
import { FontAwesome5 } from "@expo/vector-icons";
import { Text, StyleSheet, View, TouchableOpacity, Button } from "react-native";
import homeScreen from "../src/screens/HomeScreen/HomeScreen";
import MyProfileScreen from "../src/screens/MyProfileScreen/MyProfileScreen";
import { AntDesign } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { color } from "react-native-reanimated";
import { loggingOut } from "../src/API/firebase/Authentication/firestoreAuthentication";
import LikedMoviesScreen from "../src/screens/LibraryScreen/LikedMoviesScreen";
import BottomTabNavigator2 from "./TabNavigator2";
import RequestScreen from "../src/screens/RequestsScreen/RequestsScreen";

function CustomDrawerContent(props) {
  return (
    <DrawerContentScrollView
      {...props}
      style={{
        height: "100%",
        backgroundColor: "#121212",
      }}
    >
      <View
        style={{
          height: "auto",
        }}
      >
        <DrawerItemList {...props} />
      </View>
      <View
        style={{
          height: 500,
        }}
      >
        <DrawerItem
          icon={() => <AntDesign name="logout" size={35} color="black" />}
          label={() => (
            <Text style={[styles.screenTitle, { color: "black" }]}>Logout</Text>
          )}
          style={{
            backgroundColor: "#e91e63",
            marginHorizontal: 0,
            borderRadius: 0,
            paddingLeft: 13,
          }}
          onPress={() => {
            loggingOut();
          }}
        />
      </View>
    </DrawerContentScrollView>
  );
}

const Drawer = createDrawerNavigator();

const DrawerNavigator = () => {
  const activeTintColor = "#e91e63";
  return (
    <Drawer.Navigator
      drawerContentOptions={{
        activeTintColor: "#e91e63",
        itemStyle: { margin: 0 },
      }}
      drawerContent={(props) => <CustomDrawerContent {...props} />}
    >
      <Drawer.Screen
        name="Home"
        component={homeScreen}
        options={{
          drawerIcon: (config) => (
            <AntDesign name="home" size={40} color="white" />
          ),
          drawerLabel: (config) =>
            config.focused ? (
              <Text
                style={[
                  styles.screenTitle,
                  { color: activeTintColor, fontWeight: "bold" },
                ]}
              >
                Home
              </Text>
            ) : (
              <Text style={[styles.screenTitle, { color: "white" }]}>Home</Text>
            ),
        }}
      />
      <Drawer.Screen
        name="My Profile"
        component={MyProfileScreen}
        options={{
          drawerIcon: (config) => (
            <AntDesign name="profile" size={40} color="white" />
          ),
          drawerLabel: (config) =>
            config.focused ? (
              <Text
                style={[
                  styles.screenTitle,
                  { color: activeTintColor, fontWeight: "bold" },
                ]}
              >
                My Profile
              </Text>
            ) : (
              <Text style={[styles.screenTitle, { color: "white" }]}>
                My Profile
              </Text>
            ),
        }}
      />
      <Drawer.Screen
        name="Requests"
        component={RequestScreen}
        options={{
          drawerIcon: (config) => (
            <FontAwesome5 name="users" size={31} color="white" />
          ),
          drawerLabel: (config) =>
            config.focused ? (
              <Text
                style={[
                  styles.screenTitle,
                  { color: activeTintColor, fontWeight: "bold" },
                ]}
              >
                Requests
              </Text>
            ) : (
              <Text style={[styles.screenTitle, { color: "white" }]}>
                Requests
              </Text>
            ),
        }}
      />
      <Drawer.Screen
        name="Library"
        component={BottomTabNavigator2}
        options={{
          drawerIcon: (config) => (
            <MaterialCommunityIcons name="movie-roll" size={40} color="white" />
          ),
          drawerLabel: (config) =>
            config.focused ? (
              <Text
                style={[
                  styles.screenTitle,
                  { color: activeTintColor, fontWeight: "bold" },
                ]}
              >
                Library
              </Text>
            ) : (
              <Text style={[styles.screenTitle, { color: "white" }]}>
                Library
              </Text>
            ),
        }}
      />
    </Drawer.Navigator>
  );
};

const styles = StyleSheet.create({
  screenTitle: {
    fontSize: 25,
    fontFamily: "VarelaRound_400Regular",
    color: "white",
  },
});

export default DrawerNavigator;
