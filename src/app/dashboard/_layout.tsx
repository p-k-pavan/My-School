
import Footer from '@/components/Footer';
import { Slot } from 'expo-router';
import { View } from 'react-native';


export default function Layout() {
  
  return (
    <>
       <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
        <Footer />
      </View>
    </>
  );
}

