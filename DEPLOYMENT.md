# Guía de Despliegue / Deployment Guide

Esta guía te ayudará a desplegar tu aplicación Wedding Table Planner para probarla en tu navegador.

## Opciones de Despliegue

### 🚀 Opción 1: GitHub Pages (Recomendado - Gratis)

Esta es la forma más sencilla para desplegar desde GitHub.

**✅ Configuración ya aplicada**: El proyecto ya está configurado correctamente para GitHub Pages con el `base` path en `vite.config.ts`, así que solo necesitas seguir los pasos de habilitación.

#### Pasos:

1. **Fusionar ramas a main:**
   - Ve a tu repositorio en GitHub: https://github.com/Alonsoromo/wedding-seating-plan
   - Si hay Pull Requests abiertos, fusiónalos a la rama `main`
   - O crea una rama `main` desde la rama actual si no existe

2. **Habilitar GitHub Pages:**
   - Ve a tu repositorio en GitHub
   - Click en **Settings** (Configuración)
   - En el menú lateral, click en **Pages**
   - En "Source", selecciona **GitHub Actions**
   - Guarda los cambios

3. **Desplegar:**
   - Una vez que fusiones los cambios a `main`, el workflow se ejecutará automáticamente
   - Ve a la pestaña **Actions** en tu repositorio para ver el progreso
   - Cuando termine (tarda ~2-3 minutos), tu sitio estará disponible en:
     ```
     https://alonsoromo.github.io/wedding-seating-plan/
     ```

### 🔷 Opción 2: Vercel (Muy rápido - Gratis)

1. Ve a [vercel.com](https://vercel.com) y crea una cuenta (puedes usar tu cuenta de GitHub)
2. Click en **"Add New Project"**
3. Importa tu repositorio `wedding-seating-plan`
4. Vercel detectará automáticamente la configuración (ya está incluida en `vercel.json`)
5. Click en **Deploy**
6. En ~2 minutos tendrás un link como: `https://wedding-seating-plan-xxx.vercel.app`

### 🌐 Opción 3: Netlify (También gratis)

1. Ve a [netlify.com](https://netlify.com) y crea una cuenta
2. Click en **"Add new site"** → **"Import an existing project"**
3. Conecta con GitHub y selecciona tu repositorio
4. Netlify detectará automáticamente la configuración (ya está incluida en `netlify.toml`)
5. Click en **Deploy**
6. Tendrás un link como: `https://wedding-seating-plan-xxx.netlify.app`

## 🧪 Probar Localmente

Si quieres probar la aplicación en tu computadora antes de desplegarla:

```bash
# 1. Clona el repositorio (si aún no lo has hecho)
git clone https://github.com/Alonsoromo/wedding-seating-plan.git
cd wedding-seating-plan

# 2. Instala las dependencias
npm install

# 3. Inicia el servidor de desarrollo
npm run dev

# 4. Abre tu navegador en http://localhost:5173
```

## 📝 Notas Importantes

- **GitHub Pages**: El link será `https://alonsoromo.github.io/wedding-seating-plan/`
- **Vercel/Netlify**: Obtendrás un dominio automático, y puedes agregar tu propio dominio personalizado si quieres
- Todas estas opciones son **gratuitas** para proyectos personales
- Los despliegues son automáticos: cada vez que hagas push a `main`, se actualizará el sitio

## 🔧 Solución de Problemas

Si el despliegue falla:
1. Verifica que todas las dependencias estén en `package.json`
2. Asegúrate de que `npm run build` funcione localmente
3. Revisa los logs en la pestaña "Actions" (GitHub Pages) o el dashboard de Vercel/Netlify

### Problema: La aplicación despliega pero muestra página en blanco

**Causa**: Los assets (JavaScript y CSS) no se cargan correctamente porque las rutas no están configuradas para el subdirectorio de GitHub Pages.

**Solución aplicada**: 
- El archivo `vite.config.ts` está configurado con `base: '/wedding-seating-plan/'` para que los assets se generen con la ruta correcta
- Esto permite que la aplicación funcione en `https://alonsoromo.github.io/wedding-seating-plan/`

**Verificación**:
1. Después de hacer build con `npm run build`, verifica que en `dist/index.html` los assets tengan rutas como `/wedding-seating-plan/assets/...` y no solo `/assets/...`
2. Si ves errores 404 en la consola del navegador para los archivos JS/CSS, verifica que el `base` esté configurado correctamente en `vite.config.ts`

## 🎉 ¡Listo!

Una vez desplegado, podrás compartir el link con cualquier persona para probar tu planificador de mesas de boda.
