# Instrucciones para Publicar en GitHub

Pasos finales para subir tu proyecto a GitHub de forma segura.

## Checklist Pre-Push

Antes de hacer `git push`, verifica:

### Seguridad
```bash
# 1. Buscar IDs reales (no deben estar)
grep -r "1B87avJ" .          # ERROR: Si encuentras esto, hay un problema
grep -r "1X4fepmi" .         # ERROR: Si encuentras esto, hay un problema

# 2. Buscar tokens/credenciales
grep -r "waba_" .            # ERROR: Tokens WhatsApp
grep -r "sk_" .              # ERROR: Claves privadas

# 3. Buscar archivos que no deben estar
ls -la | grep "\.env"        # ERROR: .env NO debe existir (solo .env.example)
ls -la | grep "service_account" # ERROR: service_account.json NO debe existir
```

### Documentación
```bash
# 4. Verificar archivos de documentación
ls -la | grep README.md      # OK: Debe existir
ls -la | grep SETUP.md       # OK: Debe existir
ls -la | grep QUICKSTART.md  # OK: Debe existir
ls -la | grep LICENSE        # OK: Debe existir
ls -la | grep .gitignore     # OK: Debe existir
```

---

## Paso 1: Crear Repositorio en GitHub

### Opción A: Desde GitHub (Recomendado)

1. Ve a [github.com](https://github.com)
2. Click en **"+"** → **"New repository"**
3. Nombre: `management-suite`
4. Descripción: `Suite completa de herramientas para gestión empresarial con Google Workspace`
5. **NO** inicialices con README (ya tienes uno)
6. **NO** añadas .gitignore (ya tienes uno)
7. Click en **"Create repository"**

### Opción B: Desde Git CLI

```bash
# Si aún no tienes git inicializado
git init
git add .
git commit -m "Initial commit: Management Suite sanitized for public release"
```

---

## Paso 2: Conectar Repo Local con GitHub

```bash
# Reemplaza USER y REPO con tus valores
git remote add origin https://github.com/USER/management-suite.git
git branch -M main
git push -u origin main
```

---

## Paso 3: Primera Publicación

### Ver estado actual
```bash
git status
```

### Agregar todos los archivos
```bash
git add .
```

### Verificar qué se va a subir
```bash
git status
# Debería verse como:
# - .gitignore
# - .env.example
# - README.md
# - SETUP.md
# - QUICKSTART.md
# - LICENSE
# - gs/*/README.md
# - gs/*/*.gs con IDs reemplazados
#
# NO debería verse:
# - .env
# - service_account.json
# - IDs reales
```

### Hacer commit
```bash
git commit -m "feat: Sanitize Management Suite for GitHub publication

- Replace all real Google Drive/Sheets IDs with placeholders
- Replace community names with generic references (Community_1-6)
- Add comprehensive documentation (README, SETUP, QUICKSTART)
- Add .env.example with all required variables
- Add proper .gitignore to protect sensitive files
- Add LICENSE (MIT)
- Document each module with technical specs

Ready for public release"
```

### Hacer push
```bash
git push -u origin main
```

---

## Paso 4: Configuración del Repositorio

Una vez publicado en GitHub, configura:

### 1. **Configurar repositorio**
- Ve a **Settings** → **General**
  - Descripción: `Suite completa de herramientas para gestión empresarial`
  - Website: (opcional, tu página de documentación)

### 2. **Agregar Topics** (Settings → Topics)
```
- google-apps-script
- python
- whatsapp-bot
- property-management
- google-workspace
- fastapi
- gcp
```

### 3. **Configurar README en Settings**
- Settings → Code and automation → Code security and analysis
- Habilitar "Dependabot alerts" (si hay)

### 4. **Branch Protection** (si es necesario)
- Settings → Branches → Add rule
- Branch name pattern: `main`
- Require pull request reviews

---

## Paso 5: Agregar Archivos Adicionales (Opcional)

### Crear CONTRIBUTING.md
```bash
cat > CONTRIBUTING.md << 'EOF'
# Contribuyendo al Proyecto

1. Fork el repositorio
2. Crea una rama: `git checkout -b feature/mi-mejora`
3. Haz cambios
4. Commit: `git commit -am "Add mi-mejora"`
5. Push: `git push origin feature/mi-mejora`
6. Abre Pull Request

## Reglas
- No commits con datos sensibles
- Documentar cambios significativos
- Seguir estilo de código existente
EOF
git add CONTRIBUTING.md
git commit -m "docs: add contributing guidelines"
git push
```

### Crear CODE_OF_CONDUCT.md
```bash
cat > CODE_OF_CONDUCT.md << 'EOF'
# Código de Conducta

Esperamos que todos los contribuidores sean respetuosos y constructivos.

## Comportamiento Esperado
- Ser respetuoso y profesional
- Aceptar crítica constructiva

## Comportamiento Inaceptable
- Lenguaje o conducta discriminatoria
- Acoso de cualquier tipo
EOF
git add CODE_OF_CONDUCT.md
git commit -m "docs: add code of conduct"
git push
```

---

## Paso 6: Crear Release

```bash
# Etiquetar versión
git tag -a v1.0.0 -m "Initial public release - Sanitized and documented"
git push origin v1.0.0
```

En GitHub:
1. Ve a **Releases**
2. Click **"Create a release"**
3. Tag: v1.0.0
4. Title: v1.0.0 - Initial Public Release
5. Description:
   ```markdown
   ## Features
   - 5 modulos principales (Agua Caliente, Contratos, Polizas, RRHH, WSPbot)
   - Documentacion completa
   - Guia de configuracion
   - Ejemplos de uso
   
   ## Security
   - Todos los IDs sensibles reemplazados
   - Archivo .env.example para configuracion
   - Proteccion con .gitignore
   
   ## Documentation
   - README.md completo
   - SETUP.md paso a paso
   - QUICKSTART.md referencia rapida
   - README.md por modulo
   
   Ver [SETUP.md](SETUP.md) para comenzar.
   ```

---

## Paso 7: Compartir y Promocionar

```bash
# Ejemplo de mensaje para redes
"""
Ahora en GitHub: Management Suite

Suite completa de herramientas para gestión empresarial integrada con Google Workspace.

Incluye:
- Sistema de medidores (PWA)
- Generador de contratos
- Gestión de pólizas
- Dashboard RRHH
- Bot de WhatsApp

Documentación completa incluida

Fácil de configurar con .env.example

github.com/tu-usuario/management-suite
"""
```

---

## Paso 8: Verificación Final en GitHub

Una vez publicado:

### 1. **Revisar Files**
```
En GitHub, ve a Code tab:
- .gitignore existe
- .env.example existe (NO .env)
- README.md es visible
- No hay IDs reales visibles
- No hay service_account.json
```

### 2. **Revisar Historial**
```bash
git log --oneline
# Último commit debe estar sin datos sensibles
```

### 3. **Probar Clone**
```bash
cd /tmp
git clone https://github.com/tu-usuario/management-suite.git
cd management-suite
ls -la
# Verificar:
# - .env.example existe
# - .env NO existe
# - .gitignore existe
# - service_account.json NO existe
```

---

## Troubleshooting

### Problema: "Pushes IDs accidentalmente"

#### Solución: Limpiar historial
```bash
# PELIGROSO - hacer ANTES de publicar
git filter-branch --force --index-filter \
  'git rm --cached -r --ignore-unmatch .env service_account.json' \
  --prune-empty --tag-name-filter cat -- --all

# O usar BFG Repo-Cleaner (mas seguro)
# Ver: https://rtyley.github.io/bfg-repo-cleaner/
```

### Problema: "Accidentalmente hice push de .env"

```bash
# 1. Eliminar del repositorio
git rm --cached .env
echo ".env" >> .gitignore
git add .gitignore
git commit -m "Remove .env from tracking"
git push

# 2. IMPORTANTE: Rotar TODAS las credenciales
#    Ya que estuvieron publicas
```

### Problema: "Mi archivo esta muy grande"

```bash
# Verificar tamaño de archivos
git ls-files -s | sort -k4 -n -r | head -20

# Si hay archivo muy grande (>100MB):
# Usar Git LFS o dividir el archivo
```

---

## Checklist Final ANTES de hacer Push

- [ ] No hay .env (solo .env.example)
- [ ] No hay service_account.json
- [ ] No hay IDs como 1B87avJ en codigo
- [ ] No hay tokens como waba_ en commits
- [ ] .gitignore esta configurado
- [ ] README.md existe y es descriptivo
- [ ] SETUP.md existe con instrucciones
- [ ] LICENSE esta presente
- [ ] Documentacion tecnica completa
- [ ] He probado git clone en otra carpeta
- [ ] He verificado que no hay datos personales
- [ ] He verificado nombres de propiedades reemplazados
- [ ] He probado que el codigo funciona con placeholders

---

## Listo!

Tu proyecto esta publicado en GitHub de forma segura.

### Proximos pasos:
1. Monitorea issues y feedback
2. Actualiza SETUP.md segun preguntas frecuentes
3. Crea sistema de CI/CD con GitHub Actions (opcional)
4. Agrega badges al README

```markdown
License: MIT
Python 3.9+
Google Apps Script
```

---

Exito publicando tu proyecto!
