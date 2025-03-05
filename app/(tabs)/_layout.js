// app/(tabs)/_layout.js
import { Tabs } from 'expo-router';
import { FontAwesome, Foundation } from '@expo/vector-icons';
import { SchoolTimeProvider } from "../context/SchoolTimeContext";
import StageProvider from "../context/StageContext";
import { BadgeProvider } from "../context/BadgeContext"

export default function TabLayout() {
  return (
    
    <StageProvider>
    <SchoolTimeProvider>
    <BadgeProvider>
    <Tabs screenOptions={{
      tabBarActiveTintColor: '#2563eb',
      headerShown: false,
    }}>
      <Tabs.Screen
        name="home/index"
        options={{
          tabBarLabel: 'Home',
          title: 'Home',
          tabBarIcon: ({ color }) => <FontAwesome name="home" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="schedule/index"
        options={{
          tabBarLabel: 'Schedule',
          title: 'Schedule',
          tabBarIcon: ({ color }) => <FontAwesome name="calendar" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        // Hide other schedule routes from tab bar
        name="schedule/day"
        options={{
          href: null, // This prevents the tab from showing in the tab bar
        }}
      />
      <Tabs.Screen
        name="schedule/week"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="schedule/semester"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="schedule/trimester"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="schedule/quarter"
        options={{
          href: null,
        }}
      />
      <Tabs.Screen
        name="badges/index"
        options={{
          tabBarLabel: 'Badges',
          title: 'Badges',
          tabBarIcon: ({ color }) => <FontAwesome name="certificate" size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="profile/index"
        options={{
          tabBarLabel: 'Profile',
          title: 'Profile',
          tabBarIcon: ({ color }) => <FontAwesome name="user" size={24} color={color} />,
        }}
      />

    <Tabs.Screen
            name="settings/index"
            options={{
              title: 'Settings',
              tabBarIcon: ({ color }) => <FontAwesome name="gear" size={24} color={color} />,
            }}
          />
    </Tabs>
    </BadgeProvider>
    </SchoolTimeProvider>
    </StageProvider>
    
  );
}