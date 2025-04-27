import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, Platform } from 'react-native';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from '../contexts/ThemeContext';

// Ekranları içe aktarma
import HomeScreen from '../screens/HomeScreen';
import DevicesScreen from '../screens/DevicesScreen';
import AllDevicesScreen from '../screens/devices/AllDevicesScreen';
import CourtOfficesScreen from '../screens/devices/CourtOfficesScreen';
import Courtrooms from '../screens/devices/Courtrooms';
import JudgeRoomsScreen from '../screens/devices/JudgeRoomsScreen';
import JudgeRoomDetail from '../screens/devices/JudgeRoomDetail';
import JudgeRoomForm from '../screens/devices/JudgeRoomForm';
import IssuesScreen from '../screens/IssuesScreen';
import ScannerScreen from '../screens/ScannerScreen';
import ProfileScreen from '../screens/ProfileScreen';
import DeviceDetailScreen from '../screens/devices/DeviceDetailScreen';
import AddDeviceScreen from '../screens/AddDeviceScreen';
import DeviceFormScreen from '../screens/DeviceFormScreen';
import CourtOfficeForm from '../screens/CourtOfficeForm';
import CourtOfficeDetailScreen from '../screens/devices/CourtOfficeDetailScreen';
import CourtOfficePersonnelForm from '../screens/CourtOfficePersonnelForm';
import CourtroomForm from '../screens/devices/CourtroomForm';
import CourtroomDetail from '../screens/devices/CourtroomDetail';
import DeviceTypeDetail from '../screens/devices/DeviceTypeDetail';
import IssueReportScreen from '../screens/issues/IssueReportScreen';
import IssueListScreen from '../screens/issues/IssueListScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

const Tab = createBottomTabNavigator();
const DevicesStack = createStackNavigator();
const IssuesStack = createStackNavigator();
const HomeStack = createStackNavigator();

// Stack navigator options that use the theme
const createThemedStackNavigator = (Stack) => {
  const { theme } = useTheme();
  
  return () => {
    return (
      <Stack.Navigator 
        screenOptions={{ 
          headerShown: false,
          cardStyle: { backgroundColor: theme.background },
        }}
        initialRouteName={Stack === DevicesStack ? "DevicesMain" : Stack === HomeStack ? "HomeMain" : "IssuesMain"}
      >
        {Stack === HomeStack ? (
          <>
            <HomeStack.Screen name="HomeMain" component={HomeScreen} />
            <HomeStack.Screen name="Notifications" component={NotificationsScreen} />
          </>
        ) : Stack === DevicesStack ? (
          <>
            <DevicesStack.Screen name="DevicesMain" component={DevicesScreen} />
            <DevicesStack.Screen name="AllDevices" component={AllDevicesScreen} />
            <DevicesStack.Screen name="CourtOffices" component={CourtOfficesScreen} />
            <DevicesStack.Screen name="Courtrooms" component={Courtrooms} />
            <DevicesStack.Screen name="JudgeRooms" component={JudgeRoomsScreen} />
            <DevicesStack.Screen name="JudgeRoomDetail" component={JudgeRoomDetail} />
            <DevicesStack.Screen name="JudgeRoomForm" component={JudgeRoomForm} />
            <DevicesStack.Screen name="DeviceDetail" component={DeviceDetailScreen} />
            <DevicesStack.Screen name="AddDevice" component={AddDeviceScreen} />
            <DevicesStack.Screen name="DeviceForm" component={DeviceFormScreen} />
            <DevicesStack.Screen name="CourtOfficeForm" component={CourtOfficeForm} />
            <DevicesStack.Screen name="CourtOfficeDetail" component={CourtOfficeDetailScreen} />
            <DevicesStack.Screen name="CourtOfficePersonnelForm" component={CourtOfficePersonnelForm} />
            <DevicesStack.Screen name="CourtroomForm" component={CourtroomForm} />
            <DevicesStack.Screen name="CourtroomDetail" component={CourtroomDetail} />
            <DevicesStack.Screen name="DeviceTypeDetail" component={DeviceTypeDetail} />
          </>
        ) : (
          <>
            <IssuesStack.Screen name="IssuesMain" component={IssuesScreen} />
            <IssuesStack.Screen name="IssueList" component={IssueListScreen} />
            <IssuesStack.Screen name="IssueReport" component={IssueReportScreen} />
          </>
        )}
      </Stack.Navigator>
    );
  };
};

const TabNavigator = () => {
  const { theme } = useTheme();
  
  const HomeNavigator = createThemedStackNavigator(HomeStack);
  const DevicesNavigator = createThemedStackNavigator(DevicesStack);
  const IssuesNavigator = createThemedStackNavigator(IssuesStack);
  
  return (
    <Tab.Navigator
      initialRouteName="Home"
      screenOptions={{
        tabBarActiveTintColor: theme.tabBarActiveColor,
        tabBarInactiveTintColor: theme.tabBarInactiveColor,
        tabBarStyle: {
          height: Platform.OS === 'ios' ? 80 : 60,
          paddingBottom: Platform.OS === 'ios' ? 20 : 5,
          paddingTop: 5,
          backgroundColor: theme.tabBarBackground,
          borderTopWidth: 1,
          borderTopColor: theme.border,
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
          marginBottom: Platform.OS === 'ios' ? 5 : 0,
        },
        safeAreaInsets: { top: 0 },
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeNavigator} 
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
        listeners={({ navigation }) => ({
          tabPress: (e) => {
            // Reset to initial route when tab is pressed
            e.preventDefault();
            navigation.navigate('Devices', { screen: 'DevicesMain' });
          },
        })}
      />
      <Tab.Screen 
        name="Issues" 
        component={IssuesNavigator} 
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