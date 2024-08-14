/*---------------------------------------------------------------------------
	File Name:	PushNotificationConfig.js
	Author:		Aswin Sreeraj
	Date:		20/06/2024
	Modified:	Aswin Sreeraj & 15/07/2024
	© Fanshawe College, 2024

	Description: For push notificaiont system of the app
---------------------------------------------------------------------------*/

// Import dependencies ===================================================================
import PushNotification from "react-native-push-notification";
import { Platform } from "react-native";
//========================================================================================

/*>>> createNotificationChannel: =====================================================
Author:		Aswin Sreeraj
Date:		20/06/2024
Modified:	None
Desc:		Create a channel for pushing notifications
Input: 		None
Returns:	None
=============================================================================*/
export const createNotificationChannel = () => {
    PushNotification.createChannel(
        {
            channelId: "default-channel-id",
            channelName: "Default Channel",
            channelDescription: "A default channel for app notifications",
            soundName: "default",
            importance: 4,
            vibrate: true,
        },
        (created) => console.log(`CreateChannel returned '${created}'`)
    ); // eo  PushNotification.createChannel
}; // eo createNotificationChannel::

PushNotification.configure({
    onNotification: function (notification) {
        console.log("NOTIFICATION:", notification);
    },
    requestPermissions: Platform.OS === 'ios',
}); // eo PushNotification.configure

createNotificationChannel();

/*>>> showNotification: =====================================================
Author:		Aswin Sreeraj
Date:		20/06/2024
Modified:	None
Desc:		Push notification in the notification channel
Input: 		String title, Notification title
            String message, Notification message
Returns:	None
=============================================================================*/
export const showNotification = (title, message) => {
    PushNotification.localNotification({
        channelId: "default-channel-id",
        title: title,
        message: message,
        playSound: true,
        soundName: "default",
        importance: "high",
        vibrate: true,
    }); // eo PushNotification.localNotification
}; // eo showNotification::

//===========================================================================