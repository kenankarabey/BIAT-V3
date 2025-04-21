import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';

// Ekranları içe aktarma
import HomeScreen from '../screens/HomeScreen';
import DevicesScreen from '../screens/DevicesScreen';
import AllDevicesScreen from '../screens/devices/AllDevicesScreen';
import CourtOfficesScreen from '../screens/devices/CourtOfficesScreen';
import CourtroomsScreen from '../screens/devices/CourtroomsScreen';
import JudgeRoomsScreen from '../screens/devices/JudgeRoomsScreen';
import IssuesScreen from '../screens/IssuesScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DeviceDetailScreen from '../screens/devices/DeviceDetailScreen';
import AddDeviceScreen from '../screens/AddDeviceScreen';
import DeviceFormScreen from '../screens/DeviceFormScreen';

const Tab = createBottomTabNavigator();
const DevicesStack = createStackNavigator();

// Cihazlar Navigator
const DevicesNavigator = () => {
  return (
    <DevicesStack.Navigator screenOptions={{ headerShown: false }}>
      <DevicesStack.Screen name="DevicesMain" component={DevicesScreen} />
      <DevicesStack.Screen name="AllDevices" component={AllDevicesScreen} />
      <DevicesStack.Screen name="CourtOffices" component={CourtOfficesScreen} />
      <DevicesStack.Screen name="Courtrooms" component={CourtroomsScreen} />
      <DevicesStack.Screen name="JudgeRooms" component={JudgeRoomsScreen} />
      <DevicesStack.Screen name="DeviceDetail" component={DeviceDetailScreen} />
      <DevicesStack.Screen name="AddDevice" component={AddDeviceScreen} />
      <DevicesStack.Screen name="DeviceForm" component={DeviceFormScreen} />
    </DevicesStack.Navigator>
  );
};

const TabNavigator = () => {
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: '#1e3a8a',
        tabBarInactiveTintColor: '#64748b',
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 90 : 70,
          paddingTop: 5,
          paddingBottom: Platform.OS === 'ios' ? 25 : 10,
          backgroundColor: '#ffffff',
          borderTopWidth: 1,
          borderTopColor: '#e2e8f0',
          elevation: 10,
          shadowColor: '#000000',
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
        },
        headerShown: false,
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
        },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{
          tabBarLabel: 'Ana Sayfa',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? 'home' : 'home-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Devices" 
        component={DevicesNavigator} 
        options={{
          tabBarLabel: 'Cihazlar',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? 'desktop' : 'desktop-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Issues" 
        component={IssuesScreen} 
        options={{
          tabBarLabel: 'Arıza Takip',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? 'warning' : 'warning-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Scanner" 
        component={ScannerScreen} 
        options={{
          tabBarLabel: 'Tarayıcı',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? 'qr-code' : 'qr-code-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{
          tabBarLabel: 'Profil',
          tabBarIcon: ({ color, size, focused }) => (
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name={focused ? 'person' : 'person-outline'} size={size} color={color} />
            </View>
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export default TabNavigator; 