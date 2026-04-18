import React from 'react';
import { Tabs } from 'expo-router';
import { Map, Navigation, Accessibility, BarChart2, Moon } from 'lucide-react-native';
import { THEME } from '@/constants/Theme';

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: THEME.accent,
        tabBarInactiveTintColor: '#888',
        tabBarStyle: {
          backgroundColor: THEME.background,
          borderTopColor: THEME.border,
          height: 60,
          paddingBottom: 8,
        },
        headerStyle: {
          backgroundColor: THEME.background,
        },
        headerTintColor: THEME.foreground,
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}>
      <Tabs.Screen
        name="mapa"
        options={{
          title: 'Mapa',
          tabBarIcon: ({ color }) => <Map size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="planifica"
        options={{
          title: 'Planifica',
          tabBarIcon: ({ color }) => <Navigation size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="accesibilidad"
        options={{
          title: 'Accesibilidad',
          tabBarIcon: ({ color }) => <Accessibility size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="pulso"
        options={{
          title: 'Pulso',
          tabBarIcon: ({ color }) => <BarChart2 size={24} color={color} />,
        }}
      />
      <Tabs.Screen
        name="nocturno"
        options={{
          title: 'Nocturno',
          tabBarIcon: ({ color }) => <Moon size={24} color={color} />,
        }}
      />
    </Tabs>
  );
}
