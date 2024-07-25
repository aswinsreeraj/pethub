import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import AppContext from '../global/AppContext';

const SettingsScreen = ({ navigation }) => {
    const colors = useColorScheme();
    const styles = setColorScheme(colors);
    const [inFahrenheit, setInFahrenheit] = React.useState(true);
    const [onNow, setOnNow] = React.useState(false);

    const { tempPref, setTempPref } = useContext(AppContext);

    if (tempPref === undefined) {
        return <Text>Loading...</Text>;
    }

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Settings</Text>
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Preferences</Text>
                <TouchableOpacity onPress={() => {
                    setInFahrenheit(!inFahrenheit);
                    setTempPref(!inFahrenheit);
                }}>
                    <View style={styles.item}>
                        <Text style={styles.title}>Temperature</Text>
                        <Text style={styles.value}>{inFahrenheit ? 'Celsius' : 'Fahrenheit'}</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.section}>
                <Text style={styles.sectionHeader}>Notifications</Text>
                <TouchableOpacity onPress={() => setOnNow(!onNow)}>
                    <View style={styles.item}>
                        <Text style={styles.title}>Notification</Text>
                        <Text style={styles.value}>{onNow ? 'ON' : 'OFF'}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setOnNow(!onNow)}>
                    <View style={styles.item}>
                        <Text style={styles.title}>Reminders</Text>
                        <Text style={styles.value}>{onNow ? 'ON' : 'OFF'}</Text>
                    </View>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setOnNow(!onNow)}>
                    <View style={styles.item}>
                        <Text style={styles.title}>Updates</Text>
                        <Text style={styles.value}>{onNow ? 'ON' : 'OFF'}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const setColorScheme = (colors) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            paddingTop: '15%',
            backgroundColor: colors === 'dark' ? 'black' : 'white',
        },
        backButton: {
            marginBottom: 20,
            color: colors === 'dark' ? 'white' : 'black',
        },
        header: {
            fontSize: 25,
            fontWeight: 'bold',
            marginBottom: 20,
            color: colors === 'dark' ? 'white' : 'black',
        },
        section: {
            marginBottom: 30,
            color: colors === 'dark' ? 'white' : 'black',
        },
        sectionHeader: {
            fontSize: 20,
            fontWeight: 'bold',
            marginBottom: 10,
            color: colors === 'dark' ? 'white' : 'black',
        },
        item: {
            flexDirection: 'row',
            justifyContent: 'space-between',
            color: colors === 'dark' ? 'white' : 'black',
            marginBottom: 10,
        },
        title: {
            fontSize: 16,
            color: colors === 'dark' ? 'white' : 'black',
        },
        value: {
            fontSize: 16,
            color: colors === 'dark' ? 'white' : 'black',
        },
    });
}

export default SettingsScreen;
