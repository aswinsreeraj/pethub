/*---------------------------------------------------------------------------
	File Name:	HomeScreen.js
	Author:		Aswin Sreeraj
	Date:		20/06/2024
	Modified:	Aswin Sreeraj & 15/07/2024
	© Fanshawe College, 2024

	Description: For the home page of the app
---------------------------------------------------------------------------*/
import React, { useEffect, useState, useContext } from 'react';
import {View, Text, StyleSheet, RefreshControl, ScrollView, useColorScheme, Platform} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import FA6Icon from 'react-native-vector-icons/FontAwesome6';
import MCIIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AppContext from '../global/AppContext';
import ProgressBar from 'react-native-progress/Bar';
import configureBackgroundFetch from '../components/BackgroundFetchConfig';
import { showNotification } from '../components/PushNotificationConfig';
import { createNotificationChannel } from '../components/PushNotificationConfig'
import checkESP32Server from "../components/checkESP32Server";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {StackActions, useIsFocused} from '@react-navigation/native';

const HomeScreen = ({ navigation }) => {
    const [refreshing, setRefreshing] = useState(false);
    const [sensorData, setSensorData] = useState({});
    const [isLoading, setLoading] = useState(true);
    const { tempPref } = useContext(AppContext);
    const {serverIP, setServerIP} = useContext(AppContext);
    const [ healthData, setHealthData] = useState({});
    const isFocused = useIsFocused();
    const [stopFetch, setStopFetch] = useState(false);

    const fetchIP = async () => {
        const storedIP = await AsyncStorage.getItem('serverIP');
        console.log(storedIP);
        setServerIP(storedIP);
        if (storedIP) {
            const serverRunning = await checkESP32Server(storedIP);
            //console.log(serverRunning);
            if(!serverRunning) {
                setStopFetch(true);
                navigation.dispatch(
                    StackActions.replace('ConnectESP32')
                );
            }
        }
    }


    const requestNotificationPermission = async () => {
        if (Platform.OS === 'android') {
            const result = await check(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
            if (result !== RESULTS.GRANTED) {
                const status = await request(PERMISSIONS.ANDROID.POST_NOTIFICATIONS);
                if (status !== RESULTS.GRANTED) {
                    console.warn('Notification permission not granted');
                }
            }
        }
    };

    useEffect(() => {
        requestNotificationPermission();
    }, []);

    const parseData = (dataString) => {
        if (!dataString) return {};
        const dataSegments = dataString.split('#');
        const data = {};
        data.senseTemp = sensorData.senseTemp || 0;
        data.odorValue = sensorData.odorValue || 0;
        data.waterLevel = sensorData.waterLevel || 0;
        data.foodLevel = sensorData.foodLevel || 0;

        dataSegments.forEach(segment => {
            const values = segment.replace('$', '').split(',');
            const commandCode = parseInt(values[0], 10);
            if (commandCode === 3) {
                const subCommandCode = parseInt(values[1], 10);
                if (subCommandCode === 1) {
                    data.senseTemp = parseInt(values[2],10);
                }
                if (subCommandCode === 2) {
                    data.odorValue = parseInt(values[2],10);
                }
                if (subCommandCode === 3) {
                    data.waterLevel = parseInt(values[2],10);
                }
                if (subCommandCode === 4) {
                    data.foodLevel = parseInt(values[2],10);
                }
            }
        });

        return data;
    };

    const parseHealth = (dataString) => {
        if (!dataString) {
            data.hRStatus = "";
            data.bodyTemp = "";
            return {};
        }
        const data ={};

        const values = dataString.split(',');
        data.hRStatus = values[0].trim();
        data.bodyTempStatus = values[1].trim();

        return data;

    }

    const getSensorData = async () => {
        try {
            const ESP32URL = `http://${serverIP}:8081/`;
            const response = await fetch(ESP32URL);
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            console.log(response);
            const json = await response.json();
            if (json.dataFromPIC) {
                //console.log(json.dataFromPIC);
                const data = parseData(json.dataFromPIC);
                setSensorData(data);
            } else {
                //console.error('dataFromPIC not found in response');
            }
            if(json.healthStatus) {
                //console.log(json.healthStatus);
                const data = parseHealth(json.healthStatus);
                setHealthData(data);
                if (data.hRStatus === 'Abnormal') {
                    showNotification('Health Alert', 'Heart rate is abnormal!');
                }

                if (data.bodyTempStatus === 'High') {
                    showNotification('Health Alert', 'Body temperature is high!');
                }
            }
            else {
                //console.error('healthStatus not found in response');
            }
        } catch (error) {
            console.error('Error fetching sensor data:', error.message);
            console.log('Server IP:', serverIP);
        } finally {
            setLoading(false);
        }
    };


    useEffect(() => {
        configureBackgroundFetch();
        createNotificationChannel();
        fetchIP();
    }, []);


    useEffect(() => {
        if (serverIP && isFocused && (!stopFetch)) {
            getSensorData();
            const interval = setInterval(getSensorData, 10000);
            return () => clearInterval(interval);
        }
    }, [serverIP, isFocused]);

    const onRefresh = async () => {
        setRefreshing(true);
        fetchIP();
        if(!stopFetch) {
            getSensorData();
        }
        setRefreshing(false);
    };

    const styles = setColorScheme();
    const colors = useColorScheme();

    const iconColor = colors === 'dark' ? 'black' : 'white';
    const iconBG = colors === 'dark' ? 'white' : 'black';
    const iconSize = 20;

    const waterLevel = (sensorData.waterLevel / 4) || 0 ;
    const foodLevel = (sensorData.foodLevel / 4) || 0 ;

    return (
        <ScrollView
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            style={styles.container}
        >
            {isLoading ? (
                <Text>Loading...</Text>
            ) : (
                <View>
                    <StatusBar style={colors === 'dark' ? 'light' : 'dark'} />
                    <Text style={styles.header}>Pet HUB</Text>
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Environment</Text>
                        <View style={styles.row}>
                            <FA6Icon
                                name="temperature-half"
                                size={iconSize}
                                color={iconColor}
                                backgroundColor={iconBG}
                                style={styles.iconStyle}
                            />
                            <Text style={styles.label}>  Temperature</Text>
                            <Text style={styles.value}>
                                {tempPref ? sensorData.senseTemp : ((sensorData.senseTemp * 9/5) + 32).toFixed(2)} °{tempPref ? 'C' : 'F'}
                            </Text>
                        </View>
                        <View style={styles.row}>
                            <MCIIcon
                                name="smoke"
                                size={iconSize}
                                color={iconColor}
                                backgroundColor={iconBG}
                                style={styles.iconStyle}/>
                            <Text style={styles.label}>  Odor Level</Text>
                            <Text style={styles.value}>{sensorData.odorValue}</Text>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Pet Care</Text>
                        <View style={styles.row}>
                            <FA6Icon
                                name="glass-water-droplet"
                                size={iconSize}
                                color={iconColor}
                                backgroundColor={iconBG}
                                style={styles.iconStyle}
                            />
                            <Text style={styles.label}>  Water Level</Text>
                            <View style={styles.value}>
                                <ProgressBar
                                    progress={waterLevel}
                                    color={colors === 'dark' ? 'cyan' : 'navy'}
                                    width={90}
                                    style={styles.progressBar}
                                />
                            </View>
                        </View>
                        <View style={styles.row}>
                            <FA6Icon
                                name="bowl-food"
                                size={iconSize}
                                color={iconColor}
                                backgroundColor={iconBG}
                                style={styles.iconStyle}
                            />
                            <Text style={styles.label}>  Food Storage</Text>
                            <View style={styles.value}>
                                <ProgressBar
                                    progress={foodLevel}
                                    color={colors === 'dark' ? 'cyan' : 'navy'}
                                    width={90}
                                    style={styles.progressBar}
                                />
                            </View>
                        </View>
                    </View>
                    <View style={styles.section}>
                        <Text style={styles.sectionHeader}>Health</Text>
                        <View style={styles.row}>
                            <FA6Icon
                                name="thermometer"
                                size={iconSize}
                                color={iconColor}
                                backgroundColor={iconBG}
                                style={styles.iconStyle}/>
                            <Text style={styles.label}>  Body Temperature</Text>
                            <Text style={styles.value}>{healthData.bodyTempStatus}</Text>
                        </View>
                        <View style={styles.row}>
                            <FA6Icon
                                name="heart-pulse"
                                size={iconSize}
                                color={iconColor}
                                backgroundColor={iconBG}
                                style={styles.iconStyle}/>
                            <Text style={styles.label}>  Heart Rate</Text>
                            <Text style={styles.value}>{healthData.hRStatus}</Text>
                        </View>
                    </View>
                </View>
            )}
        </ScrollView>
    );
};

const setColorScheme = () => {
    const colors = useColorScheme();

    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            paddingTop: '15%',
            backgroundColor: colors === 'dark' ? 'black' : 'white',
        },
        header: {
            color: colors === 'dark' ? 'white' : 'black',
            fontSize: 28,
            fontWeight: 'bold',
            marginBottom: 20,
        },
        section: {
            color: colors === 'dark' ? 'white' : 'black',
            marginBottom: 20,
            paddingBottom: '5%',
            borderBottomWidth: 1,
            borderBottomColor: 'gray'
        },
        sectionHeader: {
            color: colors === 'dark' ? 'white' : 'black',
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 10,
        },
        row: {
            color: colors === 'dark' ? 'white' : 'black',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
        },
        label: {
            fontSize: 15,
            marginRight: 'auto',
            color: colors === 'dark' ? 'white' : 'black',
            padding: 5,
            textAlign: 'center'
        },
        value: {
            fontSize: 15,
            padding: 5,
            alignItems: 'center',
            justifyContent: 'center',
            color: colors === 'dark' ? 'cyan' : 'navy',
        },
        iconStyle: {
            padding: 4,
            borderRadius: 5,
            width: '7%',
            textAlign: 'center'
        },
        progressBar: {
            height: 6,
            borderRadius: 3,
        }
    });
}

export default HomeScreen;

//===========================================================================
