/*---------------------------------------------------------------------------
	File Name:	ConnectESP32Screen.js
	Author:		Aswin Sreeraj
	Date:		20/06/2024
	Modified:	Aswin Sreeraj & 15/07/2024
	© Fanshawe College, 2024

	Description: BLE interface
---------------------------------------------------------------------------*/
import React, {useState, useEffect, useContext} from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    Alert,
    Platform,
    PermissionsAndroid,
    useColorScheme,
    StyleSheet,
    StatusBar,
    ScrollView,
    RefreshControl
} from 'react-native';
import { NetworkInfo } from 'react-native-network-info';
import { BleManager } from 'react-native-ble-plx';
import base64 from 'react-native-base64';
import MCIIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppContext from '../global/AppContext';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SERVICE_UUID = '4fafc201-1fb5-459e-8fcc-c5c9c331914b';
const CHARACTERISTIC_UUID = 'beb5483e-36e1-4688-b7f5-ea07361b26a8';

const manager = new BleManager();

const ConnectESP32Screen = ({ navigation }) => {
    const [device, setDevice] = useState(null);
    const [ssid, setSSID] = useState('');
    const [password, setPassword] = useState('');
    const {serverIP, setServerIP} = useContext(AppContext);
    const [connectStatus, setConnectStatus] = useState('');
    const [focusItem, setFocusItem] = useState(0);
    const colors = useColorScheme();
    const styles = setStyle(colors);
    const [refreshing, setRefreshing] = useState(false);
    const iconColor = colors === 'dark' ? 'black' : 'white';
    const iconBG = colors === 'dark' ? 'white' : 'black';
    const iconSize = 20;
    const [showPassword, setShowPassword] = useState(false);

    const ESP32URL = `http://${serverIP}:80/`;

    useEffect(() => {
        const subscription = manager.onStateChange((state) => {
            if (state === 'PoweredOn') {
                requestPermissions();
            }
        }, true);
        return () => subscription.remove();
    }, []);

    useEffect(() => {
        // Dynamically set the StatusBar style based on the color scheme
        StatusBar.setBarStyle(colors === 'dark' ? 'light-content' : 'dark-content');
        if (Platform.OS === 'android') {
            StatusBar.setBackgroundColor(colors === 'dark' ? 'black' : 'white');
        }
    }, [colors]);

    const saveIP = async () => {
        try {
            await AsyncStorage.setItem('serverIP', serverIP);
        }
        catch (error) {
            console.error('Storage Error: ', error)
        }

    }

    const requestPermissions = async () => {
        if (Platform.OS === 'android') {
            const granted = await PermissionsAndroid.request(
                PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
                {
                    title: 'Location Permission',
                    message: 'This app needs access to your location for Bluetooth scanning.',
                    buttonNeutral: 'Ask Me Later',
                    buttonNegative: 'Cancel',
                    buttonPositive: 'OK',
                },
            );
            if (granted === PermissionsAndroid.RESULTS.GRANTED) {
                console.log('Location permission granted');
                scanAndConnect();
                fetchSSID();
            } else {
                console.log('Location permission denied');
            }
        } else {
            scanAndConnect();
            fetchSSID();
        }
    };

    const fetchSSID = () => {
        if (Platform.OS === 'ios') {
            NetworkInfo.getSSID().then(ssid => {
                setSSID(ssid);
            });
        } else if (Platform.OS === 'android') {
            NetworkInfo.getSSID().then(ssid => {
                setSSID(ssid);
                if(ssid == '<unknown ssid>') {
                    Alert.alert('SSID Error', 'Enable location to fetch SSID')
                }
            });
        }
    };

    const scanAndConnect = () => {
        manager.startDeviceScan(null, null, (error, scannedDevice) => {
            if (error) {
                console.log('Scanning error:', error);
                return;
            }

            if (scannedDevice.name === 'ESP32') {
                manager.stopDeviceScan();
                scannedDevice.connect()
                    .then((device) => {
                        setDevice(device);
                        console.log('Device Connected.!');
                        setConnectStatus('Connected to ESP32');
                        return device.discoverAllServicesAndCharacteristics();
                    })
                    .then((device) => {
                        device.monitorCharacteristicForService(SERVICE_UUID, CHARACTERISTIC_UUID, (error, characteristic) => {
                            if (error) {
                                console.log(base64.decode(characteristic.value))
                                setConnectStatus('Connection Error');
                                console.log('Monitoring error:', error);
                                return;
                            }
                            setServerIP(base64.decode(characteristic.value));
                            saveIP();
                        });
                    })
                    .catch((error) => {
                        setConnectStatus('Connection Error');
                        console.log('Connection error:', error);
                    });
            }
        });
    };

    const onRefresh = async () => {
        setRefreshing(true);
        fetchSSID();
        setRefreshing(false);
    };

    const sendWiFiCredentials = () => {
        if (!device) {
            Alert.alert('Error', 'Device not connected');
            return;
        }

        const data = `${ssid}|${password}`;
        const encodedData = base64.encode(data);

        device.writeCharacteristicWithResponseForService(SERVICE_UUID, CHARACTERISTIC_UUID, encodedData)
            .then(() => {
                console.log('WiFi credentials sent successfully');
                navigation.replace('MainTabs'); // Navigate to MainTabs after successful connection
            })
            .catch((error) => {
                console.log('Send error:', error);
                Alert.alert('Error', 'Failed to send WiFi credentials');
            });
    };

    return (
        <ScrollView
            refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
            style={styles.container}>
            <Text style={styles.header}>Pet HUB</Text>
            <TouchableOpacity style={styles.button} onPress={scanAndConnect}>
                <Text style={styles.buttonText}>Connect to ESP32</Text>
            </TouchableOpacity>
            <Text style={styles.reactiveText}>{connectStatus}</Text>
            {ssid === '<unknown ssid>' ? '' :
                <Text style={styles.normalText}>Wifi SSID:
                    <Text style={styles.reactiveText}> {ssid}</Text>
                </Text>}
            <Text style={styles.normalText}>Enter Wifi password below</Text>
            <View style={styles.passwordField}>
                <TextInput
                    placeholder="WiFi Password"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry={!showPassword}
                    style={[styles.textInput, {borderColor:  focusItem === 2 ? (colors === 'dark' ? 'white': 'black')
                            : (colors === 'dark' ? 'darkgray': 'lightgray'), flex: 7}]}
                    placeholderTextColor={'gray'}
                    onFocus={() => setFocusItem(2)}
                />
                <TouchableOpacity style={styles.passwordButton} onPress={() => setShowPassword(!showPassword)}>
                    {showPassword ? <MCIIcon
                            name="eye"
                            size={iconSize}
                            color={iconColor}
                            backgroundColor={iconBG}
                            style={styles.iconStyle}/> :
                        <MCIIcon
                            name="eye-off"
                            size={iconSize}
                            color={iconColor}
                            backgroundColor={iconBG}
                            style={styles.iconStyle}/> }
                </TouchableOpacity>
            </View>
            <TouchableOpacity style={styles.button} onPress={sendWiFiCredentials}>
                <Text style={styles.buttonText}>Send WiFi Credentials</Text>
            </TouchableOpacity>
            {serverIP ? (
                <Text style={styles.normalText}>Server IP:
                    <Text style={styles.reactiveText}> {ESP32URL}</Text>
                </Text>
            ) : null}
        </ScrollView>
    );
};

const setStyle =  (colors) => {

    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            //justifyContent: 'center',
            backgroundColor: colors === 'dark' ? 'black' : 'white',
        },
        header: {
            color: colors === 'dark' ? 'white' : 'black',
            fontSize: 28,
            fontWeight: 'bold',
            marginBottom: 50,
        },
        button: {
            padding: 5,
            marginVertical: 10,
            alignItems: 'center',
            backgroundColor: colors === 'dark' ? 'cyan' : 'navy',
            borderWidth: 0,
            borderRadius: 100
        },
        buttonText: {
            color: colors === 'dark' ? 'black' : 'white',
        },
        textInput: {
            marginVertical: 10,
            borderWidth: 1,
            padding: 10,
            color: colors === 'dark' ? 'white' : 'black',
            borderColor: colors === 'dark' ? 'gray' : 'darkgray',
            borderRadius: 10
        },
        normalText: {
            marginVertical: 5,
            color: colors === 'dark' ? 'white' : 'black',
        },
        reactiveText: {
            fontWeight: 'bold',
            marginVertical: 5,
            color: colors === 'dark' ? '#a49966' : 'purple',
        },
        passwordField: {
            flexDirection: 'row',
        },
        iconStyle: {
            paddingVertical: 10,
            borderRadius: 5,
            textAlign: 'center',
            textAlignVertical: 'center',
        },
        passwordButton: {
            flex: 1,
            justifyContent: 'center',
            margin: 5,
            marginVertical: 5,
        }
    })
}

export default ConnectESP32Screen;

//===========================================================================
