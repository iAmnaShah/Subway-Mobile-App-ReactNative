import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  FlatList,
  TouchableOpacity,
  Alert,
  Modal,
} from 'react-native';
import { useNavigation } from 'expo-router';
import { StackNavigationProp } from '@react-navigation/stack';
import { useCart } from '../contexts/CartContext';
import Icon from 'react-native-vector-icons/Ionicons';
import { supabase } from '../../supabaseClient';


type RootStackParamList = {
  Cart: undefined;
};

interface Option {
  id: string;
  name: string;
  image: string; // Use appropriate type if dealing with image URLs or React Native assets
}

const DealsScreen: React.FC = () => {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList, 'Cart'>>();
  const { addToCart, cart } = useCart();

  const [deals, setDeals] = useState<any[]>([]);
  const [selectedDeal, setSelectedDeal] = useState<any>(null);
  const [currentSelections, setCurrentSelections] = useState<string[]>([]);
  const [currentStep, setCurrentStep] = useState<number>(0);
  const [isModalVisible, setModalVisible] = useState(false);
  const [subs, setSubs] = useState<Option[]>([]);
  const [drinks, setDrinks] = useState<Option[]>([]);
  useEffect(() => {
    console.log('Modal Visible:', isModalVisible);
    console.log('Current Step:', currentStep);
    console.log('Current Selections:', currentSelections);
  }, [isModalVisible, currentStep, currentSelections]);
  
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const { data: subsData, error: subsError } = await supabase.from('suboptions').select('*');
        const { data: drinksData, error: drinksError } = await supabase.from('drinkoptions').select('*');
  
        if (subsError) throw subsError;
        if (drinksError) throw drinksError;

        console.log('Fetched sub:', subsData);
        console.log('Fetched drink:', drinksData);
        setSubs(subsData || []);
        setDrinks(drinksData || []);
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };
  
    fetchOptions();
  }, []);

  useEffect(() => {
    fetchDeals();
  }, []);

  const fetchDeals = async () => {
    const { data, error } = await supabase.from('deals').select('*');
    if (error) {
      Alert.alert('Error', 'Failed to fetch deals from Supabase.');
    } else {
      console.log('Fetched deals:', data);
      setDeals(data || []);
    }
  };

  const openCustomizationModal = (deal: any) => {
    console.log('Deal received:', deal);  // Log right before using it
    if (deal) {
      setSelectedDeal(deal);
      setCurrentSelections([]);
      setCurrentStep(0);
      setModalVisible(true);
      console.log('Deal:', deal);
      console.log('hi', deal.subChoices);
      if (deal.subChoices === 0 && deal.drinkChoices === 0) {
        handleAddToCart();
      }
    } else {
      console.error('Received an undefined or invalid deal object.');
    }
  };
  
      
  
  const handleSelection = (item: string) => {
    if (!selectedDeal) {
      console.warn('No deal selected. Selection cannot proceed.');
      return;
    }
  
    const totalChoices = (selectedDeal?.subChoices || 0) + (selectedDeal?.drinkChoices || 0);
  
    setCurrentSelections((prevSelections) => {
      const updatedSelections = [...prevSelections];
      updatedSelections[currentStep] = item;
      console.log(`Selection updated at step ${currentStep}:`, item);
      console.log('Updated Selections:', updatedSelections);
      return updatedSelections;
    });
  
    // Move to the next step or complete the selection process
    if (currentStep + 1 < totalChoices) {
      console.log(`Proceeding to the next step: ${currentStep + 1}`);
      setCurrentStep((prevStep) => prevStep + 1);
    } else {
      console.log('All selections made. Showing summary.');
      setCurrentStep(totalChoices); // Ensure we're in the "summary" phase
    }
  };
  
  
  
  const handleAddToCart = async () => {
    try {
      // Check if the user is logged in
      const { data: userResponse } = await supabase.auth.getUser();
      const user = userResponse?.user;
  
      if (!user) {
        Alert.alert(
          'Login Required',
          'Please log in to add items to your cart.',
          [{ text: 'OK' }]
        );
        return;
      }
  
      if (selectedDeal) {
        addToCart({
          name: `${selectedDeal.name}`,
          price: selectedDeal.price,
          image: selectedDeal.image,
        });
        setModalVisible(false);
        Alert.alert('Added to Cart', `${selectedDeal.name} added to your cart.`);
      }
    } catch (error) {
      console.error('Error adding to cart:', error);
      Alert.alert('Error', 'An error occurred while adding the item to your cart.');
    }
  };
  
  
      const handleClearSelections = () => {
        setCurrentSelections([]);
        setCurrentStep(0);
        setModalVisible(false); // Close the modal
      };
      
  
      const getCurrentOptions = () => {
        if (!selectedDeal) return [];
        
        const isSubSelection = currentStep < selectedDeal.subChoices;
        const options = isSubSelection ? subs : drinks;
        
        // Debugging logs
        console.log('Current Step:', currentStep);
        console.log('Selected Deal:', selectedDeal);
        console.log('Current Options:', options); // Log the actual options
        
        return options;
      };
      

  
    const getCurrentPrompt = () => {
      if (!selectedDeal) return '';
      const isSubSelection = currentStep < selectedDeal.subChoices;
      const choiceNumber = isSubSelection ? currentStep + 1 : currentStep - selectedDeal.subChoices + 1;
      const type = isSubSelection ? 'Sub' : 'Drink';
      return `Choose your ${type} ${choiceNumber}`;
    };
    
  
    const renderSummary = () => {
      if (!selectedDeal) return null;
      
      // Split the selections into subs and drinks
      const selectedSubs = currentSelections.slice(0, selectedDeal.subChoices).join(', ') || 'None';
      const selectedDrinks = currentSelections.slice(selectedDeal.subChoices).join(', ') || 'None';
    
      return (
        <View>
          <Text style={styles.summaryText}>Selected Subs: {selectedSubs}</Text>
          <Text style={styles.summaryText}>Selected Drinks: {selectedDrinks}</Text>
        </View>
      );
    };
    

    const handleCartPress = () => {
      navigation.navigate('Cart');
    };
  
    return (
      <>
        <View style={styles.headerContainer}>
        <Text style={styles.header}>Deals</Text>
        <TouchableOpacity onPress={handleCartPress}>
          <Icon name="cart" size={30} color="#fff" />
          {cart.length > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{cart.length}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
        <View style={styles.container}>
          <FlatList
            data={deals}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <Text style={styles.cardTitle}>{item.name}</Text>
                <Image source={{ uri: item.image }} style={styles.cardImage} />
                <Text style={styles.cardPrice}>Rs. {item.price}</Text>
                <Text style={styles.cardDescription}>{item.description}</Text>
                <TouchableOpacity
                  style={styles.addButton}
                  onPress={() => openCustomizationModal(item)}
                >
                  <Text style={styles.addButtonText}>
                    {item.subChoices === 0 && item.drinkChoices === 0
                      ? 'Add to Cart'
                      : 'Customize & Add'}
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
  
       {/* Modal */}
<Modal visible={isModalVisible} transparent animationType="slide">
  <View style={styles.modalContainer}>
    <View style={styles.modalContent}>
      {/* Close Button */}
      <TouchableOpacity
        style={styles.closeButton}
        onPress={handleClearSelections} // Use the clear selections function to reset
      >
        <Icon name="close" size={24} color="#000" />
      </TouchableOpacity>

      {/* Modal Content */}
      {selectedDeal && currentStep < (selectedDeal.subChoices + selectedDeal.drinkChoices) ? (
        <>
          <Text style={styles.modalTitle}>{getCurrentPrompt()}</Text>
          <FlatList
  data={getCurrentOptions()}
  keyExtractor={(item, index) => index.toString()}
  renderItem={({ item }) => (
    <TouchableOpacity
      style={styles.optionButton}
      onPress={() => handleSelection(item.name)}
    >
      <Image source={{ uri: item.image }} style={styles.optionImage} />
      <Text style={styles.optionText}>{item.name}</Text>
    </TouchableOpacity>
  )}
/>


          {/* Back and Next Navigation */}
          <View style={styles.navigationButtons}>
            {currentStep > 0 && (
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={() => setCurrentStep(currentStep - 1)}
              >
                <Icon name="arrow-back" size={24} color="#fff" />
              </TouchableOpacity>
            )}
            {currentStep < selectedDeal.subChoices + selectedDeal.drinkChoices - 1 && (
              <TouchableOpacity
                style={styles.navigationButton}
                onPress={() => {
                  if (currentSelections[currentStep]) {
                    setCurrentStep(currentStep + 1);
                  } else {
                    Alert.alert('Selection Required', 'Please select an option to proceed.');
                  }
                }}
              >
                <Icon name="arrow-forward" size={24} color="#fff" />
              </TouchableOpacity>
            )}
          </View>
        </>
      ) : (
        <>
          <Text style={styles.modalTitle}>Summary</Text>
          {renderSummary()}
          <TouchableOpacity
            style={styles.addButton}
            onPress={handleAddToCart}
          >
            <Text style={styles.addButtonText}>Add to Cart</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.addButton, styles.cancelButton]}
            onPress={handleClearSelections}
          >
            <Text style={styles.addButtonText}>Clear Selections</Text>
          </TouchableOpacity>
        </>
      )}
    </View>
  </View>
</Modal>

      </>
    );
  };
  
  

  const styles = StyleSheet.create({
    headerCard: {
      backgroundColor: '#028940', // Dark green
      padding: 10,
      alignItems: 'center',
      justifyContent: 'center',
    },
    headerContainer: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      backgroundColor: '#028940',
      padding: 16,
    },
    header: {
      fontFamily: 'serif',
      fontSize: 24,
      fontWeight: 'bold',
      color: '#fff',
    },
    cartBadge: {
      position: 'absolute',
      top: -5,
      right: -10,
      backgroundColor: '#FFC20D',
      borderRadius: 12,
      width: 24,
      height: 24,
      justifyContent: 'center',
      alignItems: 'center',
    },
    cartBadgeText: {
      color: '#fff',
      fontSize: 14,
      fontWeight: 'bold',
    },
    closeButton: {
      position: 'absolute',
      top: 10,
      right: 10,
      zIndex: 10,
    },
    navigationButtons: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 20,
    },
    navigationButton: {
      backgroundColor: '#028940',
      padding: 10,
      borderRadius: 5,
      marginHorizontal: 5,
      width: 50,
      alignItems: 'center',
    //backgroundColor: '#FFC20D'
    },
    
    headerTitle: {
      fontFamily: 'serif',
      fontSize: 20,
      fontWeight: 'bold',
      color: '#fff', // White text for contrast
    },
    container: {
      flex: 1,
      backgroundColor: '#fff',
      padding: 10,
    },
    summaryText: {
        fontSize: 16,
        marginVertical: 5,
      },
    title: {
      fontSize: 20,
      fontFamily: 'serif',
      fontWeight: 'bold',
      textAlign: 'center',
      marginVertical: 20,
    },
    flatListContent: {
      paddingBottom: 20,
    },
    card: {
      backgroundColor: '#fff',
      borderRadius: 10,
      marginBottom: 15,
      padding: 15,
      alignItems: 'center',
      elevation: 5,
    },
    modalActions: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginTop: 10,
      },

    cardImage: {
      width: '69%',
      height: 150,
      borderRadius: 10,
      marginBottom: 10,
      resizeMode: 'cover',
    },
    cardTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      marginBottom: 5,
    },
    cardPrice: {
      fontSize: 16,
      color: '#028940',
      marginBottom: 10,
    },
    addButton: {
      marginTop: 10,
      backgroundColor: '#FFC20D',
      padding: 10,
      borderRadius: 5,
    },
    addButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
    },
    cardDescription: {
      fontSize: 14,
      color: '#555',
      textAlign: 'center',
      marginBottom: 10,
    },
    footer: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      backgroundColor: '#028940',
      padding: 12,
      alignItems: 'center',
    },
    viewCartButton: {
      backgroundColor: '#FFC20D',
      padding: 12,
      borderRadius: 8,
      width: '80%',
      alignItems: 'center',
    },
    viewCartButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
      textAlign: 'center',
    },
    modalContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
      backgroundColor: '#f0f0f0',
      borderRadius: 10,
      padding: 20,
      width: '80%',
    },
    modalTitle: {
      fontSize: 20,
      fontWeight: 'bold',
      marginBottom: 15,
      textAlign: 'center',
    },
    optionButton: {
      padding: 10,
      backgroundColor: '#fff',
      marginBottom: 10,
      borderRadius: 5,
      alignItems: 'center',
    },
    optionImage: {
      width: 110,
      height: 80,
      marginBottom: -1,
    },
    optionText: {
      fontSize: 16,
      color: '#333',
    },
    modalButton: {
      backgroundColor: '#028940',
      padding: 12,
      borderRadius: 8,
      flex: 1,
      alignItems: 'center',
      marginHorizontal: 5,
    },
    cancelButton: {
      marginTop: 10,
      backgroundColor: '#bfbfbf',
    },
    modalButtonText: {
      fontSize: 16,
      fontWeight: 'bold',
      color: '#fff',
    },
  });

export default DealsScreen;
