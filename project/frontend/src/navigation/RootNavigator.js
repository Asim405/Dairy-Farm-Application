import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { MaterialIcons } from '@expo/vector-icons';

import { LoginScreen } from '../screens/LoginScreen';
import { RegisterScreen } from '../screens/RegisterScreen';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { ReportsScreen } from '../screens/ProductionSalesScreen';
import { SettingsScreen } from '../screens/SettingsScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { LiveStockScreen } from '../screens/LiveStockScreen';
import { AddAnimalScreen } from '../screens/AddAnimalScreen';
import { HealthManagementScreen } from '../screens/HealthManagementScreen';
import { ProductionSalesScreen } from '../screens/ProductionSalesScreen';
import { FinanceOperationsScreen } from '../screens/FinanceOperationsScreen';
import { StaffManagementScreen } from '../screens/StaffManagementScreen';
import { AddStaffScreen } from '../screens/AddStaffScreen';
import { InventoryManagementScreen } from '../screens/InventoryManagementScreen';
import { AddInventoryItemScreen } from '../screens/AddInventoryItemScreen';
import { CropsDetailScreen } from '../screens/CropsDetailScreen';
import { AddCropScreen } from '../screens/AddCropScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

export const AuthStack = () => (
  <Stack.Navigator
    screenOptions={{
      headerShown: false,
    }}
  >
    <Stack.Screen name="Login" component={LoginScreen} />
    <Stack.Screen name="Register" component={RegisterScreen} />
  </Stack.Navigator>
);

const MainTabs = () => (
  <Tab.Navigator
    screenOptions={({ route }) => ({
      headerShown: false,
      tabBarIcon: ({ color, size }) => {
        const icons = {
          Home: 'home',
          Search: 'search',
          Add: 'add-circle',
          Reports: 'bar-chart',
          Settings: 'settings',
        };
        return <MaterialIcons name={icons[route.name] || 'circle'} size={size} color={color} />;
      },
      tabBarActiveTintColor: '#4FA765',
      tabBarInactiveTintColor: '#7B8794',
      tabBarStyle: { height: 64, paddingBottom: 10, paddingTop: 8 },
      tabBarLabelStyle: { fontSize: 12 },
    })}
  >
    <Tab.Screen name="Home" component={HomeScreen} />
    <Tab.Screen name="Search" component={SearchScreen} />
    <Tab.Screen
      name="Add"
      component={AddAnimalScreen}
      options={{
        tabBarLabel: '',
      }}
    />
    <Tab.Screen name="Reports" component={ReportsScreen} />
    <Tab.Screen name="Settings" component={SettingsScreen} />
  </Tab.Navigator>
);

export const AppStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="Main" component={MainTabs} options={{ headerShown: false }} />

    <Stack.Screen name="Profile" component={ProfileScreen} options={{ headerShown: false }} />

    <Stack.Screen name="LiveStock" component={LiveStockScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddAnimal" component={AddAnimalScreen} options={{ headerShown: false }} />

    <Stack.Screen name="Health" component={HealthManagementScreen} options={{ headerShown: false }} />

    <Stack.Screen name="ProductionSales" component={ProductionSalesScreen} options={{ headerShown: false }} />

    <Stack.Screen name="FinanceOperations" component={FinanceOperationsScreen} options={{ headerShown: false }} />

    <Stack.Screen name="StaffManagement" component={StaffManagementScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddStaff" component={AddStaffScreen} options={{ headerShown: false }} />

    <Stack.Screen name="InventoryManagement" component={InventoryManagementScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddInventoryItem" component={AddInventoryItemScreen} options={{ headerShown: false }} />

    <Stack.Screen name="CropsDetail" component={CropsDetailScreen} options={{ headerShown: false }} />
    <Stack.Screen name="AddCrop" component={AddCropScreen} options={{ headerShown: false }} />
  </Stack.Navigator>
);

export const RootNavigator = ({ isLoading, state }) => {
  return (
    <NavigationContainer>
      {isLoading ? null : state.userToken == null ? <AuthStack /> : <AppStack />}
    </NavigationContainer>
  );
};
