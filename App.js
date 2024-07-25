/*---------------------------------------------------------------------------
	File Name:	App.js
	Author:		Aswin Sreeraj
	Date:		20/06/2024
	Modified:	Aswin Sreeraj & 15/07/2024
	© Fanshawe College, 2024

	Description: Code for index file of the app. The app runs from this code.
---------------------------------------------------------------------------*/
import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from './screens/HomeScreen';
import ConfigurationScreen from './screens/ConfigurationScreen';
import SettingsScreen from './screens/SettingsScreen';
import { Ionicons } from '@expo/vector-icons';
import { useColorScheme } from "react-native";
import { AppProvider } from './global/AppContext';
import ConnectESP32Screen from './screens/ConnectESP32Screen';
import 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';


const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

const MainTabs = () => {
    const colors = useColorScheme();
    return (
        <Tab.Navigator
            initialRouteName="ConnectESP32"
            screenOptions={({ route }) => ({
                headerShown: false,
                tabBarIcon: ({ color, size }) => {
                    let iconName;

                    if (route.name === 'Home') {
                        iconName = 'home';
                    } else if (route.name === 'Configuration') {
                        iconName = 'calendar';
                    } else if (route.name === 'Settings') {
                        iconName = 'settings';
                    }

                    return <Ionicons name={iconName} size={size} color={color} />;
                },
                tabBarStyle: {
                    backgroundColor: colors === 'dark' ? 'black' : 'white',
                    borderTopWidth: 0,
                },
                tabBarActiveTintColor: colors === 'dark' ? 'white' : 'black',
                tabBarInactiveTintColor: 'gray',
            })}
        >
            <Tab.Screen name="Home" component={HomeScreen} />
            <Tab.Screen name="Configuration" component={ConfigurationScreen} />
            <Tab.Screen name="Settings" component={SettingsScreen} />
        </Tab.Navigator>
    );
};

const App = () => {
    return (
        <SafeAreaProvider>
            <AppProvider>
                <NavigationContainer independent={true}>
                    <Stack.Navigator initialRouteName="ConnectESP32">
                        <Stack.Screen
                            name="ConnectESP32"
                            component={ConnectESP32Screen}
                            options={{ headerShown: false }}
                        />
                        <Stack.Screen
                            name="MainTabs"
                            component={MainTabs}
                            options={{ headerShown: false }}
                        />
                    </Stack.Navigator>
                </NavigationContainer>
            </AppProvider>
        </SafeAreaProvider>
    );
};

export default App;

//===========================================================================
