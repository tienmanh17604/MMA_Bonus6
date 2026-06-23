import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";

import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  updatePassword,
  updateEmail,
} from "firebase/auth";

import {
  doc,
  setDoc,
  getDoc,
  updateDoc,
} from "firebase/firestore";

import * as Device from "expo-device";
import * as Notifications from "expo-notifications";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

import { auth, db } from "./firebaseConfig";


export default function App() {

  const [screen, setScreen] = useState("login");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");

  const [newPassword, setNewPassword] =
    useState("");

  const [newEmail, setNewEmail] =
    useState("");

  const [newPhone, setNewPhone] =
    useState("");

  const [newAddress, setNewAddress] =
    useState("");

  const [uid, setUid] = useState("");

  const [expoToken, setExpoToken] =
    useState("");

  useEffect(() => {

    registerForPushNotifications();

    const subscription =
      Notifications.addNotificationReceivedListener(
        notification => {

          console.log(
            "Notification:",
            notification
          );

        }
      );

    return () => {
      subscription.remove();
    };

  }, []);

  async function registerForPushNotifications() {
    console.log("Device:", Device.isDevice);


    if (!Device.isDevice) return;

    const { status: existingStatus } =
      await Notifications.getPermissionsAsync();

    let finalStatus = existingStatus;
    console.log("Permission:", finalStatus);

    if (existingStatus !== "granted") {

      const { status } =
        await Notifications.requestPermissionsAsync();

      finalStatus = status;
    }

    if (finalStatus !== "granted") {
      return;
    }

    try {
      const token = (
        await Notifications.getExpoPushTokenAsync({
          projectId:
            "677dd378-d886-4fcc-aa75-8470066fc6ea",
        })
      ).data;

      console.log("TOKEN:", token);


      /* Alert.alert("TOKEN", token); */


      setExpoToken(token);

    } catch (error) {
      console.log("TOKEN ERROR:", error);
      Alert.alert(
        "TOKEN ERROR",
        JSON.stringify(error)
      );
    }
  }
  const sendTestNotification = async () => {
    if (!expoToken) {
  Alert.alert(
    "Thông báo",
    "Chưa lấy được token"
  );
  return;
}
    try {

      const message = {
        to: expoToken,
        sound: "default",
        title: "Firebase Assignment",
        body: "Đây là thông báo thử nghiệm",
        data: {
          screen: "profile",
        },
      };

      await fetch(
        "https://exp.host/--/api/v2/push/send",
        {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Accept-encoding": "gzip, deflate",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(message),
        }
      );

      Alert.alert(
        "Success",
        "Đã gửi notification"
      );

    } catch (error) {

      Alert.alert(
        "Error",
        error.message
      );

    }
  };

  const register = async () => {
  try {

    const userCredential =
      await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );

    const user = userCredential.user;

    await setDoc(
      doc(db, "users", user.uid),
      {
        email,
        phone,
        address,
      }
    );

    Alert.alert(
      "Thành công",
      "Đăng ký thành công"
    );

    setScreen("login");

    setEmail("");
    setPassword("");
    setPhone("");
    setAddress("");

  } catch (error) {

    if (
      error.code ===
      "auth/email-already-in-use"
    ) {

      Alert.alert(
        "Thông báo",
        "Email đã tồn tại"
      );

    } else {

      Alert.alert(
        "Lỗi",
        error.message
      );

    }

  }
};
  const login = async () => {

    try {

      const userCredential =
        await signInWithEmailAndPassword(
          auth,
          email,
          password
        );

      const user =
        userCredential.user;

      setUid(user.uid);

      const docSnap =
        await getDoc(
          doc(db, "users", user.uid)
        );

      if (docSnap.exists()) {

        const data =
          docSnap.data();

        setEmail(
          data.email || ""
        );

        setPhone(
          data.phone || ""
        );

        setAddress(
          data.address || ""
        );
      }

      setScreen("profile");

    } catch (error) {

  console.log(error.code);

  if (
    error.code ===
    "auth/invalid-credential"
  ) {

    Alert.alert(
      "Thông báo",
      "Sai email hoặc mật khẩu"
    );

  } else {

    Alert.alert(
      "Lỗi",
      error.message
    );

  }
}
    };

const changeEmail = async () => {
  try {

    if (!newEmail) {
      Alert.alert(
        "Thông báo",
        "Nhập email mới"
      );
      return;
    }

    const user = auth.currentUser;

    if (!user) {
      Alert.alert(
        "Lỗi",
        "Chưa đăng nhập"
      );
      return;
    }

    // Đổi email trong Firebase Authentication
    await updateEmail(
      user,
      newEmail
    );

    // Đổi email trong Firestore
    await updateDoc(
      doc(db, "users", user.uid),
      {
        email: newEmail,
      }
    );

    setEmail(newEmail);
    setNewEmail("");

    Alert.alert(
      "Thành công",
      "Đổi email thành công"
    );

  } catch (error) {

    console.log(error.code);

    if (
      error.code ===
      "auth/requires-recent-login"
    ) {

      Alert.alert(
        "Thông báo",
        "Vui lòng đăng nhập lại trước khi đổi email"
      );

    } else if (
      error.code ===
      "auth/email-already-in-use"
    ) {

      Alert.alert(
        "Thông báo",
        "Email đã tồn tại"
      );

    } else {

      Alert.alert(
        "Lỗi",
        error.message
      );

    }
  }
};
  const changePhone = async () => {

    try {

      if (!newPhone) {
        Alert.alert(
          "Thông báo",
          "Nhập số điện thoại mới"
        );
        return;
      }

      const user =
        auth.currentUser;

      await updateDoc(
        doc(db, "users", user.uid),
        {
          phone: newPhone,
        }
      );

      setPhone(newPhone);
      setNewPhone("");

      Alert.alert(
        "Thành công",
        "Đổi số điện thoại thành công"
      );

    } catch (error) {

      Alert.alert(
        "Lỗi",
        error.message
      );
    }
  };

  const changeAddress = async () => {

    try {

      if (!newAddress) {
        Alert.alert(
          "Thông báo",
          "Nhập địa chỉ mới"
        );
        return;
      }

      const user =
        auth.currentUser;

      await updateDoc(
        doc(db, "users", user.uid),
        {
          address: newAddress,
        }
      );

      setAddress(newAddress);
      setNewAddress("");

      Alert.alert(
        "Thành công",
        "Đổi địa chỉ thành công"
      );

    } catch (error) {

      Alert.alert(
        "Lỗi",
        error.message
      );
    }
  };

  const changePassword = async () => {

    try {

      if (!newPassword) {

        Alert.alert(
          "Thông báo",
          "Nhập mật khẩu mới"
        );

        return;
      }

      await updatePassword(
        auth.currentUser,
        newPassword
      );

      Alert.alert(
        "Thành công",
        "Đổi mật khẩu thành công"
      );

      setNewPassword("");

    } catch (error) {

      Alert.alert(
        "Lỗi",
        error.message
      );
    }
  };

  const logout = async () => {

    await signOut(auth);

    setScreen("login");

    setEmail("");
    setPassword("");

    setPhone("");
    setAddress("");

    setUid("");

    setNewPassword("");
    setNewEmail("");
    setNewPhone("");
    setNewAddress("");
  };

  if (screen === "register") {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>
            Register
          </Text>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TextInput
              style={styles.input}
              placeholder="Phone"
              value={phone}
              onChangeText={setPhone}
            />

            <TextInput
              style={styles.input}
              placeholder="Address"
              value={address}
              onChangeText={setAddress}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={register}
            >
              <Text style={styles.buttonText}>
                Tiến hành đăng ký
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setScreen("login")
              }
            >
              <Text style={styles.link}>
                Đã có tài khoản?
                Đăng nhập ngay
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }

  if (screen === "login") {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={
          Platform.OS === "ios"
            ? "padding"
            : "height"
        }
      >
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>
            Login
          </Text>

          <View style={styles.card}>
            <TextInput
              style={styles.input}
              placeholder="Email"
              value={email}
              onChangeText={setEmail}
            />

            <TextInput
              style={styles.input}
              placeholder="Password"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />

            <TouchableOpacity
              style={styles.button}
              onPress={login}
            >
              <Text style={styles.buttonText}>
                Đăng nhập
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() =>
                setScreen("register")
              }
            >
              <Text style={styles.link}>
                Chưa có tài khoản?
                Đăng ký tại đây
              </Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios"
          ? "padding"
          : "height"
      }
    >
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={styles.header}>
          User Profile
        </Text>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Thông tin người dùng
          </Text>

          <Text style={styles.info}>
            UID: {uid}
          </Text>

          <Text style={styles.info}>
            Email: {email}
          </Text>

          <Text style={styles.info}>
            Phone: {phone}
          </Text>

          <Text style={styles.info}>
            Address: {address}
          </Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Change Email
          </Text>

          <TextInput
            style={styles.input}
            placeholder="New Email"
            value={newEmail}
            onChangeText={setNewEmail}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={changeEmail}
          >
            <Text style={styles.buttonText}>
              Change Email
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Change Phone Number
          </Text>

          <TextInput
            style={styles.input}
            placeholder="New Phone"
            value={newPhone}
            onChangeText={setNewPhone}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={changePhone}
          >
            <Text style={styles.buttonText}>
              Change Phone
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Change Address
          </Text>

          <TextInput
            style={styles.input}
            placeholder="New Address"
            value={newAddress}
            onChangeText={setNewAddress}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={changeAddress}
          >
            <Text style={styles.buttonText}>
              Change Address
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Change Password
          </Text>

          <TextInput
            style={styles.input}
            placeholder="New Password"
            secureTextEntry
            value={newPassword}
            onChangeText={setNewPassword}
          />

          <TouchableOpacity
            style={styles.button}
            onPress={changePassword}
          >
            <Text style={styles.buttonText}>
              Change Password
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            FCM Token
          </Text>

          <Text style={styles.token}>
            {expoToken || "Đang lấy token..."}
          </Text>
        </View>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>
            Test Notification
          </Text>

          <TouchableOpacity
            style={styles.button}
            onPress={sendTestNotification}
          >
            <Text style={styles.buttonText}>
              Send Test Notification
            </Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
        >
          <Text style={styles.buttonText}>
            Đăng xuất
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f3f4f6",
  },

  scroll: {
    flexGrow: 1,
    padding: 20,
  },

  header: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 50,
    marginBottom: 25,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,

    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },

    shadowOpacity: 0.2,
    shadowRadius: 4,

    elevation: 4,
  },

  cardTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    backgroundColor: "#fff",
  },

  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 8,
    paddingHorizontal: 15,
    borderRadius: 8,
    alignItems: "center",
    alignSelf: "center",
  },

  logoutButton: {
    backgroundColor: "#f44336",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginBottom: 30,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },

  link: {
    marginTop: 15,
    textAlign: "center",
    color: "#2196F3",
    fontWeight: "600",
  },

  info: {
    marginBottom: 10,
    fontSize: 14,
  },

  token: {
    fontSize: 12,
    color: "#555",
  },
});
