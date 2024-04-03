import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native'; // Import Alert component
import axios from 'axios';
import Papa from 'papaparse';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'; // Import the Icon component
import {Picker} from '@react-native-picker/picker';

// Import your logo image
import LogoImage from './assets/logo.png';

const App = () => {
  const [currentDate, setCurrentDate] = useState('');
  const [currentTime, setCurrentTime] = useState('');
  const [currentDay, setCurrentDay] = useState('');
  const [variableLetter, setVariableLetter] = useState('');
  const [alertMessage, setAlertMessage] = useState('');
  const [selectedSchool, setSelectedSchool] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      setCurrentDate(now.toDateString());
      setCurrentTime(now.toLocaleTimeString());
      setCurrentDay(now.toLocaleDateString('en-US', { weekday: 'long' }));
      const DateFormatted = now.toISOString().split('T')[0]; // Format date as YYYY-MM-DD
      fetchDayFromSheet(DateFormatted);
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const [screen, setScreen] = useState('home'); // Add this line to manage screen state

  const fetchDayFromSheet = async (formattedDate) => {
    try {
      const response = await axios.get("https://docs.google.com/spreadsheets/d/e/2PACX-1vSc_8auX033emgLOOYDwN9-3S-7B4SL_GdVJ6cuVrpkJ1UeHdTXcwk5vNQmfXNaLgeEv4_LtUmZhsp_/pub?output=csv");
      Papa.parse(response.data, {
        complete: (result) => {
          const data = result.data;
  
          // Find the index for the 'Date' column
          const headers = data[0];
          const dateIndex = headers.indexOf('Date');
          const dayIndex = headers.indexOf('Day');
          const alertIndex = headers.indexOf('Alert');
  
          // Assuming the first row contains headers and actual data starts from the second row
          for (let i = 1; i < data.length; i++) {
            const row = data[i];
            if (row[dateIndex] === formattedDate) {
              // Found the row for today's date
              const variableLetter = row[dayIndex];
              const alertData = row[alertIndex];
              
              setVariableLetter(variableLetter || 'Data not found');
              setAlertMessage(alertData || 'No specific alerts');
              return; // Exit the loop and function once the match is found
            }
          }
  
          // If the loop completes without finding a match
          setAlertMessage('No data found for today');
        },
        header: false, // Set to false because we manually handle the headers
        skipEmptyLines: true,
      });
    } catch (error) {
      console.error("Error fetching or parsing sheet data:", error);
      setAlertMessage('Error fetching data');
    }
  };

  const handleGoButtonPress = async () => {
    try {
      const response = await axios.get("https://docs.google.com/spreadsheets/d/e/2PACX-1vSc_8auX033emgLOOYDwN9-3S-7B4SL_GdVJ6cuVrpkJ1UeHdTXcwk5vNQmfXNaLgeEv4_LtUmZhsp_/pub?gid=1600480059&single=true&output=csv", {
        responseType: 'blob'
      });
  
      Papa.parse(response.data, {
        complete: (result) => {
          const data = result.data;
  
          // Filter the data based on the selected school
          const filteredData = data.filter(row => row[0] === selectedSchool);
  
          // Organize the data by restaurant
          const organizedData = {};
          filteredData.forEach(row => {
            const restaurant = row[1];
            const foodItem = row[2];
            const price = row[3];
            if (!organizedData[restaurant]) {
              organizedData[restaurant] = [];
            }
            organizedData[restaurant].push({ foodItem, price });
          });
  
          // Log the organized data for demonstration
          console.log("Organized Data: ", organizedData);
  
          // You can set the organized data to the state if needed
          setOrganizedData(organizedData);
          
          // After organizing the data, navigate to the 'food' screen
          setScreen('food');
        },
        header: true,
        skipEmptyLines: true
      });
    } catch (error) {
      console.error("Error fetching or parsing sheet data:", error);
    }
  };
  return (
    <View style={styles.container}>
      {alertMessage !== '' && (
        <View style={styles.alertBanner}>
          <Text style={styles.alertText}>{alertMessage}</Text>
        </View>
      )}

      <View style={styles.header}>
        <Image source={LogoImage} style={styles.logo} resizeMode="contain" />
      </View>

      {/* Conditional content rendering based on the screen state */}
      {screen === 'home' && (
        <View style={styles.content}>
          <Text style={styles.info}>{currentDate}</Text>
          <Text style={styles.info}>Day: {currentDay}</Text>
          <Text style={styles.info}>{currentTime}</Text>
          <Text style={styles.info}>Variable Letter: {variableLetter}</Text>
        </View>
      )}

      {screen === 'food' && (
        <View style={styles.content}>
          {/* <Text style={styles.info}>Food Screen</Text> */}
          <Text style={styles.info}>Select a School Menu:</Text>
          <Picker
            selectedValue={selectedSchool}
            style={{height: 50, width: 150}}
            onValueChange={(itemValue, itemIndex) => setSelectedSchool(itemValue)}>
            <Picker.Item label="Prosper High School" value="PHS" />
            <Picker.Item label="Rock Hill High School" value="RHHS" />
            <Picker.Item label="Walnut Grove High School" value="WGHS" />
            // Add more schools as needed
          </Picker>
          <TouchableOpacity
            style={styles.goButton}
            onPress={handleGoButtonPress}>
            <Text style={styles.goButtonText}>Go</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={styles.footer}>
        <TouchableOpacity style={styles.menuButton} onPress={() => setScreen('home')}>
          {/* Update icon to home */}
          <Icon name="home" size={24} color="white" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.menuButton} onPress={() => setScreen('food')}>
          {/* Update icon to food-related, like "food-fork-drink" */}
          <Icon name="food-fork-drink" size={24} color="white" />
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  footer: {
    flex: 1,
    flexDirection: 'row',
  },
  logo: {
    marginTop: 300,
    width: 200, // Set the width of the logo as needed
    height: 100, // Set the height of the logo as needed
  },
  info: {
    fontSize: 18,
    marginBottom: 10,
  },
  menuButton: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007bff', // Example background color
    margin: 10,
    borderRadius: 20, // Rounded corners
    paddingVertical: 8, // Reduced vertical padding
    paddingHorizontal: 10, // Horizontal padding can remain the same or adjust as needed
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  menuText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white', // Ensure text is white for better contrast
  },
  alertBanner: {
    backgroundColor: 'red',
    padding: 10,
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  alertText: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  goButton: {
    marginTop: 20,
    backgroundColor: '#007bff',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  goButtonText: {
    color: 'white',
    fontSize: 16,
    textAlign: 'center',
  },
});

export default App;
