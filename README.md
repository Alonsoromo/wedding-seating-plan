# 💒 Wedding Table Planner

Una aplicación visual e intuitiva para organizar invitados en mesas de 10 personas para bodas de manera práctica y sencilla.

## 🚀 Despliegue y Prueba

Para probar esta aplicación en tu navegador, consulta la [Guía de Despliegue](./DEPLOYMENT.md) que incluye instrucciones para:

- **GitHub Pages** (Recomendado - Gratis) → https://alonsoromo.github.io/wedding-seating-plan/
- **Vercel** (Despliegue rápido) → Conecta tu repositorio en vercel.com
- **Netlify** (Alternativa) → Conecta tu repositorio en netlify.com

## ✨ Características

- 📝 Gestión de invitados (agregar, editar, eliminar)
- 🪑 Creación automática de mesas para 10 personas
- 🎯 Asignación visual mediante drag & drop
- 👁️ Vista general del layout del salón
- 💾 **Guardado automático** - Los datos persisten al refrescar la página
- 🔄 **Sincronización en tiempo real** - Colabora con múltiples usuarios simultáneamente
- 🔔 Notificaciones cuando otros usuarios hacen cambios

> **¡Nuevo!** Lee la [Guía de Sincronización](./QUICK_START.md) para aprender cómo colaborar en tiempo real.

## 🛠️ Desarrollo Local

```bash
# Instalar dependencias
npm install

# Iniciar servidor de desarrollo
npm run dev

# Construir para producción
npm run build

# Preview de la build
npm run preview
```

## 📁 Estructura del Proyecto

- `/src` - Código fuente de la aplicación React
  - `/hooks/use-synced-kv.ts` - Hook de sincronización en tiempo real
- `/dist` - Build de producción (generado)
- `PRD.md` - Documento de requisitos del producto
- `DEPLOYMENT.md` - Guía completa de despliegue

## 📚 Documentación de Sincronización

- **[QUICK_START.md](./QUICK_START.md)** - Guía rápida de inicio (⚡ lee esto primero)
- **[RESUMEN_SINCRONIZACION.md](./RESUMEN_SINCRONIZACION.md)** - Resumen ejecutivo
- **[COMO_FUNCIONA_LA_SINCRONIZACION.md](./COMO_FUNCIONA_LA_SINCRONIZACION.md)** - Guía completa en español
- **[SYNC_IMPLEMENTATION.md](./SYNC_IMPLEMENTATION.md)** - Documentación técnica

## 📄 Licencia

The Spark Template files and resources from GitHub are licensed under the terms of the MIT license, Copyright GitHub, Inc.
