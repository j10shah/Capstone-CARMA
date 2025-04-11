"use client";

import { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal, FlatList } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { ChevronDown, Home as HomeIcon, Bell, User } from "react-native-feather";
import { RootStackParamList } from "../App";
import Video from "react-native-video";
import storage from "@react-native-firebase/storage";

const HomeScreen = () => {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();
  const [selectedCamera, setSelectedCamera] = useState("Front View");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState<string>("");

  const cameraOptions: string[] = ["Front View", "Back Right", "Back Left"];

  const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

  const selectCamera = (camera: string): void => {
    setSelectedCamera(camera);
    setDropdownOpen(false);
  };

  useEffect(() => {
    let isMounted = true;
  
    const waitForVideo = async () => {
      const maxRetries = 10;
      let attempts = 0;
  
      while (attempts < maxRetries) {
        try {
          const url = await storage().ref("videos/sample-video.mp4").getDownloadURL();
          if (isMounted) {
            console.log("🎥 Video found, setting URL...");
            setVideoUrl(url);
          }
          return;
        } catch (error: any) {
          if (error.code === 'storage/object-not-found') {
            console.log("🔁 Video not yet uploaded, retrying...");
            await new Promise((resolve) => setTimeout(resolve, 2000)); // wait 2s
            attempts++;
          } else {
            console.error("⚠️ Unexpected error:", error);
            return;
          }
        }
      }
  
      console.warn("❌ Gave up waiting for video upload.");
    };
  
    waitForVideo();
  
    return () => {
      isMounted = false;
    };
  }, []);
  

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>CARMA</Text>
      </View>

      {/* Main content */}
      <View style={styles.content}>
        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate("History")}>
          <Text style={styles.menuButtonText}>History</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate("Recordings")}>
          <Text style={styles.menuButtonText}>Recordings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate("Settings")}>
          <Text style={styles.menuButtonText}>Settings</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuButton} onPress={() => navigation.navigate("Storage")}>
          <Text style={styles.menuButtonText}>Storage</Text>
        </TouchableOpacity>

        {/* Cameras section */}
        <View style={styles.camerasSection}>
          <Text style={styles.camerasLabel}>Cameras</Text>
          <View style={styles.dropdownContainer}>
            <TouchableOpacity style={styles.dropdownButton} onPress={toggleDropdown}>
              <Text style={styles.dropdownButtonText}>{selectedCamera}</Text>
              <ChevronDown width={20} height={20} color="#999" />
            </TouchableOpacity>

            <Modal
              visible={dropdownOpen}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setDropdownOpen(false)}
            >
              <TouchableOpacity style={styles.modalOverlay} activeOpacity={1} onPress={() => setDropdownOpen(false)}>
                <View style={[styles.dropdownMenu, { top: 320 }]}>
                  <FlatList
                    data={cameraOptions}
                    keyExtractor={(item) => item}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={styles.dropdownItem} onPress={() => selectCamera(item)}>
                        <Text style={styles.dropdownItemText}>{item}</Text>
                      </TouchableOpacity>
                    )}
                  />
                </View>
              </TouchableOpacity>
            </Modal>
          </View>
        </View>

        {/* Camera view (Video player) */}
        <View style={styles.cameraView}>
          {videoUrl ? (
            <Video
            source={{ uri: videoUrl }}
            style={styles.cameraImage}
            controls
            resizeMode="cover"
            paused={false}
            onError={(e) => console.error("❌ Video error:", e)}
            onLoad={(e) => console.log("✅ Video loaded:", e)}
          />          
          ) : (
            <Text>Loading video...</Text>
          )}
        </View>
      </View>

      {/* Bottom navigation */}
      <View style={styles.bottomNav}>
        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Dashboard")}>
          <HomeIcon width={24} height={24} color="#000" />
          <Text style={styles.navButtonText}>Dashboard</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Notifications")}>
          <Bell width={24} height={24} color="#000" />
          <Text style={styles.navButtonText}>Notifications</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.navButton} onPress={() => navigation.navigate("Profile")}>
          <User width={24} height={24} color="#000" />
          <Text style={styles.navButtonText}>Profile</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingVertical: 24, alignItems: "center" },
  headerTitle: { fontSize: 24, fontWeight: "bold" },
  content: { flex: 1, paddingHorizontal: 16 },
  menuButton: {
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
    marginBottom: 12,
    alignItems: "center",
  },
  menuButtonText: { fontSize: 16 },
  camerasSection: { marginTop: 8, marginBottom: 12 },
  camerasLabel: { fontSize: 16, color: "#666", marginBottom: 8 },
  dropdownContainer: { position: "relative", zIndex: 1 },
  dropdownButton: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    borderRadius: 12,
  },
  dropdownButtonText: { fontSize: 16, color: "#666" },
  modalOverlay: { flex: 1, backgroundColor: "rgba(0, 0, 0, 0.5)" },
  dropdownMenu: {
    position: "absolute",
    left: 20,
    right: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#e5e5e5",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f5f5f5",
  },
  dropdownItemText: { fontSize: 16, color: "#666" },
  cameraView: {
    flex: 1,
    borderRadius: 12,
    overflow: "hidden",
    marginBottom: 16,
    backgroundColor: "#000",
  },
  cameraImage: {
    width: "100%",
    height: "100%",
  },
  bottomNav: {
    flexDirection: "row",
    borderTopWidth: 1,
    borderTopColor: "#e5e5e5",
    paddingVertical: 16,
  },
  navButton: { flex: 1, alignItems: "center", justifyContent: "center" },
  navButtonText: { fontSize: 12, marginTop: 4 },
});

export default HomeScreen;
