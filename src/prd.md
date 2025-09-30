# Wedding Table Planner - Product Requirements Document

## Core Purpose & Success
- **Mission Statement**: Una herramienta visual y intuitiva para organizar invitados de bodas y eventos en mesas de 10 personas de manera eficiente.
- **Success Indicators**: Los usuarios pueden crear listas de invitados, distribuirlos en mesas visualmente, y exportar la planificación final en PDF.
- **Experience Qualities**: Elegante, Intuitivo, Eficiente

## Project Classification & Approach
- **Complexity Level**: Light Application (múltiples características con estado básico)
- **Primary User Activity**: Creating & Interacting (creación de listas y distribución visual)

## Thought Process for Feature Selection
- **Core Problem Analysis**: Los organizadores de eventos necesitan una forma visual y fácil de distribuir invitados en mesas, considerando restricciones de capacidad.
- **User Context**: Planificadores de bodas y eventos que necesitan organizar la distribución de mesas de manera eficiente.
- **Critical Path**: Agregar invitados → Generar/agregar mesas → Distribuir mediante drag & drop → Exportar distribución final
- **Key Moments**: 
  1. Primera distribución automática de mesas
  2. Ajuste manual mediante arrastrar y soltar
  3. Exportación final del plan

## Essential Features

### Guest Management
- **What it does**: Permite agregar, eliminar y ver la lista completa de invitados
- **Why it matters**: Base fundamental para toda la planificación de mesas
- **Success criteria**: Los usuarios pueden agregar nombres fácilmente y ver invitados sin asignar

### Table Generation
- **What it does**: Genera automáticamente el número óptimo de mesas basado en el número de invitados (10 por mesa)
- **Why it matters**: Automatiza el cálculo inicial y ahorra tiempo de planificación
- **Success criteria**: Crea la cantidad correcta de mesas y permite agregar mesas adicionales

### Visual Table Assignment
- **What it does**: Permite arrastrar y soltar invitados en posiciones específicas de mesas circulares
- **Why it matters**: Proporciona control visual e intuitivo para ajustes precisos de la distribución
- **Success criteria**: Los invitados se pueden mover fácilmente entre mesas y posiciones

### Statistics & Overview
- **What it does**: Muestra contadores en tiempo real de invitados asignados, sin asignar, y mesas completas
- **Why it matters**: Proporciona feedback inmediato del progreso de planificación
- **Success criteria**: Los números se actualizan automáticamente y son precisos

### PDF Export
- **What it does**: Genera un documento PDF profesional con la distribución completa de mesas
- **Why it matters**: Permite compartir y usar la planificación final en el evento real
- **Success criteria**: El PDF incluye toda la información de distribución, estadísticas y se descarga correctamente

### Data Persistence
- **What it does**: Guarda automáticamente toda la información de invitados y mesas
- **Why it matters**: Los usuarios no pierden su trabajo al cerrar la aplicación
- **Success criteria**: La información se mantiene entre sesiones

## Design Direction

### Visual Tone & Identity
- **Emotional Response**: Profesional pero cálido, que inspire confianza para un evento importante
- **Design Personality**: Elegante y sofisticado, apropiado para bodas y eventos especiales
- **Visual Metaphors**: Mesas circulares reales, distribución espacial como un salón de eventos
- **Simplicity Spectrum**: Interfaz limpia y minimalista que permite enfocarse en la tarea

### Color Strategy
- **Color Scheme Type**: Analogous (colores adyacentes cálidos)
- **Primary Color**: Oro suave (oklch(0.8 0.1 85)) - representa elegancia y celebración
- **Secondary Colors**: Beige claro (oklch(0.96 0.02 85)) para superficies secundarias
- **Accent Color**: Oro más saturado (oklch(0.7 0.15 80)) para llamar la atención
- **Color Psychology**: Los tonos dorados evocan celebración, elegancia y ocasiones especiales
- **Color Accessibility**: Contraste WCAG AA cumplido en todas las combinaciones principales
- **Foreground/Background Pairings**: 
  - Texto principal (oklch(0.2 0.01 85)) sobre fondo claro (oklch(0.98 0.01 85))
  - Texto sobre primario (oklch(0.15 0.01 85)) sobre oro (oklch(0.8 0.1 85))
  - Texto sobre acento (blanco) sobre oro saturado (oklch(0.7 0.15 80))

### Typography System
- **Font Pairing Strategy**: Playfair Display para títulos (elegante, serif) + Inter para cuerpo (legible, sans-serif)
- **Typographic Hierarchy**: Títulos grandes y elegantes, texto de cuerpo claro y funcional
- **Font Personality**: Playfair aporta sofisticación, Inter aporta claridad y modernidad
- **Readability Focus**: Espaciado generoso, tamaños apropiados para lectura rápida
- **Typography Consistency**: Uso consistente de pesos y tamaños a través de toda la aplicación
- **Which fonts**: Playfair Display (600 weight) para títulos, Inter (400, 500, 600) para el resto
- **Legibility Check**: Ambas fuentes probadas para alta legibilidad en todas las resoluciones

### Visual Hierarchy & Layout
- **Attention Direction**: Panel de invitados a la izquierda, mesas principales al centro, estadísticas arriba
- **White Space Philosophy**: Espaciado generoso para crear sensación de elegancia y no agobiar
- **Grid System**: Layout flexbox responsivo que se adapta de 1 a 3 columnas según el dispositivo
- **Responsive Approach**: Mobile-first con adaptación progresiva para tablets y desktop
- **Content Density**: Balanceado - suficiente información visible sin saturar la vista

### Animations
- **Purposeful Meaning**: Animaciones sutiles durante drag & drop para comunicar las acciones
- **Hierarchy of Movement**: Feedback visual en elementos interactivos, transiciones suaves entre estados
- **Contextual Appropriateness**: Movimientos elegantes que reflejan la sofisticación del contexto de bodas

### UI Elements & Component Selection
- **Component Usage**: Cards para organización, Buttons para acciones, Input fields para entrada de datos
- **Component Customization**: Bordes suaves, sombras sutiles, colores de la paleta dorada
- **Component States**: Estados hover y active claramente definidos, feedback visual inmediato
- **Icon Selection**: Phosphor icons para consistencia, iconos que representen claramente cada acción
- **Component Hierarchy**: Botones primarios para acciones principales, secundarios para opciones adicionales
- **Spacing System**: Sistema de espaciado consistente usando valores de Tailwind
- **Mobile Adaptation**: Componentes que se apilan verticalmente en móvil, mantienen funcionalidad completa

### Visual Consistency Framework
- **Design System Approach**: Sistema basado en componentes con tokens de diseño consistentes
- **Style Guide Elements**: Paleta de colores, tipografía, espaciado, y componentes documentados
- **Visual Rhythm**: Ritmo visual mediante espaciado consistente y repetición de elementos
- **Brand Alignment**: Diseño que refleja la elegancia y profesionalismo de eventos especiales

### Accessibility & Readability
- **Contrast Goal**: WCAG AA compliance como mínimo para todo el texto y elementos interactivos
- **Keyboard Navigation**: Navegación completa por teclado para todas las funciones
- **Screen Reader Support**: Etiquetas apropiadas y estructura semántica para lectores de pantalla

## Edge Cases & Problem Scenarios
- **Potential Obstacles**: Usuarios que agregan muchos invitados, necesidad de mesas con diferentes capacidades
- **Edge Case Handling**: Validación de entrada, manejo de listas vacías, exportación con datos incompletos
- **Technical Constraints**: Rendimiento con listas muy grandes, limitaciones de drag & drop en móvil

## Implementation Considerations
- **Scalability Needs**: Soporte para eventos de diferentes tamaños (hasta 500+ invitados)
- **Testing Focus**: Funcionalidad de drag & drop, persistencia de datos, generación de PDF
- **Critical Questions**: ¿Necesitamos soporte para diferentes tamaños de mesa? ¿Integración con otros sistemas?

## Recent Updates
- **PDF Export**: Agregada funcionalidad completa de exportación a PDF con distribución detallada
- **Enhanced Statistics**: Contadores en tiempo real de asignación y progreso
- **Improved UX**: Botones de exportación disponibles tanto en panel principal como lateral

## Reflection
Este enfoque combina la elegancia visual apropiada para eventos especiales con la funcionalidad práctica necesaria para una planificación eficiente. La interfaz de drag & drop hace que la distribución sea intuitiva, mientras que la exportación PDF proporciona el resultado final profesional que los organizadores necesitan.