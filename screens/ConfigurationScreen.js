/*---------------------------------------------------------------------------
	File Name:	ConfigurationScreen.js
	Author:		Aswin Sreeraj
	Date:		20/06/2024
	Modified:	Aswin Sreeraj & 15/07/2024
	© Fanshawe College, 2024

	Description: Configuration Screen for schedule and core module configuration
---------------------------------------------------------------------------*/
import React, {useContext, useEffect, useState} from 'react';
import { View, Text, StyleSheet, useColorScheme } from 'react-native';
import MCIIcon from "react-native-vector-icons/MaterialCommunityIcons";
import FA6Icon from "react-native-vector-icons/FontAwesome6";
import AppContext from "../global/AppContext";

const ScheduleItem = ({ title, time }) => {
    const styles = setColorScheme();
    return (
        <View style={styles.item}>
            <View>
                <Text style={styles.title}>{title}</Text>
            </View>
            <Text style={styles.time}>{time}</Text>
        </View>
    );
}

const ConfigurationScreen = () => {
    const styles = setColorScheme();
    const colors = useColorScheme();
    const petName = "Bella";
    const foodType = "Pedigree";
    const { tempPref } = useContext(AppContext);
    const [scheduleData, setScheduleData] = useState([]);
    const [isLoading, setLoading] = useState(true);
    const { serverIP } = useContext(AppContext);
    const [configData, setConfigData] = useState({});

    const ESP32URL = `http://${serverIP}:8081/`;

    const parseSchedule = (dataString) => {
        if (!dataString) return [];
        const dataSegments = dataString.split('#');
        let scheduleTimes = [];

        dataSegments.forEach(segment => {
            const values = segment.replace('$', '').split(',');
            const commandCode = parseInt(values[0], 10);
            if (commandCode === 2) {
                const times = values.slice(1).map(time => {
                    time = time.trim();
                    const hours = time.slice(0, 2);
                    return `${hours}:00`;
                });
                scheduleTimes.push(...times);
            }
        });

        return scheduleTimes;
    };

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
        });

        return data;
    };

    const getSchedule = async () => {
        try {
            const response = await fetch(ESP32URL);
            const json = await response.json();
            if (json.dataFromPIC) {
                const scheduleTimes = parseSchedule(json.dataFromPIC);
                setScheduleData(scheduleTimes);
                const data = parseData(json.dataFromPIC);
                setConfigData(data);
            } else {
                console.error('dataFromPIC not found in response');
            }
        } catch (error) {
            console.error('Error fetching schedule and config data:', error);
        } finally {
            setLoading(false)
        }
    };

    useEffect(() => {
        if (serverIP) {  // Only fetch if serverIP is available
            getSchedule();
            const interval = setInterval(getSchedule, 1000);
            return () => clearInterval(interval);
        }
    }, [serverIP]);

    const iconColor = colors === 'dark' ? 'black' : 'white';
    const iconBG = colors === 'dark' ? 'white' : 'black';
    const iconSize = 20;

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Pet HUB</Text>
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
        </View>
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
}

export default ConfigurationScreen;

//===========================================================================