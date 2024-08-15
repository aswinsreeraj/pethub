/*---------------------------------------------------------------------------
	File Name:	ConfigurationScreen.js
	Author:		Aswin Sreeraj
	Date:		20/06/2024
	Modified:	Aswin Sreeraj & 15/07/2024
	© Fanshawe College, 2024

	Description: Configuration Screen for schedule and core module configuration
---------------------------------------------------------------------------*/
import React, {useContext, useEffect, useState} from 'react';
import {View, Text, StyleSheet, useColorScheme, ScrollView, RefreshControl} from 'react-native';
import MCIIcon from "react-native-vector-icons/MaterialCommunityIcons";
import FA6Icon from "react-native-vector-icons/FontAwesome6";
import AppContext from "../global/AppContext";
import { useIsFocused } from '@react-navigation/native';
import Logo from "../components/Logo";

/*>>> ConfigurationScreen: =====================================================
Author:		Aswin Sreeraj
Date:		20/06/2024
Modified:	None
Desc:		Set up Esp32 connection user interface
Input: 		None
Returns:	None
=============================================================================*/
const ConfigurationScreen = () => {
    const styles = setColorScheme();
    const isFocused = useIsFocused();
    const colors = useColorScheme();
    const petName = "Bella";
    const foodType = "Pedigree";
    const { tempPref } = useContext(AppContext);
    const [scheduleData, setScheduleData] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const { serverIP } = useContext(AppContext);
    const [configData, setConfigData] = useState({});
    const [refreshing, setRefreshing] = useState(false);

    const ESP32URL = `http://${serverIP}:8081/`;

    const ScheduleItem = ({ title, time }) => {
        const styles = setColorScheme();
        return (
            <View style={styles.item}>
                <View>
                    <Text style={styles.title}>{title}</Text>
                </View>
                <Text style={styles.time}>{time}</Text>
            </View>
        ); // eo return
    } // eo ScheduleItem::

    const parseSchedule = (dataString) => {
        if (!dataString) return [];
        const dataSegments = dataString.split('#');
        return dataSegments.reduce((scheduleTimes, segment) => {
            const values = segment.replace('$', '').split(',');
            const commandCode = parseInt(values[0], 10);
            if (commandCode === 2) {
                const times = values.slice(1).map(time => {
                    time = time.trim();
                    const hours = time.slice(0, 2);
                    return `${hours}:00`;
                });
                return times;
            }
            return scheduleTimes;
        }, []); // eo return
    }; // eo parseSchedule

    const parseData = (dataString) => {
        if (!dataString) return {};
        const dataSegments = dataString.split('#');
        const data = {};

        dataSegments.forEach(segment => {
            const values = segment.replace('$', '').split(',');
            const commandCode = parseInt(values[0], 10);
            if (commandCode === 1) {
                data.portionSize = parseInt(values[1], 10);
                data.roomTemp = parseInt(values[2], 10);
            }
        }); // eo forEach

        return data;
    }; // eo parseData

    const getSchedule = async () => {
        try {
            const response = await fetch(ESP32URL);
            const json = await response.json();
            if (json.configData) {
                const scheduleTimes = parseSchedule(json.configData);
                setScheduleData(scheduleTimes);
                const data = parseData(json.configData);
                setConfigData(data);
            } else {
                console.error('configData not found in response');
            }
        } catch (error) {
            console.error('Error fetching schedule and config data:', error);
        } finally {
            setLoading(false)
        } // eo try-catch-finally
    }; // eo getSchedule::

    useEffect(() => {
        if (serverIP && isFocused) {
            getSchedule();
            const interval = setInterval(getSchedule, 1000);
            return () => clearInterval(interval);
        }
    }, [serverIP, isFocused]); // eo useEffect


    const onRefresh = async () => {
        setRefreshing(true);
        fetchIP();
        if(!stopFetch) {
            getSchedule();
        }
        setRefreshing(false);
    }; // eo onRefresh::

    const iconColor = colors === 'dark' ? 'black' : 'white';
    const iconBG = colors === 'dark' ? 'white' : 'black';
    const iconSize = 20;

    return (
        <ScrollView
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }
            style={styles.container}
        >
            <View style={styles.headerContainer}>
                <Logo />
                <Text style={styles.header}>Pet HUB</Text>
            </View>
            <View style={styles.section}>
                <View style={styles.row}>
                    <MCIIcon
                        name="home-thermometer"
                        size={iconSize}
                        color={iconColor}
                        backgroundColor={iconBG}
                        style={styles.iconStyle}/>
                    <Text style={styles.label}>  Room Temperature</Text>
                    <Text style={styles.value}>
                        {tempPref ? configData.roomTemp : ((configData.roomTemp * 9/5) + 32).toFixed(2)} °{tempPref ? 'C' : 'F'}
                    </Text>
                </View>
                <View style={styles.row}>
                    <FA6Icon
                        name="bowl-rice"
                        size={iconSize}
                        color={iconColor}
                        backgroundColor={iconBG}
                        style={styles.iconStyle}/>
                    <Text style={styles.label}>  Portion Level</Text>
                    <Text style={styles.value}>{configData.portionSize}</Text>
                </View>
            </View>
            <Text style={styles.sectionHeader}>Feeding Schedule</Text>
            {isLoading ? (
                <Text>Loading...</Text>
            ) : (
                scheduleData.map((time, index) => (
                    <ScheduleItem key={index} title={`Schedule ${index + 1}`} time={time} />
                ))
            )}
        </ScrollView>
    ); // eo return
}; // eo ConfigurationScreen::

const setColorScheme = () => {
    const colors = useColorScheme();

    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            paddingTop: '15%',
            backgroundColor: colors === 'dark' ? 'black' : 'white',
        },
        headerContainer: {
            marginTop: 20,
            flexDirection: 'row',
            alignContent: 'center',
            justifyItems: 'center',
            marginBottom: 20,
        },
        header: {
            fontSize: 28,
            fontWeight: 'bold',
            color: colors === 'dark' ? 'white' : 'black',
            marginBottom: 20,
        },
        sectionHeader: {
            fontSize: 20,
            fontWeight: 'bold',
            color: colors === 'dark' ? 'white' : 'black',
            marginBottom: 10,
        },
        metaData: {
            fontSize: 15,
            color: colors === 'dark' ? 'white' : 'black',
            marginBottom: 20,
        },
        row: {
            color: colors === 'dark' ? 'white' : 'black',
            flexDirection: 'row',
            justifyContent: 'space-between',
            marginBottom: 10,
        },
        item: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            padding: 10,
            borderBottomWidth: 1,
            borderBottomColor: 'gray',
        },
        title: {
            fontSize: 18,
            color: colors === 'dark' ? 'white' : 'black',
        },
        time: {
            fontSize: 18,
            color: colors === 'dark' ? 'cyan' : 'navy',
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
        section: {
            color: colors === 'dark' ? 'white' : 'black',
            marginBottom: 20,
            paddingBottom: '5%',
            borderBottomWidth: 1,
            borderBottomColor: 'gray'
        }
    });
} // eo setColorScheme

export default ConfigurationScreen;

//===========================================================================