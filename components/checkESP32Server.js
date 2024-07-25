const checkESP32Server = async (serverIP) => {
    const ESP32URL = `http://${serverIP}:8081/`;
    try {
        const response = await fetch(ESP32URL);
        if (response.ok) {
            return true;
        }
    } catch (error) {
        console.error('Error checking ESP32 server status:', error.message);
    }
    return false;
};

export default checkESP32Server;
