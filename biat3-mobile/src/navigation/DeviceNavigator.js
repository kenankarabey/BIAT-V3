import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';

// Import screens
import Courtrooms from '../screens/devices/Courtrooms';
import CourtroomDetail from '../screens/devices/CourtroomDetail';
import CourtroomForm from '../screens/devices/CourtroomForm';
import DeviceTypeDetail from '../screens/devices/DeviceTypeDetail';
import DeviceDetailScreen from '../screens/devices/DeviceDetailScreen';

const Stack = createStackNavigator();

const DeviceNavigator = () => {
  return (
    <Stack.Navigator
      initialRouteName="Courtrooms"
      screenOptions={{
        headerShown: false,
        cardStyle: { backgroundColor: '#f5f5f5' },
        contentStyle: { paddingTop: 0 },
        safeAreaInsets: { top: 0 },
      }}
    >
      <Stack.Screen name="Courtrooms" component={Courtrooms} />
      <Stack.Screen name="CourtroomDetail" component={CourtroomDetail} />
      <Stack.Screen name="CourtroomForm" component={CourtroomForm} />
      <Stack.Screen name="DeviceTypeDetail" component={DeviceTypeDetail} />
      <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} />
    </Stack.Navigator>
  );
};

export default DeviceNavigator; 