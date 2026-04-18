# 📊 Score Card Flotilla

![Version](https://img.shields.io/badge/version-1.0.0-blue)
![Next.js](https://img.shields.io/badge/Next.js-15-black)
![Expo](https://img.shields.io/badge/Expo-52-white)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)

**Score Card Flotilla** es una plataforma integral de movilidad e inteligencia de transporte diseñada para la Ciudad de México. Combina visualización avanzada de datos geográficos (GTFS), planificación de rutas potenciada por Inteligencia Artificial y un sistema de monitoreo en tiempo real para optimizar la operación de flotillas y el tránsito urbano.

---

## 🚀 Vision General

Este ecosistema está compuesto por dos aplicaciones principales:
1.  **Web Dashboard (`score-card-flotilla`)**: Panel de control administrativo y de usuario con mapas interactivos, análisis de accesibilidad y planificador con IA.
2.  **Mobile App (`score-card-flotilla-mobile`)**: Herramienta de campo para conductores y usuarios finales con visualización optimizada para dispositivos móviles.

---

## ✨ Funcionalidades Clave

### 🗺️ Visualización Geoespacial
- **Capas Dinámicas**: Visualización de rutas de Metro, Metrobús, Trolebús y RTP basada en el estándar GTFS.
- **Filtrado por Agencia**: Capacidad de aislar sistemas de transporte específicos para análisis detallado.
- **Modo Nocturno**: Capas especializadas para el sistema de transporte "Nochebús".

### 🤖 Planificador de Rutas con IA (Claude 3.5 Sonnet)
- **Chat Contextual**: Interfaz de lenguaje natural que entiende consultas complejas como *"¿Cuál es la ruta más accesible para llegar de Polanco a Coyoacán evitando escaleras?"*.
- **Integración de Datos**: La IA consume datos reales de estaciones y rutas para proporcionar respuestas precisas y seguras.

### ♿ Accesibilidad y "Pulso"
- **Filtro Wheelchair**: Identificación visual inmediata de estaciones y vehículos con soporte para sillas de ruedas.
- **Dashboard de Estadísticas**: Resumen analítico de la red, incluyendo número de paradas, rutas activas y métricas de cobertura por agencia.

---

## 🛠️ Stack Tecnológico

### Web (Frontend & Backend)
- **Framework**: Next.js 15 (App Router)
- **Lenguaje**: TypeScript
- **Mapas**: Leaflet.js con React-Leaflet
- **Estilos**: Tailwind CSS
- **Iconografía**: Lucide React

### Mobile
- **Framework**: Expo / React Native
- **Navegación**: Expo Router (File-based)
- **Mapas**: MapView optimizado

### Procesamiento de Datos
- **Scripts**: Node.js (ESM) para la transformación de archivos `.txt` (GTFS) a archivos `.json` geo-optimizados.

---

## 📂 Estructura del Proyecto

```bash
/
├── score-card-flotilla/         # Aplicación Web (Next.js)
│   ├── src/app/                 # Rutas y Páginas (Home, Pulso, IA)
│   ├── src/components/          # Componentes reutilizables (Map, Chat)
│   ├── src/lib/                 # Utilidades geográficas y tipos
│   └── scripts/                 # Scripts de procesamiento GTFS
├── score-card-flotilla-mobile/  # Aplicación Móvil (Expo)
│   ├── app/                     # Estructura de tabs y navegación
│   ├── assets/data/             # Datos geoespaciales optimizados
│   └── components/              # UI Components móviles
└── gtfs/                        # Datos fuente del transporte CDMX
```

---

## ⚙️ Configuración e Instalación

### Requisitos Previos
- Node.js (v18.0 o superior)
- API Key de Anthropic (para el planificador con IA)

### Instalación Web
1. Entrar al directorio: `cd score-card-flotilla`
2. Instalar dependencias: `npm install`
3. Configurar variables de entorno:
   Crear un archivo `.env.local`:
   ```env
   ANTHROPIC_API_KEY=tu_clave_aqui
   ```
4. Iniciar desarrollo: `npm run dev`

### Instalación Móvil
1. Entrar al directorio: `cd score-card-flotilla-mobile`
2. Instalar dependencias: `npm install`
3. Iniciar Expo: `npx expo start`

---

## 📊 Procesamiento de Datos (GTFS)

La plataforma utiliza datos oficiales en formato GTFS. Para actualizar los datos:
1. Coloca los archivos `.txt` en `score-card-flotilla/gtfs/`.
2. Ejecuta el script de procesamiento:
   ```bash
   cd score-card-flotilla
   node scripts/process-gtfs.mjs
   ```
Este comando generará los archivos `routes-geo.json` y `stops-geo.json` necesarios para el renderizado de mapas.

---

## 📝 Roadmap
- [ ] Implementación de WebSockets para ubicación en tiempo real.
- [ ] Sistema de alertas de incidentes reportados por usuarios.
- [ ] Exportación de reportes de rendimiento de flota (Score Cards) en PDF.

---

## 👥 Contribución
Para contribuir, por favor abre un Pull Request o reporta un Issue en el repositorio oficial.

**Desarrollado para la mejora de la movilidad urbana.**
