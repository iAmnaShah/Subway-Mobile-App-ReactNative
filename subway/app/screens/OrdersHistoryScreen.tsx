import React, { useEffect, useState } from "react";
import { View, Text, FlatList, StyleSheet, Alert, Button, TouchableOpacity } from "react-native";
import { supabase } from "@/supabaseClient"; // Import Supabase client
import { Image } from 'react-native';

interface Order {
    id: number;
    total_price: number;
    items: string; // Assuming items are stored as JSON string in the database
    created_at: string;
}

interface Item {
    id: number;
    name: string;
    image: string;
    price: number;
}

const OrdersHistoryScreen: React.FC = () => {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState<boolean>(true);

    // Fetch orders for the logged-in user
    const fetchOrders = async () => {
        try {
            const user = await supabase.auth.getUser();
            if (!user?.data?.user?.id) {
                Alert.alert("Error", "User not logged in.");
                setLoading(false);
                return;
            }

            const { data, error } = await supabase
                .from("orders")
                .select("*")
                .eq("user_id", user.data.user.id)
                .order("created_at", { ascending: false }); // Order by most recent

            if (error) {
                console.error(error);
                Alert.alert("Error", "Failed to fetch orders.");
            } else {
                setOrders(data || []);
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Something went wrong.");
        } finally {
            setLoading(false);
        }
    };

    const clearOrders = async () => {
        try {
            const user = await supabase.auth.getUser();
            if (!user?.data?.user?.id) {
                Alert.alert("Error", "User not logged in.");
                return;
            }

            const { error } = await supabase
                .from("orders")
                .delete()
                .eq("user_id", user.data.user.id);

            if (error) {
                console.error(error);
                Alert.alert("Error", "Failed to clear orders.");
            } else {
                setOrders([]); // Clear the local orders state
                Alert.alert("Success", "Order history cleared successfully.");
            }
        } catch (error) {
            console.error(error);
            Alert.alert("Error", "Something went wrong.");
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    if (loading) {
        return (
            <View style={styles.centered}>
                <Text>Loading orders...</Text>
            </View>
        );
    }

    if (orders.length === 0) {
        return (
            <View style={styles.centered}>
                <Text>No orders found.</Text>
            </View>
        );
    }

    // Render each order's items as a list of details
    const renderOrderItems = (itemsJson: string, orderId: number) => {
        try {
            const items: Item[] = JSON.parse(itemsJson);
            return items.map((item, index) => (
                <View key={`${orderId}-${item.id || index}`} style={styles.itemCard}>
                    <Text style={styles.itemText}>{item.name || "No name available"}</Text>
                    <Text style={styles.itemText}>Price: Rs. {item.price || "N/A"}</Text>
    
                    {item.image && typeof item.image === 'string' && item.image.includes('http') ? (
                        <Image source={{ uri: item.image }} style={{ width: 130, height: 80, marginTop: 7 }} />
                    ) : (
                        <Text style={styles.itemText}>No image available</Text>
                    )}
                </View>
            ));
        } catch (error) {
            console.error("Error parsing items JSON:", error);
            return <Text style={styles.itemText}>Error parsing items</Text>;
        }
    };
    
    

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.clearButton}
                onPress={() =>
                    Alert.alert(
                        "Confirm",
                        "Are you sure you want to clear your order history?",
                        [
                            { text: "Cancel", style: "cancel" },
                            { text: "Clear", onPress: clearOrders },
                        ]
                    )
                }
            >
                <Text style={styles.clearButtonText}>Clear Order History</Text>
            </TouchableOpacity>
            <FlatList
    data={orders}
    keyExtractor={(item) => item.id.toString()}
    renderItem={({ item }) => (
        <View style={styles.orderCard}>
            <Text style={styles.orderText}>Order ID:</Text><Text> {item.id}</Text>
            <Text style={styles.orderText}>Total: </Text><Text> Rs. {item.total_price}</Text>
            <Text style={styles.orderText}>Ordered on: </Text><Text> {item.created_at}</Text>
            <View style={styles.itemsContainer}>
                {renderOrderItems(item.items, item.id)} 
            </View>
        </View>
    )}
/>

        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 16,
        backgroundColor: "#fff",
    },
    centered: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
    },
    orderCard: {
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 16,
        marginBottom: 16,
        shadowColor: "#000",
        shadowOpacity: 0.1,
        shadowRadius: 5,
        elevation: 5,
    },
    orderText: {
        fontWeight: "bold",
        fontSize: 16,
        color: "#333",
        marginTop: 5,
        marginBottom: 1,
    },
    itemCard: {
        marginTop: 10,
        backgroundColor: "#f8f8f8",
        padding: 10,
        borderRadius: 8,
        marginBottom: 8,
    },
    itemText: {
        fontSize: 14,
        color: "#333",
    },
    itemsContainer: {
        marginTop: 10,
    },
    clearButton: {
        backgroundColor: "#bfbfbf", // Gray color
        padding: 15,
        borderRadius: 10,
        marginVertical: 15, // Top and bottom margin
        alignItems: "center",
    },
    clearButtonText: {
        color: "#fff",
        fontSize: 16,
        fontWeight: "bold",
    },
});

export default OrdersHistoryScreen;
