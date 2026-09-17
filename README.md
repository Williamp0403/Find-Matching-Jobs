# 💼 Find Matching Jobs - Sistema Inteligente de Matching Laboral

> Plataforma Full-Stack para conectar perfiles de estudiantes y profesionales con ofertas laborales de la industria de TI mediante un **algoritmo de recomendación y matching por compatibilidad técnica**.

[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![NestJS](https://img.shields.io/badge/NestJS-11-red?style=flat-square&logo=nestjs)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Neon_DB-336791?style=flat-square&logo=postgresql)](https://neon.tech/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0-06B6D4?style=flat-square&logo=tailwindcss)](https://tailwindcss.com/)
[![Vercel](https://img.shields.io/badge/Vercel-Deployed-000000?style=flat-square&logo=vercel)](https://vercel.com/)

---

## 🚀 Demostración en Vivo

- 🌐 **Aplicación Web**: [find-matching-jobs-frontend-delta.vercel.app](https://find-matching-jobs-frontend-delta.vercel.app)

---

## 📖 Tabla de Contenidos

1. [Descripción General](#-descripción-general)
2. [Características Principales](#-características-principales)
3. [Arquitectura del Monorepo](#-arquitectura-del-monorepo)
4. [Tech Stack](#-tech-stack)
5. [Modelo de Datos](#-modelo-de-datos)
6. [Instalación y Configuración Local](#-instalación-y-configuración-local)
7. [Variables de Entorno](#-variables-de-entorno)

---

## 🧐 Descripción General

**Find Matching Jobs** es una aplicación Full-Stack desarrollada en una arquitectura de **Monorepo en TypeScript** (`pnpm workspaces`). Su objetivo es simplificar la búsqueda de empleo para desarrolladores y estudiantes de tecnología al emparejar sus habilidades reales con vacantes del mercado laboral.

El sistema consume vacantes en tiempo real a través de **JSearch API** (RapidAPI) y las evalúa contra el perfil del usuario mediante un **algoritmo de compatibilidad técnica** (*Match Score 0-100%*), identificando brechas de conocimiento (*missing skills*) y generando justificaciones detalladas para cada recomendación.

---

## ✨ Características Principales

- 🔐 **Autenticación Segura**: Registro e inicio de sesión con encriptación `bcrypt`, tokens JWT y protección Rate Limiting (`Throttler`).
- 👤 **Perfil Técnico Personalizado**: Configuración de habilidades (Frontend, Backend, DB, DevOps), niveles de experiencia (Básico, Intermedio, Avanzado) y modalidades preferidas.
- 🤖 **Algoritmo de Matching Ponderado**: Comparación entre requerimientos de vacantes y perfil del usuario para calcular compatibilidad técnica y sugerir tecnologías por aprender.
- 🔄 **Sincronización Automatizada**: Tarea programada mediante Vercel Cron Jobs para renovar la base de datos con vacantes de TI de los últimos 30 días.
- 📊 **Panel Administrativo**: Métricas del sistema y control global de usuarios y vacantes.
- 📘 **API REST Documentada**: Endpoints documentados dinámicamente con Swagger / OpenAPI.

---

## 🏗️ Arquitectura del Monorepo

```
find-matching-jobs/
├── apps/
│   ├── backend/               # API REST con NestJS, TypeORM, PostgreSQL y Swagger
│   └── frontend/              # App Web en Next.js 16 (App Router), Tailwind CSS y Zustand
└── packages/
    └── types/                 # Paquete TypeScript compartido (DTOs e Interfaces)
```

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript, Tailwind CSS v4, Zustand, React Hook Form, Lucide Icons.
- **Backend**: NestJS 11, TypeScript, TypeORM, PostgreSQL (Neon DB), Passport JWT, Bcrypt, Helmet, Throttler, Swagger.
- **Infraestructura**: Vercel (Frontend & Serverless Functions), RapidAPI (JSearch), PNPM Workspaces.

---

## 📊 Modelo de Datos (PostgreSQL)

| Tabla | Descripción |
|---|---|
| **Users** | Usuarios del sistema (`id`, `nombre`, `apellido`, `email`, `password`, `rol`) |
| **Profiles** | Perfil técnico (`id`, `user_id`, `resumen`, `semestre`, `modalidad_preferida`, `github_url`, `linkedin_url`) |
| **Skills** | Catálogo de tecnologías (`id`, `nombre`, `categoria`) |
| **Student_Skills** | Relación Usuario-Habilidad (`student_id`, `skill_id`, `nivel`) |
| **Jobs** | Vacantes sincronizadas (`id`, `external_id`, `titulo`, `empresa`, `descripcion`, `ubicacion`, `url_postulacion`) |
| **Match_Results** | Resultados de análisis (`id`, `student_id`, `job_id`, `score`, `justificacion_ia`, `missing_skills`) |

---

## 💻 Instalación y Configuración Local

### 1. Clonar el repositorio e instalar dependencias
```bash
git clone https://github.com/Williamp0403/Find-Matching-Jobs.git
cd Find-Matching-Jobs
pnpm install
```

### 2. Compilar paquete de tipos compartidos
```bash
pnpm --filter @find-matching-jobs/types build
```

### 3. Migraciones e Inicio en Desarrollo
```bash
# Migraciones de base de datos
cd apps/backend
pnpm run db:create
pnpm run migration:run

# Iniciar proyectos en desarrollo
cd ../..
pnpm --filter backend start:dev & pnpm --filter frontend dev
```

- **Frontend**: `http://localhost:3001`
- **Backend API**: `http://localhost:3000`

---

## 🔑 Variables de Entorno

### Backend (`apps/backend/.env`)
```env
PORT=3000
DATABASE_URL=postgresql://usuario:password@host:5432/dbname?sslmode=require
JWT_SECRET=tu_secreto_super_seguro
JSEARCH_API_KEY=tu_api_key_de_rapidapi
FRONTEND_URL=http://localhost:3001
CRON_SECRET=tu_clave_secreta_para_cron
```

### Frontend (`apps/frontend/.env.local`)
```env
NEXT_PUBLIC_API_URL=http://localhost:3000
```
