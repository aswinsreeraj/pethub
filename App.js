/*---------------------------------------------------------------------------
	File Name:	App.js
	Author:		Aswin Sreeraj
	Date:		20/06/2024
	Modified:	Aswin Sreeraj & 15/07/2024
	© Fanshawe College, 2024

	Description: Code for index file of the app. The app runs from this code.
---------------------------------------------------------------------------*/

// Import dependencies ========================================================
import React, {useContext} from 'react';
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
import AsyncStorage from '@react-native-async-storage/async-storage';
import checkESP32Server from "./components/checkESP32Server";
import {useEffect, useState} from "react";
//===============================================================================

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

/*>>> MainTabs: ===========================================================
Author:		Aswin Sreeraj
Date:		20/06/2024
Modified:	None
Desc:		Set up tab navigation while inside the user dashboard
Input: 		None
Returns:	None
=============================================================================*/
const MainTabs = () => {
    const colors = useColorScheme();
    return (
        <Tab.Navigator
            initialRouteName="Home"
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
    ); // eo return
}; // eo MainTabs::

const App = () => {
    const [initialRoute, setInitialRoute] = useState('ConnectESP32');

    useEffect(() => {
        const initializeApp = async () => {
            try {
                const storedIP = await AsyncStorage.getItem('serverIP');
                //console.log(storedIP);
                if (storedIP) {
                    const serverRunning = await checkESP32Server(storedIP);
                    //console.log(serverRunning);
                    if (serverRunning) {
                        setInitialRoute('MainTabs');
                    } else {
                        setInitialRoute('ConnectESP32');
                    }
                    //setInitialRoute(serverRunning ? 'MainTabs' : 'ConnectESP32');
                    console.log(initialRoute);
                } else {
                    setInitialRoute('ConnectESP32');
                    console.log(storedIP);
                    console.log('No Server');
                } // eo if-else
            } catch (error) {
                console.error('Error initializing app:', error);
                setInitialRoute('ConnectESP32');
            } // eo try-catch
        }; // eo initialApp::

        initializeApp();
    }, []); // eo useEffect

    if (!initialRoute) {
        return null;
    } // eo if
    return (
        <SafeAreaProvider>
            <AppProvider>
                <NavigationContainer independent={true}>
                    <Stack.Navigator initialRouteName={initialRoute}>
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
    ); // eo return
}; // eo App::

export default App;

//===========================================================================
