# Quick Start: Sincronización Automática

## 🚀 TL;DR

**El problema está resuelto.** Los datos ahora:
- ✅ Se guardan automáticamente
- ✅ Persisten al refrescar la página
- ✅ Se sincronizan entre múltiples usuarios en tiempo real

No necesitas hacer nada, ¡ya funciona! 🎉

---

## 📝 Para Usuarios

### Uso Normal
1. Abre la aplicación
2. Agrega invitados
3. Genera mesas
4. Arrastra invitados a las mesas
5. **Refresca la página** - todo está guardado ✅

### Colaboración
1. Comparte la URL con otras personas
2. Todos pueden trabajar al mismo tiempo
3. Los cambios se ven en tiempo real ✅
4. Aparecen notificaciones cuando otros hacen cambios

**Lee más**: `COMO_FUNCIONA_LA_SINCRONIZACION.md` (guía completa en español)

---

## 💻 Para Desarrolladores

### Uso del Hook

```typescript
import { useSyncedKV } from './hooks/use-synced-kv';

// Igual que useState, pero con sincronización automática
const [data, setData] = useSyncedKV<MyType>('my-key', initialValue);

// Con opciones
const [data, setData] = useSyncedKV<MyType>('my-key', initialValue, {
  showSyncToast: true,        // Mostrar notificaciones (default: true)
  syncChannelName: 'my-app'   // Nombre del canal (default: 'wedding-planner-sync')
});
```

### Características

- **Persistencia**: Automática via Spark KV Store
- **Sincronización**: BroadcastChannel API para tiempo real
- **Notificaciones**: Toasts automáticos cuando hay updates
- **Prevención de conflictos**: Sistema de timestamps

### Qué Cambia en Tu Código

```diff
- import { useKV } from '@github/spark/hooks';
+ import { useSyncedKV } from './hooks/use-synced-kv';

- const [guests, setGuests] = useKV<Guest[]>("key", []);
+ const [guests, setGuests] = useSyncedKV<Guest[]>("key", []);
```

**Lee más**: `SYNC_IMPLEMENTATION.md` (documentación técnica)

---

## 🧪 Testing Rápido

### Test 1: Persistencia (30 segundos)
1. Agrega 3 invitados
2. Refresca la página (F5)
3. ✅ Los invitados deben estar ahí

### Test 2: Sincronización (1 minuto)
1. Abre en 2 pestañas
2. Agrega invitado en Pestaña 1
3. ✅ Debe aparecer en Pestaña 2
4. ✅ Debe aparecer notificación

### Test 3: Colaboración (2 minutos)
1. Comparte URL con un amigo
2. Ambos agregan invitados
3. ✅ Ambos ven los cambios del otro
4. ✅ Aparecen notificaciones

---

## 📁 Archivos Importantes

```
src/
  hooks/
    use-synced-kv.ts          # Hook principal (143 líneas)
  App.tsx                     # Usa useSyncedKV (6 líneas cambiadas)

docs/
  RESUMEN_SINCRONIZACION.md         # Resumen ejecutivo (español)
  COMO_FUNCIONA_LA_SINCRONIZACION.md # Guía completa (español)
  SYNC_IMPLEMENTATION.md            # Docs técnicas (inglés)
  QUICK_START.md                    # Esta guía
```

---

## 🆘 Troubleshooting

### Los datos no persisten
- ✅ Verifica que tengas conexión a Internet
- ✅ Verifica que el KV Store esté configurado correctamente
- ✅ Revisa la consola del navegador para errores

### La sincronización no funciona
- ✅ Verifica que ambas pestañas estén en el mismo dominio
- ✅ Verifica que el navegador soporte BroadcastChannel (Chrome 54+, Firefox 38+, Safari 15.4+)
- ✅ Revisa la consola del navegador

### Notificaciones molestas
```typescript
// Desactiva las notificaciones
const [data, setData] = useSyncedKV('key', [], {
  showSyncToast: false
});
```

---

## 🎓 Cómo Funciona (Simplified)

```
Tu cambio
    ↓
Guarda en KV Store (persistencia)
    ↓
Envía mensaje via BroadcastChannel
    ↓
Otras pestañas reciben mensaje
    ↓
Actualizan su estado
    ↓
Muestran notificación
```

---

## 📚 Más Información

- **Usuarios**: Lee `COMO_FUNCIONA_LA_SINCRONIZACION.md`
- **Desarrolladores**: Lee `SYNC_IMPLEMENTATION.md`
- **Resumen**: Lee `RESUMEN_SINCRONIZACION.md`

---

## ✨ Eso es Todo

La sincronización ya está funcionando. No hay configuración adicional necesaria.

**¿Preguntas?** Revisa la documentación detallada en los archivos mencionados arriba.
