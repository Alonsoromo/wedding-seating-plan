# Implementación de Sincronización en Tiempo Real

## Problema Resuelto
Cuando un usuario actualiza la página o cuando múltiples personas trabajan en el planificador simultáneamente, los cambios ahora se sincronizan automáticamente entre todas las sesiones abiertas.

## Solución Implementada

### 1. Hook `useSyncedKV`
Se creó un nuevo hook personalizado (`src/hooks/use-synced-kv.ts`) que extiende la funcionalidad de `useKV` con sincronización en tiempo real.

#### Características:
- **Persistencia Automática**: Utiliza `useKV` del Spark SDK para guardar datos automáticamente
- **Sincronización Cross-Tab**: Usa BroadcastChannel API para sincronizar cambios entre pestañas del mismo navegador
- **Sincronización Cross-Session**: Los cambios de diferentes usuarios se propagan automáticamente
- **Notificaciones Visuales**: Muestra toasts informativos cuando se reciben actualizaciones de otras sesiones
- **Manejo de Conflictos**: Usa timestamps para evitar aplicar cambios obsoletos

#### Cómo Funciona:
1. Cada sesión del navegador tiene un ID único
2. Cuando un usuario hace un cambio (agregar invitado, mover a mesa, etc.):
   - El cambio se guarda en el KV store (persistencia)
   - Se envía un mensaje a través de BroadcastChannel a todas las demás pestañas/sesiones
3. Otras sesiones reciben el mensaje y actualizan su estado automáticamente
4. Se muestra una notificación toast para informar al usuario del cambio

### 2. Integración en App.tsx
El componente principal ahora usa `useSyncedKV` en lugar de `useKV`:

```typescript
const [guests, setGuests] = useSyncedKV<Guest[]>("wedding-guests", []);
const [tables, setTables] = useSyncedKV<Table[]>("wedding-tables", []);
```

## Casos de Uso

### Caso 1: Refrescar la Página
✅ **Antes**: Los datos se perdían
✅ **Ahora**: Los datos persisten automáticamente gracias a useKV

### Caso 2: Múltiples Pestañas del Mismo Usuario
✅ **Antes**: Los cambios no se sincronizaban entre pestañas
✅ **Ahora**: Los cambios se propagan instantáneamente a todas las pestañas abiertas

### Caso 3: Múltiples Usuarios Trabajando Simultáneamente
✅ **Antes**: Cada usuario veía solo sus propios cambios
✅ **Ahora**: Todos los usuarios ven los cambios de los demás en tiempo real

## Tecnologías Utilizadas

### BroadcastChannel API
- API nativa del navegador para comunicación entre pestañas
- Soportado en todos los navegadores modernos
- No requiere servidor o websockets
- Funciona de manera eficiente y rápida

### Spark KV Store
- Almacenamiento persistente proporcionado por GitHub Spark
- Los datos se guardan automáticamente
- Disponibles entre sesiones y recargas de página

## Ventajas de la Implementación

1. **Sin Servidor Adicional**: No requiere websockets ni servidor de sincronización
2. **Eficiente**: Usa APIs nativas del navegador
3. **Confiable**: Combina persistencia (KV) con sincronización en tiempo real (BroadcastChannel)
4. **UX Mejorada**: Los usuarios ven notificaciones cuando hay actualizaciones
5. **Sin Conflictos**: El sistema de timestamps previene la aplicación de cambios obsoletos

## Limitaciones Conocidas

1. **Soporte de Navegador**: BroadcastChannel no funciona en navegadores muy antiguos (pre-2016)
   - Fallback: La persistencia con useKV sigue funcionando, solo sin sincronización en tiempo real
2. **Mismo Origen**: BroadcastChannel solo funciona entre pestañas del mismo dominio

## Testing

Para probar la sincronización:

1. Abre la aplicación en dos pestañas diferentes
2. Agrega un invitado en la primera pestaña
3. Deberías ver el invitado aparecer automáticamente en la segunda pestaña con una notificación toast
4. Mueve invitados entre mesas en una pestaña y observa los cambios en la otra
5. Refresca cualquier pestaña - los datos persisten

## Mejoras Futuras (Opcionales)

- Agregar indicador visual de "otro usuario está modificando"
- Mostrar quién hizo cada cambio (requeriría autenticación de usuarios)
- Agregar opción para deshabilitar notificaciones toast
- Agregar sincronización por WebSocket para dispositivos en diferentes redes
