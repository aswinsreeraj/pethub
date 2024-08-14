import React from 'react';
import { Image } from 'react-native';

const Logo = ({ style }) => {
    return (
        <Image
            source={require('../assets/pethub_logo.png')}
            style={[styles.logo, style]}
        />
    );
};

const styles = {
    logo: {
        width: 40,
        height: 40,
        marginRight: 10,
    },
};

export default Logo;
