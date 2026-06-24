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
import { StatusBar } from "expo-status-bar";

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
  const [profileTab, setProfileTab] = useState("overview");

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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandContainer}>
            <Text style={styles.logoIcon}>✨</Text>
            <Text style={styles.brandName}>MEMBERSHIP</Text>
            <Text style={styles.brandSubtitle}>Đăng ký tài khoản mới của bạn</Text>
          </View>

          <View style={styles.authCard}>
            <Text style={styles.authTitle}>Đăng ký</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="user@example.com"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#6B7280"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>📞</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập số điện thoại"
                  placeholderTextColor="#6B7280"
                  value={phone}
                  onChangeText={setPhone}
                  keyboardType="phone-pad"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Địa chỉ</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🏠</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập địa chỉ của bạn"
                  placeholderTextColor="#6B7280"
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={register}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Tiến hành đăng ký</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryLink}
              onPress={() => setScreen("login")}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryLinkText}>
                Đã có tài khoản? <Text style={styles.highlightText}>Đăng nhập ngay</Text>
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
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <StatusBar style="light" />
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.brandContainer}>
            <Text style={styles.logoIcon}>🔐</Text>
            <Text style={styles.brandName}>MEMBERSHIP</Text>
            <Text style={styles.brandSubtitle}>Chào mừng bạn quay trở lại</Text>
          </View>

          <View style={styles.authCard}>
            <Text style={styles.authTitle}>Đăng nhập</Text>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Email</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>📧</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="user@example.com"
                  placeholderTextColor="#6B7280"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
              </View>
            </View>

            <View style={styles.inputWrapper}>
              <Text style={styles.inputLabel}>Mật khẩu</Text>
              <View style={styles.inputContainer}>
                <Text style={styles.inputIcon}>🔒</Text>
                <TextInput
                  style={styles.textInput}
                  placeholder="Nhập mật khẩu"
                  placeholderTextColor="#6B7280"
                  secureTextEntry
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
              </View>
            </View>

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={login}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Đăng nhập</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryLink}
              onPress={() => setScreen("register")}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryLinkText}>
                Chưa có tài khoản? <Text style={styles.highlightText}>Đăng ký tại đây</Text>
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
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <StatusBar style="light" />
      <ScrollView
        contentContainerStyle={styles.scroll}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.profileHeader}>
          <Text style={styles.profileHeaderTitle}>Tài khoản</Text>
          <Text style={styles.profileHeaderSubtitle}>Quản lý thông tin & thông báo</Text>
        </View>

        {/* Tab switch bar */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[
              styles.tabButton,
              profileTab === "overview" && styles.tabButtonActive,
            ]}
            onPress={() => setProfileTab("overview")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                profileTab === "overview" && styles.tabTextActive,
              ]}
            >
              📊 Tổng quan
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.tabButton,
              profileTab === "settings" && styles.tabButtonActive,
            ]}
            onPress={() => setProfileTab("settings")}
            activeOpacity={0.8}
          >
            <Text
              style={[
                styles.tabText,
                profileTab === "settings" && styles.tabTextActive,
              ]}
            >
              ⚙️ Cập nhật
            </Text>
          </TouchableOpacity>
        </View>

        {profileTab === "overview" ? (
          <View style={styles.tabContent}>
            {/* Avatar & Profile Card */}
            <View style={styles.profileCard}>
              <View style={styles.avatarContainer}>
                <View style={styles.avatarCircle}>
                  <Text style={styles.avatarText}>
                    {email ? email[0].toUpperCase() : "U"}
                  </Text>
                </View>
                <Text style={styles.profileEmail}>{email || "user@example.com"}</Text>
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>Firebase Verified</Text>
                </View>
              </View>

              <View style={styles.divider} />

              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🔑 User ID (UID)</Text>
                <Text style={styles.infoValue} numberOfLines={1} ellipsizeMode="middle">
                  {uid}
                </Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>📞 Số điện thoại</Text>
                <Text style={styles.infoValue}>{phone || "Chưa thiết lập"}</Text>
              </View>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>🏠 Địa chỉ</Text>
                <Text style={styles.infoValue}>{address || "Chưa thiết lập"}</Text>
              </View>
            </View>

            {/* FCM Token Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔔 Expo Push Token</Text>
              <View style={styles.tokenContainer}>
                <Text style={styles.tokenText} selectable={true}>
                  {expoToken || "Đang kết nối để lấy mã token..."}
                </Text>
              </View>
            </View>

            {/* Test Notification Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🚀 Kiểm tra thông báo</Text>
              <Text style={styles.cardDesc}>
                Nhấp nút bên dưới để gửi một thông báo đẩy kiểm thử đến thiết bị của bạn.
              </Text>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={sendTestNotification}
                activeOpacity={0.8}
              >
                <Text style={styles.secondaryButtonText}>Gửi thông báo test</Text>
              </TouchableOpacity>
            </View>
          </View>
        ) : (
          <View style={styles.tabContent}>
            {/* Change Email Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📧 Đổi địa chỉ Email</Text>
              <View style={styles.actionInputWrapper}>
                <TextInput
                  style={styles.actionTextInput}
                  placeholder="Nhập email mới"
                  placeholderTextColor="#6B7280"
                  value={newEmail}
                  onChangeText={setNewEmail}
                  autoCapitalize="none"
                  keyboardType="email-address"
                />
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={changeEmail}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>Cập nhật</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Change Phone Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>📞 Đổi số điện thoại</Text>
              <View style={styles.actionInputWrapper}>
                <TextInput
                  style={styles.actionTextInput}
                  placeholder="Nhập số điện thoại mới"
                  placeholderTextColor="#6B7280"
                  value={newPhone}
                  onChangeText={setNewPhone}
                  keyboardType="phone-pad"
                />
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={changePhone}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>Cập nhật</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Change Address Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🏠 Đổi địa chỉ</Text>
              <View style={styles.actionInputWrapper}>
                <TextInput
                  style={styles.actionTextInput}
                  placeholder="Nhập địa chỉ mới"
                  placeholderTextColor="#6B7280"
                  value={newAddress}
                  onChangeText={setNewAddress}
                />
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={changeAddress}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>Cập nhật</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Change Password Card */}
            <View style={styles.card}>
              <Text style={styles.cardTitle}>🔒 Đổi mật khẩu</Text>
              <View style={styles.actionInputWrapper}>
                <TextInput
                  style={styles.actionTextInput}
                  placeholder="Nhập mật khẩu mới"
                  placeholderTextColor="#6B7280"
                  secureTextEntry={true}
                  value={newPassword}
                  onChangeText={setNewPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={changePassword}
                  activeOpacity={0.8}
                >
                  <Text style={styles.actionButtonText}>Cập nhật</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={logout}
          activeOpacity={0.8}
        >
          <Text style={styles.logoutButtonText}>Đăng xuất tài khoản</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#0A0E1A",
  },
  scroll: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingTop: Platform.OS === "ios" ? 40 : 20,
    paddingBottom: 40,
  },
  brandContainer: {
    alignItems: "center",
    marginTop: 40,
    marginBottom: 30,
  },
  logoIcon: {
    fontSize: 48,
    marginBottom: 10,
    textShadowColor: "rgba(99, 102, 241, 0.4)",
    textShadowOffset: { width: 0, height: 4 },
    textShadowRadius: 10,
  },
  brandName: {
    fontSize: 24,
    fontWeight: "900",
    color: "#FFFFFF",
    letterSpacing: 2,
  },
  brandSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 6,
  },
  authCard: {
    backgroundColor: "#151A30",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#242E4A",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 20,
    elevation: 8,
  },
  authTitle: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 24,
    textAlign: "center",
  },
  inputWrapper: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: "#A5B4FC",
    marginBottom: 8,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#1D243F",
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "#2E3A5F",
    paddingHorizontal: 14,
  },
  inputIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  textInput: {
    flex: 1,
    height: 48,
    color: "#FFFFFF",
    fontSize: 15,
  },
  primaryButton: {
    backgroundColor: "#6366F1",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  secondaryLink: {
    marginTop: 20,
    alignItems: "center",
  },
  secondaryLinkText: {
    color: "#9CA3AF",
    fontSize: 14,
  },
  highlightText: {
    color: "#818CF8",
    fontWeight: "bold",
  },
  profileHeader: {
    marginTop: 30,
    marginBottom: 24,
    alignItems: "center",
  },
  profileHeaderTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#FFFFFF",
  },
  profileHeaderSubtitle: {
    fontSize: 14,
    color: "#9CA3AF",
    marginTop: 4,
  },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#151A30",
    borderRadius: 14,
    padding: 4,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: "#242E4A",
  },
  tabButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  tabButtonActive: {
    backgroundColor: "#6366F1",
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 2,
  },
  tabText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#9CA3AF",
  },
  tabTextActive: {
    color: "#FFFFFF",
  },
  tabContent: {
    width: "100%",
  },
  profileCard: {
    backgroundColor: "#151A30",
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: "#242E4A",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
  },
  avatarContainer: {
    alignItems: "center",
    marginBottom: 20,
  },
  avatarCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: "#6366F1",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 12,
    shadowColor: "#6366F1",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 8,
    elevation: 5,
  },
  avatarText: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#FFFFFF",
  },
  profileEmail: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 6,
  },
  badge: {
    backgroundColor: "rgba(16, 185, 129, 0.15)",
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(16, 185, 129, 0.3)",
  },
  badgeText: {
    color: "#10B981",
    fontSize: 12,
    fontWeight: "600",
  },
  divider: {
    height: 1,
    backgroundColor: "#242E4A",
    marginVertical: 16,
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
  },
  infoLabel: {
    fontSize: 14,
    color: "#9CA3AF",
    flex: 1,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#FFFFFF",
    textAlign: "right",
    flex: 1.5,
  },
  card: {
    backgroundColor: "#151A30",
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: "#242E4A",
    marginBottom: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#FFFFFF",
    marginBottom: 10,
  },
  cardDesc: {
    fontSize: 13,
    color: "#9CA3AF",
    marginBottom: 16,
    lineHeight: 18,
  },
  tokenContainer: {
    backgroundColor: "#1D243F",
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: "#2E3A5F",
  },
  tokenText: {
    fontSize: 12,
    color: "#A5B4FC",
    fontFamily: Platform.OS === "ios" ? "Courier" : "monospace",
    lineHeight: 16,
  },
  secondaryButton: {
    backgroundColor: "#06B6D4",
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  actionInputWrapper: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionTextInput: {
    flex: 1,
    height: 46,
    backgroundColor: "#1D243F",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#2E3A5F",
    paddingHorizontal: 14,
    color: "#FFFFFF",
    fontSize: 14,
    marginRight: 10,
  },
  actionButton: {
    backgroundColor: "#6366F1",
    paddingHorizontal: 16,
    height: 46,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  actionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "bold",
  },
  logoutButton: {
    backgroundColor: "rgba(244, 63, 94, 0.1)",
    borderWidth: 1,
    borderColor: "rgba(244, 63, 94, 0.4)",
    height: 52,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  logoutButtonText: {
    color: "#F43F5E",
    fontSize: 15,
    fontWeight: "bold",
  },
});
