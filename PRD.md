# Wedding Table Planner - PRD

Una aplicación visual e intuitiva para organizar invitados en mesas de 10 personas para bodas de manera práctica y sencilla.

**Experience Qualities**:
1. **Visual** - Interface clara con representación gráfica de mesas y invitados que permite ver la distribución al instante
2. **Intuitiva** - Drag & drop simple para mover invitados entre mesas sin complicaciones
3. **Elegante** - Diseño sofisticado que refleja la importancia y belleza del evento

**Complexity Level**: Light Application (multiple features with basic state)
- Maneja múltiples funcionalidades (agregar invitados, crear mesas, asignar lugares) con estado persistente pero sin requerir cuentas de usuario

## Essential Features

**Gestión de Invitados**
- Functionality: Agregar, editar y eliminar invitados con nombres
- Purpose: Mantener lista completa de asistentes a la boda
- Trigger: Botón "Agregar Invitado" o input rápido
- Progression: Click agregar → escribir nombre → confirmar → invitado aparece en lista sin asignar
- Success criteria: Invitado visible en panel lateral, listo para asignar a mesa

**Creación de Mesas**
- Functionality: Generar mesas automáticamente basado en número de invitados
- Purpose: Crear estructura de mesas con capacidad de 10 personas cada una
- Trigger: Botón "Generar Mesas" después de agregar invitados
- Progression: Click generar → cálculo automático → mesas aparecen visualmente → listas para asignaciones
- Success criteria: Mesas circulares visibles con espacios para 10 invitados cada una

**Asignación Visual**
- Functionality: Drag & drop de invitados a posiciones específicas en mesas y entre mesas
- Purpose: Organizar invitados considerando relaciones y preferencias con flexibilidad total
- Trigger: Arrastrar invitado desde panel lateral a mesa O entre posiciones de diferentes mesas
- Progression: Click invitado → arrastrar → hover sobre posición → soltar → confirmación visual → actualización automática
- Success criteria: Invitado aparece en nueva posición de mesa, se remueve automáticamente de posición anterior, indicador visual durante arrastre
- **New Enhancement**: Los invitados ya asignados a mesas pueden ser arrastrados directamente entre diferentes mesas sin necesidad de desasignar primero

**Vista General**
- Functionality: Visualización completa del layout del salón con todas las mesas
- Purpose: Supervisar la distribución completa y hacer ajustes finales
- Trigger: Vista por defecto de la aplicación
- Progression: Carga app → vista general → identificar mesas llenas/vacías → hacer ajustes según necesidad
- Success criteria: Layout claro mostrando estado de todas las mesas y distribución balanceada

## Edge Case Handling

- **Mesas incompletas**: Resaltar mesas con menos de 10 personas en color diferente
- **Invitados sin mesa**: Panel lateral siempre visible con invitados no asignados
- **Cambio de planes**: Permitir mover invitados entre mesas fácilmente con drag & drop directo
- **Eliminación de invitados**: Reorganizar automáticamente si se elimina alguien ya asignado
- **Indicador de arrastre**: Mostrar visualmente qué invitado se está moviendo y dónde se puede soltar
- **Validación de posiciones**: Solo permitir soltar en posiciones vacías, con feedback visual claro

## Design Direction

El diseño debe evocar elegancia, sofisticación y organización - como una celebración bien planificada - con interface minimalista que prioriza la funcionalidad visual sobre decoraciones innecesarias.

## Color Selection

Analogous (adjacent colors on color wheel) - Paleta dorada y blanca que evoca elegancia nupcial con toques suaves de champagne para crear ambiente sofisticado y celebratorio.

- **Primary Color**: Dorado elegante (oklch(0.8 0.1 85)) - Comunica celebración y sofisticación
- **Secondary Colors**: Blanco perla y champagne suave para backgrounds y elementos secundarios
- **Accent Color**: Dorado más intenso (oklch(0.7 0.15 80)) para CTAs y elementos importantes
- **Foreground/Background Pairings**: 
  - Background (Blanco Perla oklch(0.98 0.01 85)): Texto gris oscuro (oklch(0.2 0.01 85)) - Ratio 11.2:1 ✓
  - Card (Blanco oklch(1 0 0)): Texto gris oscuro (oklch(0.2 0.01 85)) - Ratio 12.1:1 ✓
  - Primary (Dorado oklch(0.8 0.1 85)): Texto oscuro (oklch(0.15 0.01 85)) - Ratio 8.4:1 ✓
  - Accent (Dorado Intenso oklch(0.7 0.15 80)): Texto blanco (oklch(1 0 0)) - Ratio 4.9:1 ✓

## Font Selection

Tipografía que combine elegancia clásica con legibilidad moderna - Inter para textos generales y Playfair Display para títulos, transmitiendo sofisticación sin sacrificar claridad.

- **Typographic Hierarchy**: 
  - H1 (Título Principal): Playfair Display Semibold/32px/tight letter spacing
  - H2 (Nombres de Mesa): Inter Semibold/18px/normal spacing
  - Body (Nombres Invitados): Inter Regular/14px/comfortable line-height
  - Labels (Contadores): Inter Medium/12px/wide letter spacing

## Animations

Animaciones sutiles que guían la interacción sin distraer - transiciones suaves durante drag & drop y cambios de estado que refuerzan la sensación de control y precisión.

- **Purposeful Meaning**: Movimientos que simulan elegancia de una ceremonia bien coreografiada
- **Hierarchy of Movement**: Drag & drop recibe más atención visual, cambios de estado son sutiles pero confirmatorios

## Component Selection

- **Components**: Cards para mesas circulares, Badge para invitados, Button para acciones principales, Input para agregar invitados, Separator para dividir secciones
- **Customizations**: Mesas circulares personalizadas (no existe en shadcn), drag zones, indicadores de capacidad
- **States**: Mesas completas/incompletas con colores diferentes, invitados con estados hover/drag/assigned
- **Icon Selection**: Users para invitados, Plus para agregar, LayoutGrid para mesas, Check para completadas
- **Spacing**: Sistema de 8px como base, 16px entre elementos relacionados, 32px entre secciones principales
- **Mobile**: Stack vertical en móvil con panel de invitados expandible, mesas en scroll horizontal, interacciones adaptadas a touch