/*---------------------------------------------------------------------------
	File Name:	SettingsScreen.js
	Author:		Aswin Sreeraj
	Date:		20/06/2024
	Modified:	Aswin Sreeraj & 15/07/2024
	© Fanshawe College, 2024

	Description: SettingsScreen UI
---------------------------------------------------------------------------*/

// Import dependencies ===================================================================
import React, { useContext } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import AppContext from '../global/AppContext';
import Logo from '../components/Logo';
//========================================================================================

/*>>> SettingsScreen: =====================================================
Author:		Aswin Sreeraj
Date:		20/06/2024
Modified:	None
Desc:		Set up user interface for settings and configurations
Input: 		None
Returns:	None
=============================================================================*/
const SettingsScreen = ({ navigation }) => {
    const colors = useColorScheme();
    const styles = setColorScheme(colors);
    const [inFahrenheit, setInFahrenheit] = React.useState(true);
    const [onNow, setOnNow] = React.useState(false);

    const { tempPref, setTempPref } = useContext(AppContext);

    if (tempPref === undefined) {
        return <Text>Loading...</Text>;
    } // eo if

    return (
        <View style={styles.container}>
            <View style={styles.section}>
                <Text style={styles.header}>Settings</Text>
                <View style={styles.subsection}>
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
                <View style={styles.subsection}>
                    <Text style={styles.sectionHeader}>Notifications</Text>
                    <TouchableOpacity onPress={() => setOnNow(!onNow)}>
                        <View style={styles.item}>
                            <Text style={styles.title}>Notification</Text>
                            <Text style={styles.value}>{onNow ? 'ON' : 'OFF'}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
            <Text style={styles.footerText}>&copy; 2024 <Logo style={{ width: 30, height: 30 }}/> Pet HUB</Text>
        </View>
    ); // eo return
}; // eo SettingsScreen::

const setColorScheme = (colors) => {
    return StyleSheet.create({
        container: {
            flex: 1,
            padding: 20,
            paddingTop: '15%',
            backgroundColor: colors === 'dark' ? 'black' : 'white',
            justifyContent: 'space-between',
        },
        backButton: {
            marginBottom: 20,
            color: colors === 'dark' ? 'white' : 'black',
        },
        section: {
            flexDirection: 'column',
        },
        header: {
            fontSize: 25,
            fontWeight: 'bold',
            marginBottom: 20,
            color: colors === 'dark' ? 'white' : 'black',
        },
        subsection: {
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
        footerText: {
            color: colors === 'dark' ? 'white' : 'black',
            justifySelf: 'center',
            alignSelf: 'center',
        }
    });
} // eo setColorScheme

export default SettingsScreen;
