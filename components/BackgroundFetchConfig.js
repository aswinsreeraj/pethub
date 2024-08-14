/*---------------------------------------------------------------------------
	File Name:	BackgroundFetchConfig.js
	Author:		Aswin Sreeraj
	Date:		20/06/2024
	Modified:	Aswin Sreeraj & 15/07/2024
	© Fanshawe College, 2024

	Description: For background fetch of data in the app
---------------------------------------------------------------------------*/
import BackgroundFetch from "react-native-background-fetch";
import { showNotification } from './PushNotificationConfig';
import AppContext from '../global/AppContext';
import {useContext, useState} from "react";


/*>>> MyHeadlessTask: =====================================================
Author:		Aswin Sreeraj
Date:		20/06/2024
Modified:	None
Desc:		Set up headless task for background fetch
Input: 		None
Returns:	None
==========================================================================*/
let MyHeadlessTask = async (event) => {
    const { serverIP } = useContext(AppContext);

    const ESP32URL = `http://${serverIP}:8081/`;
    console.log('[BackgroundFetch HeadlessTask] start');
    try {
        const response = await fetch(`http://${serverIP}:80/`);
        const json = await response.json();
        const healthData = parseHealth(json.healthStatus);

        if (healthData.hRStatus === 'Abnormal') {
            showNotification('Health Alert', 'Heart rate is abnormal!');
        } // eo if

        if (healthData.bodyTempStatus === 'High') {
            showNotification('Health Alert', 'Body temperature is high!');
        } // eo if
    } catch (error) {
        console.error('Error fetching sensor data:', error.message);
    } // eo try-catch

    BackgroundFetch.finish(BackgroundFetch.FETCH_RESULT_NEW_DATA);
}; // eo MyHeadlessTask::


BackgroundFetch.registerHeadlessTask(MyHeadlessTask);

/*>>> configureBackgroundFetch: ================================================
Author:		Aswin Sreeraj
Date:		20/06/2024
Modified:	None
Desc:		Configuration for the background fetch
Input: 		None
Returns:	None
=============================================================================*/
const configureBackgroundFetch = () => {
    BackgroundFetch.configure(
        {
            minimumFetchInterval: 1,
            stopOnTerminate: false,
            startOnBoot: true,
            enableHeadless: true,
        },
        async (taskId) => {
            console.log("[BackgroundFetch] taskId:", taskId);
            await MyHeadlessTask();
            BackgroundFetch.finish(taskId);
        },
        (error) => {
            console.log("[BackgroundFetch] failed to start:", error);
        }
    ) // eo BackgroundFetch.configure
}; // eo configureBackgroundFetch::


/*>>> parseHealth: =====================================================
Author:		Aswin Sreeraj
Date:		20/06/2024
Modified:	None
Desc:		Parse the data to added to the background fetch task
Input: 		String dataString, data to be parsed
Returns:	None
=======================================================================*/
const parseHealth = (dataString) => {
    if (!dataString) return {};
    const data = {};
    data.hRStatus = "";
    data.bodyTempStatus = "";

    const values = dataString.split(',');
    data.hRStatus = values[0].trim();
    data.bodyTempStatus = values[1].trim();

    return data;
}; // eo parseHealth::

export default configureBackgroundFetch;

//===========================================================================