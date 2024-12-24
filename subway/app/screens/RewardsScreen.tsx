import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
} from 'react-native';
import { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useFonts, Oswald_600SemiBold } from '@expo-google-fonts/oswald';
import {
  Inter_300Light,
  Inter_600SemiBold,
  Inter_400Regular,
  Inter_500Medium,
  Inter_900Black,
} from '@expo-google-fonts/inter';
import AppLoading from 'expo-app-loading';
import PagerView from 'react-native-pager-view';

type RootStackParamList = {
  Rewards: undefined;
  Login: undefined; // Add Auth screen to navigation
};

type RewardsScreenProps = NativeStackScreenProps<RootStackParamList, 'Rewards'>;

const slides = [
  {
    id: 1,
    image: require('../assets/rewards-banner.png'),
    title: 'Welcome to the NEW Subway MVP Rewards',
    description: 'Earn faster rewards, sweeter surprises, and amped-up perks that only get better the more you order.',
  },
  {
    id: 2,
    image: require('../assets/rewards3.png'),
    title: 'Get Points Every Time You Order',
    description: 'Earn points for every order and redeem them for Subway® Cash or free menu items.',
  },
  {
    id: 3,
    image: require('../assets/rewards2.png'),
    title: 'Exclusive Offers Just for Members',
    description: 'Unlock special deals and promotions available only to Subway® MVP Rewards members.',
  },
];

const { height: screenHeight } = Dimensions.get('window');

const RewardsScreen: React.FC<RewardsScreenProps> = ({ navigation }) => {
  const [currentPage, setCurrentPage] = useState(0);

  const [fontsLoaded] = useFonts({
    Oswald_600SemiBold,
    Inter_300Light,
    Inter_600SemiBold,
    Inter_400Regular,
    Inter_500Medium,
    Inter_900Black,
  });

  if (!fontsLoaded) {
    return <AppLoading />;
  }

  const handlePageChange = (event: any) => {
    setCurrentPage(event.nativeEvent.position);
  };

  const handleJoinNow = () => {
    navigation.navigate('Login'); // Navigate to the Auth screen
  };

  return (
    <View style={styles.container}>
      {/* Swipeable Pages */}
      <PagerView
        style={styles.pagerView}
        initialPage={0}
        onPageSelected={handlePageChange}
      >
        {slides.map((slide) => (
          <View key={slide.id} style={styles.slide}>
            <Image source={slide.image} style={styles.banner} />
            <Text style={styles.title}>{slide.title}</Text>
            <Text style={styles.description}>{slide.description}</Text>
          </View>
        ))}
      </PagerView>

      {/* Pagination Dots */}
      <View style={styles.pagination}>
        {slides.map((_, index) => (
          <View
            key={index}
            style={[
              styles.dot,
              currentPage === index ? styles.activeDot : styles.inactiveDot,
            ]}
          />
        ))}
      </View>

      {/* Join Now Button */}
      <TouchableOpacity style={styles.joinButton} onPress={handleJoinNow}>
        <Text style={styles.joinButtonText}>Join Now</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  pagerView: {
    flex: 1,
  },
  slide: {
    flex: 1,
    alignItems: 'center',
  },
  banner: {
    width: 400,
    height: 370, // Adjust height as needed
    resizeMode: 'cover',
  },
  title: {
    fontSize: 27,
    color: '#333',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 20,
    fontFamily: 'Inter_900Black',
    paddingHorizontal: 50,
  },
  description: {
    fontSize: 16,
    color: '#333',
    textAlign: 'center',
    lineHeight: 22,
    fontFamily: 'Inter_400Regular',
    paddingHorizontal: 50,
  },
  pagination: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 20,
  },
  dot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginHorizontal: 5,
  },
  activeDot: {
    backgroundColor: '#028940',
  },
  inactiveDot: {
    backgroundColor: '#ccc',
  },
  joinButton: {
    backgroundColor: '#028940',
    paddingVertical: 15,
    paddingHorizontal: 40,
    borderRadius: 25,
    alignSelf: 'center',
    marginBottom: 30,
  },
  joinButtonText: {
    color: '#fff',
    fontSize: 18,
    fontFamily: 'Inter_600SemiBold',
    textAlign: 'center',
  },
});

export default RewardsScreen;
