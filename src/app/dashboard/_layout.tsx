
import Footer from '@/components/Footer';
import Drawer from '@/components/Drawer';
import { DrawerProvider } from '@/context/DrawerContext';
import { Slot } from 'expo-router';
import { View } from 'react-native';


export default function Layout() {
  
  return (
    <DrawerProvider>
       <View style={{ flex: 1 }}>
        <View style={{ flex: 1 }}>
          <Slot />
        </View>
        <Footer />
        <Drawer />
      </View>
    </DrawerProvider>
  );
}

